/**
 * Convert date string to ISO format for Neo4j datetime conversion
 * Handles DD/MM/YYYY, MM/DD/YYYY, and ISO formats
 * @param dateStr - Date string in various formats
 * @returns ISO date string or null if invalid
 * @throws Error if date is required but invalid
 */
export function parseDateToISO(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  const trimmed = dateStr.trim();
  
  // Already in ISO format
  if (trimmed.includes('T') || trimmed.includes('Z')) {
    return trimmed;
  }
  
  // Handle DD/MM/YYYY format
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [part1, part2, part3] = parts;
      
      // Determine if it's DD/MM/YYYY or MM/DD/YYYY
      // If first part > 12, it's likely DD/MM/YYYY
      // If second part > 12, it's likely MM/DD/YYYY
      let day: string, month: string, year: string;
      
      if (parseInt(part1, 10) > 12) {
        // DD/MM/YYYY format
        day = part1.padStart(2, '0');
        month = part2.padStart(2, '0');
        year = part3;
      } else if (parseInt(part2, 10) > 12) {
        // MM/DD/YYYY format
        month = part1.padStart(2, '0');
        day = part2.padStart(2, '0');
        year = part3;
      } else {
        // Ambiguous - assume DD/MM/YYYY (more common in your system)
        day = part1.padStart(2, '0');
        month = part2.padStart(2, '0');
        year = part3;
      }
      
      return `${year}-${month}-${day}T00:00:00.000Z`;
    }
  }
  
  // Handle YYYY-MM-DD format
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${trimmed}T00:00:00.000Z`;
  }
  
  // Try to parse as ISO date
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  return null;
}

/**
 * Convert date string to ISO format, throwing an error if invalid
 * @param dateStr - Date string in various formats
 * @returns ISO date string
 * @throws Error if date is invalid
 */
export function parseDateToISORequired(dateStr: string): string {
  const iso = parseDateToISO(dateStr);
  if (!iso) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return iso;
}





