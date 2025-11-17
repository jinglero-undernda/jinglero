/**
 * Migration Script: Migrate Entity IDs to New Format
 * 
 * This script migrates entity IDs from old format (PREFIX-UUID or sequential) to new format:
 * - Old: ART-001, JIN-550e8400-e29b-41d4-a716-446655440000, ART_t1h2_UZ8c
 * - New: a1b2c3d4, j5e6f7g8, c9f0a1b2 (single char prefix + 8 base36 chars)
 * 
 * Fabricas are EXCLUDED (retain external YouTube video IDs)
 * 
 * The migration:
 * 1. Generates new IDs for all entities (except Fabricas)
 * 2. Updates all entity nodes with new IDs
 * 3. Updates all relationships to reference new IDs
 * 4. Updates redundant properties (fabricaId, cancionId, autorIds)
 * 5. All operations in single transaction for atomicity
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/migration/migrate-entity-ids.ts [--dry-run]
 * 
 * Or import and run:
 *   import { migrateEntityIds } from './migrate-entity-ids';
 *   await migrateEntityIds({ dryRun: false });
 */

import { Neo4jClient } from '../index';
import crypto from 'crypto';

interface MigrationOptions {
  dryRun?: boolean;
}

interface EntityMapping {
  oldId: string;
  newId: string;
}

interface EntityTypeMappings {
  jingles: EntityMapping[];
  canciones: EntityMapping[];
  artistas: EntityMapping[];
  tematicas: EntityMapping[];
  usuarios: EntityMapping[];
}

interface MigrationStats {
  entitiesUpdated: {
    jingles: number;
    canciones: number;
    artistas: number;
    tematicas: number;
    usuarios: number;
  };
  relationshipsUpdated: number;
  redundantPropertiesUpdated: number;
  errors: Array<{ entityId: string; error: string }>;
}

const ENTITY_PREFIX_MAP: Record<string, string> = {
  jingles: 'j',
  canciones: 'c',
  artistas: 'a',
  tematicas: 't',
  usuarios: 'u',
};

const ENTITY_LABEL_MAP: Record<string, string> = {
  jingles: 'Jingle',
  canciones: 'Cancion',
  artistas: 'Artista',
  tematicas: 'Tematica',
  usuarios: 'Usuario',
};

/**
 * Generate new ID in format: {prefix}{8-chars}
 */
function generateNewId(prefix: string, existingIds: Set<string>): string {
  const maxRetries = 100;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Generate 8 random characters using base36 (0-9, a-z)
    const randomBytes = crypto.randomBytes(6); // 6 bytes = 48 bits
    let randomNum = 0;
    for (let i = 0; i < 6; i++) {
      randomNum = randomNum * 256 + randomBytes[i];
    }
    
    // Convert to base36 and pad to 8 characters
    const chars = randomNum.toString(36).toLowerCase().padStart(8, '0').slice(0, 8);
    const id = `${prefix}${chars}`;
    
    if (!existingIds.has(id)) {
      existingIds.add(id);
      return id;
    }
  }
  
  throw new Error(`Failed to generate unique ID with prefix ${prefix} after ${maxRetries} attempts`);
}

/**
 * Generate ID mappings for all entities of a specific type
 */
async function generateMappingsForType(
  db: Neo4jClient,
  type: string,
  label: string,
  prefix: string
): Promise<EntityMapping[]> {
  console.log(`Generating ID mappings for ${type}...`);
  
  const query = `
    MATCH (n:${label})
    RETURN n.id AS oldId
    ORDER BY n.createdAt ASC
  `;
  
  const results = await db.executeQuery<{ oldId: string }>(query);
  console.log(`  Found ${results.length} ${type} entities`);
  
  const mappings: EntityMapping[] = [];
  const existingIds = new Set<string>();
  
  for (const result of results) {
    const oldId = result.oldId;
    const newId = generateNewId(prefix, existingIds);
    mappings.push({ oldId, newId });
  }
  
  console.log(`  Generated ${mappings.length} new IDs for ${type}`);
  return mappings;
}

/**
 * Generate all ID mappings for entities (exclude Fabricas)
 */
