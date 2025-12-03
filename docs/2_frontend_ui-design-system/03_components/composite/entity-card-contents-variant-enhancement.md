# Design Intent: EntityCard Contents Variant Enhancement

## Status

- **Status**: draft (proposed changes)
- **Last Updated**: 2025-12-02
- **Last Validated**: 2025-12-02
- **Proposed By**: User request for enhanced information display
- **Validation Status**: Phase 1 (Frontend) ✅ Validated | Phase 2 (Backend) ⚠️ Proposed
- **Code Reference**:
  - `frontend/src/components/common/EntityCard.tsx:74-147` (badge logic)
  - `frontend/src/lib/utils/entityDisplay.ts:68-317` (display utilities)
  - `frontend/src/components/common/RelatedEntities.tsx:2052-2119` (relationship data)
- **Validation Report**: See `entity-card-contents-variant-enhancement-validation-report.md`

## Overview

This document describes proposed enhancements to the EntityCard component's "contents" variant to provide clearer, more informative displays for Jingle, Artista, and Cancion entities. The changes aim to make key information immediately visible without requiring navigation to detail pages.

## Current Implementation

### Current Contents Variant Behavior

**Jingle Entities:**

- **Primary Text**: Title or songTitle (fallback to id)
- **Secondary Text**: Fabrica date or "INEDITO"
- **Badges**: Only `isJinglazo` and `isPrecario` shown
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:73-95` (original implementation)

**Artista Entities:**

- **Icon**: Context-dependent based on `relationshipLabel` prop only:
  - 👤 (default)
  - 🔧 (when `relationshipLabel="Jinglero"`)
  - 🚚 (when `relationshipLabel="Autor"`)
- **Primary Text**: `stageName` or `name` (fallback to id)
- **Secondary Text**: `name` (if different from stageName), `nationality`
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:68-93` (original implementation)

**Cancion Entities:**

- **Primary Text**: `title` (or "Titulo (Autor1, Autor2)" when autores in relationshipData)
- **Secondary Text**: `album`, `year`
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:113-126` (original implementation)

## Proposed Changes

### Design Goals

1. **Jingles**: Show all relevant metadata (autoComment, all boolean flags) as badges
2. **Artista**: Differentiate icons based on actual relationship types (AUTOR_DE vs JINGLERO_DE), show relationship counts
3. **Cancion**: Show autor information and jingle count in secondary text

### Proposed Implementation

#### Jingle Entities (Contents Variant)

**Primary Text**: Unchanged

- Title or songTitle (fallback to id)
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:141-145`

**Secondary Text**: Unchanged

- Fabrica date or "INEDITO"
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:191-210`

**Badges**: Enhanced display

- `autoComment` prop displayed as badge (if available)
- All boolean props displayed as badges when true:
  - `isJinglazo` → "JINGLAZO"
  - `isJinglazoDelDia` → "JDD"
  - `isPrecario` → "PREC"
  - `isLive` → "VIVO"
  - `isRepeat` → "CLASICO"
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:73-140` (proposed implementation)

**Backend/API Requirements**:

- ✅ `autoComment` already available in Jingle entity
- ✅ All boolean props already available in Jingle entity
- **No API changes required**

#### Artista Entities (Contents Variant)

**Icon**: Enhanced logic based on relationship counts

- 👤 (default): Has BOTH or NEITHER AUTOR_DE and JINGLERO_DE relationships
- 🚚: Has at least one AUTOR_DE but no JINGLERO_DE
- 🔧: Has at least one JINGLERO_DE but no AUTOR_DE
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:68-125` (proposed implementation)

**Primary Text**: Enhanced

- `stageName` (or `name` if stageName is empty, fallback to id)
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:164-172`

**Secondary Text**: Enhanced

