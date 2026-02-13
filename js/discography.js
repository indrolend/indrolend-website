/**
 * Discography Page - Interactive Gallery
 * Smash Bros Trophy Gallery Style
 */

// Complete discography data
const discographyData = {
  albums: [
    {
      title: "HD",
      date: "2026-01-30",
      tracks: 13,
      spotifyId: "3ULHBfYH4NxSk6xnmkDSXs",
      links: {
        spotify: "https://open.spotify.com/album/3ULHBfYH4NxSk6xnmkDSXs",
        apple: "https://music.apple.com/us/album/hd/1873192975",
        bandcamp: "https://indrolend.bandcamp.com/album/hd"
      }
    },
    {
      title: "Beats",
      date: "2025-10-19",
      tracks: 35,
      spotifyId: "49IK1Xl8qKPc05VNKy0QKc",
      links: {
        spotify: "https://open.spotify.com/album/49IK1Xl8qKPc05VNKy0QKc",
        apple: "https://music.apple.com/us/album/beats/1848066551"
      }
    },
    {
      title: "Meteor",
      date: "2025-02-15",
      tracks: 9,
      spotifyId: "0V5n6cswOmAzzfgO4vbM2Y",
      links: {
        spotify: "https://open.spotify.com/album/0V5n6cswOmAzzfgO4vbM2Y",
        apple: "https://music.apple.com/us/album/meteor/1828542747",
        bandcamp: "https://indrolend.bandcamp.com/album/meteor"
      }
    },
    {
      title: "Planet",
      date: "2024-08-16",
      tracks: 7,
      spotifyId: "64sGBeeRzmL8u5cGDwc0xN",
      links: {
        spotify: "https://open.spotify.com/album/64sGBeeRzmL8u5cGDwc0xN",
        apple: "https://music.apple.com/us/album/planet/1850254585"
      }
    },
    {
      title: "Place",
      date: "2024-05-05",
      tracks: 7,
      spotifyId: "52Ro9hcCKSnXItm3LVbcvO",
      links: {
        spotify: "https://open.spotify.com/album/52Ro9hcCKSnXItm3LVbcvO",
        apple: "https://music.apple.com/us/album/place/1828488794"
      }
    },
    {
      title: "Mothra vs Rodan",
      date: "2024-04-27",
      tracks: 10,
      spotifyId: "1fcAtaP5Bc6SorKfxLNTf9",
      links: {
        spotify: "https://open.spotify.com/album/1fcAtaP5Bc6SorKfxLNTf9",
        apple: "https://music.apple.com/us/album/mothra-vs-rodan/1828727029",
        bandcamp: "https://indrolend.bandcamp.com/album/mothra-vs-rodan"
      }
    },
    {
      title: "Last One",
      date: "2023-01-03",
      tracks: 10,
      spotifyId: "4Zf6QA4D6UvMphs0hb1tCK",
      links: {
        spotify: "https://open.spotify.com/album/4Zf6QA4D6UvMphs0hb1tCK",
        apple: "https://music.apple.com/us/album/last-one/1848728481",
        bandcamp: "https://indrolend.bandcamp.com/album/last-one"
      }
    },
    {
      title: "4chan Skrillex (4CS)",
      date: "2022-11-30",
      tracks: 9,
      spotifyId: "3Blskr7tOLosgT0H5kF5mZ",
      links: {
        spotify: "https://open.spotify.com/album/3Blskr7tOLosgT0H5kF5mZ",
        apple: "https://music.apple.com/us/album/4cs/1848748574",
        bandcamp: "https://indrolend.bandcamp.com/album/4chan-skrillex"
      }
    },
    {
      title: "Marmoset",
      date: "2022-10-31",
      tracks: 10,
      spotifyId: "58STAOR5DMHaPsIE2TEtLt",
      links: {
        spotify: "https://open.spotify.com/album/58STAOR5DMHaPsIE2TEtLt",
        apple: "https://music.apple.com/us/album/marmoset/1848630435",
        bandcamp: "https://indrolend.bandcamp.com/album/marmoset"
      }
    }
  ],
  eps: [
    {
      title: "Talking",
      date: "2025-08-28",
      tracks: 6,
      spotifyId: "0TRiKYIDHSUOuhTcuop4d6",
      links: {
        spotify: "https://open.spotify.com/album/0TRiKYIDHSUOuhTcuop4d6",
        apple: "https://music.apple.com/us/album/talking-ep/1835779305",
        bandcamp: "https://indrolend.bandcamp.com/album/talking"
      }
    },
    {
      title: "Vol. 2",
      date: "2025-05-22",
      tracks: 4,
      spotifyId: "0dxc0FsrDGX4PA0QlXFw4M",
      links: {
        spotify: "https://open.spotify.com/album/0dxc0FsrDGX4PA0QlXFw4M",
        apple: "https://music.apple.com/us/album/vol-2-ep/1816104068",
        bandcamp: "https://indrolend.bandcamp.com/album/vol-2"
      }
    },
    {
      title: "Fuck You",
      date: "2024-08-19",
      tracks: 6,
      spotifyId: "5q3Bbj7pxmTNvHMPnJSpeo",
      links: {
        spotify: "https://open.spotify.com/album/5q3Bbj7pxmTNvHMPnJSpeo",
        apple: "https://music.apple.com/us/album/f-k-you-ep/1764379543"
      }
    },
    {
      title: "Fossils",
      date: "2024-03-11",
      tracks: 5,
      spotifyId: "2LFSgFbSOs4YwS7UoV0vw6",
      links: {
        spotify: "https://open.spotify.com/album/2LFSgFbSOs4YwS7UoV0vw6",
        apple: "https://music.apple.com/us/album/fossils-ep/1850253580"
      }
    },
    {
      title: "Thug",
      date: "2023-12-17",
      tracks: 5,
      spotifyId: "41WO263N2pLWr1MWEvOInb",
      links: {
        spotify: "https://open.spotify.com/album/41WO263N2pLWr1MWEvOInb",
        apple: "https://music.apple.com/us/album/thug-ep/1722371502"
      }
    }
  ],
  singles: [
    {
      title: "Someday",
      date: "2025-12-19",
      spotifyId: "0mSN90GcOlFFjMCJvS5seZ",
      links: {
        spotify: "https://open.spotify.com/album/0mSN90GcOlFFjMCJvS5seZ",
        apple: "https://music.apple.com/us/album/someday-single/1861314732",
        bandcamp: "https://indrolend.bandcamp.com/track/someday"
      }
    },
    {
      title: "Racks (instrumental)",
      date: "2025-11-29",
      spotifyId: "2uT43dk6nKQYrmAqbP1k7l",
      links: {
        spotify: "https://open.spotify.com/album/2uT43dk6nKQYrmAqbP1k7l",
        apple: "https://music.apple.com/us/album/racks-instrumental-single/1857251795"
      }
    },
    {
      title: "Loading",
      date: "2025-11-08",
      spotifyId: "5InNkKEXTh8fjMDgNEBl7D",
      links: {
        spotify: "https://open.spotify.com/album/5InNkKEXTh8fjMDgNEBl7D",
        apple: "https://music.apple.com/us/album/loading-single/1852361712"
      }
    },
    {
      title: "Chill Songs",
      date: "2025-10-31",
      spotifyId: "2RKiZpedxLCVCQWjOkefuQ",
      links: {
        spotify: "https://open.spotify.com/album/2RKiZpedxLCVCQWjOkefuQ",
        apple: "https://music.apple.com/us/album/chill-songs-single/1850557647"
      }
    },
    {
      title: "Hollow",
      date: "2025-10-25",
      spotifyId: "34pKP4djtfBXJvB0uQyOZr",
      links: {
        spotify: "https://open.spotify.com/album/34pKP4djtfBXJvB0uQyOZr",
        apple: "https://music.apple.com/us/album/hollow-single/1849136974"
      }
    },
    {
      title: "Yard Sale",
      date: "2025-10-16",
      spotifyId: "6JLy92O32vu2pwGiYEcQBn",
      links: {
        spotify: "https://open.spotify.com/album/6JLy92O32vu2pwGiYEcQBn",
        apple: "https://music.apple.com/us/album/yard-sale-single/1847086652"
      }
    },
    {
      title: "Come Down (Demo)",
      date: "2025-09-27",
      spotifyId: "4FANjKzUbwBROCSx7JDQGK",
      links: {
        spotify: "https://open.spotify.com/album/4FANjKzUbwBROCSx7JDQGK",
        apple: "https://music.apple.com/us/album/come-down-demo-single/1842729966"
      }
    },
    {
      title: "Losa",
      date: "2025-09-04",
      spotifyId: "1OqFjHa0Ur8xjFQ5SFKCWl",
      links: {
        spotify: "https://open.spotify.com/album/1OqFjHa0Ur8xjFQ5SFKCWl",
        apple: "https://music.apple.com/us/album/losa-single/1838052079"
      }
    },
    {
      title: "Amnesia",
      date: "2025-07-31",
      spotifyId: "2IE2NMsF90IzPiZfnweMgK",
      links: {
        spotify: "https://open.spotify.com/album/2IE2NMsF90IzPiZfnweMgK",
        apple: "https://music.apple.com/us/album/amnesia-single/1829940378"
      }
    },
    {
      title: "Time",
      date: "2025-05-29",
      spotifyId: "7vM3gts03IK7z2kVU33dK3",
      links: {
        spotify: "https://open.spotify.com/album/7vM3gts03IK7z2kVU33dK3",
        apple: "https://music.apple.com/us/album/time-single/1817688492"
      }
    },
    {
      title: "Sabotage",
      date: "2025-05-08",
      spotifyId: "7Ld0apSzmidzRBwhcepWnY",
      links: {
        spotify: "https://open.spotify.com/album/7Ld0apSzmidzRBwhcepWnY",
        apple: "https://music.apple.com/us/album/sabotage-single/1813467497"
      }
    },
    {
      title: "Indrolend",
      date: "2025-03-21",
      spotifyId: "5Hws7wzq52WnicIYEQ6HN9",
      links: {
        spotify: "https://open.spotify.com/album/5Hws7wzq52WnicIYEQ6HN9",
        apple: "https://music.apple.com/us/album/indrolend-single/1803348152"
      }
    },
    {
      title: "Cutlass",
      date: "2024-11-16",
      spotifyId: "2C9nVilxroWlkcKduZvkYe",
      links: {
        spotify: "https://open.spotify.com/album/2C9nVilxroWlkcKduZvkYe",
        apple: "https://music.apple.com/us/album/cutlass-single/1867584705",
        bandcamp: "https://indrolend.bandcamp.com/track/cutlass"
      }
    },
    {
      title: "Archive",
      date: "2024-11-04",
      links: {
        bandcamp: "https://indrolend.bandcamp.com/track/archive"
      }
    },
    {
      title: "Take",
      date: "2024-10-25",
      spotifyId: "7aXXUcMgfMtzQCdPE2NDE7",
      links: {
        spotify: "https://open.spotify.com/album/7aXXUcMgfMtzQCdPE2NDE7",
        apple: "https://music.apple.com/us/album/take-single/1828557253",
        bandcamp: "https://indrolend.bandcamp.com/track/take"
      }
    },
    {
      title: "The Scientist",
      date: "2024-10-12",
      spotifyId: "3XaWX2o1romq48XsoSvyX0",
      links: {
        spotify: "https://open.spotify.com/album/3XaWX2o1romq48XsoSvyX0"
      }
    },
    {
      title: "Teen Spirit",
      date: "2024-10-12",
      spotifyId: "6Rb4YYwisKL4oTW43occ5Z",
      links: {
        spotify: "https://open.spotify.com/album/6Rb4YYwisKL4oTW43occ5Z",
        bandcamp: "https://indrolend.bandcamp.com/track/teen-spirit"
      }
    },
    {
      title: "H&R Block",
      date: "2024-10-03",
      spotifyId: "2w7hnJQgBHT6VtuiI7z43E",
      links: {
        spotify: "https://open.spotify.com/album/2w7hnJQgBHT6VtuiI7z43E",
        apple: "https://music.apple.com/us/album/h-r-block-single/1850276167"
      }
    },
    {
      title: "Demons",
      date: "2024-09-13",
      spotifyId: "343ryyNwFAz1A1wyYZntyz",
      links: {
        spotify: "https://open.spotify.com/album/343ryyNwFAz1A1wyYZntyz",
        apple: "https://music.apple.com/us/album/demons-single/1768696336"
      }
    },
    {
      title: "Backseat Freestyle",
      date: "2024-09-01",
      spotifyId: "5piGpV8aYQpplYmtCUbTiE",
      links: {
        spotify: "https://open.spotify.com/album/5piGpV8aYQpplYmtCUbTiE",
        apple: "https://music.apple.com/us/album/backseat-freestyle-single/1766112994"
      }
    },
    {
      title: "Fake Love",
      date: "2024-07-01",
      spotifyId: "29bihuue4uSYw7dC2rf6G1",
      links: {
        spotify: "https://open.spotify.com/album/29bihuue4uSYw7dC2rf6G1",
        apple: "https://music.apple.com/us/album/fake-love-single/1755068244"
      }
    },
    {
      title: "Confused",
      date: "2024-06-27",
      spotifyId: "6yPN04kpB5nPPnbH7kolvq",
      links: {
        spotify: "https://open.spotify.com/album/6yPN04kpB5nPPnbH7kolvq",
        apple: "https://music.apple.com/us/album/confused-single/1754644771"
      }
    },
    {
      title: "i",
      date: "2024-05-23",
      spotifyId: "3L7l0MuoUDSII1fVjM09OH",
      links: {
        spotify: "https://open.spotify.com/album/3L7l0MuoUDSII1fVjM09OH",
        apple: "https://music.apple.com/us/album/i-single/1748463749"
      }
    },
    {
      title: "Here Till",
      date: "2024-05-18",
      spotifyId: "0jgiJd4YfaGt3o8hE46p38",
      links: {
        spotify: "https://open.spotify.com/album/0jgiJd4YfaGt3o8hE46p38",
        apple: "https://music.apple.com/us/album/here-till-single/1850272516"
      }
    },
    {
      title: "Gown",
      date: "2024-05-17",
      spotifyId: "1DayXOW59cqiDVIvEGVDKc",
      links: {
        spotify: "https://open.spotify.com/album/1DayXOW59cqiDVIvEGVDKc",
        apple: "https://music.apple.com/us/album/gown-single/1747410723"
      }
    },
    {
      title: "Water",
      date: "2024-01-10",
      spotifyId: "7i9pfjGjUrmEPyuPXi1DnB",
      links: {
        spotify: "https://open.spotify.com/album/7i9pfjGjUrmEPyuPXi1DnB",
        apple: "https://music.apple.com/us/album/water-single/1725371464"
      }
    },
    {
      title: "Oblivion (Radio Edit)",
      date: "2024-01-02",
      spotifyId: "2Mc7qwlqRCtrR7L4vco6Ns",
      links: {
        spotify: "https://open.spotify.com/album/2Mc7qwlqRCtrR7L4vco6Ns",
        apple: "https://music.apple.com/us/album/oblivion-radio-edit-single/1723886370"
      }
    },
    {
      title: "Jack",
      date: "2023-12-20",
      spotifyId: "7GJy2O1aYgZfLJ2oizeLmL",
      links: {
        spotify: "https://open.spotify.com/album/7GJy2O1aYgZfLJ2oizeLmL",
        apple: "https://music.apple.com/us/album/jack-single/1722725572"
      }
    }
  ]
};

