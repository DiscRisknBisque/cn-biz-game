/*
 * game.js — state machine and rendering.
 *
 * There is one view element; every state change rebuilds it. The game is small
 * enough that re-rendering wholesale is simpler, and cheaper to reason about,
 * than keeping a diff of the DOM in sync with the save file.
 *
 * Two campaigns share this engine. Progress is tracked per route; the dex is
 * shared, numbered continuously across both.
 */
(function (global) {
  'use strict';

  var C = global.Content;
  var B = global.Balance;
  var Pixel = global.Pixel;
  var Sound = global.Sound;

  var SAVE_KEY = 'cnbizgame.save.v1';

  /* ------------------------------------------------------------------ state */

  function freshRun() {
    return {
      unlocked: 0,          // index of the next chapter that may be played
      cleared: {},          // chapter id -> points scored
      bossHp: 100,
      bossDone: false,
      finished: false,
      stats: Object.assign({}, B.START)
    };
  }

  function freshLevels() {
    var unlocked = {};
    if (C.LEVELS && C.LEVELS[0]) unlocked[C.LEVELS[0].id] = true;
    return { unlocked: unlocked, cleared: {} };
  }

  function freshState() {
    return {
      /* The game is Chinese-first by design; the toggle is one tap away. */
      lang: 'zh',
      sound: true,
      hero: 'hero1',
      started: false,
      ackRisk: false,       // has the risk notice been read at least once
      campaign: null,       // null until a route is picked
      runs: {},             // campaign id -> run
      levels: freshLevels(), // single-round levels: unlocks and outcomes
      dex: {},              // dex id -> 'seen' | 'caught'
      shiny: {}             // dex id -> true, earned by a flawless chapter
    };
  }

  var LIMITS = B.LIMITS;

  var state = freshState();

  /* Transient per-screen data that should never be persisted. */
  var view = {
    screen: 'title', chapter: null, sceneIdx: 0,
    picked: null, applied: null, runPoints: 0, settlement: null,
    level: null, evidenceState: null, setupBranch: null, outcome: null,
    battleState: null, battleFeedback: null, battleResult: null
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      var s = JSON.parse(raw);
      if (!s) return false;

      var base = freshState();
      Object.keys(base).forEach(function (k) { if (k in s) base[k] = s[k]; });

      /* Saves from before the second route kept a single run at the top level.
         Fold it into the foreign route rather than dropping someone's progress. */
      var migrated = false;
      if (!s.runs && s.stats) {
        migrated = true;
        base.runs = {
          foreign: {
            unlocked: s.unlocked || 0,
            cleared: s.cleared || {},
            bossHp: typeof s.bossHp === 'number' ? s.bossHp : 100,
            bossDone: !!s.bossDone,
            finished: !!s.finished,
            stats: Object.assign({}, B.START, s.stats)
          }
        };
        base.campaign = 'foreign';
      }

      /* Fill in anything a partial or hand-edited save left out. */
      Object.keys(base.runs).forEach(function (id) {
        base.runs[id] = Object.assign(freshRun(), base.runs[id]);
        base.runs[id].stats = Object.assign({}, B.START, base.runs[id].stats);
      });
      base.levels = Object.assign(freshLevels(), base.levels || {});
      base.levels.unlocked = Object.assign(freshLevels().unlocked, base.levels.unlocked || {});
      base.levels.cleared = Object.assign({}, base.levels.cleared || {});

      state = base;
      /* Write the migrated shape straight back so the old one stops lingering
         and every later load takes the fast path. */
      if (migrated) save();
      return true;
    } catch (e) { return false; }
  }

  /* --------------------------------------------------------------- campaign */

  function cur() { return C.campaign(state.campaign || C.CAMPAIGNS[0].id); }

  function run() {
    var id = (state.campaign || C.CAMPAIGNS[0].id);
    if (!state.runs[id]) state.runs[id] = freshRun();
    return state.runs[id];
  }

  function runOf(id) { return state.runs[id] || null; }

  function maxPoints(camp) {
    return camp.chapters.reduce(function (n, ch) { return n + ch.scenes.length * 2; }, 0)
         + camp.boss.scenes.length * 2;
  }

  /* ----------------------------------------------------------------- helpers */

  function T(obj) {
    if (!obj) return '';
    return obj[state.lang] != null ? obj[state.lang] : (obj.zh || obj.en || '');
  }
  function ui(key) { return T(C.UI[key]); }
  function L(obj) { return typeof obj === 'string' ? obj : T(obj); }
  function lv(en, zh) { return state.lang === 'zh' ? zh : en; }

  function h(tag, props, kids) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === 'class') el.className = props[k];
        else if (k === 'html') el.innerHTML = props[k];
        else if (k === 'text') el.textContent = props[k];
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), props[k]);
        else if (props[k] != null) el.setAttribute(k, props[k]);
      });
    }
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function sprite(name, scale, variant) { return Pixel.el(name, scale || 6, variant); }

  /* Draw a dex entry in whichever form the player has earned. */
  function dexSprite(entry, scale) {
    return sprite(entry.monster, scale, state.shiny[entry.id] ? 'shiny' : null);
  }

  var clamp = B.clamp;

  /* Screens re-render on every language or sound toggle, so their entry jingle
     needs a key to stop it firing again on a redraw of the same moment. */
  var lastSfxKey = null;
  function playOnce(key, sfx) {
    if (lastSfxKey === key) return;
    lastSfxKey = key;
    Sound.play(sfx);
  }

  /* Which bed plays where. The front-of-house screens — title, the character
     picker, about — share the title theme; everything you actually play sits
     under the main one. The risk notice is deliberately absent: it is reachable
     from the topbar at any point, so it keeps whatever was already playing
     rather than yanking a player mid-chapter back to the title music. */
  var FRONT_SCREENS = { title: 1, hero: 1, about: 1 };
  function updateMusic() {
    if (view.screen === 'risk') return;
    Sound.music(FRONT_SCREENS[view.screen] ? 'title' : 'main');
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1800);
  }

  /* Points needed to catch a unit's creature. Chapters differ in length — the
     visa chapter is twice the size of the rest — so the allowance is one
     half-right answer per three scenes rather than a flat one per chapter. */
  function catchThreshold(unit) {
    var max = unit.scenes.length * 2;
    return max - Math.ceil(unit.scenes.length / 3);
  }

  function totalPoints() {
    var r = run(), n = 0;
    Object.keys(r.cleared).forEach(function (k) { n += r.cleared[k]; });
    return n;
  }

  function finalScore() {
    return B.score(run().stats, totalPoints(), maxPoints(cur()));
  }

  function endingFor(score) {
    var list = cur().endings;
    for (var i = 0; i < list.length; i++) {
      if (score >= list[i].min) return list[i];
    }
    return list[list.length - 1];
  }

  /* ------------------------------------------------------------------- dex */

  /* One roster across every campaign, numbered continuously: play both routes
     and the numbers keep going up. Chapter entries take their name and flavour
     from the chapter itself so the two can never drift apart. */
  var DEX = (function () {
    var list = [];

    C.CAMPAIGNS.forEach(function (camp) {
      function fromUnit(u, from) {
        var meta = camp.dexMeta[u.id] || {};
        return {
          id: u.id, monster: u.monster, name: u.name, note: u.dexNote, campaign: camp.id,
          from: from, type: meta.type, danger: meta.danger, rarity: meta.rarity, weak: meta.weak
        };
      }
      camp.chapters.forEach(function (ch, i) {
        list.push(fromUnit(ch, {
          zh: '第' + (i + 1) + '章 · ' + ch.title.zh,
          en: 'Ch.' + (i + 1) + ' · ' + ch.title.en
        }));
      });
      list.push(fromUnit(camp.boss, camp.boss.title));
      if (camp.bonusDex) list.push(fromUnit(camp.bonusDex, camp.bonusDex.title));
      camp.rares.forEach(function (r) {
        list.push(Object.assign({ campaign: camp.id }, r));
      });
      list.push(Object.assign({ campaign: camp.id, secret: true }, camp.secret));
    });

    (C.LEVELS || []).forEach(function (level, i) {
      var d = level.dexEntry;
      if (!d) return;
      list.push({
        id: d.id || level.id,
        monster: d.monster || level.icon,
        name: d.name || level.title,
        note: d.note || level.scenario,
        campaign: 'levels',
        from: d.from || { zh: '第' + (i + 1) + '关 · ' + level.title.zh, en: 'Level ' + (i + 1) + ' · ' + level.title.en },
        type: d.type,
        danger: d.danger,
        rarity: d.rarity,
        weak: d.weak
      });
    });

    list.forEach(function (e, i) { e.no = i + 1; });
    return list;
  })();

  function dexOf(campaignId) {
    return DEX.filter(function (e) { return e.campaign === campaignId; });
  }

  function dexEntry(id) {
    for (var i = 0; i < DEX.length; i++) if (DEX[i].id === id) return DEX[i];
    return null;
  }

  function pad(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : String(n); }

  function stars(n, max) {
    var s = '';
    for (var i = 0; i < max; i++) s += i < n ? '★' : '☆';
    return s;
  }

  function caughtCount(list) {
    return list.filter(function (e) { return state.dex[e.id] === 'caught'; }).length;
  }

  /* Each route has its own secret, unlocked by catching everything else on that
     route. Returns the entry only on the transition, so it is celebrated once. */
  function checkSecret(campaignId) {
    var all = dexOf(campaignId);
    var secret = all.filter(function (e) { return e.secret; })[0];
    if (!secret || state.dex[secret.id]) return null;
    var rest = all.filter(function (e) { return !e.secret; });
    if (caughtCount(rest) < rest.length) return null;
    state.dex[secret.id] = 'caught';
    return secret;
  }

  /* ------------------------------------------------------------ shared parts */

  function statBar(key, iconName, labelKey) {
    var val = run().stats[key];
    var max = LIMITS[key][1];
    var pct = Math.round((val / max) * 100);
    var cls = 'bar' + (pct <= 20 ? ' dead' : pct <= 45 ? ' warn' : '');
    var fill = h('i');
    /* Set the width after paint so the transition actually runs. */
    requestAnimationFrame(function () { fill.style.width = pct + '%'; });
    return h('div', { class: 'stat' }, [
      sprite(iconName, 3),
      h('div', { class: 'body' }, [
        h('div', { class: 'name' }, [
          h('span', { text: ui(labelKey) }),
          h('span', { class: 'stat-num', text: String(val) })
        ]),
        h('div', { class: cls }, [fill])
      ])
    ]);
  }

  /* Shown after each chapter: the quarter closes, you rest, you book revenue,
     and a weak compliance score turns into an actual bill. */
  function settlementPanel() {
    var s = view.settlement;
    if (!s) return null;
    var rows = [
      [ui('settleRest'), '+' + s.rest],
      [ui('settleRevenue'), '+' + s.revenue]
    ];
    if (s.fine > 0) rows.push([ui('settleFine'), '-' + s.fine]);
    if (s.stress > 0) rows.push([ui('settleStress'), '-' + s.stress]);

    return h('div', { class: 'panel double' + (s.fine > 0 ? ' bad' : '') }, [
      h('div', { class: 'eyebrow', text: ui('settleTitle') }),
      h('div', { class: 'breakdown' }, rows.map(function (r) {
        return h('div', { class: 'row' }, [
          h('span', { text: r[0] }),
          h('span', { class: 'stat-num', text: r[1] })
        ]);
      })),
      s.fine > 0 ? h('p', { class: 'small', style: 'margin-top:8px', text: ui('settleFineNote') }) : null
    ]);
  }

  function statsPanel() {
    return h('div', { class: 'panel stats' }, [
      statBar('cash', 'icoCash', 'cash'),
      statBar('comp', 'icoShield', 'compliance'),
      statBar('rep', 'icoStar', 'reputation'),
      statBar('energy', 'icoBolt', 'energy')
    ]);
  }

  function topbar() {
    return h('div', { class: 'topbar' }, [
      h('div', {
        class: 'chip', text: ui('langBtn'), title: 'Language',
        onclick: function () {
          state.lang = state.lang === 'zh' ? 'en' : 'zh';
          Sound.play('blip'); save(); render();
        }
      }),
      h('div', {
        class: 'chip warn', text: '⚠', title: ui('riskBtn'),
        onclick: function () { Sound.play('blip'); go('risk'); }
      }),
      h('div', { class: 'spacer' }),
      h('div', {
        class: 'chip', text: state.sound ? ui('soundOn') : ui('soundOff'),
        onclick: function () {
          state.sound = !state.sound;
          Sound.setEnabled(state.sound);
          Sound.play('blip'); save(); render();
        }
      })
    ]);
  }

  /* The risk categories a scene involves, rendered as coloured badges. This is
     the part that tells a player which mistakes are a fine and which are a
     criminal record — the most useful signal in the game after the tips. */
  function riskBadges(kinds) {
    return (kinds || []).map(function (k) {
      var r = C.RISK[k];
      if (!r) return null;
      return h('span', { class: 'riskbadge', style: 'background:' + r.colour, text: T(r.label) });
    }).filter(Boolean);
  }

  function riskPanel(sc) {
    if (!sc.risk || !sc.risk.length) return null;
    var lines = sc.risk.map(function (k) {
      var r = C.RISK[k];
      return r ? h('div', { class: 'riskline' }, [
        h('span', { class: 'riskbadge', style: 'background:' + r.colour, text: T(r.label) }),
        h('span', { class: 'small', text: T(r.desc) })
      ]) : null;
    }).filter(Boolean);

    return h('div', { class: 'panel double risknote' }, [
      h('div', { class: 'eyebrow', text: ui('sceneRisk') }),
      h('div', { class: 'risklist' }, lines),
      sc.volatile ? h('div', { class: 'volatile' }, [
        h('span', { class: 'riskbadge vol', text: '⚠ ' + ui('volatileTag') }),
        h('span', { class: 'small', text: ui('volatileNote') })
      ]) : null
    ]);
  }

  /* Reveal text one character at a time; tapping anywhere finishes it early.
     The box is sized to the finished text up front: without that, revealing the
     last line grows the paragraph and shoves the button under the tap that was
     meant for it, so the first tap gets swallowed. */
  function typewriter(el, text) {
    var i = 0;
    el.textContent = text;
    var full = el.getBoundingClientRect().height;
    if (full) el.style.minHeight = full + 'px';
    el.textContent = '';
    el.classList.add('type');
    var timer = setInterval(step, 18);
    function step() {
      if (i >= text.length) return finish();
      el.textContent += text.charAt(i++);
    }
    function finish() {
      clearInterval(timer);
      el.textContent = text;
      el.classList.add('done');
      document.removeEventListener('pointerdown', finish);
    }
    document.addEventListener('pointerdown', finish);
    return finish;
  }

  /* ----------------------------------------------------------------- screens */

  function screenTitle() {
    var r = state.campaign ? runOf(state.campaign) : null;
    var canContinue = state.started && r && !r.finished;

    function newGame() {
      Sound.play('select');
      /* Nobody starts without having seen the risk notice at least once. */
      if (!state.ackRisk) { go('risk'); return; }
      go(state.started ? 'routes' : 'hero');
    }

    return [
      h('div', { class: 'logo', 'data-lang': state.lang }, [
        h('span', { class: 'l1', text: T(C.UI.title) }),
        h('span', { class: 'l2', text: T(C.UI.title2) }),
        h('span', { class: 'tag', text: ui('tagline') })
      ]),
      h('div', { class: 'stage-wrap' }, [
        h('div', { class: 'stage' }, [sprite(state.hero, 7)]),
        h('div', { class: 'ground' })
      ]),
      canContinue
        ? h('button', {
            class: 'btn primary center',
            onclick: function () { Sound.play('select'); go('map'); }
          }, [h('strong', { text: ui('continueGame') })])
        : h('button', {
            class: 'btn primary center', onclick: newGame
          }, [h('strong', { text: ui('start') })]),
      canContinue
        ? h('button', { class: 'btn center', onclick: function () { Sound.play('blip'); go('routes'); } },
            [h('strong', { text: ui('switchRoute') })])
        : null,
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('dex'); }
      }, [h('strong', { text: ui('dex') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('about'); }
      }, [h('strong', { text: ui('about') })])
    ];
  }

  /* Shown once before the first game, and reachable any time from the topbar
     or the about screen. Deliberately a full screen rather than a modal: it is
     meant to be read, not dismissed. */
  function screenRisk() {
    var first = !state.ackRisk;
    return [
      h('div', { class: 'panel double bad' }, [
        h('div', { class: 'label', style: 'background:var(--red)', text: '⚠ ' + ui('riskBtn') }),
        h('div', { class: 'h-title', style: 'margin-bottom:8px', text: ui('riskTitle') }),
        h('p', { class: 'prose', style: 'white-space:pre-line', text: ui('riskBody') })
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'scoreline' }, [
          h('span', { text: ui('asOfLabel') }),
          h('span', { class: 'stat-num', text: T(C.AS_OF) })
        ])
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('riskLegend') }),
        h('div', { class: 'risklist' }, Object.keys(C.RISK).map(function (k) {
          var r = C.RISK[k];
          return h('div', { class: 'riskline' }, [
            h('span', { class: 'riskbadge', style: 'background:' + r.colour, text: T(r.label) }),
            h('span', { class: 'small', text: T(r.desc) })
          ]);
        }))
      ]),
      h('button', {
        class: 'btn primary center', onclick: function () {
          state.ackRisk = true;
          Sound.play('select');
          save();
          go(first ? (state.started ? 'routes' : 'hero') : 'title');
        }
      }, [h('strong', { text: first ? ui('riskAck') : ui('back') })])
    ];
  }

  function screenAbout() {
    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label', text: ui('about') }),
        h('p', { class: 'prose', text: ui('aboutBody') })
      ]),
      h('div', { class: 'panel double bad' }, [
        h('div', { class: 'label', text: ui('disclaimerT') }),
        h('p', { class: 'small', text: ui('disclaimer') }),
        h('div', { class: 'hr' }),
        h('div', { class: 'scoreline' }, [
          h('span', { text: ui('asOfLabel') }),
          h('span', { class: 'stat-num', text: T(C.AS_OF) })
        ])
      ]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('risk'); }
      }, [h('strong', { text: '⚠ ' + ui('riskBtn') })]),
      h('button', {
        class: 'btn center', onclick: function () {
          if (confirm(ui('resetAsk'))) {
            try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
            state = Object.assign(freshState(), { lang: state.lang, sound: state.sound });
            Sound.play('back');
            go('title');
          }
        }
      }, [h('strong', { text: ui('reset') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); go('title'); }
      }, [h('strong', { text: ui('back') })])
    ];
  }

  function screenHero() {
    var picker = h('div', { class: 'heroes' }, ['hero1', 'hero2', 'hero3'].map(function (id) {
      return h('div', {
        class: 'hero' + (state.hero === id ? ' sel' : ''),
        onclick: function () { state.hero = id; Sound.play('blip'); render(); }
      }, [sprite(id, 5)]);
    }));

    return [
      h('div', { class: 'panel double center' }, [
        h('div', { class: 'eyebrow', text: ui('chooseHero') }),
        h('div', { class: 'gap' }),
        picker,
        h('p', { class: 'small', style: 'margin-top:10px', text: ui('heroHint') })
      ]),
      h('button', {
        class: 'btn primary center', onclick: function () {
          state.started = true; Sound.play('select'); save(); go('routes');
        }
      }, [h('strong', { text: ui('confirm') })])
    ];
  }

  /* Route select. Each card shows how far that route has got, so coming back
     to a half-finished one is obvious. */
  function screenRoutes() {
    var cards = C.CAMPAIGNS.map(function (camp) {
      var r = runOf(camp.id);
      var total = camp.chapters.length;
      var done = r ? Object.keys(r.cleared).filter(function (k) { return k !== camp.boss.id; }).length : 0;
      var badge = !r ? ui('routeNew')
                : r.finished ? ui('routeCleared')
                : done + '/' + total;

      return h('div', {
        class: 'route' + (state.campaign === camp.id ? ' sel' : ''),
        onclick: function () {
          state.campaign = camp.id;
          run();                      // materialise the run if it is new
          Sound.play('select');
          save();
          go('map');
        }
      }, [
        h('div', { class: 'route-head' }, [
          sprite(camp.icon, 4),
          h('div', { class: 'route-txt' }, [
            h('div', { class: 'route-title', text: T(camp.title) }),
            h('div', { class: 'route-sub', text: T(camp.subtitle) })
          ]),
          h('div', { class: 'route-badge', text: badge })
        ]),
        h('p', { class: 'small', text: T(camp.blurb) })
      ]);
    });
    var levelCards = (C.LEVELS || []).map(function (level) {
      var locked = !(state.levels && state.levels.unlocked && state.levels.unlocked[level.id]);
      var cleared = state.levels && state.levels.cleared && state.levels.cleared[level.id];
      var badge = locked ? ui('locked') : cleared ? ui('cleared') : lv('LEVEL ' + level.order, '第' + level.order + '关');

      return h('div', {
        class: 'route mini' + (locked ? ' locked' : '') + (cleared ? ' sel' : ''),
        onclick: function () {
          if (locked) { Sound.play('bad'); return; }
          Sound.play('select');
          startLevel(level);
        }
      }, [
        h('div', { class: 'route-head' }, [
          sprite(level.icon || 'commingle', 4),
          h('div', { class: 'route-txt' }, [
            h('div', { class: 'route-title', text: L(level.title) }),
            h('div', { class: 'route-sub', text: L(level.audience) })
          ]),
          h('div', { class: 'route-badge', text: badge })
        ]),
        h('p', { class: 'small', text: L(level.scenario) })
      ]);
    });

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('chooseRoute') }),
        h('div', { class: 'h-sub', text: ui('routeHint') })
      ])
    ].concat(levelCards, cards, [
      h('div', { class: 'gap' }),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); go('title'); }
      }, [h('strong', { text: ui('back') })])
    ]);
  }

  function screenMap() {
    var camp = cur();
    var r = run();

    var nodes = camp.chapters.map(function (ch, i) {
      var locked = i > r.unlocked;
      var done = ch.id in r.cleared;
      return h('div', {
        class: 'node' + (locked ? ' locked' : '') + (done ? ' done' : ''),
        onclick: function () {
          if (locked) { Sound.play('bad'); return; }
          Sound.play('select');
          startChapter(ch);
        }
      }, [
        h('div', { class: 'art' }, [sprite(ch.monster, 3)]),
        h('div', { class: 'txt' }, [
          h('div', { class: 'n-title', text: (state.lang === 'zh' ? '第' + (i + 1) + '章 · ' : 'Ch.' + (i + 1) + ' · ') + T(ch.title) }),
          h('div', { class: 'n-sub', text: T(ch.subtitle) })
        ]),
        h('div', { class: 'n-badge', text: locked ? '🔒' : done ? '★ ' + r.cleared[ch.id] + '/' + (ch.scenes.length * 2) : '▶' })
      ]);
    });

    var bossLocked = r.unlocked < camp.chapters.length;
    nodes.push(h('div', {
      class: 'node' + (bossLocked ? ' locked' : '') + (r.bossDone ? ' done' : ''),
      onclick: function () {
        if (bossLocked) { Sound.play('bad'); return; }
        Sound.play('select');
        if (r.bossDone) { go('result'); return; }
        startBoss();
      }
    }, [
      h('div', { class: 'art' }, [sprite(camp.boss.monster, 3)]),
      h('div', { class: 'txt' }, [
        h('div', { class: 'n-title', text: T(camp.boss.title) }),
        h('div', { class: 'n-sub', text: T(camp.boss.subtitle) })
      ]),
      h('div', { class: 'n-badge', text: bossLocked ? '🔒' : r.bossDone ? '★' : '!' })
    ]));

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('map') + ' · ' + T(camp.title) }),
        h('div', { class: 'h-sub', text: (state.lang === 'zh' ? '进度 ' : 'Progress ') +
          Math.min(r.unlocked, camp.chapters.length) + '/' + camp.chapters.length })
      ]),
      statsPanel(),
      h('div', { class: 'map' }, nodes),
      h('div', { class: 'gap' }),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('dex'); }
      }, [h('strong', { text: ui('dex') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('routes'); }
      }, [h('strong', { text: ui('switchRoute') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); go('title'); }
      }, [h('strong', { text: ui('back') })])
    ];
  }

  function screenIntro() {
    var ch = view.chapter;
    var line = h('p', { class: 'prose' });
    setTimeout(function () { typewriter(line, T(ch.intro)); }, 60);
    playOnce('intro:' + ch.id, 'appear');

    return [
      h('div', { class: 'panel double center' }, [
        h('div', { class: 'eyebrow', text: T(ch.title) }),
        h('div', { class: 'h-sub', text: T(ch.subtitle) })
      ]),
      h('div', { class: 'stage-wrap' }, [
        h('div', { class: 'stage' }, [sprite(ch.monster, 7)]),
        h('div', { class: 'ground' })
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'center', style: 'font-weight:800;margin-bottom:6px' },
          [document.createTextNode(T(ch.name) + ' ' + ui('appeared'))]),
        line
      ]),
      h('button', {
        class: 'btn primary center', onclick: function () { Sound.play('select'); view.screen = 'scene'; render(); }
      }, [h('strong', { text: ui('next') })])
    ];
  }

  /* -------------------------------------------------------- single levels */

  function startLevel(level) {
    view.level = level;
    view.evidenceState = {};
    view.setupBranch = null;
    view.outcome = null;
    view.battleState = null;
    view.battleFeedback = null;
    view.battleResult = null;
    view.screen = 'levelScenario';
    render();
  }

  function startLevelDecision(branch) {
    view.setupBranch = branch;
    view.evidenceState = {};
    (branch.setsEvidence || []).forEach(function (id) { view.evidenceState[id] = true; });
    Sound.play('select');
    view.screen = 'levelEvidence';
    render();
  }

  function levelOutcome(level, id) {
    for (var i = 0; i < level.outcomes.length; i++) {
      if (level.outcomes[i].id === id) return level.outcomes[i];
    }
    return null;
  }

  function levelNo(level) {
    return lv('LEVEL ' + level.order, '第' + level.order + '关');
  }

  function battleRound(level, id) {
    var rounds = (level.battle && level.battle.rounds) || [];
    for (var i = 0; i < rounds.length; i++) if (rounds[i].id === id) return rounds[i];
    return rounds[0] || null;
  }

  function hasBattleEvidence(option) {
    var need = option.requiresEvidence || [];
    for (var i = 0; i < need.length; i++) {
      if (!view.evidenceState || !view.evidenceState[need[i]]) return false;
    }
    return true;
  }

  function clampPct(n) {
    return Math.max(0, Math.min(100, n));
  }

  function startLevelBattle() {
    var level = view.level;
    var b = level && level.battle;
    if (!b) { view.screen = 'levelDecision'; render(); return; }
    view.battleState = {
      roundId: 'opening',
      credibility: b.start.credibility,
      poise: b.start.poise,
      conviction: b.start.conviction
    };
    view.battleFeedback = null;
    view.battleResult = null;
    Sound.play('select');
    view.screen = 'levelBattle';
    render();
  }

  function pickBattleOption(option) {
    var st = view.battleState;
    if (!st || !hasBattleEvidence(option)) return;
    st.credibility = clampPct(st.credibility + (option.credibility || 0));
    st.poise = clampPct(st.poise + (option.poise || 0));
    st.conviction = clampPct(st.conviction + (option.conviction || 0));

    var outcome = option.outcome || null;
    if (st.credibility <= 0) outcome = 'defeat';
    if (st.poise <= 0) outcome = 'victory';

    view.battleFeedback = {
      option: option,
      next: option.next,
      outcome: outcome
    };
    Sound.play(option.tone === 'good' ? 'good' : option.tone === 'tint' ? 'blip' : 'wrong');
    view.screen = 'levelBattleFeedback';
    render();
  }

  function finishLevelBattle(outcomeId) {
    var level = view.level;
    var b = level.battle;
    var outcome = b.outcomes[outcomeId] || b.outcomes.defeat;
    view.battleResult = outcome;
    if (!state.levels) state.levels = freshLevels();
    state.levels.cleared[level.id] = outcome.tone;
    if (level.unlocksLevelId) state.levels.unlocked[level.unlocksLevelId] = true;
    if (level.dexEntry) {
      var dexId = level.dexEntry.id || level.id;
      state.dex[dexId] = outcome.tone === 'good' ? 'caught' : 'seen';
    }
    save();
    Sound.play(outcome.tone === 'good' ? 'caught' : 'bad');
    view.screen = 'levelBattleResult';
    render();
  }

  function continueBattle() {
    var fb = view.battleFeedback;
    if (!fb) return;
    if (fb.outcome) {
      finishLevelBattle(fb.outcome);
      return;
    }
    view.battleState.roundId = fb.next || view.battleState.roundId;
    view.battleFeedback = null;
    Sound.play('select');
    view.screen = 'levelBattle';
    render();
  }

  var SKILL_LABELS = {
    legalJudgment: { zh: '法律判断', en: 'legal judgment' },
    evidenceAwareness: { zh: '证据意识', en: 'evidence awareness' },
    riskControl: { zh: '风险控制', en: 'risk control' },
    negotiation: { zh: '谈判', en: 'negotiation' }
  };

  function skillLabel(skill) {
    return T(SKILL_LABELS[skill]) || skill;
  }

  function toneLabel(tone) {
    var labels = {
      good: { zh: '较好', en: 'GOOD' },
      risky: { zh: '有风险', en: 'RISKY' },
      bad: { zh: '不利', en: 'BAD' }
    };
    return T(labels[tone]) || tone.toUpperCase();
  }

  function hasLevelEvidence(branch) {
    var need = branch.requiresEvidence || [];
    for (var i = 0; i < need.length; i++) {
      if (!view.evidenceState || !view.evidenceState[need[i]]) return false;
    }
    return true;
  }

  function pickLevelAction(branch) {
    var level = view.level;
    var outcome = levelOutcome(level, branch.leadsTo);
    if (!outcome) return;
    view.outcome = outcome;
    if (!state.levels) state.levels = freshLevels();
    state.levels.cleared[level.id] = outcome.tone;
    if (level.unlocksLevelId) state.levels.unlocked[level.unlocksLevelId] = true;
    Sound.play(outcome.tone === 'good' ? 'good' : outcome.tone === 'risky' ? 'blip' : 'bad');
    save();
    view.screen = 'levelOutcome';
    render();
  }

  function screenLevelScenario() {
    var level = view.level || (C.LEVELS && C.LEVELS[0]);
    if (!level) return screenTitle();
    playOnce('levelScenario:' + level.id, 'appear');
    return [
      h('div', { class: 'panel double center' }, [
        h('div', { class: 'eyebrow', text: levelNo(level) }),
        h('div', { class: 'h-title', text: L(level.title) }),
        h('div', { class: 'h-sub', text: L(level.audience) })
      ]),
      h('div', { class: 'stage-wrap' }, [
        h('div', { class: 'stage' }, [sprite(level.icon || 'commingle', 7)]),
        h('div', { class: 'ground' })
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label', text: lv('SCENARIO', '情境') }),
        h('p', { class: 'prose', text: L(level.scenario) })
      ]),
      h('button', {
        class: 'btn primary center',
        onclick: function () { Sound.play('select'); view.screen = 'levelCharacters'; render(); }
      }, [h('strong', { text: lv('Meet the characters', '认识人物') })])
    ];
  }

  function screenLevelCharacters() {
    var level = view.level;
    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: L(level.title) }),
        h('div', { class: 'h-title', text: lv('Meet the characters', '认识人物') })
      ])
    ].concat(level.characters.map(function (c) {
      return h('div', { class: 'panel double' }, [
        h('div', { class: 'scoreline' }, [
          h('span', { class: 'stat-num', text: L(c.name) }),
          h('span', { text: L(c.role) })
        ]),
        c.line ? h('p', { class: 'prose', style: 'margin-top:8px', text: '"' + L(c.line) + '"' }) : null
      ]);
    }), [
      h('button', {
        class: 'btn primary center',
        onclick: function () { Sound.play('select'); view.screen = 'levelSetup'; render(); }
      }, [h('strong', { text: ui('next') })])
    ]);
  }

  function screenLevelSetup() {
    var level = view.level;
    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label tip', text: lv('SETUP', '设置') }),
        h('div', { class: 'h-title', text: L(level.setup.question) }),
        h('p', { class: 'small', style: 'margin-top:6px', text: L(level.setup.context) })
      ])
    ].concat(level.setup.branches.map(function (branch, i) {
      return h('button', {
        class: 'btn choice',
        onclick: function () { startLevelDecision(branch); }
      }, [
        h('span', { class: 'idx', text: String(i + 1) }),
        h('span', { text: L(branch.label) })
      ]);
    }));
  }

  function screenLevelEvidence() {
    var level = view.level;
    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label', text: lv('COLLECT EVIDENCE', '搜集证据') }),
        h('div', { class: 'h-title', text: lv('What is in your file?', '你手里有什么材料？') }),
        h('p', { class: 'small', text: lv('The setup choice seeded this evidence. The missing pieces cannot be created at the courthouse.', '前面的设置选择决定了这些证据。缺失的材料不能到法庭上才补出来。') })
      ]),
      h('div', { class: 'evidence-list' }, level.availableEvidence.map(function (ev) {
        var present = !!(view.evidenceState && view.evidenceState[ev.id]);
        var cls = 'evidence ' + (present ? (ev.redFlag ? 'redflag' : 'present') : 'missing');
        var status = present ? (ev.redFlag ? lv('RED FLAG', '不利证据') : lv('READY', '可用')) : lv('MISSING', '缺失');
        return h('div', { class: cls }, [
          h('span', { class: 'tag', text: status }),
          h('span', { text: L(ev.label) })
        ]);
      })),
      h('button', {
        class: 'btn primary center',
        onclick: function () { Sound.play('select'); view.screen = 'levelRisk'; render(); }
      }, [h('strong', { text: lv('Grasp the risk', '判断风险') })])
    ];
  }

  function screenLevelRisk() {
    var level = view.level;
    return [
      h('div', { class: 'panel double risknote' }, [
        h('div', { class: 'label', style: 'background:var(--red)', text: lv('RISK INSIGHT', '风险判断') }),
        h('p', { class: 'prose', text: L(level.riskInsight) })
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'riskline' }, [
          h('span', { class: 'riskbadge', style: 'background:' + C.RISK.civil.colour, text: T(C.RISK.civil.label) }),
          h('span', { class: 'small', text: T(C.RISK.civil.desc) })
        ])
      ]),
      h('button', {
        class: 'btn primary center',
        onclick: function () {
          if (level.battle) startLevelBattle();
          else { Sound.play('select'); view.screen = 'levelDecision'; render(); }
        }
      }, [h('strong', { text: lv('Choose an action', '选择行动') })])
    ];
  }

  function battleMeter(label, value, kind) {
    var fill = h('i');
    requestAnimationFrame(function () { fill.style.width = clampPct(value) + '%'; });
    return h('div', { class: 'battle-meter ' + (kind || '') }, [
      h('div', { class: 'scoreline' }, [
        h('span', { text: label }),
        h('span', { class: 'stat-num', text: String(clampPct(value)) })
      ]),
      h('div', { class: 'battlebar' }, [fill])
    ]);
  }

  function battleHud() {
    var st = view.battleState;
    return h('div', { class: 'panel double battle-hud' }, [
      battleMeter(lv('YOU · CREDIBILITY', '你 · 信誉'), st.credibility, 'cred'),
      battleMeter(lv('MS. HAN · POISE', '韩律师 · 架势'), st.poise, 'poise'),
      battleMeter(lv('JUDGE · CONVICTION', '法官 · 心证'), st.conviction, 'judge')
    ]);
  }

  function battleResultLabel(result) {
    var labels = {
      MISS: lv('MISS', '未命中'),
      HIT: lv('HIT', '命中'),
      CRITICAL: lv('CRITICAL', '会心一击')
    };
    return labels[result] || result;
  }

  function battleOptionButton(option, i) {
    var locked = !hasBattleEvidence(option);
    return h('button', {
      class: 'btn choice battle-choice' + (locked ? ' locked-choice' : ''),
      disabled: locked ? true : null,
      onclick: locked ? null : function () { pickBattleOption(option); }
    }, [
      h('span', { class: 'idx', text: String(i + 1) }),
      h('span', { text: L(option.text) }),
      locked ? h('span', {
        class: 'sub',
        text: lv('LOCKED - ', '未解锁：') + L(option.lockedHint || { en: 'Missing evidence.', zh: '缺少证据。' })
      }) : null
    ]);
  }

  function screenLevelBattle() {
    var level = view.level;
    var b = level.battle;
    var st = view.battleState;
    if (!st) { startLevelBattle(); return []; }

    if (st.roundId === 'opening') {
      return [
        h('div', { class: 'panel double center' }, [
          h('div', { class: 'eyebrow', text: L(b.title) }),
          h('div', { class: 'h-title', text: L(b.opening.title) })
        ]),
        battleHud(),
        h('div', { class: 'panel double bad' }, [
          h('p', { class: 'prose battle-script', text: L(b.opening.line) }),
          h('p', { class: 'small', style: 'margin-top:10px', text: L(b.opening.effect) })
        ]),
        h('div', { class: 'panel double' }, b.rules.map(function (rule) {
          return h('p', { class: 'small', text: L(rule) });
        })),
        h('button', {
          class: 'btn primary center',
          onclick: function () {
            st.roundId = b.opening.next;
            Sound.play('select');
            render();
          }
        }, [h('strong', { text: lv('Enter the exchange', '进入交锋') })])
      ];
    }

    var round = battleRound(level, st.roundId);
    return [
      h('div', { class: 'panel double center' }, [
        h('div', { class: 'eyebrow', text: L(b.title) }),
        h('div', { class: 'h-title', text: L(round.title) })
      ]),
      battleHud(),
      h('div', { class: 'panel double' }, [
        h('p', { class: 'prose battle-script', text: L(round.attack) }),
        h('div', { class: 'hr' }),
        h('p', { class: 'small', text: L(round.prompt) })
      ])
    ].concat(round.options.map(battleOptionButton));
  }

  function screenLevelBattleFeedback() {
    var fb = view.battleFeedback;
    var option = fb && fb.option;
    if (!option) return screenLevelBattle();
    var toneClass = option.tone === 'good' ? 'good' : option.tone === 'tint' ? 'tint' : 'bad';
    return [
      battleHud(),
      h('div', { class: 'panel double ' + toneClass }, [
        h('div', { class: 'label', text: battleResultLabel(option.result) }),
        h('p', { class: 'prose battle-script', text: L(option.response) })
      ]),
      h('button', {
        class: 'btn primary center',
        onclick: continueBattle
      }, [h('strong', { text: fb.outcome ? lv('Hear the verdict', '听取裁判') : ui('next') })])
    ];
  }

  function screenLevelBattleResult() {
    var level = view.level;
    var outcome = view.battleResult || (level.battle && level.battle.outcomes.defeat);
    var toneClass = outcome.tone === 'good' ? 'good' : 'bad';
    return [
      h('div', { class: 'panel double ' + toneClass }, [
        h('div', { class: 'label', text: outcome.tone === 'good' ? lv('VICTORY', '胜利') : lv('DEFEAT', '失败') }),
        h('div', { class: 'h-title', text: L(outcome.title) }),
        h('p', { class: 'prose battle-script', style: 'margin-top:8px', text: L(outcome.body) })
      ]),
      h('div', { class: 'panel double good' }, [
        h('div', { class: 'label tip', text: lv('REWARDS', '奖励') }),
        h('p', { class: 'prose', text: L(outcome.reward) }),
        h('p', { class: 'small', style: 'margin-top:10px', text: L(outcome.hook) })
      ]),
      h('button', {
        class: 'btn primary center',
        onclick: function () { Sound.play('select'); startLevel(level); }
      }, [h('strong', { text: lv('Retry', '重试') })]),
      h('button', {
        class: 'btn center',
        onclick: function () { Sound.play('back'); go('routes'); }
      }, [h('strong', { text: ui('back') })])
    ];
  }

  function screenLevelDecision() {
    var level = view.level;
    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label tip', text: lv('DECISION', '行动选择') }),
        h('div', { class: 'h-title', text: L(level.decision.question) }),
        h('p', { class: 'small', style: 'margin-top:6px', text: L(level.decision.context) })
      ])
    ].concat(level.decision.branches.map(function (branch, i) {
      var locked = !hasLevelEvidence(branch);
      return h('button', {
        class: 'btn choice' + (locked ? ' locked-choice' : ''),
        disabled: locked ? true : null,
        onclick: locked ? null : function () { pickLevelAction(branch); }
      }, [
        h('span', { class: 'idx', text: String(i + 1) }),
        h('span', { text: L(branch.label) }),
        locked ? h('span', { class: 'sub', text: lv('LOCKED - ', '未解锁：') + L(branch.disabledHint || { en: 'Missing evidence.', zh: '缺少证据。' }) }) : null
      ]);
    }));
  }

  function screenLevelOutcome() {
    var level = view.level;
    var outcome = view.outcome || level.outcomes[0];
    var basis = outcome.legalBasis;
    var toneClass = outcome.tone === 'good' ? 'good' : outcome.tone === 'risky' ? 'tint' : 'bad';

    function row(label, value) {
      return h('div', { class: 'row' }, [
        h('span', { text: label }),
        h('span', { class: 'val', text: value })
      ]);
    }

    return [
      h('div', { class: 'panel double ' + toneClass }, [
        h('div', { class: 'label', text: toneLabel(outcome.tone) }),
        h('div', { class: 'h-title', text: L(outcome.result) }),
        h('p', { class: 'prose', style: 'margin-top:8px', text: L(outcome.explanation) })
      ]),
      h('div', { class: 'panel double good' }, [
        h('div', { class: 'label tip', text: lv('SKILL GAIN', '能力提升') }),
        h('div', { class: 'tagrow' }, outcome.skillGain.map(function (s) {
          return h('span', { class: 'tag own', text: skillLabel(s) });
        })),
        h('p', { class: 'small', style: 'margin-top:10px', text: L(outcome.hook) })
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label law', text: lv('CREDIBILITY', '内容可信度') }),
        h('div', { class: 'breakdown' }, [
          row(lv('Jurisdiction', '法域'), L(basis.jurisdiction)),
          row(lv('Effective', '生效日期'), basis.effectiveDate),
          row(lv('Reviewed', '审核状态'), L(basis.reviewedBy)),
          row(lv('Updated', '更新日期'), basis.lastUpdated),
          row(lv('Verify with', '复核方式'), L(basis.verifyWith))
        ]),
        h('div', { class: 'hr' }),
        h('p', { class: 'small', text: L(basis.citation) }),
        basis.exceptions ? h('p', { class: 'small', style: 'margin-top:8px', text: L(basis.exceptions) }) : null
      ]),
      level.unlocksLevelId ? h('div', { class: 'panel double tint' }, [
        h('div', { class: 'label', text: lv('UNLOCKED', '已解锁') }),
        h('p', { class: 'prose', text: lv('Next level: ', '下一关：') + level.unlocksLevelId })
      ]) : null,
      h('button', {
        class: 'btn primary center',
        onclick: function () { Sound.play('select'); startLevel(level); }
      }, [h('strong', { text: lv('Replay level', '重玩本关') })]),
      h('button', {
        class: 'btn center',
        onclick: function () { Sound.play('back'); go('routes'); }
      }, [h('strong', { text: ui('back') })])
    ];
  }

  function screenScene() {
    var ch = view.chapter;
    var sc = ch.scenes[view.sceneIdx];
    var isBoss = ch === cur().boss;

    var head = [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: T(ch.title) + '  ' + (view.sceneIdx + 1) + '/' + ch.scenes.length }),
        h('p', { class: 'prose', style: 'margin-top:6px', text: T(sc.prompt) })
      ])
    ];

    if (isBoss) {
      var hp = h('i');
      requestAnimationFrame(function () { hp.style.width = run().bossHp + '%'; });
      head.unshift(h('div', { class: 'panel' }, [
        h('div', { class: 'eyebrow', text: T(ch.name) + ' — ' + ui('bossHp') }),
        h('div', { class: 'hpbar' }, [hp])
      ]));
    }

    var stage = h('div', { class: 'stage-wrap' }, [
      h('div', { class: 'stage', id: 'stage' }, [sprite(ch.monster, isBoss ? 7 : 5)]),
      h('div', { class: 'ground' })
    ]);

    var buttons = sc.choices.map(function (c, i) {
      return h('button', {
        class: 'btn choice',
        onclick: function () { pick(i); }
      }, [
        h('span', { class: 'idx', text: String(i + 1) }),
        h('span', { text: T(c.text) })
      ]);
    });

    return [stage].concat(head, buttons);
  }

  function pick(i) {
    var ch = view.chapter;
    var sc = ch.scenes[view.sceneIdx];
    var choice = sc.choices[i];
    var r = run();

    view.picked = i;
    view.applied = B.applyFx(r.stats, choice.fx);
    view.runPoints += choice.score;

    /* Rare encounters are released by nailing one specific question, so they
       stay catchable on a replay if you missed them the first time round. */
    view.rare = null;
    if (sc.rare && choice.score === 2 && state.dex[sc.rare] !== 'caught') {
      state.dex[sc.rare] = 'caught';
      view.rare = dexEntry(sc.rare);
    }

    if (ch === cur().boss) {
      var dmg = choice.score === 2 ? 30 : choice.score === 1 ? 12 : 0;
      r.bossHp = Math.max(0, r.bossHp - dmg);
      if (choice.score === 0) {
        r.stats.energy = clamp('energy', r.stats.energy - 8);
        var st = document.getElementById('stage');
        if (st) { st.classList.add('shake'); }
      }
    }

    Sound.play(view.rare ? 'caught' : choice.score === 2 ? 'good' : choice.score === 1 ? 'blip' : 'wrong');
    save();
    view.screen = 'feedback';
    render();
  }

  function screenFeedback() {
    var ch = view.chapter;
    var sc = ch.scenes[view.sceneIdx];
    var choice = sc.choices[view.picked];
    var tone = choice.score === 2 ? 'good' : choice.score === 1 ? 'tint' : 'bad';

    /* Report the deltas the bars actually moved by, not the raw authored ones. */
    var deltas = [];
    var names = { cash: 'cash', comp: 'compliance', rep: 'reputation', energy: 'energy' };
    Object.keys(names).forEach(function (k) {
      var v = view.applied && view.applied[k];
      if (!v) return;
      deltas.push(h('span', {
        class: 'delta ' + (v > 0 ? 'up' : 'down'),
        text: ui(names[k]) + ' ' + (v > 0 ? '+' : '') + v
      }));
    });

    var last = view.sceneIdx >= ch.scenes.length - 1;

    /* A rare encounter earns its own banner — it is the moment collectors
       are playing for, and it should not be buried under the legal tip. */
    var rareBanner = view.rare ? h('div', { class: 'panel double rare' }, [
      h('div', { class: 'rare-row' }, [
        dexSprite(view.rare, 4),
        h('div', {}, [
          h('div', { class: 'rare-title', text: ui('rareAppear') }),
          h('div', { class: 'rare-name', text: 'No.' + pad(view.rare.no) + '  ' + T(view.rare.name) }),
          h('div', { class: 'small', text: ui('rareGot') })
        ])
      ])
    ]) : null;

    return [
      rareBanner,
      h('div', { class: 'panel double ' + tone }, [
        h('div', {
          class: 'label',
          style: 'background:' + (choice.score === 2 ? 'var(--green-dk)' : choice.score === 1 ? 'var(--slate)' : 'var(--red)'),
          text: ui(choice.score === 2 ? 'vGood' : choice.score === 1 ? 'vOk' : 'vBad')
        }),
        h('p', { class: 'prose', style: 'white-space:pre-line', text: T(choice.feedbackText || choice.text) }),
        h('p', { class: 'prose', style: 'font-weight:700;margin-top:8px', text: T(choice.verdict) }),
        deltas.length ? h('div', { style: 'margin-top:8px;display:flex;flex-wrap:wrap;gap:4px 10px' }, deltas) : null
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label tip', text: ui('tipTitle') }),
        h('p', { class: 'prose', text: T(sc.tip) }),
        h('div', { class: 'hr' }),
        h('div', { class: 'label law', text: ui('lawTitle') }),
        h('p', { class: 'small', text: T(sc.law) })
      ]),
      riskPanel(sc),
      h('button', {
        class: 'btn primary center', onclick: function () {
          Sound.play('select');
          if (!last) { view.sceneIdx++; view.screen = 'scene'; render(); }
          else if (ch === cur().boss) { finishBoss(); }
          else { finishChapter(); }
        }
      }, [h('strong', { text: ui('next') })])
    ];
  }

  function screenCapture() {
    var ch = view.chapter;
    var max = ch.scenes.length * 2;
    var caught = state.dex[ch.id] === 'caught';
    var entry = dexEntry(ch.id);

    playOnce('capture:' + ch.id + ':' + view.runPoints, view.shiny || caught ? 'caught' : 'wrong');

    return [
      h('div', { class: 'stage-wrap' }, [
        h('div', { class: 'stage' + (view.shiny ? ' sparkle' : '') }, [dexSprite(entry, 7)]),
        h('div', { class: 'ground' })
      ]),
      h('div', { class: 'panel double ' + (caught ? 'good' : '') + ' center' }, [
        h('div', { class: 'bigmsg' + (caught ? '' : ' miss'), text: caught ? ui('caught') : ui('escaped') }),
        h('p', { class: 'small', text: caught ? ui('caughtDesc') : ui('escapedDesc') }),
        view.shiny ? h('div', { class: 'shiny-flag', text: ui('shinyGot') }) : null,
        !view.shiny && caught ? h('p', { class: 'small', style: 'margin-top:6px', text: ui('shinyHint') }) : null,
        h('div', { class: 'hr' }),
        h('div', { class: 'scoreline' }, [
          h('span', { text: T(ch.name) }),
          h('span', { class: 'stat-num', text: view.runPoints + ' / ' + max })
        ])
      ]),
      view.secret ? secretPanel(view.secret) : null,
      settlementPanel(),
      statsPanel(),
      h('button', {
        class: 'btn primary center', onclick: function () { Sound.play('select'); go('map'); }
      }, [h('strong', { text: ui('map') })])
    ];
  }

  /* Shown once, the moment the last missing entry on a route is filled in. */
  function secretPanel(entry) {
    return h('div', { class: 'panel double tint' }, [
      h('div', { class: 'rare-row' }, [
        sprite(entry.monster, 4),
        h('div', {}, [
          h('div', { class: 'rare-title', text: ui('secretGot') }),
          h('div', { class: 'rare-name', text: 'No.' + pad(entry.no) + '  ' + T(entry.name) })
        ])
      ])
    ]);
  }

  var DEX_FILTERS = {
    all:     function () { return true; },
    missing: function (e) { return state.dex[e.id] !== 'caught'; },
    shiny:   function (e) { return !!state.shiny[e.id]; }
  };

  function screenDex() {
    var filter = DEX_FILTERS[view.dexFilter] ? view.dexFilter : 'all';

    function cell(e) {
      var st = state.dex[e.id];
      var isShiny = !!state.shiny[e.id];
      return h('div', {
        class: 'dexcell' + (st === 'caught' ? ' caught' : st ? '' : ' unseen') + (isShiny ? ' shinycell' : ''),
        onclick: function () {
          /* Only the secret explains itself; the rest stay silent silhouettes,
             which is half the point of a dex. */
          if (!st) { Sound.play('bad'); if (e.secret) toast(ui('dexLocked')); return; }
          Sound.play('blip');
          view.dexEntry = e;
          view.screen = 'dexdetail';
          render();
        }
      }, [
        h('div', { class: 'no', text: pad(e.no) }),
        st ? dexSprite(e, 3) : sprite(e.monster, 3),
        h('div', { class: 'nm', text: st ? T(e.name) : ui('notSeen') }),
        h('div', { class: 'st', text: st === 'caught' ? ui('owned') : st ? ui('seen') : '—' }),
        isShiny ? h('div', { class: 'shinymark', text: '✦' }) : null
      ]);
    }

    /* Grouped by route so the dex reads as two collections, not one long list. */
    var sections = [];
    var levelEntries = dexOf('levels').filter(DEX_FILTERS[filter]);
    if (levelEntries.length) {
      var allLevels = dexOf('levels');
      sections.push(h('div', { class: 'dexsection' }, [
        h('span', { text: lv('Sample Levels', '单关样例') }),
        h('span', { class: 'stat-num', text: caughtCount(allLevels) + '/' + allLevels.length })
      ]));
      sections.push(h('div', { class: 'dexgrid' }, levelEntries.map(cell)));
    }
    C.CAMPAIGNS.forEach(function (camp) {
      var entries = dexOf(camp.id).filter(DEX_FILTERS[filter]);
      if (!entries.length) return;
      var all = dexOf(camp.id);
      sections.push(h('div', { class: 'dexsection' }, [
        h('span', { text: T(camp.title) }),
        h('span', { class: 'stat-num', text: caughtCount(all) + '/' + all.length })
      ]));
      sections.push(h('div', { class: 'dexgrid' }, entries.map(cell)));
    });

    var caught = caughtCount(DEX);
    var shinies = DEX.filter(function (e) { return state.shiny[e.id]; }).length;
    var pct = Math.round((caught / DEX.length) * 100);
    var fill = h('i');
    requestAnimationFrame(function () { fill.style.width = pct + '%'; });

    function tab(key, label) {
      return h('div', {
        class: 'chip' + (filter === key ? ' on' : ''),
        text: label,
        onclick: function () { view.dexFilter = key; Sound.play('blip'); render(); }
      });
    }

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('dex') }),
        h('div', { class: 'scoreline', style: 'margin-top:4px' }, [
          h('span', { text: ui('dexDone') }),
          h('span', { class: 'stat-num', text: caught + ' / ' + DEX.length + '  (' + pct + '%)' })
        ]),
        h('div', { class: 'bar' }, [fill]),
        h('div', { class: 'small', style: 'margin-top:7px', text: '✦ ' + ui('dexShiny') + ' ' + shinies + ' / ' + DEX.length })
      ]),
      h('div', { class: 'tabs' }, [
        tab('all', ui('dexAll')),
        tab('missing', ui('dexMissing')),
        tab('shiny', '✦ ' + ui('dexShinyOnly'))
      ]),
      caught === 0 && filter === 'all'
        ? h('div', { class: 'panel double center' }, [h('p', { class: 'small', text: ui('dexEmpty') })])
        : null
    ].concat(sections, [
      h('div', { class: 'gap' }),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); go(state.campaign ? 'map' : 'title'); }
      }, [h('strong', { text: ui('back') })])
    ]);
  }

  function screenDexDetail() {
    var e = view.dexEntry;
    var isShiny = !!state.shiny[e.id];

    function row(labelKey, value) {
      return h('div', { class: 'row' }, [
        h('span', { text: ui(labelKey) }),
        h('span', { class: 'val', text: value })
      ]);
    }

    return [
      h('div', { class: 'stage-wrap' }, [
        h('div', { class: 'stage' + (isShiny ? ' sparkle' : '') }, [dexSprite(e, 7)]),
        h('div', { class: 'ground' })
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'dexhead' }, [
          h('span', { class: 'eyebrow', text: ui('dexNo') + pad(e.no) }),
          h('span', { class: 'tagrow' }, [
            isShiny ? h('span', { class: 'tag shiny', text: '✦ ' + ui('dexShiny') }) : null,
            e.rarity >= 2 ? h('span', { class: 'tag', text: ui('dexRareTag') }) : null,
            h('span', { class: 'tag ' + (state.dex[e.id] === 'caught' ? 'own' : ''), text: state.dex[e.id] === 'caught' ? ui('owned') : ui('seen') })
          ])
        ]),
        h('div', { class: 'h-title', text: T(e.name) }),
        h('div', { class: 'hr' }),
        h('div', { class: 'breakdown' }, [
          row('dexType', T(e.type)),
          row('dexFrom', T(e.from)),
          row('dexDanger', stars(e.danger, 5)),
          row('dexRarity', stars(e.rarity, 3))
        ])
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'label', text: ui('dexEntryLbl') }),
        h('p', { class: 'prose', text: T(e.note) })
      ]),
      h('div', { class: 'panel double good' }, [
        h('div', { class: 'label tip', text: ui('dexWeak') }),
        h('p', { class: 'prose', text: T(e.weak) })
      ]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); view.screen = 'dex'; render(); }
      }, [h('strong', { text: ui('back') })])
    ];
  }

  function screenResult() {
    var camp = cur();
    var r = run();
    var score = finalScore();
    var ending = endingFor(score);
    var mine = dexOf(camp.id);

    playOnce('result:' + camp.id, score >= 55 ? 'fanfare' : 'gameover');

    var rows = camp.chapters.map(function (ch) {
      var got = r.cleared[ch.id];
      return h('div', { class: 'row' }, [
        h('span', { text: T(ch.title) + ' · ' + T(ch.subtitle) }),
        h('span', { class: 'stat-num', text: (got == null ? '—' : got) + '/' + (ch.scenes.length * 2) })
      ]);
    });
    rows.push(h('div', { class: 'row' }, [
      h('span', { text: T(camp.boss.title) }),
      h('span', { class: 'stat-num', text: (r.cleared[camp.boss.id] == null ? '—' : r.cleared[camp.boss.id]) + '/' + (camp.boss.scenes.length * 2) })
    ]));

    return [
      h('div', { class: 'panel double center' }, [
        h('div', { class: 'eyebrow', text: ui('finalTitle') + ' · ' + T(camp.title) }),
        h('div', { class: 'grade', text: ending.grade }),
        h('div', { class: 'h-title', text: T(ending.title) }),
        h('div', { class: 'scoreline', style: 'justify-content:center;gap:10px;margin-top:8px' }, [
          h('span', { text: ui('finalScore') }),
          h('span', { class: 'stat-num', style: 'font-size:18px', text: String(score) })
        ])
      ]),
      h('div', { class: 'stage-wrap' }, [
        h('div', { class: 'stage' }, [sprite(state.hero, 6)]),
        h('div', { class: 'ground' })
      ]),
      h('div', { class: 'panel double' }, [
        h('p', { class: 'prose', text: T(ending.body) })
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: state.lang === 'zh' ? '分章得分' : 'BY CHAPTER' }),
        h('div', { class: 'breakdown' }, rows)
      ]),
      h('div', { class: 'panel double' }, [
        h('div', { class: 'scoreline' }, [
          h('span', { text: ui('dex') + ' · ' + T(camp.title) }),
          h('span', { class: 'stat-num', text: caughtCount(mine) + '/' + mine.length })
        ])
      ]),
      statsPanel(),
      h('div', { class: 'panel double tint' }, [
        h('div', { class: 'label', style: 'background:var(--green-dk)', text: ui('adviceTitle') }),
        h('ol', { class: 'advice' }, camp.advice.map(function (a) {
          return h('li', { text: T(a) });
        }))
      ]),
      h('div', { class: 'panel double bad' }, [
        h('div', { class: 'label', text: ui('disclaimerT') }),
        h('p', { class: 'small', text: ui('disclaimer') }),
        h('div', { class: 'hr' }),
        h('div', { class: 'scoreline' }, [
          h('span', { text: ui('asOfLabel') }),
          h('span', { class: 'stat-num', text: T(C.AS_OF) })
        ])
      ]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('risk'); }
      }, [h('strong', { text: '⚠ ' + ui('riskBtn') })]),
      h('button', {
        class: 'btn primary center', onclick: function () { copyResult(score, ending); }
      }, [h('strong', { text: ui('share') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('dex'); }
      }, [h('strong', { text: ui('dex') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('routes'); }
      }, [h('strong', { text: ui('switchRoute') })]),
      h('button', {
        class: 'btn center', onclick: function () {
          Sound.play('select');
          /* Replaying a route resets that route only; the dex is kept. */
          state.runs[camp.id] = freshRun();
          save();
          go('map');
        }
      }, [h('strong', { text: ui('retry') })])
    ];
  }

  function copyResult(score, ending) {
    var camp = cur();
    var r = run();
    var caught = caughtCount(DEX);
    var shinies = DEX.filter(function (e) { return state.shiny[e.id]; }).length;

    var text = state.lang === 'zh'
      ? [T(C.UI.title) + T(C.UI.title2) + ' · ' + T(camp.title),
         '成绩：' + ending.grade + ' 级 · ' + T(ending.title) + '（' + score + ' 分）',
         '法律图鉴：' + caught + '/' + DEX.length + ' 已捕获 · 闪光 ' + shinies,
         '合规 ' + r.stats.comp + ' · 声誉 ' + r.stats.rep + ' · 资金 ' + r.stats.cash,
         '（普法科普游戏，不构成法律意见）'].join('\n')
      : ['Can You Really Run a Business in China? — ' + T(camp.title),
         'Result: grade ' + ending.grade + ' — ' + T(ending.title) + ' (' + score + ' pts)',
         'Law Dex: ' + caught + '/' + DEX.length + ' caught, ' + shinies + ' shiny',
         'Compliance ' + r.stats.comp + ' · Reputation ' + r.stats.rep + ' · Cash ' + r.stats.cash,
         '(an educational game, not legal advice)'].join('\n');

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* nothing else to try */ }
      document.body.removeChild(ta);
      toast(ui('copied'));
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(ui('copied')); }, fallback);
    } else {
      fallback();
    }
    Sound.play('good');
  }

  /* ------------------------------------------------------------- transitions */

  function startChapter(ch) {
    view.chapter = ch;
    view.sceneIdx = 0;
    view.picked = null;
    view.runPoints = 0;
    view.shiny = false;
    view.secret = null;
    view.screen = 'intro';
    render();
  }

  function finishChapter() {
    var camp = cur();
    var r = run();
    var ch = view.chapter;
    var max = ch.scenes.length * 2;
    var prev = r.cleared[ch.id];
    /* Replaying a chapter keeps your best run rather than punishing curiosity. */
    r.cleared[ch.id] = prev == null ? view.runPoints : Math.max(prev, view.runPoints);

    var caught = view.runPoints >= catchThreshold(ch);
    if (caught) state.dex[ch.id] = 'caught';
    else if (!state.dex[ch.id]) state.dex[ch.id] = 'seen';

    /* A flawless chapter — every answer the right one — turns the creature
       shiny. It is the reason to come back to a chapter you merely passed. */
    view.shiny = false;
    if (view.runPoints === max && !state.shiny[ch.id]) {
      state.shiny[ch.id] = true;
      view.shiny = true;
    }

    var idx = camp.chapters.indexOf(ch);
    if (idx >= 0 && idx === r.unlocked) r.unlocked = idx + 1;

    view.settlement = B.settle(r.stats, view.runPoints, max);
    view.secret = checkSecret(camp.id);

    save();
    view.screen = 'capture';
    render();
  }

  function startBoss() {
    var r = run();
    r.bossHp = 100;
    save();
    view.chapter = cur().boss;
    view.sceneIdx = 0;
    view.picked = null;
    view.runPoints = 0;
    view.screen = 'intro';
    render();
  }

  function finishBoss() {
    var camp = cur();
    var r = run();
    var boss = camp.boss;
    var max = boss.scenes.length * 2;
    var prev = r.cleared[boss.id];
    r.cleared[boss.id] = prev == null ? view.runPoints : Math.max(prev, view.runPoints);

    var beat = view.runPoints >= catchThreshold(boss);
    if (beat) state.dex[boss.id] = 'caught';
    else if (!state.dex[boss.id]) state.dex[boss.id] = 'seen';
    if (view.runPoints === max) state.shiny[boss.id] = true;

    /* Routes that carry a bonus entry hand it over at the ending. */
    if (camp.bonusDex) {
      state.dex[camp.bonusDex.id] = beat ? 'caught' : 'seen';
      if (view.runPoints === max) state.shiny[camp.bonusDex.id] = true;
    }

    B.settle(r.stats, view.runPoints, max);
    checkSecret(camp.id);

    r.bossDone = true;
    r.finished = true;
    save();
    go('result');
  }

  function go(screen) {
    view.screen = screen;
    window.scrollTo(0, 0);
    render();
  }

  /* ---------------------------------------------------------------- renderer */

  var RENDERERS = {
    title: screenTitle,
    about: screenAbout,
    hero: screenHero,
    routes: screenRoutes,
    risk: screenRisk,
    map: screenMap,
    intro: screenIntro,
    levelScenario: screenLevelScenario,
    levelCharacters: screenLevelCharacters,
    levelSetup: screenLevelSetup,
    levelEvidence: screenLevelEvidence,
    levelRisk: screenLevelRisk,
    levelBattle: screenLevelBattle,
    levelBattleFeedback: screenLevelBattleFeedback,
    levelBattleResult: screenLevelBattleResult,
    levelDecision: screenLevelDecision,
    levelOutcome: screenLevelOutcome,
    scene: screenScene,
    feedback: screenFeedback,
    capture: screenCapture,
    dex: screenDex,
    dexdetail: screenDexDetail,
    result: screenResult
  };

  function render() {
    updateMusic();

    var app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(topbar());

    var root = h('div', { class: 'screen active' });
    var parts = (RENDERERS[view.screen] || screenTitle)();
    parts.forEach(function (p) { if (p) root.appendChild(p); });
    app.appendChild(root);
  }

  /* Number keys pick answers; useful on desktop, harmless on phones. */
  document.addEventListener('keydown', function (e) {
    if (view.screen !== 'scene' && view.screen !== 'levelSetup' && view.screen !== 'levelDecision' && view.screen !== 'levelBattle') return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 3) {
      var btns = document.querySelectorAll('.btn.choice');
      if (btns[n - 1]) btns[n - 1].click();
    }
  });

  /* ------------------------------------------------------------------- start */

  function init() {
    load();
    Sound.setEnabled(state.sound);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.Game = { render: render, state: function () { return state; }, dex: function () { return DEX; } };
})(window);
