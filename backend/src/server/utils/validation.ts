/**
 * Knowledge Graph Validation Utilities
 * 
 * Provides validation functions for:
 * 1. Duplicate relationships - Detect and flag duplicate relationships
 * 2. Invalid relationship targets - Relationships pointing to non-existent entities
 * 3. Redundant field mismatches - Redundant properties that don't match their relationships
 * 
 * These utilities are used by the admin API validation endpoints.
 */

import { Neo4jClient } from '../db';

export interface ValidationIssue {
  type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
  severity: 'error' | 'warning';
  entityType: string;
  entityId: string;
  relationshipType?: string;
  targetEntityId?: string;
  message: string;
  fixable: boolean;
  fixAction?: {
    type: 'update_redundant_property' | 'delete_duplicate_relationship';
    description: string;
  };
}

export interface ValidationResult {
  entityType: string;
  entityId: string;
  issues: ValidationIssue[];
  isValid: boolean;
}

export interface RelationshipValidationResult {
  relationshipType: string;
  startEntityId: string;
  endEntityId: string;
  issues: ValidationIssue[];
  isValid: boolean;
}

/**
 * Validate a specific entity for all validation issues
 */
export async function validateEntity(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  // Get entity label from type
  const entityLabel = getEntityLabel(entityType);
  if (!entityLabel) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }

  // Check if entity exists
  const entityExistsQuery = `
    MATCH (n:${entityLabel} { id: $entityId })
    RETURN n
  `;
  const entityResult = await db.executeQuery(entityExistsQuery, { entityId });
  if (entityResult.length === 0) {
    throw new Error(`Entity not found: ${entityType}/${entityId}`);
  }

  // Validate duplicate relationships
  const duplicateIssues = await validateDuplicateRelationships(db, entityType, entityId);
  issues.push(...duplicateIssues);

  // Validate invalid relationship targets
  const invalidTargetIssues = await validateInvalidRelationshipTargets(db, entityType, entityId);
  issues.push(...invalidTargetIssues);

  // Validate redundant field mismatches
  const redundantFieldIssues = await validateRedundantFieldMismatches(db, entityType, entityId);
  issues.push(...redundantFieldIssues);

  return {
    entityType,
    entityId,
    issues,
    isValid: issues.length === 0,
  };
}

/**
 * Validate a specific relationship for issues
 */
