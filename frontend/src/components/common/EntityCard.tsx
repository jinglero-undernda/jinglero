import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { normalizeTimestampToSeconds } from '../../lib/utils/timestamp';
import '../../styles/components/entity-card.css';

export type EntityType = 'artista' | 'cancion' | 'fabrica' | 'jingle' | 'tematica';

export type Entity = Artista | Cancion | Fabrica | Jingle | Tematica;

export interface EntityCardProps {
  /** The entity to display */
  entity: Entity;
  /** Type of entity to determine rendering logic */
  entityType: EntityType;
  /** Display variant: 'heading' for title rows, 'contents' for content rows */
  variant?: 'heading' | 'contents' | 'card' | 'row'; // 'card' and 'row' are deprecated
  /** Optional route destination (if provided, card becomes clickable link) */
  to?: string;
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
  /** Optional relationship label for context-dependent icons (e.g., "Jinglero", "Autor" for Artista) */
  relationshipLabel?: string;
  /** Indentation level for table rows (0 = no indent, 1 = 16px, 2 = 32px, etc.) */
  indentationLevel?: number;
  /** Optional relationship data for enhanced field display (e.g., autores for Cancion, fabrica for Jingle) */
  relationshipData?: Record<string, unknown>;
  /** Whether to show admin edit button (only for heading variant in admin mode) */
  showAdminEditButton?: boolean;
  /** Whether currently in editing mode */
  isEditing?: boolean;
  /** Callback when edit button is clicked */
  onEditClick?: () => void;
  /** Whether to show admin navigation button (only in admin mode) */
  showAdminNavButton?: boolean;
  /** Callback when admin navigation button is clicked */
  onAdminNavClick?: () => void;
  /** Admin route for navigation (e.g., /admin/c/{id}) */
  adminRoute?: string;
}

/**
 * Formats date string or Neo4j DateTime object to readable format (YYYY-MM-DD to DD/MM/YYYY or similar)
 */
