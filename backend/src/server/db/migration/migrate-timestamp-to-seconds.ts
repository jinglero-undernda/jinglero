/**
 * Migrate APPEARS_IN relationship timestamps from string (HH:MM:SS) to integer (seconds)
 * 
 * This script converts all existing APPEARS_IN relationship timestamp properties
 * from HH:MM:SS string format to integer seconds format.
 * 
 * Usage:
 *   npx ts-node src/server/db/migration/migrate-timestamp-to-seconds.ts [--dry-run]
 * 
 * Example:
 *   npx ts-node src/server/db/migration/migrate-timestamp-to-seconds.ts --dry-run
 *   npx ts-node src/server/db/migration/migrate-timestamp-to-seconds.ts
 */

import { Neo4jClient } from '../index';

/**
 * Convert timestamp string (HH:MM:SS) to seconds
 */
function timestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;
  const parts = timestamp.split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds as HH:MM:SS for display
 */
function formatSecondsToTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Main migration function
 */
async function migrateTimestampsToSeconds(dryRun: boolean = false): Promise<void> {
  const db = Neo4jClient.getInstance();
  
  console.log('🔄 Starting APPEARS_IN timestamp migration...');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}\n`);
  
  try {
    // Query all APPEARS_IN relationships with timestamps
    const query = `
      MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
      WHERE r.timestamp IS NOT NULL
      RETURN j.id AS jingleId, f.id AS fabricaId, r.timestamp AS timestamp, id(r) AS relId
      ORDER BY f.id, r.timestamp ASC
    `;
    
    const relationships = await db.executeQuery<{
      jingleId: string;
      fabricaId: string;
      timestamp: string | number;
      relId: any;
    }>(query);
    
    if (relationships.length === 0) {
      console.log('ℹ️  No APPEARS_IN relationships found with timestamps.');
      return;
    }
    
    console.log(`📊 Found ${relationships.length} APPEARS_IN relationships to process\n`);
    
    let processed = 0;
    let converted = 0;
    let alreadyInteger = 0;
    let errors = 0;
    const errorsList: Array<{ jingleId: string; fabricaId: string; timestamp: any; error: string }> = [];
    
    // Process in batches
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < relationships.length; i += BATCH_SIZE) {
      const batch = relationships.slice(i, i + BATCH_SIZE);
      
      for (const rel of batch) {
        processed++;
        
        try {
          // Check if already an integer
          if (typeof rel.timestamp === 'number') {
            alreadyInteger++;
            if (processed % 100 === 0) {
              console.log(`  [${processed}/${relationships.length}] Already integer: ${rel.jingleId} -> ${rel.fabricaId} (${rel.timestamp}s)`);
            }
            continue;
          }
          
          // Convert string to seconds
          const timestampStr = String(rel.timestamp);
          const seconds = timestampToSeconds(timestampStr);
          
          if (dryRun) {
            console.log(`  [${processed}/${relationships.length}] Would convert: ${rel.jingleId} -> ${rel.fabricaId}`);
            console.log(`    "${timestampStr}" → ${seconds} seconds (${formatSecondsToTimestamp(seconds)})`);
            converted++;
          } else {
            // Update the relationship
            const updateQuery = `
              MATCH (j:Jingle {id: $jingleId})-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
              WHERE id(r) = $relId
              SET r.timestamp = $seconds
              RETURN r
            `;
            
            await db.executeQuery(updateQuery, {
              jingleId: rel.jingleId,
              fabricaId: rel.fabricaId,
              relId: rel.relId,
              seconds,
            }, undefined, true);
            
            converted++;
            
            if (processed % 100 === 0) {
              console.log(`  [${processed}/${relationships.length}] Converted: ${rel.jingleId} -> ${rel.fabricaId} (${seconds}s)`);
            }
          }
        } catch (error: any) {
          errors++;
          errorsList.push({
            jingleId: rel.jingleId,
            fabricaId: rel.fabricaId,
            timestamp: rel.timestamp,
            error: error.message || String(error),
          });
          console.error(`  ❌ Error processing ${rel.jingleId} -> ${rel.fabricaId}:`, error.message);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`   Total relationships: ${relationships.length}`);
    console.log(`   Processed: ${processed}`);
    console.log(`   ${dryRun ? 'Would convert' : 'Converted'}: ${converted}`);
    console.log(`   Already integer: ${alreadyInteger}`);
    console.log(`   Errors: ${errors}`);
    console.log('='.repeat(60));
    
    if (errors > 0) {
      console.log('\n❌ Errors encountered:');
      errorsList.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.jingleId} -> ${err.fabricaId}`);
        console.log(`      Timestamp: ${err.timestamp}`);
        console.log(`      Error: ${err.error}`);
      });
    }
    
    // Validate migration
    if (!dryRun && converted > 0) {
      console.log('\n🔍 Validating migration...');
      // Check total count
      const totalQuery = `
        MATCH ()-[r:APPEARS_IN]->()
        WHERE r.timestamp IS NOT NULL
        RETURN count(r) AS total
      `;
      const totalResult = await db.executeQuery<{ total: number }>(totalQuery);
      const total = totalResult[0]?.total || 0;
      
      // Sample a few relationships to verify they're integers
      // Neo4j doesn't have typeof(), so we'll verify by checking if values are numeric
      const sampleQuery = `
        MATCH ()-[r:APPEARS_IN]->()
        WHERE r.timestamp IS NOT NULL
        RETURN r.timestamp AS timestamp
        LIMIT 10
      `;
      const samples = await db.executeQuery<{ timestamp: any }>(sampleQuery);
      
      const allIntegers = samples.every(s => typeof s.timestamp === 'number');
      
      console.log(`   Total timestamps: ${total}`);
      console.log(`   Sample check: ${samples.length} relationships checked`);
      
      if (allIntegers && samples.length > 0) {
        console.log('   ✅ All sampled timestamps are integers');
        console.log(`   ✅ Migration successful: ${converted} relationships converted`);
      } else if (samples.length === 0) {
        console.log('   ⚠️  No relationships found to validate');
      } else {
        console.warn(`   ⚠️  Warning: Some timestamps may not be integers`);
        console.log(`   Sample values: ${samples.map(s => `${s.timestamp} (${typeof s.timestamp})`).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  migrateTimestampsToSeconds(dryRun)
    .then(() => {
      console.log(`\n✅ Migration ${dryRun ? 'dry-run' : ''} completed successfully`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateTimestampsToSeconds };

