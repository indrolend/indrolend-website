/**
 * Genie Transition Effect
 * Mac-like genie effect for page transitions
 * Animates the page content being sucked into or coming out of a button
 */

(function() {
  'use strict';

  const TRANSITION_DURATION = 600; // milliseconds
  const GRID_ROWS = 20; // Number of horizontal slices
  
  /**
   * Apply genie effect when leaving a page (sucking into button)
   */
  function applyGenieOut(targetButton, onComplete) {
    // Get button position
    const buttonRect = targetButton.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '99999';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Capture the current page
    const pageCapture = capturePageAsImage();

    // Hide original content
    document.body.style.overflow = 'hidden';
    const allElements = document.querySelectorAll('body > *:not(canvas)');
    allElements.forEach(el => {
      if (el !== canvas) {
        el.style.visibility = 'hidden';
      }
    });

    // Animation parameters
    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / TRANSITION_DURATION, 1);
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw distorted image
      drawGenieEffect(ctx, pageCapture, buttonCenterX, buttonCenterY, eased, 'in');

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Cleanup
        document.body.removeChild(canvas);
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(animate);
  }

  /**
   * Apply genie effect when entering a page (expanding from button)
   */
  function applyGenieIn(sourcePosition, onComplete) {
    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '99999';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');

    // Hide content initially
    const allElements = document.querySelectorAll('body > *:not(canvas)');
    allElements.forEach(el => {
      if (el !== canvas) {
        el.style.visibility = 'hidden';
      }
    });

    // Capture the page that will be shown
    setTimeout(() => {
      allElements.forEach(el => {
        if (el !== canvas) {
          el.style.visibility = 'visible';
        }
      });

      const pageCapture = capturePageAsImage();

      allElements.forEach(el => {
        if (el !== canvas) {
          el.style.visibility = 'hidden';
        }
      });

      // Animation parameters
      let startTime = null;
      const buttonCenterX = sourcePosition.x;
      const buttonCenterY = sourcePosition.y;

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / TRANSITION_DURATION, 1);
        
        // Easing function (ease-in-out)
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw distorted image (reverse direction)
        drawGenieEffect(ctx, pageCapture, buttonCenterX, buttonCenterY, 1 - eased, 'in');

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Show content and cleanup
          allElements.forEach(el => {
            if (el !== canvas) {
              el.style.visibility = 'visible';
            }
          });
          document.body.style.overflow = '';
          document.body.removeChild(canvas);
          if (onComplete) onComplete();
        }
      }

      requestAnimationFrame(animate);
    }, 50);
  }

  /**
   * Draw the genie effect distortion
   */
  function drawGenieEffect(ctx, imageData, targetX, targetY, progress, direction) {
    const canvas = ctx.canvas;
    const rowHeight = canvas.height / GRID_ROWS;

    for (let row = 0; row < GRID_ROWS; row++) {
      const rowY = row * rowHeight;
      const nextRowY = (row + 1) * rowHeight;
      
      // Calculate distortion for this row
      // Rows closer to bottom get pulled more toward the target
      const distortionFactor = Math.pow(row / GRID_ROWS, 1.5); // Non-linear distortion
      const pullStrength = progress * distortionFactor;

      // Calculate source and destination coordinates
      const srcX = 0;
      const srcY = rowY;
      const srcWidth = canvas.width;
      const srcHeight = rowHeight + 1; // +1 to avoid gaps

      // Destination: pull toward target point
      const centerPullX = (targetX - canvas.width / 2) * pullStrength;
      const centerPullY = (targetY - rowY - rowHeight / 2) * pullStrength;
      
      const dstX = centerPullX;
      const dstY = rowY + centerPullY;
      const dstWidth = canvas.width * (1 - pullStrength * 0.8); // Compress width
      const dstHeight = rowHeight * (1 - pullStrength * 0.5); // Compress height less

      try {
        ctx.drawImage(
          imageData,
          srcX, srcY, srcWidth, srcHeight,
          dstX, dstY, dstWidth, dstHeight
        );
      } catch (e) {
        // Skip if drawing fails
      }
    }

    // Fade effect during transition
    ctx.globalAlpha = 1 - progress * 0.3;
  }

  /**
   * Capture current page as image
   * NOTE: This is a simplified implementation that returns an empty canvas.
   * The genie transition will work but without actual page content capture.
   * For full visual fidelity, consider using a library like html2canvas.
   * Current behavior: Animation frame distorts but shows a blank/transparent effect.
   */
  function capturePageAsImage() {
    // Create a temporary canvas to capture the page
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = window.innerWidth;
    tempCanvas.height = window.innerHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // We can't actually capture the DOM perfectly without html2canvas library,
    // so we'll use a simpler approach: capture just the visible canvas if it exists
    // For a real implementation, you'd want to use html2canvas or similar
    
    // For now, just return the canvas itself which will be used as the image source
    return tempCanvas;
  }

  /**
   * Store button position in sessionStorage before navigation
   */
  function storeButtonPosition(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    sessionStorage.setItem('genieSourcePosition', JSON.stringify(position));
    
    // Apply genie out effect then navigate
    applyGenieOut(button, () => {
      window.location.href = button.href;
    });
  }

  /**
   * Apply genie in effect when page loads if coming from a stored position
   */
  function checkForGenieIn() {
    const storedPosition = sessionStorage.getItem('genieSourcePosition');
    if (storedPosition) {
      const position = JSON.parse(storedPosition);
      sessionStorage.removeItem('genieSourcePosition');
      
      // Apply genie in effect
      applyGenieIn(position, () => {
        // Animation complete
      });
    }
  }

  /**
   * Initialize genie transitions
   */
  function init() {
    // Check if we should apply genie in effect on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkForGenieIn);
    } else {
      checkForGenieIn();
    }

    // Add click handler to journal button if it exists
    const journalButton = document.getElementById('journalCard');
    if (journalButton && journalButton.tagName === 'A') {
      journalButton.addEventListener('click', storeButtonPosition);
    }

    // Add click handler to back button if on journal page
    const backButton = document.getElementById('back-to-home');
    if (backButton && backButton.tagName === 'A') {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Store a center position for return transition
        const position = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        sessionStorage.setItem('genieSourcePosition', JSON.stringify(position));
        
        // Navigate without the full effect (or implement reverse)
        window.location.href = backButton.href;
      });
    }
  }

  // Export functions for external use
  window.genieTransition = {
    applyGenieOut,
    applyGenieIn,
    storeButtonPosition
  };

  init();
})();
