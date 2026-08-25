/*
 * level01.js — MVP single-round level.
 *
 * This level uses a setup choice to seed evidence, then locks later lawsuit
 * choices that the player cannot prove with the records they kept.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Level01 = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function text(en, zh) {
    return { en: en, zh: zh };
  }

  var PRC_COMPANY_LAW_23_3 = {
    jurisdiction: text('Mainland China (PRC)', '中国内地'),
    citation: text(
      'PRC Company Law (2023 revision), Art. 23(3) — a company with a single shareholder that cannot prove its property is independent of the shareholder\'s own property is jointly liable for the company\'s debts',
      '《中华人民共和国公司法》（2023年修订）第23条第3款：只有一个股东的公司，股东不能证明公司财产独立于股东自己的财产的，应当对公司债务承担连带责任'
    ),
    effectiveDate: '2024-07-01',
    exceptions: text(
      'The reversed burden of proof applies to property commingling. Other veil-piercing grounds, such as excessive control and gross undercapitalization, follow the normal "who asserts, proves" rule.',
      '举证责任倒置适用于财产混同。其他揭开公司面纱的事由，例如过度控制、资本显著不足，通常仍按“谁主张，谁举证”处理。'
    ),
    reviewedBy: text('pending — licensed PRC lawyer review required before publish', 'pending — 发布前须由中国执业律师审核'),
    lastUpdated: '2026-08-24',
    verifyWith: text(
      'licensed PRC lawyer; confirm the current article text and any judicial interpretations',
      '中国执业律师；确认现行条文和相关司法解释'
    )
  };

  return {
    id: 'lvl-01-wfoe-commingling',
    order: 1,
    theme: 'company-law-fdi',
    title: text('Whose money is it?', '这是谁的钱？'),
    audience: text(
      'Foreign founder running a WFOE (a one-person company under PRC law)',
      '经营 WFOE 的外国创始人（一人公司）'
    ),
    icon: 'commingle',
    scenario: text(
      'Your WFOE owes a supplier ¥180,000 for goods you cannot currently pay. The supplier sues, and their lawyer argues something that catches you off guard: that your company\'s money and your own money are really one pot, so you should pay the debt personally. In China, for a one-person company, the law does not make the creditor prove the mixing. It makes you prove you kept things separate.',
      '你的 WFOE 欠供应商 18 万元货款，现在付不出来。供应商起诉后，对方律师提出一个让你意外的说法：公司的钱和你自己的钱其实是一锅钱，所以这笔债应当由你个人承担。在中国，一人公司案件里，法律不是让债权人证明你混同，而是让你证明你没有混同。'
    ),

    characters: [
      {
        id: 'creditor-lawyer',
        name: text('Ms. Han', '韩律师'),
        role: text('Supplier\'s lawyer', '供应商律师'),
        line: text(
          'There is no real line between this company and your own wallet, so your client pays personally.',
          '这家公司和你自己的钱包之间没有真实界限，所以你本人应当付款。'
        )
      },
      {
        id: 'judge',
        name: text('Presiding Judge', '审判长'),
        role: text('Judge', '法官'),
        line: text(
          'The company has one shareholder. Can you show the court its property is independent from yours?',
          '这家公司只有一个股东。你能向法庭证明公司财产独立于你的个人财产吗？'
        )
      },
      {
        id: 'your-accountant',
        name: text('Lao Chen', '老陈'),
        role: text('Your bookkeeper', '你的记账人员'),
        line: text(
          'Depends what we can pull together. What do you actually want me to hand over?',
          '要看我们能整理出什么。你到底想让我交哪些材料？'
        )
      }
    ],

    setup: {
      id: 'setup-money-habits',
      question: text('Before the lawsuit, how have you been running the company\'s money?', '诉讼发生前，你一直怎么管理公司的钱？'),
      context: text(
        'This choice is the real lesson. It quietly decides what evidence you will have when it matters.',
        '这一项选择才是真正的 lesson。它会悄悄决定你在关键时刻手里有什么证据。'
      ),
      branches: [
        {
          id: 'setup-separate',
          label: text(
            'Kept it clean: company account only, annual audit that traces the cash flow',
            '一直分清：只用公司账户，并做能追踪资金流的年度审计'
          ),
          setsEvidence: ['ev-separate-accounts', 'ev-audit-fundflow']
        },
        {
          id: 'setup-mixed',
          label: text(
            'Kept it loose: sometimes took supplier payments into my personal account, no real audit',
            '一直较松：有时用个人账户收公司款，也没有真正审计'
          ),
          setsEvidence: ['ev-basic-books', 'ev-mixed-payments']
        }
      ]
    },

    availableEvidence: [
      {
        id: 'ev-separate-accounts',
        label: text('Separate company/personal bank statements, no crossover', '公司账户和个人账户的银行流水彼此独立，没有交叉')
      },
      {
        id: 'ev-audit-fundflow',
        label: text('Annual audit report that shows where the money actually moved', '能显示资金实际流向的年度审计报告')
      },
      {
        id: 'ev-basic-books',
        label: text('Basic books showing profit and loss only', '只显示盈亏的基础账簿')
      },
      {
        id: 'ev-mixed-payments',
        label: text('Records of company payments received into your personal account', '公司业务款进入你个人账户的记录'),
        redFlag: true
      }
    ],

    riskInsight: text(
      'The burden is reversed. You do not get to sit back and make the supplier prove the mixing. The court presumes it unless you prove separation. Silence loses.',
      '举证责任是倒置的。你不能只是等供应商证明混同。除非你证明财产独立，否则法院会按不能证明处理。沉默会输。'
    ),

    battle: {
      id: 'the-burden',
      title: text('Courtroom Battle: The Burden', 'Courtroom Battle: The Burden'),
      rules: [
        text('CREDIBILITY starts at 100. Wrong moves drain it. Hit 0 and you lose the exchange.', 'CREDIBILITY starts at 100. Wrong moves drain it. Hit 0 and you lose the exchange.'),
        text('Ms. Han has POISE. The right evidence cracks it. Break her poise and you win.', 'Ms. Han has POISE. The right evidence cracks it. Break her poise and you win.'),
        text('The Judge\'s conviction bar tilts toward whoever is landing hits.', 'The Judge\'s conviction bar tilts toward whoever is landing hits.')
      ],
      start: { credibility: 100, poise: 45, conviction: 30 },
      opening: {
        title: text('ROUND 0 — Han opens', 'ROUND 0 — Han opens'),
        line: text(
          'Ms. Han, unhurried: "Your Honor, the defendant\'s company can\'t pay. But let\'s be honest — there is no company. There\'s just him, and his money. Let him pay."\n\nJudge: "Response from the defense?"',
          'Ms. Han, unhurried: "Your Honor, the defendant\'s company can\'t pay. But let\'s be honest — there is no company. There\'s just him, and his money. Let him pay."\n\nJudge: "Response from the defense?"'
        ),
        effect: text('The Judge\'s conviction bar slides toward Han.', 'The Judge\'s conviction bar slides toward Han.'),
        next: 'round-1'
      },
      rounds: [
        {
          id: 'round-1',
          title: text('ROUND 1 — The trap', 'ROUND 1 — The trap'),
          attack: text('Judge: "Response from the defense?"', 'Judge: "Response from the defense?"'),
          prompt: text('Choose your reply.', 'Choose your reply.'),
          options: [
            {
              kind: 'reply',
              text: text('"That\'s for her to prove. She hasn\'t shown a single mixed transaction."', '"That\'s for her to prove. She hasn\'t shown a single mixed transaction."'),
              result: 'MISS',
              tone: 'bad',
              credibility: -25,
              conviction: -18,
              response: text(
                'Ms. Han, with a slow smile: "Prove? Oh — I don\'t have to."\n\nJudge: "Counsel is correct. This company has one shareholder. Under the Company Law, the burden is on you to prove the company\'s property is independent of your own. Not on her."\n\nYou realize you have been defending the wrong side of the net this whole time.',
                'Ms. Han, with a slow smile: "Prove? Oh — I don\'t have to."\n\nJudge: "Counsel is correct. This company has one shareholder. Under the Company Law, the burden is on you to prove the company\'s property is independent of your own. Not on her."\n\nYou realize you have been defending the wrong side of the net this whole time.'
              ),
              next: 'round-2'
            },
            {
              kind: 'reply',
              text: text('"The company is a separate legal person. Its debts are its own, not mine."', '"The company is a separate legal person. Its debts are its own, not mine."'),
              result: 'MISS',
              tone: 'bad',
              credibility: -25,
              conviction: -18,
              response: text(
                'Ms. Han, with a slow smile: "Prove? Oh — I don\'t have to."\n\nJudge: "Counsel is correct. This company has one shareholder. Under the Company Law, the burden is on you to prove the company\'s property is independent of your own. Not on her."\n\nThe rule lands like a gut-punch: limited liability is not enough unless you can prove the line.',
                'Ms. Han, with a slow smile: "Prove? Oh — I don\'t have to."\n\nJudge: "Counsel is correct. This company has one shareholder. Under the Company Law, the burden is on you to prove the company\'s property is independent of your own. Not on her."\n\nThe rule lands like a gut-punch: limited liability is not enough unless you can prove the line.'
              ),
              next: 'round-2'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-audit-fundflow'],
              lockedHint: text('Locked. You never kept a fund-flow audit.', 'Locked. You never kept a fund-flow audit.'),
              text: text('[Evidence Card] Present the Fund-Flow Audit right now.', '[Evidence Card] Present the Fund-Flow Audit right now.'),
              result: 'CRITICAL',
              tone: 'good',
              poise: -15,
              conviction: 18,
              response: text(
                'You: "Before counsel goes further — the court can see for itself."\n\nMs. Han, caught mid-breath: "...I haven\'t finished—"\n\nYou read the burden correctly. Han\'s poise cracks.',
                'You: "Before counsel goes further — the court can see for itself."\n\nMs. Han, caught mid-breath: "...I haven\'t finished—"\n\nYou read the burden correctly. Han\'s poise cracks.'
              ),
              next: 'round-2'
            }
          ]
        },
        {
          id: 'round-2',
          title: text('ROUND 2 — Your turn to prove', 'ROUND 2 — Your turn to prove'),
          attack: text('Judge: "Evidence of separation. Now."', 'Judge: "Evidence of separation. Now."'),
          prompt: text('Play the right card.', 'Play the right card.'),
          options: [
            {
              kind: 'evidence',
              requiresEvidence: ['ev-audit-fundflow'],
              lockedHint: text('Locked. No fund-flow audit exists in your file.', 'Locked. No fund-flow audit exists in your file.'),
              text: text('[Fund-Flow Audit] This audit traces every yuan — company in, company out. None of it ran through my accounts.', '[Fund-Flow Audit] This audit traces every yuan — company in, company out. None of it ran through my accounts.'),
              result: 'CRITICAL',
              tone: 'good',
              poise: -45,
              conviction: 35,
              response: text(
                'Judge, studying it: "This traces the flow of funds, not merely the result."\n\nMs. Han: "That — that\'s only one year—"\n\nYou: "It shows the line you said didn\'t exist."\n\nGlass-crack. Ms. Han\'s poise breaks.',
                'Judge, studying it: "This traces the flow of funds, not merely the result."\n\nMs. Han: "That — that\'s only one year—"\n\nYou: "It shows the line you said didn\'t exist."\n\nGlass-crack. Ms. Han\'s poise breaks.'
              ),
              outcome: 'victory'
            },
            {
              kind: 'evidence',
              text: text('[P&L Books] Here are the company\'s books. It is profitable. It is real.', '[P&L Books] Here are the company\'s books. It is profitable. It is real.'),
              result: 'MISS',
              tone: 'bad',
              credibility: -20,
              conviction: -15,
              response: text(
                'Ms. Han, pouncing: "Profit and loss? That tells us the company made money. It tells us nothing about whose pocket it moved through."\n\nJudge: "...Counsel has a point. This does not address separation."\n\nThe right evidence is about the movement of money, not the bottom line.',
                'Ms. Han, pouncing: "Profit and loss? That tells us the company made money. It tells us nothing about whose pocket it moved through."\n\nJudge: "...Counsel has a point. This does not address separation."\n\nThe right evidence is about the movement of money, not the bottom line.'
              ),
              next: 'round-2'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-separate-accounts'],
              lockedHint: text('Locked. You never kept clean separate bank statements.', 'Locked. You never kept clean separate bank statements.'),
              text: text('[Bank Statements] Separate accounts. No crossover.', '[Bank Statements] Separate accounts. No crossover.'),
              result: 'HIT',
              tone: 'tint',
              poise: -20,
              conviction: 15,
              response: text(
                'Ms. Han: "Statements can be curated. Where is the independent audit behind them?"\n\nHan staggers, but recovers. The combo is open: follow with the Fund-Flow Audit.',
                'Ms. Han: "Statements can be curated. Where is the independent audit behind them?"\n\nHan staggers, but recovers. The combo is open: follow with the Fund-Flow Audit.'
              ),
              next: 'round-2-finisher'
            }
          ]
        },
        {
          id: 'round-2-finisher',
          title: text('ROUND 2 — Finish the proof', 'ROUND 2 — Finish the proof'),
          attack: text('Judge: "The statements help. I still need the flow."', 'Judge: "The statements help. I still need the flow."'),
          prompt: text('Complete the combo.', 'Complete the combo.'),
          options: [
            {
              kind: 'evidence',
              requiresEvidence: ['ev-audit-fundflow'],
              lockedHint: text('Locked. No fund-flow audit exists in your file.', 'Locked. No fund-flow audit exists in your file.'),
              text: text('[Fund-Flow Audit] Here is the independent audit behind those statements.', '[Fund-Flow Audit] Here is the independent audit behind those statements.'),
              result: 'CRITICAL',
              tone: 'good',
              poise: -45,
              conviction: 35,
              response: text(
                'Judge: "This completes the picture."\n\nMs. Han sits. For the first time, she has nothing to say.',
                'Judge: "This completes the picture."\n\nMs. Han sits. For the first time, she has nothing to say.'
              ),
              outcome: 'victory'
            },
            {
              kind: 'evidence',
              text: text('[P&L Books] The company made money. That proves it is real.', '[P&L Books] The company made money. That proves it is real.'),
              result: 'MISS',
              tone: 'bad',
              credibility: -20,
              conviction: -15,
              response: text(
                'Judge: "Profit still does not prove separation."\n\nThe court is asking where the money moved, not whether the company earned any.',
                'Judge: "Profit still does not prove separation."\n\nThe court is asking where the money moved, not whether the company earned any.'
              ),
              next: 'round-2-finisher'
            }
          ]
        }
      ],
      outcomes: {
        victory: {
          tone: 'good',
          title: text('VICTORY — Limited liability holds.', 'VICTORY — Limited liability holds.'),
          body: text(
            'Judge: "The court is satisfied the company\'s property is independent. The debt is the company\'s. The shareholder is not personally liable."\n\nYou won because you could prove separation — the exact thing the law puts on a sole shareholder. Limited liability held. It only holds when you can show the line.',
            'Judge: "The court is satisfied the company\'s property is independent. The debt is the company\'s. The shareholder is not personally liable."\n\nYou won because you could prove separation — the exact thing the law puts on a sole shareholder. Limited liability held. It only holds when you can show the line.'
          ),
          reward: text('+ Evidence Awareness · + Risk Control · Captured: Property-Commingling Beast', '+ Evidence Awareness · + Risk Control · Captured: Property-Commingling Beast'),
          hook: text('Even a clean win is worth a lawyer\'s periodic structural check. Evidence standards shift.', 'Even a clean win is worth a lawyer\'s periodic structural check. Evidence standards shift.')
        },
        defeat: {
          tone: 'bad',
          title: text('DEFEAT — Personal liability.', 'DEFEAT — Personal liability.'),
          body: text(
            'Judge: "You cannot show the line. The presumption stands. You are personally liable for the company\'s debt."\n\nYour phone buzzes face-up on the table: personal account — frozen.\n\nFor a one-person company, the court assumes the money was mixed unless you disprove it. This was decided long before today, by how the money was run.',
            'Judge: "You cannot show the line. The presumption stands. You are personally liable for the company\'s debt."\n\nYour phone buzzes face-up on the table: personal account — frozen.\n\nFor a one-person company, the court assumes the money was mixed unless you disprove it. This was decided long before today, by how the money was run.'
          ),
          reward: text('The good news: this is completely preventable.', 'The good news: this is completely preventable.'),
          hook: text('Worth having a lawyer review your structure before it is ever tested.', 'Worth having a lawyer review your structure before it is ever tested.')
        }
      }
    },

    decision: {
      id: 'decision-respond-to-suit',
      question: text('The judge asks for your evidence. How do you respond?', '法官要求你提交证据。你怎么回应？'),
      context: text(
        'You can only present what you actually kept. Notice which options are locked. That is your past bookkeeping talking.',
        '你只能提交过去真实留下的材料。注意哪些选项被锁住了。那是你过去记账方式给出的答案。'
      ),
      branches: [
        {
          id: 'branch-a',
          label: text(
            'A. Prove independence: submit separated accounts and the fund-flow audit',
            'A. 证明独立：提交分开的账户流水和资金流审计'
          ),
          requiresEvidence: ['ev-separate-accounts', 'ev-audit-fundflow'],
          disabledHint: text(
            'Locked. You never kept separate accounts or a fund-flow audit, so there is nothing to prove independence with.',
            '未解锁。你没有保存独立账户流水，也没有资金流审计，所以没有材料可用来证明财产独立。'
          ),
          leadsTo: 'outcome-a-good'
        },
        {
          id: 'branch-b',
          label: text('B. Submit the profit-and-loss audit you do have', 'B. 提交你手里那份盈亏审计'),
          requiresEvidence: ['ev-basic-books'],
          disabledHint: text('Locked. You do not have even basic books to submit.', '未解锁。你连基础账簿都没有。'),
          leadsTo: 'outcome-b-risky'
        },
        {
          id: 'branch-c',
          label: text(
            'C. Argue it is not your problem. The debt is the company\'s, not yours.',
            'C. 抗辩这不是你的问题，债务属于公司而不是你个人'
          ),
          leadsTo: 'outcome-c-bad'
        }
      ]
    },

    outcomes: [
      {
        id: 'outcome-a-good',
        tone: 'good',
        result: text(
          'Limited liability holds. The court accepts that company and personal property are independent.',
          '有限责任成立。法院接受公司财产和个人财产相互独立。'
        ),
        explanation: text(
          'Because you could show separate accounts and an audit tracing the actual movement of money, you met the burden the law puts on a sole shareholder. The company pays its own debt. Your personal assets stay out of it. This is what limited liability is supposed to protect, but only when you can prove separation.',
          '因为你能提交独立账户和能追踪真实资金流向的审计，你完成了一人公司股东应承担的证明责任。公司用公司财产清偿自己的债务，你的个人财产不进入这个范围。这就是有限责任本来要保护的内容，但前提是你能证明分开。'
        ),
        legalBasis: PRC_COMPANY_LAW_23_3,
        skillGain: ['evidenceAwareness', 'riskControl'],
        hook: text(
          'A clean win still deserves a periodic structure check. Rules and evidence standards shift. It is worth a lawyer\'s once-over.',
          '即使结果清楚，也值得定期检查公司结构。规则和证据标准会变化，可以让律师再看一遍。'
        )
      },
      {
        id: 'outcome-b-risky',
        tone: 'risky',
        result: text(
          'Not enough. A profit-and-loss report does not show where the money went. You are at real risk of personal liability.',
          '证据不足。盈亏报告不能显示钱去了哪里，你有承担个人责任的实际风险。'
        ),
        explanation: text(
          'A basic audit that only reflects profit and loss does not trace fund flows between you and the company, so it does not discharge your burden to prove separation. Courts have found this kind of report insufficient. The right evidence is about the movement of money, not the bottom line.',
          '只反映盈亏的基础审计，不能追踪你和公司之间的资金流动，所以不能完成证明财产独立的责任。法院已经认定过这类报告不足。关键证据不是利润结果，而是钱的流向。'
        ),
        legalBasis: PRC_COMPANY_LAW_23_3,
        skillGain: ['legalJudgment', 'evidenceAwareness'],
        hook: text(
          'Proving separation is technical. What holds up in court is not obvious. A lawyer can tell you what evidence you would need.',
          '证明财产独立很技术化。哪些材料能被法院接受并不总是直观。律师可以帮你判断还需要哪些证据。'
        )
      },
      {
        id: 'outcome-c-bad',
        tone: 'bad',
        result: text(
          'Personal liability. With nothing to prove separation, the presumption stands and you are on the hook for the company\'s debt.',
          '个人承担责任。你没有证据证明财产独立，推定继续成立，你要对公司债务负责。'
        ),
        explanation: text(
          'For a one-person company, the law assumes commingling unless you disprove it. Saying "it is the company\'s debt, not mine" is not a defense when you cannot show the two were kept apart. The good news is that this is avoidable. It is decided long before the lawsuit, by how you run the money.',
          '对一人公司来说，除非你能反证，否则法律会按不能证明财产独立处理。你不能证明公司和个人一直分开时，单说“这是公司的债，不是我的债”不是有效抗辩。好消息是，这种结果可以避免。它早在诉讼前就已经由日常资金管理决定。'
        ),
        legalBasis: PRC_COMPANY_LAW_23_3,
        skillGain: ['riskControl'],
        hook: text(
          'This outcome is preventable with the right setup from day one. It is worth having a lawyer review your structure before it is tested.',
          '这个结果可以通过第一天就正确设置来避免。在结构被真正检验前，值得让律师先审查一次。'
        )
      }
    ],

    unlocksLevelId: 'lvl-02-tbd'
  };
});
