import type { EntityType } from "../../components/common/EntityCard";
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from "../../types";
import type { RelatedEntity } from "./entitySorters";

/**
 * Entity type abbreviation to full type mapping
 * Maps route parameters (single letter) to full entity type names
 */
const ENTITY_TYPE_MAP: Record<string, EntityType> = {
  f: "fabrica",
  j: "jingle",
  c: "cancion",
  a: "artista",
  t: "tematica",
} as const;

/**
 * Entity ID prefix to entity type mapping (OLD FORMAT)
 * Used to detect entity type from ID with old format prefixes
 */
const ID_PREFIX_MAP: Record<string, EntityType> = {
  "JIN-": "jingle",
  "CAN-": "cancion",
  "ART-": "artista",
  "TEM-": "tematica",
} as const;

/**
 * Single-letter prefix to entity type mapping (NEW FORMAT)
 * New format: 9-character IDs with single-letter prefix (a, j, c, t, u) + 8 alphanumeric
 * Fabrica IDs are 11 characters (no prefix)
 */
const NEW_ID_PREFIX_MAP: Record<string, EntityType> = {
  j: "jingle",
  c: "cancion",
  a: "artista",
  t: "tematica",
  // Note: 'u' prefix may exist but is not currently mapped to a known entity type
} as const;

/**
 * Normalizes a raw entity type string (from route parameter) to a full EntityType
 *
 * @param rawType - The raw entity type string from route parameter (e.g., 'f', 'j', 'c')
 * @returns The normalized EntityType or null if the raw type is invalid/undefined
 *
 * @example
 * normalizeEntityType('f') // Returns 'fabrica'
 * normalizeEntityType('j') // Returns 'jingle'
 * normalizeEntityType('invalid') // Returns null
 * normalizeEntityType(undefined) // Returns null
 */
export function normalizeEntityType(
  rawType: string | undefined
): EntityType | null {
  if (!rawType) {
    return null;
  }

  return ENTITY_TYPE_MAP[rawType] || null;
}

/**
 * Type guard to check if an entity is a Fabrica
 *
 * @param entity - Entity to check
 * @returns True if entity is a Fabrica, false otherwise
 *
 * @example
 * if (isFabrica(entity)) {
 *   // TypeScript knows entity is Fabrica here
 *   console.log(entity.date);
 * }
 */
export function isFabrica(entity: RelatedEntity): entity is Fabrica {
  return (
    "date" in entity &&
    "status" in entity &&
    typeof entity.date === "string" &&
    typeof (entity as Fabrica).status === "string"
  );
}

/**
 * Type guard to check if an entity is a Jingle
 *
 * @param entity - Entity to check
 * @returns True if entity is a Jingle, false otherwise
 *
 * @example
 * if (isJingle(entity)) {
 *   // TypeScript knows entity is Jingle here
 *   console.log(entity.timestamp);
 * }
 */
export function isJingle(entity: RelatedEntity): entity is Jingle {
  return (
    "timestamp" in entity &&
    "isJinglazo" in entity &&
    typeof entity.timestamp === "string" &&
    typeof (entity as Jingle).isJinglazo === "boolean"
  );
}

/**
 * Type guard to check if an entity is an Artista
 *
 * @param entity - Entity to check
 * @returns True if entity is an Artista, false otherwise
 *
 * @example
 * if (isArtista(entity)) {
 *   // TypeScript knows entity is Artista here
 *   console.log(entity.stageName);
 * }
 */
export function isArtista(entity: RelatedEntity): entity is Artista {
  return "isArg" in entity && typeof (entity as Artista).isArg === "boolean";
}

/**
 * Type guard to check if an entity is a Tematica
 *
 * @param entity - Entity to check
 * @returns True if entity is a Tematica, false otherwise
 *
 * @example
 * if (isTematica(entity)) {
 *   // TypeScript knows entity is Tematica here
 *   console.log(entity.category);
 * }
 */
export function isTematica(entity: RelatedEntity): entity is Tematica {
  return (
    "category" in entity && typeof (entity as Tematica).category === "string"
  );
}

/**
 * Type guard to check if an entity is a Cancion
 *
 * @param entity - Entity to check
 * @returns True if entity is a Cancion, false otherwise
 *
 * @example
 * if (isCancion(entity)) {
 *   // TypeScript knows entity is Cancion here
 *   console.log(entity.album);
 * }
 */
export function isCancion(entity: RelatedEntity): entity is Cancion {
  // Cancion has required title, but other types can have optional title
  // Best discriminator: presence of album/year (unique to Cancion)
  // OR title is required AND none of the other type markers exist
  return (
    "album" in entity ||
    "year" in entity ||
    ("title" in entity &&
      typeof (entity as Cancion).title === "string" &&
      !isFabrica(entity) &&
      !isJingle(entity) &&
      !isArtista(entity) &&
      !isTematica(entity))
  );
}

/**
 * Detects entity type from ID prefix
 * 
 * Supports both old format (JIN-xxx, CAN-xxx, etc.) and new format:
 * - New format: 9-character IDs with single-letter prefix (a, j, c, t, u) + 8 alphanumeric
 * - Fabrica: 11-character IDs (no prefix)
 * 
 * @param entityId - The entity ID to check
 * @returns The detected EntityType or null if no match
 * 
 * @example
 * getEntityTypeFromId('JIN-123') // Returns 'jingle' (old format)
 * getEntityTypeFromId('j355hbbnu') // Returns 'jingle' (new format, 9 chars, starts with 'j')
 * getEntityTypeFromId('c12345678') // Returns 'cancion' (new format, 9 chars, starts with 'c')
 * getEntityTypeFromId('DLe3hojAro0') // Returns 'fabrica' (11 chars, no prefix)
 */
export function getEntityTypeFromId(entityId: string): EntityType | null {
  if (!entityId) {
    return null;
  }
  
  // First, check for old format prefixes (backward compatibility)
  for (const [prefix, type] of Object.entries(ID_PREFIX_MAP)) {
    if (entityId.startsWith(prefix)) {
      return type;
    }
  }
  
  // Check for new format: 9-character IDs with single-letter prefix
  if (entityId.length === 9) {
    const firstChar = entityId[0];
    const entityType = NEW_ID_PREFIX_MAP[firstChar];
    if (entityType) {
      return entityType;
    }
    // If first char is not in our map but ID is 9 chars, it might be an unknown type
    // Fall through to Fabrica assumption
  }
  
  // If ID is 11 characters (or doesn't match 9-char format), assume it's a Fabrica
  // This covers both old YouTube video IDs and new 11-digit Fabrica IDs
  return "fabrica";
}

/**
 * Get the URL abbreviation for an entity type
 * 
 * @param entityType - The full entity type
 * @returns The URL abbreviation (single letter) or null if invalid
 * 
 * @example
 * getEntityTypeAbbreviation('jingle') // Returns 'j'
 * getEntityTypeAbbreviation('fabrica') // Returns 'f'
 */
export function getEntityTypeAbbreviation(entityType: EntityType): string | null {
  const reverseMap: Record<EntityType, string> = {
    fabrica: 'f',
    jingle: 'j',
    cancion: 'c',
    artista: 'a',
    tematica: 't',
  };
  
  return reverseMap[entityType] || null;
}

