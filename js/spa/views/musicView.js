// SPA Music View — Spotify / Apple Music / Bandcamp / SoundCloud
// All items render an animated GIF poster + a clickable label.
// SoundCloud opens the soundcloudArchiveMenu overlay when tapped.

(function () {
  var META = {
    spotify:    { label: 'spotify',     gif: 'assets/icons/Spotifylogospin.gif',    url: 'https://open.spotify.com/artist/59X3431NBfd6xWMc3Zlh0v' },
    appleMusic: { label: 'apple music', gif: 'assets/icons/Applemusiclogospin.gif', url: 'https://music.apple.com/us/artist/onliner/1663334902'   },
    bandcamp:   { label: 'bandcamp',    gif: 'assets/icons/bandcamplogospin.gif',   url: 'https://indrolend.bandcamp.com'                         },
    soundcloud: { label: 'soundcloud',  gif: 'assets/icons/soundcloudlogospin.gif', overlay: 'soundcloudArchiveMenu' }
  };

  function mount(itemId, container) {
    var item = META[itemId];
    if (!item) return;

    if (item.overlay) {
      // SoundCloud — GIF poster that opens the archive overlay
      container.innerHTML =
        '<div class="spa-poster-view">' +
          '<div class="spa-poster-gif-wrap">' +
            '<img class="spa-poster-gif" src="' + item.gif + '" alt="' + item.label + '" />' +
          '</div>' +
          '<div class="spa-poster-label">' +
            '<button class="spa-poster-link spa-soundcloud-btn">' +
              '<span class="important-word">' + item.label + '</span>' +
            '</button>' +
          '</div>' +
          '<p class="spa-poster-hint">tap to browse archives</p>' +
        '</div>';

      var btn = container.querySelector('.spa-soundcloud-btn');
      if (btn) {
        btn.addEventListener('click', function () {
          if (window.__SPA_Overlay) {
            window.__SPA_Overlay.open(item.overlay, {});
          }
        });
      }
    } else {
      // Link-based platforms
      container.innerHTML =
        '<div class="spa-poster-view">' +
          '<div class="spa-poster-gif-wrap">' +
            '<img class="spa-poster-gif" src="' + item.gif + '" alt="' + item.label + '" />' +
          '</div>' +
          '<div class="spa-poster-label">' +
            '<a class="spa-poster-link" href="' + item.url + '" target="_blank" rel="noopener">' +
              '<span class="important-word">' + item.label + '</span>' +
            '</a>' +
          '</div>' +
        '</div>';
    }
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.music = {
    mount: mount
  };
}());
