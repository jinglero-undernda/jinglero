<!-- 2edfe4b6-2e77-4cc7-8b8e-e4f607fe47aa 189e48e5-89c5-4316-a633-4eb8e72d09b2 -->
# Validate REPEATS Relationship Implementation

## Purpose

Validate the REPEATS relationship documentation (`repeats-relationship.md`) against the current codebase to identify what's implemented, what's missing, and what needs to be added to integrate REPEATS into the RelatedEntities component on Jingle detail pages.

## Current State Analysis

### Backend (Already Implemented)

- ✅ REPEATS relationship type exists in backend schema
- ✅ API endpoints exist: `POST/PUT/DELETE /api/admin/relationships/repeats`
- ✅ Direction validation logic exists (`validateRepeatsDirection`)
- ✅ Transitive normalization logic exists
- ✅ REPEATS mapped in admin API (`'repeats': 'REPEATS'`)

### Frontend (Missing Implementation)

- ❌ `fetchJingleRepeats` function not in `relationshipService.ts`
- ❌ REPEATS relationship config not in `relationshipConfigs.ts`
- ❌ REPEATS mapping missing in `getRelationshipTypeForAPI` (RelatedEntities.tsx)
- ❌ REPEATS not in `RELATIONSHIP_SCHEMA` (EntityEdit.tsx)
- ❌ REPEATS not in `initialRelationshipData` (InspectJingle.tsx)
- ❌ REPEATS properties schema missing in `getRelationshipPropertiesSchema` (RelatedEntities.tsx)

## Validation Checklist

### Step 1: Verify Backend API Endpoints

- [ ] Confirm REPEATS endpoints exist in `backend/src/server/api/admin.ts`
- [ ] Verify REPEATS is mapped in relationship type mapping
- [ ] Check that direction validation is implemented
- [ ] Verify transitive normalization is implemented

### Step 2: Check Frontend Service Layer

- [ ] Verify `fetchJingleRepeats` function does NOT exist in `relationshipService.ts`
- [ ] Check if API client has method to fetch REPEATS relationships
- [ ] Verify if public API endpoint exists for fetching jingle repeats

### Step 3: Check Relationship Configuration

- [ ] Verify REPEATS config is NOT in `getJingleRelationships()` in `relationshipConfigs.ts`
- [ ] Check if label should be "Versiones" (as documented) or "Repetidos" (as in example)
- [ ] Verify position in relationship list (should be between Jinglero and Tematicas)

### Step 4: Check RelatedEntities Component

- [ ] Verify `getRelationshipTypeForAPI` does NOT have `jingle: { jingle: 'repeats' }` mapping
- [ ] Check if REPEATS handling exists in relationship creation logic
- [ ] Verify REPEATS properties schema is missing from `getRelationshipPropertiesSchema`

### Step 5: Check EntityEdit Component

- [ ] Verify `repeats` is NOT in `RELATIONSHIP_SCHEMA` mapping
- [ ] Check if REPEATS appears in relationship table

### Step 6: Check InspectJingle Page

- [ ] Verify REPEATS is NOT in `initialRelationshipData` mapping
- [ ] Check if `JingleWithRelationships` interface includes `repeats` field

### Step 7: Check Custom Sorting

- [ ] Verify custom sort function for REPEATS does NOT exist
- [ ] Check if `entitySorters.ts` has REPEATS-specific sorting logic

## Expected Findings

### Missing Components

1. **Service Function**: `fetchJingleRepeats` in `relationshipService.ts`
2. **Relationship Config**: REPEATS entry in `getJingleRelationships()` 
3. **Type Mapping**: `jingle: { jingle: 'repeats' }` in `getRelationshipTypeForAPI`
4. **Schema Entry**: `repeats` in `RELATIONSHIP_SCHEMA` (EntityEdit.tsx)
5. **Initial Data**: REPEATS in `initialRelationshipData` (InspectJingle.tsx)
6. **Properties Schema**: REPEATS schema in `getRelationshipPropertiesSchema`
7. **Custom Sorter**: Custom sort function for REPEATS (fabricaDate ascending, ineditos last)

### Documentation Discrepancies

- Label inconsistency: Documentation says "Versiones" but example shows "Repetidos"
- Date field: Documentation references `fabricaDate` but need to verify field name in Jingle type

## Validation Report Structure

The validation report will include:

1. **Summary**: Status (not_implemented, partial, complete)
2. **Backend Validation**: What exists vs what's documented
3. **Frontend Validation**: Missing components list
4. **Code References**: Specific file paths and line numbers
5. **Recommendations**: Priority order for implementation
6. **Next Steps**: Action items to complete implementation

## Files to Validate

### Backend

- `backend/src/server/api/admin.ts` - REPEATS endpoints
- `backend/src/server/db/validation/repeats-validation.ts` - Validation logic
- `backend/src/server/db/schema/schema.ts` - Schema definition

### Frontend

- `frontend/src/lib/services/relationshipService.ts` - Service functions
- `frontend/src/lib/utils/relationshipConfigs.ts` - Relationship configs
- `frontend/src/components/common/RelatedEntities.tsx` - Component logic
- `frontend/src/components/admin/EntityEdit.tsx` - Admin schema
- `frontend/src/pages/inspect/InspectJingle.tsx` - Page implementation
- `frontend/src/lib/utils/entitySorters.ts` - Sorting logic

## Notes

- Date: 2025-11-22
- Documentation status: draft
- Documentation last updated: 2025-01-28
- Implementation status: Backend complete, Frontend not started

### To-dos

- [ ] Validate backend API endpoints and REPEATS relationship support
- [ ] Check if fetchJingleRepeats function exists in relationshipService.ts
- [ ] Verify REPEATS config is missing from relationshipConfigs.ts
- [ ] Check RelatedEntities.tsx for REPEATS mapping and handling
- [ ] Verify REPEATS is missing from EntityEdit.tsx RELATIONSHIP_SCHEMA
- [ ] Check InspectJingle.tsx for REPEATS in initialRelationshipData
- [ ] Check if custom REPEATS sorting logic exists
- [ ] Generate validation report with findings and recommendations