import requests
import os
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from binance_scraper import obtener_precios_p2p, calcular_promedio
from database import init_db, save_rates, get_rates_dict, get_latest_rates
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta
import pytz

# --- INTEGRACIÓN SMART BYTES (Supabase) ---
try:
    from supabase import create_client
except ImportError:
    print("Advertencia: Libreria 'supabase' no encontrada. La sincronizacion fallara.")

def sync_to_smart_bytes(usd_bcv=None, eur_bcv=None, usd_buy=None, usd_sell=None):
    """
    Envía las tasas a la base de datos central de Smart Bytes (Supabase)
    usando las credenciales con sufijo _TORO para no afectar tu app actual.
    """
    url = os.environ.get("SUPABASE_URL_TORO")
    key = os.environ.get("SUPABASE_SERVICE_KEY_TORO")
    
    if not url or not key:
        # Si no hay credenciales configuradas, asumimos que no se quiere sincronizar
        return

    try:
        sb = create_client(url, key)
        now = datetime.utcnow().isoformat()
        datos = []
        
        if usd_bcv: 
            datos.append({"from_currency": "USD", "to_currency": "VES", "rate": float(usd_bcv), "is_buy_rate": True, "captured_at": now})
        if eur_bcv: 
            datos.append({"from_currency": "EUR", "to_currency": "VES", "rate": float(eur_bcv), "is_buy_rate": True, "captured_at": now})
        if usd_buy: 
            datos.append({"from_currency": "USDT", "to_currency": "VES", "rate": float(usd_buy), "is_buy_rate": True, "captured_at": now})
        if usd_sell: 
            datos.append({"from_currency": "USDT", "to_currency": "VES", "rate": float(usd_sell), "is_buy_rate": False, "captured_at": now})

        if datos:
            sb.table("exchange_rates").insert(datos).execute()
            print(f"✅ [SmartBytes] {len(datos)} tasas sincronizadas (BCV+Binance)")
    except Exception as e:
        print(f"⚠️ [SmartBytes] Error sincronizando: {e}")

# ----------------------------------------------

# Configurar zona horaria de Venezuela
VENEZUELA_TZ = pytz.timezone('America/Caracas')

# URL objetivo para el scraping
BCV_URL = "https://www.bcv.org.ve/"

# Cache para almacenar la última tasa y su fecha de actualización.
rates_cache = {
    "USD": None,
    "EUR": None,
    "last_updated": datetime.min, 
    "cache_duration_hours": 4 
}

app = FastAPI(
    title="BCV Rate Scraper API",
    description="API que obtiene las tasas del dólar (USD) y euro (EUR) del Banco Central de Venezuela (BCV) con persistencia en base de datos.",
    version="2.0.0"
)

# Initialize database on startup
init_db()

# Initialize scheduler
scheduler = AsyncIOScheduler()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Info"])
def read_root():
    return {"status": "online", "message": "Smart Bytes Financial Backend is running", "endpoints": ["/tasas", "/api/rates", "/docs"]}

# --- Funciones de Scraping y Lógica de Negocio ---

