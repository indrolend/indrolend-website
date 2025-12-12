// Idle Clicker Game - Core Logic

const SAVE_KEY = 'asymptote_clicker_save';
const AUTOSAVE_INTERVAL = 10000; // 10 seconds

// Generator definitions - Teaching Framework Concepts
const GENERATORS = [
  {
    id: 'contemplation',
    name: 'Compression',
    baseCost: 10,
    baseProduction: 0.1,
    costMultiplier: 1.15,
    description: 'Compress the dense universe into patterns you can hold. Reality → runnable model.',
    concept: 'DENSITY & COMPRESSION'
  },
  {
    id: 'meditation',
    name: 'Emulation',
    baseCost: 50,
    baseProduction: 1,
    costMultiplier: 1.15,
    description: 'You are an emulator, not a mirror. Recreate dynamics that matter, not underlying physics.',
    concept: 'EMULATION STACKS'
  },
  {
    id: 'study',
    name: 'Layering',
    baseCost: 250,
    baseProduction: 5,
    costMultiplier: 1.15,
    description: 'Systems grow layers. Abstraction upon abstraction. Complexity must hide itself to remain usable.',
    concept: 'HIDDEN COMPLEXITY'
  },
  {
    id: 'research',
    name: 'Last Mile',
    baseCost: 1000,
    baseProduction: 25,
    costMultiplier: 1.15,
    description: 'The final constraint can veto the entire upstream chain. Edges decide what "counts."',
    concept: 'LAST-MILE PRINCIPLE'
  },
  {
    id: 'analysis',
    name: 'Recursion',
    baseCost: 5000,
    baseProduction: 100,
    costMultiplier: 1.15,
    description: 'Emulators emulating emulators. Self-reference scales power but risks drift from ground truth.',
    concept: 'RECURSIVE POWER'
  },
  {
    id: 'synthesis',
    name: 'Fossilization',
    baseCost: 25000,
    baseProduction: 500,
    costMultiplier: 1.15,
    description: 'Decisions become infrastructure. Once a choice fossilizes, it stops being felt as choice.',
    concept: 'FROZEN DECISIONS'
  },
  {
    id: 'revelation',
    name: 'Compounding',
    baseCost: 100000,
    baseProduction: 2500,
    costMultiplier: 1.15,
    description: 'Impact is invisible when leverage is high (early). Visible when late. Curvature reveals slowly.',
    concept: 'DELAYED VISIBILITY'
  },
  {
    id: 'transcendence',
    name: 'Epistemic Edge',
    baseCost: 500000,
    baseProduction: 10000,
    costMultiplier: 1.15,
    description: 'Where compression fails, meaning begins. The boundary of the current emulator\'s capacity.',
    concept: 'EDGE OF UNDERSTANDING'
  }
];

