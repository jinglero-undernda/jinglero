# RelatedEntities Component Refactoring - Task List

This document contains the sequential task list for refactoring the RelatedEntities component. Each task is designed to be completed independently and committed separately.

---

## Phase 1: Foundation and Preparation

### 1. Extract entity type mapping utility

- [x] Create file `frontend/src/lib/utils/entityTypeUtils.ts`
- [x] Move entity type mapping logic (f → fabrica, j → jingle, etc.) from `InspectRelatedEntitiesPage.tsx` to the utility
- [x] Export function `normalizeEntityType(rawType: string): EntityType | null`
- [x] Update `InspectRelatedEntitiesPage.tsx` to import and use the new utility function
- [x] Update `InspectEntityPage.tsx` to import and use the new utility function

### 2. Extract sorting logic to separate utility

- [x] Create file `frontend/src/lib/utils/entitySorters.ts`
- [x] Move `sortEntities` function from `RelatedEntities.tsx` to the new utility file
- [x] Export the function with proper TypeScript types
- [x] Update `RelatedEntities.tsx` to import `sortEntities` from the utility
- [x] Verify sorting still works correctly

### 3. Create entity type guards utility

- [x] Add type guard functions to `frontend/src/lib/utils/entityTypeUtils.ts`
- [x] Create `isFabrica(entity: RelatedEntity): entity is Fabrica`
- [x] Create `isJingle(entity: RelatedEntity): entity is Jingle`
- [x] Create `isCancion(entity: RelatedEntity): entity is Cancion`
- [x] Create `isArtista(entity: RelatedEntity): entity is Artista`
- [x] Create `isTematica(entity: RelatedEntity): entity is Tematica`
- [x] Export all type guards

### 4. Add isAdmin prop to RelatedEntitiesProps interface

- [x] Open `frontend/src/components/common/RelatedEntities.tsx`
- [x] Add `isAdmin?: boolean;` property to `RelatedEntitiesProps` interface (line ~36)
- [x] Add JSDoc comment explaining Admin Mode behavior
- [x] Destructure `isAdmin` prop in component function with default value `false`
- [x] Verify TypeScript compilation succeeds

### 5. Add TypeScript guard for entity prop validation

- [x] In `RelatedEntities.tsx`, add runtime check that `entity` prop is not null/undefined
- [x] Add early return or error handling if entity is invalid
- [x] Add TypeScript assertion or guard to ensure entity is always defined after validation
- [x] Verify component handles missing entity gracefully

### 6. Document root entity loading responsibility

- [x] Add JSDoc comment to `RelatedEntitiesProps.entity` explaining parent must load entity before rendering
- [x] Add inline comment in component function explaining entity is always pre-loaded
- [x] Update `InspectRelatedEntitiesPage.tsx` with comment confirming it loads entity before rendering RelatedEntities
- [x] Verify parent pages (InspectRelatedEntitiesPage) correctly load entity first

---

## Phase 2: Remove Pagination Feature

### 7. Remove showAllForRelationship state and related UI

- [x] Remove `showAllForRelationship` useState hook from `RelatedEntities.tsx` (line ~113)
- [x] Remove `handleShowAll` callback function (lines ~217-238)
- [x] Remove "Mostrar # entidades" button rendering logic (lines ~274-283)
- [x] Remove "Mostrar X más" button rendering logic (lines ~340-348)
- [x] Remove `hasMoreThan5`, `displayEntities`, `remainingCount` variables (lines ~264-266)
- [x] Update entity rendering to always show all entities from `loadedData[key]`
- [x] Remove CSS classes related to show-all buttons if they exist
- [x] Test that all entities display when relationship is expanded

---

## Phase 3: State Management Refactoring

### 8. Define useReducer state and action types

- [x] Create state type `RelatedEntitiesState` matching specification (lines 390-400 of spec)
- [x] Include: expandedRelationships, loadedData, loadingStates, counts, inFlightRequests, errors
- [x] Create union type `RelatedEntitiesAction` with all action types (lines 402-408 of spec)
- [x] Add action types: TOGGLE_RELATIONSHIP, LOAD_START, LOAD_SUCCESS, LOAD_ERROR, CLEAR_IN_FLIGHT, CLEAR_ERROR
- [x] Export types from `RelatedEntities.tsx` for potential future testing

