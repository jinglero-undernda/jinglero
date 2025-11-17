<!-- 0376f063-d985-448e-aa7f-355f9da6ee0c 85f6ac8f-bc74-4dbe-993c-24a1ddc1abd8 -->
# Task 5: Database Schema Refinement and ID Standardization

## Overview

This plan addresses Task 5.0 requirements: refine database schema based on UX insights, standardize ID generation format, migrate existing entities, enhance CRUD operations for dependent fields, and ensure data integrity.

## Current State Analysis

### ID Generation Current State

- **Current format**: Prefix-UUID (e.g., `JIN-550e8400-e29b-41d4-a716-446655440000`)
- **Seed data format**: Sequential (e.g., `ART-001`, `JIN-0001`, `CAN-001`, `TEM-001`)
- **Inconsistency**: Seed data doesn't match generation function
- **Fabrica IDs**: External (YouTube video IDs, e.g., `0hmxZPp0xq0`)

### Schema Redundancy Current State

- **Already documented**: `fabricaId`, `cancionId`, `autorIds` in schema.ts
- **Migration exists**: `backfill-redundant-properties.ts` for backfilling
- **API updates**: `updateRedundantPropertiesOnRelationshipChange()` exists but needs enhancement
- **Validation**: Exists in `validation.ts` and `entityValidation.ts` - needs integration with CRUD

### Entity Types and Prefixes

- Artista → `a` (was `ART-`)
- Cancion → `c` (was `CAN-`)
- Tematica → `t` (was `TEM-`)
- Jingle → `j` (was `JIN-`)
- Usuario → `u` (was `USR-`)
- Fabrica → No prefix (external YouTube ID)

## Implementation Plan

### Phase 0: Automatic Order Management for APPEARS_IN Relationships

#### 0.1 Create Order Management Utility Function

**File**: `backend/src/server/api/admin.ts` (or new utility file)

- Create function `updateAppearsInOrder(fabricaId: string)`:
- Query all APPEARS_IN relationships for the Fabrica
- Sort by timestamp (in seconds)
- Assign sequential order (1, 2, 3, 4...)
- Handle tie-breaks (same timestamp): Warn but allow, assign order arbitrarily
- Update all relationships in single transaction

#### 0.2 Integrate Order Updates into Relationship CRUD

**File**: `backend/src/server/api/admin.ts`

- On APPEARS_IN CREATE:
- Default timestamp to 0 (00:00:00) if not provided
- Call `updateAppearsInOrder()` to recalculate all orders for the Fabrica
- Warn if timestamp conflicts with existing relationship (same timestamp)

- On APPEARS_IN UPDATE:
- Detect timestamp changes
- Call `updateAppearsInOrder()` to recalculate all orders for the Fabrica
- Warn if new timestamp conflicts with existing relationship

- On APPEARS_IN DELETE:
- Call `updateAppearsInOrder()` to recalculate remaining orders for the Fabrica

#### 0.3 Make Order Property Read-Only

**File**: `backend/src/server/api/admin.ts`

- Remove `order` from accepted properties in relationship CREATE/UPDATE payloads
- Always calculate `order` automatically based on timestamp
- Return calculated `order` in API responses
- Update validation to reject `order` in input (if provided, ignore with warning)

#### 0.4 Update Schema Documentation

**File**: `backend/src/server/db/schema/schema.ts`

- Document that `order` is system-managed and read-only
- Document automatic ordering behavior
- Document timestamp conflict handling

#### 0.5 Update Frontend Types and Validation

**Files**: `frontend/src/types/index.ts`, validation schemas

