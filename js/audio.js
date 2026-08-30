/*
 * audio.js — chiptune blips synthesised on the fly, over music from files.
 *
 * The effects are square/triangle waves from an AudioContext, so most of the
 * game is still a handful of text files. The music underneath them is the
 * exception: three tracks in music/, played through <audio>. Browsers will not
 * let either start before a gesture, so the context is created lazily on first
 * play and a refused track waits for the first tap.
 */
(function (global) {
  'use strict';

  var ctx = null;
  var enabled = true;

  function ac() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Browsers create the context suspended until a gesture. Unlock on the
     first tap so a click's blip is not scheduled against a dead clock. */
  function unlock() {
    if (!enabled) return;
    var c = ac();
    if (c && c.state === 'suspended') c.resume();
  }

  /* One note. freq in Hz, dur in seconds, start offset in seconds. */
  function note(freq, dur, when, type, vol) {
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    /* Percussive envelope — snappy attack, quick decay. Sounds like a GBC. */
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function seq(notes, type, vol) {
    var t = 0;
    notes.forEach(function (n) {
      note(n[0], n[1], t, type, vol);
      t += n[1] * 0.85;
    });
  }

  var SFX = {
    blip:    function () { note(880, 0.05, 0, 'square', 0.05); },
    select:  function () { seq([[660, 0.05], [990, 0.08]]); },
    back:    function () { seq([[520, 0.05], [340, 0.08]]); },
    good:    function () { seq([[784, 0.07], [988, 0.07], [1319, 0.16]], 'square', 0.07); },
    bad:     function () { seq([[220, 0.1], [175, 0.18]], 'sawtooth', 0.06); },
    appear:  function () { seq([[196, 0.08], [262, 0.08], [196, 0.08], [262, 0.16]], 'square', 0.06); },
    fanfare: function () {
      seq([[523, 0.11], [523, 0.11], [523, 0.11], [523, 0.22], [415, 0.22], [466, 0.22], [523, 0.16], [466, 0.08], [523, 0.44]], 'square', 0.07);
    },
    gameover: function () {
      seq([[392, 0.16], [370, 0.16], [349, 0.16], [330, 0.5]], 'sawtooth', 0.06);
    }
  };

  /* ----------------------------------------------------------------- music */
  /*
   * The one part of the sound that is not synthesised: the title bed and a
   * sting, loaded from music/. They go through <audio> rather than the
   * AudioContext so the game still works opened straight off the disk —
   * decodeAudioData needs a fetch, and a file:// page is not allowed one.
   *
   * Same autoplay rule as the blips: a browser refuses to start a track before
   * the player has touched the page, so a refused one is parked and retried on
   * the first gesture rather than lost.
   */

  var TRACKS = {
    title: { src: 'music/music-title.wav', vol: 0.34 }
  };

  /* One-shots that are files rather than oscillators. play() routes to these
     by name, so callers say Sound.play('wrong') like any other effect. */
  var STINGS = {
    wrong:  { src: 'music/wrong.mp3',   vol: 0.65, duck: 3400 },
    coin:   { src: 'music/win.mp3',     vol: 0.72, duck: 1800 },
    caught: { src: 'music/caught.m4a',  vol: 0.70, duck: 3300 }
  };

  var FADE = 500;
  var players = {};
  var stings = {};
  var desired = null;   /* the bed the game has asked for, playing or not */
  var armed = false;

  function media(cache, name, def, loop) {
    var el = cache[name];
    if (!el) {
      el = new Audio(def.src);
      el.loop = !!loop;
      el.preload = 'auto';
      el.volume = 0;
      cache[name] = el;
    }
    return el;
  }

  /* A volume ramp on a timer. Media elements have no envelope of their own,
     and a hard cut between two beds is the one thing that sounds broken. */
  function fade(el, to, ms, then) {
    clearInterval(el.fadeTimer);
    var from = el.volume;
    var steps = Math.max(1, Math.round(ms / 40));
    var i = 0;
    el.fadeTimer = setInterval(function () {
      i++;
      el.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
      if (i < steps) return;
      clearInterval(el.fadeTimer);
      el.fadeTimer = null;
      if (then) then();
    }, 40);
  }

  function armGesture() {
    armed = true;
  }

  function onGesture() {
    unlock();
    if (!armed) return;
    armed = false;
    apply();
  }
  global.addEventListener('pointerdown', onGesture, true);
  global.addEventListener('keydown', onGesture, true);

  /* Make what is playing match what was asked for. Idempotent: the renderer
     calls music() on every redraw, and most redraws change nothing. */
  function apply() {
    Object.keys(players).forEach(function (name) {
      if (name === desired && enabled) return;
      var other = players[name];
      /* Paused, not rewound — coming back from the title lands you where the
         bed left off instead of two minutes earlier. */
      if (!other.paused) fade(other, 0, FADE, function () { other.pause(); });
    });

    if (!enabled || !desired) return;
    var el = media(players, desired, TRACKS[desired], true);
    if (el.paused) {
      var p = el.play();
      if (p && p.catch) p.catch(armGesture);
    }
    fade(el, TRACKS[desired].vol, FADE);
  }

  /* Drop the bed under a sting so the sting is actually audible, then bring
     it back up once the sting has had its say. */
  var duckTimer = null;
  function duck(ms) {
    var el = desired && players[desired];
    if (!el || el.paused) return;
    var full = TRACKS[desired].vol;
    fade(el, full * 0.22, 140);
    clearTimeout(duckTimer);
    duckTimer = setTimeout(function () {
      if (players[desired] === el && !el.paused) fade(el, full, 700);
    }, ms);
  }

  function sting(name) {
    var def = STINGS[name];
    var el = media(stings, name, def, false);
    el.volume = def.vol;
    try { el.currentTime = 0; } catch (e) { /* not seekable until it loads */ }
    var p = el.play();
    if (p && p.catch) p.catch(function () { /* no gesture yet; nothing to fix */ });
    duck(def.duck);
  }

  /* Ask for a bed by name, or null for silence. */
  function music(name) {
    if (name && !TRACKS[name]) return;
    desired = name || null;
    apply();
  }

  /* Menu taps share one click. A handler that also plays blip/select/back
     in the same gesture would otherwise layer two UI notes. Outcome jingles
     (good, wrong, caught) are not in this set and still play on top. */
  var UI_CLICK = { blip: 1, select: 1, back: 1 };
  var lastUiClick = 0;

  function play(name) {
    if (!enabled) return;
    if (UI_CLICK[name]) {
      var now = Date.now();
      if (now - lastUiClick < 50) return;
      lastUiClick = now;
    }
    if (STINGS[name]) { try { sting(name); } catch (e) { /* never worth crashing over */ } return; }
    var fn = SFX[name];
    if (!fn) return;
    function run() { try { fn(); } catch (e) { /* audio is never worth crashing over */ } }
    var c = ac();
    if (c && c.state === 'suspended') {
      var p = c.resume();
      if (p && p.then) { p.then(run).catch(function () {}); return; }
    }
    run();
  }

  global.Sound = {
    play: play,
    music: music,
    isEnabled: function () { return enabled; },
    setEnabled: function (v) {
      enabled = !!v;
      if (!enabled) Object.keys(stings).forEach(function (k) { stings[k].pause(); });
      apply();
    }
  };
})(window);
