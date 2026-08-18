/*
 * auth.js — account state, validation and the sign-in flow.
 *
 * ============================ READ THIS FIRST ============================
 * This is a FRONT-END FLOW, NOT AUTHENTICATION. There is no server here.
 *
 *   - Verification codes are generated in the browser and shown on screen.
 *     Anyone can read them. They prove nothing.
 *   - "WeChat login" is a stub. A real one needs an app registered on the
 *     WeChat Open Platform, and the code -> access_token exchange MUST happen
 *     on your server: AppSecret can never ship to a browser.
 *   - Everything is kept in localStorage, which the user fully controls.
 *
 * The point of this module is to be the single seam a real backend replaces.
 * Swap the four functions marked BACKEND for calls to your API and the rest of
 * the game does not change.
 *
 * ---------------------------------------------------------------------------
 * On the data itself: this game teaches PIPL, so the sign-up cannot be a
 * counter-example. Name, phone, email, gender, age and nationality are all
 * personal information under art. 4. Holding them means you need a lawful
 * basis (art. 13), a privacy policy that is actually true (art. 17), data
 * minimisation (art. 6), a working deletion path (art. 47), and separate
 * guardian consent for anyone under 14 (art. 31). The flow below implements
 * the client half of each of those; the server half is on you.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Auth = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KEY = 'cnbizgame.account.v1';
  var CODE_TTL_MS = 5 * 60 * 1000;
  var MINOR_AGE = 14;          // PIPL art. 31 threshold

  /* --------------------------------------------------------------- storage */

  var account = null;          // null when signed out

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      account = raw ? JSON.parse(raw) : null;
    } catch (e) { account = null; }
    return account;
  }

  function persist() {
    try {
      if (account) localStorage.setItem(KEY, JSON.stringify(account));
      else localStorage.removeItem(KEY);
    } catch (e) { /* private mode — the session simply will not survive */ }
  }

  function current() { return account; }
  function isSignedIn() { return !!(account && account.profile && account.profile.name); }

  /* ------------------------------------------------------------ validation */

  /* Mainland numbers are 11 digits starting 1[3-9]; the game also has foreign
     players, so an international form with a country code is accepted too. */
  var RE_CN_MOBILE = /^1[3-9]\d{9}$/;
  var RE_INTL = /^\+\d{1,3}\d{4,14}$/;
  /* Deliberately permissive: rejecting unusual but valid addresses annoys real
     users far more than accepting a typo, which the code step catches anyway. */
  var RE_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

  function normalisePhone(v) { return String(v || '').replace(/[\s()-]/g, ''); }

  function validate(field, value) {
    var v = String(value == null ? '' : value).trim();
    switch (field) {
      case 'phone':
        var p = normalisePhone(v);
        if (!p) return 'required';
        return (RE_CN_MOBILE.test(p) || RE_INTL.test(p)) ? null : 'phone';
      case 'email':
        if (!v) return 'required';
        return RE_EMAIL.test(v) && v.length <= 254 ? null : 'email';
      case 'code':
        return /^\d{6}$/.test(v) ? null : 'code';
      case 'name':
        if (!v) return 'required';
        return v.length <= 40 ? null : 'name';
      case 'age':
        if (!v) return 'required';
        if (!/^\d{1,3}$/.test(v)) return 'age';
        var n = parseInt(v, 10);
        return (n >= 1 && n <= 120) ? null : 'age';
      case 'gender':
      case 'nationality':
        return v ? null : 'required';
      default:
        return null;
    }
  }

  function isMinor(age) {
    var n = parseInt(age, 10);
    return !isNaN(n) && n < MINOR_AGE;
  }

  /* Shown back to the user instead of the raw value, and the only form that
     should ever be logged. A real backend should store the raw identifier
     server-side and hand the client this. */
  function mask(method, id) {
    var v = String(id || '');
    if (method === 'phone') {
      var p = normalisePhone(v);
      return p.length <= 4 ? p : p.slice(0, p.length - 8 > 0 ? 3 : 1) + '****' + p.slice(-4);
    }
    if (method === 'email') {
      var at = v.indexOf('@');
      if (at < 1) return v;
      var user = v.slice(0, at);
      var head = user.slice(0, Math.min(2, user.length));
      return head + '***' + v.slice(at);
    }
    return v;
  }

  /* ------------------------------------------------------- codes (BACKEND) */

  var pending = null;   // { method, identifier, code, expires }

  /* BACKEND #1 — replace with POST /auth/send-code.
     Returns the code only because there is no SMS or mail service here; a real
     implementation must never return it to the client. */
  function sendCode(method, identifier) {
    var err = validate(method, identifier);
    if (err) return { ok: false, error: err };

    var code = String(Math.floor(100000 + Math.random() * 900000));
    pending = {
      method: method,
      identifier: method === 'phone' ? normalisePhone(identifier) : String(identifier).trim(),
      code: code,
      expires: Date.now() + CODE_TTL_MS
    };
    return { ok: true, demoCode: code, expiresIn: CODE_TTL_MS };
  }

  /* BACKEND #2 — replace with POST /auth/verify, which should return a session
     token rather than a boolean. */
  function verifyCode(input) {
    if (!pending) return { ok: false, error: 'nocode' };
    if (Date.now() > pending.expires) { pending = null; return { ok: false, error: 'expired' }; }
    if (validate('code', input)) return { ok: false, error: 'code' };
    if (String(input).trim() !== pending.code) return { ok: false, error: 'wrongcode' };

    var p = pending;
    pending = null;
    return { ok: true, method: p.method, identifier: p.identifier };
  }

  function pendingTarget() {
    return pending ? { method: pending.method, masked: mask(pending.method, pending.identifier) } : null;
  }

  /* BACKEND #3 — replace with the real WeChat flow:
       1. open the authorize URL for your Open Platform app (snsapi_login on web,
          or wx.login in a mini program) and receive a one-time `code`;
       2. POST that code to YOUR server;
       3. the server exchanges it with WeChat using AppID + AppSecret and returns
          a session for the openid/unionid it gets back.
     The AppSecret must never be present in this file or any other file the
     browser downloads. */
  function wechatSignIn() {
    return {
      ok: false,
      error: 'wechat_stub',
      /* Surfaced in the UI so nobody ships this believing it works. */
      needs: [
        'WeChat Open Platform app (AppID + AppSecret)',
        'server-side code -> access_token exchange',
        'openid/unionid mapped to your own account record'
      ]
    };
  }

  /* -------------------------------------------------------------- sessions */

  /* Creates the account after a verified identifier. Profile is filled in by a
     second step so the form can be short at the point of sign-up. */
  function signIn(method, identifier, consent) {
    account = {
      method: method,
      /* Kept locally only because there is no server. In production this stays
         server-side and the client holds the masked form and a token. */
      identifier: identifier,
      masked: mask(method, identifier),
      profile: null,
      consent: {
        privacy: !!(consent && consent.privacy),
        guardian: !!(consent && consent.guardian),
        at: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
    persist();
    return account;
  }

  function saveProfile(profile) {
    if (!account) return { ok: false, error: 'nosession' };
    var fields = ['name', 'gender', 'age', 'nationality'];
    var errors = {};
    fields.forEach(function (f) {
      var e = validate(f, profile[f]);
      if (e) errors[f] = e;
    });
    if (Object.keys(errors).length) return { ok: false, errors: errors };

    account.profile = {
      name: String(profile.name).trim(),
      gender: profile.gender,
      age: parseInt(profile.age, 10),
      nationality: profile.nationality
    };
    if (isMinor(account.profile.age)) account.consent.guardian = !!profile.guardian;
    account.updatedAt = new Date().toISOString();
    persist();
    return { ok: true, account: account };
  }

  function signOut() {
    account = null;
    pending = null;
    persist();
  }

  /* BACKEND #4 — replace with DELETE /account. PIPL art. 47 requires actual
     erasure, not deactivation, so the server must delete rather than flag. */
  function deleteAccount() {
    account = null;
    pending = null;
    try { localStorage.removeItem(KEY); } catch (e) { /* nothing else to try */ }
    return { ok: true };
  }

  /* Everything held about this user, for the art. 45 right to a copy. */
  function exportData() {
    if (!account) return null;
    return JSON.parse(JSON.stringify(account));
  }

  load();

  return {
    MINOR_AGE: MINOR_AGE,
    load: load,
    current: current,
    isSignedIn: isSignedIn,
    validate: validate,
    isMinor: isMinor,
    mask: mask,
    sendCode: sendCode,
    verifyCode: verifyCode,
    pendingTarget: pendingTarget,
    wechatSignIn: wechatSignIn,
    signIn: signIn,
    saveProfile: saveProfile,
    signOut: signOut,
    deleteAccount: deleteAccount,
    exportData: exportData
  };
});
