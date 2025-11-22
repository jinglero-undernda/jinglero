<!-- 0fda1470-aff7-48e0-ad6d-053d224eafb5 9554b95b-11a4-486a-92f9-df7a16d2dbbd -->
# Validate REPEATS Relationship Schema Documentation

## Overview

Following PLAYBOOK_02_VALIDATE_REQUIREMENTS.md, validate the REPEATS relationship documentation against actual codebase requirements. The REPEATS relationship is documented but marked as "draft" with code references indicating "to be implemented".

## Validation Steps

### Step 1: Extract Schema Details

**Read and extract from:**

- `docs/4_backend_database-schema/schema/relationships.md` (lines 480-614)
- Extract: relationship definition, properties (status, createdAt), direction validation rules, transitive normalization, traversal logic, constraints

**Key details to extract:**

- Type: REPEATS (Jingle → Jingle, self-referential)
- Properties: status (enum: DRAFT, CONFIRMED), createdAt (datetime)
- Direction validation based on fabricaDate
- Transitive normalization rules
- Constraints (no concurrent inbound/outbound, circular prevention)

### Step 2: Validate Code References

**Check all code references in schema documentation:**

1. **Schema Definition Reference:**

- Documented: `backend/src/server/db/schema/schema.ts` (to be implemented)
- Action: Verify file exists, check if REPEATS is defined (currently NOT implemented)

2. **Validation Module Reference:**

- Documented: `backend/src/server/db/validation/repeats-validation.ts` (to be implemented)
- Action: Check if file exists (currently NOT implemented)

3. **API Endpoint References:**

- Documented in `docs/5_backend_api-contracts/contracts/admin-api.md` (lines 641-777)
- References: `backend/src/server/api/admin.ts:808-889` (to be implemented)
- Action: Check RELATIONSHIP_TYPE_MAP for 'repeats' entry (currently NOT in map)

4. **Frontend Component References:**

- Documented: `frontend/src/lib/utils/relationshipConfigs.ts` (to be implemented)
- Action: Check if REPEATS config exists in getJingleRelationships() (currently NOT implemented)

### Step 3: Validate Against Frontend Requirements

**Check frontend needs from design documentation:**

- Source: `docs/2_frontend_ui-design-system/03_components/composite/repeats-relationship.md`

**Frontend Requirements:**

1. **RelatedEntities Component:**

- Need: REPEATS relationship config in `relationshipConfigs.ts`
- Need: Label "Versiones" between Jinglero and Tematicas
- Need: Custom sort function (fabricaDate ascending, ineditos last)
- Status: NOT implemented

2. **Relationship Service:**

- Need: `fetchJingleRepeats(jingleId: string)` function
- Need: 2-step traversal query for initial instance
- Status: NOT implemented

3. **TypeScript Types:**

- Need: REPEATS relationship type in Relationship interface
- Need: Support for REPEATS in EntityRelationships
- Status: Check `frontend/src/types/index.ts`

4. **EntityEdit Component:**

- Need: REPEATS in RELATIONSHIP_SCHEMA mapping
- Need: REPEATS handling in relationship creation
- Status: Check `frontend/src/components/admin/EntityEdit.tsx`

5. **RelatedEntities Component:**

- Need: REPEATS in getRelationshipTypeForAPI mapping
- Need: REPEATS property schema (status field)
- Status: Check `frontend/src/components/common/RelatedEntities.tsx`

### Step 4: Validate Against Backend Requirements

**Check backend implementation status:**

1. **Schema Definition:**

- File: `backend/src/server/db/schema/schema.ts`
- Need: REPEATS relationship definition (similar to other relationships)
- Status: NOT implemented (grep shows no REPEATS)

2. **API Endpoints:**

- File: `backend/src/server/api/admin.ts`
- Need: 'repeats' in RELATIONSHIP_TYPE_MAP
- Need: Direction validation logic
- Need: Transitive normalization logic
- Need: Circular reference prevention
- Status: NOT implemented (RELATIONSHIP_TYPE_MAP missing 'repeats')

