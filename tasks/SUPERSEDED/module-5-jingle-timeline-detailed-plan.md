# Module 5: JingleTimeline Component Updates - Detailed Plan

## Overview

This module refactors the JingleTimeline component to show all jingles always visible as individual expandable/collapsible rows, matching the styling of the JingleMetadata panel. Each row can be independently expanded or collapsed, and remembers its state when a jingle becomes active or inactive.
As the Youtube player progresses, the Future Jingles will become Current and the row will be removed from the Future Jingles Container, while the Current Jingle will be added to the Past Jingles Container as a new Row.

**Approach:** We will create a reusable `JingleTimelineRow` component in `JingleTimeline.tsx` and export it directly. Then update `FabricaPage.tsx` to use `JingleTimelineRow` directly instead of its current `CollapsedJingleRow` placeholder. The `JingleTimeline` wrapper component will be removed as it's redundant - FabricaPage already handles the mapping logic. This approach allows for cascading styling between components at a later stage and simplifies the component structure.

## Current State

### ✅ Already Completed (Module 3)

- **FabricaPage Layout**: Continuous scrollable list with past jingles, current jingle (player + metadata), and future jingles
- **State Management**: `expandedJingleIds` state exists in FabricaPage (line 27)
- **Toggle Handler**: `handleToggleExpand` function exists in FabricaPage (lines 228-239)
- **Placeholder Component**: `CollapsedJingleRow` component exists in FabricaPage (lines 296-390) but only has placeholder expanded view

### ⚠️ Current Issues

- **JingleTimeline.tsx**: Still has old table-based structure with header row and single-expanded view logic (not used)
- **FabricaPage.tsx**: Uses inline `CollapsedJingleRow` placeholder component (lines 296-390)
- **Inconsistency**: Two different implementations - needs consolidation
- **Unused Component**: `JingleTimeline` wrapper component exists but is never used (only `JingleTimelineItem` type is imported)

## Goals

1. **Always Show All Jingles**: Remove the single-expanded view that hides other jingles, has been addressed by the approach to cover Past, Current and Future jingles across containers.
2. **Independent Expand/Collapse**: Each jingle row can be expanded/collapsed independently
3. **Consistent Styling**: Match the JingleMetadata panel styling (rounded corners, box layout)
4. **State Management**: Remember expand/collapse state when jingle becomes active/inactive
5. **Proper Visual Hierarchy**: Use table format similar to Metadata panel for expanded view

---

## Task 5.1: Refactor to Show All Jingles Always Visible

**File:** `frontend/src/components/player/JingleTimeline.tsx`

### 5.1.1 Remove Header Row

**Status:** ⚠️ **PENDING** - Old table header still exists in JingleTimeline.tsx

**Current Code:** Lines 290-308 in `JingleTimeline.tsx`

- Remove the grid header row with column labels ("Tiempo", "Jingle", "Jinglero", etc.)
- This is the old table-based layout header from the previous implementation

**Action:**

- Delete lines 290-308 completely
- This header row is no longer needed since we're moving to an expandable box format (per feedback item 6)

### 5.1.2 Remove Single-Expanded View Logic

**Status:** ⚠️ **PENDING** - Old single-expanded view still exists in JingleTimeline.tsx

**Current Code:** Lines 136-281 in `JingleTimeline.tsx`

- Remove the entire `if (isExpanded && expandedJingle)` block (lines 171-281)
- Remove the `expandedJingleId` state management (line 136) - this is internal state that conflicts with parent-controlled state
- Remove the `expandedJingle` calculation (lines 145-147)
- Remove the `isExpanded`, `isActiveExpanded`, `buttonsDisabled` variables (lines 149-151)
- Remove `handleCollapse` function (lines 165-169)
- Remove auto-expand useEffect (lines 138-143) - expand state will be controlled by FabricaPage

**Action:**

- Delete lines 136-169 (state and handlers for single-expanded view)
- Delete lines 171-281 (expanded view rendering)
- This removes the old behavior where only one jingle could be expanded at a time (per feedback item 8)

### 5.1.3 Create JingleTimelineRow Sub-Component

