/**
 * Cleanup Scripts for Fabricas
 */

import { Neo4jClient } from '../../index';
import {
  ScriptExecutionResult,
  EntityIssue,
  Suggestion,
  AutomationResult,
  AutomationResultItem,
} from '..';

const db = Neo4jClient.getInstance();

/**
 * Script 1: Find Fabricas where not all Jingles are listed
 * 
 * Identifies Fabricas where the 'contents' property contains Jingle references
 * that are not present in the APPEARS_IN relationships.
 * Supports automation to create missing APPEARS_IN relationships.
 */
export async function findFabricasMissingJingles(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  
  // Query for Fabricas with contents property
  const query = `
    MATCH (f:Fabrica)
    WHERE f.contents IS NOT NULL AND f.contents <> ''
    OPTIONAL MATCH (j:Jingle)-[r:APPEARS_IN]->(f)
    WITH f, collect(j.id) AS existingJingleIds
    RETURN f.id AS fabricaId,
           f.title AS fabricaTitle,
           f.contents AS contents,
           existingJingleIds
    ORDER BY f.id
  `;
  
  const results = await db.executeQuery<{
    fabricaId: string;
    fabricaTitle?: string;
    contents: string;
    existingJingleIds: string[];
  }>(query, {});
  
  const executionTime = Date.now() - startTime;
  
  // Parse Jingle IDs from contents
  // Assumes Jingle IDs are in format j{8-chars} and appear in the text
  const jingleIdPattern = /\bj[a-z0-9]{8}\b/g;
  
  const entities: EntityIssue[] = [];
  
  for (const result of results) {
    // Extract Jingle IDs from contents
    const matches = result.contents.match(jingleIdPattern);
    if (!matches) continue;
    
    const referencedJingleIds = [...new Set(matches)]; // Remove duplicates
    const existingJingleIdsSet = new Set(result.existingJingleIds || []);
    
    // Find missing Jingle IDs
    const missingJingleIds = referencedJingleIds.filter(
      id => !existingJingleIdsSet.has(id)
    );
    
    if (missingJingleIds.length > 0) {
      // Verify these Jingle IDs actually exist in the database
      const verifyQuery = `
        MATCH (j:Jingle)
        WHERE j.id IN $jingleIds
        RETURN j.id AS jingleId, j.title AS jingleTitle
      `;
      
      const existingJingles = await db.executeQuery<{
        jingleId: string;
        jingleTitle?: string;
      }>(verifyQuery, { jingleIds: missingJingleIds });
      
      const existingJingleIdsFromDb = new Set(existingJingles.map(j => j.jingleId));
      
      // Only report Jingle IDs that exist in the database
      const validMissingJingleIds = missingJingleIds.filter(
        id => existingJingleIdsFromDb.has(id)
      );
      
      if (validMissingJingleIds.length > 0) {
        entities.push({
          entityType: 'fabrica',
          entityId: result.fabricaId,
          entityTitle: result.fabricaTitle || 'Untitled Fabrica',
          issue: `Missing APPEARS_IN relationships for ${validMissingJingleIds.length} Jingle(s) referenced in contents`,
          currentValue: {
            referencedJingles: validMissingJingleIds,
            existingRelationships: result.existingJingleIds.length,
          },
          suggestion: {
            type: 'relationship',
            field: 'APPEARS_IN',
            recommendedValue: validMissingJingleIds,
            automatable: true,
            requiresManualReview: false,
          },
        });
      }
    }
  }
  
  // Create suggestion summary
  const automatableCount = entities.filter(e => e.suggestion?.automatable).length;
  const suggestions = entities.length > 0 ? [{
    type: 'relationship',
    field: 'APPEARS_IN',
    count: entities.length,
    automatable: automatableCount,
    requiresReview: entities.length - automatableCount,
  }] : [];
  
  return {
    scriptId: 'find-fabricas-missing-jingles',
    scriptName: 'Find Fabricas where not all Jingles are listed',
    totalFound: entities.length,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
  };
}

/**
 * Automate creation of missing APPEARS_IN relationships
 */
