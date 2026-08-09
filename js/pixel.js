/*
 * pixel.js — tiny pixel-art renderer.
 *
 * Every sprite in the game is authored here as a grid of characters and painted
 * onto a canvas at runtime, so the game ships with zero image assets and works
 * straight off the filesystem.
 *
 * Palette characters are shared by every sprite. Keeping one small palette is
 * what makes the cast look like it belongs to the same world.
 */
(function (global) {
  'use strict';

  var PALETTE = {
    '.': null,          // transparent
    K: '#241f31',       // outline
    X: '#15121f',       // deepest shadow
    W: '#ffffff',
    S: '#cfd6e6',       // cool light grey
    N: '#3d4a63',       // navy
    n: '#6b7a99',       // slate
    R: '#e2574c',       // red (chops, passports, warnings)
    r: '#f2938a',
    O: '#ef9c34',
    o: '#ffcf85',
    Y: '#f7d94f',       // gold
    y: '#fff2a8',
    G: '#4fae5c',       // green (compliance, safety)
    g: '#93dd85',
    B: '#3f86cf',       // blue (banking, official)
    b: '#8ec7f0',
    P: '#8d5fd3',       // purple (data)
    p: '#c9a7f0',
    C: '#2bb5a6',       // teal
    c: '#7fe3d8',
    M: '#d94f8a',       // magenta
    m: '#f2a0c4',
    T: '#8a5a3b',       // brown
    t: '#c08b5c',
    E: '#f7d9c4',       // skin light
    e: '#d9a884',       // skin mid
    D: '#a06a45'        // skin deep
  };

  /* ------------------------------------------------------------------ *
   * Sprites — 16x16 unless noted. Rows must all be the same width;
   * validate() below shouts in the console if a row is mis-typed.
   * ------------------------------------------------------------------ */
  var SPRITES = {

    /* 签证兽 — a passport that grew legs. */
    visa: [
      '................',
      '....KKKKKKKK....',
      '...KRRRRRRRRK...',
      '..KRRRRRRRRRRK..',
      '..KRRRKYYKRRRK..',
      '..KRRKYYYYKRRK..',
      '..KRRRKYYKRRRK..',
      '..KRRRRRRRRRRK..',
      '..KRWWKRRKWWRK..',
      '..KRWKKRRKKWRK..',
      '..KRRRRRRRRRRK..',
      '..KRRKrrrrKRRK..',
      '..KRRRRRRRRRRK..',
      '...KRRRRRRRRK...',
      '....KKK..KKK....',
      '.....K....K.....'
    ],

    /* 执照龙 — the business licence, horns and all. */
    license: [
      '................',
      '..K..........K..',
      '..KK........KK..',
      '.KKKKKKKKKKKKKK.',
      '.KWWWWWWWWWWWWK.',
      '.KWKKKKWKKKKKWK.',
      '.KWWWWWWWWWWWWK.',
      '.KWKKWWWWKKKKWK.',
      '.KWWWWWWWWWWWWK.',
      '.KWSSKWWKSSWWWK.',
      '.KWSKKWWKKSWWWK.',
      '.KWWWWWWWWWWWWK.',
      '.KWWKRRRRKWWWWK.',
      '.KWWKRYYRKWWWWK.',
      '.KKKKKRRKKKKKKK.',
      '...KK......KK...'
    ],

    /* 印章怪 — the company chop. In China this little block is your signature. */
    chop: [
      '................',
      '......KKKK......',
      '.....KTTTTK.....',
      '.....KTttTK.....',
      '.....KTTTTK.....',
      '...KKKKKKKKKK...',
      '..KRRRRRRRRRRK..',
      '..KRWWKRRKWWRK..',
      '..KRWKKRRKKWRK..',
      '..KRRRRRRRRRRK..',
      '..KRRKKrrKKRRK..',
      '..KRRRRRRRRRRK..',
      '..KKKKKKKKKKKK..',
      '..KRRRRRRRRRRK..',
      '..KKKKKKKKKKKK..',
      '...K........K...'
    ],

    /* 外汇鲸 — cross-border money, and the rules that follow it. */
    fx: [
      '................',
      '.......K........',
      '......KbK.KK....',
      '.....KbbKKbbK...',
      '..KKKKbbbbbbK...',
      '.KBBBBBBBBBBK...',
      'KBBBBBBBBBBBBK..',
      'KBWWKBBBBBBBBK..',
      'KBWKKBBYYBBBBKK.',
      'KBBBBBBYYBBBBBBK',
      'KBBBBBYYYYBBBBBK',
      '.KBBBBBYYBBBBBK.',
      '.KBBBBBYYBBBKK..',
      '..KBBBBBBBBK....',
      '...KKKKKKKK.....',
      '................'
    ],

    /* 发票精 — the fapiao. No fapiao, no deduction. */
    fapiao: [
      '................',
      '..KKKKKKKKKKKK..',
      '..KWWWWWWWWWWK..',
      '..KWKKKKKKKKWK..',
      '..KWWWWWWWWWWK..',
      '..KWWKKWWKKWWK..',
      '..KWWWWWWWWWWK..',
      '..KWSSKWWKSSWK..',
      '..KWSKKWWKKSWK..',
      '..KWWWWWWWWWWK..',
      '..KWWKmmmmKWWK..',
      '..KWWWWWWWWWWK..',
      '..KWKRRKKRRKWK..',
      '..KWWWWWWWWWWK..',
      '..KWKWKWKWKWKK..',
      '..K.K.K.K.K.K...'
    ],

    /* 社保灵 — the labour-law spirit: contracts, probation, social insurance. */
    labor: [
      '................',
      '.....KKKKKK.....',
      '...KKGGGGGGKK...',
      '..KGGGGGGGGGGK..',
      '..KGGKKKKKKGGK..',
      '..KGKWWWWWWKGK..',
      '..KGKWKWWKWKGK..',
      '..KGKWWWWWWKGK..',
      '..KGGKWWWWKGGK..',
      '..KGGGKKKKGGGK..',
      '..KGGGGGGGGGGK..',
      '..KGGKgggggKGK..',
      '..KGGGGGGGGGGK..',
      '...KGGGGGGGGK...',
      '....KKK..KKK....',
      '.....K....K.....'
    ],

    /* 商标鸟 — first to file wins. Register before you land. */
    tm: [
      '................',
      '........KK......',
      '.......KOOK.....',
      '......KOOOOK....',
      '.....KOOOOOOK...',
      '....KOWWKOOOKK..',
      '....KOWKKOOOKYK.',
      '....KOOOOOOOKKK.',
      '...KOOOOOOOOOK..',
      '..KOOKRRRRKOOK..',
      '..KOOKRWWRKOOK..',
      '..KOOKRRRRKOOK..',
      '..KOOOOOOOOOOK..',
      '...KOOOOOOOOK...',
      '....KK.KK.KK....',
      '.....K..K.K.....'
    ],

    /* 数据蛛 — PIPL, localisation, cross-border transfer. */
    data: [
      '................',
      'K.....KKKK.....K',
      '.K...KPPPPK...K.',
      '..K.KPPPPPPK.K..',
      '...KPPPPPPPPK...',
      '..KPPWWPPWWPPK..',
      '..KPPWKPPWKPPK..',
      '..KPPPPPPPPPPK..',
      '..KPPKppppKPPK..',
      '..KPPPPPPPPPPK..',
      '...KPPPPPPPPK...',
      '..K.KPcPPcPK.K..',
      '.K..KPPPPPPK..K.',
      'K..K.KKKKKK.K..K',
      '..K...K..K...K..',
      '.K....K..K....K.'
    ],

    /* 稽查熊 — the annual audit. The boss. */
    audit: [
      '................',
      '..KK........KK..',
      '.KTTK......KTTK.',
      '.KTTKKKKKKKKTTK.',
      '.KKTTTTTTTTTTKK.',
      '..KTTTTTTTTTTK..',
      '..KTWWKTTKWWTK..',
      '..KTWKKTTKKWTK..',
      '..KTTTTKKTTTTK..',
      '..KTTKtttttKTK..',
      '..KTTKKKKKKKTK..',
      '..KTTTTTTTTTTK..',
      '.KKTTTTTTTTTTKK.',
      'KSSKTTTTTTTTKKK.',
      'KSSSK.KKKK.K....',
      '.KKK............'
    ],

    /* 注销鬼 — deregistration. Getting out is harder than getting in. */
    exitghost: [
      '................',
      '.....KKKKKK.....',
      '...KKSSSSSSKK...',
      '..KSSSSSSSSSSK..',
      '..KSSKKSSKKSSK..',
      '..KSKWWSSWWKSK..',
      '..KSKWKSSKWKSK..',
      '..KSSKKSSKKSSK..',
      '..KSSSSSSSSSSK..',
      '..KSSSKKKKSSSK..',
      '..KSSSSSSSSSSK..',
      '..KSSSSSSSSSSK..',
      '..KSSSSSSSSSSK..',
      '..KSKSSKSSKSSK..',
      '..KK.KK.KK.KKK..',
      '................'
    ],

    /* --- Player avatars ------------------------------------------------ */
    hero1: [
      '................',
      '......KKKK......',
      '.....KTTTTK.....',
      '....KTTTTTTK....',
      '....KTEEEETK....',
      '....KEEEEEEK....',
      '....KEKEEKEK....',
      '....KEEEEEEK....',
      '....KEEKKEEK....',
      '.....KEEEEK.....',
      '...KKKKKKKKKK...',
      '..KBBBBBBBBBBK..',
      '..KBBKWWWWKBBK..',
      '..KBBKWWWWKBBK..',
      '..KKKKKKKKKKKK..',
      '...KNNK..KNNK...'
    ],

    hero2: [
      '................',
      '.....KKKKKK.....',
      '....KMMMMMMK....',
      '...KMMMMMMMMK...',
      '...KMEEEEEEMK...',
      '...KMEEEEEEMK...',
      '...KMKEEEEKMK...',
      '...KMEEEEEEMK...',
      '...KMEEKKEEMK...',
      '...KMMEEEEMMK...',
      '...KKKKKKKKKK...',
      '..KCCCCCCCCCCK..',
      '..KCCKyyyyKCCK..',
      '..KCCKyyyyKCCK..',
      '..KKKKKKKKKKKK..',
      '...KNNK..KNNK...'
    ],

    hero3: [
      '................',
      '......KKKK......',
      '.....KXXXXK.....',
      '....KXXXXXXK....',
      '....KXDDDDXK....',
      '....KDDDDDDK....',
      '....KDKDDKDK....',
      '....KDDDDDDK....',
      '....KDDKKDDK....',
      '.....KDDDDK.....',
      '...KKKKKKKKKK...',
      '..KGGGGGGGGGGK..',
      '..KGGKOOOOKGGK..',
      '..KGGKOOOOKGGK..',
      '..KKKKKKKKKKKK..',
      '...KNNK..KNNK...'
    ],

    /* --- 8x8 UI icons --------------------------------------------------- */
    icoCash: [
      '..KKKK..',
      '.KYYYYK.',
      'KYKYYKYK',
      'KYYKKYYK',
      'KYKYYKYK',
      'KYKYYKYK',
      '.KYYYYK.',
      '..KKKK..'
    ],
    icoShield: [
      '.KKKKKK.',
      'KGGGGGGK',
      'KGGWWGGK',
      'KGWWWWGK',
      'KGGWWGGK',
      '.KGGGGK.',
      '..KGGK..',
      '...KK...'
    ],
    icoStar: [
      '...KK...',
      '..KYYK..',
      'KKKYYKKK',
      'KYYYYYYK',
      '.KYYYYK.',
      '.KYKKYK.',
      'KYK..KYK',
      '.K....K.'
    ],
    icoBolt: [
      '....KK..',
      '...KOK..',
      '..KOK...',
      '.KOOOOK.',
      '.KKOOK..',
      '...KOK..',
      '..KOK...',
      '..KK....'
    ]
  };

  /* Warn loudly during development if a sprite row was mis-typed. */
  function validate() {
    var bad = [];
    Object.keys(SPRITES).forEach(function (name) {
      var rows = SPRITES[name];
      var w = rows[0].length;
      rows.forEach(function (row, i) {
        if (row.length !== w) bad.push(name + ' row ' + i + ' is ' + row.length + ', expected ' + w);
        for (var c = 0; c < row.length; c++) {
          if (!(row[c] in PALETTE)) bad.push(name + ' row ' + i + ' uses unknown colour "' + row[c] + '"');
        }
      });
    });
    if (bad.length) console.warn('[pixel] sprite problems:\n' + bad.join('\n'));
    return bad;
  }

  var cache = {};

  /* Render a sprite to an offscreen canvas at 1px-per-cell, then scale on draw.
     Caching the 1x canvas keeps repeated draws cheap. */
  function base(name) {
    if (cache[name]) return cache[name];
    var rows = SPRITES[name];
    if (!rows) throw new Error('unknown sprite: ' + name);
    var w = rows[0].length, h = rows.length;
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var col = PALETTE[rows[y][x]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    cache[name] = cv;
    return cv;
  }

  /* Build an <canvas> element showing `name` scaled up by `scale`. */
  function el(name, scale) {
    scale = scale || 6;
    var src = base(name);
    var cv = document.createElement('canvas');
    cv.width = src.width * scale;
    cv.height = src.height * scale;
    cv.className = 'sprite';
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, cv.width, cv.height);
    return cv;
  }

  function dataURL(name, scale) {
    return el(name, scale).toDataURL();
  }

  /* Paint a sprite into an existing container, replacing whatever was there. */
  function mount(container, name, scale) {
    container.innerHTML = '';
    if (name) container.appendChild(el(name, scale));
    return container;
  }

  global.Pixel = {
    PALETTE: PALETTE,
    SPRITES: SPRITES,
    el: el,
    mount: mount,
    dataURL: dataURL,
    validate: validate
  };

  validate();
})(window);