**Status:** ⚠️ **PENDING** - Needs to be created in JingleTimeline.tsx

**Location:** Inside `JingleTimeline.tsx` file, before the main component

**Purpose:** Render individual jingle rows with expand/collapse functionality. This will replace the placeholder `CollapsedJingleRow` currently in FabricaPage.

**Note:** This component should match the styling and structure of `JingleMetadata` component for consistency.

**Props Interface:**

```typescript
interface JingleTimelineRowProps {
  jingle: JingleTimelineItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSkipTo: () => void;
}
```

**Features:**

- Collapsed view: Shows comentario field as text (if available)
- Expanded view: Shows full table with all metadata fields
- Expand/collapse icon (▼/▲)
- Skip-to icon (⏩)
- Active highlighting (background color `#f0f7ff`)
- Rounded corners matching Metadata panel styling

**Collapsed View Structure:**

```tsx
<div
  style={{
    backgroundColor: isActive ? "#f0f7ff" : "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "8px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  {/* Left: Timestamp + Comentario */}
  <div style={{ flex: 1 }}>
    <div
      style={{
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#666",
        marginBottom: "4px",
      }}
    >
      {timestampFormatted}
    </div>
    <div style={{ fontSize: "14px", color: "#555" }}>
      {jingle.comment || "Sin comentario"}
    </div>
  </div>

  {/* Right: Icons */}
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <button onClick={onSkipTo} style={{ ...iconButtonStyle }}>
      ⏩
    </button>
    <button onClick={onToggleExpand} style={{ ...iconButtonStyle }}>
      {isExpanded ? "▲" : "▼"}
    </button>
  </div>
</div>
```

**Expanded View Structure:**

```tsx
<div
  style={{
    backgroundColor: isActive ? "#f0f7ff" : "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "8px",
    overflow: "hidden",
  }}
>
  {/* Header with timestamp, title, and icons */}
  <div
    style={{
      borderBottom: "2px solid #eee",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: "14px",
          color: "#666",
        }}
      >
        {timestampFormatted}
      </div>
      <div style={{ fontWeight: "bold", fontSize: "16px", marginTop: "4px" }}>
        {displayTitle}
      </div>
    </div>
    <div style={{ display: "flex", gap: "8px" }}>
      <button onClick={onSkipTo} style={{ ...iconButtonStyle }}>
        ⏩
      </button>
      <button onClick={onToggleExpand} style={{ ...iconButtonStyle }}>
        ▲
      </button>
    </div>
  </div>

  {/* Table with metadata */}
  <div style={{ padding: "20px" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "15px",
      }}
    >
      <tbody>
        {/* Titulo row */}
        {/* Cancion row */}
        {/* Autor rows (multiple) */}
        {/* Jinglero rows (multiple) */}
        {/* Tematica rows (multiple) */}
        {/* Comentario row (if exists) */}
      </tbody>
    </table>
  </div>
</div>
```

**Icon Button Style:**

```typescript
const iconButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "20px",
  padding: "4px 8px",
  color: "#1976d2",
  borderRadius: "4px",
  transition: "background-color 0.2s",
};
```

### 5.1.4 Export JingleTimelineRow Component

**Status:** ⚠️ **PENDING** - Component needs to be exported for use in FabricaPage

**Decision:** The `JingleTimeline` wrapper component is **NOT NEEDED** - FabricaPage already handles the mapping logic. We will:

1. Create `JingleTimelineRow` component (as defined in 5.1.3)
2. Export it as a named export: `export { JingleTimelineRow }`
3. Keep `JingleTimelineItem` type export (already exists)
4. **Remove or deprecate** the `JingleTimeline` wrapper component entirely

**Why:** FabricaPage already maps over `pastJingles` and `futureJingles` separately (lines 471-479 and 527-535), so a wrapper component that just does `jingles.map()` is redundant.

**File Structure:**

```tsx
// Exports from JingleTimeline.tsx:
export type { JingleTimelineItem, JingleArtista, JingleCancion };
export { JingleTimelineRow }; // New export
// JingleTimeline wrapper component can be removed or deprecated
```

