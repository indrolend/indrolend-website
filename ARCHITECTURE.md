# Indrolend Website — Architecture

## Overview

`index.html` is the site entry point. It redirects to the **legacy MPA**
(`legacy/pages/home.html`), which is the current production default.

The **SPA** (`spa.html`) is available as a beta experience at its own URL. It
is not the default yet.

1. **Legacy MPA** — current default. `index.html` → `legacy/pages/home.html`.
   Traditional multi-page application; pages share CSS with the SPA.
2. **SPA (beta)** — accessible at `spa.html`. Single-page application built in
   vanilla JS without a framework. Hash-based routing, canvas-heavy views,
   fullscreen transition effects.

The `/legacy` directory holds the frozen MPA code. See [LEGACY.md](LEGACY.md)
for details.

This document covers SPA mode internals.

---

## SPA Layer Diagram

```
spa.html  (beta — open directly at /spa.html)
│
├── css/style.css          shared base styles
├── css/spa.css            SPA layout overrides
│
└── script load order (all deferred, execute in document order):
    │
    1. js/spa/engines/particle-clusters.js → window.__SPA_initParticleCluster
    2. js/spa/typography/importantWords.js → window.__SPA_ImportantWords
    3. js/spa/routes.js              → window.__INDROLEND_ROUTES__
    4. js/spa/transitionEngine.js    → window.__SPA_Transition
    5. js/spa/overlayManager.js      → window.__SPA_Overlay
    6. js/spa/views/idleView.js      → window.__SPA_Views.idle
    7. js/spa/views/sectionCarouselView.js → window.__SPA_Views.sectionCarousel
    8. js/spa/views/homeView.js      → window.__SPA_Views.home  (legacy; not in route map)
    9. js/spa/views/socialView.js    → window.__SPA_Views.social
   10. js/spa/views/musicView.js     → window.__SPA_Views.music
   11. js/spa/views/gamesView.js     → window.__SPA_Views.games
   12. js/spa/views/aboutView.js     → window.__SPA_Views.about
   13. js/spa/router.js              → window.__SPA_Router  (self-inits on DOMContentLoaded)
   14. js/spa/gestures.js            → window.__SPA_Gestures (self-inits on DOMContentLoaded)
```

---

## Intended Role Boundaries

| Term       | Meaning in this codebase                                     | Example files                     |
|------------|--------------------------------------------------------------|-----------------------------------|
| **route**  | URL state; the canonical description of sections and items   | `js/spa/routes.js`                |
| **view**   | Top-level SPA screen; one per route mode or section          | `js/spa/views/*View.js`           |
| **section**| Named group of items in the route map (horizontal axis)      | `social`, `music`, `games`, `about` |
| **item**   | A single navigable entry inside a section                    | `tiktok`, `spotify`, `asymptote`, `journal` |
| **engine** | Self-contained animation / behaviour system                  | `transitionEngine.js`, `js/spa/engines/particle-clusters.js` |
| **manager**| Shared app-level coordinator; one instance, global API       | `overlayManager.js`, `router.js`, `gestures.js` |
| **util**   | Pure helper with no side-effects                             | `importantWords.js` (mostly)      |
| **overlay**| Layered UI rendered above all views                         | managed by `overlayManager.js`    |
| **legacy** | Frozen MPA not loaded by the SPA                            | `legacy/js/engines/`, `legacy/pages/` |
| **demo**   | Showcase / prototype code not used in production            | `particlecarousel.demo.js`        |

---

## Route Model

`routes.js` is the single source of truth. It exports `window.__INDROLEND_ROUTES__`
with three shapes:

- `sectionOrder` — ordered array of section IDs (horizontal navigation axis)
- `sections` — map of `sectionId → { label, items[] }`
- `items` — map of `"sectionId/itemId" → { label, transitionSource, scroll, clickAction }`

The router and gestures manager both read this object. Views do **not** read it;
they receive their `itemId` from the router.

---

## SPA Navigation Modes

The router supports exactly three route shapes:

| Hash pattern | Mode | View rendered |
|---|---|---|
| `#/idle` | **idle** | `idleView` — pulsing cluster, tap to enter |
| `#/<sectionId>` | **section** | `sectionCarouselView` — full-screen hero word |
| `#/<sectionId>/<itemId>` | **item** | section view module (`socialView`, `musicView`, …) |

### Routing rules
- Empty / unknown hash → redirect to `#/idle`.
- `#/home` or `#/home/*` → redirect to `#/idle` (legacy route migration).
- Unknown section → redirect to `#/idle`.
- Known section + unknown item → redirect to `#/<sectionId>`.
- Deep links skip idle: `#/music/spotify` loads that item directly.

### Input mapping

