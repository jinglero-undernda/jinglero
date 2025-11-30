# WORKFLOW_011: Database Cleanup and Validation

## Metadata

- **Status**: draft
- **User Experience Category**: Admin Experience
- **Access Level**: Admin-only
- **Last Updated**: 2025-11-28
- **Last Validated**: 2025-11-28
- **Code Reference**: [To be implemented]
- **Version**: 1.0
- **Workflow Type**: User Journey

## User Intent

As the curator of the database, I want to access a repository of scripts that will perform Database operations. When I press each of the buttons, a script will run and it will complete with a modal summary of the operation results and a suggestion to automate the suggested resolution.

## Overview

- **Purpose**: Provide a centralized interface for database cleanup and validation operations, allowing curators to execute discrete scripts that identify and resolve data quality issues across the knowledge graph.

- **User Persona**: Database curator/admin user responsible for maintaining data quality in the knowledge graph. They need to identify inconsistencies, missing relationships, incomplete data, and other quality issues across Fabricas, Jingles, Canciones, Artistas, and other entity types. They work systematically to improve data completeness and accuracy.

- **User Context**: Admin user managing a knowledge graph database with multiple entity types and relationships. They need to periodically audit and clean the database to ensure data integrity, completeness, and consistency. This workflow is used during maintenance sessions to identify and resolve data quality issues.

- **Success Criteria**:

  - User can access the cleanup page from Admin Dashboard
  - User can see all available cleanup scripts organized by entity type
  - User can execute individual scripts and see results
  - Results are displayed in a clear modal with summary statistics
  - User can review suggested resolutions and automate fixes when appropriate
  - Scripts complete successfully and provide actionable feedback

- **Related Components**:

  - `AdminDashboard.tsx` - Entry point with navigation link
  - `DatabaseCleanupPage.tsx` - Main cleanup page component (to be created)
  - `CleanupScriptButton.tsx` - Individual script button component (to be created)
  - `CleanupResultsModal.tsx` - Modal for displaying script results (to be created)
  - `adminApi` - API client for backend operations

- **Dependencies**:
  - WORKFLOW_001: Entity Edit Mode (for navigating to entities from results)
  - Admin Authentication workflow (for access control)

## UX Flow

### Step 1: Access Database Cleanup Page

**User Action**: Navigate to Admin Dashboard and click on "Limpieza en la Base de Datos" link/button

**System Response**:

- Navigate to `/admin/cleanup` route
- Load Database Cleanup page
- Display page header: "Limpieza en la Base de Datos"
- Display cleanup scripts organized by Entity Type sections

**UI State**:

- Current route: `/admin/cleanup`
- Page title: "Limpieza en la Base de Datos"
- Entity type sections visible (Fabricas, Jingles, Canciones, Artistas, etc.)
- Each section shows relevant cleanup scripts as buttons

**Data Changes**: None (page load only)

