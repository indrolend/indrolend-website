# WebGL Transition System

A basic WebGL-based particle system leveraging Three.js for creating immersive visual transitions on the Indrolend website.

## Overview

This system renders 1000 randomly positioned and colored static particles in a 3D space using efficient BufferGeometry. It serves as the foundation for future animated transitions.

## Features

- ✨ **1000 Particles**: Efficiently rendered using Three.js BufferGeometry
- 🎨 **Random Colors**: Each particle has unique RGB values
- 📦 **3D Space**: Particles distributed in a cube around the center
- 🖥️ **Responsive**: Automatically handles window resizing
- ⚡ **WebGL Powered**: Hardware-accelerated rendering via Three.js
- 🌑 **Black Void Background**: Clean, minimal aesthetic

## Files

- `js/webgl-transition-system.js` - Main system implementation
- `pages/webgl-demo.html` - Interactive demonstration page
- `tests/webgl-transition-test.html` - Technical test page

## Quick Start

### 1. Include Dependencies

```html
<!-- Include Three.js library from CDN -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

<!-- Include WebGL Transition System -->
<script src="js/webgl-transition-system.js"></script>
```

### 2. Basic Usage

```javascript
// Create system instance
const transitionSystem = new WebGLTransitionSystem('container-id');

// Initialize the system
transitionSystem.init();

// Optional: Add rotation for visual effect
transitionSystem.rotateParticles(0.001, 0.002, 0.001);

// Clean up when done
transitionSystem.destroy();
```

### 3. HTML Structure

```html
<div id="my-container"></div>

<script>
  const system = new WebGLTransitionSystem('my-container');
  system.init();
</script>
```

## API Reference

### Constructor

```javascript
new WebGLTransitionSystem(containerId)
```

**Parameters:**
- `containerId` (String, optional): ID of the HTML element to attach the renderer to. Defaults to `document.body` if not provided.

**Returns:** WebGLTransitionSystem instance

### Methods

#### `init()`

Initializes the Three.js scene, camera, renderer, and particle system.

**Returns:** `Boolean` - `true` if initialization succeeds, `false` if Three.js is not loaded.

```javascript
const success = transitionSystem.init();
if (success) {
  console.log('System initialized');
}
```

#### `rotateParticles(x, y, z)`

Rotates the particle system on the specified axes. Useful for creating subtle motion effects.

**Parameters:**
- `x` (Number): Rotation on X-axis (radians)
- `y` (Number): Rotation on Y-axis (radians)
- `z` (Number): Rotation on Z-axis (radians)

**Example:**
```javascript
// Rotate slowly on all axes
setInterval(() => {
  transitionSystem.rotateParticles(0.001, 0.002, 0.001);
}, 16); // ~60fps
```

#### `destroy()`

Cleans up all resources, removes event listeners, and disposes of Three.js objects.

**Important:** Always call this method when the system is no longer needed to prevent memory leaks.

```javascript
window.addEventListener('beforeunload', () => {
  transitionSystem.destroy();
});
```

## Configuration

You can customize the system by modifying the `CONFIG` object in `webgl-transition-system.js`:

```javascript
const CONFIG = {
  PARTICLE_COUNT: 1000,        // Number of particles to render
  PARTICLE_SIZE: 0.05,         // Size of each particle
  SPACE_RANGE: 10,             // Distribution range (±10 on each axis)
  CAMERA_POSITION_Z: 15,       // Camera distance from origin
  BACKGROUND_COLOR: 0x000000,  // Scene background (black)
  FOV: 75                      // Camera field of view
};
```

## Technical Details

### Scene Setup

- **Scene**: Three.js Scene with black background
- **Camera**: PerspectiveCamera (75° FOV, positioned at Z=15)
- **Renderer**: WebGLRenderer with antialiasing and device pixel ratio support

### Particle System

- **Geometry**: BufferGeometry for efficient rendering
- **Attributes**: 
  - Position: Float32Array (x, y, z for each particle)
  - Color: Float32Array (r, g, b for each particle)
- **Material**: PointsMaterial with vertex colors and size attenuation
- **Distribution**: Random positions in a 20×20×20 cube centered at origin

### Performance

- Hardware-accelerated WebGL rendering
- BufferGeometry for minimal overhead
- Efficient attribute arrays
- Responsive to window resizing
- Automatic pixel ratio detection for high-DPI displays

## Browser Compatibility

The system requires:
- Modern browser with WebGL support
- Three.js r160 or later
- ES6 JavaScript support

**Tested on:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Demo Pages

### Interactive Demo
Visit `pages/webgl-demo.html` for a full-featured demonstration with:
- Visual feature showcase
- Interactive controls
- Usage examples
- Technical specifications

### Test Page
Visit `tests/webgl-transition-test.html` for a technical test page with:
- System status monitoring
- Rotation controls
- Resolution display
- Minimal UI

## Future Enhancements

This system is designed as a foundation for future work:

- [ ] Animated particle transitions
- [ ] Particle morphing between states
- [ ] Custom particle shapes
- [ ] Physics-based motion
- [ ] Color gradients and effects
- [ ] Integration with page navigation
- [ ] Multiple particle presets
- [ ] User interaction (mouse/touch)

## Troubleshooting

### "Three.js library not loaded" Error

Ensure Three.js is loaded before initializing the system:

```html
<!-- Load Three.js FIRST -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

<!-- Then load the transition system -->
<script src="js/webgl-transition-system.js"></script>
```

### Black Screen

If you see a black screen:
1. Check browser console for errors
2. Verify Three.js is loaded (`window.THREE` should exist)
3. Ensure container element exists before initialization
4. Check if WebGL is supported in your browser

### Performance Issues

If experiencing lag:
1. Reduce `PARTICLE_COUNT` in configuration
2. Decrease `PARTICLE_SIZE` for less fill rate
3. Disable antialiasing in renderer
4. Check for other WebGL applications running

## License

Part of the Indrolend website project. See main repository for license details.

## Credits

Built with [Three.js](https://threejs.org/) - JavaScript 3D library
