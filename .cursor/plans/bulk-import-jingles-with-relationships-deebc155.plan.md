<!-- deebc155-06d9-460a-99c7-c8e91f7097b3 101c1792-9803-48a4-a367-114bf42cb5c1 -->
# Bulk Import Jingles with APPEARS_IN Relationships

## Overview

Import over 1000 Jingle entities from `node-Jingle-2025-11-18-[2].csv`, auto-generate IDs for blank entries (1041 rows), verify Fabrica IDs exist, and create APPEARS_IN relationships with timestamp properties.

## Key Requirements

- CSV has 1078 rows (including header), ~1041 rows with blank IDs requiring auto-generation
- Key fields: `title`, `comment` (required), `timestamp`, `fabricaId`
- Auto-generate IDs in format `j{8-chars}` for blank entries
- Verify Fabrica IDs exist before creating relationships
- Create APPEARS_IN relationships with `timestamp` property (HH:MM:SS format)
- Handle timestamp format normalization (various formats: "03:32", "24:48:00", "01:02:31", etc.)

## Implementation Plan

### 1. Create Import Script

**File**: `backend/src/server/db/migration/import-jingles.ts`

**Key Functions**:

- `normalizeTimestamp(timestamp: string): string` - Convert various timestamp formats to HH:MM:SS
  - Handle formats: "03:32" → "00:03:32", "24:48:00" → "00:24:48", "01:02:31" → "01:02:31"
  - Default to "00:00:00" if invalid/missing
- `generateJingleId(db: Neo4jClient): Promise<string>` - Generate unique Jingle ID using existing `generateId` logic
- `verifyFabricaExists(db: Neo4jClient, fabricaId: string): Promise<boolean>` - Check if Fabrica exists before relationship creation
- `importJingles(filename: string): Promise<void>` - Main import function

**Import Process**:

1. Parse CSV file using `csv-parse/sync`
2. Process in batches of 100 (BATCH_SIZE)
3. For each row:

   - If `id:ID` is blank, generate new ID using `generateId('jingles')`
   - Parse and normalize all properties (booleans, dates, etc.)
   - Normalize timestamp to HH:MM:SS format
   - **If `fabricaId` exists and is not empty:**
     - **Check for duplicate**: Query if any existing APPEARS_IN relationship exists with same `fabricaId` and same `timestamp` property
     - **If duplicate found**: Skip entire row with warning (do not create Jingle or relationship), continue to next row
   - **If no duplicate** (or no fabricaId):
     - Create Jingle node with properties
     - If `fabricaId` exists and is not empty:
       - Verify Fabrica exists (skip with warning if not found)
       - Create APPEARS_IN relationship with normalized timestamp
       - System will auto-calculate `order` property

4. Track statistics: imported, updated, errors, relationships created, duplicates skipped

**Error Handling**:

- Skip rows with missing required fields (`title` or `comment`) with warning
- Skip relationship creation if Fabrica doesn't exist (log warning, continue)
- Continue processing on individual row errors
- Report summary at end

### 2. Timestamp Normalization Logic

Handle multiple timestamp formats found in CSV:

- "03:32" → "00:03:32" (MM:SS → HH:MM:SS)
- "24:48:00" → "00:24:48" (already HH:MM:SS, but hours > 23)
- "01:02:31" → "01:02:31" (already correct)
- "1:02:31" → "01:02:31" (pad hours)
- Empty/missing → "00:00:00"

### 3. Relationship Creation

After Jingle creation:

- Query: `MATCH (j:Jingle {id: $jingleId}), (f:Fabrica {id: $fabricaId}) CREATE (j)-[r:APPEARS_IN {timestamp: $timestamp, createdAt: datetime()}]->(f) RETURN r`
- Use normalized timestamp from CSV `timestamp` column
- System will auto-calculate `order` via `updateAppearsInOrder()` function
- Update redundant properties (`jingle.fabricaId`, `jingle.fabricaDate`) automatically

### 4. Validation Steps

- Pre-import: Verify CSV file exists and is readable
- Pre-import: Validate CSV headers match expected format
- During import: Verify each Fabrica ID exists before relationship creation
- Post-import: Report summary with counts (imported, updated, errors, relationships created)

### 5. Testing Considerations

- Test with small batch first (10-20 rows)
- Verify ID generation works correctly
- Verify Fabrica ID validation catches non-existent IDs
- Verify timestamp normalization handles all formats
- Verify APPEARS_IN relationships created with correct timestamps
- Verify `order` property auto-calculated correctly

## Files to Create/Modify

- **Create**: `backend/src/server/db/migration/import-jingles.ts`
- **Reference**: `backend/src/server/db/migration/import-fabricas.ts` (pattern)
- **Reference**: `backend/src/server/api/admin.ts` (ID generation, relationship creation, `timestampToSeconds` function)

## Execution

```bash
cd backend
npx ts-node src/server/db/migration/import-jingles.ts node-Jingle-2025-11-18-[2].csv
```

## Success Criteria

- All valid Jingle rows imported successfully
- All blank IDs auto-generated correctly
- All valid APPEARS_IN relationships created with correct timestamps
- Non-existent Fabrica IDs logged as warnings (not errors)
- Summary report shows accurate counts