# Technical Specification: FabricaPage Feedback Implementation

## Overview

This document outlines the technical specification for implementing all feedback items from `feedback-fabrica-page-2.8.md`. The implementation is broken down into logical modules to ensure systematic execution.

---

### Module 1: Backend API Changes

#### 1.1 Update `/jingles/:id` Endpoint to Support Multiple Jingleros and Autores

**File:** `backend/src/server/api/public.ts`

**Change Details:**

- Modify the Cypher query in `router.get('/jingles/:id')` (lines 532-598) to:
- Change RETURN clause to use `collect(DISTINCT ...)` for both relationships to aggregate multiple matches into arrays
- Update response structure to return arrays instead of single objects
- **Note:** The `OPTIONAL MATCH` statements remain unchanged - only the RETURN clause needs modification

**Specific Changes:**

1. **Keep OPTIONAL MATCH statements unchanged** (lines 547-550):

   ```cypher
   OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(j)
   OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
   ```

   These remain as-is. Neo4j will return multiple rows when multiple jingleros/autores exist, and the `collect(DISTINCT ...)` in RETURN will aggregate them.

2. **Update RETURN clause** (lines 564-565):

   Change from:

   ```cypher
   jinglero {.*} AS jinglero,
   autor {.*} AS autor,
   ```

   To:

   ```cypher
   collect(DISTINCT jinglero {.*}) AS jingleros,
   collect(DISTINCT autor {.*}) AS autores,
   ```

3. **Update response building** (lines 585-586):

   Change from:

   ```typescript
   jinglero: record.jinglero ? convertNeo4jDates(record.jinglero) : null,
   autor: record.autor ? convertNeo4jDates(record.autor) : null,
   ```

   To:

   ```typescript
   jingleros: record.jingleros
     ? record.jingleros
         .filter((j: any) => j && j.id)
         .map((j: any) => convertNeo4jDates(j))
     : [],
   autores: record.autores
     ? record.autores
         .filter((a: any) => a && a.id)
         .map((a: any) => convertNeo4jDates(a))
     : [],
   ```

#### 1.2 Fix Date Parsing in `convertNeo4jDates` Function

**File:** `backend/src/server/api/public.ts`

**Change Details:**

- Add validation to handle cases where date might already be an ISO string (e.g., "2025-06-05T00:00:00Z")
- Add fallback for invalid date formats
- Ensure consistent ISO string output
- Handle null/undefined/empty string values gracefully

**Current Issue:**

- Neo4j may return dates as ISO strings ("2025-06-05T00:00:00Z") which pass through `convertNeo4jDates` unchanged (line 39)
- Current function only handles Neo4j DateTime objects (year, month, day properties)
- Frontend receives ISO strings but may fail to parse if format is invalid, causing "Invalid date" error
- Frontend needs to display dates in DD/MM/YYYY format (Spanish Argentina locale)

**Specific Changes:**

1. **Update `convertNeo4jDates` function** (lines 10-40) to:

   - Before checking for Neo4j DateTime objects, check if value is already a string
   - Validate if string is a valid ISO 8601 date string (matches pattern like "2025-06-05T00:00:00Z")
   - If valid ISO string, normalize to consistent format and return as-is
   - Handle Date objects and convert to ISO string
   - Handle empty strings, null, and undefined - return null for these cases
   - Handle invalid date formats - return null instead of throwing errors
   - Continue existing logic for Neo4j DateTime objects

2. **Update frontend date display** (`frontend/src/pages/FabricaPage.tsx` line 213):
   - Wrap `new Date(fabrica.date)` in try-catch block
   - Validate date before attempting to format
   - Format as DD/MM/YYYY using Spanish Argentina locale: `toLocaleDateString('es-AR')`
   - Display "Fecha no disponible" for invalid/missing dates
   - Add label "Fecha de publicacion: " before the date

#### 1.3 (Optional) Add Relationship Data to `/fabricas/:id/jingles` Endpoint