- `name` if different from `stageName`
- "ARG" tag if `isArg` is true
- "📦: #" with AUTOR_DE count (if available)
- "🎤: #" with JINGLERO_DE count (if available)
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:218-250` (proposed implementation)

**Backend/API Requirements**:

- ⚠️ **NEEDS IMPROVEMENT**: Relationship counts currently only available when viewing Artista's own page
- **Current Limitation**: When Artista is displayed as a related entity in a list, counts are not available
- **Proposed API Enhancement** (Option D - RECOMMENDED):
  - Include `_metadata` with `autorCount` and `jingleroCount` on each Artista entity when returned in related entity lists
  - This allows EntityCard to display counts for each Artista in lists (e.g., when viewing a Cancion's autores)
- **API Endpoints Affected**:
  - `/api/public/entities/canciones/:id/related` - Each Artista in `autores` array should have `_metadata` with counts
  - `/api/public/entities/artistas/:id/related` - Each Cancion in `cancionesByAutor` could have `_metadata` with counts
- **Code Reference**: `backend/src/server/api/public.ts:874-1042`

#### Cancion Entities (Contents Variant)

**Primary Text**: Simplified

- `title` (fallback to id)
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:146-163`

**Secondary Text**: Enhanced

- Existing secondary properties (album, year)
- "🚚: Autor" with autor name(s) (if available)
- "🎤: #" with Jingle count (if available)
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:230-260` (proposed implementation)

**Backend/API Requirements**:

- ⚠️ **NEEDS IMPROVEMENT**: Autor information and jingle count currently only available when viewing Cancion's own page
- **Current Limitation**: When Cancion is displayed as a related entity in a list, autor info and counts are not available
- **Proposed API Enhancement** (Option D - RECOMMENDED):
  - Include `_metadata` with `jingleCount` and `autores` array on each Cancion entity when returned in related entity lists
  - Each Artista in the `autores` array should also have `_metadata` with their own counts
  - This allows EntityCard to display counts for each Cancion in lists (e.g., when viewing an Artista's cancionesByAutor)
- **API Endpoints Affected**:
  - `/api/public/entities/artistas/:id/related` - Each Cancion in `cancionesByAutor` should have `_metadata` with `jingleCount` and `autores`
  - `/api/public/entities/canciones/:id/related` - Each Cancion in `otherCancionesByAutor` should have `_metadata` with counts
- **Code Reference**: `backend/src/server/api/public.ts:874-959`

## Implementation Strategy

### Phase 1: Frontend Implementation (Current State)

- ✅ Enhanced badge display for Jingles
- ✅ Enhanced icon logic for Artista
- ✅ Enhanced text display for Artista and Cancion
- ⚠️ Relationship counts work only when viewing entity's own page
- **Code Reference**:
  - `frontend/src/components/common/EntityCard.tsx:73-140`
  - `frontend/src/lib/utils/entityDisplay.ts:68-318`
  - `frontend/src/components/common/RelatedEntities.tsx:2042-2112`

### Phase 2: Backend/API Enhancement (Proposed)

#### Option A: Include Counts in Entity Detail Responses

**Artista Detail Response Enhancement**:

```typescript
// Current: /api/public/entities/artistas/:id
{
  id: string;
  stageName: string;
  name?: string;
  // ... other properties
}

// Proposed:
{
  id: string;
  stageName: string;
  name?: string;
  // ... other properties
  _metadata?: {
    autorCount: number;      // Count of AUTOR_DE relationships
    jingleroCount: number;    // Count of JINGLERO_DE relationships
  }
}
```

**Cancion Detail Response Enhancement**:

```typescript
// Current: /api/public/entities/canciones/:id
{
  id: string;
  title: string;
  // ... other properties
}

// Proposed:
{
  id: string;
  title: string;
  // ... other properties
  _metadata?: {
    jingleCount: number;      // Count of VERSIONA relationships
    autores?: Artista[];      // Array of autores
  }
}
```

**Implementation Location**: `backend/src/server/api/public.ts`

#### Option B: Include Counts in Related Entities Metadata (Limited)

**Artista Related Entities Response Enhancement**:

```typescript
// Current: /api/public/entities/artistas/:id/related
{
  cancionesByAutor: Cancion[];
  jinglesByJinglero: Jingle[];
  meta: { limit: number };
}

