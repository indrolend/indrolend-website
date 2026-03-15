# Docs — Indrolend Website

This folder is the canonical source for repo-wide truths.
Each subfolder `README.md` covers only that folder's local how-to.

---

## Repo map

```
indrolend-website/
├── index.html              Entry point — redirects to legacy/pages/home.html
├── spa.html                SPA shell (beta — open directly at /spa.html)
│
├── js/spa/                 SPA runtime modules
│   ├── routes.js           Single source of truth for section/item IDs
│   ├── router.js           Hash-based router; mounts views
│   ├── transitionEngine.js Fullscreen canvas transition
│   ├── overlayManager.js   App-level overlay coordinator
│   ├── gestures.js         Touch/swipe event handling
│   ├── views/              One view module per section
│   └── engines/            Shared SPA animation engines
│
├── legacy/                 Frozen MPA (current production default)
│   ├── pages/              Legacy HTML pages
│   └── js/                 MPA-only scripts + legacy engines
│
├── css/                    Stylesheets shared by SPA and legacy MPA
├── assets/                 Static assets (icons, images)
├── images/                 Gallery images
├── asymptote/              Standalone Asymptote game engine
│
├── backend/                Node.js Spotify API proxy
│
├── inputs/                 Pipeline inputs (not served at runtime)
│   ├── ocr/screenshots/    Drop new OCR screenshots here (auto-deleted after parse)
│   │   └── examples/       OCR training examples with ground truth JSON (kept in git)
│   └── spotify/exports/    Raw Spotify export files (staging)
│
├── scripts/                Python automation (non-runtime)
│   ├── requirements.txt    Shared Python dependencies
│   ├── ocr/                OCR pipeline scripts
│   └── spotify/            Spotify scraper
│
├── data/                   Auto-generated JSON (do not edit by hand)
│   ├── parsed-stats.json   Output of OCR pipeline (runtime — do not move)
│   ├── spotify_stats.json  Output of Spotify scraper (runtime — do not move)
│   ├── ocr/                Future: organized OCR outputs
│   └── spotify/            Future: organized Spotify outputs
│
├── external/               Third-party pack intake (see external/README.md)
└── docs/                   ← you are here — canonical repo docs
```

---

## Runtimes

| Runtime | Entry file | Status |
|---|---|---|
| **SPA** | `spa.html` | Primary (beta); target for new features |
| **Legacy MPA** | `index.html` → `legacy/pages/home.html` | Stable; current production default |

See [AGENT_RULES.md](AGENT_RULES.md) for rules on which runtime to target.

---

## Canonical docs (this folder)

| File | Purpose |
|---|---|
| [AGENT_RULES.md](AGENT_RULES.md) | Operating rules for agents and contributors; vocabulary |

---

## Reference docs (root-level — accurate depth, not rule-setting)

These files contain useful detail but defer to `docs/` for overarching rules.

| File | Purpose |
|---|---|
| [ARCHITECTURE.md](../ARCHITECTURE.md) | SPA internals, layer diagram, view lifecycle |
| [LEGACY.md](../LEGACY.md) | Legacy MPA directory layout and access paths |
| [STRUCTURE.md](../STRUCTURE.md) | Full directory tree and file relationships |
| [SECURITY.md](../SECURITY.md) | Security policy and credential management |
| [SPOTIFY_INTEGRATION.md](../SPOTIFY_INTEGRATION.md) | Spotify API integration guide |
| [SPOTIFY_ARTISTS_SCRAPER.md](../SPOTIFY_ARTISTS_SCRAPER.md) | OCR scraper setup and usage |
| [scripts/README.md](../scripts/README.md) | Pipeline automation overview |
| [scripts/ocr/README.md](../scripts/ocr/README.md) | OCR pipeline how-to |
| [scripts/spotify/README.md](../scripts/spotify/README.md) | Spotify scraper how-to |
| [backend/README.md](../backend/README.md) | Spotify backend API how-to |

---

## External / third-party intake

Third-party packs land in `external/`. See [../external/README.md](../external/README.md).

---

## Follow-up tasks (not in this PR)

- Update `STRUCTURE.md` and `ARCHITECTURE.md` to reflect the new `inputs/` tree.
- Update `screenshots/README.md` (now a stub — examples moved to `inputs/ocr/screenshots/examples/`).
- Migrate root-level `.md` files (OCR_EXAMPLES_QUICK_START.md, SPOTIFY_ARTISTS_SCRAPER.md, etc.)
  into `docs/` or remove duplicates once docs settle.
