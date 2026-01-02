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
from PIL import Image

# Constants for geography parsing
MIN_CITY_NAME_LENGTH = 2
MIN_COUNTRY_NAME_LENGTH = 3
MIN_LISTENERS_COUNT = 1
GENERIC_WORDS = {'Active', 'Total', 'Streams', 'Male', 'Female', 'Age', 'Sources', 'Listeners'}

def extract_text_from_image(image_path):
    """Extract text from an image using Tesseract OCR."""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return ""

def parse_spotify_stats(text):
    """
    Parse Spotify statistics from OCR text.
    Extracts core metrics, demographics, geography, and discovery sources.
    """
    stats = {}
    
    # === CORE METRICS ===
    
    # Try to extract all three main metrics from a single line pattern first
    # Pattern: "Listeners Streams ... 427 2,476 5.8" or similar
    triple_metrics_match = re.search(
        r'Listeners\s+Streams\s+(?:Strea|Stream)[^\d]*(\d{1,3}(?:,?\d{3})*)\s+(\d{1,3}(?:,\d{3})*)\s+(\d+\.?\d*)',
        text,
        re.IGNORECASE
    )
    if triple_metrics_match:
        stats['listeners'] = int(triple_metrics_match.group(1).replace(',', ''))
        stats['streams'] = int(triple_metrics_match.group(2).replace(',', ''))
        stats['streams_per_listener'] = float(triple_metrics_match.group(3))
    
    # Look for "Playlist Adds Followers" pattern with two numbers on the next line
    # This handles the case where both metrics appear together
    playlist_followers_match = re.search(
        r'Playlist\s+Adds\s+Followers[^\d]*(\d+)\s+(\d+)',
        text,
        re.IGNORECASE
    )
    if playlist_followers_match:
        stats['playlist_adds'] = int(playlist_followers_match.group(1))
        stats['followers'] = int(playlist_followers_match.group(2))
    else:
        # Try individual patterns if the combined pattern doesn't match
        # Pattern for "Playlist Adds" followed by number
        playlist_adds_match = re.search(r'Playlist\s+Adds[^\d]*(\d+)', text, re.IGNORECASE)
        if playlist_adds_match:
            stats['playlist_adds'] = int(playlist_adds_match.group(1))
        
        # Pattern for "Followers" followed by number (last occurrence to avoid header)
        followers_matches = list(re.finditer(r'Followers[^\d]*(\d+)', text, re.IGNORECASE))
        if followers_matches:
            # Use the last match to avoid matching headers
            stats['followers'] = int(followers_matches[-1].group(1))
    
    # Pattern for "Streams" - be careful not to match "Streams / Listener"
    # Handle comma-separated numbers like 2,476
    # Only use this if we didn't get streams from the triple match above
    if 'streams' not in stats:
        streams_match = re.search(r'(?:^|\n)\s*Streams[^\d/]*(\d{1,3}(?:,\d{3})*)', text, re.IGNORECASE | re.MULTILINE)
        if streams_match:
            stats['streams'] = int(streams_match.group(1).replace(',', ''))
    
    # Pattern for "Listeners" followed by number
    # Only use this if we didn't get listeners from the triple match above
    if 'listeners' not in stats:
        listeners_match = re.search(r'Listeners[^\d]*(\d{1,3}(?:,?\d{3})*)', text, re.IGNORECASE)
        if listeners_match:
            stats['listeners'] = int(listeners_match.group(1).replace(',', ''))
    
    # Pattern for "Streams / Listener" ratio
    # Only use this if we didn't get it from the triple match above
    if 'streams_per_listener' not in stats:
        streams_per_listener_match = re.search(r'Streams\s*/\s*Listener[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if streams_per_listener_match:
            stats['streams_per_listener'] = float(streams_per_listener_match.group(1))
    
    # Pattern for "Saves"
    saves_match = re.search(r'Saves[^\d]*(\d{1,3}(?:,?\d{3})*)', text, re.IGNORECASE)
    if saves_match:
        stats['saves'] = int(saves_match.group(1).replace(',', ''))
    
    # Parse change percentages (e.g., "+40%", "-5%", "38%")
    # These appear right after the main values in the screenshots
    change_patterns = [
        (r'Listeners[^\d]*\d+[^\d]*([\+\-]?\d+)%', 'listeners_change'),
        (r'Streams[^\d/]*\d+[^\d]*([\+\-]?\d+)%', 'streams_change'),
        (r'Streams\s*/\s*Listener[^\d]*\d+(?:\.\d+)?[^\d]*([\+\-]?\d+)%', 'streams_per_listener_change'),
        (r'Saves[^\d]*\d+[^\d]*([\+\-]?\d+)%', 'saves_change'),
        (r'Playlist\s+Adds[^\d]*\d+[^\d]*([\+\-]?\d+)%', 'playlist_adds_change'),
        (r'Followers[^\d]*\d+[^\d]*([\+\-]?\d+)%', 'followers_change'),
    ]
    
    for pattern, key in change_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            change_val = match.group(1)
            # Add + sign if not present
            if not change_val.startswith(('+', '-')):
                change_val = '+' + change_val
            stats[key] = change_val + '%'
    
    # === DEMOGRAPHICS ===
    
    # Gender demographics
    gender_patterns = [
        (r'Male[^\d]*(\d+)%', 'gender_male'),
        (r'Female[^\d]*(\d+)%', 'gender_female'),
        (r'Non[- ]?binary[^\d]*(\d+)%', 'gender_non_binary'),
        (r'Not\s+specified[^\d]*(\d+)%', 'gender_not_specified'),
    ]
    
    for pattern, key in gender_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            stats[key] = int(match.group(1))
    
    # Age demographics
    age_patterns = [
        (r'(?:under|<\s*|less\s+than\s+)18[^\d]*(\d+)%', 'age_under_18'),
        (r'18[-\s]*24[^\d]*(\d+)%', 'age_18_24'),
        (r'25[-\s]*34[^\d]*(\d+)%', 'age_25_34'),
        (r'35[-\s]*44[^\d]*(\d+)%', 'age_35_44'),
        (r'45[-\s]*54[^\d]*(\d+)%', 'age_45_54'),
        (r'55[-\s]*64[^\d]*(\d+)%', 'age_55_64'),
        (r'65\+[^\d]*(\d+)%', 'age_65_plus'),
    ]
    
    for pattern, key in age_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            stats[key] = int(match.group(1))
    
    # === GEOGRAPHY (Cities and Countries) ===
    
    # Parse top cities with listener counts
    # Look for city names followed by numbers
    # This is a heuristic approach - city names typically start with capital letter
    # and are followed by a number representing listener count
    cities = []
    # Common pattern: "City Name    123" or "City, State    123"
    # Look for patterns in sections likely to contain city/country data
    if re.search(r'(top\s+cities|cities|locations)', text, re.IGNORECASE):
        city_matches = re.finditer(
            r'([A-Z][a-zA-Z\s,\-\']+?)\s+(\d+)(?:\s+listeners)?',
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
    
    if cities:
        # Sort by listeners and take top 10
        cities.sort(key=lambda x: x['listeners'], reverse=True)
        stats['top_cities'] = cities[:10]
    
    # Parse countries (similar approach but more strict on name length)
    countries = []
    if re.search(r'(top\s+countries|countries)', text, re.IGNORECASE):
        country_matches = re.finditer(
            r'([A-Z][a-zA-Z\s\-\']+?)\s+(\d+)(?:\s+listeners)?',
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
    
    if countries:
        countries.sort(key=lambda x: x['listeners'], reverse=True)
        stats['top_countries'] = countries[:10]
    
    # === DISCOVERY SOURCES ===
    
    # Active sources
    active_match = re.search(r'Active\s+[Ss]ources?[^\d]*(\d+)%', text, re.IGNORECASE)
    if active_match:
        stats['discovery_active_total'] = int(active_match.group(1))
    
    # Programmed sources
    programmed_match = re.search(r'Programmed\s+[Ss]ources?[^\d]*(\d+)%', text, re.IGNORECASE)
    if programmed_match:
        stats['discovery_programmed_total'] = int(programmed_match.group(1))
    
    # Other sources
    other_sources_match = re.search(r'Other\s+[Ss]ources?[^\d]*(\d+)%', text, re.IGNORECASE)
    if other_sources_match:
        stats['discovery_other'] = int(other_sources_match.group(1))
    
    # Active source breakdowns
    # Look for more specific patterns that include "and catalog" or "and library"
    artist_profile_match = re.search(r'Artist\s+profile\s+(?:and\s+catalog)?[^\d]*(\d+)%', text, re.IGNORECASE)
    if artist_profile_match:
        stats['discovery_artist_profile'] = int(artist_profile_match.group(1))
    
    # Match "Listener's own playlists and library" specifically
    # Handle both straight quote (') and curly quote (')
    own_playlists_match = re.search(r"Listener(?:'|\u2019)?s?\s+own\s+playlists?\s+(?:and\s+library)?[^\d]*(\d+)%", text, re.IGNORECASE)
    if own_playlists_match:
        stats['discovery_own_playlists'] = int(own_playlists_match.group(1))
    
    # Match "Listener's queue" specifically
    listener_queue_match = re.search(r"Listener(?:'|\u2019)?s?\s+queue[^\d]*(\d+)%", text, re.IGNORECASE)
    if listener_queue_match:
        stats['discovery_listener_queue'] = int(listener_queue_match.group(1))
    
    # Programmed source breakdowns
    algorithmic_match = re.search(r'Algorithmic\s+playlists?[^\d]*(\d+)%', text, re.IGNORECASE)
    if algorithmic_match:
        stats['discovery_algorithmic_playlists'] = int(algorithmic_match.group(1))
    
    other_playlists_match = re.search(r"(?:Other\s+)?(?:listeners['']?\s+)?playlists?[^\d]*(\d+)%", text, re.IGNORECASE)
    if other_playlists_match:
        stats['discovery_other_playlists'] = int(other_playlists_match.group(1))
    
    radio_autoplay_match = re.search(r'Radio\s+[&and]*\s*autoplay[^\d]*(\d+)%', text, re.IGNORECASE)
    if radio_autoplay_match:
        stats['discovery_radio_autoplay'] = int(radio_autoplay_match.group(1))
    
    return stats

def aggregate_analytics_data(screenshots_results):
    """
    Aggregate data from multiple screenshots into a unified analytics object
    that matches the format expected by the frontend.
    """
    # Merge all stats from different screenshots
    # Strategy: Use FIRST value found for each metric (first screenshot usually has the overview)
    merged_stats = {}
    
    for screenshot in screenshots_results:
        stats = screenshot.get('stats', {})
        for key, value in stats.items():
            # For lists (cities, countries), combine and deduplicate
            if key in ['top_cities', 'top_countries']:
                if key not in merged_stats:
                    merged_stats[key] = []
                merged_stats[key].extend(value)
            else:
                # For simple values, use FIRST occurrence (not last)
                # This prioritizes the overview screenshots which appear first
                if key not in merged_stats:
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
    analytics = {
        'period': 'Last 28 Days',
        'dateGenerated': datetime.now(timezone.utc).isoformat(),
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

def process_screenshots_folder(screenshots_dir, output_file):
    """
    Process all images in the screenshots folder and save results to JSON.
    """
    screenshots_path = Path(screenshots_dir)
    results = {
        'processed_at': datetime.now(timezone.utc).isoformat(),
        'screenshots': []
    }
    
    # Get all image files
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp'}
    image_files = [
        f for f in screenshots_path.iterdir()
        if f.is_file() and f.suffix.lower() in image_extensions
    ]
    
    print(f"Found {len(image_files)} image(s) to process...")
    
    for image_file in sorted(image_files):
        print(f"Processing: {image_file.name}")
        
        text = extract_text_from_image(image_file)
        stats = parse_spotify_stats(text)
        
        if stats:
            result_entry = {
                'filename': image_file.name,
                'stats': stats,
                'extracted_text_preview': text[:200].replace('\n', ' ')
            }
            results['screenshots'].append(result_entry)
            print(f"  ✓ Extracted {len(stats)} stat(s): {', '.join(stats.keys())}")
        else:
            # Still record files that were processed but had no extractable stats
            result_entry = {
                'filename': image_file.name,
                'stats': {},
                'extracted_text_preview': text[:200].replace('\n', ' ') if text else 'No text extracted',
                'note': 'No stats found in this screenshot'
            }
            results['screenshots'].append(result_entry)
            print(f"  ⚠ No stats found in {image_file.name}")
    
    # Generate aggregated analytics from all screenshots
    print("\n📊 Aggregating analytics data...")
    analytics = aggregate_analytics_data(results['screenshots'])
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
    # Get the repository root (assuming script is in scripts/)
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    screenshots_dir = repo_root / 'screenshots'
    output_file = repo_root / 'data' / 'parsed-stats.json'
    
    print("=" * 60)
    print("Spotify Screenshot Stats Parser")
    print("=" * 60)
    print(f"Screenshots directory: {screenshots_dir}")
    print(f"Output file: {output_file}")
    print("=" * 60)
    print()
    
    if not screenshots_dir.exists():
        print(f"Error: Screenshots directory not found: {screenshots_dir}")
        return 1
    
    try:
        results = process_screenshots_folder(screenshots_dir, output_file)
        return 0
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit(main())
