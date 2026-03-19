// SPA Games View — Asymptote Engine
// Displays the game title as clean, readable HTML text with a link to the game.
// Transitions use the standard SPA transition engine.

(function () {
  'use strict';

  function mount(itemId, container) {
    if (itemId !== 'asymptote') return;

    container.innerHTML =
      '<div class="spa-text-view">' +
        '<div class="spa-text-view-label">' +
          '<a class="spa-text-view-link" href="asymptote/index.html">' +
            '<span class="important-word">Asymptote engine</span>' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.games = {
    mount: mount
  };
}());
