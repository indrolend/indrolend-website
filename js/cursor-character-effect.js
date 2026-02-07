/**
 * Cursor Character Effect
 * Displays random non-alphabetic characters that follow the cursor on desktop
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Character pool: numbers, punctuation, and symbols (NO alphabet)
    characters: '0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
    // Maximum number of active character elements
    maxCharacters: 15,
    // Fade out duration in milliseconds
    fadeOutDuration: 800,
    // Character spawn interval in milliseconds
    spawnInterval: 50,
    // Minimum distance mouse must move to spawn new character
    minMoveDistance: 10
  };

  // State
  let isDesktop = false;
  let isEnabled = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let characterElements = [];
  let lastSpawnTime = 0;

  /**
   * Check if the device is desktop (non-touch)
   */
  function checkIfDesktop() {
    // Check for touch support and screen size
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLargeScreen = window.innerWidth >= 768;
    return !hasTouch && isLargeScreen;
  }

  /**
   * Get a random character from the pool
   */
  function getRandomCharacter() {
    const chars = CONFIG.characters;
    return chars[Math.floor(Math.random() * chars.length)];
  }

  /**
   * Create a character element at the cursor position
   */
  function createCharacterElement(x, y) {
    const char = document.createElement('span');
    char.className = 'cursor-char';
    char.textContent = getRandomCharacter();
    char.style.left = x + 'px';
    char.style.top = y + 'px';
    
    // Random size variation
    const size = 12 + Math.random() * 8; // 12-20px
    char.style.fontSize = size + 'px';
    
    // Random slight offset from exact cursor position
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    char.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    document.body.appendChild(char);
    characterElements.push(char);

    // Remove character after fade out
    setTimeout(() => {
      char.style.opacity = '0';
      setTimeout(() => {
        if (char.parentNode) {
          char.parentNode.removeChild(char);
        }
        const index = characterElements.indexOf(char);
        if (index > -1) {
          characterElements.splice(index, 1);
        }
      }, CONFIG.fadeOutDuration);
    }, 100);

    // Clean up old characters if too many
    if (characterElements.length > CONFIG.maxCharacters) {
      const oldChar = characterElements.shift();
      if (oldChar && oldChar.parentNode) {
        oldChar.style.opacity = '0';
        setTimeout(() => {
          if (oldChar.parentNode) {
            oldChar.parentNode.removeChild(oldChar);
          }
        }, CONFIG.fadeOutDuration);
      }
    }
  }

  /**
   * Handle mouse move event
   */
  function handleMouseMove(e) {
    if (!isEnabled) return;

    const currentTime = Date.now();
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only spawn character if mouse moved enough and enough time has passed
    if (distance >= CONFIG.minMoveDistance && 
        currentTime - lastSpawnTime >= CONFIG.spawnInterval) {
      createCharacterElement(e.clientX, e.clientY);
      lastSpawnTime = currentTime;
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }

  /**
   * Debounce helper function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Handle window resize with device check
   */
  function handleResize() {
    const wasDesktop = isDesktop;
    isDesktop = checkIfDesktop();
    
    if (wasDesktop && !isDesktop) {
      // Switched to mobile
      isEnabled = false;
      // Clean up existing characters
      characterElements.forEach(char => {
        if (char.parentNode) {
          char.parentNode.removeChild(char);
        }
      });
      characterElements = [];
    } else if (!wasDesktop && isDesktop) {
      // Switched to desktop
      isEnabled = true;
    }
  }

  /**
   * Initialize the cursor character effect
   */
  function init() {
    isDesktop = checkIfDesktop();
    
    if (!isDesktop) {
      console.log('Cursor character effect disabled: not a desktop device');
      return;
    }

    isEnabled = true;
    console.log('Cursor character effect enabled');

    // Add mouse move listener
    document.addEventListener('mousemove', handleMouseMove);

    // Re-check on resize with debouncing (in case device orientation changes)
    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
