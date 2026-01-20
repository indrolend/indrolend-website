# Hybrid Page Transition API

A powerful WebGL-based particle transition system for seamless page navigation with intelligent fallback to Canvas rendering.

## Overview

The Hybrid Page Transition API provides smooth, hardware-accelerated page transitions using particle effects. It automatically detects device capabilities and optimizes performance accordingly.

## Features

- ✨ **WebGL 2.0/1.0 Rendering** with automatic Canvas 2D fallback
- 🎯 **Automatic Device Profile Detection** (High-end, Mid-range, Low-end, Mobile)
- ⚡ **Auto-optimization** based on real-time performance monitoring
- 🎨 **Customizable Particle Effects** per page
- 🔧 **Debug Mode** for development and testing
- ♿ **Accessibility Support** (respects `prefers-reduced-motion`)
- 🌐 **Cross-browser Compatible** (Chrome, Firefox, Safari, Edge)
- 🔒 **Security-conscious** (blocks dangerous URL schemes)

## Installation

### Basic Setup

Add the following scripts to your HTML pages in this order:

```html
<!-- Core API -->
<script src="js/hybrid-page-transition-api.js"></script>

<!-- Configuration (optional but recommended) -->
<script src="js/hybrid-page-transition-config.js"></script>

<!-- Auto-initializer (optional) -->
<script src="js/hybrid-page-transition-init.js"></script>
```

### Quick Start

**Option 1: Automatic Initialization**

Add a data attribute to your `<html>` tag:

```html
<html data-hybrid-transitions>
```

**Option 2: Manual Initialization**

```javascript
// Initialize with default settings
const transitionSystem = window.HybridPageTransitionAPI.init();

// Initialize with custom configuration
const transitionSystem = window.HybridPageTransitionAPI.init({
  enabledPages: ['all'],
  customBehaviors: {
    home: {
      particleCount: 200,
      colors: ['rgba(94, 232, 125, 0.8)', 'rgba(109, 217, 232, 0.9)']
    }
  }
});
```

## API Reference

### HybridPageTransitionAPI

Main API class for controlling transitions.

#### Methods

##### `init(config)`

Initialize the API with navigation interception.

```javascript
const system = window.HybridPageTransitionAPI.init({
  enabledPages: ['all'],  // or ['home', 'gallery', 'about']
  transitionTiming: 'default',
  customBehaviors: {
    // Page-specific configurations
  }
});
```

**Returns:** `{ api, interceptor, disconnect }` - Object with API instance and interceptor

##### `create(options)`

Create a new API instance without navigation interception.

```javascript
const api = window.HybridPageTransitionAPI.create({
  autoOptimize: true,
  debug: false
});
```

**Parameters:**
- `autoOptimize` (boolean): Enable automatic performance optimization
- `debug` (boolean): Enable debug mode with FPS counter and logs

#### Instance Methods

##### `startTransition(options)`

Manually start a transition effect.

```javascript
api.startTransition({
  fromElements: document.querySelectorAll('.sample-element'),
  colors: ['rgba(255, 0, 0, 0.9)', 'rgba(0, 255, 0, 0.9)'],
  particleCount: 200,
  explosionIntensity: 1.5,
  onComplete: () => {
    console.log('Transition complete!');
    window.location.href = '/next-page.html';
  }
});
```

**Parameters:**
- `fromElements` (Array): DOM elements to sample colors/positions from
- `colors` (Array): Custom particle colors (RGBA strings)
- `particleCount` (Number): Override default particle count
- `explosionIntensity` (Number): Force multiplier for particle dispersion
- `onComplete` (Function): Callback when transition completes

##### `isActive()`

Check if a transition is currently in progress.

```javascript
if (api.isActive()) {
  console.log('Transition in progress...');
}
```

##### `getDeviceProfile()`

Get current device profile information.

```javascript
const profile = api.getDeviceProfile();
console.log('Profile:', profile.name);
console.log('Config:', profile.config);
console.log('Capabilities:', profile.capabilities);
```

**Returns:**
```javascript
{
  name: 'HIGH_END',  // or 'MID_RANGE', 'LOW_END', 'MOBILE'
  config: {
    particleCount: 300,
    targetFPS: 60,
    useWebGL: true,
    // ... more config
  },
  capabilities: {
    isMobile: false,
    webgl2: true,
    webgl1: true,
    gpuTier: 'high',
    memory: 8,
    cpuCores: 8
  }
}
```

