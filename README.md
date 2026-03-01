# Indrolend Website

Personal website with integrated Spotify analytics and OCR-based statistics parsing.

## Features

- **Spotify Analytics Dashboard**: Visual display of streaming statistics
- **Spotify for Artists Scraper**: Automated extraction of live audience stats (listeners, streams, followers, top cities)
- **Automated Screenshot Parsing**: OCR-based extraction of Spotify stats from screenshots
- **Example-Based Validation**: System for improving OCR accuracy with ground truth data
- **Interactive Games**: Arcade Games Hub (Pool — fully playable, more coming), Asymptote idle game, Tic-Tac-Toe, Word Game
- **Image Gallery**: Personal photo gallery
- **Native Translation System**: Full i18n support in English, Spanish, Chinese, German, Hindi, and Dutch

## Translation System (i18n)

The website has a built-in translation system — **no plugins, no Google Translate**. Every
supported language is stored as a plain JSON file in the `/locales/` folder.

### Supported Languages

| Code | Language   | Native Name |
|------|------------|-------------|
| en   | English    | English     |
| es   | Spanish    | Español     |
| zh   | Chinese    | 中文         |
| de   | German     | Deutsch     |
| hi   | Hindi      | हिन्दी      |
| nl   | Dutch      | Nederlands  |

### How It Works

1. On first visit the website detects the visitor's browser language.
   If that language is supported it is shown automatically.
2. A **language picker** (dropdown) appears at the top of every main page.
   The visitor can switch at any time; the choice is saved in the browser.
3. If a translation key is missing the text falls back to English.
4. Brand names and proper nouns (Indrolend, Spotify, Instagram, TikTok, Bandcamp, Apple Music,
   YouTube, SoundCloud, Asymptote, album names, etc.) are **never translated**.

### How to Edit Translations (Non-coders Welcome!)

Translation files live in `/locales/`:

```
locales/
  en.json   ← English (the "source of truth")
  es.json   ← Spanish
  zh.json   ← Chinese
  de.json   ← German
  hi.json   ← Hindi
  nl.json   ← Dutch
```

Each file is a simple list of **key → text** pairs:

```json
{
  "captcha.verify": "Verify",
  "discography.title": "DISCOGRAPHY",
  "asymptote.begin": "begin?"
}
```

**To change a translation:**
1. Open the relevant `.json` file in any text editor (or on GitHub — click the file, then the ✏️ pencil icon).
2. Find the key you want to change and update the text after the colon.
3. Save/commit the file. The website updates immediately on the next page load.

**Rules to follow:**
- **Do NOT change the key** (the part before the `:`). Only change the value (the part after the `:`).
- **Do NOT translate** brand/proper names: `Indrolend`, `Spotify`, `Instagram`, `TikTok`,
  `Bandcamp`, `Apple Music`, `YouTube`, `SoundCloud`, `Asymptote`, album titles, etc.
- Keep JSON syntax valid: every line ends with a comma except the last one, and all text
  must be wrapped in `"double quotes"`.

### How to Add a New Language

