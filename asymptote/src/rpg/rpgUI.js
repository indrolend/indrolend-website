import { rpgState } from './rpgState.js';
import { getAvailableMoves } from './rpgMoves.js';
import { executePlayerMove } from './rpgLogic.js';

let moveButtons = [];

export function initRPGUI() {
  // This will be called when entering RPG mode
  // Move buttons are created dynamically
}

export function updateRPGUI() {
  // Get or create move buttons container
  let container = document.getElementById('rpg-moves-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'rpg-moves-container';
    container.className = 'rpg-ui';
    document.body.appendChild(container);
  }
  
  // Clear existing buttons
  container.innerHTML = '';
  
  // Get available moves
  const moves = getAvailableMoves();
  
  // Create buttons for each move
  moves.forEach(move => {
    const button = document.createElement('button');
    button.className = 'rpg-move-btn';
    button.textContent = move.name;
    button.title = move.description;
    
    // Disable if not player's turn or battle inactive
    button.disabled = rpgState.turn !== 'player' || !rpgState.battleActive;
    
    button.addEventListener('click', () => {
      if (rpgState.turn === 'player' && rpgState.battleActive) {
        executePlayerMove(move);
        updateRPGUI(); // Refresh UI after move
      }
    });
    
    container.appendChild(button);
  });
  
  // Show or hide based on mode
  if (rpgState.battleActive) {
    container.style.display = 'flex';
  } else {
    container.style.display = 'none';
  }
}

export function hideRPGUI() {
  const container = document.getElementById('rpg-moves-container');
  if (container) {
    container.style.display = 'none';
  }
}
