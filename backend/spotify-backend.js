import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Spotify API credentials from environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// Default to Indrolend's artist ID from the Spotify URL in the website
// This is the public artist ID visible in the Spotify link on home.html
const ARTIST_ID = process.env.SPOTIFY_ARTIST_ID || '59X3431NBfd6xWMc3Zlh0v';

// Cache for access token
let accessToken = null;
let tokenExpirationTime = null;

// Cache for artist data (24-hour cache)
let cachedArtistData = null;
let artistDataCacheTime = null;
const ARTIST_DATA_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get Spotify access token using Client Credentials Flow
 * This is secure as the client secret never leaves the backend
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
  }

  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiration time with 5 minute buffer
    tokenExpirationTime = Date.now() + (data.expires_in - 300) * 1000;
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

/**
 * Fetch artist data from Spotify
 */
async function getArtistData(artistId) {
  const token = await getAccessToken();
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch artist data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching artist data:', error);
    throw error;
  }
}

/**
 * Fetch artist's top tracks
 */
async function getArtistTopTracks(artistId, market = 'US') {
  const token = await getAccessToken();
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top tracks: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    throw error;
  }
}

/**
 * Format artist and track data into the response format
 */
function formatSpotifyResponse(artistData, topTracksData) {
  return {
    artist: {
      name: artistData.name,
      followers: artistData.followers.total,
      popularity: artistData.popularity,
      genres: artistData.genres,
      images: artistData.images,
      spotifyUrl: artistData.external_urls.spotify
    },
    topTracks: topTracksData.tracks.slice(0, 5).map(track => ({
      name: track.name,
      album: track.album.name,
      albumImage: track.album.images && track.album.images.length > 0 ? track.album.images[0].url : null,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      duration: track.duration_ms
    })),
    cached: false,
    lastFetched: new Date().toISOString()
  };
}

/**
 * API endpoint to get Spotify artist data
 * GET /api/spotify
 * Returns artist information including followers, genres, popularity, and top tracks
 * Data is cached for 24 hours to reduce API calls
 */
app.get('/api/spotify', async (req, res) => {
  try {
    // Check if we have valid cached data
    if (cachedArtistData && artistDataCacheTime && (Date.now() - artistDataCacheTime < ARTIST_DATA_CACHE_DURATION)) {
      console.log('Serving cached Spotify data');
      return res.json({
        ...cachedArtistData,
        cached: true,
        cacheAge: Math.floor((Date.now() - artistDataCacheTime) / 1000) // age in seconds
      });
    }
    
    console.log('Fetching fresh Spotify data');
    const artistId = req.query.artistId || ARTIST_ID;
    
    // Fetch both artist data and top tracks in parallel
    const [artistData, topTracksData] = await Promise.all([
      getArtistData(artistId),
      getArtistTopTracks(artistId)
    ]);

    // Format the response
    const response = formatSpotifyResponse(artistData, topTracksData);

    // Update cache
    cachedArtistData = response;
    artistDataCacheTime = Date.now();

    res.json(response);
  } catch (error) {
    // Log detailed error server-side
    console.error('Error in /api/spotify endpoint:', error);
    
    // Return generic error message to client (don't expose internal details)
    res.status(500).json({ 
      error: 'Failed to fetch Spotify data',
      message: 'Unable to retrieve artist information at this time. Please try again later.'
    });
  }
});

/**
 * Endpoint to manually refresh the cache
 * POST /api/spotify/refresh-cache
 * This can be used by GitHub Actions to refresh cache on demand
 */
app.post('/api/spotify/refresh-cache', async (req, res) => {
  try {
    console.log('Manual cache refresh requested');
    const artistId = req.query.artistId || ARTIST_ID;
    
    // Fetch both artist data and top tracks in parallel
    const [artistData, topTracksData] = await Promise.all([
      getArtistData(artistId),
      getArtistTopTracks(artistId)
    ]);

    // Format the response
    const response = formatSpotifyResponse(artistData, topTracksData);

    // Update cache
    cachedArtistData = response;
    artistDataCacheTime = Date.now();

    res.json({
      success: true,
      message: 'Cache refreshed successfully',
      data: response
    });
  } catch (error) {
    // Log detailed error server-side
    console.error('Error refreshing cache:', error);
    
    // Return generic error message to client
    res.status(500).json({ 
      error: 'Failed to refresh cache',
      message: 'Unable to refresh artist data at this time. Please try again later.'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'spotify-backend' });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Spotify Backend API',
    endpoints: {
      '/api/spotify': 'Get artist data and top tracks',
      '/health': 'Health check'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Spotify backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Artist ID: ${ARTIST_ID}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
