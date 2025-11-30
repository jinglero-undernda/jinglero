/**
 * Cleanup Scripts for Canciones
 */

import { Neo4jClient } from '../../index';
import {
  ScriptExecutionResult,
  EntityIssue,
  Suggestion,
  AutomationResult,
  AutomationResultItem,
} from '..';
import { searchRecording, lookupRecording, MusicBrainzMatch } from '../../../utils/musicbrainz';

const db = Neo4jClient.getInstance();

/**
 * Script 5: Find Cancion without MusicBrainz id and suggest it from query
 * 
 * Identifies Canciones missing MusicBrainz ID and queries MusicBrainz API
 * to find matches. Calculates confidence scores for matches.
 */
export async function findCancionWithoutMusicBrainzId(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  let musicBrainzCalls = 0;
  const musicBrainzErrors: Array<{ entityId: string; error: string; retryable: boolean }> = [];
  
  // Query for Canciones without MusicBrainz ID
  const query = `
    MATCH (c:Cancion)
    WHERE c.musicBrainzId IS NULL
    RETURN c.id AS cancionId,
           c.title AS cancionTitle,
           c.album AS album,
           c.year AS year
    ORDER BY c.id
  `;
  
  const canciones = await db.executeQuery<{
    cancionId: string;
    cancionTitle: string;
    album?: string;
    year?: number;
  }>(query, {});
  
  const entities: EntityIssue[] = [];
  
  // Process each Cancion
  for (const cancion of canciones) {
    try {
      // Search MusicBrainz
      const matches = await searchRecording(cancion.cancionTitle, undefined, 5);
      musicBrainzCalls++;
      
      if (matches.length === 0) {
        // No matches found - still report as issue but no suggestion
        entities.push({
          entityType: 'cancion',
          entityId: cancion.cancionId,
          entityTitle: cancion.cancionTitle,
          issue: 'Missing MusicBrainz ID - no matches found',
          currentValue: null,
          suggestion: {
            type: 'update',
            field: 'musicBrainzId',
            recommendedValue: null,
            automatable: false,
            requiresManualReview: true,
          },
        });
        continue;
      }
      
      // Use best match (first one, already sorted by confidence)
      const bestMatch = matches[0];
      const alternatives = matches.length > 1 ? matches.slice(1, 3) : undefined;
      
      entities.push({
        entityType: 'cancion',
        entityId: cancion.cancionId,
        entityTitle: cancion.cancionTitle,
        issue: `Missing MusicBrainz ID - found match with ${Math.round(bestMatch.confidence * 100)}% confidence`,
        currentValue: null,
        suggestion: {
          type: 'update',
          field: 'musicBrainzId',
          recommendedValue: bestMatch.musicBrainzId,
          automatable: bestMatch.confidence >= 0.8,
          requiresManualReview: bestMatch.confidence < 0.8,
          musicBrainzMatch: {
            musicBrainzId: bestMatch.musicBrainzId,
            title: bestMatch.title,
            artist: bestMatch.artist,
            confidence: bestMatch.confidence,
            source: 'musicbrainz_search',
            alternatives: alternatives?.map(alt => ({
              musicBrainzId: alt.musicBrainzId,
              title: alt.title,
              artist: alt.artist,
              confidence: alt.confidence,
              source: 'musicbrainz_search' as const,
            })),
          },
        },
      });
      
      // Rate limit: wait 1 second between requests
      if (musicBrainzCalls < canciones.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      musicBrainzErrors.push({
        entityId: cancion.cancionId,
        error: error.message || 'MusicBrainz API error',
        retryable: true,
      });
      
      // Still report as issue
      entities.push({
        entityType: 'cancion',
        entityId: cancion.cancionId,
        entityTitle: cancion.cancionTitle,
        issue: 'Missing MusicBrainz ID - search failed',
        currentValue: null,
        suggestion: {
          type: 'update',
          field: 'musicBrainzId',
          recommendedValue: null,
          automatable: false,
          requiresManualReview: true,
        },
      });
    }
  }
  
  const executionTime = Date.now() - startTime;
  
  // Create suggestion summary
  const automatableCount = entities.filter(e => e.suggestion?.automatable).length;
  const suggestions = entities.length > 0 ? [{
    type: 'update',
    field: 'musicBrainzId',
    count: entities.length,
    automatable: automatableCount,
    requiresReview: entities.length - automatableCount,
  }] : [];
  
  return {
    scriptId: 'find-cancion-without-musicbrainz-id',
    scriptName: 'Find Cancion without MusicBrainz id and suggest it from query',
    totalFound: entities.length,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
    musicBrainzCalls,
    musicBrainzErrors: musicBrainzErrors.length > 0 ? musicBrainzErrors : undefined,
  };
}

/**
 * Automate MusicBrainz ID assignment for Canciones
 */
export async function automateCancionMusicBrainzId(
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const startTime = Date.now();
  const results: AutomationResultItem[] = [];
  const errors: Array<{ entityId: string; error: string; code?: string; retryable: boolean }> = [];
  const skippedEntities: Array<{ entityId: string; reason: string; confidence?: number }> = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  // Get Canciones and their suggested MusicBrainz IDs from previous execution
  // For automation, we need to re-search to get the MusicBrainz ID
  const query = `
    MATCH (c:Cancion)
    WHERE c.id IN $cancionIds AND c.musicBrainzId IS NULL
    RETURN c.id AS cancionId, c.title AS cancionTitle
  `;
  
  const canciones = await db.executeQuery<{
    cancionId: string;
    cancionTitle: string;
  }>(query, { cancionIds: entityIds });
  
  for (const cancion of canciones) {
    try {
      // Search MusicBrainz
      const matches = await searchRecording(cancion.cancionTitle, undefined, 1);
      
      if (matches.length === 0) {
        skipped++;
        skippedEntities.push({
          entityId: cancion.cancionId,
          reason: 'No MusicBrainz match found',
        });
        results.push({
          entityId: cancion.cancionId,
          status: 'failed',
          error: 'No MusicBrainz match found',
        });
        continue;
      }
      
      const match = matches[0];
      
      // Check confidence threshold
      if (match.confidence < 0.8 && !applyLowConfidence) {
        skipped++;
        skippedEntities.push({
          entityId: cancion.cancionId,
          reason: `Low confidence score (${Math.round(match.confidence * 100)}% < 80% threshold)`,
          confidence: match.confidence,
        });
        results.push({
          entityId: cancion.cancionId,
          status: 'failed',
          error: 'Low confidence match',
          confidence: match.confidence,
        });
        continue;
      }
      
      // Update Cancion with MusicBrainz ID
      const updateQuery = `
        MATCH (c:Cancion {id: $cancionId})
        SET c.musicBrainzId = $musicBrainzId,
            c.musicBrainzConfidence = $confidence,
            c.updatedAt = datetime()
        RETURN c.id AS cancionId
      `;
      
      await db.executeQuery(updateQuery, {
        cancionId: cancion.cancionId,
        musicBrainzId: match.musicBrainzId,
        confidence: match.confidence,
      }, undefined, true);
      
      successful++;
      results.push({
        entityId: cancion.cancionId,
        status: 'success',
        changes: {
          musicBrainzId: match.musicBrainzId,
        },
        musicBrainzId: match.musicBrainzId,
        confidence: match.confidence,
      });
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      failed++;
      errors.push({
        entityId: cancion.cancionId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: cancion.cancionId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'find-cancion-without-musicbrainz-id',
    totalRequested: entityIds.length,
    totalApplied: successful,
    successful,
    failed,
    skipped,
    results,
    skippedEntities: skippedEntities.length > 0 ? skippedEntities : undefined,
    errors,
  };
}

/**
 * Script 6: Fill missing Cancion details from MusicBrainz id
 * 
 * Identifies Canciones with MusicBrainz ID but incomplete metadata,
 * then fetches missing details from MusicBrainz API.
 */
export async function fillMissingCancionDetails(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  let musicBrainzCalls = 0;
  const musicBrainzErrors: Array<{ entityId: string; error: string; retryable: boolean }> = [];
  
  // Query for Canciones with MusicBrainz ID but missing details
  const query = `
    MATCH (c:Cancion)
    WHERE c.musicBrainzId IS NOT NULL
      AND (c.album IS NULL OR c.year IS NULL OR c.genre IS NULL)
    RETURN c.id AS cancionId,
           c.title AS cancionTitle,
           c.musicBrainzId AS musicBrainzId,
           c.album AS album,
           c.year AS year,
           c.genre AS genre
    ORDER BY c.id
  `;
  
  const canciones = await db.executeQuery<{
    cancionId: string;
    cancionTitle: string;
    musicBrainzId: string;
    album?: string;
    year?: number;
    genre?: string;
  }>(query, {});
  
  const entities: EntityIssue[] = [];
  
  // Process each Cancion
  for (const cancion of canciones) {
    try {
      // Lookup MusicBrainz details
      const match = await lookupRecording(cancion.musicBrainzId);
      musicBrainzCalls++;
      
      if (!match) {
        musicBrainzErrors.push({
          entityId: cancion.cancionId,
          error: 'MusicBrainz lookup failed - recording not found',
          retryable: false,
        });
        continue;
      }
      
      // Determine what's missing
      const missingFields: string[] = [];
      const suggestedChanges: Record<string, any> = {};
      
      if (!cancion.album && match.album) {
        missingFields.push('album');
        suggestedChanges.album = match.album;
      }
      
      if (!cancion.year && match.year) {
        missingFields.push('year');
        suggestedChanges.year = match.year;
      }
      
      if (!cancion.genre && match.genre) {
        missingFields.push('genre');
        suggestedChanges.genre = match.genre;
      }
      
      if (missingFields.length > 0) {
        entities.push({
          entityType: 'cancion',
          entityId: cancion.cancionId,
          entityTitle: cancion.cancionTitle,
          issue: `Missing fields: ${missingFields.join(', ')}`,
          currentValue: {
            album: cancion.album,
            year: cancion.year,
            genre: cancion.genre,
          },
          suggestion: {
            type: 'update',
            field: missingFields.join(','),
            recommendedValue: suggestedChanges,
            automatable: true,
            requiresManualReview: false,
          },
        });
      }
      
      // Rate limit
      if (musicBrainzCalls < canciones.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      musicBrainzErrors.push({
        entityId: cancion.cancionId,
        error: error.message || 'MusicBrainz API error',
        retryable: true,
      });
    }
  }
  
  const executionTime = Date.now() - startTime;
  
  // Create suggestion summary
  const automatableCount = entities.filter(e => e.suggestion?.automatable).length;
  const suggestions = entities.length > 0 ? [{
    type: 'update',
    field: 'metadata',
    count: entities.length,
    automatable: automatableCount,
    requiresReview: entities.length - automatableCount,
  }] : [];
  
  return {
    scriptId: 'fill-missing-cancion-details',
    scriptName: 'Fill missing Cancion details from MusicBrainz id',
    totalFound: entities.length,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
    musicBrainzCalls,
    musicBrainzErrors: musicBrainzErrors.length > 0 ? musicBrainzErrors : undefined,
  };
}

/**
 * Automate filling missing Cancion details
 */
export async function automateFillMissingCancionDetails(
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const startTime = Date.now();
  const results: AutomationResultItem[] = [];
  const errors: Array<{ entityId: string; error: string; code?: string; retryable: boolean }> = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  // Get Canciones with MusicBrainz ID
  const query = `
    MATCH (c:Cancion)
    WHERE c.id IN $cancionIds AND c.musicBrainzId IS NOT NULL
    RETURN c.id AS cancionId, c.musicBrainzId AS musicBrainzId, c.album AS album, c.year AS year, c.genre AS genre
  `;
  
  const canciones = await db.executeQuery<{
    cancionId: string;
    musicBrainzId: string;
    album?: string;
    year?: number;
    genre?: string;
  }>(query, { cancionIds: entityIds });
  
  for (const cancion of canciones) {
    try {
      // Lookup MusicBrainz details
      const match = await lookupRecording(cancion.musicBrainzId);
      
      if (!match) {
        failed++;
        errors.push({
          entityId: cancion.cancionId,
          error: 'MusicBrainz lookup failed',
          retryable: false,
        });
        results.push({
          entityId: cancion.cancionId,
          status: 'failed',
          error: 'MusicBrainz lookup failed',
        });
        continue;
      }
      
      // Build update object
      const updates: Record<string, any> = {};
      const changes: Record<string, any> = {};
      
      if (!cancion.album && match.album) {
        updates.album = match.album;
        changes.album = match.album;
      }
      
      if (!cancion.year && match.year) {
        updates.year = match.year;
        changes.year = match.year;
      }
      
      if (!cancion.genre && match.genre) {
        updates.genre = match.genre;
        changes.genre = match.genre;
      }
      
      if (Object.keys(updates).length === 0) {
        skipped++;
        results.push({
          entityId: cancion.cancionId,
          status: 'failed',
          error: 'No missing fields to update',
        });
        continue;
      }
      
      // Update Cancion
      const updateQuery = `
        MATCH (c:Cancion {id: $cancionId})
        SET c += $updates,
            c.updatedAt = datetime()
        RETURN c.id AS cancionId
      `;
      
      await db.executeQuery(updateQuery, {
        cancionId: cancion.cancionId,
        updates,
      }, undefined, true);
      
      successful++;
      results.push({
        entityId: cancion.cancionId,
        status: 'success',
        changes,
        musicBrainzId: cancion.musicBrainzId,
      });
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      failed++;
      errors.push({
        entityId: cancion.cancionId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: cancion.cancionId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'fill-missing-cancion-details',
    totalRequested: entityIds.length,
    totalApplied: successful,
    successful,
    failed,
    skipped,
    results,
    errors,
  };
}

/**
 * Script 7: Find Cancion without Autor asociado
 * 
 * Identifies Canciones not linked to any Artista via AUTOR_DE relationship.
 */
export async function findCancionWithoutAutor(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  
  // Query for Canciones without AUTOR_DE relationships
  const query = `
    MATCH (c:Cancion)
    WHERE NOT EXISTS {
      (:Artista)-[:AUTOR_DE]->(c)
    }
    RETURN c.id AS cancionId,
           c.title AS cancionTitle,
           c.musicBrainzId AS musicBrainzId
    ORDER BY c.id
  `;
  
  const canciones = await db.executeQuery<{
    cancionId: string;
    cancionTitle: string;
    musicBrainzId?: string;
  }>(query, {});
  
  const executionTime = Date.now() - startTime;
  
  const entities: EntityIssue[] = canciones.map(cancion => ({
    entityType: 'cancion',
    entityId: cancion.cancionId,
    entityTitle: cancion.cancionTitle,
    issue: 'Missing AUTOR_DE relationship - no Artista linked',
    currentValue: {
      musicBrainzId: cancion.musicBrainzId,
    },
    suggestion: {
      type: 'relationship',
      field: 'AUTOR_DE',
      recommendedValue: null, // Cannot auto-suggest without MusicBrainz lookup
      automatable: false,
      requiresManualReview: true,
    },
  }));
  
  // Create suggestion summary
  const suggestions = entities.length > 0 ? [{
    type: 'relationship',
    field: 'AUTOR_DE',
    count: entities.length,
    automatable: 0,
    requiresReview: entities.length,
  }] : [];
  
  return {
    scriptId: 'find-cancion-without-autor',
    scriptName: 'Find Cancion without Autor asociado',
    totalFound: entities.length,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
  };
}

