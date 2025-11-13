/**
 * DataIntegrityChecker Component
 * 
 * Validates all entities of a specific type for knowledge graph issues.
 * Provides a summary view of all validation issues across the entity type.
 * 
 * Features:
 * - Validate all entities of a type
 * - Summary statistics
 * - List of entities with issues
 * - Bulk fix actions
 */

import { useState } from 'react';
import { adminApi } from '../../lib/api/client';
import { Link } from 'react-router-dom';

export interface ValidationIssue {
  type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
  severity: 'error' | 'warning';
  entityType: string;
  entityId: string;
  relationshipType?: string;
  targetEntityId?: string;
  message: string;
  fixable: boolean;
  fixAction?: {
    type: 'update_redundant_property' | 'delete_duplicate_relationship';
    description: string;
  };
}

export interface EntityValidationResult {
  entityType: string;
  entityId: string;
  issues: ValidationIssue[];
  isValid: boolean;
}

export interface BulkValidationResult {
  entityType: string;
  results: EntityValidationResult[];
  totalEntities: number;
  entitiesWithIssues: number;
  totalIssues: number;
}

interface Props {
  entityType: string;
  onValidationComplete?: (result: BulkValidationResult) => void;
}

export default function DataIntegrityChecker({ entityType, onValidationComplete }: Props) {
  const [result, setResult] = useState<BulkValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState<Set<string>>(new Set()); // Track which issues are being fixed
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  const validate = async () => {
    if (!entityType) {
      setError('Entity type is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validationResult = await adminApi.validateAllEntities(entityType);
      setResult(validationResult);
      if (onValidationComplete) {
        onValidationComplete(validationResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al validar las entidades';
      setError(errorMessage);
      console.error('Validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fixIssue = async (issue: ValidationIssue) => {
    if (!issue.fixable || !issue.fixAction) {
      return;
    }

    const issueKey = `${issue.entityId}-${issue.message}`;
    setFixing((prev) => new Set(prev).add(issueKey));
    setError(null);

    try {
      await adminApi.fixValidationIssue(issue);
      // Re-validate after fixing
      await validate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al corregir el problema';
      setError(errorMessage);
      console.error('Fix error:', err);
    } finally {
      setFixing((prev) => {
        const next = new Set(prev);
        next.delete(issueKey);
        return next;
      });
    }
  };

  const toggleEntityExpansion = (entityId: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });
  };

  const getEntityTypeRoutePrefix = (type: string): string => {
    const routeMap: Record<string, string> = {
      fabricas: 'f',
      jingles: 'j',
      canciones: 'c',
      artistas: 'a',
      tematicas: 't',
    };
    return routeMap[type] || type.charAt(0);
  };

  const getSeverityIcon = (severity: 'error' | 'warning') => {
    return severity === 'error' ? '❌' : '⚠️';
  };

  const getSeverityColor = (severity: 'error' | 'warning') => {
    return severity === 'error' ? '#d32f2f' : '#ed6c02';
  };

  const getIssueTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      duplicate_relationship: 'Relación Duplicada',
      invalid_target: 'Objetivo Inválido',
      redundant_field_mismatch: 'Campo Redundante Desincronizado',
    };
    return labels[type] || type;
  };

  const getIssueTypeStats = () => {
    if (!result) return {};
    const stats: Record<string, number> = {};
    result.results.forEach((entityResult) => {
      entityResult.issues.forEach((issue) => {
        stats[issue.type] = (stats[issue.type] || 0) + 1;
      });
    });
    return stats;
  };

  if (!entityType) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px', color: '#856404' }}>
        Tipo de entidad no válido
      </div>
    );
  }

  const issueTypeStats = getIssueTypeStats();

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Verificación de Integridad de Datos</h3>
        <button
          onClick={validate}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Validando...' : `Validar todas las entidades (${entityType})`}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            borderRadius: '8px',
            color: '#c00',
            marginBottom: '1rem',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div>
          {/* Summary Statistics */}
          <div
            style={{
              border: '2px solid #1976d2',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              marginBottom: '1rem',
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Resumen de Validación</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                  {result.totalEntities}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Total de Entidades</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d32f2f' }}>
                  {result.entitiesWithIssues}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Entidades con Problemas</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ed6c02' }}>
                  {result.totalIssues}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Total de Problemas</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>
                  {result.totalEntities - result.entitiesWithIssues}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Entidades Válidas</div>
              </div>
            </div>

            {Object.keys(issueTypeStats).length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                <h5 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Problemas por Tipo:</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {Object.entries(issueTypeStats).map(([type, count]) => (
                    <div
                      key={type}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                      }}
                    >
                      <strong>{getIssueTypeLabel(type)}:</strong> {count}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Entities with Issues */}
          {result.entitiesWithIssues > 0 && (
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Entidades con Problemas:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.results
                  .filter((entityResult) => !entityResult.isValid)
                  .map((entityResult) => (
                    <div
                      key={entityResult.entityId}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '1rem',
                        backgroundColor: 'white',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleEntityExpansion(entityResult.entityId)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{expandedEntities.has(entityResult.entityId) ? '▼' : '▶'}</span>
                          <strong>
                            {entityResult.entityId} ({entityResult.issues.length} problema
                            {entityResult.issues.length !== 1 ? 's' : ''})
                          </strong>
                        </div>
                        <Link
                          to={`/admin/${getEntityTypeRoutePrefix(entityType)}/${entityResult.entityId}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: '#1976d2',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                          }}
                        >
                          Ver entidad →
                        </Link>
                      </div>

                      {expandedEntities.has(entityResult.entityId) && (
                        <div style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {entityResult.issues.map((issue, index) => {
                              const issueKey = `${entityResult.entityId}-${issue.message}`;
                              const isFixing = fixing.has(issueKey);
                              return (
                                <li
                                  key={index}
                                  style={{
                                    padding: '0.75rem',
                                    marginBottom: '0.5rem',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '4px',
                                    borderLeft: `4px solid ${getSeverityColor(issue.severity)}`,
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{getSeverityIcon(issue.severity)}</span>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                        {getIssueTypeLabel(issue.type)}
                                      </div>
                                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {issue.message}
                                      </div>
                                      {issue.fixable && issue.fixAction && (
                                        <button
                                          onClick={() => fixIssue(issue)}
                                          disabled={isFixing}
                                          style={{
                                            padding: '0.375rem 0.75rem',
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: isFixing ? 'not-allowed' : 'pointer',
                                            opacity: isFixing ? 0.6 : 1,
                                            fontSize: '0.875rem',
                                          }}
                                        >
                                          {isFixing ? 'Corrigiendo...' : `🔧 ${issue.fixAction.description}`}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {result.entitiesWithIssues === 0 && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f1f8f4',
                borderRadius: '8px',
                border: '2px solid #4caf50',
              }}
            >
              <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>✅</span>
              <strong>Todas las entidades son válidas - No se encontraron problemas</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

