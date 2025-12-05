# 🚂 Railway Deployment Guide

## Configuración de Variables de Entorno en Railway

Para que el backend funcione correctamente con Supabase, necesitas configurar las siguientes variables de entorno en Railway:

### Variables Requeridas:

1. **SUPABASE_URL**
   - Valor: Tu URL de Supabase
   - Ejemplo: `https://tu-proyecto.supabase.co`
   - Dónde obtenerlo: Supabase Dashboard → Settings → API → Project URL

2. **SUPABASE_SERVICE_KEY**
   - Valor: Tu Service Role Key (NO la anon key)
   - Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Dónde obtenerlo: Supabase Dashboard → Settings → API → Service Role Key
   - ⚠️ **IMPORTANTE**: Usa la **service_role** key, NO la **anon** key

### Variables Opcionales:

3. **DATABASE_URL** (opcional)
   - Si quieres usar PostgreSQL en lugar de SQLite como fallback
   - Railway puede auto-generar esto si agregas un servicio PostgreSQL

## Pasos para Configurar en Railway:

### 1. Accede a tu proyecto en Railway
```
https://railway.app/project/[tu-proyecto-id]
```

### 2. Ve a la pestaña "Variables"
- Click en tu servicio de backend
- Click en "Variables" en el menú lateral

### 3. Agrega las variables
- Click en "New Variable"
- Agrega cada variable con su valor correspondiente:
  - `SUPABASE_URL` = tu URL de Supabase
  - `SUPABASE_SERVICE_KEY` = tu service role key

### 4. Redeploy (opcional)
- Railway debería redesplegar automáticamente
- Si no, click en "Deploy" → "Redeploy"

## Verificación

Una vez configurado, el backend:

✅ Guardará las tasas en Supabase automáticamente
✅ Usará SQLite como backup local
✅ Mostrará mensajes en los logs:
   - `✅ Supabase client initialized successfully`
   - `✅ Rates saved to Supabase: USD=XX.XX, EUR=XX.XX...`

Si las variables NO están configuradas:
⚠️ Verás: `⚠️ WARNING: Supabase credentials not configured`
⚠️ El backend funcionará solo con SQLite local

## Logs de Railway

Para verificar que todo funciona:
1. Ve a tu proyecto en Railway
2. Click en "Deployments"
3. Click en el deployment más reciente
4. Revisa los logs para ver los mensajes de Supabase

## Troubleshooting

### Error: "Supabase client initialization failed"
- Verifica que SUPABASE_URL sea correcta
- Verifica que SUPABASE_SERVICE_KEY sea la **service_role** key

### Error: "Permission denied"
- Asegúrate de usar la **service_role** key, no la **anon** key
- Verifica que las políticas RLS en Supabase permitan actualizaciones

### Las tasas no se actualizan
- Revisa los logs de Railway
- Verifica que el scheduler esté corriendo
- Confirma que el SQL de Supabase se ejecutó correctamente

## Estructura de la Tabla en Supabase

El backend espera esta estructura:

```sql
exchange_rates:
  - id: UUID (fijo: 00000000-0000-0000-0000-000000000001)
  - usd_bcv: DECIMAL
  - eur_bcv: DECIMAL
  - usd_binance_buy: DECIMAL
  - usd_binance_sell: DECIMAL
  - is_global: BOOLEAN (TRUE)
  - last_updated: TIMESTAMP
```

## Endpoints Disponibles

- `GET /api/rates` - Obtiene tasas desde Supabase/SQLite
- `GET /tasas` - Scraping directo de BCV
- `GET /p2p/promedio-usdt-ves` - Tasas de Binance P2P

## Frecuencia de Actualización

El scheduler actualiza las tasas:
- ⏰ Diariamente a las 6:00 AM (hora Venezuela)
- ⏰ Una vez 10 minutos después del inicio
- ⏰ Cada 30 minutos como respaldo

---

**Última actualización**: Diciembre 2025
