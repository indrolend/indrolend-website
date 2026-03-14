// SPA Social View — TikTok / Instagram / YouTube
// Each item renders an animated GIF poster + a clickable important-word label.

(function () {
  var META = {
    tiktok:    { label: 'tiktok',    url: 'https://www.tiktok.com/@indrolend',     gif: 'assets/icons/Tiktoklogospin.gif'    },
    instagram: { label: 'instagram', url: 'https://www.instagram.com/indrolend.us', gif: 'assets/icons/Instagramlogospin.gif' },
    youtube:   { label: 'youtube',   url: 'https://www.youtube.com/@indrolend',     gif: 'assets/icons/Youtubelogospin.gif'   }
  };

  function mount(itemId, container) {
    var item = META[itemId];
    if (!item) return;

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

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.social = {
    mount: mount
  };
}());
