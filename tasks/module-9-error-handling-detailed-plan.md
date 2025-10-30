# Module 9: Error Handling & Edge Cases - Detailed Implementation Plan

## 9.0 Context & Scope

This document details the step-by-step implementation plan for **Module 9** arising from the FabricaPage feedback and product requirements. This module addresses robust error handling, loading-state UX, and edge-case UI for the Fabrica page player/metadata/timeline experience. It ensures the app gracefully guides users in cases of missing Fabrica data, data loading delays, API failures, or empty timelines (with no jingles).

**Sources:**
- `tasks/plan-feedback-fabrica-page.md`, Section: Module 9
- `frontend/src/pages/FabricaPage.tsx` code (error/loading states, modal, timeline)
- Product feedback round 2.8

---

## Objectives

- **User Guidance:** Proactively notify and redirect users when critical data is unavailable/missing (e.g., missing Fabrica or corrupted data).
- **Progressive Disclosure:** Use skeletons/loading indicators for a polished loading experience, especially on slow connections.
- **Predictable UX:** Clearly distinguish between successful, loading, and error states. Offer fallback actions (like redirecting to latest valid Fabrica).
- **Compliance:** Ensure all messages are in Spanish (Argentina), following platform UI writing guidelines.

---

## Affected Files & Components

- `frontend/src/pages/FabricaPage.tsx` (main logic)
- (Indirection: components used for modal UI, skeleton loaders, etc., if separated)

---

## Step-by-Step Implementation Instructions

### **Task 9.1 - Handle Missing Fabrica Error**

**Goal:** If the current Fabrica ID is missing, invalid, or data fetch fails with a fatal error, show a warning modal: "Error de datos, cargando la ultima Fabrica". Then automatically fetch and redirect to the latest Fabrica available.

#### **Implementation Steps:**
1. **Error Boundary/Awareness**
    - In FabricaPage, catch all errors (`try/catch` around API calls and `useEffect` for fetching Fabrica).
    - On catch/failure: `setError()` with reason, trigger modal display.
2. **Warning Modal**
    - Show a modal (blocking, no background dismiss) with:
      - Title: "Error de datos"
      - Message: "No se pudo cargar la Fabrica seleccionada. Cargando la última Fabrica disponible..."
      - Optionally, a spinner or progress bar
    - Modal should activate as soon as error occurs.
3. **Fetch Latest Fabrica and Redirect**
    - After showing the error modal for at least 1s (to allow user to see), auto-invoke a fallback fetch:
      - Call API `/api/public/fabricas/latest` (if exists), else fallback to listing endpoint, grab most recent
    - Update page route: `navigate("/fabricas/{latestFabrica.id}")`
    - Dismiss modal after redirect/initiate loading state for new ID.
4. **Edge:** If *no* fabrica found, show: "No hay Fabricas disponibles. Intente más tarde." (and block further UI)
#### **Testing Tips:**
- Simulate API failure, non-existent FabricaId, and empty backend
- Ensure modal never disappears before redirect, and error does not propagate

---

### **Task 9.2 - Handle Loading States**

**Goal:** Show visually distinct loading states while fetching Fabrica and Jingles, with skeletons/indicators, in correct timeline/playback order.

#### **Implementation Steps:**
1. **Loading State Variable**
    - Use `loading` state (already present) to guard *all* main UI render sections.
2. **Skeleton Indicators**
    - While `loading` is true:
      - Player area: Show a rect/skeleton player frame
      - Metadata panel: Skeleton blocks for title, info, comments
      - Timeline rows: Render N skeleton rows (CSS shimmer)/placeholder text
    - Reference styles from modules 7 and 8 (use same CSS for skeletons)
3. **Incremental/Progressive Rendering (optional/polish)**
    - As soon as Fabrica loads, but jingles are still loading, consider separately showing Fabrica header/info and a loading spinner for jingles.
4. **Restore UI After Loading**
    - On loading completion, seamlessly switch to full content (player, metadata, timeline).

#### **Testing Tips:**
- Throttle network, reload: skeletons always visible prior to data
- Non-blocking spinner for slow endpoints
- No UI "flash" or unstyled content on first render

---

### **Task 9.3 - Handle Empty State (No Jingles)**

**Goal:** When a Fabrica loads but contains NO jingles, show an informative, positive empty state in metadata panel and *do not* show timeline rows.

#### **Implementation/Status:**
- **Already implemented in Module 3.**
  - Metadata panel shows heading: "Disfruta del programa"
  - Timeline section is hidden/omitted in this state
  - Player loads but shows nothing until a jingle exists

#### **Test Criteria:**
- Load a Fabrica with an empty jingle array
- Confirm: Only player and empty state message visible, timeline not rendered, no errors thrown

---

## Developer Notes & References

- Ensure all user-facing UI errors/messages are in Spanish (Argentina)
- Modal can use a generic reusable dialog, but must block unintended actions until redirect/handled
- Use React state for modal visibility and error details
- All UI feedback (modals, loading, empty) must gracefully handle navigation/back navigation

---

## Final Checklist

- [ ] Error boundary and modal logic implemented in FabricaPage
- [ ] Fallback fetch/redirect logic on critical data error
- [ ] Skeleton loading states for all major UI sections
- [ ] Polished empty state for no jingles (as per Module 3)
- [ ] UX/UI tested under slow/failing/missing backend scenarios
- [ ] All texts Spanish, reviewed for clarity and tone
