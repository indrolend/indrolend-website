// Lightweight Particle Cluster System for Social Media Buttons
// Optimized for performance on low-end devices

document.addEventListener("DOMContentLoaded", () => {
  // Define color schemes for each platform based on their brand colors
  const platformColors = {
    tiktok: ["#00F2EA", "#FF0050", "#000000"], // Teal, Pink, Black
    instagram: ["#C13584", "#E1306C", "#F56040", "#FCAF45", "#FFDC80"], // Instagram gradient colors
    spotify: ["#1DB954", "#191414"], // Green, Black
    applemusic: ["#FC3C44", "#FA243C", "#FFFFFF"], // Red, White
    youtube: ["#FF0000", "#282828", "#FFFFFF"], // Red, Dark Gray, White
    bandcamp: ["#629AA9", "#1DA0C3", "#FFFFFF"], // Blue tones
    gallery: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"], // Rainbow explosion colors
    galleryLocked: ["#888888"] // Single gray particle when locked
  };

  // Particle system configuration
  const config = {
    particleCount: 25, // Low count for performance
    particleSize: { min: 2, max: 5 },
    speed: 0.3,
    connectionDistance: 60,
    mouseRepelDistance: 80,
    mouseRepelForce: 0.5,
    springBackForce: 0.02, // Force to pull particles back to original position
    springBackThreshold: 1, // Minimum distance before applying spring force
    damping: 0.98 // Velocity damping for smoother motion
  };

  // Initialize particle clusters for each platform button
  function initParticleCluster(canvas, platformKey) {
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    
    // Special handling for gallery button - check if unlocked
    let colors;
    let particleCount = config.particleCount;
    
    if (platformKey === 'gallery') {
      const isUnlocked = localStorage.getItem("galleryUnlocked") === "true";
      if (isUnlocked) {
        colors = platformColors.gallery; // Rainbow explosion particles
      } else {
        colors = platformColors.galleryLocked; // Single gray particle
        particleCount = 1; // Only one particle when locked
      }
    } else {
      colors = platformColors[platformKey] || platformColors.gallery;
    }
    
    // Typed arrays for better performance
    const particleX = new Float32Array(particleCount);
    const particleY = new Float32Array(particleCount);
    const particleVX = new Float32Array(particleCount);
    const particleVY = new Float32Array(particleCount);
    const particleRadius = new Float32Array(particleCount);
    const particleColors = new Array(particleCount);
    const particleOriginalX = new Float32Array(particleCount);
    const particleOriginalY = new Float32Array(particleCount);
    
    // Precompute constants
    const mouseRepelDistanceSq = config.mouseRepelDistance * config.mouseRepelDistance;
    const springBackThresholdSq = config.springBackThreshold * config.springBackThreshold;
    const maxSpeedSq = (config.speed * 3) * (config.speed * 3);
    
    const mouse = { x: null, y: null, pendingX: null, pendingY: null, active: false };
    let mouseUpdateScheduled = false;
    let animationId = null;
    let isVisible = false;

    // Set canvas size to match container
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Create a particle at index i
    function createParticle(i) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(canvas.width, canvas.height) * 0.3;
      const centerX = canvas.width * 0.5;
      const centerY = canvas.height * 0.5;
      
      particleX[i] = centerX + Math.cos(angle) * distance;
      particleY[i] = centerY + Math.sin(angle) * distance;
      particleVX[i] = (Math.random() - 0.5) * config.speed;
      particleVY[i] = (Math.random() - 0.5) * config.speed;
      particleRadius[i] = Math.random() * (config.particleSize.max - config.particleSize.min) + config.particleSize.min;
      particleColors[i] = colors[Math.floor(Math.random() * colors.length)];
      particleOriginalX[i] = particleX[i];
      particleOriginalY[i] = particleY[i];
    }

    // Initialize particles in a cluster
    function initParticles() {
      for (let i = 0; i < particleCount; i++) {
        createParticle(i);
      }
    }

    // Update particle positions
    function updateParticles() {
      // Update mouse from pending (RAF throttled)
      if (mouseUpdateScheduled) {
        mouse.x = mouse.pendingX;
        mouse.y = mouse.pendingY;
        mouseUpdateScheduled = false;
      }

      const mouseX = mouse.x;
      const mouseY = mouse.y;
      const mouseActive = mouse.active;

      for (let i = 0; i < particleCount; i++) {
        // Apply velocity
        particleX[i] += particleVX[i];
        particleY[i] += particleVY[i];

        // Mouse repulsion effect - use squared distance
        if (mouseActive && mouseX !== null && mouseY !== null) {
          const dx = particleX[i] - mouseX;
          const dy = particleY[i] - mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseRepelDistanceSq) {
            const dist = Math.sqrt(distSq);
            const force = (config.mouseRepelDistance - dist) / config.mouseRepelDistance;
            particleVX[i] += (dx / dist) * force * config.mouseRepelForce;
            particleVY[i] += (dy / dist) * force * config.mouseRepelForce;
          }
        }

        // Spring back to original position (gravitational pull)
        const dxToOriginal = particleOriginalX[i] - particleX[i];
        const dyToOriginal = particleOriginalY[i] - particleY[i];
        const distToOriginalSq = dxToOriginal * dxToOriginal + dyToOriginal * dyToOriginal;
        
        if (distToOriginalSq > springBackThresholdSq) {
          // Apply spring force proportional to distance from original position
          particleVX[i] += dxToOriginal * config.springBackForce;
          particleVY[i] += dyToOriginal * config.springBackForce;
        }

        // Apply damping to velocity for smoother motion
        particleVX[i] *= config.damping;
        particleVY[i] *= config.damping;

        // Limit velocity using squared speed
        const speedSq = particleVX[i] * particleVX[i] + particleVY[i] * particleVY[i];
        if (speedSq > maxSpeedSq) {
          const speed = Math.sqrt(speedSq);
          const maxSpeed = config.speed * 3;
          particleVX[i] = (particleVX[i] / speed) * maxSpeed;
          particleVY[i] = (particleVY[i] / speed) * maxSpeed;
        }
      }
    }

    // Draw particles and connections
    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles only (no connection lines for free-space feel)
      for (let i = 0; i < particleCount; i++) {
        ctx.fillStyle = particleColors[i];
        ctx.beginPath();
        ctx.arc(particleX[i], particleY[i], particleRadius[i], 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Animation loop
    function animate() {
      if (!isVisible) return;
      
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    }

    // Cache rect for mouse position calculations
    let cachedRect = null;

    // Mouse move handler - throttled to RAF
    function handleMouseMove(e) {
      if (!cachedRect) cachedRect = canvas.getBoundingClientRect();
      mouse.pendingX = e.clientX - cachedRect.left;
      mouse.pendingY = e.clientY - cachedRect.top;
      if (!mouseUpdateScheduled) {
        mouseUpdateScheduled = true;
      }
    }

    // Touch move handler - allows page scrolling by not preventing default
    function handleTouchMove(e) {
      if (!cachedRect) cachedRect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.pendingX = touch.clientX - cachedRect.left;
      mouse.pendingY = touch.clientY - cachedRect.top;
      if (!mouseUpdateScheduled) {
        mouseUpdateScheduled = true;
      }
    }

    // Mouse enter handler
    function handleMouseEnter() {
      mouse.active = true;
      cachedRect = canvas.getBoundingClientRect();
    }

    // Mouse leave handler
    function handleMouseLeave() {
      mouse.active = false;
      mouse.x = null;
      mouse.y = null;
      mouse.pendingX = null;
      mouse.pendingY = null;
      cachedRect = null;
    }

    // Intersection Observer to start/stop animation when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!animationId) animate();
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    }, { threshold: 0.1 });

    // Initialize
    resizeCanvas();
    initParticles();
    observer.observe(canvas);

    // Event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleMouseEnter, { passive: true });
    canvas.addEventListener("touchend", handleMouseLeave, { passive: true });

    // Resize handler with debounce
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        initParticles();
      }, 250);
    });

    // Start animation if visible
    if (isVisible) animate();

    // Return cleanup function
    return () => {
      observer.disconnect();
      if (animationId) cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleMouseEnter);
      canvas.removeEventListener("touchend", handleMouseLeave);
    };
  }

  // Find all particle cluster canvases and initialize them
  const clusterCanvases = document.querySelectorAll("[data-particle-cluster]");
  clusterCanvases.forEach(canvas => {
    const platformKey = canvas.getAttribute("data-particle-cluster");
    initParticleCluster(canvas, platformKey);
  });
});