**Code Reference**: `frontend/src/pages/AdminPage.tsx` (route definition), `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (to be created)

---

### Step 2: View Available Cleanup Scripts

**User Action**: Review the available cleanup scripts organized by entity type

**System Response**:

- Display scripts grouped by entity type
- Each script button shows:
  - Script name/description
  - Entity type icon/badge
  - Status indicator (if script was recently run)

**UI State**:

- Scripts organized in sections:
  - **General Section**:
    - "Refresh all redundant properties and all empty booleans"
  - **Fabricas Section**:
    - "Find Fabricas where not all Jingles are listed" (based on parsing "Contenidos" property)
    - "Find Fabricas with two or more Jingles matching time-stamps"
  - **Jingles Section**:
    - "Find Jingles with time-stamp 00:00:00"
    - "Find Jingles without a Cancion relationship"
  - **Canciones Section**:
    - "Find Cancion without MusicBrainz id and suggest it from query"
    - "Fill out missing Cancion details from MusicBrainz id"
    - "Find a Cancion without an Autor asociado, suggest Autor based on MusicBrainz query, Auto-generate Artista entity if new is needed"
- **Artistas Section**:
  - "Find Artista without MusicBrainz id and backfill based on online research"
  - "Fill out missing Autor details from MusicBrainz id"

**Data Changes**: None

**Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (to be created)

---

### Step 3: Execute Cleanup Script

**User Action**: Click on a cleanup script button (e.g., "Find Jingles with time-stamp 00:00:00")

**System Response**:

- Disable the clicked button
- Show loading indicator on the button
- Call backend API endpoint for the specific cleanup script
- Wait for script execution to complete

**UI State**:

- Button state: `loading = true`
- Button disabled
- Loading spinner/indicator visible on button
- Other buttons remain enabled (user can run multiple scripts)

**Data Changes**:

- API call initiated: `POST /api/admin/cleanup/:scriptId` or similar
- Backend executes database query/operation

**Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (button click handler), `frontend/src/lib/api/client.ts` (adminApi.cleanupScript), `backend/src/server/api/admin.ts` (cleanup endpoint - to be created)

---

### Step 4: Script Execution Completes

**User Action**: Wait for script to complete (automatic)

**System Response**:

- Receive results from backend API
- Parse result data structure
- Open results modal automatically
- Re-enable the button

**UI State**:

- Button state: `loading = false`
- Button re-enabled
- Results modal opens: `showResultsModal = true`
- Modal displays:
  - Script name
  - Execution summary statistics
  - List of affected entities/issues
  - Suggested resolutions (if any)

**Data Changes**:

- API response received with:
  - `totalFound`: number of issues/entities found
  - `entities`: array of affected entities with details
  - `suggestions`: array of suggested fixes (if applicable)
  - `executionTime`: time taken to execute
  - `timestamp`: when script was executed

**Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (results handling), `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)

---

### Step 5: Review Results in Modal

**User Action**: Review the results displayed in the modal

**System Response**:

- Display comprehensive results summary
- Show statistics (total found, affected entities, etc.)
- List affected entities with details
- Display suggested resolutions with "Automate" buttons (if applicable)

**UI State**:

- Modal visible: `showResultsModal = true`
- Modal content:
  - **Header**: Script name and execution timestamp
  - **Summary Section**:
    - Total issues/entities found
    - Breakdown by severity/category (if applicable)
    - Execution time
  - **Details Section**:
    - List of affected entities with:
      - Entity type and ID
      - Issue description
      - Current state
      - Suggested fix (if applicable)
    - Links to view/edit each entity
  - **Actions Section**:
    - "Automate Suggested Fixes" button (if suggestions available)
    - "Close" button
    - "Export Results" button (optional)

**Data Changes**: None (display only)

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)

---

### Step 6: Navigate to Affected Entity (Optional)

**User Action**: Click on a link to view/edit an affected entity from the results list

**System Response**:

- Navigate to entity detail page
- Close results modal (or keep it open in background)
- Load entity in AdminEntityAnalyze view

**UI State**:

- Route changes to: `/admin/:entityType/:entityId`
- Entity detail page loads
- Results modal closes (or remains accessible)

**Data Changes**:

- Navigation to entity page
- Entity data loaded from API

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (entity link handler), `frontend/src/pages/admin/AdminEntityAnalyze.tsx` (entity detail page)

---

### Step 6a: Fix Fabrica Timestamp Mismatches (Optional - Fabrica-specific)

**User Action**: Click "ARREGLAR" button next to a Fabrica instance report (for "Find Fabricas where not all Jingles are listed" script results)

**System Response**:

- Open FabricaTimestampFixModal showing detailed timestamp table
- Display all timestamps from both `contents` property and APPEARS_IN relationships
- Show parsed content strings and associated Jingle information
- Allow user to create missing Jingle entities for timestamps without Jingles

**UI State**:

- FabricaTimestampFixModal opens (overlay on CleanupResultsModal)
- Table displays with columns: Timestamp, Contenido, Jingle
- Each row has "ARREGLAR" button for rows missing Jingles

**Data Changes**:

- User can create new Jingle entities
- New APPEARS_IN relationships created with timestamps
- Table updates to reflect changes

**Code Reference**:

- `frontend/src/components/admin/CleanupResultsModal.tsx` (ARREGLAR button)
- `frontend/src/components/admin/FabricaTimestampFixModal.tsx` (to be created)
- **Related Workflow**: [`WORKFLOW_011_database-cleanup_fabrica-timestamp-fix.md`](./WORKFLOW_011_database-cleanup_fabrica-timestamp-fix.md) (detailed specification)

