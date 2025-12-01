/**
 * Cleanup Scripts for Jingles
 */

import { Neo4jClient } from '../../index';
import {
  ScriptExecutionResult,
  EntityIssue,
  Suggestion,
  AutomationResult,
  AutomationResultItem,
} from '..';
import { parseTimestampFromText, timestampToSeconds } from '../../../utils/timestampParser';

const db = Neo4jClient.getInstance();

/**
 * Convert Neo4j Integer objects to JavaScript numbers
 * Neo4j returns integers as objects with .low property (and sometimes .high for large integers)
 */
function convertNeo4jInteger(value: any): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  // Check if it's a Neo4j Integer object
  if (typeof value === 'object' && value.low !== undefined) {
    return value.low;
  }
  // Already a number or can be converted
  return Number(value);
}

/**
 * Script 3: Find Jingles with time-stamp 00:00:00
 * 
 * Identifies Jingles with zero timestamp, which likely indicates missing or invalid timestamp data.
 * Also checks if the comentario or titulo contains a parseable timestamp that could be used.
 * Supports automation when parseable timestamps are found in title/comment.
 */
export async function findJinglesZeroTimestamp(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  
  // Query for Jingles with timestamp = 0 (00:00:00) or null
  // Also fetch comentario and titulo to check for parseable timestamps
  // Timestamps are stored as integers (seconds) in the database
  const query = `
    MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
    WHERE r.timestamp = 0 OR r.timestamp IS NULL
    RETURN j.id AS jingleId, 
           j.title AS jingleTitle,
           j.comment AS jingleComment,
           f.id AS fabricaId,
           f.title AS fabricaTitle,
           r.timestamp AS timestamp
    ORDER BY j.id
  `;
  
  const results = await db.executeQuery<{
    jingleId: string;
    jingleTitle?: string;
    jingleComment?: string;
    fabricaId: string;
    fabricaTitle?: string;
    timestamp: number | null;
  }>(query, {});
  
  const executionTime = Date.now() - startTime;
  
  // Format results
  const entities: EntityIssue[] = results.map(result => {
    // Convert Neo4j Integer to JavaScript number
    const timestamp = convertNeo4jInteger(result.timestamp);
    const timestampStr = timestamp === null || timestamp === 0 
      ? '00:00:00' 
      : formatSecondsToTimestamp(timestamp);
    
    // Check if comentario or titulo contains a parseable timestamp
    const parsedFromComment = result.jingleComment ? parseTimestampFromText(result.jingleComment) : null;
    const parsedFromTitle = result.jingleTitle ? parseTimestampFromText(result.jingleTitle) : null;
    const suggestedTimestamp = parsedFromComment || parsedFromTitle;
    const suggestedTimestampSeconds = suggestedTimestamp ? timestampToSeconds(suggestedTimestamp) : null;
    
    // Build issue description
    let issue = `Timestamp is 00:00:00 (or null) in Fabrica ${result.fabricaId}`;
    if (suggestedTimestamp) {
      const source = parsedFromComment ? 'comentario' : 'titulo';
      issue += `. Found parseable timestamp ${suggestedTimestamp} in ${source}`;
    }
    
    return {
      entityType: 'jingle',
      entityId: result.jingleId,
      entityTitle: result.jingleTitle || 'Untitled Jingle',
      issue,
      currentValue: timestampStr,
      suggestion: {
        type: 'update',
        field: 'timestamp',
        recommendedValue: suggestedTimestampSeconds, // Seconds as integer, or null if not found
        automatable: suggestedTimestampSeconds !== null, // Automatable if we found a parseable timestamp
        requiresManualReview: suggestedTimestampSeconds === null, // Manual review only if no timestamp found
      },
    };
  });
  
  // Create suggestion summary
  const automatableCount = entities.filter(e => e.suggestion?.automatable).length;
  const suggestions = entities.length > 0 ? [{
    type: 'update',
    field: 'timestamp',
    count: entities.length,
    automatable: automatableCount,
    requiresReview: entities.length - automatableCount,
  }] : [];
  
  return {
    scriptId: 'find-jingles-zero-timestamp',
    scriptName: 'Find Jingles with time-stamp 00:00:00',
    totalFound: entities.length,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
  };
}

