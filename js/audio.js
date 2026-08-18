/*
 * audio.js — chiptune blips synthesised on the fly.
 *
 * No sound files: everything is square/triangle waves from an AudioContext,
 * which keeps the game a handful of text files. Browsers will not let audio
 * start before a gesture, so the context is created lazily on first play.
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

  function play(name) {
    if (!enabled) return;
    var fn = SFX[name];
    if (fn) { try { fn(); } catch (e) { /* audio is never worth crashing over */ } }
  }

  global.Sound = {
    /* Shared so the music engine schedules on the same clock rather than
       opening a second context. */
    context: ac,
    play: play,
    isEnabled: function () { return enabled; },
    setEnabled: function (v) { enabled = !!v; if (enabled) ac(); }
  };
})(window);
