<!-- c253179b-38a4-4928-8b3b-90a51efd660a ad69fac0-9042-4e1f-9164-be8127d9262f -->
# EntityCard relationshipData Refactoring Plan

## Problem Analysis

The enhanced EntityCard contents variant implementation is partially working:

- ✅ **RelatedEntities component**: Correctly extracts `_metadata` from API responses and passes `relationshipData` to EntityCard
- ❌ **EntityList component**: Does not pass `relationshipData` to EntityCard (admin lists)
- ❌ **SearchResultsPage component**: Does not pass `relationshipData` to EntityCard (search results)

**Root Causes:**

1. EntityList uses admin API endpoints (`adminApi.getArtistas()`, etc.) which do not return `_metadata`
2. SearchResultsPage uses search API which does not return `_metadata`
3. Both components don't extract or pass `relationshipData` even if `_metadata` exists in responses
4. No centralized utility for extracting `relationshipData` from entity objects
5. TypeScript types don't include optional `_metadata` field

## Architecture Alignment

This plan follows established architecture patterns:

- **Utility Functions**: Creates utility in `frontend/src/lib/utils/` following existing pattern (`entityDisplay.ts`, `entitySorters.ts`)
- **Data Flow**: Follows three-tier architecture (React → API Client → Express → Neo4j) as documented in `docs/3_system_architecture/data-flow.md`
- **Type Safety**: Uses optional `_metadata` in TypeScript types (graceful degradation)
- **Backend Pattern**: Follows existing `_metadata` pattern from related entities endpoints (`backend/src/server/api/public.ts:1014-1029`)
- **Component Props**: Uses existing EntityCard prop pattern (`relationshipData`)

## Solution Strategy

### Phase 1: Create Relationship Data Extraction Utility

**File**: `frontend/src/lib/utils/relationshipDataExtractor.ts` (new file)

**Architecture Pattern**: Follows utility function organization in `frontend/src/lib/utils/`

Create a centralized utility function that extracts `relationshipData` from entity objects, handling:

- `_metadata` extraction from entity objects
- Type-specific extraction (Artista, Cancion, Jingle)
- Fallback handling when `_metadata` is missing (graceful degradation)

**Key Functions:**

- `extractRelationshipData(entity, entityType)`: Main extraction function
  - Handles `_metadata.autorCount`, `_metadata.jingleroCount` for Artista
  - Handles `_metadata.jingleCount`, `_metadata.autores` for Cancion
  - Handles `_metadata.fabrica`, `_metadata.cancion` for Jingle
  - Returns `Record<string, unknown> | undefined` (matches EntityCard prop type)

**Type Safety:**

- Accepts entity types with optional `_metadata` field
- Uses type guards for safe property access
- Returns undefined when no metadata available (graceful degradation)

### Phase 2: Update TypeScript Types

**File**: `frontend/src/types/index.ts`

**Architecture Pattern**: Extends existing entity types with optional `_metadata` field

**Changes:**

1. Add optional `_metadata` field to entity types (Artista, Cancion, Jingle)
2. Define `EntityMetadata` interface for type safety
3. Keep types backward compatible (optional field)

**Type Definitions:**

```typescript
interface EntityMetadata {
  // For Artista
  autorCount?: number;
  jingleroCount?: number;
  // For Cancion
  jingleCount?: number;
  autores?: Artista[];
  // For Jingle
  fabrica?: Fabrica;
  cancion?: Cancion;
  autores?: Artista[];
  jingleros?: Artista[];
}

interface Artista {
  // ... existing fields
  _metadata?: EntityMetadata;
}
```

### Phase 3: Update EntityList Component

**File**: `frontend/src/components/admin/EntityList.tsx`

**Architecture Pattern**: Component-level data extraction before rendering (follows existing component patterns)

**Changes:**

1. Import `extractRelationshipData` utility
2. Extract `relationshipData` for each entity before rendering EntityCard
3. Pass `relationshipData` prop to EntityCard (line ~310)
4. Ensure `variant="contents"` is set (already done)

