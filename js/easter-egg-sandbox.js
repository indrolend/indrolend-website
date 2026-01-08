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

  // Initialize Cannon.js physics world
  function initPhysicsWorld() {
    if (typeof CANNON === 'undefined') {
      console.error('Cannon.js not loaded');
      return;
    }

    // Create physics world with gravity
    physicsWorld = new CANNON.World();
    physicsWorld.gravity.set(0, -9.82, 0); // Gravity pointing down
    physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    physicsWorld.solver.iterations = 10;

    // Create invisible ground plane (below viewport)
    const groundBody = new CANNON.Body({
      mass: 0, // Static
      shape: new CANNON.Plane()
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.position.set(0, -window.innerHeight, 0);
    physicsWorld.addBody(groundBody);

    // Create invisible walls (boundaries)
    // Left wall
    const leftWall = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane()
    });
    leftWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    leftWall.position.set(-50, 0, 0);
    physicsWorld.addBody(leftWall);

    // Right wall
    const rightWall = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane()
    });
    rightWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    rightWall.position.set(window.innerWidth + 50, 0, 0);
    physicsWorld.addBody(rightWall);
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

      // Create physics body for cube
      const cubeSize = Math.min(rect.width, rect.height) / 2;
      const shape = new CANNON.Box(new CANNON.Vec3(cubeSize, cubeSize, cubeSize));
      const body = new CANNON.Body({
        mass: 1,
        shape: shape,
        position: new CANNON.Vec3(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          0
        ),
        linearDamping: 0.3,
        angularDamping: 0.3
      });
      physicsWorld.addBody(body);

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
      cubeObj.body.type = CANNON.Body.KINEMATIC;
      cubeObj.body.velocity.set(0, 0, 0);
      cubeObj.body.angularVelocity.set(0, 0, 0);
      
      element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!cubeObj.isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Update position
      const rect = element.getBoundingClientRect();
      cubeObj.body.position.x = e.clientX;
      cubeObj.body.position.y = e.clientY;

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
      cubeObj.body.type = CANNON.Body.DYNAMIC;
      
      // Apply a small velocity to make it "drop"
      cubeObj.body.velocity.y = -2;
    });

    element.style.cursor = 'grab';
  }

  // Physics animation loop
  function startPhysicsLoop() {
    const timeStep = 1 / 60; // 60 fps

    function animate() {
      if (!isActive) return;

      // Step physics simulation
      physicsWorld.step(timeStep);

      // Update cube positions and rotations
      cubeObjects.forEach((cubeObj) => {
        const pos = cubeObj.body.position;
        const quat = cubeObj.body.quaternion;

        // Update position
        cubeObj.element.style.left = (pos.x - cubeObj.element.offsetWidth / 2) + 'px';
        cubeObj.element.style.top = (pos.y - cubeObj.element.offsetHeight / 2) + 'px';

        // Update rotation
        if (cubeObj.isDragging) {
          // Use manual rotation while dragging
          cubeObj.cube.style.transform = `rotateX(${cubeObj.rotationX}deg) rotateY(${cubeObj.rotationY}deg)`;
        } else {
          // Use physics rotation
          const euler = new CANNON.Vec3();
          quat.toEuler(euler);
          cubeObj.cube.style.transform = `rotateX(${euler.x * 180 / Math.PI}deg) rotateY(${euler.y * 180 / Math.PI}deg) rotateZ(${euler.z * 180 / Math.PI}deg)`;
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
      if (cubeObj.element && cubeObj.element.parentNode) {
        cubeObj.element.parentNode.removeChild(cubeObj.element);
      }
      // Restore original button
      cubeObj.originalButton.style.opacity = '';
      cubeObj.originalButton.style.pointerEvents = '';
    });

    // Clear physics world
    if (physicsWorld) {
      physicsWorld.bodies.forEach(body => {
        physicsWorld.removeBody(body);
      });
      physicsWorld = null;
    }

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
