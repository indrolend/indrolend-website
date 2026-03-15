# Indrolend Website

Music, art, and interactive experiences by Indrolend.

## Running locally

```bash
# Any static file server works. For example:
python3 -m http.server 8080
# then open http://localhost:8080/
```

## Entry points

| URL | Description |
|-----|-------------|
| `/` | Redirects to legacy MPA (`legacy/pages/home.html`) — current default |
| `/spa.html` | SPA (beta) — single-page application with hash-based routing |
| `/asymptote/` | Asymptote game engine |
| `/particlecarousel.engine.js` | Particle-carousel demo (dev prototype) |

The SPA is not the default entry point yet; `index.html` redirects to the legacy site.

## Key docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — SPA runtime layers, navigation modes, input mapping
- [STRUCTURE.md](STRUCTURE.md) — Full directory layout
- [LEGACY.md](LEGACY.md) — Frozen MPA code reference
- [DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md) — Changelog and design decisions

## SPA quick reference

Navigate to `spa.html` to open the SPA. The shell supports three navigation modes:

| Hash | Mode | Description |
|------|------|-------------|
| `#/idle` | Idle | Pulsing cluster — tap or press Space to enter |
| `#/<section>` | Section | Hero word — tap or press Space to drill in |
| `#/<section>/<item>` | Item | Full item view — back button or ArrowLeft/Right to navigate |

Deep links are supported: `spa.html#/music/spotify` loads directly into that item.
