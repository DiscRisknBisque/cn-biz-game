/**
 * Level data contract.
 *
 * Corrected from the supplied source in one place: `Branch.leadsTo` is now
 * optional. Setup branches legitimately have no destination — they seed
 * evidence and hand control back to the loop — but the original declared
 * `leadsTo: string` as required, so the file did not compile:
 *
 *   error TS2741: Property 'leadsTo' is missing in type
 *   '{ id: string; label: string; setsEvidence: string[]; }'
 *   but required in type 'Branch'.
 *
 * Splitting the two kinds of branch into their own types would be stricter
 * still, and is worth doing once a second level shows whether setup branches
 * ever need anything decision branches do not.
 */

export type Skill = "legalJudgment" | "evidenceAwareness" | "riskControl" | "negotiation";
export type OutcomeTone = "good" | "risky" | "bad";

export interface LegalBasis {
  /** 法域 */
  jurisdiction: string;
  /** 法律依据 */
  citation: string;
  /** 生效日期 (ISO) */
  effectiveDate: string;
  /** 例外情形 */
  exceptions?: string;
  /** 律师审核 — "pending…" until a licensed PRC lawyer signs off. The engine
   *  matches /^pending/i and forces an on-screen banner while it does. */
  reviewedBy: string;
  /** 更新记录 (ISO) */
  lastUpdated: string;
  /** where to confirm the latest */
  verifyWith: string;
}

export interface Evidence {
  id: string;
  /** what shows up in the 搜集证据 step */
  label: string;
  /** true = this piece HURTS the player (e.g. personal a/c used for company) */
  redFlag?: boolean;
}

export interface Outcome {
  id: string;
  /** good | risky | bad → green / amber / red */
  tone: OutcomeTone;
  /** 查看结果 (player-facing headline) */
  result: string;
  /** 获得法律解释 (plain, calm, player-facing) */
  explanation: string;
  /** 内容可信度 */
  legalBasis: LegalBasis;
  /** 玩家成长 */
  skillGain: Skill[];
  /** calm referral line — never fear */
  hook: string;
}

export interface Branch {
  id: string;
  /** player-facing choice */
  label: string;
  /** (setup only) evidence ids this choice grants */
  setsEvidence?: string[];
  /** (decision only) evidence ids needed, else locked */
  requiresEvidence?: string[];
  /** shown when locked */
  disabledHint?: string;
  /** outcome id — decision branches only; setup branches omit it */
  leadsTo?: string;
}

export interface DecisionNode {
  id: string;
  question: string;
  /** 判断法律风险 framing lives here for the decision node */
  context?: string;
  branches: Branch[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  /** opening dialogue */
  line?: string;
}

export interface Level {
  id: string;
  order: number;
  theme: "company-law-fdi";
  title: string;
  audience: string;
  /** 接收任务 + 了解人物与冲突 */
  scenario: string;
  characters: Character[];
  /** pre-choice that seeds evidenceState */
  setup: DecisionNode;
  /** 搜集事实与证据 (full catalogue; state is seeded by setup) */
  availableEvidence: Evidence[];
  /** 判断法律风险 — the one thing the player must realize */
  riskInsight: string;
  /** 选择行动 */
  decision: DecisionNode;
  /** 查看结果 + 法律解释 */
  outcomes: Outcome[];
  /** 解锁下一关 */
  unlocksLevelId: string | null;
}
