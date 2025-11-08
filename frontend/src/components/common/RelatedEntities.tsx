import { useState, useCallback, useEffect } from 'react';
import EntityCard, { type EntityType } from './EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { sortEntities } from '../../lib/utils/entitySorters';
import '../../styles/components/related-entities.css';

export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;

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

  // IMPORTANT: The entity prop is always pre-loaded by the parent component.
  // RelatedEntities only loads RELATED entities (via relationship.fetchFn calls),
  // never the root entity itself. This ensures proper separation of concerns and
  // allows parent pages to control loading states and error handling for the root entity.

  // Track expanded relationships and loaded data
  // Auto-expand first level only in Admin Mode (entityPath.length === 0 means it's the top level)
  const [expandedRelationships, setExpandedRelationships] = useState<Set<string>>(
    entityPath.length === 0 && isAdmin
      ? new Set(relationships.map(rel => `${rel.label}-${rel.entityType}`))
      : new Set()
  );
  const [loadedData, setLoadedData] = useState<Record<string, RelatedEntity[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Check if we've exceeded max depth
  const currentDepth = entityPath.length;
  const canExpand = currentDepth < maxDepth;

  // Helper to create relationship key
  const getRelationshipKey = useCallback((rel: RelationshipConfig) => `${rel.label}-${rel.entityType}`, []);

  // Auto-load first level relationships on mount (Admin Mode only)
  useEffect(() => {
    if (entityPath.length === 0 && isAdmin) {
      // This is the top level in Admin Mode - auto-expand and load all relationships
      const loadRelationships = async () => {
        for (const rel of relationships) {
          const key = getRelationshipKey(rel);
          setLoadingStates((prev) => {
            // Only set loading if not already loading
            if (prev[key]) return prev;
            return { ...prev, [key]: true };
          });
          try {
            // Fetch count first if function provided
            if (rel.fetchCountFn) {
              const count = await rel.fetchCountFn(entity.id, entityType);
              setCounts((prev) => ({ ...prev, [key]: count }));
            }

            // Fetch entities
            const entities = await rel.fetchFn(entity.id, entityType);
            const sorted = sortEntities(entities, rel.sortKey, rel.entityType);

            // Filter out entities in path (cycle prevention) - disabled in Admin Mode per spec
            // But we'll keep it for now until Phase 6 Task 19
            const filtered = sorted.filter((e) => !entityPath.includes(e.id));

            setLoadedData((prev) => ({ ...prev, [key]: filtered }));
            // Update count based on actual loaded entities
            setCounts((prev) => ({ ...prev, [key]: filtered.length }));
          } catch (error) {
            console.error(`Error loading ${rel.label}:`, error);
            // Set empty array on error to prevent retry loops
            setLoadedData((prev) => ({ ...prev, [key]: [] }));
            setCounts((prev) => ({ ...prev, [key]: 0 }));
          } finally {
            setLoadingStates((prev) => ({ ...prev, [key]: false }));
          }
        }
      };
      loadRelationships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]); // Run on mount for top level, and when isAdmin changes

  // Handle expand/collapse for relationship
  const handleToggleRelationship = useCallback(
    async (rel: RelationshipConfig) => {
      const key = getRelationshipKey(rel);
      const isExpanded = expandedRelationships.has(key);

      if (isExpanded) {
        // Collapse
        setExpandedRelationships((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        // Expand - lazy load data if not already loaded
        setExpandedRelationships((prev) => new Set(prev).add(key));

        if (!loadedData[key] && !loadingStates[key]) {
          setLoadingStates((prev) => ({ ...prev, [key]: true }));
          try {
            // Fetch count first if function provided
            if (rel.fetchCountFn) {
              const count = await rel.fetchCountFn(entity.id, entityType);
              setCounts((prev) => ({ ...prev, [key]: count }));
            }

            // Fetch entities
            const entities = await rel.fetchFn(entity.id, entityType);
            const sorted = sortEntities(entities, rel.sortKey, rel.entityType);

            // Filter out entities in path (cycle prevention)
            const filtered = sorted.filter((e) => !entityPath.includes(e.id));

            setLoadedData((prev) => ({ ...prev, [key]: filtered }));
            // Update count based on actual loaded entities
            setCounts((prev) => ({ ...prev, [key]: filtered.length }));
          } catch (error) {
            console.error(`Error loading ${rel.label}:`, error);
            // Set empty array on error to prevent retry loops
            setLoadedData((prev) => ({ ...prev, [key]: [] }));
            setCounts((prev) => ({ ...prev, [key]: 0 }));
          } finally {
            setLoadingStates((prev) => ({ ...prev, [key]: false }));
          }
        }
      }
    },
    [entity.id, entityType, entityPath, loadedData, loadingStates, expandedRelationships]
  );

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
            const isExpanded = expandedRelationships.has(key);
            const isLoading = loadingStates[key] || false;
            const entities = loadedData[key] || [];
            // Use entities.length if we have loaded data, otherwise use count if available
            const count = entities.length > 0 ? entities.length : (counts[key] || 0);

            return (
              <tr key={key} className="related-entities__row">
                <td className="related-entities__label-col">{rel.label}:</td>
                <td className="related-entities__data-col">
                  {!isExpanded ? (
                    // Collapsed: show count
                    <div className="related-entities__collapsed">
                      {count > 0 ? (
                        <span className="related-entities__count">{count} {rel.label.toLowerCase()}</span>
                      ) : (
                        <span className="related-entities__empty">—</span>
                      )}
                      {rel.expandable && canExpand && (
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
                            // Determine if this related entity has nested entities (could be expanded)
                            const hasNested = rel.expandable && canExpand;
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
                                {/* Recursive nested RelatedEntities - only if can expand and has nested relationships */}
                                {hasNested && canExpand && (
                                  <RelatedEntities
                                    entity={relatedEntity}
                                    entityType={rel.entityType}
                                    relationships={getRelationshipsForEntityType(rel.entityType)}
                                    entityPath={relatedEntityPath}
                                    maxDepth={maxDepth}
                                    className="related-entities__nested"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}
                      {rel.expandable && (
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

