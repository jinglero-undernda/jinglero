# Module 8 Implementation Plan: FabricaPage Styling Updates

**Context Source: `/tasks/plan-feedback-fabrica-page.md`, Module 8 & Feedback 2.8**

---

## 8.1. Objective

Move all main visual/layout styles for FabricaPage and key subcomponents out of inline React style props into separate, maintainable CSS files. Ensure all styling feedback from 2.8 is actionable. Refactor for accessibility, theme consistency, and dev/design scalability.

---

## 8.2. Files & Directory Structure

- Create or update:
  - `frontend/src/styles/pages/fabrica.css` # FabricaPage container & layout
  - `frontend/src/styles/components/metadata.css` # Metadata panel, table
  - `frontend/src/styles/components/timeline.css` # Timeline rows, expansion, icons
  - `frontend/src/styles/components/player.css` # YouTube player area

If using CSS modules, use `.module.css` and update imports accordingly.

---

## 8.3. Step-by-Step Implementation Instructions

### **Step 1. Prep & Audit**

- Ensure all directories above exist and are added to the repo.
- In each of these components:
  - `frontend/src/pages/FabricaPage.tsx`
  - `frontend/src/components/player/JingleMetadata.tsx`
  - `frontend/src/components/player/JingleTimeline.tsx`
  - `frontend/src/components/player/YouTubePlayer.tsx`
- List all inline style usages (`style={{...}}`) and group logically by visual function (container, table, buttons, rows, etc).
  - Example audit block (include in commit/notes as checklist):
    - Timeline container (FabricaPage, line xx)
    - Metadata header (JingleMetadata, line yy)
    - Replay button (lines zz, etc)

### **Step 2. Extract and Implement CSS Classes**

- For each inline style found, **create a matching CSS class** in the best-fit target CSS file.
  - Example (from `FabricaPage.tsx`):
    ```css
    /* fabrica.css */
    .fabrica-container {
      display: flex;
      flex-direction: column;
      max-height: 100vh;
      overflow-y: auto;
    }
    ```
  - Example (in `JingleMetadata.tsx`):
    ```css
    /* metadata.css */
    .metadata-header {
      background: #fff;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      border-bottom: 2px solid #eee;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .replay-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 24px;
      color: #1976d2;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .replay-button:focus-visible {
      outline: 2px solid #1976d2;
      outline-offset: 2px;
    }
    ```
- Assign clear, unique class names. Use BEM or similar convention if preferred (e.g., `timeline-row--active`).
- For interactive controls (buttons), define :hover, :active, and :focus-visible styles.

### **Step 3. Refactor JSX/TSX to Use Classes**

- Replace all inline style objects with appropriate `className` props
  - Example: `<div className="fabrica-container">` instead of `style={{...}}`
- Remove all obsolete inline styling from the React render.
- For multi-class cases (combining highlights, active states):
  - Use logic: `className={"timeline-row" + (isActive ? " timeline-row--active" : "")}`
- Ensure ARIA labels/roles are present where needed (e.g., buttons, status indicators).

### **Step 4. Responsive & Accessibility Tuning**

- Add media queries for mobile and tablet, especially for:
  - Timeline container scroll/overflow
  - Current jingle row layout (vertical stack under 600px, sidebar full-width)
  - Font and button size adjustments
- Add accessible focus states (for all buttons and interactive icons)
- Ensure color contrast meets WCAG AA

### **Step 5. Import and Wire Styles**

- At the top of: `FabricaPage.tsx`, `JingleMetadata.tsx`, `JingleTimeline.tsx`, `YouTubePlayer.tsx` import the right CSS files:
  ```tsx
  import "../../styles/pages/fabrica.css";
  import "../../styles/components/metadata.css";
  import "../../styles/components/timeline.css";
  import "../../styles/components/player.css";
  ```
  (adjust relative path as needed)
- If using CSS Modules, import as:
  ```tsx
  import styles from "../../styles/pages/fabrica.module.css";
  ```
  ...and use `className={styles.fabricaContainer}` etc.

### **Step 6. Test & Iterate**

- Run the app; verify zero inline styles on target components
- Crosscheck visual and interactive functionality:
  - Timeline scroll/expand/collapse/active
  - Metadata table (all fields, multiple rows for autores/jingleros/tematicas)
  - Replay and skip-to actions, icon/button feedback
  - Highlighting for active row/jingle
  - Responsiveness (desktop/mobile)
  - Accessibility (keyboard/tab nav, color contrast, icon alt text or aria-labels)
- Get visual/design feedback from the design/PO/reviewer (match feedback in 2.8)

### **Step 7. Document Style Structure**

- (In code comments or in this doc) add a short class name/structure legend for future devs
- Example:
  ```css
  /* fabrica.css */
  .fabrica-container {
    ...;
  }
  /* metadata.css */
  .metadata-header {
    ...;
  }
  .metadata-table {
    ...;
  }
  /* timeline.css */
  .timeline-row {
    ...;
  }
  .timeline-row--active {
    ...;
  }
  .timeline-row--collapsed {
    ...;
  }
  .timeline-row--expanded {
    ...;
  }
  .expand-icon {
    ...;
  }
  .skip-to-icon {
    ...;
  }
  ```

---

## 8.4. Scope & Completion Criteria

- All major component-level style is handled in maintainable CSS files.
- Inline style usage in affected components is zeroed out (except for tight dynamic cases — justify in code comments if so).
- All major feedback (2.8) points about visual design are resolved or clearly blocked pending theme/deeper design.
- Next modules (9+: error, edge, testing) will build on this visual foundation.

---

## 8.5. References & Links

- Main planning: `/tasks/plan-feedback-fabrica-page.md` (Module 8)
- Feedback source: `/tasks/feedback-fabrica-page-2.8.md`
- Related UI code: See `/frontend/src/pages/FabricaPage.tsx`, `/frontend/src/components/player/`
- See also prior detailed module plans for structural/logic context.
