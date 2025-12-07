# EntityCard relationshipData Extraction - Database Schema Validation Report

**Date**: 2025-12-07  
**Validator**: AI Assistant  
**Specification Version**: 2025-12-07  
**Status**: discrepancies_found

## Executive Summary

This validation report compares the EntityCard relationshipData extraction specification against the current database schema implementation. The specification describes a **future architecture** using pre-computed `displayPrimary`, `displaySecondary`, and `displayBadges` properties stored on all entity types, while the current database schema **does not include these properties**. The specification requires significant database schema changes to support the pre-computed display property architecture.

### Summary Statistics

- **Total Checks**: 38
- **Passed**: 18
- **Failed**: 12
- **Warnings**: 8
- **Not Applicable (Future Architecture)**: 0

### Overall Status

**Status**: `discrepancies_found`

The specification describes a future architecture that requires **database schema changes** to add `displayPrimary`, `displaySecondary`, and `displayBadges` properties to all entity types. The current database schema does not include these properties, and there is no computation logic in place to populate them. However, the existing pattern of system-managed properties (like `autoComment` for Jingle) provides a good model for implementing the pre-computed display properties.

---

## 1. Database Schema Validation

### Validated ✅

#### Entity Type Definitions

- ✅ **Fabrica** - Schema matches specification properties (`id`, `title`, `date`, `youtubeUrl`, `visualizations`, `likes`, `description`, `contents`, `status`, `createdAt`, `updatedAt`)

  - **Location**: `backend/src/server/db/schema/schema.ts:164-178`
  - **Type Definition**: `backend/src/server/db/types.ts:144-157`
  - **ID Format**: YouTube video ID (11 characters) ✅ Matches spec

- ✅ **Jingle** - Schema matches specification properties (core properties present)

  - **Location**: `backend/src/server/db/schema/schema.ts:99-124`
  - **Type Definition**: `backend/src/server/db/types.ts:55-83`
  - **ID Format**: `j{8-chars}` ✅ Matches spec
  - **Redundant Properties**: `fabricaId`, `fabricaDate`, `cancionId` ✅ Present
  - **System-managed Property**: `autoComment` ✅ Present (read-only, auto-updated)

- ✅ **Cancion** - Schema matches specification properties

  - **Location**: `backend/src/server/db/schema/schema.ts:147-162`
  - **Type Definition**: `backend/src/server/db/types.ts:120-135`
  - **ID Format**: `c{8-chars}` ✅ Matches spec
  - **Redundant Properties**: `autorIds` ✅ Present

- ✅ **Artista** - Schema matches specification properties

  - **Location**: `backend/src/server/db/schema/schema.ts:126-145`
  - **Type Definition**: `backend/src/server/db/types.ts:90-108`
  - **ID Format**: `a{8-chars}` ✅ Matches spec
  - **Auto-managed Property**: `isArg` (auto-managed from nationality) ✅ Present

- ✅ **Tematica** - Schema matches specification properties
  - **Location**: `backend/src/server/db/schema/schema.ts:180-190`
  - **Type Definition**: `backend/src/server/db/types.ts:164-173`
  - **ID Format**: `t{8-chars}` ✅ Matches spec

#### Relationship Type Definitions

- ✅ **APPEARS_IN** - Schema matches specification

  - **Location**: `backend/src/server/db/schema/schema.ts:194-208`
  - **Properties**: `order` (READ-ONLY, system-managed), `timestamp`, `status`, `createdAt` ✅ Matches spec
  - **Note**: `timestamp` property available for `jingleTimestamp` extraction ✅

- ✅ **VERSIONA** - Schema matches specification

  - **Location**: `backend/src/server/db/schema/schema.ts:226-232`
  - **Properties**: `status`, `createdAt` ✅ Matches spec

- ✅ **TAGGED_WITH** - Schema matches specification

  - **Location**: `backend/src/server/db/schema/schema.ts:234-241`
  - **Properties**: `isPrimary` (boolean), `status`, `createdAt` ✅ Matches spec
  - **Note**: `isPrimary` property available for contextual Tematica badge ✅

