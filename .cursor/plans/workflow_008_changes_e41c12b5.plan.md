---
name: WORKFLOW_008 changes
overview: "Implement WORKFLOW_008 changes for Guest/User entity inspection: (1) Level 1 rows are not expandable (no nesting loops), (2) expanded relationships keep a visible Level 0 row with secondary text hidden, and (3) implement the GuestEntity spec’s nested blocks (including embedded/compact CTR) for Fabrica→Jingles and Cancion→Jingles using backend-enriched payloads."
todos:
  - id: relrow-entitycard
    content: Refactor `RelatedEntities` to render Level 0 relationship rows with `EntityCard` in both collapsed and expanded states, hiding secondary text when expanded, and indenting Level 1 rows.
    status: pending
  - id: disable-level1-expand
    content: Enforce “Level 1 not expandable” in Guest/User mode by removing entity expansion UI/hooks and skipping nested-row rendering in non-admin mode.
    status: pending
    dependencies:
      - relrow-entitycard
  - id: backend-enrich-fabrica-jingles
    content: Enrich `GET /api/public/fabricas/:id/jingles` so each returned Jingle includes the nested fields required by `GuestEntity_Inspection_Specification` (CTR-needed fields + nested entities like Cancion/Autores/Jingleros/Tematicas) without requiring per-row expansion.
    status: pending
    dependencies:
      - disable-level1-expand
  - id: backend-enrich-cancion-related
    content: Enrich `GET /api/public/entities/canciones/:id/related` (specifically `jinglesUsingCancion`) so each returned Jingle includes the nested fields required for Cancion→Jingles (CTR-needed fields + Fabrica + Jingleros + Tematicas) without N+1 fetches.
    status: pending
    dependencies:
      - disable-level1-expand
  - id: frontend-nested-jingle-blocks
    content: Render the spec’s nested blocks under each Jingle row for Fabrica→Jingles and Cancion→Jingles (using the backend-enriched payloads) while keeping Level 1 rows non-expandable.
    status: pending
    dependencies:
      - backend-enrich-fabrica-jingles
      - backend-enrich-cancion-related
  - id: embed-ctr-compact
    content: Add embedded/compact `CRTMonitorPlayer` rendering (limited height) inside those nested blocks.
    status: pending
    dependencies:
      - frontend-nested-jingle-blocks
  - id: update-tests
    content: Update tests to match the new Level 0 relationship row rendering, assert Level 1 expand icons do not appear in user mode, and cover the new enriched nested blocks rendering (including embedded CTR where applicable).
    status: pending
    dependencies:
      - embed-ctr-compact
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
- **Implement Guest spec nested content (selected scope)**: under **Fabrica → Jingles** and **Cancion → Jingles**, render the spec-required nested blocks, including an embedded/compact CTR monitor, without reintroducing per-row expansion.
- Keep **Admin mode behavior unchanged** unless explicitly required.

## Primary Code Touchpoints

- UI + state: [frontend/src/components/common/RelatedEntities.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/RelatedEntities.tsx)
- Row rendering: [frontend/src/components/common/EntityCard.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/EntityCard.tsx)
- Embedded CTR: [frontend/src/components/production-belt/CRTMonitorPlayer.tsx](/Users/william/Usina/jinglero/frontend/src/components/production-belt/CRTMonitorPlayer.tsx) and [frontend/src/styles/components/crt-monitor-player.css](/Users/william/Usina/jinglero/frontend/src/styles/components/crt-monitor-player.css)
- Backend endpoints to enrich: [backend/src/server/api/public.ts](/Users/william/Usina/jinglero/backend/src/server/api/public.ts)
- Public pages: 
- [frontend/src/pages/inspect/InspectJingle.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectJingle.tsx)
- [frontend/src/pages/inspect/InspectCancion.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectCancion.tsx)
- [frontend/src/pages/inspect/InspectFabrica.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectFabrica.tsx)
- [frontend/src/pages/inspect/InspectArtista.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectArtista.tsx)
- [frontend/src/pages/inspect/InspectTematica.tsx](/Users/william/Usina/jinglero/frontend/src/pages/inspect/InspectTematica.tsx)

## Key Observations From Current Implementation (why the lag happens)

- **Level 0 relationship expansion (User mode)** is lazy-loaded via `handleToggleRelationship(...)`. On expand, it calls that relationship’s `fetchFn(entity.id, entityType)` once (with request deduplication and caching).
- **Level 1 entity row expansion (User mode)** exists today: each Level 1 `EntityCard` can receive `onToggleExpand`. When clicked, it toggles `expandedEntities` and then iterates nested relationship configs for that entity type, calling `nestedRel.fetchFn(...)` for each nested relationship that isn’t already loaded/cached. This can create **multiple API calls per click**, matching the lag you observed.
- **Nested-nested expansion** also exists and is gated by `maxDepth` and `entityPath`.

