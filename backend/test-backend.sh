#!/bin/bash
set -e  # Exit immediately if any command fails
# Local Testing Script for Spotify Backend
# This script helps test the backend before deploying

echo "🎵 Spotify Backend Local Testing Script"
echo "========================================"
echo ""

# Check if we're in the backend directory
if [ ! -f "spotify-backend.js" ]; then
    echo "❌ Error: Must be run from the backend/ directory"
    echo "   Run: cd backend && ./test-backend.sh"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your Spotify credentials:"
    echo "   1. SPOTIFY_CLIENT_ID=your_client_id"
    echo "   2. SPOTIFY_CLIENT_SECRET=your_client_secret"
    echo ""
    echo "   Get credentials from: https://developer.spotify.com/dashboard"
    echo ""
    exit 0
fi

# Check if credentials are set
CLIENT_ID=$(grep SPOTIFY_CLIENT_ID .env | cut -d '=' -f2)
CLIENT_SECRET=$(grep SPOTIFY_CLIENT_SECRET .env | cut -d '=' -f2)

if [ "$CLIENT_ID" == "your_client_id_here" ] || [ -z "$CLIENT_ID" ]; then
    echo "❌ SPOTIFY_CLIENT_ID not configured in .env"
    echo "   Edit .env and add your Spotify Client ID"
    exit 1
fi

if [ "$CLIENT_SECRET" == "your_client_secret_here" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ SPOTIFY_CLIENT_SECRET not configured in .env"
    echo "   Edit .env and add your Spotify Client Secret"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Configuration looks good!"
echo ""
echo "Starting backend server..."
echo "Press Ctrl+C to stop"
echo ""
echo "Once running, test with:"
echo "  - Health check: http://localhost:3000/health"
echo "  - API endpoint: http://localhost:3000/api/spotify"
echo ""

# Start the server
npm start
