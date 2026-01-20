/**
 * Hybrid Page Transition Initializer
 * 
 * Automatically initializes the HybridPageTransitionAPI with proper configuration
 * and sets up navigation interception for seamless page transitions.
 * 
 * This script should be loaded after:
 * - hybrid-page-transition-api.js
 * - hybrid-page-transition-config.js
 * 
 * @version 1.0.0
 */

(function(window) {
  'use strict';

  /**
   * Initialize transitions when DOM is ready
   */
  function initializeTransitions() {
    // Check if API is available
    if (typeof window.HybridPageTransitionAPI === 'undefined') {
      console.warn('HybridPageTransitionAPI not found. Make sure hybrid-page-transition-api.js is loaded first.');
      return;
    }

    // Check if config is available
    if (typeof window.HybridPageTransitionConfig === 'undefined') {
      console.warn('HybridPageTransitionConfig not found. Make sure hybrid-page-transition-config.js is loaded first.');
      return;
    }

    const config = window.HybridPageTransitionConfig;
    const api = window.HybridPageTransitionAPI;

    // Check if transitions are globally enabled
    if (!config.GLOBAL_CONFIG.enabled) {
      console.log('HybridPageTransitionAPI: Transitions disabled in configuration');
      return;
    }

    // Log initialization in debug mode
    if (config.GLOBAL_CONFIG.debug) {
      console.log('HybridPageTransitionAPI: Initializing with configuration:', config.GLOBAL_CONFIG);
    }

    // Initialize the API with navigation interception
    const transitionSystem = api.init({
      enabledPages: config.GLOBAL_CONFIG.enabledPages,
      transitionTiming: config.GLOBAL_CONFIG.transitionTiming,
      customBehaviors: config.PAGE_BEHAVIORS
    });

    // Apply debug configuration if enabled
    if (config.DEBUG_CONFIG.showDebugOverlay) {
      transitionSystem.api.setDebug(true);
    }

    // Store reference globally for debugging
    window.transitionSystem = transitionSystem;

    // Log device profile in debug mode
    if (config.GLOBAL_CONFIG.debug) {
      const deviceProfile = transitionSystem.api.getDeviceProfile();
      console.log('HybridPageTransitionAPI: Device profile:', deviceProfile);
    }

    // Add keyboard shortcuts for debug mode (Ctrl+Shift+D)
    if (config.GLOBAL_CONFIG.debug || config.DEBUG_CONFIG.showDebugOverlay) {
      document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          const currentDebug = transitionSystem.api.debug;
          transitionSystem.api.setDebug(!currentDebug);
          console.log('HybridPageTransitionAPI: Debug mode', !currentDebug ? 'enabled' : 'disabled');
        }
      });
    }

    console.log('HybridPageTransitionAPI: Successfully initialized');
  }

  /**
   * Add CSS for fallback transitions
   */
  function addFallbackStyles() {
    if (!document.getElementById('hybrid-transition-fallback-styles')) {
      const style = document.createElement('style');
      style.id = 'hybrid-transition-fallback-styles';
      style.textContent = `
        /* CSS Fallback for non-WebGL environments */
        .hybrid-transition-fade-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(2, 6, 18, 1);
          z-index: 99998;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }
        
        .hybrid-transition-fade-overlay.active {
          opacity: 1;
        }
        
        /* Accessibility: Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .hybrid-transition-fade-overlay {
            transition-duration: 0.1s !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Check for accessibility preferences
   */
  function checkAccessibilityPreferences() {
    // Respect user's reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('HybridPageTransitionAPI: Reduced motion detected, adjusting transitions');
      
      if (window.HybridPageTransitionConfig) {
        // Reduce particle count and transition duration
        window.HybridPageTransitionConfig.updateGlobalConfig({
          autoOptimize: true
        });
        
        // Update all page behaviors to use fewer particles
        Object.keys(window.HybridPageTransitionConfig.PAGE_BEHAVIORS).forEach(page => {
          const behavior = window.HybridPageTransitionConfig.PAGE_BEHAVIORS[page];
          if (behavior.particleCount) {
            behavior.particleCount = Math.min(behavior.particleCount, 60);
          }
        });
      }
    }
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addFallbackStyles();
      checkAccessibilityPreferences();
      initializeTransitions();
    });
  } else {
    // DOM already loaded
    addFallbackStyles();
    checkAccessibilityPreferences();
    initializeTransitions();
  }

  /**
   * Export initialization function for manual control
   */
  window.initHybridPageTransitions = initializeTransitions;

})(window);
