/**
 * AdminEntityAnalyze - Admin page for analyzing entities with RelatedEntities in Admin Mode
 * 
 * Route: /admin/:entityType/:entityId
 * 
 * This page displays an entity with all its relationships in Admin Mode.
 * Matches the look and feel of public inspection pages but with admin capabilities.
 */

import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { adminApi } from '../../lib/api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { normalizeEntityType } from '../../lib/utils/entityTypeUtils';
import EntityCard from '../../components/common/EntityCard';
import EntityMetadataEditor from '../../components/admin/EntityMetadataEditor';

/**
 * AdminEntityAnalyze - Admin page for analyzing entities with RelatedEntities in Admin Mode
 * 
 * Route: /admin/:entityType/:entityId
 * 
 * This page displays an entity with all its relationships in Admin Mode.
 */
export default function AdminEntityAnalyze() {
  console.log('=== AdminEntityAnalyze COMPONENT RENDERED ===');
  
  const params = useParams<{ entityType: string; entityId: string }>();
  const { entityType: rawEntityType, entityId } = params;

  console.log('Params:', params, 'rawEntityType:', rawEntityType, 'entityId:', entityId);

  // Normalize entity type
  const entityType = normalizeEntityType(rawEntityType);

  // Debug logging
  console.log('AdminEntityAnalyze - rawEntityType:', rawEntityType, 'entityId:', entityId, 'normalized:', entityType);

  // State for entity data
  const [entity, setEntity] = useState<Artista | Cancion | Fabrica | Jingle | Tematica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load root entity from admin API
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

        // Map entity type to admin API methods
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

        switch (apiType) {
          case 'fabricas':
            fetchedEntity = await adminApi.getFabrica(entityId);
            break;
          case 'jingles':
            fetchedEntity = await adminApi.getJingle(entityId);
            break;
          case 'canciones':
            fetchedEntity = await adminApi.getCancion(entityId);
            break;
          case 'artistas':
            fetchedEntity = await adminApi.getArtista(entityId);
            break;
          case 'tematicas':
            fetchedEntity = await adminApi.getTematica(entityId);
            break;
          default:
            throw new Error(`Unknown entity type: ${apiType}`);
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
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/admin" style={{ color: '#1976d2', textDecoration: 'none' }}>
            ← Volver a Admin
          </Link>
        </div>
        <h1>Admin - Analizar Entidad</h1>
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
          <strong>Error:</strong> Tipo de entidad no válido: {rawEntityType || '(undefined)'}
        </div>
        <p style={{ marginTop: '1rem' }}>
          Parámetros de ruta: entityType={rawEntityType}, entityId={entityId}
        </p>
      </main>
    );
  }

  const relationships = getRelationshipsForEntityType(entityType);

  // Debug logging for state
  console.log('AdminEntityAnalyze render - loading:', loading, 'error:', error, 'entity:', entity);

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
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Tipo: {entityType}, ID: {entityId}
        </p>
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
        <details style={{ marginTop: '1rem' }}>
          <summary>Debug Info</summary>
          <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
            {JSON.stringify({ loading, error, entity: entity ? 'exists' : 'null', entityType, entityId }, null, 2)}
          </pre>
        </details>
      </main>
    );
  }

  // Extract relationship data for EntityCard (similar to inspection pages)
  const relationshipData = entity && 'fabrica' in entity ? {
    fabrica: (entity as Jingle).fabrica,
    cancion: (entity as Jingle).cancion,
    jingleros: (entity as Jingle).jingleros,
    autores: (entity as Jingle).autores,
    tematicas: (entity as Jingle).tematicas,
  } : undefined;

  // This check is redundant but kept for safety - the earlier check should catch this
  // But we'll keep it to ensure we always render something

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Volver a Admin
        </Link>
      </div>

      {/* Debug info */}
      <div style={{ padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
        Debug: Entity loaded - {entity ? `ID: ${entity.id}` : 'null'} | Type: {entityType}
      </div>

      {/* Entity Heading Row - matches inspection pages */}
      <EntityCard
        entity={entity}
        entityType={entityType}
        variant="heading"
        indentationLevel={0}
        relationshipData={relationshipData}
      />

      {/* Entity Metadata Editor */}
      <EntityMetadataEditor
        entity={entity}
        entityType={entityType}
        onSave={(updatedEntity) => {
          setEntity(updatedEntity);
        }}
      />

      {/* Related Entities - Admin Mode */}
      <RelatedEntities
        entity={entity}
        entityType={entityType}
        relationships={relationships}
        entityPath={[entity.id]}
        isAdmin={true}
        initialRelationshipData={relationshipData ? {
          'Fabrica-fabrica': relationshipData.fabrica ? [relationshipData.fabrica] : [],
          'Cancion-cancion': relationshipData.cancion ? [relationshipData.cancion] : [],
          'Autor-artista': relationshipData.autores || [],
          'Jinglero-artista': relationshipData.jingleros || [],
          'Tematicas-tematica': relationshipData.tematicas || [],
        } : undefined}
      />
    </main>
  );
}
