import { Router } from 'express';
import { Neo4jClient } from '../db';
import { getSchemaInfo } from '../db/schema/setup';
import neo4j from 'neo4j-driver';

const router = Router();
const db = Neo4jClient.getInstance();

// Helper function to convert Neo4j dates to ISO strings
function convertNeo4jDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  // Handle strings (including ISO date strings)
  if (typeof obj === 'string') {
    // Handle empty strings
    if (obj.trim() === '') {
      return null;
    }
    
    // Check if string is a valid ISO 8601 date string (e.g., "2025-06-05T00:00:00Z")
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoDatePattern.test(obj)) {
      // Validate that it's actually a valid date
      const date = new Date(obj);
      if (!isNaN(date.getTime())) {
        // Normalize to ISO string format
        return date.toISOString();
      }
    }
    
    // If not a valid ISO date string, return as-is
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    if (!isNaN(obj.getTime())) {
      return obj.toISOString();
    }
    return null;
  }
  
  if (typeof obj === 'object') {
    // Handle Neo4j DateTime objects
    if (obj.year !== undefined && obj.month !== undefined && obj.day !== undefined) {
      const year = typeof obj.year === 'object' ? obj.year.low : obj.year;
      const month = typeof obj.month === 'object' ? obj.month.low : obj.month;
      const day = typeof obj.day === 'object' ? obj.day.low : obj.day;
      const hour = typeof obj.hour === 'object' ? (obj.hour?.low || 0) : (obj.hour || 0);
      const minute = typeof obj.minute === 'object' ? (obj.minute?.low || 0) : (obj.minute || 0);
      const second = typeof obj.second === 'object' ? (obj.second?.low || 0) : (obj.second || 0);
      
      try {
        return new Date(year, month - 1, day, hour, minute, second).toISOString();
      } catch {
        return null;
      }
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

// Helper function to convert seconds to HH:MM:SS format
function formatSecondsToTimestamp(seconds: number): string {
  if (seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

// Helper function to parse HH:MM:SS timestamp to seconds
function parseTimestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid timestamp format. Expected HH:MM:SS');
  }
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid timestamp format. Expected numeric values');
  }
  
  return hours * 3600 + minutes * 60 + seconds;
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
    const result = await db.executeQuery<{ n: { properties: any } }>(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario not found' });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
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
    const result = await db.executeQuery<{ n: { properties: any } }>(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Artista not found' });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
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
    const result = await db.executeQuery<{ n: { properties: any } }>(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Cancion not found' });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
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

// Get the latest Fabrica (by date property)
router.get('/fabricas/latest', async (req, res) => {
  try {
    const query = `
      MATCH (f:Fabrica)
      RETURN f
      ORDER BY f.date DESC
      LIMIT 1
    `;
    
    const result = await db.executeQuery(query);
    
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'No Fabricas found',
        message: 'The database does not contain any Fabricas yet'
      });
    }
    
    const fabrica = convertNeo4jDates((result[0] as any).f.properties);
    res.json(fabrica);
  } catch (error: any) {
    console.error('Error fetching latest Fabrica:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Failed to fetch latest Fabrica'
    });
  }
});

router.get('/fabricas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `MATCH (n:Fabrica {id: $id}) RETURN n`;
    const result = await db.executeQuery<{ n: { properties: any } }>(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Fabrica not found' });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Get all Jingles for a specific Fabrica with timestamps and order
router.get('/fabricas/:id/jingles', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate Fabrica ID
    if (!id || id.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid Fabrica ID',
        message: 'Fabrica ID is required and cannot be empty'
      });
    }
    
    // First check if the Fabrica exists
    const fabricaCheckQuery = `MATCH (f:Fabrica {id: $id}) RETURN f`;
    const fabricaCheck = await db.executeQuery(fabricaCheckQuery, { id: id.trim() });
    
    if (fabricaCheck.length === 0) {
      return res.status(404).json({ 
        error: 'Fabrica not found',
        message: `No Fabrica found with ID: ${id}`,
        fabricaId: id
      });
    }
    
    // Fetch all Jingles that appear in this Fabrica with their timestamps and order
    const query = `
      MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica {id: $id})
      RETURN j {
        .*,
        timestamp: r.timestamp,
        order: r.order
      } AS jingle
      ORDER BY r.order ASC, r.timestamp ASC
    `;
    
    const result = await db.executeQuery(query, { id: id.trim() });
    
    // Check if Fabrica has no Jingles
    if (result.length === 0) {
      return res.json({ 
        jingles: [],
        message: 'This Fabrica has no Jingles yet',
        fabricaId: id
      });
    }
    
    // Convert Neo4j dates and add formatted timestamps
    // Timestamps are now stored as integers (seconds) in the database
    const jingles = result.map((record: any) => {
      const jingle = convertNeo4jDates(record.jingle);
      // Timestamp is already an integer (seconds)
      const timestampSeconds = typeof jingle.timestamp === 'number' ? jingle.timestamp : 0;
      const timestampFormatted = formatSecondsToTimestamp(timestampSeconds);
      
      return {
        ...jingle,
        timestamp: timestampSeconds,
        timestampFormatted
      };
    });
    
    res.json(jingles);
  } catch (error: any) {
    console.error('Error fetching Jingles for Fabrica:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Failed to fetch Jingles for Fabrica'
    });
  }
});

