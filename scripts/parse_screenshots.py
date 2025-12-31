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
    Looks for patterns like:
    - Playlist Adds: number
    - Followers: number
    - Streams: number
    - Listeners: number
    """
    stats = {}
    
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
    streams_match = re.search(r'(?:^|\n)\s*Streams[^\d/]*(\d+)', text, re.IGNORECASE | re.MULTILINE)
    if streams_match:
        stats['streams'] = int(streams_match.group(1))
    
    # Pattern for "Listeners" followed by number
    listeners_match = re.search(r'Listeners[^\d]*(\d+)', text, re.IGNORECASE)
    if listeners_match:
        stats['listeners'] = int(listeners_match.group(1))
    
    # Pattern for "Streams / Listener" ratio
    streams_per_listener_match = re.search(r'Streams\s*/\s*Listener[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
    if streams_per_listener_match:
        stats['streams_per_listener'] = float(streams_per_listener_match.group(1))
    
    # Pattern for "Saves"
    saves_match = re.search(r'Saves[^\d]*(\d+)', text, re.IGNORECASE)
    if saves_match:
        stats['saves'] = int(saves_match.group(1))
    
    return stats

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
            print(f"  ⚠ No stats found in {image_file.name}")
    
    # Save results to JSON
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✓ Results saved to {output_file}")
    print(f"Total screenshots processed: {len(results['screenshots'])}")
    
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