**Data Flow:**

```
adminApi.getArtistas() → Artista[] (may include _metadata)
  ↓
extractRelationshipData(entity) → relationshipData
  ↓
EntityCard (receives relationshipData prop)
```

**Considerations:**

- Admin API endpoints currently don't return `_metadata` (will be enhanced in Phase 5)
- If `_metadata` not available, gracefully handle (display will show partial info)
- No breaking changes to existing functionality

### Phase 4: Update SearchResultsPage Component

**File**: `frontend/src/pages/SearchResultsPage.tsx`

**Architecture Pattern**: Component-level data extraction before rendering

**Changes:**

1. Import `extractRelationshipData` utility
2. Extract `relationshipData` for each entity in search results
3. Pass `relationshipData` prop to EntityCard components (lines ~119, ~138, ~149)
4. Ensure `variant="contents"` is set (already done)

**Data Flow:**

```
publicApi.search() → SearchResults (may include _metadata)
  ↓
extractRelationshipData(entity) → relationshipData
  ↓
EntityCard (receives relationshipData prop)
```

**Considerations:**

- Search API currently doesn't return `_metadata` (will be enhanced in Phase 5)
- If `_metadata` not available, gracefully handle

### Phase 5: Enhance Backend API Endpoints

**Architecture Pattern**: Follows existing `_metadata` pattern from related entities endpoints (`backend/src/server/api/public.ts:1014-1029`)

**Files to Enhance:**

- `backend/src/server/api/admin.ts` - Admin list endpoints
- `backend/src/server/api/public.ts` - Search endpoint

**Enhancement Approach**: **Option D (RECOMMENDED)** - Include `_metadata` on each entity in response arrays

**Actions:**

1. **Admin List Endpoints** (`backend/src/server/api/admin.ts`):

   - Enhance `GET /api/admin/artistas` to include `_metadata` with `autorCount` and `jingleroCount`
   - Enhance `GET /api/admin/canciones` to include `_metadata` with `jingleCount` and `autores` array
   - Follow existing pattern: Calculate counts in Cypher query, attach `_metadata` to each entity

2. **Search Endpoint** (`backend/src/server/api/public.ts`):

   - Enhance `GET /api/search` to include `_metadata` for Artista and Cancion entities in results
   - Calculate counts efficiently using Cypher queries
   - Attach `_metadata` to each entity in search results

**Backend Enhancement Pattern** (follows existing pattern):

```typescript
// Example for Artista list endpoint (admin.ts)
const artistasQuery = `
  MATCH (a:Artista)
  OPTIONAL MATCH (a)-[:AUTOR_DE]->(c:Cancion)
  OPTIONAL MATCH (a)-[:JINGLERO_DE]->(j:Jingle)
  RETURN a,
         count(DISTINCT c) AS autorCount,
         count(DISTINCT j) AS jingleroCount
  ORDER BY a.updatedAt DESC
  LIMIT $limit
`;

const results = await db.executeQuery(artistasQuery, { limit });
const artistas = results.map((r: any) => {
  const artista = convertNeo4jDates(r.a);
  return {
    ...artista,
    _metadata: {
      autorCount: typeof r.autorCount === 'object' ? r.autorCount.low : r.autorCount,
      jingleroCount: typeof r.jingleroCount === 'object' ? r.jingleroCount.low : r.jingleroCount
    }
  };
});
```

**Performance Considerations:**

- Use efficient Cypher queries with `OPTIONAL MATCH` and `count(DISTINCT)`
- Single query per endpoint (no N+1 queries)
- Counts calculated at database level (optimal performance)

### Phase 6: Update RelatedEntities Component (Optional Refactor)

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Architecture Pattern**: Refactor to use centralized utility for consistency

**Actions:**

1. Verify existing `relationshipData` extraction logic (lines 2052-2179)
2. Refactor to use new `extractRelationshipData` utility for consistency
3. Ensure all entity types are handled correctly

**Note**: This component already works, but refactoring improves consistency and maintainability.

## Data Flow Architecture

