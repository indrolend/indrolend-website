# inputs — Pipeline Input Staging

This directory holds raw input files for offline pipelines (OCR, Spotify exports).
Nothing here is served to the browser at runtime.

---

## Structure

```
inputs/
├── ocr/
│   └── screenshots/
│       ├── examples/   OCR training examples with ground truth JSON (kept in git)
│       └── *.png       Drop new screenshots here; auto-deleted after OCR parse
└── spotify/
    └── exports/        Raw Spotify data export files (CSV, JSON) — staging only
```

---

## OCR screenshots

- **New screenshots:** drop PNG/JPG files into `inputs/ocr/screenshots/`.
  The OCR pipeline (`scripts/ocr/parse_screenshots.py`) processes them and writes
  output to `data/parsed-stats.json`, then deletes the processed files.
- **Training examples:** `inputs/ocr/screenshots/examples/` contains reference
  screenshots with matching `.json` ground truth files. These are kept in git.
  See `inputs/ocr/screenshots/examples/README.md` for the format.

## Spotify exports

- Place raw Spotify for Artists CSV or JSON exports in `inputs/spotify/exports/`.
- These are staging inputs only — do not reference them from runtime code.

---

See `scripts/ocr/README.md` and `scripts/spotify/README.md` for how to run pipelines.
