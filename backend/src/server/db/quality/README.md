# Data Quality Scripts

This directory contains scripts for auditing and maintaining data quality in the Neo4j database.

## Relationship Direction Audit and Fix

### Overview

The relationship direction audit tool validates that all relationships in the Neo4j database are created in the correct direction according to the canonical schema. This tool was created to address BUG_0007, which identified that buggy code may have created relationships in the wrong direction.

### Purpose

- **Audit**: Identify relationships created in the wrong direction
- **Fix**: Correct relationship directions while preserving all properties
- **Validate**: Verify entity ID formats match expected patterns
- **Detect**: Find duplicate relationships (both correct and incorrect directions)

### Usage

#### Basic Audit (Dry-Run)

```bash
npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts
```

This runs an audit of all relationships and prints a report. No changes are made to the database.

#### Audit Specific Relationship Types

```bash
npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts --relationship-types versiona,appears_in
```

#### Save Audit Report to File

```bash
npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts --output audit-report.json
```

#### Fix Relationships

⚠️ **WARNING**: This will modify the database. Always backup first!

```bash
npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts --fix
```

### Using npm Scripts

For convenience, npm scripts are available:

```bash
# Audit only (dry-run)
npm run db:audit-relationships

# Fix relationships (requires confirmation)
npm run db:fix-relationships
```

### What Gets Audited

The audit checks:

1. **Entity ID Validation**: Verifies all node IDs match expected formats:

   - 9 characters with prefix: `{a|c|j|t|u}{8-alphanumeric}` → Artista, Cancion, Jingle, Tematica, Usuario
   - 11 characters: Fabrica (YouTube video ID)
   - Any other format: Flagged as error

2. **Relationship Direction**: Validates each relationship matches the canonical schema:

   - `APPEARS_IN`: `(Jingle)-[APPEARS_IN]->(Fabrica)`
   - `VERSIONA`: `(Jingle)-[VERSIONA]->(Cancion)`
   - `JINGLERO_DE`: `(Artista)-[JINGLERO_DE]->(Jingle)`
   - `AUTOR_DE`: `(Artista)-[AUTOR_DE]->(Cancion)`
   - `TAGGED_WITH`: `(Jingle)-[TAGGED_WITH]->(Tematica)`
   - `SOY_YO`: `(Usuario)-[SOY_YO]->(Artista)`
   - `REACCIONA_A`: `(Usuario)-[REACCIONA_A]->(Jingle)`

3. **Duplicate Detection**: Identifies cases where both correct and incorrect direction relationships exist between the same nodes

### What Gets Fixed

When fixing relationships:

1. **Wrong Direction Only**: Deletes the wrong-direction relationship and creates the correct one with the same properties
2. **Duplicate Relationships**: Deletes only the wrong-direction relationship, preserving the correct one
3. **Property Preservation**: All relationship properties (status, createdAt, etc.) are preserved when fixing direction

### Safety Features

- **Dry-run by default**: No changes are made unless `--fix` flag is explicitly provided
- **Transaction-based**: Fixes use transactions for atomicity
- **Detailed logging**: All operations are logged for audit trail
- **Pre-fix validation**: Audit runs before fixes to identify issues
- **Post-fix verification**: Audit re-runs after fixes to confirm success

### Workflow

#### Development/Staging

1. Run audit in dry-run mode:

   ```bash
   npm run db:audit-relationships
   ```

2. Review the audit report

3. If fixes are needed, run fix in dry-run mode first:

   ```bash
   npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts --fix --dry-run
   ```

4. Review the fix plan

5. Execute fixes:

   ```bash
   npm run db:fix-relationships
   ```

6. Verify fixes:
   ```bash
   npm run db:audit-relationships
   ```

#### Production

1. **Backup database** before proceeding
2. Run audit and review results
3. Run fix in dry-run mode and review plan
4. Execute fixes
5. Re-run audit to verify
6. Monitor application for any issues

### Output

The audit produces:

- **Console Report**: Summary statistics and detailed list of issues
- **JSON Report** (optional): Full audit results saved to file

Example console output:

```
📋 AUDIT REPORT
============================================================
Timestamp: 2025-11-18T12:00:00.000Z

Summary:
  Total relationships: 150
  ✅ Correct: 145
  ❌ Incorrect: 5
  🔄 Duplicates: 2
  ⚠️  Invalid IDs: 0

Incorrect Relationships:
  VERSIONA:
    Current: (cancion) c12345678 -> (jingle) j98765432
    Expected: (jingles) -> (canciones)
    Has duplicate: No
    Properties: {"status":"CONFIRMED","createdAt":"2025-01-01T00:00:00Z"}
```

### Files

- `relationship-schema.ts`: Canonical relationship direction definitions
- `entity-id-validator.ts`: Entity ID format validation utilities
- `audit-relationships.ts`: Core audit logic
- `fix-relationships.ts`: Core fix logic
- `audit-relationships-cli.ts`: Command-line interface

### Related Documentation

- `docs/debugLogs/BUG_0007.md`: Bug documentation and solution plan
- `backend/src/server/db/schema/schema.ts`: Canonical schema documentation

### Data Quality Standard

This audit/fix script is part of a data quality standard approach:

1. **Reusable**: Can be run periodically to maintain data quality
2. **Automated**: Can be integrated into CI/CD pipeline
3. **Documented**: Clear documentation for future maintenance
4. **Safe**: Dry-run by default, explicit flags required for changes

### Future Enhancements

- Scheduled periodic audits (monthly/quarterly)
- Integration with CI/CD pipeline
- Automated alerts for data quality issues
- Additional validation checks (orphaned nodes, missing relationships, etc.)
