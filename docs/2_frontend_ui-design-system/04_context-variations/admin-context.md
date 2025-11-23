# Admin Context Variations

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-23
- **Purpose**: Document admin-specific design variations

## Overview

Admin context introduces additional controls, editing capabilities, and data management features. Components adapt their appearance and behavior when used in admin context.

## Component Variations

### EntityCard
- **Changes**: Shows admin edit button, admin navigation button, delete button in edit mode
- **Props**: `showAdminEditButton`, `showAdminNavButton`, `showDeleteButton`, `isEditing`
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:48-67`

### RelatedEntities
- **Changes**: Eager loading, no cycle prevention, blank rows for relationship creation
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx`

### EntityMetadataEditor
- **Changes**: Displays editable metadata fields for entities
- **Field Configuration**: Fields are configured via `FIELD_ORDER` in `fieldConfigs.ts`
- **New Fields**: `musicBrainzId` field available for `artistas` and `canciones` entity types (optional string, text input)
- **Code Reference**: `frontend/src/components/admin/EntityMetadataEditor.tsx`

## Visual Indicators

*To be documented as admin UI patterns are analyzed*

## Interaction Patterns

*To be documented as admin UI patterns are analyzed*

## Implementation

Admin-specific variations are controlled via props and context. Components check for admin mode and adjust their rendering accordingly.

## Related Documentation

- EntityCard component: `../03_components/composite/entity-card.md`
- Admin page template: `../02_layout-patterns/page-templates/admin-page.md`

