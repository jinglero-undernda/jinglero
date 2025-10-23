import { Router } from 'express';
import { Neo4jClient } from '../db';
import { getSchemaInfo } from '../db/schema/setup';

const router = Router();
const db = Neo4jClient.getInstance();

// Schema introspection endpoint
router.get('/schema', async (req, res) => {
  try {
    const schemaInfo = await getSchemaInfo();
    res.json(schemaInfo);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Entity endpoints - read-only
router.get('/entities/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
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
    
    const entities = await db.executeQuery(query, { 
      offset: parseInt(offset as string), 
      limit: parseInt(limit as string) 
    });
    
    res.json(entities.map(entity => entity.n));
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
    
    res.json(result[0].n);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Relationship endpoints - read-only
router.get('/relationships/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
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
    
    const relationships = await db.executeQuery(query, { 
      offset: parseInt(offset as string), 
      limit: parseInt(limit as string) 
    });
    
    res.json(relationships.map(rel => rel.r));
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
