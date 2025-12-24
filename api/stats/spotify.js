// api/stats/spotify.js
// Vercel Serverless Function for fetching Spotify stats
// Deploy with: vercel

// Note: Vercel provides fetch globally in Node.js 18+
// For older versions, uncomment the next line:
// const fetch = require('node-fetch');

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
    if (process.env.NODE_ENV === 'development' || !process.env.SPOTIFY_CLIENT_ID) {
      // Return mock data for development
      return res.json({
        monthlyListeners: 12345,
        totalPlays: 567890,
        saves: 1234,
        _demo: true
      });
    }

    // Step 1: Get Spotify access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Spotify access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Get artist data
    const artistId = process.env.SPOTIFY_ARTIST_ID || '59X3431NBfd6xWMc3Zlh0v';
    const artistResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!artistResponse.ok) {
      throw new Error('Failed to fetch artist data');
    }

    const artistData = await artistResponse.json();

    // Note: The Spotify Web API provides followers but not monthly listeners
    // Monthly listeners require Spotify for Artists API access
    // For now, we use followers as a proxy metric
    const stats = {
      monthlyListeners: artistData.followers?.total || 0,
      totalPlays: 0, // Requires Spotify for Artists API
      saves: artistData.followers?.total || 0, // Using followers as proxy
      popularity: artistData.popularity || 0,
      _note: 'Monthly listeners and total plays require Spotify for Artists API'
    };

    res.json(stats);
  } catch (error) {
    console.error('Spotify API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Spotify stats',
      message: error.message 
    });
  }
};
