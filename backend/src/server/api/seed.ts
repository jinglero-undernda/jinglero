import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const router = Router();

function loadSeed() {
  const seedPath = path.resolve(__dirname, '../db/seed.yaml');
  const content = fs.readFileSync(seedPath, 'utf8');
  return yaml.load(content) as any;
}

// GET /api/seed - return entire seed
router.get('/', (req, res) => {
  try {
    const seed = loadSeed();
    res.json(seed);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to load seed' });
  }
});

// GET /api/seed/:type - return list for type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
router.get('/:type', (req, res) => {
  try {
    const { type } = req.params;
    const seed = loadSeed();
    const list = seed[type];
    if (!list) return res.status(404).json({ error: `Unknown seed type: ${type}` });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to load seed' });
  }
});

// GET /api/seed/:type/:id - return single entity by id
router.get('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const seed = loadSeed();
    const list = seed[type];
    if (!list) return res.status(404).json({ error: `Unknown seed type: ${type}` });
    const item = (list as any[]).find((i) => i.id === id);
    if (!item) return res.status(404).json({ error: `Not found: ${type}/${id}` });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to load seed' });
  }
});

export default router;
