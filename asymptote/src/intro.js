// Introduction and setup screens

// Configuration constants
const TYPING_DELAY_MS = 30;
const SCREEN_TRANSITION_DELAY = 500;
const MAX_RESOURCE_SELECTIONS = 3;

// Default (English) intro text — overridden by i18n when available
const introTextDefault = `OK OK listen—

Your brain? Too SMALL for the universe.

So you SQUISH reality down. Build models.

You get CLOSER but never GET there.

That's the asymptote thingy.

Let's DO this.`;

/** Return translated string, falling back to the supplied default. */
function _t(key, def, replacements) {
  if (window.i18n && typeof window.i18n.t === 'function') {
    var val = window.i18n.t(key, replacements);
    return (val && val !== key) ? val : def;
  }
  if (replacements && def) {
    Object.keys(replacements).forEach(function (k) {
      def = def.replace('{' + k + '}', replacements[k]);
    });
  }
  return def;
}

let currentCharIndex = 0;
let typingInterval = null;

// Helper function to wrap text in spans for letter animation
function wrapLettersInSpans(text) {
  return text.split('').map((char, index) => {
    if (char === ' ') return ' ';
    const fluctuateDelay = (Math.random() * 2).toFixed(2);
    const wavyDelay = (index * 0.08).toFixed(2);
    return `<span class="btn-letter" style="animation-delay: ${fluctuateDelay}s, ${wavyDelay}s">${char}</span>`;
  }).join('');
}

export function showIntroScreen() {
  const container = document.querySelector('.container');
  container.style.display = 'none';
  
  // Create intro overlay
  const introOverlay = document.createElement('div');
  introOverlay.id = 'intro-overlay';
  introOverlay.className = 'intro-overlay';
  
  const introContent = document.createElement('div');
  introContent.className = 'intro-content';
  
  const textElement = document.createElement('pre');
  textElement.className = 'intro-text';
  textElement.id = 'intro-text';
  
  const beginLabel = _t('asymptote.begin', 'begin?');
  const beginButton = document.createElement('button');
  beginButton.className = 'begin-btn';
  beginButton.innerHTML = wrapLettersInSpans(beginLabel);
  beginButton.style.display = 'none';
  beginButton.id = 'begin-btn';
  
  introContent.appendChild(textElement);
  introContent.appendChild(beginButton);
  introOverlay.appendChild(introContent);
  document.body.appendChild(introOverlay);
  
  const introText = _t('asymptote.intro', introTextDefault);
  // Start typing animation
  typeText(textElement, introText, () => {
    beginButton.style.display = 'block';
    beginButton.classList.add('fade-in');
  });
  
  return beginButton;
}

