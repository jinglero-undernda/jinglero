import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import EntityCard, { type EntityType } from './EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { sortEntities } from '../../lib/utils/entitySorters';
import '../../styles/components/related-entities.css';

export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;

// State management types for useReducer
export type RelatedEntitiesState = {
  expandedRelationships: Set<string>; // Only used in User Mode
  expandedEntities: Set<string>; // Track which individual entities are expanded (for nested relationships)
  loadedData: Record<string, RelatedEntity[]>;
  loadingStates: Record<string, boolean>;
  counts: Record<string, number>;
  // Track in-flight requests to prevent race conditions
  inFlightRequests: Record<string, AbortController>;
  // Add error states for better UX
  errors: Record<string, Error | null>;
};

export type RelatedEntitiesAction =
  | { type: 'TOGGLE_RELATIONSHIP'; key: string } // Only valid in User Mode
  | { type: 'TOGGLE_ENTITY'; entityId: string } // Toggle individual entity expansion
  | { type: 'LOAD_START'; key: string; abortController: AbortController }
  | { type: 'LOAD_SUCCESS'; key: string; data: RelatedEntity[]; count: number }
  | { type: 'LOAD_ERROR'; key: string; error: Error }
  | { type: 'CLEAR_IN_FLIGHT'; key: string }
  | { type: 'CLEAR_ERROR'; key: string };

export interface RelationshipConfig {
  /** Label to display in left column (e.g., "Jingles", "Autor") */
  label: string;
  /** Entity type of related entities */
  entityType: EntityType;
  /** Sort key for entities */
  sortKey?: 'timestamp' | 'date' | 'stageName' | 'title' | 'name' | 'category';
  /** Whether this relationship is expandable (has nested entities) */
  expandable: boolean;
  /** Function to fetch related entities */
  fetchFn: (entityId: string, entityType: string) => Promise<RelatedEntity[]>;
  /** Function to get count of related entities (optional, for display purposes) */
  fetchCountFn?: (entityId: string, entityType: string) => Promise<number>;
}

export interface RelatedEntitiesProps {
  /**
   * Current entity - MUST be fully loaded by parent component before rendering.
   * Must have a valid `id` property. RelatedEntities does NOT load the root entity,
   * it only loads related entities via relationship configurations.
   */
  entity: RelatedEntity;
  /** Type of current entity */
  entityType: EntityType;
  /** Relationship configurations for this entity type */
  relationships: RelationshipConfig[];
  /** Current entity path (for cycle prevention) - array of entity IDs */
  entityPath?: string[];
  /** Maximum nesting depth (default: 5) */
  maxDepth?: number;
  /** Additional CSS class name */
  className?: string;
  /**
   * Admin Mode: When true, all relationships are visible immediately, expansion UI is disabled,
   * cycle prevention is disabled, and blank rows are shown for creating new relationships.
   * When false (default), uses User Mode with lazy loading, expansion/collapse, and cycle prevention.
   * @default false
   */
  isAdmin?: boolean;
  /**
   * Optional initial relationship data to pre-populate the component.
   * Keys should match relationship keys (e.g., "Fabrica-fabrica", "Cancion-cancion").
   * This is useful when the parent component already has relationship data from the API.
   */
  initialRelationshipData?: Record<string, RelatedEntity[]>;
}


/**
 * Reducer function for RelatedEntities state management.
 * 
 * Handles all state transitions for the RelatedEntities component including:
 * - Expanding/collapsing relationships (User Mode only)
 * - Loading states and request tracking
 * - Data storage and error handling
 * - Request cancellation tracking
 * 
 * @param state - Current state of the component
 * @param action - Action to perform on the state
 * @returns New state after applying the action
 * 
 * @internal - Exported for testing purposes
 */
// eslint-disable-next-line react-refresh/only-export-components
export function relatedEntitiesReducer(
  state: RelatedEntitiesState,
  action: RelatedEntitiesAction
): RelatedEntitiesState {
  switch (action.type) {
    case 'TOGGLE_RELATIONSHIP': {
      const next = new Set(state.expandedRelationships);
      if (next.has(action.key)) {
        next.delete(action.key);
      } else {
        next.add(action.key);
      }
      return {
        ...state,
        expandedRelationships: next,
      };
    }

    case 'TOGGLE_ENTITY': {
      const next = new Set(state.expandedEntities);
      if (next.has(action.entityId)) {
        next.delete(action.entityId);
      } else {
        next.add(action.entityId);
      }
      return {
        ...state,
        expandedEntities: next,
      };
    }

    case 'LOAD_START': {
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.key]: true,
        },
        inFlightRequests: {
          ...state.inFlightRequests,
          [action.key]: action.abortController,
        },
        errors: {
          ...state.errors,
          [action.key]: null, // Clear any previous error
        },
      };
    }

    case 'LOAD_SUCCESS': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.key]: _, ...remainingRequests } = state.inFlightRequests;
      return {
        ...state,
        loadedData: {
          ...state.loadedData,
          [action.key]: action.data,
        },
        counts: {
          ...state.counts,
          [action.key]: action.count,
        },
        loadingStates: {
          ...state.loadingStates,
          [action.key]: false,
        },
        inFlightRequests: remainingRequests,
        errors: {
          ...state.errors,
          [action.key]: null,
        },
      };
    }

    case 'LOAD_ERROR': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.key]: _, ...remainingRequests } = state.inFlightRequests;
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.key]: false,
        },
        inFlightRequests: remainingRequests,
        errors: {
          ...state.errors,
          [action.key]: action.error,
        },
        // Set empty array on error to prevent retry loops
        loadedData: {
          ...state.loadedData,
          [action.key]: [],
        },
        counts: {
          ...state.counts,
          [action.key]: 0,
        },
      };
    }

    case 'CLEAR_IN_FLIGHT': {
      const { [action.key]: abortController, ...remainingRequests } = state.inFlightRequests;
      if (abortController) {
        abortController.abort();
      }
      return {
        ...state,
        inFlightRequests: remainingRequests,
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: null,
        },
      };
    }

    default:
      return state;
  }
}

/**
 * RelatedEntities Component
 * 
 * Displays related entities in a hierarchical container structure with expand/collapse functionality.
 * Uses EntityCard in contents variant for each entity, with indentation to indicate nesting depth.
 * 
 * ## Features
 * 
 * - **Hierarchical navigation structure**: Semantic `<nav>` container with flat row rendering
 * - **Indentation-based nesting**: EntityCard indentationLevel prop indicates depth (0, 1, 2, etc.)
 * - **Expand/collapse functionality**: User Mode only, relationships can be expanded to show nested entities
 * - **Flat rendering**: All rows (parent + nested) rendered as siblings with proper indentation
 * - **Cycle prevention**: User Mode prevents entities from appearing multiple times in the same path
 * - **Lazy loading**: User Mode loads relationships only when expanded
 * - **Eager loading**: Admin Mode loads all relationships immediately on mount
 * - **Responsive design**: Adapts to mobile and desktop viewports
 * - **Request management**: Cancellation, deduplication, and caching
 * - **Error handling**: User-friendly error messages with retry functionality
 * - **Loading states**: Skeleton loaders during data fetching
 * 
 * ## Modes
 * 
 * ### User Mode (default, `isAdmin={false}`)
 * 
 * - Relationships are expanded by default at the top level (entityPath.length <= 1)
 * - User can collapse/expand relationships using the expand button
 * - Cycle prevention enabled (entities in `entityPath` are filtered out)
 * - Maximum nesting depth enforced (default: 5 levels)
 * - Expansion UI visible (expand/collapse buttons)
 * 
 * ### Admin Mode (`isAdmin={true}`)
 * 
 * - All relationships are visible immediately (no expansion UI)
 * - All relationships load eagerly on mount
 * - Cycle prevention disabled (entities can appear multiple times)
 * - Blank rows shown for each relationship type (placeholder for adding new relationships)
 * - Typically shows only one level of nesting (configurable)
 * 
 * ## Root Entity Loading Responsibility
 * 
 * **CRITICAL**: The `entity` prop MUST be fully loaded by the parent component BEFORE rendering RelatedEntities.
 * 
 * - RelatedEntities does NOT load the root entity - it only loads RELATED entities via `relationship.fetchFn` calls
 * - Parent pages (e.g., InspectRelatedEntitiesPage, FabricaPage) are responsible for:
 *   1. Fetching the root entity from the API
 *   2. Handling loading states and errors for the root entity
 *   3. Passing the fully-loaded entity to RelatedEntities
 * 
 * This separation ensures:
 * - Clear responsibility boundaries
 * - Better error handling (parent can show loading/error states)
 * - Proper TypeScript type safety
 * 
 * ## Internal State Management
 * 
 * Uses `useReducer` for state management with the following state shape:
 * 
 * - `expandedRelationships`: Set of relationship keys that are currently expanded (User Mode only)
 * - `loadedData`: Record mapping relationship keys to loaded entity arrays
 * - `loadingStates`: Record tracking which relationships are currently loading
 * - `counts`: Record storing entity counts for each relationship
 * - `inFlightRequests`: Record tracking AbortController instances for request cancellation
 * - `errors`: Record storing error objects for failed relationship loads
 * 
 * ## Performance Optimizations
 * 
 * - Component wrapped with `React.memo` to prevent unnecessary re-renders
 * - Sorting and filtering operations memoized with `useMemo`
 * - Callbacks memoized with `useCallback`
 * - Request caching to avoid re-fetching same data
 * - Request deduplication to prevent duplicate API calls
 * - Request cancellation to handle rapid expand/collapse
 * 
 * @example
 * ```tsx
 * // User Mode example
 * <RelatedEntities
 *   entity={jingle}
 *   entityType="jingle"
 *   relationships={getJingleRelationships()}
 *   entityPath={[jingle.id]}
 *   maxDepth={5}
 *   isAdmin={false}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Admin Mode example
 * <RelatedEntities
 *   entity={fabrica}
 *   entityType="fabrica"
 *   relationships={getFabricaRelationships()}
 *   entityPath={[fabrica.id]}
 *   isAdmin={true}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Parent component must load entity first
 * function InspectJinglePage({ jingleId }: { jingleId: string }) {
 *   const [jingle, setJingle] = useState<Jingle | null>(null);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     const loadJingle = async () => {
 *       try {
 *         const loaded = await publicApi.getJingle(jingleId);
 *         setJingle(loaded);
 *       } catch (error) {
 *         console.error('Failed to load jingle:', error);
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 *     loadJingle();
 *   }, [jingleId]);
 * 
 *   if (loading) return <LoadingSpinner />;
 *   if (!jingle) return <ErrorMessage />;
 * 
 *   return (
 *     <RelatedEntities
 *       entity={jingle}
 *       entityType="jingle"
 *       relationships={getJingleRelationships()}
 *       entityPath={[jingle.id]}
 *     />
 *   );
 * }
 * ```
 */
