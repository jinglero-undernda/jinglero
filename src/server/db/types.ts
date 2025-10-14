export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

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