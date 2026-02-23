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

  const TRANSLATIONS = {
    en: {
      'ui.language': 'Language',
      'captcha.notRobot': "I'm not a robot",
      'captcha.privacyTerms': 'Privacy - Terms',
      'captcha.pressVerify': 'Press verify to open the Indrolend hub.',
      'captcha.verify': 'Verify',
      'home.developmentHistory': 'DEVELOPMENT HISTORY',
      'home.hubTitle': 'Indrolend Access Hub',
      'home.hubDescription': 'Start here. Use the links below to listen, watch, explore visuals, read updates, and play the Asymptote Engine.',
      'home.imageGallery': 'Image Gallery',
      'home.journal': 'Journal',
      'home.engine': 'Engine',
      'asymptote.titleLead': 'The',
      'asymptote.titleTail': 'Engine',
      'asymptote.science': 'Science',
      'asymptote.art': 'Art',
      'asymptote.faith': 'Faith',
      'asymptote.gatheringMode': 'Gathering Mode',
      'asymptote.simulationMode': 'Simulation Mode',
      'asymptote.rpgMode': 'RPG Mode',
      'asymptote.population': 'Population:',
      'asymptote.health': 'Health:',
      'asymptote.resources': 'Resources:',
      'asymptote.understanding': 'Understanding:',
      'asymptote.meaning': 'Meaning:',
      'asymptote.instability': 'Instability:',
      'asymptote.backHome': '← Back to Home'
    },
    es: {
      'ui.language': 'Idioma',
      'captcha.notRobot': 'No soy un robot',
      'captcha.privacyTerms': 'Privacidad - Términos',
      'captcha.pressVerify': 'Pulsa verificar para abrir el acceso de Indrolend.',
      'captcha.verify': 'Verificar',
      'home.developmentHistory': 'HISTORIAL DE DESARROLLO',
      'home.hubTitle': 'Centro de acceso de Indrolend',
      'home.hubDescription': 'Empieza aquí. Usa los enlaces para escuchar, ver, explorar imágenes, leer novedades y jugar al Asymptote Engine.',
      'home.imageGallery': 'Galería de imágenes',
      'home.journal': 'Diario',
      'home.engine': 'Engine',
      'asymptote.titleLead': 'El',
      'asymptote.titleTail': 'Engine',
      'asymptote.science': 'Ciencia',
      'asymptote.art': 'Arte',
      'asymptote.faith': 'Fe',
      'asymptote.gatheringMode': 'Modo de recolección',
      'asymptote.simulationMode': 'Modo de simulación',
      'asymptote.rpgMode': 'Modo RPG',
      'asymptote.population': 'Población:',
      'asymptote.health': 'Salud:',
      'asymptote.resources': 'Recursos:',
      'asymptote.understanding': 'Comprensión:',
      'asymptote.meaning': 'Significado:',
      'asymptote.instability': 'Inestabilidad:',
      'asymptote.backHome': '← Volver al inicio'
    },
    fr: {
      'ui.language': 'Langue','home.imageGallery':'Galerie d’images','home.journal':'Journal','home.engine':'Engine','asymptote.backHome':'← Retour à l’accueil'
    },
    pt: {
      'ui.language': 'Idioma','home.imageGallery':'Galeria de imagens','home.journal':'Diário','home.engine':'Engine','asymptote.backHome':'← Voltar para início'
    },
    'zh-CN': {
      'ui.language': '语言','home.imageGallery':'图片库','home.journal':'日志','home.engine':'Engine','asymptote.backHome':'← 返回主页'
    },
    hi: {
      'ui.language': 'भाषा','home.imageGallery':'छवि गैलरी','home.journal':'जर्नल','home.engine':'Engine','asymptote.backHome':'← होम पर वापस जाएँ'
    },
    ar: {
      'ui.language': 'اللغة','home.imageGallery':'معرض الصور','home.journal':'اليومية','home.engine':'Engine','asymptote.backHome':'← العودة إلى الصفحة الرئيسية'
    },
    bn: {
      'ui.language': 'ভাষা','home.imageGallery':'ইমেজ গ্যালারি','home.journal':'জার্নাল','home.engine':'Engine','asymptote.backHome':'← হোমে ফিরুন'
    },
    ru: {
      'ui.language': 'Язык','home.imageGallery':'Галерея изображений','home.journal':'Журнал','home.engine':'Engine','asymptote.backHome':'← Назад на главную'
    },
    ur: {
      'ui.language': 'زبان','home.imageGallery':'تصویری گیلری','home.journal':'جرنل','home.engine':'Engine','asymptote.backHome':'← ہوم پر واپس جائیں'
    }
  };

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

  function t(langCode, key) {
    return (TRANSLATIONS[langCode] && TRANSLATIONS[langCode][key]) || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || null;
  }

  function applyContextualTranslations(langCode) {
    const safeCode = LANGUAGES.some((lang) => lang.code === langCode) ? langCode : DEFAULT_LANG;

    const languageLabel = document.querySelector('#indrolend-language-toggle label');
    const localizedLabel = t(safeCode, 'ui.language');
    if (languageLabel && localizedLabel) {
      languageLabel.textContent = localizedLabel;
    }

    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const value = t(safeCode, key);
      if (value) {
        node.textContent = value;
      }
    });

    document.querySelectorAll('[data-brand]').forEach((node) => {
      node.classList.add('notranslate');
      node.setAttribute('translate', 'no');
    });
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
    label.textContent = t(getSavedLanguage(), 'ui.language') || 'Language';

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
    applyContextualTranslations(getSavedLanguage());
    injectScript();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
