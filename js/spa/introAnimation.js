// Sonic Chaos Emerald intro swirl — plays once on first page load.
// 7 gem-shaped particles spiral inward, converge in a bright flash,
// then scatter outward. Total duration ≈ 1.4 s.
//
// Public API: window.__SPA_IntroAnimation.run(onComplete)

(function (global) {
  'use strict';

  // Total duration of the intro animation in milliseconds
  var INTRO_ANIMATION_DURATION_MS = 1400;

  // Seven Chaos Emerald colours
  var GEM_COLORS = [
    '#00e5ff', // cyan
    '#ffd600', // yellow
    '#ff1744', // red
    '#d500f9', // purple
    '#00e676', // green
    '#e0e0e0', // silver
    '#2979ff'  // blue
  ];

  // Draw a cut-gem (hexagonal diamond) shape
  function drawGem(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.58, -size * 0.32);
    ctx.lineTo(size * 0.58,  size * 0.32);
    ctx.lineTo(0,            size);
    ctx.lineTo(-size * 0.58, size * 0.32);
    ctx.lineTo(-size * 0.58, -size * 0.32);
    ctx.closePath();
    ctx.fillStyle   = color;
    ctx.shadowBlur  = size * 1.1;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.restore();
  }

  function run(onComplete) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var ctx   = canvas.getContext('2d');
    var W     = canvas.width;
    var H     = canvas.height;
    var cx    = W / 2;
    var cy    = H / 2;
    var gemSz = Math.min(W, H) * 0.064;
    var spawnR = Math.min(W, H) * 0.44;
    var start  = null;
    var sparks = [];   // explosion sparks spawned at flash peak

    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / INTRO_ANIMATION_DURATION_MS, 1);

      // Black background that fades to transparent at the end
      var bgAlpha = t < 0.80 ? 1 : 1 - (t - 0.80) / 0.20;
      ctx.fillStyle = 'rgba(0,0,0,' + bgAlpha.toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);

      if (t < 0.52) {
        // ── Phase 1: gems spiral inward ─────────────────────────────────────
        var p1    = t / 0.52;
        var eased = p1 < 0.5 ? 2 * p1 * p1 : -1 + (4 - 2 * p1) * p1;
        GEM_COLORS.forEach(function (col, i) {
          var baseAngle = (i / GEM_COLORS.length) * Math.PI * 2;
          var angle     = baseAngle + p1 * Math.PI * 4.5; // 2.25 rotations
          var r         = spawnR * (1 - eased * 0.88);
          var alpha     = Math.min(1, p1 * 2.8);
          drawGem(ctx, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r,
                  gemSz, col, alpha);
        });

      } else if (t < 0.70) {
        // ── Phase 2: converge at centre, bright flash ────────────────────────
        var p2         = (t - 0.52) / 0.18;
        var flashBright = Math.sin(p2 * Math.PI);

        GEM_COLORS.forEach(function (col, i) {
          var baseAngle = (i / GEM_COLORS.length) * Math.PI * 2;
          var r         = spawnR * 0.11 * (1 - p2);
          drawGem(ctx,
            cx + Math.cos(baseAngle) * r,
            cy + Math.sin(baseAngle) * r,
            gemSz * (1 + p2 * 0.35), col, 1);
        });

        // White flash overlay
        if (flashBright > 0) {
          ctx.fillStyle = 'rgba(255,255,255,' + (flashBright * 0.55).toFixed(3) + ')';
          ctx.fillRect(0, 0, W, H);
        }

        // Spawn sparks at flash peak
        if (sparks.length === 0 && p2 > 0.42) {
          GEM_COLORS.forEach(function (col) {
            for (var k = 0; k < 22; k++) {
              var a   = Math.random() * Math.PI * 2;
              var spd = Math.random() * 10 + 4;
              sparks.push({
                x: cx, y: cy,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd,
                color: col,
                size:  Math.random() * 4 + 2
              });
            }
          });
        }

      } else if (t < 0.84) {
        // ── Phase 3: sparks explode outward ─────────────────────────────────
        var p3 = (t - 0.70) / 0.14;
        sparks.forEach(function (s) {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.93;
          s.vy *= 0.93;
          ctx.globalAlpha = (1 - p3) * 0.85;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
      // Phase 4 (0.80–1.0): bgAlpha fades to 0, overlay disappears

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
