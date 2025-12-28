# Indrolend Website

Personal website for Indrolend featuring social media links, image gallery, game engine, and live Spotify artist statistics.

## Features

- 🎵 **Live Spotify Integration** - Real-time artist stats, follower count, and top tracks
- 🖼️ **Image Gallery** - Personal photo collection
- 🎮 **Asymptote Engine** - Custom game engine
- 🔗 **Social Media Hub** - Links to all platforms (Spotify, Instagram, TikTok, YouTube, etc.)
- ✨ **Interactive UI** - Particle background effects and animated elements

## Project Structure

```
indrolend-website/
├── home.html                   # Main homepage
├── gallery.html                # Image gallery page
├── index.html                  # Landing page
├── script.js                   # Main JavaScript for UI effects
├── style.css                   # Main stylesheet
├── spotify-integration.js      # Frontend Spotify integration
├── spotify-styles.css          # Spotify component styles
├── asymptote/                  # Game engine
│   └── ...
├── backend/                    # Spotify backend API
│   ├── spotify-backend.js      # Node.js server
│   ├── package.json            # Backend dependencies
│   ├── .env.example            # Environment variables template
│   ├── test-backend.sh         # Local testing script
│   └── README.md               # Backend documentation
└── images/                     # Image assets
```

## Quick Start

### For Development

1. Clone the repository:
   ```bash
   git clone https://github.com/indrolend/indrolend-website.git
   cd indrolend-website
   ```

2. Open `home.html` in your browser to view the site locally

### For Spotify Integration

The website includes live Spotify artist statistics. To set this up:

1. **See the comprehensive deployment guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

2. **Quick steps**:
   - Get Spotify API credentials from https://developer.spotify.com/dashboard
   - Deploy backend to Render (or similar service)
   - Update `PRODUCTION_BACKEND_URL` in `spotify-integration.js`

For detailed instructions, see:
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough
- [SPOTIFY_INTEGRATION.md](SPOTIFY_INTEGRATION.md) - Integration overview
- [backend/README.md](backend/README.md) - Backend technical details

## Technologies Used

### Frontend
- **HTML5/CSS3** - Modern web standards
- **Vanilla JavaScript** - No framework dependencies
- **Canvas API** - Particle effects
- **EB Garamond Font** - Custom typography
- **Responsive Design** - Mobile-friendly layout

### Backend (Spotify Integration)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Spotify Web API** - OAuth 2.0 authentication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Deployment

### Frontend (Static Files)
Deploy to any static hosting service:
- **GitHub Pages** - Free, easy integration with GitHub
- **Netlify** - Automatic deployments
- **Vercel** - Fast global CDN
- **Cloudflare Pages** - Free with great performance

### Backend (Node.js Service)
Deploy the Spotify backend to:
- **Render** - Free tier available, recommended
- **Railway** - Free tier available
- **Heroku** - Paid only (no free tier)
- **Vercel** - Requires serverless configuration

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## Configuration

### Spotify Integration

1. **Get credentials** from Spotify Developer Dashboard
2. **Deploy backend** using render.yaml or manual setup
3. **Update frontend** with your backend URL:
   ```javascript
   // In spotify-integration.js
   const PRODUCTION_BACKEND_URL = 'https://your-backend-url.com';
   ```

### Environment Variables (Backend)

Required:
- `SPOTIFY_CLIENT_ID` - Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify app client secret

Optional:
- `SPOTIFY_ARTIST_ID` - Artist ID to fetch (default: 59X3431NBfd6xWMc3Zlh0v)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Local Development

### Frontend Only
Simply open `home.html` in a browser. No build step required!

### With Spotify Integration

1. **Set up backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Spotify credentials
   npm install
   npm start
   ```

2. **Test the API**:
   - Health check: http://localhost:3000/health
   - Artist data: http://localhost:3000/api/spotify

3. **Open frontend**:
   - Open `home.html` in your browser
   - Spotify data will load automatically from localhost

### Testing Script

For easier backend testing:
```bash
cd backend
./test-backend.sh
```

## File Descriptions

### Main Files
- `home.html` - Main homepage with Spotify integration
- `script.js` - Particle effects, animations, UI interactions
- `style.css` - Main styles and responsive design
- `gallery.html` - Image gallery interface
- `index.html` - Landing/welcome page

### Spotify Integration
- `spotify-integration.js` - Fetches and displays Spotify data
- `spotify-styles.css` - Spotify component styling
- `backend/spotify-backend.js` - OAuth 2.0 server
- `backend/package.json` - Node.js dependencies

### Configuration
- `render.yaml` - Render deployment configuration
- `.gitignore` - Excludes node_modules, .env, etc.
- `.env.example` - Template for environment variables

### Documentation
- `DEPLOYMENT_GUIDE.md` - Complete deployment walkthrough
- `SPOTIFY_INTEGRATION.md` - Integration overview
- `backend/README.md` - Backend technical documentation

## Features Breakdown

### Particle Background
- Dynamic particle system using Canvas API
- Responsive to window size
- Performance optimized with requestAnimationFrame

### Spotify Live Stats
- Real-time follower count
- Popularity score (0-100)
- Music genres display
- Top 5 tracks with album artwork
- 5-minute client-side caching
- Loading and error states
- Secure OAuth 2.0 authentication

### Interactive Cards
- 3D tilt effect on hover
- Touch-friendly interactions
- Smooth animations
- Rainbow press effects

### Asymptote Engine
- Custom game engine
- Audio system
- RPG mechanics
- UI framework

## Security

- ✅ Client Secret never exposed to frontend
- ✅ OAuth 2.0 authentication
- ✅ HTTPS in production
- ✅ Environment variables for secrets
- ✅ .env excluded from Git
- ✅ Token caching to minimize API calls

## Performance

- Lightweight vanilla JavaScript (no frameworks)
- Efficient particle system
- API response caching
- Optimized animations
- Responsive images
- Mobile-friendly design

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a personal website, but suggestions are welcome! Feel free to:
- Report issues
- Suggest improvements
- Share feedback

## License

ISC

## Links

- **Website**: [indrolend.github.io/indrolend-website](https://indrolend.github.io/indrolend-website)
- **Spotify**: [Indrolend on Spotify](https://open.spotify.com/artist/59X3431NBfd6xWMc3Zlh0v)
- **Instagram**: [@indrolend.us](https://www.instagram.com/indrolend.us)
- **TikTok**: [@indrolend](https://www.tiktok.com/@indrolend)
- **YouTube**: [@indrolend](https://www.youtube.com/@indrolend)
- **Bandcamp**: [indrolend.bandcamp.com](https://indrolend.bandcamp.com)

## Support

For help with:
- **Deployment**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Spotify Setup**: See [SPOTIFY_INTEGRATION.md](SPOTIFY_INTEGRATION.md)
- **Backend Issues**: See [backend/README.md](backend/README.md)

---

Made with ❤️ by Indrolend
