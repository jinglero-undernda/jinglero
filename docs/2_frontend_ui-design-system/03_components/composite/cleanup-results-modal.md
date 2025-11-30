# Component: CleanupResultsModal

## Status
- **Status**: draft
- **Last Updated**: 2025-11-29
- **Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)

## Overview

CleanupResultsModal displays the results of a cleanup script execution. It shows summary statistics, lists affected entities, displays suggested fixes, and provides automation options.

**Workflow Reference**: See `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`

**API Reference**: See `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`

## Design Intent
- **Current**: To be implemented
- **Target**: Clear, comprehensive display of script results with actionable automation options

## Variants

### Default Variant
- **Usage**: Standard results display
- **Visual Spec**: Modal with header, summary statistics, entity list, action buttons
- **Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)

### Empty Results Variant
- **Usage**: When script finds no issues
- **Visual Spec**: Modal with success message, "No issues found" display
- **Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)

### Large Results Variant
- **Usage**: When script finds many issues (hundreds/thousands)
- **Visual Spec**: Modal with pagination, filtering, export option
- **Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)

## Context Variations

### Admin Context
- **Visual Changes**: Admin modal styling, consistent with other admin modals
- **Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)

## State Variations

### Default State
- **Visual Spec**: Modal visible, results displayed, automation not in progress
- **State Variables**: `automating: false`, `automationResults: null`

### Automation In Progress State
- **Visual Spec**: Modal visible, progress indicator shown, automation button disabled
- **State Variables**: `automating: true`, progress indicator visible

### Automation Complete State
- **Visual Spec**: Modal visible, results updated to show applied fixes, success/error messages
- **State Variables**: `automating: false`, `automationResults: object`

## Interactive States
- **Hover**: Entity links show hover effect
- **Active**: Buttons show active state when clicked
- **Disabled**: Automation button disabled during automation

## Props

```typescript
interface CleanupResultsModalProps {
  isOpen: boolean;
  results: ScriptExecutionResponse | null;
  onClose: () => void;
  onAutomate: (entityIds: string[], applyLowConfidence: boolean) => Promise<void>;
  onNavigateToEntity: (entityType: string, entityId: string) => void;
}
```

**Key Props**:
- `isOpen`: Whether modal is visible
- `results`: Script execution results (null if no results)
- `onClose`: Callback to close modal
- `onAutomate`: Callback to trigger automation
- `onNavigateToEntity`: Callback to navigate to entity detail page

## Component Structure

```
CleanupResultsModal
  ├── ModalHeader
  │   ├── Script Name
  │   └── Close Button
  ├── ResultsSummary
  │   ├── Total Found
  │   ├── Execution Time
  │   ├── MusicBrainz Calls (if applicable)
  │   └── MusicBrainz Errors (if applicable)
  ├── ResultsList
  │   └── EntityResultItem[]
  │       ├── Entity Type & ID
  │       ├── Issue Description
  │       ├── Current Value
  │       ├── Suggested Fix
  │       ├── Confidence Score (if MusicBrainz)
  │       └── Link to Entity
  └── ModalActions
      ├── Automate Button (if automatable)
      ├── Export Results Button (optional)
      └── Close Button
```

## Display Features

### Summary Statistics
- Total issues/entities found
- Execution time
- MusicBrainz API calls count (if applicable)
- MusicBrainz errors (if any)

### Entity Results
- Entity type and ID
- Issue description
- Current value
- Suggested fix with confidence score (if MusicBrainz)
- Link to view/edit entity

### Automation Options
- "Automate Suggested Fixes" button (if automatable suggestions exist)
- Checkbox for "Apply low confidence fixes" (if low confidence matches exist)
- Progress indicator during automation
- Success/error feedback after automation

### MusicBrainz Confidence Display
- Confidence score displayed as percentage or decimal (0.0-1.0)
- Visual indicator (color-coded) for confidence levels:
  - High (>= 0.8): Green
  - Medium (0.6-0.8): Yellow
  - Low (< 0.6): Red
- Warning message for low confidence matches requiring review

## Implementation Details
- **Component File**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)
- **Dependencies**: 
  - Modal component pattern (similar to `UnsavedChangesModal`)
  - Pagination component (for large results)
  - Loading spinner component
- **Styling**: Follows admin modal patterns from design system

## Usage Guidelines

- Modal opens automatically after script execution completes
- User can review results before automating
- Low confidence fixes require explicit approval
- Entity links navigate to entity detail page
- Modal can be closed to return to cleanup page

## Edge Cases

### No Results
- Display success message: "No issues found - database is clean for this check"
- Show statistics: 0 issues found
- No suggestions displayed

### Large Result Set
- Pagination for results list
- Filtering/searching within results
- Export option for large datasets
- Performance warning if results are very large

### Partial Automation Success
- Show breakdown of successes and failures
- List which fixes were applied and which failed
- Provide error messages for failed fixes
- Allow retry for failed fixes individually

## Related Documentation
- Workflow: `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- API Contracts: `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`
- Parent Component: `docs/2_frontend_ui-design-system/03_components/composite/database-cleanup-page.md`

