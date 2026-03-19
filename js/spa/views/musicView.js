// SPA Music View — Spotify / Apple Music / Bandcamp / SoundCloud
// All 4 items use GifCarouselPanel with animated GIFs.
// SoundCloud opens the archive overlay on tap instead of navigating to a URL.

(function () {
  'use strict';

  var ITEM_IDS = ['spotify', 'appleMusic', 'bandcamp', 'soundcloud'];

  var SLIDES = [
    { label: 'spotify',
      gifSrc: 'assets/icons/Spotifylogospin.gif',
      href:   'https://open.spotify.com/artist/59X3431NBfd6xWMc3Zlh0v' },
    { label: 'apple music',
      gifSrc: 'assets/icons/Applemusiclogospin.gif',
      href:   'https://music.apple.com/us/artist/onliner/1663334902' },
    { label: 'bandcamp',
      gifSrc: 'assets/icons/bandcamplogospin.gif',
      href:   'https://indrolend.bandcamp.com' },
    { label: 'soundcloud',
      gifSrc: 'assets/icons/soundcloudlogospin.gif',
      onTap: function () {
        if (window.__SPA_Overlay) window.__SPA_Overlay.open('soundcloudArchiveMenu', {});
      }
    }
  ];

  var panel = null;

  function getPanel() {
    if (!panel) {
      panel = new GifCarouselPanel(SLIDES);
      var host = document.getElementById('spa-view-host');
      if (host) host.appendChild(panel.container);
    }
    return panel;
  }

  function mount(itemId, container) {
    // intentionally empty — carousel panel overlays all music view divs
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
  window.__SPA_Views.music = {
    mount:               mount,
    onActivate:          onActivate,
    onDeactivate:        onDeactivate,
    getTransitionCanvas: getTransitionCanvas,
    skipItemTransition:  true
  };
}());
