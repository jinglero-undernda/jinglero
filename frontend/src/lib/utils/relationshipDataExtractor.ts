/**
 * Relationship Data Extraction Utilities
 * 
 * Centralized utility functions for extracting relationshipData from entity objects
 * to pass to EntityCard components for enhanced display.
 * 
 * Handles extraction of _metadata from entity objects with graceful degradation
 * when metadata is not available.
 */

import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
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
    autores?: Artista[];
    jingleros?: Artista[];
  };
};

/**
 * Extracts relationshipData from an entity object for use with EntityCard component.
 * 
 * This function extracts _metadata from entity objects and transforms it into
 * the relationshipData format expected by EntityCard.
 * 
 * @param entity - The entity object (may include _metadata)
 * @param entityType - The type of entity
 * @returns relationshipData object or undefined if no metadata available
 * 
 * @example
 * ```typescript
 * const relationshipData = extractRelationshipData(artista, 'artista');
 * <EntityCard entity={artista} entityType="artista" relationshipData={relationshipData} />
 * ```
 */
export function extractRelationshipData(
  entity: Entity,
  entityType: EntityType
): Record<string, unknown> | undefined {
  const entityWithMetadata = entity as EntityWithMetadata;
  
  // If no _metadata, return undefined (graceful degradation)
  if (!entityWithMetadata._metadata) {
    return undefined;
  }

  const metadata = entityWithMetadata._metadata;
  const data: Record<string, unknown> = {};

  switch (entityType) {
    case 'artista': {
      // Extract autorCount and jingleroCount for Artista
      if (metadata.autorCount !== undefined) {
        data.autorCount = metadata.autorCount;
      }
      if (metadata.jingleroCount !== undefined) {
        data.jingleroCount = metadata.jingleroCount;
      }
      break;
    }

    case 'cancion': {
      // Extract jingleCount and autores for Cancion
      if (metadata.jingleCount !== undefined) {
        data.jingleCount = metadata.jingleCount;
      }
      if (metadata.autores && Array.isArray(metadata.autores) && metadata.autores.length > 0) {
        data.autores = metadata.autores;
      }
      break;
    }

    case 'jingle': {
      // Extract fabrica, cancion, autores, and jingleros for Jingle
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

  // Return undefined if no data extracted (cleaner than empty object)
  return Object.keys(data).length > 0 ? data : undefined;
}

