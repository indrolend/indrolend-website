// SPA About View
// Each about item is a full-screen panel with:
//   - A sticky header using the "important-word" fluctuating letter style
//   - A scrollable content body
// Discography, Dev History and Journal titles link to the multipage pages.
// Vertical route-swipe is edge-gated (handled by gestures.js + routes.js metadata).

(function () {
  var ITEMS = {
    spotifyAnalytics: { label: 'spotify analytics', href: null                      },
    discography:      { label: 'discography',        href: '/pages/discography.html' },
    devHistory:       { label: 'development history', href: '/pages/dev-history.html' },
    journal:          { label: 'journal',             href: '/pages/journal.html'    }
  };

  function mount(itemId, container) {
    var item = ITEMS[itemId];
    if (!item) return;

    var labelHtml;
    if (item.href) {
      labelHtml =
        '<a class="spa-about-link" href="' + item.href + '">' +
          '<span class="important-word">' + item.label + '</span>' +
        '</a>';
    } else {
      labelHtml = '<span class="important-word">' + item.label + '</span>';
    }

    container.innerHTML =
      '<div class="spa-poster-view spa-text-poster">' +
        '<div class="spa-text-poster-content">' +
          '<div class="spa-poster-label">' + labelHtml + '</div>' +
        '</div>' +
      '</div>';
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.about = {
    mount: mount
  };
}());
