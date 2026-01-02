# Indrolend Website

Personal website with integrated Spotify analytics and OCR-based statistics parsing.

## Features

- **Spotify Analytics Dashboard**: Visual display of streaming statistics
- **Automated Screenshot Parsing**: OCR-based extraction of Spotify stats from screenshots
- **Example-Based Validation**: System for improving OCR accuracy with ground truth data
- **Interactive Games**: Asymptote idle game, Tic-Tac-Toe, Word Game
- **Image Gallery**: Personal photo gallery

## Spotify Statistics System

### Processing Your Statistics

To update your Spotify analytics on the website:

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

```
.
├── index.html                    # Landing page
├── home.html                     # Main homepage
├── gallery.html                  # Photo gallery
├── spotify-demo.html             # Spotify analytics demo
│
├── screenshots/                  # Screenshots for processing
│   ├── README.md
│   └── examples/                 # Example screenshots for validation
│       ├── README.md             # Detailed instructions
│       ├── CONTRIBUTING.md       # Contribution guide
│       ├── TEMPLATE.json         # Ground truth template
│       └── *.png + *.json        # Example screenshots + annotations
│
├── scripts/                      # Automation scripts
│   ├── parse_screenshots.py      # OCR parser
│   ├── validate_ocr_examples.py  # Validation script
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Detailed documentation
│
├── data/                         # Data files
│   ├── parsed-stats.json         # Parsed statistics
│   └── validation-results.json   # Validation results (optional)
│
├── spotify-analytics.js          # Analytics rendering
├── spotify-analytics-data.js     # Data loading
├── spotify-integration.js        # Spotify API integration
│
├── asymptote/                    # Idle game
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

### For OCR Development

1. Add example screenshots to `screenshots/examples/`
2. Create ground truth JSON files for each example
3. Run validation:
   ```bash
   python scripts/validate_ocr_examples.py
   ```
4. Review accuracy metrics and improve parsing logic

## Documentation

- **Spotify Integration**: [SPOTIFY_INTEGRATION.md](SPOTIFY_INTEGRATION.md)
- **Screenshot Parsing**: [scripts/README.md](scripts/README.md)
- **OCR Examples Quick Start**: [OCR_EXAMPLES_QUICK_START.md](OCR_EXAMPLES_QUICK_START.md)
- **OCR Examples Detailed Guide**: [screenshots/examples/README.md](screenshots/examples/README.md)
- **Contributing OCR Examples**: [screenshots/examples/CONTRIBUTING.md](screenshots/examples/CONTRIBUTING.md)

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
