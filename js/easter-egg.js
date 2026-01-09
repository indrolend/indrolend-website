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
    // Only activate on home page
    if (!window.location.pathname.includes('home.html')) {
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

  // Snake game state
  let snakeCanvas = null;
  let snakeCtx = null;
  let snake = [];
  let food = null;
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let gridSize = 20;
  let snakeSpeed = 150; // ms per move
  let lastMoveTime = 0;
  let gameScore = 0;
  let closeButton = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let particlesBackup = null;

  /**
   * Activate snake game
   */
  function activateSnake() {
    if (isSnakeActive || isCubeActive) return;
    
    isSnakeActive = true;
    
    // Backup and hide particles canvas
    const particlesBg = document.getElementById('particles-bg');
    if (particlesBg) {
      particlesBackup = particlesBg;
      particlesBg.style.display = 'none';
    }
    
    // Create snake canvas
    createSnakeCanvas();
    
    // Initialize snake game
    initSnakeGame();
    
    // Start animation
    animateSnake();
  }

  /**
   * Deactivate snake game
   */
  function deactivateSnake() {
    if (!isSnakeActive) return;
    
    isSnakeActive = false;
    
    // Stop animation
    if (snakeAnimationFrame) {
      cancelAnimationFrame(snakeAnimationFrame);
      snakeAnimationFrame = null;
    }
    
    // Remove canvas and close button
    if (snakeCanvas && snakeCanvas.parentNode) {
      snakeCanvas.parentNode.removeChild(snakeCanvas);
    }
    if (closeButton && closeButton.parentNode) {
      closeButton.parentNode.removeChild(closeButton);
    }
    
    snakeCanvas = null;
    snakeCtx = null;
    closeButton = null;
    
    // Restore particles canvas
    if (particlesBackup) {
      particlesBackup.style.display = 'block';
      particlesBackup = null;
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', handleSnakeKeyDown);
    if (snakeCanvas) {
      snakeCanvas.removeEventListener('touchstart', handleSnakeTouchStart);
      snakeCanvas.removeEventListener('touchend', handleSnakeTouchEnd);
    }
  }

  /**
   * Create canvas for snake game
   */
  function createSnakeCanvas() {
    snakeCanvas = document.createElement('canvas');
    snakeCanvas.id = 'snake-game-canvas';
    snakeCanvas.style.position = 'fixed';
    snakeCanvas.style.top = '0';
    snakeCanvas.style.left = '0';
    snakeCanvas.style.width = '100%';
    snakeCanvas.style.height = '100%';
    snakeCanvas.style.zIndex = '9999';
    snakeCanvas.style.backgroundColor = 'rgba(2, 6, 18, 1)';
    snakeCanvas.width = window.innerWidth;
    snakeCanvas.height = window.innerHeight;
    
    document.body.appendChild(snakeCanvas);
    snakeCtx = snakeCanvas.getContext('2d');
    
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
    
    // Add input handlers
    document.addEventListener('keydown', handleSnakeKeyDown);
    snakeCanvas.addEventListener('touchstart', handleSnakeTouchStart, { passive: false });
    snakeCanvas.addEventListener('touchend', handleSnakeTouchEnd, { passive: false });
  }

  /**
   * Initialize snake game
   */
  function initSnakeGame() {
    // Calculate grid size based on screen size
    const minDimension = Math.min(snakeCanvas.width, snakeCanvas.height);
    gridSize = Math.floor(minDimension / 25);
    if (gridSize < 15) gridSize = 15;
    if (gridSize > 30) gridSize = 30;
    
    // Initialize snake in the center
    const centerX = Math.floor(snakeCanvas.width / gridSize / 2);
    const centerY = Math.floor(snakeCanvas.height / gridSize / 2);
    
    snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY }
    ];
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    gameScore = 0;
    lastMoveTime = performance.now();
    
    // Place initial food
    placeFood();
  }

  /**
   * Place food at random location
   */
  function placeFood() {
    const maxX = Math.floor(snakeCanvas.width / gridSize);
    const maxY = Math.floor(snakeCanvas.height / gridSize);
    
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
  }

  /**
   * Handle keyboard input for snake
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
   * Handle touch start for mobile controls
   */
  function handleSnakeTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  /**
   * Handle touch end for mobile controls
   */
  function handleSnakeTouchEnd(e) {
    e.preventDefault();
    if (!isSnakeActive) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const minSwipeDistance = 30;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && direction.x === 0) {
          nextDirection = { x: 1, y: 0 };
        } else if (deltaX < 0 && direction.x === 0) {
          nextDirection = { x: -1, y: 0 };
        }
      }
    } else {
      // Vertical swipe
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
   * Update snake game state
   */
  function updateSnake(currentTime) {
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
    const maxX = Math.floor(snakeCanvas.width / gridSize);
    const maxY = Math.floor(snakeCanvas.height / gridSize);
    
    if (newHead.x < 0 || newHead.x >= maxX || 
        newHead.y < 0 || newHead.y >= maxY) {
      // Game over
      gameOver();
      return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      // Game over
      gameOver();
      return;
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      gameScore++;
      placeFood();
      
      // Increase speed slightly
      if (snakeSpeed > 80) {
        snakeSpeed -= 2;
      }
    } else {
      // Remove tail if no food eaten
      snake.pop();
    }
  }

  /**
   * Draw snake game
   */
  function drawSnake() {
    // Clear canvas
    snakeCtx.fillStyle = 'rgba(2, 6, 18, 1)';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Draw snake with glow effect
    snake.forEach((segment, index) => {
      const x = segment.x * gridSize;
      const y = segment.y * gridSize;
      
      // Draw glow
      snakeCtx.shadowBlur = 15;
      snakeCtx.shadowColor = 'rgba(94, 232, 125, 0.8)';
      
      // Head is brighter
      if (index === 0) {
        snakeCtx.fillStyle = 'rgba(94, 232, 125, 1)';
      } else {
        const opacity = 0.6 + (0.4 * (1 - index / snake.length));
        snakeCtx.fillStyle = `rgba(94, 232, 125, ${opacity})`;
      }
      
      snakeCtx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
    });
    
    // Draw food with glow effect
    if (food) {
      const x = food.x * gridSize;
      const y = food.y * gridSize;
      
      snakeCtx.shadowBlur = 20;
      snakeCtx.shadowColor = 'rgba(109, 217, 232, 0.9)';
      snakeCtx.fillStyle = 'rgba(109, 217, 232, 1)';
      snakeCtx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
    }
    
    // Reset shadow
    snakeCtx.shadowBlur = 0;
    
    // Draw score
    snakeCtx.fillStyle = 'rgba(109, 217, 232, 0.8)';
    snakeCtx.font = '20px "SF Mono", Menlo, Monaco, Consolas, monospace';
    snakeCtx.textAlign = 'right';
    snakeCtx.fillText(`Score: ${gameScore}`, snakeCanvas.width - 20, 40);
    
    // Draw controls hint
    snakeCtx.font = '14px "SF Mono", Menlo, Monaco, Consolas, monospace';
    snakeCtx.textAlign = 'center';
    snakeCtx.fillStyle = 'rgba(109, 217, 232, 0.5)';
    snakeCtx.fillText('Arrow keys or WASD to move', snakeCanvas.width / 2, snakeCanvas.height - 30);
    snakeCtx.fillText('Swipe to move on mobile', snakeCanvas.width / 2, snakeCanvas.height - 10);
  }

  /**
   * Game over
   */
  function gameOver() {
    // Draw game over message
    snakeCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    snakeCtx.fillStyle = 'rgba(255, 140, 140, 0.9)';
    snakeCtx.font = 'bold 48px system-ui, sans-serif';
    snakeCtx.textAlign = 'center';
    snakeCtx.textBaseline = 'middle';
    snakeCtx.fillText('Game Over', snakeCanvas.width / 2, snakeCanvas.height / 2 - 40);
    
    snakeCtx.fillStyle = 'rgba(109, 217, 232, 0.8)';
    snakeCtx.font = '24px system-ui, sans-serif';
    snakeCtx.fillText(`Score: ${gameScore}`, snakeCanvas.width / 2, snakeCanvas.height / 2 + 20);
    
    // Return to normal after delay
    setTimeout(() => {
      deactivateSnake();
    }, 2000);
  }

  /**
   * Animation loop for snake game
   */
  function animateSnake() {
    if (!isSnakeActive) return;
    
    const currentTime = performance.now();
    updateSnake(currentTime);
    drawSnake();
    
    snakeAnimationFrame = requestAnimationFrame(animateSnake);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