### Current Data Flow (Limited)

```
EntityList/SearchResultsPage → API Client → Backend → Neo4j
  ↓
Entity[] (no _metadata)
  ↓
EntityCard (no relationshipData)
  ↓
Basic display (no counts, no enhanced info)
```

### Enhanced Data Flow (After Implementation)

```
EntityList/SearchResultsPage → API Client → Backend → Neo4j
  ↓
Entity[] (with _metadata)
  ↓
extractRelationshipData(entity) → relationshipData
  ↓
EntityCard (receives relationshipData prop)
  ↓
Enhanced display (counts, autor info, differentiated icons)
```

### Data Flow Diagram

```mermaid
graph TD
    A[Component] -->|API Call| B[API Client]
    B -->|HTTP Request| C[Express Router]
    C -->|Cypher Query| D[Neo4j Database]
    D -->|Results with counts| C
    C -->|Transform + _metadata| B
    B -->|Entity[] with _metadata| A
    A -->|extractRelationshipData| E[Utility Function]
    E -->|relationshipData| F[EntityCard]
    F -->|Enhanced Display| G[UI]
```

## Implementation Details

### Relationship Data Structure

The `relationshipData` object structure (matches EntityCard expectations):

**For Artista entities:**

```typescript
{
  autorCount?: number;      // Count of AUTOR_DE relationships
  jingleroCount?: number;   // Count of JINGLERO_DE relationships
}
```

**For Cancion entities:**

```typescript
{
  jingleCount?: number;     // Count of VERSIONA relationships
  autores?: Artista[];      // Array of autores (with their own _metadata)
}
```

**For Jingle entities:**

```typescript
{
  fabrica?: Fabrica;        // Fabrica object
  cancion?: Cancion;        // Cancion object
  autores?: Artista[];      // Autores array
  jingleros?: Artista[];    // Jingleros array
}
```

### EntityCard Integration Points

All EntityCard usages should:

1. Extract `relationshipData` using the utility
2. Pass `relationshipData` prop to EntityCard
3. Ensure `variant="contents"` is set for enhanced display

## Testing Strategy

1. **Admin Lists**: Verify Artista and Cancion lists show counts and enhanced info
2. **Search Results**: Verify search results show enhanced info for all entity types
3. **Related Entities**: Verify existing functionality still works after refactor
4. **Graceful Degradation**: Verify partial info displays when `_metadata` is missing
5. **Type Safety**: Verify TypeScript compilation with optional `_metadata` field

## Files to Modify

### New Files

- `frontend/src/lib/utils/relationshipDataExtractor.ts`

### Modified Files

- `frontend/src/types/index.ts` (add `_metadata` types)
- `frontend/src/components/admin/EntityList.tsx`
- `frontend/src/pages/SearchResultsPage.tsx`
- `frontend/src/components/common/RelatedEntities.tsx` (optional refactor)

### Backend Files

- `backend/src/server/api/admin.ts` (enhance list endpoints)
- `backend/src/server/api/public.ts` (enhance search endpoint)

## Success Criteria

✅ EntityList shows enhanced Artista icons and counts

✅ EntityList shows Cancion autor info and jingle counts

✅ SearchResultsPage shows enhanced info for all entity types

✅ RelatedEntities continues to work correctly

✅ Graceful handling when `_metadata` is not available

✅ Consistent relationshipData extraction across all components

✅ Type-safe implementation with optional `_metadata` field

✅ Backend endpoints follow existing `_metadata` pattern

✅ Performance optimized (single query per endpoint)

### To-dos

- [ ] Create relationshipDataExtractor.ts utility to extract _metadata from entity objects
- [ ] Update EntityList.tsx to extract and pass relationshipData to EntityCard
- [ ] Update SearchResultsPage.tsx to extract and pass relationshipData to EntityCard
- [ ] Verify admin and search API endpoints return _metadata, enhance if needed
- [ ] Optionally refactor RelatedEntities.tsx to use new extractor utility for consistency
- [ ] Test enhanced displays in admin lists, search results, and related entities