export async function automateFabricasMissingJingles(
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const startTime = Date.now();
  const results: AutomationResultItem[] = [];
  const errors: Array<{ entityId: string; error: string; code?: string; retryable: boolean }> = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  // Get Fabricas and their missing Jingle IDs
  const query = `
    MATCH (f:Fabrica)
    WHERE f.id IN $fabricaIds AND f.contents IS NOT NULL AND f.contents <> ''
    OPTIONAL MATCH (j:Jingle)-[r:APPEARS_IN]->(f)
    WITH f, collect(j.id) AS existingJingleIds
    RETURN f.id AS fabricaId, f.contents AS contents, existingJingleIds
  `;
  
  const fabricas = await db.executeQuery<{
    fabricaId: string;
    contents: string;
    existingJingleIds: string[];
  }>(query, { fabricaIds: entityIds });
  
  const jingleIdPattern = /\bj[a-z0-9]{8}\b/g;
  
  for (const fabrica of fabricas) {
    try {
      // Extract Jingle IDs from contents
      const matches = fabrica.contents.match(jingleIdPattern);
      if (!matches) {
        skipped++;
        results.push({
          entityId: fabrica.fabricaId,
          status: 'failed',
          error: 'No Jingle IDs found in contents',
        });
        continue;
      }
      
      const referencedJingleIds = [...new Set(matches)];
      const existingJingleIdsSet = new Set(fabrica.existingJingleIds || []);
      const missingJingleIds = referencedJingleIds.filter(
        id => !existingJingleIdsSet.has(id)
      );
      
      if (missingJingleIds.length === 0) {
        skipped++;
        results.push({
          entityId: fabrica.fabricaId,
          status: 'failed',
          error: 'No missing relationships found',
        });
        continue;
      }
      
      // Verify Jingle IDs exist
      const verifyQuery = `
        MATCH (j:Jingle)
        WHERE j.id IN $jingleIds
        RETURN j.id AS jingleId
      `;
      
      const existingJingles = await db.executeQuery<{ jingleId: string }>(
        verifyQuery,
        { jingleIds: missingJingleIds }
      );
      
      const validJingleIds = existingJingles.map(j => j.jingleId);
      
      if (validJingleIds.length === 0) {
        skipped++;
        results.push({
          entityId: fabrica.fabricaId,
          status: 'failed',
          error: 'Referenced Jingle IDs do not exist in database',
        });
        continue;
      }
      
      // Create APPEARS_IN relationships
      let createdCount = 0;
      for (const jingleId of validJingleIds) {
        try {
          const createQuery = `
            MATCH (j:Jingle {id: $jingleId}), (f:Fabrica {id: $fabricaId})
            WHERE NOT EXISTS {
              (j)-[:APPEARS_IN]->(f)
            }
            CREATE (j)-[r:APPEARS_IN {timestamp: 0, createdAt: datetime()}]->(f)
            RETURN r
          `;
          
          await db.executeQuery(createQuery, {
            jingleId,
            fabricaId: fabrica.fabricaId,
          }, undefined, true);
          
          createdCount++;
        } catch (relError: any) {
          console.error(`Failed to create APPEARS_IN for ${jingleId}->${fabrica.fabricaId}:`, relError);
        }
      }
      
      if (createdCount > 0) {
        successful++;
        results.push({
          entityId: fabrica.fabricaId,
          status: 'success',
          changes: {
            createdRelationships: createdCount,
            jingleIds: validJingleIds,
          },
        });
      } else {
        failed++;
        results.push({
          entityId: fabrica.fabricaId,
          status: 'failed',
          error: 'Failed to create any relationships',
        });
      }
    } catch (error: any) {
      failed++;
      errors.push({
        entityId: fabrica.fabricaId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: fabrica.fabricaId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'find-fabricas-missing-jingles',
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
 * Script 2: Find Fabricas with duplicate timestamps
 * 
 * Identifies Fabricas where two or more Jingles have the same timestamp.
 * This may indicate duplicate entries or data entry errors.
 * Not automatable - requires manual review.
 */
export async function findFabricasDuplicateTimestamps(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  
  // Query for Fabricas with duplicate timestamps
  const query = `
    MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
    WITH f, r.timestamp AS timestamp, collect(j) AS jingles
    WHERE size(jingles) >= 2
    RETURN f.id AS fabricaId,
           f.title AS fabricaTitle,
           timestamp,
           [j IN jingles | j.id] AS jingleIds,
           [j IN jingles | j.title] AS jingleTitles
    ORDER BY f.id, timestamp
  `;
  
  const results = await db.executeQuery<{
    fabricaId: string;
    fabricaTitle?: string;
    timestamp: number;
    jingleIds: string[];
    jingleTitles: (string | undefined)[];
  }>(query, {});
  
  const executionTime = Date.now() - startTime;
  
  // Format timestamp for display
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Group by Fabrica
  const fabricaMap = new Map<string, {
    fabricaId: string;
    fabricaTitle?: string;
    duplicates: Array<{
      timestamp: number;
      timestampFormatted: string;
      jingleIds: string[];
      jingleTitles: (string | undefined)[];
    }>;
  }>();
  
  for (const result of results) {
    if (!fabricaMap.has(result.fabricaId)) {
      fabricaMap.set(result.fabricaId, {
        fabricaId: result.fabricaId,
        fabricaTitle: result.fabricaTitle,
        duplicates: [],
      });
    }
    
    const fabrica = fabricaMap.get(result.fabricaId)!;
    fabrica.duplicates.push({
      timestamp: result.timestamp,
      timestampFormatted: formatTimestamp(result.timestamp),
      jingleIds: result.jingleIds,
      jingleTitles: result.jingleTitles,
    });
  }
  
  // Convert to entities
  const entities: EntityIssue[] = Array.from(fabricaMap.values()).map(fabrica => ({
    entityType: 'fabrica',
    entityId: fabrica.fabricaId,
    entityTitle: fabrica.fabricaTitle || 'Untitled Fabrica',
    issue: `Found ${fabrica.duplicates.length} timestamp(s) with duplicate Jingles`,
    currentValue: {
      duplicates: fabrica.duplicates,
      totalDuplicatePairs: fabrica.duplicates.reduce((sum, d) => sum + d.jingleIds.length, 0),
    },
    suggestion: {
      type: 'update',
      field: 'timestamp',
      recommendedValue: null, // Cannot auto-fix
      automatable: false,
      requiresManualReview: true,
    },
  }));
  
  // Create suggestion summary
  const suggestions = entities.length > 0 ? [{
    type: 'update',
    field: 'timestamp',
    count: entities.length,
    automatable: 0,
    requiresReview: entities.length,
  }] : [];
  
  return {
    scriptId: 'find-fabricas-duplicate-timestamps',
    scriptName: 'Find Fabricas with duplicate timestamps',
    totalFound: entities.length,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
  };
}

