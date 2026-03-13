// SPA About View
// Displays each item's label as clean, large, readable HTML text.
// Items that link to multi-page pages are navigable via click/tap.
// Transitions between items use the standard SPA transition engine
// (particle + fade) which is triggered automatically by the router.

(function () {
  'use strict';

  var ITEMS = {
    spotifyAnalytics: { label: 'spotify analytics',   href: null                       },
    discography:      { label: 'discography',          href: '/pages/discography.html'  },
    devHistory:       { label: 'development history',  href: '/pages/dev-history.html'  },
    journal:          { label: 'journal',              href: '/pages/journal.html'      }
  };

  function mount(itemId, container) {
    var item = ITEMS[itemId];
    if (!item) return;

    var inner;
    if (item.href) {
      inner =
        '<a class="spa-text-view-link" href="' + item.href + '">' +
          '<span class="important-word">' + item.label + '</span>' +
        '</a>';
    } else {
      inner = '<span class="important-word">' + item.label + '</span>';
    }

    container.innerHTML =
      '<div class="spa-text-view">' +
        '<div class="spa-text-view-label">' + inner + '</div>' +
      '</div>';
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.about = {
    mount: mount
  };
}());