// Format date to Year
function formatYear(dateString) {
  return new Date(dateString).getFullYear();
}

// Get album artwork URL from Spotify Open Graph
function getArtworkUrl(spotifyId) {
  if (!spotifyId) {
    return null;
  }
  // Use Spotify's Open Graph image URL which works without authentication
  return `https://i.scdn.co/image/ab67616d0000b273${spotifyId.split('').slice(0, 40).join('')}`;
}

// Create fallback gradient background
function createFallbackArtwork(title) {
  // Create a simple gradient based on title
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 300, 300);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 300, 300);
  
  // Add title text
  ctx.fillStyle = '#6dd9e8';
  ctx.font = 'bold 24px "EB Garamond", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Wrap text if too long
  const maxWidth = 260;
  const words = title.split(' ');
  let lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  
  // Draw lines
  const lineHeight = 32;
  const startY = 150 - (lines.length * lineHeight / 2);
  lines.forEach((line, i) => {
    ctx.fillText(line, 150, startY + (i * lineHeight));
  });
  
  return canvas.toDataURL('image/png');
}

// Create album card HTML
function createAlbumCard(release, index) {
  const year = formatYear(release.date);
  const trackInfo = release.tracks ? ` • ${release.tracks} tracks` : '';
  
  // Try to construct Spotify artwork URL, fallback to generated image
  let artworkUrl;
  if (release.spotifyId) {
    // Extract album ID from Spotify ID if it's a full URL or use as-is
    const albumId = release.spotifyId;
    // Use a data URL initially, will be replaced once image loads or errors
    artworkUrl = createFallbackArtwork(release.title);
  } else {
    artworkUrl = createFallbackArtwork(release.title);
  }

  const card = document.createElement('div');
  card.className = 'album-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${release.title} - Released ${release.date}${trackInfo}`);
  card.dataset.index = index;

  let platformLinksHtml = '';
  if (release.links) {
    platformLinksHtml = '<div class="platform-links">';
    
    if (release.links.spotify) {
      platformLinksHtml += `
        <a href="${release.links.spotify}" 
           class="platform-link spotify" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Listen on Spotify">
          🎵 Spotify
        </a>`;
    }
    
    if (release.links.apple) {
      platformLinksHtml += `
        <a href="${release.links.apple}" 
           class="platform-link apple" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Listen on Apple Music">
          🍎 Apple Music
        </a>`;
    }
    
    if (release.links.bandcamp) {
      platformLinksHtml += `
        <a href="${release.links.bandcamp}" 
           class="platform-link bandcamp" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Listen on Bandcamp">
          💿 Bandcamp
        </a>`;
    }
    
    platformLinksHtml += '</div>';
  }

  card.innerHTML = `
    <div class="album-card-inner">
      <div class="album-artwork-container">
        <div class="album-artwork-skeleton"></div>
        <img 
          src="${artworkUrl}" 
          alt="${release.title} album artwork" 
          class="album-artwork loading"
          loading="lazy"
          data-spotify-id="${release.spotifyId || ''}"
        />
      </div>
      <div class="album-info">
        <h3 class="album-title">${release.title}</h3>
        <p class="album-meta">${year}${trackInfo}</p>
      </div>
      ${platformLinksHtml}
    </div>
  `;

  // Try to load actual Spotify artwork if available
  if (release.spotifyId) {
    const img = card.querySelector('.album-artwork');
    const spotifyArtworkUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/album/${release.spotifyId}`;
    
    // Fetch Spotify oEmbed data to get artwork
    fetch(spotifyArtworkUrl)
      .then(response => response.json())
      .then(data => {
        if (data.thumbnail_url) {
          img.src = data.thumbnail_url;
        }
      })
      .catch(() => {
        // Keep fallback image if fetch fails
        console.log(`Could not load artwork for ${release.title}`);
      });
  }

  return card;
}

// Populate gallery
function populateGallery(galleryId, releases) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;

  releases.forEach((release, index) => {
    const card = createAlbumCard(release, index);
    gallery.appendChild(card);
  });
}

// Handle card interaction
function handleCardClick(event) {
  const card = event.target.closest('.album-card');
  if (!card) return;

  // Don't toggle if clicking on a link
  if (event.target.closest('.platform-link')) return;

  // Close all other expanded cards
  document.querySelectorAll('.album-card.expanded').forEach(expandedCard => {
    if (expandedCard !== card) {
      expandedCard.classList.remove('expanded');
    }
  });

  // Toggle current card
  card.classList.toggle('expanded');
}

// Keyboard navigation
function handleKeyboardNavigation(event) {
  const card = event.target.closest('.album-card');
  if (!card) return;

  const gallery = card.closest('.gallery-scroll');
  if (!gallery) return;

  const cards = Array.from(gallery.querySelectorAll('.album-card'));
  const currentIndex = cards.indexOf(card);

  switch(event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      card.classList.toggle('expanded');
      break;
      
    case 'ArrowLeft':
      event.preventDefault();
      if (currentIndex > 0) {
        cards[currentIndex - 1].focus();
        cards[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      break;
      
    case 'ArrowRight':
      event.preventDefault();
      if (currentIndex < cards.length - 1) {
        cards[currentIndex + 1].focus();
        cards[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      break;
      
    case 'Escape':
      card.classList.remove('expanded');
      break;
  }
}

// Handle image load
function handleImageLoad(event) {
  const img = event.target;
  img.classList.remove('loading');
  const skeleton = img.previousElementSibling;
  if (skeleton && skeleton.classList.contains('album-artwork-skeleton')) {
    skeleton.style.display = 'none';
  }
}

// Initialize page
function initDiscographyPage() {
  // Populate galleries
  populateGallery('albums-gallery', discographyData.albums);
  populateGallery('eps-gallery', discographyData.eps);
  populateGallery('singles-gallery', discographyData.singles);

  // Add event listeners
  document.addEventListener('click', handleCardClick);
  document.addEventListener('keydown', handleKeyboardNavigation);

  // Add image load listeners
  document.querySelectorAll('.album-artwork').forEach(img => {
    img.addEventListener('load', handleImageLoad);
  });

  // Close expanded cards when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.album-card')) {
      document.querySelectorAll('.album-card.expanded').forEach(card => {
        card.classList.remove('expanded');
      });
    }
  });

  // Initialize particle background if available
  if (window.particleTransitionEngine) {
    window.particleTransitionEngine.init();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDiscographyPage);
} else {
  initDiscographyPage();
}
