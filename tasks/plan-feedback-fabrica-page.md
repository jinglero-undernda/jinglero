# Technical Specification: FabricaPage Feedback Implementation

## Overview

This document outlines the technical specification for implementing all feedback items from `feedback-fabrica-page-2.8.md`. The implementation is broken down into logical modules to ensure systematic execution.

---

### Module 1: Backend API Changes ✅ COMPLETED

- [x] **Module 1 Complete**

#### 1.1 Update `/jingles/:id` Endpoint to Support Multiple Jingleros and Autores

- [x] **Task 1.1 Complete**

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

- [x] **Task 1.2 Complete**

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

- [ ] **Task 1.3 Deferred** (Optional optimization for future)

**File:** `backend/src/server/api/public.ts`

**Change Details:**

- Modify query to optionally include basic relationship data (Jingleros, Cancion)
- This reduces need for per-jingle API calls when building timeline

**Decision Point:** Defer for now; fetch on-demand when jingle becomes active.

---

### Module 2: Frontend Type Updates ⚠️ PARTIALLY COMPLETED

- [x] **Module 2 Partially Complete** (types support arrays, verification ongoing)

#### 2.1 Update Type Definitions for Multiple Jingleros/Autores

- [x] **Task 2.1 Complete** (interfaces already support arrays)

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

### Module 3: FabricaPage Layout Refactor ✅ COMPLETED

- [x] **Module 3 Complete**

#### 3.1 Restructure Main Layout to Continuous Scrollable List

- [x] **Task 3.1 Complete**

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

- [x] **Task 3.2 Complete**

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Add useEffect to scroll to current jingle row when activeJingleId changes
- Use `scrollIntoView` with smooth behavior
- Add ref to current jingle row element

#### 3.3 Add "Skip to First Jingle" Button in Empty Metadata Panel

- [x] **Task 3.3 Complete**

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- When no active jingle exists:
  - Show YouTube player on left
  - Show empty metadata panel on right with button "Saltar al primer Jingle"
  - Button seeks to first jingle timestamp if any jingles exist

#### 3.4 Handle Deep Linking with Timestamp

- [x] **Task 3.4 Complete**

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update deep linking logic (lines 94-100, 131-136) to:
  1. Build timeline first
  2. Seek to timestamp after player ready
  3. Scroll to current jingle row
  4. Expand current jingle if collapsed

---

### Module 4: JingleMetadata Component Updates

- [x] **Module 4 Complete**

#### 4.1 Convert to Table Format

- [x] **Task 4.1 Complete**

**File:** `frontend/src/components/player/JingleMetadata.tsx`

**Change Details:**

- Replace grid layout (lines 172-268) with HTML table
- 3 columns: Label (narrow), Data (wide), Navigation Links (narrow, placeholder for future)
- Remove pill badges for Tematicas (lines 222-265); use table rows instead
- Add header section with rounded top corners containing title and replay button
- Rest of metadata in a contained box below header

**Specific Changes:**

1. **Update Props Interface** (lines 30-35):

   - Add `onReplay?: () => void` prop to `JingleMetadataProps`

2. **Create Header Section** (replace lines 149-169):

   ```tsx
   <div
     className="metadata-header"
     style={{
       backgroundColor: "#fff",
       borderTopLeftRadius: "8px",
       borderTopRightRadius: "8px",
       borderBottom: "2px solid #eee",
       padding: "16px 20px",
       display: "flex",
       justifyContent: "space-between",
       alignItems: "center",
     }}
   >
     <h2
       style={{
         margin: 0,
         fontSize: "24px",
         fontWeight: "bold",
         color: "#333",
       }}
     >
       {displayTitle}
     </h2>
     {onReplay && timestampSeconds !== null && (
       <button
         onClick={onReplay}
         className="replay-button"
         style={{
           background: "none",
           border: "none",
           cursor: "pointer",
           fontSize: "24px",
           padding: "4px 8px",
           color: "#1976d2",
           borderRadius: "4px",
           transition: "background-color 0.2s",
         }}
         title="Repetir jingle"
         aria-label="Repetir jingle"
       >
         ↻
       </button>
     )}
   </div>
   ```

