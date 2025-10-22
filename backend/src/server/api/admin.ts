import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const router = Router();

function seedPath() {
  return path.resolve(__dirname, '../db/seed.yaml');
}

function loadSeed() {
  const seedPathStr = seedPath();
  const content = fs.readFileSync(seedPathStr, 'utf8');
  return yaml.load(content) as any;
}

function saveSeed(seed: any) {
  const seedPathStr = seedPath();
  const content = yaml.dump(seed);
  fs.writeFileSync(seedPathStr, content, 'utf8');
}

const ID_PREFIX: Record<string, string> = {
  usuarios: 'USR',
  artistas: 'ART',
  canciones: 'CAN',
  // fabricas: external UUIDs - do not auto-generate
  tematicas: 'TEM',
  jingles: 'JIN',
};

function randomBlock() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    out += chars[idx];
  }
  return out;
}

function generateId(type: string) {
  const prefix = ID_PREFIX[type] || 'GEN';
  return `${prefix}_${randomBlock()}_${randomBlock()}`;
}

function ensureList(seed: any, type: string) {
  if (!seed[type]) seed[type] = [];
  return seed[type] as any[];
}

// List entities
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

// Get single
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

// Create
router.post('/:type', (req, res) => {
  try {
    const { type } = req.params;
    const payload = req.body || {};
    const seed = loadSeed();
    const list = ensureList(seed, type);

    const id = payload.id || (type === 'fabricas' ? null : generateId(type));
    if (type === 'fabricas' && !id) {
      return res.status(400).json({ error: 'Fabricas require an external UUID; provide an id in the payload' });
    }
    if ((list as any[]).some((i) => i.id === id)) {
      return res.status(409).json({ error: `Entity with id already exists: ${id}` });
    }

    const now = new Date().toISOString();
    const item = { ...payload, id, createdAt: payload.createdAt || now, updatedAt: payload.updatedAt || now };
    list.push(item);
    saveSeed(seed);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create entity' });
  }
});

// Update / Replace
router.put('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const payload = req.body || {};
    const seed = loadSeed();
    const list = seed[type];
    if (!list) return res.status(404).json({ error: `Unknown seed type: ${type}` });
    const idx = (list as any[]).findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: `Not found: ${type}/${id}` });
    const now = new Date().toISOString();
    const updated = { ...payload, id, updatedAt: now };
    list[idx] = updated;
    saveSeed(seed);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update entity' });
  }
});

// Partial update
router.patch('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const payload = req.body || {};
    const seed = loadSeed();
    const list = seed[type];
    if (!list) return res.status(404).json({ error: `Unknown seed type: ${type}` });
    const idx = (list as any[]).findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: `Not found: ${type}/${id}` });
    const now = new Date().toISOString();
    const updated = { ...list[idx], ...payload, id, updatedAt: now };
    list[idx] = updated;
    saveSeed(seed);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to patch entity' });
  }
});

// Delete
router.delete('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const seed = loadSeed();
    const list = seed[type];
    if (!list) return res.status(404).json({ error: `Unknown seed type: ${type}` });
    const idx = (list as any[]).findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: `Not found: ${type}/${id}` });
    const removed = list.splice(idx, 1)[0];
    saveSeed(seed);
    res.json({ deleted: removed });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete entity' });
  }
});

export default router;
