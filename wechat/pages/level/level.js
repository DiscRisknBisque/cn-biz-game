/*
 * level.js — the level runner.
 *
 * Holds no logic of its own: every transition goes through the shared engine,
 * and this file only maps engine state onto `data` for the template. That
 * split is what lets the same flow be exercised in a browser harness, since
 * there is no way to run WeChat DevTools headlessly.
 */
var E = require('../../shared/level-engine.js');
var REGISTRY = require('../../shared/levels/index.js');

var app = getApp();

Page({
  data: {
    level: null,
    phase: 'scenario',
    phaseIndex: 0,
    phaseCount: 6,

    heldEvidence: [],
    branches: [],
    outcome: null,

    /* Legal content that has not been through a licensed PRC lawyer says so,
       on every screen, and the player cannot dismiss it. */
    reviewPending: [],

    /* Set when the player taps a locked branch — the hint is the teaching
       moment, so it is shown rather than swallowed. */
    lockedNotice: ''
  },

  onLoad: function (query) {
    var level = (query && query.id && REGISTRY.byId(query.id)) || REGISTRY.first;
    this.level = level;
    this.state = E.begin(level);

    this.setData({
      level: level,
      reviewPending: E.pendingReview(level)
    });
    this.sync();
  },

  /* Push engine state into the template. Called after every transition. */
  sync: function () {
    var level = this.level;
    var state = this.state;

    this.setData({
      phase: state.phase,
      phaseIndex: E.PHASES.indexOf(state.phase),
      phaseCount: E.PHASES.length,
      heldEvidence: E.heldEvidence(level, state),
      branches: state.phase === 'decision' ? E.decisionBranches(level, state) : [],
      outcome: E.outcome(level, state)
    });
  },

  /* --------------------------------------------------------- navigation */

  onNext: function () {
    E.advance(this.level, this.state);
    this.setData({ lockedNotice: '' });
    this.sync();
  },

  onBack: function () {
    E.back(this.level, this.state);
    this.setData({ lockedNotice: '' });
    this.sync();
  },

  /* ------------------------------------------------------------ choices */

  onChooseSetup: function (e) {
    E.chooseSetup(this.level, this.state, e.currentTarget.dataset.id);
    this.sync();
  },

  onChooseDecision: function (e) {
    var id = e.currentTarget.dataset.id;
    var row = this.data.branches.filter(function (b) { return b.id === id; })[0];

    if (!row || row.locked) {
      /* Not an error state — this is the point of the level. */
      this.setData({ lockedNotice: row ? row.hint : '' });
      return;
    }

    E.chooseDecision(this.level, this.state, id);
    this.setData({ lockedNotice: '' });
    this.sync();

    var outcome = E.outcome(this.level, this.state);
    if (outcome) app.recordOutcome(this.level.id, outcome.id);
  },

  /* ------------------------------------------------------------- replay */

  onReplay: function () {
    this.state = E.begin(this.level);
    this.setData({ lockedNotice: '' });
    this.sync();
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  onNextLevel: function () {
    var nextId = this.level.unlocksLevelId;
    if (!nextId || !REGISTRY.byId(nextId)) {
      wx.showToast({ title: 'Next level coming soon', icon: 'none' });
      return;
    }
    wx.redirectTo({ url: '/pages/level/level?id=' + nextId });
  }
});
