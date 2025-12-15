// Core type definitions - Updated to match Neo4j schema

/**
 * Usuario (User) entity
 * ID Format: u{8-chars} - single char prefix + 8 base36 alphanumeric characters
 * Example: u1a2b3c4d, ux7y4z9w0
 */
export interface Usuario {
  /** Unique ID in format: u{8-chars} (e.g., u1a2b3c4d) */
  id: string;
  email: string;
  role: 'ADMIN' | 'GUEST';
  artistId?: string;
  displayName: string;
  profilePictureUrl?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  facebookProfile?: string;
  youtubeHandle?: string;
  contributionsCount: number;
  createdAt: string;
  lastLogin?: string;
  updatedAt: string;
}

/**
 * Artista (Artist) entity
 * ID Format: a{8-chars} - single char prefix + 8 base36 alphanumeric characters
 * Example: a1b2c3d4, ax9y8z7w6
 */
export interface Artista {
  /** Unique ID in format: a{8-chars} (e.g., a1b2c3d4) */
  id: string;
  name?: string;
  stageName?: string;
  idUsuario?: string;
  nationality?: string;
  isArg: boolean;
  youtubeHandle?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  facebookProfile?: string;
  website?: string;
  bio?: string;
  musicBrainzId?: string;
  createdAt: string;
  updatedAt: string;
  /** Optional metadata for enhanced display (relationship counts, etc.) */
  _metadata?: EntityMetadata;
  /** System-generated primary display text with icon (read-only, auto-updated) */
  displayPrimary?: string;
  /** System-generated secondary display text (read-only, auto-updated) */
  displaySecondary?: string;
  /** System-generated badges array (read-only, auto-updated) */
  displayBadges?: string[];
  /** System-generated normalized search text (read-only, auto-updated) */
  normSearch?: string;
}

/**
 * Cancion (Song) entity
 * ID Format: c{8-chars} - single char prefix + 8 base36 alphanumeric characters
 * Example: c9f0a1b2, cx7y6z5w4
 * 
 * Redundant Properties (denormalized for performance):
 * - autorIds: Maintained automatically from AUTOR_DE relationships
 */
export interface Cancion {
  /** Unique ID in format: c{8-chars} (e.g., c9f0a1b2) */
  id: string;
  title: string;
  album?: string;
  year?: number;
  genre?: string;
  youtubeMusic?: string;
  lyrics?: string;
  /** Redundant property: Array of Artista IDs (auto-synced with AUTOR_DE relationships) */
  autorIds?: string[];
  musicBrainzId?: string;
  createdAt: string;
  updatedAt: string;
  /** Optional metadata for enhanced display (jingle count, autores, etc.) */
  _metadata?: EntityMetadata;
  /** System-generated primary display text with icon (read-only, auto-updated) */
  displayPrimary?: string;
  /** System-generated secondary display text (read-only, auto-updated) */
  displaySecondary?: string;
  /** System-generated badges array (read-only, auto-updated) */
  displayBadges?: string[];
  /** System-generated normalized search text (read-only, auto-updated) */
  normSearch?: string;
}

/**
 * Fabrica (Factory/Episode) entity
 * ID Format: External YouTube video ID (11 characters)
 * Example: 0hmxZPp0xq0, DBbyI99TtIM
 * 
 * Note: Fabricas use YouTube video IDs and are NOT subject to ID migration.
 */
