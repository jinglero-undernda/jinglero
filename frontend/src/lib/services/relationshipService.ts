import { publicApi } from '../api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import {
  ArtistaArraySchema,
  CancionArraySchema,
  FabricaArraySchema,
  JingleArraySchema,
  // JingleWithRelationsArraySchema,
  JinglePartialArraySchema,
  JinglePartialSchema,
  JingleDetailResponseSchema,
  TematicaArraySchema,
  safeParse,
  safeParseArray,
} from '../validation/relationshipSchemas';
import { sortJingleRepeats } from '../utils/entitySorters';

/**
 * Convert Neo4j date objects to ISO date strings
 * Neo4j returns dates as objects with year, month, day, etc. properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertNeo4jDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object') {
    // Handle Neo4j DateTime objects
    if (obj.year !== undefined && obj.month !== undefined && obj.day !== undefined) {
      const year = typeof obj.year === 'object' ? obj.year.low : obj.year;
      const month = typeof obj.month === 'object' ? obj.month.low : obj.month;
      const day = typeof obj.day === 'object' ? obj.day.low : obj.day;
      const hour = typeof obj.hour === 'object' ? (obj.hour?.low || 0) : (obj.hour || 0);
      const minute = typeof obj.minute === 'object' ? (obj.minute?.low || 0) : (obj.minute || 0);
      const second = typeof obj.second === 'object' ? (obj.second?.low || 0) : (obj.second || 0);
      
      try {
        return new Date(year, month - 1, day, hour, minute, second).toISOString();
      } catch {
        return null;
      }
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(convertNeo4jDates);
    }
    
    // Handle objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertNeo4jDates(value);
    }
    return converted;
  }
  
  return obj;
}

/**
 * Task 32: API Service Layer for Relationship Fetching
 * 
 * This module contains all functions that fetch related entities from the API.
 * All functions include Zod validation for type safety.
 */

// Type for Jingle detail response with relationships
interface JingleDetailResponse extends Jingle {
  fabrica?: Fabrica | null;
  cancion?: Cancion | null;
  jingleros?: Artista[];
  autores?: Artista[];
  tematicas?: Tematica[];
}

// Type for relationship items from /entities/:type/:id/relationships endpoint
// This matches the actual API response structure (different from Relationship type)
interface RelationshipItemFromAPI {
  type: string;
  direction: 'incoming' | 'outgoing';
  source?: { id: string; [key: string]: unknown } | null;
  target?: { id: string; [key: string]: unknown } | null;
  properties?: Record<string, unknown>;
}

// Task 27: Batch Jingle relationship fetches
// Cache to store the full Jingle response per jingleId to avoid multiple API calls
const jingleRelationshipsCache = new Map<string, Promise<JingleDetailResponse>>();

/**
 * Clear the cache for a specific jingle (or all jingles if jingleId is not provided)
 * This is useful when we know the data has changed (e.g., after creating/deleting a relationship)
 * 
 * @param jingleId - Optional jingle ID to clear cache for. If not provided, clears all caches.
 */
export function clearJingleRelationshipsCache(jingleId?: string): void {
  if (jingleId) {
    jingleRelationshipsCache.delete(jingleId);
  } else {
    jingleRelationshipsCache.clear();
  }
}

/**
 * Task 27: Fetch all Jingle relationships in a single API call
 * This function calls getJingle() once and returns all relationships
 * 
 * @param jingleId - The ID of the Jingle to fetch relationships for
 * @param forceRefresh - If true, bypasses cache and forces a fresh fetch
 * @returns Promise resolving to JingleDetailResponse with all relationships
 */
