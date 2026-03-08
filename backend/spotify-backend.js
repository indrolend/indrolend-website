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

// GitHub credentials for leaderboard persistence
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'indrolend';
const GITHUB_REPO = process.env.GITHUB_REPO || 'indrolend-website';
const LEADERBOARD_FILE_PATH = 'data/leaderboard.json';
const LEADERBOARD_COMMITTER_NAME = process.env.LEADERBOARD_COMMITTER_NAME || 'indrolend-backend';
const LEADERBOARD_COMMITTER_EMAIL = process.env.LEADERBOARD_COMMITTER_EMAIL || 'noreply@indrolend.com';
const MAX_LEADERBOARD_SIZE = 10;
const MAX_SCORE = 10000;

// Cache for access token
let accessToken = null;
let tokenExpirationTime = null;

// Cache for artist data (24-hour cache)
let cachedArtistData = null;
let artistDataCacheTime = null;
const ARTIST_DATA_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache for leaderboard (30-second TTL so updates are visible quickly)
let leaderboardCache = null;
let leaderboardCacheTime = null;
const LEADERBOARD_CACHE_DURATION = 30 * 1000;

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
      error: 'Unable to retrieve artist information at this time. Please try again later.'
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
      error: 'Unable to refresh artist data at this time. Please try again later.'
    });
  }
});

// ─── Leaderboard helpers (GitHub API persistence) ───────────────────────────

/**
 * Fetch the leaderboard array from GitHub and return it along with the file SHA
 * required for subsequent writes.
 */
async function getLeaderboardFromGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${LEADERBOARD_FILE_PATH}`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'indrolend-backend'
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    if (response.status === 404) return { data: [], sha: null };
    throw new Error(`GitHub API read error: ${response.status}`);
  }

  const fileData = await response.json();
  const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
  let data;
  try {
    data = JSON.parse(content);
  } catch {
    data = [];
  }
  return { data: Array.isArray(data) ? data : [], sha: fileData.sha };
}

/**
 * Write the leaderboard array back to GitHub.
 * `sha` is required when updating an existing file.
 */
async function saveLeaderboardToGitHub(leaderboard, sha) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not configured – cannot persist leaderboard');
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${LEADERBOARD_FILE_PATH}`;
  const content = Buffer.from(JSON.stringify(leaderboard, null, 2) + '\n').toString('base64');
  const body = {
    message: 'chore: update snake leaderboard [skip ci]',
    content,
    committer: {
      name: LEADERBOARD_COMMITTER_NAME,
      email: LEADERBOARD_COMMITTER_EMAIL
    }
  };
  if (sha) body.sha = sha;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'indrolend-backend'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API write error: ${response.status} ${errorText}`);
  }
  return await response.json();
}

// ─── Leaderboard endpoints ───────────────────────────────────────────────────

/**
 * GET /api/leaderboard
 * Returns the current global top-10 leaderboard.
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (leaderboardCache && leaderboardCacheTime && (Date.now() - leaderboardCacheTime < LEADERBOARD_CACHE_DURATION)) {
      return res.json(leaderboardCache);
    }

    const { data } = await getLeaderboardFromGitHub();
    leaderboardCache = data;
    leaderboardCacheTime = Date.now();
    res.json(data);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Unable to retrieve leaderboard at this time.' });
  }
});

/**
 * POST /api/leaderboard
 * Adds a new entry to the global leaderboard (top 10).
 * Body: { name: string, message: string, score: number }
 */
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { name, message, score } = req.body || {};

    // Basic validation
    if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > MAX_SCORE) {
      return res.status(400).json({ error: 'Invalid score value.' });
    }

    const sanitizedName = String(name || '').trim().substring(0, 20) || 'Anonymous';
    const sanitizedMessage = String(message || '').trim().substring(0, 30) || 'No message';

    // Fetch current leaderboard (bypassing cache for writes)
    const { data: leaderboard, sha } = await getLeaderboardFromGitHub();

    // Check if the score qualifies for the leaderboard
    const qualifies = leaderboard.length < MAX_LEADERBOARD_SIZE || score > leaderboard[leaderboard.length - 1].score;
    if (!qualifies) {
      return res.status(200).json({ qualified: false, leaderboard });
    }

    // Add entry, sort, trim to max size
    leaderboard.push({
      name: sanitizedName,
      message: sanitizedMessage,
      score,
      date: new Date().toISOString()
    });
    leaderboard.sort((a, b) => b.score - a.score);
    const updated = leaderboard.slice(0, MAX_LEADERBOARD_SIZE);

    // Persist to GitHub
    await saveLeaderboardToGitHub(updated, sha);

    // Update cache immediately
    leaderboardCache = updated;
    leaderboardCacheTime = Date.now();

    res.json({ qualified: true, leaderboard: updated });
  } catch (error) {
    console.error('Error saving leaderboard entry:', error);
    res.status(500).json({ error: 'Unable to save leaderboard entry at this time.' });
  }
});

// ─── Health / root endpoints ─────────────────────────────────────────────────

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
      '/api/leaderboard': 'GET/POST snake game leaderboard',
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