3. **Create Table Structure** (replace lines 172-268):

   ```tsx
   <div
     style={{
       backgroundColor: "#fff",
       borderBottomLeftRadius: "8px",
       borderBottomRightRadius: "8px",
       padding: "20px",
     }}
   >
     <table
       className="metadata-table"
       style={{
         width: "100%",
         borderCollapse: "collapse",
         fontSize: "15px",
       }}
     >
       <tbody>
         {/* Titulo row - spans all columns */}
         <tr>
           <td
             className="label-col"
             style={{
               width: "120px",
               padding: "8px 12px 8px 0",
               color: "#666",
               fontWeight: "600",
               verticalAlign: "top",
             }}
           >
             Titulo del Jingle:
           </td>
           <td
             className="data-col"
             colSpan={2}
             style={{
               padding: "8px 0",
               color: "#333",
               wordWrap: "break-word",
               wordBreak: "break-word",
             }}
           >
             {displayTitle}
           </td>
         </tr>

         {/* Cancion row */}
         <tr>
           <td
             className="label-col"
             style={
               {
                 /* same as above */
               }
             }
           >
             Cancion:
           </td>
           <td
             className="data-col"
             style={{
               padding: "8px 0",
               color: "#333",
               wordWrap: "break-word",
             }}
           >
             {cancionText !== "A CONFIRMAR" ? (
               cancionText
             ) : (
               <span style={{ fontStyle: "italic", color: "#999" }}>
                 A CONFIRMAR
               </span>
             )}
           </td>
           <td
             className="nav-col"
             style={{
               width: "40px",
               padding: "8px 0",
               // Placeholder for future navigation links
             }}
           ></td>
         </tr>

         {/* Autor rows - handle multiple */}
         {autores.length > 0 ? (
           <>
             <tr>
               <td
                 className="label-col"
                 rowSpan={autores.length > 1 ? autores.length : undefined}
                 style={
                   {
                     /* same */
                   }
                 }
               >
                 Autor{autores.length > 1 ? ":" : ":"}
               </td>
               <td
                 className="data-col"
                 style={
                   {
                     /* same */
                   }
                 }
               >
                 {autores[0].stageName || autores[0].name || "A CONFIRMAR"}
               </td>
               <td
                 className="nav-col"
                 style={
                   {
                     /* same */
                   }
                 }
               ></td>
             </tr>
             {autores.slice(1).map((autor, idx) => (
               <tr key={autor.id || idx + 1}>
                 <td
                   className="data-col"
                   style={
                     {
                       /* same */
                     }
                   }
                 >
                   {autor.stageName || autor.name || "A CONFIRMAR"}
                 </td>
                 <td
                   className="nav-col"
                   style={
                     {
                       /* same */
                     }
                   }
                 ></td>
               </tr>
             ))}
           </>
         ) : (
           <tr>
             <td
               className="label-col"
               style={
                 {
                   /* same */
                 }
               }
             >
               Autor:
             </td>
             <td
               className="data-col"
               style={
                 {
                   /* same */
                 }
               }
             >
               <span style={{ fontStyle: "italic", color: "#999" }}>
                 A CONFIRMAR
               </span>
             </td>
             <td
               className="nav-col"
               style={
                 {
                   /* same */
                 }
               }
             ></td>
           </tr>
         )}

         {/* Jinglero rows - handle multiple (same pattern as Autor) */}
         {/* Tematica rows - one per tematica */}
         {tematicas.length > 0 && (
           <>
             <tr>
               <td
                 className="label-col"
                 rowSpan={tematicas.length}
                 style={
                   {
                     /* same */
                   }
                 }
               >
                 Tematica:
               </td>
               <td
                 className="data-col"
                 style={
                   {
                     /* same */
                   }
                 }
               >
                 {tematicas[0].name}
               </td>
               <td
                 className="nav-col"
                 style={
                   {
                     /* same */
                   }
                 }
               ></td>
             </tr>
             {tematicas.slice(1).map((tematica) => (
               <tr key={tematica.id}>
                 <td
                   className="data-col"
                   style={
                     {
                       /* same */
                     }
                   }
                 >
                   {tematica.name}
                 </td>
                 <td
                   className="nav-col"
                   style={
                     {
                       /* same */
                     }
                   }
                 ></td>
               </tr>
             ))}
           </>
         )}

         {/* Comentario row */}
         {jingle.comment && (
           <tr>
             <td
               className="label-col"
               style={
                 {
                   /* same */
                 }
               }
             >
               Comentario:
             </td>
             <td
               className="data-col"
               colSpan={2}
               style={{
                 padding: "8px 0",
                 color: "#555",
                 fontSize: "14px",
                 lineHeight: "1.6",
                 fontStyle: "italic",
                 wordWrap: "break-word",
               }}
             >
               {jingle.comment}
             </td>
           </tr>
         )}
       </tbody>
     </table>
   </div>
   ```

