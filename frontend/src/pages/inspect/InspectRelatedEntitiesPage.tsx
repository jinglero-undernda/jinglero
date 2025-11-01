import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import type { EntityType } from '../../components/common/EntityCard';

/**
 * InspectRelatedEntitiesPage - Demo/Test page for RelatedEntities component
 * 
 * Route: /inspect-related/:entityType/:entityId
 * 
 * This page demonstrates the RelatedEntities component with nested table display.
 */
export default function InspectRelatedEntitiesPage() {
  const params = useParams<{ entityType: string; entityId: string }>();
  const { entityType: rawEntityType, entityId } = params;

  // Normalize entity type
  const entityTypeMap: Record<string, EntityType> = {
    f: 'fabrica',
    j: 'jingle',
    c: 'cancion',
    a: 'artista',
    t: 'tematica',
  };

  const entityType = rawEntityType ? entityTypeMap[rawEntityType] : null;

  // State for entity data
  const [entity, setEntity] = useState<Artista | Cancion | Fabrica | Jingle | Tematica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch entity data from API
    if (!entityType || !entityId) {
      setLoading(false);
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
            // Note: getJingle returns a response with relationships, but we just need the jingle part
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

  if (!entityType) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Inspect Related Entities</h1>
        <p>Tipo de entidad no válido: {rawEntityType}</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  const relationships = getRelationshipsForEntityType(entityType);

  if (loading) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>
        <h1>RelatedEntities Demo: {entityType}</h1>
        <p>Cargando entidad...</p>
      </main>
    );
  }

  if (error || !entity) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>
        <h1>RelatedEntities Demo: {entityType}</h1>
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
          <strong>Error:</strong> {error || 'Entidad no encontrada'}
        </div>
        <p style={{ marginTop: '1rem' }}>
          ID: {entityId}
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Volver al inicio
        </Link>
      </div>

      <h1>RelatedEntities Demo: {entityType}</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Componente de demostración para mostrar entidades relacionadas en formato de tabla anidada.
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Entidad Principal</h2>
        <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '2rem', color: '#000' }}>
          <div><strong>{entityType}:</strong> {entity.id}</div>
          {entityType === 'fabrica' && (entity as Fabrica).title && (
            <div><strong>Título:</strong> {(entity as Fabrica).title}</div>
          )}
          {entityType === 'jingle' && (entity as Jingle).title && (
            <div><strong>Título:</strong> {(entity as Jingle).title}</div>
          )}
          {entityType === 'cancion' && (entity as Cancion).title && (
            <div><strong>Título:</strong> {(entity as Cancion).title}</div>
          )}
          {entityType === 'artista' && (entity as Artista).stageName && (
            <div><strong>Nombre Artístico:</strong> {(entity as Artista).stageName}</div>
          )}
          {entityType === 'tematica' && (entity as Tematica).name && (
            <div><strong>Nombre:</strong> {(entity as Tematica).name}</div>
          )}
        </div>

        <h2>Entidades Relacionadas</h2>
        <RelatedEntities
          entity={entity}
          entityType={entityType}
          relationships={relationships}
          entityPath={[entity.id]}
        />
      </section>

      <section>
        <h2>Configuración de Relaciones</h2>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            color: '#000',
          }}
        >
          {JSON.stringify(relationships.map((r) => ({ label: r.label, entityType: r.entityType, sortKey: r.sortKey })), null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Navegación Rápida</h2>
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Link to="/inspect-related/f/test-fabrica" style={{ color: '#1976d2' }}>
            Fabrica
          </Link>
          <Link to="/inspect-related/j/test-jingle" style={{ color: '#1976d2' }}>
            Jingle
          </Link>
          <Link to="/inspect-related/c/test-cancion" style={{ color: '#1976d2' }}>
            Cancion
          </Link>
          <Link to="/inspect-related/a/test-artista" style={{ color: '#1976d2' }}>
            Artista
          </Link>
          <Link to="/inspect-related/t/test-tematica" style={{ color: '#1976d2' }}>
            Tematica
          </Link>
        </nav>
      </section>
    </main>
  );
}


