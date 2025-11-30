/**
 * General Cleanup Scripts
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
 * Script 11: Refresh all redundant properties and empty booleans
 * 
 * Recalculates redundant properties based on current relationships
 * and sets default values for empty boolean fields.
 */
export async function refreshRedundantProperties(): Promise<ScriptExecutionResult> {
  const startTime = Date.now();
  
  const entities: EntityIssue[] = [];
  let totalIssues = 0;
  
  // 1. Refresh Jingle redundant properties (fabricaId, fabricaDate, cancionId)
  const jinglesQuery = `
    MATCH (j:Jingle)
    OPTIONAL MATCH (j)-[r:APPEARS_IN]->(f:Fabrica)
    WITH j, f, r
    ORDER BY r.order ASC, r.timestamp ASC
    WITH j, collect(f)[0] AS firstFabrica
    OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
    WITH j, firstFabrica, collect(c)[0] AS firstCancion
    RETURN j.id AS jingleId,
           j.title AS jingleTitle,
           j.fabricaId AS currentFabricaId,
           j.fabricaDate AS currentFabricaDate,
           j.cancionId AS currentCancionId,
           firstFabrica.id AS expectedFabricaId,
           firstFabrica.date AS expectedFabricaDate,
           firstCancion.id AS expectedCancionId
  `;
  
  const jingles = await db.executeQuery<{
    jingleId: string;
    jingleTitle?: string;
    currentFabricaId?: string;
    currentFabricaDate?: any;
    currentCancionId?: string;
    expectedFabricaId?: string;
    expectedFabricaDate?: any;
    expectedCancionId?: string;
  }>(jinglesQuery, {});
  
  for (const jingle of jingles) {
    const issues: string[] = [];
    const changes: Record<string, any> = {};
    
    if (jingle.currentFabricaId !== jingle.expectedFabricaId) {
      issues.push('fabricaId');
      changes.fabricaId = jingle.expectedFabricaId;
    }
    
    // Compare dates (handle Neo4j DateTime objects)
    const currentDateStr = jingle.currentFabricaDate ? 
      (typeof jingle.currentFabricaDate === 'string' ? jingle.currentFabricaDate : 
       jingle.currentFabricaDate.toString()) : null;
    const expectedDateStr = jingle.expectedFabricaDate ? 
      (typeof jingle.expectedFabricaDate === 'string' ? jingle.expectedFabricaDate : 
       jingle.expectedFabricaDate.toString()) : null;
    
    if (currentDateStr !== expectedDateStr) {
      issues.push('fabricaDate');
      changes.fabricaDate = jingle.expectedFabricaDate;
    }
    
    if (jingle.currentCancionId !== jingle.expectedCancionId) {
      issues.push('cancionId');
      changes.cancionId = jingle.expectedCancionId;
    }
    
    if (issues.length > 0) {
      totalIssues++;
      entities.push({
        entityType: 'jingle',
        entityId: jingle.jingleId,
        entityTitle: jingle.jingleTitle || 'Untitled Jingle',
        issue: `Redundant properties mismatch: ${issues.join(', ')}`,
        currentValue: {
          fabricaId: jingle.currentFabricaId,
          fabricaDate: currentDateStr,
          cancionId: jingle.currentCancionId,
        },
        suggestion: {
          type: 'update',
          field: issues.join(','),
          recommendedValue: changes,
          automatable: true,
          requiresManualReview: false,
        },
      });
    }
  }
  
  // 2. Refresh Cancion redundant properties (autorIds)
  const cancionesQuery = `
    MATCH (c:Cancion)
    OPTIONAL MATCH (a:Artista)-[:AUTOR_DE]->(c)
    WITH c, collect(DISTINCT a.id) AS expectedAutorIds
    RETURN c.id AS cancionId,
           c.title AS cancionTitle,
           c.autorIds AS currentAutorIds,
           expectedAutorIds
  `;
  
  const canciones = await db.executeQuery<{
    cancionId: string;
    cancionTitle: string;
    currentAutorIds?: string[];
    expectedAutorIds: string[];
  }>(cancionesQuery, {});
  
  for (const cancion of canciones) {
    const currentIds = new Set(cancion.currentAutorIds || []);
    const expectedIds = new Set(cancion.expectedAutorIds || []);
    
    // Check if arrays match
    const arraysMatch = currentIds.size === expectedIds.size &&
      [...currentIds].every(id => expectedIds.has(id));
    
    if (!arraysMatch) {
      totalIssues++;
      entities.push({
        entityType: 'cancion',
        entityId: cancion.cancionId,
        entityTitle: cancion.cancionTitle,
        issue: 'Redundant property mismatch: autorIds',
        currentValue: {
          autorIds: cancion.currentAutorIds || [],
        },
        suggestion: {
          type: 'update',
          field: 'autorIds',
          recommendedValue: cancion.expectedAutorIds,
          automatable: true,
          requiresManualReview: false,
        },
      });
    }
  }
  
  // 3. Set default values for empty boolean fields
  // Check Jingles for empty booleans
  const emptyBooleansQuery = `
    MATCH (j:Jingle)
    WHERE j.isJinglazo IS NULL 
       OR j.isJinglazoDelDia IS NULL 
       OR j.isPrecario IS NULL
    RETURN j.id AS jingleId,
           j.title AS jingleTitle,
           j.isJinglazo AS isJinglazo,
           j.isJinglazoDelDia AS isJinglazoDelDia,
           j.isPrecario AS isPrecario
  `;
  
  const emptyBooleans = await db.executeQuery<{
    jingleId: string;
    jingleTitle?: string;
    isJinglazo?: boolean | null;
    isJinglazoDelDia?: boolean | null;
    isPrecario?: boolean | null;
  }>(emptyBooleansQuery, {});
  
  for (const jingle of emptyBooleans) {
    const issues: string[] = [];
    const changes: Record<string, any> = {};
    
    if (jingle.isJinglazo === null || jingle.isJinglazo === undefined) {
      issues.push('isJinglazo');
      changes.isJinglazo = false;
    }
    
    if (jingle.isJinglazoDelDia === null || jingle.isJinglazoDelDia === undefined) {
      issues.push('isJinglazoDelDia');
      changes.isJinglazoDelDia = false;
    }
    
    if (jingle.isPrecario === null || jingle.isPrecario === undefined) {
      issues.push('isPrecario');
      changes.isPrecario = false;
    }
    
    if (issues.length > 0) {
      totalIssues++;
      entities.push({
        entityType: 'jingle',
        entityId: jingle.jingleId,
        entityTitle: jingle.jingleTitle || 'Untitled Jingle',
        issue: `Empty boolean fields: ${issues.join(', ')}`,
        currentValue: {
          isJinglazo: jingle.isJinglazo,
          isJinglazoDelDia: jingle.isJinglazoDelDia,
          isPrecario: jingle.isPrecario,
        },
        suggestion: {
          type: 'update',
          field: issues.join(','),
          recommendedValue: changes,
          automatable: true,
          requiresManualReview: false,
        },
      });
    }
  }
  
  const executionTime = Date.now() - startTime;
  
  // Create suggestion summary
  const automatableCount = entities.filter(e => e.suggestion?.automatable).length;
  const suggestions = entities.length > 0 ? [{
    type: 'update',
    field: 'redundant_properties',
    count: entities.length,
    automatable: automatableCount,
    requiresReview: entities.length - automatableCount,
  }] : [];
  
  return {
    scriptId: 'refresh-redundant-properties',
    scriptName: 'Refresh all redundant properties and empty booleans',
    totalFound: totalIssues,
    executionTime,
    timestamp: new Date().toISOString(),
    entities,
    suggestions,
  };
}

