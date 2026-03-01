/**
 * i18n.js — Native translation system for Indrolend website
 *
 * Supports: English (en), Spanish (es), Chinese (zh),
 *           German (de), Hindi (hi), Dutch (nl)
 *
 * Usage:
 *   - Add data-i18n="key" to any HTML element to have its textContent replaced.
 *   - Call window.i18n.init() after DOM is ready (done automatically on DOMContentLoaded).
 *   - Call window.i18n.setLanguage('es') to switch language and re-render.
 *   - Language choice is persisted in localStorage.
 */
(function (window) {
  'use strict';

  var SUPPORTED = ['en', 'es', 'zh', 'de', 'hi', 'nl'];
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'indrolend_lang';

  /** Native script display name for each language */
  var LANG_NAMES = {
    en: 'English',
    es: 'Español',
    zh: '中文',
    de: 'Deutsch',
    hi: 'हिन्दी',
    nl: 'Nederlands'
  };

  var cache = {};       // { langCode: { key: value, ... } }
  var currentLang = DEFAULT_LANG;

  /* ── Path resolution ─────────────────────────────────────── */

  function localesBase() {
    var path = window.location.pathname;
    if (path.indexOf('/asymptote/') !== -1 || path.indexOf('/pages/') !== -1) {
      return '../locales/';
    }
    return 'locales/';
  }

  /* ── Language detection ───────────────────────────────────── */

  function detectLang() {
    // 1. User-saved preference
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) { /* localStorage unavailable */ }

    // 2. Browser language
    var langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || DEFAULT_LANG];

    for (var i = 0; i < langs.length; i++) {
      var code = langs[i].toLowerCase().split('-')[0];
      if (SUPPORTED.indexOf(code) !== -1) return code;
    }
    return DEFAULT_LANG;
  }

  /* ── Translation loading ──────────────────────────────────── */

  function loadLang(lang, callback) {
    if (cache[lang]) { callback(cache[lang]); return; }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', localesBase() + lang + '.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          cache[lang] = JSON.parse(xhr.responseText);
        } catch (e) {
          console.warn('[i18n] Parse error for "' + lang + '": ' + e.message);
          cache[lang] = {};
        }
      } else {
        console.warn('[i18n] Could not load "' + lang + '" (' + xhr.status + ')');
        cache[lang] = {};
      }
      callback(cache[lang]);
    };
    xhr.send();
  }

  /* ── Translation lookup ───────────────────────────────────── */

  /**
   * Look up a translation key.  Falls back to English, then the key itself.
   * @param {string} key
   * @param {object} [replacements]  e.g. { count: 2, max: 3 }
   * @returns {string}
   */
  function t(key, replacements) {
    var value;

    if (cache[currentLang]) value = cache[currentLang][key];
    if (value === undefined && cache[DEFAULT_LANG]) value = cache[DEFAULT_LANG][key];
    if (value === undefined) value = key;

    if (replacements && typeof value === 'string') {
      Object.keys(replacements).forEach(function (k) {
        value = value.replace('{' + k + '}', replacements[k]);
      });
    }
    return value;
  }

  /* ── DOM rendering ────────────────────────────────────────── */

  function applyTranslations() {
    // Text content
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val && val !== key) el.textContent = val;
    }

    // HTML content (for elements that need HTML, e.g. spans inside text)
    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      var hel = htmlNodes[j];
      var hkey = hel.getAttribute('data-i18n-html');
      var hval = t(hkey);
      if (hval && hval !== hkey) hel.innerHTML = hval;
    }

    // Placeholder attributes
    var phNodes = document.querySelectorAll('[data-i18n-placeholder]');
    for (var p = 0; p < phNodes.length; p++) {
      var pel = phNodes[p];
      var pkey = pel.getAttribute('data-i18n-placeholder');
      var pval = t(pkey);
      if (pval && pval !== pkey) pel.placeholder = pval;
    }

    // aria-label attributes
    var ariaNodes = document.querySelectorAll('[data-i18n-aria]');
    for (var a = 0; a < ariaNodes.length; a++) {
      var ael = ariaNodes[a];
      var akey = ael.getAttribute('data-i18n-aria');
      var aval = t(akey);
      if (aval && aval !== akey) ael.setAttribute('aria-label', aval);
    }

    document.documentElement.lang = currentLang;
    updatePickerUI();
  }

  /* ── Language picker ──────────────────────────────────────── */

  /**
   * Inject a <select>-based language picker into every element matching
   * the selector (defaults to '.lang-picker-container').
   */
  function injectLanguagePicker(selector) {
    var containers = document.querySelectorAll(selector || '.lang-picker-container');
    for (var c = 0; c < containers.length; c++) {
      // Avoid double-injection
      if (containers[c].querySelector('.lang-picker-select')) continue;

      var wrapper = document.createElement('div');
      wrapper.className = 'lang-picker';
      wrapper.setAttribute('role', 'navigation');
      wrapper.setAttribute('aria-label', 'Language selector');

      var select = document.createElement('select');
      select.className = 'lang-picker-select';
      select.id = 'lang-picker-select-' + c;
      select.setAttribute('aria-label', 'Select language');

      SUPPORTED.forEach(function (lang) {
        var opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = LANG_NAMES[lang];
        if (lang === currentLang) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', function (e) {
        setLanguage(e.target.value);
      });

      wrapper.appendChild(select);
      containers[c].appendChild(wrapper);
    }
  }

  function updatePickerUI() {
    var selects = document.querySelectorAll('.lang-picker-select');
    for (var i = 0; i < selects.length; i++) {
      selects[i].value = currentLang;
    }
  }

  /* ── Public API ───────────────────────────────────────────── */

  /**
   * Set the active language, persist it, and re-render the page.
   * @param {string} lang  Two-letter language code.
   */
  function setLanguage(lang) {
    if (SUPPORTED.indexOf(lang) === -1) {
      console.warn('[i18n] Unsupported language: "' + lang + '"');
      lang = DEFAULT_LANG;
    }
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ok */ }

    // Ensure both the chosen language and the English fallback are loaded
    var loaded = 0;
    var needed = (lang === DEFAULT_LANG) ? 1 : 2;

    function onLoaded() {
      loaded++;
      if (loaded === needed) {
        applyTranslations();
        try {
          window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
        } catch (e) { /* IE fallback */ }
      }
    }

    loadLang(lang, onLoaded);
    if (lang !== DEFAULT_LANG) loadLang(DEFAULT_LANG, onLoaded);
  }

  /**
   * Initialise i18n: detect language, load files, render.
   * Called automatically on DOMContentLoaded.
   */
  function init() {
    currentLang = detectLang();

    var loaded = 0;
    var needed = (currentLang === DEFAULT_LANG) ? 1 : 2;

    function onLoaded() {
      loaded++;
      if (loaded === needed) {
        injectLanguagePicker();
        applyTranslations();
        try {
          window.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: currentLang } }));
        } catch (e) { /* IE fallback */ }
      }
    }

    loadLang(currentLang, onLoaded);
    if (currentLang !== DEFAULT_LANG) loadLang(DEFAULT_LANG, onLoaded);
  }

  /* ── Bootstrap ────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.i18n = {
    init: init,
    t: t,
    setLanguage: setLanguage,
    injectLanguagePicker: injectLanguagePicker,
    getCurrentLanguage: function () { return currentLang; },
    getSupportedLanguages: function () { return SUPPORTED.slice(); },
    getLanguageNames: function () { return Object.assign({}, LANG_NAMES); }
  };

}(window));
