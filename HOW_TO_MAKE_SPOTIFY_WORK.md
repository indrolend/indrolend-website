# How to Make Spotify Stats Work - Step by Step Guide

## Quick Start (5 minutes)

Follow these steps to get your Spotify stats page working:

### Step 1: Get a Spotify Access Token

1. **Open the Spotify Web API Console:**
   - Go to: https://developer.spotify.com/console/get-artist/

2. **Enter the Artist ID:**
   - In the "Artist ID" field, enter: `59X3431NBfd6xWMc3Zlh0v`
   - This is Indrolend's artist ID

3. **Get Token:**
   - Click the green "GET TOKEN" button (top right)
   - A popup will appear asking you to log in with Spotify
   - Log in with your Spotify account (free or premium)
   - Click "Agree" to grant permissions

4. **Copy the Token:**
   - After logging in, you'll see a token appear in the "OAuth Token" field
   - It will look like a long string: `BQC...` (starts with BQC or BQA)
   - Click the token to select it, then copy it (Ctrl+C or Cmd+C)

### Step 2: Add Token to Your Code

1. **Open the `spotify-stats.js` file** in your code editor

2. **Find line 34** which looks like this:
   ```javascript
   const ACCESS_TOKEN = "YOUR_SPOTIFY_ACCESS_TOKEN_HERE";
   ```

3. **Replace the placeholder** with your actual token:
   ```javascript
   const ACCESS_TOKEN = "BQCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
   ```
   (paste your actual token between the quotes)

4. **Save the file** (Ctrl+S or Cmd+S)

### Step 3: Test It

1. **Open `stats.html` in your browser:**
   - If using a local server: `http://localhost:8080/stats.html`
   - Or open the file directly: `file:///path/to/stats.html`

2. **You should now see:**
   - Artist Name: "Indrolend" (or the actual artist name)
   - Followers: A number with commas (e.g., "1,234")
   - Popularity: A score out of 100 (e.g., "45/100")

### Step 4: If You See "Error loading"

**Common Issues:**

1. **Token not pasted correctly:**
   - Make sure you pasted the entire token between the quotes
   - Don't include extra spaces or line breaks
   - The quotes should still be there: `"your-token-here"`

2. **Token expired:**
   - Spotify tokens expire after 1 hour
   - Get a new token by repeating Step 1

3. **CORS issues (if testing locally):**
   - You need to run a local web server, not just open the HTML file
   - Use: `python3 -m http.server 8080` in your project directory
   - Then visit: `http://localhost:8080/stats.html`

4. **Network/Browser blocking:**
   - Check your browser console (F12 → Console tab)
   - Look for any error messages
   - Some ad blockers might block Spotify API calls

## Working Example

Here's what a correctly configured `spotify-stats.js` looks like (lines 33-35):

```javascript
// BEFORE (won't work):
const ACCESS_TOKEN = "YOUR_SPOTIFY_ACCESS_TOKEN_HERE";

// AFTER (will work):
const ACCESS_TOKEN = "BQDxK8h5F9G_J1l2M3n4P5Q6R7S8T9u0V1W2X3Y4z5";
```

## Testing the API Directly

Want to verify the API works? Try this in your browser:

1. Get your token from Step 1 above
2. Open this URL in a new tab: https://developer.spotify.com/console/get-artist/
3. Enter Artist ID: `59X3431NBfd6xWMc3Zlh0v`
4. Click "GET TOKEN" and then click "TRY IT"
5. You should see JSON data with the artist info

## Need Help?

**The token is working if you see something like this in the response:**
```json
{
  "name": "Indrolend",
  "followers": {
    "total": 1234
  },
  "popularity": 45
}
```

**If you see this error, your token is invalid or expired:**
```json
{
  "error": {
    "status": 401,
    "message": "Invalid access token"
  }
}
```

## Important Notes

⚠️ **Token Expiration:**
- Tokens expire after 1 hour
- You'll need to get a new token each time it expires
- For a permanent solution, see the "Production Setup" section in `SPOTIFY_STATS_README.md`

🔒 **Security:**
- Don't commit your token to Git
- The token is visible in your source code (client-side)
- This is OK for personal projects with public data
- For production sites, use a backend server

## Production Setup (Advanced)

For a production website that doesn't require manual token updates:

1. Create a Spotify App at: https://developer.spotify.com/dashboard
2. Get your Client ID and Client Secret
3. Set up a backend server (Node.js, Python, etc.)
4. Implement Client Credentials Flow
5. Your backend fetches and refreshes tokens automatically
6. Your frontend calls your backend instead of Spotify directly

See `SPOTIFY_STATS_README.md` for more details on production setup.