def scrape_bcv_rates():
    """
    Realiza el scraping de la página del BCV para obtener las tasas USD y EUR.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        }
        
        print(f"Iniciando scraping a {BCV_URL}...")
        response = requests.get(BCV_URL, headers=headers, timeout=15, verify=False)
        response.raise_for_status() 

        soup = BeautifulSoup(response.content, 'html.parser')

        usd_rate = None
        eur_rate = None

        # 1. Búsqueda por la tarjeta principal (dólar USD)
        usd_div = soup.find('div', id='dolar')
        if not usd_div:
             usd_div = soup.find('div', id='rate')

        if usd_div:
            rate_element = usd_div.find('strong')
            if rate_element:
                raw_rate = rate_element.text.strip().replace('.', '').replace(',', '.')
                try:
                    usd_rate = float(raw_rate)
                    print(f"Tasa USD encontrada: {usd_rate}")
                except ValueError:
                    print(f"Error al convertir tasa USD: {raw_rate}")

        # 2. Búsqueda de otras tasas (Euro)
        eur_div = soup.find('div', id='euro')
        if eur_div:
            rate_element = eur_div.find('strong')
            if rate_element:
                raw_rate = rate_element.text.strip().replace('.', '').replace(',', '.')
                try:
                    eur_rate = float(raw_rate)
                    print(f"Tasa EUR encontrada (por ID): {eur_rate}")
                except ValueError:
                    print(f"Error al convertir tasa EUR (ID): {raw_rate}")
        
        if eur_rate is None:
            row_elements = soup.find_all('div', class_='row')
            for row in row_elements:
                text = row.text.strip()
                if 'EUR' in text and 'USD' not in text:
                    value_span = row.find_all('strong')
                    if not value_span:
                        value_span = row.find_all('span', class_='text-right')
                    
                    if value_span:
                        raw_rate = value_span[-1].text.strip().replace('.', '').replace(',', '.')
                        try:
                            eur_rate = float(raw_rate)
                            print(f"Tasa EUR encontrada (por Row): {eur_rate}")
                        except ValueError:
                            pass
                        break

        if usd_rate is None:
            print("ADVERTENCIA: No se pudo scrapear USD.")
        
        if eur_rate is None:
             print("ADVERTENCIA: No se pudo scrapear EUR.")

        if usd_rate is None and eur_rate is None:
            raise Exception("No se pudieron encontrar las tasas de USD y/o EUR")

        return {
            "USD": round(usd_rate, 4) if usd_rate else None,
            "EUR": round(eur_rate, 4) if eur_rate else None,
            "date": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"Error al procesar la respuesta del BCV: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar los datos del BCV.")


# --- Lógica de Cache y Endpoint ---

def get_rates_with_cache():
    global rates_cache
    now = datetime.now()
    
    if now.weekday() >= 5: 
        if rates_cache["USD"] is not None:
             return {
                "USD": rates_cache["USD"],
                "EUR": rates_cache["EUR"],
                "date": rates_cache["last_updated"].isoformat(),
                "status": "CACHE_WEEKEND"
             }

    time_difference = now - rates_cache["last_updated"]
    cache_expired = time_difference.total_seconds() > (rates_cache["cache_duration_hours"] * 3600)
    
    update_hours = [6, 19, 20, 21]
    is_update_window = now.hour in update_hours

    if cache_expired or is_update_window or rates_cache["USD"] is None:
        try:
            new_rates = scrape_bcv_rates()
            if new_rates["USD"]: rates_cache["USD"] = new_rates["USD"]
            if new_rates["EUR"]: rates_cache["EUR"] = new_rates["EUR"]
            rates_cache["last_updated"] = now
            
            try:
                # Guardar en DB local (Original)
                save_rates(
                    usd_bcv=new_rates["USD"],
                    eur_bcv=new_rates["EUR"],
                    usd_binance_buy=None,
                    usd_binance_sell=None
                )
                
                # INTEGRACIÓN: Enviar también a Smart Bytes
                sync_to_smart_bytes(usd_bcv=new_rates["USD"], eur_bcv=new_rates["EUR"])
                
                print("Tasas guardadas en base de datos")
            except Exception as db_error:
                print(f"Error guardando en BD (continuando con caché): {db_error}")
            
            return {**new_rates, "status": "SCRAPED_AND_UPDATED"}
        except HTTPException as e:
            if rates_cache["USD"] is not None:
                print(f"Scraping fallido ({e.detail}). Sirviendo caché antigua.")
                return {
                    "USD": rates_cache["USD"],
                    "EUR": rates_cache["EUR"],
                    "date": rates_cache["last_updated"].isoformat(),
                    "status": "FALLBACK_TO_OLD_CACHE"
                }
            raise e 
    
    return {
        "USD": rates_cache["USD"],
        "EUR": rates_cache["EUR"],
        "date": rates_cache["last_updated"].isoformat(),
        "status": "CACHE_HIT"
    }


async def update_rates_job():
    """
    Job to update rates automatically - runs every 30 minutes
    Scrapes both BCV and Binance rates
    """
    print("[SCHEDULER] Ejecutando actualización automática de tasas...")
    try:
        # Scrape BCV rates
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, get_rates_with_cache)
        print(f"[SCHEDULER] Tasas BCV actualizadas: {result.get('status')}")
        
        # Scrape Binance rates
        try:
            precios_compra = obtener_precios_p2p("BUY")
            precios_venta = obtener_precios_p2p("SELL")
            
            promedio_compra = calcular_promedio(precios_compra)
            promedio_venta = calcular_promedio(precios_venta)
            
            if promedio_compra > 0 and promedio_venta > 0:
                # Guardar DB local
                save_rates(
                    usd_bcv=result.get('USD', 0),
                    eur_bcv=result.get('EUR', 0),
                    usd_binance_buy=promedio_compra,
                    usd_binance_sell=promedio_venta
                )
                
                # INTEGRACIÓN: Sync todo a Smart Bytes
                sync_to_smart_bytes(
                    usd_bcv=result.get('USD'), 
                    eur_bcv=result.get('EUR'),
                    usd_buy=promedio_compra, 
                    usd_sell=promedio_venta
                )

                print(f"[SCHEDULER] Tasa Binance actualizada: Buy={promedio_compra:.2f}, Sell={promedio_venta:.2f}")
            else:
                print("[SCHEDULER] No se pudo obtener tasa de Binance")
        except Exception as binance_error:
            print(f"[SCHEDULER] Error scraping Binance: {binance_error}")
    except Exception as e:
        print(f"[SCHEDULER] Error al actualizar tasas: {e}")

@app.on_event("startup")
async def startup_event():
    """
    Al iniciar la aplicación, realiza un scraping inicial y configura el scheduler.
    """
    print("Iniciando la aplicación. Modo Cliente Pasivo activado.")
    # try:
        # --- MIGRACIÓN ---
        # Desactivando scraping inicial. El sistema ahora es "Passive Client".
        # loop = asyncio.get_event_loop()
        #result = await loop.run_in_executor(None, get_rates_with_cache)
        
        # Scrape Binance rates on startup (DESACTIVADO)
        # ... lógica removida para evitar write-conflict ...
        # print("Modo Cliente Pasivo activado: No se realizará scraping local.")
    # except Exception as e:
    #    print(f"Advertencia: El scraping inicial falló. Error: {e}")
    
    # --- MIGRACIÓN A MICROSERVICIO EXTERNO ---
    # El scheduler interno se ha desactivado porque ahora un servicio externo 
    # (Scraper-Financial-Service) alimenta la base de datos automáticamente.
    # 
    # Esto previene conflictos de escritura y duplicidad de scraping.

    # Start scheduler
    # scheduler.add_job(update_rates_job, trigger=CronTrigger(hour=6, minute=0, timezone=VENEZUELA_TZ), ...)
    # scheduler.start()
    
    print(f"[SYSTEM] Scheduler interno desactivado. Leyendo tasas de base de datos externa.")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Detener el scheduler al cerrar la aplicación
    """
    if scheduler.running:
        scheduler.shutdown()
    print("[SCHEDULER] Scheduler detenido")

