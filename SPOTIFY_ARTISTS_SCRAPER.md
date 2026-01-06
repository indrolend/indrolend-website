# Spotify for Artists Stats Scraper

Automated scraper that logs into Spotify for Artists, extracts audience statistics, and saves them to a JSON file for display on your website.

## Features

- 🔐 **Secure Authentication**: Uses environment variables to store credentials
- 🤖 **Automated Scraping**: Selenium-based browser automation
- 📊 **Comprehensive Stats**: Extracts listeners, streams, followers, and top cities
- 🔄 **Scheduled Updates**: Easy integration with cron jobs or task schedulers
- 💪 **Robust Error Handling**: Graceful failure handling with detailed logging
- 🌐 **Website Integration**: Automatically displays stats on your website

## Prerequisites

### System Requirements

1. **Python 3.8+**
   ```bash
   python --version
   ```

2. **Google Chrome or Chromium**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install chromium-browser
   
   # macOS (using Homebrew)
   brew install --cask google-chrome
   
   # Windows
   # Download from: https://www.google.com/chrome/
   ```

3. **ChromeDriver**
   
   The scraper uses `webdriver-manager` which automatically downloads and manages ChromeDriver.
   
   Alternatively, you can manually install ChromeDriver:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install chromium-chromedriver
   
   # macOS (using Homebrew)
   brew install chromedriver
   
   # Or download from: https://chromedriver.chromium.org/
   ```

## Installation

### 1. Install Python Dependencies

```bash
cd /path/to/indrolend-website
pip install -r scripts/requirements.txt
```

This will install:
- `selenium` - Browser automation
- `python-dotenv` - Environment variable management
- `webdriver-manager` - Automatic ChromeDriver management

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Spotify credentials:

```env
SPOTIFY_EMAIL=your_email@example.com
SPOTIFY_PASSWORD=your_actual_password
```

