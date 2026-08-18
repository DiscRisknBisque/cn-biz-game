/*
 * music.js — the soundtrack, synthesised rather than shipped.
 *
 * Same principle as the sprites: no asset files. Five looping chiptune tracks
 * written as tracker-style strings and played back through a lookahead
 * scheduler, so the timing rides the audio clock instead of setInterval drift.
 *
 * Notation, one token per sixteenth note:
 *   C5      strike this note
 *   .       hold the previous note for another step
 *   -       silence
 *   |       bar line, ignored — purely so the score is readable here
 *
 * Percussion channels use K (kick), S (snare) and h (hat) instead of notes.
 *
 * Most melodies sit in a major pentatonic. It suits the pixel-cute register,
 * it carries a hint of the setting without tipping into pastiche, and it is
 * very hard to write something sour in it.
 */
(function (global) {
  'use strict';

  var Sound = global.Sound;

  /* ------------------------------------------------------------------ notes */

  var SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var NOTE_RE = /^([A-G])(#|b)?(-?\d)$/;

  function freqOf(name) {
    var m = NOTE_RE.exec(name);
    if (!m) return null;
    var semi = SEMITONE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    var midi = (parseInt(m[3], 10) + 1) * 12 + semi;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /* Resolve a score string into one event per step, with sustains folded into
     the length of the note that started them. Done once, at load. */
  function parseMelody(score) {
    var tokens = score.replace(/\|/g, ' ').trim().split(/\s+/);
    var events = new Array(tokens.length);
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t === '.' || t === '-') { events[i] = null; continue; }
      var f = freqOf(t);
      if (f == null) { events[i] = null; continue; }
      var len = 1;
      while (i + len < tokens.length && tokens[i + len] === '.') len++;
      events[i] = { freq: f, len: len };
    }
    return events;
  }

  function parseDrums(score) {
    var tokens = score.replace(/\|/g, ' ').trim().split(/\s+/);
    return tokens.map(function (t) {
      return (t === 'K' || t === 'S' || t === 'h') ? t : null;
    });
  }

  /* ----------------------------------------------------------------- tracks */

  var TRACKS = {

    /* 主题曲 — the title theme. C major pentatonic over I–vi–IV–V. */
    title: {
      bpm: 132,
      channels: [
        { wave: 'square', vol: 0.055, detune: 0, melody:
          'C5 .  E5 .  G5 .  A5 .  G5 .  E5 .  D5 .  .  . |' +
          'A4 .  C5 .  E5 .  G5 .  E5 .  C5 .  A4 .  .  . |' +
          'F4 .  A4 .  C5 .  D5 .  C5 .  A4 .  G4 .  .  . |' +
          'G4 .  B4 .  D5 .  G5 .  D5 .  B4 .  G4 .  .  . ' },
        { wave: 'triangle', vol: 0.10, melody:
          'C3 .  .  .  G3 .  .  .  C3 .  .  .  G3 .  .  . |' +
          'A2 .  .  .  E3 .  .  .  A2 .  .  .  E3 .  .  . |' +
          'F2 .  .  .  C3 .  .  .  F2 .  .  .  C3 .  .  . |' +
          'G2 .  .  .  D3 .  .  .  G2 .  .  .  B2 .  .  . ' },
        { wave: 'square', vol: 0.022, melody:
          'E4 .  G4 .  C5 .  G4 .  E4 .  G4 .  C5 .  G4 . |' +
          'C4 .  E4 .  A4 .  E4 .  C4 .  E4 .  A4 .  E4 . |' +
          'A3 .  C4 .  F4 .  C4 .  A3 .  C4 .  F4 .  C4 . |' +
          'B3 .  D4 .  G4 .  D4 .  B3 .  D4 .  G4 .  D4 . ' },
        { drums: true, vol: 0.05, melody:
          'K -  -  -  S -  -  h  K -  -  -  S -  -  - |' +
          'K -  -  -  S -  -  h  K -  -  -  S -  -  - |' +
          'K -  -  -  S -  -  h  K -  -  -  S -  -  - |' +
          'K -  -  -  S -  -  h  K -  h  -  S -  h  h ' }
      ]
    },

    /* 地图 — walking-around music. Slower, no drums, room to think. */
    map: {
      bpm: 108,
      channels: [
        { wave: 'square', vol: 0.045, melody:
          'E5 .  .  .  D5 .  .  .  C5 .  .  .  .  .  .  . |' +
          'C5 .  .  .  A4 .  .  .  G4 .  .  .  .  .  .  . |' +
          'F4 .  .  .  A4 .  .  .  C5 .  .  .  D5 .  .  . |' +
          'E5 .  .  .  C5 .  .  .  G4 .  .  .  .  .  .  . ' },
        { wave: 'triangle', vol: 0.09, melody:
          'C3 .  .  .  .  .  .  .  G2 .  .  .  .  .  .  . |' +
          'A2 .  .  .  .  .  .  .  E2 .  .  .  .  .  .  . |' +
          'F2 .  .  .  .  .  .  .  C3 .  .  .  .  .  .  . |' +
          'G2 .  .  .  .  .  .  .  G2 .  .  .  .  .  .  . ' },
        { wave: 'square', vol: 0.020, melody:
          'E4 .  .  .  G4 .  .  .  C5 .  .  .  G4 .  .  . |' +
          'C4 .  .  .  E4 .  .  .  A4 .  .  .  E4 .  .  . |' +
          'A3 .  .  .  C4 .  .  .  F4 .  .  .  C4 .  .  . |' +
          'B3 .  .  .  D4 .  .  .  G4 .  .  .  D4 .  .  . ' }
      ]
    },

    /* 答题 — deliberately has no lead line. Players are reading legal text
       here, and a melody competing for attention would be worse than silence. */
    scene: {
      bpm: 92,
      channels: [
        { wave: 'triangle', vol: 0.075, melody:
          'A2 .  .  .  .  .  .  .  .  .  .  .  .  .  .  . |' +
          'F2 .  .  .  .  .  .  .  G2 .  .  .  .  .  .  . ' },
        { wave: 'square', vol: 0.018, melody:
          'A3 .  E4 .  A3 .  C4 .  A3 .  E4 .  A3 .  C4 . |' +
          'F3 .  C4 .  F3 .  A3 .  G3 .  D4 .  G3 .  B3 . ' }
      ]
    },

    /* 年终大考 — A minor, driving eighths, the one that means trouble. */
    boss: {
      bpm: 150,
      channels: [
        { wave: 'square', vol: 0.055, melody:
          'A4 .  .  A4 .  C5 .  .  B4 .  .  B4 .  D5 .  . |' +
          'C5 .  .  C5 .  E5 .  .  D5 .  .  D5 .  F5 .  . |' +
          'E5 .  D5 .  C5 .  B4 .  A4 .  .  .  .  .  .  . |' +
          'E4 .  G4 .  A4 .  C5 .  E5 .  .  .  .  .  .  . ' },
        { wave: 'triangle', vol: 0.085, melody:
          'A2 .  A2 .  A2 .  A2 .  A2 .  A2 .  A2 .  A2 . |' +
          'F2 .  F2 .  F2 .  F2 .  G2 .  G2 .  G2 .  G2 . |' +
          'A2 .  A2 .  A2 .  A2 .  E2 .  E2 .  E2 .  E2 . |' +
          'A2 .  A2 .  A2 .  A2 .  E2 .  E2 .  G2 .  G2 . ' },
        { wave: 'square', vol: 0.020, melody:
          'A3 .  E4 .  A3 .  E4 .  A3 .  E4 .  A3 .  E4 . |' +
          'F3 .  C4 .  F3 .  C4 .  G3 .  D4 .  G3 .  D4 . |' +
          'A3 .  E4 .  A3 .  E4 .  E3 .  B3 .  E3 .  B3 . |' +
          'A3 .  E4 .  A3 .  E4 .  E3 .  B3 .  G3 .  D4 . ' },
        { drums: true, vol: 0.030, melody:
          'K -  h -  S -  h -  K -  h -  S -  h - |' +
          'K -  h -  S -  h -  K -  h -  S -  h - |' +
          'K -  h -  S -  h -  K -  h -  S -  h - |' +
          'K -  h -  S -  h -  K -  h h  S h  h h ' }
      ]
    },

    /* 结算 — warm and resolving, for reading your result over. */
    result: {
      bpm: 100,
      channels: [
        { wave: 'square', vol: 0.045, melody:
          'C5 .  .  .  E5 .  .  .  G5 .  .  .  .  .  .  . |' +
          'F5 .  .  .  E5 .  .  .  C5 .  .  .  .  .  .  . ' },
        { wave: 'triangle', vol: 0.09, melody:
          'C3 .  .  .  .  .  .  .  F2 .  .  .  .  .  .  . |' +
          'G2 .  .  .  .  .  .  .  C3 .  .  .  .  .  .  . ' },
        { wave: 'square', vol: 0.020, melody:
          'E4 .  G4 .  C5 .  G4 .  A3 .  C4 .  F4 .  C4 . |' +
          'B3 .  D4 .  G4 .  D4 .  E4 .  G4 .  C5 .  G4 . ' }
      ]
    }
  };

  /* Compile the scores once. */
  Object.keys(TRACKS).forEach(function (name) {
    var t = TRACKS[name];
    t.channels.forEach(function (ch) {
      ch.events = ch.drums ? parseDrums(ch.melody) : parseMelody(ch.melody);
    });
    t.steps = Math.max.apply(null, t.channels.map(function (ch) { return ch.events.length; }));
  });

  /* ------------------------------------------------------------- playback */

  var LOOKAHEAD_S = 0.12;    // how far ahead notes are scheduled
  var TICK_MS = 25;          // how often the scheduler wakes up

  var enabled = true;
  var master = null;
  var noiseBuf = null;

  var current = null;        // name of the track that should be sounding
  var wanted = null;         // requested before audio was allowed to start
  var stepIdx = 0;
  var nextStepTime = 0;
  var timer = null;

  function ctx() { return Sound.context(); }

  /* Gain into a gentle limiter. Chiptune parts stack up unpredictably — four
     channels landing on the same step can peak several times higher than any
     one of them — so the compressor is what stops a future score from
     clipping, rather than hand-tuning every channel's level. */
  function makeBus(c) {
    var gain = c.createGain();
    var comp = c.createDynamicsCompressor();
    gain.gain.value = 0.9;
    comp.threshold.value = -14;
    comp.knee.value = 6;
    comp.ratio.value = 8;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;
    gain.connect(comp).connect(c.destination);
    return gain;
  }

  function bus() {
    var c = ctx();
    if (!c) return null;
    if (!master) master = makeBus(c);
    return master;
  }

  /* Buffers belong to the context that made them, so an offline render needs
     its own rather than the live one's. */
  function noiseFor(c) {
    if (c === ctx() && noiseBuf) return noiseBuf;
    var buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.4), c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (c === ctx()) noiseBuf = buf;
    return buf;
  }

  function stepDuration(track) {
    /* One token is a sixteenth note. */
    return 60 / track.bpm / 4;
  }

  function playNote(c, out, ch, ev, when, dur) {
    if (!c || !out) return;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = ch.wave;
    osc.frequency.setValueAtTime(ev.freq, when);

    /* Leave a little gap at the end of every note so repeated pitches are
       audibly separate rather than one long tone. */
    var hold = Math.max(0.03, dur * 0.9);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(ch.vol, when + 0.012);
    g.gain.setValueAtTime(ch.vol, when + hold * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, when + hold);

    osc.connect(g).connect(out);
    osc.start(when);
    osc.stop(when + hold + 0.02);
  }

  function playDrum(c, out, ch, kind, when) {
    if (!c || !out) return;

    if (kind === 'K') {
      /* Kick: a fast downward pitch sweep reads as a thump. */
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, when);
      osc.frequency.exponentialRampToValueAtTime(45, when + 0.09);
      /* The sweep sits at 45-150Hz where sample amplitude runs high, so the
         kick needs less gain than its loudness suggests to stay off the ceiling. */
      g.gain.setValueAtTime(ch.vol * 2.1, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.11);
      osc.connect(g).connect(out);
      osc.start(when);
      osc.stop(when + 0.13);
      return;
    }

    var src = c.createBufferSource();
    var gain = c.createGain();
    var filt = c.createBiquadFilter();
    src.buffer = noiseFor(c);
    filt.type = 'highpass';
    filt.frequency.value = kind === 'S' ? 1200 : 6000;
    var len = kind === 'S' ? 0.10 : 0.035;
    gain.gain.setValueAtTime(ch.vol * (kind === 'S' ? 1.5 : 0.7), when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + len);
    src.connect(filt).connect(gain).connect(out);
    src.start(when);
    src.stop(when + len + 0.02);
  }

  function scheduler() {
    var c = ctx();
    var track = TRACKS[current];
    if (!c || !track) return;
    var dur = stepDuration(track);

    while (nextStepTime < c.currentTime + LOOKAHEAD_S) {
      var out = bus();
      track.channels.forEach(function (ch) {
        var ev = ch.events[stepIdx % ch.events.length];
        if (!ev) return;
        if (ch.drums) playDrum(c, out, ch, ev, nextStepTime);
        else playNote(c, out, ch, ev, nextStepTime, ev.len * dur);
      });
      nextStepTime += dur;
      stepIdx = (stepIdx + 1) % track.steps;
    }
  }

  function startLoop() {
    var c = ctx();
    if (!c || timer) return;
    stepIdx = 0;
    nextStepTime = c.currentTime + 0.06;
    scheduler();
    timer = setInterval(scheduler, TICK_MS);
  }

  function stopLoop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* Browsers will not let audio start before a gesture, so the first requested
     track is held until one arrives. */
  var unlocked = false;
  function unlock() {
    if (unlocked) return;
    var c = ctx();
    if (!c) return;
    unlocked = true;
    document.removeEventListener('pointerdown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
    if (wanted) { var w = wanted; wanted = null; play(w); }
  }
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);

  function play(name) {
    if (!TRACKS[name]) return;
    if (current === name && timer) return;      // already running — do not restart

    /* `current` is what *should* be sounding, which is not the same as what is
       audible: it is set even while muted or still waiting for the gesture that
       lets audio start, so callers can ask what the game thinks it is playing. */
    current = name;
    if (!enabled) { stopLoop(); return; }
    if (!unlocked) { wanted = name; return; }
    stopLoop();
    try { startLoop(); } catch (e) { /* music is never worth crashing over */ }
  }

  function stop() {
    stopLoop();
  }

  /* Briefly pull the music down so a sting can be heard over it, then bring it
     back. Used by the fail sound; harmless if nothing is playing. */
  function duck(seconds) {
    var c = ctx();
    if (!c || !master) return;
    var now = c.currentTime;
    var g = master.gain;
    var back = now + (seconds || 2) * 0.85;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.18, now + 0.08);
    g.setValueAtTime(0.18, back);
    g.linearRampToValueAtTime(0.9, back + 0.5);
  }

  function setEnabled(v) {
    enabled = !!v;
    if (!enabled) { stopLoop(); return; }
    if (current) { var n = current; current = null; play(n); }
  }

  /* Render a whole loop into an AudioBuffer, for exporting the soundtrack or
     for checking headlessly that a track actually makes a sound. */
  function renderOffline(name, loops) {
    var track = TRACKS[name];
    if (!track) return Promise.reject(new Error('unknown track: ' + name));
    loops = loops || 1;

    var rate = 44100;
    var dur = stepDuration(track);
    var length = Math.ceil((track.steps * loops * dur + 1.5) * rate);
    var OC = global.OfflineAudioContext || global.webkitOfflineAudioContext;
    var oc = new OC(1, length, rate);

    var out = makeBus(oc);

    for (var i = 0; i < track.steps * loops; i++) {
      var when = 0.05 + i * dur;
      var step = i % track.steps;
      track.channels.forEach(function (ch) {
        var ev = ch.events[step % ch.events.length];
        if (!ev) return;
        if (ch.drums) playDrum(oc, out, ch, ev, when);
        else playNote(oc, out, ch, ev, when, ev.len * dur);
      });
    }
    return oc.startRendering();
  }

  global.Music = {
    TRACKS: TRACKS,
    renderOffline: renderOffline,
    play: play,
    stop: stop,
    duck: duck,
    current: function () { return current; },
    isEnabled: function () { return enabled; },
    setEnabled: setEnabled
  };
})(window);
