// Resource gathering system (Minecraft-style)

// Configuration constants
const RESPAWN_DELAY_MS = 10000;
const COLLECTION_ANIMATION_MS = 150;

const RESOURCE_TYPES = {
  wood: {
    name: 'Wood',
    durability: 100,
    clicksNeeded: 20,
    color: '#8B4513',
    icon: '🌲'
  },
  stone: {
    name: 'Stone',
    durability: 150,
    clicksNeeded: 30,
    color: '#808080',
    icon: '🪨'
  },
  food: {
    name: 'Food',
    durability: 80,
    clicksNeeded: 15,
    color: '#FFD700',
    icon: '🌾'
  },
  metal: {
    name: 'Metal',
    durability: 200,
    clicksNeeded: 40,
    color: '#C0C0C0',
    icon: '⛏️'
  }
};

export class GatheringSystem {
  constructor(state) {
    this.state = state;
    this.inventory = {
      wood: 0,
      stone: 0,
      food: 0,
      metal: 0
    };
    
    this.activeNodes = {};
    this.initializeNodes();
  }
  
  initializeNodes() {
    for (const [type, config] of Object.entries(RESOURCE_TYPES)) {
      this.activeNodes[type] = {
        progress: 0,
        durability: config.durability,
        available: true
      };
    }
  }
  
  clickResource(resourceType) {
    const node = this.activeNodes[resourceType];
    const config = RESOURCE_TYPES[resourceType];
    
    if (!node || !node.available) return false;
    
    // Increment progress
    node.progress += (100 / config.clicksNeeded);
    
    // Check if resource is fully gathered
    if (node.progress >= 100) {
      this.collectResource(resourceType);
      node.progress = 0;
      
      // Reduce durability
      node.durability -= 10;
      
      // Check if node is depleted
      if (node.durability <= 0) {
        node.available = false;
        setTimeout(() => {
          this.respawnNode(resourceType);
        }, RESPAWN_DELAY_MS);
      }
      
      return true;
    }
    
    return false;
  }
  
  collectResource(resourceType) {
    this.inventory[resourceType]++;
    
    // Apply resource effects to civilization state
    switch (resourceType) {
      case 'wood':
        this.state.F = Math.min(this.state.F + 0.02, 1.0);
        this.state.P += 10;
        break;
      case 'stone':
        this.state.F = Math.min(this.state.F + 0.03, 1.0);
        this.state.C += 0.02;
        break;
      case 'food':
        this.state.H = Math.min(this.state.H + 0.03, 1.0);
        this.state.P += 15;
        this.state.R += 0.2;
        break;
      case 'metal':
        this.state.K += 0.02;
        this.state.C += 0.03;
        break;
    }
  }
  
  respawnNode(resourceType) {
    const config = RESOURCE_TYPES[resourceType];
    this.activeNodes[resourceType] = {
      progress: 0,
      durability: config.durability,
      available: true
    };
  }
  
  getInventory() {
    return this.inventory;
  }
  
  getNodeState(resourceType) {
    return this.activeNodes[resourceType];
  }
  
  getAllNodes() {
    return this.activeNodes;
  }
}

export function renderGatheringUI(gatheringSystem, container) {
  // Clear container
  container.innerHTML = '';
  
  // Create inventory display
  const inventoryDiv = document.createElement('div');
  inventoryDiv.className = 'inventory-display';
  inventoryDiv.innerHTML = '<h3>Inventory</h3>';
  
  const inventoryItems = document.createElement('div');
  inventoryItems.className = 'inventory-items';
  
  const inventory = gatheringSystem.getInventory();
  for (const [type, count] of Object.entries(inventory)) {
    const config = RESOURCE_TYPES[type];
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.innerHTML = `${config.icon} <span>${config.name}:</span> ${count}`;
    inventoryItems.appendChild(item);
  }
  
  inventoryDiv.appendChild(inventoryItems);
  container.appendChild(inventoryDiv);
  
  // Create resource nodes grid
  const resourcesGrid = document.createElement('div');
  resourcesGrid.className = 'resources-grid';
  
  const nodes = gatheringSystem.getAllNodes();
  for (const [type, nodeState] of Object.entries(nodes)) {
    const config = RESOURCE_TYPES[type];
    
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'resource-node';
    nodeDiv.dataset.type = type;
    
    if (!nodeState.available) {
      nodeDiv.classList.add('depleted');
      nodeDiv.style.opacity = '0.3';
      nodeDiv.style.cursor = 'not-allowed';
    }
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'resource-name';
    nameDiv.textContent = `${config.icon} ${config.name}`;
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'resource-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'resource-progress-bar';
    progressBar.style.width = `${nodeState.progress}%`;
    
    progressContainer.appendChild(progressBar);
    
    const countDiv = document.createElement('div');
    countDiv.className = 'resource-count';
    countDiv.textContent = `Durability: ${nodeState.durability}/${config.durability}`;
    
    nodeDiv.appendChild(nameDiv);
    nodeDiv.appendChild(progressContainer);
    nodeDiv.appendChild(countDiv);
    
    // Add click handler
    if (nodeState.available) {
      nodeDiv.addEventListener('click', () => {
        const collected = gatheringSystem.clickResource(type);
        // Re-render to update UI
        renderGatheringUI(gatheringSystem, container);
        
        if (collected) {
          // Add visual feedback
          nodeDiv.style.transform = 'scale(1.1)';
          setTimeout(() => {
            nodeDiv.style.transform = '';
          }, COLLECTION_ANIMATION_MS);
        }
      });
    }
    
    resourcesGrid.appendChild(nodeDiv);
  }
  
  container.appendChild(resourcesGrid);
  
  // Add instructions
  const instructions = document.createElement('div');
  instructions.style.textAlign = 'center';
  instructions.style.marginTop = '20px';
  instructions.style.color = '#0a0';
  instructions.innerHTML = '<p>Click resources to gather them. Resources respawn after 10 seconds when depleted.</p>';
  container.appendChild(instructions);
}
