(function () {
  const STORAGE_KEY = 'siteLanguage';
  const defaultLang = 'en';
  const supported = ['en', 'es', 'fr', 'de', 'ja', 'zh-TW', 'zh-CN'];

  const translations = {
    en: {
      languageLabel: 'Language',
      notRobot: "I'm not a robot",
      privacyTerms: 'Privacy - Terms',
      verifyPrompt: 'Press the verify button to proceed.',
      verifyButton: 'Verify',
      gallery: 'image gallery',
      journal: 'journal',
      asymptote: 'Asymptote engine'
    },
    es: {
      languageLabel: 'Idioma',
      notRobot: 'No soy un robot',
      privacyTerms: 'Privacidad - Términos',
      verifyPrompt: 'Pulsa el botón de verificar para continuar.',
      verifyButton: 'Verificar',
      gallery: 'galería de imágenes',
      journal: 'diario',
      asymptote: 'Motor Asymptote'
    },
    fr: {
      languageLabel: 'Langue',
      notRobot: 'Je ne suis pas un robot',
      privacyTerms: 'Confidentialité - Conditions',
      verifyPrompt: 'Appuyez sur le bouton Vérifier pour continuer.',
      verifyButton: 'Vérifier',
      gallery: "galerie d'images",
      journal: 'journal',
      asymptote: 'Moteur Asymptote'
    },
    de: {
      languageLabel: 'Sprache',
      notRobot: 'Ich bin kein Roboter',
      privacyTerms: 'Datenschutz - Nutzungsbedingungen',
      verifyPrompt: 'Drücken Sie auf „Verifizieren“, um fortzufahren.',
      verifyButton: 'Verifizieren',
      gallery: 'Bildergalerie',
      journal: 'Journal',
      asymptote: 'Asymptote-Engine'
    },
    ja: {
      languageLabel: '言語',
      notRobot: '私はロボットではありません',
      privacyTerms: 'プライバシー - 利用規約',
      verifyPrompt: '続行するには「確認」ボタンを押してください。',
      verifyButton: '確認',
      gallery: '画像ギャラリー',
      journal: 'ジャーナル',
      asymptote: 'Asymptote エンジン'
    },
    'zh-TW': {
      languageLabel: '語言',
      notRobot: '我不是機器人',
      privacyTerms: '隱私權 - 條款',
      verifyPrompt: '請按「驗證」按鈕以繼續。',
      verifyButton: '驗證',
      gallery: '圖片畫廊',
      journal: '日誌',
      asymptote: 'Asymptote 引擎'
    },
    'zh-CN': {
      languageLabel: '语言',
      notRobot: '我不是机器人',
      privacyTerms: '隐私 - 条款',
      verifyPrompt: '请按“验证”按钮继续。',
      verifyButton: '验证',
      gallery: '图片画廊',
      journal: '日志',
      asymptote: 'Asymptote 引擎'
    }
  };

  function getLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return supported.includes(saved) ? saved : defaultLang;
  }

  function t(lang, key) {
    return (translations[lang] && translations[lang][key]) || translations.en[key] || '';
  }

  function applyTranslations(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      element.textContent = t(lang, key);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      const key = element.getAttribute('data-i18n-aria-label');
      element.setAttribute('aria-label', t(lang, key));
    });

    const label = document.querySelector('[for="site-language-selector"]');
    if (label) {
      label.textContent = `${t(lang, 'languageLabel')}:`;
    }
  }

  function renderSelector() {
    const mount = document.getElementById('site-language-mount');
    if (!mount) return;

    mount.innerHTML = `
      <label for="site-language-selector">Language:</label>
      <select id="site-language-selector" aria-label="Language selector">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="ja">日本語</option>
        <option value="zh-TW">中文（繁體）</option>
        <option value="zh-CN">普通话（简体）</option>
      </select>
    `;

    const select = document.getElementById('site-language-selector');
    const current = getLanguage();
    select.value = current;
    applyTranslations(current);

    select.addEventListener('change', (event) => {
      const lang = event.target.value;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations(lang);
    });
  }

  window.SiteLanguage = {
    getLanguage,
    t: (key) => t(getLanguage(), key)
  };

  document.addEventListener('DOMContentLoaded', renderSelector);
})();
