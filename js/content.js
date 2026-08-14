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
    typeof module === 'object' && module.exports ? require('./campaign-foreign.js') : root.CampaignForeign,
    typeof module === 'object' && module.exports ? require('./campaign-solo.js') : root.CampaignSolo
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Content = api;
})(typeof self !== 'undefined' ? self : this, function (foreign, solo) {
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
    disclaimerT:  { zh: '免责声明', en: 'Disclaimer' },
    disclaimer:   {
      zh: '本游戏为普法科普用途，内容基于公开的中国法律法规整理，不构成法律意见。政策（尤其是税收优惠、外汇额度、负面清单）更新频繁，实际操作前请咨询有执业资质的中国律师或会计师，并以最新官方规定为准。',
      en: 'This game is educational. It summarises publicly available Chinese law and is not legal advice. The rules move — tax reliefs, FX quotas and the negative list change often. Before you act, talk to a licensed PRC lawyer or accountant and check the current official text.'
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

  /* Order here is the order they appear on the route select screen, and it
     drives dex numbering: the first campaign's creatures are numbered first. */
  var CAMPAIGNS = [foreign, solo];

  function campaign(id) {
    for (var i = 0; i < CAMPAIGNS.length; i++) if (CAMPAIGNS[i].id === id) return CAMPAIGNS[i];
    return CAMPAIGNS[0];
  }

  return {
    UI: UI,
    CAMPAIGNS: CAMPAIGNS,
    campaign: campaign
  };
});
