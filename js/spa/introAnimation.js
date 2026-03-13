// Intro animation — colored particle orbs spiral in from screen edges and
// cluster into a swirling group at the center of the screen.
//
// Thematic: inspired by the Super Sonic chaos-emerald spin, using the same
// 7 colors but rendered as simple glowing dots (not gem shapes).
//
// Public API: window.__SPA_IntroAnimation.run(onComplete)

(function (global) {
  'use strict';

  // Total intro duration in milliseconds — brief enough to stay captivating
  var INTRO_DURATION_MS = 1500;

  // Seven thematic colors (matching the existing SPA palette)
  var ORB_COLORS = [
    '#00e5ff', // cyan
    '#ffd600', // yellow
    '#ff1744', // red
    '#d500f9', // purple
    '#00e676', // green
    '#e0e0e0', // silver
    '#2979ff'  // blue
  ];

  // 12 dots per color = 84 total
  var PARTICLE_COUNT = 84;

  function run(onComplete) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var ctx  = canvas.getContext('2d');
    var W    = canvas.width;
    var H    = canvas.height;
    var cx   = W / 2;
    var cy   = H / 2;
    // Start radius far outside the visible area
    var spawnR = Math.sqrt(W * W + H * H) * 0.62;

    // Build particles — each starts on the screen perimeter and spirals inward
    var particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var startAngle = (i / PARTICLE_COUNT) * Math.PI * 2;
      // Most dots go the same way (makes a coherent vortex)
      var orbDir = (i % 5 === 0) ? -1 : 1;
      // Slightly randomise the number of full rotations during the spiral
      var spinRounds = 1.6 + (i % 7) * 0.12;
      particles.push({
        startAngle:   startAngle,
        startRadius:  spawnR * (0.85 + 0.3 * ((i % 11) / 11)),
        targetRadius: 12 + ((i * 53) % 50),  // pseudo-random orbit radius 12–62px
        orbDir:       orbDir,
        spinRounds:   spinRounds,
        // Orbital speed (rad/s equivalent at t=1) — varied per particle
        orbitalSpeed: (0.35 + ((i * 37) % 100) / 100) * orbDir,
        color:        ORB_COLORS[i % ORB_COLORS.length],
        size:         2.5 + ((i * 17) % 40) / 10,  // 2.5–6.5 px
        phasePulse:   i * 0.75                       // glow pulse offset
      });
    }

    var startTs = null;

    function frame(ts) {
      if (!startTs) startTs = ts;
      var elapsed = ts - startTs;
      var t       = Math.min(elapsed / INTRO_DURATION_MS, 1);

      ctx.clearRect(0, 0, W, H);

      // Solid black background — fades to transparent in the final 12%
      // so the homeView canvas (same orbs) shows through seamlessly
      var bgAlpha = t < 0.88 ? 1 : 1 - (t - 0.88) / 0.12;
      ctx.fillStyle = 'rgba(0,0,0,' + bgAlpha.toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);

      var nowSec = elapsed / 1000;

      particles.forEach(function (p) {
        var x, y;

        if (t < 0.70) {
          // ── Phase 1: particles spiral inward ──────────────────────────────
          var p1   = t / 0.70;
          // Ease-out: starts fast, slows as particles approach their orbit
          var ease = 1 - Math.pow(1 - p1, 2.6);
          var r    = p.startRadius + (p.targetRadius - p.startRadius) * ease;
          var ang  = p.startAngle + p.orbDir * p.spinRounds * Math.PI * 2 * ease;
          x = cx + Math.cos(ang) * r;
          y = cy + Math.sin(ang) * r;
        } else {
          // ── Phase 2: stable orbiting cluster ──────────────────────────────
          // Arrival angle is where the particle was at t=0.70
          var arrivalAngle = p.startAngle + p.orbDir * p.spinRounds * Math.PI * 2;
          var orbitTime    = (t - 0.70) / 0.30;          // normalised 0→1 in phase 2
          var ang2         = arrivalAngle + p.orbitalSpeed * orbitTime * 1.8;
          x = cx + Math.cos(ang2) * p.targetRadius;
          y = cy + Math.sin(ang2) * p.targetRadius;
        }

        // Fade in during first 20%, pulse gently throughout
        var alpha = Math.min(1, t * 5) * bgAlpha;
        var pulse = 0.65 + 0.35 * Math.sin(nowSec * 2.8 + p.phasePulse);

        ctx.globalAlpha = alpha * pulse;
        ctx.shadowBlur  = p.size * 2.8;
        ctx.shadowColor = p.color;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(frame);
  }

  global.__SPA_IntroAnimation = { run: run };
}(window));
