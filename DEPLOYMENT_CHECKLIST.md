# ✅ Deployment Checklist

Use this checklist to deploy your Spotify integration step by step.

---

## Pre-Deployment Checklist

- [ ] Read through QUICKSTART.md to understand the process
- [ ] Have a Spotify account ready (free is fine)
- [ ] Have access to your GitHub repository
- [ ] Have a few minutes to complete the setup

---

## Part 1: Get Spotify API Credentials

- [ ] Go to https://developer.spotify.com/dashboard
- [ ] Log in with your Spotify account
- [ ] Click "Create an App"
- [ ] Fill in app details:
  - [ ] Name: `Indrolend Website Integration`
  - [ ] Description: `Backend service for live artist data`
  - [ ] Website: (your website URL)
- [ ] Accept Terms of Service
- [ ] Click "Create"
- [ ] Copy and save your **Client ID** somewhere safe
- [ ] Click "Show Client Secret"
- [ ] Copy and save your **Client Secret** somewhere safe

**✅ You now have your API credentials!**

---

## Part 2: Deploy Backend to Render

- [ ] Go to https://render.com
- [ ] Sign up or log in (use GitHub for easiest setup)
- [ ] Click "New +" → "Web Service"
- [ ] Click "Build and deploy from a Git repository"
- [ ] Connect your GitHub account (if not already)
- [ ] Select repository: `indrolend/indrolend-website`
- [ ] Render detects `render.yaml` - click "Apply"
- [ ] Add environment variables:
  - [ ] `SPOTIFY_CLIENT_ID` = (paste your Client ID)
  - [ ] `SPOTIFY_CLIENT_SECRET` = (paste your Client Secret)
- [ ] Click "Create Web Service"
- [ ] Wait 2-3 minutes for deployment to complete
- [ ] Copy your service URL (e.g., `https://indrolend-spotify-backend.onrender.com`)

**✅ Your backend is now live!**

---

## Part 3: Update Frontend Configuration

- [ ] Open `spotify-integration.js` in your code editor
- [ ] Find line 9: `const PRODUCTION_BACKEND_URL = '';`
- [ ] Update it with your Render URL:
  ```javascript
  const PRODUCTION_BACKEND_URL = 'https://indrolend-spotify-backend.onrender.com';
  ```
- [ ] Save the file
- [ ] Commit the change:
  ```bash
  git add spotify-integration.js
  git commit -m "Add production backend URL for Spotify integration"
  git push
  ```

**✅ Your website is now configured!**

---

## Part 4: Test & Verify

- [ ] Wait 1-2 minutes for your website to update (if auto-deployed)
- [ ] Visit your website's home page
- [ ] Look for the "Live from Spotify" section
- [ ] Verify you see:
  - [ ] Follower count
  - [ ] Popularity score
  - [ ] Music genres (if any)
  - [ ] Top 5 tracks with album artwork
- [ ] Test on mobile device (should be responsive)
- [ ] Check browser console for errors (F12)

**Note:** First load may take 30-60 seconds as Render free tier "wakes up"

**✅ Your Spotify integration is live!**

---

## Troubleshooting (if needed)

### If data doesn't load:

- [ ] Check Render dashboard - is service running? (green status)
- [ ] Verify environment variables in Render:
  - [ ] `SPOTIFY_CLIENT_ID` is set correctly
  - [ ] `SPOTIFY_CLIENT_SECRET` is set correctly
- [ ] Check `spotify-integration.js`:
  - [ ] `PRODUCTION_BACKEND_URL` matches your Render service URL exactly
  - [ ] URL starts with `https://` (not `http://`)
  - [ ] No trailing slash at the end
- [ ] Open browser console (F12):
  - [ ] Look for error messages
  - [ ] Check Network tab for failed requests
- [ ] Test backend directly:
  - [ ] Visit `https://your-backend-url.onrender.com/health`
  - [ ] Should see: `{"status":"ok","service":"spotify-backend"}`

### If backend is slow:

- [ ] This is normal for Render free tier
- [ ] Services sleep after 15 minutes of inactivity
- [ ] First request takes 30-60 seconds to wake up
- [ ] Subsequent requests are fast
- [ ] Options:
  - [ ] Accept the delay (most users won't notice)
  - [ ] Upgrade to Render paid tier ($7/month)
  - [ ] Use UptimeRobot to ping every 10 minutes (keeps awake)

### If credentials don't work:

- [ ] Go to Spotify Developer Dashboard
- [ ] Verify Client ID and Secret are correct
- [ ] Make sure you didn't copy any extra spaces
- [ ] Try regenerating credentials if needed
- [ ] Update Render environment variables with new credentials

---

## Post-Deployment Tasks

### Optional but Recommended:

- [ ] Set up monitoring:
  - [ ] Check Spotify Developer Dashboard for API usage
  - [ ] Monitor Render service logs for errors
  - [ ] Watch your website analytics
- [ ] Bookmark important URLs:
  - [ ] Spotify Developer Dashboard
  - [ ] Render Dashboard
  - [ ] Your backend health check URL
- [ ] Share your website:
  - [ ] Show off your live stats to fans!
  - [ ] Monitor follower growth
  - [ ] Watch which tracks are most popular

### Keep Backend Awake (Optional):

If you want to eliminate the 30s wake-up delay:

**Option 1: Upgrade to Render Paid Tier**
- [ ] Go to Render Dashboard
- [ ] Upgrade to $7/month plan
- [ ] Backend stays awake 24/7

**Option 2: Use UptimeRobot (Free)**
- [ ] Sign up at https://uptimerobot.com
- [ ] Create new monitor
- [ ] Type: HTTP(s)
- [ ] URL: `https://your-backend-url.onrender.com/health`
- [ ] Interval: 5 minutes
- [ ] Backend will stay awake

---

## Success! 🎉

You now have:

- ✅ Secure backend with OAuth 2.0
- ✅ Live Spotify stats on your website
- ✅ Real-time follower count
- ✅ Top tracks display
- ✅ Mobile-responsive design
- ✅ Automatic updates every 5 minutes

**Total cost: $0/month** (using free tiers)

**Total time: ~10 minutes**

---

## Need Help?

See these guides:

- **Quick overview**: QUICKSTART.md
- **Detailed guide**: DEPLOYMENT_GUIDE.md
- **Technical docs**: backend/README.md
- **Testing locally**: Use `test-spotify.html`

---

## Next Steps

Now that it's working:

1. **Monitor your stats** - Watch those follower numbers grow!
2. **Customize if needed** - Edit `spotify-styles.css` for different colors
3. **Share with fans** - Let people know about your live stats
4. **Keep creating** - Focus on your music, the tech is handled!

Enjoy! 🎵✨
