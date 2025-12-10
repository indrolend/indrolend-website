import { state, recordHistory } from './state.js';
import { params } from './config.js';

// Clamp function
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Sigmoid function
function sigmoid(x, steepness = 1) {
  return 1 / (1 + Math.exp(-steepness * x));
}

// Update resources and health
function updateResourcesAndHealth() {
  // Resources increase with knowledge, decrease with population and instability
  const dR = 
    params.resourceGenerationFromK * state.K -
    params.resourceConsumptionPerPop * state.P -
    params.resourceDrag * state.R -
    params.resourceDrag * state.I;
  
  state.R += dR;
  state.R = Math.max(state.R, 0);
  
  // Health increases with knowledge, resources, framework; decreases with instability
  const dH =
    params.healthFromK * state.K +
    params.healthFromR * state.R +
    params.healthFromF * state.F -
    params.healthLossFromI * state.I;
  
  state.H += dH;
  state.H = clamp(state.H, 0, 1);
}

// Update population
function updatePopulation() {
  // Logistic growth influenced by health and instability
  const growthFactor = state.H * (1 - state.I);
  const dP = params.popGrowthRate * state.P * (1 - state.P / params.popCarryingCapacity) * growthFactor;
  
  state.P += dP;
  state.P = Math.max(state.P, 1);
}

// Update knowledge
function updateKnowledge() {
  const dK =
    params.knowledgeGrowthFromScience * state.sliders.science +
    params.knowledgeBaseline * state.K -
    params.knowledgeDragFromC * state.C -
    params.knowledgeDragFromI * state.I;
  
  state.K += dK;
  state.K = Math.max(state.K, 0);
}

// Update art/culture
function updateArt() {
  // Art grows from art slider and from tension (low health + high instability)
  const tension = (1 - state.H) * state.I;
  
  const dX =
    params.artGrowthFromArt * state.sliders.art +
    params.artFromTension * tension -
    params.artDrag * state.X;
  
  state.X += dX;
  state.X = Math.max(state.X, 0);
}

// Update framework
function updateFramework() {
  const dF =
    params.frameworkGrowthFromFaith * state.sliders.faith +
    params.frameworkGrowthFromArt * state.X -
    params.frameworkDragFromK * state.K -
    params.frameworkDragFromI * state.I;
  
  state.F += dF;
  state.F = clamp(state.F, 0, 1);
}

// Update complexity and instability
function updateComplexityAndInstability() {
  // Complexity increases with knowledge, population, and resources
  const popScaled = state.P / params.popCarryingCapacity;
  const dC =
    params.complexityFromK * state.K +
    params.complexityFromPopScaled * popScaled +
    params.complexityFromR * state.R -
    params.complexityDrag * state.C;
  
  state.C += dC;
  state.C = Math.max(state.C, 0);
  
  // Instability increases with complexity, decreases with framework
  // Also increases with negative resources and slider imbalance
  const negativeResourcePressure = state.R < 0.5 ? (0.5 - state.R) : 0;
  
  // Calculate slider imbalance (how unequal the three sliders are)
  const sliderValues = [state.sliders.science, state.sliders.art, state.sliders.faith];
  const avgSlider = (sliderValues[0] + sliderValues[1] + sliderValues[2]) / 3;
  const imbalance = sliderValues.reduce((sum, val) => sum + Math.abs(val - avgSlider), 0) / 3;
  
  const dI =
    params.instabilityFromC * state.C -
    params.instabilityDragFromF * state.F +
    params.instabilityFromNegativeR * negativeResourcePressure +
    params.instabilityFromImbalance * imbalance -
    params.instabilityDrag * state.I;
  
  state.I += dI;
  state.I = Math.max(state.I, 0);
}

// Update understanding and meaning
function updateUnderstandingAndMeaning() {
  // Understanding: asymptotic growth with noise
  const gainRaw = params.kappaK * state.K + params.kappaF * state.F;
  const normGain = Math.tanh(gainRaw);
  
  // Add noise factor (God writes straight with crooked lines)
  const noiseFactor = params.understandingNoiseMean + 
    (Math.random() - 0.5) * 2 * params.understandingNoiseStdDev;
  
  const dU = params.lambda * (1 - state.U) * normGain;
  state.U += dU * noiseFactor;
  state.U = Math.min(state.U, 0.999);
  state.U = Math.max(state.U, 0);
  
  // Meaning: emergent from other variables
  const meaningInput =
    params.meaningWeightH * state.H +
    params.meaningWeightX * state.X +
    params.meaningWeightF * state.F +
    params.meaningWeightU * state.U +
    params.meaningWeightI * state.I;
  
  state.M = sigmoid(meaningInput, params.meaningSigmoidSteepness);
}

// Main tick function
export function tick() {
  state.time++;
  
  updateResourcesAndHealth();
  updatePopulation();
  updateKnowledge();
  updateArt();
  updateFramework();
  updateComplexityAndInstability();
  updateUnderstandingAndMeaning();
  
  recordHistory();
}
