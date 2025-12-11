import { state } from './state.js';

let sliderElements = {};
let valueDisplays = {};
let statDisplays = {};

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
