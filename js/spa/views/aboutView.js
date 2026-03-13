// SPA About View — text-particle carousel.
// Each item's label is rendered to a canvas image and sampled as a particle cloud.
// Transitions use ParticleCarouselEngine spring-physics morph.
// Items with an href open the multipage page when clicked.

(function () {
  'use strict';

  var ITEM_IDS = ['spotifyAnalytics', 'discography', 'devHistory', 'journal'];

  var SLIDE_DEFS = [
    { label: 'spotify analytics',   href: null                         },
    { label: 'discography',         href: '/pages/discography.html'    },
    { label: 'development history', href: '/pages/dev-history.html'    },
    { label: 'journal',             href: '/pages/journal.html'        }
  ];

  var panel = null;

  function buildSlides() {
    var make = window.__SPA_TextPoster ? window.__SPA_TextPoster.make : null;
    return SLIDE_DEFS.map(function (def) {
      return {
        label:  def.label,
        img:    make ? make(def.label) : null,
        gifSrc: null,
        href:   def.href
      };
    });
  }

  function getPanel() {
    if (!panel) {
      panel = new GifCarouselPanel(buildSlides());
      var host = document.getElementById('spa-view-host');
      if (host) host.appendChild(panel.container);
    }
    return panel;
  }

  function mount(itemId, container) {
    // intentionally empty — carousel panel overlays all about view divs
  }

  function onActivate(itemId) {
    var idx = ITEM_IDS.indexOf(itemId);
    if (idx === -1) return;
    var p = getPanel();
    p.show();
    p.goTo(idx);
  }

  function onDeactivate() {
    if (panel) panel.hide();
  }

  function getTransitionCanvas() {
    return panel ? panel.getTransitionCanvas() : null;
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.about = {
    mount:               mount,
    onActivate:          onActivate,
    onDeactivate:        onDeactivate,
    getTransitionCanvas: getTransitionCanvas,
    skipItemTransition:  true
  };
}());
