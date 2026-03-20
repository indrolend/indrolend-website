# OCR Example Screenshots System - Visual Guide

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPOTIFY STATS PROCESSING                      │
└─────────────────────────────────────────────────────────────────┘

TWO SEPARATE WORKFLOWS:

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│   REGULAR SCREENSHOT PROCESSING   │  │   EXAMPLE-BASED VALIDATION       │
│   (Updates Live Website Data)     │  │   (Improves OCR Accuracy)        │
└──────────────────────────────────┘  └──────────────────────────────────┘
              │                                      │
              ▼                                      ▼
      
    screenshots/                         screenshots/examples/
         │                                       │
         │ Put screenshots here                 │ Put examples here
         │ to process                           │ for validation
         │                                      │
         ▼                                      ▼
    
    GitHub Actions                        Manual Validation
    runs automatically                    (python script)
         │                                      │
         ▼                                      ▼
    
    parse_screenshots.py                validate_ocr_examples.py
    (OCR extraction)                     (Compare to ground truth)
         │                                      │
         ▼                                      ▼
    
    data/parsed-stats.json              data/validation-results.json
    (Website displays this)              (Accuracy metrics)
         │                                      │
         ▼                                      ▼
    
    Screenshots DELETED                  Examples PRESERVED
    (prevent duplicates)                 (for future reference)
```

## 📁 Directory Structure

```
indrolend-website/
│
├── screenshots/                         ← Upload screenshots HERE
│   ├── README.md                        ← Instructions for regular use
│   ├── *.png                            ← Your screenshots (auto-deleted)
│   │
│   └── examples/                        ← Put example screenshots HERE
│       ├── README.md                    ← Detailed instructions
│       ├── CONTRIBUTING.md              ← How to contribute examples
│       ├── TEMPLATE.json                ← Empty template to copy
│       ├── .gitkeep                     ← Keeps directory in git
│       │
│       ├── my-screenshot.png            ← Your example screenshot
│       └── my-screenshot.json           ← Ground truth data
│           {
│             "description": "...",
│             "expected_stats": {
│               "listeners": 431,
│               "streams": 2459
│             }
│           }
│
├── scripts/
│   ├── parse_screenshots.py             ← Main OCR parser
│   ├── validate_ocr_examples.py         ← NEW: Validation script
│   ├── requirements.txt                 ← Python dependencies
│   └── README.md                        ← Technical documentation
│
├── data/
│   ├── parsed-stats.json                ← Live website data
│   └── validation-results.json          ← Validation metrics
│
├── OCR_EXAMPLES_QUICK_START.md          ← NEW: Quick start guide
└── README.md                            ← NEW: Main repository README
```

## 🎯 When to Use Each System

### Use Regular Screenshots (`screenshots/`)
✅ When you want to update your website with new stats  
✅ When you have new Spotify data to display  
✅ For normal, day-to-day operations  
🗑️ Screenshots are **automatically deleted** after processing

### Use Example Screenshots (`screenshots/examples/`)
✅ When you want to help improve OCR accuracy  
✅ When you find the parser isn't extracting data correctly  
✅ When you want to test/validate the parser  
✅ When contributing improvements to the system  
💾 Examples are **preserved** in the repository

## 🔄 Workflow Comparison

### Regular Screenshot Workflow
```
1. Take screenshot from Spotify for Artists
   ↓
2. Upload to screenshots/ folder
   ↓
3. Push to GitHub
   ↓
4. GitHub Actions runs automatically
   ↓
5. OCR extracts statistics
   ↓
6. Data saved to parsed-stats.json
   ↓
7. Screenshot deleted
   ↓
8. Website shows updated data
```

### Example Screenshot Workflow
```
1. Take screenshot from Spotify for Artists
   ↓
2. Save to screenshots/examples/my-example.png
   ↓
3. Create screenshots/examples/my-example.json
   ↓
4. Manually transcribe correct values into JSON
   ↓
5. Run: python scripts/validate_ocr_examples.py
   ↓
6. Review accuracy report
   ↓
7. Commit both files to git
   ↓