4. **Update Container Styles** (lines 142-148):

   - Remove border-radius from main container (now handled by header and content sections)
   - Keep padding and background but adjust structure

5. **Remove Timestamp Display** from header (was in old header, now removed per feedback)

6. **Text Wrapping**: Ensure all data cells have `wordWrap: 'break-word'` and `wordBreak: 'break-word'` styles

**Implementation Notes:**

- Use `rowSpan` attribute to merge Autor/Jinglero label cells when multiple exist
- Keep existing logic for normalizing arrays (already present in lines 123-135)
- Remove pill badge styling completely (lines 222-265)
- Ensure table cells align properly with consistent padding
- Navigation column is placeholder for future feature (feedback item 12)

#### 4.2 Update Props Interface

- [x] **Task 4.2 Complete**

**File:** `frontend/src/components/player/JingleMetadata.tsx`

**Change Details:**

- Add `onReplay?: () => void` prop to interface (line 30-35)

**Specific Changes:**

1. Update `JingleMetadataProps` interface:

   ```tsx
   export interface JingleMetadataProps {
     /** Active jingle data to display */
     jingle: JingleMetadataData | null;
     /** Additional CSS class name */
     className?: string;
     /** Callback to replay current jingle from start timestamp */
     onReplay?: () => void;
   }
   ```

2. Update component signature:
   ```tsx
   export default function JingleMetadata({ jingle, className, onReplay }: JingleMetadataProps) {
   ```

#### 4.3 Handle Empty State (No Jingles)

- [x] **Task 4.3 Complete**

**File:** `frontend/src/components/player/JingleMetadata.tsx`

**Change Details:**

- Update empty state (lines 98-111) to show "Disfruta del programa" message
- This is used when Fabrica has no Jingles
- Keep consistent styling with header + content box structure

**Specific Changes:**

1. Update empty state (lines 98-111):
   ```tsx
   if (!jingle) {
     return (
       <div
         className={className}
         style={{
           backgroundColor: "#fff",
           borderRadius: "8px",
           border: "1px solid #ddd",
           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
         }}
       >
         <div
           style={{
             backgroundColor: "#fff",
             borderTopLeftRadius: "8px",
             borderTopRightRadius: "8px",
             borderBottom: "2px solid #eee",
             padding: "16px 20px",
           }}
         >
           <h2
             style={{
               margin: 0,
               fontSize: "24px",
               fontWeight: "bold",
               color: "#333",
             }}
           >
             Disfruta del programa
           </h2>
         </div>
         <div
           style={{
             backgroundColor: "#fff",
             borderBottomLeftRadius: "8px",
             borderBottomRightRadius: "8px",
             padding: "20px",
             textAlign: "center",
             color: "#666",
             fontSize: "15px",
           }}
         >
           <p style={{ margin: 0 }}>No hay información de jingle disponible</p>
         </div>
       </div>
     );
   }
   ```

**Note:** This empty state is used in FabricaPage when `jingle={null}` is passed and the Fabrica has no Jingles (feedback item 19).

#### 4.4 Update FabricaPage to Pass onReplay Prop

- [x] **Task 4.4 Complete**

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Remove the comment on line 515 and pass `onReplay` prop to JingleMetadata component
- Use existing `handleReplayCurrentJingle` function (already defined at line 253)

**Specific Changes:**

1. Update JingleMetadata usage (around line 514-516):
   ```tsx
   <JingleMetadata
     jingle={activeJingleMetadata}
     onReplay={handleReplayCurrentJingle}
   />
   ```

