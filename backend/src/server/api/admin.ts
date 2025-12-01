import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID, randomBytes } from 'crypto';
import { Neo4jClient } from '../db';
import { 
  getSchemaInfo, 
  addPropertyToEntity, 
  createRelationshipType, 
  createConstraint, 
  dropConstraint 
} from '../db/schema/setup';
import { asyncHandler, BadRequestError, NotFoundError, ConflictError, UnauthorizedError, InternalServerError } from './core';
import { optionalAdminAuth, requireAdminAuth } from '../middleware/auth';
import {
  validateEntity,
  validateRelationship,
  validateAllEntities,
  fixValidationIssue,
  validateArtistaNameOrStageName,
  ValidationResult,
  RelationshipValidationResult,
} from '../utils/validation';
import { validateEntityInput, validateEntityInputSafe } from '../utils/entityValidation';
import {
  validateRepeatsDirection,
  checkCircularReference,
  normalizeTransitiveChains,
  checkConcurrentInboundOutbound
} from '../db/validation/repeats-validation';
import { updateJingleAutoComment } from '../utils/jingleAutoComment';
import {
  getAllScripts,
  getScriptMetadata,
  executeScript,
  automateScript,
  isScriptAutomatable,
} from '../db/cleanup';
import { searchRecording, type MusicBrainzMatch } from '../utils/musicbrainz';

const router = Router();
const db = Neo4jClient.getInstance();

// Helper function to convert Neo4j dates to ISO strings
function convertNeo4jDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object') {
    // Handle Neo4j DateTime objects
    if (obj.year !== undefined && obj.month !== undefined && obj.day !== undefined) {
      const year = typeof obj.year === 'object' ? obj.year.low : obj.year;
      const month = typeof obj.month === 'object' ? obj.month.low : obj.month;
      const day = typeof obj.day === 'object' ? obj.day.low : obj.day;
      const hour = typeof obj.hour === 'object' ? (obj.hour?.low || 0) : (obj.hour || 0);
      const minute = typeof obj.minute === 'object' ? (obj.minute?.low || 0) : (obj.minute || 0);
      const second = typeof obj.second === 'object' ? (obj.second?.low || 0) : (obj.second || 0);
      
      return new Date(year, month - 1, day, hour, minute, second).toISOString();
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(convertNeo4jDates);
    }
    
    // Handle objects
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertNeo4jDates(value);
    }
    return converted;
  }
  
  return obj;
}

// Entity type mapping
const ENTITY_LABEL_MAP: Record<string, string> = {
  usuarios: 'Usuario',
  artistas: 'Artista',
  canciones: 'Cancion',
  fabricas: 'Fabrica',
  tematicas: 'Tematica',
  jingles: 'Jingle'
};

// Relationship type mapping
const RELATIONSHIP_TYPE_MAP: Record<string, string> = {
  'autor_de': 'AUTOR_DE',
  'jinglero_de': 'JINGLERO_DE',
  'appears_in': 'APPEARS_IN',
  'tagged_with': 'TAGGED_WITH',
  'versiona': 'VERSIONA',
  'reacciona_a': 'REACCIONA_A',
  'soy_yo': 'SOY_YO',
  'repeats': 'REPEATS'
};

// Entity type to prefix mapping
// Note: Fabricas use YouTube video ID (external), so they use temp IDs until committed
const ENTITY_PREFIX_MAP: Record<string, string> = {
  jingles: 'j',
  canciones: 'c',
  artistas: 'a',
  tematicas: 't',
  usuarios: 'u',
  // fabricas: No prefix (external YouTube ID)
};

/**
 * Generate a unique ID for an entity with collision detection
 * Format: {prefix}{8-chars} where chars are base36 alphanumeric (0-9, a-z)
 * Examples: a1b2c3d4, j5e6f7g8, c9f0a1b2
 * 
 * @param type - Entity type (e.g., 'jingles', 'artistas', 'canciones')
 * @returns Unique ID string
 */
async function generateId(type: string): Promise<string> {
  // For Fabricas: Use temp ID since ID comes from external source (YouTube video ID)
  if (type === 'fabricas') {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  const prefix = ENTITY_PREFIX_MAP[type];
  if (!prefix) {
    throw new Error(`Unknown entity type for ID generation: ${type}`);
  }
  
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new Error(`Unknown entity label for type: ${type}`);
  }
  
  // Generate ID with collision detection (max 10 retries)
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Generate 8 random characters using base36 (0-9, a-z)
    const randomBytesBuffer = randomBytes(6); // 6 bytes = 48 bits
    let randomNum = 0;
    for (let i = 0; i < 6; i++) {
      randomNum = randomNum * 256 + randomBytesBuffer[i];
    }
    
    // Convert to base36 and pad to 8 characters
    const chars = randomNum.toString(36).toLowerCase().padStart(8, '0').slice(0, 8);
    const id = `${prefix}${chars}`;
    
    // Check for collision
    const existsQuery = `MATCH (n:${label} { id: $id }) RETURN n LIMIT 1`;
    const existing = await db.executeQuery(existsQuery, { id });
    
    if (existing.length === 0) {
      return id; // No collision, return the ID
    }
    
    console.warn(`ID collision detected for ${id}, retrying... (attempt ${attempt + 1}/${maxRetries})`);
  }
  
  throw new Error(`Failed to generate unique ID for ${type} after ${maxRetries} attempts`);
}

/**
 * Synchronous version of generateId for temporary IDs (should be replaced with proper ID later)
 * Only use this for Fabricas which need temp IDs before YouTube ID is known
 */
