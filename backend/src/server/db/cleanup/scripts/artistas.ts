/**
 * Cleanup Scripts for Artistas
 */

import { Neo4jClient } from '../../index';
import {
  ScriptExecutionResult,
  EntityIssue,
  Suggestion,
  AutomationResult,
  AutomationResultItem,
} from '..';
import { searchArtist, lookupArtist, searchRecording } from '../../../utils/musicbrainz';

const db = Neo4jClient.getInstance();

/**
 * Script 8: Suggest Autor from MusicBrainz, auto-generate Artista if new is needed
 * 
 * Identifies Canciones without AUTOR_DE relationships, queries MusicBrainz API
 * to find artist information, and suggests creating Artista entities and AUTOR_DE relationships.
 */
export async function suggestAutorFromMusicBrainz(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  let musicBrainzCalls = 0;
  const musicBrainzErrors: Array<{ entityId: string; error: string; retryable: boolean }> = [];
  
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
  
  const entities: EntityIssue[] = [];
  
  // Process each Cancion
  for (const cancion of canciones) {
    try {
      let artistMatch: { musicBrainzId: string; name: string; confidence: number } | null = null;
      
      // If Cancion has MusicBrainz ID, lookup recording to get artist
      if (cancion.musicBrainzId) {
        const recordingMatches = await searchRecording(cancion.cancionTitle, undefined, 1);
        musicBrainzCalls++;
        
        if (recordingMatches.length > 0 && recordingMatches[0].artist) {
          // Search for artist by name
          const artistMatches = await searchArtist(recordingMatches[0].artist, 1);
          musicBrainzCalls++;
          
          if (artistMatches.length > 0) {
            artistMatch = artistMatches[0];
          }
        }
      } else {
        // Search for recording first to get artist name
        const recordingMatches = await searchRecording(cancion.cancionTitle, undefined, 1);
        musicBrainzCalls++;
        
        if (recordingMatches.length > 0 && recordingMatches[0].artist) {
          // Search for artist by name
          const artistMatches = await searchArtist(recordingMatches[0].artist, 1);
          musicBrainzCalls++;
          
          if (artistMatches.length > 0) {
            artistMatch = artistMatches[0];
          }
        }
      }
      
      if (!artistMatch) {
        // No artist found - still report as issue
        entities.push({
          entityType: 'cancion',
          entityId: cancion.cancionId,
          entityTitle: cancion.cancionTitle,
          issue: 'Missing AUTOR_DE relationship - no artist match found in MusicBrainz',
          currentValue: null,
          suggestion: {
            type: 'create',
            field: 'AUTOR_DE',
            recommendedValue: null,
            automatable: false,
            requiresManualReview: true,
          },
        });
        continue;
      }
      
      // Check if Artista already exists with this MusicBrainz ID
      const existingArtistaQuery = `
        MATCH (a:Artista)
        WHERE a.musicBrainzId = $musicBrainzId
        RETURN a.id AS artistaId, a.name AS artistaName
        LIMIT 1
      `;
      
      const existingArtistas = await db.executeQuery<{
        artistaId: string;
        artistaName: string;
      }>(existingArtistaQuery, { musicBrainzId: artistMatch.musicBrainzId });
      
      if (existingArtistas.length > 0) {
        // Artista exists - suggest creating AUTOR_DE relationship
        entities.push({
          entityType: 'cancion',
          entityId: cancion.cancionId,
          entityTitle: cancion.cancionTitle,
          issue: `Missing AUTOR_DE relationship - Artista "${existingArtistas[0].artistaName}" exists`,
          currentValue: {
            existingArtistaId: existingArtistas[0].artistaId,
            existingArtistaName: existingArtistas[0].artistaName,
          },
          suggestion: {
            type: 'relationship',
            field: 'AUTOR_DE',
            recommendedValue: existingArtistas[0].artistaId,
            automatable: artistMatch.confidence >= 0.8,
            requiresManualReview: artistMatch.confidence < 0.8,
            musicBrainzMatch: {
              musicBrainzId: artistMatch.musicBrainzId,
              title: cancion.cancionTitle,
              artist: artistMatch.name,
              confidence: artistMatch.confidence,
              source: 'musicbrainz_search',
            },
          },
        });
      } else {
        // Artista doesn't exist - suggest creating it
        entities.push({
          entityType: 'cancion',
          entityId: cancion.cancionId,
          entityTitle: cancion.cancionTitle,
          issue: `Missing AUTOR_DE relationship - need to create Artista "${artistMatch.name}"`,
          currentValue: null,
          suggestion: {
            type: 'create',
            field: 'Artista',
            recommendedValue: {
              name: artistMatch.name,
              musicBrainzId: artistMatch.musicBrainzId,
              musicBrainzConfidence: artistMatch.confidence,
            },
            automatable: artistMatch.confidence >= 0.8,
            requiresManualReview: artistMatch.confidence < 0.8,
            musicBrainzMatch: {
              musicBrainzId: artistMatch.musicBrainzId,
              title: cancion.cancionTitle,
              artist: artistMatch.name,
              confidence: artistMatch.confidence,
              source: 'musicbrainz_search',
            },
          },
        });
      }
      
      // Rate limit
      if (musicBrainzCalls < canciones.length * 2) {
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
        issue: 'Missing AUTOR_DE relationship - MusicBrainz search failed',
        currentValue: null,
        suggestion: {
          type: 'create',
          field: 'AUTOR_DE',
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
    type: 'create',
    field: 'AUTOR_DE',
    count: entities.length,
    automatable: automatableCount,
    requiresReview: entities.length - automatableCount,
  }] : [];
  
  return {
    scriptId: 'suggest-autor-from-musicbrainz',
    scriptName: 'Suggest Autor from MusicBrainz, auto-generate Artista if new is needed',
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
 * Automate creating Artistas and AUTOR_DE relationships
 */
export async function automateSuggestAutorFromMusicBrainz(
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
  
  // Get Canciones
  const query = `
    MATCH (c:Cancion)
    WHERE c.id IN $cancionIds
      AND NOT EXISTS {
        (:Artista)-[:AUTOR_DE]->(c)
      }
    RETURN c.id AS cancionId, c.title AS cancionTitle, c.musicBrainzId AS musicBrainzId
  `;
  
  const canciones = await db.executeQuery<{
    cancionId: string;
    cancionTitle: string;
    musicBrainzId?: string;
  }>(query, { cancionIds: entityIds });
  
  for (const cancion of canciones) {
    try {
      // Search for artist (same logic as script)
      let artistMatch: { musicBrainzId: string; name: string; confidence: number } | null = null;
      
      const recordingMatches = await searchRecording(cancion.cancionTitle, undefined, 1);
      if (recordingMatches.length > 0 && recordingMatches[0].artist) {
        const artistMatches = await searchArtist(recordingMatches[0].artist, 1);
        if (artistMatches.length > 0) {
          artistMatch = artistMatches[0];
        }
      }
      
      if (!artistMatch) {
        skipped++;
        skippedEntities.push({
          entityId: cancion.cancionId,
          reason: 'No artist match found in MusicBrainz',
        });
        results.push({
          entityId: cancion.cancionId,
          status: 'failed',
          error: 'No artist match found',
        });
        continue;
      }
      
      // Check confidence
      if (artistMatch.confidence < 0.8 && !applyLowConfidence) {
        skipped++;
        skippedEntities.push({
          entityId: cancion.cancionId,
          reason: `Low confidence score (${Math.round(artistMatch.confidence * 100)}% < 80% threshold)`,
          confidence: artistMatch.confidence,
        });
        results.push({
          entityId: cancion.cancionId,
          status: 'failed',
          error: 'Low confidence match',
          confidence: artistMatch.confidence,
        });
        continue;
      }
      
      // Check if Artista exists
      const existingArtistaQuery = `
        MATCH (a:Artista)
        WHERE a.musicBrainzId = $musicBrainzId
        RETURN a.id AS artistaId
        LIMIT 1
      `;
      
      const existingArtistas = await db.executeQuery<{ artistaId: string }>(
        existingArtistaQuery,
        { musicBrainzId: artistMatch.musicBrainzId }
      );
      
      let artistaId: string;
      
      if (existingArtistas.length > 0) {
        // Use existing Artista
        artistaId = existingArtistas[0].artistaId;
      } else {
        // Create new Artista
        // Generate ID with collision detection
        const { randomBytes } = await import('crypto');
        const maxRetries = 10;
        let newId: string | null = null;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // Generate 8 random characters using base36 (0-9, a-z)
          const randomBytesBuffer = randomBytes(6); // 6 bytes = 48 bits
          let randomNum = 0;
          for (let i = 0; i < 6; i++) {
            randomNum = randomNum * 256 + randomBytesBuffer[i];
          }
          
          // Convert to base36 and pad to 8 characters
          const chars = randomNum.toString(36).toLowerCase().padStart(8, '0').slice(0, 8);
          const candidateId = `a${chars}`;
          
          // Check for collision
          const existsQuery = `
            MATCH (a:Artista {id: $id})
            RETURN a.id AS artistaId
            LIMIT 1
          `;
          const existing = await db.executeQuery(existsQuery, { id: candidateId });
          
          if (existing.length === 0) {
            newId = candidateId;
            break;
          }
        }
        
        if (!newId) {
          throw new Error('Failed to generate unique Artista ID after multiple attempts');
        }
        
        const createArtistaQuery = `
          CREATE (a:Artista {
            id: $artistaId,
            name: $name,
            musicBrainzId: $musicBrainzId,
            musicBrainzConfidence: $confidence,
            status: 'DRAFT',
            createdAt: datetime(),
            updatedAt: datetime()
          })
          RETURN a.id AS artistaId
        `;
        
        await db.executeQuery(createArtistaQuery, {
          artistaId: newId,
          name: artistMatch.name,
          musicBrainzId: artistMatch.musicBrainzId,
          confidence: artistMatch.confidence,
        }, undefined, true);
        
        artistaId = newId;
      }
      
      // Create AUTOR_DE relationship
      const createRelQuery = `
        MATCH (a:Artista {id: $artistaId}), (c:Cancion {id: $cancionId})
        WHERE NOT EXISTS {
          (a)-[:AUTOR_DE]->(c)
        }
        CREATE (a)-[r:AUTOR_DE {createdAt: datetime()}]->(c)
        RETURN r
      `;
      
      await db.executeQuery(createRelQuery, {
        artistaId,
        cancionId: cancion.cancionId,
      }, undefined, true);
      
      successful++;
      results.push({
        entityId: cancion.cancionId,
        status: 'success',
        changes: {
          artistaId,
          artistaName: artistMatch.name,
        },
        musicBrainzId: artistMatch.musicBrainzId,
        confidence: artistMatch.confidence,
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
    scriptId: 'suggest-autor-from-musicbrainz',
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
 * Script 9: Find Artista without MusicBrainz id and backfill based on online research
 * 
 * Identifies Artistas missing MusicBrainz ID and queries MusicBrainz API to find matches.
 */
export async function findArtistaWithoutMusicBrainzId(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  let musicBrainzCalls = 0;
  const musicBrainzErrors: Array<{ entityId: string; error: string; retryable: boolean }> = [];
  
  // Query for Artistas without MusicBrainz ID
  const query = `
    MATCH (a:Artista)
    WHERE a.musicBrainzId IS NULL
    RETURN a.id AS artistaId,
           a.name AS artistaName,
           a.stageName AS stageName
    ORDER BY a.id
  `;
  
  const artistas = await db.executeQuery<{
    artistaId: string;
    artistaName: string;
    stageName?: string;
  }>(query, {});
  
  const entities: EntityIssue[] = [];
  
  // Process each Artista
  for (const artista of artistas) {
    try {
      // Search MusicBrainz by name (prefer stageName if available)
      const searchName = artista.stageName || artista.artistaName;
      const matches = await searchArtist(searchName, 5);
      musicBrainzCalls++;
      
      if (matches.length === 0) {
        entities.push({
          entityType: 'artista',
          entityId: artista.artistaId,
          entityTitle: artista.artistaName,
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
      
      // Use best match
      const bestMatch = matches[0];
      const alternatives = matches.length > 1 ? matches.slice(1, 3) : undefined;
      
      entities.push({
        entityType: 'artista',
        entityId: artista.artistaId,
        entityTitle: artista.artistaName,
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
            title: artista.artistaName,
            artist: bestMatch.name,
            confidence: bestMatch.confidence,
            source: 'musicbrainz_search',
            alternatives: alternatives?.map(alt => ({
              musicBrainzId: alt.musicBrainzId,
              title: artista.artistaName,
              artist: alt.name,
              confidence: alt.confidence,
              source: 'musicbrainz_search' as const,
            })),
          },
        },
      });
      
      // Rate limit
      if (musicBrainzCalls < artistas.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      musicBrainzErrors.push({
        entityId: artista.artistaId,
        error: error.message || 'MusicBrainz API error',
        retryable: true,
      });
      
      entities.push({
        entityType: 'artista',
        entityId: artista.artistaId,
        entityTitle: artista.artistaName,
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
    scriptId: 'find-artista-without-musicbrainz-id',
    scriptName: 'Find Artista without MusicBrainz id and backfill based on online research',
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
 * Automate MusicBrainz ID assignment for Artistas
 */
export async function automateArtistaMusicBrainzId(
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
  
  // Get Artistas
  const query = `
    MATCH (a:Artista)
    WHERE a.id IN $artistaIds AND a.musicBrainzId IS NULL
    RETURN a.id AS artistaId, a.name AS artistaName, a.stageName AS stageName
  `;
  
  const artistas = await db.executeQuery<{
    artistaId: string;
    artistaName: string;
    stageName?: string;
  }>(query, { artistaIds: entityIds });
  
  for (const artista of artistas) {
    try {
      // Search MusicBrainz
      const searchName = artista.stageName || artista.artistaName;
      const matches = await searchArtist(searchName, 1);
      
      if (matches.length === 0) {
        skipped++;
        skippedEntities.push({
          entityId: artista.artistaId,
          reason: 'No MusicBrainz match found',
        });
        results.push({
          entityId: artista.artistaId,
          status: 'failed',
          error: 'No MusicBrainz match found',
        });
        continue;
      }
      
      const match = matches[0];
      
      // Check confidence
      if (match.confidence < 0.8 && !applyLowConfidence) {
        skipped++;
        skippedEntities.push({
          entityId: artista.artistaId,
          reason: `Low confidence score (${Math.round(match.confidence * 100)}% < 80% threshold)`,
          confidence: match.confidence,
        });
        results.push({
          entityId: artista.artistaId,
          status: 'failed',
          error: 'Low confidence match',
          confidence: match.confidence,
        });
        continue;
      }
      
      // Update Artista
      const updateQuery = `
        MATCH (a:Artista {id: $artistaId})
        SET a.musicBrainzId = $musicBrainzId,
            a.musicBrainzConfidence = $confidence,
            a.updatedAt = datetime()
        RETURN a.id AS artistaId
      `;
      
      await db.executeQuery(updateQuery, {
        artistaId: artista.artistaId,
        musicBrainzId: match.musicBrainzId,
        confidence: match.confidence,
      }, undefined, true);
      
      successful++;
      results.push({
        entityId: artista.artistaId,
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
        entityId: artista.artistaId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: artista.artistaId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'find-artista-without-musicbrainz-id',
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
 * Script 10: Fill missing Autor details from MusicBrainz id
 * 
 * Identifies Artistas with MusicBrainz ID but incomplete metadata,
 * then fetches missing details from MusicBrainz API.
 */
export async function fillMissingAutorDetails(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  let musicBrainzCalls = 0;
  const musicBrainzErrors: Array<{ entityId: string; error: string; retryable: boolean }> = [];
  
  // Query for Artistas with MusicBrainz ID but missing details
  const query = `
    MATCH (a:Artista)
    WHERE a.musicBrainzId IS NOT NULL
      AND (a.bio IS NULL OR a.genre IS NULL)
    RETURN a.id AS artistaId,
           a.name AS artistaName,
           a.musicBrainzId AS musicBrainzId,
           a.bio AS bio,
           a.genre AS genre
    ORDER BY a.id
  `;
  
  const artistas = await db.executeQuery<{
    artistaId: string;
    artistaName: string;
    musicBrainzId: string;
    bio?: string;
    genre?: string;
  }>(query, {});
  
  const entities: EntityIssue[] = [];
  
  // Process each Artista
  for (const artista of artistas) {
    try {
      // Lookup MusicBrainz details
      const match = await lookupArtist(artista.musicBrainzId);
      musicBrainzCalls++;
      
      if (!match) {
        musicBrainzErrors.push({
          entityId: artista.artistaId,
          error: 'MusicBrainz lookup failed - artist not found',
          retryable: false,
        });
        continue;
      }
      
      // Determine what's missing
      const missingFields: string[] = [];
      const suggestedChanges: Record<string, any> = {};
      
      if (!artista.genre && match.genre) {
        missingFields.push('genre');
        suggestedChanges.genre = match.genre;
      }
      
      // Note: MusicBrainz API doesn't provide bio directly
      // Would need to fetch from external sources
      
      if (missingFields.length > 0) {
        entities.push({
          entityType: 'artista',
          entityId: artista.artistaId,
          entityTitle: artista.artistaName,
          issue: `Missing fields: ${missingFields.join(', ')}`,
          currentValue: {
            bio: artista.bio,
            genre: artista.genre,
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
      if (musicBrainzCalls < artistas.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      musicBrainzErrors.push({
        entityId: artista.artistaId,
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
    scriptId: 'fill-missing-autor-details',
    scriptName: 'Fill missing Autor details from MusicBrainz id',
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
 * Automate filling missing Autor details
 */
export async function automateFillMissingAutorDetails(
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const startTime = Date.now();
  const results: AutomationResultItem[] = [];
  const errors: Array<{ entityId: string; error: string; code?: string; retryable: boolean }> = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  // Get Artistas with MusicBrainz ID
  const query = `
    MATCH (a:Artista)
    WHERE a.id IN $artistaIds AND a.musicBrainzId IS NOT NULL
    RETURN a.id AS artistaId, a.musicBrainzId AS musicBrainzId, a.bio AS bio, a.genre AS genre
  `;
  
  const artistas = await db.executeQuery<{
    artistaId: string;
    musicBrainzId: string;
    bio?: string;
    genre?: string;
  }>(query, { artistaIds: entityIds });
  
  for (const artista of artistas) {
    try {
      // Lookup MusicBrainz details
      const match = await lookupArtist(artista.musicBrainzId);
      
      if (!match) {
        failed++;
        errors.push({
          entityId: artista.artistaId,
          error: 'MusicBrainz lookup failed',
          retryable: false,
        });
        results.push({
          entityId: artista.artistaId,
          status: 'failed',
          error: 'MusicBrainz lookup failed',
        });
        continue;
      }
      
      // Build update object
      const updates: Record<string, any> = {};
      const changes: Record<string, any> = {};
      
      if (!artista.genre && match.genre) {
        updates.genre = match.genre;
        changes.genre = match.genre;
      }
      
      if (Object.keys(updates).length === 0) {
        skipped++;
        results.push({
          entityId: artista.artistaId,
          status: 'failed',
          error: 'No missing fields to update',
        });
        continue;
      }
      
      // Update Artista
      const updateQuery = `
        MATCH (a:Artista {id: $artistaId})
        SET a += $updates,
            a.updatedAt = datetime()
        RETURN a.id AS artistaId
      `;
      
      await db.executeQuery(updateQuery, {
        artistaId: artista.artistaId,
        updates,
      }, undefined, true);
      
      successful++;
      results.push({
        entityId: artista.artistaId,
        status: 'success',
        changes,
        musicBrainzId: artista.musicBrainzId,
      });
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      failed++;
      errors.push({
        entityId: artista.artistaId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: artista.artistaId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'fill-missing-autor-details',
    totalRequested: entityIds.length,
    totalApplied: successful,
    successful,
    failed,
    skipped,
    results,
    errors,
  };
}

