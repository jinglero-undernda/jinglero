# WORKFLOW_011: Fabrica Timestamp Validation and Fix

## Metadata

- **Status**: ready_for_implementation
- **User Experience Category**: Admin Experience
- **Access Level**: Admin-only
- **Last Updated**: 2025-11-30
- **Last Validated**: 2025-11-30
- **Code Reference**: See Code References section below
- **Version**: 1.0
- **Workflow Type**: User Journey
- **Related Workflow**: WORKFLOW_011_database-cleanup.md

## User Intent

As a database curator, when I see a Fabrica instance report showing a mismatch between timestamps in the `contents` property and APPEARS_IN relationships, I want to review all timestamps (from both sources) in a detailed table view, and create missing Jingle entities when a timestamp in `contents` doesn't have an associated Jingle.

## Overview

- **Purpose**: Provide a detailed view for validating and fixing Fabrica timestamp mismatches by displaying all timestamps from both the `contents` property and APPEARS_IN relationships, allowing manual creation of missing Jingle entities.

- **User Persona**: Database curator/admin user working on Fabrica validation, specifically addressing cases where the `contents` property references timestamps that don't have corresponding Jingle entities.

- **User Context**: Admin user has executed the "Find Fabricas where not all Jingles are listed" cleanup script and sees instance reports showing mismatches. They need a detailed view to:

  - See all timestamps from both `contents` and APPEARS_IN relationships
  - Review parsed content strings for each timestamp
  - Identify timestamps that have content but no associated Jingle
  - Create new Jingle entities for missing timestamps

- **Success Criteria**:

  - User can click "ARREGLAR" button next to each Fabrica instance report
  - Detailed table view displays all timestamps with parsed content and Jingle information
  - User can create new Jingle entities for timestamps missing Jingles
  - New Jingle entities are created with proper APPEARS_IN relationships
  - Table updates to reflect newly created entities

- **Related Components**:

  - `CleanupResultsModal.tsx` - Where "ARREGLAR" button is added
  - `FabricaTimestampFixModal.tsx` - New modal component for timestamp table view (to be created)
  - `adminApi` - API client for creating Jingles and relationships

- **Dependencies**:
  - **Parent Workflow**: WORKFLOW_011: Database Cleanup - This feature is accessed from cleanup script results
  - **Backend APIs**:
    - `GET /api/admin/:type/:id` - Fetch Fabrica entity
    - `GET /api/admin/fabricas/:id/jingles` (via `adminApi.getFabricaJingles()`) - Fetch APPEARS_IN relationships
    - `POST /api/admin/jingles` - Create Jingle entity
    - `POST /api/admin/relationships/appears_in` - Create APPEARS_IN relationship
  - **Frontend Utilities**:
    - `parseTimestampFromText()` from `frontend/src/lib/utils/timestampParser.ts` - Extract timestamp from text
    - `parseTimestampToSeconds()` from `frontend/src/lib/utils/timestamp.ts` - Convert HH:MM:SS to seconds
    - `formatSecondsToTimestamp()` from `frontend/src/lib/utils/timestamp.ts` - Convert seconds to HH:MM:SS
  - **Existing Components**:
    - `CleanupResultsModal.tsx` - Must be modified to add "ARREGLAR" button
    - `adminApi` client from `frontend/src/lib/api/client.ts` - For API calls
  - **Backend Changes**: None required - all necessary endpoints exist

## UX Flow

### Step 1: View Fabrica Instance Report

**User Action**: User has executed "Find Fabricas where not all Jingles are listed" cleanup script and sees results in CleanupResultsModal

**System Response**:

- Display Fabrica instance reports in results list
- Each report shows:
  - Fabrica title/ID
  - Issue description (e.g., "Contents has 5 timestamp(s) but only 3 APPEARS_IN relationship(s)")
  - "Ver Entidad" button (existing)
  - **"ARREGLAR" button (new)** - placed below "Ver Entidad" button

**UI State**:

- CleanupResultsModal is open
- Fabrica instances are listed with issue descriptions
- Each instance has two buttons: "Ver Entidad" and "ARREGLAR"

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx:320-334`

---

### Step 2: Click "ARREGLAR" Button

**User Action**: Click "ARREGLAR" button next to a Fabrica instance report

**System Response**:

- Open new modal: `FabricaTimestampFixModal`
- Fetch Fabrica data including:
  - `contents` property (full text)
  - All APPEARS_IN relationships with their timestamps and associated Jingle data
- Parse all timestamps from `contents` property
- Build unified table of all timestamps

**UI State**:

- `FabricaTimestampFixModal` is open (overlay on top of CleanupResultsModal)
- Loading state: `isLoading = true` while fetching data
- Error state: `error = null` initially, set to error message if fetch fails
- Table view ready to display after data loaded

**Loading States**:

- Show loading spinner or skeleton UI while fetching Fabrica data
- Show loading indicator while fetching APPEARS_IN relationships (if separate query)
- Show loading indicator while parsing timestamps from contents

**Error Handling**:

- If Fabrica fetch fails: Show error message "Error loading Fabrica data" with retry button
- If relationships fetch fails: Show error message "Error loading Jingle relationships" with retry button
- If parsing fails: Show warning message but continue with available data
- Network errors: Show "Connection error. Please check your internet connection." with retry option

**Data Changes**: None (data fetch only)

**Code Reference**:

- `frontend/src/components/admin/CleanupResultsModal.tsx` (button handler)
- `frontend/src/components/admin/FabricaTimestampFixModal.tsx` (to be created)
- Backend API: `GET /api/admin/:type/:id` where `type=fabricas` and `id=fabricaId` - Returns Fabrica entity properties only
- Additional query needed: Fetch APPEARS_IN relationships separately (see API Endpoints section)

---

### Step 3: View Timestamp Table

**User Action**: Review the timestamp table in FabricaTimestampFixModal

**System Response**:

- Display table with 3 columns:
  - **Timestamp**: Timestamp in HH:MM:SS format (from either `contents` or APPEARS_IN)
  - **Contenido**: Parsed content string from `contents` property
    - For each timestamp found in `contents`: Extract text from that timestamp until (but excluding) the next timestamp
    - Remove newline characters for display
    - If timestamp only exists in APPEARS_IN (not in contents): Show empty or "-"
  - **Jingle**: Jingle information
    - If timestamp has APPEARS_IN relationship: Show Jingle title/ID and comment
    - If no APPEARS_IN relationship: Show empty or "No Jingle"
- Each row has an "ARREGLAR" button in the rightmost column
- Rows are sorted by timestamp (ascending)

**UI State**:

- Table visible with all timestamp rows
- Each row shows:
  - Timestamp (formatted as HH:MM:SS)
  - Contenido (parsed string, or "-" if not in contents)
  - Jingle (title/comment if exists, or "No Jingle" if missing)
  - "ARREGLAR" button (enabled for rows missing Jingles, disabled or hidden for rows with existing Jingles)

**Data Structure**:

```typescript
interface TimestampRow {
  timestamp: number; // seconds
  timestampFormatted: string; // "HH:MM:SS"
  contenido: string; // Parsed from contents property
  jingle: {
    id: string;
    title?: string;
    comment?: string;
  } | null;
  source: "contents" | "appears_in" | "both"; // Where timestamp was found
}
```

**Code Reference**:

- `frontend/src/components/admin/FabricaTimestampFixModal.tsx` (table rendering, to be created)
- `frontend/src/lib/utils/timestampParser.ts` (timestamp extraction from text)
- `frontend/src/lib/utils/timestamp.ts` (timestamp format conversion)
- Content parsing logic (to be implemented in FabricaTimestampFixModal)

---

### Step 4: Create Missing Jingle (Primary Use Case)

**User Action**: Click "ARREGLAR" button on a row where:

- Timestamp exists in `contents` (contenido is not empty)
- No Jingle exists (jingle is null)

**System Response**:

- Show confirmation dialog or inline form:
  - Pre-fill Jingle title with parsed contenido string
  - Pre-fill Jingle comment with parsed contenido string
  - Allow user to edit before creating
- On confirmation:
  1. Create new Jingle entity via `POST /api/admin/jingles` with:
     - `title`: Parsed contenido string (user can edit)
     - `comment`: Parsed contenido string (user can edit)
     - `fabricaId`: Current Fabrica ID (to auto-create APPEARS_IN)
     - Other required fields with defaults
  2. Create APPEARS_IN relationship via `POST /api/admin/relationships/APPEARS_IN` with:
     - `start`: New Jingle ID
     - `end`: Fabrica ID
     - `timestamp`: Timestamp in seconds (integer)
  3. Refresh table to show newly created Jingle
  4. Show success message

**UI State**:

- Confirmation dialog/form visible (if user editing is allowed)
- Or direct creation with loading state: `isCreating = true` for the specific row
- Table updates to show new Jingle in the row after successful creation
- "ARREGLAR" button becomes disabled or hidden for that row
- Success message: "Jingle created successfully" (toast notification or inline message)

**Loading States**:

- Show loading spinner on "ARREGLAR" button while creating Jingle
- Disable all "ARREGLAR" buttons during creation (prevent concurrent creates)
- Show "Creating..." text on button or loading indicator

**Error Handling**:

- If Jingle creation fails: Show error message "Failed to create Jingle: [error details]" with retry option
- If APPEARS_IN relationship creation fails: Show error message "Jingle created but failed to link to Fabrica. Please link manually." with link to relationship creation
- Network errors: Show "Connection error. Please check your internet connection." with retry option
- Validation errors: Show specific validation error message (e.g., "Title is required")
- If timestamp update fails: Show warning "Jingle created but timestamp may be incorrect. Please verify."

**Data Changes**:

- New Jingle entity created in database
- New APPEARS_IN relationship created with timestamp property
- APPEARS_IN order automatically recalculated for Fabrica
- Jingle redundant properties (fabricaId, fabricaDate) auto-synced

**Code Reference**:

- `frontend/src/components/admin/FabricaTimestampFixModal.tsx` (create handler)
- `frontend/src/lib/api/client.ts:681` - `adminApi.createJingle()`
- `frontend/src/lib/api/client.ts` - `adminApi.post('/relationships/APPEARS_IN')`
- `backend/src/server/api/admin.ts:1455` - Create Jingle endpoint
- `backend/src/server/api/admin.ts:831` - Create APPEARS_IN relationship endpoint

---

### Step 5: Handle Existing Jingles

**User Action**: View rows where Jingle already exists

**System Response**:

- Display existing Jingle information (title, comment)
- "ARREGLAR" button is disabled or hidden (or shows different action like "View Jingle")
- Row may be visually distinct (e.g., grayed out or with checkmark)

**UI State**:

- Rows with existing Jingles show Jingle information
- "ARREGLAR" button disabled/hidden for these rows

**Data Changes**: None

---

### Step 6: Close Modal

**User Action**: Click "Close" button or click outside modal

**System Response**:

- Close FabricaTimestampFixModal
- Return to CleanupResultsModal
- Optionally refresh CleanupResultsModal to show updated counts (if any Jingles were created)

**UI State**:

- FabricaTimestampFixModal closed
- CleanupResultsModal visible again
- Results may be refreshed if entities were created

**Data Changes**: None (UI state only)

---

## Technical Implementation Details

### Timestamp Extraction Logic

**From `contents` property:**

1. Split `contents` by newlines
2. For each line, use `parseTimestampFromText()` to detect timestamps
3. For each detected timestamp:
   - Extract text from that timestamp until (but excluding) the next detected timestamp
   - Remove newline characters from extracted text
   - Store as `contenido` string for that timestamp

**From APPEARS_IN relationships:**

1. Query all APPEARS_IN relationships for the Fabrica
2. For each relationship:
   - Extract `timestamp` property (in seconds)
   - Extract associated Jingle ID, title, and comment
   - Convert timestamp to HH:MM:SS format for display

**Unified Table:**

- Combine timestamps from both sources
- If same timestamp appears in both, merge into single row with:
  - `contenido` from contents parsing
  - `jingle` from APPEARS_IN relationship
  - `source: 'both'`
- If timestamp only in contents: `source: 'contents'`, `jingle: null`
- If timestamp only in APPEARS_IN: `source: 'appears_in'`, `contenido: '-'`

### Content Parsing Algorithm

```typescript
function parseContentByTimestamps(contents: string): Map<number, string> {
  const lines = contents.split("\n");
  const timestampMap = new Map<number, string>();

  let currentTimestamp: number | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const timestampStr = parseTimestampFromText(line);
    if (timestampStr) {
      // Save previous timestamp's content
      if (currentTimestamp !== null) {
        timestampMap.set(currentTimestamp, currentContent.join(" ").trim());
      }
      // Start new timestamp
      currentTimestamp = parseTimestampToSeconds(timestampStr);
      currentContent = [line.replace(timestampStr, "").trim()];
    } else if (currentTimestamp !== null) {
      // Continue accumulating content for current timestamp
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        currentContent.push(trimmed);
      }
    }
  }

  // Save last timestamp's content
  if (currentTimestamp !== null) {
    timestampMap.set(currentTimestamp, currentContent.join(" ").trim());
  }

  return timestampMap;
}
```

### Jingle Creation Flow

1. **User clicks "ARREGLAR"** on row with `jingle === null` and `contenido !== '-'`
2. **Show confirmation/form** (optional - can be direct creation):
   - Pre-filled fields:
     - `title`: contenido string (first 100 chars or full if shorter)
     - `comment`: contenido string (full)
   - User can edit before confirming
3. **Create Jingle**:
   ```typescript
   const newJingle = await adminApi.createJingle({
     title: contenidoString,
     comment: contenidoString,
     fabricaId: fabricaId, // This auto-creates APPEARS_IN with timestamp: 0
   });
   ```
4. **Update APPEARS_IN timestamp** (if fabricaId auto-creation doesn't set timestamp):

   ```typescript
   await adminApi.post("/relationships/APPEARS_IN", {
     start: newJingle.id,
     end: fabricaId,
     timestamp: row.timestamp, // in seconds
   });
   ```

   **Note**: If `fabricaId` is set during Jingle creation, the backend auto-creates APPEARS_IN with `timestamp: 0`. We need to update it to the correct timestamp.

5. **Refresh table** to show new Jingle

### API Endpoints

**Fetch Fabrica:**

- **Endpoint**: `GET /api/admin/:type/:id` where `type=fabricas` and `id=fabricaId`
- **Code Reference**: `backend/src/server/api/admin.ts:1438-1453`
- **Frontend Method**: `adminApi.getFabrica(fabricaId)` from `frontend/src/lib/api/client.ts:148`
- **Response**: Returns Fabrica entity with properties only (does not include relationships)
  ```json
  {
    "id": "0hmxZPp0xq0",
    "title": "Fabrica Title",
    "contents": "00:02:30 Some content...",
    "date": "2025-01-15T00:00:00.000Z",
    ...
  }
  ```

**Fetch APPEARS_IN Relationships:**

- **Endpoint**: `GET /api/admin/relationships/appears_in` (returns all APPEARS_IN relationships)
- **Code Reference**: `backend/src/server/api/admin.ts:815-828`
- **Note**: This endpoint returns ALL APPEARS_IN relationships. To get relationships for a specific Fabrica, filter client-side or use a custom query.
- **Alternative**: Use `adminApi.getFabricaJingles(fabricaId)` from `frontend/src/lib/api/client.ts:156` which returns Jingles with timestamp and order from APPEARS_IN relationships
- **Response Format** (from getFabricaJingles):
  ```json
  [
    {
      "id": "j1a2b3c4",
      "title": "Jingle Title",
      "comment": "Jingle comment",
      "timestamp": 150,
      "order": 1,
      ...
    }
  ]
  ```

**Create Jingle:**

- **Endpoint**: `POST /api/admin/:type` where `type=jingles`
- **Code Reference**: `backend/src/server/api/admin.ts:1455-1535`
- **Frontend Method**: `adminApi.createJingle(data)` from `frontend/src/lib/api/client.ts:681`
- **Request Body**:
  ```json
  {
    "title": "Jingle Title",
    "comment": "Jingle comment",
    "fabricaId": "0hmxZPp0xq0",
    "youtubeUrl": "...",
    ...
  }
  ```
- **Response**: Created Jingle object
- **Special Notes**:
  - If `fabricaId` is provided, backend auto-creates APPEARS_IN relationship with `timestamp: 0`
  - Must update APPEARS_IN relationship separately to set correct timestamp
  - See API Contract: `docs/5_backend_api-contracts/contracts/admin-api.md:188-250`

**Create APPEARS_IN Relationship:**

- **Endpoint**: `POST /api/admin/relationships/:relType` where `relType=appears_in`
- **Code Reference**: `backend/src/server/api/admin.ts:831-985`
- **Frontend Method**: `adminApi.post('/relationships/appears_in', payload)`
- **Request Body**:
  ```json
  {
    "start": "j1a2b3c4",
    "end": "0hmxZPp0xq0",
    "timestamp": 150
  }
  ```
- **Response**: Created relationship object with `timestamp`, `order`, `createdAt`
- **Special Notes**:
  - `timestamp` can be number (seconds) or string (HH:MM:SS format) - backend converts to seconds
  - `order` property is ignored (system-managed, auto-calculated from timestamp)
  - Timestamp defaults to 0 if not provided
  - Timestamp range: 0 to 86400 seconds (24 hours)
  - Order is automatically recalculated for all APPEARS_IN relationships of the Fabrica
  - See API Contract: `docs/5_backend_api-contracts/contracts/admin-api.md:460-531`

## Data Model

### Fabrica Entity

- `id`: string (Fabrica ID)
- `title`: string (optional)
- `contents`: string (optional) - User-written text with timestamps

### APPEARS_IN Relationship

- `start`: Jingle ID
- `end`: Fabrica ID
- `timestamp`: number (seconds, integer)
- `order`: number (system-managed, read-only)

### Jingle Entity

- `id`: string
- `title`: string (optional)
- `comment`: string (optional)
- `fabricaId`: string (optional, redundant property)

## Code References

### Frontend Components

- **CleanupResultsModal**: `frontend/src/components/admin/CleanupResultsModal.tsx`

  - Lines 320-334: Entity card with "Ver Entidad" button
  - **To be added**: "ARREGLAR" button below "Ver Entidad"

- **FabricaTimestampFixModal**: `frontend/src/components/admin/FabricaTimestampFixModal.tsx` (to be created)

  - New component for timestamp table view
  - Handles timestamp parsing, content extraction, and Jingle creation

- **Timestamp Parser**: `frontend/src/lib/utils/timestampParser.ts`

  - `parseTimestampFromText()`: Parses timestamps from text (returns HH:MM:SS string)

- **Timestamp Utilities**: `frontend/src/lib/utils/timestamp.ts`

  - `parseTimestampToSeconds()`: Converts HH:MM:SS string to seconds (integer)
  - `formatSecondsToTimestamp()`: Converts seconds (integer) to HH:MM:SS string

- **API Client**: `frontend/src/lib/api/client.ts`
  - `adminApi.createJingle()`: Creates Jingle entity
  - `adminApi.post('/relationships/APPEARS_IN')`: Creates APPEARS_IN relationship

### Backend API

- **Create Jingle**: `backend/src/server/api/admin.ts:1455`

  - `POST /api/admin/jingles`
  - Auto-creates APPEARS_IN if `fabricaId` is provided (with timestamp: 0)

- **Create APPEARS_IN**: `backend/src/server/api/admin.ts:831`

  - `POST /api/admin/relationships/APPEARS_IN`
  - Handles timestamp normalization and order recalculation

- **Cleanup Script**: `backend/src/server/db/cleanup/scripts/fabricas.ts:26`
  - `findFabricasMissingJingles()`: Identifies mismatches

### Schema Documentation

- **APPEARS_IN Relationship**: `docs/4_backend_database-schema/schema/relationships.md:16-89`

  - Relationship structure and properties
  - Timestamp and order management

- **Jingle Node**: `docs/4_backend_database-schema/schema/nodes.md:180-398`

  - Jingle entity properties
  - `title` and `comment` properties

- **Fabrica Node**: `docs/4_backend_database-schema/schema/nodes.md:800-1003`
  - Fabrica entity properties
  - `contents` property

## UI/UX Specifications

### Modal Layout

- **Modal Size**: Max width 1200px, max height 90vh
- **Modal Position**: Centered overlay on top of CleanupResultsModal
- **Modal Styling**:
  - White background (#fff)
  - Border radius: 8px
  - Box shadow: 0 4px 20px rgba(0, 0, 0, 0.5)
  - Padding: 2rem
  - Close button: Top-right corner (× icon)

### Table Layout

- **Table Structure**: 3 columns + action column
  - Column 1: Timestamp (width: 120px, fixed)
  - Column 2: Contenido (width: auto, min 300px)
  - Column 3: Jingle (width: auto, min 200px)
  - Column 4: Actions (width: 100px, fixed)
- **Table Styling**:
  - Striped rows for readability
  - Hover effect on rows
  - Fixed header row
  - Scrollable body (max height: 500px)
- **Responsive Behavior**:
  - On small screens: Horizontal scroll for table
  - Stack columns vertically on very small screens (optional)

### Button States

- **"ARREGLAR" button (enabled)**:
  - Background: #1976d2 (blue)
  - Color: white
  - Padding: 0.25rem 0.5rem
  - Border radius: 4px
  - Cursor: pointer
  - Hover: Darker blue (#1565c0)
- **"ARREGLAR" button (disabled)**:
  - Background: #e0e0e0 (gray)
  - Color: #9e9e9e
  - Cursor: not-allowed
  - Opacity: 0.6
- **"ARREGLAR" button (loading)**:
  - Background: #1976d2
  - Show spinner icon
  - Disabled state
  - Text: "Creando..." or show spinner only

### Accessibility

- **Keyboard Navigation**:
  - Tab through table rows
  - Enter/Space to activate "ARREGLAR" button
  - Escape to close modal
- **Screen Reader Support**:
  - Table headers properly labeled
  - Button states announced (enabled/disabled/loading)
  - Error messages announced
  - Success messages announced
- **Focus Management**:
  - Focus trap within modal
  - Focus returns to "ARREGLAR" button in CleanupResultsModal after closing
- **ARIA Labels**:
  - Modal: `aria-label="Fix Fabrica Timestamps"`
  - Table: `aria-label="Timestamp comparison table"`
  - Buttons: `aria-label="Fix timestamp [timestamp]"` or `aria-label="Creating Jingle..."` when loading

## Error Handling Specifications

### Error Scenarios

1. **Fabrica Fetch Failure**

   - **Trigger**: Network error, 404, 500, or timeout
   - **UI Response**:
     - Show error message in modal: "Error loading Fabrica data: [error message]"
     - Display retry button
     - Keep modal open to allow retry
   - **User Action**: Click retry button to attempt fetch again
   - **Code Reference**: Handle in `FabricaTimestampFixModal` component error state

2. **Relationships Fetch Failure**

   - **Trigger**: Network error, 404, 500, or timeout when fetching APPEARS_IN relationships
   - **UI Response**:
     - Show warning message: "Warning: Could not load Jingle relationships. Table shows only timestamps from contents."
     - Continue with available data (contents timestamps only)
     - Display retry button
   - **User Action**: Click retry to attempt fetch again
   - **Code Reference**: Handle gracefully, show partial data

3. **Jingle Creation Failure**

   - **Trigger**: Validation error, network error, 400, 500, or timeout
   - **UI Response**:
     - Show error message: "Failed to create Jingle: [error details]"
     - Keep row in editable state
     - Show retry button
     - Re-enable "ARREGLAR" button
   - **User Action**: Review error, fix if needed, click retry
   - **Code Reference**: Handle in Jingle creation handler, show specific error message

4. **APPEARS_IN Relationship Creation Failure**

   - **Trigger**: Network error, validation error, 400, 500, or timeout
   - **UI Response**:
     - Show warning: "Jingle created but failed to link to Fabrica. Jingle ID: [id]. Please link manually."
     - Show link to relationship creation page or manual link button
     - Update table to show Jingle but mark relationship as missing
   - **User Action**: Manually create relationship or use provided link
   - **Code Reference**: Handle in relationship creation handler

5. **Timestamp Update Failure**

   - **Trigger**: Network error, 400, 500, or timeout when updating APPEARS_IN timestamp
   - **UI Response**:
     - Show warning: "Jingle created but timestamp may be incorrect (currently 00:00:00). Please verify and update."
     - Show link to edit relationship
   - **User Action**: Manually update timestamp or use provided link
   - **Code Reference**: Handle in timestamp update handler

6. **Invalid Timestamp Format**

   - **Trigger**: Contents contains unparseable timestamp formats
   - **UI Response**:
     - Skip invalid timestamps
     - Show warning message: "Skipped [N] invalid timestamp(s) in contents"
     - Continue with valid timestamps
   - **User Action**: Review contents manually if needed
   - **Code Reference**: Handle in timestamp parsing logic

7. **Empty or Missing Contents**

   - **Trigger**: Fabrica has no `contents` property or it's empty
   - **UI Response**:
     - Show message: "No contents property found. Showing only APPEARS_IN relationships."
     - Display table with only relationship data
   - **User Action**: None required, informational only
   - **Code Reference**: Handle in data fetching/parsing logic

8. **Concurrent Edit Conflicts**
   - **Trigger**: Another user creates a Jingle for the same timestamp while modal is open
   - **UI Response**:
     - On next action, refresh data and show message: "Data updated. Refreshing table..."
     - Update table to show newly created Jingle
     - Disable "ARREGLAR" button for that row
   - **User Action**: None required, automatic refresh
   - **Code Reference**: Handle in data refresh logic

## Loading States

### Initial Data Fetch

- **State Variable**: `isLoading = true`
- **UI Display**:
  - Show loading spinner in center of modal
  - Show text: "Loading Fabrica data..."
  - Disable close button during load
- **Duration**: Typically < 1 second for Fabrica fetch, < 2 seconds for relationships

### Timestamp Parsing

- **State Variable**: `isParsing = true`
- **UI Display**:
  - Show progress indicator: "Parsing timestamps from contents..."
  - Or show skeleton table rows
- **Duration**: Typically < 100ms for parsing

### Jingle Creation

- **State Variable**: `isCreating = { [rowId]: true }` (per-row loading state)
- **UI Display**:
  - Show loading spinner on "ARREGLAR" button
  - Disable button
  - Show "Creando..." text or spinner icon
  - Optionally disable all other "ARREGLAR" buttons during creation
- **Duration**: Typically 1-3 seconds

### Relationship Creation

- **State Variable**: `isLinking = true` (after Jingle creation)
- **UI Display**:
  - Continue showing loading state on button
  - Update text to "Linking..." if visible
- **Duration**: Typically < 1 second

### Table Refresh

- **State Variable**: `isRefreshing = true`
- **UI Display**:
  - Show subtle loading indicator on affected row
  - Or show full table refresh with skeleton
- **Duration**: Typically < 1 second

## Edge Cases and Considerations

1. **Multiple timestamps on same line**: Handle gracefully, use first detected timestamp
2. **Invalid timestamp formats**: Skip lines that don't parse correctly
3. **Duplicate timestamps**: Show all occurrences, allow user to choose which to fix
4. **Very long contenido strings**: Truncate in table display, show full in tooltip or detail view
5. **Concurrent edits**: If another user creates a Jingle while modal is open, refresh on next action
6. **Network errors**: Show error message, allow retry
7. **Empty contenido**: If timestamp exists but no content extracted, use empty string or "-"
8. **Timestamp in seconds vs HH:MM:SS**: Always convert to seconds for API, display as HH:MM:SS in UI

## Future Enhancements

1. **Bulk creation**: Allow selecting multiple rows and creating all Jingles at once
2. **Edit existing Jingles**: Allow editing Jingle title/comment from the table
3. **Delete relationships**: Allow removing incorrect APPEARS_IN relationships
4. **Validation feedback**: Show which timestamps are problematic and why
5. **Undo/Redo**: Track changes and allow undoing Jingle creations
6. **Export/Import**: Export table data for external review

## Validation Report

**Validation Date**: 2025-11-30

### Code References Validation

✅ **All code references validated:**

- ✅ `frontend/src/components/admin/CleanupResultsModal.tsx:320-334` - Verified: Entity card with "Ver Entidad" button exists at specified lines
- ✅ `frontend/src/lib/utils/timestampParser.ts` - Verified: `parseTimestampFromText()` function exists and matches specification
- ✅ `frontend/src/lib/utils/timestamp.ts` - Verified: `parseTimestampToSeconds()` and `formatSecondsToTimestamp()` functions exist
- ✅ `frontend/src/lib/api/client.ts:681` - Verified: `createJingle()` method exists at specified line
- ✅ `backend/src/server/api/admin.ts:1455` - Verified: Jingle creation endpoint exists (POST /:type where type=jingles)
- ✅ `backend/src/server/api/admin.ts:831` - Verified: APPEARS_IN relationship creation endpoint exists
- ✅ `backend/src/server/db/cleanup/scripts/fabricas.ts:26` - Verified: `findFabricasMissingJingles()` function exists

### API Endpoints Validation

✅ **All API endpoints validated:**

- ✅ `GET /api/admin/:type/:id` - Verified: Returns entity properties only, does not include relationships
  - **Note**: For Fabricas, use `type=fabricas`. Relationships must be fetched separately.
  - **Alternative**: Use `adminApi.getFabricaJingles(fabricaId)` which returns Jingles with APPEARS_IN relationship data
- ✅ `POST /api/admin/:type` where `type=jingles` - Verified: Creates Jingle entity, auto-creates APPEARS_IN with timestamp: 0 if fabricaId provided
- ✅ `POST /api/admin/relationships/appears_in` - Verified: Creates APPEARS_IN relationship, handles timestamp normalization

### Data Structures Validation

✅ **All data structures validated:**

- ✅ `TimestampRow` interface - Validated: Matches TypeScript types in codebase
- ✅ `Fabrica` interface - Validated: Matches `frontend/src/types/index.ts:81-94`
- ✅ `Jingle` interface - Validated: Matches `frontend/src/types/index.ts:123-152`
- ✅ `APPEARS_IN` relationship properties - Validated: Matches schema documentation

### Discrepancies Found

⚠️ **Minor discrepancies corrected:**

1. **API Endpoint Path**: Documentation initially stated `GET /api/admin/fabricas/:fabricaId` but actual endpoint is `GET /api/admin/:type/:id` where `type=fabricas` - **CORRECTED**
2. **Relationships Not Included**: GET endpoint does not include relationships in response - **DOCUMENTED** - Must fetch separately using `getFabricaJingles()` or filter relationships client-side
3. **Jingle Creation Flow**: Backend auto-creates APPEARS_IN with timestamp: 0 when fabricaId is provided - **DOCUMENTED** - Must update relationship separately to set correct timestamp

### Validation Status

✅ **All validations passed** - Documentation is accurate and ready for implementation.

## Related Documentation

### Workflow Documentation

- **Parent Workflow**: [`docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`](../WORKFLOW_011_database-cleanup.md)
  - Step 6a references this feature for fixing Fabrica timestamp mismatches

### API Contracts

- **Admin API**: [`docs/5_backend_api-contracts/contracts/admin-api.md`](../../../5_backend_api-contracts/contracts/admin-api.md)

  - GET /api/admin/:type/:id (lines 156-185)
  - POST /api/admin/:type (lines 188-250) - Jingle creation
  - POST /api/admin/relationships/:relType (lines 460-531) - APPEARS_IN creation

- **Cleanup Scripts API**: [`docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`](../../../5_backend_api-contracts/contracts/admin-api-cleanup.md)
  - Documents cleanup script execution and results format

### Schema Documentation

- **APPEARS_IN Relationship**: [`docs/4_backend_database-schema/schema/relationships.md`](../../../4_backend_database-schema/schema/relationships.md#relationship-type-appears_in) (lines 16-89)

  - Relationship structure, properties, and order management

- **Jingle Node**: [`docs/4_backend_database-schema/schema/nodes.md`](../../../4_backend_database-schema/schema/nodes.md#node-type-jingle) (lines 180-398)

  - Jingle entity properties including `title` and `comment`

- **Fabrica Node**: [`docs/4_backend_database-schema/schema/nodes.md`](../../../4_backend_database-schema/schema/nodes.md#node-type-fabrica) (lines 800-1003)
  - Fabrica entity properties including `contents` property

### Bug Reports

- **BUG_0015**: [`docs/0_debug-logs/BUG_0015.md`](../../../0_debug-logs/BUG_0015.md)
  - Related to Fabrica contents validation and timestamp parsing

## Implementation Checklist

### Phase 1: UI Components

- [ ] **Task 1.1**: Add "ARREGLAR" button to CleanupResultsModal

  - Location: Below "Ver Entidad" button in entity card
  - Style: Match existing button styles
  - Handler: Open FabricaTimestampFixModal with fabricaId
  - **Dependencies**: None
  - **Estimated Time**: 30 minutes

- [ ] **Task 1.2**: Create FabricaTimestampFixModal component
  - File: `frontend/src/components/admin/FabricaTimestampFixModal.tsx`
  - Props: `{ fabricaId: string, isOpen: boolean, onClose: () => void }`
  - State: Loading, error, timestamp rows
  - **Dependencies**: None
  - **Estimated Time**: 2-3 hours

### Phase 2: Data Fetching and Parsing

- [ ] **Task 2.1**: Implement Fabrica data fetching

  - Use `adminApi.getFabrica(fabricaId)` to fetch Fabrica
  - Use `adminApi.getFabricaJingles(fabricaId)` to fetch APPEARS_IN relationships
  - Handle loading and error states
  - **Dependencies**: Task 1.2
  - **Estimated Time**: 1 hour

- [ ] **Task 2.2**: Implement timestamp parsing from contents

  - Use `parseTimestampFromText()` from `timestampParser.ts`
  - Implement `parseContentByTimestamps()` algorithm
  - Extract content strings between timestamps
  - **Dependencies**: Task 2.1
  - **Estimated Time**: 2 hours

- [ ] **Task 2.3**: Implement unified table building
  - Merge timestamps from contents and APPEARS_IN relationships
  - Handle duplicate timestamps (merge into single row)
  - Sort by timestamp (ascending)
  - **Dependencies**: Task 2.2
  - **Estimated Time**: 1-2 hours

### Phase 3: Jingle Creation

- [ ] **Task 3.1**: Implement Jingle creation flow

  - Create confirmation dialog/form (optional)
  - Pre-fill title and comment from contenido
  - Call `adminApi.createJingle()` with fabricaId
  - Handle creation errors
  - **Dependencies**: Task 2.3
  - **Estimated Time**: 2 hours

- [ ] **Task 3.2**: Implement APPEARS_IN relationship creation/update

  - After Jingle creation, create or update APPEARS_IN relationship
  - Set correct timestamp (in seconds)
  - Handle relationship creation errors
  - **Dependencies**: Task 3.1
  - **Estimated Time**: 1-2 hours

- [ ] **Task 3.3**: Implement table refresh after creation
  - Refresh Fabrica and relationships data
  - Update table to show newly created Jingle
  - Disable "ARREGLAR" button for that row
  - **Dependencies**: Task 3.2
  - **Estimated Time**: 1 hour

### Phase 4: Error Handling and Polish

- [ ] **Task 4.1**: Implement comprehensive error handling

  - Network errors
  - Validation errors
  - API errors
  - User-friendly error messages
  - **Dependencies**: Tasks 2.1, 3.1, 3.2
  - **Estimated Time**: 2 hours

- [ ] **Task 4.2**: Implement loading states

  - Loading spinners
  - Disabled buttons during operations
  - Progress indicators
  - **Dependencies**: All previous tasks
  - **Estimated Time**: 1 hour

- [ ] **Task 4.3**: Implement UI/UX polish
  - Modal styling
  - Table styling
  - Button states
  - Accessibility features
  - **Dependencies**: Task 1.2
  - **Estimated Time**: 2-3 hours

### Phase 5: Testing

- [ ] **Task 5.1**: Manual testing
  - Test with Fabricas that have mismatches
  - Test Jingle creation flow
  - Test error scenarios
  - Test edge cases
  - **Dependencies**: All implementation tasks
  - **Estimated Time**: 2-3 hours

**Total Estimated Time**: 18-24 hours

## Technical Specifications

### Component Structure

**FabricaTimestampFixModal Component**

```typescript
interface FabricaTimestampFixModalProps {
  fabricaId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TimestampRow {
  timestamp: number; // seconds
  timestampFormatted: string; // "HH:MM:SS"
  contenido: string; // Parsed from contents property
  jingle: {
    id: string;
    title?: string;
    comment?: string;
  } | null;
  source: "contents" | "appears_in" | "both";
  rowId: string; // Unique ID for React key
}

interface ComponentState {
  fabrica: Fabrica | null;
  rows: TimestampRow[];
  isLoading: boolean;
  isParsing: boolean;
  error: string | null;
  creatingRows: Set<string>; // Set of rowIds being created
}
```

### State Management

- **Local State**: Use React `useState` hooks for component state
- **Data Fetching**: Use `useEffect` with async functions
- **Error Handling**: Local error state with user-friendly messages
- **Loading States**: Separate loading states for different operations

### Data Fetching Strategy

1. **Initial Load**:

   - Fetch Fabrica: `adminApi.getFabrica(fabricaId)`
   - Fetch Jingles with relationships: `adminApi.getFabricaJingles(fabricaId)`
   - Parse contents property for timestamps
   - Build unified table

2. **After Jingle Creation**:
   - Refresh Jingles: `adminApi.getFabricaJingles(fabricaId)`
   - Re-parse contents (if needed)
   - Rebuild unified table
   - Update UI

### Algorithm Details

**Content Parsing Algorithm** (see Content Parsing Algorithm section above)

**Timestamp Merging Logic**:

1. Create Map<timestamp (seconds), TimestampRow>
2. Add all timestamps from contents parsing
3. Add all timestamps from APPEARS_IN relationships
4. For duplicates: Merge into single row with `source: "both"`
5. Convert Map to sorted array (by timestamp)

**Error Recovery**:

- If parsing fails: Continue with available data, show warning
- If fetch fails: Show error, allow retry
- If creation fails: Keep row editable, show error, allow retry

## Testing Considerations

### Test Scenarios

1. **Valid Timestamp Parsing**

   - Test with HH:MM:SS format (e.g., "01:23:45")
   - Test with MM:SS format (e.g., "02:30")
   - Test with M:SS format (e.g., "5:30")
   - Test multiple timestamps in contents
   - Test timestamps with surrounding text

2. **Invalid Timestamp Handling**

   - Test with invalid formats (e.g., "25:70:99")
   - Test with no timestamps in contents
   - Test with empty contents
   - Test with null/undefined contents

3. **Missing Content Handling**

   - Test with timestamp in APPEARS_IN but not in contents
   - Test with timestamp in contents but no content text
   - Test with empty content strings

4. **Jingle Creation Success**

   - Test creating Jingle with valid data
   - Test APPEARS_IN relationship creation
   - Test timestamp update
   - Test table refresh after creation

5. **Jingle Creation Failure**

   - Test network error during creation
   - Test validation error (missing required fields)
   - Test 500 error from server
   - Test timeout scenarios

6. **Relationship Creation Failure**

   - Test network error during relationship creation
   - Test validation error
   - Test duplicate relationship error
   - Test recovery (Jingle created but relationship failed)

7. **Concurrent Edit Scenarios**

   - Test if another user creates Jingle while modal is open
   - Test refresh behavior
   - Test conflict resolution

8. **Edge Cases**
   - Test with very long contenido strings
   - Test with duplicate timestamps
   - Test with timestamps at boundaries (00:00:00, 23:59:59)
   - Test with Fabricas that have many Jingles (100+)
   - Test with Fabricas that have no Jingles

### Test Data Requirements

- Fabricas with various contents formats
- Fabricas with mismatched timestamp counts
- Fabricas with no contents property
- Fabricas with empty contents
- Fabricas with invalid timestamp formats
- Fabricas with many APPEARS_IN relationships

---

**Last Updated**: 2025-11-30
**Last Validated**: 2025-11-30
**Status**: ready_for_implementation - Feature specification complete, validated, and ready for implementation