8. Examples help improve future parsing
```

## 📝 Ground Truth JSON Format

### Minimal Example (Only 2 Fields)
```json
{
  "description": "Screenshot showing listeners and streams",
  "expected_stats": {
    "listeners": 431,
    "streams": 2459
  }
}
```

### Complete Example (All Available Fields)
```json
{
  "description": "Full analytics page from December 2025",
  "expected_stats": {
    "listeners": 431,
    "listeners_change": "+40%",
    "streams": 2459,
    "streams_change": "+39%",
    "streams_per_listener": 5.7,
    "streams_per_listener_change": "-1%",
    "saves": 340,
    "saves_change": "+196%",
    "playlist_adds": 238,
    "playlist_adds_change": "+65%",
    "followers": 244,
    "followers_change": "+3%",
    
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
      {"name": "Los Angeles", "listeners": 13}
    ],
    
    "top_countries": [
      {"name": "United States", "listeners": 405}
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
  "notes": "Optional notes about this screenshot"
}
```

## ⚙️ Commands Reference

### Process Regular Screenshots
```bash
# Automatic (GitHub Actions)
git add screenshots/*.png
git commit -m "Add new screenshots"
git push

# Manual
python scripts/parse_screenshots.py
```

### Validate Example Screenshots
```bash
# Install dependencies (one-time)
sudo apt-get install tesseract-ocr
pip install -r scripts/requirements.txt

# Run validation
python scripts/validate_ocr_examples.py
```

### Add New Example
```bash
# Copy template
cp screenshots/examples/TEMPLATE.json screenshots/examples/my-example.json

# Edit JSON with correct values
nano screenshots/examples/my-example.json

# Add screenshot with matching name
cp ~/my-screenshot.png screenshots/examples/my-example.png

# Test validation
python scripts/validate_ocr_examples.py

# Commit both files
git add screenshots/examples/my-example.*
git commit -m "Add OCR example: my-example"
git push
```

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Repository overview | Everyone |
| `OCR_EXAMPLES_QUICK_START.md` | Fast intro to examples | Users wanting to help |
| `screenshots/examples/README.md` | Detailed example guide | Contributors |
| `screenshots/examples/CONTRIBUTING.md` | Contribution guidelines | Contributors |
| `screenshots/examples/TEMPLATE.json` | Ground truth template | Contributors |
| `scripts/README.md` | Technical documentation | Developers |

## ❓ Quick FAQ

**Q: Where do I put screenshots to update my website?**  
A: Put them in `screenshots/` (not in the examples folder)

**Q: Where do I put example screenshots to help improve OCR?**  
A: Put them in `screenshots/examples/` with a matching .json file

**Q: Will my example screenshots be processed automatically?**  
A: No, examples are for validation only and must be run manually

**Q: Will my example screenshots be deleted?**  
A: No, examples are preserved in the repository

**Q: What format should the JSON file be in?**  
A: See TEMPLATE.json or the format examples above

**Q: How do I test my examples?**  
A: Run `python scripts/validate_ocr_examples.py`

**Q: Do I need to include all fields in the JSON?**  
A: No, only include fields visible in your screenshot

**Q: What if the OCR validation shows low accuracy?**  
A: This helps identify parsing issues - include notes in your JSON and open an issue

## 🎯 Key Differences Summary

| Aspect | Regular Screenshots | Example Screenshots |
|--------|-------------------|---------------------|
| **Location** | `screenshots/` | `screenshots/examples/` |
| **Purpose** | Update live data | Validate/improve parser |
| **Processing** | Automatic (GitHub Actions) | Manual (validation script) |
| **After Processing** | Deleted | Preserved |

   // ...existing code moved to ocr/OCR_SYSTEM_VISUAL_GUIDE.md ...
Choose your path:

1. **I want to update my website stats**
   → See `screenshots/README.md`
   → Upload to `screenshots/`

2. **I want to help improve OCR accuracy**
   → See `OCR_EXAMPLES_QUICK_START.md`
   → Upload to `screenshots/examples/`

3. **I want to understand the technical details**
   → See `scripts/README.md`
   → Review `parse_screenshots.py`

4. **I want to contribute examples**
   → See `screenshots/examples/CONTRIBUTING.md`
   → Follow the contribution guide

## 📞 Need Help?

- Check the detailed documentation in each README
- Review existing examples in `screenshots/examples/`
- Open an issue on GitHub
- Review the parser code in `scripts/parse_screenshots.py`

---

**Remember:** Examples are separate from regular processing. They help improve the system but don't update your live website data!
