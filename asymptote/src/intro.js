// Introduction and setup screens

// Configuration constants
const TYPING_DELAY_MS = 30;
const SCREEN_TRANSITION_DELAY = 500;
const MAX_RESOURCE_SELECTIONS = 3;

const introText = `In darkness, they grope for meaning.

Rich meaning emerges from mystery rather than clarity.

A fragile stability settles over the civilization.

A small remnant persists against the odds.

A delicate balance maintains their civilization.`;

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
  
  const beginButton = document.createElement('button');
  beginButton.className = 'begin-btn';
  beginButton.innerHTML = wrapLettersInSpans('begin?');
  beginButton.style.display = 'none';
  beginButton.id = 'begin-btn';
  
  introContent.appendChild(textElement);
  introContent.appendChild(beginButton);
  introOverlay.appendChild(introContent);
  document.body.appendChild(introOverlay);
  
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
  title.textContent = 'Choose Your Starting Resources';
  title.className = 'setup-title';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Select 3 resource types to begin your civilization';
  subtitle.className = 'setup-subtitle';
  
  const resourcesContainer = document.createElement('div');
  resourcesContainer.className = 'resources-container';
  
  const resources = [
    { 
      id: 'wood', 
      name: 'Wood', 
      description: 'Renewable building material. Good for early structures and fuel.',
      effect: '+Framework, +Population growth'
    },
    { 
      id: 'stone', 
      name: 'Stone', 
      description: 'Durable building material. Essential for lasting monuments.',
      effect: '+Framework, +Complexity'
    },
    { 
      id: 'food', 
      name: 'Food', 
      description: 'Sustains population. Enables growth and health.',
      effect: '+Health, +Population'
    },
    { 
      id: 'metal', 
      name: 'Metal', 
      description: 'Advanced material. Enables tools and technology.',
      effect: '+Knowledge, +Complexity'
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
  
  const startButton = document.createElement('button');
  startButton.className = 'start-btn';
  startButton.innerHTML = wrapLettersInSpans('Begin Civilization');
  startButton.disabled = true;
  startButton.id = 'start-btn';
  
  function updateStartButton() {
    startButton.disabled = selectedResources.size !== maxSelections;
    const counter = document.getElementById('selection-counter');
    if (counter) {
      counter.textContent = `Selected: ${selectedResources.size}/${maxSelections}`;
    }
  }
  
  const selectionCounter = document.createElement('p');
  selectionCounter.id = 'selection-counter';
  selectionCounter.className = 'selection-counter';
  selectionCounter.textContent = `Selected: 0/${maxSelections}`;
  
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