- Mark `order` as read-only in TypeScript types (for display only)
- Note: UI already handles read-only properties correctly (shows them but doesn't allow input, e.g., fabrica YouTube URL)
- Ensure `order` is displayed but not editable in relationship forms
- Remove `order` from relationship creation/update form inputs

### Phase 1: ID Generation Standardization

#### 1.1 Update ID Generation Function

**File**: `backend/src/server/api/admin.ts`

- Modify `generateId()` function:
- Format: `{prefix}{8-char-alphanumeric}` (e.g., `a1b2c3d4`, `j5e6f7g8`)
- Use base36 (0-9, a-z) for 8 characters
- Generate using crypto.randomBytes or similar
- Keep Fabrica special handling (external YouTube ID)

#### 1.2 Create ID Migration Script

**File**: `backend/src/server/db/migration/migrate-entity-ids.ts`

- Query all entities by type
- Generate new IDs using new format
- Create temporary mapping: `oldId → newId` for each entity type (for rollback safety during migration only)
- Update all relationships to use new IDs (cascade)
- Update redundant properties (`fabricaId`, `cancionId`, `autorIds`)
- Validate no ID collisions before migration
- Rollback capability: Store mapping temporarily for migration safety, discard after successful migration (not needed long-term)

#### 1.3 Update Seed Data to Match Current Database State

**Files**: `backend/src/server/db/seed.yaml`, CSV import files

- Export current database state (all entities added manually via Admin portal)
- Update all seed data IDs to new format (`{prefix}{8-chars}`)
- Update all properties to match refined schema (not just IDs):
- Include all redundant properties (`fabricaId`, `cancionId`, `autorIds`, `fabricaDate`)
- Include all status fields
- Include all new properties (`isLive`, `isRepeat` for Jingles)
- Ensure all schema refinements are reflected
- Update relationship references in seed files
- Ensure consistency across all seed files (YAML and CSV)

### Phase 2: Enhanced CRUD Operations for Dependent Fields

#### 2.1 Enhance Relationship CRUD Handlers

**File**: `backend/src/server/api/admin.ts`

- Enhance `updateRedundantPropertiesOnRelationshipChange()`:
- Handle all relationship types comprehensively
- Add transaction support for atomicity
- Handle edge cases (multiple relationships, deletions)
- Update `fabricaDate` when `fabricaId` changes
- Update `autorIds` array correctly (add/remove)

#### 2.2 Add Entity CRUD Dependent Field Updates (Redundant Properties)

**File**: `backend/src/server/api/admin.ts`

**Note**: This applies to redundant properties (derived data) that improve query performance:

- **Jingle**: `fabricaId`, `fabricaDate`, `cancionId` (derived from APPEARS_IN and VERSIONA relationships)
- **Cancion**: `autorIds[]` (derived from AUTOR_DE relationships)
- **Other entities** (Artista, Tematica, Fabrica, Usuario): No redundant properties requiring dependent field updates

- On entity CREATE:
- **Jingle**: If `fabricaId` provided, validate Fabrica exists and auto-create APPEARS_IN relationship if missing
- **Jingle**: If `cancionId` provided, validate Cancion exists and auto-create VERSIONA relationship if missing
- **Cancion**: If `autorIds[]` provided, validate Artistas exist and auto-create AUTOR_DE relationships if missing

- On entity UPDATE:
- **Jingle**: Detect changes to `fabricaId`, `cancionId` and update/create/delete relationships accordingly
- **Cancion**: Detect changes to `autorIds[]` and update/create/delete AUTOR_DE relationships accordingly
- Maintain consistency between redundant properties and relationships

- On entity DELETE:
- Cascade delete relationships (already handled by DETACH DELETE)
- Clear redundant properties on related entities (e.g., remove from `autorIds[]` when Artista deleted)

#### 2.3 Enhance Existing Validation Middleware

**File**: `backend/src/server/api/admin.ts`

**Note**: Validation middleware already exists (`validateEntityInput`, `validateEntityInputSafe` from `entityValidation.ts`). Enhance existing validation:

- Enhance pre-CRUD validation (in POST/PUT handlers):
- Use existing `validateEntityInput`/`validateEntityInputSafe` for schema validation
- Add redundant property validation: Check if `fabricaId`/`cancionId`/`autorIds` match relationships (non-blocking warning)
- Auto-fix discrepancies with clear precedence: **Relationships are source of truth** → update redundant properties to match

- Enhance post-CRUD validation:
- After entity create/update, run `validateEntity` from `validation.ts` to check redundant field mismatches
- Auto-fix discrepancies immediately (relationships > redundant properties)
- Log discrepancies for monitoring (non-blocking, doesn't fail the operation)

### Phase 3: Schema Refinement Implementation

#### 3.1 Update Type Definitions

**File**: `backend/src/server/db/types.ts`

- Ensure all redundant properties are properly typed
- Add JSDoc comments explaining redundancy purpose
- Mark optional fields correctly

#### 3.2 Update Schema Documentation

**File**: `backend/src/server/db/schema/schema.ts`

- Document new ID format
- Document redundant property maintenance rules
- Add precedence rules for conflict resolution

#### 3.3 Update Frontend Types

**File**: `frontend/src/types/index.ts`

- Sync with backend types
- Ensure ID format expectations match

### Phase 4: Migration Execution

#### 4.1 Pre-Migration Validation

- Audit current database state
- Identify all entities with old ID format
- Count relationships per entity type
- Generate migration report

#### 4.2 Execute ID Migration

- Run migration script in transaction
- Update all entity nodes
- Update all relationships
- Update redundant properties
- Validate data integrity
- Discard temporary ID mapping after successful migration

#### 4.3 Post-Migration Validation

- Verify all IDs match new format
- Verify relationships intact
- Verify redundant properties correct
- Run full validation suite

### Phase 5: Testing and Documentation

#### 5.1 Update API Tests

**Files**: Test files in `backend/tests/`

- Test new ID generation format
- Test dependent field updates
- Test relationship cascading
- Test validation logic

#### 5.2 Update Documentation

**Files**: `docs/`, `backend/src/server/db/schema/`

- Document new ID format
- Document migration process
- Document dependent field handling
- Update API documentation

#### 5.3 Create Migration Guide

**File**: `backend/src/server/db/migration/README.md`

- Step-by-step migration instructions
- Rollback procedures (temporary, for migration safety only)
- Troubleshooting guide

## Technical Details

### ID Format Specification

- **Pattern**: `{prefix}{8-chars}`
- **Prefixes**: `a` (Artista), `c` (Cancion), `t` (Tematica), `j` (Jingle), `u` (Usuario)
- **8-chars**: Base36 alphanumeric (0-9, a-z), lowercase
- **Example**: `a1b2c3d4`, `j5e6f7g8`, `c9f0a1b2`
- **Collision handling**: Check existence before assignment, retry if collision

### Dependent Field Precedence Rules

1. **Relationships are source of truth** for redundant properties
2. **On conflict**: Update redundant property to match relationship
3. **On relationship create**: Auto-populate redundant property
4. **On relationship delete**: Clear redundant property if no other relationships exist
5. **On entity update**: Validate and auto-fix discrepancies

### Migration Strategy

1. **Dry-run mode**: Generate mapping without applying changes
2. **Transaction-based**: All changes in single transaction
3. **Rollback capability**: Store old→new ID mapping temporarily during migration for safety; discard after successful migration (not needed long-term)
4. **Validation checkpoints**: Validate after each entity type migration
5. **Relationship cascade**: Update all relationship references atomically
6. **Post-migration cleanup**: Remove temporary ID mapping after successful migration

## Files to Modify

### Backend

- `backend/src/server/api/admin.ts` - ID generation, CRUD enhancements
- `backend/src/server/db/types.ts` - Type definitions
- `backend/src/server/db/schema/schema.ts` - Schema documentation
- `backend/src/server/utils/validation.ts` - Validation utilities (may need updates)
- `backend/src/server/db/migration/migrate-entity-ids.ts` - NEW: ID migration script
- `backend/src/server/db/seed.yaml` - Update seed data (export current DB state, update all properties)
- `backend/src/server/db/import/*.csv` - Update CSV import files (all properties, not just IDs)

### Frontend

- `frontend/src/types/index.ts` - Type definitions sync

### Documentation

- `backend/src/server/db/schema/REFINEMENT_NOTES.md` - Update with implementation details
- `backend/src/server/db/migration/README.md` - NEW: Migration guide
- `docs/api.md` - Update API documentation

## Risk Mitigation

1. **Data Loss Prevention**: Full database backup before migration
2. **Rollback Plan**: Store old→new ID mapping temporarily for migration safety only
3. **Testing**: Test migration on development database first
4. **Validation**: Comprehensive validation after migration
5. **Monitoring**: Log all changes for audit trail

## Success Criteria

- [ ] All entity IDs use new format (`{prefix}{8-chars}`)
- [ ] All relationships updated with new IDs
- [ ] All redundant properties updated correctly
- [ ] CRUD operations automatically maintain dependent fields
- [ ] Validation catches and fixes discrepancies
- [ ] Migration script tested and documented
- [ ] Seed data updated to new format and matches current database state
- [ ] API tests passing
- [ ] Documentation updated

### To-dos

- [ ] Update generateId() function in admin.ts to use new format: single char prefix (a,c,t,j,u) + 8 base36 alphanumeric characters
- [ ] Create migrate-entity-ids.ts script to migrate existing entities from old format to new format with relationship cascade
- [ ] Enhance updateRedundantPropertiesOnRelationshipChange() to handle all relationship types comprehensively with transaction support
- [ ] Add entity CRUD handlers to auto-update/create relationships when redundant properties (fabricaId, cancionId, autorIds) are provided
- [ ] Add validation middleware to auto-fix discrepancies between redundant properties and relationships with clear precedence (relationships > redundant properties)
- [ ] Update backend types.ts and schema.ts documentation to reflect new ID format and dependent field handling rules
- [ ] Update frontend types/index.ts to sync with backend ID format expectations
- [ ] Update seed.yaml and CSV import files with new ID format
- [ ] Execute migration script on development database and validate data integrity
- [ ] Update API tests to cover new ID generation, dependent field updates, and relationship cascading
- [ ] Create migration guide documentation (README.md) with step-by-step instructions and rollback procedures
- [ ] Update REFINEMENT_NOTES.md and API documentation with implementation details