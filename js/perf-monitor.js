/**
 * Lightweight Performance Monitor (Dev-only)
 * Tracks FPS, worst frames, and provides allocation counters for hot modules
 */

(function() {
  'use strict';

  // Enable/disable monitoring
  const ENABLE_MONITORING = true; // Set to false in production
  const LOG_INTERVAL = 5000; // Log stats every 5 seconds
  const WORST_FRAME_THRESHOLD = 50; // Log frames slower than 50ms (< 20 FPS)

  if (!ENABLE_MONITORING) return;

  // FPS tracking
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;
  let worstFrameTime = 0;
  let worstFrameTimestamp = 0;

  // Allocation tracking
  const allocStats = {
    particles: {
      arrays: 0,
      objects: 0
    },
    dom: {
      elements: 0,
      eventListeners: 0
    }
  };

  // Frame timing
  let lastFrameTime = performance.now();

  function measureFrame() {
    const now = performance.now();
    const delta = now - lastFrameTime;
    
    // Track worst frame
    if (delta > worstFrameTime) {
      worstFrameTime = delta;
      worstFrameTimestamp = now;
      
      // Log immediately if frame is very slow
      if (delta > WORST_FRAME_THRESHOLD) {
        console.warn(`[PERF] Slow frame detected: ${delta.toFixed(2)}ms (${(1000/delta).toFixed(1)} FPS)`);
      }
    }
    
    frameCount++;
    lastFrameTime = now;
    
    // Calculate FPS every second
    if (now - lastTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = now;
    }
    
    requestAnimationFrame(measureFrame);
  }

  function logStats() {
    const memory = performance.memory ? {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    } : 'Not available';

    console.group('[PERF] Performance Stats');
    console.log('FPS:', fps);
    console.log('Worst frame:', worstFrameTime.toFixed(2) + 'ms', '(at', (worstFrameTimestamp / 1000).toFixed(1) + 's)');
    if (memory !== 'Not available') {
      console.log('Memory:', memory.usedJSHeapSize, '/', memory.limit);
    }
    console.log('Allocations:', allocStats);
    console.groupEnd();
    
    // Reset worst frame after logging
    worstFrameTime = 0;
  }

  // Start monitoring
  requestAnimationFrame(measureFrame);
  setInterval(logStats, LOG_INTERVAL);

  // Expose allocation tracking API
  window.perfMonitor = {
    trackAlloc: function(module, type) {
      if (allocStats[module] && allocStats[module][type] !== undefined) {
        allocStats[module][type]++;
      }
    },
    getStats: function() {
      return {
        fps,
        worstFrameTime,
        allocStats: JSON.parse(JSON.stringify(allocStats))
      };
    },
    reset: function() {
      worstFrameTime = 0;
      fps = 0;
      allocStats.particles.arrays = 0;
      allocStats.particles.objects = 0;
      allocStats.dom.elements = 0;
      allocStats.dom.eventListeners = 0;
    }
  };

  console.log('[PERF] Performance monitoring enabled. Stats will be logged every', LOG_INTERVAL / 1000, 'seconds.');
})();
