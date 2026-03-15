// SPA Social View — TikTok / Instagram / YouTube
// Uses ParticleCarouselEngine for 4-phase GIF→particle transitions between items.
// Requires: gifler.min.js + particlecarousel.engine.js loaded before this file.
//
// isEngineView: true — router uses a shared section-level container (not per-item).
// Public methods: mount(container), activateItem(itemId), onActivate(itemId),
//                 next(), prev(), getTransitionCanvas()

(function () {
  'use strict';

  var SECTION = 'social';
  var ITEMS   = ['tiktok', 'instagram', 'youtube'];

  var META = {
    tiktok:    { label: 'tiktok',    gif: 'assets/icons/Tiktoklogospin.gif',    url: 'https://www.tiktok.com/@indrolend'      },
    instagram: { label: 'instagram', gif: 'assets/icons/Instagramlogospin.gif', url: 'https://www.instagram.com/indrolend.us' },
    youtube:   { label: 'youtube',   gif: 'assets/icons/Youtubelogospin.gif',   url: 'https://www.youtube.com/@indrolend'     }
  };

  var engine         = null;
  var particleCanvas = null;
  var labelEl        = null;
  var pendingItemId  = null;  // item to show once engine is ready after async image load

  // ── Helpers ────────────────────────────────────────────────────────────────

  function imgFromSrc(src) {
    return new Promise(function (resolve) {
      var img     = new Image();
      img.onload  = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function updateLabel(itemId) {
    if (!labelEl) return;
    var meta = META[itemId];
    if (!meta) return;
    labelEl.innerHTML =
      '<a class="spa-poster-link" href="' + meta.url + '" target="_blank" rel="noopener">' +
        '<span class="important-word">' + meta.label + '</span>' +
      '</a>';
    if (window.__SPA_ImportantWords) {
      window.__SPA_ImportantWords.init(labelEl);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  // Called once by the router when the section container is first mounted.
  // Builds the dual-canvas DOM, loads GIF images, and initialises the engine.
  function mount(container) {
    container.innerHTML =
      '<div class="spa-engine-view">' +
        '<canvas class="spa-engine-particle-canvas"></canvas>' +
        '<canvas class="spa-engine-gif-canvas" aria-hidden="true"></canvas>' +
        '<div class="spa-engine-label-area"></div>' +
      '</div>';

    particleCanvas = container.querySelector('.spa-engine-particle-canvas');
    var gifCanvas  = container.querySelector('.spa-engine-gif-canvas');
    labelEl        = container.querySelector('.spa-engine-label-area');

    // Load all GIF images for pixel sampling, then create the engine.
    Promise.all(ITEMS.map(function (id) {
      return imgFromSrc(META[id].gif);
    })).then(function (imgs) {
      var slides = [];
      ITEMS.forEach(function (id, i) {
        if (imgs[i]) {
          slides.push({ label: META[id].label, img: imgs[i], gifSrc: META[id].gif });
        }
      });
      if (slides.length === 0) return;

      engine = new ParticleCarouselEngine({
        particleCanvas: particleCanvas,
        gifCanvas:      gifCanvas,
        onSlideChange:  function (info) {
          var itemId  = ITEMS[info.currentIdx];
          updateLabel(itemId);
          var newHash = '#/' + SECTION + '/' + itemId;
          if (window.location.hash !== newHash) {
            window.location.hash = newHash;
          }
        }
      });

      engine.setSlides(slides);

      if (pendingItemId !== null) {
        var idx = ITEMS.indexOf(pendingItemId);
        pendingItemId = null;
        if (idx > 0) {
          engine.goTo(idx);
        } else {
          updateLabel(ITEMS[0]);
        }
      } else {
        updateLabel(ITEMS[0]);
      }
    });
  }

  function activateItem(itemId) {
    var idx = ITEMS.indexOf(itemId);
    if (idx === -1) return;
    if (!engine) {
      pendingItemId = itemId;
      return;
    }
    engine.goTo(idx);  // engine ignores no-op same-index calls
  }

  function onActivate(itemId) {
    activateItem(itemId);
  }

  function onDeactivate() {
    // Engine keeps running in the cached view — no-op.
  }

  function next() { if (engine) engine.next(); }
  function prev() { if (engine) engine.prev(); }

  function getTransitionCanvas() {
    return particleCanvas;
  }

  // ── Registration ───────────────────────────────────────────────────────────

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.social = {
    isEngineView:        true,
    mount:               mount,
    activateItem:        activateItem,
    onActivate:          onActivate,
    onDeactivate:        onDeactivate,
    next:                next,
    prev:                prev,
    getTransitionCanvas: getTransitionCanvas
  };

}());
