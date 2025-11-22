# Component: REPEATS Relationship in RelatedEntities

## Status

- **Status**: draft
- **Last Updated**: 2025-01-28
- **Code Reference**: `frontend/src/lib/utils/relationshipConfigs.ts` (to be implemented)

## Overview

This document describes the design intent for displaying REPEATS relationships in the RelatedEntities component on Jingle entity detail pages. REPEATS relationships connect Jingles to track when one jingle is a repeat (repetido) of another, enabling data consistency between the latest "repeat" and the original instance.

## Design Intent

### Position in Relationship List

The REPEATS relationship section appears in the RelatedEntities component **between Jinglero and Tematicas** sections. This positioning reflects the logical flow of relationships on a Jingle detail page:

1. Fabrica
2. Cancion
3. Autor (read-only, derived)
4. Jinglero
5. **Versiones** (REPEATS) ← **New section**
6. Tematicas

### Relationship Configuration

**Label**: "Versiones"

**Entity Type**: `jingle` (self-referential relationship)

**Sort Key**: `date` (uses `fabricaDate` for sorting)

**Custom Sorting Behavior**:

- Primary sort: `fabricaDate` ascending (earliest first)
- Secondary sort: Ineditos (Jingles without `fabricaDate`) appear at the bottom
- Result: Original instance (earliest published) appears first, followed by other instances in chronological order, with unpublished (Inedito) Jingles at the end

**Expandable**: `true` (allows nested relationship exploration)

**Read-Only**: `false` (relationships can be created/edited)

**Max Cardinality**: `undefined` (unlimited - one Jingle can repeat multiple others)

### Display Behavior

#### Initial Instance Display

The relationship uses a 2-step traversal query to identify and display the "initial repeat" (original source):

1. **Find Initial Instance**: Traverse REPEATS chain backwards to find the Jingle with no inbound REPEATS relationships
2. **Display Order**: The initial instance appears first in the list, followed by other instances in chronological order

#### Entity Ordering

Entities are displayed in the following order:

1. **Published Jingles** (have `fabricaDate`):

   - Sorted by `fabricaDate` ascending (earliest first)
   - Original instance (no inbound REPEATS) appears first
   - Other instances follow in chronological order

2. **Inedito Jingles** (no `fabricaDate`):
   - Appear at the bottom of the list
   - Sorted by `createdAt` ascending (if both are Inedito)

#### Visual Treatment

- **No special visual treatment**: REPEATS relationships use the same EntityCard component and styling as other relationships
- **Icon**: Uses standard Jingle entity icon
- **Entity Type Indicator**: The icon in each row indicates it's a Jingle entity (self-explanatory, no sub-headings needed)

### Relationship Creation

#### Blank Row Display

- In Admin Mode: A blank row is shown when no REPEATS relationships exist
- In User Mode: The section is hidden when empty (following existing RelatedEntities behavior)

#### Creation Flow

1. User clicks blank row or "+ Agregar" button
2. Entity search autocomplete appears
3. User selects a Jingle to create REPEATS relationship with
4. Direction is automatically validated and corrected by the API:
   - If both published: Latest → Earliest (based on `fabricaDate`)
   - If one Inedito: Inedito → Published
   - If both Inedito: Later → Earlier (based on `createdAt`)
5. Transitive normalization is triggered automatically if needed
6. Relationship appears in the list, sorted according to the custom sorting rules

### Relationship Properties

REPEATS relationships have the following properties (editable in Admin Mode):

- **status**: `DRAFT` | `CONFIRMED` (default: `DRAFT`)
- **createdAt**: Timestamp (auto-managed)

Future properties may be added as needed (extensible design).

### Integration Points

#### RelatedEntities Component

- **File**: `frontend/src/components/common/RelatedEntities.tsx`
- **Configuration**: `frontend/src/lib/utils/relationshipConfigs.ts`
- **Service**: `frontend/src/lib/services/relationshipService.ts` (fetch function to be implemented)

#### Relationship Service

A new fetch function is required:

```typescript
fetchJingleRepeats: (jingleId: string) => Promise<Jingle[]>;
```

This function should:

1. Query REPEATS relationships (both inbound and outbound)
2. Use 2-step traversal to find initial instance
3. Return Jingles sorted by `fabricaDate` ascending (ineditos last)

#### EntityEdit Component

- **File**: `frontend/src/components/admin/EntityEdit.tsx`
- **Update**: Add `repeats` to `RELATIONSHIP_SCHEMA` mapping
- **Update**: Add REPEATS handling in relationship creation logic

#### InspectJingle Page

- **File**: `frontend/src/pages/inspect/InspectJingle.tsx`
- **Update**: Include REPEATS in `initialRelationshipData` if available from API

### API Integration

The REPEATS relationship uses the standard relationship CRUD endpoints:

- **Create**: `POST /api/admin/relationships/repeats`
- **Update**: `PUT /api/admin/relationships/repeats`
- **Delete**: `DELETE /api/admin/relationships/repeats`
- **List**: `GET /api/admin/relationships/repeats`

Direction validation and transitive normalization are handled automatically by the API layer.

### Special Considerations

#### Traversal Performance

For long REPEATS chains, traversal queries may need optimization:

- Consider caching initial instance lookups
- Limit traversal depth if needed
- Use efficient Neo4j queries for bidirectional traversal

#### Circular Reference Prevention

The UI should handle API errors gracefully if a circular reference is detected:

- Display user-friendly error message
- Prevent relationship creation that would create a cycle

#### Transitive Normalization Feedback

When transitive normalization occurs:

- The relationship list may update automatically
- User should see the normalized relationship (direct link to original)
- Intermediate relationships are removed/updated transparently

## Implementation Notes

### Relationship Config Example

```typescript
{
  label: 'Repetidos',
  entityType: 'jingle',
  sortKey: 'date', // Custom sort function needed
  expandable: true,
  fetchFn: (entityId: string, _entityType: string) => fetchJingleRepeats(entityId),
}
```

### Custom Sort Function

A custom sort function is needed to implement the sorting rules:

- Primary: `fabricaDate` ascending
- Secondary: Ineditos at bottom
- Tertiary: `createdAt` ascending for Ineditos

### Relationship Type Mapping

Update `getRelationshipTypeForAPI` in RelatedEntities.tsx:

```typescript
jingle: {
  // ... existing mappings
  jingle: 'repeats', // Add this for REPEATS
}
```

## Change History

- **2025-01-28**: Initial design intent documentation created (draft)
