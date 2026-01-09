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
    gallery: ["#6DD9E8", "#3BB8CC", "#FFFFFF"] // Cyan/teal theme colors
  };

  // Particle system configuration
  const config = {
    particleCount: 25, // Low count for performance
    particleSize: { min: 2, max: 5 },
    speed: 0.3,
    connectionDistance: 60,
    mouseRepelDistance: 80,
    mouseRepelForce: 0.5
  };

  // Initialize particle clusters for each platform button
  function initParticleCluster(canvas, platformKey) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const colors = platformColors[platformKey] || platformColors.gallery;
    const particles = [];
    const mouse = { x: null, y: null, active: false };
    let animationId = null;
    let isVisible = false;
    
    // Use a lighter version of the first color for connection lines
    const connectionLineColor = colors[0] || "#6DD9E8";

    // Set canvas size to match container
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Create a particle
    function createParticle() {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(canvas.width, canvas.height) * 0.3;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        radius: Math.random() * (config.particleSize.max - config.particleSize.min) + config.particleSize.min,
        color: colors[Math.floor(Math.random() * colors.length)],
        originalX: null,
        originalY: null
      };
    }

    // Initialize particles in a cluster
    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < config.particleCount; i++) {
        const particle = createParticle();
        particle.originalX = particle.x;
        particle.originalY = particle.y;
        particles.push(particle);
      }
    }

    // Update particle positions
    function updateParticles() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDistance = Math.min(canvas.width, canvas.height) * 0.4;

      particles.forEach(particle => {
        // Apply velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Mouse repulsion effect
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.mouseRepelDistance) {
            const force = (config.mouseRepelDistance - distance) / config.mouseRepelDistance;
            particle.x += (dx / distance) * force * config.mouseRepelForce * 5;
            particle.y += (dy / distance) * force * config.mouseRepelForce * 5;
          }
        }

        // Gentle attraction back to center to keep cluster together
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistance) {
          particle.vx += (dx / distance) * 0.01;
          particle.vy += (dy / distance) * 0.01;
        }

        // Limit velocity
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const maxSpeed = config.speed * 2;
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }

        // Soft boundary bounce
        const padding = particle.radius;
        if (particle.x < padding) {
          particle.x = padding;
          particle.vx *= -0.5;
        } else if (particle.x > canvas.width - padding) {
          particle.x = canvas.width - padding;
          particle.vx *= -0.5;
        }
        if (particle.y < padding) {
          particle.y = padding;
          particle.vy *= -0.5;
        } else if (particle.y > canvas.height - padding) {
          particle.y = canvas.height - padding;
          particle.vy *= -0.5;
        }
      });
    }

    // Draw particles and connections
    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections first (behind particles)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            const opacity = (1 - distance / config.connectionDistance) * 0.3;
            // Convert hex color to rgba for opacity support
            const hexColor = connectionLineColor.replace('#', '');
            const r = parseInt(hexColor.substr(0, 2), 16);
            const g = parseInt(hexColor.substr(2, 2), 16);
            const b = parseInt(hexColor.substr(4, 2), 16);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Animation loop
    function animate() {
      if (!isVisible) return;
      
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    }

    // Mouse move handler
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    // Touch move handler
    function handleTouchMove(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
    }

    // Mouse enter handler
    function handleMouseEnter() {
      mouse.active = true;
    }

    // Mouse leave handler
    function handleMouseLeave() {
      mouse.active = false;
      mouse.x = null;
      mouse.y = null;
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
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleMouseEnter);
    canvas.addEventListener("touchend", handleMouseLeave);

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
