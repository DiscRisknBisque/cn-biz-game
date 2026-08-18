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
  var Auth = global.Auth;
  var Pixel = global.Pixel;
  var Sound = global.Sound;
  var Music = global.Music;

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

  function freshState() {
    return {
      /* The game is Chinese-first by design; the toggle is one tap away. */
      lang: 'zh',
      sound: true,
      music: true,
      hero: 'hero1',
      started: false,
      ackRisk: false,       // has the risk notice been read at least once
      campaign: null,       // null until a route is picked
      runs: {},             // campaign id -> run
      dex: {},              // dex id -> 'seen' | 'caught'
      shiny: {}             // dex id -> true, earned by a flawless chapter
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
        class: 'chip' + (state.music ? '' : ' off'), text: state.music ? ui('musicOn') : ui('musicOff'),
        title: ui('musicLabel'),
        onclick: function () {
          state.music = !state.music;
          Music.setEnabled(state.music);
          Sound.play('blip'); save(); render();
        }
      }),
      h('div', {
        class: 'chip' + (state.sound ? '' : ' off'), text: state.sound ? ui('soundOn') : ui('soundOff'),
        title: ui('sfxLabel'),
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

  /* ------------------------------------------------------------------ forms */

  var ERR_KEYS = {
    required: 'errRequired', phone: 'errPhone', email: 'errEmail',
    code: 'errCode', wrongcode: 'errWrongCode', expired: 'errExpired',
    nocode: 'errNoCode', name: 'errName', age: 'errAge'
  };
  function errText(code) { return ui(ERR_KEYS[code] || 'errRequired'); }

  /* Scratch state for whichever form is on screen. Never persisted: half-typed
     phone numbers have no business surviving a reload. */
  var form = {};

  function field(opts) {
    var input = h('input', {
      class: 'input' + (form.errors && form.errors[opts.key] ? ' bad' : ''),
      type: opts.type || 'text',
      value: form[opts.key] || '',
      inputmode: opts.inputmode,
      maxlength: opts.maxlength,
      autocomplete: opts.autocomplete,
      placeholder: opts.placeholder || '',
      oninput: function (e) { form[opts.key] = e.target.value; }
    });
    return h('label', { class: 'fieldrow' }, [
      h('span', { class: 'flabel' }, [
        h('span', { text: ui(opts.label) }),
        opts.required ? h('span', { class: 'req', text: '*' }) : null
      ]),
      input,
      opts.hint ? h('span', { class: 'fhint', text: ui(opts.hint) }) : null,
      form.errors && form.errors[opts.key]
        ? h('span', { class: 'ferr', text: errText(form.errors[opts.key]) }) : null
    ]);
  }

  function selectField(opts) {
    var sel = h('select', {
      class: 'input' + (form.errors && form.errors[opts.key] ? ' bad' : ''),
      onchange: function (e) { form[opts.key] = e.target.value; render(); }
    }, opts.options.map(function (o) {
      return h('option', { value: o.value, selected: form[opts.key] === o.value ? 'selected' : null, text: o.text });
    }));
    return h('label', { class: 'fieldrow' }, [
      h('span', { class: 'flabel' }, [
        h('span', { text: ui(opts.label) }),
        opts.required ? h('span', { class: 'req', text: '*' }) : null
      ]),
      sel,
      form.errors && form.errors[opts.key]
        ? h('span', { class: 'ferr', text: errText(form.errors[opts.key]) }) : null
    ]);
  }

  function checkRow(key, labelKey, extraClass) {
    return h('label', { class: 'checkrow ' + (extraClass || '') }, [
      h('input', {
        type: 'checkbox',
        /* Never pre-ticked: consent that was not actively given is not consent. */
        checked: form[key] ? 'checked' : null,
        onchange: function (e) { form[key] = e.target.checked; }
      }),
      h('span', { class: 'small', text: ui(labelKey) })
    ]);
  }

  function privacyPanel() {
    return h('details', { class: 'panel double privacy' }, [
      h('summary', { text: ui('privacyTitle') }),
      h('p', { class: 'small', style: 'white-space:pre-line;margin-top:9px', text: ui('privacyBody') })
    ]);
  }

  /* ----------------------------------------------------------------- screens */

  function screenTitle() {
    var r = state.campaign ? runOf(state.campaign) : null;
    var canContinue = state.started && r && !r.finished;

    var signedIn = Auth.isSignedIn();

    function newGame() {
      Sound.play('select');
      /* Nobody starts without having seen the risk notice at least once. */
      if (!state.ackRisk) { go('risk'); return; }
      /* ...and nobody plays without an account, per the brief. */
      if (!signedIn) { form = {}; go(Auth.current() ? 'profile' : 'login'); return; }
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
      signedIn ? h('div', { class: 'whoami' }, [
        h('span', { text: (Auth.current().profile.name || '') }),
        h('span', { class: 'sep', text: '·' }),
        h('span', { class: 'small', text: Auth.current().masked || ui('byWechat') })
      ]) : null,
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
        class: 'btn center', onclick: function () {
          Sound.play('blip');
          form = {};
          go(signedIn ? 'account' : 'login');
        }
      }, [h('strong', { text: signedIn ? ui('account') : ui('signIn') })]),
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
          if (!first) { go('title'); return; }
          if (!Auth.isSignedIn()) { form = {}; go(Auth.current() ? 'profile' : 'login'); return; }
          go(state.started ? 'routes' : 'hero');
        }
      }, [h('strong', { text: first ? ui('riskAck') : ui('back') })])
    ];
  }


  /* --------------------------------------------------------------- account */

  function demoBanner() {
    return h('div', { class: 'panel double demo' }, [
      h('div', { class: 'label', style: 'background:var(--purple)', text: '⚠ ' + ui('demoMode') }),
      h('p', { class: 'small', text: ui('demoNote') })
    ]);
  }

  function screenLogin() {
    var method = form.method || 'phone';

    function tab(key, label) {
      return h('div', {
        class: 'chip' + (method === key ? ' on' : ''),
        text: label,
        onclick: function () {
          form = { method: key, privacy: form.privacy };
          Sound.play('blip');
          render();
        }
      });
    }

    var body;
    if (method === 'wechat') {
      body = h('div', { class: 'panel double' }, [
        h('div', { class: 'wechat-mark' }, [h('span', { text: '微信' })]),
        h('p', { class: 'small', text: ui('wechatNote') }),
        form.wechatNeeds ? h('ul', { class: 'needs' }, form.wechatNeeds.map(function (n) {
          return h('li', { text: n });
        })) : null,
        h('button', {
          class: 'btn primary center', onclick: function () {
            if (!form.privacy) { toast(ui('errConsent')); Sound.play('bad'); return; }
            var r = Auth.wechatSignIn();
            form.wechatNeeds = r.needs;
            Sound.play('bad');
            render();
          }
        }, [h('strong', { text: ui('wechatGo') })])
      ]);
    } else {
      var isPhone = method === 'phone';
      body = h('div', { class: 'panel double' }, [
        field({
          key: method,
          label: isPhone ? 'phoneLabel' : 'emailLabel',
          hint: isPhone ? 'phoneHint' : null,
          type: isPhone ? 'tel' : 'email',
          inputmode: isPhone ? 'tel' : 'email',
          autocomplete: isPhone ? 'tel' : 'email',
          maxlength: isPhone ? 20 : 254,
          required: true
        }),
        h('button', {
          class: 'btn center small-btn', onclick: function () {
            var r = Auth.sendCode(method, form[method]);
            if (!r.ok) { form.errors = {}; form.errors[method] = r.error; Sound.play('bad'); render(); return; }
            form.errors = null;
            form.sent = true;
            form.demoCode = r.demoCode;
            Sound.play('good');
            render();
          }
        }, [h('strong', { text: ui('sendCode') })]),

        form.sent ? h('div', { class: 'democode' }, [
          h('span', { class: 'riskbadge', style: 'background:var(--purple)', text: ui('demoCodeIs') }),
          h('span', { class: 'code', text: form.demoCode })
        ]) : null,

        form.sent ? field({
          key: 'code', label: 'codeLabel', type: 'text',
          inputmode: 'numeric', maxlength: 6, autocomplete: 'one-time-code', required: true
        }) : null
      ]);
    }

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('signIn') }),
        h('div', { class: 'h-title', text: ui('loginTitle') })
      ]),
      demoBanner(),
      h('div', { class: 'tabs' }, [
        tab('phone', ui('byPhone')),
        tab('email', ui('byEmail')),
        tab('wechat', ui('byWechat'))
      ]),
      body,
      privacyPanel(),
      checkRow('privacy', 'consentLabel'),
      method !== 'wechat' ? h('button', {
        class: 'btn primary center', onclick: function () {
          if (!form.privacy) { toast(ui('errConsent')); Sound.play('bad'); return; }
          var r = Auth.verifyCode(form.code);
          if (!r.ok) {
            form.errors = { code: r.error };
            Sound.play('bad');
            render();
            return;
          }
          Auth.signIn(r.method, r.identifier, { privacy: true });
          Sound.play('caught');
          form = {};
          go('profile');
        }
      }, [h('strong', { text: ui('verifyGo') })]) : null,
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); form = {}; go('title'); }
      }, [h('strong', { text: ui('back') })])
    ];
  }

  function screenProfile() {
    var acct = Auth.current();
    if (!acct) return screenLogin();

    /* Editing an existing profile starts from what is already stored. */
    if (!form.loaded) {
      var p0 = acct.profile || {};
      form = {
        loaded: true,
        name: p0.name || '',
        gender: p0.gender || 'private',
        age: p0.age == null ? '' : String(p0.age),
        nationality: p0.nationality || 'CN',
        guardian: !!acct.consent.guardian
      };
    }

    var minor = Auth.isMinor(form.age);

    var genders = [
      { value: 'male', text: ui('gMale') },
      { value: 'female', text: ui('gFemale') },
      { value: 'other', text: ui('gOther') },
      { value: 'private', text: ui('gPrivate') }
    ];
    var nations = C.NATIONALITIES.map(function (n) {
      return { value: n.code, text: state.lang === 'zh' ? n.zh : n.en };
    }).concat([{ value: 'OTHER', text: ui('natOther') }]);

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('account') }),
        h('div', { class: 'h-title', text: ui('profileTitle') }),
        h('p', { class: 'small', style: 'margin-top:6px', text: ui('minimalNote') })
      ]),
      h('div', { class: 'panel double' }, [
        field({ key: 'name', label: 'fName', maxlength: 40, autocomplete: 'name', required: true }),
        selectField({ key: 'gender', label: 'fGender', options: genders }),
        field({ key: 'age', label: 'fAge', type: 'text', inputmode: 'numeric', maxlength: 3, required: true }),
        selectField({ key: 'nationality', label: 'fNationality', options: nations })
      ]),
      minor ? h('div', { class: 'panel double bad' }, [
        h('div', { class: 'label', style: 'background:var(--red)', text: '⚠ ' + ui('fAge') }),
        h('p', { class: 'small', text: ui('guardianWhy') }),
        checkRow('guardian', 'guardianLabel')
      ]) : null,
      h('button', {
        class: 'btn primary center', onclick: function () {
          /* An under-14 age needs guardian consent (PIPL art. 31). Revealing
             the block here rather than as the age is typed keeps focus where
             the user put it, and re-rendering after the click has landed
             cannot swallow it. */
          if (Auth.isMinor(form.age) && !form.guardian) {
            toast(ui('errGuardian'));
            Sound.play('bad');
            render();
            return;
          }
          var r = Auth.saveProfile(form);
          if (!r.ok) { form.errors = r.errors; Sound.play('bad'); render(); return; }
          Sound.play('select');
          form = {};
          go('title');
        }
      }, [h('strong', { text: ui('saveProfile') })]),
      acct.profile ? h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); form = {}; go('account'); }
      }, [h('strong', { text: ui('back') })]) : null
    ];
  }

  function screenAccount() {
    var acct = Auth.current();
    if (!acct) { return screenLogin(); }
    var p0 = acct.profile || {};

    function row(labelKey, value) {
      return h('div', { class: 'row' }, [
        h('span', { text: ui(labelKey) }),
        h('span', { class: 'val', text: value })
      ]);
    }

    var nat = C.NATIONALITIES.filter(function (n) { return n.code === p0.nationality; })[0];
    var genderText = { male: 'gMale', female: 'gFemale', other: 'gOther', private: 'gPrivate' }[p0.gender];

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('account') }),
        h('div', { class: 'h-title', text: p0.name || '—' }),
        h('div', { class: 'hr' }),
        h('div', { class: 'breakdown' }, [
          row('accountOf', ui(acct.method === 'phone' ? 'byPhone' : acct.method === 'email' ? 'byEmail' : 'byWechat') + '  ' + (acct.masked || '')),
          row('fGender', genderText ? ui(genderText) : '—'),
          row('fAge', p0.age == null ? '—' : String(p0.age)),
          row('fNationality', nat ? (state.lang === 'zh' ? nat.zh : nat.en) : ui('natOther')),
          row('joinedAt', (acct.createdAt || '').slice(0, 10))
        ])
      ]),
      privacyPanel(),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('blip'); form = {}; go('profile'); }
      }, [h('strong', { text: ui('editProfile') })]),
      h('button', {
        class: 'btn center', onclick: function () {
          /* PIPL art. 45: the right to a copy of what is held about you. */
          var data = JSON.stringify(Auth.exportData(), null, 2);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(data).then(function () { toast(ui('copied')); });
          } else { toast(ui('copied')); }
          Sound.play('good');
        }
      }, [h('strong', { text: ui('exportData') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); Auth.signOut(); go('title'); }
      }, [h('strong', { text: ui('signOut') })]),
      h('button', {
        class: 'btn center danger', onclick: function () {
          var alsoProgress = confirm(ui('deleteAsk'));
          Auth.deleteAccount();
          if (alsoProgress) {
            try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
            state = Object.assign(freshState(), { lang: state.lang, sound: state.sound });
          }
          toast(ui('deleted'));
          Sound.play('gameover');
          go('title');
        }
      }, [h('strong', { text: ui('deleteAcct') })]),
      h('button', {
        class: 'btn center', onclick: function () { Sound.play('back'); go('title'); }
      }, [h('strong', { text: ui('back') })])
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

    return [
      h('div', { class: 'panel double' }, [
        h('div', { class: 'eyebrow', text: ui('chooseRoute') }),
        h('div', { class: 'h-sub', text: ui('routeHint') })
      ])
    ].concat(cards, [
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

    /* Catching it is a jingle; letting it go gets the trombone. */
    playOnce('capture:' + ch.id + ':' + view.runPoints, view.shiny || caught ? 'caught' : 'fail');

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

    playOnce('result:' + camp.id, score >= 55 ? 'fanfare' : 'fail');

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

  /* ------------------------------------------------------------------ music */

  /* The boss shares the scene screens with ordinary chapters, so the track has
     to follow the chapter rather than the screen name alone. */
  var SCREEN_TRACK = {
    title: 'title', about: 'title', risk: 'title', routes: 'title',
    login: 'title', profile: 'title', account: 'title', hero: 'title',
    map: 'map', dex: 'map', dexdetail: 'map', capture: 'map',
    intro: 'scene', scene: 'scene', feedback: 'scene',
    result: 'result'
  };

  function trackForView() {
    var t = SCREEN_TRACK[view.screen] || 'title';
    if (t === 'scene' && view.chapter && view.chapter === cur().boss) return 'boss';
    return t;
  }

  /* ---------------------------------------------------------------- renderer */

  var RENDERERS = {
    title: screenTitle,
    about: screenAbout,
    hero: screenHero,
    routes: screenRoutes,
    risk: screenRisk,
    login: screenLogin,
    profile: screenProfile,
    account: screenAccount,
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
    Music.play(trackForView());

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
    Auth.load();
    load();
    Sound.setEnabled(state.sound);
    Music.setEnabled(state.music);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.Game = { render: render, state: function () { return state; }, dex: function () { return DEX; } };
})(window);
