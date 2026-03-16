# Copilot Instructions

> Full rules and vocabulary: `docs/AGENT_RULES.md` · Repo map: `docs/README.md`

## Project

Vanilla JS SPA + frozen legacy MPA. No framework, no build system.

- **SPA (primary, beta):** `spa.html` → `js/spa/`
- **Legacy MPA (frozen):** `index.html` → `legacy/pages/home.html`

New features go in the SPA only. Legacy accepts bug fixes only.

---

## Key vocabulary

| Term | Meaning |
|------|---------|
| **route** | URL state (hash) — canonical in `js/spa/routes.js` |
| **view** | Top-level SPA screen; one per section (`js/spa/views/*View.js`) |
| **section** | Horizontal nav group: `home`, `social`, `music`, `games`, `about` |
| **item** | Vertical nav entry inside a section: `spotify`, `tiktok`, … |
| **engine** | Self-contained animation system; exposes `init` + `cleanup` |
| **manager** | App-level coordinator; one global instance |
| **legacy** | Frozen MPA under `/legacy` — not just "old" |

Do not call SPA views "pages" — "pages" refers to `legacy/pages/`.

---

## SPA script load order (`spa.html`)

Do not reorder without explicit discussion:
particle-clusters → importantWords → routes → transitionEngine → overlayManager → views (home…about) → router → gestures

---

## View lifecycle contract

| Method | Responsibility |
|--------|----------------|
| `mount(itemId, containerEl)` | Build DOM once; cache refs; create engines |
| `onActivate(itemId, viewEl)` | Start rAF loops; add event listeners |
| `onDeactivate(itemId)` | **Stop rAF loops; remove listeners** — mandatory |
| `getTransitionCanvas(itemId)` | Return canvas for transition sampler |

Lifecycle rules: listeners added in `onActivate` must be removed in `onDeactivate`. rAF loops, intervals, and timeouts must be cancelled. Hidden views must not run animation work.

---

## Layer boundaries

| Layer | Rule |
|-------|------|
| views | Route-level behavior and lifecycle only |
| engines | Animation/behavior; expose `init` + `cleanup` |
| managers | Coordinate shared systems; one global instance |
| utils | Pure functions — no DOM, no global state |

---

## Pipeline / tooling (non-runtime)

| Directory | Purpose |
|-----------|---------|
| `inputs/ocr/screenshots/` | Drop new OCR screenshots here; auto-deleted after parse |
| `inputs/ocr/screenshots/examples/` | Training examples with ground truth JSON (kept in git) |
| `inputs/spotify/exports/` | Raw Spotify export files (staging) |
| `scripts/ocr/` | OCR scripts: `parse_screenshots.py`, `validate_ocr_examples.py` |
| `scripts/spotify/` | Spotify scraper: `scrape_spotify_artists.py` |
| `data/` | Auto-generated outputs — do not edit by hand |

Pipeline docs: `scripts/README.md` · `scripts/ocr/README.md` · `scripts/spotify/README.md`

---

## External / third-party intake

Third-party packs **must** land in `external/<pack-name>/` before use.
Do not place vendor archives in `js/spa/` or `legacy/`.
See `external/README.md` for the intake workflow.

---

## Operating style

- Be direct and concise. No motivational commentary.
- Prefer the smallest useful change. Preserve behavior unless redesign is requested.
- Do not introduce abstractions, patterns, or dependencies not already present.
- Before moving files: identify all references (HTML script tags, CSS links, import paths, script path constants).

---

## Do not change without explicit discussion

- `index.html` redirect shim
- Section/item IDs in `js/spa/routes.js`
- Anything under `legacy/` beyond isolated bug fixes
- `data/parsed-stats.json` (written by OCR automation)
- `data/spotify_stats.json` (written by Spotify scraper)
