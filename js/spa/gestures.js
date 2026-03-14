// SPA Gesture + Keyboard System
// Handles both touch (swipe) and keyboard input for navigation.
//
// Touch — horizontal swipe:
//   section mode → wraps across sections
//   item mode    → wraps within items of the current section
//   idle mode    → no swipe action (tap the cluster instead)
//
// Keyboard:
//   ArrowLeft / ArrowRight — same as swipe left/right (mode-gated, wraps)
//   Space / Enter          — activate the focused hero element:
//                              idle:    no-op (cluster handles its own keydown)
//                              section: drill down to #/<sectionId>/<firstItem>
//                              item:    no-op
//   Escape                 — close overlay if one is open
//
// All navigation is suppressed while an overlay is open (except Escape).
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

  // ─── keyboard handlers ──────────────────────────────────────────────────────

  function onKeyDown(e) {
    var key = e.key;

    // Escape always closes overlay (regardless of other state)
    if (key === 'Escape') {
      if (window.__SPA_Overlay && window.__SPA_Overlay.isOpen()) {
        window.__SPA_Overlay.close();
      }
      return;
    }

    // All other navigation is suppressed while an overlay is open
    if (window.__SPA_Overlay && window.__SPA_Overlay.isOpen()) return;

    var router = window.__SPA_Router;
    if (!router) return;

    var route = router.getCurrentRoute();
    var mode  = route.mode;

    if (key === 'ArrowLeft') {
      e.preventDefault();
      if (mode === 'section') {
        router.prevSection();
      } else if (mode === 'item') {
        router.prevItem();
      }
    } else if (key === 'ArrowRight') {
      e.preventDefault();
      if (mode === 'section') {
        router.nextSection();
      } else if (mode === 'item') {
        router.nextItem();
      }
    } else if (key === ' ') {
      // Space drills down from section mode to first item
      if (mode === 'section' && route.sectionId) {
        e.preventDefault();
        var routes = window.__INDROLEND_ROUTES__;
        if (routes && routes.sections[route.sectionId]) {
          var firstItem = routes.sections[route.sectionId].items[0];
          window.location.hash = '#/' + route.sectionId + '/' + firstItem;
        }
      }
      // idle and item modes: let natural focus/click handling proceed
    }
  }

  // ─── init ───────────────────────────────────────────────────────────────────

  function init() {
    document.addEventListener('touchstart',  onTouchStart,  { passive: true });
    document.addEventListener('touchend',    onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel, { passive: true });
    document.addEventListener('keydown',     onKeyDown);
  }

  window.__SPA_Gestures = {
    init: init
  };

  document.addEventListener('DOMContentLoaded', function () {
    init();
  });
}());
