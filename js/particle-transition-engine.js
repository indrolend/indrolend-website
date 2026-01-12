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
    
    // Canvas settings
    CANVAS_Z_INDEX: 9999,
    BACKGROUND_COLOR: 'rgba(2, 6, 18, 1)', // Match website background
    
    // Debug settings
    DEBUG_MODE: false, // Set to true to enable debug logging and simple particle test
    DEBUG_PARTICLE_COUNT: 50 // Simple particle count for debug mode
  };
  
  // Debug logging utility
  function debugLog(message, data) {
    if (CONFIG.DEBUG_MODE) {
      console.log(`[ParticleEngine] ${message}`, data !== undefined ? data : '');
    }
  }
  
  function debugError(message, error) {
    if (CONFIG.DEBUG_MODE) {
      console.error(`[ParticleEngine ERROR] ${message}`, error);
    }
  }
  
  function debugWarn(message, data) {
    if (CONFIG.DEBUG_MODE) {
      console.warn(`[ParticleEngine WARN] ${message}`, data !== undefined ? data : '');
    }
  }

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
      debugLog('Initializing ParticleTransitionEngine...');
      
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.isTransitioning = false;
      this.transitionPhase = 'idle'; // 'idle', 'dispersing', 'morphing', 'fading'
      this.phaseStartTime = 0;
      this.lastFrameTime = 0;
      this.animationId = null;
      this.onCompleteCallback = null;
      
      // Performance tracking
      this.isMobile = this._detectMobile();
      debugLog('Mobile device detected:', this.isMobile);
      
      // Update mobile detection on resize
      this._resizeHandler = () => {
        const wasMobile = this.isMobile;
        this.isMobile = this._detectMobile();
        
        // If transition is active and device type changed, abort it gracefully
        if (this.isTransitioning && wasMobile !== this.isMobile) {
          debugWarn('Device type changed during transition, aborting transition');
          this._completeTransition();
        }
      };
      window.addEventListener('resize', this._resizeHandler);
      
      // Bind methods
      this._animate = this._animate.bind(this);
      
      debugLog('ParticleTransitionEngine initialized successfully');
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
      debugLog('Initializing canvas...');
      
      try {
        // Check for existing canvas with id="particle-canvas"
        let existingCanvas = document.getElementById('particle-canvas');
        
        // Create canvas if it doesn't exist
        if (!this.canvas) {
          if (existingCanvas) {
            debugLog('Found existing canvas with id="particle-canvas"');
            this.canvas = existingCanvas;
          } else {
            debugLog('Creating new canvas element');
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particle-transition-canvas';
          }
          
          this.canvas.style.position = 'fixed';
          this.canvas.style.top = '0';
          this.canvas.style.left = '0';
          this.canvas.style.width = '100%';
          this.canvas.style.height = '100%';
          this.canvas.style.zIndex = CONFIG.CANVAS_Z_INDEX;
          this.canvas.style.pointerEvents = 'none';
          
          try {
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            debugLog('Canvas 2D context acquired successfully');
          } catch (ctxError) {
            debugError('Failed to get 2D context from canvas', ctxError);
            throw new Error('Could not get 2D context from canvas: ' + ctxError.message);
          }
        }

        // Set canvas dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        debugLog('Canvas dimensions set:', { width: this.canvas.width, height: this.canvas.height });

        // Append to body if not already there
        if (!this.canvas.parentElement) {
          document.body.appendChild(this.canvas);
          debugLog('Canvas appended to document body');
        }
        
        debugLog('Canvas initialization complete');
      } catch (error) {
        debugError('Canvas initialization failed', error);
        throw error;
      }
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

      // Clear canvas
      this.ctx.fillStyle = CONFIG.BACKGROUND_COLOR;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      this._cleanupCanvas();

      if (this.onCompleteCallback) {
        this.onCompleteCallback();
        this.onCompleteCallback = null;
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
      debugLog('startTransition called with options:', options);
      
      if (this.isTransitioning) {
        debugWarn('Transition already in progress, ignoring new request');
        return;
      }

      try {
        this.isTransitioning = true;
        this.transitionPhase = 'dispersing';
        this.phaseStartTime = this._now();
        this.lastFrameTime = this.phaseStartTime;
        this.onCompleteCallback = options.onComplete || null;

        // Initialize canvas
        debugLog('Initializing canvas for transition...');
        this._initCanvas();

        // Create particles from elements
        debugLog('Creating particles from elements...');
        this._createParticlesFromElements(options.fromElements, {
          colors: options.colors
        });
        debugLog('Created particles count:', this.particles.length);

        // Disperse particles from center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.particles.forEach(particle => {
          particle.disperse(centerX, centerY, CONFIG.DISPERSION_SPEED);
        });
        debugLog('Particles dispersed from center');

        // Start animation
        this.animationId = requestAnimationFrame(this._animate);
        debugLog('Animation started, animation ID:', this.animationId);
      } catch (error) {
        debugError('Failed to start transition', error);
        this.isTransitioning = false;
        throw error;
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
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  function setDebugMode(enabled) {
    CONFIG.DEBUG_MODE = !!enabled;
    debugLog('Debug mode ' + (enabled ? 'enabled' : 'disabled'));
  }
  
  /**
   * Test function to render simple particles on the canvas
   * Useful for debugging in browser console
   * @param {string} canvasId - Optional canvas element ID (defaults to 'particle-canvas')
   */
  function testSimpleParticles(canvasId = 'particle-canvas') {
    debugLog('Starting simple particle test...');
    
    try {
      // Find or create canvas
      let canvas = document.getElementById(canvasId);
      if (!canvas) {
        debugLog('Canvas not found, creating new one');
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '9999';
        canvas.style.pointerEvents = 'none';
        canvas.style.backgroundColor = 'rgba(2, 6, 18, 0.9)';
        document.body.appendChild(canvas);
        debugLog('Canvas created and appended to body');
      } else {
        debugLog('Found existing canvas:', canvasId);
      }
      
      // Get context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        debugError('Failed to get 2D context');
        return;
      }
      debugLog('Canvas 2D context acquired');
      
      // Set canvas dimensions
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      debugLog('Canvas dimensions:', { width: canvas.width, height: canvas.height });
      
      // Create simple test particles
      const particles = [];
      const particleCount = CONFIG.DEBUG_PARTICLE_COUNT;
      const colors = ['rgba(94, 232, 125, 0.8)', 'rgba(109, 217, 232, 0.9)', 'rgba(255, 140, 140, 0.9)'];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3
        });
      }
      debugLog('Created test particles:', particleCount);
      
      // Animation function
      let frameCount = 0;
      function animate() {
        // Clear canvas
        ctx.fillStyle = 'rgba(2, 6, 18, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(p => {
          // Update position
          p.x += p.vx;
          p.y += p.vy;
          
          // Bounce off edges
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          
          // Draw particle
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        
        frameCount++;
        if (frameCount <= 300) { // Run for ~5 seconds at 60fps
          requestAnimationFrame(animate);
        } else {
          debugLog('Test animation complete');
          console.log('[ParticleEngine] Test complete! Canvas is still visible for inspection.');
        }
      }
      
      debugLog('Starting test animation...');
      animate();
      
      return {
        canvas: canvas,
        particles: particles,
        message: 'Test particles running! Check the canvas.'
      };
      
    } catch (error) {
      debugError('Test failed', error);
      console.error('[ParticleEngine] Test failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Public API - Initialize navigation hooks for page transitions
   */
  function initPageTransitions(config = {}) {
    debugLog('Initializing page transitions with config:', config);
    
    // Default configuration
    const defaultConfig = {
      enabledPages: ['all'], // 'all' or array of page names
      transitionDuration: 1500,
      customBehaviors: {}
    };

    const settings = Object.assign({}, defaultConfig, config);
    debugLog('Merged settings:', settings);
    
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
      debugLog('DOM Content Loaded, hooking navigation links');
      const links = document.querySelectorAll('a');
      debugLog('Found links to hook:', links.length);
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
    behaviors: PAGE_BEHAVIORS,
    // Debug utilities
    setDebugMode: setDebugMode,
    testSimpleParticles: testSimpleParticles,
    version: '1.1.0' // Version for tracking
  };
  
  // Log initialization message
  console.log('[ParticleEngine] Particle Transition Engine loaded successfully. Version: 1.1.0');
  console.log('[ParticleEngine] Available methods:');
  console.log('  - ParticleTransitionEngine.init(config) - Initialize page transitions');
  console.log('  - ParticleTransitionEngine.setDebugMode(true/false) - Enable/disable debug logging');
  console.log('  - ParticleTransitionEngine.testSimpleParticles() - Test canvas with simple particles');
  console.log('  - ParticleTransitionEngine.engine.startTransition(options) - Manually trigger transition');
  debugLog('Particle Transition Engine module loaded');

})(window);
