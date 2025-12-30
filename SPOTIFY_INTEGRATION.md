# Spotify Integration Setup Guide

This guide will help you integrate live Spotify artist data into your Indrolend website.

## Overview

The integration consists of three main components:

1. **Backend Server** (`backend/spotify-backend.js`) - Securely handles Spotify API authentication and data fetching
2. **Frontend JavaScript** (`spotify-integration.js`) - Fetches data from the backend and displays it on the page
3. **Styling** (`spotify-styles.css`) - Styles for the Spotify data display

## Quick Start

### Step 1: Set Up Spotify Developer Account

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the details:
   - App name: "Indrolend Website Integration"
   - App description: "Backend service for fetching live artist data"
   - Website: Your website URL
5. Accept the Terms of Service and click "Create"
6. Copy your **Client ID** and **Client Secret** (click "Show Client Secret")

### Step 2: Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
   SPOTIFY_ARTIST_ID=59X3431NBfd6xWMc3Zlh0v
   PORT=3000
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Step 3: Update Frontend Configuration

Edit `spotify-integration.js` and update the `SPOTIFY_API_BASE` constant to match your backend URL:

```javascript
// For local development
const SPOTIFY_API_BASE = 'http://localhost:3000';

// For production (update with your deployed backend URL)
// const SPOTIFY_API_BASE = 'https://your-backend-url.com';
```

### Step 4: Test the Integration

1. Make sure the backend server is running
2. Open `home.html` in your browser
3. You should see live Spotify data including:
   - Total followers
   - Popularity score
   - Music genres
   - Top 5 tracks with album art

## Deployment

### Backend Deployment Options

You can deploy the backend to various platforms:

#### Option 1: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. In the backend directory: `vercel`
3. Set environment variables in Vercel dashboard

#### Option 2: Heroku
1. Create a Heroku app
2. Set environment variables:
   ```bash
   heroku config:set SPOTIFY_CLIENT_ID=your_id
   heroku config:set SPOTIFY_CLIENT_SECRET=your_secret
   ```
3. Deploy: `git push heroku main`

#### Option 3: Railway
1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically

#### Option 4: Render
1. Create a new Web Service
2. Connect your repository
3. Set environment variables
4. Deploy

### Frontend Updates After Deployment

After deploying the backend, update `spotify-integration.js`:

```javascript
const SPOTIFY_API_BASE = 'https://your-deployed-backend-url.com';
```

Then commit and push your changes.

## Features

### Current Features
- ✅ Secure OAuth 2.0 authentication
- ✅ Real-time artist follower count
- ✅ Popularity score (0-100)
- ✅ Music genres
- ✅ Top 5 tracks with album art
- ✅ Track durations
- ✅ Track popularity scores (0-100, based on recent plays)
- ✅ Loading states
- ✅ Error handling
- ✅ Data caching (5 minutes)
- ✅ Responsive design
- ✅ Matches website's aesthetic

**Note on Popularity vs Stream Counts:** The Spotify Web API does not provide actual stream counts or play counts for tracks. Instead, we display the "popularity" score (0-100) for each track, which is calculated by Spotify based on recent plays and is the closest available metric to represent a track's performance.

### Potential Enhancements
- Add recently played tracks
- Show currently playing track (requires user authentication)
- Display monthly listener count (requires artist access)
- Add play buttons with preview clips
- Show upcoming concerts/events

## File Structure

```
/
├── home.html                 # Updated with Spotify data placeholder
├── spotify-integration.js    # Frontend JavaScript module
├── spotify-styles.css        # Styling for Spotify components
├── script.js                 # Updated to initialize Spotify data
└── backend/
    ├── package.json          # Node.js dependencies
    ├── spotify-backend.js    # Backend server with OAuth
    ├── .env.example          # Environment variables template
    ├── .env                  # Your actual credentials (NOT in git)
    └── README.md             # Backend documentation
```

## Security Best Practices

1. **Never commit the `.env` file** - It contains your secret credentials
2. **Use HTTPS in production** - Encrypts data in transit
3. **Keep Client Secret server-side** - Never expose it to the frontend
4. **Rotate credentials periodically** - Update them in Spotify dashboard
5. **Use environment variables** - Don't hardcode secrets in code
6. **Monitor API usage** - Check Spotify dashboard for unusual activity

## Troubleshooting

### Backend Won't Start
- Check that `.env` file exists and has correct credentials
- Ensure port 3000 is not already in use
- Run `npm install` to ensure dependencies are installed

### No Data Shows on Frontend
- Verify backend server is running
- Check browser console for error messages
- Ensure `SPOTIFY_API_BASE` URL is correct
- Check that CORS is enabled in backend

### "Invalid credentials" Error
- Verify Client ID and Secret are correct
- Check that credentials haven't been regenerated in Spotify Dashboard
- Ensure no extra spaces in `.env` file values

### Rate Limiting Issues
- Spotify API has rate limits (typically generous for this use case)
- The backend caches tokens to minimize API calls
- Frontend caches data for 5 minutes
- Monitor your usage in Spotify Dashboard

## API Endpoint Reference

### GET /api/spotify

Returns artist data and top tracks.

**Query Parameters:**
- `artistId` (optional) - Override the default artist ID

**Response:**
```json
{
  "artist": {
    "name": "Indrolend",
    "followers": 1234,
    "popularity": 45,
    "genres": ["indie", "electronic"],
    "images": [...],
    "spotifyUrl": "https://open.spotify.com/artist/..."
  },
  "topTracks": [...]
}
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend/README.md for detailed backend documentation
3. Consult Spotify API documentation: https://developer.spotify.com/documentation/web-api

## License

ISC
