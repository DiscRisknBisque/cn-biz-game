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

/* A save from before the second route existed: a single run at the top level.
   Used to check the migration still rescues it. */
var LEGACY_SAVE = {
  lang: 'zh', sound: true, hero: 'hero1', started: true, unlocked: 3,
  cleared: { visa: 12, entity: 6, chop: 5 },
  dex: { visa: 'caught', entity: 'caught', chop: 'seen' },
  shiny: { visa: true },
  bossHp: 100, bossDone: false, finished: false,
  stats: { cash: 140, comp: 72, rep: 66, energy: 58 }
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
  function readSave() { return page.evaluate(function (k) { return JSON.parse(localStorage.getItem(k)); }, SAVE_KEY); }
  function labels() { return page.$$eval('.btn', function (els) { return els.map(function (e) { return e.textContent.trim(); }); }); }
  function clickLabel(re) {
    return page.evaluate(function (src) {
      var b = [].slice.call(document.querySelectorAll('.btn')).find(function (x) { return new RegExp(src).test(x.textContent); });
      if (b) b.click();
    }, re.source);
  }
  function pause(ms) { return page.waitForTimeout(ms); }
  async function dismissOpening() {
    var btn = await page.$('.opening .btn');
    if (!btn) return;
    await page.waitForFunction(function () {
      var b = document.querySelector('.opening .btn');
      return b && !b.disabled;
    }, { timeout: 6000 });
    await page.click('.opening .btn');
    await pause(200);
  }

  /* ---- legacy saves migrate rather than being discarded ----------------- */

  await page.goto(BASE + '/index.html');
  await seed(LEGACY_SAVE);
  await page.goto(BASE + '/index.html');
  await pause(300);

  var migrated = await readSave();
  check('a pre-routes save migrates into the foreign route',
        migrated && migrated.runs && migrated.runs.foreign && migrated.runs.foreign.unlocked === 3);
  check('migration keeps the dex and shinies',
        migrated.dex.visa === 'caught' && migrated.shiny.visa === true);

  var l1 = await labels();
  check('a migrated in-progress save offers CONTINUE', l1.indexOf('继续游戏') >= 0);

  /* ---- language toggle persists ---------------------------------------- */

  await page.click('.chip');
  await pause(200);
  check('language toggles to English', (await page.textContent('.logo .l1')).indexOf('Can You') >= 0);
  await page.reload();
  await pause(250);
  check('language survives a reload', (await page.textContent('.logo .l1')).indexOf('Can You') >= 0);
  await page.click('.chip');
  await pause(150);

  /* ---- route select ----------------------------------------------------- */

  await clickLabel(/换条路线|SWITCH ROUTE/);
  await pause(250);
  var routes = await page.$$('.route');
  check('route select lists both campaigns', routes.length === 2);

  await routes[1].click();                      // the solo route
  await pause(250);
  await dismissOpening();
  var soloNodes = await page.$$('.node');
  check('the solo route has 6 chapters plus a boss', soloNodes.length === 7);

  var saved = await readSave();
  check('picking a route creates its own run and leaves the other alone',
        saved.campaign === 'solo' && saved.runs.solo && saved.runs.foreign.unlocked === 3);

  /* ---- locked chapters stay locked, unlocked ones play ------------------ */

  await soloNodes[5].click();                   // chapter 6, locked at unlocked:0
  await pause(250);
  check('a locked chapter does not open', (await page.$$('.node')).length === 7);

  await (await page.$$('.node'))[0].click();
  await pause(250);
  await page.click('.btn.primary');             // intro -> first scene
  await pause(200);
  check('scene offers choices', (await page.$$('.btn.choice')).length >= 2);
  await (await page.$$('.btn.choice'))[0].click();
  await pause(200);
  check('feedback cites a source', (await page.$$('.label.law')).length === 1);
  check('feedback discloses the risk categories', (await page.$$('.panel.risknote')).length === 1);
  check('risk badges are rendered', (await page.$$('.risknote .riskbadge')).length >= 1);

  /* A scene flagged as policy-volatile has to say so. */
  var volatileShown = await page.evaluate(function () {
    var camp = window.Content.campaign('solo');
    var n = 0;
    camp.chapters.concat([camp.boss]).forEach(function (u) {
      u.scenes.forEach(function (sc) { if (sc.volatile) n++; });
    });
    return n;
  });
  check('the solo route flags volatile policy scenes', volatileShown === 3);

  /* ---- a full run of every campaign reaches its ending ------------------ */

  var campaigns = await page.evaluate(function () {
    return window.Content.CAMPAIGNS.map(function (c) { return c.id; });
  });
  check('two campaigns are registered', campaigns.length === 2);

  await page.evaluate(function (k) { localStorage.removeItem(k); }, SAVE_KEY);
  await page.goto(BASE + '/index.html');
  await pause(250);
  check('a brand-new save opens on the login page', (await page.$$('.field')).length === 1);
  await page.fill('.field', '测试员');            // create a founder (name + avatar)
  await page.click('.btn.primary');             // ENTER -> title
  await pause(200);
  check('a freshly created player is greeted by name',
        (await readSave()).player && (await readSave()).player.name === '测试员');
  await page.click('.btn.primary');             // START -> risk notice
  await pause(250);
  check('a first run is shown the risk notice before anything else',
        (await page.$$('.risklist')).length === 1);
  check('the risk notice lists every category',
        (await page.$$('.risklist .riskline')).length === 5);
  await page.click('.btn.primary');             // acknowledge -> route select (founder already chosen at login)
  await pause(250);
  check('acknowledging the notice is remembered',
        (await readSave()).ackRisk === true);
  check('the notice leads straight to route select', (await page.$$('.route')).length === 2);

  for (var ci = 0; ci < campaigns.length; ci++) {
    var id = campaigns[ci];

    if (ci > 0) {
      await clickLabel(/换条路线|SWITCH ROUTE/);
      await pause(250);
    }
    await (await page.$$('.route'))[ci].click();
    await pause(250);
    await dismissOpening();

    var plan = await page.evaluate(function (cid) {
      var camp = window.Content.campaign(cid);
      var pick = function (sc) {
        var s = sc.choices.map(function (c) { return c.score; });
        return s.indexOf(Math.max.apply(null, s));
      };
      return {
        chapters: camp.chapters.map(function (ch) { return ch.scenes.map(pick); }),
        boss: camp.boss.scenes.map(pick)
      };
    }, id);

    for (var c = 0; c < plan.chapters.length; c++) {
      await playUnit(plan.chapters[c], c);
      await page.click('.btn.primary');         // capture -> map
      await pause(180);
    }
    await playUnit(plan.boss, plan.chapters.length);
    await pause(350);

    var grade = (await page.textContent('.grade')).trim();
    check('a perfect ' + id + ' run grades S (got ' + grade + ')', grade === 'S');
    check('the ' + id + ' result gives concrete next steps',
          (await page.$$('.advice li')).length >= 3);
    check('the ' + id + ' result still carries the disclaimer',
          (await page.$$('.panel.bad')).length >= 1);
  }

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

  /* ---- the dex, after clearing everything perfectly --------------------- */

  var expected = await page.evaluate(function () {
    return window.Game.dex().length;
  });

  var dex = await page.evaluate(function (k) {
    var s = JSON.parse(localStorage.getItem(k));
    return {
      caught: Object.keys(s.dex).filter(function (x) { return s.dex[x] === 'caught'; }).length,
      shiny: Object.keys(s.shiny || {}).length,
      secrets: (s.dex.lawyer === 'caught') && (s.dex.accountant === 'caught')
    };
  }, SAVE_KEY);

  check('a perfect run of both routes catches all ' + expected + ' dex entries (got ' + dex.caught + ')',
        dex.caught === expected);
  check('completing each route unlocks its own secret', dex.secrets === true);

  await clickLabel(/图鉴|DEX/);
  await pause(300);
  check('dex grid shows every entry', (await page.$$('.dexcell')).length === expected);
  check('dex is grouped by route', (await page.$$('.dexsection')).length === 2);

  var tabs = await page.$$('.tabs .chip');
  await tabs[1].click();                        // 未收集 / MISSING
  await pause(200);
  check('missing filter is empty after a perfect run', (await page.$$('.dexcell')).length === 0);
  await (await page.$$('.tabs .chip'))[2].click();  // shiny
  await pause(200);
  check('shiny filter lists the shinies (got ' + dex.shiny + ')',
        (await page.$$('.dexcell')).length === dex.shiny && dex.shiny > 0);
  await (await page.$$('.tabs .chip'))[0].click();  // all
  await pause(200);
  await (await page.$$('.dexcell'))[0].click();
  await pause(250);
  check('dex detail shows a weakness', (await page.$$('.label.tip')).length === 1);

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
