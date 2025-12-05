# Proposal: Centralize Entity Display RelationshipData Extraction

**Status**: Proposal (Pending Approval)  
**Date**: 2025-12-05  
**Area**: UI Design System - Component Behavior  
**Related Component**: EntityCard  
**Related Utility**: relationshipDataExtractor.ts

## Executive Summary

This proposal addresses duplication in relationshipData extraction logic across multiple components (`AdminEntityAnalyze`, `EntityList`, `RelatedEntities`). The current implementation has custom extraction logic in each component, leading to maintenance burden and inconsistent behavior. This document proposes centralizing all relationshipData extraction logic into a single, enhanced utility function.

## Problem Statement

### Current State

RelationshipData extraction logic is duplicated across three major components:

1. **AdminEntityAnalyze** (`frontend/src/pages/admin/AdminEntityAnalyze.tsx:337-361`)
   - Extracts from `_metadata`
   - For jingles: checks direct properties on entity
   - Custom logic for jingle-specific extraction

2. **EntityList** (`frontend/src/components/admin/EntityList.tsx:348-375`)
   - Extracts from `_metadata`
   - For jingles: checks pre-fetched relationship data cache
   - Falls back to direct properties on entity
   - Custom logic for jingle-specific extraction

3. **RelatedEntities** (`frontend/src/components/common/RelatedEntities.tsx:2076-2117`)
   - Extracts from `_metadata`
   - For jingles: checks direct properties on entity
   - Uses parent entity context (fabrica for jingles, cancion for jingles)
   - Custom logic for jingle-specific extraction + parent context

4. **extractRelationshipData utility** (`frontend/src/lib/utils/relationshipDataExtractor.ts`)
   - Only checks `_metadata`
   - Does not handle direct properties on entity
   - Does not handle parent entity context
   - Does not handle pre-fetched data

### Issues

1. **Code Duplication**: ~40 lines of similar logic repeated in 3 places
2. **Maintenance Burden**: Changes require updates in multiple locations
3. **Inconsistent Behavior**: Each component may handle edge cases differently
4. **Testing Complexity**: Need to test extraction logic in multiple places
5. **Type Safety**: Duplicated type assertions and checks

### Impact

- **Risk Level**: Medium
  - Current duplication works but is fragile
  - Future changes may introduce inconsistencies
  - New components may duplicate logic again

- **Effort to Fix**: Small-Medium
  - ~2-3 hours to implement
  - ~1 hour to test
  - ~30 minutes to update documentation

- **Technical Debt**: Accumulating
  - Each new component that needs relationshipData may duplicate logic
  - Refactoring becomes harder over time

## Proposed Solution

### Architecture

Enhance the existing `extractRelationshipData` utility to handle all extraction scenarios in one place:

1. **Extract from `_metadata`** (current behavior)
2. **Check direct properties on entity** (for jingles from publicApi)
3. **Use parent entity context** (fabrica/cancion for jingles in RelatedEntities)
4. **Accept pre-fetched data** (for EntityList cached data)

### Implementation Plan

#### Step 1: Enhance Utility Function

**File**: `frontend/src/lib/utils/relationshipDataExtractor.ts`

**Changes**:
- Add `ExtractRelationshipDataOptions` interface
- Enhance `extractRelationshipData` function signature
- Implement all extraction strategies in priority order
- Maintain backward compatibility (options parameter is optional)

**New Interface**:
```typescript
export interface ExtractRelationshipDataOptions {
  /** Optional parent entity for context-dependent extraction */
  parentEntity?: Entity;
  /** Optional parent entity type */
  parentEntityType?: EntityType;
  /** Optional pre-fetched relationship data */
  preFetchedData?: Record<string, unknown>;
}
```

**Enhanced Function Signature**:
```typescript
export function extractRelationshipData(
  entity: Entity,
  entityType: EntityType,
  options?: ExtractRelationshipDataOptions
): Record<string, unknown> | undefined
```

**Extraction Priority** (in order):
1. Pre-fetched data (if provided)
2. `_metadata` (existing behavior)
3. Direct properties on entity (for jingles)
4. Parent entity context (for jingles in RelatedEntities)

#### Step 2: Update Components

**AdminEntityAnalyze** (`frontend/src/pages/admin/AdminEntityAnalyze.tsx`)
- Replace custom extraction logic (lines 337-361)
- Use: `extractRelationshipData(entity, entityType)`
- Remove: ~25 lines of custom logic

