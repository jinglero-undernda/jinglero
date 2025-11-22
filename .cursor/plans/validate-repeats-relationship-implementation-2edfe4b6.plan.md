<!-- 2edfe4b6-2e77-4cc7-8b8e-e4f607fe47aa 0b20ab3e-44ea-4f78-a8ac-7ffb1c65ecf1 -->
# Implement REPEATS Relationship Frontend

## Overview

This plan implements all 8 missing frontend components for the REPEATS relationship, enabling full functionality for displaying and managing Jingle-to-Jingle repeat relationships in the RelatedEntities component.

**Status**: Backend complete, frontend not implemented

**Estimated Effort**: 6-8 hours

**Dependencies**: Backend API endpoints (already complete)

## Implementation Phases

### Phase 1: Core Service Layer (Foundation)

#### Task 1.1: Implement `fetchJingleRepeats` Function

**File**: `frontend/src/lib/services/relationshipService.ts`

**Location**: After `fetchJingleTematicas` function (around line 307)

**Implementation Details**:

- Use `publicApi.getEntityRelationships('jingles', jingleId)` to fetch both inbound and outbound REPEATS relationships
- Extract Jingle entities from relationship data
- Implement 2-step traversal to find initial instance (Jingle with no inbound REPEATS)
- Apply custom sorting: fabricaDate ascending, ineditos at bottom, createdAt ascending for ineditos
- Return sorted array of Jingle entities

**Key Requirements**:

- Handle both incoming and outgoing REPEATS relationships
- Traverse REPEATS chain backwards to find original instance
- Sort published Jingles by fabricaDate ascending (earliest first)
- Place Ineditos (no fabricaDate) at bottom
- Sort Ineditos by createdAt ascending

**Code Pattern**: Follow existing fetch functions (e.g., `fetchJingleTematicas`, `fetchCancionJingles`)

---

### Phase 2: Configuration & Component Integration

#### Task 2.1: Add REPEATS Configuration

**File**: `frontend/src/lib/utils/relationshipConfigs.ts`

**Location**: In `getJingleRelationships()` function, between Jinglero and Tematicas (after line 72, before line 74)

**Implementation**:

```typescript
{
  label: 'Versiones',
  entityType: 'jingle',
  sortKey: 'date', // Will use custom sort function
  expandable: true,
  fetchFn: (entityId: string, _entityType: string) => fetchJingleRepeats(entityId),
}
```

**Key Points**:

- Label: "Versiones" (as per documentation, not "Repetidos")
- Entity type: 'jingle' (self-referential)
- Sort key: 'date' (custom sorting will be implemented)
- Expandable: true (allows nested exploration)
- Import `fetchJingleRepeats` at top of file

---

#### Task 2.2: Add REPEATS Type Mapping

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Location**: In `getRelationshipTypeForAPI()` function, `jingle` mapping (around line 45)

**Implementation**:

Add to the `jingle` object in the mapping:

```typescript
jingle: {
  fabrica: 'appears_in',
  cancion: 'versiona',
  artista: relationshipLabel.toLowerCase() === 'autor' ? 'autor_de' : 'jinglero_de',
  tematica: 'tagged_with',
  jingle: 'repeats', // ← Add this line
},
```

**Purpose**: Maps the relationship config to the API relationship type 'repeats'

---

#### Task 2.3: Add REPEATS Handling in Relationship Creation

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Location**: In `getRelationshipProperties()` function, after `tagged_with` handling (around line 1391)

**Implementation**:

```typescript
} else if (relType === 'tagged_with') {
  startId = entityType === 'jingle' ? entity.id : relatedEntityId;
  endId = entityType === 'jingle' ? relatedEntityId : entity.id;
} else if (relType === 'repeats') {
  // REPEATS: Jingle -> Jingle (self-referential)
  // Direction is validated by API, but we pass IDs as-is
  startId = entity.id;
  endId = relatedEntityId;
} else {
  startId = entity.id;
  endId = relatedEntityId;
}
```

