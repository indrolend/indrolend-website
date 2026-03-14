# Indrolend Website Structure

## Directory Organization

```
indrolend-website/
├── index.html                 # Site entry point — redirects to legacy/pages/home.html
├── spa.html                   # SPA shell (beta — open directly at /spa.html)
├── legacy/                    # Frozen MPA (preserved, not linked from SPA)
│   ├── pages/                 # Legacy HTML pages
│   │   ├── home.html         # Legacy main home page
│   │   ├── gallery.html      # Image gallery
│   │   ├── tictactoe.html    # Gallery unlock game
│   │   ├── discography.html  # Full discography listing
│   │   ├── journal.html      # Journal entries
│   │   ├── dev-history.html  # Development history
│   │   ├── wordgame.html     # Redirect to asymptote/
│   │   ├── spotify-demo.html # Spotify integration demo
│   │   └── spotify-artists-test.html
│   └── js/                   # MPA-only JavaScript
│       ├── script.js
│       ├── cursor-character-effect.js
│       ├── dev-history.js
│       ├── discography.js
│       ├── easter-egg.js
│       ├── journal.js
│       ├── security-utils.js
│       ├── spotify-analytics.js
│       ├── spotify-analytics-data.js
│       ├── spotify-artists-stats.js
│       ├── spotify-integration.js
│       └── engines/          # Legacy transition engines
│           ├── particle-transition-engine.js
│           └── genie-transition.js
├── js/                        # SPA JavaScript
│   └── spa/                  # SPA runtime modules
│       ├── engines/          # Shared SPA engines
│       │   └── particle-clusters.js
│       ├── views/            # View modules
│       │   ├── homeView.js
│       │   ├── socialView.js
│       │   ├── musicView.js
│       │   ├── gamesView.js
│       │   └── aboutView.js
│       ├── typography/
│       │   └── importantWords.js
│       ├── gestures.js
│       ├── overlayManager.js
│       ├── router.js
│       ├── routes.js
│       └── transitionEngine.js
├── css/                       # Stylesheets (shared by SPA and legacy)
│   ├── style.css             # Main styles (unified)
│   ├── spa.css               # SPA layout overrides
│   ├── dev-history.css
│   ├── discography.css
│   ├── journal.css
│   ├── spotify-analytics-styles.css
│   ├── spotify-artists-stats.css
│   └── spotify-styles.css
├── assets/                    # Static assets
│   ├── icons/                # Animated GIF icons
│   └── images/               # Static images
├── images/                    # Gallery images (53 files)
├── asymptote/                 # Asymptote game engine (standalone)
│   ├── index.html
│   ├── src/
│   └── styles/
├── backend/                   # Node.js backend
│   ├── spotify-backend.js
│   ├── package.json
│   └── README.md
├── data/                      # JSON data files
│   └── parsed-stats.json
└── screenshots/               # Screenshot examples
    └── examples/

```

## File Relationships

### Entry Flow
1. **index.html** → immediate redirect → **legacy/pages/home.html** (legacy MPA, current default)
2. **spa.html** → SPA router → hash-based views (home, social, music, games, about) *(beta — open directly)*

### Legacy MPA (current default, reached via index.html)
1. **legacy/pages/home.html** → Legacy hub with social links and mini-apps
2. **legacy/pages/tictactoe.html** → Win to unlock **legacy/pages/gallery.html**
3. **legacy/pages/gallery.html** → Browse image collection
4. **legacy/pages/wordgame.html** → Redirect to **asymptote/index.html**

See [LEGACY.md](LEGACY.md) for full details on the legacy MPA.

### CSS Architecture
- **css/style.css**: Contains all base styles, components, and compatibility layers
  - CSS Variables with fallbacks
  - Vendor prefixes for broad browser support
  - Flexbox with CSS Grid fallbacks
  - Animation keyframes with prefixes

### JavaScript Modules
- **js/script.js**: Core application logic
  - Particle background animation
  - Interactive text effects
  - Navigation logic
  - Game logic (tic-tac-toe)
  - Gallery system
  - Captcha system

## Browser Compatibility

### CSS Features
- **Vendor prefixes added for:**
  - Flexbox (`-webkit-flex`, `-moz-box`, `-ms-flexbox`)
  - Transform (`-webkit-transform`, `-moz-transform`, `-ms-transform`)
  - Transition (`-webkit-transition`, `-moz-transition`)
  - Border radius, box-shadow, gradients
  - Keyframe animations (`@-webkit-keyframes`)

### Grid Fallbacks
- CSS Grid with automatic fallback to Flexbox
- Gap property with margin fallback for older browsers
- `@supports` queries for progressive enhancement

### JavaScript Compatibility
- Uses modern ES6+ features (consider adding babel/polyfill for IE11)
- No external framework dependencies
- Canvas API for particle effects

## Performance Optimizations

### Resource Hints
- `preconnect` for Google Fonts
- `preload` for critical GIF assets
- Meta tags for browser compatibility

### Image Strategy
- GIF icons preloaded (no lazy loading per requirement)
- Width/height attributes added for layout stability
- Icons optimized for reasonable file sizes

### Critical Path
1. HTML loads with inline styles (future optimization)
2. CSS loads with resource hints
3. JavaScript deferred for non-blocking load
4. Critical assets preloaded

## Maintenance Notes

### Adding New Pages
1. Create HTML file in `pages/` directory
2. Use relative paths: `../css/`, `../js/`, `../assets/`
3. Include meta tags for compatibility
4. Add preload hints for critical assets

### Adding New Styles
- Add to `css/style.css` with appropriate vendor prefixes
- Test in older browsers (IE11, old Safari)
- Use fallbacks for modern CSS features

### Adding New Icons
1. Place in `assets/icons/`
2. Add preload hint in pages that use it
3. Include width/height attributes in HTML

## Testing Checklist

- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Test in IE11 (if required)
- [ ] Test on mobile devices
- [ ] Verify all navigation paths
- [ ] Check console for errors
- [ ] Validate HTML/CSS
- [ ] Test with slow network (throttling)

## Future Improvements

1. **Build System**: Add webpack/gulp for minification
2. **Image Optimization**: Further compress large GIFs
3. **Code Splitting**: Separate JS into modules
4. **Service Worker**: Add offline support
5. **Babel**: Transpile for older browsers
6. **CSS Modules**: Further split CSS by component