### 5.1.5 Implement Table Structure in Expanded View

**Status:** ⚠️ **PENDING** - Table structure needs to match JingleMetadata.tsx format

**Match JingleMetadata Table Format:**

**Reference:** See `JingleMetadata.tsx` lines 250-431 for the table structure to match

**Table Columns:**

- Label column: 120px width, right-aligned, bold, color `#666`
- Data column: Flexible width, left-aligned, text-wrap enabled
- Navigation column: 40px width, placeholder for future links

**Table Rows (in order):**

1. **Titulo del Jingle**: Label spans all columns, data spans 2 columns
2. **Cancion**: Label + data + empty nav cell
3. **Autor**: Multiple rows if multiple autores (use `rowSpan` for label)
4. **Jinglero**: Multiple rows if multiple jingleros (use `rowSpan` for label)
5. **Tematica**: One row per tematica (use `rowSpan` for label)
6. **Comentario**: Label + data spanning 2 columns (if comment exists)

**Cell Styles:**

```typescript
const labelCellStyle: React.CSSProperties = {
  width: "120px",
  padding: "8px 12px 8px 0",
  color: "#666",
  fontWeight: "600",
  verticalAlign: "top",
};

const dataCellStyle: React.CSSProperties = {
  padding: "8px 0",
  color: "#333",
  wordWrap: "break-word",
  wordBreak: "break-word",
};

const navCellStyle: React.CSSProperties = {
  width: "40px",
  padding: "8px 0",
};
```

**Handle Multiple Values:**

- Autor: If multiple, first row has label with `rowSpan={autores.length}`, subsequent rows have empty label cell
- Jinglero: Same pattern as Autor
- Tematica: Label with `rowSpan={tematicas.length}`, one row per tematica

**Handle Missing Data:**

- Autor: Show "A CONFIRMAR" in italic, color `#999`
- Jinglero: Show "Anonimo" in italic, color `#999`
- Cancion: Show "A CONFIRMAR" in italic, color `#999`
- Tematica: Only show if tematicas array exists and has items

---

## Task 5.2: Define JingleTimelineRow Props Interface

**Status:** ⚠️ **PENDING** - Props interface needs to be defined for the row component

**File:** `frontend/src/components/player/JingleTimeline.tsx`

### 5.2.1 Define JingleTimelineRowProps Interface

**Location:** Before the `JingleTimelineRow` component definition

**Important Distinction:**

- `JingleTimelineItem` = **TypeScript interface** (data structure) - defines what properties a jingle object has
- `JingleTimelineRow` = **React component** (UI rendering) - takes `JingleTimelineItem` data and renders it as a row

**Props Interface:**

```typescript
export interface JingleTimelineRowProps {
  /** Jingle data to display (uses JingleTimelineItem interface) */
  jingle: JingleTimelineItem;
  /** Whether this jingle is currently active/playing */
  isActive?: boolean;
  /** Whether this jingle row is expanded */
  isExpanded: boolean;
  /** Callback when user toggles expand/collapse */
  onToggleExpand: () => void;
  /** Callback when user clicks skip-to button */
  onSkipTo: () => void;
}
```

**Note:**

- `JingleTimelineItem` is a **type** (already exists, lines 24-33)
- `JingleTimelineRow` is a **component** (needs to be created)
- `JingleTimelineRowProps` defines the props for the component
- The component receives `JingleTimelineItem` data and renders UI

---

## Task 5.3: Helper Functions

**Status:** ⚠️ **PARTIALLY COMPLETE** - Most helpers exist, need to add tematica handling

**Location:** Inside `JingleTimeline.tsx`, before components

### 5.3.1 Add Helper Functions (if not already present)

**Check if functions exist:**

- `formatJingleros` - ✅ Already exists (lines 49-64)
- `formatAutores` - ✅ Already exists (lines 69-84)
- `formatCancion` - ✅ Already exists (lines 89-94)
- `getJingleDisplayTitle` - ✅ Already exists (lines 100-113)

**Add Tematica Handling:**

**Note:** Need to check if `JingleTimelineItem` interface includes `tematicas` field. If not, may need to add it or fetch tematicas when needed.