function formatDate(dateInput: string | Date | any): string {
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
function getEntityRoute(entityType: EntityType, entityId: string, variant: 'heading' | 'contents' = 'contents'): string {
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
function getEntityIcon(
  entityType: EntityType,
  variant?: 'heading' | 'contents',
  relationshipLabel?: string
): string {
  // Context-dependent Artista icons
  if (entityType === 'artista') {
    if (variant === 'contents' && relationshipLabel === 'Jinglero') {
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
function getPrimaryText(
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
function getSecondaryText(
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
 * Supports 'heading' and 'contents' variants for table structure.
 * 
 * @example
 * ```tsx
 * // Heading variant (for title rows)
 * <EntityCard
 *   entity={jingle}
 *   entityType="jingle"
 *   variant="heading"
 * />
 * 
 * // Contents variant (for content rows, default)
 * <EntityCard
 *   entity={fabrica}
 *   entityType="fabrica"
 *   variant="contents"
 *   hasNestedEntities={true}
 *   isExpanded={expandedIds.has(fabrica.id)}
 *   onToggleExpand={() => handleToggle(fabrica.id)}
 * />
 * ```
 */
function EntityCard({
  entity,
  entityType,
  variant = 'contents',
  to,
  badge,
  className = '',
  onClick,
  hasNestedEntities = false,
  isExpanded = false,
  onToggleExpand,
  relationshipLabel,
  indentationLevel = 0,
  relationshipData,
  showAdminEditButton = false,
  isEditing = false,
  onEditClick,
  showAdminNavButton = false,
  onAdminNavClick,
  adminRoute: _adminRoute,
}: EntityCardProps) {
  const navigate = useNavigate();
  // Handle deprecated variants with warnings
  let actualVariant: 'heading' | 'contents' = variant as 'heading' | 'contents';
  if (variant === 'card' || variant === 'row') {
    console.warn(`EntityCard: variant="${variant}" is deprecated. Use "contents" instead.`);
    actualVariant = 'contents';
  }

  const primaryText = getPrimaryText(entity, entityType, relationshipData);
  const secondaryText = getSecondaryText(entity, entityType, relationshipData);
  const icon = getEntityIcon(entityType, actualVariant, relationshipLabel);
  const defaultBadges = getEntityBadges(entity, entityType);
  // Don't make it a link if admin edit button is shown (we're already on the entity page)
  const route = showAdminEditButton ? undefined : (to || (onClick ? undefined : getEntityRoute(entityType, entity.id, actualVariant)));

  // Handle expand/collapse icon click
  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  // Special show button for Fabrica entities (links to /show/{id})
  // For Jingle entities, links to /show/{fabrica-id}?t={timestamp-in-seconds}
  // Use button with navigate to avoid nested <a> tags when card is a Link
  const showButton = (() => {
    const handleShowClick = (e: React.MouseEvent, targetPath: string) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(targetPath);
    };

    if (entityType === 'fabrica') {
      const targetPath = `/show/${entity.id}`;
      return (
        <button
          type="button"
          className="entity-card__show-button"
          onClick={(e) => handleShowClick(e, targetPath)}
          aria-label={`Ver ${primaryText} en página de visualización`}
          title="Ver en página de visualización"
        >
          🎬
        </button>
      );
    }
    
    if (entityType === 'jingle') {
      const jingle = entity as Jingle;
      const fabrica = relationshipData?.fabrica as { id?: string } | undefined;
      
      // Only show button if we have fabrica ID and timestamp
      if (fabrica?.id && jingle.timestamp) {
        const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
        if (timestampSeconds !== null) {
          const targetPath = `/show/${fabrica.id}?t=${timestampSeconds}`;
          return (
            <button
              type="button"
              className="entity-card__show-button"
              onClick={(e) => handleShowClick(e, targetPath)}
              aria-label={`Ver ${primaryText} en página de visualización a las ${jingle.timestamp}`}
              title={`Ver en página de visualización a las ${jingle.timestamp}`}
            >
              🎬
            </button>
          );
        }
      }
    }
    
    return null;
  })();

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

  // Admin edit button (only for heading variant in admin mode)
  const adminEditButton = showAdminEditButton && actualVariant === 'heading' && onEditClick ? (
    <button
      type="button"
      className="entity-card__edit-button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEditClick();
      }}
      aria-label={isEditing ? 'Cancelar edición' : 'Editar'}
      title={isEditing ? 'Cancelar edición' : 'Editar'}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: isEditing ? '#666' : '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isEditing ? '#555' : '#1565c0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isEditing ? '#666' : '#1976d2';
      }}
    >
      {isEditing ? 'Cancelar' : 'Editar'}
    </button>
  ) : null;

  // Admin navigation button (only in admin mode for contents variant)
  const adminNavButton = showAdminNavButton && actualVariant === 'contents' && onAdminNavClick ? (
    <button
      type="button"
      className="entity-card__admin-nav-button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdminNavClick();
      }}
      aria-label={`Editar ${primaryText} en modo administrador`}
      title={`Editar ${primaryText} en modo administrador`}
      style={{
        padding: '0.25rem 0.5rem',
        backgroundColor: '#2a2a2a',
        color: '#fff',
        border: '1px solid #444',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        lineHeight: '1',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#3a3a3a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#2a2a2a';
      }}
    >
      🔧
    </button>
  ) : null;

  // Both heading and contents use the same horizontal compact layout
  const cardContent = (
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
      {(showButton || expandIcon || adminEditButton || adminNavButton) && (
        <div className="entity-card__actions-container">
          {showButton}
          {expandIcon}
          {adminEditButton}
          {adminNavButton}
        </div>
      )}
    </>
  );

  const cardClasses = [
    'entity-card',
    `entity-card--${actualVariant}`,
    className,
  ].filter(Boolean).join(' ');

  const ariaLabel = `${entityType}: ${primaryText}${secondaryText ? `, ${secondaryText}` : ''}`;

  // Calculate indentation styling
  const indentationStyle = {
    paddingLeft: `calc(var(--indent-base, 16px) * ${indentationLevel})`,
  };

  // Render as Link if route is provided
  if (route && !onClick) {
    return (
      <Link
        to={route}
        className={cardClasses}
        style={indentationStyle}
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
        style={indentationStyle}
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
    <div className={cardClasses} style={indentationStyle} aria-label={ariaLabel} role="article">
      {cardContent}
    </div>
  );
}

// Task 25: Add React.memo to EntityCard component
// Using default shallow comparison - EntityCard props are mostly primitives and stable references
export default React.memo(EntityCard);

