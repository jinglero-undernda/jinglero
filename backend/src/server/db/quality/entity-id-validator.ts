/**
 * Entity ID Validation Utility
 * 
 * Ports entity ID format detection logic from frontend to backend for use in audit scripts.
 * Supports both old format (PREFIX-UUID) and new format (9-char with prefix).
 * 
 * Reference: frontend/src/lib/utils/entityTypeUtils.ts
 */

/**
 * Entity type as detected from ID (singular, lowercase)
 */
export type EntityType = 'jingle' | 'cancion' | 'artista' | 'tematica' | 'usuario' | 'fabrica';

/**
 * Entity ID prefix to entity type mapping (OLD FORMAT)
 * Used to detect entity type from ID with old format prefixes
 */
const ID_PREFIX_MAP: Record<string, EntityType> = {
  'JIN-': 'jingle',
  'CAN-': 'cancion',
  'ART-': 'artista',
  'TEM-': 'tematica',
} as const;

/**
 * Single-letter prefix to entity type mapping (NEW FORMAT)
 * New format: 9-character IDs with single-letter prefix (a, j, c, t, u) + 8 alphanumeric
 * Fabrica IDs are 11 characters (no prefix)
 */
const NEW_ID_PREFIX_MAP: Record<string, EntityType> = {
  j: 'jingle',
  c: 'cancion',
  a: 'artista',
  t: 'tematica',
  u: 'usuario',
} as const;

/**
 * Validation result for an entity ID
 */
export interface EntityIdValidationResult {
  /** Whether the ID format is valid */
  valid: boolean;
  /** Detected entity type, or null if invalid/unknown */
  type: EntityType | null;
  /** Error message if validation failed */
  error?: string;
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
  if (entityId.length === 11) {
    return 'fabrica';
  }
  
  // Unknown format
  return null;
}

/**
 * Validates an entity ID format and returns detailed validation result
 * 
 * @param entityId - The entity ID to validate
 * @returns Validation result with type detection and error information
 */
export function validateEntityId(entityId: string): EntityIdValidationResult {
  if (!entityId) {
    return {
      valid: false,
      type: null,
      error: 'Entity ID is empty or undefined',
    };
  }
  
  // Check for old format prefixes
  for (const [prefix, type] of Object.entries(ID_PREFIX_MAP)) {
    if (entityId.startsWith(prefix)) {
      return {
        valid: true,
        type,
        error: undefined,
      };
    }
  }
  
  // Check for new format: 9-character IDs with single-letter prefix
  if (entityId.length === 9) {
    const firstChar = entityId[0];
    const entityType = NEW_ID_PREFIX_MAP[firstChar];
    if (entityType) {
      // Validate that remaining 8 characters are alphanumeric (base36)
      const remainingChars = entityId.slice(1);
      const isValidBase36 = /^[0-9a-z]+$/i.test(remainingChars);
      
      if (isValidBase36) {
        return {
          valid: true,
          type: entityType,
          error: undefined,
        };
      } else {
        return {
          valid: false,
          type: null,
          error: `Invalid format: 9-character ID must have 8 alphanumeric characters after prefix '${firstChar}'`,
        };
      }
    } else {
      return {
        valid: false,
        type: null,
        error: `Unknown prefix '${firstChar}' for 9-character ID. Expected: a, c, j, t, or u`,
      };
    }
  }
  
  // Check for Fabrica format: 11 characters
  if (entityId.length === 11) {
    return {
      valid: true,
      type: 'fabrica',
      error: undefined,
    };
  }
  
  // Invalid format
  return {
    valid: false,
    type: null,
    error: `Invalid ID length: ${entityId.length} characters. Expected: 9 (with prefix a/c/j/t/u) or 11 (Fabrica)`,
  };
}

/**
 * Get all valid entity type prefixes (for documentation/validation)
 */
export function getValidPrefixes(): string[] {
  return Object.keys(NEW_ID_PREFIX_MAP);
}

/**
 * Check if an ID matches the expected format for a specific entity type
 */
export function matchesEntityType(entityId: string, expectedType: EntityType): boolean {
  const detectedType = getEntityTypeFromId(entityId);
  return detectedType === expectedType;
}

