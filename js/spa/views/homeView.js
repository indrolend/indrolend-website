// SPA Home View — swirling orb cluster + section-word navigator.
//
// State machine:
//   ORBS            — rainbow dots orbit center; tap → TRANSITIONING(orbs_to_word)
//   TRANSITIONING   — canvas animates between ORBS and WORD
//   WORD            — one section name is displayed as HTML text;
//                     swipe L/R → TRANSITIONING(word_to_word);
//                     tap "home" → TRANSITIONING(word_to_orbs);
//                     tap other  → router.go(section)
//
// While active, body.spa-at-home hides the router nav and prevents
// gestures.js from processing swipe events.

(function () {
  'use strict';

  var ORB_COLORS = [
    '#00e5ff', '#ffd600', '#ff1744', '#d500f9', '#00e676', '#e0e0e0', '#2979ff'
  ];

  var SECTION_IDS    = ['home', 'social', 'music', 'games', 'about'];
  var PARTICLE_COUNT = 84;   // 12 × 7 colors
  var SWIPE_MIN_PX   = 40;   // minimum swipe distance

  // ── State ────────────────────────────────────────────────────────────────
  var state      = 'orbs';  // 'orbs' | 'word' | 'transitioning'
  var transPhase = null;    // 'orbs_to_word' | 'word_to_orbs' | 'word_to_word'
  var transStart = null;    // timestamp when current transition began
  var transNewIdx = 0;      // target word index for word_to_word transition
  var wordIdx    = 0;       // current section word index (0 = home)

  // ── DOM refs ─────────────────────────────────────────────────────────────
  var canvas      = null;
  var ctx         = null;
  var wordOverlay = null;
  var wordLabel   = null;

  // ── Animation ────────────────────────────────────────────────────────────
  var animId    = null;
  var lastTs    = 0;

  // ── Orb particles ────────────────────────────────────────────────────────
  var orbs = [];

  function makeOrbs() {
    orbs = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      orbs.push({
        angle:      (i / PARTICLE_COUNT) * Math.PI * 2,
        radius:     12 + ((i * 53) % 50),         // 12–62 px
        speed:      (0.35 + ((i * 37) % 100) / 100) * ((i % 5 === 0) ? -1 : 1),
        color:      ORB_COLORS[i % ORB_COLORS.length],
        size:       2.5 + ((i * 17) % 40) / 10,   // 2.5–6.5 px
        phasePulse: i * 0.75
      });
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ── Burst particles (word-to-word transition) ────────────────────────────
  var burst = [];

  function spawnBurst() {
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    burst = [];
    for (var i = 0; i < 64; i++) {
      var a   = Math.random() * Math.PI * 2;
      var spd = 2.5 + Math.random() * 8;
      burst.push({
        x:     cx, y: cy,
        vx:    Math.cos(a) * spd,
        vy:    Math.sin(a) * spd,
        color: ORB_COLORS[i % ORB_COLORS.length],
        size:  2 + Math.random() * 3.5
      });
    }
  }

  // ── Drawing helpers ───────────────────────────────────────────────────────

  function stepOrbs(dt) {
    orbs.forEach(function (o) { o.angle += o.speed * dt; });
  }

  function drawOrbs(alpha) {
    if (!ctx || !canvas) return;
    var cx  = canvas.width / 2;
    var cy  = canvas.height / 2;
    var now = performance.now() / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(function (o) {
      var pulse = 0.65 + 0.35 * Math.sin(now * 2.8 + o.phasePulse);
      ctx.globalAlpha = pulse * alpha;
      ctx.shadowBlur  = o.size * 2.8;
      ctx.shadowColor = o.color;
      ctx.fillStyle   = o.color;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(o.angle) * o.radius,
        cy + Math.sin(o.angle) * o.radius,
        o.size, 0, Math.PI * 2
      );
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
  }

  function drawBurst(alpha) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    burst.forEach(function (p) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.90; p.vy *= 0.90;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur  = 5;
      ctx.shadowColor = p.color;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
  }

  // ── Overlay helpers ───────────────────────────────────────────────────────

  function setOverlayOpacity(v) {
    if (wordOverlay) wordOverlay.style.opacity = v.toFixed(3);
  }

  function showOverlay(v) {
    if (wordOverlay) wordOverlay.style.display = v ? 'flex' : 'none';
  }

  function updateWordLabel() {
    if (!wordLabel) return;
    var label = SECTION_IDS[wordIdx];
    wordLabel.innerHTML = '';
    var span = document.createElement('span');
    span.className  = 'important-word';
    span.textContent = label;
    wordLabel.appendChild(span);
    if (window.__SPA_ImportantWords) {
      window.__SPA_ImportantWords.init(wordLabel);
    }
  }

  function flashWord() {
    if (!wordLabel) return;
    wordLabel.classList.add('spa-home-flash');
    wordLabel.addEventListener('animationend', function () {
      wordLabel.classList.remove('spa-home-flash');
    }, { once: true });
  }

  // ── Single animation loop ─────────────────────────────────────────────────

  function tick(ts) {
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (state === 'orbs') {
      stepOrbs(dt);
      drawOrbs(1);
      animId = requestAnimationFrame(tick);

    } else if (state === 'transitioning') {
      stepOrbs(dt);
      if (!transStart) transStart = ts;
      var elapsed = ts - transStart;
      var done    = runTransition(elapsed);
      if (!done) {
        animId = requestAnimationFrame(tick);
      }
      // When done, runTransition calls finishTransition which manages animId

    } else {
      // WORD state — canvas off, no rendering needed
      animId = null;
    }
  }

  function startLoop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    lastTs = performance.now();
    animId = requestAnimationFrame(tick);
  }

  // Returns true when the transition has finished.
  function runTransition(elapsed) {
    if (transPhase === 'orbs_to_word') {
      // 650 ms: orbs fade out (first 55%), word fades in (last 45%)
      var TOTAL = 650;
      var t = Math.min(elapsed / TOTAL, 1);
      drawOrbs(Math.max(0, 1 - t / 0.55));
      setOverlayOpacity(t > 0.55 ? (t - 0.55) / 0.45 : 0);
      if (t >= 1) { finishTransition('word'); return true; }

    } else if (transPhase === 'word_to_orbs') {
      // 650 ms: word fades out (first 45%), orbs fade in (last 55%)
      var TOTAL = 650;
      var t = Math.min(elapsed / TOTAL, 1);
      drawOrbs(t > 0.45 ? (t - 0.45) / 0.55 : 0);
      setOverlayOpacity(Math.max(0, 1 - t / 0.45));
      if (t >= 1) { finishTransition('orbs'); return true; }

    } else if (transPhase === 'word_to_word') {
      // 500 ms: burst rises/falls; word crossfades in the middle
      var TOTAL = 500;
      var t = Math.min(elapsed / TOTAL, 1);
      var burstAlpha = Math.sin(t * Math.PI) * 0.9;
      drawBurst(burstAlpha);

      if (t < 0.42) {
        setOverlayOpacity(1 - t / 0.42);
      } else if (t >= 0.42 && t < 0.58) {
        setOverlayOpacity(0);
        // Swap the word at the midpoint (once)
        if (wordIdx !== transNewIdx) {
          wordIdx = transNewIdx;
          updateWordLabel();
        }
      } else {
        setOverlayOpacity((t - 0.58) / 0.42);
      }
      if (t >= 1) { finishTransition('word'); return true; }
    }
    return false;
  }

  function finishTransition(newState) {
    transStart = null;
    transPhase = null;
    state      = newState;

    if (state === 'orbs') {
      showOverlay(false);
      setOverlayOpacity(0);
      canvas.style.opacity = '1';
      startLoop();

    } else if (state === 'word') {
      // Ensure word index was committed
      if (wordIdx !== transNewIdx && transNewIdx !== undefined) {
        wordIdx = transNewIdx;
        updateWordLabel();
      }
      canvas.style.opacity = '0';
      setOverlayOpacity(1);
      showOverlay(true);
      animId = null;
      // Flash the word as a tap/swipe hint
      setTimeout(flashWord, 60);
    }
  }

  // ── Interaction handlers ──────────────────────────────────────────────────

  function handleTap() {
    if (state === 'transitioning') return;

    if (state === 'orbs') {
      // Orbs → first section word ("home")
      wordIdx    = 0;
      transNewIdx = 0;
      updateWordLabel();
      showOverlay(true);
      setOverlayOpacity(0);
      canvas.style.opacity = '1';
      state      = 'transitioning';
      transPhase = 'orbs_to_word';
      transStart = null;
      startLoop();

    } else if (state === 'word') {
      if (wordIdx === 0) {
        // "home" → back to orbs
        canvas.style.opacity = '1';
        state      = 'transitioning';
        transPhase = 'word_to_orbs';
        transStart = null;
        startLoop();
      } else {
        // Navigate into that section
        var sid = SECTION_IDS[wordIdx];
        if (window.__SPA_Router) window.__SPA_Router.go(sid);
      }
    }
  }

  function handleSwipe(dir) {
    if (state !== 'word') return;
    var newIdx = dir === 'left'
      ? (wordIdx + 1) % SECTION_IDS.length
      : (wordIdx - 1 + SECTION_IDS.length) % SECTION_IDS.length;
    if (newIdx === wordIdx) return;

    transNewIdx = newIdx;
    spawnBurst();
    canvas.style.opacity = '1';
    state      = 'transitioning';
    transPhase = 'word_to_word';
    transStart = null;
    startLoop();
  }

  // ── Touch/pointer events ──────────────────────────────────────────────────

  var txStart = 0;
  var tyStart = 0;
  var txActive = false;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    txStart  = e.touches[0].clientX;
    tyStart  = e.touches[0].clientY;
    txActive = true;
    // Stop gestures.js from also processing this touch
    e.stopPropagation();
  }

  function onTouchEnd(e) {
    if (!txActive) return;
    txActive = false;
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    e.stopPropagation();
    var dx  = e.changedTouches[0].clientX - txStart;
    var dy  = e.changedTouches[0].clientY - tyStart;
    var adx = Math.abs(dx);
    var ady = Math.abs(dy);
    if (adx < SWIPE_MIN_PX && ady < SWIPE_MIN_PX) {
      handleTap();
    } else if (adx > ady * 1.4) {
      handleSwipe(dx < 0 ? 'left' : 'right');
    }
    // Ignore vertical-only swipes in home view
  }

  function onTouchCancel() {
    txActive = false;
  }

  function onMouseClick() {
    // Desktop: treat any click as a tap
    if (state === 'orbs' || state === 'word') handleTap();
  }

  // ── View lifecycle ────────────────────────────────────────────────────────

  function mount(itemId, container) {
    container.innerHTML = '';

    // Canvas — draws orbs and burst particles
    canvas = document.createElement('canvas');
    canvas.className = 'spa-home-canvas';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Word overlay — shows current section name as HTML text
    wordOverlay = document.createElement('div');
    wordOverlay.className = 'spa-home-word-overlay';
    wordOverlay.style.display = 'none';
    wordLabel = document.createElement('div');
    wordLabel.className = 'spa-home-word';
    wordOverlay.appendChild(wordLabel);
    container.appendChild(wordOverlay);

    makeOrbs();

    // Touch events (stopPropagation prevents gestures.js from interfering)
    container.addEventListener('touchstart',  onTouchStart,  { passive: true });
    container.addEventListener('touchend',    onTouchEnd);
    container.addEventListener('touchcancel', onTouchCancel, { passive: true });
    // Desktop click
    container.addEventListener('click', onMouseClick);
  }

  function onActivate() {
    document.body.classList.add('spa-at-home');
    // Always start from the orbs state (home = the orb cluster)
    wordIdx    = 0;
    state      = 'orbs';
    transPhase = null;
    transStart = null;
    canvas.style.opacity = '1';
    showOverlay(false);
    setOverlayOpacity(0);
    startLoop();
  }

  function onDeactivate() {
    document.body.classList.remove('spa-at-home');
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.home = {
    mount:        mount,
    onActivate:   onActivate,
    onDeactivate: onDeactivate
  };
}());
