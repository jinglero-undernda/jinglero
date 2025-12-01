/**
 * Comment parsing utilities for extracting song information from Jingle comments
 * Handles various patterns like "Song Title - Artist Name", "Song Title by Artist Name", etc.
 */

import { parseTimestampFromText } from './timestampParser';
import { parseTimestampToSeconds } from './timestamp';

/**
 * Parsed comment data with confidence scores
 */
export interface ParsedComment {
  songTitle?: string;
  artistName?: string;
  timestamp?: number; // seconds
  timestampFormatted?: string; // HH:MM:SS format
  contributor?: string;
  jingleTitle?: string;
  commentary?: string;
  confidence: {
    songTitle: 'high' | 'medium' | 'low';
    artistName: 'high' | 'medium' | 'low';
  };
  overallConfidence: number; // 0.0 to 1.0
}

/**
 * Parse Jingle comment to extract song title, artist name, and other metadata
 * 
 * Common patterns:
 * 1. "Song Title - Artist Name"
 * 2. "Artist Name - Song Title"
 * 3. "Song Title by Artist Name"
 * 4. "Song Title (Artist Name)"
 * 5. Timestamp at start: "00:02:30 Song Title - Artist"
 * 6. Contributor mention: "Song Title - Artist (contributed by Contributor)"
 * 
 * @param comment - Jingle comment text
 * @param title - Optional Jingle title (for comparison)
 * @returns Parsed comment data with confidence scores
 */
export function parseJingleComment(comment: string | null | undefined, title?: string): ParsedComment {
  const result: ParsedComment = {
    confidence: { songTitle: 'low', artistName: 'low' },
    overallConfidence: 0.0,
  };

  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    return result;
  }

  // Extract timestamp (HH:MM:SS or MM:SS format)
  const timestampFormatted = parseTimestampFromText(comment);
  if (timestampFormatted) {
    result.timestampFormatted = timestampFormatted;
    result.timestamp = parseTimestampToSeconds(timestampFormatted);
  }

  // Remove timestamp from text for further parsing
  let text = comment;
  if (timestampFormatted) {
    // Remove the timestamp pattern from the text
    text = text.replace(/(\d{1,2}):(\d{2}):?(\d{2})?/, '').trim();
  }

  // Extract contributor (pattern: "contributed by X" or "by X" at the end)
  const contributorPattern = /(?:contributed\s+by|by)\s+([A-Za-z\s]+?)(?:\)|$)/i;
  const contributorMatch = text.match(contributorPattern);
  if (contributorMatch) {
    result.contributor = contributorMatch[1].trim();
    // Remove contributor from text
    text = text.replace(contributorPattern, '').trim();
  }

  // Pattern 1: "Song Title - Artist Name"
  const dashPattern = /^(.+?)\s*-\s*(.+)$/;
  const dashMatch = text.match(dashPattern);
  if (dashMatch) {
    const part1 = dashMatch[1].trim();
    const part2 = dashMatch[2].trim();
    
    // Heuristic: if part2 is shorter or contains common artist indicators, it's likely the artist
    // Otherwise, assume part1 is song title and part2 is artist
    if (part2.length < part1.length || part2.match(/\b(and|&|feat\.|ft\.|with)\b/i)) {
      result.songTitle = part1;
      result.artistName = part2;
    } else {
      // Could be "Artist - Song Title" format, but default to "Song - Artist"
      result.songTitle = part1;
      result.artistName = part2;
    }
    
    result.confidence.songTitle = 'high';
    result.confidence.artistName = 'high';
    result.overallConfidence = 0.9;
    return result;
  }

  // Pattern 2: "Song Title by Artist Name"
  const byPattern = /^(.+?)\s+by\s+(.+)$/i;
  const byMatch = text.match(byPattern);
  if (byMatch) {
    result.songTitle = byMatch[1].trim();
    result.artistName = byMatch[2].trim();
    result.confidence.songTitle = 'high';
    result.confidence.artistName = 'high';
    result.overallConfidence = 0.9;
    return result;
  }

  // Pattern 3: "Song Title (Artist Name)"
  const parenPattern = /^(.+?)\s*\((.+?)\)/;
  const parenMatch = text.match(parenPattern);
  if (parenMatch) {
    result.songTitle = parenMatch[1].trim();
    result.artistName = parenMatch[2].trim();
    result.confidence.songTitle = 'high';
    result.confidence.artistName = 'medium';
    result.overallConfidence = 0.75;
    return result;
  }

  // Pattern 4: "Artist Name - Song Title" (reversed dash pattern)
  // Check if first part looks like an artist name (shorter, or contains common artist words)
  const reversedDashPattern = /^(.+?)\s*-\s*(.+)$/;
  const reversedMatch = text.match(reversedDashPattern);
  if (reversedMatch) {
    const part1 = reversedMatch[1].trim();
    const part2 = reversedMatch[2].trim();
    
    // If part1 is shorter and part2 is longer, might be "Artist - Song"
    if (part1.length < part2.length && part1.length < 30) {
      result.artistName = part1;
      result.songTitle = part2;
      result.confidence.songTitle = 'medium';
      result.confidence.artistName = 'medium';
      result.overallConfidence = 0.7;
      return result;
    }
  }

  // If no clear pattern, use entire text as potential song title
  if (text.length > 0) {
    result.songTitle = text;
    result.confidence.songTitle = 'low';
    result.overallConfidence = 0.3;
  }

  // Check if title property contains additional info
  if (title && title !== text && title !== comment) {
    result.jingleTitle = title;
  }

  // Store remaining text as commentary if we extracted structured data
  if (result.songTitle && text !== result.songTitle) {
    result.commentary = text.replace(result.songTitle, '').trim();
  }

  return result;
}

