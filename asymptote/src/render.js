import { state } from './state.js';
import { gridConfig, renderConfig } from './config.js';

let canvas, ctx;

export function initRender(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
}

export function renderSimulation() {
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = renderConfig.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw understanding bar at top
  drawUnderstandingBar();
  
  // Draw population clusters
  drawPopulation();
  
  // Draw framework structures
  drawFramework();
  
  // Draw knowledge networks
  drawKnowledgeNetworks();
  
  // Draw instability effects
  drawInstability();
  
  // Draw stats overlay
  drawStatsOverlay();
}

function drawUnderstandingBar() {
  const barHeight = 20;
  const barY = 10;
  const barX = 50;
  const barWidth = canvas.width - 100;
  
  // Background
  ctx.strokeStyle = renderConfig.foregroundColor;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  // Fill based on understanding
  const fillWidth = barWidth * state.U;
  ctx.fillStyle = renderConfig.foregroundColor;
  ctx.fillRect(barX, barY, fillWidth, barHeight);
  
  // Label
  ctx.font = '12px Courier New';
  ctx.fillStyle = renderConfig.foregroundColor;
  ctx.fillText(`Understanding: ${(state.U * 100).toFixed(1)}%`, barX, barY - 5);
}

function drawPopulation() {
  const popDensity = state.P / 10000;
  const numDots = Math.floor(popDensity * 500);
  
  ctx.fillStyle = renderConfig.populationColor;
  
  for (let i = 0; i < numDots; i++) {
    // Create clusters based on framework (high F = more clustered)
    const clusterFactor = state.F;
    const x = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * (1 - clusterFactor * 0.7);
    const y = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.8;
    
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFramework() {
  const numStructures = Math.floor(state.F * 20);
  
  ctx.strokeStyle = renderConfig.frameworkColor;
  ctx.lineWidth = 2;
  
  for (let i = 0; i < numStructures; i++) {
    const x = (canvas.width / numStructures) * i + 50;
    const y = 100 + Math.random() * (canvas.height - 200);
    const size = 10 + state.F * 20;
    
    ctx.strokeRect(x, y, size, size);
  }
}

function drawKnowledgeNetworks() {
  const numNodes = Math.floor(state.K * 30);
  const nodes = [];
  
  // Create nodes
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: 50 + Math.random() * (canvas.height - 100)
    });
  }
  
  // Draw connections
  ctx.strokeStyle = renderConfig.knowledgeColor;
  ctx.lineWidth = 1;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 100 * state.K) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  
  // Draw nodes
  ctx.fillStyle = renderConfig.knowledgeColor;
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawInstability() {
  if (state.I < 0.1) return;
  
  const numCracks = Math.floor(state.I * 15);
  
  ctx.strokeStyle = renderConfig.instabilityColor;
  ctx.lineWidth = 1;
  
  for (let i = 0; i < numCracks; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 20 + Math.random() * 50 * state.I;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }
  
  // Add jitter to overall rendering when instability is very high
  if (state.I > 0.5) {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = renderConfig.instabilityColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
  }
}

function drawStatsOverlay() {
  ctx.font = '12px Courier New';
  ctx.fillStyle = renderConfig.foregroundColor;
  
  const stats = [
    `Time: ${state.time}`,
    `Meaning: ${(state.M * 100).toFixed(1)}%`
  ];
  
  stats.forEach((stat, i) => {
    ctx.fillText(stat, 10, canvas.height - 60 + i * 15);
  });
}
