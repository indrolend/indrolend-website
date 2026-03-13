// SPA Games View — Asymptote Engine text-particle poster.
// The label is rendered to a canvas image and sampled as a particle cloud.
// Clicking the particle cloud opens the game.

(function () {
  'use strict';

  var ITEM_IDS = ['asymptote'];

  var SLIDE_DEFS = [
    { label: 'asymptote engine', href: 'asymptote/index.html' }
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
    // intentionally empty — carousel panel overlays all games view divs
  }

  function onActivate(itemId) {
    var p = getPanel();
    p.show();
    // Only one slide; no need to goTo
  }

  function onDeactivate() {
    if (panel) panel.hide();
  }

  function getTransitionCanvas() {
    return panel ? panel.getTransitionCanvas() : null;
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.games = {
    mount:               mount,
    onActivate:          onActivate,
    onDeactivate:        onDeactivate,
    getTransitionCanvas: getTransitionCanvas,
    skipItemTransition:  true
  };
}());
