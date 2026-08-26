/*
 * campaign-solo.js — the 一人公司篇 route.
 *
 * For the person who shipped something with AI, started taking money for it,
 * and has never registered anything. Six chapters plus a boss, built around the
 * one rule that catches almost all of them: for a single-shareholder company
 * the burden of proving your money is separate from the company's sits on you.
 *
 * Same shape as the other campaign — score 2 = the right call, 1 = survivable
 * but costly, 0 = how people get hurt — and `law` cites the instrument.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CampaignSolo = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CHAPTERS = [
    /* ================================================================== 1 */
    {
      id: 'solo-entity',
      monster: 'soloturtle',
      name: { zh: '个体龟', en: 'SOLOSHELL' },
      title: { zh: '开张', en: 'Going Live' },
      subtitle: { zh: '你到底是个什么身份', en: 'What exactly are you, legally' },
      dexNote: {
        zh: '背着壳走路。壳看着结实，其实那就是你名下的全部财产——房、车、存款，一样不落。',
        en: 'It carries its shell everywhere. The shell looks sturdy, but it is simply everything in your name: the flat, the car, the savings, all of it.'
      },
      intro: {
        zh: '你用 AI 写了三个月代码，产品上线了，第一笔订阅费到账。收款码是你的个人微信。',
        en: 'Three months of coding with AI, the product is live, and the first subscription payment lands — in your personal wallet.'
      },
      scenes: [
        {
          risk: ['admin', 'tax'],
          prompt: {
            zh: '产品每月稳定几千块收入了。有人说"先别注册，等做大了再说，注册了就要记账报税很麻烦"。',
            en: 'The product is bringing in a few thousand a month. Someone tells you: "Do not register yet — wait until it is bigger. Registering means bookkeeping and tax filings, it is a hassle."'
          },
          choices: [
            {
              text: { zh: '持续经营就该注册主体：开票、签合同、收企业客户的钱都要它', en: 'If it is an ongoing business, register something: you need it to invoice, to sign contracts and to take money from corporate customers' },
              score: 2, fx: { cash: -8, comp: 16, rep: 6, energy: -6 },
              verdict: { zh: '正确。没有主体，你连一张合规的发票都开不出来。', en: 'Correct. Without an entity you cannot issue a compliant invoice at all.' }
            },
            {
              text: { zh: '不注册，个人收款，反正金额不大', en: 'Do not register — take the money personally, the amounts are small' },
              score: 0, fx: { cash: 6, comp: -20, rep: -10, energy: -2 },
              verdict: { zh: '收入照样应税，而且企业客户不会跟一个开不出票的人长期合作。', en: 'The income is taxable anyway, and corporate customers will not keep buying from someone who cannot invoice.' }
            },
            {
              text: { zh: '挂靠朋友的公司走账，给他点手续费', en: 'Run it through a friend\'s company for a small cut' },
              score: 0, fx: { cash: 4, comp: -24, rep: -12, energy: -4 },
              verdict: { zh: '这既是虚开发票的高风险操作，你对这笔钱也没有任何法律上的所有权。', en: 'That is high-risk false invoicing, and you have no legal claim on the money either.' }
            }
          ],
          tip: {
            zh: '有持续经营行为就应当办理登记。三种常见选择：① 个体工商户——门槛最低，但债务以个人财产（家庭经营的以家庭财产）承担，是无限责任；② 个人独资企业——投资人对企业债务承担无限责任；③ 一人有限责任公司——原则上以出资额为限承担责任，但有个大前提，下一章会讲。三者都能开票、签合同、开对公账户。个人收款不等于不用交税：个人取得的经营所得或劳务报酬同样应当申报。',
            en: 'Carrying on a business on an ongoing basis means you should register. Three common options: (1) an individual industrial and commercial household — the lowest bar, but debts are met from your personal property (or the family\'s, if it is a family business): unlimited liability; (2) a sole proprietorship enterprise — the investor bears unlimited liability for its debts; (3) a single-shareholder limited liability company — liability limited to your capital contribution in principle, subject to one large condition covered in the next chapter. All three can invoice, contract and hold a corporate bank account. Taking money personally does not make it untaxed: business income and service income both have to be declared.'
          },
          law: {
            zh: '《市场主体登记管理条例》第2条、第8条；《民法典》第56条；《个人独资企业法》第2条；《个人所得税法》第2条',
            en: 'Regulations on Registration of Market Entities, arts. 2 & 8; Civil Code, art. 56; Sole Proprietorship Enterprise Law, art. 2; Individual Income Tax Law, art. 2'
          }
        },
        {
          risk: ['civil'],
          prompt: {
            zh: '你在个体工商户和一人有限责任公司之间纠结。一个客户的项目做砸了，索赔 80 万。两种身份下有什么区别？',
            en: 'You are torn between registering as an individual household or a single-shareholder company. A client project goes badly and they claim RMB 800,000. What is the difference?'
          },
          choices: [
            {
              text: { zh: '个体户以个人（或家庭）全部财产承担；一人公司原则上以公司财产为限，前提是你能证明财产独立', en: 'The individual household pays from all your personal (or family) property; the company pays from company property — provided you can prove the two are separate' },
              score: 2, fx: { cash: -4, comp: 18, rep: 6, energy: -6 },
              verdict: { zh: '正确。这个"前提"是一人公司全部风险的所在。', en: 'Correct — and that proviso is where all of a one-person company\'s risk lives.' }
            },
            {
              text: { zh: '都一样，反正就我一个人', en: 'No difference — it is just me either way' },
              score: 0, fx: { cash: 0, comp: -20, rep: -8, energy: -2 },
              verdict: { zh: '差别是你的房子保不保得住。', en: 'The difference is whether they can take your flat.' }
            },
            {
              text: { zh: '注册公司就绝对安全，赔多少都跟我个人无关', en: 'A company makes me untouchable — whatever it owes has nothing to do with me' },
              score: 0, fx: { cash: 2, comp: -18, rep: -6, energy: -2 },
              verdict: { zh: '这是最危险的误解。有限责任是有条件的，不是自动的。', en: 'The single most dangerous misconception. Limited liability is conditional, not automatic.' }
            }
          ],
          tip: {
            zh: '个体工商户的债务，个人经营的以个人财产承担，家庭经营的以家庭财产承担，没有"防火墙"。一人有限责任公司在正常情况下只以公司财产对外担责，股东以认缴出资额为限——但《公司法》第23条第3款规定：只有一个股东的公司，股东不能证明公司财产独立于股东自己的财产的，应当对公司债务承担连带责任。注意这是举证责任倒置：不是债权人证明你混同，而是你证明你没混同。',
            en: 'An individual household\'s debts come out of your personal property, or the family\'s where it is a family business — there is no firewall. A single-shareholder limited liability company normally answers for its own debts, with the shareholder\'s exposure capped at the subscribed capital. But art. 23(3) of the Company Law provides that where a company has only one shareholder and that shareholder cannot prove the company\'s property is independent of their own, the shareholder is jointly and severally liable for the company\'s debts. Note the direction: the creditor does not have to prove commingling — you have to disprove it.'
          },
          law: {
            zh: '《民法典》第56条；《公司法》（2023年修订）第4条、第23条第3款',
            en: 'Civil Code, art. 56; Company Law (2023 revision), arts. 4 & 23(3)'
          }
        },
        {
          risk: ['civil'],
          prompt: {
            zh: '你查到几年前的资料说"一个人只能开一家一人有限公司，而且每年必须请会计师事务所审计"。现在还是这样吗？',
            en: 'You find older guidance saying one person may own only one single-shareholder company, and that it must be audited by an accounting firm every year. Is that still right?'
          },
          choices: [
            {
              text: { zh: '不是了。2024 年 7 月起施行的新公司法删除了一人公司专节，这两条限制都取消了', en: 'No. The Company Law in force from July 2024 removed the one-person-company section, and both of those requirements went with it' },
              score: 2, fx: { cash: 0, comp: 16, rep: 6, energy: -4 },
              verdict: { zh: '正确。但取消强制审计不等于不用证明财产独立——证明责任还在你身上。', en: 'Correct. But dropping the mandatory audit did not drop the burden of proving separation — that is still yours.' }
            },
            {
              text: { zh: '还是这样，照着办就行', en: 'Still true — just follow it' },
              score: 1, fx: { cash: -6, comp: 4, rep: 0, energy: -6 },
              verdict: { zh: '照着做不违法，只是多花钱。但你的信息源已经过时了，别的地方可能也过时。', en: 'Doing it anyway is not unlawful, merely expensive. But your source is out of date, and it may be out of date elsewhere too.' }
            },
            {
              text: { zh: '既然取消了审计，那账也可以不做了', en: 'If the audit is gone, the bookkeeping can go too' },
              score: 0, fx: { cash: 4, comp: -22, rep: -8, energy: -2 },
              verdict: { zh: '恰恰相反。审计不再强制，规范的账簿反而成了你唯一的证据。', en: 'Exactly backwards. With the audit gone, clean books are the only evidence you have left.' }
            }
          ],
          tip: {
            zh: '2023 年修订、2024 年 7 月 1 日施行的《公司法》删除了原来的"一人有限责任公司特别规定"一节：取消了"一个自然人只能投资设立一个一人有限责任公司"的限制，也取消了强制年度审计的要求；同时新法允许一人设立股份有限公司。但原第63条的举证责任倒置规则被保留下来，移到了第23条第3款。此外五年实缴规则（第47条）对一人公司同样适用——注册资本别随手填 1000 万。',
            en: 'The Company Law revised in 2023 and in force from 1 July 2024 deleted the old special section on single-shareholder limited liability companies. Gone with it: the rule that a natural person could establish only one such company, and the mandatory annual audit. The new law also allows a joint stock company to be formed by a single person. What survived is the reverse burden of proof from the old art. 63, now sitting in art. 23(3). The five-year paid-in capital rule (art. 47) applies to you as well — do not casually type ten million into the registered capital field.'
          },
          law: {
            zh: '《公司法》（2023年修订，2024年7月1日施行）第23条第3款、第47条、第92条；对照原《公司法》第58条、第62条、第63条',
            en: 'Company Law (2023 revision, effective 1 July 2024), arts. 23(3), 47 & 92; compare the former arts. 58, 62 & 63'
          }
        }
      ]
    },

    /* ================================================================== 2 */
    {
      id: 'solo-veil',
      monster: 'commingle',
      name: { zh: '混同鬼', en: 'COMMINGLE' },
      title: { zh: '防火墙', en: 'The Firewall' },
      subtitle: { zh: '有限责任不是自动的', en: 'Limited liability is not automatic' },
      dexNote: {
        zh: '它不攻击你，它只是让公司的钱和你的钱慢慢分不清。等到有人来要债，你的保护盾🛡️已经被破除。',
        en: 'It does not attack. It just lets the company\'s money and your money blur into each other. By the time a creditor arrives, your shield 🛡️ has already been broken.'
      },
      intro: {
        zh: '公司注册好了，对公账户开了。第一笔大额付款到账那天，客户问："能不能打你私人账户？走公账他们财务要发票。"',
        en: 'The company is registered and the corporate account is open. The day the first big payment is due, the client asks: "Can I send it to your personal account? Our finance team wants an invoice if it goes to the company."'
      },
      scenes: [
        {
          rare: 'borrowghost',
          risk: ['tax', 'civil'],
          prompt: {
            zh: '公司账上有 30 万闲钱。你想拿 15 万出来付自己的房子首付，反正公司是你一个人的。',
            en: 'There is RMB 300,000 sitting in the company account. You want to take 150,000 for the deposit on your flat — after all, the company is entirely yours.'
          },
          choices: [
            {
              text: { zh: '不能随便拿。要么走合法分红（缴 20% 个税），要么签借款协议并在年内归还', en: 'You cannot simply take it. Either declare a proper dividend and pay the 20% tax, or sign a loan agreement and repay it within the year' },
              score: 2, fx: { cash: -10, comp: 20, rep: 8, energy: -6 },
              verdict: { zh: '正确。年度终了未归还又未用于经营的借款，会被视同分红补税。', en: 'Correct. A loan still outstanding at year-end that was not used in the business gets taxed as a dividend anyway.' }
            },
            {
              text: { zh: '直接转，记个"其他应收款——股东"就行', en: 'Just transfer it and book it as "other receivables — shareholder"' },
              score: 0, fx: { cash: 10, comp: -30, rep: -14, energy: -4 },
              verdict: { zh: '这个科目是税务稽查最爱看的一栏，也是财产混同最直接的证据。', en: 'That line item is the first thing a tax inspector looks at — and the most direct evidence of commingling there is.' }
            },
            {
              text: { zh: '转出去，账上不记，反正没人查', en: 'Move it and do not record it — nobody will look' },
              score: 0, fx: { cash: 8, comp: -34, rep: -18, energy: -4 },
              verdict: { zh: '账实不符本身就是违法，而且你等于亲手放弃了"财产独立"的举证能力。', en: 'Books that do not match reality are a violation in themselves — and you have just destroyed your own ability to prove separation.' }
            }
          ],
          tip: {
            zh: '公司的钱不是你的钱，即使公司只有你一个股东。合法把钱拿出来只有几条路：① 发工资（缴个税、走社保）；② 分红（先缴企业所得税，分红时再缴 20% 个人所得税）；③ 有真实业务的报销。股东借款要特别小心：纳税年度终了后既不归还、又未用于企业生产经营的，税务机关可视为对个人投资者的红利分配，按"利息、股息、红利所得"补征 20% 个人所得税。挂在"其他应收款——股东"上的余额，是稽查的常规切入点，也是债权人主张财产混同的现成证据。',
            en: 'The company\'s money is not your money, even when you are its only shareholder. There are only a few lawful ways out: salary (with individual income tax and social insurance), dividends (corporate income tax first, then 20% individual income tax on distribution), and reimbursement of genuine business expenses. Shareholder loans deserve particular care: where a loan is neither repaid by the end of the tax year nor used in the business, the tax authority may treat it as a dividend to the individual investor and levy 20% individual income tax on it. A balance parked under "other receivables — shareholder" is a standard audit entry point, and hands a creditor ready-made evidence of commingling.'
          },
          law: {
            zh: '财政部 国家税务总局《关于规范个人投资者个人所得税征收管理的通知》（财税〔2003〕158号）第2条；《公司法》第23条第3款、第53条',
            en: 'MOF/SAT Circular Caishui [2003] No. 158, art. 2, on individual investor income tax; Company Law, arts. 23(3) & 53'
          }
        },
        {
          risk: ['tax', 'civil'],
          prompt: {
            zh: '客户要求把项目款打到你的个人微信，说这样"省事"。金额 6 万。',
            en: 'A client wants to send the RMB 60,000 project fee to your personal WeChat because it is "simpler".'
          },
          choices: [
            {
              text: { zh: '拒绝，要求打对公账户；开票主体和收款主体必须一致', en: 'Refuse and insist on the corporate account — whoever issues the invoice has to be whoever receives the money' },
              score: 2, fx: { cash: -4, comp: 18, rep: 8, energy: -4 },
              verdict: { zh: '正确。三流一致（合同流、发票流、资金流）是最基本的自保。', en: 'Correct. Contract, invoice and payment all pointing at the same entity is the most basic protection you have.' }
            },
            {
              text: { zh: '先收个人账户，回头我自己转给公司', en: 'Take it personally and transfer it to the company later' },
              score: 0, fx: { cash: 4, comp: -24, rep: -10, energy: -4 },
              verdict: { zh: '这笔钱在账上会变成"股东借款"或来源不明的收入，两头都难解释。', en: 'On the books that becomes a shareholder loan or unexplained income. Neither is easy to explain.' }
            },
            {
              text: { zh: '收个人账户，这笔就不进公司账了', en: 'Take it personally and keep it off the company books entirely' },
              score: 0, fx: { cash: 8, comp: -32, rep: -16, energy: -4 },
              verdict: { zh: '隐匿收入是偷税，同时也彻底坐实了公私不分。', en: 'Concealing income is tax evasion — and it settles the commingling question against you for good.' }
            }
          ],
          tip: {
            zh: '认定财产混同，法院看的就是这些日常细节：公司收入是否进公司账户、有没有独立完整的账簿、股东个人开支是否由公司买单、公司资产和个人资产能不能分清、有没有独立的决策记录。用个人收款码收公司业务的钱，是最典型也最容易被抓住的一条。做到"三流一致"——合同签的是公司、发票开的是公司、钱收进公司账户——既是税务要求，也是你将来证明财产独立的证据链。',
            en: 'When a court decides whether property has been commingled, it looks at exactly these everyday details: does company revenue land in the company account, are there complete and independent books, does the company pay your personal expenses, can company assets be told apart from yours, is there any record of decisions being made. Collecting business payments through a personal payment code is the most typical and most easily proven failure of all. Keeping contract, invoice and payment aligned on the company is both a tax requirement and the evidence chain you will need later.'
          },
          law: {
            zh: '《公司法》第23条；《全国法院民商事审判工作会议纪要》（九民纪要）第10条关于人格混同的认定',
            en: 'Company Law, art. 23; SPC Minutes of the National Courts\' Civil and Commercial Trial Work Conference, para. 10, on personality confusion'
          }
        },
        {
          risk: ['civil'],
          prompt: {
            zh: '既然新公司法不再强制一人公司做年度审计，你打算怎么证明"公司财产独立于股东财产"？',
            en: 'With the mandatory annual audit gone, how do you plan to prove the company\'s property is independent of yours?'
          },
          choices: [
            {
              text: { zh: '独立账户 + 规范账簿 + 每年财务报告，必要时仍主动做审计留证', en: 'A separate account, proper books, annual financial statements — and still commission an audit when the stakes justify it' },
              score: 2, fx: { cash: -12, comp: 20, rep: 8, energy: -8 },
              verdict: { zh: '正确。这是唯一能在法庭上拿得出手的东西。', en: 'Correct. It is the only thing you can actually put in front of a judge.' }
            },
            {
              text: { zh: '我记得清楚哪笔是公司的哪笔是我的，需要时再解释', en: 'I know which money is which — I can explain it if it ever comes up' },
              score: 0, fx: { cash: 2, comp: -22, rep: -8, energy: -2 },
              verdict: { zh: '举证责任在你，"我记得"不是证据。', en: 'The burden is on you, and "I remember" is not evidence.' }
            },
            {
              text: { zh: '反正法律没强制要求了，就不做了', en: 'The law no longer requires it, so skip it' },
              score: 0, fx: { cash: 6, comp: -26, rep: -10, energy: -2 },
              verdict: { zh: '取消的是强制审计这道手续，不是你的举证责任。', en: 'What was removed is the procedural requirement, not your burden of proof.' }
            }
          ],
          tip: {
            zh: '举证责任倒置意味着：债权人只要证明"这是一人公司"，剩下的就得你来证明。你需要的证据通常包括：公司独立的银行账户流水、完整的会计账簿和财务报表、公司与股东之间往来的书面依据（借款协议、分红决议、劳动合同和工资记录）、办公场所和资产的归属凭证。审计报告虽然不再是法定必备，但在诉讼中仍是分量最重的一份证据，重大交易或有潜在纠纷时值得主动做。',
            en: 'A reversed burden means the creditor need only show that this is a single-shareholder company; everything after that is yours to prove. The evidence you will want: bank statements from a genuinely separate company account, complete books and financial statements, written basis for every movement between you and the company (loan agreements, dividend resolutions, an employment contract and payroll records), and documents showing who owns the premises and the assets. An audit report is no longer legally required, but it remains the single heaviest piece of evidence in litigation and is worth commissioning where the exposure is real.'
          },
          law: {
            zh: '《公司法》第23条第3款；《民事诉讼法》第67条；《会计法》第3条、第9条',
            en: 'Company Law, art. 23(3); Civil Procedure Law, art. 67; Accounting Law, arts. 3 & 9'
          }
        }
      ]
    },

    /* ================================================================== 3 */
    {
      id: 'solo-tax',
      monster: 'doubletax',
      name: { zh: '双税兽', en: 'DOUBLETAX' },
      title: { zh: '记账', en: 'The Books' },
      subtitle: { zh: '钱怎么进来，怎么出去', en: 'How money comes in, and how it gets out' },
      dexNote: {
        zh: '两个头。一个在公司挣钱的时候咬一口，另一个在你把钱拿回家的时候再咬一口。',
        en: 'Two heads. One bites when the company earns the money, the other bites again when you take it home.'
      },
      intro: {
        zh: '第一个完整年度结束。你打开账本，发现赚的钱和你能花的钱完全是两个数字。',
        en: 'Your first full year closes. You open the books and find that what the company earned and what you can spend are two very different numbers.'
      },
      scenes: [
        {
          risk: ['tax'],
          prompt: {
            zh: '公司今年利润 40 万，你想全部拿出来自己用。一人有限公司和个体工商户，税负差在哪？',
            en: 'The company made RMB 400,000 this year and you want all of it. Where does the tax differ between a single-shareholder company and an individual household?'
          },
          choices: [
            {
              text: { zh: '公司先缴企业所得税，分红时再缴 20% 个税，是两层；个体户只按经营所得缴一次个税', en: 'The company pays corporate income tax, then 20% again when it distributes — two layers. The individual household pays individual income tax on business income once' },
              score: 2, fx: { cash: -4, comp: 18, rep: 6, energy: -6 },
              verdict: { zh: '正确。但别只看税率，还要看责任隔离和客户是否认可。', en: 'Correct — but do not choose on tax rate alone. Weigh liability shielding and whether your customers accept it.' }
            },
            {
              text: { zh: '一样的，最后都是交给国家', en: 'Same thing — it all goes to the state in the end' },
              score: 0, fx: { cash: 0, comp: -16, rep: -6, energy: -2 },
              verdict: { zh: '结构不同，税负和风险都差得很远。', en: 'Different structures carry very different tax and very different risk.' }
            },
            {
              text: { zh: '公司利润不分红就不用交税，一直留在账上', en: 'Do not distribute and there is no tax — just leave it in the company' },
              score: 1, fx: { cash: 2, comp: -6, rep: -2, energy: -2 },
              verdict: { zh: '企业所得税该缴还是要缴，只是暂时没有那 20%。而且钱在公司里，你个人还是不能花。', en: 'The corporate income tax is still due; only the 20% is deferred. And while it sits there, you still cannot spend it.' }
            }
          ],
          tip: {
            zh: '一人有限公司：先缴企业所得税（小型微利企业有优惠税率，具体以最新政策为准），税后利润分配给股东时再按"利息、股息、红利所得"缴 20% 个人所得税，这就是俗称的双重征税。个体工商户和个人独资企业不缴企业所得税，其经营所得按 5%–35% 五级超额累进税率缴个人所得税。哪个划算取决于收入规模和费用结构，但选择不该只看税——公司形态提供责任隔离，也更容易被企业客户、平台和投资人接受。',
            en: 'A single-shareholder company pays corporate income tax first (with preferential rates for small low-profit enterprises — check the current policy), and then 20% individual income tax as dividend income when the after-tax profit is distributed. That is the double layer. Individual households and sole proprietorships pay no corporate income tax; their business income is taxed to the individual on a five-band progressive scale from 5% to 35%. Which comes out ahead depends on your revenue and cost structure — but do not decide on tax alone. The company form gives you liability separation and is far easier for corporate customers, platforms and investors to deal with.'
          },
          law: {
            zh: '《企业所得税法》第4条、第28条；《个人所得税法》第2条、第3条及附表；财政部 税务总局关于小微企业税收优惠的最新公告',
            en: 'Enterprise Income Tax Law, arts. 4 & 28; Individual Income Tax Law, arts. 2 & 3 and schedules; current MOF/SAT announcements on small-enterprise relief'
          }
        },
        {
          risk: ['tax', 'criminal'],
          volatile: true,
          prompt: {
            zh: '有人推荐："去税收洼地注册个个人独资企业，申请核定征收，综合税负能压到 3% 以下。"',
            en: 'Someone suggests: "Register a sole proprietorship in a tax-incentive district, apply for assessed collection, and get your all-in rate under 3%."'
          },
          choices: [
            {
              text: { zh: '谨慎。核定征收近年大幅收紧，没有真实经营的空壳注册风险很高', en: 'Be careful. Assessed collection has tightened sharply, and a shell with no real operations is high risk' },
              score: 2, fx: { cash: -4, comp: 18, rep: 8, energy: -6 },
              verdict: { zh: '正确。这几年因为这个被追缴补税加罚款的案例非常多。', en: 'Correct. There have been a great many back-tax-plus-penalty cases from exactly this in recent years.' }
            },
            {
              text: { zh: '照做，很多人都这么干', en: 'Do it — plenty of people do' },
              score: 0, fx: { cash: 10, comp: -28, rep: -14, energy: -4 },
              verdict: { zh: '"很多人都这么干"在被查到的那天不构成任何抗辩。', en: '"Everyone does it" is not a defence on the day you are examined.' }
            },
            {
              text: { zh: '通过灵活用工平台开票，让平台帮我完税', en: 'Invoice through a gig-work platform and let them handle the tax' },
              score: 0, fx: { cash: 8, comp: -26, rep: -12, energy: -4 },
              verdict: { zh: '没有真实用工关系的平台开票，性质上就是虚开。', en: 'Platform invoices with no genuine engagement behind them are false invoicing, plain and simple.' }
            }
          ],
          tip: {
            zh: '核定征收是对账簿不健全、难以查账的纳税人采用的征收方式，不是一种可以随意挑选的优惠。近年监管明显收紧：持有权益性投资的个人独资企业、合伙企业已一律适用查账征收；对没有实际经营场所、人员和业务的"空壳"注册，各地也在集中清理。判断标准始终是业务是否真实发生、发票是否与实际经营相符。把税务筹划建立在虚构业务上，节省的是当期现金，换来的是补税、滞纳金（按日万分之五）和 50%–5 倍罚款，情节严重的构成逃税罪。',
            en: 'Assessed collection is a method for taxpayers whose books are too incomplete to audit — not a relief you get to choose. Supervision has tightened markedly: sole proprietorships and partnerships holding equity investments are now all on audited collection, and local authorities have been clearing out shell registrations with no real premises, staff or business. The test is always whether the transaction genuinely happened and whether the invoice matches the actual business. Planning built on fabricated activity saves cash this year and buys back tax, late-payment surcharge at 0.05% a day, penalties of 50% to five times the tax, and in serious cases the offence of tax evasion.'
          },
          law: {
            zh: '《税收征收管理法》第35条、第63条；财政部 税务总局公告2021年第41号；《刑法》第201条',
            en: 'Tax Collection and Administration Law, arts. 35 & 63; MOF/SAT Announcement No. 41 (2021); Criminal Law, art. 201'
          }
        },
        {
          risk: ['tax', 'criminal'],
          volatile: true,
          prompt: {
            zh: '你是小规模纳税人，月销售额一直在免征增值税的门槛附近。一个企业客户要求开 6% 的增值税专用发票。',
            en: 'You are a small-scale VAT taxpayer hovering around the VAT exemption threshold. A corporate client asks for a 6% special VAT invoice.'
          },
          choices: [
            {
              text: { zh: '先搞清楚自己能不能开专票、开了会不会影响免征，再和客户谈价格', en: 'Work out whether you can issue a special invoice and what it does to your exemption, then renegotiate the price' },
              score: 2, fx: { cash: -4, comp: 16, rep: 6, energy: -6 },
              verdict: { zh: '正确。开专票通常意味着放弃这部分免税，价格要重新算。', en: 'Correct. Issuing a special invoice generally means giving up the exemption on that amount, so the price has to move.' }
            },
            {
              text: { zh: '答应下来，票的事让代账公司想办法', en: 'Say yes and let the bookkeeping agency figure the invoice out' },
              score: 0, fx: { cash: 4, comp: -20, rep: -8, energy: -4 },
              verdict: { zh: '发票的法律责任在你，不在代账公司。', en: 'The legal responsibility for the invoice is yours, not the agency\'s.' }
            },
            {
              text: { zh: '拆成几个月开，把每月都压在免征额以下', en: 'Split it across months so every month stays under the exemption' },
              score: 0, fx: { cash: 4, comp: -22, rep: -10, energy: -4 },
              verdict: { zh: '人为拆分与实际业务不符的开票，属于虚开的风险区。', en: 'Splitting invoices so they no longer match the real transaction is squarely in false-invoicing territory.' }
            }
          ],
          tip: {
            zh: '小规模纳税人有增值税起征点优惠（阶段性政策，额度和适用范围以最新公告为准），但开具增值税专用发票的部分通常不能享受免征，需要照章缴纳。所以企业客户要专票时，本质上是在要求你让出这部分税负，价格应当相应调整。要特别注意：发票必须与真实交易的时间、金额、内容一致，为了适用优惠而人为拆分或调整开票时点，一旦被认定与实际经营不符，风险远大于省下的那点税。代账公司是服务方，法律责任始终在纳税人自己身上。',
            en: 'Small-scale taxpayers get a VAT threshold exemption, though the amount and scope come from time-limited announcements — check the current one. Amounts covered by a special VAT invoice generally fall outside the exemption and must be paid. So when a corporate client asks for a special invoice, they are effectively asking you to absorb that tax, and the price should move accordingly. Above all, the invoice must match the real transaction in timing, amount and content. Splitting or shifting invoices to fit inside a relief is a far bigger risk than the tax it saves once it is found not to match the actual business. A bookkeeping agency is a service provider; the legal responsibility stays with the taxpayer.'
          },
          law: {
            zh: '《增值税暂行条例》第21条；《发票管理办法》第21条；现行小规模纳税人增值税优惠公告（以最新为准）',
            en: 'Interim Regulations on VAT, art. 21; Measures for the Administration of Invoices, art. 21; the current announcement on small-scale taxpayer VAT relief'
          }
        }
      ]
    },

    /* ================================================================== 4 */
    {
      id: 'solo-code',
      monster: 'ownershade',
      name: { zh: '归属灵', en: 'OWNERSHADE' },
      title: { zh: '代码', en: 'The Code' },
      subtitle: { zh: '你写的东西到底是谁的', en: 'Who actually owns what you wrote' },
      dexNote: {
        zh: '一半亮一半暗。亮的那半是你以为属于你的，暗的那半是合同没写清楚的部分。',
        en: 'Half lit, half dark. The lit half is what you assume is yours; the dark half is whatever the contract failed to say.'
      },
      intro: {
        zh: '产品跑起来了。有人问你："这些代码，你确定是你的吗？"',
        en: 'The product is running. Someone asks you: "This code — are you sure it is yours?"'
      },
      scenes: [
        {
          rare: 'dayjobshadow',
          risk: ['civil'],
          prompt: {
            zh: '你还有一份全职工作，做的也是软件。这个产品是你晚上和周末用自己的电脑写的，方向和公司业务不完全一样但沾边。',
            en: 'You still have a full-time software job. You built this product at night and at weekends on your own machine, in an area adjacent to — but not the same as — your employer\'s business.'
          },
          choices: [
            {
              text: { zh: '先查劳动合同里的知识产权和竞业条款，保留自有设备、业余时间、与本职工作无关的证据', en: 'Read the IP and non-compete clauses in your employment contract, and keep evidence that it was your own kit, your own time, and unrelated to your job' },
              score: 2, fx: { cash: -4, comp: 20, rep: 8, energy: -8 },
              verdict: { zh: '正确。这三样证据决定了它是不是职务作品。', en: 'Correct. Those three pieces of evidence decide whether it is a work made in the course of employment.' }
            },
            {
              text: { zh: '业余时间做的当然归我，不用管公司', en: 'I made it in my own time, so obviously it is mine' },
              score: 0, fx: { cash: 2, comp: -24, rep: -10, energy: -4 },
              verdict: { zh: '"业余时间"只是其中一个因素，不是护身符。', en: '"My own time" is one factor, not a shield.' }
            },
            {
              text: { zh: '干脆写进劳动合同让公司放弃权利', en: 'Just get the employer to waive its rights in the employment contract' },
              score: 1, fx: { cash: -6, comp: 6, rep: 2, energy: -8 },
              verdict: { zh: '有书面约定确实最稳妥，但你要先做好对方不同意的准备。', en: 'A written waiver is the safest outcome — but be ready for the answer to be no.' }
            }
          ],
          tip: {
            zh: '自然人为完成单位工作任务创作的作品属于职务作品。一般职务作品著作权归作者，单位在业务范围内有优先使用权；但计算机软件等作品，如果主要利用了单位的物质技术条件创作并由单位承担责任，则作者只享有署名权，其余著作权归单位。所以关键证据是：用谁的设备、在什么时间、是否属于本职工作任务、是否使用了单位的资料或技术条件。此外还要看竞业限制条款——竞业限制只能约定给高级管理人员、高级技术人员和其他负有保密义务的人员，期限不超过两年，且单位必须按月支付补偿；单位没付补偿的，你可以请求解除。',
            en: 'A work created by an individual in the course of carrying out an employer\'s tasks is a work made in employment. For ordinary such works the copyright belongs to the author, with the employer holding a priority right to use it within its business. But for computer software and similar works, where creation mainly used the employer\'s material and technical resources and the employer bears responsibility, the author keeps only attribution and the employer takes the rest. So the evidence that matters is: whose equipment, whose time, whether it fell within your job duties, and whether you used the employer\'s materials. Then check any non-compete: it may only be imposed on senior management, senior technical staff and others under confidentiality duties, lasts at most two years, and the employer must pay monthly compensation — if it does not, you can ask to be released.'
          },
          law: {
            zh: '《著作权法》第18条；《计算机软件保护条例》第13条；《劳动合同法》第23条、第24条',
            en: 'Copyright Law, art. 18; Regulations on Computer Software Protection, art. 13; Labour Contract Law, arts. 23 & 24'
          }
        },
        {
          risk: ['civil'],
          prompt: {
            zh: '你产品里大量界面图和一部分代码是 AI 生成的。有人直接抄了你的界面。你能主张著作权吗？',
            en: 'Much of your product\'s UI art and some of its code came out of an AI. Someone copies your interface wholesale. Can you claim copyright?'
          },
          choices: [
            {
              text: { zh: '要看有没有体现你的独创性智力投入；已有判例支持，但不是所有 AI 生成内容都自动受保护', en: 'It turns on whether your own creative intellectual input shows in the result. Courts have upheld such claims, but AI output is not automatically protected' },
              score: 2, fx: { cash: -2, comp: 18, rep: 8, energy: -6 },
              verdict: { zh: '正确。保留提示词、参数、迭代过程和修改记录，这些就是你的证据。', en: 'Correct. Keep the prompts, parameters, iterations and edits — that is your evidence.' }
            },
            {
              text: { zh: 'AI 生成的东西没有著作权，谁都能用', en: 'AI output has no copyright — anyone can use it' },
              score: 0, fx: { cash: 0, comp: -16, rep: -8, energy: -2 },
              verdict: { zh: '过于绝对。国内已有生效判决认定具有独创性投入的 AI 生成图片构成作品。', en: 'Too absolute. There are already effective judgments finding AI-generated images with creative input to be protected works.' }
            },
            {
              text: { zh: '我用工具生成的就归我，跟画笔一样', en: 'I made it with a tool, so it is mine — same as a paintbrush' },
              score: 1, fx: { cash: 0, comp: -4, rep: 0, energy: -2 },
              verdict: { zh: '方向对，但"输入一句提示词"和"反复调参修改"在法律上不是一回事。', en: 'Right instinct, but typing one prompt and iterating on parameters are not the same thing in law.' }
            }
          ],
          tip: {
            zh: '中国司法实践对 AI 生成内容的态度正在形成中。北京互联网法院在 2023 年的一起案件中认定：原告通过设计提示词、调整参数、多轮筛选修改生成的图片，体现了其独创性智力投入，构成美术作品，受著作权法保护。核心标准仍是《著作权法》要求的独创性——是否有自然人的智力投入并形成了个性化表达。实务建议：完整保存提示词、模型与参数、生成过程和后期修改记录；同时注意反向风险，如果 AI 输出与他人在先作品实质性相似，你使用它仍可能构成侵权。',
            en: 'Chinese practice on AI-generated content is still taking shape. In a 2023 case the Beijing Internet Court found that images produced by the plaintiff through designing prompts, adjusting parameters and selecting and revising across multiple rounds reflected their own creative intellectual input, and were protected artistic works. The test remains originality under the Copyright Law: is there human intellectual input producing a personal expression. Practically: keep the prompts, the model and parameters, the generation history and your subsequent edits. And watch the risk in the other direction — if the output is substantially similar to someone\'s earlier work, using it can still infringe.'
          },
          law: {
            zh: '《著作权法》第3条；北京互联网法院（2023）京0491民初11279号',
            en: 'Copyright Law, art. 3; Beijing Internet Court, (2023) Jing 0491 Min Chu No. 11279'
          }
        },
        {
          rare: 'copyleftvine',
          risk: ['civil'],
          prompt: {
            zh: 'AI 帮你补全了一段很好用的代码，你顺手合并了。后来发现它来自一个 GPL 协议的开源项目。你的产品是闭源商业软件。',
            en: 'The AI completed a genuinely useful chunk of code and you merged it. You later find it came from a GPL-licensed project. Your product is closed-source commercial software.'
          },
          choices: [
            {
              text: { zh: '认真评估：GPL 有传染性，可能要求你整个衍生作品也以 GPL 开源；先隔离或替换这段代码', en: 'Take it seriously: GPL is copyleft and may require your whole derivative work to be released under GPL too — isolate or replace that code' },
              score: 2, fx: { cash: -12, comp: 20, rep: 8, energy: -12 },
              verdict: { zh: '正确。中国法院已经把开源协议当作有约束力的合同来处理。', en: 'Correct. Chinese courts already treat open-source licences as binding contracts.' }
            },
            {
              text: { zh: '没人会发现，代码是编译过的', en: 'Nobody will find out — it ships compiled' },
              score: 0, fx: { cash: 6, comp: -26, rep: -16, energy: -4 },
              verdict: { zh: '一旦被发现，后果不只是道歉，可能要开源整个产品或赔偿。', en: 'If it is found, the remedy is not an apology — it can be releasing the whole product or paying damages.' }
            },
            {
              text: { zh: 'AI 生成的代码不算抄，责任在 AI 厂商', en: 'AI-generated code is not copying — that is the vendor\'s problem' },
              score: 0, fx: { cash: 2, comp: -22, rep: -10, energy: -4 },
              verdict: { zh: '把代码合并进产品并对外发布的是你，责任跟着发布者走。', en: 'You are the one who merged it and shipped it. Liability follows whoever distributes.' }
            }
          ],
          tip: {
            zh: '开源不等于免费随便用。GPL 类协议具有"传染性"（copyleft）：以其为基础形成的衍生作品对外分发时，通常也必须以相同协议开源并提供源代码；MIT、Apache 等宽松协议则主要要求保留版权声明和许可文本，Apache 2.0 还涉及专利授权条款。中国法院已在判决中确认 GPL 协议具有合同性质，违反可以构成违约。AI 补全大幅提高了无意中引入受限代码的概率——建议在 CI 中接入开源合规扫描（SCA），保留依赖清单和许可证记录，并把"许可证检查"写进发布流程。',
            en: 'Open source is not "free to use however you like". GPL-family licences are copyleft: when you distribute a derivative work built on them, you generally have to release it under the same licence with source. Permissive licences such as MIT and Apache mainly require you to keep the copyright notice and licence text, with Apache 2.0 adding patent terms. Chinese courts have held that the GPL has the character of a contract and that breaching it can amount to breach of contract. AI completion has sharply raised the odds of pulling restricted code in by accident — put an SCA licence scan in CI, keep a dependency and licence inventory, and make the licence check part of your release checklist.'
          },
          law: {
            zh: '《著作权法》第53条；《民法典》第465条、第577条；北京知识产权法院（2019）京73民终2020号',
            en: 'Copyright Law, art. 53; Civil Code, arts. 465 & 577; Beijing IP Court, (2019) Jing 73 Min Zhong No. 2020'
          }
        },
        {
          risk: ['civil'],
          prompt: {
            zh: '赶进度，你把一个核心模块外包给了一个朋友的小团队。微信里说好了价钱和交期，"合同就不签了，都熟人"。他们交了活，你付了钱。',
            en: 'To make a deadline you outsource a core module to a friend\'s small team. Price and timeline are settled over WeChat — "no need for a contract, we all know each other". They deliver, you pay.'
          },
          choices: [
            {
              text: { zh: '交付前就签书面委托开发合同，写明知识产权归你、验收标准和违约责任', en: 'Sign a written development contract before delivery — IP assigned to you, acceptance criteria, and what happens on breach' },
              score: 2, fx: { cash: -6, comp: 20, rep: 6, energy: -8 },
              verdict: { zh: '正确。委托作品没约定归属的，著作权默认归受托方——写代码的人，不是付钱的你。', en: 'Correct. Where a commissioned work leaves ownership unagreed, copyright defaults to the contractor — the people who wrote it, not the one who paid.' }
            },
            {
              text: { zh: '钱是我付的，东西当然归我，不用另外约定', en: 'I paid for it, so of course it is mine — no need to agree anything extra' },
              score: 0, fx: { cash: 2, comp: -22, rep: -8, energy: -2 },
              verdict: { zh: '付款不等于取得著作权。将来他拿你这套代码去接别的单，你拦不住。', en: 'Paying does not transfer copyright. When they take your code to their next client, you cannot stop them.' }
            },
            {
              text: { zh: '微信记录都在，先不签，出问题再补', en: 'The WeChat log is all there — skip the contract, paper it if trouble comes' },
              score: 1, fx: { cash: 0, comp: 2, rep: 0, energy: -4 },
              verdict: { zh: '记录能证明合同成立、付了多少钱，但证明不了知识产权归你——归属默认还是受托方。', en: 'The log can prove a contract formed and what you paid, but not that the IP is yours — by default it still sits with the contractor.' }
            }
          ],
          tip: {
            zh: '《民法典》第469、490条：合同不必是书面的，口头说好、一方已履行且对方接受，合同同样成立——所以"没签合同"从不等于"没有合同、没有责任"。真正的漏洞在两处：一是举证，价钱、验收标准、交期全靠聊天记录拼；二是知识产权归属。受委托创作的作品，著作权的归属由双方约定；没有约定或约定不明的，著作权属于受托人（《著作权法》第19条）。委托开发完成的发明创造，申请专利的权利也默认属于研究开发人（《民法典》第859条）。换句话说：你出钱让人写的代码，不签书面权属约定，法律上可能不归你。把"知识产权归委托方所有"写进合同，是这一步最便宜的一句话。',
            en: 'Civil Code arts. 469 and 490: a contract need not be in writing — agreed aloud, performed by one side and accepted by the other, it is formed all the same, so "no contract signed" never means "no contract, no liability". The real gaps are two: proof — price, acceptance and timeline all rest on a chat log — and IP ownership. For a commissioned work, ownership is whatever the parties agree; absent or unclear agreement, copyright belongs to the contractor (Copyright Law art. 19). The right to patent a commissioned invention likewise defaults to the developer (Civil Code art. 859). Put plainly: code you paid someone to write may not be yours without a written assignment. One line — "all IP vests in the commissioning party" — is the cheapest sentence in this whole step.'
          },
          law: {
            zh: '《民法典》第469条、第490条、第859条；《著作权法》第19条',
            en: 'Civil Code, arts. 469, 490 & 859; Copyright Law, art. 19'
          }
        }
      ]
    },

    /* ================================================================== 5 */
    {
      id: 'solo-ai',
      monster: 'filingeye',
      name: { zh: '备案眼', en: 'FILINGEYE' },
      title: { zh: '上线', en: 'Shipping It' },
      subtitle: { zh: 'AI 产品的合规门槛', en: 'What an AI product has to clear' },
      dexNote: {
        zh: '一只不眨的眼睛。它不在乎你的产品好不好用，只在乎你有没有备案、有没有标识、有没有留痕。',
        en: 'An eye that does not blink. It has no view on whether your product is any good — only on whether you filed, labelled and logged.'
      },
      intro: {
        zh: '你的 AI 应用准备开放注册了。域名买好了，服务器在国内，就差一个上线按钮。',
        en: 'Your AI app is ready to open registration. Domain bought, servers in China, one button left to press.'
      },
      scenes: [
        {
          risk: ['admin'],
          prompt: {
            zh: '你的产品是一个面向公众开放的 AI 写作助手，用户可以生成并公开分享内容。上线前需要做什么？',
            en: 'Your product is a publicly available AI writing assistant where users generate content and can publish it. What has to happen before launch?'
          },
          choices: [
            {
              text: { zh: '具有舆论属性或社会动员能力的，需要开展安全评估并履行算法备案', en: 'Services with public-opinion attributes or capacity for social mobilisation need a security assessment and algorithm filing' },
              score: 2, fx: { cash: -12, comp: 20, rep: 8, energy: -12 },
              verdict: { zh: '正确。很多个人开发者是在被下架时才第一次听说这两件事。', en: 'Correct. Plenty of solo developers first hear of these two the day they get taken down.' }
            },
            {
              text: { zh: '个人开发者做的小工具不适用这些规定', en: 'These rules do not apply to a small tool built by an individual' },
              score: 0, fx: { cash: 4, comp: -26, rep: -12, energy: -4 },
              verdict: { zh: '规定看的是服务性质和面向对象，不是团队规模。', en: 'The rules turn on what the service does and who it serves, not on how big your team is.' }
            },
            {
              text: { zh: '先上线跑数据，有用户了再补手续', en: 'Launch first, gather users, do the paperwork later' },
              score: 0, fx: { cash: 6, comp: -24, rep: -10, energy: -4 },
              verdict: { zh: '这类产品越有用户越显眼，补手续的窗口只会越来越小。', en: 'The more users this kind of product has, the more visible it is. The window to fix it only narrows.' }
            }
          ],
          tip: {
            zh: '《生成式人工智能服务管理暂行办法》自 2023 年 8 月 15 日施行，适用于面向中国境内公众提供生成式人工智能服务的主体。第17条规定：提供具有舆论属性或者社会动员能力的生成式人工智能服务的，应当按照国家有关规定开展安全评估，并按照《互联网信息服务算法推荐管理规定》履行算法备案手续。此外还有训练数据来源合法、内容安全、用户实名、未成年人保护等要求。仅面向企业内部、不向公众开放的应用，适用口径不同，但也不是完全没有约束。',
            en: 'The Interim Measures for the Administration of Generative AI Services have applied since 15 August 2023 to anyone providing generative AI services to the public inside China. Article 17 requires providers of services with public-opinion attributes or the capacity for social mobilisation to carry out a security assessment under the relevant national rules and complete algorithm filing under the Provisions on the Administration of Algorithmic Recommendation for Internet Information Services. There are further duties on lawful training data, content safety, real-name registration and protection of minors. Purely internal enterprise tools that are not open to the public are treated differently — but not as entirely unregulated.'
          },
          law: {
            zh: '《生成式人工智能服务管理暂行办法》第2条、第17条；《互联网信息服务算法推荐管理规定》第24条',
            en: 'Interim Measures for the Administration of Generative AI Services, arts. 2 & 17; Provisions on Algorithmic Recommendation for Internet Information Services, art. 24'
          }
        },
        {
          rare: 'labelmark',
          risk: ['admin'],
          volatile: true,
          prompt: {
            zh: '你的应用会生成图片和文章。有用户拿去发在社交平台上，看不出是 AI 做的。你需要做什么吗？',
            en: 'Your app generates images and articles. Users post them on social platforms with nothing to show they were AI-made. Is that your problem?'
          },
          choices: [
            {
              text: { zh: '需要。生成合成内容要按规定添加显式标识和隐式标识', en: 'Yes. AI-generated and synthetic content has to carry both a visible label and an embedded one' },
              score: 2, fx: { cash: -10, comp: 20, rep: 10, energy: -10 },
              verdict: { zh: '正确。标识义务落在提供服务的你身上，不在用户身上。', en: 'Correct. The labelling duty falls on you as the service provider, not on the user.' }
            },
            {
              text: { zh: '用户自己发的，跟我没关系', en: 'The user posted it — nothing to do with me' },
              score: 0, fx: { cash: 4, comp: -24, rep: -12, energy: -4 },
              verdict: { zh: '生成环节的标识义务在服务提供者，传播环节平台另有义务。', en: 'The provider carries the labelling duty at generation; platforms carry separate duties at distribution.' }
            },
            {
              text: { zh: '在用户协议里写一句"内容由AI生成"就够了', en: 'A line in the terms of service saying "content is AI-generated" covers it' },
              score: 0, fx: { cash: 0, comp: -18, rep: -8, energy: -2 },
              verdict: { zh: '标识要加在内容本身上，不是藏在用户协议里。', en: 'The label goes on the content itself, not into a document nobody opens.' }
            }
          ],
          tip: {
            zh: '《人工智能生成合成内容标识办法》自 2025 年 9 月 1 日起施行，要求服务提供者对生成合成内容添加标识：显式标识是用户可感知的提示（如画面上的文字、音频提示、界面说明），隐式标识是嵌入文件数据中的元数据标记。配套有强制性国家标准规定具体实现方式。同时，任何组织和个人不得恶意删除、篡改、伪造、隐匿标识，也不得提供此类工具。做 AI 内容产品的，标识应当在产品设计阶段就考虑进去，事后补通常意味着要改数据管线。',
            en: 'The Measures for Labelling AI-Generated and Synthetic Content have applied since 1 September 2025. Providers must label such content two ways: an explicit label the user can perceive — text on the image, an audio cue, an interface note — and an implicit label embedded as metadata in the file. A mandatory national standard sets out how. Nobody may maliciously delete, alter, forge or conceal those labels, or supply tools to do so. If you are building an AI content product, design labelling in from the start; retrofitting it usually means reworking the data pipeline.'
          },
          law: {
            zh: '《人工智能生成合成内容标识办法》（2025年9月1日施行）第4条、第6条、第10条；配套强制性国家标准 GB 45438—2025',
            en: 'Measures for Labelling AI-Generated and Synthetic Content (effective 1 Sept 2025), arts. 4, 6 & 10; mandatory national standard GB 45438-2025'
          }
        },
        {
          risk: ['admin'],
          prompt: {
            zh: '产品要正式开放注册，需要手机号和邮箱。服务器在国内，还准备上架 App 和微信小程序。',
            en: 'You are opening registration, collecting phone numbers and emails. Servers are in China, and you plan to ship an app and a WeChat mini program.'
          },
          choices: [
            {
              text: { zh: 'ICP 备案 + App 备案要办；收集个人信息要有隐私政策、合法性基础和最小必要', en: 'Do the ICP filing and the app filing; and collect personal information only with a privacy policy, a lawful basis and the minimum necessary' },
              score: 2, fx: { cash: -10, comp: 20, rep: 8, energy: -10 },
              verdict: { zh: '正确。个人开发者同样是《个人信息保护法》的处理者。', en: 'Correct. A solo developer is a personal information handler under PIPL just the same.' }
            },
            {
              text: { zh: '就收个手机号，算不上个人信息', en: 'It is only a phone number — hardly personal information' },
              score: 0, fx: { cash: 2, comp: -22, rep: -10, energy: -2 },
              verdict: { zh: '手机号是典型的个人信息，而且往往能直接识别到人。', en: 'A phone number is textbook personal information, and often identifies a person directly.' }
            },
            {
              text: { zh: '抄一份别人的隐私政策放上去', en: 'Copy someone else\'s privacy policy and put it up' },
              score: 0, fx: { cash: 2, comp: -20, rep: -10, energy: -2 },
              verdict: { zh: '隐私政策要与你实际的处理行为一致，抄来的往往两头都不对。', en: 'A privacy policy has to match what you actually do. A copied one usually matches neither.' }
            }
          ],
          tip: {
            zh: '使用境内服务器提供互联网信息服务要办 ICP 备案；移动应用还需按工信部要求完成 App 备案，小程序通过平台履行相应手续。处理个人信息的义务不因你是一个人而减轻：要有合法性基础（通常是同意）、公开真实的隐私政策、遵循最小必要原则、保障用户的查阅复制更正删除和注销权利、采取必要的安全措施。收集敏感个人信息或向境外提供的，还要单独同意并做个人信息保护影响评估。一人公司最容易忽略的是账号注销功能和数据删除机制——这两个是监管抽查的常见项。',
            en: 'Serving internet information from servers inside China requires ICP filing; mobile apps additionally need the MIIT app filing, and mini programs go through the platform\'s equivalent. Your duties as a personal information handler do not shrink because you are one person: a lawful basis (usually consent), a published privacy policy that is actually true, data minimisation, honouring users\' rights to access, copy, correct, delete and close their accounts, and appropriate security measures. Sensitive personal information, or any transfer abroad, additionally needs separate consent and an impact assessment. The two things solo operations most often skip are account deletion and a real data-erasure path — both are routine items in regulatory spot checks.'
          },
          law: {
            zh: '《互联网信息服务管理办法》第4条；工信部《关于开展移动互联网应用程序备案工作的通知》；《个人信息保护法》第13条、第17条、第44条至第47条',
            en: 'Measures for the Administration of Internet Information Services, art. 4; MIIT notice on mobile app filing; Personal Information Protection Law, arts. 13, 17 & 44-47'
          }
        }
      ]
    },

    /* ================================================================== 6 */
    {
      id: 'solo-exit',
      monster: 'zombiefirm',
      name: { zh: '僵尸户', en: 'ZOMBIEFIRM' },
      title: { zh: '收摊', en: 'Winding Down' },
      subtitle: { zh: '不做了之后的事', en: 'What happens after you stop' },
      dexNote: {
        zh: '停止经营的公司不会自己消失。它继续产生申报义务、继续累积罚款，安静地挂在你名下。',
        en: 'A company that stops trading does not disappear. It goes on generating filing duties and accruing penalties, quietly, in your name.'
      },
      intro: {
        zh: '产品增长停了，你有了新想法。旧公司账上没钱，也没什么债，你打算就这么放着。',
        en: 'Growth has flatlined and you have a new idea. The old company has no money and no real debts, so you plan to just leave it.'
      },
      scenes: [
        {
          risk: ['admin', 'status', 'tax'],
          prompt: {
            zh: '你决定停止运营。公司放着不管，不注销、也不再报税，会怎么样？',
            en: 'You decide to stop. If you simply leave the company alone — no deregistration, no more filings — what happens?'
          },
          choices: [
            {
              text: { zh: '逾期申报会产生罚款，公司会被列入经营异常、进而严重违法失信，法定代表人受限', en: 'Missed filings bring fines, the company lands on the abnormal operations list and then the serious-violation list, and the legal representative gets restricted' },
              score: 2, fx: { cash: -8, comp: 18, rep: 8, energy: -8 },
              verdict: { zh: '正确。"放着"是所有退出方式里最贵的一种。', en: 'Correct. "Just leaving it" is the most expensive exit there is.' }
            },
            {
              text: { zh: '没有业务就不用报税，放着不会有事', en: 'No business means no filings — leaving it is fine' },
              score: 0, fx: { cash: 4, comp: -26, rep: -14, energy: -4 },
              verdict: { zh: '没有业务也要做零申报，不报就是逾期。', en: 'No business still means filing a zero return. Not filing is a late filing.' }
            },
            {
              text: { zh: '等着执照被吊销，吊销了就自动没了', en: 'Wait for the licence to be revoked — that ends it automatically' },
              score: 0, fx: { cash: 2, comp: -28, rep: -16, energy: -4 },
              verdict: { zh: '吊销不是注销。吊销后主体还在，清算义务还在，你还多了三年任职限制。', en: 'Revocation is not deregistration. The entity survives, the liquidation duty survives, and you pick up a three-year bar on holding office.' }
            }
          ],
          tip: {
            zh: '取得营业执照就产生持续的申报义务：没有业务也要做零申报，还要报送年度报告。逾期不报会被列入经营异常名录，长期不处理会进入严重违法失信名单。执照被吊销与注销完全不同：吊销是行政处罚，公司主体依然存在，清算和注销义务不消灭，同时法定代表人三年内不得担任其他企业的董事、监事、高级管理人员。个体工商户同理，不经营就应当及时办理注销登记。',
            en: 'Holding a business licence creates continuing filing duties: with no business you still file zero returns, and you still file the annual report. Miss them and you go on the abnormal operations list; leave that long enough and you go on the serious-violation and dishonesty list. Revocation of the licence is not deregistration: revocation is an administrative penalty, the entity continues to exist, the duties to liquidate and deregister survive, and the legal representative is barred for three years from serving as a director, supervisor or senior officer of another company. The same logic applies to an individual household — if you have stopped, deregister.'
          },
          law: {
            zh: '《税收征收管理法》第62条；《市场主体登记管理条例》第46条；《企业信息公示暂行条例》第17条；《公司法》第178条',
            en: 'Tax Collection and Administration Law, art. 62; Regulations on Registration of Market Entities, art. 46; Interim Regulations on Enterprise Information Disclosure, art. 17; Company Law, art. 178'
          }
        },
        {
          risk: ['civil'],
          prompt: {
            zh: '你决定正式注销这家一人公司。新公司法下，谁负责组织清算？',
            en: 'You decide to deregister the company properly. Under the current Company Law, whose job is it to organise the liquidation?'
          },
          choices: [
            {
              text: { zh: '董事是清算义务人，应在解散事由出现之日起十五日内组成清算组', en: 'Directors are the liquidation obligors and must form a liquidation group within fifteen days of the dissolution event' },
              score: 2, fx: { cash: -10, comp: 20, rep: 8, energy: -10 },
              verdict: { zh: '正确。一人公司里，这个"董事"往往就是你本人。', en: 'Correct — and in a one-person company that director is generally you.' }
            },
            {
              text: { zh: '股东，也就是我，但没有时限要求', en: 'The shareholder, meaning me, with no particular deadline' },
              score: 1, fx: { cash: -4, comp: 4, rep: 0, energy: -6 },
              verdict: { zh: '新法已把清算义务人明确为董事，而且有十五日的时限。', en: 'The current law puts the duty on directors specifically, and sets a fifteen-day clock.' }
            },
            {
              text: { zh: '找家代办公司全包，我不用管', en: 'Pay an agency to handle all of it — not my problem' },
              score: 0, fx: { cash: -12, comp: -12, rep: -6, energy: -2 },
              verdict: { zh: '代办能帮你跑流程，但清算义务和赔偿责任不会转移。', en: 'An agency can run the paperwork. The duty and the liability do not transfer with it.' }
            }
          ],
          tip: {
            zh: '新《公司法》第232条明确：公司因解散事由需要清算的，董事为公司清算义务人，应当在解散事由出现之日起十五日内组成清算组进行清算；清算义务人未及时履行清算义务，给公司或者债权人造成损失的，应当承担赔偿责任。一人公司里董事、股东、法定代表人常常是同一个人，这条等于直接指向你。注销的完整顺序是：作出解散决定 → 成立清算组并公示 → 通知并公告债权人 → 清理财产、清缴税款和社保、清偿债务 → 税务清税注销 → 市场监管注销 → 银行等账户注销。符合条件的可以走简易注销，但有未了结债权债务的不适用。',
            en: 'Article 232 of the Company Law is explicit: where a company must be liquidated on dissolution, the directors are the liquidation obligors and must form a liquidation group within fifteen days of the dissolution event; a liquidation obligor who fails to perform in time and thereby causes loss to the company or its creditors is liable in damages. In a one-person company the director, shareholder and legal representative are usually the same person, so this points straight at you. The full sequence: resolve to dissolve, form and publicise the liquidation group, notify and publish to creditors, realise assets and settle tax, social insurance and debts, obtain tax clearance and deregister with the tax authority, deregister with the market regulator, then close the bank and other accounts. Simplified deregistration exists for those who qualify, but not where debts or claims are unsettled.'
          },
          law: {
            zh: '《公司法》（2023年修订）第229条、第232条、第238条；《市场主体登记管理条例》第31条、第33条',
            en: 'Company Law (2023 revision), arts. 229, 232 & 238; Regulations on Registration of Market Entities, arts. 31 & 33'
          }
        },
        {
          risk: ['civil'],
          prompt: {
            zh: '注销完成后，一个老客户找上门，说两年前那个项目有质量问题要索赔。公司已经没了，怎么办？',
            en: 'After deregistration, an old client surfaces claiming defects in a project from two years ago. The company no longer exists. Now what?'
          },
          choices: [
            {
              text: { zh: '注销不等于债务消灭；如果清算时未依法通知债权人或作了不实承诺，股东可能仍要担责', en: 'Deregistration does not extinguish debts. If creditors were not properly notified during liquidation, or undertakings were untrue, the shareholder can still be on the hook' },
              score: 2, fx: { cash: -10, comp: 18, rep: 8, energy: -8 },
              verdict: { zh: '正确。所以清算阶段的通知和公告，不是走过场。', en: 'Correct. Which is why the notices and publication during liquidation are not a formality.' }
            },
            {
              text: { zh: '公司注销了主体就没了，跟我个人无关', en: 'The entity is gone, so it has nothing to do with me personally' },
              score: 0, fx: { cash: 2, comp: -22, rep: -12, energy: -4 },
              verdict: { zh: '简易注销时签的《全体投资人承诺书》，就是你个人的承诺。', en: 'The undertaking you signed for simplified deregistration was a personal one.' }
            },
            {
              text: { zh: '当年是个体户做的，个体户注销了就更没事了', en: 'It was an individual household back then, and that is deregistered too — even safer' },
              score: 0, fx: { cash: 0, comp: -20, rep: -10, energy: -4 },
              verdict: { zh: '恰恰相反。个体户的债务本来就由经营者个人承担，注销不改变这一点。', en: 'Exactly backwards. An individual household\'s debts were always the operator\'s personally, and deregistration does not change that.' }
            }
          ],
          tip: {
            zh: '注销登记消灭的是市场主体资格，不是已经产生的债务。几种常见的追责路径：① 清算时未依法履行通知和公告义务，导致债权人未及时申报债权受到损失的，股东或清算义务人可能要在造成损失范围内承担赔偿责任；② 未经清算即办理注销登记，且在办理时作出对债务承担责任承诺的，承诺人要按承诺担责；③ 简易注销中全体投资人签署的承诺书具有法律约束力。个体工商户和个人独资企业的债务本身就是经营者的个人债务，注销登记不影响债权人继续向其个人主张。',
            en: 'Deregistration ends the entity\'s legal status, not debts that already exist. The usual routes back to you: (1) where the liquidation failed to notify and publish as required, and a creditor lost out by not filing its claim in time, the shareholder or liquidation obligor can be liable for the resulting loss; (2) where deregistration was obtained without liquidation and the applicant gave an undertaking to answer for the debts, that undertaking binds them; (3) the undertaking all investors sign in a simplified deregistration is legally binding. For an individual household or sole proprietorship, the debts were the operator\'s personal debts to begin with, and deregistration does not stop a creditor pursuing them.'
          },
          law: {
            zh: '《公司法》第232条、第238条；最高人民法院《关于适用〈公司法〉若干问题的规定（二）》第10条至第20条；《市场主体登记管理条例实施细则》关于简易注销承诺的规定',
            en: 'Company Law, arts. 232 & 238; SPC Interpretation II on the Company Law, arts. 10-20; Detailed Rules on Registration of Market Entities, on simplified deregistration undertakings'
          }
        }
      ]
    }
  ];

  /* ===================================================================== */
  var BOSS = {
    id: 'solo-boss',
    monster: 'veilpiercer',
    name: { zh: '穿透兽', en: 'VEILPIERCER' },
    title: { zh: '穿透', en: 'Piercing the Veil' },
    subtitle: { zh: '有人要越过公司来找你', en: 'Someone is reaching past the company, for you' },
    dexNote: {
      zh: '它不打公司，它伸手穿过公司来抓你。能不能挡住它，取决于你过去两年每一笔转账。',
      en: 'It does not attack the company. It reaches through the company for you. Whether it gets there depends on every transfer you made these past two years.'
    },
    intro: {
      zh: '法院传票、税务通知、律师函，同一周到齐。它们问的其实是同一个问题：你和你的公司，到底是不是两个人。',
      en: 'A summons, a tax notice and a demand letter, all in the same week. They are all asking one question: are you and your company two separate people or one.'
    },
    scenes: [
      {
        risk: ['civil'],
        prompt: {
          zh: '客户起诉你的一人公司，同时把你个人列为共同被告，要求你承担连带责任。庭上你要做什么？',
          en: 'A client sues your single-shareholder company and names you personally as a co-defendant, seeking joint liability. What do you do in court?'
        },
        choices: [
          {
            text: { zh: '举证证明公司财产独立：独立账户流水、完整账簿、财务报表、股东往来的书面依据', en: 'Prove the company\'s property is independent: separate bank records, complete books, financial statements, written basis for every shareholder transaction' },
            score: 2, fx: { cash: -10, comp: 22, rep: 10, energy: -10 },
            verdict: { zh: '正确。举证责任在你，拿不出证据就等于认了。', en: 'Correct. The burden is yours; failing to discharge it is the same as conceding.' }
          },
          {
            text: { zh: '主张原告没有证据证明我混同，让他举证', en: 'Argue the plaintiff has not proved commingling and put them to proof' },
            score: 0, fx: { cash: 0, comp: -30, rep: -16, energy: -10 },
            verdict: { zh: '一人公司恰恰是举证责任倒置的，这个抗辩方向从一开始就错了。', en: 'For a one-person company the burden is reversed. That defence is aimed the wrong way from the start.' }
          },
          {
            text: { zh: '赶紧把公司账上的钱转走再说', en: 'Move the money out of the company account first and think later' },
            score: 0, fx: { cash: 6, comp: -40, rep: -25, energy: -12 },
            verdict: { zh: '这可能构成恶意转移财产，会被撤销，还会加重你的责任。', en: 'That can be a fraudulent transfer: it gets unwound, and it makes your position worse.' }
          }
        ],
        tip: {
          zh: '《公司法》第23条第3款是一人公司最重的一条：只有一个股东的公司，股东不能证明公司财产独立于股东自己的财产的，应当对公司债务承担连带责任。请注意"不能证明"三个字——法律预设了你需要自证清白。实践中法院看的是：银行账户是否独立、账簿是否完整规范、有无经审计的财务报告、股东与公司之间的资金往来有没有书面依据和商业合理性、公司有没有独立的经营场所和资产。这些证据只能在平时积累，出事那天再补是来不及的。',
          en: 'Article 23(3) of the Company Law is the heaviest provision a one-person company faces: where a company has only one shareholder and that shareholder cannot prove the company\'s property is independent of their own, the shareholder is jointly and severally liable for its debts. Note "cannot prove" — the law presumes you must clear yourself. In practice courts look at whether the bank account is genuinely separate, whether the books are complete and proper, whether there are audited financial statements, whether money moving between you and the company has a written basis and commercial rationale, and whether the company has premises and assets of its own. That evidence can only be built up as you go; the day the claim arrives is far too late to start.'
        },
        law: { zh: '《公司法》第23条第3款；《民事诉讼法》第67条；《民法典》第538条、第539条', en: 'Company Law, art. 23(3); Civil Procedure Law, art. 67; Civil Code, arts. 538 & 539' }
      },
      {
        risk: ['tax', 'criminal'],
        prompt: {
          zh: '税务约谈：公司账上"其他应收款——股东"挂着 42 万，已经跨了一个纳税年度。',
          en: 'A tax interview: "other receivables — shareholder" shows RMB 420,000 outstanding, and it has crossed a tax year.'
        },
        choices: [
          {
            text: { zh: '如实说明并尽快归还；确实用于个人的部分，按视同分红补缴 20% 个税', en: 'Explain honestly and repay promptly; for whatever genuinely went to personal use, pay the 20% as a deemed dividend' },
            score: 2, fx: { cash: -20, comp: 18, rep: 8, energy: -10 },
            verdict: { zh: '正确。主动补缴的代价，远低于被认定为偷税。', en: 'Correct. Paying up voluntarily costs far less than being found to have evaded.' }
          },
          {
            text: { zh: '补一份借款合同，把日期写在年度之内', en: 'Draw up a loan agreement and date it inside the tax year' },
            score: 0, fx: { cash: 0, comp: -38, rep: -22, energy: -12 },
            verdict: { zh: '倒签合同是伪造证据，把一个补税问题升级成了偷税甚至刑事问题。', en: 'Backdating is fabricating evidence. It turns a back-tax problem into evasion, and possibly a criminal one.' }
          },
          {
            text: { zh: '说这笔钱是我垫付的备用金，说不清就先拖着', en: 'Call it a float you advanced, and stall while it stays unclear' },
            score: 0, fx: { cash: 0, comp: -26, rep: -14, energy: -10 },
            verdict: { zh: '说不清的资金往来，同时会成为财产混同的证据，两头都输。', en: 'Unexplained transfers double as evidence of commingling. You lose on both fronts.' }
          }
        ],
        tip: {
          zh: '财税〔2003〕158号规定：纳税年度内个人投资者从其投资企业借款，在该纳税年度终了后既不归还，又未用于企业生产经营的，其未归还的借款可视为企业对个人投资者的红利分配，按"利息、股息、红利所得"计征 20% 个人所得税。这条几乎是为一人公司量身定做的。更麻烦的是它还有第二重效果：一笔长期挂账、说不清用途的股东往来款，同时会成为民事诉讼中认定财产混同的关键证据。处理原则很简单——要么当年还清并留痕，要么走正规分红并缴税。',
          en: 'Circular Caishui [2003] No. 158 provides that where an individual investor borrows from their invested enterprise and, by the end of that tax year, has neither repaid it nor used it in the business, the outstanding amount may be treated as a dividend distribution to that investor and taxed at 20% as interest, dividend and bonus income. The rule could have been written for one-person companies. Worse, it cuts twice: a long-running shareholder balance with no clear purpose is also the key evidence of commingling in a civil claim. The handling rule is simple — repay within the year and document it, or declare a proper dividend and pay the tax.'
        },
        law: { zh: '财税〔2003〕158号第2条；《个人所得税法》第3条；《税收征收管理法》第63条', en: 'Caishui [2003] No. 158, art. 2; Individual Income Tax Law, art. 3; Tax Collection and Administration Law, art. 63' }
      },
      {
        risk: ['civil'],
        prompt: {
          zh: '前东家的律师函到了：主张你的产品属于职务作品，要求停止运营并移交著作权。',
            en: 'A letter from your former employer\'s lawyers: they say the product is a work made in the course of your employment, and want it shut down and the copyright handed over.'
        },
        choices: [
          {
            text: { zh: '整理开发时间线、设备归属、代码提交记录和岗位职责，评估后再回复', en: 'Assemble the development timeline, whose equipment it ran on, the commit history and your actual job duties — then reply' },
            score: 2, fx: { cash: -12, comp: 20, rep: 10, energy: -12 },
            verdict: { zh: '正确。提交记录的时间戳往往是这类案子里最有力的证据。', en: 'Correct. Commit timestamps are frequently the strongest evidence in this kind of case.' }
          },
          {
            text: { zh: '不理会，等他们真起诉再说', en: 'Ignore it and wait to see if they actually sue' },
            score: 0, fx: { cash: 2, comp: -22, rep: -14, energy: -8 },
            verdict: { zh: '拖延不会让证据变多，只会让对方有时间做保全。', en: 'Delay does not create evidence for you. It gives them time to seek preservation orders.' }
          },
          {
            text: { zh: '赶紧把仓库设为私有、删掉早期提交记录', en: 'Make the repository private and delete the early commits' },
            score: 0, fx: { cash: 0, comp: -40, rep: -25, energy: -12 },
            verdict: { zh: '销毁证据会被推定为对你不利，这是最糟的一步。', en: 'Destroying evidence invites an adverse inference. It is the worst move available.' }
          }
        ],
        tip: {
          zh: '判断是否构成职务作品，看的是：是否为完成单位工作任务而创作、是否主要利用了单位的物质技术条件、是否由单位承担责任、以及是否属于你的岗位职责范围。软件属于《著作权法》第18条第二款列举的类型，一旦被认定主要利用单位物质技术条件并由单位承担责任，作者只保留署名权。所以证据链很关键：独立设备、非工作时间的提交记录、与本职工作不同的技术方向、没有使用单位代码或资料。反过来说，如果你现在还在职并打算做产品，最稳妥的做法是提前和单位签一份书面的权属确认。',
          en: 'Whether something is a work made in employment turns on: was it created to carry out the employer\'s tasks, did it mainly use the employer\'s material and technical resources, does the employer bear responsibility for it, and did it fall within your job duties. Software is one of the categories listed in art. 18(2) of the Copyright Law, so once it is found to have mainly used the employer\'s resources with the employer bearing responsibility, the author keeps attribution and nothing else. The evidence chain is therefore everything: your own hardware, commits outside working hours, a technical direction different from your job, no use of the employer\'s code or materials. Conversely, if you are still employed and about to build something, the safest move is a written ownership agreement signed up front.'
        },
        law: { zh: '《著作权法》第18条；《计算机软件保护条例》第13条；《最高人民法院关于民事诉讼证据的若干规定》第95条', en: 'Copyright Law, art. 18; Regulations on Computer Software Protection, art. 13; SPC Provisions on Evidence in Civil Proceedings, art. 95' }
      }
    ]
  };

  /* ===================================================================== */
  var DEX_META = {
    'solo-entity': {
      type: { zh: '主体资格', en: 'ENTITY' }, danger: 3, rarity: 1,
      weak: {
        zh: '按真实经营规模选主体：要责任隔离就设公司，图简便就做个体户但认清无限责任',
        en: 'Match the vehicle to the real business: a company if you want liability separation, an individual household for simplicity — with unlimited liability understood'
      }
    },
    'solo-veil': {
      type: { zh: '人格独立', en: 'SEPARATION' }, danger: 5, rarity: 1,
      weak: {
        zh: '对公账户收付、账簿完整、股东往来有书面依据；拿钱只走工资、分红或真实报销',
        en: 'Company account in and out, complete books, a written basis for every shareholder transaction; take money only as salary, dividends or genuine reimbursement'
      }
    },
    'solo-tax': {
      type: { zh: '税务', en: 'TAX' }, danger: 4, rarity: 1,
      weak: {
        zh: '算清两层税再决定主体形式；发票与真实业务一致；别把筹划建在虚构交易上',
        en: 'Work out both layers of tax before choosing the vehicle; keep invoices matched to real transactions; never build planning on fabricated activity'
      }
    },
    'solo-code': {
      type: { zh: '知识产权', en: 'IP' }, danger: 4, rarity: 1,
      weak: {
        zh: '自有设备与业余时间留痕；保存提示词与迭代记录；发布前跑一遍开源许可扫描',
        en: 'Document your own equipment and your own hours; keep prompts and iteration history; run an open-source licence scan before every release'
      }
    },
    'solo-ai': {
      type: { zh: 'AI 合规', en: 'AI COMPLIANCE' }, danger: 4, rarity: 1,
      weak: {
        zh: '面向公众就做安全评估和算法备案；生成内容加显式和隐式标识；ICP 与 App 备案齐全',
        en: 'Public-facing means a security assessment and algorithm filing; label generated content both visibly and in metadata; keep ICP and app filings current'
      }
    },
    'solo-exit': {
      type: { zh: '退出', en: 'EXIT' }, danger: 4, rarity: 1,
      weak: {
        zh: '不做了就正式注销：十五日内组清算组、通知并公告债权人、清税后再办工商注销',
        en: 'If you are done, deregister properly: liquidation group within fifteen days, notify and publish to creditors, tax clearance before the registry filing'
      }
    },
    'solo-boss': {
      type: { zh: '连带责任', en: 'JOINT LIABILITY' }, danger: 5, rarity: 2,
      weak: {
        zh: '平时积累的证据：独立账户流水、规范账簿、财务报表、每一笔股东往来的书面依据',
        en: 'Evidence built up in advance: separate bank records, proper books, financial statements, and a written basis for every shareholder transaction'
      }
    }
  };

  var RARES = [
    {
      id: 'borrowghost', monster: 'borrowghost',
      name: { zh: '借款鬼', en: 'BORROWGHOST' },
      type: { zh: '税务', en: 'TAX' }, danger: 5, rarity: 3,
      from: { zh: '第二章 · 防火墙', en: 'Ch.2 · The Firewall' },
      note: {
        zh: '你从公司拿走的那笔钱。跨过 12 月 31 日还没还，它就变成一笔分红，带着 20% 的税找回来。',
        en: 'The money you took out of the company. Let it cross 31 December unrepaid and it comes back as a dividend, with 20% tax attached.'
      },
      weak: {
        zh: '当年归还并留下书面借款依据，或者直接走分红程序把税缴掉',
        en: 'Repay within the year with a written loan record, or declare a proper dividend and pay the tax'
      }
    },
    {
      id: 'dayjobshadow', monster: 'dayjobshadow',
      name: { zh: '职务影', en: 'DAYJOBSHADE' },
      type: { zh: '知识产权', en: 'IP' }, danger: 4, rarity: 2,
      from: { zh: '第四章 · 代码', en: 'Ch.4 · The Code' },
      note: {
        zh: '站在你身后的前东家。你白天上班、晚上写产品的那几个月，它一直在看。',
        en: 'Your employer, standing behind you. All those months of working by day and building by night, it was watching.'
      },
      weak: {
        zh: '自有设备、业余时间、与本职工作无关——三样证据齐全，最好再加一份书面权属确认',
        en: 'Your own equipment, your own hours, unrelated to the job — all three documented, and better still a signed ownership agreement'
      }
    },
    {
      id: 'copyleftvine', monster: 'copyleftvine',
      name: { zh: '传染藤', en: 'COPYLEFTVINE' },
      type: { zh: '开源合规', en: 'OPEN SOURCE' }, danger: 4, rarity: 3,
      from: { zh: '第四章 · 代码', en: 'Ch.4 · The Code' },
      note: {
        zh: '缠上什么就长进什么。AI 补全的那几行代码把它带了进来，现在它长满了你的闭源产品。',
        en: 'It grows into whatever it touches. A few lines of AI completion carried it in, and now it has spread through your closed-source product.'
      },
      weak: {
        zh: '发布流程里加一道开源许可扫描（SCA），保留依赖清单，发现传染性协议及时隔离或替换',
        en: 'Put an SCA licence scan in the release pipeline, keep a dependency inventory, and isolate or replace copyleft code as soon as it shows up'
      }
    },
    {
      id: 'labelmark', monster: 'labelmark',
      name: { zh: '标识印', en: 'LABELMARK' },
      type: { zh: 'AI 合规', en: 'AI COMPLIANCE' }, danger: 3, rarity: 2,
      from: { zh: '第五章 · 上线', en: 'Ch.5 · Shipping It' },
      note: {
        zh: '要盖在每一份 AI 生成内容上的印。看得见的那层给人看，看不见的那层写进文件里。',
        en: 'The mark every piece of AI-generated content has to carry: one layer for the reader, one written into the file itself.'
      },
      weak: {
        zh: '在产品设计阶段就把显式标识和元数据隐式标识做进生成管线，别等上线后再补',
        en: 'Build both the visible label and the metadata one into the generation pipeline at design time, not after launch'
      }
    }
  ];

  var SECRET = {
    id: 'accountant', monster: 'accountant',
    name: { zh: '会计师', en: 'THE ACCOUNTANT' },
    type: { zh: '传说', en: 'LEGENDARY' }, danger: 0, rarity: 3,
    from: { zh: '集齐本篇 11 只后出现', en: 'Appears once you hold all 11 of this route' },
    note: {
      zh: '一人公司最便宜的一份保险。每月几百块，换的是一套能在法庭上证明"公司不是你、你不是公司"的账。很多人是在收到传票那天，才想起当初省下的那笔钱。',
      en: 'The cheapest insurance a one-person company can buy. A few hundred a month, in exchange for a set of books that can prove in court that you and the company are not the same person. Most people remember the money they saved on it the day the summons arrives.'
    },
    weak: {
      zh: '没有弱点。它唯一的要求是你每个月把票据给它。',
      en: 'No weakness. Its only demand is that you hand over the receipts each month.'
    }
  };

  var ENDINGS = [
    {
      min: 88, grade: 'S',
      title: { zh: '民间传说', en: 'Folk Legend' },
      body: {
        zh: '深夜十一点，别人早收工了，你还在把一笔往来款划回它该在的账户，就为了那条线干干净净。一个人做公司不难。难的是一个人做得，像个公司。That\'s the flex。没人看见。但那道墙，是真的。',
        en: 'Eleven at night, everyone else clocked off hours ago, and you are still moving one 往来款 — a balance between you and the company — back to the account it belongs in, just to keep the line clean. Running a company alone is not the hard part. Running it, alone, like a company is. That\'s the flex. Nobody saw it. But the wall is real.'
      },
      hook: {
        zh: '维持成本很低——每年一次结构和账目的快速复核，就能一直守住这条线。',
        en: 'Upkeep is cheap — one quick annual review of the structure and the books holds this line indefinitely.'
      }
    },
    {
      min: 72, grade: 'A',
      title: { zh: '稳健大师', en: 'Steady Master' },
      body: {
        zh: '你的产品在跑，用户在涨，一切看着都对。只是有两根线还松着：一笔没清的股东往来款，和一个从没扫过 license 的发布流程。现在它们什么事都没有。它们最擅长的，就是什么事都没有——直到有事。',
        en: 'Your product runs, the users climb, everything looks right. Two threads are still loose: one unsettled 股东往来款, the shareholder balance, and a release pipeline that has never scanned a licence. Nothing is wrong with either of them right now. Nothing being wrong is the thing they are best at. Until something is.'
      },
      hook: {
        zh: '两件加一块儿花不了一周，而且都有标准做法。找人帮你搭一次，之后就是自动跑的例行流程，你再不用想起它们。',
        en: 'Together they are under a week, and both have a standard fix. Have someone set it up once and it becomes routine that runs itself — you never have to think about them again.'
      }
    },
    {
      min: 55, grade: 'B',
      title: { zh: '能跑，但墙上有裂缝', en: 'Running, With Cracks in the Wall' },
      body: {
        zh: '墙上的裂缝，白天你看不见。阳光好的时候，它们完全不存在——账户、往来款、许可证，样样"差不多"。然后出事那天到了。所有裂缝，在同一秒里一起显形，像商量好的。',
        en: 'The cracks in the wall are invisible by day. In good light they do not exist at all — the accounts, the 往来款, the licences, all of it "close enough". Then the day arrives. Every crack shows itself in the same second, as though they had agreed on it beforehand.'
      },
      hook: {
        zh: '趁天还亮着，让人帮你把裂缝列出来排个序——大多数现在补很便宜，出事后补，天价。',
        en: 'While the light holds, have someone list the cracks and rank them — most are cheap to fill now, and priced very differently afterwards.'
      }
    },
    {
      min: 35, grade: 'C',
      title: { zh: '这层壳形同虚设', en: 'The Shell Is Not Doing Anything' },
      body: {
        zh: '法律眼里，此刻你和一个个体户，是同一个人。你为这点区别，交了一笔注册费。然后，没有那点区别。',
        en: 'In the eyes of the law, you and a 个体户 — a sole trader, no company at all — are at this moment the same person. You paid a registration fee for the difference. There is no difference.'
      },
      hook: {
        zh: '这层壳还能救活。关键就几步：账户隔离、往来款清理、留痕——找律师给你一张"最小加固清单"。',
        en: 'The shell can still be brought back to life. It comes down to a few steps: separate the accounts, clear the 往来款, keep the paper trail — ask a lawyer for a minimum hardening list.'
      }
    },
    {
      min: 0, grade: 'D',
      title: { zh: '法外狂徒', en: 'Outlaw' },
      body: {
        zh: '你是法外狂徒孙老板的信徒。捞偏门，赚快钱。一人得道，哪管其他人尸山血海。跨国交易，你是想搞就搞；组织架构，你是乱七八糟。想省心，想省钱，将死道友不死贫道的精神贯彻到底。最后获得财产混同debuff。老弟，律师想捞你都很难啊。一首凉凉送给你，下次小心点。',
        en: 'You are a disciple of Outlaw Boss Sun. Side doors, fast money. One person makes it — never mind the mountain of bodies behind them. Cross-border deals, you do as you please; org chart, a complete mess. You wanted it easy, you wanted it cheap, and you took "let my fellow Daoist die before I go broke" all the way. Reward unlocked: the 财产混同 debuff. Kid, even a lawyer would struggle to pull you out. Here is 凉凉. Be more careful next time.'
      },
      hook: {
        zh: '换号重开吧',
        en: 'New account. Start over.'
      }
    }
  ];

  return {
    id: 'solo',
    title: { zh: '一人公司', en: 'The One-Person Company' },
    subtitle: { zh: 'AI 时代的独立开发者', en: 'Solo builders in the age of AI' },
    blurb: {
      zh: 'AI的时代来临，你曾经是互联网时代的一名路人甲，这一次你也想做一只在风口上会飞的猪🐷',
      en: 'The age of AI is here. You were a npc in the internet era; this time you want to be a pig that actually flies when the wind is up. 🐷'
    },
    icon: 'soloturtle',
    chapters: CHAPTERS,
    boss: BOSS,
    bonusDex: null,
    dexMeta: DEX_META,
    rares: RARES,
    secret: SECRET,
    endings: ENDINGS,
    /* Shown on the result screen. Ordered by how much they buy you per hour
       spent, which for a one-person company is not the order people guess. */
    advice: [
      {
        zh: '开一个对公账户，从今天起所有业务收付都走它。个人收款码收公司的钱，是全篇里最容易犯、也最难辩解的一件事。',
        en: 'Open a corporate bank account and route every business payment through it from today. Taking company money through a personal payment code is the easiest mistake here to make and the hardest to explain away.'
      },
      {
        zh: '找一个代账会计，每月把票据给他。几百块钱换的是一套账——那是你将来在法庭上证明"公司不是你、你不是公司"的唯一证据。',
        en: 'Get a bookkeeper and hand over the receipts each month. A few hundred a month buys you a set of books, which is the only evidence you will have in court that you and the company are not the same person.'
      },
      {
        zh: '年底前把账上的"其他应收款——股东"清掉。跨过 12 月 31 日还挂着，它会同时变成一笔 20% 的税和一份财产混同的证据。',
        en: 'Clear the "other receivables — shareholder" balance before year end. Let it cross 31 December and it becomes both a 20% tax bill and a piece of evidence that your money and the company\u2019s are the same money.'
      },
      {
        zh: '在发布流程里加一道开源许可扫描（SCA）。AI 补全让引入 GPL 代码变得非常容易，而这件事发现得越晚越贵。',
        en: 'Put an open-source licence scan into your release pipeline. AI completion makes pulling in GPL code very easy, and this is a problem that gets more expensive the later you find it.'
      },
      {
        zh: '如果你还在职，先把劳动合同里的知识产权和竞业条款读一遍，并保留自有设备、业余时间的证据。这一步花二十分钟，能省掉一场官司。',
        en: 'If you are still employed, read the IP and non-compete clauses in your contract, and keep evidence of your own equipment and your own hours. Twenty minutes here can save you a lawsuit.'
      }
    ]
  };
});