async function fetchJingleAllRelationships(jingleId: string, forceRefresh = false): Promise<JingleDetailResponse> {
  // If force refresh is requested, clear the cache first
  if (forceRefresh) {
    jingleRelationshipsCache.delete(jingleId);
  }
  
  // Check if we already have a pending request for this jingle
  if (jingleRelationshipsCache.has(jingleId)) {
    return jingleRelationshipsCache.get(jingleId)!;
  }

  // Create the fetch promise and cache it
  const fetchPromise = (async () => {
    try {
      const response = await publicApi.getJingle(jingleId);
      // Task 30: Validate response with Zod
      // Use passthrough to allow extra fields, but still validate structure
      const validated = safeParse(JingleDetailResponseSchema, response, `fetchJingleAllRelationships(${jingleId})`);
      if (!validated) {
        // On validation failure, try to return the raw response with minimal validation
        // This allows the extraction functions to still work even if validation is strict
        console.warn(`[fetchJingleAllRelationships] Validation failed for ${jingleId}, using raw response`);
        return response as JingleDetailResponse;
      }
      return validated;
    } catch (error) {
      console.error(`[fetchJingleAllRelationships] Error fetching jingle ${jingleId}:`, error);
      // On error, return empty response structure
      return {
        id: jingleId,
      } as JingleDetailResponse;
    } finally {
      // Remove from cache after completion (cache only for in-flight requests)
      jingleRelationshipsCache.delete(jingleId);
    }
  })();

  // Cache the promise (not the result) so concurrent calls share the same request
  jingleRelationshipsCache.set(jingleId, fetchPromise);
  return fetchPromise;
}

// ============================================================================
// Fabrica Relationships
// ============================================================================

/**
 * Fetch all Jingles for a specific Fabrica
 * 
 * @param fabricaId - The ID of the Fabrica
 * @returns Promise resolving to array of Jingle entities
 */
export async function fetchFabricaJingles(fabricaId: string): Promise<Jingle[]> {
  try {
    const response = await publicApi.getFabricaJingles(fabricaId);
    // Task 31: Validate response with Zod
    // Handle different response formats
    let jingles: unknown;
    if (Array.isArray(response)) {
      jingles = response;
    } else if ((response as any)?.jingles) {
      jingles = (response as any).jingles;
    } else if ((response as any)?.data) {
      jingles = (response as any).data;
    } else {
      return [];
    }
    
    const validated = safeParseArray(JingleArraySchema, jingles, `fetchFabricaJingles(${fabricaId})`);
    // If validation fails, try to return the raw data anyway (with type assertion)
    // This allows the UI to display the data even if schema validation is strict
    if (validated.length === 0 && Array.isArray(jingles) && jingles.length > 0) {
      console.warn(`[fetchFabricaJingles] Validation failed for ${fabricaId}, using raw jingles data`);
      return jingles as Jingle[];
    }
    return validated;
  } catch (error) {
    console.error(`Error fetching Fabrica Jingles for ${fabricaId}:`, error);
    return [];
  }
}

// ============================================================================
// Jingle Relationships
// ============================================================================

/**
 * Fetch the Fabrica associated with a Jingle
 * 
 * @param jingleId - The ID of the Jingle
 * @returns Promise resolving to array containing the Fabrica (or empty array)
 */
export async function fetchJingleFabrica(jingleId: string): Promise<Fabrica[]> {
  try {
    const response = await fetchJingleAllRelationships(jingleId);
    // Task 30: Extract and validate fabrica from jingle detail response
    if (response.fabrica && response.fabrica.id) {
      const validated = safeParseArray(FabricaArraySchema, [response.fabrica], `fetchJingleFabrica(${jingleId})`) as unknown as Fabrica[];
      // If validation fails, return the raw fabrica data anyway (with type assertion)
      // This allows the UI to display the data even if schema validation is strict
      if (validated.length === 0 && response.fabrica) {
        console.warn(`[fetchJingleFabrica] Validation failed for ${jingleId}, using raw fabrica data`);
        return [response.fabrica as Fabrica];
      }
      return validated;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Jingle Fabrica for ${jingleId}:`, error);
    return [];
  }
}

/**
 * Fetch the Cancion associated with a Jingle
 * 
 * @param jingleId - The ID of the Jingle
 * @returns Promise resolving to array containing the Cancion (or empty array)
 */
export async function fetchJingleCancion(jingleId: string): Promise<Cancion[]> {
  try {
    const response = await fetchJingleAllRelationships(jingleId);
    // Task 30: Extract and validate cancion from jingle detail response
    if (response.cancion && response.cancion.id) {
      return safeParseArray(CancionArraySchema, response.cancion ? [response.cancion] : [], `fetchJingleCancion(${jingleId})`) as unknown as Cancion[];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Jingle Cancion for ${jingleId}:`, error);
    return [];
  }
}

