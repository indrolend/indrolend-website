# Development History: Indrolend Website

## Introduction

This repository represents my learning journey in web development, starting from November 2025. What began as a simple personal website has evolved into a comprehensive platform featuring Spotify integration, OCR-based analytics parsing, an idle game with philosophical narrative, and various interactive elements. Each pull request documents a step in learning modern web technologies, from basic HTML/CSS to API integrations, automated workflows, and advanced UI/UX patterns.

The project showcases practical application of:
- **Frontend Development**: HTML5, CSS3 (with vendor prefixes for browser compatibility), JavaScript
- **API Integration**: Spotify Web API with OAuth 2.0, backend caching
- **Automation**: GitHub Actions for CI/CD and screenshot processing
- **OCR & Data Processing**: Tesseract OCR with Python for analytics extraction
- **Game Development**: Idle clicker mechanics with narrative frameworks
- **Performance Optimization**: Browser compatibility (IE11+), preloading, responsive design

## Key Learning Highlights

### 🎵 **Spotify Integration** (PRs #24, #26, #28, #29, #30, #31)
Implemented live artist data fetching with secure OAuth backend, monthly listeners scraping, clickable track links, and popularity metrics. This taught me about API authentication, CORS handling, backend/frontend separation, and data caching strategies.

### 📸 **OCR Screenshot Parsing** (PRs #32, #33, #34, #35, #37, #40, #41)
Built an automated system to extract Spotify analytics from screenshots using Tesseract OCR, with GitHub Actions workflows, ground truth validation, and accuracy improvements. This was my deepest dive into Python, regex patterns, data aggregation, and CI/CD automation.

### 🎮 **Asymptote Engine Game** (PRs #10, #11, #12, #13, #14, #17, #18, #19, #20, #21)
Created an idle clicker game with philosophical narrative, achievements system, settings modal, audio controls, and sacrifice mechanics. This taught me game loop design, state management, localStorage persistence, and user experience optimization.

### 🎨 **UI/UX Evolution** (PRs #3, #4, #5, #6, #7, #16, #43)
Progressive enhancement of visual effects: text fluctuation, tilt hover cards, color cycling, particle backgrounds, color palette changes, and cross-browser compatibility. This reinforced responsive design principles, CSS animations, and accessibility considerations.

### 🔧 **Repository Organization** (PRs #2, #43, #44)
Learned code cleanup, modular structure, vendor prefixing for legacy browsers, documentation, and development tooling. This emphasized maintainability, performance, and professional development practices.

---

## Chronological PR Timeline

### PR #1: [WIP] Fix sudo access issues during installation
**Status**: Open (Draft) | **Created**: Nov 29, 2025  
**Purpose**: User support request investigation  
**Key Changes**: Analyzed macOS installation issues, planned README documentation

---

### PR #2: Clean up redundant code and fix deprecated APIs ✅
**Status**: Merged | **Created**: Nov 29, 2025 | **Merged**: Nov 29, 2025  
**Purpose**: Repository cleanup and modernization  
**Key Changes**:
- Removed ~30 lines of dead captcha code
- Fixed deprecated `event.path` usage with cross-browser compatible `composedPath()`
- Removed ~35 lines of duplicate CSS definitions
- Added `.gitignore` for standard patterns

---

### PR #3: Replace captcha popup header text with full-width image ✅
**Status**: Merged | **Created**: Nov 30, 2025 | **Merged**: Nov 30, 2025  
**Purpose**: UI improvement for captcha display  
**Key Changes**:
- Moved image from main section to header
- Removed placeholder text
- Fixed image cutoff issue (452x121px now displays fully)

---

### PR #4: Remove INDROLEND title text from homepage header ✅
**Status**: Merged | **Created**: Nov 30, 2025 | **Merged**: Nov 30, 2025  
**Purpose**: Clean header design  
**Key Changes**: Removed redundant `<h1>` text below header image

---

### PR #5: Add fluctuating text effect with serif font, font-weight cycling, hover speedup ✅
**Status**: Merged | **Created**: Nov 30, 2025 | **Merged**: Nov 30, 2025  
**Purpose**: Add "living text" animation effect  
**Key Changes**:
- CSS animation with `letterFluctuate` keyframe (GPU-accelerated)
- Font-weight cycling (400-800) every 400ms
- 5x speedup on hover
- Button press effects with rainbow colors and radial burst
- Arrow-based image gallery navigation

---

