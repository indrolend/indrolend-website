// Main entry point for Idle Clicker Game
import { showIntroScreen, hideIntroScreen, showSetupScreen, hideSetupScreen } from './intro.js';
import { ClickerGame, GENERATORS, UPGRADES } from './clicker.js';

let game = null;
let lastUpdateTime = Date.now();
let autoSaveInterval = null;
let narrativeTriggers = {
  understanding100: false,
  understanding1000: false,
  understanding10000: false,
  understanding100000: false,
  firstGenerator: false,
  firstUpgrade: false,
  firstEnlightenment: false,
  allGenerators: false
};

function init() {
  // Hide unnecessary UI elements
  document.querySelector('.controls')?.remove();
  document.querySelector('.mode-controls')?.remove();
  document.querySelector('.canvas-container')?.remove();
  document.querySelector('.narrative-container')?.remove();
  document.querySelector('.stats-display')?.remove();
  
  // Create game container
  const container = document.createElement('div');
  container.id = 'clicker-game';
  container.innerHTML = `
    <div class="clicker-header">
      <h2>Understanding: <span id="understanding">0</span></h2>
      <p>Per Second: <span id="production">0</span></p>
      <p class="enlightenment-info">Enlightenments: <span id="enlightenments">0</span> (+<span id="enlightenment-bonus">0</span>%)</p>
    </div>
    
    <div class="click-area">
      <button id="main-click-btn" class="main-click-button">
        <div class="click-text">CLICK FOR</div>
        <div class="click-value">+<span id="click-power">1</span></div>
        <div class="click-subtext">UNDERSTANDING</div>
      </button>
      <div id="click-feedback"></div>
    </div>
    
    <div class="game-panels">
      <div class="panel generators-panel">
        <h3>Generators</h3>
        <div id="generators-list"></div>
      </div>
      
      <div class="panel upgrades-panel">
        <h3>Upgrades</h3>
        <div id="upgrades-list"></div>
      </div>
    </div>
    
    <div class="prestige-panel">
      <button id="enlighten-btn" class="enlighten-button" disabled>
        <span class="enlighten-title">ENLIGHTEN</span>
        <span class="enlighten-desc">Reset for +10% (requires 1000)</span>
      </button>
    </div>
    
    <div class="stats-footer">
      <button id="stats-btn" class="small-btn">Stats</button>
      <button id="save-btn" class="small-btn">Save</button>
      <button id="reset-btn" class="small-btn">Reset</button>
    </div>
  `;
  
  document.querySelector('.container').appendChild(container);
  
  // Add styles
  addStyles();
  
  // Check if intro has been shown before
  const hasSeenIntro = localStorage.getItem('asymptote_intro_shown');
  
  if (!hasSeenIntro) {
    const beginButton = showIntroScreen();
    beginButton.addEventListener('click', () => {
      hideIntroScreen();
      localStorage.setItem('asymptote_intro_shown', 'true');
      startGame();
    });
  } else {
    // Skip intro, go directly to game
    startGame();
  }
}

function startGame() {
  game = new ClickerGame();
  
  // Try to load save
  const loadResult = game.load();
  if (loadResult && loadResult.offlineProduction) {
    const hours = Math.floor(loadResult.offlineTime / (1000 * 60 * 60));
    const minutes = Math.floor((loadResult.offlineTime % (1000 * 60 * 60)) / (1000 * 60));
    showMessage(`Welcome back! You earned ${formatNumber(loadResult.offlineProduction)} Understanding while away (${hours}h ${minutes}m)`);
  }
  
  // Set up event listeners
  document.getElementById('main-click-btn').addEventListener('click', handleMainClick);
  document.getElementById('enlighten-btn').addEventListener('click', handleEnlighten);
  document.getElementById('stats-btn').addEventListener('click', showStats);
  document.getElementById('save-btn').addEventListener('click', () => {
    game.save();
    showMessage('Game saved!');
  });
  document.getElementById('reset-btn').addEventListener('click', () => game.reset());
  
  // Populate generators and upgrades
  renderGenerators();
  renderUpgrades();
  
  // Start game loop
  lastUpdateTime = Date.now();
  gameLoop();
  
  // Start autosave
  autoSaveInterval = setInterval(() => {
    game.save();
  }, 10000);
}

function handleMainClick(event) {
  const amount = game.click();
  
  // Visual feedback
  const feedback = document.getElementById('click-feedback');
  const span = document.createElement('span');
  span.className = 'click-popup';
  span.textContent = `+${formatNumber(amount)}`;
  span.style.left = (event.clientX - feedback.getBoundingClientRect().left) + 'px';
  span.style.top = (event.clientY - feedback.getBoundingClientRect().top) + 'px';
  feedback.appendChild(span);
  
  setTimeout(() => span.remove(), 1000);
  
  // Button animation
  const btn = event.currentTarget;
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => btn.style.transform = '', 100);
}

