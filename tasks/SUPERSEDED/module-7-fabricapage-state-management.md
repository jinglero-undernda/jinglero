# Module 7 Implementation Plan: FabricaPage State Management

---

## Context & Scope

This document provides step-by-step implementation and documentation for **Module 7: FabricaPage State Management**, as defined in `plan-feedback-fabrica-page.md` (and related docs). Its purpose is to ensure the timeline of jingles on the FabricaPage behaves intuitively and robustly, supporting dynamic expand/collapse, navigation, and deep-link interactions per requirements and user feedback.

- **Relevant Files:**
  - `frontend/src/pages/FabricaPage.tsx`
  - (Related: `components/player/JingleTimeline.tsx`, `tasks/plan-feedback-fabrica-page.md`)
- **Partial completion:** Some aspects were implemented as part of Module 3 or partially in Module 4/5.

---

## Implementation Steps

### 1. Expand/Collapse State Model

- **[PARTIALLY COMPLETE, Module 3]**
  - `expandedJingleIds: Set<string>` state tracks currently expanded jingle rows.
    ```typescript
    const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(
      new Set()
    );
    ```
  - **(Optional/future)**: To support restoring previous expanded/collapsed states, add:
    ```typescript
    const [previousExpandedStates, setPreviousExpandedStates] = useState<
      Map<string, boolean>
    >(new Map());
    ```

### 2. Initial State & Reset

- All jingles start **collapsed** by default (`expandedJingleIds = new Set()`).
- On page reload or Fabrica change, reset expand/collapse state unless restoring from persisted/deep link state.
- **[COMPLETE]**

### 3. Manual Expand/Collapse (User Interaction)

- **[COMPLETE]**
  - Toggle logic implemented via `handleToggleExpand(jingleId)`. Adds/removes the ID in `expandedJingleIds`.
  - On first expansion, if full jingle data is missing, fetch via API (`publicApi.getJingle`) and update the timeline state with relationships.

### 4. Expansion State and Jingle Activation/Navigation

- **[COMPLETE]**
  - Only **manual toggling of a timeline row by the user** should add/remove that row’s ID from `expandedJingleIds`.
  - When a jingle becomes current (through playback, skip-to, or deep-link), its timeline row is not rendered, and no change to its expansion state is required.
  - When the playback advances and the jingle re-enters the timeline (as past or future), its row should appear using the **stored expansion state**.
  - **Skip-to or automatic playback** should not change expansion/collapse state.

### 5. Restore Prior State on Deactivation (Optional)

- **[PENDING, IF IMPLEMENTED]**
  - Optionally: If extra UX polish is needed, on jingle becoming inactive (moving from center to timeline), use a `previousExpandedStates` map to record and restore expanded/collapsed status if additional behavior is desired.

### 6. Deep Linking Handling

- **[INCOMPLETE / INVESTIGATION NEEDED]**
  - If the link contains a timestamp (`?t=seconds`), on initial load:
    1. The intent is to seek the YouTube player to the appropriate time.
    2. The corresponding jingle becomes "current" (center), expansion state for timeline rows is not altered.
    3. When it returns to timeline display (past/future), the jingle's row should use its persisted expansion state.
    4. This is managed via the `initialTimestamp` state and the corresponding `useEffect`.
  - **Current Issue:** When navigating via skip-to (timeline row skip or deep link), the page reloads/rebuilds so the player restarts, losing playback continuity. This is _not_ happening for the Metadata Panel's "Saltar al primer Jingle" button, which works as intended (seeks smoothly with no page reload).

#### Skip-to Handling

- **Required Behavior**

  - When the user skips to a jingle (via timeline skip-to button or deep link):
    - The player should seek directly to the correct timestamp **without** reloading the React app or unmounting the player.
    - Only playback position and active jingle logic should update.
  - Reference: The "Saltar al primer Jingle" logic (uses `playerRef` and `seekTo` without navigation or reload).

- **Corrective Actions & Implementation Plan**

  1. **Unify logic for all skip/seeking actions** (timeline, metadata, deep link): Use the same playerRef and `seekTo` routine.
  2. **Eliminate use of `navigate` or routing logic that causes page reload/remount for skips**; if the URL must change for sharing, use history API or react-router's `replace: true` only if it doesn't reload the player.
  3. Update the skip-to handler to:
     - Directly call `seekTo(targetSeconds)` if the player is ready.
     - If needed, update the query string without remount/remounting the page (prefer history/replaceState or a lightweight router update).
  4. Ensure full parity: timeline skip-to and MetadataPanel skip should work identically for UX and playback smoothness.

- **Tests/Cases**
  - [ ] Clicking skip-to on a timeline jingle seeks the player _without_ restart or page reload
  - [ ] Deep-linking to a timestamp seeks to target time (remount only if FabricaId changes)
  - [ ] "Saltar al primer Jingle" and timeline skip-to use the same logic and behave identically
  - [ ] Timeline/expansion state is preserved and unaffected by skips/deep-links

### 7. UI/Component Integration

- **[COMPLETE]**
  - Pass `isExpanded`, `isActive`, expansion state, and handlers as props to each `JingleTimelineRow`.
  - Use visual highlighting (e.g. border/background) for the active row.

### 8. Handling Edge Cases

- **[COMPLETE]**
  - On load error, timeline is empty.
  - On Fabrica switch, collapse all.
  - If no jingles available, hide timeline expanders.

### 9. Testing & Validation

Checklist:

- [ ] Manual expand/collapse works for each row.
- [ ] Active jingle is only shown in the center panel and is not present in the timeline.
- [ ] Skipping to jingle (from timeline or deep link) does not alter expand/collapse state.
- [ ] Data for row is fetched on demand (first expand or on activation).
- [ ] Empty, edge, and reload states handled gracefully.

---

## Implementation Notes & References

- Reference: `plan-feedback-fabrica-page.md`, lines 912-980
- React hooks: `useEffect` for state sync, `useCallback` for handlers.
- Code sample lines: see in-repo `FabricaPage.tsx`, handlers for expand/collapse, skip, scroll, and data-fetching.
- No auto-expansion/additional state management is needed on activation/skipping; only manual toggles update `expandedJingleIds`.

---

## Open Items / Follow-ups

- Decide if robust state restoration (step 5) is required for MVP or post-MVP polish.
- Ensure new tests are written for manual, navigation, and deep-link behaviors.
- Keep document updated as implementation proceeds or issues found.

---