---

### Step 7: Automate Suggested Fixes (Optional)

**User Action**: Click "Automate Suggested Fixes" button in results modal

**System Response**:

- Show confirmation dialog
- If confirmed, call backend API to apply automated fixes
- Show progress indicator
- Update results to show applied fixes
- Show success/error feedback

**UI State**:

- Confirmation dialog visible (if applicable)
- Automation in progress: `automating = true`
- Progress indicator visible
- Results updated to show fixed status

**Data Changes**:

- API call: `POST /api/admin/cleanup/:scriptId/automate`
- Backend applies suggested fixes to database
- Entities updated in database
- Results updated to reflect applied fixes

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (automate handler), `backend/src/server/api/admin.ts` (automation endpoint - to be created)

---

### Step 8: Close Results Modal

**User Action**: Click "Close" button or click outside modal

**System Response**:

- Close results modal
- Return focus to cleanup page
- Optionally save results history (for future reference)

**UI State**:

- Modal closed: `showResultsModal = false`
- Cleanup page visible again
- All script buttons enabled and ready

**Data Changes**:

- Results may be saved to local state/history (optional)

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (close handler)

---

## Edge Cases

### Edge Case 1: Script Execution Error

**Trigger**: Backend script fails or API call fails

**Expected Behavior**:

- Show error message in modal or toast notification
- Display error details (error type, message)
- Re-enable the script button
- Allow user to retry or report issue

**Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (error handling)

---

### Edge Case 2: No Results Found

**Trigger**: Script executes successfully but finds no issues/entities

**Expected Behavior**:

- Show results modal with success message
- Display: "No issues found - database is clean for this check"
- Show statistics: 0 issues found
- No suggestions displayed

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (empty results handling)

---

### Edge Case 3: Large Result Set

**Trigger**: Script finds hundreds or thousands of affected entities

**Expected Behavior**:

- Show pagination in results modal
- Display summary statistics prominently
- Allow filtering/searching within results
- Provide "Export Results" option for large datasets
- Show performance warning if results are very large

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (pagination, filtering)

---

### Edge Case 4: Long-Running Script

**Trigger**: Script takes more than 10-30 seconds to execute

**Expected Behavior**:

- Show progress indicator with estimated time (if available)
- Allow user to cancel operation (if supported)
- Show periodic status updates
- Display "This may take a while..." message for known slow scripts

**Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (long-running script handling)

---

### Edge Case 5: Multiple Scripts Running Simultaneously

**Trigger**: User clicks multiple script buttons in quick succession

**Expected Behavior**:

- Allow multiple scripts to run concurrently (if backend supports)
- Each button shows its own loading state
- Results modals can stack or replace previous one
- Show notification when each script completes