/**
 * Fetch the Autores (authors) associated with a Jingle's Cancion
 * 
 * @param jingleId - The ID of the Jingle
 * @returns Promise resolving to array of Artista entities
 */
export async function fetchJingleAutores(jingleId: string): Promise<Artista[]> {
  try {
    const response = await fetchJingleAllRelationships(jingleId);
    // Task 30: Extract and validate autores array from jingle detail response
    if (Array.isArray(response.autores) && response.autores.length > 0) {
      return safeParseArray(ArtistaArraySchema, response.autores, `fetchJingleAutores(${jingleId})`) as unknown as Artista[];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Jingle Autores for ${jingleId}:`, error);
    return [];
  }
}

/**
 * Fetch the Jingleros (performers) associated with a Jingle
 * 
 * @param jingleId - The ID of the Jingle
 * @returns Promise resolving to array of Artista entities
 */
export async function fetchJingleJingleros(jingleId: string): Promise<Artista[]> {
  try {
    const response = await fetchJingleAllRelationships(jingleId);
    // Task 30: Extract and validate jingleros array from jingle detail response
    if (Array.isArray(response.jingleros) && response.jingleros.length > 0) {
      return safeParseArray(ArtistaArraySchema, response.jingleros, `fetchJingleJingleros(${jingleId})`) as unknown as Artista[];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Jingle Jingleros for ${jingleId}:`, error);
    return [];
  }
}

/**
 * Fetch the Tematicas (themes) associated with a Jingle
 * 
 * @param jingleId - The ID of the Jingle
 * @param forceRefresh - If true, bypasses cache and forces a fresh fetch
 * @returns Promise resolving to array of Tematica entities
 */