### PR #6: Add lightweight UI interaction effects ✅
**Status**: Merged | **Created**: Nov 30, 2025 | **Merged**: Nov 30, 2025  
**Purpose**: Enhance user experience with visual effects  
**Key Changes**:
- Canvas-based particle system (60 particles with connecting lines)
- 3D tilt/parallax hover on cards with touch support
- Color cycling text animation (8-second hue-shift)
- Wavy text motion with staggered delays
- Micro-interaction buttons (pulse, bounce, vibration)

---

### PR #7: Replace particle dots with randomized characters ✅
**Status**: Merged | **Created**: Nov 30, 2025 | **Merged**: Nov 30, 2025  
**Purpose**: Matrix-style character background  
**Key Changes**:
- Replaced dots with `ctx.fillText()` characters (0-9, A-Z, a-z, symbols)
- Per-particle character cycling (300-1500ms intervals)
- Pre-cached font strings for performance

---

### PR #8: [WIP] Add Instagram button to homepage
**Status**: Open (Draft) | **Created**: Dec 8, 2025  
**Purpose**: Add Instagram social link  
**Key Changes**: Planning to add Instagram app-card to homepage

---

### PR #9: Add Instagram social card to home page ✅
**Status**: Merged | **Created**: Dec 8, 2025 | **Merged**: Dec 9, 2025  
**Purpose**: Add Instagram link to social media section  
**Key Changes**:
- Added `Instagramlogospin.gif` asset
- Inserted Instagram app-card after TikTok
- Maintained consistent card structure

---

### PR #10: Replace Word Game with Risk/Catan-style Territory Control Game ✅
**Status**: Merged | **Created**: Dec 10, 2025 | **Merged**: Dec 11, 2025  
**Purpose**: Replace word game with Asymptote Engine  
**Key Changes**:
- Complete idle clicker game implementation
- Click power, generators, upgrades system
- Enlightenment prestige mechanic
- Fixed upgrade effects, intro screen, click popup

---

### PR #11: Prevent mobile double-tap zoom on rapid clicking ✅
**Status**: Merged | **Created**: Dec 11, 2025 | **Merged**: Dec 11, 2025  
**Purpose**: Fix mobile zoom issue in Asymptote game  
**Key Changes**:
- Added `maximum-scale=1.0, user-scalable=no` to viewport
- Applied `touch-action: manipulation` to interactive elements
- Prevented tap highlights and text selection

---

### PR #12: Add background music with volume and mute controls to Asymptote game ✅
**Status**: Merged | **Created**: Dec 12, 2025 | **Merged**: Dec 21, 2025  
**Purpose**: Add audio controls to game  
**Key Changes**:
- AudioManager singleton class for playback state
- Volume slider (0-100%) and mute button
- Safari/iOS compatibility (`playsinline`, `preload="auto"`)
- Teal/cyan themed controls

---

### PR #13: Integrate framework narrative into Asymptote Engine with casual bro talk ✅
**Status**: Merged | **Created**: Dec 12, 2025 | **Merged**: Dec 12, 2025  
**Purpose**: Transform game into teaching tool for systems framework  
**Key Changes**:
- Renamed generators with casual language (Brain Squisher, Bootleg Reality, etc.)
- Added concept tags (DENSITY & COMPRESSION, EMULATION STACKS)
- Reframed upgrades as framework principles
- Milestone system with progressive narrative
- Casual "bro talk" voice throughout

---

### PR #14: Refactor text density in asymptote engine game ✅
**Status**: Merged | **Created**: Dec 12, 2025 | **Merged**: Dec 12, 2025  
**Purpose**: Reduce text density for intuitive learning  
**Key Changes**:
- Simplified intro screen (6 lines vs. multiple paragraphs)
- Concise generator names and descriptions
- Subtle framework concepts as lowercase hints
- Brief upgrade descriptions
- Framework as easter egg rather than explicit teaching

---

### PR #15: Replace Talking album embed with Someday single embed ✅
**Status**: Merged | **Created**: Dec 14, 2025 | **Merged**: Dec 14, 2025  
**Purpose**: Update Bandcamp player to new single  
**Key Changes**: Swapped iframe from album to track with updated dimensions and theme

---

