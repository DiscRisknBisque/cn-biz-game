#!/usr/bin/env node
/*
 * tools/test-level-flow.js — drive the level through a real browser.
 *
 *   npm run serve            (in one terminal)
 *   node tools/test-level-flow.js
 *
 * There is no way to run WeChat DevTools headlessly, so this exercises
 * tools/level-harness.html, which renders the same phases from the same
 * engine and the same level data as pages/level. What it proves is the flow
 * and the gating — not the WXML, which still needs one pass in DevTools.
 */
'use strict';

var BASE = process.env.BASE_URL || 'http://localhost:8123';

var chromium;
try { chromium = require('playwright').chromium; }
catch (e) { console.error('playwright is not installed — run `npm install` first.'); process.exit(2); }

function findChromium() {
  var fs = require('fs'), path = require('path');
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
  catch (e) { var exe = findChromium(); if (!exe) throw e; return chromium.launch({ executablePath: exe }); }
}

(async function () {
  var browser = await launch();
  var page = await browser.newPage({ viewport: { width: 760, height: 1100 } });

  var failures = [], errors = [];
  page.on('pageerror', function (e) { errors.push('pageerror: ' + e.message); });
  page.on('console', function (m) { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  function check(name, ok) { if (!ok) failures.push(name); }
  function pause(ms) { return page.waitForTimeout(ms); }
  var st = function () { return page.evaluate(function () { return window.__harness.state(); }); };
  var reset = function () { return page.evaluate(function () { window.__harness.reset(); }); };
  function click(sel) { return page.click(sel); }
  function tapAct(act, id) {
    return page.click('[data-act="' + act + '"]' + (id ? '[data-id="' + id + '"]' : ''));
  }

  await page.goto(BASE + '/tools/level-harness.html');
  await pause(300);

  /* ---- the review gate is visible and cannot be missed ---------------- */

  check('unreviewed legal content shows a banner', (await page.$$('#review')).length === 1);

  /* ---- the loop runs in order ----------------------------------------- */

  check('starts on the scenario', (await st()).phase === 'scenario');
  check('all three characters are introduced', (await page.$$('.person')).length === 3);

  await tapAct('next'); await pause(120);
  check('scenario leads to setup', (await st()).phase === 'setup');
  check('setup offers both money habits', (await page.$$('[data-act="setup"]')).length === 2);

  /* ---- path 1: kept it clean ------------------------------------------ */

  await tapAct('setup', 'setup-separate'); await pause(120);
  var s = await st();
  check('choosing a setup seeds evidence', s.phase === 'evidence' && s.evidenceState.length === 3);
  check('the clean path holds no red-flag evidence', (await page.$$('.ev-red')).length === 0);

  await tapAct('next'); await pause(120);
  check('evidence leads to the risk insight', (await st()).phase === 'risk');
  await tapAct('next'); await pause(120);
  check('risk leads to the decision', (await st()).phase === 'decision');

  check('the clean path locks nothing', (await page.$$('.btn.locked')).length === 0);

  await tapAct('decide', 'branch-a'); await pause(150);
  s = await st();
  check('the strong evidence wins the case', s.outcomeId === 'outcome-a-good');
  check('a good outcome renders as good', (await page.$$('.verdict-good')).length === 1);
  check('the legal basis panel is shown', (await page.$$('.basis-row')).length >= 6);
  check('the reviewed-by state is on screen',
        /pending/i.test(await page.textContent('.basis')));
  check('skills are awarded', (await page.$$('.skill')).length === 2);

  /* ---- path 2: kept it loose ------------------------------------------ */

  await reset(); await pause(120);
  await tapAct('next'); await pause(100);
  await tapAct('setup', 'setup-mixed'); await pause(120);
  s = await st();
  check('the loose path seeds two items', s.evidenceState.length === 2);
  check('the loose path carries a red flag', (await page.$$('.ev-red')).length === 1);

  await tapAct('next'); await pause(100);
  await tapAct('next'); await pause(120);

  var locked = await page.$$('.btn.locked');
  check('the loose path locks exactly one branch', locked.length === 1);
  check('the locked branch is the one needing separation evidence',
        (await page.getAttribute('.btn.locked', 'data-id')) === 'branch-a');

  /* Tapping a locked branch teaches rather than doing nothing. */
  await tapAct('decide', 'branch-a'); await pause(120);
  check('tapping a locked branch explains why', (await page.$$('#locknote')).length === 1);
  check('tapping a locked branch does not resolve the level', (await st()).phase === 'decision');
  check('the hint names what is missing',
        /separate accounts|fund-flow/i.test(await page.textContent('#locknote')));

  await tapAct('decide', 'branch-b'); await pause(150);
  s = await st();
  check('the weak evidence gives the risky outcome', s.outcomeId === 'outcome-b-risky');
  check('a risky outcome renders as risky', (await page.$$('.verdict-risky')).length === 1);

  /* ---- path 3: refuse to engage --------------------------------------- */

  await reset(); await pause(120);
  await tapAct('next'); await pause(100);
  await tapAct('setup', 'setup-mixed'); await pause(120);
  await tapAct('next'); await pause(100);
  await tapAct('next'); await pause(120);
  await tapAct('decide', 'branch-c'); await pause(150);
  s = await st();
  check('arguing it is not your problem loses', s.outcomeId === 'outcome-c-bad');
  check('a bad outcome renders as bad', (await page.$$('.verdict-bad')).length === 1);
  check('the bad outcome still offers a way forward',
        /preventable|worth having/i.test(await page.textContent('.card.hook')));

  /* ---- stepping back clears the choice it depended on ------------------ */

  await reset(); await pause(120);
  await tapAct('next'); await pause(100);
  await tapAct('setup', 'setup-separate'); await pause(120);
  await click('[data-act="back"]'); await pause(120);
  s = await st();
  check('going back from evidence clears the setup choice',
        s.phase === 'setup' && s.setupBranchId === null && s.evidenceState.length === 0);

  /* ---- nothing anywhere computes or mentions tax ----------------------- */

  var text = await page.evaluate(function () { return document.body.innerText; });
  check('no tax content leaks into the level', !/\btax\b/i.test(text));

  await browser.close();

  if (failures.length) {
    console.log('FAILED (' + failures.length + '):');
    failures.forEach(function (f) { console.log('  - ' + f); });
  } else {
    console.log('All level-flow checks passed.');
  }
  if (errors.length) {
    console.log('Runtime errors:');
    errors.forEach(function (e) { console.log('  - ' + e); });
  }
  process.exit(failures.length || errors.length ? 1 : 0);
})().catch(function (e) {
  console.error('level-flow run failed: ' + e.message);
  process.exit(1);
});
