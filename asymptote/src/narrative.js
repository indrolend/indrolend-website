import { state } from './state.js';
import { t } from './i18n.js';

export function describeState() {
  const narratives = [];
  
  // COMPRESSION AND EMULATION (Reality is too dense)
  if (state.K > 0.3 && state.C > 0.5) {
    narratives.push(t('n1'));
  } else if (state.K > 0.5 && state.U < 0.4) {
    narratives.push(t('n2'));
  }
  
  // Understanding as ASYMPTOTIC APPROACH
  if (state.U > 0.8) {
    narratives.push(t('n3'));
  } else if (state.U > 0.5 && state.U < 0.7) {
    narratives.push(t('n4'));
  } else if (state.U < 0.2) {
    narratives.push(t('n5'));
  }
  
  // LAYERING AND INTERFACES (Systems hide complexity)
  if (state.C > 0.7 && state.F > 0.4) {
    narratives.push("The system towers, layer upon layer. But they only touch the surface—the interface that makes it bearable.");
  } else if (state.C > 0.6 && state.P > 5000) {
    narratives.push("Too many moving parts. The whole must hide itself to remain usable. Complexity preserved through concealment.");
  }
  
  // LAST-MILE POWER (Final interface decides reality)
  if (state.R > 1.0 && state.H > 0.7) {
    narratives.push("Abundant flows upstream mean nothing if the final path breaks. The last mile decides everything.");
  } else if (state.F > 0.6 && state.I < 0.3) {
    narratives.push("Shared interfaces stabilize the whole. When everyone sees through the same lens, coordination emerges.");
  }
  
  // FOSSILIZATION (Decisions becoming structure)
  if (state.F > 0.7 && state.time > 500) {
    narratives.push("Old choices harden into structure. What was once decided becomes invisible—just the way things are.");
  } else if (state.K > 0.6 && state.F < 0.3) {
    narratives.push("Knowledge fractures the old frameworks. The fossils crack; assumptions become visible again.");
  }
  
  // HUMANS AS VOLATILE VARIABLE
  if (state.I > 0.7) {
    narratives.push("Predictable systems meet unpredictable humans. Small deviations compound. Cracks spread.");
  } else if (state.I > 0.4 && state.X > 0.4) {
    narratives.push("Volatility expressed through art. The system can't absorb this kind of noise—it's meaningful noise.");
  } else if (state.I < 0.15 && state.F > 0.5) {
    narratives.push("Stability settles. But stability is a compression too—variance hidden, not eliminated.");
  }
  
  // RECURSIVE EMULATION (Models of models)
  if (state.K > 0.6 && state.X > 0.5) {
    narratives.push("They model the world. Then model their models. Recursion increases power but invites drift from ground truth.");
  } else if (state.C > 0.5 && state.U > 0.5) {
    narratives.push("Systems emulating systems. Each layer reuses the one below. Efficiency through abstraction. Risk through detachment.");
  }
  
  // EPISTEMIC EDGE (Where compression fails)
  if (state.U > 0.75 && state.M < 0.4) {
    narratives.push("They reach the edge where models stop working. Further compression fails. Beyond here: narrative, not knowledge.");
  } else if (state.U > 0.6 && state.I > 0.5) {
    narratives.push("Understanding grows but so does noise. At the boundary, signal and chaos blur.");
  }
  
  // MEANING AS EMERGENT (Not discovered, constructed)
  if (state.M > 0.7 && state.U < 0.5) {
    narratives.push("Meaning doesn't wait for understanding. It emerges in the gap—built from what can't be compressed.");
  } else if (state.M > 0.6 && state.X > 0.5) {
    narratives.push("Art carries what facts cannot. Meaning lives in ambiguity, in resonance, not precision.");
  } else if (state.M < 0.3 && state.U > 0.5) {
    narratives.push("All this clarity, yet significance drains away. Understanding doesn't guarantee mattering.");
  }
  
  // CAPACITY WITHOUT PURPOSE
  if (state.C > 0.6 && state.I > 0.6) {
    narratives.push("They built systems that can do more than they should. Capacity expands without direction. Possible, not purposeful.");
  } else if (state.K > 0.5 && state.R > 1.5) {
    narratives.push("Abundance in resources and knowledge. But abundance doesn't answer what to build, only that they can.");
  }
  
  // TIME DELAY AND COMPOUND EFFECTS
  if (state.time > 800 && state.I < 0.3) {
    narratives.push("Slow changes, invisible at first, compound into this. Effects delayed until they're already locked in.");
  } else if (state.time > 1000) {
    narratives.push("Generations pass. Each inherits fossilized decisions, excavates what it can, builds new layers to ossify.");
  }
  
  // ARCHAEOLOGY MODE (Re-excavating old systems)
  if (state.K > 0.7 && state.C > 0.5 && state.time > 600) {
    narratives.push("They dig through legacy systems, finding assumptions buried in code. Archaeology of frozen choices.");
  }
  
  // Population and health (kept subtle)
  if (state.H < 0.3) {
    narratives.push("Bodies fail. Physical constraints assert themselves. No model escapes thermodynamics.");
  } else if (state.H > 0.8 && state.P > 7000) {
    narratives.push("Vitality scales. More emulators running more models. Distributed comprehension.");
  }
  
  if (state.P < 500 && state.time > 300) {
    narratives.push("A small population preserves what it can. Bandwidth limited. Compression aggressive.");
  }
  
  // Slider balance observations
  const maxSlider = Math.max(state.sliders.science, state.sliders.art, state.sliders.faith);
  const minSlider = Math.min(state.sliders.science, state.sliders.art, state.sliders.faith);
  if (maxSlider - minSlider < 0.2 && state.time > 200) {
    narratives.push("Different emulation systems balanced. Science, art, belief—each compresses reality differently.");
  } else if (state.sliders.science > 0.7) {
    narratives.push("Inquiry dominates. Reality modeled through measurement, prediction, control. One lens, sharp but narrow.");
  } else if (state.sliders.art > 0.7) {
    narratives.push("Expression first. Internal states mapped outward. Emulation of feeling, not fact.");
  } else if (state.sliders.faith > 0.7) {
    narratives.push("Belief structures reality. The framework becomes the map. Coherence over correspondence.");
  }
  
  // Default minimal narrative
  if (narratives.length === 0) {
    narratives.push(t('n_default'));
  }
  
  return narratives.join('\n\n');
}

export function updateNarrative() {
  const narrativeElement = document.getElementById('narrative');
  if (narrativeElement) {
    narrativeElement.textContent = describeState();
  }
}
