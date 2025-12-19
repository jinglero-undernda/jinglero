/**
 * Entity Validation Utilities (Backend)
 * 
 * Provides validation functions for entity input using Zod schemas.
 * These validation rules match the frontend validation exactly to prevent drift.
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

const urlSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || isValidURL(val), 'Debe ser una URL válida');

const optionalUrlSchema = z
  .union([
    z.string().trim(),
    z.null(),
    z.undefined()
  ])
  .refine((val) => val === null || val === undefined || val === '' || isValidURL(val), 'Debe ser una URL válida');

const emailSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || isValidEmail(val), 'Debe ser un email válido');

const optionalEmailSchema = z
  .string()
  .trim()
  .nullish()
  .refine((val) => !val || val === '' || isValidEmail(val), 'Debe ser un email válido');

const socialHandleSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || hasNoAtSymbol(val), 'El handle no debe incluir el símbolo @');

const optionalSocialHandleSchema = z
  .string()
  .trim()
  .nullish()
  .refine((val) => !val || val === '' || hasNoAtSymbol(val), 'El handle no debe incluir el símbolo @');

const yearSchema = z
  .number()
  .int('El año debe ser un número entero')
  .min(1900, 'El año debe ser mayor o igual a 1900')
  .max(new Date().getFullYear(), `El año debe ser menor o igual a ${new Date().getFullYear()}`);

const optionalYearSchema = z
  .number()
  .int('El año debe ser un número entero')
  .min(1900, 'El año debe ser mayor o igual a 1900')
  .max(new Date().getFullYear(), `El año debe ser menor o igual a ${new Date().getFullYear()}`)
  .optional()
  .nullable();

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
  description: z.string().nullish(),
  contents: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough(); // Allow additional fields

/**
 * Jingle Schema
 * No required fields (all optional)
 */
export const jingleSchema = z.object({
  id: z.string().nullish(),
  title: z.string().nullish(),
  isJinglazo: z.boolean().optional(),
  isJinglazoDelDia: z.boolean().optional(),
  isPrecario: z.boolean().optional(),
  isLive: z.boolean().optional(),
  isRepeat: z.boolean().optional(),
  comment: z.string().nullish(),
  lyrics: z.string().nullish(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

/**
 * Cancion Schema
 * Required: title
 */
export const cancionSchema = z.object({
  id: z.string().nullish(),
  title: z.string().trim().min(1, 'El título es requerido'),
  album: z.string().nullish(),
  year: optionalYearSchema,
  genre: z.string().nullish(),
  youtubeMusic: z.string().trim().optional().nullable().refine(
    (val) => !val || val === '' || isValidYouTubeId(val),
    'Debe ser un ID de YouTube válido (11 caracteres alfanuméricos)'
  ),
  lyrics: z.string().nullish(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

/**
 * Artista Schema
 * Required: At least one of name OR stageName
 */
export const artistaSchema = z
  .object({
    id: z.string().nullish(),
    name: z.string().trim().nullish(),
    stageName: z.string().trim().nullish(),
    nationality: z.string().nullish(),
    isArg: z.boolean().optional(),
    youtubeHandle: optionalSocialHandleSchema,
    instagramHandle: optionalSocialHandleSchema,
    twitterHandle: optionalSocialHandleSchema,
    facebookProfile: optionalUrlSchema,
    website: optionalUrlSchema,
    bio: z.string().nullish(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough()
  .refine(
    (data) => {
      const hasName = data.name && typeof data.name === 'string' && data.name.trim() !== '';
      const hasStageName = data.stageName && typeof data.stageName === 'string' && data.stageName.trim() !== '';
      return hasName || hasStageName;
    },
    {
      message: "Artista must have at least one of 'name' or 'stageName'",
      path: ['name'],
    }
  );

/**
 * Tematica Schema
 * Required: name
 */
export const tematicaSchema = z.object({
  id: z.string().nullish(),
  name: z.string().trim().min(1, 'El nombre es requerido'),
  description: z.string().nullish(),
  category: z.enum(['ACTUALIDAD', 'CULTURA', 'GELATINA', 'GENTE', 'POLITICA']).optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DELETED']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

/**
 * Usuario Schema
 */
export const usuarioSchema = z.object({
  id: z.string().nullish(),
  email: optionalEmailSchema,
  username: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

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
 * Validate entity input using Zod schema
 * Throws an error with formatted message if validation fails
 * Returns the validated data if successful
 */
export function validateEntityInput(entityType: string, data: any): any {
  const schema = ENTITY_SCHEMAS[entityType];
  if (!schema) {
    throw new Error(`No schema found for entity type: ${entityType}`);
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  // Format validation errors for API response
  const errors = result.error.issues.map((issue) => {
    const field = issue.path.join('.');
    return `${field}: ${issue.message}`;
  });

  throw new Error(`Validation failed: ${errors.join(', ')}`);
}

/**
 * Validate entity input and return errors object
 * Returns { valid: boolean, errors: Record<string, string> }
 */
export function validateEntityInputSafe(
  entityType: string,
  data: any
): { valid: boolean; errors: Record<string, string> } {
  const schema = ENTITY_SCHEMAS[entityType];
  if (!schema) {
    return {
      valid: false,
      errors: { _general: `No schema found for entity type: ${entityType}` },
    };
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: {} };
  }

  // Convert Zod errors to Record<string, string> format
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.');
    errors[field || '_general'] = issue.message;
  }

  return { valid: false, errors };
}