// Upgrade definitions - Framework Concepts as Narrative Devices
const UPGRADES = [
  {
    id: 'click2x',
    name: 'Discretization',
    cost: 100,
    effect: (game) => game.clickPower *= 2,
    description: 'Turn continuous flow into discrete units. Double click power.',
    narrative: 'You begin to see patterns as objects, not flux.'
  },
  {
    id: 'click5x',
    name: 'Attention as Selection',
    cost: 1000,
    effect: (game) => game.clickPower *= 2.5,
    description: 'Limited attention = feature selection. Choose what matters.',
    narrative: 'Not all signals are equal. You learn to filter noise.',
    requires: 'click2x'
  },
  {
    id: 'click10x',
    name: 'Bounded Agency',
    cost: 10000,
    effect: (game) => game.clickPower *= 2,
    description: 'Finite minds require compression. Constraints enable action.',
    narrative: 'Your limitations are not weaknesses—they are design.',
    requires: 'click5x'
  },
  {
    id: 'gen2x',
    name: 'Distributed Modeling',
    cost: 500,
    effect: (game) => game.productionMultiplier *= 2,
    description: 'Society as networked emulators. Each subsystem compresses differently.',
    narrative: 'You are not alone. Systems scale through distribution.'
  },
  {
    id: 'gen4x',
    name: 'Velocity Over Correctness',
    cost: 5000,
    effect: (game) => game.productionMultiplier *= 2,
    description: 'At scale, speed matters more than perfect control. Tolerate errors.',
    narrative: 'Sometimes the cost of perfect control exceeds the cost of error.',
    requires: 'gen2x'
  },
  {
    id: 'autocollect',
    name: 'Abundance Permits Forgiveness',
    cost: 2500,
    effect: (game) => game.autoCollect = true,
    description: 'Efficient systems tolerate edge failures. Auto-collect offline gains.',
    narrative: 'When upstream is abundant, downstream can afford to be forgiving.'
  },
  {
    id: 'archaeologist',
    name: 'Archaeology Mode',
    cost: 15000,
    effect: (game) => game.archaeologyBonus = 1.5,
    description: 'Excavate fossilized abstractions. Reveal hidden assumptions.',
    narrative: 'Old systems can be decompiled. Their constraints are now visible—and optional.'
  },
  {
    id: 'volatility',
    name: 'Human Volatility',
    cost: 30000,
    effect: (game) => game.volatilityMultiplier = 1.3,
    description: 'Humans are the most volatile variable. Inject controlled chaos.',
    narrative: 'You do not average out. You synchronize, trend, mutate, compound.'
  },
  {
    id: 'leapfrog',
    name: 'Leapfrogging',
    cost: 75000,
    effect: (game) => game.leapfrogBonus = 2.0,
    description: 'Shift layers, don\'t speed within them. Bypass obsolete constraints.',
    narrative: 'Discontinuous change. You relocate effort where leverage is highest.'
  }
];

class ClickerGame {
  constructor() {
    this.understanding = 0;
    this.totalClicks = 0;
    this.clickPower = 1;
    this.productionMultiplier = 1;
    this.enlightenments = 0;
    this.autoCollect = false;
    this.archaeologyBonus = 1.0;
    this.volatilityMultiplier = 1.0;
    this.leapfrogBonus = 1.0;
    
    this.generators = {};
    for (const gen of GENERATORS) {
      this.generators[gen.id] = {
        count: 0,
        totalPurchased: 0
      };
    }
    
    this.upgrades = {};
    for (const upg of UPGRADES) {
      this.upgrades[upg.id] = {
        purchased: false
      };
    }
    
    this.lastSaveTime = Date.now();
    this.stats = {
      totalUnderstanding: 0,
      totalClicks: 0,
      totalGeneratorsPurchased: 0,
      gameStartTime: Date.now()
    };
  }
  
  click() {
    const amount = this.clickPower * this.getEnlightenmentBonus();
    this.understanding += amount;
    this.totalClicks++;
    this.stats.totalClicks++;
    this.stats.totalUnderstanding += amount;
    return amount;
  }
  
  getProductionPerSecond() {
    let total = 0;
    for (const genDef of GENERATORS) {
      const genData = this.generators[genDef.id];
      total += genData.count * genDef.baseProduction;
    }
    return total * this.productionMultiplier * this.getEnlightenmentBonus() * this.archaeologyBonus * this.volatilityMultiplier * this.leapfrogBonus;
  }
  
  getEnlightenmentBonus() {
    return 1 + (this.enlightenments * 0.1);
  }
  
  getGeneratorCost(generatorId) {
    const genDef = GENERATORS.find(g => g.id === generatorId);
    const genData = this.generators[generatorId];
    return Math.floor(genDef.baseCost * Math.pow(genDef.costMultiplier, genData.count));
  }
  
  canBuyGenerator(generatorId) {
    const cost = this.getGeneratorCost(generatorId);
    return this.understanding >= cost;
  }
  
