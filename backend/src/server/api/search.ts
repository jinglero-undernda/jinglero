import { Router } from 'express';
import { Neo4jClient } from '../db';
import { asyncHandler, BadRequestError } from './core';

const router = Router();
const db = Neo4jClient.getInstance();

// Simple global search across Jingle, Cancion, Artista, Tematica
// Query param: q
router.get('/', asyncHandler(async (req, res) => {
  const q = (req.query.q as string) || '';
  const limitParam = req.query.limit as string;
  const offsetParam = req.query.offset as string;
  const typesParam = (req.query.types as string) || '';
  const mode = ((req.query.mode as string) || 'basic').toLowerCase(); // 'basic' | 'fulltext'

  if (!q.trim()) {
    return res.json({ jingles: [], canciones: [], artistas: [], tematicas: [] });
  }

  const limit = Math.min(Math.max(parseInt(limitParam || '10', 10), 1), 100);
  const offset = Math.max(parseInt(offsetParam || '0', 10), 0);

  // allowed types filter: comma-separated among jingles,canciones,artistas,tematicas
  const allowed = ['jingles', 'canciones', 'artistas', 'tematicas'] as const;
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

      const [jingles, canciones, artistas, tematicas] = await Promise.all(queriesFT);
      return res.json({ jingles, canciones, artistas, tematicas, meta: { limit, offset, types: active, mode: 'fulltext' } });
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
      WHERE toLower(coalesce(j.title, '')) CONTAINS $text
         OR toLower(coalesce(j.songTitle, '')) CONTAINS $text
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
      WHERE toLower(coalesce(c.title, '')) CONTAINS $text
      RETURN c { .id, .title } AS c
      ORDER BY c.title
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(cancionesQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  if (active.includes('artistas')) {
    const artistasQuery = `
      MATCH (a:Artista)
      WHERE toLower(coalesce(a.stageName, '')) CONTAINS $text
         OR toLower(coalesce(a.name, '')) CONTAINS $text
      RETURN a { .id, .stageName } AS a
      ORDER BY a.stageName
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(artistasQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  if (active.includes('tematicas')) {
    const tematicasQuery = `
      MATCH (t:Tematica)
      WHERE toLower(coalesce(t.name, '')) CONTAINS $text
      RETURN t { .id, .name } AS t
      ORDER BY t.name
      SKIP $offset
      LIMIT $limit
    `;
    queries.push(db.executeQuery<any>(tematicasQuery, { text, limit, offset }));
  } else { queries.push(Promise.resolve([])); }

  const [jingles, canciones, artistas, tematicas] = await Promise.all(queries);
  res.json({ jingles, canciones, artistas, tematicas, meta: { limit, offset, types: active, mode: 'basic' } });
}));

export default router;
