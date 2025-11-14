import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Neo4jClient } from '../db';
import { 
  getSchemaInfo, 
  addPropertyToEntity, 
  createRelationshipType, 
  createConstraint, 
  dropConstraint 
} from '../db/schema/setup';
import { asyncHandler, BadRequestError, NotFoundError, ConflictError, UnauthorizedError } from './core';
import { optionalAdminAuth, requireAdminAuth } from '../middleware/auth';
import {
  validateEntity,
  validateRelationship,
  validateAllEntities,
  fixValidationIssue,
  ValidationResult,
  RelationshipValidationResult,
} from '../utils/validation';

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
  'soy_yo': 'SOY_YO'
};

// Entity type to prefix mapping
// Note: Fabricas use YouTube video ID (external), so they use temp IDs until committed
const ENTITY_PREFIX_MAP: Record<string, string> = {
  jingles: 'JIN-',
  canciones: 'CAN-',
  artistas: 'ART-',
  tematicas: 'TEM-',
  usuarios: 'USR-',
};

function generateId(type: string): string {
  // For Fabricas: Use temp ID since ID comes from external source (YouTube video ID)
  if (type === 'fabricas') {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // For other entities: Generate UUID with prefix when committed
  // Format: PREFIX-UUID (e.g., JIN-550e8400-e29b-41d4-a716-446655440000)
  const prefix = ENTITY_PREFIX_MAP[type] || '';
  const uuid = randomUUID();
  return prefix ? `${prefix}${uuid}` : uuid;
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
 * Update redundant properties when relationships are created/updated/deleted
 * This maintains data consistency between relationships and denormalized properties
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
    if (relType === 'APPEARS_IN' && operation === 'create') {
      const updateQuery = `
        MATCH (j:Jingle {id: $startId}), (f:Fabrica {id: $endId})
        SET j.fabricaId = f.id,
            j.fabricaDate = f.date
      `;
      await db.executeQuery(updateQuery, { startId, endId }, undefined, true);
    } else if (relType === 'APPEARS_IN' && operation === 'delete') {
      // Only clear fabricaId and fabricaDate if no other APPEARS_IN relationships exist
      const updateQuery = `
        MATCH (j:Jingle {id: $startId})
        WHERE NOT EXISTS((j)-[:APPEARS_IN]->())
        SET j.fabricaId = null,
            j.fabricaDate = null
      `;
      await db.executeQuery(updateQuery, { startId }, undefined, true);
    }

    // VERSIONA: Jingle -> Cancion
    // Update Jingle.cancionId
    if (relType === 'VERSIONA' && operation === 'create') {
      const updateQuery = `
        MATCH (j:Jingle {id: $startId}), (c:Cancion {id: $endId})
        SET j.cancionId = c.id
      `;
      await db.executeQuery(updateQuery, { startId, endId }, undefined, true);
    } else if (relType === 'VERSIONA' && operation === 'delete') {
      const updateQuery = `
        MATCH (j:Jingle {id: $startId})
        WHERE NOT EXISTS((j)-[:VERSIONA]->())
        SET j.cancionId = null
      `;
      await db.executeQuery(updateQuery, { startId }, undefined, true);
    }

    // AUTOR_DE: Artista -> Cancion
    // Update Cancion.autorIds array
    if (relType === 'AUTOR_DE') {
      if (operation === 'create') {
        // Add artista ID to Cancion.autorIds array
        const updateQuery = `
          MATCH (a:Artista {id: $startId}), (c:Cancion {id: $endId})
          SET c.autorIds = CASE
            WHEN c.autorIds IS NULL THEN [$startId]
            WHEN NOT $startId IN c.autorIds THEN c.autorIds + [$startId]
            ELSE c.autorIds
          END
        `;
        await db.executeQuery(updateQuery, { startId, endId }, undefined, true);
      } else if (operation === 'delete') {
        // Remove artista ID from Cancion.autorIds array
        const updateQuery = `
          MATCH (c:Cancion {id: $endId})
          WHERE c.autorIds IS NOT NULL
          SET c.autorIds = [x IN c.autorIds WHERE x <> $startId]
        `;
        await db.executeQuery(updateQuery, { startId, endId }, undefined, true);
      }
    }
  } catch (error) {
    // Log error but don't fail the relationship operation
    // Redundant properties can be fixed later via migration/validation
    console.warn(`Warning: Failed to update redundant properties for ${relType}:`, error);
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
  const createQuery = `
    MATCH (start { id: $start }), (end { id: $end })
    CREATE (start)-[r:${neo4jRelType}]->(end)
    SET r += $properties
    RETURN r
  `;
  const properties = { ...payload };
  delete (properties as any).start;
  delete (properties as any).end;
  const result = await db.executeQuery<{ r: any }>(createQuery, { 
    start: payload.start, 
    end: payload.end, 
    properties 
  }, undefined, true);
  
  // Update redundant properties after relationship creation
  await updateRedundantPropertiesOnRelationshipChange(
    neo4jRelType,
    payload.start,
    payload.end,
    'create'
  );
  
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
  
  // Update relationship properties
  const updateQuery = `
    MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { id: $end })
    SET r += $properties
    RETURN r
  `;
  const result = await db.executeQuery<{ r: any }>(updateQuery, { 
    start: payload.start, 
    end: payload.end, 
    properties 
  }, undefined, true);
  
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
  const id = payload.id || generateId(type);
  const existsQuery = `MATCH (n:${label} { id: $id }) RETURN n`;
  const existing = await db.executeQuery(existsQuery, { id });
  if (existing.length > 0) {
    throw new ConflictError(`Entity with id already exists: ${id}`);
  }
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
  delete properties.createdAt;
  delete properties.updatedAt;
  const result = await db.executeQuery<{ n: { properties: any } }>(createQuery, {
    id,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
    properties
  }, undefined, true);
  res.status(201).json(convertNeo4jDates(result[0].n.properties));
}));

router.put('/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const payload = req.body || {};
  const label = ENTITY_LABEL_MAP[type];
  if (!label) {
    throw new NotFoundError(`Unknown entity type: ${type}`);
  }
  const updateQuery = `
    MATCH (n:${label} { id: $id })
    SET n += $properties,
        n.updatedAt = datetime()
    RETURN n
  `;
  const result = await db.executeQuery<{ n: { properties: any } }>(updateQuery, { 
    id, 
    properties: payload 
  }, undefined, true);
  if (result.length === 0) {
    throw new NotFoundError(`Not found: ${type}/${id}`);
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
  const mergedProps = { ...existingProps, ...payload, id };
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