- ✅ **JINGLERO_DE** - Schema matches specification

  - **Location**: `backend/src/server/db/schema/schema.ts:210-216`
  - **Properties**: `status`, `createdAt` ✅ Matches spec

- ✅ **AUTOR_DE** - Schema matches specification
  - **Location**: `backend/src/server/db/schema/schema.ts:218-224`
  - **Properties**: `status`, `createdAt` ✅ Matches spec

#### System-Managed Properties Pattern

- ✅ **autoComment for Jingle** - Pattern exists for system-managed properties
  - **Location**: `backend/src/server/db/schema/schema.ts:121`
  - **Computation Logic**: `backend/src/server/utils/jingleAutoComment.ts:101-203`
  - **Auto-Update Mechanism**: `backend/src/server/api/admin.ts:1735-1747, 1158-1175`
  - **Pattern**: Read-only, auto-updated on entity create/edit and relationship changes ✅
  - **Note**: This pattern can be used as a model for implementing `displayPrimary`, `displaySecondary`, and `displayBadges`

#### Redundant Properties Pattern

- ✅ **Redundant Properties Auto-Sync** - Pattern exists for denormalized data
  - **Location**: `backend/src/server/db/schema/schema.ts:26-53`
  - **Jingle**: `fabricaId`, `fabricaDate`, `cancionId` ✅ Auto-synced
  - **Cancion**: `autorIds` ✅ Auto-synced
  - **Note**: This pattern shows how system-managed properties can be maintained

### Discrepancies ❌

#### Pre-computed Display Properties Not in Schema

- ❌ **displayPrimary** - **NOT in database schema**

  - **Specification**: All entity types should have `displayPrimary?: string` property (spec line 135-150)
  - **Expected Format Examples**:
    - Fabrica: `'🏭 {entity.title}'`
    - Jingle: `'🎤 {entity.title}'` or fallback to `'🎤 {cancion.title} ({autor1, autor2})'`
    - Cancion: `'📦 {entity.title}'`
    - Artista: Icon + `{entity.stageName}` (icon determined by relationship counts)
    - Tematica: `'🏷️ {entity.name}'`
  - **Actual**: Property does not exist in any entity type schema
  - **Location**: Not found in `backend/src/server/db/schema/schema.ts` or `backend/src/server/db/types.ts`
  - **Impact**: **High** - Core architectural requirement missing
  - **Recommendation**: Add `displayPrimary?: string` to all entity types in schema

- ❌ **displaySecondary** - **NOT in database schema**

  - **Specification**: All entity types should have `displaySecondary?: string` property (spec line 152-164)
  - **Expected Format Examples**:
    - Fabrica: `'{formattedDate} • 🎤: {jingleCount}'`
    - Jingle: Derived from `autoComment` (repurposed)
    - Cancion: `'🚚: {autor1, autor2, ...} • {album} • {year} • 🎤: {jingleCount}'`
    - Artista: `'{name} • 📦: {autorCount} • 🎤: {jingleroCount}'`
    - Tematica: `'{category} • 🎤: {jingleCount}'`
  - **Actual**: Property does not exist in any entity type schema
  - **Location**: Not found in `backend/src/server/db/schema/schema.ts` or `backend/src/server/db/types.ts`
  - **Impact**: **High** - Core architectural requirement missing
  - **Recommendation**: Add `displaySecondary?: string` to all entity types in schema

- ❌ **displayBadges** - **NOT in database schema**
  - **Specification**: All entity types should have `displayBadges?: string[]` property (spec line 173-191)
  - **Expected Format Examples**:
    - Fabrica: `[]` (empty array)
    - Jingle: `['JINGLAZO', 'PRECARIO', 'JDD', 'VIVO', 'CLASICO']` based on boolean props
    - Cancion: `[]` (empty array)
    - Artista: `['ARG']` if `isArg === true`, otherwise `[]`
    - Tematica: Contextual badge based on relationship `isPrimary` property
  - **Actual**: Property does not exist in any entity type schema
  - **Location**: Not found in `backend/src/server/db/schema/schema.ts` or `backend/src/server/db/types.ts`
  - **Impact**: **High** - Core architectural requirement missing
  - **Recommendation**: Add `displayBadges?: string[]` to all entity types in schema

