// SPA About View
// Each about item is a full-screen panel with:
//   - A sticky header using the "important-word" fluctuating letter style
//   - A scrollable content body
// Vertical route-swipe is edge-gated (handled by gestures.js + routes.js metadata).

(function () {
  var ITEMS = {
    spotifyAnalytics: {
      label: 'spotify analytics',
      content: [
        '<p>Streaming data and analytics for Indrolend across all major platforms.</p>',
        '<p>Track performance, listener growth, and streaming trends across releases.',
        'Data sourced from Spotify for Artists and third-party scrapers.</p>',
        '<p>Charts and breakdowns are updated periodically. Check back for the latest numbers.</p>',
        '<p>Top markets, playlist placements, and monthly listener milestones are recorded here.</p>',
        '<p>The analytics dashboard can be reached from the legacy pages at <code>pages/home.html</code>.</p>'
      ].join('')
    },
    discography: {
      label: 'discography',
      content: [
        '<p>A full catalogue of releases by Indrolend — albums, EPs, and singles.</p>',
        '<p>Available on Bandcamp, Spotify, Apple Music, YouTube, and SoundCloud archives.</p>',
        '<p>Each release is accompanied by artwork and production notes.</p>',
        '<p>The most recent album is <em>HD</em>, available now on Bandcamp.</p>',
        '<p>Browse the full discography on the legacy Discography page for detailed track listings.</p>'
      ].join('')
    },
    devHistory: {
      label: 'development history',
      content: [
        '<p>The technical journey behind this website — from a static HTML page to an SPA shell.</p>',
        '<p>Includes experiments in particle systems, canvas rendering, and interactive UI.</p>',
        '<p>Key milestones: fake reCAPTCHA landing page, particle transitions, cluster canvases,',
        'the Asymptote idle game engine, Spotify data scraper and analytics dashboard.</p>',
        '<p>This SPA shell is the latest chapter: hash-based routing, swipe gestures,',
        'view caching, and an OS-like overlay system — all without a framework.</p>',
        '<p>Full notes are available in <code>DEVELOPMENT_HISTORY.md</code>.</p>'
      ].join('')
    },
    journal: {
      label: 'journal',
      content: [
        '<p>Personal notes, thoughts, and observations from the artist.</p>',
        '<p>An ongoing log of the creative process, new discoveries, and late-night ideas.</p>',
        '<p>Entries are written in Markdown and rendered dynamically in the legacy journal page.</p>',
        '<p>Swipe up for more, or navigate using the item dots below.</p>'
      ].join('')
    }
  };

  function mount(itemId, container) {
    var item = ITEMS[itemId];
    if (!item) return;

    container.innerHTML =
      '<div class="spa-about-panel">' +
        '<div class="spa-sticky-header">' +
          '<span class="important-word">' + item.label + '</span>' +
        '</div>' +
        '<div class="spa-scroll-body">' +
          item.content +
        '</div>' +
      '</div>';
  }

  if (!window.__SPA_Views) window.__SPA_Views = {};
  window.__SPA_Views.about = {
    mount: mount
  };
}());
