import requests
from bs4 import BeautifulSoup
import datetime
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

# Configurar zona horaria de Venezuela
VENEZUELA_TZ = pytz.timezone('America/Caracas')

# --- Configuración y Caching en memoria ---

# URL objetivo para el scraping
BCV_URL = "https://www.bcv.org.ve/"

# Cache para almacenar la última tasa y su fecha de actualización.
# Esto evita hacer scraping en cada petición a la API.
rates_cache = {
    "USD": None,
    "EUR": None,
    "last_updated": datetime.min, # Inicializar con la fecha mínima
    "cache_duration_hours": 4 # Duración de la caché, se refrescará cada 4 horas
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

# Configurar CORS para permitir peticiones desde el frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Funciones de Scraping y Lógica de Negocio ---

def scrape_bcv_rates():
    """
    Realiza el scraping de la página del BCV para obtener las tasas USD y EUR.
    """
    try:
        # Usar un user-agent para simular un navegador real
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        }
        
        # Realizar la solicitud HTTP
        print(f"Iniciando scraping a {BCV_URL}...")
        response = requests.get(BCV_URL, headers=headers, timeout=15, verify=False)
        response.raise_for_status() # Lanza un error para códigos de estado 4xx/5xx

        # Parsear el contenido HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar el contenedor principal de las tasas. En la estructura actual del BCV,
        # los valores están en divs que contienen el código de la moneda.

        usd_rate = None
        eur_rate = None

        # 1. Búsqueda por la tarjeta principal (dólar USD)
        # El BCV tiene una tarjeta grande para el USD con el ID 'rate_usd'.
        usd_div = soup.find('div', id='dolar')
        if not usd_div:
             usd_div = soup.find('div', id='rate') # Fallback

        if usd_div:
            # El valor numérico suele estar dentro de una etiqueta 'strong' o 'div' con clase específica.
            # Buscamos el valor principal.
            rate_element = usd_div.find('strong')
            if rate_element:
                # Limpiar y convertir el valor. Reemplazar la coma (,) por punto (.)
                raw_rate = rate_element.text.strip().replace('.', '').replace(',', '.')
                try:
                    usd_rate = float(raw_rate)
                    print(f"Tasa USD encontrada: {usd_rate}")
                except ValueError:
                    print(f"Error al convertir tasa USD: {raw_rate}")

        # 2. Búsqueda de otras tasas, incluyendo el EUR (euro)
        
        # Priorizar búsqueda por ID 'euro' que es más específica
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
        
        # Fallback: Búsqueda en filas si no se encontró por ID
        if eur_rate is None:
            row_elements = soup.find_all('div', class_='row')
            for row in row_elements:
                # Verificar que sea la fila del Euro y NO la del Dólar
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

        # Validar que ambas tasas se hayan encontrado
        if usd_rate is None:
            # Fallback hardcodeado temporal si falla el scraping para no romper la app
            print("ADVERTENCIA: No se pudo scrapear USD, usando valor referencial.")
            # usd_rate = 60.0 # Valor seguro temporal? No, mejor lanzar error para que use caché vieja
            # raise Exception("No se pudo encontrar la tasa USD")
        
        if eur_rate is None:
             print("ADVERTENCIA: No se pudo scrapear EUR.")

        if usd_rate is None and eur_rate is None:
            raise Exception("No se pudieron encontrar las tasas de USD y/o EUR en los selectores esperados.")

        return {
            "USD": round(usd_rate, 4) if usd_rate else None,
            "EUR": round(eur_rate, 4) if eur_rate else None,
            "date": datetime.datetime.now().isoformat()
        }

    except requests.exceptions.RequestException as e:
        # Manejo de errores de conexión (DNS, Timeout, SSL, etc.)
        print(f"Error de conexión durante el scraping: {e}")
        raise HTTPException(status_code=503, detail="Error de conexión al sitio del BCV. Intente más tarde.")
    except Exception as e:
        # Otros errores (Parseo, lógica, etc.)
        print(f"Error al procesar la respuesta del BCV: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar los datos del BCV.")


# --- Lógica de Cache y Endpoint ---

