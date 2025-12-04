"""
BCV Exchange Rate Scraper
Scrapes USD and EUR official rates from bcv.org.ve
"""

from bs4 import BeautifulSoup
import requests
from datetime import datetime
import json

def scrape_bcv_rates():
    """
    Scrape exchange rates from BCV website
    Returns: dict with usd_bcv, eur_bcv, and timestamp
    """
    try:
        url = "https://www.bcv.org.ve/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Disable SSL verification to avoid certificate errors
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        response = requests.get(url, headers=headers, timeout=10, verify=False)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # BCV website structure - find the exchange rate divs
        # Note: This selector may need adjustment based on actual BCV HTML structure
        usd_element = soup.find('div', {'id': 'dolar'})
        eur_element = soup.find('div', {'id': 'euro'})
        
        # Alternative: Try to find by text content
        if not usd_element:
            # Look for elements containing "Dólar" or "USD"
            all_divs = soup.find_all('div')
            for div in all_divs:
                text = div.get_text().strip()
                if 'Dólar' in text or 'USD' in text:
                    # Try to extract number from nearby elements
                    strong_tag = div.find('strong')
                    if strong_tag:
                        usd_element = strong_tag
                        break
        
        if not eur_element:
            all_divs = soup.find_all('div')
            for div in all_divs:
                text = div.get_text().strip()
                if 'Euro' in text or 'EUR' in text:
                    strong_tag = div.find('strong')
                    if strong_tag:
                        eur_element = strong_tag
                        break
        
        # Extract rates
        usd_rate = None
        eur_rate = None
        
        import re
        
        def parse_rate(text):
            # Extract number using regex (matches digits, commas, dots)
            match = re.search(r'(\d+[.,]\d+)', text.replace(' ', ''))
            if match:
                # Replace comma with dot for float conversion
                return float(match.group(1).replace(',', '.'))
            return None

        if usd_element:
            usd_text = usd_element.get_text().strip()
            usd_rate = parse_rate(usd_text)
        
        if eur_element:
            eur_text = eur_element.get_text().strip()
            eur_rate = parse_rate(eur_text)
        
        # Fallback: If we couldn't find rates, return None
        if not usd_rate or not eur_rate:
            print("Warning: Could not extract rates from BCV website")
            return None
        
        return {
            'usd_bcv': usd_rate,
            'eur_bcv': eur_rate,
            'timestamp': datetime.now().isoformat(),
            'source': 'bcv.org.ve'
        }
        
    except requests.RequestException as e:
        print(f"Error fetching BCV rates: {e}")
        return None
    except Exception as e:
        print(f"Error parsing BCV rates: {e}")
        return None

if __name__ == "__main__":
    # Test the scraper
    rates = scrape_bcv_rates()
    if rates:
        print(json.dumps(rates, indent=2))
    else:
        print("Failed to scrape rates")
