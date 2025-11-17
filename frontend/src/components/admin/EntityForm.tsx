import React, { useState } from 'react';
import { adminApi } from '../../lib/api/client';
import KnowledgeGraphValidator from './KnowledgeGraphValidator';
import { useToast } from '../common/ToastContext';
import { FieldErrorDisplay, getFieldErrorStyle } from '../common/ErrorDisplay';
import { getEntityWarnings } from '../../lib/validation/schemas';
import { validateEntityField, validateEntityForm } from '../../lib/validation/entityValidation';
import { sanitizeNumericField } from '../../lib/utils/dataTypeSafety';
import { FIELD_OPTIONS, TEXTAREA_FIELDS } from '../../lib/config/fieldConfigs';

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
  const { showToast } = useToast();
  const initialState = fields.reduce((acc, f) => {
    const isBooleanField = f.name.startsWith('is') || f.name.startsWith('has');
    if (initialData && initialData[f.name] != null) {
      return { ...acc, [f.name]: isBooleanField ? String(initialData[f.name]) : String(initialData[f.name]) };
    }
    return { ...acc, [f.name]: isBooleanField ? 'false' : '' };
  }, {} as Record<string, string>);
  const [form, setForm] = useState<Record<string, string>>(initialState);
  const [id, setId] = useState(initialData && initialData.id ? String(initialData.id) : '');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Build payload: include all fields; set empty optional fields to null
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      const v = form[f.name];
      const isBooleanField = f.name.startsWith('is') || f.name.startsWith('has');
      
      if (isBooleanField) {
        // For boolean fields, always include them (default to false)
        payload[f.name] = v === 'true';
      } else if (v === undefined || v === '') {
        payload[f.name] = null;
      } else {
        payload[f.name] = v;
      }
    });
    if (id) payload.id = id;
    
    // Sanitize numeric fields by entity type
    if (type === 'fabrica') {
      if (payload.visualizations !== null && payload.visualizations !== undefined) {
        payload.visualizations = sanitizeNumericField(payload.visualizations, null);
      }
      if (payload.likes !== null && payload.likes !== undefined) {
        payload.likes = sanitizeNumericField(payload.likes, null);
      }
    }
    if (type === 'cancion' && payload.year !== null && payload.year !== undefined) {
      payload.year = sanitizeNumericField(payload.year, null);
    }
    
    // Validate the payload before submission
    const validationErrors = validateEntityForm(type, payload as Record<string, any>);
    const warnings = getEntityWarnings(type, payload as Record<string, any>);
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      showToast('Por favor corrige los errores antes de continuar', 'error');
      setLoading(false);
      return;
    }
    
    // Show warnings if any (non-blocking)
    if (Object.keys(warnings).length > 0) {
      Object.values(warnings).forEach((warning) => {
        showToast(warning, 'warning');
      });
    }

    try {
      if (mode === 'edit' && onSave) {
        await onSave(payload);
        showToast(submitLabel || 'Guardado', 'success');
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
        showToast(`Creado: ${data.id || JSON.stringify(data)}`, 'success');
        
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Note: Validation after edit save is handled in handleSubmit now

  // Comprehensive field validation using centralized validation
  const validateField = (fieldName: string, value: string): string | null => {
    const field = fields.find((f) => f.name === fieldName);
    
    // Check required fields first
    if (field?.required && (!value || value.trim() === '')) {
      return `${field.label || fieldName} es requerido`;
    }
    
    // Use centralized validation for format and cross-field checks
    const error = validateEntityField(type, fieldName, value, form);
    return error;
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
      {idFirst && (
        <div>
          <label>
            Id
            <input value={id} onChange={(e) => setId(e.target.value)} required />
          </label>
        </div>
      )}
      {fields.map((f) => {
        // Detect boolean fields by name pattern (is*, has*)
        const isBooleanField = f.name.startsWith('is') || f.name.startsWith('has');
        
        // Convert entity type plural to singular for field options lookup
        const singularType = type.endsWith('s') ? type.slice(0, -1) : type;
        
        // Check if field has enumerated options (dropdown)
        const fieldOptions = FIELD_OPTIONS[singularType]?.[f.name];
        const isDropdown = !!fieldOptions;
        
        // Check if field should be textarea
        const entityTextareaFields = TEXTAREA_FIELDS[singularType] || [];
        const isTextarea = entityTextareaFields.includes(f.name);
        
        return (
          <div key={f.name}>
            {isBooleanField ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={form[f.name] === 'true'}
                  onChange={(e) => handleFieldChange(f.name, e.target.checked ? 'true' : 'false')}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>
                  {f.label || f.name}
                  {f.required && <span style={{ color: 'red' }}> *</span>}
                </span>
              </label>
            ) : isDropdown ? (
              <label>
                {f.label || f.name}
                {f.required && <span style={{ color: 'red' }}> *</span>}
                <select
                  value={form[f.name] || ''}
                  onChange={(e) => handleFieldChange(f.name, e.target.value)}
                  onBlur={(e) => {
                    const error = validateField(f.name, e.target.value);
                    if (error) {
                      setFieldErrors({ ...fieldErrors, [f.name]: error });
                    }
                  }}
                  required={!!f.required}
                  style={getFieldErrorStyle(!!fieldErrors[f.name])}
                >
                  <option value="">-- Seleccionar --</option>
                  {fieldOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FieldErrorDisplay error={fieldErrors[f.name]} fieldName={f.name} />
              </label>
            ) : isTextarea ? (
              <label>
                {f.label || f.name}
                {f.required && <span style={{ color: 'red' }}> *</span>}
                <textarea
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
                    ...getFieldErrorStyle(!!fieldErrors[f.name]),
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
                <FieldErrorDisplay error={fieldErrors[f.name]} fieldName={f.name} />
              </label>
            ) : (
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
                  style={getFieldErrorStyle(!!fieldErrors[f.name])}
                />
                <FieldErrorDisplay error={fieldErrors[f.name]} fieldName={f.name} />
              </label>
            )}
          </div>
        );
      })}
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
