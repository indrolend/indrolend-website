// Simplified main.js for Risk/Catan-style board game
import { showIntroScreen, hideIntroScreen, showSetupScreen, hideSetupScreen } from './intro.js';
import { BoardGame, renderBoard } from './board.js';

let board = null;
let canvas, ctx;
let actionButtons = {};

function init() {
  canvas = document.getElementById('sim-canvas');
  ctx = canvas.getContext('2d');
  
  // Hide other mode buttons for now (simplified version)
  document.getElementById('gatheringModeBtn').style.display = 'none';
  document.getElementById('rpgModeBtn').style.display = 'none';
  document.getElementById('simModeBtn').textContent = 'Board Game';
  
  // Hide sliders and narrative (not needed for board game)
  document.querySelector('.controls').style.display = 'none';
  document.getElementById('narrative').style.display = 'none';
  
  // Create action buttons
  createActionButtons();
  
  // Check if intro has been shown before
  const hasSeenIntro = localStorage.getItem('asymptote_intro_shown');
  
  // Show intro screen only on first boot
  if (!hasSeenIntro) {
    const SCREEN_TRANSITION_DELAY = 500;
    const beginButton = showIntroScreen();
    beginButton.addEventListener('click', () => {
      hideIntroScreen();
      localStorage.setItem('asymptote_intro_shown', 'true');
      setTimeout(() => {
        showSetupScreen((selectedResources) => {
          hideSetupScreen();
          startGame(selectedResources);
        });
      }, SCREEN_TRANSITION_DELAY);
    });
  } else {
    // Skip intro, go directly to setup
    showSetupScreen((selectedResources) => {
      hideSetupScreen();
      startGame(selectedResources);
    });
  }
  
  // Canvas click handler
  canvas.addEventListener('click', handleCanvasClick);
}

function startGame(selectedResources) {
  // Convert selected resources array to object
  const resourceObj = {
    wood: selectedResources.includes('wood'),
    stone: selectedResources.includes('stone'),
    food: selectedResources.includes('food'),
    metal: selectedResources.includes('metal')
  };
  
  board = new BoardGame(resourceObj);
  
  // Initial gather
  const collected = board.gather();
  showMessage(`Game started! Collected: ${formatResources(collected)}`);
  
  // Start render loop
  renderLoop();
}

function createActionButtons() {
  const container = document.createElement('div');
  container.id = 'board-actions';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 100;
    flex-wrap: wrap;
    justify-content: center;
  `;
  
  const actions = [
    {id: 'build', text: '🏗️ Build', tooltip: 'Upgrade selected territory'},
    {id: 'expand', text: '📍 Expand', tooltip: 'Claim adjacent neutral hex'},
    {id: 'attack', text: '⚔️ Attack', tooltip: 'Attack adjacent enemy hex'},
    {id: 'army', text: '🛡️ Recruit Army', tooltip: 'Cost: 10 Food, 10 Metal'},
    {id: 'endTurn', text: '⏭️ End Turn', tooltip: 'Pass turn to enemy'}
  ];
  
  for (const action of actions) {
    const btn = document.createElement('button');
    btn.id = `action-${action.id}`;
    btn.className = 'board-action-btn';
    btn.textContent = action.text;
    btn.title = action.tooltip;
    btn.addEventListener('click', () => handleAction(action.id));
    container.appendChild(btn);
    actionButtons[action.id] = btn;
  }
  
  document.body.appendChild(container);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .board-action-btn {
      padding: 12px 20px;
      background-color: #001a00;
      color: #0f0;
      border: 2px solid #0f0;
      cursor: pointer;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1rem;
      transition: all 0.2s;
      border-radius: 4px;
    }
    .board-action-btn:hover {
      background-color: #0f0;
      color: #000;
      transform: scale(1.05);
    }
    .board-action-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
    #message-box {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #001a00;
      color: #0f0;
      border: 2px solid #0f0;
      padding: 15px 30px;
      z-index: 1000;
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1.1rem;
      border-radius: 4px;
      max-width: 80%;
      text-align: center;
    }
  `;
  document.head.appendChild(style);
}

function handleCanvasClick(event) {
  if (!board) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - 100; // Account for board offset
  const y = event.clientY - rect.top - 50;
  
  const hex = board.getHexAt(x, y);
  if (hex) {
    board.selectedHex = hex;
    updateActionButtons();
  }
}

function handleAction(actionId) {
  if (!board || !board.selectedHex) {
    showMessage('Please select a hex first!');
    return;
  }
  
  const hex = board.selectedHex;
  let result;
  
  switch (actionId) {
    case 'build':
      if (board.build(hex)) {
        showMessage(`Built level ${hex.buildingLevel} structure! +5 population`);
      } else {
        showMessage('Cannot build here. Need resources or max level reached.');
      }
      break;
      
    case 'expand':
      if (board.expand(hex)) {
        showMessage('Territory expanded! New hex claimed.');
      } else {
        showMessage('Cannot expand here. Need adjacent neutral hex and resources.');
      }
      break;
      
    case 'attack':
      result = board.attack(hex);
      if (result) {
        showMessage(result.message);
        checkWinCondition();
      } else {
        showMessage('Cannot attack here. Need adjacent enemy hex and army.');
      }
      break;
      
    case 'army':
      if (board.recruitArmy()) {
        showMessage(`Army recruited! Total: ${board.army}`);
      } else {
        showMessage('Not enough resources! Need: 10 Food, 10 Metal');
      }
      break;
      
    case 'endTurn':
      const collected = board.nextTurn();
      showMessage(`Turn ${board.turn} - Collected: ${formatResources(collected)}`);
      checkWinCondition();
      break;
  }
  
  updateActionButtons();
}

function updateActionButtons() {
  if (!board || !board.selectedHex) {
    for (const btn of Object.values(actionButtons)) {
      btn.disabled = true;
    }
    return;
  }
  
  const hex = board.selectedHex;
  
  actionButtons.build.disabled = !board.canBuild(hex);
  actionButtons.expand.disabled = !board.canExpand(hex);
  actionButtons.attack.disabled = !board.canAttack(hex);
  actionButtons.army.disabled = board.playerResources.food < 10 || board.playerResources.metal < 10;
  actionButtons.endTurn.disabled = false;
}

function checkWinCondition() {
  const result = board.checkWinCondition();
  if (result) {
    if (result.won) {
      showMessage(`🎉 VICTORY! ${result.reason}`, 10000);
      // Disable all buttons
      for (const btn of Object.values(actionButtons)) {
        btn.disabled = true;
      }
    } else {
      showMessage(`💀 DEFEAT! ${result.reason}`, 10000);
      // Disable all buttons
      for (const btn of Object.values(actionButtons)) {
        btn.disabled = true;
      }
    }
  }
}

function formatResources(resources) {
  const parts = [];
  for (const [type, amount] of Object.entries(resources)) {
    if (amount > 0) {
      const icons = {wood: '🌲', stone: '🪨', food: '🌾', metal: '⛏️'};
      parts.push(`${icons[type]}${amount}`);
    }
  }
  return parts.join(', ') || 'nothing';
}

function showMessage(text, duration = 3000) {
  let msgBox = document.getElementById('message-box');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'message-box';
    document.body.appendChild(msgBox);
  }
  
  msgBox.textContent = text;
  msgBox.style.display = 'block';
  
  setTimeout(() => {
    msgBox.style.display = 'none';
  }, duration);
}

function renderLoop() {
  if (board) {
    renderBoard(board, canvas, ctx);
  }
  requestAnimationFrame(renderLoop);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
