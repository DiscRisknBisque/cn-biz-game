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

  return problems;
}

/* --- report ------------------------------------------------------------ */

var problems = checkContent();
if (problems.length) {
  console.log('CONTENT PROBLEMS (' + problems.length + '):');
  problems.forEach(function (p) { console.log('  - ' + p); });
} else {
  console.log('Content OK — ' + UNITS.length + ' units, ' +
              UNITS.reduce(function (n, u) { return n + u.scenes.length; }, 0) +
              ' scenes, ' + MAX_POINTS + ' points available.\n');
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
