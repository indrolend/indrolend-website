# scripts/spotify — Spotify Scraper

> Repo map: `docs/README.md` · Pipeline inputs: `inputs/spotify/`

These scripts scrape Spotify for Artists stats using Selenium and write results to
`data/spotify_stats.json` for display in the legacy MPA.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scrape_spotify_artists.py` | Logs into Spotify for Artists, extracts stats, writes `data/spotify_stats.json` |

---

## Setup (one-time)

```bash
# Install Python dependencies
pip install -r scripts/requirements.txt

# Install Chrome/Chromium + ChromeDriver (or use webdriver-manager)

# Copy and fill in credentials
cp .env.example .env
# Set SPOTIFY_EMAIL and SPOTIFY_PASSWORD in .env
```

---

## Running the scraper

```bash
python scripts/spotify/scrape_spotify_artists.py
```

Output is written to `data/spotify_stats.json`.

---

## Input / output

| Path | Role |
|------|------|
| `.env` | Credentials: `SPOTIFY_EMAIL`, `SPOTIFY_PASSWORD` |
| `inputs/spotify/exports/` | Optional: raw CSV/JSON exports for future pipelines |
| `data/spotify_stats.json` | Output: read by legacy MPA at `../../data/spotify_stats.json` |

---

See `scripts/README.md` for overall pipeline context.
See `SPOTIFY_ARTISTS_SCRAPER.md` (root) for detailed setup and troubleshooting.
