"""
Flask API for BCV Exchange Rates
Provides REST endpoint for frontend to fetch current rates
"""

from flask import Flask, jsonify
from flask_cors import CORS
from bcv_scraper import scrape_bcv_rates
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Cache configuration
CACHE_DURATION = timedelta(hours=6)  # Refresh every 6 hours
cached_rates = None
cache_timestamp = None

def get_rates():
    """Get rates from cache or scrape new ones"""
    global cached_rates, cache_timestamp
    
    now = datetime.now()
    
    # Check if cache is valid
    if cached_rates and cache_timestamp:
        if now - cache_timestamp < CACHE_DURATION:
            return cached_rates
    
    # Scrape new rates
    rates = scrape_bcv_rates()
    
    if rates:
        cached_rates = rates
        cache_timestamp = now
        return rates
    
    # If scraping failed, return cached rates (if available)
    if cached_rates:
        return {
            **cached_rates,
            'cached': True,
            'cache_age_hours': (now - cache_timestamp).total_seconds() / 3600
        }
    
    # No rates available
    return None

@app.route('/api/rates', methods=['GET'])
def get_exchange_rates():
    """Endpoint to get current BCV exchange rates"""
    rates = get_rates()
    
    if rates:
        return jsonify({
            'success': True,
            'data': rates
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Could not fetch rates from BCV',
            'message': 'Please update rates manually'
        }), 503

@app.route('/api/rates/refresh', methods=['POST'])
def refresh_rates():
    """Force refresh rates (bypass cache)"""
    global cached_rates, cache_timestamp
    
    rates = scrape_bcv_rates()
    
    if rates:
        cached_rates = rates
        cache_timestamp = datetime.now()
        return jsonify({
            'success': True,
            'data': rates,
            'message': 'Rates refreshed successfully'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Failed to scrape rates',
            'message': 'BCV website may be unavailable'
        }), 503

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
