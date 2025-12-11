// Central state object for the civilization simulation
export const state = {
  // Slider values (always sum to 1.0)
  sliders: {
    science: 0.4,
    art: 0.3,
    faith: 0.3
  },
  
  // Core variables
  K: 0.1,          // Knowledge
  X: 0.1,          // Art/Culture
  F: 0.5,          // Framework (cohesion)
  H: 0.6,          // Health
  P: 100,          // Population
  R: 1.0,          // Resources
  C: 0.1,          // Complexity
  I: 0.1,          // Instability
  U: 0.0,          // Understanding (asymptotic)
  M: 0.3,          // Meaning (emergent)
  
  time: 0,         // Simulation time
  mode: 'intro',   // Current mode: 'intro', 'setup', 'gathering', 'sim', or 'rpg'
  gameStarted: false,
  
  // Starting resources
  startingResources: {
    wood: 0,
    stone: 0,
    food: 0,
    metal: 0
  },
  
  // History for visualization
  history: {
    U: [],
    M: [],
    I: []
  }
};

// Helper function to record history
export function recordHistory() {
  state.history.U.push(state.U);
  state.history.M.push(state.M);
  state.history.I.push(state.I);
  
  // Keep only last 100 values
  if (state.history.U.length > 100) {
    state.history.U.shift();
    state.history.M.shift();
    state.history.I.shift();
  }
}
