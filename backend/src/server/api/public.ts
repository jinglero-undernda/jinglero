import { Router } from 'express';
import { Neo4jClient } from '../db';
import { getSchemaInfo } from '../db/schema/setup';
import neo4j from 'neo4j-driver';

const router = Router();
const db = Neo4jClient.getInstance();

function sendInternalServerError(res: any, error: any) {
  // eslint-disable-next-line no-console
  console.error('[ERROR] public API error:', error?.stack || error);
  
  // Check for Neo4j authentication errors
  const errorMessage = error?.message || '';
  const errorCode = error?.code || '';
  
  // Detect Neo4j authentication errors
  if (errorMessage.includes('authentication failure') || 
      errorMessage.includes('authentication details') ||
      errorCode.includes('Security.Unauthorized')) {
    const message = process.env.NODE_ENV === 'development'
      ? 'Database authentication failed. Please check NEO4J_PASSWORD and database connection settings.'
      : 'Database connection error. Please contact the administrator.';
    return res.status(503).json({ 
      error: message,
      code: 'DATABASE_AUTH_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
    });
  }
  
  // Detect Neo4j connection errors
  if (errorMessage.includes('ServiceUnavailable') || 
      errorCode.includes('ServiceUnavailable') ||
      errorMessage.includes('connection') && errorMessage.includes('refused')) {
    const message = process.env.NODE_ENV === 'development'
      ? 'Database connection unavailable. The database may be paused or unreachable.'
      : 'Database connection error. Please contact the administrator.';
    return res.status(503).json({ 
      error: message,
      code: 'DATABASE_CONNECTION_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
    });
  }
  
  const message =
    process.env.NODE_ENV === 'development'
      ? (errorMessage || 'Internal Server Error')
      : 'Internal Server Error';
  res.status(500).json({ error: message });
}

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
  // Avoid leaking internal schema details in production.
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }
  try {
    const schemaInfo = await getSchemaInfo();
    res.json(schemaInfo);
  } catch (error: any) {
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
  }
});

router.get('/artistas', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const limitInt = Math.floor(Number(limit) || 50);
    const offsetInt = Math.floor(Number(offset) || 0);
    
    // Enhanced query to include relationship counts
    const query = `
      MATCH (a:Artista)
      OPTIONAL MATCH (a)-[:AUTOR_DE]->(c:Cancion)
      OPTIONAL MATCH (a)-[:JINGLERO_DE]->(j:Jingle)
      WITH a, count(DISTINCT c) AS autorCount, count(DISTINCT j) AS jingleroCount
      RETURN a,
             autorCount,
             jingleroCount
      ORDER BY a.displayPrimary ASC
      SKIP $offset
      LIMIT $limit
    `;
    
    const results = await db.executeQuery(query, { 
      offset: neo4j.int(offsetInt), 
      limit: neo4j.int(limitInt) 
    });
    
    const artistas = results.map((r: any) => {
      const artista = convertNeo4jDates(r.a.properties);
      const autorCount = typeof r.autorCount === 'object' && r.autorCount?.low !== undefined
        ? r.autorCount.low
        : (typeof r.autorCount === 'number' ? r.autorCount : 0);
      const jingleroCount = typeof r.jingleroCount === 'object' && r.jingleroCount?.low !== undefined
        ? r.jingleroCount.low
        : (typeof r.jingleroCount === 'number' ? r.jingleroCount : 0);
      
      return {
        ...artista,
        _metadata: {
          autorCount,
          jingleroCount
        }
      };
    });
    
    res.json(artistas);
  } catch (error: any) {
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
  }
});

