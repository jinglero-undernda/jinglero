/**
 * Fuzzy matching utilities for finding similar Canciones
 * Uses fuse.js for fuzzy string matching with similarity scoring
 */

import Fuse from 'fuse.js';
import type { Cancion } from '../../types';
import { adminApi } from '../api/client';

/**
 * Calculate similarity score between two strings using Levenshtein-like algorithm
 * Returns a value between 0.0 (no match) and 1.0 (exact match)
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0.0 to 1.0)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0.0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Use Fuse.js for fuzzy matching
  const fuse = new Fuse([s1], {
    threshold: 0.6, // 0.0 = exact match, 1.0 = match anything
    includeScore: true,
  });
  
  const results = fuse.search(s2);
  if (results.length > 0 && results[0].score !== undefined) {
    // Fuse.js returns 0 for exact match, higher values for less similar
    // Convert to similarity score (0.0 to 1.0)
    const score = results[0].score;
    return Math.max(0, 1 - score);
  }
  
  return 0.0;
}

/**
 * Search database for Canciones matching song title and optional artist name
 * Returns results sorted by similarity score (highest first)
 * 
 * @param songTitle - Song title to search for
 * @param artistName - Optional artist name to filter results
 * @returns Array of Canciones with similarity scores
 */
export async function searchDatabaseCanciones(
  songTitle: string,
  artistName?: string
): Promise<Array<{ cancion: Cancion; similarity: number }>> {
  if (!songTitle || songTitle.trim().length === 0) {
    return [];
  }

  try {
    // Search for Canciones using the search API
    const searchResults = await adminApi.search({
      q: songTitle,
      types: 'canciones',
      limit: 50, // Get more results to apply fuzzy matching
    });

    const canciones = searchResults.canciones || [];
    
    if (canciones.length === 0) {
      return [];
    }

    // Create Fuse instance for fuzzy matching on song titles
    const fuse = new Fuse(canciones, {
      keys: ['title'],
      threshold: 0.4, // Allow more fuzzy matches
      includeScore: true,
      minMatchCharLength: 2,
    });

    // Search with fuzzy matching
    const fuseResults = fuse.search(songTitle);
    
    // Convert Fuse results to similarity scores
    const matches: Array<{ cancion: Cancion; similarity: number }> = fuseResults
      .map((result) => {
        const cancion = result.item as Cancion;
        // Fuse.js score: 0 = perfect match, 1 = no match
        // Convert to similarity: 1.0 = perfect match, 0.0 = no match
        const titleSimilarity = result.score !== undefined ? Math.max(0, 1 - result.score) : 0;
        
        // If artist name is provided, also match against artist
        let artistSimilarity = 1.0; // Default: no artist filter
        if (artistName && cancion.autorIds && cancion.autorIds.length > 0) {
          // Note: We don't have artist names in the search results, only IDs
          // For now, we'll use title similarity only
          // In a full implementation, we'd need to fetch artist names or enhance the search API
          artistSimilarity = 1.0; // Assume match if artist IDs exist
        }
        
        // Combined similarity (weighted: 70% title, 30% artist if provided)
        const similarity = artistName
          ? titleSimilarity * 0.7 + artistSimilarity * 0.3
          : titleSimilarity;
        
        return {
          cancion,
          similarity,
        };
      })
      .filter((match) => match.similarity > 0.3) // Filter out very low similarity matches
      .sort((a, b) => b.similarity - a.similarity); // Sort by similarity descending

    return matches;
  } catch (error) {
    console.error('Error searching database Canciones:', error);
    return [];
  }
}

/**
 * Calculate similarity between two artist names
 * Useful for matching artist names when searching
 * 
 * @param artist1 - First artist name
 * @param artist2 - Second artist name
 * @returns Similarity score (0.0 to 1.0)
 */
export function calculateArtistSimilarity(artist1: string, artist2: string): number {
  return calculateSimilarity(artist1, artist2);
}

