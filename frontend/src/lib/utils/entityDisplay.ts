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
 * Context-dependent for Artista based on variant, relationship label, and relationship counts
 */
export function getEntityIcon(
  entityType: EntityType,
  variant?: 'heading' | 'contents' | 'placeholder',
  relationshipLabel?: string,
  entity?: Entity,
  relationshipData?: Record<string, unknown>
): string {
  // Context-dependent Artista icons
  if (entityType === 'artista') {
    // For contents variant, determine icon based on AUTOR_DE and JINGLERO_DE relationships
    if (variant === 'contents' && entity) {
      // Get relationship counts from relationshipData if available
      const autorCount = (relationshipData?.autorCount as number) || 0;
      const jingleroCount = (relationshipData?.jingleroCount as number) || 0;
      
      // If we have relationship counts, use them to determine icon
      if (autorCount > 0 || jingleroCount > 0) {
        const hasAutor = autorCount > 0;
        const hasJinglero = jingleroCount > 0;
        
        if (hasAutor && !hasJinglero) {
          return '🚚'; // Has AUTOR_DE but no JINGLERO_DE
        }
        if (hasJinglero && !hasAutor) {
          return '🔧'; // Has JINGLERO_DE but no AUTOR_DE
        }
        // Both or neither: use default
        return '👤';
      }
      
      // Fallback to relationshipLabel-based logic for backward compatibility
      if (relationshipLabel === 'Jinglero') {
        return '🔧';
      }
      if (relationshipLabel === 'Autor') {
        return '🚚';
      }
    }
    
    // For placeholder variant, use relationshipLabel if available
    if (variant === 'placeholder' && relationshipLabel === 'Jinglero') {
      return '🔧';
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
  relationshipData?: Record<string, unknown>,
  variant?: 'heading' | 'contents' | 'placeholder'
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
      // For contents variant, show just title (autores will be in secondary)
      if (variant === 'contents') {
        return cancion.title || cancion.id;
      }
      // For heading variant, format as "Titulo (Autor1, Autor2)" when autor data available
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
      // For contents variant, show stageName as primary, or Name if stageName is empty
      if (variant === 'contents') {
        return artista.stageName || artista.name || artista.id;
      }
      // For heading variant, use existing logic
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
  relationshipData?: Record<string, unknown>,
  variant?: 'heading' | 'contents' | 'placeholder'
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
      const parts: string[] = [];
      
      // Add Fabrica date
      if (jingle.fabricaDate) {
        parts.push(formatDate(jingle.fabricaDate));
      } else if (relationshipData?.fabrica) {
        const fabrica = relationshipData.fabrica as Fabrica;
        if (fabrica.date) {
          parts.push(formatDate(fabrica.date));
        }
      } else {
        parts.push('INEDITO');
      }
      
      // For contents variant, append autoComment (with title removed) to secondary text
      if (variant === 'contents' && jingle.autoComment) {
        // Remove the redundant "🎤: {title}" part from autoComment
        // Format: "🏭: DD/MM/YYYY - HH:MM:SS:, 🎤: Title, 📦: Cancion, ..."
        // We want to remove the "🎤: Title" part (including comma before/after if present)
        let trimmedComment = jingle.autoComment;
        
        // Remove the title part: ", 🎤: {title}" or "🎤: {title}," or "🎤: {title}"
        // Match pattern: optional comma+space before, 🎤: followed by title text (until comma or end), optional comma after
        // Title text is anything that's not a comma or one of the emoji prefixes (📦🚚🏷️🔧)
        const titlePattern = /(?:,\s*)?🎤:\s*[^,📦🚚🏷️🔧]+(?:\s*,)?/;
        trimmedComment = trimmedComment.replace(titlePattern, '');
        
        // Clean up any double commas, leading/trailing commas/spaces
        trimmedComment = trimmedComment
          .replace(/,\s*,/g, ',')  // Remove double commas
          .replace(/^,\s*/, '')     // Remove leading comma
          .replace(/\s*,\s*$/, '')  // Remove trailing comma
          .trim();
        
        if (trimmedComment) {
          parts.push(trimmedComment);
        }
      }
      
      return parts.length > 0 ? parts.join(' • ') : null;
    }
    case 'cancion': {
      const cancion = entity as Cancion;
      const parts: string[] = [];
      
      // Existing secondary properties
      if (cancion.album) parts.push(cancion.album);
      if (cancion.year) parts.push(String(cancion.year));
      
      // For contents variant, add autor and jingle count
      if (variant === 'contents') {
        // Get autor name(s) from relationshipData
        if (relationshipData?.autores && Array.isArray(relationshipData.autores) && relationshipData.autores.length > 0) {
          const autorNames = relationshipData.autores
            .map((a: Artista) => a.stageName || a.name)
            .filter(Boolean)
            .join(', ');
          if (autorNames) {
            parts.push(`🚚: ${autorNames}`);
          }
        }
        
        // Get jingle count from relationshipData
        const jingleCount = (relationshipData?.jingleCount as number) || 0;
        if (jingleCount > 0) {
          parts.push(`🎤: ${jingleCount}`);
        }
      }
      
      return parts.length > 0 ? parts.join(' • ') : null;
    }
    case 'artista': {
      const artista = entity as Artista;
      const parts: string[] = [];
      
      // For contents variant, show Name as secondary if different from stageName
      if (variant === 'contents') {
        if (artista.name && artista.name !== artista.stageName) {
          parts.push(artista.name);
        }
        
        // Add ARG tag if isArg is true
        if (artista.isArg) {
          parts.push('ARG');
        }
        
        // Add relationship counts
        const autorCount = (relationshipData?.autorCount as number) || 0;
        const jingleroCount = (relationshipData?.jingleroCount as number) || 0;
        
        if (autorCount > 0) {
          parts.push(`📦: ${autorCount}`);
        }
        if (jingleroCount > 0) {
          parts.push(`🎤: ${jingleroCount}`);
        }
      } else {
        // For heading variant, use existing logic
        if (artista.name && artista.name !== artista.stageName) {
          parts.push(artista.name);
        }
        if (artista.nationality) {
          parts.push(artista.nationality);
        }
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