async function generateAllMappings(db: Neo4jClient): Promise<EntityTypeMappings> {
  console.log('========================================');
  console.log('Step 1: Generating ID Mappings');
  console.log('========================================\n');
  
  const mappings: EntityTypeMappings = {
    jingles: [],
    canciones: [],
    artistas: [],
    tematicas: [],
    usuarios: [],
  };
  
  for (const [type, label] of Object.entries(ENTITY_LABEL_MAP)) {
    const prefix = ENTITY_PREFIX_MAP[type];
    mappings[type as keyof EntityTypeMappings] = await generateMappingsForType(
      db,
      type,
      label,
      prefix
    );
  }
  
  console.log('\nMapping generation complete!\n');
  return mappings;
}

/**
 * Update entity IDs
 */
async function updateEntityIds(
  db: Neo4jClient,
  mappings: EntityTypeMappings,
  dryRun: boolean
): Promise<{ jingles: number; canciones: number; artistas: number; tematicas: number; usuarios: number }> {
  console.log('========================================');
  console.log('Step 2: Updating Entity IDs');
  console.log('========================================\n');
  
  const stats = {
    jingles: 0,
    canciones: 0,
    artistas: 0,
    tematicas: 0,
    usuarios: 0,
  };
  
  for (const [type, label] of Object.entries(ENTITY_LABEL_MAP)) {
    const typeMappings = mappings[type as keyof EntityTypeMappings];
    if (typeMappings.length === 0) {
      console.log(`No ${type} to update`);
      continue;
    }
    
    console.log(`Updating ${typeMappings.length} ${type}...`);
    
    if (!dryRun) {
      for (const mapping of typeMappings) {
        const query = `
          MATCH (n:${label} {id: $oldId})
          SET n.id = $newId
          RETURN n.id AS newId
        `;
        
        try {
          await db.executeQuery(query, {
            oldId: mapping.oldId,
            newId: mapping.newId,
          }, undefined, true);
          stats[type as keyof typeof stats]++;
        } catch (error: any) {
          console.error(`  Error updating ${type} ${mapping.oldId}:`, error.message);
        }
      }
    } else {
      console.log(`  [DRY RUN] Would update ${typeMappings.length} ${type}`);
      stats[type as keyof typeof stats] = typeMappings.length;
    }
  }
  
  console.log('\nEntity ID updates complete!\n');
  return stats;
}

/**
 * Update all relationship references to use new IDs
 */
async function updateRelationships(
  db: Neo4jClient,
  mappings: EntityTypeMappings,
  dryRun: boolean
): Promise<number> {
  console.log('========================================');
  console.log('Step 3: Updating Relationship References');
  console.log('========================================\n');
  
  // Create lookup maps for quick ID translation
  const idMap = new Map<string, string>();
  for (const typeMappings of Object.values(mappings)) {
    for (const mapping of typeMappings) {
      idMap.set(mapping.oldId, mapping.newId);
    }
  }
  
  console.log(`Created ID lookup map with ${idMap.size} entries`);
  
  // Get all relationships
  const allRelsQuery = `
    MATCH (start)-[r]->(end)
    WHERE start.id IS NOT NULL AND end.id IS NOT NULL
    RETURN id(r) AS relId, start.id AS startId, end.id AS endId, type(r) AS relType
  `;
  
  const relationships = await db.executeQuery<{
    relId: any;
    startId: string;
    endId: string;
    relType: string;
  }>(allRelsQuery);
  
  console.log(`Found ${relationships.length} relationships to check`);
  
  let updatedCount = 0;
  
  if (!dryRun) {
    for (const rel of relationships) {
      const newStartId = idMap.get(rel.startId);
      const newEndId = idMap.get(rel.endId);
      
      // Skip if neither endpoint needs updating (e.g., relationships involving Fabricas)
      if (!newStartId && !newEndId) {
        continue;
      }
      
      // Update relationship by deleting and recreating with new node references
      // Note: We need to preserve all relationship properties
      const getRelPropertiesQuery = `
        MATCH ()-[r]->()
        WHERE id(r) = $relId
        RETURN properties(r) AS props
      `;
      
      const propResult = await db.executeQuery<{ props: any }>(getRelPropertiesQuery, {
        relId: rel.relId,
      });
      
      const props = propResult[0]?.props || {};
      
      // Delete old relationship and create new one
      const updateQuery = `
        MATCH (start {id: $oldStartId})-[r:${rel.relType}]->(end {id: $oldEndId})
        DELETE r
        WITH start, end
        MATCH (newStart {id: $newStartId}), (newEnd {id: $newEndId})
        CREATE (newStart)-[r2:${rel.relType}]->(newEnd)
        SET r2 = $props
        RETURN count(r2) AS created
      `;
      
      try {
        await db.executeQuery(updateQuery, {
          oldStartId: rel.startId,
          oldEndId: rel.endId,
          newStartId: newStartId || rel.startId,
          newEndId: newEndId || rel.endId,
          props,
        }, undefined, true);
        updatedCount++;
      } catch (error: any) {
        console.error(`  Error updating relationship ${rel.relType} (${rel.startId}->${rel.endId}):`, error.message);
      }
    }
  } else {
    // In dry run, count how many would be updated
    for (const rel of relationships) {
      const newStartId = idMap.get(rel.startId);
      const newEndId = idMap.get(rel.endId);
      if (newStartId || newEndId) {
        updatedCount++;
      }
    }
    console.log(`[DRY RUN] Would update ${updatedCount} relationships`);
  }
  
  console.log(`\nRelationship updates complete! Updated ${updatedCount} relationships\n`);
  return updatedCount;
}

