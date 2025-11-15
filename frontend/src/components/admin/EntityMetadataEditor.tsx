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

type Entity = Artista | Cancion | Fabrica | Jingle | Tematica;

interface Props {
  entity: Entity;
  entityType: string;
  onSave?: (updatedEntity: Entity) => void;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
}

// Fields to exclude from metadata editor (per spec)
const EXCLUDED_FIELDS: Record<string, string[]> = {
  // Auto-managed fields
  _all: ['createdAt', 'updatedAt'],
  // Redundant fields (with relationships)
  jingles: ['fabricaId', 'fabricaDate', 'cancionId'],
  canciones: ['autorIds'],
  artistas: ['idUsuario'],
  // Redundant fields (derivable) - Note: youtubeUrl is NOT excluded for fabricas as it's shown read-only
  // Inherited/derived fields
  jingles_derived: ['youtubeUrl', 'timestamp', 'songTitle', 'artistName', 'genre'],
};

// Custom field ordering for specific entity types
const FIELD_ORDER: Record<string, string[]> = {
  jingle: ['id', 'title', 'isJinglazo', 'isJinglazoDelDia', 'isPrecario', 'isLive', 'isRepeat', 'comment'],
  fabrica: ['id', 'title', 'date', 'status', 'youtubeUrl'],
  cancion: ['id', 'title', 'album', 'year', 'genre', 'youtubeMusic'],
  artista: ['id', 'name', 'stageName', 'nationality', 'isArg', 'youtubeHandle', 'instagramHandle', 'twitterHandle', 'facebookProfile', 'website', 'bio'],
  tematica: ['id', 'name', 'description', 'category'],
};

// Comprehensive list of countries (in Spanish for UI consistency)
// Most common countries (Argentina, España, México) are at the top
const COMMON_COUNTRIES = ['Argentina', 'España', 'México'];
const OTHER_COUNTRIES = [
  'Afganistán', 'Albania', 'Argelia', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Armenia', 'Australia', 'Austria',
  'Azerbaiyán', 'Bahamas', 'Baréin', 'Bangladesh', 'Barbados', 'Bielorrusia', 'Bélgica', 'Belice', 'Benín', 'Bután',
  'Bolivia', 'Bosnia y Herzegovina', 'Botsuana', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Camboya',
  'Camerún', 'Canadá', 'Chad', 'Chile', 'China', 'Colombia', 'Comoras', 'Congo', 'Costa Rica', 'Croacia',
  'Cuba', 'Chipre', 'República Checa', 'Dinamarca', 'Yibuti', 'Dominica', 'República Dominicana', 'Ecuador', 'Egipto', 'El Salvador',
  'Guinea Ecuatorial', 'Eritrea', 'Estonia', 'Esuatini', 'Etiopía', 'Fiyi', 'Finlandia', 'Francia', 'Gabón', 'Gambia',
  'Georgia', 'Alemania', 'Ghana', 'Grecia', 'Granada', 'Guatemala', 'Guinea', 'Guinea-Bisáu', 'Guyana', 'Haití',
  'Honduras', 'Hungría', 'Islandia', 'India', 'Indonesia', 'Irán', 'Irak', 'Irlanda', 'Israel', 'Italia',
  'Jamaica', 'Japón', 'Jordania', 'Kazajistán', 'Kenia', 'Kiribati', 'Kosovo', 'Kuwait', 'Kirguistán', 'Laos',
  'Letonia', 'Líbano', 'Lesoto', 'Liberia', 'Libia', 'Liechtenstein', 'Lituania', 'Luxemburgo', 'Madagascar', 'Malaui',
  'Malasia', 'Maldivas', 'Malí', 'Malta', 'Islas Marshall', 'Mauritania', 'Mauricio', 'Micronesia', 'Moldavia',
  'Mónaco', 'Mongolia', 'Montenegro', 'Marruecos', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Países Bajos',
  'Nueva Zelanda', 'Nicaragua', 'Níger', 'Nigeria', 'Corea del Norte', 'Macedonia del Norte', 'Noruega', 'Omán', 'Pakistán', 'Palaos',
  'Palestina', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Filipinas', 'Polonia', 'Portugal', 'Catar', 'Rumania',
  'Rusia', 'Ruanda', 'San Cristóbal y Nieves', 'Santa Lucía', 'San Vicente y las Granadinas', 'Samoa', 'San Marino', 'Santo Tomé y Príncipe', 'Arabia Saudí', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Eslovaquia', 'Eslovenia', 'Islas Salomón', 'Somalia', 'Sudáfrica', 'Corea del Sur',
  'Sudán del Sur', 'Sri Lanka', 'Sudán', 'Surinam', 'Suecia', 'Suiza', 'Siria', 'Taiwán', 'Tayikistán',
  'Tanzania', 'Tailandia', 'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago', 'Túnez', 'Turquía', 'Turkmenistán', 'Tuvalu',
  'Uganda', 'Ucrania', 'Emiratos Árabes Unidos', 'Reino Unido', 'Estados Unidos', 'Uruguay', 'Uzbekistán', 'Vanuatu', 'Vaticano', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabue'
].sort();
const COUNTRIES = [...COMMON_COUNTRIES, ...OTHER_COUNTRIES];

