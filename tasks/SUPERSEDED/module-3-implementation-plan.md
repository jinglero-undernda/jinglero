# Module 3 Implementation Plan: FabricaPage Layout Refactor

## Architecture Decision: Three-Container Approach

**Key Insight:** Instead of moving the player component in the DOM, we use three containers where jingles move between containers as the video progresses. The player **stays in a fixed position** in the DOM tree (middle container), ensuring stability.

## Current State Analysis

### FabricaPage.tsx (Lines 236-280)

**Current Structure:**

```
├── Header (title, date, back link)
├── Grid Layout (2 columns: player + metadata)
│   ├── YouTube Player (left, flexible width)
│   └── JingleMetadata (right, 400px fixed)
└── Timeline Section (separate, below player)
    ├── Section heading "Lista de Jingles"
    └── JingleTimeline component
```

**Behavior:**

- Player and metadata are in a fixed grid above timeline
- Timeline shows all jingles in a table format
- Timeline has expand/collapse for individual jingles (but it replaces the table view)
- No scrolling behavior when active jingle changes
- No integration between player position and timeline layout

### JingleTimeline.tsx

**Current Modes:**

1. **Collapsed Mode** (lines 284-394): Table with all jingles visible
2. **Expanded Mode** (lines 172-280): Single expanded jingle replaces entire table

**Issues with Current Design:**

- Can only expand one jingle at a time, and it hides all others
- No support for rendering player/metadata inline within timeline
- Active jingle highlighting exists but doesn't affect layout

---

## Module 3 Requirements

### 3.1 Restructure to Continuous Scrollable List

**Goal:** Merge timeline and player into a single scrollable list where:

- Past jingles appear as collapsed rows ABOVE the player
- Current jingle shows player (left) + metadata (right)
- Future jingles appear as collapsed rows BELOW the player
- Player visually "moves" down the list as video progresses

**Architecture: Three-Container Approach**

```
Scrollable Container
├── [PAST JINGLES CONTAINER] ← Grows as video progresses
│   ├── Past Jingle 1 (collapsed row, full width)
│   ├── Past Jingle 2 (collapsed row, full width)
│   └── Past Jingle 3 (collapsed row, full width)
├── [CURRENT JINGLE CONTAINER] ← Player FIXED here in DOM
│   └── [CURRENT JINGLE ROW]
│       ├── YouTube Player (left, flexible)
│       └── Metadata Panel (right, 400px)
└── [FUTURE JINGLES CONTAINER] ← Shrinks as video progresses
    ├── Future Jingle 1 (collapsed row, full width)
    ├── Future Jingle 2 (collapsed row, full width)
    └── Future Jingle 3 (collapsed row, full width)
```

**Benefits:**

- ✅ Player never moves in DOM tree (zero re-mount risk)
- ✅ Only metadata content updates
- ✅ Simpler state management (just filter by index)
- ✅ Same visual UX (player appears to move down page)

### 3.2 Auto-Scroll Behavior

**Goal:** When activeJingleId changes, automatically scroll so the current jingle row (with player) is visible

**Requirements:**

- Smooth scroll animation
- Position player near top of viewport
- Don't interrupt if user is manually scrolling

### 3.3 Skip to First Jingle Button

**Goal:** When no jingle is active (playback before first timestamp), show a button in metadata panel

**Requirements:**

- Empty metadata panel shows "Saltar al primer Jingle" button
- Button seeks to first jingle's timestamp
- Only show if at least one jingle exists

### 3.4 Deep Linking Enhancement

**Goal:** When loading page with `?t=123` timestamp:

1. Load data
2. Build timeline
3. Seek to timestamp
4. Scroll to bring current jingle into view
5. Expand current jingle if collapsed (future Module 5 feature)

---

## Implementation Strategy

### Phase 1: Add State Management (FabricaPage.tsx)

**Action 1.1:** Add state for expanded jingle IDs

```typescript
const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(
  new Set()
);
```

**Action 1.2:** Add state to track previous expand states (for Module 7, but prepare now)