// Proposed:
{
  cancionesByAutor: Cancion[];
  jinglesByJinglero: Jingle[];
  meta: {
    limit: number;
    autorCount: number;       // Total count for root entity only
    jingleroCount: number;     // Total count for root entity only
  };
}
```

**Limitation**: This only provides counts for the root entity being viewed, not for each entity in the lists. Entities in `cancionesByAutor` and `jinglesByJinglero` arrays would not have their own counts.

**Implementation Location**: `backend/src/server/api/public.ts:1027-1033`

#### Option D: Include Counts on Each Entity in Lists (RECOMMENDED)

**Artista Related Entities Response Enhancement**:

```typescript
// Current: /api/public/entities/artistas/:id/related
{
  cancionesByAutor: Cancion[];  // Each Cancion is plain object
  jinglesByJinglero: Jingle[];  // Each Jingle is plain object
  meta: { limit: number };
}

// Proposed:
{
  cancionesByAutor: Array<Cancion & {
    _metadata?: {
      jingleCount: number;      // Count for THIS Cancion
      autores?: Artista[];      // Autores for THIS Cancion (with their counts)
    }
  }>;
  jinglesByJinglero: Jingle[];  // Jingles don't need counts
  meta: {
    limit: number;
    autorCount: number;          // Total count for root Artista
    jingleroCount: number;       // Total count for root Artista
  };
}
```

**Cancion Related Entities Response Enhancement**:

```typescript
// Current: /api/public/entities/canciones/:id/related
{
  jinglesUsingCancion: Jingle[];
  otherCancionesByAutor: Cancion[];  // Each Cancion is plain object
  jinglesByAutorIfJinglero: Jingle[];
  meta: { limit: number };
}

// Proposed:
{
  jinglesUsingCancion: Jingle[];
  otherCancionesByAutor: Array<Cancion & {
    _metadata?: {
      jingleCount: number;      // Count for THIS Cancion
      autores?: Array<Artista & {
        _metadata?: {
          autorCount: number;   // Count for THIS Artista
          jingleroCount: number; // Count for THIS Artista
        }
      }>;
    }
  }>;
  jinglesByAutorIfJinglero: Jingle[];
  autores: Array<Artista & {
    _metadata?: {
      autorCount: number;       // Count for THIS Artista
      jingleroCount: number;    // Count for THIS Artista
    }
  }>;
  meta: {
    limit: number;
    jingleCount: number;        // Total count for root Cancion
  };
}
```

**Key Benefits**:

- Each entity in lists has its own counts attached
- Frontend can display counts directly from entity objects
- Works perfectly for EntityCard components displaying lists
- No need to fetch individual entities to get counts

**Implementation Location**: `backend/src/server/api/public.ts:874-1042`

- Modify Cypher queries to calculate counts per entity
- Attach `_metadata` to each entity object before returning

#### Option C: Lightweight Counts Endpoint

**New Endpoint**: `/api/public/entities/:type/:id/counts`

```typescript
// Response for Artista
{
  autorCount: number;
  jingleroCount: number;
}

// Response for Cancion
{
  jingleCount: number;
  autorCount: number;
}
```

**Implementation Location**: New endpoint in `backend/src/server/api/public.ts`

### Recommended Approach

**Recommendation**: **Option D** (Include counts on each entity in related entity lists)

**Rationale**:

1. **Perfect for list displays**: When viewing a Cancion and seeing a list of Artistas (autores), each Artista in that list needs its own `autorCount` and `jingleroCount` to display in EntityCard
2. **No additional API calls**: Counts come with the list data, no need to fetch individual entities
3. **Works with existing frontend**: Frontend can extract counts from `entity._metadata` or `relationshipData`
4. **Backward compatible**: `_metadata` is optional, existing code continues to work
5. **Efficient**: Single query can calculate counts for all entities in the list

**When to use alternatives**:

- **Option A**: If you need counts when fetching a single entity via detail endpoint (not in a list context)
- **Option B**: If you only need counts for the root entity being viewed (not for entities in lists)
- **Option C**: If you need counts independently without fetching full entity data

## Data Flow

### Current Data Flow (Limited)

```
Entity Detail Page → RelatedEntities Component → EntityCard
  ↓
  Only root entity has access to relationship counts
  Related entities don't have counts available
