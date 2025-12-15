# Migration Plan: normSearch Property Backfill

**Date**: 2025-12-14  
**Migration Type**: Property Backfill  
**Priority**: P1 - High

## Overview

This migration backfills the `normSearch` property for all existing entities in the database. The `normSearch` property provides ISO-normalized (accent-removed, lowercase) search text to enable accent-insensitive, case-insensitive search functionality.

## Prerequisites

1. ✅ Property generation logic implemented (`backend/src/server/utils/displayProperties.ts`)
2. ✅ Property documented in schema (`backend/src/server/db/schema/schema.ts`)
3. ✅ Auto-update mechanism in place (via `updateDisplayProperties()`)
4. ✅ Migration script created (`backend/src/server/db/migration/backfill-normSearch.ts`)

## Migration Script

**Location**: `backend/src/server/db/migration/backfill-normSearch.ts`

**Features**:
- Dry-run mode (default) to preview changes
- Execute mode to apply updates
- Type filtering (process specific entity types)
- Limit option (for testing)
- Progress reporting
- Error handling

## Execution Steps

### Step 1: Backup Database

**CRITICAL: Always backup before running migrations!**

```bash
# Option A: Neo4j dump
neo4j-admin database dump neo4j --to-path=/path/to/backup/

# Option B: Export via cypher-shell
cypher-shell -u neo4j -p <password> "CALL apoc.export.cypher.all('/path/to/backup.cypher')"
```

### Step 2: Test Migration (Dry-Run)

```bash
cd backend

# Preview what would be updated (all entities)
npx ts-node src/server/db/migration/backfill-normSearch.ts

# Preview first 10 entities of each type
npx ts-node src/server/db/migration/backfill-normSearch.ts --limit 10

# Preview specific entity type
npx ts-node src/server/db/migration/backfill-normSearch.ts --type jingles
```

### Step 3: Execute Migration

```bash
# Execute for all entities
npx ts-node src/server/db/migration/backfill-normSearch.ts --execute

# Execute for specific entity type (recommended: process one type at a time)
npx ts-node src/server/db/migration/backfill-normSearch.ts --execute --type jingles
npx ts-node src/server/db/migration/backfill-normSearch.ts --execute --type artistas
npx ts-node src/server/db/migration/backfill-normSearch.ts --execute --type canciones
npx ts-node src/server/db/migration/backfill-normSearch.ts --execute --type fabricas
npx ts-node src/server/db/migration/backfill-normSearch.ts --execute --type tematicas
```

### Step 4: Validate Results

```cypher
// Check normSearch population
MATCH (n)
WHERE n.normSearch IS NULL
RETURN labels(n)[0] AS type, count(*) AS count
ORDER BY count DESC

// Sample normSearch values
MATCH (j:Jingle)
WHERE j.normSearch IS NOT NULL
RETURN j.id, j.normSearch
LIMIT 10

// Verify normalization (should match "paez" regardless of case/accents)
MATCH (t:Tematica)
WHERE t.normSearch CONTAINS 'paez'
RETURN t.name, t.normSearch
```

## Expected Results

### normSearch Content by Entity Type

- **Jingle**: title/cancion title, autores, jingleros, fabrica title, all tags (primary and non-primary), comment
- **Artista**: stageName, name
- **Cancion**: title, autores, album, year
- **Fabrica**: title, displaySecondary content
- **Tematica**: name (with special parsing for GENTE category: "Surname, Name" → "Name Surname")

### Normalization Examples

- "Páez" → "paez"
- "José" → "jose"
- "MÉXICO" → "mexico"
- "São Paulo" → "sao paulo"

## Performance Considerations

### Expected Migration Times

- **Small database** (< 1,000 entities): < 2 minutes
- **Medium database** (1,000 - 10,000 entities): 2-10 minutes
- **Large database** (> 10,000 entities): 10-30 minutes

### Optimization Tips

1. **Process by type**: Run migration for one entity type at a time to monitor progress
2. **Run during low traffic**: Schedule migration during off-peak hours
3. **Monitor memory**: Large datasets may require batching (future enhancement)

## Rollback Procedure

If migration fails or produces incorrect results:

1. **Restore from backup**:
   ```bash
   neo4j-admin database load neo4j --from-path=/path/to/backup/
   ```

2. **Clear normSearch property** (if partial migration):
   ```cypher
   MATCH (n)
   WHERE n.normSearch IS NOT NULL
   SET n.normSearch = null
   ```

## Post-Migration Tasks

1. ✅ Verify normSearch values are populated
2. ⬜ Update TypeScript types (add `normSearch?: string` to entity interfaces)
3. ⬜ Test search functionality with normSearch
4. ⬜ Monitor search performance
5. ⬜ Consider adding full-text index on normSearch if needed

## Troubleshooting

### Issue: Some entities still have null normSearch

**Cause**: Entity may have missing relationships or data

**Solution**: 
- Check entity relationships
- Verify entity has required data for normSearch generation
- Re-run migration for specific entity

### Issue: normSearch values seem incorrect

**Cause**: Data inconsistency or generation logic issue

**Solution**:
- Check entity data and relationships
- Verify generation logic in `displayProperties.ts`
- Test with specific entity ID

### Issue: Migration is slow

**Cause**: Large dataset or database performance

**Solution**:
- Process by entity type
- Use `--limit` option to test with smaller batches
- Check database indexes

## Related Documentation

- **Gap Analysis**: `docs/4_backend_database-schema/gap-analysis/normSearch-gap-analysis-2025-12-14.md`
- **Schema Documentation**: `docs/4_backend_database-schema/schema/properties.md`
- **Implementation**: `backend/src/server/utils/displayProperties.ts`

## Change History

- **2025-12-14**: Migration plan created

