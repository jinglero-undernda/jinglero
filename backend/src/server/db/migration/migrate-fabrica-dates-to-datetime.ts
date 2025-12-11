/**
 * Migrate Fabrica date properties from string to datetime
 * 
 * This script converts all existing Fabrica date properties
 * from string format (DD/MM/YYYY or ISO) to Neo4j datetime objects.
 * 
 * Usage:
 *   npx ts-node src/server/db/migration/migrate-fabrica-dates-to-datetime.ts [--dry-run]
 * 
 * Example:
 *   npx ts-node src/server/db/migration/migrate-fabrica-dates-to-datetime.ts --dry-run
 *   npx ts-node src/server/db/migration/migrate-fabrica-dates-to-datetime.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from backend/.env
// __dirname will be backend/src/server/db/migration, so go up 4 levels to backend/
dotenv.config({ path: resolve(__dirname, '../../../../.env') });

import { Neo4jClient } from '../index';

/**
 * Convert date string to ISO format for Neo4j datetime conversion
 * Handles DD/MM/YYYY, MM/DD/YYYY, and ISO formats
 */
function parseDateToISO(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  const trimmed = dateStr.trim();
  
  // Already in ISO format
  if (trimmed.includes('T') || trimmed.includes('Z')) {
    return trimmed;
  }
  
  // Handle DD/MM/YYYY format
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [part1, part2, part3] = parts;
      
      // Determine if it's DD/MM/YYYY or MM/DD/YYYY
      // If first part > 12, it's likely DD/MM/YYYY
      // If second part > 12, it's likely MM/DD/YYYY
      let day: string, month: string, year: string;
      
      if (parseInt(part1, 10) > 12) {
        // DD/MM/YYYY format
        day = part1.padStart(2, '0');
        month = part2.padStart(2, '0');
        year = part3;
      } else if (parseInt(part2, 10) > 12) {
        // MM/DD/YYYY format
        month = part1.padStart(2, '0');
        day = part2.padStart(2, '0');
        year = part3;
      } else {
        // Ambiguous - assume DD/MM/YYYY (more common in your system)
        day = part1.padStart(2, '0');
        month = part2.padStart(2, '0');
        year = part3;
      }
      
      return `${year}-${month}-${day}T00:00:00.000Z`;
    }
  }
  
  // Handle YYYY-MM-DD format
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${trimmed}T00:00:00.000Z`;
  }
  
  return null;
}

/**
 * Main migration function
 */
async function migrateFabricaDatesToDatetime(dryRun: boolean = false): Promise<void> {
  const db = Neo4jClient.getInstance();
  
  console.log('🔄 Starting Fabrica date migration (string → datetime)...');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}\n`);
  
  try {
    // Query all Fabricas with date properties
    // We'll check if they're strings by trying to convert to string and checking format
    const query = `
      MATCH (f:Fabrica)
      WHERE f.date IS NOT NULL
      RETURN f.id AS id, f.title AS title, f.date AS date, toString(f.date) AS dateString
      ORDER BY f.id
    `;
    
    const fabricas = await db.executeQuery<{
      id: string;
      title: string | null;
      date: any;
      dateString: string;
    }>(query);
    
    if (fabricas.length === 0) {
      console.log('ℹ️  No Fabricas found with date properties.');
      return;
    }
    
    console.log(`📊 Found ${fabricas.length} Fabricas to process\n`);
    
    let processed = 0;
    let converted = 0;
    let alreadyDatetime = 0;
    let skipped = 0;
    let errors = 0;
    const errorsList: Array<{ id: string; title: string | null; date: any; error: string }> = [];
    
    // Process in batches
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < fabricas.length; i += BATCH_SIZE) {
      const batch = fabricas.slice(i, i + BATCH_SIZE);
      
      for (const fabrica of batch) {
        processed++;
        
        try {
          // Check if already a datetime object by examining the actual JavaScript type
          // Neo4j datetime objects are returned as objects with year, month, day properties
          // Strings (even ISO strings) are returned as JavaScript strings
          const isDatetime = typeof fabrica.date === 'object' && 
                            fabrica.date !== null &&
                            !Array.isArray(fabrica.date) &&
                            'year' in fabrica.date &&
                            'month' in fabrica.date &&
                            'day' in fabrica.date;
          
          if (isDatetime) {
            alreadyDatetime++;
            if (processed % 50 === 0) {
              console.log(`  [${processed}/${fabricas.length}] Already datetime: ${fabrica.id} - ${fabrica.title || 'No title'}`);
            }
            continue;
          }
          
          // It's a string - convert to ISO format
          const dateStr = String(fabrica.dateString || fabrica.date);
          const isoDate = parseDateToISO(dateStr);
          
          if (!isoDate) {
            skipped++;
            console.warn(`  ⚠️  [${processed}/${fabricas.length}] Could not parse date: ${fabrica.id} - "${dateStr}"`);
            continue;
          }
          
          if (dryRun) {
            console.log(`  [${processed}/${fabricas.length}] Would convert: ${fabrica.id} - ${fabrica.title || 'No title'}`);
            console.log(`    "${dateStr}" → ${isoDate} → datetime`);
            converted++;
          } else {
            // Update the Fabrica date to datetime
            const updateQuery = `
              MATCH (f:Fabrica {id: $id})
              SET f.date = datetime($isoDate)
              RETURN f.id AS id, f.date AS date
            `;
            
            await db.executeQuery(updateQuery, {
              id: fabrica.id,
              isoDate,
            }, undefined, true);
            
            converted++;
            
            if (processed % 50 === 0) {
              console.log(`  [${processed}/${fabricas.length}] Converted: ${fabrica.id} - ${fabrica.title || 'No title'}`);
            }
          }
        } catch (error: any) {
          errors++;
          errorsList.push({
            id: fabrica.id,
            title: fabrica.title,
            date: fabrica.date,
            error: error.message || String(error),
          });
          console.error(`  ❌ Error processing ${fabrica.id}:`, error.message);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`   Total Fabricas: ${fabricas.length}`);
    console.log(`   Processed: ${processed}`);
    console.log(`   ${dryRun ? 'Would convert' : 'Converted'}: ${converted}`);
    console.log(`   Already datetime: ${alreadyDatetime}`);
    console.log(`   Skipped (unparseable): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log('='.repeat(60));
    
    if (errors > 0) {
      console.log('\n❌ Errors encountered:');
      errorsList.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.id} - ${err.title || 'No title'}`);
        console.log(`      Date: ${err.date}`);
        console.log(`      Error: ${err.error}`);
      });
    }
    
    // Validate migration
    if (!dryRun && converted > 0) {
      console.log('\n🔍 Validating migration...');
      
      // Check total count
      const totalQuery = `
        MATCH (f:Fabrica)
        WHERE f.date IS NOT NULL
        RETURN count(f) AS total
      `;
      const totalResult = await db.executeQuery<{ total: number }>(totalQuery);
      const total = totalResult[0]?.total || 0;
      
      // Sample a few Fabricas to verify they're datetime objects
      const sampleQuery = `
        MATCH (f:Fabrica)
        WHERE f.date IS NOT NULL
        RETURN f.id AS id, f.date AS date, f.date.epochMillis AS epochMillis
        LIMIT 10
      `;
      const samples = await db.executeQuery<{ id: string; date: any; epochMillis: any }>(sampleQuery);
      
      const allDatetime = samples.every(s => s.epochMillis !== null && s.epochMillis !== undefined);
      
      console.log(`   Total Fabricas with dates: ${total}`);
      console.log(`   Sample check: ${samples.length} Fabricas checked`);
      
      if (allDatetime && samples.length > 0) {
        console.log('   ✅ All sampled dates are datetime objects');
        console.log(`   ✅ Migration successful: ${converted} Fabricas converted`);
      } else if (samples.length === 0) {
        console.log('   ⚠️  No Fabricas found to validate');
      } else {
        console.warn(`   ⚠️  Warning: Some dates may not be datetime objects`);
        samples.forEach(s => {
          console.log(`      ${s.id}: epochMillis = ${s.epochMillis}`);
        });
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
  
  migrateFabricaDatesToDatetime(dryRun)
    .then(() => {
      console.log(`\n✅ Migration ${dryRun ? 'dry-run' : ''} completed successfully`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateFabricaDatesToDatetime };

