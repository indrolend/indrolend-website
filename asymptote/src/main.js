import { state } from './state.js';
import { tick } from './update.js';
import { initRender, renderSimulation } from './render.js';
import { initUI, updateStatsDisplay, setMode } from './ui.js';
import { updateNarrative } from './narrative.js';
import { initRPGFromCivState } from './rpg/rpgState.js';
import { initRPGRender, renderRPG } from './rpg/rpgRender.js';
import { initRPGUI, updateRPGUI, hideRPGUI } from './rpg/rpgUI.js';
import { showIntroScreen, hideIntroScreen, showSetupScreen, hideSetupScreen, applyStartingResources } from './intro.js';

let lastTime = 0;
let simCanvas, rpgCanvas;

function init() {
  // Get canvas elements
  simCanvas = document.getElementById('sim-canvas');
  rpgCanvas = document.getElementById('rpg-canvas');
  
  // Initialize renderers
  initRender(simCanvas);
  initRPGRender(rpgCanvas);
  
  // Initialize UI
  initUI();
  initRPGUI();
  
  // Set up mode buttons
  document.getElementById('simModeBtn').addEventListener('click', () => {
    handleModeChange('sim');
  });
  
  document.getElementById('rpgModeBtn').addEventListener('click', () => {
    handleModeChange('rpg');
  });
  
  // Show intro screen first
  if (!state.gameStarted) {
    const beginButton = showIntroScreen();
    beginButton.addEventListener('click', () => {
      hideIntroScreen();
      setTimeout(() => {
        showSetupScreen((selectedResources) => {
          applyStartingResources(selectedResources, state);
          hideSetupScreen();
          state.gameStarted = true;
          state.mode = 'sim';
          setMode('sim');
          // Start animation loop after setup
          requestAnimationFrame(gameLoop);
        });
      }, 500);
    });
  } else {
    // Start animation loop immediately if game already started
    requestAnimationFrame(gameLoop);
  }
}

function handleModeChange(mode) {
  if (mode === 'rpg' && state.mode !== 'rpg') {
    // Entering RPG mode - initialize from civ state
    initRPGFromCivState();
    updateRPGUI();
  } else if (mode === 'sim' && state.mode !== 'sim') {
    // Exiting RPG mode
    hideRPGUI();
  }
  
  setMode(mode);
}

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Only run game loop if game has started
  if (!state.gameStarted) {
    return;
  }
  
  if (state.mode === 'sim') {
    // Run simulation mode
    if (deltaTime > 100) { // Update every 100ms
      tick();
      updateStatsDisplay();
      updateNarrative();
    }
    renderSimulation();
  } else if (state.mode === 'rpg') {
    // Run RPG mode
    renderRPG();
    updateRPGUI();
  }
  
  requestAnimationFrame(gameLoop);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