**EntityList** (`frontend/src/components/admin/EntityList.tsx`)
- Replace custom extraction logic (lines 348-375)
- Use: `extractRelationshipData(item, entityCardType, { preFetchedData: jingleRelationshipData[item.id] })`
- Remove: ~28 lines of custom logic

**RelatedEntities** (`frontend/src/components/common/RelatedEntities.tsx`)
- Replace custom extraction logic (lines 2076-2117)
- Use: `extractRelationshipData(relatedEntity, rel.entityType, { parentEntity: entity, parentEntityType: entityType })`
- Remove: ~42 lines of custom logic

#### Step 3: Update Tests

**File**: `frontend/src/lib/utils/__tests__/relationshipDataExtractor.test.ts` (create if needed)

**Test Cases**:
- Extract from `_metadata` (existing behavior)
- Extract from direct properties (jingle with cancion/autores directly on entity)
- Extract with parent entity context (jingle with fabrica parent)
- Extract with parent entity context (jingle with cancion parent)
- Extract with pre-fetched data
- Priority order (pre-fetched > _metadata > direct > parent)
- Backward compatibility (no options parameter)

#### Step 4: Update Documentation

**File**: `frontend/src/lib/utils/relationshipDataExtractor.ts` (JSDoc comments)

**Updates**:
- Document new options parameter
- Document extraction priority
- Add examples for each use case
- Document backward compatibility

## Detailed Implementation

### Enhanced Utility Function

```typescript
/**
 * Options for extracting relationship data
 */
export interface ExtractRelationshipDataOptions {
  /** 
   * Optional parent entity for context-dependent extraction.
   * Used when displaying entities in a parent context (e.g., jingles under fabrica/cancion).
   */
  parentEntity?: Entity;
  
  /** 
   * Optional parent entity type.
   * Required if parentEntity is provided.
   */
  parentEntityType?: EntityType;
  
  /** 
   * Optional pre-fetched relationship data.
   * Used when relationship data was fetched separately (e.g., EntityList cache).
   */
  preFetchedData?: Record<string, unknown>;
}

/**
 * Extracts relationshipData from an entity object for use with EntityCard component.
 * 
 * Extraction follows this priority order:
 * 1. Pre-fetched data (if provided)
 * 2. _metadata (standard API response format)
 * 3. Direct properties on entity (for jingles from publicApi.getJingle())
 * 4. Parent entity context (for jingles displayed under fabrica/cancion)
 * 
 * @param entity - The entity object (may include _metadata or direct properties)
 * @param entityType - The type of entity
 * @param options - Optional extraction options (parent context, pre-fetched data)
 * @returns relationshipData object or undefined if no data available
 * 
 * @example
 * // Basic usage (backward compatible)
 * const relationshipData = extractRelationshipData(artista, 'artista');
 * 
 * @example
 * // With parent entity context (RelatedEntities)
 * const relationshipData = extractRelationshipData(
 *   jingle, 
 *   'jingle',
 *   { parentEntity: cancion, parentEntityType: 'cancion' }
 * );
 * 
 * @example
 * // With pre-fetched data (EntityList)
 * const relationshipData = extractRelationshipData(
 *   jingle,
 *   'jingle',
 *   { preFetchedData: cachedRelationshipData }
 * );
 */
export function extractRelationshipData(
  entity: Entity,
  entityType: EntityType,
  options?: ExtractRelationshipDataOptions
): Record<string, unknown> | undefined {
  const { parentEntity, parentEntityType, preFetchedData } = options || {};
  
  // Start with pre-fetched data if available (highest priority)
  let data: Record<string, unknown> = preFetchedData ? { ...preFetchedData } : {};
  
  // Extract from _metadata (standard API response format)
  const entityWithMetadata = entity as EntityWithMetadata;
  if (entityWithMetadata._metadata) {
    const metadata = entityWithMetadata._metadata;
    
    switch (entityType) {
      case 'artista': {
        if (metadata.autorCount !== undefined) data.autorCount = metadata.autorCount;
        if (metadata.jingleroCount !== undefined) data.jingleroCount = metadata.jingleroCount;
        break;
      }
      case 'cancion': {
        if (metadata.jingleCount !== undefined) data.jingleCount = metadata.jingleCount;
        if (metadata.autores && Array.isArray(metadata.autores) && metadata.autores.length > 0) {
          data.autores = metadata.autores;
        }
        break;
      }
      case 'jingle': {
        if (metadata.fabrica) data.fabrica = metadata.fabrica;
        if (metadata.cancion) data.cancion = metadata.cancion;
        if (metadata.autores && Array.isArray(metadata.autores) && metadata.autores.length > 0) {
          data.autores = metadata.autores;
        }
        if (metadata.jingleros && Array.isArray(metadata.jingleros) && metadata.jingleros.length > 0) {
          data.jingleros = metadata.jingleros;
        }
        break;
      }
    }
  }
  
  // For jingles, also check if relationship data is directly on the entity
  // (common when fetched via publicApi.getJingle() which includes relationships directly)
  if (entityType === 'jingle') {
    const jingle = entity as Jingle & { 
      fabrica?: Fabrica; 
      cancion?: Cancion; 
      autores?: Artista[]; 
      jingleros?: Artista[]; 
      tematicas?: Tematica[] 
    };
    
    // Only add if not already present (pre-fetched or _metadata takes precedence)
    if (!data.fabrica && 'fabrica' in jingle && jingle.fabrica) {
      data.fabrica = jingle.fabrica;
    }
    if (!data.cancion && 'cancion' in jingle && jingle.cancion) {
      data.cancion = jingle.cancion;
    }
    if (!data.autores && 'autores' in jingle && Array.isArray(jingle.autores) && jingle.autores.length > 0) {
      data.autores = jingle.autores;
    }
    if (!data.jingleros && 'jingleros' in jingle && Array.isArray(jingle.jingleros) && jingle.jingleros.length > 0) {
      data.jingleros = jingle.jingleros;
    }
    if ('tematicas' in jingle && Array.isArray(jingle.tematicas) && jingle.tematicas.length > 0) {
      data.tematicas = jingle.tematicas;
    }
    
    // Context-dependent: Use parent entity data when available
    // This allows EntityCard to use parent context for enhanced display
    if (parentEntity && parentEntityType === 'fabrica') {
      // When jingles are displayed under a fabrica, use the fabrica for date display
      data.fabrica = parentEntity as Fabrica;
    }
    
    if (parentEntity && parentEntityType === 'cancion') {
      // When jingles are displayed under a cancion, use the cancion and its autores for title formatting
      const cancion = parentEntity as Cancion;
      data.cancion = cancion;
      
      // Extract autores from cancion's _metadata or direct property
      if (!data.autores) {
        if (cancion._metadata?.autores && Array.isArray(cancion._metadata.autores) && cancion._metadata.autores.length > 0) {
          data.autores = cancion._metadata.autores;
        } else if ('autores' in cancion && Array.isArray((cancion as any).autores) && (cancion as any).autores.length > 0) {
          data.autores = (cancion as any).autores;
        }
      }
    }
  }
  
  return Object.keys(data).length > 0 ? data : undefined;
}
```