This behavior directly conflicts with the workflow requirement (“no nesting loops”), so the plan enforces: **no Level 1 expand UI in Guest/User mode** and renders spec-defined nested blocks from **backend-enriched payloads** instead.

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

#### Optional hard guard: `maxDepth={1}`

Setting `maxDepth={1}` on public inspect pages would also prevent Level 1 expansion because `canExpand` is computed as `entityPath.length < maxDepth`. Since public pages pass `entityPath={[entity.id]} `(length 1), `1 < 1` is false.Tradeoff: `maxDepth` is a global limiter; it’s a good safety net but does not implement the spec-required nested blocks. The primary enforcement remains: do not render Level 1 expansion UI in Guest/User mode.

### Interaction model (must match WORKFLOW_008)

- **Level 0 relationship rows (Guest/User)**:
- **Row click**: toggles expand/collapse of the relationship section
- **Icon behavior**:
    - Expand/collapse affordance is visible on the row
    - Navigation (🔍) is not triggered by row click; if present, it must be a separate control
- **Level 1 entity rows (Guest/User)**:
- **Row click**: navigates to the entity inspection page
- **Icon behavior**:
    - **No expand/collapse icon** (Level 1 is non-expandable)
    - **No separate navigation icon** (row click is the navigation)

### 3) Implement GuestEntity nested blocks (selected scope) using backend-enriched payloads

Per [docs/1_frontend_ux-workflows/workflows/guest-experience/GuestEntity_Inspection_Specification.md](/Users/william/Usina/jinglero/docs/1_frontend_ux-workflows/workflows/guest-experience/GuestEntity_Inspection_Specification.md), implement nested content under:

- **Fabrica → Jingles**: embedded/compact CTR (limited height) + nested info per jingle (Cancion, Autor, Jinglero, Tematica).
- **Cancion → Jingles**: embedded/compact CTR (limited height) + nested info per jingle (Fabrica, Jingleros, Tematicas).

Because Level 1 expansion is removed, we will not fetch these nested blocks by clicking each row. Instead, the backend will return enriched objects so the frontend can render the nested blocks immediately when the Level 0 relationship is expanded.Backend work (single-call payloads):

- Enrich `GET /api/public/fabricas/:id/jingles` (implemented in `public.ts`) to return Jingles with:
- `APPEARS_IN` properties already included today (timestamp/order)
- plus nested fields needed for the blocks: `cancion`, `autores`, `jingleros`, `tematicas`, and the Fabrica YouTube field(s) needed for CTR.
- Enrich `GET /api/public/entities/canciones/:id/related` to return `jinglesUsingCancion` with:
- `fabrica` (already attached today)
- plus `APPEARS_IN.timestamp`/order (needed to start the CTR at the right point)
- plus nested `jingleros` and `tematicas` (and any other fields the UI needs).

Frontend work (render-only, no per-row expansion):

- In `RelatedEntities`, for those sections, render a nested “details stack” under each returned Jingle row.
- Embed `CRTMonitorPlayer` inside that nested stack in a compact layout (CSS-driven height/ratio).

### 4) Public inspect pages remain thin

No structural changes needed in the inspect pages besides verifying they still pass `entityPath={[entity.id]}`. If we want an extra guard, optionally pass `maxDepth={1}` on those pages.

### 5) Update docs to match the new implementation

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
- **AC6**: In Fabrica → Jingles and Cancion → Jingles expanded sections, each jingle renders the spec-required nested blocks, including an embedded/compact CTR monitor.
- **AC7 (perf)**: Expanding a relationship section does not trigger per-row expansion fetches; nested content is rendered from a single enriched payload per expanded section.
- **AC8**: Clicking a Level 0 relationship row toggles expand/collapse (does not navigate).
- **AC9**: Clicking a Level 1 entity row navigates to inspection; Level 1 shows no expand icon and no separate nav icon.

Update/add unit/integration tests in:

- [frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx)
- [frontend/src/components/common/__tests__/RelatedEntities.task5.test.tsx](/Users/william/Usina/jinglero/frontend/src/components/common/__tests__/RelatedEntities.task5.test.tsx)
- [frontend/src/components/__tests__/RelatedEntities.test.tsx](/Users/william/Usina/jinglero/frontend/src/components/__tests__/RelatedEntities.test.tsx)

Specifically:

- Replace expectations that rely on the old collapsed `<button aria-label="Expandir …">` with assertions against the new relationship-row `EntityCard` behavior.
- Add an assertion that **no** expand icon exists for Level 1 entity cards in user mode.

## Rollout Notes

- This is mostly a rendering refactor; the reducer/state can remain intact, but the user-mode UI should stop exposing `expandedEntities`.