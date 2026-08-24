/*
 * level-engine.js — the single-round loop, as pure logic.
 *
 * Deliberately knows nothing about WeChat or the DOM: no `wx.*`, no `document`.
 * That is what lets the same engine drive the mini-program, the browser harness
 * in tools/, and the headless validator — and it is the only reason the flow
 * could be tested at all in an environment with no WeChat DevTools.
 *
 * The loop, in order:
 *
 *   scenario → characters → setup → evidence → risk → decision → outcome
 *
 * `setup` is the mechanism the whole level rests on. It runs BEFORE the
 * lawsuit and seeds `evidenceState`; by the time the player reaches `decision`,
 * some branches are already locked because of a bookkeeping choice they made
 * without knowing it mattered. The lock is the lesson.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LevelEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PHASES = ['scenario', 'setup', 'evidence', 'risk', 'decision', 'outcome'];

  function indexById(list) {
    var out = {};
    (list || []).forEach(function (item) { out[item.id] = item; });
    return out;
  }

  /* ------------------------------------------------------------------ run */

  function begin(level) {
    return {
      levelId: level.id,
      phase: 'scenario',
      evidenceState: [],       // evidence ids the player actually holds
      setupBranchId: null,
      decisionBranchId: null,
      outcomeId: null
    };
  }

  function phaseIndex(state) { return PHASES.indexOf(state.phase); }

  /* Move to the next phase that does not need a choice. Choices are made with
     chooseSetup / chooseDecision, so advance() refuses to skip past them. */
  function advance(level, state) {
    if (state.phase === 'setup' && !state.setupBranchId) return state;
    if (state.phase === 'decision' && !state.decisionBranchId) return state;
    var i = phaseIndex(state);
    if (i < 0 || i >= PHASES.length - 1) return state;
    state.phase = PHASES[i + 1];
    return state;
  }

  function back(level, state) {
    var i = phaseIndex(state);
    if (i <= 0) return state;
    /* Stepping back before a choice clears it, so the player cannot carry a
       decision made under different evidence forward. */
    if (state.phase === 'outcome') { state.decisionBranchId = null; state.outcomeId = null; }
    if (state.phase === 'evidence') { state.setupBranchId = null; state.evidenceState = []; }
    state.phase = PHASES[i - 1];
    return state;
  }

  /* ---------------------------------------------------------------- setup */

  function chooseSetup(level, state, branchId) {
    var branch = indexById(level.setup.branches)[branchId];
    if (!branch) return state;
    state.setupBranchId = branchId;
    state.evidenceState = (branch.setsEvidence || []).slice();
    state.phase = 'evidence';
    return state;
  }

  /* The evidence the player is holding, resolved to full records so the UI can
     show labels and flag the ones that work against them. */
  function heldEvidence(level, state) {
    var byId = indexById(level.availableEvidence);
    return state.evidenceState
      .map(function (id) { return byId[id]; })
      .filter(Boolean);
  }

  /* ------------------------------------------------------------- decision */

  function hasAll(state, ids) {
    return (ids || []).every(function (id) { return state.evidenceState.indexOf(id) >= 0; });
  }

  /* Every branch, with whether it is open and why not. The UI renders locked
     branches rather than hiding them — seeing the door you cannot open is the
     point. */
  function decisionBranches(level, state) {
    return level.decision.branches.map(function (b) {
      var locked = !hasAll(state, b.requiresEvidence);
      return {
        id: b.id,
        label: b.label,
        locked: locked,
        hint: locked ? (b.disabledHint || 'Locked — you do not have the evidence for this.') : null,
        missing: locked
          ? (b.requiresEvidence || []).filter(function (id) { return state.evidenceState.indexOf(id) < 0; })
          : []
      };
    });
  }

  function chooseDecision(level, state, branchId) {
    var branch = indexById(level.decision.branches)[branchId];
    if (!branch) return state;
    if (!hasAll(state, branch.requiresEvidence)) return state;   // locked, ignore
    state.decisionBranchId = branchId;
    state.outcomeId = branch.leadsTo;
    state.phase = 'outcome';
    return state;
  }

  function outcome(level, state) {
    if (!state.outcomeId) return null;
    return indexById(level.outcomes)[state.outcomeId] || null;
  }

  /* ---------------------------------------------------------- review gate */

  /* Legal content that has not been through a licensed PRC lawyer must say so
     on screen. This returns the citations still waiting, so the UI can show a
     banner that cannot be dismissed rather than trusting anyone to remember. */
  function pendingReview(level) {
    var out = [];
    (level.outcomes || []).forEach(function (o) {
      var lb = o.legalBasis;
      if (!lb) return;
      if (/^pending/i.test(String(lb.reviewedBy || ''))) {
        if (out.indexOf(lb.citation) < 0) out.push(lb.citation);
      }
    });
    return out;
  }

  function needsLegalReview(level) { return pendingReview(level).length > 0; }

  /* --------------------------------------------------------------- static */

  /* Which decision branches a given setup choice can reach. Used by the
     validator, and by the debug view in the harness. */
  function reachableFrom(level, setupBranchId) {
    var s = begin(level);
    chooseSetup(level, s, setupBranchId);
    return decisionBranches(level, s)
      .filter(function (b) { return !b.locked; })
      .map(function (b) { return b.id; });
  }

  return {
    PHASES: PHASES,
    begin: begin,
    advance: advance,
    back: back,
    chooseSetup: chooseSetup,
    heldEvidence: heldEvidence,
    decisionBranches: decisionBranches,
    chooseDecision: chooseDecision,
    outcome: outcome,
    pendingReview: pendingReview,
    needsLegalReview: needsLegalReview,
    reachableFrom: reachableFrom
  };
});
