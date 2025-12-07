/**
 * Relationship Data Extraction Utilities
 * 
 * Centralized utility functions for extracting relationshipData from entity objects
 * to pass to EntityCard components for enhanced display.
 * 
 * Handles extraction from multiple data sources with graceful degradation:
 * - Pre-fetched data (highest priority)
 * - _metadata (standard API format)
 * - Flat structure fallback (transitional, for APIs that return data directly on entity)
 * - Relationship properties (from relationship itself, not entity)
 * - Parent context overrides (for related entities)
 */

import type { Artista, Cancion, Fabrica } from '../../types';
import type { EntityType, Entity } from './entityDisplay';

/**
 * Entity with optional _metadata field
 */
type EntityWithMetadata = Entity & {
  _metadata?: {
    // For Artista
    autorCount?: number;
    jingleroCount?: number;
    // For Cancion
    jingleCount?: number;
    autores?: Artista[];
    // For Jingle
    fabrica?: Fabrica;
    cancion?: Cancion;
    jingleros?: Artista[];
    // Note: autores can appear for both Cancion and Jingle in _metadata
  };
};

/**
 * Entity with flat structure (transitional format from some APIs)
 * Used as fallback when _metadata is not available
 */
type EntityWithFlatStructure = Entity & {
  // For Jingle - relationship data directly on entity
  fabrica?: Fabrica | null;
  cancion?: Cancion | null;
  autores?: Artista[] | null;
  jingleros?: Artista[] | null;
  // For Cancion
  jingleCount?: number;
  // For Artista
  autorCount?: number;
  jingleroCount?: number;
};

/**
 * Options for relationship data extraction
 */
export interface ExtractRelationshipDataOptions {
  /** Pre-fetched relationship data (highest priority) */
  preFetchedData?: Record<string, unknown>;
  /** Parent entity context (for related entities) */
  parentEntity?: Entity;
  /** Type of parent entity */
  parentEntityType?: EntityType;
  /** Relationship properties (e.g., timestamp from APPEARS_IN) */
  relationshipProperties?: Record<string, unknown>;
}

/**
 * Field override rules: fields that are overridden by parent context
 */
const OVERRIDE_FIELDS: Record<string, string[]> = {
  jingle: ['fabrica', 'cancion', 'autores'],
};

/**
 * Extracts relationshipData from an entity object for use with EntityCard component.
 * 
 * Follows unified priority order:
 * 1. Pre-fetched data (if provided)
 * 2. _metadata (standard API format)
 * 3. Flat structure fallback (transitional, if _metadata missing)
 * 4. Relationship properties (if provided)
 * 5. Parent context (applies overrides for specific fields)
 * 
 * @param entity - The entity object (may include _metadata or flat structure)
 * @param entityType - The type of entity
 * @param options - Optional extraction parameters
 * @returns relationshipData object or undefined if no data available
 * 
 * @example
 * ```typescript
 * // Standalone entity
 * const relationshipData = extractRelationshipData(artista, 'artista');
 * 
 * // Related entity with parent context
 * const relationshipData = extractRelationshipData(jingle, 'jingle', {
 *   parentEntity: fabrica,
 *   parentEntityType: 'fabrica',
 *   relationshipProperties: { jingleTimestamp: 120 }
 * });
 * ```
 */
