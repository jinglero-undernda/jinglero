import { useState, useCallback, useEffect } from 'react';
import EntityCard, { type EntityType } from './EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
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
  /** Function to get count of related entities (for "Mostrar # entidades") */
  fetchCountFn?: (entityId: string, entityType: string) => Promise<number>;
}

export interface RelatedEntitiesProps {
  /** Current entity */
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
}

/**
 * Sorts entities based on sortKey
 */
function sortEntities<T extends RelatedEntity>(
  entities: T[],
  sortKey?: RelationshipConfig['sortKey'],
  entityType?: EntityType
): T[] {
  if (!sortKey || entities.length === 0) return entities;

  const sorted = [...entities];

  switch (sortKey) {
    case 'timestamp':
      return sorted.sort((a, b) => {
        const aTimestamp = (a as Jingle).timestamp;
        const bTimestamp = (b as Jingle).timestamp;
        
        // Handle both string (HH:MM:SS) and number (seconds) formats, and null/undefined
        let aSeconds: number;
        let bSeconds: number;
        
        if (aTimestamp == null) {
          aSeconds = 0;
        } else if (typeof aTimestamp === 'string') {
          // Parse HH:MM:SS format to seconds
          const parts = aTimestamp.split(':');
          if (parts.length === 3) {
            aSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
          } else {
            aSeconds = 0;
          }
        } else if (typeof aTimestamp === 'number') {
          aSeconds = aTimestamp;
        } else {
          aSeconds = 0;
        }
        
        if (bTimestamp == null) {
          bSeconds = 0;
        } else if (typeof bTimestamp === 'string') {
          const parts = bTimestamp.split(':');
          if (parts.length === 3) {
            bSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
          } else {
            bSeconds = 0;
          }
        } else if (typeof bTimestamp === 'number') {
          bSeconds = bTimestamp;
        } else {
          bSeconds = 0;
        }
        
        return aSeconds - bSeconds;
      });

    case 'date':
      return sorted.sort((a, b) => {
        const aDate = (a as Fabrica).date || (a as Jingle).createdAt || '';
        const bDate = (b as Fabrica).date || (b as Jingle).createdAt || '';
        return new Date(bDate).getTime() - new Date(aDate).getTime(); // Descending
      });

    case 'stageName':
      return sorted.sort((a, b) => {
        const aName = (a as Artista).stageName || (a as Artista).name || '';
        const bName = (b as Artista).stageName || (b as Artista).name || '';
        return aName.localeCompare(bName);
      });

    case 'title':
      return sorted.sort((a, b) => {
        const aTitle = (a as Cancion | Fabrica | Jingle).title || '';
        const bTitle = (b as Cancion | Fabrica | Jingle).title || '';
        return aTitle.localeCompare(bTitle);
      });

    case 'name':
      return sorted.sort((a, b) => {
        const aName = (a as Tematica | Artista).name || '';
        const bName = (b as Tematica | Artista).name || '';
        return aName.localeCompare(bName);
      });

    case 'category':
      // For tematicas: sort by category first, then name
      if (entityType === 'tematica') {
        return sorted.sort((a, b) => {
          const aCat = (a as Tematica).category || '';
          const bCat = (b as Tematica).category || '';
          if (aCat !== bCat) return aCat.localeCompare(bCat);
          const aName = (a as Tematica).name || '';
          const bName = (b as Tematica).name || '';
          return aName.localeCompare(bName);
        });
      }
      return sorted;

    default:
      return sorted;
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
 * - Expand/collapse with "Mostrar # entidades" for >5 items
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
}: RelatedEntitiesProps) {
  // Track expanded relationships and loaded data
  // Auto-expand first level (entityPath.length === 0 means it's the top level)
  const [expandedRelationships, setExpandedRelationships] = useState<Set<string>>(
    entityPath.length === 0 ? new Set(relationships.map(rel => `${rel.label}-${rel.entityType}`)) : new Set()
  );
  const [loadedData, setLoadedData] = useState<Record<string, RelatedEntity[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showAllForRelationship, setShowAllForRelationship] = useState<Set<string>>(new Set());

  // Check if we've exceeded max depth
  const currentDepth = entityPath.length;
  const canExpand = currentDepth < maxDepth;

  // Helper to create relationship key
  const getRelationshipKey = useCallback((rel: RelationshipConfig) => `${rel.label}-${rel.entityType}`, []);

  // Auto-load first level relationships on mount
  useEffect(() => {
    if (entityPath.length === 0) {
      // This is the top level - auto-expand and load all relationships
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
      };
      loadRelationships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount for top level

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

  // Handle "Mostrar # entidades" expand
  const handleShowAll = useCallback(
    async (rel: RelationshipConfig) => {
      const key = getRelationshipKey(rel);
      setShowAllForRelationship((prev) => new Set(prev).add(key));

      if (!loadedData[key] && !loadingStates[key]) {
        setLoadingStates((prev) => ({ ...prev, [key]: true }));
        try {
          const entities = await rel.fetchFn(entity.id, entityType);
          const sorted = sortEntities(entities, rel.sortKey, rel.entityType);
          const filtered = sorted.filter((e) => !entityPath.includes(e.id));
          setLoadedData((prev) => ({ ...prev, [key]: filtered }));
          setCounts((prev) => ({ ...prev, [key]: filtered.length }));
        } catch (error) {
          console.error(`Error loading all ${rel.label}:`, error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, [key]: false }));
        }
      }
    },
    [entity.id, entityType, entityPath, loadedData, loadingStates]
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
            const showAll = showAllForRelationship.has(key);
            const hasMoreThan5 = count > 5;
            const displayEntities = hasMoreThan5 && !showAll ? entities.slice(0, 5) : entities;
            const remainingCount = hasMoreThan5 && !showAll ? count - 5 : 0;

            return (
              <tr key={key} className="related-entities__row">
                <td className="related-entities__label-col">{rel.label}:</td>
                <td className="related-entities__data-col">
                  {!isExpanded ? (
                    // Collapsed: show count or "Mostrar # entidades" if >5
                    <div className="related-entities__collapsed">
                      {hasMoreThan5 ? (
                        <button
                          className="related-entities__show-all-btn"
                          onClick={() => handleShowAll(rel)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Cargando...' : `Mostrar ${count} ${rel.label.toLowerCase()}`}
                        </button>
                      ) : count > 0 ? (
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
                      ) : displayEntities.length === 0 ? (
                        <div className="related-entities__empty">No hay entidades relacionadas</div>
                      ) : (
                        <>
                          {displayEntities.map((relatedEntity) => {
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
                          {remainingCount > 0 && (
                            <button
                              className="related-entities__show-more-btn"
                              onClick={() => handleShowAll(rel)}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Cargando...' : `Mostrar ${remainingCount} más`}
                            </button>
                          )}
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