**Add helper function for tematicas:**

```typescript
/**
 * Normalizes tematicas array from jingle data
 */
function normalizeTematicas(
  tematicas: any[] | any | null | undefined
): Array<{ id: string; name: string }> {
  if (!tematicas) return [];
  if (Array.isArray(tematicas)) {
    return tematicas
      .filter((t) => t && t.name)
      .map((t) => ({ id: t.id || "", name: t.name }));
  }
  // Single tematica object
  if (tematicas.name) {
    return [{ id: tematicas.id || "", name: tematicas.name }];
  }
  return [];
}
```

**Note:** The expanded view will render each tematica as a separate row (similar to JingleMetadata.tsx), so we need an array of tematica objects, not a formatted string.

---

## Task 5.4: Update FabricaPage Integration

**File:** `frontend/src/pages/FabricaPage.tsx`

### 5.4.1 Toggle Expand Handler

**Status:** ✅ **ALREADY EXISTS** - Handler already implemented in FabricaPage

**Current Code:** Lines 228-239

- `handleToggleExpand` function already exists and works correctly
- No changes needed

### 5.4.2 Replace CollapsedJingleRow with JingleTimelineRow Component

**Status:** ⚠️ **PENDING** - Currently uses CollapsedJingleRow placeholder, needs to use JingleTimelineRow component

**Current Code:**

- Lines 296-390: `CollapsedJingleRow` component definition (placeholder)
- Lines 471-479: Past jingles rendered with `CollapsedJingleRow`
- Lines 527-535: Future jingles rendered with `CollapsedJingleRow`

**Action:**

1. Update import in FabricaPage.tsx (line 6):

   ```tsx
   // Change from:
   import JingleTimeline, {
     type JingleTimelineItem,
   } from "../components/player/JingleTimeline";

   // To:
   import {
     JingleTimelineRow,
     type JingleTimelineItem,
   } from "../components/player/JingleTimeline";
   ```

2. Remove `CollapsedJingleRow` component definition (lines 296-390)

3. Replace past jingles rendering (lines 471-479):

   ```tsx
   {
     pastJingles.map((jingle) => (
       <JingleTimelineRow
         key={jingle.id}
         jingle={jingle}
         isActive={jingle.isActive || jingle.id === activeJingleId}
         isExpanded={expandedJingleIds.has(jingle.id)}
         onToggleExpand={() => handleToggleExpand(jingle.id)}
         onSkipTo={() => handleSkipToJingle(jingle)}
       />
     ));
   }
   ```

4. Replace future jingles rendering (lines 527-535):
   ```tsx
   {
     futureJingles.map((jingle) => (
       <JingleTimelineRow
         key={jingle.id}
         jingle={jingle}
         isActive={jingle.isActive || jingle.id === activeJingleId}
         isExpanded={expandedJingleIds.has(jingle.id)}
         onToggleExpand={() => handleToggleExpand(jingle.id)}
         onSkipTo={() => handleSkipToJingle(jingle)}
       />
     ));
   }
   ```

**Note:** The current jingle is handled separately in the main layout (player + metadata panel), so we only render past and future jingles as rows. The mapping logic stays in FabricaPage - no wrapper component needed.

### 5.4.3 Expand/Collapse State Management

**Status:** ✅ **ALREADY EXISTS** - State management already implemented

**Current Code:**

- Lines 27-28: `expandedJingleIds` and `previousExpandedStates` state already exist
- Note: There may be a useEffect for auto-expanding active jingles (need to verify if it exists)

**Verification:** Ensure that when a jingle becomes active, it's automatically expanded, and when it becomes inactive, its previous state is restored. This logic should work with the new JingleTimeline component structure.

---

## Implementation Checklist

### Phase 1: Remove Old Code

- [ ] Remove header row (lines 290-308)
- [ ] Remove single-expanded view rendering (lines 171-281)
- [ ] Remove expandedJingleId state (line 136)
- [ ] Remove expandedJingle calculation (lines 145-147)
- [ ] Remove isExpanded, isActiveExpanded, buttonsDisabled variables (lines 149-151)
- [ ] Remove handleCollapse function (lines 165-169)
- [ ] Remove auto-expand useEffect (lines 138-143)