### 9. Create reducer function for state management

- [x] Create `relatedEntitiesReducer` function in `RelatedEntities.tsx`
- [x] Implement reducer cases for each action type
- [x] Handle TOGGLE_RELATIONSHIP: add/remove from expandedRelationships Set
- [x] Handle LOAD_START: set loading state, store AbortController
- [x] Handle LOAD_SUCCESS: store data, count, clear loading, remove AbortController
- [x] Handle LOAD_ERROR: store error, clear loading, remove AbortController
- [x] Handle CLEAR_IN_FLIGHT: remove AbortController
- [x] Handle CLEAR_ERROR: clear error for specific key
- [x] Test reducer with sample actions (verified via component tests)

### 10. Replace useState hooks with useReducer

- [x] Remove all 4 useState hooks (expandedRelationships, loadedData, loadingStates, counts)
- [x] Initialize useReducer with initial state matching previous useState defaults
- [x] Update all state setter calls to dispatch actions instead
- [x] Update state reads to use `state.expandedRelationships`, `state.loadedData`, etc.
- [x] Verify component still functions identically to before (all 16 tests passing)

---

## Phase 4: Request Management and Cancellation

### 11. Implement AbortController tracking in reducer

- [ ] Ensure reducer handles storing AbortController in `inFlightRequests` on LOAD_START
- [ ] Ensure reducer handles removing AbortController on LOAD_SUCCESS and LOAD_ERROR
- [ ] Add helper function to cancel in-flight request for a relationship key
- [ ] Call cancel function before starting new request for same key

### 12. Add request cancellation to load functions