export async function validateRelationship(
  db: Neo4jClient,
  relationshipType: string,
  startEntityId: string,
  endEntityId: string
): Promise<RelationshipValidationResult> {
  const issues: ValidationIssue[] = [];

  const neo4jRelType = getNeo4jRelationshipType(relationshipType);
  if (!neo4jRelType) {
    throw new Error(`Unknown relationship type: ${relationshipType}`);
  }

  // Check for duplicate relationships
  const duplicateQuery = `
    MATCH (start { id: $startEntityId })-[r:${neo4jRelType}]->(end { id: $endEntityId })
    WITH collect(r) AS rels
    WHERE size(rels) > 1
    RETURN size(rels) AS count
  `;
  const duplicateResult = await db.executeQuery(duplicateQuery, { startEntityId, endEntityId });
  if (duplicateResult.length > 0) {
    const count = (duplicateResult[0] as any).count?.low || (duplicateResult[0] as any).count || 0;
    if (count > 1) {
    issues.push({
      type: 'duplicate_relationship',
      severity: 'error',
      entityType: 'relationship',
      entityId: `${startEntityId}-${endEntityId}`,
      relationshipType,
      targetEntityId: endEntityId,
      message: `Duplicate ${relationshipType} relationship found between ${startEntityId} and ${endEntityId} (${count} duplicates)`,
      fixable: true,
      fixAction: {
        type: 'delete_duplicate_relationship',
        description: `Delete duplicate ${relationshipType} relationship`,
      },
    });
    }
  }

  // Check if relationship exists and target entity exists
  const relationshipExistsQuery = `
    MATCH (start { id: $startEntityId })-[r:${neo4jRelType}]->(end { id: $endEntityId })
    RETURN r, end
    LIMIT 1
  `;
  const relationshipResult = await db.executeQuery(relationshipExistsQuery, { startEntityId, endEntityId });
  if (relationshipResult.length === 0) {
    // Check if entities exist
    const startExistsQuery = `MATCH (n { id: $startEntityId }) RETURN n LIMIT 1`;
    const endExistsQuery = `MATCH (n { id: $endEntityId }) RETURN n LIMIT 1`;
    const startExists = await db.executeQuery(startExistsQuery, { startEntityId });
    const endExists = await db.executeQuery(endExistsQuery, { endEntityId });
    
    if (startExists.length === 0) {
      issues.push({
        type: 'invalid_target',
        severity: 'error',
        entityType: 'relationship',
        entityId: `${startEntityId}-${endEntityId}`,
        relationshipType,
        targetEntityId: startEntityId,
        message: `Relationship ${relationshipType} source entity does not exist: ${startEntityId}`,
        fixable: false,
      });
    } else if (endExists.length === 0) {
      issues.push({
        type: 'invalid_target',
        severity: 'error',
        entityType: 'relationship',
        entityId: `${startEntityId}-${endEntityId}`,
        relationshipType,
        targetEntityId: endEntityId,
        message: `Relationship ${relationshipType} target entity does not exist: ${endEntityId}`,
        fixable: false,
      });
    } else {
      issues.push({
        type: 'invalid_target',
        severity: 'error',
        entityType: 'relationship',
        entityId: `${startEntityId}-${endEntityId}`,
        relationshipType,
        targetEntityId: endEntityId,
        message: `Relationship ${relationshipType} does not exist between ${startEntityId} and ${endEntityId}`,
        fixable: false,
      });
    }
  }

  return {
    relationshipType,
    startEntityId,
    endEntityId,
    issues,
    isValid: issues.length === 0,
  };
}

/**
 * Validate all entities of a specific type
 */
export async function validateAllEntities(
  db: Neo4jClient,
  entityType: string
): Promise<ValidationResult[]> {
  const entityLabel = getEntityLabel(entityType);
  if (!entityLabel) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }

  const query = `
    MATCH (n:${entityLabel})
    RETURN n.id AS id
  `;
  const results = await db.executeQuery<{ id: string }>(query);

  const validationResults: ValidationResult[] = [];
  for (const record of results) {
    const result = await validateEntity(db, entityType, record.id);
    validationResults.push(result);
  }

  return validationResults;
}

/**
 * Validate duplicate relationships for an entity
 */
async function validateDuplicateRelationships(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const entityLabel = getEntityLabel(entityType);

  // Check for duplicate outgoing relationships
  const duplicateOutgoingQuery = `
    MATCH (n:${entityLabel} { id: $entityId })-[r]->(target)
    WITH type(r) AS relType, target.id AS targetId, collect(r) AS rels
    WHERE size(rels) > 1
    RETURN relType, targetId, size(rels) AS count
  `;
  const outgoingDuplicates = await db.executeQuery(duplicateOutgoingQuery, { entityId });
  for (const dup of outgoingDuplicates) {
    const record = dup as any;
    issues.push({
      type: 'duplicate_relationship',
      severity: 'error',
      entityType,
      entityId,
      relationshipType: record.relType,
      targetEntityId: record.targetId,
      message: `Duplicate ${record.relType} relationship to ${record.targetId} (${record.count} duplicates)`,
      fixable: true,
      fixAction: {
        type: 'delete_duplicate_relationship',
        description: `Delete duplicate ${record.relType} relationships to ${record.targetId}`,
      },
    });
  }

  // Check for duplicate incoming relationships
  const duplicateIncomingQuery = `
    MATCH (source)-[r]->(n:${entityLabel} { id: $entityId })
    WITH type(r) AS relType, source.id AS sourceId, collect(r) AS rels
    WHERE size(rels) > 1
    RETURN relType, sourceId, size(rels) AS count
  `;
  const incomingDuplicates = await db.executeQuery(duplicateIncomingQuery, { entityId });
  for (const dup of incomingDuplicates) {
    const record = dup as any;
    issues.push({
      type: 'duplicate_relationship',
      severity: 'error',
      entityType,
      entityId,
      relationshipType: record.relType,
      targetEntityId: record.sourceId,
      message: `Duplicate ${record.relType} relationship from ${record.sourceId} (${record.count} duplicates)`,
      fixable: true,
      fixAction: {
        type: 'delete_duplicate_relationship',
        description: `Delete duplicate ${record.relType} relationships from ${record.sourceId}`,
      },
    });
  }

  return issues;
}

