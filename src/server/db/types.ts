export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
  SUBSCRIBER = 'SUBSCRIBER'
}

export enum ProcessStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED'
}

export enum CategoriaTematica {
  ACTUALIDAD = 'ACTUALIDAD', 
  CULTURA = 'CULTURA', 
  GELATINA = 'GELATINA',
  GENTE = 'GENTE', 
  POLITICA = 'POTITICA' 
}

/*
export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Clip {
  id: string;
  youtubeUrl: string;
  timestamp: number;
  title?: string;
  songTitle: string;
  artistName: string;
  genre?: string;
  year?: number;
  streamTitle: string;
  streamDate: Date;
  contributorId?: string;
  isJinglazo: boolean;
  isPrecario: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Term {
  id: string;
  name: string;
  category: string;
  description: string;
  usage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Artist {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  year?: number;
  genre?: string;
  youtubeMusic?: string;
  createdAt: Date;
  updatedAt: Date;
}
*/

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
   createdAt: Date;
   updatedAt: Date
  }