### Component Updates

#### AdminEntityAnalyze.tsx

**Before** (lines 337-361):
```typescript
const relationshipData = useMemo(() => {
  if (!entity) return undefined;
  // First try to extract from _metadata
  const extracted = extractRelationshipData(entity, entityType);
  if (extracted) return extracted;
  
  // For jingles, also check if relationship data is directly on the entity (from publicApi)
  if (entityType === 'jingle') {
    const jingle = entity as Jingle & { cancion?: Cancion; autores?: Artista[]; fabrica?: Fabrica; jingleros?: Artista[]; tematicas?: Tematica[] };
    const data: Record<string, unknown> = {};
    if (jingle.cancion) data.cancion = jingle.cancion;
    if (jingle.autores && Array.isArray(jingle.autores) && jingle.autores.length > 0) {
      data.autores = jingle.autores;
    }
    if (jingle.fabrica) data.fabrica = jingle.fabrica;
    if (jingle.jingleros && Array.isArray(jingle.jingleros) && jingle.jingleros.length > 0) {
      data.jingleros = jingle.jingleros;
    }
    if (jingle.tematicas && Array.isArray(jingle.tematicas) && jingle.tematicas.length > 0) {
      data.tematicas = jingle.tematicas;
    }
    return Object.keys(data).length > 0 ? data : undefined;
  }
  
  return undefined;
}, [entity, entityType]);
```

**After**:
```typescript
const relationshipData = useMemo(() => {
  if (!entity) return undefined;
  return extractRelationshipData(entity, entityType);
}, [entity, entityType]);
```

