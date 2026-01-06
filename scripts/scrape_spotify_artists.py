#!/usr/bin/env python3
"""
Spotify for Artists Stats Scraper

This script uses Selenium to log into Spotify for Artists, extract audience statistics,
and save them to a JSON file for display on the website.

Requirements:
- Chrome/Chromium browser installed
- ChromeDriver installed (or use webdriver-manager)
- Environment variables set in .env file (SPOTIFY_EMAIL, SPOTIFY_PASSWORD)

Usage:
    python scripts/scrape_spotify_artists.py
"""

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, List

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    WebDriverException
)
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SPOTIFY_ARTISTS_URL = "https://artists.spotify.com/"
TIMEOUT = 30  # seconds
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "spotify_stats.json"


class SpotifyArtistsScraperError(Exception):
    """Custom exception for scraper errors"""
    pass


class SpotifyArtistsScraper:
    """Scraper for Spotify for Artists dashboard"""
    
    def __init__(self, headless: bool = True):
        """Initialize the scraper with Chrome driver"""
        self.headless = headless
        self.driver = None
        self.email = os.getenv("SPOTIFY_EMAIL")
        self.password = os.getenv("SPOTIFY_PASSWORD")
        
        if not self.email or not self.password:
            raise SpotifyArtistsScraperError(
                "SPOTIFY_EMAIL and SPOTIFY_PASSWORD must be set in .env file"
            )
    
    def setup_driver(self):
        """Set up Chrome driver with appropriate options"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless")
        
        # Additional options for stability and security
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            # Use webdriver-manager to automatically download and manage ChromeDriver
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            print("✓ Chrome driver initialized successfully")
        except WebDriverException as e:
            raise SpotifyArtistsScraperError(
                f"Failed to initialize Chrome driver. "
                f"Make sure Chrome/Chromium is installed.\n"
                f"Error: {e}"
            )
    
    def login(self):
        """Log into Spotify for Artists"""
        try:
            print(f"Navigating to {SPOTIFY_ARTISTS_URL}...")
            self.driver.get(SPOTIFY_ARTISTS_URL)
            
            # Wait for login page to load
            time.sleep(2)
            
            # Look for login button or form
            try:
                # Try to find and click login button if on landing page
                login_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Log in')]"))
                )
                login_button.click()
                time.sleep(2)
            except TimeoutException:
                # Might already be on login page
                pass
            
            # Enter email
            print("Entering email...")
            email_field = WebDriverWait(self.driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "login-username"))
            )
            email_field.clear()
            email_field.send_keys(self.email)
            
            # Click continue/next button
            continue_button = self.driver.find_element(By.ID, "login-button")
            continue_button.click()
            time.sleep(2)
            
            # Enter password
            print("Entering password...")
            password_field = WebDriverWait(self.driver, TIMEOUT).until(
                EC.presence_of_element_located((By.ID, "login-password"))
            )
            password_field.clear()
            password_field.send_keys(self.password)
            
            # Click login button
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            
            # Wait for redirect to dashboard
            print("Waiting for dashboard to load...")
            WebDriverWait(self.driver, TIMEOUT).until(
                lambda driver: "artists.spotify.com" in driver.current_url and "login" not in driver.current_url
            )
            
            print("✓ Successfully logged in")
            time.sleep(3)  # Give dashboard time to fully load
            
        except TimeoutException as e:
            raise SpotifyArtistsScraperError(
                f"Login timeout. Check your credentials or network connection. Error: {e}"
            )
        except NoSuchElementException as e:
            raise SpotifyArtistsScraperError(
                f"Could not find login form elements. Spotify might have changed their layout. Error: {e}"
            )
    
    def extract_stats(self) -> Dict[str, Any]:
        """Extract statistics from the dashboard"""
        stats = {
            "scraped_at": datetime.now(timezone.utc).isoformat(),
            "listeners": None,
            "streams": None,
            "followers": None,
            "top_cities": []
        }
        
        try:
            print("Extracting statistics...")
            
            # Wait for stats to load
            time.sleep(5)
            
            # Try to extract listeners
            try:
                listeners_element = self.driver.find_element(
                    By.XPATH, 
                    "//*[contains(text(), 'Listeners') or contains(text(), 'listeners')]"
                    "/following-sibling::*[1] | "
                    "//*[contains(text(), 'Listeners') or contains(text(), 'listeners')]"
                    "/../following-sibling::*[1]"
                )
                listeners_text = listeners_element.text.strip()
                stats["listeners"] = self._parse_number(listeners_text)
                print(f"  Listeners: {stats['listeners']}")
            except NoSuchElementException:
                print("  ⚠ Could not find listeners count")
            
            # Try to extract streams
            try:
                streams_element = self.driver.find_element(
                    By.XPATH,
                    "//*[contains(text(), 'Streams') or contains(text(), 'streams')]"
                    "/following-sibling::*[1] | "
                    "//*[contains(text(), 'Streams') or contains(text(), 'streams')]"
                    "/../following-sibling::*[1]"
                )
                streams_text = streams_element.text.strip()
                stats["streams"] = self._parse_number(streams_text)
                print(f"  Streams: {stats['streams']}")
            except NoSuchElementException:
                print("  ⚠ Could not find streams count")
            
            # Try to extract followers
            try:
                followers_element = self.driver.find_element(
                    By.XPATH,
                    "//*[contains(text(), 'Followers') or contains(text(), 'followers')]"
                    "/following-sibling::*[1] | "
                    "//*[contains(text(), 'Followers') or contains(text(), 'followers')]"
                    "/../following-sibling::*[1]"
                )
                followers_text = followers_element.text.strip()
                stats["followers"] = self._parse_number(followers_text)
                print(f"  Followers: {stats['followers']}")
            except NoSuchElementException:
                print("  ⚠ Could not find followers count")
            
            # Try to extract top cities
            stats["top_cities"] = self._extract_top_cities()
            
            print("✓ Statistics extracted successfully")
            
        except Exception as e:
            print(f"⚠ Error extracting stats: {e}")
            # Return partial stats rather than failing completely
        
        return stats
    
    def _parse_number(self, text: str) -> Optional[int]:
        """Parse a number from text, handling K, M suffixes"""
        if not text:
            return None
        
        # Remove commas and whitespace
        text = text.replace(",", "").strip()
        
        # Handle K (thousands) and M (millions)
        multiplier = 1
        if text.endswith("K") or text.endswith("k"):
            multiplier = 1000
            text = text[:-1]
        elif text.endswith("M") or text.endswith("m"):
            multiplier = 1000000
            text = text[:-1]
        
        try:
            # Parse the number
            if "." in text:
                number = float(text) * multiplier
            else:
                number = int(text) * multiplier
            return int(number)
        except ValueError:
            return None
    
    def _extract_top_cities(self) -> List[Dict[str, Any]]:
        """
        Extract top 5 cities and their listener counts
        
        Note: This uses generic XPath selectors that may need adjustment based on 
        the actual Spotify for Artists dashboard structure. The selectors are intentionally
        broad to handle variations, but may require updates if Spotify changes their UI.
        Consider updating the XPath after inspecting the actual DOM structure.
        """
        cities = []
        
        try:
            # Look for city/location elements
            # NOTE: These are generic class name patterns - adjust based on actual page structure
            city_elements = self.driver.find_elements(
                By.XPATH,
                "//*[contains(@class, 'city') or contains(@class, 'location') or "
                "contains(@class, 'geography')]//div[contains(@class, 'name') or "
                "contains(@class, 'label')]"
            )
            
            count_elements = self.driver.find_elements(
                By.XPATH,
                "//*[contains(@class, 'city') or contains(@class, 'location') or "
                "contains(@class, 'geography')]//div[contains(@class, 'value') or "
                "contains(@class, 'count')]"
            )
            
            # Pair cities with their counts
            for i in range(min(5, min(len(city_elements), len(count_elements)))):
                city_name = city_elements[i].text.strip()
                listener_count = self._parse_number(count_elements[i].text.strip())
                
                if city_name and listener_count:
                    cities.append({
                        "city": city_name,
                        "listeners": listener_count
                    })
            
            if cities:
                print(f"  Top Cities: {len(cities)} cities extracted")
                for city in cities:
                    print(f"    - {city['city']}: {city['listeners']} listeners")
            else:
                print("  ⚠ Could not extract top cities")
                
        except Exception as e:
            print(f"  ⚠ Error extracting top cities: {e}")
        
        return cities
    
    def save_stats(self, stats: Dict[str, Any]):
        """Save statistics to JSON file"""
        try:
            # Ensure output directory exists
            OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
            
            # Write to file with pretty formatting
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(stats, f, indent=2)
            
            print(f"✓ Stats saved to {OUTPUT_FILE}")
            
        except Exception as e:
            raise SpotifyArtistsScraperError(f"Failed to save stats: {e}")
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            print("✓ Browser closed")
    
    def run(self):
        """Run the complete scraping workflow"""
        try:
            print("=" * 60)
            print("Spotify for Artists Stats Scraper")
            print("=" * 60)
            
            self.setup_driver()
            self.login()
            stats = self.extract_stats()
            self.save_stats(stats)
            
            print("=" * 60)
            print("✓ Scraping completed successfully!")
            print("=" * 60)
            
            return stats
            
        except SpotifyArtistsScraperError as e:
            print(f"\n✗ Scraping failed: {e}")
            raise
        except Exception as e:
            print(f"\n✗ Unexpected error: {e}")
            raise SpotifyArtistsScraperError(f"Unexpected error: {e}")
        finally:
            self.close()


def main():
    """Main entry point"""
    try:
        scraper = SpotifyArtistsScraper(headless=True)
        scraper.run()
        return 0
    except SpotifyArtistsScraperError as e:
        print(f"\nError: {e}")
        return 1
    except KeyboardInterrupt:
        print("\n\nScraping interrupted by user")
        return 130


if __name__ == "__main__":
    exit(main())
