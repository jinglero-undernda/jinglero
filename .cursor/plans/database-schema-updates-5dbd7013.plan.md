<!-- 5dbd7013-fc0c-446a-afb7-30b345e2bd8c 0faacf61-3886-478f-aab1-d595642fc4b5 -->
# Task 1.0: Update Database Schema and Constraints

## Overview

Update Neo4j database schema to match the refactoring specification. This includes removing obsolete constraints, adding new properties, standardizing relationship properties, and updating validation logic.

## Implementation Steps

### Phase 1: Remove Obsolete Constraints (Sub-tasks 1.1-1.2)

**1.1 Remove Jingle.timestamp NOT NULL constraint**

- File: `backend/src/server/db/schema/setup.ts`
- Action: Remove line 17: `'CREATE CONSTRAINT clip_required IF NOT EXISTS FOR (c:Jingle) REQUIRE (c.timestamp) IS NOT NULL'`
- Reason: Timestamp is derived from APPEARS_IN relationship, not always present on node
- Note: The constraint will be automatically dropped when `setupSchema()` runs (it drops all constraints first)

**1.2 Remove Artista.name NOT NULL constraint**

- File: `backend/src/server/db/schema/setup.ts`
- Action: Remove line 19: `'CREATE CONSTRAINT artist_name IF NOT EXISTS FOR (a:Artista) REQUIRE (a.name) IS NOT NULL'`
- Reason: At least one of `name` OR `stageName` required instead (handled by validation, not DB constraint)

### Phase 2: Add Custom Validation Logic (Sub-task 1.3)

**1.3 Implement Artista name/stageName OR requirement**

- File: `backend/src/server/utils/validation.ts` (or create new validation function)
- Action: Add validation function `validateArtistaNameOrStageName(artista: Artista): ValidationIssue | null`
- Logic: Check that at least one of `name` or `stageName` is provided and non-empty
- Integration: Call this validation in `backend/src/server/api/admin.ts` POST/PUT handlers for artistas
- Error message: "Artista must have at least one of 'name' or 'stageName'"

### Phase 3: Update Schema Documentation (Sub-tasks 1.4-1.5)

**1.4 Update Jingle boolean fields documentation**

- File: `backend/src/server/db/schema/schema.ts`
- Action: Update lines 40-42 to mark `isJinglazo`, `isJinglazoDelDia`, `isPrecario` as optional (add "(optional)" comment)
- Change: `- isJinglazo: boolean` → `- isJinglazo: boolean (optional)`

**1.5 Update Artista.isArg documentation**

- File: `backend/src/server/db/schema/schema.ts`
- Action: Update line 60 to indicate auto-managed and not required
- Change: `- isArg: boolean (indicates if the artist is from Argentina)` → `- isArg: boolean (optional, auto-managed from nationality, true if nationality === 'Argentina')`

### Phase 4: Add Status Property to Entities (Sub-task 1.6)

**1.6 Add status property to Jingle, Cancion, Artista, Tematica**

- Files: 
  - `backend/src/server/db/schema/schema.ts` (documentation)
  - `backend/src/server/db/types.ts` (TypeScript interfaces)
- Action: Add `status?: string` property to each entity interface
- Values: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
- Default: 'DRAFT'
- Note: Fabrica already has status field (DRAFT, PROCESSING, COMPLETED) - keep existing values

### Phase 5: Standardize Relationship Properties (Sub-task 1.7)

**1.7 Ensure relationships have status and createdAt**

- File: `backend/src/server/db/schema/schema.ts`
- Action: Verify all relationships (except SOY_YO and REACCIONA_A) have `status` and `createdAt` documented
- Current state check:
  - APPEARS_IN: has `order`, `timestamp` - needs `status`, `createdAt`
  - JINGLERO_DE: has `status`, `createdAt` ✓
  - AUTOR_DE: has `status`, `createdAt` ✓
  - VERSIONA: has `status`, `createdAt` ✓
  - TAGGED_WITH: has `isPrimary`, `status`, `createdAt` ✓
