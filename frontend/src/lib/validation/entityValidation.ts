/**
 * Entity Validation Utilities
 * 
 * Provides validation functions for all entity types including:
 * - Required field validation
 * - Format validations (YouTube ID, URLs, email, handles, year)
 * - Cross-field validations
 */

// Required fields per entity type
const REQUIRED_FIELDS: Record<string, string[]> = {
  fabrica: ['id', 'title', 'date'],
  cancion: ['title'],
  tematica: ['name'],
  artista: [], // Special case: at least one of name OR stageName
  jingle: [], // No required fields
};

// URL fields that need URL format validation
const URL_FIELDS = ['youtubeUrl', 'youtubeClipUrl', 'youtubeMusic', 'lyrics', 'website'];

// Social media handle fields
const SOCIAL_HANDLE_FIELDS = ['youtubeHandle', 'instagramHandle', 'twitterHandle'];

/**
 * Validate YouTube Video ID format
 * Pattern: Exactly 11 characters, alphanumeric + `-` and `_`
 */
export function validateYouTubeId(value: any): string | null {
  if (!value || typeof value !== 'string') {
    return null; // Empty is handled by required validation
  }
  
  const trimmed = value.trim();
  if (trimmed.length !== 11) {
    return 'El ID de YouTube debe tener exactamente 11 caracteres (alfanumérico, guiones y guiones bajos)';
  }
  
  const pattern = /^[a-zA-Z0-9_-]+$/;
  if (!pattern.test(trimmed)) {
    return 'El ID de YouTube debe tener exactamente 11 caracteres (alfanumérico, guiones y guiones bajos)';
  }
  
  return null;
}

/**
 * Validate URL format
 */
export function validateURL(value: any): string | null {
  if (!value || typeof value !== 'string') {
    return null; // Empty is handled by required validation
  }
  
  const trimmed = value.trim();
  if (trimmed === '') {
    return null; // Empty is allowed for optional fields
  }
  
  try {
    new URL(trimmed);
    return null;
  } catch {
    return 'Debe ser una URL válida';
  }
}

/**
 * Validate email format
 */
export function validateEmail(value: any): string | null {
  if (!value || typeof value !== 'string') {
    return null; // Empty is handled by required validation
  }
  
  const trimmed = value.trim();
  if (trimmed === '') {
    return null; // Empty is allowed for optional fields
  }
  
  // Basic email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return 'Debe ser un email válido';
  }
  
  return null;
}

/**
 * Validate social media handle (no @ prefix)
 */
export function validateSocialHandle(value: any): string | null {
  if (!value || typeof value !== 'string') {
    return null; // Empty is handled by required validation
  }
  
  const trimmed = value.trim();
  if (trimmed === '') {
    return null; // Empty is allowed for optional fields
  }
  
  if (trimmed.startsWith('@')) {
    return 'El handle no debe incluir el símbolo @';
  }
  
  return null;
}

/**
 * Validate year range (1900 to current year)
 */
export function validateYear(value: any): string | null {
  if (value === null || value === undefined || value === '') {
    return null; // Empty is allowed for optional fields
  }
  
  const year = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (isNaN(year)) {
    return 'El año debe ser un número válido';
  }
  
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return `El año debe estar entre 1900 y ${currentYear}`;
  }
  
  return null;
}

/**
 * Validate Artista: at least one of name OR stageName must be provided
 */
export function validateArtistaNameOrStageName(formData: Record<string, any>): string | null {
  const name = formData.name;
  const stageName = formData.stageName;
  
  const hasName = name && typeof name === 'string' && name.trim() !== '';
  const hasStageName = stageName && typeof stageName === 'string' && stageName.trim() !== '';
  
  if (!hasName && !hasStageName) {
    return 'Se requiere al menos uno: nombre o nombre artístico';
  }
  
  return null;
}

/**
 * Validate Jingle: warning if isJinglazoDelDia is true but isJinglazo is false
 * Returns warning message (not blocking error)
 */
export function validateJingleJinglazoCrossField(formData: Record<string, any>): string | null {
  const isJinglazoDelDia = formData.isJinglazoDelDia === true;
  const isJinglazo = formData.isJinglazo === true;
  
  if (isJinglazoDelDia && !isJinglazo) {
    return "Advertencia: 'Es Jinglazo del Día' está marcado pero 'Es Jinglazo' no lo está";
  }
  
  return null;
}

/**
 * Validate a single field for an entity
 */
export function validateEntityField(
  entityType: string,
  fieldName: string,
  value: any,
  _formData: Record<string, any>
): string | null {
  // Check required fields
  const requiredFields = REQUIRED_FIELDS[entityType] || [];
  if (requiredFields.includes(fieldName)) {
    if (value === null || value === undefined || value === '' || 
        (typeof value === 'string' && value.trim() === '')) {
      const fieldLabels: Record<string, Record<string, string>> = {
        fabrica: { id: 'ID', title: 'Título', date: 'Fecha' },
        cancion: { title: 'Título' },
        tematica: { name: 'Nombre' },
      };
      const label = fieldLabels[entityType]?.[fieldName] || fieldName;
      return `${label} es requerido`;
    }
  }
  
  // Format validations
  if (fieldName === 'id' && entityType === 'fabrica') {
    return validateYouTubeId(value);
  }
  
  if (URL_FIELDS.includes(fieldName)) {
    return validateURL(value);
  }
  
  if (fieldName === 'email') {
    return validateEmail(value);
  }
  
  if (SOCIAL_HANDLE_FIELDS.includes(fieldName)) {
    return validateSocialHandle(value);
  }
  
  if (fieldName === 'year' && entityType === 'cancion') {
    return validateYear(value);
  }
  
  return null;
}

/**
 * Validate entire form for an entity
 * Returns Record<string, string> of field errors
 */
export function validateEntityForm(
  entityType: string,
  formData: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Validate all fields
  Object.keys(formData).forEach((fieldName) => {
    const value = formData[fieldName];
    const error = validateEntityField(entityType, fieldName, value, formData);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  // Cross-field validations
  if (entityType === 'artista') {
    const crossFieldError = validateArtistaNameOrStageName(formData);
    if (crossFieldError) {
      // Apply to both fields if neither is present
      if (!formData.name || (typeof formData.name === 'string' && formData.name.trim() === '')) {
        errors.name = crossFieldError;
      }
      if (!formData.stageName || (typeof formData.stageName === 'string' && formData.stageName.trim() === '')) {
        errors.stageName = crossFieldError;
      }
    }
  }
  
  // Jingle cross-field validation (warning, not blocking)
  if (entityType === 'jingle') {
    validateJingleJinglazoCrossField(formData); // Warning, not blocking
    // Note: This is a warning, not an error, so we don't add it to errors
    // It will be handled separately in the UI
  }
  
  return errors;
}

/**
 * Get warning messages (non-blocking) for an entity form
 */
export function getEntityFormWarnings(
  entityType: string,
  formData: Record<string, any>
): Record<string, string> {
  const warnings: Record<string, string> = {};
  
  if (entityType === 'jingle') {
    const warning = validateJingleJinglazoCrossField(formData);
    if (warning) {
      warnings.isJinglazoDelDia = warning;
    }
  }
  
  return warnings;
}

