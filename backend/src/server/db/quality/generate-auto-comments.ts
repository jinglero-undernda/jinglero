#!/usr/bin/env node

/**
 * Generate auto-comments for all existing Jingle entities
 * 
 * This script backfills the autoComment property for all Jingles in the database.
 * The autoComment is a system-generated summary that includes Fabrica date/timestamp,
 * Title, Cancion, Autores, Primary Tematica, and Jingleros.
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/quality/generate-auto-comments.ts [options]
 * 
 * Options:
 *   --dry-run          Run in dry-run mode (default: true, shows what would be updated)
 *   --execute          Execute updates (requires explicit flag, sets dry-run to false)
 *   --limit N          Limit to first N Jingles (for testing)
 */

import { Neo4jClient } from '../index';
import { generateJingleAutoComment, updateJingleAutoComment } from '../../utils/jingleAutoComment';
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
Generate Auto-Comments for Jingles

Usage:
  npx ts-node backend/src/server/db/quality/generate-auto-comments.ts [options]

Options:
  --dry-run                    Run in dry-run mode (default: true, shows what would be updated)
  --execute                    Execute updates (requires explicit flag, sets dry-run to false)
  --limit N                    Limit to first N Jingles (for testing)
  --help, -h                   Show this help message

Examples:
  # Preview what would be updated (dry-run)
  npx ts-node backend/src/server/db/quality/generate-auto-comments.ts

  # Preview first 10 Jingles
  npx ts-node backend/src/server/db/quality/generate-auto-comments.ts --limit 10

  # Execute updates for all Jingles
  npx ts-node backend/src/server/db/quality/generate-auto-comments.ts --execute
`);
}

async function main(): Promise<void> {
  const options = parseArgs();
  const db = Neo4jClient.getInstance();
  
  console.log('='.repeat(60));
  console.log('Generate Auto-Comments for Jingles');
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
      RETURN j.id AS id, j.autoComment AS currentAutoComment
      ORDER BY j.createdAt ASC
      ${limitClause}
    `;
    
    const jingles = await db.executeQuery<{ id: string; currentAutoComment: string | null }>(query);
    
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
        const newAutoComment = await generateJingleAutoComment(db, jingle.id);
        const currentAutoComment = jingle.currentAutoComment || '';
        
        if (newAutoComment === currentAutoComment) {
          unchanged++;
          console.log(`${progress} ${jingle.id}: No change needed`);
        } else {
          updated++;
          console.log(`${progress} ${jingle.id}:`);
          if (currentAutoComment) {
            console.log(`  Current: ${currentAutoComment.substring(0, 80)}${currentAutoComment.length > 80 ? '...' : ''}`);
          } else {
            console.log(`  Current: (empty)`);
          }
          console.log(`  New:     ${newAutoComment.substring(0, 80)}${newAutoComment.length > 80 ? '...' : ''}`);
          
          if (!options.dryRun) {
            await updateJingleAutoComment(db, jingle.id);
            console.log(`  ✓ Updated`);
          } else {
            console.log(`  (would update)`);
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

