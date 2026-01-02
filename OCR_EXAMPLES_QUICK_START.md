# Quick Start: Providing OCR Training Examples

This guide helps you quickly provide example screenshots to improve OCR parsing accuracy.

## The Problem

The OCR parser extracts Spotify statistics from screenshots, but it may not always parse information accurately. To help improve accuracy, you can provide example screenshots with the correct values clearly documented.

## The Solution

Provide **reference examples** with **ground truth data** (the correct values that should be extracted).

## How to Do It (5 Minutes)

### Step 1: Save Your Screenshot

Place your screenshot in the examples folder:
```
screenshots/examples/my-screenshot.png
```

### Step 2: Create a Ground Truth File

Create a JSON file with the same name:
```
screenshots/examples/my-screenshot.json
```

### Step 3: Fill in the Correct Values

Copy this template and fill in ONLY the values you see in your screenshot:

```json
{
  "description": "What your screenshot shows",
  "expected_stats": {
    "listeners": 431,
    "listeners_change": "+40%",
    "streams": 2459,
    "streams_change": "+39%",
    "playlist_adds": 238,
    "followers": 244
  },
  "notes": "Optional: any special notes"
}
```

**Key points:**
- ✅ Remove any fields NOT visible in your screenshot
- ✅ Numbers should be integers (no commas): `2459` not `"2,459"`
- ✅ Percentages include the sign: `"+40%"` not `"40%"`
- ✅ Double-check every number for accuracy

### Step 4: Commit Both Files

```bash
git add screenshots/examples/my-screenshot.png
git add screenshots/examples/my-screenshot.json
git commit -m "Add OCR example: my-screenshot"
git push
```

## Available Fields

You can include any of these fields that appear in your screenshot:

### Core Metrics
```json
{
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
  "saves_change": "+196%"
}
```

### Demographics
```json
{
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
  "age_65_plus": 2
}
```

### Geography
```json
{
  "top_cities": [
    {"name": "Dallas", "listeners": 15},
    {"name": "Los Angeles", "listeners": 13}
  ],
  "top_countries": [
    {"name": "United States", "listeners": 405}
  ]
}
```

### Discovery Sources
```json
{
  "discovery_active_total": 83,
  "discovery_artist_profile": 54,
  "discovery_own_playlists": 33,
  "discovery_listener_queue": 4,
  
  "discovery_programmed_total": 12,
  "discovery_algorithmic_playlists": 3,
  "discovery_other_playlists": 3,
  "discovery_radio_autoplay": 6,
  
  "discovery_other": 5
}
```

## Testing Your Example (Optional)

If you have Python and dependencies installed:

```bash
# Install dependencies
sudo apt-get install tesseract-ocr
pip install -r scripts/requirements.txt

# Run validation
python scripts/validate_ocr_examples.py
```

This will show how accurately the OCR parser extracts data from your example.

## Need More Help?

- **Detailed guide**: See `screenshots/examples/README.md`
- **Contributing guide**: See `screenshots/examples/CONTRIBUTING.md`
- **Template**: Copy `screenshots/examples/TEMPLATE.json`
- **Example**: Look at `screenshots/examples/example-core-metrics.json`

## Important Notes

⚠️ **Examples vs Regular Screenshots**

| Regular Screenshots | Example Screenshots |
|-------------------|-------------------|
| Place in `screenshots/` | Place in `screenshots/examples/` |
| Automatically processed | Used for validation only |
| Deleted after parsing | Kept in repository |
| Updates live data | Helps improve accuracy |

✅ **Use regular screenshots** to update your website analytics  
✅ **Use examples** to help improve OCR parsing accuracy

## Questions?

Open an issue or check the detailed documentation in `screenshots/examples/`.

Thank you for helping improve the OCR system! 🙏