  buyGenerator(generatorId) {
    const cost = this.getGeneratorCost(generatorId);
    if (!this.canBuyGenerator(generatorId)) return false;
    
    this.understanding -= cost;
    this.generators[generatorId].count++;
    this.generators[generatorId].totalPurchased++;
    this.stats.totalGeneratorsPurchased++;
    return true;
  }
  
  canBuyUpgrade(upgradeId) {
    const upgDef = UPGRADES.find(u => u.id === upgradeId);
    const upgData = this.upgrades[upgradeId];
    
    if (upgData.purchased) return false;
    if (this.understanding < upgDef.cost) return false;
    if (upgDef.requires && !this.upgrades[upgDef.requires].purchased) return false;
    
    return true;
  }
  
  buyUpgrade(upgradeId) {
    if (!this.canBuyUpgrade(upgradeId)) return false;
    
    const upgDef = UPGRADES.find(u => u.id === upgradeId);
    this.understanding -= upgDef.cost;
    this.upgrades[upgradeId].purchased = true;
    upgDef.effect(this);
    return true;
  }
  
  canEnlighten() {
    return this.understanding >= 1000;
  }
  
  enlighten() {
    if (!this.canEnlighten()) return false;
    
    this.enlightenments++;
    this.understanding = 0;
    
    // Reset generators
    for (const genId in this.generators) {
      this.generators[genId].count = 0;
    }
    
    // Keep upgrades purchased
    return true;
  }
  
  update(deltaTime) {
    // deltaTime in milliseconds
    const production = this.getProductionPerSecond() * (deltaTime / 1000);
    this.understanding += production;
    this.stats.totalUnderstanding += production;
  }
  
  save() {
    const saveData = {
      understanding: this.understanding,
      totalClicks: this.totalClicks,
      clickPower: this.clickPower,
      productionMultiplier: this.productionMultiplier,
      enlightenments: this.enlightenments,
      autoCollect: this.autoCollect,
      archaeologyBonus: this.archaeologyBonus,
      volatilityMultiplier: this.volatilityMultiplier,
      leapfrogBonus: this.leapfrogBonus,
      generators: this.generators,
      upgrades: this.upgrades,
      stats: this.stats,
      lastSaveTime: Date.now()
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }
  
  load() {
    const saveStr = localStorage.getItem(SAVE_KEY);
    if (!saveStr) return false;
    
    try {
      const saveData = JSON.parse(saveStr);
      
      this.understanding = saveData.understanding || 0;
      this.totalClicks = saveData.totalClicks || 0;
      this.enlightenments = saveData.enlightenments || 0;
      this.generators = saveData.generators || this.generators;
      this.upgrades = saveData.upgrades || this.upgrades;
      this.stats = saveData.stats || this.stats;
      
      // Reapply all purchased upgrades to restore clickPower and productionMultiplier
      this.clickPower = 1;
      this.productionMultiplier = 1;
      this.autoCollect = false;
      this.archaeologyBonus = 1.0;
      this.volatilityMultiplier = 1.0;
      this.leapfrogBonus = 1.0;
      
      for (const upgDef of UPGRADES) {
        if (this.upgrades[upgDef.id].purchased) {
          upgDef.effect(this);
        }
      }
      
      // Calculate offline progress
      if (this.autoCollect && saveData.lastSaveTime) {
        const offlineTime = Date.now() - saveData.lastSaveTime;
        const maxOfflineTime = 24 * 60 * 60 * 1000; // 24 hours
        const actualOfflineTime = Math.min(offlineTime, maxOfflineTime);
        
        const offlineProduction = this.getProductionPerSecond() * (actualOfflineTime / 1000);
        this.understanding += offlineProduction;
        
        return {
          offlineTime: actualOfflineTime,
          offlineProduction: offlineProduction
        };
      }
      
      return true;
    } catch (e) {
      console.error('Failed to load save:', e);
      return false;
    }
  }
  
  reset() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }
  }
}

export { ClickerGame, GENERATORS, UPGRADES };
