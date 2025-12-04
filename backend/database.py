"""
Database models and operations for exchange rates persistence
"""
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./exchange_rates.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class ExchangeRate(Base):
    """Model for storing exchange rates"""
    __tablename__ = "exchange_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    usd_bcv = Column(Float, nullable=False)
    eur_bcv = Column(Float, nullable=False)
    usd_binance = Column(Float, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)
    source = Column(String, default="bcv.org.ve")

# Create tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

# Database operations
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_rates(usd_bcv: float, eur_bcv: float, usd_binance: float = None):
    """
    Save exchange rates to database
    
    Args:
        usd_bcv: USD rate from BCV
        eur_bcv: EUR rate from BCV
        usd_binance: USD rate from Binance (optional)
    
    Returns:
        ExchangeRate object
    """
    db = SessionLocal()
    try:
        rate = ExchangeRate(
            usd_bcv=usd_bcv,
            eur_bcv=eur_bcv,
            usd_binance=usd_binance,
            last_updated=datetime.utcnow()
        )
        db.add(rate)
        db.commit()
        db.refresh(rate)
        print(f"Rates saved to database: USD={usd_bcv}, EUR={eur_bcv}")
        return rate
    except Exception as e:
        db.rollback()
        print(f"Error saving rates to database: {e}")
        raise
    finally:
        db.close()

def get_latest_rates():
    """
    Get the most recent exchange rates from database
    
    Returns:
        ExchangeRate object or None if no rates exist
    """
    db = SessionLocal()
    try:
        rate = db.query(ExchangeRate).order_by(ExchangeRate.last_updated.desc()).first()
        return rate
    except Exception as e:
        print(f"Error retrieving rates from database: {e}")
        return None
    finally:
        db.close()

def get_rates_dict():
    """
    Get latest rates as a dictionary
    
    Returns:
        dict with rate data or None
    """
    rate = get_latest_rates()
    if rate:
        return {
            "usd_bcv": rate.usd_bcv,
            "eur_bcv": rate.eur_bcv,
            "usd_binance": rate.usd_binance,
            "last_updated": rate.last_updated.isoformat(),
            "source": rate.source
        }
    return None

if __name__ == "__main__":
    # Initialize database
    init_db()
    print("Database initialized")
