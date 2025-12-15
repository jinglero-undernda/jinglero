# Schema Gap Analysis Report: normSearch Property

**Date**: 2025-12-14  
**Analyst**: AI Assistant  
**Schema Version**: current_implementation  
**Analysis Type**: New Property Implementation Gap Analysis

## Executive Summary

- **Total Gaps Identified**: 3
- **Critical Gaps**: 1
- **High Priority Gaps**: 1
- **Medium Priority Gaps**: 1
- **Low Priority Gaps**: 0

### Summary

The `normSearch` property has been implemented in code and documented in schema, but existing database entities do not have this property populated. A migration script is required to backfill the property for all existing nodes.

## Gap Summary by Layer

### Schema Layer

- **Missing Elements**: 0 (property is documented)
- **Extra Elements**: 0
- **Schema Mismatches**: 0

### Frontend Layer

- **Missing Properties**: 0 (TypeScript types will need update if used)
- **Extra Properties**: 0
- **Type Mismatches**: 0

### Backend Layer

- **Missing Properties**: 0 (implementation exists)
- **Extra Properties**: 0
- **Implementation Mismatches**: 1 (existing entities lack normSearch values)

## Detailed Gap Analysis

### Gap 1: Existing Entities Missing normSearch Property

**Layer**: Backend  
**Severity**: High  
**Priority**: P1

**Description**:
All existing entities in the database (Jingle, Artista, Cancion, Fabrica, Tematica) do not have the `normSearch` property populated. While the property generation logic is implemented and will auto-update for new/modified entities, existing entities need to be backfilled.

**Current State**:

- `normSearch` property generation logic implemented in `backend/src/server/utils/displayProperties.ts`
- Property is auto-updated when entities are modified via `updateDisplayProperties()`
- Existing entities in database have `normSearch = null` or property is missing

**Desired State**:

- All existing entities should have `normSearch` property populated with normalized search text
- Property should be automatically maintained going forward

**Impact**:

- **Schema Impact**: None - property is documented
- **Frontend Impact**: Low - frontend doesn't currently use normSearch, but will need it for search functionality
- **Backend Impact**: High - search functionality cannot work properly until property is backfilled

**Root Cause**:
Property was added to schema and implementation, but no migration script was created to backfill existing data.

**Recommendation**:
Create and execute migration script to backfill `normSearch` for all existing entities using the existing `generateNormSearch()` function.

**Effort Estimate**: Small (1-2 hours)
**Dependencies**: None

**Code References**:

- Current Implementation: `backend/src/server/utils/displayProperties.ts:709-962`
- Migration Script Needed: `backend/src/server/db/migration/backfill-normSearch.ts` (to be created)

---

### Gap 2: TypeScript Types Missing normSearch Property

**Layer**: Frontend  
**Severity**: Medium  
**Priority**: P2

**Description**:
Frontend TypeScript type definitions may not include the `normSearch` property for entity interfaces.

**Current State**:

- Backend implementation includes normSearch
- Frontend types may not reflect this property

**Desired State**:

- All entity TypeScript interfaces should include optional `normSearch?: string` property

**Impact**:

- **Schema Impact**: None
- **Frontend Impact**: Medium - TypeScript compilation errors if property is accessed
- **Backend Impact**: None

**Root Cause**:
Types were not updated when property was added.

**Recommendation**:
Update TypeScript interfaces in `frontend/src/types/index.ts` to include `normSearch?: string` for all entity types.

**Effort Estimate**: Small (15 minutes)
**Dependencies**: None

**Code References**:

- Types Location: `frontend/src/types/index.ts`
- Backend Types: `backend/src/server/db/types.ts`

---

### Gap 3: Migration Script Documentation

**Layer**: Documentation  
**Severity**: Medium  
**Priority**: P2

**Description**:
Migration script for backfilling normSearch needs to be documented in migration README.

**Current State**:

- Migration script will be created
- No documentation exists for running the migration

**Desired State**:

- Migration script documented in `backend/src/server/db/migration/README.md`
- Usage instructions provided
- Rollback procedure documented

**Impact**:

- **Schema Impact**: None
- **Frontend Impact**: None
- **Backend Impact**: Low - developers need instructions to run migration

**Root Cause**:
Documentation follows implementation.

**Recommendation**:
Add migration documentation to README after script is created.

**Effort Estimate**: Small (30 minutes)
**Dependencies**: Gap 1 (migration script must exist first)

**Code References**:

- Migration README: `backend/src/server/db/migration/README.md`

---

## Prioritized Gap List

### P0 - Critical (Fix Immediately)

_None_

### P1 - High (Fix in Next Sprint)

1. **Existing Entities Missing normSearch Property** - Backfill normSearch for all existing entities

### P2 - Medium (Fix in Next Quarter)

1. **TypeScript Types Missing normSearch Property** - Update frontend types
2. **Migration Script Documentation** - Document migration process

### P3 - Low (Fix When Convenient)

_None_

## Recommendations

### Immediate Actions

1. **Create migration script** (`backend/src/server/db/migration/backfill-normSearch.ts`)

   - Use existing `generateNormSearch()` function
   - Process all entity types: Jingle, Artista, Cancion, Fabrica, Tematica
   - Include dry-run mode
   - Provide progress reporting
   - Handle errors gracefully

2. **Test migration script**
   - Run in dry-run mode first
   - Test on development database
   - Verify normSearch values are correct
   - Check performance on large datasets

### Short-term Actions (Next Sprint)

1. **Execute migration on development database**

   - Backup database first
   - Run migration script
   - Validate results
   - Test search functionality

2. **Update TypeScript types**
   - Add `normSearch?: string` to all entity interfaces
   - Verify no compilation errors

### Long-term Actions (Next Quarter)

1. **Document migration process**

   - Add to migration README
   - Include rollback procedures
   - Document performance considerations

2. **Monitor search performance**
   - Verify normSearch improves search functionality
   - Consider adding full-text index on normSearch if needed

## Migration Roadmap

### Phase 1: Preparation (Day 1)

- [x] Implement normSearch generation logic
- [x] Document property in schema
- [ ] Create migration script
- [ ] Test migration script on sample data

### Phase 2: Development Testing (Day 2)

- [ ] Run migration on development database
- [ ] Validate normSearch values
- [ ] Update TypeScript types
- [ ] Test search functionality

### Phase 3: Production Deployment (Day 3)

- [ ] Backup production database
- [ ] Run migration on production
- [ ] Monitor for errors
- [ ] Verify search functionality

## Next Steps

1. [ ] Create migration script (`backfill-normSearch.ts`)
2. [ ] Test migration script in dry-run mode
3. [ ] Execute migration on development database
4. [ ] Update TypeScript types
5. [ ] Document migration process
6. [ ] Deploy to production

---

## Change History

- **2025-12-14**: Initial gap analysis created for normSearch property implementation