/**
 * Automate refreshing redundant properties
 */
export async function automateRefreshRedundantProperties(
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const startTime = Date.now();
  const results: AutomationResultItem[] = [];
  const errors: Array<{ entityId: string; error: string; code?: string; retryable: boolean }> = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  // Process entities by type
  // This is a simplified version - in production, you'd want to handle each entity type separately
  
  // For now, we'll update all entities that need fixing
  // Get all entities with issues
  const allEntities = await refreshRedundantProperties();
  
  // Filter to only requested entity IDs
  const requestedEntities = allEntities.entities.filter(e => entityIds.includes(e.entityId));
  
  for (const entity of requestedEntities) {
    try {
      if (!entity.suggestion?.automatable || !entity.suggestion.recommendedValue) {
        skipped++;
        results.push({
          entityId: entity.entityId,
          status: 'failed',
          error: 'Not automatable or no recommended value',
        });
        continue;
      }
      
      // Update based on entity type
      if (entity.entityType === 'jingle') {
        const updateQuery = `
          MATCH (j:Jingle {id: $jingleId})
          SET j += $updates,
              j.updatedAt = datetime()
          RETURN j.id AS jingleId
        `;
        
        await db.executeQuery(updateQuery, {
          jingleId: entity.entityId,
          updates: entity.suggestion.recommendedValue,
        }, undefined, true);
      } else if (entity.entityType === 'cancion') {
        const updateQuery = `
          MATCH (c:Cancion {id: $cancionId})
          SET c.autorIds = $autorIds,
              c.updatedAt = datetime()
          RETURN c.id AS cancionId
        `;
        
        await db.executeQuery(updateQuery, {
          cancionId: entity.entityId,
          autorIds: entity.suggestion.recommendedValue,
        }, undefined, true);
      }
      
      successful++;
      results.push({
        entityId: entity.entityId,
        status: 'success',
        changes: entity.suggestion.recommendedValue,
      });
    } catch (error: any) {
      failed++;
      errors.push({
        entityId: entity.entityId,
        error: error.message || 'Unknown error',
        retryable: true,
      });
      results.push({
        entityId: entity.entityId,
        status: 'failed',
        error: error.message || 'Unknown error',
      });
    }
  }
  
  return {
    scriptId: 'refresh-redundant-properties',
    totalRequested: entityIds.length,
    totalApplied: successful,
    successful,
    failed,
    skipped,
    results,
    errors,
  };
}

