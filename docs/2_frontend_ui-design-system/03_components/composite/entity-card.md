# Component: EntityCard

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-12-02
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:1-591`

## Overview

EntityCard displays a compact, navigable card for any entity type. Used in lists, search results, and related-entities displays. Supports multiple variants for different contexts.

## Design Intent
- **Current**: Complex component with multiple variants (heading, contents, placeholder) supporting admin and public contexts
- **Target**: Enhanced contents variant provides clearer information display for Jingles, Artista, and Cancion entities
- **Last Updated**: 2025-12-02
- **Design Intent Document**: See `entity-card-contents-variant-enhancement.md` for detailed design intent and backend/API considerations
- **Change Summary**: 
  - Jingles now show autoComment and all boolean props as badges in contents variant
  - Artista shows differentiated icons based on relationship types and relationship counts
  - Cancion shows autor information and jingle count in contents variant

## Variants

### Heading Variant
- **Usage**: Title rows in table structures, entity headers
- **Props**: `variant="heading"`
- **Visual Spec**: Displays entity as a header row with expand/collapse functionality
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:22-23`

### Contents Variant
- **Usage**: Content rows in table structures, default display
- **Props**: `variant="contents"` (default)
- **Visual Spec**: Displays entity as a content row with enhanced information display
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:22-23`

#### Entity-Specific Display (Contents Variant)

**Jingle Entities:**
- **Primary Text**: Title or songTitle (fallback to id)
- **Secondary Text**: Fabrica date or "INEDITO"
- **Badges**: 
  - `autoComment` prop displayed as badge (if available)
  - Boolean props displayed as badges when true:
    - `isJinglazo` → "JINGLAZO"
    - `isJinglazoDelDia` → "JDD"
    - `isPrecario` → "PREC"
    - `isLive` → "VIVO"
    - `isRepeat` → "CLASICO"
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:73-95`, `frontend/src/lib/utils/entityDisplay.ts:156-170`

**Artista Entities:**
- **Icon**: Context-dependent based on relationship types:
  - 👤 (default): Has BOTH or NEITHER AUTOR_DE and JINGLERO_DE relationships
  - 🚚: Has at least one AUTOR_DE but no JINGLERO_DE
  - 🔧: Has at least one JINGLERO_DE but no AUTOR_DE
- **Primary Text**: `stageName` (or `name` if stageName is empty, fallback to id)
- **Secondary Text**: 
  - `name` if different from `stageName`
  - "ARG" tag if `isArg` is true
  - "📦: #" with AUTOR_DE count (if available)
  - "🎤: #" with JINGLERO_DE count (if available)
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:68-125`, `frontend/src/lib/utils/entityDisplay.ts:178-210`

**Cancion Entities:**
- **Primary Text**: `title` (fallback to id)
- **Secondary Text**: 
  - Existing secondary properties (album, year)
  - "🚚: Autor" with autor name(s) (if available)
  - "🎤: #" with Jingle count (if available)
- **Code Reference**: `frontend/src/lib/utils/entityDisplay.ts:143-177`

**Other Entities (Fabrica, Tematica):**
- Display remains unchanged from previous implementation

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

