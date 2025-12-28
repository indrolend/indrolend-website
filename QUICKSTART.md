# 🚀 Quick Start Guide - Spotify Integration

This guide gets your Spotify integration up and running in **under 10 minutes**.

## What You're Getting

✨ Your website will display:
- **Live follower count** from Spotify
- **Popularity score** (0-100)
- **Music genres**
- **Top 5 tracks** with album artwork
- **Auto-updating data** (cached for 5 minutes)

## Prerequisites

- [ ] Spotify account (free is fine)
- [ ] GitHub account
- [ ] 10 minutes of time

---

## Step 1: Get Spotify Credentials (3 minutes)

1. Go to https://developer.spotify.com/dashboard
2. Log in with Spotify
3. Click **"Create an App"**
4. Fill in:
   - Name: `Indrolend Website`
   - Description: `Live stats for my website`
5. Click **"Create"**
6. Copy your **Client ID** (save it somewhere)
7. Click **"Show Client Secret"** and copy it (save it too)

✅ **Done!** You now have your API credentials.

---

## Step 2: Deploy Backend to Render (5 minutes)

1. Go to https://render.com
2. Sign up using your **GitHub account**
3. Click **"New +"** → **"Web Service"**
4. Select **"Build and deploy from a Git repository"**
5. Click **"Connect account"** and authorize GitHub
6. Find and select your repository: `indrolend/indrolend-website`
7. Render will detect `render.yaml` - click **"Apply"**
8. In the **Environment** section, add:
   - `SPOTIFY_CLIENT_ID` = [your Client ID from Step 1]
   - `SPOTIFY_CLIENT_SECRET` = [your Client Secret from Step 1]
9. Click **"Create Web Service"**
10. Wait 2-3 minutes for deployment to complete
11. **Copy your service URL** (looks like: `https://indrolend-spotify-backend.onrender.com`)

✅ **Done!** Your backend is live.

---

## Step 3: Update Your Website (2 minutes)

1. Open your repository in your code editor
2. Edit `spotify-integration.js`
3. Find this line (around line 9):
   ```javascript
   const PRODUCTION_BACKEND_URL = '';
   ```
4. Update it with your Render URL:
   ```javascript
   const PRODUCTION_BACKEND_URL = 'https://indrolend-spotify-backend.onrender.com';
   ```
5. Save the file
6. Commit and push to GitHub:
   ```bash
   git add spotify-integration.js
   git commit -m "Add production backend URL"
   git push
   ```

✅ **Done!** Your website is configured.

---

## Step 4: Test It! (1 minute)

1. Visit your website's home page
2. Look for the **"Live from Spotify"** section
3. You should see:
   - Your follower count
   - Popularity score
   - Genres
   - Top 5 tracks

**Note:** First load may take 30-60 seconds as Render free tier "wakes up" the server.

✅ **Done!** You're live! 🎉

---

## Troubleshooting

### "Unable to load Spotify data"

**Check 1:** Is your backend running?
- Go to your Render dashboard
- Check service status (should be green/live)

**Check 2:** Are credentials correct?
- Go to Render → Environment variables
- Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`

**Check 3:** Is the URL correct?
- Check `spotify-integration.js`
- URL should match your Render service URL exactly
- Should start with `https://` (not `http://`)

### Backend is slow to load

This is normal for Render free tier:
- Services "sleep" after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast
- **Solution:** Upgrade to paid tier ($7/month) or accept the delay

### Want to test locally first?

```bash
cd backend
cp .env.example .env
# Edit .env and add your credentials
npm install
npm start
```

Then open `test-spotify.html` in your browser.

---

## What's Next?

Your integration is complete! Here are some ideas:

### Monitor Your Stats
- Check your Spotify Developer dashboard for API usage
- Watch your follower count grow!
- See which tracks are most popular

### Customize the Display
- Edit `spotify-styles.css` to change colors/layout
- Modify `spotify-integration.js` to show different data
- Add your own features

### Keep Backend Awake
Render free tier sleeps after 15 minutes. Options:
1. **Upgrade to paid tier** ($7/month) - always awake
2. **Use UptimeRobot** - free service that pings your backend every 5 minutes
3. **Accept it** - most visitors won't notice the 30s wake-up time

---

## Files Changed

You only modified one file:
- ✅ `spotify-integration.js` - Added production backend URL

Everything else was already set up:
- ✅ `backend/spotify-backend.js` - Backend server (already complete)
- ✅ `spotify-styles.css` - Styling (already complete)
- ✅ `home.html` - Display section (already complete)
- ✅ `render.yaml` - Deployment config (already complete)

---

## Support

Need help?
- **Full guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Technical docs:** [backend/README.md](backend/README.md)
- **Integration overview:** [SPOTIFY_INTEGRATION.md](SPOTIFY_INTEGRATION.md)

---

## Summary

🎉 **Congratulations!** You now have:
- ✅ Secure backend with OAuth 2.0
- ✅ Live Spotify stats on your website
- ✅ Professional-looking display
- ✅ Automatic updates every 5 minutes
- ✅ Mobile-responsive design

**Total time:** ~10 minutes
**Cost:** $0 (Render free tier)
**Difficulty:** Easy - just copy/paste

Enjoy your live Spotify stats! 🎵
