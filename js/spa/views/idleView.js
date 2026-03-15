// SPA Idle View — Section Hub
// Displays all 4 content sections as a 2×2 grid of tappable tiles.
// Each tile navigates directly to the first item of that section.
// Replaces the single-orb "Enter" screen so every section is immediately
// discoverable on both desktop and mobile.

(function () {

  // The 4 content sections shown in the hub grid (in display order).
  var HUB_SECTIONS = ['social', 'music', 'games', 'about'];

  function mount(container) {
    var routes = window.__INDROLEND_ROUTES__;
    if (!routes) return;

    var tiles = HUB_SECTIONS.map(function (sid) {
      var sec   = routes.sections[sid];
      if (!sec) return '';
      var label     = sec.label;
      var firstItem = sec.items[0] || '';
      return (
        '<div class="spa-hub-tile" ' +
             'role="button" tabindex="0" ' +
             'data-section="' + sid + '" ' +
             'data-first-item="' + firstItem + '" ' +
             'aria-label="' + label + '">' +
          '<span class="important-word spa-hub-tile-label">' +
            label.toLowerCase() +
          '</span>' +
        '</div>'
      );
    }).join('');

    container.innerHTML = '<div class="spa-hub-view">' + tiles + '</div>';

    container.querySelectorAll('.spa-hub-tile').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var sid       = tile.dataset.section;
        var firstItem = tile.dataset.firstItem;
        if (sid && firstItem) {
          window.location.hash = '#/' + sid + '/' + firstItem;
        } else if (sid) {
          window.location.hash = '#/' + sid;
        }
      });
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tile.click();
        }
      });
    });
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.idle = {
    mount: mount
  };

}());
