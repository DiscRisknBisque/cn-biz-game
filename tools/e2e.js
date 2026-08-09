#!/usr/bin/env node
/*
 * tools/e2e.js — drives the real game in a real browser.
 *
 * Playwright is an optional dev dependency; the game itself has none.
 *   npm install && npm run serve      (in one terminal)
 *   npm run e2e                       (in another)
 *
 * Set BASE_URL to point somewhere other than http://localhost:8123.
 */
'use strict';

var BASE = process.env.BASE_URL || 'http://localhost:8123';

var chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  console.error('playwright is not installed — run `npm install` first.');
  process.exit(2);
}

var SAVE_KEY = 'cnbizgame.save.v1';

/* Playwright normally finds its own browser. When the environment ships one at
   a different path (CI images often do), fall back to whatever is on disk
   rather than telling the user to re-download it. */
function findChromium() {
  var fs = require('fs');
  var path = require('path');
  var roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean);
  for (var i = 0; i < roots.length; i++) {
    var root = roots[i];
    if (!fs.existsSync(root)) continue;
    var dirs = fs.readdirSync(root).filter(function (d) { return d.indexOf('chromium') === 0; }).sort().reverse();
    for (var j = 0; j < dirs.length; j++) {
      var exe = path.join(root, dirs[j], 'chrome-linux', 'chrome');
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

async function launchBrowser() {
  if (process.env.CHROMIUM_PATH) return chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try {
    return await chromium.launch();
  } catch (e) {
    var exe = findChromium();
    if (!exe) throw e;
    return chromium.launch({ executablePath: exe });
  }
}

/* A completed save, used as the base for the state-dependent checks. */
var FINISHED = {
  lang: 'zh', sound: true, hero: 'hero1', started: true, unlocked: 8,
  cleared: { visa: 6, entity: 6, chop: 6, fx: 6, tax: 6, labor: 6, ip: 6, data: 6, boss: 8 },
  dex: {}, bossHp: 0, bossDone: true, finished: true,
  stats: { cash: 150, comp: 90, rep: 88, energy: 70 }
};

(async function () {
  var browser = await launchBrowser();
  var page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  var errors = [];
  var failures = [];
  page.on('pageerror', function (e) { errors.push('pageerror: ' + e.message); });
  page.on('console', function (m) { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  function check(name, ok) { if (!ok) failures.push(name); }
  function seed(obj) { return page.evaluate(function (a) { localStorage.setItem(a[0], a[1]); }, [SAVE_KEY, JSON.stringify(obj)]); }
  function labels() { return page.$$eval('.btn', function (els) { return els.map(function (e) { return e.textContent.trim(); }); }); }
  function clickLabel(re) {
    return page.evaluate(function (src) {
      var b = [].slice.call(document.querySelectorAll('.btn')).find(function (x) { return new RegExp(src).test(x.textContent); });
      if (b) b.click();
    }, re.source);
  }
  function pause(ms) { return page.waitForTimeout(ms); }

  /* ---- title screen reflects save state -------------------------------- */

  await page.goto(BASE + '/index.html');
  await seed(FINISHED);
  await page.goto(BASE + '/index.html');
  await pause(250);

  var l1 = await labels();
  check('finished save offers exactly one START and no CONTINUE',
        l1.filter(function (l) { return l === '开始游戏'; }).length === 1 && l1.indexOf('继续游戏') === -1);

  await seed(Object.assign({}, FINISHED, { finished: false, bossDone: false, unlocked: 3 }));
  await page.goto(BASE + '/index.html');
  await pause(250);

  var l2 = await labels();
  check('in-progress save offers CONTINUE and NEW GAME',
        l2.indexOf('继续游戏') >= 0 && l2.indexOf('重新开始') >= 0);

  /* ---- language toggle persists ---------------------------------------- */

  await page.click('.chip');
  await pause(200);
  check('language toggles to English', (await page.textContent('.logo .l1')).indexOf('Can You') >= 0);
  await page.reload();
  await pause(250);
  check('language survives a reload', (await page.textContent('.logo .l1')).indexOf('Can You') >= 0);
  await page.click('.chip');
  await pause(150);

  /* ---- locked chapters stay locked ------------------------------------- */

  await clickLabel(/继续游戏/);
  await pause(250);
  var nodes = await page.$$('.node');
  check('map lists every chapter plus the boss', nodes.length === 9);
  await nodes[7].click();                       // chapter 8, locked at unlocked:3
  await pause(250);
  check('a locked chapter does not open', (await page.$$('.node')).length === 9);

  /* ---- a chapter can be played and progress is saved -------------------- */

  await nodes[3].click();                       // chapter 4, unlocked
  await pause(250);
  await page.click('.btn.primary');             // intro -> first scene
  await pause(200);
  check('scene offers choices', (await page.$$('.btn.choice')).length >= 2);
  await (await page.$$('.btn.choice'))[0].click();
  await pause(200);
  check('feedback cites a source', (await page.$$('.label.law')).length === 1);

  var saved = await page.evaluate(function (k) { return JSON.parse(localStorage.getItem(k)); }, SAVE_KEY);
  check('stats are persisted mid-chapter', saved && typeof saved.stats.comp === 'number');

  /* ---- a full run from a clean save reaches an ending ------------------- */

  await page.evaluate(function (k) { localStorage.removeItem(k); }, SAVE_KEY);
  await page.goto(BASE + '/index.html');
  await pause(250);
  await page.click('.btn.primary');             // START -> hero picker
  await pause(200);
  await page.click('.btn.primary');             // confirm -> map
  await pause(200);

  var plan = await page.evaluate(function () {
    var pick = function (sc) {
      var s = sc.choices.map(function (c) { return c.score; });
      return s.indexOf(Math.max.apply(null, s));
    };
    return {
      chapters: window.Content.CHAPTERS.map(function (ch) { return ch.scenes.map(pick); }),
      boss: window.Content.BOSS.scenes.map(pick)
    };
  });

  async function playUnit(picks, nodeIndex) {
    var ns = await page.$$('.node');
    await ns[nodeIndex].click();
    await pause(220);
    await page.click('.btn.primary');           // intro -> scene
    await pause(180);
    for (var i = 0; i < picks.length; i++) {
      var btns = await page.$$('.btn.choice');
      if (!btns.length) throw new Error('no choices at scene ' + i + ' of node ' + nodeIndex);
      await btns[picks[i]].click();
      await pause(160);
      await page.click('.btn.primary');         // feedback -> next
      await pause(180);
    }
  }

  for (var c = 0; c < plan.chapters.length; c++) {
    await playUnit(plan.chapters[c], c);
    await page.click('.btn.primary');           // capture -> map
    await pause(180);
  }
  await playUnit(plan.boss, 8);
  await pause(350);

  var grade = (await page.textContent('.grade')).trim();
  check('a perfect run grades S (got ' + grade + ')', grade === 'S');

  var dexCaught = await page.evaluate(function (k) {
    var s = JSON.parse(localStorage.getItem(k));
    return Object.keys(s.dex).filter(function (x) { return s.dex[x] === 'caught'; }).length;
  }, SAVE_KEY);
  check('a perfect run catches all 10 dex entries (got ' + dexCaught + ')', dexCaught === 10);

  /* ---- report ---------------------------------------------------------- */

  await browser.close();

  if (failures.length) {
    console.log('FAILED (' + failures.length + '):');
    failures.forEach(function (f) { console.log('  - ' + f); });
  } else {
    console.log('All end-to-end checks passed.');
  }
  if (errors.length) {
    console.log('Runtime errors:');
    errors.forEach(function (e) { console.log('  - ' + e); });
  }
  process.exit(failures.length || errors.length ? 1 : 0);
})().catch(function (e) {
  console.error('e2e run failed: ' + e.message);
  process.exit(1);
});
