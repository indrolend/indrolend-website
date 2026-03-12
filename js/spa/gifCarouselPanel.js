// GIF Carousel Panel
// Wraps ParticleCarouselEngine into a reusable SPA component.
//
// Requires: gifler.min.js and particlecarousel.engine.js loaded before this file.
//
// Usage:
//   var panel = new GifCarouselPanel(slides);
//   document.getElementById('spa-view-host').appendChild(panel.container);
//   panel.show();
//   panel.goTo(1);
//
// slides: Array of { label: string, gifSrc: string, href: string|null }

(function (global) {
  'use strict';

  function GifCarouselPanel(slides) {
    var self = this;
    self.slides       = slides;   // [{label, gifSrc, href}]
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

    // ── Click GIF → open external href ────────────────────────────────────
    self.gifCanvas.addEventListener('click', function () {
      var slide = self.slides[self._currentIdx];
      if (slide && slide.href) {
        window.open(slide.href, '_blank', 'noopener,noreferrer');
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
        // Track the engine's current slide so goTo() can prevent no-op animations.
        self._currentIdx = info.currentIdx;
      }
    });

    // Preload all GIF sources as HTMLImageElement objects, then call setSlides.
    // ParticleCarouselEngine.setSlides() samples each img immediately, so the
    // images must be fully loaded before the call.
    var total      = self.slides.length;
    var doneCount  = 0;
    var slideObjs  = new Array(total);

    self.slides.forEach(function (slide, i) {
      var img = new Image();
      img.crossOrigin = 'anonymous';

      function onDone() {
        // Include the slide even if onerror fires so the count always reaches total.
        slideObjs[i] = { label: slide.label, img: img, gifSrc: slide.gifSrc };
        doneCount++;
        if (doneCount === total) {
          self._engine.setSlides(slideObjs);
        }
      }

      img.onload  = onDone;
      img.onerror = onDone;
      img.src     = slide.gifSrc;
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
  // Navigate to a slide by index.  No-ops when already on that slide.
  GifCarouselPanel.prototype.goTo = function (idx) {
    if (!this._engine) return;
    if (this._currentIdx === idx) return;
    this._engine.goTo(idx);
  };

  // ── getTransitionCanvas ───────────────────────────────────────────────────
  // Returns the best available canvas for the SPA section-level transition engine
  // to sample particles from.
  GifCarouselPanel.prototype.getTransitionCanvas = function () {
    // GIF canvas is the visible source during idle (gifler is playing).
    if (this.gifCanvas.classList.contains('visible')) return this.gifCanvas;
    // Particle canvas is visible during a particle transition.
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
