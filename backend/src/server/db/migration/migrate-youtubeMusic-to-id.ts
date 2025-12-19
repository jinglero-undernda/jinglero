/**
 * Migration Script: Migrate youtubeMusic from URLs to Video IDs
 * 
 * This script migrates the youtubeMusic property on Cancion nodes from storing
 * full YouTube URLs to storing only the 11-character video ID.
 * 
 * URL patterns supported:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?other=params&v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/migration/migrate-youtubeMusic-to-id.ts [--dry-run] [--execute] [--limit N]
 * 
 * Options:
 *   --dry-run          Run in dry-run mode (default: true, shows what would be updated)
 *   --execute          Execute updates (requires explicit flag, sets dry-run to false)
 *   --limit N          Limit to first N entities (for testing)
 * 
 * Or import and run:
 *   import { migrateYoutubeMusicToId } from './migrate-youtubeMusic-to-id';
 *   await migrateYoutubeMusicToId({ execute: true });
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from backend/.env
// __dirname will be backend/src/server/db/migration, so go up 4 levels to backend/
dotenv.config({ path: resolve(__dirname, '../../../../.env') });

import { Neo4jClient } from '../index';

interface MigrationOptions {
  dryRun?: boolean;
  execute?: boolean;
  limit?: number;
}

interface MigrationStats {
  totalProcessed: number;
  migrated: number;
  alreadyValid: number;
  failed: number;
  errors: Array<{ cancionId: string; error: string }>;
}

/**
 * Validate YouTube Video ID format
 * Pattern: Exactly 11 characters, alphanumeric + `-` and `_`
 */
function isValidYouTubeId(value: string): boolean {
  if (value.length !== 11) return false;
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(value);
}

/**
 * Extract YouTube video ID from URL
 * Returns the video ID if found, null otherwise
 */
function extractVideoIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Pattern 1: Standard YouTube URLs with ?v=VIDEO_ID
  // Matches: https://www.youtube.com/watch?v=VIDEO_ID
  // Matches: https://music.youtube.com/watch?v=VIDEO_ID
  const pattern1 = /(?:https?:\/\/)?(?:www\.|music\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  const match1 = url.match(pattern1);
  if (match1 && match1[1]) {
    return match1[1];
  }

  // Pattern 2: YouTube URLs with additional parameters &v=VIDEO_ID
  // Matches: https://www.youtube.com/watch?other=params&v=VIDEO_ID
  const pattern2 = /(?:https?:\/\/)?(?:www\.|music\.)?youtube\.com\/.*[&?]v=([a-zA-Z0-9_-]{11})/;
  const match2 = url.match(pattern2);
  if (match2 && match2[1]) {
    return match2[1];
  }

  // Pattern 3: Short YouTube URLs youtu.be/VIDEO_ID
  // Matches: https://youtu.be/VIDEO_ID
  const pattern3 = /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const match3 = url.match(pattern3);
  if (match3 && match3[1]) {
    return match3[1];
  }

  return null;
}

/**
 * Main migration function
 */