```

### Proposed Data Flow (Enhanced - Option D)

```
Entity Detail Page → RelatedEntities Component → EntityCard
  ↓
  Root entity: Counts from state.counts (from related entities API)
  Related entities in lists: Counts from entity._metadata (attached to each entity object)

Example:
  - Viewing Cancion → List of Artistas (autores)
  - Each Artista object has: { id, stageName, ..., _metadata: { autorCount: 5, jingleroCount: 3 } }
  - EntityCard extracts counts from entity._metadata for display
```

## Usage Guidelines

### When to Use Enhanced Display

- **Contents Variant**: Always use enhanced display for better information density
- **Heading Variant**: Keep existing display (less information needed in headers)
- **Placeholder Variant**: Keep existing display (no entity data available)

### Performance Considerations

- Relationship counts should be calculated efficiently in backend
- Consider caching counts if they're expensive to compute
- Frontend gracefully handles missing counts (shows partial information)

## Code References

### Frontend Implementation

- **EntityCard Component**: `frontend/src/components/common/EntityCard.tsx:73-140`
- **Entity Display Utilities**: `frontend/src/lib/utils/entityDisplay.ts:68-318`
- **RelatedEntities Component**: `frontend/src/components/common/RelatedEntities.tsx:2042-2112`

### Backend API (Current)

- **Artista Related Entities**: `backend/src/server/api/public.ts:962-1042`
- **Cancion Related Entities**: `backend/src/server/api/public.ts:874-959`
- **Jingle Detail**: `backend/src/server/api/public.ts:551-625`

### Backend API (Proposed Changes - Option D)

- **Artista Related Entities Enhancement**: `backend/src/server/api/public.ts:962-1042`
  - Modify `cancionesByAutorQuery` to include `jingleCount` and `autores` with counts for each Cancion
  - Attach `_metadata` to each Cancion object in the response
- **Cancion Related Entities Enhancement**: `backend/src/server/api/public.ts:874-959`
  - Modify queries to include counts for each entity in lists
  - Add `autores` array with each Artista having `_metadata` with counts
  - Attach `_metadata` to each Cancion in `otherCancionesByAutor` array

## Change History

- **2025-12-02**: Initial design intent documentation created
  - Documented current implementation
  - Documented proposed changes
  - Identified backend/API enhancement opportunities
  - Frontend implementation completed (Phase 1)
- **2025-12-02**: Updated recommended approach to Option D
  - Changed from Option B (metadata only) to Option D (counts on each entity)
  - Better supports list displays where each entity needs its own counts
  - Clarified use cases for each option

## Next Steps

1. **Review this design intent document**
2. **Decide on backend/API enhancement approach** (Option D recommended for list displays)
3. **Implement backend/API changes** (Phase 2 - Option D):
   - Modify Cypher queries to calculate counts per entity
   - Attach `_metadata` object to each entity in related entity lists
   - Update response structures to include counts on entities
4. **Update frontend to extract counts from entity.\_metadata**:
   - Modify `RelatedEntities.tsx` to extract `_metadata` from entity objects
   - Pass counts via `relationshipData` to EntityCard
   - Update `entityDisplay.ts` to use counts from `relationshipData._metadata`
5. **Test and validate** the complete implementation
6. **Update component documentation** with final implementation details

## Related Documentation

- **Component Documentation**: `docs/2_frontend_ui-design-system/03_components/composite/entity-card.md`
- **Playbook**: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_01_DOCUMENT_DESIGN_INTENT.md`
- **API Contracts**: `docs/5_backend_api-contracts/contracts/public-api.md`
- **Database Schema**: `docs/4_backend_database-schema/schema/relationships.md`
