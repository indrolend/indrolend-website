# Automated Screenshot Parsing System

> **Repo map and operating rules:** [`docs/README.md`](../docs/README.md) · [`docs/AGENT_RULES.md`](../docs/AGENT_RULES.md)

This system automatically processes Spotify stats screenshots using OCR (Optical Character Recognition) to extract comprehensive analytics data including metrics, demographics, geography, and discovery sources.

## How It Works

1. **Upload Screenshots**: Add your Spotify stats screenshots to the `inputs/ocr/screenshots/` folder
2. **Automatic Processing**: GitHub Actions automatically triggers when new images are added
3. **OCR Extraction**: The system uses Tesseract OCR to extract text from the images
4. **Stats Parsing**: Regular expressions identify and extract comprehensive metrics:
   - **Core Metrics**: Playlist Adds, Followers, Streams, Listeners, Streams per Listener, Saves
   - **Change Percentages**: Growth/decline indicators for all metrics (e.g., "+40%")
   - **Demographics**: Gender distribution (Male, Female, Non-binary, Not Specified) and Age ranges
   - **Geography**: Top Cities and Countries with listener counts
   - **Discovery Sources**: Active, Programmed, and Other sources with detailed breakdowns
5. **Data Aggregation**: Multiple screenshots are consolidated into a unified analytics object
6. **Results Saved**: Parsed and aggregated data is saved to `data/parsed-stats.json`
7. **Homepage Display**: The homepage automatically loads and displays the parsed analytics

## Directory Structure

```
.
├── inputs/
│   └── ocr/
│       └── screenshots/             # Drop new screenshots here (auto-deleted after parse)
│           └── examples/            # Training examples with ground truth JSON (kept in git)
├── scripts/
│   ├── requirements.txt             # Python dependencies (shared)
│   ├── ocr/
│   │   ├── parse_screenshots.py     # OCR parsing script
│   │   ├── validate_ocr_examples.py # Validation script
│   │   └── generate_ground_truth_json.py
│   └── spotify/
│       └── scrape_spotify_artists.py
└── data/
    ├── parsed-stats.json            # Output of OCR pipeline (read by legacy MPA)
    └── spotify_stats.json           # Output of Spotify scraper (read by legacy MPA)
```

## Manual Usage

To run the parser manually:

```bash
# Install dependencies (one-time setup)
sudo apt-get install tesseract-ocr
pip install -r scripts/requirements.txt

# Run the parser on screenshots
python scripts/ocr/parse_screenshots.py

# Validate OCR accuracy against example screenshots (optional)
python scripts/ocr/validate_ocr_examples.py

# Generate ground truth JSON files from example_text (if needed)
python scripts/ocr/generate_ground_truth_json.py
```

## Validation and Testing

### Adding Example Screenshots for Validation

If you have screenshots with **known correct values** and want to help improve OCR accuracy:

1. Place your example screenshots in `inputs/ocr/screenshots/examples/`
2. Create a corresponding `.json` file with ground truth data
3. Run the validation script to test accuracy

See `inputs/ocr/screenshots/examples/README.md` for detailed instructions on the ground truth format.

### Running Validation

```bash
python scripts/ocr/validate_ocr_examples.py
```

This will:
- Process each example screenshot with OCR
- Compare extracted values against ground truth
- Report accuracy metrics and discrepancies
- Save detailed results to `data/validation-results.json`

### Generating Ground Truth JSON Files

If you have a text file with ground truth data (like `example_text`), you can automatically generate JSON files for all example screenshots:

```bash
python scripts/ocr/generate_ground_truth_json.py
```

This script:
- Reads the `inputs/ocr/screenshots/examples/example_text` file
- Parses all metrics from the text format
- Generates individual JSON files for each example image
- Places JSON files alongside their corresponding PNG files

The generated JSON files contain comprehensive ground truth data that can be refined later to match what's actually visible in each specific screenshot.

Example output:
```
======================================================================
Validating: spotify-stats-overview.png
======================================================================
Description: Core metrics page from December 2025
Expected fields: 6

Running OCR extraction...
Extracted fields: 6

Results:
  ✓ Correct:           6
  ✗ Incorrect:         0
  ⚠ Missing:           0
  + Extra:             0
  Accuracy:            100.0%
```

## Output Format

The parsed stats are saved in JSON format with two main sections:

### 1. Raw Screenshot Data

Individual screenshot processing results with extracted statistics:

```json
{
  "processed_at": "2026-01-01T18:50:00.000000+00:00",
  "screenshots": [
    {
      "filename": "spotify-stats-dec-2025.png",
      "stats": {
        "playlist_adds": 238,
        "followers": 244,
        "listeners": 431,
        "streams": 2459,
        "saves": 340,
        "gender_male": 54,
        "gender_female": 38,
        "age_18_24": 28,
        "age_25_34": 42,
        "top_cities": [
          {"name": "Dallas", "listeners": 15},
          {"name": "Los Angeles", "listeners": 13}
        ]
      },
      "extracted_text_preview": "..."
    }
  ]
}
```

