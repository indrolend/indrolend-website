// GIF Carousel Panel
// Wraps ParticleCarouselEngine into a reusable SPA component.
//
// Requires: gifler.min.js and particlecarousel.engine.js loaded before this file.
//
// Slide format:
//   {
//     label:  string,
//     gifSrc: string | null,   // URL for gifler idle playback; null = text/particle-only
//     img:    Image  | null,   // pre-rendered image (skips auto-loading from gifSrc)
//     href:   string | null,   // URL to open on tap; http(s) → new tab, /path → same tab
//     onTap:  function | null  // custom tap handler (overrides href)
//   }

(function (global) {
  'use strict';

  function GifCarouselPanel(slides) {
    var self = this;
    self.slides       = slides;
    self._currentIdx  = 0;
    self._engine      = null;
    self._initialized = false;

    // ── Container — absolute-fill inside #spa-view-host ───────────────────
    self.container = document.createElement('div');
    self.container.className = 'spa-carousel-host';
    self.container.style.display = 'none';

    // ── Particle canvas (full-viewport, filled by engine) ─────────────────
    self.particleCanvas = document.createElement('canvas');
    self.particleCanvas.className = 'spa-carousel-particle';

    // ── GIF canvas (centred, managed by gifler via the engine) ────────────
    self.gifCanvas = document.createElement('canvas');
    self.gifCanvas.className = 'spa-carousel-gif';

    self.container.appendChild(self.particleCanvas);
    self.container.appendChild(self.gifCanvas);

    // Milliseconds to debounce rapid clicks (prevents double-fire when both
    // gifCanvas and particleCanvas receive a pointer event simultaneously).
    var CLICK_DEBOUNCE_MS = 350;
    var clickPending      = false;

    function handleClick() {
      if (clickPending) return;
      clickPending = true;
      setTimeout(function () { clickPending = false; }, CLICK_DEBOUNCE_MS);

      var slide = self.slides[self._currentIdx];
      if (!slide) return;

      if (slide.onTap) {
        slide.onTap();
      } else if (slide.href) {
        // Internal paths (no protocol) → same tab; external → new tab
        if (slide.href.indexOf('://') !== -1) {
          window.open(slide.href, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = slide.href;
        }
      }
    }

    // GIF canvas click (visible during GIF idle)
    self.gifCanvas.addEventListener('click', handleClick);

    // Particle canvas click (visible for text-only slides or during transitions)
    self.particleCanvas.addEventListener('click', function () {
      // Only fire when the GIF canvas is not covering this area
      if (!self.gifCanvas.classList.contains('visible')) {
        handleClick();
      }
    });
  }

  // ── init ──────────────────────────────────────────────────────────────────
  // Called lazily on first show() so the engine only starts when needed.
  GifCarouselPanel.prototype.init = function () {
    if (this._initialized) return;
    if (typeof global.ParticleCarouselEngine === 'undefined') {
      console.warn('GifCarouselPanel: ParticleCarouselEngine not loaded');
      return;
    }
    if (typeof global.gifler === 'undefined') {
      console.warn('GifCarouselPanel: gifler not loaded');
      return;
    }

    this._initialized = true;
    var self = this;

    self._engine = new global.ParticleCarouselEngine({
      particleCanvas: self.particleCanvas,
      gifCanvas:      self.gifCanvas,
      onSlideChange:  function (info) {
        self._currentIdx = info.currentIdx;
      }
    });

    var total     = self.slides.length;
    var doneCount = 0;
    var slideObjs = new Array(total);

    self.slides.forEach(function (slide, i) {
      function onDone(img) {
        slideObjs[i] = { label: slide.label, img: img, gifSrc: slide.gifSrc || null };
        doneCount++;
        if (doneCount === total) {
          self._engine.setSlides(slideObjs);
        }
      }

      if (slide.img) {
        // Pre-rendered image (e.g. text poster via __SPA_TextPoster.make).
        // Data-URL images complete synchronously; guard with onload for safety.
        if (slide.img.complete) {
          onDone(slide.img);
        } else {
          slide.img.onload  = function () { onDone(slide.img); };
          slide.img.onerror = function () { onDone(slide.img); };
        }
      } else if (slide.gifSrc) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = function () { onDone(img); };
        img.onerror = function () { onDone(img); };
        img.src = slide.gifSrc;
      } else {
        // No image source — create a 1×1 transparent placeholder so the
        // slide count still reaches total and setSlides() is called.
        var blank = new Image(1, 1);
        onDone(blank);
      }
    });
  };

  // ── show / hide ───────────────────────────────────────────────────────────
  GifCarouselPanel.prototype.show = function () {
    this.container.style.display = 'block';
    if (!this._initialized) this.init();
  };

  GifCarouselPanel.prototype.hide = function () {
    this.container.style.display = 'none';
  };

  // ── goTo ──────────────────────────────────────────────────────────────────
  GifCarouselPanel.prototype.goTo = function (idx) {
    if (!this._engine) return;
    if (this._currentIdx === idx) return;
    this._engine.goTo(idx);
  };

  // ── getTransitionCanvas ───────────────────────────────────────────────────
  GifCarouselPanel.prototype.getTransitionCanvas = function () {
    if (this.gifCanvas.classList.contains('visible')) return this.gifCanvas;
    if (this.particleCanvas.style.visibility !== 'hidden') return this.particleCanvas;
    return null;
  };

  // ── destroy ───────────────────────────────────────────────────────────────
  GifCarouselPanel.prototype.destroy = function () {
    if (this._engine) { this._engine.destroy(); this._engine = null; }
    if (this.container.parentNode) this.container.parentNode.removeChild(this.container);
  };

  global.GifCarouselPanel = GifCarouselPanel;

}(window));