**File:** `backend/src/server/api/public.ts`

**Change Details:**

- Modify query to optionally include basic relationship data (Jingleros, Cancion)
- This reduces need for per-jingle API calls when building timeline

**Decision Point:** Defer for now; fetch on-demand when jingle becomes active.

---

### Module 2: Frontend Type Updates

#### 2.1 Update Type Definitions for Multiple Jingleros/Autores

**File:** `frontend/src/types/index.ts`

**Change Details:**

- Update `Jingle` interface to reflect arrays for jingleros and autores
- Ensure compatibility with existing code

**Specific Changes:**

- Add type aliases or update usage to handle arrays

**File:** `frontend/src/components/player/JingleMetadata.tsx`

**Change Details:**

- `JingleMetadataData` interface already supports arrays (lines 22-24)
- Verify handling is correct

**File:** `frontend/src/components/player/JingleTimeline.tsx`

**Change Details:**

- `JingleTimelineItem` interface already supports arrays (lines 28, 30)
- Verify handling is correct

---

### Module 3: FabricaPage Layout Refactor

#### 3.1 Restructure Main Layout to Continuous Scrollable List

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Remove separate grid layout (lines 219-244)
- Create single scrollable container with:
  - Past jingles (before current timestamp) - collapsed rows
  - Current jingle row with player (left) + metadata panel (right, 400px)
  - Future jingles (after current timestamp) - collapsed rows
- Add scrollbar management

**Specific Changes:**

1. Fix date display (lines 211-215):

   ```typescript
   {
     fabrica.date && (
       <p style={{ color: "#666", fontSize: "14px" }}>
         Fecha de publicacion:{" "}
         {(() => {
           try {
             const date = new Date(fabrica.date);
             return isNaN(date.getTime())
               ? "Fecha no disponible"
               : date.toLocaleDateString("es-AR");
           } catch {
             return "Fecha no disponible";
           }
         })()}
       </p>
     );
   }
   ```

2. Replace grid layout with scrollable container structure:

   ```typescript
   <div
     style={{
       display: "flex",
       flexDirection: "column",
       maxHeight: "100vh",
       overflowY: "auto",
     }}
   >
     {/* Past jingles */}
     {/* Current jingle row */}
     {/* Future jingles */}
   </div>
   ```

3. Add state for managing expand/collapse per jingle:

   ```typescript
   const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(
     new Set()
   );
   ```

4. Add state for tracking which jingles are before/at/after current time:
   ```typescript
   const pastJingles = useMemo(() => ...);
   const currentJingle = useMemo(() => ...);
   const futureJingles = useMemo(() => ...);
   ```

#### 3.2 Add Auto-Scroll Behavior

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Add useEffect to scroll to current jingle row when activeJingleId changes
- Use `scrollIntoView` with smooth behavior
- Add ref to current jingle row element

#### 3.3 Add "Skip to First Jingle" Button in Empty Metadata Panel

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- When no active jingle exists:
  - Show YouTube player on left
  - Show empty metadata panel on right with button "Saltar al primer Jingle"
  - Button seeks to first jingle timestamp if any jingles exist

#### 3.4 Handle Deep Linking with Timestamp

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update deep linking logic (lines 94-100, 131-136) to:
  1. Build timeline first
  2. Seek to timestamp after player ready
  3. Scroll to current jingle row
  4. Expand current jingle if collapsed

---

### Module 4: JingleMetadata Component Updates

#### 4.1 Convert to Table Format

**File:** `frontend/src/components/player/JingleMetadata.tsx`

**Change Details:**

- Replace grid layout (lines 172-268) with HTML table
- 3 columns: Label (narrow), Data (wide), Navigation Links (narrow, placeholder for future)
- Remove pill badges for Tematicas (lines 222-265); use table rows instead

**Specific Changes:**

