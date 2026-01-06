---
name: WORKFLOW_008 changes
overview: "Implement the two validated gaps from WORKFLOW_008: prevent Level 1 expansion in Guest/User mode, and keep a visible Level 0 relationship row when expanded with secondary text hidden, aligning the Inspect pages with the Guest inspection specification."
todos:
  - id: relrow-entitycard
    content: Refactor `RelatedEntities` to render Level 0 relationship rows with `EntityCard` in both collapsed and expanded states, hiding secondary text when expanded, and indenting Level 1 rows.
    status: pending
  - id: disable-level1-expand
    content: Enforce “Level 1 not expandable” in Guest/User mode by removing entity expansion UI/hooks and skipping nested-row rendering in non-admin mode.
    status: pending
    dependencies:
      - relrow-entitycard
  - id: update-tests
    content: Update RelatedEntities tests to match the new Level 0 relationship row rendering and add coverage that Level 1 expand icons do not appear in user mode.
    status: pending
    dependencies:
      - disable-level1-expand
  - id: update-docs
    content: Update WORKFLOW_008 docs/validation report code references and clarify nav icon wording to match `showUserNavButton` behavior.
    status: pending
    dependencies:
      - update-tests
---

# WORKFLOW_008 Entity Inspection: Implementation Plan (Proposed Changes)

**Date**: 2026-01-06

## Goals

- **Enforce Guest/User behavior**: Level 1 entity rows are **not expandable** (no nesting loops).
- **Match expanded relationship UI**: When a Level 0 relationship row is expanded, the **Level 0 row remains visible** and its **secondary text is hidden**.
- Keep **Admin mode behavior unchanged** unless explicitly required.

## Primary Code Touchpoints

- UI + state: [frontend/src/components/common/RelatedEntities.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/RelatedEntities.tsx)
- Row rendering: [frontend/src/components/common/EntityCard.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/EntityCard.tsx)
- Public pages: 
- [frontend/src/pages/inspect/InspectJingle.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectJingle.tsx)
- [frontend/src/pages/inspect/InspectCancion.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectCancion.tsx)
- [frontend/src/pages/inspect/InspectFabrica.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectFabrica.tsx)
- [frontend/src/pages/inspect/InspectArtista.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectArtista.tsx)
- [frontend/src/pages/inspect/InspectTematica.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectTematica.tsx)

## Implementation Approach

### 1) Render Level 0 relationship rows using `EntityCard` (collapsed + expanded)

Today, user mode renders a custom collapsed `<button>` for the Level 0 relationship row, and **renders no Level 0 row at all in the expanded branch**.Change [frontend/src/components/common/RelatedEntities.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/RelatedEntities.tsx) so each relationship section always renders a **Level 0 relationship row** as an `EntityCard`, regardless of expanded state:

- **Collapsed**: `EntityCard` shows relationship label and a secondary summary (e.g. count)
- **Expanded**: the same `EntityCard` remains visible, but secondary summary is **hidden**

Key design details:

- Create a small helper in `RelatedEntities.tsx` to build a lightweight “relationship summary entity” object (using the existing `Entity` shape) for rendering only.
- Prevent accidental navigation by providing an `onClick` handler (toggle expand/collapse) so `EntityCard` will not auto-generate a route.
- For “hide secondary when expanded” without touching `EntityCard`, set `entity.displaySecondary` to `''`/`undefined` when `isExpanded===true`.
- After this change, render Level 1 entities **under** the Level 0 relationship row.
- Update indentation to match the spec: Level 0 relationship row uses `indentationLevel={0}`, Level 1 entity rows use `indentationLevel={1}`.

### 2) Disable Level 1 expandability in Guest/User mode

The current user-mode entity row rendering passes `hasNestedEntities` and `onToggleExpand` for Level 1 entities (see the `EntityCard` render around the `hasNestedEntities={canExpandEntity}` usage).Change [frontend/src/components/common/RelatedEntities.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/RelatedEntities.tsx) so that when `isAdmin === false`:

- Level 1 entity rows **never** receive `hasNestedEntities`, `isExpanded`, `nestedCount`, or `onToggleExpand`.
- The nested rendering branch guarded by `isEntityExpanded` should become **admin-only**, or be fully skipped in user mode.

This directly enforces the workflow/spec requirement: “Level 1 rows are NOT expandable”.

### 3) Public inspect pages remain thin

No structural changes needed in the inspect pages besides verifying they still pass `entityPath={[entity.id]}`. If we decide we need an extra guard, we can optionally pass a stricter depth setting (e.g. `maxDepth={1}`) from the inspect pages, but the primary enforcement should live in `RelatedEntities`’ user-mode rendering.

### 4) Update docs to match the new implementation

After the code change lands:

- Update code reference line numbers in:
- [docs/1_frontend_ux-workflows/workflows/guest-experience/WORKFLOW_008_entity-inspection_validation-report.md](/Users/william/Usina/jinglero/docs/1_frontend_ux-workflows/workflows/guest-experience/WORKFLOW_008_entity-inspection_validation-report.md)
- (Likely) [docs/1_frontend_ux-workflows/workflows/guest-experience/WORKFLOW_008_entity-inspection.md](/Users/william/Usina/jinglero/docs/1_frontend_ux-workflows/workflows/guest-experience/WORKFLOW_008_entity-inspection.md)
- Clarify the “navigation icon” phrasing to explicitly reference `EntityCard`’s `showUserNavButton` behavior.

## Testing / Acceptance Criteria

- **AC1**: In Guest/User mode, Level 1 entity rows show **no expand/collapse icon** and cannot be expanded.
- **AC2**: Expanding a relationship keeps a visible Level 0 relationship row at the top of the section.
- **AC3**: In expanded state, Level 0 relationship row’s secondary summary text is **not shown**.
- **AC4**: Indentation matches the spec: Level 1 entity rows are visually indented vs Level 0 relationship rows.
- **AC5**: Admin mode behavior is unchanged.

Update/add unit/integration tests in:

- [frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx)
- [frontend/src/components/common/__tests__/RelatedEntities.task5.test.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/__tests__/RelatedEntities.task5.test.tsx)
- [frontend/src/components/__tests__/RelatedEntities.test.tsx](/Users/william/Usina/jinglero/frontend/src/components/__tests__/RelatedEntities.test.tsx)

Specifically:

- Replace expectations that rely on the old collapsed `<button aria-label="Expandir …">` with assertions against the new relationship-row `EntityCard` behavior.
- Add an assertion that **no** expand icon exists for Level 1 entity cards in user mode.

## Rollout Notes

- This is mostly a rendering refactor; the reducer/state can remain intact, but the user-mode UI should stop exposing `expandedEntities`.