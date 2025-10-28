import { Router } from 'express';
import { Neo4jClient } from '../db';
import { getSchemaInfo } from '../db/schema/setup';
import neo4j from 'neo4j-driver';

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

// Schema introspection endpoint
router.get('/schema', async (req, res) => {
  try {
    const schemaInfo = await getSchemaInfo();
    res.json(schemaInfo);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Direct entity endpoints for convenience
router.get('/usuarios', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const query = `
      MATCH (n:Usuario)
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP ${Math.floor(Number(offset) || 0)}
      LIMIT ${Math.floor(Number(limit) || 50)}
    `;
    
    const entities = await db.executeQuery(query);
    
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `MATCH (n:Usuario {id: $id}) RETURN n`;
    const result = await db.executeQuery(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario not found' });
    }
    
    res.json(result[0].n.properties);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/artistas', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const query = `
      MATCH (n:Artista)
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP ${Math.floor(Number(offset) || 0)}
      LIMIT ${Math.floor(Number(limit) || 50)}
    `;
    
    const entities = await db.executeQuery(query);
    
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/artistas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `MATCH (n:Artista {id: $id}) RETURN n`;
    const result = await db.executeQuery(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Artista not found' });
    }
    
    res.json(result[0].n.properties);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/canciones', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const query = `
      MATCH (n:Cancion)
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP ${Math.floor(Number(offset) || 0)}
      LIMIT ${Math.floor(Number(limit) || 50)}
    `;
    
    const entities = await db.executeQuery(query);
    
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/canciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `MATCH (n:Cancion {id: $id}) RETURN n`;
    const result = await db.executeQuery(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Cancion not found' });
    }
    
    res.json(result[0].n.properties);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/fabricas', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const query = `
      MATCH (n:Fabrica)
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP ${Math.floor(Number(offset) || 0)}
      LIMIT ${Math.floor(Number(limit) || 50)}
    `;
    
    const entities = await db.executeQuery(query);
    
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/fabricas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `MATCH (n:Fabrica {id: $id}) RETURN n`;
    const result = await db.executeQuery(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Fabrica not found' });
    }
    
    res.json(result[0].n.properties);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/tematicas', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const query = `
      MATCH (n:Tematica)
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP ${Math.floor(Number(offset) || 0)}
      LIMIT ${Math.floor(Number(limit) || 50)}
    `;
    
    const entities = await db.executeQuery(query);
    
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/tematicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `MATCH (n:Tematica {id: $id}) RETURN n`;
    const result = await db.executeQuery(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Tematica not found' });
    }
    
    res.json(result[0].n.properties);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/jingles', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const query = `
      MATCH (n:Jingle)
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP ${Math.floor(Number(offset) || 0)}
      LIMIT ${Math.floor(Number(limit) || 50)}
    `;
    
    const entities = await db.executeQuery(query);
    
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/jingles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `MATCH (n:Jingle {id: $id}) RETURN n`;
    const result = await db.executeQuery(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Jingle not found' });
    }
    
    res.json(result[0].n.properties);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Entity endpoints - read-only
router.get('/entities/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const limitParam = req.query.limit as string;
    const offsetParam = req.query.offset as string;
    const limit = neo4j.int(parseInt(limitParam, 10) || 50);
    const offset = neo4j.int(parseInt(offsetParam, 10) || 0);
    
    // Validate entity type
    const validTypes = ['usuarios', 'artistas', 'canciones', 'fabricas', 'tematicas', 'jingles'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid entity type: ${type}` });
    }
    
    // Map frontend types to Neo4j labels
    const labelMap: Record<string, string> = {
      usuarios: 'Usuario',
      artistas: 'Artista',
      canciones: 'Cancion',
      fabricas: 'Fabrica',
      tematicas: 'Tematica',
      jingles: 'Jingle'
    };
    
    const label = labelMap[type];
    const query = `
      MATCH (n:${label})
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP $offset
      LIMIT $limit
    `;
    
    const entities = await db.executeQuery(query, { offset, limit });
    
    res.json(entities.map((entity: any) => convertNeo4jDates(entity.n.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/entities/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Validate entity type
    const validTypes = ['usuarios', 'artistas', 'canciones', 'fabricas', 'tematicas', 'jingles'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid entity type: ${type}` });
    }
    
    // Map frontend types to Neo4j labels
    const labelMap: Record<string, string> = {
      usuarios: 'Usuario',
      artistas: 'Artista',
      canciones: 'Cancion',
      fabricas: 'Fabrica',
      tematicas: 'Tematica',
      jingles: 'Jingle'
    };
    
    const label = labelMap[type];
    const query = `
      MATCH (n:${label} { id: $id })
      RETURN n
    `;
    
    const result = await db.executeQuery(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: `${type} not found` });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Relationship endpoints - read-only
router.get('/relationships/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const limit = neo4j.int(parseInt(req.query.limit as string, 10) || 50);
    const offset = neo4j.int(parseInt(req.query.offset as string, 10) || 0);
    
    // Map relationship types
    const relTypeMap: Record<string, string> = {
      'autor_de': 'AUTOR_DE',
      'jinglero_de': 'JINGLERO_DE',
      'appears_in': 'APPEARS_IN',
      'tagged_with': 'TAGGED_WITH',
      'versiona': 'VERSIONA',
      'reacciona_a': 'REACCIONA_A',
      'soy_yo': 'SOY_YO'
    };
    
    const relType = relTypeMap[type];
    if (!relType) {
      return res.status(400).json({ error: `Invalid relationship type: ${type}` });
    }
    
    const query = `
      MATCH ()-[r:${relType}]->()
      RETURN r
      ORDER BY r.createdAt DESC
      SKIP $offset
      LIMIT $limit
    `;
    
    const relationships = await db.executeQuery(query, { offset, limit });
    
    res.json(relationships.map((rel: any) => convertNeo4jDates(rel.r.properties)));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Enhanced entity endpoints with relationships
router.get('/entities/:type/:id/relationships', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Validate entity type
    const validTypes = ['usuarios', 'artistas', 'canciones', 'fabricas', 'tematicas', 'jingles'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid entity type: ${type}` });
    }
    
    // Map frontend types to Neo4j labels
    const labelMap: Record<string, string> = {
      usuarios: 'Usuario',
      artistas: 'Artista',
      canciones: 'Cancion',
      fabricas: 'Fabrica',
      tematicas: 'Tematica',
      jingles: 'Jingle'
    };
    
    const label = labelMap[type];
    
    // Get all relationships for this entity
    const query = `
      MATCH (n:${label} { id: $id })
      OPTIONAL MATCH (n)-[r]->(target)
      OPTIONAL MATCH (source)-[r2]->(n)
      RETURN 
        collect(DISTINCT { 
          type: type(r), 
          direction: 'outgoing', 
          target: target,
          properties: properties(r)
        }) as outgoing,
        collect(DISTINCT { 
          type: type(r2), 
          direction: 'incoming', 
          source: source,
          properties: properties(r2)
        }) as incoming
    `;
    
    const result = await db.executeQuery(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: `${type} not found` });
    }
    
    const relationships = result[0];
    res.json({
      outgoing: relationships.outgoing.filter((r: any) => r.type !== null),
      incoming: relationships.incoming.filter((r: any) => r.type !== null)
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Search endpoint (reuse existing search logic)
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) {
      return res.json({ jingles: [], canciones: [], artistas: [], tematicas: [] });
    }

    const text = q.toLowerCase();

    const jinglesQuery = `
      MATCH (j:Jingle)
      WHERE toLower(coalesce(j.title, '')) CONTAINS $text
         OR toLower(coalesce(j.songTitle, '')) CONTAINS $text
      RETURN j { .id, .title, .timestamp, .songTitle } AS j
      LIMIT 10
    `;

    const cancionesQuery = `
      MATCH (c:Cancion)
      WHERE toLower(coalesce(c.title, '')) CONTAINS $text
      RETURN c { .id, .title } AS c
      LIMIT 10
    `;

    const artistasQuery = `
      MATCH (a:Artista)
      WHERE toLower(coalesce(a.stageName, '')) CONTAINS $text
         OR toLower(coalesce(a.name, '')) CONTAINS $text
      RETURN a { .id, .stageName } AS a
      LIMIT 10
    `;

    const tematicasQuery = `
      MATCH (t:Tematica)
      WHERE toLower(coalesce(t.name, '')) CONTAINS $text
      RETURN t { .id, .name } AS t
      LIMIT 10
    `;

    const [jingles, canciones, artistas, tematicas] = await Promise.all([
      db.executeQuery<any>(jinglesQuery, { text }),
      db.executeQuery<any>(cancionesQuery, { text }),
      db.executeQuery<any>(artistasQuery, { text }),
      db.executeQuery<any>(tematicasQuery, { text }),
    ]);

    res.json({ jingles, canciones, artistas, tematicas });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