1. Update structure:

   ```tsx
   <div className="metadata-container">
     <div className="metadata-header">
       <h2>{displayTitle}</h2>
       <button className="replay-button">Replay icon</button>
     </div>
     <table className="metadata-table">
       <tbody>
         <tr>
           <td className="label-col">Titulo del Jingle:</td>
           <td className="data-col" colSpan={2}>
             {displayTitle}
           </td>
         </tr>
         {/* Cancion row */}
         {/* Autor rows (merge heading if multiple) */}
         {/* Jinglero rows (merge heading if multiple) */}
         {/* Tematica rows (one per tematica) */}
         {/* Comentario row */}
       </tbody>
     </table>
   </div>
   ```

2. Handle multiple Autores: Show "Autor:" in first row, merge cell if multiple, then one row per Autor

3. Handle multiple Jingleros: Show "Jinglero:" in first row, merge cell if multiple, then one row per Jinglero

4. Handle Tematicas: One row per Tematica (remove pill badges)

5. Add Replay button in header (top-right) that calls `onReplay` callback

6. Add text wrapping for cell overflow

#### 4.2 Update Props Interface

**File:** `frontend/src/components/player/JingleMetadata.tsx`

**Change Details:**

- Add `onReplay?: () => void` prop to interface (line 30-35)

#### 4.3 Handle Empty State (No Jingles)

**File:** `frontend/src/components/player/JingleMetadata.tsx`

**Change Details:**

- Update empty state (lines 98-111) to show "Disfruta del programa" message
- This is used when Fabrica has no Jingles

---

### Module 5: JingleTimeline Component Updates

#### 5.1 Refactor to Show All Jingles Always Visible

**File:** `frontend/src/components/player/JingleTimeline.tsx`

**Change Details:**

- Remove header row display toggle logic
- Remove single-expanded view (161-281)
- All jingles always visible as rows
- Each row expandable/collapsible independently

**Specific Changes:**

1. Remove expanded view logic (lines 171-281)

2. Update collapsed view to show all jingles:

   ```tsx
   return (
     <div className={className}>
       {jingles.map((jingle) => (
         <JingleTimelineRow
           key={jingle.id}
           adjustedJingle={jingle}
           isActive={jingle.isActive}
           isExpanded={expandedJingleIds.has(jingle.id)}
           onToggleExpand={...}
           onSkipTo={...}
         />
       ))}
     </div>
   );
   ```

3. Create `JingleTimelineRow` sub-component:

   - Collapsed: Shows comentario field as text
   - Expanded: Shows full table with fields (Titulo, Cancion, Autor(s), Jinglero(s), Tematica(s))
   - Expand/Collapse icon (arrow down/up)
   - Skip-to icon (double triangle)
   - Active highlighting

4. Update expand/collapse behavior:

   - Remember state per jingle ID
   - When jingle becomes active, expand it
   - When jingle is no longer active, restore previous state

5. Match Metadata Panel styling (rounded corners, similar layout)

#### 5.2 Update Props Interface

**File:** `frontend/src/components/player/JingleTimeline.tsx`

**Change Details:**

- Add `expandedJingleIds?: Set<string>` prop
- Add `onToggleExpand?: (jingleId: string) => void` callback prop

---

### Module 6: YouTube Player Component Updates

#### 6.1 Preserve Aspect Ratio

**File:** `frontend/src/components/player/YouTubePlayer.tsx`

**Change Details:**

- Update container styling (lines 302-330) to maintain 16:9 aspect ratio
- Use CSS aspect-ratio or padding-bottom technique
- Make responsive in narrow settings

**Specific Changes:**

- Wrap player in aspect-ratio container
- Ensure height is calculated from width to maintain 16:9

---

### Module 7: FabricaPage State Management

#### 7.1 Add Expand/Collapse State Management

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Add `expandedJingleIds` state using Set
- Initialize as empty Set (all collapsed by default)
- Save expanded state when jingle becomes active
- Restore previous state when jingle is no longer active

**Implementation:**