#### EntityList.tsx

**Before** (lines 348-375):
```typescript
{items.map((item) => {
  // Extract relationship data - first try from _metadata
  let relationshipData = extractRelationshipData(item, entityCardType);
  
  // For jingles, if _metadata is not available, check fetched relationship data or entity directly
  if (entityCardType === 'jingle' && !relationshipData) {
    // First check if we fetched relationship data for this jingle
    if (jingleRelationshipData[item.id]) {
      relationshipData = jingleRelationshipData[item.id];
    } else {
      // Fallback: check if relationship data is directly on entity
      const jingle = item as Jingle & { cancion?: Cancion; autores?: Artista[]; fabrica?: Fabrica; jingleros?: Artista[]; tematicas?: Tematica[] };
      const data: Record<string, unknown> = {};
      if (jingle.cancion) data.cancion = jingle.cancion;
      if (jingle.autores && Array.isArray(jingle.autores) && jingle.autores.length > 0) {
        data.autores = jingle.autores;
      }
      if (jingle.fabrica) data.fabrica = jingle.fabrica;
      if (jingle.jingleros && Array.isArray(jingle.jingleros) && jingle.jingleros.length > 0) {
        data.jingleros = jingle.jingleros;
      }
      if (jingle.tematicas && Array.isArray(jingle.tematicas) && jingle.tematicas.length > 0) {
        data.tematicas = jingle.tematicas;
      }
      if (Object.keys(data).length > 0) {
        relationshipData = data;
      }
    }
  }
  
  return (
    // ... EntityCard render
  );
})}
```

**After**:
```typescript
{items.map((item) => {
  const relationshipData = extractRelationshipData(
    item, 
    entityCardType,
    { preFetchedData: jingleRelationshipData[item.id] }
  );
  
  return (
    // ... EntityCard render
  );
})}
```

#### RelatedEntities.tsx

**Before** (lines 2076-2117):
```typescript
const relationshipData: Record<string, unknown> | undefined = (() => {
  // First, try using the centralized utility
  let data = extractRelationshipData(relatedEntity, rel.entityType) || {};
  
  // Special case handling for Jingle: fabrica, cancion, autores from entity object or parent
  if (rel.entityType === 'jingle') {
    const jingle = relatedEntity as Jingle & { fabrica?: Fabrica; cancion?: Cancion; autores?: Artista[]; jingleros?: Artista[]; tematicas?: Tematica[] };
    // Check if relationship data is embedded in the entity object
    // Note: these are not in the Jingle type, but may be added by backend
    if ('fabrica' in jingle && jingle.fabrica) {
      data = { ...data, fabrica: jingle.fabrica };
    }
    if ('cancion' in jingle && jingle.cancion) {
      data = { ...data, cancion: jingle.cancion };
    }
    if ('autores' in jingle && jingle.autores && Array.isArray(jingle.autores) && jingle.autores.length > 0) {
      data = { ...data, autores: jingle.autores };
    }
    if ('jingleros' in jingle && jingle.jingleros && Array.isArray(jingle.jingleros) && jingle.jingleros.length > 0) {
      data = { ...data, jingleros: jingle.jingleros };
    }
    if ('tematicas' in jingle && jingle.tematicas && Array.isArray(jingle.tematicas) && jingle.tematicas.length > 0) {
      data = { ...data, tematicas: jingle.tematicas };
    }
    // If the parent entity (root entity) is a Fabrica, pass the full Fabrica object
    // This allows EntityCard to use the Fabrica's date when Jingle doesn't have fabricaDate
    if (entityType === 'fabrica') {
      data = { ...data, fabrica: entity };
    }
    // If the parent entity (root entity) is a Cancion, pass the Cancion and its autores
    // This allows EntityCard to format jingle title as "{cancion} ({autor})" when title/songTitle are blank
    if (entityType === 'cancion') {
      const cancion = entity as Cancion;
      data = { ...data, cancion: cancion };
      // Extract autores from cancion's _metadata or check if they're directly on the entity
      if (cancion._metadata?.autores && Array.isArray(cancion._metadata.autores) && cancion._metadata.autores.length > 0) {
        data = { ...data, autores: cancion._metadata.autores };
      } else if ('autores' in cancion && Array.isArray((cancion as any).autores) && (cancion as any).autores.length > 0) {
        data = { ...data, autores: (cancion as any).autores };
      }
    }
  }
  
  return Object.keys(data).length > 0 ? data : undefined;
})();
```

