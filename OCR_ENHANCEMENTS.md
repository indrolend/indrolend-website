# OCR Enhancement Guide

This document describes the recent enhancements to the OCR screenshot parsing system, including improved accuracy, validation, and debugging capabilities.

## Overview

The OCR system has been enhanced with:
- **Advanced image preprocessing** for better text extraction
- **Enhanced regex patterns** with improved matching logic
- **Timezone support** for accurate timestamps
- **Debug mode** for troubleshooting
- **Detailed validation reporting** with per-field accuracy metrics
- **Unresolved field tracking** for identifying parsing gaps

## Recent Improvements

### 1. Image Preprocessing

The system now applies multiple preprocessing steps to improve OCR accuracy:

- **Upscaling**: Images are upscaled to at least 2400px on the longer side for better text recognition
- **Grayscale conversion**: Simplifies the image for OCR processing
- **Dark mode detection**: Automatically inverts colors when dark backgrounds are detected (Tesseract expects dark text on light background)
- **Denoising**: Reduces image noise using OpenCV's fastNlMeansDenoising
- **Contrast enhancement**: Uses CLAHE (Contrast Limited Adaptive Histogram Equalization) for better text visibility

### 2. Multi-Configuration OCR

The system tries multiple Tesseract configurations and selects the best result:

1. Preprocessed image with PSM 3 (fully automatic page segmentation)
2. Preprocessed image with PSM 11 (sparse text detection)
3. Original image with PSM 3
4. Original image with PSM 6 (uniform block of text)

This multi-pass approach maximizes text extraction from challenging screenshots.

### 3. Enhanced Regex Patterns

Parsing patterns have been improved to handle:
- Multiple spacing variations and line breaks
- OCR errors and character substitutions
- Various percentage formats
- Complex city/country name patterns
- Discovery source variations

### 4. Timezone Support

Timestamps now support configurable timezones:

```bash
# Use specific timezone
python scripts/parse_screenshots.py --timezone America/New_York

# Default is UTC
python scripts/parse_screenshots.py
```

Available timezones: Any valid pytz timezone (e.g., `America/Los_Angeles`, `Europe/London`, `Asia/Tokyo`)

### 5. Debug Mode

Enable debug mode for detailed logging:

```bash
# Parse screenshots with debug output
python scripts/parse_screenshots.py --debug

# This will:
# - Save intermediate preprocessing images to /tmp/ocr_debug/
# - Print detailed OCR extraction stats
# - Show which fields were successfully extracted vs. unresolved
# - Log regex pattern matching results
```

### 6. Validation Enhancements

The validation script now provides comprehensive per-field accuracy metrics:

```bash
# Run validation
python scripts/validate_ocr_examples.py

# With debug mode
python scripts/validate_ocr_examples.py --debug
```

**Validation Report Includes:**

- **Overall accuracy**: Percentage of correctly extracted fields
- **Per-field accuracy**: Success rate for each field type (listeners, streams, demographics, etc.)
- **Category-level breakdown**: Accuracy grouped by category (Core Metrics, Demographics, Geography, Discovery Sources)
- **Per-example results**: Individual screenshot accuracy scores
- **Detailed mismatch analysis**: Shows expected vs. actual values for incorrect extractions

Example output:
```
PER-FIELD ACCURACY
======================================================================

Core Metrics:
  ✗ listeners                                 1/14 (  7.1%)
  ✗ streams                                   1/14 (  7.1%)
  ✗ playlist_adds                             2/14 ( 14.3%)
  Category Total:                          8/168 (4.8%)

Discovery Sources:
  ⚠ discovery_active_total                    7/14 ( 50.0%)
  ✗ discovery_programmed_total                2/14 ( 14.3%)
  Category Total:                          15/126 (11.9%)
```

### 7. Unresolved Field Tracking

The system now tracks which fields it attempted to extract but failed:

- Per-screenshot unresolved fields are included in the output JSON
- A summary debug file (`unresolved-fields-debug.json`) lists all unique unresolved fields
- Helps identify which patterns need improvement

## Usage

### Basic Parsing

```bash
cd /home/runner/work/indrolend-website/indrolend-website

# Parse screenshots (default settings)
python scripts/parse_screenshots.py

# Parse with specific timezone
python scripts/parse_screenshots.py --timezone America/New_York

# Parse with debug output
python scripts/parse_screenshots.py --debug
```