### 2. Aggregated Analytics

Consolidated analytics data from all screenshots, formatted for frontend display:

```json
{
  "analytics": {
    "period": "Last 28 Days",
    "coreMetrics": {
      "totalListeners": {"value": 431, "change": "+40%"},
      "totalStreams": {"value": 2459, "change": "+39%"},
      "streamsPerListener": {"value": 5.7, "change": "-1%"},
      "saves": {"value": 340, "change": "+196%"},
      "playlistAdds": {"value": 238, "change": "+65%"},
      "followers": {"value": 244, "change": "+3%"}
    },
    "discoverySources": {
      "active": {
        "total": 83,
        "breakdown": {
          "artistProfile": 54,
          "ownPlaylists": 33,
          "listenerQueue": 4
        }
      },
      "programmed": {
        "total": 12,
        "breakdown": {
          "algorithmicPlaylists": 3,
          "otherPlaylists": 3,
          "radioAutoplay": 6
        }
      },
      "other": 5
    },
    "demographics": {
      "gender": {"male": 54, "female": 38, "notSpecified": 8},
      "age": {
        "under18": 6, "18-24": 28, "25-34": 42,
        "35-44": 13, "45-54": 6, "55-64": 3, "65+": 2
      }
    },
    "topCountries": [
      {"name": "United States", "listeners": 405}
    ],
    "topCities": [
      {"name": "Dallas", "listeners": 15},
      {"name": "Los Angeles", "listeners": 13}
    ],
    "insights": [
      "Listener growth is accelerating",
      "Streams per listener are stable (repeat engagement)",
      "Discovery is primarily organic/human-driven"
    ]
  }
}
```

## Frontend Integration

The homepage (`home.html`) automatically loads analytics data from `data/parsed-stats.json`:

- **Automatic Loading**: `spotify-analytics-data.js` fetches the parsed data on page load
- **Fallback Data**: If no valid data is found, displays default/example analytics
- **Data Validation**: Checks for valid metrics before displaying parsed data
- **Visual Display**: `spotify-analytics.js` renders the data in the existing analytics dashboard

## Extractable Data Fields

The parser can extract the following information from screenshots:

### Core Metrics
- Total Listeners (with change %)
- Total Streams (with change %)
- Streams per Listener (with change %)
- Saves (with change %)
- Playlist Adds (with change %)
- Followers (with change %)

### Demographics
- **Gender**: Male, Female, Non-binary, Not Specified (percentages)
- **Age**: <18, 18-24, 25-34, 35-44, 45-54, 55-64, 65+ (percentages)

### Geography
- **Top Cities**: City names with listener counts
- **Top Countries**: Country names with listener counts

### Discovery Sources
- **Active Sources**: Total percentage and breakdown
  - Artist profile & catalog
  - Own playlists & library
  - Listener queue
- **Programmed Sources**: Total percentage and breakdown
  - Algorithmic playlists
  - Other listeners' playlists
  - Radio & autoplay
- **Other Sources**: Percentage

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
7. **Deletes processed screenshots** to prevent duplicate parsing

## Supported Image Formats

- PNG
- JPG/JPEG
- GIF
- BMP

## Tips for Best Results

- **Clear Screenshots**: Ensure text is readable and not blurry
- **Full Stats Pages**: Include complete analytics pages from Spotify for Artists
- **Multiple Screenshots**: Upload different sections (metrics, demographics, geography) as separate images
- **Regular Updates**: Upload fresh screenshots regularly to keep homepage data current

## Notes

- The OCR accuracy depends on image quality and text clarity
- Some screenshots may not contain recognizable stats patterns
- The system extracts only numeric values and text that match specific patterns
- Multiple screenshots are automatically consolidated into a single analytics view
- Processed screenshots are automatically deleted to prevent conflicting data in future runs
- The homepage will show default data if no valid parsed statistics are available

## Improving OCR Accuracy

If you're experiencing issues with OCR parsing accuracy:

1. **Review Your Screenshots**
   - Ensure images are high resolution (at least 720p)
   - Check that text is crisp and not blurry
   - Avoid heavy compression artifacts
   - Make sure all relevant text is visible (not cropped)

2. **Provide Example Screenshots**
   - Add example screenshots with known correct values to `inputs/ocr/screenshots/examples/`
   - Create ground truth JSON files following the template
   - See `inputs/ocr/screenshots/examples/README.md` for detailed instructions
   - This helps identify specific parsing issues

3. **Run Validation**
   - Use `python scripts/ocr/validate_ocr_examples.py` to test accuracy
   - Review the validation output to see which fields are failing
   - Share the validation results when reporting issues

4. **Report Issues**
   - Open a GitHub issue with:
     - The problematic screenshot (or a similar example)
     - What you expected to be extracted
     - What was actually extracted
     - Validation results if available
   - This helps improve the parser for everyone

5. **Contribute Improvements**
   - The parsing logic is in `scripts/ocr/parse_screenshots.py`
   - Regex patterns for each metric are clearly documented
   - Test your changes with the validation script
   - Submit a pull request with improvements
