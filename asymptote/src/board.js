// Simplified Risk/Catan-style board game

const HEX_SIZE = 40;
const HEX_COLS = 7;
const HEX_ROWS = 7;

const RESOURCE_TYPES = ['wood', 'stone', 'food', 'metal'];
const RESOURCE_COLORS = {
  wood: '#8B4513',
  stone: '#808080',
  food: '#FFD700',
  metal: '#C0C0C0'
};

const RESOURCE_ICONS = {
  wood: '🌲',
  stone: '🪨',
  food: '🌾',
  metal: '⛏️'
};

export class BoardGame {
  constructor(startingResources) {
    this.hexes = [];
    this.playerResources = {
      wood: startingResources.wood ? 10 : 0,
      stone: startingResources.stone ? 10 : 0,
      food: startingResources.food ? 10 : 0,
      metal: startingResources.metal ? 10 : 0
    };
    this.playerTerritories = [];
    this.enemyTerritories = [];
    this.turn = 1;
    this.phase = 'gather'; // gather, build, expand, attack, end
    this.selectedHex = null;
    this.population = 10;
    this.army = 0;
    
    this.initializeBoard();
  }
  
  initializeBoard() {
    // Create hexagonal grid
    for (let row = 0; row < HEX_ROWS; row++) {
      for (let col = 0; col < HEX_COLS; col++) {
        const hex = {
          row,
          col,
          x: this.getHexX(col, row),
          y: this.getHexY(row),
          resource: RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)],
          owner: 'neutral', // player, enemy, neutral
          buildingLevel: 0, // 0-3
          productionBonus: Math.floor(Math.random() * 3) + 1 // 1-3
        };
        
        // Player starts in center
        if (row === 3 && col === 3) {
          hex.owner = 'player';
          hex.buildingLevel = 1;
          this.playerTerritories.push(hex);
        }
        
        // Enemy starts in corners
        if ((row === 0 && col === 0) || (row === 0 && col === 6) ||
            (row === 6 && col === 0) || (row === 6 && col === 6)) {
          hex.owner = 'enemy';
          hex.buildingLevel = 1;
          this.enemyTerritories.push(hex);
        }
        
        this.hexes.push(hex);
      }
    }
  }
  
  getHexX(col, row) {
    return col * (HEX_SIZE * 1.5) + (row % 2) * (HEX_SIZE * 0.75);
  }
  
  getHexY(row) {
    return row * (HEX_SIZE * Math.sqrt(3) / 2);
  }
  
  getHexAt(x, y) {
    // Find hex at mouse position
    for (const hex of this.hexes) {
      const dx = x - hex.x;
      const dy = y - hex.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < HEX_SIZE) {
        return hex;
      }
    }
    return null;
  }
  
  gather() {
    // Collect resources from owned territories
    let collected = {wood: 0, stone: 0, food: 0, metal: 0};
    
    for (const hex of this.playerTerritories) {
      const amount = hex.productionBonus * (hex.buildingLevel + 1);
      collected[hex.resource] += amount;
    }
    
    this.playerResources.wood += collected.wood;
    this.playerResources.stone += collected.stone;
    this.playerResources.food += collected.food;
    this.playerResources.metal += collected.metal;
    
    return collected;
  }
  
  canBuild(hex) {
    if (hex.owner !== 'player') return false;
    if (hex.buildingLevel >= 3) return false;
    
    const cost = this.getBuildCost(hex.buildingLevel + 1);
    return this.hasResources(cost);
  }
  
  getBuildCost(level) {
    return {
      wood: level * 5,
      stone: level * 5,
      food: level * 2,
      metal: level * 2
    };
  }
  
  build(hex) {
    if (!this.canBuild(hex)) return false;
    
    const cost = this.getBuildCost(hex.buildingLevel + 1);
    this.spendResources(cost);
    hex.buildingLevel++;
    this.population += 5;
    
    return true;
  }
  
  canExpand(hex) {
    if (hex.owner !== 'neutral') return false;
    
    // Check if adjacent to player territory
    const neighbors = this.getNeighbors(hex);
    const hasPlayerNeighbor = neighbors.some(n => n.owner === 'player');
    
    if (!hasPlayerNeighbor) return false;
    
    const cost = {wood: 10, stone: 5, food: 5, metal: 0};
    return this.hasResources(cost);
  }
  
  expand(hex) {
    if (!this.canExpand(hex)) return false;
    
    const cost = {wood: 10, stone: 5, food: 5, metal: 0};
    this.spendResources(cost);
    hex.owner = 'player';
    hex.buildingLevel = 0;
    this.playerTerritories.push(hex);
    
    return true;
  }
  
  canAttack(hex) {
    if (hex.owner !== 'enemy') return false;
    
    // Check if adjacent to player territory
    const neighbors = this.getNeighbors(hex);
    const hasPlayerNeighbor = neighbors.some(n => n.owner === 'player');
    
    if (!hasPlayerNeighbor) return false;
    
    // Need army to attack
    return this.army >= 1;
  }
  
  attack(hex) {
    if (!this.canAttack(hex)) return false;
    
    // Simple dice roll combat
    const playerStrength = Math.random() * this.army;
    const enemyStrength = Math.random() * hex.buildingLevel * 10;
    
    this.army--; // Lose one army unit
    
    if (playerStrength > enemyStrength) {
      // Victory
      hex.owner = 'player';
      hex.buildingLevel = Math.max(0, hex.buildingLevel - 1);
      this.playerTerritories.push(hex);
      this.enemyTerritories = this.enemyTerritories.filter(h => h !== hex);
      return {success: true, message: 'Victory! Territory captured!'};
    } else {
      // Defeat
      return {success: false, message: 'Defeat! Army lost.'};
    }
  }
  
  recruitArmy() {
    const cost = {wood: 0, stone: 0, food: 10, metal: 10};
    if (this.hasResources(cost)) {
      this.spendResources(cost);
      this.army++;
      return true;
    }
    return false;
  }
  
  getNeighbors(hex) {
    const neighbors = [];
    const offsets = [
      [-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]
    ];
    
    for (const [dr, dc] of offsets) {
      const newRow = hex.row + dr;
      const newCol = hex.col + dc;
      const neighbor = this.hexes.find(h => h.row === newRow && h.col === newCol);
      if (neighbor) neighbors.push(neighbor);
    }
    
    return neighbors;
  }
  
  hasResources(cost) {
    return this.playerResources.wood >= cost.wood &&
           this.playerResources.stone >= cost.stone &&
           this.playerResources.food >= cost.food &&
           this.playerResources.metal >= cost.metal;
  }
  
  spendResources(cost) {
    this.playerResources.wood -= cost.wood;
    this.playerResources.stone -= cost.stone;
    this.playerResources.food -= cost.food;
    this.playerResources.metal -= cost.metal;
  }
  
  enemyTurn() {
    // Simple AI: expand to neutral territories or build
    const neutralNeighbors = [];
    
    for (const hex of this.enemyTerritories) {
      const neighbors = this.getNeighbors(hex);
      for (const n of neighbors) {
        if (n.owner === 'neutral' && !neutralNeighbors.includes(n)) {
          neutralNeighbors.push(n);
        }
      }
    }
    
    if (neutralNeighbors.length > 0 && Math.random() > 0.3) {
      // Expand
      const target = neutralNeighbors[Math.floor(Math.random() * neutralNeighbors.length)];
      target.owner = 'enemy';
      target.buildingLevel = 0;
      this.enemyTerritories.push(target);
    } else if (this.enemyTerritories.length > 0) {
      // Build
      const target = this.enemyTerritories[Math.floor(Math.random() * this.enemyTerritories.length)];
      if (target.buildingLevel < 3) {
        target.buildingLevel++;
      }
    }
  }
  
  nextTurn() {
    this.turn++;
    this.enemyTurn();
    
    // Auto-gather at start of turn
    return this.gather();
  }
  
  checkWinCondition() {
    const totalHexes = this.hexes.length;
    const playerPercent = this.playerTerritories.length / totalHexes;
    
    if (playerPercent >= 0.6) {
      return {won: true, reason: 'Territory Control: 60% of map conquered!'};
    }
    
    if (this.population >= 100) {
      return {won: true, reason: 'Population Victory: 100 citizens reached!'};
    }
    
    if (this.turn >= 50) {
      return {won: true, reason: 'Survival Victory: Survived 50 turns!'};
    }
    
    // Check if player lost all territories
    if (this.playerTerritories.length === 0) {
      return {won: false, reason: 'Defeat: Lost all territories.'};
    }
    
    return null;
  }
}

