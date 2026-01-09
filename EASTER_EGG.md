# Easter Egg: Sandbox Mode

## Overview

The homepage includes a hidden easter egg that transforms the page into an interactive 3D physics sandbox when activated.

## Activation

**Desktop:** Type the word `indrolend` sequentially on the homepage (pages/home.html). Each key must be pressed in the correct order - if you press a wrong key, the sequence resets.

**Mobile:** Shake your device 3 times rapidly to activate the easter egg.

**Note for iOS Safari users:** The shake detection uses a delta acceleration algorithm that properly detects motion by filtering out the constant gravity component. This ensures reliable shake detection on iOS devices.

**Requirements:**
- JavaScript enabled
- Modern browser with CSS 3D transform support
- **Mobile only**: Device with accelerometer/motion sensors
  - iOS 13+: User interaction required first (tap anywhere) to request permission

**How it works (Desktop):**
- Press 'i' (sequence starts)
- Press 'n' (sequence continues)
- Press 'd' (sequence continues)
- Press 'r' (sequence continues)
- Press 'o' (sequence continues)
- Press 'l' (sequence continues)
- Press 'e' (sequence continues)
- Press 'n' (sequence continues)
- Press 'd' (easter egg activates!)

If you press any wrong key during the sequence, it resets and you must start over from 'i'.

**How it works (Mobile):**
- Shake your device firmly
- Shake again within 2 seconds
- Shake a third time within 2 seconds
- Easter egg activates!

If you wait more than 2 seconds between shakes, the count resets.

## Features

### 1. 3D Cube Transformation
- All homepage buttons (app-cards) transform into 3D cubes
- Each cube displays the original button content on its front face
- Other cube faces show the button's background styling

### 2. Physics Simulation
- **Gravity**: Cubes fall downward with realistic acceleration
- **Collision Detection**: Cubes bounce off each other and screen boundaries
- **Damping**: Velocity gradually decreases for realistic movement
- **Boundaries**: Invisible walls prevent cubes from leaving the viewport

### 3. Interactive Controls
- **Drag**: Click and drag cubes to reposition them
- **Rotate**: Dragging rotates the cube based on mouse movement
- **Drop**: Release to apply physics again (cube falls and bounces)

### 4. Reset Functionality
- Click the "Reset" button at the bottom of the page
- All cubes revert to their original button state
- Physics simulation stops
- Original page functionality fully restored

## Implementation Details

### Files
- `js/easter-egg-sandbox.js` - Main easter egg logic
- `css/easter-egg-sandbox.css` - 3D cube and reset button styling
- `pages/home.html` - Includes easter egg scripts

### Architecture
- **Self-contained**: All easter egg code is isolated from main application
- **No dependencies**: Uses custom physics engine (no external libraries)
- **Non-destructive**: Original buttons are hidden, not removed
- **Clean reset**: Complete restoration of original page state
- **Exact sequence matching**: Keys must be pressed in correct order ('i','n','d','r','o','l','e','n','d')
- **Dual activation**: Keyboard on desktop, shake gesture on mobile
- **iOS Safari compatible**: Delta acceleration algorithm filters out gravity for reliable shake detection
- **Square buttons**: All buttons use aspect-ratio: 1/1 for consistent sizing
- **Proper cube geometry**: Uses smallest dimension to create perfect cubes

### Physics Engine
Custom lightweight implementation with:
- Frame-based simulation (60 FPS target)
- Simple Euler integration for position/velocity
- Elastic collision response
- Boundary constraints
- Angular velocity for rotation

### Browser Compatibility
- Modern browsers with CSS 3D transforms (Chrome, Firefox, Safari, Edge)
- Desktop: Keyboard activation
- Mobile: Shake gesture activation
- **iOS Safari**: Fixed shake detection using delta acceleration algorithm
- iOS 13+: Requires user interaction before motion sensor access
- Square buttons: Consistent across all browsers (Safari, Chrome, Firefox, Edge)
- Gracefully handles missing motion sensor support

## Testing

### Manual Testing Checklist
1. ✅ Navigate to homepage
2. ✅ **Desktop**: Type "indrolend" (verify cubes appear)
3. ✅ **Mobile**: Shake device 3 times (verify cubes appear)
4. ✅ **iOS Safari**: Test shake detection works properly
5. ✅ Verify 3D cube appearance with all 6 faces
6. ✅ Verify cubes are perfect squares (not elongated)
7. ✅ Verify cube faces align properly (no overlapping edges)
8. ✅ Test drag functionality (click/touch and drag cube)
9. ✅ Test rotation (cubes rotate during drag)
9. ✅ Test physics (cubes fall and bounce)
10. ✅ Test collisions (cubes bounce off each other)
11. ✅ Test boundaries (cubes stay within viewport)
12. ✅ Click Reset button
13. ✅ Verify original page state restored
14. ✅ Verify buttons are square and clickable after reset
15. ✅ Test on multiple browsers (Safari, Chrome, Firefox, Edge)

### Known Behavior
- Cubes cannot be clicked to navigate (by design - they're in physics mode)
- Multiple activations in same session require page reload
- Physics simulation uses O(n²) collision detection (acceptable for ~8 cubes)
- Wrong keypress during sequence resets activation (must start from 'i' again)
- Mobile shake requires 3 shakes within 2 seconds
- iOS devices require user interaction before motion sensor access

## Security Considerations
- ✅ No external dependencies or CDN resources
- ✅ No sensitive data handling
- ✅ No XSS vulnerabilities (no user input rendered)
- ✅ No impact on security features of main site
- ✅ Passed CodeQL security analysis

## Maintenance Notes
- Easter egg state is session-only (no persistent storage)
- Physics parameters can be adjusted in `initPhysicsWorld()`
- Cube styling can be modified in `easter-egg-sandbox.css`
- Trigger word can be changed in `TRIGGER_WORD` constant
- Shake detection parameters configurable via constants:
  - `SHAKE_THRESHOLD`: Acceleration sensitivity (default: 15)
  - `SHAKE_DEBOUNCE_TIME`: Milliseconds between shakes (default: 200ms)
  - `SHAKE_RESET_TIMEOUT`: Time before shake count resets (default: 2000ms)
  - `SHAKE_COUNT_REQUIRED`: Number of shakes needed (default: 3)
- Button aspect ratio can be changed in `css/style.css` (.app-card)

## Future Enhancements (Optional)
- Add sound effects for collisions
- Add particle effects when cubes collide
- Allow multiple activations without reload
- Add keyboard controls for cube rotation
- Add "share" button to show friends the easter egg
