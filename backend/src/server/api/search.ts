import { Router } from 'express';
import neo4j from 'neo4j-driver';
import { Neo4jClient } from '../db';
import { asyncHandler, BadRequestError } from './core';

const router = Router();
const db = Neo4jClient.getInstance();

// Normalize query for fulltext search: remove accents and add prefix wildcard for partial matching
function normalizeQuery(q: string): string {
  // Remove accents (é -> e, á -> a, etc.) using Unicode normalization
  const normalized = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Add prefix wildcard for partial matching (unless query already has operators)
  // Neo4j fulltext uses Lucene syntax - prefix wildcards (beat*) are faster and more reliable than both-side (*beat*)
  if (!normalized.includes('*') && !normalized.includes('?') && !normalized.includes('"')) {
    // Trim whitespace and add prefix wildcard
    const trimmed = normalized.trim();
    if (trimmed.length > 0) {
      // Use prefix wildcard: "beat" becomes "beat*" (matches "beatles", "beat", "beating", etc.)
      // This is more efficient than "*beat*" and works better with tokenization
      return `${trimmed}*`;
    }
  }
  return normalized.trim();
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
// Phase 4: Add excludeWithRelationship filter for cardinality constraints
router.get('/', asyncHandler(async (req, res) => {
  const q = (req.query.q as string) || '';
  const limitParam = req.query.limit as string;
  const offsetParam = req.query.offset as string;
  const typesParam = (req.query.types as string) || '';

  if (!q.trim()) {
    return res.json({ jingles: [], canciones: [], artistas: [], tematicas: [], fabricas: [] });
  }

  const limitInt = Math.floor(Math.min(Math.max(parseInt(limitParam || '100', 10), 1), 100));
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

  // Normalize query for fulltext search (remove accents, add wildcards for partial matching)
  const normalizedQuery = normalizeQuery(q);

  // Fulltext search only
  const queriesFT: Array<Promise<any[]>> = [];
  if (active.includes('jingles')) {
    const qJ = `
      CALL db.index.fulltext.queryNodes('jingle_search', $q) YIELD node, score
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score } AS j
      ORDER BY j.score DESC
      SKIP $offset
      LIMIT $limit
    `;
    queriesFT.push(db.executeQuery<any>(qJ, { q: normalizedQuery, limit, offset }));
  } else { queriesFT.push(Promise.resolve([])); }

  if (active.includes('canciones')) {
    const qC = `
      CALL db.index.fulltext.queryNodes('cancion_search', $q) YIELD node, score
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score } AS c
      ORDER BY c.score DESC
      SKIP $offset
      LIMIT $limit
    `;
    queriesFT.push(db.executeQuery<any>(qC, { q: normalizedQuery, limit, offset }));
  } else { queriesFT.push(Promise.resolve([])); }

  if (active.includes('artistas')) {
    const qA = `
      CALL db.index.fulltext.queryNodes('artista_search', $q) YIELD node, score
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score } AS a
      ORDER BY a.score DESC
      SKIP $offset
      LIMIT $limit
    `;
    queriesFT.push(db.executeQuery<any>(qA, { q: normalizedQuery, limit, offset }));
  } else { queriesFT.push(Promise.resolve([])); }

  if (active.includes('tematicas')) {
    const qT = `
      CALL db.index.fulltext.queryNodes('tematica_search', $q) YIELD node, score
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score } AS t
      ORDER BY t.score DESC
      SKIP $offset
      LIMIT $limit
    `;
    queriesFT.push(db.executeQuery<any>(qT, { q: normalizedQuery, limit, offset }));
  } else { queriesFT.push(Promise.resolve([])); }

  if (active.includes('fabricas')) {
    const qF = `
      CALL db.index.fulltext.queryNodes('fabrica_search', $q) YIELD node, score
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score } AS f
      ORDER BY f.score DESC
      SKIP $offset
      LIMIT $limit
    `;
    queriesFT.push(db.executeQuery<any>(qF, { q: normalizedQuery, limit, offset }));
  } else { queriesFT.push(Promise.resolve([])); }

  const [jinglesRaw, cancionesRaw, artistasRaw, tematicasRaw, fabricasRaw] = await Promise.all(queriesFT);
  // Extract entity data from nested structure and convert Neo4j dates to ISO strings
  // All entities return only display properties: id, displayPrimary, displaySecondary, displayBadges
  const jingles = jinglesRaw.map((r: any) => ({ ...convertNeo4jDates(r.j || r), type: 'jingle' }));
  const canciones = cancionesRaw.map((r: any) => ({ ...convertNeo4jDates(r.c || r), type: 'cancion' }));
  const artistas = artistasRaw.map((r: any) => ({ ...convertNeo4jDates(r.a || r), type: 'artista' }));
  const tematicas = tematicasRaw.map((r: any) => ({ ...convertNeo4jDates(r.t || r), type: 'tematica' }));
  const fabricas = fabricasRaw.map((r: any) => ({ ...convertNeo4jDates(r.f || r), type: 'fabrica' }));
  res.json({ jingles, canciones, artistas, tematicas, fabricas, meta: { limit: limitInt, offset: offsetInt, types: active, mode: 'fulltext' } });
}));

export default router;
