#!/usr/bin/env node
/*
 * tools/render-music.js — bounce every track to a .wav so you can hear the
 * soundtrack without playing the game.
 *
 *   npm run serve            (in one terminal)
 *   node tools/render-music.js [outDir]
 *
 * The game itself never needs this; it synthesises everything at runtime. This
 * is for auditioning changes to the scores, and it doubles as a check that a
 * track actually makes a sound rather than scheduling silence.
 */
'use strict';

var fs = require('fs');
var path = require('path');

var BASE = process.env.BASE_URL || 'http://localhost:8123';
var OUT = process.argv[2] || path.join(__dirname, '..', 'build', 'music');
var LOOPS = parseInt(process.env.LOOPS || '2', 10);

var chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  console.error('playwright is not installed — run `npm install` first.');
  process.exit(2);
}

function findChromium() {
  var roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean);
  for (var i = 0; i < roots.length; i++) {
    if (!fs.existsSync(roots[i])) continue;
    var dirs = fs.readdirSync(roots[i]).filter(function (d) { return d.indexOf('chromium') === 0; }).sort().reverse();
    for (var j = 0; j < dirs.length; j++) {
      var exe = path.join(roots[i], dirs[j], 'chrome-linux', 'chrome');
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

async function launch() {
  if (process.env.CHROMIUM_PATH) return chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try { return await chromium.launch(); }
  catch (e) {
    var exe = findChromium();
    if (!exe) throw e;
    return chromium.launch({ executablePath: exe });
  }
}

/* 16-bit mono PCM WAV. */
function toWav(samples, rate) {
  var n = samples.length;
  var buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);          // PCM
  buf.writeUInt16LE(1, 22);          // mono
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (var i = 0; i < n; i++) {
    var v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

(async function () {
  var browser = await launch();
  var page = await browser.newPage();
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(300);

  var names = await page.evaluate(function () { return Object.keys(window.Music.TRACKS); });
  fs.mkdirSync(OUT, { recursive: true });

  var problems = 0;

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var res = await page.evaluate(async function (a) {
      var buf = await window.Music.renderOffline(a[0], a[1]);
      var data = buf.getChannelData(0);
      var peak = 0, sum = 0;
      for (var k = 0; k < data.length; k++) {
        var v = Math.abs(data[k]);
        if (v > peak) peak = v;
        sum += v * v;
      }
      return {
        rate: buf.sampleRate,
        samples: Array.from(data),
        peak: peak,
        rms: Math.sqrt(sum / data.length),
        seconds: buf.duration
      };
    }, [name, LOOPS]);

    var wav = toWav(res.samples, res.rate);
    var file = path.join(OUT, name + '.wav');
    fs.writeFileSync(file, wav);

    /* A track that renders silence, or one loud enough to clip, is a bug. */
    var status = 'ok';
    if (res.peak < 0.01) { status = 'SILENT'; problems++; }
    else if (res.peak > 0.99) { status = 'CLIPPING'; problems++; }

    console.log(
      name.padEnd(8) +
      res.seconds.toFixed(1).padStart(5) + 's  ' +
      'peak ' + res.peak.toFixed(3) + '  rms ' + res.rms.toFixed(4) +
      '  ' + status + '  ->  ' + path.relative(process.cwd(), file));
  }

  await browser.close();
  process.exit(problems ? 1 : 0);
})().catch(function (e) {
  console.error('render failed: ' + e.message);
  process.exit(1);
});
