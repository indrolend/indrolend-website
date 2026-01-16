/**
 * WebGL Hybrid Page Transition Integration
 * 
 * Integrates the WebGL particle engine for smooth page-to-page transitions
 * Features:
 * - Captures current page as image
 * - Opacity fade out
 * - Explosion effect
 * - Recombination into target page
 * - Opacity fade in
 * - Seamless navigation
 */

import { HybridEngine } from './webgl-engine/HybridEngine.js';
import { HybridTransitionPreset } from './webgl-engine/presets/HybridTransitionPreset.js';

class PageTransitionEngine {
  constructor() {
    this.canvas = null;
    this.engine = null;
    this.isTransitioning = false;
    this.pendingNavigation = null;
    
    // Configuration
    this.config = {
      particleCount: 2000,
      explosionIntensity: 150,
      explosionTime: 800,
      recombinationDuration: 2000,
      blendDuration: 1500,
      captureQuality: 0.8, // Image capture quality (0-1)
      fadeOutDuration: 400,
      fadeInDuration: 400
    };
  }

  /**
   * Initialize the transition engine
   */
  async init() {
    console.log('[PageTransition] Initializing WebGL hybrid page transition engine...');
    
    // Create fullscreen canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'page-transition-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '9999';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.display = 'none';
    
    // Set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Add to body
    document.body.appendChild(this.canvas);
    
    // Initialize WebGL engine
    try {
      this.engine = new HybridEngine(this.canvas, {
        particleCount: this.config.particleCount,
        speed: 1.0,
        autoResize: true
      });
      
      console.log('[PageTransition] Engine initialized successfully');
    } catch (error) {
      console.error('[PageTransition] Failed to initialize engine:', error);
      return false;
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
    
    return true;
  }

  /**
   * Capture the current page as an image
   */
  async captureCurrentPage() {
    return new Promise((resolve) => {
      // Use html2canvas if available
      if (typeof html2canvas !== 'undefined') {
        html2canvas(document.body, {
          scale: this.config.captureQuality,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: getComputedStyle(document.body).backgroundColor || '#020612'
        }).then(canvas => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = canvas.toDataURL('image/png');
        }).catch(err => {
          console.error('[PageTransition] html2canvas failed:', err);
          resolve(this._fallbackCapture());
        });
      } else {
        // Fallback capture method
        resolve(this._fallbackCapture());
      }
    });
  }

  /**
   * Fallback page capture without html2canvas
   */
  _fallbackCapture() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Fill with background
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#020612';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add simple text
    ctx.fillStyle = '#5ee87d';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Transitioning...', canvas.width / 2, canvas.height / 2);
    
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    return img;
  }

  /**
   * Start the page transition
   */
  async startTransition(targetUrl) {
    if (this.isTransitioning) {
      console.log('[PageTransition] Transition already in progress');
      return;
    }
    
    console.log('[PageTransition] Starting transition to:', targetUrl);
    this.isTransitioning = true;
    this.pendingNavigation = targetUrl;
    
    // Show canvas
    this.canvas.style.display = 'block';
    
    try {
      // Step 1: Capture current page
      console.log('[PageTransition] Capturing current page...');
      const currentPageImage = await this.captureCurrentPage();
      
      // Step 2: Initialize particles from current page
      console.log('[PageTransition] Initializing particles...');
      this.engine.initializeFromSolidImage(currentPageImage, 0); // Don't auto-disintegrate
      
      // Step 3: Start the engine
      this.engine.start();
      
      // Step 4: Fade out page opacity while keeping particles solid
      await this._fadeOutPage();
      
      // Step 5: Start the hybrid transition preset
      const preset = new HybridTransitionPreset({
        explosionIntensity: this.config.explosionIntensity,
        explosionTime: this.config.explosionTime,
        recombinationDuration: this.config.recombinationDuration,
        blendDuration: this.config.blendDuration
      });
      
      this.engine.registerPreset('pageTransition', preset);
      
      // Step 6: Disintegrate the solid image into particles
      this.engine.startDisintegration(400); // Quick disintegration to particles
      
      await this._wait(500); // Wait for disintegration
      
      // Step 7: Activate the hybrid transition
      this.engine.activatePreset('pageTransition');
      
      // Wait for transition to reach recombination phase
      await this._wait(this.config.explosionTime);
      
      // Step 8: Load target page in background
      console.log('[PageTransition] Loading target page...');
      // Here we would ideally load the target page content, but for now just navigate
      
      // Wait for recombination to complete
      await this._wait(this.config.recombinationDuration);
      
      // Step 9: Fade in the new page
      await this._fadeInPage();
      
      // Step 10: Navigate to target page
      console.log('[PageTransition] Navigating to:', targetUrl);
      window.location.href = targetUrl;
      
    } catch (error) {
      console.error('[PageTransition] Transition failed:', error);
      // Fallback: just navigate
      window.location.href = targetUrl;
    }
  }

  /**
   * Fade out the page content
   */
  async _fadeOutPage() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = this.config.fadeOutDuration;
      
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        document.body.style.opacity = 1 - progress;
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };
      
      fade();
    });
  }

  /**
   * Fade in the page content
   */
  async _fadeInPage() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = this.config.fadeInDuration;
      
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        document.body.style.opacity = progress;
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          document.body.style.opacity = '';
          resolve();
        }
      };
      
      fade();
    });
  }

  /**
   * Wait for a specified duration
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up and stop the transition
   */
  cleanup() {
    if (this.engine) {
      this.engine.stop();
    }
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    this.isTransitioning = false;
    this.pendingNavigation = null;
    document.body.style.opacity = '';
  }

  /**
   * Check if a transition is in progress
   */
  isActive() {
    return this.isTransitioning;
  }
}

// Create singleton instance
const pageTransitionEngine = new PageTransitionEngine();

/**
 * Initialize page transitions on all internal links
 */
async function initPageTransitions() {
  console.log('[PageTransition] Initializing page transition hooks...');
  
  // Initialize the engine
  const initialized = await pageTransitionEngine.init();
  
  if (!initialized) {
    console.warn('[PageTransition] Failed to initialize, transitions disabled');
    return;
  }
  
  // Hook navigation links
  function hookLinks() {
    const links = document.querySelectorAll('a:not([data-transition-hooked])');
    
    links.forEach(link => {
      // Skip external links
      try {
        if (link.target === '_blank' || 
            (link.hostname && link.hostname !== window.location.hostname)) {
          return;
        }
      } catch (e) {
        // Ignore errors
      }

      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      
      // Security: Block dangerous URL schemes
      const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
      const lowerHref = href.toLowerCase().trim();
      if (dangerousSchemes.some(scheme => lowerHref.startsWith(scheme))) {
        return;
      }

      // Add transition handler
      link.addEventListener('click', (e) => {
        if (pageTransitionEngine.isActive()) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        pageTransitionEngine.startTransition(href);
      });
      
      link.setAttribute('data-transition-hooked', 'true');
    });
  }

  // Hook links on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookLinks);
  } else {
    hookLinks();
  }

  // Watch for dynamically added links
  const observer = new MutationObserver(hookLinks);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('[PageTransition] Page transitions initialized');
}

// Export for use
export { PageTransitionEngine, initPageTransitions, pageTransitionEngine };

// Auto-initialize if not using as module
if (typeof window !== 'undefined') {
  window.PageTransitionEngine = PageTransitionEngine;
  window.initPageTransitions = initPageTransitions;
  window.pageTransitionEngine = pageTransitionEngine;
}