1. Copy `locales/en.json` and rename it to the [ISO 639-1 two-letter code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of the new language (e.g. `fr.json` for French).
2. Translate each value (leave keys and brand names unchanged).
3. In `js/i18n.js`, add the code to the `SUPPORTED` array and add the native name to `LANG_NAMES`:
   ```js
   var SUPPORTED = ['en', 'es', 'zh', 'de', 'hi', 'nl', 'fr'];
   var LANG_NAMES = { ..., fr: 'Français' };
   ```
4. The picker will automatically show the new language.

## Arcade Games Hub

The **Games Hub** (`pages/games.html`) is an arcade-style picker page. Pool is the featured
game and fully playable. Other games will appear here once they are ready.

### File Layout

```
pages/
  games.html              ← Games hub (picker page)
games/
  pool.html               ← Pool game page (choice screen + iframe)
  pool-minigame/
    index.html            ← Self-contained HTML5 8-ball pool game
  chess.html              ← (TODO) Chess game page
  chess-minigame/         ← (TODO) Chess minigame folder
  tanks.html              ← (TODO) Tanks game page
  archery.html            ← (TODO) Archery game page
```

### How to Add a New Game (Step-by-Step for Non-coders)

1. **Open `pages/games.html`** in a text editor or on GitHub.
2. Copy the Pool card block (the `<a class="game-card featured" …>` block).
3. Paste it below the Pool card and update:
   - The `href` to point to `../games/<newgame>.html`
   - The emoji in `.game-card-icon`
   - The `.game-card-name` text
   - The `.game-card-desc` text
4. Create `games/<newgame>.html` by copying `games/pool.html`.
   - Update the title, subtitle, and iframe `src` to `<newgame>-minigame/index.html`.
5. Drop your HTML5 minigame into `games/<newgame>-minigame/index.html`.
   - Any self-contained HTML file works (no external dependencies needed).

### How to Swap the Pool Minigame

Replace the file `games/pool-minigame/index.html` with any self-contained HTML5 game.
The parent page (`games/pool.html`) loads it inside an `<iframe>`, so it is fully isolated.

### Multiplayer (Coming Soon)

The "Play with People" button on each game page opens a modal stub with Create Room,
Quick Match, and Join Room. Real room-code networking will be wired in a future PR.
To connect it: replace the `stubAction()` function in `games/pool.html` with real
WebSocket or WebRTC logic.

## Spotify Statistics System

### Automated Daily Updates (Configured)

**The Spotify Snapshot on the website automatically updates daily** via GitHub Actions:

- **What it does**: Scrapes live statistics from Spotify for Artists dashboard
- **When it runs**: Once daily at 3 AM UTC
- **What you need**: Add `SPOTIFY_EMAIL` and `SPOTIFY_PASSWORD` to GitHub repository secrets
- **Where data is stored**: `data/spotify_stats.json`
- **Website display**: Shown in the "Spotify for Artists Stats" section on the home page

**Setup Instructions**:
1. Go to **Settings** → **Secrets and variables** → **Actions** in your GitHub repository
2. Add `SPOTIFY_EMAIL` (your Spotify login email)
3. Add `SPOTIFY_PASSWORD` (your Spotify login password)
4. The workflow runs automatically every day

See [SPOTIFY_ARTISTS_SCRAPER.md](SPOTIFY_ARTISTS_SCRAPER.md) for complete documentation.

### Additional Options

#### Manual Scraping

For manual/local scraping of live statistics:

1. Install dependencies: `pip install -r scripts/requirements.txt`
2. Configure credentials in `.env` file
3. Run the scraper: `python scripts/scrape_spotify_artists.py`

See [SPOTIFY_ARTISTS_SCRAPER.md](SPOTIFY_ARTISTS_SCRAPER.md) for complete setup instructions.

#### Screenshot Parsing

To update your Spotify analytics using screenshots:

1. Take screenshots of your Spotify for Artists statistics
2. Upload them to the `screenshots/` folder
3. GitHub Actions automatically processes them with OCR
4. Parsed statistics are saved to `data/parsed-stats.json`
5. Your website displays the updated analytics

See [scripts/README.md](scripts/README.md) for detailed documentation.

### Improving OCR Accuracy

If you want to help improve the OCR parsing accuracy:

1. **Quick Start**: See [OCR_EXAMPLES_QUICK_START.md](OCR_EXAMPLES_QUICK_START.md)
2. **Detailed Guide**: See [screenshots/examples/README.md](screenshots/examples/README.md)
3. **Contributing**: See [screenshots/examples/CONTRIBUTING.md](screenshots/examples/CONTRIBUTING.md)

**TL;DR**: Place example screenshots with known correct values in `screenshots/examples/` along with a `.json` file containing the ground truth data. This helps validate and improve the OCR parser.

## Directory Structure

**Current organized structure** (see [STRUCTURE.md](STRUCTURE.md) for detailed documentation):

```
.
├── index.html                    # Landing page (fake captcha)
├── pages/                        # All HTML pages
│   ├── home.html                # Main homepage
│   ├── gallery.html             # Photo gallery
│   ├── tictactoe.html           # Gallery unlock game
│   ├── wordgame.html            # Redirect to asymptote
│   └── spotify-demo.html        # Spotify analytics demo
│
├── css/                          # Stylesheets
│   ├── style.css                # Main styles (with vendor prefixes)
│   ├── spotify-styles.css       # Spotify component styles
│   └── spotify-analytics-styles.css
│
├── js/                           # JavaScript files
│   ├── script.js                # Main application logic
│   ├── spotify-integration.js
│   ├── spotify-analytics.js
│   └── spotify-analytics-data.js
│
├── assets/                       # Static assets
│   ├── icons/                   # Animated GIF icons (7 files)
│   └── images/                  # Static images
│
├── images/                       # Gallery images (53 files)
│
├── screenshots/                  # Screenshots for processing
│   ├── README.md
│   └── examples/                # Example screenshots for validation
│       ├── README.md            # Detailed instructions
│       ├── CONTRIBUTING.md      # Contribution guide
│       ├── TEMPLATE.json        # Ground truth template
│       └── *.png + *.json       # Example screenshots + annotations
│
├── scripts/                      # Automation scripts
│   ├── parse_screenshots.py     # OCR parser
│   ├── validate_ocr_examples.py # Validation script
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # Detailed documentation
│
├── data/                         # Data files
│   ├── parsed-stats.json        # Parsed statistics
│   └── validation-results.json  # Validation results (optional)
│
├── backend/                      # Node.js backend
│   ├── spotify-backend.js
│   ├── package.json
│   └── README.md
│
├── asymptote/                    # Idle game engine
│   ├── index.html
│   ├── src/
│   └── styles/
│
└── .github/workflows/            # GitHub Actions
    └── parse-screenshots.yml     # Automated parsing workflow
```

## Getting Started

### For Website Updates

1. Clone the repository
2. Make your changes to HTML/CSS/JS files
3. Commit and push to GitHub
4. Changes are automatically deployed (if GitHub Pages is configured)

### For Spotify Analytics

1. Install dependencies:
   ```bash
   sudo apt-get install tesseract-ocr
   pip install -r scripts/requirements.txt
   ```

2. Add screenshots to `screenshots/` folder

3. Run the parser (or let GitHub Actions do it automatically):
   ```bash
   python scripts/parse_screenshots.py
   ```

### For Spotify Artists Scraper

1. Install dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. Configure credentials:
   ```bash
   cp .env.example .env
   # Edit .env and add your Spotify email and password
   ```

3. Run the scraper:
   ```bash
   python scripts/scrape_spotify_artists.py
   ```

4. Automate with cron (see [SPOTIFY_ARTISTS_SCRAPER.md](SPOTIFY_ARTISTS_SCRAPER.md))

### For OCR Development

1. Add example screenshots to `screenshots/examples/`
2. Create ground truth JSON files for each example
3. Run validation:
   ```bash
   python scripts/validate_ocr_examples.py
   ```
4. Review accuracy metrics and improve parsing logic

## Documentation

- **Repository Structure**: [STRUCTURE.md](STRUCTURE.md) - Complete directory organization and guidelines
- **Spotify for Artists Scraper**: [SPOTIFY_ARTISTS_SCRAPER.md](SPOTIFY_ARTISTS_SCRAPER.md) - Automated stats scraping setup
- **Spotify API Integration**: [SPOTIFY_INTEGRATION.md](SPOTIFY_INTEGRATION.md) - Using Spotify Web API
- **Screenshot Parsing**: [scripts/README.md](scripts/README.md)
- **OCR Examples Quick Start**: [OCR_EXAMPLES_QUICK_START.md](OCR_EXAMPLES_QUICK_START.md)
- **OCR Examples Detailed Guide**: [screenshots/examples/README.md](screenshots/examples/README.md)
- **Contributing OCR Examples**: [screenshots/examples/CONTRIBUTING.md](screenshots/examples/CONTRIBUTING.md)

## Browser Compatibility

The website is optimized for maximum browser compatibility:

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Older browsers with vendor prefix support (IE11+)
- ✅ CSS Grid with flexbox fallbacks
- ✅ Progressive enhancement with @supports
- ✅ Preloaded critical assets for fast loading
- ✅ No lazy loading (all animations load immediately)

## Technologies

- **Frontend**: HTML, CSS, JavaScript
- **OCR**: Tesseract OCR, pytesseract
- **Automation**: GitHub Actions
- **Image Processing**: Pillow (PIL)
- **Spotify API**: Integration with Spotify for Artists data

## Contributing

Contributions are welcome! Areas where you can help:

- 🎨 Improving the website design
- 🎮 Adding new games or features
- 📊 Enhancing the analytics dashboard
- 🔍 Improving OCR parsing accuracy (see [OCR_EXAMPLES_QUICK_START.md](OCR_EXAMPLES_QUICK_START.md))
- 🐛 Fixing bugs
- 📝 Improving documentation

## Security

Security is a top priority for this project. We implement multiple layers of protection:

- **Environment Variables**: All sensitive credentials stored securely in `.env` files (never committed)
- **Input Sanitization**: XSS prevention through HTML escaping and URL validation
- **HTTPS Enforcement**: Secure communication for all external API calls
- **Secure Error Handling**: Generic error messages to users, detailed logs server-side only
- **Dependency Management**: Regular vulnerability scanning and updates
- **No User Data Collection**: This website doesn't collect, store, or track user data

For detailed security information, see [SECURITY.md](SECURITY.md).

### Security Setup

**Important**: Before running the application, set up your environment variables:

1. **For Python Scripts** (Spotify scraper):
   ```bash
   cp .env.example .env
   # Edit .env and add your Spotify credentials
   ```

2. **For Node.js Backend** (Spotify API):
   ```bash
   cd backend/
   cp .env.example .env
   # Edit .env and add your Spotify API credentials
   ```

3. **Never commit `.env` files** - they are excluded via `.gitignore`

See [SECURITY.md](SECURITY.md) for complete security guidelines and best practices.

## License

This is a personal website project. Please contact the owner for licensing information.

## Contact

Visit the website to learn more about me and my projects!
