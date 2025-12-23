// Achievement system - Cookie Clicker inspired but with asymptote framework narrative
// Unlocked by performing certain actions, extends the narrative without being too on the nose

export const achievements = {
  // Gathering achievements
  first_click: {
    condition: (state) => {
      if (!state.gatheringStats) return false;
      const totalClicks = Object.values(state.gatheringStats.resourceClicks || {}).reduce((a, b) => a + b, 0);
      return totalClicks >= 1 && !state.unlockedAchievements?.first_click;
    },
    title: "Baby Steps",
    description: "Click your first resource",
    narrative: "Dude, you just COMPRESSED reality with your finger. That's wild."
  },
  
  gatherer_100: {
    condition: (state) => {
      if (!state.gatheringStats) return false;
      const totalGathered = Object.values(state.gatheringStats.resourcesCollected || {}).reduce((a, b) => a + b, 0);
      return totalGathered >= 100 && !state.unlockedAchievements?.gatherer_100;
    },
    title: "Hoarder Mode",
    description: "Collect 100 total resources",
    narrative: "You're not gathering—you're HOARDING approximations of reality. Nice."
  },
  
  wood_specialist: {
    condition: (state) => {
      if (!state.gatheringStats || !state.gatheringStats.resourcesCollected) return false;
      return state.gatheringStats.resourcesCollected.wood >= 50 && !state.unlockedAchievements?.wood_specialist;
    },
    title: "Tree Hugger",
    description: "Collect 50 wood",
    narrative: "Wood = structure = FRAMEWORK bro. You're literally building the foundation."
  },
  
  stone_specialist: {
    condition: (state) => {
      if (!state.gatheringStats || !state.gatheringStats.resourcesCollected) return false;
      return state.gatheringStats.resourcesCollected.stone >= 50 && !state.unlockedAchievements?.stone_specialist;
    },
    title: "Rock Solid",
    description: "Collect 50 stone",
    narrative: "Stone lasts FOREVER—fossilized decisions baby. That's permanence."
  },
  
  food_specialist: {
    condition: (state) => {
      if (!state.gatheringStats || !state.gatheringStats.resourcesCollected) return false;
      return state.gatheringStats.resourcesCollected.food >= 50 && !state.unlockedAchievements?.food_specialist;
    },
    title: "Calorie Counter",
    description: "Collect 50 food",
    narrative: "Thermodynamics don't care about your feelings. You need ENERGY to run the machine."
  },
  
  metal_specialist: {
    condition: (state) => {
      if (!state.gatheringStats || !state.gatheringStats.resourcesCollected) return false;
      return state.gatheringStats.resourcesCollected.metal >= 50 && !state.unlockedAchievements?.metal_specialist;
    },
    title: "Metal Head",
    description: "Collect 50 metal",
    narrative: "Tools are just EMULATIONS of natural processes. You're building the stack."
  },
  
  // Population achievements
  population_1000: {
    condition: (state) => state.P >= 1000 && !state.unlockedAchievements?.population_1000,
    title: "Squad Goals",
    description: "Reach 1,000 population",
    narrative: "More agents = distributed modeling. No single brain can hold it all."
  },
  
  population_5000: {
    condition: (state) => state.P >= 5000 && !state.unlockedAchievements?.population_5000,
    title: "Network Effect",
    description: "Reach 5,000 population",
    narrative: "Scale COMPOUNDS. Each new agent isn't additive—it's MULTIPLICATIVE."
  },
  
  // Sacrifice achievements (tick-related from clicker mode)
  sacrifice_1000: {
    condition: (state) => {
      if (!state.clickerStats) return false;
      return state.clickerStats.totalTicksSacrificed >= 1000 && !state.unlockedAchievements?.sacrifice_1000;
    },
    title: "Time Burner",
    description: "Sacrifice 1,000 ticks",
    narrative: "You traded TIME for UNDERSTANDING. That's the only trade that matters."
  },
  
  sacrifice_1000000: {
    condition: (state) => {
      if (!state.clickerStats) return false;
      return state.clickerStats.totalTicksSacrificed >= 1000000 && !state.unlockedAchievements?.sacrifice_1000000;
    },
    title: "Temporal Arsonist",
    description: "Sacrifice 1,000,000 ticks",
    narrative: "Bruh you're just BURNING time like it's infinite. Spoiler: it's not."
  },
  
  // Clicker/Generator achievements
  buy_100_generators: {
    condition: (state) => {
      if (!state.clickerStats) return false;
      return state.clickerStats.totalGeneratorsPurchased >= 100 && !state.unlockedAchievements?.buy_100_generators;
    },
    title: "Automation Nation",
    description: "Buy 100 generators",
    narrative: "You automated the compression. Now the SYSTEM approximates reality for you."
  },
  
  buy_500_generators: {
    condition: (state) => {
      if (!state.clickerStats) return false;
      return state.clickerStats.totalGeneratorsPurchased >= 500 && !state.unlockedAchievements?.buy_500_generators;
    },
    title: "Industrial Revolution",
    description: "Buy 500 generators",
    narrative: "Layers on layers on LAYERS. Complexity hiding itself behind interfaces."
  },
  
  first_temporal_collapse: {
    condition: (state) => {
      if (!state.clickerStats) return false;
      return state.clickerStats.totalTemporalCollapses >= 1 && !state.unlockedAchievements?.first_temporal_collapse;
    },
    title: "Restart From Scratch",
    description: "Perform your first temporal collapse",
    narrative: "You RESET but kept the lessons. That's called archaeology of your own decisions."
  },
  
  temporal_collapse_10: {
    condition: (state) => {
      if (!state.clickerStats) return false;
      return state.clickerStats.totalTemporalCollapses >= 10 && !state.unlockedAchievements?.temporal_collapse_10;
    },
    title: "Time Loop Addict",
    description: "Perform 10 temporal collapses",
    narrative: "Each loop you're leapfrogging LAYERS. Discontinuous progress baby."
  },
  
  // Time-based achievements
  play_time_10min: {
    condition: (state) => state.time >= 600 && !state.unlockedAchievements?.play_time_10min,
    title: "Just Getting Started",
    description: "Play for 10 minutes",
    narrative: "You stuck around. Most people bounce. Persistence IS the game."
  },
  
  play_time_1hour: {
    condition: (state) => state.time >= 3600 && !state.unlockedAchievements?.play_time_1hour,
    title: "Time Investment",
    description: "Play for 1 hour",
    narrative: "Compounding takes TIME. You can't rush exponential curves."
  },
  
  play_time_5hours: {
    condition: (state) => state.time >= 18000 && !state.unlockedAchievements?.play_time_5hours,
    title: "Committed to the Bit",
    description: "Play for 5 hours",
    narrative: "Dude you're IN IT now. Deep in the asymptotic approach."
  },
  
  // State achievements
  high_understanding: {
    condition: (state) => state.U >= 0.75 && !state.unlockedAchievements?.high_understanding,
    title: "Getting Close",
    description: "Reach 75% Understanding",
    narrative: "So CLOSE to 1.0 but you'll never get there. That's the asymptote baby."
  },
  
  high_meaning: {
    condition: (state) => state.M >= 0.8 && !state.unlockedAchievements?.high_meaning,
    title: "It Matters Now",
    description: "Reach 80% Meaning",
    narrative: "Meaning EMERGED from your bounded choices. You didn't find it—you BUILT it."
  },
  
  high_instability: {
    condition: (state) => state.I >= 0.8 && !state.unlockedAchievements?.high_instability,
    title: "Chaos Incarnate",
    description: "Reach 80% Instability",
    narrative: "Volatility compounds. Small deviations CASCADE. This is where change lives."
  },
  
  survive_high_instability: {
    condition: (state) => state.I >= 0.8 && state.H >= 0.6 && !state.unlockedAchievements?.survive_high_instability,
    title: "Dancing on the Edge",
    description: "Maintain 60% Health while at 80% Instability",
    narrative: "You're riding the chaos WITHOUT collapsing. That's high-wire MASTERY."
  },
  
  // Balance achievements
  perfect_balance: {
    condition: (state) => {
      const sliders = [state.sliders.science, state.sliders.art, state.sliders.faith];
      const diffs = sliders.map((v, i) => Math.abs(v - sliders[(i + 1) % 3]));
      return diffs.every(d => d < 0.05) && state.time > 300 && !state.unlockedAchievements?.perfect_balance;
    },
    title: "Zen Master",
    description: "Keep all sliders perfectly balanced for 5 minutes",
    narrative: "Distributed emulation. Each lens compresses reality DIFFERENTLY. Balance is power."
  },
  
  all_science: {
    condition: (state) => state.sliders.science >= 0.9 && state.time > 100 && !state.unlockedAchievements?.all_science,
    title: "Science Bro",
    description: "Go all-in on Science",
    narrative: "Pure LOGIC. Physical constraints emulated. Framework collapses but knowledge goes BRRR."
  },
  
  all_art: {
    condition: (state) => state.sliders.art >= 0.9 && state.time > 100 && !state.unlockedAchievements?.all_art,
    title: "Creative Genius",
    description: "Go all-in on Art",
    narrative: "Inner states > outer world. You're emulating MEANING not mechanics."
  },
  
  all_faith: {
    condition: (state) => state.sliders.faith >= 0.9 && state.time > 100 && !state.unlockedAchievements?.all_faith,
    title: "True Believer",
    description: "Go all-in on Faith",
    narrative: "Moral order. Framework MAXED. You're compressing reality through belief."
  },
  
  // Resource achievements
  abundant_resources: {
    condition: (state) => state.R >= 2.0 && !state.unlockedAchievements?.abundant_resources,
    title: "Resource King",
    description: "Reach 2.0 Resources",
    narrative: "Upstream abundance means downstream ERRORS don't matter. Slack is strategic."
  },
  
  resource_crisis: {
    condition: (state) => state.R <= 0.2 && state.H >= 0.5 && !state.unlockedAchievements?.resource_crisis,
    title: "Scarcity Survivor",
    description: "Survive with less than 0.2 Resources",
    narrative: "Constraints force FOCUS. Scarcity is the mother of invention bro."
  },
  
  // Complexity achievements
  high_complexity: {
    condition: (state) => state.C >= 0.8 && !state.unlockedAchievements?.high_complexity,
    title: "Complexity Cascade",
    description: "Reach 80% Complexity",
    narrative: "Layers so deep you can't perceive them. That's when INTERFACES become survival."
  },
  
  // RPG achievements
  rpg_first_battle: {
    condition: (state) => {
      if (!state.rpgStats) return false;
      return state.rpgStats.battlesWon >= 1 && !state.unlockedAchievements?.rpg_first_battle;
    },
    title: "Combat Ready",
    description: "Win your first RPG battle",
    narrative: "You just emulated CONFLICT resolution. Every system has adversarial dynamics."
  },
  
  rpg_win_10: {
    condition: (state) => {
      if (!state.rpgStats) return false;
      return state.rpgStats.battlesWon >= 10 && !state.unlockedAchievements?.rpg_win_10;
    },
    title: "Battle Hardened",
    description: "Win 10 RPG battles",
    narrative: "Pattern recognition = advantage. You learned the LOOP."
  },
  
  // Discovery achievements
  discover_5_fragments: {
    condition: (state) => {
      if (!state.discoveredFragments) return false;
      const count = Object.keys(state.discoveredFragments).filter(k => state.discoveredFragments[k]).length;
      return count >= 5 && !state.unlockedAchievements?.discover_5_fragments;
    },
    title: "Lore Collector",
    description: "Discover 5 fragments",
    narrative: "You're piecing together the FRAMEWORK. Hidden lore is hidden structure."
  },
  
  discover_all_fragments: {
    condition: (state) => {
      if (!state.discoveredFragments) return false;
      const count = Object.keys(state.discoveredFragments).filter(k => state.discoveredFragments[k]).length;
      return count >= 12 && !state.unlockedAchievements?.discover_all_fragments;
    },
    title: "Framework Scholar",
    description: "Discover all fragments",
    narrative: "You found EVERYTHING. The whole asymptote framework. That's completion at the boundary."
  }
};

// Check if any achievements should be unlocked
export function checkAchievements(state) {
  if (!state.unlockedAchievements) {
    state.unlockedAchievements = {};
  }
  
  const newAchievements = [];
  
  for (const [key, achievement] of Object.entries(achievements)) {
    if (achievement.condition(state) && !state.unlockedAchievements[key]) {
      state.unlockedAchievements[key] = true;
      newAchievements.push({
        key,
        ...achievement
      });
    }
  }
  
  return newAchievements;
}

// Get all unlocked achievements
export function getUnlockedAchievements(state) {
  if (!state.unlockedAchievements) {
    return [];
  }
  
  return Object.entries(achievements)
    .filter(([key]) => state.unlockedAchievements[key])
    .map(([key, achievement]) => ({
      key,
      title: achievement.title,
      description: achievement.description,
      narrative: achievement.narrative
    }));
}

// Get achievement progress stats
export function getAchievementStats(state) {
  const total = Object.keys(achievements).length;
  const unlocked = state.unlockedAchievements ? Object.keys(state.unlockedAchievements).filter(k => state.unlockedAchievements[k]).length : 0;
  
  return {
    unlocked,
    total,
    percentage: Math.floor((unlocked / total) * 100)
  };
}