### Validation

```bash
# Validate against example screenshots
python scripts/validate_ocr_examples.py

# Validate with debug output
python scripts/validate_ocr_examples.py --debug

# Use custom paths
python scripts/validate_ocr_examples.py \
  --examples-dir /path/to/examples \
  --output-file /path/to/output.json
```

### Output Files

After running the parser:

1. **`data/parsed-stats.json`**: Main output with extracted statistics
2. **`data/unresolved-fields-debug.json`**: Debug file listing fields that couldn't be extracted
3. **`data/validation-results.json`**: Validation results (when running validation)

When debug mode is enabled:
4. **`/tmp/ocr_debug/`**: Directory containing intermediate preprocessing images

## Configuration Options

### Parse Screenshots

| Option | Description | Default |
|--------|-------------|---------|
| `--debug` | Enable debug mode with verbose output | OFF |
| `--timezone` | Timezone for timestamps | UTC |
| `--screenshots-dir` | Directory containing screenshots | `screenshots/` |
| `--output-file` | Output JSON file path | `data/parsed-stats.json` |

### Validate Examples

| Option | Description | Default |
|--------|-------------|---------|
| `--debug` | Enable debug mode | OFF |
| `--examples-dir` | Directory with example screenshots | `screenshots/examples/` |
| `--output-file` | Output JSON file for validation | `data/validation-results.json` |

## Dependencies

New dependencies added:

```
pytesseract==0.3.13
Pillow==12.0.0
pytz==2024.2
opencv-python==4.10.0.84
numpy==2.2.1
```

Install with:
```bash
pip install -r scripts/requirements.txt
```

## Current Performance

Based on validation with 14 example screenshots:

- **Overall accuracy**: 7.1%
- **Best performing field**: `discovery_active_total` (50.0%)
- **Category performance**:
  - Discovery Sources: 11.9%
  - Demographics - Age: 11.2%
  - Core Metrics: 4.8%
  - Geography: 0.0%

**Note**: The relatively low overall accuracy is due to the complexity of the mobile UI screenshots. The images contain many visual elements, charts, and formatted text that make OCR challenging. The preprocessing and enhanced patterns provide incremental improvements, with the best results on simpler numeric fields.

## Troubleshooting

### Low OCR Accuracy

If OCR accuracy is lower than expected:

1. **Check image quality**: Ensure screenshots are high resolution (at least 1200px on the longer side)
2. **Review debug images**: Enable debug mode and check `/tmp/ocr_debug/` to see preprocessing results
3. **Verify ground truth**: Ensure ground truth JSON files match what's actually visible in the screenshots
4. **Test different screenshots**: Try with screenshots that have clearer text and less UI clutter
5. **Adjust preprocessing**: The preprocessing parameters in `preprocess_image()` can be tuned

### Missing Fields

If certain fields are consistently not extracted:

1. **Check unresolved fields**: Review `data/unresolved-fields-debug.json` to see which fields are being attempted
2. **Enable debug mode**: Run with `--debug` to see regex matching details
3. **Review regex patterns**: The patterns in `parse_spotify_stats()` may need adjustment for your specific screenshot format
4. **Check OCR text**: Debug mode shows the extracted text; verify the expected text is actually present

### Dark Mode Screenshots

The system automatically detects and handles dark mode screenshots by inverting colors. If you have issues:

1. Check the mean brightness value in debug output
2. Manually verify the preprocessed images in `/tmp/ocr_debug/`
3. The threshold is 127 (mean brightness < 127 = dark mode)

## Future Improvements

Potential areas for further enhancement:

1. **Machine learning**: Use ML-based OCR engines like EasyOCR or PaddleOCR
2. **Template matching**: Use computer vision to locate specific UI elements
3. **Custom training**: Fine-tune Tesseract for Spotify UI fonts and layouts
4. **Region-specific extraction**: Process specific regions of interest instead of full screenshot
5. **Screenshot format detection**: Automatically detect screenshot type and apply appropriate processing

## Contributing

When adding new fields or improving patterns:

1. Add ground truth examples to `screenshots/examples/`
2. Run validation to establish baseline accuracy
3. Make improvements to parsing patterns
4. Re-run validation to verify improvements
5. Document any new fields in ground truth JSON template

See `screenshots/examples/README.md` for details on adding ground truth examples.
