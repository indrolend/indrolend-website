// SPA Music View — Spotify / Apple Music / Bandcamp / SoundCloud
// Spotify, Apple Music, and Bandcamp use GifCarouselPanel (animated GIF + particles).
// SoundCloud is a text-poster that opens the SoundCloud archive overlay.

(function () {
  'use strict';

  // GIF carousel slides (first 3 items in the music section)
  var GIF_ITEM_IDS = ['spotify', 'appleMusic', 'bandcamp'];

  var SLIDES = [
    { label: 'spotify',     gifSrc: 'assets/icons/Spotifylogospin.gif',    href: 'https://open.spotify.com/artist/59X3431NBfd6xWMc3Zlh0v' },
    { label: 'apple music', gifSrc: 'assets/icons/Applemusiclogospin.gif', href: 'https://music.apple.com/us/artist/onliner/1663334902'    },
    { label: 'bandcamp',    gifSrc: 'assets/icons/bandcamplogospin.gif',   href: 'https://indrolend.bandcamp.com'                         },
  ];

  var panel = null;

  function getPanel() {
    if (!panel) {
      panel = new GifCarouselPanel(SLIDES);
      var host = document.getElementById('spa-view-host');
      if (host) host.appendChild(panel.container);
    }
    return panel;
  }

  // mount() — called once per item by the router.
  function mount(itemId, container) {
    if (itemId !== 'soundcloud') return; // GIF items: empty routing wrapper

    // SoundCloud text-poster
    container.innerHTML =
      '<div class="spa-poster-view spa-text-poster">' +
        '<div class="spa-text-poster-content">' +
          '<div class="spa-poster-label">' +
            '<button class="spa-poster-link spa-soundcloud-btn">' +
              '<span class="important-word">soundcloud</span>' +
            '</button>' +
          '</div>' +
          '<p class="spa-poster-hint">tap to browse archives</p>' +
        '</div>' +
      '</div>';

    var btn = container.querySelector('.spa-soundcloud-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        if (window.__SPA_Overlay) window.__SPA_Overlay.open('soundcloudArchiveMenu', {});
      });
    }
  }

  // onActivate() — called by router after the view div is made visible.
  function onActivate(itemId) {
    if (itemId === 'soundcloud') {
      if (panel) panel.hide();
      return;
    }
    var idx = GIF_ITEM_IDS.indexOf(itemId);
    if (idx === -1) return;
    var p = getPanel();
    p.show();
    p.goTo(idx);
  }

  // onDeactivate() — called by router before the view div is hidden.
  function onDeactivate(itemId) {
    if (panel) panel.hide();
  }

  // getTransitionCanvas() — supplies a canvas for section-level SPA transitions.
  function getTransitionCanvas(itemId) {
    if (itemId === 'soundcloud') return null;
    return panel ? panel.getTransitionCanvas() : null;
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.music = {
    mount:               mount,
    onActivate:          onActivate,
    onDeactivate:        onDeactivate,
    getTransitionCanvas: getTransitionCanvas,
    // Signal to the router that this view handles its own item-level animations.
    skipItemTransition:  true,
  };
}());
