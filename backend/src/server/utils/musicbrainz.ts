/**
 * MusicBrainz API Client Utility
 * 
 * Provides functions for searching and looking up music data from MusicBrainz API.
 * Includes rate limiting (1 request per second) and error handling.
 * 
 * MusicBrainz API Documentation: https://musicbrainz.org/doc/MusicBrainz_API
 */

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2';
const RATE_LIMIT_MS = 1000; // 1 request per second
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
const USER_AGENT = 'Jinglero/1.0.0 (https://jinglero.com)';

// Rate limiting state
let lastRequestTime = 0;
const requestQueue: Array<() => void> = [];

/**
 * Wait for rate limit to allow next request
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Make a request to MusicBrainz API with rate limiting and error handling
 */
async function makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  await waitForRateLimit();
  
  const url = new URL(`${MUSICBRAINZ_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Ensure JSON format
  if (!url.searchParams.has('fmt')) {
    url.searchParams.append('fmt', 'json');
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 429) {
      // Rate limited - wait longer and retry
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS * 2));
      return makeRequest<T>(endpoint, params);
    }
    
    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('MusicBrainz API request timeout');
    }
    
    if (error.message) {
      throw error;
    }
    
    throw new Error(`MusicBrainz API request failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * MusicBrainz API response types
 */
export interface MusicBrainzRecording {
  id: string;
  title: string;
  'artist-credit'?: Array<{
    name: string;
    artist?: {
      id: string;
      name: string;
    };
  }>;
  releases?: Array<{
    id: string;
    title: string;
    date?: string;
    'release-group'?: {
      id: string;
      title: string;
      'primary-type'?: string;
    };
  }>;
  tags?: Array<{
    name: string;
    count: number;
  }>;
}

export interface MusicBrainzArtist {
  id: string;
  name: string;
  'sort-name'?: string;
  disambiguation?: string;
  country?: string;
  tags?: Array<{
    name: string;
    count: number;
  }>;
  'life-span'?: {
    begin?: string;
    end?: string;
  };
}

export interface MusicBrainzSearchResponse<T> {
  count: number;
  offset: number;
  recordings?: T[];
  artists?: T[];
}

export interface MusicBrainzMatch {
  musicBrainzId: string;
  title: string;
  artist?: string;
  artistMusicBrainzId?: string; // MusicBrainz ID of the artist
  confidence: number; // 0.0 to 1.0
  source: 'musicbrainz_search' | 'musicbrainz_lookup';
  alternatives?: MusicBrainzMatch[];
  album?: string;
  year?: number;
  genre?: string;
}

/**
 * Calculate confidence score for a match
 * 
 * @param queryTitle - Original title from query
 * @param queryArtist - Original artist from query (optional)
 * @param matchTitle - Matched title from MusicBrainz
 * @param matchArtist - Matched artist from MusicBrainz (optional)
 * @returns Confidence score from 0.0 to 1.0
 */
function calculateConfidence(
  queryTitle: string,
  queryArtist: string | undefined,
  matchTitle: string,
  matchArtist: string | undefined
): number {
  // Normalize strings for comparison
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const normalizedQueryTitle = normalize(queryTitle);
  const normalizedMatchTitle = normalize(matchTitle);
  const normalizedQueryArtist = queryArtist ? normalize(queryArtist) : undefined;
  const normalizedMatchArtist = matchArtist ? normalize(matchArtist) : undefined;
  
  // Exact title match
  if (normalizedQueryTitle === normalizedMatchTitle) {
    if (normalizedQueryArtist && normalizedMatchArtist) {
      // Exact title + artist match
      if (normalizedQueryArtist === normalizedMatchArtist) {
        return 0.95; // Very high confidence
      }
      // Exact title but artist mismatch
      return 0.7; // Medium confidence
    }
    // Exact title match, no artist comparison
    return 0.9; // High confidence
  }
  
  // Partial title match
  if (normalizedMatchTitle.includes(normalizedQueryTitle) || normalizedQueryTitle.includes(normalizedMatchTitle)) {
    if (normalizedQueryArtist && normalizedMatchArtist) {
      // Partial title + artist match
      if (normalizedMatchArtist.includes(normalizedQueryArtist) || normalizedQueryArtist.includes(normalizedMatchArtist)) {
        return 0.85; // High confidence
      }
      return 0.65; // Medium-low confidence
    }
    return 0.75; // Medium confidence
  }
  
  // Very low match
  return 0.5;
}

/**
 * Search for recordings (Canciones) by title and optional artist
 * 
 * @param title - Song title to search for
 * @param artist - Optional artist name to narrow search
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of matches with confidence scores
 */
export async function searchRecording(
  title: string,
  artist?: string,
  limit: number = 10
): Promise<MusicBrainzMatch[]> {
  try {
    // Build query - quote titles and artist names to handle spaces and special characters
    // MusicBrainz search syntax requires quotes for phrases with spaces
    const escapeQuery = (str: string): string => {
      // If the string contains spaces or special characters, wrap it in quotes
      // Escape any existing quotes in the string
      const escaped = str.replace(/"/g, '\\"');
      // If it has spaces or special characters, quote it
      if (str.includes(' ') || str.includes('-') || str.includes('&')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const escapedTitle = escapeQuery(title.trim());
    let query = `recording:${escapedTitle}`;
    if (artist && artist.trim()) {
      const escapedArtist = escapeQuery(artist.trim());
      query += ` AND artist:${escapedArtist}`;
    }
    
    const response = await makeRequest<MusicBrainzSearchResponse<MusicBrainzRecording>>(
      '/recording/',
      {
        query,
        limit: limit.toString(),
      }
    );
    
    const recordings = response.recordings || [];
    
    // Convert to matches with confidence scores
    const matches: MusicBrainzMatch[] = recordings.map(recording => {
      const artistCredit = recording['artist-credit']?.[0];
      const artistName = artistCredit?.name || artistCredit?.artist?.name;
      const artistId = artistCredit?.artist?.id;
      
      const confidence = calculateConfidence(
        title,
        artist,
        recording.title,
        artistName
      );
      
      // Extract album and year from first release
      const firstRelease = recording.releases?.[0];
      const album = firstRelease?.title || firstRelease?.['release-group']?.title;
      const year = firstRelease?.date ? parseInt(firstRelease.date.split('-')[0]) : undefined;
      const genre = recording.tags?.[0]?.name;
      
      return {
        musicBrainzId: recording.id,
        title: recording.title,
        artist: artistName,
        artistMusicBrainzId: artistId,
        confidence,
        source: 'musicbrainz_search',
        album,
        year,
        genre,
      };
    });
    
    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  } catch (error: any) {
    // Return empty array on error (script will continue)
    console.error(`MusicBrainz search error for "${title}":`, error.message);
    return [];
  }
}

/**
 * Lookup recording details by MusicBrainz ID
 * 
 * @param mbid - MusicBrainz ID (UUID)
 * @returns Recording details or null if not found
 */
export async function lookupRecording(mbid: string): Promise<MusicBrainzMatch | null> {
  try {
    const recording = await makeRequest<MusicBrainzRecording>(
      `/recording/${mbid}`,
      {
        inc: 'artist-credits+releases+tags',
      }
    );
    
    const artistCredit = recording['artist-credit']?.[0];
    const artistName = artistCredit?.name || artistCredit?.artist?.name;
    const artistId = artistCredit?.artist?.id;
    
    // Extract album and year from first release
    const firstRelease = recording.releases?.[0];
    const album = firstRelease?.title || firstRelease?.['release-group']?.title;
    const year = firstRelease?.date ? parseInt(firstRelease.date.split('-')[0]) : undefined;
    const genre = recording.tags?.[0]?.name;
    
    return {
      musicBrainzId: recording.id,
      title: recording.title,
      artist: artistName,
      artistMusicBrainzId: artistId,
      confidence: 1.0, // Lookup by ID is always 100% confidence
      source: 'musicbrainz_lookup',
      album,
      year,
      genre,
    };
  } catch (error: any) {
    console.error(`MusicBrainz lookup error for ${mbid}:`, error.message);
    return null;
  }
}

/**
 * Search for artists by name
 * 
 * @param name - Artist name to search for
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of artist matches with confidence scores
 */
export async function searchArtist(
  name: string,
  limit: number = 10
): Promise<Array<{ musicBrainzId: string; name: string; confidence: number }>> {
  try {
    const response = await makeRequest<MusicBrainzSearchResponse<MusicBrainzArtist>>(
      '/artist/',
      {
        query: `artist:${name}`,
        limit: limit.toString(),
      }
    );
    
    const artists = response.artists || [];
    
    // Convert to matches with confidence scores
    const matches = artists.map(artist => {
      const normalizedQuery = name.toLowerCase().trim();
      const normalizedMatch = artist.name.toLowerCase().trim();
      
      let confidence = 0.5;
      
      // Exact match
      if (normalizedQuery === normalizedMatch) {
        confidence = 0.95;
      }
      // Partial match
      else if (normalizedMatch.includes(normalizedQuery) || normalizedQuery.includes(normalizedMatch)) {
        confidence = 0.8;
      }
      
      return {
        musicBrainzId: artist.id,
        name: artist.name,
        confidence,
      };
    });
    
    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  } catch (error: any) {
    // Return empty array on error (script will continue)
    console.error(`MusicBrainz artist search error for "${name}":`, error.message);
    return [];
  }
}

/**
 * Lookup artist details by MusicBrainz ID
 * 
 * @param mbid - MusicBrainz ID (UUID)
 * @returns Artist details or null if not found
 */
export async function lookupArtist(mbid: string): Promise<{
  musicBrainzId: string;
  name: string;
  bio?: string;
  genre?: string;
  country?: string;
} | null> {
  try {
    const artist = await makeRequest<MusicBrainzArtist>(
      `/artist/${mbid}`,
      {
        inc: 'tags',
      }
    );
    
    const genre = artist.tags?.[0]?.name;
    
    return {
      musicBrainzId: artist.id,
      name: artist.name,
      genre,
      country: artist.country,
      // Note: Bio is not available in MusicBrainz API without additional inc parameter
      // Would need to fetch from external sources or use disambiguation
    };
  } catch (error: any) {
    console.error(`MusicBrainz artist lookup error for ${mbid}:`, error.message);
    return null;
  }
}

