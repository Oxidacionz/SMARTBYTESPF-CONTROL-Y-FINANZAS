/**
 * Error Boundary Component for Smart Bytes
 * Catches React errors and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { Button } from './atoms/Button';
import { Card } from './atoms/Card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console and logging service
        logger.error('React Error Boundary caught an error:', {
            error: error.toString(),
            componentStack: errorInfo.componentStack,
        });

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        // Reload the page to reset state
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                    <Card className="max-w-lg w-full p-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                ¡Ups! Algo salió mal
                            </h1>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="w-full mb-6 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        Detalles del error (solo en desarrollo)
                                    </summary>
                                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-48">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    icon={<RefreshCw size={16} />}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Recargar Aplicación
                                </Button>

                                <Button
                                    onClick={() => window.history.back()}
                                    variant="secondary"
                                >
                                    Volver Atrás
                                </Button>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                                Si el problema persiste, contacta al soporte técnico.
                            </p>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
