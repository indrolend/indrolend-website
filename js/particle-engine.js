/**
 * Lightweight Particle Engine
 * Inspired by Proton particle system concepts
 * Optimized for performance with object pooling and efficient rendering
 */

/**
 * Span - Flexible value range utility (inspired by Proton)
 * Allows random values, fixed values, or ranges
 */
class Span {
  constructor(a, b) {
    if (b === undefined) {
      this.a = a;
      this.b = a;
    } else {
      this.a = Math.min(a, b);
      this.b = Math.max(a, b);
    }
  }

  getValue() {
    return this.a + Math.random() * (this.b - this.a);
  }
}

/**
 * Particle - Individual particle with lifecycle
 */
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 2;
    this.color = '#ffffff';
    this.alpha = 1;
    this.life = 1;
    this.age = 0;
    this.dead = false;
    
    // Additional properties
    this.originalX = 0;
    this.originalY = 0;
    this.mass = 1;
    
    // Custom data
    this.data = {};
  }

  update(dt = 1) {
    if (this.dead) return;
    
    this.age += dt;
    if (this.age >= this.life) {
      this.dead = true;
      return;
    }
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    if (this.dead) return;
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * ParticlePool - Object pooling for efficient memory usage
 */
class ParticlePool {
  constructor(size = 1000) {
    this.pool = [];
    this.active = [];
    
    // Pre-create particles
    for (let i = 0; i < size; i++) {
      this.pool.push(new Particle());
    }
  }

  get() {
    let particle;
    if (this.pool.length > 0) {
      particle = this.pool.pop();
    } else {
      particle = new Particle();
    }
    particle.reset();
    this.active.push(particle);
    return particle;
  }

  release(particle) {
    const index = this.active.indexOf(particle);
    if (index > -1) {
      this.active.splice(index, 1);
      particle.reset();
      this.pool.push(particle);
    }
  }

  update(dt) {
    // Update and clean up dead particles
    for (let i = this.active.length - 1; i >= 0; i--) {
      const particle = this.active[i];
      particle.update(dt);
      if (particle.dead) {
        this.release(particle);
      }
    }
  }

  clear() {
    this.active.forEach(p => this.release(p));
  }

  getActiveCount() {
    return this.active.length;
  }
}

/**
 * Behavior base class - Defines particle behaviors
 */
class Behavior {
  constructor() {
    this.enabled = true;
  }

  apply(particle, dt) {
    // Override in subclasses
  }
}

/**
 * Alpha behavior - Fade particles over lifetime
 */
class AlphaBehavior extends Behavior {
  constructor(startAlpha = 1, endAlpha = 0) {
    super();
    this.startAlpha = startAlpha;
    this.endAlpha = endAlpha;
  }

  apply(particle, dt) {
    if (!this.enabled) return;
    const t = particle.age / particle.life;
    particle.alpha = this.startAlpha + (this.endAlpha - this.startAlpha) * t;
  }
}

/**
 * Gravity behavior
 */
class GravityBehavior extends Behavior {
  constructor(gravity = 0.1) {
    super();
    this.gravity = gravity;
  }

  apply(particle, dt) {
    if (!this.enabled) return;
    particle.vy += this.gravity * dt;
  }
}

/**
 * Attraction behavior - Pull particles to a point
 */
class AttractionBehavior extends Behavior {
  constructor(x, y, force = 0.1, radius = 100) {
    super();
    this.x = x;
    this.y = y;
    this.force = force;
    this.radius = radius;
  }

  apply(particle, dt) {
    if (!this.enabled) return;
    
    const dx = this.x - particle.x;
    const dy = this.y - particle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < this.radius && dist > 0) {
      const strength = (this.radius - dist) / this.radius;
      const forceAmount = this.force * strength;
      particle.vx += (dx / dist) * forceAmount * dt;
      particle.vy += (dy / dist) * forceAmount * dt;
    }
  }
}

/**
 * Repulsion behavior - Push particles away from a point
 */
class RepulsionBehavior extends Behavior {
  constructor(x, y, force = 0.5, radius = 100) {
    super();
    this.x = x;
    this.y = y;
    this.force = force;
    this.radius = radius;
  }

