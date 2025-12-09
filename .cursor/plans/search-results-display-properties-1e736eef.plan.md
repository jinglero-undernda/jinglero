<!-- 1e736eef-2dd2-4ca5-a6de-94c4252b86b4 5ba36ac7-6150-45e6-a5b0-cf1bfa1b3be7 -->
# Plan: Fulltext-Only Search with Display Properties

## Overview

Refactor the search API to use fulltext search exclusively, removing basic search mode entirely. Update fulltext indexes to include `displayPrimary`, `displaySecondary`, and `displayBadges` for all entity types (Fabricas, Jingles, Canciones, Artistas, Tematicas). This approach leverages the fact that `displaySecondary` already contains denormalized relationship data (e.g., autores for Canciones), enabling relationship-aware search without traversal. **All search result entities are presented using ONLY display properties** - each entity returns `.id`, `displayPrimary`, `displaySecondary`, and `displayBadges` (no raw properties).

## Key Insights

- **displaySecondary is denormalized**: Contains relationship-derived content (e.g., `🚚 The Beatles • Abbey Road • 1969 🎤 : 2` for Canciones includes autor names)
- **Indexing displaySecondary enables relationship search**: Searching for "Beatles" will find Canciones via displaySecondary, solving the relationship traversal limitation
- **All entities use display properties**: Search results return only display properties, and EntityCard automatically uses them for rendering
- **Simpler codebase**: Single search path instead of two modes
- **Better performance**: Fulltext indexes are faster than CONTAINS queries
- **Relevance scoring**: Fulltext provides ranking by relevance

## Current State

- **Search API** (`backend/src/server/api/search.ts`): Supports both basic and fulltext modes, defaults to basic
- **Fulltext Indexes** (`backend/src/server/db/schema/setup.ts`): Include deprecated `autoComment`, missing display properties, no index for Fabricas
- **Basic Mode**: Uses relationship traversal for Canciones (searches related Artistas), but this can be replaced by indexing displaySecondary
- **All UI code**: Currently uses basic mode (no mode parameter = defaults to basic)
- **Search Results**: Currently return raw properties (`.title`, `.stageName`, etc.) instead of display properties

## Implementation Steps

### Step 1: Update Fulltext Indexes to Include Display Properties

**File**: `backend/src/server/db/schema/setup.ts`

Update the fulltext index definitions (lines 30-49):

1. **Jingles Index** (lines 32, 38):

   - Remove: `j.autoComment` (deprecated)
   - Remove: `j.artistName` (redundant, covered by displaySecondary)
   - Add: `j.displayPrimary`, `j.displaySecondary`, `j.displayBadges`
   - New: `CREATE FULLTEXT INDEX jingle_search IF NOT EXISTS FOR (j:Jingle) ON EACH [j.title, j.songTitle, j.comment, j.displayPrimary, j.displaySecondary, j.displayBadges]`

2. **Canciones Index** (line 35):

   - Add: `c.displayPrimary`, `c.displaySecondary`, `c.displayBadges`
   - New: `CREATE FULLTEXT INDEX cancion_search IF NOT EXISTS FOR (c:Cancion) ON EACH [c.title, c.displayPrimary, c.displaySecondary, c.displayBadges]`

3. **Artistas Index** (line 34):

   - Add: `a.displayPrimary`, `a.displaySecondary`, `a.displayBadges`
   - New: `CREATE FULLTEXT INDEX artista_search IF NOT EXISTS FOR (a:Artista) ON EACH [a.stageName, a.name, a.displayPrimary, a.displaySecondary, a.displayBadges]`

4. **Tematicas Index** (lines 33, 39):

   - Add: `t.displayPrimary`, `t.displaySecondary`, `t.displayBadges`
   - New: `CREATE FULLTEXT INDEX tematica_search IF NOT EXISTS FOR (t:Tematica) ON EACH [t.name, t.description, t.displayPrimary, t.displaySecondary, t.displayBadges]`

5. **Fabricas Index** (NEW):

   - Create new fulltext index for Fabricas
   - Add: `CREATE FULLTEXT INDEX fabrica_search IF NOT EXISTS FOR (f:Fabrica) ON EACH [f.title, f.displayPrimary, f.displaySecondary, f.displayBadges]`

**Note**: Existing indexes will need to be dropped and recreated. Consider migration strategy for production.

### Step 2: Remove Basic Search Mode

**File**: `backend/src/server/api/search.ts`

1. **Remove mode parameter handling** (line 81):

   - Remove: `const mode = ((req.query.mode as string) || 'basic').toLowerCase();`
   - Remove: `const useFullText = mode === 'fulltext';`
   - Always use fulltext (no conditional)

2. **Remove basic mode queries** (lines 173-254):

   - Delete entire basic mode section (fallback/basic mode queries)
   - Remove all `if (useFullText) { try { ... } catch { ... } }` wrapper
   - Keep only fulltext queries

3. **Update fulltext queries** to return ONLY display properties (plus .id and score):

   - **Jingles** (lines 111-118): Change RETURN to `node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score }`
   - **Canciones** (lines 122-129): Change RETURN to `node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score }`
   - **Artistas** (lines 133-140): Change RETURN to `node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score }`
   - **Tematicas** (lines 143-151): Change RETURN to `node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score }`
   - **Fabricas** (NEW): Add fulltext query: `node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score }`
   - **Important**: Do NOT return raw properties like `.title`, `.stageName`, `.name`, `.timestamp`, `.songTitle`, etc. Only return display properties.

