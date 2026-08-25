/*
 * level02.js - MVP single-round level.
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

  var LABOR_CONTRACT_LAW_82 = {
    jurisdiction: 'Mainland China (PRC)',
    citation:
      'Labor Contract Law Arts. 10 and 82, plus Implementation Regulations Art. 7: a written labor contract is due within one month of the start of work. From month 2 to less than one year without one, the employer pays double wages monthly, capped at 11 months. A full year with none is deemed an open-ended contract.',
    effectiveDate: '2008-01-01',
    exceptions:
      'If the employer proves it asked the employee to sign within the first month and the employee refused for their own reasons, the double-wage claim is generally not supported under the good-faith principle. Double wages are computed on the agreed normal-time monthly wage, minus the single wage already paid.',
    reviewedBy: 'pending - licensed PRC lawyer review required before publish',
    lastUpdated: '2026-08-25',
    verifyWith:
      'licensed PRC lawyer; regional arbitration practice varies, including Beijing guidance, so confirm locally'
  };

  return {
    id: 'lvl-02-labor-no-contract',
    order: 2,
    theme: 'labor-workplace',
    title: 'Nothing in writing',
    audience: 'Foreign founder who just made their first hire',
    icon: 'doublewage',
    risk: ['labor'],
    scenario:
      'You hired Wei eight months ago on a handshake and an offer email. You paid her in full and on time and covered her social insurance from day one, but you never signed a written labor contract. You meant to formalize it later. She resigned and filed at labor arbitration for double wages for every unsigned month.',

    dexEntry: {
      id: 'lvl-02-labor-no-contract',
      monster: 'doublewage',
      name: 'Blank Contract Beast',
      type: 'LABOR',
      danger: 4,
      rarity: 2,
      from: 'Level 2 - Nothing in writing',
      note:
        'It appears when the first hire starts work before the contract is signed. It is only a sheet of paper, but it can duplicate months of wages.',
      weak:
        'A written labor contract signed within one month, or documented proof that you asked on time and the employee refused.'
    },

    characters: [
      {
        id: 'zhou',
        name: 'Mr. Zhou',
        role: 'Employee representative',
        line:
          'Eight months my client worked for you. Eight months, and not one signed labor contract. The law is quite specific about that.'
      },
      {
        id: 'arbitrator',
        name: 'Arbitrator',
        role: 'Labor arbitration panel',
        line:
          'The Labor Contract Law requires a written contract within one month. Do you have one?'
      },
      {
        id: 'wei',
        name: 'Wei',
        role: 'Former employee',
        line:
          'I was paid. That is not why I filed. I am asking for the legal penalty.'
      }
    ],

    setup: {
      id: 'setup-hiring-paperwork',
      question: 'Before she resigned, how did you paper the first hire?',
      context: 'This choice decides which cards you hold at arbitration.',
      branches: [
        {
          id: 'setup-signed',
          label: 'Signed a written labor contract in the first week',
          setsEvidence: ['ev-signed-contract']
        },
        {
          id: 'setup-asked-refused',
          label:
            'Asked her to sign in week one, in writing. She kept stalling, and you kept the record',
          setsEvidence: ['ev-refusal-record', 'ev-offer-email']
        },
        {
          id: 'setup-loose',
          label:
            'Handshake and offer email. You paid her well and meant to formalize it later',
          setsEvidence: ['ev-offer-email', 'ev-payroll', 'ev-social-insurance']
        }
      ]
    },

    availableEvidence: [
      {
        id: 'ev-signed-contract',
        label: 'A signed written labor contract, dated in the first month'
      },
      {
        id: 'ev-refusal-record',
        label:
          'Written proof you asked her to sign within the first month, and she declined'
      },
      {
        id: 'ev-offer-email',
        label: 'The offer email she accepted'
      },
      {
        id: 'ev-payroll',
        label: 'Payroll records: paid in full, on time'
      },
      {
        id: 'ev-social-insurance',
        label: 'Proof you enrolled her in social insurance'
      }
    ],

    riskInsight:
      'The duty is the written contract itself, due within one month of day one. Paying wages, paying social insurance, or having a verbal deal does not substitute for it.',

    battle: {
      id: 'the-signature-you-never-collected',
      title: 'Labor Arbitration: The Signature You Never Collected',
      meters: {
        credibility: 'YOU - CREDIBILITY',
        poise: 'MR. ZHOU - POISE',
        conviction: 'ARBITRATOR - CONVICTION'
      },
      rules: [
        'CREDIBILITY starts at 100. Wrong answers make the panel trust you less.',
        'Mr. Zhou has POISE. The correct document breaks it.',
        'The Arbitrator\'s conviction bar moves toward the side that answers the real legal question.'
      ],
      start: { credibility: 100, poise: 50, conviction: 25 },
      opening: {
        title: 'ROUND 0 - Mr. Zhou opens',
        line:
          'Mr. Zhou, mild and unhurried: "Eight months my client worked for you. Eight months, and not one signed labor contract. The law is quite specific about that."\n\nThe Arbitrator looks down at the file. The room goes quiet.',
        effect: 'The Arbitrator\'s conviction bar slides toward Zhou.',
        next: 'round-1'
      },
      rounds: [
        {
          id: 'round-1',
          title: 'ROUND 1 - The trap',
          attack: 'Arbitrator: "Your reply?"',
          prompt: 'Choose your reply.',
          options: [
            {
              kind: 'evidence',
              requiresEvidence: ['ev-payroll', 'ev-social-insurance'],
              lockedHint: 'You do not have both payroll and social-insurance records in this file.',
              text:
                '[Evidence] I paid her in full, every month, on time, and I covered her social insurance.',
              result: 'MISS',
              tone: 'bad',
              credibility: -25,
              conviction: -18,
              response:
                'Mr. Zhou, almost gentle: "No one says you underpaid her. That is not the claim."\n\nArbitrator: "The Labor Contract Law requires a written contract within one month of the start of work. Wages and social insurance are not a written labor contract. Do you have one?"\n\nThe claim was never about whether you were fair. You were answering a question no one asked.',
              next: 'round-2'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-offer-email'],
              lockedHint: 'You have no offer email in this file.',
              text:
                '[Evidence] We had a clear agreement. Here is the offer email she accepted.',
              result: 'MISS',
              tone: 'bad',
              credibility: -25,
              conviction: -18,
              response:
                'Mr. Zhou: "An offer email is not the statutory written labor contract."\n\nArbitrator: "A verbal understanding or an accepted offer does not replace the signed contract required by law. Do you have that contract?"\n\nThe signature, not the relationship, is the missing object.',
              next: 'round-2'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-signed-contract'],
              lockedHint: 'You never signed one.',
              text: '[Evidence] Present the signed written labor contract.',
              result: 'CRITICAL',
              tone: 'good',
              poise: -50,
              conviction: 35,
              response:
                'Arbitrator, examining it: "A written contract, signed within the first month. Then there is no violation."\n\nMr. Zhou closes his folder. For once, precision has nowhere left to go.',
              outcome: 'victory'
            }
          ]
        },
        {
          id: 'round-2',
          title: 'ROUND 2 - The demand',
          attack:
            'Arbitrator: "A signed written contract, or proof you asked and she refused. Which is it?"',
          prompt: 'Play the right card.',
          options: [
            {
              kind: 'evidence',
              requiresEvidence: ['ev-signed-contract'],
              lockedHint: 'You never signed one.',
              text: '[Signed Labor Contract] Signed in the first week. Here.',
              result: 'CRITICAL',
              tone: 'good',
              poise: -50,
              conviction: 35,
              response:
                'Arbitrator, examining it: "A written contract, signed within the first month. Then there is no violation."\n\nMr. Zhou: "...No further questions."',
              outcome: 'victory'
            },
            {
              kind: 'evidence',
              requiresEvidence: ['ev-refusal-record'],
              lockedHint:
                'You have no written record that you asked her to sign in the first month.',
              text:
                '[Written Refusal Record] I asked her to sign in week one, in writing. She kept putting it off. Here is the record.',
              result: 'HIT',
              tone: 'tint',
              poise: -35,
              conviction: 28,
              response:
                'Arbitrator: "You did request it in writing within the month, and she declined?"\n\nMr. Zhou: "She was busy."\n\nYou: "The law asks whether I offered. I did. And I can show it."\n\nArbitrator: "On this record, the double-wage claim is not supported."',
              outcome: 'risky'
            },
            {
              kind: 'evidence',
              text:
                '[Offer Email + Payroll + Social Insurance] But look how fairly I treated her.',
              result: 'MISS',
              tone: 'bad',
              credibility: -100,
              conviction: -35,
              response:
                'Mr. Zhou: "Again, none of that is a contract."\n\nArbitrator: "Double wages, from the second month through the eighth. Seven months."\n\nYour credibility hits zero.',
              outcome: 'defeat'
            }
          ]
        }
      ],
      outcomes: {
        victory: {
          tone: 'good',
          title: 'VICTORY - The signature exists.',
          body:
            'Arbitrator: "The written labor contract was signed within the first month. The double-wage claim is not supported."\n\nYou were fine here because the paperwork existed. The law\'s clock starts on day one, not when things settle down.',
          reward:
            '+ Legal Judgment + Risk Control + Captured: Blank Contract Beast',
          hook:
            'Your paperwork held this time. A lawyer can turn that into a clean template for every future hire.'
        },
        risky: {
          tone: 'risky',
          title: 'VICTORY - The paper trail holds.',
          body:
            'Arbitrator: "You asked for the written contract in time, in writing, and the employee did not sign for her own reasons. On this record, the double-wage claim is not supported."\n\nThis defense worked, but only because the request was timely and documented. A verbal reminder would not have saved you.',
          reward:
            '+ Legal Judgment + Evidence Awareness + Captured: Blank Contract Beast',
          hook:
            'This defense lives or dies on timing and records. A lawyer can set up the exact paper trail that holds.'
        },
        defeat: {
          tone: 'bad',
          title: 'DEFEAT - Double wages.',
          body:
            'Arbitrator: "The award: double wages for months two through eight. An additional RMB 84,000."\n\nYour phone lights up with a transfer draft for RMB 84,000. That is the price of a signature you never collected.',
          reward: 'Seen: Blank Contract Beast',
          hook:
            'Being generous does not discharge the duty to put the hire in writing within a month. Before your next hire, have a lawyer set up hiring paperwork that closes this gap.'
        }
      }
    },

    decision: {
      id: 'decision-arbitration',
      question: 'The arbitrator asks for your evidence. What do you present?',
      context:
        'Notice which options are locked. That is your hiring paperwork talking.',
      branches: [
        {
          id: 'branch-a',
          label: 'A. Present the signed written labor contract',
          requiresEvidence: ['ev-signed-contract'],
          disabledHint: 'Locked. You never signed one.',
          leadsTo: 'outcome-a-good'
        },
        {
          id: 'branch-c',
          label:
            'C. Present written proof she refused to sign despite your timely request',
          requiresEvidence: ['ev-refusal-record'],
          disabledHint:
            'Locked. You have no record of asking her to sign in the first month.',
          leadsTo: 'outcome-c-risky'
        },
        {
          id: 'branch-b',
          label:
            'B. Argue you treated her fairly: pay, on time, social insurance',
          leadsTo: 'outcome-b-bad'
        }
      ]
    },

    outcomes: [
      {
        id: 'outcome-a-good',
        tone: 'good',
        result:
          'No violation. A written contract signed within the first month means no double wages.',
        explanation:
          'The law requires a written labor contract concluded within one month of the start of work. You had it, dated in time, so the double-wage penalty does not apply. This is the whole game: a one-page signature, collected on day one.',
        legalBasis: LABOR_CONTRACT_LAW_82,
        skillGain: ['legalJudgment', 'riskControl'],
        hook:
          'Your paperwork held this time. A lawyer can turn that into a clean template for every future hire.'
      },
      {
        id: 'outcome-c-risky',
        tone: 'risky',
        result:
          'Claim not supported, because you can prove you asked in time and she refused.',
        explanation:
          'If the employer can show it requested the written contract within the first month and the employee declined for her own reasons, courts generally do not award double wages. This only works because your request was timely and in writing. A verbal reminder would not have saved you.',
        legalBasis: LABOR_CONTRACT_LAW_82,
        skillGain: ['evidenceAwareness', 'legalJudgment'],
        hook:
          'This defense lives or dies on documentation and timing. A lawyer can set up the exact paper trail that holds.'
      },
      {
        id: 'outcome-b-bad',
        tone: 'bad',
        result:
          'Double wages awarded: months 2 through 8, an extra RMB 84,000.',
        explanation:
          'This surprises almost every first-time employer: being generous does not discharge the duty to put the hire in writing within a month, and the penalty is double wages for the unsigned period, up to 11 months. Pay, punctuality and social insurance do not replace the contract. It is preventable with a one-page contract on day one.',
        legalBasis: LABOR_CONTRACT_LAW_82,
        skillGain: ['riskControl'],
        hook:
          'Before your next hire, have a lawyer set up hiring paperwork that closes this gap for good.'
      }
    ],

    unlocksLevelId: null
  };
});