function generateIdSync(type: string): string {
  if (type === 'fabricas') {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  const prefix = ENTITY_PREFIX_MAP[type];
  if (!prefix) {
    throw new Error(`Unknown entity type for ID generation: ${type}`);
  }
  
  // Generate 8 random characters using base36 (0-9, a-z)
  // Note: This doesn't check for collisions - use generateId() instead when possible
  const randomBytesBuffer = randomBytes(6);
  let randomNum = 0;
  for (let i = 0; i < 6; i++) {
    randomNum = randomNum * 256 + randomBytesBuffer[i];
  }
  
  const chars = randomNum.toString(36).toLowerCase().padStart(8, '0').slice(0, 8);
  return `${prefix}${chars}`;
}

// ============================================================================
// Authentication Routes (no auth required - these are used to authenticate)
// ============================================================================

/**
 * POST /api/admin/login
 * Authenticate admin user with password
 * Returns JWT token on success
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { password } = req.body;
  
  if (!password || typeof password !== 'string') {
    throw new BadRequestError('La contraseña es requerida');
  }
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw new UnauthorizedError('La autenticación de administrador no está configurada');
  }
  
  // Compare password (don't reveal if password is wrong vs not configured)
  if (password !== adminPassword) {
    throw new UnauthorizedError('Contraseña incorrecta');
  }
  
  // Generate JWT token
  const secret = process.env.JWT_SECRET || adminPassword;
  const token = jwt.sign(
    { admin: true },
    secret,
    { expiresIn: '7d' } // Token expires in 7 days
  );
  
  res.json({
    success: true,
    token,
    expiresIn: '7d'
  });
}));

/**
 * POST /api/admin/logout
 * Logout endpoint (client-side token removal)
 * For JWT, logout is handled client-side by removing the token
 * This endpoint exists for consistency and future session-based auth
 */
router.post('/logout', asyncHandler(async (req, res) => {
  // For JWT-based auth, logout is handled client-side
  // This endpoint is here for consistency and future session-based auth
  res.json({ success: true, message: 'Logged out successfully' });
}));

/**
 * GET /api/admin/status
 * Check current authentication status
 * Uses optionalAdminAuth to check token without requiring it
 */
router.get('/status', optionalAdminAuth, asyncHandler(async (req, res) => {
  const admin = (req as any).admin;
  
  res.json({
    authenticated: admin?.authenticated === true
  });
}));

// ============================================================================
// Protected Routes (require authentication)
// ============================================================================
// Apply authentication middleware to all routes below this point
router.use(requireAdminAuth);

/**
 * Convert timestamp string (HH:MM:SS) to seconds
 */
function timestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;
  const parts = timestamp.split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Automatically update order property for all APPEARS_IN relationships of a Fabrica
 * Order is calculated based on timestamp (HH:MM:SS converted to seconds)
 * Relationships are sorted by timestamp ascending, then assigned sequential order (1, 2, 3, ...)
 * 
 * @param fabricaId - The ID of the Fabrica whose APPEARS_IN relationships should be reordered
 */
async function updateAppearsInOrder(fabricaId: string): Promise<void> {
  try {
    // Validate Fabrica exists
    const fabricaExists = await db.executeQuery(
      `MATCH (f:Fabrica {id: $fabricaId}) RETURN f.id AS id LIMIT 1`,
      { fabricaId }
    );
    
    if (fabricaExists.length === 0) {
      console.warn(`Fabrica ${fabricaId} not found, skipping order update`);
      return; // Don't throw, just return early
    }
    
    // Query all APPEARS_IN relationships for this Fabrica
    // Timestamps are now stored as integers (seconds), so ORDER BY works correctly
    const query = `
      MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
      RETURN j.id AS jingleId, r.timestamp AS timestamp, id(r) AS relId
      ORDER BY r.timestamp ASC, id(r) ASC
    `;
    
    const relationships = await db.executeQuery<{ 
      jingleId: string; 
      timestamp: number; 
      relId: any;
    }>(query, { fabricaId });
    
    if (relationships.length === 0) {
      return; // No relationships to update
    }
    
    // Timestamps are already integers (seconds), so we can use them directly
    // Handle null/undefined timestamps gracefully
    const relationshipsWithOrder = relationships.map((rel, index) => {
      const seconds = typeof rel.timestamp === 'number' ? rel.timestamp : 0;
      
      return {
        jingleId: rel.jingleId,
        timestamp: seconds,
        order: index + 1, // Sequential order based on sorted position
      };
    });
    
    // Check for timestamp conflicts (same timestamp)
    const timestampMap = new Map<number, string[]>();
    relationshipsWithOrder.forEach(rel => {
      const existing = timestampMap.get(rel.timestamp) || [];
      existing.push(rel.jingleId);
      timestampMap.set(rel.timestamp, existing);
    });
    
    // Log warnings for timestamp conflicts
    timestampMap.forEach((jingleIds, seconds) => {
      if (jingleIds.length > 1) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        console.warn(
          `Warning: Timestamp conflict in Fabrica ${fabricaId} at ${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ` +
          `(${seconds}s) for Jingles: ${jingleIds.join(', ')}. Order assigned arbitrarily.`
        );
      }
    });
    
    // Update order for all relationships with individual error handling
    let successCount = 0;
    let errorCount = 0;
    
    for (const rel of relationshipsWithOrder) {
      try {
        const updateQuery = `
          MATCH (j:Jingle {id: $jingleId})-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
          SET r.order = $order
        `;
        await db.executeQuery(updateQuery, {
          jingleId: rel.jingleId,
          fabricaId,
          order: rel.order,
        }, undefined, true);
        successCount++;
      } catch (updateError) {
        errorCount++;
        console.error(
          `Failed to update order for Jingle ${rel.jingleId} in Fabrica ${fabricaId}:`,
          updateError
        );
        // Continue processing other relationships even if one fails
      }
    }
    
    if (successCount > 0) {
      console.log(`Updated order for ${successCount} APPEARS_IN relationships in Fabrica ${fabricaId}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
    } else if (errorCount > 0) {
      console.error(`Failed to update order for all ${errorCount} APPEARS_IN relationships in Fabrica ${fabricaId}`);
    }
  } catch (error) {
    console.error(`Error updating APPEARS_IN order for Fabrica ${fabricaId}:`, error);
    // Don't re-throw - let caller handle gracefully
  }
}

/**
 * Update redundant properties when relationships are created/updated/deleted
 * This maintains data consistency between relationships and denormalized properties
 * 
 * Handles:
 * - APPEARS_IN: Updates Jingle.fabricaId and Jingle.fabricaDate
 * - VERSIONA: Updates Jingle.cancionId  
 * - AUTOR_DE: Updates Cancion.autorIds array
 * 
 * All operations are transactional and handle edge cases like multiple relationships.
 */
async function updateRedundantPropertiesOnRelationshipChange(
  relType: string,
  startId: string,
  endId: string,
  operation: 'create' | 'delete'
): Promise<void> {
  try {
    // APPEARS_IN: Jingle -> Fabrica
    // Update Jingle.fabricaId and Jingle.fabricaDate
    if (relType === 'APPEARS_IN') {
      if (operation === 'create') {
        // Set fabricaId and fabricaDate to the newly connected Fabrica
        const updateQuery = `
          MATCH (j:Jingle {id: $startId}), (f:Fabrica {id: $endId})
          SET j.fabricaId = f.id,
              j.fabricaDate = f.date,
              j.updatedAt = datetime()
          RETURN j.id AS jingleId
        `;
        const result = await db.executeQuery(updateQuery, { startId, endId }, undefined, true);
        
        if (result.length > 0) {
          console.log(`Updated Jingle ${startId}: set fabricaId=${endId}`);
          // Update auto-comment after Fabrica relationship change
          await updateJingleAutoComment(db, startId);
        }
      } else if (operation === 'delete') {
        // Check if there are other APPEARS_IN relationships
        // If yes, update to use the first remaining Fabrica (by order/timestamp)
        // If no, clear fabricaId and fabricaDate
        const updateQuery = `
          MATCH (j:Jingle {id: $startId})
          OPTIONAL MATCH (j)-[r:APPEARS_IN]->(f:Fabrica)
          WITH j, f, r
          ORDER BY r.order ASC, r.timestamp ASC
          WITH j, collect(f)[0] AS firstFabrica
          SET j.fabricaId = CASE WHEN firstFabrica IS NOT NULL THEN firstFabrica.id ELSE null END,
              j.fabricaDate = CASE WHEN firstFabrica IS NOT NULL THEN firstFabrica.date ELSE null END,
              j.updatedAt = datetime()
          RETURN j.id AS jingleId, j.fabricaId AS newFabricaId
        `;
        const result = await db.executeQuery<{ jingleId: string; newFabricaId: string | null }>(
          updateQuery,
          { startId },
          undefined,
          true
        );
        
        if (result.length > 0) {
          const newFabricaId = result[0].newFabricaId;
          console.log(
            `Updated Jingle ${startId}: fabricaId=${newFabricaId || 'null'} after deleting APPEARS_IN relationship`
          );
          // Update auto-comment after Fabrica relationship change
          await updateJingleAutoComment(db, startId);
        }
      }
    }

    // VERSIONA: Jingle -> Cancion
    // Update Jingle.cancionId
    if (relType === 'VERSIONA') {
      if (operation === 'create') {
        // Set cancionId to the newly connected Cancion
        const updateQuery = `
          MATCH (j:Jingle {id: $startId}), (c:Cancion {id: $endId})
          SET j.cancionId = c.id,
              j.updatedAt = datetime()
          RETURN j.id AS jingleId
        `;
        const result = await db.executeQuery(updateQuery, { startId, endId }, undefined, true);
        
        if (result.length > 0) {
          console.log(`Updated Jingle ${startId}: set cancionId=${endId}`);
          // Update auto-comment after Cancion relationship change
          await updateJingleAutoComment(db, startId);
        }
      } else if (operation === 'delete') {
        // Check if there are other VERSIONA relationships
        // If yes, update to use the first remaining Cancion
        // If no, clear cancionId
        const updateQuery = `
          MATCH (j:Jingle {id: $startId})
          OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
          WITH j, collect(c)[0] AS firstCancion
          SET j.cancionId = CASE WHEN firstCancion IS NOT NULL THEN firstCancion.id ELSE null END,
              j.updatedAt = datetime()
          RETURN j.id AS jingleId, j.cancionId AS newCancionId
        `;
        const result = await db.executeQuery<{ jingleId: string; newCancionId: string | null }>(
          updateQuery,
          { startId },
          undefined,
          true
        );
        
        if (result.length > 0) {
          const newCancionId = result[0].newCancionId;
          console.log(
            `Updated Jingle ${startId}: cancionId=${newCancionId || 'null'} after deleting VERSIONA relationship`
          );
          // Update auto-comment after Cancion relationship change
          await updateJingleAutoComment(db, startId);
        }
      }
    }

    // AUTOR_DE: Artista -> Cancion
    // Update Cancion.autorIds array
    if (relType === 'AUTOR_DE') {
      if (operation === 'create') {
        // Add artista ID to Cancion.autorIds array (avoid duplicates)
        const updateQuery = `
          MATCH (a:Artista {id: $startId}), (c:Cancion {id: $endId})
          SET c.autorIds = CASE
            WHEN c.autorIds IS NULL THEN [$startId]
            WHEN NOT $startId IN c.autorIds THEN c.autorIds + [$startId]
            ELSE c.autorIds
          END,
          c.updatedAt = datetime()
          RETURN c.id AS cancionId, c.autorIds AS newAutorIds
        `;
        const result = await db.executeQuery<{ cancionId: string; newAutorIds: string[] }>(
          updateQuery,
          { startId, endId },
          undefined,
          true
        );
        
        if (result.length > 0) {
          console.log(`Updated Cancion ${endId}: added ${startId} to autorIds`);
        }
      } else if (operation === 'delete') {
        // Remove artista ID from Cancion.autorIds array
        // Rebuild array from actual AUTOR_DE relationships to ensure consistency
        const updateQuery = `
          MATCH (c:Cancion {id: $endId})
          OPTIONAL MATCH (a:Artista)-[:AUTOR_DE]->(c)
          WITH c, collect(DISTINCT a.id) AS actualAutorIds
          SET c.autorIds = actualAutorIds,
              c.updatedAt = datetime()
          RETURN c.id AS cancionId, c.autorIds AS newAutorIds
        `;
        const result = await db.executeQuery<{ cancionId: string; newAutorIds: string[] }>(
          updateQuery,
          { endId },
          undefined,
          true
        );
        
        if (result.length > 0) {
          console.log(`Updated Cancion ${endId}: removed ${startId} from autorIds`);
        }
      }
    }
  } catch (error: any) {
    // Log error but don't fail the relationship operation
    // Redundant properties can be fixed later via migration/validation
    console.error(
      `Error updating redundant properties for ${relType} (${operation}): ${startId} -> ${endId}`,
      error.message || error
    );
    // Re-throw in development for debugging, swallow in production
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
}

/**
 * Sync redundant properties with relationships for Jingle entities
 * Creates/updates relationships based on fabricaId and cancionId properties
 */
async function syncJingleRedundantProperties(
  jingleId: string,
  properties: { fabricaId?: string; cancionId?: string }
): Promise<void> {
  try {
    // Sync fabricaId with APPEARS_IN relationship
    if (properties.fabricaId !== undefined) {
      if (properties.fabricaId) {
        // Check if Fabrica exists
        const fabricaExists = await db.executeQuery(
          `MATCH (f:Fabrica {id: $fabricaId}) RETURN f.id AS id LIMIT 1`,
          { fabricaId: properties.fabricaId }
        );
        
        if (fabricaExists.length === 0) {
          console.warn(`Fabrica ${properties.fabricaId} not found, skipping APPEARS_IN creation`);
        } else {
          // Check if APPEARS_IN relationship already exists
          const relExists = await db.executeQuery(
            `MATCH (j:Jingle {id: $jingleId})-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId}) RETURN r LIMIT 1`,
            { jingleId, fabricaId: properties.fabricaId }
          );
          
          if (relExists.length === 0) {
            // Create APPEARS_IN relationship with default timestamp (0 seconds)
            await db.executeQuery(
              `MATCH (j:Jingle {id: $jingleId}), (f:Fabrica {id: $fabricaId})
               CREATE (j)-[r:APPEARS_IN {timestamp: 0, createdAt: datetime()}]->(f)
               RETURN r`,
              { jingleId, fabricaId: properties.fabricaId },
              undefined,
              true
            );
            console.log(`Created APPEARS_IN relationship: ${jingleId} -> ${properties.fabricaId}`);
            
            // Update order for the Fabrica
            await updateAppearsInOrder(properties.fabricaId);
          }
        }
      }
    }
    
    // Sync cancionId with VERSIONA relationship
    if (properties.cancionId !== undefined) {
      if (properties.cancionId) {
        // Check if Cancion exists
        const cancionExists = await db.executeQuery(
          `MATCH (c:Cancion {id: $cancionId}) RETURN c.id AS id LIMIT 1`,
          { cancionId: properties.cancionId }
        );
        
        if (cancionExists.length === 0) {
          console.warn(`Cancion ${properties.cancionId} not found, skipping VERSIONA creation`);
        } else {
          // Check if VERSIONA relationship already exists
          const relExists = await db.executeQuery(
            `MATCH (j:Jingle {id: $jingleId})-[r:VERSIONA]->(c:Cancion {id: $cancionId}) RETURN r LIMIT 1`,
            { jingleId, cancionId: properties.cancionId }
          );
          
          if (relExists.length === 0) {
            // Create VERSIONA relationship
            await db.executeQuery(
              `MATCH (j:Jingle {id: $jingleId}), (c:Cancion {id: $cancionId})
               CREATE (j)-[r:VERSIONA {createdAt: datetime()}]->(c)
               RETURN r`,
              { jingleId, cancionId: properties.cancionId },
              undefined,
              true
            );
            console.log(`Created VERSIONA relationship: ${jingleId} -> ${properties.cancionId}`);
          }
        }
      }
    }
  } catch (error: any) {
    console.error(`Error syncing Jingle redundant properties for ${jingleId}:`, error.message || error);
    // Don't throw - allow entity creation/update to succeed even if relationship sync fails
  }
}

/**
 * Validate redundant properties match relationships and auto-fix if needed
 * This runs after entity creation/update to ensure data consistency
 * Relationships are the source of truth - redundant properties are updated to match
 */
async function validateAndFixRedundantProperties(
  entityType: string,
  entityId: string
): Promise<void> {
  try {
    // Only validate entities with redundant properties
    if (entityType !== 'jingles' && entityType !== 'canciones') {
      return;
    }
    
    const validationResult = await validateEntity(db, entityType, entityId);
    
    if (!validationResult.isValid) {
      const redundantIssues = validationResult.issues.filter(
        issue => issue.type === 'redundant_field_mismatch'
      );
      
      if (redundantIssues.length > 0) {
        console.warn(
          `Redundant property mismatch detected for ${entityType}/${entityId}:`,
          redundantIssues.map(i => i.message).join('; ')
        );
        
        // Auto-fix all redundant property mismatches
        for (const issue of redundantIssues) {
          if (issue.fixable) {
            await fixValidationIssue(db, issue);
            console.log(`Auto-fixed: ${issue.message}`);
          }
        }
      }
    }
  } catch (error: any) {
    // Log but don't fail the operation
    console.error(
      `Error validating redundant properties for ${entityType}/${entityId}:`,
      error.message || error
    );
  }
}

/**
 * Sync redundant properties with relationships for Cancion entities
 * Creates/updates relationships based on autorIds array
 */
async function syncCancionRedundantProperties(
  cancionId: string,
  properties: { autorIds?: string[] }
): Promise<void> {
  try {
    // Sync autorIds with AUTOR_DE relationships
    if (properties.autorIds !== undefined) {
      const targetAutorIds = properties.autorIds || [];
      
      // Get current AUTOR_DE relationships
      const currentRels = await db.executeQuery<{ artistaId: string }>(
        `MATCH (a:Artista)-[:AUTOR_DE]->(c:Cancion {id: $cancionId}) RETURN a.id AS artistaId`,
        { cancionId }
      );
      const currentAutorIds = new Set(currentRels.map(r => r.artistaId));
      const targetAutorIdsSet = new Set(targetAutorIds);
      
      // Find relationships to create (in target but not in current)
      const toCreate = targetAutorIds.filter(id => !currentAutorIds.has(id));
      
      // Find relationships to delete (in current but not in target)
      const toDelete = Array.from(currentAutorIds).filter(id => !targetAutorIdsSet.has(id));
      
      // Create missing relationships
      for (const artistaId of toCreate) {
        // Check if Artista exists
        const artistaExists = await db.executeQuery(
          `MATCH (a:Artista {id: $artistaId}) RETURN a.id AS id LIMIT 1`,
          { artistaId }
        );
        
        if (artistaExists.length === 0) {
          console.warn(`Artista ${artistaId} not found, skipping AUTOR_DE creation`);
          continue;
        }
        
        await db.executeQuery(
          `MATCH (a:Artista {id: $artistaId}), (c:Cancion {id: $cancionId})
           CREATE (a)-[r:AUTOR_DE {createdAt: datetime()}]->(c)
           RETURN r`,
          { artistaId, cancionId },
          undefined,
          true
        );
        console.log(`Created AUTOR_DE relationship: ${artistaId} -> ${cancionId}`);
      }
      
      // Delete extra relationships
      for (const artistaId of toDelete) {
        await db.executeQuery(
          `MATCH (a:Artista {id: $artistaId})-[r:AUTOR_DE]->(c:Cancion {id: $cancionId})
           DELETE r`,
          { artistaId, cancionId },
          undefined,
          true
        );
        console.log(`Deleted AUTOR_DE relationship: ${artistaId} -> ${cancionId}`);
      }
    }
  } catch (error: any) {
    console.error(`Error syncing Cancion redundant properties for ${cancionId}:`, error.message || error);
    // Don't throw - allow entity creation/update to succeed even if relationship sync fails
  }
}

// Schema management endpoints
router.get('/schema', asyncHandler(async (req, res) => {
  const schemaInfo = await getSchemaInfo();
  res.json(schemaInfo);
}));

router.post('/schema/properties', asyncHandler(async (req, res) => {
  const { entityType, propertyName, propertyType } = req.body;
  if (!entityType || !propertyName) {
    throw new BadRequestError('entityType and propertyName are required');
  }
  await addPropertyToEntity(entityType, propertyName, propertyType);
  res.json({ message: `Property ${propertyName} added to ${entityType}` });
}));

router.post('/schema/relationships', asyncHandler(async (req, res) => {
  const { relType, startLabel, endLabel } = req.body;
  if (!relType || !startLabel || !endLabel) {
    throw new BadRequestError('relType, startLabel, and endLabel are required');
  }
  await createRelationshipType(relType, startLabel, endLabel);
  res.json({ message: `Relationship type ${relType} created between ${startLabel} and ${endLabel}` });
}));

router.get('/schema/constraints', asyncHandler(async (req, res) => {
  const constraints = await db.executeQuery('SHOW CONSTRAINTS');
  res.json(constraints);
}));

router.post('/schema/constraints', asyncHandler(async (req, res) => {
  const { constraintName, constraintType, entityType, propertyName } = req.body;
  if (!constraintName || !constraintType || !entityType || !propertyName) {
    throw new BadRequestError('constraintName, constraintType, entityType, and propertyName are required');
  }
  await createConstraint(constraintName, constraintType, entityType, propertyName);
  res.json({ message: `Constraint ${constraintName} created` });
}));

router.delete('/schema/constraints/:name', asyncHandler(async (req, res) => {
  const { name } = req.params;
  await dropConstraint(name);
  res.json({ message: `Constraint ${name} dropped` });
}));

// Relationship endpoints
router.get('/relationships', asyncHandler(async (req, res) => {
  const relationships = await db.executeQuery<{ relType: string }>(`
    MATCH ()-[r]-()
    RETURN DISTINCT type(r) as relType
    ORDER BY relType
  `);
  res.json(relationships.map(r => r.relType));
}));

// List specific relationship type
router.get('/relationships/:relType', asyncHandler(async (req, res) => {
  const { relType } = req.params;
  const neo4jRelType = RELATIONSHIP_TYPE_MAP[relType];
  if (!neo4jRelType) {
    throw new NotFoundError(`Unknown relationship type: ${relType}`);
  }
  const query = `
    MATCH ()-[r:${neo4jRelType}]->()
    RETURN r
    ORDER BY r.createdAt DESC
  `;
  const relationships = await db.executeQuery<{ r: any }>(query);
  res.json(relationships.map(r => r.r));
}));

// Create a relationship
router.post('/relationships/:relType', asyncHandler(async (req, res) => {
  const { relType } = req.params;
  const payload = req.body || {};
  if (!payload.start || !payload.end) {
    throw new BadRequestError('Payload must include start and end ids');
  }
  const neo4jRelType = RELATIONSHIP_TYPE_MAP[relType];
  if (!neo4jRelType) {
    throw new NotFoundError(`Unknown relationship type: ${relType}`);
  }
  const existsQuery = `
    MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { id: $end })
    RETURN r
  `;
  const existing = await db.executeQuery(existsQuery, { start: payload.start, end: payload.end });
  if (existing.length > 0) {
    throw new ConflictError('Relationship already exists');
  }
  
  // Extract properties (exclude start and end)
  const properties = { ...payload };
  delete (properties as any).start;
  delete (properties as any).end;
  
    // Special handling for APPEARS_IN relationships
    if (neo4jRelType === 'APPEARS_IN') {
      // Warn if order is provided (it will be ignored)
      if ('order' in properties) {
        console.warn(`Warning: 'order' property is system-managed and will be ignored for APPEARS_IN relationship`);
        delete (properties as any).order;
      }
      
      // Validate and normalize timestamp
      if (properties.timestamp === undefined || properties.timestamp === null) {
        properties.timestamp = 0; // Default to 0 seconds
      } else if (typeof properties.timestamp === 'string') {
        // Convert string (HH:MM:SS) to seconds for backward compatibility during migration
        properties.timestamp = timestampToSeconds(properties.timestamp);
      } else if (typeof properties.timestamp === 'number') {
        // Validate range (0 to 86400 seconds = 24 hours)
        if (properties.timestamp < 0 || properties.timestamp > 86400) {
          console.warn(`Invalid timestamp value ${properties.timestamp}, clamping to valid range`);
          properties.timestamp = Math.max(0, Math.min(86400, properties.timestamp));
        }
      } else {
        console.warn(`Invalid timestamp type, defaulting to 0`);
        properties.timestamp = 0;
      }
    }
  
  // Special handling for REPEATS relationships
  let finalStartId = payload.start;
  let finalEndId = payload.end;
  
  if (neo4jRelType === 'REPEATS') {
    // Validate both entities are Jingles
    const jingleCheckQuery = `
      MATCH (start:Jingle { id: $start }), (end:Jingle { id: $end })
      RETURN start, end
    `;
    const jingleCheck = await db.executeQuery(jingleCheckQuery, { start: payload.start, end: payload.end });
    if (jingleCheck.length === 0) {
      throw new BadRequestError('REPEATS relationships can only be created between Jingle entities');
    }
    
    // Check for circular reference
    const isCircular = await checkCircularReference(db, payload.start, payload.end);
    if (isCircular) {
      throw new BadRequestError('Creating this REPEATS relationship would create a circular reference');
    }
    
    // Validate and correct direction
    const directionResult = await validateRepeatsDirection(db, payload.start, payload.end);
    finalStartId = directionResult.correctStart;
    finalEndId = directionResult.correctEnd;
    
    if (directionResult.corrected) {
      console.log(`REPEATS direction corrected: ${directionResult.reason}`);
    }
    
    // Check for concurrent inbound/outbound REPEATS (triggers normalization)
    const hasConcurrent = await checkConcurrentInboundOutbound(db, finalStartId);
    if (hasConcurrent) {
      // Normalize will be triggered after creation
      console.log(`Concurrent inbound/outbound REPEATS detected on ${finalStartId}, will normalize`);
    }
    
    // Check if relationship already exists with corrected direction
    const correctedExistsQuery = `
      MATCH (start { id: $start })-[r:REPEATS]->(end { id: $end })
      RETURN r
    `;
    const correctedExisting = await db.executeQuery(correctedExistsQuery, { 
      start: finalStartId, 
      end: finalEndId 
    });
    if (correctedExisting.length > 0) {
      throw new ConflictError('REPEATS relationship already exists (with corrected direction)');
    }
    
    // Normalize transitive chains before creating
    const normalizationResult = await normalizeTransitiveChains(db, finalStartId, finalEndId);
    if (normalizationResult.normalized) {
      console.log('REPEATS transitive chains normalized:', normalizationResult);
    }
  }
  
  const createQuery = `
    MATCH (start { id: $start }), (end { id: $end })
    CREATE (start)-[r:${neo4jRelType}]->(end)
    SET r += $properties
    RETURN r
  `;
  const result = await db.executeQuery<{ r: any }>(createQuery, { 
    start: finalStartId, 
    end: finalEndId, 
    properties 
  }, undefined, true);
  
  // Update redundant properties after relationship creation
  await updateRedundantPropertiesOnRelationshipChange(
    neo4jRelType,
    finalStartId,
    finalEndId,
    'create'
  );
  
  // Update auto-comment for affected Jingles
  if (neo4jRelType === 'JINGLERO_DE' || neo4jRelType === 'TAGGED_WITH') {
    // For JINGLERO_DE and TAGGED_WITH, the Jingle is the end node
    await updateJingleAutoComment(db, finalEndId);
  } else if (neo4jRelType === 'AUTOR_DE') {
    // For AUTOR_DE, update all Jingles that VERSIONA the Cancion (end node)
    const jinglesQuery = `
      MATCH (j:Jingle)-[:VERSIONA]->(c:Cancion {id: $cancionId})
      RETURN j.id AS jingleId
    `;
    const jingles = await db.executeQuery<{ jingleId: string }>(jinglesQuery, { cancionId: finalEndId });
    for (const jingle of jingles) {
      await updateJingleAutoComment(db, jingle.jingleId);
    }
  }
  
  // Automatically update order for APPEARS_IN relationships
  if (neo4jRelType === 'APPEARS_IN') {
    try {
      await updateAppearsInOrder(payload.end); // payload.end is the Fabrica ID
    } catch (orderError) {
      console.error(`Failed to update APPEARS_IN order for Fabrica ${payload.end} after creation:`, orderError);
      // Relationship creation succeeded, order update can be retried later
    }
  }
  
  res.status(201).json(result[0].r);
}));

// Update relationship properties
router.put('/relationships/:relType', asyncHandler(async (req, res) => {
  const { relType } = req.params;
  const payload = req.body || {};
  if (!payload.start || !payload.end) {
    throw new BadRequestError('Payload must include start and end ids');
  }
  const neo4jRelType = RELATIONSHIP_TYPE_MAP[relType];
  if (!neo4jRelType) {
    throw new NotFoundError(`Unknown relationship type: ${relType}`);
  }
  
  // Check if relationship exists
  const existsQuery = `
    MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { id: $end })
    RETURN r
  `;
  const existing = await db.executeQuery(existsQuery, { start: payload.start, end: payload.end });
  if (existing.length === 0) {
    throw new NotFoundError('Relationship not found');
  }
  
  // Extract properties (exclude start and end)
  const properties = { ...payload };
  delete (properties as any).start;
  delete (properties as any).end;
  
  // Special handling for APPEARS_IN relationships
  if (neo4jRelType === 'APPEARS_IN') {
    // Warn if order is provided (it will be ignored)
    if ('order' in properties) {
      console.warn(`Warning: 'order' property is system-managed and will be ignored for APPEARS_IN relationship`);
      delete (properties as any).order;
    }
    
    // Validate and normalize timestamp if provided
    if ('timestamp' in properties) {
      if (properties.timestamp === null || properties.timestamp === undefined) {
        properties.timestamp = 0; // Default to 0 seconds
      } else if (typeof properties.timestamp === 'string') {
        // Convert string (HH:MM:SS) to seconds for backward compatibility during migration
        properties.timestamp = timestampToSeconds(properties.timestamp);
      } else if (typeof properties.timestamp === 'number') {
        // Validate range (0 to 86400 seconds = 24 hours)
        if (properties.timestamp < 0 || properties.timestamp > 86400) {
          console.warn(`Invalid timestamp value ${properties.timestamp}, clamping to valid range`);
          properties.timestamp = Math.max(0, Math.min(86400, properties.timestamp));
        }
      } else {
        console.warn(`Invalid timestamp type, defaulting to 0`);
        properties.timestamp = 0;
      }
    }
  }
  
  // Special handling for REPEATS relationships
  let finalStartId = payload.start;
  let finalEndId = payload.end;
  
  if (neo4jRelType === 'REPEATS') {
    // Validate both entities are Jingles
    const jingleCheckQuery = `
      MATCH (start:Jingle { id: $start }), (end:Jingle { id: $end })
      RETURN start, end
    `;
    const jingleCheck = await db.executeQuery(jingleCheckQuery, { start: payload.start, end: payload.end });
    if (jingleCheck.length === 0) {
      throw new BadRequestError('REPEATS relationships can only exist between Jingle entities');
    }
    
    // Re-validate direction (direction may need correction if fabricaDate changed)
    const directionResult = await validateRepeatsDirection(db, payload.start, payload.end);
    finalStartId = directionResult.correctStart;
    finalEndId = directionResult.correctEnd;
    
    // If direction needs correction, we need to delete old and create new
    if (directionResult.corrected) {
      console.log(`REPEATS direction needs correction on update: ${directionResult.reason}`);
      
      // Check if corrected relationship already exists
      const correctedExistsQuery = `
        MATCH (start { id: $start })-[r:REPEATS]->(end { id: $end })
        RETURN r
      `;
      const correctedExisting = await db.executeQuery(correctedExistsQuery, { 
        start: finalStartId, 
        end: finalEndId 
      });
      
      if (correctedExisting.length > 0) {
        // Corrected relationship already exists, delete the old one
        const deleteQuery = `
          MATCH (start { id: $oldStart })-[r:REPEATS]->(end { id: $oldEnd })
          DELETE r
        `;
        await db.executeQuery(deleteQuery, { 
          oldStart: payload.start, 
          oldEnd: payload.end 
        }, undefined, true);
        throw new ConflictError('REPEATS relationship direction corrected - relationship already exists with correct direction');
      }
      
      // Delete old relationship and create new with correct direction
      const deleteOldQuery = `
        MATCH (start { id: $oldStart })-[r:REPEATS]->(end { id: $oldEnd })
        DELETE r
      `;
      await db.executeQuery(deleteOldQuery, { 
        oldStart: payload.start, 
        oldEnd: payload.end 
      }, undefined, true);
      
      // Create new relationship with correct direction
      const createQuery = `
        MATCH (start { id: $start }), (end { id: $end })
        CREATE (start)-[r:REPEATS]->(end)
        SET r += $properties
        RETURN r
      `;
      const result = await db.executeQuery<{ r: any }>(createQuery, { 
        start: finalStartId, 
        end: finalEndId, 
        properties 
      }, undefined, true);
      
      // Normalize transitive chains after update
      const normalizationResult = await normalizeTransitiveChains(db, finalStartId, finalEndId);
      if (normalizationResult.normalized) {
        console.log('REPEATS transitive chains normalized after update:', normalizationResult);
      }
      
      return res.json(result[0].r);
    }
    
    // Check for circular reference (if updating would create one)
    const isCircular = await checkCircularReference(db, finalStartId, finalEndId);
    if (isCircular) {
      throw new BadRequestError('Updating this REPEATS relationship would create a circular reference');
    }
    
    // Normalize transitive chains after update
    const normalizationResult = await normalizeTransitiveChains(db, finalStartId, finalEndId);
    if (normalizationResult.normalized) {
      console.log('REPEATS transitive chains normalized after update:', normalizationResult);
    }
  }
  
  // Update relationship properties
  const updateQuery = `
    MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { id: $end })
    SET r += $properties
    RETURN r
  `;
  const result = await db.executeQuery<{ r: any }>(updateQuery, { 
    start: finalStartId, 
    end: finalEndId, 
    properties 
  }, undefined, true);
  
  // Automatically update order for APPEARS_IN relationships (in case timestamp changed)
  if (neo4jRelType === 'APPEARS_IN') {
    try {
      await updateAppearsInOrder(payload.end); // payload.end is the Fabrica ID
    } catch (orderError) {
      console.error(`Failed to update APPEARS_IN order for Fabrica ${payload.end} after update:`, orderError);
      // Relationship update succeeded, order update can be retried later
    }
  }
  
  // Update auto-comment for affected Jingles
  if (neo4jRelType === 'APPEARS_IN' || neo4jRelType === 'VERSIONA') {
    // For APPEARS_IN and VERSIONA, the Jingle is the start node
    await updateJingleAutoComment(db, payload.start);
  } else if (neo4jRelType === 'JINGLERO_DE' || neo4jRelType === 'TAGGED_WITH') {
    // For JINGLERO_DE and TAGGED_WITH, the Jingle is the end node
    await updateJingleAutoComment(db, payload.end);
  } else if (neo4jRelType === 'AUTOR_DE') {
    // For AUTOR_DE, update all Jingles that VERSIONA the Cancion (end node)
    const jinglesQuery = `
      MATCH (j:Jingle)-[:VERSIONA]->(c:Cancion {id: $cancionId})
      RETURN j.id AS jingleId
    `;
    const jingles = await db.executeQuery<{ jingleId: string }>(jinglesQuery, { cancionId: payload.end });
    for (const jingle of jingles) {
      await updateJingleAutoComment(db, jingle.jingleId);
    }
  }
  
  res.json(result[0].r);
}));

// Delete a relationship
router.delete('/relationships/:relType', asyncHandler(async (req, res) => {
  const { relType } = req.params;
  const payload = req.body || {};
  if (!payload.start || !payload.end) {
    throw new BadRequestError('Payload must include start and end ids to delete');
  }
  const neo4jRelType = RELATIONSHIP_TYPE_MAP[relType];
  if (!neo4jRelType) {
    throw new NotFoundError(`Unknown relationship type: ${relType}`);
  }
  const deleteQuery = `
    MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { id: $end })
    DELETE r
    RETURN count(r) as deletedCount
  `;
  const result = await db.executeQuery<{ deletedCount: number }>(deleteQuery, { 
    start: payload.start, 
    end: payload.end 
  }, undefined, true);
  if (result[0].deletedCount === 0) {
    throw new NotFoundError('Relationship not found');
  }
  
  // Update redundant properties after relationship deletion
  await updateRedundantPropertiesOnRelationshipChange(
    neo4jRelType,
    payload.start,
    payload.end,
    'delete'
  );
  
  // Automatically update order for remaining APPEARS_IN relationships
  if (neo4jRelType === 'APPEARS_IN') {
    try {
      await updateAppearsInOrder(payload.end); // payload.end is the Fabrica ID
    } catch (orderError) {
      console.error(`Failed to update APPEARS_IN order for Fabrica ${payload.end} after deletion:`, orderError);
      // Relationship deletion succeeded, order update can be retried later
    }
  }
  
  // Update auto-comment for affected Jingles
  if (neo4jRelType === 'JINGLERO_DE' || neo4jRelType === 'TAGGED_WITH') {
    // For JINGLERO_DE and TAGGED_WITH, the Jingle is the end node
    await updateJingleAutoComment(db, payload.end);
  } else if (neo4jRelType === 'AUTOR_DE') {
    // For AUTOR_DE, update all Jingles that VERSIONA the Cancion (end node)
    const jinglesQuery = `
      MATCH (j:Jingle)-[:VERSIONA]->(c:Cancion {id: $cancionId})
      RETURN j.id AS jingleId
    `;
    const jingles = await db.executeQuery<{ jingleId: string }>(jinglesQuery, { cancionId: payload.end });
    for (const jingle of jingles) {
      await updateJingleAutoComment(db, jingle.jingleId);
    }
  }
  
  res.json({ message: 'Relationship deleted successfully' });
}));

// ============================================================================
// Validation endpoints
// ============================================================================

/**
 * POST /api/admin/validate/entity/:type/:id
 * Validate a specific entity for all validation issues
 */
router.post('/validate/entity/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const result = await validateEntity(db, type, id);
  res.json(result);
}));

/**
 * GET /api/admin/validate/entity/:type/:id
 * Get validation results for a specific entity (same as POST, but GET for convenience)
 */
router.get('/validate/entity/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const result = await validateEntity(db, type, id);
  res.json(result);
}));

/**
 * POST /api/admin/validate/entity/:type
 * Validate all entities of a specific type
 */
router.post('/validate/entity/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;
  const results = await validateAllEntities(db, type);
  res.json({
    entityType: type,
    results,
    totalEntities: results.length,
    entitiesWithIssues: results.filter(r => !r.isValid).length,
    totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
  });
}));

/**
 * POST /api/admin/validate/relationship/:relType
 * Validate a specific relationship
 * Body: { start: string, end: string }
 */
router.post('/validate/relationship/:relType', asyncHandler(async (req, res) => {
  const { relType } = req.params;
  const { start, end } = req.body;
  
  if (!start || !end) {
    throw new BadRequestError('start and end entity IDs are required');
  }
  
  const result = await validateRelationship(db, relType, start, end);
  res.json(result);
}));

/**
 * POST /api/admin/validate/fix
 * Fix a validation issue
 * Body: { issue: ValidationIssue }
 */
router.post('/validate/fix', asyncHandler(async (req, res) => {
  const { issue } = req.body;
  
  if (!issue) {
    throw new BadRequestError('issue is required');
  }
  
  if (!issue.fixable) {
    throw new BadRequestError('Issue is not fixable');
  }
  
  await fixValidationIssue(db, issue);
  res.json({ 
    success: true, 
    message: 'Issue fixed successfully',
    issue,
  });
}));

// ============================================================================
// Cleanup Endpoints
// ============================================================================

/**
 * GET /api/admin/cleanup/scripts
 * List all available cleanup scripts with metadata
 */
router.get('/cleanup/scripts', asyncHandler(async (req, res) => {
  const scripts = getAllScripts();
  res.json({
    scripts,
    total: scripts.length,
  });
}));

/**
 * POST /api/admin/cleanup/:scriptId/execute
 * Execute a cleanup script
 */
router.post('/cleanup/:scriptId/execute', asyncHandler(async (req, res) => {
  const { scriptId } = req.params;
  
  // Validate script exists
  const metadata = getScriptMetadata(scriptId);
  if (!metadata) {
    throw new NotFoundError(`Script not found: ${scriptId}`);
  }
  
  // Execute script
  const startTime = Date.now();
  try {
    const result = await executeScript(scriptId);
    const executionTime = Date.now() - startTime;
    
    // Ensure executionTime is set (use actual if script didn't set it)
    if (!result.executionTime) {
      result.executionTime = executionTime;
    }
    
    // Ensure timestamp is set
    if (!result.timestamp) {
      result.timestamp = new Date().toISOString();
    }
    
    res.json(result);
  } catch (error: any) {
    // Handle script execution errors
    if (error.message && error.message.includes('not found')) {
      throw new NotFoundError(error.message);
    }
    // Re-throw as internal server error
    throw new InternalServerError(`Script execution failed: ${error.message || 'Unknown error'}`);
  }
}));

/**
 * POST /api/admin/cleanup/:scriptId/automate
 * Apply automated fixes suggested by a cleanup script
 */
router.post('/cleanup/:scriptId/automate', asyncHandler(async (req, res) => {
  const { scriptId } = req.params;
  const { entityIds, applyLowConfidence = false } = req.body;
  
  // Validate script exists
  const metadata = getScriptMetadata(scriptId);
  if (!metadata) {
    throw new NotFoundError(`Script not found: ${scriptId}`);
  }
  
  // Validate script supports automation
  if (!isScriptAutomatable(scriptId)) {
    throw new BadRequestError(`Script does not support automation: ${scriptId}`);
  }
  
  // Validate entityIds
  if (!Array.isArray(entityIds) || entityIds.length === 0) {
    throw new BadRequestError('entityIds must be a non-empty array');
  }
  
  // Validate all entityIds are strings
  if (!entityIds.every(id => typeof id === 'string')) {
    throw new BadRequestError('All entityIds must be strings');
  }
  
  // Execute automation
  try {
    const result = await automateScript(scriptId, entityIds, applyLowConfidence);
    res.json(result);
  } catch (error: any) {
    // Handle automation errors
    if (error.message && error.message.includes('not found')) {
      throw new NotFoundError(error.message);
    }
    if (error.message && error.message.includes('does not support')) {
      throw new BadRequestError(error.message);
    }
    // Re-throw as internal server error
    throw new InternalServerError(`Automation failed: ${error.message || 'Unknown error'}`);
  }
}));

// Entity endpoints
router.get('/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new NotFoundError(`Unknown entity type: ${type}`);
  }
  const query = `
    MATCH (n:${label})
    RETURN n
    ORDER BY n.createdAt DESC
  `;
  const entities = await db.executeQuery<{ n: { properties: any } }>(query);
  res.json(entities.map((entity) => convertNeo4jDates(entity.n.properties)));
}));

router.get('/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new NotFoundError(`Unknown entity type: ${type}`);
  }
  const query = `
    MATCH (n:${label} { id: $id })
    RETURN n
  `;
  const result = await db.executeQuery<{ n: { properties: any } }>(query, { id });
  if (result.length === 0) {
    throw new NotFoundError(`Not found: ${type}/${id}`);
  }
  res.json(convertNeo4jDates(result[0].n.properties));
}));

router.post('/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;
  const payload = req.body || {};
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new NotFoundError(`Unknown entity type: ${type}`);
  }
  
  // Validate entity input using Zod schemas
  try {
    validateEntityInput(type, payload);
  } catch (validationError: any) {
    throw new BadRequestError(validationError.message || 'Validation failed');
  }
  
  const id = payload.id || await generateId(type);
  const existsQuery = `MATCH (n:${label} { id: $id }) RETURN n`;
  const existing = await db.executeQuery(existsQuery, { id });
  if (existing.length > 0) {
    throw new ConflictError(`Entity with id already exists: ${id}`);
  }
  // Always use current timestamp for creation, ignore any timestamps in payload
  const now = new Date().toISOString();
  const createQuery = `
    CREATE (n:${label} {
      id: $id,
      createdAt: datetime($createdAt),
      updatedAt: datetime($updatedAt)
    })
    SET n += $properties
    RETURN n
  `;
  const properties = { ...payload, id } as any;
  // Remove timestamp fields from properties to ensure they're always set to current time
  delete properties.createdAt;
  delete properties.updatedAt;
  
  // Set default status for entities that support it (Jingle, Cancion, Artista, Tematica)
  if ((label === 'Jingle' || label === 'Cancion' || label === 'Artista' || label === 'Tematica') && !properties.status) {
    properties.status = 'DRAFT';
  }
  
  const result = await db.executeQuery<{ n: { properties: any } }>(createQuery, {
    id,
    createdAt: now, // Always use current timestamp for creation
    updatedAt: now, // Always use current timestamp for creation
    properties
  }, undefined, true);
  
  // Sync redundant properties with relationships (auto-create relationships if needed)
  if (label === 'Jingle') {
    await syncJingleRedundantProperties(id, {
      fabricaId: properties.fabricaId,
      cancionId: properties.cancionId,
    });
  } else if (label === 'Cancion') {
    await syncCancionRedundantProperties(id, {
      autorIds: properties.autorIds,
    });
  }
  
  // Validate and auto-fix any redundant property discrepancies
  await validateAndFixRedundantProperties(type, id);
  
  // Update auto-comment for Jingles
  if (label === 'Jingle') {
    await updateJingleAutoComment(db, id);
    // Re-fetch to get updated autoComment
    const updatedResult = await db.executeQuery<{ n: { properties: any } }>(
      `MATCH (n:${label} { id: $id }) RETURN n`,
      { id },
      undefined,
      true
    );
    if (updatedResult.length > 0) {
      return res.status(201).json(convertNeo4jDates(updatedResult[0].n.properties));
    }
  }
  
  res.status(201).json(convertNeo4jDates(result[0].n.properties));
}));

// MusicBrainz search endpoint
router.post('/musicbrainz/search', asyncHandler(async (req, res) => {
  const { title, artist, limit } = req.body;
  
  if (!title || typeof title !== 'string') {
    throw new BadRequestError('Title is required and must be a string');
  }
  
  const searchLimit = limit && typeof limit === 'number' ? Math.min(Math.max(limit, 1), 50) : 10;
  const artistName = artist && typeof artist === 'string' ? artist : undefined;
  
  try {
    const matches = await searchRecording(title, artistName, searchLimit);
    res.json(matches);
  } catch (error: any) {
    // Return empty array on error (graceful degradation)
    console.error('MusicBrainz search error:', error.message);
    res.json([]);
  }
}));

router.put('/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const payload = req.body || {};
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new NotFoundError(`Unknown entity type: ${type}`);
  }
  
  // Validate entity input using Zod schemas
  const validationResult = validateEntityInputSafe(type, payload);
  if (!validationResult.valid) {
    const errorMessages = Object.entries(validationResult.errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
    throw new BadRequestError(`Validation failed: ${errorMessages}`);
  }
  
  // Remove timestamp fields from payload to ensure updatedAt is always set to current time
  const properties = { ...payload } as any;
  delete properties.createdAt; // Don't allow updating createdAt
  delete properties.updatedAt; // Always use current timestamp for updatedAt
  const updateQuery = `
    MATCH (n:${label} { id: $id })
    SET n += $properties,
        n.updatedAt = datetime()
    RETURN n
  `;
  const result = await db.executeQuery<{ n: { properties: any } }>(updateQuery, { 
    id, 
    properties 
  }, undefined, true);
  if (result.length === 0) {
    throw new NotFoundError(`Not found: ${type}/${id}`);
  }
  
  // Sync redundant properties with relationships (auto-create/delete relationships if needed)
  if (label === 'Jingle') {
    await syncJingleRedundantProperties(id, {
      fabricaId: properties.fabricaId,
      cancionId: properties.cancionId,
    });
  } else if (label === 'Cancion') {
    await syncCancionRedundantProperties(id, {
      autorIds: properties.autorIds,
    });
  }
  
  // Validate and auto-fix any redundant property discrepancies
  await validateAndFixRedundantProperties(type, id);
  
  // Update auto-comment for Jingles
  if (label === 'Jingle') {
    await updateJingleAutoComment(db, id);
    // Re-fetch to get updated autoComment
    const updatedResult = await db.executeQuery<{ n: { properties: any } }>(
      `MATCH (n:${label} { id: $id }) RETURN n`,
      { id },
      undefined,
      true
    );
    if (updatedResult.length > 0) {
      return res.json(convertNeo4jDates(updatedResult[0].n.properties));
    }
  }
  
  res.json(convertNeo4jDates(result[0].n.properties));
}));

router.patch('/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const payload = req.body || {};
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new NotFoundError(`Unknown entity type: ${type}`);
  }
  const getQuery = `MATCH (n:${label} { id: $id }) RETURN n`;
  const existing = await db.executeQuery<{ n: any }>(getQuery, { id });
  if (existing.length === 0) {
    throw new NotFoundError(`Not found: ${type}/${id}`);
  }
  const existingProps = existing[0].n;
  // Remove timestamp fields from payload to ensure updatedAt is always set to current time
  const cleanPayload = { ...payload } as any;
  delete cleanPayload.createdAt; // Don't allow updating createdAt
  delete cleanPayload.updatedAt; // Always use current timestamp for updatedAt
  const mergedProps = { ...existingProps, ...cleanPayload, id };
  const updateQuery = `
    MATCH (n:${label} { id: $id })
    SET n = $properties,
        n.updatedAt = datetime()
    RETURN n
  `;
  const result = await db.executeQuery<{ n: { properties: any } }>(updateQuery, { 
    id, 
    properties: mergedProps 
  }, undefined, true);
  
  // Sync redundant properties with relationships (auto-create/delete relationships if needed)
  if (label === 'Jingle') {
    await syncJingleRedundantProperties(id, {
      fabricaId: mergedProps.fabricaId,
      cancionId: mergedProps.cancionId,
    });
  } else if (label === 'Cancion') {
    await syncCancionRedundantProperties(id, {
      autorIds: mergedProps.autorIds,
    });
  }
  
  // Validate and auto-fix any redundant property discrepancies
  await validateAndFixRedundantProperties(type, id);
  
  // Update auto-comment for Jingles
  if (label === 'Jingle') {
    await updateJingleAutoComment(db, id);
    // Re-fetch to get updated autoComment
    const updatedResult = await db.executeQuery<{ n: { properties: any } }>(
      `MATCH (n:${label} { id: $id }) RETURN n`,
      { id },
      undefined,
      true
    );
    if (updatedResult.length > 0) {
      return res.json(convertNeo4jDates(updatedResult[0].n.properties));
    }
  }
  
  res.json(convertNeo4jDates(result[0].n.properties));
}));

router.delete('/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new NotFoundError(`Unknown entity type: ${type}`);
  }
  const deleteQuery = `
    MATCH (n:${label} { id: $id })
    DETACH DELETE n
    RETURN count(n) as deletedCount
  `;
  const result = await db.executeQuery<{ deletedCount: number }>(deleteQuery, { id }, undefined, true);
  if (result[0].deletedCount === 0) {
    throw new NotFoundError(`Not found: ${type}/${id}`);
  }
  res.json({ message: 'Entity deleted successfully' });
}));

export default router;
