(function () {
  const STORAGE_KEY = 'indrolend-language';
  const COOKIE_NAME = 'googtrans';
  const DEFAULT_LANG = 'en';
  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'zh-CN', label: '中文 (Mandarin)' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'pt', label: 'Português' },
    { code: 'ru', label: 'Русский' },
    { code: 'ur', label: 'اردو' }
  ];

  function setCookie(name, value) {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function getSavedLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue && cookieValue.includes('/')) {
      const parts = cookieValue.split('/');
      return parts[parts.length - 1] || DEFAULT_LANG;
    }

    return DEFAULT_LANG;
  }

  function applyLanguage(langCode) {
    const safeCode = LANGUAGES.some((lang) => lang.code === langCode) ? langCode : DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, safeCode);
    setCookie(COOKIE_NAME, `/en/${safeCode}`);
    window.location.reload();
  }

  function initGoogleTranslate() {
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: LANGUAGES.map((lang) => lang.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
    }
  }

  function injectStyles() {
    if (document.getElementById('indrolend-language-style')) return;

    const style = document.createElement('style');
    style.id = 'indrolend-language-style';
    style.textContent = `
      .skiptranslate, .goog-logo-link { display: none !important; }
      body { top: 0 !important; }
      #indrolend-language-toggle {
        position: fixed;
        top: 14px;
        right: 14px;
        z-index: 999999;
        background: rgba(2, 6, 18, 0.86);
        color: #e9f7ff;
        border: 1px solid rgba(109, 217, 232, 0.5);
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 13px;
        backdrop-filter: blur(6px);
      }
      #indrolend-language-toggle label {
        margin-right: 6px;
      }
      #indrolend-language-select {
        background: #081628;
        color: #e9f7ff;
        border: 1px solid rgba(109, 217, 232, 0.5);
        border-radius: 6px;
        padding: 4px 6px;
      }
      #google_translate_element {
        position: absolute;
        left: -9999px;
        top: -9999px;
      }
    `;

    document.head.appendChild(style);
  }

  function injectToggle() {
    if (document.getElementById('indrolend-language-toggle')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'indrolend-language-toggle';
    wrapper.className = 'notranslate';

    const label = document.createElement('label');
    label.setAttribute('for', 'indrolend-language-select');
    label.textContent = 'Language';

    const select = document.createElement('select');
    select.id = 'indrolend-language-select';

    LANGUAGES.forEach((lang) => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.label;
      select.appendChild(option);
    });

    const current = getSavedLanguage();
    select.value = LANGUAGES.some((lang) => lang.code === current) ? current : DEFAULT_LANG;

    select.addEventListener('change', () => applyLanguage(select.value));

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    document.body.appendChild(wrapper);

    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.className = 'notranslate';
    document.body.appendChild(container);
  }

  function injectScript() {
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = initGoogleTranslate;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.defer = true;
    document.head.appendChild(script);
  }

  function init() {
    injectStyles();
    injectToggle();
    injectScript();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
