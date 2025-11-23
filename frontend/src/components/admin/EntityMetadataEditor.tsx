/**
 * EntityMetadataEditor Component
 * 
 * Provides inline editing of entity metadata fields.
 * Displays entity properties as editable fields (excluding auto-managed and redundant fields).
 */

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Select from 'react-select';
import { adminApi } from '../../lib/api/client';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { useToast } from '../common/ToastContext';
import { validateEntityField, validateEntityForm, getEntityFormWarnings } from '../../lib/validation/entityValidation';
import { FieldErrorDisplay } from '../common/ErrorDisplay';
import { EXCLUDED_FIELDS, FIELD_ORDER, FIELD_OPTIONS, TEXTAREA_FIELDS } from '../../lib/config/fieldConfigs';
import DatePickerField from '../common/DatePickerField';
import { formatDateDisplay, isValidISODate } from '../../lib/utils/dateUtils';
import { sanitizeNumericField, sanitizeBooleanField } from '../../lib/utils/dataTypeSafety';

type Entity = Artista | Cancion | Fabrica | Jingle | Tematica;

interface Props {
  entity: Entity;
  entityType: string;
  onSave?: (updatedEntity: Entity) => void;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
  onChange?: (hasChanges: boolean) => void;
}

const EntityMetadataEditor = forwardRef<{ hasUnsavedChanges: () => boolean; save: () => Promise<void> }, Props>(function EntityMetadataEditor({ entity, entityType, onSave, isEditing: externalIsEditing, onEditToggle, onChange }, ref) {
  const { showToast } = useToast();
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  
  const setIsEditing = (editing: boolean) => {
    if (onEditToggle) {
      onEditToggle(editing);
    } else {
      setInternalIsEditing(editing);
    }
  };
  const [formData, setFormData] = useState<Record<string, any>>({});
  // Phase 1: loading state removed - save button now in EntityCard heading
  const [hasChanges, setHasChanges] = useState(false);
  // Validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formWarnings, setFormWarnings] = useState<Record<string, string>>({});
  const [, setTouchedFields] = useState<Set<string>>(new Set()); // Keep for compatibility but mark as unused
  // Ref to track latest formData for validation
  const formDataRef = useRef<Record<string, any>>({});

  // Initialize form data from entity
  useEffect(() => {
    if (entity) {
      const data: Record<string, any> = {};
      const excluded = [
        ...(EXCLUDED_FIELDS._all || []),
        ...(EXCLUDED_FIELDS[entityType] || []),
        ...(entityType === 'jingle' ? EXCLUDED_FIELDS.jingles_derived || [] : []),
      ];

      // For jingles, fabricas, canciones, artistas, and tematicas, only include specific fields
      if (entityType === 'jingle' && FIELD_ORDER.jingle) {
        FIELD_ORDER.jingle.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else if (entityType === 'fabrica' && FIELD_ORDER.fabrica) {
        FIELD_ORDER.fabrica.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
        // Auto-generate youtubeUrl from id if it doesn't exist or id changed
        if (data.id && !data.youtubeUrl) {
          data.youtubeUrl = `https://www.youtube.com/watch?v=${data.id}`;
        }
      } else if (entityType === 'cancion' && FIELD_ORDER.cancion) {
        FIELD_ORDER.cancion.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else if (entityType === 'artista' && FIELD_ORDER.artista) {
        FIELD_ORDER.artista.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else if (entityType === 'tematica' && FIELD_ORDER.tematica) {
        FIELD_ORDER.tematica.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else {
        // For other entity types, use the original logic but include 'id'
        Object.keys(entity).forEach((key) => {
          if (!excluded.includes(key)) {
            data[key] = (entity as any)[key];
          }
        });
      }
      setFormData(data);
      formDataRef.current = data;
      setHasChanges(false);
      setFieldErrors({});
      setTouchedFields(new Set());
      setFormWarnings({});
    }
  }, [entity, entityType]);

  // Reset form when editing is turned off externally (e.g., from header cancel button)
  useEffect(() => {
    if (externalIsEditing === false && entity) {
      const data: Record<string, any> = {};
      const excluded = [
        ...(EXCLUDED_FIELDS._all || []),
        ...(EXCLUDED_FIELDS[entityType] || []),
        ...(entityType === 'jingle' ? EXCLUDED_FIELDS.jingles_derived || [] : []),
      ];

      // For jingles, fabricas, canciones, artistas, and tematicas, only include specific fields
      if (entityType === 'jingle' && FIELD_ORDER.jingle) {
        FIELD_ORDER.jingle.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else if (entityType === 'fabrica' && FIELD_ORDER.fabrica) {
        FIELD_ORDER.fabrica.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
        // Auto-generate youtubeUrl from id if it doesn't exist
        if (data.id && !data.youtubeUrl) {
          data.youtubeUrl = `https://www.youtube.com/watch?v=${data.id}`;
        }
      } else if (entityType === 'cancion' && FIELD_ORDER.cancion) {
        FIELD_ORDER.cancion.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else if (entityType === 'artista' && FIELD_ORDER.artista) {
        FIELD_ORDER.artista.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else if (entityType === 'tematica' && FIELD_ORDER.tematica) {
        FIELD_ORDER.tematica.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          const isBooleanField = key.startsWith('is') || key.startsWith('has');
          data[key] = (entity as any)[key] ?? (isBooleanField ? false : undefined);
        });
      } else {
        // For other entity types, use the original logic but include 'id'
        Object.keys(entity).forEach((key) => {
          if (!excluded.includes(key)) {
            data[key] = (entity as any)[key];
          }
        });
      }
      setFormData(data);
      formDataRef.current = data;
      setHasChanges(false);
      setFieldErrors({});
      setTouchedFields(new Set());
      setFormWarnings({});
    }
  }, [externalIsEditing, entity, entityType]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [fieldName]: value };
      
      // Auto-update youtubeUrl when id changes for Fabricas
      if (entityType === 'fabrica' && fieldName === 'id' && value) {
        updated.youtubeUrl = `https://www.youtube.com/watch?v=${value}`;
      }
      
      // Update ref with latest formData
      formDataRef.current = updated;
      
      // Clear field error when user types
      if (fieldErrors[fieldName]) {
        setFieldErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
      
      // Update warnings for cross-field validations
      if (entityType === 'jingle') {
        const warnings = getEntityFormWarnings(entityType, updated);
        setFormWarnings(warnings);
      }
      
      return updated;
    });
    setHasChanges(true);
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
    
    // Use ref to get latest formData for validation
    const currentFormData = formDataRef.current;
    const value = currentFormData[fieldName];
    const error = validateEntityField(entityType, fieldName, value, currentFormData);
    
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    // Check cross-field validations
    if (entityType === 'artista' && (fieldName === 'name' || fieldName === 'stageName')) {
      const crossFieldErrors = validateEntityForm(entityType, currentFormData);
      setFieldErrors((prev) => ({ ...prev, ...crossFieldErrors }));
    }
  };

  const handleSave = async () => {
    // Mark all fields as touched for validation
    const allFields = new Set(Object.keys(formData));
    setTouchedFields(allFields);
    
    // Run full form validation
    const validationErrors = validateEntityForm(entityType, formData);
    const warnings = getEntityFormWarnings(entityType, formData);
    
    setFieldErrors(validationErrors);
    setFormWarnings(warnings);
    
    // Prevent submission if there are validation errors
    if (Object.keys(validationErrors).length > 0) {
      showToast('Por favor corrige los errores antes de guardar', 'error');
      return;
    }
    
    // Show warnings if any (non-blocking)
    if (Object.keys(warnings).length > 0) {
      Object.values(warnings).forEach((warning) => {
        showToast(warning, 'warning');
      });
    }

    try {
      // Sanitize numeric fields to prevent NaN
      const sanitizedData = { ...formData };

      if (entityType === 'fabrica') {
        sanitizedData.visualizations = sanitizeNumericField(formData.visualizations, null);
        sanitizedData.likes = sanitizeNumericField(formData.likes, null);
        
        // Validate date
        if (formData.date && !isValidISODate(formData.date)) {
          setFieldErrors({ ...fieldErrors, date: 'Fecha inválida' });
          showToast('La fecha no es válida', 'error');
          return;
        }
      }

      if (entityType === 'cancion') {
        sanitizedData.year = sanitizeNumericField(formData.year, null);
      }

      if (entityType === 'jingle') {
        // Sanitize boolean fields
        sanitizedData.isJinglazo = sanitizeBooleanField(formData.isJinglazo, false);
        sanitizedData.isJinglazoDelDia = sanitizeBooleanField(formData.isJinglazoDelDia, false);
        sanitizedData.isPrecario = sanitizeBooleanField(formData.isPrecario, false);
        sanitizedData.isLive = sanitizeBooleanField(formData.isLive, false);
        sanitizedData.isRepeat = sanitizeBooleanField(formData.isRepeat, false);
      }

      if (entityType === 'artista') {
        // Sanitize boolean field
        sanitizedData.isArg = sanitizeBooleanField(formData.isArg, false);
      }

      const updatePayload: Partial<Entity> = sanitizedData;
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

      showToast('Cambios guardados exitosamente', 'success');
      setHasChanges(false);
      setFieldErrors({});
      setTouchedFields(new Set());
      setFormWarnings({});
      setIsEditing(false);
      if (onSave) {
        await onSave(updated);
      }
    } catch (err: unknown) {
      // Parse server-side validation errors
      let serverErrors: Record<string, string> = {};
      let errorMessage = 'Error al guardar';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Try to parse error response for field-specific errors
        try {
          // Check if error has a response with data
          const errorAny = err as any;
          if (errorAny.response?.data) {
            const errorData = errorAny.response.data;
            // Handle different error response formats
            if (errorData.errors && typeof errorData.errors === 'object') {
              serverErrors = errorData.errors;
            } else if (errorData.field && errorData.message) {
              serverErrors[errorData.field] = errorData.message;
            } else if (typeof errorData === 'object') {
              // Try to extract field errors from object
              Object.keys(errorData).forEach((key) => {
                if (typeof errorData[key] === 'string') {
                  serverErrors[key] = errorData[key];
                }
              });
            }
          }
        } catch (parseError) {
          // If parsing fails, just use the error message
          console.warn('Could not parse server error response:', parseError);
        }
      }
      
      // Set server errors to fieldErrors state
      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
        // Mark all error fields as touched
        setTouchedFields((prev) => {
          const newTouched = new Set(prev);
          Object.keys(serverErrors).forEach((field) => newTouched.add(field));
          return newTouched;
        });
      } else {
        // Show general error toast if no field-specific errors
        showToast(errorMessage, 'error');
      }
      
      console.error('Error saving entity:', err);
    }
  };

  // Notify parent when hasChanges changes, but only if we're actually in editing mode
  // This prevents false positives when entering edit mode
  useEffect(() => {
    if (onChange && isEditing) {
      onChange(hasChanges);
    } else if (onChange && !isEditing) {
      // When not editing, explicitly notify parent that there are no changes
      onChange(false);
    }
  }, [hasChanges, onChange, isEditing]);

  // Expose hasUnsavedChanges and save methods via ref
  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => hasChanges,
    save: async () => {
      if (hasChanges) {
        await handleSave();
      }
    },
  }), [hasChanges, handleSave]);

  // Phase 1: handleCancel removed - cancel button now in EntityCard heading calls onEditClick

  if (!entity) {
    return null;
  }

  // Get editable fields with custom ordering for specific entity types
  const excluded = [
    ...(EXCLUDED_FIELDS._all || []),
    ...(EXCLUDED_FIELDS[entityType] || []),
    ...(entityType === 'jingle' ? EXCLUDED_FIELDS.jingles_derived || [] : []),
  ];

  let editableFields: string[];

  // For jingles, fabricas, canciones, artistas, and tematicas, use the custom field order
  if (entityType === 'jingle' && FIELD_ORDER.jingle) {
    editableFields = FIELD_ORDER.jingle.filter((key) => {
      // Don't include excluded fields
      if (excluded.includes(key)) return false;
      // Use formData value if available, otherwise entity value, otherwise undefined
      const value = formData[key] ?? (entity as any)[key] ?? undefined;
      // Only show primitive types and simple objects
      return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      );
    });
  } else if (entityType === 'fabrica' && FIELD_ORDER.fabrica) {
    editableFields = FIELD_ORDER.fabrica.filter((key) => {
      // Don't include excluded fields
      if (excluded.includes(key)) return false;
      // Use formData value if available, otherwise entity value, otherwise undefined
      const value = formData[key] ?? (entity as any)[key] ?? undefined;
      // Only show primitive types and simple objects
      return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      );
    });
  } else if (entityType === 'cancion' && FIELD_ORDER.cancion) {
    editableFields = FIELD_ORDER.cancion.filter((key) => {
      // Don't include excluded fields
      if (excluded.includes(key)) return false;
      // Use formData value if available, otherwise entity value, otherwise undefined
      const value = formData[key] ?? (entity as any)[key] ?? undefined;
      // Only show primitive types and simple objects
      return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      );
    });
  } else if (entityType === 'artista' && FIELD_ORDER.artista) {
    editableFields = FIELD_ORDER.artista.filter((key) => {
      // Don't include excluded fields
      if (excluded.includes(key)) return false;
      // Use formData value if available, otherwise entity value, otherwise undefined
      const value = formData[key] ?? (entity as any)[key] ?? undefined;
      // Only show primitive types and simple objects
      return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      );
    });
  } else if (entityType === 'tematica' && FIELD_ORDER.tematica) {
    editableFields = FIELD_ORDER.tematica.filter((key) => {
      // Don't include excluded fields
      if (excluded.includes(key)) return false;
      // Use formData value if available, otherwise entity value, otherwise undefined
      const value = formData[key] ?? (entity as any)[key] ?? undefined;
      // Only show primitive types and simple objects
      return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      );
    });
  } else {
    // For other entity types, use the original logic
    editableFields = Object.keys(entity)
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
  }

  if (editableFields.length === 0) {
    return null;
  }

  return (
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
        {/* Phase 1: Save/Cancel buttons removed - now in EntityCard heading */}
      </div>

      {/* Fields as rows - similar to related entities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {editableFields.map((fieldName) => {
          const value = formData[fieldName];
          // Detect boolean fields by name pattern (is*, has*), not by value type
          const isBoolean = fieldName.startsWith('is') || fieldName.startsWith('has');
          const fieldType = isBoolean ? 'boolean' : typeof value;
          const isTextareaField = (TEXTAREA_FIELDS[entityType] || []).includes(fieldName);

          return (
            <div
              key={fieldName}
              style={{
                display: 'flex',
                alignItems: isTextareaField ? 'flex-start' : 'center',
                gap: '12px',
                padding: '2px 12px',
                minHeight: '28px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#fff',
                flexWrap: 'wrap',
              }}
            >
              {isEditing ? (
                <>
                  {fieldName === 'youtubeUrl' && entityType === 'fabrica' ? (
                    // YouTube URL is read-only for Fabricas (auto-generated from id)
                    <>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                        }}
                      >
                        {fieldName}:
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#999',
                          flex: 1,
                          fontStyle: 'italic',
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {String(value || '')}
                      </span>
                    </>
                  ) : fieldName === 'autoComment' && entityType === 'jingle' ? (
                    // autoComment is read-only for Jingles (system-generated)
                    <>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                        }}
                      >
                        {fieldName}:
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#999',
                          flex: 1,
                          fontStyle: 'italic',
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {String(value || '')}
                      </span>
                    </>
                  ) : fieldName === 'id' && (entityType === 'jingle' || entityType === 'cancion' || entityType === 'artista' || entityType === 'tematica') ? (
                    // ID field is read-only for jingles, canciones, artistas, and tematicas
                    <>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                        }}
                      >
                        {fieldName}:
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#999',
                          flex: 1,
                          fontStyle: 'italic',
                        }}
                      >
                        {String(value)}
                      </span>
                    </>
                  ) : fieldName === 'date' && entityType === 'fabrica' ? (
                    // Date field with date picker for Fabricas
                    <>
                      <label
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                          margin: 0,
                        }}
                      >
                        {fieldName}:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                        <DatePickerField
                          value={formData.date || null}
                          onChange={(isoDate) => handleFieldChange('date', isoDate)}
                          onBlur={() => handleFieldBlur('date')}
                          hasError={!!fieldErrors.date}
                        />
                        {fieldErrors.date && <FieldErrorDisplay error={fieldErrors.date} fieldName="date" />}
                      </div>
                    </>
                  ) : fieldName === 'status' && entityType === 'fabrica' && FIELD_OPTIONS.fabrica?.status ? (
                    // Status field as dropdown for Fabricas
                    <>
                      <label
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                          margin: 0,
                        }}
                      >
                        {fieldName}:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                        <select
                          value={value || ''}
                          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                          onBlur={() => handleFieldBlur(fieldName)}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            backgroundColor: '#2a2a2a',
                            border: fieldErrors[fieldName] ? '2px solid #d32f2f' : '1px solid #444',
                            borderRadius: '4px',
                            fontSize: '14px',
                            color: '#fff',
                            minWidth: 0,
                            cursor: 'pointer',
                          }}
                        >
                          {FIELD_OPTIONS.fabrica.status.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {fieldErrors[fieldName] && <FieldErrorDisplay error={fieldErrors[fieldName]} fieldName={fieldName} />}
                      </div>
                    </>
                  ) : fieldName === 'category' && entityType === 'tematica' && FIELD_OPTIONS.tematica?.category ? (
                    // Category field as dropdown for Tematicas
                    <>
                      <label
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                          margin: 0,
                        }}
                      >
                        {fieldName}:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                        <select
                          value={value || ''}
                          onChange={(e) => handleFieldChange(fieldName, e.target.value || null)}
                          onBlur={() => handleFieldBlur(fieldName)}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            backgroundColor: '#2a2a2a',
                            border: fieldErrors[fieldName] ? '2px solid #d32f2f' : '1px solid #444',
                            borderRadius: '4px',
                            fontSize: '14px',
                            color: '#fff',
                            minWidth: 0,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">-- Seleccionar --</option>
                          {FIELD_OPTIONS.tematica.category.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {fieldErrors[fieldName] && <FieldErrorDisplay error={fieldErrors[fieldName]} fieldName={fieldName} />}
                      </div>
                    </>
                  ) : fieldName === 'nationality' && entityType === 'artista' && FIELD_OPTIONS.artista?.nationality ? (
                    // Nationality field as searchable dropdown for Artistas using react-select
                    <>
                      <label
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                          margin: 0,
                        }}
                      >
                        {fieldName}:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                        <Select
                          value={value ? { value, label: value } : null}
                          onChange={(selected) => handleFieldChange(fieldName, selected?.value || '')}
                          onBlur={() => handleFieldBlur(fieldName)}
                          options={FIELD_OPTIONS.artista.nationality.map((country) => ({
                            value: country,
                            label: country,
                          }))}
                          isSearchable
                          isClearable
                          placeholder="-- Seleccionar --"
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: '#2a2a2a',
                              borderColor: fieldErrors[fieldName] ? '#d32f2f' : '#444',
                              borderWidth: fieldErrors[fieldName] ? '2px' : '1px',
                              minHeight: '32px',
                              fontSize: '14px',
                              '&:hover': {
                                borderColor: fieldErrors[fieldName] ? '#d32f2f' : '#555',
                              },
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: '#2a2a2a',
                              zIndex: 9999,
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isFocused ? '#3a3a3a' : state.isSelected ? '#1976d2' : '#2a2a2a',
                              color: '#fff',
                              fontSize: '14px',
                              '&:active': {
                                backgroundColor: '#4a4a4a',
                              },
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: '#fff',
                            }),
                            input: (base) => ({
                              ...base,
                              color: '#fff',
                            }),
                            placeholder: (base) => ({
                              ...base,
                              color: '#999',
                            }),
                          }}
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary: '#1976d2',
                              primary75: '#42a5f5',
                              primary50: '#64b5f6',
                              primary25: '#90caf9',
                              neutral0: '#2a2a2a',
                              neutral5: '#333',
                              neutral10: '#3a3a3a',
                              neutral20: '#444',
                              neutral30: '#555',
                              neutral40: '#666',
                              neutral50: '#777',
                              neutral60: '#888',
                              neutral70: '#999',
                              neutral80: '#aaa',
                              neutral90: '#bbb',
                            },
                          })}
                        />
                        {fieldErrors[fieldName] && <FieldErrorDisplay error={fieldErrors[fieldName]} fieldName={fieldName} />}
                      </div>
                    </>
                  ) : isBoolean ? (
                    <>
                      <input
                        type="checkbox"
                        checked={value === true}
                        onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
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
                          handleFieldChange(fieldName, !value);
                        }}
                      >
                        {fieldName}
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
                          paddingTop: isTextareaField ? '4px' : '0',
                        }}
                      >
                        {fieldName}:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                        {(TEXTAREA_FIELDS[entityType] || []).includes(fieldName) ? (
                          <textarea
                            value={value ?? ''}
                            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                            onBlur={() => handleFieldBlur(fieldName)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: '#2a2a2a',
                              border: fieldErrors[fieldName] ? '2px solid #d32f2f' : '1px solid #444',
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
                            rows={Math.max(2, Math.ceil((value?.length || 0) / 50))}
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
                            onBlur={() => handleFieldBlur(fieldName)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: '#2a2a2a',
                              border: fieldErrors[fieldName] ? '2px solid #d32f2f' : '1px solid #444',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#fff',
                              minWidth: 0,
                            }}
                          />
                        )}
                        {fieldErrors[fieldName] && <FieldErrorDisplay error={fieldErrors[fieldName]} fieldName={fieldName} />}
                        {formWarnings[fieldName] && (
                          <div style={{ color: '#ff9800', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {formWarnings[fieldName]}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {isBoolean ? (
                    <>
                      <span
                        style={{
                          fontSize: '14px',
                          color: value ? '#4caf50' : '#999',
                          marginRight: '8px',
                        }}
                      >
                        {value ? '✓' : '✗'}
                      </span>
                      <span style={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                        {fieldName}
                      </span>
                    </>
                  ) : fieldName === 'date' && entityType === 'fabrica' ? (
                    // Date field displayed as dd/mm/yyyy for Fabricas
                    <>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                        }}
                      >
                        {fieldName}:
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          color: value === null || value === undefined ? '#999' : '#fff',
                          fontStyle: value === null || value === undefined ? 'italic' : 'normal',
                          flex: 1,
                        }}
                      >
                        {value === null || value === undefined ? '(vacío)' : formatDateDisplay(value)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#ccc',
                          minWidth: '150px',
                          flexShrink: 0,
                        }}
                      >
                        {fieldName}:
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          color: value === null || value === undefined ? '#999' : '#fff',
                          fontStyle: value === null || value === undefined ? 'italic' : 'normal',
                          flex: 1,
                        }}
                      >
                        {value === null || value === undefined ? '(vacío)' : String(value)}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

EntityMetadataEditor.displayName = 'EntityMetadataEditor';

export default EntityMetadataEditor;

