# RelatedEntities Component Refactoring Specification

## Document Purpose

This document combines the original requirements for the nested entity table component with the assessment findings from the current implementation. It serves as the single source of truth for refactoring the `RelatedEntities` component and related inspection pages.

---

## 1. Original Requirements (From tasks-0001-3-1.md Appendix and further Lead Designer input)

The purpose of the component is to have a flexible approach to displaying and cascading information about the various entities in the Graph Database, namely the Fabrica, Jingle, Cancion, Artista and Tematica.

When an Entity is explored, specific information will be displayed in a table, with the entity as a prominent table heading row, and various categories of information (the related entities) as rows below it.

The definition of the core data of the entity serves as the heading of the table when presenting the entity, or as the related row in a nested table.

The table will have 2 modes of operation:
**User Mode**:
The table will be in read-only mode, and the user will be able to expand the rows to see the related entities in a nested table format.
Each entity row can be expanded, to show in turn their related entities in a nested table format.
The definition of the core data of the entity serves as the heading of the table when presenting the entity, or as the related row in a nested table.

**Admin Mode**:
The user is exploring an entity and its relationships, and is able to create new links and modify existing ones.
All related entities are presented (no filtering of cascading relationships) and a blank row for each relationship type is added.

### 1.1 Row Composition & Layout

One row of a table will have:

- indentation on the left, that will help the user to identify the level of the nested table
- an icon to establish the entity type
- the field that defines the entity (e.g. Titulo, Nombre, etc.)
- core metadata information, in the form of tag labels (e.g. Jinglazo, Precario, etc.) or key information (e.g. Fecha de publicacion, etc.)
- an Expand/Collapse button to toggle the visibility of the nested entities in the row.
- a "Focus mode" button to jump to another page to see the entity (where the entity is the root of the Table)

#### Table Structure

- **Entity Title**: Larger font and bold text
- **Related fields**: Display as rows (table appearance)
- **Nested rows**: Display as rows (table appearance) with indentation from the parent row.

Nested rows will have an indentation on the left to help establishing the hierarchy of the nested information.
Expand/Collapse and "Focus mode" button will be always lined on the right side of the row.

#### Responsive Design

- The rows will have the same width as the parent row.
- By default the rows will be collapsed.
- The row contents will be contained in the space left between the indentation and icon on the left, and the Expand/Collapse and "Focus mode" icons on the right. Text, additional information and tags will be word-wrapped within this container on overspill. This behavior will drive the appearance in desktop and mobile views.
- **Text handling**: All fields word-wrap on overspill, show full text
- **Empty fields**: If a field is empty (relationship missing or filtered out to avoid cycles), row is not displayed (unless the entity has exceptions noted, e.g. Jingle tag "Inedito" if no Fabrica is associated)
- **Empty related topics**: If no related topics would be displayed, the Expand/Collapse button will be hidden (in User Mode) or the row will be displayed with a blank row for the relationship type (in Admin Mode).

#### Nesting & Depth

- **Maximum depth**: Up to 5 levels of nesting
- **Cycle prevention**: Skip entities already in the path (e.g., Fabrica → Jingle → Fabrica cycle)
  - Parent-child relationship should be obvious
  - No notice needed for omitted entities

#### Admin Mode

The Entity table can be used

- If the Table is rendered in Admin Mode the rows will not be expandable.

### 1.2 Data Loading Strategy

**IMPORTANT: Root Entity Loading Responsibility**

- **Root entity (`entity` prop)**: MUST be loaded by the parent page/component BEFORE rendering RelatedEntities

  - RelatedEntities component receives the entity as a prop and assumes it's already fully loaded
  - The root entity is NEVER lazy-loaded - it's a required prop
  - Parent pages (e.g., InspectRelatedEntitiesPage, FabricaPage) are responsible for fetching and passing the complete entity object

