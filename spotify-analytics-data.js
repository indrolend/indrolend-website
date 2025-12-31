/**
 * Spotify Analytics Data (Last 28 Days)
 * Business snapshot showing core metrics and audience insights
 */

const spotifyAnalyticsData = {
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

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.spotifyAnalyticsData = spotifyAnalyticsData;
}
