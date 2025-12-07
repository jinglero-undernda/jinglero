# API Contracts Validation Report: EntityCard relationshipData Extraction

**Date**: 2025-12-07  
**Validator**: AI Assistant  
**Specification Version**: 2025-12-07 (Pre-computed display properties architecture)  
**Validation Focus**: API Contracts

## Summary

- **Status**: `discrepancies_found`
- **Total Checks**: 15
- **Passed**: 8
- **Failed**: 5
- **Warnings**: 2

### Executive Summary

The specification defines a **future architecture** with pre-computed `displayPrimary`, `displaySecondary`, and `displayBadges` properties. The current API implementation does **not** include these properties yet, which is expected as this is a specification for future implementation. However, the existing API contracts for `_metadata` format and relationship data extraction are **largely aligned** with the specification's requirements.

**Key Findings**:

- ✅ `_metadata` format is correctly implemented in Public API endpoints
- ✅ Relationship properties (timestamp from APPEARS_IN) are correctly extracted
- ✅ Flat structure fallback is correctly handled in Search API
- ❌ Pre-computed display properties (`displayPrimary`, `displaySecondary`, `displayBadges`) are **not yet implemented** in API responses
- ⚠️ Some API endpoints return flat structure instead of `_metadata` format (as documented in spec)

---

## Code References

### Validated ✅

- `backend/src/server/api/public.ts:189-193` - Artista list endpoint returns `_metadata` with `autorCount` and `jingleroCount` ✅ Matches specification
- `backend/src/server/api/public.ts:304-308` - Cancion list endpoint returns `_metadata` with `jingleCount` and `autores` ✅ Matches specification
- `backend/src/server/api/public.ts:1416-1420` - Tematica related endpoint returns jingles with `_metadata` including `cancion`, `autores`, `jingleros` ✅ Matches specification
- `backend/src/server/api/public.ts:1414` - APPEARS_IN relationship includes `timestamp` property ✅ Matches specification requirement for `jingleTimestamp`
- `frontend/src/lib/utils/relationshipDataExtractor.ts:103-239` - Extraction function implements priority order correctly ✅ Matches specification
- `frontend/src/lib/utils/relationshipDataExtractor.ts:71-73` - Field override rules correctly defined ✅ Matches specification

### Discrepancies ❌

- **No implementation found** for `displayPrimary`, `displaySecondary`, `displayBadges` properties in API responses
  - **Expected**: All entity types should have these pre-computed properties
  - **Actual**: These properties do not exist in any API endpoint
  - **Impact**: Specification describes future architecture, but API contracts need to be updated to include these properties
  - **Recommendation**: Add these properties to API response schemas and database schema

---

## API Contract Validation

### 1. `_metadata` Format Contract

#### Validated ✅

**Public API Endpoints**:

1. **`GET /api/public/artistas`** ✅

   - Returns: `{ ...artista, _metadata: { autorCount: number, jingleroCount: number } }`
   - **Status**: ✅ Matches specification requirement for Artista `_metadata`
   - **Location**: `backend/src/server/api/public.ts:189-193`

2. **`GET /api/public/canciones`** ✅

   - Returns: `{ ...cancion, _metadata: { jingleCount: number, autores?: Artista[] } }`
   - **Status**: ✅ Matches specification requirement for Cancion `_metadata`
   - **Location**: `backend/src/server/api/public.ts:304-308`
   - **Note**: `autores` is included in `_metadata` with proper structure (array of Artista objects with their own `_metadata`)

3. **`GET /api/public/entities/tematicas/:id/related`** ✅

   - Returns jingles with: `{ ...jingle, _metadata: { cancion?: Cancion, autores?: Artista[], jingleros?: Artista[] } }`
   - **Status**: ✅ Matches specification requirement for Jingle `_metadata`
   - **Location**: `backend/src/server/api/public.ts:1416-1420`

