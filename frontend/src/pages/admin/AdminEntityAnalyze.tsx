/**
 * AdminEntityAnalyze - Admin page for analyzing entities with RelatedEntities in Admin Mode
 * 
 * Route: /admin/:entityType/:entityId
 * 
 * This page displays an entity with all its relationships in Admin Mode.
 * Matches the look and feel of public inspection pages but with admin capabilities.
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { adminApi } from '../../lib/api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { normalizeEntityType } from '../../lib/utils/entityTypeUtils';
import EntityCard from '../../components/common/EntityCard';
import EntityMetadataEditor from '../../components/admin/EntityMetadataEditor';
import UnsavedChangesModal from '../../components/admin/UnsavedChangesModal';
import type { EntityType } from '../../components/common/EntityCard';

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
  const navigate = useNavigate();

  // Normalize entity type
  const entityType = normalizeEntityType(rawEntityType);

  // State for entity data
  const [entity, setEntity] = useState<Artista | Cancion | Fabrica | Jingle | Tematica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const relatedEntitiesRef = useRef<{ getRelationshipProperties: () => Record<string, { relType: string; startId: string; endId: string; properties: Record<string, any> }> } | null>(null);
  const metadataEditorRef = useRef<{ hasUnsavedChanges: () => boolean; save: () => Promise<void> } | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<{ entityType: EntityType; entityId: string } | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

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

  // Memoize relationships to prevent infinite loops in RelatedEntities useEffect
  // The relationships array is recreated on every render, which causes the useEffect
  // in RelatedEntities to run repeatedly, creating an infinite loop
  const relationships = useMemo(() => getRelationshipsForEntityType(entityType), [entityType]);

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
          ref={metadataEditorRef}
          entity={entity}
          entityType={entityType}
          isEditing={isEditing}
          onEditToggle={setIsEditing}
          onSave={async (updatedEntity) => {
            setEntity(updatedEntity);
            
            // Save relationship properties if any were modified
            if (relatedEntitiesRef.current) {
              const relationshipProps = relatedEntitiesRef.current.getRelationshipProperties();
              if (Object.keys(relationshipProps).length > 0) {
                try {
                  // Save each relationship property update
                  for (const [key, { relType, startId, endId, properties }] of Object.entries(relationshipProps)) {
                    // Filter out empty/null values
                    const cleanProperties: Record<string, any> = {};
                    Object.entries(properties).forEach(([propKey, propValue]) => {
                      if (propValue !== null && propValue !== undefined && propValue !== '') {
                        cleanProperties[propKey] = propValue;
                      }
                    });
                    
                    if (Object.keys(cleanProperties).length > 0) {
                      await adminApi.updateRelationship(relType, startId, endId, cleanProperties);
                    }
                  }
                } catch (error) {
                  console.error('Error saving relationship properties:', error);
                  alert(`Error al guardar propiedades de relaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                }
              }
            }
            
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
          isEditing={isEditing}
          onEditToggle={setIsEditing}
          initialRelationshipData={relationshipData ? {
            'Fabrica-fabrica': relationshipData.fabrica ? [relationshipData.fabrica] : [],
            'Cancion-cancion': relationshipData.cancion ? [relationshipData.cancion] : [],
            'Autor-artista': relationshipData.autores || [],
            'Jinglero-artista': relationshipData.jingleros || [],
            'Tematicas-tematica': relationshipData.tematicas || [],
          } : undefined}
          ref={relatedEntitiesRef}
          onCheckUnsavedChanges={() => {
            return metadataEditorRef.current?.hasUnsavedChanges() || false;
          }}
          onNavigateToEntity={(targetEntityType, targetEntityId) => {
            const hasUnsaved = metadataEditorRef.current?.hasUnsavedChanges() || false;
            
            if (hasUnsaved) {
              setPendingNavigation({ entityType: targetEntityType, entityId: targetEntityId });
              setShowUnsavedModal(true);
            } else {
              // Navigate immediately if no unsaved changes
              const routePrefix = targetEntityType === 'jingle' ? 'j' : targetEntityType === 'cancion' ? 'c' : targetEntityType === 'artista' ? 'a' : targetEntityType === 'fabrica' ? 'f' : 't';
              navigate(`/admin/${routePrefix}/${targetEntityId}`);
            }
          }}
        />
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        entityName={entity ? (entity as any).title || (entity as any).name || entity.id : 'esta entidad'}
        onDiscard={() => {
          setShowUnsavedModal(false);
          if (pendingNavigation) {
            const routePrefix = pendingNavigation.entityType === 'jingle' ? 'j' : pendingNavigation.entityType === 'cancion' ? 'c' : pendingNavigation.entityType === 'artista' ? 'a' : pendingNavigation.entityType === 'fabrica' ? 'f' : 't';
            navigate(`/admin/${routePrefix}/${pendingNavigation.entityId}`);
            setPendingNavigation(null);
          }
        }}
        onSave={async () => {
          if (metadataEditorRef.current) {
            await metadataEditorRef.current.save();
          }
          setShowUnsavedModal(false);
          if (pendingNavigation) {
            const routePrefix = pendingNavigation.entityType === 'jingle' ? 'j' : pendingNavigation.entityType === 'cancion' ? 'c' : pendingNavigation.entityType === 'artista' ? 'a' : pendingNavigation.entityType === 'fabrica' ? 'f' : 't';
            navigate(`/admin/${routePrefix}/${pendingNavigation.entityId}`);
            setPendingNavigation(null);
          }
        }}
        onCancel={() => {
          setShowUnsavedModal(false);
          setPendingNavigation(null);
        }}
      />
    </main>
  );
}
