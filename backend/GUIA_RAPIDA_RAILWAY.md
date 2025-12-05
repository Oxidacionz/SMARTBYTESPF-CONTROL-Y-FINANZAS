# 🎯 GUÍA RÁPIDA: Configurar Railway (TUS CREDENCIALES)

## ✅ PASO 1: Ejecutar SQL en Supabase

### 1.1 Accede a Supabase
```
https://app.supabase.com/project/zfesgvclmgzsaldjoyjq
```

### 1.2 Abre el SQL Editor
- En el menú lateral izquierdo, busca "SQL Editor"
- Click en "SQL Editor"
- Click en "+ New Query"

### 1.3 Copia y ejecuta el SQL
- Abre el archivo: `database/railway_integration.sql`
- Copia TODO el contenido
- Pega en el SQL Editor de Supabase
- Click en "Run" (botón verde) o presiona Ctrl+Enter
- Espera a que diga "Success" ✅

### 1.4 Verificar
Ejecuta esta query para verificar:
```sql
SELECT * FROM exchange_rates 
WHERE id = '00000000-0000-0000-0000-000000000001'::UUID;
```
Deberías ver 1 registro con `is_global = true`

---

## 🚂 PASO 2: Configurar Variables en Railway

### 2.1 Accede a Railway
```
https://railway.app
```

### 2.2 Abre tu proyecto backend
- Busca tu proyecto en el dashboard
- Click en el proyecto

### 2.3 Selecciona el servicio
- Verás una o más "cajas" (servicios)
- Click en la caja que contiene tu backend Python

### 2.4 Ve a Variables
- En el menú superior, click en "Variables"

### 2.5 Agregar Variable 1: SUPABASE_URL

```
1. Click en "+ New Variable" o "Add Variable"
2. En "Variable Name" escribe exactamente:
   SUPABASE_URL

3. En "Value" copia y pega esto:
   https://zfesgvclmgzsaldjoyjq.supabase.co

4. Presiona Enter o click en "Add"
```

### 2.6 Agregar Variable 2: SUPABASE_SERVICE_KEY

```
1. Click en "+ New Variable" otra vez
2. En "Variable Name" escribe exactamente:
   SUPABASE_SERVICE_KEY

3. En "Value" copia y pega esto:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZXNndmNsbWd6c2FsZGpveWpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU2NzYzMywiZXhwIjoyMDgwMTQzNjMzfQ.MwVaRzId8hEltjV0jwoeQkRoDOsT_mxNvrLLffqumb0

4. Presiona Enter o click en "Add"
```

### 2.7 Verificar que se guardaron
Deberías ver:
```
Variables (2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPABASE_URL              https://zfesgvclmgzsaldjoyjq...
SUPABASE_SERVICE_KEY      eyJhbGciOiJIUzI1NiIsInR5... (hidden)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 PASO 3: Esperar el Redespliegue

Railway debería redesplegar automáticamente:

1. Ve a la pestaña "Deployments"
2. Verás un nuevo deployment en progreso
3. Espera a que el estado cambie a "Success" ✅ (toma 2-3 minutos)

---

## ✅ PASO 4: Verificar los Logs

### 4.1 Ver los logs
```
1. En Railway, pestaña "Deployments"
2. Click en el deployment más reciente
3. Verás los logs en tiempo real
```

### 4.2 Buscar estos mensajes de ÉXITO:
```
✅ Supabase client initialized successfully
✅ SQLite database tables created successfully
Iniciando la aplicación. Realizando scraping inicial...
✅ Rates saved to Supabase: USD=XX.XX, EUR=XX.XX...
[SCHEDULER] Scheduler iniciado:
   - Actualización diaria: 6:00 AM (Hora Venezuela)
   - Actualización única: XX:XX:XX (Hora Venezuela)
   - Actualización regular: Cada 30 minutos
```

### 4.3 Si ves ERRORES:
```
❌ Error initializing Supabase client
```
→ Verifica que copiaste las variables correctamente (sin espacios extra)

```
⚠️ WARNING: Supabase credentials not configured
```
→ Las variables no se detectaron, verifica los nombres exactos

---

## 📊 PASO 5: Verificar en Supabase

### 5.1 Ve al Table Editor
```
https://app.supabase.com/project/zfesgvclmgzsaldjoyjq/editor
```

### 5.2 Abre la tabla exchange_rates
- Click en "exchange_rates" en el menú lateral
- Busca el registro con id = `00000000-0000-0000-0000-000000000001`

### 5.3 Verificar actualización
- Espera unos minutos
- Refresca la tabla (F5)
- Los valores de `usd_bcv`, `eur_bcv`, etc. deberían cambiar
- `last_updated` debería actualizarse cada 30 minutos

---

## 🎉 ¡LISTO!

Si ves los mensajes de éxito en los logs y los datos se actualizan en Supabase, ¡todo está funcionando perfectamente! 🚀

### Próximos pasos:
1. ✅ Hacer push del código al repositorio
2. ✅ Verificar que la app frontend muestre las tasas correctamente
3. ✅ Monitorear los logs de Railway periódicamente

---

## 📋 Resumen de Credenciales (para referencia)

**Supabase Project:**
- Project ID: `zfesgvclmgzsaldjoyjq`
- Project URL: `https://zfesgvclmgzsaldjoyjq.supabase.co`

**Variables en Railway:**
- `SUPABASE_URL` = https://zfesgvclmgzsaldjoyjq.supabase.co
- `SUPABASE_SERVICE_KEY` = [configurada] ✅

---

**Última actualización**: Diciembre 2025
