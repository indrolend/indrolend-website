# Contributing OCR Training Examples

Thank you for helping improve the OCR parsing accuracy! This guide will help you contribute high-quality example screenshots with ground truth annotations.

## Quick Start

1. **Take or collect a screenshot** from Spotify for Artists showing clear statistics
2. **Save it** to `screenshots/examples/` with a descriptive name (e.g., `core-metrics-dec-2025.png`)
3. **Create a ground truth file** with the same name but `.json` extension (e.g., `core-metrics-dec-2025.json`)
4. **Fill in the expected values** - manually transcribe what you see in the screenshot
5. **Test it** by running `python scripts/validate_ocr_examples.py`
6. **Commit both files** and create a pull request

## Why This Helps

The OCR parser uses pattern matching to extract statistics from screenshots. Your examples help:

- **Validate** that the parser works correctly
- **Identify** edge cases and failure modes  
- **Test** improvements to the parsing logic
- **Document** the variety of layouts and formats Spotify uses
- **Prevent regressions** when updating the parser

## What Makes a Good Example

### Screenshot Quality ✅

- **High resolution**: At least 720p, preferably 1080p or higher
- **Clear text**: Sharp, no motion blur, good contrast
- **Complete sections**: Don't crop mid-text or cut off numbers
- **Original format**: PNG preferred, avoid re-compression
- **Readable UI**: All relevant text and numbers are legible

### Ground Truth Quality ✅

- **Accurate transcription**: Double-check every number!
- **Exact formatting**: Match percentage signs, commas, etc.
- **Complete data**: Include all visible metrics, even zeros
- **Correct spelling**: Especially for city and country names
- **Descriptive metadata**: Add notes about special conditions

### Coverage ✅

We need examples that cover various scenarios:

#### Metric Types
- Core metrics (listeners, streams, saves, etc.)
- Demographics (gender, age distributions)
- Geography (cities, countries)
- Discovery sources (active, programmed, other)

#### Value Ranges
- Small numbers (0-10)
- Medium numbers (10-1000)
- Large numbers (1000+)
- Decimal values (e.g., streams per listener)
- Percentages with different signs (+, -, no sign)

#### UI Variations
- Different Spotify app versions
- Light mode vs dark mode (if applicable)
- Different device types (iPhone, Android, desktop)
- Different languages (if you have access)

#### Edge Cases
- Values of exactly 0
- Values of exactly 100%
- Very large listener counts
- Cities/countries with special characters
- Multiple cities with the same listener count

## Step-by-Step Guide

### 1. Prepare Your Screenshot

Take a screenshot from Spotify for Artists:
- Open the Spotify for Artists app or website
- Navigate to a stats page (Audience, Demographics, etc.)
- Take a high-quality screenshot
- Save it with a descriptive name

**Naming convention:**
```
[category]-[subcategory]-[date/version].png

Examples:
- core-metrics-overview-2025-12.png
- demographics-gender-2025-12.png
- geography-top-cities-2025-12.png
- discovery-sources-active-2025-12.png
```

### 2. Create the Ground Truth File

Copy the template:
```bash
cp screenshots/examples/TEMPLATE.json screenshots/examples/your-filename.json
```

Or create a new file with this structure:
```json
{
  "description": "What this screenshot shows",
  "expected_stats": {
    "listeners": 431,
    "listeners_change": "+40%"
  },
  "notes": "Any special notes"
}
```

### 3. Transcribe the Data

**Carefully** transcribe each visible metric from your screenshot:

#### For Numbers
- Remove commas from numbers: "2,459" → `2459`
- Keep decimals: "5.7" → `5.7`
- Integer vs float matters: `5` (integer) vs `5.0` (float)

#### For Percentages
- Include the sign: "+40%" not "40%" or "+40"
- Match exact formatting: `"+40%"` as a string
- Negative percentages: `"-5%"`

#### For Geography Lists
```json
"top_cities": [
  {"name": "Dallas", "listeners": 15},
  {"name": "Los Angeles", "listeners": 13},
  {"name": "Austin", "listeners": 10}
]
```

- Spell city/country names exactly as shown
- Include all visible entries
- Preserve the order if meaningful

#### For Demographics
- Percentages as integers: `54` not `"54%"` or `0.54`
- Must sum to 100 (or close, allowing for rounding)

### 4. Remove Unused Fields

**Important**: Remove any fields from the template that are NOT visible in your screenshot.

For example, if your screenshot only shows listeners and streams:
```json
{
  "description": "Core metrics overview",
  "expected_stats": {
    "listeners": 431,
    "streams": 2459
  }
}
```

Don't include fields set to `null` - just remove them entirely.

### 5. Validate Your Example

Run the validation script:
```bash
python scripts/validate_ocr_examples.py
```

Look for your screenshot in the output:
```
======================================================================
Validating: your-filename.png
======================================================================
Description: Your description here
Expected fields: 2

Running OCR extraction...
Extracted fields: 2

Results:
  ✓ Correct:           2
  ✗ Incorrect:         0
  ⚠ Missing:           0
  + Extra:             0
  Accuracy:            100.0%
```

If accuracy is low, check:
- Did you transcribe the numbers correctly?
- Is the screenshot clear and readable?
- Are there OCR issues that need to be fixed in the parser?

### 6. Document Issues

If validation shows problems, add notes to your JSON:

```json
{
  "description": "Core metrics with problematic OCR",
  "expected_stats": {
    "listeners": 431
  },
  "notes": "OCR currently misreads '1' as 'l' in this screenshot due to font rendering. This is a known issue that should be fixed."
}
```

### 7. Submit Your Contribution

1. **Commit both files**:
   ```bash
   git add screenshots/examples/your-filename.png
   git add screenshots/examples/your-filename.json
   git commit -m "Add OCR example: your-filename"
   ```

2. **Push and create a pull request**:
   ```bash
   git push origin your-branch-name
   ```

3. **In your PR description**, mention:
   - What metrics the example covers
   - Any notable features or edge cases
   - The validation accuracy achieved
   - Any parsing issues discovered

## Field Reference

See `screenshots/examples/README.md` for a complete list of all extractable fields and their expected formats.

## Common Mistakes to Avoid

❌ **Don't** include fields that aren't visible in your screenshot
❌ **Don't** leave fields as `null` - remove them instead  
❌ **Don't** include commas in numeric values: use `2459` not `"2,459"`
❌ **Don't** forget the +/- sign in percentage changes
❌ **Don't** use floats for percentages: use `54` not `0.54`
❌ **Don't** submit blurry or low-resolution screenshots
❌ **Don't** crop important text out of the screenshot

✅ **Do** transcribe exactly what you see
✅ **Do** double-check all numbers
✅ **Do** test with the validation script
✅ **Do** add descriptive notes
✅ **Do** use high-quality, clear screenshots
✅ **Do** cover diverse metric types and value ranges

## Questions?

- Review existing examples in `screenshots/examples/`
- Check the detailed README: `screenshots/examples/README.md`
- Look at the parser code: `scripts/parse_screenshots.py`
- Open an issue if you need help

## Thank You! 🙏

Your contributions help make the OCR parser more accurate and reliable for everyone. Every example helps improve the system!
