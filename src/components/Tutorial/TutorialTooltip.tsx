import React from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../atoms/Button';

interface TutorialTooltipProps {
    title: string;
    description: string;
    currentStep: number;
    totalSteps: number;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    onFinish: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
    title,
    description,
    currentStep,
    totalSteps,
    position,
    onNext,
    onPrevious,
    onSkip,
    onFinish,
    isFirst,
    isLast
}) => {
    const getPositionClasses = () => {
        if (position === 'center') {
            return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
        }
        return 'absolute';
    };

    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className={`${getPositionClasses()} z-[9999] max-w-md animate-fade-in`}>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20">
                {/* Header */}
                <div className="p-4 pb-2">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-white pr-8">{title}</h3>
                        <button
                            onClick={onSkip}
                            className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                            aria-label="Cerrar tutorial"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="text-xs text-white/70 mt-1">
                        Paso {currentStep + 1} de {totalSteps}
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                    <p className="text-white/90 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                        {!isFirst && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onPrevious}
                                icon={<ChevronLeft size={16} />}
                                className="text-white hover:bg-white/10 border-white/20"
                            >
                                Anterior
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {!isLast ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onSkip}
                                    className="text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                    Saltar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onNext}
                                    className="bg-white text-blue-600 hover:bg-white/90 font-semibold"
                                    icon={<ChevronRight size={16} />}
                                >
                                    Siguiente
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                onClick={onFinish}
                                className="bg-green-500 text-white hover:bg-green-600 font-semibold"
                                icon={<Check size={16} />}
                            >
                                ¡Entendido!
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Arrow indicator (except for center position) */}
            {position !== 'center' && (
                <div className={`absolute w-0 h-0 border-8 ${position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-b-blue-600 border-t-0' :
                        position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-t-blue-600 border-b-0' :
                            position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-l-blue-600 border-r-0' :
                                'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-r-blue-600 border-l-0'
                    }`} />
            )}
        </div>
    );
};
