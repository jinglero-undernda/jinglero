/**
 * RelationshipValidator Component
 * 
 * Validates a specific relationship for issues:
 * - Duplicate relationships
 * - Invalid relationship targets
 * 
 * Displays validation results with fix actions for fixable issues.
 */

import { useState } from 'react';
import { adminApi } from '../../lib/api/client';

export interface RelationshipValidationIssue {
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

export interface RelationshipValidationResult {
  relationshipType: string;
  startEntityId: string;
  endEntityId: string;
  issues: RelationshipValidationIssue[];
  isValid: boolean;
}

interface Props {
  relationshipType: string;
  startEntityId: string;
  endEntityId: string;
  onValidationComplete?: (result: RelationshipValidationResult) => void;
  autoValidate?: boolean;
}

export default function RelationshipValidator({
  relationshipType,
  startEntityId,
  endEntityId,
  onValidationComplete,
  autoValidate: _autoValidate = false,
}: Props) {
  const [result, setResult] = useState<RelationshipValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState<string | null>(null);

  const validate = async () => {
    if (!relationshipType || !startEntityId || !endEntityId) {
      setError('Relationship type, start entity ID, and end entity ID are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validationResult = await adminApi.validateRelationship(
        relationshipType,
        startEntityId,
        endEntityId
      );
      setResult(validationResult);
      if (onValidationComplete) {
        onValidationComplete(validationResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al validar la relación';
      setError(errorMessage);
      console.error('Validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fixIssue = async (issue: RelationshipValidationIssue) => {
    if (!issue.fixable || !issue.fixAction) {
      return;
    }

    setFixing(issue.message);
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
      setFixing(null);
    }
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

  if (!relationshipType || !startEntityId || !endEntityId) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px', color: '#856404' }}>
        Tipo de relación, ID de entidad de inicio o ID de entidad de fin no válido
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Validación de Relación</h3>
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
          {loading ? 'Validando...' : 'Validar'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <div>
          <strong>Tipo:</strong> <code>{relationshipType}</code>
        </div>
        <div>
          <strong>Desde:</strong> <code>{startEntityId}</code>
        </div>
        <div>
          <strong>Hasta:</strong> <code>{endEntityId}</code>
        </div>
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
        <div
          style={{
            border: `2px solid ${result.isValid ? '#4caf50' : '#d32f2f'}`,
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: result.isValid ? '#f1f8f4' : '#fff5f5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{result.isValid ? '✅' : '❌'}</span>
            <strong>
              {result.isValid
                ? 'Relación válida - No se encontraron problemas'
                : `Se encontraron ${result.issues.length} problema(s)`}
            </strong>
          </div>

          {result.issues.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Problemas encontrados:</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {result.issues.map((issue, index) => (
                  <li
                    key={index}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'white',
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
                            disabled={fixing === issue.message}
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: fixing === issue.message ? 'not-allowed' : 'pointer',
                              opacity: fixing === issue.message ? 0.6 : 1,
                              fontSize: '0.875rem',
                            }}
                          >
                            {fixing === issue.message ? 'Corrigiendo...' : `🔧 ${issue.fixAction.description}`}
                          </button>
                        )}
                        {!issue.fixable && (
                          <div
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              color: '#666',
                              display: 'inline-block',
                            }}
                          >
                            No se puede corregir automáticamente
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

