// api/stats/tiktok.js
// Vercel Serverless Function for fetching TikTok stats

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development' || !process.env.TIKTOK_CLIENT_KEY) {
      // Return mock data for development
      return res.json({
        followers: 8901,
        totalLikes: 123456,
        videoViews: 987654,
        _demo: true
      });
    }

    // Note: TikTok does not provide a straightforward public API for creator stats
    // Options:
    // 1. TikTok Login Kit + Display API (limited data after OAuth)
    // 2. TikTok Research API (requires special approval)
    // 3. Manual export from TikTok Analytics
    // 4. Third-party services (Social Blade, Pentos)

    // This is a placeholder implementation
    // In production, you would either:
    // - Use TikTok Login Kit API after user authorization
    // - Store manually exported data in a database
    // - Use a third-party aggregator service

    res.status(501).json({
      error: 'TikTok stats require manual setup',
      message: 'TikTok does not provide a simple public API for creator stats. See STATS_SETUP.md for options.',
      _note: 'Consider using TikTok Login Kit or exporting data manually from TikTok Analytics'
    });
  } catch (error) {
    console.error('TikTok API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch TikTok stats',
      message: error.message 
    });
  }
};
