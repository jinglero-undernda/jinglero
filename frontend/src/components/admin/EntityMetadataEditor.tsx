/**
 * EntityMetadataEditor Component
 * 
 * Provides inline editing of entity metadata fields.
 * Displays entity properties as editable fields (excluding auto-managed and redundant fields).
 */

import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';

type Entity = Artista | Cancion | Fabrica | Jingle | Tematica;

interface Props {
  entity: Entity;
  entityType: string;
  onSave?: (updatedEntity: Entity) => void;
}

// Fields to exclude from metadata editor (per spec)
const EXCLUDED_FIELDS: Record<string, string[]> = {
  // Auto-managed fields
  _all: ['createdAt', 'updatedAt'],
  // Redundant fields (with relationships)
  jingles: ['fabricaId', 'fabricaDate', 'cancionId'],
  canciones: ['autorIds'],
  artistas: ['idUsuario'],
  // Redundant fields (derivable)
  fabricas: ['youtubeUrl'],
  // Inherited/derived fields
  jingles_derived: ['youtubeUrl', 'timestamp', 'songTitle', 'artistName', 'genre'],
};

export default function EntityMetadataEditor({ entity, entityType, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data from entity
  useEffect(() => {
    if (entity) {
      const data: Record<string, any> = {};
      const excluded = [
        ...(EXCLUDED_FIELDS._all || []),
        ...(EXCLUDED_FIELDS[entityType] || []),
        ...(entityType === 'jingle' ? EXCLUDED_FIELDS.jingles_derived || [] : []),
      ];

      Object.keys(entity).forEach((key) => {
        if (!excluded.includes(key) && key !== 'id') {
          data[key] = (entity as any)[key];
        }
      });
      setFormData(data);
      setHasChanges(false);
    }
  }, [entity, entityType]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setHasChanges(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatePayload: Partial<Entity> = { ...formData };
      let updated: Entity;

      // Map entity type to API method
      const apiTypeMap: Record<string, string> = {
        jingle: 'jingles',
        fabrica: 'fabricas',
        cancion: 'canciones',
        artista: 'artistas',
        tematica: 'tematicas',
      };
      const apiType = apiTypeMap[entityType];

      switch (apiType) {
        case 'jingles':
          updated = await adminApi.updateJingle(entity.id, updatePayload as Partial<Jingle>);
          break;
        case 'fabricas':
          updated = await adminApi.updateFabrica(entity.id, updatePayload as Partial<Fabrica>);
          break;
        case 'canciones':
          updated = await adminApi.updateCancion(entity.id, updatePayload as Partial<Cancion>);
          break;
        case 'artistas':
          updated = await adminApi.updateArtista(entity.id, updatePayload as Partial<Artista>);
          break;
        case 'tematicas':
          updated = await adminApi.updateTematica(entity.id, updatePayload as Partial<Tematica>);
          break;
        default:
          throw new Error(`Unknown entity type: ${apiType}`);
      }

      setSuccess('Cambios guardados exitosamente');
      setHasChanges(false);
      setIsEditing(false);
      if (onSave) {
        onSave(updated);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
      console.error('Error saving entity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original entity values
    const data: Record<string, any> = {};
    const excluded = [
      ...(EXCLUDED_FIELDS._all || []),
      ...(EXCLUDED_FIELDS[entityType] || []),
      ...(entityType === 'jingle' ? EXCLUDED_FIELDS.jingles_derived || [] : []),
    ];

    Object.keys(entity).forEach((key) => {
      if (!excluded.includes(key) && key !== 'id') {
        data[key] = (entity as any)[key];
      }
    });
    setFormData(data);
    setHasChanges(false);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!entity) {
    return null;
  }

  // Get editable fields (exclude id, excluded fields, and non-primitive values)
  const excluded = [
    'id',
    ...(EXCLUDED_FIELDS._all || []),
    ...(EXCLUDED_FIELDS[entityType] || []),
    ...(entityType === 'jingle' ? EXCLUDED_FIELDS.jingles_derived || [] : []),
  ];

  const editableFields = Object.keys(entity)
    .filter((key) => {
      if (excluded.includes(key)) return false;
      const value = (entity as any)[key];
      // Only show primitive types and simple objects
      return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      );
    })
    .sort();

  if (editableFields.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '0.5rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Metadatos</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
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
            Editar
          </button>
        )}
        {isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: hasChanges && !loading ? '#4caf50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: hasChanges && !loading ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                opacity: loading || !hasChanges ? 0.6 : 1,
              }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#fee',
            borderRadius: '4px',
            color: '#c00',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#f1f8f4',
            borderRadius: '4px',
            color: '#2e7d32',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {editableFields.map((fieldName) => {
          const value = formData[fieldName];
          const fieldType = typeof value;

          return (
            <div key={fieldName}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.25rem',
                  color: '#666',
                }}
              >
                {fieldName}
              </label>
              {isEditing ? (
                fieldType === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={value === true}
                    onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                    }}
                  />
                ) : (
                  <input
                    type={fieldType === 'number' ? 'number' : 'text'}
                    value={value ?? ''}
                    onChange={(e) =>
                      handleFieldChange(
                        fieldName,
                        fieldType === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                    }}
                  />
                )
              ) : (
                <div
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    color: value === null || value === undefined ? '#999' : '#333',
                    fontStyle: value === null || value === undefined ? 'italic' : 'normal',
                  }}
                >
                  {value === null || value === undefined ? '(vacío)' : String(value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

