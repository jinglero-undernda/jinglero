# Component: EntityCard

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:1-591`

## Overview

EntityCard displays a compact, navigable card for any entity type. Used in lists, search results, and related-entities displays. Supports multiple variants for different contexts.

## Design Intent
- **Current**: Complex component with multiple variants (heading, contents, placeholder) supporting admin and public contexts
- **Target**: To be refined as target design is established

## Variants

### Heading Variant
- **Usage**: Title rows in table structures, entity headers
- **Props**: `variant="heading"`
- **Visual Spec**: Displays entity as a header row with expand/collapse functionality
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:22-23`

### Contents Variant
- **Usage**: Content rows in table structures, default display
- **Props**: `variant="contents"` (default)
- **Visual Spec**: Displays entity as a content row
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:22-23`

### Placeholder Variant
- **Usage**: Empty states, loading states
- **Props**: `variant="placeholder"`
- **Visual Spec**: Displays placeholder message
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:22-23`

## Context Variations

### Admin Context
- **Visual Changes**: Shows admin edit button, admin navigation button, delete button in edit mode
- **Props**: `showAdminEditButton`, `showAdminNavButton`, `showDeleteButton`, `isEditing`
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:48-67`

### Public Context
- **Visual Changes**: Standard display without admin controls
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:124-591`

### Relationship Context
- **Visual Changes**: Context-dependent icons based on relationshipLabel
- **Props**: `relationshipLabel`
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:40-41`

## State Variations

### Default State
- **Visual Spec**: Normal entity display

### Editing State
- **Visual Spec**: Shows edit controls, save button (when `isEditing={true}`)
- **Props**: `isEditing`, `hasUnsavedChanges`, `onSaveClick`
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:50-55`

### Expanded State
- **Visual Spec**: Shows expanded icon, nested entities count (when `isExpanded={true}`)
- **Props**: `isExpanded`, `hasNestedEntities`, `onToggleExpand`
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:33-37`

## Interactive States
- **Hover**: [To be documented]
- **Active**: [To be documented]
- **Disabled**: [To be documented]

## Props

Key props include:
- `entity`: Entity to display
- `entityType`: Type of entity (jingle, fabrica, cancion, artista, tematica)
- `variant`: Display variant (heading, contents, placeholder)
- `to`: Optional route destination (makes card clickable)
- `isEditing`: Whether in editing mode
- `isExpanded`: Whether expanded (for nested entities)
- `showAdminEditButton`: Show admin edit button
- `showDeleteButton`: Show delete button (admin edit mode)

See `frontend/src/components/common/EntityCard.tsx:17-68` for complete prop interface.

## Implementation Details
- **CSS File**: `frontend/src/styles/components/entity-card.css`
- **Dependencies**: Uses design tokens from theme, EntityCard styles
- **Related Components**: Used by RelatedEntities, EntityList, SearchResultsPage

## Usage Guidelines

- Use `heading` variant for table headers and entity titles
- Use `contents` variant for standard entity display (default)
- Use `placeholder` variant for empty states
- Provide `to` prop to make card navigable
- Use admin props only in admin context

## Code Reference

- **Component**: `frontend/src/components/common/EntityCard.tsx`
- **Styles**: `frontend/src/styles/components/entity-card.css`
- **Types**: `frontend/src/types/index.ts`

## Related Documentation

- Design tokens: `../../01_system-foundation/tokens/`
- Admin context: `../../04_context-variations/admin-context.md`
- Entity context: `../../04_context-variations/entity-context.md`

