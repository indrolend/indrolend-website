/**
 * Easter Egg: Multiple Easter Eggs
 * 1. Button-to-Cube Transformation - Triggers when user types "indrolend" on the homepage
 * 2. Snake Game - Triggers when user clicks on the header image
 * Uses Canvas2D for lightweight rendering with physics
 */

(function() {
  'use strict';

  // Configuration for cube easter egg
  const TRIGGER_WORD = 'indrolend';
  const BUFFER_SIZE = 16;
  const BUTTON_SELECTOR = '.app-card';
  const GRAVITY = 0.3;
  const BOUNCE_DAMPING = 0.7;
  const ROTATION_SPEED = 0.02;

  // State for cube easter egg
  let keyBuffer = '';
  let isCubeActive = false;
  let cubeCanvas = null;
  let cubeCtx = null;
  let cubes = [];
  let cubeAnimationFrame = null;
  let originalButtons = [];

  // State for snake easter egg
  let isSnakeActive = false;
  let snakeAnimationFrame = null;
  let particleSystem = null; // Reference to the particle system from script.js

  /**
   * Rolling buffer for keypress detection
   */
  function handleKeyPress(e) {
    // Only capture alphanumeric keys
    if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
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
   * Toggle the cube Easter egg on/off
   */
  function toggleEasterEgg() {
    if (isCubeActive) {
      deactivateCube();
    } else {
      activateCube();
    }
  }

  /**
   * Activate the cube Easter egg
   */
  function activateCube() {
    if (isCubeActive) return;
    
    isCubeActive = true;
    
    // Create canvas overlay
    createCubeCanvas();
    
    // Transform buttons to cubes
    transformButtonsToCubes();
    
    // Start animation loop
    animateCubes();
  }

  /**
   * Deactivate the cube Easter egg
   */
  function deactivateCube() {
    if (!isCubeActive) return;
    
    isCubeActive = false;
    
    // Stop animation
    if (cubeAnimationFrame) {
      cancelAnimationFrame(cubeAnimationFrame);
      cubeAnimationFrame = null;
    }
    
    // Remove canvas
    if (cubeCanvas && cubeCanvas.parentNode) {
      cubeCanvas.parentNode.removeChild(cubeCanvas);
    }
    cubeCanvas = null;
    cubeCtx = null;
    
    // Restore original buttons
    originalButtons.forEach(({ element, display }) => {
      element.style.display = display;
    });
    
    originalButtons = [];
    cubes = [];
  }

  /**
   * Create canvas overlay for cube easter egg
   */
  function createCubeCanvas() {
    cubeCanvas = document.createElement('canvas');
    cubeCanvas.id = 'easter-egg-canvas';
    cubeCanvas.style.position = 'fixed';
    cubeCanvas.style.top = '0';
    cubeCanvas.style.left = '0';
    cubeCanvas.style.width = '100%';
    cubeCanvas.style.height = '100%';
    cubeCanvas.style.zIndex = '9999';
    cubeCanvas.style.pointerEvents = 'auto';
    cubeCanvas.style.cursor = 'pointer';
    cubeCanvas.width = window.innerWidth;
    cubeCanvas.height = window.innerHeight;
    
    document.body.appendChild(cubeCanvas);
    cubeCtx = cubeCanvas.getContext('2d');
    
    // Click to deactivate
    cubeCanvas.addEventListener('click', deactivateCube);
    
    // Handle window resize
    window.addEventListener('resize', handleCubeResize);
  }

  /**
   * Handle window resize for cube easter egg
   */
  function handleCubeResize() {
    if (!cubeCanvas) return;
    cubeCanvas.width = window.innerWidth;
    cubeCanvas.height = window.innerHeight;
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
      const bgColor = styles.backgroundColor || 'rgba(5, 12, 28, 0.96)';
      const borderColor = styles.borderColor || 'rgba(109, 217, 232, 0.3)';
      
      // Get text content
      const textEl = button.querySelector('.important-word');
      const text = textEl ? textEl.textContent : button.textContent.trim();
      
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
    cubeCtx.save();
    cubeCtx.translate(cube.x, cube.y);
    
    const s = cube.size;
    const depth = s * 0.5;
    
    // Simple rotation effect by scaling faces
    const rx = Math.sin(cube.rotationX) * 0.3 + 1;
    const ry = Math.cos(cube.rotationY) * 0.3 + 1;
    
    // Draw three visible faces of the cube (isometric style)
    
    // Top face
    cubeCtx.fillStyle = lightenColor(cube.bgColor, 30);
    cubeCtx.strokeStyle = cube.borderColor;
    cubeCtx.lineWidth = 2;
    cubeCtx.beginPath();
    cubeCtx.moveTo(-s/2 * rx, -s/2 * ry);
    cubeCtx.lineTo(0, -s/2 * ry - depth/2);
    cubeCtx.lineTo(s/2 * rx, -s/2 * ry);
    cubeCtx.lineTo(0, -s/2 * ry + depth/2);
    cubeCtx.closePath();
    cubeCtx.fill();
    cubeCtx.stroke();
    
    // Left face
    cubeCtx.fillStyle = darkenColor(cube.bgColor, 20);
    cubeCtx.beginPath();
    cubeCtx.moveTo(-s/2 * rx, -s/2 * ry);
    cubeCtx.lineTo(-s/2 * rx, s/2 * ry);
    cubeCtx.lineTo(0, s/2 * ry + depth/2);
    cubeCtx.lineTo(0, -s/2 * ry + depth/2);
    cubeCtx.closePath();
    cubeCtx.fill();
    cubeCtx.stroke();
    
    // Front face
    cubeCtx.fillStyle = cube.bgColor;
    cubeCtx.beginPath();
    cubeCtx.moveTo(0, -s/2 * ry + depth/2);
    cubeCtx.lineTo(0, s/2 * ry + depth/2);
    cubeCtx.lineTo(s/2 * rx, s/2 * ry);
    cubeCtx.lineTo(s/2 * rx, -s/2 * ry);
    cubeCtx.closePath();
    cubeCtx.fill();
    cubeCtx.stroke();
    
    // Draw text on front face
    cubeCtx.fillStyle = '#6dd9e8';
    cubeCtx.font = `${s * 0.15}px system-ui, sans-serif`;
    cubeCtx.textAlign = 'center';
    cubeCtx.textBaseline = 'middle';
    
    // Wrap text if needed
    const words = cube.text.split(' ');
    const maxWidth = s * 0.8;
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = cubeCtx.measureText(testLine);
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
      cubeCtx.fillText(line, s * 0.15, startY + i * lineHeight);
    });
    
    cubeCtx.restore();
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
   * Animation loop for cube easter egg
   */
  function animateCubes() {
    if (!isCubeActive) return;
    
    // Clear canvas
    cubeCtx.clearRect(0, 0, cubeCanvas.width, cubeCanvas.height);
    
    // Semi-transparent background
    cubeCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    cubeCtx.fillRect(0, 0, cubeCanvas.width, cubeCanvas.height);
    
    // Update and draw cubes
    updateCubes();
    cubes.forEach(drawCube);
    
    // Draw hint text
    cubeCtx.fillStyle = 'rgba(109, 217, 232, 0.8)';
    cubeCtx.font = '16px system-ui, sans-serif';
    cubeCtx.textAlign = 'center';
    cubeCtx.fillText('Click anywhere to exit', cubeCanvas.width / 2, cubeCanvas.height - 30);
    
    cubeAnimationFrame = requestAnimationFrame(animateCubes);
  }

  /**
   * Initialize Easter egg listener
   */
  function init() {
    // Only activate on home page - check for both home.html and pages with header image
    const isHomePage = window.location.pathname.includes('home.html') || 
                       document.querySelector('.home-header-image');
    
    if (!isHomePage) {
      return;
    }
    
    // Initialize cube easter egg
    document.addEventListener('keypress', handleKeyPress);
    
    // Initialize snake easter egg - click on header image
    const headerImage = document.querySelector('.home-header-image');
    if (headerImage) {
      headerImage.style.cursor = 'pointer';
      headerImage.addEventListener('click', activateSnake);
    }
  }

  // ========================
  // SNAKE GAME EASTER EGG
  // ========================

  // ========================
  // PARTICLE-BASED SNAKE GAME
  // ========================

  // Snake game state
  let snake = [];
  let food = null;
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let gridSize = 40; // Larger grid for particle clusters
  let snakeSpeed = 200; // ms per move
  let lastMoveTime = 0;
  let gameScore = 0;
  let isGameOver = false; // Flag to prevent multiple game over triggers
  let closeButton = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let particleTargets = []; // Target positions for particles
  let originalParticleState = null;
  let transitionPhase = 'none'; // 'entering', 'playing', 'exiting', 'none'
  let transitionStartTime = 0;
  const TRANSITION_DURATION = 400; // Reduced from 800ms for faster animation
  
  // Audio reactive system
  let audioContext = null;
  let audioElement = null;
  let audioSource = null; // Track the media source to prevent recreation
  let analyser = null;
  let audioDataArray = null;
  let audioBufferLength = 0;
  let audioFadeInterval = null;

  /**
   * Initialize audio system with analyser for visualization
   */
  function initSnakeAudio() {
    try {
      // If already initialized, just restart playback
      if (audioElement && audioSource) {
        audioElement.currentTime = 0;
        audioElement.volume = 0;
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            fadeInAudio();
          }).catch(error => {
            console.warn('Audio autoplay prevented:', error);
          });
        }
        return;
      }
      
      // Create or resume audio context
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Create audio element only once
      if (!audioElement) {
        audioElement = new Audio('/snake.mp3');
        audioElement.loop = true;
        audioElement.volume = 0; // Start at 0 for fade in
        
        // Add error handler for file loading
        audioElement.addEventListener('error', (e) => {
          console.error('Failed to load audio file /snake.mp3:', e);
          console.error('Please ensure the file exists in the root directory');
        });
      }
      
      // Create analyser node for visualization
      if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // Frequency bins (128 frequency values)
        audioBufferLength = analyser.frequencyBinCount;
        audioDataArray = new Uint8Array(audioBufferLength);
      }
      
      // Connect audio element to analyser (only once)
      if (!audioSource) {
        audioSource = audioContext.createMediaElementSource(audioElement);
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      
      // Start playing
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Fade in audio
          fadeInAudio();
        }).catch(error => {
          console.warn('Audio autoplay prevented:', error);
          // Try to play on first user interaction
        });
      }
    } catch (error) {
      console.error('Failed to initialize snake audio:', error);
    }
  }

  /**
   * Fade in audio over 1.5 seconds
   */
  function fadeInAudio() {
    if (!audioElement) return;
    
    const targetVolume = 0.6; // Max volume
    const fadeDuration = 1500; // 1.5 seconds
    const steps = 30;
    const volumeIncrement = targetVolume / steps;
    const intervalTime = fadeDuration / steps;
    
    let currentStep = 0;
    
    if (audioFadeInterval) clearInterval(audioFadeInterval);
    
    audioFadeInterval = setInterval(() => {
      currentStep++;
      audioElement.volume = Math.min(volumeIncrement * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(audioFadeInterval);
        audioFadeInterval = null;
      }
    }, intervalTime);
  }

  /**
   * Fade out and stop audio
   */
  function fadeOutAudio() {
    if (!audioElement) return;
    
    const fadeDuration = 800; // 0.8 seconds
    const steps = 20;
    const currentVolume = audioElement.volume;
    const volumeDecrement = currentVolume / steps;
    const intervalTime = fadeDuration / steps;
    
    let currentStep = 0;
    
    if (audioFadeInterval) clearInterval(audioFadeInterval);
    
    audioFadeInterval = setInterval(() => {
      currentStep++;
      audioElement.volume = Math.max(currentVolume - (volumeDecrement * currentStep), 0);
      
      if (currentStep >= steps) {
        clearInterval(audioFadeInterval);
        audioFadeInterval = null;
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    }, intervalTime);
  }

  /**
   * Get audio frequency data for visualization
   * Returns normalized bass/mid/treble values
   */
  function getAudioVisualizationData() {
    if (!analyser || !audioDataArray) {
      return { bass: 0, mid: 0, treble: 0, average: 0 };
    }
    
    analyser.getByteFrequencyData(audioDataArray);
    
    // Split frequency ranges
    const bassEnd = Math.floor(audioBufferLength * 0.15); // Low frequencies
    const midEnd = Math.floor(audioBufferLength * 0.5); // Mid frequencies
    // treble is from midEnd to end
    
    let bassSum = 0, midSum = 0, trebleSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += audioDataArray[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += audioDataArray[i];
    }
    for (let i = midEnd; i < audioBufferLength; i++) {
      trebleSum += audioDataArray[i];
    }
    
    // Normalize to 0-1 range with guards against division by zero
    const bass = bassEnd > 0 ? (bassSum / bassEnd) / 255 : 0;
    const mid = (midEnd - bassEnd) > 0 ? (midSum / (midEnd - bassEnd)) / 255 : 0;
    const treble = (audioBufferLength - midEnd) > 0 ? (trebleSum / (audioBufferLength - midEnd)) / 255 : 0;
    const average = (bass + mid + treble) / 3;
    
    return { bass, mid, treble, average };
  }

  /**
   * Activate snake game - transition particles then play
   */
  function activateSnake() {
    if (isSnakeActive || isCubeActive) return;
    
    isSnakeActive = true;
    transitionPhase = 'entering';
    transitionStartTime = performance.now();
    
    // Get reference to particles canvas
    const particlesCanvas = document.getElementById('particles-bg');
    if (!particlesCanvas) return;
    
    // Store reference to particle system
    particleSystem = {
      canvas: particlesCanvas,
      ctx: particlesCanvas.getContext('2d')
    };
    
    // Fade other page elements
    const homeContainer = document.querySelector('.home-container');
    if (homeContainer) {
      homeContainer.style.opacity = '0.2';
      homeContainer.style.pointerEvents = 'none';
    }
    
    // Create close button and overlay (but hide initially)
    createCloseButton();
    if (closeButton) closeButton.style.opacity = '0';
    const scoreOverlay = document.getElementById('snake-score-overlay');
    if (scoreOverlay) scoreOverlay.style.opacity = '0';
    
    // Initialize snake game
    initParticleSnakeGame();
    
    // Create initial particle targets for transition
    updateParticleTargets();
    
    // Start transition animation
    animateParticleSnake();
    
    // Initialize audio system
    initSnakeAudio();
    
    // After transition, add input handlers and show UI
    setTimeout(() => {
      transitionPhase = 'playing';
      if (closeButton) closeButton.style.opacity = '1';
      const scoreOverlay = document.getElementById('snake-score-overlay');
      if (scoreOverlay) scoreOverlay.style.opacity = '1';
      
      // Add input handlers
      document.addEventListener('keydown', handleSnakeKeyDown);
      document.addEventListener('touchstart', handleSnakeTouchStart, { passive: false });
      document.addEventListener('touchend', handleSnakeTouchEnd, { passive: false });
    }, TRANSITION_DURATION);
  }

  /**
   * Deactivate snake game - with exit transition
   */
  function deactivateSnake() {
    if (!isSnakeActive) return;
    
    // Start exit transition
    if (transitionPhase === 'playing') {
      transitionPhase = 'exiting';
      transitionStartTime = performance.now();
      
      // Hide UI immediately
      if (closeButton) closeButton.style.opacity = '0';
      const scoreOverlay = document.getElementById('snake-score-overlay');
      if (scoreOverlay) scoreOverlay.style.opacity = '0';
      
      // Remove input handlers
      document.removeEventListener('keydown', handleSnakeKeyDown);
      document.removeEventListener('touchstart', handleSnakeTouchStart);
      document.removeEventListener('touchend', handleSnakeTouchEnd);
      
      // Create targets back to original positions (will be empty, letting particles scatter naturally)
      particleTargets = [];
      
      // After transition, complete cleanup
      setTimeout(() => {
        completeDeactivation();
      }, TRANSITION_DURATION);
    } else {
      // If not in playing phase, deactivate immediately
      completeDeactivation();
    }
  }
  
  /**
   * Complete deactivation after transition
   */
  function completeDeactivation() {
    isSnakeActive = false;
    transitionPhase = 'none';
    
    // Stop animation
    if (snakeAnimationFrame) {
      cancelAnimationFrame(snakeAnimationFrame);
      snakeAnimationFrame = null;
    }
    
    // Remove close button and score overlay
    if (closeButton && closeButton.parentNode) {
      closeButton.parentNode.removeChild(closeButton);
    }
    closeButton = null;
    
    const scoreOverlay = document.getElementById('snake-score-overlay');
    if (scoreOverlay && scoreOverlay.parentNode) {
      scoreOverlay.parentNode.removeChild(scoreOverlay);
    }
    
    // Restore page visibility
    const homeContainer = document.querySelector('.home-container');
    if (homeContainer) {
      homeContainer.style.opacity = '1';
      homeContainer.style.pointerEvents = 'auto';
    }
    
    // Clear particle targets
    particleTargets = [];
    particleSystem = null;
    
    // Stop and cleanup audio
    fadeOutAudio();
    
    // Reset particles to their normal state
    if (window.resetParticles && typeof window.resetParticles === 'function') {
      window.resetParticles();
    }
  }

  /**
   * Create close button and score overlay
   */
  function createCloseButton() {
    // Create close button
    closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'fixed';
    closeButton.style.top = '20px';
    closeButton.style.left = '20px';
    closeButton.style.zIndex = '10000';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.fontSize = '32px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.color = 'rgba(109, 217, 232, 0.9)';
    closeButton.style.backgroundColor = 'rgba(5, 12, 28, 0.9)';
    closeButton.style.border = '2px solid rgba(109, 217, 232, 0.5)';
    closeButton.style.borderRadius = '8px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    closeButton.addEventListener('click', deactivateSnake);
    
    // Add hover effect
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(109, 217, 232, 0.2)';
      closeButton.style.borderColor = 'rgba(109, 217, 232, 0.9)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'rgba(5, 12, 28, 0.9)';
      closeButton.style.borderColor = 'rgba(109, 217, 232, 0.5)';
    });
    
    document.body.appendChild(closeButton);
    
    // Create score overlay div
    const scoreOverlay = document.createElement('div');
    scoreOverlay.id = 'snake-score-overlay';
    scoreOverlay.style.position = 'fixed';
    scoreOverlay.style.top = '0';
    scoreOverlay.style.left = '0';
    scoreOverlay.style.width = '100%';
    scoreOverlay.style.height = '100%';
    scoreOverlay.style.zIndex = '9999';
    scoreOverlay.style.pointerEvents = 'none';
    scoreOverlay.style.display = 'flex';
    scoreOverlay.style.flexDirection = 'column';
    scoreOverlay.style.justifyContent = 'space-between';
    scoreOverlay.style.alignItems = 'center';
    scoreOverlay.style.padding = '20px';
    
    scoreOverlay.innerHTML = `
      <div></div>
      <div style="text-align: right; width: 100%; color: rgba(109, 217, 232, 0.8); font: 20px 'SF Mono', Menlo, Monaco, Consolas, monospace;">
        Score: <span id="snake-score-value">0</span>
      </div>
      <div style="text-align: center; color: rgba(109, 217, 232, 0.5); font: 14px 'SF Mono', Menlo, Monaco, Consolas, monospace;">
        Arrow keys or WASD • Swipe on mobile
      </div>
    `;
    
    document.body.appendChild(scoreOverlay);
  }

  /**
   * Initialize particle-based snake game
   */
  function initParticleSnakeGame() {
    if (!particleSystem || !particleSystem.canvas) return;
    
    const canvas = particleSystem.canvas;
    
    // Calculate grid size - smaller for better playability
    const minDimension = Math.min(canvas.width, canvas.height);
    gridSize = Math.floor(minDimension / 20); // Smaller grid for actual gameplay
    if (gridSize < 20) gridSize = 20;
    if (gridSize > 40) gridSize = 40;
    
    // Initialize snake in the center
    const centerX = Math.floor(canvas.width / gridSize / 2);
    const centerY = Math.floor(canvas.height / gridSize / 2);
    
    snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY }
    ];
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    gameScore = 0;
    isGameOver = false; // Reset game over flag
    lastMoveTime = performance.now();
    
    // Place initial food
    placeParticleFood();
    
    // Create particle targets for visual effect
    updateParticleTargets();
  }

  /**
   * Place food at random location
   */
  function placeParticleFood() {
    if (!particleSystem || !particleSystem.canvas) return;
    
    const maxX = Math.floor(particleSystem.canvas.width / gridSize);
    const maxY = Math.floor(particleSystem.canvas.height / gridSize);
    
    let validPosition = false;
    let attempts = 0;
    
    while (!validPosition && attempts < 100) {
      food = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY)
      };
      
      // Check if food overlaps with snake
      validPosition = !snake.some(segment => 
        segment.x === food.x && segment.y === food.y
      );
      
      attempts++;
    }
    
    if (!validPosition) {
      food = { x: 0, y: 0 };
    }
  }

  /**
   * Update particle target positions - tight clusters during transitions
   */
  function updateParticleTargets() {
    particleTargets = [];
    
    // Create targets during entering AND playing phases
    if (transitionPhase !== 'entering' && transitionPhase !== 'playing') {
      return;
    }
    
    // Get audio data for particle colors (only during playing)
    const audioData = transitionPhase === 'playing' ? getAudioVisualizationData() : null;
    
    // Create tight clusters around snake segments
    snake.forEach((segment, index) => {
      const centerX = segment.x * gridSize + gridSize / 2;
      const centerY = segment.y * gridSize + gridSize / 2;
      
      // More particles per segment for solid appearance during transition
      const particlesPerSegment = 8;
      const radius = gridSize * 0.3; // Tight clustering
      
      for (let i = 0; i < particlesPerSegment; i++) {
        const angle = (i / particlesPerSegment) * Math.PI * 2;
        const r = radius * (0.5 + Math.random() * 0.5);
        particleTargets.push({
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r,
          type: 'snake',
          brightness: index === 0 ? 1 : 0.7,
          audioIntensity: audioData ? audioData.average : 0
        });
      }
    });
    
    // Create tight cluster around food
    if (food) {
      const centerX = food.x * gridSize + gridSize / 2;
      const centerY = food.y * gridSize + gridSize / 2;
      
      const foodParticles = 6;
      const radius = gridSize * 0.25;
      
      for (let i = 0; i < foodParticles; i++) {
        const angle = (i / foodParticles) * Math.PI * 2;
        particleTargets.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          type: 'food',
          brightness: 1,
          audioIntensity: audioData ? audioData.treble : 0
        });
      }
    }
  }

  /**
   * Handle keyboard input
   */
  function handleSnakeKeyDown(e) {
    if (!isSnakeActive) return;
    
    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction.y === 0) {
          nextDirection = { x: 0, y: -1 };
        }
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction.y === 0) {
          nextDirection = { x: 0, y: 1 };
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction.x === 0) {
          nextDirection = { x: -1, y: 0 };
        }
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction.x === 0) {
          nextDirection = { x: 1, y: 0 };
        }
        e.preventDefault();
        break;
    }
  }

  /**
   * Handle touch start
   */
  function handleSnakeTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  /**
   * Handle touch end
   */
  function handleSnakeTouchEnd(e) {
    e.preventDefault();
    if (!isSnakeActive) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && direction.x === 0) {
          nextDirection = { x: 1, y: 0 };
        } else if (deltaX < 0 && direction.x === 0) {
          nextDirection = { x: -1, y: 0 };
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && direction.y === 0) {
          nextDirection = { x: 0, y: 1 };
        } else if (deltaY < 0 && direction.y === 0) {
          nextDirection = { x: 0, y: -1 };
        }
      }
    }
  }

  /**
   * Update snake game logic
   */
  function updateParticleSnake(currentTime) {
    if (currentTime - lastMoveTime < snakeSpeed) {
      return;
    }
    
    lastMoveTime = currentTime;
    direction = nextDirection;
    
    // Calculate new head position
    const head = snake[0];
    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };
    
    // Check wall collision
    const maxX = Math.floor(particleSystem.canvas.width / gridSize);
    const maxY = Math.floor(particleSystem.canvas.height / gridSize);
    
    if (newHead.x < 0 || newHead.x >= maxX || 
        newHead.y < 0 || newHead.y >= maxY) {
      particleGameOver();
      return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      particleGameOver();
      return;
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      gameScore++;
      placeParticleFood();
      
      // Increase speed slightly
      if (snakeSpeed > 100) {
        snakeSpeed -= 5;
      }
    } else {
      // Remove tail
      snake.pop();
    }
    
    // Update particle targets to match new snake position
    updateParticleTargets();
  }

  /**
   * Escape HTML to prevent XSS attacks
   * Uses the escapeHtml function from security-utils.js if available
   */
  function escapeHtml(text) {
    if (window.SecurityUtils && typeof window.SecurityUtils.escapeHtml === 'function') {
      return window.SecurityUtils.escapeHtml(text);
    }
    // Fallback implementation
    if (typeof text !== 'string') {
      text = String(text);
    }
    const htmlEscapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return text.replace(/[&<>"']/g, char => htmlEscapeMap[char]);
  }

  /**
   * Get leaderboard from localStorage
   */
  function getLeaderboard() {
    try {
      const data = localStorage.getItem('snake_leaderboard');
      if (!data) return [];
      const leaderboard = JSON.parse(data);
      return Array.isArray(leaderboard) ? leaderboard : [];
    } catch (e) {
      console.error('Error loading leaderboard:', e);
      return [];
    }
  }

  /**
   * Save leaderboard to localStorage
   */
  function saveLeaderboard(leaderboard) {
    try {
      localStorage.setItem('snake_leaderboard', JSON.stringify(leaderboard));
    } catch (e) {
      console.error('Error saving leaderboard:', e);
    }
  }

  /**
   * Add entry to leaderboard and maintain top 5
   */
  function addToLeaderboard(name, message, score) {
    const leaderboard = getLeaderboard();
    
    // Sanitize inputs
    const sanitizedName = escapeHtml((name || 'Anonymous').trim().substring(0, 20) || 'Anonymous');
    const sanitizedMessage = escapeHtml((message || 'No message').trim().substring(0, 30) || 'No message');
    
    // Add new entry
    leaderboard.push({
      name: sanitizedName,
      message: sanitizedMessage,
      score: score,
      date: new Date().toISOString()
    });
    
    // Sort by score (highest first) and keep top 5
    leaderboard.sort((a, b) => b.score - a.score);
    const top5 = leaderboard.slice(0, 5);
    
    saveLeaderboard(top5);
    return top5;
  }

  /**
   * Check if score qualifies for leaderboard (top 5)
   */
  function qualifiesForLeaderboard(score) {
    const leaderboard = getLeaderboard();
    if (leaderboard.length < 5) return true;
    return score > leaderboard[4].score;
  }

  /**
   * Show leaderboard modal for score submission
   */
  function showLeaderboardModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'snake-leaderboard-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '10001';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    modal.style.boxSizing = 'border-box';
    
    // Get existing leaderboard
    const leaderboard = getLeaderboard();
    
    // Build leaderboard display HTML
    let leaderboardHtml = '';
    if (leaderboard.length > 0) {
      leaderboardHtml = '<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(109, 217, 232, 0.3);">';
      leaderboardHtml += '<div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: rgba(109, 217, 232, 0.9);">Top 5 Leaderboard</div>';
      
      leaderboard.forEach((entry, index) => {
        leaderboardHtml += `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid rgba(109, 217, 232, 0.15);">
            <div style="flex: 1;">
              <div style="font-size: 14px; color: rgba(109, 217, 232, 0.6);">#${index + 1}</div>
              <div style="font-weight: bold; font-size: 16px; color: rgba(109, 217, 232, 0.9); margin: 4px 0;">${entry.name}</div>
              <div style="font-style: italic; font-size: 12px; color: rgba(109, 217, 232, 0.5);">${entry.message}</div>
            </div>
            <div style="font-weight: bold; font-size: 20px; color: rgba(109, 217, 232, 0.9); margin-left: 20px;">${entry.score}</div>
          </div>
        `;
      });
      
      leaderboardHtml += '</div>';
    }
    
    // Create modal content
    modal.innerHTML = `
      <div style="
        background: rgba(5, 12, 28, 0.95);
        border: 2px solid rgba(109, 217, 232, 0.5);
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      ">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 28px; font-weight: bold; color: rgba(109, 217, 232, 0.9); margin-bottom: 10px;">Game Over!</div>
          <div style="font-size: 36px; font-weight: bold; color: rgba(109, 217, 232, 1);">Score: ${gameScore}</div>
        </div>
        
        <form id="leaderboard-form" style="margin-top: 25px;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; color: rgba(109, 217, 232, 0.8); font-size: 14px;">Name</label>
            <input 
              type="text" 
              id="player-name" 
              maxlength="20" 
              placeholder="Enter your name"
              style="
                width: 100%;
                padding: 12px;
                background: rgba(5, 12, 28, 0.8);
                border: 1px solid rgba(109, 217, 232, 0.3);
                border-radius: 6px;
                color: rgba(109, 217, 232, 0.9);
                font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
                font-size: 14px;
                box-sizing: border-box;
                outline: none;
              "
            />
          </div>
          
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="color: rgba(109, 217, 232, 0.8); font-size: 14px;">Tell the world</label>
              <span id="char-countdown" style="color: rgba(109, 217, 232, 0.6); font-size: 12px;">30</span>
            </div>
            <input 
              type="text" 
              id="player-message" 
              maxlength="30" 
              placeholder="Your message here..."
              style="
                width: 100%;
                padding: 12px;
                background: rgba(5, 12, 28, 0.8);
                border: 1px solid rgba(109, 217, 232, 0.3);
                border-radius: 6px;
                color: rgba(109, 217, 232, 0.9);
                font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
                font-size: 14px;
                box-sizing: border-box;
                outline: none;
              "
            />
          </div>
          
          <button 
            type="submit"
            id="submit-score"
            style="
              width: 100%;
              padding: 14px;
              background: rgba(109, 217, 232, 0.2);
              border: 2px solid rgba(109, 217, 232, 0.5);
              border-radius: 8px;
              color: rgba(109, 217, 232, 0.9);
              font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.2s ease;
            "
          >
            Submit Score
          </button>
        </form>
        
        ${leaderboardHtml}
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Get form elements
    const form = document.getElementById('leaderboard-form');
    const nameInput = document.getElementById('player-name');
    const messageInput = document.getElementById('player-message');
    const charCountdown = document.getElementById('char-countdown');
    const submitButton = document.getElementById('submit-score');
    
    // Auto-focus name input
    setTimeout(() => nameInput.focus(), 100);
    
    // Character countdown
    messageInput.addEventListener('input', () => {
      const remaining = 30 - messageInput.value.length;
      charCountdown.textContent = remaining;
      
      // Change color to red when less than 10 characters remain
      if (remaining < 10) {
        charCountdown.style.color = 'rgba(255, 82, 82, 0.9)';
      } else {
        charCountdown.style.color = 'rgba(109, 217, 232, 0.6)';
      }
    });
    
    // Hover effects for submit button
    submitButton.addEventListener('mouseenter', () => {
      submitButton.style.background = 'rgba(109, 217, 232, 0.3)';
      submitButton.style.borderColor = 'rgba(109, 217, 232, 0.9)';
    });
    
    submitButton.addEventListener('mouseleave', () => {
      submitButton.style.background = 'rgba(109, 217, 232, 0.2)';
      submitButton.style.borderColor = 'rgba(109, 217, 232, 0.5)';
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = nameInput.value.trim() || 'Anonymous';
      const message = messageInput.value.trim() || 'No message';
      
      // Add to leaderboard
      addToLeaderboard(name, message, gameScore);
      
      // Remove modal
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      
      // Deactivate game
      deactivateSnake();
    });
  }

  /**
   * Game over for particle snake - show leaderboard if qualified
   */
  function particleGameOver() {
    // Prevent multiple calls
    if (isGameOver) return;
    isGameOver = true;
    
    // Save high score to localStorage
    const currentHighScore = parseInt(localStorage.getItem('snake_high_score') || '0', 10);
    if (gameScore > currentHighScore) {
      localStorage.setItem('snake_high_score', gameScore.toString());
    }
    
    // Check if score qualifies for top 5
    if (qualifiesForLeaderboard(gameScore)) {
      // Show leaderboard modal
      showLeaderboardModal();
    } else {
      // Wait 1 second then deactivate
      setTimeout(() => {
        deactivateSnake();
      }, 1000);
    }
  }

  /**
   * Animation loop - handle transition phases
   */
  function animateParticleSnake() {
    if (!isSnakeActive && transitionPhase === 'none') return;
    
    const currentTime = performance.now();
    
    // Handle different transition phases
    if (transitionPhase === 'entering' || transitionPhase === 'exiting') {
      // During transitions, just update particle targets
      // Particles will be visible and animating
      if (transitionPhase === 'entering') {
        updateParticleTargets();
      }
    } else if (transitionPhase === 'playing') {
      // During gameplay, update game and draw it
      updateParticleSnake(currentTime);
      updateParticleTargets(); // Update particles every frame
      drawSnakeGame();
      
      // Update score display
      const scoreValue = document.getElementById('snake-score-value');
      if (scoreValue) {
        scoreValue.textContent = gameScore;
      }
    }
    
    snakeAnimationFrame = requestAnimationFrame(animateParticleSnake);
  }

  /**
   * Draw the actual snake game (only during play phase)
   * NOW WITH AUDIO-REACTIVE COLORS!
   */
  function drawSnakeGame() {
    if (!particleSystem || !particleSystem.ctx) return;
    if (transitionPhase !== 'playing') return;
    
    const ctx = particleSystem.ctx;
    
    // Get audio data for visualization
    const audioData = getAudioVisualizationData();
    
    // Calculate audio-reactive colors
    // Base green color shifts based on audio
    const bassIntensity = Math.floor(audioData.bass * 100); // 0-100
    const midIntensity = Math.floor(audioData.mid * 80); // 0-80
    const trebleGlow = 15 + (audioData.treble * 25); // 15-40 glow
    
    // Draw snake with audio-reactive glow effect
    snake.forEach((segment, index) => {
      const x = segment.x * gridSize;
      const y = segment.y * gridSize;
      
      // Audio-reactive glow - pulses with music
      ctx.shadowBlur = trebleGlow;
      ctx.shadowColor = `rgba(94, ${Math.min(232 + midIntensity, 255)}, 125, ${Math.min(0.6 + audioData.average * 0.4, 1)})`;
      
      // Head is brighter and more reactive
      if (index === 0) {
        // Snake head color reacts to bass (more cyan on bass hits)
        const r = Math.min(94 + bassIntensity, 255);
        const g = 232;
        const b = Math.min(125 + Math.floor(audioData.mid * 50), 255);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
      } else {
        // Body reacts more subtly
        const opacity = 0.6 + (0.4 * (1 - index / snake.length)) + (audioData.average * 0.1);
        const g = Math.min(232 + Math.floor(midIntensity * 0.5), 255);
        ctx.fillStyle = `rgba(94, ${g}, 125, ${Math.min(opacity, 1)})`;
      }
      
      ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
    });
    
    // Draw food with audio-reactive pulsing glow
    if (food) {
      const x = food.x * gridSize;
      const y = food.y * gridSize;
      
      // Food pulses with treble
      const foodGlow = 20 + (audioData.treble * 30); // 20-50 glow
      ctx.shadowBlur = foodGlow;
      ctx.shadowColor = `rgba(109, 217, 232, ${Math.min(0.7 + audioData.average * 0.3, 1)})`;
      
      // Food color slightly reactive
      // Base cyan value is 217, with +38 scaling to reach max of 255 at full audio
      const cyan = Math.min(Math.floor(217 + audioData.mid * 38), 255); // 217-255 clamped
      ctx.fillStyle = `rgba(109, ${cyan}, 232, 1)`;
      
      // Draw as circle
      ctx.beginPath();
      ctx.arc(x + gridSize / 2, y + gridSize / 2, (gridSize / 2) - 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }

  /**
   * Get particle target attraction
   * This function is called by script.js particle system
   */
  window.getSnakeParticleTarget = function(particle) {
    if (!isSnakeActive || particleTargets.length === 0) {
      return null;
    }
    
    // Find closest target
    let closestTarget = null;
    let minDist = Infinity;
    
    particleTargets.forEach(target => {
      const dx = target.x - particle.x;
      const dy = target.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < minDist) {
        minDist = dist;
        closestTarget = target;
      }
    });
    
    return closestTarget;
  };

  /**
   * Get current game phase for particle visibility
   * This function is called by script.js particle system
   */
  window.getSnakeGamePhase = function() {
    return transitionPhase;
  };

  /**
   * Initialize Easter egg listener
   */
  function init() {
    // Only activate on home page - check for both home.html and pages with header image
    const isHomePage = window.location.pathname.includes('home.html') || 
                       document.querySelector('.home-header-image');
    
    if (!isHomePage) {
      return;
    }
    
    // Initialize cube easter egg
    document.addEventListener('keypress', handleKeyPress);
    
    // Initialize snake easter egg - click on header image
    const headerImage = document.querySelector('.home-header-image');
    if (headerImage) {
      headerImage.style.cursor = 'pointer';
      headerImage.addEventListener('click', activateSnake);
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