**Note:** The `handleReplayCurrentJingle` function already exists and seeks to the current jingle's timestamp (feedback item 10).

---

### Module 4 Implementation Summary

**Key Changes:**

1. **Props Interface**: Add `onReplay?: () => void` prop
2. **Header Section**: Create rounded-top header with title and replay button (↻ icon)
3. **Table Structure**: Replace grid layout with HTML `<table>` element
4. **Table Columns**:
   - Label column (120px, right-aligned, bold)
   - Data column (flexible width, left-aligned, text-wrap enabled)
   - Navigation column (40px placeholder for future links)
5. **Multiple Values**: Use `rowSpan` to merge label cells for Autor/Jinglero/Tematica when multiple exist
6. **Tematicas**: Remove pill badges, show as table rows (one per tematica)
7. **Empty State**: Update to show "Disfruta del programa" with consistent header/content structure
8. **Integration**: Update FabricaPage to pass `onReplay` callback

**Implementation Order:**

1. Start with Task 4.2 (Props Interface) - simplest change
2. Then Task 4.1 (Table Format) - main refactor
3. Then Task 4.3 (Empty State) - update empty state
4. Finally Task 4.4 (FabricaPage Integration) - connect replay functionality

**Testing Checklist:**

- Verify table renders correctly with all fields
- Test multiple Autores/Jingleros display correctly (rowSpan works)
- Test single Autor/Jinglero display (no rowSpan)
- Verify Tematicas show as table rows (no pills)
- Test replay button appears and functions correctly
- Verify empty state shows "Disfruta del programa"
- Test text wrapping on long content
- Verify consistent styling with header/content sections

---

### Module 5: JingleTimeline Component Updates

- [ ] **Module 5 Pending**

#### 5.1 Refactor to Show All Jingles Always Visible

- [ ] **Task 5.1 Pending**

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

- [ ] **Task 5.2 Pending**

**File:** `frontend/src/components/player/JingleTimeline.tsx`

**Change Details:**

- Add `expandedJingleIds?: Set<string>` prop
- Add `onToggleExpand?: (jingleId: string) => void` callback prop

---

### Module 6: YouTube Player Component Updates

- [ ] **Module 6 Pending**

**Detailed Implementation Plan:** See `module-6-youtube-player-detailed-plan.md`

**Related Feedback:** Feedback item 7 from `feedback-fabrica-page-2.8.md`

#### 6.1 Preserve Aspect Ratio

- [ ] **Task 6.1 Pending**

**File:** `frontend/src/components/player/YouTubePlayer.tsx`

**Change Details:**

- Update container styling (lines 302-330) to maintain 16:9 aspect ratio
- Use CSS aspect-ratio property with padding-bottom fallback technique
- Make responsive in narrow settings
- Update error and empty states to maintain aspect ratio
- Update FabricaPage usage to remove deprecated width/height props

**Specific Changes:**

1. Wrap player in aspect-ratio container using modern CSS `aspect-ratio: 16 / 9`
2. Add padding-bottom: 56.25% fallback for older browsers
3. Make player div absolute positioned to fill aspect ratio container
4. Update error state (lines 276-292) to use aspect ratio container
5. Update empty state (lines 294-300) to use aspect ratio container
6. Simplify player initialization to use width/height: '100%'
7. Update FabricaPage.tsx usage to remove width/height props

**Implementation Notes:**

- See detailed plan document for complete step-by-step implementation
- Includes testing checklist for all viewport sizes
- Browser compatibility matrix provided
- Estimated implementation time: 3 hours

---

### Module 7: FabricaPage State Management

- [ ] **Module 7 Pending**

#### 7.1 Add Expand/Collapse State Management

- [ ] **Task 7.1 Pending** (state prepared in Module 3, full logic pending)

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

- [ ] **Task 7.2 Pending** (basic implementation done in Module 3, enhanced logic pending)

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update `handleSkipToJingle` (lines 156-165) to:
  1. Seek to timestamp
  2. Scroll timeline so player moves to active jingle position
  3. If jingle was collapsed, expand it
  4. Scroll page so player is at top

#### 7.3 Update Active Jingle Change Handler

