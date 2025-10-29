import { Router } from 'express';
import { Neo4jClient } from '../db';
import { 
  getSchemaInfo, 
  addPropertyToEntity, 
  createRelationshipType, 
  createConstraint, 
  dropConstraint 
} from '../db/schema/setup';
import { asyncHandler, BadRequestError, NotFoundError, ConflictError } from './core';

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

function generateId(type: string): string {
  // Use Neo4j's randomUUID() function
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
  res.status(201).json(result[0].r);
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
    MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { $end })
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
  res.json({ message: 'Relationship deleted successfully' });
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
