# Indrolend Website

Personal website for Indrolend — music, visuals, and games.

## What's here

| Path | What it is |
|---|---|
| `spa.html` | SPA (beta) — primary development target; open directly at `/spa.html` |
| `index.html` | Redirect shim → `legacy/pages/home.html` (current production default) |
| `legacy/` | Frozen multi-page application (stable entrypoint) |
| `backend/` | Node.js Spotify API proxy |
| `scripts/` | Python OCR/analytics automation for Spotify screenshots |
| `external/` | Third-party pack intake (see `external/README.md`) |

## How to run

- **SPA**: open `spa.html` directly in a browser (no build step required).
- **Legacy MPA**: open `legacy/pages/home.html` directly, or load via `index.html`.
- **Backend**: see [`backend/README.md`](backend/README.md).
- **OCR automation**: see [`scripts/README.md`](scripts/README.md).

## Canonical docs

- [`docs/README.md`](docs/README.md) — repo map, runtimes, key directories
- [`docs/AGENT_RULES.md`](docs/AGENT_RULES.md) — operating rules, vocabulary, view lifecycle
- [`external/README.md`](external/README.md) — how to add third-party packs

