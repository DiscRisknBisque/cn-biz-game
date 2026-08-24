/*
 * app.js — mini-program entry.
 *
 * Progress is kept in storage rather than on a server: there is no backend in
 * this project, and a level's completion state is not worth an account.
 */
App({
  globalData: {
    /** level id -> outcome id the player reached */
    completed: {}
  },

  onLaunch: function () {
    try {
      this.globalData.completed = wx.getStorageSync('completed') || {};
    } catch (e) {
      this.globalData.completed = {};
    }
  },

  recordOutcome: function (levelId, outcomeId) {
    this.globalData.completed[levelId] = outcomeId;
    try { wx.setStorageSync('completed', this.globalData.completed); } catch (e) { /* storage full or denied */ }
  }
});