function handleEnlighten() {
  if (!game.canEnlighten()) return;
  
  if (confirm('ENLIGHTENMENT\n\nReset to push the limit further.\n+10% permanent boost.\n\nContinue?')) {
    game.enlighten();
    showNarrative('The edge moved. Closer, but never done.');
    showMessage('Enlightenment achieved! +10% permanent bonus.');
    renderGenerators();
  }
}

function renderGenerators() {
  const list = document.getElementById('generators-list');
  list.innerHTML = '';
  
  for (const genDef of GENERATORS) {
    const genData = game.generators[genDef.id];
    const cost = game.getGeneratorCost(genDef.id);
    const canAfford = game.canBuyGenerator(genDef.id);
    
    const div = document.createElement('div');
    div.className = 'generator-item';
    if (!canAfford) div.classList.add('disabled');
    
    const production = genData.count * genDef.baseProduction * game.productionMultiplier * game.getEnlightenmentBonus() * game.archaeologyBonus * game.volatilityMultiplier * game.leapfrogBonus;
    
    div.innerHTML = `
      <div class="gen-header">
        <span class="gen-name">${genDef.name}</span>
        <span class="gen-count">${genData.count}</span>
      </div>
      ${genDef.concept ? `<div class="gen-concept">${genDef.concept}</div>` : ''}
      <div class="gen-production">+${formatNumber(production)}/sec</div>
      <div class="gen-desc">${genDef.description}</div>
      <button class="gen-buy-btn" data-gen-id="${genDef.id}" ${!canAfford ? 'disabled' : ''}>
        Buy for ${formatNumber(cost)}
      </button>
    `;
    
    div.querySelector('.gen-buy-btn').addEventListener('click', () => {
      if (game.buyGenerator(genDef.id)) {
        renderGenerators();
        // Show narrative on first purchase - subtle hint.
        if (genData.count === 1 && genDef.concept) {
          showNarrative(genDef.concept);
        }
      }
    });
    
    list.appendChild(div);
  }
}

function renderUpgrades() {
  const list = document.getElementById('upgrades-list');
  list.innerHTML = '';
  
  for (const upgDef of UPGRADES) {
    const upgData = game.upgrades[upgDef.id];
    
    if (upgData.purchased) continue; // Don't show purchased upgrades
    
    const canAfford = game.canBuyUpgrade(upgDef.id);
    
    const div = document.createElement('div');
    div.className = 'upgrade-item';
    if (!canAfford) div.classList.add('disabled');
    
    div.innerHTML = `
      <div class="upg-name">${upgDef.name}</div>
      <div class="upg-desc">${upgDef.description}</div>
      ${upgDef.narrative ? `<div class="upg-narrative">${upgDef.narrative}</div>` : ''}
      <button class="upg-buy-btn" data-upg-id="${upgDef.id}" ${!canAfford ? 'disabled' : ''}>
        Purchase for ${formatNumber(upgDef.cost)}
      </button>
    `;
    
    div.querySelector('.upg-buy-btn').addEventListener('click', () => {
      if (game.buyUpgrade(upgDef.id)) {
        showMessage(`Purchased: ${upgDef.name}`);
        renderUpgrades();
        renderGenerators(); // Update in case it affects production
      }
    });
    
    list.appendChild(div);
  }
  
  if (list.children.length === 0) {
    list.innerHTML = '<p class="no-upgrades">All upgrades purchased!</p>';
  }
}

function updateUI() {
  document.getElementById('understanding').textContent = formatNumber(Math.floor(game.understanding));
  document.getElementById('production').textContent = formatNumber(game.getProductionPerSecond(), 1);
  // Show actual click power including enlightenment bonus
  const actualClickPower = game.clickPower * game.getEnlightenmentBonus();
  document.getElementById('click-power').textContent = formatNumber(actualClickPower);
  document.getElementById('enlightenments').textContent = game.enlightenments;
  document.getElementById('enlightenment-bonus').textContent = Math.floor(game.enlightenments * 10);
  
  // Update enlighten button
  const enlightenBtn = document.getElementById('enlighten-btn');
  enlightenBtn.disabled = !game.canEnlighten();
  
  // Update generator buttons
  for (const genDef of GENERATORS) {
    const btn = document.querySelector(`[data-gen-id="${genDef.id}"]`);
    if (btn) {
      const canAfford = game.canBuyGenerator(genDef.id);
      btn.disabled = !canAfford;
      btn.parentElement.classList.toggle('disabled', !canAfford);
      btn.textContent = `Buy for ${formatNumber(game.getGeneratorCost(genDef.id))}`;
    }
  }
  
  // Update upgrade buttons
  for (const upgDef of UPGRADES) {
    const btn = document.querySelector(`[data-upg-id="${upgDef.id}"]`);
    if (btn) {
      const canAfford = game.canBuyUpgrade(upgDef.id);
      btn.disabled = !canAfford;
      btn.parentElement.classList.toggle('disabled', !canAfford);
    }
  }
  
  // Trigger narrative milestones
  checkNarrativeTriggers();
}