function typeText(element, text, callback) {
  currentCharIndex = 0;
  element.textContent = '';
  
  typingInterval = setInterval(() => {
    if (currentCharIndex < text.length) {
      element.textContent += text[currentCharIndex];
      currentCharIndex++;
    } else {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, TYPING_DELAY_MS);
}

export function hideIntroScreen() {
  const introOverlay = document.getElementById('intro-overlay');
  if (introOverlay) {
    introOverlay.classList.add('fade-out');
    setTimeout(() => {
      introOverlay.remove();
      // Show the main container
      const container = document.querySelector('.container');
      if (container) {
        container.style.display = 'block';
      }
    }, 500);
  }
  if (typingInterval) {
    clearInterval(typingInterval);
  }
}

export function showSetupScreen(onComplete) {
  const container = document.querySelector('.container');
  container.style.display = 'none';
  
  // Create setup overlay
  const setupOverlay = document.createElement('div');
  setupOverlay.id = 'setup-overlay';
  setupOverlay.className = 'setup-overlay';
  
  const setupContent = document.createElement('div');
  setupContent.className = 'setup-content';
  
  const title = document.createElement('h2');
  title.textContent = _t('asymptote.setup_title', 'OK Pick 3 Things');
  title.className = 'setup-title';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = _t('asymptote.setup_subtitle', 'Just pick em. Trust me.');
  subtitle.className = 'setup-subtitle';
  
  const resourcesContainer = document.createElement('div');
  resourcesContainer.className = 'resources-container';
  
  const resources = [
    { 
      id: 'wood', 
      name: _t('asymptote.wood', 'Wood'),
      description: _t('asymptote.wood_desc', 'Builds frameworks, grows back'),
      effect: _t('asymptote.wood_effect', 'structures that hold together')
    },
    { 
      id: 'stone', 
      name: _t('asymptote.stone', 'Stone'),
      description: _t('asymptote.stone_desc', 'Decisions that fossilize'),
      effect: _t('asymptote.stone_effect', 'permanent but inflexible')
    },
    { 
      id: 'food', 
      name: _t('asymptote.food', 'Food'),
      description: _t('asymptote.food_desc', 'Thermodynamic constraint'),
      effect: _t('asymptote.food_effect', 'bodies need energy to run')
    },
    { 
      id: 'metal', 
      name: _t('asymptote.metal', 'Metal'),
      description: _t('asymptote.metal_desc', 'Tools that emulate nature'),
      effect: _t('asymptote.metal_effect', 'reproducing effects, not essence')
    }
  ];
  
  const selectedResources = new Set();
  const maxSelections = MAX_RESOURCE_SELECTIONS;
  
  resources.forEach(resource => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.dataset.resource = resource.id;
    
    const cardName = document.createElement('h3');
    cardName.textContent = resource.name;
    
    const cardDesc = document.createElement('p');
    cardDesc.textContent = resource.description;
    cardDesc.className = 'resource-description';
    
    const cardEffect = document.createElement('p');
    cardEffect.textContent = resource.effect;
    cardEffect.className = 'resource-effect';
    
    card.appendChild(cardName);
    card.appendChild(cardDesc);
    card.appendChild(cardEffect);
    
    card.addEventListener('click', () => {
      if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        selectedResources.delete(resource.id);
      } else if (selectedResources.size < maxSelections) {
        card.classList.add('selected');
        selectedResources.add(resource.id);
      }
      
      updateStartButton();
    });
    
    resourcesContainer.appendChild(card);
  });
  
  const letsGoLabel = _t('asymptote.lets_go', 'LETS GOOOO');
  const startButton = document.createElement('button');
  startButton.className = 'start-btn';
  startButton.innerHTML = wrapLettersInSpans(letsGoLabel);
  startButton.disabled = true;
  startButton.id = 'start-btn';
  
  function updateStartButton() {
    startButton.disabled = selectedResources.size !== maxSelections;
    const counter = document.getElementById('selection-counter');
    if (counter) {
      counter.textContent = _t('asymptote.selected', 'Selected: {count}/{max}', {
        count: selectedResources.size,
        max: maxSelections
      });
    }
  }
  
  const selectionCounter = document.createElement('p');
  selectionCounter.id = 'selection-counter';
  selectionCounter.className = 'selection-counter';
  selectionCounter.textContent = _t('asymptote.selected', 'Selected: {count}/{max}', {
    count: 0,
    max: maxSelections
  });
  
  startButton.addEventListener('click', () => {
    const selected = Array.from(selectedResources);
    onComplete(selected);
  });
  
  setupContent.appendChild(title);
  setupContent.appendChild(subtitle);
  setupContent.appendChild(selectionCounter);
  setupContent.appendChild(resourcesContainer);
  setupContent.appendChild(startButton);
  setupOverlay.appendChild(setupContent);
  document.body.appendChild(setupOverlay);
}

export function hideSetupScreen() {
  const setupOverlay = document.getElementById('setup-overlay');
  if (setupOverlay) {
    setupOverlay.classList.add('fade-out');
    setTimeout(() => {
      setupOverlay.remove();
      const container = document.querySelector('.container');
      container.style.display = 'block';
    }, SCREEN_TRANSITION_DELAY);
  }
}

export function applyStartingResources(selectedResources, state) {
  // Reset starting resources
  state.startingResources = {
    wood: 0,
    stone: 0,
    food: 0,
    metal: 0
  };
  
  // Apply selected resources
  selectedResources.forEach(resource => {
    state.startingResources[resource] = 1;
  });
  
  // Adjust initial state based on resources
  if (state.startingResources.wood) {
    state.F += 0.15; // Framework boost
    state.P += 50;   // Population boost
  }
  
  if (state.startingResources.stone) {
    state.F += 0.2;  // Framework boost
    state.C += 0.1;  // Complexity boost
  }
  
  if (state.startingResources.food) {
    state.H += 0.2;  // Health boost
    state.P += 100;  // Population boost
  }
  
  if (state.startingResources.metal) {
    state.K += 0.15; // Knowledge boost
    state.C += 0.15; // Complexity boost
  }
  
  // Normalize values
  state.F = Math.min(state.F, 1.0);
  state.H = Math.min(state.H, 1.0);
  state.K = Math.min(state.K, 1.0);
  
  // Adjust resources
  state.R += selectedResources.length * 0.5;
}