function RelatedEntities({
  entity,
  entityType,
  relationships,
  entityPath = [],
  maxDepth = 5,
  className = '',
  isAdmin = false,
  initialRelationshipData = {},
}: RelatedEntitiesProps) {
  // IMPORTANT: The entity prop is always pre-loaded by the parent component.
  // RelatedEntities only loads RELATED entities (via relationship.fetchFn calls),
  // never the root entity itself. This ensures proper separation of concerns and
  // allows parent pages to control loading states and error handling for the root entity.

  // Helper to create relationship key (needed for initial data processing)
  const getRelationshipKey = useCallback((rel: RelationshipConfig) => `${rel.label}-${rel.entityType}`, []);

  // Process initial relationship data to populate loadedData and counts
  const processedInitialData = useMemo(() => {
    const loadedData: Record<string, RelatedEntity[]> = {};
    const counts: Record<string, number> = {};
    
    // Process each relationship configuration
    relationships.forEach((rel) => {
      const key = getRelationshipKey(rel);
      const initialData = initialRelationshipData[key] || [];
      
      if (initialData.length > 0) {
        loadedData[key] = initialData;
        counts[key] = initialData.length;
      }
    });
    
    return { loadedData, counts };
  }, [relationships, initialRelationshipData, getRelationshipKey]);

  // Initialize state with useReducer (must be before early return)
  // Auto-expand all relationships on load to show content immediately
  // Top level is when entityPath.length <= 1 (empty or contains just current entity)
  const initialExpandedRelationships = new Set<string>();
  if (entityPath.length <= 1) {
    // Top level: expand all relationships (both Admin and User Mode)
    relationships.forEach(rel => {
      const key = getRelationshipKey(rel);
      initialExpandedRelationships.add(key);
    });
  }
  
  const initialState: RelatedEntitiesState = {
    expandedRelationships: initialExpandedRelationships,
    expandedEntities: new Set(),
    loadedData: processedInitialData.loadedData,
    loadingStates: {},
    counts: processedInitialData.counts,
    inFlightRequests: {},
    errors: {},
  };

  const [state, dispatch] = useReducer(relatedEntitiesReducer, initialState);

  // Debug: log initial state
  console.log('RelatedEntities initial state:', {
    entityPathLength: entityPath.length,
    initialExpandedRelationships: Array.from(initialExpandedRelationships),
    relationships: relationships.map(r => getRelationshipKey(r)),
    initialStateExpanded: Array.from(initialState.expandedRelationships),
  });

  // Keep a ref to the latest state for use in async callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
    // Debug: log state changes
    console.log('RelatedEntities state updated:', {
      expandedRelationships: Array.from(state.expandedRelationships),
      expandedEntities: Array.from(state.expandedEntities),
      loadedDataKeys: Object.keys(state.loadedData),
      loadedDataCounts: Object.entries(state.loadedData).map(([key, data]) => [key, data.length]),
    });
  }, [state]);

  // Track pending promises for request deduplication (Task 13)
  const pendingRequestsRef = useRef<Record<string, Promise<RelatedEntity[]>>>({});

  // Task 26: Request caching - cache key is combination of entityId, entityType, and relationship key
  const requestCacheRef = useRef<Record<string, RelatedEntity[]>>({});

  // Populate cache with initial relationship data to avoid unnecessary fetches
  useEffect(() => {
    if (entity?.id && Object.keys(processedInitialData.loadedData).length > 0) {
      relationships.forEach((rel) => {
        const key = getRelationshipKey(rel);
        const initialData = processedInitialData.loadedData[key];
        if (initialData && initialData.length > 0) {
          const cacheKey = `${entity.id}-${entityType}-${key}`;
          requestCacheRef.current[cacheKey] = initialData;
        }
      });
    }
  }, [entity?.id, entityType, relationships, processedInitialData.loadedData, getRelationshipKey]);

  // Helper to create cache key for a relationship
  const getCacheKey = useCallback((entityId: string, entityType: string, relKey: string) => {
    return `${entityId}-${entityType}-${relKey}`;
  }, []);

  // Helper to cancel in-flight request for a relationship key (Task 11)
  const cancelInFlightRequest = useCallback((key: string) => {
    const abortController = state.inFlightRequests[key];
    if (abortController) {
      abortController.abort();
      dispatch({ type: 'CLEAR_IN_FLIGHT', key });
    }
    // Also clean up pending promise if it exists
    delete pendingRequestsRef.current[key];
  }, [state.inFlightRequests]);

  // Check if we've exceeded max depth
  const currentDepth = entityPath.length;
  const canExpand = currentDepth < maxDepth;

  // Task 23: Memoize visibleRelationships filtering
  const visibleRelationships = useMemo(() => {
    return relationships.filter(() => {
      // Could add logic here to hide relationships that don't exist
      // For now, show all configured relationships
      return true;
    });
  }, [relationships]);

  // Auto-load first level relationships on mount when expanded
  useEffect(() => {
    if (entityPath.length <= 1 && entity?.id) {
      // This is the top level - auto-load all relationships that are expanded
      const loadRelationships = async () => {
        for (const rel of relationships) {
          const key = getRelationshipKey(rel);
          
          // At top level (entityPath.length <= 1), all relationships are expanded by default
          // No need to check expansion state since we're already in the top level condition
          // All relationships should be loaded at top level
          
          // Skip if already loaded (check both loadedData and initial data)
          const currentState = stateRef.current;
          if (key in currentState.loadedData || (processedInitialData.loadedData[key] && processedInitialData.loadedData[key].length > 0)) {
            continue;
          }
          
          // Task 26: Check cache before making API request
          const cacheKey = getCacheKey(entity.id, entityType, key);
          const cachedData = requestCacheRef.current[cacheKey];
          
          if (cachedData !== undefined) {
            // Use cached data
            const finalCount = cachedData.length;
            dispatch({
              type: 'LOAD_SUCCESS',
              key,
              data: cachedData,
              count: finalCount,
            });
            continue;
          }

          // Request deduplication (Task 13): Check if request already in flight
          if (pendingRequestsRef.current[key] !== undefined) {
            // Request already in progress, skip
            continue;
          }
          
          // Cancel any previous in-flight request (Task 12)
          cancelInFlightRequest(key);

          const abortController = new AbortController();
          dispatch({ type: 'LOAD_START', key, abortController });

          // Create and store the promise for deduplication (Task 13)
          const fetchPromise = (async () => {
            try {
              // Fetch entities
              const entities = await rel.fetchFn(entity.id, entityType);
              
              // Check if request was aborted
              if (abortController.signal.aborted) {
                return [];
              }
              
              // Task 22: Sorting is done here (memoization not needed as it's one-time per fetch)
              const sorted = sortEntities(entities, rel.sortKey, rel.entityType);

              // Task 23: Filtering is done here (memoization not needed as it's one-time per fetch)
              // Task 19: Disable cycle prevention in Admin Mode
              // In Admin Mode, show all entities even if they appear in entityPath
              // In User Mode, filter out entities in path to prevent cycles
              const filtered = isAdmin 
                ? sorted 
                : sorted.filter((e) => !entityPath.includes(e.id));

              // Task 26: Store in cache
              requestCacheRef.current[cacheKey] = filtered;

              // Task 28: Use entities.length as count (no redundant fetchCountFn calls)
              // The count is derived from the loaded entities, eliminating the need for separate count API calls
              const finalCount = filtered.length;

              dispatch({
                type: 'LOAD_SUCCESS',
                key,
                data: filtered,
                count: finalCount,
              });
              
              return filtered;
            } catch (error) {
              // Handle AbortError gracefully (Task 12) - don't show error to user
              if (error instanceof Error && error.name === 'AbortError') {
                // Request was cancelled, ignore
                return [];
              }
              
              // Task 35: Create user-friendly error message
              const errorMessage = error instanceof Error 
                ? error.message || 'Error desconocido'
                : String(error) || 'Error desconocido';
              
              const friendlyError = new Error(errorMessage);
              friendlyError.name = error instanceof Error ? error.name : 'Error';
              
              console.error(`Error loading ${rel.label}:`, error);
              dispatch({
                type: 'LOAD_ERROR',
                key,
                error: friendlyError,
              });
              return [];
            } finally {
              // Clean up pending promise (Task 13)
              delete pendingRequestsRef.current[key];
            }
          })();
          
          pendingRequestsRef.current[key] = fetchPromise;
        }
      };
      loadRelationships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity?.id, entityType, relationships, isAdmin, cancelInFlightRequest, getRelationshipKey, getCacheKey]); // Run on mount for top level

  // Handle expand/collapse for relationship
  const handleToggleRelationship = useCallback(
    async (rel: RelationshipConfig) => {
      // Task 17: Disable expansion UI in Admin Mode - return early if Admin Mode
      if (isAdmin) {
        return;
      }
      
      const key = getRelationshipKey(rel);
      const isExpanded = state.expandedRelationships.has(key);

      if (isExpanded) {
        // Collapse - cancel any in-flight request (Task 12)
        cancelInFlightRequest(key);
        dispatch({ type: 'TOGGLE_RELATIONSHIP', key });
      } else {
        // Expand - lazy load data if not already loaded
        dispatch({ type: 'TOGGLE_RELATIONSHIP', key });

        // Request deduplication (Task 13): Check if request already in flight
        if (pendingRequestsRef.current[key] !== undefined) {
          // Request already in progress, await it
          try {
            await pendingRequestsRef.current[key];
          } catch {
            // Error already handled in the promise
          }
          return;
        }

        // Task 26: Check cache before making API request
        if (entity?.id) {
          const cacheKey = getCacheKey(entity.id, entityType, key);
          const cachedData = requestCacheRef.current[cacheKey];
          
          if (cachedData !== undefined) {
            // Use cached data
            const finalCount = cachedData.length;
            dispatch({
              type: 'LOAD_SUCCESS',
              key,
              data: cachedData,
              count: finalCount,
            });
            return;
          }
        }

        // Check if data hasn't been loaded yet (key doesn't exist in loadedData)
        // This ensures we fetch even if a previous fetch returned an empty array
        if (!(key in state.loadedData) && !state.loadingStates[key]) {
          // Cancel any previous in-flight request (Task 12)
          cancelInFlightRequest(key);

          const abortController = new AbortController();
          dispatch({ type: 'LOAD_START', key, abortController });

          // Create and store the promise for deduplication (Task 13)
          const fetchPromise = (async () => {
            try {
              // Fetch entities
              if (!entity?.id) return []; // Guard against null entity
              const entities = await rel.fetchFn(entity.id, entityType);
              
              // Check if request was aborted
              if (abortController.signal.aborted) {
                return [];
              }
              
              // Task 22: Sorting is done here (memoization not needed as it's one-time per fetch)
              const sorted = sortEntities(entities, rel.sortKey, rel.entityType);

              // Task 23: Filtering is done here (memoization not needed as it's one-time per fetch)
              // Task 19: Disable cycle prevention in Admin Mode
              // In Admin Mode, show all entities even if they appear in entityPath
              // In User Mode, filter out entities in path to prevent cycles
              const filtered = isAdmin 
                ? sorted 
                : sorted.filter((e) => !entityPath.includes(e.id));

              // Task 26: Store in cache
              if (entity?.id) {
                const cacheKey = getCacheKey(entity.id, entityType, key);
                requestCacheRef.current[cacheKey] = filtered;
              }

              // Task 28: Use entities.length as count (no redundant fetchCountFn calls)
              // The count is derived from the loaded entities, eliminating the need for separate count API calls
              const finalCount = filtered.length;

              dispatch({
                type: 'LOAD_SUCCESS',
                key,
                data: filtered,
                count: finalCount,
              });
              
              return filtered;
            } catch (error) {
              // Handle AbortError gracefully (Task 12) - don't show error to user
              if (error instanceof Error && error.name === 'AbortError') {
                // Request was cancelled, ignore
                return [];
              }
              
              // Task 35: Create user-friendly error message
              const errorMessage = error instanceof Error 
                ? error.message || 'Error desconocido'
                : String(error) || 'Error desconocido';
              
              const friendlyError = new Error(errorMessage);
              friendlyError.name = error instanceof Error ? error.name : 'Error';
              
              console.error(`Error loading ${rel.label}:`, error);
              dispatch({
                type: 'LOAD_ERROR',
                key,
                error: friendlyError,
              });
              return [];
            } finally {
              // Clean up pending promise (Task 13)
              delete pendingRequestsRef.current[key];
            }
          })();
          
          pendingRequestsRef.current[key] = fetchPromise;
        }
      }
    },
    [entity?.id, entityType, entityPath, isAdmin, state.loadedData, state.loadingStates, state.expandedRelationships, getRelationshipKey, getCacheKey, cancelInFlightRequest]
  );

  // Validate entity prop - must be provided and have an id
  // Note: Parent component is responsible for loading entity before rendering RelatedEntities
  if (!entity || !entity.id) {
    console.error('RelatedEntities: entity prop is required and must have an id');
    return (
      <div className={`related-entities ${className}`}>
        <div className="related-entities__error" style={{ padding: '1rem', color: '#c00' }}>
          <p>Error: Entity is required but not provided.</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            Please ensure the parent component loads the entity before rendering RelatedEntities.
          </p>
        </div>
      </div>
    );
  }

  // visibleRelationships is already memoized above

  if (visibleRelationships.length === 0) {
    return null;
  }

  // Task 37: Add mode-specific CSS classes
  const modeClass = isAdmin ? 'related-entities--admin' : 'related-entities--user';

  // Helper function to recursively collect all rows into a flat array
  // This replaces the nested table structure with a flat container structure
  type FlatRow = {
    id: string;
    entity: RelatedEntity;
    entityType: EntityType;
    indentLevel: number;
    relationshipLabel: string;
  };

  const collectFlatRows = useCallback(
    (
      currentEntityRelationships: RelationshipConfig[],
      currentIndentLevel: number,
      currentEntityPath: string[]
    ): FlatRow[] => {
      const rows: FlatRow[] = [];

      currentEntityRelationships.forEach((rel) => {
        const key = getRelationshipKey(rel);
        const isExpanded = isAdmin ? true : state.expandedRelationships.has(key);
        const entities = state.loadedData[key] || [];

        if (isExpanded && entities.length > 0) {
          // Add all entities for this relationship at the current indent level
          entities.forEach((relatedEntity) => {
            rows.push({
              id: `${key}-${relatedEntity.id}`,
              entity: relatedEntity,
              entityType: rel.entityType,
              indentLevel: currentIndentLevel,
              relationshipLabel: rel.label,
            });

            // Recursively collect nested relationships if:
            // - Relationship is expandable
            // - We haven't reached max depth
            // - Not in Admin Mode (Admin Mode disables nesting)
            // - No cycle detected
            // - Entity is expanded (checked via state.expandedEntities)
            const hasNested = !isAdmin && rel.expandable && canExpand;
            const relatedEntityPath = [...currentEntityPath, relatedEntity.id];
            const hasCycle = relatedEntityPath.slice(0, -1).includes(relatedEntity.id);
            const isEntityExpanded = state.expandedEntities.has(relatedEntity.id);

            if (hasNested && !hasCycle && isEntityExpanded) {
              const nestedRelationships = getRelationshipsForEntityType(rel.entityType);
              // Collect nested rows for this specific entity
              // Nested relationships are stored with keys like "Canciones-cancion-ART-002"
              nestedRelationships.forEach((nestedRel) => {
                const nestedKey = `${getRelationshipKey(nestedRel)}-${relatedEntity.id}`;
                const nestedEntities = state.loadedData[nestedKey] || [];
                
                nestedEntities.forEach((nestedEntity) => {
                  rows.push({
                    id: `${nestedKey}-${nestedEntity.id}`,
                    entity: nestedEntity,
                    entityType: nestedRel.entityType,
                    indentLevel: currentIndentLevel + 1,
                    relationshipLabel: nestedRel.label,
                  });
                });
              });
            }
          });
        }
      });

      return rows;
    },
    [isAdmin, state.expandedRelationships, state.expandedEntities, state.loadedData, canExpand, getRelationshipKey, entityPath]
  );

  // Collect all rows into a flat array
  const flatRows = useMemo(
    () => collectFlatRows(visibleRelationships, 0, entityPath),
    [visibleRelationships, entityPath, collectFlatRows]
  );

  return (
    <div className={`related-entities ${modeClass} ${className}`}>
      <nav className="related-entities__container" aria-label="Related entities">
        {visibleRelationships.map((rel) => {
          const key = getRelationshipKey(rel);
          const isExpanded = isAdmin ? true : state.expandedRelationships.has(key);
          const isLoading = state.loadingStates[key] || false;
          const entities = state.loadedData[key] || [];
          const hasError = state.errors[key] !== null && state.errors[key] !== undefined;
          // Use entities.length if we have loaded entities, otherwise use stored count
          const count = entities.length > 0 ? entities.length : (state.counts[key] || 0);
          
          // Hide the section if: not loading, no error, no entities, and data has been loaded
          // We check if key exists in loadedData to confirm data has been loaded (even if empty)
          const hasLoadedData = key in state.loadedData;
          const shouldHide = !isLoading && !hasError && entities.length === 0 && hasLoadedData;
          
          // Don't render the section if we should hide it
          if (shouldHide) {
            return null;
          }

          return (
            <div key={key} className="related-entities__section">
              {/* Collapsed state - show expand button in User Mode */}
              {!isAdmin && !isExpanded ? (
                <button
                  className="related-entities__collapsed"
                  onClick={() => handleToggleRelationship(rel)}
                  aria-label={`Expandir ${rel.label.toLowerCase()}`}
                  aria-expanded="false"
                  type="button"
                >
                  <span className="related-entities__expand-icon" aria-hidden="true">▼</span>
                  <span className="related-entities__label">{rel.label}</span>
                  {count > 0 && (
                    <span className="related-entities__count">({count})</span>
                  )}
                </button>
              ) : (
                /* Content area - show content rows when expanded */
                <div
                  className="related-entities__content"
                  role="region"
                  aria-label={`${rel.label} relacionadas`}
                  aria-live="polite"
                  aria-busy={isLoading}
                >
                    {isLoading && entities.length === 0 ? (
                      // Task 34: Skeleton loaders for loading states
                      <div className="related-entities__skeleton-container" aria-label="Cargando">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={`skeleton-${idx}`} className="related-entities__skeleton" aria-hidden="true">
                            <div className="related-entities__skeleton-item related-entities__skeleton-icon"></div>
                            <div className="related-entities__skeleton-item related-entities__skeleton-text"></div>
                            <div className="related-entities__skeleton-item related-entities__skeleton-text--secondary"></div>
                          </div>
                        ))}
                      </div>
                    ) : state.errors[key] ? (
                      // Task 35: User-friendly error messages with retry
                      <div
                        className={`related-entities__error-message ${state.errors[key]?.name === 'AbortError' ? '' : 'related-entities__error-message--critical'}`}
                        role="alert"
                        aria-live="assertive"
                      >
                        <span className="related-entities__error-text">
                          {state.errors[key]?.name === 'AbortError'
                            ? 'Carga cancelada'
                            : `Error al cargar ${rel.label.toLowerCase()}: ${state.errors[key]?.message || 'Error desconocido'}`
                          }
                        </span>
                        {state.errors[key]?.name !== 'AbortError' && (
                          <button
                            className="related-entities__error-retry"
                            onClick={() => {
                              dispatch({ type: 'CLEAR_ERROR', key });
                              handleToggleRelationship(rel);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                dispatch({ type: 'CLEAR_ERROR', key });
                                handleToggleRelationship(rel);
                              }
                            }}
                            aria-label="Reintentar carga"
                          >
                            Reintentar
                          </button>
                        )}
                      </div>
                    ) : entities.length === 0 ? (
                      // This case should not be reached due to shouldHide check above,
                      // but kept as a fallback for edge cases
                      null
                    ) : (
                      // Render direct entities for this relationship first
                      <>
                        {entities.map((entity) => {
                          const rowId = `${key}-${entity.id}`;
                          // Check if this entity type has relationships configured (can be expanded)
                          const entityRelationships = getRelationshipsForEntityType(rel.entityType);
                          const hasNestedRelationships = entityRelationships.length > 0 && rel.expandable;
                          // Check if this entity is currently expanded
                          const isEntityExpanded = state.expandedEntities.has(entity.id);
                          // Get nested rows if entity is expanded
                          // Nested rows are stored with keys like "Canciones-cancion-ART-002"
                          // and have row IDs like "Canciones-cancion-ART-002-CAN-001"
                          const nestedRows = isEntityExpanded 
                            ? (() => {
                                const rows: Array<{ id: string; entity: RelatedEntity; entityType: EntityType; indentLevel: number; relationshipLabel: string }> = [];
                                entityRelationships.forEach((nestedRel) => {
                                  const nestedKey = `${getRelationshipKey(nestedRel)}-${entity.id}`;
                                  const nestedEntities = state.loadedData[nestedKey] || [];
                                  console.log('Getting nested rows for entity:', entity.id, 'key:', nestedKey, 'entities:', nestedEntities.length);
                                  nestedEntities.forEach((nestedEntity) => {
                                    rows.push({
                                      id: `${nestedKey}-${nestedEntity.id}`,
                                      entity: nestedEntity,
                                      entityType: nestedRel.entityType,
                                      indentLevel: 1,
                                      relationshipLabel: nestedRel.label,
                                    });
                                  });
                                });
                                console.log('Total nested rows for entity:', entity.id, ':', rows.length);
                                return rows;
                              })()
                            : [];
                          const hasNested = !isAdmin && hasNestedRelationships && canExpand;
                          
                          // Extract relationship data from entity if it exists (e.g., fabrica for Jingle)
                          // The backend may include relationship data directly in the entity object
                          const relationshipData: Record<string, unknown> | undefined = 
                            rel.entityType === 'jingle' && (entity as any).fabrica
                              ? { fabrica: (entity as any).fabrica }
                              : undefined;
                          
                          return (
                            <React.Fragment key={rowId}>
                              <div className="related-entities__row">
                                <EntityCard
                                  entity={entity}
                                  entityType={rel.entityType}
                                  variant="contents"
                                  indentationLevel={0}
                                  relationshipLabel={rel.label}
                                  relationshipData={relationshipData}
                                  hasNestedEntities={hasNested}
                                  isExpanded={isEntityExpanded}
                                  onToggleExpand={async () => {
                                    console.log('onToggleExpand called for entity:', entity.id, 'entityType:', rel.entityType);
                                    const currentState = stateRef.current;
                                    const wasExpanded = currentState.expandedEntities.has(entity.id);
                                    console.log('wasExpanded:', wasExpanded, 'hasNestedRelationships:', hasNestedRelationships);
                                    dispatch({ type: 'TOGGLE_ENTITY', entityId: entity.id });
                                    
                                    // If expanding, load nested relationships
                                    if (!wasExpanded && hasNestedRelationships) {
                                      const nestedRelationships = getRelationshipsForEntityType(rel.entityType);
                                      console.log('Loading nested relationships for entity:', entity.id, 'relationships:', nestedRelationships.map(r => r.label));
                                      
                                      for (const nestedRel of nestedRelationships) {
                                        const nestedKey = `${getRelationshipKey(nestedRel)}-${entity.id}`;
                                        
                                        // Check current state (may have updated)
                                        const latestState = stateRef.current;
                                        console.log('Checking nested key:', nestedKey, 'in loadedData:', nestedKey in latestState.loadedData);
                                        
                                        // Check if already loaded
                                        if (nestedKey in latestState.loadedData) {
                                          console.log('Already loaded, skipping');
                                          continue;
                                        }
                                        
                                        // Check cache
                                        const cacheKey = `${entity.id}-${rel.entityType}-${getRelationshipKey(nestedRel)}`;
                                        const cachedData = requestCacheRef.current[cacheKey];
                                        if (cachedData !== undefined) {
                                          console.log('Using cached data:', cachedData.length, 'entities');
                                          dispatch({
                                            type: 'LOAD_SUCCESS',
                                            key: nestedKey,
                                            data: cachedData,
                                            count: cachedData.length,
                                          });
                                          continue;
                                        }
                                        
                                        // Load nested relationships
                                        try {
                                          console.log('Loading nested relationships for:', entity.id, 'relationship:', nestedRel.label);
                                          const abortController = new AbortController();
                                          dispatch({ type: 'LOAD_START', key: nestedKey, abortController });
                                          
                                          const nestedEntities = await nestedRel.fetchFn(entity.id, rel.entityType);
                                          console.log('Fetched nested entities:', nestedEntities.length, nestedEntities);
                                          const sorted = sortEntities(nestedEntities, nestedRel.sortKey, nestedRel.entityType);
                                          const filtered = sorted.filter((e) => ![...entityPath, entity.id].includes(e.id));
                                          
                                          console.log('Filtered nested entities:', filtered.length, 'storing with key:', nestedKey);
                                          
                                          // Cache the data
                                          requestCacheRef.current[cacheKey] = filtered;
                                          
                                          dispatch({
                                            type: 'LOAD_SUCCESS',
                                            key: nestedKey,
                                            data: filtered,
                                            count: filtered.length,
                                          });
                                        } catch (error) {
                                          console.error('Error loading nested relationships:', error);
                                          if (error instanceof Error && error.name !== 'AbortError') {
                                            dispatch({
                                              type: 'LOAD_ERROR',
                                              key: nestedKey,
                                              error: error instanceof Error ? error : new Error(String(error)),
                                            });
                                          }
                                        }
                                      }
                                    }
                                  }}
                                  nestedCount={nestedRows.length}
                                />
                              </div>
                              {/* Render nested rows if entity is expanded */}
                              {isEntityExpanded && (
                                <>
                                  {(() => {
                                    // Check if any nested relationships are loading
                                    const isLoading = entityRelationships.some(nestedRel => {
                                      const nestedKey = `${getRelationshipKey(nestedRel)}-${entity.id}`;
                                      return state.loadingStates[nestedKey] === true;
                                    });
                                    
                                    if (isLoading) {
                                      return (
                                        <div className="related-entities__skeleton-container" aria-label="Cargando">
                                          <div className="related-entities__skeleton" aria-hidden="true">
                                            <div className="related-entities__skeleton-item related-entities__skeleton-icon"></div>
                                            <div className="related-entities__skeleton-item related-entities__skeleton-text"></div>
                                            <div className="related-entities__skeleton-item related-entities__skeleton-text--secondary"></div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    
                                    // Check for errors
                                    const hasError = entityRelationships.some(nestedRel => {
                                      const nestedKey = `${getRelationshipKey(nestedRel)}-${entity.id}`;
                                      return state.errors[nestedKey] !== null && state.errors[nestedKey] !== undefined;
                                    });
                                    
                                    if (hasError) {
                                      return entityRelationships.map(nestedRel => {
                                        const nestedKey = `${getRelationshipKey(nestedRel)}-${entity.id}`;
                                        const error = state.errors[nestedKey];
                                        if (!error) return null;
                                        return (
                                          <div key={nestedKey} className="related-entities__error-message" role="alert">
                                            <span className="related-entities__error-text">
                                              Error al cargar {nestedRel.label.toLowerCase()}: {error.message}
                                            </span>
                                          </div>
                                        );
                                      });
                                    }
                                    
                                    // Show nested rows recursively
                                    if (nestedRows.length > 0) {
                                      return nestedRows.map(row => {
                                        // Check if this nested entity has its own nested relationships
                                        const nestedEntityRelationships = getRelationshipsForEntityType(row.entityType);
                                        const nestedEntityPath = [...entityPath, entity.id];
                                        const nestedEntityCanExpand = nestedEntityPath.length < maxDepth;
                                        // Filter to only expandable relationships
                                        const expandableNestedRelationships = nestedEntityRelationships.filter(rel => rel.expandable);
                                        // Check if nested entity has expandable relationships
                                        const nestedEntityHasNested = !isAdmin && expandableNestedRelationships.length > 0 && nestedEntityCanExpand;
                                        const nestedEntityIsExpanded = state.expandedEntities.has(row.entity.id);
                                        
                                        console.log(`[DEBUG] Nested entity ${row.entity.id} (${row.entityType}):`, {
                                          hasRelationships: nestedEntityRelationships.length > 0,
                                          expandableRelationships: expandableNestedRelationships.length,
                                          canExpand: nestedEntityCanExpand,
                                          pathLength: nestedEntityPath.length,
                                          maxDepth,
                                          hasNested: nestedEntityHasNested,
                                          isExpanded: nestedEntityIsExpanded,
                                          willShowExpandButton: nestedEntityHasNested && nestedEntityCanExpand,
                                          relationships: expandableNestedRelationships.map(r => r.label),
                                        });
                                        
                                        // Get nested-nested rows if this nested entity is expanded
                                        const nestedNestedRows = nestedEntityIsExpanded && nestedEntityCanExpand
                                          ? (() => {
                                              const rows: Array<{ id: string; entity: RelatedEntity; entityType: EntityType; indentLevel: number; relationshipLabel: string }> = [];
                                              expandableNestedRelationships.forEach((nestedNestedRel) => {
                                                const nestedNestedKey = `${getRelationshipKey(nestedNestedRel)}-${row.entity.id}`;
                                                const nestedNestedEntities = state.loadedData[nestedNestedKey] || [];
                                                console.log(`[DEBUG] Nested entity ${row.entity.id} - relationship ${nestedNestedRel.label}: key=${nestedNestedKey}, entities=${nestedNestedEntities.length}`, nestedNestedEntities);
                                                nestedNestedEntities.forEach((nestedNestedEntity) => {
                                                  rows.push({
                                                    id: `${nestedNestedKey}-${nestedNestedEntity.id}`,
                                                    entity: nestedNestedEntity,
                                                    entityType: nestedNestedRel.entityType,
                                                    indentLevel: row.indentLevel + 1,
                                                    relationshipLabel: nestedNestedRel.label,
                                                  });
                                                });
                                              });
                                              console.log(`[DEBUG] Total nested-nested rows for ${row.entity.id}:`, rows.length);
                                              return rows;
                                            })()
                                          : [];
                                        
                                        // Extract relationship data for nested entity
                                        const nestedRelationshipData: Record<string, unknown> | undefined = 
                                          row.entityType === 'jingle' && (row.entity as any).fabrica
                                            ? { fabrica: (row.entity as any).fabrica }
                                            : undefined;
                                        
                                        return (
                                          <React.Fragment key={row.id}>
                                            <div className="related-entities__row">
                                              <EntityCard
                                                entity={row.entity}
                                                entityType={row.entityType}
                                                variant="contents"
                                                indentationLevel={row.indentLevel}
                                                relationshipLabel={row.relationshipLabel}
                                                relationshipData={nestedRelationshipData}
                                                hasNestedEntities={nestedEntityHasNested && nestedEntityCanExpand}
                                                isExpanded={nestedEntityIsExpanded}
                                                onToggleExpand={async () => {
                                                  console.log(`[DEBUG] onToggleExpand called for nested entity ${row.entity.id} (${row.entityType})`);
                                                  const currentState = stateRef.current;
                                                  const wasExpanded = currentState.expandedEntities.has(row.entity.id);
                                                  console.log(`[DEBUG] wasExpanded: ${wasExpanded}, hasNested: ${nestedEntityHasNested}, canExpand: ${nestedEntityCanExpand}`);
                                                  dispatch({ type: 'TOGGLE_ENTITY', entityId: row.entity.id });
                                                  
                                                  // If expanding, load nested relationships for this nested entity
                                                  if (!wasExpanded && nestedEntityHasNested && nestedEntityCanExpand) {
                                                    console.log(`[DEBUG] Expanding nested entity ${row.entity.id}, loading relationships:`, expandableNestedRelationships.map(r => r.label));
                                                    for (const nestedNestedRel of expandableNestedRelationships) {
                                                      const nestedNestedKey = `${getRelationshipKey(nestedNestedRel)}-${row.entity.id}`;
                                                      
                                                      const latestState = stateRef.current;
                                                      if (nestedNestedKey in latestState.loadedData) {
                                                        continue;
                                                      }
                                                      
                                                      // Check cache
                                                      const cacheKey = `${row.entity.id}-${row.entityType}-${getRelationshipKey(nestedNestedRel)}`;
                                                      const cachedData = requestCacheRef.current[cacheKey];
                                                      if (cachedData !== undefined) {
                                                        dispatch({
                                                          type: 'LOAD_SUCCESS',
                                                          key: nestedNestedKey,
                                                          data: cachedData,
                                                          count: cachedData.length,
                                                        });
                                                        continue;
                                                      }
                                                      
                                                      // Load nested relationships
                                                      try {
                                                        const abortController = new AbortController();
                                                        dispatch({ type: 'LOAD_START', key: nestedNestedKey, abortController });
                                                        
                                                        const nestedNestedEntities = await nestedNestedRel.fetchFn(row.entity.id, row.entityType);
                                                        const sorted = sortEntities(nestedNestedEntities, nestedNestedRel.sortKey, nestedNestedRel.entityType);
                                                        const filtered = sorted.filter((e) => !nestedEntityPath.includes(e.id));
                                                        
                                                        // Cache the data
                                                        requestCacheRef.current[cacheKey] = filtered;
                                                        
                                                        dispatch({
                                                          type: 'LOAD_SUCCESS',
                                                          key: nestedNestedKey,
                                                          data: filtered,
                                                          count: filtered.length,
                                                        });
                                                      } catch (error) {
                                                        console.error('Error loading nested-nested relationships:', error);
                                                        if (error instanceof Error && error.name !== 'AbortError') {
                                                          dispatch({
                                                            type: 'LOAD_ERROR',
                                                            key: nestedNestedKey,
                                                            error: error instanceof Error ? error : new Error(String(error)),
                                                          });
                                                        }
                                                      }
                                                    }
                                                  }
                                                }}
                                                nestedCount={nestedNestedRows.length}
                                              />
                                            </div>
                                            {/* Show loading state for nested relationships */}
                                            {nestedEntityIsExpanded && (() => {
                                              const isLoading = expandableNestedRelationships.some(nestedNestedRel => {
                                                const nestedNestedKey = `${getRelationshipKey(nestedNestedRel)}-${row.entity.id}`;
                                                return state.loadingStates[nestedNestedKey] === true;
                                              });
                                              
                                              if (isLoading) {
                                                return (
                                                  <div className="related-entities__skeleton-container" aria-label="Cargando">
                                                    <div className="related-entities__skeleton" aria-hidden="true">
                                                      <div className="related-entities__skeleton-item related-entities__skeleton-icon"></div>
                                                      <div className="related-entities__skeleton-item related-entities__skeleton-text"></div>
                                                      <div className="related-entities__skeleton-item related-entities__skeleton-text--secondary"></div>
                                                    </div>
                                                  </div>
                                                );
                                              }
                                              
                                              // Check for errors
                                              const hasError = expandableNestedRelationships.some(nestedNestedRel => {
                                                const nestedNestedKey = `${getRelationshipKey(nestedNestedRel)}-${row.entity.id}`;
                                                return state.errors[nestedNestedKey] !== null && state.errors[nestedNestedKey] !== undefined;
                                              });
                                              
                                              if (hasError) {
                                                return expandableNestedRelationships.map(nestedNestedRel => {
                                                  const nestedNestedKey = `${getRelationshipKey(nestedNestedRel)}-${row.entity.id}`;
                                                  const error = state.errors[nestedNestedKey];
                                                  if (!error) return null;
                                                  return (
                                                    <div key={nestedNestedKey} className="related-entities__error-message" role="alert">
                                                      <span className="related-entities__error-text">
                                                        Error al cargar {nestedNestedRel.label.toLowerCase()}: {error.message}
                                                      </span>
                                                    </div>
                                                  );
                                                });
                                              }
                                              
                                              return null;
                                            })()}
                                            {/* Recursively render nested-nested rows with full expansion capability */}
                                            {nestedEntityIsExpanded && nestedNestedRows.length > 0 && (
                                              nestedNestedRows.map(nestedNestedRow => {
                                                // Recursively check for deeper nesting
                                                const deeperRelationships = getRelationshipsForEntityType(nestedNestedRow.entityType);
                                                // Calculate the correct path: entityPath + parent entity + nested entity
                                                const deeperPath = [...nestedEntityPath, row.entity.id, nestedNestedRow.entity.id];
                                                const deeperCanExpand = deeperPath.length < maxDepth;
                                                const deeperHasNested = !isAdmin && deeperRelationships.length > 0 && deeperCanExpand;
                                                const deeperIsExpanded = state.expandedEntities.has(nestedNestedRow.entity.id);
                                                
                                                console.log(`[DEBUG] Deeper entity ${nestedNestedRow.entity.id} (${nestedNestedRow.entityType}):`, {
                                                  hasRelationships: deeperRelationships.length > 0,
                                                  canExpand: deeperCanExpand,
                                                  pathLength: deeperPath.length,
                                                  maxDepth,
                                                  hasNested: deeperHasNested,
                                                  isExpanded: deeperIsExpanded,
                                                  relationships: deeperRelationships.map(r => r.label),
                                                });
                                                
                                                // Get deeper nested rows
                                                const deeperRows = deeperIsExpanded && deeperCanExpand
                                                  ? (() => {
                                                      const rows: Array<{ id: string; entity: RelatedEntity; entityType: EntityType; indentLevel: number; relationshipLabel: string }> = [];
                                                      deeperRelationships.forEach((deeperRel) => {
                                                        const deeperKey = `${getRelationshipKey(deeperRel)}-${nestedNestedRow.entity.id}`;
                                                        const deeperEntities = state.loadedData[deeperKey] || [];
                                                        deeperEntities.forEach((deeperEntity) => {
                                                          rows.push({
                                                            id: `${deeperKey}-${deeperEntity.id}`,
                                                            entity: deeperEntity,
                                                            entityType: deeperRel.entityType,
                                                            indentLevel: nestedNestedRow.indentLevel + 1,
                                                            relationshipLabel: deeperRel.label,
                                                          });
                                                        });
                                                      });
                                                      return rows;
                                                    })()
                                                  : [];
                                                
                                                const deeperRelationshipData: Record<string, unknown> | undefined = 
                                                  nestedNestedRow.entityType === 'jingle' && (nestedNestedRow.entity as any).fabrica
                                                    ? { fabrica: (nestedNestedRow.entity as any).fabrica }
                                                    : undefined;
                                                
                                                return (
                                                  <React.Fragment key={nestedNestedRow.id}>
                                                    <div className="related-entities__row">
                                                      <EntityCard
                                                        entity={nestedNestedRow.entity}
                                                        entityType={nestedNestedRow.entityType}
                                                        variant="contents"
                                                        indentationLevel={nestedNestedRow.indentLevel}
                                                        relationshipLabel={nestedNestedRow.relationshipLabel}
                                                        relationshipData={deeperRelationshipData}
                                                        hasNestedEntities={deeperHasNested && deeperCanExpand}
                                                        isExpanded={deeperIsExpanded}
                                                        onToggleExpand={async () => {
                                                          const currentState = stateRef.current;
                                                          const wasExpanded = currentState.expandedEntities.has(nestedNestedRow.entity.id);
                                                          dispatch({ type: 'TOGGLE_ENTITY', entityId: nestedNestedRow.entity.id });
                                                          
                                                          if (!wasExpanded && deeperHasNested && deeperCanExpand) {
                                                            for (const deeperRel of deeperRelationships) {
                                                              const deeperKey = `${getRelationshipKey(deeperRel)}-${nestedNestedRow.entity.id}`;
                                                              
                                                              const latestState = stateRef.current;
                                                              if (deeperKey in latestState.loadedData) continue;
                                                              
                                                              const cacheKey = `${nestedNestedRow.entity.id}-${nestedNestedRow.entityType}-${getRelationshipKey(deeperRel)}`;
                                                              const cachedData = requestCacheRef.current[cacheKey];
                                                              if (cachedData !== undefined) {
                                                                dispatch({
                                                                  type: 'LOAD_SUCCESS',
                                                                  key: deeperKey,
                                                                  data: cachedData,
                                                                  count: cachedData.length,
                                                                });
                                                                continue;
                                                              }
                                                              
                                                              try {
                                                                const abortController = new AbortController();
                                                                dispatch({ type: 'LOAD_START', key: deeperKey, abortController });
                                                                
                                                                const deeperEntities = await deeperRel.fetchFn(nestedNestedRow.entity.id, nestedNestedRow.entityType);
                                                                const sorted = sortEntities(deeperEntities, deeperRel.sortKey, deeperRel.entityType);
                                                                const filtered = sorted.filter((e) => !deeperPath.includes(e.id));
                                                                
                                                                requestCacheRef.current[cacheKey] = filtered;
                                                                
                                                                dispatch({
                                                                  type: 'LOAD_SUCCESS',
                                                                  key: deeperKey,
                                                                  data: filtered,
                                                                  count: filtered.length,
                                                                });
                                                              } catch (error) {
                                                                if (error instanceof Error && error.name !== 'AbortError') {
                                                                  dispatch({
                                                                    type: 'LOAD_ERROR',
                                                                    key: deeperKey,
                                                                    error: error instanceof Error ? error : new Error(String(error)),
                                                                  });
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }}
                                                        nestedCount={deeperRows.length}
                                                      />
                                                    </div>
                                                    {/* Render deeper nested rows (level 4+) */}
                                                    {deeperIsExpanded && deeperRows.length > 0 && (
                                                      deeperRows.map(deeperRow => (
                                                        <div key={deeperRow.id} className="related-entities__row">
                                                          <EntityCard
                                                            entity={deeperRow.entity}
                                                            entityType={deeperRow.entityType}
                                                            variant="contents"
                                                            indentationLevel={deeperRow.indentLevel}
                                                            relationshipLabel={deeperRow.relationshipLabel}
                                                          />
                                                        </div>
                                                      ))
                                                    )}
                                                  </React.Fragment>
                                                );
                                              })
                                            )}
                                          </React.Fragment>
                                        );
                                      });
                                    }
                                    
                                    return null;
                                  })()}
                                </>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}

                    {/* Task 18: Add blank row for Admin Mode */}
                    {isAdmin && entities.length > 0 && (
                      <div className="related-entities__blank-row" title="Fila en blanco para agregar nueva relación (funcionalidad futura)">
                        <div className="related-entities__empty">+ Agregar {rel.label.toLowerCase()}</div>
                      </div>
                    )}
                  </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// Task 21: Add React.memo to RelatedEntities component with custom comparison function
export default React.memo(RelatedEntities, (prevProps, nextProps) => {
  // Custom comparison: only re-render if props actually change
  // This prevents unnecessary re-renders when parent re-renders with same entity
  
  // Compare entity.id (primary identifier)
  if (prevProps.entity.id !== nextProps.entity.id) return false;
  
  // Compare entityType
  if (prevProps.entityType !== nextProps.entityType) return false;
  
  // Compare entityPath (check length and contents)
  const prevPath = prevProps.entityPath || [];
  const nextPath = nextProps.entityPath || [];
  if (prevPath.length !== nextPath.length) return false;
  if (!prevPath.every((id, idx) => id === nextPath[idx])) return false;
  
  // Compare other props
  if (prevProps.isAdmin !== nextProps.isAdmin) return false;
  if (prevProps.maxDepth !== nextProps.maxDepth) return false;
  if (prevProps.className !== nextProps.className) return false;
  
  // Compare relationships array (shallow compare)
  if (prevProps.relationships.length !== nextProps.relationships.length) return false;
  if (!prevProps.relationships.every((rel, idx) => {
    const nextRel = nextProps.relationships[idx];
    return (
      rel.label === nextRel.label &&
      rel.entityType === nextRel.entityType &&
      rel.sortKey === nextRel.sortKey &&
      rel.expandable === nextRel.expandable &&
      rel.fetchFn === nextRel.fetchFn &&
      rel.fetchCountFn === nextRel.fetchCountFn
    );
  })) return false;
  
  // All props are equal, skip re-render
  return true;
});

