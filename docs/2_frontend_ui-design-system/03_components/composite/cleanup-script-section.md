# Component: CleanupScriptSection

## Status
- **Status**: draft
- **Last Updated**: 2025-11-29
- **Code Reference**: `frontend/src/components/admin/CleanupScriptSection.tsx` (to be created)

## Overview

CleanupScriptSection groups cleanup scripts by entity type. It displays a section header and renders script buttons for that category.

**Workflow Reference**: See `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`

## Design Intent
- **Current**: To be implemented
- **Target**: Clear organization of scripts by entity type for easy navigation

## Variants

### Default Variant
- **Usage**: Standard section grouping
- **Visual Spec**: Section with header (entity type name), grid of script buttons
- **Code Reference**: `frontend/src/components/admin/CleanupScriptSection.tsx` (to be created)

## Context Variations

### Admin Context
- **Visual Changes**: Admin section styling, consistent with other admin sections
- **Code Reference**: `frontend/src/components/admin/CleanupScriptSection.tsx` (to be created)

## State Variations

### Default State
- **Visual Spec**: Section visible with all script buttons enabled
- No special state variations

## Interactive States
- **Hover**: Section header may show subtle hover effect
- **Active**: N/A (section is not interactive)
- **Disabled**: N/A (section is not disabled)

## Props

```typescript
interface CleanupScriptSectionProps {
  entityType: 'fabricas' | 'jingles' | 'canciones' | 'artistas' | 'general';
  scripts: ScriptMetadata[];
  onScriptClick: (scriptId: string) => void;
  runningScripts: Set<string>;
}
```

**Key Props**:
- `entityType`: Entity type category for this section
- `scripts`: Array of scripts in this category
- `onScriptClick`: Callback when a script button is clicked
- `runningScripts`: Set of currently running script IDs (for loading state)

## Component Structure

```
CleanupScriptSection
  ├── SectionHeader
  │   └── Entity Type Label
  └── ScriptsGrid
      └── CleanupScriptButton[]
```

## Implementation Details
- **Component File**: `frontend/src/components/admin/CleanupScriptSection.tsx` (to be created)
- **Dependencies**: 
  - `CleanupScriptButton` component
- **Styling**: Follows admin section patterns from design system

## Usage Guidelines

- Used within `DatabaseCleanupPage` to organize scripts
- One section per entity type category
- Scripts filtered by category and passed to section
- Section header displays entity type name (e.g., "Fabricas", "Jingles")

## Related Documentation
- Workflow: `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- Parent Component: `docs/2_frontend_ui-design-system/03_components/composite/database-cleanup-page.md`
- Child Component: `docs/2_frontend_ui-design-system/03_components/composite/cleanup-script-button.md`

