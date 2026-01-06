#!/usr/bin/env python3
"""
Screenshot Parser for Spotify Stats
Extracts stats like Playlist Adds, Followers, Streams, and Listeners from screenshots using OCR.
"""

import re
import json
from datetime import datetime, timezone
from pathlib import Path
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np
import pytz

# Constants for geography parsing
MIN_CITY_NAME_LENGTH = 2
MIN_COUNTRY_NAME_LENGTH = 3
MIN_LISTENERS_COUNT = 1
GENERIC_WORDS = {'Active', 'Total', 'Streams', 'Male', 'Female', 'Age', 'Sources', 'Listeners'}

# Constants for geography parsing
MIN_CITY_NAME_LENGTH = 2
MIN_COUNTRY_NAME_LENGTH = 3
MIN_LISTENERS_COUNT = 1
GENERIC_WORDS = {'Active', 'Total', 'Streams', 'Male', 'Female', 'Age', 'Sources', 'Listeners'}

# Timezone configuration - set to UTC by default, can be overridden
DEFAULT_TIMEZONE = 'UTC'

def preprocess_image(image_path, debug=False):
    """
    Preprocess image to improve OCR accuracy.
    
    Applies multiple preprocessing techniques:
    - Resizing (upscale small images)
    - Grayscale conversion  
    - Denoising
    - Contrast enhancement
    - Color inversion if dark background detected
    
    Args:
        image_path: Path to the image file
        debug: If True, save intermediate preprocessing steps
        
    Returns:
        PIL Image object ready for OCR
    """
    # Read image with OpenCV
    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError(f"Unable to read image: {image_path}")
    
    # Get original dimensions
    height, width = img.shape[:2]
    
    # 1. Upscale if image is small (improves OCR on low-res screenshots)
    # Target: at least 2400px on the longer side for better text recognition
    target_size = 2400
    if max(height, width) < target_size:
        scale_factor = target_size / max(height, width)
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        if debug:
            print(f"  Upscaled from {width}x{height} to {new_width}x{new_height}")
    
    # 2. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 3. Detect if we have a dark background (common in mobile screenshots)
    # If mean brightness is low, we likely have dark mode
    mean_brightness = np.mean(gray)
    is_dark_mode = mean_brightness < 127
    
    if debug:
        print(f"  Mean brightness: {mean_brightness:.1f} ({'dark' if is_dark_mode else 'light'} mode detected)")
    
    # 4. Invert if dark mode for better OCR (Tesseract expects dark text on light background)
    if is_dark_mode:
        gray = cv2.bitwise_not(gray)
        if debug:
            print("  Inverted colors for dark mode")
    
    # 5. Apply light denoising
    denoised = cv2.fastNlMeansDenoising(gray, h=7)
    
    # 6. Enhance contrast using CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)
    
    # Convert to PIL Image
    pil_image = Image.fromarray(enhanced)
    
    if debug:
        debug_dir = Path('/tmp/ocr_debug')
        debug_dir.mkdir(exist_ok=True)
        base_name = Path(image_path).stem
        
        # Save intermediate steps
        cv2.imwrite(str(debug_dir / f'{base_name}_1_gray.png'), cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
        if is_dark_mode:
            cv2.imwrite(str(debug_dir / f'{base_name}_2_inverted.png'), gray)
        cv2.imwrite(str(debug_dir / f'{base_name}_3_denoised.png'), denoised)
        cv2.imwrite(str(debug_dir / f'{base_name}_4_enhanced.png'), enhanced)
        pil_image.save(debug_dir / f'{base_name}_5_final.png')
        print(f"  Debug images saved to {debug_dir}")
    
    return pil_image

def extract_text_from_image(image_path, preprocess=True, debug=False):
    """
    Extract text from an image using Tesseract OCR with preprocessing.
    
    Tries multiple approaches to maximize extraction:
    1. Preprocessed image with PSM 3 (fully automatic)
    2. Preprocessed image with PSM 11 (sparse text)
    3. Original image with PSM 6 (uniform block)
    
    Args:
        image_path: Path to the image file
        preprocess: If True, apply image preprocessing
        debug: If True, save debug information
        
    Returns:
        Extracted text string
    """
    try:
        best_text = ""
        best_length = 0
        
        if preprocess:
            img_processed = preprocess_image(image_path, debug=debug)
        else:
            img_processed = Image.open(image_path)
        
        # Also keep original for comparison
        img_original = Image.open(image_path)
        
        # Try different configurations and keep the best result
        configs = [
            # (image, config_string, description)
            (img_processed, r'--oem 3 --psm 3', 'Preprocessed + PSM 3 (auto)'),
            (img_processed, r'--oem 3 --psm 11', 'Preprocessed + PSM 11 (sparse)'),
            (img_original, r'--oem 3 --psm 3', 'Original + PSM 3 (auto)'),
            (img_original, r'--oem 3 --psm 6', 'Original + PSM 6 (block)'),
        ]
        
        for img, config, desc in configs:
            text = pytesseract.image_to_string(img, config=config)
            if len(text) > best_length:
                best_text = text
                best_length = len(text)
                if debug:
                    print(f"  {desc}: {len(text)} chars (NEW BEST)")
            elif debug:
                print(f"  {desc}: {len(text)} chars")
        
        if debug:
            print(f"  Final text length: {best_length} characters")
            print(f"  First 300 chars: {best_text[:300]}")
        
        return best_text
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return ""

def parse_spotify_stats(text, debug=False):
    """
    Parse Spotify statistics from OCR text.
    Extracts core metrics, demographics, geography, and discovery sources.
    
    Args:
        text: OCR extracted text
        debug: If True, print debug information
        
    Returns:
        Dictionary of extracted statistics
    """
    stats = {}
    unresolved_fields = []  # Track fields we tried but failed to extract
    
    if debug:
        print("\n=== PARSING DEBUG ===")
        print(f"Input text length: {len(text)} characters")
    
    # === CORE METRICS ===
    
    # Look for "Playlist Adds Followers" pattern with two numbers on the next line
    # This handles the case where both metrics appear together
    # Enhanced pattern to handle more spacing variations and OCR errors
    playlist_followers_match = re.search(
        r'Playlist\s+Adds\s+Followers[^\d]*?(\d[\d,]*)\s+(\d[\d,]*)',
        text,
        re.IGNORECASE | re.DOTALL
    )
    if playlist_followers_match:
        stats['playlist_adds'] = int(playlist_followers_match.group(1).replace(',', ''))
        stats['followers'] = int(playlist_followers_match.group(2).replace(',', ''))
        if debug:
            print(f"✓ Found Playlist Adds & Followers: {stats['playlist_adds']}, {stats['followers']}")
    else:
        # Try individual patterns if the combined pattern doesn't match
        # Pattern for "Playlist Adds" followed by number
        # Enhanced to handle variations like "Playlist\nAdds" and multiple spaces
        playlist_adds_match = re.search(
            r'Playlist[\s\n]+Adds[^\d]*?(\d[\d,]*)',
            text,
            re.IGNORECASE | re.DOTALL
        )
        if playlist_adds_match:
            stats['playlist_adds'] = int(playlist_adds_match.group(1).replace(',', ''))
            if debug:
                print(f"✓ Found Playlist Adds: {stats['playlist_adds']}")
        else:
            unresolved_fields.append('playlist_adds')
            if debug:
                print("✗ Playlist Adds not found")
        
        # Pattern for "Followers" followed by number (last occurrence to avoid header)
        # Enhanced to handle more variations
        followers_matches = list(re.finditer(
            r'Followers[^\d]*?(\d[\d,]*)',
            text,
            re.IGNORECASE
        ))
        if followers_matches:
            # Use the last match to avoid matching headers
            stats['followers'] = int(followers_matches[-1].group(1).replace(',', ''))
            if debug:
                print(f"✓ Found Followers: {stats['followers']}")
        else:
            unresolved_fields.append('followers')
            if debug:
                print("✗ Followers not found")
    
    # Pattern for "Listeners" followed by number
    # Enhanced to handle line breaks and various spacing
    listeners_match = re.search(
        r'(?:^|\n)\s*Listeners[^\d]*?(\d[\d,]*)',
        text,
        re.IGNORECASE | re.MULTILINE
    )
    if listeners_match:
        stats['listeners'] = int(listeners_match.group(1).replace(',', ''))
        if debug:
            print(f"✓ Found Listeners: {stats['listeners']}")
    else:
        unresolved_fields.append('listeners')
        if debug:
            print("✗ Listeners not found")
    
    # Pattern for "Streams" - be careful not to match "Streams / Listener"
    # Enhanced pattern with better boundaries
    streams_match = re.search(
        r'(?:^|\n)\s*Streams(?!\s*/\s*Listener)[^\d]*?(\d[\d,]*)',
        text,
        re.IGNORECASE | re.MULTILINE
    )
    if streams_match:
        stats['streams'] = int(streams_match.group(1).replace(',', ''))
        if debug:
            print(f"✓ Found Streams: {stats['streams']}")
    else:
        unresolved_fields.append('streams')
        if debug:
            print("✗ Streams not found")
    
    # Pattern for "Streams / Listener" or "Streams per Listener" ratio
    # Enhanced to handle various separators
    streams_per_listener_match = re.search(
        r'Streams\s*[/\-]\s*Listener[^\d]*?(\d+(?:[.,]\d+)?)',
        text,
        re.IGNORECASE
    )
    if streams_per_listener_match:
        # Handle both comma and dot as decimal separator
        value_str = streams_per_listener_match.group(1).replace(',', '.')
        stats['streams_per_listener'] = float(value_str)
        if debug:
            print(f"✓ Found Streams/Listener: {stats['streams_per_listener']}")
    else:
        unresolved_fields.append('streams_per_listener')
        if debug:
            print("✗ Streams/Listener not found")
    
    # Pattern for "Saves"
    saves_match = re.search(r'Saves[^\d]*?(\d[\d,]*)', text, re.IGNORECASE)
    if saves_match:
        stats['saves'] = int(saves_match.group(1).replace(',', ''))
        if debug:
            print(f"✓ Found Saves: {stats['saves']}")
    else:
        unresolved_fields.append('saves')
        if debug:
            print("✗ Saves not found")
    
    # Parse change percentages (e.g., "+40%", "-5%")
    # Enhanced patterns with better whitespace handling
    change_patterns = [
        (r'Listeners[^\d%]*?([\+\-]\d+)\s*%', 'listeners_change'),
        (r'Streams(?!\s*/)[^\d%]*?([\+\-]\d+)\s*%', 'streams_change'),
        (r'Streams\s*[/\-]\s*Listener[^\d%]*?([\+\-]\d+)\s*%', 'streams_per_listener_change'),
        (r'Saves[^\d%]*?([\+\-]\d+)\s*%', 'saves_change'),
        (r'Playlist[\s\n]+Adds[^\d%]*?([\+\-]\d+)\s*%', 'playlist_adds_change'),
        (r'Followers[^\d%]*?([\+\-]\d+)\s*%', 'followers_change'),
    ]
    
    for pattern, key in change_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            stats[key] = match.group(1) + '%'
            if debug:
                print(f"✓ Found {key}: {stats[key]}")
        else:
            unresolved_fields.append(key)
    
    # === DEMOGRAPHICS ===
    
    # Gender demographics - enhanced patterns
    gender_patterns = [
        (r'Male[^\d]*?(\d+)\s*%', 'gender_male'),
        (r'Female[^\d]*?(\d+)\s*%', 'gender_female'),
        (r'Non[- ]?binary[^\d]*?(\d+)\s*%', 'gender_non_binary'),
        (r'Not\s+specified[^\d]*?(\d+)\s*%', 'gender_not_specified'),
    ]
    
    for pattern, key in gender_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            stats[key] = int(match.group(1))
            if debug:
                print(f"✓ Found {key}: {stats[key]}")
        else:
            unresolved_fields.append(key)
    
    # Age demographics - enhanced patterns
    age_patterns = [
        (r'(?:under|<\s*|less\s+than\s+)18[^\d]*?(\d+)\s*%', 'age_under_18'),
        (r'18\s*[-–]\s*24[^\d]*?(\d+)\s*%', 'age_18_24'),
        (r'25\s*[-–]\s*34[^\d]*?(\d+)\s*%', 'age_25_34'),
        (r'35\s*[-–]\s*44[^\d]*?(\d+)\s*%', 'age_35_44'),
        (r'45\s*[-–]\s*54[^\d]*?(\d+)\s*%', 'age_45_54'),
        (r'55\s*[-–]\s*64[^\d]*?(\d+)\s*%', 'age_55_64'),
        (r'65\s*\+[^\d]*?(\d+)\s*%', 'age_65_plus'),
    ]
    
    for pattern, key in age_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            stats[key] = int(match.group(1))
            if debug:
                print(f"✓ Found {key}: {stats[key]}")
        else:
            unresolved_fields.append(key)
    
    # === GEOGRAPHY (Cities and Countries) ===
    
    # Parse top cities with listener counts
    # Enhanced pattern with better city name detection
    cities = []
    # Look for patterns in sections likely to contain city/country data
    if re.search(r'(top\s+cities|cities|locations)', text, re.IGNORECASE):
        # Enhanced pattern to handle city names better
        # Look for patterns like "City Name, Country    123" or "City Name    123"
        city_matches = re.finditer(
            r'([A-Z][a-zA-Z\s,\.\-\']+?)\s{2,}(\d+)(?:\s+listeners)?',
            text
        )
        for match in city_matches:
            city_name = match.group(1).strip()
            listeners = int(match.group(2))
            # Filter out likely false positives
            # - Name must be at least MIN_CITY_NAME_LENGTH characters
            # - Must have listeners >= MIN_LISTENERS_COUNT
            # - Must not contain digits in the name
            # - Must not be a generic word like "Active", "Total", etc.
            if (len(city_name) > MIN_CITY_NAME_LENGTH and 
                listeners >= MIN_LISTENERS_COUNT and 
                not re.search(r'\d', city_name) and
                city_name not in GENERIC_WORDS):
                cities.append({'name': city_name, 'listeners': listeners})
        
        if debug and cities:
            print(f"✓ Found {len(cities)} cities")
    
    if cities:
        # Sort by listeners and take top 10
        cities.sort(key=lambda x: x['listeners'], reverse=True)
        stats['top_cities'] = cities[:10]
    else:
        unresolved_fields.append('top_cities')
        if debug:
            print("✗ Cities not found")
    
    # Parse countries (similar approach but more strict on name length)
    countries = []
    if re.search(r'(top\s+countries|countries)', text, re.IGNORECASE):
        country_matches = re.finditer(
            r'([A-Z][a-zA-Z\s\-\']+?)\s{2,}(\d+)(?:\s+listeners)?',
            text
        )
        for match in country_matches:
            country_name = match.group(1).strip()
            listeners = int(match.group(2))
            if (len(country_name) > MIN_COUNTRY_NAME_LENGTH and 
                listeners >= MIN_LISTENERS_COUNT and 
                not re.search(r'\d', country_name) and
                country_name not in GENERIC_WORDS):
                countries.append({'name': country_name, 'listeners': listeners})
        
        if debug and countries:
            print(f"✓ Found {len(countries)} countries")
    
    if countries:
        countries.sort(key=lambda x: x['listeners'], reverse=True)
        stats['top_countries'] = countries[:10]
    else:
        unresolved_fields.append('top_countries')
        if debug:
            print("✗ Countries not found")
    
    # === DISCOVERY SOURCES ===
    
    # Active sources - enhanced pattern
    active_match = re.search(r'Active\s+[Ss]ources?[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if active_match:
        stats['discovery_active_total'] = int(active_match.group(1))
        if debug:
            print(f"✓ Found discovery_active_total: {stats['discovery_active_total']}")
    else:
        unresolved_fields.append('discovery_active_total')
    
    # Programmed sources - enhanced pattern
    programmed_match = re.search(r'Programmed\s+[Ss]ources?[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if programmed_match:
        stats['discovery_programmed_total'] = int(programmed_match.group(1))
        if debug:
            print(f"✓ Found discovery_programmed_total: {stats['discovery_programmed_total']}")
    else:
        unresolved_fields.append('discovery_programmed_total')
    
    # Other sources
    other_sources_match = re.search(r'Other\s+[Ss]ources?[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if other_sources_match:
        stats['discovery_other'] = int(other_sources_match.group(1))
        if debug:
            print(f"✓ Found discovery_other: {stats['discovery_other']}")
    else:
        unresolved_fields.append('discovery_other')
    
    # Active source breakdowns
    artist_profile_match = re.search(r'Artist\s+profile[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if artist_profile_match:
        stats['discovery_artist_profile'] = int(artist_profile_match.group(1))
        if debug:
            print(f"✓ Found discovery_artist_profile: {stats['discovery_artist_profile']}")
    else:
        unresolved_fields.append('discovery_artist_profile')
    
    own_playlists_match = re.search(r'(?:Own|Your)\s+playlists[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if own_playlists_match:
        stats['discovery_own_playlists'] = int(own_playlists_match.group(1))
        if debug:
            print(f"✓ Found discovery_own_playlists: {stats['discovery_own_playlists']}")
    else:
        unresolved_fields.append('discovery_own_playlists')
    
    listener_queue_match = re.search(r'Listener\s+queue[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if listener_queue_match:
        stats['discovery_listener_queue'] = int(listener_queue_match.group(1))
        if debug:
            print(f"✓ Found discovery_listener_queue: {stats['discovery_listener_queue']}")
    else:
        unresolved_fields.append('discovery_listener_queue')
    
    # Programmed source breakdowns
    algorithmic_match = re.search(r'Algorithmic\s+playlists?[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if algorithmic_match:
        stats['discovery_algorithmic_playlists'] = int(algorithmic_match.group(1))
        if debug:
            print(f"✓ Found discovery_algorithmic_playlists: {stats['discovery_algorithmic_playlists']}")
    else:
        unresolved_fields.append('discovery_algorithmic_playlists')
    
    other_playlists_match = re.search(r"(?:Other\s+)?(?:listeners['']?\s+)?playlists?[^\d]*?(\d+)\s*%", text, re.IGNORECASE)
    if other_playlists_match:
        stats['discovery_other_playlists'] = int(other_playlists_match.group(1))
        if debug:
            print(f"✓ Found discovery_other_playlists: {stats['discovery_other_playlists']}")
    else:
        unresolved_fields.append('discovery_other_playlists')
    
    radio_autoplay_match = re.search(r'Radio\s+[&and]*\s*autoplay[^\d]*?(\d+)\s*%', text, re.IGNORECASE)
    if radio_autoplay_match:
        stats['discovery_radio_autoplay'] = int(radio_autoplay_match.group(1))
        if debug:
            print(f"✓ Found discovery_radio_autoplay: {stats['discovery_radio_autoplay']}")
    else:
        unresolved_fields.append('discovery_radio_autoplay')
    
    if debug:
        print(f"\n=== PARSING SUMMARY ===")
        print(f"Extracted {len(stats)} fields")
        print(f"Unresolved {len(unresolved_fields)} fields")
    
    # Store unresolved fields for debugging
    if unresolved_fields:
        stats['_unresolved_fields'] = unresolved_fields
    
    return stats

def aggregate_analytics_data(screenshots_results, timezone_name=DEFAULT_TIMEZONE):
    """
    Aggregate data from multiple screenshots into a unified analytics object
    that matches the format expected by the frontend.
    
    Args:
        screenshots_results: List of screenshot processing results
        timezone_name: Timezone for timestamp (default: UTC)
    """
    # Merge all stats from different screenshots
    merged_stats = {}
    
    for screenshot in screenshots_results:
        stats = screenshot.get('stats', {})
        for key, value in stats.items():
            # Skip internal fields
            if key.startswith('_'):
                continue
            # For lists (cities, countries), combine and deduplicate
            if key in ['top_cities', 'top_countries']:
                if key not in merged_stats:
                    merged_stats[key] = []
                merged_stats[key].extend(value)
            else:
                # For simple values, take the most recent (last in list)
                merged_stats[key] = value
    
    # Consolidate city and country lists
    if 'top_cities' in merged_stats:
        # Combine cities with same name, sum their listeners
        city_map = {}
        for city in merged_stats['top_cities']:
            name = city['name']
            if name in city_map:
                city_map[name]['listeners'] += city['listeners']
            else:
                city_map[name] = city.copy()
        
        # Sort by listeners and take top 10
        merged_stats['top_cities'] = sorted(
            city_map.values(),
            key=lambda x: x['listeners'],
            reverse=True
        )[:10]
    
    if 'top_countries' in merged_stats:
        # Same for countries
        country_map = {}
        for country in merged_stats['top_countries']:
            name = country['name']
            if name in country_map:
                country_map[name]['listeners'] += country['listeners']
            else:
                country_map[name] = country.copy()
        
        merged_stats['top_countries'] = sorted(
            country_map.values(),
            key=lambda x: x['listeners'],
            reverse=True
        )[:10]
    
    # Build the analytics object in the format expected by the frontend
    # Use specified timezone for timestamp
    try:
        tz = pytz.timezone(timezone_name)
        current_time = datetime.now(tz)
    except pytz.exceptions.UnknownTimeZoneError:
        print(f"Warning: Unknown timezone '{timezone_name}', falling back to UTC")
        tz = pytz.UTC
        current_time = datetime.now(tz)
    
    analytics = {
        'period': 'Last 28 Days',
        'dateGenerated': current_time.isoformat(),
        'timezone': timezone_name,
        'coreMetrics': {
            'totalListeners': {
                'value': merged_stats.get('listeners', 0),
                'change': merged_stats.get('listeners_change', '+0%')
            },
            'totalStreams': {
                'value': merged_stats.get('streams', 0),
                'change': merged_stats.get('streams_change', '+0%')
            },
            'streamsPerListener': {
                'value': merged_stats.get('streams_per_listener', 0),
                'change': merged_stats.get('streams_per_listener_change', '+0%')
            },
            'saves': {
                'value': merged_stats.get('saves', 0),
                'change': merged_stats.get('saves_change', '+0%')
            },
            'playlistAdds': {
                'value': merged_stats.get('playlist_adds', 0),
                'change': merged_stats.get('playlist_adds_change', '+0%')
            },
            'followers': {
                'value': merged_stats.get('followers', 0),
                'change': merged_stats.get('followers_change', '+0%')
            }
        },
        'discoverySources': {
            'active': {
                'total': merged_stats.get('discovery_active_total', 0),
                'breakdown': {
                    'artistProfile': merged_stats.get('discovery_artist_profile', 0),
                    'ownPlaylists': merged_stats.get('discovery_own_playlists', 0),
                    'listenerQueue': merged_stats.get('discovery_listener_queue', 0)
                }
            },
            'programmed': {
                'total': merged_stats.get('discovery_programmed_total', 0),
                'breakdown': {
                    'algorithmicPlaylists': merged_stats.get('discovery_algorithmic_playlists', 0),
                    'otherPlaylists': merged_stats.get('discovery_other_playlists', 0),
                    'radioAutoplay': merged_stats.get('discovery_radio_autoplay', 0),
                    'editorialPlaylists': 0,
                    'charts': 0
                }
            },
            'other': merged_stats.get('discovery_other', 0)
        },
        'demographics': {
            'gender': {
                'male': merged_stats.get('gender_male', 0),
                'female': merged_stats.get('gender_female', 0),
                'nonBinary': merged_stats.get('gender_non_binary', 0),
                'notSpecified': merged_stats.get('gender_not_specified', 0)
            },
            'age': {
                'under18': merged_stats.get('age_under_18', 0),
                '18-24': merged_stats.get('age_18_24', 0),
                '25-34': merged_stats.get('age_25_34', 0),
                '35-44': merged_stats.get('age_35_44', 0),
                '45-54': merged_stats.get('age_45_54', 0),
                '55-64': merged_stats.get('age_55_64', 0),
                '65+': merged_stats.get('age_65_plus', 0)
            }
        },
        'topCountries': merged_stats.get('top_countries', []),
        'topCities': merged_stats.get('top_cities', []),
        'insights': generate_insights(merged_stats)
    }
    
    return analytics

def generate_insights(stats):
    """
    Generate insights based on the parsed statistics.
    """
    insights = []
    
    # Helper function to safely parse percentage change
    def parse_change(change_str):
        try:
            return int(change_str.replace('+', '').replace('-', '').replace('%', ''))
        except (ValueError, AttributeError):
            return 0
    
    # Analyze listener growth
    listeners_change = stats.get('listeners_change', '+0%')
    if listeners_change.startswith('+'):
        change_val = parse_change(listeners_change)
        if change_val > 30:
            insights.append("Listener growth is accelerating")
        elif change_val > 10:
            insights.append("Listener growth is steady")
        else:
            insights.append("Listener base is stable")
    elif listeners_change.startswith('-'):
        insights.append("Listener numbers have declined slightly")
    
    # Analyze streams per listener
    spl_change = stats.get('streams_per_listener_change', '+0%')
    if spl_change:
        change_val = abs(parse_change(spl_change))
        if change_val < 5:
            insights.append("Streams per listener are stable (repeat engagement)")
    
    # Analyze saves and playlist adds
    saves_change = stats.get('saves_change', '+0%')
    playlist_change = stats.get('playlist_adds_change', '+0%')
    
    saves_val = parse_change(saves_change)
    playlist_val = parse_change(playlist_change)
    
    if saves_val > 50 or playlist_val > 50:
        insights.append("Saves and playlist adds are outpacing listener growth")
    
    # Analyze discovery sources
    active_total = stats.get('discovery_active_total', 0)
    programmed_total = stats.get('discovery_programmed_total', 0)
    
    if active_total > programmed_total and active_total > 50:
        insights.append("Discovery is primarily organic/human-driven")
    
    if programmed_total > 0 and programmed_total < 20:
        insights.append("Algorithmic amplification is minimal but present")
    elif programmed_total > 30:
        insights.append("Algorithmic playlists are driving significant discovery")
    
    # Analyze geography
    if 'top_cities' in stats and stats['top_cities']:
        top_city = stats['top_cities'][0]
        insights.append(f"Audience concentration strongest in {top_city['name']}")
    
    # Default insight if no data
    if not insights:
        insights.append("Data is being collected and analyzed")
    
    return insights

def process_screenshots_folder(screenshots_dir, output_file, debug=False, timezone_name=DEFAULT_TIMEZONE):
    """
    Process all images in the screenshots folder and save results to JSON.
    
    Args:
        screenshots_dir: Directory containing screenshots
        output_file: Path to output JSON file
        debug: If True, enable debug output and save debug images
        timezone_name: Timezone for timestamps (default: UTC)
    """
    screenshots_path = Path(screenshots_dir)
    
    # Use specified timezone for timestamps
    try:
        tz = pytz.timezone(timezone_name)
        current_time = datetime.now(tz)
    except pytz.exceptions.UnknownTimeZoneError:
        print(f"Warning: Unknown timezone '{timezone_name}', falling back to UTC")
        tz = pytz.UTC
        current_time = datetime.now(tz)
    
    results = {
        'processed_at': current_time.isoformat(),
        'timezone': timezone_name,
        'screenshots': []
    }
    
    # Get all image files
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp'}
    image_files = [
        f for f in screenshots_path.iterdir()
        if f.is_file() and f.suffix.lower() in image_extensions
    ]
    
    print(f"Found {len(image_files)} image(s) to process...")
    if debug:
        print("Debug mode enabled - saving preprocessing steps")
    
    # Track all unresolved fields across all screenshots
    all_unresolved = set()
    
    for image_file in sorted(image_files):
        print(f"\nProcessing: {image_file.name}")
        
        text = extract_text_from_image(image_file, preprocess=True, debug=debug)
        stats = parse_spotify_stats(text, debug=debug)
        
        # Track unresolved fields
        if '_unresolved_fields' in stats:
            all_unresolved.update(stats['_unresolved_fields'])
            # Remove the internal field before saving
            unresolved_list = stats.pop('_unresolved_fields')
        else:
            unresolved_list = []
        
        if stats:
            result_entry = {
                'filename': image_file.name,
                'stats': stats,
                'extracted_text_preview': text[:200].replace('\n', ' '),
                'unresolved_fields': unresolved_list
            }
            results['screenshots'].append(result_entry)
            print(f"  ✓ Extracted {len(stats)} stat(s)")
            if unresolved_list and debug:
                print(f"  ⚠ {len(unresolved_list)} unresolved fields")
        else:
            # Still record files that were processed but had no extractable stats
            result_entry = {
                'filename': image_file.name,
                'stats': {},
                'extracted_text_preview': text[:200].replace('\n', ' ') if text else 'No text extracted',
                'note': 'No stats found in this screenshot',
                'unresolved_fields': unresolved_list
            }
            results['screenshots'].append(result_entry)
            print(f"  ⚠ No stats found in {image_file.name}")
    
    # Save unresolved fields summary for debugging
    if all_unresolved:
        results['unresolved_fields_summary'] = sorted(list(all_unresolved))
        print(f"\n⚠ Total unique unresolved fields: {len(all_unresolved)}")
        if debug:
            print(f"Unresolved fields: {', '.join(sorted(all_unresolved))}")
    
    # Generate aggregated analytics from all screenshots
    print("\n📊 Aggregating analytics data...")
    analytics = aggregate_analytics_data(results['screenshots'], timezone_name=timezone_name)
    results['analytics'] = analytics
    print("✓ Analytics data aggregated")
    
    # Save results to JSON
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✓ Results saved to {output_file}")
    print(f"Total screenshots processed: {len(image_files)}")
    stats_found = sum(1 for item in results['screenshots'] if item['stats'])
    print(f"Screenshots with extractable stats: {stats_found}")
    
    # Save unresolved fields to a separate debug file
    if all_unresolved:
        debug_file = output_path.parent / 'unresolved-fields-debug.json'
        with open(debug_file, 'w') as f:
            json.dump({
                'timestamp': current_time.isoformat(),
                'timezone': timezone_name,
                'unresolved_fields': sorted(list(all_unresolved)),
                'count': len(all_unresolved),
                'note': 'These fields were attempted but could not be extracted from the screenshots'
            }, f, indent=2)
        print(f"✓ Debug info saved to {debug_file}")
    
    # Save results to JSON
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✓ Results saved to {output_file}")
    print(f"Total screenshots processed: {len(image_files)}")
    stats_found = sum(1 for item in results['screenshots'] if item['stats'])
    print(f"Screenshots with extractable stats: {stats_found}")
    
    # Delete all processed screenshots to prevent conflicting data in future runs
    if image_files:
        print(f"\nCleaning up {len(image_files)} processed screenshot(s)...")
        for image_file in image_files:
            try:
                image_file.unlink()
                print(f"  ✓ Deleted: {image_file.name}")
            except Exception as e:
                print(f"  ⚠ Failed to delete {image_file.name}: {e}")
        print("✓ Screenshot cleanup complete")
    
    return results

def main():
    """Main entry point for the script."""
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Parse Spotify statistics from screenshots using OCR'
    )
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug mode with verbose output and intermediate images'
    )
    parser.add_argument(
        '--timezone',
        type=str,
        default=DEFAULT_TIMEZONE,
        help=f'Timezone for timestamps (default: {DEFAULT_TIMEZONE}). Examples: UTC, America/New_York, Europe/London'
    )
    parser.add_argument(
        '--screenshots-dir',
        type=str,
        help='Directory containing screenshots (default: screenshots/)'
    )
    parser.add_argument(
        '--output-file',
        type=str,
        help='Output JSON file path (default: data/parsed-stats.json)'
    )
    
    args = parser.parse_args()
    
    # Get the repository root (assuming script is in scripts/)
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    screenshots_dir = Path(args.screenshots_dir) if args.screenshots_dir else repo_root / 'screenshots'
    output_file = Path(args.output_file) if args.output_file else repo_root / 'data' / 'parsed-stats.json'
    
    print("=" * 60)
    print("Spotify Screenshot Stats Parser")
    print("=" * 60)
    print(f"Screenshots directory: {screenshots_dir}")
    print(f"Output file: {output_file}")
    print(f"Timezone: {args.timezone}")
    print(f"Debug mode: {'ON' if args.debug else 'OFF'}")
    print("=" * 60)
    print()
    
    if not screenshots_dir.exists():
        print(f"Error: Screenshots directory not found: {screenshots_dir}")
        return 1
    
    try:
        results = process_screenshots_folder(
            screenshots_dir, 
            output_file,
            debug=args.debug,
            timezone_name=args.timezone
        )
        return 0
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit(main())
