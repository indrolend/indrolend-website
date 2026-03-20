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