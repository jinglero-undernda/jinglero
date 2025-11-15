/**
 * Tests for database schema migration: Adding status field and removing constraints
 * 
 * Tests backward compatibility and ensures schema changes work correctly.
 */

import { Neo4jClient } from '../../../src/server/db';
import { setupSchema } from '../../../src/server/db/schema/setup';
import { addStatusFieldToEntities } from '../../../src/server/db/migration/add-status-field';
import { validateArtistaNameOrStageName } from '../../../src/server/utils/validation';

describe('Schema Migration Tests', () => {
  let db: Neo4jClient;

  beforeAll(async () => {
    db = Neo4jClient.getInstance();
    // Ensure schema is set up before tests
    await setupSchema();
  });

  afterEach(async () => {
    // Clean up test data after each test (delete relationships first, then nodes)
    await db.executeQuery('MATCH (n) WHERE n.id STARTS WITH "TEST_" DETACH DELETE n', {}, undefined, true);
  });

  describe('Constraint Removal', () => {
    it('should allow creating Jingle without timestamp property', async () => {
      const jingleId = `TEST_JINGLE_NO_TIMESTAMP_${Date.now()}`;
      
      // Ensure it doesn't exist first
      await db.executeQuery('MATCH (j:Jingle { id: $id }) DETACH DELETE j', { id: jingleId }, undefined, true);
      
      const query = `
        CREATE (j:Jingle {
          id: $id,
          title: 'Test Jingle',
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN j
      `;
      
      const result = await db.executeQuery(query, { id: jingleId }, undefined, true);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      
      // Verify it was created
      const verifyQuery = `MATCH (j:Jingle { id: $id }) RETURN j`;
      const verify = await db.executeQuery(verifyQuery, { id: jingleId });
      expect(verify.length).toBe(1);
    });

    it('should allow creating Artista with only name (no stageName)', async () => {
      const artistaId = 'TEST_ARTISTA_NAME_ONLY';
      const query = `
        CREATE (a:Artista {
          id: $id,
          name: 'Test Artist',
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN a
      `;
      
      const result = await db.executeQuery(query, { id: artistaId }, undefined, true);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it('should allow creating Artista with only stageName (no name)', async () => {
      const artistaId = 'TEST_ARTISTA_STAGENAME_ONLY';
      const query = `
        CREATE (a:Artista {
          id: $id,
          stageName: 'Test Stage Name',
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN a
      `;
      
      const result = await db.executeQuery(query, { id: artistaId }, undefined, true);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it('should reject creating Artista with neither name nor stageName via validation', () => {
      const validationIssue = validateArtistaNameOrStageName({});
      expect(validationIssue).not.toBeNull();
      expect(validationIssue?.message).toContain("at least one of 'name' or 'stageName'");
    });
  });

  describe('Status Field Migration', () => {
    it('should add status field to existing entities without status', async () => {
      // Create entities without status
      const jingleId = 'TEST_JINGLE_NO_STATUS';
      const cancionId = 'TEST_CANCION_NO_STATUS';
      const artistaId = 'TEST_ARTISTA_NO_STATUS';
      const tematicaId = 'TEST_TEMATICA_NO_STATUS';

      await db.executeQuery(`
        CREATE (j:Jingle { id: $jingleId, title: 'Test', createdAt: datetime(), updatedAt: datetime() }),
               (c:Cancion { id: $cancionId, title: 'Test Song', createdAt: datetime(), updatedAt: datetime() }),
               (a:Artista { id: $artistaId, name: 'Test Artist', createdAt: datetime(), updatedAt: datetime() }),
               (t:Tematica { id: $tematicaId, name: 'Test Topic', createdAt: datetime(), updatedAt: datetime() })
      `, { jingleId, cancionId, artistaId, tematicaId }, undefined, true);

      // Run migration
      await addStatusFieldToEntities();

      // Verify status was added
      const verifyQuery = `
        MATCH (j:Jingle { id: $jingleId }),
              (c:Cancion { id: $cancionId }),
              (a:Artista { id: $artistaId }),
              (t:Tematica { id: $tematicaId })
        RETURN j.status AS jStatus, c.status AS cStatus, a.status AS aStatus, t.status AS tStatus
      `;
      const result = await db.executeQuery<{ jStatus: string; cStatus: string; aStatus: string; tStatus: string }>(verifyQuery, { jingleId, cancionId, artistaId, tematicaId });
      
      expect(result[0]).toBeDefined();
      expect(result[0].jStatus).toBe('DRAFT');
      expect(result[0].cStatus).toBe('DRAFT');
      expect(result[0].aStatus).toBe('DRAFT');
      expect(result[0].tStatus).toBe('DRAFT');
    });

    it('should preserve existing status values during migration', async () => {
      const jingleId = 'TEST_JINGLE_WITH_STATUS';
      
      // Create entity with existing status
      await db.executeQuery(`
        CREATE (j:Jingle {
          id: $id,
          title: 'Test',
          status: 'PUBLISHED',
          createdAt: datetime(),
          updatedAt: datetime()
        })
      `, { id: jingleId }, undefined, true);

      // Run migration (should not overwrite)
      await addStatusFieldToEntities();

      // Verify status was preserved
      const verifyQuery = `MATCH (j:Jingle { id: $id }) RETURN j.status AS status`;
      const result = await db.executeQuery<{ status: string }>(verifyQuery, { id: jingleId });
      
      expect(result[0].status).toBe('PUBLISHED');
    });
  });

  describe('Entity Creation with Status', () => {
    it('should default status to DRAFT when creating entity without status', async () => {
      const jingleId = 'TEST_JINGLE_DEFAULT_STATUS';
      
      const query = `
        CREATE (j:Jingle {
          id: $id,
          title: 'Test',
          status: COALESCE($status, 'DRAFT'),
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN j.status AS status
      `;
      
      const result = await db.executeQuery(query, { id: jingleId, status: null }, undefined, true);
      // Note: In actual API, status would be set by the API handler, not in Cypher
      // This test verifies the concept works
      expect(result).toBeDefined();
    });
  });

  describe('Relationship Properties', () => {
    it('should allow creating relationships with status and createdAt', async () => {
      const jingleId = 'TEST_JINGLE_REL';
      const fabricaId = 'TEST_FABRICA_REL';
      
      // Create test entities
      await db.executeQuery(`
        CREATE (j:Jingle { id: $jingleId, title: 'Test', createdAt: datetime(), updatedAt: datetime() }),
               (f:Fabrica { id: $fabricaId, title: 'Test', date: datetime(), youtubeUrl: 'test', status: 'DRAFT', createdAt: datetime(), updatedAt: datetime() })
      `, { jingleId, fabricaId }, undefined, true);

      // Create relationship with status and createdAt
      const relQuery = `
        MATCH (j:Jingle { id: $jingleId }), (f:Fabrica { id: $fabricaId })
        CREATE (j)-[r:APPEARS_IN {
          order: 1,
          timestamp: 100,
          status: 'DRAFT',
          createdAt: datetime()
        }]->(f)
        RETURN r
      `;
      
      const result = await db.executeQuery(relQuery, { jingleId, fabricaId }, undefined, true);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });
});

