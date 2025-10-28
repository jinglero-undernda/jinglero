import { Router } from 'express';
import { Neo4jClient } from '../db';
import { 
  getSchemaInfo, 
  addPropertyToEntity, 
  createRelationshipType, 
  createConstraint, 
  dropConstraint 
} from '../db/schema/setup';

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
router.get('/schema', async (req, res) => {
  try {
    const schemaInfo = await getSchemaInfo();
    res.json(schemaInfo);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to get schema info' });
  }
});

router.post('/schema/properties', async (req, res) => {
  try {
    const { entityType, propertyName, propertyType } = req.body;
    if (!entityType || !propertyName) {
      return res.status(400).json({ error: 'entityType and propertyName are required' });
    }
    
    await addPropertyToEntity(entityType, propertyName, propertyType);
    res.json({ message: `Property ${propertyName} added to ${entityType}` });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to add property' });
  }
});

router.post('/schema/relationships', async (req, res) => {
  try {
    const { relType, startLabel, endLabel } = req.body;
    if (!relType || !startLabel || !endLabel) {
      return res.status(400).json({ error: 'relType, startLabel, and endLabel are required' });
    }
    
    await createRelationshipType(relType, startLabel, endLabel);
    res.json({ message: `Relationship type ${relType} created between ${startLabel} and ${endLabel}` });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create relationship type' });
  }
});

router.get('/schema/constraints', async (req, res) => {
  try {
    const constraints = await db.executeQuery('SHOW CONSTRAINTS');
    res.json(constraints);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to get constraints' });
  }
});

router.post('/schema/constraints', async (req, res) => {
  try {
    const { constraintName, constraintType, entityType, propertyName } = req.body;
    if (!constraintName || !constraintType || !entityType || !propertyName) {
      return res.status(400).json({ error: 'constraintName, constraintType, entityType, and propertyName are required' });
    }
    
    await createConstraint(constraintName, constraintType, entityType, propertyName);
    res.json({ message: `Constraint ${constraintName} created` });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create constraint' });
  }
});

router.delete('/schema/constraints/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await dropConstraint(name);
    res.json({ message: `Constraint ${name} dropped` });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to drop constraint' });
  }
});

// Relationship endpoints
router.get('/relationships', async (req, res) => {
  try {
    const relationships = await db.executeQuery(`
      MATCH ()-[r]-()
      RETURN DISTINCT type(r) as relType
      ORDER BY relType
    `);
    res.json(relationships.map(r => r.relType));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load relationships' });
  }
});

// List specific relationship type
router.get('/relationships/:relType', async (req, res) => {
  try {
    const { relType } = req.params;
    const neo4jRelType = RELATIONSHIP_TYPE_MAP[relType];
    
    if (!neo4jRelType) {
      return res.status(404).json({ error: `Unknown relationship type: ${relType}` });
    }
    
    const query = `
      MATCH ()-[r:${neo4jRelType}]->()
      RETURN r
      ORDER BY r.createdAt DESC
    `;
    
    const relationships = await db.executeQuery(query);
    res.json(relationships.map(r => r.r));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load relationships' });
  }
});

// Create a relationship
router.post('/relationships/:relType', async (req, res) => {
  try {
    const { relType } = req.params;
    const payload = req.body || {};
    
    if (!payload.start || !payload.end) {
      return res.status(400).json({ error: 'Payload must include start and end ids' });
    }
    
    const neo4jRelType = RELATIONSHIP_TYPE_MAP[relType];
    if (!neo4jRelType) {
      return res.status(404).json({ error: `Unknown relationship type: ${relType}` });
    }
    
    // Check if relationship already exists
    const existsQuery = `
      MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { id: $end })
      RETURN r
    `;
    
    const existing = await db.executeQuery(existsQuery, { start: payload.start, end: payload.end });
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Relationship already exists' });
    }
    
    // Create the relationship
    const createQuery = `
      MATCH (start { id: $start }), (end { id: $end })
      CREATE (start)-[r:${neo4jRelType}]->(end)
      SET r += $properties
      RETURN r
    `;
    
    const properties = { ...payload };
    delete properties.start;
    delete properties.end;
    
    const result = await db.executeQuery(createQuery, { 
      start: payload.start, 
      end: payload.end, 
      properties 
    }, undefined, true);
    
    res.status(201).json(result[0].r);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create relationship' });
  }
});

