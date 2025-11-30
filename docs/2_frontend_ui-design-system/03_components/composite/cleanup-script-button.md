# Component: CleanupScriptButton

## Status
- **Status**: draft
- **Last Updated**: 2025-11-29
- **Code Reference**: `frontend/src/components/admin/CleanupScriptButton.tsx` (to be created)

## Overview

CleanupScriptButton displays an individual cleanup script as a clickable button. It shows the script name, description, and loading state during execution.

**Workflow Reference**: See `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`

## Design Intent
- **Current**: To be implemented
- **Target**: Clear, clickable button for each cleanup script with visual feedback during execution

## Variants

### Default Variant
- **Usage**: Standard script button
- **Visual Spec**: Button with script name, description, entity type badge, loading indicator when executing
- **Code Reference**: `frontend/src/components/admin/CleanupScriptButton.tsx` (to be created)

## Context Variations

### Admin Context
- **Visual Changes**: Admin button styling, consistent with other admin buttons
- **Code Reference**: `frontend/src/components/admin/CleanupScriptButton.tsx` (to be created)

## State Variations

### Default State
- **Visual Spec**: Button enabled, no loading indicator
- **Props**: `loading: false`, `disabled: false`

### Loading State
- **Visual Spec**: Button disabled, loading spinner visible, script name still visible
- **Props**: `loading: true`, `disabled: true`

### Error State
- **Visual Spec**: Button enabled, error indicator visible (if script failed)
- **Props**: `error: string | null`

## Interactive States
- **Hover**: Button shows hover effect (when not disabled)
- **Active**: Button shows active state when clicked
- **Disabled**: Button grayed out, cursor not-allowed (during execution)

## Props

```typescript
interface CleanupScriptButtonProps {
  scriptId: string;
  scriptName: string;
  description: string;
  entityType: string;
  category: 'fabricas' | 'jingles' | 'canciones' | 'artistas' | 'general';
  automatable: boolean;
  usesMusicBrainz: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: (scriptId: string) => void;
  error?: string | null;
}
```

**Key Props**:
- `scriptId`: Unique identifier for the script
- `scriptName`: Display name of the script
- `description`: Description of what the script does
- `entityType`: Entity type this script operates on
- `category`: Category for grouping scripts
- `automatable`: Whether script has automatable fixes
- `usesMusicBrainz`: Whether script uses MusicBrainz API
- `loading`: Whether script is currently executing
- `disabled`: Whether button should be disabled
- `onClick`: Callback when button is clicked

## Implementation Details
- **Component File**: `frontend/src/components/admin/CleanupScriptButton.tsx` (to be created)
- **Dependencies**: 
  - Loading spinner component (or inline spinner)
  - Admin button styling
- **Styling**: Follows admin button patterns from design system

## Usage Guidelines

- Used within `CleanupScriptSection` components
- One button per cleanup script
- Loading state managed by parent `DatabaseCleanupPage`
- Click handler executes script via API

## Related Documentation
- Workflow: `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- Parent Component: `docs/2_frontend_ui-design-system/03_components/composite/database-cleanup-page.md`

