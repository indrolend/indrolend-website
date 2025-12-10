// Configuration constants for the simulation

export const params = {
  // Population growth
  popGrowthRate: 0.05,
  popCarryingCapacity: 10000,
  
  // Resource dynamics
  resourceGenerationFromK: 0.02,
  resourceConsumptionPerPop: 0.0001,
  resourceDrag: 0.01,
  
  // Health dynamics
  healthFromK: 0.01,
  healthFromR: 0.02,
  healthFromF: 0.01,
  healthLossFromI: 0.03,
  
  // Knowledge growth
  knowledgeGrowthFromScience: 0.03,
  knowledgeBaseline: 0.01,
  knowledgeDragFromC: 0.02,
  knowledgeDragFromI: 0.01,
  
  // Art/Culture growth
  artGrowthFromArt: 0.025,
  artFromTension: 0.015,
  artDrag: 0.005,
  
  // Framework dynamics
  frameworkGrowthFromFaith: 0.02,
  frameworkGrowthFromArt: 0.01,
  frameworkDragFromK: 0.015,
  frameworkDragFromI: 0.02,
  
  // Complexity
  complexityFromK: 0.02,
  complexityFromPopScaled: 0.00001,
  complexityFromR: 0.01,
  complexityDrag: 0.005,
  
  // Instability
  instabilityFromC: 0.03,
  instabilityDragFromF: 0.04,
  instabilityFromNegativeR: 0.05,
  instabilityFromImbalance: 0.02,
  instabilityDrag: 0.01,
  
  // Understanding (asymptotic)
  kappaK: 0.5,
  kappaF: 0.3,
  lambda: 0.02,
  understandingNoiseMean: 1.0,
  understandingNoiseStdDev: 0.05,
  
  // Meaning (emergent)
  meaningWeightH: 0.3,
  meaningWeightX: 0.25,
  meaningWeightF: 0.2,
  meaningWeightU: 0.15,
  meaningWeightI: -0.2,
  meaningSigmoidSteepness: 5.0,
  
  // RPG scaling
  rpgStatScale: 100,
  rpgBaseHP: 50,
  rpgHPMultiplier: 150
};

// Grid configuration
export const gridConfig = {
  width: 60,
  height: 40,
  cellSize: 10
};

// Rendering configuration
export const renderConfig = {
  backgroundColor: '#000',
  foregroundColor: '#0f0',
  populationColor: '#0f0',
  frameworkColor: '#0a0',
  instabilityColor: '#f00',
  knowledgeColor: '#00f'
};
