// api/stats/website.js
// Vercel Serverless Function for fetching website analytics

// Note: Vercel provides fetch globally in Node.js 18+
// For older versions, uncomment the next line:
// const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development' || !process.env.ANALYTICS_PROVIDER) {
      // Return mock data for development
      return res.json({
        uniqueVisitors: 5678,
        totalRequests: 23456,
        dataCached: 12582912, // ~12 MB in bytes
        _demo: true
      });
    }

    const provider = process.env.ANALYTICS_PROVIDER; // 'google', 'cloudflare', or 'plausible'

    let stats = {};

    switch (provider) {
      case 'cloudflare':
        stats = await fetchCloudflareStats();
        break;
      
      case 'google':
        stats = await fetchGoogleAnalyticsStats();
        break;
      
      case 'plausible':
        stats = await fetchPlausibleStats();
        break;
      
      default:
        throw new Error('Unknown analytics provider');
    }

    res.json(stats);
  } catch (error) {
    console.error('Website analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch website stats',
      message: error.message 
    });
  }
};

// Cloudflare Analytics
async function fetchCloudflareStats() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  // GraphQL query for Cloudflare Analytics
  const query = `
    query {
      viewer {
        zones(filter: {zoneTag: "${zoneId}"}) {
          httpRequests1dGroups(limit: 1, filter: {date_gt: "${getYesterdayDate()}"}) {
            sum {
              requests
              cachedBytes
            }
            uniq {
              uniques
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Cloudflare stats');
  }

  const data = await response.json();
  const stats = data.data.viewer.zones[0].httpRequests1dGroups[0];

  return {
    uniqueVisitors: stats.uniq.uniques,
    totalRequests: stats.sum.requests,
    dataCached: stats.sum.cachedBytes
  };
}

// Google Analytics
async function fetchGoogleAnalyticsStats() {
  // This requires the Google Analytics Data API v1
  // You need to set up a service account and download the JSON key
  
  // Install: npm install @google-analytics/data
  // const {BetaAnalyticsDataClient} = require('@google-analytics/data');
  
  // For now, return a placeholder
  throw new Error('Google Analytics integration not yet implemented. See STATS_SETUP.md');
}

// Plausible Analytics
async function fetchPlausibleStats() {
  const siteId = process.env.PLAUSIBLE_SITE_ID;
  const apiKey = process.env.PLAUSIBLE_API_KEY;

  const response = await fetch(
    `https://plausible.io/api/v1/stats/aggregate?site_id=${siteId}&period=30d&metrics=visitors,pageviews`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Plausible stats');
  }

  const data = await response.json();

  return {
    uniqueVisitors: data.results.visitors.value,
    totalRequests: data.results.pageviews.value,
    dataCached: 0 // Plausible doesn't track this
  };
}

function getYesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}