// Field value options for dropdowns
const FIELD_OPTIONS: Record<string, Record<string, string[]>> = {
  fabrica: {
    status: ['DRAFT', 'PROCESSING', 'COMPLETED'],
  },
  artista: {
    nationality: COUNTRIES,
  },
  tematica: {
    category: ['ACTUALIDAD', 'CULTURA', 'GELATINA', 'GENTE', 'POLITICA'],
  },
};

// Fields that should be rendered as textareas (multi-line, word-wrapping)
const TEXTAREA_FIELDS: Record<string, string[]> = {
  fabrica: ['title', 'description', 'contents'],
  jingle: ['title', 'comment', 'lyrics'],
  cancion: ['title', 'lyrics'],
  artista: ['bio'],
  tematica: ['description'],
};

/**
 * Format date string to dd/mm/yyyy format
 */
function formatDateDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Parse date string (ISO or dd/mm/yyyy) to Date object
 */
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    // Try ISO format first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) return isoDate;
    
    // Try dd/mm/yyyy format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Split date into day, month, year components
 */
function splitDate(date: Date | null): { day: number; month: number; year: number } {
  if (!date || isNaN(date.getTime())) {
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
  }
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

/**
 * Combine day, month, year into ISO date string
 */
function combineDate(day: number, month: number, year: number): string {
  const date = new Date(year, month - 1, day);
  return date.toISOString();
}

const EntityMetadataEditor = forwardRef<{ hasUnsavedChanges: () => boolean; save: () => Promise<void> }, Props>(function EntityMetadataEditor({ entity, entityType, onSave, isEditing: externalIsEditing, onEditToggle }, ref) {
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
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // Separate state for date components (day, month, year) for Fabricas
  const [dateComponents, setDateComponents] = useState<{ day: number; month: number; year: number } | null>(null);
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
          data[key] = (entity as any)[key] ?? undefined;
        });
      } else if (entityType === 'fabrica' && FIELD_ORDER.fabrica) {
        FIELD_ORDER.fabrica.forEach((key) => {
          if (key in entity) {
            data[key] = (entity as any)[key];
          }
        });
        // Auto-generate youtubeUrl from id if it doesn't exist or id changed
        if (data.id && !data.youtubeUrl) {
          data.youtubeUrl = `https://www.youtube.com/watch?v=${data.id}`;
        }
        // Initialize date components for editing
        if (data.date) {
          const parsedDate = parseDate(data.date);
          setDateComponents(splitDate(parsedDate));
        } else {
          setDateComponents(null);
        }
      } else if (entityType === 'cancion' && FIELD_ORDER.cancion) {
        FIELD_ORDER.cancion.forEach((key) => {
          if (key in entity) {
            data[key] = (entity as any)[key];
          }
        });
      } else if (entityType === 'artista' && FIELD_ORDER.artista) {
        FIELD_ORDER.artista.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          data[key] = (entity as any)[key] ?? undefined;
        });
      } else if (entityType === 'tematica' && FIELD_ORDER.tematica) {
        FIELD_ORDER.tematica.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          data[key] = (entity as any)[key] ?? undefined;
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
          data[key] = (entity as any)[key] ?? undefined;
        });
      } else if (entityType === 'fabrica' && FIELD_ORDER.fabrica) {
        FIELD_ORDER.fabrica.forEach((key) => {
          if (key in entity) {
            data[key] = (entity as any)[key];
          }
        });
        // Auto-generate youtubeUrl from id if it doesn't exist
        if (data.id && !data.youtubeUrl) {
          data.youtubeUrl = `https://www.youtube.com/watch?v=${data.id}`;
        }
        // Reset date components
        if (data.date) {
          const parsedDate = parseDate(data.date);
          setDateComponents(splitDate(parsedDate));
        } else {
          setDateComponents(null);
        }
      } else if (entityType === 'cancion' && FIELD_ORDER.cancion) {
        FIELD_ORDER.cancion.forEach((key) => {
          if (key in entity) {
            data[key] = (entity as any)[key];
          }
        });
      } else if (entityType === 'artista' && FIELD_ORDER.artista) {
        FIELD_ORDER.artista.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          data[key] = (entity as any)[key] ?? undefined;
        });
      } else if (entityType === 'tematica' && FIELD_ORDER.tematica) {
        FIELD_ORDER.tematica.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          data[key] = (entity as any)[key] ?? undefined;
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

  const handleDateComponentChange = (component: 'day' | 'month' | 'year', value: number) => {
    const current = dateComponents || { day: 1, month: 1, year: new Date().getFullYear() };
    const updated = { ...current, [component]: value };
    setDateComponents(updated);
    
    // Combine into ISO date string and update formData
    const isoDate = combineDate(updated.day, updated.month, updated.year);
    handleFieldChange('date', isoDate);
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
      setLoading(false);
      return;
    }
    
    // Show warnings if any (non-blocking)
    if (Object.keys(warnings).length > 0) {
      Object.values(warnings).forEach((warning) => {
        showToast(warning, 'warning');
      });
    }
    
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  // Expose hasUnsavedChanges and save methods via ref
  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => hasChanges,
    save: async () => {
      if (hasChanges) {
        await handleSave();
      }
    },
  }), [hasChanges, handleSave]);

  const handleCancel = () => {
    // Reset form data to original entity values
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
        data[key] = (entity as any)[key] ?? undefined;
      });
      } else if (entityType === 'fabrica' && FIELD_ORDER.fabrica) {
        FIELD_ORDER.fabrica.forEach((key) => {
          if (key in entity) {
            data[key] = (entity as any)[key];
          }
        });
        // Auto-generate youtubeUrl from id if it doesn't exist
        if (data.id && !data.youtubeUrl) {
          data.youtubeUrl = `https://www.youtube.com/watch?v=${data.id}`;
        }
        // Reset date components
        if (data.date) {
          const parsedDate = parseDate(data.date);
          setDateComponents(splitDate(parsedDate));
        } else {
          setDateComponents(null);
        }
      } else if (entityType === 'cancion' && FIELD_ORDER.cancion) {
        FIELD_ORDER.cancion.forEach((key) => {
          if (key in entity) {
            data[key] = (entity as any)[key];
          }
        });
      } else if (entityType === 'artista' && FIELD_ORDER.artista) {
        FIELD_ORDER.artista.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          data[key] = (entity as any)[key] ?? undefined;
        });
      } else if (entityType === 'tematica' && FIELD_ORDER.tematica) {
        FIELD_ORDER.tematica.forEach((key) => {
          // Include all fields from FIELD_ORDER, even if they don't exist in entity
          data[key] = (entity as any)[key] ?? undefined;
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
      setIsEditing(false); // This will call onEditToggle if provided
  };

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
      // Only include fields that exist in the entity
      if (!(key in entity)) return false;
      // Don't include excluded fields
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
    });
  } else if (entityType === 'cancion' && FIELD_ORDER.cancion) {
    editableFields = FIELD_ORDER.cancion.filter((key) => {
      // Only include fields that exist in the entity
      if (!(key in entity)) return false;
      // Don't include excluded fields
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

      {/* Fields as rows - similar to related entities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {editableFields.map((fieldName) => {
          const value = formData[fieldName];
          const fieldType = typeof value;
          const isBoolean = fieldType === 'boolean';
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
                    // Date field with separate day/month/year inputs for Fabricas
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={dateComponents?.day || ''}
                            onChange={(e) => handleDateComponentChange('day', parseInt(e.target.value) || 1)}
                            onBlur={() => handleFieldBlur('date')}
                            placeholder="DD"
                            style={{
                              width: '50px',
                              padding: '4px 8px',
                              backgroundColor: '#2a2a2a',
                              border: fieldErrors.date ? '2px solid #d32f2f' : '1px solid #444',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#fff',
                              textAlign: 'center',
                            }}
                          />
                          <span style={{ color: '#999', fontSize: '14px' }}>/</span>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={dateComponents?.month || ''}
                            onChange={(e) => handleDateComponentChange('month', parseInt(e.target.value) || 1)}
                            onBlur={() => handleFieldBlur('date')}
                            placeholder="MM"
                            style={{
                              width: '50px',
                              padding: '4px 8px',
                              backgroundColor: '#2a2a2a',
                              border: fieldErrors.date ? '2px solid #d32f2f' : '1px solid #444',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#fff',
                              textAlign: 'center',
                            }}
                          />
                          <span style={{ color: '#999', fontSize: '14px' }}>/</span>
                          <input
                            type="number"
                            min="2000"
                            max="2100"
                            value={dateComponents?.year || ''}
                            onChange={(e) => handleDateComponentChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                            onBlur={() => handleFieldBlur('date')}
                            placeholder="YYYY"
                            style={{
                              width: '80px',
                              padding: '4px 8px',
                              backgroundColor: '#2a2a2a',
                              border: fieldErrors.date ? '2px solid #d32f2f' : '1px solid #444',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#fff',
                              textAlign: 'center',
                            }}
                          />
                        </div>
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
                        {value === null || value === undefined ? '(vacío)' : formatDateDDMMYYYY(value)}
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