4. **Update result mapping** (lines 159-167):

   - Mapping should work as-is since it spreads all properties from the converted object
   - Verify `convertNeo4jDates` preserves display properties
   - Each entity in results will have structure: `{ id, displayPrimary, displaySecondary, displayBadges, type, score? }`
   - EntityCard will automatically use these display properties for rendering (no fallback needed)

### Step 3: Add Fabricas Fulltext Query

**File**: `backend/src/server/api/search.ts`

Add Fabricas to fulltext queries section (after line 152):

```typescript
if (active.includes('fabricas')) {
  const qF = `
    CALL db.index.fulltext.queryNodes('fabrica_search', $q) YIELD node, score
    RETURN node { .id, .displayPrimary, .displaySecondary, .displayBadges, score: score } AS f
    ORDER BY f.score DESC
    SKIP $offset
    LIMIT $limit
  `;
  queriesFT.push(db.executeQuery<any>(qF, { q, limit, offset }));
} else { queriesFT.push(Promise.resolve([])); }
```

### Step 4: Update Result Processing

**File**: `backend/src/server/api/search.ts`

Ensure result processing (lines 159-167) handles all entity types including Fabricas:

- Add `fabricasRaw` to Promise.all if not already present
- Map Fabricas results: `fabricasRaw.map((r: any) => ({ ...convertNeo4jDates(r.f || r), type: 'fabrica' }))`
- Include in response JSON
- Verify all entities have the same structure: `{ id, displayPrimary, displaySecondary, displayBadges, type }`

### Step 5: Verify Frontend Compatibility

**Files**:

- `frontend/src/pages/SearchResultsPage.tsx`
- `frontend/src/components/search/SearchBar.tsx`
- `frontend/src/components/admin/EntitySearchAutocomplete.tsx`

Verify that:

- EntityCard already supports `displayPrimary`, `displaySecondary`, `displayBadges` (no changes needed)
- EntityCard will automatically use display properties when present (lines 207-242 in EntityCard.tsx)
- No frontend code explicitly sets `mode=basic` (confirmed: all use default)
- Search results display correctly with display properties matching Admin page format

### Step 6: Database Migration Strategy

**Considerations**:

1. **Drop and recreate indexes**: Fulltext indexes need to be recreated with new fields

   - May require downtime or careful migration
   - Test index recreation in development first

2. **Ensure display properties are computed**: 

   - Verify all entities have display properties populated
   - Run `generate-display-properties.ts` script if needed
   - Ensure `updateDisplayProperties()` is called on entity/relationship changes
   - **Critical**: If display properties are missing, search results will be incomplete

3. **Index population time**: Fulltext indexes may take time to rebuild on large datasets

## Technical Notes

- **displaySecondary contains relationship data**: For Canciones, `displaySecondary` includes autor names (e.g., `🚚 The Beatles • Abbey Road • 1969`), enabling search without relationship traversal
- **All entities use display properties**: Every search result entity will have `displayPrimary`, `displaySecondary`, and `displayBadges` - EntityCard uses these exclusively for rendering
- **No raw properties in results**: Search API returns only `.id` and display properties, making the response leaner and consistent
- **Emoji handling**: Fulltext indexes typically tokenize text, so emojis and separators (•) may be treated as word boundaries. Test to ensure search works correctly.
- **Stale display properties**: If display properties aren't updated when relationships change, search may miss results. Ensure `updateDisplayProperties()` is called on all relationship mutations.
- **Fulltext query syntax**: Fulltext supports phrase matching and boolean operators. Simple queries like "Beatles" will work, but complex queries may need preprocessing.
- **Backward compatibility**: Removing basic mode is a breaking change, but since no UI code explicitly uses it, impact should be minimal.

## Files to Modify

1. `backend/src/server/db/schema/setup.ts` - Update fulltext index definitions
2. `backend/src/server/api/search.ts` - Remove basic mode, update fulltext queries, add Fabricas

## Files to Verify (No Changes Expected)

1. `frontend/src/components/common/EntityCard.tsx` - Already supports display properties
2. `frontend/src/pages/SearchResultsPage.tsx` - Already uses EntityCard correctly
3. `backend/src/server/utils/displayProperties.ts` - Display property generation logic (already implemented)

## Success Criteria

- Search API uses fulltext exclusively (no basic mode)
- Fulltext indexes include `displayPrimary`, `displaySecondary`, and `displayBadges` for all entity types
- Fulltext index exists for Fabricas
- **Search results return ONLY `.id`, `displayPrimary`, `displaySecondary`, and `displayBadges`** (no raw properties)
- **All search result entities are presented using display properties** - EntityCard uses displayPrimary, displaySecondary, and displayBadges for rendering
- Search results page displays entities in the same format as Admin entity list pages
- Searching for autor names finds Canciones (via displaySecondary)
- Deprecated `autoComment` removed from indexes
- Each entity in search results has the structure: `{ id, displayPrimary, displaySecondary, displayBadges, type }`