// Delete a relationship
router.delete('/relationships/:relType', async (req, res) => {
  try {
    const { relType } = req.params;
    const payload = req.body || {};
    
    if (!payload.start || !payload.end) {
      return res.status(400).json({ error: 'Payload must include start and end ids to delete' });
    }
    
    const neo4jRelType = RELATIONSHIP_TYPE_MAP[relType];
    if (!neo4jRelType) {
      return res.status(404).json({ error: `Unknown relationship type: ${relType}` });
    }
    
    const deleteQuery = `
      MATCH (start { id: $start })-[r:${neo4jRelType}]->(end { id: $end })
      DELETE r
      RETURN count(r) as deletedCount
    `;
    
    const result = await db.executeQuery(deleteQuery, { 
      start: payload.start, 
      end: payload.end 
    }, undefined, true);
    
    if (result[0].deletedCount === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }
    
    res.json({ message: 'Relationship deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to delete relationship' });
  }
});


// Entity endpoints
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const label = ENTITY_LABEL_MAP[type];
    
    if (!label) {
      return res.status(404).json({ error: `Unknown entity type: ${type}` });
    }
    
    const query = `
      MATCH (n:${label})
      RETURN n
      ORDER BY n.createdAt DESC
    `;
    
    const entities = await db.executeQuery(query);
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load entities' });
  }
});

router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const label = ENTITY_LABEL_MAP[type];
    
    if (!label) {
      return res.status(404).json({ error: `Unknown entity type: ${type}` });
    }
    
    const query = `
      MATCH (n:${label} { id: $id })
      RETURN n
    `;
    
    const result = await db.executeQuery(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: `Not found: ${type}/${id}` });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load entity' });
  }
});

router.post('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const payload = req.body || {};
    const label = ENTITY_LABEL_MAP[type];
    
    if (!label) {
      return res.status(404).json({ error: `Unknown entity type: ${type}` });
    }
    
    // Generate ID if not provided
    const id = payload.id || generateId(type);
    
    // Check if entity with this ID already exists
    const existsQuery = `MATCH (n:${label} { id: $id }) RETURN n`;
    const existing = await db.executeQuery(existsQuery, { id });
    if (existing.length > 0) {
      return res.status(409).json({ error: `Entity with id already exists: ${id}` });
    }
    
    // Create the entity
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
    
    const properties = { ...payload, id };
    delete properties.createdAt;
    delete properties.updatedAt;
    
    const result = await db.executeQuery(createQuery, {
      id,
      createdAt: payload.createdAt || now,
      updatedAt: payload.updatedAt || now,
      properties
    }, undefined, true);
    
    res.status(201).json(convertNeo4jDates(result[0].n.properties));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create entity' });
  }
});

router.put('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const payload = req.body || {};
    const label = ENTITY_LABEL_MAP[type];
    
    if (!label) {
      return res.status(404).json({ error: `Unknown entity type: ${type}` });
    }
    
    const updateQuery = `
      MATCH (n:${label} { id: $id })
      SET n += $properties,
          n.updatedAt = datetime()
      RETURN n
    `;
    
    const result = await db.executeQuery(updateQuery, { 
      id, 
      properties: payload 
    }, undefined, true);
    
    if (result.length === 0) {
      return res.status(404).json({ error: `Not found: ${type}/${id}` });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to update entity' });
  }
});

router.patch('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const payload = req.body || {};
    const label = ENTITY_LABEL_MAP[type];
    
    if (!label) {
      return res.status(404).json({ error: `Unknown entity type: ${type}` });
    }
    
    // Get existing entity first
    const getQuery = `MATCH (n:${label} { id: $id }) RETURN n`;
    const existing = await db.executeQuery(getQuery, { id });
    
    if (existing.length === 0) {
      return res.status(404).json({ error: `Not found: ${type}/${id}` });
    }
    
    // Merge with existing properties
    const existingProps = existing[0].n;
    const mergedProps = { ...existingProps, ...payload, id };
    
    const updateQuery = `
      MATCH (n:${label} { id: $id })
      SET n = $properties,
          n.updatedAt = datetime()
      RETURN n
    `;
    
    const result = await db.executeQuery(updateQuery, { 
      id, 
      properties: mergedProps 
    }, undefined, true);
    
    res.json(convertNeo4jDates(result[0].n.properties));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to patch entity' });
  }
});

router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const label = ENTITY_LABEL_MAP[type];
    
    if (!label) {
      return res.status(404).json({ error: `Unknown entity type: ${type}` });
    }
    
    const deleteQuery = `
      MATCH (n:${label} { id: $id })
      DETACH DELETE n
      RETURN count(n) as deletedCount
    `;
    
    const result = await db.executeQuery(deleteQuery, { id }, undefined, true);
    
    if (result[0].deletedCount === 0) {
      return res.status(404).json({ error: `Not found: ${type}/${id}` });
    }
    
    res.json({ message: 'Entity deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to delete entity' });
  }
});

export default router;
