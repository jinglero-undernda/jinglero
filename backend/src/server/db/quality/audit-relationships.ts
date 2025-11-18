/**
 * Relationship Direction Audit Script
 * 
 * Audits all relationships in the Neo4j database to validate:
 * 1. Entity ID formats are correct
 * 2. Relationship directions match the canonical schema
 * 3. Identifies duplicate relationships (both correct and incorrect directions)
 * 
 * Reference: BUG_0007
 */

import { Neo4jClient } from '../index';
import {
  getAllRelationshipTypes,
  getNeo4jRelationshipType,
  getRelationshipDirection,
  getRelationshipTypeKey,
  validateRelationshipDirection,
  type RelationshipTypeKey,
  type Neo4jRelationshipType,
} from './relationship-schema';
import {
  getEntityTypeFromId,
  validateEntityId,
  type EntityType,
} from './entity-id-validator';

/**
 * Audit options
 */
export interface AuditOptions {
  /** Run in dry-run mode (default: true) */
  dryRun?: boolean;
  /** Optional: audit specific relationship types only */
  relationshipTypes?: RelationshipTypeKey[];
  /** Whether to fix relationships (default: false) */
  fix?: boolean;
}

/**
 * Invalid node ID entry
 */
export interface InvalidNodeId {
  nodeId: string;
  relationshipType: string;
  position: 'start' | 'end';
  error: string;
}

/**
 * Incorrect relationship entry
 */
export interface IncorrectRelationship {
  relType: string;
  relTypeKey: RelationshipTypeKey;
  startNode: {
    id: string;
    type: string | null;
    label: string[];
  };
  endNode: {
    id: string;
    type: string | null;
    label: string[];
  };
  properties: Record<string, any>;
  hasDuplicate: boolean;
  expectedStartType: string;
  expectedEndType: string;
}

/**
 * Audit result
 */
export interface AuditResult {
  summary: {
    totalRelationships: number;
    correctRelationships: number;
    incorrectRelationships: number;
    duplicateRelationships: number;
    invalidNodeIds: number;
  };
  incorrect: IncorrectRelationship[];
  invalidIds: InvalidNodeId[];
  timestamp: string;
}

/**
 * Relationship data from Neo4j query
 */
interface RelationshipData {
  relType: string;
  startId: string;
  startLabels: string[];
  endId: string;
  endLabels: string[];
  relProperties: Record<string, any>;
}

/**
 * Perform audit of all relationships
 */
export async function auditRelationships(
  db: Neo4jClient,
  options: AuditOptions = {}
): Promise<AuditResult> {
  const { relationshipTypes = getAllRelationshipTypes() } = options;
  
  const result: AuditResult = {
    summary: {
      totalRelationships: 0,
      correctRelationships: 0,
      incorrectRelationships: 0,
      duplicateRelationships: 0,
      invalidNodeIds: 0,
    },
    incorrect: [],
    invalidIds: [],
    timestamp: new Date().toISOString(),
  };
  
  console.log('🔍 Starting relationship direction audit...\n');
  console.log(`Auditing ${relationshipTypes.length} relationship types: ${relationshipTypes.join(', ')}\n`);
  
  // Phase 1 & 2: Validate IDs and directions for each relationship type
  for (const relTypeKey of relationshipTypes) {
    const neo4jRelType = getNeo4jRelationshipType(relTypeKey);
    console.log(`\n📊 Auditing ${relTypeKey} (${neo4jRelType})...`);
    
    const relationships = await getRelationshipsForType(db, neo4jRelType);
    console.log(`  Found ${relationships.length} relationships`);
    
    result.summary.totalRelationships += relationships.length;
    
    for (const rel of relationships) {
      // Phase 1: Validate entity IDs
      const startValidation = validateEntityId(rel.startId);
      const endValidation = validateEntityId(rel.endId);
      
      if (!startValidation.valid) {
        result.invalidIds.push({
          nodeId: rel.startId,
          relationshipType: neo4jRelType,
          position: 'start',
          error: startValidation.error || 'Unknown error',
        });
        result.summary.invalidNodeIds++;
      }
      
      if (!endValidation.valid) {
        result.invalidIds.push({
          nodeId: rel.endId,
          relationshipType: neo4jRelType,
          position: 'end',
          error: endValidation.error || 'Unknown error',
        });
        result.summary.invalidNodeIds++;
      }
      
      // Skip direction validation if IDs are invalid
      if (!startValidation.valid || !endValidation.valid) {
        continue;
      }
      
      // Phase 2: Validate relationship direction
      const startEntityType = startValidation.type;
      const endEntityType = endValidation.type;
      
      // Convert EntityType to EntityTypeKey format (plural)
      const startTypeKey = entityTypeToKey(startEntityType!);
      const endTypeKey = entityTypeToKey(endEntityType!);
      
      const isCorrect = validateRelationshipDirection(
        relTypeKey,
        startTypeKey,
        endTypeKey
      );
      
      if (isCorrect) {
        result.summary.correctRelationships++;
      } else {
        // Phase 3: Check for duplicates
        const hasDuplicate = await checkForDuplicate(
          db,
          neo4jRelType,
          rel.startId,
          rel.endId
        );
        
        if (hasDuplicate) {
          result.summary.duplicateRelationships++;
        }
        
        const direction = getRelationshipDirection(relTypeKey);
        
        result.incorrect.push({
          relType: neo4jRelType,
          relTypeKey,
          startNode: {
            id: rel.startId,
            type: startEntityType || null,
            label: rel.startLabels,
          },
          endNode: {
            id: rel.endId,
            type: endEntityType || null,
            label: rel.endLabels,
          },
          properties: rel.relProperties,
          hasDuplicate,
          expectedStartType: direction.start,
          expectedEndType: direction.end,
        });
        
        result.summary.incorrectRelationships++;
      }
    }
  }
  
  return result;
}

/**
 * Get all relationships of a specific type from Neo4j
 */
async function getRelationshipsForType(
  db: Neo4jClient,
  relType: Neo4jRelationshipType
): Promise<RelationshipData[]> {
  const query = `
    MATCH (start)-[r:${relType}]->(end)
    RETURN 
      type(r) as relType,
      start.id as startId,
      labels(start) as startLabels,
      end.id as endId,
      labels(end) as endLabels,
      properties(r) as relProperties
  `;
  
  const results = await db.executeQuery<RelationshipData>(query, {});
  return results;
}

/**
 * Check if a duplicate relationship exists in the correct direction
 */
async function checkForDuplicate(
  db: Neo4jClient,
  relType: Neo4jRelationshipType,
  wrongStartId: string,
  wrongEndId: string
): Promise<boolean> {
  // Get the relationship type key to determine correct direction
  const relTypeKey = getRelationshipTypeKey(relType);
  const direction = getRelationshipDirection(relTypeKey);
  
  // The correct start/end are swapped from the wrong ones
  // Wrong: (wrongStart) -> (wrongEnd)
  // Correct: (wrongEnd) -> (wrongStart)
  const correctStartId = wrongEndId; // End becomes start
  const correctEndId = wrongStartId; // Start becomes end
  
  // Check if correct-direction relationship exists
  const query = `
    MATCH (correctStart:${direction.startLabel} {id: $correctStartId})-[r:${relType}]->(correctEnd:${direction.endLabel} {id: $correctEndId})
    RETURN r LIMIT 1
  `;
  
  const results = await db.executeQuery<{ r: any }>(query, {
    correctStartId,
    correctEndId,
  });
  
  return results.length > 0;
}

/**
 * Convert EntityType (singular) to EntityTypeKey (plural)
 */
function entityTypeToKey(entityType: EntityType): string {
  const map: Record<EntityType, string> = {
    jingle: 'jingles',
    cancion: 'canciones',
    artista: 'artistas',
    tematica: 'tematicas',
    usuario: 'usuarios',
    fabrica: 'fabricas',
  };
  
  return map[entityType];
}

/**
 * Print audit report to console
 */
export function printAuditReport(result: AuditResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('📋 AUDIT REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${result.timestamp}\n`);
  
  console.log('Summary:');
  console.log(`  Total relationships: ${result.summary.totalRelationships}`);
  console.log(`  ✅ Correct: ${result.summary.correctRelationships}`);
  console.log(`  ❌ Incorrect: ${result.summary.incorrectRelationships}`);
  console.log(`  🔄 Duplicates: ${result.summary.duplicateRelationships}`);
  console.log(`  ⚠️  Invalid IDs: ${result.summary.invalidNodeIds}\n`);
  
  if (result.invalidIds.length > 0) {
    console.log('Invalid Node IDs:');
    for (const invalid of result.invalidIds) {
      console.log(`  - ${invalid.nodeId} (${invalid.position} node in ${invalid.relationshipType}): ${invalid.error}`);
    }
    console.log('');
  }
  
  if (result.incorrect.length > 0) {
    console.log('Incorrect Relationships:');
    for (const incorrect of result.incorrect) {
      console.log(`  ${incorrect.relType}:`);
      console.log(`    Current: (${incorrect.startNode.type || 'unknown'}) ${incorrect.startNode.id} -> (${incorrect.endNode.type || 'unknown'}) ${incorrect.endNode.id}`);
      console.log(`    Expected: (${incorrect.expectedStartType}) -> (${incorrect.expectedEndType})`);
      console.log(`    Has duplicate: ${incorrect.hasDuplicate ? 'Yes' : 'No'}`);
      console.log(`    Properties: ${JSON.stringify(incorrect.properties)}`);
      console.log('');
    }
  }
  
  if (result.summary.incorrectRelationships === 0 && result.summary.invalidNodeIds === 0) {
    console.log('✅ All relationships are correct!');
  }
}

