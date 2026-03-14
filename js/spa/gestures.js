// SPA Gesture System
// Horizontal-only touch handler. Left/right swipes navigate based on the
// current route mode:
//   section mode → wraps across sections
//   item mode    → wraps within items of the current section
//   idle mode    → no swipe action (tap the cluster instead)
//
// Respects overlay state: swipes are ignored while an overlay is open.
// Public API: window.__SPA_Gestures.init()

(function () {
  var SWIPE_THRESHOLD_PX = 50;   // minimum distance to register as a swipe
  var AXIS_LOCK_RATIO    = 1.5;  // |dx|/|dy| must exceed this to prefer horizontal

  var startX = 0;
  var startY = 0;
  var active = false;

  // ─── touch handlers ─────────────────────────────────────────────────────────

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    active = true;
  }

  function onTouchEnd(e) {
    if (!active) return;
    active = false;

    if (!e.changedTouches || e.changedTouches.length === 0) return;

    var t   = e.changedTouches[0];
    var dx  = t.clientX - startX;
    var dy  = t.clientY - startY;
    var adx = Math.abs(dx);
    var ady = Math.abs(dy);

    if (adx < SWIPE_THRESHOLD_PX) return;

    // Ignore swipes while overlay is open
    if (window.__SPA_Overlay && window.__SPA_Overlay.isOpen()) return;

    // Only respond to clearly horizontal swipes
    if (adx <= ady * AXIS_LOCK_RATIO) return;

    var router = window.__SPA_Router;
    if (!router) return;

    var route = router.getCurrentRoute();
    var mode  = route.mode;

    if (mode === 'section') {
      if (dx < 0) {
        router.nextSection();   // swipe left  = go forward
      } else {
        router.prevSection();   // swipe right = go back
      }
    } else if (mode === 'item') {
      if (dx < 0) {
        router.nextItem();      // swipe left  = go forward
      } else {
        router.prevItem();      // swipe right = go back
      }
    }
    // idle mode: no swipe action
  }

  function onTouchCancel() {
    active = false;
  }

  // ─── init ───────────────────────────────────────────────────────────────────

  function init() {
    document.addEventListener('touchstart',  onTouchStart,  { passive: true });
    document.addEventListener('touchend',    onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel, { passive: true });
  }

  window.__SPA_Gestures = {
    init: init
  };

  document.addEventListener('DOMContentLoaded', function () {
    init();
  });
}());
