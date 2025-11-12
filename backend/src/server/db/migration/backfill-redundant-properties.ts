/**
 * Migration Script: Backfill Redundant Properties
 * 
 * This script backfills redundant properties (denormalized data) from relationships:
 * - Jingle.fabricaId from APPEARS_IN relationship
 * - Jingle.cancionId from VERSIONA relationship
 * - Cancion.autorIds from AUTOR_DE relationships
 * 
 * These redundant properties improve query performance by eliminating relationship traversals.
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/migration/backfill-redundant-properties.ts
 * 
 * Or import and run:
 *   import { backfillRedundantProperties } from './backfill-redundant-properties';
 *   await backfillRedundantProperties();
 */

import { Neo4jClient } from '../index';

interface MigrationStats {
  jinglesUpdated: number;
  jinglesWithFabrica: number;
  jinglesWithCancion: number;
  cancionesUpdated: number;
  cancionesWithAutores: number;
  errors: Array<{ entityId: string; error: string }>;
}

/**
 * Backfill fabricaId and fabricaDate properties on Jingle nodes from APPEARS_IN relationships
 */
async function backfillJingleFabricaIds(db: Neo4jClient): Promise<{ updated: number; withFabrica: number }> {
  console.log('Backfilling Jingle.fabricaId and Jingle.fabricaDate from APPEARS_IN relationships...');
  
  const query = `
    MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
    WITH j, f, r
    ORDER BY r.order ASC, r.timestamp ASC
    // For Jingles with multiple Fabricas, use the first one (by order/timestamp)
    WITH j, collect(f)[0] AS primaryFabrica
    WHERE j.fabricaId IS NULL OR j.fabricaId <> primaryFabrica.id 
       OR j.fabricaDate IS NULL OR j.fabricaDate <> primaryFabrica.date
    SET j.fabricaId = primaryFabrica.id,
        j.fabricaDate = primaryFabrica.date
    RETURN count(j) AS updated
  `;
  
  const result = await db.executeQuery(query, {}, undefined, true);
  const updated = (result[0] as any)?.updated?.low || (result[0] as any)?.updated || 0;
  
  // Count total Jingles with Fabricas
  const countQuery = `
    MATCH (j:Jingle)-[:APPEARS_IN]->(f:Fabrica)
    RETURN count(DISTINCT j) AS total
  `;
  const countResult = await db.executeQuery(countQuery);
  const withFabrica = (countResult[0] as any)?.total?.low || (countResult[0] as any)?.total || 0;
  
  console.log(`  Updated ${updated} Jingle nodes with fabricaId and fabricaDate`);
  console.log(`  Total Jingles with Fabricas: ${withFabrica}`);
  
  return { updated, withFabrica };
}

/**
 * Backfill cancionId property on Jingle nodes from VERSIONA relationships
 */
async function backfillJingleCancionIds(db: Neo4jClient): Promise<{ updated: number; withCancion: number }> {
  console.log('Backfilling Jingle.cancionId from VERSIONA relationships...');
  
  const query = `
    MATCH (j:Jingle)-[r:VERSIONA]->(c:Cancion)
    WHERE j.cancionId IS NULL OR j.cancionId <> c.id
    SET j.cancionId = c.id
    RETURN count(j) AS updated
  `;
  
  const result = await db.executeQuery(query, {}, undefined, true);
  const updated = (result[0] as any)?.updated?.low || (result[0] as any)?.updated || 0;
  
  // Count total Jingles with Canciones
  const countQuery = `
    MATCH (j:Jingle)-[:VERSIONA]->(c:Cancion)
    RETURN count(DISTINCT j) AS total
  `;
  const countResult = await db.executeQuery(countQuery);
  const withCancion = (countResult[0] as any)?.total?.low || (countResult[0] as any)?.total || 0;
  
  console.log(`  Updated ${updated} Jingle nodes with cancionId`);
  console.log(`  Total Jingles with Canciones: ${withCancion}`);
  
  return { updated, withCancion };
}

/**
 * Backfill autorIds property on Cancion nodes from AUTOR_DE relationships
 */
async function backfillCancionAutorIds(db: Neo4jClient): Promise<{ updated: number; withAutores: number }> {
  console.log('Backfilling Cancion.autorIds from AUTOR_DE relationships...');
  
  // First, collect all autor IDs for each Cancion
  const collectQuery = `
    MATCH (a:Artista)-[:AUTOR_DE]->(c:Cancion)
    WITH c, collect(a.id) AS autorIds
    ORDER BY c.id
    RETURN c.id AS cancionId, autorIds
  `;
  
  const results = await db.executeQuery(collectQuery);
  let updated = 0;
  
  // Update each Cancion with its autorIds array
  for (const record of results) {
    const cancionId = (record as any).cancionId;
    const autorIds = (record as any).autorIds || [];
    
    try {
      const updateQuery = `
        MATCH (c:Cancion {id: $cancionId})
        SET c.autorIds = $autorIds
        RETURN c.id
      `;
      
      await db.executeQuery(updateQuery, { cancionId, autorIds }, undefined, true);
      updated++;
    } catch (error: any) {
      console.error(`  Error updating Cancion ${cancionId}:`, error.message);
    }
  }
  
  // Count total Canciones with Autores
  const countQuery = `
    MATCH (a:Artista)-[:AUTOR_DE]->(c:Cancion)
    RETURN count(DISTINCT c) AS total
  `;
  const countResult = await db.executeQuery(countQuery);
  const withAutores = (countResult[0] as any)?.total?.low || (countResult[0] as any)?.total || 0;
  
  console.log(`  Updated ${updated} Cancion nodes with autorIds`);
  console.log(`  Total Canciones with Autores: ${withAutores}`);
  
  return { updated, withAutores };
}

/**
 * Create indexes for the new redundant properties to improve query performance
 */
async function createIndexes(db: Neo4jClient): Promise<void> {
  console.log('Creating indexes for redundant properties...');
  
  const indexes = [
    {
      name: 'jingle_fabrica_id',
      query: 'CREATE INDEX jingle_fabrica_id IF NOT EXISTS FOR (j:Jingle) ON (j.fabricaId)',
    },
    {
      name: 'jingle_cancion_id',
      query: 'CREATE INDEX jingle_cancion_id IF NOT EXISTS FOR (j:Jingle) ON (j.cancionId)',
    },
    {
      name: 'jingle_is_live',
      query: 'CREATE INDEX jingle_is_live IF NOT EXISTS FOR (j:Jingle) ON (j.isLive)',
    },
    {
      name: 'jingle_is_repeat',
      query: 'CREATE INDEX jingle_is_repeat IF NOT EXISTS FOR (j:Jingle) ON (j.isRepeat)',
    },
  ];
  
  for (const index of indexes) {
    try {
      await db.executeQuery(index.query, {}, undefined, true);
      console.log(`  Created index: ${index.name}`);
    } catch (error: any) {
      // Index might already exist, which is fine
      if (error.message?.includes('already exists') || error.message?.includes('equivalent')) {
        console.log(`  Index ${index.name} already exists, skipping...`);
      } else {
        console.warn(`  Warning: Could not create index ${index.name}:`, error.message);
      }
    }
  }
}

/**
 * Validate that redundant properties match their relationships
 */
async function validateRedundantProperties(db: Neo4jClient): Promise<MigrationStats> {
  console.log('Validating redundant properties...');
  
  const stats: MigrationStats = {
    jinglesUpdated: 0,
    jinglesWithFabrica: 0,
    jinglesWithCancion: 0,
    cancionesUpdated: 0,
    cancionesWithAutores: 0,
    errors: [],
  };
  
  // Validate Jingle.fabricaId and fabricaDate match APPEARS_IN
  const fabricaValidationQuery = `
    MATCH (j:Jingle)
    WHERE j.fabricaId IS NOT NULL
    OPTIONAL MATCH (j)-[:APPEARS_IN]->(f:Fabrica)
    WITH j, f
    WHERE f IS NULL OR f.id <> j.fabricaId OR j.fabricaDate <> f.date
    RETURN j.id AS jingleId, j.fabricaId AS expectedFabricaId, f.id AS actualFabricaId,
           j.fabricaDate AS expectedFabricaDate, f.date AS actualFabricaDate
  `;
  
  const fabricaMismatches = await db.executeQuery(fabricaValidationQuery);
  if (fabricaMismatches.length > 0) {
    console.warn(`  ⚠️  Found ${fabricaMismatches.length} Jingles with mismatched fabricaId or fabricaDate`);
    for (const mismatch of fabricaMismatches) {
      const record = mismatch as any;
      const errors: string[] = [];
      if (record.expectedFabricaId !== record.actualFabricaId) {
        errors.push(`fabricaId: expected ${record.expectedFabricaId}, actual ${record.actualFabricaId || 'none'}`);
      }
      if (record.expectedFabricaDate !== record.actualFabricaDate) {
        errors.push(`fabricaDate: expected ${record.expectedFabricaDate}, actual ${record.actualFabricaDate || 'none'}`);
      }
      stats.errors.push({
        entityId: record.jingleId,
        error: errors.join('; '),
      });
    }
  } else {
    console.log('  ✅ All Jingle.fabricaId and fabricaDate values match APPEARS_IN relationships');
  }
  
  // Validate Jingle.cancionId matches VERSIONA
  const cancionValidationQuery = `
    MATCH (j:Jingle)
    WHERE j.cancionId IS NOT NULL
    OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
    WITH j, c
    WHERE c IS NULL OR c.id <> j.cancionId
    RETURN j.id AS jingleId, j.cancionId AS expectedCancionId, c.id AS actualCancionId
  `;
  
  const cancionMismatches = await db.executeQuery(cancionValidationQuery);
  if (cancionMismatches.length > 0) {
    console.warn(`  ⚠️  Found ${cancionMismatches.length} Jingles with mismatched cancionId`);
    for (const mismatch of cancionMismatches) {
      const record = mismatch as any;
      stats.errors.push({
        entityId: record.jingleId,
        error: `cancionId mismatch: expected ${record.expectedCancionId}, actual ${record.actualCancionId || 'none'}`,
      });
    }
  } else {
    console.log('  ✅ All Jingle.cancionId values match VERSIONA relationships');
  }
  
  // Validate Cancion.autorIds matches AUTOR_DE
  // This is more complex because we need to compare arrays
  const autorValidationQuery = `
    MATCH (c:Cancion)
    WHERE c.autorIds IS NOT NULL
    OPTIONAL MATCH (a:Artista)-[:AUTOR_DE]->(c)
    WITH c, collect(a.id) AS actualAutorIds
    WHERE c.autorIds <> actualAutorIds
    RETURN c.id AS cancionId, c.autorIds AS expectedAutorIds, actualAutorIds
  `;
  
  const autorMismatches = await db.executeQuery(autorValidationQuery);
  if (autorMismatches.length > 0) {
    console.warn(`  ⚠️  Found ${autorMismatches.length} Canciones with mismatched autorIds`);
    for (const mismatch of autorMismatches) {
      const record = mismatch as any;
      stats.errors.push({
        entityId: record.cancionId,
        error: `autorIds mismatch: expected ${JSON.stringify(record.expectedAutorIds)}, actual ${JSON.stringify(record.actualAutorIds)}`,
      });
    }
  } else {
    console.log('  ✅ All Cancion.autorIds values match AUTOR_DE relationships');
  }
  
  return stats;
}

/**
 * Main migration function
 */
export async function backfillRedundantProperties(): Promise<MigrationStats> {
  const db = Neo4jClient.getInstance();
  
  console.log('========================================');
  console.log('Backfilling Redundant Properties');
  console.log('========================================\n');
  
  try {
    // Step 1: Backfill properties
    const fabricaStats = await backfillJingleFabricaIds(db);
    const cancionStats = await backfillJingleCancionIds(db);
    const autorStats = await backfillCancionAutorIds(db);
    
    console.log('\n');
    
    // Step 2: Create indexes
    await createIndexes(db);
    
    console.log('\n');
    
    // Step 3: Validate
    const validationStats = await validateRedundantProperties(db);
    
    // Combine stats (convert BigInt to Number if needed)
    const stats: MigrationStats = {
      jinglesUpdated: Number(fabricaStats.updated) + Number(cancionStats.updated),
      jinglesWithFabrica: Number(fabricaStats.withFabrica),
      jinglesWithCancion: Number(cancionStats.withCancion),
      cancionesUpdated: Number(autorStats.updated),
      cancionesWithAutores: Number(autorStats.withAutores),
      errors: validationStats.errors,
    };
    
    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Jingles updated: ${stats.jinglesUpdated}`);
    console.log(`  - With fabricaId: ${stats.jinglesWithFabrica}`);
    console.log(`  - With cancionId: ${stats.jinglesWithCancion}`);
    console.log(`Canciones updated: ${stats.cancionesUpdated}`);
    console.log(`  - With autorIds: ${stats.cancionesWithAutores}`);
    console.log(`Validation errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️  Validation errors found. Please review:');
      stats.errors.forEach((error) => {
        console.log(`  - ${error.entityId}: ${error.error}`);
      });
    } else {
      console.log('\n✅ All redundant properties validated successfully!');
    }
    
    return stats;
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  backfillRedundantProperties()
    .then((stats) => {
      console.log('\nMigration completed.');
      process.exit(stats.errors.length > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