##### `updateConfig(newConfig)`

Update configuration at runtime.

```javascript
api.updateConfig({
  particleCount: 150,
  targetFPS: 30
});
```

##### `setDebug(enabled)`

Enable or disable debug mode.

```javascript
api.setDebug(true);  // Shows FPS, particle count, phase info
```

##### `destroy()`

Clean up and destroy the API instance.

```javascript
api.destroy();
```

### HybridPageTransitionConfig

Configuration management for page-specific behaviors.

#### Global Configuration

```javascript
window.HybridPageTransitionConfig.updateGlobalConfig({
  enabled: true,
  autoOptimize: true,
  debug: false
});
```

#### Page Behaviors

Define custom transition behaviors per page:

```javascript
window.HybridPageTransitionConfig.addPageBehavior('gallery', {
  particleCount: 250,
  explosionIntensity: 1.5,
  colors: [
    'rgba(255, 0, 0, 0.9)',
    'rgba(0, 255, 0, 0.9)',
    'rgba(0, 0, 255, 0.9)'
  ]
});
```

#### Debug Functions

```javascript
// Enable debug mode
window.HybridPageTransitionConfig.enableDebug();

// Disable debug mode
window.HybridPageTransitionConfig.disableDebug();
```

## Configuration Examples

### Example 1: Simple Setup

```html
<!DOCTYPE html>
<html data-hybrid-transitions>
<head>
  <title>My Page</title>
  <script defer src="js/hybrid-page-transition-api.js"></script>
  <script defer src="js/hybrid-page-transition-config.js"></script>
  <script defer src="js/hybrid-page-transition-init.js"></script>
</head>
<body>
  <a href="page2.html">Go to Page 2</a>
</body>
</html>
```

### Example 2: Custom Page Behavior

```html
<script>
// After loading the API
window.addEventListener('DOMContentLoaded', () => {
  // Add custom behavior for 'about' page
  window.HybridPageTransitionConfig.addPageBehavior('about', {
    particleCount: 180,
    explosionIntensity: 1.2,
    colors: [
      'rgba(255, 100, 100, 0.9)',
      'rgba(100, 255, 100, 0.9)',
      'rgba(100, 100, 255, 0.9)'
    ]
  });
  
  // Initialize
  window.HybridPageTransitionAPI.init();
});
</script>
```

### Example 3: Manual Control

```html
<script>
const api = window.HybridPageTransitionAPI.create({
  autoOptimize: true,
  debug: true
});

// Manual transition on button click
document.getElementById('myButton').addEventListener('click', () => {
  const elements = document.querySelectorAll('h1, p, button');
  
  api.startTransition({
    fromElements: Array.from(elements),
    colors: ['rgba(255, 0, 0, 0.9)'],
    particleCount: 200,
    onComplete: () => {
      window.location.href = 'next-page.html';
    }
  });
});
</script>
```

### Example 4: Debug Mode

```html
<script>
// Enable debug mode to see performance metrics
window.HybridPageTransitionConfig.enableDebug();

// Initialize with debug
const system = window.HybridPageTransitionAPI.init({
  customBehaviors: window.HybridPageTransitionConfig.PAGE_BEHAVIORS
});

// Toggle debug with Ctrl+Shift+D
// (automatically enabled when debug config is active)
</script>
```

## Device Profiles

The API automatically detects device capabilities and applies an appropriate profile:

### HIGH_END
- **Detected on:** Discrete GPU, 8+ GB RAM, 4+ CPU cores
- **Particle Count:** 300
- **Target FPS:** 60
- **WebGL:** Enabled
- **Effects:** Bloom, Trails

### MID_RANGE
- **Detected on:** Integrated GPU, 4-8 GB RAM
- **Particle Count:** 150
- **Target FPS:** 45
- **WebGL:** Enabled
- **Effects:** Basic

### LOW_END
- **Detected on:** Weak GPU, < 4 GB RAM, or no WebGL
- **Particle Count:** 80
- **Target FPS:** 30
- **WebGL:** Disabled (Canvas 2D)
- **Effects:** None

