/**
 * Hybrid Page Transition Configuration
 * 
 * Centralized configuration for page-specific transition behaviors.
 * Allows customization of particle effects, colors, and timing per page.
 * 
 * @version 1.0.0
 */

(function(window) {
  'use strict';

  /**
   * Page-specific transition behaviors
   * 
   * Each key represents a page name (extracted from URL), and the value
   * defines custom transition parameters for that page.
   */
  const PAGE_BEHAVIORS = {
    // Home page - Theme colors
    home: {
      particleCount: 200,
      explosionIntensity: 1.2,
      colors: [
        'rgba(94, 232, 125, 0.8)',   // Primary green
        'rgba(109, 217, 232, 0.9)',  // Cyan
        'rgba(255, 140, 140, 0.9)',  // Red
        'rgba(255, 255, 255, 0.6)'   // White accent
      ]
    },

    // Gallery page - Rainbow spectrum
    gallery: {
      particleCount: 250,
      explosionIntensity: 1.5,
      colors: [
        'rgba(255, 0, 0, 0.9)',      // Red
        'rgba(255, 127, 0, 0.9)',    // Orange
        'rgba(255, 255, 0, 0.9)',    // Yellow
        'rgba(0, 255, 0, 0.9)',      // Green
        'rgba(0, 0, 255, 0.9)',      // Blue
        'rgba(148, 0, 211, 0.9)'     // Purple
      ]
    },

    // Tic-tac-toe game - Game colors
    tictactoe: {
      particleCount: 180,
      explosionIntensity: 1.3,
      colors: [
        'rgba(109, 217, 232, 0.9)',  // X color (cyan)
        'rgba(255, 140, 140, 0.9)',  // O color (red)
        'rgba(255, 255, 255, 0.7)',  // Guide dots
        'rgba(94, 232, 125, 0.6)'    // Background accent
      ]
    },

    // Development history - Code/terminal theme
    'dev-history': {
      particleCount: 150,
      explosionIntensity: 1.0,
      colors: [
        'rgba(94, 232, 125, 0.8)',   // Terminal green
        'rgba(0, 255, 0, 0.6)',      // Bright green
        'rgba(50, 255, 150, 0.7)',   // Mint green
        'rgba(255, 255, 255, 0.4)'   // White text
      ]
    },

    // Spotify demo - Spotify brand colors
    'spotify-demo': {
      particleCount: 200,
      explosionIntensity: 1.2,
      colors: [
        'rgba(30, 215, 96, 0.9)',    // Spotify green
        'rgba(255, 255, 255, 0.8)',  // White
        'rgba(0, 0, 0, 0.6)',        // Black
        'rgba(94, 232, 125, 0.7)'    // Site theme green
      ]
    },

    // Spotify artists test - Analytics theme
    'spotify-artists-test': {
      particleCount: 180,
      explosionIntensity: 1.1,
      colors: [
        'rgba(30, 215, 96, 0.9)',    // Spotify green
        'rgba(29, 185, 84, 0.8)',    // Dark Spotify green
        'rgba(255, 255, 255, 0.7)',  // White
        'rgba(109, 217, 232, 0.6)'   // Analytics blue
      ]
    },

    // Word game - Asymptote theme
    wordgame: {
      particleCount: 200,
      explosionIntensity: 1.4,
      colors: [
        'rgba(94, 232, 125, 0.8)',   // Primary green
        'rgba(255, 215, 0, 0.8)',    // Gold
        'rgba(255, 140, 140, 0.8)',  // Coral
        'rgba(148, 0, 211, 0.7)'     // Purple
      ]
    },

    // Landing page (fake captcha) - Verification theme
    index: {
      particleCount: 150,
      explosionIntensity: 1.0,
      colors: [
        'rgba(66, 133, 244, 0.9)',   // Google blue
        'rgba(94, 232, 125, 0.8)',   // Success green
        'rgba(255, 255, 255, 0.7)',  // White
        'rgba(200, 200, 200, 0.5)'   // Gray
      ]
    }
  };

  /**
   * Global transition configuration
   * 
   * These settings apply to all transitions unless overridden by
   * page-specific behaviors.
   */
  const GLOBAL_CONFIG = {
    // Enable transitions globally
    enabled: true,
    
    // Auto-optimize performance based on device capabilities
    autoOptimize: true,
    
    // Default transition timing
    transitionTiming: 'default',
    
    // Enable debug mode (shows FPS, particle count, etc.)
    debug: false,
    
    // Pages where transitions are enabled ('all' or array of page names)
    enabledPages: ['all'],
    
    // Pages where transitions are disabled (overrides enabledPages)
    disabledPages: [],
    
    // Fallback to CSS fade on low-performance devices
    cssFallbackEnabled: true,
    
    // Minimum FPS before auto-optimization kicks in
    minFPS: 25
  };

  /**
   * Development/Debug configuration
   * 
   * Special settings for development and testing.
   */
  const DEBUG_CONFIG = {
    // Show debug overlay
    showDebugOverlay: false,
    
    // Log all transitions to console
    logTransitions: false,
    
    // Show performance metrics
    showPerformanceMetrics: false,
    
    // Disable transitions (for testing navigation without effects)
    disableAllTransitions: false,
    
    // Force specific device profile (for testing)
    // Options: 'HIGH_END', 'MID_RANGE', 'LOW_END', 'MOBILE', null (auto-detect)
    forceDeviceProfile: null,
    
    // Force specific renderer (for testing)
    // Options: 'webgl', 'canvas', null (auto-detect)
    forceRenderer: null
  };

  /**
   * Utility function to get configuration for a specific page
   */
  function getPageConfig(pageName) {
    return PAGE_BEHAVIORS[pageName] || {};
  }

  /**
   * Utility function to check if transitions are enabled for a page
   */
  function isTransitionEnabled(pageName) {
    // Check if globally disabled
    if (!GLOBAL_CONFIG.enabled || DEBUG_CONFIG.disableAllTransitions) {
      return false;
    }
    
    // Check if page is explicitly disabled
    if (GLOBAL_CONFIG.disabledPages.includes(pageName)) {
      return false;
    }
    
    // Check if all pages are enabled
    if (GLOBAL_CONFIG.enabledPages.includes('all')) {
      return true;
    }
    
    // Check if specific page is enabled
    return GLOBAL_CONFIG.enabledPages.includes(pageName);
  }

  /**
   * Utility function to merge global and page-specific config
   */
  function getMergedConfig(pageName) {
    const pageConfig = getPageConfig(pageName);
    const debugOverrides = {};
    
    // Apply debug overrides if enabled
    if (DEBUG_CONFIG.showDebugOverlay) {
      debugOverrides.debug = true;
    }
    
    if (DEBUG_CONFIG.forceDeviceProfile) {
      debugOverrides.deviceProfile = DEBUG_CONFIG.forceDeviceProfile;
    }
    
    if (DEBUG_CONFIG.forceRenderer) {
      debugOverrides.renderer = DEBUG_CONFIG.forceRenderer;
    }
    
    return Object.assign({}, GLOBAL_CONFIG, pageConfig, debugOverrides);
  }

  // =============================================================================
  // Export Configuration
  // =============================================================================

  window.HybridPageTransitionConfig = {
    PAGE_BEHAVIORS: PAGE_BEHAVIORS,
    GLOBAL_CONFIG: GLOBAL_CONFIG,
    DEBUG_CONFIG: DEBUG_CONFIG,
    
    // Utility functions
    getPageConfig: getPageConfig,
    isTransitionEnabled: isTransitionEnabled,
    getMergedConfig: getMergedConfig,
    
    /**
     * Update global configuration at runtime
     */
    updateGlobalConfig: function(updates) {
      Object.assign(GLOBAL_CONFIG, updates);
    },
    
    /**
     * Add or update page-specific behavior
     */
    addPageBehavior: function(pageName, behavior) {
      PAGE_BEHAVIORS[pageName] = Object.assign(
        PAGE_BEHAVIORS[pageName] || {},
        behavior
      );
    },
    
    /**
     * Enable debug mode
     */
    enableDebug: function() {
      GLOBAL_CONFIG.debug = true;
      DEBUG_CONFIG.showDebugOverlay = true;
      DEBUG_CONFIG.logTransitions = true;
      DEBUG_CONFIG.showPerformanceMetrics = true;
    },
    
    /**
     * Disable debug mode
     */
    disableDebug: function() {
      GLOBAL_CONFIG.debug = false;
      DEBUG_CONFIG.showDebugOverlay = false;
      DEBUG_CONFIG.logTransitions = false;
      DEBUG_CONFIG.showPerformanceMetrics = false;
    }
  };

})(window);
