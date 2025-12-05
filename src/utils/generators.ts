/**
 * Generator utilities for Smart Bytes application
 */

/**
 * Generate a unique ID for database records
 * Uses timestamp + random string for uniqueness
 * @returns Unique ID string
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Generate a random color in hex format
 * @returns Hex color string (e.g., "#A1B2C3")
 */
export const generateRandomColor = (): string => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

/**
 * Generate initials from a name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export const generateInitials = (name: string): string => {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};
