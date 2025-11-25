/**
 * Date utility functions for handling date conversions between ISO strings, Date objects, and display formats
 */

/**
 * Format a date for display as dd/mm/yyyy
 * @param dateInput - ISO string, Date object, or null
 * @returns Formatted date string (dd/mm/yyyy) or empty string if invalid
 */
export function formatDateDisplay(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Parse date string (ISO or dd/mm/yyyy) to Date object
 * @param dateString - Date string in ISO or dd/mm/yyyy format
 * @returns Date object or null if invalid
 */
export function parseISODate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    // Try ISO format first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) return isoDate;
    
    // Try dd/mm/yyyy format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert Date object to ISO date string (YYYY-MM-DD format)
 * @param date - Date object or null
 * @returns ISO date string or empty string if null
 */
export function dateToISO(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  return date.toISOString();
}

/**
 * Validate if a string is a valid ISO date
 * @param dateString - String to validate
 * @returns true if valid ISO date, false otherwise
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString().startsWith(dateString.substring(0, 10));
  } catch {
    return false;
  }
}

