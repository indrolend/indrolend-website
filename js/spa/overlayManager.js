// SPA Overlay Manager
// OS-like overlay modals. While an overlay is open, swipe navigation is disabled.
//
// Public API:
//   window.__SPA_Overlay.open(id, payload)
//   window.__SPA_Overlay.close()
//   window.__SPA_Overlay.isOpen()

(function () {
  var overlayRoot = null;
  var _isOpen = false;

  // SoundCloud archive year links (placeholders — update URLs per release)
  var SOUNDCLOUD_YEARS = [
    { year: 2020, url: 'https://soundcloud.com/indrolend' },
    { year: 2021, url: 'https://soundcloud.com/indrolend' },
    { year: 2022, url: 'https://soundcloud.com/indrolend' },
    { year: 2023, url: 'https://soundcloud.com/indrolend' },
    { year: 2024, url: 'https://soundcloud.com/indrolend' },
    { year: 2025, url: 'https://soundcloud.com/indrolend' }
  ];

  var overlayBuilders = {
    soundcloudArchiveMenu: function () {
      var linksHtml = SOUNDCLOUD_YEARS.map(function (entry) {
        return '<a class="spa-overlay-link" href="' + entry.url + '" target="_blank" rel="noopener">' +
               entry.year + ' Archive' +
               '</a>';
      }).join('');

      return '<div class="spa-overlay-title"><span class="important-word">soundcloud</span></div>' +
             '<p class="spa-overlay-subtitle">Select an archive year</p>' +
             '<div class="spa-overlay-links">' + linksHtml + '</div>' +
             '<button class="spa-overlay-close" id="spa-overlay-close-btn">\u2715 close</button>';
    }
  };

  function getRoot() {
    if (!overlayRoot) {
      overlayRoot = document.getElementById('spa-overlay-root');
    }
    return overlayRoot;
  }

  function open(id, payload) {
    var root = getRoot();
    if (!root) return;

    var builder = overlayBuilders[id];
    if (!builder) return;

    _isOpen = true;

    var overlay = document.createElement('div');
    overlay.className = 'spa-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = builder(payload);

    root.innerHTML = '';
    root.appendChild(overlay);
    root.style.display = 'block';

    // Close when clicking the backdrop (root), not the overlay panel itself
    root.addEventListener('click', onBackdropClick);

    var closeBtn = overlay.querySelector('#spa-overlay-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    // Trap focus on close button for accessibility
    if (closeBtn) closeBtn.focus();

    // Kick off important-word animation inside overlay
    if (window.__SPA_ImportantWords) {
      window.__SPA_ImportantWords.init(overlay);
    }
  }

  function onBackdropClick(e) {
    if (e.target === getRoot()) {
      close();
    }
  }

  function close() {
    var root = getRoot();
    if (!root) return;
    _isOpen = false;
    root.removeEventListener('click', onBackdropClick);
    root.style.display = 'none';
    root.innerHTML = '';
  }

  function isOpen() {
    return _isOpen;
  }

  window.__SPA_Overlay = {
    open: open,
    close: close,
    isOpen: isOpen
  };
}());
