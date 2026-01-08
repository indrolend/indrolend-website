# Easter Egg: Sandbox Mode

## Overview

The homepage includes a hidden easter egg that transforms the page into an interactive 3D physics sandbox when activated.

## Activation

Type the word `indrolend` sequentially on the homepage (pages/home.html) to activate the easter egg.

**Requirements:**
- Desktop browser only (viewport width > 768px)
- JavaScript enabled
- Modern browser with CSS 3D transform support

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

### Physics Engine
Custom lightweight implementation with:
- Frame-based simulation (60 FPS target)
- Simple Euler integration for position/velocity
- Elastic collision response
- Boundary constraints
- Angular velocity for rotation

### Browser Compatibility
- Modern browsers with CSS 3D transforms (Chrome, Firefox, Safari, Edge)
- Gracefully disabled on mobile devices
- No impact on browsers without 3D transform support

## Testing

### Manual Testing Checklist
1. ✅ Navigate to homepage
2. ✅ Type "indrolend" (verify cubes appear)
3. ✅ Verify 3D cube appearance with all 6 faces
4. ✅ Test drag functionality (click and drag cube)
5. ✅ Test rotation (cubes rotate during drag)
6. ✅ Test physics (cubes fall and bounce)
7. ✅ Test collisions (cubes bounce off each other)
8. ✅ Test boundaries (cubes stay within viewport)
9. ✅ Click Reset button
10. ✅ Verify original page state restored
11. ✅ Verify buttons are clickable after reset
12. ✅ Test on mobile (should not activate)

### Known Behavior
- Cubes cannot be clicked to navigate (by design - they're in physics mode)
- Multiple activations in same session require page reload
- Physics simulation uses O(n²) collision detection (acceptable for ~8 cubes)

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

## Future Enhancements (Optional)
- Add sound effects for collisions
- Add particle effects when cubes collide
- Allow multiple activations without reload
- Add keyboard controls for cube rotation
- Add "share" button to show friends the easter egg