**⚠️ SECURITY IMPORTANT:**
- Never commit the `.env` file to git (it's already in `.gitignore`)
- Keep your credentials private and secure
- Use strong, unique passwords
- Consider using a password manager

### 3. Verify Installation

Test that everything is set up correctly:

```bash
python scripts/scrape_spotify_artists.py
```

If successful, you should see:
```
============================================================
Spotify for Artists Stats Scraper
============================================================
✓ Chrome driver initialized successfully
Navigating to https://artists.spotify.com/...
Entering email...
Entering password...
✓ Successfully logged in
Extracting statistics...
  Listeners: 1234
  Streams: 56789
  Followers: 890
  Top Cities: 5 cities extracted
    - New York: 234 listeners
    - Los Angeles: 189 listeners
    ...
✓ Stats saved to data/spotify_stats.json
✓ Browser closed
============================================================
✓ Scraping completed successfully!
============================================================
```

## Usage

### Manual Run

To manually scrape and update stats:

```bash
python scripts/scrape_spotify_artists.py
```

The script will:
1. Launch Chrome in headless mode
2. Navigate to Spotify for Artists
3. Log in with your credentials
4. Extract audience statistics
5. Save data to `data/spotify_stats.json`
6. Close the browser

### Output Format

The scraper creates `data/spotify_stats.json` with the following structure:

```json
{
  "scraped_at": "2026-01-06T12:00:00.000000+00:00",
  "listeners": 1234,
  "streams": 56789,
  "followers": 890,
  "top_cities": [
    {
      "city": "New York",
      "listeners": 234
    },
    {
      "city": "Los Angeles",
      "listeners": 189
    }
  ]
}
```

## Automation

### Option 1: Cron Job (Linux/macOS)

Set up automatic scraping with a cron job:

1. Open crontab editor:
   ```bash
   crontab -e
   ```

2. Add a schedule (examples):

   ```cron
   # Every day at 3 AM
   0 3 * * * cd /path/to/indrolend-website && /usr/bin/python3 scripts/scrape_spotify_artists.py >> logs/scraper.log 2>&1

   # Every 6 hours
   0 */6 * * * cd /path/to/indrolend-website && /usr/bin/python3 scripts/scrape_spotify_artists.py >> logs/scraper.log 2>&1

   # Every Monday at 8 AM
   0 8 * * 1 cd /path/to/indrolend-website && /usr/bin/python3 scripts/scrape_spotify_artists.py >> logs/scraper.log 2>&1
   ```

3. Create log directory:
   ```bash
   mkdir -p logs
   ```

### Option 2: Task Scheduler (Windows)

1. Open Task Scheduler (`taskschd.msc`)

2. Click "Create Basic Task"

3. Configure the task:
   - **Name**: Spotify Stats Scraper
   - **Trigger**: Daily (or your preferred schedule)
   - **Time**: 3:00 AM (or your preferred time)
   - **Action**: Start a program
   - **Program/script**: `python`
   - **Arguments**: `scripts\scrape_spotify_artists.py`
   - **Start in**: `C:\path\to\indrolend-website`

4. Enable "Run whether user is logged on or not"

### Option 3: GitHub Actions (Cloud)

Add a workflow file `.github/workflows/scrape-spotify-stats.yml`:

```yaml
name: Scrape Spotify Stats

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch:  # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      
      - name: Install Chrome
        run: |
          sudo apt-get update
          sudo apt-get install -y chromium-browser chromium-chromedriver
      
      - name: Install dependencies
        run: pip install -r scripts/requirements.txt
      
      - name: Run scraper
        env:
          SPOTIFY_EMAIL: ${{ secrets.SPOTIFY_EMAIL }}
          SPOTIFY_PASSWORD: ${{ secrets.SPOTIFY_PASSWORD }}
        run: python scripts/scrape_spotify_artists.py
      
      - name: Commit and push
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/spotify_stats.json
          git diff --staged --quiet || git commit -m "Update Spotify stats"
          git push
```

Don't forget to add secrets to your GitHub repository:
- Go to Settings → Secrets and variables → Actions
- Add `SPOTIFY_EMAIL` and `SPOTIFY_PASSWORD`

## Website Integration

The stats are automatically displayed on your website when you include:

1. **CSS**: `<link rel="stylesheet" href="../css/spotify-artists-stats.css" />`
2. **JavaScript**: `<script defer src="../js/spotify-artists-stats.js"></script>`
3. **HTML Container**: `<div id="spotify-artists-stats"></div>`

The JavaScript automatically:
- Fetches `data/spotify_stats.json`
- Displays listeners, streams, followers, and top cities
- Refreshes every 5 minutes
- Handles errors gracefully

### Example Display

```
📊 Spotify for Artists Stats
Updated: 2 hours ago

┌─────────────────────────────────────┐
│  🎧          👥         ▶️          │
│  1,234       890       56,789       │
│  Listeners   Followers  Streams     │
└─────────────────────────────────────┘

🌍 Top Cities
1. New York         234 listeners
2. Los Angeles      189 listeners
3. Chicago          156 listeners
4. Houston          134 listeners
5. Philadelphia     112 listeners
```

## Troubleshooting

### Chrome/ChromeDriver Issues

**Error**: "ChromeDriver not found"
```bash
# Solution 1: Use webdriver-manager (included in requirements.txt)
pip install webdriver-manager

# Solution 2: Install system ChromeDriver
# Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# macOS
brew install chromedriver
```

**Error**: "Chrome version mismatch"
```bash
# Update Chrome/Chromium to the latest version
# Then webdriver-manager will automatically download matching driver
```

### Login Issues

**Error**: "Login timeout"
- Check your credentials in `.env` file
- Ensure your Spotify account has access to Spotify for Artists
- Try logging in manually at https://artists.spotify.com/ to verify credentials
- Check your network connection

**Error**: "Could not find login form elements"
- Spotify may have changed their login page layout
- Update the XPath selectors in `scrape_spotify_artists.py`
- Check the GitHub repository for updates

### Data Extraction Issues

**Warning**: "Could not find listeners count"
- The script continues with partial data
- Check if you have data available in Spotify for Artists dashboard
- You may need to wait 24-48 hours after first release for stats to appear

**Empty top_cities array**
- Your account may not have enough data yet
- Check if cities appear in your Spotify for Artists dashboard
- The scraper may need XPath adjustments for your account layout

### Permission Issues

**Error**: "Permission denied" when saving JSON
```bash
# Ensure data directory exists and is writable
mkdir -p data
chmod 755 data
```

### Display Issues

**Stats not showing on website**
- Check browser console for JavaScript errors
- Verify `data/spotify_stats.json` exists and is valid JSON
- Ensure all CSS/JS files are properly linked in HTML
- Check that the container `<div id="spotify-artists-stats"></div>` exists

## Security Best Practices

1. **Never commit credentials**
   - The `.env` file is in `.gitignore` by default
   - Double-check before committing: `git status`

2. **Use strong passwords**
   - Consider using a dedicated Spotify account for automation
   - Enable two-factor authentication (note: may require manual intervention)

3. **Secure your server**
   - If running on a server, use proper file permissions
   - Consider using encrypted environment variables
   - Limit access to the `.env` file

4. **Rate limiting**
   - Don't run the scraper too frequently (recommended: every 6-24 hours)
   - Spotify may block excessive automated access

5. **Monitor for changes**
   - Spotify may update their website, breaking the scraper
   - Check logs regularly
   - Watch for GitHub repository updates

## Advanced Configuration

### Headless vs. Visible Browser

By default, the scraper runs in headless mode. To see the browser:

Edit `scrape_spotify_artists.py`:
```python
scraper = SpotifyArtistsScraper(headless=False)  # Changed from True
```

### Custom Timeouts

Adjust waiting times in `scrape_spotify_artists.py`:
```python
TIMEOUT = 30  # Increase if you have slow internet
```

### Additional Stats

To extract more data, modify the `extract_stats()` method in `scrape_spotify_artists.py` to include additional metrics available in your dashboard.

## Development

### Running Tests

```bash
# Test with visible browser
python scripts/scrape_spotify_artists.py --no-headless

# Test with debug output
python scripts/scrape_spotify_artists.py --verbose
```

### Debugging

Enable verbose logging by modifying the script or add:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Contributing

If you improve the scraper:
1. Test thoroughly with your account
2. Ensure it handles errors gracefully
3. Update documentation
4. Consider privacy implications

## FAQ

**Q: Is this against Spotify's Terms of Service?**
A: This scrapes your own artist data from your own account. However, automated access may be against TOS. Use at your own risk and consider using the official Spotify API when available.

**Q: Why not use the official Spotify API?**
A: The Spotify for Artists data (detailed audience stats, streams, listeners) is not available through the public Spotify Web API. This scraper accesses the data you can already see in your dashboard.

**Q: How often should I run the scraper?**
A: Spotify for Artists updates stats every 24 hours. Running the scraper once or twice per day is sufficient.

**Q: What if Spotify changes their website?**
A: The scraper may break. Check for updates in the repository or adjust the XPath selectors in the script.

**Q: Can I scrape multiple artists?**
A: If your account has access to multiple artists, you may need to modify the script to select a specific artist after login.

**Q: Is my data secure?**
A: Your credentials are stored locally in `.env` which is not committed to git. The scraped data is public stats from your artist account.

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in logs
3. Check if Spotify's website has changed
4. Look for updates in the GitHub repository
5. Open an issue with detailed error information

## License

Part of the Indrolend Website project. See main repository for license information.
