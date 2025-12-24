# Stats API Setup Guide

This guide explains how to set up the backend API endpoints to fetch statistics for your website, Spotify, Apple Music, and TikTok accounts.

## Overview

The stats page requires backend API endpoints to fetch data securely. You **cannot** use API keys directly in the frontend JavaScript as this would expose your credentials publicly.

## Architecture

```
Frontend (stats.html + stats.js)
    ↓ fetch requests
Backend API (serverless functions or Node.js server)
    ↓ authenticated requests
Third-party APIs (Spotify, Apple Music, TikTok, Analytics)
```

## Setup Options

You have several options for hosting the backend API:

### Option 1: Vercel Serverless Functions (Recommended)

Vercel provides free serverless functions that work great with static sites.

**Requirements:**
- Node.js 18+ (for built-in fetch support)
- Vercel account (free tier available)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create API directory structure**
   ```
   /api
     /stats
       website.js
       spotify.js
       apple.js
       tiktok.js
   ```

3. **Create a Vercel function** (example: `/api/stats/spotify.js`):
   ```javascript
   // api/stats/spotify.js
   const fetch = require('node-fetch');

   module.exports = async (req, res) => {
     // Enable CORS
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET');
     
     try {
       // Get access token
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
       
       const tokenData = await tokenResponse.json();
       
       // Fetch artist data
       const artistId = process.env.SPOTIFY_ARTIST_ID;
       const artistResponse = await fetch(
         `https://api.spotify.com/v1/artists/${artistId}`,
         {
           headers: {
             'Authorization': `Bearer ${tokenData.access_token}`
           }
         }
       );
       
       const artistData = await artistResponse.json();
       
       // Note: Monthly listeners require Spotify for Artists API
       // This is a simplified example
       res.json({
         monthlyListeners: artistData.followers?.total || 0,
         totalPlays: 0, // Requires Spotify for Artists API
         saves: 0 // Requires Spotify for Artists API
       });
     } catch (error) {
       console.error('Spotify API error:', error);
       res.status(500).json({ error: 'Failed to fetch Spotify stats' });
     }
   };
   ```

4. **Set environment variables** in Vercel dashboard:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_ARTIST_ID`
   - (Similar for other services)

5. **Deploy**:
   ```bash
   vercel
   ```

### Option 2: Netlify Functions

Similar to Vercel, Netlify provides serverless functions.

1. **Create functions directory**:
   ```
   /netlify/functions
     spotify.js
     apple.js
     tiktok.js
     website.js
   ```

2. **Configure in netlify.toml**:
   ```toml
   [build]
     functions = "netlify/functions"
   ```

3. **Create function** (example: `netlify/functions/spotify.js`):
   ```javascript
   exports.handler = async (event, context) => {
     // Similar to Vercel function above
     // ...
     return {
       statusCode: 200,
       headers: {
         'Access-Control-Allow-Origin': '*',
       },
       body: JSON.stringify(data)
     };
   };
   ```

### Option 3: Custom Node.js Backend

If you prefer full control, deploy a Node.js Express server.

