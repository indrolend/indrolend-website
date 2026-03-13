# Diagnostic Review — Indrolend Website SPA

> **Style note:** This document is a direct, factual assessment of the codebase
> as of the review date. No padding, no politeness tax. Where code is good, it
> says so. Where code is risky, it says why. Vocabulary follows the project
> glossary at the bottom of this file.

---

## Table of Contents

1. [What's Great](#1-whats-great)
2. [What's Risky / Bad / Ugly](#2-whats-risky--bad--ugly)
3. [Naming and Organisation Issues](#3-naming-and-organisation-issues)
4. [Lifecycle Risks](#4-lifecycle-risks)
5. [Legacy Systems Inventory](#5-legacy-systems-inventory)
6. [Deductive Questions for the Author](#6-deductive-questions-for-the-author)
7. [Globals Glossary](#7-globals-glossary)
8. [Responsibility → File Index](#8-responsibility--file-index)
9. [Smallest Useful Refactor Plan](#9-smallest-useful-refactor-plan)

---

## 1. What's Great

### Script load order is documented and correct
`spa.html` lines 32–42 contain a numbered comment that lists every deferred
script, what global it produces, and the dependency it satisfies. This is
precisely what a new maintainer needs. It is the best part of the SPA shell.

### Route map is the single source of truth
`js/spa/routes.js` defines `window.__INDROLEND_ROUTES__` with three clearly
named shapes: `sectionOrder`, `sections`, and `items`. Every navigation
decision—section order, item metadata, scroll behaviour—is readable from one
file. The router and gesture manager both consume this object; views do not
(they receive their data from the router). This is the correct separation.

### View lifecycle is partially implemented and the router enforces it
`router.js` calls `__SPA_Views[sectionId].onDeactivate(itemId)` before
transitioning away and `onActivate(itemId, viewEl)` after the transition
completes. The home view honours both and stops/starts its rAF loop
accordingly. This is the correct pattern. Most SPA codebases built without a
framework skip this entirely.

### Transition engine is intentionally minimal and honest about it
`js/spa/transitionEngine.js` is 115 lines. It does one thing: fade-to-black,
optionally scatter some sampled pixels, fade-from-black, call `done()`. The
comment says "Phase 1", which is an accurate description of scope rather than
aspirational naming. The engine makes no attempt to do more than it can
reliably do.

### Overlay manager cleans up after itself
`overlayManager.js` adds a backdrop-click listener (`root.addEventListener`)
in `open()` and removes it with `root.removeEventListener` in `close()`.
This is correct and explicit. A common mistake is to add the listener once in
init and rely on event propagation; this approach avoids that.

### Particle cluster uses IntersectionObserver for visibility gating
`js/particle-clusters.js` lines 197–209 use an `IntersectionObserver` to
pause the rAF loop when the canvas exits the viewport. This is the right
primitive for canvas-in-scroll-page scenarios. It prevents off-screen canvases
from burning CPU.

### Double-init guard on `__SPA_initParticleCluster`
`js/particle-clusters.js` lines 267–273: the SPA-dynamic init wrapper checks
`canvas.dataset.clusterInit` before running and sets it on first call. This
prevents social/music views from re-initialising a particle cluster on every
`onActivate` call.

### SoundCloud btn listener is attached once at mount time
`musicView.js` line 52: the click listener on `.spa-soundcloud-btn` is added
inside `mount()`, which runs once per itemId for the lifetime of the SPA. No
duplicate listeners accumulate.

---

## 2. What's Risky / Bad / Ugly

### `routes.js` `clickAction` field is entirely unused by the SPA router
`routes.js` items define `clickAction` values such as `'https://...'`,
`'overlay:soundcloudArchiveMenu'`, `'none'`, and `'asymptote/index.html'`.
The router never reads `clickAction`. Views that handle clicks (musicView,
gamesView) hardcode their own URLs and overlay IDs internally. The field is
dead data that creates the false impression it drives navigation behaviour.

Evidence:
- `router.js` — no reference to `clickAction`
- `musicView.js` line 10: `overlay: 'soundcloudArchiveMenu'` is its own META
  field, not read from routes
- `gamesView.js` line 12: `href="asymptote/index.html"` is hardcoded in the
  HTML string

**Risk:** A maintainer will edit `routes.js` `clickAction` expecting it to
change behaviour. It will not.

### `transitionEngine.js` has no reentry guard
`js/spa/transitionEngine.js` lines 51–110: calling `transition()` while a
previous call is still running starts a second `requestAnimationFrame` loop.
Both loops write to the same canvas. The `router.js` sets `transitioning = true`
and checks it in `navigate()` (line 137), which partially guards against this,
but the `hashchange` handler (line 250) also calls `showView()` which calls the
transition. A rapid back/forward navigation (browser back button + swipe in
the same frame) can bypass the flag.

**Risk:** Overlapping rAF loops on the transition canvas produce visual
corruption and leave the canvas permanently visible if one loop ends before the
other sets `display: none`.

### `particle-clusters.js` leaks a resize listener per canvas
`js/particle-clusters.js` lines 231–237: every call to `initParticleCluster`
adds a new `window.addEventListener('resize', ...)` with its own debounce
timeout. The returned cleanup function (lines 244–253) does **not** remove the
resize listener. The SPA loads social (3 canvases) and music (3 canvases) =
6 calls to `initParticleCluster` = 6 permanent resize listeners. Each triggers
`resizeCanvas()` and `initParticles()` for its canvas every time the window
resizes.

**Risk:** Accumulating resize listeners. Mild in practice (6 lightweight
callbacks), but if views are ever destroyed and remounted the count grows
unbounded.

### `homeView.js` mouse and resize listeners are never cleaned up
`js/spa/views/homeView.js` lines 139–151: `mount()` adds `mousemove`,
`mouseleave`, and `window.resize` listeners directly to the canvas and `window`.
None of these are removed in `onDeactivate()`. `onDeactivate()` (line 158)
only cancels the rAF loop.

**Risk:** When homeView is deactivated, mouse movement anywhere on the page
still calls the repulsion physics update on `particles[]`. This is wasted
computation every `mousemove` event, even with the social/music/games view
visible.

### `importantWords.js` starts a global `setInterval` that never stops
`js/spa/typography/importantWords.js` lines 62–77: `startCycling()` calls
`setInterval(..., 400)` and sets `cyclingStarted = true` to prevent a second
call. The interval is not stored in a variable and cannot be cancelled. It runs
for the entire browser session cycling font variants across all accumulated
`allLetterSpans`.

**Risk:** The interval accumulates spans from every overlay open/close cycle
(each `open()` call pushes new spans into `allLetterSpans`). After many
navigations, the interval cycles an ever-growing array. There is no cap.

### `overlayManager.js` hardcodes SoundCloud data inside the manager
`js/spa/overlayManager.js` lines 14–19: `SOUNDCLOUD_YEARS` (external URLs +
display labels) is embedded in the overlay manager file. The overlay manager
is an architectural manager; content data belongs in `routes.js` or a
dedicated data file.

**Risk:** Adding a second archive year or changing a URL requires editing the
manager file, not the route/data file where a maintainer would logically look.

### `updateItemDots()` rebuilds the DOM every navigation
`js/spa/router.js` lines 227–244: `updateItemDots()` sets `itemNavEl.innerHTML = ''`
and creates new `<button>` elements with new `addEventListener('click', ...)` 
callbacks on every route change. For a 4-item section navigated to 10 times,
that's 40 button elements created and discarded, each with a closure. The GC
handles it, but the pattern scales poorly and is unnecessary.

### `aboutView.js` renders only placeholder text — content scripts are not loaded
`js/spa/views/aboutView.js` renders a `<span class="important-word">` label
and nothing else. The actual about-section content lives in MPA-only scripts:
`js/discography.js`, `js/dev-history.js`, `js/journal.js`,
`js/spotify-analytics.js`. None of these are loaded by `spa.html`. The about
section in the SPA is currently four empty panels with a label.

### `gestures.js` captures `startScrollTop` and never uses it
`js/spa/gestures.js` line 14: `var startScrollTop = 0;` is declared. Line 55:
it is assigned in `onTouchStart`. It is never read in `onTouchEnd` or anywhere
else. The edge-gating logic uses `isAtScrollTop(scrollBody)` which reads
`scrollBody.scrollTop` directly at end-time, not the captured start value.

**Risk:** Dead variable. Not dangerous, but misleading to any maintainer who
assumes it is used.

---

## 3. Naming and Organisation Issues

### `particle-clusters.js` is not in the SPA directory but is SPA-critical
`js/particle-clusters.js` lives alongside legacy MPA scripts. It is **only**
loaded by `spa.html` and serves a pure SPA purpose (particle cluster canvases
for social/music views). Its correct home is `js/spa/` or
`js/spa/engines/particleClusters.js`.

### `importantWords.js` is named and filed as a typography util but has engine behaviour
The `setInterval` loop in `importantWords.js` makes it an engine (it runs
continuously and manages state). Its current location
(`js/spa/typography/importantWords.js`) suggests it is a passive formatter. The
directory is fine; the file needs a `startCycling` / `stopCycling` API to match
its actual behaviour.

### View files do not follow a consistent lifecycle API shape
`home` exposes: `mount`, `onActivate`, `onDeactivate`, `getTransitionCanvas`.  
`social` and `music` expose: `mount`, `onActivate`, `getTransitionCanvas`.  
`games` and `about` expose: `mount` only.

The router checks for method existence before calling (`typeof ... === 'function'`),
which is safe. But the inconsistency means a reader cannot know what lifecycle
a view supports without opening each file. A documented contract or at minimum a
comment at the top of each view file stating which lifecycle methods it implements
would help.

### `clickAction` string protocol is undocumented and inconsistent
`routes.js` items use `clickAction` values in three formats:
- Absolute URL: `'https://...'`
- Named overlay: `'overlay:soundcloudArchiveMenu'`
- Sentinel: `'none'`
- Relative path: `'asymptote/index.html'` (no `overlay:` prefix, not absolute)

There is no parser for this field anywhere in the SPA. The field exists in the
route data but drives nothing. Until it is either deleted or wired up, it should
have a comment stating its current status.

### `__SPA_initParticleCluster` function name is long and inconsistent
All other globals follow `__SPA_<CapitalName>` (e.g. `__SPA_Router`,
`__SPA_Overlay`). The particle cluster init function is all-lowercase after the
prefix and reads as a verb, not a namespace object. A consistent name would be
`window.__SPA_ParticleClusters` with a `.init(canvas, platform)` method.

---

## 4. Lifecycle Risks

### Hidden view doing work: `homeView.js` mousemove listener
- **What runs:** `update()` physics (repulsion calculation) on every
  `mousemove` event on `#spa-home-canvas`.
- **When it runs:** Even when homeView is deactivated and hidden.
- **How to stop it:** Move listener attachment from `mount()` to `onActivate()`
  and listener removal to `onDeactivate()`.
- **File/lines:** `homeView.js` lines 139–146.

### Hidden view doing work: `homeView.js` resize listener
- **What runs:** `resizeCanvas()` and `initParticles()` (full particle reset).
- **When it runs:** On every window resize, even when homeView is not visible.
- **How to stop it:** Same fix as above: move to activate/deactivate.
- **File/lines:** `homeView.js` lines 148–151.

### Unbounded rAF possible on rapid navigation: `transitionEngine.js`
- **What runs:** A second `requestAnimationFrame` loop starts on the transition
  canvas if `transition()` is called before the previous call's `done()` fires.
- **How to stop it:** Add `var inFlight = false` at module scope. Set it `true`
  at the start of `transition()`, and back to `false` just before calling
  `done()`. If `inFlight` is true on entry, either return immediately or cancel
  the previous loop first.
- **File/lines:** `transitionEngine.js` lines 51–110.

### Growing `setInterval` payload: `importantWords.js`
- **What runs:** Every 400 ms, 15% of `allLetterSpans` get new font variants.
- **When it grows:** Every call to `__SPA_ImportantWords.init(root)` (overlay
  open, view mount) pushes new `<span>` elements into `allLetterSpans`. There
  is no pruning.
- **How to stop it:** Either cap `allLetterSpans` at a fixed size, or prune
  spans belonging to elements no longer in the DOM on each interval tick.
- **File/lines:** `importantWords.js` lines 51–77.

### Particle cluster resize listeners accumulate
- **What runs:** `resizeCanvas()` + `initParticles()` on each canvas per
  resize event.
- **How it grows:** Each `initParticleCluster()` call adds one resize listener
  to `window`. The cleanup function returned does not remove it.
- **How to stop it:** Store the resize handler reference and add it to the
  returned cleanup function.
- **File/lines:** `particle-clusters.js` lines 231–237, 244–253.

### `gestures.js` touch listeners are permanent
- **What runs:** Every touch event on the document.
- **Acceptable?** Yes, for a whole-app gesture manager that is intentionally
  always active. Unlike view-specific listeners, this is app-level behaviour.
  The risk is only if `init()` is called more than once (it would double-bind
  the handlers). The `DOMContentLoaded` guard prevents this but there is no
  explicit "already initialised" flag.

---

## 5. Legacy Systems Inventory

These files exist in the repository but are **not loaded by `spa.html`** and
appear unused by the SPA.

### `js/particle-transition-engine.js` — legacy engine
- **What it is:** A full-featured particle transition engine (664 lines) with
  dispersal, morph, and fade phases, FPS throttling, mobile detection, and
  per-page custom behaviours.
- **Why it is legacy:** `js/script.js` lines 2–8 contain a commented-out call
  to initialise it: `// Disabled: particle transitions were slow and buggy`.
  The SPA uses the simpler `js/spa/transitionEngine.js` (115 lines) instead.
- **Is it called anywhere?** Not by `spa.html`. `script.js` references
  `window.ParticleTransitionEngine` but that call is commented out.
- **Ownership risk:** The engine adds `window.addEventListener('resize', ...)`
  in its constructor (line 146) and never provides a public `destroy()` method
  to remove it. If an instance were created and then abandoned, the resize
  listener would be permanently attached.
- **Recommendation:** Move to a `legacy/` directory or delete if no plan to
  revive it.

### `js/genie-transition.js` — legacy engine
- **What it is:** A Mac-genie canvas effect (sliced canvas animation sucked
  into a button target).
- **Why it is legacy:** Not loaded by any file visible in the SPA shell. No
  reference in `spa.html` or any SPA module.
- **Recommendation:** Move to `legacy/` or delete.

### `js/cursor-character-effect.js` — MPA-only component
- **What it is:** A cursor trail that spawns character elements following the
  mouse.
- **Loaded by:** MPA pages only. Not in `spa.html`.
- **Status:** Not legacy; it is active MPA code. It is listed here only because
  it is not part of the SPA.

### `js/script.js` — MPA home page script
- **What it is:** The entry script for the MPA home page. Contains the same
  character-particle canvas logic as `homeView.js` (duplicated implementation).
- **Duplication risk:** `homeView.js` and `script.js` maintain two independent
  implementations of the same particle physics (same constants: `MAX_SPEED =
  0.6`, `PARTICLE_COUNT = 60`, `CONNECTION_DIST = 120`, `REPULSE_DIST = 150`,
  same character pool). Any change to one is not reflected in the other.
- **Recommendation:** Extract the shared particle logic into
  `js/spa/engines/characterParticles.js` and have both consumers import it.
  This is the highest-value deduplication in the codebase.

### `js/discography.js`, `js/dev-history.js`, `js/journal.js`, `js/spotify-analytics.js`
- **What they are:** Content renderers for MPA about-section pages.
- **SPA status:** The about view in the SPA (`aboutView.js`) renders only
  placeholder labels. These scripts are not wired to the SPA.
- **Risk:** Users navigating to `#/about/discography` in the SPA see an empty
  panel. This is the largest functional gap in the current SPA.

---

## 6. Deductive Questions for the Author

These questions require reading the production behaviour, not just the code.
They are listed in order of impact.

**Q1.** `routes.js` defines `clickAction` for every item, but no SPA module
reads it. Is `clickAction` intended to drive navigation in a future router
version, or is it leftover from an earlier design? If future: document the
planned API. If leftover: delete it.

**Q2.** The about section (spotifyAnalytics, discography, devHistory, journal)
renders only a title label in the SPA. The actual content lives in MPA scripts
that are not loaded. Is the plan to port those scripts to SPA views, embed the
MPA pages in iframes, or link out to the MPA pages? The answer determines
whether `aboutView.js` stays as-is or needs a major expansion.

**Q3.** `homeView.js` `mount()` is called once per session. Is `mount()` ever
expected to be called more than once (e.g., if the router were extended to
support unmounting/remounting views)? If not, the permanent event listeners in
`mount()` are acceptable but should be documented as intentional. If yes, they
are a bug.

**Q4.** `transitionEngine.js` is called "Phase 1" in its file header. Is there
a Phase 2 design? Is the intent to eventually port `js/particle-transition-engine.js`
behaviour into the SPA's transition engine, or is the simple fade-to-black
treatment the permanent design?

**Q5.** `particle-clusters.js` is loaded by `spa.html` but lives in `/js`
alongside MPA scripts. Is it also loaded by any MPA page? If yes, the current
location makes sense. If the SPA is its only consumer, it belongs in
`js/spa/`.

**Q6.** `importantWords.js` accumulates all spans from every view mount and
overlay open into a single global array. As more views and overlays are added,
the interval processes more spans per tick. At what point does this become
noticeable? Have you benchmarked it with all 13 items mounted simultaneously?

**Q7.** `overlayManager.js` supports only one overlay (`soundcloudArchiveMenu`).
Is it designed to support multiple concurrent overlays, or is the assumption
that only one can be open at a time? The current `open()` function overwrites
`root.innerHTML` unconditionally, which destroys any existing overlay. If
concurrent overlays are ever needed, this must change.

**Q8.** `gestures.js` handles touch events only. Is there a plan to support
keyboard navigation (left/right/up/down arrow keys) for section/item
navigation? If yes, gestures.js is the right place to add it. If no, document
that keyboard navigation is explicitly out of scope.

---

## 7. Globals Glossary

These are the `window.*` properties defined or consumed by the SPA. Any script
loaded after `spa.html`'s deferred block can read them.

| Global                         | Defined in                        | Type    | Description |
|-------------------------------|-----------------------------------|---------|-------------|
| `__INDROLEND_ROUTES__`        | `js/spa/routes.js`                | Object  | Canonical route map: `sectionOrder`, `sections`, `items` |
| `__SPA_Router`                | `js/spa/router.js`                | Object  | Navigation manager. Methods: `init`, `go`, `nextSection`, `prevSection`, `nextItem`, `prevItem`, `getCurrentRoute` |
| `__SPA_Views`                 | `js/spa/views/*.js`               | Object  | Map of `sectionId → view module`. Each module may have `mount`, `onActivate`, `onDeactivate`, `getTransitionCanvas` |
| `__SPA_Transition`            | `js/spa/transitionEngine.js`      | Object  | Transition engine. Methods: `transition(fromCanvas, toCanvas, done)` |
| `__SPA_Overlay`               | `js/spa/overlayManager.js`        | Object  | Overlay manager. Methods: `open(id, payload)`, `close()`, `isOpen()` |
| `__SPA_Gestures`              | `js/spa/gestures.js`              | Object  | Touch gesture manager. Methods: `init()` |
| `__SPA_ImportantWords`        | `js/spa/typography/importantWords.js` | Object | Font-fluctuation engine. Methods: `init(root)`. Properties: `fontVariants` |
| `__SPA_initParticleCluster`   | `js/particle-clusters.js`         | Function | Initialise a particle cluster on a canvas element. Signature: `(canvas, platformKey) → void`. Guards against double-init via `canvas.dataset.clusterInit`. |

---

## 8. Responsibility → File Index

| Responsibility                                  | File(s)                                          | Lines of note         |
|-------------------------------------------------|--------------------------------------------------|-----------------------|
| SPA HTML shell + script load order             | `spa.html`                                       | 22–54                 |
| Route model (sections, items, metadata)         | `js/spa/routes.js`                               | all                   |
| Hash-based navigation + view switching          | `js/spa/router.js`                               | all                   |
| View mount / lifecycle dispatch                 | `js/spa/router.js`                               | 46–131                |
| Section link nav UI                             | `js/spa/router.js`                               | 205–224               |
| Item dot nav UI                                 | `js/spa/router.js`                               | 227–244               |
| Touch gesture → router bridge                   | `js/spa/gestures.js`                             | all                   |
| Scroll-edge detection for vertical swipes       | `js/spa/gestures.js`                             | 27–34, 93–113         |
| Fullscreen fade transition                      | `js/spa/transitionEngine.js`                     | all                   |
| Canvas pixel sampling for transition            | `js/spa/transitionEngine.js`                     | 23–48                 |
| Overlay open/close                              | `js/spa/overlayManager.js`                       | all                   |
| SoundCloud archive data + HTML builder          | `js/spa/overlayManager.js`                       | 14–33                 |
| Home view: character particle canvas            | `js/spa/views/homeView.js`                       | all                   |
| Home view lifecycle (activate/deactivate)       | `js/spa/views/homeView.js`                       | 154–163               |
| Social view: particle cluster posters           | `js/spa/views/socialView.js`                     | all                   |
| Music view: canvas + text poster routing        | `js/spa/views/musicView.js`                      | all                   |
| Games view: Asymptote engine link               | `js/spa/views/gamesView.js`                      | all                   |
| About view: label-only placeholder panels       | `js/spa/views/aboutView.js`                      | all                   |
| Particle cluster engine (social/music buttons)  | `js/particle-clusters.js`                        | all                   |
| SPA dynamic cluster init guard                  | `js/particle-clusters.js`                        | 267–273               |
| Font fluctuation (important-word animation)     | `js/spa/typography/importantWords.js`            | all                   |
| Legacy fullscreen particle transition           | `js/particle-transition-engine.js`               | all (not loaded)      |
| Legacy genie transition                         | `js/genie-transition.js`                         | all (not loaded)      |
| MPA home page particles (duplicate of homeView) | `js/script.js`                                   | 36–200 approx         |
| MPA about-section content (not in SPA)          | `js/discography.js`, `js/dev-history.js`, `js/journal.js`, `js/spotify-analytics.js` | all |

---

## 9. Smallest Useful Refactor Plan

Ordered by impact-to-effort ratio. Do them in this sequence. Each step is
independent; stopping after any step leaves the codebase in a better state
than before it.

---

### Step 1 — Add the missing reentry guard to `transitionEngine.js` *(~5 lines)*

**Problem:** Overlapping transitions corrupt the transition canvas.  
**Fix:** Add `var inFlight = false` at the top of the IIFE. At the start of
`transition()`, return early if `inFlight`. Set `inFlight = true` before
`requestAnimationFrame(step)`. Set `inFlight = false` just before calling
`done()`.  
**File:** `js/spa/transitionEngine.js` lines 51–110.  
**Risk of change:** None. The router already tries to prevent double-calls; this
adds the second layer of safety inside the engine.

---

### Step 2 — Fix the resize listener leak in `particle-clusters.js` *(~8 lines)*

**Problem:** Each cluster adds a `window.resize` listener that is never removed.  
**Fix:** Store the handler: `var onResize = function() { ... }`. Add
`window.addEventListener('resize', onResize)`. Include
`window.removeEventListener('resize', onResize)` in the returned cleanup
function.  
**File:** `js/particle-clusters.js` lines 231–253.  
**Risk of change:** Low. The cleanup function is only called if the caller holds
the reference; the SPA currently discards it. Add the fix anyway so it is
correct for future callers.

---

### Step 3 — Move home view mouse/resize listeners from `mount()` to `onActivate()` / `onDeactivate()` *(~15 lines)*

**Problem:** `mousemove` and `resize` listeners run while homeView is hidden.  
**Fix:**  
- Remove the three `addEventListener` calls from `mount()`.  
- Add them in `onActivate()` after starting the rAF loop.  
- Add the corresponding `removeEventListener` calls in `onDeactivate()` after
  cancelling the rAF loop.  
- This requires storing the handler references as module-level variables.  
**File:** `js/spa/views/homeView.js` lines 139–151, 154–163.  
**Risk of change:** Low. `mount()` is called once; `onActivate`/`onDeactivate`
may be called multiple times. The only risk is forgetting to keep handler
references stable across calls (use named function references, not inline
anonymous functions).

---

### Step 4 — Delete or annotate `clickAction` in `routes.js` *(~5 lines)*

**Problem:** `clickAction` appears authoritative but drives nothing.  
**Fix option A (smallest):** Add a comment above each `clickAction` key:
`// NOTE: not read by the router; informational only`.  
**Fix option B (cleaner):** Delete the `clickAction` field from all items until
a consumer is implemented.  
**File:** `js/spa/routes.js` lines 24, 31, 36, 41, etc.  
**Risk of change:** Zero. Nothing reads this field.

---

### Step 5 — Cap or prune `allLetterSpans` in `importantWords.js` *(~10 lines)*

**Problem:** The array grows unbounded; the interval processes it forever.  
**Fix:** In the interval callback, filter out spans whose element is no longer
connected to the DOM: `allLetterSpans = allLetterSpans.filter(s => s.isConnected)`.
This runs once per 400 ms tick and is O(n) on the span count, which is
acceptable.  
**File:** `js/spa/typography/importantWords.js` line 67 (add before the
`numToChange` calculation).  
**Risk of change:** Low. `isConnected` is well-supported. The filter does not
affect spans that are in the DOM.

---

### Step 6 — Rebuild `updateItemDots()` incrementally instead of via `innerHTML` *(~20 lines)*

**Problem:** Every route change destroys and recreates all dot buttons and their
listeners.  
**Fix:** Build the dots once (as with section links in `updateSectionLinks()`).
Use `dataset.built` to skip rebuilding if the section hasn't changed. Only
update the `active` class.  
**File:** `js/spa/router.js` lines 227–244.  
**Risk of change:** Low. The current behaviour is functional; this is a quality
improvement.

---

### Step 7 — Move `particle-clusters.js` into the SPA directory *(rename only)*

**Problem:** SPA-critical file lives alongside MPA-only scripts.  
**Fix:** Move `js/particle-clusters.js` → `js/spa/engines/particleClusters.js`.
Update the `<script>` tag in `spa.html` and any MPA page that loads it.  
**File:** `spa.html` line 43. Check all HTML files for other `<script src="js/particle-clusters.js">` references before moving.  
**Risk of change:** Low (rename + one path update). High clarity gain.

---

### Step 8 — Extract shared character-particle logic from `script.js` and `homeView.js` *(~60 lines)*

**Problem:** Two independent implementations of the same particle physics exist.
Any future tweak must be applied twice.  
**Fix:** Create `js/spa/engines/characterParticles.js` with the shared
constants and `makeParticle`, `update`, `draw`, `animate` logic exposed as a
factory function. Have both `homeView.js` and `script.js` consume it.  
**Risk of change:** Medium. Requires touching two consumers and testing both
the SPA home view and the MPA home page. Do this after Steps 1–6 are stable.

---

### Step 9 — Wire the about-section content into the SPA *(large, own epic)*

**Problem:** About panels are empty in the SPA.  
**Fix:** Port or adapt `discography.js`, `dev-history.js`, `journal.js`, and
`spotify-analytics.js` as SPA view modules. Register them on
`window.__SPA_Views.about` or expand `aboutView.js` to load the right content
per itemId. This is the largest gap in the current SPA and the most
user-visible.  
**Risk of change:** High. These scripts were written for MPA pages; they may
assume `document.querySelector` for elements that don't exist in the SPA DOM.
Audit each file for DOM assumptions before porting.

---

*End of diagnostic review.*
