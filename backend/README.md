# Spotify Backend API

This is a Node.js backend service that securely fetches live Spotify artist data using OAuth 2.0 Client Credentials Flow.

## Features

- Secure OAuth 2.0 authentication with Spotify API
- Fetches artist information (followers, popularity, genres)
- Retrieves top tracks for the artist
- Token caching to minimize API calls
- CORS enabled for frontend integration
- Error handling and logging

## Prerequisites

- Node.js (v18 or higher recommended)
- Spotify Developer Account
- Spotify Client ID and Client Secret

## Setup Instructions

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app details:
   - App name: "Indrolend Website Integration" (or any name)
   - App description: "Backend service for fetching live artist data"
5. Accept the Terms of Service
6. Click "Create"
7. On your app's page, you'll see your **Client ID**
8. Click "Show Client Secret" to reveal your **Client Secret**

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your credentials:
   ```
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
   SPOTIFY_ARTIST_ID=59X3431NBfd6xWMc3Zlh0v
   PORT=3000
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET /api/spotify

Fetches artist data and top tracks.

**Query Parameters:**
- `artistId` (optional) - Spotify artist ID. Defaults to the ID in environment variables.

**Example Request:**
```bash
curl http://localhost:3000/api/spotify
```

**Example Response:**
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
  "topTracks": [
    {
      "name": "Track Name",
      "album": "Album Name",
      "albumImage": "https://...",
      "previewUrl": "https://...",
      "spotifyUrl": "https://...",
      "duration": 180000,
      "popularity": 75
    },
    ...
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "spotify-backend"
}
```

## Deployment

### Environment Variables for Production

Make sure to set these environment variables in your hosting platform:

- `SPOTIFY_CLIENT_ID` - Your Spotify Client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify Client Secret (keep this secret!)
- `SPOTIFY_ARTIST_ID` - The Spotify artist ID to fetch data for
- `PORT` - Port number (usually set by the hosting platform)
- `NODE_ENV` - Set to "production"

### Frontend Configuration

Update the `SPOTIFY_API_BASE` constant in `spotify-integration.js` to point to your deployed backend URL:

```javascript
const SPOTIFY_API_BASE = 'https://your-backend-url.com';
```

## Security Notes

- **Never commit your `.env` file** - It's already in `.gitignore`
- The Client Secret is only used server-side and never exposed to the frontend
- Use HTTPS in production to encrypt data in transit
- Consider implementing rate limiting for production use
- The access token is cached to minimize API calls

## Troubleshooting

### Error: "Spotify credentials not configured"

Make sure you have created a `.env` file with your `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.

### Error: "Failed to get access token"

Check that:
1. Your Client ID and Client Secret are correct
2. You haven't exceeded Spotify API rate limits
3. Your internet connection is working

### CORS Issues

If you're getting CORS errors, make sure:
1. The backend server is running
2. The `SPOTIFY_API_BASE` URL in the frontend matches your backend URL
3. CORS is properly configured in `spotify-backend.js`

## License

ISC
