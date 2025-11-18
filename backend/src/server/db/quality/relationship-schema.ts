/**
 * Canonical Relationship Schema Definition
 * 
 * This module defines the correct direction for all relationship types in the Neo4j database.
 * It centralizes the schema definition that was previously hardcoded in various places.
 * 
 * Reference: backend/src/server/db/schema/schema.ts (lines 189-259)
 */

/**
 * Entity type keys as used in frontend/API (plural, lowercase)
 */
export type EntityTypeKey = 'jingles' | 'canciones' | 'artistas' | 'tematicas' | 'usuarios' | 'fabricas';

/**
 * Neo4j node labels (singular, PascalCase)
 */
export type Neo4jLabel = 'Jingle' | 'Cancion' | 'Artista' | 'Tematica' | 'Usuario' | 'Fabrica';

/**
 * Relationship type keys as used in frontend/API (snake_case, lowercase)
 */
export type RelationshipTypeKey = 
  | 'appears_in'
  | 'jinglero_de'
  | 'autor_de'
  | 'versiona'
  | 'tagged_with'
  | 'soy_yo'
  | 'reacciona_a';

/**
 * Neo4j relationship types (SCREAMING_SNAKE_CASE)
 */
export type Neo4jRelationshipType = 
  | 'APPEARS_IN'
  | 'JINGLERO_DE'
  | 'AUTOR_DE'
  | 'VERSIONA'
  | 'TAGGED_WITH'
  | 'SOY_YO'
  | 'REACCIONA_A';

/**
 * Relationship direction definition
 */
export interface RelationshipDirection {
  /** Start node entity type (frontend key) */
  start: EntityTypeKey;
  /** End node entity type (frontend key) */
  end: EntityTypeKey;
  /** Start node Neo4j label */
  startLabel: Neo4jLabel;
  /** End node Neo4j label */
  endLabel: Neo4jLabel;
}

/**
 * Canonical relationship schema mapping
 * Defines the correct direction for all relationship types
 */
export const RELATIONSHIP_SCHEMA: Record<RelationshipTypeKey, RelationshipDirection> = {
  appears_in: {
    start: 'jingles',
    end: 'fabricas',
    startLabel: 'Jingle',
    endLabel: 'Fabrica',
  },
  jinglero_de: {
    start: 'artistas',
    end: 'jingles',
    startLabel: 'Artista',
    endLabel: 'Jingle',
  },
  autor_de: {
    start: 'artistas',
    end: 'canciones',
    startLabel: 'Artista',
    endLabel: 'Cancion',
  },
  versiona: {
    start: 'jingles',
    end: 'canciones',
    startLabel: 'Jingle',
    endLabel: 'Cancion',
  },
  tagged_with: {
    start: 'jingles',
    end: 'tematicas',
    startLabel: 'Jingle',
    endLabel: 'Tematica',
  },
  soy_yo: {
    start: 'usuarios',
    end: 'artistas',
    startLabel: 'Usuario',
    endLabel: 'Artista',
  },
  reacciona_a: {
    start: 'usuarios',
    end: 'jingles',
    startLabel: 'Usuario',
    endLabel: 'Jingle',
  },
};

/**
 * Mapping from frontend relationship keys to Neo4j relationship types
 */
export const RELATIONSHIP_TYPE_MAP: Record<RelationshipTypeKey, Neo4jRelationshipType> = {
  appears_in: 'APPEARS_IN',
  jinglero_de: 'JINGLERO_DE',
  autor_de: 'AUTOR_DE',
  versiona: 'VERSIONA',
  tagged_with: 'TAGGED_WITH',
  soy_yo: 'SOY_YO',
  reacciona_a: 'REACCIONA_A',
};

/**
 * Mapping from Neo4j relationship types to frontend keys
 */
export const NEO4J_TO_KEY_MAP: Record<Neo4jRelationshipType, RelationshipTypeKey> = {
  APPEARS_IN: 'appears_in',
  JINGLERO_DE: 'jinglero_de',
  AUTOR_DE: 'autor_de',
  VERSIONA: 'versiona',
  TAGGED_WITH: 'tagged_with',
  SOY_YO: 'soy_yo',
  REACCIONA_A: 'reacciona_a',
};

