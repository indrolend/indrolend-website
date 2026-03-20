// SPA Engine: Character Particles
// Shared particle logic for SPA homeView and legacy MPA script.js
// Exports factory and update/draw helpers

// Particle constants
const MAX_SPEED = 0.6;
const PARTICLE_COUNT = 60;
const CONNECTION_DIST = 120;
const REPULSE_DIST = 150;

function makeParticle(x, y, char) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * MAX_SPEED,
    vy: (Math.random() - 0.5) * MAX_SPEED,
    char,
    active: true
  };
}

function updateParticles(particles, mouse) {
  for (const p of particles) {
    // Repulsion
    if (mouse && p.active) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPULSE_DIST) {
        p.vx += dx / dist * 0.1;
        p.vy += dy / dist * 0.1;
      }
    }
    // Move
    p.x += p.vx;
    p.y += p.vy;
    // Damping
    p.vx *= 0.98;
    p.vy *= 0.98;
  }
}

function drawParticles(ctx, particles) {
  ctx.save();
  for (const p of particles) {
    ctx.fillText(p.char, p.x, p.y);
  }
  ctx.restore();
}

function connectParticles(ctx, particles) {
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECTION_DIST) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

module.exports = {
  makeParticle,
  updateParticles,
  drawParticles,
  connectParticles,
  MAX_SPEED,
  PARTICLE_COUNT,
  CONNECTION_DIST,
  REPULSE_DIST
};
