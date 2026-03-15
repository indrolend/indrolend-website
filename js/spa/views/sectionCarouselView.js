// SPA Section Carousel View
// Displays a centered hero word for the active section.
// Tapping the word drills down to the first item of that section.

(function () {

  function mount(sectionId, container) {
    var routes = window.__INDROLEND_ROUTES__;
    if (!routes || !routes.sections[sectionId]) return;

    var section   = routes.sections[sectionId];
    var firstItem = section.items[0];
    var label     = section.label;

    container.innerHTML =
      '<div class="spa-section-carousel-view">' +
        '<div class="spa-section-hero-word" ' +
             'role="button" tabindex="0" ' +
             'aria-label="' + label + '">' +
          label.toLowerCase() +
        '</div>' +
      '</div>';

    var heroWord = container.querySelector('.spa-section-hero-word');

    function drill() {
      window.location.hash = '#/' + sectionId + '/' + firstItem;
    }

    heroWord.addEventListener('click', drill);
    heroWord.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        drill();
      }
    });
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.sectionCarousel = {
    mount: mount
  };

}());