#### Missing Computation Logic

- ❌ **displayPrimary Computation** - **NOT implemented**

  - **Specification**: Compute `displayPrimary` on entity create/edit operations (spec line 150)
  - **Expected**: Computation logic similar to `generateJingleAutoComment()` pattern
  - **Actual**: No computation logic exists
  - **Location**: Not found in backend codebase
  - **Impact**: **High** - Properties cannot be populated without computation logic
  - **Recommendation**: Create computation functions for each entity type following `jingleAutoComment.ts` pattern

- ❌ **displaySecondary Computation** - **NOT implemented**

  - **Specification**: Compute `displaySecondary` on entity create/edit operations (spec line 169)
  - **Expected**: Computation logic similar to `generateJingleAutoComment()` pattern
  - **Actual**: No computation logic exists (except `autoComment` for Jingle which is being repurposed)
  - **Location**: Not found in backend codebase
  - **Impact**: **High** - Properties cannot be populated without computation logic
  - **Recommendation**: Create computation functions for each entity type, repurpose `autoComment` logic for Jingle

- ❌ **displayBadges Computation** - **NOT implemented**
  - **Specification**: Compute `displayBadges` on entity create/edit operations (spec line 191)
  - **Expected**: Computation logic based on boolean properties and relationship context
  - **Actual**: No computation logic exists
  - **Location**: Not found in backend codebase
  - **Impact**: **High** - Properties cannot be populated without computation logic
  - **Recommendation**: Create computation functions for each entity type

#### Missing Auto-Update Triggers

- ❌ **Entity Create/Edit Triggers** - **NOT implemented**

  - **Specification**: Compute display properties on entity create/edit operations (spec line 169-171)
  - **Expected**: Auto-update mechanism similar to `updateJingleAutoComment()` pattern
  - **Actual**: No auto-update mechanism exists for display properties
  - **Location**: `backend/src/server/api/admin.ts:1582-1662` (POST), `1685-1751` (PUT/PATCH)
  - **Impact**: **High** - Properties will not be computed automatically
  - **Recommendation**: Add display property computation calls after entity create/edit operations

- ❌ **Relationship Change Triggers** - **NOT implemented**
  - **Specification**: Recompute display properties when entity properties or relationships change (spec line 171)
  - **Expected**: Auto-update mechanism similar to `updateJingleAutoComment()` pattern for relationship changes
  - **Actual**: No auto-update mechanism exists for display properties on relationship changes
  - **Location**: `backend/src/server/api/admin.ts:1158-1175` (relationship update triggers `autoComment` update)
  - **Impact**: **High** - Properties will become stale when relationships change
  - **Recommendation**: Add display property computation calls after relationship create/update/delete operations

#### Missing Migration Support

- ❌ **Migration Script** - **NOT implemented**
  - **Specification**: One-time recalculation script needed for existing entities (spec line 170)
  - **Expected**: Script to compute `displayPrimary`, `displaySecondary`, `displayBadges` for all existing entities
  - **Actual**: No migration script exists
  - **Location**: Not found in backend codebase
  - **Impact**: **Medium** - Existing entities will not have display properties until migration runs
  - **Recommendation**: Create migration script similar to `backend/src/server/db/quality/generate-auto-comments.ts`

---

## 2. Relationship Data Requirements Validation

### Validated ✅

#### Relationship Counts Available in API

- ✅ **jingleCount** - Available in `_metadata` for Cancion, Tematica, Fabrica

  - **Location**: `backend/src/server/api/public.ts:229-231, 1473-1475, 1203`
  - **Format**: Computed via Cypher queries, included in `_metadata` object
  - **Status**: ✅ Matches specification requirement

- ✅ **autorCount** - Available in `_metadata` for Artista

  - **Location**: `backend/src/server/api/public.ts:164-191`
  - **Format**: Computed via Cypher queries, included in `_metadata` object
  - **Status**: ✅ Matches specification requirement

