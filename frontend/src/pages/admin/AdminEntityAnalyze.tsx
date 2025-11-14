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
  const [isEditing, setIsEditing] = useState(false);

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
          <Link 
            to="/admin" 
            style={{ 
              color: '#1976d2', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-block',
              marginBottom: '1rem'
            }}
          >
            ← Volver al Dashboard
          </Link>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Admin - Analizar Entidad</h1>
          <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
            Modo Administración
          </p>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          borderRadius: '8px', 
          color: '#c00',
          border: '1px solid #fcc'
        }}>
          <strong>Error:</strong> Tipo de entidad no válido: {rawEntityType || '(undefined)'}
        </div>
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
          <Link 
            to="/admin" 
            style={{ 
              color: '#1976d2', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-block',
              marginBottom: '1rem'
            }}
          >
            ← Volver al Dashboard
          </Link>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Admin - Analizar Entidad</h1>
          <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
            Modo Administración
          </p>
        </div>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <p style={{ margin: 0, color: '#666' }}>Cargando entidad...</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#999' }}>
            Tipo: {entityType}, ID: {entityId}
          </p>
        </div>
      </main>
    );
  }

  if (error || !entity) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            to="/admin" 
            style={{ 
              color: '#1976d2', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-block',
              marginBottom: '1rem'
            }}
          >
            ← Volver al Dashboard
          </Link>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Admin - Analizar Entidad</h1>
          <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
            Modo Administración
          </p>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          borderRadius: '8px', 
          color: '#c00',
          border: '1px solid #fcc',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error || 'Entidad no encontrada'}
        </div>
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          <strong>Tipo:</strong> {entityType} | <strong>ID:</strong> {entityId}
        </div>
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
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          to="/admin" 
          style={{ 
            color: '#1976d2', 
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-block',
            marginBottom: '1rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1565c0'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#1976d2'}
        >
          ← Volver al Dashboard
        </Link>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem'
          }}>
            <h1 style={{ margin: 0 }}>Admin - Analizar Entidad</h1>
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Modo Admin
            </span>
          </div>
        </div>
        <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
          Visualización y edición de entidad con todas sus relaciones
        </p>
      </div>

      {/* Entity Heading Row - matches inspection pages */}
      <div style={{ marginBottom: '2rem' }}>
        <EntityCard
          entity={entity}
          entityType={entityType}
          variant="heading"
          indentationLevel={0}
          relationshipData={relationshipData}
          showAdminEditButton={true}
          isEditing={isEditing}
          onEditClick={() => setIsEditing(!isEditing)}
        />
      </div>

      {/* Entity Metadata Editor */}
      <div style={{ marginBottom: '2rem' }}>
        <EntityMetadataEditor
          entity={entity}
          entityType={entityType}
          isEditing={isEditing}
          onEditToggle={setIsEditing}
          onSave={(updatedEntity) => {
            setEntity(updatedEntity);
            setIsEditing(false);
          }}
        />
      </div>

      {/* Related Entities - Admin Mode */}
      <div>
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
      </div>
    </main>
  );
}