/**
 * Mapping from entity type keys to Neo4j labels
 */
export const ENTITY_LABEL_MAP: Record<EntityTypeKey, Neo4jLabel> = {
  jingles: 'Jingle',
  canciones: 'Cancion',
  artistas: 'Artista',
  tematicas: 'Tematica',
  usuarios: 'Usuario',
  fabricas: 'Fabrica',
};

/**
 * Mapping from Neo4j labels to entity type keys
 */
export const LABEL_TO_ENTITY_MAP: Record<Neo4jLabel, EntityTypeKey> = {
  Jingle: 'jingles',
  Cancion: 'canciones',
  Artista: 'artistas',
  Tematica: 'tematicas',
  Usuario: 'usuarios',
  Fabrica: 'fabricas',
};

/**
 * Get the Neo4j relationship type for a frontend relationship key
 */
export function getNeo4jRelationshipType(key: RelationshipTypeKey): Neo4jRelationshipType {
  return RELATIONSHIP_TYPE_MAP[key];
}

/**
 * Get the frontend relationship key for a Neo4j relationship type
 */
export function getRelationshipTypeKey(neo4jType: Neo4jRelationshipType): RelationshipTypeKey {
  return NEO4J_TO_KEY_MAP[neo4jType];
}

/**
 * Get the expected start and end entity types for a relationship type
 */
export function getRelationshipDirection(
  relationshipType: RelationshipTypeKey | Neo4jRelationshipType
): RelationshipDirection {
  const key = relationshipType in RELATIONSHIP_TYPE_MAP 
    ? relationshipType as RelationshipTypeKey
    : getRelationshipTypeKey(relationshipType as Neo4jRelationshipType);
  
  return RELATIONSHIP_SCHEMA[key];
}

/**
 * Get all relationship types to audit
 */
export function getAllRelationshipTypes(): RelationshipTypeKey[] {
  return Object.keys(RELATIONSHIP_SCHEMA) as RelationshipTypeKey[];
}

/**
 * Validate if a relationship direction is correct
 * 
 * @param relationshipType - The relationship type (frontend key or Neo4j type)
 * @param startEntityType - The entity type of the start node (from ID detection)
 * @param endEntityType - The entity type of the end node (from ID detection)
 * @returns true if direction is correct, false otherwise
 */
export function validateRelationshipDirection(
  relationshipType: RelationshipTypeKey | Neo4jRelationshipType,
  startEntityType: EntityTypeKey | string,
  endEntityType: EntityTypeKey | string
): boolean {
  const direction = getRelationshipDirection(relationshipType);
  
  // Normalize entity types (handle both 'jingle' and 'jingles' formats)
  const normalizedStart = normalizeEntityType(startEntityType);
  const normalizedEnd = normalizeEntityType(endEntityType);
  
  if (!normalizedStart || !normalizedEnd) {
    return false;
  }
  
  return direction.start === normalizedStart && direction.end === normalizedEnd;
}

/**
 * Normalize entity type string to EntityTypeKey format
 * Handles both singular ('jingle') and plural ('jingles') formats
 */
function normalizeEntityType(entityType: string): EntityTypeKey | null {
  // Handle plural forms
  if (entityType === 'jingles' || entityType === 'jingle') return 'jingles';
  if (entityType === 'canciones' || entityType === 'cancion') return 'canciones';
  if (entityType === 'artistas' || entityType === 'artista') return 'artistas';
  if (entityType === 'tematicas' || entityType === 'tematica') return 'tematicas';
  if (entityType === 'usuarios' || entityType === 'usuario') return 'usuarios';
  if (entityType === 'fabricas' || entityType === 'fabrica') return 'fabricas';
  
  return null;
}

/**
 * Get Neo4j label for an entity type key
 */
export function getNeo4jLabel(entityType: EntityTypeKey): Neo4jLabel {
  return ENTITY_LABEL_MAP[entityType];
}

/**
 * Get entity type key for a Neo4j label
 */
export function getEntityTypeKey(label: Neo4jLabel): EntityTypeKey {
  return LABEL_TO_ENTITY_MAP[label];
}