#### Mobile (touch)
| Gesture | section mode | item mode | idle mode |
|---------|-------------|-----------|-----------|
| Swipe left | next section (wrap) | next item (wrap) | — |
| Swipe right | prev section (wrap) | prev item (wrap) | — |
| Tap hero word | drill to first item | — | — |
| Tap cluster | — | — | enter first section |

#### Desktop (keyboard)
| Key | section mode | item mode | idle mode |
|-----|-------------|-----------|-----------|
| ArrowRight | next section (wrap) | next item (wrap) | — |
| ArrowLeft | prev section (wrap) | prev item (wrap) | — |
| Space | drill to `#/<sectionId>/<firstItem>` | no-op | natural focus |
| Escape | close overlay (if open) | close overlay (if open) | close overlay (if open) |

Navigation keys are suppressed while an overlay is open (except Escape).

---

## Navigation Flow

```
User swipe / keyboard / tap
         │
         ▼
gestures.js  ──calls──►  router.js.__SPA_Router (nextSection / prevSection / nextItem / prevItem)
                                   │
                   ┌───────────────┼───────────────────┐
                   ▼               ▼                   ▼
          mountView()      onDeactivate(old)   window.location.hash
                   │               │                   │
                   ▼               ▼           hashchange event
         __SPA_Views[sid]  stops rAF / cleans          │
            .mount()        listeners (view)   handleHashChange()
                   │                                    │
                   ▼                                    ▼
         transitionEngine                      showView(mode, sid, iid)
            .transition()                             │
                   │                                   ▼
                   └────── done() ──────►  onActivate(new view)
                                               starts rAF / listeners
```

---

## View Lifecycle Contract

A view module registers itself on `window.__SPA_Views[key]` and may
implement any subset of these methods:

| Method                        | Called by  | Purpose                                         |
|-------------------------------|------------|-------------------------------------------------|
| `mount(itemId, containerEl)`  | router     | Build DOM once; cache element refs; create engines |
| `onActivate(itemId, viewEl)`  | router     | Start rAF loops; add per-view event listeners   |
| `onDeactivate(itemId)`        | router     | Stop rAF loops; remove per-view listeners       |
| `getTransitionCanvas(itemId)` | router     | Return a canvas the transition engine can sample |

Special views registered on non-section keys:
- `window.__SPA_Views.idle` — implements `mount` only; renders idle cluster
- `window.__SPA_Views.sectionCarousel` — implements `mount` only; renders hero word

Current status: `social` and `music` implement `mount` only (GIF posters, no
canvas animation). `games` and `about` implement `mount` only. `home` (legacy,
not in route map) implements all four.

---

## Key DOM IDs

| ID                       | Owner               | Purpose                                |
|--------------------------|---------------------|----------------------------------------|
| `#spa-view-host`         | router              | Container for all mounted views        |
| `#spa-transition-canvas` | transitionEngine    | Fullscreen overlay canvas for transitions |
| `#spa-back-btn`          | router / HTML       | Back button — visible in item mode only |
| `#spa-nav`               | router / HTML       | Section navigation bar (hidden via CSS) |
| `#spa-nav-sections`      | router              | Section link buttons (hidden via CSS)  |
| `#spa-item-nav`          | router              | Item indicator dots (hidden via CSS)   |
| `#spa-overlay-root`      | overlayManager      | OS-modal overlay mount point           |

---

## Legacy MPA (frozen, not loaded by spa.html)

The original MPA has been moved into `/legacy`. See [LEGACY.md](LEGACY.md) for
the full directory layout and access instructions.

| File                                          | Purpose                                           |
|-----------------------------------------------|---------------------------------------------------|
| `legacy/js/script.js`                         | Home page particles + fade-in, gallery, tictactoe |
| `legacy/js/engines/particle-transition-engine.js` | Legacy fullscreen particle transition (disabled) |
| `legacy/js/engines/genie-transition.js`       | Legacy Mac-genie CSS/canvas transition (not used) |
| `legacy/js/cursor-character-effect.js`        | Cursor character trail (MPA pages)                |
| `legacy/js/spotify-analytics.js`             | Spotify analytics page                            |
| `legacy/js/spotify-analytics-data.js`        | Spotify analytics static data                     |
| `legacy/js/spotify-integration.js`           | Spotify API integration layer                     |
| `legacy/js/spotify-artists-stats.js`         | Spotify artist statistics                         |
| `legacy/js/discography.js`                   | Discography page renderer                         |
| `legacy/js/dev-history.js`                   | Development history page renderer                 |
| `legacy/js/journal.js`                       | Journal page renderer                             |
| `legacy/js/easter-egg.js`                    | Easter egg interaction                            |
| `legacy/js/security-utils.js`               | Input sanitisation utilities                      |
