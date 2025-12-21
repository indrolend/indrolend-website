// Hidden narrative fragments for the clicker game version
// Unlocked based on understanding milestones and game actions

export const clickerFragments = {
  // First compression insight - early game
  compression_start: {
    condition: (game) => game.understanding >= 25 && !game.discoveredFragments?.compression_start,
    title: "COMPRESSION",
    text: "You're doing it. Each click: selecting what matters, discarding the rest. Reality's too dense to hold whole, so you compress. This is how minds survive infinity."
  },
  
  // Understanding emulation
  emulator_insight: {
    condition: (game) => game.understanding >= 100 && game.getTotalProduction() > 10 && !game.discoveredFragments?.emulator_insight,
    title: "EMULATOR MODE",
    text: "Your generators aren't producing truth—they're running compressed models. Like software emulating hardware: not the real physics, just enough behavior to get results. Bounded approximation beats impossible perfection."
  },
  
  // Layering discovery
  layers_visible: {
    condition: (game) => game.generators.filter(g => g.count > 0).length >= 3 && !game.discoveredFragments?.layers_visible,
    title: "LAYERS EMERGE",
    text: "See how they stack? Each generator builds on the last. Systems hide complexity behind interfaces. You don't see the gears—just the button that says 'click.' This is how anything scales."
  },
  
  // Recursion with loops
  recursion_loop: {
    condition: (game) => {
      const infiniteLoop = game.generators.find(g => g.id === 'analysis');
      return infiniteLoop && infiniteLoop.count > 0 && !game.discoveredFragments?.recursion_loop;
    },
    title: "RECURSIVE DEPTH",
    text: "Models emulating models. Each iteration adds power but risks drift from ground truth. You're not modeling reality anymore—you're modeling your model of reality. Stay grounded or embrace the float."
  },
  
  // Fossilization
  frozen_paths: {
    condition: (game) => {
      const frozenChoice = game.generators.find(g => g.id === 'synthesis');
      return frozenChoice && frozenChoice.count > 0 && !game.discoveredFragments?.frozen_paths;
    },
    title: "FOSSILIZED CHOICES",
    text: "Old decisions hardening into infrastructure. What you chose early now feels like 'just how things are.' Invisible constraints. This is how history becomes gravity."
  },
  
  // Last mile principle
  last_mile_power: {
    condition: (game) => {
      const lastStep = game.generators.find(g => g.id === 'research');
      return lastStep && lastStep.count >= 5 && !game.discoveredFragments?.last_mile_power;
    },
    title: "THE LAST MILE",
    text: "All that upstream work means nothing if the final interface fails. The last step decides if the whole chain succeeds. Reality is felt at edges, not in the middle of long pipelines."
  },
  
  // Temporal collapse understanding
  collapse_insight: {
    condition: (game) => game.clickPowerMultiplier > 1.0 && !game.discoveredFragments?.collapse_insight,
    title: "TEMPORAL LEVERAGE",
    text: "You collapsed time, extracted essence, and now you're stronger. This is archaeology: excavating old systems, keeping what's essential, discarding obsolete constraints. The past becomes optional."
  },
  
  // Asymptotic approach
  approaching_limit: {
    condition: (game) => game.understanding >= 500 && game.getTotalProduction() > 100 && !game.discoveredFragments?.approaching_limit,
    title: "ASYMPTOTIC CURVE",
    text: "You're climbing fast but the curve bends. Each unit gets harder. This isn't a bug—it's structure. Bounded agents approach truth asymptotically. Convergence without completion. This is the game."
  },
  
  // High production meaning
  meaning_emergence: {
    condition: (game) => game.getTotalProduction() >= 500 && !game.discoveredFragments?.meaning_emergence,
    title: "EMERGENT SIGNIFICANCE",
    text: "Look at these numbers climbing. What do they mean? Meaning isn't in the math—it's what you built around it. Significance emerges from bounded agents acting at their limits, not from the universe."
  },
  
  // First enlightenment
  enlightenment_truth: {
    condition: (game) => game.enlightenments > 0 && !game.discoveredFragments?.enlightenment_truth,
    title: "PRESTIGE PARADOX",
    text: "You reset to go faster. Losing everything to gain permanent power. This is meta-optimization: changing the layer instead of grinding the same one. Discontinuous jumps beat linear growth."
  },
  
  // Many generators
  distributed_system: {
    condition: (game) => game.generators.filter(g => g.count >= 10).length >= 4 && !game.discoveredFragments?.distributed_system,
    title: "DISTRIBUTED APPROXIMATION",
    text: "Multiple systems, each compressing differently. No single generator holds truth—together they cover more ground. Like human civilization: science, art, faith—different emulators for different domains."
  },
  
  // High understanding milestone
  edge_reached: {
    condition: (game) => game.understanding >= 10000 && !game.discoveredFragments?.edge_reached,
    title: "THE EPISTEMIC EDGE",
    text: "You're deep now. Close enough to see where compression fails. Beyond this edge: no more clean models, just ambiguity and choice. Science blends into philosophy, facts into narrative. This is where meaning lives."
  },
  
  // Many upgrades
  capacity_without_purpose: {
    condition: (game) => game.upgrades.filter(u => u.purchased).length >= 5 && !game.discoveredFragments?.capacity_without_purpose,
    title: "CAPACITY ≠ PURPOSE",
    text: "All these upgrades. So much ability. But capacity isn't direction. You can do more, but 'can' isn't 'should.' Energy explores states indiscriminately. Intent is separate work."
  },
  
  // Late game reflection
  models_all_the_way: {
    condition: (game) => game.understanding >= 50000 && game.enlightenments >= 2 && !game.discoveredFragments?.models_all_the_way,
    title: "ALL THE WAY DOWN",
    text: "Emulators running emulators running emulators. You've compressed so much you've forgotten what's real substrate vs. convenient abstraction. Maybe there is no bottom. Maybe it's models all the way down."
  }
};

// Check for new fragments and return them
export function checkClickerFragments(game) {
  if (!game.discoveredFragments) {
    game.discoveredFragments = {};
  }
  
  const newFragments = [];
  
  for (const [key, fragment] of Object.entries(clickerFragments)) {
    if (fragment.condition(game) && !game.discoveredFragments[key]) {
      game.discoveredFragments[key] = true;
      newFragments.push({
        key,
        title: fragment.title,
        text: fragment.text
      });
    }
  }
  
  return newFragments;
}

// Get all discovered fragments for the collection view
export function getDiscoveredClickerFragments(game) {
  if (!game.discoveredFragments) {
    return [];
  }
  
  return Object.entries(clickerFragments)
    .filter(([key]) => game.discoveredFragments[key])
    .map(([key, fragment]) => ({
      key,
      title: fragment.title,
      text: fragment.text
    }));
}
