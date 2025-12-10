/**
 * Jingle timeline item used in Production Belt
 */
export interface JingleArtista {
  id: string;
  name?: string;
  stageName?: string;
}

export interface JingleCancion {
  id: string;
  title: string;
}

export interface JingleTematica {
  id: string;
  name: string;
  category?: 'ACTUALIDAD' | 'CULTURA' | 'GELATINA' | 'GENTE' | 'POLITICA';
  description?: string;
  isPrimary?: boolean;
}

export interface JingleTimelineItem {
  id: string;
  timestamp: string | number; // Can be string (HH:MM:SS) or number (seconds)
  title?: string;
  jingleros?: JingleArtista[] | JingleArtista | null;
  cancion?: JingleCancion | null;
  autores?: JingleArtista[] | JingleArtista | null;
  tematicas?: JingleTematica[] | null;
  comment?: string;
  lyrics?: string;
  /** Whether this is the currently active/playing jingle */
  isActive?: boolean;
}



