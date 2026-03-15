# Copilot Instructions

## Project

Vanilla JS SPA + frozen legacy MPA. No framework, no build system.

- **SPA (primary, beta):** `spa.html` → `js/spa/`
- **Legacy MPA (frozen):** `index.html` → `legacy/pages/home.html`

New features go in the SPA only. Legacy accepts bug fixes only.

---

## Vocabulary

| Term | Meaning | Location |
|------|---------|----------|
| **route** | URL state (hash) | `js/spa/routes.js` |
| **view** | Top-level SPA screen (one per section) | `js/spa/views/*View.js` |
| **section** | Named group on the horizontal nav axis | `home`, `social`, `music`, `games`, `about` |
| **item** | A single entry on the vertical nav axis | `spotify`, `tiktok`, `swarm`, … |
| **engine** | Self-contained animation/behaviour system | `transitionEngine.js`, `particle-clusters.js` |
| **manager** | Shared app-level coordinator, one instance | `router.js`, `overlayManager.js`, `gestures.js` |
| **overlay** | Layered UI above all views | `overlayManager.js` |
| **component** | Reusable UI fragment | — |
| **util** | Pure helper, no DOM, no global state | `importantWords.js` |
| **legacy** | Frozen MPA under `/legacy` — not just "old" | `legacy/` |
| **demo** | Prototype not used in production | — |

Do not call SPA views "pages" — "pages" refers to the legacy MPA (`legacy/pages/`).

---

## Architecture

### Script load order (`spa.html`)

```
1. js/spa/engines/particle-clusters.js  → window.__SPA_initParticleCluster
2. js/spa/typography/importantWords.js  → window.__SPA_ImportantWords
3. js/spa/routes.js                     → window.__INDROLEND_ROUTES__
4. js/spa/transitionEngine.js           → window.__SPA_Transition
5. js/spa/overlayManager.js             → window.__SPA_Overlay
6. js/spa/views/homeView.js             → window.__SPA_Views.home
7. js/spa/views/socialView.js           → window.__SPA_Views.social
8. js/spa/views/musicView.js            → window.__SPA_Views.music
9. js/spa/views/gamesView.js            → window.__SPA_Views.games
10. js/spa/views/aboutView.js           → window.__SPA_Views.about
11. js/spa/router.js                    → window.__SPA_Router  (self-inits)
12. js/spa/gestures.js                  → window.__SPA_Gestures (self-inits)
```

### Route model

`js/spa/routes.js` is the **single source of truth**. Views do not read it; they receive `itemId` from the router.

### View lifecycle contract

| Method | Responsibility |
|--------|----------------|
| `mount(itemId, containerEl)` | Build DOM once; cache refs; create engines |
| `onActivate(itemId, viewEl)` | Start rAF loops; add event listeners |
| `onDeactivate(itemId)` | **Stop rAF loops; remove listeners** — mandatory cleanup |
| `getTransitionCanvas(itemId)` | Return canvas for transition sampler |

### Key DOM IDs

| ID | Owner |
|----|-------|
| `#spa-view-host` | router — container for mounted views |
| `#spa-transition-canvas` | transitionEngine — fullscreen overlay |
| `#spa-nav` / `#spa-nav-sections` | router — section nav bar |
| `#spa-item-nav` | router — item indicator dots |
| `#spa-overlay-root` | overlayManager |

---

## Operating style

- Be direct and concise. No motivational commentary.
- Prefer the smallest useful change. Preserve behavior unless redesign is requested.
- Do not introduce abstractions, patterns, or dependencies not already present.
- When requirements are ambiguous, state your assumptions explicitly and offer the most conservative interpretation before proposing a change.

---

## SPA lifecycle — check these first

- Event listeners added in `onActivate` removed in `onDeactivate`
- `requestAnimationFrame` loops cancelled on deactivate
- `setInterval` / `setTimeout` cleared on deactivate
- Hidden views not running rAF or interval work
- No stale state leaking between route changes
- Canvas contexts properly reset between transitions

---

## Before any refactor

List: affected files · behavior risk · rollback plan.
Prefer changes reviewable as one small PR.
When moving files, identify all references first: HTML script tags, routes, CSS links.

---

## Boundaries

| Layer | Rule |
|-------|------|
| views | Own route-level behavior and lifecycle only |
| engines | Own animation/behavior; expose `init` + `cleanup` |
| managers | Coordinate shared systems; one global instance |
| utils | Pure functions — no DOM, no global state |
| demo code | Must not live inside canonical engine files |

---

## Do not change without explicit discussion

- `index.html` redirect shim
- Section/item IDs in `js/spa/routes.js`
- Anything under `legacy/` beyond isolated bug fixes
- `data/parsed-stats.json` (written by automation)