1. **Create server** (`server.js`):
   ```javascript
   const express = require('express');
   const cors = require('cors');
   require('dotenv').config();

   const app = express();
   app.use(cors());

   app.get('/api/stats/spotify', async (req, res) => {
     // Spotify API logic
   });

   app.get('/api/stats/apple', async (req, res) => {
     // Apple Music API logic
   });

   app.get('/api/stats/tiktok', async (req, res) => {
     // TikTok API logic
   });

   app.get('/api/stats/website', async (req, res) => {
     // Website analytics logic
   });

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

2. **Deploy** to services like:
   - Railway.app
   - Render.com
   - Heroku
   - DigitalOcean App Platform

## API Requirements & Documentation

### 1. Website Analytics

**Options:**
- **Google Analytics Data API**: Requires OAuth 2.0 or service account
  - Docs: https://developers.google.com/analytics/devguides/reporting/data/v1
- **Cloudflare Analytics**: If using Cloudflare
  - Docs: https://developers.cloudflare.com/analytics/graphql-api/
- **Plausible Analytics**: Privacy-friendly, has API
  - Docs: https://plausible.io/docs/stats-api

**Response format:**
```json
{
  "uniqueVisitors": 12345,
  "totalRequests": 56789,
  "dataCached": 1048576
}
```

### 2. Spotify

**API:** Spotify Web API + Spotify for Artists API

**Setup:**
1. Create app at https://developer.spotify.com/dashboard
2. Get Client ID and Client Secret
3. Find your Artist ID from your Spotify artist URL

**Important:** 
- Basic Web API gives followers, but NOT monthly listeners
- Monthly listeners, plays, and saves require **Spotify for Artists API** access
- Request access at: https://developer.spotify.com/documentation/web-api/concepts/spotify-for-artists

**Response format:**
```json
{
  "monthlyListeners": 12345,
  "totalPlays": 567890,
  "saves": 1234
}
```

**Docs:** https://developer.spotify.com/documentation/web-api/

### 3. Apple Music

**API:** Apple Music API (MusicKit)

**Setup:**
1. Join Apple Developer Program ($99/year)
2. Create MusicKit identifier
3. Generate private key and JWT tokens

**Important:**
- Apple Music for Artists stats require separate access
- Request access at: https://artists.apple.com/
- API provides catalog data, but artist analytics require Artists dashboard

**Response format:**
```json
{
  "plays": 12345,
  "listeners": 6789,
  "shazams": 234
}
```

**Docs:** 
- https://developer.apple.com/documentation/applemusicapi/
- https://developer.apple.com/documentation/musickit/

### 4. TikTok

**API:** TikTok Business API or TikTok Research API

**Setup:**
1. Apply for TikTok Developer access
2. Create app in TikTok Developer Portal
3. Request necessary permissions

**Important:**
- TikTok doesn't have a straightforward public API for creator stats
- Options:
  - **TikTok Business API**: For advertising data
  - **TikTok Login Kit**: Limited user data after OAuth
  - **Web scraping**: Against ToS, not recommended
  - **Manual entry**: Download CSV from TikTok Analytics and upload

**Alternative:** Consider using a service like:
- Pentos (https://www.pentos.co/)
- Social Blade API (https://socialblade.com/)

**Response format:**
```json
{
  "followers": 12345,
  "totalLikes": 67890,
  "videoViews": 234567
}
```

## Environment Variables

Create a `.env` file (never commit this!):

```env
# Spotify
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_ARTIST_ID=59X3431NBfd6xWMc3Zlh0v

# Apple Music
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY=your_private_key

# TikTok
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_USERNAME=indrolend

# Analytics (choose one)
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json
# OR
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ZONE_ID=your_zone_id
# OR
PLAUSIBLE_API_KEY=your_api_key
PLAUSIBLE_SITE_ID=your_domain
```

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use environment variables** for all secrets
3. **Add rate limiting** to prevent abuse
4. **Implement caching** to reduce API calls
   ```javascript
   // Example with node-cache
   const NodeCache = require('node-cache');
   const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

   app.get('/api/stats/spotify', async (req, res) => {
     const cached = cache.get('spotify');
     if (cached) return res.json(cached);
     
     const data = await fetchSpotifyData();
     cache.set('spotify', data);
     res.json(data);
   });
   ```
5. **Use HTTPS** for all API calls
6. **Set CORS properly** to only allow your domain

## Caching Strategy

To avoid hitting rate limits and reduce costs:

1. **Backend caching**: Cache API responses for 5-15 minutes
2. **Frontend caching**: LocalStorage with timestamp
3. **Database caching**: Store stats in a database, update periodically via cron job

## Testing

For development, create mock API endpoints that return dummy data:

```javascript
// api/stats/spotify.js (development mode)
module.exports = async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    return res.json({
      monthlyListeners: 12345,
      totalPlays: 567890,
      saves: 1234
    });
  }
  // Production code...
};
```

## Troubleshooting

### Issue: "API not configured" error
- Ensure your backend API is deployed and accessible
- Check that the endpoints in `stats.js` match your deployed URLs
- Verify CORS headers are set correctly

### Issue: Authentication errors
- Double-check environment variables are set
- Verify API credentials are valid
- Check if you have necessary permissions/access

### Issue: Rate limiting
- Implement caching as described above
- Use appropriate API quotas for your traffic
- Consider upgrading to paid API tiers if needed

## Next Steps

1. Choose a deployment platform (Vercel recommended)
2. Set up API credentials for each service
3. Implement the backend functions
4. Test with the frontend
5. Set up monitoring and error tracking
6. Configure auto-refresh intervals based on your API limits

## Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Apple Music API](https://developer.apple.com/documentation/applemusicapi/)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
