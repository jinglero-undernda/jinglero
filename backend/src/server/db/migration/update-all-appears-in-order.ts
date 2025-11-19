/**
 * Update APPEARS_IN order for all Fabricas
 * 
 * This script triggers updateAppearsInOrder for every Fabrica that has APPEARS_IN relationships.
 * Useful after bulk imports or data migrations to ensure order properties are correctly calculated.
 * 
 * Usage:
 *   npx ts-node src/server/db/migration/update-all-appears-in-order.ts
 */

import { Neo4jClient } from '../index';

/**
 * Update order property for all APPEARS_IN relationships of a Fabrica
 * Order is calculated based on timestamp (integer seconds)
 * Relationships are sorted by timestamp ascending, then assigned sequential order (1, 2, 3, ...)
 * 
 * @param db - Neo4jClient instance
 * @param fabricaId - The ID of the Fabrica whose APPEARS_IN relationships should be reordered
 */
async function updateAppearsInOrder(db: Neo4jClient, fabricaId: string): Promise<void> {
  try {
    // Validate Fabrica exists
    const fabricaExists = await db.executeQuery(
      `MATCH (f:Fabrica {id: $fabricaId}) RETURN f.id AS id LIMIT 1`,
      { fabricaId }
    );
    
    if (fabricaExists.length === 0) {
      console.warn(`Fabrica ${fabricaId} not found, skipping order update`);
      return;
    }
    
    // Query all APPEARS_IN relationships for this Fabrica
    // Timestamps are now stored as integers (seconds), so ORDER BY works correctly
    const query = `
      MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
      RETURN j.id AS jingleId, r.timestamp AS timestamp, id(r) AS relId
      ORDER BY r.timestamp ASC, id(r) ASC
    `;
    
    const relationships = await db.executeQuery<{ 
      jingleId: string; 
      timestamp: number; 
      relId: any;
    }>(query, { fabricaId });
    
    if (relationships.length === 0) {
      return; // No relationships to update
    }
    
    // Timestamps are already integers (seconds), so we can use them directly
    const relationshipsWithOrder = relationships.map((rel, index) => {
      const seconds = typeof rel.timestamp === 'number' ? rel.timestamp : 0;
      
      return {
        jingleId: rel.jingleId,
        timestamp: seconds,
        order: index + 1,
      };
    });
    
    // Check for timestamp conflicts
    const timestampMap = new Map<number, string[]>();
    relationshipsWithOrder.forEach(rel => {
      const existing = timestampMap.get(rel.timestamp) || [];
      existing.push(rel.jingleId);
      timestampMap.set(rel.timestamp, existing);
    });
    
    // Log warnings for timestamp conflicts
    timestampMap.forEach((jingleIds, seconds) => {
      if (jingleIds.length > 1) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        console.warn(
          `Warning: Timestamp conflict in Fabrica ${fabricaId} at ${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ` +
          `(${seconds}s) for Jingles: ${jingleIds.join(', ')}. Order assigned arbitrarily.`
        );
      }
    });
    
    // Update order for all relationships
    let successCount = 0;
    let errorCount = 0;
    
    for (const rel of relationshipsWithOrder) {
      try {
        const updateQuery = `
          MATCH (j:Jingle {id: $jingleId})-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
          SET r.order = $order
        `;
        await db.executeQuery(updateQuery, {
          jingleId: rel.jingleId,
          fabricaId,
          order: rel.order,
        }, undefined, true);
        successCount++;
      } catch (updateError) {
        errorCount++;
        console.error(
          `Failed to update order for Jingle ${rel.jingleId} in Fabrica ${fabricaId}:`,
          updateError
        );
      }
    }
    
    if (successCount > 0) {
      console.log(`✅ Updated order for ${successCount} APPEARS_IN relationships in Fabrica ${fabricaId}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
    } else if (errorCount > 0) {
      console.error(`❌ Failed to update order for all ${errorCount} APPEARS_IN relationships in Fabrica ${fabricaId}`);
    }
  } catch (error) {
    console.error(`Error updating APPEARS_IN order for Fabrica ${fabricaId}:`, error);
    throw error;
  }
}

/**
 * Main function to update order for all Fabricas
 */
async function updateAllAppearsInOrder(): Promise<void> {
  const db = Neo4jClient.getInstance();
  
  console.log('🔄 Starting update of APPEARS_IN order for all Fabricas...\n');
  
  try {
    // Get all Fabricas that have APPEARS_IN relationships
    const query = `
      MATCH (f:Fabrica)
      WHERE EXISTS {
        MATCH (j:Jingle)-[r:APPEARS_IN]->(f)
      }
      RETURN DISTINCT f.id AS fabricaId
      ORDER BY f.id ASC
    `;
    
    const fabricas = await db.executeQuery<{ fabricaId: string }>(query);
    
    if (fabricas.length === 0) {
      console.log('ℹ️  No Fabricas with APPEARS_IN relationships found.');
      return;
    }
    
    console.log(`📊 Found ${fabricas.length} Fabricas with APPEARS_IN relationships\n`);
    
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    
    for (const fabrica of fabricas) {
      processed++;
      console.log(`[${processed}/${fabricas.length}] Processing Fabrica: ${fabrica.fabricaId}`);
      
      try {
        await updateAppearsInOrder(db, fabrica.fabricaId);
        succeeded++;
      } catch (error) {
        failed++;
        console.error(`❌ Failed to process Fabrica ${fabrica.fabricaId}:`, error);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('='.repeat(60));
    console.log('📈 Summary:');
    console.log(`   Total Fabricas: ${fabricas.length}`);
    console.log(`   ✅ Succeeded: ${succeeded}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  updateAllAppearsInOrder()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { updateAllAppearsInOrder, updateAppearsInOrder };