**After**:
```typescript
const relationshipData = extractRelationshipData(
  relatedEntity,
  rel.entityType,
  { parentEntity: entity, parentEntityType: entityType }
);
```

## Benefits

### 1. Single Source of Truth
- All extraction logic in one place
- Consistent behavior across all components
- Easier to understand and maintain

### 2. Reduced Code Duplication
- Remove ~95 lines of duplicated logic
- Replace with ~3-5 lines per component
- Net reduction: ~80-85 lines

### 3. Improved Maintainability
- Changes to extraction logic only need to be made once
- Easier to add new extraction strategies
- Clearer code organization

### 4. Better Type Safety
- Centralized type assertions
- Consistent type handling
- Single place for type updates

### 5. Enhanced Testability
- Single function to test
- Clear test cases for each scenario
- Easier to achieve full coverage

### 6. Backward Compatibility
- Existing code continues to work
- Options parameter is optional
- No breaking changes

## Risks and Mitigation

### Risk 1: Breaking Existing Behavior
**Likelihood**: Low  
**Impact**: High  
**Mitigation**:
- Maintain backward compatibility (options parameter optional)
- Comprehensive test coverage
- Gradual migration (one component at a time)
- Manual testing in each context

### Risk 2: Performance Impact
**Likelihood**: Very Low  
**Impact**: Low  
**Mitigation**:
- Extraction logic is simple object operations
- No additional API calls
- Performance should be equivalent or better (less code to execute)

### Risk 3: Missing Edge Cases
**Likelihood**: Medium  
**Impact**: Medium  
**Mitigation**:
- Review all current extraction logic before consolidation
- Test all three component contexts
- Manual testing in each scenario

## Testing Strategy

### Unit Tests
- Test extraction from `_metadata`
- Test extraction from direct properties
- Test extraction with parent entity (fabrica)
- Test extraction with parent entity (cancion)
- Test extraction with pre-fetched data
- Test priority order
- Test backward compatibility (no options)

### Integration Tests
- Test AdminEntityAnalyze with various entity types
- Test EntityList with jingles (with and without cache)
- Test RelatedEntities with jingles under fabrica
- Test RelatedEntities with jingles under cancion

### Manual Testing Checklist
- [ ] AdminEntityAnalyze: View jingle entity
- [ ] AdminEntityAnalyze: View cancion entity
- [ ] EntityList: View jingles list
- [ ] RelatedEntities: View jingles under fabrica
- [ ] RelatedEntities: View jingles under cancion
- [ ] Verify jingle title fallback logic works in all contexts

## Migration Plan

### Phase 1: Enhance Utility (No Breaking Changes)
1. Add `ExtractRelationshipDataOptions` interface
2. Enhance `extractRelationshipData` function
3. Add comprehensive tests
4. Verify backward compatibility

### Phase 2: Migrate Components (One at a Time)
1. **AdminEntityAnalyze** (simplest, no dependencies)
   - Update to use enhanced utility
   - Test manually
   - Verify behavior unchanged

2. **EntityList** (medium complexity, uses cache)
   - Update to use enhanced utility with preFetchedData
   - Test manually
   - Verify behavior unchanged

3. **RelatedEntities** (most complex, uses parent context)
   - Update to use enhanced utility with parentEntity
   - Test manually
   - Verify behavior unchanged

### Phase 3: Cleanup
1. Remove any remaining duplicate code
2. Update documentation
3. Add JSDoc examples
4. Update component documentation

## Success Criteria

- [ ] All three components use centralized utility
- [ ] No duplicate extraction logic remains
- [ ] All existing behavior preserved
- [ ] Tests pass (unit + integration)
- [ ] Manual testing confirms no regressions
- [ ] Documentation updated
- [ ] Code review approved

## Related Documentation

- **Component**: `docs/2_frontend_ui-design-system/03_components/composite/entity-card.md`
- **Utility**: `frontend/src/lib/utils/relationshipDataExtractor.ts`
- **Playbook**: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_04_PLAN_REFACTOR.md`

## Approval

**Status**: Pending  
**Proposed By**: AI Assistant  
**Date**: 2025-12-05  
**Requires Approval From**: Technical Lead / Product Owner

---

## Change History

| Date | Author | Change |
|------|--------|--------|
| 2025-12-05 | AI Assistant | Initial proposal created |