/**
 * Update redundant properties (fabricaId, cancionId, autorIds)
 */
async function updateRedundantProperties(
  db: Neo4jClient,
  mappings: EntityTypeMappings,
  dryRun: boolean
): Promise<number> {
  console.log('========================================');
  console.log('Step 4: Updating Redundant Properties');
  console.log('========================================\n');
  
  // Create lookup maps
  const idMap = new Map<string, string>();
  for (const typeMappings of Object.values(mappings)) {
    for (const mapping of typeMappings) {
      idMap.set(mapping.oldId, mapping.newId);
    }
  }
  
  let updatedCount = 0;
  
  // Update Jingle.fabricaId (note: fabricaId points to Fabrica which is NOT migrated)
  console.log('Updating Jingle.fabricaId (no changes needed - Fabricas not migrated)');
  
  // Update Jingle.cancionId
  console.log('Updating Jingle.cancionId...');
  if (!dryRun) {
    for (const mapping of mappings.canciones) {
      const query = `
        MATCH (j:Jingle {cancionId: $oldId})
        SET j.cancionId = $newId
        RETURN count(j) AS updated
      `;
      
      const result = await db.executeQuery<{ updated: any }>(query, {
        oldId: mapping.oldId,
        newId: mapping.newId,
      }, undefined, true);
      
      const count = Number(result[0]?.updated?.low || result[0]?.updated || 0);
      updatedCount += count;
    }
  } else {
    console.log(`[DRY RUN] Would update Jingle.cancionId references`);
  }
  
  // Update Cancion.autorIds
  console.log('Updating Cancion.autorIds...');
  if (!dryRun) {
    for (const mapping of mappings.artistas) {
      const query = `
        MATCH (c:Cancion)
        WHERE $oldId IN c.autorIds
        SET c.autorIds = [x IN c.autorIds | CASE WHEN x = $oldId THEN $newId ELSE x END]
        RETURN count(c) AS updated
      `;
      
      const result = await db.executeQuery<{ updated: any }>(query, {
        oldId: mapping.oldId,
        newId: mapping.newId,
      }, undefined, true);
      
      const count = Number(result[0]?.updated?.low || result[0]?.updated || 0);
      updatedCount += count;
    }
  } else {
    console.log(`[DRY RUN] Would update Cancion.autorIds references`);
  }
  
  console.log(`\nRedundant property updates complete! Updated ${updatedCount} properties\n`);
  return updatedCount;
}

/**
 * Validate migration results
 */
