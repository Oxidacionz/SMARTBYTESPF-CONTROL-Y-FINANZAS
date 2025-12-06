# 📦 Plan de Modularización de App.tsx

## 🎯 Objetivo
Dividir App.tsx (~760 líneas) en módulos más pequeños y manejables para:
- ✅ Mejorar la mantenibilidad
- ✅ Facilitar el debugging
- ✅ Prevenir fallos en cascada
- ✅ Mejorar la legibilidad del código

## 📋 Módulos a Extraer

### 1. **Hooks Personalizados** (`src/hooks/`)

#### `useFinancialData.ts`
```typescript
// Maneja todo el estado y lógica de datos financieros
- items, setItems
- physicalAssets, setPhysicalAssets
- goals, setGoals
- directory, setDirectory
- manualEvents, setManualEvents
- shoppingHistory, setShoppingHistory
- Funciones: handleAddItem, handleUpdateItem, handleDeleteItem, etc.
```

#### `useAuth.ts`
```typescript
// Maneja autenticación y sesión
- session
- userProfile
- isLoading
- loadUserData
```

#### `useExchangeRates.ts`
```typescript
// Maneja tasas de cambio
- rates
- handleRateUpdate
- fetchRates
```

#### `useModals.ts`
```typescript
// Maneja el estado de todos los modales
- showAddModal, setShowAddModal
- showEventModal, setShowEventModal
- showAssetModal, setShowAssetModal
- ... (todos los demás modales)
```

### 2. **Componentes de Página** (`src/pages/`)

#### `DashboardPage.tsx`
```typescript
// Contenido del tab "Resumen"
- Dashboard component
- Botones de Distribución y Reportes
- Lógica específica del dashboard
```

#### `AssetsPage.tsx`
```typescript
// Contenido del tab "Tengo / Me Deben"
- renderList('asset')
```

#### `LiabilitiesPage.tsx`
```typescript
// Contenido del tab "Debo / Gastos"
- renderList('liability')
```

#### `GoalsPage.tsx`
```typescript
// Contenido del tab "Metas"
- GoalsManager component
```

#### `InventoryPage.tsx`
```typescript
// Contenido del tab "Inventario"
- Lista de activos físicos
```

#### `AdvisorPage.tsx`
```typescript
// Contenido del tab "Plan Financiero"
- FinancialPlanDashboard o formulario
```

### 3. **Componentes de Layout** (`src/components/layout/`)

#### `Navigation.tsx`
```typescript
// Barra de navegación con tabs
- Tabs principales
- Botones de acción (Gastos Hormiga, Agregar)
```

#### `ModalsContainer.tsx`
```typescript
// Contenedor de todos los modales
- ItemForm
- EventForm
- PhysicalAssetForm
- DebtSettlementModal
- ... (todos los modales)
```

### 4. **Utilidades** (`src/utils/`)

#### `calculations.ts`
```typescript
// Funciones de cálculo
- toUSD
- formatMoney
- calculateTotals
```

#### `helpers.ts`
```typescript
// Funciones auxiliares
- generateId
- exportToExcel
```

## 🔄 Estructura Propuesta

```
src/
├── App.tsx (simplificado, ~150 líneas)
├── hooks/
│   ├── useFinancialData.ts
│   ├── useAuth.ts
│   ├── useExchangeRates.ts
│   └── useModals.ts
├── pages/
│   ├── DashboardPage.tsx
│   ├── AssetsPage.tsx
│   ├── LiabilitiesPage.tsx
│   ├── GoalsPage.tsx
│   ├── InventoryPage.tsx
│   └── AdvisorPage.tsx
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   └── ModalsContainer.tsx
│   └── ... (componentes existentes)
└── utils/
    ├── calculations.ts
    └── helpers.ts
```

## 📝 App.tsx Simplificado

```typescript
function App() {
  // Hooks personalizados
  const { session, userProfile, isLoading } = useAuth();
  const { items, goals, ... } = useFinancialData(session);
  const { rates } = useExchangeRates();
  const modals = useModals();
  
  // Estado local mínimo
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Renderizado
  return (
    <>
      <MainLayout
        header={<Header ... />}
        navigation={<Navigation ... />}
        mainContent={<TabContent activeTab={activeTab} ... />}
        sidebar={<Sidebar ... />}
      />
      <ModalsContainer {...modals} />
    </>
  );
}
```

## ✅ Beneficios

1. **Aislamiento de Errores**: Si falla un módulo, no afecta a los demás
2. **Testing Más Fácil**: Cada módulo se puede testear independientemente
3. **Reutilización**: Hooks y utilidades se pueden usar en otros componentes
4. **Legibilidad**: Código más organizado y fácil de entender
5. **Mantenimiento**: Cambios más fáciles de implementar y revisar

## 🚀 Plan de Implementación

### Fase 1: Extraer Utilidades (Bajo Riesgo)
1. Crear `utils/calculations.ts`
2. Crear `utils/helpers.ts`
3. Actualizar imports en App.tsx

### Fase 2: Extraer Hooks (Riesgo Medio)
1. Crear `hooks/useModals.ts`
2. Crear `hooks/useExchangeRates.ts`
3. Crear `hooks/useAuth.ts`
4. Crear `hooks/useFinancialData.ts`

### Fase 3: Extraer Páginas (Riesgo Medio)
1. Crear componentes de página
2. Crear `TabContent.tsx` para manejar el routing

### Fase 4: Extraer Layout (Bajo Riesgo)
1. Crear `Navigation.tsx`
2. Crear `ModalsContainer.tsx`

### Fase 5: Simplificar App.tsx (Final)
1. Integrar todos los módulos
2. Reducir App.tsx a ~150 líneas
3. Testing completo

## ⚠️ Consideraciones

- Mantener respaldo antes de cada fase
- Probar después de cada extracción
- Usar git para versionar cada cambio
- Implementar error boundaries en componentes críticos