- **Related entities (relationships)**: Lazy loaded only when expanded (in User Mode)
  - Fetch sorting information, Primary and Secondary information to populate each related entity row
  - Load relationship data only on expand (User Mode) or immediately on mount (Admin Mode)
  - Caching: Store expanded entity data to avoid re-fetching when re-expanded

### 1.3 Entity Type Specifications

#### Fabrica

- **Icon**: 🏭 (Factory)
- **Primary field**: Titulo (title)
- **Secondary fields**: Fecha de publicacion (date)
- **Additional fields in Admin Mode**:
  - ID (id)
  - Status (status)
- **Relationships**:
  - Jingles (Expandable in User Mode, sorted by timestamp)

#### Jingle

- **Icon**: 📢 (Loudspeaker)
- **Primary field**: Titulo (title)
- **Secondary fields**:
  - Fecha de publicacion (fabrica.date) or "INEDITO" if not linked to Fabrica
  - Display "JINGLAZO" badge if `isJinglazo === true`
  - Display "PRECARIO" badge if `isPrecario === true`
- **Additional fields in Admin Mode**:
  - ID (id)
  - Status (status)
  - Comentario (comment)
  - Sorting order (order)
  - Timestamp (timestamp)
- **Relationships**:
  - Fabrica (Expandable in User Mode)
  - Cancion (Expandable in User Mode)
  - Autor (Expandable in User Mode, sorted alphabetically by StageName)
  - Jinglero (Expandable in User Mode, sorted alphabetically by StageName)
  - Tematicas (Expandable in User Mode, sorted by Category then alphabetically)

#### Cancion

- **Icon**: 📦 (Package/Box)
- **Primary field**: "Titulo (Autor(es))" - derived from 2 properties (if present)
- **Secondary fields**:
  - Album
  - Año (year)
  - Imagen (from YouTube URL if available) - displayed as a thumbnail image
- **Additional fields in Admin Mode**:
  - ID (id)
  - Status (status)
  - Titulo
  - Album
  - YouTube URL (youtubeUrl)
- **Relationships**:
  - Autor (Expandable in User Mode - Artista, sorted alphabetically by StageName)
  - Jingles (Expandable in User Mode, sorted by fabrica.date, tie break by timestamp)

#### Artista (Jinglero or Autor)

- **Icon**:
  - Artista (when it is the Entity table root): 👤 (Person)
  - Autor: 🚚 (Delivery Truck)
  - Jinglero: 🔧 (Wrench)
- **Primary field**: Nombre Artistico (stageName)
- **Secondary fields**:
  - Nombre Real (name)
  - Nacionalidad (nationality)
- **Additional fields in Admin Mode**:
  - ID (id)
  - Status (status)
  - Nombre Artistico (stageName)
  - YouTube URL (youtubeUrl)
- **Relationships**:
  - Canciones (Expandable in User Mode, sorted alphabetically by Title)
  - Jingles (Expandable in User Mode, sorted by fabrica.date)

#### Tematica

- **Icon**: 🏷️ (Label Tag)
- **Primary field**: Nombre (name)
- **Secondary fields**: Categoria (category)
- **Additional fields in Admin Mode**:
  - ID (id)
  - Status (status)
  - Nombre (name)
  - Categoria (category)
  - Descripcion (description)
- **Relationships**:
  - Jingles (Expandable in User Mode, sorted by fabrica.date, tie break by timestamp)

### 1.4 UI/UX Considerations

#### Visual/Interaction Rules

- **Expand/collapse icon**: Displayed on the right side of the primary field (in User Mode)
- **Icon state**: Toggles between collapsed (▼) and expanded (▲) states
- **Overflow**: All fields word-wrap on overspill
- **Focus mode button**: Opens a new page where the entity in that row is the root of the Table.

### 1.5 Performance Requirements

#### Lazy Loading

- Expand-by-click loads data only when needed
- Do NOT auto-load all relationships on mount

#### Caching Strategy

- Store information of expanded entities to avoid re-fetching
- Cache should persist across expand/collapse cycles
- Consider invalidation strategy if data might change

#### Request Strategy