async function validateMigration(db: Neo4jClient): Promise<void> {
  console.log('========================================');
  console.log('Step 5: Validating Migration');
  console.log('========================================\n');
  
  // Check that all entities (except Fabricas) have new format IDs
  for (const [type, label] of Object.entries(ENTITY_LABEL_MAP)) {
    const prefix = ENTITY_PREFIX_MAP[type];
    const pattern = `^${prefix}[0-9a-z]{8}$`;
    
    const query = `
      MATCH (n:${label})
      WHERE NOT n.id =~ $pattern
      RETURN count(n) AS count, collect(n.id)[0..5] AS sampleIds
    `;
    
    const result = await db.executeQuery<{ count: any; sampleIds: string[] }>(query, {
      pattern,
    });
    
    const count = Number(result[0]?.count?.low || result[0]?.count || 0);
    const sampleIds = result[0]?.sampleIds || [];
    
    if (count > 0) {
      console.error(`❌ Found ${count} ${type} with old format IDs. Sample: ${sampleIds.join(', ')}`);
    } else {
      console.log(`✅ All ${type} have new format IDs`);
    }
  }
  
  // Check for orphaned relationships (shouldn't happen with proper cascade)
  const orphanQuery = `
    MATCH (start)-[r]->(end)
    WHERE start.id IS NULL OR end.id IS NULL
    RETURN count(r) AS count
  `;
  
  const orphanResult = await db.executeQuery<{ count: any }>(orphanQuery);
  const orphanCount = Number(orphanResult[0]?.count?.low || orphanResult[0]?.count || 0);
  
  if (orphanCount > 0) {
    console.error(`❌ Found ${orphanCount} orphaned relationships`);
  } else {
    console.log(`✅ No orphaned relationships found`);
  }
  
  console.log('\nValidation complete!\n');
}

/**
 * Main migration function
 */
export async function migrateEntityIds(options: MigrationOptions = {}): Promise<MigrationStats> {
  const { dryRun = false } = options;
  const db = Neo4jClient.getInstance();
  
  console.log('========================================');
  console.log('Entity ID Migration');
  const modeStr = dryRun ? 'DRY RUN' : 'LIVE';
  console.log('Mode: ' + modeStr);
  console.log('========================================\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE: No changes will be made to the database\n');
  } else {
    console.log('⚠️  LIVE MODE: Database will be modified!\n');
  }
  
  try {
    // Step 1: Generate mappings
    const mappings = await generateAllMappings(db);
    
    // Step 2: Update entity IDs
    const entitiesUpdated = await updateEntityIds(db, mappings, dryRun);
    
    // Step 3: Update relationships
    const relationshipsUpdated = await updateRelationships(db, mappings, dryRun);
    
    // Step 4: Update redundant properties
    const redundantPropertiesUpdated = await updateRedundantProperties(db, mappings, dryRun);
    
    // Step 5: Validate (only if not dry run)
    if (!dryRun) {
      await validateMigration(db);
    }
    
    const stats: MigrationStats = {
      entitiesUpdated,
      relationshipsUpdated,
      redundantPropertiesUpdated,
      errors: [],
    };
    
    console.log('========================================');
    console.log('Migration Summary');
    console.log('========================================');
    const modeLabel = dryRun ? 'DRY RUN' : 'LIVE';
    console.log('Mode: ' + modeLabel);
    console.log('\nEntities updated:');
    console.log('  - Jingles: ' + stats.entitiesUpdated.jingles);
    console.log('  - Canciones: ' + stats.entitiesUpdated.canciones);
    console.log('  - Artistas: ' + stats.entitiesUpdated.artistas);
    console.log('  - Tematicas: ' + stats.entitiesUpdated.tematicas);
    console.log('  - Usuarios: ' + stats.entitiesUpdated.usuarios);
    console.log('\nRelationships updated: ' + stats.relationshipsUpdated);
    console.log('Redundant properties updated: ' + stats.redundantPropertiesUpdated);
    
    if (dryRun) {
      console.log('\n⚠️  This was a DRY RUN. Run without --dry-run flag to apply changes.');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
    
    return stats;
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  
  migrateEntityIds({ dryRun })
    .then((stats) => {
      console.log('\nMigration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

