import { t } from './i18n.js';

const TYPING_DELAY_MS = 30;
const SCREEN_TRANSITION_DELAY = 500;
const MAX_RESOURCE_SELECTIONS = 3;

let currentCharIndex = 0;
let typingInterval = null;

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
  beginButton.innerHTML = wrapLettersInSpans(t('begin'));
  beginButton.style.display = 'none';
  beginButton.id = 'begin-btn';

  introContent.appendChild(textElement);
  introContent.appendChild(beginButton);
  introOverlay.appendChild(introContent);
  document.body.appendChild(introOverlay);

  typeText(textElement, t('introText'), () => {
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
      const container = document.querySelector('.container');
      if (container) container.style.display = 'block';
    }, 500);
  }
  if (typingInterval) clearInterval(typingInterval);
}

export function showSetupScreen(onComplete) {
  const container = document.querySelector('.container');
  container.style.display = 'none';

  const setupOverlay = document.createElement('div');
  setupOverlay.id = 'setup-overlay';
  setupOverlay.className = 'setup-overlay';

  const setupContent = document.createElement('div');
  setupContent.className = 'setup-content';

  const title = document.createElement('h2');
  title.textContent = t('setupTitle');
  title.className = 'setup-title';

  const subtitle = document.createElement('p');
  subtitle.textContent = t('setupSubtitle');
  subtitle.className = 'setup-subtitle';

  const resourcesContainer = document.createElement('div');
  resourcesContainer.className = 'resources-container';

  const resources = [
    { id: 'wood', name: t('woodName'), description: t('woodDesc'), effect: t('woodEffect') },
    { id: 'stone', name: t('stoneName'), description: t('stoneDesc'), effect: t('stoneEffect') },
    { id: 'food', name: t('foodName'), description: t('foodDesc'), effect: t('foodEffect') },
    { id: 'metal', name: t('metalName'), description: t('metalDesc'), effect: t('metalEffect') }
  ];

  const selectedResources = new Set();
  const maxSelections = MAX_RESOURCE_SELECTIONS;

  resources.forEach((resource) => {
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

    card.append(cardName, cardDesc, cardEffect);
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
  startButton.innerHTML = wrapLettersInSpans(t('start'));
  startButton.disabled = true;

  function updateStartButton() {
    startButton.disabled = selectedResources.size !== maxSelections;
    selectionCounter.textContent = `${t('selected')}: ${selectedResources.size}/${maxSelections}`;
  }

  const selectionCounter = document.createElement('p');
  selectionCounter.id = 'selection-counter';
  selectionCounter.className = 'selection-counter';
  selectionCounter.textContent = `${t('selected')}: 0/${maxSelections}`;

  startButton.addEventListener('click', () => onComplete(Array.from(selectedResources)));

  setupContent.append(title, subtitle, selectionCounter, resourcesContainer, startButton);
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
  state.startingResources = { wood: 0, stone: 0, food: 0, metal: 0 };
  selectedResources.forEach((resource) => { state.startingResources[resource] = 1; });

  if (state.startingResources.wood) { state.F += 0.15; state.P += 50; }
  if (state.startingResources.stone) { state.F += 0.2; state.C += 0.1; }
  if (state.startingResources.food) { state.H += 0.1; state.R += 0.2; }
  if (state.startingResources.metal) { state.K += 0.1; state.C += 0.05; }
}