- Update APPEARS_IN documentation to include `status` and `createdAt` properties

### Phase 6: Update Schema Setup (Sub-task 1.8)

**1.8 Update setup.ts constraints array**

- File: `backend/src/server/db/schema/setup.ts`
- Action: Remove the two constraints from `constraints` array (lines 17 and 19)
- Result: Array will have 12 constraints instead of 14
- No code changes needed to `setupSchema()` function (it already drops all constraints first)

### Phase 7: Create Migration Script (Sub-task 1.9)

**1.9 Create migration to add status field**

- New file: `backend/src/server/db/migrations/add-status-field.ts` (or add to existing migration system)
- Action: Create function that:

  1. Sets `status = 'DRAFT'` for all Jingle, Cancion, Artista, Tematica nodes where status is missing
  2. Uses Cypher: `MATCH (n:Jingle) WHERE n.status IS NULL SET n.status = 'DRAFT'` (repeat for each entity type)

- Integration: Add migration call to `setupSchema()` or create separate migration runner
- Safety: Use `WHERE n.status IS NULL` to avoid overwriting existing values

### Phase 8: Update Importer Model (Sub-task 1.10)

**1.10 Update neo4j_importer_model.json**

- File: `backend/src/server/db/import/neo4j_importer_model.json`
- Action: 

  1. Add `status` property to node definitions for Jingle, Cancion, Artista, Tematica
  2. Update constraints section to remove `clip_required` and `artist_name` constraints
  3. Add default value 'DRAFT' for status property in model

### Phase 9: Testing (Sub-task 1.11)

**1.11 Test backward compatibility**

- Create test file: `backend/tests/server/db/schema-migration.test.ts`
- Test cases:

  1. Existing entities without status field get 'DRAFT' after migration
  2. Existing entities with status field keep their value
  3. Jingle can be created without timestamp property
  4. Artista can be created with only name (no stageName)
  5. Artista can be created with only stageName (no name)
  6. Artista cannot be created with neither name nor stageName (validation error)
  7. All relationship types have status and createdAt when created

### Phase 10: Update Backend API Validation (Sub-task 1.12)

**1.12 Update API validation for Artista**

- File: `backend/src/server/api/admin.ts`
- Action: In POST `/:type` and PUT `/:type/:id` handlers, add validation check for Artista:
  ```typescript
  if (label === 'Artista') {
    if (!payload.name && !payload.stageName) {
      throw new ValidationError('Artista must have at least one of name or stageName');
    }
  }
  ```

- Also update: `backend/src/server/api/videos.ts` POST `/artistas` handler (line 301)
- Ensure status defaults to 'DRAFT' if not provided for Jingle, Cancion, Artista, Tematica

## Files to Modify

1. `backend/src/server/db/schema/setup.ts` - Remove 2 constraints
2. `backend/src/server/db/schema/schema.ts` - Update documentation
3. `backend/src/server/db/types.ts` - Add status property to interfaces
4. `backend/src/server/utils/validation.ts` - Add Artista validation function
5. `backend/src/server/api/admin.ts` - Add Artista validation in handlers
6. `backend/src/server/api/videos.ts` - Add Artista validation in POST handler
7. `backend/src/server/db/import/neo4j_importer_model.json` - Update model
8. `backend/src/server/db/migrations/add-status-field.ts` - New migration file (or add to existing)

## Testing Checklist

- [ ] Run `setupSchema()` and verify constraints are correct
- [ ] Create Jingle without timestamp - should succeed
- [ ] Create Artista with only name - should succeed
- [ ] Create Artista with only stageName - should succeed
- [ ] Create Artista with neither name nor stageName - should fail with validation error
- [ ] Create entity without status - should default to 'DRAFT'
- [ ] Migration script adds status='DRAFT' to existing entities
- [ ] Existing entities with status keep their value after migration
- [ ] All relationship types include status and createdAt when created

## Dependencies

- No external dependencies required
- All changes are to existing Neo4j schema and validation code