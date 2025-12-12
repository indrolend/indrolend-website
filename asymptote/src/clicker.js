// Idle Clicker Game - Core Logic

const SAVE_KEY = 'asymptote_clicker_save';
const AUTOSAVE_INTERVAL = 10000; // 10 seconds

// Generator definitions - Teaching Framework Concepts
const GENERATORS = [
  {
    id: 'contemplation',
    name: 'Brain Squisher',
    baseCost: 10,
    baseProduction: 0.1,
    costMultiplier: 1.15,
    description: 'OK so like... you squish the BIG thing into a small thing that FITS in your head, yeah?',
    concept: '*gestures wildly* DENSITY'
  },
  {
    id: 'meditation',
    name: 'The Copy Machine',
    baseCost: 50,
    baseProduction: 1,
    costMultiplier: 1.15,
    description: 'Dude you just copy the VIBES that work. Forget the rest. Bootleg reality baby.',
    concept: 'wait no—EMULATION'
  },
  {
    id: 'study',
    name: 'Layer Cake',
    baseCost: 250,
    baseProduction: 5,
    costMultiplier: 1.15,
    description: 'It stacks bro. Layers on layers on... *counts on fingers* ...MORE layers.',
    concept: 'complexity hides itself!!!'
  },
  {
    id: 'research',
    name: 'The Last Step',
    baseCost: 1000,
    baseProduction: 25,
    costMultiplier: 1.15,
    description: 'The LAST bit is what kills you. Or saves you. The edge man, THE EDGE.',
    concept: 'last mile principle *taps head*'
  },
  {
    id: 'analysis',
    name: 'Infinite Loop',
    baseCost: 5000,
    baseProduction: 100,
    costMultiplier: 1.15,
    description: 'Copy the copy of the COPY—it goes BRRRR but you drift from what\'s real...',
    concept: 'recursion babyyyy'
  },
  {
    id: 'synthesis',
    name: 'Frozen Choice',
    baseCost: 25000,
    baseProduction: 500,
    costMultiplier: 1.15,
    description: 'When choices become the FLOOR you walk on. They ain\'t choices no more.',
    concept: 'path dependence or whatever'
  },
  {
    id: 'revelation',
    name: 'Slow Then BOOM',
    baseCost: 100000,
    baseProduction: 2500,
    costMultiplier: 1.15,
    description: 'Nothing nothing nothing then WHAM. Exponential stuff. Sneaky curves.',
    concept: 'delayed effects *makes explosion sound*'
  },
  {
    id: 'transcendence',
    name: 'Brain Limit',
    baseCost: 500000,
    baseProduction: 10000,
    costMultiplier: 1.15,
    description: 'Where your brain CAN\'T compress anymore—that\'s where meaning LIVES dude.',
    concept: 'the EDGE. the asymptote. *chef kiss*'
  }
];

// Upgrade definitions - Framework Concepts as Narrative Devices
const UPGRADES = [
  {
    id: 'click2x',
    name: 'Chunking',
    cost: 100,
    effect: (game) => game.clickPower *= 2,
    description: '2x clicks. You stop the FLOW and make it CHUNKS.',
    narrative: 'patterns r objects now not streams'
  },
  {
    id: 'click5x',
    name: 'Focus Mode',
    cost: 1000,
    effect: (game) => game.clickPower *= 2.5,
    description: '2.5x clicks. Limited attention so you GOTTA pick what matters bro.',
    narrative: 'ignore the BS. focus.',
    requires: 'click2x'
  },
  {
    id: 'click10x',
    name: 'Constraints',
    cost: 10000,
    effect: (game) => game.clickPower *= 2,
    description: '2x clicks. Your limits aren\'t bugs—they\'re FEATURES man.',
    narrative: 'constraints = action. wild right?',
    requires: 'click5x'
  },
  {
    id: 'gen2x',
    name: 'Network Effect',
    cost: 500,
    effect: (game) => game.productionMultiplier *= 2,
    description: '2x production. Everyone copies reality DIFFERENTLY. Squad up.',
    narrative: 'you need the SQUAD for scale'
  },
  {
    id: 'gen4x',
    name: 'Move Fast',
    cost: 5000,
    effect: (game) => game.productionMultiplier *= 2,
    description: '2x production. Speed beats perfect. Errors are FINE.',
    narrative: 'speed > perfection trust me',
    requires: 'gen2x'
  },
  {
    id: 'autocollect',
    name: 'Abundance Mode',
    cost: 2500,
    effect: (game) => game.autoCollect = true,
    description: 'Auto-collect. When you got PLENTY, failures don\'t matter.',
    narrative: 'upstream abundance = chill errors'
  },
  {
    id: 'archaeologist',
    name: 'Dig It Up',
    cost: 15000,
    effect: (game) => game.archaeologyBonus = 1.5,
    description: '1.5x production. Dig up fossilized systems. Reverse engineer that shit.',
    narrative: 'old systems? optional limits now'
  },
  {
    id: 'volatility',
    name: 'Chaos Injection',
    cost: 30000,
    effect: (game) => game.volatilityMultiplier = 1.3,
    description: '1.3x production. Humans don\'t AVERAGE out—we COMPOUND.',
    narrative: 'sync. trend. mutate. COMPOUND.'
  },
  {
    id: 'leapfrog',
    name: 'Skip Levels',
    cost: 75000,
    effect: (game) => game.leapfrogBonus = 2.0,
    description: '2x production. Change the LAYER. Don\'t grind the same one forever dude.',
    narrative: 'discontinuous jumps. max leverage.'
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
