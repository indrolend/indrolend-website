/**
 * WebGL Hybrid Transition Engine
 * 
 * Creates smooth full-page transitions between pages using WebGL effects.
 * Captures the current page as an image, applies effects (fade out, explosion,
 * recombination), then fades in to the next page.
 * 
 * Features:
 * - Full page screenshot capture using html2canvas
 * - WebGL-accelerated image effects
 * - Opacity fade out/in
 * - Explosion and recombination animation
 * - Smooth transitions between any pages
 */

(function(window) {
  'use strict';

  // Configuration
  const CONFIG = {
    // Transition phases timing (ms)
    FADE_OUT_DURATION: 400,
    EXPLOSION_DURATION: 800,
    RECOMBINE_DURATION: 800,
    FADE_IN_DURATION: 400,
    
    // WebGL settings
    CANVAS_Z_INDEX: 9999,
    GRID_SIZE: 20, // Number of pieces to break image into (20x20 = 400 pieces)
    
    // Animation settings
    EXPLOSION_SPREAD: 300, // How far pieces explode
    ROTATION_INTENSITY: Math.PI * 2, // Max rotation during explosion
  };

  /**
   * WebGL Hybrid Transition Engine
   */
  class WebGLHybridTransition {
    constructor() {
      this.canvas = null;
      this.gl = null;
      this.isTransitioning = false;
      this.currentPhase = 'idle';
      this.phaseStartTime = 0;
      this.animationId = null;
      this.pageImage = null;
      this.onCompleteCallback = null;
      
      // WebGL resources
      this.program = null;
      this.texture = null;
      this.pieces = [];
      
      this._animate = this._animate.bind(this);
    }

    /**
     * Initialize WebGL context and canvas
     */
    _initCanvas() {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'webgl-transition-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = CONFIG.CANVAS_Z_INDEX;
        this.canvas.style.pointerEvents = 'none';
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Try to get WebGL context
        this.gl = this.canvas.getContext('webgl') || 
                  this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
          console.warn('WebGL not supported, falling back to 2D canvas');
          return false;
        }
      }
      
      if (!this.canvas.parentElement) {
        document.body.appendChild(this.canvas);
      }
      
      return true;
    }

    /**
     * Cleanup canvas and WebGL resources
     */
    _cleanup() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      if (this.gl) {
        if (this.texture) {
          this.gl.deleteTexture(this.texture);
          this.texture = null;
        }
        if (this.program) {
          this.gl.deleteProgram(this.program);
          this.program = null;
        }
      }
      
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.remove();
      }
      
      this.canvas = null;
      this.gl = null;
      this.pageImage = null;
      this.pieces = [];
    }

    /**
     * Capture current page as image
     */
    async _capturePageImage() {
      return new Promise((resolve) => {
        // Use html2canvas if available, otherwise use simpler method
        if (typeof html2canvas !== 'undefined') {
          html2canvas(document.body, {
            scale: 1,
            logging: false,
            backgroundColor: '#020612'
          }).then(canvas => {
            resolve(canvas);
          }).catch(err => {
            console.error('html2canvas failed:', err);
            resolve(this._fallbackCaptureMethod());
          });
        } else {
          // Fallback: Create a canvas with current viewport
          resolve(this._fallbackCaptureMethod());
        }
      });
    }

    /**
     * Fallback method to capture page without html2canvas
     */
    _fallbackCaptureMethod() {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      
      // Fill with background color
      ctx.fillStyle = '#020612';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a simplified representation
      ctx.fillStyle = '#5ee87d';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Transitioning...', canvas.width / 2, canvas.height / 2);
      
      return canvas;
    }

    /**
     * Setup WebGL shaders and program
     */
    _setupWebGL() {
      const gl = this.gl;
      
      // Vertex shader
      const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        uniform vec2 u_offset;
        uniform float u_rotation;
        uniform vec2 u_scale;
        
        void main() {
          // Apply transformation
          vec2 pos = a_position;
          
          // Rotate around center
          float s = sin(u_rotation);
          float c = cos(u_rotation);
          pos = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
          
          // Scale
          pos = pos * u_scale;
          
          // Translate
          pos = pos + u_offset;
          
          gl_Position = vec4(pos, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `;
      
      // Fragment shader
      const fragmentShaderSource = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;
        uniform float u_opacity;
        
        void main() {
          vec4 color = texture2D(u_texture, v_texCoord);
          gl_FragColor = vec4(color.rgb, color.a * u_opacity);
        }
      `;
      
      // Compile shaders
      const vertexShader = this._compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = this._compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
      
      if (!vertexShader || !fragmentShader) {
        console.error('Failed to compile shaders');
        return false;
      }
      
      // Create program
      this.program = gl.createProgram();
      gl.attachShader(this.program, vertexShader);
      gl.attachShader(this.program, fragmentShader);
      gl.linkProgram(this.program);
      
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('Failed to link program:', gl.getProgramInfoLog(this.program));
        return false;
      }
      
      gl.useProgram(this.program);
      
      // Enable blending for opacity
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      return true;
    }

    /**
     * Compile a shader
     */
    _compileShader(gl, source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    /**
     * Create texture from image
     */
    _createTexture(imageCanvas) {
      const gl = this.gl;
      
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageCanvas);
    }

    /**
     * Initialize grid pieces for explosion effect
     */
    _initializePieces() {
      this.pieces = [];
      const gridSize = CONFIG.GRID_SIZE;
      const pieceWidth = 2.0 / gridSize;
      const pieceHeight = 2.0 / gridSize;
      const texWidth = 1.0 / gridSize;
      const texHeight = 1.0 / gridSize;
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const x = -1.0 + col * pieceWidth;
          const y = 1.0 - row * pieceHeight;
          
          const texX = col * texWidth;
          const texY = row * texHeight;
          
          this.pieces.push({
            originalX: x + pieceWidth / 2,
            originalY: y - pieceHeight / 2,
            currentX: x + pieceWidth / 2,
            currentY: y - pieceHeight / 2,
            targetX: x + pieceWidth / 2,
            targetY: y - pieceHeight / 2,
            velocityX: (Math.random() - 0.5) * 0.02,
            velocityY: (Math.random() - 0.5) * 0.02,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            width: pieceWidth,
            height: pieceHeight,
            texX: texX,
            texY: texY,
            texWidth: texWidth,
            texHeight: texHeight
          });
        }
      }
    }

    /**
     * Render a single piece
     */
    _renderPiece(piece, opacity) {
      const gl = this.gl;
      
      // Create buffers for this piece
      const positions = [
        -piece.width / 2, -piece.height / 2,
        piece.width / 2, -piece.height / 2,
        -piece.width / 2, piece.height / 2,
        piece.width / 2, piece.height / 2
      ];
      
      const texCoords = [
        piece.texX, piece.texY + piece.texHeight,
        piece.texX + piece.texWidth, piece.texY + piece.texHeight,
        piece.texX, piece.texY,
        piece.texX + piece.texWidth, piece.texY
      ];
      
      // Position buffer
      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      
      const posLocation = gl.getAttribLocation(this.program, 'a_position');
      gl.enableVertexAttribArray(posLocation);
      gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Texture coordinate buffer
      const texBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
      
      const texLocation = gl.getAttribLocation(this.program, 'a_texCoord');
      gl.enableVertexAttribArray(texLocation);
      gl.vertexAttribPointer(texLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Set uniforms
      const offsetLocation = gl.getUniformLocation(this.program, 'u_offset');
      gl.uniform2f(offsetLocation, piece.currentX, piece.currentY);
      
      const rotationLocation = gl.getUniformLocation(this.program, 'u_rotation');
      gl.uniform1f(rotationLocation, piece.rotation);
      
      const scaleLocation = gl.getUniformLocation(this.program, 'u_scale');
      gl.uniform2f(scaleLocation, 1.0, 1.0);
      
      const opacityLocation = gl.getUniformLocation(this.program, 'u_opacity');
      gl.uniform1f(opacityLocation, opacity);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // Cleanup
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(texBuffer);
    }

    /**
     * Update pieces based on current phase
     */
    _updatePieces(progress) {
      const phase = this.currentPhase;
      
      if (phase === 'exploding') {
        // Pieces fly apart
        this.pieces.forEach(piece => {
          piece.currentX += piece.velocityX * CONFIG.EXPLOSION_SPREAD / 100;
          piece.currentY += piece.velocityY * CONFIG.EXPLOSION_SPREAD / 100;
          piece.rotation += piece.rotationSpeed;
        });
      } else if (phase === 'recombining') {
        // Pieces move back to original positions
        this.pieces.forEach(piece => {
          const dx = piece.originalX - piece.currentX;
          const dy = piece.originalY - piece.currentY;
          piece.currentX += dx * 0.15; // Smooth interpolation
          piece.currentY += dy * 0.15;
          piece.rotation *= 0.9; // Slow down rotation
        });
      }
    }

    /**
     * Render current frame
     */
    _render(progress) {
      const gl = this.gl;
      
      // Clear
      gl.clearColor(0.008, 0.024, 0.071, 1.0); // #020612
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Calculate opacity based on phase
      let opacity = 1.0;
      if (this.currentPhase === 'fadeOut') {
        opacity = 1.0 - progress;
      } else if (this.currentPhase === 'fadeIn') {
        opacity = progress;
      }
      
      // Render all pieces
      this.pieces.forEach(piece => {
        this._renderPiece(piece, opacity);
      });
    }

    /**
     * Animation loop
     */
    _animate(timestamp) {
      if (!this.isTransitioning) return;
      
      const elapsed = timestamp - this.phaseStartTime;
      const duration = this._getPhaseDuration();
      const progress = Math.min(elapsed / duration, 1.0);
      
      // Update pieces
      this._updatePieces(progress);
      
      // Render
      this._render(progress);
      
      // Check if phase complete
      if (progress >= 1.0) {
        this._advancePhase();
      }
      
      this.animationId = requestAnimationFrame(this._animate);
    }

    /**
     * Get duration for current phase
     */
    _getPhaseDuration() {
      switch (this.currentPhase) {
        case 'fadeOut': return CONFIG.FADE_OUT_DURATION;
        case 'exploding': return CONFIG.EXPLOSION_DURATION;
        case 'recombining': return CONFIG.RECOMBINE_DURATION;
        case 'fadeIn': return CONFIG.FADE_IN_DURATION;
        default: return 1000;
      }
    }

    /**
     * Advance to next phase
     */
    _advancePhase() {
      this.phaseStartTime = performance.now();
      
      switch (this.currentPhase) {
        case 'fadeOut':
          this.currentPhase = 'exploding';
          break;
        case 'exploding':
          this.currentPhase = 'recombining';
          break;
        case 'recombining':
          this.currentPhase = 'fadeIn';
          break;
        case 'fadeIn':
          this._complete();
          break;
      }
    }

    /**
     * Complete transition
     */
    _complete() {
      this.isTransitioning = false;
      this._cleanup();
      
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
        this.onCompleteCallback = null;
      }
    }

    /**
     * Start a transition
     */
    async startTransition(targetUrl, onComplete) {
      if (this.isTransitioning) return;
      
      this.isTransitioning = true;
      this.currentPhase = 'fadeOut';
      this.onCompleteCallback = onComplete;
      
      // Initialize canvas and WebGL
      if (!this._initCanvas() || !this._setupWebGL()) {
        console.error('Failed to initialize WebGL');
        this._complete();
        return;
      }
      
      // Capture current page
      const imageCanvas = await this._capturePageImage();
      this.pageImage = imageCanvas;
      
      // Create texture
      this._createTexture(imageCanvas);
      
      // Initialize pieces
      this._initializePieces();
      
      // Start animation
      this.phaseStartTime = performance.now();
      this.animationId = requestAnimationFrame(this._animate);
    }

    /**
     * Check if transition is active
     */
    isActive() {
      return this.isTransitioning;
    }
  }

  // Create singleton instance
  const transitionEngine = new WebGLHybridTransition();

  /**
   * Initialize navigation hooks
   */
  function initWebGLTransitions() {
    // Hook navigation links
    document.addEventListener('DOMContentLoaded', () => {
      hookAllLinks();
    });

    // Also watch for dynamically added links
    const observer = new MutationObserver(() => {
      hookAllLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Hook all internal navigation links
   */
  function hookAllLinks() {
    const links = document.querySelectorAll('a:not([data-webgl-hooked])');
    
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

      // Add click handler
      link.addEventListener('click', function(e) {
        if (transitionEngine.isActive()) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        
        // Start transition
        transitionEngine.startTransition(href, () => {
          // Navigate to new page after transition
          window.location.href = href;
        });
      });
      
      link.setAttribute('data-webgl-hooked', 'true');
    });
  }

  // Export to global scope
  window.WebGLHybridTransition = {
    init: initWebGLTransitions,
    engine: transitionEngine
  };

})(window);