### Phase 2: Create JingleTimelineRow Component

- [ ] Define JingleTimelineRowProps interface
- [ ] Create JingleTimelineRow component function
- [ ] Implement collapsed view with comentario display
- [ ] Implement expanded view with table structure
- [ ] Add expand/collapse icon (▼/▲)
- [ ] Add skip-to icon (⏩)
- [ ] Add active highlighting styling
- [ ] Match Metadata panel styling (rounded corners, box shadow)
- [ ] Handle multiple Autores (rowSpan)
- [ ] Handle multiple Jingleros (rowSpan)
- [ ] Handle multiple Tematicas (one row each)
- [ ] Add text wrapping to data cells
- [ ] Handle missing data (A CONFIRMAR, Anonimo)

### Phase 3: Export JingleTimelineRow

- [ ] Define JingleTimelineRowProps interface
- [ ] Export JingleTimelineRow as named export
- [ ] Keep JingleTimelineItem type export
- [ ] Remove or deprecate JingleTimeline wrapper component (if not needed elsewhere)

### Phase 4: Integration

- [x] ~~Add handleToggleExpand to FabricaPage~~ ✅ Already exists (lines 228-239)
- [ ] Update import in FabricaPage to import JingleTimelineRow instead of JingleTimeline
- [ ] Remove CollapsedJingleRow component from FabricaPage (lines 296-390)
- [ ] Replace CollapsedJingleRow usage with JingleTimelineRow for past jingles (keep existing map logic)
- [ ] Replace CollapsedJingleRow usage with JingleTimelineRow for future jingles (keep existing map logic)
- [ ] Verify expand/collapse state management works correctly
- [ ] Test that active jingle highlighting works

### Phase 5: Testing

- [ ] Test collapsed view shows comentario correctly
- [ ] Test expanded view shows all fields correctly
- [ ] Test multiple Autores display correctly
- [ ] Test multiple Jingleros display correctly
- [ ] Test multiple Tematicas display correctly
- [ ] Test expand/collapse toggle works
- [ ] Test skip-to functionality works
- [ ] Test active jingle highlighting
- [ ] Test state persistence when jingle becomes active/inactive
- [ ] Test styling matches Metadata panel

---

## Testing Scenarios

### Scenario 1: Basic Expand/Collapse

1. Load FabricaPage with jingles
2. Click expand icon (▼) on a jingle row
3. Verify row expands showing full table
4. Verify icon changes to ▲
5. Click collapse icon (▲)
6. Verify row collapses showing only comentario
7. Verify icon changes to ▼

### Scenario 2: Multiple Autores/Jingleros

1. Find a jingle with multiple Autores
2. Expand the row
3. Verify Autor label has correct rowSpan
4. Verify each Autor appears on separate row
5. Repeat for Jingleros

### Scenario 3: Multiple Tematicas

1. Find a jingle with multiple Tematicas
2. Expand the row
3. Verify Tematica label has correct rowSpan
4. Verify each Tematica appears on separate row

### Scenario 4: Active Jingle Highlighting

1. Play video until a jingle becomes active
2. Verify active jingle row has background color `#f0f7ff`
3. Verify non-active jingles have white background

### Scenario 5: State Persistence

1. Expand a jingle row manually
2. Play video until that jingle becomes active
3. Verify jingle remains expanded
4. Play video until next jingle becomes active
5. Verify previous jingle restores to its previous state (expanded)
6. Verify new active jingle is expanded

### Scenario 6: Skip-to Functionality

1. Click skip-to icon (⏩) on a jingle row
2. Verify video seeks to correct timestamp
3. Verify active jingle updates
4. Verify row highlighting updates

### Scenario 7: Missing Data Handling

1. Find a jingle with missing Autor
2. Expand the row
3. Verify shows "A CONFIRMAR" in italic, color #999
4. Repeat for missing Jinglero (should show "Anonimo")
5. Repeat for missing Cancion (should show "A CONFIRMAR")