@app.get("/tasas", summary="Obtener la tasa de USD y EUR del BCV", tags=["Tasas"])
async def get_bcv_exchange_rates():
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, get_rates_with_cache)
    return result

@app.get("/api/rates", summary="Obtener tasas desde base de datos", tags=["Tasas"])
async def get_rates_api():
    db_rates = get_rates_dict()
    if db_rates:
        return {"success": True, "data": db_rates, "source": "database"}
    
    print("No hay datos en BD, intentando scraping...")
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, get_rates_with_cache)
        return {"success": True, "data": result, "source": "scraper_fallback"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"No se pudieron obtener las tasas: {str(e)}")

class PromedioPrecios(BaseModel):
    promedio_compra_ves: float
    promedio_venta_ves: float
    anuncios_contabilizados_compra: int
    anuncios_contabilizados_venta: int

@app.get("/p2p/promedio-usdt-ves", response_model=PromedioPrecios, summary="Obtener promedio P2P Binance", tags=["Tasas"])
async def get_promedios_p2p():
    loop = asyncio.get_event_loop()
    precios_compra = await loop.run_in_executor(None, obtener_precios_p2p, 'BUY')
    precios_venta = await loop.run_in_executor(None, obtener_precios_p2p, 'SELL')
    
    promedio_compra = calcular_promedio(precios_compra)
    promedio_venta = calcular_promedio(precios_venta)
    
    return PromedioPrecios(
        promedio_compra_ves=round(promedio_compra, 4),
        promedio_venta_ves=round(promedio_venta, 4),
        anuncios_contabilizados_compra=len(precios_compra),
        anuncios_contabilizados_venta=len(precios_venta)

    )

# --- Transaction Endpoints ---

from database import Transaction, SessionLocal
from typing import List, Optional
import uuid

class TransactionCreate(BaseModel):
    type: str # INGRESO, GASTO, CXC, CXP
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    status: str = "PENDIENTE" # PENDIENTE, COMPLETADO

class TransactionResponse(BaseModel):
    id: int
    code: Optional[str]
    type: str
    amount: float
    currency: str
    description: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True

def generate_transaction_code(type_prefix: str, db_id: int):
    # e.g. ING-20251128-0001
    date_str = datetime.now().strftime("%Y%m%d")
    prefix_map = {
        "INGRESO": "ING",
        "GASTO": "EGR",
        "CXC": "CXC",
        "CXP": "CXP"
    }
    prefix = prefix_map.get(type_prefix, "TRX")
    return f"{prefix}-{date_str}-{db_id:04d}"

@app.post("/transactions/", response_model=TransactionResponse, summary="Crear nueva transacción", tags=["Transacciones"])
async def create_transaction(transaction: TransactionCreate):
    db = SessionLocal()
    try:
        # Create base record
        db_transaction = Transaction(
            type=transaction.type,
            amount=transaction.amount,
            currency=transaction.currency,
            description=transaction.description,
            status=transaction.status,
            code=f"TEMP-{uuid.uuid4().hex[:8]}" # Temp code
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        
        # Generate real code based on ID
        real_code = generate_transaction_code(transaction.type, db_transaction.id)
        db_transaction.code = real_code
        db.commit()
        db.refresh(db_transaction)
        
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/transactions/", response_model=List[TransactionResponse], summary="Listar historial de transacciones", tags=["Transacciones"])
async def get_transactions(type: Optional[str] = None, status: Optional[str] = None):
    db = SessionLocal()
    try:
        query = db.query(Transaction)
        if type:
            query = query.filter(Transaction.type == type)
        if status:
            query = query.filter(Transaction.status == status)
        
        return query.order_by(Transaction.created_at.desc()).all()
    finally:
        db.close()

@app.post("/api/rates/force-refresh", summary="Forzar actualización de tasas", tags=["Tasas"])
async def force_refresh_rates():
    try:
        await update_rates_job()
        return await get_rates_api()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al forzar actualización: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