- [ ] Update relationship loading logic to create AbortController before fetch
- [ ] Dispatch LOAD_START action with AbortController
- [ ] Pass AbortController signal to fetchFn calls (if API supports it)
- [ ] Cancel previous request if one exists for the same relationship key
- [ ] Handle AbortError gracefully (ignore, don't show error to user)
- [ ] Test rapid expand/collapse doesn't cause state inconsistencies

### 13. Implement request deduplication

- [ ] Create `pendingRequests` ref to track in-flight promises
- [ ] Before starting fetch, check if promise already exists for relationship key
- [ ] If promise exists, await existing promise instead of creating new request
- [ ] Clean up promise from ref when request completes
- [ ] Test that multiple rapid clicks on same relationship only makes one API call

---

## Phase 5: Fix Lazy Loading Strategy

### 14. Remove auto-loading on mount for User Mode

- [x] Locate useEffect that auto-loads relationships on mount (lines ~123-166)
- [x] Add condition to check `isAdmin` prop
- [x] Only auto-load if `isAdmin === true` (Admin Mode)
- [x] For User Mode (`isAdmin === false` or undefined), do not auto-load on mount
- [x] Update initial expandedRelationships state to be empty Set for User Mode
- [x] Keep auto-expand behavior for Admin Mode only
- [x] Test that User Mode shows collapsed relationships on initial load
- [x] Test that Admin Mode shows all relationships loaded on initial load

### 15. Update handleToggleRelationship for User Mode lazy loading

- [x] Ensure `handleToggleRelationship` only loads data when expanding in User Mode
- [x] Check if data is already loaded before making API call
- [x] Only fetch if relationship is being expanded AND data not already loaded
- [x] Keep existing logic for collapsing (just update expanded state)
- [x] Verify clicking expand button loads data on-demand in User Mode

---

## Phase 6: Admin Mode Implementation

### 16. Implement Admin Mode auto-loading on mount

- [ ] In useEffect, when `isAdmin === true`, load all relationships immediately
- [ ] Dispatch LOAD_START for each relationship
- [ ] Fetch all relationships in parallel (Promise.all or sequential, as appropriate)
- [ ] Dispatch LOAD_SUCCESS for each relationship as they complete
- [ ] Handle errors with LOAD_ERROR action
- [ ] Test Admin Mode loads all relationships on component mount

### 17. Disable expansion UI in Admin Mode

- [ ] Add condition to hide expand/collapse buttons when `isAdmin === true`
- [ ] Remove expand/collapse button rendering for Admin Mode
- [ ] Keep all relationships always visible (expanded state) in Admin Mode
- [ ] Update handleToggleRelationship to return early if `isAdmin === true`
- [ ] Test Admin Mode shows all relationships without expansion controls

### 18. Implement blank rows for Admin Mode

- [ ] Add logic to render a blank/empty row for each relationship type when `isAdmin === true`
- [ ] Render blank row after the entity list for each relationship
- [ ] Style blank row to indicate it's for adding new relationships (placeholder)
- [ ] Add comment indicating blank row is placeholder for future "add relationship" functionality
- [ ] Test blank rows appear in Admin Mode but not in User Mode

### 19. Disable cycle prevention in Admin Mode

- [ ] Locate cycle prevention filtering logic (line ~265, ~295)
- [ ] Add condition to skip filtering when `isAdmin === true`
- [ ] In Admin Mode, show all entities even if they appear in entityPath
- [ ] In User Mode, keep existing cycle prevention behavior
- [ ] Test Admin Mode can show same entity multiple times in different paths
- [ ] Test User Mode still prevents cycles

### 20. Limit Admin Mode nesting depth

- [ ] Add check to prevent recursive RelatedEntities rendering in Admin Mode beyond one level
- [ ] When `isAdmin === true`, do not render nested RelatedEntities components
- [ ] Or make it configurable - show one level of cascading relationships only
- [ ] Document Admin Mode nesting behavior in code comments
- [ ] Test Admin Mode shows relationships but doesn't nest deeply

---

## Phase 7: Performance Optimizations

### 21. Add React.memo to RelatedEntities component

- [ ] Wrap RelatedEntities component export with `React.memo()`
- [ ] Create custom comparison function that checks entity.id and entityPath length
- [ ] Ensure component only re-renders when entity or path actually changes
- [ ] Test memoization works by verifying unnecessary re-renders don't occur

### 22. Memoize sorting operations with useMemo

- [ ] Wrap `sortEntities` calls with `useMemo` hook
- [ ] Depend on entities array, sortKey, and entityType
- [ ] Apply to all places where sorting occurs (after fetch, etc.)
- [ ] Verify sorting only recalculates when dependencies change

### 23. Memoize filtering operations with useMemo

- [ ] Wrap cycle prevention filtering with `useMemo`
- [ ] Depend on sorted entities and entityPath
- [ ] Only filter when entityPath changes, not on every render
- [ ] Verify filtering performance improves

### 24. Memoize callbacks with useCallback

- [ ] Wrap `handleToggleRelationship` with `useCallback`
- [ ] Include all dependencies in dependency array
- [ ] Wrap any other callback functions with useCallback
- [ ] Verify callbacks don't cause unnecessary re-renders

### 25. Add React.memo to EntityCard component

- [ ] Open `frontend/src/components/common/EntityCard.tsx`
- [ ] Wrap component export with `React.memo()`
- [ ] Create comparison function or use default shallow comparison
- [ ] Test EntityCard doesn't re-render unnecessarily

### 26. Implement request caching

- [ ] Create cache mechanism to store fetched relationship data
- [ ] Cache key should be combination of entityId, entityType, and relationship type
- [ ] Check cache before making API request
- [ ] Store successful responses in cache
- [ ] Consider cache invalidation strategy (for now, persist for component lifecycle)
- [ ] Test that re-expanding same relationship uses cached data

---

## Phase 8: API Optimization

### 27. Batch Jingle relationship fetches

- [ ] Identify all 5 separate `getJingle()` calls in `relationshipConfigs.ts` (fetchJingleFabrica, fetchJingleCancion, etc.)
- [ ] Note that `getJingle()` already returns all relationships in one response
- [ ] Create single `fetchJingleAllRelationships` function that calls `getJingle()` once
- [ ] Extract fabrica, cancion, autores, jingleros, tematicas from single response
- [ ] Return object with all relationships: `{ fabrica, cancion, autores, jingleros, tematicas }`
- [ ] Update Jingle relationship configs to use batched fetch function
- [ ] Verify all Jingle relationships still load correctly
- [ ] Verify only one API call is made instead of five

### 28. Eliminate redundant count fetches

- [ ] Review all relationship configs for `fetchCountFn` usage
- [ ] Remove `fetchCountFn` calls when `fetchFn` already provides count information
- [ ] Use entities.length as count when data is loaded
- [ ] Only call `fetchCountFn` if count is needed before loading entities
- [ ] Update relationship loading logic to avoid redundant count API calls
- [ ] Test count display still works correctly

---

## Phase 9: Runtime Validation and Type Safety

### 29. Install and configure Zod for runtime validation

- [ ] Install zod package: `npm install zod`
- [ ] Create schemas file: `frontend/src/lib/validation/relationshipSchemas.ts`
- [ ] Define schemas for each entity type (Fabrica, Jingle, Cancion, Artista, Tematica)
- [ ] Define schema for JingleDetailResponse with relationships
- [ ] Export all schemas

### 30. Add validation to Jingle relationship fetches

- [ ] Import Zod schemas in `relationshipConfigs.ts`
- [ ] Update `fetchJingleFabrica` to validate response with Zod
- [ ] Update `fetchJingleCancion` to validate response with Zod
- [ ] Update `fetchJingleAutores` to validate response with Zod
- [ ] Update `fetchJingleJingleros` to validate response with Zod
- [ ] Update `fetchJingleTematicas` to validate response with Zod
- [ ] Handle validation errors gracefully (return empty array, log error)
- [ ] Replace `as` type assertions with validated data

### 31. Add validation to other relationship fetches

- [ ] Add Zod validation to `fetchFabricaJingles`
- [ ] Add Zod validation to `fetchCancionAutores`
- [ ] Add Zod validation to `fetchCancionJingles`
- [ ] Add Zod validation to `fetchArtistaCanciones`
- [ ] Add Zod validation to `fetchArtistaJingles`
- [ ] Add Zod validation to `fetchTematicaJingles`
- [ ] Replace all `as` type assertions with validated responses
- [ ] Test validation catches invalid API responses

---

## Phase 10: Code Organization

### 32. Extract API service layer

- [ ] Create file `frontend/src/lib/services/relationshipService.ts`
- [ ] Move all `fetch*` functions from `relationshipConfigs.ts` to `relationshipService.ts`
- [ ] Move relationship configuration functions (`getFabricaRelationships`, etc.) to separate section
- [ ] Update imports in `RelatedEntities.tsx` and `relationshipConfigs.ts`
- [ ] Ensure all functionality still works after extraction
- [ ] Add JSDoc comments to service functions

### 33. Extract expansion logic to custom hook (optional future enhancement)

- [ ] Create file `frontend/src/lib/hooks/useRelatedEntitiesExpansion.ts`
- [ ] Move expansion state and toggle logic to hook
- [ ] Move loading state management to hook
- [ ] Return expansion state and handlers from hook
- [ ] Update RelatedEntities to use the hook
- [ ] **Note**: This can be deferred if useReducer implementation is sufficient

---

## Phase 11: User Experience Improvements

### 34. Add skeleton loaders for loading states

- [ ] Create or import skeleton loader component
- [ ] Replace "Cargando..." text with skeleton loader in loading states
- [ ] Show skeleton for each expected entity row while loading
- [ ] Match skeleton height/spacing to actual entity row layout
- [ ] Test skeleton displays correctly during loading

### 35. Implement user-friendly error messages

- [ ] Update error handling to dispatch LOAD_ERROR action with user-friendly message
- [ ] Display error message in UI instead of just console.error
- [ ] Add retry button next to error message
- [ ] Style error messages appropriately (color, icon, etc.)
- [ ] Test error messages display when API calls fail

### 36. Fix EntityCard expansion props integration

- [ ] Review EntityCard expansion props usage in RelatedEntities (lines ~387-392)
- [ ] Remove expansion props if expansion is handled by RelatedEntities (recommended)
- [ ] OR properly integrate EntityCard expansion if keeping the props
- [ ] Ensure EntityCard expand icon doesn't interfere with RelatedEntities expansion
- [ ] Test expansion behavior is clear and works correctly

### 37. Add mode-specific CSS classes

- [ ] Add `related-entities--admin` class when `isAdmin === true`
- [ ] Add `related-entities--user` class when `isAdmin === false`
- [ ] Update CSS to style Admin Mode differently if needed
- [ ] Ensure Admin Mode has distinct visual appearance
- [ ] Test CSS classes apply correctly based on mode

---

## Phase 12: Testing and Documentation

### 38. Add JSDoc documentation to RelatedEntities

- [ ] Add comprehensive JSDoc to RelatedEntities component
- [ ] Document all props including isAdmin
- [ ] Document User Mode vs Admin Mode behaviors
- [ ] Document root entity loading responsibility
- [ ] Add usage examples in JSDoc
- [ ] Document internal state management approach

### 39. Add unit tests for reducer

- [ ] Create test file `frontend/src/components/common/__tests__/RelatedEntities.reducer.test.ts`
- [ ] Test TOGGLE_RELATIONSHIP action
- [ ] Test LOAD_START action
- [ ] Test LOAD_SUCCESS action
- [ ] Test LOAD_ERROR action
- [ ] Test CLEAR_IN_FLIGHT action
- [ ] Test CLEAR_ERROR action
- [ ] Verify all reducer cases handle state correctly

### 40. Add unit tests for sorting utility

- [ ] Create test file `frontend/src/lib/utils/__tests__/entitySorters.test.ts`
- [ ] Test sorting by timestamp
- [ ] Test sorting by date
- [ ] Test sorting by stageName
- [ ] Test sorting by title
- [ ] Test sorting by name
- [ ] Test sorting by category (with secondary name sort)
- [ ] Test edge cases (empty arrays, null values, etc.)

### 41. Add integration tests for API calls

- [ ] Create test file `frontend/src/components/common/__tests__/RelatedEntities.integration.test.ts`
- [ ] Mock API responses
- [ ] Test lazy loading behavior in User Mode
- [ ] Test eager loading behavior in Admin Mode
- [ ] Test request cancellation
- [ ] Test request deduplication
- [ ] Test cycle prevention in User Mode
- [ ] Test no cycle prevention in Admin Mode

### 42. Improve accessibility

- [ ] Add ARIA labels to expand/collapse buttons
- [ ] Add ARIA expanded state to relationship rows
- [ ] Ensure keyboard navigation works (Tab, Enter, Space)
- [ ] Add ARIA live regions for loading and error states
- [ ] Test with screen reader
- [ ] Verify WCAG compliance

---

## Verification Checklist

After completing all tasks, verify:

- [ ] User Mode: Relationships load only when expanded (lazy loading)
- [ ] Admin Mode: All relationships load immediately on mount (eager loading)
- [ ] User Mode: Expansion/collapse UI works correctly
- [ ] Admin Mode: No expansion UI, all relationships visible
- [ ] User Mode: Cycle prevention works (entities don't appear twice)
- [ ] Admin Mode: Cycle prevention disabled (entities can appear multiple times)
- [ ] Admin Mode: Blank rows appear for each relationship type
- [ ] Request cancellation works (rapid clicking doesn't cause errors)
- [ ] Request deduplication works (multiple clicks only make one API call)
- [ ] Caching works (re-expanding uses cached data)
- [ ] Jingle relationships use only one API call instead of five
- [ ] No redundant count API calls
- [ ] TypeScript compilation succeeds with no errors
- [ ] All existing functionality still works
- [ ] Performance is improved (memoization working)
- [ ] Error messages display to users
- [ ] Loading states show skeleton loaders

---

## Notes

- Tasks are designed to be completed sequentially
- Each task can be committed independently
- If a task depends on another, it's noted in the task description
- Test after each major phase (e.g., after Phase 2, 3, 6)
- If you encounter issues, check the specification document for detailed requirements
