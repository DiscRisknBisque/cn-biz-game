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

    /* --- Rare encounters ----------------------------------------------- *
     * These only appear when you get one specific question right, so each one
     * is a single named risk rather than a whole area of law.
     * -------------------------------------------------------------------- */

    /* 双倍工资鬼 — the unsigned employment contract, torn and unhappy. */
    doublewage: [
      '................',
      '..KKKKKKKKKKKK..',
      '..KWWWWWWWWWWK..',
      '..KWKKKKKKKKWK..',
      '..KWWWWWWWWWWK..',
      '..KWSSKWWKSSWK..',
      '..KWSKKWWKKSWK..',
      '..KWWWWWWWWWWK..',
      '..KWKRKWWKRKWK..',
      '..KWKKRKKRKKWK..',
      '..KWWKKRRKKWWK..',
      '..KWKKRKKRKKWK..',
      '..KWKRKWWKRKWK..',
      '..KWWWWWWWWWWK..',
      '..KKWKKWKKWKKK..',
      '...K.K..K.K.....'
    ],

    /* 抢注鸦 — got to the trademark office before you did. */
    squatter: [
      '................',
      '.......KKKK.....',
      '......KXXXXK....',
      '.....KXXXXXXK...',
      '....KXWWKXXXKK..',
      '....KXWKKXXXKOK.',
      '....KXXXXXXXKKK.',
      '..KKXXXXXXXXXK..',
      '.KXXXXXXXXXXXK..',
      '.KXXKRRRRKXXXK..',
      '.KXXKRWWRKXXXK..',
      '.KXXKRRRRKXXXK..',
      '.KXXXXXXXXXXK...',
      '..KXXXXXXXXK....',
      '...KK.KK.KK.....',
      '....K...K.K.....'
    ],

    /* 虚开鬼 — the fake invoice. The X eyes are the point. */
    falsebill: [
      '................',
      '..KKKKKKKKKKKK..',
      '..KRRRRRRRRRRK..',
      '..KRKKKKKKKKRK..',
      '..KRRRRRRRRRRK..',
      '..KRKWKRRKWKRK..',
      '..KRRKWKKWKRRK..',
      '..KRRKWKKWKRRK..',
      '..KRKWKRRKWKRK..',
      '..KRRRRRRRRRRK..',
      '..KRRKXXXXKRRK..',
      '..KRKXXXXXXKRK..',
      '..KRRRRRRRRRRK..',
      '..KRKRKRKRKRRK..',
      '..K.K.K.K.K..K..',
      '................'
    ],

    /* 限高锁 — the travel ban on a legal representative. */
    travelban: [
      '................',
      '.....KKKKKK.....',
      '....KSSSSSSK....',
      '...KSSKKKKSSK...',
      '...KSKK..KKSK...',
      '..KKSK....KSKK..',
      '.KOOOOOOOOOOOOK.',
      'KOOOOOOOOOOOOOOK',
      'KOOWWKOOKWWOOOK.',
      'KOOWKKOOKKWOOK..',
      'KOOOOOOOOOOOOK..',
      'KOOOKKKKKKOOOK..',
      'KOOOOKXXKOOOOK..',
      '.KOOOOKXKOOOOK..',
      '..KKKKKKKKKKK...',
      '................'
    ],

    /* 负面清单蛇 — coiled around the sectors you may not enter. */
    neglist: [
      '................',
      '....KKKK........',
      '...KGGGGK.......',
      '..KGWWKGGK......',
      '..KGWKKGGK......',
      '..KGGGGGGKK.....',
      '..KGGKRRKGGKK...',
      '...KGGGGGGGGK...',
      '.....KKKGGGGGK..',
      '...KKKK..KKGGGK.',
      '..KGGGGKK..KGGK.',
      '..KGKRRKGK.KGGK.',
      '..KGKRRKGGKKGGK.',
      '..KGGKKGGGGGGGK.',
      '...KGGGGGGGGGK..',
      '....KKKKKKKKK...'
    ],

    /* 出境门 — the gate personal data has to pass through. */
    crossborder: [
      '................',
      '..KKKKKKKKKKKK..',
      '..KPPPPPPPPPPK..',
      '..KPKKKKKKKKPK..',
      '..KPKccccccKPK..',
      '..KPKcWccWcKPK..',
      '..KPKcKccKcKPK..',
      '..KPKccccccKPK..',
      '..KPKccccKcKPK..',
      '..KPKcKKKKcKPK..',
      '..KPKccccKcKPK..',
      '..KPKccccccKPK..',
      '..KPKKKKKKKKPK..',
      '..KPPPPPPPPPPK..',
      '..KKPPPPPPPPKK..',
      '...KK.KKKK.KK...'
    ],

    /* 律师 — the 100% reward. The one creature that is on your side. */
    lawyer: [
      '................',
      '......KKKK......',
      '.....KXXXXK.....',
      '....KXEEEEXK....',
      '....KEEEEEEK....',
      '....KEKEEKEK....',
      '....KEEEEEEK....',
      '....KEEKKEEK....',
      '.....KEEEEK.....',
      '...KKKKWKKKKK...',
      '..KNNNKWKNNNNK..',
      '..KNNNKWKNNNNK..',
      '..KNNNNNNNNNNK..',
      '..KNNKYYYYKNNK..',
      '..KKKKYKKYKKKK..',
      '...KNNKKKKKNNK..'
    ],

    /* --- 一人公司篇 (the solo-founder route) ---------------------------- */

    /* 个体龟 — the sole trader. The shell is everything you personally own. */
    soloturtle: [
      '................',
      '.....KKKKKK.....',
      '...KKgggggggKK..',
      '..KgggggggggggK.',
      '..KggKKgggKKggK.',
      '..KgKWWgggWWKgK.',
      '..KgKWKgggKWKgK.',
      '..KggKKgggKKggK.',
      '.KGGGGGGGGGGGGK.',
      '.KGKGGKGGKGGKGK.',
      '.KGGGGGGGGGGGGK.',
      '.KGKGGKGGKGGKGK.',
      '.KGGGGGGGGGGGGK.',
      '.KKGGGGGGGGGGKK.',
      '..KK.KK..KK.KK..',
      '...K..K..K..K...'
    ],

    /* 财产混同兽 — RMB and USD wallets crossed until the boundary disappears. */
    commingle: [
      '................',
      '..KKKK....KKKK..',
      '.KGGGGK..KBBBBK.',
      'KGGYGGGKKBBBWBBK',
      '.KGGGGGnnBBBBBK.',
      '..KGGGnnnnBBBK..',
      '...KGnnYYnnBK...',
      '....KnnKKnnK....',
      '...KnnKYYKnnK...',
      '..KGGnnnnnnBBK..',
      '.KGGGGnnnnBBBBK.',
      'KGGYGGKnnKBBBBBK',
      '.KGGGGK..KBBBBK.',
      '..KKKK....KKKK..',
      '....K......K....',
      '................'
    ],

    /* 法庭大闯关封面 — the objection pose: one index finger stabbing upward
       out of a lawyer's blue cuff, bursting a gold star bloom at the tip.
       Tension and breakthrough in 16x16 (异议あり!). */
    courtroom: [
      '...o.......Y.y..',
      '..y.......y.Y.O.',
      '.........y.KEEKy',
      '..........KEEKOo',
      '..........KEEKy.',
      '.........KEEK...',
      '........KEEK....',
      '........KEEK....',
      '..KEEEEEEEEEK...',
      '.KEEEEEEEEEEK...',
      '.KEeEEEEEEeEK...',
      '..KEEEEEEEEK....',
      '...KEEEEEEK.....',
      '...KWWWWWWK.....',
      '..KNNNNNNNNK....',
      '..KKKKKKKKKK....'
    ],

    /* 双税兽 — corporate tax on the way in, dividend tax on the way out. */
    doubletax: [
      '................',
      '..KKKK....KKKK..',
      '.KRRRRK..KRRRRK.',
      'KRRRRRRKKRRRRRRK',
      'KRWWRRRKKRRRWWRK',
      'KRWKRRRKKRRRKWRK',
      'KRRRRRRKKRRRRRRK',
      'KRRKRRRKKRRRKRRK',
      '.KRRRRRRRRRRRRK.',
      '..KRRRRRRRRRRK..',
      '..KRRKKRRKKRRK..',
      '..KRRRRRRRRRRK..',
      '..KRRRRRRRRRRK..',
      '..KKRRRRRRRRKK..',
      '...KK.KK.KK.KK..',
      '....K..K..K.....'
    ],

    /* 归属灵 — half yours, half somebody else's, and nobody wrote it down. */
    ownershade: [
      '................',
      '.....KKKKKK.....',
      '...KKppppXXKK...',
      '..KppppppXXXXK..',
      '..KppppppXXXXK..',
      '..KpWWpppXXWWK..',
      '..KpWKpppXXWKK..',
      '..KppppppXXXXK..',
      '..KppKKppXXXXK..',
      '..KppppppXXXXK..',
      '..KppppppXXXXK..',
      '..KppppppXXXXK..',
      '..KppppppXXXXK..',
      '..KKppppXXXXKK..',
      '...KKpKKXXKXK...',
      '....K.K..K.K....'
    ],

    /* 备案眼 — filings and assessments. It is watching the launch. */
    filingeye: [
      '................',
      '................',
      '....KKKKKKKK....',
      '..KKbbbbbbbbKK..',
      '.KbbbbbbbbbbbbK.',
      'KbbbbWWWWbbbbbbK',
      'KbbbWWWWWWWbbbbK',
      'KbbWWWKKWWWWbbbK',
      'KbbWWKKKKWWWbbbK',
      'KbbWWWKKWWWWbbbK',
      'KbbbWWWWWWWbbbbK',
      'KbbbbWWWWbbbbbbK',
      '.KbbbbbbbbbbbbK.',
      '..KKbbbbbbbbKK..',
      '....KKKKKKKK....',
      '................'
    ],

    /* 僵尸户 — stopped trading, never deregistered, still accruing duties. */
    zombiefirm: [
      '................',
      '..KKKKKKKKKKKK..',
      '..KnnnnnnnnnnK..',
      '..KnKKKKKKKKnK..',
      '..KnnnnnnnnnnK..',
      '..KnWnWnnWnWnK..',
      '..KnnWnnnnWnnK..',
      '..KnWnWnnWnWnK..',
      '..KnnnnnnnnnnK..',
      '..KnnKKKKKKnnK..',
      '..KnnnnnnnnnnK..',
      '..KnKnKnKnKnnK..',
      '..KnnnnnnnnnnK..',
      '..KKnnnnnnnnKK..',
      '...K.K.K.K.K.K..',
      '................'
    ],

    /* 穿透兽 — reaches through the company and takes hold of you. The boss. */
    veilpiercer: [
      '................',
      '..KK........KK..',
      '.KRRK......KRRK.',
      '.KRRKKKKKKKKRRK.',
      '.KKXXXXXXXXXXKK.',
      '..KXXXXXXXXXXK..',
      '..KXRRKXXKRRXK..',
      '..KXRKKXXKKRXK..',
      '..KXXXXXXXXXXK..',
      '..KXXKRRRRKXXK..',
      '..KXXRKKKKRXXK..',
      '..KXXXXXXXXXXK..',
      '.KKXXXXXXXXXXKK.',
      'KRRKXXXXXXXXKRRK',
      'KRRK.KKKKKK.KRRK',
      '.KK..........KK.'
    ],

    /* 借款鬼 — the shareholder loan you meant to pay back in January. */
    borrowghost: [
      '................',
      '...KKKKKKKKKK...',
      '..KyyyyyyyyyyK..',
      '..KyKKyyyyKKyK..',
      '..KyyyyyyyyyyK..',
      '..KyWWKyyKWWyK..',
      '..KyWKKyyKKWyK..',
      '..KyyyyyyyyyyK..',
      '..KyYKyyyyKYyK..',
      '..KyyYKYYKYyyK..',
      '..KyyyYYYYyyyK..',
      '..KyyyyyyyyyyK..',
      '..KyKyKyKyKyyK..',
      '..KyyyyyyyyyyK..',
      '..KKyKKyKKyKKK..',
      '...K..K..K...K..'
    ],

    /* 传染藤 — copyleft. It spreads to whatever you attach it to. */
    copyleftvine: [
      '................',
      '.K............K.',
      '.gK..KKKK....Kg.',
      '..gKKgggggKKKg..',
      '...KgggggggggK..',
      '..KggggggggggK..',
      '..KggWWggWWggK..',
      '..KggWKggKWggK..',
      '..KggggggggggK..',
      '..KggKGGGGKggK..',
      '..KgggGGGGgggK..',
      '..KggggggggggK..',
      '.KgKggggggggKgK.',
      'Kg.KKgggggKK.gK.',
      'g...KKgggKK...g.',
      '.....KKKKK......'
    ],

    /* 职务影 — your employer, standing behind your side project. */
    dayjobshadow: [
      '................',
      '......KKKK......',
      '.....KXXXXK.....',
      '....KXXXXXXK....',
      '....KXWWXXXK....',
      '....KXWKXXXK....',
      '....KXXXXXXK....',
      '....KXXKKXXK....',
      '.....KXXXXK.....',
      '...KKKKKKKKKK...',
      '..KXXXKRKXXXXK..',
      '..KXXXKRKXXXXK..',
      '..KXXXXRXXXXXK..',
      '..KXXXXRXXXXXK..',
      '..KKKKKKKKKKKK..',
      '...KXXK..KXXK...'
    ],

    /* 不签合同蛙 — offers a handshake, not a pen. The handshake binds too. */
    nocontractfrog: [
      '..KK......KK....',
      '.KWWK....KWWK...',
      '.KWKK....KWKK...',
      '.KggKKKKKKggK...',
      '.KggggggggggK.KK',
      '.KgggggggggggKgg',
      '.KggggggggggggGg',
      '.KggKGGGGGGKgGKK',
      '.KgggGGGGGGgggK.',
      '.KggggggggggggK.',
      '.KggggggggggggK.',
      '..KgggggggggggK.',
      '..KggggggggggK..',
      '.KgKgggggggKgK..',
      'Kg.KKgggggKK.gK.',
      '....KKKKKKK.....'
    ],

    /* 标识印 — the label AI-generated content has to carry. */
    labelmark: [
      '................',
      '...KKKKKKKKKK...',
      '..KcccccccccK...',
      '.KcccccccccccK..',
      '.KccWWcccWWccK..',
      '.KccWKcccKWccK..',
      '.KcccccccccccK..',
      '.KcKKcKKKcKKcK..',
      '.KcKccKcKcKccK..',
      '.KcKKcKcKcKKcK..',
      '.KccKcKcKcKccK..',
      '.KcKKcKKKcKKcK..',
      '.KcccccccccccK..',
      '..KcccccccccK...',
      '...KKKKKKKKKK...',
      '................'
    ],

    /* 会计师 — the solo route's reward, and its cheapest insurance. */
    accountant: [
      '................',
      '......KKKK......',
      '.....KTTTTK.....',
      '....KTEEEETK....',
      '....KEEEEEEK....',
      '....KEKEEKEK....',
      '....KEEEEEEK....',
      '....KEEKKEEK....',
      '.....KEEEEK.....',
      '...KKKKWKKKKK...',
      '..KCCCKWKCCCCK..',
      '..KCCCKWKCCCCK..',
      '..KCCCCCCCCCCK..',
      '..KCCKYYYYKCCK..',
      '..KKKYKKKKYKKK..',
      '...KCCKKKKCCK...'
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

    /* Suited founder portraits — same faces as hero1/2/3, navy jacket. */
    hero1suit: [
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
      '...KKWWWWWWKK...',
      '..KNNKRRRRKNNK..',
      '..KNNKWWWWKNNK..',
      '..KNNKWWWWKNNK..',
      '..KKKKKKKKKKKK..',
      '...KNNK..KNNK...'
    ],
    hero2suit: [
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
      '...KKWWWWWWKK...',
      '..KNNKBBBBKNNK..',
      '..KNNKWWWWKNNK..',
      '..KNNKWWWWKNNK..',
      '..KKKKKKKKKKKK..',
      '...KNNK..KNNK...'
    ],
    hero3suit: [
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
      '...KKWWWWWWKK...',
      '..KNNKYYYYKNNK..',
      '..KNNKWWWWKNNK..',
      '..KNNKWWWWKNNK..',
      '..KKKKKKKKKKKK..',
      '...KNNK..KNNK...'
    ],

    /* Humble STARTUP garage — 32 wide so the founder and props can stand in it. */
    garage: [
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'KTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTK',
      'KTtTtTtTtTtTtTtTtTtTtTtTtTtTtTtK',
      'KTNNNNNNKTTTTTTTTTTTTTTTTTTTTTTK',
      'KTNWWWWWNKTTTTTTTTTTTTTTTTTTTTTK',
      'KTNWKbKbWKTTTTTTTTTTTTTTTTTTTTTK',
      'KTNWWWWWNKTTTTTTTTTTTTTTTTTTTTTK',
      'KTNNNNNNKTTTTTTTTTTTTTTTTTTTTTTK',
      'KTTTTTTTTK..................KTTK',
      'KTTTTTTTTK..................KTTK',
      'KTTTTTTTTK..................KTTK',
      'KTTTTTTTTK..................KTTK',
      'KNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNK',
      'KnKnKnKnKnKnKnKnKnKnKnKnKnKnKnNK',
      'KNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNK',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'
    ],

    oldpc: [
      '................',
      '....KKKKKKKK....',
      '...KnnnnnnnnK...',
      '...KnWWWWWWKn...',
      '...KnWKKKKWKn...',
      '...KnWKggKWKn...',
      '...KnWKKKKWKn...',
      '...KnWWWWWWKn...',
      '...KnnnnnnnnK...',
      '....KKKKKKKK....',
      '......KNNK......',
      '...KKKNNNNKKK...',
      '..KTTTTTTTTTTK..',
      '..KTTTTTTTTTTK..',
      '..KKKKKKKKKKKK..',
      '................'
    ],

    bizplan: [
      '................',
      '.....KKKKKKK....',
      '....KWWWWWWWK...',
      '....KWKWWKWWK...',
      '....KWWWWWWWK...',
      '....KWKWWWWWK...',
      '....KWWWWWWWK...',
      '...KKKKKKKKK....',
      '..KWWWWWWWWK....',
      '..KWKWWKWWWK....',
      '..KWWWWWWWWK....',
      '..KWKWWWWWWK....',
      '..KWWWWWWWWK....',
      '..KKKKKKKKKK....',
      '................',
      '................'
    ],

    cashbox: [
      '................',
      '................',
      '.....KKKKKK.....',
      '....KTTTTTTK....',
      '...KT......TK...',
      '...KT......TK...',
      '...KTTTTTTTTK...',
      '..KTTTTTTTTTTK..',
      '..KT........TK..',
      '..KT.K....K.TK..',
      '..KT........TK..',
      '..KTTTTTTTTTTK..',
      '..KnnnnnnnnnnK..',
      '..KKKKKKKKKKKK..',
      '................',
      '................'
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

  /* --- shiny variants ------------------------------------------------- *
   * A shiny is the same sprite under a rotated palette. Rotating hue in HSL
   * rather than hand-picking swaps means every creature gets a variant that
   * still reads as itself, and new creatures get one for free. Outline, white
   * and the darkest shadow are left alone so shapes stay legible.
   * -------------------------------------------------------------------- */

  /* Only the outline stays put. White does not: several creatures are mostly
     paper, and leaving white alone made their shiny form indistinguishable. */
  var SHINY_FIXED = { K: 1, X: 1 };
  var SHINY_HUE_SHIFT = 145;

  function hexToRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2, h = 0, s = 0;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }

  function hslToCss(h, s, l) {
    return 'hsl(' + ((h % 360) + 360) % 360 + ',' + Math.round(s * 100) + '%,' + Math.round(l * 100) + '%)';
  }

  function shinyPalette() {
    var out = {};
    Object.keys(PALETTE).forEach(function (ch) {
      var hex = PALETTE[ch];
      if (!hex || SHINY_FIXED[ch]) { out[ch] = hex; return; }
      var rgb = hexToRgb(hex);
      var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      if (hsl[1] < 0.12) {
        /* Greys and whites have no hue to rotate, so send them gold instead,
           dimming near-white a little so the tint is actually visible. */
        out[ch] = hslToCss(45, 0.62, hsl[2] > 0.92 ? 0.78 : hsl[2]);
      } else {
        out[ch] = hslToCss(hsl[0] + SHINY_HUE_SHIFT, Math.min(1, hsl[1] * 1.15), hsl[2]);
      }
    });
    return out;
  }

  var PALETTES = { normal: PALETTE, shiny: null };

  function paletteFor(variant) {
    if (variant !== 'shiny') return PALETTE;
    if (!PALETTES.shiny) PALETTES.shiny = shinyPalette();
    return PALETTES.shiny;
  }

  var cache = {};

  /* Render a sprite to an offscreen canvas at 1px-per-cell, then scale on draw.
     Caching the 1x canvas keeps repeated draws cheap. */
  function base(name, variant) {
    var key = name + ':' + (variant || 'normal');
    if (cache[key]) return cache[key];
    var rows = SPRITES[name];
    if (!rows) throw new Error('unknown sprite: ' + name);
    var pal = paletteFor(variant);
    var w = rows[0].length, h = rows.length;
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var col = pal[rows[y][x]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    cache[key] = cv;
    return cv;
  }

  /* Build a <canvas> element showing `name` scaled up by `scale`. */
  function el(name, scale, variant) {
    scale = scale || 6;
    var src = base(name, variant);
    var cv = document.createElement('canvas');
    cv.width = src.width * scale;
    cv.height = src.height * scale;
    cv.className = 'sprite' + (variant === 'shiny' ? ' shiny' : '');
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, cv.width, cv.height);
    return cv;
  }

  function dataURL(name, scale, variant) {
    return el(name, scale, variant).toDataURL();
  }

  /* Paint a sprite into an existing container, replacing whatever was there. */
  function mount(container, name, scale, variant) {
    container.innerHTML = '';
    if (name) container.appendChild(el(name, scale, variant));
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