// Get the active Jingle at a specific timestamp for a Fabrica
router.get('/fabricas/:id/jingle-at-time', async (req, res) => {
  try {
    const { id } = req.params;
    const timestampParam = req.query.timestamp as string;
    
    // Validate Fabrica ID
    if (!id || id.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid Fabrica ID',
        message: 'Fabrica ID is required and cannot be empty'
      });
    }
    
    // Validate timestamp parameter
    if (!timestampParam) {
      return res.status(400).json({ 
        error: 'Missing timestamp parameter',
        message: 'Query parameter "timestamp" is required (e.g., ?timestamp=120.5)',
        example: `/api/public/fabricas/${id}/jingle-at-time?timestamp=120`
      });
    }
    
    const timestamp = parseFloat(timestampParam);
    if (isNaN(timestamp)) {
      return res.status(400).json({ 
        error: 'Invalid timestamp format',
        message: 'Timestamp must be a valid number',
        provided: timestampParam,
        example: '120.5'
      });
    }
    
    if (timestamp < 0) {
      return res.status(400).json({ 
        error: 'Invalid timestamp value',
        message: 'Timestamp must be a non-negative number (0 or greater)',
        provided: timestamp
      });
    }
    
    // First check if the Fabrica exists
    const fabricaCheckQuery = `MATCH (f:Fabrica {id: $id}) RETURN f`;
    const fabricaCheck = await db.executeQuery(fabricaCheckQuery, { id: id.trim() });
    
    if (fabricaCheck.length === 0) {
      return res.status(404).json({ 
        error: 'Fabrica not found',
        message: `No Fabrica found with ID: ${id}`,
        fabricaId: id
      });
    }
    
    // Find the active Jingle at the given timestamp
    // Get all jingles and filter in JavaScript
    // Timestamps are now stored as integers (seconds) in the database
    const query = `
      MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica {id: $id})
      RETURN j {
        .*,
        timestamp: r.timestamp,
        order: r.order
      } AS jingle
      ORDER BY r.order ASC, r.timestamp ASC
    `;
    
    const allJingles = await db.executeQuery(query, { id: id.trim() });
    
    if (allJingles.length === 0) {
      return res.status(404).json({ 
        error: 'No Jingles in Fabrica',
        message: 'This Fabrica has no Jingles',
        fabricaId: id
      });
    }
    
    // Convert all jingles with timestamps to seconds for comparison
    // Timestamps are now stored as integers (seconds) in the database
    const jinglesWithSeconds = allJingles.map((record: any) => {
      const jingleData = convertNeo4jDates(record.jingle);
      // Timestamp is already an integer (seconds)
      const timestampInSeconds = typeof jingleData.timestamp === 'number' ? jingleData.timestamp : 0;
      return {
        ...jingleData,
        timestampInSeconds
      };
    });
    
    // Find jingles that start at or before the requested timestamp
    const activeJingles = jinglesWithSeconds.filter((j: any) => j.timestampInSeconds <= timestamp);
    
    if (activeJingles.length === 0) {
      // Timestamp is before the first jingle
      const firstJingle = jinglesWithSeconds[0];
      const firstTimestampSeconds = firstJingle.timestampInSeconds;
      const firstTimestampFormatted = formatSecondsToTimestamp(firstTimestampSeconds);
      
      return res.status(404).json({ 
        error: 'No Jingle found at this timestamp',
        message: `The provided timestamp (${timestamp}s) is before the first Jingle in this Fabrica`,
        requestedTimestamp: timestamp,
        requestedTimestampFormatted: formatSecondsToTimestamp(timestamp),
        firstJingleTimestamp: firstTimestampSeconds,
        firstJingleTimestampFormatted: firstTimestampFormatted,
        fabricaId: id
      });
    }
    
    // Get the last jingle that started before or at the requested timestamp
    const activeJingle = activeJingles[activeJingles.length - 1];
    
    // Format response
    const jingleTimestamp = activeJingle.timestamp;
    const jingleTimestampSeconds = activeJingle.timestampInSeconds;
    const jingleTimestampFormatted = typeof jingleTimestamp === 'string'
      ? jingleTimestamp
      : formatSecondsToTimestamp(jingleTimestampSeconds);
    
    const response = {
      ...activeJingle,
      timestamp: jingleTimestampSeconds,
      timestampFormatted: jingleTimestampFormatted
    };
    
    // Remove the helper field
    delete response.timestampInSeconds;
    
    res.json(response);
  } catch (error: any) {
    console.error('Error fetching Jingle at timestamp:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Failed to fetch Jingle at timestamp'
    });
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
    const result = await db.executeQuery<{ n: { properties: any } }>(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Tematica not found' });
    }
    
    res.json(convertNeo4jDates(result[0].n.properties));
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
    
    // Comprehensive query to fetch Jingle with all relationships
    const query = `
      MATCH (j:Jingle {id: $id})
      
      // Get Fabrica with relationship properties
      OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
      
      // Get Cancion
      OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
      
      // Get Jinglero (Artista who performed the jingle)
      OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(j)
      
      // Get Autor (Artista who wrote the Cancion)
      OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
      
      // Get all Tematicas
      OPTIONAL MATCH (j)-[tagRel:TAGGED_WITH]->(t:Tematica)
      
      RETURN j {
        .*
      } AS jingle,
      f {
        .*,
        timestamp: appearsIn.timestamp,
        order: appearsIn.order
      } AS fabrica,
      c {.*} AS cancion,
      collect(DISTINCT jinglero {.*}) AS jingleros,
      collect(DISTINCT autor {.*}) AS autores,
      collect(DISTINCT t {
        .*,
        isPrimary: tagRel.isPrimary
      }) AS tematicas
    `;
    
    const result = await db.executeQuery(query, { id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Jingle not found' });
    }
    
    const record: any = result[0];
    
    // Build the response object with all relationships
    const response = {
      ...convertNeo4jDates(record.jingle),
      fabrica: record.fabrica ? convertNeo4jDates(record.fabrica) : null,
      cancion: record.cancion ? convertNeo4jDates(record.cancion) : null,
      jingleros: record.jingleros
        ? record.jingleros
            .filter((j: any) => j && j.id)
            .map((j: any) => convertNeo4jDates(j))
        : [],
      autores: record.autores
        ? record.autores
            .filter((a: any) => a && a.id)
            .map((a: any) => convertNeo4jDates(a))
        : [],
      tematicas: record.tematicas
        ? record.tematicas
            .filter((t: any) => t && t.id) // Filter out null entries
            .map((t: any) => convertNeo4jDates(t))
        : []
    };
    
    res.json(response);
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
    
    const result = await db.executeQuery<{ n: { properties: any } }>(query, { id });
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
      'soy_yo': 'SOY_YO',
      'repeats': 'REPEATS'
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
    
    const result = await db.executeQuery<{ outgoing: any[]; incoming: any[] }>(query, { id });
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

// Related entities for Jingle
router.get('/entities/jingles/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100);
    const typesParam = (req.query.types as string) || '';
    const allowed = ['sameJinglero', 'sameCancion', 'sameTematica'] as const;
    const selected = typesParam.split(',').map(s => s.trim()).filter(Boolean);
    const active = (selected.length > 0 ? selected : allowed) as unknown as string[];

    const queries: Array<Promise<any[]>> = [];

    // sameJinglero
    if (active.includes('sameJinglero')) {
      const q1 = `
        MATCH (j:Jingle {id: $jId})<-[:JINGLERO_DE]-(a:Artista)-[:JINGLERO_DE]->(other:Jingle)
        WHERE other.id <> j.id
        RETURN other { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat } AS jingle
        ORDER BY jingle.updatedAt DESC
        LIMIT $limit
      `;
      queries.push(db.executeQuery<any>(q1, { jId: id, limit }));
    } else {
      queries.push(Promise.resolve([]));
    }

    // sameCancion
    if (active.includes('sameCancion')) {
      const q2 = `
        MATCH (j:Jingle {id: $jId})-[:VERSIONA]->(c:Cancion)<-[:VERSIONA]-(other:Jingle)
        WHERE other.id <> j.id
        RETURN other { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat } AS jingle
        ORDER BY jingle.updatedAt DESC
        LIMIT $limit
      `;
      queries.push(db.executeQuery<any>(q2, { jId: id, limit }));
    } else {
      queries.push(Promise.resolve([]));
    }

    // sameTematica
    if (active.includes('sameTematica')) {
      const q3 = `
        MATCH (j:Jingle {id: $jId})-[:TAGGED_WITH]->(t:Tematica)<-[:TAGGED_WITH]-(other:Jingle)
        WHERE other.id <> j.id
        WITH other, collect(DISTINCT t.name) AS sharedTematicas
        RETURN { jingle: other { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat }, sharedTematicas: sharedTematicas } AS rec
        ORDER BY size(sharedTematicas) DESC, rec.jingle.updatedAt DESC
        LIMIT $limit
      `;
      queries.push(db.executeQuery<any>(q3, { jId: id, limit }));
    } else {
      queries.push(Promise.resolve([]));
    }

    const [byJinglero, byCancion, byTematica] = await Promise.all(queries);
    res.json({
      sameJinglero: byJinglero.map(r => convertNeo4jDates(r.jingle)),
      sameCancion: byCancion.map(r => convertNeo4jDates(r.jingle)),
      sameTematica: byTematica.map(r => ({
        jingle: convertNeo4jDates(r.rec?.jingle || r.jingle || r.other || r),
        sharedTematicas: r.rec?.sharedTematicas || r.sharedTematicas || []
      })),
      meta: { limit, types: active }
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Related entities for Cancion
router.get('/entities/canciones/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = neo4j.int(Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100));

    // First verify the Cancion exists and check relationships
    const verifyQuery = `
      MATCH (c:Cancion {id: $cId})
      OPTIONAL MATCH (c)<-[:VERSIONA]-(j:Jingle)
      RETURN c.id AS cancionId, count(j) AS jingleCount, collect(j.id) AS jingleIds
    `;
    const verifyResult = await db.executeQuery<any>(verifyQuery, { cId: id });
    console.log(`[DEBUG] Verification query for CAN-002:`, verifyResult);

    const jinglesUsingCancionQuery = `
      MATCH (c:Cancion {id: $cId})<-[:VERSIONA]-(j:Jingle)
      OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
      RETURN j { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat } AS jingle,
             f { .id, .title, .date, .updatedAt } AS fabrica
      ORDER BY j.updatedAt DESC
      LIMIT $limit
    `;
    const otherCancionesByAutorQuery = `
      MATCH (c:Cancion {id: $cId})<-[:AUTOR_DE]-(au:Artista)-[:AUTOR_DE]->(other:Cancion)
      WHERE other.id <> c.id
      RETURN other { .id, .title, .updatedAt } AS cancion
      ORDER BY other.updatedAt DESC
      LIMIT $limit
    `;
    const jinglesByAutorIfJingleroQuery = `
      MATCH (c:Cancion {id: $cId})<-[:AUTOR_DE]-(a:Artista)-[:JINGLERO_DE]->(j:Jingle)
      RETURN j { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat } AS jingle
      ORDER BY j.updatedAt DESC
      LIMIT $limit
    `;

    const [jinglesUsingCancion, otherCancionesByAutor, jinglesByAutorIfJinglero] = await Promise.all([
      db.executeQuery<any>(jinglesUsingCancionQuery, { cId: id, limit }),
      db.executeQuery<any>(otherCancionesByAutorQuery, { cId: id, limit }),
      db.executeQuery<any>(jinglesByAutorIfJingleroQuery, { cId: id, limit })
    ]);

    // Debug logging
    console.log(`[DEBUG] /entities/canciones/${id}/related - Query results:`, {
      cancionId: id,
      jinglesUsingCancionCount: jinglesUsingCancion.length,
      jinglesUsingCancionRaw: jinglesUsingCancion,
      jinglesUsingCancionFirst: jinglesUsingCancion[0],
      jinglesUsingCancionFirstJingle: jinglesUsingCancion[0]?.jingle,
      otherCancionesByAutorCount: otherCancionesByAutor.length,
      jinglesByAutorIfJingleroCount: jinglesByAutorIfJinglero.length,
    });

    const filteredJingles = jinglesUsingCancion.filter((r: any) => r && r.jingle);
    console.log(`[DEBUG] Filtered jingles count:`, filteredJingles.length);
    // Include fabrica data with each jingle for EntityCard display
    const convertedJingles = filteredJingles.map((r: any) => {
      const jingle = convertNeo4jDates(r.jingle);
      const fabrica = r.fabrica ? convertNeo4jDates(r.fabrica) : null;
      return {
        ...jingle,
        fabrica: fabrica, // Include fabrica in the jingle object for relationshipData
      };
    });
    console.log(`[DEBUG] Converted jingles with fabrica:`, convertedJingles);

    res.json({
      jinglesUsingCancion: convertedJingles,
      otherCancionesByAutor: otherCancionesByAutor
        .filter((r: any) => r && r.cancion)
        .map((r: any) => convertNeo4jDates(r.cancion)),
      jinglesByAutorIfJinglero: jinglesByAutorIfJinglero
        .filter((r: any) => r && r.jingle)
        .map((r: any) => convertNeo4jDates(r.jingle)),
      meta: { limit }
    });
  } catch (error: any) {
    console.error('Error in /entities/canciones/:id/related:', error);
    console.error('Error stack:', error?.stack);
    res.status(500).json({ 
      error: error?.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// Related entities for Artista
router.get('/entities/artistas/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = neo4j.int(Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100));

    // Get Canciones authored by this Artista
    const cancionesByAutorQuery = `
      MATCH (a:Artista {id: $aId})-[:AUTOR_DE]->(c:Cancion)
      RETURN c { .id, .title, .album, .year, .createdAt, .updatedAt } AS cancion
      ORDER BY c.updatedAt DESC
      LIMIT $limit
    `;
    
    // Get Jingles performed by this Artista (as Jinglero) with Fabrica data
    const jinglesByJingleroQuery = `
      MATCH (a:Artista {id: $aId})-[:JINGLERO_DE]->(j:Jingle)
      OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
      RETURN j { .id, .title, .songTitle, .updatedAt, .isJinglazo, .isJinglazoDelDia, .isPrecario, .fabricaId, .fabricaDate, .isLive, .isRepeat } AS jingle,
             f { .id, .title, .date, .updatedAt } AS fabrica
      ORDER BY j.updatedAt DESC
      LIMIT $limit
    `;

    const [cancionesByAutor, jinglesByJinglero] = await Promise.all([
      db.executeQuery<any>(cancionesByAutorQuery, { aId: id, limit }),
      db.executeQuery<any>(jinglesByJingleroQuery, { aId: id, limit })
    ]);

    // Debug logging
    console.log(`[DEBUG] /entities/artistas/${id}/related - Query results:`, {
      artistaId: id,
      jinglesByJingleroCount: jinglesByJinglero.length,
      jinglesByJingleroRaw: jinglesByJinglero,
      jinglesByJingleroFirst: jinglesByJinglero[0],
      cancionesByAutorCount: cancionesByAutor.length,
      cancionesByAutorRaw: cancionesByAutor,
      cancionesByAutorFirst: cancionesByAutor[0],
    });
    
    // Additional debug: Check if relationships exist
    const debugQuery = `
      MATCH (a:Artista {id: $aId})-[r:AUTOR_DE]->(c:Cancion)
      RETURN a.id AS artistaId, c.id AS cancionId, c.title AS cancionTitle, r
      ORDER BY c.updatedAt DESC
    `;
    const debugResults = await db.executeQuery<any>(debugQuery, { aId: id });
    console.log(`[DEBUG] /entities/artistas/${id}/related - Direct relationship check:`, {
      artistaId: id,
      relationshipCount: debugResults.length,
      relationships: debugResults,
    });

    // Include fabrica data with each jingle for EntityCard display
    const filteredJingles = jinglesByJinglero.filter((r: any) => r && r.jingle);
    console.log(`[DEBUG] Filtered jingles count:`, filteredJingles.length);
    const convertedJingles = filteredJingles.map((r: any) => {
      const jingle = convertNeo4jDates(r.jingle);
      const fabrica = r.fabrica ? convertNeo4jDates(r.fabrica) : null;
      return {
        ...jingle,
        fabrica: fabrica, // Include fabrica in the jingle object for relationshipData
      };
    });
    console.log(`[DEBUG] Converted jingles with fabrica:`, convertedJingles);

    res.json({
      cancionesByAutor: cancionesByAutor
        .filter((r: any) => r && r.cancion)
        .map((r: any) => convertNeo4jDates(r.cancion)),
      jinglesByJinglero: convertedJingles,
      meta: { limit }
    });
  } catch (error: any) {
    console.error('Error in /entities/artistas/:id/related:', error);
    console.error('Error stack:', error?.stack);
    res.status(500).json({ 
      error: error?.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// Related entities for Tematica
router.get('/entities/tematicas/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const limitInt = Math.min(Math.max(parseInt((req.query.limit as string) || '50', 10), 1), 200);
    const limit = neo4j.int(limitInt);

    // Get Jingles tagged with this Tematica, including Fabrica data
    // BUG_0012: Get timestamp from APPEARS_IN relationship, not from Jingle node
    const jinglesByTematicaQuery = `
      MATCH (t:Tematica {id: $tId})<-[:TAGGED_WITH]-(j:Jingle)
      OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
      RETURN j { .id, .title, .songTitle, .comment, .createdAt, .updatedAt, .isJinglazo, .isJinglazoDelDia, .isPrecario, .fabricaId, .fabricaDate, .isLive, .isRepeat } AS jingle,
             appearsIn.timestamp AS timestamp,
             f { .id, .title, .date, .updatedAt } AS fabrica
      ORDER BY j.updatedAt DESC
      LIMIT $limit
    `;

    const jinglesByTematica = await db.executeQuery<any>(jinglesByTematicaQuery, { tId: id, limit });

    // Include fabrica data with each jingle for EntityCard display
    // BUG_0012: Include timestamp from APPEARS_IN relationship
    const filteredJingles = jinglesByTematica.filter((r: any) => r && r.jingle);
    const convertedJingles = filteredJingles.map((r: any) => {
      const jingle = convertNeo4jDates(r.jingle);
      const fabrica = r.fabrica ? convertNeo4jDates(r.fabrica) : null;
      return {
        ...jingle,
        timestamp: r.timestamp ?? null, // Include timestamp from APPEARS_IN relationship (may be null)
        fabrica: fabrica, // Include fabrica in the jingle object for relationshipData
      };
    });

    res.json({
      jingles: convertedJingles,
      meta: { limit: limitInt }
    });
  } catch (error: any) {
    console.error('Error in /entities/tematicas/:id/related:', error);
    res.status(500).json({ 
      error: error?.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
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

// Volumetrics endpoint - returns entity counts
router.get('/volumetrics', async (req, res) => {
  try {
    const query = `
      MATCH (f:Fabrica)
      WITH count(f) AS fabricas
      MATCH (j:Jingle)
      WITH fabricas, count(j) AS jingles
      MATCH (c:Cancion)
      WITH fabricas, jingles, count(c) AS canciones
      MATCH (u:Usuario)
      WITH fabricas, jingles, canciones, count(u) AS usuarios
      MATCH (t:Tematica)
      WITH fabricas, jingles, canciones, usuarios, count(t) AS tematicas
      MATCH (a:Artista)
      WITH fabricas, jingles, canciones, usuarios, tematicas, count(a) AS artistas
      OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(:Jingle)
      OPTIONAL MATCH (proveedor:Artista)-[:AUTOR_DE]->(:Cancion)
      RETURN
        fabricas,
        jingles,
        canciones,
        usuarios,
        tematicas,
        artistas,
        count(DISTINCT jinglero) AS jingleros,
        count(DISTINCT proveedor) AS proveedores
    `;
    
    const result = await db.executeQuery(query);
    
    if (result.length === 0) {
      return res.json({
        fabricas: 0,
        jingles: 0,
        canciones: 0,
        usuarios: 0,
        tematicas: 0,
        artistas: 0,
        jingleros: 0,
        proveedores: 0
      });
    }
    
    // Convert Neo4j integers to JavaScript numbers
    const counts = result[0] as any;
    res.json({
      fabricas: typeof counts.fabricas === 'object' && counts.fabricas?.low !== undefined ? counts.fabricas.low : Number(counts.fabricas),
      jingles: typeof counts.jingles === 'object' && counts.jingles?.low !== undefined ? counts.jingles.low : Number(counts.jingles),
      canciones: typeof counts.canciones === 'object' && counts.canciones?.low !== undefined ? counts.canciones.low : Number(counts.canciones),
      usuarios: typeof counts.usuarios === 'object' && counts.usuarios?.low !== undefined ? counts.usuarios.low : Number(counts.usuarios),
      tematicas: typeof counts.tematicas === 'object' && counts.tematicas?.low !== undefined ? counts.tematicas.low : Number(counts.tematicas),
      artistas: typeof counts.artistas === 'object' && counts.artistas?.low !== undefined ? counts.artistas.low : Number(counts.artistas),
      jingleros: typeof counts.jingleros === 'object' && counts.jingleros?.low !== undefined ? counts.jingleros.low : Number(counts.jingleros),
      proveedores: typeof counts.proveedores === 'object' && counts.proveedores?.low !== undefined ? counts.proveedores.low : Number(counts.proveedores)
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

