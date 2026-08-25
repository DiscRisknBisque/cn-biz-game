/*
 * level02.js — MVP single-round level.
 *
 * This level teaches that an employer's duty is the signed written labor
 * contract itself. Good treatment, pay records and social insurance do not
 * replace the signature.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Level02 = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function text(en, zh) {
    return { en: en, zh: zh };
  }

  var LABOR_CONTRACT_LAW_82 = {
    jurisdiction: text('Mainland China (PRC)', '中国内地'),
    citation: text(
      'Labor Contract Law Arts. 10 and 82, plus Implementation Regulations Art. 7: a written labor contract is due within one month of the start of work. From month 2 to less than one year without one, the employer pays double wages monthly, capped at 11 months. A full year with none is deemed an open-ended contract.',
      '《劳动合同法》第10条、第82条及《劳动合同法实施条例》第7条：书面劳动合同须自用工之日起一个月内订立。满一个月不满一年未订立的，用人单位按月支付双倍工资，最长不超过11个月。满一年仍未订立的，视为已订立无固定期限劳动合同。'
    ),
    effectiveDate: '2008-01-01',
    exceptions: text(
      'Some regional arbitration practice will refuse double wages if the employer proves it asked the employee to sign within the first month, in writing, and the employee refused for their own reasons. This is not a uniform statutory exception. Confirm locally. Double wages are computed on the agreed normal-time monthly wage, minus the single wage already paid.',
      '部分地区仲裁实践认为：用人单位能证明已在一个月内书面催签，而劳动者因自身原因拒绝的，双倍工资请求一般不予支持。这不是全国统一的法定免责条款，须按当地口径核实。双倍工资以约定的正常工作时间月工资为基数，扣除已支付的一倍工资。'
    ),
    reviewedBy: text('pending — licensed PRC lawyer review required before publish', 'pending — 发布前须由中国执业律师审核'),
    lastUpdated: '2026-08-25',
    verifyWith: text(
      'licensed PRC lawyer; regional arbitration practice varies, including Beijing guidance, so confirm locally',
      '中国执业律师；各地仲裁口径不一（含北京相关指引），须按当地实践核实'
    )
  };

  return {
    id: 'lvl-02-labor-no-contract',
    order: 2,
    theme: 'labor-workplace',
    requiresChapter: { campaign: 'foreign', chapter: 'labor' },
    title: text('Nothing in writing', '空白合同'),
    audience: text(
      'Foreign founder who just made their first hire',
      '刚招了第一个人的外国创始人'
    ),
    icon: 'doublewage',
    risk: ['labor'],
    scenario: text(
      'You hired Wei eight months ago on a handshake and an offer email. Her agreed monthly wage was RMB 12,000. You paid her in full and on time and covered her social insurance from day one, but you never signed a written labor contract. You meant to formalize it later. She resigned and filed at labor arbitration for double wages for every unsigned month.',
      '八个月前，你用握手和一封录用邮件招了薇。约定月工资 1.2 万元。你每月足额按时发工资，从第一天就给她缴了社保，但一直没有签书面劳动合同，想着“以后再补手续”。她刚离职，并向劳动仲裁委申请未签合同期间的双倍工资。'
    ),

    dexEntry: {
      id: 'doublewage',
      monster: 'doublewage',
      name: text('DOUBLEWAGE', '双倍工资鬼'),
      type: text('LABOUR', '劳动'),
      danger: 4,
      rarity: 2,
      from: text('Level 2 · Nothing in writing', '第 2 关 · 空白合同'),
      note: text(
        'It appears when the first hire starts work before the contract is signed. It is only a sheet of paper, but it can duplicate months of wages.',
        '当第一名员工已经上岗、合同却还没签时，它就会出现。它只是一张白纸，却能把几个月的工资翻成双倍。'
      ),
      weak: text(
        'A written labor contract signed within one month, or documented proof that you asked on time and the employee refused.',
        '一个月内签下的书面劳动合同，或能证明你及时书面催签、对方拒绝的记录。'
      )
    },

    characters: [
      {
        id: 'zhou',
        name: text('Mr. Zhou', '周先生'),
        role: text('Employee representative', '劳动者代理人'),
        line: text(
          'Eight months my client worked for you. Eight months, and not one signed labor contract. The law is quite specific about that.',
          '我的委托人给你干了八个月。八个月，一份签过的劳动合同都没有。法律对此规定得很清楚。'
        )
      },
      {
        id: 'arbitrator',
        name: text('Arbitrator', '仲裁员'),
        role: text('Labor arbitration panel', '劳动仲裁庭'),
        line: text(
          'The Labor Contract Law requires a written contract within one month. Do you have one?',
          '《劳动合同法》要求自用工之日起一个月内订立书面合同。你有吗？'
        )
      },
      {
        id: 'wei',
        name: text('Wei', '薇'),
        role: text('Former employee', '前员工'),
        line: text(
          'I was paid. That is not why I filed. I am asking for the legal penalty.',
          '工资我收到了。我申请的不是这个。我要的是法律规定的那份责任。'
        )
      }
    ],

    setup: {
      id: 'setup-hiring-paperwork',
      question: text('Before she resigned, how did you paper the first hire?', '她离职前，你怎么处理第一次用工的手续？'),
      context: text(
        'This choice decides which cards you hold at arbitration.',
        '这一项选择会决定你在仲裁时手里有哪些材料。'
      ),
      branches: [
        {
          id: 'setup-signed',
          label: text(
            'Signed a written labor contract in the first week',
            '第一周就签了书面劳动合同'
          ),
          setsEvidence: ['ev-signed-contract']
        },
        {
          id: 'setup-asked-refused',
          label: text(
            'Asked her to sign in week one, in writing. She kept stalling, and you kept the record',
            '第一周就书面催她签，她一直拖，你留了记录'
          ),
          setsEvidence: ['ev-refusal-record', 'ev-offer-email']
        },
        {
          id: 'setup-loose',
          label: text(
            'Handshake and offer email. You paid her well and meant to formalize it later',
            '握手加录用邮件。待遇给得很足，想着以后再补手续'
          ),
          setsEvidence: ['ev-offer-email', 'ev-payroll', 'ev-social-insurance']
        }
      ]
    },

    availableEvidence: [
      {
        id: 'ev-signed-contract',
        label: text('A signed written labor contract, dated in the first month', '一份签过字的书面劳动合同，落款在第一个月内')
      },
      {
        id: 'ev-refusal-record',
        label: text(
          'Written proof you asked her to sign within the first month, and she declined',
          '书面证据：你在第一个月内催她签字，她拒绝了'
        )
      },
      {
        id: 'ev-offer-email',
        label: text('The offer email she accepted', '她接受过的录用邮件')
      },
      {
        id: 'ev-payroll',
        label: text('Payroll records: paid in full, on time', '工资记录：足额、按时发放')
      },
      {
        id: 'ev-social-insurance',
        label: text('Proof you enrolled her in social insurance', '为她缴纳社会保险的证明')
      }
    ],

    riskInsight: text(
      'The duty is the written contract itself, due within one month of day one. Paying wages, paying social insurance, or having a verbal deal does not substitute for it.',
      '义务就是书面合同本身，从用工第一天起一个月内必须订立。发工资、缴社保、口头约定，都不能代替它。'
    ),

    battle: {
      id: 'the-signature-you-never-collected',
      title: text('Labor Arbitration: The Signature You Never Collected', '劳动仲裁：你从未收齐的那一签'),
      meters: {
        credibility: text('YOU · CREDIBILITY', '你 · 信誉'),
        poise: text('MR. ZHOU · POISE', '周先生 · 架势'),
        conviction: text('ARBITRATOR · CONVICTION', '仲裁员 · 心证')
      },
      rules: [
        text('CREDIBILITY starts at 100. Wrong answers make the panel trust you less.', '信誉值初始为 100。错误回应会让仲裁庭更不信任你。'),
        text('Mr. Zhou has POISE. The correct document breaks it.', '周先生有架势值。正确材料会击破它。'),
        text('The Arbitrator\'s conviction bar moves toward the side that answers the real legal question.', '仲裁员心证条会向真正回答法律问题的一方倾斜。')
      ],
      start: { credibility: 100, poise: 50, conviction: 25 },
      opening: {
        title: text('ROUND 0 — Mr. Zhou opens', '第 0 回合：周先生先攻'),
        line: text(
          'Mr. Zhou, mild and unhurried: "Eight months my client worked for you. Eight months, and not one signed labor contract. The law is quite specific about that."\n\nThe Arbitrator looks down at the file. The room goes quiet.',
          '周先生，不紧不慢：“我的委托人给你干了八个月。八个月，一份签过的劳动合同都没有。法律对此规定得很清楚。”\n\n仲裁员低头看卷宗。房间安静下来。'
        ),
        effect: text('The Arbitrator\'s conviction bar slides toward Zhou.', '仲裁员心证条向周先生一侧滑动。'),
        next: 'round-1'
      },
      rounds: [
        {
          id: 'round-1',
          title: text('ROUND 1 — The trap', '第 1 回合：陷阱'),
          attack: text('Arbitrator: "Your reply?"', '仲裁员：“你怎么回应？”'),
          prompt: text('Choose your reply.', '选择你的回应。'),
          options: [
            {
              kind: 'evidence',
              requiresEvidence: ['ev-payroll', 'ev-social-insurance'],
              lockedHint: text('You do not have both payroll and social-insurance records in this file.', '你这份材料里没有同时备齐工资和社保记录。'),
              text: text(
                '[Evidence] I paid her in full, every month, on time, and I covered her social insurance.',
                '【证据】我每月足额按时发工资，也给她缴了社保。'
              ),
              result: 'MISS',
              tone: 'bad',
              credibility: -25,
              conviction: -18,
              response: text(
                'Mr. Zhou, almost gentle: "No one says you underpaid her. That is not the claim."\n\nArbitrator: "The Labor Contract Law requires a written contract within one month of the start of work. Wages and social insurance are not a written labor contract. Do you have one?"\n\nThe claim was never about whether you were fair. You were answering a question no one asked.',
                '周先生几乎很温和：“没有人说你少发了工资。那不是本案请求。”\n\n仲裁员：“《劳动合同法》要求自用工之日起一个月内订立书面合同。工资和社保都不是书面劳动合同。你有吗？”\n\n请求从来不是你待她好不好。你一直在回答一个没有人问的问题。'
              ),
              next: 'round-2'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-offer-email'],
              lockedHint: text('You have no offer email in this file.', '你这份材料里没有录用邮件。'),
              text: text(
                '[Evidence] We had a clear agreement. Here is the offer email she accepted.',
                '【证据】我们当时说得很清楚。这是她接受过的录用邮件。'
              ),
              result: 'MISS',
              tone: 'bad',
              credibility: -25,
              conviction: -18,
              response: text(
                'Mr. Zhou: "An offer email is not the statutory written labor contract."\n\nArbitrator: "A verbal understanding or an accepted offer does not replace the signed contract required by law. Do you have that contract?"\n\nThe signature, not the relationship, is the missing object.',
                '周先生：“录用邮件不是法定的书面劳动合同。”\n\n仲裁员：“口头约定或已接受的录用，都不能代替法律要求的签字合同。你有那份合同吗？”\n\n缺的是签字，不是关系。'
              ),
              next: 'round-2'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-signed-contract'],
              lockedHint: text('You never signed one.', '未解锁。你从来没有签过。'),
              text: text('[Evidence] Present the signed written labor contract.', '【证据】出示签过字的书面劳动合同。'),
              result: 'CRITICAL',
              tone: 'good',
              poise: -50,
              conviction: 35,
              response: text(
                'Arbitrator, examining it: "A written contract, signed within the first month. Then there is no violation. Wages and social insurance do not replace that signature — but you had the signature, so the double-wage claim fails."\n\nMr. Zhou closes his folder. For once, precision has nowhere left to go.',
                '仲裁员低头看材料：“书面合同，第一个月内签的。那就没有违法。工资和社保都不能代替这一签——但你有这一签，所以双倍工资请求不能支持。”\n\n周先生合上文件夹。这一次，精确已经无路可走。'
              ),
              outcome: 'victory'
            }
          ]
        },
        {
          id: 'round-2',
          title: text('ROUND 2 — The demand', '第 2 回合：要求'),
          attack: text(
            'Arbitrator: "A signed written contract, or proof you asked and she refused. Which is it?"',
            '仲裁员：“签过的书面合同，或你催签而她拒绝的证明。是哪一种？”'
          ),
          prompt: text('Play the right card.', '打出正确证据卡。'),
          options: [
            {
              kind: 'evidence',
              requiresEvidence: ['ev-signed-contract'],
              lockedHint: text('You never signed one.', '未解锁。你从来没有签过。'),
              text: text('[Signed Labor Contract] Signed in the first week. Here.', '【书面劳动合同】第一周就签了。在这里。'),
              result: 'CRITICAL',
              tone: 'good',
              poise: -50,
              conviction: 35,
              response: text(
                'Arbitrator, examining it: "A written contract, signed within the first month. Then there is no violation. Wages and social insurance do not replace that signature — but you had the signature, so the double-wage claim fails."\n\nMr. Zhou: "...No further questions."',
                '仲裁员低头看材料：“书面合同，第一个月内签的。那就没有违法。工资和社保都不能代替这一签——但你有这一签，所以双倍工资请求不能支持。”\n\n周先生：“……没有其他问题了。”'
              ),
              outcome: 'victory'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-refusal-record'],
              lockedHint: text(
                'You have no written record that you asked her to sign in the first month.',
                '未解锁。你没有第一个月内书面催签的记录。'
              ),
              text: text(
                '[Written Refusal Record] I asked her to sign in week one, in writing. She kept putting it off. Here is the record.',
                '【书面拒绝记录】第一周我就书面催她签。她一直拖。记录在这里。'
              ),
              result: 'HIT',
              tone: 'tint',
              poise: -35,
              conviction: 28,
              response: text(
                'Arbitrator: "You did request it in writing within the month, and she declined?"\n\nMr. Zhou: "She was busy."\n\nYou: "The law asks whether I offered. I did. And I can show it."\n\nArbitrator: "On this record, the double-wage claim is not supported."',
                '仲裁员：“你确实在一个月内书面要求签订，而她拒绝了？”\n\n周先生：“她当时很忙——”\n\n你：“法律问的是我有没有提出。我提出了。而且我能证明。”\n\n仲裁员：“就现有记录，双倍工资请求不能支持。”'
              ),
              outcome: 'risky'
            },
            {
              kind: 'evidence',
              text: text(
                '[Offer Email + Payroll + Social Insurance] But look how fairly I treated her.',
                '【录用邮件 + 工资 + 社保】可是你看我待她多么公平。'
              ),
              result: 'MISS',
              tone: 'bad',
              credibility: -100,
              conviction: -35,
              response: text(
                'Mr. Zhou: "Again, none of that is a contract."\n\nArbitrator: "Double wages, from the second month through the eighth. Seven months."\n\nYour credibility hits zero.',
                '周先生：“再说一遍——那些都不是合同。”\n\n仲裁员：“双倍工资，从第二个月到第八个月。共七个月。”\n\n你的信誉降到 0。'
              ),
              outcome: 'defeat'
            }
          ]
        }
      ],
      outcomes: {
        victory: {
          tone: 'good',
          title: text('VICTORY — The signature exists.', '胜利：签字存在。'),
          body: text(
            'Arbitrator: "The written labor contract was signed within the first month. The double-wage claim is not supported."\n\nYou were fine here because the paperwork existed. The law\'s clock starts on day one, not when things settle down.',
            '仲裁员：“书面劳动合同在第一个月内签订。双倍工资请求不能支持。”\n\n你过关，是因为手续当时就在。法律的计时从第一天开始，不是从“事情安顿下来”才开始。'
          ),
          reward: text('+ Legal Judgment · + Risk Control · Captured: DOUBLEWAGE', '+ 法律判断 · + 风险控制 · 捕获：双倍工资鬼'),
          hook: text(
            'Your paperwork held this time. A lawyer can turn that into a clean template for every future hire.',
            '这次手续撑住了。律师可以把这份材料做成以后每次招人都能用的干净模板。'
          )
        },
        risky: {
          tone: 'risky',
          title: text('VICTORY — The paper trail holds.', '胜利：书面记录撑住了。'),
          body: text(
            'Arbitrator: "You asked for the written contract in time, in writing, and the employee did not sign for her own reasons. On this record, the double-wage claim is not supported."\n\nThis defense worked, but only because the request was timely and documented. A verbal reminder would not have saved you.',
            '仲裁员：“你及时以书面方式要求订立合同，劳动者因自身原因未签。就现有记录，双倍工资请求不能支持。”\n\n这个抗辩成立，只是因为催签及时并且留了书面记录。口头催一句救不了你。'
          ),
          reward: text('+ Legal Judgment · + Evidence Awareness · Captured: DOUBLEWAGE', '+ 法律判断 · + 证据意识 · 捕获：双倍工资鬼'),
          hook: text(
            'This defense lives or dies on timing and records. A lawyer can set up the exact paper trail that holds.',
            '这个抗辩成败全看时间和留痕。律师可以帮你把经得住检验的书面流程搭好。'
          )
        },
        defeat: {
          tone: 'bad',
          title: text('DEFEAT — Double wages.', '失败：双倍工资。'),
          body: text(
            'Arbitrator: "The award: double wages for months two through eight. Her monthly wage is RMB 12,000. The extra one-times wage for seven months is RMB 84,000."\n\nYour phone lights up with a transfer draft for RMB 84,000. That is the price of a signature you never collected.',
            '仲裁员：“裁决：第二个月至第八个月的双倍工资。月工资 1.2 万元。七个月的一倍工资差额是 8.4 万元。”\n\n你的手机亮起一笔 8.4 万元的转账草稿。这就是你从未收齐的那一签的价格。'
          ),
          reward: text('Seen: DOUBLEWAGE', '见过：双倍工资鬼'),
          hook: text(
            'Being generous does not discharge the duty to put the hire in writing within a month. Before your next hire, have a lawyer set up hiring paperwork that closes this gap.',
            '待人厚道，并不能免除一个月内订立书面合同的义务。下次招人之前，值得让律师把用工手续一次补齐。'
          )
        }
      }
    },

    decision: {
      id: 'decision-arbitration',
      question: text('The arbitrator asks for your evidence. What do you present?', '仲裁员要求你提交证据。你出示什么？'),
      context: text(
        'Notice which options are locked. That is your hiring paperwork talking.',
        '注意哪些选项被锁住了。那是你当初用工手续给出的答案。'
      ),
      branches: [
        {
          id: 'branch-a',
          label: text('A. Present the signed written labor contract', 'A. 出示签过字的书面劳动合同'),
          requiresEvidence: ['ev-signed-contract'],
          disabledHint: text('Locked. You never signed one.', '未解锁。你从来没有签过。'),
          leadsTo: 'outcome-a-good'
        },
        {
          id: 'branch-c',
          label: text(
            'C. Present written proof she refused to sign despite your timely request',
            'C. 出示书面证明：你及时催签，她拒绝签字'
          ),
          requiresEvidence: ['ev-refusal-record'],
          disabledHint: text(
            'Locked. You have no record of asking her to sign in the first month.',
            '未解锁。你没有第一个月内催她签字的记录。'
          ),
          leadsTo: 'outcome-c-risky'
        },
        {
          id: 'branch-b',
          label: text(
            'B. Argue you treated her fairly: pay, on time, social insurance',
            'B. 抗辩你待她公平：足额、按时、缴了社保'
          ),
          leadsTo: 'outcome-b-bad'
        }
      ]
    },

    outcomes: [
      {
        id: 'outcome-a-good',
        tone: 'good',
        result: text(
          'No violation. A written contract signed within the first month means no double wages.',
          '不构成违法。第一个月内签订的书面合同，不会产生双倍工资。'
        ),
        explanation: text(
          'The law requires a written labor contract concluded within one month of the start of work. You had it, dated in time, so the double-wage penalty does not apply. This is the whole game: a one-page signature, collected on day one.',
          '法律要求的，就是自用工之日起一个月内订立书面劳动合同。你有这份合同，落款也及时，所以双倍工资罚则不适用。整件事就是：第一天收下一页纸上的签字。'
        ),
        legalBasis: LABOR_CONTRACT_LAW_82,
        skillGain: ['legalJudgment', 'riskControl'],
        hook: text(
          'Your paperwork held this time. A lawyer can turn that into a clean template for every future hire.',
          '这次手续撑住了。律师可以把这份材料做成以后每次招人都能用的干净模板。'
        )
      },
      {
        id: 'outcome-c-risky',
        tone: 'risky',
        result: text(
          'Claim not supported, because you can prove you asked in time and she refused.',
          '请求不能支持，因为你能证明及时催签、对方拒绝。'
        ),
        explanation: text(
          'Some regional practice will refuse double wages if the employer can show a timely written request and a refusal for the employee\'s own reasons. This is not a uniform national rule. This path only works because your request was timely and in writing. A verbal reminder would not have saved you.',
          '部分地区实践认为：用人单位能证明及时书面催签、劳动者因自身原因拒绝的，可不支持双倍工资。这不是全国统一规则。这条路能走通，只是因为催签及时并且是书面的。口头催一句救不了你。'
        ),
        legalBasis: LABOR_CONTRACT_LAW_82,
        skillGain: ['evidenceAwareness', 'legalJudgment'],
        hook: text(
          'This defense lives or dies on documentation and timing. A lawyer can set up the exact paper trail that holds.',
          '这个抗辩成败全看留痕和时间。律师可以帮你把经得住检验的书面流程搭好。'
        )
      },
      {
        id: 'outcome-b-bad',
        tone: 'bad',
        result: text(
          'Double wages awarded: months 2 through 8. Monthly wage RMB 12,000, so an extra RMB 84,000.',
          '裁决支付双倍工资：第 2 个月至第 8 个月。月工资 1.2 万元，差额 8.4 万元。'
        ),
        explanation: text(
          'This surprises almost every first-time employer: being generous does not discharge the duty to put the hire in writing within a month, and the penalty is double wages for the unsigned period, up to 11 months. Pay, punctuality and social insurance do not replace the contract. It is preventable with a one-page contract on day one.',
          '几乎每个第一次招人的雇主都会意外：待人厚道并不能免除一个月内订立书面合同的义务，罚则是未签期间的双倍工资，最长 11 个月。工资、准时、社保都不能代替合同。第一天签下一页纸，就可以避免。'
        ),
        legalBasis: LABOR_CONTRACT_LAW_82,
        skillGain: ['riskControl'],
        hook: text(
          'Before your next hire, have a lawyer set up hiring paperwork that closes this gap for good.',
          '下次招人之前，值得让律师把用工手续一次补齐，把这个缺口封死。'
        )
      }
    ],

    unlocksLevelId: null
  };
});
