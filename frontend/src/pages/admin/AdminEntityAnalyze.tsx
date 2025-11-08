import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { normalizeEntityType } from '../../lib/utils/entityTypeUtils';
import EntityCard from '../../components/common/EntityCard';

interface RelationshipRow {
  type: string;
  direction: 'outgoing' | 'incoming';
  relatedEntity: {
    id: string;
    type: string;
    label: string;
  };
  properties?: Record<string, any>;
}

/**
 * AdminEntityAnalyze - Admin page for analyzing entities with RelatedEntities in Admin Mode
 * 
 * Route: /admin/:entityType/:entityId
 * 
 * This page displays an entity with all its relationships in Admin Mode.
 */
export default function AdminEntityAnalyze() {
  const params = useParams<{ entityType: string; entityId: string }>();
  const { entityType: rawEntityType, entityId } = params;

  // Normalize entity type
  const entityType = normalizeEntityType(rawEntityType);

  // State for entity data
  const [entity, setEntity] = useState<Artista | Cancion | Fabrica | Jingle | Tematica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for relationships table
  const [relationshipsTable, setRelationshipsTable] = useState<RelationshipRow[]>([]);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  const [relationshipsError, setRelationshipsError] = useState<string | null>(null);

  useEffect(() => {
    // Load root entity from API
    if (!entityType || !entityId) {
      setLoading(false);
      setError('Tipo de entidad o ID no válido');
      return;
    }

    const fetchEntity = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedEntity: Artista | Cancion | Fabrica | Jingle | Tematica;

        switch (entityType) {
          case 'fabrica':
            fetchedEntity = await publicApi.getFabrica(entityId);
            break;
          case 'jingle':
            const jingleResponse = await publicApi.getJingle(entityId) as Jingle;
            fetchedEntity = jingleResponse;
            break;
          case 'cancion':
            fetchedEntity = await publicApi.getCancion(entityId);
            break;
          case 'artista':
            fetchedEntity = await publicApi.getArtista(entityId);
            break;
          case 'tematica':
            fetchedEntity = await publicApi.getTematica(entityId);
            break;
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }

        setEntity(fetchedEntity);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar la entidad: ${errorMessage}`);
        console.error('Error fetching entity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [entityType, entityId]);

  // Fetch relationships for the table
  useEffect(() => {
    if (!entityType || !entityId || !entity) {
      return;
    }

    const fetchRelationships = async () => {
      try {
        setRelationshipsLoading(true);
        setRelationshipsError(null);

        // Map entity type to API format
        const apiTypeMap: Record<string, string> = {
          'fabrica': 'fabricas',
          'jingle': 'jingles',
          'cancion': 'canciones',
          'artista': 'artistas',
          'tematica': 'tematicas',
        };
        const apiType = apiTypeMap[entityType];
        if (!apiType) {
          throw new Error(`Unknown entity type: ${entityType}`);
        }

        const response = await publicApi.getEntityRelationships(apiType, entityId);
        
        // Transform the response into table rows
        const rows: RelationshipRow[] = [];
        
        // Process outgoing relationships
        if (response.outgoing && Array.isArray(response.outgoing)) {
          response.outgoing.forEach((rel: any) => {
            if (rel.type && rel.target) {
              const target = rel.target.properties || rel.target;
              const entityType = getEntityTypeFromLabel(rel.target.labels?.[0] || '');
              rows.push({
                type: rel.type,
                direction: 'outgoing',
                relatedEntity: {
                  id: target.id || '',
                  type: entityType,
                  label: getEntityLabel(target, entityType),
                },
                properties: rel.properties || {},
              });
            }
          });
        }
        
        // Process incoming relationships
        if (response.incoming && Array.isArray(response.incoming)) {
          response.incoming.forEach((rel: any) => {
            if (rel.type && rel.source) {
              const source = rel.source.properties || rel.source;
              const entityType = getEntityTypeFromLabel(rel.source.labels?.[0] || '');
              rows.push({
                type: rel.type,
                direction: 'incoming',
                relatedEntity: {
                  id: source.id || '',
                  type: entityType,
                  label: getEntityLabel(source, entityType),
                },
                properties: rel.properties || {},
              });
            }
          });
        }
        
        setRelationshipsTable(rows);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setRelationshipsError(`Error al cargar relaciones: ${errorMessage}`);
        console.error('Error fetching relationships:', err);
      } finally {
        setRelationshipsLoading(false);
      }
    };

    fetchRelationships();
  }, [entityType, entityId, entity]);

  // Helper function to get entity type from Neo4j label
  const getEntityTypeFromLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      'Fabrica': 'fabrica',
      'Jingle': 'jingle',
      'Cancion': 'cancion',
      'Artista': 'artista',
      'Tematica': 'tematica',
      'Usuario': 'usuario',
    };
    return labelMap[label] || label.toLowerCase();
  };

  // Helper function to get display label for an entity
  const getEntityLabel = (entityData: any, entityType: string): string => {
    if (entityData.title) return entityData.title;
    if (entityData.stageName) return entityData.stageName;
    if (entityData.name) return entityData.name;
    if (entityData.songTitle) return entityData.songTitle;
    if (entityData.id) return entityData.id;
    return 'Sin nombre';
  };

  // Helper function to get route prefix for entity type
  const getRoutePrefix = (entityType: string): string => {
    const routeMap: Record<string, string> = {
      'fabrica': 'f',
      'jingle': 'j',
      'cancion': 'c',
      'artista': 'a',
      'tematica': 't',
    };
    return routeMap[entityType] || entityType.charAt(0);
  };

  if (!entityType) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Admin - Analizar Entidad</h1>
        <p>Tipo de entidad no válido: {rawEntityType}</p>
        <Link to="/admin">Volver a Admin</Link>
      </main>
    );
  }

  const relationships = getRelationshipsForEntityType(entityType);

  if (loading) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/admin" style={{ color: '#1976d2', textDecoration: 'none' }}>
            ← Volver a Admin
          </Link>
        </div>
        <h1>Admin - Analizar Entidad</h1>
        <p>Cargando entidad...</p>
      </main>
    );
  }

  if (error || !entity) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/admin" style={{ color: '#1976d2', textDecoration: 'none' }}>
            ← Volver a Admin
          </Link>
        </div>
        <h1>Admin - Analizar Entidad</h1>
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
          <strong>Error:</strong> {error || 'Entidad no encontrada'}
        </div>
        <p style={{ marginTop: '1rem' }}>
          Tipo: {entityType}, ID: {entityId}
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Volver a Admin
        </Link>
      </div>

      <h1>Admin - Analizar Entidad</h1>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>Entidad Principal</h2>
        <div style={{ marginBottom: '2rem' }}>
          <EntityCard
            entity={entity}
            entityType={entityType}
            variant="card"
          />
        </div>
      </section>

      <section>
        <h2>Entidades Relacionadas (Modo Admin)</h2>
        <RelatedEntities
          entity={entity}
          entityType={entityType}
          relationships={relationships}
          entityPath={[entity.id]}
          isAdmin={true}
        />
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2>Tabla de Relaciones</h2>
        {relationshipsLoading ? (
          <p>Cargando relaciones...</p>
        ) : relationshipsError ? (
          <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
            <strong>Error:</strong> {relationshipsError}
          </div>
        ) : relationshipsTable.length === 0 ? (
          <p>No hay relaciones para esta entidad.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '1rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Tipo de Relación
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Dirección
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Tipo de Entidad
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    ID
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Nombre
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {relationshipsTable.map((rel, index) => (
                  <tr
                    key={`${rel.type}-${rel.direction}-${rel.relatedEntity.id}-${index}`}
                    style={{
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ backgroundColor: '#f0f0f0', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
                        {rel.type}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '0.875rem',
                          backgroundColor: rel.direction === 'outgoing' ? '#e3f2fd' : '#fff3e0',
                          color: rel.direction === 'outgoing' ? '#1976d2' : '#f57c00',
                        }}
                      >
                        {rel.direction === 'outgoing' ? '→ Saliente' : '← Entrante'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ textTransform: 'capitalize' }}>{rel.relatedEntity.type}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ fontSize: '0.875rem', color: '#666' }}>{rel.relatedEntity.id}</code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{rel.relatedEntity.label}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <Link
                        to={`/admin/${getRoutePrefix(rel.relatedEntity.type)}/${rel.relatedEntity.id}`}
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                        }}
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

