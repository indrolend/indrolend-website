// SPA Home View — "swarm" panel
// Renders character-particle background identical to the one in pages/home.html.
// Exposes getTransitionCanvas() so the transition engine can sample its pixels.

// SPA Home View — "swarm" panel (refactored to use shared characterParticles engine)
(function () {
  var canvas = null;
  var ctx = null;
  var animId = null;
  var particles = [];
  var mouse = { x: null, y: null };

  // Import shared engine
  var characterParticles = window.__SPA_CharacterParticles || require('../engines/characterParticles.js');

  function initParticles() {
    if (!canvas) return;
    particles = [];
    for (var i = 0; i < characterParticles.PARTICLE_COUNT; i++) {
      particles.push(characterParticles.makeParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) // random char
      ));
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animate() {
    characterParticles.updateParticles(particles, mouse);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    characterParticles.drawParticles(ctx, particles);
    characterParticles.connectParticles(ctx, particles);
    animId = requestAnimationFrame(animate);
  }

  function mount(itemId, container) {
    container.innerHTML =
      '<canvas class="spa-home-canvas" id="spa-home-canvas"></canvas>' +
      '<div class="spa-home-label"><span class="important-word">indrolend</span></div>';

    canvas = container.querySelector('#spa-home-canvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    initParticles();

    canvas.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    canvas.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', function () {
      resizeCanvas();
      initParticles();
    });
  }

  function onActivate() {
    if (!animId) animate();
  }

  function onDeactivate() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function getTransitionCanvas() {
    return canvas;
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.home = {
    mount: mount,
    onActivate: onActivate,
    onDeactivate: onDeactivate,
    getTransitionCanvas: getTransitionCanvas
  };
}());
}());