/**
 * Validate that all relationship targets exist
 */
async function validateInvalidRelationshipTargets(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const entityLabel = getEntityLabel(entityType);

  // Check outgoing relationships - verify target entities exist and have IDs
  const outgoingQuery = `
    MATCH (n:${entityLabel} { id: $entityId })-[r]->(target)
    WHERE target.id IS NULL OR NOT EXISTS((target))
    RETURN type(r) AS relType, target.id AS targetId
  `;
  const outgoingInvalid = await db.executeQuery(outgoingQuery, { entityId });
  for (const invalid of outgoingInvalid) {
    const record = invalid as any;
    issues.push({
      type: 'invalid_target',
      severity: 'error',
      entityType,
      entityId,
      relationshipType: record.relType,
      targetEntityId: record.targetId || 'unknown',
      message: `Relationship ${record.relType} points to entity without valid id`,
      fixable: false,
    });
  }

  // Check incoming relationships - verify source entities exist and have IDs
  const incomingQuery = `
    MATCH (source)-[r]->(n:${entityLabel} { id: $entityId })
    WHERE source.id IS NULL OR NOT EXISTS((source))
    RETURN type(r) AS relType, source.id AS sourceId
  `;
  const incomingInvalid = await db.executeQuery(incomingQuery, { entityId });
  for (const invalid of incomingInvalid) {
    const record = invalid as any;
    issues.push({
      type: 'invalid_target',
      severity: 'error',
      entityType,
      entityId,
      relationshipType: record.relType,
      targetEntityId: record.sourceId || 'unknown',
      message: `Relationship ${record.relType} from entity without valid id`,
      fixable: false,
    });
  }

  return issues;
}

/**
 * Validate redundant field mismatches
 * 
 * Checks:
 * - Jingle.fabricaId matches APPEARS_IN relationship
 * - Jingle.fabricaDate matches APPEARS_IN->Fabrica.date
 * - Jingle.cancionId matches VERSIONA relationship
 * - Cancion.autorIds matches AUTOR_DE relationships
 */
