# Spotify Stats Feature

This feature displays real-time Spotify artist statistics including follower count and popularity rating.

## Files Added

- `stats.html` - The stats page displaying artist information
- `spotify-stats.js` - JavaScript file that fetches data from Spotify Web API
- Updated `home.html` - Added navigation link to stats page
- Updated `style.css` - Added styling for the stats page

## Setup Instructions

### Getting a Spotify Access Token

To fetch data from Spotify's Web API, you need an access token:

1. **Quick Method (for testing - token expires after 1 hour):**
   - Go to [Spotify Web Console](https://developer.spotify.com/console/get-artist/)
   - Click the "Get Token" button
   - Log in with your Spotify account
   - Copy the generated access token
   - Open `spotify-stats.js` and replace `YOUR_SPOTIFY_ACCESS_TOKEN_HERE` with your token

2. **Production Method (recommended):**
   - Set up a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Implement OAuth 2.0 Client Credentials Flow on a backend server
   - Store credentials securely (never commit tokens to git)
   - Fetch and refresh tokens automatically

## Artist Information

The page displays stats for artist: **Indrolend**
- Spotify Artist ID: `59X3431NBfd6xWMc3Zlh0v`
- Profile: [Indrolend on Spotify](https://open.spotify.com/artist/59X3431NBfd6xWMc3Zlh0v)

## Features

- **Artist Name** - Display the artist's name from Spotify
- **Followers** - Total number of followers (formatted with commas)
- **Popularity** - Spotify popularity score (0-100)
- **Visual Effects** - Animated text effects matching the website's design
- **Error Handling** - Graceful error messages if API fails

## Technical Details

### API Endpoint
```
GET https://api.spotify.com/v1/artists/59X3431NBfd6xWMc3Zlh0v
```

### Response Format
```json
{
  "name": "Indrolend",
  "followers": {
    "total": 12345
  },
  "popularity": 42
}
```

### Styling
The stats page uses the same design system as other pages:
- Terminal green color scheme (`#6dd9e8`)
- EB Garamond font with weight variations
- Animated text effects with wavy motion
- Responsive design for mobile devices

## Future Improvements

- Implement automatic token refresh
- Add more artist stats (genres, top tracks, etc.)
- Cache data to reduce API calls
- Add loading animations
- Implement server-side proxy to hide API credentials
