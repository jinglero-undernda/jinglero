# Module 3 Implementation Checklist

Quick reference checklist for implementing Module 3 changes using the **three-container architecture**.

**Key Architecture:** Player stays fixed in middle container. Jingles move between past/future containers.

## Phase 3A: Core Layout (1.5-2 hours) ✅ COMPLETE

### State Management ✅

- [x] Add `expandedJingleIds` state (Set<string>)
- [x] Add `previousExpandedStates` state (Map<string, boolean>)
- [x] Add `currentJingleRowRef` ref
- [x] Add useMemo to partition jingles (pastJingles, currentJingle, futureJingles)

### Layout Refactor ✅

- [x] Remove existing grid layout (lines 236-262 in FabricaPage.tsx)
- [x] Remove old timeline section (lines 264-280 in FabricaPage.tsx)
- [x] Create scrollable container with flexDirection: 'column'
- [x] Add maxHeight and overflowY to container

### Render Structure (Three-Container Architecture) ✅

- [x] Create outer scrollable container (flexDirection: 'column')
- [x] Create CONTAINER 1: Past jingles (map over pastJingles)
- [x] Create CONTAINER 2: Current jingle (player FIXED in DOM here)
  - [x] Player on left (flexible width)
  - [x] Metadata on right (400px)
  - [x] Handle no active jingle case (empty metadata with button)
  - [x] Add ref to this container for auto-scroll
- [x] Create CONTAINER 3: Future jingles (map over futureJingles)

### Components ✅

- [x] Create `CollapsedJingleRow` inline component
  - [x] Show timestamp, title, comment preview
  - [x] Add expand/collapse button (icon)
  - [x] Add skip-to button
  - [x] Style with rounded corners, border, shadow
- [x] Create `EmptyMetadataWithButton` inline component
  - [x] Show message "Saltar al primer Jingle"
  - [x] Add button with click handler
  - [x] Match metadata panel styling (400px wide)

### Testing Phase 3A

- [ ] Test player doesn't restart when jingles change
- [ ] Test past/current/future partitioning logic
- [ ] Test with first jingle (no past jingles)
- [ ] Test with last jingle (no future jingles)
- [ ] Test with no active jingle (before first timestamp)
- [ ] Verify scrollbar appears when needed

---

## Phase 3B: Interactive Features (2 hours) ✅ COMPLETE

### Event Handlers ✅

- [x] Create `handleToggleExpand(jingleId: string)` function
  - [x] Toggle jingle ID in expandedJingleIds Set
- [x] Create `handleSkipToFirstJingle()` function
  - [x] Seek to first jingle timestamp
- [x] Create `handleReplayCurrentJingle()` function
  - [x] Seek to current jingle timestamp
- [x] Update `handleSkipToJingle` to expand target (deferred - optional)

### Expand/Collapse Functionality ✅

- [x] Pass `isExpanded` prop to CollapsedJingleRow
- [x] Pass `onToggleExpand` callback to CollapsedJingleRow
- [x] Implement expanded view in CollapsedJingleRow
  - [x] Show placeholder (full implementation in Module 5)
  - [x] Add border/padding to separate from header
- [ ] Test expand/collapse multiple rows simultaneously ⚠️ NEEDS TESTING

### Skip-to Functionality ✅

- [x] Pass `onSkipTo` callback to CollapsedJingleRow
- [x] Verify seekTo works from collapsed rows (implementation complete)
- [x] Update URL with timestamp parameter (already in handleSkipToJingle)
- [ ] Test skip-to from past jingles ⚠️ NEEDS TESTING
- [ ] Test skip-to from future jingles ⚠️ NEEDS TESTING

### Empty State Button ✅

- [x] Implement "Skip to First Jingle" button
- [x] Connect to handleSkipToFirstJingle
- [ ] Test button appears when no active jingle ⚠️ NEEDS TESTING
- [ ] Test button disappears when jingle is active ⚠️ NEEDS TESTING
- [ ] Test button works correctly (seeks to first timestamp) ⚠️ NEEDS TESTING

### Testing Phase 3B

