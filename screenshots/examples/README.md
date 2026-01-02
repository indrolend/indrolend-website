# OCR Training Examples

This directory contains example screenshots with **ground truth** annotations to help improve and validate the OCR parsing accuracy.

## Purpose

The OCR parser extracts Spotify statistics from screenshots. However, OCR accuracy can vary based on:
- Image quality and resolution
- Font rendering and size
- Screenshot compression
- Text positioning and layout

By providing example screenshots with **known correct values**, you help:
1. **Validate** the OCR parser's accuracy
2. **Identify** patterns that work well or poorly
3. **Debug** parsing issues with specific metric types
4. **Test** regex patterns and extraction logic
5. **Document** expected behavior with real-world examples

## How to Provide Example Screenshots

### Step 1: Add Your Screenshot

Place your screenshot file in this `screenshots/examples/` directory with a descriptive name:

```
screenshots/examples/spotify-stats-core-metrics.png
screenshots/examples/spotify-stats-demographics.png
screenshots/examples/spotify-stats-geography.png
screenshots/examples/spotify-stats-discovery-sources.png
```

**Supported formats**: PNG, JPG/JPEG, GIF, BMP

### Step 2: Create the Ground Truth JSON

For each screenshot, create a corresponding `.json` file with the **same filename** but `.json` extension:

```
screenshots/examples/spotify-stats-core-metrics.png
screenshots/examples/spotify-stats-core-metrics.json  ← Ground truth data
```

The JSON file should contain the **exact correct values** that should be extracted from the screenshot.

## Ground Truth JSON Format

Use the JSON template below and fill in **only the fields visible in your screenshot**. Remove any fields that don't appear in your screenshot.

```json
{
  "description": "Brief description of what this screenshot shows",
  "expected_stats": {
    "playlist_adds": 238,
    "playlist_adds_change": "+65%",
    "followers": 244,
    "followers_change": "+3%",
    "listeners": 431,
    "listeners_change": "+40%",
    "streams": 2459,
    "streams_change": "+39%",
    "streams_per_listener": 5.7,
    "streams_per_listener_change": "-1%",
    "saves": 340,
    "saves_change": "+196%",
    
    "gender_male": 54,
    "gender_female": 38,
    "gender_non_binary": 0,
    "gender_not_specified": 8,
    
    "age_under_18": 6,
    "age_18_24": 28,
    "age_25_34": 42,
    "age_35_44": 13,
    "age_45_54": 6,
    "age_55_64": 3,
    "age_65_plus": 2,
    
    "top_cities": [
      {"name": "Dallas", "listeners": 15},
      {"name": "Los Angeles", "listeners": 13},
      {"name": "Austin", "listeners": 10}
    ],
    
    "top_countries": [
      {"name": "United States", "listeners": 405},
      {"name": "Canada", "listeners": 12},
      {"name": "United Kingdom", "listeners": 8}
    ],
    
    "discovery_active_total": 83,
    "discovery_artist_profile": 54,
    "discovery_own_playlists": 33,
    "discovery_listener_queue": 4,
    
    "discovery_programmed_total": 12,
    "discovery_algorithmic_playlists": 3,
    "discovery_other_playlists": 3,
    "discovery_radio_autoplay": 6,
    
    "discovery_other": 5
  },
  "notes": "Optional: Any additional notes about this screenshot, special conditions, or known issues"
}
```

## Complete Example

### File: `spotify-stats-overview-2025-12.png`

Screenshot showing: Listeners (431, +40%), Streams (2,459, +39%), and Streams per Listener (5.7, -1%)

### File: `spotify-stats-overview-2025-12.json`

```json
{
  "description": "Overview page showing core metrics for December 2025",
  "expected_stats": {
    "listeners": 431,
    "listeners_change": "+40%",
    "streams": 2459,
    "streams_change": "+39%",
    "streams_per_listener": 5.7,
    "streams_per_listener_change": "-1%"
  },
  "notes": "High quality screenshot from iPhone 14, clear text rendering"
}
```

## Field Reference

### Core Metrics

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `playlist_adds` | integer | Number of playlist additions | 238 |
| `playlist_adds_change` | string | Change percentage with +/- sign | "+65%" |
| `followers` | integer | Number of followers | 244 |
| `followers_change` | string | Change percentage | "+3%" |
| `listeners` | integer | Total unique listeners | 431 |
| `listeners_change` | string | Change percentage | "+40%" |
| `streams` | integer | Total streams | 2459 |
| `streams_change` | string | Change percentage | "+39%" |
| `streams_per_listener` | float | Average streams per listener | 5.7 |
| `streams_per_listener_change` | string | Change percentage | "-1%" |
| `saves` | integer | Number of saves | 340 |
| `saves_change` | string | Change percentage | "+196%" |

### Demographics - Gender

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `gender_male` | integer | Male percentage | 54 |
| `gender_female` | integer | Female percentage | 38 |
| `gender_non_binary` | integer | Non-binary percentage | 0 |
| `gender_not_specified` | integer | Not specified percentage | 8 |

### Demographics - Age

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `age_under_18` | integer | Under 18 percentage | 6 |
| `age_18_24` | integer | 18-24 percentage | 28 |
| `age_25_34` | integer | 25-34 percentage | 42 |
| `age_35_44` | integer | 35-44 percentage | 13 |
| `age_45_54` | integer | 45-54 percentage | 6 |
| `age_55_64` | integer | 55-64 percentage | 3 |
| `age_65_plus` | integer | 65+ percentage | 2 |

### Geography

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `top_cities` | array | List of cities with listener counts | See example above |
| `top_countries` | array | List of countries with listener counts | See example above |

### Discovery Sources

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `discovery_active_total` | integer | Total active sources percentage | 83 |
| `discovery_artist_profile` | integer | Artist profile percentage | 54 |
| `discovery_own_playlists` | integer | Own playlists percentage | 33 |
| `discovery_listener_queue` | integer | Listener queue percentage | 4 |
| `discovery_programmed_total` | integer | Total programmed sources percentage | 12 |
| `discovery_algorithmic_playlists` | integer | Algorithmic playlists percentage | 3 |
| `discovery_other_playlists` | integer | Other playlists percentage | 3 |
| `discovery_radio_autoplay` | integer | Radio & autoplay percentage | 6 |
| `discovery_other` | integer | Other sources percentage | 5 |

## Tips for High-Quality Examples

### Screenshot Quality
- ✅ Use high-resolution screenshots (at least 720p)
- ✅ Ensure text is crisp and clear
- ✅ Avoid motion blur or compression artifacts
- ✅ Include the full metric section without cropping mid-text

### Ground Truth Accuracy
- ✅ **Double-check all numbers** - transcription errors defeat the purpose!
- ✅ **Match exact formatting** - if it says "+40%" include the + sign
- ✅ **Include all visible metrics** - even if they're zero or unchanged
- ✅ **Spell names correctly** - especially for cities and countries

### Coverage
Try to provide examples that cover:
- Different metric types (core, demographics, geography, discovery)
- Different value ranges (small numbers, large numbers, decimals)
- Different change indicators (positive, negative, zero)
- Different UI states (light mode, dark mode, different Spotify versions)
- Edge cases (0%, 100%, very large listener counts)

## Using These Examples

### For Validation

Run the validation script to test OCR accuracy against your examples:

```bash
python scripts/validate_ocr_examples.py
```

This will:
1. Process each example screenshot with OCR
2. Compare extracted values to ground truth
3. Report accuracy metrics and discrepancies
4. Help identify parsing improvements needed

### For Development

When improving the OCR parser:
1. Add examples showing the issue you're trying to fix
2. Update the parsing logic in `scripts/parse_screenshots.py`
3. Run validation to verify improvements
4. Check that existing examples still pass

## File Organization

```
screenshots/examples/
├── README.md (this file)
├── TEMPLATE.json (empty template for new examples)
│
├── core-metrics-example-1.png
├── core-metrics-example-1.json
│
├── demographics-gender-example-1.png
├── demographics-gender-example-1.json
│
├── demographics-age-example-1.png
├── demographics-age-example-1.json
│
├── geography-cities-example-1.png
├── geography-cities-example-1.json
│
├── discovery-sources-example-1.png
└── discovery-sources-example-1.json
```

## Important Notes

⚠️ **These examples are NOT automatically processed** - They are reference data only. The examples:
- Are used for **validation and testing** purposes
- Help **document expected behavior**
- Serve as **training data** for improving the parser
- Are **committed to the repository** (unlike regular screenshots which are deleted after processing)

✅ **Regular screenshots** go in `screenshots/` (parent directory) and are:
- Automatically processed by the OCR parser
- Deleted after successful parsing
- Used to update your live analytics data

## Questions or Issues?

If you encounter problems or have questions about providing examples:
1. Check the validation output for specific error messages
2. Review existing examples for reference
3. Open an issue describing the problem with your screenshot
4. Include both the screenshot and the expected values in your issue report
