# Arquitectura del Proyecto - SB FINANCIAL

Este documento describe la arquitectura actual de la aplicación después de la refactorización mayor realizada en Diciembre 2025.

## Estructura General

La aplicación sigue una arquitectura basada en **Componentes, Hooks y Contexto**, migrando de un diseño monolítico (`App.tsx` gigante) a una estructura modular mantenible.

### Principales Capas

1.  **Capa de Presentación (Components)**
    *   **Átomos/Moléculas/Organismos:** Seguimos Atomic Design para componentes UI.
    *   **Templates/Vistas:** `MainView.tsx` es la vista principal orquestadora.
    *   **Modales:** Gestionados localmente en `MainView` pero lógica de negocio delegada.

2.  **Capa de Estado (Context)**
    *   **FinancialContext:** "Single Source of Truth" para todos los datos financieros (Items, Assets, Events, Goals). Reemplaza múltiples `useState` dispersos.
    *   **Proveedores:** `FinancialProvider` envuelve la aplicación autenticada.

3.  **Capa de Lógica (Hooks)**
    *   `useFinancialData`: Consumidor del contexto.
    *   `useExchangeRates`: Gestión de tasas de cambio (API + Cache).
    *   `useNotifications`: Lógica de alertas y recordatorios.

4.  **Capa de Datos (Services)**
    *   `supabaseClient.ts`: Cliente base.
    *   `db.ts`: Servicios específicos (dbItems, dbAssets, etc.) que encapsulan las queries SQL/Supabase.

## Flujo de Datos

1.  **Autenticación:** `App.tsx` maneja el estado de sesión de Supabase.
2.  **Inicialización:** Al haber sesión, `App` monta `FinancialProvider` pasando el `userId`.
3.  **Carga de Datos:** `FinancialProvider` carga todos los datos iniciales (Items, Goals, etc.) y los expone vía Contexto.
4.  **Consumo:** `MainView` y sus hijos usan `useFinancialData()` para leer o modificar estado.
5.  **Persistencia:** Las funciones del Contexto (ej. `addItem`) actualizan el estado local (optimistic UI) y llaman a los servicios (`db.ts`) para persistir en Supabase.

## Directorios Clave

*   `/src/context`: Definiciones de Contexto Global.
*   `/src/hooks`: Lógica reutilizable y separada de la UI.
*   `/src/components/organisms`: Bloques lógicos grandes (Tablas, Widgets).
*   `/src/services`: Comunicación con Backend.
*   `/src/utils`: Funciones puras (Formateo, Cálculos matemáticos con `moneyMath`).

## Decisiones Técnicas "Senior"

*   **Inversión de Control:** `MainView` recibe datos del hook, no sabe cómo se fetchean.
*   **Separation of Concerns:** `App.tsx` solo autentica. `FinancialContext` solo gestiona datos. `MainView` solo renderiza.
*   **Data Integrity:** Uso de librería `moneyMath` para evitar errores de punto flotante en cálculos financieros.