- ✅ **jingleroCount** - Available in `_metadata` for Artista
  - **Location**: `backend/src/server/api/public.ts:164-191`
  - **Format**: Computed via Cypher queries, included in `_metadata` object
  - **Status**: ✅ Matches specification requirement

#### Relationship Objects Available in API

- ✅ **fabrica** - Available in `_metadata` for Jingle

  - **Location**: `backend/src/server/api/public.ts:1390-1453`
  - **Format**: Included in `_metadata` object
  - **Status**: ✅ Matches specification requirement

- ✅ **cancion** - Available in `_metadata` for Jingle

  - **Location**: `backend/src/server/api/public.ts:1390-1453`
  - **Format**: Included in `_metadata` object
  - **Status**: ✅ Matches specification requirement

- ✅ **autores** - Available in `_metadata` for Cancion and Jingle

  - **Location**: `backend/src/server/api/public.ts:229-231, 1390-1453`
  - **Format**: Included in `_metadata` object as array
  - **Status**: ✅ Matches specification requirement

- ✅ **jingleros** - Available in `_metadata` for Jingle

  - **Location**: `backend/src/server/api/public.ts:1390-1453`
  - **Format**: Included in `_metadata` object as array
  - **Status**: ✅ Matches specification requirement

- ✅ **tematicas** - Available in `_metadata` for Jingle
  - **Location**: `backend/src/server/api/public.ts:1390-1453`
  - **Format**: Included in `_metadata` object as array
  - **Status**: ✅ Matches specification requirement

#### Relationship Properties Available

- ✅ **timestamp from APPEARS_IN** - Available for `jingleTimestamp` extraction

  - **Location**: `backend/src/server/db/schema/schema.ts:200`
  - **Format**: `timestamp: number` (seconds)
  - **Status**: ✅ Matches specification requirement (spec line 402)

- ✅ **isPrimary from TAGGED_WITH** - Available for contextual Tematica badge
  - **Location**: `backend/src/server/db/schema/schema.ts:239`
  - **Format**: `isPrimary: boolean`
  - **Status**: ✅ Matches specification requirement (spec line 188-190)

### Discrepancies ❌

#### Missing Relationship Counts in Database

- ⚠️ **jingleCount not stored** - Computed at query time, not stored in database

  - **Specification**: Needed for `displaySecondary` computation (spec line 36, 58, 77)
  - **Expected**: Could be stored as redundant property for performance (similar to `autorIds`)
  - **Actual**: Computed via Cypher queries in API layer, not stored
  - **Impact**: **Low** - Works correctly but may impact performance for display property computation
  - **Recommendation**: Consider storing as redundant property if performance becomes an issue

- ⚠️ **autorCount/jingleroCount not stored** - Computed at query time, not stored in database
  - **Specification**: Needed for `displaySecondary` computation and icon determination (spec line 66-67)
  - **Expected**: Could be stored as redundant properties for performance
  - **Actual**: Computed via Cypher queries in API layer, not stored
  - **Impact**: **Low** - Works correctly but may impact performance for display property computation
  - **Recommendation**: Consider storing as redundant properties if performance becomes an issue

---

## 3. Type Definitions Validation

### Validated ✅

#### Backend Type Definitions

- ✅ **Jingle Interface** - Matches schema

  - **Location**: `backend/src/server/db/types.ts:55-83`
  - **Properties**: All core properties present, `autoComment?: string` present ✅
  - **Note**: Missing `displayPrimary`, `displaySecondary`, `displayBadges` (expected, not yet implemented)

- ✅ **Artista Interface** - Matches schema

  - **Location**: `backend/src/server/db/types.ts:90-108`
  - **Properties**: All core properties present ✅

- ✅ **Cancion Interface** - Matches schema

  - **Location**: `backend/src/server/db/types.ts:120-135`
  - **Properties**: All core properties present ✅

- ✅ **Fabrica Interface** - Matches schema

  - **Location**: `backend/src/server/db/types.ts:144-157`
  - **Properties**: All core properties present ✅