- [x] **Task 7.3 Complete** (arrays normalized in Module 3)

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update `handleActiveJingleChange` (lines 28-62) to:
  1. Handle arrays for jingleros and autores
  2. Ensure proper array normalization
  3. Trigger scroll when jingle changes

---

### Module 8: Styling Updates

- [ ] **Module 8 Pending**

#### 8.1 Create/Update CSS Files

- [ ] **Task 8.1 Pending** (currently using inline styles)

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

- [ ] **Module 9 Pending**

#### 9.1 Handle Missing Fabrica Error

- [ ] **Task 9.1 Pending**

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update error handling (lines 180-188) to:
  - Show warning modal "Error de datos, cargando la ultima Fabrica"
  - Fetch latest Fabrica and redirect to it

#### 9.2 Handle Loading States

- [ ] **Task 9.2 Pending**

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- Update loading state (lines 171-177 planning) to:
  - Load Jingles in playback order
  - Create timeline rows as data loads
  - Show skeleton/loading indicators

#### 9.3 Handle Empty State (No Jingles)

- [x] **Task 9.3 Complete** (implemented in Module 3)

**File:** `frontend/src/pages/FabricaPage.tsx`

**Change Details:**

- When Fabrica has no Jingles:
  - Show player with empty metadata panel
  - Metadata panel shows "Disfruta del programa"
  - No timeline section

---

### Module 10: Icon Integration

- [ ] **Module 10 Pending**

#### 10.1 Add Icons for Expand/Collapse and Replay

- [x] **Task 10.1 Complete** (Unicode icons used in Module 3)

**Files:**

- Use simple Unicode characters or add icon library
- Or create SVG icons

**Icons Needed:**

- Expand: ▼ (down arrow) ✅ Used
- Collapse: ▲ (up arrow) ✅ Used
- Skip-to: ⏩ (double triangle/forward) ✅ Used
- Replay: ↻ (circular arrow) - Pending for Module 4

---

## IMPLEMENTATION CHECKLIST:

