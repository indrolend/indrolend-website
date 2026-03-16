# scripts/ocr — OCR Pipeline Scripts

> Repo map: `docs/README.md` · Pipeline inputs: `inputs/ocr/`

These scripts process Spotify for Artists screenshots using Tesseract OCR and write
parsed stats to `data/parsed-stats.json` for display in the legacy MPA.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `parse_screenshots.py` | Main OCR pipeline — reads `inputs/ocr/screenshots/`, writes `data/parsed-stats.json` |
| `validate_ocr_examples.py` | Validates OCR accuracy against ground truth examples |
| `generate_ground_truth_json.py` | Generates ground truth JSON files from `example_text` |

---

## Setup (one-time)

```bash
sudo apt-get install tesseract-ocr
pip install -r scripts/requirements.txt
```

---

## Running the pipeline

```bash
# Parse new screenshots (reads inputs/ocr/screenshots/, writes data/parsed-stats.json)
python scripts/ocr/parse_screenshots.py

# Validate OCR accuracy against training examples
python scripts/ocr/validate_ocr_examples.py

# Regenerate ground truth JSON files from example_text
python scripts/ocr/generate_ground_truth_json.py
```

---

## Input / output

| Path | Role |
|------|------|
| `inputs/ocr/screenshots/` | Input: drop new screenshots here |
| `inputs/ocr/screenshots/examples/` | Training examples (kept in git) |
| `data/parsed-stats.json` | Output: written by `parse_screenshots.py`; read by legacy MPA |

---

See `scripts/README.md` for overall pipeline context.