async function validateRedundantFieldMismatches(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const entityLabel = getEntityLabel(entityType);

  // Validate Jingle redundant properties
  if (entityType === 'jingles') {
    // Check fabricaId and fabricaDate
    const fabricaValidationQuery = `
      MATCH (j:Jingle { id: $entityId })
      OPTIONAL MATCH (j)-[:APPEARS_IN]->(f:Fabrica)
      WITH j, f, head(collect(f)) AS primaryFabrica
      WHERE j.fabricaId IS NOT NULL
        AND (primaryFabrica IS NULL OR primaryFabrica.id <> j.fabricaId OR primaryFabrica.date <> j.fabricaDate)
      RETURN j.fabricaId AS expectedFabricaId, primaryFabrica.id AS actualFabricaId,
             j.fabricaDate AS expectedFabricaDate, primaryFabrica.date AS actualFabricaDate
    `;
    const fabricaMismatches = await db.executeQuery(fabricaValidationQuery, { entityId });
    for (const mismatch of fabricaMismatches) {
      const record = mismatch as any;
      const errors: string[] = [];
      if (record.expectedFabricaId !== record.actualFabricaId) {
        errors.push(`fabricaId: expected ${record.expectedFabricaId}, actual ${record.actualFabricaId || 'none'}`);
      }
      if (record.expectedFabricaDate !== record.actualFabricaDate) {
        errors.push(`fabricaDate: expected ${record.expectedFabricaDate}, actual ${record.actualFabricaDate || 'none'}`);
      }
      issues.push({
        type: 'redundant_field_mismatch',
        severity: 'warning',
        entityType,
        entityId,
        relationshipType: 'APPEARS_IN',
        message: `Redundant property mismatch: ${errors.join('; ')}`,
        fixable: true,
        fixAction: {
          type: 'update_redundant_property',
          description: 'Update fabricaId and fabricaDate to match APPEARS_IN relationship',
        },
      });
    }

    // Check cancionId
    const cancionValidationQuery = `
      MATCH (j:Jingle { id: $entityId })
      OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
      WITH j, head(collect(c)) AS primaryCancion
      WHERE j.cancionId IS NOT NULL
        AND (primaryCancion IS NULL OR primaryCancion.id <> j.cancionId)
      RETURN j.cancionId AS expectedCancionId, primaryCancion.id AS actualCancionId
    `;
    const cancionMismatches = await db.executeQuery(cancionValidationQuery, { entityId });
    for (const mismatch of cancionMismatches) {
      const record = mismatch as any;
      issues.push({
        type: 'redundant_field_mismatch',
        severity: 'warning',
        entityType,
        entityId,
        relationshipType: 'VERSIONA',
        message: `cancionId mismatch: expected ${record.expectedCancionId}, actual ${record.actualCancionId || 'none'}`,
        fixable: true,
        fixAction: {
          type: 'update_redundant_property',
          description: 'Update cancionId to match VERSIONA relationship',
        },
      });
    }
  }

  // Validate Cancion redundant properties
  if (entityType === 'canciones') {
    const autorValidationQuery = `
      MATCH (c:Cancion { id: $entityId })
      WHERE c.autorIds IS NOT NULL
      OPTIONAL MATCH (a:Artista)-[:AUTOR_DE]->(c)
      WITH c, collect(a.id) AS actualAutorIds
      WHERE c.autorIds <> actualAutorIds
      RETURN c.autorIds AS expectedAutorIds, actualAutorIds
    `;
    const autorMismatches = await db.executeQuery(autorValidationQuery, { entityId });
    for (const mismatch of autorMismatches) {
      const record = mismatch as any;
      issues.push({
        type: 'redundant_field_mismatch',
        severity: 'warning',
        entityType,
        entityId,
        relationshipType: 'AUTOR_DE',
        message: `autorIds mismatch: expected ${JSON.stringify(record.expectedAutorIds)}, actual ${JSON.stringify(record.actualAutorIds)}`,
        fixable: true,
        fixAction: {
          type: 'update_redundant_property',
          description: 'Update autorIds to match AUTOR_DE relationships',
        },
      });
    }
  }

  return issues;
}

/**
 * Fix a validation issue (if fixable)
 */
export async function fixValidationIssue(
  db: Neo4jClient,
  issue: ValidationIssue
): Promise<void> {
  if (!issue.fixable || !issue.fixAction) {
    throw new Error(`Issue is not fixable: ${issue.message}`);
  }

  if (issue.fixAction.type === 'update_redundant_property') {
    await fixRedundantPropertyMismatch(db, issue);
  } else if (issue.fixAction.type === 'delete_duplicate_relationship') {
    await fixDuplicateRelationship(db, issue);
  } else {
    throw new Error(`Unknown fix action type: ${issue.fixAction.type}`);
  }
}

/**
 * Fix redundant property mismatch
 */
