#!/usr/bin/env python3
"""
Generate Ground Truth JSON Files from example_text

This script parses the example_text file containing ground truth data
and generates individual JSON files for each example screenshot.
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, List


def parse_example_text(text_content: str) -> Dict[str, Any]:
    """
    Parse the example_text file and extract all metrics.
    Returns a dictionary with all the ground truth data.
    """
    stats = {}
    
    # Core Metrics
    # Listeners
    match = re.search(r'Total listeners:\s*(\d+,?\d*)', text_content)
    if match:
        stats['listeners'] = int(match.group(1).replace(',', ''))
    
    match = re.search(r'Change vs previous period:\s*([\+\-]\d+)%', text_content)
    if match:
        stats['listeners_change'] = match.group(1) + '%'
    
    # Streams
    match = re.search(r'Total streams:\s*(\d+,?\d*)', text_content)
    if match:
        stats['streams'] = int(match.group(1).replace(',', ''))
    
    # Find streams change - need to be careful to get the right one
    streams_section = re.search(r'Streams:.*?Change vs previous period:\s*([\+\-]\d+)%', 
                               text_content, re.DOTALL)
    if streams_section:
        stats['streams_change'] = streams_section.group(1) + '%'
    
    # Streams per listener
    match = re.search(r'Streams per listener:\s*(\d+\.?\d*)', text_content)
    if match:
        stats['streams_per_listener'] = float(match.group(1))
    
    # Streams per listener change
    spl_section = re.search(r'Streams per Listener:.*?Change vs previous period:\s*([\+\-]\d+)%', 
                           text_content, re.DOTALL)
    if spl_section:
        stats['streams_per_listener_change'] = spl_section.group(1) + '%'
    
    # Saves
    match = re.search(r'Total saves:\s*(\d+,?\d*)', text_content)
    if match:
        stats['saves'] = int(match.group(1).replace(',', ''))
    
    saves_section = re.search(r'Saves:.*?Change vs previous period:\s*([\+\-]\d+)%', 
                             text_content, re.DOTALL)
    if saves_section:
        stats['saves_change'] = saves_section.group(1) + '%'
    
    # Playlist Adds
    match = re.search(r'Total playlist adds:\s*(\d+,?\d*)', text_content)
    if match:
        stats['playlist_adds'] = int(match.group(1).replace(',', ''))
    
    playlist_section = re.search(r'Playlist Adds:.*?Change vs previous period:\s*([\+\-]\d+)%', 
                                text_content, re.DOTALL)
    if playlist_section:
        stats['playlist_adds_change'] = playlist_section.group(1) + '%'
    
    # Followers
    match = re.search(r'Total followers:\s*(\d+,?\d*)', text_content)
    if match:
        stats['followers'] = int(match.group(1).replace(',', ''))
    
    followers_section = re.search(r'Followers:.*?Change vs previous period:\s*([\+\-]\d+)%', 
                                 text_content, re.DOTALL)
    if followers_section:
        stats['followers_change'] = followers_section.group(1) + '%'
    
    # Discovery Sources - Active
    match = re.search(r'All Active Sources \((\d+)%\)', text_content)
    if match:
        stats['discovery_active_total'] = int(match.group(1))
    
    match = re.search(r'Artist profile and catalog:\s*(\d+)%', text_content)
    if match:
        stats['discovery_artist_profile'] = int(match.group(1))
    
    match = re.search(r"Listener[''\u2019]s own playlists and library:\s*(\d+)%", text_content)
    if match:
        stats['discovery_own_playlists'] = int(match.group(1))
    
    match = re.search(r"Listener[''\u2019]s queue:\s*(\d+)%", text_content)
    if match:
        stats['discovery_listener_queue'] = int(match.group(1))
    
    # Discovery Sources - Programmed
    match = re.search(r'All Programmed Sources \((\d+)%\)', text_content)
    if match:
        stats['discovery_programmed_total'] = int(match.group(1))
    
    match = re.search(r'Algorithmic playlists and mixes:\s*(\d+)%', text_content)
    if match:
        stats['discovery_algorithmic_playlists'] = int(match.group(1))
    
    match = re.search(r"Other listeners[''\u2019] playlists:\s*(\d+)%", text_content)
    if match:
        stats['discovery_other_playlists'] = int(match.group(1))
    
    match = re.search(r'Radio and autoplay:\s*(\d+)%', text_content)
    if match:
        stats['discovery_radio_autoplay'] = int(match.group(1))
    
    # Discovery Sources - Other
    match = re.search(r'Other Sources:.*?Other:\s*(\d+)%', text_content, re.DOTALL)
    if match:
        stats['discovery_other'] = int(match.group(1))
    
    # Demographics - Gender
    match = re.search(r'Male:\s*(\d+)%', text_content)
    if match:
        stats['gender_male'] = int(match.group(1))
    
    match = re.search(r'Female:\s*(\d+)%', text_content)
    if match:
        stats['gender_female'] = int(match.group(1))
    
    match = re.search(r'Non-binary:\s*(\d+)%', text_content)
    if match:
        stats['gender_non_binary'] = int(match.group(1))
    
    match = re.search(r'Not specified:\s*(\d+)%', text_content)
    if match:
        stats['gender_not_specified'] = int(match.group(1))
    
    # Demographics - Age
    match = re.search(r'Under 18:\s*(\d+)%', text_content)
    if match:
        stats['age_under_18'] = int(match.group(1))
    
    match = re.search(r'Ages 18[–\-]24:\s*(\d+)%', text_content)
    if match:
        stats['age_18_24'] = int(match.group(1))
    
    match = re.search(r'Ages 25[–\-]34:\s*(\d+)%', text_content)
    if match:
        stats['age_25_34'] = int(match.group(1))
    
    match = re.search(r'Ages 35[–\-]44:\s*(\d+)%', text_content)
    if match:
        stats['age_35_44'] = int(match.group(1))
    
    match = re.search(r'Ages 45[–\-]54:\s*(\d+)%', text_content)
    if match:
        stats['age_45_54'] = int(match.group(1))
    
    match = re.search(r'Ages 55[–\-]64:\s*(\d+)%', text_content)
    if match:
        stats['age_55_64'] = int(match.group(1))
    
    match = re.search(r'Ages 65 and over:\s*(\d+)%', text_content)
    if match:
        stats['age_65_plus'] = int(match.group(1))
    
    # Geography - Countries
    countries = []
    countries_section = re.search(r'Top Countries by Listeners:(.*?)(?:⸻|TOP CITIES)', 
                                 text_content, re.DOTALL)
    if countries_section:
        country_matches = re.finditer(r'(\d+)\.\s+([^:]+):\s*(\d+)\s+listeners?', 
                                     countries_section.group(1))
        for match in country_matches:
            countries.append({
                'name': match.group(2).strip(),
                'listeners': int(match.group(3))
            })
    if countries:
        stats['top_countries'] = countries
    
    # Geography - Cities
    cities = []
    cities_section = re.search(r'TOP CITIES BY LISTENERS(.*?)(?:⸻|$)', 
                              text_content, re.DOTALL)
    if cities_section:
        city_matches = re.finditer(r'(\d+)\.\s+([^,]+),\s*([^:]+):\s*(\d+)', 
                                  cities_section.group(1))
        for match in city_matches:
            city_name = match.group(2).strip()
            country = match.group(3).strip()
            listeners = int(match.group(4))
            cities.append({
                'name': f"{city_name}, {country}",
                'listeners': listeners
            })
    if cities:
        stats['top_cities'] = cities
    
    return stats


def create_ground_truth_json(image_name: str, stats: Dict[str, Any], 
                            description: str) -> Dict[str, Any]:
    """
    Create a ground truth JSON structure for an image.
    """
    return {
        "description": description,
        "expected_stats": stats,
        "notes": "Generated from example_text file containing ground truth data"
    }


def main():
    """Main entry point."""
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    examples_dir = repo_root / 'screenshots' / 'examples'
    example_text_path = examples_dir / 'example_text'
    
    print("=" * 70)
    print("Ground Truth JSON Generator")
    print("=" * 70)
    
    # Read example_text file
    if not example_text_path.exists():
        print(f"✗ Error: example_text file not found at {example_text_path}")
        return 1
    
    with open(example_text_path, 'r', encoding='utf-8') as f:
        text_content = f.read()
    
    print(f"✓ Loaded example_text file ({len(text_content)} characters)")
    
    # Parse the text to extract all metrics
    print("\nParsing ground truth data...")
    all_stats = parse_example_text(text_content)
    
    print(f"✓ Extracted {len(all_stats)} metrics from example_text")
    print("\nMetrics found:")
    for key in sorted(all_stats.keys()):
        value = all_stats[key]
        if isinstance(value, list):
            print(f"  - {key}: {len(value)} items")
        else:
            print(f"  - {key}: {value}")
    
    # Find all example images
    image_files = sorted([f for f in examples_dir.iterdir() 
                         if f.name.startswith('IMG_') and f.suffix.lower() == '.png'])
    
    print(f"\n✓ Found {len(image_files)} example images")
    
    # Since we don't know which screenshot shows which specific data,
    # we'll create a comprehensive JSON for all images that includes all metrics.
    # The validation script will check which fields are actually extractable.
    
    print("\nGenerating JSON files for all images with complete ground truth data...")
    
    for i, image_file in enumerate(image_files, 1):
        json_file = image_file.with_suffix('.json')
        
        # Create description
        description = f"Spotify analytics screenshot {i} of {len(image_files)} - Contains complete ground truth data from example_text"
        
        # Create the JSON structure
        ground_truth = create_ground_truth_json(
            image_file.name,
            all_stats.copy(),
            description
        )
        
        # Write the JSON file
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(ground_truth, f, indent=2)
        
        print(f"  ✓ Created {json_file.name}")
    
    print(f"\n✓ Successfully generated {len(image_files)} JSON files")
    print("\nNext steps:")
    print("  1. Review the generated JSON files in screenshots/examples/")
    print("  2. Run: python scripts/validate_ocr_examples.py")
    print("  3. Adjust individual JSON files based on what each screenshot actually shows")
    
    return 0


if __name__ == '__main__':
    try:
        exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user")
        exit(130)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
