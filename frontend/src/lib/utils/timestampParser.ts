/**
 * Timestamp parsing utilities for extracting timestamps from text
 * Handles extraction of M:SS, MM:SS, or HH:MM:SS format from arbitrary text
 */

/**
 * Parses a timestamp (M:SS, MM:SS, or HH:MM:SS) from text and returns normalized HH:MM:SS format
 * 
 * @param text - Text that may contain a timestamp
 * @returns Normalized timestamp string in HH:MM:SS format, or null if not found
 * 
 * @example
 * parseTimestampFromText('This happens at 02:30 in the video') // '00:02:30'
 * parseTimestampFromText('This happens at 5:30 in the video') // '00:05:30'
 * parseTimestampFromText('Timestamp: 01:15:45') // '01:15:45'
 * parseTimestampFromText('No timestamp here') // null
 * parseTimestampFromText('Multiple times: 02:30 and 03:45') // '00:02:30' (first match)
 */
export function parseTimestampFromText(text: string | null | undefined): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Regex patterns (ordered from most specific to least specific):
  // HH:MM:SS pattern: 0-23 hours, 0-59 minutes, 0-59 seconds (3 parts)
  // MM:SS pattern: 00-59 minutes, 0-59 seconds (2 parts, 2-digit minutes)
  // M:SS pattern: 0-9 minutes, 0-59 seconds (2 parts, 1-digit minutes)
  const hhmmssPattern = /\b([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])\b/;
  const mmssPattern = /\b([0-5][0-9]):([0-5][0-9])\b/;
  const mssPattern = /\b([0-9]):([0-5][0-9])\b/;

  // Try HH:MM:SS first (most specific - 3 parts)
  const hhmmssMatch = text.match(hhmmssPattern);
  if (hhmmssMatch) {
    const hours = parseInt(hhmmssMatch[1], 10);
    const minutes = parseInt(hhmmssMatch[2], 10);
    const seconds = parseInt(hhmmssMatch[3], 10);

    // Validate ranges (regex should catch most, but double-check)
    if (
      hours >= 0 && hours <= 23 &&
      minutes >= 0 && minutes <= 59 &&
      seconds >= 0 && seconds <= 59
    ) {
      const pad = (num: number): string => num.toString().padStart(2, '0');
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  }

  // Try MM:SS pattern (2 parts, 2-digit minutes 00-59)
  const mmssMatch = text.match(mmssPattern);
  if (mmssMatch) {
    const minutes = parseInt(mmssMatch[1], 10);
    const seconds = parseInt(mmssMatch[2], 10);

    // Validate ranges
    if (minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
      const pad = (num: number): string => num.toString().padStart(2, '0');
      // Convert MM:SS to HH:MM:SS by prepending "00:"
      return `00:${pad(minutes)}:${pad(seconds)}`;
    }
  }

  // Try M:SS pattern (2 parts, 1-digit minutes 0-9)
  // This must come after MM:SS to avoid matching "12:34" as "1:234"
  const mssMatch = text.match(mssPattern);
  if (mssMatch) {
    const minutes = parseInt(mssMatch[1], 10);
    const seconds = parseInt(mssMatch[2], 10);

    // Validate ranges
    if (minutes >= 0 && minutes <= 9 && seconds >= 0 && seconds <= 59) {
      const pad = (num: number): string => num.toString().padStart(2, '0');
      // Convert M:SS to HH:MM:SS by prepending "00:"
      return `00:${pad(minutes)}:${pad(seconds)}`;
    }
  }

  return null;
}

