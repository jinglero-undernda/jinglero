import { z } from 'zod';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';

/**
 * Task 29: Zod schemas for runtime validation of API responses
 * These schemas validate entity types and relationship responses
 */

// Base schema for common date fields
const dateStringSchema = z.string().datetime().or(z.string()); // Accept ISO strings or other date formats

// Schema that handles null/undefined dates by providing defaults
const dateStringWithDefaultSchema = z.preprocess(
  (val) => {
    // Handle null, undefined, or empty string
    if (val === null || val === undefined || val === '') {
      return new Date().toISOString();
    }
    // If it's already a string, return it
    if (typeof val === 'string') {
      return val;
    }
    // If it's a number (timestamp), convert it
    if (typeof val === 'number') {
      return new Date(val).toISOString();
    }
    // If it's a Date object, convert it
    if (val instanceof Date) {
      return val.toISOString();
    }
    // Default fallback
    return new Date().toISOString();
  },
  dateStringSchema
);

// Artista schema
export const ArtistaSchema: z.ZodType<Artista> = z.object({
  id: z.string(),
  name: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ), // Convert null to undefined to match type (API may return null for artists with only stageName)
  stageName: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  idUsuario: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  nationality: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  isArg: z.boolean().default(false), // Default to false if missing
  youtubeHandle: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  instagramHandle: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  twitterHandle: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  facebookProfile: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  website: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  bio: z.preprocess(
    (val) => val === null ? undefined : val,
    z.string().optional()
  ),
  createdAt: dateStringWithDefaultSchema,
  updatedAt: dateStringWithDefaultSchema,
});

// Cancion schema
export const CancionSchema = z.object({
  id: z.string(),
  title: z.string(),
  album: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  genre: z.string().nullable().optional(),
  youtubeMusic: z.string().nullable().optional(),
  lyrics: z.string().nullable().optional(),
  createdAt: dateStringWithDefaultSchema,
  updatedAt: dateStringWithDefaultSchema,
}) as z.ZodType<Cancion>;

// Fabrica schema
export const FabricaSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  date: z.string(), // Date string (not necessarily ISO)
  youtubeUrl: z.string(),
  visualizations: z.number().optional(),
  likes: z.number().optional(),
  description: z.string().optional(),
  contents: z.string().optional(),
  // Allow legacy status values like "TBC" in addition to current schema values
  status: z.enum(['DRAFT', 'PROCESSING', 'COMPLETED', 'TBC']).optional(), // Optional since it may be missing in embedded responses
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
  // Additional fields that may come from relationships
  // timestamp can be a number (seconds) or string (HH:MM:SS format), or null
  timestamp: z.union([z.string(), z.number(), z.null()]).optional(),
  order: z.number().nullable().optional(), // Allow null since API may return null
});

// Tematica schema
export const TematicaSchema: z.ZodType<Tematica> = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['ACTUALIDAD', 'CULTURA', 'GELATINA', 'GENTE', 'POLITICA']),
  description: z.string().optional(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
  // Additional fields that may come from relationships
  // isPrimary can be boolean, null, or undefined
  isPrimary: z.union([z.boolean(), z.null()]).optional(),
});

// Jingle schema - full schema with all required fields
export const JingleSchema: z.ZodType<Jingle> = z.object({
  id: z.string(),
  youtubeUrl: z.string().optional(),
  // Timestamp is now always a number (seconds) after BUG_0010 migration
  timestamp: z.number(),
  youtubeClipUrl: z.string().optional(),
  title: z.string().optional(),
  comment: z.string().optional(),
  lyrics: z.string().optional(),
  songTitle: z.string().optional(),
  artistName: z.string().optional(),
  genre: z.string().optional(),
  // Make boolean fields optional and handle undefined/null - default to false
  isJinglazo: z.preprocess(
    // Convert string "true"/"false" to boolean, or undefined/null to false
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === undefined || val === null) return false;
      return val;
    },
    z.boolean().default(false)
  ),
  isJinglazoDelDia: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === undefined || val === null) return false;
      return val;
    },
    z.boolean().default(false)
  ),
  isPrecario: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === undefined || val === null) return false;
      return val;
    },
    z.boolean().default(false)
  ),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
  // Relationship properties (optional, present when fetched in relationship context)
  order: z.number().nullable().optional(), // From APPEARS_IN relationship
}).passthrough(); // Allow additional properties from relationships

// Partial Jingle schema for relationship queries that may not return all fields
// Used when fetching jingles from related endpoints (e.g., /entities/canciones/:id/related)
export const JinglePartialSchema = z.object({
  id: z.string(),
  youtubeUrl: z.string().optional(),
  // Timestamp is now always a number (seconds) after BUG_0010 migration
  // Allow null since API may return null when there's no APPEARS_IN relationship (BUG_0012)
  timestamp: z.union([z.number(), z.null()]).optional(), // Allow optional, null, or number
  youtubeClipUrl: z.string().nullable().optional(),
  title: z.string().nullable().optional(), // Allow null for title (some jingles may have null title)
  comment: z.string().nullable().optional(),
  lyrics: z.string().nullable().optional(),
  songTitle: z.string().nullable().optional(),
  artistName: z.string().nullable().optional(),
  genre: z.string().nullable().optional(),
  // Make boolean fields optional and handle undefined/null - default to false
  isJinglazo: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === undefined || val === null) return false;
      return val;
    },
    z.boolean().default(false).nullable().optional()
  ),
  isJinglazoDelDia: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === undefined || val === null) return false;
      return val;
    },
    z.boolean().default(false).nullable().optional()
  ),
  isPrecario: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === undefined || val === null) return false;
      return val;
    },
    z.boolean().default(false).nullable().optional()
  ),
  createdAt: dateStringSchema.optional(),
  updatedAt: dateStringSchema.optional(),
  // Additional relationship data that may be included
  // Allow fabrica to be an object (even if incomplete), null, undefined, or missing
  fabrica: z.union([
    z.object({
      id: z.string().optional(), // Make id optional in case fabrica object exists but is incomplete
      title: z.string().optional(),
      date: dateStringSchema.optional(),
      updatedAt: dateStringSchema.optional(),
    }).passthrough(), // Allow additional properties
    z.null(),
    z.undefined(),
    z.any(), // Allow any value as fallback
  ]).optional(), // Allow fabrica object, null, undefined, or missing
}).passthrough() as z.ZodType<Partial<Jingle> & { id: string }>; // Allow additional properties

// Task 29: JingleDetailResponse schema with all relationships
// This matches the response from /api/public/jingles/:id
// Use passthrough to allow additional fields and make required fields optional
// since the API may return incomplete data
export const JingleDetailResponseSchema = (JingleSchema as any).passthrough().extend({
  // Make required Jingle fields optional since API may not return all fields
  timestamp: z.number().optional(),
  isJinglazo: z.boolean().optional(),
  isJinglazoDelDia: z.boolean().optional(),
  isPrecario: z.boolean().optional(),
  fabrica: (FabricaSchema as any).passthrough().nullable().optional(),
  cancion: (CancionSchema as any).passthrough().nullable().optional(),
  jingleros: z.array((ArtistaSchema as any).passthrough()).optional(),
  autores: z.array((ArtistaSchema as any).passthrough()).optional(),
  tematicas: z.array((TematicaSchema as any).passthrough()).optional(),
}).passthrough() as z.ZodType<Jingle & {
  fabrica?: Fabrica | null;
  cancion?: Cancion | null;
  jingleros?: Artista[];
  autores?: Artista[];
  tematicas?: Tematica[];
}>;

// Array schemas for relationship responses
// Use passthrough to allow extra fields in nested objects
export const ArtistaArraySchema = z.array((ArtistaSchema as any).passthrough());
export const CancionArraySchema = z.array((CancionSchema as any).passthrough());
export const FabricaArraySchema = z.array((FabricaSchema as any).passthrough());
export const JingleArraySchema = z.array(JingleSchema);
// Schema for Jingles that may include embedded relationship data (e.g., fabrica)
export const JingleWithRelationsSchema = (JingleSchema as any).extend({
  fabrica: (FabricaSchema as any).passthrough().nullable().optional(),
}).passthrough();
export const JingleWithRelationsArraySchema = z.array(JingleWithRelationsSchema);
export const JinglePartialArraySchema = z.array(JinglePartialSchema);
export const TematicaArraySchema = z.array((TematicaSchema as any).passthrough());

/**
 * Helper function to safely parse and validate data with Zod
 * Returns the validated data or null if validation fails
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: string
): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Validation error${context ? ` in ${context}` : ''}:`, result.error.format());
    console.error(`Validation error details${context ? ` in ${context}` : ''}:`, JSON.stringify(result.error.issues, null, 2));
    console.error(`Data that failed validation:`, JSON.stringify(data, null, 2));
    return null;
  }
  return result.data;
}

/**
 * Helper function to safely parse array data
 * Returns empty array if validation fails
 * Accepts either a single item schema (which will be wrapped in z.array) or an array schema directly
 */
export function safeParseArray<T>(
  schema: z.ZodType<T> | z.ZodArray<z.ZodType<T>>,
  data: unknown,
  context?: string
): T[] {
  // If schema is already an array schema, use it directly; otherwise wrap it
  const arraySchema = schema instanceof z.ZodArray ? schema : z.array(schema);
  const result = arraySchema.safeParse(data);
  if (!result.success) {
    console.error(`Validation error${context ? ` in ${context}` : ''}:`, result.error.format());
    console.error(`Validation error details${context ? ` in ${context}` : ''}:`, JSON.stringify(result.error.issues, null, 2));
    console.error(`Data that failed validation:`, JSON.stringify(data, null, 2));
    return [];
  }
  return result.data as T[];
}