export async function fetchJingleTematicas(jingleId: string, forceRefresh = false): Promise<Tematica[]> {
  try {
    // If forceRefresh is requested, clear cache first
    if (forceRefresh) {
      clearJingleRelationshipsCache(jingleId);
    }
    const response = await fetchJingleAllRelationships(jingleId, forceRefresh);
    // Task 30: Extract and validate tematicas array from jingle detail response
    if (Array.isArray(response.tematicas) && response.tematicas.length > 0) {
      return safeParseArray(TematicaArraySchema, response.tematicas, `fetchJingleTematicas(${jingleId})`) as unknown as Tematica[];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Jingle Tematicas for ${jingleId}:`, error);
    return [];
  }
}

/**
 * Fetch all Jingles related via REPEATS relationships
 * 
 * This function:
 * 1. Fetches both inbound and outbound REPEATS relationships
 * 2. Uses 2-step traversal to find initial instance (Jingle with no inbound REPEATS)
 * 3. Returns Jingles sorted by fabricaDate ascending (ineditos last)
 * 
 * @param jingleId - The ID of the Jingle
 * @returns Promise resolving to array of Jingle entities sorted by custom rules
 */
export async function fetchJingleRepeats(jingleId: string): Promise<Jingle[]> {
  try {
    // Get relationships to find REPEATS relationships (both inbound and outbound)
    const relationships = await publicApi.getEntityRelationships('jingles', jingleId);
    // Type assertion needed as EntityRelationships uses Relationship[] but API returns different structure
    const outgoing = relationships.outgoing as unknown as RelationshipItemFromAPI[];
    const incoming = relationships.incoming as unknown as RelationshipItemFromAPI[];
    
    // Collect all Jingle IDs from REPEATS relationships
    const jingleIds = new Set<string>();
    
    // Process outgoing REPEATS relationships (jingleId -> other Jingle)
    const outgoingRepeats = (outgoing || []).filter(
      (r) => r.type === 'REPEATS' && r.target && r.target.properties && (r.target.properties as { id?: string }).id
    );
    outgoingRepeats.forEach((r) => {
      const targetId = (r.target!.properties as { id: string }).id;
      if (targetId) jingleIds.add(targetId);
    });
    
    // Process incoming REPEATS relationships (other Jingle -> jingleId)
    const incomingRepeats = (incoming || []).filter(
      (r) => r.type === 'REPEATS' && r.source && r.source.properties && (r.source.properties as { id?: string }).id
    );
    incomingRepeats.forEach((r) => {
      const sourceId = (r.source!.properties as { id: string }).id;
      if (sourceId) jingleIds.add(sourceId);
    });
    
    if (jingleIds.size === 0) {
      return [];
    }
    
    // Fetch all related Jingles
    const jinglePromises = Array.from(jingleIds).map(async (id) => {
      try {
        return await publicApi.getJingle(id);
      } catch (error) {
        console.error(`Error fetching Jingle ${id} for REPEATS:`, error);
        return null;
      }
    });
    
    const jingles = (await Promise.all(jinglePromises)).filter((j): j is Jingle => j !== null);
    
    // Validate jingles
    const validated = safeParseArray(JinglePartialArraySchema, jingles, `fetchJingleRepeats(${jingleId})`) as unknown as Jingle[];
    
    // Apply custom sorting using sortJingleRepeats function
    return sortJingleRepeats(validated);
  } catch (error) {
    console.error(`Error fetching Jingle REPEATS for ${jingleId}:`, error);
    return [];
  }
}

// ============================================================================
// Cancion Relationships
// ============================================================================

/**
 * Fetch the Autores (authors) of a Cancion
 * 
 * @param cancionId - The ID of the Cancion
 * @returns Promise resolving to array of Artista entities
 */
export async function fetchCancionAutores(cancionId: string): Promise<Artista[]> {
  try {
    // Get relationships to find AUTOR_DE incoming relationships
    // The API returns relationships with source/target structure
    const relationships = await publicApi.getEntityRelationships('canciones', cancionId);
    // Type assertion needed as EntityRelationships uses Relationship[] but API returns different structure
    const incoming = relationships.incoming as unknown as RelationshipItemFromAPI[];
    
    // Filter for AUTOR_DE relationships and extract source properties
    // The API returns Neo4j node objects where the actual entity data is in source.properties
    const autorRels = (incoming || []).filter(
      (r) => r.type === 'AUTOR_DE' && r.source && r.source.properties && (r.source.properties as { id?: string }).id
    );
    
    // Extract the properties from the Neo4j node objects and convert dates
    const artistas = autorRels
      .map((r) => convertNeo4jDates(r.source!.properties))
      .filter((a): a is { id: string; [key: string]: unknown } => a !== undefined && a !== null && a.id !== undefined);
    
    // Validate the extracted artistas
    return safeParseArray(ArtistaArraySchema, artistas, `fetchCancionAutores(${cancionId})`) as unknown as Artista[];
  } catch (error) {
    console.error(`Error fetching Cancion Autores for ${cancionId}:`, error);
    return [];
  }
}

/**
 * Fetch all Jingles that use a specific Cancion
 * 
 * @param cancionId - The ID of the Cancion
 * @returns Promise resolving to array of Jingle entities
 */
export async function fetchCancionJingles(cancionId: string): Promise<Jingle[]> {
  try {
    // Use related endpoint which includes jinglesUsingCancion with enriched fields (fabrica, jingleros, tematicas)
    const related = await publicApi.getCancionRelated(cancionId, 100);
    // Task 31: Validate jingles array - use partial schema since related endpoint returns partial data
    if (Array.isArray(related.jinglesUsingCancion)) {
      // Preserve enriched fields from raw API response before schema validation (schema may strip them)
      const rawJingles = related.jinglesUsingCancion as Array<Jingle & { fabrica?: Fabrica & { timestamp?: number }; jingleros?: Artista[]; tematicas?: Tematica[] }>;
      
      const partialJingles = safeParseArray(JinglePartialArraySchema, related.jinglesUsingCancion, `fetchCancionJingles(${cancionId})`);
      // Convert partial jingles to full Jingle objects with defaults for missing required fields
      // AND preserve enriched fields (fabrica, jingleros, tematicas) from raw API response
      return partialJingles.map((j, index) => {
        const rawJingle = rawJingles[index];
        return {
          ...j,
          timestamp: j.timestamp || '',
          isJinglazo: j.isJinglazo ?? false,
          isJinglazoDelDia: j.isJinglazoDelDia ?? false,
          isPrecario: j.isPrecario ?? false,
          createdAt: j.createdAt || j.updatedAt || new Date().toISOString(),
          updatedAt: j.updatedAt || new Date().toISOString(),
          // Preserve enriched fields from raw API response (for Cancion→Jingles nested content per GuestEntity spec)
          fabrica: rawJingle?.fabrica,
          jingleros: rawJingle?.jingleros,
          tematicas: rawJingle?.tematicas,
          // Preserve youtube clip for INEDITO jingles (no Fabrica)
          youtubeClipUrl: (rawJingle as any)?.youtubeClipUrl,
        } as Jingle & { fabrica?: Fabrica & { timestamp?: number }; jingleros?: Artista[]; tematicas?: Tematica[] };
      }) as Jingle[];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching Cancion Jingles for ${cancionId}:`, error);
    // Re-throw the error so the component can handle it properly
    throw error;
  }
}