- Sequential fetch is acceptable
- Batch when API allows it
- Avoid redundant API calls (e.g., multiple calls for same entity)

### 1.6 Example User Flow

1. Main page presents an Artist
2. User sees list of Canciones and Jingles they created (default table, auto-expanded)
3. User expands one Cancion to see:
   - Cancion details
   - List of Jingles that use it
4. User expands one Jingle to see:
   - Fabrica it belongs to
   - Jinglero that performed it
   - Note: Does NOT include original Artist (cycle prevention)
5. User expands one Jinglero to see:
   - List of Jingles they performed
   - Note: Does NOT include Jingles from step 2 (cycle prevention)
6. User can continue expanding to see Cancion, Fabrica, etc.

---

## 2. Current Implementation Issues (From Assessment)

### 2.1 Critical Architecture Problems

#### Missing Admin Mode Support

**Current**: No Admin Mode implementation or prop

**Problems**:

- No `isAdmin` or `mode` prop to distinguish Admin vs User Mode
- Cannot support Admin Mode requirements:
  - Rows not expandable (all relationships always visible)
  - No cycle prevention filtering (show all relationships)
  - Blank row for each relationship type needed for adding new links
  - All relationships auto-loaded (eager loading required in Admin Mode)

**Requirement**:

- Add `isAdmin?: boolean` prop (or `mode?: 'user' | 'admin'`) to RelatedEntitiesProps
- Conditional rendering and behavior based on mode
- In Admin Mode: load all relationships immediately, show all entities, no expansion UI, add blank rows
- In User Mode: maintain lazy loading, expansion/collapse, cycle prevention

#### State Management Complexity

**Current**: Five interdependent `useState` hooks

- `expandedRelationships` (Set<string>)
- `loadedData` (Record<string, RelatedEntity[]>)
- `loadingStates` (Record<string, boolean>)
- `counts` (Record<string, number>)
- `showAllForRelationship` (Set<string>) - **May be obsolete if 5-item pagination removed**

**Problem**: State updates can be inconsistent, hard to reason about

**Requirement**: Use `useReducer` or state machine to manage complex state transitions

- Admin Mode vs User Mode state handling should be explicit
- Consider separate state shapes or conditional logic based on mode

#### Auto-Loading on Mount

**Current**: All relationships auto-load on mount (line 191-232 of RelatedEntities.tsx)

**Problem**:

- Violates lazy loading requirement for User Mode
- However, this behavior is actually CORRECT for Admin Mode (all relationships must be visible)

**Requirement**:

- Conditional loading strategy based on mode:
  - **User Mode**: Load relationships only when expanded (true lazy loading)
  - **Admin Mode**: Load all relationships immediately on mount (eager loading required)
- **CRITICAL**: Root entity (`entity` prop) is NEVER loaded by RelatedEntities - it must be provided fully loaded by parent
- RelatedEntities ONLY loads related entities via `relationship.fetchFn` calls

#### Race Conditions

**Current**: Multiple async state updates without request cancellation

**Problem**: Rapid toggling causes overlapping requests, inconsistent state

**Requirement**:

- Use AbortController for request cancellation
- Implement request deduplication
- Use refs to track in-flight requests
- **Note**: Admin Mode eager loading may have different race condition patterns to address

#### EntityCard Expansion Disconnected

**Current**: `EntityCard` receives `hasNestedEntities`, `isExpanded`, `onToggleExpand` but:

- `onToggleExpand` is empty function `() => {}`
- Actual expansion handled by recursive `RelatedEntities`, not EntityCard

**Problem**: Misleading API, confusing behavior

**Requirement**: Either:

- Remove expansion props from EntityCard in RelatedEntities context, OR
- Properly integrate EntityCard expansion to work with RelatedEntities
- **Admin Mode consideration**: Expansion should be disabled entirely in Admin Mode

### 2.2 Performance Issues

#### Missing Memoization

**Current**: No React.memo, minimal useMemo/useCallback

**Requirement**:

- Memoize `RelatedEntities` component with `React.memo`
- Memoize expensive operations (sorting, filtering) with `useMemo`
- Memoize callbacks with `useCallback`

#### Redundant API Calls

**Current**:

- Multiple `getJingle()` calls for different jingle relationships
- `fetchCountFn` called even when `fetchFn` provides count
- In Admin Mode: May load all relationships eagerly, requiring optimization

**Requirement**:

- Batch API calls when possible
- Single endpoint for jingle relationships that returns all data
- Eliminate redundant count fetches
- **Admin Mode**: Consider batching all relationship loads for top-level entity

#### Recursive Rendering Overhead

**Current**: Deep nesting causes cascading re-renders

**Requirement**:

- Memoize components to prevent unnecessary re-renders
- Consider virtualization for very deep nesting

### 2.3 Type Safety Issues

#### Unsafe Type Assertions

**Current**: Multiple `as` casts without validation throughout relationshipConfigs.ts

**Requirement**:

- Add runtime validation (Zod or similar)
- Use type guards instead of assertions
- Validate API responses match expected types

### 2.5 Code Organization Issues

#### Duplicate Code

**Current**: Entity type mapping duplicated in both inspect pages

**Requirement**: Extract to shared utility (`lib/utils/entityTypeUtils.ts`)

#### Mixed Responsibilities

**Current**: Demo code mixed with production, API logic in components

**Requirement**:

- Separate demo pages from production pages
- Extract API fetch logic to service layer
- Split large files into smaller, focused modules

#### Missing Admin Mode Abstraction

**Current**: No abstraction layer for Admin Mode vs User Mode behavior differences

**Requirement**:

- Extract mode-specific logic into hooks or utilities
- Clear separation between mode-dependent behaviors:
  - Loading strategy (lazy vs eager)
  - Cycle prevention (enabled in User Mode, disabled in Admin Mode)
  - UI rendering (expandable vs always-visible)
  - Blank rows for relationship creation (Admin Mode only)

---

## 3. Refactoring Requirements

### 3.1 State Management Refactoring

#### Replace Multiple useState with useReducer

```typescript
type RelatedEntitiesState = {
  expandedRelationships: Set<string>; // Only used in User Mode
  loadedData: Record<string, RelatedEntity[]>;
  loadingStates: Record<string, boolean>;
  counts: Record<string, number>;
  // showAllForRelationship removed - no longer needed without 5-item pagination
  // Track in-flight requests to prevent race conditions
  inFlightRequests: Record<string, AbortController>;
  // Add error states for better UX
  errors: Record<string, Error | null>;
};

type RelatedEntitiesAction =
  | { type: "TOGGLE_RELATIONSHIP"; key: string } // Only valid in User Mode
  | { type: "LOAD_START"; key: string; abortController: AbortController }
  | { type: "LOAD_SUCCESS"; key: string; data: RelatedEntity[]; count: number }
  | { type: "LOAD_ERROR"; key: string; error: Error }
  | { type: "CLEAR_IN_FLIGHT"; key: string }
  | { type: "CLEAR_ERROR"; key: string };
```

#### Benefits

- Single source of truth for state
- Easier to reason about state transitions
- Better testability
- Easier to add features (undo, state persistence, etc.)

### 3.2 Lazy Loading Implementation

#### Current (WRONG):

```typescript
useEffect(() => {
  if (entityPath.length === 0) {
    // Auto-loads ALL relationships on mount
    loadRelationships();
  }
}, []);
```

#### Required (CORRECT):

**Parent Page Responsibility (Example):**

```typescript
// Parent page (e.g., InspectRelatedEntitiesPage) MUST load root entity FIRST
const [entity, setEntity] = useState<RelatedEntity | null>(null);

useEffect(() => {
  const loadRootEntity = async () => {
    const loadedEntity = await publicApi.getJingle(entityId); // Load root entity
    setEntity(loadedEntity); // Must be fully loaded before rendering RelatedEntities
  };
  loadRootEntity();
}, [entityId]);

// Only render RelatedEntities AFTER entity is loaded
if (!entity) return <LoadingState />;

return (
  <RelatedEntities
    entity={entity} // Root entity already fully loaded
    entityType={entityType}
    relationships={relationships}
  />
);
```

**RelatedEntities Component - Only loads RELATED entities:**

```typescript
// Conditional loading based on mode - ONLY for related entities
useEffect(() => {
  if (isAdmin) {
    // Admin Mode: Load all relationships immediately
    loadAllRelationships(); // Loads RELATED entities, NOT the root entity
  }
  // User Mode: Relationships loaded only on expand (lazy)
}, [isAdmin]);

// User Mode: Only load when relationship is expanded
const handleToggleRelationship = async (rel: RelationshipConfig) => {
  if (isAdmin) return; // No toggle in Admin Mode

  const key = getRelationshipKey(rel);
  const isExpanded = expandedRelationships.has(key);

  if (!isExpanded && !loadedData[key]) {
    // Load related entities on-demand, not on mount
    // Root entity is already available via props.entity
    await loadRelationshipData(rel);
  }

  setExpandedRelationships(/* toggle */);
};
```

### 3.3 Request Management

#### Implement AbortController for Cancellation

```typescript
const abortControllerRef = useRef<Record<string, AbortController>>({});

const loadRelationshipData = async (rel: RelationshipConfig) => {
  const key = getRelationshipKey(rel);

  // Cancel previous request if exists
  if (abortControllerRef.current[key]) {
    abortControllerRef.current[key].abort();
  }

  // Create new controller
  const controller = new AbortController();
  abortControllerRef.current[key] = controller;

  try {
    const entities = await rel.fetchFn(entity.id, entityType, {
      signal: controller.signal,
    });
    // ... handle success
  } catch (error) {
    if (error.name === "AbortError") {
      // Request was cancelled, ignore
      return;
    }
    // ... handle real error
  } finally {
    delete abortControllerRef.current[key];
  }
};
```

#### Request Deduplication

```typescript
const pendingRequests = useRef<Record<string, Promise<RelatedEntity[]>>>({});

const loadRelationshipData = async (rel: RelationshipConfig) => {
  const key = getRelationshipKey(rel);

  // If request already in flight, return existing promise
  if (pendingRequests.current[key]) {
    return pendingRequests.current[key];
  }

  const request = rel.fetchFn(entity.id, entityType).finally(() => {
    delete pendingRequests.current[key];
  });

  pendingRequests.current[key] = request;
  return request;
};
```

### 3.4 Separation of Concerns

#### Extract Expansion Logic

**File**: `hooks/useRelatedEntitiesExpansion.ts`

- Handle expand/collapse state
- Manage loading states
- Request cancellation

#### Extract Sorting Logic

**File**: `utils/entitySorters.ts`

- Type-specific sort functions
- Cleaner than current switch statement

#### Extract API Service

**File**: `services/relationshipService.ts`

- All relationship fetching logic
- Request caching
- Error handling

#### Extract Entity Type Utilities

**File**: `utils/entityTypeUtils.ts`

- Entity type mapping (f → fabrica, etc.)
- Type guards
- Route generation

### 3.5 Performance Optimizations

#### Memoize Components

```typescript
export default React.memo(RelatedEntities, (prevProps, nextProps) => {
  // Custom comparison if needed
  return (
    prevProps.entity.id === nextProps.entity.id &&
    prevProps.entityPath?.length === nextProps.entityPath?.length
  );
});
```

#### Memoize Expensive Operations

```typescript
const sortedEntities = useMemo(() => {
  return sortEntities(entities, rel.sortKey, rel.entityType);
}, [entities, rel.sortKey, rel.entityType]);

const filteredEntities = useMemo(() => {
  return sortedEntities.filter((e) => !entityPath.includes(e.id));
}, [sortedEntities, entityPath]);
```

#### Batch API Calls

```typescript
// Instead of:
fetchJingleFabrica(id);
fetchJingleCancion(id);
fetchJingleAutores(id);
// ...

// Do:
const jingleData = await getJingleWithRelationships(id);
// Extract all relationships from single response
```

### 3.6 Type Safety Improvements

#### Runtime Validation

```typescript
import { z } from "zod";

const JingleDetailResponseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  fabrica: z.object({ id: z.string() }).optional().nullable(),
  cancion: z.object({ id: z.string() }).optional().nullable(),
  autores: z.array(z.object({ id: z.string() })).optional(),
  // ...
});

export async function fetchJingleFabrica(jingleId: string): Promise<Fabrica[]> {
  const response = await publicApi.getJingle(jingleId);
  const validated = JingleDetailResponseSchema.parse(response);

  if (validated.fabrica?.id) {
    return [validated.fabrica as Fabrica];
  }
  return [];
}
```

### 3.7 User Experience Improvements

#### Loading States

```typescript
{isLoading ? (
  <div className="related-entities__loading">
    <SkeletonLoader height={40} />
  </div>
) : (
  // ... entities
)}
```

#### Error States

```typescript
{error ? (
  <div className="related-entities__error">
    <p>Error al cargar {rel.label.toLowerCase()}</p>
    <button onClick={() => retry(rel)}>Reintentar</button>
  </div>
) : (
  // ... content
)}
```

#### Clear Expansion UI (User Mode Only)

- Relationship row: Expand button on right, shows count when collapsed
- Entity row: Expand icon only if has nested entities
- **Note**: Expansion UI disabled in Admin Mode (all relationships always visible)

#### Admin Mode UI

- All relationships of the root entity always visible (no expansion UI)
- Blank row for each relationship type for adding new links (placeholder for later implementation)
- All entities displayed (no pagination, no filtering)
- No cycle prevention (show 1 level of cascading relationships)

---

## 4. Implementation Checklist

### Phase 1: Foundation (High Priority)

- [ ] Extract entity type mapping to `utils/entityTypeUtils.ts`
- [ ] Extract API fetch functions to `services/relationshipService.ts`
- [ ] Add runtime validation (Zod schemas) for API responses
- [ ] Create type guards for entity types
- [ ] Fix InspectEntityPage to use real API instead of mocks
- [ ] Add `isAdmin` prop to RelatedEntitiesProps interface
- [ ] **Document and enforce**: Root entity loading responsibility (parent pages must load entity before rendering RelatedEntities)
- [ ] Add TypeScript checks/guards to ensure entity prop is not null/undefined

### Phase 2: State Management (High Priority)

- [ ] Replace multiple useState with useReducer in RelatedEntities
- [ ] Remove `showAllForRelationship` state (no longer needed)
- [ ] Implement request cancellation with AbortController
- [ ] Add request deduplication
- [ ] Fix auto-loading: conditional based on mode (lazy in User Mode, eager in Admin Mode)
- [ ] Add Admin Mode state handling (always-expanded state, no expansion toggles)

### Phase 3: Performance (High Priority)

- [ ] Add React.memo to RelatedEntities and EntityCard
- [ ] Memoize sorting and filtering operations
- [ ] Batch redundant API calls (especially jingle relationships)
- [ ] Implement request caching

### Phase 4: UX Improvements (Medium Priority)

- [ ] Add skeleton loaders for loading states
- [ ] Show user-friendly error messages
- [ ] Implement Admin Mode UI (always-visible relationships, blank rows)
- [ ] Fix EntityCard expansion props (either implement or remove)
- [ ] Add mode-specific conditional rendering

### Phase 5: Code Organization (Medium Priority)

- [ ] Split RelatedEntities into smaller modules:
  - [ ] `hooks/useRelatedEntitiesExpansion.ts`
  - [ ] `utils/entitySorters.ts`
- [ ] Separate demo pages from production pages
- [ ] Extract sorting logic from RelatedEntities component

### Phase 6: Polish (Low Priority)

