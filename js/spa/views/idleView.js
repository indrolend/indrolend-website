// SPA Idle View
// Displays a centered clickable particle-cluster placeholder.
// Only the cluster element is interactive; clicking it navigates to
// the first section in sectionOrder.

(function () {

  function mount(container) {
    var routes = window.__INDROLEND_ROUTES__;
    if (!routes || !routes.sectionOrder || !routes.sectionOrder.length) return;
    var firstSection = routes.sectionOrder[0];

    container.innerHTML =
      '<div class="spa-idle-view">' +
        '<div class="spa-idle-cluster" ' +
             'id="spa-idle-cluster" ' +
             'role="button" tabindex="0" ' +
             'aria-label="Enter">' +
        '</div>' +
      '</div>';

    var cluster = container.querySelector('#spa-idle-cluster');

    function enter() {
      window.location.hash = '#/' + firstSection;
    }

    cluster.addEventListener('click', enter);
    cluster.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enter();
      }
    });
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.idle = {
    mount: mount
  };

}());
