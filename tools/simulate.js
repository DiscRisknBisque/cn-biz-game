#!/usr/bin/env node
/*
 * tools/simulate.js — play every campaign headlessly under several strategies
 * and print where the stats and grades land.
 *
 * Run it after touching balance.js or any fx value:  node tools/simulate.js
 *
 * It also validates the content: every scene bilingual with a right answer,
 * every dex entry complete, every rare reachable from exactly one scene, and
 * every sprite row the right width.
 */
'use strict';

var path = require('path');
var C = require(path.join(__dirname, '..', 'js', 'content.js'));
var B = require(path.join(__dirname, '..', 'js', 'balance.js'));

function unitsOf(camp) { return camp.chapters.concat([camp.boss]); }
function maxPointsOf(camp) {
  return unitsOf(camp).reduce(function (n, u) { return n + u.scenes.length * 2; }, 0);
}

/* --- strategies -------------------------------------------------------- */

function argOf(sc, pick) {
  var scores = sc.choices.map(function (c) { return c.score; });
  return scores.indexOf(pick.apply(null, scores));
}

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

function play(camp, strategy) {
  var stats = Object.assign({}, B.START);
  var points = 0;
  var rares = 0;

  unitsOf(camp).forEach(function (unit) {
    var unitPoints = 0;
    unit.scenes.forEach(function (sc) {
      var choice = sc.choices[strategy(sc)];
      B.applyFx(stats, choice.fx);
      unitPoints += choice.score;
      if (sc.rare && choice.score === 2) rares++;
    });
    points += unitPoints;
    B.settle(stats, unitPoints, unit.scenes.length * 2);
  });

  var score = B.score(stats, points, maxPointsOf(camp));
  return { stats: stats, points: points, score: score, rares: rares, grade: gradeFor(camp, score) };
}

function gradeFor(camp, score) {
  for (var i = 0; i < camp.endings.length; i++) {
    if (score >= camp.endings[i].min) return camp.endings[i].grade;
  }
  return '?';
}

/* --- content checks ---------------------------------------------------- */