def get_rates_with_cache():
    """
    Verifica la caché y realiza scraping solo si los datos están vencidos.
    Asegura que el scraping se ejecute una vez al día o en las ventanas de actualización.
    """
    global rates_cache
    
    now = datetime.datetime.now()
    
    # Lógica de fin de semana (Sábado = 5, Domingo = 6)
    if now.weekday() >= 5: # Si es Sábado o Domingo
        # Si ya tenemos datos de la última actualización (viernes), los servimos.
        # Si no, intentamos obtenerlos (aunque el BCV probablemente no actualice).
        if rates_cache["USD"] is not None:
             # Devolvemos la tasa de viernes/última actualización
             return {
                "USD": rates_cache["USD"],
                "EUR": rates_cache["EUR"],
                "date": rates_cache["last_updated"].isoformat(),
                "status": "CACHE_WEEKEND"
             }

    # Verificar si la caché ha expirado
    time_difference = now - rates_cache["last_updated"]
    cache_expired = time_difference.total_seconds() > (rates_cache["cache_duration_hours"] * 3600)
    
    # Ventanas de actualización solicitadas (para asegurar datos frescos)
    # 6 AM, 7 PM, 8 PM, 9 PM
    update_hours = [6, 19, 20, 21]
    is_update_window = now.hour in update_hours

    # Si la caché está vencida O estamos en una ventana de actualización, scrapeamos
    # O si la caché está vacía
    if cache_expired or is_update_window or rates_cache["USD"] is None:
        try:
            new_rates = scrape_bcv_rates()
            # Actualizar la caché solo si el scraping fue exitoso
            if new_rates["USD"]: rates_cache["USD"] = new_rates["USD"]
            if new_rates["EUR"]: rates_cache["EUR"] = new_rates["EUR"]
            rates_cache["last_updated"] = now
            
            # Save to database for persistence across devices
            try:
                save_rates(
                    usd_bcv=new_rates["USD"],
                    eur_bcv=new_rates["EUR"],
                    usd_binance=None  # Will be added later if needed
                )
                print("Tasas guardadas en base de datos")
            except Exception as db_error:
                print(f"Error guardando en BD (continuando con caché): {db_error}")
            
            return {**new_rates, "status": "SCRAPED_AND_UPDATED"}
        except HTTPException as e:
            # Si el scraping falla, servimos la caché vieja si existe, si no, lanzamos el error.
            if rates_cache["USD"] is not None:
                print(f"Scraping fallido ({e.detail}). Sirviendo caché antigua.")
                return {
                    "USD": rates_cache["USD"],
                    "EUR": rates_cache["EUR"],
                    "date": rates_cache["last_updated"].isoformat(),
                    "status": "FALLBACK_TO_OLD_CACHE"
                }
            raise e # Si no hay caché, lanzamos el error de scraping.
    
    # Si la caché no ha expirado y no estamos en una ventana de actualización, servimos la caché
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
            promedio_general = (promedio_compra + promedio_venta) / 2 if promedio_compra and promedio_venta else 0
            
            if promedio_general > 0:
                # Update database with all rates including Binance
                save_rates(
                    usd_bcv=result.get('USD', 0),
                    eur_bcv=result.get('EUR', 0),
                    usd_binance=promedio_general
                )
                print(f"[SCHEDULER] Tasa Binance actualizada: {promedio_general:.2f}")
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
    print("Iniciando la aplicación. Realizando scraping inicial...")
    try:
        # Ejecutar el scraping BCV de forma síncrona en un threadpool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, get_rates_with_cache)
        print("Caché BCV inicializado con éxito.")
        
        # Scrape Binance rates on startup
        try:
            precios_compra = obtener_precios_p2p("BUY")
            precios_venta = obtener_precios_p2p("SELL")
            
            promedio_compra = calcular_promedio(precios_compra)
            promedio_venta = calcular_promedio(precios_venta)
            promedio_general = (promedio_compra + promedio_venta) / 2 if promedio_compra and promedio_venta else 0
            
            if promedio_general > 0:
                # Save all rates to database
                save_rates(
                    usd_bcv=result.get('USD', 0),
                    eur_bcv=result.get('EUR', 0),
                    usd_binance=promedio_general
                )
                print(f"Tasa Binance inicial: {promedio_general:.2f}")
            else:
                print("No se pudo obtener tasa inicial de Binance")
        except Exception as binance_error:
            print(f"Error scraping Binance inicial: {binance_error}")
            
    except Exception as e:
        print(f"Advertencia: El scraping inicial falló. Error: {e}")
    
    # Start scheduler
    # 1. Daily update at 6:00 AM Venezuela Time
    scheduler.add_job(
        update_rates_job,
        trigger=CronTrigger(hour=6, minute=0, timezone=VENEZUELA_TZ),
        id='daily_update_6am',
        name='Update exchange rates daily at 6 AM VET',
        replace_existing=True
    )
    
    # 2. One-time update in 10 minutes from now (Venezuela Time)
    # Obtener hora actual en Venezuela
    now_venezuela = datetime.now(VENEZUELA_TZ)
    run_date = now_venezuela + timedelta(minutes=10)
    
    scheduler.add_job(
        update_rates_job,
        trigger=DateTrigger(run_date=run_date),
        id='one_time_update',
        name='One-time update in 10 minutes',
        replace_existing=True
    )
    
    # 3. Keep the 30-minute interval as backup/regular updates
    # Interval triggers don't need timezone as they are relative
    scheduler.add_job(
        update_rates_job,
        trigger=IntervalTrigger(minutes=30),
        id='interval_update',
        name='Update exchange rates every 30 minutes',
        replace_existing=True
    )

    scheduler.start()
    print(f"[SCHEDULER] Scheduler iniciado:")
    print(f"   - Actualización diaria: 6:00 AM (Hora Venezuela)")
    print(f"   - Actualización única: {run_date.strftime('%H:%M:%S')} (Hora Venezuela)")
    print(f"   - Actualización regular: Cada 30 minutos")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Detener el scheduler al cerrar la aplicación
    """
    scheduler.shutdown()
    print("[SCHEDULER] Scheduler detenido")


@app.get("/tasas", summary="Obtener la tasa de USD y EUR del BCV", tags=["Tasas"])
async def get_bcv_exchange_rates():
    """
    Obtiene las tasas de cambio de USD y EUR del BCV. 
    Usa una caché para optimizar y asegurar la disponibilidad.
    """
    # Ejecutamos la lógica de caché y scraping
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, get_rates_with_cache)
    return result

@app.get("/api/rates", summary="Obtener tasas desde base de datos (para sincronización multi-dispositivo)", tags=["Tasas"])
async def get_rates_api():
    """
    Endpoint principal para obtener tasas de cambio.
    Lee desde la base de datos para asegurar sincronización entre dispositivos.
    Si no hay datos en BD, intenta obtenerlos del scraper.
    """
    # Try to get from database first
    db_rates = get_rates_dict()
    
    if db_rates:
        return {
            "success": True,
            "data": {
                "usd_bcv": db_rates["usd_bcv"],
                "eur_bcv": db_rates["eur_bcv"],
                "usd_binance": db_rates.get("usd_binance"),
                "timestamp": db_rates["last_updated"]
            },
            "source": "database"
        }
    
    # Fallback: If no data in database, try to scrape and save
    print("No hay datos en BD, intentando scraping...")
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, get_rates_with_cache)
        
        return {
            "success": True,
            "data": {
                "usd_bcv": result.get("USD"),
                "eur_bcv": result.get("EUR"),
                "usd_binance": None,
                "timestamp": result.get("date")
            },
            "source": "scraper_fallback"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"No se pudieron obtener las tasas: {str(e)}"
        )

# --- Binance P2P Endpoint ---

class PromedioPrecios(BaseModel):
    promedio_compra_ves: float
    promedio_venta_ves: float
    anuncios_contabilizados_compra: int
    anuncios_contabilizados_venta: int

@app.get("/p2p/promedio-usdt-ves", response_model=PromedioPrecios, summary="Obtener promedio P2P Binance", tags=["Tasas"])
async def get_promedios_p2p():
    """
    Calcula y devuelve el promedio de los primeros 5 precios de compra y venta
    de USDT/VES, excluyendo el primer anuncio (patrocinado).
    """
    loop = asyncio.get_event_loop()
    
    # Ejecutar scraping en paralelo (threadpool) para no bloquear
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
