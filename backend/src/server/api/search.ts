import { Router } from 'express';
import { Neo4jClient } from '../db';

const router = Router();
const db = Neo4jClient.getInstance();

// Simple global search across Jingle, Cancion, Artista, Tematica
// Query param: q
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) {
      return res.json({ jingles: [], canciones: [], artistas: [], tematicas: [] });
    }

    // Use case-insensitive contains by converting properties to lower() in cypher
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

export default router;
