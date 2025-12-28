/**
 * Spotify Frontend Integration Module
 * Handles fetching and displaying live Spotify artist data
 */

// Configuration
// Use environment-appropriate URL - HTTPS in production, HTTP only for localhost
const SPOTIFY_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://your-backend-url.com'; // Update this to your deployed backend URL
const CACHE_DURATION = 5 * 60 * 1000; // Cache data for 5 minutes

// Cache object
let cachedSpotifyData = null;
let cacheTimestamp = null;

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
 * Create the Spotify data display HTML
 */
function createSpotifyDisplay(data) {
  const { artist, topTracks } = data;
  
  // Create the main container
  const container = document.createElement('div');
  container.className = 'spotify-data-container';
  container.innerHTML = `
    <div class="spotify-artist-info">
      <h2 class="spotify-section-title">Live from Spotify</h2>
      <div class="spotify-stats">
        <div class="spotify-stat">
          <span class="spotify-stat-value">${formatNumber(artist.followers)}</span>
          <span class="spotify-stat-label">Followers</span>
        </div>
        <div class="spotify-stat">
          <span class="spotify-stat-value">${artist.popularity}</span>
          <span class="spotify-stat-label">Popularity</span>
        </div>
      </div>
      ${artist.genres && artist.genres.length > 0 ? `
        <div class="spotify-genres">
          ${artist.genres.map(genre => `<span class="spotify-genre-tag">${genre}</span>`).join('')}
        </div>
      ` : ''}
    </div>
    
    ${topTracks && topTracks.length > 0 ? `
      <div class="spotify-tracks">
        <h3 class="spotify-tracks-title">Top Tracks</h3>
        <div class="spotify-tracks-list">
          ${topTracks.map((track, index) => `
            <div class="spotify-track-item">
              <span class="spotify-track-number">${index + 1}</span>
              ${track.albumImage ? `
                <img src="${track.albumImage}" alt="${track.album}" class="spotify-track-image" />
              ` : ''}
              <div class="spotify-track-info">
                <div class="spotify-track-name">${track.name}</div>
                <div class="spotify-track-album">${track.album}</div>
              </div>
              <span class="spotify-track-duration">${formatDuration(track.duration)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
  
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
