// Spotify Artist Stats Fetcher
// Artist ID: 59X3431NBfd6xWMc3Zlh0v (Indrolend)

// HOW TO GET A SPOTIFY ACCESS TOKEN:
// 1. Go to https://developer.spotify.com/console/get-artist/
// 2. Click "Get Token" button
// 3. Log in with your Spotify account
// 4. Copy the access token and replace YOUR_SPOTIFY_ACCESS_TOKEN_HERE below
// 
// SECURITY WARNING: Storing access tokens in client-side JavaScript exposes them
// to all users and is not recommended for production. This is acceptable for:
// - Development/testing purposes
// - Public data (like artist stats which are publicly visible on Spotify)
// 
// For production, consider:
// - Implementing a backend proxy that handles authentication
// - Using environment variables and build-time token injection
// - Implementing OAuth flow with token refresh
// 
// Note: Access tokens expire after 1 hour. For production use, implement OAuth flow
// or use Spotify's Client Credentials Flow for server-side authentication.

document.addEventListener("DOMContentLoaded", () => {
  // Only run on stats.html page
  const artistNameEl = document.getElementById("artistName");
  const artistFollowersEl = document.getElementById("artistFollowers");
  const artistPopularityEl = document.getElementById("artistPopularity");

  if (!artistNameEl || !artistFollowersEl || !artistPopularityEl) {
    return; // Not on stats page
  }

  // Placeholder access token - replace with a valid Spotify access token
  const ACCESS_TOKEN = "YOUR_SPOTIFY_ACCESS_TOKEN_HERE";
  const ARTIST_ID = "59X3431NBfd6xWMc3Zlh0v";

  // Function to fetch artist data from Spotify API
  async function fetchArtistStats() {
    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data');
      }

      // Update the DOM with fetched data
      artistNameEl.textContent = data.name || "Unknown";
      artistFollowersEl.textContent = formatNumber(data.followers?.total ?? 0);
      artistPopularityEl.textContent = (data.popularity ?? 0) + "/100";

      // Re-initialize the important word effect from script.js
      initImportantWordsForStats();
    } catch (error) {
      console.error("Error fetching Spotify artist stats:", error);
      artistNameEl.textContent = "Error loading";
      artistFollowersEl.textContent = "Error loading";
      artistPopularityEl.textContent = "Error loading";
    }
  }

  // Format number with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Initialize important word effect for the stats values
  function initImportantWordsForStats() {
    const importantWords = document.querySelectorAll(".spotify-stat-value");
    
    // Font variants available in EB Garamond
    const fontVariants = [
      { weight: 400, style: 'normal' },
      { weight: 500, style: 'normal' },
      { weight: 600, style: 'normal' },
      { weight: 700, style: 'normal' },
      { weight: 800, style: 'normal' },
      { weight: 400, style: 'italic' },
      { weight: 500, style: 'italic' },
      { weight: 600, style: 'italic' }
    ];

    const allLetterSpans = [];

    importantWords.forEach(el => {
      // Skip if already processed
      if (el.dataset.fluctuateInit) return;
      el.dataset.fluctuateInit = "true";

      const text = el.textContent;
      el.textContent = "";

      [...text].forEach((char, index) => {
        if (char === " ") {
          el.appendChild(document.createTextNode(" "));
        } else {
          const span = document.createElement("span");
          span.textContent = char;
          span.className = "important-word-letter wavy-text-letter";
          const fluctuateDelay = (Math.random() * 2).toFixed(2);
          const wavyDelay = (index * 0.08).toFixed(2);
          span.style.animationDelay = `${fluctuateDelay}s, ${wavyDelay}s`;
          const variant = fontVariants[Math.floor(Math.random() * fontVariants.length)];
          span.style.fontWeight = variant.weight;
          span.style.fontStyle = variant.style;
          el.appendChild(span);
          allLetterSpans.push(span);
        }
      });
    });

    // Cycle font variants randomly for each letter
    if (allLetterSpans.length > 0) {
      const intervalId = setInterval(() => {
        const numToChange = Math.max(1, Math.floor(allLetterSpans.length * 0.15));
        for (let i = 0; i < numToChange; i++) {
          const randomSpan = allLetterSpans[Math.floor(Math.random() * allLetterSpans.length)];
          const variant = fontVariants[Math.floor(Math.random() * fontVariants.length)];
          randomSpan.style.fontWeight = variant.weight;
          randomSpan.style.fontStyle = variant.style;
        }
      }, 400);

      // Clean up interval when page is unloaded to prevent memory leaks
      window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
      });
    }
  }

  // Fetch the artist stats when page loads
  fetchArtistStats();
});
