document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("statsRefresh");
  const lastUpdateEl = document.getElementById("statsLastUpdate");
  const setupNotice = document.getElementById("statsSetupNotice");

  // Configuration - API endpoint URLs
  // In production, these should point to your backend API endpoints
  const API_CONFIG = {
    // Option 1: Use environment variable or config file
    baseUrl: window.STATS_API_URL || "/api/stats",
    
    // Option 2: Direct endpoints (for serverless functions)
    endpoints: {
      website: "/api/stats/website",
      spotify: "/api/stats/spotify",
      apple: "/api/stats/apple",
      tiktok: "/api/stats/tiktok"
    }
  };

  // Stats state
  let statsData = {
    website: null,
    spotify: null,
    apple: null,
    tiktok: null,
    lastUpdate: null
  };

  // Format numbers with commas
  function formatNumber(num) {
    if (num === null || num === undefined) return "N/A";
    return num.toLocaleString();
  }

  // Format bytes to human readable
  function formatBytes(bytes) {
    if (bytes === null || bytes === undefined) return "N/A";
    if (bytes === 0) return "0 B";
    
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Update UI with stats data
  function updateUI() {
    // Website stats
    if (statsData.website) {
      document.getElementById("webUniqueVisitors").textContent = 
        formatNumber(statsData.website.uniqueVisitors);
      document.getElementById("webTotalRequests").textContent = 
        formatNumber(statsData.website.totalRequests);
      document.getElementById("webDataCached").textContent = 
        formatBytes(statsData.website.dataCached);
    }

    // Spotify stats
    if (statsData.spotify) {
      document.getElementById("spotifyListeners").textContent = 
        formatNumber(statsData.spotify.monthlyListeners);
      document.getElementById("spotifyPlays").textContent = 
        formatNumber(statsData.spotify.totalPlays);
      document.getElementById("spotifySaves").textContent = 
        formatNumber(statsData.spotify.saves);
    }

    // Apple Music stats
    if (statsData.apple) {
      document.getElementById("applePlays").textContent = 
        formatNumber(statsData.apple.plays);
      document.getElementById("appleListeners").textContent = 
        formatNumber(statsData.apple.listeners);
      document.getElementById("appleShazams").textContent = 
        formatNumber(statsData.apple.shazams);
    }

    // TikTok stats
    if (statsData.tiktok) {
      document.getElementById("tiktokFollowers").textContent = 
        formatNumber(statsData.tiktok.followers);
      document.getElementById("tiktokLikes").textContent = 
        formatNumber(statsData.tiktok.totalLikes);
      document.getElementById("tiktokViews").textContent = 
        formatNumber(statsData.tiktok.videoViews);
    }

    // Update last refresh time
    if (statsData.lastUpdate) {
      const date = new Date(statsData.lastUpdate);
      lastUpdateEl.textContent = `Last updated: ${date.toLocaleTimeString()}`;
    }
  }

  // Show error in a stat card
  function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `<span class="stats-error">${message}</span>`;
    }
  }

  // Fetch stats from API
  async function fetchStats() {
    refreshBtn.classList.add("loading");
    
    try {
      // Fetch all stats in parallel
      const promises = [
        fetchWebsiteStats(),
        fetchSpotifyStats(),
        fetchAppleStats(),
        fetchTikTokStats()
      ];

      await Promise.allSettled(promises);
      
      statsData.lastUpdate = new Date().toISOString();
      updateUI();
      
      // Check if any data was loaded successfully
      const hasData = Object.values(statsData).some(v => v !== null && v !== statsData.lastUpdate);
      if (!hasData) {
        setupNotice?.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      lastUpdateEl.textContent = "Error loading stats";
    } finally {
      refreshBtn.classList.remove("loading");
    }
  }

  // Fetch website analytics stats
  async function fetchWebsiteStats() {
    try {
      const response = await fetch(API_CONFIG.endpoints.website);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      statsData.website = data;
    } catch (error) {
      console.error("Error fetching website stats:", error);
      // Use demo data for development/testing
      if (error.message.includes("Failed to fetch") || error.message.includes("404")) {
        showError("webUniqueVisitors", "API not configured");
        showError("webTotalRequests", "API not configured");
        showError("webDataCached", "API not configured");
      }
    }
  }

  // Fetch Spotify stats
  async function fetchSpotifyStats() {
    try {
      const response = await fetch(API_CONFIG.endpoints.spotify);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      statsData.spotify = data;
    } catch (error) {
      console.error("Error fetching Spotify stats:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("404")) {
        showError("spotifyListeners", "API not configured");
        showError("spotifyPlays", "API not configured");
        showError("spotifySaves", "API not configured");
      }
    }
  }

  // Fetch Apple Music stats
  async function fetchAppleStats() {
    try {
      const response = await fetch(API_CONFIG.endpoints.apple);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      statsData.apple = data;
    } catch (error) {
      console.error("Error fetching Apple Music stats:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("404")) {
        showError("applePlays", "API not configured");
        showError("appleListeners", "API not configured");
        showError("appleShazams", "API not configured");
      }
    }
  }

  // Fetch TikTok stats
  async function fetchTikTokStats() {
    try {
      const response = await fetch(API_CONFIG.endpoints.tiktok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      statsData.tiktok = data;
    } catch (error) {
      console.error("Error fetching TikTok stats:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("404")) {
        showError("tiktokFollowers", "API not configured");
        showError("tiktokLikes", "API not configured");
        showError("tiktokViews", "API not configured");
      }
    }
  }

  // Event listeners
  if (refreshBtn) {
    refreshBtn.addEventListener("click", fetchStats);
  }

  // Auto-refresh every 5 minutes
  setInterval(() => {
    fetchStats();
  }, 5 * 60 * 1000);

  // Initial load
  fetchStats();
});
