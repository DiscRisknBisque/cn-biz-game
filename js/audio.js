/*
 * audio.js — chiptune blips synthesised on the fly, plus one sampled sting.
 *
 * Almost everything here is square/triangle waves from an AudioContext, which
 * is what keeps the game a handful of text files. The one exception is the sad
 * trombone: a real recording, because a synthesised approximation of that
 * particular joke is never as funny as the joke itself.
 *
 * The sample is optional at runtime. Opening index.html straight off the disk
 * makes fetch() fail on the file:// origin, so anything sampled falls back to
 * a synthesised sting rather than going silent.
 *
 * Browsers will not let audio start before a gesture, so the context is created
 * lazily and samples are fetched on the first interaction.
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
    hurt:    function () { seq([[300, 0.05], [200, 0.05], [140, 0.12]], 'square', 0.06); },
    caught:  function () { seq([[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.24]], 'square', 0.07); },
    appear:  function () { seq([[196, 0.08], [262, 0.08], [196, 0.08], [262, 0.16]], 'square', 0.06); },
    fanfare: function () {
      seq([[523, 0.11], [523, 0.11], [523, 0.11], [523, 0.22], [415, 0.22], [466, 0.22], [523, 0.16], [466, 0.08], [523, 0.44]], 'square', 0.07);
    },
    gameover: function () {
      seq([[392, 0.16], [370, 0.16], [349, 0.16], [330, 0.5]], 'sawtooth', 0.06);
    }
  };

  /* ------------------------------------------------------------- samples */

  var SAMPLES = {
    /* Peaks at 0.275 in the file, so it needs lifting to sit with the blips. */
    fail: { url: 'audio/sad-trombone.mp3', gain: 2.4, seconds: 2.4 }
  };

  function loadSample(name) {
    var s = SAMPLES[name];
    if (!s || s.buffer || s.pending || s.failed) return;
    var c = ac();
    if (!c) return;
    s.pending = true;
    fetch(s.url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.arrayBuffer();
      })
      .then(function (buf) { return c.decodeAudioData(buf); })
      .then(function (audio) { s.buffer = audio; s.pending = false; })
      .catch(function () {
        /* file:// origin, offline, or a missing asset — use the synth instead. */
        s.failed = true;
        s.pending = false;
      });
  }

  function preload() {
    Object.keys(SAMPLES).forEach(loadSample);
  }

  function playSample(name) {
    var s = SAMPLES[name];
    var c = ac();
    if (!s || !s.buffer || !c) return false;
    var src = c.createBufferSource();
    var g = c.createGain();
    src.buffer = s.buffer;
    g.gain.value = s.gain;
    src.connect(g).connect(c.destination);
    src.start();
    return true;
  }

  /* Fetching needs no gesture, but decoding wants a context, and creating one
     before an interaction is what browsers object to. */
  function onFirstGesture() {
    document.removeEventListener('pointerdown', onFirstGesture, true);
    document.removeEventListener('keydown', onFirstGesture, true);
    if (enabled) preload();
  }
  document.addEventListener('pointerdown', onFirstGesture, true);
  document.addEventListener('keydown', onFirstGesture, true);

  /* ------------------------------------------------------------------ api */

  function play(name) {
    if (!enabled) return;

    if (SAMPLES[name]) {
      loadSample(name);
      if (playSample(name)) {
        /* Pull the music down under the sting so the punchline lands. */
        if (global.Music && global.Music.duck) global.Music.duck(SAMPLES[name].seconds);
        return;
      }
      name = 'gameover';                       // the synthesised stand-in
    }

    var fn = SFX[name];
    if (fn) { try { fn(); } catch (e) { /* audio is never worth crashing over */ } }
  }

  global.Sound = {
    /* Shared so the music engine schedules on the same clock rather than
       opening a second context. */
    context: ac,
    play: play,
    preload: preload,
    /* Exposed so tests can tell a real sample apart from the fallback. */
    sampleReady: function (name) { return !!(SAMPLES[name] && SAMPLES[name].buffer); },
    isEnabled: function () { return enabled; },
    setEnabled: function (v) { enabled = !!v; if (enabled) { ac(); preload(); } }
  };
})(window);
