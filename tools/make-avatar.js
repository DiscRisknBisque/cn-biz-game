#!/usr/bin/env node
/*
 * tools/make-avatar.js — the WeChat mini-program avatar.
 *
 *   node tools/make-avatar.js            writes build/avatar/*.png
 *
 * Drawn as a 24x24 character grid and scaled 6x to exactly 144x144, so every
 * pixel lands on a whole 6x6 block with no resampling — which is the whole
 * point of pixel art and the first thing an exported-from-a-canvas icon gets
 * wrong.
 *
 * Encodes PNG by hand (zlib is in Node's standard library) rather than pulling
 * in a graphics dependency, matching the rest of this project: the game ships
 * no image files either.
 *
 * WeChat's requirements: png/bmp/jpeg/jpg/gif, under 2 MB, 144x144 recommended.
 * This lands at a few KB.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

/* ---------------------------------------------------------------- palette */

/* The game's own tokens, so the icon and the thing it opens look related. */
var PALETTE = {
  '.': '#FBF3DF',   // cream ground, opaque — an icon should never ship transparent
  ',': '#E8DCBE',   // contact shadow under the base
  'K': '#241F31',   // outline
  'R': '#E2574C',   // chop red
  'd': '#B8382E',   // chop base, shaded
  'W': '#FFFFFF',   // eye white
  'Y': '#F7D94F',   // gold sparkle
  'T': '#8A5A3B',   // handle
  't': '#C08B5C'    // handle highlight
};

/* ----------------------------------------------------------------- design */

/*
 * A 公章 with a face. The company chop is the single most recognisable object
 * in the life of a Chinese business owner — it is what the game is about — and
 * as a silhouette it survives being shrunk to 40px in a chat list, which a
 * more literal "quiz" or "document" icon does not.
 *
 * Read at arm's length: red block, two eyes, a smile, a gold spark. That is
 * all an icon this size gets to say.
 */
var ART = [
  '........................',
  '........................',
  '..........KKKK..........',
  '.........KttttK..Y......',
  '.........KtTTtK.YYY.....',
  '.........KtTTtK..Y......',
  '.....KKKKKKKKKKKKKK.....',
  '....KRRRRRRRRRRRRRRK....',
  '...KRRRRRRRRRRRRRRRRK...',
  '...KRRRRRRRRRRRRRRRRK...',
  '...KRRRWWRRRRRRWWRRRK...',
  '...KRRRWKRRRRRRKWRRRK...',
  '...KRRRRRRRRRRRRRRRRK...',
  '...KRRRKRRRRRRRRKRRRK...',
  '...KRRRRKKKKKKKKRRRRK...',
  '...KRRRRRRRRRRRRRRRRK...',
  '...KRRRRRRRRRRRRRRRRK...',
  '...KKKKKKKKKKKKKKKKKK...',
  '...KddddddddddddddddK...',
  '...KddddddddddddddddK...',
  '...KKKKKKKKKKKKKKKKKK...',
  '....,,,,,,,,,,,,,,,,....',
  '........................',
  '........................'
];

var SCALE = 6;                    // 24 * 6 = 144 exactly

/* ------------------------------------------------------------------ check */

function validate() {
  var problems = [];
  var w = ART[0].length;
  if (ART.length !== w) problems.push('art is ' + ART.length + ' rows by ' + w + ' cols — it must be square');
  ART.forEach(function (row, y) {
    if (row.length !== w) problems.push('row ' + y + ' is ' + row.length + ' wide, expected ' + w);
    for (var x = 0; x < row.length; x++) {
      if (!PALETTE[row[x]]) problems.push('row ' + y + ' col ' + x + ': unknown colour "' + row[x] + '"');
    }
  });
  if (w * SCALE !== 144) problems.push(w + ' x ' + SCALE + ' = ' + (w * SCALE) + ', not the 144 WeChat asks for');
  return problems;
}

/* -------------------------------------------------------------------- png */

var CRC_TABLE = (function () {
  var t = new Int32Array(256);
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  var c = -1;
  for (var i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  var len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  var body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  var crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/* 8-bit truecolour, no alpha: the ground is opaque by design. */
function encodePng(width, height, rgb) {
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;     // bit depth
  ihdr[9] = 2;     // colour type 2 = truecolour
  ihdr[10] = 0;    // deflate
  ihdr[11] = 0;    // adaptive filtering
  ihdr[12] = 0;    // no interlace

  var stride = width * 3;
  var raw = Buffer.alloc(height * (1 + stride));
  for (var y = 0; y < height; y++) {
    raw[y * (1 + stride)] = 0;                                   // filter: none
    rgb.copy(raw, y * (1 + stride) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function hex(s) {
  return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
}

/* Nearest-neighbour by construction — each source pixel becomes a solid block. */
function render(scale) {
  var src = ART[0].length;
  var size = src * scale;
  var rgb = Buffer.alloc(size * size * 3);
  for (var y = 0; y < size; y++) {
    var row = ART[Math.floor(y / scale)];
    for (var x = 0; x < size; x++) {
      var c = hex(PALETTE[row[Math.floor(x / scale)]]);
      var i = (y * size + x) * 3;
      rgb[i] = c[0]; rgb[i + 1] = c[1]; rgb[i + 2] = c[2];
    }
  }
  return { size: size, png: encodePng(size, size, rgb) };
}

/* -------------------------------------------------------------------- run */

var problems = validate();
if (problems.length) {
  console.log('ART PROBLEMS (' + problems.length + '):');
  problems.forEach(function (p) { console.log('  - ' + p); });
  process.exit(1);
}

var outDir = path.join(__dirname, '..', 'build', 'avatar');
fs.mkdirSync(outDir, { recursive: true });

/* 144 is what WeChat asks for. 288 is the same art at 12x, kept for any
   surface that wants a denser source — it is still whole-pixel. */
[[SCALE, 'avatar-144.png'], [SCALE * 2, 'avatar-288.png']].forEach(function (pair) {
  var out = render(pair[0]);
  var file = path.join(outDir, pair[1]);
  fs.writeFileSync(file, out.png);
  console.log(
    pair[1].padEnd(18) +
    out.size + 'x' + out.size + '  ' +
    (out.png.length / 1024).toFixed(1) + ' KB  ' +
    path.relative(process.cwd(), file)
  );
});

console.log('\nWeChat limits: png/bmp/jpeg/jpg/gif, under 2 MB, 144x144 recommended — all met.');