- [ ] Add unit tests for components and utilities
- [ ] Add integration tests for API calls
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Add JSDoc documentation
- [ ] Create Storybook stories for components

---

## 5. API Integration Requirements

### 5.1 Relationship Fetching Patterns

#### Jingle Relationships (CRITICAL - Needs Batching)

**Current Problem**: 5 separate API calls for one jingle

- `getJingle()` → extract fabrica
- `getJingle()` → extract cancion
- `getJingle()` → extract autores
- `getJingle()` → extract jingleros
- `getJingle()` → extract tematicas

**Required Solution**: Single call that returns all relationships

```typescript
// Single endpoint that returns:
{
  jingle: Jingle,
  fabrica?: Fabrica,
  cancion?: Cancion,
  autores: Artista[],
  jingleros: Artista[],
  tematicas: Tematica[]
}
```

#### Other Relationships

- Can use existing endpoints but validate response structure
- Implement caching to avoid duplicate requests
- Handle errors gracefully

### 5.2 Count Fetching

**Current**: Separate `fetchCountFn` called even when `fetchFn` provides count
**Required**:

- Only call `fetchCountFn` if `fetchFn` doesn't provide count
- Or: Always return count with entities in single response

---

## 6. Component Structure Specification

### 6.1 RelatedEntities Component

#### Props

```typescript
interface RelatedEntitiesProps {
  /** Root entity - MUST be fully loaded by parent before passing to component */
  entity: RelatedEntity;
  /** Type of root entity */
  entityType: EntityType;
  /** Relationship configurations for this entity type */
  relationships: RelationshipConfig[];
  /** Current entity path (for cycle prevention in User Mode only) */
  entityPath?: string[]; // For cycle prevention (User Mode only)
  /** Maximum nesting depth (default: 5, User Mode only) */
  maxDepth?: number; // Default: 5
  /** Additional CSS class name */
  className?: string;
  /** Admin Mode: all relationships visible, no expansion, no cycle prevention */
  isAdmin?: boolean; // Admin Mode: all relationships visible, no expansion, no cycle prevention
  // OR use: mode?: 'user' | 'admin';
}
```

**CRITICAL**: The `entity` prop must be fully loaded with all its core data (title, name, dates, etc.) by the parent component. RelatedEntities does NOT load the root entity - it only loads related entities via relationships.

#### Behavior (User Mode - default)

1. **Initial render**:
   - Uses already-loaded root `entity` prop (loaded by parent)
   - Show relationship labels, collapsed state with counts
2. **On expand**: Load relationship data (lazy) - ONLY related entities, not the root entity
3. **Display entities**: Use EntityCard in row variant
4. **Recursive nesting**: Render RelatedEntities for nested entities (if expandable)
5. **Cycle prevention**: Filter out entities in entityPath

#### Behavior (Admin Mode)

1. **Initial render**:
   - Uses already-loaded root `entity` prop (loaded by parent)
   - Load and display all relationships immediately (eager loading of related entities)
2. **All relationships visible**: No expansion/collapse UI
3. **Display all entities**: Use EntityCard in row variant, show all entities
4. **Blank rows**: Add blank row for each relationship type for creating new links
5. **No cycle prevention**: Show all cascading relationships (entities can appear multiple times)
6. **No recursive nesting**: Admin Mode typically shows only one level (or can be configurable)

### 6.2 EntityCard Component

#### Usage in RelatedEntities

- Always use `variant="row"`
- Pass `to` prop for navigation
- Do NOT use expansion props (`hasNestedEntities`, `isExpanded`, `onToggleExpand`) unless properly integrated
- Expansion handled by parent RelatedEntities, not EntityCard

### 6.3 Relationship Configuration

#### Structure

```typescript
interface RelationshipConfig {
  label: string; // Display label (e.g., "Jingles", "Autor")
  entityType: EntityType; // Type of related entities
  sortKey?: SortKey; // How to sort entities
  expandable: boolean; // Can this relationship be expanded further
  fetchFn: (entityId: string, entityType: string) => Promise<RelatedEntity[]>;
  fetchCountFn?: (entityId: string, entityType: string) => Promise<number>;
}
```

