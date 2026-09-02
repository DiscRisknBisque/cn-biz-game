/*
 * cutscene-foreign.js — 《落地中国》 opening for the foreigner route.
 *
 * One interface: mount(host, opts). The shots, skip rule, first-play vs
 * replay, and the three light interacts all sit behind that call. game.js
 * only has to show the host and go to the map when onDone fires.
 *
 * mode: 'full' ~45s with optional interacts; 'fast' ~7s montage;
 * 'reduced' jumps to the last choice (or finishes if skip is used).
 */
(function (root) {
  'use strict';

  var COPY = {
    skip: { zh: '跳过', en: 'SKIP' },
    s01a: { zh: '你带着一个点子，', en: 'You brought one idea,' },
    s01b: { zh: '跨过了半个地球。', en: 'across half the world.' },
    s02t: { zh: '第一章：落地中国', en: 'Ch.1 Landing in China' },
    s02s: { zh: '新地图已解锁', en: 'New map unlocked' },
    s02sign: { zh: '国际到达', en: 'ARRIVALS' },
    s03a: { zh: '来到一座城市，', en: 'To reach a city,' },
    s03b: { zh: '只需要一张机票。', en: 'you only need a ticket.' },
    s03c: { zh: '进入一个市场，', en: 'To enter a market,' },
    s03d: { zh: '需要四把钥匙。', en: 'you need four keys.' },
    s03nudge: { zh: '别急着盖章！', en: 'Do not stamp yet!' },
    k1: { zh: '市场准入', en: 'Market access' },
    k2: { zh: '公司设立', en: 'Company setup' },
    k3: { zh: '跨境资金', en: 'Cross-border funds' },
    k4: { zh: '工作身份', en: 'Work status' },
    s04t: { zh: '第一关｜你的生意能不能做？', en: 'Gate 1 · May you even do this?' },
    s04a: { zh: '先检查准入，', en: 'Check the list first,' },
    s04b: { zh: '再讨论怎么注册。', en: 'then talk registration.' },
    s04list: { zh: '外资准入负面清单', en: 'Negative list' },
    s05a: { zh: '城市决定你的起点。', en: 'The city is your start.' },
    s05b: { zh: '结构决定谁和你一起走。', en: 'The form is who walks with you.' },
    s05wfoe: { zh: '外商独资', en: 'WFOE' },
    s05jv: { zh: '中外合资', en: 'Joint venture' },
    s05acq: { zh: '投资或收购', en: 'Buy-in' },
    s06a: { zh: '注册资本不是愿望。', en: 'Capital is not a wish.' },
    s06b: { zh: '是股东需要兑现的承诺。', en: 'It is a promise you must keep.' },
    s06lab: { zh: '注册资本', en: 'Registered capital' },
    s07a: { zh: '营业执照　+1', en: 'Licence  +1' },
    s07b: { zh: '企业身份　已解锁', en: 'Company status  unlocked' },
    s07c: { zh: '外商投资信息报告：已提交', en: 'FIE information report: filed' },
    s08a: { zh: '公司成立。', en: 'The company exists.' },
    s08b: { zh: '公章获得　+1', en: 'Company chop  +1' },
    s08c: { zh: '法律责任　+1', en: 'Legal duty  +1' },
    s09a: { zh: '钱跨境，', en: 'Money at the border' },
    s09b: { zh: '比人多一道检查。', en: 'faces one more check.' },
    s09c: { zh: '第一笔资本金到账', en: 'First capital landed' },
    s09b1: { zh: '银行开户', en: 'Bank account' },
    s09b2: { zh: 'FDI登记', en: 'FDI filing' },
    s09b3: { zh: '资金入账', en: 'Inward remittance' },
    s10a: { zh: '公司成立，', en: 'The company is real.' },
    s10b: { zh: '不等于你已经取得在华工作身份。', en: 'That is not your work status.' },
    s10c: { zh: '企业身份：有效', en: 'Company: valid' },
    s10d: { zh: '个人工作身份：待办理', en: 'Your work status: pending' },
    s11a: { zh: '收入、现金流和税期，', en: 'Revenue, cash, tax dates:' },
    s11b: { zh: '是三条不同的血槽。', en: 'three different bars.' },
    s11c: { zh: '一条都不能空。', en: 'None of them may sit empty.' },
    s11r: { zh: '收入', en: 'Revenue' },
    s11k: { zh: '现金流', en: 'Cash' },
    s11x: { zh: '税期', en: 'Tax date' },
    s12a: { zh: '从一张桌子，', en: 'From one desk' },
    s12b: { zh: '到一座总部。', en: 'to a headquarters.' },
    s12c: { zh: '路上没有野怪。', en: 'No wild monsters on the road.' },
    s12d: { zh: '只有合同、现金流和人心。', en: 'Only contracts, cash, and people.' },
    s13a: { zh: '我给你一千万。', en: 'I will give you ten million.' },
    s13b: { zh: '只要60%的股权，', en: 'For 60% of the shares,' },
    s13c: { zh: '再加董事会控制权。', en: 'and the board.' },
    s13d: { zh: '你要钱，', en: 'Do you want the money,' },
    s13e: { zh: '还是要公司？', en: 'or the company?' },
    s14a: { zh: '你的第一场战斗，', en: 'Your first fight' },
    s14b: { zh: '不在法庭。', en: 'is not in court.' },
    s14c: { zh: '就在合同落章之前。', en: 'It is before the chop falls.' },
    s14t: { zh: '任务01：让公司活过第一年', en: 'Quest 01: survive year one' },
    s14s: { zh: '同时，别把公司弄丢。', en: 'And do not lose the company.' },
    s14A: { zh: 'A｜立即盖章，先拿到钱', en: 'A · Stamp now, take the cash' },
    s14B: { zh: 'B｜审查股权与控制权条款', en: 'B · Read the control clauses' },
    s14C: { zh: 'C｜重新谈判投资结构', en: 'C · Renegotiate the deal' },
    hint: {
      zh: '本段是创业流程地图，不是全国统一清单。准入、登记、外汇、税务和工作居留因行业、城市和结构而不同。',
      en: 'This is a map of the process, not a national checklist. Access, filing, FX, tax and work status move with industry, city and structure.'
    }
  };

  var CITIES = [
    { id: 'beijing', zh: '北京', en: 'Beijing' },
    { id: 'shanghai', zh: '上海', en: 'Shanghai' },
    { id: 'shenzhen', zh: '深圳', en: 'Shenzhen' }
  ];

  function tx(key, lang) {
    var o = COPY[key];
    if (!o) return key;
    return o[lang] != null ? o[lang] : o.zh;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function HERO_SUIT(id) {
    return ({ hero1: 'hero1suit', hero2: 'hero2suit', hero3: 'hero3suit' })[id] || 'hero1suit';
  }

  /* ------------------------------------------------------------------ shots */

  function shotEarth(stage, api) {
    var cv = document.createElement('canvas');
    cv.width = 180;
    cv.height = 180;
    cv.className = 'cs-earth';
    stage.appendChild(cv);
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    var t0 = Date.now();
    var id = 0;
    api.Sound.play('appear');
    function tick() {
      var t = (Date.now() - t0) / 2500;
      ctx.clearRect(0, 0, 180, 180);
      if (t > 0.16) {
        var r = Math.min(48, Math.floor((t - 0.16) * 80));
        ctx.fillStyle = '#3f86cf';
        for (var y = -r; y <= r; y += 3) {
          for (var x = -r; x <= r; x += 3) {
            if (x * x + y * y <= r * r) ctx.fillRect(90 + x, 90 + y, 3, 3);
          }
        }
        if (t > 0.55) {
          ctx.fillStyle = '#e2574c';
          ctx.fillRect(108, 78, 6, 6);
          ctx.fillStyle = '#f7d94f';
          ctx.fillRect(111, 81, 3, 3);
        }
      }
      if (t > 0.28) {
        var u = Math.min(1, (t - 0.28) / 0.55);
        var px = 28 + u * 92;
        var py = 140 - Math.sin(u * Math.PI) * 70;
        ctx.fillStyle = '#ffffff';
        for (var i = 0; i < 8; i++) {
          var uu = u - i * 0.04;
          if (uu < 0) continue;
          ctx.fillRect(28 + uu * 92, 140 - Math.sin(uu * Math.PI) * 70, 2, 2);
        }
        ctx.fillStyle = '#cfd6e6';
        ctx.fillRect(px, py, 8, 3);
        ctx.fillStyle = '#e2574c';
        ctx.fillRect(px + 6, py - 2, 2, 2);
      }
      if (t < 1) id = requestAnimationFrame(tick);
    }
    tick();
    api.say(['s01a', 's01b']);
    api.onKill(function () { cancelAnimationFrame(id); });
  }

  function shotArrive(stage, api) {
    api.Sound.play('ding');
    var hall = el('div', 'cs-hall');
    hall.appendChild(el('div', 'cs-sign mono', 'ARRIVALS'));
    hall.appendChild(el('div', 'cs-sign-sub', tx('s02sign', api.lang)));
    hall.appendChild(api.sprite('arrivals', 8));
    var walk = el('div', 'cs-walk');
    var a = api.traveler(0, 4);
    a.classList.add('step', 'step-a');
    var b = api.traveler(1, 4);
    b.classList.add('step', 'step-b');
    walk.appendChild(a);
    walk.appendChild(b);
    hall.appendChild(walk);
    stage.appendChild(hall);
    var title = el('div', 'cs-chapter');
    title.appendChild(el('div', 'cs-chapter-t', tx('s02t', api.lang)));
    title.appendChild(el('div', 'cs-chapter-s', tx('s02s', api.lang)));
    stage.appendChild(title);
  }

  function shotDoors(stage, api) {
    var row = el('div', 'cs-doors');
    ['k1', 'k2', 'k3', 'k4'].forEach(function (k, i) {
      var d = el('div', 'cs-door');
      d.style.animationDelay = (0.15 * i) + 's';
      d.appendChild(el('div', 'cs-lock', '🔒'));
      d.appendChild(el('div', 'cs-door-lab', tx(k, api.lang)));
      row.appendChild(d);
      api.later(150 * i, function () { api.Sound.play('door'); });
    });
    stage.appendChild(row);
    var cast = el('div', 'cs-cast');
    cast.appendChild(api.sprite(HERO_SUIT(api.hero), 5));
    var chop = api.sprite('chop', 3);
    chop.className += ' cs-chop-jump';
    cast.appendChild(chop);
    stage.appendChild(cast);
    var plate = el('div', 'cs-plate', tx('s03nudge', api.lang));
    stage.appendChild(plate);
    api.say(['s03a', 's03b']);
    api.later(1400, function () { api.say(['s03c', 's03d']); });
  }

  function shotAccess(stage, api) {
    stage.appendChild(el('div', 'cs-gate-title mono', tx('s04list', api.lang)));
    var gate = el('div', 'cs-gate');
    gate.appendChild(api.sprite('neglist', 5));
    var scan = el('div', 'cs-scan');
    scan.appendChild(api.sprite('data', 4));
    gate.appendChild(scan);
    stage.appendChild(gate);
    api.later(800, function () {
      scan.classList.add('pass');
      api.Sound.play('good');
    });
    api.say(['s04t']);
    api.later(1600, function () { api.say(['s04a', 's04b']); });
  }

  function shotCity(stage, api) {
    var map = el('div', 'cs-map');
    CITIES.forEach(function (c, i) {
      var n = el('button', 'cs-city', (api.lang === 'en' ? c.en : c.zh));
      n.style.animationDelay = (0.1 * i) + 's';
      n.onclick = function () {
        api.result.city = c.id;
        api.Sound.play('select');
        api.advance();
      };
      map.appendChild(n);
    });
    stage.appendChild(map);
    var cards = el('div', 'cs-cards');
    ['s05wfoe', 's05jv', 's05acq'].forEach(function (k) {
      cards.appendChild(el('div', 'cs-card', tx(k, api.lang)));
    });
    stage.appendChild(cards);
    api.say(['s05a', 's05b']);
  }

  function shotCapital(stage, api) {
    var box = el('div', 'cs-capital');
    box.appendChild(el('div', 'cs-label', tx('s06lab', api.lang)));
    var num = el('div', 'cs-num mono', '¥100,000,000');
    box.appendChild(num);
    var range = document.createElement('input');
    range.type = 'range';
    range.min = '100000';
    range.max = '100000000';
    range.step = '100000';
    range.value = '100000000';
    range.className = 'cs-slider';
    range.oninput = function () {
      api.result.capital = parseInt(range.value, 10);
      num.textContent = '¥' + api.result.capital.toLocaleString('en-US');
    };
    box.appendChild(range);
    stage.appendChild(box);
    var cast = el('div', 'cs-cast');
    cast.appendChild(api.sprite(HERO_SUIT(api.hero), 5));
    cast.appendChild(api.sprite('chop', 3));
    stage.appendChild(cast);
    api.say(['s06a']);
    api.later(1200, function () {
      range.value = '1000000';
      range.oninput();
      api.Sound.play('blip');
      api.say(['s06b']);
    });
  }

  function shotRegister(stage, api) {
    var cards = el('div', 'cs-feed');
    var items = api.lang === 'zh'
      ? ['名称', '住所', '注册资本', '经营范围', '法定代表人']
      : ['Name', 'Domicile', 'Capital', 'Scope', 'Legal rep'];
    items.forEach(function (lab, i) {
      var c = el('div', 'cs-feed-card', lab);
      c.style.animationDelay = (0.18 * i) + 's';
      cards.appendChild(c);
      api.later(180 * i, function () { api.Sound.play('blip'); });
    });
    stage.appendChild(cards);
    api.later(1200, function () {
      stage.appendChild(api.sprite('license', 6));
      api.Sound.play('ding');
    });
    api.say(['s07a', 's07b']);
    api.later(2200, function () { api.say(['s07c']); });
  }

  function shotChop(stage, api) {
    var wrap = el('div', 'cs-chop-rise');
    wrap.appendChild(api.sprite('chop', 8));
    stage.appendChild(wrap);
    api.say(['s08a']);
    api.later(900, function () {
      api.Sound.play('stamp');
      wrap.classList.add('stamp');
      api.say(['s08b', 's08c']);
    });
  }

  function shotFunds(stage, api) {
    var gates = el('div', 'cs-mini-gates');
    ['s09b1', 's09b2', 's09b3'].forEach(function (k, i) {
      var g = el('div', 'cs-mini', tx(k, api.lang));
      g.style.animationDelay = (0.35 * i) + 's';
      gates.appendChild(g);
      api.later(350 * i, function () { api.Sound.play('door'); });
    });
    stage.appendChild(gates);
    stage.appendChild(api.sprite('fx', 6));
    var bar = el('div', 'cs-hp');
    var fill = el('i');
    bar.appendChild(fill);
    stage.appendChild(bar);
    api.later(1400, function () {
      fill.style.width = '72%';
      api.Sound.play('coin');
    });
    api.later(2200, function () {
      fill.style.width = '38%';
      api.Sound.play('bad');
    });
    api.say(['s09a', 's09b']);
    api.later(1800, function () { api.say(['s09c']); });
  }

  function shotStatus(stage, api) {
    var panel = el('div', 'cs-status');
    panel.appendChild(el('div', 'cs-ok', tx('s10c', api.lang)));
    panel.appendChild(el('div', 'cs-bad', tx('s10d', api.lang)));
    stage.appendChild(panel);
    var cards = el('div', 'cs-cast');
    cards.appendChild(api.sprite('visa', 4));
    cards.appendChild(api.sprite('labor', 4));
    cards.appendChild(api.sprite(HERO_SUIT(api.hero), 5));
    stage.appendChild(cards);
    api.say(['s10a', 's10b']);
    api.Sound.play('appear');
  }

  function shotBars(stage, api) {
    function bar(lab, cls, w) {
      var row = el('div', 'cs-bar-row');
      row.appendChild(el('span', null, tx(lab, api.lang)));
      var b = el('div', 'cs-hp ' + cls);
      var i = el('i');
      i.style.width = w;
      b.appendChild(i);
      row.appendChild(b);
      return row;
    }
    stage.appendChild(bar('s11r', 'rev', '82%'));
    stage.appendChild(bar('s11k', 'cash', '40%'));
    stage.appendChild(bar('s11x', 'tax', '18%'));
    api.say(['s11a', 's11b']);
    api.later(1800, function () { api.say(['s11c']); api.Sound.play('good'); });
  }

  function shotPoster(stage, api) {
    var scene = el('div', 'cs-poster');
    scene.appendChild(api.sprite('garage', 7));
    var cast = el('div', 'cs-poster-cast');
    cast.appendChild(api.sprite('chop', 4));
    cast.appendChild(api.sprite(HERO_SUIT(api.hero), 6));
    cast.appendChild(api.sprite('license', 4));
    scene.appendChild(cast);
    var road = el('div', 'cs-road');
    for (var i = 0; i < 3; i++) {
      var coin = api.sprite('icoCash', 3);
      coin.style.animationDelay = (0.25 * i) + 's';
      road.appendChild(coin);
    }
    scene.appendChild(road);
    var line = el('div', 'cs-growth');
    scene.appendChild(line);
    stage.appendChild(scene);
    api.say(['s12a', 's12b']);
    api.later(1600, function () { api.say(['s12c']); });
    api.later(2400, function () { api.say(['s12d']); });
  }

  function shotBoss(stage, api) {
    var sky = el('div', 'cs-sky');
    sky.appendChild(api.sprite('capitaldragon', 7));
    stage.appendChild(sky);
    api.Sound.play('appear');
    api.say(['s13a']);
    api.later(900, function () { api.say(['s13b', 's13c']); });
    api.later(2200, function () { api.say(['s13d', 's13e']); api.Sound.play('bad'); });
  }

  function shotChoice(stage, api) {
    stage.appendChild(el('div', 'cs-quest', tx('s14t', api.lang)));
    stage.appendChild(el('div', 'cs-quest-s', tx('s14s', api.lang)));
    var list = el('div', 'cs-choices');
    [
      ['A', 's14A', 'stamp'],
      ['B', 's14B', 'select'],
      ['C', 's14C', 'blip']
    ].forEach(function (row) {
      var b = el('button', 'btn choice' + (row[0] === 'A' ? ' punchy' : ''), tx(row[1], api.lang));
      b.onclick = function () {
        api.result.deal = row[0];
        api.Sound.play(row[2]);
        api.advance();
      };
      list.appendChild(b);
    });
    stage.appendChild(list);
    stage.appendChild(el('p', 'cs-hint', tx('hint', api.lang)));
    api.say(['s14a', 's14b']);
    api.later(900, function () { api.say(['s14c']); });
  }

  var FULL = [
    { dur: 2500, enter: shotEarth },
    { dur: 3000, enter: shotArrive },
    { dur: 3000, enter: shotDoors },
    { dur: 3000, enter: shotAccess },
    { dur: 3000, enter: shotCity, wait: true },
    { dur: 3500, enter: shotCapital },
    { dur: 4000, enter: shotRegister },
    { dur: 2500, enter: shotChop },
    { dur: 3500, enter: shotFunds },
    { dur: 3000, enter: shotStatus },
    { dur: 3000, enter: shotBars },
    { dur: 3500, enter: shotPoster },
    { dur: 4500, enter: shotBoss },
    { dur: 0, enter: shotChoice, wait: true }
  ];

  var FAST = [
    { dur: 900, enter: shotEarth },
    { dur: 900, enter: shotDoors },
    { dur: 900, enter: shotRegister },
    { dur: 900, enter: shotChop },
    { dur: 900, enter: shotFunds },
    { dur: 800, enter: shotPoster },
    { dur: 900, enter: shotBoss }
  ];

  /* ------------------------------------------------------------------ player */

  function mount(host, opts) {
    opts = opts || {};
    var lang = opts.lang || 'zh';
    var mode = opts.mode || 'full';
    var shots = mode === 'fast' ? FAST : FULL;
    if (mode === 'reduced') shots = [FULL[FULL.length - 1]];
    var Pixel = opts.Pixel || root.Pixel;
    var Sound = opts.Sound || root.Sound;
    var skipAfter = opts.skipAfter != null ? opts.skipAfter : 3;
    var result = { city: 'shanghai', capital: 1000000, deal: 'B', skipped: false };
    var killed = [];
    var shotTimers = [];
    var skipTimer = null;
    var idx = 0;
    var done = false;
    var shotClosed = false;

    host.classList.add('cutscene');
    var skip = el('button', 'btn cutscene-skip', tx('skip', lang));
    skip.type = 'button';
    skip.disabled = skipAfter > 0;
    var stage = el('div', 'cutscene-stage');
    var cap = el('div', 'cutscene-caption');
    host.appendChild(skip);
    host.appendChild(stage);
    host.appendChild(cap);

    function later(ms, fn) {
      shotTimers.push(setTimeout(fn, ms));
    }

    function killShot() {
      shotTimers.forEach(clearTimeout);
      shotTimers = [];
      killed.forEach(function (fn) { try { fn(); } catch (e) { /* shot teardown */ } });
      killed = [];
    }

    function finish(skipped) {
      if (done) return;
      done = true;
      killShot();
      if (skipTimer) clearTimeout(skipTimer);
      if (skipped) result.skipped = true;
      if (opts.onDone) opts.onDone(result);
    }

    skip.onclick = function () {
      Sound.play('select');
      finish(true);
    };
    if (skipAfter > 0) {
      skipTimer = setTimeout(function () { skip.disabled = false; }, skipAfter * 1000);
    } else {
      skip.disabled = false;
    }

    var api = {
      lang: lang,
      hero: opts.hero || 'hero1',
      Sound: Sound,
      result: result,
      later: later,
      onKill: function (fn) { killed.push(fn); },
      sprite: function (name, scale) { return Pixel.el(name, scale || 6); },
      traveler: function (frame, scale) { return Pixel.elTraveler(api.hero, frame, scale || 4); },
      say: function (keys) {
        cap.innerHTML = '';
        keys.forEach(function (k) {
          cap.appendChild(el('p', null, tx(k, lang)));
        });
      },
      advance: function () { goNext(); }
    };

    function goNext() {
      if (shotClosed || done) return;
      shotClosed = true;
      play(idx + 1);
    }

    function play(i) {
      if (done) return;
      killShot();
      idx = i;
      shotClosed = false;
      if (i >= shots.length) { finish(false); return; }
      stage.innerHTML = '';
      cap.innerHTML = '';
      var s = shots[i];
      s.enter(stage, api);
      if (s.wait && !s.dur) return;
      later(s.dur || 0, goNext);
    }

    play(0);
    return { skip: function () { finish(true); } };
  }

  root.CutsceneForeign = { mount: mount };
})(typeof self !== 'undefined' ? self : this);
