# Indrolend Website

Personal website for the artist Indrolend featuring music links, image gallery, interactive games, and real-time statistics.

## Features

- 🎵 Music platform links (Spotify, Apple Music, TikTok, etc.)
- 🖼️ Interactive image gallery
- 🎮 Mini games and interactive experiences
- 📊 Real-time statistics dashboard
- ✨ Animated UI with particle effects
- 📱 Fully responsive design

## Stats Dashboard

The stats page displays real-time analytics from multiple sources:

- **Website Analytics**: Unique visitors, total requests, data cached
- **Spotify**: Monthly listeners, total plays, saves
- **Apple Music**: Plays, listeners, Shazams
- **TikTok**: Followers, total likes, video views

### Quick Start for Stats

1. **No Backend Setup (Demo Mode)**
   - The stats page will show placeholder data
   - Perfect for testing the UI

2. **With Backend Setup**
   - See [STATS_SETUP.md](STATS_SETUP.md) for detailed instructions
   - Deploy serverless functions to Vercel or Netlify
   - Configure API credentials as environment variables

### Deployment Options

#### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# See .env.example for required variables
```

#### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Set environment variables in Netlify dashboard
```

#### Option C: GitHub Pages (Static Only)

The website works on GitHub Pages, but stats will show demo data since GitHub Pages doesn't support serverless functions. Use Vercel or Netlify for full functionality.

## Development

### Local Development

```bash
# Serve the website locally
python3 -m http.server 8080

# Or use Node.js http-server
npx http-server -p 8080

# Visit http://localhost:8080/home.html
```

### Project Structure

```
.
├── home.html          # Main landing page
├── stats.html         # Statistics dashboard
├── gallery.html       # Image gallery
├── style.css          # All styles
├── script.js          # Frontend JavaScript
├── stats.js           # Stats page JavaScript
├── api/               # Backend API functions
│   └── stats/
│       ├── spotify.js
│       ├── apple.js
│       ├── tiktok.js
│       └── website.js
├── STATS_SETUP.md     # Detailed stats setup guide
└── README.md          # This file
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

See [STATS_SETUP.md](STATS_SETUP.md) for how to obtain API credentials.

### Security

- ✅ API keys are stored as environment variables (never in code)
- ✅ Backend functions handle all authenticated API calls
- ✅ CORS configured for security
- ✅ Rate limiting recommended for production
- ✅ Caching implemented to reduce API calls

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Particle effects optimized with requestAnimationFrame
- Stats caching (5-minute intervals)
- Lazy loading for images
- Minimal dependencies

## Credits

Design and development by Indrolend

## License

All rights reserved. This is a personal website.

## Support

For questions about setup, see [STATS_SETUP.md](STATS_SETUP.md) or open an issue.
