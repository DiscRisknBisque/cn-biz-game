/*
 * levels/index.js — the level registry, in play order.
 *
 * Adding a level means adding one require here. `unlocksLevelId` may point at
 * a level that does not exist yet (lvl-02-tbd does); the validator reports
 * that as pending rather than as an error.
 */
(function (root, factory) {
  var api = factory(
    typeof module === 'object' && module.exports
      ? require('./level-01.js')
      : root.Levels['lvl-01-wfoe-commingling']
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LevelRegistry = api;
})(typeof self !== 'undefined' ? self : this, function (level01) {
  'use strict';

  var ALL = [level01].sort(function (a, b) { return a.order - b.order; });

  function byId(id) {
    for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i];
    return null;
  }

  return { ALL: ALL, byId: byId, first: ALL[0] };
})
