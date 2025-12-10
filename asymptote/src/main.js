import { state } from './state.js';
import { tick } from './update.js';
import { initRender, renderSimulation } from './render.js';
import { initUI, updateStatsDisplay, setMode } from './ui.js';
import { updateNarrative } from './narrative.js';
import { initRPGFromCivState } from './rpg/rpgState.js';
import { initRPGRender, renderRPG } from './rpg/rpgRender.js';
import { initRPGUI, updateRPGUI, hideRPGUI } from './rpg/rpgUI.js';
import { showIntroScreen, hideIntroScreen, showSetupScreen, hideSetupScreen, applyStartingResources } from './intro.js';
import { GatheringSystem, renderGatheringUI } from './gathering.js';

let lastTime = 0;
let simCanvas, rpgCanvas;
let gatheringSystem = null;
let gatheringContainer = null;

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
  
  // Create gathering container
  gatheringContainer = document.createElement('div');
  gatheringContainer.id = 'gathering-container';
  gatheringContainer.style.display = 'none';
  document.querySelector('.canvas-container').after(gatheringContainer);
  
  // Set up mode buttons
  document.getElementById('gatheringModeBtn').addEventListener('click', () => {
    handleModeChange('gathering');
  });
  
  document.getElementById('simModeBtn').addEventListener('click', () => {
    handleModeChange('sim');
  });
  
  document.getElementById('rpgModeBtn').addEventListener('click', () => {
    handleModeChange('rpg');
  });
  
  // Show intro screen first
  if (!state.gameStarted) {
    const SCREEN_TRANSITION_DELAY = 500;
    const beginButton = showIntroScreen();
    beginButton.addEventListener('click', () => {
      hideIntroScreen();
      setTimeout(() => {
        showSetupScreen((selectedResources) => {
          applyStartingResources(selectedResources, state);
          hideSetupScreen();
          state.gameStarted = true;
          state.mode = 'gathering'; // Start in gathering mode
          
          // Initialize gathering system
          gatheringSystem = new GatheringSystem(state);
          
          // Hide canvas, show gathering UI
          simCanvas.parentElement.style.display = 'none';
          gatheringContainer.style.display = 'block';
          renderGatheringUI(gatheringSystem, gatheringContainer);
          
          setMode('gathering');
          // Start animation loop after setup
          requestAnimationFrame(gameLoop);
        });
      }, SCREEN_TRANSITION_DELAY);
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
    gatheringContainer.style.display = 'none';
    simCanvas.parentElement.style.display = 'flex';
  } else if (mode === 'sim' && state.mode !== 'sim') {
    // Exiting RPG mode or switching to sim
    hideRPGUI();
    gatheringContainer.style.display = 'none';
    simCanvas.parentElement.style.display = 'flex';
  } else if (mode === 'gathering') {
    // Entering gathering mode
    if (!gatheringSystem) {
      gatheringSystem = new GatheringSystem(state);
    }
    hideRPGUI();
    simCanvas.parentElement.style.display = 'none';
    gatheringContainer.style.display = 'block';
    renderGatheringUI(gatheringSystem, gatheringContainer);
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
  } else if (state.mode === 'gathering') {
    // Run gathering mode
    const GATHERING_UPDATE_INTERVAL = 1000;
    if (deltaTime > GATHERING_UPDATE_INTERVAL) { // Update every second for passive effects
      tick();
      updateStatsDisplay();
    }
    // UI updates happen on click, no need to constantly re-render
  }
  
  requestAnimationFrame(gameLoop);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
