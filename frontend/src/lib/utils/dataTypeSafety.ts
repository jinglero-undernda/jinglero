/**
 * Data type safety utilities for sanitizing form inputs and preventing NaN values
 */

/**
 * Sanitize numeric field values to prevent NaN
 * Converts empty strings, null, undefined, or invalid numbers to null or a default value
 * @param value - Value to sanitize
 * @param defaultValue - Default value if sanitization fails (defaults to null)
 * @returns Sanitized number or null
 */
export function sanitizeNumericField(value: any, defaultValue?: number | null): number | null {
  if (value === null || value === undefined || value === '') return defaultValue ?? null;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? (defaultValue ?? null) : num;
}

/**
 * Sanitize string field values
 * Converts null or undefined to empty string or default value
 * @param value - Value to sanitize
 * @param defaultValue - Default value if null/undefined (defaults to empty string)
 * @returns Sanitized string
 */
export function sanitizeStringField(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

/**
 * Sanitize boolean field values
 * Converts null or undefined to false or default value
 * @param value - Value to sanitize
 * @param defaultValue - Default value if null/undefined (defaults to false)
 * @returns Sanitized boolean
 */
export function sanitizeBooleanField(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  return Boolean(value);
}

