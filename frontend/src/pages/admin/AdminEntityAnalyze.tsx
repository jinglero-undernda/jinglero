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
        
        console.log('API Response:', response);
        
        // Transform the response into table rows
        const rows: RelationshipRow[] = [];
        
        // Process outgoing relationships
        if (response.outgoing && Array.isArray(response.outgoing)) {
          response.outgoing.forEach((rel: any) => {
            console.log('Processing outgoing relationship:', rel);
            if (rel.type) {
              // Handle different response structures
              let target: any = null;
              let targetLabels: string[] = [];
              
              if (rel.target) {
                // Neo4j node structure
                if (rel.target.properties) {
                  target = rel.target.properties;
                  targetLabels = rel.target.labels || [];
                } else {
                  target = rel.target;
                }
              } else if (rel.end) {
                // Alternative structure
                target = rel.end.properties || rel.end;
                targetLabels = rel.end.labels || [];
              }
              
              if (target && target.id) {
                const entityType = getEntityTypeFromLabel(targetLabels[0] || '');
                rows.push({
                  type: rel.type,
                  direction: 'outgoing',
                  relatedEntity: {
                    id: target.id,
                    type: entityType,
                    label: getEntityLabel(target, entityType),
                  },
                  properties: rel.properties || {},
                });
              }
            }
          });
        }
        
        // Process incoming relationships
        if (response.incoming && Array.isArray(response.incoming)) {
          response.incoming.forEach((rel: any) => {
            console.log('Processing incoming relationship:', rel);
            if (rel.type) {
              // Handle different response structures
              let source: any = null;
              let sourceLabels: string[] = [];
              
              if (rel.source) {
                // Neo4j node structure
                if (rel.source.properties) {
                  source = rel.source.properties;
                  sourceLabels = rel.source.labels || [];
                } else {
                  source = rel.source;
                }
              } else if (rel.start) {
                // Alternative structure
                source = rel.start.properties || rel.start;
                sourceLabels = rel.start.labels || [];
              }
              
              if (source && source.id) {
                const entityType = getEntityTypeFromLabel(sourceLabels[0] || '');
                rows.push({
                  type: rel.type,
                  direction: 'incoming',
                  relatedEntity: {
                    id: source.id,
                    type: entityType,
                    label: getEntityLabel(source, entityType),
                  },
                  properties: rel.properties || {},
                });
              }
            }
          });
        }
        
        console.log('Processed rows:', rows);
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

      <section style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <h2>Tabla de Entidades y Relaciones (Modo Admin)</h2>
        {relationshipsLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cargando relaciones...</p>
          </div>
        ) : relationshipsError ? (
          <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
            <strong>Error:</strong> {relationshipsError}
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <details>
                <summary>Ver detalles técnicos</summary>
                <pre style={{ marginTop: '0.5rem', fontSize: '0.75rem', overflow: 'auto' }}>
                  {relationshipsError}
                </pre>
              </details>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Entidad
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Tipo
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    ID
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Relación
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Dirección
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Main entity row - always show */}
                <tr
                  style={{
                    borderBottom: '2px solid #ddd',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd', fontWeight: '600' }}>
                    {getEntityLabel(entity, entityType)}
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                    <span style={{ textTransform: 'capitalize' }}>{entityType}</span>
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                    <code style={{ fontSize: '0.875rem', color: '#666' }}>{entity.id}</code>
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd', fontStyle: 'italic', color: '#999' }}>
                    Entidad Principal
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                    <span style={{ fontStyle: 'italic', color: '#999' }}>—</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontStyle: 'italic', color: '#999' }}>—</span>
                  </td>
                </tr>
                {/* Related entities rows */}
                {relationshipsTable.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                      No hay relaciones para esta entidad.
                    </td>
                  </tr>
                ) : (
                  relationshipsTable.map((rel, index) => (
                    <tr
                      key={`${rel.type}-${rel.direction}-${rel.relatedEntity.id}-${index}`}
                      style={{
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        {rel.relatedEntity.label}
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        <span style={{ textTransform: 'capitalize' }}>{rel.relatedEntity.type}</span>
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        <code style={{ fontSize: '0.875rem', color: '#666' }}>{rel.relatedEntity.id}</code>
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        <code style={{ backgroundColor: '#f0f0f0', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
                          {rel.type}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

