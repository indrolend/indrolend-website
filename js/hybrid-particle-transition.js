/**
 * Hybrid Particle Transition Engine
 * 
 * Implements WebGL-inspired hybrid transitions for page navigation:
 * 1. Static page display at full opacity
 * 2. Page fades 100%→0% while particles fade in 0%→100% (disintegration)
 * 3. Particles explode outward
 * 4. Particles recombine into next page shape
 * 5. Next page fades in 0%→100% while particles fade out (reconstruction)
 * 
 * Based on the WebGL Particle Engine's HybridTransitionPreset
 */

(function(window) {
  'use strict';

  // Configuration constants
  const CONFIG = {
    // Performance settings
    TARGET_FPS: 30,
    FRAME_TIME: 1000 / 30,
    
    // Mobile detection
    MOBILE_BREAKPOINT: 768,
    
    // Particle settings
    BASE_PARTICLE_COUNT: 200,
    MOBILE_PARTICLE_COUNT: 100,
    PARTICLE_SIZE_MIN: 2,
    PARTICLE_SIZE_MAX: 6,
    
    // Hybrid transition phases (in ms)
    STATIC_DISPLAY_DURATION: 0, // Show static page before transition
    DISINTEGRATION_DURATION: 600, // Page opacity 100→0, particles 0→100
    EXPLOSION_DURATION: 800, // Particles scatter
    RECOMBINATION_DURATION: 1000, // Particles recombine
    RECONSTRUCTION_DURATION: 600, // Particles fade out, new page fades in
    
    // Physics settings
    EXPLOSION_INTENSITY: 4.0, // Explosion force multiplier
    RECOMBINATION_STRENGTH: 0.12, // Vacuum pull strength
    DAMPING: 0.96, // Velocity damping
    
    // Visual settings
    CANVAS_Z_INDEX: 9999,
    OVERLAY_Z_INDEX: 10000, // Page overlay during fade
    BACKGROUND_RGB: { r: 2, g: 6, b: 18 },
    
    // Safety timeout
    SAFETY_TIMEOUT_BUFFER: 3000
  };

  /**
   * Particle class with hybrid transition support
   */
  class HybridParticle {
    constructor(x, y, color, size) {
      // Current position and properties
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.color = color;
      this.size = size;
      this.alpha = 0; // Start fully transparent for fade-in
      
      // Target properties for recombination
      this.targetX = x;
      this.targetY = y;
      this.targetColor = color;
      this.targetSize = size;
      
      // Original position (for disintegration phase)
      this.originalX = x;
      this.originalY = y;
    }

    /**
     * Apply explosion force
     */
    explode(centerX, centerY, intensity) {
      const dx = this.x - centerX;
      const dy = this.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Random explosion direction with intensity
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
      const force = intensity * (0.5 + Math.random() * 0.5);
      
      this.vx = Math.cos(angle) * force;
      this.vy = Math.sin(angle) * force;
    }

    /**
     * Set target for recombination
     */
    setTarget(x, y, color, size) {
      this.targetX = x;
      this.targetY = y;
      this.targetColor = color;
      this.targetSize = size;
    }

    /**
     * Update particle physics
     */
    update(vacuumStrength = 0) {
      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;
      
      // Apply damping
      this.vx *= CONFIG.DAMPING;
      this.vy *= CONFIG.DAMPING;
      
      // Apply vacuum force toward target if strength > 0
      if (vacuumStrength > 0) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
          const force = vacuumStrength * distance * 0.1;
          this.vx += (dx / distance) * force;
          this.vy += (dy / distance) * force;
        }
      }
    }

    /**
     * Draw particle
     */
    draw(ctx) {
      if (this.alpha <= 0) return;
      
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Hybrid Particle Transition Engine
   */
  class HybridParticleTransitionEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.pageOverlay = null; // Overlay div for page fade effects
      this.particles = [];
      this.isTransitioning = false;
      this.phase = 'idle'; // idle, static, disintegration, explosion, recombination, reconstruction
      this.phaseStartTime = 0;
      this.lastFrameTime = 0;
      this.animationId = null;
      this.safetyTimeout = null;
      this.onCompleteCallback = null;
      
      // Page screenshot data
      this.currentPageImage = null;
      this.targetPageSampledColors = [];
      
      // Performance
      this.isMobile = this._detectMobile();
      
      // Bind methods
      this._animate = this._animate.bind(this);
      this._resizeHandler = this._resizeHandler.bind(this);
      window.addEventListener('resize', this._resizeHandler);
    }

    /**
     * Detect mobile device
     */
    _detectMobile() {
      return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT && 
             navigator.maxTouchPoints > 0;
    }

    /**
     * Resize handler
     */
    _resizeHandler() {
      const wasMobile = this.isMobile;
      this.isMobile = this._detectMobile();
      
      if (this.isTransitioning && wasMobile !== this.isMobile) {
        this._completeTransition();
      }
    }

    /**
     * Get current timestamp
     */
    _now() {
      return (typeof performance !== 'undefined' && performance.now) 
        ? performance.now() 
        : Date.now();
    }

    /**
     * Initialize canvas for transition
     */
    _initCanvas() {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hybrid-particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = CONFIG.CANVAS_Z_INDEX;
        this.canvas.style.pointerEvents = 'none';
        this.ctx = this.canvas.getContext('2d', { alpha: true });
      }

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      if (!this.canvas.parentElement) {
        document.body.appendChild(this.canvas);
      }
    }

    /**
     * Initialize page overlay for fade effects
     */
    _initPageOverlay() {
      if (!this.pageOverlay) {
        this.pageOverlay = document.createElement('div');
        this.pageOverlay.id = 'hybrid-transition-overlay';
        this.pageOverlay.style.position = 'fixed';
        this.pageOverlay.style.top = '0';
        this.pageOverlay.style.left = '0';
        this.pageOverlay.style.width = '100%';
        this.pageOverlay.style.height = '100%';
        this.pageOverlay.style.zIndex = CONFIG.OVERLAY_Z_INDEX;
        this.pageOverlay.style.pointerEvents = 'none';
        this.pageOverlay.style.backgroundColor = `rgb(${CONFIG.BACKGROUND_RGB.r}, ${CONFIG.BACKGROUND_RGB.g}, ${CONFIG.BACKGROUND_RGB.b})`;
        this.pageOverlay.style.opacity = '0';
      }

      if (!this.pageOverlay.parentElement) {
        document.body.appendChild(this.pageOverlay);
      }
    }

    /**
     * Cleanup canvas and overlay
     */
    _cleanup() {
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.remove();
      }
      if (this.pageOverlay && this.pageOverlay.parentElement) {
        this.pageOverlay.remove();
      }
      this.canvas = null;
      this.ctx = null;
      this.pageOverlay = null;
    }

    /**
     * Sample colors from DOM elements to create particles
     */
    _sampleColorsFromElements(elements) {
      const colors = [];
      const particleCount = this.isMobile ? 
        CONFIG.MOBILE_PARTICLE_COUNT : 
        CONFIG.BASE_PARTICLE_COUNT;

      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const computed = window.getComputedStyle(element);
        
        // Get colors
        const bgColor = computed.backgroundColor;
        const textColor = computed.color;
        const borderColor = computed.borderColor;
        
        const elementColors = [];
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          elementColors.push(bgColor);
        }
        if (textColor) {
          elementColors.push(textColor);
        }
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
          elementColors.push(borderColor);
        }

        // Sample positions within element
        const samplesPerElement = Math.max(1, Math.floor(particleCount / elements.length / 3));
        for (let i = 0; i < samplesPerElement; i++) {
          const x = rect.left + Math.random() * rect.width;
          const y = rect.top + Math.random() * rect.height;
          const color = elementColors[Math.floor(Math.random() * elementColors.length)] || 
                       'rgba(94, 232, 125, 0.8)';
          colors.push({ x, y, color });
        }
      });

      // Fill remaining with random positions
      while (colors.length < particleCount) {
        colors.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          color: 'rgba(94, 232, 125, 0.8)'
        });
      }

      return colors.slice(0, particleCount);
    }

    /**
     * Create particles from sampled colors
     */
    _createParticles(sampledColors) {
      this.particles = [];
      sampledColors.forEach(sample => {
        const size = CONFIG.PARTICLE_SIZE_MIN + 
                    Math.random() * (CONFIG.PARTICLE_SIZE_MAX - CONFIG.PARTICLE_SIZE_MIN);
        this.particles.push(new HybridParticle(sample.x, sample.y, sample.color, size));
      });
    }

    /**
     * Animation loop
     */
    _animate(currentTime) {
      if (!this.isTransitioning) return;

      try {
        // FPS throttling
        const elapsed = currentTime - this.lastFrameTime;
        if (elapsed < CONFIG.FRAME_TIME) {
          this.animationId = requestAnimationFrame(this._animate);
          return;
        }
        this.lastFrameTime = currentTime - (elapsed % CONFIG.FRAME_TIME);

        // Calculate phase progress
        const phaseElapsed = currentTime - this.phaseStartTime;
        const phaseDuration = this._getPhaseDuration();
        const progress = Math.min(phaseElapsed / phaseDuration, 1);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw based on phase
        this._updatePhase(progress, elapsed);

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Check if phase is complete
        if (progress >= 1) {
          this._advancePhase();
        }

        // Continue animation
        this.animationId = requestAnimationFrame(this._animate);
      } catch (error) {
        console.error('[HybridTransition] Animation error:', error);
        this._completeTransition();
      }
    }

    /**
     * Get duration for current phase
     */
    _getPhaseDuration() {
      switch (this.phase) {
        case 'static': return CONFIG.STATIC_DISPLAY_DURATION;
        case 'disintegration': return CONFIG.DISINTEGRATION_DURATION;
        case 'explosion': return CONFIG.EXPLOSION_DURATION;
        case 'recombination': return CONFIG.RECOMBINATION_DURATION;
        case 'reconstruction': return CONFIG.RECONSTRUCTION_DURATION;
        default: return 1000;
      }
    }

    /**
     * Update particles based on current phase
     */
    _updatePhase(progress, deltaTime) {
      const dt = deltaTime / 1000; // Convert to seconds

      switch (this.phase) {
        case 'static':
          // Just waiting, no updates needed
          break;

        case 'disintegration':
          // Page fades out (100→0), particles fade in (0→100)
          this.pageOverlay.style.opacity = progress.toString();
          this.particles.forEach(particle => {
            particle.alpha = progress;
          });
          break;

        case 'explosion':
          // Particles explode outward
          this.particles.forEach(particle => {
            particle.update(0);
          });
          break;

        case 'recombination':
          // Particles pull toward target positions
          const vacuumStrength = CONFIG.RECOMBINATION_STRENGTH * this._easeInOutCubic(progress);
          this.particles.forEach(particle => {
            particle.update(vacuumStrength);
          });
          break;

        case 'reconstruction':
          // Particles fade out (100→0), background stays solid, then trigger navigation
          const fadeOutProgress = this._easeInQuad(progress);
          this.particles.forEach(particle => {
            particle.alpha = 1 - fadeOutProgress;
          });
          break;
      }
    }

    /**
     * Easing functions
     */
    _easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    _easeInQuad(t) {
      return t * t;
    }

    /**
     * Advance to next phase
     */
    _advancePhase() {
      this.phaseStartTime = this._now();

      switch (this.phase) {
        case 'static':
          this.phase = 'disintegration';
          console.log('[HybridTransition] → Disintegration phase');
          break;

        case 'disintegration':
          this.phase = 'explosion';
          console.log('[HybridTransition] → Explosion phase');
          // Apply explosion force
          const centerX = this.canvas.width / 2;
          const centerY = this.canvas.height / 2;
          this.particles.forEach(particle => {
            particle.explode(centerX, centerY, CONFIG.EXPLOSION_INTENSITY);
          });
          break;

        case 'explosion':
          this.phase = 'recombination';
          console.log('[HybridTransition] → Recombination phase');
          // Set target positions for recombination
          if (this.targetPageSampledColors.length > 0) {
            this.particles.forEach((particle, i) => {
              const targetIndex = i % this.targetPageSampledColors.length;
              const target = this.targetPageSampledColors[targetIndex];
              particle.setTarget(target.x, target.y, target.color, particle.size);
            });
          }
          break;

        case 'recombination':
          this.phase = 'reconstruction';
          console.log('[HybridTransition] → Reconstruction phase');
          break;

        case 'reconstruction':
          // Transition complete - trigger navigation
          console.log('[HybridTransition] → Complete');
          this._completeTransition();
          break;
      }
    }

    /**
     * Complete transition
     */
    _completeTransition() {
      this.isTransitioning = false;
      
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      if (this.safetyTimeout) {
        clearTimeout(this.safetyTimeout);
        this.safetyTimeout = null;
      }
      
      this._cleanup();

      if (this.onCompleteCallback && typeof this.onCompleteCallback === 'function') {
        const callback = this.onCompleteCallback;
        this.onCompleteCallback = null;
        callback();
      }
    }

    /**
     * Start hybrid transition
     */
    startTransition(options = {}) {
      if (this.isTransitioning) {
        console.warn('[HybridTransition] Transition already in progress');
        return;
      }

      try {
        console.log('[HybridTransition] Starting hybrid transition');
        
        this.isTransitioning = true;
        this.phase = CONFIG.STATIC_DISPLAY_DURATION > 0 ? 'static' : 'disintegration';
        this.phaseStartTime = this._now();
        this.lastFrameTime = this.phaseStartTime;
        this.onCompleteCallback = options.onComplete || null;

        // Initialize canvas and overlay
        this._initCanvas();
        this._initPageOverlay();

        // Sample colors from current page elements
        const elementsToSample = options.fromElements || [];
        const sampledColors = this._sampleColorsFromElements(elementsToSample);
        
        // Sample colors for target page (approximate using same elements for now)
        this.targetPageSampledColors = this._sampleColorsFromElements(elementsToSample);

        // Create particles
        this._createParticles(sampledColors);

        // Calculate total transition duration
        const totalDuration = CONFIG.STATIC_DISPLAY_DURATION +
                             CONFIG.DISINTEGRATION_DURATION +
                             CONFIG.EXPLOSION_DURATION +
                             CONFIG.RECOMBINATION_DURATION +
                             CONFIG.RECONSTRUCTION_DURATION;

        // Set safety timeout
        this.safetyTimeout = setTimeout(() => {
          console.warn('[HybridTransition] Safety timeout triggered');
          this._completeTransition();
        }, totalDuration + CONFIG.SAFETY_TIMEOUT_BUFFER);

        // Start animation
        console.log(`[HybridTransition] Total duration: ${totalDuration}ms`);
        this.animationId = requestAnimationFrame(this._animate);
      } catch (error) {
        console.error('[HybridTransition] Failed to start transition:', error);
        this._completeTransition();
      }
    }

    /**
     * Check if transition is active
     */
    isActive() {
      return this.isTransitioning;
    }

    /**
     * Destroy engine
     */
    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.safetyTimeout) {
        clearTimeout(this.safetyTimeout);
        this.safetyTimeout = null;
      }
      this._cleanup();
      window.removeEventListener('resize', this._resizeHandler);
      this.particles = [];
      this.isTransitioning = false;
    }
  }

  // Create singleton instance
  const hybridEngine = new HybridParticleTransitionEngine();

  // Export to global scope
  window.HybridParticleTransition = {
    engine: hybridEngine,
    start: (options) => hybridEngine.startTransition(options),
    isActive: () => hybridEngine.isActive()
  };

})(window);
