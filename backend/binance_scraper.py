import requests
import json

# URL de la API interna de Binance P2P
API_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"

def obtener_precios_p2p(trade_type: str) -> list[float]:
    """
    Realiza una petición a la API interna de Binance P2P para obtener los precios.
    :param trade_type: 'BUY' para anuncios de compra de USDT o 'SELL' para anuncios de venta de USDT.
    :return: Una lista de precios como números flotantes.
    """
    payload = {
        "asset": "USDT",
        "fiat": "VES",
        "tradeType": trade_type,
        "page": 1,
        "rows": 10,
        "filterType": "all",
        "countries": [],
        "payTypes": []
    }
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.post(API_URL, headers=headers, data=json.dumps(payload), timeout=10)
        response.raise_for_status()
        
        data = response.json()
        precios = []
        
        if data and 'data' in data:
            # Empezamos desde la SEGUNDA posición (índice 1) para evitar el anuncio patrocinado.
            # Tomamos hasta 5 anuncios.
            anuncios = data['data'][1:6] 
            
            for anuncio in anuncios:
                precio = float(anuncio['adv']['price'])
                precios.append(precio)
                
        return precios
    
    except requests.exceptions.RequestException as e:
        print(f"Error al realizar la petición API para {trade_type}: {e}")
        return []
    except (KeyError, TypeError, ValueError) as e:
        print(f"Error al parsear la respuesta JSON para {trade_type}: {e}")
        return []

def calcular_promedio(precios: list[float]) -> float:
    """Calcula el promedio de una lista de precios."""
    if not precios:
        return 0.0
    return sum(precios) / len(precios)
