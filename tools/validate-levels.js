#!/usr/bin/env node
/*
 * tools/validate-levels.js — structural checks on the mini-program level data.
 *
 *   node tools/validate-levels.js
 *
 * Hand-written level data fails in ways that are invisible on the page: a
 * branch whose evidence no setup path can ever grant, an outcome nothing leads
 * to, a locked-branch hint that contradicts what the player is actually
 * holding. This walks every setup path and reports what a real player would
 * see, so those show up before a tester does.
 *
 * Exits non-zero on errors. Warnings (a pending lawyer review, an unlockable
 * next level) are reported but do not fail the build — they are states the
 * project is legitimately in.
 */
'use strict';

var path = require('path');
var E = require(path.join(__dirname, '..', 'wechat', 'shared', 'level-engine.js'));
var REGISTRY = require(path.join(__dirname, '..', 'wechat', 'shared', 'levels', 'index.js'));

var errors = [];
var warnings = [];

function err(where, msg) { errors.push(where + ': ' + msg); }
function warn(where, msg) { warnings.push(where + ': ' + msg); }

var TONES = ['good', 'risky', 'bad'];
var SKILLS = ['legalJudgment', 'evidenceAwareness', 'riskControl', 'negotiation'];

function isIsoDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }

function checkLevel(level) {
  var at = level.id;

  ['id', 'title', 'audience', 'scenario', 'riskInsight'].forEach(function (k) {
    if (!level[k] || !String(level[k]).trim()) err(at, 'missing ' + k);
  });
  if (typeof level.order !== 'number') err(at, 'order must be a number');
  if (!Array.isArray(level.characters) || !level.characters.length) err(at, 'needs at least one character');

  /* --- ids are unique within their own namespace ---------------------- */

  var evIds = {};
  (level.availableEvidence || []).forEach(function (e) {
    if (!e.id || !e.label) err(at, 'evidence needs an id and a label');
    if (evIds[e.id]) err(at, 'duplicate evidence id "' + e.id + '"');
    evIds[e.id] = e;
  });

  var outIds = {};
  (level.outcomes || []).forEach(function (o) {
    if (outIds[o.id]) err(at, 'duplicate outcome id "' + o.id + '"');
    outIds[o.id] = o;
    if (TONES.indexOf(o.tone) < 0) err(at + '/' + o.id, 'tone must be one of ' + TONES.join(', '));
    ['result', 'explanation', 'hook'].forEach(function (k) {
      if (!o[k] || !String(o[k]).trim()) err(at + '/' + o.id, 'missing ' + k);
    });
    (o.skillGain || []).forEach(function (s) {
      if (SKILLS.indexOf(s) < 0) err(at + '/' + o.id, 'unknown skill "' + s + '"');
    });
    if (!o.skillGain || !o.skillGain.length) err(at + '/' + o.id, 'no skillGain — the player learns nothing');

    var lb = o.legalBasis;
    if (!lb) { err(at + '/' + o.id, 'no legalBasis'); return; }
    ['jurisdiction', 'citation', 'reviewedBy', 'verifyWith'].forEach(function (k) {
      if (!lb[k] || !String(lb[k]).trim()) err(at + '/' + o.id, 'legalBasis missing ' + k);
    });
    if (!isIsoDate(lb.effectiveDate)) err(at + '/' + o.id, 'legalBasis.effectiveDate must be YYYY-MM-DD');
    if (!isIsoDate(lb.lastUpdated)) err(at + '/' + o.id, 'legalBasis.lastUpdated must be YYYY-MM-DD');
  });

  /* --- setup branches -------------------------------------------------- */

  var setupBranches = (level.setup && level.setup.branches) || [];
  if (setupBranches.length < 2) err(at, 'setup needs at least two branches, or it is not a choice');

  setupBranches.forEach(function (b) {
    var w = at + '/setup/' + b.id;
    if (!b.label) err(w, 'missing label');
    if (b.leadsTo) err(w, 'setup branches must not have leadsTo — they seed evidence, they do not resolve');
    if (!b.setsEvidence || !b.setsEvidence.length) err(w, 'grants no evidence, so the choice changes nothing');
    (b.setsEvidence || []).forEach(function (id) {
      if (!evIds[id]) err(w, 'grants unknown evidence "' + id + '"');
    });
  });

  /* --- decision branches ----------------------------------------------- */

  var decisionBranches = (level.decision && level.decision.branches) || [];
  if (!decisionBranches.length) err(at, 'decision has no branches');

  decisionBranches.forEach(function (b) {
    var w = at + '/decision/' + b.id;
    if (!b.label) err(w, 'missing label');
    if (!b.leadsTo) err(w, 'decision branches need leadsTo');
    else if (!outIds[b.leadsTo]) err(w, 'leadsTo "' + b.leadsTo + '" is not an outcome');
    (b.requiresEvidence || []).forEach(function (id) {
      if (!evIds[id]) err(w, 'requires unknown evidence "' + id + '"');
    });
    if (b.requiresEvidence && b.requiresEvidence.length && !b.disabledHint) {
      err(w, 'can be locked but has no disabledHint — the player would see a dead button with no reason');
    }
    if ((!b.requiresEvidence || !b.requiresEvidence.length) && b.disabledHint) {
      warn(w, 'has a disabledHint but can never lock');
    }
  });

  /* --- every outcome is reachable -------------------------------------- */

  var reached = {};
  decisionBranches.forEach(function (b) { if (b.leadsTo) reached[b.leadsTo] = true; });
  Object.keys(outIds).forEach(function (id) {
    if (!reached[id]) err(at + '/' + id, 'outcome is unreachable — no branch leads to it');
  });

  /* --- walk every setup path, the way a player would ------------------- */

  var openedBySomePath = {};
  var pathReport = [];

  setupBranches.forEach(function (sb) {
    var state = E.begin(level);
    E.chooseSetup(level, state, sb.id);
    var rows = E.decisionBranches(level, state);
    var open = rows.filter(function (r) { return !r.locked; });

    open.forEach(function (r) { openedBySomePath[r.id] = true; });
    pathReport.push({
      setup: sb.id,
      holds: state.evidenceState.slice(),
      open: open.map(function (r) { return r.id; }),
      /* The hint is printed next to what the player is actually holding: a
         structural check cannot tell you the wording is wrong, but a reviewer
         reading these two lines together can. */
      locked: rows.filter(function (r) { return r.locked; })
                  .map(function (r) { return { id: r.id, hint: r.hint, missing: r.missing }; })
    });

    if (!open.length) {
      err(at + '/setup/' + sb.id, 'leaves every decision branch locked — the player would be stuck');
    }

    /* A hint that claims the player lacks something they are in fact holding
       reads as a bug to the player, because it is one. */
    rows.filter(function (r) { return r.locked; }).forEach(function (r) {
      var held = state.evidenceState;
      var branch = decisionBranches.filter(function (b) { return b.id === r.id; })[0];
      var wronglyClaimed = (branch.requiresEvidence || []).filter(function (id) { return held.indexOf(id) >= 0; });
      if (wronglyClaimed.length === (branch.requiresEvidence || []).length) {
        err(at + '/setup/' + sb.id + ' → ' + r.id, 'reported locked while holding everything it requires');
      }
    });
  });

  decisionBranches.forEach(function (b) {
    if (!openedBySomePath[b.id]) {
      err(at + '/decision/' + b.id, 'no setup path can ever unlock this branch — it is dead content');
    }
  });

  /* --- red flags ------------------------------------------------------- */

  var anyRedFlag = (level.availableEvidence || []).some(function (e) { return e.redFlag; });
  if (!anyRedFlag) warn(at, 'no evidence is marked redFlag — nothing works against the player');

  /* --- pending review and next level ----------------------------------- */

  var pending = E.pendingReview(level);
  pending.forEach(function (c) {
    warn(at, 'legal review pending for: ' + c.slice(0, 72) + (c.length > 72 ? '…' : ''));
  });

  if (level.unlocksLevelId && !REGISTRY.byId(level.unlocksLevelId)) {
    warn(at, 'unlocks "' + level.unlocksLevelId + '", which does not exist yet');
  }

  return pathReport;
}

/* ------------------------------------------------------------------ run */

console.log('Validating ' + REGISTRY.ALL.length + ' level(s)\n');

REGISTRY.ALL.forEach(function (level) {
  var report = checkLevel(level);
  console.log(level.id + '  "' + level.title + '"');
  report.forEach(function (r) {
    console.log('  ' + r.setup);
    console.log('    holds  ' + r.holds.join(', '));
    console.log('    opens  ' + (r.open.join(', ') || '(nothing)'));
    r.locked.forEach(function (l) {
      console.log('    locked ' + l.id + '  (missing: ' + l.missing.join(', ') + ')');
      console.log('           hint: "' + l.hint + '"');
    });
  });
  console.log('');
});

if (warnings.length) {
  console.log('WARNINGS (' + warnings.length + ')');
  warnings.forEach(function (w) { console.log('  - ' + w); });
  console.log('');
}

if (errors.length) {
  console.log('ERRORS (' + errors.length + ')');
  errors.forEach(function (e) { console.log('  - ' + e); });
  process.exit(1);
}

console.log('No errors.');
