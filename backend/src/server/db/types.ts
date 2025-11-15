export enum UserRole {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export enum ProcessStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED'
}

export enum CategoriaTematica {
  ACTUALIDAD = 'ACTUALIDAD', // For news and current events
  CULTURA = 'CULTURA', // For customary, folklore and traditions, everyday topics
  GELATINA = 'GELATINA', // For Stream-related "slang", inside jokes or reference to the community
  GENTE = 'GENTE', // For people, characters, personalities
  POLITICA = 'POLITICA' // For elections, candidates, political views
}

export interface Usuario {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  profilePictureUrl?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  facebookProfile?: string;
  youtubeHandle?: string;
  artistId?: string;
  contributionsCount: number;
  createdAt: Date;
  lastLogin?: Date;
  updatedAt: Date;
}

export interface Jingle {
  id: string;
  youtubeUrl: string;
  timestamp: number;
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
  fabricaDate?: Date; // Date of Fabrica (redundant with APPEARS_IN->Fabrica.date, for display/query performance)
  cancionId?: string; // ID of Cancion (redundant with VERSIONA relationship)
  // NEW: UX identification props
  isLive?: boolean; // Indicates if Jingle was performed live
  isRepeat?: boolean; // Indicates if this song was performed on the show before
  status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'; // Entity lifecycle status
  createdAt: Date;
  updatedAt: Date;
}

export interface Artista {
  id: string;
  stageName: string;
  name?: string;
  idUsuario?: string;
  nationality?: string;
  isArg: boolean;
  youtubeHandle?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  facebookProfile?: string;
  website?: string;
  bio?: string;
  status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'; // Entity lifecycle status
  createdAt: Date;
  updatedAt: Date;
}

export interface Cancion {
  id: string;
  title: string;
  album?: string;
  year?: number;
  genre?: string;
  youtubeMusic?: string;
  lyrics: string;
  // NEW: Redundant foreign keys for performance (denormalized)
  autorIds?: string[]; // Array of Artista IDs (redundant with AUTOR_DE relationships)
  status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'; // Entity lifecycle status
  createdAt: Date;
  updatedAt: Date;
}

export interface Fabrica {
  id: string;
  title?: string;
  date: Date;
  youtubeUrl: string;
  visualizations?: number;
  likes?: number;
  description?: string;
  contents?: string;
  status: ProcessStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tematica {
   id: string;
   name: string;
   category: CategoriaTematica;
   description?: string;
   status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'; // Entity lifecycle status
   createdAt: Date;
   updatedAt: Date
  }
