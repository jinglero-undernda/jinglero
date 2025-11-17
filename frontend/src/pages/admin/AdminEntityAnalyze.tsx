/**
 * AdminEntityAnalyze - Admin page for analyzing entities with RelatedEntities in Admin Mode
 * 
 * Route: /admin/:entityType/:entityId
 * 
 * This page displays an entity with all its relationships in Admin Mode.
 * Matches the look and feel of public inspection pages but with admin capabilities.
 */

import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { adminApi } from '../../lib/api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { normalizeEntityType, getEntityTypeFromId, getEntityTypeAbbreviation } from '../../lib/utils/entityTypeUtils';
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
  const location = useLocation();

  // Normalize entity type
  const entityType = normalizeEntityType(rawEntityType);

  // State for entity data
  const [entity, setEntity] = useState<Artista | Cancion | Fabrica | Jingle | Tematica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // State to track metadata changes and force re-render when changes occur
  const [metadataHasChanges, setMetadataHasChanges] = useState(false);
  // State to track relationship changes and force re-render when changes occur
  const [relationshipHasChanges, setRelationshipHasChanges] = useState(false);
  
  // Debug: Log edit mode changes
  useEffect(() => {
    console.log('[AdminEntityAnalyze] Edit mode changed:', {
      isEditing,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
    });
  }, [isEditing, entityType, entityId]);
  
  const relatedEntitiesRef = useRef<{ 
    getRelationshipProperties: () => Record<string, { relType: string; startId: string; endId: string; properties: Record<string, unknown> }>;
    refresh: () => Promise<void>;
    hasUnsavedChanges: () => boolean;
    clearUnsavedChanges: (options?: { commit?: boolean }) => void;
  } | null>(null);
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

    // Detect entity type from ID and check if it matches the URL
    const detectedType = getEntityTypeFromId(entityId);
    if (detectedType && detectedType !== entityType) {
      console.warn('[AdminEntityAnalyze] Entity type mismatch detected:', {
        urlEntityType: entityType,
        detectedEntityType: detectedType,
        entityId,
        redirecting: true,
      });
      
      // Redirect to the correct entity type URL
      const correctAbbrev = getEntityTypeAbbreviation(detectedType);
      if (correctAbbrev) {
        const correctPath = `/admin/${correctAbbrev}/${entityId}`;
        console.log('[AdminEntityAnalyze] Redirecting to:', correctPath);
        navigate(correctPath, { replace: true });
        return;
      }
    }

    console.log('[AdminEntityAnalyze] Loading entity:', {
      entityType,
      entityId,
      rawEntityType,
      timestamp: new Date().toISOString(),
    });

    const fetchEntity = async () => {
      try {
        // CRITICAL: Clear the entity state immediately when starting to load a new entity
        // This prevents RelatedEntities from using stale entity data with mismatched entityType
        setEntity(null);
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

        console.log(`[AdminEntityAnalyze] Fetching ${apiType} with ID: ${entityId}`);

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

        console.log(`[AdminEntityAnalyze] Fetched entity:`, {
          id: fetchedEntity.id,
          type: entityType,
          hasId: !!fetchedEntity.id,
        });

        setEntity(fetchedEntity);
        // Reset all change tracking when loading new entity
        setMetadataHasChanges(false);
        setRelationshipHasChanges(false);
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

  // Task 5.5: Helper function to check for unsaved changes from both metadata and relationships
  const checkUnsavedChanges = useCallback(() => {
    // Use state variables for changes (triggers re-renders when changed)
    // Fall back to ref check if state is not yet updated
    const metadataEditorHasChanges = metadataHasChanges || (metadataEditorRef.current?.hasUnsavedChanges() || false);
    const relationshipsHaveChanges = relationshipHasChanges || (relatedEntitiesRef.current?.hasUnsavedChanges() || false);
    return metadataEditorHasChanges || relationshipsHaveChanges;
  }, [metadataHasChanges, relationshipHasChanges]);

  // Task 5.6: Note: useBlocker requires a data router (createBrowserRouter), but this app uses BrowserRouter.
  // Navigation blocking is handled via:
  // 1. beforeunload event for browser navigation (implemented below)
  // 2. Manual checks in onNavigateToEntity callback (implemented in RelatedEntities)
  // 3. For Link clicks, users will see the browser's beforeunload dialog if there are unsaved changes

  // Task 5.7: Add beforeunload event listener for browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (checkUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // Required for some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [checkUnsavedChanges]);

  /**
   * Task 7.6: Refresh relationships when navigating back from entity creation
   * 
   * This effect handles the automatic refresh of relationships after entity creation.
   * 
   * Flow:
   * 1. AdminDashboard creates entity with relationship context
   * 2. handleEntityCreated creates relationship and navigates back with state: { fromEntityCreation: true }
   * 3. This effect detects the state and calls relatedEntitiesRef.current.refresh()
   * 4. RelatedEntities re-fetches all relationships and displays the new one
   * 
   * Timing:
   * - Uses a 100ms delay to ensure the RelatedEntities component is fully mounted
   * - This prevents race conditions where refresh is called before refs are set
   */
  useEffect(() => {
    // Check if we have location state indicating we came from entity creation
    const fromEntityCreation = location?.state && typeof location.state === 'object' && 'fromEntityCreation' in location.state 
      ? (location.state as { fromEntityCreation: boolean }).fromEntityCreation 
      : false;
    const shouldRefresh = fromEntityCreation && entity && !loading && relatedEntitiesRef.current;
    
    if (shouldRefresh) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (relatedEntitiesRef.current?.refresh) {
          relatedEntitiesRef.current.refresh().catch((error) => {
            console.error('Error refreshing relationships after entity creation:', error);
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [entity, loading, location]);

  // Memoize relationships to prevent infinite loops in RelatedEntities useEffect
  // The relationships array is recreated on every render, which causes the useEffect
  // in RelatedEntities to run repeatedly, creating an infinite loop
  const relationships = useMemo(() => entityType ? getRelationshipsForEntityType(entityType) : [], [entityType]);

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
  // Note: Jingle relationships are accessed via API, not directly from entity object
  const relationshipData = undefined;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
            Visualización y edición de entidad con todas sus relaciones
          </p>
          {isEditing && (
            <span style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#ff9800',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              animation: 'pulse 2s infinite',
            }}>
              ⚠️ Modo Edición Activo
            </span>
          )}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
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
          onEditClick={() => {
            console.log('[AdminEntityAnalyze] Edit button clicked, toggling from', isEditing, 'to', !isEditing);
            const newEditingState = !isEditing;
            
            // ALWAYS reset change tracking when toggling edit mode
            // This ensures Guardar button is DEACTIVATED when entering edit mode
            setMetadataHasChanges(false);
            setRelationshipHasChanges(false);
            
            if (isEditing) {
              // Cancelling edit mode - clear any unsaved changes
              if (relatedEntitiesRef.current) {
                relatedEntitiesRef.current.clearUnsavedChanges();
              }
            } else {
              // Entering edit mode - ensure clean state
              // Clear any stale relationship changes
              if (relatedEntitiesRef.current) {
                relatedEntitiesRef.current.clearUnsavedChanges();
              }
            }
            
            setIsEditing(newEditingState);
          }}
          onSaveClick={async () => {
            console.log('[AdminEntityAnalyze] Save button clicked');
            // Phase 1: Entity-level save - trigger metadata save which also saves relationships
            // Always check for relationship properties to save, even if metadata has no changes
            const hasMetadataChanges = metadataEditorRef.current?.hasUnsavedChanges() || false;
            const hasRelationshipChanges = relatedEntitiesRef.current?.hasUnsavedChanges() || false;
            
            console.log('[AdminEntityAnalyze] Save check:', {
              hasMetadataChanges,
              hasRelationshipChanges,
            });
            
            // Save metadata if there are changes
            if (hasMetadataChanges && metadataEditorRef.current) {
              console.log('[AdminEntityAnalyze] Saving metadata changes');
              await metadataEditorRef.current.save();
            }
            
            // Save relationship properties if there are changes (even if metadata had no changes)
            if (hasRelationshipChanges && relatedEntitiesRef.current) {
              console.log('[AdminEntityAnalyze] Saving relationship property changes');
              const relationshipProps = relatedEntitiesRef.current.getRelationshipProperties();
              console.log('[AdminEntityAnalyze] Relationship properties to save:', relationshipProps);
              console.log('[AdminEntityAnalyze] RelationshipPropsData keys:', Object.keys(relatedEntitiesRef.current ? (relatedEntitiesRef.current as any).relationshipPropsData || {} : {}));
              
              if (Object.keys(relationshipProps).length > 0) {
                try {
                  // Save each relationship property update
                  for (const [key, { relType, startId, endId, properties }] of Object.entries(relationshipProps)) {
                    console.log(`[AdminEntityAnalyze] Saving relationship property for ${key}:`, {
                      relType,
                      startId,
                      endId,
                      properties,
                    });
                    
                    // Filter out empty/null values, but keep 0 (valid timestamp value)
                    const cleanProperties: Record<string, unknown> = {};
                    Object.entries(properties).forEach(([propKey, propValue]) => {
                      // Allow 0 as a valid value (timestamp can be 0)
                      if (propValue !== null && propValue !== undefined && propValue !== '') {
                        cleanProperties[propKey] = propValue;
                      } else if (typeof propValue === 'number' && propValue === 0) {
                        // Explicitly allow 0 as a valid value
                        cleanProperties[propKey] = propValue;
                      } else if (typeof propValue === 'boolean' && propValue === false) {
                        // Explicitly allow false as a valid value
                        cleanProperties[propKey] = propValue;
                      }
                    });
                    
                    console.log(`[AdminEntityAnalyze] Clean properties for ${key}:`, cleanProperties);
                    
                    if (Object.keys(cleanProperties).length > 0) {
                      console.log(`[AdminEntityAnalyze] Calling updateRelationship API for ${key}`);
                      console.log(`[AdminEntityAnalyze] API call params:`, {
                        relType,
                        startId,
                        endId,
                        cleanProperties,
                      });
                      const result = await adminApi.updateRelationship(relType, startId, endId, cleanProperties);
                      console.log(`[AdminEntityAnalyze] updateRelationship result for ${key}:`, result);
                      console.log(`[AdminEntityAnalyze] Result properties:`, result?.properties || result);
                    } else {
                      console.warn(`[AdminEntityAnalyze] No clean properties to save for ${key}`);
                    }
                  }
                  
                  // Clear unsaved changes state BEFORE refresh so the UI updates immediately
                  console.log('[AdminEntityAnalyze] Clearing unsaved changes state');
                  relatedEntitiesRef.current.clearUnsavedChanges({ commit: true });
                  setRelationshipHasChanges(false);
                  
                  // Refresh relationships to show updated properties
                  // This will re-fetch entities, and expanded relationship properties will be re-fetched
                  // because relationshipPropsData was cleared above
                  console.log('[AdminEntityAnalyze] Refreshing relationships after save');
                  await relatedEntitiesRef.current.refresh();
                  
                  console.log('[AdminEntityAnalyze] Save completed successfully');
                } catch (error) {
                  console.error('[AdminEntityAnalyze] Error saving relationship properties:', error);
                  alert(`Error al guardar propiedades de relaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                  throw error; // Re-throw to prevent clearing state on error
                }
              } else {
                console.warn('[AdminEntityAnalyze] No relationship properties to save');
              }
            }
            
            if (!hasMetadataChanges && !hasRelationshipChanges) {
              console.warn('[AdminEntityAnalyze] No changes to save');
            }
          }}
          hasUnsavedChanges={checkUnsavedChanges()}
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
          onChange={(hasChanges) => {
            setMetadataHasChanges(hasChanges);
          }}
          onSave={async (updatedEntity) => {
            setEntity(updatedEntity);
            setMetadataHasChanges(false);
            
            // Save relationship properties if any were modified
            if (relatedEntitiesRef.current) {
              const relationshipProps = relatedEntitiesRef.current.getRelationshipProperties();
              if (Object.keys(relationshipProps).length > 0) {
                try {
                  // Save each relationship property update
                  for (const [, { relType, startId, endId, properties }] of Object.entries(relationshipProps)) {
                    // Filter out empty/null values
                    const cleanProperties: Record<string, unknown> = {};
                    Object.entries(properties).forEach(([propKey, propValue]) => {
                      if (propValue !== null && propValue !== undefined && propValue !== '') {
                        cleanProperties[propKey] = propValue;
                      }
                    });
                    
                    if (Object.keys(cleanProperties).length > 0) {
                      await adminApi.updateRelationship(relType, startId, endId, cleanProperties);
                    }
                  }
                  
                  // Refresh relationships to show updated properties
                  if (relatedEntitiesRef.current) {
                    await relatedEntitiesRef.current.refresh();
                    // Clear unsaved changes state after successful save
                    relatedEntitiesRef.current.clearUnsavedChanges({ commit: true });
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
          initialRelationshipData={undefined}
          ref={relatedEntitiesRef}
          onCheckUnsavedChanges={checkUnsavedChanges}
          onChange={(hasChanges) => {
            setRelationshipHasChanges(hasChanges);
          }}
          onNavigateToEntity={(targetEntityType, targetEntityId) => {
            // Task 5.8: Check both metadata and relationship unsaved changes
            const hasUnsaved = checkUnsavedChanges();
            
            if (hasUnsaved) {
              setPendingNavigation({ entityType: targetEntityType, entityId: targetEntityId });
              setShowUnsavedModal(true);
            } else {
              // Navigate immediately if no unsaved changes
              const routePrefix = getEntityTypeAbbreviation(targetEntityType) || 'f';
              navigate(`/admin/${routePrefix}/${targetEntityId}`);
            }
          }}
        />
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        entityName={entity ? (entity as { title?: string; name?: string }).title || (entity as { title?: string; name?: string }).name || entity.id : 'esta entidad'}
        onDiscard={() => {
          setShowUnsavedModal(false);
          // Task 5.6: Proceed with navigation after discarding changes
          if (pendingNavigation) {
            const routePrefix = pendingNavigation.entityType === 'jingle' ? 'j' : pendingNavigation.entityType === 'cancion' ? 'c' : pendingNavigation.entityType === 'artista' ? 'a' : pendingNavigation.entityType === 'fabrica' ? 'f' : 't';
            navigate(`/admin/${routePrefix}/${pendingNavigation.entityId}`);
            setPendingNavigation(null);
          }
        }}
        onSave={async () => {
          console.log('[AdminEntityAnalyze] UnsavedChangesModal: Save and continue clicked');
          // Task 5.5: Save both metadata and relationship changes
          const hasMetadataChanges = metadataEditorRef.current?.hasUnsavedChanges() || false;
          const hasRelationshipChanges = relatedEntitiesRef.current?.hasUnsavedChanges() || false;
          
          // Save metadata if there are changes
          if (hasMetadataChanges && metadataEditorRef.current) {
            console.log('[AdminEntityAnalyze] UnsavedChangesModal: Saving metadata changes');
            await metadataEditorRef.current.save();
          }
          
          // Save relationship properties if there are changes
          if (hasRelationshipChanges && relatedEntitiesRef.current) {
            console.log('[AdminEntityAnalyze] UnsavedChangesModal: Saving relationship property changes');
            const relationshipProps = relatedEntitiesRef.current.getRelationshipProperties();
            if (Object.keys(relationshipProps).length > 0) {
              try {
                // Save each relationship property update
                for (const [key, { relType, startId, endId, properties }] of Object.entries(relationshipProps)) {
                  // Filter out empty/null values, but keep 0 (valid timestamp value)
                  const cleanProperties: Record<string, unknown> = {};
                  Object.entries(properties).forEach(([propKey, propValue]) => {
                    // Allow 0 as a valid value (timestamp can be 0)
                    if (propValue !== null && propValue !== undefined && propValue !== '') {
                      cleanProperties[propKey] = propValue;
                    } else if (typeof propValue === 'number' && propValue === 0) {
                      // Explicitly allow 0 as a valid value
                      cleanProperties[propKey] = propValue;
                    } else if (typeof propValue === 'boolean' && propValue === false) {
                      // Explicitly allow false as a valid value
                      cleanProperties[propKey] = propValue;
                    }
                  });
                  
                  if (Object.keys(cleanProperties).length > 0) {
                    console.log(`[AdminEntityAnalyze] UnsavedChangesModal: Saving relationship property for ${key}`);
                    await adminApi.updateRelationship(relType, startId, endId, cleanProperties);
                  }
                }
                
                // Refresh relationships to show updated properties
                await relatedEntitiesRef.current.refresh();
                // Clear unsaved changes state after successful save
                relatedEntitiesRef.current.clearUnsavedChanges({ commit: true });
                setRelationshipHasChanges(false);
                console.log('[AdminEntityAnalyze] UnsavedChangesModal: Save completed successfully');
              } catch (error) {
                console.error('[AdminEntityAnalyze] UnsavedChangesModal: Error saving relationship properties:', error);
                alert(`Error al guardar propiedades de relaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                throw error; // Re-throw to prevent navigation on error
              }
            }
          }
          
          setShowUnsavedModal(false);
          // Task 5.6: Proceed with navigation after saving
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
