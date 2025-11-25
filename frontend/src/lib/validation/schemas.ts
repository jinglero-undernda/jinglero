/**
 * Zod Validation Schemas
 * 
 * Centralized validation schemas using Zod for all entity types.
 * These schemas are used on both frontend and backend to ensure consistent validation.
 */

import { z } from 'zod';

// ============================================================================
// Custom Validation Functions (for use in Zod schemas)
// ============================================================================

/**
 * Validate YouTube Video ID format
 * Pattern: Exactly 11 characters, alphanumeric + `-` and `_`
 */
function isValidYouTubeId(value: string): boolean {
  if (value.length !== 11) return false;
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(value);
}

/**
 * Validate URL format
 */
function isValidURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
function isValidEmail(value: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
}

/**
 * Validate social media handle (no @ prefix)
 */
function hasNoAtSymbol(value: string): boolean {
  return !value.startsWith('@');
}

// ============================================================================
// Base Field Schemas (reusable field validators)
// ============================================================================

const youtubeIdSchema = z
  .string()
  .trim()
  .length(11, 'El ID de YouTube debe tener exactamente 11 caracteres')
  .refine(isValidYouTubeId, 'El ID de YouTube debe ser alfanumérico con guiones y guiones bajos');

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || val === '' || isValidURL(val), 'Debe ser una URL válida');

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || val === '' || isValidEmail(val), 'Debe ser un email válido');

const optionalSocialHandleSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || val === '' || hasNoAtSymbol(val), 'El handle no debe incluir el símbolo @');

const optionalYearSchema = z
  .number()
  .int('El año debe ser un número entero')
  .min(1900, 'El año debe ser mayor o igual a 1900')
  .max(new Date().getFullYear(), `El año debe ser menor o igual a ${new Date().getFullYear()}`)
  .optional();

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * Fabrica Schema
 * Required: id (YouTube video ID), title, date
 */
export const fabricaSchema = z.object({
  id: youtubeIdSchema,
  title: z.string().trim().min(1, 'El título es requerido'),
  date: z.string().trim().min(1, 'La fecha es requerida'),
  status: z.enum(['DRAFT', 'PROCESSING', 'COMPLETED']).optional(),
  youtubeUrl: optionalUrlSchema,
  description: z.string().optional(),
  contents: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Jingle Schema
 * No required fields (all optional)
 * Warning: isJinglazoDelDia=true but isJinglazo=false
 */
export const jingleSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    isJinglazo: z.boolean().optional(),
    isJinglazoDelDia: z.boolean().optional(),
    isPrecario: z.boolean().optional(),
    isLive: z.boolean().optional(),
    isRepeat: z.boolean().optional(),
    comment: z.string().optional(),
    lyrics: z.string().optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .refine(
    () => {
      // Warning (non-blocking): isJinglazoDelDia without isJinglazo
      // This is handled separately as a warning, not an error
      return true;
    },
    { message: 'Validation passed' }
  );

/**
 * Cancion Schema
 * Required: title
 */
export const cancionSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'El título es requerido'),
  album: z.string().optional(),
  year: optionalYearSchema,
  genre: z.string().optional(),
  youtubeMusic: optionalUrlSchema,
  lyrics: z.string().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Artista Schema
 * Required: At least one of name OR stageName
 */
export const artistaSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().optional(),
    stageName: z.string().trim().optional(),
    nationality: z.string().optional(),
    isArg: z.boolean().optional(),
    youtubeHandle: optionalSocialHandleSchema,
    instagramHandle: optionalSocialHandleSchema,
    twitterHandle: optionalSocialHandleSchema,
    facebookProfile: optionalUrlSchema,
    website: optionalUrlSchema,
    bio: z.string().optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasName = data.name && data.name.trim() !== '';
      const hasStageName = data.stageName && data.stageName.trim() !== '';
      return hasName || hasStageName;
    },
    {
      message: 'Se requiere al menos uno: nombre o nombre artístico',
      path: ['name'], // Error will be associated with 'name' field
    }
  );

/**
 * Tematica Schema
 * Required: name
 */
export const tematicaSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.enum(['ACTUALIDAD', 'CULTURA', 'GELATINA', 'GENTE', 'POLITICA']).optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Usuario Schema (for completeness)
 */
export const usuarioSchema = z.object({
  id: z.string().optional(),
  email: optionalEmailSchema,
  username: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ============================================================================
// Schema Map
// ============================================================================

export const ENTITY_SCHEMAS: Record<string, z.ZodSchema> = {
  fabrica: fabricaSchema,
  fabricas: fabricaSchema,
  jingle: jingleSchema,
  jingles: jingleSchema,
  cancion: cancionSchema,
  canciones: cancionSchema,
  artista: artistaSchema,
  artistas: artistaSchema,
  tematica: tematicaSchema,
  tematicas: tematicaSchema,
  usuario: usuarioSchema,
  usuarios: usuarioSchema,
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate entity using Zod schema
 * Returns validation errors in format: Record<string, string>
 */
export function validateEntityWithSchema(
  entityType: string,
  data: Record<string, any>
): Record<string, string> {
  const schema = ENTITY_SCHEMAS[entityType];
  if (!schema) {
    console.warn(`No schema found for entity type: ${entityType}`);
    return {};
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return {};
  }

  // Convert Zod errors to Record<string, string> format
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.');
    errors[field] = issue.message;
  }

  return errors;
}

/**
 * Get warning messages (non-blocking) for an entity
 * Currently only used for Jingle isJinglazoDelDia validation
 */
export function getEntityWarnings(
  entityType: string,
  data: Record<string, any>
): Record<string, string> {
  const warnings: Record<string, string> = {};

  if (entityType === 'jingle' || entityType === 'jingles') {
    const isJinglazoDelDia = data.isJinglazoDelDia === true;
    const isJinglazo = data.isJinglazo === true;

    if (isJinglazoDelDia && !isJinglazo) {
      warnings.isJinglazoDelDia =
        "Advertencia: 'Es Jinglazo del Día' está marcado pero 'Es Jinglazo' no lo está";
    }
  }

  return warnings;
}

/**
 * Validate a single field using the appropriate schema
 * Returns error message or null if valid
 */
export function validateFieldWithSchema(
  entityType: string,
  fieldName: string,
  value: any,
  fullData?: Record<string, any>
): string | null {
  // For cross-field validations, validate the entire entity
  if (
    (entityType === 'artista' || entityType === 'artistas') &&
    (fieldName === 'name' || fieldName === 'stageName')
  ) {
    const errors = validateEntityWithSchema(entityType, fullData || { [fieldName]: value });
    return errors[fieldName] || null;
  }

  // For single field validation, validate just that field
  const errors = validateEntityWithSchema(entityType, { [fieldName]: value });
  return errors[fieldName] || null;
}

