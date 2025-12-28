# Spotify Integration Deployment Guide

This guide will walk you through deploying your Spotify backend to Render (free tier) and connecting it to your website.

## Prerequisites

- A Spotify Developer account with Client ID and Client Secret
- A GitHub account (for Render deployment)
- Your website hosted somewhere (GitHub Pages, Netlify, etc.)

## Step 1: Get Spotify API Credentials

If you haven't already:

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the details:
   - **App name**: `Indrolend Website Integration`
   - **App description**: `Backend service for fetching live artist data`
   - **Website**: Your website URL
5. Accept the Terms of Service and click "Create"
6. Copy your **Client ID** (you'll need this in Step 3)
7. Click "Show Client Secret" and copy it (you'll need this in Step 3)

## Step 2: Deploy Backend to Render (Free Tier)

### Option A: Automatic Deployment with render.yaml

1. **Sign up for Render**
   - Go to https://render.com
   - Click "Get Started" and sign up (use GitHub for easiest integration)
   - Connect your GitHub account

2. **Create a New Web Service**
   - From Render dashboard, click "New +"
   - Select "Web Service"
   - Connect your GitHub repository: `indrolend/indrolend-website`
   - Render will detect the `render.yaml` file

3. **Configure Environment Variables**
   - Render will create the service based on render.yaml
   - Go to your service's dashboard
   - Click "Environment" in the left sidebar
   - Add these secret variables:
     - `SPOTIFY_CLIENT_ID`: [paste your Client ID from Step 1]
     - `SPOTIFY_CLIENT_SECRET`: [paste your Client Secret from Step 1]
   - The other variables are already set in render.yaml

4. **Deploy**
   - Render will automatically deploy your service
   - Wait for the deployment to complete (usually 2-3 minutes)
   - Once deployed, copy your service URL (e.g., `https://indrolend-spotify-backend.onrender.com`)

### Option B: Manual Deployment (if render.yaml doesn't work)

1. Follow steps 1-2 from Option A, but:
   - Instead of connecting repo, use "Manual Deploy"
   - Select "Node" as the environment
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`

2. Set environment variables manually (same as Option A, step 3)

3. Deploy manually from dashboard

## Step 3: Configure Your Website Frontend

Now that your backend is deployed, update your website to use it:

1. **Edit `spotify-integration.js`**
   
   Open `/spotify-integration.js` and find this line near the top (around line 9):
   ```javascript
   // Set your deployed backend URL here after deployment
   // Leave as empty string to use local development server
   const PRODUCTION_BACKEND_URL = ''; // Example: 'https://indrolend-spotify-backend.onrender.com'
   ```

2. **Add Your Backend URL**
   
   Replace the empty string with your Render service URL:
   ```javascript
   const PRODUCTION_BACKEND_URL = 'https://indrolend-spotify-backend.onrender.com'; // Your actual URL here
   ```

3. **Save and Deploy**
   
   - Save the file
   - Commit and push your changes to GitHub
   - Your website will automatically update (if using auto-deployment)

## Step 4: Test the Integration

1. **Wait for Backend to Wake Up**
   - Render free tier services sleep after 15 minutes of inactivity
   - The first request may take 30-60 seconds to "wake up" the service
   - Subsequent requests will be fast

2. **Open Your Website**
   - Navigate to your home page (home.html)
   - You should see the "Live from Spotify" section appear
   - It will show:
     - Your follower count
     - Popularity score (0-100)
     - Music genres
     - Your top 5 tracks with album art

3. **Check for Errors**
   - Open browser Developer Tools (F12)
   - Check the Console tab for any error messages
   - If you see errors, proceed to Troubleshooting section below

## Step 5: Testing Locally (Optional)

If you want to test everything locally first:

1. **Set up local environment**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file**
   Add your credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_ARTIST_ID=59X3431NBfd6xWMc3Zlh0v
   PORT=3000
   ```

3. **Install dependencies and start server**
   ```bash
   npm install
   npm start
   ```

4. **Test backend directly**
   Open browser and go to: http://localhost:3000/api/spotify
   You should see JSON data with your artist info

5. **Test frontend**
   - Open `home.html` in your browser
   - The Spotify integration will automatically use localhost
   - You should see your live stats appear

## Troubleshooting

### No Data Appears on Website

**Check 1: Backend is Running**
- Go to your Render dashboard
- Check if the service shows "Live" status
- Check the logs for any errors

**Check 2: Correct Backend URL**
- Verify you copied the correct URL from Render
- Make sure it starts with `https://` (not `http://`)
- Ensure there are no trailing slashes

**Check 3: CORS Issues**
- The backend already has CORS enabled for all origins
- If you still see CORS errors, check browser console

### Backend Errors

**"Invalid credentials" or "401 Unauthorized"**
- Check that your Client ID and Client Secret are correct
- Go to Spotify Dashboard and verify they haven't changed
- In Render, check Environment variables are set correctly

**Backend Won't Start**
- Check Render logs for error messages
- Verify build command completed successfully
- Ensure package.json dependencies are correct

### Slow Initial Load

This is normal for Render free tier:
- Services sleep after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Consider upgrading to paid tier for instant responses
- Or use alternative deployment: Railway, Heroku, etc.

### Rate Limiting

Spotify has generous API limits for this use case:
- The backend caches access tokens (reduces API calls)
- Frontend caches data for 5 minutes
- You're unlikely to hit rate limits with normal traffic

## Alternative Deployment Options

If Render doesn't work for you, try these alternatives:

### Railway (Free Tier Available)
1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set environment variables in Railway dashboard
5. Railway will auto-deploy

### Heroku (Paid - No Free Tier Anymore)
1. Install Heroku CLI
2. `heroku create indrolend-spotify-backend`
3. `heroku config:set SPOTIFY_CLIENT_ID=your_id`
4. `heroku config:set SPOTIFY_CLIENT_SECRET=your_secret`
5. `git subtree push --prefix backend heroku main`

### Vercel (Free Tier)
1. Install Vercel CLI: `npm i -g vercel`
2. `cd backend && vercel`
3. Set environment variables in Vercel dashboard
4. Note: Vercel works best with serverless functions, may need adjustments

## Security Reminders

✅ **DO:**
- Keep your `.env` file secret (already in .gitignore)
- Use HTTPS for your backend in production (Render provides this automatically)
- Regularly monitor your Spotify API usage
- Rotate credentials if you suspect they're compromised

❌ **DON'T:**
- Commit `.env` file to Git
- Share your Client Secret publicly
- Hardcode credentials in your code
- Expose backend API keys to frontend

## Maintenance

### Updating Artist Information
The artist ID is set to `59X3431NBfd6xWMc3Zlh0v` by default. To change:
- Update `SPOTIFY_ARTIST_ID` in Render environment variables
- Redeploy the service

### Monitoring Usage
- Check Spotify Developer Dashboard for API usage
- Monitor Render logs for any errors
- Check your website analytics to see engagement with Spotify section

### Keeping Backend Awake
Render free tier sleeps after 15 minutes. To keep it awake:
- Upgrade to Render paid tier ($7/month)
- Use a service like UptimeRobot to ping your backend every 10 minutes
- Accept the sleep behavior (most users won't notice)

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review backend/README.md for technical details
3. Check Render documentation: https://render.com/docs
4. Review Spotify API docs: https://developer.spotify.com/documentation/web-api

## Summary

You now have:
- ✅ Secure backend deployed on Render (free tier)
- ✅ OAuth 2.0 authentication with Spotify
- ✅ Live artist stats on your website
- ✅ Automatic data caching
- ✅ Beautiful, responsive design
- ✅ Error handling and loading states

Your website now dynamically displays:
- Real-time follower count
- Popularity score
- Music genres
- Top 5 tracks with album artwork

Congratulations! 🎉