// ============================================================================
// Artista Relationships
// ============================================================================

/**
 * Fetch all Canciones authored by an Artista
 * 
 * @param artistaId - The ID of the Artista
 * @returns Promise resolving to array of Cancion entities
 */
export async function fetchArtistaCanciones(artistaId: string): Promise<Cancion[]> {
  try {
    // Use related endpoint which includes cancionesByAutor
    const related = await publicApi.getArtistaRelated(artistaId, 100);
    console.log(`[DEBUG] fetchArtistaCanciones(${artistaId}) - API response:`, related);
    // Task 31: Validate canciones array
    if (Array.isArray(related.cancionesByAutor)) {
      console.log(`[DEBUG] fetchArtistaCanciones(${artistaId}) - cancionesByAutor array length:`, related.cancionesByAutor.length);
      // Log each cancion before validation to help debug
      related.cancionesByAutor.forEach((cancion: any, index: number) => {
        console.log(`[DEBUG] fetchArtistaCanciones(${artistaId}) - cancion[${index}]:`, {
          id: cancion?.id,
          title: cancion?.title,
          createdAt: cancion?.createdAt,
          updatedAt: cancion?.updatedAt,
          full: cancion,
        });
      });
      const validated = safeParseArray(CancionArraySchema, related.cancionesByAutor, `fetchArtistaCanciones(${artistaId})`) as unknown as Cancion[];
      console.log(`[DEBUG] fetchArtistaCanciones(${artistaId}) - validated canciones count:`, validated.length);
      return validated;
    }
    console.log(`[DEBUG] fetchArtistaCanciones(${artistaId}) - cancionesByAutor is not an array:`, related.cancionesByAutor);
    return [];
  } catch (error) {
    console.error(`Error fetching Artista Canciones for ${artistaId}:`, error);
    return [];
  }
}

/**
 * Fetch all Jingles performed by an Artista (as Jinglero)
 * 
 * @param artistaId - The ID of the Artista
 * @returns Promise resolving to array of Jingle entities
 */