function checkNarrativeTriggers() {
  const u = game.understanding;
  
  if (!narrativeTriggers.understanding100 && u >= 100) {
    narrativeTriggers.understanding100 = true;
    showNarrative('patterns emerge');
  }
  
  if (!narrativeTriggers.understanding1000 && u >= 1000) {
    narrativeTriggers.understanding1000 = true;
    showNarrative('the limit approaches');
  }
  
  if (!narrativeTriggers.understanding10000 && u >= 10000) {
    narrativeTriggers.understanding10000 = true;
    showNarrative('layers compound');
  }
  
  if (!narrativeTriggers.understanding100000 && u >= 100000) {
    narrativeTriggers.understanding100000 = true;
    showNarrative('complexity hides itself');
  }
  
  // Check if player has at least one of each generator
  if (!narrativeTriggers.allGenerators) {
    let hasAll = true;
    for (const genDef of GENERATORS) {
      if (game.generators[genDef.id].count === 0) {
        hasAll = false;
        break;
      }
    }
    if (hasAll) {
      narrativeTriggers.allGenerators = true;
      showNarrative('the framework reveals itself');
    }
  }
}

function gameLoop() {
  const now = Date.now();
  const deltaTime = now - lastUpdateTime;
  lastUpdateTime = now;
  
  game.update(deltaTime);
  updateUI();
  
  requestAnimationFrame(gameLoop);
}

function formatNumber(num, decimals = 0) {
  if (num < 1000) {
    return num.toFixed(decimals);
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num < 1000000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else {
    return (num / 1000000000000).toFixed(1) + 'T';
  }
}

function showMessage(text) {
  let msgBox = document.getElementById('message-box');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'message-box';
    msgBox.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #001a00;
      color: #0f0;
      border: 2px solid #0f0;
      padding: 15px 30px;
      z-index: 10000;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1rem;
      border-radius: 4px;
      max-width: 80%;
      text-align: center;
    `;
    document.body.appendChild(msgBox);
  }
  
  msgBox.textContent = text;
  msgBox.style.display = 'block';
  
  setTimeout(() => {
    msgBox.style.display = 'none';
  }, 3000);
}

function showNarrative(text) {
  let narrativeBox = document.getElementById('narrative-box');
  if (!narrativeBox) {
    narrativeBox = document.createElement('div');
    narrativeBox.id = 'narrative-box';
    narrativeBox.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 26, 0, 0.95);
      color: #0f0;
      border: 2px solid #0f0;
      padding: 20px 40px;
      z-index: 10000;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1.1rem;
      border-radius: 8px;
      max-width: 600px;
      text-align: center;
      font-style: italic;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
    `;
    document.body.appendChild(narrativeBox);
  }
  
  narrativeBox.textContent = text;
  narrativeBox.style.display = 'block';
  narrativeBox.style.opacity = '0';
  
  // Fade in
  setTimeout(() => {
    narrativeBox.style.transition = 'opacity 0.5s';
    narrativeBox.style.opacity = '1';
  }, 10);
  
  // Fade out and hide
  setTimeout(() => {
    narrativeBox.style.opacity = '0';
    setTimeout(() => {
      narrativeBox.style.display = 'none';
    }, 500);
  }, 5000);
}

