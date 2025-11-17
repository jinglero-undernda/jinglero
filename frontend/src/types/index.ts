// Core type definitions - Updated to match Neo4j schema

export interface Usuario {
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

export interface Artista {
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
  createdAt: string;
  updatedAt: string;
}

export interface Cancion {
  id: string;
  title: string;
  album?: string;
  year?: number;
  genre?: string;
  youtubeMusic?: string;
  lyrics?: string;
  // NEW: Redundant foreign keys for performance (denormalized)
  autorIds?: string[]; // Array of Artista IDs (redundant with AUTOR_DE relationships)
  createdAt: string;
  updatedAt: string;
}

export interface Fabrica {
  id: string;
  title?: string;
  date: string;
  youtubeUrl: string;
  visualizations?: number;
  likes?: number;
  description?: string;
  contents?: string;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface Tematica {
  id: string;
  name: string;
  category: 'ACTUALIDAD' | 'CULTURA' | 'GELATINA' | 'GENTE' | 'POLITICA';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Jingle {
  id: string;
  youtubeUrl?: string;
  timestamp: string | number; // Can be HH:MM:SS string or seconds number (from APPEARS_IN relationship)
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
  // NEW: Redundant foreign keys for performance (denormalized)
  fabricaId?: string; // ID of Fabrica (redundant with APPEARS_IN relationship)
  fabricaDate?: string; // Date of Fabrica (redundant with APPEARS_IN->Fabrica.date, for display/query performance)
  cancionId?: string; // ID of Cancion (redundant with VERSIONA relationship)
  // NEW: UX identification props
  isLive?: boolean; // Indicates if Jingle was performed live
  isRepeat?: boolean; // Indicates if this song was performed on the show before
  // Relationship properties (present when fetched in relationship context)
  order?: number | null; // From APPEARS_IN relationship
  createdAt: string;
  updatedAt: string;
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