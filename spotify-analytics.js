/**
 * Spotify Analytics Display Module
 * Renders the business snapshot analytics data
 */

/**
 * Format number with commas
 */
function formatAnalyticsNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Create a metric card
 */
function createMetricCard(label, value, change) {
  const changeClass = change.startsWith('+') ? 'positive' : change.startsWith('-') ? 'negative' : 'neutral';
  return `
    <div class="analytics-metric-card">
      <div class="analytics-metric-value">${formatAnalyticsNumber(value)}</div>
      <div class="analytics-metric-label">${label}</div>
      <div class="analytics-metric-change ${changeClass}">${change}</div>
    </div>
  `;
}

/**
 * Create discovery sources chart
 */
function createDiscoverySourcesDisplay(sources) {
  return `
    <div class="analytics-section">
      <h3 class="analytics-section-title">Discovery Sources (Listeners)</h3>
      <div class="analytics-discovery-grid">
        <div class="analytics-discovery-category">
          <div class="analytics-discovery-header">
            <span class="analytics-discovery-label">Active Sources</span>
            <span class="analytics-discovery-percentage">${sources.active.total}%</span>
          </div>
          <div class="analytics-discovery-breakdown">
            <div class="analytics-discovery-item">
              <span class="analytics-discovery-item-label">Artist profile & catalog</span>
              <span class="analytics-discovery-item-value">${sources.active.breakdown.artistProfile}%</span>
            </div>
            <div class="analytics-discovery-item">
              <span class="analytics-discovery-item-label">Own playlists & library</span>
              <span class="analytics-discovery-item-value">${sources.active.breakdown.ownPlaylists}%</span>
            </div>
            <div class="analytics-discovery-item">
              <span class="analytics-discovery-item-label">Listener queue</span>
              <span class="analytics-discovery-item-value">${sources.active.breakdown.listenerQueue}%</span>
            </div>
          </div>
        </div>
        
        <div class="analytics-discovery-category">
          <div class="analytics-discovery-header">
            <span class="analytics-discovery-label">Programmed Sources</span>
            <span class="analytics-discovery-percentage">${sources.programmed.total}%</span>
          </div>
          <div class="analytics-discovery-breakdown">
            <div class="analytics-discovery-item">
              <span class="analytics-discovery-item-label">Algorithmic playlists</span>
              <span class="analytics-discovery-item-value">${sources.programmed.breakdown.algorithmicPlaylists}%</span>
            </div>
            <div class="analytics-discovery-item">
              <span class="analytics-discovery-item-label">Other listeners' playlists</span>
              <span class="analytics-discovery-item-value">${sources.programmed.breakdown.otherPlaylists}%</span>
            </div>
            <div class="analytics-discovery-item">
              <span class="analytics-discovery-item-label">Radio & autoplay</span>
              <span class="analytics-discovery-item-value">${sources.programmed.breakdown.radioAutoplay}%</span>
            </div>
          </div>
        </div>
        
        <div class="analytics-discovery-category">
          <div class="analytics-discovery-header">
            <span class="analytics-discovery-label">Other Sources</span>
            <span class="analytics-discovery-percentage">${sources.other}%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create demographics display
 */
function createDemographicsDisplay(demographics) {
  return `
    <div class="analytics-section">
      <h3 class="analytics-section-title">Audience Demographics</h3>
      <div class="analytics-demographics-grid">
        <div class="analytics-demographic-category">
          <h4 class="analytics-demographic-subtitle">Gender</h4>
          <div class="analytics-demographic-bars">
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">Male</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.gender.male}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.gender.male}%</span>
            </div>
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">Female</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.gender.female}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.gender.female}%</span>
            </div>
            ${demographics.gender.notSpecified > 0 ? `
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">Not Specified</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.gender.notSpecified}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.gender.notSpecified}%</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="analytics-demographic-category">
          <h4 class="analytics-demographic-subtitle">Age Distribution</h4>
          <div class="analytics-demographic-bars">
            ${demographics.age.under18 > 0 ? `
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">&lt;18</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.age.under18}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.age.under18}%</span>
            </div>
            ` : ''}
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">18-24</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.age["18-24"]}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.age["18-24"]}%</span>
            </div>
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">25-34</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.age["25-34"]}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.age["25-34"]}%</span>
            </div>
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">35-44</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.age["35-44"]}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.age["35-44"]}%</span>
            </div>
            ${demographics.age["45-54"] > 0 ? `
            <div class="analytics-demographic-bar">
              <span class="analytics-demographic-label">45-54</span>
              <div class="analytics-demographic-bar-bg">
                <div class="analytics-demographic-bar-fill" style="width: ${demographics.age["45-54"]}%"></div>
              </div>
              <span class="analytics-demographic-value">${demographics.age["45-54"]}%</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create geography display
 */
function createGeographyDisplay(countries, cities) {
  return `
    <div class="analytics-section">
      <h3 class="analytics-section-title">Top Locations</h3>
      <div class="analytics-geography-grid">
        <div class="analytics-geography-column">
          <h4 class="analytics-geography-subtitle">Countries</h4>
          <div class="analytics-location-list">
            ${countries.map((country, idx) => `
              <div class="analytics-location-item">
                <span class="analytics-location-rank">${idx + 1}</span>
                <span class="analytics-location-name">${country.name}</span>
                <span class="analytics-location-value">${formatAnalyticsNumber(country.listeners)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="analytics-geography-column">
          <h4 class="analytics-geography-subtitle">Cities</h4>
          <div class="analytics-location-list">
            ${cities.map((city, idx) => `
              <div class="analytics-location-item">
                <span class="analytics-location-rank">${idx + 1}</span>
                <span class="analytics-location-name">${city.name}</span>
                <span class="analytics-location-value">${formatAnalyticsNumber(city.listeners)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create insights display
 */
function createInsightsDisplay(insights) {
  return `
    <div class="analytics-section">
      <h3 class="analytics-section-title">Key Insights</h3>
      <div class="analytics-insights">
        ${insights.map(insight => `
          <div class="analytics-insight-item">
            <span class="analytics-insight-bullet">•</span>
            <span class="analytics-insight-text">${insight}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Format date string for display
 */
function formatDateGenerated(isoDateString) {
  if (!isoDateString) return '';
  
  try {
    const date = new Date(isoDateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    };
    return date.toLocaleString('en-US', options) + ' UTC';
  } catch (e) {
    return '';
  }
}

/**
 * Create the complete analytics display
 */
function createAnalyticsDisplay(data) {
  const container = document.createElement('div');
  container.className = 'spotify-analytics-container';
  
  const dateGeneratedText = data.dateGenerated 
    ? `<div class="analytics-date-generated">Last updated: ${formatDateGenerated(data.dateGenerated)}</div>`
    : '';
  
  // Get top tracks HTML if available
  let topTracksHTML = '';
  if (window.spotifyLiveData && window.spotifyLiveData.topTracks && window.createTopTracksHTML) {
    topTracksHTML = window.createTopTracksHTML(window.spotifyLiveData.topTracks);
  }
  
  container.innerHTML = `
    <div class="analytics-header">
      <h2 class="analytics-main-title">Spotify Snapshot</h2>
      <div class="analytics-period">${data.period}</div>
      ${dateGeneratedText}
    </div>
    
    <div class="analytics-section">
      <h3 class="analytics-section-title">Core Metrics</h3>
      <div class="analytics-metrics-grid">
        ${createMetricCard('Total Listeners', data.coreMetrics.totalListeners.value, data.coreMetrics.totalListeners.change)}
        ${createMetricCard('Total Streams', data.coreMetrics.totalStreams.value, data.coreMetrics.totalStreams.change)}
        ${createMetricCard('Streams/Listener', data.coreMetrics.streamsPerListener.value, data.coreMetrics.streamsPerListener.change)}
        ${createMetricCard('Saves', data.coreMetrics.saves.value, data.coreMetrics.saves.change)}
        ${createMetricCard('Playlist Adds', data.coreMetrics.playlistAdds.value, data.coreMetrics.playlistAdds.change)}
        ${createMetricCard('Followers', data.coreMetrics.followers.value, data.coreMetrics.followers.change)}
      </div>
    </div>
    
    ${createDiscoverySourcesDisplay(data.discoverySources)}
    ${createDemographicsDisplay(data.demographics)}
    ${createGeographyDisplay(data.topCountries, data.topCities)}
    ${createInsightsDisplay(data.insights)}
    ${topTracksHTML}
  `;
  
  return container;
}

/**
 * Initialize the analytics display
 */
function initSpotifyAnalytics() {
  const targetElement = document.getElementById('spotify-analytics-placeholder');
  
  if (!targetElement) {
    console.warn('Spotify analytics placeholder element not found');
    return;
  }
  
  if (!window.spotifyAnalyticsData) {
    console.error('Spotify analytics data not loaded');
    return;
  }
  
  targetElement.innerHTML = '';
  targetElement.appendChild(createAnalyticsDisplay(window.spotifyAnalyticsData));
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.initSpotifyAnalytics = initSpotifyAnalytics;
}