```typescript
const [previousExpandedStates, setPreviousExpandedStates] = useState<
  Map<string, boolean>
>(new Map());
```

**Action 1.3:** Add useMemo to partition jingles into past/current/future

```typescript
const { pastJingles, currentJingle, futureJingles } = useMemo(() => {
  if (!activeJingleId) {
    return { pastJingles: [], currentJingle: null, futureJingles: jingles };
  }

  const currentIndex = jingles.findIndex((j) => j.id === activeJingleId);
  if (currentIndex === -1) {
    return { pastJingles: [], currentJingle: null, futureJingles: jingles };
  }

  return {
    pastJingles: jingles.slice(0, currentIndex),
    currentJingle: jingles[currentIndex],
    futureJingles: jingles.slice(currentIndex + 1),
  };
}, [jingles, activeJingleId]);
```

**Action 1.4:** Add ref for current jingle row

```typescript
const currentJingleRowRef = useRef<HTMLDivElement>(null);
```

---

### Phase 2: Refactor FabricaPage Layout (FabricaPage.tsx)

**Action 2.1:** Remove existing grid layout (lines 236-262)

**Action 2.2:** Create three-container scrollable structure

```typescript
{
  /* Scrollable container with three sections */
}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "calc(100vh - 200px)", // Reserve space for header
    overflowY: "auto",
    paddingRight: "8px", // Space for scrollbar
  }}
>
  {/* CONTAINER 1: Past jingles - collapsed rows */}
  <div id="past-jingles-container">
    {pastJingles.map((jingle) => (
      <CollapsedJingleRow
        key={jingle.id}
        jingle={jingle}
        isExpanded={expandedJingleIds.has(jingle.id)}
        onToggleExpand={() => handleToggleExpand(jingle.id)}
        onSkipTo={() => handleSkipToJingle(jingle)}
      />
    ))}
  </div>

  {/* CONTAINER 2: Current jingle - player STAYS HERE (fixed in DOM) */}
  <div
    id="current-jingle-container"
    ref={currentJingleRowRef}
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 400px",
      gap: "24px",
      padding: "12px",
      backgroundColor: currentJingle ? "#f0f7ff" : "#fff",
      borderRadius: "8px",
      border: currentJingle ? "2px solid #1976d2" : "1px solid #ddd",
    }}
  >
    <div>
      <YouTubePlayer
        ref={playerRef}
        videoIdOrUrl={videoId}
        width="100%"
        height={480}
        autoplay={false}
        startSeconds={initialTimestamp || undefined}
        className="fabrica-player"
      />
    </div>
    <div>
      {currentJingle ? (
        <JingleMetadata
          jingle={activeJingleMetadata}
          onReplay={() => handleReplayCurrentJingle()}
        />
      ) : jingles.length > 0 ? (
        <EmptyMetadataWithButton onSkipToFirst={handleSkipToFirstJingle} />
      ) : (
        <JingleMetadata jingle={null} /> // Shows "Disfruta del programa"
      )}
    </div>
  </div>

  {/* CONTAINER 3: Future jingles - collapsed rows */}
  <div id="future-jingles-container">
    {futureJingles.map((jingle) => (
      <CollapsedJingleRow
        key={jingle.id}
        jingle={jingle}
        isExpanded={expandedJingleIds.has(jingle.id)}
        onToggleExpand={() => handleToggleExpand(jingle.id)}
        onSkipTo={() => handleSkipToJingle(jingle)}
      />
    ))}
  </div>
</div>;
```

**Action 2.3:** Create helper components within FabricaPage.tsx

**CollapsedJingleRow Component:**

- Shows timestamp, title, and comment as preview
- Expand/collapse button
- Skip-to button
- Full metadata when expanded (table format)
- Full width of container
- Rounded corners, similar styling to metadata panel

**EmptyMetadataWithButton Component:**

- Shows message "Saltar al primer Jingle"
- Button calls onSkipToFirst callback
- Matches metadata panel styling (400px, rounded corners)

