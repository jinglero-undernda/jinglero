/**
 * Tests for ID Generation (Task 5.1)
 * 
 * Validates:
 * - New ID format: {prefix}{8-char-base36}
 * - Collision detection and retry
 * - Entity type prefixes
 * - Fabrica exclusion
 */

import { Neo4jClient } from '../../../src/server/db';

// Mock database client
jest.mock('../../../src/server/db', () => ({
  Neo4jClient: {
    getInstance: jest.fn(() => ({
      executeQuery: jest.fn(),
    })),
  },
}));

describe('ID Generation', () => {
  let mockDb: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockDb = Neo4jClient.getInstance();
  });

  describe('generateId format validation', () => {
    it('should generate IDs with correct format for Jingle', async () => {
      // Mock: ID doesn't exist (no collision)
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');
      const id = await generateId('jingle');

      expect(id).toMatch(/^j[a-z0-9]{8}$/);
      expect(id).toHaveLength(9);
    });

    it('should generate IDs with correct format for Cancion', async () => {
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');
      const id = await generateId('cancion');

      expect(id).toMatch(/^c[a-z0-9]{8}$/);
      expect(id).toHaveLength(9);
    });

    it('should generate IDs with correct format for Artista', async () => {
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');
      const id = await generateId('artista');

      expect(id).toMatch(/^a[a-z0-9]{8}$/);
      expect(id).toHaveLength(9);
    });

    it('should generate IDs with correct format for Tematica', async () => {
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');
      const id = await generateId('tematica');

      expect(id).toMatch(/^t[a-z0-9]{8}$/);
      expect(id).toHaveLength(9);
    });

    it('should generate IDs with correct format for Usuario', async () => {
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');
      const id = await generateId('usuario');

      expect(id).toMatch(/^u[a-z0-9]{8}$/);
      expect(id).toHaveLength(9);
    });

    it('should throw error for Fabrica (external IDs)', async () => {
      const { generateId } = require('../../../src/server/api/admin');

      await expect(generateId('fabrica')).rejects.toThrow('Fabrica IDs are external (YouTube video IDs)');
    });

    it('should throw error for unknown entity type', async () => {
      const { generateId } = require('../../../src/server/api/admin');

      await expect(generateId('unknown')).rejects.toThrow();
    });
  });

  describe('collision detection', () => {
    it('should retry on collision and succeed with different ID', async () => {
      const { generateId } = require('../../../src/server/api/admin');

      // First call: collision detected
      // Second call: no collision
      mockDb.executeQuery
        .mockResolvedValueOnce([{ id: 'j1a2b3c4' }]) // Collision
        .mockResolvedValueOnce([]); // Success

      const id = await generateId('jingle');

      expect(id).toMatch(/^j[a-z0-9]{8}$/);
      expect(mockDb.executeQuery).toHaveBeenCalledTimes(2);
    });

    it('should throw error after maximum retries', async () => {
      const { generateId } = require('../../../src/server/api/admin');

      // Always return collision
      mockDb.executeQuery.mockResolvedValue([{ id: 'j1a2b3c4' }]);

      await expect(generateId('jingle')).rejects.toThrow('Failed to generate unique ID after 10 attempts');
      expect(mockDb.executeQuery).toHaveBeenCalledTimes(10);
    });
  });

  describe('ID uniqueness across entity types', () => {
    it('should generate different IDs for different entity types', async () => {
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');

      const jingleId = await generateId('jingle');
      const cancionId = await generateId('cancion');
      const artistaId = await generateId('artista');

      expect(jingleId[0]).toBe('j');
      expect(cancionId[0]).toBe('c');
      expect(artistaId[0]).toBe('a');

      // Should be unique
      expect(jingleId).not.toBe(cancionId);
      expect(cancionId).not.toBe(artistaId);
      expect(jingleId).not.toBe(artistaId);
    });
  });

  describe('generateIdSync', () => {
    it('should generate synchronous ID with correct format', () => {
      const { generateIdSync } = require('../../../src/server/api/admin');

      const id = generateIdSync('jingle');

      expect(id).toMatch(/^j[a-z0-9]{8}$/);
      expect(id).toHaveLength(9);
    });

    it('should not check for collisions', () => {
      const { generateIdSync } = require('../../../src/server/api/admin');

      // Should not call database
      const id = generateIdSync('cancion');

      expect(mockDb.executeQuery).not.toHaveBeenCalled();
      expect(id).toMatch(/^c[a-z0-9]{8}$/);
    });
  });

  describe('base36 encoding', () => {
    it('should only use lowercase alphanumeric characters', async () => {
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');

      // Generate multiple IDs to test randomness
      const ids = await Promise.all([
        generateId('jingle'),
        generateId('jingle'),
        generateId('jingle'),
        generateId('jingle'),
        generateId('jingle'),
      ]);

      ids.forEach(id => {
        const alphanumeric = id.substring(1); // Remove prefix
        expect(alphanumeric).toMatch(/^[a-z0-9]{8}$/);
        expect(alphanumeric).not.toMatch(/[A-Z]/); // No uppercase
        expect(alphanumeric).not.toMatch(/[^a-z0-9]/); // No special chars
      });
    });

    it('should generate statistically different IDs', async () => {
      mockDb.executeQuery.mockResolvedValue([]);

      const { generateId } = require('../../../src/server/api/admin');

      // Generate 10 IDs
      const ids = await Promise.all(
        Array.from({ length: 10 }, () => generateId('jingle'))
      );

      // All should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });
});

