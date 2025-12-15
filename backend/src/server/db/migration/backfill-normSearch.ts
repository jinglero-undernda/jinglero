/**
 * Migration Script: Backfill normSearch Property
 * 
 * This script backfills the normSearch property for all existing entities:
 * - Jingle: Includes title/cancion title, autores, jingleros, fabrica title, all tags, comment
 * - Artista: Includes stageName and name
 * - Cancion: Includes title, autores, album, year
 * - Fabrica: Includes title and displaySecondary content
 * - Tematica: Includes name (with special parsing for GENTE category)
 * 
 * The normSearch property is ISO normalized (accents removed, lowercase) to enable
 * accent-insensitive, case-insensitive search.
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/migration/backfill-normSearch.ts [--dry-run] [--execute] [--type TYPE] [--limit N]
 * 
 * Options:
 *   --dry-run          Run in dry-run mode (default: true, shows what would be updated)
 *   --execute          Execute updates (requires explicit flag, sets dry-run to false)
 *   --type TYPE        Process only specific entity type (fabricas, jingles, canciones, artistas, tematicas)
 *   --limit N          Limit to first N entities per type (for testing)
 * 
 * Or import and run:
 *   import { backfillNormSearch } from './backfill-normSearch';
 *   await backfillNormSearch({ execute: true });
 */

import { Neo4jClient } from '../index';
import { generateNormSearch, updateDisplayProperties } from '../../utils/displayProperties';

interface MigrationOptions {
  dryRun?: boolean;
  execute?: boolean;
  type?: string;
  limit?: number;
}

interface MigrationStats {
  fabricasUpdated: number;
  fabricasUnchanged: number;
  jinglesUpdated: number;
  jinglesUnchanged: number;
  cancionesUpdated: number;
  cancionesUnchanged: number;
  artistasUpdated: number;
  artistasUnchanged: number;
  tematicasUpdated: number;
  tematicasUnchanged: number;
  errors: Array<{ entityType: string; entityId: string; error: string }>;
}

const ENTITY_TYPES = ['fabricas', 'jingles', 'canciones', 'artistas', 'tematicas'] as const;
type EntityType = typeof ENTITY_TYPES[number];

const LABEL_MAP: Record<EntityType, string> = {
  fabricas: 'Fabrica',
  jingles: 'Jingle',
  canciones: 'Cancion',
  artistas: 'Artista',
  tematicas: 'Tematica',
};

/**
 * Process a single entity type
 */
async function processEntityType(
  db: Neo4jClient,
  entityType: EntityType,
  options: MigrationOptions
): Promise<{ updated: number; unchanged: number; errors: Array<{ entityId: string; error: string }> }> {
  const label = LABEL_MAP[entityType];
  const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
  
  const query = `
    MATCH (n:${label})
    RETURN n.id AS id,
           n.normSearch AS currentNormSearch
    ORDER BY n.createdAt ASC
    ${limitClause}
  `;
  
  const entities = await db.executeQuery<{
    id: string;
    currentNormSearch: string | null;
  }>(query);
  
  if (entities.length === 0) {
    console.log(`  No ${entityType} found.`);
    return { updated: 0, unchanged: 0, errors: [] };
  }
  
  console.log(`  Found ${entities.length} ${entityType} to process.`);
  
  let updated = 0;
  let unchanged = 0;
  const errors: Array<{ entityId: string; error: string }> = [];
  
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const progress = `    [${i + 1}/${entities.length}]`;
    
    try {
      const newNormSearch = await generateNormSearch(db, entityType, entity.id);
      const currentNormSearch = entity.currentNormSearch || '';
      
      if (newNormSearch === currentNormSearch) {
        unchanged++;
        if (entities.length <= 10) {
          console.log(`${progress} ${entity.id}: No change needed (normSearch already set)`);
        }
      } else {
        updated++;
        console.log(`${progress} ${entity.id}:`);
        console.log(`      normSearch: "${currentNormSearch || '(empty)'}" -> "${newNormSearch}"`);
        
        if (!options.dryRun && options.execute) {
          // Use updateDisplayProperties to ensure all display properties are updated together
          await updateDisplayProperties(db, entityType, entity.id);
          console.log(`      ✓ Updated`);
        } else {
          console.log(`      (would update)`);
        }
      }
    } catch (error: any) {
      errors.push({
        entityId: entity.id,
        error: error.message || String(error),
      });
      console.error(`${progress} ${entity.id}: ERROR - ${error.message || error}`);
    }
  }
  
  return { updated, unchanged, errors };
}

