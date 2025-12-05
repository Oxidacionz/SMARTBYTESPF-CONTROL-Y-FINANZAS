/**
 * Validation utilities for Smart Bytes application
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate that a number is positive
 * @param value - Number to validate
 * @returns True if positive
 */
export const isPositiveNumber = (value: number): boolean => {
    return !isNaN(value) && value > 0;
};

/**
 * Validate that a string is not empty
 * @param value - String to validate
 * @returns True if not empty
 */
export const isNotEmpty = (value: string): boolean => {
    return value.trim().length > 0;
};

/**
 * Validate date format (YYYY-MM-DD or MM-DD)
 * @param date - Date string to validate
 * @returns True if valid format
 */
export const isValidDateFormat = (date: string): boolean => {
    const fullDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const monthDayRegex = /^\d{2}-\d{2}$/;
    return fullDateRegex.test(date) || monthDayRegex.test(date);
};

/**
 * Validate that a value is within a range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};
