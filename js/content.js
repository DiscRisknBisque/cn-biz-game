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
    tagline:      { zh: '法律闯关小游戏 · 两条路线，一场加试', en: 'A pixel quiz on Chinese business law — two routes, one exam' },
    start:        { zh: '开始游戏', en: 'START' },
    continueGame: { zh: '继续游戏', en: 'CONTINUE' },
    newGame:      { zh: '重新开始', en: 'NEW GAME' },
    dex:          { zh: '法律图鉴', en: 'LAW DEX' },
    about:        { zh: '关于本游戏', en: 'ABOUT' },
    loginTitle:   { zh: '登录', en: 'LOG IN' },
    loginLead:    { zh: '起个名号，选个头像', en: 'Pick a name and a face' },
    loginPlaceholder: { zh: '输入昵称', en: 'Enter a nickname' },
    loginBtn:     { zh: '进入游戏', en: 'ENTER' },
    loginEmpty:   { zh: '先起个名号吧', en: 'Enter a name first' },
    loginHint:    { zh: '仅保存在本机浏览器，之后可在「关于」里更换', en: 'Saved on this device only — change it later under About' },
    welcome:      { zh: '欢迎回来', en: 'Welcome back' },
    welcomeNew:   { zh: '初次见面', en: 'Welcome' },
    changeAvatar: { zh: '换头像', en: 'CHANGE AVATAR' },
    logout:       { zh: '登出 / 换名号', en: 'LOG OUT' },
    back:         { zh: '返回', en: 'BACK' },
    next:         { zh: '继续', en: 'NEXT' },
    chooseHero:   { zh: '选择你的创业者', en: 'Choose your founder' },
    heroHint:     { zh: '（只影响头像，不影响剧情）', en: '(cosmetic only — the law treats you all the same)' },
    confirm:      { zh: '就决定是你了！', en: "You're the one!" },
    map:          { zh: '创业地图', en: 'JOURNEY' },
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
    hookTitle:    { zh: '下一步', en: 'NEXT STEP' },
    achTitle:     { zh: '隐藏成就', en: 'HIDDEN ACHIEVEMENTS' },
    achGot:       { zh: '隐藏成就解锁', en: 'ACHIEVEMENT UNLOCKED' },
    achLocked:    { zh: '？？？', en: '???' },
    achHint:      { zh: '解锁条件', en: 'HOW TO UNLOCK' },
    achRead:      { zh: '查看', en: 'READ' },
    endingAchTitle:{ zh: '达成成就', en: 'RESULT CARDS' },
    endingAchHint: { zh: '通关后解锁结果卡', en: 'Clear a route to unlock its result card' },
    endingAchOpen: { zh: '查看结果卡', en: 'OPEN RESULT CARD' },
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
      zh: '两条创业路线，一场庭审加试。「外国人来华创业」从签证一路走到数据合规；「一人公司」写给用 AI 做出产品、开始收钱、但还没注册任何主体的独立开发者。「法庭大闯关」不是第三种创业者，而是把前面学过的规则再放到庭审里考一遍：财产混同对应一人公司「防火墙」，书面劳动合同对应外国人「用人」。选对了收服法律精灵，选错了……年底见。进度彼此独立，图鉴共通。',
      en: "Two founder routes, then a courtroom exam. The foreigner\u2019s route runs from the visa queue to data compliance. The one-person-company route is for solo builders who shipped something with AI, started taking money, and have not registered anything. Courtroom Challenge is not a third kind of founder. It puts two rules you already met back in a hearing: property commingling after The Firewall, and the written labor contract after Hiring. Answer well and you befriend the creature; answer badly and you will meet it again in December. Separate progress, one shared dex."
    },
    chooseRoute:  { zh: '选择路线', en: 'CHOOSE A ROUTE' },
    routeHint:    { zh: '你选择哪一种创业模式？创始人', en: 'What type of business are you founding today, champion?' },
    switchRoute:  { zh: '换条路线', en: 'SWITCH ROUTE' },
    routeCleared: { zh: '已通关', en: 'CLEARED' },
    routeNew:     { zh: '未开始', en: 'NOT STARTED' },
    openSign:     { zh: '车库', en: 'GARAGE' },
    openCash:     { zh: '公司现金', en: 'Company cash' },
    openCashVal:  { zh: '¥100,000', en: '¥100,000' },
    openStake:    { zh: '创始人持股', en: 'Founder stake' },
    openStakeVal: { zh: '100%', en: '100%' },
    openRisk:     { zh: '法律风险', en: 'Legal risk' },
    openRiskVal:  { zh: '未知', en: 'Unknown' },
    openBoss:     { zh: '公司老板', en: 'The boss' },
    openBossVal:  { zh: '是你', en: 'You' },
    openStaff:    { zh: '公司员工', en: 'Headcount' },
    openStaffVal: { zh: '是你', en: 'You' },
    openCounsel:  { zh: '公司法务', en: 'General counsel' },
    openCounselVal:{ zh: '也是你', en: 'Also you' },
    openGo:       { zh: '走进车库', en: 'INTO THE GARAGE' },
    openAirSign:  { zh: '入境', en: 'ARRIVALS' },
    openPassport: { zh: '护照', en: 'Passport' },
    openPassportVal:{ zh: '握在右手', en: 'In the right hand' },
    openBag:      { zh: '行李箱', en: 'Suitcase' },
    openBagVal:   { zh: '握在左手', en: 'In the left hand' },
    openVisa:     { zh: '签证类型', en: 'Visa class' },
    openVisaVal:  { zh: '未知', en: 'Unknown' },
    openStay:     { zh: '停留事由', en: 'Purpose of stay' },
    openStayVal:  { zh: '待确认', en: 'To be confirmed' },
    openPermit:   { zh: '工作许可', en: 'Work permit' },
    openPermitVal:{ zh: '还没有', en: 'None yet' },
    openNext:     { zh: '现在能做的', en: 'What you may do' },
    openNextVal:  { zh: '先别上班', en: 'Do not start work' },
    openAirGo:    { zh: '走下飞机', en: 'OFF THE PLANE' }
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
    subtitle: { zh: '加试 · 混同与书面合同', en: 'Exam · commingling and the written contract' },
    blurb: {
      zh: '先完成对应章节，再上庭。财产混同对应「一人公司 · 防火墙」；书面合同对应「外国人来华创业 · 用人」。不是第三种创业者，是同一条规则的庭审加试。',
      en: 'Clear the matching chapter first, then go to the hearing. Property commingling follows The One-Person Company · The Firewall. The written contract follows Founding as a Foreigner · Hiring. This is an exam, not a third kind of founder.'
    },
    icon: 'courtroom'
  };

  /* Hidden achievements span the whole game, not one route — an achievement is
     unlocked when every dex id in `ids` has been caught, wherever they live.
     The "没写下来 ≠ 没发生" family: property commingling (混同鬼, solo route),
     the blank labour contract (双倍工资鬼) and the handshake frog (不签合同蛙).
     Only the first pierces the limited-liability shield; catching all three is
     the moment a player is meant to see why that one is the dangerous one. */
  var ACHIEVEMENTS = [
    {
      id: 'nowall',
      monster: 'veilpiercer',
      /* Each slot is one member of the family, satisfied by any listed dex id.
         Property commingling has a beast in both routes — the solo 混同鬼 and
         the WFOE 财产混同兽 — so a single-route WFOE founder can complete the
         set in one company, which is exactly what the reveal is about. */
      slots: [
        ['solo-veil', 'wfoecommingle'],
        ['doublewage'],
        ['nocontractfrog']
      ],
      title: { zh: '查无此墙', en: "The Company That Wasn't" },
      hint: {
        zh: '集齐财产混同兽、空白合同兽、不签合同蛙。',
        en: 'Catch the commingling beast, the blank-contract beast and the handshake frog.'
      },
      body: {
        zh: '你集齐了三只。系统本该弹出一句恭喜。\n\n但，弹出来的，是一份执行裁定书。\n\n财产混同兽的穿透大炮弹带着破盾的效果从天而降，一路击穿了你的组织架构。另外两只神奇兽的伤害也如影随形的砸到了你的头上。\n\n纷纷打出伤害诸如：违法解约的二倍工资、供应商违约偷走了你的样品图纸并盗版、混乱的审计账簿等。这些原来被公司有限责任的护盾挡在外面的伤害被不断的会心一击击穿。\n\n护盾破的时候，你甚至没有听到声音。只看到了最后的一连串字：被执行人。失信名单。限制高消费。限高锁解开之前，你连这个国家也出不去。\n\n而在法官面前，此时已经没有了公司的人格，只有赤裸裸的一个你。',
        en: 'You caught all three. The system was supposed to pop a congratulation.\n\nWhat popped instead was an enforcement ruling.\n\nThe commingling beast — 财产混同兽 — dropped its piercing cannon out of the sky, shield-break and all, and punched clean through your org chart. The damage from the other two beasts followed like a shadow and came down on your head.\n\nBlow after blow: 二倍工资 for the unlawful dismissal; a supplier who breached, walked off with your sample drawings and pirated them; books too tangled to audit. All the damage the company\'s limited-liability shield used to hold outside now broke in, on one critical hit after another.\n\nYou did not even hear the shield break. You just saw the last string of words: 被执行人. The 失信 list. 限制高消费. And until the 限高 lock comes off, you cannot even leave this country.\n\nAnd in front of the judge the company\'s legal personality is already gone — there is only you, stripped bare.'
      }
    }
  ];

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
    ACHIEVEMENTS: ACHIEVEMENTS,
    campaign: campaign
  };
});
