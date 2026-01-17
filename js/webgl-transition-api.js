/**
 * WebGL Transition API
 * 
 * Simplified API approach for hybrid page transitions:
 * - Page exit: Trigger disintegration effect on navigation
 * - Page enter: Show recombination effect on page load
 * - No navigation interception: Browser handles page loads naturally
 * 
 * Uses the WebGL HybridEngine as pure visual effects layer
 */

import { HybridEngine } from './webgl-engine/HybridEngine.js';
import { HybridTransitionPreset } from './webgl-engine/presets/HybridTransitionPreset.js';

class WebGLTransitionAPI {
  constructor() {
    this.engine = null;
    this.canvas = null;
    this.isInitialized = false;
    this.isTransitioning = false;
    
    // Configuration
    this.config = {
      particleCount: window.innerWidth > 768 ? 300 : 150,
      disintegrationDuration: 400,
      explosionIntensity: 120,
      explosionTime: 600,
      recombinationDuration: 800,
      recombinationChaos: 0.25,
      vacuumStrength: 0.12,
      blendDuration: 400
    };
  }

  /**
   * Initialize the WebGL engine
   */
  async init() {
    if (this.isInitialized) return true;

    try {
      console.log('[WebGLTransitionAPI] Initializing...');
      
      // Create canvas
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'webgl-transition-canvas';
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        pointer-events: none;
        display: none;
      `;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      document.body.appendChild(this.canvas);

      // Initialize HybridEngine
      this.engine = new HybridEngine(this.canvas, {
        particleCount: this.config.particleCount,
        speed: 1.0,
        autoResize: true,
        enableTriangulation: false
      });

      this.isInitialized = true;
      console.log('[WebGLTransitionAPI] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[WebGLTransitionAPI] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Create a simple image from current page for particle generation
   */
  async capturePageSnapshot() {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        
        // Fill with page background
        ctx.fillStyle = 'rgb(2, 6, 18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sample visible elements
        const elements = document.querySelectorAll('h1, h2, button, .app-card, .home-header, .gallery-header');
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const computed = window.getComputedStyle(element);
            
            // Draw element representation
            if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
              ctx.fillStyle = computed.backgroundColor;
              ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
            }
            
            // Add text color overlay
            if (computed.color) {
              ctx.fillStyle = computed.color;
              ctx.globalAlpha = 0.3;
              ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
              ctx.globalAlpha = 1.0;
            }
          }
        });

        // Convert to image
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = canvas.toDataURL();
      } catch (error) {
        console.error('[WebGLTransitionAPI] Snapshot failed:', error);
        resolve(null);
      }
    });
  }

  /**
   * Play exit animation (page disintegration)
   * Called when user is leaving the page
   */
  async playExitAnimation() {
    if (!this.isInitialized || this.isTransitioning) return;

    try {
      this.isTransitioning = true;
      console.log('[WebGLTransitionAPI] Playing exit animation');
      
      this.canvas.style.display = 'block';
      
      // Capture current page
      const snapshot = await this.capturePageSnapshot();
      if (!snapshot) {
        console.warn('[WebGLTransitionAPI] No snapshot, skipping animation');
        this.isTransitioning = false;
        return;
      }

      // Initialize particles from snapshot
      this.engine.initializeFromImage(snapshot);
      
      // Register hybrid preset
      const hybridPreset = new HybridTransitionPreset({
        explosionIntensity: this.config.explosionIntensity,
        explosionTime: this.config.explosionTime,
        recombinationDuration: 0, // No recombination on exit
        blendDuration: 0
      });
      
      this.engine.registerPreset('exitTransition', hybridPreset);
      this.engine.start();

      // Start disintegration
      this.engine.startDisintegration(this.config.disintegrationDuration);

      // After disintegration, trigger explosion
      setTimeout(() => {
        this.engine.activatePreset('exitTransition');
      }, this.config.disintegrationDuration);

      // Cleanup after explosion completes
      setTimeout(() => {
        this.cleanup();
      }, this.config.disintegrationDuration + this.config.explosionTime + 200);

    } catch (error) {
      console.error('[WebGLTransitionAPI] Exit animation error:', error);
      this.cleanup();
    }
  }

  /**
   * Play enter animation (page recombination)
   * Called when new page loads
   */
  async playEnterAnimation() {
    if (!this.isInitialized || this.isTransitioning) return;

    try {
      this.isTransitioning = true;
      console.log('[WebGLTransitionAPI] Playing enter animation');
      
      this.canvas.style.display = 'block';
      
      // Capture new page
      const snapshot = await this.capturePageSnapshot();
      if (!snapshot) {
        console.warn('[WebGLTransitionAPI] No snapshot, skipping animation');
        this.isTransitioning = false;
        return;
      }

      // Initialize particles in scattered positions
      this.engine.initializeFromImage(snapshot);
      
      // Register hybrid preset for recombination
      const hybridPreset = new HybridTransitionPreset({
        explosionIntensity: 0, // No explosion on enter
        explosionTime: 0,
        recombinationDuration: this.config.recombinationDuration,
        recombinationChaos: this.config.recombinationChaos,
        vacuumStrength: this.config.vacuumStrength,
        blendDuration: this.config.blendDuration
      });
      
      this.engine.registerPreset('enterTransition', hybridPreset);
      
      // Start with particles scattered
      const particles = this.engine.particleSystem.getParticles();
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      
      particles.forEach(particle => {
        // Position particles in scattered formation
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 300;
        particle.x = centerX + Math.cos(angle) * distance;
        particle.y = centerY + Math.sin(angle) * distance;
        particle.vx = 0;
        particle.vy = 0;
      });
      
      this.engine.start();
      
      // Activate recombination
      setTimeout(() => {
        this.engine.activatePreset('enterTransition');
        
        // Set target positions for recombination
        this.engine.transitionPresetTo('image', snapshot, this.config.recombinationDuration);
      }, 100);

      // Cleanup after recombination completes
      setTimeout(() => {
        this.cleanup();
      }, this.config.recombinationDuration + this.config.blendDuration + 200);

    } catch (error) {
      console.error('[WebGLTransitionAPI] Enter animation error:', error);
      this.cleanup();
    }
  }

  /**
   * Cleanup engine and canvas
   */
  cleanup() {
    this.isTransitioning = false;
    
    if (this.engine) {
      this.engine.stop();
      this.engine.deactivatePreset();
    }
    
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    
    console.log('[WebGLTransitionAPI] Cleanup complete');
  }

  /**
   * Destroy the API instance
   */
  destroy() {
    this.cleanup();
    
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.remove();
    }
    
    this.engine = null;
    this.canvas = null;
    this.isInitialized = false;
  }
}

// Create singleton instance
const api = new WebGLTransitionAPI();

// Initialize on page load
const initializeAPI = async () => {
  const success = await api.init();
  if (success) {
    console.log('[WebGLTransitionAPI] Ready to use');
  }
};

// Setup page transition events
const setupTransitions = () => {
  // Play enter animation when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => api.playEnterAnimation(), 100);
    });
  } else {
    // Already loaded, play enter animation
    setTimeout(() => api.playEnterAnimation(), 100);
  }

  // Setup exit animation on navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href || href === '#' || link.target === '_blank') return;
    
    // Check if internal link
    try {
      if (link.hostname && link.hostname !== window.location.hostname) return;
    } catch (err) {
      // Ignore hostname check errors
    }
    
    // Check for dangerous schemes
    const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerHref = href.toLowerCase().trim();
    if (dangerousSchemes.some(scheme => lowerHref.startsWith(scheme))) return;
    
    // Play exit animation, then navigate
    e.preventDefault();
    api.playExitAnimation();
    
    // Navigate after animation starts (don't wait for completion)
    setTimeout(() => {
      window.location.href = href;
    }, this.config.disintegrationDuration + 100);
  }, true);
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAPI().then(() => setupTransitions());
  });
} else {
  initializeAPI().then(() => setupTransitions());
}

// Export API
window.WebGLTransitionAPI = api;

export default api;
