// SPA Home View — navigation landing screen.
// Shows the 5 section names as large, centered, interactive text
// (important-word letter effect).  Clicking a word navigates to that section.
// The top nav bar and item dots are hidden while the home view is active.
// On first activation, the "home" word flashes as a tap-me hint.

(function () {
  'use strict';

  var SECTIONS = [
    { id: 'home',   label: 'home'   },
    { id: 'social', label: 'social' },
    { id: 'music',  label: 'music'  },
    { id: 'games',  label: 'games'  },
    { id: 'about',  label: 'about'  }
  ];

  var container = null; // cached on first mount

  function mount(itemId, cont) {
    container = cont;
    var html = '<div class="spa-home-nav">';
    SECTIONS.forEach(function (sec) {
      html +=
        '<button class="spa-home-nav-word" data-section="' + sec.id + '"' +
        ' aria-label="Go to ' + sec.label + '">' +
          '<span class="important-word">' + sec.label + '</span>' +
        '</button>';
    });
    html += '</div>';
    cont.innerHTML = html;

    cont.querySelectorAll('.spa-home-nav-word').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sid = btn.dataset.section;
        // 'home' is the current section — no-op navigation-wise
        if (sid !== 'home' && window.__SPA_Router) {
          window.__SPA_Router.go(sid);
        }
      });
    });
  }

  function onActivate() {
    document.body.classList.add('spa-at-home');

    // Flash the "home" word as a tap-hint after a short render delay
    if (!container) return;
    var homeBtn = container.querySelector('.spa-home-nav-word[data-section="home"]');
    if (!homeBtn) return;

    // Slight delay so the view is visible before the flash starts
    setTimeout(function () {
      homeBtn.classList.add('spa-home-flash');
      homeBtn.addEventListener('animationend', function () {
        homeBtn.classList.remove('spa-home-flash');
      }, { once: true });
    }, 180);
  }

  function onDeactivate() {
    document.body.classList.remove('spa-at-home');
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.home = {
    mount:        mount,
    onActivate:   onActivate,
    onDeactivate: onDeactivate
  };
}());
