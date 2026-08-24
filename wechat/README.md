# Know Before You Owe — WeChat build

Level 1: **Whose money is it?** — a WFOE owner finds out that for a
one-person company, proving the money was kept separate is *their* job.

## 小程序, not 小游戏

The brief said mini-game. This is built as a **mini-program** (小程序), and
that is a deliberate change worth flagging.

A 小游戏 is a canvas runtime: there is no DOM, so every paragraph of the
scenario, every legal citation, every choice label would have to be laid out
and line-broken by hand. This level is entirely long-form text and buttons —
exactly what WXML renders natively, with reflow, system font scaling and
accessibility for free.

If it has to be a 小游戏 (for the 小游戏 discovery surfaces, say), the split is
already in place to make that a UI-only change: `shared/level-engine.js` has no
platform calls in it, so a canvas front end would sit on the same engine and
the same data. Say the word.

## Running it

1. Open WeChat DevTools → Import project → choose this `wechat/` directory.
2. Put a real AppID in `project.config.json` (it ships as
   `REPLACE_WITH_YOUR_APPID`), or use a test AppID.
3. The level opens on launch. `pages/level/level?id=<levelId>` opens a specific
   one once there is more than one.

## What has and has not been tested

Honestly, because it matters here:

| | |
|---|---|
| ✅ The flow, gating, evidence seeding, outcome routing | `npm run level:test` — driven in a real browser against `tools/level-harness.html`, which renders the same phases from the same engine and the same data |
| ✅ The level data's structure | `npm run level:check` — walks every setup path and reports what a player would see |
| ❌ WXML/WXSS rendering, `wx.*` calls, real-device layout | **Not verified.** There is no headless WeChat DevTools, so nobody has run the actual mini-program yet. It needs one pass in DevTools before it is trusted. |

`tools/level-harness.html` is a faithful port of `pages/level/level.wxss` at
750rpx = 375px. It is a preview, not the real renderer — if the two drift apart
it stops being useful, so change them together.

## The review gate

Every `legalBasis.reviewedBy` in level 1 reads `pending`. The engine detects
that (`LevelEngine.pendingReview`) and the level screen shows a banner the
player cannot dismiss.

**A licensed PRC lawyer must review this before it ships.** Law and thresholds
move; `verifyWith` stays on screen in the legal-basis panel for that reason.
Once reviewed, replace the `reviewedBy` string and the banner disappears on its
own — nothing else to remember.

## Two changes from the supplied data

Both are flagged in the files themselves.

**1. `Branch.leadsTo` is now optional** (`types/levels.d.ts`). It was declared
required while setup branches legitimately omit it, so the source did not
compile:

```
error TS2741: Property 'leadsTo' is missing in type
'{ id: string; label: string; setsEvidence: string[]; }'
but required in type 'Branch'.
```

**2. `setup-separate` also grants `ev-basic-books`** (`shared/levels/level-01.js`).

As supplied, the careful player — separate accounts, full fund-flow audit — was
shown branch B locked with the hint *"you don't have even basic books to
submit."* That is false, and it undercuts the lesson: an operation clean enough
to have a fund-flow audit self-evidently has a P&L. With the fix, the careful
player can reach every branch and has to **choose** the strong evidence, which
is the better teaching moment. Revert that one line to restore the original
gating.

## Adding level 2

1. Copy `shared/levels/level-01.js`, give it a new id and `order`.
2. Add one `require` to `shared/levels/index.js`.
3. Point level 1's `unlocksLevelId` at it.
4. `npm run level:check` — it will tell you if a branch is unreachable, an
   outcome is orphaned, a locked branch has no hint, or a setup path leaves the
   player with nothing to pick.

Nothing in the page or the engine needs touching.

## Out of scope

**No tax.** Nothing here computes, displays or estimates tax, and the flow test
asserts the word does not appear anywhere in the level. Tax questions go to an
accountant.