function showStats() {
  const playTime = Date.now() - game.stats.gameStartTime;
  const hours = Math.floor(playTime / (1000 * 60 * 60));
  const minutes = Math.floor((playTime % (1000 * 60 * 60)) / (1000 * 60));
  
  alert(`
Statistics:
━━━━━━━━━━━━━━━━━━━━━━
Total Understanding: ${formatNumber(game.stats.totalUnderstanding)}
Total Clicks: ${formatNumber(game.stats.totalClicks)}
Total Generators: ${game.stats.totalGeneratorsPurchased}
Enlightenments: ${game.enlightenments}
Play Time: ${hours}h ${minutes}m
Current Production: ${formatNumber(game.getProductionPerSecond())}/sec
  `.trim());
}

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #clicker-game {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'EB Garamond', Georgia, serif;
    }
    
    .clicker-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .clicker-header h2 {
      font-size: 2.5rem;
      color: #0f0;
      margin: 10px 0;
    }
    
    .clicker-header p {
      font-size: 1.2rem;
      color: #0a0;
      margin: 5px 0;
    }
    
    .enlightenment-info {
      font-size: 1rem !important;
      color: #0f08 !important;
    }
    
    .click-area {
      text-align: center;
      margin: 40px 0;
      position: relative;
    }
    
    .main-click-button {
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: linear-gradient(135deg, #003300, #001a00);
      border: 4px solid #0f0;
      color: #0f0;
      font-family: 'EB Garamond', Georgia, serif;
      cursor: pointer;
      transition: all 0.1s;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 0 30px #0f040;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
    }
    
    .main-click-button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 50px #0f060;
    }
    
    .main-click-button:active {
      transform: scale(0.95);
    }
    
    .click-text {
      font-size: 1.2rem;
      opacity: 0.8;
    }
    
    .click-value {
      font-size: 3rem;
      font-weight: bold;
    }
    
    .click-subtext {
      font-size: 1rem;
      opacity: 0.8;
    }
    
    #click-feedback {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    
    .click-popup {
      position: absolute;
      color: #0f0;
      font-size: 1.5rem;
      font-weight: bold;
      animation: popup-rise 1s ease-out forwards;
      pointer-events: none;
    }
    
    @keyframes popup-rise {
      0% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-100px);
      }
    }
    
    .game-panels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 40px 0;
    }
    
    @media (max-width: 768px) {
      .game-panels {
        grid-template-columns: 1fr;
      }
    }
    
    .panel {
      background-color: #001a00;
      border: 2px solid #0f0;
      border-radius: 8px;
      padding: 20px;
    }
    
    .panel h3 {
      color: #0f0;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }
    
    .generator-item, .upgrade-item {
      background-color: #002200;
      border: 1px solid #0a0;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      transition: all 0.2s;
    }
    
    .generator-item:hover, .upgrade-item:hover {
      background-color: #003300;
      border-color: #0f0;
    }
    
    .generator-item.disabled, .upgrade-item.disabled {
      opacity: 0.5;
    }
    
    .gen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .gen-name, .upg-name {
      font-size: 1.2rem;
      font-weight: bold;
      color: #0f0;
    }
    
    .gen-count {
      font-size: 1.5rem;
      color: #0f0;
    }
    
    .gen-production {
      font-size: 1rem;
      color: #0a0;
      margin-bottom: 5px;
    }
    
    .gen-desc, .upg-desc {
      font-size: 0.9rem;
      color: #0a0;
      margin-bottom: 10px;
      font-style: italic;
    }
    
    .gen-concept {
      font-size: 0.75rem;
      color: #0f0;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      opacity: 0.8;
      text-transform: uppercase;
    }
    
    .upg-narrative {
      font-size: 0.85rem;
      color: #0f0;
      margin-top: 8px;
      margin-bottom: 10px;
      font-style: italic;
      opacity: 0.9;
      padding: 8px;
      background-color: rgba(0, 255, 0, 0.05);
      border-left: 2px solid #0f0;
    }
    
    .gen-buy-btn, .upg-buy-btn {
      width: 100%;
      padding: 10px;
      background-color: #001a00;
      border: 2px solid #0f0;
      color: #0f0;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    .gen-buy-btn:hover:not(:disabled), .upg-buy-btn:hover:not(:disabled) {
      background-color: #0f0;
      color: #000;
    }
    
    .gen-buy-btn:disabled, .upg-buy-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .no-upgrades {
      text-align: center;
      color: #0a0;
      font-style: italic;
    }
    
    .prestige-panel {
      text-align: center;
      margin: 40px 0;
    }
    
    .enlighten-button {
      padding: 20px 40px;
      background: linear-gradient(135deg, #004400, #002200);
      border: 3px solid #0f0;
      color: #0f0;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1.5rem;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s;
      box-shadow: 0 0 20px #0f040;
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: center;
      margin: 0 auto;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    .enlighten-button:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 0 40px #0f060;
    }
    
    .enlighten-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .enlighten-title {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .enlighten-desc {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .stats-footer {
      text-align: center;
      margin-top: 40px;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .small-btn {
      padding: 10px 20px;
      background-color: #001a00;
      border: 2px solid #0a0;
      color: #0a0;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    .small-btn:hover {
      background-color: #0a0;
      color: #000;
    }
  `;
  document.head.appendChild(style);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
