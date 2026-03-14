# Legacy MPA

## What is the legacy MPA?

The legacy MPA (Multi-Page Application) is the original Indrolend website — a
set of traditional HTML pages with individual scripts and CSS. It has been
relocated into the `/legacy` directory as part of the SPA/legacy separation
refactor and is the **current production default**.

`index.html` redirects here. New features will be developed in the SPA
(`spa.html`), but the legacy MPA remains the live site until the SPA is
promoted from beta.

---

## Directory layout

```
legacy/
├── pages/                   # All legacy HTML pages
│   ├── home.html            # Legacy main home page
│   ├── gallery.html         # Image gallery (unlocked by tictactoe)
│   ├── tictactoe.html       # Gallery-unlock game
│   ├── discography.html     # Full discography listing
│   ├── journal.html         # Journal entries
│   ├── dev-history.html     # Development history
│   ├── wordgame.html        # Redirect to asymptote/
│   ├── spotify-demo.html    # Spotify integration demo
│   └── spotify-artists-test.html  # Spotify artist stats test page
└── js/                      # MPA-only JavaScript
    ├── script.js            # Core MPA logic (particles, gallery, captcha, tictactoe)
    ├── cursor-character-effect.js
    ├── dev-history.js
    ├── discography.js
    ├── easter-egg.js
    ├── journal.js
    ├── security-utils.js
    ├── spotify-analytics.js
    ├── spotify-analytics-data.js
    ├── spotify-artists-stats.js
    ├── spotify-integration.js
    └── engines/             # Legacy transition engines (not used by SPA)
        ├── particle-transition-engine.js
        └── genie-transition.js
```

---

## How to access the legacy MPA

Open any page directly by navigating to its path:

| Page            | Path                              |
|-----------------|-----------------------------------|
| Home            | `legacy/pages/home.html`          |
| Gallery         | `legacy/pages/gallery.html`       |
| Tic-Tac-Toe     | `legacy/pages/tictactoe.html`     |
| Discography     | `legacy/pages/discography.html`   |
| Journal         | `legacy/pages/journal.html`       |
| Dev History     | `legacy/pages/dev-history.html`   |
| Asymptote game  | `asymptote/index.html`            |

The legacy pages are linked from `index.html` (via redirect) but not from
`spa.html`.

---

## What changed from the original `/pages` location

All pages moved from `/pages/*.html` to `/legacy/pages/*.html`. Relative
asset paths were updated accordingly:

- CSS: `../../css/`
- Shared assets: `../../assets/`, `../../images/`
- MPA JS: `../../legacy/js/`
- Legacy engines: `../../legacy/js/engines/`
- Shared SPA engine (particle-clusters): `../../js/spa/engines/particle-clusters.js`
- Asymptote: `../../asymptote/`

Internal cross-links between legacy pages (e.g., `home.html → gallery.html`)
are unchanged because all pages moved together.

---

## Entry point

`index.html` redirects to `legacy/pages/home.html` — the legacy MPA is the
current production default.

The SPA is available at `spa.html` (beta). When the SPA is ready to be
promoted, `index.html` will be updated to point there instead.
