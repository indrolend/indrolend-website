/**
 * Easter Egg: Button-to-Cube Transformation
 * Triggers when user types "indrolend" on the homepage
 * Uses Canvas2D for lightweight 3D-like cube rendering with physics
 */

(function() {
  'use strict';

  // Configuration
  const TRIGGER_WORD = 'indrolend';
  const BUFFER_SIZE = 16;
  const BUTTON_SELECTOR = '.app-card';
  const GRAVITY = 0.3;
  const BOUNCE_DAMPING = 0.7;
  const ROTATION_SPEED = 0.02;
  const DEFAULT_BG_COLOR = 'rgba(5, 12, 28, 0.96)';
  const DEFAULT_BORDER_COLOR = 'rgba(109, 217, 232, 0.3)';

  // State
  let keyBuffer = '';
  let isActive = false;
  let canvas = null;
  let ctx = null;
  let cubes = [];
  let animationFrame = null;
  let originalButtons = [];
  let resizeHandler = null;
  let keyDownHandler = null;

  /**
   * Rolling buffer for keydown detection
   */
  function handleKeyDown(e) {
    // Only capture alphabetic keys (trigger word is 'indrolend')
    if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
      keyBuffer += e.key.toLowerCase();
      
      // Keep buffer at max size
      if (keyBuffer.length > BUFFER_SIZE) {
        keyBuffer = keyBuffer.slice(-BUFFER_SIZE);
      }

      // Check for trigger word
      if (keyBuffer.includes(TRIGGER_WORD)) {
        toggleEasterEgg();
        keyBuffer = ''; // Reset buffer after trigger
      }
    }
  }

  /**
   * Toggle the Easter egg on/off
   */
  function toggleEasterEgg() {
    if (isActive) {
      deactivate();
    } else {
      activate();
    }
  }

  /**
   * Activate the Easter egg
   */
  function activate() {
    if (isActive) return;
    
    isActive = true;
    
    // Create canvas overlay
    createCanvas();
    
    // Transform buttons to cubes
    transformButtonsToCubes();
    
    // Start animation loop
    animate();
  }

  /**
   * Deactivate the Easter egg
   */
  function deactivate() {
    if (!isActive) return;
    
    isActive = false;
    
    // Stop animation
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    
    // Remove resize listener
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    
    // Remove canvas
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
    ctx = null;
    
    // Restore original buttons
    originalButtons.forEach(({ element, display }) => {
      element.style.display = display;
    });
    
    originalButtons = [];
    cubes = [];
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /**
   * Create canvas overlay
   */
  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'easter-egg-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'pointer';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    
    // Click to deactivate
    canvas.addEventListener('click', deactivate);
    
    // Handle window resize - store handler for cleanup
    resizeHandler = handleResize;
    window.addEventListener('resize', resizeHandler);
  }

  /**
   * Transform buttons into cubes
   */
  function transformButtonsToCubes() {
    const buttons = document.querySelectorAll(BUTTON_SELECTOR);
    
    buttons.forEach((button) => {
      // Store original display value
      const display = window.getComputedStyle(button).display;
      originalButtons.push({ element: button, display });
      
      // Get button properties
      const rect = button.getBoundingClientRect();
      const styles = window.getComputedStyle(button);
      
      // Extract colors
      const bgColor = styles.backgroundColor || DEFAULT_BG_COLOR;
      const borderColor = styles.borderColor || DEFAULT_BORDER_COLOR;
      
      // Get text content - try multiple selectors for robustness
      const textEl = button.querySelector('.important-word') || 
                     button.querySelector('.app-card-label') ||
                     button;
      const text = textEl ? textEl.textContent.trim() : 'button';
      
      // Create cube object
      const cube = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        size: Math.max(rect.width, rect.height) * 0.6,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: Math.random() * -3 - 2, // Initial upward velocity
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        angularVelocityX: (Math.random() - 0.5) * ROTATION_SPEED * 2,
        angularVelocityY: (Math.random() - 0.5) * ROTATION_SPEED * 2,
        angularVelocityZ: (Math.random() - 0.5) * ROTATION_SPEED * 2,
        bgColor: bgColor,
        borderColor: borderColor,
        text: text
      };
      
      cubes.push(cube);
      
      // Hide original button
      button.style.display = 'none';
    });
  }

  /**
   * Update cube physics
   */
  function updateCubes() {
    cubes.forEach((cube) => {
      // Apply gravity
      cube.velocityY += GRAVITY;
      
      // Update position
      cube.x += cube.velocityX;
      cube.y += cube.velocityY;
      
      // Update rotation
      cube.rotationX += cube.angularVelocityX;
      cube.rotationY += cube.angularVelocityY;
      cube.rotationZ += cube.angularVelocityZ;
      
      // Bounce off floor
      if (cube.y + cube.size / 2 > canvas.height) {
        cube.y = canvas.height - cube.size / 2;
        cube.velocityY *= -BOUNCE_DAMPING;
        cube.velocityX *= 0.95; // Friction
        
        // Reduce angular velocity on bounce
        cube.angularVelocityX *= 0.9;
        cube.angularVelocityY *= 0.9;
        cube.angularVelocityZ *= 0.9;
      }
      
      // Bounce off walls
      if (cube.x - cube.size / 2 < 0) {
        cube.x = cube.size / 2;
        cube.velocityX *= -BOUNCE_DAMPING;
      } else if (cube.x + cube.size / 2 > canvas.width) {
        cube.x = canvas.width - cube.size / 2;
        cube.velocityX *= -BOUNCE_DAMPING;
      }
      
      // Stop very slow movement
      if (Math.abs(cube.velocityY) < 0.1 && cube.y + cube.size / 2 >= canvas.height - 1) {
        cube.velocityY = 0;
        cube.velocityX *= 0.98;
      }
      if (Math.abs(cube.velocityX) < 0.05) {
        cube.velocityX = 0;
      }
    });
  }

  /**
   * Draw a 3D-like cube using Canvas2D
   * Uses isometric projection for 3D appearance
   */
  function drawCube(cube) {
    ctx.save();
    ctx.translate(cube.x, cube.y);
    
    const s = cube.size;
    const depth = s * 0.5;
    
    // Simple rotation effect by scaling faces
    const rx = Math.sin(cube.rotationX) * 0.3 + 1;
    const ry = Math.cos(cube.rotationY) * 0.3 + 1;
    
    // Draw three visible faces of the cube (isometric style)
    
    // Top face
    ctx.fillStyle = lightenColor(cube.bgColor, 30);
    ctx.strokeStyle = cube.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s/2 * rx, -s/2 * ry);
    ctx.lineTo(0, -s/2 * ry - depth/2);
    ctx.lineTo(s/2 * rx, -s/2 * ry);
    ctx.lineTo(0, -s/2 * ry + depth/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Left face
    ctx.fillStyle = darkenColor(cube.bgColor, 20);
    ctx.beginPath();
    ctx.moveTo(-s/2 * rx, -s/2 * ry);
    ctx.lineTo(-s/2 * rx, s/2 * ry);
    ctx.lineTo(0, s/2 * ry + depth/2);
    ctx.lineTo(0, -s/2 * ry + depth/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Front face
    ctx.fillStyle = cube.bgColor;
    ctx.beginPath();
    ctx.moveTo(0, -s/2 * ry + depth/2);
    ctx.lineTo(0, s/2 * ry + depth/2);
    ctx.lineTo(s/2 * rx, s/2 * ry);
    ctx.lineTo(s/2 * rx, -s/2 * ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw text on front face
    ctx.fillStyle = '#6dd9e8';
    ctx.font = `${s * 0.15}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text if needed
    const words = cube.text.split(' ');
    const maxWidth = s * 0.8;
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Draw lines
    const lineHeight = s * 0.18;
    const startY = -(lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, s * 0.15, startY + i * lineHeight);
    });
    
    ctx.restore();
  }

  /**
   * Lighten a color
   */
  function lightenColor(color, percent) {
    return adjustColor(color, percent);
  }

  /**
   * Darken a color
   */
  function darkenColor(color, percent) {
    return adjustColor(color, -percent);
  }

  /**
   * Adjust color brightness
   */
  function adjustColor(color, percent) {
    // Parse rgba color
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return color;
    
    let [, r, g, b, a] = match;
    r = Math.max(0, Math.min(255, parseInt(r) + percent));
    g = Math.max(0, Math.min(255, parseInt(g) + percent));
    b = Math.max(0, Math.min(255, parseInt(b) + percent));
    a = a !== undefined ? a : 1;
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Animation loop
   */
  function animate() {
    if (!isActive) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw cubes
    updateCubes();
    cubes.forEach(drawCube);
    
    // Draw hint text
    ctx.fillStyle = 'rgba(109, 217, 232, 0.8)';
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click anywhere to exit', canvas.width / 2, canvas.height - 30);
    
    animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Initialize Easter egg listener
   */
  function init() {
    // Only activate on home page - check for exact home.html or root path
    const path = window.location.pathname;
    const isHomePage = path.endsWith('/home.html') || 
                       path === '/pages/home.html' ||
                       (path === '/' && document.querySelector('.home-bg'));
    
    if (!isHomePage) {
      return;
    }
    
    // Store handler for potential cleanup
    keyDownHandler = handleKeyDown;
    document.addEventListener('keydown', keyDownHandler);
  }

  /**
   * Cleanup function (called when page unloads)
   */
  function cleanup() {
    if (keyDownHandler) {
      document.removeEventListener('keydown', keyDownHandler);
      keyDownHandler = null;
    }
    deactivate();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

})();
