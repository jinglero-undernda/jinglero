import React from 'react';
import { Link } from 'react-router-dom';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import '../../styles/components/entity-card.css';

export type EntityType = 'artista' | 'cancion' | 'fabrica' | 'jingle' | 'tematica';

export type Entity = Artista | Cancion | Fabrica | Jingle | Tematica;

export interface EntityCardProps {
  /** The entity to display */
  entity: Entity;
  /** Type of entity to determine rendering logic */
  entityType: EntityType;
  /** Display variant: 'card' for card layout, 'row' for compact table row */
  variant?: 'card' | 'row';
  /** Optional route destination (if provided, card becomes clickable link) */
  to?: string;
  /** Whether the card is active/selected (highlighted state) */
  active?: boolean;
  /** Custom badge or status indicator */
  badge?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Optional click handler (alternative to 'to' prop) */
  onClick?: () => void;
  /** Whether this entity has nested/expandable entities */
  hasNestedEntities?: boolean;
  /** Current expanded state (if hasNestedEntities is true) */
  isExpanded?: boolean;
  /** Callback when expand/collapse icon is clicked */
  onToggleExpand?: () => void;
  /** Number of nested entities (for "Mostrar # entidades" display) */
  nestedCount?: number;
}

/**
 * Formats date string to readable format (YYYY-MM-DD to DD/MM/YYYY or similar)
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Gets the route path for an entity based on type and id
 */
function getEntityRoute(entityType: EntityType, entityId: string): string {
  const routeMap: Record<EntityType, string> = {
    fabrica: `/show/${entityId}`,
    jingle: `/j/${entityId}`,
    cancion: `/c/${entityId}`,
    artista: `/a/${entityId}`,
    tematica: `/t/${entityId}`,
  };
  return routeMap[entityType];
}

/**
 * Gets entity icon (emoji for MVP)
 */
function getEntityIcon(entityType: EntityType): string {
  const iconMap: Record<EntityType, string> = {
    fabrica: '🏭',
    jingle: '🎵',
    cancion: '🎶',
    artista: '👤',
    tematica: '🏷️',
  };
  return iconMap[entityType];
}

/**
 * Gets primary display text for entity
 */
