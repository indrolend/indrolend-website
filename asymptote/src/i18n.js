const STORAGE_KEY = 'siteLanguage';
const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'es', 'fr', 'de', 'ja', 'zh-TW', 'zh-CN'];

const translations = {
  en: {
    title: 'The Asymptote Engine',
    science: 'Science', art: 'Art', faith: 'Faith',
    gatheringMode: 'Gathering Mode', simulationMode: 'Simulation Mode', rpgMode: 'RPG Mode',
    population: 'Population', health: 'Health', resources: 'Resources', understanding: 'Understanding', meaning: 'Meaning', instability: 'Instability',
    backToHome: '← back to home',
    introText: `Welcome.

Human understanding is limited compared to the complexity of reality.

We simplify reality into models so we can act.

We get closer to truth, but never fully arrive.

That is the asymptote.

Let us begin.`,
    begin: 'Begin',
    setupTitle: 'Choose 3 Starting Resources', setupSubtitle: 'Pick three resources to shape your system.',
    selected: 'Selected', start: 'Start Simulation',
    woodName: 'Wood', woodDesc: 'Builds frameworks and can regrow.', woodEffect: 'supports stable structures',
    stoneName: 'Stone', stoneDesc: 'Decisions that become fixed.', stoneEffect: 'durable but rigid',
    foodName: 'Food', foodDesc: 'Basic physical constraint.', foodEffect: 'living systems require energy',
    metalName: 'Metal', metalDesc: 'Tools that imitate nature.', metalEffect: 'recreates effects, not essence',
    n_default: 'Bounded agents in a dense universe. Compressing, acting, updating.',
    n1:'They cannot hold everything, so they compress. They keep what seems useful and drop the rest. Every model leaves something behind.',
    n2:'More facts, less clarity. The map grows, but understanding does not keep pace.',
    n3:'They are close now, close enough to see the edge they cannot cross. Truth approaches but never fully arrives.',
    n4:'Patterns rise from noise. Each compression reveals structure and removes detail. That is the trade-off.',
    n5:'In uncertainty, they build models from shadows and infer structures too dense to directly observe.'
  },
  es: {
    title: 'El Motor Asymptote', science: 'Ciencia', art: 'Arte', faith: 'Fe', gatheringMode: 'Modo de Recolección', simulationMode: 'Modo de Simulación', rpgMode: 'Modo RPG',
    population:'Población', health:'Salud', resources:'Recursos', understanding:'Comprensión', meaning:'Significado', instability:'Inestabilidad', backToHome:'← volver al inicio',
    introText:`Bienvenido.

La comprensión humana es limitada frente a la complejidad de la realidad.

Simplificamos la realidad en modelos para poder actuar.

Nos acercamos a la verdad, pero nunca llegamos por completo.

Eso es la asíntota.

Comencemos.`,
    begin:'Comenzar', setupTitle:'Elige 3 recursos iniciales', setupSubtitle:'Elige tres recursos para formar tu sistema.', selected:'Seleccionados', start:'Iniciar simulación',
    woodName:'Madera', woodDesc:'Construye estructuras y puede regenerarse.', woodEffect:'sostiene estructuras estables',
    stoneName:'Piedra', stoneDesc:'Decisiones que se vuelven fijas.', stoneEffect:'duradera pero rígida',
    foodName:'Alimento', foodDesc:'Restricción física básica.', foodEffect:'los sistemas vivos necesitan energía',
    metalName:'Metal', metalDesc:'Herramientas que imitan la naturaleza.', metalEffect:'reproduce efectos, no esencia',
    n_default:'Agentes limitados en un universo denso. Comprimiendo, actuando y actualizando.',
    n1:'No pueden abarcarlo todo, así que comprimen. Conservan lo útil y descartan lo demás. Todo modelo deja algo fuera.',
    n2:'Más datos, menos claridad. El mapa crece, pero la comprensión no avanza al mismo ritmo.',
    n3:'Ahora están cerca, lo suficiente para ver el límite que no pueden cruzar. La verdad se aproxima, pero nunca llega por completo.',
    n4:'Los patrones emergen del ruido. Cada compresión revela estructura y elimina detalle. Ese es el intercambio.',
    n5:'En la incertidumbre, construyen modelos de sombras e infieren estructuras demasiado densas para observarse directamente.'
  },
  fr: {
    title:'Le Moteur Asymptote', science:'Science', art:'Art', faith:'Foi', gatheringMode:'Mode Collecte', simulationMode:'Mode Simulation', rpgMode:'Mode RPG', population:'Population', health:'Santé', resources:'Ressources', understanding:'Compréhension', meaning:'Sens', instability:'Instabilité', backToHome:'← retour à l’accueil',
    introText:`Bienvenue.

La compréhension humaine est limitée face à la complexité du réel.

Nous simplifions la réalité en modèles pour pouvoir agir.

Nous nous rapprochons de la vérité sans jamais l’atteindre totalement.

C’est l’asymptote.

Commençons.`,
    begin:'Commencer', setupTitle:'Choisissez 3 ressources de départ', setupSubtitle:'Choisissez trois ressources pour façonner votre système.', selected:'Sélectionnées', start:'Démarrer la simulation',
    woodName:'Bois', woodDesc:'Construit des structures et peut repousser.', woodEffect:'soutient des structures stables', stoneName:'Pierre', stoneDesc:'Des décisions qui se figent.', stoneEffect:'durable mais rigide',
    foodName:'Nourriture', foodDesc:'Contrainte physique fondamentale.', foodEffect:'les systèmes vivants ont besoin d’énergie', metalName:'Métal', metalDesc:'Outils qui imitent la nature.', metalEffect:'reproduit les effets, pas l’essence',
    n_default:'Agents limités dans un univers dense. Compression, action, mise à jour.',
    n1:'Ils ne peuvent pas tout contenir, alors ils compressent. Ils gardent l’utile et abandonnent le reste. Chaque modèle laisse quelque chose de côté.',
    n2:'Plus de faits, moins de clarté. La carte grandit, mais la compréhension ne suit pas.',
    n3:'Ils sont proches désormais, assez proches pour voir la limite qu’ils ne peuvent franchir. La vérité se rapproche sans jamais arriver pleinement.',
    n4:'Des motifs émergent du bruit. Chaque compression révèle une structure et perd du détail. Voilà le compromis.',
    n5:'Dans l’incertitude, ils construisent des modèles d’ombres et déduisent des structures trop denses pour être observées directement.'
  },
  de: {
    title:'Die Asymptote-Engine', science:'Wissenschaft', art:'Kunst', faith:'Glaube', gatheringMode:'Sammelmodus', simulationMode:'Simulationsmodus', rpgMode:'RPG-Modus', population:'Bevölkerung', health:'Gesundheit', resources:'Ressourcen', understanding:'Verständnis', meaning:'Bedeutung', instability:'Instabilität', backToHome:'← zurück zur Startseite',
    introText:`Willkommen.

Das menschliche Verständnis ist im Vergleich zur Komplexität der Realität begrenzt.

Wir vereinfachen die Realität in Modellen, um handeln zu können.

Wir nähern uns der Wahrheit, erreichen sie aber nie vollständig.

Das ist die Asymptote.

Beginnen wir.`,
    begin:'Start', setupTitle:'Wähle 3 Startressourcen', setupSubtitle:'Wähle drei Ressourcen, um dein System zu formen.', selected:'Ausgewählt', start:'Simulation starten',
    woodName:'Holz', woodDesc:'Bildet Strukturen und wächst nach.', woodEffect:'trägt stabile Strukturen', stoneName:'Stein', stoneDesc:'Entscheidungen, die sich verfestigen.', stoneEffect:'dauerhaft, aber unflexibel',
    foodName:'Nahrung', foodDesc:'Grundlegende physische Begrenzung.', foodEffect:'lebende Systeme benötigen Energie', metalName:'Metall', metalDesc:'Werkzeuge, die Natur nachbilden.', metalEffect:'reproduziert Effekte, nicht Essenz',
    n_default:'Begrenzte Akteure in einem dichten Universum. Komprimieren, handeln, aktualisieren.',
    n1:'Sie können nicht alles erfassen, also komprimieren sie. Sie behalten Nützliches und verwerfen den Rest. Jedes Modell lässt etwas zurück.',
    n2:'Mehr Fakten, weniger Klarheit. Die Karte wächst, doch das Verständnis hält nicht Schritt.',
    n3:'Sie sind jetzt nah genug, um die Grenze zu sehen, die sie nicht überschreiten können. Die Wahrheit nähert sich, erreicht aber nie ganz das Ziel.',
    n4:'Muster entstehen aus Rauschen. Jede Komprimierung zeigt Struktur und verliert Detail. Das ist der Tausch.',
    n5:'In Unsicherheit bauen sie Modelle aus Schatten und schließen auf Strukturen, die zu dicht für direkte Beobachtung sind.'
  },
  ja: {
    title:'アシンポート・エンジン', science:'科学', art:'芸術', faith:'信念', gatheringMode:'収集モード', simulationMode:'シミュレーションモード', rpgMode:'RPGモード', population:'人口', health:'健康', resources:'資源', understanding:'理解', meaning:'意味', instability:'不安定性', backToHome:'← ホームに戻る',
    introText:`ようこそ。

人間の理解には、現実の複雑さに対して限界があります。

私たちは行動するために、現実をモデルとして単純化します。

真理には近づけますが、完全には到達できません。

それが漸近線です。

始めましょう。`,
    begin:'開始', setupTitle:'初期資源を3つ選択', setupSubtitle:'システムを形づくるために3つ選んでください。', selected:'選択済み', start:'シミュレーション開始',
    woodName:'木材', woodDesc:'構造を作り、再生できます。', woodEffect:'安定した構造を支える', stoneName:'石材', stoneDesc:'固定化される意思決定。', stoneEffect:'耐久性は高いが硬直的',
    foodName:'食料', foodDesc:'基本的な物理的制約。', foodEffect:'生命系にはエネルギーが必要', metalName:'金属', metalDesc:'自然を模倣する道具。', metalEffect:'本質ではなく効果を再現する',
    n_default:'限られた主体が高密度の宇宙で圧縮し、行動し、更新する。',
    n1:'すべてを保持できないため、彼らは圧縮する。必要なものを残し、残りを捨てる。どのモデルにも取りこぼしがある。',
    n2:'事実は増えるが、明確さは増えない。地図は広がっても、理解は追いつかない。',
    n3:'今や彼らは近い。越えられない境界が見えるほどに。真理は近づくが、完全には到達しない。',
    n4:'雑音からパターンが現れる。圧縮のたびに構造は見え、細部は失われる。それが代償だ。',
    n5:'不確実性の中で、彼らは影からモデルを作り、直接観測できないほど密な構造を推定する。'
  },
  'zh-TW': {
    title:'漸近引擎', science:'科學', art:'藝術', faith:'信念', gatheringMode:'採集模式', simulationMode:'模擬模式', rpgMode:'RPG 模式', population:'人口', health:'健康', resources:'資源', understanding:'理解', meaning:'意義', instability:'不穩定度', backToHome:'← 返回首頁',
    introText:`歡迎。

相較於現實的複雜性，人類的理解能力是有限的。

我們把現實簡化成模型，才能行動。

我們可以更接近真相，但永遠無法完全抵達。

這就是漸近線。

開始吧。`,
    begin:'開始', setupTitle:'選擇 3 項初始資源', setupSubtitle:'請選三項資源來塑造你的系統。', selected:'已選擇', start:'開始模擬',
    woodName:'木材', woodDesc:'建立框架，且可再生。', woodEffect:'支撐穩定結構', stoneName:'石材', stoneDesc:'會固化的決策。', stoneEffect:'耐久但僵硬',
    foodName:'食物', foodDesc:'基本的物理限制。', foodEffect:'生命系統需要能量', metalName:'金屬', metalDesc:'模仿自然的工具。', metalEffect:'重現效果而非本質',
    n_default:'受限的行動者處於高密度宇宙中：壓縮、行動、更新。',
    n1:'他們無法容納全部資訊，所以只能壓縮。保留有用的，捨棄其餘。每個模型都會遺漏一些東西。',
    n2:'事實更多，清晰度卻更低。地圖擴大了，但理解沒有同步提升。',
    n3:'他們現在已經很接近，近到看見那條無法跨越的邊界。真相在靠近，但永遠不會完全到達。',
    n4:'模式從雜訊中浮現。每次壓縮都會顯露結構，也會失去細節。這就是取捨。',
    n5:'在不確定中，他們以陰影建立模型，推測那些過於稠密、無法直接觀測的結構。'
  },
  'zh-CN': {
    title:'渐近引擎', science:'科学', art:'艺术', faith:'信念', gatheringMode:'采集模式', simulationMode:'模拟模式', rpgMode:'RPG 模式', population:'人口', health:'健康', resources:'资源', understanding:'理解', meaning:'意义', instability:'不稳定度', backToHome:'← 返回首页',
    introText:`欢迎。

相对于现实的复杂性，人类的理解能力是有限的。

我们把现实简化成模型，才能行动。

我们会更接近真相，但永远无法完全到达。

这就是渐近线。

开始吧。`,
    begin:'开始', setupTitle:'选择 3 项初始资源', setupSubtitle:'请选择三项资源来塑造你的系统。', selected:'已选择', start:'开始模拟',
    woodName:'木材', woodDesc:'建立框架，并可再生。', woodEffect:'支撑稳定结构', stoneName:'石材', stoneDesc:'会固化的决策。', stoneEffect:'耐久但僵硬',
    foodName:'食物', foodDesc:'基本物理约束。', foodEffect:'生命系统需要能量', metalName:'金属', metalDesc:'模仿自然的工具。', metalEffect:'重现效果而非本质',
    n_default:'受限行动者处于高密度宇宙：压缩、行动、更新。',
    n1:'他们无法容纳全部信息，所以进行压缩。保留有用部分，舍弃其余。每个模型都会遗漏一些内容。',
    n2:'事实更多，但清晰度更低。地图在扩大，理解却没有同步增长。',
    n3:'他们已经很接近，近到看见无法跨越的边界。真相在逼近，却永远无法完全抵达。',
    n4:'模式从噪声中显现。每次压缩都会显露结构，也会损失细节。这就是代价。',
    n5:'在不确定中，他们从“影子”构建模型，推断那些过于稠密而无法直接观察的结构。'
  }
};

export function getLanguage() {
  const lang = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

export function t(key) {
  const lang = getLanguage();
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export function renderAsymptoteLanguageSelector() {
  const mount = document.getElementById('asymptote-language-mount');
  if (!mount) return;
  mount.innerHTML = `<label for="asymptote-language-selector">Language:</label>
  <select id="asymptote-language-selector">
    <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="ja">日本語</option><option value="zh-TW">中文（繁體）</option><option value="zh-CN">普通话（简体）</option>
  </select>`;
  const select = document.getElementById('asymptote-language-selector');
  select.value = getLanguage();
  select.addEventListener('change', (e) => {
    localStorage.setItem(STORAGE_KEY, e.target.value);
    applyStaticTranslations();
    document.dispatchEvent(new CustomEvent('asymptote-language-changed'));
  });
}

export function applyStaticTranslations() {
  document.documentElement.lang = getLanguage();
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  const label = document.querySelector('label[for="asymptote-language-selector"]');
  if (label) label.textContent = `${t('languageLabel') || 'Language'}:`;
}
