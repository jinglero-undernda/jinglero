#!/usr/bin/env node

/**
 * Generate display properties for all existing entities
 * 
 * This script backfills the displayPrimary, displaySecondary, and displayBadges
 * properties for all entities in the database.
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/cleanup/scripts/generate-display-properties.ts [options]
 * 
 * Options:
 *   --dry-run          Run in dry-run mode (default: true, shows what would be updated)
 *   --execute          Execute updates (requires explicit flag, sets dry-run to false)
 *   --type TYPE        Process only specific entity type (fabricas, jingles, canciones, artistas, tematicas)
 *   --limit N          Limit to first N entities per type (for testing)
 */

import { Neo4jClient } from '../../index';
import { updateDisplayProperties, generateDisplayPrimary, generateDisplaySecondary, generateDisplayBadges } from '../../../utils/displayProperties';

interface CliOptions {
  dryRun: boolean;
  execute: boolean;
  type?: string;
  limit?: number;
}

const ENTITY_TYPES = ['fabricas', 'jingles', 'canciones', 'artistas', 'tematicas'] as const;
type EntityType = typeof ENTITY_TYPES[number];

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
    } else if (arg === '--type' && i + 1 < args.length) {
      options.type = args[i + 1].toLowerCase();
      if (!ENTITY_TYPES.includes(options.type as EntityType)) {
        console.error(`Error: --type must be one of: ${ENTITY_TYPES.join(', ')}`);
        process.exit(1);
      }
      i++;
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
Generate Display Properties for Entities

Usage:
  npx ts-node backend/src/server/db/cleanup/scripts/generate-display-properties.ts [options]

Options:
  --dry-run                    Run in dry-run mode (default: true, shows what would be updated)
  --execute                    Execute updates (requires explicit flag, sets dry-run to false)
  --type TYPE                  Process only specific entity type (fabricas, jingles, canciones, artistas, tematicas)
  --limit N                    Limit to first N entities per type (for testing)
  --help, -h                   Show this help message

Examples:
  # Preview what would be updated (dry-run)
  npx ts-node backend/src/server/db/cleanup/scripts/generate-display-properties.ts

  # Preview first 10 entities of each type
  npx ts-node backend/src/server/db/cleanup/scripts/generate-display-properties.ts --limit 10

  # Execute updates for all entities
  npx ts-node backend/src/server/db/cleanup/scripts/generate-display-properties.ts --execute

  # Execute updates for Jingles only
  npx ts-node backend/src/server/db/cleanup/scripts/generate-display-properties.ts --execute --type jingles
`);
}

const LABEL_MAP: Record<EntityType, string> = {
  fabricas: 'Fabrica',
  jingles: 'Jingle',
  canciones: 'Cancion',
  artistas: 'Artista',
  tematicas: 'Tematica',
};

async function processEntityType(
  db: Neo4jClient,
  entityType: EntityType,
  options: CliOptions
): Promise<{ updated: number; unchanged: number; errors: number }> {
  const label = LABEL_MAP[entityType];
  const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
  
  const query = `
    MATCH (n:${label})
    RETURN n.id AS id,
           n.displayPrimary AS currentDisplayPrimary,
           n.displaySecondary AS currentDisplaySecondary,
           n.displayBadges AS currentDisplayBadges
    ORDER BY n.createdAt ASC
    ${limitClause}
  `;
  
  const entities = await db.executeQuery<{
    id: string;
    currentDisplayPrimary: string | null;
    currentDisplaySecondary: string | null;
    currentDisplayBadges: string[] | null;
  }>(query);
  
  if (entities.length === 0) {
    console.log(`  No ${entityType} found.`);
    return { updated: 0, unchanged: 0, errors: 0 };
  }
  
  console.log(`  Found ${entities.length} ${entityType} to process.`);
  
  let updated = 0;
  let unchanged = 0;
  let errors = 0;
  
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const progress = `    [${i + 1}/${entities.length}]`;
    
    try {
      const [newDisplayPrimary, newDisplaySecondary, newDisplayBadges] = await Promise.all([
        generateDisplayPrimary(db, entityType, entity.id),
        generateDisplaySecondary(db, entityType, entity.id),
        generateDisplayBadges(db, entityType, entity.id),
      ]);
      
      const currentDisplayPrimary = entity.currentDisplayPrimary || '';
      const currentDisplaySecondary = entity.currentDisplaySecondary || '';
      const currentDisplayBadges = entity.currentDisplayBadges || [];
      
      const primaryChanged = newDisplayPrimary !== currentDisplayPrimary;
      const secondaryChanged = newDisplaySecondary !== currentDisplaySecondary;
      const badgesChanged = JSON.stringify(newDisplayBadges.sort()) !== JSON.stringify((currentDisplayBadges || []).sort());
      
      if (!primaryChanged && !secondaryChanged && !badgesChanged) {
        unchanged++;
        if (entities.length <= 10) {
          console.log(`${progress} ${entity.id}: No change needed`);
        }
      } else {
        updated++;
        console.log(`${progress} ${entity.id}:`);
        if (primaryChanged) {
          console.log(`      displayPrimary: "${currentDisplayPrimary || '(empty)'}" -> "${newDisplayPrimary}"`);
        }
        if (secondaryChanged) {
          console.log(`      displaySecondary: "${currentDisplaySecondary || '(empty)'}" -> "${newDisplaySecondary}"`);
        }
        if (badgesChanged) {
          console.log(`      displayBadges: ${JSON.stringify(currentDisplayBadges)} -> ${JSON.stringify(newDisplayBadges)}`);
        }
        
        if (!options.dryRun) {
          await updateDisplayProperties(db, entityType, entity.id);
          console.log(`      ✓ Updated`);
        } else {
          console.log(`      (would update)`);
        }
      }
    } catch (error: any) {
      errors++;
      console.error(`${progress} ${entity.id}: ERROR - ${error.message || error}`);
    }
  }
  
  return { updated, unchanged, errors };
}

async function main(): Promise<void> {
  const options = parseArgs();
  const db = Neo4jClient.getInstance();
  
  console.log('='.repeat(60));
  console.log('Generate Display Properties for Entities');
  console.log('='.repeat(60));
  console.log(`Mode: ${options.dryRun ? 'DRY-RUN (no changes will be made)' : 'EXECUTE (updating database)'}`);
  if (options.type) {
    console.log(`Type: ${options.type} only`);
  }
  if (options.limit) {
    console.log(`Limit: First ${options.limit} entities per type`);
  }
  console.log('');
  
  try {
    const typesToProcess = options.type ? [options.type as EntityType] : ENTITY_TYPES;
    
    let totalUpdated = 0;
    let totalUnchanged = 0;
    let totalErrors = 0;
    
    for (const entityType of typesToProcess) {
      console.log(`Processing ${entityType}...`);
      const result = await processEntityType(db, entityType, options);
      totalUpdated += result.updated;
      totalUnchanged += result.unchanged;
      totalErrors += result.errors;
      console.log(`  Summary: ${result.updated} updated, ${result.unchanged} unchanged, ${result.errors} errors\n`);
    }
    
    console.log('='.repeat(60));
    console.log('Overall Summary');
    console.log('='.repeat(60));
    console.log(`Total Updated: ${totalUpdated}`);
    console.log(`Total Unchanged: ${totalUnchanged}`);
    console.log(`Total Errors: ${totalErrors}`);
    
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