async function fixRedundantPropertyMismatch(
  db: Neo4jClient,
  issue: ValidationIssue
): Promise<void> {
  if (issue.entityType === 'jingles') {
    if (issue.relationshipType === 'APPEARS_IN') {
      // Update fabricaId and fabricaDate
      const query = `
        MATCH (j:Jingle { id: $entityId })-[:APPEARS_IN]->(f:Fabrica)
        WITH j, f
        ORDER BY f.date ASC
        WITH j, head(collect(f)) AS primaryFabrica
        SET j.fabricaId = primaryFabrica.id,
            j.fabricaDate = primaryFabrica.date
      `;
      await db.executeQuery(query, { entityId: issue.entityId }, undefined, true);
    } else if (issue.relationshipType === 'VERSIONA') {
      // Update cancionId
      const query = `
        MATCH (j:Jingle { id: $entityId })-[:VERSIONA]->(c:Cancion)
        WITH j, head(collect(c)) AS primaryCancion
        SET j.cancionId = primaryCancion.id
      `;
      await db.executeQuery(query, { entityId: issue.entityId }, undefined, true);
    }
  } else if (issue.entityType === 'canciones' && issue.relationshipType === 'AUTOR_DE') {
    // Update autorIds
    const query = `
      MATCH (a:Artista)-[:AUTOR_DE]->(c:Cancion { id: $entityId })
      WITH c, collect(a.id) AS autorIds
      SET c.autorIds = autorIds
    `;
    await db.executeQuery(query, { entityId: issue.entityId }, undefined, true);
  }
}

/**
 * Fix duplicate relationship by deleting all but one
 */
async function fixDuplicateRelationship(
  db: Neo4jClient,
  issue: ValidationIssue
): Promise<void> {
  if (!issue.relationshipType || !issue.targetEntityId) {
    throw new Error('Missing relationship information for duplicate fix');
  }

  const neo4jRelType = getNeo4jRelationshipType(issue.relationshipType);
  if (!neo4jRelType) {
    throw new Error(`Unknown relationship type: ${issue.relationshipType}`);
  }

  // Delete all but the first relationship
  const query = `
    MATCH (start { id: $startId })-[r:${neo4jRelType}]->(end { id: $endId })
    WITH r
    ORDER BY r.createdAt ASC
    WITH collect(r) AS rels
    FOREACH (r IN tail(rels) | DELETE r)
  `;
  await db.executeQuery(query, { startId: issue.entityId, endId: issue.targetEntityId }, undefined, true);
}

/**
 * Validate that Artista has at least one of name or stageName
 */
export function validateArtistaNameOrStageName(artista: { name?: string; stageName?: string }): ValidationIssue | null {
  const hasName = artista.name && artista.name.trim().length > 0;
  const hasStageName = artista.stageName && artista.stageName.trim().length > 0;
  
  if (!hasName && !hasStageName) {
    return {
      type: 'invalid_target',
      severity: 'error',
      entityType: 'artistas',
      entityId: 'validation',
      message: "Artista must have at least one of 'name' or 'stageName'",
      fixable: false,
    };
  }
  
  return null;
}

/**
 * Helper: Get Neo4j entity label from entity type
 */
function getEntityLabel(entityType: string): string | null {
  const labelMap: Record<string, string> = {
    usuarios: 'Usuario',
    artistas: 'Artista',
    canciones: 'Cancion',
    fabricas: 'Fabrica',
    tematicas: 'Tematica',
    jingles: 'Jingle',
  };
  return labelMap[entityType] || null;
}

/**
 * Helper: Get Neo4j relationship type from relationship type string
 */
function getNeo4jRelationshipType(relType: string): string | null {
  const relTypeMap: Record<string, string> = {
    autor_de: 'AUTOR_DE',
    jinglero_de: 'JINGLERO_DE',
    appears_in: 'APPEARS_IN',
    tagged_with: 'TAGGED_WITH',
    versiona: 'VERSIONA',
    reacciona_a: 'REACCIONA_A',
    soy_yo: 'SOY_YO',
  };
  return relTypeMap[relType.toLowerCase()] || relType;
}

