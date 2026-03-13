# Indrolend Website — Architecture

## Overview

The site ships as two parallel delivery modes:

1. **SPA mode** — entry point `spa.html`. A single-page application built in
   vanilla JS without a framework. Hash-based routing, canvas-heavy views,
   fullscreen transition effects.
2. **MPA mode** — traditional multi-page `index.html` plus sub-pages under
   `pages/`. These pages share CSS with the SPA but load their own scripts.

This document covers SPA mode. MPA mode scripts in `/js` are treated as
separate concerns and are summarised briefly at the end.

---

## SPA Layer Diagram

```
spa.html
│
├── css/style.css          shared base styles
├── css/spa.css            SPA layout overrides
│
└── script load order (all deferred, execute in document order):
    │
    1. js/particle-clusters.js       → window.__SPA_initParticleCluster
    2. js/spa/typography/importantWords.js → window.__SPA_ImportantWords
    3. js/spa/routes.js              → window.__INDROLEND_ROUTES__
    4. js/spa/transitionEngine.js    → window.__SPA_Transition
    5. js/spa/overlayManager.js      → window.__SPA_Overlay
    6. js/spa/views/homeView.js      → window.__SPA_Views.home
    7. js/spa/views/socialView.js    → window.__SPA_Views.social
    8. js/spa/views/musicView.js     → window.__SPA_Views.music
    9. js/spa/views/gamesView.js     → window.__SPA_Views.games
   10. js/spa/views/aboutView.js     → window.__SPA_Views.about
   11. js/spa/router.js              → window.__SPA_Router  (self-inits on DOMContentLoaded)
   12. js/spa/gestures.js            → window.__SPA_Gestures (self-inits on DOMContentLoaded)
```

---

## Intended Role Boundaries

| Term       | Meaning in this codebase                                     | Example files                     |
|------------|--------------------------------------------------------------|-----------------------------------|
| **route**  | URL state; the canonical description of sections and items   | `js/spa/routes.js`                |
| **view**   | Top-level SPA screen; one per section in the route map       | `js/spa/views/*View.js`           |
| **section**| Named group of items in the route map (horizontal axis)      | `home`, `social`, `music`, etc.   |
| **item**   | A single navigable entry inside a section (vertical axis)    | `swarm`, `tiktok`, `spotify`, …   |
| **engine** | Self-contained animation / behaviour system                  | `transitionEngine.js`, `particle-clusters.js` |
| **manager**| Shared app-level coordinator; one instance, global API       | `overlayManager.js`, `router.js`, `gestures.js` |
| **util**   | Pure helper with no side-effects                             | `importantWords.js` (mostly)      |
| **overlay**| Layered UI rendered above all views                         | managed by `overlayManager.js`    |
| **legacy** | Old / superseded code not loaded by the SPA                 | `js/particle-transition-engine.js`, `js/genie-transition.js` |
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

## Navigation Flow

```
User swipe / tap link
        │
        ▼
gestures.js  ──calls──►  router.js.__SPA_Router.go(sectionId, itemId)
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
         transitionEngine                      showView(sid, iid)
            .transition()                             │
                  │                                   ▼
                  └────── done() ──────►  onActivate(new view)
                                              starts rAF / listeners
```

---

## View Lifecycle Contract

A view module registers itself on `window.__SPA_Views[sectionId]` and may
implement any subset of these methods:

| Method                        | Called by  | Purpose                                         |
|-------------------------------|------------|-------------------------------------------------|
| `mount(itemId, containerEl)`  | router     | Build DOM once; cache element refs; create engines |
| `onActivate(itemId, viewEl)`  | router     | Start rAF loops; add per-view event listeners   |
| `onDeactivate(itemId)`        | router     | Stop rAF loops; remove per-view listeners       |
| `getTransitionCanvas(itemId)` | router     | Return a canvas the transition engine can sample |

Current status: `home` implements all four. `social` and `music` implement
`mount`, `onActivate`, and `getTransitionCanvas`. `games` and `about` implement
`mount` only.

---

## Key DOM IDs

| ID                       | Owner               | Purpose                                |
|--------------------------|---------------------|----------------------------------------|
| `#spa-view-host`         | router              | Container for all mounted views        |
| `#spa-transition-canvas` | transitionEngine    | Fullscreen overlay canvas for transitions |
| `#spa-nav`               | router / HTML       | Section navigation bar                 |
| `#spa-nav-sections`      | router              | Section link buttons                   |
| `#spa-item-nav`          | router              | Item indicator dots                    |
| `#spa-overlay-root`      | overlayManager      | OS-modal overlay mount point           |

---

## MPA / Legacy Scripts (not loaded by spa.html)

These files live in `/js` but are loaded only by MPA pages:

| File                           | Purpose                                           |
|--------------------------------|---------------------------------------------------|
| `js/script.js`                 | Home page particles + fade-in (MPA home)          |
| `js/particle-transition-engine.js` | Legacy fullscreen particle transition (disabled) |
| `js/genie-transition.js`       | Legacy Mac-genie CSS/canvas transition (not used) |
| `js/cursor-character-effect.js`| Cursor character trail (MPA pages)                |
| `js/spotify-analytics.js`      | Spotify analytics page                            |
| `js/spotify-analytics-data.js` | Spotify analytics static data                     |
| `js/spotify-integration.js`    | Spotify API integration layer                     |
| `js/spotify-artists-stats.js`  | Spotify artist statistics                         |
| `js/discography.js`            | Discography page renderer                         |
| `js/dev-history.js`            | Development history page renderer                 |
| `js/journal.js`                | Journal page renderer                             |
| `js/easter-egg.js`             | Easter egg interaction                            |
| `js/security-utils.js`         | Input sanitisation utilities                      |