### Scenario 8: Styling Consistency

1. Compare expanded timeline row with Metadata panel
2. Verify rounded corners match
3. Verify box shadow matches
4. Verify table structure matches
5. Verify cell padding and spacing matches

---

## Edge Cases to Handle

1. **Empty comentario**: Show "Sin comentario" or similar placeholder
2. **No tematicas**: Don't show Tematica row at all
3. **Very long comentario**: Ensure text wraps correctly
4. **Very long titles**: Ensure text wraps correctly
5. **No jingles**: Component should render empty (FabricaPage handles empty state separately)
6. **All jingles collapsed**: Should still show all rows, just collapsed
7. **All jingles expanded**: Should show all rows expanded
8. **Rapid expand/collapse clicks**: Should handle gracefully without errors

---

## Code Structure Reference

### File: `frontend/src/components/player/JingleTimeline.tsx`

```
JingleTimeline.tsx
├── Imports
├── Interfaces
│   ├── JingleArtista (exported)
│   ├── JingleCancion (exported)
│   ├── JingleTimelineItem (exported)
│   └── JingleTimelineRowProps (new, exported)
├── Helper Functions
│   ├── formatJingleros
│   ├── formatAutores
│   ├── formatCancion
│   ├── getJingleDisplayTitle
│   └── normalizeTematicas (new)
├── JingleTimelineRow Component (new, exported)
│   ├── Props interface (JingleTimelineRowProps)
│   ├── Collapsed view rendering
│   ├── Expanded view rendering
│   └── Table structure in expanded view
└── JingleTimeline Component (deprecated/removed)
    └── No longer needed - FabricaPage handles mapping directly
```

**Exports:**

- `export type { JingleTimelineItem, JingleArtista, JingleCancion }`
- `export type { JingleTimelineRowProps }`
- `export { JingleTimelineRow }`

---

## Dependencies

**Module 5 depends on:**

- ✅ Module 3: FabricaPage Layout Refactor (for state management)
- ✅ Module 4: JingleMetadata Component Updates (for styling reference)

**Module 5 enables:**

- Module 7: FabricaPage State Management (expand/collapse logic integration)

---

## Implementation Order

1. **Task 5.1.1-5.1.2**: Remove Old Code (clean up JingleTimeline.tsx)
2. **Task 5.2**: Define JingleTimelineRowProps Interface
3. **Task 5.3**: Add Helper Functions (normalizeTematicas)
4. **Task 5.1.3**: Create JingleTimelineRow Component (core functionality)
5. **Task 5.1.5**: Implement Table Structure in Expanded View (detail work)
6. **Task 5.1.4**: Export JingleTimelineRow Component
7. **Task 5.4**: Update FabricaPage Integration (replace CollapsedJingleRow with JingleTimelineRow)

---

## Notes

- The collapsed view showing comentario is temporary behavior per feedback item 21
- Navigation column in table is placeholder for future feature (feedback item 12)
- Expand/Collapse icons on entity rows (Cancion, Autor, etc.) are disabled for now (feedback item 23)
- The component should handle all jingles being visible simultaneously (feedback item 8)
- Scroll behavior is handled by parent FabricaPage component (feedback item 7)
- **Architecture Decision**: Refactoring JingleTimeline.tsx to be reusable allows for cascading styling between components at a later stage (Option A chosen)
- **Current State**: FabricaPage has placeholder `CollapsedJingleRow` that needs to be replaced with the refactored `JingleTimeline` component

## Key Differences from Current Implementation

### Current (Module 3):

- FabricaPage has inline `CollapsedJingleRow` component (placeholder)
- JingleTimeline.tsx still has old table-based structure (not used)
- `JingleTimeline` wrapper component exists but is never used
- Two separate implementations

### Target (Module 5):

- JingleTimeline.tsx exports reusable `JingleTimelineRow` component
- FabricaPage uses `JingleTimelineRow` directly (no wrapper needed)
- FabricaPage keeps existing mapping logic (lines 471-479, 527-535)
- Single consistent implementation across the codebase
- Simpler architecture: no redundant wrapper component
