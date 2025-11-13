/**
 * BulkActions Component
 * 
 * Provides bulk operations for selected entities:
 * - Bulk delete
 * - Bulk relationship creation
 * - Bulk property update
 */

import { useState } from 'react';
import { adminApi } from '../../lib/api/client';

interface Props {
  entityType: string;
  selectedIds: string[];
  onComplete?: () => void;
  onCancel?: () => void;
}

type BulkAction = 'delete' | 'create_relationship' | 'update_property';

export default function BulkActions({ entityType, selectedIds, onComplete, onCancel }: Props) {
  const [action, setAction] = useState<BulkAction | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Relationship creation state
  const [relType, setRelType] = useState('');
  const [targetEntityId, setTargetEntityId] = useState('');

  // Property update state
  const [propertyName, setPropertyName] = useState('');
  const [propertyValue, setPropertyValue] = useState('');

  const handleBulkDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} entidad(es)? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const deletePromises = selectedIds.map((id) => {
        switch (entityType) {
          case 'usuarios':
            return adminApi.deleteUsuario(id);
          case 'artistas':
            return adminApi.deleteArtista(id);
          case 'canciones':
            return adminApi.deleteCancion(id);
          case 'fabricas':
            return adminApi.deleteFabrica(id);
          case 'tematicas':
            return adminApi.deleteTematica(id);
          case 'jingles':
            return adminApi.deleteJingle(id);
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
      });

      await Promise.all(deletePromises);
      setSuccess(`Se eliminaron ${selectedIds.length} entidad(es) exitosamente`);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar entidades';
      setError(errorMessage);
      console.error('Bulk delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateRelationship = async () => {
    if (!relType || !targetEntityId) {
      setError('Tipo de relación y ID de entidad objetivo son requeridos');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const createPromises = selectedIds.map((id) => {
        // Use the createRelationship method which handles the API call correctly
        return adminApi.post(`/relationships/${relType}`, {
          start: id,
          end: targetEntityId,
        });
      });

      await Promise.all(createPromises);
      setSuccess(`Se crearon ${selectedIds.length} relación(es) exitosamente`);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear relaciones';
      setError(errorMessage);
      console.error('Bulk create relationship error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateProperty = async () => {
    if (!propertyName) {
      setError('Nombre de propiedad es requerido');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatePromises = selectedIds.map((id) => {
        const updatePayload: Record<string, any> = { [propertyName]: propertyValue || null };
        switch (entityType) {
          case 'usuarios':
            return adminApi.patchUsuario(id, updatePayload);
          case 'artistas':
            return adminApi.patchArtista(id, updatePayload);
          case 'canciones':
            return adminApi.patchCancion(id, updatePayload);
          case 'fabricas':
            return adminApi.patchFabrica(id, updatePayload);
          case 'tematicas':
            return adminApi.patchTematica(id, updatePayload);
          case 'jingles':
            return adminApi.patchJingle(id, updatePayload);
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
      });

      await Promise.all(updatePromises);
      setSuccess(`Se actualizaron ${selectedIds.length} entidad(es) exitosamente`);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar propiedades';
      setError(errorMessage);
      console.error('Bulk update property error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        border: '2px solid #1976d2',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <strong>
          {selectedIds.length} entidad(es) seleccionada(s)
        </strong>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Cancelar selección
          </button>
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
          <strong>Éxito:</strong> {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value as BulkAction | '');
            setError(null);
            setSuccess(null);
          }}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          <option value="">-- Seleccionar acción --</option>
          <option value="delete">Eliminar entidades</option>
          <option value="create_relationship">Crear relación</option>
          <option value="update_property">Actualizar propiedad</option>
        </select>
      </div>

      {action === 'delete' && (
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Esta acción eliminará {selectedIds.length} entidad(es) permanentemente.
          </p>
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
          </button>
        </div>
      )}

      {action === 'create_relationship' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
              Tipo de Relación:
            </label>
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                width: '100%',
              }}
            >
              <option value="">-- Seleccionar --</option>
              <option value="appears_in">APPEARS_IN</option>
              <option value="jinglero_de">JINGLERO_DE</option>
              <option value="autor_de">AUTOR_DE</option>
              <option value="versiona">VERSIONA</option>
              <option value="tagged_with">TAGGED_WITH</option>
              <option value="soy_yo">SOY_YO</option>
              <option value="reacciona_a">REACCIONA_A</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
              ID de Entidad Objetivo:
            </label>
            <input
              type="text"
              value={targetEntityId}
              onChange={(e) => setTargetEntityId(e.target.value)}
              placeholder="ID de la entidad objetivo"
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                width: '100%',
              }}
            />
          </div>
          <button
            onClick={handleBulkCreateRelationship}
            disabled={loading || !relType || !targetEntityId}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading || !relType || !targetEntityId ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !relType || !targetEntityId ? 'not-allowed' : 'pointer',
              opacity: loading || !relType || !targetEntityId ? 0.6 : 1,
            }}
          >
            {loading ? 'Creando...' : 'Crear Relaciones'}
          </button>
        </div>
      )}

      {action === 'update_property' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
              Nombre de Propiedad:
            </label>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="nombrePropiedad"
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                width: '100%',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
              Valor (dejar vacío para establecer null):
            </label>
            <input
              type="text"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="valor"
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                width: '100%',
              }}
            />
          </div>
          <button
            onClick={handleBulkUpdateProperty}
            disabled={loading || !propertyName}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading || !propertyName ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !propertyName ? 'not-allowed' : 'pointer',
              opacity: loading || !propertyName ? 0.6 : 1,
            }}
          >
            {loading ? 'Actualizando...' : 'Actualizar Propiedades'}
          </button>
        </div>
      )}
    </div>
  );
}

