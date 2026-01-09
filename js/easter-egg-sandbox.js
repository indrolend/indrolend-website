/**
 * Easter Egg Sandbox Mode
 * Activates when user types "indrolend" sequentially
 * Transforms all buttons into 3D physics-enabled cubes
 * Desktop only - disabled on mobile devices
 */

(function() {
  'use strict';

  // Check if device is mobile
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

  // Shake detection for mobile
  let lastShakeTime = 0;
  const SHAKE_THRESHOLD = 15; // Sensitivity threshold
  const SHAKE_DEBOUNCE_TIME = 200; // ms between shake detections
  const SHAKE_RESET_TIMEOUT = 2000; // ms to reset shake count
  const SHAKE_COUNT_REQUIRED = 3; // Number of shakes to activate
  let shakeCount = 0;
  let shakeResetTimer = null;
  
  // Store previous acceleration for delta calculation (iOS fix)
  let lastAcceleration = null; // Will be initialized on first shake event

  // Initialize easter egg listener
  function initEasterEgg() {
    if (isMobileDevice()) {
      // Enable shake gesture on mobile
      initShakeDetection();
    } else {
      // Enable keyboard trigger on desktop
      document.addEventListener('keypress', handleKeyPress);
    }
  }

  // Handle keypress for easter egg trigger
  function handleKeyPress(e) {
    if (isActive) return; // Already active

    const key = e.key.toLowerCase();
    
    // Check if this key matches the next expected character
    if (key === TRIGGER_WORD[typedSequence.length]) {
      typedSequence += key;
      
      // Check if we've completed the trigger word
      if (typedSequence === TRIGGER_WORD) {
        activateSandboxMode();
        typedSequence = ''; // Reset sequence
      }
    } else {
      // Wrong key pressed, reset the sequence
      typedSequence = '';
      
      // Check if the pressed key matches the first character (restart sequence)
      if (key === TRIGGER_WORD[0]) {
        typedSequence = key;
      }
    }
  }

  // Initialize shake detection for mobile devices
  function initShakeDetection() {
    if (typeof DeviceMotionEvent === 'undefined') {
      return; // Device doesn't support motion events
    }

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS requires user interaction before requesting permission
      // We'll add a one-time tap listener
      const requestPermission = () => {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', handleShake);
            }
          })
          .catch(console.error);
        document.removeEventListener('touchstart', requestPermission);
      };
      document.addEventListener('touchstart', requestPermission, { once: true });
    } else {
      // Non-iOS devices
      window.addEventListener('devicemotion', handleShake);
    }
  }

  // Handle shake gesture
  function handleShake(event) {
    if (isActive) return; // Already active

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    
    // Initialize lastAcceleration on first event to avoid false positives
    if (lastAcceleration === null) {
      lastAcceleration = { x, y, z };
      return; // Skip first event, just set baseline
    }
    
    // Calculate the delta from the last acceleration (important for iOS)
    // This removes the constant gravity component
    const deltaX = Math.abs(x - lastAcceleration.x);
    const deltaY = Math.abs(y - lastAcceleration.y);
    const deltaZ = Math.abs(z - lastAcceleration.z);
    
    // Update last acceleration
    lastAcceleration = { x, y, z };
    
    // Calculate change magnitude (this detects motion, not static gravity)
    const deltaSum = deltaX + deltaY + deltaZ;

    const currentTime = Date.now();
    
    // Detect significant shake (using delta instead of absolute magnitude)
    // Uses SHAKE_THRESHOLD constant for delta sum detection
    if (deltaSum > SHAKE_THRESHOLD) {
      if (currentTime - lastShakeTime > SHAKE_DEBOUNCE_TIME) {
        shakeCount++;
        lastShakeTime = currentTime;

        // Reset shake count after timeout
        clearTimeout(shakeResetTimer);
        shakeResetTimer = setTimeout(() => {
          shakeCount = 0;
        }, SHAKE_RESET_TIMEOUT);

        // Activate after required number of shakes
        if (shakeCount >= SHAKE_COUNT_REQUIRED) {
          shakeCount = 0;
          activateSandboxMode();
        }
      }
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
      
      // Use the smaller dimension to create a proper cube
      const cubeSize = Math.min(rect.width, rect.height);
      const halfCube = cubeSize / 2;
      
      // Create cube wrapper with square dimensions
      const cubeWrapper = document.createElement('div');
      cubeWrapper.className = 'cube-wrapper';
      cubeWrapper.style.position = 'fixed';
      cubeWrapper.style.left = rect.left + 'px';
      cubeWrapper.style.top = rect.top + 'px';
      cubeWrapper.style.width = cubeSize + 'px';
      cubeWrapper.style.height = cubeSize + 'px';
      cubeWrapper.style.zIndex = '1000';

      // Create 3D cube structure
      const cube = document.createElement('div');
      cube.className = 'cube';
      
      // Set the CSS variable for proper cube face positioning
      cube.style.setProperty('--cube-half-size', halfCube + 'px');
      
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
