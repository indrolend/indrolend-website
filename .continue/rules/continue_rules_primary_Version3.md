# Copilot Instructions

## Project
Vanilla JS SPA with frozen legacy MPA. No framework or build system.  
SPA runtime: `spa.html` → `js/spa/`  
Legacy entrypoint: `index.html` → `legacy/pages/home.html`  
**Rules:** New features go in SPA only. Legacy accepts bug fixes only. Do not migrate legacy pages unless explicitly requested.

## Primary Design Rule
**Behavior before architecture.**  
Do not rename systems, reorganize folders, or introduce abstractions unless the current structure prevents implementing a specific behavior. Before refactoring identify: visible behavior improvement, confusion removed, future work made easier. If unclear avoid refactoring and prefer documentation.

## Repo Mental Model
- Treat SPA as lightweight runtime application.
- `js/spa/**` = application runtime (navigation, views, engines, managers)
- `assets/`, `images/`, `data/` = static resources not runtime code
- `external/` = third-party intake staging
- Do not place vendor libraries inside `js/spa/`.

## Vocabulary
- **route**: URL state defined in `js/spa/routes.js`
- **view**: top-level SPA screen (`js/spa/views/*View.js`), not “pages”
- **section**: horizontal nav group (`home`, `social`, `music`, `games`, `about`)
- **item**: vertical nav entry (`spotify`, `tiktok`, etc.)
- **engine**: self-contained animation/behavior system
- **manager**: shared coordinator (`router`, `overlay`, `gestures`)
- **overlay**: UI layer above views
- **component**: reusable UI fragment
- **util**: pure helper (no DOM or global state)
- **legacy**: frozen MPA under `legacy/`
- **demo**: prototype not used in production

## System Layers
- **Interface**: views, components, overlays
- **Navigation**: router + routes
- **Behavior**: engines, gestures, managers
- **Data**: APIs, parsed JSON, scripts
Respect boundaries between layers.

## Script Load Order (spa.html)
Do **not** reorder without discussion.
1. particle-clusters.js → `window.__SPA_initParticleCluster`
2. importantWords.js → `window.__SPA_ImportantWords`
3. routes.js → `window.__INDROLEND_ROUTES__`
4. transitionEngine.js → `window.__SPA_Transition`
5. overlayManager.js → `window.__SPA_Overlay`
6. views/\*View.js → `window.__SPA_Views.*`
7. router.js → `window.__SPA_Router` (self-init)
8. gestures.js → `window.__SPA_Gestures` (self-init)

## Route Model
- `js/spa/routes.js` is single source of truth.
- Views must NOT read it directly; router passes `itemId` to views.
- Avoid duplicating route logic elsewhere.

## View Lifecycle Contract
- `mount(itemId, containerEl)`: build DOM once, cache refs, create engines.
- `onActivate(itemId, viewEl)`: start rAF loops, add listeners.
- `onDeactivate(itemId)`: cancel rAF loops, remove listeners, clear intervals/timeouts.
- Hidden views must not continue running work.

## SPA Lifecycle Checklist
- Listeners added in `onActivate` are removed in `onDeactivate`
- rAF loops cancelled, intervals/timeouts cleared
- Hidden views idle; no stale state between routes

## Refactoring Policy
- Prefer small behavior changes over structural rewrites.
- Before refactoring, list affected files, behavior risk, rollback plan.
- If moving files, update references: HTML script tags, router refs, CSS links, global window bindings.

## System Stability Rules
- **DO NOT CHANGE without discussion:**  
  - `index.html` redirect shim  
  - section/item IDs in routes.js  
  - anything inside `legacy/`  
  - `data/parsed-stats.json`

## Working Style
- Direct and concise.
- Make smallest useful change.
- Preserve behavior unless redesign requested.
- Avoid new abstractions unless repetition demands it.
- Ask 2–5 focused questions if requirements unclear.

## Project Philosophy
- Prioritize interesting interactive behavior, creative exploration, and simple understandable architecture.
- Not intended to imitate large frameworks.
- Favor working behavior and clarity over structural perfection.