#!/usr/bin/env node

/**
 * Update displaySecondary for all existing Jingle entities
 * 
 * This script backfills the displaySecondary property for all Jingles in the database.
 * The displaySecondary format is: '🏭 {fabricaDate} • 📦 {cancionTitle} • 🚚 {autores} • 🔧 {jinglero} • 🏷️ {tematica}'
 * 
 * This migration is needed because the old displaySecondary was based on autoComment which included the Title.
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/quality/update-jingle-display-secondary.ts [options]
 * 
 * Options:
 *   --dry-run          Run in dry-run mode (default: true, shows what would be updated)
 *   --execute          Execute updates (requires explicit flag, sets dry-run to false)
 *   --limit N          Limit to first N Jingles (for testing)
 */

import { Neo4jClient } from '../index';
import { updateDisplayProperties } from '../../utils/displayProperties';
import * as readline from 'readline';

interface CliOptions {
  dryRun: boolean;
  execute: boolean;
  limit?: number;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    dryRun: true,
    execute: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--execute') {
      options.execute = true;
      options.dryRun = false;
    } else if (arg === '--limit' && i + 1 < args.length) {
      options.limit = parseInt(args[i + 1], 10);
      if (isNaN(options.limit) || options.limit < 1) {
        console.error('Error: --limit must be a positive integer');
        process.exit(1);
      }
      i++;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function printHelp(): void {
  console.log(`
Update displaySecondary for Jingles

Usage:
  npx ts-node backend/src/server/db/quality/update-jingle-display-secondary.ts [options]

Options:
  --dry-run                    Run in dry-run mode (default: true, shows what would be updated)
  --execute                    Execute updates (requires explicit flag, sets dry-run to false)
  --limit N                    Limit to first N Jingles (for testing)
  --help, -h                   Show this help message

Examples:
  # Preview what would be updated (dry-run)
  npx ts-node backend/src/server/db/quality/update-jingle-display-secondary.ts

  # Preview first 10 Jingles
  npx ts-node backend/src/server/db/quality/update-jingle-display-secondary.ts --limit 10

  # Execute updates for all Jingles
  npx ts-node backend/src/server/db/quality/update-jingle-display-secondary.ts --execute
`);
}

async function main(): Promise<void> {
  const options = parseArgs();
  const db = Neo4jClient.getInstance();
  
  console.log('='.repeat(60));
  console.log('Update displaySecondary for Jingles');
  console.log('='.repeat(60));
  console.log(`Mode: ${options.dryRun ? 'DRY-RUN (no changes will be made)' : 'EXECUTE (updating database)'}`);
  if (options.limit) {
    console.log(`Limit: First ${options.limit} Jingles`);
  }
  console.log('');
  
  try {
    // Query all Jingles
    const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
    const query = `
      MATCH (j:Jingle)
      RETURN j.id AS id, j.displaySecondary AS currentDisplaySecondary
      ORDER BY j.createdAt ASC
      ${limitClause}
    `;
    
    const jingles = await db.executeQuery<{ id: string; currentDisplaySecondary: string | null }>(query);
    
    if (jingles.length === 0) {
      console.log('No Jingles found in database.');
      return;
    }
    
    console.log(`Found ${jingles.length} Jingle(s) to process.\n`);
    
    let updated = 0;
    let unchanged = 0;
    let errors = 0;
    
    // Process each Jingle
    for (let i = 0; i < jingles.length; i++) {
      const jingle = jingles[i];
      const progress = `[${i + 1}/${jingles.length}]`;
      
      try {
        // Get the new displaySecondary by querying the entity after update
        if (!options.dryRun) {
          await updateDisplayProperties(db, 'jingle', jingle.id);
        }
        
        // Query to get the new value for comparison
        const checkQuery = `
          MATCH (j:Jingle {id: $id})
          RETURN j.displaySecondary AS newDisplaySecondary
        `;
        const result = await db.executeQuery<{ newDisplaySecondary: string | null }>(checkQuery, { id: jingle.id });
        const newDisplaySecondary = result.length > 0 ? (result[0].newDisplaySecondary || '') : '';
        const currentDisplaySecondary = jingle.currentDisplaySecondary || '';
        
        if (newDisplaySecondary === currentDisplaySecondary) {
          unchanged++;
          console.log(`${progress} ${jingle.id}: No change needed`);
        } else {
          updated++;
          console.log(`${progress} ${jingle.id}:`);
          if (currentDisplaySecondary) {
            console.log(`  Current: ${currentDisplaySecondary.substring(0, 80)}${currentDisplaySecondary.length > 80 ? '...' : ''}`);
          } else {
            console.log(`  Current: (empty)`);
          }
          console.log(`  New:     ${newDisplaySecondary.substring(0, 80)}${newDisplaySecondary.length > 80 ? '...' : ''}`);
          
          if (options.dryRun) {
            console.log(`  (would update)`);
          } else {
            console.log(`  ✓ Updated`);
          }
        }
      } catch (error: any) {
        errors++;
        console.error(`${progress} ${jingle.id}: ERROR - ${error.message || error}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Summary');
    console.log('='.repeat(60));
    console.log(`Total Jingles: ${jingles.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Unchanged: ${unchanged}`);
    console.log(`Errors: ${errors}`);
    
    if (options.dryRun) {
      console.log('\n⚠️  DRY-RUN MODE: No changes were made.');
      console.log('   Run with --execute to apply updates.');
    } else {
      console.log('\n✓ Updates completed successfully.');
    }
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };

