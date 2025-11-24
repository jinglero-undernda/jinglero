<!-- b6b5222f-a2cd-418d-aeb6-368805a14ba0 8af11499-dfbf-46ea-a694-e75d70ac44d5 -->
# Implementation Plan: Jingle autoComment Property

## Overview

Add a new `autoComment` property to Jingle entities that provides a system-generated summary of core jingle information. The property will be:

- **Read-only**: System-managed, not user-editable (displayed like Fabrica's youtubeUrl)
- **Auto-generated**: Recalculated whenever any Jingle property or relationship changes
- **Relationship-based**: Format depends on available relationships (Fabrica, Cancion, Artista, Tematica)

## Format Specification

The `autoComment` follows this format (blank fields omitted):

- If Fabrica exists: `🏭: YYYY-MM-DD - [HH:]MM:SS` (omit HH: if hours are zero, use leading zeros for MM:SS)
- `🎤: {Titulo}` (if title exists)
- `📦: {Cancion}` (if Cancion exists, uses Cancion.title)
- `🚚: {Autor} [; {Autor}] `(if Autores exist, multiple separated by `;`)
- `🏷️: {Primary Tematica}` (if primary Tematica exists, uses Tematica.name where isPrimary=true)
- `🔧: {Jinglero} [; {Jinglero}] `(if Jingleros exist, multiple separated by `;`)

**Example**: `🏭: 2025-01-15 - 01:23:45, 🎤: Opening Theme, 📦: Song Title, 🚚: Artist One; Artist Two, 🏷️: ACTUALIDAD, 🔧: Performer One`
**Example (no hours)**: `🏭: 2025-01-15 - 23:45, 🎤: Opening Theme`

## Implementation Tasks

### 1. Schema Changes

**Files to modify:**

- `backend/src/server/db/types.ts` - Add `autoComment?: string` to Jingle interface
- `backend/src/server/db/schema/schema.ts` - Document autoComment in schema comments
- `frontend/src/types/index.ts` - Add `autoComment?: string` to Jingle interface
- `docs/4_backend_database-schema/schema/nodes.md` - Document autoComment property

**Changes:**

- Add `autoComment?: string` as optional, read-only property
- Mark as system-managed in documentation
- **NOT** added to EXCLUDED_FIELDS - will be displayed as readonly field (like Fabrica youtubeUrl)

### 2. Auto-Generation Function

**New file:** `backend/src/server/utils/jingleAutoComment.ts`

**Function:** `generateJingleAutoComment(jingleId: string): Promise<string>`

**Logic:**

1. Query Jingle with all relationships:

- APPEARS_IN → Fabrica (get date, timestamp)
- VERSIONA → Cancion (get title)
- AUTOR_DE → Artista (via Cancion, get names)
- JINGLERO_DE → Artista (get names)
- TAGGED_WITH → Tematica (get primary one where isPrimary=true)

2. Build comment parts in order:

- Fabrica: Format date as YYYY-MM-DD, timestamp with special formatting:
- If hours > 0: `HH:MM:SS` (with leading zeros)
- If hours = 0: `MM:SS` (with leading zeros for minutes and seconds)
- Example: `01:23:45` or `23:45` (if hours are zero)
- Title: Use jingle.title if exists
- Cancion: Use cancion.title if exists
- Autores: Collect all Artista names from AUTOR_DE relationships, join with `;`
- Primary Tematica: Use tematica.name where isPrimary=true
- Jingleros: Collect all Artista names from JINGLERO_DE relationships, join with `;`

3. Join non-empty parts with `, ` separator
4. Return formatted string

**Dependencies:**

- Create custom timestamp formatter: `formatTimestampForAutoComment(seconds: number): string`
- If hours > 0: return `HH:MM:SS`
- If hours = 0: return `MM:SS`
- Always use leading zeros for minutes and seconds
- Format Fabrica date from Date object to YYYY-MM-DD string

### 3. Auto-Update Mechanism

**Files to modify:**

- `backend/src/server/api/admin.ts`

**Integration points:**

1. **After entity CREATE** (POST `/:type`):

- After `syncJingleRedundantProperties` call
- Call `generateJingleAutoComment(jingleId)` and update Jingle

2. **After entity UPDATE** (PUT/PATCH `/:type/:id`):

- After `syncJingleRedundantProperties` call
- After `validateAndFixRedundantProperties` call
- Call `generateJingleAutoComment(jingleId)` and update Jingle

3. **After relationship CREATE/DELETE** (`updateRedundantPropertiesOnRelationshipChange`):

- After updating redundant properties for APPEARS_IN, VERSIONA, JINGLERO_DE, TAGGED_WITH, AUTOR_DE
- Call `generateJingleAutoComment(jingleId)` and update Jingle

**Implementation:**

- Create helper function `updateJingleAutoComment(jingleId: string): Promise<void>`
- Call this function at all relevant hooks
- Use Neo4j query to update: `MATCH (j:Jingle {id: $id}) SET j.autoComment = $autoComment, j.updatedAt = datetime()`

### 4. API Changes

**Files to modify:**

- `backend/src/server/api/admin.ts` - Ensure autoComment is returned in responses
- `backend/src/server/api/public.ts` - Include autoComment in GET `/jingles/:id` response
- Validation: Ensure autoComment is excluded from user input validation (read-only)

**Changes:**

- No special handling needed - autoComment will be included in standard entity responses
- Ensure validation schemas don't require or validate autoComment from user input

### 5. Frontend Display

**Files to modify:**

- `frontend/src/components/admin/EntityMetadataEditor.tsx` - Display autoComment as read-only field (similar to Fabrica youtubeUrl)

**Display approach:**

- Show in metadata editor as read-only field (NOT in EXCLUDED_FIELDS)
- Follow same pattern as Fabrica's `youtubeUrl` field (lines 586-611 in EntityMetadataEditor.tsx)
- Display as italic gray text, not editable
- Label: "autoComment" (or "Auto Comment")
- Add conditional check: `fieldName === 'autoComment' && entityType === 'jingle'`

### 6. Documentation

**Files to create/modify:**

- `docs/4_backend_database-schema/schema/nodes.md` - Document autoComment property
- Update schema documentation in `backend/src/server/db/schema/schema.ts`

**Documentation should include:**

- Property type, purpose, format specification
- Auto-generation rules and triggers
- Example values
- Read-only status

### 7. Migration/Backfill

**New file:** `backend/src/server/db/quality/generate-auto-comments.ts`

**Purpose:** Generate autoComment for all existing Jingles as part of database maintenance/audit library

**Implementation:**

- Query all Jingles
- For each Jingle, call `generateJingleAutoComment`
- Update Jingle with generated autoComment
- Log progress and statistics
- Support dry-run mode
- Follow pattern from `audit-relationships-cli.ts` for CLI interface

**Usage:**

- Run as maintenance script: `npx ts-node backend/src/server/db/quality/generate-auto-comments.ts`
- Dry-run mode: `npx ts-node backend/src/server/db/quality/generate-auto-comments.ts --dry-run`
- Add npm script: `npm run db:generate-auto-comments`

## Technical Considerations

### Performance

- Auto-comment generation requires relationship queries - ensure efficient queries
- Consider caching if performance becomes an issue (unlikely for current scale)
- Update only when relevant properties/relationships change

### Edge Cases

- Handle missing relationships gracefully (omit from comment)
- Handle null/undefined values
- Handle multiple Autores/Jingleros (join with `;`)
- Handle timestamp formatting (omit HH: if zero, use leading zeros for MM:SS)
- Handle date formatting (YYYY-MM-DD from Date object)

### Testing

- Unit tests for `generateJingleAutoComment` function
- Integration tests for auto-update triggers
- Test with various relationship combinations
- Test with missing relationships
- Test timestamp/date formatting (especially HH: omission when zero)

## Implementation Order

1. Create auto-generation function (`generateJingleAutoComment`)
2. Add schema changes (types, documentation)
3. Integrate auto-update mechanism (hooks in admin API)
4. Update frontend display (read-only field, like youtubeUrl)
5. Test and validate
6. Run migration for existing Jingles

## Files Summary

**New files:**

- `backend/src/server/utils/jingleAutoComment.ts` - Auto-comment generation logic
- `backend/src/server/db/quality/generate-auto-comments.ts` - Maintenance script for backfilling existing Jingles

**Modified files:**

- `backend/src/server/db/types.ts` - Add autoComment to Jingle interface
- `backend/src/server/db/schema/schema.ts` - Document autoComment
- `backend/src/server/api/admin.ts` - Add auto-update hooks
- `frontend/src/types/index.ts` - Add autoComment to Jingle interface
- `frontend/src/components/admin/EntityMetadataEditor.tsx` - Display autoComment as readonly (like youtubeUrl)
- `docs/4_backend_database-schema/schema/nodes.md` - Document property