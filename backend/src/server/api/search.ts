import { Router } from 'express';
import neo4j from 'neo4j-driver';
import { Neo4jClient } from '../db';
import { asyncHandler, BadRequestError } from './core';

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
    
    // Check if string is a valid ISO 8601 date string
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoDatePattern.test(obj)) {
      const date = new Date(obj);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
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

// Simple global search across Jingle, Cancion, Artista, Tematica
// Query param: q
router.get('/', asyncHandler(async (req, res) => {
  const q = (req.query.q as string) || '';
  const limitParam = req.query.limit as string;
  const offsetParam = req.query.offset as string;
  const typesParam = (req.query.types as string) || '';
  const mode = ((req.query.mode as string) || 'basic').toLowerCase(); // 'basic' | 'fulltext'

  if (!q.trim()) {
    return res.json({ jingles: [], canciones: [], artistas: [], tematicas: [], fabricas: [] });
  }

  const limitInt = Math.floor(Math.min(Math.max(parseInt(limitParam || '10', 10), 1), 100));
  const offsetInt = Math.floor(Math.max(parseInt(offsetParam || '0', 10), 0));
  const limit = neo4j.int(limitInt);
  const offset = neo4j.int(offsetInt);

  // allowed types filter: comma-separated among jingles,canciones,artistas,tematicas,fabricas
  const allowed = ['jingles', 'canciones', 'artistas', 'tematicas', 'fabricas'] as const;
  const selected = typesParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const invalid = selected.filter(s => !allowed.includes(s as any));
  if (invalid.length > 0) {
    throw new BadRequestError(`Invalid types: ${invalid.join(', ')}`);
  }
  const active = (selected.length > 0 ? selected : allowed) as unknown as string[];

  const useFullText = mode === 'fulltext';

  if (useFullText) {
    try {
      const queriesFT: Array<Promise<any[]>> = [];
      if (active.includes('jingles')) {
        const qJ = `
          CALL db.index.fulltext.queryNodes('jingle_search', $q) YIELD node, score
          RETURN node { .id, .title, .timestamp, .songTitle, score: score } AS j
          ORDER BY j.score DESC
          SKIP $offset
          LIMIT $limit
        `;
        queriesFT.push(db.executeQuery<any>(qJ, { q, limit, offset }));
      } else { queriesFT.push(Promise.resolve([])); }

      if (active.includes('canciones')) {
        const qC = `
          CALL db.index.fulltext.queryNodes('cancion_search', $q) YIELD node, score
          RETURN node { .id, .title, score: score } AS c
          ORDER BY c.score DESC
          SKIP $offset
          LIMIT $limit
        `;
        queriesFT.push(db.executeQuery<any>(qC, { q, limit, offset }));
      } else { queriesFT.push(Promise.resolve([])); }

      if (active.includes('artistas')) {
        const qA = `
          CALL db.index.fulltext.queryNodes('artista_search', $q) YIELD node, score
          RETURN node { .id, .stageName, .name, score: score } AS a
          ORDER BY a.score DESC
          SKIP $offset
          LIMIT $limit
        `;
        queriesFT.push(db.executeQuery<any>(qA, { q, limit, offset }));
      } else { queriesFT.push(Promise.resolve([])); }

      if (active.includes('tematicas')) {
        const qT = `
          CALL db.index.fulltext.queryNodes('tematica_search', $q) YIELD node, score
          RETURN node { .id, .name, score: score } AS t
          ORDER BY t.score DESC
          SKIP $offset
          LIMIT $limit
        `;
        queriesFT.push(db.executeQuery<any>(qT, { q, limit, offset }));
      } else { queriesFT.push(Promise.resolve([])); }

      // Fabricas don't have a fulltext index, so use basic mode (will be handled below)
      if (active.includes('fabricas')) {
        queriesFT.push(Promise.resolve([]));
      }

      const [jinglesRaw, cancionesRaw, artistasRaw, tematicasRaw, fabricasRaw] = await Promise.all(queriesFT);
      // Extract entity data from nested structure (e.g., { j: { id, title } } -> { id, title })
      // and convert Neo4j dates to ISO strings, and add type field for easier handling in frontend
      const jingles = jinglesRaw.map((r: any) => ({ ...convertNeo4jDates(r.j || r), type: 'jingle' }));
      const canciones = cancionesRaw.map((r: any) => ({ ...convertNeo4jDates(r.c || r), type: 'cancion' }));
      const artistas = artistasRaw.map((r: any) => ({ ...convertNeo4jDates(r.a || r), type: 'artista' }));
      const tematicas = tematicasRaw.map((r: any) => ({ ...convertNeo4jDates(r.t || r), type: 'tematica' }));
      const fabricas = fabricasRaw.map((r: any) => ({ ...convertNeo4jDates(r.f || r), type: 'fabrica' }));
      return res.json({ jingles, canciones, artistas, tematicas, fabricas, meta: { limit: limitInt, offset: offsetInt, types: active, mode: 'fulltext' } });
    } catch (_err) {
      // Fall back to basic mode below
    }
  }

  // Fallback/basic mode: case-insensitive contains
  const text = q.toLowerCase();
  const queries: Array<Promise<any[]>> = [];
  if (active.includes('jingles')) {
    const jinglesQuery = `
      MATCH (j:Jingle)
      WHERE (j.title IS NOT NULL AND j.title <> '' AND toLower(j.title) CONTAINS $text)
         OR (j.songTitle IS NOT NULL AND j.songTitle <> '' AND toLower(j.songTitle) CONTAINS $text)
      RETURN j { .id, .title, .timestamp, .songTitle } AS j
      ORDER BY j.title
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(jinglesQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  if (active.includes('canciones')) {
    const cancionesQuery = `
      MATCH (c:Cancion)
      OPTIONAL MATCH (a:Artista)-[:AUTOR_DE]->(c)
      WITH c, collect(DISTINCT a) AS artistas
      WHERE (c.title IS NOT NULL AND c.title <> '' AND toLower(c.title) CONTAINS $text)
         OR ANY(artista IN artistas WHERE 
                artista IS NOT NULL AND 
                ((artista.stageName IS NOT NULL AND artista.stageName <> '' AND artista.stageName <> 'None' AND toLower(artista.stageName) CONTAINS $text)
                 OR (artista.name IS NOT NULL AND artista.name <> '' AND artista.name <> 'None' AND toLower(artista.name) CONTAINS $text)))
      RETURN DISTINCT c { .id, .title } AS c
      ORDER BY c.title
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(cancionesQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  if (active.includes('artistas')) {
    const artistasQuery = `
      MATCH (a:Artista)
      WHERE (a.stageName IS NOT NULL AND a.stageName <> '' AND a.stageName <> 'None' AND toLower(a.stageName) CONTAINS $text)
         OR (a.name IS NOT NULL AND a.name <> '' AND a.name <> 'None' AND toLower(a.name) CONTAINS $text)
      RETURN a { .id, .stageName, .name } AS a
      ORDER BY a.stageName
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(artistasQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  if (active.includes('tematicas')) {
    const tematicasQuery = `
      MATCH (t:Tematica)
      WHERE t.name IS NOT NULL AND t.name <> '' AND toLower(t.name) CONTAINS $text
      RETURN t { .id, .name } AS t
      ORDER BY t.name
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(tematicasQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  if (active.includes('fabricas')) {
    const fabricasQuery = `
      MATCH (f:Fabrica)
      WHERE f.title IS NOT NULL AND f.title <> '' AND toLower(f.title) CONTAINS $text
      RETURN f { .id, .title, .date } AS f
      ORDER BY f.date DESC
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(fabricasQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  const [jinglesRaw, cancionesRaw, artistasRaw, tematicasRaw, fabricasRaw] = await Promise.all(queries);
  // Extract entity data from nested structure (e.g., { j: { id, title } } -> { id, title })
  // and convert Neo4j dates to ISO strings, and add type field for easier handling in frontend
  const jingles = jinglesRaw.map((r: any) => ({ ...convertNeo4jDates(r.j || r), type: 'jingle' }));
  const canciones = cancionesRaw.map((r: any) => ({ ...convertNeo4jDates(r.c || r), type: 'cancion' }));
  const artistas = artistasRaw.map((r: any) => ({ ...convertNeo4jDates(r.a || r), type: 'artista' }));
  const tematicas = tematicasRaw.map((r: any) => ({ ...convertNeo4jDates(r.t || r), type: 'tematica' }));
  const fabricas = fabricasRaw.map((r: any) => ({ ...convertNeo4jDates(r.f || r), type: 'fabrica' }));
  res.json({ jingles, canciones, artistas, tematicas, fabricas, meta: { limit: limitInt, offset: offsetInt, types: active, mode: 'basic' } });
}));

export default router;