---

### Phase 3: Add Auto-Scroll Behavior (FabricaPage.tsx)

**Goal:** When jingles move between containers, auto-scroll to keep current jingle (player) in view.

**Challenge:** When past container grows, it pushes player down. We need to scroll to keep player centered.

**Action 3.1:** Add useEffect for auto-scroll when activeJingleId changes

```typescript
useEffect(() => {
  if (activeJingleId && currentJingleRowRef.current) {
    // Small delay to ensure DOM is updated with new past/future jingles
    setTimeout(() => {
      currentJingleRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center", // Keep player centered in viewport (or 'start' for top)
      });
    }, 100);
  }
}, [activeJingleId]);
```

**Alternative (optional):** Prevent auto-scroll if user is manually scrolling

```typescript
const [userIsScrolling, setUserIsScrolling] = useState(false);

useEffect(() => {
  // Only auto-scroll if user isn't manually scrolling
  if (activeJingleId && currentJingleRowRef.current && !userIsScrolling) {
    setTimeout(() => {
      currentJingleRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }
}, [activeJingleId, userIsScrolling]);
```

**Action 3.2:** (Optional) Add scroll event listener to detect user scrolling

---

### Phase 4: Implement Skip to First Jingle (FabricaPage.tsx)

**Action 4.1:** Create handler function

```typescript
const handleSkipToFirstJingle = () => {
  if (jingles.length > 0 && playerRef.current?.isReady()) {
    const firstJingle = jingles[0];
    const timestampSeconds = normalizeTimestampToSeconds(firstJingle.timestamp);
    if (timestampSeconds !== null) {
      seekTo(timestampSeconds);
    }
  }
};
```

**Action 4.2:** Create EmptyMetadataWithButton component

```typescript
function EmptyMetadataWithButton({
  onSkipToFirst,
}: {
  onSkipToFirst: () => void;
}) {
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #ddd",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
      }}
    >
      <p style={{ marginBottom: "16px", fontSize: "16px", color: "#666" }}>
        Reproducción en curso
      </p>
      <button
        onClick={onSkipToFirst}
        style={{
          padding: "12px 24px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Saltar al primer Jingle
      </button>
    </div>
  );
}
```

---

### Phase 5: Enhance Deep Linking (FabricaPage.tsx)

**Action 5.1:** Update deep linking useEffect (lines 139-144)

```typescript
useEffect(() => {
  if (initialTimestamp !== null && playerState.isReady && playerRef.current) {
    seekTo(initialTimestamp);
    setInitialTimestamp(null);

    // Scroll to current jingle after seeking
    setTimeout(() => {
      if (currentJingleRowRef.current) {
        currentJingleRowRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 500); // Give time for activeJingle to update
  }
}, [initialTimestamp, playerState.isReady, seekTo]);
```

---

### Phase 6: Implement CollapsedJingleRow Component

**Action 6.1:** Create CollapsedJingleRow within FabricaPage.tsx

```typescript
interface CollapsedJingleRowProps {
  jingle: JingleTimelineItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSkipTo: () => void;
}

function CollapsedJingleRow({ jingle, isExpanded, onToggleExpand, onSkipTo }: CollapsedJingleRowProps) {
  const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
  const timestampFormatted = timestampSeconds !== null
    ? formatSecondsToTimestamp(timestampSeconds)
    : String(jingle.timestamp);

  const displayTitle = jingle.title || 'A CONFIRMAR';

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #ddd',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Collapsed header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#666',
          minWidth: '80px',
        }}>
          {timestampFormatted}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
            {displayTitle}
          </div>
          {!isExpanded && jingle.comment && (
            <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              {jingle.comment}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onSkipTo} style={{ ... }}>
            ⏩ Saltar a
          </button>
          <button onClick={onToggleExpand} style={{ ... }}>
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          {/* Table with metadata - similar to JingleMetadata but table format */}
          {/* TODO: Implement in Module 5 */}
        </div>
      )}
    </div>
  );
}
```

