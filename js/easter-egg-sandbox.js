/**
 * Easter Egg Sandbox Mode
 * Activates when user types "indrolend" sequentially
 * Transforms all buttons into 3D physics-enabled cubes
 * Desktop only - disabled on mobile devices
 */

(function() {
  'use strict';

  // Check if device is mobile (disable easter egg on mobile)
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth <= 768;
  }

  // Easter egg state
  const TRIGGER_WORD = 'indrolend';
  let typedSequence = '';
  let isActive = false;
  let physicsWorld = null;
  let cubeObjects = [];
  let animationFrameId = null;

  // Initialize easter egg listener (desktop only)
  function initEasterEgg() {
    if (isMobileDevice()) {
      return; // Don't activate on mobile
    }

    document.addEventListener('keypress', handleKeyPress);
  }

  // Handle keypress for easter egg trigger
  function handleKeyPress(e) {
    if (isActive) return; // Already active

    // Append the pressed key to sequence
    typedSequence += e.key.toLowerCase();

    // Keep only the last N characters (length of trigger word)
    if (typedSequence.length > TRIGGER_WORD.length) {
      typedSequence = typedSequence.slice(-TRIGGER_WORD.length);
    }

    // Check if trigger word is typed
    if (typedSequence === TRIGGER_WORD) {
      activateSandboxMode();
      typedSequence = ''; // Reset sequence
    }
  }

  // Activate the sandbox mode
  function activateSandboxMode() {
    if (isActive) return;
    isActive = true;

    // Initialize physics world
    initPhysicsWorld();

    // Transform all buttons into 3D cubes
    transformButtonsToCubes();

    // Show reset button
    showResetButton();

    // Start physics animation loop
    startPhysicsLoop();
  }

  // Initialize simple physics world (custom lightweight implementation)
  function initPhysicsWorld() {
    // Create simple physics world object
    physicsWorld = {
      gravity: 0.5, // pixels per frame squared
      bounds: {
        minX: 0,
        maxX: window.innerWidth,
        minY: 0,
        maxY: window.innerHeight
      },
      damping: 0.98, // velocity damping
      bounceFactor: 0.6
    };
  }

  // Transform buttons into 3D cubes
  function transformButtonsToCubes() {
    const buttons = document.querySelectorAll('.app-card');
    
    buttons.forEach((button, index) => {
      // Get button position and dimensions
      const rect = button.getBoundingClientRect();
      
      // Create cube wrapper
      const cubeWrapper = document.createElement('div');
      cubeWrapper.className = 'cube-wrapper';
      cubeWrapper.style.position = 'fixed';
      cubeWrapper.style.left = rect.left + 'px';
      cubeWrapper.style.top = rect.top + 'px';
      cubeWrapper.style.width = rect.width + 'px';
      cubeWrapper.style.height = rect.height + 'px';
      cubeWrapper.style.zIndex = '1000';

      // Create 3D cube structure
      const cube = document.createElement('div');
      cube.className = 'cube';
      
      // Clone button content for front face
      const frontFace = document.createElement('div');
      frontFace.className = 'cube-face cube-face-front';
      frontFace.innerHTML = button.innerHTML;
      
      // Create other faces
      const backFace = document.createElement('div');
      backFace.className = 'cube-face cube-face-back';
      backFace.style.background = getComputedStyle(button).background;
      
      const leftFace = document.createElement('div');
      leftFace.className = 'cube-face cube-face-left';
      leftFace.style.background = getComputedStyle(button).background;
      
      const rightFace = document.createElement('div');
      rightFace.className = 'cube-face cube-face-right';
      rightFace.style.background = getComputedStyle(button).background;
      
      const topFace = document.createElement('div');
      topFace.className = 'cube-face cube-face-top';
      topFace.style.background = getComputedStyle(button).background;
      
      const bottomFace = document.createElement('div');
      bottomFace.className = 'cube-face cube-face-bottom';
      bottomFace.style.background = getComputedStyle(button).background;

      // Assemble cube
      cube.appendChild(frontFace);
      cube.appendChild(backFace);
      cube.appendChild(leftFace);
      cube.appendChild(rightFace);
      cube.appendChild(topFace);
      cube.appendChild(bottomFace);
      
      cubeWrapper.appendChild(cube);
      document.body.appendChild(cubeWrapper);

      // Hide original button
      button.style.opacity = '0';
      button.style.pointerEvents = 'none';

      // Create simple physics body for cube
      const cubeSize = Math.min(rect.width, rect.height);
      const body = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        z: 0,
        vx: 0, // velocity x
        vy: 0, // velocity y
        vz: 0, // velocity z
        ax: 0, // angular velocity x
        ay: 0, // angular velocity y
        az: 0, // angular velocity z
        rx: 0, // rotation x
        ry: 0, // rotation y
        rz: 0, // rotation z
        mass: 1,
        size: cubeSize,
        isKinematic: false
      };

      // Store cube object
      cubeObjects.push({
        element: cubeWrapper,
        cube: cube,
        body: body,
        originalButton: button,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        rotationX: 0,
        rotationY: 0
      });

      // Add drag interaction
      addDragInteraction(cubeObjects[cubeObjects.length - 1]);
    });
  }

  // Add drag and rotation interaction to cube
  function addDragInteraction(cubeObj) {
    const element = cubeObj.element;
    let startX, startY;

    element.addEventListener('mousedown', (e) => {
      e.preventDefault();
      cubeObj.isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      // Make body kinematic (not affected by physics) while dragging
      cubeObj.body.isKinematic = true;
      cubeObj.body.vx = 0;
      cubeObj.body.vy = 0;
      cubeObj.body.ax = 0;
      cubeObj.body.ay = 0;
      cubeObj.body.az = 0;
      
      element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!cubeObj.isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Update position
      cubeObj.body.x = e.clientX;
      cubeObj.body.y = e.clientY;

      // Update rotation based on drag movement
      cubeObj.rotationY += dx * 0.5;
      cubeObj.rotationX -= dy * 0.5;

      startX = e.clientX;
      startY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
      if (!cubeObj.isDragging) return;
      
      cubeObj.isDragging = false;
      element.style.cursor = 'grab';
      
      // Make body dynamic again
      cubeObj.body.isKinematic = false;
      
      // Apply a small velocity to make it "drop"
      cubeObj.body.vy = 2; // Downward velocity
    });

    element.style.cursor = 'grab';
  }

  // Physics animation loop
  function startPhysicsLoop() {
    function animate() {
      if (!isActive) return;

      // Apply simple physics to each cube
      cubeObjects.forEach((cubeObj) => {
        if (cubeObj.body.isKinematic) return; // Skip if being dragged

        const body = cubeObj.body;
        const bounds = physicsWorld.bounds;

        // Apply gravity
        body.vy += physicsWorld.gravity;

        // Apply damping
        body.vx *= physicsWorld.damping;
        body.vy *= physicsWorld.damping;
        body.ax *= physicsWorld.damping;
        body.ay *= physicsWorld.damping;
        body.az *= physicsWorld.damping;

        // Update position
        body.x += body.vx;
        body.y += body.vy;

        // Update rotation
        body.rx += body.ax;
        body.ry += body.ay;
        body.rz += body.az;

        // Collision detection with boundaries
        const halfSize = body.size / 2;

        // Bottom boundary
        if (body.y + halfSize > bounds.maxY) {
          body.y = bounds.maxY - halfSize;
          body.vy *= -physicsWorld.bounceFactor;
          body.ax = (Math.random() - 0.5) * 2; // Add random spin
        }

        // Top boundary
        if (body.y - halfSize < bounds.minY) {
          body.y = bounds.minY + halfSize;
          body.vy *= -physicsWorld.bounceFactor;
        }

        // Left boundary
        if (body.x - halfSize < bounds.minX) {
          body.x = bounds.minX + halfSize;
          body.vx *= -physicsWorld.bounceFactor;
          body.ay = (Math.random() - 0.5) * 2; // Add random spin
        }

        // Right boundary
        if (body.x + halfSize > bounds.maxX) {
          body.x = bounds.maxX - halfSize;
          body.vx *= -physicsWorld.bounceFactor;
          body.ay = (Math.random() - 0.5) * 2; // Add random spin
        }

        // Collision detection between cubes
        // Note: O(n²) complexity is acceptable here since we only have ~8 buttons
        cubeObjects.forEach((otherCubeObj) => {
          if (cubeObj === otherCubeObj) return;
          const otherBody = otherCubeObj.body;

          const dx = body.x - otherBody.x;
          const dy = body.y - otherBody.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (body.size + otherBody.size) / 2;

          if (distance < minDistance) {
            // Collision detected - simple elastic collision
            const angle = Math.atan2(dy, dx);
            const targetX = otherBody.x + Math.cos(angle) * minDistance;
            const targetY = otherBody.y + Math.sin(angle) * minDistance;

            // Separate cubes
            body.x = targetX;
            body.y = targetY;

            // Bounce velocities
            const tempVx = body.vx;
            const tempVy = body.vy;
            body.vx = otherBody.vx * physicsWorld.bounceFactor;
            body.vy = otherBody.vy * physicsWorld.bounceFactor;
            otherBody.vx = tempVx * physicsWorld.bounceFactor;
            otherBody.vy = tempVy * physicsWorld.bounceFactor;

            // Add spin
            body.az = (Math.random() - 0.5) * 5;
            otherBody.az = (Math.random() - 0.5) * 5;
          }
        });
      });

      // Update cube visual positions and rotations
      cubeObjects.forEach((cubeObj) => {
        const body = cubeObj.body;

        // Update position
        cubeObj.element.style.left = (body.x - cubeObj.element.offsetWidth / 2) + 'px';
        cubeObj.element.style.top = (body.y - cubeObj.element.offsetHeight / 2) + 'px';

        // Update rotation
        if (cubeObj.isDragging) {
          // Use manual rotation while dragging
          cubeObj.cube.style.transform = `rotateX(${cubeObj.rotationX}deg) rotateY(${cubeObj.rotationY}deg)`;
        } else {
          // Use physics rotation
          cubeObj.cube.style.transform = `rotateX(${body.rx}deg) rotateY(${body.ry}deg) rotateZ(${body.rz}deg)`;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
  }

  // Show reset button
  function showResetButton() {
    const resetBtn = document.createElement('button');
    resetBtn.id = 'sandbox-reset-btn';
    resetBtn.className = 'sandbox-reset-button';
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = resetSandboxMode;
    document.body.appendChild(resetBtn);
  }

  // Reset sandbox mode
  function resetSandboxMode() {
    isActive = false;

    // Stop animation loop
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Remove all cube elements
    cubeObjects.forEach((cubeObj) => {
      if (cubeObj.element) {
        cubeObj.element.remove();
      }
      // Restore original button
      cubeObj.originalButton.style.opacity = '';
      cubeObj.originalButton.style.pointerEvents = '';
    });

    // Clear physics world
    physicsWorld = null;

    // Remove reset button
    const resetBtn = document.getElementById('sandbox-reset-btn');
    if (resetBtn) {
      resetBtn.remove();
    }

    // Clear state
    cubeObjects = [];
    typedSequence = '';
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEasterEgg);
  } else {
    initEasterEgg();
  }
})();
