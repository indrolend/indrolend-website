# Particle Transition Engine - Debugging Guide

## Overview

The Particle Transition Engine provides visual particle-based transitions between pages. This guide explains how to debug and test the engine in browser developer tools.

## Quick Start - Testing in Browser Console

### 1. Enable Debug Mode

Open your browser's developer console (F12 or Cmd+Option+I on Mac) and run:

```javascript
ParticleTransitionEngine.setDebugMode(true);
```

This will enable detailed console logging for all engine operations.

### 2. Test Simple Particles

To verify the canvas is working correctly, run:

```javascript
ParticleTransitionEngine.testSimpleParticles();
```

This will create and animate 50 simple particles on the screen. You should see:
- Colored particles bouncing around the screen
- Console logs confirming canvas initialization
- Animation running for about 5 seconds

### 3. Manual Transition Test

To manually trigger a transition effect:

```javascript
// Test transition with default settings
ParticleTransitionEngine.engine.startTransition({
  fromElements: document.querySelectorAll('.app-card'),
  colors: ['rgba(94, 232, 125, 0.8)', 'rgba(109, 217, 232, 0.9)'],
  onComplete: () => console.log('Transition complete!')
});
```

## Available Debug Methods

### `ParticleTransitionEngine.setDebugMode(enabled)`

Enable or disable debug logging.

**Parameters:**
- `enabled` (boolean): `true` to enable, `false` to disable

**Example:**
```javascript
ParticleTransitionEngine.setDebugMode(true);  // Enable
ParticleTransitionEngine.setDebugMode(false); // Disable
```

### `ParticleTransitionEngine.testSimpleParticles(canvasId)`

Test basic canvas rendering with simple animated particles.

**Parameters:**
- `canvasId` (string, optional): Canvas element ID to use. Default: `'particle-canvas'`

**Returns:** Object with canvas, particles array, and status message

**Example:**
```javascript
// Use default canvas
let result = ParticleTransitionEngine.testSimpleParticles();
console.log(result);

// Use custom canvas ID
let result2 = ParticleTransitionEngine.testSimpleParticles('my-custom-canvas');
```

### `ParticleTransitionEngine.engine.startTransition(options)`

Manually trigger a page transition effect.

**Parameters:**
- `options.fromElements` (Array): DOM elements to sample for particle creation
- `options.colors` (Array, optional): Custom particle colors (rgba strings)
- `options.onComplete` (Function, optional): Callback when transition completes

**Example:**
```javascript
ParticleTransitionEngine.engine.startTransition({
  fromElements: document.querySelectorAll('h1, button'),
  colors: [
    'rgba(255, 0, 0, 0.9)',
    'rgba(0, 255, 0, 0.9)',
    'rgba(0, 0, 255, 0.9)'
  ],
  onComplete: () => {
    console.log('Custom transition complete!');
  }
});
```

## Common Issues and Solutions

### Issue: "Canvas not found" or blank screen

**Solution:**
1. Verify the canvas element exists:
   ```javascript
   document.getElementById('particle-canvas');
   ```
2. If null, the page may not have loaded the canvas. Run the test function which will create one:
   ```javascript
   ParticleTransitionEngine.testSimpleParticles();
   ```

### Issue: "Failed to get 2D context"

**Solution:**
This usually means WebGL/Canvas is disabled or unavailable.
1. Check if your browser supports Canvas API
2. Try in a different browser (Chrome, Firefox, Safari)
3. Check for browser extensions that might block canvas

### Issue: No particles visible

**Solution:**
1. Enable debug mode to see detailed logs:
   ```javascript
   ParticleTransitionEngine.setDebugMode(true);
   ```
2. Check if particles were created:
   ```javascript
   console.log(ParticleTransitionEngine.engine.particles.length);
   ```
3. Verify canvas is visible (not `display: none`)

### Issue: Script not loading

**Solution:**
1. Check the console for script loading errors
2. Verify script path is correct:
   - Root: `<script defer src="js/particle-transition-engine.js"></script>`
   - Pages: `<script defer src="../js/particle-transition-engine.js"></script>`
3. Ensure script tag has `defer` attribute for proper loading

## Browser Compatibility

The engine is tested and works in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Default Canvas Element

All HTML pages now include a default hidden canvas element:

```html
<canvas id="particle-canvas" style="display: none;"></canvas>
```

This canvas is available for debugging and testing purposes. The engine will use this canvas if available, or create its own when needed.

## Console Initialization Message

When the engine loads successfully, you'll see:

```
[ParticleEngine] Particle Transition Engine loaded successfully. Version: 1.1.0
[ParticleEngine] Available methods:
  - ParticleTransitionEngine.init(config) - Initialize page transitions
  - ParticleTransitionEngine.setDebugMode(true/false) - Enable/disable debug logging
  - ParticleTransitionEngine.testSimpleParticles() - Test canvas with simple particles
  - ParticleTransitionEngine.engine.startTransition(options) - Manually trigger transition
```

## Configuration

You can modify engine behavior by editing `CONFIG` in the JavaScript file:

```javascript
const CONFIG = {
  DEBUG_MODE: false,           // Enable debug logging by default
  DEBUG_PARTICLE_COUNT: 50,    // Number of particles in test mode
  TARGET_FPS: 30,              // Target frame rate
  BASE_PARTICLE_COUNT: 150,    // Particles for desktop
  MOBILE_PARTICLE_COUNT: 80,   // Particles for mobile
  // ... more settings
};
```

## Advanced Debugging

### Inspect Engine State

```javascript
// Check if transition is active
console.log(ParticleTransitionEngine.engine.isActive());

// View current particles
console.log(ParticleTransitionEngine.engine.particles);

// Check canvas dimensions
console.log({
  width: ParticleTransitionEngine.engine.canvas?.width,
  height: ParticleTransitionEngine.engine.canvas?.height
});
```

### Custom Particle Behaviors

```javascript
// Access predefined page behaviors
console.log(ParticleTransitionEngine.behaviors);

// Initialize with custom behaviors
ParticleTransitionEngine.init({
  customBehaviors: {
    'my-custom-page': {
      colors: [
        'rgba(255, 100, 200, 0.9)',
        'rgba(100, 200, 255, 0.9)'
      ]
    }
  }
});
```

## Support

For issues or questions:
1. Enable debug mode and check console logs
2. Run the test function to verify basic functionality
3. Check this guide for common issues
4. Review browser console for error messages