  apply(particle, dt) {
    if (!this.enabled) return;
    
    const dx = particle.x - this.x;
    const dy = particle.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < this.radius && dist > 0) {
      const strength = (this.radius - dist) / this.radius;
      const forceAmount = this.force * strength;
      particle.vx += (dx / dist) * forceAmount * dt;
      particle.vy += (dy / dist) * forceAmount * dt;
    }
  }
}

/**
 * Spring behavior - Pull particles back to original position
 */
class SpringBehavior extends Behavior {
  constructor(force = 0.02, damping = 0.98) {
    super();
    this.force = force;
    this.damping = damping;
  }

  apply(particle, dt) {
    if (!this.enabled) return;
    
    const dx = particle.originalX - particle.x;
    const dy = particle.originalY - particle.y;
    
    particle.vx += dx * this.force * dt;
    particle.vy += dy * this.force * dt;
    particle.vx *= this.damping;
    particle.vy *= this.damping;
  }
}

/**
 * Emitter - Generates and manages particles
 */
class Emitter {
  constructor() {
    this.pool = new ParticlePool();
    this.behaviors = [];
    this.rate = 0; // Particles per second
    this.rateAccumulator = 0;
    this.active = true;
    
    // Position
    this.x = 0;
    this.y = 0;
    
    // Default initialization spans
    this.radiusSpan = new Span(2, 4);
    this.lifeSpan = new Span(2, 4);
    this.velocitySpan = new Span(-1, 1);
  }

  addBehavior(behavior) {
    this.behaviors.push(behavior);
  }

  removeBehavior(behavior) {
    const index = this.behaviors.indexOf(behavior);
    if (index > -1) {
      this.behaviors.splice(index, 1);
    }
  }

  emit() {
    const particle = this.pool.get();
    
    // Initialize particle
    particle.x = this.x;
    particle.y = this.y;
    particle.originalX = this.x;
    particle.originalY = this.y;
    particle.vx = this.velocitySpan.getValue();
    particle.vy = this.velocitySpan.getValue();
    particle.radius = this.radiusSpan.getValue();
    particle.life = this.lifeSpan.getValue();
    particle.age = 0;
    particle.dead = false;
    
    return particle;
  }

  update(dt = 1) {
    if (!this.active) return;
    
    // Emit new particles based on rate
    if (this.rate > 0) {
      this.rateAccumulator += this.rate * dt;
      while (this.rateAccumulator >= 1) {
        this.emit();
        this.rateAccumulator -= 1;
      }
    }
    
    // Update existing particles
    this.pool.update(dt);
    
    // Apply behaviors
    this.pool.active.forEach(particle => {
      this.behaviors.forEach(behavior => {
        behavior.apply(particle, dt);
      });
    });
  }

  draw(ctx) {
    this.pool.active.forEach(particle => {
      particle.draw(ctx);
    });
  }

  clear() {
    this.pool.clear();
  }

  getParticleCount() {
    return this.pool.getActiveCount();
  }
}

/**
 * ParticleEngine - Main engine managing multiple emitters
 */
class ParticleEngine {
  constructor() {
    this.emitters = [];
    this.running = false;
    this.lastTime = performance.now();
    this.animationFrame = null;
  }

  addEmitter(emitter) {
    this.emitters.push(emitter);
  }

  removeEmitter(emitter) {
    const index = this.emitters.indexOf(emitter);
    if (index > -1) {
      this.emitters.splice(index, 1);
    }
  }

  update() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 16.67, 2); // Cap at 2x normal speed
    this.lastTime = now;
    
    this.emitters.forEach(emitter => {
      emitter.update(dt);
    });
  }

  draw(ctx) {
    this.emitters.forEach(emitter => {
      emitter.draw(ctx);
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  animate() {
    if (!this.running) return;
    
    this.update();
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  getTotalParticleCount() {
    return this.emitters.reduce((sum, emitter) => sum + emitter.getParticleCount(), 0);
  }

  clear() {
    this.emitters.forEach(emitter => emitter.clear());
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ParticleEngine,
    Emitter,
    Particle,
    ParticlePool,
    Span,
    Behavior,
    AlphaBehavior,
    GravityBehavior,
    AttractionBehavior,
    RepulsionBehavior,
    SpringBehavior
  };
}
