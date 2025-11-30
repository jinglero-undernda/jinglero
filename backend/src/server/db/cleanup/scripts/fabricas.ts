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
 * Identifies Fabricas where the 'contents' property has a different count of timestamps
 * than the number of APPEARS_IN relationships.
 * Contents is optional - missing contents is not an issue.
 * Flags mismatches as warnings (not errors) since contents is user-written text.
 */
import { parseTimestampFromText } from '../../../utils/timestampParser';

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
  
  const entities: EntityIssue[] = [];
  
  for (const result of results) {
    // Count timestamps in contents by parsing each line
    const lines = result.contents.split('\n');
    const timestampCount = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && parseTimestampFromText(trimmed) !== null;
    }).length;
    
    const relationshipCount = result.existingJingleIds.length;
    
    // Only flag if there's a mismatch (contents is optional, so missing is fine)
    if (timestampCount !== relationshipCount) {
      let issue: string;
      if (timestampCount > relationshipCount) {
        issue = `Contents has ${timestampCount} timestamp(s) but only ${relationshipCount} APPEARS_IN relationship(s) - contents may reference non-existent Jingles`;
      } else {
        issue = `Contents has ${timestampCount} timestamp(s) but ${relationshipCount} APPEARS_IN relationship(s) - contents may be missing some Jingles`;
      }
      
      entities.push({
        entityType: 'fabrica',
        entityId: result.fabricaId,
        entityTitle: result.fabricaTitle || 'Untitled Fabrica',
        issue,
        currentValue: {
          timestampCount,
          relationshipCount,
          contents: result.contents.substring(0, 100) + (result.contents.length > 100 ? '...' : ''), // Preview first 100 chars
        },
        suggestion: {
          type: 'update',
          field: 'contents',
          recommendedValue: null, // Cannot auto-fix - requires manual review
          automatable: false,
          requiresManualReview: true,
        },
      });
    }
  }
  
  // Create suggestion summary
  const suggestions = entities.length > 0 ? [{
    type: 'update',
    field: 'contents',
    count: entities.length,
    automatable: 0,
    requiresReview: entities.length,
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
 * 
 * NOTE: This automation is not applicable for timestamp-based validation.
 * We cannot automatically create relationships from timestamps alone without
 * knowing which Jingle corresponds to which timestamp.
 * This function is kept for API compatibility but will always skip.
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
  
  // This script cannot be automated - we can't create relationships from timestamps alone
  // All entities will be skipped
  for (const fabricaId of entityIds) {
    skipped++;
    results.push({
      entityId: fabricaId,
      status: 'failed',
      error: 'Cannot automate: Contents validation requires manual review. Timestamps cannot be automatically matched to Jingles.',
    });
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

