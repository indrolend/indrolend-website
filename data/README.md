# Data Directory

This folder contains automatically generated JSON files with Spotify statistics.

## Files

- `spotify_stats.json` - **Auto-generated daily** via GitHub Actions scraper. Contains live stats from Spotify for Artists (listeners, streams, followers, top cities). Displayed in the "Spotify for Artists Stats" section on the home page.

- `parsed-stats.json` - Auto-generated from OCR parsing of uploaded screenshots. Contains detailed analytics (demographics, discovery sources, etc.). Displayed in the "Spotify Snapshot" section on the home page.

## Data Sources

### 1. Spotify for Artists Scraper (Automated Daily)
- **Source**: Live scraping of Spotify for Artists dashboard
- **Frequency**: Daily at 3 AM UTC via GitHub Actions
- **Output**: `spotify_stats.json`
- **Data**: Basic stats (listeners, streams, followers, top cities)
- **Setup**: Requires GitHub Secrets: `SPOTIFY_EMAIL`, `SPOTIFY_PASSWORD`

### 2. Screenshot OCR Parser
- **Source**: Manual screenshot uploads to `screenshots/` folder
- **Frequency**: On-demand when screenshots are uploaded
- **Output**: `parsed-stats.json`
- **Data**: Detailed analytics (demographics, discovery sources, age/gender breakdown, etc.)
- **Setup**: Automatic via GitHub Actions on screenshot upload
