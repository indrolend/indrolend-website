# Automated Screenshot Parsing System

This system automatically processes Spotify stats screenshots using OCR (Optical Character Recognition) to extract comprehensive analytics data including metrics, demographics, geography, and discovery sources.

## How It Works

1. **Upload Screenshots**: Add your Spotify stats screenshots to the `screenshots/` folder
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
├── .github/workflows/
│   └── parse-screenshots.yml    # GitHub Actions workflow
├── screenshots/                  # Upload your Spotify screenshots here
│   ├── README.md
│   └── *.png                    # Your screenshot files
├── scripts/
│   ├── parse_screenshots.py     # OCR parsing script
│   └── requirements.txt         # Python dependencies
├── data/
│   └── parsed-stats.json        # Output: parsed statistics and analytics
├── spotify-analytics-data.js    # Frontend data loader
└── spotify-analytics.js         # Frontend display renderer
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
