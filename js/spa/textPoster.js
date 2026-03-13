// Text Poster Utility
// Renders a text label to an HTMLImageElement that can be sampled by
// ParticleCarouselEngine as a particle cloud source.
//
// Public API: window.__SPA_TextPoster.make(label, color?) → HTMLImageElement

(function (global) {
  'use strict';

  // Canvas size for the off-screen render.
  // Larger = more pixel-accurate particle cloud; 400×220 is a good balance.
  var W = 400;
  var H = 220;

  function make(label, color) {
    color = color || '#6dd9e8';

    var canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    var words   = label.split(' ');
    var maxLen  = words.reduce(function (m, w) { return Math.max(m, w.length); }, 0);
    var fontSize = Math.floor(Math.min(H * 0.32, W * 0.9 / (maxLen * 0.52)));
    fontSize = Math.max(22, Math.min(fontSize, 100));

    ctx.font         = 'italic 600 ' + fontSize + 'px "EB Garamond", Georgia, serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = color;
    ctx.shadowBlur   = 10;
    ctx.shadowColor  = color;

    if (words.length <= 1) {
      ctx.fillText(label, W / 2, H / 2);
    } else if (words.length === 2) {
      ctx.fillText(words[0], W / 2, H / 2 - fontSize * 0.62);
      ctx.fillText(words[1], W / 2, H / 2 + fontSize * 0.62);
    } else {
      var mid   = Math.ceil(words.length / 2);
      var line1 = words.slice(0, mid).join(' ');
      var line2 = words.slice(mid).join(' ');
      ctx.fillText(line1, W / 2, H / 2 - fontSize * 0.62);
      ctx.fillText(line2, W / 2, H / 2 + fontSize * 0.62);
    }

    var img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  global.__SPA_TextPoster = { make: make };
}(window));
