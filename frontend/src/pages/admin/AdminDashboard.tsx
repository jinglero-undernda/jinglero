/**
 * AdminDashboard Component
 * 
 * Comprehensive admin dashboard with:
 * - Entity counts for each type
 * - Validation status overview
 * - Quick actions (create entity, import CSV, view issues)
 * - Recent activity
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../lib/api/client';
import DataIntegrityChecker from '../../components/admin/DataIntegrityChecker';
import { useToast } from '../../components/common/ToastContext';
import EntitySearchAutocomplete from '../../components/admin/EntitySearchAutocomplete';
import type { EntityType } from '../../lib/utils/entityDisplay';

interface EntityCounts {
  fabricas: number;
  jingles: number;
  canciones: number;
  artistas: number;
  tematicas: number;
  usuarios: number;
}

// interface ValidationSummary {
//   totalIssues: number;
//   entitiesWithIssues: number;
//   issuesByType: Record<string, number>;
// }

const ENTITY_TYPES = [
  { type: 'fabricas', label: 'Fábricas', routePrefix: 'f', singular: 'fabrica' },
  { type: 'jingles', label: 'Jingles', routePrefix: 'j', singular: 'jingle' },
  { type: 'canciones', label: 'Canciones', routePrefix: 'c', singular: 'cancion' },
  { type: 'artistas', label: 'Artistas', routePrefix: 'a', singular: 'artista' },
  { type: 'tematicas', label: 'Temáticas', routePrefix: 't', singular: 'tematica' },
  { type: 'usuarios', label: 'Usuarios', routePrefix: 'u', singular: 'usuario' },
];

export default function AdminDashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check for create context from query parameters
  const createType = searchParams.get('create');
  const fromType = searchParams.get('from');
  const fromId = searchParams.get('fromId');
  const relType = searchParams.get('relType');
  const showCreateForm = !!createType;
  
  const [entityCounts, setEntityCounts] = useState<EntityCounts>({
    fabricas: 0,
    jingles: 0,
    canciones: 0,
    artistas: 0,
    tematicas: 0,
    usuarios: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [showValidation, setShowValidation] = useState(false);
  const [validationType, setValidationType] = useState<string>('');

  // Load entity counts
  useEffect(() => {
    const loadCounts = async () => {
      setCountsLoading(true);

      try {
        const counts: EntityCounts = {
          fabricas: 0,
          jingles: 0,
          canciones: 0,
          artistas: 0,
          tematicas: 0,
          usuarios: 0,
        };

        // Fetch counts for each entity type
        const promises = ENTITY_TYPES.map(async (entityType) => {
          try {
            const entities = await adminApi.get<any[]>(`/${entityType.type}`);
            counts[entityType.type as keyof EntityCounts] = entities.length;
          } catch (err) {
            console.error(`Error loading ${entityType.label}:`, err);
            // Continue with other types even if one fails
          }
        });

        await Promise.all(promises);
        setEntityCounts(counts);
        setLastUpdated(new Date());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los conteos';
        showToast(errorMessage, 'error');
        console.error('Error loading entity counts:', err);
      } finally {
        setCountsLoading(false);
      }
    };

    loadCounts();
  }, []);

  // Get entity type from route prefix
  const getEntityTypeFromPrefix = (prefix: string): string | null => {
    const entityType = ENTITY_TYPES.find((e) => e.routePrefix === prefix);
    return entityType?.type || null;
  };

  // Get fields for entity creation
  const getFieldsForEntityType = (type: string): Array<{ name: string; label: string; required?: boolean }> => {
    const fieldDefinitions: Record<string, Array<{ name: string; label: string; required?: boolean }>> = {
      fabricas: [
        { name: 'id', label: 'ID (YouTube Video ID)', required: true },
        { name: 'title', label: 'Título', required: true },
        { name: 'date', label: 'Fecha', required: false },
        { name: 'description', label: 'Descripción', required: false },
        { name: 'contents', label: 'Contenido', required: false },
        { name: 'status', label: 'Estado', required: false },
      ],
      jingles: [
        { name: 'id', label: 'ID', required: false },
        { name: 'title', label: 'Título', required: false },
        { name: 'comment', label: 'Comentario', required: false },
        { name: 'youtubeClipUrl', label: 'YouTube Clip URL', required: false },
        { name: 'lyrics', label: 'Letra', required: false },
      ],
      canciones: [
        { name: 'id', label: 'ID', required: false },
        { name: 'title', label: 'Título', required: true },
        { name: 'album', label: 'Álbum', required: false },
        { name: 'year', label: 'Año', required: false },
        { name: 'genre', label: 'Género', required: false },
        { name: 'youtubeMusic', label: 'YouTube Music', required: false },
        { name: 'lyrics', label: 'Letra (URL)', required: false },
      ],
      artistas: [
        { name: 'id', label: 'ID', required: false },
        { name: 'name', label: 'Nombre', required: true },
        { name: 'stageName', label: 'Nombre Artístico', required: false },
        { name: 'nationality', label: 'Nacionalidad', required: false },
        { name: 'isArg', label: 'Es Argentino', required: false },
        { name: 'youtubeHandle', label: 'YouTube Handle', required: false },
        { name: 'instagramHandle', label: 'Instagram Handle', required: false },
        { name: 'twitterHandle', label: 'Twitter Handle', required: false },
        { name: 'facebookProfile', label: 'Facebook Profile', required: false },
        { name: 'website', label: 'Sitio Web', required: false },
        { name: 'bio', label: 'Biografía', required: false },
      ],
      tematicas: [
        { name: 'id', label: 'ID', required: false },
        { name: 'name', label: 'Nombre', required: true },
        { name: 'description', label: 'Descripción', required: false },
        { name: 'category', label: 'Categoría', required: false },
      ],
      usuarios: [
        { name: 'id', label: 'ID', required: false },
        { name: 'email', label: 'Email', required: true },
        { name: 'displayName', label: 'Nombre', required: false },
        { name: 'role', label: 'Rol', required: false },
      ],
    };
    return fieldDefinitions[type] || [{ name: 'id', label: 'ID', required: true }];
  };

  const handleCreateEntity = () => {
    if (!selectedEntityType) {
      showToast('Por favor selecciona un tipo de entidad', 'warning');
      return;
    }
    const entityType = ENTITY_TYPES.find((e) => e.type === selectedEntityType);
    if (entityType) {
      setSearchParams({ create: entityType.routePrefix });
    }
  };

  // Handle entity creation with relationship context
  const handleEntityCreated = async (createdEntity: any) => {
    if (relType && fromType && fromId && createdEntity?.id) {
      try {
        // Determine start and end based on relationship direction
        // Map route prefixes to entity types
        const prefixToType: Record<string, string> = {
          j: 'jingle',
          c: 'cancion',
          a: 'artista',
          t: 'tematica',
          f: 'fabrica',
        };
        // fromType might be a route prefix (single letter) or full entity type name
        const getEntityType = (value: string): string => {
          if (value.length === 1) {
            return prefixToType[value] || value;
          }
          // Already a full entity type name
          return value;
        };
        const createdEntityType = getEntityType(createType || '');
        // const fromEntityType = getEntityType(fromType);
        
        let startId: string;
        let endId: string;
        
        if (relType === 'appears_in') {
          // APPEARS_IN: Jingle -> Fabrica (Jingle is start, Fabrica is end)
          if (createdEntityType === 'fabrica') {
            // Creating Fabrica from Jingle: start=Jingle (fromId), end=Fabrica (createdEntity.id)
            startId = fromId;
            endId = createdEntity.id;
          } else {
            // Creating Jingle from Fabrica: start=Jingle (createdEntity.id), end=Fabrica (fromId)
            startId = createdEntity.id;
            endId = fromId;
          }
        } else if (relType === 'versiona') {
          // VERSIONA: Jingle -> Cancion (Jingle is start, Cancion is end)
          if (createdEntityType === 'cancion') {
            // Creating Cancion from Jingle: start=Jingle (fromId), end=Cancion (createdEntity.id)
            startId = fromId;
            endId = createdEntity.id;
          } else {
            // Creating Jingle from Cancion: start=Jingle (createdEntity.id), end=Cancion (fromId)
            startId = createdEntity.id;
            endId = fromId;
          }
        } else if (relType === 'jinglero_de' || relType === 'autor_de') {
          // JINGLERO_DE/AUTOR_DE: Artista -> Jingle/Cancion (Artista is start, Jingle/Cancion is end)
          if (createdEntityType === 'artista') {
            // Creating Artista from Jingle/Cancion: start=Artista (createdEntity.id), end=Jingle/Cancion (fromId)
            startId = createdEntity.id;
            endId = fromId;
          } else {
            // Creating Jingle/Cancion from Artista: start=Artista (fromId), end=Jingle/Cancion (createdEntity.id)
            startId = fromId;
            endId = createdEntity.id;
          }
        } else if (relType === 'tagged_with') {
          // TAGGED_WITH: Jingle -> Tematica (Jingle is start, Tematica is end)
          if (createdEntityType === 'tematica') {
            // Creating Tematica from Jingle: start=Jingle (fromId), end=Tematica (createdEntity.id)
            startId = fromId;
            endId = createdEntity.id;
          } else {
            // Creating Jingle from Tematica: start=Jingle (createdEntity.id), end=Tematica (fromId)
            startId = createdEntity.id;
            endId = fromId;
          }
        } else {
          // Default: from entity is start, created entity is end
          startId = fromId;
          endId = createdEntity.id;
        }

        await adminApi.post(`/relationships/${relType}`, {
          start: startId,
          end: endId,
        });

        // Navigate back to source entity
        // fromType might be a route prefix (single letter) or full entity type name
        let fromRoutePrefix: string;
        if (fromType.length === 1) {
          // Already a route prefix
          fromRoutePrefix = fromType;
        } else {
          // Full entity type name, need to find route prefix
          fromRoutePrefix = ENTITY_TYPES.find((e) => e.type === fromType)?.routePrefix || fromType.charAt(0);
        }
        navigate(`/admin/${fromRoutePrefix}/${fromId}`);
      } catch (error) {
        console.error('Error creating relationship:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        showToast(`Entidad creada, pero error al crear la relación: ${errorMessage}`, 'error');
        // Still navigate back even if relationship creation fails
        let fromRoutePrefix: string;
        if (fromType.length === 1) {
          fromRoutePrefix = fromType;
        } else {
          fromRoutePrefix = ENTITY_TYPES.find((e) => e.type === fromType)?.routePrefix || fromType.charAt(0);
        }
        navigate(`/admin/${fromRoutePrefix}/${fromId}`);
      }
    } else {
      // No relationship context, just navigate to the created entity
      if (createdEntity?.id && createType) {
        navigate(`/admin/${createType}/${createdEntity.id}`);
      }
    }
  };

  const _handleRunValidation = (type: string) => {
    setValidationType(type);
    setShowValidation(true);
  };

  const _getEntityTypeRoutePrefix = (type: string): string => {
    const entityType = ENTITY_TYPES.find((e) => e.type === type);
    return entityType?.routePrefix || type.charAt(0);
  };

  // Form state (only used when showing create form)
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize form data when create form is shown
  useEffect(() => {
    if (showCreateForm && createType) {
      const entityType = getEntityTypeFromPrefix(createType);
      if (entityType) {
        const initialData: Record<string, unknown> = {};
        const searchText = searchParams.get('searchText');
        if (searchText) {
          if (entityType === 'fabricas' || entityType === 'jingles' || entityType === 'canciones') {
            initialData.title = searchText;
          } else if (entityType === 'artistas' || entityType === 'tematicas') {
            initialData.name = searchText;
          }
        }
        setFormData(initialData);
        setFormError(null);
        setFormSuccess(null);
        setFieldErrors({});
      }
    }
  }, [showCreateForm, createType, searchParams]);

  // If showing create form, render it
  if (showCreateForm && createType) {
    const entityType = getEntityTypeFromPrefix(createType);
    if (!entityType) {
      return (
        <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
            <strong>Error:</strong> Tipo de entidad no válido: {createType}
          </div>
          <button onClick={() => setSearchParams({})} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Volver al Dashboard
          </button>
        </main>
      );
    }

    const fields = getFieldsForEntityType(entityType);

    const handleFieldChange = (fieldName: string, value: any) => {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
      if (fieldErrors[fieldName]) {
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setFormSuccess(null);
      setFormLoading(true);

      // Validate required fields
      const errors: Record<string, string> = {};
      fields.forEach(field => {
        if (field.required && (!formData[field.name] || formData[field.name] === '')) {
          errors[field.name] = `${field.label || field.name} es requerido`;
        }
      });

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormLoading(false);
        return;
      }

      try {
        // Build payload
        const payload: Record<string, unknown> = {};
        fields.forEach((f) => {
          const v = formData[f.name];
          if (v === undefined || v === '') {
            payload[f.name] = null;
          } else {
            payload[f.name] = v;
          }
        });
        if (formData.id) payload.id = formData.id;

        let createdEntity: any;
        switch (entityType) {
          case 'usuarios':
            createdEntity = await adminApi.createUsuario(payload);
            break;
          case 'artistas':
            createdEntity = await adminApi.createArtista(payload);
            break;
          case 'canciones':
            createdEntity = await adminApi.createCancion(payload);
            break;
          case 'fabricas':
            createdEntity = await adminApi.createFabrica(payload);
            break;
          case 'tematicas':
            createdEntity = await adminApi.createTematica(payload);
            break;
          case 'jingles':
            createdEntity = await adminApi.createJingle(payload);
            break;
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
        await handleEntityCreated(createdEntity);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear la entidad';
        setFormError(errorMessage);
        console.error('Error creating entity:', err);
      } finally {
        setFormLoading(false);
      }
    };

    return (
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/admin/dashboard"
            onClick={(e) => {
              e.preventDefault();
              setSearchParams({});
            }}
            style={{
              display: 'inline-block',
              marginBottom: '1rem',
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
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
              <h1 style={{ margin: 0 }}>Admin - Crear Entidad</h1>
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
            Crear nueva {ENTITY_TYPES.find((e) => e.type === entityType)?.label.toLowerCase() || entityType}
            {fromType && fromId && relType && ' (se vinculará automáticamente después de la creación)'}
          </p>
        </div>

        {/* Form styled like EntityMetadataEditor */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          {/* Section Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '4px',
            paddingBottom: '4px',
            borderBottom: '1px solid #eee',
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Metadatos
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSearchParams({})}
                disabled={formLoading}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: formLoading ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                type="submit"
                form="create-entity-form"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: formLoading ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: formLoading ? 0.6 : 1,
                }}
              >
                {formLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>

          {formError && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#fee',
                borderRadius: '4px',
                color: '#c00',
                fontSize: '0.875rem',
              }}
            >
              <strong>Error:</strong> {formError}
            </div>
          )}

          {formSuccess && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f1f8f4',
                borderRadius: '4px',
                color: '#2e7d32',
                fontSize: '0.875rem',
              }}
            >
              {formSuccess}
            </div>
          )}

          {/* Fields as rows - similar to EntityMetadataEditor */}
          <form id="create-entity-form" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {fields.map((field) => {
                const value = formData[field.name] ?? '';
                const fieldType = typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string';
                const isBoolean = fieldType === 'boolean';
                
                // Fields that should be textareas (multi-line, word-wrapping)
                const textareaFields = ['title', 'description', 'contents', 'comment', 'lyrics', 'bio'];
                const isTextarea = textareaFields.includes(field.name);

                return (
                  <div
                    key={field.name}
                    style={{
                      display: 'flex',
                      alignItems: isTextarea ? 'flex-start' : 'center',
                      gap: '12px',
                      padding: '2px 12px',
                      minHeight: '28px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#fff',
                    }}
                  >
                    {isBoolean ? (
                      <>
                        <input
                          type="checkbox"
                          checked={value === true}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          style={{
                            margin: 0,
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px',
                          }}
                        />
                        <label
                          style={{
                            fontSize: '14px',
                            color: '#fff',
                            cursor: 'pointer',
                            flex: 1,
                            margin: 0,
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleFieldChange(field.name, !value);
                          }}
                        >
                          {field.label || field.name}
                          {field.required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
                        </label>
                      </>
                    ) : (
                      <>
                        <label
                          style={{
                            fontSize: '14px',
                            color: '#ccc',
                            minWidth: '150px',
                            flexShrink: 0,
                            margin: 0,
                            paddingTop: isTextarea ? '4px' : '0',
                          }}
                        >
                          {field.label || field.name}:
                          {field.required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
                        </label>
                        {isTextarea ? (
                          <textarea
                            value={value ?? ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            required={field.required}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: '#2a2a2a',
                              border: fieldErrors[field.name] ? '1px solid #f44336' : '1px solid #444',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#fff',
                              minWidth: 0,
                              minHeight: '60px',
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              lineHeight: '1.4',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              overflow: 'auto',
                              boxSizing: 'border-box',
                              verticalAlign: 'top',
                            }}
                            rows={Math.max(2, Math.ceil((String(value || '').length) / 50))}
                          />
                        ) : (
                          <input
                            type={fieldType === 'number' ? 'number' : 'text'}
                            value={value ?? ''}
                            onChange={(e) =>
                              handleFieldChange(
                                field.name,
                                fieldType === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                              )
                            }
                            required={field.required}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: '#2a2a2a',
                              border: fieldErrors[field.name] ? '1px solid #f44336' : '1px solid #444',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#fff',
                              minWidth: 0,
                            }}
                          />
                        )}
                        {fieldErrors[field.name] && (
                          <div style={{ color: '#f44336', fontSize: '12px', minWidth: '200px' }}>
                            {fieldErrors[field.name]}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Panel de Administración</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Dashboard principal para gestionar el grafo de conocimiento
        </p>
      </div>

      {/* Entity Counts Section */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Conteo de Entidades</h2>
          <button
            onClick={() => {
              setCountsLoading(true);
              const loadCounts = async () => {
                try {
                  const counts: EntityCounts = {
                    fabricas: 0,
                    jingles: 0,
                    canciones: 0,
                    artistas: 0,
                    tematicas: 0,
                    usuarios: 0,
                  };
                  const promises = ENTITY_TYPES.map(async (entityType) => {
                    try {
                      const entities = await adminApi.get<any[]>(`/${entityType.type}`);
                      counts[entityType.type as keyof EntityCounts] = entities.length;
                    } catch (err) {
                      console.error(`Error loading ${entityType.label}:`, err);
                    }
                  });
                  await Promise.all(promises);
                  setEntityCounts(counts);
                  setLastUpdated(new Date());
                } catch (err) {
                  console.error('Error refreshing counts:', err);
                } finally {
                  setCountsLoading(false);
                }
              };
              loadCounts();
            }}
            disabled={countsLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: countsLoading ? 'not-allowed' : 'pointer',
              opacity: countsLoading ? 0.6 : 1,
              fontSize: '0.875rem',
            }}
          >
            {countsLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>


        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {ENTITY_TYPES.map((entityType) => {
            const count = entityCounts[entityType.type as keyof EntityCounts];
            return (
              <div
                key={entityType.type}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2', marginBottom: '0.5rem' }}>
                  {countsLoading ? '...' : count}
                </div>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.75rem' }}>
                  {entityType.label}
                </div>
                <Link
                  to={`/admin/${entityType.routePrefix}`}
                  style={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Ver todas →
                </Link>
              </div>
            );
          })}
        </div>

        {lastUpdated && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
            Última actualización: {lastUpdated.toLocaleString()}
          </div>
        )}
      </section>

      {/* Quick Actions Section */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Acciones Rápidas</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Quick Search */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Buscar Entidad</h3>
            <EntitySearchAutocomplete
              entityTypes={['fabrica', 'jingle', 'cancion', 'artista', 'tematica']}
              placeholder="Buscar cualquier entidad..."
              onSelect={(entity, entityType: EntityType) => {
                // Map entity type to route prefix
                const entityTypeInfo = ENTITY_TYPES.find(e => e.singular === entityType);
                if (entityTypeInfo) {
                  navigate(`/admin/${entityTypeInfo.routePrefix}/${entity.id}`);
                }
              }}
            />
          </div>

          {/* Create New Entity */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Crear Nueva Entidad</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">-- Seleccionar tipo --</option>
                {ENTITY_TYPES.map((entityType) => (
                  <option key={entityType.type} value={entityType.type}>
                    {entityType.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateEntity}
                disabled={!selectedEntityType}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedEntityType ? '#4caf50' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedEntityType ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                }}
              >
                Crear
              </button>
            </div>
          </div>

          {/* Validation Tools */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Herramientas de Validación</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => setShowValidation(!showValidation)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {showValidation ? 'Ocultar Validación' : 'Mostrar Validación'}
              </button>
              <Link
                to="/admin/search"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  border: '1px solid #ddd',
                }}
              >
                Buscar Entidad
              </Link>
            </div>
          </div>

          {/* Import CSV (Placeholder for Phase 4) */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Importar CSV</h3>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
              Funcionalidad de importación CSV disponible próximamente (Fase 4)
            </p>
          </div>
        </div>
      </section>

      {/* Validation Section */}
      {showValidation && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Verificación de Integridad de Datos</h2>
            <select
              value={validationType}
              onChange={(e) => setValidationType(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            >
              <option value="">-- Seleccionar tipo de entidad --</option>
              {ENTITY_TYPES.map((entityType) => (
                <option key={entityType.type} value={entityType.type}>
                  {entityType.label}
                </option>
              ))}
            </select>
          </div>
          {validationType ? (
            <DataIntegrityChecker entityType={validationType} />
          ) : (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            >
              <p style={{ color: '#666', margin: 0 }}>
                Selecciona un tipo de entidad para ejecutar la validación
              </p>
            </div>
          )}
        </section>
      )}

      {/* Navigation Links */}
      <section>
        <h2 style={{ marginBottom: '1rem' }}>Navegación</h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <Link
            to="/admin/search"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            Buscar Entidad
          </Link>
          {ENTITY_TYPES.map((entityType) => (
            <Link
              key={entityType.type}
              to={`/admin/${entityType.routePrefix}`}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                border: '1px solid #ddd',
              }}
            >
              Ver {entityType.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
