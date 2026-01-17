/**
 * WebGL Page Transition Wrapper
 * 
 * Integrates the WebGL HybridEngine for seamless page transitions with:
 * 1. Page disintegration (opacity 100→0, particles fade in 0→100)
 * 2. Particle explosion
 * 3. Particle recombination into next page shape
 * 4. Page reconstruction (particles fade out, next page fades in)
 */

import { HybridEngine } from './webgl-engine/HybridEngine.js';
import { HybridTransitionPreset } from './webgl-engine/presets/HybridTransitionPreset.js';

class WebGLPageTransition {
  constructor() {
    this.engine = null;
    this.canvas = null;
    this.isTransitioning = false;
    this.onCompleteCallback = null;
    this.pageOverlay = null;
    
    // Configuration for page transitions
    this.config = {
      particleCount: window.innerWidth > 768 ? 400 : 200,
      staticDisplayDuration: 0, // Show static page before starting
      disintegrationDuration: 600, // Page fade out while particles fade in
      explosionIntensity: 150,
      explosionTime: 800,
      recombinationDuration: 1200,
      recombinationChaos: 0.3,
      vacuumStrength: 0.15,
      blendDuration: 600 // Particles fade out while next page fades in
    };
  }

  /**
   * Initialize the WebGL engine
   */
  async initialize() {
    try {
      // Create canvas for WebGL rendering
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'webgl-transition-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '9999';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.display = 'none';
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Create page overlay for fade effects
      this.pageOverlay = document.createElement('div');
      this.pageOverlay.id = 'webgl-page-overlay';
      this.pageOverlay.style.position = 'fixed';
      this.pageOverlay.style.top = '0';
      this.pageOverlay.style.left = '0';
      this.pageOverlay.style.width = '100%';
      this.pageOverlay.style.height = '100%';
      this.pageOverlay.style.zIndex = '10000';
      this.pageOverlay.style.pointerEvents = 'none';
      this.pageOverlay.style.backgroundColor = 'rgb(2, 6, 18)';
      this.pageOverlay.style.opacity = '0';
      this.pageOverlay.style.display = 'none';
      this.pageOverlay.style.transition = 'opacity 0.6s ease-in-out';

      // Initialize HybridEngine
      this.engine = new HybridEngine(this.canvas, {
        particleCount: this.config.particleCount,
        speed: 1.0,
        autoResize: true,
        enableTriangulation: false,
        staticDisplayDuration: this.config.staticDisplayDuration,
        disintegrationDuration: this.config.disintegrationDuration
      });

      console.log('[WebGLPageTransition] Engine initialized successfully');
      return true;
    } catch (error) {
      console.error('[WebGLPageTransition] Failed to initialize engine:', error);
      return false;
    }
  }

  /**
   * Create a mock image from DOM elements for particle generation
   */
  async createMockImageFromElements(elements) {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        
        // Fill with background color
        ctx.fillStyle = 'rgb(2, 6, 18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw simplified representations of elements
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const computed = window.getComputedStyle(element);
          
          // Draw background
          if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            ctx.fillStyle = computed.backgroundColor;
            ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
          }
          
