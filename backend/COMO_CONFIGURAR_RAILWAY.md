# 🎯 GUÍA PASO A PASO: Configurar Variables de Entorno en Railway

## 📋 Requisitos Previos

Antes de comenzar, necesitas tener:
- ✅ Una cuenta en Railway (https://railway.app)
- ✅ Tu proyecto backend ya desplegado en Railway
- ✅ Acceso a tu proyecto de Supabase

---

## 🔑 PASO 1: Obtener las Credenciales de Supabase

### 1.1 Accede a tu Dashboard de Supabase
```
https://app.supabase.com
```

### 1.2 Selecciona tu proyecto
- Click en tu proyecto "Smart Bytes" o el nombre que le hayas dado

### 1.3 Ve a Settings → API
- En el menú lateral izquierdo, click en el ícono de engranaje ⚙️
- Click en "API"

### 1.4 Copia las credenciales necesarias

📝 **IMPORTANTE**: Necesitas copiar DOS valores:

**A) Project URL**
```
Ubicación: Configuration → Project URL
Ejemplo: https://abcdefghijklmnop.supabase.co
```
👉 Copia este valor completo

**B) Service Role Key (secret)**
```
Ubicación: Project API keys → service_role (secret)
Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```
⚠️ **MUY IMPORTANTE**: 
- Copia la key que dice "service_role" (NO la "anon public")
- Esta key es SECRETA, nunca la compartas públicamente
- Click en el ícono de "ojo" 👁️ para revelarla
- Click en el ícono de "copiar" 📋 para copiarla

---

## 🚂 PASO 2: Configurar Variables en Railway

### 2.1 Accede a Railway
```
https://railway.app
```

### 2.2 Abre tu proyecto
- En el dashboard, busca tu proyecto del backend
- Click en el proyecto para abrirlo

### 2.3 Selecciona el servicio correcto
- Verás uno o más "servicios" (cajas/cards)
- Click en el servicio que contiene tu backend Python
- Usualmente se llama algo como "backend" o tiene el nombre de tu repositorio

### 2.4 Abre la pestaña "Variables"
```
En el menú superior del servicio, verás varias pestañas:
[Deployments] [Metrics] [Variables] [Settings] ...
```
👉 Click en **"Variables"**

### 2.5 Agregar las variables de entorno

Ahora verás una pantalla con un botón "+ New Variable" o "Add Variable"

**Variable 1: SUPABASE_URL**
```
1. Click en "+ New Variable"
2. En "Variable Name" escribe: SUPABASE_URL
3. En "Value" pega tu Project URL de Supabase
   Ejemplo: https://abcdefghijklmnop.supabase.co
4. Click en "Add" o presiona Enter
```

**Variable 2: SUPABASE_SERVICE_KEY**
```
1. Click en "+ New Variable" nuevamente
2. En "Variable Name" escribe: SUPABASE_SERVICE_KEY
3. En "Value" pega tu Service Role Key de Supabase
   Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
4. Click en "Add" o presiona Enter
```

### 2.6 Verificar que se guardaron
Deberías ver algo como esto:
```
Variables (2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPABASE_URL              https://abcdefg...
SUPABASE_SERVICE_KEY      eyJhbGciOiJIUzI1N... (hidden)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 PASO 3: Redesplegar (si es necesario)

Railway normalmente redespliega automáticamente cuando agregas variables.

### 3.1 Verificar el redespliegue automático
- Ve a la pestaña "Deployments"
- Deberías ver un nuevo deployment en progreso
- Espera a que el estado cambie a "Success" ✅

### 3.2 Si NO se redespliegó automáticamente
```
1. Ve a la pestaña "Deployments"
2. Click en los tres puntos "..." del último deployment
3. Click en "Redeploy"
4. Espera a que termine
```

---

## ✅ PASO 4: Verificar que Funciona

### 4.1 Revisar los Logs
```
1. En Railway, ve a la pestaña "Deployments"
2. Click en el deployment más reciente
3. Verás los logs en tiempo real
```

### 4.2 Buscar estos mensajes de éxito:
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

### 4.3 Si ves mensajes de error:
```
❌ Error initializing Supabase client
```
→ Verifica que las variables estén bien escritas (sin espacios extra)

```
⚠️ WARNING: Supabase credentials not configured
```
→ Las variables no se detectaron, verifica los nombres exactos

---

## 🎯 RESUMEN RÁPIDO

### Variables que DEBES configurar:
| Variable Name           | Dónde obtenerla                          |
|------------------------|------------------------------------------|
| `SUPABASE_URL`         | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role |

### Pasos en Railway:
1. Abre tu proyecto → Selecciona el servicio
2. Click en "Variables"
3. Click en "+ New Variable"
4. Agrega `SUPABASE_URL` con su valor
5. Agrega `SUPABASE_SERVICE_KEY` con su valor
6. Espera el redespliegue automático
7. Verifica los logs

---

## 🆘 Troubleshooting

### Problema: "No veo la pestaña Variables"
**Solución**: Asegúrate de haber clickeado en el servicio (la caja/card), no solo en el proyecto.

### Problema: "Las variables no se guardan"
**Solución**: 
- Verifica que presionaste Enter o clickeaste "Add"
- Refresca la página
- Intenta con otro navegador

### Problema: "El backend sigue usando SQLite"
**Solución**:
- Verifica que los nombres de las variables sean EXACTOS (mayúsculas/minúsculas)
- No debe haber espacios antes o después
- Redespliega manualmente

### Problema: "Permission denied en Supabase"
**Solución**:
- Verifica que estés usando la **service_role** key, NO la anon key
- Ejecuta el SQL que te proporcioné para crear las políticas RLS

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Railway
2. Verifica que el SQL se haya ejecutado en Supabase
3. Confirma que las credenciales sean correctas
4. Intenta hacer un redespliegue manual

---

**Última actualización**: Diciembre 2025