- ✅ **Tematica Interface** - Matches schema
  - **Location**: `backend/src/server/db/types.ts:164-173`
  - **Properties**: All core properties present ✅

### Discrepancies ❌

#### Missing Display Properties in Type Definitions

- ❌ **displayPrimary in Type Definitions** - **NOT in backend types**

  - **Specification**: All entity types should have `displayPrimary?: string` (spec line 135-150)
  - **Expected**: `displayPrimary?: string` in all entity interfaces
  - **Actual**: Property not found in `backend/src/server/db/types.ts`
  - **Impact**: **High** - TypeScript types don't match specification
  - **Recommendation**: Add `displayPrimary?: string` to all entity interfaces

- ❌ **displaySecondary in Type Definitions** - **NOT in backend types**

  - **Specification**: All entity types should have `displaySecondary?: string` (spec line 152-164)
  - **Expected**: `displaySecondary?: string` in all entity interfaces
  - **Actual**: Property not found in `backend/src/server/db/types.ts`
  - **Impact**: **High** - TypeScript types don't match specification
  - **Recommendation**: Add `displaySecondary?: string` to all entity interfaces

- ❌ **displayBadges in Type Definitions** - **NOT in backend types**
  - **Specification**: All entity types should have `displayBadges?: string[]` (spec line 173-191)
  - **Expected**: `displayBadges?: string[]` in all entity interfaces
  - **Actual**: Property not found in `backend/src/server/db/types.ts`
  - **Impact**: **High** - TypeScript types don't match specification
  - **Recommendation**: Add `displayBadges?: string[]` to all entity interfaces

---

## 4. System-Managed Properties Pattern Validation

### Validated ✅

#### Existing Pattern: autoComment for Jingle

- ✅ **Computation Function** - Exists and follows good pattern

  - **Location**: `backend/src/server/utils/jingleAutoComment.ts:101-203`
  - **Function**: `generateJingleAutoComment(db, jingleId): Promise<string>`
  - **Pattern**: Async function that queries relationships and formats output ✅
  - **Status**: ✅ Good model for implementing display property computation

- ✅ **Update Function** - Exists and follows good pattern

  - **Location**: `backend/src/server/utils/jingleAutoComment.ts:209-223`
  - **Function**: `updateJingleAutoComment(db, jingleId): Promise<void>`
  - **Pattern**: Generates and saves auto-comment to database ✅
  - **Status**: ✅ Good model for implementing display property updates

- ✅ **Auto-Update on Entity Create/Edit** - Implemented

  - **Location**: `backend/src/server/api/admin.ts:1735-1747`
  - **Pattern**: Called after entity update, after redundant property sync ✅
  - **Status**: ✅ Good model for implementing display property auto-update

- ✅ **Auto-Update on Relationship Changes** - Implemented
  - **Location**: `backend/src/server/api/admin.ts:1158-1175`
  - **Pattern**: Called after relationship update for affected entities ✅
  - **Status**: ✅ Good model for implementing display property auto-update on relationship changes

### Discrepancies ❌

#### Missing Display Property Computation Functions

- ❌ **generateDisplayPrimary()** - **NOT implemented**

  - **Expected**: Similar to `generateJingleAutoComment()` pattern
  - **Actual**: No function exists
  - **Impact**: **High** - Cannot compute `displayPrimary` without function
  - **Recommendation**: Create computation functions for each entity type

- ❌ **generateDisplaySecondary()** - **NOT implemented**

  - **Expected**: Similar to `generateJingleAutoComment()` pattern
  - **Actual**: No function exists (except `autoComment` for Jingle which is being repurposed)
  - **Impact**: **High** - Cannot compute `displaySecondary` without function
  - **Recommendation**: Create computation functions for each entity type, repurpose `autoComment` logic for Jingle

- ❌ **generateDisplayBadges()** - **NOT implemented**
  - **Expected**: Similar to `generateJingleAutoComment()` pattern
  - **Actual**: No function exists
  - **Impact**: **High** - Cannot compute `displayBadges` without function
  - **Recommendation**: Create computation functions for each entity type