router.get('/canciones', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const limitInt = Math.floor(Number(limit) || 50);
    const offsetInt = Math.floor(Number(offset) || 0);
    
    // Enhanced query to include jingle count and autores
    const query = `
      MATCH (c:Cancion)
      OPTIONAL MATCH (c)<-[:VERSIONA]-(j:Jingle)
      OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
      WITH c, count(DISTINCT j) AS jingleCount, collect(DISTINCT autor) AS autores
      RETURN c,
             jingleCount,
             autores
      ORDER BY c.displayPrimary ASC
      SKIP $offset
      LIMIT $limit
    `;
    
    const results = await db.executeQuery(query, { 
      offset: neo4j.int(offsetInt), 
      limit: neo4j.int(limitInt) 
    });
    
    // Process autores to get their counts
    const allAutorIds = new Set<string>();
    results.forEach((r: any) => {
      if (r.autores && Array.isArray(r.autores)) {
        r.autores.forEach((autor: any) => {
          if (autor && autor.id) {
            allAutorIds.add(autor.id);
          }
        });
      }
    });
    
    // Fetch counts for all autores in parallel
    const autorCountsMap = new Map<string, { autorCount: number; jingleroCount: number }>();
    if (allAutorIds.size > 0) {
      const autorIdsArray = Array.from(allAutorIds);
      const autorCountsQuery = `
        UNWIND $autorIds AS autorId
        MATCH (autor:Artista {id: autorId})
        OPTIONAL MATCH (autor)-[:AUTOR_DE]->(autorCancion:Cancion)
        OPTIONAL MATCH (autor)-[:JINGLERO_DE]->(autorJingle:Jingle)
        RETURN autor.id AS autorId,
               count(DISTINCT autorCancion) AS autorCount,
               count(DISTINCT autorJingle) AS jingleroCount
      `;
      const autorCountsResult = await db.executeQuery<any>(autorCountsQuery, { autorIds: autorIdsArray });
      autorCountsResult.forEach((row: any) => {
        const autorCount = typeof row.autorCount === 'object' && row.autorCount?.low !== undefined
          ? row.autorCount.low
          : (typeof row.autorCount === 'number' ? row.autorCount : 0);
        const jingleroCount = typeof row.jingleroCount === 'object' && row.jingleroCount?.low !== undefined
          ? row.jingleroCount.low
          : (typeof row.jingleroCount === 'number' ? row.jingleroCount : 0);
        autorCountsMap.set(row.autorId, { autorCount, jingleroCount });
      });
    }
    
    const canciones = results.map((r: any) => {
      const cancion = convertNeo4jDates(r.c.properties);
      const jingleCount = typeof r.jingleCount === 'object' && r.jingleCount?.low !== undefined
        ? r.jingleCount.low
        : (typeof r.jingleCount === 'number' ? r.jingleCount : 0);
      
      // Process autores with counts from the map
      const autores = (r.autores || [])
        .filter((autor: any) => autor && autor.id)
        .map((autor: any) => {
          const artista = convertNeo4jDates(autor);
          const counts = autorCountsMap.get(artista.id) || { autorCount: 0, jingleroCount: 0 };
          
          return {
            ...artista,
            _metadata: {
              autorCount: counts.autorCount,
              jingleroCount: counts.jingleroCount
            }
          };
        });
      
      return {
        ...cancion,
        _metadata: {
          jingleCount,
          autores: autores.length > 0 ? autores : undefined
        }
      };
    });
    
    res.json(canciones);
  } catch (error: any) {
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
  }
});