export async function migrateYoutubeMusicToId(options: MigrationOptions = {}): Promise<MigrationStats> {
  const db = Neo4jClient.getInstance();
  
  const dryRun = options.dryRun !== false && !options.execute;
  const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
  
  console.log('========================================');
  console.log('Migrate youtubeMusic: URL → Video ID');
  console.log('========================================');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (no changes will be made)' : 'EXECUTE (updating database)'}`);
  if (options.limit) {
    console.log(`Limit: First ${options.limit} entities`);
  }
  console.log('');
  
  const stats: MigrationStats = {
    totalProcessed: 0,
    migrated: 0,
    alreadyValid: 0,
    failed: 0,
    errors: [],
  };
  
  try {
    // Query all Cancion nodes with non-empty youtubeMusic property
    const query = `
      MATCH (c:Cancion)
      WHERE c.youtubeMusic IS NOT NULL AND c.youtubeMusic <> ''
      RETURN c.id AS id,
             c.youtubeMusic AS currentValue
      ORDER BY c.createdAt ASC
      ${limitClause}
    `;
    
    const canciones = await db.executeQuery<{
      id: string;
      currentValue: string;
    }>(query);
    
    if (canciones.length === 0) {
      console.log('No Canciones with youtubeMusic property found.');
      return stats;
    }
    
    console.log(`Found ${canciones.length} Canciones to process.\n`);
    stats.totalProcessed = canciones.length;
    
    for (let i = 0; i < canciones.length; i++) {
      const cancion = canciones[i];
      const progress = `    [${i + 1}/${canciones.length}]`;
      const currentValue = cancion.currentValue;
      
      try {
        // Check if already a valid YouTube ID
        if (isValidYouTubeId(currentValue)) {
          stats.alreadyValid++;
          if (canciones.length <= 10) {
            console.log(`${progress} ${cancion.id}: Already valid ID "${currentValue}" (no change needed)`);
          }
          continue;
        }
        
        // Try to extract video ID from URL
        const extractedId = extractVideoIdFromUrl(currentValue);
        
        if (!extractedId) {
          stats.failed++;
          console.warn(`${progress} ${cancion.id}: Could not extract video ID from "${currentValue}"`);
          stats.errors.push({
            cancionId: cancion.id,
            error: `Could not extract video ID from URL: ${currentValue}`,
          });
          continue;
        }
        
        // Validate extracted ID
        if (!isValidYouTubeId(extractedId)) {
          stats.failed++;
          console.warn(`${progress} ${cancion.id}: Extracted ID "${extractedId}" is not valid`);
          stats.errors.push({
            cancionId: cancion.id,
            error: `Extracted ID "${extractedId}" is not a valid YouTube ID`,
          });
          continue;
        }
        
        // Update the property
        stats.migrated++;
        console.log(`${progress} ${cancion.id}:`);
        console.log(`      "${currentValue}" -> "${extractedId}"`);
        
        if (!dryRun && options.execute) {
          const updateQuery = `
            MATCH (c:Cancion { id: $id })
            SET c.youtubeMusic = $videoId
            RETURN c
          `;
          
          await db.executeQuery(updateQuery, {
            id: cancion.id,
            videoId: extractedId,
          }, undefined, true);
          
          console.log(`      ✓ Updated`);
        } else {
          console.log(`      (would update)`);
        }
      } catch (error: any) {
        stats.failed++;
        stats.errors.push({
          cancionId: cancion.id,
          error: error.message || String(error),
        });
        console.error(`${progress} ${cancion.id}: ERROR - ${error.message || error}`);
      }
    }
    
    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Total processed: ${stats.totalProcessed}`);
    console.log(`Migrated (URL → ID): ${stats.migrated}`);
    console.log(`Already valid IDs: ${stats.alreadyValid}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\nErrors:');
      stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.cancionId}: ${error.error}`);
      });
    }
    
    if (dryRun) {
      console.log('\n⚠️  DRY-RUN MODE: No changes were made.');
      console.log('   Run with --execute to apply updates.');
    } else {
      console.log('\n✓ Migration completed successfully.');
    }
    
    return stats;
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    throw error;
  }
}

// CLI interface
function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
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
      console.log(`
Migrate youtubeMusic: URL → Video ID

Usage:
  npx ts-node backend/src/server/db/migration/migrate-youtubeMusic-to-id.ts [options]

Options:
  --dry-run                    Run in dry-run mode (default: true, shows what would be updated)
  --execute                    Execute updates (requires explicit flag, sets dry-run to false)
  --limit N                    Limit to first N entities (for testing)
  --help, -h                   Show this help message

Examples:
  # Preview what would be updated (dry-run)
  npx ts-node backend/src/server/db/migration/migrate-youtubeMusic-to-id.ts

  # Preview first 10 entities
  npx ts-node backend/src/server/db/migration/migrate-youtubeMusic-to-id.ts --limit 10

  # Execute updates for all entities
  npx ts-node backend/src/server/db/migration/migrate-youtubeMusic-to-id.ts --execute
`);
      process.exit(0);
    }
  }
  
  return options;
}

// Run if executed directly
if (require.main === module) {
  const options = parseArgs();
  migrateYoutubeMusicToId(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

