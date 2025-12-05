"""
Supabase Configuration Module
Handles connection to Supabase for exchange rates persistence
"""
import os
from supabase import create_client, Client
from typing import Optional

# Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Fixed UUID for Railway's global exchange rates record
RAILWAY_RATES_ID = "00000000-0000-0000-0000-000000000001"

# Supabase client instance (singleton)
_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Get or create Supabase client instance
    Returns None if credentials are not configured
    """
    global _supabase_client
    
    if _supabase_client is not None:
        return _supabase_client
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("⚠️  WARNING: Supabase credentials not configured.")
        print("   Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
        print("   Falling back to local SQLite database.")
        return None
    
    try:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Supabase client initialized successfully")
        return _supabase_client
    except Exception as e:
        print(f"❌ Error initializing Supabase client: {e}")
        return None

def is_supabase_enabled() -> bool:
    """Check if Supabase is properly configured"""
    return bool(SUPABASE_URL and SUPABASE_SERVICE_KEY)
