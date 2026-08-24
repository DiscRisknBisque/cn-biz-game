/*
 * Level 1 — "Whose money is it?" (WFOE / one-person-company commingling)
 * Theme: 公司法 / 外商投资
 *
 * Ported from the supplied TypeScript source. Types live in
 * wechat/types/levels.d.ts; this file is plain CommonJS because a WeChat
 * mini-program has no build step by default.
 *
 * ── REVIEW GATE ────────────────────────────────────────────────────────────
 * legalBasis.reviewedBy is "pending". The engine detects that and the level
 * screen shows a banner that cannot be dismissed. A licensed PRC lawyer must
 * sign off before this ships. Law and thresholds move — keep verifyWith visible.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Two changes from the source, both flagged where they occur:
 *   1. setup-separate also grants ev-basic-books (see the comment there).
 *   2. Nothing else — copy is verbatim.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.Levels = root.Levels || {}; root.Levels['lvl-01-wfoe-commingling'] = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PRC_COMPANY_LAW_23_3 = {
    jurisdiction: 'Mainland China (PRC)',
    citation: "PRC Company Law (2023 revision), Art. 23(3) — a company with a single shareholder that cannot prove its property is independent of the shareholder's own property is jointly liable for the company's debts",
    effectiveDate: '2024-07-01',
    exceptions:
      "The reversed burden of proof applies to PROPERTY commingling. Other veil-piercing grounds (excessive control, gross undercapitalization) follow the normal 'who asserts, proves' rule.",
    reviewedBy: 'pending — licensed PRC lawyer review required before publish',
    lastUpdated: '2026-08-24',
    verifyWith: 'licensed PRC lawyer; confirm the current article text and any judicial interpretations'
  };

  return {
    id: 'lvl-01-wfoe-commingling',
    order: 1,
    theme: 'company-law-fdi',
    title: 'Whose money is it?',
    audience: 'Foreign founder running a WFOE (a one-person company under PRC law)',

    scenario:
      "Your WFOE owes a supplier ¥180,000 for goods you can't currently pay. The supplier sues — and their lawyer argues something that catches you off guard: that your company's money and your own money are really one pot, so YOU should pay the debt personally. In China, for a one-person company, the law doesn't make the creditor prove the mixing. It makes YOU prove you kept things separate.",

    characters: [
      { id: 'creditor-lawyer', name: 'Ms. Han', role: "Supplier's lawyer",
        line: "There's no real line between this company and your own wallet — so your client pays personally." },
      { id: 'judge', name: 'Presiding Judge', role: 'Judge',
        line: 'The company has one shareholder. Can you show the court its property is independent from yours?' },
      { id: 'your-accountant', name: 'Lao Chen', role: 'Your bookkeeper',
        line: 'Depends what we can pull together. What do you actually want me to hand over?' }
    ],

    setup: {
      id: 'setup-money-habits',
      question: "Before the lawsuit — how have you been running the company's money?",
      context:
        "This choice is the real lesson. It quietly decides what evidence you'll have when it matters.",
      branches: [
        {
          id: 'setup-separate',
          label: 'Kept it clean: company account only, annual audit that traces the cash flow',
          /* CHANGED FROM SOURCE: ev-basic-books added.
             The source granted only the two strong items here, which left the
             clean-books player looking at branch B locked with the hint "you
             don't have even basic books to submit" — false, and it undercuts
             the lesson. An operation with separate accounts and a fund-flow
             audit self-evidently has a P&L too. With this, the careful player
             can reach every branch and has to *choose* the strong evidence,
             which is the better teaching moment. Revert this line to restore
             the original gating. */
          setsEvidence: ['ev-separate-accounts', 'ev-audit-fundflow', 'ev-basic-books']
        },
        {
          id: 'setup-mixed',
          label: 'Kept it loose: sometimes took supplier payments into my personal account, no real audit',
          setsEvidence: ['ev-basic-books', 'ev-mixed-payments']
        }
      ]
    },

    availableEvidence: [
      { id: 'ev-separate-accounts', label: 'Separate company/personal bank statements, no crossover' },
      { id: 'ev-audit-fundflow', label: 'Annual audit report that shows where the money actually moved' },
      { id: 'ev-basic-books', label: 'Basic books showing profit and loss only' },
      { id: 'ev-mixed-payments', label: 'Records of company payments received into your personal account', redFlag: true }
    ],

    riskInsight:
      "The burden is reversed. You don't get to sit back and make the supplier prove the mixing — the court presumes it unless YOU prove separation. Silence loses.",

    decision: {
      id: 'decision-respond-to-suit',
      question: 'The judge asks for your evidence. How do you respond?',
      context:
        "You can only present what you actually kept. Notice which options are locked — that's your past bookkeeping talking.",
      branches: [
        {
          id: 'branch-a',
          label: 'A. Prove independence: submit separated accounts + the fund-flow audit',
          requiresEvidence: ['ev-separate-accounts', 'ev-audit-fundflow'],
          disabledHint:
            "Locked — you never kept separate accounts or a fund-flow audit, so there's nothing to prove independence with.",
          leadsTo: 'outcome-a-good'
        },
        {
          id: 'branch-b',
          label: 'B. Submit the profit-and-loss audit you do have',
          requiresEvidence: ['ev-basic-books'],
          disabledHint: "Locked — you don't have even basic books to submit.",
          leadsTo: 'outcome-b-risky'
        },
        {
          id: 'branch-c',
          label: "C. Argue it's not your problem — the debt is the company's, not yours",
          leadsTo: 'outcome-c-bad'
        }
      ]
    },

    outcomes: [
      {
        id: 'outcome-a-good',
        tone: 'good',
        result: 'Limited liability holds. The court accepts that company and personal property are independent.',
        explanation:
          "Because you could show separate accounts and an audit tracing the actual movement of money, you met the burden the law puts on a sole shareholder. The company pays its own debt; your personal assets stay out of it. This is what 'limited liability' is supposed to protect — but only when you can prove separation.",
        legalBasis: PRC_COMPANY_LAW_23_3,
        skillGain: ['evidenceAwareness', 'riskControl'],
        hook: "A clean win still deserves a periodic structural check — rules and evidence standards shift. Worth a lawyer's once-over."
      },
      {
        id: 'outcome-b-risky',
        tone: 'risky',
        result: "Not enough. A profit-and-loss report doesn't show where the money went — you're at real risk of personal liability.",
        explanation:
          "A basic audit that only reflects profit and loss doesn't trace fund flows between you and the company, so it doesn't discharge your burden to prove separation. Courts have found exactly this kind of report insufficient. The right evidence is about the movement of money, not the bottom line.",
        legalBasis: PRC_COMPANY_LAW_23_3,
        skillGain: ['legalJudgment', 'evidenceAwareness'],
        hook: "Proving separation is technical — what actually holds up in court isn't obvious. A lawyer can tell you what evidence you'd need."
      },
      {
        id: 'outcome-c-bad',
        tone: 'bad',
        result: "Personal liability. With nothing to prove separation, the presumption stands and you're on the hook for the company's debt.",
        explanation:
          "Here's why so many founders get caught by this: for a one-person company the law assumes commingling unless you disprove it. Saying 'it's the company's debt, not mine' isn't a defense when you can't show the two were ever kept apart. The good news is it's avoidable — it's decided long before the lawsuit, by how you run the money.",
        legalBasis: PRC_COMPANY_LAW_23_3,
        skillGain: ['riskControl'],
        hook: "This outcome is preventable with the right setup from day one. Worth having a lawyer review your structure before it's ever tested."
      }
    ],

    unlocksLevelId: 'lvl-02-tbd'
  };
});