export function renderBoard(board, canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Center the board
  ctx.save();
  ctx.translate(100, 50);
  
  // Draw hexes
  for (const hex of board.hexes) {
    drawHex(ctx, hex, hex === board.selectedHex);
  }
  
  ctx.restore();
  
  // Draw UI
  drawUI(ctx, board, canvas);
}

function drawHex(ctx, hex, isSelected) {
  ctx.save();
  ctx.translate(hex.x, hex.y);
  
  // Hex shape
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = HEX_SIZE * Math.cos(angle);
    const y = HEX_SIZE * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  
  // Fill based on owner
  if (hex.owner === 'player') {
    ctx.fillStyle = '#00ff0030';
  } else if (hex.owner === 'enemy') {
    ctx.fillStyle = '#ff000030';
  } else {
    ctx.fillStyle = '#88888820';
  }
  ctx.fill();
  
  // Border
  ctx.strokeStyle = isSelected ? '#ffffff' : RESOURCE_COLORS[hex.resource];
  ctx.lineWidth = isSelected ? 3 : 1;
  ctx.stroke();
  
  // Resource icon
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(RESOURCE_ICONS[hex.resource], 0, -10);
  
  // Building level
  if (hex.buildingLevel > 0) {
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('★'.repeat(hex.buildingLevel), 0, 10);
  }
  
  ctx.restore();
}

function drawUI(ctx, board, canvas) {
  // Resources
  ctx.fillStyle = '#0f0';
  ctx.font = '16px "EB Garamond", serif';
  ctx.textAlign = 'left';
  
  let y = 20;
  ctx.fillText(`Turn: ${board.turn}`, 10, y);
  y += 25;
  ctx.fillText(`Population: ${board.population}`, 10, y);
  y += 25;
  ctx.fillText(`Army: ${board.army}`, 10, y);
  y += 30;
  
  for (const [resource, amount] of Object.entries(board.playerResources)) {
    ctx.fillText(`${RESOURCE_ICONS[resource]} ${amount}`, 10, y);
    y += 25;
  }
  
  // Progress
  y += 20;
  const territoryPercent = Math.floor((board.playerTerritories.length / board.hexes.length) * 100);
  ctx.fillText(`Territory: ${territoryPercent}% (need 60%)`, 10, y);
  
  // Instructions
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0a0';
  ctx.font = '14px Arial';
  let instrY = canvas.height - 80;
  ctx.fillText('Click hex to select', canvas.width - 10, instrY);
  instrY += 20;
  ctx.fillText('Blue = Yours, Red = Enemy', canvas.width - 10, instrY);
}
