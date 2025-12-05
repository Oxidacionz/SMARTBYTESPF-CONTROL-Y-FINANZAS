# 📦 RESUMEN COMPLETO: Integración Railway + Supabase

## ✅ CAMBIOS REALIZADOS EN EL CÓDIGO

### 1. Archivos Modificados:
- ✅ `requirements.txt` - Agregado `supabase` y `pydantic`
- ✅ `database.py` - Refactorizado para usar Supabase + SQLite
- ✅ `supabase_config.py` - Nuevo archivo de configuración

### 2. Archivos de Documentación Creados:
- 📄 `COMO_CONFIGURAR_RAILWAY.md` - Guía paso a paso visual
- 📄 `RAILWAY_SETUP.md` - Documentación técnica
- 📄 `.env.example` - Plantilla de variables

---

## 🎯 PASOS QUE DEBES SEGUIR (EN ORDEN)

### PASO 1: Ejecutar SQL en Supabase ⚡
```sql
-- Copia y ejecuta este SQL en Supabase SQL Editor
-- (Ver archivo completo más abajo)
```

### PASO 2: Obtener Credenciales de Supabase 🔑
1. Ve a https://app.supabase.com
2. Abre tu proyecto
3. Settings → API
4. Copia:
   - **Project URL** (ejemplo: https://abc123.supabase.co)
   - **service_role key** (la key secreta, NO la anon)

### PASO 3: Configurar Variables en Railway 🚂
1. Ve a https://railway.app
2. Abre tu proyecto backend
3. Click en el servicio → Variables
4. Agrega estas 2 variables:
   ```
   SUPABASE_URL = tu_project_url
   SUPABASE_SERVICE_KEY = tu_service_role_key
   ```

### PASO 4: Hacer Push del Código 📤
```bash
cd backend
git add .
git commit -m "feat: Integración con Supabase para tasas de cambio"
git push origin main
```

### PASO 5: Verificar en Railway ✅
1. Ve a Deployments
2. Espera que termine el deployment
3. Revisa los logs, deberías ver:
   ```
   ✅ Supabase client initialized successfully
   ✅ Rates saved to Supabase: USD=XX.XX...
   ```

---

## 📝 SQL PARA SUPABASE (COPIA ESTO)

```sql
-- =====================================================
-- ACTUALIZACIÓN: Exchange Rates para Railway Backend
-- =====================================================

-- 1. Modificar tabla existente para soportar Railway
ALTER TABLE exchange_rates DROP CONSTRAINT IF EXISTS exchange_rates_user_id_key;

-- 2. Crear registro especial para Railway
INSERT INTO exchange_rates (
    id,
    user_id,
    usd_bcv,
    eur_bcv,
    usd_binance_buy,
    usd_binance_sell,
    is_global,
    last_updated
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    NULL,
    0,
    0,
    0,
    0,
    TRUE,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET last_updated = NOW();

-- 3. Actualizar política de SELECT
DROP POLICY IF EXISTS "Users can view own rates" ON exchange_rates;

CREATE POLICY "Users can view rates" ON exchange_rates 
FOR SELECT 
USING (
    auth.uid() = user_id
    OR is_global = TRUE
    OR user_id IS NULL
);

-- 4. Política para Railway (Service Role)
CREATE POLICY "Service role can update global rates" ON exchange_rates
FOR UPDATE
USING (user_id IS NULL AND is_global = TRUE);

CREATE POLICY "Service role can insert global rates" ON exchange_rates
FOR INSERT
WITH CHECK (user_id IS NULL AND is_global = TRUE);

-- 5. Índice para optimización
CREATE INDEX IF NOT EXISTS idx_exchange_rates_railway 
ON exchange_rates(id) 
WHERE id = '00000000-0000-0000-0000-000000000001'::UUID;

-- 6. Vista para acceso fácil
CREATE OR REPLACE VIEW current_exchange_rates AS
SELECT 
    usd_bcv,
    eur_bcv,
    usd_binance_buy,
    usd_binance_sell,
    last_updated
FROM exchange_rates
WHERE id = '00000000-0000-0000-0000-000000000001'::UUID
AND is_global = TRUE
LIMIT 1;

GRANT SELECT ON current_exchange_rates TO anon, authenticated;

-- 7. Función helper
CREATE OR REPLACE FUNCTION get_current_rates()
RETURNS TABLE (
    usd_bcv DECIMAL(12, 4),
    eur_bcv DECIMAL(12, 4),
    usd_binance_buy DECIMAL(12, 4),
    usd_binance_sell DECIMAL(12, 4),
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.usd_bcv,
        er.eur_bcv,
        er.usd_binance_buy,
        er.usd_binance_sell,
        er.last_updated
    FROM exchange_rates er
    WHERE er.id = '00000000-0000-0000-0000-000000000001'::UUID
    AND er.is_global = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_current_rates() TO anon, authenticated;
```

---

## 🔍 CÓMO VERIFICAR QUE TODO FUNCIONA

### En Railway (Logs):
```
✅ Supabase client initialized successfully
✅ SQLite database tables created successfully
✅ Rates saved to Supabase: USD=45.50, EUR=49.20...
[SCHEDULER] Scheduler iniciado
```

### En Supabase (Table Editor):
1. Ve a Table Editor → exchange_rates
2. Busca el registro con id = `00000000-0000-0000-0000-000000000001`
3. Deberías ver las tasas actualizándose cada 30 minutos

### En tu App (Frontend):
1. Abre la aplicación
2. Las tasas deberían mostrarse correctamente
3. Deberían actualizarse automáticamente

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### ❌ "Supabase credentials not configured"
**Causa**: Variables de entorno no configuradas en Railway
**Solución**: Verifica que agregaste SUPABASE_URL y SUPABASE_SERVICE_KEY

### ❌ "Permission denied"
**Causa**: Estás usando la anon key en lugar de service_role key
**Solución**: Usa la service_role key (la secreta)

### ❌ "Table exchange_rates doesn't exist"
**Causa**: No ejecutaste el SQL en Supabase
**Solución**: Ejecuta el SQL completo en Supabase SQL Editor

### ❌ Las tasas no se actualizan
**Causa**: El scheduler no está corriendo o hay error en el scraping
**Solución**: Revisa los logs de Railway, verifica que el BCV sea accesible

---

## 📊 ARQUITECTURA FINAL

```
┌─────────────────────────────────────────────────────────┐
│                    RAILWAY BACKEND                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Scheduler (cada 30 min)                         │   │
│  │  ├─ Scraping BCV (USD, EUR)                      │   │
│  │  ├─ Scraping Binance P2P (Buy, Sell)            │   │
│  │  └─ Guardar en BD                                │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Database Layer (database.py)                    │   │
│  │  ├─ Intenta Supabase primero ✅                  │   │
│  │  └─ Fallback a SQLite si falla                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Tabla: exchange_rates                           │   │
│  │  ID: 00000000-0000-0000-0000-000000000001        │   │
│  │  ├─ usd_bcv: 45.50                               │   │
│  │  ├─ eur_bcv: 49.20                               │   │
│  │  ├─ usd_binance_buy: 46.80                       │   │
│  │  ├─ usd_binance_sell: 47.10                      │   │
│  │  └─ last_updated: 2025-12-05 14:00:00            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  bcvService.ts                                   │   │
│  │  └─ fetch('/api/rates')                          │   │
│  │     └─ Lee desde Supabase                        │   │
│  │        └─ Muestra en la app                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎉 BENEFICIOS DE ESTA IMPLEMENTACIÓN

✅ **Sincronización Multi-Dispositivo**: Todos los usuarios ven las mismas tasas
✅ **Redundancia**: Si Supabase falla, usa SQLite local
✅ **Actualización Automática**: Cada 30 minutos sin intervención manual
✅ **Escalable**: Fácil agregar más fuentes de tasas
✅ **Seguro**: Usa RLS de Supabase para proteger datos

---

## 📚 ARCHIVOS DE REFERENCIA

- `COMO_CONFIGURAR_RAILWAY.md` - Guía paso a paso con capturas
- `RAILWAY_SETUP.md` - Documentación técnica completa
- `.env.example` - Plantilla de variables de entorno
- `database.py` - Código de integración Supabase
- `supabase_config.py` - Configuración de cliente Supabase

---

**¿Necesitas ayuda?** Revisa los logs de Railway y Supabase para diagnosticar problemas.

**Última actualización**: Diciembre 2025
