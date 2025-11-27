import { Neo4jClient } from '../index';

/**
 * REPEATS Relationship Validation Module
 * 
 * Provides validation and normalization logic for REPEATS relationships:
 * - Direction validation based on publication dates (fabricaDate)
 * - Transitive normalization to maintain direct links to original instances
 * - Circular reference prevention
 */

export interface RepeatsDirectionResult {
  correctStart: string;
  correctEnd: string;
  corrected: boolean;
  reason: string;
}

export interface NormalizationResult {
  normalized: boolean;
  deletedRelationships?: Array<{ start: string; end: string }>;
  updatedRelationships?: Array<{ start: string; end: string; newEnd: string }>;
}

/**
 * Validates and corrects REPEATS relationship direction based on publication dates
 * 
 * Rules:
 * 1. Both Published: Latest (newer fabricaDate) → REPEATS → Earliest (older fabricaDate)
 * 2. One Inedito: Inedito (no fabricaDate) → REPEATS → Published (has fabricaDate)
 * 3. Both Inedito: Later (newer createdAt) → REPEATS → Earlier (older createdAt)
 * 
 * @param db - Neo4j client instance
 * @param startId - Start Jingle ID
 * @param endId - End Jingle ID
 * @returns Direction validation result with correct start/end IDs
 */
export async function validateRepeatsDirection(
  db: Neo4jClient,
  startId: string,
  endId: string
): Promise<RepeatsDirectionResult> {
  // Fetch both Jingles with their fabricaDate and createdAt
  const query = `
    MATCH (start:Jingle { id: $startId }), (end:Jingle { id: $endId })
    RETURN start.id AS startId, start.fabricaDate AS startFabricaDate, start.createdAt AS startCreatedAt,
           end.id AS endId, end.fabricaDate AS endFabricaDate, end.createdAt AS endCreatedAt
  `;
  
  const result = await db.executeQuery<{
    startId: string;
    startFabricaDate: Date | null;
    startCreatedAt: Date | null;
    endId: string;
    endFabricaDate: Date | null;
    endCreatedAt: Date | null;
  }>(query, { startId, endId });
  
  if (result.length === 0) {
    throw new Error(`One or both Jingles not found: ${startId}, ${endId}`);
  }
  
  const data = result[0];
  const startFabricaDate = data.startFabricaDate ? new Date(data.startFabricaDate) : null;
  const endFabricaDate = data.endFabricaDate ? new Date(data.endFabricaDate) : null;
  const startCreatedAt = data.startCreatedAt ? new Date(data.startCreatedAt) : null;
  const endCreatedAt = data.endCreatedAt ? new Date(data.endCreatedAt) : null;
  
  let correctStart: string;
  let correctEnd: string;
  let reason: string;
  
  // Rule 1: Both Published
  if (startFabricaDate && endFabricaDate) {
    if (startFabricaDate > endFabricaDate) {
      // Start is newer → correct direction
      correctStart = startId;
      correctEnd = endId;
      reason = `Both published: Latest (${startId}, ${startFabricaDate.toISOString()}) → Earliest (${endId}, ${endFabricaDate.toISOString()})`;
    } else {
      // End is newer → reverse direction
      correctStart = endId;
      correctEnd = startId;
      reason = `Both published: Corrected direction - Latest (${endId}, ${endFabricaDate.toISOString()}) → Earliest (${startId}, ${startFabricaDate.toISOString()})`;
    }
  }
  // Rule 2: One Inedito
  else if (!startFabricaDate && endFabricaDate) {
    // Start is Inedito → correct direction
    correctStart = startId;
    correctEnd = endId;
    reason = `One Inedito: Inedito (${startId}) → Published (${endId})`;
  }
  else if (startFabricaDate && !endFabricaDate) {
    // End is Inedito → reverse direction
    correctStart = endId;
    correctEnd = startId;
    reason = `One Inedito: Corrected direction - Inedito (${endId}) → Published (${startId})`;
  }
  // Rule 3: Both Inedito
  else {
    // If either createdAt is null, we cannot determine direction by date
    // Fall back to using IDs as tiebreaker (maintain original direction)
    if (!startCreatedAt || !endCreatedAt) {
      correctStart = startId;
      correctEnd = endId;
      const missingDates = [];
      if (!startCreatedAt) missingDates.push(`${startId} (start)`);
      if (!endCreatedAt) missingDates.push(`${endId} (end)`);
      reason = `Both Inedito: Cannot determine direction (missing createdAt on ${missingDates.join(', ')}), using original direction`;
    } else if (startCreatedAt > endCreatedAt) {
      // Start is newer → correct direction
      correctStart = startId;
      correctEnd = endId;
      reason = `Both Inedito: Later (${startId}, ${startCreatedAt.toISOString()}) → Earlier (${endId}, ${endCreatedAt.toISOString()})`;
    } else {
      // End is newer → reverse direction
      correctStart = endId;
      correctEnd = startId;
      reason = `Both Inedito: Corrected direction - Later (${endId}, ${endCreatedAt.toISOString()}) → Earlier (${startId}, ${startCreatedAt.toISOString()})`;
    }
  }
  
  const corrected = correctStart !== startId || correctEnd !== endId;
  
  return {
    correctStart,
    correctEnd,
    corrected,
    reason
  };
}

/**
 * Checks for circular REPEATS chains
 * 
 * @param db - Neo4j client instance
 * @param startId - Start Jingle ID
 * @param endId - End Jingle ID
 * @returns true if creating this relationship would create a circular reference
 */
export async function checkCircularReference(
  db: Neo4jClient,
  startId: string,
  endId: string
): Promise<boolean> {
  // Check if endId can reach startId through existing REPEATS chain
  // This would create a cycle: startId → endId → ... → startId
  const query = `
    MATCH path = (end:Jingle { id: $endId })-[:REPEATS*]->(start:Jingle { id: $startId })
    RETURN path
    LIMIT 1
  `;
  
  const result = await db.executeQuery(query, { startId, endId });
  return result.length > 0;
}

/**
 * Normalizes transitive REPEATS chains
 * 
 * If J3-REPEATS-J1 AND J1-REPEATS-J2 exist, normalizes to J3-REPEATS-J2
 * 
 * @param db - Neo4j client instance
 * @param startId - Start Jingle ID (the new relationship being created)
 * @param endId - End Jingle ID (the new relationship being created)
 * @returns Normalization result with deleted/updated relationships
 */
export async function normalizeTransitiveChains(
  db: Neo4jClient,
  startId: string,
  endId: string
): Promise<NormalizationResult> {
  const deletedRelationships: Array<{ start: string; end: string }> = [];
  const updatedRelationships: Array<{ start: string; end: string; newEnd: string }> = [];
  
  // Check if endId has outbound REPEATS (making it an intermediate node)
  // If so, we need to normalize: startId → endId → ... → finalTarget
  const findFinalTargetQuery = `
    MATCH (end:Jingle { id: $endId })-[:REPEATS]->(target:Jingle)
    WHERE NOT (target)-[:REPEATS]->()
    RETURN target.id AS finalTargetId
    LIMIT 1
  `;
  
  const finalTargetResult = await db.executeQuery<{ finalTargetId: string }>(findFinalTargetQuery, { endId });
  
  if (finalTargetResult.length > 0) {
    const finalTargetId = finalTargetResult[0].finalTargetId;
    
    // Check if startId already has a REPEATS to finalTargetId
    const existingQuery = `
      MATCH (start:Jingle { id: $startId })-[r:REPEATS]->(target:Jingle { id: $finalTargetId })
      RETURN r
    `;
    
    const existing = await db.executeQuery(existingQuery, { startId, finalTargetId: finalTargetId });
    
    if (existing.length > 0) {
      // Relationship already exists, delete the intermediate one (startId → endId)
      const deleteQuery = `
        MATCH (start:Jingle { id: $startId })-[r:REPEATS]->(end:Jingle { id: $endId })
        DELETE r
      `;
      await db.executeQuery(deleteQuery, { startId, endId }, undefined, true);
      deletedRelationships.push({ start: startId, end: endId });
    } else {
      // Update the relationship to point to finalTarget instead
      const updateQuery = `
        MATCH (start:Jingle { id: $startId })-[r:REPEATS]->(end:Jingle { id: $endId })
        MATCH (target:Jingle { id: $finalTargetId })
        DELETE r
        CREATE (start)-[r2:REPEATS]->(target)
        SET r2.status = 'DRAFT',
            r2.createdAt = datetime()
        RETURN r2
      `;
      await db.executeQuery(updateQuery, { startId, endId, finalTargetId }, undefined, true);
      updatedRelationships.push({ start: startId, end: endId, newEnd: finalTargetId });
    }
  }
  
  // Check if startId has inbound REPEATS (making it an intermediate node)
  // If so, we need to normalize: ... → startId → endId
  const findSourceQuery = `
    MATCH (source:Jingle)-[:REPEATS]->(start:Jingle { id: $startId })
    WHERE NOT ()-[:REPEATS]->(source)
    RETURN source.id AS sourceId
    LIMIT 1
  `;
  
  const sourceResult = await db.executeQuery<{ sourceId: string }>(findSourceQuery, { startId });
  
  if (sourceResult.length > 0) {
    const sourceId = sourceResult[0].sourceId;
    
    // Check if sourceId already has a REPEATS to endId
    const existingQuery = `
      MATCH (source:Jingle { id: $sourceId })-[r:REPEATS]->(target:Jingle { id: $endId })
      RETURN r
    `;
    
    const existing = await db.executeQuery(existingQuery, { sourceId, endId });
    
    if (existing.length > 0) {
      // Relationship already exists, delete the intermediate one (startId → endId)
      const deleteQuery = `
        MATCH (start:Jingle { id: $startId })-[r:REPEATS]->(end:Jingle { id: $endId })
        DELETE r
      `;
      await db.executeQuery(deleteQuery, { startId, endId }, undefined, true);
      deletedRelationships.push({ start: startId, end: endId });
    } else {
      // Update sourceId → startId to sourceId → endId
      const updateQuery = `
        MATCH (source:Jingle { id: $sourceId })-[r:REPEATS]->(start:Jingle { id: $startId })
        MATCH (target:Jingle { id: $endId })
        DELETE r
        CREATE (source)-[r2:REPEATS]->(target)
        SET r2.status = 'DRAFT',
            r2.createdAt = datetime()
        RETURN r2
      `;
      await db.executeQuery(updateQuery, { sourceId, startId, endId }, undefined, true);
      updatedRelationships.push({ start: sourceId, end: startId, newEnd: endId });
    }
  }
  
  return {
    normalized: deletedRelationships.length > 0 || updatedRelationships.length > 0,
    deletedRelationships: deletedRelationships.length > 0 ? deletedRelationships : undefined,
    updatedRelationships: updatedRelationships.length > 0 ? updatedRelationships : undefined
  };
}

/**
 * Checks for concurrent inbound and outbound REPEATS on the same Jingle
 * 
 * If detected, triggers normalization immediately
 * 
 * @param db - Neo4j client instance
 * @param jingleId - Jingle ID to check
 * @returns true if concurrent inbound/outbound REPEATS detected
 */
export async function checkConcurrentInboundOutbound(
  db: Neo4jClient,
  jingleId: string
): Promise<boolean> {
  const query = `
    MATCH (j:Jingle { id: $jingleId })
    OPTIONAL MATCH (j)<-[:REPEATS]-(inbound)
    OPTIONAL MATCH (j)-[:REPEATS]->(outbound)
    RETURN count(DISTINCT inbound) AS inboundCount, count(DISTINCT outbound) AS outboundCount
  `;
  
  const result = await db.executeQuery<{ inboundCount: number; outboundCount: number }>(query, { jingleId });
  
  if (result.length > 0) {
    const { inboundCount, outboundCount } = result[0];
    return inboundCount > 0 && outboundCount > 0;
  }
  
  return false;
}

