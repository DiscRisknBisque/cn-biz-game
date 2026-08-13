/*
 * game.js — state machine and rendering.
 *
 * There is one view element; every state change rebuilds it. The game is small
 * enough that re-rendering wholesale is simpler, and cheaper to reason about,
 * than keeping a diff of the DOM in sync with the save file.
 */
(function (global) {
  'use strict';

  var C = global.Content;
  var B = global.Balance;
  var Pixel = global.Pixel;
  var Sound = global.Sound;

  var SAVE_KEY = 'cnbizgame.save.v1';
  var TOTAL_CHAPTERS = C.CHAPTERS.length;

  /* Points available across the whole run — used to normalise the final score. */
  var MAX_POINTS = C.CHAPTERS.reduce(function (n, ch) { return n + ch.scenes.length * 2; }, 0)
                 + C.BOSS.scenes.length * 2;

  /* ------------------------------------------------------------------ state */

  function freshState() {
    return {
      /* The game is Chinese-first by design; the toggle is one tap away. */
      lang: 'zh',
      sound: true,
      hero: 'hero1',
      started: false,
      unlocked: 0,          // index of the next chapter that may be played
      cleared: {},          // chapterId -> points scored
      dex: {},              // dex id -> 'seen' | 'caught'
      shiny: {},            // dex id -> true, earned by a flawless chapter
      bossHp: 100,
      bossDone: false,
      finished: false,
      stats: Object.assign({}, B.START)
    };
  }

  var LIMITS = B.LIMITS;

  var state = freshState();

  /* Transient per-screen data that should never be persisted. */
  var view = {
    screen: 'title', chapter: null, sceneIdx: 0,
    picked: null, applied: null, runPoints: 0, settlement: null
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      var s = JSON.parse(raw);
      if (!s || !s.stats) return false;
      /* Merge onto a fresh state so a save from an older build cannot leave
         a key undefined. */
      var base = freshState();
      Object.keys(base).forEach(function (k) { if (k in s) base[k] = s[k]; });
      base.stats = Object.assign(freshState().stats, s.stats || {});
      state = base;
      return true;
    } catch (e) { return false; }
  }

  /* ----------------------------------------------------------------- helpers */

  function T(obj) {
    if (!obj) return '';
    return obj[state.lang] != null ? obj[state.lang] : (obj.zh || obj.en || '');
  }
  function ui(key) { return T(C.UI[key]); }

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
    var n = 0;
    Object.keys(state.cleared).forEach(function (k) { n += state.cleared[k]; });
    return n;
  }

  function finalScore() {
    return B.score(state.stats, totalPoints(), MAX_POINTS);
  }

  function endingFor(score) {
    for (var i = 0; i < C.ENDINGS.length; i++) {
      if (score >= C.ENDINGS[i].min) return C.ENDINGS[i];
    }
    return C.ENDINGS[C.ENDINGS.length - 1];
  }

  /* The dex roster, in numbered order: the ten chapter creatures, then the six
     rare encounters, then the secret. Chapter entries take their name and
     flavour from the chapter itself so the two can never drift apart. */
  var DEX = (function () {
    function fromUnit(u, from) {
      var meta = C.DEX_META[u.id] || {};
      return {
        id: u.id, monster: u.monster, name: u.name, note: u.dexNote,
        from: from, type: meta.type, danger: meta.danger, rarity: meta.rarity, weak: meta.weak
      };
    }
    var list = C.CHAPTERS.map(function (ch, i) {
      return fromUnit(ch, {
        zh: '第' + (i + 1) + '章 · ' + ch.title.zh,
        en: 'Ch.' + (i + 1) + ' · ' + ch.title.en
      });
    });
    list.push(fromUnit(C.BOSS, C.BOSS.title));
    list.push(fromUnit(C.BONUS_DEX, C.BONUS_DEX.title));
    C.RARES.forEach(function (r) { list.push(r); });
    list.push(C.SECRET);
    list.forEach(function (e, i) { e.no = i + 1; });
    return list;
  })();

  /* Everything except the secret, which is the reward for completing them. */
  var DEX_MAIN = DEX.filter(function (e) { return e.id !== C.SECRET.id; });

  function dexEntries() { return DEX; }

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

  /* The secret unlocks the moment every other entry has been caught. Returns
     true only on the transition, so the caller can celebrate it once. */
  function checkSecret() {
    if (state.dex[C.SECRET.id]) return false;
    if (caughtCount(DEX_MAIN) < DEX_MAIN.length) return false;
    state.dex[C.SECRET.id] = 'caught';
    return true;
  }

  /* ------------------------------------------------------------ shared parts */

  function statBar(key, iconName, labelKey) {
    var val = state.stats[key];
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
    var bar = h('div', { class: 'topbar' }, [
      h('div', {
        class: 'chip', text: ui('langBtn'), title: 'Language',
        onclick: function () {
          state.lang = state.lang === 'zh' ? 'en' : 'zh';
          Sound.play('blip'); save(); render();
        }
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
    return bar;
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
    /* A finished run is not a resumable one — it offers a fresh start instead. */
    var canContinue = state.started && !state.finished;

    function newGame() {
      Sound.play('select');
      state = Object.assign(freshState(), {
        lang: state.lang, sound: state.sound, hero: state.hero,
        dex: state.dex, shiny: state.shiny
      });
      save();
      go('hero');
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
        ? h('button', { class: 'btn center', onclick: newGame },
            [h('strong', { text: ui('newGame') })])
        : null,
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('dex'); }
      }, [h('strong', { text: ui('dex') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('about'); }
      }, [h('strong', { text: ui('about') })])
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
        h('p', { class: 'small', text: ui('disclaimer') })
      ]),
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
          state.started = true; Sound.play('select'); save(); go('map');
        }
      }, [h('strong', { text: ui('confirm') })])
    ];
  }

  function screenMap() {
    var nodes = C.CHAPTERS.map(function (ch, i) {
      var locked = i > state.unlocked;
      var done = ch.id in state.cleared;
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
        h('div', { class: 'n-badge', text: locked ? '🔒' : done ? '★ ' + state.cleared[ch.id] + '/' + (ch.scenes.length * 2) : '▶' })
      ]);
    });

    var bossLocked = state.unlocked < TOTAL_CHAPTERS;
    nodes.push(h('div', {
      class: 'node' + (bossLocked ? ' locked' : '') + (state.bossDone ? ' done' : ''),
      onclick: function () {
        if (bossLocked) { Sound.play('bad'); return; }
        Sound.play('select');
        if (state.bossDone) { go('result'); return; }
        startBoss();
      }
    }, [
      h('div', { class: 'art' }, [sprite(C.BOSS.monster, 3)]),
      h('div', { class: 'txt' }, [
        h('div', { class: 'n-title', text: T(C.BOSS.title) }),
        h('div', { class: 'n-sub', text: T(C.BOSS.subtitle) })
      ]),
      h('div', { class: 'n-badge', text: bossLocked ? '🔒' : state.bossDone ? '★' : '!' })
    ]));

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('map') }),
        h('div', { class: 'h-sub', text: state.lang === 'zh'
          ? '进度 ' + Math.min(state.unlocked, TOTAL_CHAPTERS) + '/' + TOTAL_CHAPTERS
          : 'Progress ' + Math.min(state.unlocked, TOTAL_CHAPTERS) + '/' + TOTAL_CHAPTERS })
      ]),
      statsPanel(),
      h('div', { class: 'map' }, nodes),
      h('div', { class: 'gap' }),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('dex'); }
      }, [h('strong', { text: ui('dex') })]),
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

  function screenScene() {
    var ch = view.chapter;
    var sc = ch.scenes[view.sceneIdx];
    var isBoss = ch.id === 'boss';

    var head = [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: T(ch.title) + '  ' + (view.sceneIdx + 1) + '/' + ch.scenes.length }),
        h('p', { class: 'prose', style: 'margin-top:6px', text: T(sc.prompt) })
      ])
    ];

    if (isBoss) {
      var hp = h('i');
      requestAnimationFrame(function () { hp.style.width = state.bossHp + '%'; });
      head.unshift(h('div', { class: 'panel' }, [
        h('div', { class: 'eyebrow', text: T(C.BOSS.name) + ' — ' + ui('bossHp') }),
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

    view.picked = i;
    view.applied = B.applyFx(state.stats, choice.fx);
    view.runPoints += choice.score;

    /* Rare encounters are released by nailing one specific question, so they
       stay catchable on a replay if you missed them the first time round. */
    view.rare = null;
    if (sc.rare && choice.score === 2 && state.dex[sc.rare] !== 'caught') {
      state.dex[sc.rare] = 'caught';
      view.rare = dexEntry(sc.rare);
    }

    if (ch.id === 'boss') {
      var dmg = choice.score === 2 ? 30 : choice.score === 1 ? 12 : 0;
      state.bossHp = Math.max(0, state.bossHp - dmg);
      if (choice.score === 0) {
        state.stats.energy = clamp('energy', state.stats.energy - 8);
        var st = document.getElementById('stage');
        if (st) { st.classList.add('shake'); }
      }
    }

    Sound.play(view.rare ? 'caught' : choice.score === 2 ? 'good' : choice.score === 1 ? 'blip' : 'hurt');
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
        h('p', { class: 'prose', text: T(choice.text) }),
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
      h('button', {
        class: 'btn primary center', onclick: function () {
          Sound.play('select');
          if (!last) { view.sceneIdx++; view.screen = 'scene'; render(); }
          else if (ch.id === 'boss') { finishBoss(); }
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

    playOnce('capture:' + ch.id + ':' + view.runPoints, view.shiny || caught ? 'caught' : 'bad');

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
      view.secret ? secretPanel() : null,
      settlementPanel(),
      statsPanel(),
      h('button', {
        class: 'btn primary center', onclick: function () { Sound.play('select'); go('map'); }
      }, [h('strong', { text: ui('map') })])
    ];
  }

  /* Shown once, the moment the last missing entry is filled in. */
  function secretPanel() {
    return h('div', { class: 'panel double tint' }, [
      h('div', { class: 'rare-row' }, [
        sprite(C.SECRET.monster, 4),
        h('div', {}, [
          h('div', { class: 'rare-title', text: ui('secretGot') }),
          h('div', { class: 'rare-name', text: 'No.' + pad(DEX.length) + '  ' + T(C.SECRET.name) })
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
    var shown = DEX.filter(DEX_FILTERS[filter]);

    var cells = shown.map(function (e) {
      var st = state.dex[e.id];
      var isShiny = !!state.shiny[e.id];
      var locked = !st && e.id === C.SECRET.id;
      return h('div', {
        class: 'dexcell' + (st === 'caught' ? ' caught' : st ? '' : ' unseen') + (isShiny ? ' shinycell' : ''),
        onclick: function () {
          /* Only the secret explains itself; the rest just stay silent
             silhouettes, which is half the point of a dex. */
          if (!st) { Sound.play('bad'); if (locked) toast(ui('dexLocked')); return; }
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
        : null,
      h('div', { class: 'dexgrid' }, cells),
      h('div', { class: 'gap' }),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); go(state.started ? 'map' : 'title'); }
      }, [h('strong', { text: ui('back') })])
    ];
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
    var score = finalScore();
    var ending = endingFor(score);
    var entries = dexEntries();
    var caught = entries.filter(function (e) { return state.dex[e.id] === 'caught'; }).length;

    playOnce('result', score >= 55 ? 'fanfare' : 'gameover');

    var rows = C.CHAPTERS.map(function (ch) {
      var got = state.cleared[ch.id];
      return h('div', { class: 'row' }, [
        h('span', { text: T(ch.title) + ' · ' + T(ch.subtitle) }),
        h('span', { class: 'stat-num', text: (got == null ? '—' : got) + '/' + (ch.scenes.length * 2) })
      ]);
    });
    rows.push(h('div', { class: 'row' }, [
      h('span', { text: T(C.BOSS.title) }),
      h('span', { class: 'stat-num', text: (state.cleared.boss == null ? '—' : state.cleared.boss) + '/' + (C.BOSS.scenes.length * 2) })
    ]));

    return [
      h('div', { class: 'panel double center' }, [
        h('div', { class: 'eyebrow', text: ui('finalTitle') }),
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
      statsPanel(),
      h('div', { class: 'panel double bad' }, [
        h('div', { class: 'label', text: ui('disclaimerT') }),
        h('p', { class: 'small', text: ui('disclaimer') })
      ]),
      h('button', {
        class: 'btn primary center', onclick: function () { copyResult(score, ending, caught, entries.length); }
      }, [h('strong', { text: ui('share') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); go('dex'); }
      }, [h('strong', { text: ui('dex') })]),
      h('button', {
        class: 'btn center', onclick: function () {
          Sound.play('select');
          state = Object.assign(freshState(), {
            lang: state.lang, sound: state.sound, hero: state.hero,
            dex: state.dex, shiny: state.shiny
          });
          save();
          go('title');
        }
      }, [h('strong', { text: ui('retry') })])
    ];
  }

  function copyResult(score, ending, caught, total) {
    var shinies = DEX.filter(function (e) { return state.shiny[e.id]; }).length;
    var text = state.lang === 'zh'
      ? [T(C.UI.title) + T(C.UI.title2),
         '成绩：' + ending.grade + ' 级 · ' + T(ending.title) + '（' + score + ' 分）',
         '法律图鉴：' + caught + '/' + total + ' 已捕获 · 闪光 ' + shinies,
         '合规 ' + state.stats.comp + ' · 声誉 ' + state.stats.rep + ' · 资金 ' + state.stats.cash].join('\n')
      : ['Can You Really Run a Business in China?',
         'Result: grade ' + ending.grade + ' — ' + T(ending.title) + ' (' + score + ' pts)',
         'Law Dex: ' + caught + '/' + total + ' caught, ' + shinies + ' shiny',
         'Compliance ' + state.stats.comp + ' · Reputation ' + state.stats.rep + ' · Cash ' + state.stats.cash].join('\n');

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
    view.screen = 'intro';
    render();
  }

  function finishChapter() {
    var ch = view.chapter;
    var max = ch.scenes.length * 2;
    var prev = state.cleared[ch.id];
    /* Replaying a chapter keeps your best run rather than punishing curiosity. */
    state.cleared[ch.id] = prev == null ? view.runPoints : Math.max(prev, view.runPoints);

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

    var idx = C.CHAPTERS.indexOf(ch);
    if (idx >= 0 && idx === state.unlocked) state.unlocked = idx + 1;

    view.settlement = B.settle(state.stats, view.runPoints, max);
    view.secret = checkSecret();

    save();
    view.screen = 'capture';
    render();
  }

  function startBoss() {
    state.bossHp = 100;
    save();
    view.chapter = C.BOSS;
    view.sceneIdx = 0;
    view.picked = null;
    view.runPoints = 0;
    view.screen = 'intro';
    render();
  }

  function finishBoss() {
    var max = C.BOSS.scenes.length * 2;
    var prev = state.cleared.boss;
    state.cleared.boss = prev == null ? view.runPoints : Math.max(prev, view.runPoints);

    var beat = view.runPoints >= catchThreshold(C.BOSS);
    if (beat) state.dex.boss = 'caught';
    else if (!state.dex.boss) state.dex.boss = 'seen';
    if (view.runPoints === max) state.shiny.boss = true;

    /* Everyone who reaches the end meets the deregistration ghost. */
    state.dex.exit = beat ? 'caught' : 'seen';
    if (view.runPoints === max) state.shiny.exit = true;

    B.settle(state.stats, view.runPoints, max);
    checkSecret();

    state.bossDone = true;
    state.finished = true;
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
    map: screenMap,
    intro: screenIntro,
    scene: screenScene,
    feedback: screenFeedback,
    capture: screenCapture,
    dex: screenDex,
    dexdetail: screenDexDetail,
    result: screenResult
  };

  function render() {
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
    if (view.screen !== 'scene') return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 3) {
      var btns = document.querySelectorAll('.btn.choice');
      if (btns[n - 1]) btns[n - 1].click();
    }
  });

  /* ------------------------------------------------------------------- start */

  function init() {
    var had = load();
    Sound.setEnabled(state.sound);
    if (had && state.started && !state.finished) view.screen = 'title';
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.Game = { render: render, state: function () { return state; } };
})(window);
