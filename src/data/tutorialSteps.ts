export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetElement: string; // CSS selector
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    highlightPadding?: number;
}

/**
 * Tutorial Interactivo - Versión Corta (< 2 minutos)
 * 6 pasos esenciales para entender la aplicación
 */
export const tutorialSteps: TutorialStep[] = [
    {
        id: 'step-1',
        title: '¡Bienvenido a Smart Bytes! 👋',
        description: 'Esta es tu aplicación de finanzas personales. Aquí verás un resumen de tu situación financiera: liquidez, ahorros, patrimonio, deudas y gastos fijos.',
        targetElement: '.summary-section',
        position: 'bottom',
        highlightPadding: 10
    },
    {
        id: 'step-2',
        title: 'Tasas de Cambio en Tiempo Real 💱',
        description: 'Las tasas del BCV y Binance se actualizan automáticamente cada 4 horas. Puedes ver el dólar, euro y las tasas de compra/venta de USDT.',
        targetElement: '.rates-dashboard',
        position: 'bottom',
        highlightPadding: 10
    },
    {
        id: 'step-3',
        title: 'Navegación por Secciones 📊',
        description: 'Usa estos tabs para navegar: Resumen, Tengo/Me Deben, Debo/Gastos, Metas, Inventario y Plan Financiero. Cada sección te ayuda a organizar tus finanzas.',
        targetElement: '.flex.flex-wrap.gap-2',
        position: 'bottom',
        highlightPadding: 10
    },
    {
        id: 'step-4',
        title: 'Agregar Transacciones ➕',
        description: 'Haz clic en "+ Agregar" para registrar ingresos, gastos, deudas o cuentas por cobrar. También puedes usar "Gastos Hormiga" para compras pequeñas.',
        targetElement: '.bg-blue-600.text-white',
        position: 'left',
        highlightPadding: 10
    },
    {
        id: 'step-5',
        title: 'Directorio y Agenda 📅',
        description: 'En el panel derecho encontrarás tu directorio de contactos financieros y una agenda con fechas importantes como cumpleaños y pagos.',
        targetElement: '.sidebar',
        position: 'left',
        highlightPadding: 10
    },
    {
        id: 'step-6',
        title: '¡Listo para Empezar! 🚀',
        description: 'Ya conoces lo básico. Explora las demás funciones como Metas, Inventario y el Asesor Financiero. ¡Empieza a tomar control de tus finanzas!',
        targetElement: 'body',
        position: 'center',
        highlightPadding: 0
    }
];

/**
 * Obtiene el paso del tutorial por ID
 */
export function getTutorialStep(stepId: string): TutorialStep | undefined {
    return tutorialSteps.find(step => step.id === stepId);
}

/**
 * Obtiene el índice de un paso
 */
export function getTutorialStepIndex(stepId: string): number {
    return tutorialSteps.findIndex(step => step.id === stepId);
}

/**
 * Verifica si es el primer paso
 */
export function isFirstStep(stepId: string): boolean {
    return getTutorialStepIndex(stepId) === 0;
}

/**
 * Verifica si es el último paso
 */
export function isLastStep(stepId: string): boolean {
    return getTutorialStepIndex(stepId) === tutorialSteps.length - 1;
}

/**
 * Obtiene el siguiente paso
 */
export function getNextStep(currentStepId: string): TutorialStep | null {
    const currentIndex = getTutorialStepIndex(currentStepId);
    if (currentIndex === -1 || currentIndex === tutorialSteps.length - 1) {
        return null;
    }
    return tutorialSteps[currentIndex + 1];
}

/**
 * Obtiene el paso anterior
 */
export function getPreviousStep(currentStepId: string): TutorialStep | null {
    const currentIndex = getTutorialStepIndex(currentStepId);
    if (currentIndex <= 0) {
        return null;
    }
    return tutorialSteps[currentIndex - 1];
}
