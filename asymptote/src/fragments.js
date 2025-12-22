// Hidden narrative fragments that unlock based on game state
// These are more explicit framework concepts, discoverable as "hidden lore"

export const fragments = {
  // Discovered when high complexity + high knowledge
  emulator_revelation: {
    condition: (state) => state.K > 0.65 && state.C > 0.6 && !state.discoveredFragments?.emulator_revelation,
    title: "EMULATOR",
    text: "You're not mirroring reality—you're running a compressed version. Like a game emulator doesn't simulate electrons, just enough behavior to run the game. Your mind: a bounded approximator in a dense universe."
  },
  
  // High understanding but low meaning
  edge_discovery: {
    condition: (state) => state.U > 0.7 && state.M < 0.35 && !state.discoveredFragments?.edge_discovery,
    title: "THE EDGE",
    text: "You've reached it. The boundary where your models stop compressing usefully. Beyond here, no more equations—just interpretation, narrative, choice. This isn't failure. This is structure."
  },
  
  // Long game time with moderate instability
  fossil_insight: {
    condition: (state) => state.time > 700 && state.F > 0.5 && !state.discoveredFragments?.fossil_insight,
    title: "FOSSILIZED DECISIONS",
    text: "What you built early is now infrastructure. Those choices aren't choices anymore—they're just 'how things work.' Invisible constraints from forgotten decisions. Archaeology is agency."
  },
  
  // High complexity, moderate population
  layer_realization: {
    condition: (state) => state.C > 0.65 && state.P > 4000 && !state.discoveredFragments?.layer_realization,
    title: "HIDING COMPLEXITY",
    text: "The system grew too deep to perceive. So it hid itself behind interfaces—buttons, rules, prices, narratives. These aren't decorative. They're survival mechanisms. Without them, you couldn't participate at all."
  },
  
  // Resource abundance with health
  last_mile: {
    condition: (state) => state.R > 1.3 && state.H > 0.65 && !state.discoveredFragments?.last_mile,
    title: "LAST-MILE POWER",
    text: "Doesn't matter what flows upstream if the final interface breaks. A package crosses oceans, then fails at your door. Knowledge fills libraries, then fails at interpretation. The edge decides everything."
  },
  
  // High art + high instability
  volatility: {
    condition: (state) => state.X > 0.6 && state.I > 0.5 && !state.discoveredFragments?.volatility,
    title: "HUMAN NOISE",
    text: "Systems want predictability. But humans synchronize, mutate, generate meaningful noise. Not averaging out—compounding. You're the volatile variable. Small deviations can cascade. This is where change comes from."
  },
  
  // Very high knowledge + art
  recursion: {
    condition: (state) => state.K > 0.7 && state.X > 0.6 && !state.discoveredFragments?.recursion,
    title: "RECURSIVE DEPTH",
    text: "Models of models of models. Software emulates math that emulates physics. Culture emulates culture. Power scales faster this way, but so does drift. Self-reference can detach from ground truth. Stay grounded or float away—both are options."
  },
  
  // High meaning despite low knowledge
  emergence: {
    condition: (state) => state.M > 0.65 && state.K < 0.4 && !state.discoveredFragments?.emergence,
    title: "EMERGENT MEANING",
    text: "Meaning isn't discovered like a rock. It's constructed—emergent from bounded agents operating at their limits. You don't need to understand everything to matter. Significance emerges in the gaps, not the coverage."
  },
  
  // Balanced sliders for extended time
  distributed_emulation: {
    condition: (state) => {
      const max = Math.max(state.sliders.science, state.sliders.art, state.sliders.faith);
      const min = Math.min(state.sliders.science, state.sliders.art, state.sliders.faith);
      return max - min < 0.25 && state.time > 500 && !state.discoveredFragments?.distributed_emulation;
    },
    title: "DISTRIBUTED MODELING",
    text: "Science emulates physical constraints. Art emulates inner states. Faith emulates moral order. Each compresses reality differently. No single view is complete. Together: a distributed approximation of what can't be held whole."
  },
  
  // High complexity + instability
  capacity_warning: {
    condition: (state) => state.C > 0.7 && state.I > 0.6 && !state.discoveredFragments?.capacity_warning,
    title: "CAPACITY ≠ PURPOSE",
    text: "You built systems that CAN do more than they SHOULD. Capacity expands without direction. 'Possible' isn't the same as 'purposeful.' Energy explores state space indiscriminately. Intention is separate work."
  },
  
  // Very late game
  asymptotic_truth: {
    condition: (state) => state.U > 0.85 && state.time > 900 && !state.discoveredFragments?.asymptotic_truth,
    title: "ASYMPTOTIC",
    text: "You're close. So close you can feel the limit. But you'll never reach 1.0—that's the nature of finite emulators. Understanding improves without completing. Truth approached, not arrived at. This is it. This is the game."
  },
  
  // Time delay compound effect
  delayed_visibility: {
    condition: (state) => state.time > 850 && state.P > 6000 && !state.discoveredFragments?.delayed_visibility,
    title: "DELAYED EFFECTS",
    text: "When leverage was high, effects were invisible. When effects became visible, the system had already shifted. Compounding is nonlinear. Many 'overnight successes' are just long curves becoming steep enough to see."
  }
};

// Check if any fragments should be revealed
export function checkFragments(state) {
  if (!state.discoveredFragments) {
    state.discoveredFragments = {};
  }
  
  const newFragments = [];
  
  for (const [key, fragment] of Object.entries(fragments)) {
    if (fragment.condition(state) && !state.discoveredFragments[key]) {
      state.discoveredFragments[key] = true;
      newFragments.push({
        key,
        ...fragment
      });
    }
  }
  
  return newFragments;
}

// Get all discovered fragments
export function getDiscoveredFragments(state) {
  if (!state.discoveredFragments) {
    return [];
  }
  
  return Object.entries(fragments)
    .filter(([key]) => state.discoveredFragments[key])
    .map(([key, fragment]) => ({
      key,
      title: fragment.title,
      text: fragment.text
    }));
}
