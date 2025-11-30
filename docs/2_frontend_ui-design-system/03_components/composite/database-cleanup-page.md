# Component: DatabaseCleanupPage

## Status
- **Status**: draft
- **Last Updated**: 2025-11-29
- **Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (to be created)

## Overview

DatabaseCleanupPage is the main page component for the database cleanup and validation feature. It displays available cleanup scripts organized by entity type, allows users to execute scripts, and manages the results modal display.

**Workflow Reference**: See `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`

**API Reference**: See `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`

## Design Intent
- **Current**: To be implemented
- **Target**: Provide a centralized interface for database cleanup operations with clear organization by entity type

## Variants

### Default Variant
- **Usage**: Main cleanup page view
- **Visual Spec**: Page with header, script sections organized by entity type, navigation back to dashboard
- **Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (to be created)

## Context Variations

### Admin Context
- **Visual Changes**: Standard admin page styling, admin navigation header
- **Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (to be created)

## State Variations

### Default State
- **Visual Spec**: Page displays with all script sections visible, no scripts running
- **State Variables**: 
  - `scripts`: Array of available scripts
  - `runningScripts`: Empty Set
  - `results`: null
  - `showResultsModal`: false

### Script Running State
- **Visual Spec**: Selected script button shows loading indicator, other buttons remain enabled
- **State Variables**:
  - `runningScripts`: Set containing running script ID
  - `selectedScript`: Script ID currently executing

### Results Displayed State
- **Visual Spec**: Results modal visible, script button re-enabled
- **State Variables**:
  - `results`: Script execution results object
  - `showResultsModal`: true
  - `selectedScript`: Script ID that was executed

## Interactive States
- **Hover**: Script buttons show hover effect
- **Active**: Script button shows loading spinner when executing
- **Disabled**: Script button disabled while executing

## Props

This is a page component with no props (route component).

## Component Structure

```
DatabaseCleanupPage
  ├── PageHeader ("Limpieza en la Base de Datos")
  ├── CleanupScriptSection (General)
  │   └── CleanupScriptButton[]
  ├── CleanupScriptSection (Fabricas)
  │   └── CleanupScriptButton[]
  ├── CleanupScriptSection (Jingles)
  │   └── CleanupScriptButton[]
  ├── CleanupScriptSection (Canciones)
  │   └── CleanupScriptButton[]
  ├── CleanupScriptSection (Artistas)
  │   └── CleanupScriptButton[]
  └── CleanupResultsModal (conditional)
      ├── ModalHeader
      ├── ResultsSummary
      ├── ResultsList
      └── ModalActions
```

## State Management

**State Variables**:
- `scripts` (array): List of available cleanup scripts with metadata
- `runningScripts` (Set<string>): Set of script IDs currently executing
- `results` (object | null): Current script execution results
- `showResultsModal` (boolean): Whether results modal is visible
- `selectedScript` (string | null): Currently selected/executed script ID

**State Transitions**:
- Initial → Script Selected → Script Running → Results Displayed → Modal Closed → Initial
- Results Displayed → Automation Triggered → Automation Running → Results Updated → Results Displayed

## Implementation Details
- **Component File**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (to be created)
- **Dependencies**: 
  - `CleanupScriptSection` component
  - `CleanupScriptButton` component
  - `CleanupResultsModal` component
  - `adminApi` from API client
- **Route**: `/admin/cleanup`
- **Protected**: Yes (requires admin authentication)

## Usage Guidelines

- Page is accessed from Admin Dashboard via "Limpieza en la Base de Datos" link
- Scripts are organized by entity type for easy navigation
- Multiple scripts can run concurrently (if backend supports)
- Results modal opens automatically after script execution completes

## Related Documentation
- Workflow: `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- API Contracts: `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`
- System Architecture: `docs/3_system_architecture/data-flow.md`

