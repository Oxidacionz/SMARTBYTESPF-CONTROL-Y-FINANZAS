/**
 * Error handling utilities for Smart Bytes application
 */

import { logger } from './logger';

/**
 * Custom error classes
 */
export class ValidationError extends Error {
    constructor(message: string, public field?: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NetworkError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class DatabaseError extends Error {
    constructor(message: string, public originalError?: unknown) {
        super(message);
        this.name = 'DatabaseError';
    }
}

/**
 * Get user-friendly error message from error object
 * @param error - Error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ValidationError) {
        return error.field
            ? `Error en ${error.field}: ${error.message}`
            : error.message;
    }

    if (error instanceof NetworkError) {
        if (error.statusCode === 404) {
            return 'Recurso no encontrado';
        }
        if (error.statusCode === 403) {
            return 'No tienes permisos para realizar esta acción';
        }
        if (error.statusCode === 500) {
            return 'Error del servidor. Por favor intenta más tarde';
        }
        return error.message || 'Error de conexión';
    }

    if (error instanceof AuthenticationError) {
        return 'Error de autenticación. Por favor inicia sesión nuevamente';
    }

    if (error instanceof DatabaseError) {
        return 'Error al guardar los datos. Por favor intenta nuevamente';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Ha ocurrido un error inesperado';
};

/**
 * Handle and log error appropriately
 * @param error - Error object
 * @param context - Context where error occurred
 * @returns User-friendly error message
 */
export const handleError = (error: unknown, context: string): string => {
    const message = getErrorMessage(error);

    // Log error with context
    logger.error(`Error in ${context}:`, error);

    return message;
};

/**
 * Async error wrapper for try-catch blocks
 * @param fn - Async function to wrap
 * @param context - Context for error logging
 * @returns Result or null if error occurred
 */
export async function tryCatch<T>(
    fn: () => Promise<T>,
    context: string
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        handleError(error, context);
        return null;
    }
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param context - Context for logging
 * @returns Result or throws error
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    context: string = 'operation'
): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const delay = Math.pow(2, i) * 1000; // Exponential backoff
            logger.warn(`Retry ${i + 1}/${maxRetries} for ${context} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}
