import React, { useState, useEffect } from 'react';
import { TutorialTooltip } from './TutorialTooltip';
import {
    tutorialSteps,
    isFirstStep,
    isLastStep,
    getNextStep,
    getPreviousStep,
    getTutorialStepIndex
} from '../../data/tutorialSteps';

interface InteractiveTutorialProps {
    onComplete: () => void;
    onSkip: () => void;
    autoStart?: boolean;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
    onComplete,
    onSkip,
    autoStart = true
}) => {
    const [currentStepId, setCurrentStepId] = useState(tutorialSteps[0].id);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);

    const currentStep = tutorialSteps.find(step => step.id === currentStepId);
    const currentIndex = getTutorialStepIndex(currentStepId);

    useEffect(() => {
        if (autoStart) {
            // Pequeño delay para que la página cargue
            setTimeout(() => {
                setIsVisible(true);
                updateTooltipPosition();
            }, 500);
        }
    }, [autoStart]);

    useEffect(() => {
        if (isVisible && currentStep) {
            updateTooltipPosition();
            highlightElement();
        }

        // Cleanup
        return () => {
            removeHighlight();
        };
    }, [currentStepId, isVisible]);

    const updateTooltipPosition = () => {
        if (!currentStep) return;

        const targetElement = document.querySelector(currentStep.targetElement);

        if (!targetElement) {
            console.warn(`Element not found: ${currentStep.targetElement}`);
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const padding = currentStep.highlightPadding || 10;

        let top = 0;
        let left = 0;

        switch (currentStep.position) {
            case 'bottom':
                top = rect.bottom + padding + window.scrollY;
                left = rect.left + rect.width / 2 + window.scrollX;
                break;
            case 'top':
                top = rect.top - padding + window.scrollY;
                left = rect.left + rect.width / 2 + window.scrollX;
                break;
            case 'left':
                top = rect.top + rect.height / 2 + window.scrollY;
                left = rect.left - padding + window.scrollX;
                break;
            case 'right':
                top = rect.top + rect.height / 2 + window.scrollY;
                left = rect.right + padding + window.scrollX;
                break;
            case 'center':
                // Center position is handled by CSS
                break;
        }

        setTooltipPosition({ top, left });
    };

    const highlightElement = () => {
        if (!currentStep || currentStep.position === 'center') return;

        // Remove previous highlight
        removeHighlight();

        const targetElement = document.querySelector(currentStep.targetElement);
        if (!targetElement) return;

        // Add highlight class
        targetElement.classList.add('tutorial-highlight');

        // Scroll element into view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const removeHighlight = () => {
        const highlighted = document.querySelector('.tutorial-highlight');
        if (highlighted) {
            highlighted.classList.remove('tutorial-highlight');
        }
    };

    const handleNext = () => {
        const nextStep = getNextStep(currentStepId);
        if (nextStep) {
            setCurrentStepId(nextStep.id);
        }
    };

    const handlePrevious = () => {
        const prevStep = getPreviousStep(currentStepId);
        if (prevStep) {
            setCurrentStepId(prevStep.id);
        }
    };

    const handleSkip = () => {
        removeHighlight();
        setIsVisible(false);
        onSkip();
    };

    const handleFinish = () => {
        removeHighlight();
        setIsVisible(false);
        onComplete();
    };

    if (!isVisible || !currentStep) return null;

    return (
        <>
            {/* Overlay oscuro */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-fade-in"
                onClick={handleSkip}
            />

            {/* Tooltip */}
            <div
                style={currentStep.position !== 'center' ? tooltipPosition : undefined}
                className="z-[9999]"
            >
                <TutorialTooltip
                    title={currentStep.title}
                    description={currentStep.description}
                    currentStep={currentIndex}
                    totalSteps={tutorialSteps.length}
                    position={currentStep.position}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSkip={handleSkip}
                    onFinish={handleFinish}
                    isFirst={isFirstStep(currentStepId)}
                    isLast={isLastStep(currentStepId)}
                />
            </div>

            {/* Estilos para el highlight */}
            <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9997;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </>
    );
};