**Code Reference**: `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (concurrent execution handling)

---

### Edge Case 6: Automation Fails Partially

**Trigger**: Some automated fixes succeed, others fail

**Expected Behavior**:

- Show detailed breakdown of successes and failures
- List which fixes were applied and which failed
- Provide error messages for failed fixes
- Allow user to retry failed fixes individually
- Update results to show partial success state

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (partial automation handling)

---

## Technical Implementation

### State Management

**State Variables**:

- `scripts` (array): List of available cleanup scripts with metadata - `DatabaseCleanupPage.tsx`
- `runningScripts` (Set<string>): Set of script IDs currently executing - `DatabaseCleanupPage.tsx`
- `results` (object): Current script results - `DatabaseCleanupPage.tsx`
- `showResultsModal` (boolean): Whether results modal is visible - `DatabaseCleanupPage.tsx`
- `selectedScript` (string | null): Currently selected/executed script ID - `DatabaseCleanupPage.tsx`
- `automating` (boolean): Whether automation is in progress - `CleanupResultsModal.tsx`
- `automationResults` (object): Results of automation operation - `CleanupResultsModal.tsx`

**State Transitions**:

- Initial → Script Selected → Script Running → Results Displayed → Modal Closed → Initial
- Results Displayed → Automation Triggered → Automation Running → Results Updated → Results Displayed

### API Integration

**Endpoints Used**:

- `GET /api/admin/cleanup/scripts` - List available cleanup scripts - `backend/src/server/api/admin.ts` (to be created)
- `POST /api/admin/cleanup/:scriptId/execute` - Execute a cleanup script - `backend/src/server/api/admin.ts` (to be created)
- `POST /api/admin/cleanup/:scriptId/automate` - Apply automated fixes - `backend/src/server/api/admin.ts` (to be created)

**Data Flow**:

1. Page loads → Fetch available scripts from API
2. User clicks script button → POST to execute endpoint
3. Backend executes script → Returns results
4. Frontend displays results in modal
5. User clicks automate → POST to automate endpoint
6. Backend applies fixes → Returns automation results
7. Frontend updates results display

**Request/Response Examples**:

```typescript
// Execute script request
POST /api/admin/cleanup/find-jingles-zero-timestamp/execute
Response: {
  scriptId: "find-jingles-zero-timestamp",
  scriptName: "Find Jingles with time-stamp 00:00:00",
  totalFound: 15,
  executionTime: 1234, // ms
  timestamp: "2025-11-28T10:30:00Z",
  entities: [
    {
      entityType: "jingle",
      entityId: "0001",
      issue: "Timestamp is 00:00:00",
      currentValue: "00:00:00",
      suggestion: {
        type: "update",
        field: "timestamp",
        recommendedValue: null, // needs manual review
        automatable: false
      }
    }
  ],
  suggestions: []
}

// Automate fixes request
POST /api/admin/cleanup/fill-missing-cancion-details/automate
Body: {
  entityIds: ["c001", "c002", "c003"]
}
Response: {
  totalApplied: 3,
  successful: 3,
  failed: 0,
  results: [
    {
      entityId: "c001",
      status: "success",
      changes: {
        album: "Album Name",
        year: 2020
      }
    }
  ]
}
```

### Components

**Component Responsibilities**:

- `DatabaseCleanupPage.tsx`: Main page component, manages script execution and results state - `frontend/src/pages/admin/DatabaseCleanupPage.tsx` (to be created)
- `CleanupScriptButton.tsx`: Individual script button with loading state - `frontend/src/components/admin/CleanupScriptButton.tsx` (to be created)
- `CleanupResultsModal.tsx`: Modal for displaying script results and automation - `frontend/src/components/admin/CleanupResultsModal.tsx` (to be created)
- `CleanupScriptSection.tsx`: Section component grouping scripts by entity type - `frontend/src/components/admin/CleanupScriptSection.tsx` (to be created)

**Component Hierarchy**:

```
DatabaseCleanupPage
  ├── PageHeader
  ├── CleanupScriptSection (Fabricas)
  │   └── CleanupScriptButton[]
  ├── CleanupScriptSection (Jingles)
  │   └── CleanupScriptButton[]
  ├── CleanupScriptSection (Canciones)
  │   └── CleanupScriptButton[]
  ├── CleanupScriptSection (Artistas)
  │   └── CleanupScriptButton[]
  └── CleanupScriptSection (General)
      └── CleanupScriptButton[]

CleanupResultsModal (when open)
  ├── ModalHeader
  ├── ResultsSummary
  ├── ResultsList
  │   └── EntityResultItem[]
  └── ModalActions
