// SPA Social View — TikTok / Instagram / YouTube
// Uses GifCarouselPanel (which wraps ParticleCarouselEngine + gifler) so that:
//   • idle state shows the animated GIF (clickable — opens external URL)
//   • swipe/dot navigation transitions with explode+reassemble particles
// The per-item view divs are empty routing wrappers; the carousel panel lives
// as an absolute-fill overlay above all view divs inside #spa-view-host.

(function () {
  'use strict';

  var ITEM_IDS = ['tiktok', 'instagram', 'youtube'];

  var SLIDES = [
    { label: 'tiktok',    gifSrc: 'assets/icons/Tiktoklogospin.gif',    href: 'https://www.tiktok.com/@indrolend'      },
    { label: 'instagram', gifSrc: 'assets/icons/Instagramlogospin.gif', href: 'https://www.instagram.com/indrolend.us' },
    { label: 'youtube',   gifSrc: 'assets/icons/Youtubelogospin.gif',   href: 'https://www.youtube.com/@indrolend'     },
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

  // mount() — called once per item; view div is just a routing wrapper here.
  function mount(itemId, container) {
    // intentionally empty — carousel panel overlays all social view divs
  }

  // onActivate() — called by router after the view div is made visible.
  function onActivate(itemId) {
    var idx = ITEM_IDS.indexOf(itemId);
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
    return panel ? panel.getTransitionCanvas() : null;
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.social = {
    mount:               mount,
    onActivate:          onActivate,
    onDeactivate:        onDeactivate,
    getTransitionCanvas: getTransitionCanvas,
    // Signal to the router that this view handles its own item-level animations.
    skipItemTransition:  true,
  };
}());
