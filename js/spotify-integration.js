/**
 * Spotify Frontend Integration Module
 * Handles fetching and displaying live Spotify artist data
 * 
 * Security Features:
 * - HTML escaping to prevent XSS attacks
 * - URL sanitization for external links
 * - HTTPS enforcement in production
 * - Safe DOM manipulation
 */

// Configuration
// Use environment-appropriate URL - HTTPS in production, HTTP only for localhost
const SPOTIFY_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://spotify-stats-backend-y8hb.onrender.com';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // Cache data for 24 hours (backend caches for 24 hours)

// Cache object
let cachedSpotifyData = null;
let cacheTimestamp = null;

/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts characters like <, >, &, ", ' to their HTML entity equivalents
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Fetch Spotify data from backend
 */
async function fetchSpotifyData() {
  // Return cached data if still valid
  if (cachedSpotifyData && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return cachedSpotifyData;
  }

  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/api/spotify`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update cache
    cachedSpotifyData = data;
    cacheTimestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    throw error;
  }
}

/**
 * Format large numbers with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format duration from milliseconds to MM:SS
 */
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Sanitize and validate Spotify URL
 * Ensures the URL is from spotify.com domain to prevent malicious redirects
 * Also validates protocol to ensure HTTPS
 */
function sanitizeSpotifyUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTPS protocol and spotify.com domains
    if (parsedUrl.protocol === 'https:' && 
        (parsedUrl.hostname === 'open.spotify.com' || parsedUrl.hostname === 'spotify.com')) {
      return url;
    }
  } catch (e) {
    // Invalid URL - return safe default
    console.warn('Invalid Spotify URL:', url);
  }
  
  return '#';
}

/**
 * Sanitize image URL to prevent XSS and ensure it's from trusted sources
 * Only allows HTTPS URLs from Spotify's CDN
 */
function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTPS and Spotify's image CDN domains
    if (parsedUrl.protocol === 'https:' && 
        (parsedUrl.hostname.endsWith('.scdn.co') || 
         parsedUrl.hostname.endsWith('.spotifycdn.com') ||
         parsedUrl.hostname === 'i.scdn.co')) {
      return url;
    }
  } catch (e) {
    console.warn('Invalid image URL:', url);
  }
  
  return null;
}

/**
 * Create the Spotify data display HTML (artist info and top tracks)
 * Uses HTML escaping for all user-controlled content to prevent XSS
 */
function createSpotifyDisplay(data) {
  const { artist, topTracks } = data;
  
  // Sanitize and validate all data from API
  const sanitizedFollowers = parseInt(artist.followers) || 0;
  const sanitizedPopularity = parseInt(artist.popularity) || 0;
  
  // Create the main container
  const container = document.createElement('div');
  container.className = 'spotify-data-container';
  
  // Build HTML with escaped content
  let html = `
    <div class="spotify-artist-info">
      <h2 class="spotify-section-title">Live from Spotify</h2>
      <div class="spotify-stats">
        <div class="spotify-stat">
          <span class="spotify-stat-value">${formatNumber(sanitizedFollowers)}</span>
          <span class="spotify-stat-label">Followers</span>
        </div>
        <div class="spotify-stat">
          <span class="spotify-stat-value">${sanitizedPopularity}</span>
          <span class="spotify-stat-label">Popularity</span>
        </div>
      </div>`;
  
  // Add genres if available (with HTML escaping)
  if (artist.genres && Array.isArray(artist.genres) && artist.genres.length > 0) {
    html += '<div class="spotify-genres">';
    artist.genres.forEach(genre => {
      html += `<span class="spotify-genre-tag">${escapeHtml(genre)}</span>`;
    });
    html += '</div>';
  }
  
  html += '</div>';
  
  // Add top tracks if available (with sanitization)
  if (topTracks && Array.isArray(topTracks) && topTracks.length > 0) {
    html += `
      <div class="spotify-tracks">
        <h3 class="spotify-tracks-title">Top Tracks</h3>
        <div class="spotify-tracks-list">`;
    
    topTracks.forEach((track, index) => {
      const sanitizedUrl = sanitizeSpotifyUrl(track.spotifyUrl);
      const sanitizedImageUrl = sanitizeImageUrl(track.albumImage);
      const sanitizedDuration = parseInt(track.duration) || 0;
      
      html += `
        <a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer" class="spotify-track-link">
          <div class="spotify-track-item">
            <span class="spotify-track-number">${index + 1}</span>`;
      
      if (sanitizedImageUrl) {
        html += `<img src="${sanitizedImageUrl}" alt="${escapeHtml(track.album)}" class="spotify-track-image" loading="lazy" />`;
      }
      
      html += `
            <div class="spotify-track-info">
              <div class="spotify-track-name">${escapeHtml(track.name)}</div>
              <div class="spotify-track-album">${escapeHtml(track.album)}</div>
            </div>
            <span class="spotify-track-duration">${formatDuration(sanitizedDuration)}</span>
          </div>
        </a>`;
    });
    
    html += `
        </div>
      </div>`;
  }
  
  container.innerHTML = html;
  return container;
}

/**
 * Create loading state HTML
 */
function createLoadingDisplay() {
  const container = document.createElement('div');
  container.className = 'spotify-data-container spotify-loading';
  container.innerHTML = `
    <div class="spotify-loading-content">
      <div class="spotify-loading-spinner"></div>
      <p>Loading Spotify data...</p>
    </div>
  `;
  return container;
}

/**
 * Create error state HTML
 */
function createErrorDisplay(error) {
  const container = document.createElement('div');
  container.className = 'spotify-data-container spotify-error';
  container.innerHTML = `
    <div class="spotify-error-content">
      <p>Unable to load Spotify data</p>
      <button class="spotify-retry-button" onclick="window.initSpotifyData()">Retry</button>
    </div>
  `;
  return container;
}

/**
 * Initialize and display Spotify data
 */
async function initSpotifyData() {
  const targetElement = document.getElementById('spotify-data-placeholder');
  
  if (!targetElement) {
    console.warn('Spotify data placeholder element not found');
    return;
  }
  
  // Show loading state
  targetElement.innerHTML = '';
  targetElement.appendChild(createLoadingDisplay());
  
  try {
    const data = await fetchSpotifyData();
    
    // Store data globally for use by other modules
    window.spotifyLiveData = data;
    
    // Clear loading and show data
    targetElement.innerHTML = '';
    targetElement.appendChild(createSpotifyDisplay(data));
  } catch (error) {
    console.error('Failed to initialize Spotify data:', error);
    
    // Show error state
    targetElement.innerHTML = '';
    targetElement.appendChild(createErrorDisplay(error));
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.initSpotifyData = initSpotifyData;
  window.fetchSpotifyData = fetchSpotifyData;
}
