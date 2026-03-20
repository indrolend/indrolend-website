# Spotify Stats Module

"""
Consolidated module for Spotify API calls and OCR analytics parsing.
- All Spotify API and OCR parsing logic will be refactored and moved here.
- Provides reusable, maintainable functions for analytics workflows.
"""

# Example structure (Python)

# Imports
import requests
import json


# --- Spotify API Logic ---
import os
import requests
import json
from datetime import datetime, timezone

SPOTIFY_API_BASE = "https://api.spotify.com/v1"

def get_access_token(client_id, client_secret):
    """Get Spotify access token using Client Credentials Flow."""
    auth_str = f"{client_id}:{client_secret}"
    b64_auth = base64.b64encode(auth_str.encode()).decode()
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {b64_auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={"grant_type": "client_credentials"}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def fetch_artist_data(artist_id, access_token):
    url = f"{SPOTIFY_API_BASE}/artists/{artist_id}"
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()

def fetch_artist_top_tracks(artist_id, access_token, market="US"):
    url = f"{SPOTIFY_API_BASE}/artists/{artist_id}/top-tracks?market={market}"
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()

def format_spotify_response(artist_data, top_tracks_data):
    return {
        "artist": {
            "name": artist_data["name"],
            "followers": artist_data["followers"]["total"],
            "popularity": artist_data["popularity"],
            "genres": artist_data["genres"],
            "images": artist_data["images"],
            "spotifyUrl": artist_data["external_urls"]["spotify"]
        },
        "topTracks": [
            {
                "name": track["name"],
                "album": track["album"]["name"],
                "albumImage": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
                "previewUrl": track["preview_url"],
                "spotifyUrl": track["external_urls"]["spotify"],
                "duration": track["duration_ms"]
            }
            for track in top_tracks_data["tracks"][:5]
        ],
        "lastFetched": datetime.now(timezone.utc).isoformat()
    }

# --- OCR Parsing Logic ---
import re
from PIL import Image
import pytesseract

def extract_text_from_image(image_path):
    """Extract text from an image using Tesseract OCR."""
    img = Image.open(image_path)
    return pytesseract.image_to_string(img)

def parse_spotify_stats(text):
    """Parse Spotify statistics from OCR text."""
    stats = {}
    # Core metrics
    playlist_adds_match = re.search(r'Playlist\s+Adds[^\d]*(\d+)', text, re.IGNORECASE)
    if playlist_adds_match:
        stats['playlist_adds'] = int(playlist_adds_match.group(1))
    followers_match = re.search(r'Followers[^\d]*(\d+)', text, re.IGNORECASE)
    if followers_match:
        stats['followers'] = int(followers_match.group(1))
    streams_match = re.search(r'(?:^|\n)\s*Streams[^\d/]*(\d+,?\d*)', text, re.IGNORECASE | re.MULTILINE)
    if streams_match:
        stats['streams'] = int(streams_match.group(1).replace(',', ''))
    listeners_match = re.search(r'Listeners[^\d]*(\d+,?\d*)', text, re.IGNORECASE)
    if listeners_match:
        stats['listeners'] = int(listeners_match.group(1).replace(',', ''))
    # Add more parsing as needed (demographics, geography, etc.)
    return stats

def validate_ocr_stats(image_path, ground_truth):
    """Validate OCR parsing against ground truth."""
    text = extract_text_from_image(image_path)
    actual_stats = parse_spotify_stats(text)
    results = {}
    for field, expected_val in ground_truth.items():
        actual_val = actual_stats.get(field)
        results[field] = (actual_val == expected_val)
    return results

# --- Analytics Functions ---
def analyze_spotify_stats(artist_stats, ocr_stats):
    """Combine Spotify stats and OCR stats for analytics."""
    # Example: match song names, count streams, etc.
    return {
        'matched_songs': [],
        'total_streams': artist_stats.get('streams', 0),
        'ocr_streams': ocr_stats.get('streams', 0),
        # ...
    }

# --- Main entry point ---
if __name__ == "__main__":
    # Example usage
    # Spotify API
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    artist_id = os.getenv("SPOTIFY_ARTIST_ID")
    access_token = get_access_token(client_id, client_secret)
    artist_data = fetch_artist_data(artist_id, access_token)
    top_tracks = fetch_artist_top_tracks(artist_id, access_token)
    spotify_response = format_spotify_response(artist_data, top_tracks)
    print("Spotify API Response:", spotify_response)

    # OCR Parsing
    ocr_image_path = "example_screenshot.png"
    ocr_text = extract_text_from_image(ocr_image_path)
    ocr_stats = parse_spotify_stats(ocr_text)
    print("OCR Stats:", ocr_stats)

    # Analytics
    analytics = analyze_spotify_stats(artist_data, ocr_stats)
    print("Analytics:", analytics)
