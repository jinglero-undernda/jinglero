import { useEffect, useState } from 'react';
import EntityCard, { type EntityType } from '../../../../components/common/EntityCard';
import { publicApi } from '../../../../lib/api';
import type { Jingle, Fabrica, Cancion, Artista, Tematica } from '../../../../types';
import { getRelationshipsForEntityType } from '../../../../lib/utils/relationshipConfigs';

// Extended Jingle type that includes relationship data from API
interface JingleWithRelationships extends Jingle {
  fabrica?: Fabrica | null;
  cancion?: Cancion | null;
  jingleros?: Artista[];
  autores?: Artista[];
  tematicas?: Tematica[];
  repeats?: Jingle[];
}

type Entity = Jingle | Fabrica | Cancion | Artista | Tematica;

export default function ComponentsShowcase() {
  // State for entity IDs
  const [entityIds, setEntityIds] = useState<Record<EntityType, string>>({
    jingle: '',
    fabrica: '',
    cancion: '',
    artista: '',
    tematica: '',
  });

  // State for loaded entities
  const [entities, setEntities] = useState<Record<EntityType, Entity | null>>({
    jingle: null,
    fabrica: null,
    cancion: null,
    artista: null,
    tematica: null,
  });

  // State for loading states
  const [loading, setLoading] = useState<Record<EntityType, boolean>>({
    jingle: false,
    fabrica: false,
    cancion: false,
    artista: false,
    tematica: false,
  });

  // State for error states
  const [errors, setErrors] = useState<Record<EntityType, string | null>>({
    jingle: null,
    fabrica: null,
    cancion: null,
    artista: null,
    tematica: null,
  });

  // State for nested entities (for nested context examples)
  const [nestedEntities, setNestedEntities] = useState<Record<EntityType, {
    level1: Array<{ entity: Entity; type: EntityType }>;
    level2: Array<{ entity: Entity; type: EntityType }>;
  }>>({
    jingle: { level1: [], level2: [] },
    fabrica: { level1: [], level2: [] },
    cancion: { level1: [], level2: [] },
    artista: { level1: [], level2: [] },
    tematica: { level1: [], level2: [] },
  });

  // Load default entities on mount
  useEffect(() => {
    const loadDefaultEntities = async () => {
      try {
        // Fetch first entity of each type
        const [jingles, fabricas, canciones, artistas, tematicas] = await Promise.all([
          publicApi.getJingles().catch(() => []),
          publicApi.getFabricas().catch(() => []),
          publicApi.getCanciones().catch(() => []),
          publicApi.getArtistas().catch(() => []),
          publicApi.getTematicas().catch(() => []),
        ]);

        // Set default IDs
        const defaultIds: Record<EntityType, string> = {
          jingle: jingles.length > 0 ? jingles[0].id : '',
          fabrica: fabricas.length > 0 ? fabricas[0].id : '',
          cancion: canciones.length > 0 ? canciones[0].id : '',
          artista: artistas.length > 0 ? artistas[0].id : '',
          tematica: tematicas.length > 0 ? tematicas[0].id : '',
        };

        setEntityIds(defaultIds);
      } catch (error) {
        console.error('Error loading default entities:', error);
      }
    };

    loadDefaultEntities();
  }, []);

  // Fetch entities when IDs change
  useEffect(() => {
    const fetchEntity = async (type: EntityType, id: string) => {
      if (!id) {
        setEntities(prev => ({ ...prev, [type]: null }));
        setNestedEntities(prev => ({ ...prev, [type]: { level1: [], level2: [] } }));
        return;
      }

      try {
        setLoading(prev => ({ ...prev, [type]: true }));
        setErrors(prev => ({ ...prev, [type]: null }));

        let fetchedEntity: Entity;

        switch (type) {
          case 'jingle':
            fetchedEntity = await publicApi.getJingle(id) as JingleWithRelationships;
            break;
          case 'fabrica':
            fetchedEntity = await publicApi.getFabrica(id);
            break;
          case 'cancion':
            fetchedEntity = await publicApi.getCancion(id);
            break;
          case 'artista':
            fetchedEntity = await publicApi.getArtista(id);
            break;
          case 'tematica':
            fetchedEntity = await publicApi.getTematica(id);
            break;
          default:
            throw new Error(`Unknown entity type: ${type}`);
        }

        setEntities(prev => ({ ...prev, [type]: fetchedEntity }));

        // Load nested entities for nested context examples
        await loadNestedEntities(type, fetchedEntity);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load entity';
        setErrors(prev => ({ ...prev, [type]: errorMessage }));
        setEntities(prev => ({ ...prev, [type]: null }));
        setNestedEntities(prev => ({ ...prev, [type]: { level1: [], level2: [] } }));
      } finally {
        setLoading(prev => ({ ...prev, [type]: false }));
      }
    };

    // Fetch all entities when IDs change
    Object.entries(entityIds).forEach(([type, id]) => {
      fetchEntity(type as EntityType, id);
    });
  }, [entityIds]);

  // Load nested entities for nested context examples
  const loadNestedEntities = async (type: EntityType, entity: Entity) => {
    try {
      const relationships = getRelationshipsForEntityType(type);
      const level1Entities: Array<{ entity: Entity; type: EntityType }> = [];
      const level2Entities: Array<{ entity: Entity; type: EntityType }> = [];

      // Load first level relationships
      for (const rel of relationships.slice(0, 3)) { // Limit to first 3 relationships
        try {
          const related = await rel.fetchFn(entity.id, type);
          // Add entities with their types
          level1Entities.push(...related.slice(0, 2).map(e => ({ entity: e, type: rel.entityType }))); // Limit to first 2 entities per relationship

          // Load second level for first entity of each relationship
          if (related.length > 0) {
            const nestedRelationships = getRelationshipsForEntityType(rel.entityType);
            if (nestedRelationships.length > 0) {
              try {
                const nestedRel = nestedRelationships[0];
                const nested = await nestedRel.fetchFn(related[0].id, rel.entityType);
                level2Entities.push(...nested.slice(0, 1).map(e => ({ entity: e, type: nestedRel.entityType }))); // Limit to first 1 entity
              } catch {
                // Ignore errors loading nested entities
              }
            }
          }
        } catch {
          // Ignore errors loading relationships
        }
      }

      setNestedEntities(prev => ({
        ...prev,
        [type]: { level1: level1Entities, level2: level2Entities },
      }));
    } catch (error) {
      console.error(`Error loading nested entities for ${type}:`, error);
    }
  };

  // Handle ID input changes
  const handleIdChange = (type: EntityType, id: string) => {
    setEntityIds(prev => ({ ...prev, [type]: id }));
  };

  // Get relationship data for EntityCard
  const getRelationshipData = (type: EntityType, entity: Entity): Record<string, unknown> | undefined => {
    if (type === 'jingle') {
      const jingle = entity as JingleWithRelationships;
      return {
        fabrica: jingle.fabrica,
        cancion: jingle.cancion,
        jingleros: jingle.jingleros,
        autores: jingle.autores,
        tematicas: jingle.tematicas,
      };
    }
    return undefined;
  };

  // Render entity input section
  const renderEntityInputs = () => {
    const entityLabels: Record<EntityType, string> = {
      jingle: 'Jingle',
      fabrica: 'Fabrica',
      cancion: 'Cancion',
      artista: 'Artista',
      tematica: 'Tematica',
    };

    return (
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Entity Selection</h3>
        <p>Enter entity IDs to view EntityCard examples. Defaults to first entity of each type on load.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {(Object.keys(entityIds) as EntityType[]).map((type) => (
            <div key={type}>
              <label htmlFor={`entity-id-${type}`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {entityLabels[type]} ID:
              </label>
              <input
                id={`entity-id-${type}`}
                type="text"
                value={entityIds[type]}
                onChange={(e) => handleIdChange(type, e.target.value)}
                placeholder={`Enter ${entityLabels[type]} ID`}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              {loading[type] && <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Loading...</div>}
              {errors[type] && (
                <div style={{ fontSize: '0.875rem', color: '#d32f2f', marginTop: '0.25rem' }}>
                  Error: {errors[type]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render entity variants section
  const renderEntityVariants = (type: EntityType) => {
    const entity = entities[type];
    if (!entity) return null;

    const entityLabels: Record<EntityType, string> = {
      jingle: 'Jingle',
      fabrica: 'Fabrica',
      cancion: 'Cancion',
      artista: 'Artista',
      tematica: 'Tematica',
    };

    const relationshipData = getRelationshipData(type, entity);

    return (
      <div key={type} style={{ marginBottom: '3rem' }}>
        <h3>{entityLabels[type]} Variants</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h4>Heading Variant</h4>
            <EntityCard
              entity={entity}
              entityType={type}
              variant="heading"
              relationshipData={relationshipData}
            />
          </div>
          <div>
            <h4>Contents Variant</h4>
            <EntityCard
              entity={entity}
              entityType={type}
              variant="contents"
              relationshipData={relationshipData}
            />
          </div>
          <div>
            <h4>Placeholder Variant</h4>
            <EntityCard
              entity={entity}
              entityType={type}
              variant="placeholder"
              placeholderMessage={`No ${entityLabels[type].toLowerCase()} found`}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render nested context section
  const renderNestedContext = (type: EntityType) => {
    const entity = entities[type];
    if (!entity) return null;

    const entityLabels: Record<EntityType, string> = {
      jingle: 'Jingle',
      fabrica: 'Fabrica',
      cancion: 'Cancion',
      artista: 'Artista',
      tematica: 'Tematica',
    };

    const relationshipData = getRelationshipData(type, entity);
    const nested = nestedEntities[type];

    return (
      <div key={`nested-${type}`} style={{ marginBottom: '3rem' }}>
        <h3>{entityLabels[type]} Nested Context (2 Levels Expanded)</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Showing the same entity with nested relationships expanded to demonstrate EntityCard in hierarchical contexts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {/* Parent EntityCard */}
          <div>
            <EntityCard
              entity={entity}
              entityType={type}
              variant="heading"
              indentationLevel={0}
              hasNestedEntities={nested.level1.length > 0}
              isExpanded={true}
              nestedCount={nested.level1.length}
              relationshipData={relationshipData}
            />
          </div>

          {/* First level nested entities */}
          {nested.level1.map((nestedItem, index) => (
            <div key={`level1-${index}`}>
              <EntityCard
                entity={nestedItem.entity}
                entityType={nestedItem.type}
                variant="contents"
                indentationLevel={1}
                hasNestedEntities={nested.level2.length > 0 && index === 0}
                isExpanded={nested.level2.length > 0 && index === 0}
                nestedCount={nested.level2.length}
              />
            </div>
          ))}

          {/* Second level nested entities */}
          {nested.level2.map((nestedItem, index) => (
            <div key={`level2-${index}`}>
              <EntityCard
                entity={nestedItem.entity}
                entityType={nestedItem.type}
                variant="contents"
                indentationLevel={2}
              />
            </div>
          ))}

          {nested.level1.length === 0 && (
            <div style={{ padding: '1rem', color: '#666', fontStyle: 'italic' }}>
              No nested relationships available for this entity.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="components-showcase">
      <h2>EntityCard Showcase</h2>
      <p>Comprehensive showcase of EntityCard component for all entity types, including variants and nested context examples.</p>

      {renderEntityInputs()}

      <div style={{ marginTop: '2rem' }}>
        <h2>Entity Variants</h2>
        <p>Each entity type displayed in heading, contents, and placeholder variants.</p>
        {(Object.keys(entities) as EntityType[]).map((type) => renderEntityVariants(type))}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Nested Context Examples</h2>
        <p>Each entity shown with 2 levels of nested relationships expanded, demonstrating EntityCard in hierarchical contexts.</p>
        {(Object.keys(entities) as EntityType[]).map((type) => renderNestedContext(type))}
      </div>
    </div>
  );
}
