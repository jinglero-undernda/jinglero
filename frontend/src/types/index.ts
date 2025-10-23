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
  timestamp: string;
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