// Core type definitions
export interface Artista {
  id: string;
  nombre: string;
  tipo: 'AUTOR' | 'JINGLERO';
}

export interface Cancion {
  id: string;
  titulo: string;
  autor: Artista;
}

export interface Jingle {
  id: string;
  titulo: string;
  jinglero: Artista;
  cancionOriginal: Cancion;
  tematicas: Tematica[];
  timestamp: number;
}

export interface Fabrica {
  id: string;
  titulo: string;
  youtubeId: string;
  jingles: Jingle[];
}

export interface Tematica {
  id: string;
  nombre: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  role: 'ADMIN' | 'USER';
}