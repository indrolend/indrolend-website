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
    description: 'Bro you gotta squish down the crazy universe into stuff that actually fits in your head. Reality → brain-sized chunks.',
    concept: 'DENSITY & COMPRESSION'
  },
  {
    id: 'meditation',
    name: 'Bootleg Reality',
    baseCost: 50,
    baseProduction: 1,
    costMultiplier: 1.15,
    description: 'You\'re not a mirror dude, you\'re a knockoff. Just copy the vibes that matter, forget the rest.',
    concept: 'EMULATION STACKS'
  },
  {
    id: 'study',
    name: 'Layer Cake',
    baseCost: 250,
    baseProduction: 5,
    costMultiplier: 1.15,
    description: 'Everything grows layers on layers on layers. It gets so complex it has to hide itself or you\'d lose your mind.',
    concept: 'HIDDEN COMPLEXITY'
  },
  {
    id: 'research',
    name: 'Final Boss',
    baseCost: 1000,
    baseProduction: 25,
    costMultiplier: 1.15,
    description: 'The last step can kill the whole chain. The edge is what actually counts, not all the prep.',
    concept: 'LAST-MILE PRINCIPLE'
  },
  {
    id: 'analysis',
    name: 'Infinite Loop',
    baseCost: 5000,
    baseProduction: 100,
    costMultiplier: 1.15,
    description: 'Copying the copy of the copy. Power goes BRRRR but you might drift from what\'s actually real.',
    concept: 'RECURSIVE POWER'
  },
  {
    id: 'synthesis',
    name: 'Set In Stone',
    baseCost: 25000,
    baseProduction: 500,
    costMultiplier: 1.15,
    description: 'When choices become infrastructure they stop feeling like choices. That\'s just how it is now.',
    concept: 'FROZEN DECISIONS'
  },
  {
    id: 'revelation',
    name: 'Slow Burn',
    baseCost: 100000,
    baseProduction: 2500,
    costMultiplier: 1.15,
    description: 'When you start out the effects are invisible. Later? BOOM. The curve sneaks up on you.',
    concept: 'DELAYED VISIBILITY'
  },
  {
    id: 'transcendence',
    name: 'Brain Limit',
    baseCost: 500000,
    baseProduction: 10000,
    costMultiplier: 1.15,
    description: 'Where your brain can\'t compress anymore, that\'s where meaning lives. The boundary of what you can handle.',
    concept: 'EDGE OF UNDERSTANDING'
  }
];

// Upgrade definitions - Framework Concepts as Narrative Devices
const UPGRADES = [
  {
    id: 'click2x',
    name: 'Chunk It Up',
    cost: 100,
    effect: (game) => game.clickPower *= 2,
    description: 'Stop the flow, make it chunks. Double your click power.',
    narrative: 'Damn dude, patterns are just objects now, not some endless stream.'
  },
  {
    id: 'click5x',
    name: 'Focus Mode',
    cost: 1000,
    effect: (game) => game.clickPower *= 2.5,
    description: 'Limited attention = you gotta pick what matters. Filter the noise.',
    narrative: 'Not everything is important bro. You\'re learning to ignore the BS.',
    requires: 'click2x'
  },
  {
    id: 'click10x',
    name: 'Built Different',
    cost: 10000,
    effect: (game) => game.clickPower *= 2,
    description: 'Your limits aren\'t bugs—they\'re features. Constraints let you DO stuff.',
    narrative: 'Your weaknesses are literally just good design. That\'s wild.',
    requires: 'click5x'
  },
  {
    id: 'gen2x',
    name: 'Squad Up',
    cost: 500,
    effect: (game) => game.productionMultiplier *= 2,
    description: 'Network effect baby. Everyone\'s copying reality differently.',
    narrative: 'You\'re not doing this alone. Scale needs the squad.'
  },
  {
    id: 'gen4x',
    name: 'Move Fast',
    cost: 5000,
    effect: (game) => game.productionMultiplier *= 2,
    description: 'At scale, speed > perfection. Errors are fine.',
    narrative: 'Sometimes being perfect costs more than just vibing with mistakes.',
    requires: 'gen2x'
  },
  {
    id: 'autocollect',
    name: 'Abundance Go Brrr',
    cost: 2500,
    effect: (game) => game.autoCollect = true,
    description: 'When you got plenty, edge failures don\'t matter. Auto-collect when offline.',
    narrative: 'When upstream is stacked, downstream can be chill about errors.'
  },
  {
    id: 'archaeologist',
    name: 'Dig Mode',
    cost: 15000,
    effect: (game) => game.archaeologyBonus = 1.5,
    description: 'Dig up old fossilized systems. See what\'s ACTUALLY there.',
    narrative: 'Old systems can be reverse engineered. Their limits? Optional now.'
  },
  {
    id: 'volatility',
    name: 'Chaos Mode',
    cost: 30000,
    effect: (game) => game.volatilityMultiplier = 1.3,
    description: 'Humans are the wildcard. Inject controlled chaos.',
    narrative: 'You don\'t average out bro. You sync, trend, mutate, COMPOUND.'
  },
  {
    id: 'leapfrog',
    name: 'Skip Levels',
    cost: 75000,
    effect: (game) => game.leapfrogBonus = 2.0,
    description: 'Change the layer, don\'t grind the same one. Skip obsolete stuff.',
    narrative: 'Discontinuous jumps baby. Put effort where the leverage is MAXIMUM.'
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
