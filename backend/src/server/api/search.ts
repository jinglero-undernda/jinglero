import { Router } from 'express';
import neo4j from 'neo4j-driver';
import { Neo4jClient } from '../db';
import { asyncHandler, BadRequestError } from './core';

const router = Router();

function getDb() {
  // Lazily initialize so importing this module in unit tests doesn't require DB env vars.
  return Neo4jClient.getInstance();
}

function stripAccents(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

// Lucene special chars that should be escaped when treating input as "plain text".
// We intentionally do NOT include '*' and '?' here because we add '*' ourselves for prefix queries.
function escapeLuceneTerm(input: string): string {
  // From Lucene query parser reserved chars: + - && || ! ( ) { } [ ] ^ " ~ * ? : \ /
  // We escape everything except '*' and '?' (see note above).
  return input.replace(/([+\-!(){}[\]^"~:\\/]|&&|\|\|)/g, '\\$1');
}

function looksAdvancedLucene(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (s.includes('"')) return true;
  if (/[?*:^~()[\]{}\\]/.test(s)) return true;
  if (/(^|\s)[+\-]\S+/.test(s)) return true; // +required / -prohibited
  // Keep case: Lucene boolean operators are typically uppercase.
  if (/(^|\s)(AND|OR|NOT)(\s|$)/.test(s)) return true;
  if (s.includes('&&') || s.includes('||')) return true;
  return false;
}

export type FulltextQueryPlan =
  | { kind: 'advanced'; query: string }
  | { kind: 'single'; query: string }
  | { kind: 'multi'; phraseQuery: string; andQuery: string };

/**
 * Builds fulltext query strings with these semantics:
 * - If query looks like "advanced Lucene", preserve it (only accent-normalize + trim).
 * - If plain text:
 *   - single token -> token*
 *   - multiple tokens -> phrase-first: "t1 t2", fallback AND: +t1* +t2*
 */
export function buildFulltextQueryPlan(rawQuery: string): FulltextQueryPlan {
  const raw = collapseWhitespace(rawQuery);
  if (!raw) return { kind: 'single', query: '' };

  if (looksAdvancedLucene(raw)) {
    // Preserve operators/case; only normalize accents.
    return { kind: 'advanced', query: collapseWhitespace(stripAccents(raw)) };
  }

  const normalized = collapseWhitespace(stripAccents(raw)).toLowerCase();
  const tokens = normalized
    .split(' ')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => escapeLuceneTerm(t));

  if (tokens.length <= 1) {
    const t = tokens[0] || '';
    return { kind: 'single', query: t ? `${t}*` : '' };
  }

  // Phrase query: do not add wildcards; escape quotes/backslashes by virtue of token escaping above.
  const phraseQuery = `"${tokens.join(' ')}"`;
  const andQuery = tokens.map((t) => `+${t}*`).join(' ');
  return { kind: 'multi', phraseQuery, andQuery };
}

function isMissingFulltextIndexError(error: unknown): boolean {
  const message = String((error as any)?.message || '');
  return (
    message.includes('There is no such fulltext schema index') ||
    message.includes('no such fulltext schema index')
  );
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
  const db = getDb();
  const q = (req.query.q as string) || '';
  const limitParam = req.query.limit as string;
  const offsetParam = req.query.offset as string;
  const typesParam = (req.query.types as string) || '';

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

  const plan = buildFulltextQueryPlan(q);
  const fallbackNorm = collapseWhitespace(stripAccents(q)).toLowerCase();
  const fallbackTokens = collapseWhitespace(stripAccents(q))
    .toLowerCase()
    .split(' ')
    .map((t) => t.trim())
    .filter(Boolean);

  async function runFulltext(indexName: string, query: string, alias: string) {
    const cypher = `
      CALL db.index.fulltext.queryNodes('${indexName}', $q) YIELD node, score
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score } AS ${alias}
      ORDER BY ${alias}.score DESC
      SKIP $offset
      LIMIT $limit
    `;
    return db.executeQuery<any>(cypher, { q: query, limit, offset });
  }

  async function runBasicContains(label: string, alias: string, contains: string) {
    const cypher = `
      MATCH (node:${label})
      WHERE node.normSearch IS NOT NULL AND node.normSearch CONTAINS $contains
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: 1.0 } AS ${alias}
      ORDER BY ${alias}.displayPrimary ASC
      SKIP $offset
      LIMIT $limit
    `;
    return db.executeQuery<any>(cypher, { contains, limit, offset });
  }

  async function runBasicAllTokens(label: string, alias: string, tokens: string[]) {
    const cypher = `
      MATCH (node:${label})
      WHERE node.normSearch IS NOT NULL AND ALL(t IN $tokens WHERE node.normSearch CONTAINS t)
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: 1.0 } AS ${alias}
      ORDER BY ${alias}.displayPrimary ASC
      SKIP $offset
      LIMIT $limit
    `;
    return db.executeQuery<any>(cypher, { tokens, limit, offset });
  }

  async function runGetAll(label: string, alias: string) {
    const cypher = `
      MATCH (node:${label})
      RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: 1.0 } AS ${alias}
      ORDER BY ${alias}.displayPrimary ASC
      SKIP $offset
      LIMIT $limit
    `;
    return db.executeQuery<any>(cypher, { limit, offset });
  }

  async function runTypeWithFallback(params: {
    label: string;
    indexName: string;
    alias: string;
  }): Promise<{ rows: any[]; usedFallback: boolean }> {
    const { label, indexName, alias } = params;
    try {
      if (plan.kind === 'multi') {
        const phrase = await runFulltext(indexName, plan.phraseQuery, alias);
        return { rows: phrase.length > 0 ? phrase : await runFulltext(indexName, plan.andQuery, alias), usedFallback: false };
      }
      return { rows: await runFulltext(indexName, plan.query, alias), usedFallback: false };
    } catch (err) {
      if (!isMissingFulltextIndexError(err)) throw err;

      // Fallback when fulltext indexes are missing: use normSearch CONTAINS queries.
      // We preserve the same phrase-first then AND behavior for plain multi-word input.
      if (plan.kind === 'multi') {
        const phraseRows = await runBasicContains(label, alias, fallbackNorm);
        if (phraseRows.length > 0) return { rows: phraseRows, usedFallback: true };
        return { rows: await runBasicAllTokens(label, alias, fallbackTokens), usedFallback: true };
      }
      return { rows: await runBasicContains(label, alias, fallbackNorm), usedFallback: true };
    }
  }

  // Fulltext search only
  const typeTasks = [
    async () => {
      if (!active.includes('jingles')) return { rows: [], usedFallback: false };
      if (!q.trim()) return { rows: await runGetAll('Jingle', 'j'), usedFallback: false };
      return runTypeWithFallback({ label: 'Jingle', indexName: 'jingle_search', alias: 'j' });
    },
    async () => {
      if (!active.includes('canciones')) return { rows: [], usedFallback: false };
      if (!q.trim()) return { rows: await runGetAll('Cancion', 'c'), usedFallback: false };
      return runTypeWithFallback({ label: 'Cancion', indexName: 'cancion_search', alias: 'c' });
    },
    async () => {
      if (!active.includes('artistas')) return { rows: [], usedFallback: false };
      if (!q.trim()) return { rows: await runGetAll('Artista', 'a'), usedFallback: false };
      return runTypeWithFallback({ label: 'Artista', indexName: 'artista_search', alias: 'a' });
    },
    async () => {
      if (!active.includes('tematicas')) return { rows: [], usedFallback: false };
      if (!q.trim()) return { rows: await runGetAll('Tematica', 't'), usedFallback: false };
      return runTypeWithFallback({ label: 'Tematica', indexName: 'tematica_search', alias: 't' });
    },
    async () => {
      if (!active.includes('fabricas')) return { rows: [], usedFallback: false };
      if (!q.trim()) return { rows: await runGetAll('Fabrica', 'f'), usedFallback: false };
      return runTypeWithFallback({ label: 'Fabrica', indexName: 'fabrica_search', alias: 'f' });
    },
  ];

  const [jinglesRes, cancionesRes, artistasRes, tematicasRes, fabricasRes] = await Promise.all(
    typeTasks.map((fn) => fn())
  );

  const usedFallback =
    jinglesRes.usedFallback ||
    cancionesRes.usedFallback ||
    artistasRes.usedFallback ||
    tematicasRes.usedFallback ||
    fabricasRes.usedFallback;

  const jinglesRaw = jinglesRes.rows;
  const cancionesRaw = cancionesRes.rows;
  const artistasRaw = artistasRes.rows;
  const tematicasRaw = tematicasRes.rows;
  const fabricasRaw = fabricasRes.rows;

  // Extract entity data from nested structure and convert Neo4j dates to ISO strings
  // All entities return only display properties: id, displayPrimary, displaySecondary, displayBadges
  const jingles = jinglesRaw.map((r: any) => ({ ...convertNeo4jDates(r.j || r), type: 'jingle' }));
  const canciones = cancionesRaw.map((r: any) => ({ ...convertNeo4jDates(r.c || r), type: 'cancion' }));
  const artistas = artistasRaw.map((r: any) => ({ ...convertNeo4jDates(r.a || r), type: 'artista' }));
  const tematicas = tematicasRaw.map((r: any) => ({ ...convertNeo4jDates(r.t || r), type: 'tematica' }));
  const fabricas = fabricasRaw.map((r: any) => ({ ...convertNeo4jDates(r.f || r), type: 'fabrica' }));
  res.json({ jingles, canciones, artistas, tematicas, fabricas, meta: { limit: limitInt, offset: offsetInt, types: active, mode: q.trim() ? (usedFallback ? 'basic_fallback' : 'fulltext') : 'all' } });
}));

export default router;