function getPrimaryText(entity: Entity, entityType: EntityType): string {
  switch (entityType) {
    case 'fabrica': {
      const fabrica = entity as Fabrica;
      return fabrica.title || fabrica.id;
    }
    case 'jingle': {
      const jingle = entity as Jingle;
      return jingle.title || jingle.id;
    }
    case 'cancion': {
      const cancion = entity as Cancion;
      // For cancion, we might want to show "Title (Artist)" format later
      // For now, just show title
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
      return (entity as any).id || 'A CONFIRMAR';
  }
}

/**
 * Gets secondary metadata text for entity
 */
function getSecondaryText(entity: Entity, entityType: EntityType): string | null {
  switch (entityType) {
    case 'fabrica': {
      const fabrica = entity as Fabrica;
      if (fabrica.date) {
        return formatDate(fabrica.date);
      }
      return null;
    }
    case 'jingle': {
      // For jingle, we'd ideally show fabrica.date or "INEDITO"
      // But we don't have fabrica relationship in the Jingle type itself
      // This will be handled by badge/relationship data when available
      return null;
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
 * Gets badges for entity (e.g., JINGLAZO, PRECARIO for Jingle)
 */
function getEntityBadges(entity: Entity, entityType: EntityType): React.ReactNode[] {
  const badges: React.ReactNode[] = [];
  
  if (entityType === 'jingle') {
    const jingle = entity as Jingle;
    if (jingle.isJinglazo) {
      badges.push(
        <span key="jinglazo" className="entity-badge entity-badge--jinglazo">
          JINGLAZO
        </span>
      );
    }
    if (jingle.isPrecario) {
      badges.push(
        <span key="precario" className="entity-badge entity-badge--precario">
          PRECARIO
        </span>
      );
    }
  }
  
  return badges;
}

/**
 * EntityCard Component
 * 
 * Displays a compact, navigable card for any entity type.
 * Used in lists, search results, and related-entities displays.
 * Supports both 'card' and 'row' variants for different contexts.
 * 
 * @example
 * ```tsx
 * // Card variant (default)
 * <EntityCard
 *   entity={jingle}
 *   entityType="jingle"
 *   to={`/j/${jingle.id}`}
 *   active={activeJingleId === jingle.id}
 * />
 * 
 * // Row variant for nested tables
 * <EntityCard
 *   entity={fabrica}
 *   entityType="fabrica"
 *   variant="row"
 *   hasNestedEntities={true}
 *   isExpanded={expandedIds.has(fabrica.id)}
 *   onToggleExpand={() => handleToggle(fabrica.id)}
 * />
 * ```
 */
function EntityCard({
  entity,
  entityType,
  variant = 'card',
  to,
  active = false,
  badge,
  className = '',
  onClick,
  hasNestedEntities = false,
  isExpanded = false,
  onToggleExpand,
  nestedCount: _nestedCount,
}: EntityCardProps) {
  const primaryText = getPrimaryText(entity, entityType);
  const secondaryText = getSecondaryText(entity, entityType);
  const icon = getEntityIcon(entityType);
  const defaultBadges = getEntityBadges(entity, entityType);
  const route = to || (onClick ? undefined : getEntityRoute(entityType, entity.id));

  // Handle expand/collapse icon click
  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  // Expand/collapse icon
  const expandIcon = hasNestedEntities ? (
    <button
      className="entity-card__expand-icon"
      onClick={handleExpandClick}
      aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
      title={isExpanded ? 'Colapsar' : 'Expandir'}
      type="button"
    >
      {isExpanded ? '▲' : '▼'}
    </button>
  ) : null;

  const cardContent = variant === 'row' ? (
    // Row variant: compact horizontal layout for table rows
    <>
      <div className="entity-card__icon">{icon}</div>
      <div className="entity-card__content entity-card__content--row">
        <div className="entity-card__primary-row">
          <span className="entity-card__primary">{primaryText || 'A CONFIRMAR'}</span>
          {secondaryText && (
            <span className="entity-card__secondary-inline">{secondaryText}</span>
          )}
          {(defaultBadges.length > 0 || badge) && (
            <div className="entity-card__badges entity-card__badges--inline">
              {defaultBadges}
              {badge}
            </div>
          )}
        </div>
      </div>
      {expandIcon && (
        <div className="entity-card__expand-container">
          {expandIcon}
        </div>
      )}
    </>
  ) : (
    // Card variant: vertical layout with icon, primary, secondary, badges
    <>
      <div className="entity-card__icon">{icon}</div>
      <div className="entity-card__content">
        <div className="entity-card__primary">
          {primaryText || 'A CONFIRMAR'}
          {expandIcon && (
            <span className="entity-card__expand-icon-inline">{expandIcon}</span>
          )}
        </div>
        {secondaryText && (
          <div className="entity-card__secondary">{secondaryText}</div>
        )}
        {(defaultBadges.length > 0 || badge) && (
          <div className="entity-card__badges">
            {defaultBadges}
            {badge}
          </div>
        )}
      </div>
    </>
  );

  const cardClasses = [
    'entity-card',
    `entity-card--${variant}`,
    active ? 'entity-card--active' : '',
    className,
  ].filter(Boolean).join(' ');

  const ariaLabel = `${entityType}: ${primaryText}${secondaryText ? `, ${secondaryText}` : ''}`;

  // Render as Link if route is provided
  if (route && !onClick) {
    return (
      <Link
        to={route}
        className={cardClasses}
        aria-label={ariaLabel}
        role="article"
      >
        {cardContent}
      </Link>
    );
  }

  // Render as clickable div if onClick is provided
  if (onClick) {
    return (
      <div
        className={cardClasses}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={ariaLabel}
        role="button"
        tabIndex={0}
      >
        {cardContent}
      </div>
    );
  }

  // Render as non-clickable div
  return (
    <div className={cardClasses} aria-label={ariaLabel} role="article">
      {cardContent}
    </div>
  );
}

// Task 25: Add React.memo to EntityCard component
// Using default shallow comparison - EntityCard props are mostly primitives and stable references
export default React.memo(EntityCard);

