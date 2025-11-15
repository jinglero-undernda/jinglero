/**
 * Migration: Add status field to entities
 * 
 * Adds the `status` property to Jingle, Cancion, Artista, and Tematica entities
 * where it is missing, defaulting to 'DRAFT'.
 * 
 * This migration is safe to run multiple times - it only sets status for entities
 * where status is NULL or missing.
 */

import { Neo4jClient } from '..';

export async function addStatusFieldToEntities(): Promise<void> {
  const client = Neo4jClient.getInstance();

  try {
    console.log('Starting migration: Adding status field to entities...');

    const entityTypes = ['Jingle', 'Cancion', 'Artista', 'Tematica'];
    
    for (const entityType of entityTypes) {
      const query = `
        MATCH (n:${entityType})
        WHERE n.status IS NULL
        SET n.status = 'DRAFT'
        RETURN count(n) AS updated
      `;
      
      const result = await client.executeQuery<{ updated: { low: number } | number }>(
        query,
        {},
        undefined,
        true
      );
      
      const count = typeof result[0]?.updated === 'object' 
        ? result[0].updated.low 
        : result[0]?.updated || 0;
      
      console.log(`Updated ${count} ${entityType} entities with status='DRAFT'`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Execute migration when this file is run directly
if (require.main === module) {
  (async () => {
    try {
      await addStatusFieldToEntities();
      console.log('Migration script completed');
      process.exit(0);
    } catch (error) {
      console.error('Migration script failed:', error);
      process.exit(1);
    }
  })();
}