export async function fetchArtistaJingles(artistaId: string): Promise<Jingle[]> {
  try {
    // Use related endpoint which includes jinglesByJinglero with fabrica data
    const related = await publicApi.getArtistaRelated(artistaId, 100);
    console.log(`[DEBUG] fetchArtistaJingles(${artistaId}) - API response:`, related);
    // Task 31: Validate jingles array - use partial schema since related endpoint returns partial data
    if (Array.isArray(related.jinglesByJinglero)) {
      console.log(`[DEBUG] fetchArtistaJingles(${artistaId}) - jinglesByJinglero array length:`, related.jinglesByJinglero.length);
      // Validate each jingle individually to avoid rejecting entire array if one fails
      const partialJingles: any[] = [];
      for (let i = 0; i < related.jinglesByJinglero.length; i++) {
        const jingle = related.jinglesByJinglero[i];
        console.log(`[DEBUG] fetchArtistaJingles(${artistaId}) - Validating jingle ${i} (id: ${jingle?.id}):`, jingle);
        const validated = safeParse(JinglePartialSchema, jingle, `fetchArtistaJingles(${artistaId})[${i}]`);
        if (validated) {
          console.log(`[DEBUG] fetchArtistaJingles(${artistaId}) - Jingle ${i} (id: ${jingle?.id}) validated successfully`);
          partialJingles.push(validated);
        } else {
          console.warn(`[DEBUG] fetchArtistaJingles(${artistaId}) - Skipping invalid jingle at index ${i} (id: ${jingle?.id}):`, jingle);
          console.warn(`[DEBUG] fetchArtistaJingles(${artistaId}) - Jingle data structure:`, JSON.stringify(jingle, null, 2));
        }
      }
      console.log(`[DEBUG] fetchArtistaJingles(${artistaId}) - validated jingles count:`, partialJingles.length);
      // Convert partial jingles to full Jingle objects with defaults for missing required fields
      // Note: fabrica data is already included in the jingle object from the backend
      return partialJingles.map(j => ({
        ...j,
        timestamp: j.timestamp || '',
        isJinglazo: j.isJinglazo ?? false,
        isJinglazoDelDia: j.isJinglazoDelDia ?? false,
        isPrecario: j.isPrecario ?? false,
        createdAt: j.createdAt || j.updatedAt || new Date().toISOString(),
        updatedAt: j.updatedAt || new Date().toISOString(),
        // Preserve fabrica data if it exists
        fabrica: (j as any).fabrica || undefined,
      })) as Jingle[];
    }
    console.log(`[DEBUG] fetchArtistaJingles(${artistaId}) - jinglesByJinglero is not an array:`, related.jinglesByJinglero);
    return [];
  } catch (error) {
    console.error(`Error fetching Artista Jingles for ${artistaId}:`, error);
    // Re-throw the error so the component can handle it properly
    throw error;
  }
}

// ============================================================================
// Tematica Relationships
// ============================================================================

/**
 * Fetch all Jingles tagged with a specific Tematica
 * 
 * @param tematicaId - The ID of the Tematica
 * @returns Promise resolving to array of Jingle entities
 */
export async function fetchTematicaJingles(tematicaId: string): Promise<Jingle[]> {
  try {
    // Use related endpoint which includes jingles with fabrica data
    const related = await publicApi.getTematicaRelated(tematicaId, 100);
    console.log(`[DEBUG] fetchTematicaJingles(${tematicaId}) - API response:`, related);
    
    // Task 31: Validate jingles array - use partial schema since related endpoint returns partial data
    if (Array.isArray(related.jingles)) {
      console.log(`[DEBUG] fetchTematicaJingles(${tematicaId}) - jingles array length:`, related.jingles.length);
      // Validate each jingle individually to avoid rejecting entire array if one fails
      const partialJingles: any[] = [];
      for (let i = 0; i < related.jingles.length; i++) {
        const jingle = related.jingles[i];
        const validated = safeParse(JinglePartialSchema, jingle, `fetchTematicaJingles(${tematicaId})[${i}]`);
        if (validated) {
          partialJingles.push(validated);
        } else {
          console.warn(`[fetchTematicaJingles] Skipping invalid jingle at index ${i} (id: ${jingle?.id}):`, jingle);
        }
      }
      console.log(`[DEBUG] fetchTematicaJingles(${tematicaId}) - validated jingles count:`, partialJingles.length);
      // Convert partial jingles to full Jingle objects with defaults for missing required fields
      // Note: fabrica data is already included in the jingle object from the backend
      return partialJingles.map(j => ({
        ...j,
        timestamp: j.timestamp || '',
        isJinglazo: j.isJinglazo ?? false,
        isJinglazoDelDia: j.isJinglazoDelDia ?? false,
        isPrecario: j.isPrecario ?? false,
        createdAt: j.createdAt || j.updatedAt || new Date().toISOString(),
        updatedAt: j.updatedAt || new Date().toISOString(),
        // Preserve fabrica data if it exists
        fabrica: (j as any).fabrica || undefined,
      })) as Jingle[];
    }
    console.warn(`[fetchTematicaJingles] Response does not contain jingles array. Response structure:`, related);
    return [];
  } catch (error) {
    console.error(`Error fetching Tematica Jingles for ${tematicaId}:`, error);
    // Re-throw the error so the component can handle it properly
    throw error;
  }
}

