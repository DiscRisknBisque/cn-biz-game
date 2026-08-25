#!/usr/bin/env node
/*
 * tools/dump-endings.js — every ending, pulled straight from the campaign files.
 *
 *   node tools/dump-endings.js            print to stdout
 *   node tools/dump-endings.js --write    regenerate docs/endings.md
 *
 * Generated rather than hand-maintained on purpose: a second copy of the ending
 * copy would drift from the source the first time someone edited one and not
 * the other. Regenerate after touching any `endings` array.
 *
 * The reachability table is the part worth reading before rewriting copy. An
 * ending nobody lands in is wasted writing, and a band that swallows everyone
 * makes the other four pointless — so it simulates players at a range of
 * accuracies and reports which grade they actually finish on.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var C = require(path.join(__dirname, '..', 'js', 'content.js'));
var B = require(path.join(__dirname, '..', 'js', 'balance.js'));

var WRITE = process.argv.indexOf('--write') >= 0;
var GRADES = ['S', 'A', 'B', 'C', 'D'];

function units(camp) { return camp.chapters.concat([camp.boss]); }
function maxPoints(camp) {
  return units(camp).reduce(function (n, u) { return n + u.scenes.length * 2; }, 0);
}
function gradeFor(camp, score) {
  for (var i = 0; i < camp.endings.length; i++) if (score >= camp.endings[i].min) return camp.endings[i].grade;
  return '?';
}

/* One playthrough by someone who picks the best answer with probability q and
   otherwise picks at random among the rest. */
function play(camp, q) {
  var stats = Object.assign({}, B.START);
  var points = 0;

  units(camp).forEach(function (unit) {
    var unitPoints = 0;
    unit.scenes.forEach(function (sc) {
      var scores = sc.choices.map(function (c) { return c.score; });
      var best = scores.indexOf(Math.max.apply(null, scores));
      var pick;
      if (Math.random() < q) {
        pick = best;
      } else {
        var others = scores.map(function (_, k) { return k; }).filter(function (k) { return k !== best; });
        pick = others[Math.floor(Math.random() * others.length)];
      }
      var choice = sc.choices[pick];
      B.applyFx(stats, choice.fx);
      unitPoints += choice.score;
    });
    points += unitPoints;
    B.settle(stats, unitPoints, unit.scenes.length * 2);
  });

  return B.score(stats, points, maxPoints(camp));
}

function reachability(camp, runs) {
  runs = runs || 600;
  var rows = [];
  for (var pct = 0; pct <= 100; pct += 10) {
    var dist = {}, sum = 0;
    for (var i = 0; i < runs; i++) {
      var s = play(camp, pct / 100);
      sum += s;
      var g = gradeFor(camp, s);
      dist[g] = (dist[g] || 0) + 1;
    }
    rows.push({
      accuracy: pct,
      mean: Math.round(sum / runs),
      dist: GRADES.map(function (g) { return { grade: g, pct: Math.round((dist[g] || 0) / runs * 100) }; })
                  .filter(function (d) { return d.pct > 0; })
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ output */

var out = [];
function line(s) { out.push(s === undefined ? '' : s); }

line('# 结局总表 · All endings');
line();
line('《测测你适不适合在中国做企业主》共 **' +
  C.CAMPAIGNS.reduce(function (n, c) { return n + c.endings.length; }, 0) +
  ' 个结局**，两条路线各 ' + C.CAMPAIGNS[0].endings.length + ' 个，共用同一套分数档位。');
line();
line('> 由 `tools/dump-endings.js` 从 `js/campaign-*.js` 生成。改完结局文案后重新运行 `npm run endings` —');
line('> 不要直接编辑本文件，它会被覆盖。');
line();
line('最终分 = 答题正确率 × 0.75 + 合规 × 0.15 + 声誉 × 0.10');
line();

C.CAMPAIGNS.forEach(function (camp) {
  line('---');
  line();
  line('## ' + camp.title.zh + ' · ' + camp.title.en);
  line();
  line('满分 ' + maxPoints(camp) + ' 分 · ' + camp.chapters.length + ' 章 + BOSS');
  line();

  camp.endings.forEach(function (e) {
    line('### ' + e.grade + ' 级 — ' + e.title.zh);
    line();
    line('**' + e.title.en + '** · 触发条件：最终分 ≥ ' + e.min);
    line();
    line(e.body.zh);
    line();
    line('> ' + e.body.en);
    line();
  });

  line('#### 各档实际落点');
  line();
  line('模拟 600 次 / 每个正确率档位。');
  line();
  line('| 正确率 | 平均分 | 结局分布 |');
  line('|---:|---:|---|');
  reachability(camp).forEach(function (r) {
    line('| ' + r.accuracy + '% | ' + r.mean + ' | ' +
      r.dist.map(function (d) { return d.grade + ' ' + d.pct + '%'; }).join(' · ') + ' |');
  });
  line();
});

var text = out.join('\n');

if (WRITE) {
  var target = path.join(__dirname, '..', 'docs', 'endings.md');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
  console.log('wrote ' + path.relative(process.cwd(), target) +
              '  (' + text.split('\n').length + ' lines)');
} else {
  console.log(text);
}