---

### Phase 7: Update Event Handlers (FabricaPage.tsx)

**Action 7.1:** Add toggle expand handler

```typescript
const handleToggleExpand = (jingleId: string) => {
  setExpandedJingleIds((prev) => {
    const next = new Set(prev);
    if (next.has(jingleId)) {
      next.delete(jingleId);
    } else {
      next.add(jingleId);
    }
    return next;
  });
};
```

**Action 7.2:** Update handleSkipToJingle to expand target jingle (optional)

```typescript
const handleSkipToJingle = (jingle: JingleTimelineItem) => {
  const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
  if (timestampSeconds !== null && playerRef.current?.isReady()) {
    seekTo(timestampSeconds);

    // Optionally expand the jingle
    setExpandedJingleIds((prev) => new Set(prev).add(jingle.id));

    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("t", timestampSeconds.toString());
    navigate(`/f/${fabricaId}?${newSearchParams.toString()}`, {
      replace: true,
    });
  }
};
```

**Action 7.3:** Add replay handler for metadata panel

```typescript
const handleReplayCurrentJingle = () => {
  if (currentJingle && playerRef.current?.isReady()) {
    const timestampSeconds = normalizeTimestampToSeconds(
      currentJingle.timestamp
    );
    if (timestampSeconds !== null) {
      seekTo(timestampSeconds);
    }
  }
};
```

---

### Phase 8: Update JingleMetadata for Replay Button (deferred to Module 4)

This will be handled in Module 4, but we can prepare the callback now:

- Add `onReplay` prop to JingleMetadata interface
- Pass `handleReplayCurrentJingle` as callback

---

### Phase 9: Remove Old Timeline Section (FabricaPage.tsx)

**Action 9.1:** Remove lines 264-280 (old timeline section)

- Section heading "Lista de Jingles"
- JingleTimeline component
- Empty state message

---

## Dependencies & Considerations

### Dependencies on Other Modules

- **Module 4:** JingleMetadata table format and replay button (can be done in parallel)
- **Module 5:** Full JingleTimeline refactor for expandable rows (can be deferred; use simple expand in Module 3)
- **Module 7:** Expand/collapse state management (prepare state now, full logic later)

### What NOT to Do in Module 3

- Don't implement full table format in collapsed rows (that's Module 4/5)
- Don't implement animated player "slide" transitions (that's advanced Module 3.1 requirement, defer)
- Don't implement expand/collapse state persistence across active changes (that's Module 7)

### Simplified Approach for Module 3

- Collapsed rows show: timestamp, title, comment (simple preview)
- Expanded rows show: basic metadata in a simple grid (not full table)
- Focus on layout structure and scroll behavior
- Leave detailed styling for later modules

---

## Testing Checklist

After implementing Module 3:

- [ ] Timeline and player are merged in continuous scrollable list
- [ ] Past jingles appear above player (collapsed)
- [ ] Current jingle shows player + metadata side-by-side
- [ ] Future jingles appear below player (collapsed)
- [ ] Auto-scroll works when active jingle changes
- [ ] "Skip to First Jingle" button appears when no active jingle
- [ ] Button seeks to first jingle timestamp
- [ ] Deep linking with `?t=123` scrolls to correct jingle
- [ ] Expand/collapse buttons work for timeline rows
- [ ] Skip-to buttons work for timeline rows
- [ ] Layout is responsive and scrollbar appears when needed
- [ ] Player remains playable while scrolling

---

## Estimated Complexity

**Time Estimate:** 4-6 hours

**Risk Level:** Medium-High

- Major layout refactor
- Need to ensure player doesn't re-mount/restart when layout updates
- Scroll behavior may need tuning

**Dependencies:** Low (mostly self-contained in FabricaPage.tsx)

---

## Next Steps

1. Review this plan with user
2. Confirm simplified approach for Module 3 vs full implementation
3. Decide whether to implement basic collapsed rows now or wait for Module 5
4. Begin implementation phase-by-phase
5. Test each phase before moving to next
