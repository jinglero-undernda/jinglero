/**
 * Entity Display Utilities
 * 
 * Shared utility functions for displaying entity information consistently
 * across the application (EntityCard, EntitySearchAutocomplete, etc.)
 */

import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';

export type EntityType = 'artista' | 'cancion' | 'fabrica' | 'jingle' | 'tematica';
export type Entity = Artista | Cancion | Fabrica | Jingle | Tematica;

/**
 * Formats date string or Neo4j DateTime object to readable format (YYYY-MM-DD to DD/MM/YYYY or similar)
 */
export function formatDate(dateInput: string | Date | any): string {
  try {
    // Handle Neo4j DateTime object
    if (dateInput && typeof dateInput === 'object' && 'year' in dateInput) {
      const year = typeof dateInput.year === 'object' ? dateInput.year.low : dateInput.year;
      const month = typeof dateInput.month === 'object' ? dateInput.month.low : dateInput.month;
      const day = typeof dateInput.day === 'object' ? dateInput.day.low : dateInput.day;
      const hour = typeof dateInput.hour === 'object' ? (dateInput.hour?.low || 0) : (dateInput.hour || 0);
      const minute = typeof dateInput.minute === 'object' ? (dateInput.minute?.low || 0) : (dateInput.minute || 0);
      const second = typeof dateInput.second === 'object' ? (dateInput.second?.low || 0) : (dateInput.second || 0);
      
      const date = new Date(year, month - 1, day, hour, minute, second);
      if (isNaN(date.getTime())) return String(dateInput);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
    
    // Handle string or Date object
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Gets the route path for an entity based on type and id
 * For Fabrica, content rows use /f/{id}, heading rows use /show/{id}
 */
export function getEntityRoute(entityType: EntityType, entityId: string, variant: 'heading' | 'contents' = 'contents'): string {
  const routeMap: Record<EntityType, string> = {
    fabrica: variant === 'contents' ? `/f/${entityId}` : `/show/${entityId}`,
    jingle: `/j/${entityId}`,
    cancion: `/c/${entityId}`,
    artista: `/a/${entityId}`,
    tematica: `/t/${entityId}`,
  };
  return routeMap[entityType];
}

/**
 * Gets entity icon (emoji for MVP)
 * Context-dependent for Artista based on variant and relationship label
 */
export function getEntityIcon(
  entityType: EntityType,
  variant?: 'heading' | 'contents' | 'placeholder',
  relationshipLabel?: string
): string {
  // Context-dependent Artista icons
  if (entityType === 'artista') {
    if ((variant === 'contents' || variant === 'placeholder') && relationshipLabel === 'Jinglero') {
      return '🔧';
    }
    if (variant === 'contents' && relationshipLabel === 'Autor') {
      return '🚚';
    }
    // Default: heading or no context
    return '👤';
  }

  // Standard icons
  const iconMap: Record<Exclude<EntityType, 'artista'>, string> = {
    fabrica: '🏭',
    jingle: '🎤',
    cancion: '📦',
    tematica: '🏷️',
  };
  return iconMap[entityType];
}

/**
 * Gets primary display text for entity
 */
export function getPrimaryText(
  entity: Entity,
  entityType: EntityType,
  relationshipData?: Record<string, unknown>
): string {
  switch (entityType) {
    case 'fabrica': {
      const fabrica = entity as Fabrica;
      return fabrica.title || fabrica.id;
    }
    case 'jingle': {
      const jingle = entity as Jingle;
      // If title is null/undefined, fall back to songTitle, then id
      return jingle.title || jingle.songTitle || jingle.id;
    }
    case 'cancion': {
      const cancion = entity as Cancion;
      // Format as "Titulo (Autor1, Autor2)" when autor data available
      if (relationshipData?.autores && Array.isArray(relationshipData.autores) && relationshipData.autores.length > 0) {
        const autorNames = relationshipData.autores
          .map((a: Artista) => a.stageName || a.name)
          .filter(Boolean)
          .join(', ');
        if (autorNames) {
          return `${cancion.title || cancion.id} (${autorNames})`;
        }
      }
      return cancion.title || cancion.id;
    }
    case 'artista': {
      const artista = entity as Artista;
      return artista.stageName || artista.name || artista.id;
    }
    case 'tematica': {
      const tematica = entity as Tematica;
      return tematica.name || tematica.id;
    }
    default:
      return ((entity as { id?: string }).id) || 'A CONFIRMAR';
  }
}

/**
 * Gets secondary metadata text for entity
 */
export function getSecondaryText(
  entity: Entity,
  entityType: EntityType,
  relationshipData?: Record<string, unknown>
): string | null {
  switch (entityType) {
    case 'fabrica': {
      const fabrica = entity as Fabrica;
      if (fabrica.date) {
        return formatDate(fabrica.date);
      }
      return null;
    }
    case 'jingle': {
      // Show fabricaDate (denormalized) or use parent Fabrica's date if available
      const jingle = entity as Jingle;
      if (jingle.fabricaDate) {
        return formatDate(jingle.fabricaDate);
      }
      // If no fabricaDate but we have a parent Fabrica in relationshipData, use its date
      if (relationshipData?.fabrica) {
        const fabrica = relationshipData.fabrica as Fabrica;
        if (fabrica.date) {
          return formatDate(fabrica.date);
        }
      }
      return 'INEDITO';
    }
    case 'cancion': {
      const cancion = entity as Cancion;
      const parts: string[] = [];
      if (cancion.album) parts.push(cancion.album);
      if (cancion.year) parts.push(String(cancion.year));
      return parts.length > 0 ? parts.join(' • ') : null;
    }
    case 'artista': {
      const artista = entity as Artista;
      const parts: string[] = [];
      if (artista.name && artista.name !== artista.stageName) {
        parts.push(artista.name);
      }
      if (artista.nationality) {
        parts.push(artista.nationality);
      }
      return parts.length > 0 ? parts.join(' • ') : null;
    }
    case 'tematica': {
      const tematica = entity as Tematica;
      return tematica.category || null;
    }
    default:
      return null;
  }
}

/**
 * Gets the admin route path for an entity based on type and id
 */
export function getEntityAdminRoute(entityType: EntityType, entityId: string): string {
  const routePrefixMap: Record<EntityType, string> = {
    fabrica: 'f',
    jingle: 'j',
    cancion: 'c',
    artista: 'a',
    tematica: 't',
  };
  return `/admin/${routePrefixMap[entityType]}/${entityId}`;
}

/**
 * Converts entity type to plural form for API calls
 */
export function getEntityTypePlural(entityType: EntityType): string {
  const pluralMap: Record<EntityType, string> = {
    fabrica: 'fabricas',
    jingle: 'jingles',
    cancion: 'canciones',
    artista: 'artistas',
    tematica: 'tematicas',
  };
  return pluralMap[entityType];
}

