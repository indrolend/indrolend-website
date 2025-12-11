import { state } from './state.js';

export function describeState() {
  const narratives = [];
  
  // Understanding narratives
  if (state.U > 0.8) {
    narratives.push("They stand at the threshold of profound understanding.");
  } else if (state.U > 0.5) {
    narratives.push("Knowledge accumulates, patterns emerge.");
  } else if (state.U < 0.2) {
    narratives.push("In darkness, they grope for meaning.");
  }
  
  // Knowledge vs Framework tension
  if (state.K > 0.5 && state.F < 0.3) {
    narratives.push("Rational clarity sharpens while the shared story fractures.");
  } else if (state.K < 0.3 && state.F > 0.6) {
    narratives.push("Tradition binds them, but inquiry languishes.");
  }
  
  // Art and culture
  if (state.X > 0.5 && state.F > 0.5) {
    narratives.push("Symbols and songs bind the people into a coherent whole.");
  } else if (state.X > 0.5) {
    narratives.push("Artistic expression flourishes in the chaos.");
  }
  
  // Meaning vs Understanding
  if (state.U > 0.6 && state.M < 0.4) {
    narratives.push("They approach understanding, but meaning slips through the cracks.");
  } else if (state.M > 0.7 && state.U < 0.5) {
    narratives.push("Rich meaning emerges from mystery rather than clarity.");
  }
  
  // Instability narratives
  if (state.I > 0.7) {
    narratives.push("Cracks spread through the foundations of their world.");
  } else if (state.I > 0.4) {
    narratives.push("Tensions rise; the center struggles to hold.");
  } else if (state.I < 0.15) {
    narratives.push("A fragile stability settles over the civilization.");
  }
  
  // Resource and health
  if (state.H < 0.3) {
    narratives.push("Bodies weaken; suffering spreads.");
  } else if (state.H > 0.8) {
    narratives.push("Health and vitality pulse through the population.");
  }
  
  if (state.R < 0.3) {
    narratives.push("Resources dwindle; scarcity breeds conflict.");
  } else if (state.R > 1.5) {
    narratives.push("Abundance flows; material needs are met.");
  }
  
  // Population narratives
  if (state.P > 8000) {
    narratives.push("Cities sprawl; multitudes fill the land.");
  } else if (state.P < 500) {
    narratives.push("A small remnant persists against the odds.");
  }
  
  // Complexity
  if (state.C > 0.7) {
    narratives.push("Systems within systems; the whole becomes incomprehensible.");
  }
  
  // Slider-specific narratives
  if (state.sliders.science > 0.6) {
    narratives.push("The path of inquiry dominates their pursuits.");
  } else if (state.sliders.art > 0.6) {
    narratives.push("Beauty and expression take precedence over all else.");
  } else if (state.sliders.faith > 0.6) {
    narratives.push("Faith becomes the lens through which all is seen.");
  }
  
  // Balance narratives
  const maxSlider = Math.max(state.sliders.science, state.sliders.art, state.sliders.faith);
  const minSlider = Math.min(state.sliders.science, state.sliders.art, state.sliders.faith);
  if (maxSlider - minSlider < 0.2) {
    narratives.push("A delicate balance maintains their civilization.");
  }
  
  // Time-based narratives
  if (state.time > 1000) {
    narratives.push("Generations have passed; memory fades into myth.");
  }
  
  // Default if no narratives triggered
  if (narratives.length === 0) {
    narratives.push("The civilization evolves, moment by moment.");
  }
  
  return narratives.join('\n\n');
}

export function updateNarrative() {
  const narrativeElement = document.getElementById('narrative');
  if (narrativeElement) {
    narrativeElement.textContent = describeState();
  }
}