3. **Validation Module:**

- File: `backend/src/server/db/validation/repeats-validation.ts`
- Need: Direction validation function
- Need: Transitive normalization function
- Need: Circular reference check
- Status: NOT implemented (file doesn't exist)

4. **Public API:**

- File: `backend/src/server/api/public.ts`
- Need: 'repeats' in relTypeMap for public endpoints
- Status: Check line 714 (currently NOT in map)

### Step 5: Validate Database Implementation

**Check if REPEATS exists in database schema:**

- Source: `backend/src/server/db/schema/schema.ts`
- Action: Verify REPEATS relationship type is defined
- Note: Cannot directly query database, but can verify schema definition
- Status: NOT implemented (schema.ts doesn't define REPEATS)

### Step 6: Validate Type Definitions

**Check TypeScript types:**

1. **Frontend Types:**

- File: `frontend/src/types/index.ts`
- Check: Relationship interface supports REPEATS type
- Check: EntityRelationships supports REPEATS
- Action: Verify type definitions match schema properties

2. **Backend Types (if any):**

- Search for TypeScript type definitions in backend
- Verify relationship property types match schema

### Step 7: Validate API Contract Documentation

**Check API documentation completeness:**

- Source: `docs/5_backend_api-contracts/contracts/admin-api.md` (lines 641-777)
- Verify: All endpoints documented (POST, PUT, GET, DELETE)
- Verify: Request/response formats match schema
- Verify: Error responses documented
- Verify: Special validation rules documented

### Step 8: Generate Validation Report

**Create comprehensive report following playbook template:**

**Report Structure:**

1. Summary (status, total checks, passed/failed/warnings)
2. Code References (validated vs discrepancies)
3. Frontend Requirements (validated vs discrepancies)
4. Backend Requirements (validated vs discrepancies)
5. Database Implementation (validated vs discrepancies)
6. Type Definitions (validated vs discrepancies)
7. Recommendations
8. Next Steps

**Expected Findings:**

- Schema is documented but NOT implemented
- All code references point to "to be implemented"
- Frontend design documented but NOT implemented
- Backend API documented but NOT implemented
- Type definitions may need updates
- Database schema NOT implemented

### Step 9: Update Schema Status

**Based on validation results:**

- Current status: "draft"
- If all validated → Update to "validated"
- If discrepancies found → Keep as "draft" or "needs_implementation"
- Add "Last Validated" date

## Files to Read/Check

**Schema Documentation:**

- `docs/4_backend_database-schema/schema/relationships.md` (REPEATS section)

**Backend Code:**

- `backend/src/server/db/schema/schema.ts` (check for REPEATS definition)
- `backend/src/server/api/admin.ts` (check RELATIONSHIP_TYPE_MAP, endpoint implementations)
- `backend/src/server/api/public.ts` (check relTypeMap)
- `backend/src/server/db/validation/repeats-validation.ts` (check if exists)

**Frontend Code:**

- `frontend/src/lib/utils/relationshipConfigs.ts` (check for REPEATS config)
- `frontend/src/lib/services/relationshipService.ts` (check for fetchJingleRepeats)
- `frontend/src/components/common/RelatedEntities.tsx` (check for REPEATS handling)
- `frontend/src/components/admin/EntityEdit.tsx` (check for REPEATS in schema)
- `frontend/src/types/index.ts` (check type definitions)

**API Documentation:**

- `docs/5_backend_api-contracts/contracts/admin-api.md` (REPEATS endpoints)

**Design Documentation:**

- `docs/2_frontend_ui-design-system/03_components/composite/repeats-relationship.md`

## Deliverables

1. **Validation Report** - Comprehensive markdown document following playbook template
2. **Updated Schema Status** - Update status and last validated date in relationships.md
3. **Discrepancy List** - Detailed list of all gaps between documentation and implementation