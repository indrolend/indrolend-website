# OCR Examples Setup Summary

This document summarizes the setup of example screenshots with ground truth data for OCR validation.

## What Was Done

### 1. Example Images
- **14 example screenshots** (IMG_0736.png through IMG_0749.png) were uploaded to `screenshots/examples/`
- These images show various Spotify analytics screens from the Spotify for Artists interface

### 2. Ground Truth Data
- A plain text file `example_text` was created containing all the correct values from the screenshots
- This includes:
  - Core Performance Metrics (listeners, streams, followers, etc.)
  - Demographics (gender and age distributions)
  - Geography (top cities and countries)
  - Source of Streams (active, programmed, and other sources)
- **Total metrics captured**: 34 different data points

### 3. JSON Ground Truth Files
- Created **14 JSON files** (one for each image) containing structured ground truth data
- Generated automatically using `scripts/generate_ground_truth_json.py`
- Each JSON file contains:
  - Description of the screenshot
  - Expected statistics (all 34 metrics from example_text)
  - Notes about data generation

### 4. Generation Script
- Created `scripts/generate_ground_truth_json.py` to automate JSON file creation
- The script:
  - Parses the `example_text` file
  - Extracts all metrics using regex patterns
  - Handles Unicode characters (e.g., special apostrophes U+2019)
  - Generates properly formatted JSON files for validation

### 5. Documentation
- Updated `screenshots/examples/README.md` to explain the current setup
- Updated `scripts/README.md` with instructions for using the generation script
- Added information about how to refine JSON files for better validation

## Current State

### File Structure
```
screenshots/examples/
├── example_text              # Plain text ground truth data
├── IMG_0736.png/.json       # Example image 1 + ground truth
├── IMG_0737.png/.json       # Example image 2 + ground truth
├── IMG_0738.png/.json       # Example image 3 + ground truth
├── IMG_0739.png/.json       # Example image 4 + ground truth
├── IMG_0740.png/.json       # Example image 5 + ground truth
├── IMG_0741.png/.json       # Example image 6 + ground truth
├── IMG_0742.png/.json       # Example image 7 + ground truth
├── IMG_0743.png/.json       # Example image 8 + ground truth
├── IMG_0744.png/.json       # Example image 9 + ground truth
├── IMG_0745.png/.json       # Example image 10 + ground truth
├── IMG_0746.png/.json       # Example image 11 + ground truth
├── IMG_0747.png/.json       # Example image 12 + ground truth
├── IMG_0748.png/.json       # Example image 13 + ground truth
├── IMG_0749.png/.json       # Example image 14 + ground truth
└── example-core-metrics.json # Sample template
```

### Metrics Included
The ground truth data includes:

**Core Metrics (12 fields):**
- listeners, listeners_change
- streams, streams_change
- streams_per_listener, streams_per_listener_change
- saves, saves_change
- playlist_adds, playlist_adds_change
- followers, followers_change

**Demographics (11 fields):**
- Gender: male, female, non_binary, not_specified
- Age: under_18, 18_24, 25_34, 35_44, 45_54, 55_64, 65_plus

**Geography (2 fields):**
- top_cities (array of city/listener objects)
- top_countries (array of country/listener objects)

**Discovery Sources (9 fields):**
- Active: active_total, artist_profile, own_playlists, listener_queue
- Programmed: programmed_total, algorithmic_playlists, other_playlists, radio_autoplay
- Other: other

## How to Use

### Running Validation
To validate OCR accuracy against these examples:

```bash
# Install dependencies (if not already installed)
sudo apt-get install tesseract-ocr
pip install -r scripts/requirements.txt

# Run validation
python scripts/validate_ocr_examples.py
```

This will:
1. Process each screenshot with OCR
2. Extract metrics using the parser
3. Compare against ground truth JSON files
4. Report accuracy for each example
5. Save detailed results to `data/validation-results.json`

### Regenerating JSON Files
If you modify the `example_text` file or want to regenerate the JSON files:

```bash
python scripts/generate_ground_truth_json.py
```

### Refining JSON Files
The generated JSON files contain **all metrics** from example_text. Since each screenshot may only show a subset of metrics, you can:

1. Run validation to see which metrics are actually extractable
2. Edit individual JSON files to remove metrics not visible in that screenshot
3. This improves validation accuracy by only checking relevant metrics

## Next Steps

### Optional Improvements
1. **Run OCR Validation**: Test the current parser accuracy against these examples
2. **Refine JSON Files**: Edit individual JSON files to match what's visible in each screenshot
3. **Improve Parser**: Based on validation results, update regex patterns in `parse_screenshots.py`
4. **Add More Examples**: Capture additional screenshots showing different states or edge cases

### For Better Accuracy
- Each screenshot likely shows different sections of the analytics dashboard
- Consider creating subset JSON files that only include metrics visible in each specific screenshot
- This will give more accurate validation results and help identify specific parsing issues

## Benefits of This Setup

1. **Automated Validation**: Can now test OCR accuracy automatically
2. **Ground Truth Reference**: Clear documentation of what should be extracted
3. **Parser Development**: Easier to improve and test parsing logic
4. **Regression Testing**: Ensures future changes don't break existing functionality
5. **Documentation**: Example data helps new contributors understand the system

## Technical Details

### Unicode Handling
The script correctly handles special Unicode characters:
- Right single quotation mark (U+2019): ' → used in "Listener's" 
- This was important for parsing fields like "Listener's own playlists"

### Data Format
- Numbers: integers without commas (e.g., 2476 not "2,476")
- Percentages: strings with sign (e.g., "+38%" or "-5%")
- Floats: decimals for ratios (e.g., 5.8 for streams per listener)
- Lists: arrays of objects with name and listeners fields

### Validation Approach
The validation script (`validate_ocr_examples.py`) compares:
- Exact matches for numbers and strings
- Set comparison for geography lists
- Reports: correct, incorrect, missing, and extra fields
- Calculates overall accuracy percentage

## Summary

✅ **Completed**: OCR example system is fully set up with 14 example screenshots, ground truth data, automated JSON generation, and comprehensive documentation.

✅ **Ready to Use**: The validation system can now be used to test and improve OCR parsing accuracy.

✅ **Maintainable**: Scripts and documentation make it easy to add more examples or regenerate data as needed.