/**
 * Main migration function
 */
async function backfillNormSearch(options: MigrationOptions = {}): Promise<MigrationStats> {
  const db = Neo4jClient.getInstance();
  
  const dryRun = options.dryRun !== false && !options.execute;
  const typesToProcess = options.type 
    ? [options.type.toLowerCase() as EntityType].filter(t => ENTITY_TYPES.includes(t))
    : ENTITY_TYPES;
  
  console.log('========================================');
  console.log('Backfilling normSearch Property');
  console.log('========================================');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (no changes will be made)' : 'EXECUTE (updating database)'}`);
  if (options.type) {
    console.log(`Type: ${options.type} only`);
  }
  if (options.limit) {
    console.log(`Limit: First ${options.limit} entities per type`);
  }
  console.log('');
  
  const stats: MigrationStats = {
    fabricasUpdated: 0,
    fabricasUnchanged: 0,
    jinglesUpdated: 0,
    jinglesUnchanged: 0,
    cancionesUpdated: 0,
    cancionesUnchanged: 0,
    artistasUpdated: 0,
    artistasUnchanged: 0,
    tematicasUpdated: 0,
    tematicasUnchanged: 0,
    errors: [],
  };
  
  try {
    for (const entityType of typesToProcess) {
      console.log(`Processing ${entityType}...`);
      const result = await processEntityType(db, entityType, { ...options, dryRun });
      
      // Update stats based on entity type
      switch (entityType) {
        case 'fabricas':
          stats.fabricasUpdated = result.updated;
          stats.fabricasUnchanged = result.unchanged;
          break;
        case 'jingles':
          stats.jinglesUpdated = result.updated;
          stats.jinglesUnchanged = result.unchanged;
          break;
        case 'canciones':
          stats.cancionesUpdated = result.updated;
          stats.cancionesUnchanged = result.unchanged;
          break;
        case 'artistas':
          stats.artistasUpdated = result.updated;
          stats.artistasUnchanged = result.unchanged;
          break;
        case 'tematicas':
          stats.tematicasUpdated = result.updated;
          stats.tematicasUnchanged = result.unchanged;
          break;
      }
      
      stats.errors.push(...result.errors.map(e => ({ entityType, ...e })));
      
      console.log(`  Summary: ${result.updated} updated, ${result.unchanged} unchanged, ${result.errors.length} errors\n`);
    }
    
    console.log('========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Fabricas: ${stats.fabricasUpdated} updated, ${stats.fabricasUnchanged} unchanged`);
    console.log(`Jingles: ${stats.jinglesUpdated} updated, ${stats.jinglesUnchanged} unchanged`);
    console.log(`Canciones: ${stats.cancionesUpdated} updated, ${stats.cancionesUnchanged} unchanged`);
    console.log(`Artistas: ${stats.artistasUpdated} updated, ${stats.artistasUnchanged} unchanged`);
    console.log(`Tematicas: ${stats.tematicasUpdated} updated, ${stats.tematicasUnchanged} unchanged`);
    console.log(`Total Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\nErrors:');
      stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.entityType}/${error.entityId}: ${error.error}`);
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
      console.log(`
Backfill normSearch Property

Usage:
  npx ts-node backend/src/server/db/migration/backfill-normSearch.ts [options]

Options:
  --dry-run                    Run in dry-run mode (default: true, shows what would be updated)
  --execute                    Execute updates (requires explicit flag, sets dry-run to false)
  --type TYPE                  Process only specific entity type (fabricas, jingles, canciones, artistas, tematicas)
  --limit N                    Limit to first N entities per type (for testing)
  --help, -h                   Show this help message

Examples:
  # Preview what would be updated (dry-run)
  npx ts-node backend/src/server/db/migration/backfill-normSearch.ts

  # Preview first 10 entities of each type
  npx ts-node backend/src/server/db/migration/backfill-normSearch.ts --limit 10

  # Execute updates for all entities
  npx ts-node backend/src/server/db/migration/backfill-normSearch.ts --execute

  # Execute updates for Jingles only
  npx ts-node backend/src/server/db/migration/backfill-normSearch.ts --execute --type jingles
`);
      process.exit(0);
    }
  }
  
  return options;
}

// Run if executed directly
if (require.main === module) {
  const options = parseArgs();
  backfillNormSearch(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}
// Note: `backfillNormSearch` is intentionally not exported. This file is a CLI script.