4. **`GET /api/public/search`** ✅
   - Returns entities with `_metadata` format for canciones and artistas
   - **Status**: ✅ Matches specification requirement
   - **Location**: `backend/src/server/api/public.ts:1568-1592`

#### Discrepancies ❌

1. **`GET /api/public/artistas/:id`** (single Artista) ❌

   - **Expected**: Should return `_metadata` with `autorCount` and `jingleroCount`
   - **Actual**: Returns only entity properties, no `_metadata`
   - **Location**: `backend/src/server/api/public.ts:202-216`
   - **Impact**: Low (list endpoint works, but single entity endpoint doesn't match pattern)

2. **`GET /api/public/canciones/:id`** (single Cancion) ❌

   - **Expected**: Should return `_metadata` with `jingleCount` and `autores`
   - **Actual**: Returns only entity properties, no `_metadata`
   - **Location**: `backend/src/server/api/public.ts:317-329`
   - **Impact**: Low (list endpoint works, but single entity endpoint doesn't match pattern)

3. **Jingle endpoints** ⚠️
   - **Expected**: Jingle endpoints should return `_metadata` with `fabrica`, `cancion`, `autores`, `jingleros`
   - **Actual**: Some endpoints return flat structure (e.g., `jingle.fabrica` directly on entity)
   - **Location**: Multiple locations in `backend/src/server/api/public.ts`
   - **Impact**: Medium (extraction utility handles this via fallback, but inconsistent with spec's preferred format)
   - **Note**: Specification documents this as "transitional" and extraction utility handles both formats

### 2. Flat Structure Fallback Contract

#### Validated ✅

**Search API** (`/api/search`) ✅

- **Expected**: Returns flat structure (relationship data directly on entity, e.g., `jingle.fabrica`)
- **Actual**: Returns flat structure without `_metadata`
- **Status**: ✅ Matches specification requirement for transitional format
- **Location**: `backend/src/server/api/search.ts:190-198` (jingles), `202-216` (canciones), `219-229` (artistas)
- **Note**: Specification correctly documents this as a fallback format for APIs that haven't been refactored

### 3. Relationship Properties Contract

#### Validated ✅

**APPEARS_IN Relationship - `timestamp` Property** ✅

- **Expected**: `timestamp` property from APPEARS_IN relationship should be available for `jingleTimestamp` extraction
- **Actual**: API correctly returns `timestamp` from APPEARS_IN relationship
- **Status**: ✅ Matches specification requirement
- **Location**: `backend/src/server/api/public.ts:1414` (Tematica related endpoint), `1387` (query includes `appearsIn.timestamp`)
- **Usage**: Used in `relationshipDataExtractor.ts` via `relationshipProperties` option

**Example from API**:

```typescript
// backend/src/server/api/public.ts:1414
timestamp: r.timestamp ?? null, // Include timestamp from APPEARS_IN relationship
```

### 4. Pre-computed Display Properties Contract

#### Discrepancies ❌

**All Entity Types** ❌

- **Expected**: All API responses should include:
  - `displayPrimary?: string` (e.g., `'🏭 Fabrica Title'`)
  - `displaySecondary?: string` (e.g., `'01/01/2025 • 🎤: 5'`)
  - `displayBadges?: string[]` (e.g., `['JINGLAZO', 'PRECARIO']`)
- **Actual**: These properties **do not exist** in any API endpoint
- **Impact**: **High** - This is the core of the specification's future architecture
- **Recommendation**:
  1. Add database schema changes to include these properties
  2. Add computation logic at entity create/edit time
  3. Update all API endpoints to return these properties
  4. Create migration script for existing entities

**Missing Properties by Entity Type**:

1. **Fabrica** ❌

   - Missing: `displayPrimary` (should be `'🏭 {title}'`)
   - Missing: `displaySecondary` (should be `'{formattedDate} • 🎤: {jingleCount}'`)
   - Missing: `displayBadges` (should be `[]`)

2. **Jingle** ❌

   - Missing: `displayPrimary` (should be `'🎤 {title}'` or fallback)
   - Missing: `displaySecondary` (should be derived from `autoComment`)
   - Missing: `displayBadges` (should be `['JINGLAZO', 'PRECARIO', 'JDD', 'VIVO', 'CLASICO']` based on boolean props)

3. **Cancion** ❌

   - Missing: `displayPrimary` (should be `'📦 {title}'`)
   - Missing: `displaySecondary` (should be `'🚚: {autores} • {album} • {year} • 🎤: {jingleCount}'`)
   - Missing: `displayBadges` (should be `[]`)

4. **Artista** ❌

   - Missing: `displayPrimary` (should be icon + `{stageName}` with icon determined by counts)
   - Missing: `displaySecondary` (should be `'{name} • 📦: {autorCount} • 🎤: {jingleroCount}'`)
   - Missing: `displayBadges` (should be `['ARG']` if `isArg === true`)

5. **Tematica** ❌
   - Missing: `displayPrimary` (should be `'🏷️ {name}'`)
   - Missing: `displaySecondary` (should be `'{category} • 🎤: {jingleCount}'`)
   - Missing: `displayBadges` (should be contextual based on relationship `isPrimary` property)

---

## Type Definitions

### Validated ✅

**Frontend Type Definitions** ✅

- `frontend/src/lib/utils/relationshipDataExtractor.ts:21-35` - `EntityWithMetadata` type correctly defines `_metadata` structure ✅
- `frontend/src/lib/utils/relationshipDataExtractor.ts:41-52` - `EntityWithFlatStructure` type correctly defines flat structure fallback ✅
- `frontend/src/lib/utils/relationshipDataExtractor.ts:57-66` - `ExtractRelationshipDataOptions` interface matches specification ✅

### Discrepancies ❌

**Missing Type Definitions for Display Properties** ❌

- **Expected**: TypeScript types should include `displayPrimary`, `displaySecondary`, `displayBadges` on entity types
- **Actual**: These properties are not defined in any TypeScript type
- **Location**: Entity types are defined in `frontend/src/types` (not read due to timeout, but grep shows no matches)
- **Impact**: Medium - Types need to be updated to match future API contract

---

## API Endpoint Coverage

### Endpoints Returning `_metadata` Format ✅

1. `GET /api/public/artistas` ✅
2. `GET /api/public/canciones` ✅
3. `GET /api/public/entities/tematicas/:id/related` ✅
4. `GET /api/public/search` (canciones and artistas) ✅

### Endpoints Missing `_metadata` Format ⚠️

1. `GET /api/public/artistas/:id` ⚠️ (single entity)
2. `GET /api/public/canciones/:id` ⚠️ (single entity)
3. `GET /api/public/jingles/:id` ⚠️ (if exists, not verified)
4. `GET /api/public/fabricas/:id` ⚠️ (if exists, not verified)

### Endpoints Using Flat Structure (Transitional) ✅

1. `GET /api/search` ✅ (documented as transitional in spec)

---

## Extraction Utility Validation

### Validated ✅

**Priority Order Implementation** ✅

- **Specification**: 1. Pre-fetched data, 2. `_metadata`, 3. Flat structure fallback, 4. Relationship properties, 5. Parent context
- **Implementation**: `frontend/src/lib/utils/relationshipDataExtractor.ts:110-235` correctly implements this order ✅

**Field Override Rules** ✅

- **Specification**: `jingle.fabrica`, `jingle.cancion`, `jingle.autores` are overridden by parent context
- **Implementation**: `frontend/src/lib/utils/relationshipDataExtractor.ts:71-73, 214-234` correctly implements override rules ✅

**Graceful Degradation** ✅

- **Specification**: Missing data should not cause errors, return `undefined` if no data
- **Implementation**: `frontend/src/lib/utils/relationshipDataExtractor.ts:237-238` returns `undefined` if no data extracted ✅

**Array Validation** ✅

- **Specification**: Empty arrays should not be included, check `Array.isArray()` and `length > 0`
- **Implementation**: `frontend/src/lib/utils/relationshipDataExtractor.ts:133-134, 146-150` correctly validates arrays ✅

---

## Recommendations

### High Priority

1. **Implement Pre-computed Display Properties** 🔴

   - Add `displayPrimary`, `displaySecondary`, `displayBadges` to database schema
   - Add computation logic at entity create/edit time
   - Update all API endpoints to return these properties
   - Create migration script for existing entities
   - Update TypeScript types to include these properties

2. **Standardize `_metadata` Format Across All Endpoints** 🟡
   - Update single entity endpoints (`/artistas/:id`, `/canciones/:id`) to return `_metadata`
   - Ensure all Jingle endpoints return `_metadata` format (not flat structure)
   - Document which endpoints use flat structure (transitional) vs `_metadata` (standard)

### Medium Priority

3. **Update TypeScript Types** 🟡

   - Add `displayPrimary?: string`, `displaySecondary?: string`, `displayBadges?: string[]` to all entity types
   - Update `EntityWithMetadata` type to include display properties
   - Ensure type definitions match API contract

4. **Document API Contract Variations** 🟡
   - Document which endpoints return `_metadata` format
   - Document which endpoints return flat structure (transitional)
   - Create API contract documentation for frontend developers

### Low Priority

5. **Consistency Improvements** 🟢
   - Ensure all list endpoints return `_metadata` format consistently
   - Consider deprecating flat structure format once all endpoints are migrated

---

## Next Steps

### Immediate Actions

- [ ] **Backend**: Add `displayPrimary`, `displaySecondary`, `displayBadges` to database schema
- [ ] **Backend**: Implement computation logic for display properties
- [ ] **Backend**: Update API endpoints to return display properties
- [ ] **Frontend**: Update TypeScript types to include display properties
- [ ] **Frontend**: Update EntityCard to use display properties (when available)

### Future Actions

- [ ] **Backend**: Standardize all endpoints to use `_metadata` format
- [ ] **Backend**: Create migration script for existing entities
- [ ] **Documentation**: Create API contract documentation
- [ ] **Testing**: Add API contract tests for display properties

---

## Validation Checklist

### API Contracts ✅

- [x] `_metadata` format is correctly implemented in Public API endpoints
- [x] Relationship properties (timestamp) are correctly extracted from relationships
- [x] Flat structure fallback is correctly handled in Search API
- [x] Extraction utility correctly implements priority order
- [x] Field override rules are correctly implemented
- [x] Graceful degradation is correctly implemented

### Missing Implementation ❌

- [ ] Pre-computed `displayPrimary` property is returned by API
- [ ] Pre-computed `displaySecondary` property is returned by API
- [ ] Pre-computed `displayBadges` property is returned by API
- [ ] TypeScript types include display properties
- [ ] All single entity endpoints return `_metadata` format

---

## Conclusion

The specification describes a **future architecture** with pre-computed display properties. The current API implementation correctly supports the `_metadata` format and relationship data extraction as specified, but **does not yet implement** the pre-computed display properties (`displayPrimary`, `displaySecondary`, `displayBadges`). This is expected as the specification is forward-looking.

**Key Validation Results**:

- ✅ **Existing API contracts** (`_metadata`, relationship properties, flat structure fallback) are correctly implemented
- ✅ **Extraction utility** correctly implements specification requirements
- ❌ **Pre-computed display properties** are not yet implemented (this is the main gap)
- ⚠️ **Some endpoints** use flat structure instead of `_metadata` format (documented as transitional)

**Recommendation**: Proceed with implementation of pre-computed display properties as the next step, following the specification's architecture.

---

**Related Documents**:

- Specification: `entity-card-relationshipdata-extraction-specification.md`
- Extraction Utility: `frontend/src/lib/utils/relationshipDataExtractor.ts`
- Public API: `backend/src/server/api/public.ts`
- Search API: `backend/src/server/api/search.ts`