#### Requirements

- All fetch functions must handle errors gracefully
- Return empty array on error (don't throw)
- Validate API responses before returning
- Implement caching at service layer

---

## 7. Testing Requirements

### 7.1 Unit Tests

- Component rendering (RelatedEntities, EntityCard)
- State management (reducer actions)
- Sorting logic (entitySorters)
- Type guards and utilities
- Error handling

### 7.2 Integration Tests

- API calls and response handling
- Request cancellation
- Request deduplication
- Cycle prevention (User Mode only)
- Lazy loading behavior (User Mode)
- Eager loading behavior (Admin Mode)
- Mode switching and conditional behavior
- Blank row rendering (Admin Mode)

### 7.3 E2E Tests (Future)

- User Mode flow: Expand → Load → Display → Expand nested
- Admin Mode flow: Load all → Display all → Add new relationships
- Cycle prevention: Verify entities don't appear twice (User Mode)
- No cycle prevention: Verify entities can appear multiple times (Admin Mode)
- Error scenarios: Network failures, invalid data
- Mode-specific UI rendering

---

## 8. Success Criteria

### Functional Requirements Met

- ✅ Two-column table layout with labels and entities
- ✅ Lazy loading (only on expand in User Mode)
- ✅ Eager loading (all relationships immediately in Admin Mode)
- ✅ Cycle prevention in User Mode (no circular references)
- ✅ No cycle prevention in Admin Mode (show all relationships)
- ✅ Proper sorting per entity type
- ✅ Responsive design (mobile and desktop)
- ✅ Maximum 5 levels of nesting (User Mode)
- ✅ Admin Mode: All relationships visible, blank rows for relationship creation

### Performance Requirements Met

- ✅ No redundant API calls
- ✅ Request cancellation works
- ✅ Memoization prevents unnecessary re-renders
- ✅ Caching prevents re-fetching expanded data

### Code Quality Requirements Met

- ✅ Type-safe (runtime validation)
- ✅ No duplicate code
- ✅ Clear separation of concerns
- ✅ Error handling throughout
- ✅ Testable components

### User Experience Requirements Met

- ✅ Clear loading states
- ✅ Error messages shown to users
- ✅ Intuitive expansion patterns
- ✅ Accessible (keyboard navigation, screen readers)

---

## 9. Migration Path

### Step 1: Parallel Implementation

- Keep existing RelatedEntities component
- Create new RelatedEntitiesV2 with refactored code
- Test alongside existing implementation

### Step 2: Gradual Migration

- Update InspectRelatedEntitiesPage to use V2
- Monitor for issues
- Fix bugs as they arise

### Step 3: Full Replacement

- Remove old RelatedEntities
- Rename V2 to RelatedEntities
- Update all usages

---

## 10. Notes and Decisions

### Design Decisions

- **Table layout**: Using HTML table for semantic structure and accessibility
- **Loading strategy**: Conditional based on mode
  - **User Mode**: Lazy loading (load on expand) for performance
  - **Admin Mode**: Eager loading (load all immediately) for full visibility and editing
- **Cycle prevention**: Conditional based on mode
  - **User Mode**: Enabled to prevent confusing circular references
  - **Admin Mode**: Disabled to show complete relationship graph for management
- **Caching**: In-memory cache (no persistence) for MVP
- **Error handling**: Fail gracefully, show user-friendly messages
- **5-item pagination**: Removed per updated requirements - all entities shown when expanded

### Future Considerations

- Virtualization for very long lists (100+ items)
- Infinite scroll instead of "Show all" button
- Persistent expansion state (localStorage)
- Optimistic updates
- Real-time updates (WebSocket integration)

---

## Document History

- **Created**: [Date]
- **Based on**: tasks-0001-3-1.md Appendix + Assessment findings
- **Purpose**: Specification for RelatedEntities refactoring
- **Status**: Active specification document
