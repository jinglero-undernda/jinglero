# Entity Inspection Rendering Patterns

**Status**: Active Patterns Guide  
**Date**: 2025-01-06  
**Area**: UI Design System - Component Patterns  
**Related Components**: `RelatedEntities.tsx`, `EntityCard.tsx`  
**Related Specifications**: `GuestEntity_Inspection_Specification.md`, `WORKFLOW_008_entity-inspection.md`  
**Purpose**: Document reusable patterns discovered during Fabrica entity inspection implementation for efficient resolution of similar issues across other entity types

---

## Overview

This document captures the rendering patterns and implementation strategies discovered during the Fabrica entity inspection debugging session. These patterns apply to all entity types and should be referenced when implementing or fixing entity inspection pages.

**Key Principle**: Entity inspection pages follow a consistent pattern of Level 0 (heading) and Level 1 (nested) rows, with specific behaviors for expand/collapse, navigation, and nested content rendering.

---

## Table of Contents

1. [Pattern 1: Direct Entity Rendering vs. Expandable Group Rows](#pattern-1-direct-entity-rendering-vs-expandable-group-rows)
2. [Pattern 2: Row Click Behavior (Expand vs. Navigate)](#pattern-2-row-click-behavior-expand-vs-navigate)
3. [Pattern 3: CTR Monitor Rendering in Nested Blocks](#pattern-3-ctr-monitor-rendering-in-nested-blocks)
4. [Pattern 4: Nested Entity Filtering](#pattern-4-nested-entity-filtering)
5. [Pattern 5: Secondary Content Visibility](#pattern-5-secondary-content-visibility)
6. [Pattern 6: Spacing After Nested Blocks](#pattern-6-spacing-after-nested-blocks)
7. [Quick Reference Checklist](#quick-reference-checklist)
8. [Implementation Examples](#implementation-examples)

---

## Pattern 1: Direct Entity Rendering vs. Expandable Group Rows

### When to Use

Some relationships should render entities **directly as Level 0 rows** instead of showing an expandable group row. This pattern is used when:

- The relationship contains many entities that should be immediately visible
- The specification (`GuestEntity_Inspection_Specification.md`) shows entities directly under the heading
- User experience benefits from immediate visibility (e.g., `Fabrica→Jingles`)

### Configuration

In `relationshipConfigs.ts`, set `expandable: false`:

```typescript
export function getFabricaRelationships(): RelationshipConfig[] {
  return [
    {
      label: "Jingles",
      entityType: "jingle",
      sortKey: "timestamp",
      expandable: false, // ← Key setting: renders directly, no group row
      fetchFn: (entityId: string, _entityType: string) =>
        fetchFabricaJingles(entityId),
    },
  ];
}
```

### Implementation

In `RelatedEntities.tsx`, add special-case rendering logic:

```typescript
// Special case: Fabrica→Jingles renders jingles directly (no group row)
{
  entityType === "fabrica" &&
    rel.label === "Jingles" &&
    entities.map((jingle) => (
      <div key={jingle.id} className="related-entities__row">
        <EntityCard
          entity={jingle}
          entityType="jingle"
          variant="contents"
          indentationLevel={0} // Render as Level 0
          hasNestedEntities={true} // Now expandable
          isExpanded={state.expandedEntities.has(jingle.id)}
          onClick={() => handleToggleEntity(jingle)} // Row click expands
          showUserNavButton={true} // Nav icon for navigation
          onUserNavClick={() => onNavigateToEntity?.("jingle", jingle.id)}
          // ... other props
        />
        {/* Nested blocks when expanded */}
      </div>
    ));
}
```

### Examples

- ✅ **Fabrica→Jingles**: Renders jingles directly (no "Jingles" group row)
- ❌ **Jingle→Fabrica**: Shows "Fabrica" as expandable group row (single entity, but still uses group pattern)

### Related Files

- `frontend/src/lib/utils/relationshipConfigs.ts` - Configuration
- `frontend/src/components/common/RelatedEntities.tsx` - Rendering logic

---

## Pattern 2: Row Click Behavior (Expand vs. Navigate)

### When to Use

Rows with nested entities should **expand/collapse on click**; navigation should use a separate button. This provides clear UX separation between exploration (expand) and navigation (click icon).

### Implementation

For expandable rows (Level 0 with nested entities):

```typescript
<EntityCard
  entity={entity}
  entityType={entityType}
  variant="contents"
  indentationLevel={0}
  hasNestedEntities={true} // ← Enables expand/collapse
  isExpanded={state.expandedEntities.has(entity.id)}
  onClick={() => handleToggleEntity(entity)} // ← Row click expands
  showUserNavButton={true} // ← Separate nav button
  onUserNavClick={() => onNavigateToEntity?.(entityType, entity.id)}
  to={undefined} // ← Critical: prevents default navigation
  // ... other props
/>
```

### Key Points

1. **`to={undefined}`**: When `onClick` is present for expansion, explicitly set `to={undefined}` to prevent default navigation
2. **`showUserNavButton={true}`**: Provides dedicated navigation icon (🔍) for users who want to navigate
3. **`hasNestedEntities={true}`**: Enables expand/collapse UI (chevron icon)

### EntityCard Logic

In `EntityCard.tsx`, the route calculation should respect `onClick`:

```typescript
const route = showAdminEditButton
  ? undefined
  : to ||
    (onClick ? undefined : getEntityRoute(entityType, entity.id, routeVariant));
// ↑ If onClick is present, route is undefined (prevents navigation)
```

### Examples

- ✅ **Jingle row under Fabrica**: Click expands to show nested entities; 🔍 icon navigates
- ✅ **Fabrica row under Jingle**: Click expands to show nested jingles; 🔍 icon navigates

### Related Files

- `frontend/src/components/common/EntityCard.tsx` - Route/clickability logic
- `frontend/src/components/common/RelatedEntities.tsx` - Click handlers

---

## Pattern 3: CTR Monitor Rendering in Nested Blocks

### When to Use

Embedded CTR monitors appear in nested blocks per `GuestEntity_Inspection_Specification.md`. They use **limited height** (not full width) and are positioned within the nested content area.

### Implementation

```typescript
// Get video source with fallback
const fabricaForCTR = jingle.fabrica;
const videoIdOrUrl = fabricaForCTR?.youtubeUrl || fabricaForCTR?.id || null;
const startSeconds =
  fabricaForCTR?.timestamp !== undefined
    ? normalizeTimestampToSeconds(fabricaForCTR.timestamp) || 0
    : 0;

// Render in nested blocks
<div
  className="related-entities__nested-blocks"
  style={{ marginLeft: "16px", marginTop: "8px", marginBottom: "16px" }}
>
  {/* Embedded/compact CTR monitor (limited height) */}
  {videoIdOrUrl && (
    <div
      style={{
        marginBottom: "12px",
        maxHeight: "200px", // ← Limited height
        aspectRatio: "16 / 9",
        position: "relative",
      }}
    >
      <CRTMonitorPlayer
        videoIdOrUrl={videoIdOrUrl}
        startSeconds={startSeconds}
        autoplay={false}
        style={{ height: "100%", minHeight: "100px", minWidth: "150px" }}
      />
    </div>
  )}
  {/* Nested entity blocks follow */}
</div>;
```

### Key Points

1. **Fallback logic**: Use `youtubeUrl || id` as fallback (some entities may not have `youtubeUrl`)
2. **Limited height**: `maxHeight: '200px'` for embedded monitors (vs. full width on heading)
3. **Aspect ratio**: Maintain `16 / 9` for video player
4. **Min dimensions**: `minHeight: '100px', minWidth: '150px'` prevents layout collapse

### Examples

- ✅ **Fabrica→Jingles (expanded)**: Shows CTR monitor with limited height
- ✅ **Cancion→Jingles (expanded)**: Shows CTR monitor with limited height
- ✅ **Jingle (heading)**: Shows CTR monitor full width (different pattern)

### Related Files

- `frontend/src/components/production-belt/CRTMonitorPlayer.tsx` - Player component
- `frontend/src/components/common/RelatedEntities.tsx` - Rendering logic

---

## Pattern 4: Nested Entity Filtering

### When to Use

Only specific entity types should appear in nested blocks, as defined by `GuestEntity_Inspection_Specification.md`. This prevents showing irrelevant relationships and keeps the UI focused.

### Implementation

Explicitly render only allowed entity types:

```typescript
// Fabrica→Jingles nested block: Only Cancion, Autor, Jinglero, Tematicas
{
  isFabricaJingles && (
    <>
      {cancion && (
        <EntityCard
          entity={cancion}
          entityType="cancion"
          relationshipLabel="Cancion"
          variant="contents"
          indentationLevel={1}
          // ... other props
        />
      )}
      {autores &&
        autores.length > 0 &&
        autores.map((autor) => (
          <EntityCard
            entity={autor}
            entityType="artista"
            relationshipLabel="Autor"
            variant="contents"
            indentationLevel={1}
            // ... other props
          />
        ))}
      {jingleros &&
        jingleros.length > 0 &&
        jingleros.map((jinglero) => (
          <EntityCard
            entity={jinglero}
            entityType="artista"
            relationshipLabel="Jinglero"
            variant="contents"
            indentationLevel={1}
            // ... other props
          />
        ))}
      {tematicas &&
        tematicas.length > 0 &&
        tematicas.map((tematica) => (
          <EntityCard
            entity={tematica}
            entityType="tematica"
            relationshipLabel="Tematicas"
            variant="contents"
            indentationLevel={1}
            // ... other props
          />
        ))}
    </>
  );
}
```

### Reference Specification

Check `GuestEntity_Inspection_Specification.md` for each entity type's allowed nested entities:

- **Fabrica→Jingles**: Cancion, Autor, Jinglero, Tematica
- **Cancion→Jingles**: Fabrica, Jingleros, Tematicas
- **Jingle→Cancion**: Autores, Jingles
- **Jingle→Fabrica**: Jingles (including parent)
- **Artista→Canciones**: CTR monitor, Jingles
- **Artista→Jingles**: CTR monitor, Canciones
- **Tematica→Jingles**: Fabrica, Cancion, Jingleros, Tematicas

### Key Points

1. **Explicit filtering**: Don't render all available relationships; only those in spec
2. **Conditional rendering**: Check for existence (`cancion && ...`) and length (`autores.length > 0`)
3. **Relationship labels**: Use `relationshipLabel` prop to show context (e.g., "Autor" vs "Jinglero" for `artista` type)

### Related Files

- `docs/1_frontend_ux-workflows/workflows/guest-experience/GuestEntity_Inspection_Specification.md` - Specification
- `frontend/src/components/common/RelatedEntities.tsx` - Filtering logic

---

## Pattern 5: Secondary Content Visibility

### When to Use

When a row is expanded, hide the `displaySecondary` text to reduce visual clutter and focus attention on the nested content.

### Implementation

```typescript
<EntityCard
  entity={entity}
  entityType={entityType}
  variant="contents"
  displaySecondary={isExpanded ? "" : entity.displaySecondary}
  // ↑ Hide secondary when expanded
  isExpanded={isExpanded}
  // ... other props
/>
```

### Alternative: EntityCard Internal Logic

If the pattern is consistent, `EntityCard` could handle this internally:

```typescript
// In EntityCard.tsx
const displaySecondaryValue =
  isExpanded && hasNestedEntities
    ? ""
    : displaySecondary ?? entity?.displaySecondary ?? "";
```

### Examples

- ✅ **Expanded jingle row**: Secondary text hidden, nested entities visible
- ✅ **Collapsed jingle row**: Secondary text visible (e.g., "3 entidades")

### Related Files

- `frontend/src/components/common/EntityCard.tsx` - Display logic
- `frontend/src/components/common/RelatedEntities.tsx` - State management

---

## Pattern 6: Spacing After Nested Blocks

### When to Use

Add extra margin after the last Level 1 row, before the next Level 0 item, to create clear visual separation between expanded sections.

### Implementation

```typescript
<div
  className="related-entities__nested-blocks"
  style={{
    marginLeft: "16px",
    marginTop: "8px",
    marginBottom: "16px", // ← Extra spacing after nested block
  }}
>
  {/* Nested content */}
</div>
```

### Key Points

1. **Visual separation**: Helps users distinguish between different expanded sections
2. **Consistent spacing**: Use `16px` for consistency with design system
3. **Applied to container**: Margin on the nested blocks container, not individual items

### Examples

- ✅ **Fabrica→Jingles**: After expanded jingle's nested block, clear gap before next jingle row
- ✅ **Jingle→Cancion**: After expanded cancion's nested block, clear gap before next relationship

### Related Files

- `frontend/src/components/common/RelatedEntities.tsx` - Spacing styles
- `frontend/src/styles/components/related-entities.css` - CSS classes

---

## Quick Reference Checklist

When implementing or fixing entity inspection for a new entity type or relationship:

### Pre-Implementation

- [ ] Check `GuestEntity_Inspection_Specification.md` for nested structure
- [ ] Review `WORKFLOW_008_entity-inspection.md` for expected behavior
- [ ] Identify which relationships should render directly vs. as group rows

### Configuration

- [ ] Configure `relationshipConfigs.ts` with appropriate `expandable` flag
- [ ] Set `expandable: false` for direct rendering relationships
- [ ] Verify `fetchFn` is correctly implemented in `relationshipService.ts`

### Rendering Logic

- [ ] Implement direct rendering logic (if needed) in `RelatedEntities.tsx`
- [ ] Add nested entity filtering (only allowed types per spec)
- [ ] Implement CTR monitor rendering (if specified in spec)
- [ ] Set correct `indentationLevel` (0 for direct, 1 for nested)

### Interaction Behavior

- [ ] Configure row click to expand/collapse (not navigate)
- [ ] Set `to={undefined}` when `onClick` is present
- [ ] Add `showUserNavButton={true}` for navigation
- [ ] Test expand/collapse state management

### Visual Polish

- [ ] Hide `displaySecondary` when row is expanded
- [ ] Add `marginBottom: '16px'` to nested blocks container
- [ ] Verify CTR monitor sizing (limited height for nested, full width for heading)
- [ ] Check spacing and indentation consistency

### Testing

- [ ] Verify Level 0 rows are collapsed on load (not expanded)
- [ ] Test expand/collapse behavior
- [ ] Verify navigation icon works correctly
- [ ] Check nested entities match specification
- [ ] Verify CTR monitor appears (if applicable)
- [ ] Test with multiple expanded sections (spacing)

---

## Implementation Examples

### Example 1: Fabrica→Jingles (Direct Rendering)

**Configuration** (`relationshipConfigs.ts`):

```typescript
{
  label: 'Jingles',
  entityType: 'jingle',
  sortKey: 'timestamp',
  expandable: false, // Direct rendering
  fetchFn: (entityId: string) => fetchFabricaJingles(entityId),
}
```

**Rendering** (`RelatedEntities.tsx`):

```typescript
{
  entityType === "fabrica" &&
    rel.label === "Jingles" &&
    entities.map((jingle) => (
      <div key={jingle.id} className="related-entities__row">
        <EntityCard
          entity={jingle}
          entityType="jingle"
          variant="contents"
          indentationLevel={0}
          hasNestedEntities={true}
          isExpanded={state.expandedEntities.has(jingle.id)}
          onClick={() => handleToggleEntity(jingle)}
          showUserNavButton={true}
          onUserNavClick={() => onNavigateToEntity?.("jingle", jingle.id)}
          displaySecondary={
            state.expandedEntities.has(jingle.id) ? "" : jingle.displaySecondary
          }
          to={undefined}
        />
        {state.expandedEntities.has(jingle.id) && (
          <div
            className="related-entities__nested-blocks"
            style={{
              marginLeft: "16px",
              marginTop: "8px",
              marginBottom: "16px",
            }}
          >
            {/* CTR monitor */}
            {fabricaForCTR &&
              (fabricaForCTR.youtubeUrl || fabricaForCTR.id) && (
                <div
                  style={{
                    marginBottom: "12px",
                    maxHeight: "200px",
                    aspectRatio: "16 / 9",
                  }}
                >
                  <CRTMonitorPlayer
                    videoIdOrUrl={fabricaForCTR.youtubeUrl || fabricaForCTR.id}
                    startSeconds={
                      normalizeTimestampToSeconds(fabricaForCTR.timestamp) || 0
                    }
                    autoplay={false}
                  />
                </div>
              )}
            {/* Nested entities: Cancion, Autor, Jinglero, Tematica */}
            {cancion && (
              <EntityCard
                entity={cancion}
                entityType="cancion"
                relationshipLabel="Cancion"
                variant="contents"
                indentationLevel={1}
              />
            )}
            {/* ... other nested entities ... */}
          </div>
        )}
      </div>
    ));
}
```

### Example 2: Jingle→Fabrica (Group Row)

**Configuration** (`relationshipConfigs.ts`):

```typescript
{
  label: 'Fabrica',
  entityType: 'fabrica',
  sortKey: 'date',
  expandable: true, // Group row
  fetchFn: (entityId: string) => fetchJingleFabrica(entityId),
  maxCardinality: 1,
}
```

**Rendering** (`RelatedEntities.tsx`):

```typescript
// Uses standard group row rendering (no special case needed)
// Group row expands to show nested jingles
```

---

## Future Enhancements

### Proposed: Configuration-Driven Patterns

Instead of hardcoded special cases, consider adding metadata to `RelationshipConfig`:

```typescript
export interface RelationshipConfig {
  // ... existing fields ...

  // Rendering behavior flags
  renderDirectly?: boolean; // If true, render entities directly (no group row)
  nestedEntityTypes?: EntityType[]; // Allowed nested entity types (for filtering)
  showCTRInNested?: boolean; // Show CTR monitor in nested blocks
  ctrVideoSource?: "fabrica" | "jingle" | "cancion"; // Source for CTR video
}
```

### Proposed: Helper Functions

Create reusable helper functions:

```typescript
/**
 * Determines if a relationship should render entities directly
 */
function shouldRenderDirectly(
  entityType: EntityType,
  relationshipLabel: string,
  relationshipConfig: RelationshipConfig
): boolean {
  if (relationshipConfig.renderDirectly !== undefined) {
    return relationshipConfig.renderDirectly;
  }
  // Pattern matching logic...
  return false;
}

/**
 * Gets allowed nested entity types for a relationship
 */
function getAllowedNestedEntityTypes(
  entityType: EntityType,
  relationshipLabel: string
): EntityType[] {
  // Pattern matching logic based on spec...
}
```

---

## Related Documentation

- `docs/1_frontend_ux-workflows/workflows/guest-experience/GuestEntity_Inspection_Specification.md` - Entity-specific specifications
- `docs/1_frontend_ux-workflows/workflows/guest-experience/WORKFLOW_008_entity-inspection.md` - User workflow
- `frontend/src/lib/utils/relationshipConfigs.ts` - Relationship configuration
- `frontend/src/components/common/RelatedEntities.tsx` - Main rendering component
- `frontend/src/components/common/EntityCard.tsx` - Entity card component

---

## Changelog

- **2025-01-06**: Initial document created from Fabrica entity inspection debugging session
