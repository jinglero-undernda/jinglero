# Database Migration Guide

## Task 5: Entity ID Migration

This guide provides step-by-step instructions for migrating entity IDs from the old format to the new standardized format.

---

## Overview

### What's Changing

**Old ID Format:**
- Format: `PREFIX-UUID` or sequential (e.g., `ART-001`, `JIN-550e8400-e29b-41d4-a716-446655440000`)
- Inconsistent between seed data and generated IDs

**New ID Format:**
- Format: `{prefix}{8-chars}` where chars are base36 alphanumeric (0-9, a-z)
- Prefixes: `a` (Artista), `c` (Cancion), `j` (Jingle), `t` (Tematica), `u` (Usuario)
- Examples: `a1b2c3d4`, `j5e6f7g8`, `c9f0a1b2`

**Important:** Fabricas are EXCLUDED from migration (retain external YouTube video IDs)

### What's Migrated

1. **Entity IDs**: All entity nodes updated with new ID format
2. **Relationships**: All relationship references updated to use new IDs
3. **Redundant Properties**: `fabricaId`, `cancionId`, `autorIds` updated to reference new IDs

---

## Prerequisites

### 1. Backup Your Database

**CRITICAL: Always backup before running migrations!**

#### Neo4j Backup Options:

**Option A: Database Dump (Recommended)**
```bash
# Stop Neo4j
neo4j stop

# Create backup directory
mkdir -p ~/neo4j-backups/$(date +%Y%m%d_%H%M%S)

# Copy database files
cp -r /path/to/neo4j/data/databases/neo4j ~/neo4j-backups/$(date +%Y%m%d_%H%M%S)/

# Start Neo4j
neo4j start
```

**Option B: Export to Cypher**
```bash
# Using neo4j-admin dump
neo4j-admin database dump neo4j --to-path=/path/to/backup/

# Or using cypher-shell to export all data
cypher-shell -u neo4j -p <password> < export-script.cypher > backup.cypher
```

**Option C: Neo4j Desktop Backup**
- Open Neo4j Desktop
- Select your database
- Click "Manage" → "Create Dump"
- Save the dump file to a safe location

### 2. Install Dependencies

Ensure you have the required Node.js packages:

```bash
cd backend
npm install
```

### 3. Verify Database Connection

Test your database connection:

```bash
# Set environment variables
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="your-password"

# Test connection
npm run test:db-connection
```

---

## Migration Steps

### Step 1: Pre-Migration Audit

Run a dry-run to see what will be migrated:

```bash
cd backend
npx ts-node src/server/db/migration/migrate-entity-ids.ts --dry-run
```

**Expected Output:**
```
========================================
Entity ID Migration
Mode: DRY RUN
========================================

⚠️  DRY RUN MODE: No changes will be made to the database

Step 1: Generating ID Mappings
========================================
Generating ID mappings for jingles...
  Found 25 jingles entities
  Generated 25 new IDs for jingles
...

Step 2: Updating Entity IDs
========================================
  [DRY RUN] Would update 25 jingles
  [DRY RUN] Would update 15 canciones
  [DRY RUN] Would update 10 artistas
  [DRY RUN] Would update 5 tematicas
  [DRY RUN] Would update 3 usuarios

Step 3: Updating Relationship References
========================================
  [DRY RUN] Would update 127 relationships

Step 4: Updating Redundant Properties
========================================
  [DRY RUN] Would update Jingle.cancionId references
  [DRY RUN] Would update Cancion.autorIds references

========================================
Migration Summary
========================================
Mode: DRY RUN

Entities updated:
  - Jingles: 25
  - Canciones: 15
  - Artistas: 10
  - Tematicas: 5
  - Usuarios: 3

Relationships updated: 127
Redundant properties updated: 42

⚠️  This was a DRY RUN. Run without --dry-run flag to apply changes.
```

**Review the output carefully!**
- Check entity counts match your expectations
- Verify no unexpected errors
- Save the output for reference

### Step 2: Backup Verification

Before proceeding, verify your backup:

```bash
# Check backup exists and is recent
ls -lh ~/neo4j-backups/
```

### Step 3: Execute Migration

**⚠️ WARNING: This will modify your database!**

Run the migration:

```bash
npx ts-node src/server/db/migration/migrate-entity-ids.ts
```

**Expected Duration:** 1-5 minutes depending on database size

**Monitor the Output:**
- Watch for any errors or warnings
- All operations should complete successfully
- Validation checks should pass

### Step 4: Post-Migration Validation

The migration script includes automatic validation. Review the output:

```
Step 5: Validating Migration
========================================

✅ All jingles have new format IDs
✅ All canciones have new format IDs
✅ All artistas have new format IDs
✅ All tematicas have new format IDs
✅ All usuarios have new format IDs
✅ No orphaned relationships found

Validation complete!
```

**If validation fails:**
1. DO NOT PROCEED - note the errors
2. Check the troubleshooting section below
3. Consider restoring from backup

### Step 5: Manual Verification

Run additional checks to ensure data integrity:

```bash
# Check entity counts haven't changed
cypher-shell -u neo4j -p <password> "
MATCH (n)
RETURN labels(n)[0] AS entity, count(n) AS count
ORDER BY entity
"

# Check relationships counts haven't changed
cypher-shell -u neo4j -p <password> "
MATCH ()-[r]->()
RETURN type(r) AS relType, count(r) AS count
ORDER BY relType
"

# Sample check: Verify new ID format
cypher-shell -u neo4j -p <password> "
MATCH (j:Jingle)
RETURN j.id AS id
LIMIT 5
"
# Should return IDs like: j1a2b3c4, j5e6f7g8, etc.

# Sample check: Verify redundant properties updated
cypher-shell -u neo4j -p <password> "
MATCH (j:Jingle)-[:VERSIONA]->(c:Cancion)
WHERE j.cancionId <> c.id
RETURN count(j) AS mismatches
"
# Should return: 0 mismatches
```

### Step 6: Export Updated Database State

After successful migration, export the database to update seed files:

```bash
# Export all entities to YAML format
npx ts-node src/server/db/scripts/export-to-yaml.ts > src/server/db/seed.yaml

# Or manually query and update seed.yaml
cypher-shell -u neo4j -p <password> --format plain < export-queries.cypher > export.json
```

### Step 7: Update Seed Files

Update `backend/src/server/db/seed.yaml` with the new entity IDs:

1. Replace all old format IDs with new format IDs
2. Update all relationship references
3. Ensure all redundant properties are updated
4. Verify schema consistency

### Step 8: Restart Application

Restart your application to use the new IDs:

```bash
# Stop application
npm run stop

# Clear any caches if applicable
npm run cache:clear

# Start application
npm run dev
```

### Step 9: Test Application

Test critical functionality:

1. **Admin Portal:**
   - View entities (Jingles, Canciones, Artistas)
   - Create new entity (should use new ID format)
   - Update entity
   - Delete entity

2. **Public API:**
   - Fetch Jingle details
   - Fetch Fabrica with Jingles
   - Fetch relationships

3. **Relationships:**
   - Create new relationships
   - Update relationships
   - Delete relationships
   - Verify APPEARS_IN order is calculated automatically

4. **Redundant Properties:**
   - Verify `fabricaId`, `cancionId`, `autorIds` are populated
   - Update entity with redundant property - verify relationship auto-syncs
   - Create relationship - verify redundant property auto-updates

---

## Troubleshooting

### Issue: Migration Script Fails with "Connection Refused"

**Cause:** Neo4j database is not running or connection details are incorrect

**Solution:**
```bash
# Check Neo4j status
neo4j status

# Start Neo4j if not running
neo4j start

# Verify connection details in .env file
cat .env | grep NEO4J
```

### Issue: "Constraint violation" or "Duplicate ID" Errors

**Cause:** ID collision detected (very rare with base36 8-character IDs)

**Solution:**
- The migration script has retry logic for collisions
- If error persists, contact support
- DO NOT re-run migration without investigating

### Issue: Validation Fails - "Orphaned Relationships"

**Cause:** Relationships reference entities that don't exist

**Solution:**
```bash
# Find orphaned relationships
cypher-shell -u neo4j -p <password> "
MATCH (start)-[r]->(end)
WHERE start.id IS NULL OR end.id IS NULL
RETURN type(r), id(r)
"

# Fix manually or restore from backup
```

### Issue: Some Entity IDs Still in Old Format

**Cause:** Migration incomplete or entities added after migration

**Solution:**
```bash
# Find entities with old format IDs
cypher-shell -u neo4j -p <password> "
MATCH (n)
WHERE n.id =~ '.*-.*'  // Old format contains hyphens
RETURN labels(n)[0] AS entityType, n.id AS oldId
LIMIT 10
"

# Re-run migration or manually fix
```

### Issue: Redundant Properties Don't Match Relationships

**Cause:** Data integrity issue (should be auto-fixed by validation)

**Solution:**
```bash
# Run validation endpoint
curl -X POST http://localhost:4000/api/admin/validate/entity/jingles

# Or run backfill script
npx ts-node src/server/db/migration/backfill-redundant-properties.ts
```

---

## Rollback Procedure

If migration fails and you need to restore:

### Option 1: Restore from Database Dump

```bash
# Stop Neo4j
neo4j stop

# Remove current database
rm -rf /path/to/neo4j/data/databases/neo4j

# Restore from backup
cp -r ~/neo4j-backups/YYYYMMDD_HHMMSS/neo4j /path/to/neo4j/data/databases/

# Start Neo4j
neo4j start

# Verify restoration
cypher-shell -u neo4j -p <password> "MATCH (n) RETURN count(n)"
```

### Option 2: Restore from Neo4j Dump

```bash
# Stop Neo4j
neo4j stop

# Restore dump
neo4j-admin database load neo4j --from-path=/path/to/backup/

# Start Neo4j
neo4j start
```

---

## Performance Considerations

### Expected Migration Times

- **Small database** (< 1,000 entities): < 1 minute
- **Medium database** (1,000 - 10,000 entities): 1-5 minutes
- **Large database** (> 10,000 entities): 5-15 minutes

### Optimization Tips

1. **Run during low traffic:** Schedule migration during off-peak hours
2. **Disable indexes temporarily:** Can speed up bulk updates (advanced)
3. **Monitor system resources:** Ensure adequate memory and CPU

---

## Post-Migration Checklist

- [ ] ✅ Migration completed successfully
- [ ] ✅ Validation checks passed
- [ ] ✅ Manual verification completed
- [ ] ✅ Entity counts match pre-migration
- [ ] ✅ Relationship counts match pre-migration
- [ ] ✅ Sample entities have new ID format
- [ ] ✅ Redundant properties match relationships
- [ ] ✅ Seed files updated with new IDs
- [ ] ✅ Application restarted
- [ ] ✅ Critical functionality tested
- [ ] ✅ Backup retained for at least 30 days

---

## Support

If you encounter issues not covered in this guide:

1. Check application logs: `backend/logs/`
2. Check Neo4j logs: `/path/to/neo4j/logs/`
3. Review migration output carefully
4. Contact development team with:
   - Migration output
   - Error messages
   - Entity counts before/after
   - Neo4j version

---

## Additional Resources

- **Schema Documentation:** `backend/src/server/db/schema/schema.ts`
- **Refinement Notes:** `backend/src/server/db/schema/REFINEMENT_NOTES.md`
- **Migration Script:** `backend/src/server/db/migration/migrate-entity-ids.ts`
- **Validation Utilities:** `backend/src/server/utils/validation.ts`
- **API Documentation:** `docs/api.md`

---

**Last Updated:** Task 5.0 Implementation
**Version:** 1.0.0

