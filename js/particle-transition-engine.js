/**
 * Particle Transition Engine
 * 
 * A universal, scalable engine for immersive particle-based page transitions.
 * Dynamically breaks down page visuals into particles, disperses them, and 
 * reconfigures them as the next page loads.
 * 
 * Features:
 * - GPU-friendly Canvas API rendering
 * - Adaptive particle count based on screen size
 * - Customizable transition behaviors per page
 * - Performance-optimized (30 FPS target)
 * - Modular and extensible architecture
 */

(function(window) {
  'use strict';

  // Configuration constants
  const CONFIG = {
    // Performance settings
    TARGET_FPS: 30,
    FRAME_TIME: 1000 / 30, // ~33ms per frame
    
    // Mobile detection
    MOBILE_BREAKPOINT: 768,
    
    // Particle settings
    BASE_PARTICLE_COUNT: 150,
    MOBILE_PARTICLE_COUNT: 80,
    PARTICLE_SIZE_MIN: 2,
    PARTICLE_SIZE_MAX: 5,
    
    // Physics settings
    DISPERSION_SPEED: 3.0,
    MORPH_SPEED: 0.08,
    DAMPING: 0.95,
    
    // Timing settings
    DISPERSION_DURATION: 1200, // ms
    MORPH_DURATION: 1000, // ms
    FADE_DURATION: 300, // ms
    SAFETY_TIMEOUT_BUFFER: 2000, // ms - Extra time before forcing transition cleanup
    
    // Canvas settings
    CANVAS_Z_INDEX: 9999,
    BACKGROUND_COLOR: 'rgba(2, 6, 18, 0.95)' // Slightly transparent to prevent full blackout
  };

  /**
   * Particle class representing a single particle in the transition
   */
  class TransitionParticle {
    constructor(x, y, color, size) {
      this.x = x;
      this.y = y;
      this.targetX = x;
      this.targetY = y;
      this.vx = 0;
      this.vy = 0;
      this.color = color;
      this.size = size;
      this.alpha = 1.0;
      this.life = 1.0;
    }

    /**
     * Apply dispersal force - particles explode outward from center
     */
    disperse(centerX, centerY, strength) {
      const dx = this.x - centerX;
      const dy = this.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Normalize and apply force
      this.vx = (dx / distance) * strength * (0.5 + Math.random());
      this.vy = (dy / distance) * strength * (0.5 + Math.random());
      
      // Add some randomness for organic feel
      this.vx += (Math.random() - 0.5) * strength * 0.3;
      this.vy += (Math.random() - 0.5) * strength * 0.3;
    }

    /**
     * Set target position for morphing
     */
    setTarget(x, y) {
      this.targetX = x;
      this.targetY = y;
    }

    /**
     * Update particle position with physics
     */
    update(morphStrength = 0) {
      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Apply damping
      this.vx *= CONFIG.DAMPING;
      this.vy *= CONFIG.DAMPING;

      // Morph towards target if strength > 0
      if (morphStrength > 0) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.vx += dx * morphStrength;
        this.vy += dy * morphStrength;
      }
    }

    /**
     * Draw particle on canvas
     */
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha * this.life;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Main Particle Transition Engine
   */
  class ParticleTransitionEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.isTransitioning = false;
      this.transitionPhase = 'idle'; // 'idle', 'dispersing', 'morphing', 'fading'
      this.phaseStartTime = 0;
      this.lastFrameTime = 0;
      this.animationId = null;
      this.onCompleteCallback = null;
      this.transitionTimeout = null; // Safety timeout to prevent stuck transitions
      
      // Performance tracking
      this.isMobile = this._detectMobile();
      
      // Update mobile detection on resize
      this._resizeHandler = () => {
        const wasMobile = this.isMobile;
        this.isMobile = this._detectMobile();
        
        // If transition is active and device type changed, abort it gracefully
        if (this.isTransitioning && wasMobile !== this.isMobile) {
          this._completeTransition();
        }
      };
      window.addEventListener('resize', this._resizeHandler);
      
      // Bind methods
      this._animate = this._animate.bind(this);
    }

    /**
     * Detect if device is mobile for performance optimization
     */
    _detectMobile() {
      return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT && 
             navigator.maxTouchPoints > 0;
    }

    /**
     * Get current timestamp with fallback for older browsers
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
      // Create canvas if it doesn't exist
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-transition-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = CONFIG.CANVAS_Z_INDEX;
        this.canvas.style.pointerEvents = 'none';
        this.ctx = this.canvas.getContext('2d', { alpha: false });
      }

      // Set canvas dimensions
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Append to body if not already there
      if (!this.canvas.parentElement) {
        document.body.appendChild(this.canvas);
      }

      // Make canvas transparent initially
      this.canvas.style.backgroundColor = 'transparent';
    }

    /**
     * Clean up canvas after transition
     */
    _cleanupCanvas() {
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.remove(); // Modern method
      }
      this.canvas = null;
      this.ctx = null;
    }

    /**
     * Sample colors from DOM elements to create particles
     */
    _sampleElementColors(element) {
      const colors = [];
      const computed = window.getComputedStyle(element);
      
      // Get background color
      const bgColor = computed.backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        colors.push(bgColor);
      }

      // Get text color
      const textColor = computed.color;
      if (textColor) {
        colors.push(textColor);
      }

      // Get border color
      const borderColor = computed.borderColor;
      if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
        colors.push(borderColor);
      }

      // Fallback to default colors if none found
      if (colors.length === 0) {
        colors.push('rgba(94, 232, 125, 0.8)', 'rgba(109, 217, 232, 0.8)', 'rgba(255, 140, 140, 0.8)');
      }

      return colors;
    }

    /**
     * Create particles from DOM elements
     */
    _createParticlesFromElements(elements, config = {}) {
      const particleCount = this.isMobile ? 
        CONFIG.MOBILE_PARTICLE_COUNT : 
        CONFIG.BASE_PARTICLE_COUNT;

      this.particles = [];

      // If no elements, create particles from center
      if (!elements || elements.length === 0) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const defaultColors = config.colors || ['rgba(94, 232, 125, 0.8)', 'rgba(109, 217, 232, 0.8)'];

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = Math.random() * 100 + 50;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
          const size = CONFIG.PARTICLE_SIZE_MIN + Math.random() * (CONFIG.PARTICLE_SIZE_MAX - CONFIG.PARTICLE_SIZE_MIN);
          
          this.particles.push(new TransitionParticle(x, y, color, size));
        }
        return;
      }

      // Create particles from elements
      const particlesPerElement = Math.ceil(particleCount / elements.length);
      
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const colors = config.colors || this._sampleElementColors(element);
        
        for (let i = 0; i < particlesPerElement && this.particles.length < particleCount; i++) {
          const x = rect.left + Math.random() * rect.width;
          const y = rect.top + Math.random() * rect.height;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = CONFIG.PARTICLE_SIZE_MIN + Math.random() * (CONFIG.PARTICLE_SIZE_MAX - CONFIG.PARTICLE_SIZE_MIN);
          
          this.particles.push(new TransitionParticle(x, y, color, size));
        }
      });
    }

    /**
     * Animation loop with FPS throttling
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
        const progress = Math.min(phaseElapsed / this._getPhaseDuration(), 1);

        // Calculate background opacity based on phase
        let bgOpacity = 0;
        if (this.transitionPhase === 'dispersing') {
          // Fade in background during dispersing (0 to 0.95)
          bgOpacity = progress * 0.95;
        } else if (this.transitionPhase === 'morphing') {
          // Keep background solid during morphing
          bgOpacity = 0.95;
        } else if (this.transitionPhase === 'fading') {
          // Fade out background during fading (0.95 to 0)
          bgOpacity = (1 - progress) * 0.95;
        } else {
          // Default case for any unexpected phase - fade to transparent
          bgOpacity = 0;
        }

        // Clear canvas with dynamic opacity
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (bgOpacity > 0) {
          this.ctx.fillStyle = `rgba(2, 6, 18, ${bgOpacity})`;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Update and draw particles based on phase
        this._updatePhase(progress);

        // Draw all particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Check if phase is complete
        if (progress >= 1) {
          this._advancePhase();
        }

        // Continue animation
        this.animationId = requestAnimationFrame(this._animate);
      } catch (error) {
        console.error('Particle transition animation error:', error);
        this._completeTransition();
      }
    }

    /**
     * Get duration for current phase
     */
    _getPhaseDuration() {
      switch (this.transitionPhase) {
        case 'dispersing': return CONFIG.DISPERSION_DURATION;
        case 'morphing': return CONFIG.MORPH_DURATION;
        case 'fading': return CONFIG.FADE_DURATION;
        default: return 1000;
      }
    }

    /**
     * Update particles based on current phase
     */
    _updatePhase(progress) {
      switch (this.transitionPhase) {
        case 'dispersing':
          this.particles.forEach(particle => {
            particle.update();
          });
          break;

        case 'morphing':
          const morphStrength = CONFIG.MORPH_SPEED * (1 - progress);
          this.particles.forEach(particle => {
            particle.update(morphStrength);
          });
          break;

        case 'fading':
          this.particles.forEach(particle => {
            particle.update(0);
            particle.alpha = 1 - progress;
          });
          break;
      }
    }

    /**
     * Advance to next transition phase
     */
    _advancePhase() {
      this.phaseStartTime = this._now();

      switch (this.transitionPhase) {
        case 'dispersing':
          this.transitionPhase = 'fading';
          break;

        case 'morphing':
          this.transitionPhase = 'fading';
          break;

        case 'fading':
          // Transition complete
          this._completeTransition();
          break;
      }
    }

    /**
     * Complete the transition
     */
    _completeTransition() {
      this.isTransitioning = false;
      
      // Clear animation frame
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      // Clear safety timeout
      if (this.transitionTimeout) {
        clearTimeout(this.transitionTimeout);
        this.transitionTimeout = null;
      }
      
      // Clean up canvas
      this._cleanupCanvas();

      // Execute callback
      if (this.onCompleteCallback) {
        const callback = this.onCompleteCallback;
        this.onCompleteCallback = null;
        callback();
      }
    }

    /**
     * Clean up and destroy the engine
     */
    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this._cleanupCanvas();
      window.removeEventListener('resize', this._resizeHandler);
      this.particles = [];
      this.isTransitioning = false;
    }

    /**
     * Start a transition
     * 
     * @param {Object} options - Transition options
     * @param {Array} options.fromElements - DOM elements to create particles from
     * @param {Array} options.colors - Custom particle colors
     * @param {Function} options.onComplete - Callback when transition completes
     */
    startTransition(options = {}) {
      if (this.isTransitioning) return;

      try {
        this.isTransitioning = true;
        this.transitionPhase = 'dispersing';
        this.phaseStartTime = this._now();
        this.lastFrameTime = this.phaseStartTime;
        this.onCompleteCallback = options.onComplete || null;

        // Initialize canvas
        this._initCanvas();

        // Create particles from elements
        this._createParticlesFromElements(options.fromElements, {
          colors: options.colors
        });

        // Disperse particles from center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.particles.forEach(particle => {
          particle.disperse(centerX, centerY, CONFIG.DISPERSION_SPEED);
        });

        // Set safety timeout to prevent stuck transitions
        const totalDuration = CONFIG.DISPERSION_DURATION + CONFIG.MORPH_DURATION + CONFIG.FADE_DURATION;
        this.transitionTimeout = setTimeout(() => {
          console.warn('Particle transition timeout - forcing completion');
          this._completeTransition();
        }, totalDuration + CONFIG.SAFETY_TIMEOUT_BUFFER);

        // Start animation
        this.animationId = requestAnimationFrame(this._animate);
      } catch (error) {
        console.error('Failed to start particle transition:', error);
        this._completeTransition();
      }
    }

    /**
     * Check if transition is in progress
     */
    isActive() {
      return this.isTransitioning;
    }
  }

  // Create singleton instance
  const transitionEngine = new ParticleTransitionEngine();

  /**
   * Public API - Initialize navigation hooks for page transitions
   */
  function initPageTransitions(config = {}) {
    // Default configuration
    const defaultConfig = {
      enabledPages: ['all'], // 'all' or array of page names
      transitionDuration: 1500,
      customBehaviors: {}
    };

    const settings = Object.assign({}, defaultConfig, config);
    
    // Store observer for cleanup
    let mutationObserver = null;

    /**
     * Hook into navigation links
     */
    function hookNavigationLink(link) {
      // Skip external links - safely check hostname
      try {
        if (link.target === '_blank' || 
            (link.hostname && link.hostname !== window.location.hostname)) {
          return;
        }
      } catch (e) {
        // Ignore errors from accessing hostname on relative URLs
      }

      // Skip if no href or dangerous URL schemes
      const href = link.getAttribute('href');
      if (!href || href === '#') {
        return;
      }
      
      // Security: Block dangerous URL schemes
      const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
      const lowerHref = href.toLowerCase().trim();
      if (dangerousSchemes.some(scheme => lowerHref.startsWith(scheme))) {
        return;
      }

      // Add click listener
      link.addEventListener('click', function(e) {
        // Skip if transition already active
        if (transitionEngine.isActive()) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        
        // Get elements to sample for particles
        const elementsToSample = getPageElements();
        
        // Get custom colors if defined
        const pageName = getPageName(href);
        const customBehavior = settings.customBehaviors[pageName];
        const colors = customBehavior?.colors;

        // Start transition
        transitionEngine.startTransition({
          fromElements: elementsToSample,
          colors: colors,
          onComplete: () => {
            // Navigate to new page
            window.location.href = href;
          }
        });
      });
    }

    /**
     * Get key elements from page for particle sampling
     */
    function getPageElements() {
      const selectors = [
        '.important-word',
        '.app-card',
        '.fkrc-verifywin-word',
        'button',
        'h1',
        'h2',
        '.gallery-filename',
        '.home-header'
      ];

      let elements = [];
      selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        elements = elements.concat(Array.from(found));
      });

      // Limit to visible elements
      elements = elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      return elements.slice(0, 20); // Limit to 20 elements for performance
    }

    /**
     * Extract page name from href
     */
    function getPageName(href) {
      const match = href.match(/\/([^\/]+)\.html/);
      return match ? match[1] : 'unknown';
    }

    // Hook all navigation links on page load
    document.addEventListener('DOMContentLoaded', () => {
      const links = document.querySelectorAll('a');
      links.forEach(hookNavigationLink);
    });

    // Also hook links added dynamically (with debounce)
    let debounceTimer = null;
    mutationObserver = new MutationObserver(() => {
      // Debounce to prevent excessive DOM queries
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const links = document.querySelectorAll('a:not([data-transition-hooked])');
        links.forEach(link => {
          hookNavigationLink(link);
          link.setAttribute('data-transition-hooked', 'true');
        });
      }, 100); // 100ms debounce
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Return cleanup function
    return {
      disconnect: () => {
        if (mutationObserver) {
          mutationObserver.disconnect();
          mutationObserver = null;
        }
      }
    };
  }

  /**
   * Define custom transition behaviors for specific pages
   */
  const PAGE_BEHAVIORS = {
    home: {
      colors: [
        'rgba(94, 232, 125, 0.8)',  // Green (theme color)
        'rgba(109, 217, 232, 0.9)',  // Cyan (X color)
        'rgba(255, 140, 140, 0.9)'   // Red (O color)
      ]
    },
    gallery: {
      colors: [
        'rgba(255, 0, 0, 0.9)',      // Rainbow colors
        'rgba(255, 127, 0, 0.9)',
        'rgba(255, 255, 0, 0.9)',
        'rgba(0, 255, 0, 0.9)',
        'rgba(0, 0, 255, 0.9)',
        'rgba(148, 0, 211, 0.9)'
      ]
    },
    tictactoe: {
      colors: [
        'rgba(109, 217, 232, 0.9)',  // X color
        'rgba(255, 140, 140, 0.9)',  // O color
        'rgba(255, 255, 255, 0.6)'   // Guide dots
      ]
    },
    'dev-history': {
      colors: [
        'rgba(94, 232, 125, 0.8)',   // Theme green
        'rgba(0, 255, 0, 0.6)',
        'rgba(50, 255, 150, 0.7)'
      ]
    }
  };

  // Export to global scope
  window.ParticleTransitionEngine = {
    init: initPageTransitions,
    engine: transitionEngine,
    behaviors: PAGE_BEHAVIORS
  };

})(window);
