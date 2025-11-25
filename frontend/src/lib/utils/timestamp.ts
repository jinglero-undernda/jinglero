/**
 * Timestamp parsing and formatting utilities
 * Handles conversion between seconds (numeric) and HH:MM:SS (string) formats
 */

/**
 * Converts seconds to HH:MM:SS format
 * 
 * @param seconds - Time in seconds (can be a decimal or integer)
 * @returns Formatted timestamp string (HH:MM:SS), zero-padded
 * 
 * @example
 * formatSecondsToTimestamp(3661) // '01:01:01'
 * formatSecondsToTimestamp(125) // '00:02:05'
 * formatSecondsToTimestamp(0) // '00:00:00'
 * formatSecondsToTimestamp(3600) // '01:00:00'
 */
export function formatSecondsToTimestamp(seconds: number): string {
  if (seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

/**
 * Parses HH:MM:SS timestamp string to seconds
 * 
 * @param timestamp - Timestamp string in HH:MM:SS format
 * @returns Time in seconds (integer)
 * @throws Error if timestamp format is invalid
 * 
 * @example
 * parseTimestampToSeconds('01:01:01') // 3661
 * parseTimestampToSeconds('00:02:05') // 125
 * parseTimestampToSeconds('00:00:00') // 0
 * parseTimestampToSeconds('01:00:00') // 3600
 */
export function parseTimestampToSeconds(timestamp: string): number {
  if (!timestamp || typeof timestamp !== 'string') {
    throw new Error('Invalid timestamp format. Expected HH:MM:SS string');
  }

  const parts = timestamp.split(':');
  if (parts.length !== 3) {
    throw new Error(`Invalid timestamp format. Expected HH:MM:SS, got: ${timestamp}`);
  }
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error(`Invalid timestamp format. Expected numeric values, got: ${timestamp}`);
  }

  // Validate ranges
  if (hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error(`Invalid timestamp values. Hours >= 0, 0 <= minutes < 60, 0 <= seconds < 60, got: ${timestamp}`);
  }
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Safely parses a timestamp string to seconds, returning null on error
 * 
 * @param timestamp - Timestamp string in HH:MM:SS format
 * @returns Time in seconds (integer) or null if parsing fails
 * 
 * @example
 * safeParseTimestampToSeconds('01:01:01') // 3661
 * safeParseTimestampToSeconds('invalid') // null
 * safeParseTimestampToSeconds('') // null
 */
export function safeParseTimestampToSeconds(timestamp: string | null | undefined): number | null {
  if (!timestamp) return null;
  
  try {
    return parseTimestampToSeconds(timestamp);
  } catch {
    return null;
  }
}

/**
 * Formats seconds to a more readable format (e.g., "1h 2m 3s" or "2m 3s")
 * Useful for display purposes where the full HH:MM:SS format might be too verbose
 * 
 * @param seconds - Time in seconds
 * @returns Human-readable time string
 * 
 * @example
 * formatSecondsToReadable(3661) // '1h 1m 1s'
 * formatSecondsToReadable(125) // '2m 5s'
 * formatSecondsToReadable(45) // '45s'
 * formatSecondsToReadable(3600) // '1h'
 */
export function formatSecondsToReadable(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }
  
  return parts.join(' ');
}

/**
 * Normalizes a timestamp value (string or number) to seconds
 * Handles both HH:MM:SS strings and numeric seconds
 * 
 * @param timestamp - Timestamp as string (HH:MM:SS) or number (seconds)
 * @returns Time in seconds, or null if invalid
 * 
 * @example
 * normalizeTimestampToSeconds('01:01:01') // 3661
 * normalizeTimestampToSeconds(3661) // 3661
 * normalizeTimestampToSeconds(null) // null
 */
export function normalizeTimestampToSeconds(
  timestamp: string | number | null | undefined
): number | null {
  if (timestamp === null || timestamp === undefined) {
    return null;
  }
  
  if (typeof timestamp === 'number') {
    return isNaN(timestamp) ? null : Math.floor(timestamp);
  }
  
  if (typeof timestamp === 'string') {
    return safeParseTimestampToSeconds(timestamp);
  }
  
  return null;
}