```typescript
const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(
  new Set()
);
const [previousExpandedStates, setPreviousExpandedStates] = useState<
  Map<string, boolean>
>(new Map());

useEffect(() => {
  if (activeJingleId) {
    // Save current state
    const wasExpanded = expandedJingleIds.has(activeJingleId);
    setPreviousExpandedStates((prev) =>
      new Map(prev).set(activeJingleId, wasExpanded)
    );

    // Expand active jingle
    setExpandedJingleIds((prev) => new Set(prev).add(activeJingleId));
  } else if (previousActiveJingleId) {
    // Restore previous state
    const shouldBeExpanded =
      previousExpandedStates.get(previousActiveJingleId) ?? false;
    setExpandedJingleIds((prev) => {
      const next = new Set(prev);
      if (shouldBeExpanded) {
        next.add(previousActiveJingleId);
      } else {
        next.delete(previousActiveJingleId);
      }
      return next;
    });
  }
}, [activeJingleId]);
```

#### 7.2 Add Skip-to-Timestamp Navigation Logic

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update `handleSkipToJingle` (lines 156-165) to:
  1. Seek to timestamp
  2. Scroll timeline so player moves to active jingle position
  3. If jingle was collapsed, expand it
  4. Scroll page so player is at top

#### 7.3 Update Active Jingle Change Handler

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update `handleActiveJingleChange` (lines 28-62) to:
  1. Handle arrays for jingleros and autores
  2. Ensure proper array normalization
  3. Trigger scroll when jingle changes

---

### Module 8: Styling Updates

#### 8.1 Create/Update CSS Files

**Files to Create:**

- `frontend/src/styles/pages/fabrica.css`
- `frontend/src/styles/components/player.css`
- `frontend/src/styles/components/timeline.css`
- `frontend/src/styles/components/metadata.css`

**Files to Update:**

- `frontend/src/pages/FabricaPage.tsx` (import CSS files)

**Change Details:**

- Extract inline styles to CSS files
- Add styles for:
  - Scrollable timeline container
  - Current jingle row layout (player + metadata side-by-side)
  - Metadata table styling
  - Timeline row styling (collapsed/expanded states)
  - Replay button styling
  - Active jingle highlighting
  - Expand/collapse icons

---

### Module 9: Error Handling & Edge Cases

#### 9.1 Handle Missing Fabrica Error

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update error handling (lines 180-188) to:
  - Show warning modal "Error de datos, cargando la ultima Fabrica"
  - Fetch latest Fabrica and redirect to it

#### 9.2 Handle Loading States

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update loading state (lines 171-177 planning) to:
  - Load Jingles in playback order
  - Create timeline rows as data loads
  - Show skeleton/loading indicators

#### 9.3 Handle Empty State (No Jingles)

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- When Fabrica has no Jingles:
  - Show player with empty metadata panel
  - Metadata panel shows "Disfruta del programa"
  - No timeline section

---

### Module 10: Icon Integration

#### 10.1 Add Icons for Expand/Collapse and Replay

**Files:**

- Use simple Unicode characters or add icon library
- Or create SVG icons

**Icons Needed:**

- Expand: ▼ (down arrow)
- Collapse: ▲ (up arrow)
- Skip-to: ⏩ (double triangle/forward)
- Replay: ↻ (circular arrow)

---

## IMPLEMENTATION CHECKLIST:

1. Update `backend/src/server/api/public.ts` - Modify `/jingles/:id` endpoint to collect multiple Jingleros using `collect(DISTINCT jinglero {.*}) AS jingleros`
2. Update `backend/src/server/api/public.ts` - Modify `/jingles/:id` endpoint to collect multiple Autores using `collect(DISTINCT autor {.*}) AS autores`
3. Update `backend/src/server/api/public.ts` - Modify response building to return `jingleros` and `autores` as arrays instead of single objects
4. Update `backend/src/server/api/public.ts` - Fix `convertNeo4jDates` function to: (a) detect and validate ISO string dates (e.g., "2025-06-05T00:00:00Z"), (b) normalize ISO string format, (c) handle Date objects, (d) return null for invalid/empty/null dates instead of throwing
5. Update `frontend/src/pages/FabricaPage.tsx` - Fix date parsing (line 213): Add try-catch around `new Date(fabrica.date)`, validate date before formatting, format as DD/MM/YYYY using `toLocaleDateString('es-AR')`, display "Fecha no disponible" for invalid dates
6. Update `frontend/src/pages/FabricaPage.tsx` - Add label "Fecha de publicacion: " before the date display
7. Update `frontend/src/pages/FabricaPage.tsx` - Add state for expanded jingle IDs: `const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(new Set())`
8. Update `frontend/src/pages/FabricaPage.tsx` - Add state for previous expand states: `const [previousExpandedStates, setPreviousExpandedStates] = useState<Map<string, boolean>>(new Map())`
9. Update `frontend/src/pages/FabricaPage.tsx` - Add useMemo to calculate past jingles (before current timestamp)
10. Update `frontend/src/pages/FabricaPage.tsx` - Add useMemo to calculate current jingle (at or before current timestamp, closest to current time)
11. Update `frontend/src/pages/FabricaPage.tsx` - Add useMemo to calculate future jingles (after current timestamp)
12. Update `frontend/src/pages/FabricaPage.tsx` - Remove existing grid layout (lines 219-244)
13. Update `frontend/src/pages/FabricaPage.tsx` - Create scrollable container structure with maxHeight and overflowY
14. Update `frontend/src/pages/FabricaPage.tsx` - Render past jingles section (collapsed rows, before player)
15. Update `frontend/src/pages/FabricaPage.tsx` - Render current jingle row with YouTube player (left) and metadata panel (right, 400px wide)
16. Update `frontend/src/pages/FabricaPage.tsx` - Render future jingles section (collapsed rows, after player)
17. Update `frontend/src/pages/FabricaPage.tsx` - Add ref to current jingle row element for scrolling
18. Update `frontend/src/pages/FabricaPage.tsx` - Add useEffect to auto-scroll to current jingle row when activeJingleId changes
19. Update `frontend/src/pages/FabricaPage.tsx` - Update `handleActiveJingleChange` to normalize jingleros and autores as arrays
20. Update `frontend/src/pages/FabricaPage.tsx` - Add useEffect to manage expand/collapse state when jingle becomes active (expand) or inactive (restore previous state)
21. Update `frontend/src/pages/FabricaPage.tsx` - Update `handleSkipToJingle` to scroll timeline, expand jingle if collapsed, and scroll page so player is at top
22. Update `frontend/src/pages/FabricaPage.tsx` - Add "Skip to First Jingle" button in empty metadata panel when no active jingle and jingles exist
23. Update `frontend/src/pages/FabricaPage.tsx` - Update error handling to show modal and fetch latest Fabrica on error
24. Update `frontend/src/pages/FabricaPage.tsx` - Handle empty state when Fabrica has no Jingles (show "Disfruta del programa" in metadata panel)
25. Update `frontend/src/components/player/JingleMetadata.tsx` - Create metadata-header div with title and replay button
26. Update `frontend/src/components/player/JingleMetadata.tsx` - Replace grid layout with HTML table element
27. Update `frontend/src/components/player/JingleMetadata.tsx` - Create table structure with 3 columns: label-col, data-col, nav-col (narrow placeholder)
28. Update `frontend/src/components/player/JingleMetadata.tsx` - Add Titulo row spanning 2 columns
29. Update `frontend/src/components/player/JingleMetadata.tsx` - Add Cancion row with label and data cells
30. Update `frontend/src/components/player/JingleMetadata.tsx` - Handle multiple Autores: First row with merged "Autor:" heading, then one row per Autor
31. Update `frontend/src/components/player/JingleMetadata.tsx` - Handle multiple Jingleros: First row with merged "Jinglero:" heading, then one row per Jinglero
32. Update `frontend/src/components/player/JingleMetadata.tsx` - Replace Tematica pill badges with table rows (one row per Tematica)
33. Update `frontend/src/components/player/JingleMetadata.tsx` - Add Comentario row if comment exists
34. Update `frontend/src/components/player/JingleMetadata.tsx` - Add text wrapping CSS for cell overflow
35. Update `frontend/src/components/player/JingleMetadata.tsx` - Add `onReplay` prop to interface
36. Update `frontend/src/components/player/JingleMetadata.tsx` - Implement replay button click handler that calls onReplay callback
37. Update `frontend/src/components/player/JingleMetadata.tsx` - Update empty state to show "Disfruta del programa" message
38. Update `frontend/src/pages/FabricaPage.tsx` - Pass `onReplay` callback to JingleMetadata component that seeks to current jingle timestamp
39. Update `frontend/src/components/player/JingleTimeline.tsx` - Remove header row (lines 290-308)
40. Update `frontend/src/components/player/JingleTimeline.tsx` - Remove single-expanded view logic (lines 171-281)
41. Update `frontend/src/components/player/JingleTimeline.tsx` - Remove expandedJingleId state (line 136)
42. Update `frontend/src/components/player/JingleTimeline.tsx` - Add `expandedJingleIds` and `onToggleExpand` props to interface
43. Update `frontend/src/components/player/JingleTimeline.tsx` - Create JingleTimelineRow sub-component for individual jingle rows
44. Update `frontend/src/components/player/JingleTimeline.tsx` - Implement collapsed row view showing comentario field as text
45. Update `frontend/src/components/player/JingleTimeline.tsx` - Implement expanded row view showing full table with all fields
46. Update `frontend/src/components/player/JingleTimeline.tsx` - Add expand/collapse icon (arrow down/up) to each row
47. Update `frontend/src/components/player/JingleTimeline.tsx` - Add skip-to icon (double triangle) to each row
48. Update `frontend/src/components/player/JingleTimeline.tsx` - Add active jingle highlighting styling
49. Update `frontend/src/components/player/JingleTimeline.tsx` - Match Metadata Panel styling (rounded corners, box styling)
50. Update `frontend/src/components/player/JingleTimeline.tsx` - Render all jingles always visible (remove conditional hiding)
51. Update `frontend/src/pages/FabricaPage.tsx` - Pass `expandedJingleIds` and `onToggleExpand` to JingleTimeline component
52. Update `frontend/src/components/player/YouTubePlayer.tsx` - Wrap player in aspect-ratio container to preserve 16:9 ratio
53. Update `frontend/src/components/player/YouTubePlayer.tsx` - Make player responsive in narrow settings while maintaining aspect ratio
54. Create `frontend/src/styles/pages/fabrica.css` - Add styles for scrollable timeline container
55. Create `frontend/src/styles/pages/fabrica.css` - Add styles for current jingle row layout
56. Create `frontend/src/styles/components/metadata.css` - Add metadata table styles
57. Create `frontend/src/styles/components/metadata.css` - Add metadata header and replay button styles
58. Create `frontend/src/styles/components/timeline.css` - Add timeline row styles (collapsed/expanded)
59. Create `frontend/src/styles/components/timeline.css` - Add expand/collapse and skip-to icon styles
60. Create `frontend/src/styles/components/timeline.css` - Add active jingle highlighting styles
61. Update `frontend/src/pages/FabricaPage.tsx` - Import CSS files
62. Test date parsing fix with various date formats
63. Test multiple Jingleros display in metadata panel
64. Test multiple Autores display in metadata panel
65. Test timeline scroll behavior when jingle becomes active
66. Test expand/collapse state persistence and restoration
67. Test skip-to-timestamp navigation and page scroll
68. Test deep linking with timestamp parameter
69. Test empty state when Fabrica has no Jingles
70. Test error handling with missing Fabrica (should load latest)
71. Test responsive design with narrow viewport
