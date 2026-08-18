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
    signIn:       { zh: '登录 / 注册', en: 'SIGN IN' },
    signOut:      { zh: '退出登录', en: 'SIGN OUT' },
    account:      { zh: '我的账号', en: 'MY ACCOUNT' },
    loginTitle:   { zh: '登录后开始', en: 'Sign in to start' },
    byPhone:      { zh: '手机号', en: 'Phone' },
    byEmail:      { zh: '邮箱', en: 'Email' },
    byWechat:     { zh: '微信', en: 'WeChat' },
    phoneLabel:   { zh: '手机号码', en: 'Mobile number' },
    phoneHint:    { zh: '中国大陆 11 位，或加国家码如 +65…', en: 'Mainland 11-digit, or with a country code (+65…)' },
    emailLabel:   { zh: '邮箱地址', en: 'Email address' },
    codeLabel:    { zh: '验证码', en: 'Verification code' },
    sendCode:     { zh: '获取验证码', en: 'Send code' },
    resendIn:     { zh: '秒后可重发', en: 's until resend' },
    verifyGo:     { zh: '验证并登录', en: 'Verify and sign in' },
    wechatGo:     { zh: '使用微信登录', en: 'Continue with WeChat' },
    wechatNote:   {
      zh: '微信登录需要在微信开放平台注册应用，并由你的服务器完成 code 换取 access_token 的步骤——AppSecret 不能出现在前端。本项目只提供接入位置。',
      en: 'WeChat sign-in needs an app registered on the WeChat Open Platform, with the code-to-access_token exchange done by your server: the AppSecret can never live in the front end. This project only marks the integration point.'
    },
    demoMode:     { zh: '演示模式', en: 'DEMO MODE' },
    demoNote:     {
      zh: '本项目没有后端。验证码在本地生成并直接显示在下方，不构成任何身份验证；所有资料只存在这台设备的浏览器里。',
      en: 'There is no backend in this project. The code is generated locally and shown below — it authenticates nothing, and everything stays in this browser.'
    },
    demoCodeIs:   { zh: '演示验证码', en: 'Demo code' },
    profileTitle: { zh: '完善资料', en: 'Your details' },
    fName:        { zh: '姓名', en: 'Name' },
    fGender:      { zh: '性别', en: 'Gender' },
    fAge:         { zh: '年龄', en: 'Age' },
    fNationality: { zh: '国籍', en: 'Nationality' },
    gMale:        { zh: '男', en: 'Male' },
    gFemale:      { zh: '女', en: 'Female' },
    gOther:       { zh: '其他', en: 'Other' },
    gPrivate:     { zh: '不愿透露', en: 'Prefer not to say' },
    natOther:     { zh: '其他 / 未列出', en: 'Other / not listed' },
    saveProfile:  { zh: '保存并开始', en: 'Save and start' },
    editProfile:  { zh: '修改资料', en: 'Edit details' },
    consentLabel: {
      zh: '我已阅读并同意《隐私政策》，同意为创建账号和保存游戏进度处理上述个人信息',
      en: 'I have read the privacy notice and agree to my information being processed to create an account and save my progress'
    },
    guardianLabel: {
      zh: '我是该未成年人的父母或其他监护人，并同意上述处理',
      en: 'I am the parent or guardian of this minor and consent to the processing above'
    },
    guardianWhy:  {
      zh: '你填写的年龄不满 14 周岁。《个人信息保护法》第31条要求处理不满十四周岁未成年人的个人信息，必须取得父母或其他监护人的同意。',
      en: 'The age given is under 14. Article 31 of the Personal Information Protection Law requires the consent of a parent or guardian before processing the personal information of anyone under fourteen.'
    },
    privacyTitle: { zh: '隐私政策（摘要）', en: 'Privacy notice (summary)' },
    privacyBody: {
      zh: [
        '收集什么：登录标识（手机号或邮箱，微信登录时为 openid）、姓名、性别、年龄、国籍，以及你的游戏进度和图鉴。',
        '为什么收集：创建账号、在多次访问之间保存进度。姓名用于称呼你；年龄用于判断是否需要监护人同意；性别和国籍用于内容统计，随时可以改成「不愿透露」或「其他」。',
        '存在哪里：在这个演示版本里，全部只存在你这台设备的浏览器（localStorage）中，没有服务器，我们看不到，也不会上传。',
        '你的权利：随时查阅、更正、导出和删除。「我的账号」页面里的删除是真删除，不是停用。',
        '不做什么：不出售、不共享给第三方、不用于定向广告。'
      ].join('\n\n'),
      en: [
        'What is collected: your sign-in identifier (phone, email, or a WeChat openid), name, gender, age, nationality, and your game progress and dex.',
        'Why: to create an account and keep your progress across visits. The name is how the game addresses you; the age decides whether guardian consent is needed; gender and nationality are for content statistics and can be set to "prefer not to say" or "other" at any time.',
        'Where it lives: in this demo build, entirely in this browser (localStorage). There is no server. It is not uploaded and we cannot see it.',
        'Your rights: access, correct, export and delete at any time. Deletion on the account screen is real erasure, not deactivation.',
        'What we do not do: no selling, no sharing with third parties, no targeted advertising.'
      ].join('\n\n')
    },
    minimalNote:  {
      zh: '按最小必要原则，只有姓名是必填；性别、年龄、国籍可以选择「不愿透露」或「其他」。',
      en: 'Under data minimisation only the name is required; gender, age and nationality all offer "prefer not to say" or "other".'
    },
    accountOf:    { zh: '登录方式', en: 'Signed in with' },
    joinedAt:     { zh: '注册时间', en: 'Joined' },
    exportData:   { zh: '导出我的数据', en: 'EXPORT MY DATA' },
    deleteAcct:   { zh: '注销账号并删除数据', en: 'DELETE ACCOUNT AND DATA' },
    deleteAsk:    {
      zh: '这会永久删除你的账号资料。要同时删除游戏进度和图鉴吗？点「确定」全部删除，点「取消」只删账号。',
      en: 'This permanently deletes your account details. Also delete your game progress and dex? OK deletes everything; Cancel keeps the progress.'
    },
    deleted:      { zh: '已删除', en: 'Deleted' },
    errRequired:  { zh: '必填', en: 'Required' },
    errPhone:     { zh: '手机号格式不对', en: 'That does not look like a phone number' },
    errEmail:     { zh: '邮箱格式不对', en: 'That does not look like an email address' },
    errCode:      { zh: '请输入 6 位验证码', en: 'Enter the 6-digit code' },
    errWrongCode: { zh: '验证码不对', en: 'Wrong code' },
    errExpired:   { zh: '验证码已过期，请重新获取', en: 'Code expired — send a new one' },
    errNoCode:    { zh: '请先获取验证码', en: 'Send yourself a code first' },
    errName:      { zh: '姓名最长 40 个字符', en: 'Name can be at most 40 characters' },
    errAge:       { zh: '请输入 1–120 之间的年龄', en: 'Enter an age between 1 and 120' },
    errConsent:   { zh: '请先阅读并同意隐私政策', en: 'Please read and accept the privacy notice first' },
    errGuardian:  { zh: '需要监护人同意才能继续', en: 'Guardian consent is required to continue' },
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
        '一、这是一个普法科普游戏，不是法律意见。每一关的「法律小贴士」都标注了法律依据，但游戏无法替你判断具体情形——同样一个动作，在不同城市、不同行业、不同金额、不同主体形式下，结论可能完全相反。',
        '二、内容有保质期。中国的税收优惠、外汇额度、负面清单、数据出境阈值、留学生创业政策、AI 相关规定都更新频繁。标有「政策易变」的题目尤其要核对最新官方公告。',
        '三、游戏里的数值、评级和结局是娱乐设计。得了 S 不代表你的公司没有法律风险，得了 D 也不代表你一定会出事。它衡量的是你在这几十道题上的选择，不是你的真实处境。',
        '四、真要动手之前，找一位有执业资质的中国律师或会计师看一遍。一次咨询的费用通常远低于你以为的，也远低于事后补救的成本——这句话是这个游戏里最实用的一条建议。'
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
    status: {
      label: { zh: '资格', en: 'STATUS' },
      desc: { zh: '信用惩戒、限制高消费、限制出境、任职资格限制', en: 'Credit blacklisting, consumption and exit restrictions, bars on holding office' },
      colour: 'var(--purple)'
    }
  };

  /* Nationality options. Sovereign states only — a nationality field is not
     the place for regions — with a free-text escape hatch so nobody is forced
     into a wrong answer by a list that missed them. */
  var NATIONALITIES = [
    ['CN', '中国', 'China'],
    ['US', '美国', 'United States'],
    ['GB', '英国', 'United Kingdom'],
    ['CA', '加拿大', 'Canada'],
    ['AU', '澳大利亚', 'Australia'],
    ['NZ', '新西兰', 'New Zealand'],
    ['JP', '日本', 'Japan'],
    ['KR', '韩国', 'South Korea'],
    ['SG', '新加坡', 'Singapore'],
    ['MY', '马来西亚', 'Malaysia'],
    ['TH', '泰国', 'Thailand'],
    ['VN', '越南', 'Vietnam'],
    ['ID', '印度尼西亚', 'Indonesia'],
    ['PH', '菲律宾', 'Philippines'],
    ['IN', '印度', 'India'],
    ['PK', '巴基斯坦', 'Pakistan'],
    ['RU', '俄罗斯', 'Russia'],
    ['DE', '德国', 'Germany'],
    ['FR', '法国', 'France'],
    ['IT', '意大利', 'Italy'],
    ['ES', '西班牙', 'Spain'],
    ['PT', '葡萄牙', 'Portugal'],
    ['NL', '荷兰', 'Netherlands'],
    ['BE', '比利时', 'Belgium'],
    ['CH', '瑞士', 'Switzerland'],
    ['AT', '奥地利', 'Austria'],
    ['SE', '瑞典', 'Sweden'],
    ['NO', '挪威', 'Norway'],
    ['DK', '丹麦', 'Denmark'],
    ['FI', '芬兰', 'Finland'],
    ['IE', '爱尔兰', 'Ireland'],
    ['PL', '波兰', 'Poland'],
    ['TR', '土耳其', 'Türkiye'],
    ['IL', '以色列', 'Israel'],
    ['AE', '阿联酋', 'United Arab Emirates'],
    ['SA', '沙特阿拉伯', 'Saudi Arabia'],
    ['EG', '埃及', 'Egypt'],
    ['ZA', '南非', 'South Africa'],
    ['NG', '尼日利亚', 'Nigeria'],
    ['KE', '肯尼亚', 'Kenya'],
    ['BR', '巴西', 'Brazil'],
    ['MX', '墨西哥', 'Mexico'],
    ['AR', '阿根廷', 'Argentina'],
    ['CL', '智利', 'Chile']
  ].map(function (r) { return { code: r[0], zh: r[1], en: r[2] }; });

  /* Order here is the order they appear on the route select screen, and it
     drives dex numbering: the first campaign's creatures are numbered first. */
  var CAMPAIGNS = [foreign, solo];

  function campaign(id) {
    for (var i = 0; i < CAMPAIGNS.length; i++) if (CAMPAIGNS[i].id === id) return CAMPAIGNS[i];
    return CAMPAIGNS[0];
  }

  return {
    UI: UI,
    AS_OF: AS_OF,
    RISK: RISK,
    NATIONALITIES: NATIONALITIES,
    CAMPAIGNS: CAMPAIGNS,
    campaign: campaign
  };
});
