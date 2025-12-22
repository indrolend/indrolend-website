import { state } from './state.js';
import { getDiscoveredFragments } from './fragments.js';

let sliderElements = {};
let valueDisplays = {};
let statDisplays = {};
let fragmentNotificationTimeout = null;

export function initUI() {
  // Get slider elements
  sliderElements = {
    science: document.getElementById('scienceSlider'),
    art: document.getElementById('artSlider'),
    faith: document.getElementById('faithSlider')
  };
  
  // Get value display elements
  valueDisplays = {
    science: document.getElementById('scienceValue'),
    art: document.getElementById('artValue'),
    faith: document.getElementById('faithValue')
  };
  
  // Get stat display elements
  statDisplays = {
    population: document.getElementById('stat-population'),
    health: document.getElementById('stat-health'),
    resources: document.getElementById('stat-resources'),
    understanding: document.getElementById('stat-understanding'),
    meaning: document.getElementById('stat-meaning'),
    instability: document.getElementById('stat-instability')
  };
  
  // Add event listeners
  Object.keys(sliderElements).forEach(key => {
    sliderElements[key].addEventListener('input', () => handleSliderChange());
  });
  
  // Initialize displays
  updateSliderDisplays();
}

function handleSliderChange() {
  // Get raw values
  const science = parseInt(sliderElements.science.value);
  const art = parseInt(sliderElements.art.value);
  const faith = parseInt(sliderElements.faith.value);
  
  // Normalize so they sum to 1.0
  const total = science + art + faith;
  
  if (total > 0) {
    state.sliders.science = science / total;
    state.sliders.art = art / total;
    state.sliders.faith = faith / total;
  }
  
  updateSliderDisplays();
}

function updateSliderDisplays() {
  valueDisplays.science.textContent = state.sliders.science.toFixed(2);
  valueDisplays.art.textContent = state.sliders.art.toFixed(2);
  valueDisplays.faith.textContent = state.sliders.faith.toFixed(2);
}

export function updateStatsDisplay() {
  statDisplays.population.textContent = Math.floor(state.P);
  statDisplays.health.textContent = state.H.toFixed(2);
  statDisplays.resources.textContent = state.R.toFixed(2);
  statDisplays.understanding.textContent = (state.U * 100).toFixed(1) + '%';
  statDisplays.meaning.textContent = (state.M * 100).toFixed(1) + '%';
  statDisplays.instability.textContent = state.I.toFixed(2);
  
  // Check for pending fragments
  checkAndDisplayFragments();
}

export function setMode(mode, onModeChange) {
  state.mode = mode;
  
  const gatheringBtn = document.getElementById('gatheringModeBtn');
  const simBtn = document.getElementById('simModeBtn');
  const rpgBtn = document.getElementById('rpgModeBtn');
  const simCanvas = document.getElementById('sim-canvas');
  const rpgCanvas = document.getElementById('rpg-canvas');
  
  // Remove active from all buttons
  if (gatheringBtn) gatheringBtn.classList.remove('active');
  if (simBtn) simBtn.classList.remove('active');
  if (rpgBtn) rpgBtn.classList.remove('active');
  
  if (mode === 'gathering') {
    if (gatheringBtn) gatheringBtn.classList.add('active');
    simCanvas.style.display = 'none';
    rpgCanvas.style.display = 'none';
  } else if (mode === 'sim') {
    simBtn.classList.add('active');
    simCanvas.style.display = 'block';
    rpgCanvas.style.display = 'none';
  } else if (mode === 'rpg') {
    rpgBtn.classList.add('active');
    simCanvas.style.display = 'none';
    rpgCanvas.style.display = 'block';
  }
  
  if (onModeChange) {
    onModeChange(mode);
  }
}

// Fragment notification system
function checkAndDisplayFragments() {
  if (state.pendingFragments && state.pendingFragments.length > 0) {
    const fragment = state.pendingFragments.shift();
    displayFragmentNotification(fragment);
  }
}

function displayFragmentNotification(fragment) {
  // Remove any existing notification
  const existing = document.getElementById('fragment-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.id = 'fragment-notification';
  notification.className = 'fragment-notification';
  
  const title = document.createElement('div');
  title.className = 'fragment-title';
  title.textContent = `◆ ${fragment.title} ◆`;
  
  const text = document.createElement('div');
  text.className = 'fragment-text';
  text.textContent = fragment.text;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'fragment-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => {
    notification.classList.add('fragment-fade-out');
    setTimeout(() => notification.remove(), 300);
  });
  
  notification.appendChild(closeBtn);
  notification.appendChild(title);
  notification.appendChild(text);
  
  document.body.appendChild(notification);
  
  // Auto-dismiss after 12 seconds
  if (fragmentNotificationTimeout) {
    clearTimeout(fragmentNotificationTimeout);
  }
  fragmentNotificationTimeout = setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add('fragment-fade-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 12000);
}

// Add a button to view collected fragments
export function initFragmentCollection() {
  const header = document.querySelector('header');
  if (!header) return;
  
  const fragmentBtn = document.createElement('button');
  fragmentBtn.id = 'fragments-btn';
  fragmentBtn.className = 'fragments-btn';
  fragmentBtn.textContent = '◆ Fragments';
  fragmentBtn.title = 'View discovered fragments';
  
  fragmentBtn.addEventListener('click', showFragmentCollection);
  header.appendChild(fragmentBtn);
}

function showFragmentCollection() {
  const discovered = getDiscoveredFragments(state);
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'fragment-collection-overlay';
  
  const content = document.createElement('div');
  content.className = 'fragment-collection-content';
  
  const title = document.createElement('h2');
  title.textContent = 'DISCOVERED FRAGMENTS';
  title.style.textAlign = 'center';
  title.style.color = '#6dd9e8';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'fragment-close';
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.right = '20px';
  closeBtn.style.top = '20px';
  closeBtn.addEventListener('click', () => {
    overlay.classList.add('fragment-fade-out');
    setTimeout(() => overlay.remove(), 300);
  });
  
  content.appendChild(closeBtn);
  content.appendChild(title);
  
  if (discovered.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No fragments discovered yet. Continue exploring...';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = '#6dd9e8';
    emptyMsg.style.marginTop = '40px';
    content.appendChild(emptyMsg);
  } else {
    const list = document.createElement('div');
    list.className = 'fragment-list';
    
    discovered.forEach(frag => {
      const item = document.createElement('div');
      item.className = 'fragment-item';
      
      const itemTitle = document.createElement('h3');
      itemTitle.textContent = `◆ ${frag.title}`;
      itemTitle.style.color = '#6dd9e8';
      
      const itemText = document.createElement('p');
      itemText.textContent = frag.text;
      itemText.style.color = '#3bb8cc';
      itemText.style.marginTop = '10px';
      
      item.appendChild(itemTitle);
      item.appendChild(itemText);
      list.appendChild(item);
    });
    
    content.appendChild(list);
  }
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  
  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('fragment-fade-out');
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

