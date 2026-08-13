#!/usr/bin/env node
/*
 * tools/simulate.js — play the whole game headlessly under several strategies
 * and print where the stats and grades land.
 *
 * Run it after touching balance.js or any fx value:  node tools/simulate.js
 *
 * It also sanity-checks the content: every scene needs choices, every choice
 * needs both languages, and at least one choice must be the right answer.
 */
'use strict';

var path = require('path');
var C = require(path.join(__dirname, '..', 'js', 'content.js'));
var B = require(path.join(__dirname, '..', 'js', 'balance.js'));

var UNITS = C.CHAPTERS.concat([C.BOSS]);
var MAX_POINTS = UNITS.reduce(function (n, u) { return n + u.scenes.length * 2; }, 0);

/* --- strategies -------------------------------------------------------- */

var STRATEGIES = {
  best:     function (sc) { return argOf(sc, Math.max); },
  worst:    function (sc) { return argOf(sc, Math.min); },
  /* Someone who always takes the cheapest-looking option. */
  cheapest: function (sc) {
    var costs = sc.choices.map(function (c) { return -((c.fx && c.fx.cash) || 0); });
    return costs.indexOf(Math.min.apply(null, costs));
  },
  /* A coin-flipper, averaged over many runs. */
  random:   function (sc) { return Math.floor(Math.random() * sc.choices.length); }
};

function argOf(sc, pick) {
  var scores = sc.choices.map(function (c) { return c.score; });
  return scores.indexOf(pick.apply(null, scores));
}

function play(strategy) {
  var stats = Object.assign({}, B.START);
  var points = 0;

  UNITS.forEach(function (unit) {
    var unitPoints = 0;
    unit.scenes.forEach(function (sc) {
      var choice = sc.choices[strategy(sc)];
      B.applyFx(stats, choice.fx);
      unitPoints += choice.score;
    });
    points += unitPoints;
    B.settle(stats, unitPoints, unit.scenes.length * 2);
  });

  var score = B.score(stats, points, MAX_POINTS);
  return { stats: stats, points: points, score: score, grade: gradeFor(score) };
}

function gradeFor(score) {
  for (var i = 0; i < C.ENDINGS.length; i++) {
    if (score >= C.ENDINGS[i].min) return C.ENDINGS[i].grade;
  }
  return '?';
}

/* --- content checks ---------------------------------------------------- */

function checkContent() {
  var problems = [];
  var langs = ['zh', 'en'];

  function bilingual(where, obj) {
    if (!obj) { problems.push(where + ': missing'); return; }
    langs.forEach(function (l) {
      if (!obj[l] || !String(obj[l]).trim()) problems.push(where + ': missing ' + l);
    });
  }

  UNITS.forEach(function (unit) {
    bilingual(unit.id + '.title', unit.title);
    bilingual(unit.id + '.name', unit.name);
    bilingual(unit.id + '.dexNote', unit.dexNote);
    unit.scenes.forEach(function (sc, i) {
      var at = unit.id + '#' + (i + 1);
      bilingual(at + '.prompt', sc.prompt);
      bilingual(at + '.tip', sc.tip);
      bilingual(at + '.law', sc.law);
      if (!sc.choices || sc.choices.length < 2) problems.push(at + ': needs at least 2 choices');
      var best = 0;
      (sc.choices || []).forEach(function (c, j) {
        bilingual(at + '.choice' + (j + 1), c.text);
        bilingual(at + '.choice' + (j + 1) + '.verdict', c.verdict);
        if (![0, 1, 2].includes(c.score)) problems.push(at + '.choice' + (j + 1) + ': score must be 0, 1 or 2');
        if (c.score === 2) best++;
      });
      if (best === 0) problems.push(at + ': no choice scores 2 — the scene has no right answer');
    });
  });

  C.ENDINGS.forEach(function (e, i) {
    bilingual('ending' + i + '.title', e.title);
    bilingual('ending' + i + '.body', e.body);
  });

  Object.keys(C.UI).forEach(function (k) { bilingual('UI.' + k, C.UI[k]); });

  /* --- dex ------------------------------------------------------------- */

  var dexIds = {};

  Object.keys(C.DEX_META).forEach(function (id) {
    var m = C.DEX_META[id];
    bilingual('DEX_META.' + id + '.type', m.type);
    bilingual('DEX_META.' + id + '.weak', m.weak);
    if (!(m.danger >= 0 && m.danger <= 5)) problems.push('DEX_META.' + id + ': danger must be 0-5');
    if (!(m.rarity >= 1 && m.rarity <= 3)) problems.push('DEX_META.' + id + ': rarity must be 1-3');
    dexIds[id] = true;
  });

  /* Every chapter, the boss and the bonus entry need metadata, or their dex
     page renders with blank rows. */
  UNITS.concat([C.BONUS_DEX]).forEach(function (u) {
    if (!C.DEX_META[u.id]) problems.push('DEX_META is missing an entry for "' + u.id + '"');
  });

  C.RARES.concat([C.SECRET]).forEach(function (r) {
    bilingual('rare.' + r.id + '.name', r.name);
    bilingual('rare.' + r.id + '.type', r.type);
    bilingual('rare.' + r.id + '.from', r.from);
    bilingual('rare.' + r.id + '.note', r.note);
    bilingual('rare.' + r.id + '.weak', r.weak);
    if (dexIds[r.id]) problems.push('rare "' + r.id + '" collides with a chapter dex id');
    dexIds[r.id] = true;
  });

  /* Every rare must be reachable: some scene has to point at it, and that
     scene has to have a right answer to release it. */
  var referenced = {};
  UNITS.forEach(function (unit) {
    unit.scenes.forEach(function (sc, i) {
      if (!sc.rare) return;
      var at = unit.id + '#' + (i + 1);
      if (!C.RARES.some(function (r) { return r.id === sc.rare; })) {
        problems.push(at + ': rare "' + sc.rare + '" is not in RARES');
      }
      if (referenced[sc.rare]) problems.push('rare "' + sc.rare + '" is triggered by more than one scene');
      referenced[sc.rare] = at;
    });
  });
  C.RARES.forEach(function (r) {
    if (!referenced[r.id]) problems.push('rare "' + r.id + '" is unreachable — no scene triggers it');
  });

  return problems;
}

