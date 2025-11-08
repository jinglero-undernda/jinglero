import { useCallback, useEffect, useReducer, useRef } from 'react';
import EntityCard, { type EntityType } from './EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { sortEntities } from '../../lib/utils/entitySorters';
import '../../styles/components/related-entities.css';

export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;

// State management types for useReducer
export type RelatedEntitiesState = {
  expandedRelationships: Set<string>; // Only used in User Mode
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
}


/**
 * Reducer function for RelatedEntities state management
 */
function relatedEntitiesReducer(
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
 * Displays related entities in a nested table format with expand/collapse functionality.
 * Uses EntityCard in row variant for each entity.
 * 
 * Features:
 * - Two-column layout (label + entities)
 * - Expand/collapse functionality
 * - Cycle prevention
 * - Lazy loading
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <RelatedEntities
 *   entity={jingle}
 *   entityType="jingle"
 *   relationships={jingleRelationships}
 *   entityPath={[jingle.id]}
 * />
 * ```
 */
export default function RelatedEntities({
  entity,
  entityType,
  relationships,
  entityPath = [],
  maxDepth = 5,
  className = '',
  isAdmin = false,
}: RelatedEntitiesProps) {
  // IMPORTANT: The entity prop is always pre-loaded by the parent component.
  // RelatedEntities only loads RELATED entities (via relationship.fetchFn calls),
  // never the root entity itself. This ensures proper separation of concerns and
  // allows parent pages to control loading states and error handling for the root entity.

  // Initialize state with useReducer (must be before early return)
  const initialState: RelatedEntitiesState = {
    expandedRelationships: entityPath.length === 0 && isAdmin
      ? new Set(relationships.map(rel => `${rel.label}-${rel.entityType}`))
      : new Set(),
    loadedData: {},
    loadingStates: {},
    counts: {},
    inFlightRequests: {},
    errors: {},
  };

  const [state, dispatch] = useReducer(relatedEntitiesReducer, initialState);

  // Track pending promises for request deduplication (Task 13)
  const pendingRequestsRef = useRef<Record<string, Promise<RelatedEntity[]>>>({});

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

  // Helper to create relationship key
  const getRelationshipKey = useCallback((rel: RelationshipConfig) => `${rel.label}-${rel.entityType}`, []);

  // Auto-load first level relationships on mount (Admin Mode only)
  useEffect(() => {
    if (entityPath.length === 0 && isAdmin && entity?.id) {
      // This is the top level in Admin Mode - auto-expand and load all relationships
      const loadRelationships = async () => {
        for (const rel of relationships) {
          const key = getRelationshipKey(rel);
          
          // Request deduplication (Task 13): Check if request already in flight
          if (pendingRequestsRef.current[key]) {
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
              
              const sorted = sortEntities(entities, rel.sortKey, rel.entityType);

              // Task 19: Disable cycle prevention in Admin Mode
              // In Admin Mode, show all entities even if they appear in entityPath
              // In User Mode, filter out entities in path to prevent cycles
              const filtered = isAdmin 
                ? sorted 
                : sorted.filter((e) => !entityPath.includes(e.id));

              // Update count based on actual loaded entities
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
              
              console.error(`Error loading ${rel.label}:`, error);
              dispatch({
                type: 'LOAD_ERROR',
                key,
                error: error instanceof Error ? error : new Error(String(error)),
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
  }, [isAdmin, entity?.id, cancelInFlightRequest, getRelationshipKey]); // Run on mount for top level, and when isAdmin changes

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
        if (pendingRequestsRef.current[key]) {
          // Request already in progress, await it
          try {
            await pendingRequestsRef.current[key];
          } catch {
            // Error already handled in the promise
          }
          return;
        }

        if (!state.loadedData[key] && !state.loadingStates[key]) {
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
              
              const sorted = sortEntities(entities, rel.sortKey, rel.entityType);

              // Task 19: Disable cycle prevention in Admin Mode
              // In Admin Mode, show all entities even if they appear in entityPath
              // In User Mode, filter out entities in path to prevent cycles
              const filtered = isAdmin 
                ? sorted 
                : sorted.filter((e) => !entityPath.includes(e.id));

              // Update count based on actual loaded entities
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
              
              console.error(`Error loading ${rel.label}:`, error);
              dispatch({
                type: 'LOAD_ERROR',
                key,
                error: error instanceof Error ? error : new Error(String(error)),
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
    [entity?.id, entityType, entityPath, state.loadedData, state.loadingStates, state.expandedRelationships, getRelationshipKey, cancelInFlightRequest]
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

  // Filter relationships - only show if entity has that relationship
  // For now, we'll show all configured relationships and let them be empty
  const visibleRelationships = relationships.filter(() => {
    // Could add logic here to hide relationships that don't exist
    // For now, show all configured relationships
    return true;
  });

  if (visibleRelationships.length === 0) {
    return null;
  }

  return (
    <div className={`related-entities ${className}`}>
      <table className="related-entities__table">
        <tbody>
          {visibleRelationships.map((rel) => {
            const key = getRelationshipKey(rel);
            // Task 17: In Admin Mode, always show expanded (no collapse/expand UI)
            const isExpanded = isAdmin ? true : state.expandedRelationships.has(key);
            const isLoading = state.loadingStates[key] || false;
            const entities = state.loadedData[key] || [];
            // Use entities.length if we have loaded data, otherwise use count if available
            const count = entities.length > 0 ? entities.length : (state.counts[key] || 0);

            return (
              <tr key={key} className={`related-entities__row ${isAdmin ? 'related-entities__row--admin' : ''}`}>
                <td className="related-entities__label-col">{rel.label}:</td>
                <td className="related-entities__data-col">
                  {!isExpanded ? (
                    // Collapsed: show count (only in User Mode)
                    <div className="related-entities__collapsed">
                      {count > 0 ? (
                        <span className="related-entities__count">{count} {rel.label.toLowerCase()}</span>
                      ) : (
                        <span className="related-entities__empty">—</span>
                      )}
                      {/* Task 17: Hide expand button in Admin Mode */}
                      {!isAdmin && rel.expandable && canExpand && (
                        <button
                          className="related-entities__expand-btn"
                          onClick={() => handleToggleRelationship(rel)}
                          aria-label="Expandir"
                          title="Expandir"
                        >
                          ▼
                        </button>
                      )}
                    </div>
                  ) : (
                    // Expanded: show entity list
                    <div className="related-entities__expanded">
                      {isLoading && entities.length === 0 ? (
                        <div className="related-entities__loading">Cargando...</div>
                      ) : entities.length === 0 ? (
                        <div className="related-entities__empty">No hay entidades relacionadas</div>
                      ) : (
                        <>
                          {entities.map((relatedEntity) => {
                            // Task 20: In Admin Mode, don't show nested relationships (limit nesting depth)
                            const hasNested = isAdmin ? false : (rel.expandable && canExpand);
                            const relatedEntityPath = [...entityPath, relatedEntity.id];

                            return (
                              <div key={relatedEntity.id} className="related-entities__entity-row">
                                <EntityCard
                                  entity={relatedEntity}
                                  entityType={rel.entityType}
                                  variant="row"
                                  hasNestedEntities={hasNested}
                                  isExpanded={false}
                                  onToggleExpand={() => {
                                    // Nested expansion is handled by recursive RelatedEntities component below
                                    // This toggle is not needed for the EntityCard itself in this context
                                  }}
                                />
                                {/* Task 20: Recursive nested RelatedEntities - disabled in Admin Mode */}
                                {hasNested && canExpand && !isAdmin && (
                                  <RelatedEntities
                                    entity={relatedEntity}
                                    entityType={rel.entityType}
                                    relationships={getRelationshipsForEntityType(rel.entityType)}
                                    entityPath={relatedEntityPath}
                                    maxDepth={maxDepth}
                                    className="related-entities__nested"
                                    isAdmin={isAdmin}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}
                      {/* Task 18: Add blank row for Admin Mode (placeholder for adding new relationships) */}
                      {isAdmin && (
                        <div className="related-entities__blank-row" title="Fila en blanco para agregar nueva relación (funcionalidad futura)">
                          <div className="related-entities__empty">+ Agregar {rel.label.toLowerCase()}</div>
                        </div>
                      )}
                      {/* Task 17: Hide collapse button in Admin Mode */}
                      {!isAdmin && rel.expandable && (
                        <button
                          className="related-entities__collapse-btn"
                          onClick={() => handleToggleRelationship(rel)}
                          aria-label="Colapsar"
                          title="Colapsar"
                        >
                          ▲
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