[ ] 1. Update `backend/src/server/api/public.ts` - Modify `/jingles/:id` endpoint to collect multiple Jingleros using `collect(DISTINCT jinglero {.*}) AS jingleros`
[ ] 2. Update `backend/src/server/api/public.ts` - Modify `/jingles/:id` endpoint to collect multiple Autores using `collect(DISTINCT autor {.*}) AS autores`
[ ] 3. Update `backend/src/server/api/public.ts` - Modify response building to return `jingleros` and `autores` as arrays instead of single objects
[ ] 4. Update `backend/src/server/api/public.ts` - Fix `convertNeo4jDates` function to: (a) detect and validate ISO string dates (e.g., "2025-06-05T00:00:00Z"), (b) normalize ISO string format, (c) handle Date objects, (d) return null for invalid/empty/null dates instead of throwing
[ ] 5. Update `frontend/src/pages/FabricaPage.tsx` - Fix date parsing (line 213): Add try-catch around `new Date(fabrica.date)`, validate date before formatting, format as DD/MM/YYYY using `toLocaleDateString('es-AR')`, display "Fecha no disponible" for invalid dates
[ ] 6. Update `frontend/src/pages/FabricaPage.tsx` - Add label "Fecha de publicacion: " before the date display
[ ] 7. Update `frontend/src/pages/FabricaPage.tsx` - Add state for expanded jingle IDs: `const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(new Set())`
[ ] 8. Update `frontend/src/pages/FabricaPage.tsx` - Add state for previous expand states: `const [previousExpandedStates, setPreviousExpandedStates] = useState<Map<string, boolean>>(new Map())`
[ ] 9. Update `frontend/src/pages/FabricaPage.tsx` - Add useMemo to calculate past jingles (before current timestamp)
[ ] 10. Update `frontend/src/pages/FabricaPage.tsx` - Add useMemo to calculate current jingle (at or before current timestamp, closest to current time)
[ ] 11. Update `frontend/src/pages/FabricaPage.tsx` - Add useMemo to calculate future jingles (after current timestamp)
[ ] 12. Update `frontend/src/pages/FabricaPage.tsx` - Remove existing grid layout (lines 219-244)
[ ] 13. Update `frontend/src/pages/FabricaPage.tsx` - Create scrollable container structure with maxHeight and overflowY
[ ] 14. Update `frontend/src/pages/FabricaPage.tsx` - Render past jingles section (collapsed rows, before player)
[ ] 15. Update `frontend/src/pages/FabricaPage.tsx` - Render current jingle row with YouTube player (left) and metadata panel (right, 400px wide)
[ ] 16. Update `frontend/src/pages/FabricaPage.tsx` - Render future jingles section (collapsed rows, after player)
[ ] 17. Update `frontend/src/pages/FabricaPage.tsx` - Add ref to current jingle row element for scrolling
[ ] 18. Update `frontend/src/pages/FabricaPage.tsx` - Add useEffect to auto-scroll to current jingle row when activeJingleId changes
[ ] 19. Update `frontend/src/pages/FabricaPage.tsx` - Update `handleActiveJingleChange` to normalize jingleros and autores as arrays
[ ] 20. Update `frontend/src/pages/FabricaPage.tsx` - Add useEffect to manage expand/collapse state when jingle becomes active (expand) or inactive (restore previous state)
[ ] 21. Update `frontend/src/pages/FabricaPage.tsx` - Update `handleSkipToJingle` to scroll timeline, expand jingle if collapsed, and scroll page so player is at top
[ ] 22. Update `frontend/src/pages/FabricaPage.tsx` - Add "Skip to First Jingle" button in empty metadata panel when no active jingle and jingles exist
[ ] 23. Update `frontend/src/pages/FabricaPage.tsx` - Update error handling to show modal and fetch latest Fabrica on error
[ ] 24. Update `frontend/src/pages/FabricaPage.tsx` - Handle empty state when Fabrica has no Jingles (show "Disfruta del programa" in metadata panel)
[ ] 25. Update `frontend/src/components/player/JingleMetadata.tsx` - Add `onReplay?: () => void` prop to `JingleMetadataProps` interface
[ ] 26. Update `frontend/src/components/player/JingleMetadata.tsx` - Update component signature to accept `onReplay` prop
[ ] 27. Update `frontend/src/components/player/JingleMetadata.tsx` - Create metadata-header div with rounded top corners containing title and replay button
[ ] 28. Update `frontend/src/components/player/JingleMetadata.tsx` - Implement replay button with ↻ icon that calls `onReplay` callback (only show when onReplay and timestamp exist)
[ ] 29. Update `frontend/src/components/player/JingleMetadata.tsx` - Replace grid layout (lines 172-268) with HTML table element
[ ] 30. Update `frontend/src/components/player/JingleMetadata.tsx` - Create table structure with 3 columns: label-col (120px), data-col (flexible), nav-col (40px placeholder)
[ ] 31. Update `frontend/src/components/player/JingleMetadata.tsx` - Add Titulo row with label cell and data cell spanning 2 columns
[ ] 32. Update `frontend/src/components/player/JingleMetadata.tsx` - Add Cancion row with label, data, and empty nav cells
[ ] 33. Update `frontend/src/components/player/JingleMetadata.tsx` - Handle multiple Autores: First row with "Autor:" label using rowSpan, then one row per Autor
[ ] 34. Update `frontend/src/components/player/JingleMetadata.tsx` - Handle single Autor: Show "Autor:" label in single row with "A CONFIRMAR" fallback
[ ] 35. Update `frontend/src/components/player/JingleMetadata.tsx` - Handle multiple Jingleros: First row with "Jinglero:" label using rowSpan, then one row per Jinglero
[ ] 36. Update `frontend/src/components/player/JingleMetadata.tsx` - Handle single/no Jinglero: Show "Jinglero:" label with "Anonimo" fallback
[ ] 37. Update `frontend/src/components/player/JingleMetadata.tsx` - Replace Tematica pill badges (lines 222-265) with table rows: one row per Tematica with rowSpan label
[ ] 38. Update `frontend/src/components/player/JingleMetadata.tsx` - Remove primary/secondary Tematica distinction in display (show all equally)
[ ] 39. Update `frontend/src/components/player/JingleMetadata.tsx` - Add Comentario row if comment exists, with label and data cell spanning 2 columns
[ ] 40. Update `frontend/src/components/player/JingleMetadata.tsx` - Add text wrapping styles (`wordWrap: 'break-word'`, `wordBreak: 'break-word'`) to all data cells
[ ] 41. Update `frontend/src/components/player/JingleMetadata.tsx` - Update container styles: remove border-radius from main container (handled by header/content sections)
[ ] 42. Update `frontend/src/components/player/JingleMetadata.tsx` - Remove timestamp display from header (was in old header section)
[ ] 43. Update `frontend/src/components/player/JingleMetadata.tsx` - Update empty state to show "Disfruta del programa" message with consistent header/content structure
[ ] 44. Update `frontend/src/pages/FabricaPage.tsx` - Pass `onReplay={handleReplayCurrentJingle}` prop to JingleMetadata component (replace comment on line 515)
[ ] 45. Update `frontend/src/components/player/JingleTimeline.tsx` - Remove header row (lines 290-308)
[ ] 46. Update `frontend/src/components/player/JingleTimeline.tsx` - Remove single-expanded view logic (lines 171-281)
[ ] 47. Update `frontend/src/components/player/JingleTimeline.tsx` - Remove expandedJingleId state (line 136)
[ ] 48. Update `frontend/src/components/player/JingleTimeline.tsx` - Add `expandedJingleIds` and `onToggleExpand` props to interface
[ ] 49. Update `frontend/src/components/player/JingleTimeline.tsx` - Create JingleTimelineRow sub-component for individual jingle rows
[ ] 50. Update `frontend/src/components/player/JingleTimeline.tsx` - Implement collapsed row view showing comentario field as text
[ ] 51. Update `frontend/src/components/player/JingleTimeline.tsx` - Implement expanded row view showing full table with all fields
[ ] 52. Update `frontend/src/components/player/JingleTimeline.tsx` - Add expand/collapse icon (arrow down/up) to each row
[ ] 53. Update `frontend/src/components/player/JingleTimeline.tsx` - Add skip-to icon (double triangle) to each row
[ ] 54. Update `frontend/src/components/player/JingleTimeline.tsx` - Add active jingle highlighting styling
[ ] 55. Update `frontend/src/components/player/JingleTimeline.tsx` - Match Metadata Panel styling (rounded corners, box styling)
[ ] 56. Update `frontend/src/components/player/JingleTimeline.tsx` - Render all jingles always visible (remove conditional hiding)
[ ] 57. Update `frontend/src/pages/FabricaPage.tsx` - Pass `expandedJingleIds` and `onToggleExpand` to JingleTimeline component
[ ] 58. Update `frontend/src/components/player/YouTubePlayer.tsx` - Wrap player in aspect-ratio container to preserve 16:9 ratio
[ ] 59. Update `frontend/src/components/player/YouTubePlayer.tsx` - Make player responsive in narrow settings while maintaining aspect ratio
[ ] 60. Create `frontend/src/styles/pages/fabrica.css` - Add styles for scrollable timeline container
[ ] 61. Create `frontend/src/styles/pages/fabrica.css` - Add styles for current jingle row layout
[ ] 62. Create `frontend/src/styles/components/metadata.css` - Add metadata table styles
[ ] 63. Create `frontend/src/styles/components/metadata.css` - Add metadata header and replay button styles
[ ] 64. Create `frontend/src/styles/components/timeline.css` - Add timeline row styles (collapsed/expanded)
[ ] 65. Create `frontend/src/styles/components/timeline.css` - Add expand/collapse and skip-to icon styles
[ ] 66. Create `frontend/src/styles/components/timeline.css` - Add active jingle highlighting styles
[ ] 67. Update `frontend/src/pages/FabricaPage.tsx` - Import CSS files
[ ] 68. Test date parsing fix with various date formats
[ ] 69. Test multiple Jingleros display in metadata panel
[ ] 70. Test multiple Autores display in metadata panel
[ ] 71. Test timeline scroll behavior when jingle becomes active
[ ] 72. Test expand/collapse state persistence and restoration
[ ] 73. Test skip-to-timestamp navigation and page scroll
[ ] 74. Test deep linking with timestamp parameter
[ ] 75. Test empty state when Fabrica has no Jingles
[ ] 76. Test error handling with missing Fabrica (should load latest)
[ ] 77. Test responsive design with narrow viewport
