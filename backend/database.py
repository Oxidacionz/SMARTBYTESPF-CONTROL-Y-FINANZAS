"""
Database models and operations for exchange rates persistence
Supports both Supabase (primary) and SQLite (fallback)
"""
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from supabase_config import get_supabase_client, is_supabase_enabled, RAILWAY_RATES_ID

# ============================================
# SQLite Database Setup (Fallback)
# ============================================
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./exchange_rates_v2.db")

# Fix for SQLAlchemy compatibility with some providers that use postgres://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLite Models
class ExchangeRate(Base):
    """Model for storing exchange rates in SQLite"""
    __tablename__ = "exchange_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    usd_bcv = Column(Float, nullable=False)
    eur_bcv = Column(Float, nullable=False)
    usd_binance_buy = Column(Float, nullable=True)
    usd_binance_sell = Column(Float, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)
    source = Column(String, default="bcv.org.ve")

# ============================================
# Database Initialization
# ============================================
def init_db():
    """Initialize database tables (SQLite fallback)"""
    Base.metadata.create_all(bind=engine)
    print("✅ SQLite database tables created successfully")

# ============================================
# Supabase Operations
# ============================================
def save_rates_to_supabase(usd_bcv: float, eur_bcv: float, usd_binance_buy: float = None, usd_binance_sell: float = None) -> bool:
    """
    Save exchange rates to Supabase
    
    Args:
        usd_bcv: USD rate from BCV
        eur_bcv: EUR rate from BCV
        usd_binance_buy: USD Buy rate from Binance
        usd_binance_sell: USD Sell rate from Binance
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        supabase = get_supabase_client()
        if not supabase:
            return False
        
        data = {
            "id": RAILWAY_RATES_ID,
            "usd_bcv": float(usd_bcv) if usd_bcv else 0,
            "eur_bcv": float(eur_bcv) if eur_bcv else 0,
            "usd_binance_buy": float(usd_binance_buy) if usd_binance_buy else None,
            "usd_binance_sell": float(usd_binance_sell) if usd_binance_sell else None,
            "is_global": True,
            "last_updated": datetime.utcnow().isoformat()
        }
        
        # Upsert: Insert or update if exists
        result = supabase.table("exchange_rates").upsert(data).execute()
        
        if result.data:
            print(f"✅ Rates saved to Supabase: USD={usd_bcv}, EUR={eur_bcv}, Binance Buy={usd_binance_buy}, Sell={usd_binance_sell}")
            return True
        else:
            print("⚠️  Supabase upsert returned no data")
            return False
            
    except Exception as e:
        print(f"❌ Error saving rates to Supabase: {e}")
        return False

def get_rates_from_supabase() -> dict:
    """
    Get latest rates from Supabase
    
    Returns:
        dict with rate data or None
    """
    try:
        supabase = get_supabase_client()
        if not supabase:
            return None
        
        result = supabase.table("exchange_rates").select("*").eq("id", RAILWAY_RATES_ID).single().execute()
        
        if result.data:
            return {
                "usd_bcv": result.data.get("usd_bcv"),
                "eur_bcv": result.data.get("eur_bcv"),
                "usd_binance_buy": result.data.get("usd_binance_buy"),
                "usd_binance_sell": result.data.get("usd_binance_sell"),
                "last_updated": result.data.get("last_updated"),
                "source": result.data.get("source", "bcv.org.ve")
            }
        return None
        
    except Exception as e:
        print(f"❌ Error retrieving rates from Supabase: {e}")
        return None

# ============================================
# SQLite Operations (Fallback)
# ============================================
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_rates_to_sqlite(usd_bcv: float, eur_bcv: float, usd_binance_buy: float = None, usd_binance_sell: float = None):
    """
    Save exchange rates to SQLite (fallback)
    
    Args:
        usd_bcv: USD rate from BCV
        eur_bcv: EUR rate from BCV
        usd_binance_buy: USD Buy rate from Binance
        usd_binance_sell: USD Sell rate from Binance
    
    Returns:
        ExchangeRate object
    """
    db = SessionLocal()
    try:
        rate = ExchangeRate(
            usd_bcv=usd_bcv,
            eur_bcv=eur_bcv,
            usd_binance_buy=usd_binance_buy,
            usd_binance_sell=usd_binance_sell,
            last_updated=datetime.utcnow()
        )
        db.add(rate)
        db.commit()
        db.refresh(rate)
        print(f"✅ Rates saved to SQLite: USD={usd_bcv}, EUR={eur_bcv}")
        return rate
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving rates to SQLite: {e}")
        raise
    finally:
        db.close()

def get_latest_rates_from_sqlite():
    """
    Get the most recent exchange rates from SQLite
    
    Returns:
        ExchangeRate object or None if no rates exist
    """
    db = SessionLocal()
    try:
        rate = db.query(ExchangeRate).order_by(ExchangeRate.last_updated.desc()).first()
        return rate
    except Exception as e:
        print(f"❌ Error retrieving rates from SQLite: {e}")
        return None
    finally:
        db.close()

def get_rates_dict_from_sqlite():
    """
    Get latest rates from SQLite as a dictionary
    
    Returns:
        dict with rate data or None
    """
    rate = get_latest_rates_from_sqlite()
    if rate:
        return {
            "usd_bcv": rate.usd_bcv,
            "eur_bcv": rate.eur_bcv,
            "usd_binance_buy": rate.usd_binance_buy,
            "usd_binance_sell": rate.usd_binance_sell,
            "last_updated": rate.last_updated.isoformat(),
            "source": rate.source
        }
    return None

# ============================================
# Unified Interface (Auto-selects Supabase or SQLite)
# ============================================
def save_rates(usd_bcv: float, eur_bcv: float, usd_binance_buy: float = None, usd_binance_sell: float = None):
    """
    Save exchange rates to database (Supabase primary, SQLite fallback)
    
    Args:
        usd_bcv: USD rate from BCV
        eur_bcv: EUR rate from BCV
        usd_binance_buy: USD Buy rate from Binance
        usd_binance_sell: USD Sell rate from Binance
    """
    # Try Supabase first
    if is_supabase_enabled():
        success = save_rates_to_supabase(usd_bcv, eur_bcv, usd_binance_buy, usd_binance_sell)
        if success:
            # Also save to SQLite as backup
            try:
                save_rates_to_sqlite(usd_bcv, eur_bcv, usd_binance_buy, usd_binance_sell)
            except:
                pass  # SQLite backup is optional
            return
    
    # Fallback to SQLite only
    print("⚠️  Using SQLite fallback (Supabase not configured)")
    save_rates_to_sqlite(usd_bcv, eur_bcv, usd_binance_buy, usd_binance_sell)

def get_latest_rates():
    """
    Get the most recent exchange rates (Supabase primary, SQLite fallback)
    
    Returns:
        Rate object or None
    """
    # Try Supabase first
    if is_supabase_enabled():
        rates = get_rates_from_supabase()
        if rates:
            return rates
    
    # Fallback to SQLite
    return get_latest_rates_from_sqlite()

def get_rates_dict():
    """
    Get latest rates as a dictionary (Supabase primary, SQLite fallback)
    
    Returns:
        dict with rate data or None
    """
    # Try Supabase first
    if is_supabase_enabled():
        rates = get_rates_from_supabase()
        if rates:
            return rates
    
    # Fallback to SQLite
    return get_rates_dict_from_sqlite()

if __name__ == "__main__":
    # Initialize database
    init_db()
    print("Database initialized")