```

### Route Configuration

**Route Definition**:

- Path: `/admin/cleanup`
- Component: `DatabaseCleanupPage`
- Protected: Yes (requires admin authentication)
- Code Reference: `frontend/src/pages/AdminPage.tsx` (to be updated)

**Navigation**:

- From Admin Dashboard: Link/button to `/admin/cleanup`
- Code Reference: `frontend/src/pages/admin/AdminDashboard.tsx` (to be updated)

## Validation Checklist

See `WORKFLOW_011_database-cleanup_validation.md` for complete validation report.

**Status**: ⚠️ Draft - Feature not yet implemented

**Summary**:

- Infrastructure exists: Route structure, protected routes, AdminEntityAnalyze component
- Needs implementation: 4 frontend components, 3 API endpoints, 11 backend scripts
- Validation completed: 2025-11-28

## Related Workflows

- WORKFLOW_001: Entity Edit Mode (for navigating to entities from cleanup results)
- Admin Authentication workflow (for access control)

## Cleanup Scripts Catalog

### Fabricas Scripts

1. **Find Fabricas where not all Jingles are listed**

   - **Description**: Identifies Fabricas where the "Contenidos" property contains Jingle references that are not present in the APPEARS_IN relationships
   - **Entity Type**: Fabricas
   - **Issue Type**: Missing relationships
   - **Automatable**: Yes (can create missing APPEARS_IN relationships)

2. **Find Fabricas with two or more Jingles matching time-stamps**
   - **Description**: Identifies Fabricas that have multiple Jingles with identical timestamp values, which may indicate duplicates or data entry errors
   - **Entity Type**: Fabricas
   - **Issue Type**: Data quality / duplicates
   - **Automatable**: No (requires manual review)

### Jingles Scripts

3. **Find Jingles with time-stamp 00:00:00**

   - **Description**: Identifies Jingles with zero timestamp, which likely indicates missing or invalid timestamp data
   - **Entity Type**: Jingles
   - **Issue Type**: Missing/invalid data
   - **Automatable**: No (requires manual timestamp entry)

4. **Find Jingles without a Cancion relationship**
   - **Description**: Identifies Jingles that are not linked to any Cancion via VERSIONA relationship
   - **Entity Type**: Jingles
   - **Issue Type**: Missing relationships
   - **Automatable**: Partial (can suggest Canciones based on title matching)

### Canciones Scripts

5. **Find Cancion without MusicBrainz id and suggest it from query**

   - **Description**: Identifies Canciones missing MusicBrainz ID and attempts to suggest matches via MusicBrainz API query
   - **Entity Type**: Canciones
   - **Issue Type**: Missing external IDs
   - **Automatable**: Yes (can update MusicBrainz ID if confident match found)

6. **Fill out missing Cancion details from MusicBrainz id**

   - **Description**: For Canciones with MusicBrainz ID, fetches missing metadata (album, year, genre, etc.) from MusicBrainz API
   - **Entity Type**: Canciones
   - **Issue Type**: Incomplete data
   - **Automatable**: Yes (can backfill missing fields from MusicBrainz)

7. **Find a Cancion without an Autor asociado**
   - **Description**: Identifies Canciones that are not linked to any Artista via AUTOR_DE relationship
   - **Entity Type**: Canciones
   - **Issue Type**: Missing relationships
   - **Automatable**: Partial (can suggest Artistas based on MusicBrainz data)

### Artistas Scripts

8. **Suggest Autor based on MusicBrainz query, Auto-generate Artista entity if new is needed**

   - **Description**: For Canciones without Autor, queries MusicBrainz to find artist information and suggests creating new Artista entities if needed
   - **Entity Type**: Artistas / Canciones
   - **Issue Type**: Missing entities and relationships
   - **Automatable**: Yes (can create Artista entities and AUTOR_DE relationships)

9. **Find Artista without MusicBrainz id and backfill based on online research**

   - **Description**: Identifies Artistas missing MusicBrainz ID and attempts to find and suggest matches
   - **Entity Type**: Artistas
   - **Issue Type**: Missing external IDs
   - **Automatable**: Yes (can update MusicBrainz ID if confident match found)

10. **Fill out missing Autor details from MusicBrainz id**
    - **Description**: For Artistas with MusicBrainz ID, fetches missing metadata from MusicBrainz API
    - **Entity Type**: Artistas
    - **Issue Type**: Incomplete data
    - **Automatable**: Yes (can backfill missing fields from MusicBrainz)

### General Scripts

11. **Refresh all redundant properties and all empty booleans**
    - **Description**: Recalculates redundant properties (e.g., relationship counts) and sets default values for empty boolean fields
    - **Entity Type**: All
    - **Issue Type**: Data consistency
    - **Automatable**: Yes (can update all redundant properties automatically)

## Change History

| Version | Date       | Change                | Author | Rationale |
| ------- | ---------- | --------------------- | ------ | --------- |
| 1.0     | 2025-11-28 | Initial documentation | -      | Baseline  |