          // Draw text color as overlay
          if (computed.color) {
            ctx.fillStyle = computed.color;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
            ctx.globalAlpha = 1.0;
          }
        });

        // Convert canvas to image
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = canvas.toDataURL();
      } catch (error) {
        console.error('[WebGLPageTransition] Failed to create mock image:', error);
        resolve(null);
      }
    });
  }

  /**
   * Start hybrid transition
   */
  async startTransition(options = {}) {
    if (this.isTransitioning) {
      console.warn('[WebGLPageTransition] Transition already in progress');
      return;
    }

    try {
      this.isTransitioning = true;
      this.onCompleteCallback = options.onComplete || null;

      console.log('[WebGLPageTransition] Starting WebGL hybrid transition');

      // Initialize engine if not already done
      if (!this.engine) {
        const success = await this.initialize();
        if (!success) {
          throw new Error('Failed to initialize WebGL engine');
        }
      }

      // Add canvas and overlay to DOM
      if (!this.canvas.parentElement) {
        document.body.appendChild(this.canvas);
      }
      if (!this.pageOverlay.parentElement) {
        document.body.appendChild(this.pageOverlay);
      }
      
      this.canvas.style.display = 'block';
      this.pageOverlay.style.display = 'block';

      // Create mock image from current page elements
      const fromElements = options.fromElements || [];
      const mockImage = await this.createMockImageFromElements(fromElements);

      if (!mockImage) {
        throw new Error('Failed to create page image');
      }

      // Initialize particles from the mock image
      this.engine.initializeFromImage(mockImage);

      // Register and activate the HybridTransitionPreset
      const hybridPreset = new HybridTransitionPreset({
        explosionIntensity: this.config.explosionIntensity,
        explosionTime: this.config.explosionTime,
        recombinationDuration: this.config.recombinationDuration,
        recombinationChaos: this.config.recombinationChaos,
        vacuumStrength: this.config.vacuumStrength,
        blendDuration: this.config.blendDuration
      });

      this.engine.registerPreset('hybridTransition', hybridPreset);
      
      // Start the engine
      this.engine.start();

      // Start disintegration (page fades out, particles fade in)
      setTimeout(() => {
        this.engine.startDisintegration(this.config.disintegrationDuration);
        
        // Fade page overlay to simulate page fade out
        this.pageOverlay.style.opacity = '1';
      }, 100);

      // After disintegration, activate hybrid preset for explosion + recombination
      setTimeout(() => {
        this.engine.activatePreset('hybridTransition');
        
        // Create target image for recombination (simulate next page)
        this.createMockImageFromElements(fromElements).then(targetImage => {
          if (targetImage) {
            this.engine.transitionPresetTo('image', targetImage, this.config.recombinationDuration);
          }
        });
      }, this.config.disintegrationDuration + 100);

      // Calculate total transition duration
      const totalDuration = 
        this.config.disintegrationDuration +
        this.config.explosionTime +
        this.config.recombinationDuration +
        this.config.blendDuration;

      // Complete transition and navigate
      setTimeout(() => {
        this.completeTransition();
      }, totalDuration + 200);

    } catch (error) {
      console.error('[WebGLPageTransition] Transition error:', error);
      this.completeTransition();
    }
  }

  /**
   * Complete transition and cleanup
   */
  completeTransition() {
    console.log('[WebGLPageTransition] Completing transition');
    
    this.isTransitioning = false;

    // Stop engine
    if (this.engine) {
      this.engine.stop();
      this.engine.deactivatePreset();
    }

    // Hide canvas and overlay
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    if (this.pageOverlay) {
      this.pageOverlay.style.opacity = '0';
      setTimeout(() => {
        if (this.pageOverlay) {
          this.pageOverlay.style.display = 'none';
        }
      }, 600);
    }

    // Call completion callback (navigate to next page)
    if (this.onCompleteCallback && typeof this.onCompleteCallback === 'function') {
      const callback = this.onCompleteCallback;
      this.onCompleteCallback = null;
      callback();
    }

    console.log('[WebGLPageTransition] Transition complete');
  }

  /**
   * Check if transition is active
   */
  isActive() {
    return this.isTransitioning;
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    if (this.engine) {
      this.engine.stop();
      this.engine = null;
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.remove();
    }
    if (this.pageOverlay && this.pageOverlay.parentElement) {
      this.pageOverlay.remove();
    }
    this.canvas = null;
    this.pageOverlay = null;
  }
}

// Create singleton instance
const webglTransition = new WebGLPageTransition();

// Export as global
window.WebGLPageTransition = {
  engine: webglTransition,
  start: (options) => webglTransition.startTransition(options),
  isActive: () => webglTransition.isActive(),
  initialize: () => webglTransition.initialize()
};

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    webglTransition.initialize().catch(err => {
      console.error('[WebGLPageTransition] Auto-init failed:', err);
    });
  });
} else {
  webglTransition.initialize().catch(err => {
    console.error('[WebGLPageTransition] Auto-init failed:', err);
  });
}
