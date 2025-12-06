# 📋 Plan de Mejoras - Tutorial Interactivo y Sistema de Usuarios Nuevos

## ✅ Cambios Completados

### 1. Eliminación del Modo Local
- ✅ Removida la función `handleSkipAuth`
- ✅ Eliminado el botón "Continuar sin cuenta (Modo Local)"
- ✅ Limpiada la lógica de verificación en App.tsx

### 2. Opciones de Login Actuales
- ✅ **Login Normal**: Email y contraseña con Supabase
- ✅ **Modo Demo**: Para tutorial interactivo (mantener)
- ✅ **Registro**: Crear nueva cuenta

---

## 🎯 Próximas Mejoras a Implementar

### 1. Tutorial Interactivo con Tooltips

#### Descripción
Crear un tutorial paso a paso que muestre tooltips/ventanas emergentes sobre cada función de la aplicación.

#### Características
- **Tooltips contextuales** que aparecen sobre cada botón/función
- **Navegación secuencial** (Siguiente/Anterior)
- **Resaltado visual** del elemento activo
- **Opción de saltar** el tutorial en cualquier momento
- **Progreso visual** (paso 1 de 10, etc.)

#### Elementos a Explicar
1. **Dashboard**: Resumen de finanzas
2. **Tasas de Cambio**: BCV y Binance
3. **Botones Rápidos**: Tengo, Me Deben, Gasto, Ahorro
4. **Agregar Item**: Formulario principal
5. **Liquidación de Deudas**: Cómo pagar/cobrar
6. **Inventario**: Activos físicos
7. **Metas Financieras**: Crear y seguir metas
8. **Asesor Financiero**: Recomendaciones personalizadas
9. **Exportar/Importar**: Reportes Excel
10. **Notificaciones**: Alertas y recordatorios

#### Implementación Técnica
```typescript
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void; // Acción opcional al completar el paso
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'step-1',
    title: 'Bienvenido a Smart Bytes',
    description: 'Este es tu dashboard principal donde verás el resumen de tus finanzas',
    targetElement: '.summary-cards',
    position: 'bottom'
  },
  // ... más pasos
];
```

#### Componente Tutorial Interactivo
```typescript
// src/components/InteractiveTutorial.tsx
interface InteractiveTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}
```

---

### 2. Sistema de Tracking de Usuarios Nuevos

#### Base de Datos - Nueva Tabla `user_metadata`

```sql
CREATE TABLE user_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  account_age_days INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (NOW() - created_at))
  ) STORED,
  has_completed_tutorial BOOLEAN DEFAULT FALSE,
  tutorial_completed_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  is_new_user BOOLEAN GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (NOW() - created_at)) <= 7
  ) STORED,
  UNIQUE(user_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_user_metadata_user_id ON user_metadata(user_id);
CREATE INDEX idx_user_metadata_is_new ON user_metadata(is_new_user);

-- RLS Policies
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metadata"
  ON user_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own metadata"
  ON user_metadata FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para crear metadata al registrarse
CREATE OR REPLACE FUNCTION create_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_metadata (user_id, created_at)
  VALUES (NEW.id, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_metadata();

-- Trigger para actualizar last_login_at
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_metadata
  SET 
    last_login_at = NOW(),
    login_count = login_count + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Este trigger se activaría desde el código cuando el usuario inicie sesión
```

#### Servicio TypeScript

```typescript
// src/services/userMetadataService.ts
import { supabase } from '../supabaseClient';

export interface UserMetadata {
  id: string;
  user_id: string;
  created_at: string;
  account_age_days: number;
  has_completed_tutorial: boolean;
  tutorial_completed_at: string | null;
  last_login_at: string;
  login_count: number;
  is_new_user: boolean;
}

export const userMetadataService = {
  async getUserMetadata(userId: string): Promise<UserMetadata | null> {
    const { data, error } = await supabase
      .from('user_metadata')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user metadata:', error);
      return null;
    }
    
    return data;
  },

  async updateLastLogin(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_metadata')
      .update({
        last_login_at: new Date().toISOString(),
        login_count: supabase.rpc('increment_login_count', { user_id: userId })
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating last login:', error);
    }
  },

  async markTutorialComplete(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_metadata')
      .update({
        has_completed_tutorial: true,
        tutorial_completed_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking tutorial complete:', error);
    }
  },

  async shouldShowTutorial(userId: string): Promise<boolean> {
    const metadata = await this.getUserMetadata(userId);
    
    if (!metadata) return true; // Si no hay metadata, mostrar tutorial
    
    // Mostrar tutorial si:
    // 1. No ha completado el tutorial
    // 2. Es un usuario nuevo (menos de 7 días)
    return !metadata.has_completed_tutorial && metadata.is_new_user;
  }
};
```