/**
 * Automate timestamp updates for jingles with parseable timestamps in title/comment
 * 
 * Updates APPEARS_IN relationship timestamps for the specified entity IDs.
 * Only updates entities that have automatable suggestions (i.e., parseable timestamps found).
 */
export async function automateJinglesZeroTimestamp(
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const startTime = Date.now();
  const results: AutomationResultItem[] = [];
  const errors: Array<{ entityId: string; error: string; code?: string; retryable: boolean }> = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  // First, get the current state of these entities to find their suggested timestamps
  const query = `
    MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
    WHERE j.id IN $entityIds AND (r.timestamp = 0 OR r.timestamp IS NULL)
    RETURN j.id AS jingleId,
           j.title AS jingleTitle,
           j.comment AS jingleComment,
           f.id AS fabricaId,
           r.timestamp AS currentTimestamp
  `;
  
  const entities = await db.executeQuery<{
    jingleId: string;
    jingleTitle?: string;
    jingleComment?: string;
    fabricaId: string;
    currentTimestamp: number | null;
  }>(query, { entityIds });
  
  // Process each entity
  for (const entity of entities) {
    try {
      // Parse timestamp from title or comment
      const parsedFromComment = entity.jingleComment ? parseTimestampFromText(entity.jingleComment) : null;
      const parsedFromTitle = entity.jingleTitle ? parseTimestampFromText(entity.jingleTitle) : null;
      const suggestedTimestamp = parsedFromComment || parsedFromTitle;
      const suggestedTimestampSeconds = suggestedTimestamp ? timestampToSeconds(suggestedTimestamp) : null;
      
      // Skip if no parseable timestamp found
      if (!suggestedTimestampSeconds) {
        skipped++;
        results.push({
          entityId: entity.jingleId,
          status: 'failed',
          error: 'No parseable timestamp found in title or comment',
        });
        continue;
      }
      
      // Update the APPEARS_IN relationship timestamp
      const updateQuery = `
        MATCH (j:Jingle {id: $jingleId})-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
        SET r.timestamp = $timestamp
        RETURN r.timestamp AS updatedTimestamp
      `;
      
      const updateResult = await db.executeQuery<{ updatedTimestamp: number }>(
        updateQuery,
        {
          jingleId: entity.jingleId,
          fabricaId: entity.fabricaId,
          timestamp: suggestedTimestampSeconds,
        },
        undefined,
        true // isWrite = true
      );
      
      if (updateResult.length > 0) {
        successful++;
        results.push({
          entityId: entity.jingleId,
          status: 'success',
          changes: {
            timestamp: suggestedTimestampSeconds,
            timestampFormatted: suggestedTimestamp,
          },
        });
      } else {
        failed++;
        results.push({
          entityId: entity.jingleId,
          status: 'failed',
          error: 'Relationship not found or update failed',
        });
      }
    } catch (error: any) {
      failed++;
      errors.push({
        entityId: entity.jingleId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: entity.jingleId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'find-jingles-zero-timestamp',
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
 * Script 4: Find Jingles without Cancion relationship
 * 
 * Identifies Jingles not linked to any Cancion via VERSIONA relationship.
 * May suggest Canciones based on title matching.
 */
export async function findJinglesWithoutCancion(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  
  // Query for Jingles without VERSIONA relationships
  const query = `
    MATCH (j:Jingle)
    WHERE NOT EXISTS {
      (j)-[:VERSIONA]->(:Cancion)
    }
    RETURN j.id AS jingleId,
           j.title AS jingleTitle,
           j.comment AS jingleComment
    ORDER BY j.id
  `;
  
  const results = await db.executeQuery<{
    jingleId: string;
    jingleTitle?: string;
    jingleComment?: string;
  }>(query, {});
  
  const executionTime = Date.now() - startTime;
  
  // For each Jingle, try to find potential Cancion matches by title
  const entities: EntityIssue[] = [];
  
  for (const result of results) {
    // Try to find Canciones with matching title
    const searchTitle = result.jingleTitle || result.jingleComment || '';
    let suggestedCancionId: string | null = null;
    
    if (searchTitle) {
      // Simple title matching - look for Canciones with similar title
      const matchQuery = `
        MATCH (c:Cancion)
        WHERE toLower(c.title) CONTAINS toLower($searchTitle)
           OR toLower($searchTitle) CONTAINS toLower(c.title)
        RETURN c.id AS cancionId, c.title AS cancionTitle
        LIMIT 1
      `;
      
      const matches = await db.executeQuery<{
        cancionId: string;
        cancionTitle: string;
      }>(matchQuery, { searchTitle });
      
      if (matches.length > 0) {
        suggestedCancionId = matches[0].cancionId;
      }
    }
    
    entities.push({
      entityType: 'jingle',
      entityId: result.jingleId,
      entityTitle: result.jingleTitle || 'Untitled Jingle',
      issue: 'Missing VERSIONA relationship - no Cancion linked',
      currentValue: {
        title: result.jingleTitle,
        comment: result.jingleComment,
      },
      suggestion: {
        type: 'relationship',
        field: 'VERSIONA',
        recommendedValue: suggestedCancionId,
        automatable: suggestedCancionId !== null,
        requiresManualReview: suggestedCancionId === null,
      },
    });
  }
  
  // Create suggestion summary
  const automatableCount = entities.filter(e => e.suggestion?.automatable).length;
  const suggestions = entities.length > 0 ? [{
    type: 'relationship',
    field: 'VERSIONA',
    count: entities.length,
    automatable: automatableCount,
    requiresReview: entities.length - automatableCount,
  }] : [];
  
  return {
    scriptId: 'find-jingles-without-cancion',
    scriptName: 'Find Jingles without Cancion relationship',
    totalFound: entities.length,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
  };
}

/**
 * Automate VERSIONA relationship creation for Jingles
 */
export async function automateJinglesWithoutCancion(
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const startTime = Date.now();
  const results: AutomationResultItem[] = [];
  const errors: Array<{ entityId: string; error: string; code?: string; retryable: boolean }> = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  // Get Jingles and their suggested Cancion IDs
  const query = `
    MATCH (j:Jingle)
    WHERE j.id IN $jingleIds
      AND NOT EXISTS {
        (j)-[:VERSIONA]->(:Cancion)
      }
    RETURN j.id AS jingleId, j.title AS jingleTitle, j.comment AS jingleComment
  `;
  
  const jingles = await db.executeQuery<{
    jingleId: string;
    jingleTitle?: string;
    jingleComment?: string;
  }>(query, { jingleIds: entityIds });
  
  for (const jingle of jingles) {
    try {
      // Find matching Cancion
      const searchTitle = jingle.jingleTitle || jingle.jingleComment || '';
      if (!searchTitle) {
        skipped++;
        results.push({
          entityId: jingle.jingleId,
          status: 'failed',
          error: 'No title or comment to match against',
        });
        continue;
      }
      
      const matchQuery = `
        MATCH (c:Cancion)
        WHERE toLower(c.title) CONTAINS toLower($searchTitle)
           OR toLower($searchTitle) CONTAINS toLower(c.title)
        RETURN c.id AS cancionId
        LIMIT 1
      `;
      
      const matches = await db.executeQuery<{ cancionId: string }>(
        matchQuery,
        { searchTitle }
      );
      
      if (matches.length === 0) {
        skipped++;
        results.push({
          entityId: jingle.jingleId,
          status: 'failed',
          error: 'No matching Cancion found',
        });
        continue;
      }
      
      const cancionId = matches[0].cancionId;
      
      // Create VERSIONA relationship
      const createQuery = `
        MATCH (j:Jingle {id: $jingleId}), (c:Cancion {id: $cancionId})
        WHERE NOT EXISTS {
          (j)-[:VERSIONA]->(c)
        }
        CREATE (j)-[r:VERSIONA {createdAt: datetime()}]->(c)
        RETURN r
      `;
      
      await db.executeQuery(createQuery, {
        jingleId: jingle.jingleId,
        cancionId,
      }, undefined, true);
      
      successful++;
      results.push({
        entityId: jingle.jingleId,
        status: 'success',
        changes: {
          cancionId,
        },
      });
    } catch (error: any) {
      failed++;
      errors.push({
        entityId: jingle.jingleId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: jingle.jingleId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'find-jingles-without-cancion',
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
 * Format seconds to HH:MM:SS timestamp string
 */
function formatSecondsToTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