function checkContent() {
  var problems = [];
  var langs = ['zh', 'en'];
  var seenDexIds = {};

  function bilingual(where, obj) {
    if (!obj) { problems.push(where + ': missing'); return; }
    langs.forEach(function (l) {
      if (!obj[l] || !String(obj[l]).trim()) problems.push(where + ': missing ' + l);
    });
  }

  Object.keys(C.UI).forEach(function (k) { bilingual('UI.' + k, C.UI[k]); });

  bilingual('AS_OF', C.AS_OF);
  Object.keys(C.RISK).forEach(function (k) {
    bilingual('RISK.' + k + '.label', C.RISK[k].label);
    bilingual('RISK.' + k + '.desc', C.RISK[k].desc);
    if (!C.RISK[k].colour) problems.push('RISK.' + k + ': needs a colour');
  });

  if (C.CAMPAIGNS.length < 1) problems.push('no campaigns defined');

  C.CAMPAIGNS.forEach(function (camp) {
    var tag = camp.id;
    bilingual(tag + '.title', camp.title);
    bilingual(tag + '.subtitle', camp.subtitle);
    bilingual(tag + '.blurb', camp.blurb);
    if (!camp.icon) problems.push(tag + ': needs an icon sprite');

    unitsOf(camp).forEach(function (unit) {
      bilingual(tag + '/' + unit.id + '.title', unit.title);
      bilingual(tag + '/' + unit.id + '.name', unit.name);
      bilingual(tag + '/' + unit.id + '.dexNote', unit.dexNote);
      bilingual(tag + '/' + unit.id + '.intro', unit.intro);

      unit.scenes.forEach(function (sc, i) {
        var at = tag + '/' + unit.id + '#' + (i + 1);
        bilingual(at + '.prompt', sc.prompt);
        bilingual(at + '.tip', sc.tip);
        bilingual(at + '.law', sc.law);
        if (!sc.choices || sc.choices.length < 2) problems.push(at + ': needs at least 2 choices');
        var best = 0;
        (sc.choices || []).forEach(function (c, j) {
          bilingual(at + '.choice' + (j + 1), c.text);
          bilingual(at + '.choice' + (j + 1) + '.verdict', c.verdict);
          if ([0, 1, 2].indexOf(c.score) < 0) problems.push(at + '.choice' + (j + 1) + ': score must be 0, 1 or 2');
          if (c.score === 2) best++;
        });
        if (best === 0) problems.push(at + ': no choice scores 2 — the scene has no right answer');

        /* Risk tagging is what tells a player whether a mistake is a fine or a
           criminal record, so an untagged scene is a real gap, not cosmetic. */
        if (!sc.risk || !sc.risk.length) {
          problems.push(at + ': no risk categories — every scene must say what kind of trouble it is');
        } else {
          sc.risk.forEach(function (k) {
            if (!C.RISK[k]) problems.push(at + ': unknown risk category "' + k + '"');
          });
          if (sc.risk.length !== new Set(sc.risk).size) problems.push(at + ': duplicate risk category');
        }
        if ('volatile' in sc && sc.volatile !== true) problems.push(at + ': volatile must be true or absent');
      });
    });

    camp.endings.forEach(function (e, i) {
      bilingual(tag + '.ending' + i + '.title', e.title);
      bilingual(tag + '.ending' + i + '.body', e.body);
      if (typeof e.min !== 'number') problems.push(tag + '.ending' + i + ': needs a numeric min');
    });
    if (!camp.endings.some(function (e) { return e.min === 0; })) {
      problems.push(tag + ': endings need a floor at min 0, or a bad run falls through');
    }

    if (!camp.advice || camp.advice.length < 3) {
      problems.push(tag + ': needs at least 3 concrete next steps for the result screen');
    }
    (camp.advice || []).forEach(function (a, i) { bilingual(tag + '.advice' + i, a); });

    /* --- dex ----------------------------------------------------------- */

    var dexUnits = unitsOf(camp).concat(camp.bonusDex ? [camp.bonusDex] : []);
    dexUnits.forEach(function (u) {
      var m = camp.dexMeta[u.id];
      if (!m) { problems.push(tag + ': dexMeta is missing an entry for "' + u.id + '"'); return; }
      bilingual(tag + '.dexMeta.' + u.id + '.type', m.type);
      bilingual(tag + '.dexMeta.' + u.id + '.weak', m.weak);
      if (!(m.danger >= 0 && m.danger <= 5)) problems.push(tag + '.dexMeta.' + u.id + ': danger must be 0-5');
      if (!(m.rarity >= 1 && m.rarity <= 3)) problems.push(tag + '.dexMeta.' + u.id + ': rarity must be 1-3');
    });
    if (camp.bonusDex) {
      bilingual(tag + '.bonusDex.name', camp.bonusDex.name);
      bilingual(tag + '.bonusDex.dexNote', camp.bonusDex.dexNote);
    }

    camp.rares.concat([camp.secret]).forEach(function (r) {
      bilingual(tag + '.' + r.id + '.name', r.name);
      bilingual(tag + '.' + r.id + '.type', r.type);
      bilingual(tag + '.' + r.id + '.from', r.from);
      bilingual(tag + '.' + r.id + '.note', r.note);
      bilingual(tag + '.' + r.id + '.weak', r.weak);
    });

    /* Ids are the keys the save file uses, so a collision would silently
       merge two creatures into one. */
    dexUnits.concat(camp.rares, [camp.secret]).forEach(function (e) {
      if (seenDexIds[e.id]) problems.push('dex id "' + e.id + '" is used by both ' + seenDexIds[e.id] + ' and ' + tag);
      seenDexIds[e.id] = tag;
    });

    /* Every rare must be reachable: exactly one scene points at it, and that
       scene has a right answer to release it. */
    var referenced = {};
    unitsOf(camp).forEach(function (unit) {
      unit.scenes.forEach(function (sc, i) {
        if (!sc.rare) return;
        var at = tag + '/' + unit.id + '#' + (i + 1);
        if (!camp.rares.some(function (r) { return r.id === sc.rare; })) {
          problems.push(at + ': rare "' + sc.rare + '" is not in this campaign\'s rares');
        }
        if (referenced[sc.rare]) problems.push(tag + ': rare "' + sc.rare + '" is triggered by more than one scene');
        referenced[sc.rare] = at;
      });
    });
    camp.rares.forEach(function (r) {
      if (!referenced[r.id]) problems.push(tag + ': rare "' + r.id + '" is unreachable — no scene triggers it');
    });
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
  var names = {};
  var re = /(\w+):\s*\[([\s\S]*?)\]/g;
  var m;
  while ((m = re.exec(src))) {
    var name = m[1];
    var rows = (m[2].match(/'[^']*'/g) || []).map(function (r) { return r.slice(1, -1); });
    if (rows.length < 8) continue;
    names[name] = true;
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

  /* Every creature the content refers to has to actually exist as art. */
  C.CAMPAIGNS.forEach(function (camp) {
    var refs = [camp.icon];
    unitsOf(camp).concat(camp.bonusDex ? [camp.bonusDex] : [], camp.rares, [camp.secret])
      .forEach(function (u) { refs.push(u.monster); });
    refs.forEach(function (r) {
      if (r && !names[r]) problems.push(camp.id + ': references sprite "' + r + '", which does not exist');
    });
  });

  return problems;
}

/* The tracks are hand-typed tracker strings, so a mistyped note or a channel
   that is one token short is easy to do and impossible to see. */
function checkMusic() {
  var fs = require('fs');
  var src = fs.readFileSync(path.join(__dirname, '..', 'js', 'music.js'), 'utf8');
  var problems = [];

  var body = src.slice(src.indexOf('var TRACKS = {'), src.indexOf('/* Compile the scores once.'));
  var noteRe = /^([A-G])(#|b)?(-?\d)$/;

  /* Pull out each `name: { ... }` track block, then each melody string in it. */
  var trackRe = /(\w+):\s*\{\s*\n\s*bpm:\s*(\d+)/g;
  var starts = [];
  var m;
  while ((m = trackRe.exec(body))) starts.push({ name: m[1], bpm: parseInt(m[2], 10), at: m.index });
  if (!starts.length) return ['music: no tracks found — has the TRACKS block moved?'];

  starts.forEach(function (t, i) {
    var chunk = body.slice(t.at, i + 1 < starts.length ? starts[i + 1].at : body.length);
    if (!(t.bpm >= 40 && t.bpm <= 240)) problems.push('music/' + t.name + ': bpm ' + t.bpm + ' is out of range');

    /* Each channel's melody is a run of concatenated string literals. */
    var chanRe = /melody:\s*((?:'[^']*'\s*\+?\s*)+)/g;
    var lengths = [];
    var cm, ci = 0;
    while ((cm = chanRe.exec(chunk))) {
      var joined = (cm[1].match(/'[^']*'/g) || []).map(function (x) { return x.slice(1, -1); }).join('');
      var tokens = joined.replace(/\|/g, ' ').trim().split(/\s+/);
      ci++;
      lengths.push(tokens.length);
      tokens.forEach(function (tok, k) {
        var ok = tok === '.' || tok === '-' || tok === 'K' || tok === 'S' || tok === 'h' || noteRe.test(tok);
        if (!ok) problems.push('music/' + t.name + ' channel ' + ci + ' step ' + k + ': unreadable token "' + tok + '"');
      });
      if (tokens[0] === '.') problems.push('music/' + t.name + ' channel ' + ci + ': starts on a sustain, which loops into silence');
    }
    if (!ci) problems.push('music/' + t.name + ': no channels');

    /* Unequal channel lengths would make the parts drift apart on every loop. */
    var uniq = lengths.filter(function (v, k, a) { return a.indexOf(v) === k; });
    if (uniq.length > 1) {
      problems.push('music/' + t.name + ': channels are ' + lengths.join('/') + ' steps — they must match or the loop drifts');
    }
    if (lengths[0] % 16 !== 0) {
      problems.push('music/' + t.name + ': ' + lengths[0] + ' steps is not a whole number of bars');
    }
  });

  return problems;
}

/* --- report ------------------------------------------------------------ */

var problems = checkContent().concat(checkSprites(), checkMusic());
if (problems.length) {
  console.log('CONTENT PROBLEMS (' + problems.length + '):');
  problems.slice(0, 40).forEach(function (p) { console.log('  - ' + p); });
  if (problems.length > 40) console.log('  ... and ' + (problems.length - 40) + ' more');
  console.log('');
} else {
  var scenes = 0, dex = 0;
  C.CAMPAIGNS.forEach(function (camp) {
    unitsOf(camp).forEach(function (u) { scenes += u.scenes.length; });
    dex += unitsOf(camp).length + (camp.bonusDex ? 1 : 0) + camp.rares.length + 1;
  });
  console.log('Content OK — ' + C.CAMPAIGNS.length + ' campaigns, ' + scenes +
              ' scenes, ' + dex + ' dex entries.\n');
}

function row(label, r, max) {
  var s = r.stats;
  console.log(
    '  ' + label.padEnd(10) +
    'grade ' + r.grade +
    '  score ' + String(r.score).padStart(3) +
    '  pts ' + String(r.points).padStart(2) + '/' + max +
    '   cash ' + String(s.cash).padStart(3) +
    '  compliance ' + String(s.comp).padStart(3) +
    '  reputation ' + String(s.rep).padStart(3) +
    '  energy ' + String(s.energy).padStart(3));
}

C.CAMPAIGNS.forEach(function (camp) {
  var max = maxPointsOf(camp);
  console.log(camp.id + ' — ' + camp.title.en + '  (' + camp.chapters.length + ' chapters, ' + max + ' points)');

  ['best', 'cheapest', 'worst'].forEach(function (name) {
    row(name, play(camp, STRATEGIES[name]), max);
  });

  /* Average a batch of coin-flip runs so the middle of the curve is visible. */
  var N = 400;
  var acc = { score: 0, points: 0, cash: 0, comp: 0, rep: 0, energy: 0 };
  var grades = {};
  for (var i = 0; i < N; i++) {
    var r = play(camp, STRATEGIES.random);
    acc.score += r.score; acc.points += r.points;
    acc.cash += r.stats.cash; acc.comp += r.stats.comp;
    acc.rep += r.stats.rep; acc.energy += r.stats.energy;
    grades[r.grade] = (grades[r.grade] || 0) + 1;
  }
  console.log('  random    grade ' + Object.keys(grades).sort().map(function (g) {
    return g + ':' + Math.round((grades[g] / N) * 100) + '%';
  }).join(' ') +
    '  score ' + Math.round(acc.score / N) +
    '  pts ' + Math.round(acc.points / N) + '/' + max +
    '   cash ' + Math.round(acc.cash / N) +
    '  compliance ' + Math.round(acc.comp / N) +
    '  reputation ' + Math.round(acc.rep / N) +
    '  energy ' + Math.round(acc.energy / N));

  var perfect = play(camp, STRATEGIES.best);
  console.log('  a perfect run releases ' + perfect.rares + '/' + camp.rares.length + ' rares');

  var spread = {};
  var volatile = 0;
  unitsOf(camp).forEach(function (u) {
    u.scenes.forEach(function (sc) {
      (sc.risk || []).forEach(function (k) { spread[k] = (spread[k] || 0) + 1; });
      if (sc.volatile) volatile++;
    });
  });
  console.log('  risk tags  ' + Object.keys(spread).sort().map(function (k) {
    return k + ':' + spread[k];
  }).join('  ') + '   ·  ' + volatile + ' scenes flagged as policy-volatile\n');
});

process.exit(problems.length ? 1 : 0);
