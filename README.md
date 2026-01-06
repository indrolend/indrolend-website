# Indrolend Website

Personal website with integrated Spotify analytics and OCR-based statistics parsing.

## Features

- **Spotify Analytics Dashboard**: Visual display of streaming statistics
- **Spotify for Artists Scraper**: Automated extraction of live audience stats (listeners, streams, followers, top cities)
- **Automated Screenshot Parsing**: OCR-based extraction of Spotify stats from screenshots
- **Example-Based Validation**: System for improving OCR accuracy with ground truth data
- **Interactive Games**: Asymptote idle game, Tic-Tac-Toe, Word Game
- **Image Gallery**: Personal photo gallery

## Spotify Statistics System

### Option 1: Live Scraping (Recommended)

Automatically scrape live statistics from your Spotify for Artists dashboard:

1. Install dependencies: `pip install -r scripts/requirements.txt`
2. Configure credentials in `.env` file
3. Run the scraper: `python scripts/scrape_spotify_artists.py`
4. Schedule with cron/task scheduler for automatic updates

See [SPOTIFY_ARTISTS_SCRAPER.md](SPOTIFY_ARTISTS_SCRAPER.md) for complete setup instructions.

### Option 2: Screenshot Parsing

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

## License

This is a personal website project. Please contact the owner for licensing information.

## Contact

Visit the website to learn more about me and my projects!