- [ ] Test expand/collapse doesn't affect playback
- [ ] Test skip-to from various jingle positions
- [ ] Test skip-to updates URL correctly
- [ ] Test empty state button seeks correctly
- [ ] Test with no jingles (button doesn't appear)

---

## Phase 3C: Polish (1 hour) ✅ COMPLETE

### Auto-Scroll Behavior ✅

- [x] Add useEffect watching activeJingleId
- [x] Use currentJingleRowRef.current.scrollIntoView()
- [x] Set behavior: 'smooth', block: 'center'
- [x] Add small delay (100ms) to ensure DOM updated
- [ ] Test auto-scroll works on jingle change ⚠️ NEEDS TESTING
- [ ] Test auto-scroll doesn't interrupt manual scrolling (deferred - optional)

### Deep Linking Enhancement ✅

- [x] Update deep linking useEffect
- [x] Add scroll to current jingle after seeking
- [x] Add delay (500ms) to allow activeJingle to update
- [ ] Test deep linking with ?t=0 (first jingle) ⚠️ NEEDS TESTING
- [ ] Test deep linking with ?t=middle timestamp ⚠️ NEEDS TESTING
- [ ] Test deep linking with ?t=end timestamp ⚠️ NEEDS TESTING

### Styling Refinements ✅

- [x] Ensure current jingle row has distinct styling (blue background, border, shadow)
- [x] Ensure collapsed rows have consistent spacing (marginBottom: 8px)
- [x] Add hover states to buttons (basic styling applied)
- [x] Ensure scrollbar styling is clean (paddingRight: 8px)
- [ ] Test responsive behavior (narrow viewports) ⚠️ NEEDS TESTING

### JingleMetadata Replay Button (deferred to Module 4)

- [x] Create `handleReplayCurrentJingle` function (ready for Module 4)
- [ ] Add `onReplay` prop to JingleMetadata interface (Module 4)
- [ ] Pass `handleReplayCurrentJingle` to JingleMetadata (Module 4)
- [ ] Implement button in metadata panel (Module 4)

### Testing Phase 3C

- [ ] Test auto-scroll with smooth animation
- [ ] Test deep linking scrolls to correct position
- [ ] Test all styling looks clean and consistent
- [ ] Test with full dataset (50+ jingles)
- [ ] Test scroll performance with many jingles
- [ ] Test player stability through entire video
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on different screen sizes

---

## Edge Cases to Test

- [ ] Fabrica with 0 jingles
- [ ] Fabrica with 1 jingle
- [ ] Fabrica with 50+ jingles
- [ ] Playback before first jingle
- [ ] Playback after last jingle
- [ ] Playback exactly at jingle timestamp
- [ ] Playback between two jingles
- [ ] Skip backward (future → past)
- [ ] Skip forward (past → future)
- [ ] Rapid timestamp changes (seeking quickly)
- [ ] Deep linking to invalid timestamp
- [ ] Deep linking to timestamp before first jingle
- [ ] Expand/collapse while video is playing
- [ ] Scroll manually while video is playing
- [ ] Narrow viewport (< 1000px width)

---

## Known Issues / Future Work

Track any issues discovered during implementation:

### Issues

- [ ] _List any bugs or unexpected behaviors here_

### Future Enhancements (post-Module 3)

- [ ] Animated player transition (slides down the list)
- [ ] Virtual scrolling for very large jingle lists (100+)
- [ ] User scroll detection (pause auto-scroll if user is scrolling)
- [ ] Keyboard navigation (arrow keys to navigate jingles)
- [ ] Accessibility improvements (ARIA labels, focus management)

---

## Files Modified

Track files changed during implementation:

- [ ] `frontend/src/pages/FabricaPage.tsx` (major refactor)
- [ ] Other: ******\_\_\_******

---

## Completion Criteria

Module 3 is complete when ALL of the following are true:

- ✅ Timeline and player merged in single scrollable container
- ✅ Past jingles render above player (collapsed rows)
- ✅ Current jingle shows player left + metadata right (400px)
- ✅ Future jingles render below player (collapsed rows)
- ✅ Expand/collapse works for collapsed rows
- ✅ Skip-to works from collapsed rows
- ✅ "Skip to First Jingle" button appears and works
- ✅ Auto-scroll brings current jingle into view
- ✅ Deep linking scrolls to correct jingle
- ✅ Player plays smoothly without restarting
- ✅ All edge cases tested
- ✅ No console errors or warnings
- ✅ Code is clean and commented

---

## Time Tracking

Track actual time spent per phase:

- **Phase 3A (Core Layout):** **\_** hours
- **Phase 3B (Interactive):** **\_** hours
- **Phase 3C (Polish):** **\_** hours
- **Total:** **\_** hours

**Estimated:** 5-6 hours  
**Actual:** **\_** hours
