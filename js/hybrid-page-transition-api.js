/**
 * Hybrid Page Transition API
 * 
 * A powerful WebGL-based particle transition system with intelligent fallback to Canvas.
 * Provides smooth, hardware-accelerated page transitions with automatic optimization
 * based on device capabilities.
 * 
 * Features:
 * - WebGL 2.0 / WebGL 1.0 rendering with Canvas fallback
 * - Automatic device profile detection and optimization
 * - Customizable particle behaviors and visual effects
 * - Performance monitoring and dynamic adjustment
 * - Cross-browser compatibility
 * - Debug mode for development
 * 
 * @version 1.0.0
 * @author Indrolend
 */

(function(window) {
  'use strict';

  // =============================================================================
  // Configuration & Constants
  // =============================================================================

  const CONFIG = {
    // Performance profiles
    DEVICE_PROFILES: {
      HIGH_END: {
        particleCount: 300,
        particleSize: { min: 2, max: 6 },
        targetFPS: 60,
        useWebGL: true,
        enableBloom: true,
        enableTrails: true
      },
      MID_RANGE: {
        particleCount: 150,
        particleSize: { min: 2, max: 5 },
        targetFPS: 45,
        useWebGL: true,
        enableBloom: false,
        enableTrails: false
      },
      LOW_END: {
        particleCount: 80,
        particleSize: { min: 2, max: 4 },
        targetFPS: 30,
        useWebGL: false,
        enableBloom: false,
        enableTrails: false
      },
      MOBILE: {
        particleCount: 60,
        particleSize: { min: 2, max: 4 },
        targetFPS: 30,
        useWebGL: true,
        enableBloom: false,
        enableTrails: false
      }
    },

    // Transition timing
    TRANSITION_PHASES: {
      DISPERSE: 1000,    // Dispersion phase duration (ms)
      HOLD: 200,         // Hold phase duration (ms)
      FADE: 800          // Fade phase duration (ms)
    },

    // Physics parameters
    PHYSICS: {
      dispersionSpeed: 5.0,
      explosionIntensity: 1.5,
      damping: 0.92,
      morphSpeed: 0.1,
      gravity: 0.0
    },

    // Visual effects
    EFFECTS: {
      backgroundColor: 'rgba(2, 6, 18, 1)',
      particleOpacity: 0.9,
      glowIntensity: 0.3,
      trailLength: 5
    },

    // Canvas settings
    CANVAS_Z_INDEX: 99999,
    
    // Debug settings
    DEBUG: {
      enabled: false,
      showFPS: true,
      showParticleCount: true,
      logTransitions: true
    }
  };

  // =============================================================================
  // Utility Functions
  // =============================================================================

  const Utils = {
    /**
     * Get current timestamp with high precision
     */
    now: function() {
      return (typeof performance !== 'undefined' && performance.now) 
        ? performance.now() 
        : Date.now();
    },

    /**
     * Linear interpolation
     */
    lerp: function(start, end, t) {
      return start + (end - start) * t;
    },

    /**
     * Clamp value between min and max
     */
    clamp: function(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    /**
     * Map value from one range to another
     */
    map: function(value, inMin, inMax, outMin, outMax) {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    /**
     * Parse RGBA color string to components
     */
    parseColor: function(colorStr) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        return {
          r: parseInt(match[1]) / 255,
          g: parseInt(match[2]) / 255,
          b: parseInt(match[3]) / 255,
          a: match[4] ? parseFloat(match[4]) : 1.0
        };
      }
      return { r: 1, g: 1, b: 1, a: 1 };
    },

    /**
     * Get device pixel ratio with fallback
     */
    getPixelRatio: function() {
      return window.devicePixelRatio || 1;
    }
  };

  // =============================================================================
  // Device Profile Detector
  // =============================================================================

  class DeviceProfileDetector {
    constructor() {
      this.profile = null;
      this.capabilities = this._detectCapabilities();
      this.profile = this._determineProfile();
    }

    /**
     * Detect device capabilities
     */
    _detectCapabilities() {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Test WebGL support
      const canvas = document.createElement('canvas');
      const webgl2 = !!canvas.getContext('webgl2');
      const webgl1 = !webgl2 && !!canvas.getContext('webgl');
      
      // Estimate GPU tier (rough heuristic)
      const gpuTier = this._estimateGPUTier();
      
      // Check available memory (if available)
      const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
      
      // Check CPU cores
      const cpuCores = navigator.hardwareConcurrency || 2;
      
      return {
        isMobile,
        isTablet,
        isTouch,
        webgl2,
        webgl1,
        webglSupported: webgl2 || webgl1,
        gpuTier,
        memory,
        cpuCores,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: Utils.getPixelRatio()
      };
    }

    /**
     * Estimate GPU performance tier
     */
    _estimateGPUTier() {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'low';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        
        // High-end GPU detection
        if (/nvidia|geforce gtx|geforce rtx|quadro|tesla/i.test(renderer) ||
            /amd radeon rx|radeon pro/i.test(renderer) ||
            /apple m[1-9]|apple gpu/i.test(renderer)) {
          return 'high';
        }
        
        // Low-end GPU detection
        if (/intel.*hd|intel.*uhd.*[0-9]{3}$/i.test(renderer) ||
            /mali-4|adreno [0-5]/i.test(renderer)) {
          return 'low';
        }
      }
      
      // Default to mid-range
      return 'mid';
    }

    /**
     * Determine the appropriate device profile
     */
    _determineProfile() {
      const caps = this.capabilities;
      
      // Mobile devices
      if (caps.isMobile && !caps.isTablet) {
        return 'MOBILE';
      }
      
      // Low-end devices (limited memory, weak GPU, or no WebGL)
      if (!caps.webglSupported || caps.memory < 2 || caps.gpuTier === 'low') {
        return 'LOW_END';
      }
      
      // High-end devices (good GPU, high memory, high-res screen)
      if (caps.gpuTier === 'high' && caps.memory >= 8 && caps.cpuCores >= 4) {
        return 'HIGH_END';
      }
      
      // Default to mid-range
      return 'MID_RANGE';
    }

    /**
     * Get the device profile configuration
     */
    getProfile() {
      return CONFIG.DEVICE_PROFILES[this.profile];
    }

    /**
     * Get profile name
     */
    getProfileName() {
      return this.profile;
    }

    /**
     * Check if WebGL is available
     */
    hasWebGL() {
      return this.capabilities.webglSupported;
    }

    /**
     * Get capabilities object
     */
    getCapabilities() {
      return this.capabilities;
    }
  }

  // =============================================================================
  // Particle Class
  // =============================================================================

  class Particle {
    constructor(x, y, color, size) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.targetX = x;
      this.targetY = y;
      this.color = color;
      this.size = size;
      this.alpha = 1.0;
      this.life = 1.0;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      // Trail effect
      this.trail = [];
      this.maxTrailLength = CONFIG.EFFECTS.trailLength;
    }

    /**
     * Apply explosion force
     */
    explode(centerX, centerY, intensity) {
      const dx = this.x - centerX;
      const dy = this.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      // Apply radial force with randomness
      const force = intensity * (0.7 + Math.random() * 0.6);
      this.vx = normalizedDx * force;
      this.vy = normalizedDy * force;
      
      // Add some perpendicular velocity for swirl effect
      const perpVx = -normalizedDy * force * 0.3 * (Math.random() - 0.5);
      const perpVy = normalizedDx * force * 0.3 * (Math.random() - 0.5);
      this.vx += perpVx;
      this.vy += perpVy;
    }

    /**
     * Update particle physics
     */
    update(deltaTime, morphStrength = 0) {
      // Store position for trail
      if (this.trail.length >= this.maxTrailLength) {
        this.trail.shift();
      }
      this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
      
      // Update position
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
      
      // Apply damping
      this.vx *= CONFIG.PHYSICS.damping;
      this.vy *= CONFIG.PHYSICS.damping;
      
      // Apply gravity
      this.vy += CONFIG.PHYSICS.gravity * deltaTime;
      
      // Morph towards target
      if (morphStrength > 0) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.vx += dx * morphStrength;
        this.vy += dy * morphStrength;
      }
      
      // Update rotation
      this.rotation += this.rotationSpeed;
    }

    /**
     * Set target position for morphing
     */
    setTarget(x, y) {
      this.targetX = x;
      this.targetY = y;
    }
  }

  // =============================================================================
  // WebGL Renderer
  // =============================================================================

  class WebGLRenderer {
    constructor(canvas, config) {
      this.canvas = canvas;
      this.config = config;
      this.gl = null;
      this.program = null;
      this.buffers = null;
      this.initialized = false;
      
      this._initWebGL();
    }

    /**
     * Initialize WebGL context and shaders
     */
    _initWebGL() {
      try {
        // Try WebGL 2.0 first, fall back to WebGL 1.0
        this.gl = this.canvas.getContext('webgl2') || 
                  this.canvas.getContext('webgl') ||
                  this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
          console.warn('HybridPageTransitionAPI: WebGL not available, falling back to Canvas');
          return;
        }

        // Vertex shader
        const vertexShaderSource = `
          attribute vec2 a_position;
          attribute vec4 a_color;
          attribute float a_size;
          
          uniform vec2 u_resolution;
          
          varying vec4 v_color;
          
          void main() {
            vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            gl_PointSize = a_size;
            v_color = a_color;
          }
        `;

        // Fragment shader
        const fragmentShaderSource = `
          precision mediump float;
          varying vec4 v_color;
          
          void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if (dist > 0.5) {
              discard;
            }
            float alpha = v_color.a * (1.0 - dist * 2.0);
            gl_FragColor = vec4(v_color.rgb, alpha);
          }
        `;

        // Compile shaders
        const vertexShader = this._compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this._compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
          throw new Error('Failed to compile shaders');
        }

        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
          throw new Error('Failed to link program: ' + this.gl.getProgramInfoLog(this.program));
        }

        // Get attribute and uniform locations
        this.locations = {
          position: this.gl.getAttribLocation(this.program, 'a_position'),
          color: this.gl.getAttribLocation(this.program, 'a_color'),
          size: this.gl.getAttribLocation(this.program, 'a_size'),
          resolution: this.gl.getUniformLocation(this.program, 'u_resolution')
        };

        // Create buffers
        this.buffers = {
          position: this.gl.createBuffer(),
          color: this.gl.createBuffer(),
          size: this.gl.createBuffer()
        };

        // Enable blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.initialized = true;
      } catch (error) {
        console.warn('HybridPageTransitionAPI: WebGL initialization failed:', error);
        this.initialized = false;
      }
    }

    /**
     * Compile a shader
     */
    _compileShader(type, source) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    /**
     * Check if WebGL is initialized and ready
     */
    isReady() {
      return this.initialized && this.gl !== null;
    }

    /**
     * Clear the canvas
     */
    clear(color) {
      if (!this.isReady()) return;
      
      const c = Utils.parseColor(color);
      this.gl.clearColor(c.r, c.g, c.b, c.a);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    /**
     * Render particles
     */
    render(particles) {
      if (!this.isReady() || particles.length === 0) return;

      const gl = this.gl;
      
      // Prepare data arrays
      const positions = new Float32Array(particles.length * 2);
      const colors = new Float32Array(particles.length * 4);
      const sizes = new Float32Array(particles.length);

      particles.forEach((particle, i) => {
        positions[i * 2] = particle.x;
        positions[i * 2 + 1] = particle.y;
        
        const color = Utils.parseColor(particle.color);
        colors[i * 4] = color.r;
        colors[i * 4 + 1] = color.g;
        colors[i * 4 + 2] = color.b;
        colors[i * 4 + 3] = color.a * particle.alpha;
        
        sizes[i] = particle.size * Utils.getPixelRatio();
      });

      // Use program
      gl.useProgram(this.program);

      // Set resolution uniform
      gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);

      // Bind and update position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.locations.position);
      gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);

      // Bind and update color buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.locations.color);
      gl.vertexAttribPointer(this.locations.color, 4, gl.FLOAT, false, 0, 0);

      // Bind and update size buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
      gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.locations.size);
      gl.vertexAttribPointer(this.locations.size, 1, gl.FLOAT, false, 0, 0);

      // Draw particles
      gl.drawArrays(gl.POINTS, 0, particles.length);
    }

    /**
     * Clean up WebGL resources
     */
    dispose() {
      if (!this.isReady()) return;
      
      const gl = this.gl;
      
      // Delete buffers
      if (this.buffers) {
        gl.deleteBuffer(this.buffers.position);
        gl.deleteBuffer(this.buffers.color);
        gl.deleteBuffer(this.buffers.size);
      }
      
      // Delete program
      if (this.program) {
        gl.deleteProgram(this.program);
      }
      
      this.gl = null;
      this.initialized = false;
    }
  }

  // =============================================================================
  // Canvas 2D Renderer (Fallback)
  // =============================================================================

  class Canvas2DRenderer {
    constructor(canvas, config) {
      this.canvas = canvas;
      this.config = config;
      this.ctx = canvas.getContext('2d', { alpha: false });
    }

    /**
     * Check if renderer is ready
     */
    isReady() {
      return this.ctx !== null;
    }

    /**
     * Clear the canvas
     */
    clear(color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render particles
     */
    render(particles) {
      particles.forEach(particle => {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha * CONFIG.EFFECTS.particleOpacity;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
    }

    /**
     * Clean up resources
     */
    dispose() {
      this.ctx = null;
    }
  }

  // =============================================================================
  // Performance Monitor
  // =============================================================================

  class PerformanceMonitor {
    constructor() {
      this.frameCount = 0;
      this.fps = 0;
      this.lastTime = Utils.now();
      this.frameHistory = [];
      this.maxHistory = 60;
    }

    /**
     * Update FPS counter
     */
    update() {
      const currentTime = Utils.now();
      const deltaTime = currentTime - this.lastTime;
      
      this.frameHistory.push(deltaTime);
      if (this.frameHistory.length > this.maxHistory) {
        this.frameHistory.shift();
      }
      
      // Calculate average FPS
      const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
      this.fps = Math.round(1000 / avgFrameTime);
      
      this.lastTime = currentTime;
      this.frameCount++;
    }

    /**
     * Get current FPS
     */
    getFPS() {
      return this.fps;
    }

    /**
     * Check if performance is below target
     */
    isBelowTarget(targetFPS) {
      return this.fps < targetFPS * 0.8; // 20% tolerance
    }

    /**
     * Reset monitor
     */
    reset() {
      this.frameCount = 0;
      this.frameHistory = [];
      this.lastTime = Utils.now();
    }
  }

  // =============================================================================
  // HybridPageTransitionAPI - Main Class
  // =============================================================================

  class HybridPageTransitionAPI {
    constructor(options = {}) {
      // Device detection
      this.deviceDetector = new DeviceProfileDetector();
      this.deviceProfile = this.deviceDetector.getProfile();
      
      // Merge user options with device profile
      this.config = Object.assign({}, this.deviceProfile, options);
      
      // State
      this.canvas = null;
      this.renderer = null;
      this.particles = [];
      this.isTransitioning = false;
      this.transitionPhase = 'idle';
      this.phaseStartTime = 0;
      this.animationId = null;
      this.onCompleteCallback = null;
      
      // Performance monitoring
      this.performanceMonitor = new PerformanceMonitor();
      this.autoOptimize = options.autoOptimize !== false; // Default to true
      
      // Debug
      this.debug = CONFIG.DEBUG.enabled || options.debug || false;
      
      // Bind methods
      this._animate = this._animate.bind(this);
      this._handleResize = this._handleResize.bind(this);
      
      // Listen for resize
      window.addEventListener('resize', this._handleResize);
      
      if (this.debug) {
        this._log('Initialized with profile:', this.deviceDetector.getProfileName());
        this._log('Configuration:', this.config);
      }
    }

    /**
     * Debug logging
     */
    _log(...args) {
      if (this.debug && CONFIG.DEBUG.logTransitions) {
        console.log('[HybridPageTransitionAPI]', ...args);
      }
    }

    /**
     * Handle window resize
     */
    _handleResize() {
      if (this.isTransitioning && this.canvas) {
        // Gracefully abort transition on significant resize
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        if (Math.abs(this.canvas.width - newWidth) > 100 || 
            Math.abs(this.canvas.height - newHeight) > 100) {
          this._completeTransition();
        }
      }
    }

    /**
     * Initialize canvas and renderer
     */
    _initCanvas() {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hybrid-page-transition-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = CONFIG.CANVAS_Z_INDEX;
        this.canvas.style.pointerEvents = 'none';
      }

      // Set canvas dimensions
      const pixelRatio = Utils.getPixelRatio();
      this.canvas.width = window.innerWidth * pixelRatio;
      this.canvas.height = window.innerHeight * pixelRatio;

      // Initialize renderer
      if (this.config.useWebGL && this.deviceDetector.hasWebGL()) {
        this.renderer = new WebGLRenderer(this.canvas, this.config);
        if (!this.renderer.isReady()) {
          // Fallback to Canvas 2D
          this._log('WebGL initialization failed, falling back to Canvas 2D');
          this.renderer = new Canvas2DRenderer(this.canvas, this.config);
        } else {
          this._log('Using WebGL renderer');
        }
      } else {
        this.renderer = new Canvas2DRenderer(this.canvas, this.config);
        this._log('Using Canvas 2D renderer');
      }

      // Append to body
      if (!this.canvas.parentElement) {
        document.body.appendChild(this.canvas);
      }
    }

    /**
     * Clean up canvas
     */
    _cleanupCanvas() {
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
      
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.remove();
      }
      
      this.canvas = null;
    }

    /**
     * Sample colors from DOM elements
     */
    _sampleColors(elements) {
      const colors = new Set();
      
      if (!elements || elements.length === 0) {
        // Default colors
        return [
          'rgba(94, 232, 125, 0.8)',
          'rgba(109, 217, 232, 0.8)',
          'rgba(255, 140, 140, 0.8)'
        ];
      }

      elements.forEach(element => {
        const computed = window.getComputedStyle(element);
        
        // Sample background color
        const bgColor = computed.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          colors.add(bgColor);
        }
        
        // Sample text color
        const textColor = computed.color;
        if (textColor) {
          colors.add(textColor);
        }
        
        // Sample border color
        const borderColor = computed.borderColor;
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(borderColor);
        }
      });

      const colorArray = Array.from(colors);
      
      // Ensure we have at least some colors
      if (colorArray.length === 0) {
        return [
          'rgba(94, 232, 125, 0.8)',
          'rgba(109, 217, 232, 0.8)',
          'rgba(255, 140, 140, 0.8)'
        ];
      }

      return colorArray;
    }

    /**
     * Create particles from DOM elements
     */
    _createParticles(options = {}) {
      const particleCount = options.particleCount || this.config.particleCount;
      const elements = options.fromElements || [];
      const colors = options.colors || this._sampleColors(elements);
      
      this.particles = [];

      // If no elements, create particles from center
      if (elements.length === 0) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const pixelRatio = Utils.getPixelRatio();

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = (Math.random() * 100 + 50) * pixelRatio;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Utils.lerp(
            this.config.particleSize.min,
            this.config.particleSize.max,
            Math.random()
          );
          
          this.particles.push(new Particle(x, y, color, size));
        }
        return;
      }

      // Create particles from elements
      const particlesPerElement = Math.ceil(particleCount / elements.length);
      const pixelRatio = Utils.getPixelRatio();

      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < particlesPerElement && this.particles.length < particleCount; i++) {
          const x = (rect.left + Math.random() * rect.width) * pixelRatio;
          const y = (rect.top + Math.random() * rect.height) * pixelRatio;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Utils.lerp(
            this.config.particleSize.min,
            this.config.particleSize.max,
            Math.random()
          );
          
          this.particles.push(new Particle(x, y, color, size));
        }
      });
    }

    /**
     * Get phase duration
     */
    _getPhaseDuration() {
      switch (this.transitionPhase) {
        case 'disperse':
          return CONFIG.TRANSITION_PHASES.DISPERSE;
        case 'hold':
          return CONFIG.TRANSITION_PHASES.HOLD;
        case 'fade':
          return CONFIG.TRANSITION_PHASES.FADE;
        default:
          return 1000;
      }
    }

    /**
     * Animation loop
     */
    _animate(currentTime) {
      if (!this.isTransitioning) return;

      // Calculate delta time
      const deltaTime = Math.min((currentTime - this.phaseStartTime) / 1000, 0.1); // Cap at 100ms
      
      // Update performance monitor
      this.performanceMonitor.update();
      
      // Auto-optimize if enabled
      if (this.autoOptimize && this.performanceMonitor.frameCount % 60 === 0) {
        this._autoOptimize();
      }

      // Calculate phase progress
      const phaseElapsed = currentTime - this.phaseStartTime;
      const phaseDuration = this._getPhaseDuration();
      const progress = Math.min(phaseElapsed / phaseDuration, 1);

      // Clear canvas
      this.renderer.clear(CONFIG.EFFECTS.backgroundColor);

      // Update and render based on phase
      this._updatePhase(progress, deltaTime);
      
      // Render particles
      this.renderer.render(this.particles);

      // Debug info
      if (this.debug && CONFIG.DEBUG.showFPS) {
        this._renderDebugInfo();
      }

      // Check if phase is complete
      if (progress >= 1) {
        this._advancePhase();
      }

      // Continue animation
      this.animationId = requestAnimationFrame(this._animate);
    }

    /**
     * Update particles based on current phase
     */
    _updatePhase(progress, deltaTime) {
      switch (this.transitionPhase) {
        case 'disperse':
          // Particles explode outward
          this.particles.forEach(particle => {
            particle.update(deltaTime);
          });
          break;

        case 'hold':
          // Particles continue with momentum
          this.particles.forEach(particle => {
            particle.update(deltaTime);
          });
          break;

        case 'fade':
          // Particles fade out
          this.particles.forEach(particle => {
            particle.update(deltaTime);
            particle.alpha = 1 - progress;
          });
          break;
      }
    }

    /**
     * Advance to next phase
     */
    _advancePhase() {
      this.phaseStartTime = Utils.now();

      switch (this.transitionPhase) {
        case 'disperse':
          this.transitionPhase = 'hold';
          break;
        case 'hold':
          this.transitionPhase = 'fade';
          break;
        case 'fade':
          this._completeTransition();
          break;
      }
    }

    /**
     * Complete transition
     */
    _completeTransition() {
      this._log('Transition complete');
      
      this.isTransitioning = false;
      
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      this._cleanupCanvas();
      this.particles = [];
      
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
        this.onCompleteCallback = null;
      }
    }

    /**
     * Auto-optimize performance
     */
    _autoOptimize() {
      const targetFPS = this.config.targetFPS;
      const currentFPS = this.performanceMonitor.getFPS();
      
      if (currentFPS < targetFPS * 0.7) {
        // Reduce particle count if performance is poor
        const reductionFactor = 0.9;
        const newCount = Math.floor(this.particles.length * reductionFactor);
        
        if (newCount > 20) { // Minimum particle count
          this.particles = this.particles.slice(0, newCount);
          this._log(`Auto-optimized: Reduced particles to ${newCount} (FPS: ${currentFPS})`);
        }
      }
    }

    /**
     * Render debug information
     */
    _renderDebugInfo() {
      if (this.renderer instanceof Canvas2DRenderer) {
        const ctx = this.renderer.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '14px monospace';
        ctx.fillText(`FPS: ${this.performanceMonitor.getFPS()}`, 10, 20);
        ctx.fillText(`Particles: ${this.particles.length}`, 10, 40);
        ctx.fillText(`Phase: ${this.transitionPhase}`, 10, 60);
        ctx.fillText(`Profile: ${this.deviceDetector.getProfileName()}`, 10, 80);
        ctx.restore();
      }
    }

    /**
     * Start a page transition
     * 
     * @param {Object} options - Transition options
     * @param {Array} options.fromElements - DOM elements to sample particles from
     * @param {Array} options.colors - Custom particle colors
     * @param {Number} options.particleCount - Override particle count
     * @param {Function} options.onComplete - Callback when transition completes
     */
    startTransition(options = {}) {
      if (this.isTransitioning) {
        this._log('Transition already in progress, ignoring');
        return;
      }

      this._log('Starting transition with options:', options);

      // Initialize state
      this.isTransitioning = true;
      this.transitionPhase = 'disperse';
      this.phaseStartTime = Utils.now();
      this.onCompleteCallback = options.onComplete || null;
      
      // Reset performance monitor
      this.performanceMonitor.reset();

      // Initialize canvas and renderer
      this._initCanvas();

      // Create particles
      this._createParticles(options);

      // Apply explosion force
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const intensity = (options.explosionIntensity || 1.0) * CONFIG.PHYSICS.dispersionSpeed;
      
      this.particles.forEach(particle => {
        particle.explode(centerX, centerY, intensity);
      });

      // Start animation
      this.animationId = requestAnimationFrame(this._animate);
    }

    /**
     * Check if transition is active
     */
    isActive() {
      return this.isTransitioning;
    }

    /**
     * Get device profile information
     */
    getDeviceProfile() {
      return {
        name: this.deviceDetector.getProfileName(),
        config: this.config,
        capabilities: this.deviceDetector.getCapabilities()
      };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
      this.config = Object.assign({}, this.config, newConfig);
      this._log('Configuration updated:', this.config);
    }

    /**
     * Enable/disable debug mode
     */
    setDebug(enabled) {
      this.debug = enabled;
      this._log('Debug mode:', enabled ? 'enabled' : 'disabled');
    }

    /**
     * Clean up and destroy the API
     */
    destroy() {
      this._log('Destroying API');
      
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      this._cleanupCanvas();
      window.removeEventListener('resize', this._handleResize);
      
      this.particles = [];
      this.isTransitioning = false;
    }
  }

  // =============================================================================
  // Navigation Interceptor
  // =============================================================================

  class NavigationInterceptor {
    constructor(api, config = {}) {
      this.api = api;
      this.config = Object.assign({
        enabledPages: ['all'],
        transitionTiming: 'default',
        customBehaviors: {}
      }, config);
      
      this.mutationObserver = null;
      this.hookedLinks = new WeakSet();
      
      this._init();
    }

    /**
     * Initialize the interceptor
     */
    _init() {
      // Hook existing links on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._hookAllLinks());
      } else {
        this._hookAllLinks();
      }

      // Watch for dynamically added links
      this._watchForNewLinks();
    }

    /**
     * Hook all navigation links
     */
    _hookAllLinks() {
      const links = document.querySelectorAll('a');
      links.forEach(link => this._hookLink(link));
    }

    /**
     * Hook a single link
     */
    _hookLink(link) {
      // Skip if already hooked
      if (this.hookedLinks.has(link)) {
        return;
      }

      // Skip external links
      try {
        if (link.target === '_blank' || 
            (link.hostname && link.hostname !== window.location.hostname)) {
          return;
        }
      } catch (e) {
        // Ignore errors from accessing hostname
      }

      // Get href
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

      // Add click handler
      link.addEventListener('click', (e) => {
        if (this.api.isActive()) {
          e.preventDefault();
          return;
        }

        e.preventDefault();

        // Get page-specific behavior
        const pageName = this._getPageName(href);
        const behavior = this.config.customBehaviors[pageName] || {};

        // Get elements to sample
        const elements = this._getPageElements();

        // Start transition
        this.api.startTransition({
          fromElements: elements,
          colors: behavior.colors,
          particleCount: behavior.particleCount,
          explosionIntensity: behavior.explosionIntensity,
          onComplete: () => {
            window.location.href = href;
          }
        });
      });

      // Mark as hooked
      this.hookedLinks.add(link);
    }

    /**
     * Get elements to sample for particles
     */
    _getPageElements() {
      const selectors = [
        '.important-word',
        '.app-card',
        '.fkrc-verifywin-word',
        'button',
        'h1',
        'h2',
        '.gallery-filename',
        '.home-header',
        'nav'
      ];

      let elements = [];
      selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        elements = elements.concat(Array.from(found));
      });

      // Filter to visible elements
      elements = elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      return elements.slice(0, 20); // Limit for performance
    }

    /**
     * Extract page name from href
     */
    _getPageName(href) {
      const match = href.match(/\/([^\/]+)\.html/);
      return match ? match[1] : 'unknown';
    }

    /**
     * Watch for dynamically added links
     */
    _watchForNewLinks() {
      let debounceTimer = null;
      
      this.mutationObserver = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const links = document.querySelectorAll('a');
          links.forEach(link => this._hookLink(link));
        }, 100);
      });

      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    /**
     * Disconnect the interceptor
     */
    disconnect() {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
      }
    }
  }

  // =============================================================================
  // CSS Fallback for non-WebGL environments
  // =============================================================================

  const CSSFallback = {
    /**
     * Create CSS fade transition
     */
    createFadeTransition: function() {
      const style = document.createElement('style');
      style.id = 'hybrid-transition-fallback';
      style.textContent = `
        .hybrid-transition-fade {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(2, 6, 18, 1);
          z-index: 99999;
          pointer-events: none;
          animation: hybridFadeInOut 1.5s ease-in-out;
        }
        
        @keyframes hybridFadeInOut {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    },

    /**
     * Apply CSS fallback transition
     */
    applyTransition: function(onComplete) {
      // Ensure style exists
      if (!document.getElementById('hybrid-transition-fallback')) {
        this.createFadeTransition();
      }

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'hybrid-transition-fade';
      document.body.appendChild(overlay);

      // Remove after animation
      setTimeout(() => {
        overlay.remove();
        if (onComplete) onComplete();
      }, 1500);
    }
  };

  // =============================================================================
  // Export to Global Scope
  // =============================================================================

  // Create global instance
  const api = new HybridPageTransitionAPI({
    autoOptimize: true,
    debug: false
  });

  // Export API
  window.HybridPageTransitionAPI = {
    // Main API instance
    instance: api,
    
    // Constructor for creating new instances
    create: function(options) {
      return new HybridPageTransitionAPI(options);
    },
    
    // Initialize with navigation interception
    init: function(config = {}) {
      const interceptor = new NavigationInterceptor(api, config);
      return {
        api: api,
        interceptor: interceptor,
        disconnect: () => interceptor.disconnect()
      };
    },
    
    // Utility classes (for advanced usage)
    DeviceProfileDetector: DeviceProfileDetector,
    PerformanceMonitor: PerformanceMonitor,
    
    // CSS Fallback utility
    CSSFallback: CSSFallback,
    
    // Configuration
    CONFIG: CONFIG
  };

  // Auto-initialize if data attribute is present
  if (document.documentElement.hasAttribute('data-hybrid-transitions')) {
    window.addEventListener('DOMContentLoaded', () => {
      window.HybridPageTransitionAPI.init();
    });
  }

})(window);