**Purpose**: Handles REPEATS relationship creation (API validates direction automatically)

---

### Phase 3: Admin Features (Properties & Schema)

#### Task 3.1: Add REPEATS Properties Schema

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Location**: In `getRelationshipPropertiesSchema()` function (around line 558)

**Implementation**:

Add to the `schemas` object:

```typescript
repeats: [
  { name: 'status', type: 'select', label: 'Estado', required: false, options: ['DRAFT', 'CONFIRMED'] },
],
```

**Purpose**: Enables editing REPEATS relationship properties (status field) in admin mode

---

#### Task 3.2: Add REPEATS to EntityEdit Schema

**File**: `frontend/src/components/admin/EntityEdit.tsx`

**Location**: In `RELATIONSHIP_SCHEMA` constant (around line 19)

**Implementation**:

Add to the schema object:

```typescript
repeats: { start: 'jingles', end: 'jingles' },
```

**Purpose**: Enables REPEATS relationships to appear in EntityEdit component's relationship table

---

### Phase 4: Data Integration & Sorting

#### Task 4.1: Update InspectJingle Page

**File**: `frontend/src/pages/inspect/InspectJingle.tsx`

**Changes Required**:

1. **Update Interface** (around line 10):
   ```typescript
   interface JingleWithRelationships extends Jingle {
     fabrica?: Fabrica | null;
     cancion?: Cancion | null;
     jingleros?: Artista[];
     autores?: Artista[];
     tematicas?: Tematica[];
     repeats?: Jingle[]; // ← Add this line
   }
   ```

2. **Update Initial Relationship Data** (around line 78):
   ```typescript
   initialRelationshipData={{
     'Fabrica-fabrica': jingle.fabrica ? [jingle.fabrica] : [],
     'Cancion-cancion': jingle.cancion ? [jingle.cancion] : [],
     'Autor-artista': jingle.autores || [],
     'Jinglero-artista': jingle.jingleros || [],
     'Versiones-jingle': jingle.repeats || [], // ← Add this line
     'Tematicas-tematica': jingle.tematicas || [],
   }}
   ```


**Note**: The backend API endpoint `/api/public/jingles/:id` may need to be updated to include REPEATS in the response. This is optional - the fetch function will work without it, but initial data loading will be faster if included.

---

#### Task 4.2: Implement Custom REPEATS Sorting Function

**File**: `frontend/src/lib/utils/entitySorters.ts`

**Location**: Add new function after `sortEntities` function (around line 102)

**Implementation**:

```typescript
/**
 * Custom sort function for REPEATS relationships
 * Primary: fabricaDate ascending (earliest first)
 * Secondary: Ineditos (no fabricaDate) at bottom
 * Tertiary: createdAt ascending for Ineditos
 */
export function sortJingleRepeats(jingles: Jingle[]): Jingle[] {
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

**Integration**: Update `fetchJingleRepeats` to use this function, or modify `relationshipConfigs.ts` to use a custom sort function for the REPEATS relationship.

**Alternative Approach**: Modify the relationship config to use a custom sort function instead of 'date' sortKey.

---

## Optional Enhancement: Backend API Update

### Task 5.1: Add REPEATS to Public API Response (Optional)

**File**: `backend/src/server/api/public.ts`

**Location**: In `/jingles/:id` endpoint query (around line 556)

**Implementation**:

1. Add to Cypher query:
   ```cypher
   OPTIONAL MATCH (j)-[:REPEATS]->(repeat:Jingle)
   OPTIONAL MATCH (j)<-[:REPEATS]-(repeatedBy:Jingle)
   ```

2. Add to RETURN clause:
   ```cypher
   collect(DISTINCT repeat {.*}) AS repeats
   ```

3. Include in response object (around line 599):
   ```typescript
   repeats: record.repeats || []
   ```


**Purpose**: Enables initial data loading in InspectJingle page, improving performance

**Priority**: Low - fetch function works without this, but this optimization improves UX

---

## Implementation Order & Dependencies

### Execution Sequence:

1. **Task 1.1** (Service function) - Foundation, no dependencies
2. **Task 2.1** (Config) - Depends on Task 1.1
3. **Task 2.2** (Type mapping) - Can be done in parallel with Task 2.1
4. **Task 2.3** (Creation logic) - Depends on Task 2.2
5. **Task 3.1** (Properties schema) - Independent
6. **Task 3.2** (EntityEdit schema) - Independent
7. **Task 4.1** (InspectJingle) - Depends on Task 2.1
8. **Task 4.2** (Custom sorting) - Depends on Task 1.1, integrates with it

### Critical Path:

Task 1.1 → Task 2.1 → Task 2.2 → Task 2.3 → Task 4.1

### Parallel Work:

- Tasks 2.2, 3.1, 3.2 can be done in parallel
- Task 4.2 can be done alongside Task 1.1

---

## Testing Checklist

After each phase, verify:

### Phase 1 Testing:

- [ ] `fetchJingleRepeats` returns correct Jingle entities
- [ ] 2-step traversal finds initial instance correctly
- [ ] Sorting works: published first (ascending), ineditos last
- [ ] Handles empty results gracefully

### Phase 2 Testing:

- [ ] REPEATS section appears in RelatedEntities between Jinglero and Tematicas
- [ ] Label displays as "Versiones"
- [ ] Relationship creation works (API validates direction)
- [ ] Relationship appears in list after creation

### Phase 3 Testing:

- [ ] Status property can be edited in admin mode
- [ ] REPEATS appears in EntityEdit relationship table
- [ ] Relationship deletion works

### Phase 4 Testing:

- [ ] InspectJingle page loads REPEATS data (if backend updated)
- [ ] Custom sorting displays correctly in UI
- [ ] Expandable functionality works for nested relationships

---

## Files to Modify

1. `frontend/src/lib/services/relationshipService.ts` - Add fetchJingleRepeats
2. `frontend/src/lib/utils/relationshipConfigs.ts` - Add REPEATS config
3. `frontend/src/components/common/RelatedEntities.tsx` - Add mapping, creation logic, properties schema
4. `frontend/src/components/admin/EntityEdit.tsx` - Add to RELATIONSHIP_SCHEMA
5. `frontend/src/pages/inspect/InspectJingle.tsx` - Add repeats to interface and initial data
6. `frontend/src/lib/utils/entitySorters.ts` - Add custom sort function
7. `backend/src/server/api/public.ts` - Optional: Add REPEATS to response

---

## Validation After Implementation

After completing all tasks, run validation:

1. Update validation report checklist
2. Test all functionality end-to-end
3. Verify documentation matches implementation
4. Check for any TypeScript errors
5. Test in both User Mode and Admin Mode

---

## Notes

- **Label Consistency**: Use "Versiones" (not "Repetidos") as per main documentation
- **Direction Validation**: API handles direction correction automatically - UI just passes IDs
- **Sorting**: Custom function needed because standard 'date' sort is descending, REPEATS needs ascending
- **Backend API**: Optional enhancement improves performance but not required for functionality
- **Error Handling**: Follow existing patterns in relationshipService.ts for error handling

### To-dos

- [ ] Implement fetchJingleRepeats function in relationshipService.ts with 2-step traversal and custom sorting
- [ ] Add REPEATS configuration to getJingleRelationships() with label 'Versiones'
- [ ] Add jingle: 'repeats' mapping to getRelationshipTypeForAPI() in RelatedEntities.tsx
- [ ] Add REPEATS handling in getRelationshipProperties() relationship creation logic
- [ ] Add REPEATS properties schema with status field to getRelationshipPropertiesSchema()
- [ ] Add repeats entry to RELATIONSHIP_SCHEMA in EntityEdit.tsx
- [ ] Update InspectJingle.tsx to include repeats in interface and initialRelationshipData
- [ ] Implement sortJingleRepeats custom sorting function in entitySorters.ts
- [ ] Optional: Add REPEATS to /api/public/jingles/:id endpoint response