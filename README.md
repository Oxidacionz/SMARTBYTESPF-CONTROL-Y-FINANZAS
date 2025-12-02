# Smart Bytes - Control y Finanzas 💰

Una aplicación web moderna para la gestión y control financiero de personas y empresas. Administra tus ingresos, gastos, presupuestos y obtén análisis detallados de tu situación financiera.

## 🚀 Características

- **Gestión de Transacciones**: Registra y categoriza ingresos y gastos de forma sencilla
- **Control Presupuestario**: Define y monitorea presupuestos mensuales por categoría
- **Análisis Financiero**: Visualiza gráficos y estadísticas de tus finanzas
- **Escáner de Recibos**: Digitaliza recibos y facturas automáticamente
- **Reportes Personalizados**: Genera reportes detallados de tu actividad financiera
- **Multi-usuario**: Soporte para gestión financiera personal y empresarial

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: CSS personalizado
- **Backend**: Supabase
- **IA**: Google Gemini API para análisis inteligente
- **Deployment**: GitHub Pages

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Oxidacionz/SMARTBYTESPF-CONTROL-Y-FINANZAS.git

# Navegar al directorio
cd SMARTBYTESPF-CONTROL-Y-FINANZAS

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
# GEMINI_API_KEY=tu_api_key
# VITE_SUPABASE_URL=tu_supabase_url
# VITE_SUPABASE_ANON_KEY=tu_supabase_key

# Ejecutar en desarrollo
npm run dev
```

## 🌐 Deploy

El proyecto se despliega automáticamente a GitHub Pages cuando se hace push a la rama `main`.

**URL en vivo**: https://oxidacionz.github.io/SMARTBYTESPF-CONTROL-Y-FINANZAS/

### Configurar GitHub Secrets

Para el deployment automático, configura estos secrets en tu repositorio:

1. Ve a Settings → Secrets and variables → Actions
2. Agrega los siguientes secrets:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción

## 💼 Casos de Uso

### Para Personas
- Control de gastos personales y familiares
- Planificación de presupuestos mensuales
- Seguimiento de ahorros y metas financieras
- Análisis de patrones de gasto

### Para Empresas
- Gestión de ingresos y egresos empresariales
- Control de gastos operativos
- Reportes financieros detallados
- Análisis de rentabilidad

## 📄 Licencia

Este proyecto es privado y está en desarrollo.

## 👨‍💻 Autor

Desarrollado por Oxidacionz
