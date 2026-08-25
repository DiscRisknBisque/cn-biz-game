/*
 * content.js — shared UI strings, and the list of campaigns.
 *
 * The routes themselves live in campaign-*.js. A campaign is a self-contained
 * bundle of chapters, a boss, dex metadata, rare encounters, a secret and its
 * own endings, so adding a third route means adding one file and one entry in
 * CAMPAIGNS — nothing in the engine changes.
 */
(function (root, factory) {
  var api = factory(
    typeof module === 'object' && module.exports ? require('./level01.js') : root.Level01,
    typeof module === 'object' && module.exports ? require('./level02.js') : root.Level02,
    typeof module === 'object' && module.exports ? require('./campaign-foreign.js') : root.CampaignForeign,
    typeof module === 'object' && module.exports ? require('./campaign-solo.js') : root.CampaignSolo
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Content = api;
})(typeof self !== 'undefined' ? self : this, function (level01, level02, foreign, solo) {
  'use strict';

  var UI = {
    title:        { zh: '测测你适不适合', en: 'Can You Really' },
    title2:       { zh: '在中国做企业主', en: 'Run a Business in China?' },
    tagline:      { zh: '法律闯关小游戏 · 两条创业路线', en: 'A pixel quiz on Chinese business law — two routes' },
    start:        { zh: '开始游戏', en: 'START' },
    continueGame: { zh: '继续游戏', en: 'CONTINUE' },
    newGame:      { zh: '重新开始', en: 'NEW GAME' },
    dex:          { zh: '法律图鉴', en: 'LAW DEX' },
    about:        { zh: '关于本游戏', en: 'ABOUT' },
    back:         { zh: '返回', en: 'BACK' },
    next:         { zh: '继续', en: 'NEXT' },
    chooseHero:   { zh: '选择你的创业者', en: 'Choose your founder' },
    heroHint:     { zh: '（只影响头像，不影响剧情）', en: '(cosmetic only — the law treats you all the same)' },
    confirm:      { zh: '就决定是你了！', en: "You're the one!" },
    map:          { zh: '创业地图', en: 'ROADMAP' },
    chapter:      { zh: '章', en: 'CH.' },
    locked:       { zh: '未解锁', en: 'LOCKED' },
    cleared:      { zh: '已通关', en: 'CLEARED' },
    cash:         { zh: '资金', en: 'CASH' },
    compliance:   { zh: '合规', en: 'COMPLIANCE' },
    reputation:   { zh: '声誉', en: 'REPUTATION' },
    energy:       { zh: '精力', en: 'ENERGY' },
    appeared:     { zh: '出现了！', en: 'appeared!' },
    vGood:        { zh: '◎ 正确', en: '◎ RIGHT CALL' },
    vOk:          { zh: '△ 尚可', en: '△ SURVIVABLE' },
    vBad:         { zh: '✕ 危险', en: '✕ DANGEROUS' },
    tipTitle:     { zh: '法律小贴士', en: 'THE ACTUAL RULE' },
    lawTitle:     { zh: '法律依据', en: 'SOURCE' },
    caught:       { zh: '捕获成功！', en: 'CAUGHT!' },
    caughtDesc:   { zh: '已收录进法律图鉴', en: 'Added to your Law Dex' },
    escaped:      { zh: '它溜走了……', en: 'It got away...' },
    escapedDesc:  { zh: '图鉴里只留下了见闻记录', en: 'Logged as "seen" only' },
    settleTitle:  { zh: '本季结算', en: 'QUARTER CLOSE' },
    settleRest:   { zh: '休整恢复 · 精力', en: 'Rest · energy' },
    settleRevenue:{ zh: '经营收入 · 资金', en: 'Revenue · cash' },
    settleFine:   { zh: '罚款与滞纳金 · 资金', en: 'Fines & surcharges · cash' },
    settleStress: { zh: '善后与救火 · 精力', en: 'Firefighting · energy' },
    settleFineNote: {
      zh: '合规分过低时，罚款会自动从账上划走。这一条在现实里也一样。',
      en: 'When compliance runs low, the fines come out of the account by themselves. Same in real life.'
    },
    seen:         { zh: '见过', en: 'SEEN' },
    owned:        { zh: '已捕获', en: 'CAUGHT' },
    notSeen:      { zh: '？？？', en: '???' },
    dexNo:        { zh: '编号', en: 'No.' },
    dexType:      { zh: '类型', en: 'TYPE' },
    dexDanger:    { zh: '危险度', en: 'DANGER' },
    dexRarity:    { zh: '稀有度', en: 'RARITY' },
    dexFrom:      { zh: '出没', en: 'FOUND IN' },
    dexWeak:      { zh: '弱点', en: 'WEAK TO' },
    dexEntryLbl:  { zh: '图鉴说明', en: 'ENTRY' },
    dexDone:      { zh: '完成度', en: 'COMPLETION' },
    dexShiny:     { zh: '闪光', en: 'SHINY' },
    dexRareTag:   { zh: '稀有', en: 'RARE' },
    dexAll:       { zh: '全部', en: 'ALL' },
    dexMissing:   { zh: '未收集', en: 'MISSING' },
    dexShinyOnly: { zh: '闪光', en: 'SHINY' },
    dexLocked:    { zh: '集齐本篇其余条目后出现', en: 'Appears once you hold the rest of this route' },
    rareAppear:   { zh: '★ 稀有精灵出现了！', en: '★ A RARE ONE APPEARED!' },
    rareGot:      { zh: '答对了，它跟你走了', en: 'You got it right — it came with you' },
    shinyGot:     { zh: '✦ 闪光个体！本章满分', en: '✦ SHINY! A perfect chapter' },
    shinyHint:    { zh: '本章满分可获得闪光个体', en: 'A flawless chapter yields a shiny' },
    secretGot:    { zh: '图鉴集齐了。有个人一直在等你。', en: 'The dex is complete. Someone has been waiting for you.' },
    bossWarn:     { zh: '糟糕！是年终大考！', en: 'Uh oh — annual review time!' },
    bossHp:       { zh: '稽查进度', en: 'AUDIT' },
    finalTitle:   { zh: '测评结果', en: 'YOUR RESULT' },
    finalScore:   { zh: '综合得分', en: 'SCORE' },
    retry:        { zh: '再来一次', en: 'PLAY AGAIN' },
    share:        { zh: '复制成绩', en: 'COPY RESULT' },
    copied:       { zh: '已复制到剪贴板', en: 'Copied to clipboard' },
    langBtn:      { zh: 'EN', en: '中' },
    soundOn:      { zh: '♪ 开', en: '♪ ON' },
    soundOff:     { zh: '♪ 关', en: '♪ OFF' },
    reset:        { zh: '清除存档', en: 'ERASE SAVE' },
    resetAsk:     { zh: '确定要清除存档吗？', en: 'Erase your save file?' },
    dexEmpty:     { zh: '还没有收录任何条目。去创业吧！', en: 'Nothing logged yet. Go start a company.' },
    riskTitle:    { zh: '开始之前，请先读这一页', en: 'Read this before you start' },
    riskAck:      { zh: '我明白了，开始游戏', en: 'Understood — start' },
    riskBtn:      { zh: '风险提示', en: 'RISK NOTICE' },
    riskChip:     { zh: '！', en: '!' },
    asOfLabel:    { zh: '内容截止', en: 'Content current as of' },
    sceneRisk:    { zh: '本题涉及的风险', en: 'RISK IN THIS SCENE' },
    riskLegend:   { zh: '风险分类说明', en: 'WHAT THE CATEGORIES MEAN' },
    volatileTag:  { zh: '政策易变', en: 'MOVES OFTEN' },
    volatileNote: {
      zh: '这一项依据的是阶段性政策，额度、门槛和适用范围更新频繁，实际操作前务必核对最新官方公告。',
      en: 'This one rests on time-limited policy. Thresholds, amounts and scope are revised often — check the current official announcement before you act on it.'
    },
    adviceTitle:  { zh: '下一步该做什么', en: 'WHAT TO ACTUALLY DO NEXT' },
    disclaimerT:  { zh: '免责声明', en: 'Disclaimer' },
    disclaimer:   {
      zh: '本游戏为普法科普用途，内容基于公开的中国法律法规整理，不构成法律意见。政策（尤其是税收优惠、外汇额度、负面清单）更新频繁，实际操作前请咨询有执业资质的中国律师或会计师，并以最新官方规定为准。',
      en: 'This game is educational. It summarises publicly available Chinese law and is not legal advice. The rules move — tax reliefs, FX quotas and the negative list change often. Before you act, talk to a licensed PRC lawyer or accountant and check the current official text.'
    },
    riskBody: {
      zh: [
        '一、这是一个普法科普游戏，不是法律意见。每一关的「法律小贴士」都标注了法律依据，但游戏无法替你判断具体情形——同一个选择，在不同城市、不同行业、不同金额、不同主体形式下，结论可能完全相反。',
        '二、内容有保质期。中国的税收优惠、外汇额度、负面清单、数据出境阈值、留学生创业政策、AI 相关规定都更新频繁。标有「政策易变」的题目尤其要核对最新官方公告。',
        '三、游戏里的数值、评级和结局是娱乐设计。得了 S 不代表你的公司没有法律风险，得了 D 也不代表你一定会出事。它衡量的是你在这几十道题上的选择，不是你的真实处境。',
        '四、真的执行之前，找一位有执业资质的中国律师或会计师看一遍。一次咨询的费用通常远低于你以为的，也远低于事后补救的成本。'
      ].join('\n\n'),
      en: [
        '1. This is an educational game, not legal advice. Every tip cites the instrument it comes from, but a game cannot assess your situation — the same act can come out the opposite way in a different city, a different industry, at a different amount, or under a different type of entity.',
        '2. The content has a shelf life. Tax reliefs, FX quotas, the negative list, cross-border data thresholds, student-entrepreneur policies and the AI rules are all revised often. Scenes marked "moves often" especially need checking against the current official announcement.',
        '3. The stats, grades and endings are game design. An S does not mean your company is free of legal risk, and a D does not mean something will go wrong. It measures your answers to a few dozen questions, not your actual exposure.',
        '4. Before you act, have a licensed PRC lawyer or accountant look at it. One consultation usually costs far less than you expect, and far less than fixing it afterwards — which is the most useful advice in this entire game.'
      ].join('\n\n')
    },
    aboutBody: {
      zh: '两条路线，两种创业者。「外国人来华创业」从签证一路走到数据合规；「一人公司」写给用 AI 做出产品、开始收钱、但还没注册任何主体的独立开发者。每一关都是真实的坑，选对了收服法律精灵，选错了……年底见。两条路线共用一本图鉴。',
      en: "Two routes, two kinds of founder. The foreigner\u2019s route runs from the visa queue to data compliance. The one-person-company route is for solo builders who shipped something with AI, started taking money, and have not registered anything. Every scene is a hole real people have fallen into. Answer well and you befriend the creature; answer badly and you will meet it again in December. Both routes fill the same dex."
    },
    chooseRoute:  { zh: '选择路线', en: 'CHOOSE A ROUTE' },
    routeHint:    { zh: '两条路线进度独立，图鉴共通', en: 'Separate progress, one shared dex' },
    switchRoute:  { zh: '换条路线', en: 'SWITCH ROUTE' },
    routeCleared: { zh: '已通关', en: 'CLEARED' },
    routeNew:     { zh: '未开始', en: 'NOT STARTED' }
  };

  /* When the legal content was last reviewed. Shown on the risk notice, the
     about screen and the result, because in this subject matter a game with no
     date on it is worse than no game. */
  var AS_OF = { zh: '2026 年 8 月', en: 'August 2026' };

  /* What kind of trouble a scene is actually about. Tagging every scene this
     way is the single most useful thing the game does beyond the tips: it tells
     a player which mistakes are a fine and which are a criminal record. */
  var RISK = {
    criminal: {
      label: { zh: '刑事', en: 'CRIMINAL' },
      desc: { zh: '情节严重的可能构成犯罪，涉及刑事责任', en: 'Serious cases can amount to a crime, with criminal liability' },
      colour: 'var(--red)'
    },
    tax: {
      label: { zh: '税务', en: 'TAX' },
      desc: { zh: '补缴税款、滞纳金、罚款，并影响纳税信用等级', en: 'Back tax, late-payment surcharge, penalties, and a downgraded tax credit rating' },
      colour: '#c2521f'
    },
    admin: {
      label: { zh: '行政', en: 'REGULATORY' },
      desc: { zh: '罚款、责令改正、吊销执照、限期出境等行政处罚', en: 'Fines, rectification orders, licence revocation, orders to leave the country' },
      colour: 'var(--gold)'
    },
    civil: {
      label: { zh: '民事', en: 'CIVIL' },
      desc: { zh: '赔偿、连带责任、合同违约，由对方向你主张', en: 'Damages, joint liability and breach of contract, claimed against you by the other side' },
      colour: 'var(--blue)'
    },
    labor: {
      label: { zh: '劳动', en: 'LABOR' },
      desc: { zh: '劳动仲裁、双倍工资、社保和用工手续风险', en: 'Labor arbitration, double wages, social insurance and hiring paperwork risk' },
      colour: 'var(--green)'
    },
    status: {
      label: { zh: '资格', en: 'STATUS' },
      desc: { zh: '信用惩戒、限制高消费、限制出境、任职资格限制', en: 'Credit blacklisting, consumption and exit restrictions, bars on holding office' },
      colour: 'var(--purple)'
    }
  };

  /* Order here is the order they appear on the route select screen, and it
     drives dex numbering: the first campaign's creatures are numbered first. */
  var CAMPAIGNS = [foreign, solo];
  var LEVELS = [level01, level02];
  var LEVEL_PACK = {
    id: 'courtroom',
    title: { zh: '法庭大闯关', en: 'Courtroom Challenge' },
    subtitle: { zh: '两关 · 举证与书面合同', en: 'Two levels · proof and paperwork' },
    blurb: {
      zh: '同一条闯关线：先证明公司的钱不是你的钱，再证明第一份用工手续写在纸上。两关共用一本图鉴分区。',
      en: 'One challenge line: first prove the company money is not your money, then prove the first hire went on paper. Both levels share one dex section.'
    },
    icon: 'commingle'
  };

  function campaign(id) {
    for (var i = 0; i < CAMPAIGNS.length; i++) if (CAMPAIGNS[i].id === id) return CAMPAIGNS[i];
    return CAMPAIGNS[0];
  }

  return {
    UI: UI,
    AS_OF: AS_OF,
    RISK: RISK,
    CAMPAIGNS: CAMPAIGNS,
    LEVELS: LEVELS,
    LEVEL_PACK: LEVEL_PACK,
    campaign: campaign
  };
});