// Get the latest Fabrica (by date property)
router.get('/fabricas/latest', async (req, res) => {
  try {
    // Now that all dates are datetime objects, we can use simple Neo4j sorting
    // This is much more efficient - returns only 1 record directly from the database
    const query = `
      MATCH (f:Fabrica)
      WHERE f.date IS NOT NULL
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
    
    // Convert Neo4j dates to ISO strings for the response
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
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
        RETURN other { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat, .displayPrimary, .displaySecondary, .displayBadges } AS jingle
        ORDER BY jingle.displayPrimary ASC
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
        RETURN other { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat, .displayPrimary, .displaySecondary, .displayBadges } AS jingle
        ORDER BY jingle.displayPrimary ASC
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
        RETURN { jingle: other { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat, .displayPrimary, .displaySecondary, .displayBadges }, sharedTematicas: sharedTematicas } AS rec
        ORDER BY rec.jingle.displayPrimary ASC
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
    sendInternalServerError(res, error);
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
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] Verification query for CAN-002:`, verifyResult);
    }
    
    // Get autores for root Cancion with counts
    const autoresQuery = `
      MATCH (c:Cancion {id: $cId})<-[:AUTOR_DE]-(autor:Artista)
      OPTIONAL MATCH (autor)-[:AUTOR_DE]->(autorCancion:Cancion)
      OPTIONAL MATCH (autor)-[:JINGLERO_DE]->(autorJingle:Jingle)
      WITH autor, 
           count(DISTINCT autorCancion) AS autorCount,
           count(DISTINCT autorJingle) AS jingleroCount
      RETURN autor { .id, .stageName, .name, .nationality, .isArg, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS artista,
             autorCount,
             jingleroCount
      ORDER BY autor.displayPrimary ASC
    `;
    const autoresResult = await db.executeQuery<any>(autoresQuery, { cId: id });

    const jinglesUsingCancionQuery = `
      MATCH (c:Cancion {id: $cId})<-[:VERSIONA]-(j:Jingle)
      OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
      RETURN j { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat, .displayPrimary, .displaySecondary, .displayBadges } AS jingle,
             f { .id, .title, .date, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS fabrica
      ORDER BY j.displayPrimary ASC
      LIMIT $limit
    `;
    const otherCancionesByAutorQuery = `
      MATCH (c:Cancion {id: $cId})<-[:AUTOR_DE]-(au:Artista)-[:AUTOR_DE]->(other:Cancion)
      WHERE other.id <> c.id
      OPTIONAL MATCH (other)<-[:VERSIONA]-(j:Jingle)
      OPTIONAL MATCH (other)<-[:AUTOR_DE]-(autor:Artista)
      WITH other, collect(DISTINCT j) AS jingles, collect(DISTINCT autor) AS autores
      RETURN other { .id, .title, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS cancion,
             size(jingles) AS jingleCount,
             autores
      ORDER BY other.updatedAt DESC
      LIMIT $limit
    `;
    const jinglesByAutorIfJingleroQuery = `
      MATCH (c:Cancion {id: $cId})<-[:AUTOR_DE]-(a:Artista)-[:JINGLERO_DE]->(j:Jingle)
      RETURN j { .id, .title, .songTitle, .updatedAt, .fabricaId, .fabricaDate, .isLive, .isRepeat, .displayPrimary, .displaySecondary, .displayBadges } AS jingle
      ORDER BY j.displayPrimary ASC
      LIMIT $limit
    `;

    const [jinglesUsingCancion, otherCancionesByAutor, jinglesByAutorIfJinglero] = await Promise.all([
      db.executeQuery<any>(jinglesUsingCancionQuery, { cId: id, limit }),
      db.executeQuery<any>(otherCancionesByAutorQuery, { cId: id, limit }),
      db.executeQuery<any>(jinglesByAutorIfJingleroQuery, { cId: id, limit })
    ]);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] /entities/canciones/${id}/related - Query results:`, {
      cancionId: id,
      jinglesUsingCancionCount: jinglesUsingCancion.length,
      jinglesUsingCancionRaw: jinglesUsingCancion,
      jinglesUsingCancionFirst: jinglesUsingCancion[0],
      jinglesUsingCancionFirstJingle: jinglesUsingCancion[0]?.jingle,
      otherCancionesByAutorCount: otherCancionesByAutor.length,
      jinglesByAutorIfJingleroCount: jinglesByAutorIfJinglero.length,
      });
    }

    const filteredJingles = jinglesUsingCancion.filter((r: any) => r && r.jingle);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] Filtered jingles count:`, filteredJingles.length);
    }
    // Include fabrica data with each jingle for EntityCard display
    const convertedJingles = filteredJingles.map((r: any) => {
      const jingle = convertNeo4jDates(r.jingle);
      const fabrica = r.fabrica ? convertNeo4jDates(r.fabrica) : null;
      return {
        ...jingle,
        fabrica: fabrica, // Include fabrica in the jingle object for relationshipData
      };
    });
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] Converted jingles with fabrica:`, convertedJingles);
    }

    // Process otherCancionesByAutor with metadata
    // First, get counts for all autores that appear in the results
    const allAutorIds = new Set<string>();
    otherCancionesByAutor.forEach((r: any) => {
      if (r && r.autores && Array.isArray(r.autores)) {
        r.autores.forEach((autor: any) => {
          if (autor && autor.id) {
            allAutorIds.add(autor.id);
          }
        });
      }
    });
    
    // Fetch counts for all autores in parallel
    const autorCountsMap = new Map<string, { autorCount: number; jingleroCount: number }>();
    if (allAutorIds.size > 0) {
      const autorIdsArray = Array.from(allAutorIds);
      const autorCountsQuery = `
        UNWIND $autorIds AS autorId
        MATCH (autor:Artista {id: autorId})
        OPTIONAL MATCH (autor)-[:AUTOR_DE]->(autorCancion:Cancion)
        OPTIONAL MATCH (autor)-[:JINGLERO_DE]->(autorJingle:Jingle)
        RETURN autor.id AS autorId,
               count(DISTINCT autorCancion) AS autorCount,
               count(DISTINCT autorJingle) AS jingleroCount
      `;
      const autorCountsResult = await db.executeQuery<any>(autorCountsQuery, { autorIds: autorIdsArray });
      autorCountsResult.forEach((row: any) => {
        const autorCount = typeof row.autorCount === 'object' && row.autorCount?.low !== undefined
          ? row.autorCount.low
          : (typeof row.autorCount === 'number' ? row.autorCount : 0);
        const jingleroCount = typeof row.jingleroCount === 'object' && row.jingleroCount?.low !== undefined
          ? row.jingleroCount.low
          : (typeof row.jingleroCount === 'number' ? row.jingleroCount : 0);
        autorCountsMap.set(row.autorId, { autorCount, jingleroCount });
      });
    }
    
    const processedOtherCanciones = otherCancionesByAutor
      .filter((r: any) => r && r.cancion)
      .map((r: any) => {
        const cancion = convertNeo4jDates(r.cancion);
        const jingleCount = typeof r.jingleCount === 'object' && r.jingleCount?.low !== undefined 
          ? r.jingleCount.low 
          : (typeof r.jingleCount === 'number' ? r.jingleCount : 0);
        
        // Process autores with counts from the map
        const autores = (r.autores || [])
          .filter((autor: any) => autor && autor.id)
          .map((autor: any) => {
            const artista = convertNeo4jDates(autor);
            const counts = autorCountsMap.get(artista.id) || { autorCount: 0, jingleroCount: 0 };
            
            return {
              ...artista,
              _metadata: {
                autorCount: counts.autorCount,
                jingleroCount: counts.jingleroCount
              }
            };
          });
        
        return {
          ...cancion,
          _metadata: {
            jingleCount,
            autores: autores.length > 0 ? autores : undefined
          }
        };
      });

    // Process autores for root Cancion
    const processedAutores = autoresResult.map((r: any) => {
      const artista = convertNeo4jDates(r.artista);
      const autorCount = typeof r.autorCount === 'object' && r.autorCount?.low !== undefined
        ? r.autorCount.low
        : (typeof r.autorCount === 'number' ? r.autorCount : 0);
      const jingleroCount = typeof r.jingleroCount === 'object' && r.jingleroCount?.low !== undefined
        ? r.jingleroCount.low
        : (typeof r.jingleroCount === 'number' ? r.jingleroCount : 0);
      
      return {
        ...artista,
        _metadata: {
          autorCount,
          jingleroCount
        }
      };
    });

    // Get root jingleCount from verifyResult
    const rootJingleCount = verifyResult.length > 0 
      ? (typeof verifyResult[0].jingleCount === 'object' && verifyResult[0].jingleCount?.low !== undefined
          ? verifyResult[0].jingleCount.low
          : (typeof verifyResult[0].jingleCount === 'number' ? verifyResult[0].jingleCount : 0))
      : 0;

    res.json({
      jinglesUsingCancion: convertedJingles,
      otherCancionesByAutor: processedOtherCanciones,
      jinglesByAutorIfJinglero: jinglesByAutorIfJinglero
        .filter((r: any) => r && r.jingle)
        .map((r: any) => convertNeo4jDates(r.jingle)),
      autores: processedAutores,
      meta: { 
        limit,
        jingleCount: rootJingleCount
      }
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

    // Get Canciones authored by this Artista with counts
    const cancionesByAutorQuery = `
      MATCH (a:Artista {id: $aId})-[:AUTOR_DE]->(c:Cancion)
      OPTIONAL MATCH (c)<-[:VERSIONA]-(j:Jingle)
      OPTIONAL MATCH (c)<-[:AUTOR_DE]-(autor:Artista)
      WITH c, collect(DISTINCT j) AS jingles, collect(DISTINCT autor) AS autores
      RETURN c { .id, .title, .album, .year, .createdAt, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS cancion,
             size(jingles) AS jingleCount,
             autores
      ORDER BY c.displayPrimary ASC
      LIMIT $limit
    `;
    
    // Get Jingles performed by this Artista (as Jinglero) with Fabrica data
    const jinglesByJingleroQuery = `
      MATCH (a:Artista {id: $aId})-[:JINGLERO_DE]->(j:Jingle)
      OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
      RETURN j { .id, .title, .songTitle, .updatedAt, .isJinglazo, .isJinglazoDelDia, .isPrecario, .fabricaId, .fabricaDate, .isLive, .isRepeat, .displayPrimary, .displaySecondary, .displayBadges } AS jingle,
             f { .id, .title, .date, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS fabrica
      ORDER BY j.displayPrimary ASC
      LIMIT $limit
    `;

    // Get counts for root Artista
    const rootCountsQuery = `
      MATCH (a:Artista {id: $aId})
      OPTIONAL MATCH (a)-[:AUTOR_DE]->(c:Cancion)
      OPTIONAL MATCH (a)-[:JINGLERO_DE]->(j:Jingle)
      RETURN count(DISTINCT c) AS autorCount, count(DISTINCT j) AS jingleroCount
    `;
    
    const [cancionesByAutor, jinglesByJinglero, rootCounts] = await Promise.all([
      db.executeQuery<any>(cancionesByAutorQuery, { aId: id, limit }),
      db.executeQuery<any>(jinglesByJingleroQuery, { aId: id, limit }),
      db.executeQuery<any>(rootCountsQuery, { aId: id })
    ]);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] /entities/artistas/${id}/related - Query results:`, {
      artistaId: id,
      jinglesByJingleroCount: jinglesByJinglero.length,
      jinglesByJingleroRaw: jinglesByJinglero,
      jinglesByJingleroFirst: jinglesByJinglero[0],
      cancionesByAutorCount: cancionesByAutor.length,
      cancionesByAutorRaw: cancionesByAutor,
      cancionesByAutorFirst: cancionesByAutor[0],
      });
    }
    
    // Additional debug: Check if relationships exist
    const debugQuery = `
      MATCH (a:Artista {id: $aId})-[r:AUTOR_DE]->(c:Cancion)
      RETURN a.id AS artistaId, c.id AS cancionId, c.title AS cancionTitle, r
      ORDER BY c.displayPrimary ASC
    `;
    const debugResults = await db.executeQuery<any>(debugQuery, { aId: id });
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] /entities/artistas/${id}/related - Direct relationship check:`, {
      artistaId: id,
      relationshipCount: debugResults.length,
      relationships: debugResults,
      });
    }

    // Include fabrica data with each jingle for EntityCard display
    const filteredJingles = jinglesByJinglero.filter((r: any) => r && r.jingle);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] Filtered jingles count:`, filteredJingles.length);
    }
    const convertedJingles = filteredJingles.map((r: any) => {
      const jingle = convertNeo4jDates(r.jingle);
      const fabrica = r.fabrica ? convertNeo4jDates(r.fabrica) : null;
      return {
        ...jingle,
        fabrica: fabrica, // Include fabrica in the jingle object for relationshipData
      };
    });
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] Converted jingles with fabrica:`, convertedJingles);
    }

    // Process cancionesByAutor with metadata
    // First, get counts for all autores that appear in the results
    const allAutorIdsArtista = new Set<string>();
    cancionesByAutor.forEach((r: any) => {
      if (r && r.autores && Array.isArray(r.autores)) {
        r.autores.forEach((autor: any) => {
          if (autor && autor.id) {
            allAutorIdsArtista.add(autor.id);
          }
        });
      }
    });
    
    // Fetch counts for all autores in parallel
    const autorCountsMapArtista = new Map<string, { autorCount: number; jingleroCount: number }>();
    if (allAutorIdsArtista.size > 0) {
      const autorIdsArray = Array.from(allAutorIdsArtista);
      const autorCountsQuery = `
        UNWIND $autorIds AS autorId
        MATCH (autor:Artista {id: autorId})
        OPTIONAL MATCH (autor)-[:AUTOR_DE]->(autorCancion:Cancion)
        OPTIONAL MATCH (autor)-[:JINGLERO_DE]->(autorJingle:Jingle)
        RETURN autor.id AS autorId,
               count(DISTINCT autorCancion) AS autorCount,
               count(DISTINCT autorJingle) AS jingleroCount
      `;
      const autorCountsResult = await db.executeQuery<any>(autorCountsQuery, { autorIds: autorIdsArray });
      autorCountsResult.forEach((row: any) => {
        const autorCount = typeof row.autorCount === 'object' && row.autorCount?.low !== undefined
          ? row.autorCount.low
          : (typeof row.autorCount === 'number' ? row.autorCount : 0);
        const jingleroCount = typeof row.jingleroCount === 'object' && row.jingleroCount?.low !== undefined
          ? row.jingleroCount.low
          : (typeof row.jingleroCount === 'number' ? row.jingleroCount : 0);
        autorCountsMapArtista.set(row.autorId, { autorCount, jingleroCount });
      });
    }
    
    const processedCanciones = cancionesByAutor
      .filter((r: any) => r && r.cancion)
      .map((r: any) => {
        const cancion = convertNeo4jDates(r.cancion);
        const jingleCount = typeof r.jingleCount === 'object' && r.jingleCount?.low !== undefined 
          ? r.jingleCount.low 
          : (typeof r.jingleCount === 'number' ? r.jingleCount : 0);
        
        // Process autores with counts from the map
        const autores = (r.autores || [])
          .filter((autor: any) => autor && autor.id)
          .map((autor: any) => {
            const artista = convertNeo4jDates(autor);
            const counts = autorCountsMapArtista.get(artista.id) || { autorCount: 0, jingleroCount: 0 };
            
            return {
              ...artista,
              _metadata: {
                autorCount: counts.autorCount,
                jingleroCount: counts.jingleroCount
              }
            };
          });
        
        return {
          ...cancion,
          _metadata: {
            jingleCount,
            autores: autores.length > 0 ? autores : undefined
          }
        };
      });

    // Get root counts
    const rootAutorCount = rootCounts.length > 0
      ? (typeof rootCounts[0].autorCount === 'object' && rootCounts[0].autorCount?.low !== undefined
          ? rootCounts[0].autorCount.low
          : (typeof rootCounts[0].autorCount === 'number' ? rootCounts[0].autorCount : 0))
      : 0;
    const rootJingleroCount = rootCounts.length > 0
      ? (typeof rootCounts[0].jingleroCount === 'object' && rootCounts[0].jingleroCount?.low !== undefined
          ? rootCounts[0].jingleroCount.low
          : (typeof rootCounts[0].jingleroCount === 'number' ? rootCounts[0].jingleroCount : 0))
      : 0;

    res.json({
      cancionesByAutor: processedCanciones,
      jinglesByJinglero: convertedJingles,
      meta: { 
        limit,
        autorCount: rootAutorCount,
        jingleroCount: rootJingleroCount
      }
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

    // Get Jingles tagged with this Tematica, including Fabrica, Cancion, and Artista data
    // BUG_0012: Get timestamp from APPEARS_IN relationship, not from Jingle node
    const jinglesByTematicaQuery = `
      MATCH (t:Tematica {id: $tId})<-[:TAGGED_WITH]-(j:Jingle)
      OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
      OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
      OPTIONAL MATCH (c)<-[:AUTOR_DE]-(autor:Artista)
      OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(j)
      WITH j, appearsIn.timestamp AS timestamp, f, c, 
           collect(DISTINCT autor { .id, .stageName, .name, .nationality, .isArg, .updatedAt }) AS autores,
           collect(DISTINCT jinglero { .id, .stageName, .name, .nationality, .isArg, .updatedAt }) AS jingleros
      RETURN j { .id, .title, .songTitle, .comment, .autoComment, .createdAt, .updatedAt, .isJinglazo, .isJinglazoDelDia, .isPrecario, .fabricaId, .fabricaDate, .isLive, .isRepeat, .displayPrimary, .displaySecondary, .displayBadges } AS jingle,
             timestamp,
             f { .id, .title, .date, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS fabrica,
             c { .id, .title, .album, .year, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS cancion,
             autores,
             jingleros
      ORDER BY j.displayPrimary ASC
      LIMIT $limit
    `;

    const jinglesByTematica = await db.executeQuery<any>(jinglesByTematicaQuery, { tId: id, limit });

    // Include fabrica, cancion, and artista data with each jingle for EntityCard display
    // BUG_0012: Include timestamp from APPEARS_IN relationship
    const filteredJingles = jinglesByTematica.filter((r: any) => r && r.jingle);
    const convertedJingles = filteredJingles.map((r: any) => {
      const jingle = convertNeo4jDates(r.jingle);
      const fabrica = r.fabrica ? convertNeo4jDates(r.fabrica) : null;
      const cancion = r.cancion ? convertNeo4jDates(r.cancion) : null;
      const autores = (r.autores || []).filter((a: any) => a && a.id).map((a: any) => convertNeo4jDates(a));
      const jingleros = (r.jingleros || []).filter((a: any) => a && a.id).map((a: any) => convertNeo4jDates(a));
      
      return {
        ...jingle,
        timestamp: r.timestamp ?? null, // Include timestamp from APPEARS_IN relationship (may be null)
        fabrica: fabrica, // Include fabrica in the jingle object for relationshipData
        _metadata: {
          cancion: cancion || undefined,
          autores: autores.length > 0 ? autores : undefined,
          jingleros: jingleros.length > 0 ? jingleros : undefined
        }
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
      return res.json({ jingles: [], canciones: [], artistas: [], tematicas: [], fabricas: [] });
    }

    const text = q.toLowerCase();

    // Enhanced jingles query with relationship data
    const jinglesQuery = `
      MATCH (j:Jingle)
      WHERE toLower(coalesce(j.title, '')) CONTAINS $text
         OR toLower(coalesce(j.songTitle, '')) CONTAINS $text
         OR toLower(coalesce(j.comment, '')) CONTAINS $text
         OR toLower(coalesce(j.autoComment, '')) CONTAINS $text
      OPTIONAL MATCH (j)-[:APPEARS_IN]->(f:Fabrica)
      OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
      OPTIONAL MATCH (j)<-[:JINGLERO_DE]-(jinglero:Artista)
      OPTIONAL MATCH (c)<-[:AUTOR_DE]-(autor:Artista)
      WITH j, f, c, collect(DISTINCT jinglero) AS jingleros, collect(DISTINCT autor) AS autores
      RETURN j { .id, .title, .timestamp, .songTitle, .fabricaId, .fabricaDate, .isJinglazo, .isJinglazoDelDia, .isPrecario, .isLive, .isRepeat, .autoComment, .displayPrimary, .displaySecondary, .displayBadges } AS jingle,
             f { .id, .title, .date, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS fabrica,
             c { .id, .title, .album, .year, .displayPrimary, .displaySecondary, .displayBadges } AS cancion,
             jingleros,
             autores
      LIMIT 10
    `;

    // Enhanced canciones query with jingle count and autores
    const cancionesQuery = `
      MATCH (c:Cancion)
      WHERE toLower(coalesce(c.title, '')) CONTAINS $text
      OPTIONAL MATCH (c)<-[:VERSIONA]-(j:Jingle)
      OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
      WITH c, count(DISTINCT j) AS jingleCount, collect(DISTINCT autor) AS autores
      RETURN c { .id, .title, .album, .year, .createdAt, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS cancion,
             jingleCount,
             autores
      LIMIT 10
    `;

    // Enhanced artistas query with relationship counts
    const artistasQuery = `
      MATCH (a:Artista)
      WHERE toLower(coalesce(a.stageName, '')) CONTAINS $text
         OR toLower(coalesce(a.name, '')) CONTAINS $text
      OPTIONAL MATCH (a)-[:AUTOR_DE]->(c:Cancion)
      OPTIONAL MATCH (a)-[:JINGLERO_DE]->(j:Jingle)
      WITH a, count(DISTINCT c) AS autorCount, count(DISTINCT j) AS jingleroCount
      RETURN a { .id, .stageName, .name, .nationality, .isArg, .createdAt, .updatedAt, .displayPrimary, .displaySecondary, .displayBadges } AS artista,
             autorCount,
             jingleroCount
      LIMIT 10
    `;

    const tematicasQuery = `
      MATCH (t:Tematica)
      WHERE toLower(coalesce(t.name, '')) CONTAINS $text
      RETURN t { .id, .name, .displayPrimary, .displaySecondary, .displayBadges } AS t
      LIMIT 10
    `;

    const [jingles, cancionesResults, artistasResults, tematicas] = await Promise.all([
      db.executeQuery<any>(jinglesQuery, { text }),
      db.executeQuery<any>(cancionesQuery, { text }),
      db.executeQuery<any>(artistasQuery, { text }),
      db.executeQuery<any>(tematicasQuery, { text }),
    ]);

    // Process canciones with metadata
    const allAutorIds = new Set<string>();
    cancionesResults.forEach((r: any) => {
      if (r.autores && Array.isArray(r.autores)) {
        r.autores.forEach((autor: any) => {
          if (autor && autor.id) {
            allAutorIds.add(autor.id);
          }
        });
      }
    });

    // Fetch counts for all autores
    const autorCountsMap = new Map<string, { autorCount: number; jingleroCount: number }>();
    if (allAutorIds.size > 0) {
      const autorIdsArray = Array.from(allAutorIds);
      const autorCountsQuery = `
        UNWIND $autorIds AS autorId
        MATCH (autor:Artista {id: autorId})
        OPTIONAL MATCH (autor)-[:AUTOR_DE]->(autorCancion:Cancion)
        OPTIONAL MATCH (autor)-[:JINGLERO_DE]->(autorJingle:Jingle)
        RETURN autor.id AS autorId,
               count(DISTINCT autorCancion) AS autorCount,
               count(DISTINCT autorJingle) AS jingleroCount
      `;
      const autorCountsResult = await db.executeQuery<any>(autorCountsQuery, { autorIds: autorIdsArray });
      autorCountsResult.forEach((row: any) => {
        const autorCount = typeof row.autorCount === 'object' && row.autorCount?.low !== undefined
          ? row.autorCount.low
          : (typeof row.autorCount === 'number' ? row.autorCount : 0);
        const jingleroCount = typeof row.jingleroCount === 'object' && row.jingleroCount?.low !== undefined
          ? row.jingleroCount.low
          : (typeof row.jingleroCount === 'number' ? row.jingleroCount : 0);
        autorCountsMap.set(row.autorId, { autorCount, jingleroCount });
      });
    }

    const canciones = cancionesResults.map((r: any) => {
      const cancion = convertNeo4jDates(r.cancion);
      const jingleCount = typeof r.jingleCount === 'object' && r.jingleCount?.low !== undefined
        ? r.jingleCount.low
        : (typeof r.jingleCount === 'number' ? r.jingleCount : 0);
      
      const autores = (r.autores || [])
        .filter((autor: any) => autor && autor.id)
        .map((autor: any) => {
          const artista = convertNeo4jDates(autor);
          const counts = autorCountsMap.get(artista.id) || { autorCount: 0, jingleroCount: 0 };
          
          return {
            ...artista,
            _metadata: {
              autorCount: counts.autorCount,
              jingleroCount: counts.jingleroCount
            }
          };
        });
      
      return {
        ...cancion,
        _metadata: {
          jingleCount,
          autores: autores.length > 0 ? autores : undefined
        }
      };
    });

    // Process artistas with metadata
    const artistas = artistasResults.map((r: any) => {
      const artista = convertNeo4jDates(r.artista);
      const autorCount = typeof r.autorCount === 'object' && r.autorCount?.low !== undefined
        ? r.autorCount.low
        : (typeof r.autorCount === 'number' ? r.autorCount : 0);
      const jingleroCount = typeof r.jingleroCount === 'object' && r.jingleroCount?.low !== undefined
        ? r.jingleroCount.low
        : (typeof r.jingleroCount === 'number' ? r.jingleroCount : 0);
      
      return {
        ...artista,
        _metadata: {
          autorCount,
          jingleroCount
        }
      };
    });

    // Process jingles with metadata
    // First, get counts for all autores that appear in jingles
    const allJingleAutorIds = new Set<string>();
    jingles.forEach((r: any) => {
      if (r.autores && Array.isArray(r.autores)) {
        r.autores.forEach((autor: any) => {
          if (autor && autor.id) {
            allJingleAutorIds.add(autor.id);
          }
        });
      }
    });
    
    // Fetch counts for all autores in jingles
    const jingleAutorCountsMap = new Map<string, { autorCount: number; jingleroCount: number }>();
    if (allJingleAutorIds.size > 0) {
      const autorIdsArray = Array.from(allJingleAutorIds);
      const autorCountsQuery = `
        UNWIND $autorIds AS autorId
        MATCH (autor:Artista {id: autorId})
        OPTIONAL MATCH (autor)-[:AUTOR_DE]->(autorCancion:Cancion)
        OPTIONAL MATCH (autor)-[:JINGLERO_DE]->(autorJingle:Jingle)
        RETURN autor.id AS autorId,
               count(DISTINCT autorCancion) AS autorCount,
               count(DISTINCT autorJingle) AS jingleroCount
      `;
      const autorCountsResult = await db.executeQuery<any>(autorCountsQuery, { autorIds: autorIdsArray });
      autorCountsResult.forEach((row: any) => {
        const autorCount = typeof row.autorCount === 'object' && row.autorCount?.low !== undefined
          ? row.autorCount.low
          : (typeof row.autorCount === 'number' ? row.autorCount : 0);
        const jingleroCount = typeof row.jingleroCount === 'object' && row.jingleroCount?.low !== undefined
          ? row.jingleroCount.low
          : (typeof row.jingleroCount === 'number' ? row.jingleroCount : 0);
        jingleAutorCountsMap.set(row.autorId, { autorCount, jingleroCount });
      });
    }
    
    // Get counts for all jingleros
    const allJingleroIds = new Set<string>();
    jingles.forEach((r: any) => {
      if (r.jingleros && Array.isArray(r.jingleros)) {
        r.jingleros.forEach((jinglero: any) => {
          if (jinglero && jinglero.id) {
            allJingleroIds.add(jinglero.id);
          }
        });
      }
    });
    
    const jingleroCountsMap = new Map<string, { autorCount: number; jingleroCount: number }>();
    if (allJingleroIds.size > 0) {
      const jingleroIdsArray = Array.from(allJingleroIds);
      const jingleroCountsQuery = `
        UNWIND $jingleroIds AS jingleroId
        MATCH (jinglero:Artista {id: jingleroId})
        OPTIONAL MATCH (jinglero)-[:AUTOR_DE]->(jingleroCancion:Cancion)
        OPTIONAL MATCH (jinglero)-[:JINGLERO_DE]->(jingleroJingle:Jingle)
        RETURN jinglero.id AS jingleroId,
               count(DISTINCT jingleroCancion) AS autorCount,
               count(DISTINCT jingleroJingle) AS jingleroCount
      `;
      const jingleroCountsResult = await db.executeQuery<any>(jingleroCountsQuery, { jingleroIds: jingleroIdsArray });
      jingleroCountsResult.forEach((row: any) => {
        const autorCount = typeof row.autorCount === 'object' && row.autorCount?.low !== undefined
          ? row.autorCount.low
          : (typeof row.autorCount === 'number' ? row.autorCount : 0);
        const jingleroCount = typeof row.jingleroCount === 'object' && row.jingleroCount?.low !== undefined
          ? row.jingleroCount.low
          : (typeof row.jingleroCount === 'number' ? row.jingleroCount : 0);
        jingleroCountsMap.set(row.jingleroId, { autorCount, jingleroCount });
      });
    }
    
    const processedJingles = jingles
      .filter((r: any) => r && r.jingle)
      .map((r: any) => {
        const jingle = convertNeo4jDates(r.jingle);
        const fabrica = r.fabrica ? convertNeo4jDates(r.fabrica) : null;
        const cancion = r.cancion ? convertNeo4jDates(r.cancion) : null;
        
        // Process autores with counts
        const autores = (r.autores || [])
          .filter((autor: any) => autor && autor.id)
          .map((autor: any) => {
            const artista = convertNeo4jDates(autor);
            const counts = jingleAutorCountsMap.get(artista.id) || { autorCount: 0, jingleroCount: 0 };
            
            return {
              ...artista,
              _metadata: {
                autorCount: counts.autorCount,
                jingleroCount: counts.jingleroCount
              }
            };
          });
        
        // Process jingleros with counts
        const jingleros = (r.jingleros || [])
          .filter((jinglero: any) => jinglero && jinglero.id)
          .map((jinglero: any) => {
            const artista = convertNeo4jDates(jinglero);
            const counts = jingleroCountsMap.get(artista.id) || { autorCount: 0, jingleroCount: 0 };
            
            return {
              ...artista,
              _metadata: {
                autorCount: counts.autorCount,
                jingleroCount: counts.jingleroCount
              }
            };
          });
        
        return {
          ...jingle,
          _metadata: {
            fabrica: fabrica || undefined,
            cancion: cancion || undefined,
            autores: autores.length > 0 ? autores : undefined,
            jingleros: jingleros.length > 0 ? jingleros : undefined
          }
        };
      });
    
    // Process tematicas (convert to array format)
    const processedTematicas = tematicas.map((r: any) => convertNeo4jDates(r.t));

    res.json({ 
      jingles: processedJingles, 
      canciones, 
      artistas, 
      tematicas: processedTematicas,
      fabricas: [] // Search doesn't currently support fabricas
    });
  } catch (error: any) {
    sendInternalServerError(res, error);
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
    sendInternalServerError(res, error);
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

