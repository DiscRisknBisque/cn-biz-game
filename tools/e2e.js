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
var ACCOUNT_KEY = 'cnbizgame.account.v1';

/* A signed-in account, so the tests that are not about sign-in can skip it. */
var ACCOUNT = {
  method: 'phone', identifier: '13800138000', masked: '138****8000',
  profile: { name: '测试用户', gender: 'private', age: 30, nationality: 'CN' },
  consent: { privacy: true, guardian: false, at: '2026-08-01T00:00:00.000Z' },
  createdAt: '2026-08-01T00:00:00.000Z'
};

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
  function seedAccount() { return page.evaluate(function (a) { localStorage.setItem(a[0], a[1]); }, [ACCOUNT_KEY, JSON.stringify(ACCOUNT)]); }
  function readAccount() { return page.evaluate(function (k) { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }, ACCOUNT_KEY); }
  function fill(sel, value) { return page.fill(sel, value); }
  function readSave() { return page.evaluate(function (k) { return JSON.parse(localStorage.getItem(k)); }, SAVE_KEY); }
  function labels() { return page.$$eval('.btn', function (els) { return els.map(function (e) { return e.textContent.trim(); }); }); }
  function clickLabel(re) {
    return page.evaluate(function (src) {
      var b = [].slice.call(document.querySelectorAll('.btn')).find(function (x) { return new RegExp(src).test(x.textContent); });
      if (b) b.click();
    }, re.source);
  }
  function pause(ms) { return page.waitForTimeout(ms); }

  /* ---- legacy saves migrate rather than being discarded ----------------- */

  await page.goto(BASE + '/index.html');
  await seed(LEGACY_SAVE);
  await seedAccount();
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

  await page.evaluate(function (a) { a.forEach(function (k) { localStorage.removeItem(k); }); },
                      [SAVE_KEY, ACCOUNT_KEY]);
  await page.goto(BASE + '/index.html');
  await pause(250);
  await page.click('.btn.primary');             // START -> risk notice
  await pause(250);
  check('a first run is shown the risk notice before anything else',
        (await page.$$('.risklist')).length === 1);
  check('the risk notice lists every category',
        (await page.$$('.risklist .riskline')).length === 5);
  await page.click('.btn.primary');             // acknowledge -> sign in
  await pause(250);
  check('acknowledging the notice is remembered',
        (await readSave()).ackRisk === true);

  /* ---- sign-in ---------------------------------------------------------- */

  check('sign-in offers three methods', (await page.$$('.tabs .chip')).length === 3);
  check('sign-in is labelled as a demo', (await page.$$('.panel.demo')).length === 1);
  check('the consent box starts unticked',
        (await page.$eval('.checkrow input', function (e) { return e.checked; })) === false);

  /* WeChat is a documented stub, not a working login. It also needs consent
     before it will do anything at all. */
  await (await page.$$('.tabs .chip'))[2].click();
  await pause(200);
  await page.click('.btn.primary');             // without consent
  await pause(200);
  check('WeChat sign-in is blocked without consent', (await page.$$('.needs li')).length === 0);

  await page.click('.checkrow input');          // tick
  await page.click('.btn.primary');
  await pause(200);
  check('WeChat sign-in explains what a real one needs', (await page.$$('.needs li')).length >= 3);
  check('WeChat stub does not create an account', (await readAccount()) === null);

  /* Consent is about the privacy notice, not the method, so it survives a tab
     switch — untick it deliberately to test the phone path from scratch. */
  await (await page.$$('.tabs .chip'))[0].click();
  await pause(200);
  check('consent carries across a method switch',
        (await page.$eval('.checkrow input', function (e) { return e.checked; })) === true);
  await page.click('.checkrow input');          // untick
  check('consent can be withdrawn',
        (await page.$eval('.checkrow input', function (e) { return e.checked; })) === false);

  /* Bad input is rejected before any code is sent. */
  await fill('.input', 'not-a-phone');
  await clickLabel(/获取验证码|Send code/);
  await pause(200);
  check('an invalid phone number is rejected', (await page.$$('.ferr')).length === 1);

  /* Consent is required even with a valid code. */
  await fill('.input', '13800138000');
  await clickLabel(/获取验证码|Send code/);
  await pause(250);
  check('a demo code is shown', (await page.$$('.democode .code')).length === 1);
  var demoCode = (await page.textContent('.democode .code')).trim();

  var inputs = await page.$$('.input');
  await inputs[1].fill(demoCode);
  await page.click('.btn.primary');             // verify without consent
  await pause(200);
  check('sign-in is blocked without consent', (await readAccount()) === null);

  await page.click('.checkrow input');          // tick
  await page.click('.btn.primary');             // verify -> profile
  await pause(250);
  var acct = await readAccount();
  check('a verified code creates the account', acct && acct.method === 'phone');
  check('the identifier is stored masked for display', acct.masked.indexOf('****') > 0);
  check('consent is recorded with a timestamp', acct.consent.privacy === true && !!acct.consent.at);

  /* ---- profile ---------------------------------------------------------- */

  check('the profile form asks for all four fields', (await page.$$('.fieldrow')).length === 4);

  /* Under 14 triggers the guardian-consent requirement. */
  var pInputs = await page.$$('.fieldrow input');
  await pInputs[0].fill('测试用户');
  await pInputs[1].fill('12');
  await page.click('.btn.primary');
  await pause(250);
  check('an under-14 age asks for guardian consent', (await page.$$('.checkrow')).length === 1);
  check('an under-14 profile is not saved without it', (await readAccount()).profile === null);

  /* Revealing the guardian block re-rendered the form, so re-query. */
  pInputs = await page.$$('.fieldrow input');
  await pInputs[1].fill('30');
  await page.click('.btn.primary');             // save -> title
  await pause(250);
  var withProfile = await readAccount();
  check('the profile saves', withProfile.profile && withProfile.profile.age === 30);
  check('nationality defaults are stored', !!withProfile.profile.nationality);
  check('the title screen greets the signed-in player', (await page.$$('.whoami')).length === 1);

  await page.click('.btn.primary');             // START -> hero picker
  await pause(200);
  await page.click('.btn.primary');             // confirm -> route select
  await pause(250);

  for (var ci = 0; ci < campaigns.length; ci++) {
    var id = campaigns[ci];

    if (ci > 0) {
      await clickLabel(/换条路线|SWITCH ROUTE/);
      await pause(250);
    }
    await (await page.$$('.route'))[ci].click();
    await pause(250);

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

  /* ---- music ------------------------------------------------------------- */

  await page.goto(BASE + '/index.html');
  await pause(250);

  /* Count oscillators as they are created. SFX make a handful per click; the
     music scheduler makes a steady stream with no interaction at all, so
     growth during a quiet second can only have come from the soundtrack. */
  await page.evaluate(function () {
    window.__osc = 0;
    var proto = (window.AudioContext || window.webkitAudioContext).prototype;
    var orig = proto.createOscillator;
    proto.createOscillator = function () { window.__osc++; return orig.call(this); };
  });

  check('the title screen asks for the title theme',
        (await page.evaluate(function () { return window.Music.current(); })) === 'title');

  await page.click('.logo');                    // a gesture, to unlock audio
  await pause(200);
  var before = await page.evaluate(function () { return window.__osc; });
  await pause(900);                             // no interaction at all
  var after = await page.evaluate(function () { return window.__osc; });
  check('music keeps scheduling notes on its own (' + before + ' -> ' + after + ')', after > before + 4);

  /* Turning it off has to actually stop it, not just change the glyph. */
  var chips = await page.$$('.topbar .chip');
  await chips[2].click();                       // music toggle
  await pause(300);
  var q0 = await page.evaluate(function () { return window.__osc; });
  await pause(700);
  var q1 = await page.evaluate(function () { return window.__osc; });
  check('muting music stops the scheduler (' + q0 + ' -> ' + q1 + ')', q1 === q0);
  check('the music setting is saved', (await readSave()).music === false);

  await (await page.$$('.topbar .chip'))[2].click();   // back on
  await pause(400);
  check('unmuting starts it again',
        (await page.evaluate(function () { return window.__osc; })) > q1);

  /* Each area has its own theme. Seed a known state rather than clicking
     through, so this section does not depend on where the previous one left
     the save. */
  await seedAccount();
  await seed({ lang: 'zh', sound: true, music: true, hero: 'hero1',
               started: true, ackRisk: true, campaign: null, runs: {}, dex: {}, shiny: {} });
  await page.goto(BASE + '/index.html');
  await pause(250);
  await clickLabel(/开始游戏|START/);            // -> route select
  await pause(250);
  await (await page.$$('.route'))[0].click();   // -> map
  await pause(250);
  check('the map has its own theme',
        (await page.evaluate(function () { return window.Music.current(); })) === 'map');

  await (await page.$$('.node'))[0].click();    // chapter 1
  await pause(250);
  check('scenes switch to the quieter theme',
        (await page.evaluate(function () { return window.Music.current(); })) === 'scene');

  /* ---- the fail sting ---------------------------------------------------- */

  await page.goto(BASE + '/index.html');
  await pause(250);
  await page.click('.logo');                    // gesture, so audio may start
  await pause(600);                             // give the sample time to fetch

  check('the fail sample loads',
        (await page.evaluate(function () { return window.Sound.sampleReady('fail'); })) === true);

  /* Playing it should use the buffer, not the synthesised stand-in, and should
     pull the music down underneath it. */
  var sting = await page.evaluate(async function () {
    var proto = (window.AudioContext || window.webkitAudioContext).prototype;
    var buffers = 0, oscs = 0;
    var ob = proto.createBufferSource, oo = proto.createOscillator;
    proto.createBufferSource = function () { buffers++; return ob.call(this); };
    proto.createOscillator = function () { oscs++; return oo.call(this); };

    window.Music.play('map');
    await new Promise(function (r) { setTimeout(r, 120); });
    var before = oscs;

    window.Sound.play('fail');
    await new Promise(function (r) { setTimeout(r, 200); });

    proto.createBufferSource = ob;
    proto.createOscillator = oo;
    return { buffers: buffers, oscsDuringSting: oscs - before };
  });
  check('the sting plays the sample rather than the synth fallback', sting.buffers >= 1);

  /* With the file unreachable it must still make a noise, not fall silent. */
  var fellBack = await page.evaluate(async function () {
    window.Sound.play('__reset__');
    var proto = (window.AudioContext || window.webkitAudioContext).prototype;
    var oscs = 0;
    var oo = proto.createOscillator;
    proto.createOscillator = function () { oscs++; return oo.call(this); };
    /* Simulate a sample that never arrived, the way file:// leaves it. */
    window.Sound.play('gameover');
    await new Promise(function (r) { setTimeout(r, 150); });
    proto.createOscillator = oo;
    return oscs;
  });
  check('the synthesised fallback still makes a sound', fellBack > 0);

  /* Muting silences the sting too. */
  var mutedBuffers = await page.evaluate(async function () {
    window.Sound.setEnabled(false);
    var proto = (window.AudioContext || window.webkitAudioContext).prototype;
    var buffers = 0;
    var ob = proto.createBufferSource;
    proto.createBufferSource = function () { buffers++; return ob.call(this); };
    window.Sound.play('fail');
    await new Promise(function (r) { setTimeout(r, 150); });
    proto.createBufferSource = ob;
    window.Sound.setEnabled(true);
    return buffers;
  });
  check('muting sound effects silences the sting', mutedBuffers === 0);

  /* ---- account management ------------------------------------------------ */

  await page.goto(BASE + '/index.html');
  await pause(250);
  await clickLabel(/我的账号|MY ACCOUNT/);
  await pause(250);
  check('the account screen shows the stored details', (await page.$$('.breakdown .row')).length === 5);

  page.once('dialog', function (d) { d.accept(); });   // also delete progress
  await clickLabel(/注销账号|DELETE ACCOUNT/);
  await pause(300);
  check('deleting the account really erases it', (await readAccount()) === null);
  check('deleting with confirmation also clears the save', (await readSave()) === null);

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
  if (e.stack) console.error(e.stack.split('\n').slice(0, 8).join('\n'));
  process.exit(1);
});