### MOBILE
- **Detected on:** Mobile devices and tablets
- **Particle Count:** 60
- **Target FPS:** 30
- **WebGL:** Enabled (optimized)
- **Effects:** None

## Performance Optimization

### Auto-Optimization

The API monitors performance and automatically reduces particle count if FPS drops below target:

```javascript
// Enabled by default
const api = window.HybridPageTransitionAPI.create({
  autoOptimize: true
});
```

### Manual Optimization

Force a specific device profile:

```javascript
window.HybridPageTransitionConfig.DEBUG_CONFIG.forceDeviceProfile = 'LOW_END';
```

Force a specific renderer:

```javascript
window.HybridPageTransitionConfig.DEBUG_CONFIG.forceRenderer = 'canvas';
```

## Accessibility

The API respects user accessibility preferences:

- **Reduced Motion:** Automatically reduces particle count and transition duration when `prefers-reduced-motion` is detected
- **Keyboard Navigation:** Transitions work with keyboard navigation
- **Screen Readers:** Transitions don't interfere with screen reader functionality

## Browser Compatibility

| Browser | WebGL Support | Canvas Fallback | Notes |
|---------|---------------|-----------------|-------|
| Chrome 60+ | ✅ WebGL 2.0 | ✅ | Full support |
| Firefox 55+ | ✅ WebGL 2.0 | ✅ | Full support |
| Safari 12+ | ✅ WebGL 2.0 | ✅ | Full support |
| Edge 79+ | ✅ WebGL 2.0 | ✅ | Full support |
| IE 11 | ⚠️ WebGL 1.0 | ✅ | Limited support |
| Mobile Safari | ✅ WebGL 1.0 | ✅ | Mobile profile |
| Chrome Android | ✅ WebGL 2.0 | ✅ | Mobile profile |

## Troubleshooting

### Transitions Not Working

1. Check console for errors
2. Verify scripts are loaded in correct order
3. Ensure `data-hybrid-transitions` attribute is present (if using auto-init)
4. Check if transitions are enabled in configuration

```javascript
// Check if API is available
console.log(window.HybridPageTransitionAPI);

// Check device profile
const api = window.HybridPageTransitionAPI.instance;
console.log(api.getDeviceProfile());
```

### Low Performance

1. Enable auto-optimization:
   ```javascript
   api.updateConfig({ autoOptimize: true });
   ```

2. Reduce particle count:
   ```javascript
   window.HybridPageTransitionConfig.PAGE_BEHAVIORS.home.particleCount = 60;
   ```

3. Force Canvas renderer:
   ```javascript
   window.HybridPageTransitionConfig.DEBUG_CONFIG.forceRenderer = 'canvas';
   ```

### Debug Information

Enable debug mode to see detailed information:

```javascript
window.HybridPageTransitionConfig.enableDebug();
```

Debug overlay shows:
- Current FPS
- Particle count
- Transition phase
- Device profile

## Security

The API includes security measures:

- **URL Validation:** Blocks dangerous URL schemes (javascript:, data:, file:)
- **External Link Detection:** Skips transitions for external links
- **XSS Prevention:** No eval() or innerHTML usage
- **CSP Compatible:** Works with Content Security Policy

## Advanced Usage

### Custom Renderer

You can access low-level components for custom implementations:

```javascript
const DeviceDetector = window.HybridPageTransitionAPI.DeviceProfileDetector;
const detector = new DeviceDetector();
console.log('GPU Tier:', detector.capabilities.gpuTier);
```

### CSS Fallback

For environments without JavaScript or as a fallback:

```javascript
window.HybridPageTransitionAPI.CSSFallback.applyTransition(() => {
  window.location.href = 'next-page.html';
});
```

### Performance Monitoring

```javascript
const PerformanceMonitor = window.HybridPageTransitionAPI.PerformanceMonitor;
const monitor = new PerformanceMonitor();

// In animation loop
monitor.update();
console.log('Current FPS:', monitor.getFPS());
```

## License

This API is part of the Indrolend Website project. See main repository LICENSE for details.

## Support

For issues, questions, or contributions, please visit the GitHub repository:
https://github.com/indrolend/indrolend-website