export interface Fabrica {
  /** YouTube video ID (11 characters, external ID) */
  id: string;
  title?: string;
  date: string;
  youtubeUrl: string;
  visualizations?: number;
  likes?: number;
  description?: string;
  contents?: string;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'TBC'; // TBC is legacy status value
  /** System-generated primary display text with icon (read-only, auto-updated) */
  displayPrimary?: string;
  /** System-generated secondary display text (read-only, auto-updated) */
  displaySecondary?: string;
  /** System-generated badges array (read-only, auto-updated) */
  displayBadges?: string[];
  /** System-generated normalized search text (read-only, auto-updated) */
  normSearch?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tematica (Theme/Topic) entity
 * ID Format: t{8-chars} - single char prefix + 8 base36 alphanumeric characters
 * Example: t3k8m2n1, tx5y4z3w2
 */
export interface Tematica {
  /** Unique ID in format: t{8-chars} (e.g., t3k8m2n1) */
  id: string;
  name: string;
  category: 'ACTUALIDAD' | 'CULTURA' | 'GELATINA' | 'GENTE' | 'POLITICA';
  description?: string;
  /** System-generated primary display text with icon (read-only, auto-updated) */
  displayPrimary?: string;
  /** System-generated secondary display text (read-only, auto-updated) */
  displaySecondary?: string;
  /** System-generated badges array (read-only, auto-updated) */
  displayBadges?: string[];
  /** System-generated normalized search text (read-only, auto-updated) */
  normSearch?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Jingle entity
 * ID Format: j{8-chars} - single char prefix + 8 base36 alphanumeric characters
 * Example: j5e6f7g8, j9f0a1b2c
 * 
 * Redundant Properties (denormalized for performance):
 * - fabricaId: Maintained automatically from APPEARS_IN relationship
 * - fabricaDate: Maintained automatically from APPEARS_IN relationship
 * - cancionId: Maintained automatically from VERSIONA relationship
 * 
 * Relationships are the source of truth. Redundant properties are auto-synced.
 */
export interface Jingle {
  /** Unique ID in format: j{8-chars} (e.g., j5e6f7g8) */
  id: string;
  youtubeUrl?: string;
  timestamp: number; // Seconds (from APPEARS_IN relationship)
  youtubeClipUrl?: string;
  title?: string;
  comment?: string;
  lyrics?: string;
  songTitle?: string;
  artistName?: string;
  genre?: string;
  isJinglazo: boolean;
  isJinglazoDelDia: boolean;
  isPrecario: boolean;
  /** Redundant property: ID of Fabrica (auto-synced with APPEARS_IN relationship) */
  fabricaId?: string;
  /** Redundant property: Date of Fabrica (auto-synced with APPEARS_IN->Fabrica.date) */
  fabricaDate?: string;
  /** Redundant property: ID of Cancion (auto-synced with VERSIONA relationship) */
  cancionId?: string;
  isLive?: boolean;
  isRepeat?: boolean;
  /** System-generated summary comment (read-only, auto-updated) */
  autoComment?: string;
  /** From APPEARS_IN relationship (READ-ONLY, system-managed, calculated from timestamp) */
  order?: number | null;
  createdAt: string;
  updatedAt: string;
  /** Optional metadata for enhanced display (fabrica, cancion, autores, jingleros, etc.) */
  _metadata?: EntityMetadata;
  /** System-generated primary display text with icon (read-only, auto-updated) */
  displayPrimary?: string;
  /** System-generated secondary display text (read-only, auto-updated) */
  displaySecondary?: string;
  /** System-generated badges array (read-only, auto-updated) */
  displayBadges?: string[];
  /** System-generated normalized search text (read-only, auto-updated) */
  normSearch?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Schema introspection types
export interface SchemaInfo {
  labels: string[];
  relationshipTypes: string[];
  propertyKeys: string[];
  constraints: any[];
  indexes: any[];
}

// Relationship types
export interface Relationship {
  start: string;
  end: string;
  type: string;
  properties?: Record<string, any>;
}

export interface EntityRelationships {
  outgoing: Relationship[];
  incoming: Relationship[];
}

// Entity metadata for enhanced display in EntityCard
// Used to provide relationship counts and related entity information
export interface EntityMetadata {
  // For Artista
  autorCount?: number;      // Count of AUTOR_DE relationships
  jingleroCount?: number;   // Count of JINGLERO_DE relationships
  // For Cancion
  jingleCount?: number;     // Count of VERSIONA relationships
  autores?: Artista[];      // Array of autores (with their own _metadata)
  // For Jingle
  fabrica?: Fabrica;        // Fabrica object
  cancion?: Cancion;        // Cancion object
  autores?: Artista[];      // Autores array
  jingleros?: Artista[];    // Jingleros array
}