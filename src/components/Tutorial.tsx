import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialStep {
    title: string;
    description: string;
    target?: string; // CSS selector for element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: '¡Bienvenido a Smart Bytes!',
        description: 'Esta es tu aplicación de control financiero personal. Te guiaremos por las funciones principales.',
    },
    {
        title: 'Panel de Resumen',
        description: 'Aquí ves tu liquidez total, patrimonio físico, deudas y gastos fijos mensuales en tiempo real.',
        target: '.summary-cards',
    },
    {
        title: 'Tasas de Cambio',
        description: 'Actualiza manualmente las tasas del BCV (Dólar y Euro) y Binance. Pronto se actualizarán automáticamente.',
        target: '.rates-dashboard',
    },
    {
        title: 'Botones de Agregar',
        description: 'Usa estos botones para agregar rápidamente: lo que TIENES, lo que TE DEBEN, GASTOS/DEUDAS, o metas de AHORRO.',
        target: '.add-buttons-section',
    },
    {
        title: 'Navegación por Pestañas',
        description: 'Cambia entre diferentes vistas: Resumen, Activos, Pasivos, Inventario, Historial de Gastos y Asesor IA.',
        target: '.nav-tabs',
    },
    {
        title: 'Gestión de Deudas',
        description: 'Puedes liquidar deudas o cobrar lo que te deben usando el botón de intercambio en cada registro.',
    },
    {
        title: '¡Listo para Empezar!',
        description: 'Ya conoces lo básico. Comienza agregando tus cuentas y activos para tener control total de tus finanzas.',
    },
];

interface TutorialProps {
    onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    useEffect(() => {
        if (step.target) {
            const element = document.querySelector(step.target) as HTMLElement;
            setTargetElement(element);

            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setTargetElement(null);
        }
    }, [currentStep, step.target]);

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    // Calculate position for tooltip
    const getTooltipPosition = () => {
        if (!targetElement) {
            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }

        const rect = targetElement.getBoundingClientRect();
        const position = step.position || 'bottom';

        switch (position) {
            case 'top':
                return { top: `${rect.top - 20}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translate(-50%, -100%)' };
            case 'bottom':
                return { top: `${rect.bottom + 20}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translate(-50%, 0)' };
            case 'left':
                return { top: `${rect.top + rect.height / 2}px`, left: `${rect.left - 20}px`, transform: 'translate(-100%, -50%)' };
            case 'right':
                return { top: `${rect.top + rect.height / 2}px`, left: `${rect.right + 20}px`, transform: 'translate(0, -50%)' };
            default:
                return { top: `${rect.bottom + 20}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translate(-50%, 0)' };
        }
    };

    const tooltipStyle = getTooltipPosition();

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay with spotlight effect */}
            <div className="absolute inset-0 bg-black bg-opacity-70 transition-opacity">
                {targetElement && (
                    <div
                        className="absolute border-4 border-blue-400 rounded-lg shadow-2xl pointer-events-none transition-all duration-300"
                        style={{
                            top: `${targetElement.getBoundingClientRect().top - 8}px`,
                            left: `${targetElement.getBoundingClientRect().left - 8}px`,
                            width: `${targetElement.getBoundingClientRect().width + 16}px`,
                            height: `${targetElement.getBoundingClientRect().height + 16}px`,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                        }}
                    />
                )}
            </div>

            {/* Tutorial Card */}
            <div
                className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full transition-all duration-300"
                style={tooltipStyle}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {step.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
                        </p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {step.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handlePrevious}
                        disabled={isFirstStep}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isFirstStep
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <ChevronLeft size={18} />
                        Anterior
                    </button>

                    <button
                        onClick={handleSkip}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        Saltar Tutorial
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        {isLastStep ? 'Finalizar' : 'Siguiente'}
                        {!isLastStep && <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
