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
    FOV: 75
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
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      
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
        transparent: false,
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

      // Render the scene
      this.renderer.render(this.scene, this.camera);
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
      if (this.renderer) {
        if (this.renderer.domElement && this.renderer.domElement.parentElement === this.container) {
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

})(window);
