/**
 * Security Utilities Module
 * Shared functions for sanitization and validation across the application
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts characters like <, >, &, ", ' to their HTML entity equivalents
 * Uses map-based approach for better performance and clarity
 * 
 * @param {*} text - Text to escape (will be converted to string)
 * @returns {string} Escaped HTML string safe for insertion into DOM
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    text = String(text);
  }
  
  // Map-based escaping for better performance and clearer intent
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  
  return text.replace(/[&<>"']/g, char => htmlEscapeMap[char]);
}

/**
 * Sanitize and validate Spotify URLs
 * Ensures the URL is from spotify.com domain with HTTPS and matches expected patterns
 * 
 * @param {string} url - URL to validate
 * @param {string[]} allowedPaths - Optional array of allowed path patterns (e.g., ['/artist/', '/track/'])
 * @returns {string} Sanitized URL or '#' if invalid
 */
function sanitizeSpotifyUrl(url, allowedPaths = null) {
  if (!url || typeof url !== 'string') return '#';
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS protocol
    if (parsedUrl.protocol !== 'https:') {
      console.warn('Invalid Spotify URL protocol (must be HTTPS):', url);
      return '#';
    }
    
    // Only allow spotify.com and open.spotify.com domains (exact match)
    const validDomains = ['open.spotify.com', 'spotify.com'];
    if (!validDomains.includes(parsedUrl.hostname)) {
      console.warn('Invalid Spotify URL domain:', url);
      return '#';
    }
    
    // If path restrictions are specified, validate them using startsWith for security
    if (allowedPaths && Array.isArray(allowedPaths)) {
      const hasValidPath = allowedPaths.some(pattern => parsedUrl.pathname.startsWith(pattern));
      if (!hasValidPath) {
        console.warn('Invalid Spotify URL path:', url);
        return '#';
      }
    }
    
    return url;
  } catch (e) {
    // Invalid URL - return safe default
    console.warn('Invalid Spotify URL:', url);
  }
  
  return '#';
}

/**
 * Sanitize image URL to prevent XSS and ensure it's from trusted sources
 * Only allows HTTPS URLs from Spotify's CDN with exact domain matching
 * 
 * @param {string} url - Image URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS protocol
    if (parsedUrl.protocol !== 'https:') {
      console.warn('Invalid image URL protocol (must be HTTPS):', url);
      return null;
    }
    
    // Exact domain matching for Spotify CDN (prevents subdomain attacks)
    const validImageDomains = [
      'i.scdn.co',
      'mosaic.scdn.co',
      'lineup-images.scdn.co',
      'thisis-images.scdn.co',
      'charts-images.scdn.co',
      'seed-mix-image.spotifycdn.com',
      'image-cdn-ak.spotifycdn.com',
      'image-cdn-fa.spotifycdn.com'
    ];
    
    if (!validImageDomains.includes(parsedUrl.hostname)) {
      console.warn('Invalid image URL domain:', url);
      return null;
    }
    
    return url;
  } catch (e) {
    console.warn('Invalid image URL:', url);
  }
  
  return null;
}

/**
 * Format number with commas for display
 * 
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SecurityUtils = {
    escapeHtml,
    sanitizeSpotifyUrl,
    sanitizeImageUrl,
    formatNumber
  };
}
