/*
 * balance.js — the numbers, kept apart from the rendering so they can be
 * simulated headlessly (see tools/simulate.js).
 *
 * The authored fx values in content.js are relative signals: "this hurts
 * compliance a lot, that costs a bit of cash". They are deliberately generous,
 * because writing scenes is easier when you do not have to hold a spreadsheet
 * in your head. SCALE turns them into something a 0-100 bar can survive across
 * 28 scenes, and settle() is the between-chapters breather that keeps a
 * careful player from ending the game broke and exhausted.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Balance = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var START  = { cash: 120, comp: 50, rep: 50, energy: 100 };
  var LIMITS = { cash: [0, 200], comp: [0, 100], rep: [0, 100], energy: [0, 100] };

  /* Per-stat damping. Compliance swings hardest in the raw content, so it is
     damped most; cash is left closest to what the scenes say it costs. */
  var SCALE = { cash: 0.55, comp: 0.32, rep: 0.42, energy: 0.55 };

  /* Settlement knobs, all per chapter. */
  var REST      = 8;     // energy back from simply having got through a quarter
  var REVENUE   = [4, 10]; // flat, plus this much scaled by how well you played
  var FINE_FROM = 42;    // compliance below this and the regulator sends a bill
  var FINE_RATE = 0.7;   // cash per point of compliance below the threshold
  var STRESS_RATE = 0.35; // ...and energy, because you spend the quarter firefighting

  function clamp(key, v) {
    var l = LIMITS[key];
    return Math.max(l[0], Math.min(l[1], Math.round(v)));
  }

  /* Apply one choice's effects. Returns the deltas actually applied, so the
     feedback screen can report the same numbers the player's bars moved by. */
  function applyFx(stats, fx) {
    var applied = {};
    if (!fx) return applied;
    Object.keys(SCALE).forEach(function (k) {
      if (!fx[k]) return;
      var d = Math.round(fx[k] * SCALE[k]);
      if (d === 0) d = fx[k] > 0 ? 1 : -1;   // never silently swallow an effect
      var before = stats[k];
      stats[k] = clamp(k, stats[k] + d);
      applied[k] = stats[k] - before;
    });
    return applied;
  }

  /* End-of-chapter settlement: you rest, the company books some revenue, and
     if your compliance is poor the authorities take an interest — which costs
     you cash and, because you spend the next quarter firefighting, energy.
     Doing things properly is tiring; doing them badly is more tiring. */
  function settle(stats, points, max) {
    var quality = max > 0 ? points / max : 0;
    var shortfall = Math.max(0, FINE_FROM - stats.comp);
    var out = {
      revenue: Math.round(REVENUE[0] + REVENUE[1] * quality),
      fine: Math.round(shortfall * FINE_RATE),
      rest: REST,
      stress: Math.round(shortfall * STRESS_RATE)
    };

    var cash0 = stats.cash;
    stats.cash = clamp('cash', stats.cash + out.revenue - out.fine);
    out.cash = stats.cash - cash0;

    var en0 = stats.energy;
    stats.energy = clamp('energy', stats.energy + out.rest - out.stress);
    out.energy = stats.energy - en0;

    return out;
  }

  /* Answer quality is three-quarters of the grade; the bars carry the rest, so
     a player who answered well but bled compliance early still feels it. */
  function score(stats, points, maxPoints) {
    var base = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
    return Math.round(base * 0.75 + stats.comp * 0.15 + stats.rep * 0.10);
  }

  return {
    START: START,
    LIMITS: LIMITS,
    SCALE: SCALE,
    clamp: clamp,
    applyFx: applyFx,
    settle: settle,
    score: score
  };
});
