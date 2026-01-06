import crypto from "crypto";

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Desired string length
 * @returns {string} Random string
 */

export function generateSecureRandomString(length: number): string {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("Length must be a positive integer");
    }

    // Characters to choose from
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    // Generate random bytes
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        // Map byte value to character index
        result += chars[(randomBytes[i] as any) % charsLength];
    }

    return result
}


/**
 * Generate a simple random string (not cryptographically secure)
 * @param {number} length - Desired string length
 * @returns {string} Random string
 */

export function generateSimpleRandomString(length: number): string {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("Length must be a positive integer");
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;

}