#### Integración en App.tsx

```typescript
// En el useEffect de autenticación
useEffect(() => {
  const checkTutorialStatus = async () => {
    if (session?.user) {
      // Actualizar último login
      await userMetadataService.updateLastLogin(session.user.id);
      
      // Verificar si debe mostrar tutorial
      const shouldShow = await userMetadataService.shouldShowTutorial(session.user.id);
      
      if (shouldShow) {
        setShowTutorial(true);
      }
    }
  };
  
  checkTutorialStatus();
}, [session]);
```

---

### 3. Modo Demo Mejorado para Tutorial

#### Características
- **Datos de ejemplo pre-cargados**: Transacciones, metas, inventario
- **Tutorial automático**: Se activa al entrar en modo demo
- **Tooltips interactivos**: Guían al usuario por cada función
- **Sin persistencia**: Los cambios no se guardan (solo demostración)

#### Implementación
```typescript
const DEMO_DATA = {
  items: [
    { id: '1', name: 'Banco Principal', amount: 500, currency: 'USD', type: 'asset', category: 'Bank' },
    { id: '2', name: 'Préstamo Personal', amount: 200, currency: 'USD', type: 'liability', category: 'Debt' }
  ],
  goals: [
    { id: '1', name: 'Fondo de Emergencia', target_amount: 1000, current_amount: 300 }
  ],
  // ... más datos de ejemplo
};

const handleDemoLogin = async () => {
  // Cargar datos de demo
  setItems(DEMO_DATA.items);
  setGoals(DEMO_DATA.goals);
  
  // Activar tutorial automáticamente
  setShowTutorial(true);
  setIsDemoMode(true);
};
```

---

## 📊 Métricas a Trackear

### Tabla `user_analytics` (Opcional - Futuro)
```sql
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(50), -- 'tutorial_started', 'tutorial_completed', 'feature_used', etc.
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎨 Diseño del Tutorial Interactivo

### Componente Tooltip
```typescript
interface TooltipProps {
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
}
```

### Estilos
- **Overlay semi-transparente**: Oscurece el resto de la pantalla
- **Spotlight**: Resalta el elemento activo
- **Animaciones suaves**: Transiciones entre pasos
- **Responsive**: Funciona en móvil y desktop

---

## 🚀 Plan de Implementación

### Fase 1: Base de Datos (1-2 horas)
1. Crear tabla `user_metadata`
2. Crear triggers y funciones
3. Configurar RLS policies
4. Probar en Supabase

### Fase 2: Servicio de Metadata (1 hora)
1. Crear `userMetadataService.ts`
2. Implementar funciones CRUD
3. Integrar en App.tsx

### Fase 3: Tutorial Interactivo (3-4 horas)
1. Crear componente `InteractiveTutorial.tsx`
2. Crear componente `TutorialTooltip.tsx`
3. Definir pasos del tutorial
4. Implementar lógica de navegación
5. Agregar animaciones y estilos

### Fase 4: Modo Demo Mejorado (1-2 horas)
1. Crear datos de ejemplo
2. Modificar `handleDemoLogin`
3. Integrar con tutorial automático

### Fase 5: Testing y Ajustes (1-2 horas)
1. Probar flujo completo
2. Ajustar posiciones de tooltips
3. Optimizar rendimiento
4. Documentar

---

## 📝 Notas Adicionales

### Consideraciones de UX
- El tutorial debe ser **opcional** y **saltable** en cualquier momento
- Los usuarios experimentados deben poder **desactivarlo permanentemente**
- Debe haber un botón de **"Ver Tutorial"** en el menú para re-activarlo

### Almacenamiento Local
- Guardar preferencias de tutorial en `localStorage`
- Sincronizar con Supabase cuando sea posible

### Accesibilidad
- Asegurar que los tooltips sean accesibles por teclado
- Agregar atributos ARIA apropiados
- Contraste de colores adecuado

---

## ✅ Resumen de Cambios Actuales

1. ✅ **Eliminado**: Botón "Continuar sin cuenta (Modo Local)"
2. ✅ **Mantenido**: Botón "Modo Demo (Invitado)"
3. ✅ **Limpiado**: Código de `skipAuth` removido
4. 📋 **Pendiente**: Implementar tutorial interactivo
5. 📋 **Pendiente**: Crear sistema de tracking de usuarios nuevos

---

*Documento creado: 05/12/2025*
*Última actualización: 05/12/2025*
