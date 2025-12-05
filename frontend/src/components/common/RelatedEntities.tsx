import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import EntityCard, { type EntityType } from './EntityCard';
import FilterSwitch from './FilterSwitch';
import type { Artista, Cancion, Fabrica, Jingle, Tematica, Relationship } from '../../types';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { clearJingleRelationshipsCache } from '../../lib/services/relationshipService';
import { useToast } from './ToastContext';
import EntitySearchAutocomplete from '../admin/EntitySearchAutocomplete';
import DeleteRelationshipModal from '../admin/DeleteRelationshipModal';
import { getEntityTypeFromId } from '../../lib/utils/entityTypeUtils';

// Helper to get entity route (duplicated from EntityCard to avoid circular dependency)
function getEntityRoute(entityType: EntityType, entityId: string): string {
  const routeMap: Record<EntityType, string> = {
    fabrica: `/f/${entityId}`,
    jingle: `/j/${entityId}`,
    cancion: `/c/${entityId}`,
    artista: `/a/${entityId}`,
    tematica: `/t/${entityId}`,
  };
  return routeMap[entityType];
}
import { sortEntities } from '../../lib/utils/entitySorters';
import { adminApi, publicApi } from '../../lib/api/client';
import { parseTimestampFromText } from '../../lib/utils/timestampParser';
import { parseTimestampToSeconds } from '../../lib/utils/timestamp';
import { extractRelationshipData } from '../../lib/utils/relationshipDataExtractor';
import type { Jingle } from '../../types';
import '../../styles/components/related-entities.css';

export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;

/**
 * Map relationship config to API relationship type
 * Based on entity type and relationship label
 */
function getRelationshipTypeForAPI(
  currentEntityType: EntityType,
  relationshipLabel: string,
  targetEntityType: EntityType
): string | null {
  // Map based on current entity type and target entity type
  const mapping: Record<string, Record<string, string>> = {
    jingle: {
      fabrica: 'appears_in',
      cancion: 'versiona',
      artista: relationshipLabel.toLowerCase() === 'autor' ? 'autor_de' : 'jinglero_de',
      tematica: 'tagged_with',
      jingle: 'repeats',
    },
    fabrica: {
      jingle: 'appears_in',
    },
    cancion: {
      artista: 'autor_de',
      jingle: 'versiona',
    },
    artista: {
      cancion: 'autor_de',
      jingle: 'jinglero_de',
    },
    tematica: {
      jingle: 'tagged_with',
    },
  };

  return mapping[currentEntityType]?.[targetEntityType] || null;
}

// Type for relationship property values (can be string, number, boolean, null, or undefined)
type RelationshipPropertyValue = string | number | boolean | null | undefined;
type RelationshipProperties = Record<string, RelationshipPropertyValue>;
type RelationshipPropsMap = Record<string, RelationshipProperties>;
type TimestampMap = Record<string, { h: number; m: number; s: number }>;

function cloneRelationshipPropsMap(source: RelationshipPropsMap): RelationshipPropsMap {
  const result: RelationshipPropsMap = {};
  Object.entries(source).forEach(([key, props]) => {
    result[key] = { ...props };
  });
  return result;
}

function buildTimestampTimesFromProps(source: RelationshipPropsMap): TimestampMap {
  const result: TimestampMap = {};
  Object.entries(source).forEach(([key, props]) => {
    const timestamp = props.timestamp;
    if (timestamp !== undefined && timestamp !== null && !Number.isNaN(Number(timestamp))) {
      const totalSeconds = Math.floor(Number(timestamp));
      result[key] = {
        h: Math.floor(totalSeconds / 3600),
        m: Math.floor((totalSeconds % 3600) / 60),
        s: totalSeconds % 60,
      };
    }
  });
  return result;
}

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
  /** Phase 3: Maximum cardinality for this relationship (undefined = unlimited) */
  maxCardinality?: number;
  /** Phase 5: Whether this relationship is read-only (derived, cannot be edited) */
  isReadOnly?: boolean;
  /** Phase 5: Tooltip text explaining why relationship is read-only */
  readOnlyReason?: string;
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
  /**
   * Whether the parent entity is in edit mode (affects relationship property editing)
   */
  isEditing?: boolean;
  /**
   * Callback to toggle edit mode (called when user clicks "+ Agregar" to enter edit mode)
   */
  onEditToggle?: (editing: boolean) => void;
  /**
   * Callback to get relationship properties that need to be saved
   * Returns a map of relationship keys to their properties
   */
  onGetRelationshipProperties?: () => Record<string, { relType: string; startId: string; endId: string; properties: RelationshipProperties }>;
  /**
   * Callback to check if there are unsaved changes
   */
  onCheckUnsavedChanges?: () => boolean;
  /**
   * Callback to handle navigation to a related entity (with unsaved changes check)
   */
  onNavigateToEntity?: (entityType: EntityType, entityId: string) => void;
  /**
   * Callback to notify parent when relationship property changes occur
   */
  onChange?: (hasChanges: boolean) => void;
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
const RelatedEntities = forwardRef<{ 
  getRelationshipProperties: () => Record<string, { relType: string; startId: string; endId: string; properties: RelationshipProperties }>;
  refresh: () => Promise<void>;
  hasUnsavedChanges: () => boolean;
  clearUnsavedChanges: (options?: { commit?: boolean }) => void;
}, RelatedEntitiesProps>(function RelatedEntities({
  entity,
  entityType,
  relationships,
  entityPath = [],
  maxDepth = 5,
  className = '',
  isAdmin = false,
  initialRelationshipData = {},
  isEditing = false,
  onEditToggle: _onEditToggle, // eslint-disable-line @typescript-eslint/no-unused-vars
  onGetRelationshipProperties: _onGetRelationshipProperties, // eslint-disable-line @typescript-eslint/no-unused-vars
  onCheckUnsavedChanges: _onCheckUnsavedChanges, // eslint-disable-line @typescript-eslint/no-unused-vars
  onNavigateToEntity,
  onChange,
}, ref) {
  // Debug: Log isEditing prop changes
  useEffect(() => {
    console.log('[RelatedEntities] isEditing prop changed:', {
      isEditing,
      isAdmin,
      entityId: entity?.id,
      entityType,
      timestamp: new Date().toISOString(),
    });
  }, [isEditing, isAdmin, entity?.id, entityType]);
  const { showToast } = useToast();
  // IMPORTANT: The entity prop is always pre-loaded by the parent component.
  // RelatedEntities only loads RELATED entities (via relationship.fetchFn calls),
  // never the root entity itself. This ensures proper separation of concerns and
  // allows parent pages to control loading states and error handling for the root entity.

  // Helper to create relationship key (needed for initial data processing)
  const getRelationshipKey = useCallback((rel: RelationshipConfig) => `${rel.label}-${rel.entityType}`, []);

  // State for relationship property editing
  const [selectedEntityForRelationship, setSelectedEntityForRelationship] = useState<{
    key: string;
    entity: RelatedEntity;
  } | null>(null);
  const [relationshipProperties, setRelationshipProperties] = useState<RelationshipProperties>({});
  
  // State for expanded relationship properties in admin mode (key: `${entityId}-${relationshipKey}`)
  const [expandedRelationshipProps, setExpandedRelationshipProps] = useState<Set<string>>(new Set());
  const [relationshipPropsData, setRelationshipPropsData] = useState<RelationshipPropsMap>({});
  const [relationshipPropsInitialData, setRelationshipPropsInitialData] = useState<RelationshipPropsMap>({});
  // State for timestamp editing (HH, MM, SS) - key: `${entityId}-${relationshipKey}`
  const [timestampTimes, setTimestampTimes] = useState<TimestampMap>({});
  
  // Phase 6: State for delete relationship modal
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    relationshipType: string | null;
    startId: string | null;
    endId: string | null;
    entityName: string | null;
  }>({
    isOpen: false,
    relationshipType: null,
    startId: null,
    endId: null,
    entityName: null,
  });

  // Get relationship properties schema for a relationship type
  const getRelationshipPropertiesSchema = useCallback((relType: string): Array<{ name: string; type: string; label: string; required?: boolean; options?: string[] }> => {
    const schemas: Record<string, Array<{ name: string; type: string; label: string; required?: boolean; options?: string[] }>> = {
      appears_in: [
        { name: 'order', type: 'number', label: 'Orden', required: false },
        { name: 'timestamp', type: 'number', label: 'Timestamp (segundos)', required: false },
      ],
      versiona: [
        { name: 'status', type: 'select', label: 'Estado', required: false, options: ['DRAFT', 'CONFIRMED'] },
      ],
      jinglero_de: [
        { name: 'status', type: 'select', label: 'Estado', required: false, options: ['DRAFT', 'CONFIRMED'] },
      ],
      autor_de: [
        { name: 'status', type: 'select', label: 'Estado', required: false, options: ['DRAFT', 'CONFIRMED'] },
      ],
      tagged_with: [
        { name: 'isPrimary', type: 'boolean', label: 'Es Primaria', required: false },
        { name: 'status', type: 'select', label: 'Estado', required: false, options: ['DRAFT', 'CONFIRMED'] },
      ],
      repeats: [
        { name: 'status', type: 'select', label: 'Estado', required: false, options: ['DRAFT', 'CONFIRMED'] },
      ],
    };
    return schemas[relType] || [];
  }, []);

  // Handle entity selection - show property form instead of immediately creating
  const handleSelectEntity = useCallback((key: string, selectedEntity: RelatedEntity) => {
    const rel = relationships.find(r => getRelationshipKey(r) === key);
    if (!rel || !entity?.id) return;

    const relType = getRelationshipTypeForAPI(entityType, rel.label, rel.entityType);
    if (!relType) {
      console.error('Could not determine relationship type');
      return;
    }

    // Set selected entity and initialize properties
    setSelectedEntityForRelationship({ key, entity: selectedEntity });
    const schema = getRelationshipPropertiesSchema(relType);
    const initialProperties: RelationshipProperties = {};
    schema.forEach(prop => {
      if (prop.type === 'boolean') {
        initialProperties[prop.name] = false;
      } else if (prop.type === 'select') {
        initialProperties[prop.name] = 'DRAFT';
      } else {
        initialProperties[prop.name] = '';
      }
    });
    setRelationshipProperties(initialProperties);
  }, [entity, entityType, relationships, getRelationshipKey, getRelationshipPropertiesSchema]);

  // Handle relationship creation with properties
  const handleCreateRelationship = useCallback(async () => {
    console.log('[RelatedEntities] handleCreateRelationship called', {
      selectedEntityForRelationship,
      entityId: entity?.id,
      entityType,
      isEditing,
      timestamp: new Date().toISOString(),
    });
    
    if (!selectedEntityForRelationship || !entity?.id) {
      console.warn('[RelatedEntities] Cannot create relationship: missing selectedEntityForRelationship or entity.id');
      return;
    }

    const { key, entity: selectedEntity } = selectedEntityForRelationship;
    const rel = relationships.find(r => getRelationshipKey(r) === key);
    if (!rel) {
      console.warn('[RelatedEntities] Cannot create relationship: relationship config not found for key', key);
      return;
    }

    const relType = getRelationshipTypeForAPI(entityType, rel.label, rel.entityType);
    if (!relType) {
      console.error('[RelatedEntities] Could not determine relationship type', {
        entityType,
        relLabel: rel.label,
        relEntityType: rel.entityType,
      });
      return;
    }
    
    console.log('[RelatedEntities] Relationship type determined:', relType);

    // Determine start and end based on relationship direction
    let startId: string;
    let endId: string;
    
    if (relType === 'appears_in') {
      // APPEARS_IN: (Jingle)-[APPEARS_IN]->(Fabrica)
      // Jingle is always start, Fabrica is always end
      if (entityType === 'jingle') {
        startId = entity.id; // Jingle (current entity)
        endId = selectedEntity.id; // Fabrica (selected entity)
      } else if (entityType === 'fabrica') {
        startId = selectedEntity.id; // Jingle (selected entity)
        endId = entity.id; // Fabrica (current entity)
      } else {
        startId = entity.id;
        endId = selectedEntity.id;
      }
    } else if (relType === 'versiona') {
      // VERSIONA: (Jingle)-[VERSIONA]->(Cancion)
      // Jingle is always start, Cancion is always end
      // Dynamically determine which entity is which based on current page
      if (entityType === 'jingle') {
        // We're on a Jingle page, adding a Cancion
        startId = entity.id; // Jingle (current entity)
        endId = selectedEntity.id; // Cancion (selected entity)
      } else if (entityType === 'cancion') {
        // We're on a Cancion page, adding a Jingle
        startId = selectedEntity.id; // Jingle (selected entity)
        endId = entity.id; // Cancion (current entity)
      } else {
        // Fallback (shouldn't happen, but just in case)
        startId = entity.id;
        endId = selectedEntity.id;
      }
    } else if (relType === 'jinglero_de' || relType === 'autor_de') {
      // JINGLERO_DE: (Artista)-[JINGLERO_DE]->(Jingle)
      // AUTOR_DE: (Artista)-[AUTOR_DE]->(Cancion)
      // Artista is always start, Jingle/Cancion is always end
      if (entityType === 'artista') {
        startId = entity.id; // Artista (current entity)
        endId = selectedEntity.id; // Jingle/Cancion (selected entity)
      } else if (entityType === 'jingle' || entityType === 'cancion') {
        startId = selectedEntity.id; // Artista (selected entity)
        endId = entity.id; // Jingle/Cancion (current entity)
      } else {
        startId = entity.id;
        endId = selectedEntity.id;
      }
      console.log(`[DEBUG] Creating ${relType} relationship:`, {
        entityType,
        relEntityType: rel.entityType,
        startId,
        endId,
        startIsArtista: rel.entityType === 'artista' ? selectedEntity.id : entity.id,
        endIsCancionOrJingle: rel.entityType === 'artista' ? entity.id : selectedEntity.id,
      });
    } else if (relType === 'tagged_with') {
      // TAGGED_WITH: (Jingle)-[TAGGED_WITH]->(Tematica)
      // Jingle is always the start node, Tematica is always the end node
      if (entityType === 'jingle') {
        // We're on a Jingle page, adding a Tematica
        startId = entity.id; // Jingle (current entity)
        endId = selectedEntity.id; // Tematica (selected entity)
      } else if (entityType === 'tematica') {
        // We're on a Tematica page, adding a Jingle
        startId = selectedEntity.id; // Jingle (selected entity)
        endId = entity.id; // Tematica (current entity)
      } else {
        // Fallback (shouldn't happen, but just in case)
        startId = entity.id;
        endId = selectedEntity.id;
      }
    } else {
      // Default: current entity is start, selected entity is end
      startId = entity.id;
      endId = selectedEntity.id;
    }

    // Parse timestamp from Jingle's comment if creating APPEARS_IN relationship
    // Store as seconds (integer) for API, but keep original string for UI display
    let parsedTimestampFromComment: number | null = null;
    let parsedTimestampString: string | null = null;
    if (relType === 'appears_in') {
      console.log('[RelatedEntities] Checking for timestamp in Jingle comment:', {
        entityType,
        relEntityType: rel.entityType,
        entityId: entity.id,
        selectedEntityId: selectedEntity.id,
      });
      
      // Determine which entity is the Jingle and get its ID
      const jingleId: string | null = 
        entityType === 'jingle' ? entity.id :
        rel.entityType === 'jingle' ? selectedEntity.id :
        null;

      // Get the Jingle entity (may be partial from search, so we might need to fetch full entity)
      let jingleEntity: Jingle | null = 
        entityType === 'jingle' ? (entity as Jingle) :
        rel.entityType === 'jingle' ? (selectedEntity as Jingle) :
        null;

      // If we have a Jingle ID but the entity doesn't exist or doesn't have a comment, fetch the full entity
      if (jingleId && (!jingleEntity || !jingleEntity.comment)) {
        console.log('[RelatedEntities] Jingle entity missing or missing comment, fetching full entity:', {
          jingleId,
          hasEntity: !!jingleEntity,
          hasComment: !!jingleEntity?.comment,
        });
        try {
          const fullJingle = await adminApi.getJingle(jingleId);
          jingleEntity = fullJingle;
          console.log('[RelatedEntities] Fetched full Jingle entity:', {
            jingleId: fullJingle.id,
            hasComment: !!fullJingle.comment,
            comment: fullJingle.comment,
          });
        } catch (error) {
          console.error('[RelatedEntities] Error fetching full Jingle entity:', error);
          // Continue with partial entity if fetch fails, or set to null if we didn't have one
          if (!jingleEntity) {
            jingleEntity = null;
          }
        }
      }

      console.log('[RelatedEntities] Jingle entity determined:', {
        jingleEntity: jingleEntity ? { 
          id: jingleEntity.id, 
          hasComment: !!jingleEntity.comment, 
          comment: jingleEntity.comment,
          commentType: typeof jingleEntity.comment,
          commentLength: jingleEntity.comment ? jingleEntity.comment.length : 0,
        } : null,
      });

      if (jingleEntity && jingleEntity.comment) {
        // Check if timestamp should be overridden
        const currentTimestamp = relationshipProperties.timestamp;
        const shouldOverride = 
          currentTimestamp === null ||
          currentTimestamp === undefined ||
          currentTimestamp === '' ||
          currentTimestamp === '00:00:00' ||
          currentTimestamp === 0 ||
          (typeof currentTimestamp === 'string' && currentTimestamp.trim() === '00:00:00');

        if (shouldOverride) {
          // Parse timestamp from Jingle's comment (returns HH:MM:SS string)
          parsedTimestampString = parseTimestampFromText(jingleEntity.comment);
          
          if (parsedTimestampString) {
            // Convert HH:MM:SS string to seconds (integer) for API
            try {
              parsedTimestampFromComment = parseTimestampToSeconds(parsedTimestampString);
              console.log('[RelatedEntities] Parsed timestamp from Jingle comment:', {
                jingleId: jingleEntity.id,
                comment: jingleEntity.comment,
                parsedTimestampString: parsedTimestampString,
                parsedTimestampSeconds: parsedTimestampFromComment,
              });
              // Update relationshipProperties state for UI display (store as seconds)
              setRelationshipProperties(prev => ({
                ...prev,
                timestamp: parsedTimestampFromComment,
              }));
            } catch (error) {
              console.error('[RelatedEntities] Error converting parsed timestamp to seconds:', error);
              parsedTimestampFromComment = null;
              parsedTimestampString = null;
            }
          } else {
            console.log('[RelatedEntities] No valid timestamp found in Jingle comment:', {
              jingleId: jingleEntity.id,
              comment: jingleEntity.comment,
            });
          }
        } else {
          console.log('[RelatedEntities] Timestamp already set, not overriding:', {
            currentTimestamp,
            jingleId: jingleEntity.id,
          });
        }
      }
    }

    // Prepare properties - convert empty strings to null/undefined, convert numbers
    // Use parsed timestamp from comment if available, otherwise use relationshipProperties
    const properties: RelationshipProperties = {};
    Object.entries(relationshipProperties).forEach(([key, value]) => {
      // Override timestamp with parsed value if available
      if (key === 'timestamp' && parsedTimestampFromComment !== null) {
        // Use the parsed timestamp (already converted to seconds/integer)
        // The backend expects integer (seconds) format for APPEARS_IN relationships
        properties[key] = parsedTimestampFromComment;
      } else if (value === '' || value === null || value === undefined) {
        // Skip empty values
      } else if ((key === 'order' || key === 'timestamp') && (typeof value === 'string' || typeof value === 'number')) {
        const numValue = typeof value === 'string' ? Number(value) : value;
        if (!isNaN(numValue)) {
          properties[key] = numValue;
        }
      } else {
        properties[key] = value;
      }
    });
    
    // If we parsed a timestamp but it wasn't in relationshipProperties, add it (as seconds)
    if (parsedTimestampFromComment !== null && !('timestamp' in properties)) {
      properties.timestamp = parsedTimestampFromComment; // Already in seconds
    }

    let relationshipCreated = false;
    const apiPayload = {
      start: startId,
      end: endId,
      ...properties,
    };
    
    console.log('[RelatedEntities] Creating relationship via API:', {
      endpoint: `/relationships/${relType}`,
      payload: apiPayload,
      timestamp: new Date().toISOString(),
    });
    
    try {
      const response = await adminApi.post(`/relationships/${relType}`, apiPayload);
      console.log('[RelatedEntities] Relationship created successfully:', {
        response,
        relType,
        startId,
        endId,
        timestamp: new Date().toISOString(),
      });
      relationshipCreated = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[RelatedEntities] Error creating relationship:', {
        error,
        errorMessage,
        relType,
        startId,
        endId,
        payload: apiPayload,
        timestamp: new Date().toISOString(),
      });
      
      // If relationship already exists, try to update it with the parsed timestamp if we have one
      if (errorMessage.includes('already exists') || errorMessage.includes('Relationship already exists')) {
        console.log('[RelatedEntities] Relationship already exists');
        
        // If we parsed a timestamp from the comment, update the existing relationship
        if (parsedTimestampFromComment !== null && relType === 'appears_in') {
          console.log('[RelatedEntities] Updating existing relationship with parsed timestamp:', {
            relType,
            startId,
            endId,
            parsedTimestampSeconds: parsedTimestampFromComment,
            parsedTimestampString: parsedTimestampString,
          });
          
          try {
            await adminApi.updateRelationship(relType, startId, endId, {
              timestamp: parsedTimestampFromComment,
            });
            console.log('[RelatedEntities] Successfully updated relationship timestamp');
            relationshipCreated = true;
          } catch (updateError) {
            const updateErrorMessage = updateError instanceof Error ? updateError.message : 'Error desconocido';
            console.error('[RelatedEntities] Error updating relationship timestamp:', updateErrorMessage);
            showToast(`Error al actualizar el timestamp: ${updateErrorMessage}`, 'error');
            // Still refresh to show the existing relationship
            relationshipCreated = true;
          }
        } else {
          console.log('[RelatedEntities] Relationship already exists, refreshing to show it');
          relationshipCreated = true; // Treat as success for refresh purposes
        }
      } else {
        showToast(`Error al crear la relación: ${errorMessage}`, 'error');
        return; // Don't refresh if there was a real error
      }
    }

    // Clear cache for jingles involved in this relationship to ensure fresh data
    // This is important because fetchJingleAllRelationships caches responses
    // For tagged_with: Jingle -> Tematica, so startId is always the jingle
    // For other relationships, check both start and end entities
    if (relType === 'tagged_with') {
      // TAGGED_WITH is always Jingle -> Tematica, so startId is the jingle
      clearJingleRelationshipsCache(startId);
    } else {
      // For other relationships, clear cache if either entity is a jingle
      if (entityType === 'jingle') {
        clearJingleRelationshipsCache(entity.id);
      }
      if (rel.entityType === 'jingle' && selectedEntity.id) {
        clearJingleRelationshipsCache(selectedEntity.id);
      }
    }

    // Refresh the relationship data (whether newly created or already existed)
    if (relationshipCreated) {
      console.log('[RelatedEntities] Starting refresh after relationship creation', {
        key,
        relType,
        entityId: entity.id,
        entityType,
        timestamp: new Date().toISOString(),
      });
      
      // For jingles, ensure cache is cleared before fetching
      // We already cleared it above, but do it again here to be safe
      if (relType === 'tagged_with' && entityType === 'jingle') {
        clearJingleRelationshipsCache(entity.id);
        console.log('[RelatedEntities] Cleared jingle relationships cache for', entity.id);
      }
      
      const fetchFn = rel.fetchFn;
      // Add a small delay to ensure cache clearing has taken effect
      // This is especially important if there are pending requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[RelatedEntities] Fetching relationship data...', {
        key,
        entityId: entity.id,
        entityType,
      });
      
      const entities = await fetchFn(entity.id, entityType);
      
      console.log(`[RelatedEntities] Refreshed ${key} relationship data:`, {
        entityId: entity.id,
        entityType,
        relType,
        entitiesCount: entities.length,
        entities: entities.map(e => {
          const name = 'name' in e ? e.name : 'title' in e ? e.title : e.id;
          return { id: e.id, name: name || e.id };
        }),
        timestamp: new Date().toISOString(),
      });
      
      dispatch({
        type: 'LOAD_SUCCESS',
        key,
        data: entities,
        count: entities.length,
      });
      
      console.log('[RelatedEntities] Dispatched LOAD_SUCCESS, relationship should now be visible');

      // Reset all state
      setSelectedEntityForRelationship(null);
      setRelationshipProperties({});
    }
  }, [selectedEntityForRelationship, entity, entityType, relationships, relationshipProperties, getRelationshipKey, showToast, isEditing]);

  // Phase 6: Handle opening delete confirmation modal
  const handleDeleteRelationshipClick = useCallback((relatedEntityId: string, relatedEntityName: string, relLabel: string, relEntityType: EntityType) => {
    const relType = getRelationshipTypeForAPI(entityType, relLabel, relEntityType);
    if (!relType || !entity?.id) return;

    // Determine start and end IDs based on relationship direction
    let startId: string;
    let endId: string;
    
    if (relType === 'appears_in') {
      // APPEARS_IN: (Jingle)-[APPEARS_IN]->(Fabrica)
      if (entityType === 'jingle') {
        startId = entity.id; // Jingle (current entity)
        endId = relatedEntityId; // Fabrica (related entity)
      } else if (entityType === 'fabrica') {
        startId = relatedEntityId; // Jingle (related entity)
        endId = entity.id; // Fabrica (current entity)
      } else {
        startId = entity.id;
        endId = relatedEntityId;
      }
    } else if (relType === 'versiona') {
      // VERSIONA: (Jingle)-[VERSIONA]->(Cancion)
      if (entityType === 'jingle') {
        startId = entity.id; // Jingle (current entity)
        endId = relatedEntityId; // Cancion (related entity)
      } else if (entityType === 'cancion') {
        startId = relatedEntityId; // Jingle (related entity)
        endId = entity.id; // Cancion (current entity)
      } else {
        startId = entity.id;
        endId = relatedEntityId;
      }
    } else if (relType === 'jinglero_de' || relType === 'autor_de') {
      // JINGLERO_DE: (Artista)-[JINGLERO_DE]->(Jingle)
      // AUTOR_DE: (Artista)-[AUTOR_DE]->(Cancion)
      if (entityType === 'artista') {
        startId = entity.id; // Artista (current entity)
        endId = relatedEntityId; // Jingle/Cancion (related entity)
      } else if (entityType === 'jingle' || entityType === 'cancion') {
        startId = relatedEntityId; // Artista (related entity)
        endId = entity.id; // Jingle/Cancion (current entity)
      } else {
        startId = entity.id;
        endId = relatedEntityId;
      }
    } else if (relType === 'tagged_with') {
      // TAGGED_WITH: (Jingle)-[TAGGED_WITH]->(Tematica)
      // Jingle is always the start node, Tematica is always the end node
      if (entityType === 'jingle') {
        // We're on a Jingle page, deleting relationship to a Tematica
        startId = entity.id; // Jingle (current entity)
        endId = relatedEntityId; // Tematica (related entity)
      } else if (entityType === 'tematica') {
        // We're on a Tematica page, deleting relationship from a Jingle
        startId = relatedEntityId; // Jingle (related entity)
        endId = entity.id; // Tematica (current entity)
      } else {
        // Fallback (shouldn't happen, but just in case)
        startId = entity.id;
        endId = relatedEntityId;
      }
    } else {
      // Default: current entity is start, related entity is end
      startId = entity.id;
      endId = relatedEntityId;
    }

    setDeleteModalState({
      isOpen: true,
      relationshipType: relType,
      startId,
      endId,
      entityName: relatedEntityName,
    });
  }, [entity, entityType]);

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

  // Refresh all relationships - re-fetches all relationship data
  const refresh = useCallback(async () => {
    if (!entity?.id || !relationships || relationships.length === 0) return;
    
    // Refresh all relationships
    for (const rel of relationships) {
      if (!rel || !rel.fetchFn) continue;
      const key = getRelationshipKey(rel);
      const cacheKey = getCacheKey(entity.id, entityType, key);
      
      // Cancel any in-flight requests
      cancelInFlightRequest(key);
      
      // Clear cache for this relationship
      delete requestCacheRef.current[cacheKey];
      delete pendingRequestsRef.current[key];
      
      // Clear jingle cache if applicable
      const relType = getRelationshipTypeForAPI(entityType, rel.label, rel.entityType);
      if (relType === 'tagged_with' && entityType === 'jingle') {
        clearJingleRelationshipsCache(entity.id);
      } else if (entityType === 'jingle') {
        clearJingleRelationshipsCache(entity.id);
      } else if (rel.entityType === 'jingle') {
        // If the related entity type is jingle, we can't clear its cache here
        // but we'll clear our own cache which should be sufficient
      }
      
      // Create abort controller for this request
      const abortController = new AbortController();
      dispatch({ type: 'LOAD_START', key, abortController });
      
      try {
        // Add a small delay to ensure cache clearing has taken effect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch fresh data
        let entities = await rel.fetchFn(entity.id, entityType);
        
        // Check if request was aborted
        if (abortController.signal.aborted) {
          continue; // Skip this relationship but continue with others
        }
        
        // Refresh jingles with blank songTitle
        if (rel.entityType === 'jingle') {
          const refreshedEntities = await Promise.all(
            entities.map(async (e) => {
              const jingle = e as Jingle;
              // If songTitle is blank and title is also blank, trigger refresh
              if (!jingle.title && !jingle.songTitle) {
                try {
                  // Clear cache and fetch again to get updated songTitle (backend auto-syncs it)
                  clearJingleRelationshipsCache(jingle.id);
                  const refreshed = await publicApi.getJingle(jingle.id) as Jingle;
                  return refreshed;
                } catch (refreshErr) {
                  console.warn(`Failed to refresh jingle ${jingle.id}:`, refreshErr);
                  return jingle; // Return original if refresh fails
                }
              }
              return jingle;
            })
          );
          entities = refreshedEntities;
        }
        
        // Sort entities
        const sorted = sortEntities(entities, rel.sortKey, rel.entityType);
        
        // Filter entities (cycle prevention in User Mode only)
        const filtered = isAdmin 
          ? sorted 
          : sorted.filter((e) => !entityPath.includes(e.id));
        
        // Store in cache
        requestCacheRef.current[cacheKey] = filtered;
        
        // Update state with fresh data
        dispatch({
          type: 'LOAD_SUCCESS',
          key,
          data: filtered,
          count: filtered.length,
        });
      } catch (error) {
        // Handle AbortError gracefully
        if (error instanceof Error && error.name === 'AbortError') {
          continue; // Skip this relationship but continue with others
        }
        
        // Create user-friendly error message
        const errorMessage = error instanceof Error 
          ? error.message || 'Error desconocido'
          : String(error) || 'Error desconocido';
        
        const friendlyError = new Error(errorMessage);
        friendlyError.name = error instanceof Error ? error.name : 'Error';
        
        console.error(`Error refreshing ${rel.label}:`, error);
        dispatch({
          type: 'LOAD_ERROR',
          key,
          error: friendlyError,
        });
      } finally {
        // Clean up pending promise
        delete pendingRequestsRef.current[key];
      }
    }
  }, [entity, entityType, relationships, getRelationshipKey, getCacheKey, cancelInFlightRequest, isAdmin, entityPath, dispatch]);

  // Phase 6: Execute relationship deletion
  const handleConfirmDelete = useCallback(async () => {
    const { relationshipType, startId, endId } = deleteModalState;
    if (!relationshipType || !startId || !endId) return;

    try {
      await adminApi.deleteRelationship(relationshipType, startId, endId);
      showToast('Relación eliminada correctamente', 'success');
      
      // Clear cache for jingles involved
      if (relationshipType === 'tagged_with') {
        clearJingleRelationshipsCache(startId);
      } else {
        if (entityType === 'jingle') {
          clearJingleRelationshipsCache(entity.id);
        }
        // Check if the other entity is a jingle
        const otherEntityId = startId === entity.id ? endId : startId;
        clearJingleRelationshipsCache(otherEntityId);
      }
      
      // Refresh relationships to show updated data
      await refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error deleting relationship:', error);
      showToast(`Error al eliminar la relación: ${errorMessage}`, 'error');
    } finally {
      setDeleteModalState({
        isOpen: false,
        relationshipType: null,
        startId: null,
        endId: null,
        entityName: null,
      });
    }
  }, [deleteModalState, entity, entityType, refresh, showToast]);

  // (getRelationshipProperties moved below dirty-state helpers)

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

  // Task 5.4: Check for unsaved changes in relationships
  // Tracks: relationship property edits, pending timestamp edits, selected entities in blank rows
  const arePropsEqual = useCallback((a: RelationshipProperties | undefined, b: RelationshipProperties | undefined) => {
    const aEntries = Object.entries(a || {});
    const bEntries = Object.entries(b || {});
    
    if (aEntries.length !== bEntries.length) {
      return false;
    }
    
    for (const [key, value] of aEntries) {
      const other = b ? b[key] : undefined;
      if (value !== other) {
        return false;
      }
    }
    
    return true;
  }, []);
  
  const isRelationshipPropsDirty = useCallback((key: string) => {
    const currentProps = relationshipPropsData[key];
    if (!currentProps) {
      return false;
    }
    const initialProps = relationshipPropsInitialData[key];
    if (!initialProps) {
      return Object.values(currentProps).some(
        (value) => value !== null && value !== undefined && value !== ''
      );
    }
    return !arePropsEqual(initialProps, currentProps);
  }, [relationshipPropsData, relationshipPropsInitialData, arePropsEqual]);
  
  const hasUnsavedChanges = useCallback(() => {
    // Check for pending relationship property edits (only count diffs vs initial data)
    const hasDirtyRelationshipProps = Object.keys(relationshipPropsData).some(isRelationshipPropsDirty);
    if (hasDirtyRelationshipProps) {
      return true;
    }
    
    // Check for selected entity in blank row (pending relationship creation)
    if (selectedEntityForRelationship !== null) {
      return true;
    }
    
    return false;
  }, [relationshipPropsData, selectedEntityForRelationship, isRelationshipPropsDirty]);

  // Create relationship properties getter function (only returns dirty entries)
  const getRelationshipProperties = useCallback(() => {
    const result: Record<string, { relType: string; startId: string; endId: string; properties: RelationshipProperties }> = {};
    
    console.log('[RelatedEntities] getRelationshipProperties called:', {
      relationshipPropsDataKeys: Object.keys(relationshipPropsData),
      relationshipPropsData,
      entityType,
      entityId: entity?.id,
    });
    
    Object.entries(relationshipPropsData).forEach(([key, props]) => {
      if (!isRelationshipPropsDirty(key)) {
        return;
      }
      console.log(`[RelatedEntities] Processing key: ${key}, props:`, props);
      
      // Extract entityId and relationshipKey from key format: `${entityId}-${relationshipKey}`
      let relatedEntityId: string | null = null;
      let relationshipKey: string | null = null;
      let rel: RelationshipConfig | undefined = undefined;
      
      for (const relConfig of relationships) {
        const relKey = getRelationshipKey(relConfig);
        if (key.endsWith(`-${relKey}`)) {
          relationshipKey = relKey;
          rel = relConfig;
          relatedEntityId = key.slice(0, -(relKey.length + 1));
          console.log(`[RelatedEntities] Matched relationship key: ${relKey}, extracted entityId: ${relatedEntityId}`);
          break;
        }
      }
      
      if (!rel || !relatedEntityId || !relationshipKey) {
        console.warn(`[RelatedEntities] Could not match relationship for key: ${key}`);
      }
      
      if (rel && relatedEntityId && relationshipKey) {
        const relType = getRelationshipTypeForAPI(entityType, rel.label, rel.entityType);
        console.log(`[RelatedEntities] Relationship type: ${relType}, entity.id: ${entity?.id}`);
        
        if (relType && entity?.id) {
          // Determine start and end based on relationship direction
          let startId: string;
          let endId: string;
          
          if (relType === 'appears_in') {
            startId = entityType === 'jingle' ? entity.id : relatedEntityId;
            endId = entityType === 'jingle' ? relatedEntityId : entity.id;
          } else if (relType === 'versiona') {
            startId = entityType === 'jingle' ? entity.id : relatedEntityId;
            endId = entityType === 'jingle' ? relatedEntityId : entity.id;
          } else if (relType === 'jinglero_de' || relType === 'autor_de') {
            startId = entityType === 'artista' ? entity.id : relatedEntityId;
            endId = entityType === 'artista' ? relatedEntityId : entity.id;
          } else if (relType === 'tagged_with') {
            startId = entityType === 'jingle' ? entity.id : relatedEntityId;
            endId = entityType === 'jingle' ? relatedEntityId : entity.id;
          } else if (relType === 'repeats') {
            // REPEATS: Jingle -> Jingle (self-referential)
            // Direction is validated by API, but we pass IDs as-is
            startId = entity.id;
            endId = relatedEntityId;
          } else {
            startId = entity.id;
            endId = relatedEntityId;
          }
          
          console.log(`[RelatedEntities] Adding to result:`, {
            key,
            relType,
            startId,
            endId,
            properties: props,
          });
          
          result[key] = {
            relType,
            startId,
            endId,
            properties: props,
          };
        } else {
          console.warn(`[RelatedEntities] Missing relType or entity.id:`, { relType, entityId: entity?.id });
        }
      }
    });
    
    console.log('[RelatedEntities] getRelationshipProperties result:', result);
    return result;
  }, [relationshipPropsData, relationships, entity, entityType, getRelationshipKey, isRelationshipPropsDirty]);

  // Notify parent when relationship changes occur, but only if we're actually in editing mode
  // This prevents false positives when entering edit mode
  useEffect(() => {
    if (onChange && isEditing) {
      const hasChanges = hasUnsavedChanges();
      onChange(hasChanges);
    } else if (onChange && !isEditing) {
      // When not editing, explicitly notify parent that there are no changes
      onChange(false);
    }
  }, [relationshipPropsData, selectedEntityForRelationship, hasUnsavedChanges, onChange, isEditing]);

  // Clear all unsaved relationship changes (called after save or cancel)
  const clearUnsavedChanges = useCallback((options?: { commit?: boolean }) => {
    const commit = options?.commit ?? false;
    console.log('[RelatedEntities] clearUnsavedChanges called', { commit });
    
    if (commit) {
      const committedSnapshot = cloneRelationshipPropsMap(relationshipPropsData);
      setRelationshipPropsInitialData(committedSnapshot);
      setRelationshipPropsData(committedSnapshot);
      // Retain timestampTimes since they already reflect the committed values
    } else {
      const baselineSnapshot = cloneRelationshipPropsMap(relationshipPropsInitialData);
      setRelationshipPropsData(baselineSnapshot);
      setTimestampTimes(buildTimestampTimesFromProps(relationshipPropsInitialData));
    }
    
    setSelectedEntityForRelationship(null);
    
    // Explicitly notify parent that there are no changes after clearing
    if (onChange) {
      onChange(false);
    }
    // Note: We don't clear expandedRelationshipProps here because we want the properties
    // panel to stay expanded
  }, [relationshipPropsData, relationshipPropsInitialData, onChange]);

  // Expose getter, refresh, hasUnsavedChanges, and clearUnsavedChanges to parent via ref
  useImperativeHandle(ref, () => ({
    getRelationshipProperties,
    refresh,
    hasUnsavedChanges,
    clearUnsavedChanges,
  }), [getRelationshipProperties, refresh, hasUnsavedChanges, clearUnsavedChanges]);

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
      // CRITICAL: Validate that entity.id matches entityType to prevent race conditions
      // during navigation where entityType might change before entity state is updated
      // Uses getEntityTypeFromId to support both old and new ID formats
      const detectedType = getEntityTypeFromId(entity.id);
      
      // If detectedType doesn't match entityType, skip loading until synchronized
      if (detectedType && detectedType !== entityType) {
        console.warn('[RelatedEntities] Entity ID/Type mismatch detected, skipping load:', {
          entityId: entity.id,
          detectedType,
          expectedType: entityType,
          entityPath,
          action: 'Skipping relationship loading until entity and entityType are synchronized',
        });
        return; // Skip loading relationships until entity and entityType match
      }
      
      // This is the top level - auto-load all relationships that are expanded
      const loadRelationships = async () => {
        for (const rel of relationships) {
          const key = getRelationshipKey(rel);
          
          // At top level (entityPath.length <= 1), all relationships are expanded by default
          // No need to check expansion state since we're already in the top level condition
          // All relationships should be loaded at top level
          
          // In admin mode, always fetch fresh data to ensure we have the latest relationships
          // In user mode, skip if already loaded (check both loadedData and initial data)
          const currentState = stateRef.current;
          
          // Define cacheKey here so it's available in both branches
          // Use entityType since we've already validated it matches entity.id above
          const cacheKey = getCacheKey(entity.id, entityType, key);
          
          if (!isAdmin) {
            // User mode: skip if already loaded
            if (key in currentState.loadedData || (processedInitialData.loadedData[key] && processedInitialData.loadedData[key].length > 0)) {
              continue;
            }
            
            // Task 26: Check cache before making API request (user mode only)
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
          } else {
            // Admin mode: check if data is already loaded to prevent infinite loops
            // Only fetch if data is not already loaded or if there's an error
            const hasData = key in currentState.loadedData;
            const hasError = currentState.errors[key] !== null && currentState.errors[key] !== undefined;
            const isLoading = currentState.loadingStates[key] === true;
            
            // Skip if we already have data (even if empty array) and no error and not currently loading
            // This prevents infinite loops while still allowing:
            // 1. Initial load (no data yet)
            // 2. Retry on error (hasError is true)
            // 3. Loading state (isLoading is true)
            if (hasData && !hasError && !isLoading) {
              // Data already loaded successfully, skip to prevent infinite loop
              continue;
            }
            
            // Clear cache before fetching fresh data
            delete requestCacheRef.current[cacheKey];
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
  // type FlatRow = {
  //   id: string;
  //   entity: RelatedEntity;
  //   entityType: EntityType;
  //   indentLevel: number;
  //   relationshipLabel: string;
  // };

  /* const collectFlatRows = useCallback(
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
  ); */

  // Collect all rows into a flat array (computed but not currently used)
  // const flatRows = useMemo(
  //   () => collectFlatRows(visibleRelationships, 0, entityPath),
  //   [visibleRelationships, entityPath, collectFlatRows]
  // );

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
          
          // Phase 2: Show placeholder for empty relationships in view mode
          // Hide the section completely if: not loading, no error, no entities, data loaded, AND not in admin mode
          // In admin mode, show placeholder in view mode, blank row in edit mode
          const hasLoadedData = key in state.loadedData;
          let shouldShowPlaceholder = !isLoading && !hasError && entities.length === 0 && hasLoadedData && !isEditing;
          
          // Hide placeholder for read-only (derived) relationships
          // Read-only relationships cannot be edited from this entity page, so showing a placeholder
          // would be misleading (e.g., Jingle → Autor is derived from Cancion → Autor)
          if (rel.isReadOnly && shouldShowPlaceholder) {
            shouldShowPlaceholder = false;
          }
          
          // Hide section completely in non-admin mode when empty, or in admin mode for read-only relationships when empty
          const shouldHideCompletely = (!isAdmin && !isLoading && !hasError && entities.length === 0 && hasLoadedData) ||
            (isAdmin && rel.isReadOnly && !isLoading && !hasError && entities.length === 0 && hasLoadedData);
          
          // Don't render the section if we should hide it (non-admin mode with no entities)
          if (shouldHideCompletely) {
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
                <>
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
                    ) : entities.length === 0 && shouldShowPlaceholder ? (
                      // Phase 2: Show placeholder for empty relationships in view mode
                      <EntityCard
                        entity={{ id: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as RelatedEntity}
                        entityType={rel.entityType}
                        variant="placeholder"
                        relationshipLabel={rel.label}
                        indentationLevel={0}
                      />
                    ) : entities.length === 0 ? (
                      // This case: edit mode with no entities - blank row will be shown below
                      null
                    ) : (
                      // Render direct entities for this relationship first
                      <>
                        {entities.map((relatedEntity) => {
                          const rowId = `${key}-${relatedEntity.id}`;
                          // Check if this entity type has relationships configured (can be expanded)
                          const entityRelationships = getRelationshipsForEntityType(rel.entityType);
                          const hasNestedRelationships = entityRelationships.length > 0 && rel.expandable;
                          // Check if this entity is currently expanded
                          const isEntityExpanded = state.expandedEntities.has(relatedEntity.id);
                          // Get nested rows if entity is expanded
                          // Nested rows are stored with keys like "Canciones-cancion-ART-002"
                          // and have row IDs like "Canciones-cancion-ART-002-CAN-001"
                          const nestedRows = isEntityExpanded 
                            ? (() => {
                                const rows: Array<{ id: string; entity: RelatedEntity; entityType: EntityType; indentLevel: number; relationshipLabel: string }> = [];
                                entityRelationships.forEach((nestedRel) => {
                                  const nestedKey = `${getRelationshipKey(nestedRel)}-${relatedEntity.id}`;
                                  const nestedEntities = state.loadedData[nestedKey] || [];
                                  console.log('Getting nested rows for entity:', relatedEntity.id, 'key:', nestedKey, 'entities:', nestedEntities.length);
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
                                console.log('Total nested rows for entity:', relatedEntity.id, ':', rows.length);
                                return rows;
                              })()
                            : [];
                          const hasNested = !isAdmin && hasNestedRelationships && canExpand;
                          
                          // Extract relationship data from entity using centralized utility
                          // The backend may include relationship data directly in the entity object
                          // Special cases: root entity fallbacks, Jingle fabrica handling
                          const relationshipData: Record<string, unknown> | undefined = (() => {
                            // First, try using the centralized utility
                            let data = extractRelationshipData(relatedEntity, rel.entityType) || {};
                            
                            // Special case handling for Jingle: fabrica, cancion, autores from entity object or parent
                            if (rel.entityType === 'jingle') {
                              const jingle = relatedEntity as Jingle & { fabrica?: Fabrica; cancion?: Cancion; autores?: Artista[]; jingleros?: Artista[]; tematicas?: Tematica[] };
                              // Check if relationship data is embedded in the entity object
                              // Note: these are not in the Jingle type, but may be added by backend
                              if ('fabrica' in jingle && jingle.fabrica) {
                                data = { ...data, fabrica: jingle.fabrica };
                              }
                              if ('cancion' in jingle && jingle.cancion) {
                                data = { ...data, cancion: jingle.cancion };
                              }
                              if ('autores' in jingle && jingle.autores && Array.isArray(jingle.autores) && jingle.autores.length > 0) {
                                data = { ...data, autores: jingle.autores };
                              }
                              if ('jingleros' in jingle && jingle.jingleros && Array.isArray(jingle.jingleros) && jingle.jingleros.length > 0) {
                                data = { ...data, jingleros: jingle.jingleros };
                              }
                              if ('tematicas' in jingle && jingle.tematicas && Array.isArray(jingle.tematicas) && jingle.tematicas.length > 0) {
                                data = { ...data, tematicas: jingle.tematicas };
                              }
                              // If the parent entity (root entity) is a Fabrica, pass the full Fabrica object
                              // This allows EntityCard to use the Fabrica's date when Jingle doesn't have fabricaDate
                              if (entityType === 'fabrica') {
                                data = { ...data, fabrica: entity };
                              }
                              // If the parent entity (root entity) is a Cancion, pass the Cancion and its autores
                              // This allows EntityCard to format jingle title as "{cancion} ({autor})" when title/songTitle are blank
                              if (entityType === 'cancion') {
                                const cancion = entity as Cancion;
                                data = { ...data, cancion: cancion };
                                // Extract autores from cancion's _metadata or check if they're directly on the entity
                                if (cancion._metadata?.autores && Array.isArray(cancion._metadata.autores) && cancion._metadata.autores.length > 0) {
                                  data = { ...data, autores: cancion._metadata.autores };
                                } else if ('autores' in cancion && Array.isArray((cancion as any).autores) && (cancion as any).autores.length > 0) {
                                  data = { ...data, autores: (cancion as any).autores };
                                }
                              }
                            }
                            
                            // Special case: Root entity fallbacks for Artista
                            if (rel.entityType === 'artista' && entityType === 'artista' && entity.id === relatedEntity.id) {
                              const artista = relatedEntity as Artista;
                              // Fallback to state.counts if _metadata wasn't available
                              if (!artista._metadata || artista._metadata.autorCount === undefined) {
                                const cancionesKey = 'Canciones-cancion';
                                const cancionesCount = state.counts[cancionesKey] || 0;
                                if (cancionesCount > 0) {
                                  data = { ...data, autorCount: cancionesCount };
                                }
                              }
                              if (!artista._metadata || artista._metadata.jingleroCount === undefined) {
                                const jinglesKey = 'Jingles-jingle';
                                const jinglesCount = state.counts[jinglesKey] || 0;
                                if (jinglesCount > 0) {
                                  data = { ...data, jingleroCount: jinglesCount };
                                }
                              }
                            }
                            
                            // Special case: Root entity fallbacks for Cancion
                            if (rel.entityType === 'cancion' && entityType === 'cancion' && entity.id === relatedEntity.id) {
                              const cancion = relatedEntity as Cancion;
                              // Fallback to state.loadedData if _metadata wasn't available
                              if (!cancion._metadata || !cancion._metadata.autores) {
                                const autorKey = 'Autor-artista';
                                const autores = state.loadedData[autorKey] || [];
                                if (autores.length > 0) {
                                  data = { ...data, autores };
                                }
                              }
                              // Fallback to state.counts if _metadata wasn't available
                              if (!cancion._metadata || cancion._metadata.jingleCount === undefined) {
                                const jinglesKey = 'Jingles-jingle';
                                const jinglesCount = state.counts[jinglesKey] || 0;
                                if (jinglesCount > 0) {
                                  data = { ...data, jingleCount: jinglesCount };
                                }
                              }
                            }
                            
                            return Object.keys(data).length > 0 ? data : undefined;
                          })();
                          
                          // In admin mode, handle relationship properties expansion
                          const relationshipPropsKey = `${relatedEntity.id}-${key}`;
                          const isRelationshipPropsExpanded = expandedRelationshipProps.has(relationshipPropsKey);
                          const relType = getRelationshipTypeForAPI(entityType, rel.label, rel.entityType);
                          
                          // Handle click in admin mode - expand relationship properties instead of navigating
                          const handleAdminClick = isAdmin ? async () => {
                            if (isRelationshipPropsExpanded) {
                              // Collapse
                              setExpandedRelationshipProps(prev => {
                                const next = new Set(prev);
                                next.delete(relationshipPropsKey);
                                return next;
                              });
                            } else {
                              // Expand - fetch relationship properties
                              setExpandedRelationshipProps(prev => new Set(prev).add(relationshipPropsKey));
                              
                              // Fetch relationship properties if not already loaded
                              // Note: `relatedEntity` is the related entity from map, `entity` is root entity from component props
                              if (!relationshipPropsData[relationshipPropsKey] && relType && relatedEntity?.id) {
                                // Determine start and end IDs for the relationship
                                const relatedEntityId = relatedEntity.id; // Related entity from map
                                const rootEntityId = entity.id; // Root entity from component props
                                
                                let startId: string;
                                let endId: string;
                                
                                if (relType === 'appears_in') {
                                  // Jingle -> Fabrica
                                  startId = entityType === 'jingle' ? rootEntityId : relatedEntityId;
                                  endId = entityType === 'jingle' ? relatedEntityId : rootEntityId;
                                } else if (relType === 'versiona') {
                                  // Jingle -> Cancion
                                  startId = entityType === 'jingle' ? rootEntityId : relatedEntityId;
                                  endId = entityType === 'jingle' ? relatedEntityId : rootEntityId;
                                } else if (relType === 'jinglero_de' || relType === 'autor_de') {
                                  // Artista -> Jingle/Cancion
                                  startId = entityType === 'artista' ? rootEntityId : relatedEntityId;
                                  endId = entityType === 'artista' ? relatedEntityId : rootEntityId;
                                } else if (relType === 'tagged_with') {
                                  // Jingle -> Tematica
                                  startId = entityType === 'jingle' ? rootEntityId : relatedEntityId;
                                  endId = entityType === 'jingle' ? relatedEntityId : rootEntityId;
                                } else {
                                  // Default: current entity is start, related entity is end
                                  startId = rootEntityId;
                                  endId = relatedEntityId;
                                }
                                
                                // Fetch relationship properties from API
                                (async () => {
                                  try {
                                    // First, check if properties are embedded in the entity (from initial data)
                                    const props: RelationshipProperties = {};
                                    
                                    // Check if relatedEntity has relationship properties embedded
                                    // These are relationship properties that may be added by the backend
                                    const entityWithProps = relatedEntity as RelatedEntity & {
                                      order?: number;
                                      timestamp?: number;
                                      status?: string;
                                      isPrimary?: boolean;
                                    };
                                    if (entityWithProps.order !== undefined) props.order = entityWithProps.order;
                                    if (entityWithProps.timestamp !== undefined) props.timestamp = entityWithProps.timestamp;
                                    if (entityWithProps.status !== undefined) props.status = entityWithProps.status;
                                    if (entityWithProps.isPrimary !== undefined) props.isPrimary = entityWithProps.isPrimary;
                                    
                                    // If properties are not embedded, fetch from API
                                    if (Object.keys(props).length === 0) {
                                      try {
                                        // Fetch entity relationships to get relationship properties
                                        const entityTypeMap: Record<EntityType, string> = {
                                          jingle: 'jingles',
                                          cancion: 'canciones',
                                          artista: 'artistas',
                                          tematica: 'tematicas',
                                          fabrica: 'fabricas',
                                        };
                                        const apiType = entityTypeMap[entityType];
                                        const relationships = await adminApi.getEntityRelationships(apiType, rootEntityId);
                                        
                                        // Find the specific relationship
                                        // API returns relationships with additional metadata (direction, source, target)
                                        type ExtendedRelationship = Relationship & {
                                          direction?: 'outgoing' | 'incoming';
                                          source?: { id: string };
                                          target?: { id: string };
                                        };
                                        const allRels: ExtendedRelationship[] = [...(relationships.outgoing || []), ...(relationships.incoming || [])];
                                        const targetRel = allRels.find((r) => {
                                          if (relType === 'appears_in') {
                                            return r.type === 'APPEARS_IN' && 
                                              ((r.direction === 'outgoing' && r.target?.id === endId) ||
                                               (r.direction === 'incoming' && r.source?.id === startId));
                                          } else if (relType === 'versiona') {
                                            return r.type === 'VERSIONA' && 
                                              ((r.direction === 'outgoing' && r.target?.id === endId) ||
                                               (r.direction === 'incoming' && r.source?.id === startId));
                                          } else if (relType === 'jinglero_de') {
                                            return r.type === 'JINGLERO_DE' && 
                                              ((r.direction === 'outgoing' && r.target?.id === endId) ||
                                               (r.direction === 'incoming' && r.source?.id === startId));
                                          } else if (relType === 'autor_de') {
                                            return r.type === 'AUTOR_DE' && 
                                              ((r.direction === 'outgoing' && r.target?.id === endId) ||
                                               (r.direction === 'incoming' && r.source?.id === startId));
                                          } else if (relType === 'tagged_with') {
                                            return r.type === 'TAGGED_WITH' && 
                                              ((r.direction === 'outgoing' && r.target?.id === endId) ||
                                               (r.direction === 'incoming' && r.source?.id === startId));
                                          }
                                          return false;
                                        });
                                        
                                        if (targetRel && targetRel.properties) {
                                          Object.assign(props, targetRel.properties);
                                        }
                                      } catch (apiError) {
                                        console.error('Error fetching relationship from API:', apiError);
                                      }
                                    }
                                    
                                    const propsCopy = { ...props };
                                    setRelationshipPropsData(prev => ({
                                      ...prev,
                                      [relationshipPropsKey]: propsCopy,
                                    }));
                                    setRelationshipPropsInitialData(prev => ({
                                      ...prev,
                                      [relationshipPropsKey]: propsCopy,
                                    }));
                                    
                                    // Initialize timestamp time
                                    if (props.timestamp !== undefined) {
                                      const { h, m, s } = (() => {
                                        const totalSeconds = Math.floor(Number(props.timestamp));
                                        return {
                                          h: Math.floor(totalSeconds / 3600),
                                          m: Math.floor((totalSeconds % 3600) / 60),
                                          s: totalSeconds % 60,
                                        };
                                      })();
                                      setTimestampTimes(prev => ({
                                        ...prev,
                                        [relationshipPropsKey]: { h, m, s },
                                      }));
                                    }
                                  } catch (error) {
                                    console.error('Error fetching relationship properties:', error);
                                  }
                                })();
                              }
                            }
                          } : undefined;
                          
                          return (
                            <React.Fragment key={rowId}>
                              <div className="related-entities__row">
                                <EntityCard
                                  entity={relatedEntity}
                                  entityType={rel.entityType}
                                  variant="contents"
                                  indentationLevel={0}
                                  relationshipLabel={rel.label}
                                  relationshipData={relationshipData}
                                  hasNestedEntities={hasNested}
                                  isExpanded={isEntityExpanded}
                                  onClick={handleAdminClick}
                                  to={isAdmin ? undefined : getEntityRoute(rel.entityType, relatedEntity.id)} // In admin mode, don't navigate on click
                                  showAdminNavButton={isAdmin}
                                  adminRoute={`/admin/${rel.entityType === 'jingle' ? 'j' : rel.entityType === 'cancion' ? 'c' : rel.entityType === 'artista' ? 'a' : rel.entityType === 'fabrica' ? 'f' : 't'}/${relatedEntity.id}`}
                                  onAdminNavClick={() => {
                                    console.log('[RelatedEntities] Admin nav clicked:', {
                                      entityType: rel.entityType,
                                      entityId: relatedEntity.id,
                                      entity: relatedEntity,
                                    });
                                    if (onNavigateToEntity) {
                                      onNavigateToEntity(rel.entityType, relatedEntity.id);
                                    }
                                  }}
                                  showDeleteButton={isAdmin && isEditing && !rel.isReadOnly}
                                  onDeleteClick={() => {
                                    const name = 'title' in relatedEntity ? relatedEntity.title : 
                                                 'name' in relatedEntity ? relatedEntity.name : 
                                                 'stageName' in relatedEntity ? relatedEntity.stageName : 
                                                 relatedEntity.id;
                                    handleDeleteRelationshipClick(relatedEntity.id, name || relatedEntity.id, rel.label, rel.entityType);
                                  }}
                                  onToggleExpand={async () => {
                                    console.log('onToggleExpand called for entity:', relatedEntity.id, 'entityType:', rel.entityType);
                                    const currentState = stateRef.current;
                                    const wasExpanded = currentState.expandedEntities.has(relatedEntity.id);
                                    console.log('wasExpanded:', wasExpanded, 'hasNestedRelationships:', hasNestedRelationships);
                                    dispatch({ type: 'TOGGLE_ENTITY', entityId: relatedEntity.id });
                                    
                                    // If expanding, load nested relationships
                                    if (!wasExpanded && hasNestedRelationships) {
                                      const nestedRelationships = getRelationshipsForEntityType(rel.entityType);
                                      console.log('Loading nested relationships for entity:', relatedEntity.id, 'relationships:', nestedRelationships.map(r => r.label));
                                      
                                      for (const nestedRel of nestedRelationships) {
                                        const nestedKey = `${getRelationshipKey(nestedRel)}-${relatedEntity.id}`;
                                        
                                        // Check current state (may have updated)
                                        const latestState = stateRef.current;
                                        console.log('Checking nested key:', nestedKey, 'in loadedData:', nestedKey in latestState.loadedData);
                                        
                                        // Check if already loaded
                                        if (nestedKey in latestState.loadedData) {
                                          console.log('Already loaded, skipping');
                                          continue;
                                        }
                                        
                                        // Check cache
                                        const cacheKey = `${relatedEntity.id}-${rel.entityType}-${getRelationshipKey(nestedRel)}`;
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
                                          console.log('Loading nested relationships for:', relatedEntity.id, 'relationship:', nestedRel.label);
                                          const abortController = new AbortController();
                                          dispatch({ type: 'LOAD_START', key: nestedKey, abortController });
                                          
                                          const nestedEntities = await nestedRel.fetchFn(relatedEntity.id, rel.entityType);
                                          console.log('Fetched nested entities:', nestedEntities.length, nestedEntities);
                                          const sorted = sortEntities(nestedEntities, nestedRel.sortKey, nestedRel.entityType);
                                          const filtered = sorted.filter((e) => ![...entityPath, relatedEntity.id].includes(e.id));
                                          
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
                              {/* Render relationship properties in admin mode when expanded */}
                              {isAdmin && isRelationshipPropsExpanded && relType && (() => {
                                // Try to get props from state, or fall back to relatedEntity properties
                                const stateProps = relationshipPropsData[relationshipPropsKey];
                                const entityProps = relatedEntity && typeof relatedEntity === 'object' ? {
                                  order: 'order' in relatedEntity ? relatedEntity.order : undefined,
                                  timestamp: 'timestamp' in relatedEntity ? relatedEntity.timestamp : undefined,
                                  status: 'status' in relatedEntity ? relatedEntity.status : undefined,
                                  isPrimary: 'isPrimary' in relatedEntity ? relatedEntity.isPrimary : undefined,
                                } : {};
                                const propsData = stateProps || entityProps;
                                const schema = getRelationshipPropertiesSchema(relType);
                                
                                if (schema.length === 0) return null;
                                
                                // Helper to convert seconds to HH:MM:SS
                                const secondsToTime = (seconds: number | null | undefined): { h: number; m: number; s: number } => {
                                  if (seconds === null || seconds === undefined || isNaN(Number(seconds))) {
                                    return { h: 0, m: 0, s: 0 };
                                  }
                                  const totalSeconds = Math.floor(Number(seconds));
                                  const h = Math.floor(totalSeconds / 3600);
                                  const m = Math.floor((totalSeconds % 3600) / 60);
                                  const s = totalSeconds % 60;
                                  return { h, m, s };
                                };
                                
                                // Helper to convert HH:MM:SS to seconds
                                const timeToSeconds = (h: number, m: number, s: number): number => {
                                  return (h * 3600) + (m * 60) + s;
                                };
                                
                                // Helper to format seconds as HH:MM:SS
                                const formatTime = (seconds: number | null | undefined): string => {
                                  if (seconds === null || seconds === undefined || isNaN(Number(seconds))) {
                                    return '-';
                                  }
                                  const { h, m, s } = secondsToTime(seconds);
                                  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                                };
                                
                                // Get or initialize timestamp time
                                // Timestamp is always an integer (seconds) from API
                                const getTimestampTime = (): { h: number; m: number; s: number } => {
                                  if (timestampTimes[relationshipPropsKey]) {
                                    return timestampTimes[relationshipPropsKey];
                                  }
                                  // Timestamp is always a number (seconds) from API
                                  const timestamp = propsData.timestamp;
                                  const time = (typeof timestamp === 'number' && !isNaN(timestamp))
                                    ? secondsToTime(timestamp)
                                    : { h: 0, m: 0, s: 0 };
                                  // Initialize synchronously (this is safe since we're in render)
                                  if (!timestampTimes[relationshipPropsKey] && timestamp !== undefined) {
                                    setTimestampTimes(prev => ({ ...prev, [relationshipPropsKey]: time }));
                                  }
                                  return time;
                                };
                                
                                const timestampTime = getTimestampTime();
                                
                                // Ensure timestampTime values are always valid numbers (not NaN)
                                const safeTimestampTime = {
                                  h: isNaN(timestampTime.h) ? 0 : Math.max(0, Math.min(23, timestampTime.h)),
                                  m: isNaN(timestampTime.m) ? 0 : Math.max(0, Math.min(59, timestampTime.m)),
                                  s: isNaN(timestampTime.s) ? 0 : Math.max(0, Math.min(59, timestampTime.s)),
                                };
                                
                                const handleTimestampChange = (field: 'h' | 'm' | 's', value: number) => {
                                  // Get current time from state or convert from timestamp (always integer seconds)
                                  const currentTimestamp = typeof propsData.timestamp === 'number' ? propsData.timestamp : 0;
                                  const currentTime = timestampTimes[relationshipPropsKey] || secondsToTime(currentTimestamp);
                                  // Ensure value is a valid number
                                  const numValue = isNaN(value) ? 0 : value;
                                  const newTime = { ...currentTime, [field]: Math.max(0, Math.min(field === 'h' ? 23 : 59, numValue)) };
                                  setTimestampTimes(prev => ({ ...prev, [relationshipPropsKey]: newTime }));
                                  // Convert time components to seconds (integer) for API
                                  const seconds = timeToSeconds(newTime.h, newTime.m, newTime.s);
                                  setRelationshipPropsData(prev => ({
                                    ...prev,
                                    [relationshipPropsKey]: {
                                      ...prev[relationshipPropsKey],
                                      timestamp: seconds, // Always integer (seconds)
                                    },
                                  }));
                                };
                                
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '16px', marginTop: '4px', marginBottom: '4px' }}>
                                    {schema.map((prop) => (
                                      <div
                                        key={prop.name}
                                        style={{
                                          display: 'flex',
                                          alignItems: prop.name === 'timestamp' && isEditing ? 'flex-start' : 'center',
                                          gap: '12px',
                                          padding: '2px 12px',
                                          minHeight: '28px',
                                          backgroundColor: '#1a1a1a',
                                          border: '1px solid #333',
                                          borderRadius: '4px',
                                          color: '#fff',
                                        }}
                                      >
                                        <label
                                          style={{
                                            fontSize: '14px',
                                            color: '#ccc',
                                            minWidth: '150px',
                                            flexShrink: 0,
                                            margin: 0,
                                            paddingTop: prop.name === 'timestamp' && isEditing ? '4px' : '0',
                                          }}
                                        >
                                          {prop.label}:
                                        </label>
                                        {isEditing ? (
                                          prop.name === 'timestamp' ? (
                                            // Timestamp with separate HH:MM:SS fields
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1 }}>
                                              <input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={safeTimestampTime.h}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value, 10);
                                                  handleTimestampChange('h', isNaN(val) ? 0 : val);
                                                }}
                                                style={{
                                                  width: '50px',
                                                  padding: '4px 6px',
                                                  backgroundColor: '#2a2a2a',
                                                  border: '1px solid #444',
                                                  borderRadius: '4px',
                                                  fontSize: '14px',
                                                  color: '#fff',
                                                  textAlign: 'center',
                                                }}
                                              />
                                              <span style={{ color: '#999' }}>:</span>
                                              <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={safeTimestampTime.m}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value, 10);
                                                  handleTimestampChange('m', isNaN(val) ? 0 : val);
                                                }}
                                                style={{
                                                  width: '50px',
                                                  padding: '4px 6px',
                                                  backgroundColor: '#2a2a2a',
                                                  border: '1px solid #444',
                                                  borderRadius: '4px',
                                                  fontSize: '14px',
                                                  color: '#fff',
                                                  textAlign: 'center',
                                                }}
                                              />
                                              <span style={{ color: '#999' }}>:</span>
                                              <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={safeTimestampTime.s}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value, 10);
                                                  handleTimestampChange('s', isNaN(val) ? 0 : val);
                                                }}
                                                style={{
                                                  width: '50px',
                                                  padding: '4px 6px',
                                                  backgroundColor: '#2a2a2a',
                                                  border: '1px solid #444',
                                                  borderRadius: '4px',
                                                  fontSize: '14px',
                                                  color: '#fff',
                                                  textAlign: 'center',
                                                }}
                                              />
                                            </div>
                                          ) : prop.type === 'boolean' ? (
                                            <FilterSwitch
                                              checked={typeof propsData[prop.name] === 'boolean' ? (propsData[prop.name] as boolean) : false}
                                              onChange={(checked) => {
                                                setRelationshipPropsData(prev => ({
                                                  ...prev,
                                                  [relationshipPropsKey]: {
                                                    ...prev[relationshipPropsKey],
                                                    [prop.name]: checked,
                                                  },
                                                }));
                                              }}
                                              label={prop.label}
                                              size="small"
                                              ariaLabel={`Toggle ${prop.label}`}
                                            />
                                          ) : prop.type === 'select' ? (
                                            <select
                                              value={typeof propsData[prop.name] === 'string' ? (propsData[prop.name] as string) : ''}
                                              onChange={(e) => {
                                                setRelationshipPropsData(prev => ({
                                                  ...prev,
                                                  [relationshipPropsKey]: {
                                                    ...prev[relationshipPropsKey],
                                                    [prop.name]: e.target.value,
                                                  },
                                                }));
                                              }}
                                              style={{
                                                flex: 1,
                                                padding: '4px 8px',
                                                backgroundColor: '#2a2a2a',
                                                border: '1px solid #444',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                              }}
                                            >
                                              <option value="">-- Seleccionar --</option>
                                              {prop.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                              ))}
                                            </select>
                                          ) : (
                                            <input
                                              type={prop.type === 'number' ? 'number' : 'text'}
                                              value={typeof propsData[prop.name] === 'string' || typeof propsData[prop.name] === 'number' ? String(propsData[prop.name]) : ''}
                                              readOnly={false}
                                              onChange={(e) => {
                                                setRelationshipPropsData(prev => ({
                                                  ...prev,
                                                  [relationshipPropsKey]: {
                                                    ...prev[relationshipPropsKey],
                                                    [prop.name]: prop.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                                                  },
                                                }));
                                              }}
                                              style={{
                                                flex: 1,
                                                padding: '4px 8px',
                                                backgroundColor: '#2a2a2a',
                                                border: '1px solid #444',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                color: '#fff',
                                                minWidth: 0,
                                              }}
                                            />
                                          )
                                        ) : (
                                          // Display mode
                                          prop.name === 'timestamp' ? (
                                            <span style={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                                              {formatTime(typeof propsData[prop.name] === 'number' ? (propsData[prop.name] as number) : 0)}
                                            </span>
                                          ) : prop.type === 'boolean' ? (
                                            <span style={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                                              {propsData[prop.name] ? 'Sí' : 'No'}
                                            </span>
                                          ) : (
                                            <span style={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                                              {propsData[prop.name] !== undefined && propsData[prop.name] !== null 
                                                ? String(propsData[prop.name]) 
                                                : '-'}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
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
                                        // Determine parent entity type by checking the entity object structure
                                        // This is needed to know if a Jingle is nested under a Fabrica
                                        const parentEntityType: EntityType | null = (() => {
                                          // Check if entity has Fabrica properties
                                          if ('date' in entity && 'youtubeUrl' in entity) {
                                            return 'fabrica';
                                          }
                                          // Check if entity has Jingle properties
                                          if ('timestamp' in entity && typeof (entity as Jingle).timestamp === 'number') {
                                            return 'jingle';
                                          }
                                          // Check if entity has Cancion properties
                                          if ('album' in entity || 'year' in entity) {
                                            return 'cancion';
                                          }
                                          // Check if entity has Artista properties
                                          if ('stageName' in entity || ('name' in entity && !('title' in entity))) {
                                            return 'artista';
                                          }
                                          // Check if entity has Tematica properties
                                          if ('category' in entity) {
                                            return 'tematica';
                                          }
                                          return null;
                                        })();
                                        
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
                                        // If Jingle is nested under a Fabrica, use the parent entity's ID
                                        const nestedRelationshipData: Record<string, unknown> | undefined = (() => {
                                          if (row.entityType === 'jingle') {
                                            // Check if fabrica data is in the entity object
                                            // Note: fabrica is not in the Jingle type, but may be added by backend
                                            const jingleWithFabrica = row.entity as Jingle & { fabrica?: unknown };
                                            if ('fabrica' in jingleWithFabrica && jingleWithFabrica.fabrica) {
                                              return { fabrica: jingleWithFabrica.fabrica };
                                            }
                                            // If the parent entity (the one that was expanded) is a Fabrica, use its ID
                                            if (parentEntityType === 'fabrica') {
                                              return { fabrica: { id: entity.id } };
                                            }
                                            // Check if the Jingle has a Fabrica relationship that's been loaded
                                            // Look for "Fabrica-fabrica-{jingleId}" in loadedData
                                            const fabricaKey = `Fabrica-fabrica-${row.entity.id}`;
                                            const fabricaData = state.loadedData[fabricaKey];
                                            if (Array.isArray(fabricaData) && fabricaData.length > 0 && fabricaData[0]) {
                                              return { fabrica: fabricaData[0] };
                                            }
                                          }
                                          return undefined;
                                        })();
                                        
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
                                                  (() => {
                                                    if (nestedNestedRow.entityType === 'jingle') {
                                                      const jingleWithFabrica = nestedNestedRow.entity as Jingle & { fabrica?: unknown };
                                                      if ('fabrica' in jingleWithFabrica && jingleWithFabrica.fabrica) {
                                                        return { fabrica: jingleWithFabrica.fabrica };
                                                      }
                                                    }
                                                    return undefined;
                                                  })();
                                                
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

                    {/* Task 18: Add blank row for Admin Mode - show even when no entities exist */}
                    {/* Task 5.3: Only show blank rows when isEditing={true} */}
                    {/* Phase 3: Hide blank row when maxCardinality is reached */}
                    {/* Phase 5: Hide blank row for read-only relationships */}
                    {/* Task 7.8: Pass creationContext to EntitySearchAutocomplete for entity creation flow */}
                    {(() => {
                      const shouldShowBlankRow = isAdmin && isEditing && !rel.isReadOnly && (!rel.maxCardinality || entities.length < rel.maxCardinality);
                      if (isAdmin && !shouldShowBlankRow) {
                        console.log('[RelatedEntities] Blank row hidden for', key, {
                          isAdmin,
                          isEditing,
                          isReadOnly: rel.isReadOnly,
                          maxCardinality: rel.maxCardinality,
                          currentCount: entities.length,
                        });
                      }
                      return shouldShowBlankRow;
                    })() && (
                      <div className="related-entities__blank-row">
                        {selectedEntityForRelationship && selectedEntityForRelationship.key === key ? (
                              // Show property form for selected entity
                              <div style={{
                                border: '1px solid #444',
                                borderRadius: '4px',
                                backgroundColor: '#1a1a1a',
                                padding: '16px',
                              }}>
                                <div style={{ marginBottom: '12px' }}>
                                  <strong style={{ color: '#fff', fontSize: '14px' }}>Entidad seleccionada:</strong>
                                  <div style={{ marginTop: '8px' }}>
                                    <EntityCard
                                      entity={selectedEntityForRelationship.entity}
                                      entityType={rel.entityType}
                                      variant="contents"
                                      indentationLevel={0}
                                    />
                                  </div>
                                </div>
                                {(() => {
                                  const relType = getRelationshipTypeForAPI(entityType, rel.label, rel.entityType);
                                  if (!relType) return null;
                                  const schema = getRelationshipPropertiesSchema(relType);
                                  if (schema.length === 0) return null;
                                  
                                  return (
                                    <div style={{ marginTop: '16px' }}>
                                      <strong style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                                        Propiedades de la relación:
                                      </strong>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {schema.map((prop) => (
                                          <div key={prop.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ color: '#ccc', fontSize: '13px' }}>
                                              {prop.label}:
                                            </label>
                                            {prop.type === 'boolean' ? (
                                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                  type="checkbox"
                                                  checked={typeof relationshipProperties[prop.name] === 'boolean' ? (relationshipProperties[prop.name] as boolean) : false}
                                                  onChange={(e) => setRelationshipProperties(prev => ({
                                                    ...prev,
                                                    [prop.name]: e.target.checked
                                                  }))}
                                                  style={{ cursor: 'pointer' }}
                                                />
                                                <span style={{ color: '#fff', fontSize: '14px' }}>{prop.label}</span>
                                              </label>
                                            ) : prop.type === 'select' ? (
                                              <select
                                                value={typeof relationshipProperties[prop.name] === 'string' ? (relationshipProperties[prop.name] as string) : ''}
                                                onChange={(e) => setRelationshipProperties(prev => ({
                                                  ...prev,
                                                  [prop.name]: e.target.value
                                                }))}
                                                style={{
                                                  padding: '6px 8px',
                                                  backgroundColor: '#2a2a2a',
                                                  border: '1px solid #444',
                                                  borderRadius: '4px',
                                                  fontSize: '14px',
                                                  color: '#fff',
                                                  cursor: 'pointer',
                                                }}
                                              >
                                                {prop.options?.map(opt => (
                                                  <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                              </select>
                                            ) : (
                                              <input
                                                type={prop.type === 'number' ? 'number' : 'text'}
                                                value={typeof relationshipProperties[prop.name] === 'string' || typeof relationshipProperties[prop.name] === 'number' ? String(relationshipProperties[prop.name]) : ''}
                                                onChange={(e) => setRelationshipProperties(prev => ({
                                                  ...prev,
                                                  [prop.name]: prop.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                                                }))}
                                                placeholder={prop.label}
                                                style={{
                                                  padding: '6px 8px',
                                                  backgroundColor: '#2a2a2a',
                                                  border: '1px solid #444',
                                                  borderRadius: '4px',
                                                  fontSize: '14px',
                                                  color: '#fff',
                                                }}
                                              />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                  <button
                                    type="button"
                                    onClick={handleCreateRelationship}
                                    disabled={!isEditing}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: isEditing ? '#4caf50' : '#666',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: isEditing ? 'pointer' : 'not-allowed',
                                      fontSize: '14px',
                                      opacity: isEditing ? 1 : 0.6,
                                    }}
                                  >
                                    Crear Relación
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedEntityForRelationship(null);
                                      setRelationshipProperties({});
                                    }}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: '#666',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <EntitySearchAutocomplete
                                entityTypes={[rel.entityType]}
                                placeholder={`Buscar ${rel.label.toLowerCase()}...`}
                                onSelect={(selectedEntity) => {
                                  handleSelectEntity(key, selectedEntity);
                                }}
                                // Task 7.8: Pass creation context so "+" button can navigate to Dashboard
                                // with full context: create, from, fromId, relType, searchText
                                creationContext={{
                                  fromType: entityType,
                                  fromId: entity.id,
                                  relType: getRelationshipTypeForAPI(entityType, rel.label, rel.entityType) || '',
                                }}
                                // Phase 4: Filter entities with cardinality constraints (asymmetric logic)
                                filterExcludeRelationship={
                                  entityType === 'fabrica' && rel.entityType === 'jingle' ? 'appears_in' :
                                  entityType === 'cancion' && rel.entityType === 'jingle' ? 'versiona' :
                                  undefined
                                }
                                autoFocus={false}
                              />
                            )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Phase 6: Delete relationship confirmation modal */}
      <DeleteRelationshipModal
        isOpen={deleteModalState.isOpen}
        entityName={deleteModalState.entityName || ''}
        currentEntityName={'title' in entity && entity.title ? entity.title : 'name' in entity && entity.name ? entity.name : entity.id}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({
          isOpen: false,
          relationshipType: null,
          startId: null,
          endId: null,
          entityName: null,
        })}
      />
    </div>
  );
});

RelatedEntities.displayName = 'RelatedEntities';

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
  if (prevProps.isEditing !== nextProps.isEditing) return false;
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

