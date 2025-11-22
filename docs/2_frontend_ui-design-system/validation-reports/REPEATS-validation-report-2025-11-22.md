# Design System Validation Report: REPEATS Relationship

**Date**: 2025-11-22  
**Validator**: AI Assistant  
**Design System Version**: draft  
**Documentation**: `docs/2_frontend_ui-design-system/03_components/composite/repeats-relationship.md`

## Summary

- **Status**: `not_implemented`
- **Total Checks**: 7
- **Passed**: 1 (Backend)
- **Failed**: 6 (Frontend)
- **Warnings**: 1 (Documentation inconsistency)

## Backend Validation

### Validated ✅

- ✅ **REPEATS relationship type exists** in `backend/src/server/db/schema/schema.ts`
- ✅ **API endpoints implemented** in `backend/src/server/api/admin.ts`:
  - `POST /api/admin/relationships/repeats` (lines 865-919)
  - `PUT /api/admin/relationships/repeats` (lines 1010-1098)
  - `DELETE /api/admin/relationships/repeats` (via standard delete endpoint)
- ✅ **REPEATS mapped** in relationship type mapping (line 86: `'repeats': 'REPEATS'`)
- ✅ **Direction validation** implemented in `backend/src/server/db/validation/repeats-validation.ts`:
  - `validateRepeatsDirection()` function (lines 38-123)
  - Handles both published and Inedito Jingles correctly
- ✅ **Transitive normalization** implemented:
  - `normalizeTransitiveChains()` function (lines 160-265)
  - `checkConcurrentInboundOutbound()` function (lines 276-295)
  - Called automatically during relationship creation/update
- ✅ **Circular reference prevention** implemented:
  - `checkCircularReference()` function (lines 133-148)
  - Prevents cycles during relationship creation

### Backend Summary

The backend implementation is **complete and matches documentation**. All required functionality for REPEATS relationships is implemented, including direction validation, transitive normalization, and circular reference prevention.

## Frontend Validation

### Missing Components ❌

#### 1. Service Function: `fetchJingleRepeats`

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/lib/services/relationshipService.ts`

**Expected Implementation**:
```typescript
export async function fetchJingleRepeats(jingleId: string): Promise<Jingle[]> {
  // Should query REPEATS relationships (both inbound and outbound)
  // Use 2-step traversal to find initial instance
  // Return Jingles sorted by fabricaDate ascending (ineditos last)
}
```

**Current State**: Function does not exist in `relationshipService.ts`

**API Endpoint Available**: The frontend can use `publicApi.getEntityRelationships('jingles', jingleId)` to fetch REPEATS relationships, but a dedicated service function is needed to:
1. Query both inbound and outbound REPEATS relationships
2. Perform 2-step traversal to find initial instance
3. Sort results according to custom rules

**Code Reference**: Documentation line 109-123

---

#### 2. Relationship Configuration

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/lib/utils/relationshipConfigs.ts` in `getJingleRelationships()` function

**Expected Implementation** (should be inserted between Jinglero and Tematicas, around line 72):
```typescript
{
  label: 'Versiones',  // Note: Documentation says "Versiones", example shows "Repetidos"
  entityType: 'jingle',
  sortKey: 'date',  // Custom sort function needed
  expandable: true,
  fetchFn: (entityId: string, _entityType: string) => fetchJingleRepeats(entityId),
}
```

**Current State**: REPEATS configuration is missing from `getJingleRelationships()` function (lines 40-81)

**Position**: Should be inserted after Jinglero (line 72) and before Tematicas (line 74)

**Code Reference**: Documentation lines 26-44

---

#### 3. Relationship Type Mapping

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/components/common/RelatedEntities.tsx` in `getRelationshipTypeForAPI()` function

**Expected Implementation** (should be added to `jingle` mapping, around line 45):
```typescript
jingle: {
  fabrica: 'appears_in',
  cancion: 'versiona',
  artista: relationshipLabel.toLowerCase() === 'autor' ? 'autor_de' : 'jinglero_de',
  tematica: 'tagged_with',
  jingle: 'repeats',  // ← Add this line
},
```

**Current State**: `getRelationshipTypeForAPI()` function (lines 34-64) does not include `jingle: { jingle: 'repeats' }` mapping

**Code Reference**: Documentation lines 194-203

---

#### 4. Relationship Creation Logic

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/components/common/RelatedEntities.tsx` in `getRelationshipProperties()` function

