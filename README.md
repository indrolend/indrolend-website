# Indrolend Website

Personal website with integrated Spotify analytics and OCR-based statistics parsing.

## Features

- **Spotify Analytics Dashboard**: Visual display of streaming statistics
- **Spotify for Artists Scraper**: Automated extraction of live audience stats (listeners, streams, followers, top cities)
- **Automated Screenshot Parsing**: OCR-based extraction of Spotify stats from screenshots
- **Example-Based Validation**: System for improving OCR accuracy with ground truth data
- **Interactive Games**: Arcade Games Hub (Pool, Chess, Tanks, Archery and more), Asymptote idle game, Tic-Tac-Toe, Word Game
- **Image Gallery**: Personal photo gallery

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

## Arcade Games Hub

The **Games Hub** (`pages/games.html`) is an arcade-style picker page. Pool is featured and fully playable; Chess, Tanks, and Archery are stubs ready to be filled in.

### How the Games Pages Are Structured

```
pages/
  games.html              ← The hub / picker page (what you see first)
games/
  pool.html               ← Pool game page (choice screen + embedded game)
  pool-minigame/
    index.html            ← The actual pool game (HTML5 canvas, self-contained)
  chess.html              ← (TODO) Chess game page
  tanks.html              ← (TODO) Tanks game page
  archery.html            ← (TODO) Archery game page
css/
  games.css               ← Shared styles for all games pages
```

---

### Adding a New Game (No Coding Experience Required!)

Follow these steps to add a brand-new game (e.g. "Snake") to the hub:

#### Step 1 — Add the game card to the hub

Open `pages/games.html` and find the `<!-- ── MORE GAMES PLACEHOLDER -->` comment.
Copy any existing game card block (e.g. the Chess block) and paste it above the placeholder.
Change:
- The emoji inside `<span class="game-card-icon">` to your game's icon (e.g. `🐍`)
- The text inside `<h2 class="game-card-name">` to your game's name (e.g. `Snake`)
- The text inside `<p class="game-card-desc">` to a fun description
- The `href` attribute to `../games/snake.html`
- Remove `class="locked"` from the `<div>` and change `<div>` to `<a>` (so it's clickable)

Example final result:
```html
<a class="game-card" href="../games/snake.html" aria-label="Play Snake">
  <span class="game-card-icon">🐍</span>
  <h2 class="game-card-name">Snake</h2>
  <p class="game-card-desc">Eat the food, grow longer, don't crash!</p>
</a>
```

#### Step 2 — Create the game page

Copy `games/pool.html` to `games/snake.html`.
In your new file, update:
- The `<title>` tag: `Snake — Indrolend Games`
- The heading: `🐍 Snake`
- The subtitle: your description
- The iframe `src`: `snake-minigame/index.html`
- The back button `aria-label` and content

#### Step 3 — Add the minigame

Create a folder `games/snake-minigame/` and put your game's HTML file inside as `index.html`.
This file should be a **self-contained HTML5 game** — all CSS and JavaScript in one file.
The pool minigame at `games/pool-minigame/index.html` is a good template to start from.

#### Step 4 — Done!

Open `pages/games.html` in your browser and your new game should appear in the grid.

---

### Swapping the Pool Minigame

To replace the pool game with a different one:
1. Find any free/open-source HTML5 billiards or pool game online.
2. Download it as a single HTML file (or bundle everything into one file).
3. Replace `games/pool-minigame/index.html` with the new file.
4. The pool page (`games/pool.html`) will automatically load the new game.

---

### Updating Game Icons, Descriptions, and Translations

All game icons and descriptions are plain text/emoji inside `pages/games.html`.
Just open the file and change the text — no coding needed.

For the pool page title/description, edit `games/pool.html` directly.

---

### Multiplayer (Room Code / Jackbox-style) — Future Work

The "Play with People" button on `games/pool.html` already shows a stub modal
with Create Room, Quick Match, and Join Room (with room code input) buttons.
To wire up real multiplayer:
1. Open `games/pool.html`.
2. Find the `stubAction` JavaScript function.
3. Replace the `alert(...)` calls with real networking/WebSocket logic.
4. Add your room-code server logic in `backend/` or a new service.

---

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
