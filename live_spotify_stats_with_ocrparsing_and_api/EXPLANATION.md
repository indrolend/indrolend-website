# Feature Explanation: Live Spotify Stats with OCR Parsing and API Calls

## What is this folder?
This folder is the consolidated home for all code, scripts, and documentation related to the feature: **live updating Spotify stats using OCR parsing, API calls, and bot scraping**. The goal is to provide a unified, traceable, and maintainable pipeline for gathering Spotify stats, which can be displayed in a widget, SPA section, or standalone page.

## Why was it created?
Previously, the code for this feature was scattered across the repository: scripts, helpers, legacy folders, and docs were disjointed, making it hard to trace ownership, debug, or extend the feature. This folder was created to:
- Group all related files in one place
- Clarify feature ownership and boundaries
- Make the pipeline easier to understand, modify, and repair
- Enable simple external connections for display in the SPA or legacy MPA

## What does it contain?
- **OCR pipeline:** Scripts, examples, and docs for parsing Spotify stats from screenshots
- **API/bot scraping:** Scripts and docs for fetching stats directly from Spotify
- **Data outputs:** Canonical JSON files for display
- **Documentation:** Guides, quick starts, and visual explanations
- **Subfolders:** Organized by method (ocr/, api/, bot/), outputs, and docs

## How was the feature originally implemented?
- Code was spread across multiple folders (scripts/, helpers/, legacy/, etc.)
- Multiple overlapping docs and scripts made tracing the flow difficult
- Data outputs were generated in different places, sometimes with conflicting formats
- Ownership and triggers were unclear, leading to maintenance challenges

## Current state
- All relevant files are now in this feature folder
- Subfolders clarify roles (ocr/, api/, bot/, outputs/, docs/)
- Documentation is being consolidated and updated
- The pipeline is being refactored for clarity, traceability, and ease of change

## Next steps
- Continue consolidating docs and scripts
- Update documentation to reflect the unified pipeline
- Implement or document a combiner script for canonical output
- Make the feature easy to display externally with minimal dependencies

---

**This file explains the purpose and history of this feature folder. For technical details, see the README.md and subfolder docs.**