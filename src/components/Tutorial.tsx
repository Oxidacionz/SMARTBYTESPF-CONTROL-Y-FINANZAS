import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MessageSquarePlus } from 'lucide-react';

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
        position: 'bottom'
    },
    {
        title: 'Tasas de Cambio',
        description: 'Visualiza las tasas del BCV (Dólar y Euro) y Binance en tiempo real. Se actualizan automáticamente cada 5 minutos.',
        target: '.rates-dashboard',
        position: 'bottom'
    },
    {
        title: 'Botones de Agregar',
        description: 'Usa estos botones para agregar rápidamente: lo que TIENES, lo que TE DEBEN, GASTOS/DEUDAS, o metas de AHORRO.',
        target: '.add-buttons-section',
        position: 'top'
    },
    {
        title: 'Navegación por Pestañas',
        description: 'Cambia entre diferentes vistas: Resumen, Activos, Pasivos, Inventario, Historial de Gastos y Asesor IA.',
        target: '.nav-tabs',
        position: 'top'
    },
    {
        title: 'Gestión de Deudas',
        description: 'Puedes liquidar deudas o cobrar lo que te deben usando el botón de intercambio en cada registro.',
        // target: undefined (General info)
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
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [suggestionText, setSuggestionText] = useState('');

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
            {/* Spotlight Effect Layer */}
            {targetElement ? (
                <div
                    className="absolute border-2 border-blue-400/70 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.5)] pointer-events-none transition-all duration-300 z-[90]"
                    style={{
                        top: `${targetElement.getBoundingClientRect().top - 8}px`,
                        left: `${targetElement.getBoundingClientRect().left - 8}px`,
                        width: `${targetElement.getBoundingClientRect().width + 16}px`,
                        height: `${targetElement.getBoundingClientRect().height + 16}px`,
                        // The huge box shadow dims the rest of the screen while keeping the inside clear
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
                    }}
                />
            ) : (
                <div className="absolute inset-0 bg-slate-900/90 z-[90]" />
            )}


            {/* Tutorial Card */}
            <div
                className="absolute bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl p-6 max-w-md w-full transition-all duration-300 ring-1 ring-white/10 z-[100]"
                style={tooltipStyle}
            >
                {/* Decorative Elements (Blue Theme) */}
                <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-tr-2xl -z-10"></div>
                <div className="absolute -bottom-1 -left-1 w-20 h-20 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-bl-2xl -z-10"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200 bg-clip-text text-transparent mb-1">
                            {showSuggestion ? 'Tu Opinión Importa' : step.title}
                        </h3>
                        {!showSuggestion && (
                            <p className="text-xs text-slate-400">
                                Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                {showSuggestion ? (
                    <div className="mb-4">
                        <p className="text-slate-300 mb-3 text-sm">¿Qué te gustaría mejorar? Te leemos:</p>
                        <textarea
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-3 resize-none h-24"
                            placeholder="Escribe tu sugerencia aquí..."
                            value={suggestionText}
                            onChange={(e) => setSuggestionText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowSuggestion(false)}
                                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    alert('¡Gracias! Tu sugerencia ha sido enviada.');
                                    setSuggestionText('');
                                    setShowSuggestion(false);
                                }}
                                className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-cyan-900/40"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                            {step.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-6 relative">
                            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-300 relative"
                                    style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevious}
                                    disabled={isFirstStep}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border border-transparent ${isFirstStep
                                        ? 'text-slate-600 cursor-not-allowed'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setShowSuggestion(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-cyan-500/80 hover:text-cyan-300 hover:bg-cyan-900/20 border border-transparent hover:border-cyan-500/30"
                                >
                                    <MessageSquarePlus size={14} />
                                    Buzón de Sugerencias
                                </button>
                            </div>

                            {!isLastStep ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-900/40 text-sm font-medium"
                                >
                                    Siguiente
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSkip}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-900/40 text-sm font-medium"
                                >
                                    ¡Finalizar!
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
