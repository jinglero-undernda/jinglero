import { Router } from 'express';
import { Neo4jClient } from '../db';
import { Fabrica, Jingle, Cancion, Artista, Tematica, ProcessStatus, CategoriaTematica } from '../db/types';

const router = Router();
const db = Neo4jClient.getInstance();

// Fabrica CRUD endpoints - note: UUID is provided externally
router.post('/fabricas', async (req, res) => {
  try {
    const fabrica: Fabrica = req.body;
    if (!fabrica.id) {
      return res.status(400).json({ error: 'Fabrica ID must be provided' });
    }
    const query = `
      CREATE (f:Fabrica {
        id: $id,
        title: $title,
        date: datetime($date),
        youtubeUrl: $youtubeUrl,
        visualizations: $visualizations,
        likes: $likes,
        description: $description,
        contents: $contents,
        status: $status,
        createdAt: datetime(),
        updatedAt: datetime()
      }) RETURN f
    `;
    const result = await db.executeQuery<Fabrica>(query, {
      ...fabrica,
      status: fabrica.status || ProcessStatus.DRAFT
    }, undefined, true);
    res.status(201).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/fabricas', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      MATCH (f:Fabrica)
      ${status ? 'WHERE f.status = $status' : ''}
      RETURN f
      ORDER BY f.date DESC
      LIMIT 50
    `;
    const fabricas = await db.executeQuery<Fabrica>(query, { status });
    res.json(fabricas);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/fabricas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (f:Fabrica { id: $id })
      RETURN f
    `;
    const result = await db.executeQuery<Fabrica>(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Fabrica not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.put('/fabricas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const query = `
      MATCH (f:Fabrica { id: $id })
      SET f += $updates,
          f.updatedAt = datetime()
      RETURN f
    `;
    const result = await db.executeQuery<Fabrica>(query, { id, updates }, undefined, true);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Fabrica not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.delete('/fabricas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (f:Fabrica { id: $id })
      DELETE f
    `;
    await db.executeQuery(query, { id }, undefined, true);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Jingle CRUD endpoints
router.post('/jingles', async (req, res) => {
  try {
    const jingle: Jingle = req.body;
    const query = `
      CREATE (j:Jingle {
        id: randomUUID(),
        youtubeUrl: $youtubeUrl,
        timestamp: $timestamp,
        youtubeClipUrl: $youtubeClipUrl,
        title: $title,
        comment: $comment,
        lyrics: $lyrics,
        songTitle: $songTitle,
        artistName: $artistName,
        genre: $genre,
        isJinglazo: $isJinglazo,
        isJinglazoDelDia: $isJinglazoDelDia,
        isPrecario: $isPrecario,
        createdAt: datetime(),
        updatedAt: datetime()
      }) RETURN j
    `;
    const result = await db.executeQuery<Jingle>(query, jingle, undefined, true);
    res.status(201).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/jingles', async (req, res) => {
  try {
    const { isJinglazo, isPrecario } = req.query;
    let query = `
      MATCH (j:Jingle)
      WHERE 1=1
      ${isJinglazo !== undefined ? 'AND j.isJinglazo = $isJinglazo' : ''}
      ${isPrecario !== undefined ? 'AND j.isPrecario = $isPrecario' : ''}
      RETURN j
      ORDER BY j.createdAt DESC
      LIMIT 50
    `;
    const jingles = await db.executeQuery<Jingle>(query, { isJinglazo, isPrecario });
    res.json(jingles);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/jingles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (j:Jingle { id: $id })
      RETURN j
    `;
    const result = await db.executeQuery<Jingle>(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Jingle not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.put('/jingles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const query = `
      MATCH (j:Jingle { id: $id })
      SET j += $updates,
          j.updatedAt = datetime()
      RETURN j
    `;
    const result = await db.executeQuery<Jingle>(query, { id, updates }, undefined, true);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Jingle not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.delete('/jingles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (j:Jingle { id: $id })
      DELETE j
    `;
    await db.executeQuery(query, { id }, undefined, true);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Cancion CRUD endpoints
router.post('/canciones', async (req, res) => {
  try {
    const cancion: Cancion = req.body;
    const query = `
      CREATE (c:Cancion {
        id: randomUUID(),
        title: $title,
        album: $album,
        year: $year,
        genre: $genre,
        youtubeMusic: $youtubeMusic,
        lyrics: $lyrics,
        createdAt: datetime(),
        updatedAt: datetime()
      }) RETURN c
    `;
    const result = await db.executeQuery<Cancion>(query, cancion, undefined, true);
    res.status(201).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/canciones', async (req, res) => {
  try {
    const { genre } = req.query;
    let query = `
      MATCH (c:Cancion)
      ${genre ? 'WHERE c.genre = $genre' : ''}
      RETURN c
      ORDER BY c.title ASC
      LIMIT 50
    `;
    const canciones = await db.executeQuery<Cancion>(query, { genre });
    res.json(canciones);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/canciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (c:Cancion { id: $id })
      RETURN c
    `;
    const result = await db.executeQuery<Cancion>(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Cancion not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.put('/canciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const query = `
      MATCH (c:Cancion { id: $id })
      SET c += $updates,
          c.updatedAt = datetime()
      RETURN c
    `;
    const result = await db.executeQuery<Cancion>(query, { id, updates }, undefined, true);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Cancion not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.delete('/canciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (c:Cancion { id: $id })
      DELETE c
    `;
    await db.executeQuery(query, { id }, undefined, true);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Artista CRUD endpoints
router.post('/artistas', async (req, res) => {
  try {
    const artista: Artista = req.body;
    const query = `
      CREATE (a:Artista {
        id: randomUUID(),
        stageName: $stageName,
        name: $name,
        idUsuario: $idUsuario,
        nationality: $nationality,
        isArg: $isArg,
        youtubeHandle: $youtubeHandle,
        instagramHandle: $instagramHandle,
        twitterHandle: $twitterHandle,
        facebookProfile: $facebookProfile,
        website: $website,
        bio: $bio,
        createdAt: datetime(),
        updatedAt: datetime()
      }) RETURN a
    `;
    const result = await db.executeQuery<Artista>(query, artista, undefined, true);
    res.status(201).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/artistas', async (req, res) => {
  try {
    const { isArg } = req.query;
    let query = `
      MATCH (a:Artista)
      ${isArg !== undefined ? 'WHERE a.isArg = $isArg' : ''}
      RETURN a
      ORDER BY a.stageName ASC
      LIMIT 50
    `;
    const artistas = await db.executeQuery<Artista>(query, { isArg });
    res.json(artistas);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/artistas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (a:Artista { id: $id })
      RETURN a
    `;
    const result = await db.executeQuery<Artista>(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Artista not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.put('/artistas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const query = `
      MATCH (a:Artista { id: $id })
      SET a += $updates,
          a.updatedAt = datetime()
      RETURN a
    `;
    const result = await db.executeQuery<Artista>(query, { id, updates }, undefined, true);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Artista not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.delete('/artistas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (a:Artista { id: $id })
      DELETE a
    `;
    await db.executeQuery(query, { id }, undefined, true);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Tematica CRUD endpoints
router.post('/tematicas', async (req, res) => {
  try {
    const tematica: Tematica = req.body;
    const query = `
      CREATE (t:Tematica {
        id: randomUUID(),
        name: $name,
        category: $category,
        description: $description,
        createdAt: datetime(),
        updatedAt: datetime()
      }) RETURN t
    `;
    const result = await db.executeQuery<Tematica>(query, {
      ...tematica,
      category: tematica.category || CategoriaTematica.CULTURA
    }, undefined, true);
    res.status(201).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/tematicas', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      MATCH (t:Tematica)
      ${category ? 'WHERE t.category = $category' : ''}
      RETURN t
      ORDER BY t.name ASC
      LIMIT 50
    `;
    const tematicas = await db.executeQuery<Tematica>(query, { category });
    res.json(tematicas);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/tematicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (t:Tematica { id: $id })
      RETURN t
    `;
    const result = await db.executeQuery<Tematica>(query, { id });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Tematica not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.put('/tematicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const query = `
      MATCH (t:Tematica { id: $id })
      SET t += $updates,
          t.updatedAt = datetime()
      RETURN t
    `;
    const result = await db.executeQuery<Tematica>(query, { id, updates }, undefined, true);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Tematica not found' });
    }
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.delete('/tematicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (t:Tematica { id: $id })
      DELETE t
    `;
    await db.executeQuery(query, { id }, undefined, true);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

export default router;