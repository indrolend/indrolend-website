// SPA Music View — Spotify / Apple Music / Bandcamp / SoundCloud
// Uses ParticleCarouselEngine for 4-phase GIF→particle transitions between items.
// Requires: gifler.min.js + particlecarousel.engine.js loaded before this file.
//
// isEngineView: true — router uses a shared section-level container (not per-item).

(function () {
  'use strict';

  var SECTION = 'music';
  var ITEMS   = ['spotify', 'appleMusic', 'bandcamp', 'soundcloud'];

  var META = {
    spotify:    { label: 'spotify',     gif: 'assets/icons/Spotifylogospin.gif',    url: 'https://open.spotify.com/artist/59X3431NBfd6xWMc3Zlh0v' },
    appleMusic: { label: 'apple music', gif: 'assets/icons/Applemusiclogospin.gif', url: 'https://music.apple.com/us/artist/onliner/1663334902'   },
    bandcamp:   { label: 'bandcamp',    gif: 'assets/icons/bandcamplogospin.gif',   url: 'https://indrolend.bandcamp.com'                         },
    soundcloud: { label: 'soundcloud',  gif: 'assets/icons/soundcloudlogospin.gif', overlay: 'soundcloudArchiveMenu'                              }
  };

  var engine         = null;
  var particleCanvas = null;
  var labelEl        = null;
  var pendingItemId  = null;

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

    var inner;
    if (meta.overlay) {
      inner =
        '<button class="spa-poster-link spa-soundcloud-btn">' +
          '<span class="important-word">' + meta.label + '</span>' +
        '</button>' +
        '<p class="spa-poster-hint">tap to browse archives</p>';
    } else {
      inner =
        '<a class="spa-poster-link" href="' + meta.url + '" target="_blank" rel="noopener">' +
          '<span class="important-word">' + meta.label + '</span>' +
        '</a>';
    }
    labelEl.innerHTML = inner;

    if (meta.overlay) {
      var btn = labelEl.querySelector('.spa-soundcloud-btn');
      if (btn) {
        btn.addEventListener('click', function () {
          if (window.__SPA_Overlay) {
            window.__SPA_Overlay.open(meta.overlay, {});
          }
        });
      }
    }

    if (window.__SPA_ImportantWords) {
      window.__SPA_ImportantWords.init(labelEl);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

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

  function onDeactivate() {}

  function next() { if (engine) engine.next(); }
  function prev() { if (engine) engine.prev(); }

  function getTransitionCanvas() {
    return particleCanvas;
  }

  // ── Registration ───────────────────────────────────────────────────────────

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.music = {
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