export function extractRelationshipData(
  entity: Entity,
  entityType: EntityType,
  options?: ExtractRelationshipDataOptions
): Record<string, unknown> | undefined {
  const { preFetchedData, parentEntity, parentEntityType, relationshipProperties } = options || {};
  
  // Step 1: Start with pre-fetched data (highest priority)
  const data: Record<string, unknown> = preFetchedData ? { ...preFetchedData } : {};

  // Step 2: Extract from _metadata (standard format)
  const entityWithMetadata = entity as EntityWithMetadata;
  if (entityWithMetadata._metadata) {
    const metadata = entityWithMetadata._metadata;
    
    switch (entityType) {
      case 'artista': {
        if (metadata.autorCount !== undefined) {
          data.autorCount = metadata.autorCount;
        }
        if (metadata.jingleroCount !== undefined) {
          data.jingleroCount = metadata.jingleroCount;
        }
        break;
      }

      case 'cancion': {
        if (metadata.jingleCount !== undefined) {
          data.jingleCount = metadata.jingleCount;
        }
        if (metadata.autores && Array.isArray(metadata.autores) && metadata.autores.length > 0) {
          data.autores = metadata.autores;
        }
        break;
      }

      case 'jingle': {
        if (metadata.fabrica) {
          data.fabrica = metadata.fabrica;
        }
        if (metadata.cancion) {
          data.cancion = metadata.cancion;
        }
        if (metadata.autores && Array.isArray(metadata.autores) && metadata.autores.length > 0) {
          data.autores = metadata.autores;
        }
        if (metadata.jingleros && Array.isArray(metadata.jingleros) && metadata.jingleros.length > 0) {
          data.jingleros = metadata.jingleros;
        }
        break;
      }

      case 'fabrica':
      case 'tematica':
        // No relationship data needed for these types
        break;
    }
  } else {
    // Step 3: Fallback to flat structure (transitional format)
    const entityWithFlat = entity as EntityWithFlatStructure;
    
    switch (entityType) {
      case 'artista': {
        if (entityWithFlat.autorCount !== undefined) {
          data.autorCount = entityWithFlat.autorCount;
        }
        if (entityWithFlat.jingleroCount !== undefined) {
          data.jingleroCount = entityWithFlat.jingleroCount;
        }
        break;
      }

      case 'cancion': {
        if (entityWithFlat.jingleCount !== undefined) {
          data.jingleCount = entityWithFlat.jingleCount;
        }
        // Note: autores in flat structure would be in _metadata, not directly on entity
        break;
      }

      case 'jingle': {
        // Extract from flat structure (e.g., jingle.fabrica, jingle.cancion)
        if (entityWithFlat.fabrica) {
          data.fabrica = entityWithFlat.fabrica;
        }
        if (entityWithFlat.cancion) {
          data.cancion = entityWithFlat.cancion;
        }
        if (entityWithFlat.autores && Array.isArray(entityWithFlat.autores) && entityWithFlat.autores.length > 0) {
          data.autores = entityWithFlat.autores;
        }
        if (entityWithFlat.jingleros && Array.isArray(entityWithFlat.jingleros) && entityWithFlat.jingleros.length > 0) {
          data.jingleros = entityWithFlat.jingleros;
        }
        break;
      }

      case 'fabrica':
      case 'tematica':
        // No relationship data needed for these types
        break;
    }
  }

  // Step 4: Add relationship properties (from relationship itself, not entity)
  if (relationshipProperties) {
    Object.assign(data, relationshipProperties);
  }

  // Step 5: Apply parent context overrides (if parent provided)
  if (parentEntity && parentEntityType) {
    const overrideFields = OVERRIDE_FIELDS[entityType] || [];
    
    if (entityType === 'jingle') {
      // Apply field-specific override rules
      if (parentEntityType === 'fabrica' && overrideFields.includes('fabrica')) {
        data.fabrica = parentEntity; // Override: parent always wins
      }
      
      if (parentEntityType === 'cancion' && overrideFields.includes('cancion')) {
        data.cancion = parentEntity; // Override: parent always wins
        
        // Also override autores from parent Cancion
        if (overrideFields.includes('autores')) {
          const parentCancion = parentEntity as Cancion;
          const parentWithMetadata = parentCancion as EntityWithMetadata;
          if (parentWithMetadata._metadata?.autores && Array.isArray(parentWithMetadata._metadata.autores) && parentWithMetadata._metadata.autores.length > 0) {
            data.autores = parentWithMetadata._metadata.autores;
          }
        }
      }
    }
  }

  // Return undefined if no data extracted (cleaner than empty object)
  return Object.keys(data).length > 0 ? data : undefined;
}

