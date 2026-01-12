/**
 * WebGL Transition System using Three.js
 * 
 * A basic WebGL-based particle system that renders 1000 randomly positioned
 * and colored static particles. This serves as the foundation for future
 * animated transitions.
 * 
 * Features:
 * - Three.js scene with black void background
 * - 1000 particles using BufferGeometry for efficient rendering
 * - Random positions in a cube of space around the center
 * - Random colors for each particle
 * - Dynamic window resizing support
 */

(function(window) {
  'use strict';

  // Configuration constants
  const CONFIG = {
    PARTICLE_COUNT: 1000,
    PARTICLE_SIZE: 0.05,
    SPACE_RANGE: 10, // Particles distributed in a cube from -10 to +10 on each axis
    CAMERA_POSITION_Z: 15,
    BACKGROUND_COLOR: 0x000000, // Black void
    FOV: 75,
    
    // Animation settings
    DISPERSION_DURATION: 1200, // ms
    FADE_DURATION: 500, // ms
    DISPERSION_FORCE: 8.0,
    CANVAS_Z_INDEX: 9999
  };

  /**
   * WebGL Transition System using Three.js
   */
  class WebGLTransitionSystem {
    constructor(containerId = null) {
      this.container = containerId ? document.getElementById(containerId) : document.body;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.particles = null;
      this.animationId = null;
      
      // Animation state
      this.isTransitioning = false;
      this.transitionPhase = 'idle'; // 'idle', 'dispersing', 'fading'
      this.phaseStartTime = 0;
      this.velocities = null;
      this.onCompleteCallback = null;
      
      // Bind methods
      this._onWindowResize = this._onWindowResize.bind(this);
      this._animate = this._animate.bind(this);
    }

    /**
     * Initialize the Three.js scene, camera, and renderer
     */
    init() {
      if (!window.THREE) {
        console.error('Three.js library not loaded. Please include Three.js before initializing WebGLTransitionSystem.');
        return false;
      }

      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(CONFIG.BACKGROUND_COLOR);

      // Create camera
      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(CONFIG.FOV, aspect, 0.1, 1000);
      this.camera.position.z = CONFIG.CAMERA_POSITION_Z;

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      
      // Style renderer for overlay transitions
      this.renderer.domElement.style.position = 'fixed';
      this.renderer.domElement.style.top = '0';
      this.renderer.domElement.style.left = '0';
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.pointerEvents = 'none';
      this.renderer.domElement.style.zIndex = CONFIG.CANVAS_Z_INDEX;
      
      // Append renderer to container
      this.container.appendChild(this.renderer.domElement);

      // Create particles
      this._createParticles();

      // Add window resize listener
      window.addEventListener('resize', this._onWindowResize, false);

      // Start animation loop
      this._animate();

      return true;
    }

    /**
     * Create particle system with random positions and colors
     */
    _createParticles() {
      // Create BufferGeometry for efficient rendering
      const geometry = new THREE.BufferGeometry();
      
      // Arrays to hold particle data
      const positions = new Float32Array(CONFIG.PARTICLE_COUNT * 3); // x, y, z for each particle
      const colors = new Float32Array(CONFIG.PARTICLE_COUNT * 3); // r, g, b for each particle

      // Generate random positions and colors
      for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        // Random position in a cube centered at origin
        positions[i3] = (Math.random() - 0.5) * CONFIG.SPACE_RANGE * 2; // x
        positions[i3 + 1] = (Math.random() - 0.5) * CONFIG.SPACE_RANGE * 2; // y
        positions[i3 + 2] = (Math.random() - 0.5) * CONFIG.SPACE_RANGE * 2; // z
        
        // Random color (RGB values between 0 and 1)
        colors[i3] = Math.random(); // r
        colors[i3 + 1] = Math.random(); // g
        colors[i3 + 2] = Math.random(); // b
      }

      // Set attributes on geometry
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Create material for particles
      const material = new THREE.PointsMaterial({
        size: CONFIG.PARTICLE_SIZE,
        vertexColors: true, // Use colors from BufferAttribute
        sizeAttenuation: true // Particles get smaller with distance
      });

      // Create Points object and add to scene
      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    }

    /**
     * Handle window resize events
     */
    _onWindowResize() {
      // Update camera aspect ratio
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      // Update renderer size
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Animation loop
     */
    _animate() {
      this.animationId = requestAnimationFrame(this._animate);

      // Update particles if transitioning
      if (this.isTransitioning) {
        this._updateTransition();
      }

      // Render the scene
      this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Update transition animation
     */
    _updateTransition() {
      const currentTime = performance.now();
      const elapsed = currentTime - this.phaseStartTime;
      
      if (this.transitionPhase === 'dispersing') {
        const progress = Math.min(elapsed / CONFIG.DISPERSION_DURATION, 1);
        this._updateDispersion(progress);
        
        if (progress >= 1) {
          this.transitionPhase = 'fading';
          this.phaseStartTime = currentTime;
        }
      } else if (this.transitionPhase === 'fading') {
        const progress = Math.min(elapsed / CONFIG.FADE_DURATION, 1);
        this._updateFade(progress);
        
        if (progress >= 1) {
          this._completeTransition();
        }
      }
    }
    
    /**
     * Update particle dispersion
     */
    _updateDispersion(progress) {
      if (!this.particles || !this.velocities) return;
      
      const positions = this.particles.geometry.attributes.position.array;
      const damping = 0.98;
      
      for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        // Apply velocity
        positions[i3] += this.velocities[i3];
        positions[i3 + 1] += this.velocities[i3 + 1];
        positions[i3 + 2] += this.velocities[i3 + 2];
        
        // Apply damping
        this.velocities[i3] *= damping;
        this.velocities[i3 + 1] *= damping;
        this.velocities[i3 + 2] *= damping;
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    /**
     * Update fade effect
     */
    _updateFade(progress) {
      if (!this.particles) return;
      
      const opacity = 1 - progress;
      this.particles.material.opacity = opacity;
      this.particles.material.transparent = true;
    }
    
    /**
     * Complete transition
     */
    _completeTransition() {
      this.isTransitioning = false;
      this.transitionPhase = 'idle';
      
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
        this.onCompleteCallback = null;
      }
      
      // Clean up
      this.destroy();
    }

    /**
     * Rotate particles slightly for visual effect (optional, can be removed for static)
     * This is here as a foundation for future animations
     */
    rotateParticles(x = 0, y = 0, z = 0) {
      if (this.particles) {
        this.particles.rotation.x += x;
        this.particles.rotation.y += y;
        this.particles.rotation.z += z;
      }
    }
    
    /**
     * Start a page transition
     * @param {Object} options - Transition options
     * @param {Function} options.onComplete - Callback when transition completes
     */
    startTransition(options = {}) {
      if (this.isTransitioning) return;
      
      // Initialize if not already done
      if (!this.scene) {
        this.init();
      }
      
      this.isTransitioning = true;
      this.transitionPhase = 'dispersing';
      this.phaseStartTime = performance.now();
      this.onCompleteCallback = options.onComplete || null;
      
      // Initialize velocities for dispersion
      this._initializeDispersion();
    }
    
    /**
     * Initialize particle dispersion velocities
     */
    _initializeDispersion() {
      if (!this.particles) return;
      
      const positions = this.particles.geometry.attributes.position.array;
      this.velocities = new Float32Array(CONFIG.PARTICLE_COUNT * 3);
      
      const centerX = 0;
      const centerY = 0;
      const centerZ = 0;
      
      for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        // Calculate direction from center
        const dx = positions[i3] - centerX;
        const dy = positions[i3 + 1] - centerY;
        const dz = positions[i3 + 2] - centerZ;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        
        // Normalize and apply force
        const force = CONFIG.DISPERSION_FORCE * (0.5 + Math.random());
        this.velocities[i3] = (dx / distance) * force;
        this.velocities[i3 + 1] = (dy / distance) * force;
        this.velocities[i3 + 2] = (dz / distance) * force;
        
        // Add randomness
        this.velocities[i3] += (Math.random() - 0.5) * force * 0.3;
        this.velocities[i3 + 1] += (Math.random() - 0.5) * force * 0.3;
        this.velocities[i3 + 2] += (Math.random() - 0.5) * force * 0.3;
      }
    }
    
    /**
     * Check if transition is active
     */
    isActive() {
      return this.isTransitioning;
    }

    /**
     * Clean up resources
     */
    destroy() {
      // Stop animation
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }

      // Remove event listener
      window.removeEventListener('resize', this._onWindowResize);

      // Dispose of Three.js resources
      if (this.particles) {
        this.particles.geometry.dispose();
        this.particles.material.dispose();
        this.scene.remove(this.particles);
      }

      // Remove renderer from DOM
      if (this.renderer && this.renderer.domElement) {
        if (this.container.contains(this.renderer.domElement)) {
          this.container.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
      }

      // Clear references
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.particles = null;
    }
  }

  // Export to global scope
  window.WebGLTransitionSystem = WebGLTransitionSystem;
  
  /**
   * Initialize page transitions with WebGL
   */
  function initPageTransitions(config = {}) {
    const defaultConfig = {
      enabled: true,
      customBehaviors: {}
    };
    
    const settings = Object.assign({}, defaultConfig, config);
    
    if (!settings.enabled) return;
    
    // Create singleton instance
    const transitionSystem = new WebGLTransitionSystem();
    let mutationObserver = null;
    
    /**
     * Hook navigation links for transitions
     */
    function hookNavigationLink(link) {
      // Skip external links
      try {
        if (link.target === '_blank' || 
            (link.hostname && link.hostname !== window.location.hostname)) {
          return;
        }
      } catch (e) {
        // Ignore errors
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
        if (transitionSystem.isActive()) {
          e.preventDefault();
          return;
        }
        
        e.preventDefault();
        
        // Start transition
        transitionSystem.startTransition({
          onComplete: () => {
            // Navigate to new page
            window.location.href = href;
          }
        });
      });
    }
    
    // Hook all navigation links on page load
    document.addEventListener('DOMContentLoaded', () => {
      const links = document.querySelectorAll('a');
      links.forEach(hookNavigationLink);
    });
    
    // Also hook links added dynamically
    let debounceTimer = null;
    mutationObserver = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const links = document.querySelectorAll('a:not([data-webgl-transition-hooked])');
        links.forEach(link => {
          hookNavigationLink(link);
          link.setAttribute('data-webgl-transition-hooked', 'true');
        });
      }, 100);
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
        if (transitionSystem) {
          transitionSystem.destroy();
        }
      }
    };
  }
  
  // Export page transition API
  window.WebGLPageTransitions = {
    init: initPageTransitions,
    WebGLTransitionSystem: WebGLTransitionSystem
  };

})(window);