/* Sprites are authored as character grids; a mistyped row only shows up in the
   browser console, so check the widths here too. */
function checkSprites() {
  var fs = require('fs');
  var src = fs.readFileSync(path.join(__dirname, '..', 'js', 'pixel.js'), 'utf8');
  var palette = {};
  var palBlock = src.slice(src.indexOf('var PALETTE'), src.indexOf('var SPRITES'));
  /* Keys are written both bare (K: '#...') and quoted ('.': null). */
  palBlock.replace(/'?([.A-Za-z])'?\s*:\s*(null|'#[0-9a-fA-F]{6}')/g, function (_, ch) {
    palette[ch] = true;
    return '';
  });

  var problems = [];
  var re = /(\w+):\s*\[([\s\S]*?)\]/g;
  var m;
  while ((m = re.exec(src))) {
    var name = m[1];
    var rows = (m[2].match(/'[^']*'/g) || []).map(function (r) { return r.slice(1, -1); });
    if (rows.length < 8) continue;
    var w = rows[0].length;
    rows.forEach(function (row, i) {
      if (row.length !== w) problems.push('sprite ' + name + ' row ' + i + ' is ' + row.length + ' wide, expected ' + w);
      var bad = {};
      for (var c = 0; c < row.length; c++) if (!palette[row[c]]) bad[row[c]] = true;
      Object.keys(bad).forEach(function (ch) {
        problems.push('sprite ' + name + ' row ' + i + ' uses unknown colour "' + ch + '"');
      });
    });
  }
  return problems;
}

/* --- report ------------------------------------------------------------ */

var problems = checkContent().concat(checkSprites());
if (problems.length) {
  console.log('CONTENT PROBLEMS (' + problems.length + '):');
  problems.slice(0, 40).forEach(function (p) { console.log('  - ' + p); });
  if (problems.length > 40) console.log('  ... and ' + (problems.length - 40) + ' more');
} else {
  console.log('Content OK — ' + UNITS.length + ' units, ' +
              UNITS.reduce(function (n, u) { return n + u.scenes.length; }, 0) +
              ' scenes, ' + MAX_POINTS + ' points available, ' +
              (Object.keys(C.DEX_META).length + C.RARES.length + 1) + ' dex entries.\n');
}

function row(label, r) {
  var s = r.stats;
  console.log(
    label.padEnd(10) +
    'grade ' + r.grade +
    '  score ' + String(r.score).padStart(3) +
    '  pts ' + String(r.points).padStart(2) + '/' + MAX_POINTS +
    '   cash ' + String(s.cash).padStart(3) +
    '  compliance ' + String(s.comp).padStart(3) +
    '  reputation ' + String(s.rep).padStart(3) +
    '  energy ' + String(s.energy).padStart(3));
}

['best', 'cheapest', 'worst'].forEach(function (name) {
  row(name, play(STRATEGIES[name]));
});

/* Average a batch of coin-flip runs so the middle of the curve is visible. */
var N = 400;
var acc = { score: 0, cash: 0, comp: 0, rep: 0, energy: 0, points: 0 };
var grades = {};
for (var i = 0; i < N; i++) {
  var r = play(STRATEGIES.random);
  acc.score += r.score; acc.points += r.points;
  acc.cash += r.stats.cash; acc.comp += r.stats.comp;
  acc.rep += r.stats.rep; acc.energy += r.stats.energy;
  grades[r.grade] = (grades[r.grade] || 0) + 1;
}
console.log('random    grade ' + Object.keys(grades).sort().map(function (g) {
  return g + ':' + Math.round((grades[g] / N) * 100) + '%';
}).join(' ') +
  '  score ' + Math.round(acc.score / N) +
  '  pts ' + Math.round(acc.points / N) + '/' + MAX_POINTS +
  '   cash ' + Math.round(acc.cash / N) +
  '  compliance ' + Math.round(acc.comp / N) +
  '  reputation ' + Math.round(acc.rep / N) +
  '  energy ' + Math.round(acc.energy / N) + '   (mean of ' + N + ' runs)');

process.exit(problems.length ? 1 : 0);