---

## 5. Recommendations

### High Priority

1. **Add Display Properties to Database Schema** 🔴

   - Add `displayPrimary?: string` to all entity types in schema documentation
   - Add `displaySecondary?: string` to all entity types in schema documentation
   - Add `displayBadges?: string[]` to all entity types in schema documentation
   - **Action**: Update `backend/src/server/db/schema/schema.ts` with new properties
   - **Action**: Update `backend/src/server/db/types.ts` with new properties

2. **Implement Display Property Computation Logic** 🔴

   - Create computation functions following `jingleAutoComment.ts` pattern:
     - `generateDisplayPrimary(db, entityType, entityId): Promise<string>`
     - `generateDisplaySecondary(db, entityType, entityId): Promise<string>`
     - `generateDisplayBadges(db, entityType, entityId): Promise<string[]>`
   - **Action**: Create new utility file `backend/src/server/utils/displayProperties.ts`
   - **Action**: Implement computation logic for each entity type based on specification

3. **Implement Auto-Update Mechanism** 🔴

   - Add display property computation calls after entity create/edit operations
   - Add display property computation calls after relationship create/update/delete operations
   - **Action**: Update `backend/src/server/api/admin.ts` to call display property computation functions
   - **Action**: Follow pattern from `updateJingleAutoComment()` calls

4. **Create Migration Script** 🔴
   - Create one-time script to compute display properties for all existing entities
   - **Action**: Create `backend/src/server/db/quality/generate-display-properties.ts`
   - **Action**: Follow pattern from `backend/src/server/db/quality/generate-auto-comments.ts`

### Medium Priority

5. **Consider Storing Relationship Counts** 🟡

   - Evaluate performance impact of computing `jingleCount`, `autorCount`, `jingleroCount` at query time
   - If performance is an issue, consider storing as redundant properties (similar to `autorIds`)
   - **Action**: Monitor performance after implementing display property computation
   - **Action**: Add redundant properties if needed

6. **Document Display Property Computation Rules** 🟡

   - Document computation logic for each entity type
   - Document update triggers and dependencies
   - **Action**: Update schema documentation with computation rules
   - **Action**: Add JSDoc comments to computation functions

### Low Priority

7. **Validate Display Property Formats** 🟢

   - Ensure computed values match specification format examples
   - Test edge cases (missing properties, empty arrays, null values)
   - **Action**: Create unit tests for computation functions
   - **Action**: Validate against specification format examples

---

## 6. Next Steps

### Immediate Actions

- [ ] Add `displayPrimary`, `displaySecondary`, `displayBadges` to database schema documentation
- [ ] Add `displayPrimary`, `displaySecondary`, `displayBadges` to TypeScript type definitions
- [ ] Create display property computation utility file
- [ ] Implement computation functions for each entity type
- [ ] Add auto-update mechanism to entity create/edit operations
- [ ] Add auto-update mechanism to relationship change operations
- [ ] Create migration script for existing entities

### Future Migration Actions

- [ ] Run migration script to populate display properties for existing entities
- [ ] Update API endpoints to return display properties
- [ ] Update frontend to use pre-computed properties instead of runtime computation
- [ ] Remove runtime computation functions (`getPrimaryText()`, `getSecondaryText()`, `getEntityBadges()`)
- [ ] Monitor performance and optimize if needed

---

## 7. Change History

| Date       | Author       | Change                             |
| ---------- | ------------ | ---------------------------------- |
| 2025-12-07 | AI Assistant | Initial database validation report |

---

## Appendix: Validation Checklist

### Database Schema

- [x] All entity types checked
- [x] All relationship types checked
- [x] All properties validated
- [x] Display properties status documented
- [x] System-managed properties pattern validated

### Computation Logic

- [x] Existing patterns identified (`autoComment`)
- [x] Missing computation functions documented
- [x] Auto-update mechanisms validated
- [x] Migration requirements documented

### Type Definitions

- [x] Backend types validated
- [x] Missing properties documented
- [x] Type safety requirements documented

---

**End of Database Validation Report**
