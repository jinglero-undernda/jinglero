import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api/client';
import KnowledgeGraphValidator from './KnowledgeGraphValidator';

// Import the type separately to avoid module resolution issues
type ValidationResult = {
  entityType: string;
  entityId: string;
  issues: Array<{
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
  }>;
  isValid: boolean;
};

type Field = { name: string; label?: string; required?: boolean };

type Props = {
  type: string;
  fields: Field[];
  idFirst?: boolean; // if true, show id field first (fabricas)
  // optional edit support
  mode?: 'create' | 'edit';
  initialData?: Record<string, unknown>;
  onSave?: (payload: Record<string, unknown>) => Promise<unknown>;
  submitLabel?: string;
};

export default function EntityForm({ type, fields, idFirst, mode = 'create', initialData, onSave, submitLabel }: Props) {
  const initialState = fields.reduce((acc, f) => ({ ...acc, [f.name]: initialData && initialData[f.name] != null ? String(initialData[f.name]) : '' }), {} as Record<string, string>);
  const [form, setForm] = useState<Record<string, string>>(initialState);
  const [id, setId] = useState(initialData && initialData.id ? String(initialData.id) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Build payload: include all fields; set empty optional fields to null
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      const v = form[f.name];
      if (v === undefined || v === '') {
        payload[f.name] = null;
      } else {
        payload[f.name] = v;
      }
    });
    if (id) payload.id = id;

    try {
      if (mode === 'edit' && onSave) {
        await onSave(payload);
        setSuccess(submitLabel || 'Guardado');
      } else {
        let data: any;
        switch (type) {
          case 'usuarios':
            data = await adminApi.createUsuario(payload);
            break;
          case 'artistas':
            data = await adminApi.createArtista(payload);
            break;
          case 'canciones':
            data = await adminApi.createCancion(payload);
            break;
          case 'fabricas':
            data = await adminApi.createFabrica(payload);
            break;
          case 'tematicas':
            data = await adminApi.createTematica(payload);
            break;
          case 'jingles':
            data = await adminApi.createJingle(payload);
            break;
          default:
            throw new Error(`Unknown entity type: ${type}`);
        }
        setSuccess(`Creado: ${data.id || JSON.stringify(data)}`);
        
        // Validate the newly created entity
        if (data && data.id) {
          try {
            const validation = await adminApi.validateEntity(type, data.id);
            setValidationResult(validation);
            if (!validation.isValid) {
              setShowValidation(true);
            }
          } catch (err) {
            // Validation errors are non-blocking
            console.warn('Validation error after creation:', err);
          }
          
          // reset
          setForm(initialState);
          setId('');
          // Navigate to edit page for the created entity
          const routeMap: Record<string, string> = {
            fabricas: 'f',
            jingles: 'j',
            canciones: 'c',
            artistas: 'a',
            tematicas: 't',
          };
          const routeCode = routeMap[type] || type;
          window.location.href = `/admin/${routeCode}/${data.id}`;
        }
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // Validate entity after edit save
  useEffect(() => {
    if (mode === 'edit' && id && success) {
      const validateAfterSave = async () => {
        try {
          const validation = await adminApi.validateEntity(type, id);
          setValidationResult(validation);
          if (!validation.isValid) {
            setShowValidation(true);
          }
        } catch (err) {
          // Validation errors are non-blocking
          console.warn('Validation error after save:', err);
        }
      };
      validateAfterSave();
    }
  }, [mode, id, success, type]);

  // Basic field validation
  const validateField = (fieldName: string, value: string): string | null => {
    const field = fields.find((f) => f.name === fieldName);
    if (field?.required && (!value || value.trim() === '')) {
      return `${field.label || fieldName} es requerido`;
    }
    return null;
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setForm({ ...form, [fieldName]: value });
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors({ ...fieldErrors, [fieldName]: '' });
    }
    // Validate on blur
    const error = validateField(fieldName, value);
    if (error) {
      setFieldErrors({ ...fieldErrors, [fieldName]: error });
    }
  };

  return (
    <div>
    <form className={`entity-form entity-form-${type}`} onSubmit={handleSubmit}>
      <h3>{mode === 'edit' ? `Editar ${type}` : `Crear ${type}`}</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {idFirst && (
        <div>
          <label>
            Id
            <input value={id} onChange={(e) => setId(e.target.value)} required />
          </label>
        </div>
      )}
      {fields.map((f) => (
        <div key={f.name}>
          <label>
            {f.label || f.name}
            {f.required && <span style={{ color: 'red' }}> *</span>}
            <input
              value={form[f.name] || ''}
              onChange={(e) => handleFieldChange(f.name, e.target.value)}
              onBlur={(e) => {
                const error = validateField(f.name, e.target.value);
                if (error) {
                  setFieldErrors({ ...fieldErrors, [f.name]: error });
                }
              }}
              required={!!f.required}
              style={{
                borderColor: fieldErrors[f.name] ? '#d32f2f' : undefined,
                borderWidth: fieldErrors[f.name] ? '2px' : undefined,
              }}
            />
            {fieldErrors[f.name] && (
              <div style={{ color: '#d32f2f', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {fieldErrors[f.name]}
              </div>
            )}
          </label>
        </div>
      ))}
      {!idFirst && (
        <div>
          <label>
            Id (opcional)
            <input value={id} onChange={(e) => setId(e.target.value)} />
          </label>
        </div>
      )}
      <div>
        <button type="submit" disabled={loading || Object.keys(fieldErrors).some((k) => fieldErrors[k])}>
          {loading ? (mode === 'edit' ? 'Guardando…' : 'Creando…') : (submitLabel || (mode === 'edit' ? 'Guardar' : 'Crear'))}
        </button>
      </div>
    </form>
    
    {/* Validation Results */}
    {mode === 'edit' && id && (
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h4 style={{ margin: 0 }}>Validación</h4>
          <button
            type="button"
            onClick={() => setShowValidation(!showValidation)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.875rem',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showValidation ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {showValidation && (
          <KnowledgeGraphValidator
            entityType={type}
            entityId={id}
            autoValidate={true}
            onValidationComplete={(result) => {
              setValidationResult(result);
            }}
          />
        )}
        {validationResult && !showValidation && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: validationResult.isValid ? '#f1f8f4' : '#fff5f5',
              border: `1px solid ${validationResult.isValid ? '#4caf50' : '#d32f2f'}`,
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            {validationResult.isValid ? (
              <span>✅ Entidad válida - No se encontraron problemas</span>
            ) : (
              <span>
                ⚠️ Se encontraron {validationResult.issues.length} problema(s).{' '}
                <button
                  type="button"
                  onClick={() => setShowValidation(true)}
                  style={{
                    color: '#1976d2',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Ver detalles
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    )}
  </div>
  );
}