### PR #16: Replace green color palette with teal/cyan theme based on #0b5a67 ✅
**Status**: Merged | **Created**: Dec 14, 2025 | **Merged**: Dec 16, 2025  
**Purpose**: Rebrand site with teal/cyan color scheme  
**Key Changes**:
- CSS variables: `#6dd9e8` (bright cyan), `#3bb8cc` (medium teal), `#0b5a67` (dark teal)
- Updated all color references in CSS and JavaScript
- Blue-tinted backgrounds (#001a33)

---

### PR #17: Add idle game mechanics: Ticks resource, sacrifice conversions, mini-reset ✅
**Status**: Merged | **Created**: Dec 21, 2025 | **Merged**: Dec 21, 2025  
**Purpose**: Add strategic depth to Asymptote game  
**Key Changes**:
- Ticks resource (10/sec passive accumulation)
- Bidirectional conversions (Ticks ↔ Understanding)
- Permanent upgrade: +1% tick rate multiplier
- Temporal Collapse mini-reset mechanic
- Offline ticks calculation

---

### PR #18: Add hidden narrative framework to Asymptote Engine game ✅
**Status**: Merged | **Created**: Dec 21, 2025 | **Merged**: Dec 22, 2025  
**Purpose**: Integrate philosophical concepts subtly  
**Key Changes**:
- 14 discoverable narrative fragments
- Fragment collection UI
- Updated intro/resource descriptions with framework
- Fixed click button center interaction
- Null-safe data access

---

### PR #19: Fix Asymptote game intro overflow, Safari audio controls, add settings modal ✅
**Status**: Merged | **Created**: Dec 22, 2025 | **Merged**: Dec 23, 2025  
**Purpose**: Mobile fixes and quality of life improvements  
**Key Changes**:
- Shortened intro text (7 lines)
- Fixed Safari audio controls (`playsinline`, `webkit-playsinline`)
- Settings modal with 7 toggles (music, theme, number format, etc.)
- 4 color themes (Cyan, Red, Green, Purple)
- CSS variables for dynamic theming

---

### PR #20: Add Cookie Clicker-inspired achievements system to Asymptote Engine ✅
**Status**: Merged | **Created**: Dec 23, 2025 | **Merged**: Dec 23, 2025  
**Purpose**: Extend gameplay with achievement tracking  
**Key Changes**:
- 32 achievements across 8 categories
- Gold-themed UI (distinct from cyan fragments)
- Modal showing progress (X/32, X%)
- Auto-tracks stats across modes
- Achievement notifications with auto-dismiss

---

### PR #21: Add platform-specific music controls with floating overlay on PC ✅
**Status**: Merged | **Created**: Dec 23, 2025 | **Merged**: Dec 23, 2025  
**Purpose**: Optimize audio controls for desktop vs mobile  
**Key Changes**:
- Floating controls on PC (bottom-right)
- Settings toggle only on mobile
- CSS media query (@max-width: 768px) to hide PC controls
- Fixed mute state persistence bug

---

### PR #22: Add stats dashboard with secure API integration for platform analytics
**Status**: Open (Draft) | **Created**: Dec 24, 2025  
**Purpose**: Real-time statistics dashboard  
**Key Changes**: Planned serverless functions for website/Spotify/Apple/TikTok stats

---

### PR #23: Add Spotify artist stats page with API integration
**Status**: Open (Draft) | **Created**: Dec 24, 2025  
**Purpose**: Display Spotify artist data (followers, popularity)  
**Key Changes**: Floating panel design with manual access token integration

---

### PR #24: Add live Spotify artist data integration with secure OAuth backend ✅
**Status**: Merged | **Created**: Dec 28, 2025 | **Merged**: Dec 28, 2025  
**Purpose**: Secure Spotify API integration  
**Key Changes**:
- Node.js backend with OAuth 2.0 authentication
- `/api/spotify` endpoint for artist data
- Environment variable support for credentials
- Frontend JavaScript module for API calls
- Backend README with setup instructions
- Fixed captcha functionality

---

### PR #25: Add deployment configuration and documentation for Spotify integration
**Status**: Open (Draft) | **Created**: Dec 28, 2025  
**Purpose**: Production deployment setup  
**Key Changes**: `render.yaml`, deployment guides, testing script

---

### PR #26: Update Spotify API backend URL to production endpoint ✅
**Status**: Merged | **Created**: Dec 28, 2025 | **Merged**: Dec 28, 2025  
**Purpose**: Connect frontend to deployed backend  
**Key Changes**: Updated `SPOTIFY_API_BASE` to `https://spotify-stats-backend-y8hb.onrender.com`

---

### PR #27: [WIP] Add redirect for top songs to Spotify links
**Status**: Open (Draft) | **Created**: Dec 28, 2025  
**Purpose**: Make top tracks clickable  
**Key Changes**: Planning to add Spotify URL redirects on track click

---

### PR #28: Make Spotify top tracks clickable with URL validation ✅
**Status**: Merged | **Created**: Dec 29, 2025 | **Merged**: Dec 29, 2025  
**Purpose**: Add interactivity to top tracks  
**Key Changes**:
- Wrapped tracks in `<a>` tags with validated URLs
- `sanitizeSpotifyUrl()` whitelist (spotify.com, open.spotify.com)
- Hover effects on clickable tracks

---

### PR #29: Replace Spotify popularity metric with monthly listeners
**Status**: Open (Draft) | **Created**: Dec 29, 2025  
**Purpose**: Display monthly listeners instead of popularity score  
**Key Changes**: Backend scraping with `cheerio`, multi-pattern regex, conditional rendering

---

### PR #30: Add track popularity scores to Spotify integration
**Status**: Open (Draft) | **Created**: Dec 30, 2025  
**Purpose**: Show engagement metrics for tracks  
**Key Changes**: Added popularity field (0-100) with tooltip, green badge styling

---

### PR #31: Add Spotify business analytics dashboard with 28-day metrics snapshot ✅
**Status**: Merged | **Created**: Dec 31, 2025 | **Merged**: Dec 31, 2025  
**Purpose**: Comprehensive analytics display  
**Key Changes**:
- Core metrics with color-coded percentage changes
- Discovery sources breakdown
- Demographics (gender/age distributions)
- Geography (top cities/countries)
- 6 strategic insights
- Static data structure matching frontend schema

---

### PR #32: Set up workflow for automatic screenshot parsing ✅
**Status**: Merged | **Created**: Dec 31, 2025 | **Merged**: Dec 31, 2025  
**Purpose**: Automate Spotify stats extraction from screenshots  
**Key Changes**:
- GitHub Actions workflow triggering on screenshots/ changes
- Python script with Tesseract OCR
- Saves to `data/parsed-stats.json`
- Installs Python 3.12 + Tesseract

---

### PR #33: Add automated OCR-based screenshot parsing for Spotify stats ✅
**Status**: Merged | **Created**: Dec 31, 2025 | **Merged**: Dec 31, 2025  
**Purpose**: Full OCR implementation  
**Key Changes**:
- `scripts/parse_screenshots.py` with regex patterns
- Handles ambiguous text (e.g., "Playlist Adds Followers 238 244")
- Outputs timestamped JSON
- `.github/workflows/parse-screenshots.yml` with CORS enabled
- Tested on 6 sample screenshots (4 successful)

---

### PR #34: Auto-delete processed screenshots to prevent data conflicts ✅
**Status**: Merged | **Created**: Jan 1, 2026 | **Merged**: Jan 1, 2026  
**Purpose**: Prevent accumulation of old screenshots  
**Key Changes**:
- Delete all processed screenshots after JSON save
- Track failed parses with `note` field
- Add `screenshots/` to git staging

---

### PR #35: Fix workflow push failures from concurrent screenshot uploads ✅
**Status**: Merged | **Created**: Jan 1, 2026 | **Merged**: Jan 1, 2026  
**Purpose**: Handle concurrent workflow runs  
**Key Changes**:
- Fetch-rebase-push retry loop (3 attempts, 5s backoff)
- Conditional commit (only when staged changes exist)

---

### PR #36: Clean up screenshots folder for automation testing ✅
**Status**: Merged | **Created**: Jan 1, 2026 | **Merged**: Jan 1, 2026  
**Purpose**: Reset folder for testing  
**Key Changes**: Deleted 20 PNG files, retained README.md

---

### PR #37: Integrate screenshot-parsed analytics data with homepage display ✅
**Status**: Merged | **Created**: Jan 1, 2026 | **Merged**: Jan 2, 2026  
**Purpose**: Connect OCR output to frontend  
**Key Changes**:
- Enhanced OCR parser to extract demographics, geography, discovery sources
- Aggregate multiple screenshots into unified analytics
- Generate insights from parsed patterns
- Dynamic data loading with validation and retry logic
- Fallback to defaults when data invalid

---

### PR #38: Add timestamp tracking and implement 24-hour caching for Spotify API ✅
**Status**: Merged | **Created**: Jan 2, 2026 | **Merged**: Jan 2, 2026  
**Purpose**: Performance optimization and data freshness  
**Key Changes**:
- `dateGenerated` field (ISO 8601 UTC) in analytics
- Backend caching (24h duration) with `POST /api/spotify/refresh-cache`
- Frontend cache extended to 24 hours
- Nightly workflow run (`cron '0 2 * * *'`)
- Response metadata: `cached`, `cacheAge`, `lastFetched`

---

### PR #39: Fix screenshot OCR parsing inaccuracies for Spotify analytics
**Status**: Open (Draft) | **Created**: Jan 2, 2026  
**Purpose**: Improve OCR accuracy  
**Key Changes**: Triple-metrics extraction, fixed comma handling, percentage change extraction

---

### PR #40: Add OCR example screenshots system with ground truth validation ✅
**Status**: Merged | **Created**: Jan 2, 2026 | **Merged**: Jan 2, 2026  
**Purpose**: Structured validation system for OCR  
**Key Changes**:
- `screenshots/examples/` directory for reference screenshots
- `scripts/validate_ocr_examples.py` for accuracy metrics
- Ground truth JSON format (40+ supported fields)
- Documentation: README, CONTRIBUTING, TEMPLATE, Visual Guide, Quick Start

---

### PR #41: Add ground truth JSON generation for OCR example screenshots ✅
**Status**: Merged | **Created**: Jan 2, 2026 | **Merged**: Jan 2, 2026  
**Purpose**: Generate structured JSON from text file  
**Key Changes**:
- `scripts/generate_ground_truth_json.py` parsing 34 metrics
- Handles Unicode apostrophes (U+2019)
- Generated 14 JSON files (IMG_0736.json - IMG_0749.json)
- Documentation updates

---

### PR #42: Reorder homepage: show screenshot stats first, API data at bottom ✅
**Status**: Merged | **Created**: Jan 2, 2026 | **Merged**: Jan 2, 2026  
**Purpose**: Prioritize real analytics data  
**Key Changes**:
- Renamed "Business Snapshot" to "Spotify Snapshot"
- Moved API data to bottom
- Removed Key Insights section
- Screenshot-parsed stats displayed first

---

### PR #43: Reorganize repository structure and add cross-browser compatibility ✅
**Status**: Merged | **Created**: Jan 2, 2026 | **Merged**: Jan 2, 2026  
**Purpose**: Maintainability and legacy browser support  
**Key Changes**:
- Organized into `css/`, `js/`, `assets/icons/`, `assets/images/`, `pages/`
- Vendor prefixes for IE11+ compatibility
- CSS Grid with flexbox fallbacks
- Gap property with margin fallback via `@supports`
- Preload hints for 7 GIF icons
- Created `STRUCTURE.md` documentation

---

### PR #44: Add PR history export script for dev journal generation
**Status**: Open (Draft) | **Created**: Jan 3, 2026  
**Purpose**: Export PR data for documentation  
**Key Changes**: Python script using GitHub CLI to export PRs as JSON

---

### PR #45: [WIP] Create Markdown file summarizing development history
**Status**: Open (Draft) | **Created**: Jan 3, 2026  
**Purpose**: Generate development journal  
**Key Changes**: This document summarizing all PRs chronologically

---

## Lessons Learned

### Technical Skills
- **API Integration**: OAuth flows, token management, rate limiting, caching strategies
- **OCR & Automation**: Tesseract configuration, regex patterns, data aggregation, CI/CD with GitHub Actions
- **Frontend Engineering**: State management, localStorage persistence, responsive design, browser compatibility
- **Backend Development**: Express.js, serverless functions, environment variables, CORS handling
- **Game Development**: Game loops, idle mechanics, prestige systems, narrative integration

### Soft Skills
- **Iterative Development**: Breaking features into small PRs, testing incrementally
- **Documentation**: READMEs, quick start guides, contributing guidelines, visual diagrams
- **Problem Solving**: Debugging OCR accuracy issues, handling concurrency in workflows, fixing mobile zoom
- **User Experience**: Progressive disclosure of complexity, intuitive controls, accessibility

### Future Directions
- Complete remaining draft PRs (#22, #23, #25, #27, #29, #30, #39, #44)
- Improve OCR accuracy with machine learning refinements
- Add Apple Music and TikTok API integrations
- Expand Asymptote Engine with new narrative branches
- Implement analytics dashboards for deeper insights

---

**Total PRs**: 45 (33 merged, 12 open/draft)  
**Development Period**: November 2025 - January 2026  
**Technologies**: HTML, CSS, JavaScript, Node.js, Python, GitHub Actions, Tesseract OCR, Spotify API
