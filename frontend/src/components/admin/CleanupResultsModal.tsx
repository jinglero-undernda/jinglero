/**
 * CleanupResultsModal Component
 * 
 * Displays the results of a cleanup script execution.
 * Shows summary statistics, lists affected entities, displays suggested fixes, and provides automation options.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FabricaTimestampFixModal from './FabricaTimestampFixModal';

interface ScriptExecutionResponse {
  scriptId: string;
  scriptName: string;
  totalFound: number;
  executionTime: number;
  timestamp: string;
  entities: Array<{
    entityType: string;
    entityId: string;
    entityTitle?: string;
    issue: string;
    currentValue: any;
    suggestion?: {
      type: 'update' | 'create' | 'delete' | 'relationship';
      field?: string;
      recommendedValue?: any;
      automatable: boolean;
      requiresManualReview: boolean;
      musicBrainzMatch?: {
        musicBrainzId: string;
        title: string;
        artist?: string;
        confidence: number;
        source: 'musicbrainz_search' | 'musicbrainz_lookup';
        alternatives?: Array<{
          musicBrainzId: string;
          title: string;
          artist?: string;
          confidence: number;
        }>;
      };
    };
  }>;
  suggestions: Array<{
    type: string;
    field?: string;
    count: number;
    automatable: number;
    requiresReview: number;
  }>;
  musicBrainzCalls?: number;
  musicBrainzErrors?: Array<{
    entityId: string;
    error: string;
    retryable: boolean;
  }>;
}

interface CleanupResultsModalProps {
  isOpen: boolean;
  results: ScriptExecutionResponse | null;
  onClose: () => void;
  onAutomate: (entityIds: string[], applyLowConfidence: boolean) => Promise<void>;
}

const ENTITY_TYPE_ROUTES: Record<string, string> = {
  jingle: 'j',
  cancion: 'c',
  artista: 'a',
  fabrica: 'f',
  tematica: 't',
  usuario: 'u',
};

export default function CleanupResultsModal({
  isOpen,
  results,
  onClose,
  onAutomate,
}: CleanupResultsModalProps) {
  const navigate = useNavigate();
  const [automating, setAutomating] = useState(false);
  const [applyLowConfidence, setApplyLowConfidence] = useState(false);
  const [automationResults, setAutomationResults] = useState<any>(null);
  // WORKFLOW_011: Step 1 - State for Fabrica timestamp fix modal
  const [showFabricaFixModal, setShowFabricaFixModal] = useState(false);
  const [selectedFabricaId, setSelectedFabricaId] = useState<string | null>(null);

  if (!isOpen || !results) return null;

  const handleNavigateToEntity = (entityType: string, entityId: string) => {
    const routePrefix = ENTITY_TYPE_ROUTES[entityType.toLowerCase()] || entityType.toLowerCase();
    navigate(`/admin/${routePrefix}/${entityId}`);
    onClose();
  };

  // WORKFLOW_011: Step 1 - Handler for "ARREGLAR" button
  const handleFixFabrica = (fabricaId: string) => {
    setSelectedFabricaId(fabricaId);
    setShowFabricaFixModal(true);
  };

  const handleAutomate = async () => {
    if (!results) return;

    const automatableEntities = results.entities
      .filter((e) => e.suggestion?.automatable)
      .map((e) => e.entityId);

    if (automatableEntities.length === 0) {
      return;
    }

    setAutomating(true);
    try {
      await onAutomate(automatableEntities, applyLowConfidence);
      // Refresh results or show success message
      setAutomationResults({ success: true });
    } catch (error: any) {
      setAutomationResults({
        success: false,
        error: error.message || 'Error al automatizar correcciones',
      });
    } finally {
      setAutomating(false);
    }
  };

  const automatableCount = results.entities.filter((e) => e.suggestion?.automatable).length;
  const hasLowConfidence = results.entities.some(
    (e) => e.suggestion?.musicBrainzMatch && e.suggestion.musicBrainzMatch.confidence < 0.8
  );

  const formatExecutionTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#2e7d32';
    if (confidence >= 0.6) return '#f57c00';
    return '#c62828';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>
              {results.scriptName}
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
              Ejecutado el {new Date(results.timestamp).toLocaleString('es-ES')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.25rem 0.5rem',
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Summary Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Total encontrado</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>{results.totalFound}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Tiempo de ejecución</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>
              {formatExecutionTime(results.executionTime)}
            </div>
          </div>
          {results.musicBrainzCalls !== undefined && (
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Llamadas MusicBrainz</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>{results.musicBrainzCalls}</div>
            </div>
          )}
          {automatableCount > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Automatizables</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2e7d32' }}>{automatableCount}</div>
            </div>
          )}
        </div>

        {/* MusicBrainz Errors */}
        {results.musicBrainzErrors && results.musicBrainzErrors.length > 0 && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fff3e0',
              borderRadius: '4px',
              marginBottom: '1.5rem',
            }}
          >
            <strong style={{ color: '#f57c00' }}>Errores de MusicBrainz:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              {results.musicBrainzErrors.map((error, idx) => (
                <li key={idx} style={{ fontSize: '0.875rem', color: '#666' }}>
                  {error.entityId}: {error.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Automation Results */}
        {automationResults && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: automationResults.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              color: automationResults.success ? '#2e7d32' : '#c62828',
            }}
          >
            {automationResults.success ? (
              <strong>✓ Automatización completada exitosamente</strong>
            ) : (
              <strong>✕ Error: {automationResults.error}</strong>
            )}
          </div>
        )}

        {/* Results List */}
        {results.totalFound === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#e8f5e9',
              borderRadius: '4px',
              color: '#2e7d32',
            }}
          >
            <strong>✓ No se encontraron problemas</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
              La base de datos está limpia para esta verificación.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
              Entidades afectadas ({results.entities.length})
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {results.entities.map((entity, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ color: '#333' }}>
                        {entity.entityTitle || entity.entityId}
                      </strong>
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          padding: '0.125rem 0.5rem',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {entity.entityType}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleNavigateToEntity(entity.entityType, entity.entityId)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#1976d2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        Ver entidad
                      </button>
                      {/* WORKFLOW_011: Step 1 - "ARREGLAR" button for Fabrica entities */}
                      {(entity.entityType.toLowerCase() === 'fabrica' || entity.entityType.toLowerCase() === 'fabricas') && (
                        <button
                          onClick={() => handleFixFabrica(entity.entityId)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          ARREGLAR
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    <strong>Problema:</strong> {entity.issue}
                  </div>
                  {entity.suggestion && (
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      <strong>Sugerencia:</strong>{' '}
                      {entity.suggestion.type === 'update' && entity.suggestion.field
                        ? `Actualizar ${entity.suggestion.field}`
                        : entity.suggestion.type === 'create'
                        ? 'Crear nueva entidad/relación'
                        : entity.suggestion.type === 'relationship'
                        ? 'Crear relación'
                        : 'Eliminar'}
                      {entity.suggestion.musicBrainzMatch && (
                        <div style={{ marginTop: '0.25rem', padding: '0.5rem', backgroundColor: '#fff', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Confianza:</span>
                            <span
                              style={{
                                padding: '0.125rem 0.5rem',
                                backgroundColor: getConfidenceColor(entity.suggestion.musicBrainzMatch.confidence),
                                color: '#fff',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {Math.round(entity.suggestion.musicBrainzMatch.confidence * 100)}%
                            </span>
                          </div>
                          {entity.suggestion.musicBrainzMatch.confidence < 0.8 && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#f57c00' }}>
                              ⚠ Requiere revisión manual
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
          {automatableCount > 0 && (
            <>
              {hasLowConfidence && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={applyLowConfidence}
                    onChange={(e) => setApplyLowConfidence(e.target.checked)}
                    disabled={automating}
                  />
                  Aplicar correcciones de baja confianza
                </label>
              )}
              <button
                onClick={handleAutomate}
                disabled={automating}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: automating ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: automating ? 0.6 : 1,
                }}
              >
                {automating ? 'Automatizando...' : `Automatizar (${automatableCount})`}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* WORKFLOW_011: Step 1 - Fabrica Timestamp Fix Modal */}
      {selectedFabricaId && (
        <FabricaTimestampFixModal
          fabricaId={selectedFabricaId}
          isOpen={showFabricaFixModal}
          onClose={() => {
            setShowFabricaFixModal(false);
            setSelectedFabricaId(null);
          }}
        />
      )}
    </div>
  );
}

