/**
 * Spotify Analytics Data (Last 28 Days)
 * Loads analytics data from parsed screenshots or falls back to default data
 */

// Default/fallback data
const defaultSpotifyAnalyticsData = {
  period: "Last 28 Days",
  coreMetrics: {
    totalListeners: { value: 431, change: "+40%" },
    totalStreams: { value: 2459, change: "+39%" },
    streamsPerListener: { value: 5.7, change: "-1%" },
    saves: { value: 340, change: "+196%" },
    playlistAdds: { value: 238, change: "+65%" },
    followers: { value: 244, change: "+3%" }
  },
  discoverySources: {
    active: {
      total: 83,
      breakdown: {
        artistProfile: 54,
        ownPlaylists: 33,
        listenerQueue: 4
      }
    },
    programmed: {
      total: 12,
      breakdown: {
        algorithmicPlaylists: 3,
        otherPlaylists: 3,
        radioAutoplay: 6,
        editorialPlaylists: 0,
        charts: 0
      }
    },
    other: 5
  },
  demographics: {
    gender: {
      male: 54,
      female: 38,
      nonBinary: 0,
      notSpecified: 8
    },
    age: {
      under18: 6,
      "18-24": 28,
      "25-34": 42,
      "35-44": 13,
      "45-54": 6,
      "55-64": 3,
      "65+": 2
    }
  },
  topCountries: [
    { name: "United States", listeners: 405 },
    { name: "United Kingdom", listeners: 5 },
    { name: "Australia", listeners: 4 }
  ],
  topCities: [
    { name: "Dallas", listeners: 15 },
    { name: "Los Angeles", listeners: 13 },
    { name: "Atlanta", listeners: 8 },
    { name: "Phoenix", listeners: 8 },
    { name: "Houston", listeners: 8 },
    { name: "Chicago", listeners: 8 },
    { name: "Portland", listeners: 7 },
    { name: "San Antonio", listeners: 7 },
    { name: "New York", listeners: 7 },
    { name: "Denver", listeners: 7 }
  ],
  insights: [
    "Listener growth is accelerating",
    "Streams per listener are stable (repeat engagement)",
    "Saves and playlist adds are outpacing listener growth",
    "Discovery is primarily organic/human-driven",
    "Algorithmic amplification is minimal but present",
    "Audience concentration strongest in US metro areas"
  ]
};

/**
 * Load analytics data from parsed-stats.json
 */
async function loadSpotifyAnalyticsData() {
  try {
    const response = await fetch('/data/parsed-stats.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Check if we have analytics data from parsed screenshots
    if (data.analytics && hasValidData(data.analytics)) {
      console.log('✓ Loaded analytics from parsed screenshots');
      return data.analytics;
    } else {
      console.log('⚠ No valid analytics data in parsed screenshots, using default data');
      return defaultSpotifyAnalyticsData;
    }
  } catch (error) {
    console.warn('Failed to load parsed stats, using default data:', error);
    return defaultSpotifyAnalyticsData;
  }
}

/**
 * Check if analytics data has valid values
 */
function hasValidData(analytics) {
  // Check if at least one core metric has a non-zero value
  const coreMetrics = analytics.coreMetrics || {};
  const hasMetrics = Object.values(coreMetrics).some(metric => {
    return metric && metric.value && metric.value > 0;
  });
  
  return hasMetrics;
}

/**
 * Initialize analytics with loaded data
 */
function initializeAnalytics() {
  // Trigger initialization if the init function is already loaded
  if (typeof window.initSpotifyAnalytics === 'function') {
    window.initSpotifyAnalytics();
  } else {
    // If not loaded yet, set up a listener for when it becomes available
    console.log('⏳ Waiting for spotify-analytics.js to load...');
    // Retry a few times in case the script is still loading
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = setInterval(() => {
      retryCount++;
      if (typeof window.initSpotifyAnalytics === 'function') {
        clearInterval(retryInterval);
        window.initSpotifyAnalytics();
      } else if (retryCount >= maxRetries) {
        clearInterval(retryInterval);
        console.error('❌ spotify-analytics.js failed to load');
      }
    }, 100);
  }
}

// Initialize the data
loadSpotifyAnalyticsData().then(data => {
  window.spotifyAnalyticsData = data;
  initializeAnalytics();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.loadSpotifyAnalyticsData = loadSpotifyAnalyticsData;
}
