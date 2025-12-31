# Automated Screenshot Parsing System

This system automatically processes Spotify stats screenshots using OCR (Optical Character Recognition) to extract metrics like Playlist Adds, Followers, Streams, and Listeners.

## How It Works

1. **Upload Screenshots**: Add your Spotify stats screenshots to the `screenshots/` folder
2. **Automatic Processing**: GitHub Actions automatically triggers when new images are added
3. **OCR Extraction**: The system uses Tesseract OCR to extract text from the images
4. **Stats Parsing**: Regular expressions identify and extract key metrics:
   - Playlist Adds
   - Followers
   - Streams
   - Listeners
   - Streams per Listener
   - Saves
5. **Results Saved**: Parsed data is saved to `data/parsed-stats.json`

## Directory Structure

```
.
├── .github/workflows/
│   └── parse-screenshots.yml    # GitHub Actions workflow
├── screenshots/                  # Upload your Spotify screenshots here
│   ├── README.md
│   └── *.png                    # Your screenshot files
├── scripts/
│   ├── parse_screenshots.py     # OCR parsing script
│   └── requirements.txt         # Python dependencies
└── data/
    └── parsed-stats.json        # Output: parsed statistics
```

## Manual Usage

To run the parser manually:

```bash
# Install dependencies (one-time setup)
sudo apt-get install tesseract-ocr
pip install -r scripts/requirements.txt

# Run the parser
python scripts/parse_screenshots.py
```

## Output Format

The parsed stats are saved in JSON format:

```json
{
  "processed_at": "2025-12-31T21:17:13.624653+00:00",
  "screenshots": [
    {
      "filename": "image5.png",
      "stats": {
        "playlist_adds": 238,
        "followers": 244,
        "listeners": 28
      },
      "extracted_text_preview": "..."
    }
  ]
}
```

## GitHub Actions Workflow

The workflow (`parse-screenshots.yml`) runs automatically when:
- New images are pushed to the `screenshots/` folder
- Changes are made to existing screenshots
- Manually triggered via workflow_dispatch

The workflow:
1. Checks out the repository
2. Sets up Python 3.12
3. Installs Tesseract OCR
4. Installs Python dependencies
5. Runs the parsing script
6. Commits and pushes the updated `parsed-stats.json`

## Supported Image Formats

- PNG
- JPG/JPEG
- GIF
- BMP

## Notes

- The OCR accuracy depends on image quality and text clarity
- Some screenshots may not contain recognizable stats patterns
- The system extracts only numeric values that match specific patterns