**Expected Implementation** (should be added around line 1391):
```typescript
} else if (relType === 'tagged_with') {
  startId = entityType === 'jingle' ? entity.id : relatedEntityId;
  endId = entityType === 'jingle' ? relatedEntityId : entity.id;
} else if (relType === 'repeats') {
  // REPEATS: Jingle -> Jingle (self-referential)
  // Direction is validated by API, but we need to handle it here
  startId = entity.id;
  endId = relatedEntityId;
} else {
  startId = entity.id;
  endId = relatedEntityId;
}
```

**Current State**: No REPEATS handling in relationship creation logic (lines 1379-1394)

**Code Reference**: Documentation lines 87-92 (direction validation handled by API)

---

#### 5. Relationship Properties Schema

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/components/common/RelatedEntities.tsx` in `getRelationshipPropertiesSchema()` function

**Expected Implementation** (should be added around line 558):
```typescript
repeats: [
  { name: 'status', type: 'select', label: 'Estado', required: false, options: ['DRAFT', 'CONFIRMED'] },
],
```

**Current State**: `getRelationshipPropertiesSchema()` function (lines 539-560) does not include REPEATS schema

**Code Reference**: Documentation lines 94-101

---

#### 6. EntityEdit Component Schema

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/components/admin/EntityEdit.tsx` in `RELATIONSHIP_SCHEMA` constant

**Expected Implementation** (should be added around line 19):
```typescript
const RELATIONSHIP_SCHEMA: Record<string, { start: string; end: string; }> = {
  appears_in: { start: 'jingles', end: 'fabricas' },
  jinglero_de: { start: 'artistas', end: 'jingles' },
  autor_de: { start: 'artistas', end: 'canciones' },
  versiona: { start: 'jingles', end: 'canciones' },
  tagged_with: { start: 'jingles', end: 'tematicas' },
  soy_yo: { start: 'usuarios', end: 'artistas' },
  reacciona_a: { start: 'usuarios', end: 'jingles' },
  repeats: { start: 'jingles', end: 'jingles' },  // ← Add this line
};
```

**Current State**: `RELATIONSHIP_SCHEMA` (lines 12-20) does not include `repeats` entry

**Code Reference**: Documentation lines 125-129

---

#### 7. InspectJingle Page Initial Data

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/pages/inspect/InspectJingle.tsx`

**Expected Changes**:

1. **Interface Update** (around line 10):
```typescript
interface JingleWithRelationships extends Jingle {
  fabrica?: Fabrica | null;
  cancion?: Cancion | null;
  jingleros?: Artista[];
  autores?: Artista[];
  tematicas?: Tematica[];
  repeats?: Jingle[];  // ← Add this line
}
```

2. **Initial Relationship Data** (around line 78):
```typescript
initialRelationshipData={{
  'Fabrica-fabrica': jingle.fabrica ? [jingle.fabrica] : [],
  'Cancion-cancion': jingle.cancion ? [jingle.cancion] : [],
  'Autor-artista': jingle.autores || [],
  'Jinglero-artista': jingle.jingleros || [],
  'Versiones-jingle': jingle.repeats || [],  // ← Add this line
  'Tematicas-tematica': jingle.tematicas || [],
}}
```

**Current State**: 
- `JingleWithRelationships` interface (lines 10-16) does not include `repeats` field
- `initialRelationshipData` (lines 78-84) does not include REPEATS mapping

**Code Reference**: Documentation lines 131-134

**Note**: The API endpoint `/api/public/jingles/:id` may need to be updated to include `repeats` in the response. Current implementation (lines 551-625 in `backend/src/server/api/public.ts`) does not include REPEATS relationships.

---

#### 8. Custom Sort Function

**Status**: ❌ **NOT IMPLEMENTED**

**Expected Location**: `frontend/src/lib/utils/entitySorters.ts` or custom function in `relationshipConfigs.ts`

**Expected Implementation**:
```typescript
// Custom sort function for REPEATS relationships
// Primary: fabricaDate ascending (earliest first)
// Secondary: Ineditos (no fabricaDate) at bottom
// Tertiary: createdAt ascending for Ineditos
function sortJingleRepeats(jingles: Jingle[]): Jingle[] {
  return [...jingles].sort((a, b) => {
    const aDate = a.fabricaDate ? new Date(a.fabricaDate).getTime() : null;
    const bDate = b.fabricaDate ? new Date(b.fabricaDate).getTime() : null;
    
    // Both have fabricaDate: sort ascending (earliest first)
    if (aDate !== null && bDate !== null) {
      return aDate - bDate;
    }
    
    // One is Inedito: Inedito goes to bottom
    if (aDate === null && bDate !== null) return 1;
    if (aDate !== null && bDate === null) return -1;
    
    // Both are Inedito: sort by createdAt ascending
    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    return aCreated - bCreated;
  });
}
```

**Current State**: 
- `entitySorters.ts` does not have REPEATS-specific sorting logic
- The `sortKey: 'date'` in relationship config uses standard date sorting (descending), not the custom REPEATS rules

**Code Reference**: Documentation lines 186-192

**Note**: The standard `'date'` sort key in `entitySorters.ts` (lines 57-62) sorts descending, but REPEATS needs ascending with special handling for Ineditos.

---

## Documentation Discrepancies

### Label Inconsistency ⚠️

**Issue**: Documentation specifies label as **"Versiones"** (line 28), but the implementation example shows **"Repetidos"** (line 178).

**Recommendation**: Use **"Versiones"** as specified in the main documentation (line 28), as it better reflects the relationship concept (versions of the same jingle).

**Files Affected**:
- `relationshipConfigs.ts` (when implementing)

---

## Code References Validation

### Validated ✅

- ✅ `backend/src/server/api/admin.ts` - REPEATS endpoints exist (lines 865-919, 1010-1098)
- ✅ `backend/src/server/db/validation/repeats-validation.ts` - Validation logic exists
- ✅ `backend/src/server/db/schema/schema.ts` - REPEATS relationship type defined

### Missing/Incorrect ❌

- ❌ `frontend/src/lib/services/relationshipService.ts` - `fetchJingleRepeats` function missing
- ❌ `frontend/src/lib/utils/relationshipConfigs.ts` - REPEATS config missing from `getJingleRelationships()`
- ❌ `frontend/src/components/common/RelatedEntities.tsx` - REPEATS mapping missing in `getRelationshipTypeForAPI()`
- ❌ `frontend/src/components/common/RelatedEntities.tsx` - REPEATS handling missing in relationship creation logic
- ❌ `frontend/src/components/common/RelatedEntities.tsx` - REPEATS properties schema missing
- ❌ `frontend/src/components/admin/EntityEdit.tsx` - REPEATS missing from `RELATIONSHIP_SCHEMA`
- ❌ `frontend/src/pages/inspect/InspectJingle.tsx` - REPEATS missing from interface and initial data
- ❌ `frontend/src/lib/utils/entitySorters.ts` - Custom REPEATS sorting logic missing

---

## Recommendations

### Priority 1: Core Implementation (Required for Basic Functionality)

1. **Implement `fetchJingleRepeats` function** in `relationshipService.ts`
   - Use `publicApi.getEntityRelationships('jingles', jingleId)` to fetch REPEATS relationships
   - Implement 2-step traversal to find initial instance
   - Sort results according to custom rules

2. **Add REPEATS configuration** to `getJingleRelationships()` in `relationshipConfigs.ts`
   - Insert between Jinglero and Tematicas
   - Use label "Versiones" (as per documentation)
   - Set `sortKey: 'date'` (will need custom sort function)

3. **Add REPEATS mapping** to `getRelationshipTypeForAPI()` in `RelatedEntities.tsx`
   - Add `jingle: 'repeats'` to the `jingle` mapping

4. **Add REPEATS handling** in relationship creation logic in `RelatedEntities.tsx`
   - Handle REPEATS direction (API validates, but UI needs to pass correct IDs)

### Priority 2: Properties and Schema (Required for Admin Features)

5. **Add REPEATS properties schema** to `getRelationshipPropertiesSchema()` in `RelatedEntities.tsx`
   - Add `status` field (DRAFT/CONFIRMED)

6. **Add REPEATS to `RELATIONSHIP_SCHEMA`** in `EntityEdit.tsx`
   - Add `repeats: { start: 'jingles', end: 'jingles' }`

### Priority 3: Data Integration (Required for Complete Feature)

7. **Update InspectJingle page** to include REPEATS in initial data
   - Add `repeats?: Jingle[]` to `JingleWithRelationships` interface
   - Add REPEATS to `initialRelationshipData` mapping
   - **Note**: May require backend API update to include REPEATS in `/api/public/jingles/:id` response

8. **Implement custom REPEATS sorting function**
   - Create function that sorts by `fabricaDate` ascending, with Ineditos at bottom
   - Integrate into relationship config or entitySorters

---

## Next Steps

### Immediate Actions

1. ✅ **Backend**: Already complete - no action needed
2. ⏳ **Frontend Service**: Implement `fetchJingleRepeats` function
3. ⏳ **Frontend Config**: Add REPEATS to relationship configurations
4. ⏳ **Frontend Component**: Add REPEATS mapping and handling to RelatedEntities
5. ⏳ **Frontend Admin**: Add REPEATS to EntityEdit schema
6. ⏳ **Frontend Page**: Update InspectJingle to include REPEATS data
7. ⏳ **Frontend Sorting**: Implement custom REPEATS sorting logic

### Backend API Consideration

**Optional Enhancement**: Update `/api/public/jingles/:id` endpoint to include REPEATS relationships in the response, similar to how it includes `fabrica`, `cancion`, `jingleros`, `autores`, and `tematicas`. This would allow the InspectJingle page to use initial data instead of fetching separately.

**Current State**: The endpoint (lines 551-625 in `backend/src/server/api/public.ts`) does not include REPEATS relationships in the query or response.

**Recommendation**: Add REPEATS to the query:
```cypher
OPTIONAL MATCH (j)-[:REPEATS]->(repeat:Jingle)
OPTIONAL MATCH (j)<-[:REPEATS]-(repeatedBy:Jingle)
```

And include in response:
```typescript
collect(DISTINCT repeat {.*}) AS repeats
```

---

## Validation Checklist Summary

- [x] Backend API endpoints exist and are functional
- [x] Backend validation logic implemented
- [x] Backend transitive normalization implemented
- [ ] Frontend service function `fetchJingleRepeats` implemented
- [ ] Frontend relationship configuration added
- [ ] Frontend relationship type mapping added
- [ ] Frontend relationship creation logic handles REPEATS
- [ ] Frontend relationship properties schema includes REPEATS
- [ ] Frontend EntityEdit schema includes REPEATS
- [ ] Frontend InspectJingle page includes REPEATS data
- [ ] Frontend custom sorting logic implemented

---

## Conclusion

The REPEATS relationship is **fully implemented on the backend** but **not implemented on the frontend**. All backend functionality matches the documentation requirements. The frontend requires 8 components to be implemented to complete the integration:

1. Service function for fetching REPEATS relationships
2. Relationship configuration entry
3. Relationship type mapping
4. Relationship creation logic
5. Relationship properties schema
6. EntityEdit schema entry
7. InspectJingle page updates
8. Custom sorting logic

**Estimated Implementation Effort**: Medium (6-8 hours)

**Blockers**: None - backend is ready, frontend can be implemented independently.

---

**Report Generated**: 2025-11-22  
**Next Validation**: After frontend implementation is complete

