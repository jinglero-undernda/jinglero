import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Jingle } from '../../types';
import { normalizeTimestampToSeconds } from '../../lib/utils/timestamp';
import { 
  getEntityIcon, 
  getEntityRoute, 
  getPrimaryText, 
  getSecondaryText,
  type EntityType,
  type Entity
} from '../../lib/utils/entityDisplay';
import '../../styles/components/entity-card.css';

export type { EntityType, Entity };

export interface EntityCardProps {
  /** The entity to display */
  entity: Entity;
  /** Type of entity to determine rendering logic */
  entityType: EntityType;
  /** Display variant: 'heading' for title rows, 'contents' for content rows, 'placeholder' for empty state */
  variant?: 'heading' | 'contents' | 'placeholder' | 'card' | 'row'; // 'card' and 'row' are deprecated
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
  /** Message to display in placeholder variant */
  placeholderMessage?: string;
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
  /** Callback when save button is clicked (only for heading variant) */
  onSaveClick?: () => void;
  /** Whether there are unsaved changes (enables/disables save button) */
  hasUnsavedChanges?: boolean;
  /** Whether to show admin navigation button (only in admin mode) */
  showAdminNavButton?: boolean;
  /** Callback when admin navigation button is clicked */
  onAdminNavClick?: () => void;
  /** Admin route for navigation (e.g., /admin/c/{id}) */
  adminRoute?: string;
  /** Phase 6: Whether to show delete button (only in admin edit mode for contents variant) */
  showDeleteButton?: boolean;
  /** Phase 6: Callback when delete button is clicked */
  onDeleteClick?: () => void;
}

/**
 * Gets badges for entity (e.g., JINGLAZO, PRECARIO for Jingle)
 * For contents variant, shows autoComment and all boolean props for Jingles
 */
function getEntityBadges(entity: Entity, entityType: EntityType, variant?: 'heading' | 'contents' | 'placeholder'): React.ReactNode[] {
  const badges: React.ReactNode[] = [];
  
  if (entityType === 'jingle') {
    const jingle = entity as Jingle;
    
    // For contents variant, show all boolean props
    // Note: autoComment is now shown in secondary text (not as badge) for better word wrapping
    if (variant === 'contents') {
      // Show boolean props as badges
      if (jingle.isJinglazo) {
        badges.push(
          <span key="jinglazo" className="entity-badge entity-badge--jinglazo">
            JINGLAZO
          </span>
        );
      }
      if (jingle.isJinglazoDelDia) {
        badges.push(
          <span key="jdd" className="entity-badge entity-badge--jdd">
            JDD
          </span>
        );
      }
      if (jingle.isPrecario) {
        badges.push(
          <span key="precario" className="entity-badge entity-badge--precario">
            PREC
          </span>
        );
      }
      if (jingle.isLive) {
        badges.push(
          <span key="live" className="entity-badge entity-badge--live">
            VIVO
          </span>
        );
      }
      if (jingle.isRepeat) {
        badges.push(
          <span key="repeat" className="entity-badge entity-badge--repeat">
            CLASICO
          </span>
        );
      }
    } else {
      // For heading variant, show only isJinglazo and isPrecario (backward compatibility)
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
  placeholderMessage,
  indentationLevel = 0,
  relationshipData,
  showAdminEditButton = false,
  isEditing = false,
  onEditClick,
  onSaveClick,
  hasUnsavedChanges = false,
  showAdminNavButton = false,
  onAdminNavClick,
  adminRoute: _adminRoute, // eslint-disable-line @typescript-eslint/no-unused-vars
  showDeleteButton = false,
  onDeleteClick,
}: EntityCardProps) {
  const navigate = useNavigate();
  // Handle deprecated variants with warnings
  let actualVariant: 'heading' | 'contents' | 'placeholder' = variant as 'heading' | 'contents' | 'placeholder';
  if (variant === 'card' || variant === 'row') {
    console.warn(`EntityCard: variant="${variant}" is deprecated. Use "contents" instead.`);
    actualVariant = 'contents';
  }

  // Use pre-computed display properties if available, otherwise fall back to runtime computation
  // Properly handle emoji characters (which can be multi-byte) when extracting icon and text
  let primaryText: string;
  let icon: string;
  
  if (entity.displayPrimary) {
    // Use Array.from() to properly handle emoji characters (multi-byte Unicode)
    const displayPrimaryChars = Array.from(entity.displayPrimary);
    icon = displayPrimaryChars[0] || getEntityIcon(entityType, actualVariant, relationshipLabel, entity, relationshipData);
    // Remove the first character (icon) from the text
    primaryText = displayPrimaryChars.slice(1).join('') || getPrimaryText(entity, entityType, relationshipData, actualVariant);
  } else {
    primaryText = getPrimaryText(entity, entityType, relationshipData, actualVariant);
    icon = getEntityIcon(entityType, actualVariant, relationshipLabel, entity, relationshipData);
  }
  
  const secondaryText = entity.displaySecondary !== undefined
    ? entity.displaySecondary
    : getSecondaryText(entity, entityType, relationshipData, actualVariant);
  
  // Use pre-computed badges if available, otherwise compute
  const defaultBadges = entity.displayBadges && entity.displayBadges.length > 0
    ? entity.displayBadges.map((badge, index) => {
        // Map badge strings to React elements with appropriate classes
        const badgeClassMap: Record<string, string> = {
          'JINGLAZO': 'entity-badge--jinglazo',
          'PRECARIO': 'entity-badge--precario',
          'JDD': 'entity-badge--jdd',
          'VIVO': 'entity-badge--live',
          'CLASICO': 'entity-badge--repeat',
          'ARG': 'entity-badge--arg',
          'PRIMARY': 'entity-badge--primary',
        };
        const className = badgeClassMap[badge] || 'entity-badge';
        return (
          <span key={index} className={`entity-badge ${className}`}>
            {badge}
          </span>
        );
      })
    : getEntityBadges(entity, entityType, actualVariant);
  // Don't make it a link if admin edit button is shown (we're already on the entity page)
  // For route, use 'contents' for placeholder variant since getEntityRoute doesn't accept placeholder
  const routeVariant = actualVariant === 'placeholder' ? 'contents' : actualVariant;
  const route = showAdminEditButton ? undefined : (to || (onClick ? undefined : getEntityRoute(entityType, entity.id, routeVariant)));

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

  // Admin edit/save/cancel buttons (only for heading variant in admin mode)
  // Phase 1: Consolidate all save/cancel controls to EntityCard heading
  const adminEditButton = showAdminEditButton && actualVariant === 'heading' && onEditClick ? (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {!isEditing ? (
        // View mode: Show Editar button
        <button
          type="button"
          className="entity-card__edit-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEditClick();
          }}
          aria-label="Editar"
          title="Editar"
        >
          Editar
        </button>
      ) : (
        // Edit mode: Show Guardar, Cancelar, and disabled Borrar
        <>
          <button
            type="button"
            className="entity-card__save-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSaveClick && hasUnsavedChanges) {
                onSaveClick();
              }
            }}
            disabled={!hasUnsavedChanges}
            aria-label="Guardar cambios"
            title={hasUnsavedChanges ? "Guardar cambios" : "No hay cambios para guardar"}
          >
            Guardar
          </button>
          <button
            type="button"
            className="entity-card__cancel-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditClick();
            }}
            aria-label="Cancelar edición"
            title="Cancelar edición"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="entity-card__delete-button"
            disabled={true}
            aria-label="Borrar entidad (no disponible)"
            title="Borrar entidad (funcionalidad pendiente)"
          >
            Borrar
          </button>
        </>
      )}
    </div>
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
    >
      🔧
    </button>
  ) : null;

  // Phase 6: Delete button (only in admin edit mode for contents variant)
  const deleteButton = showDeleteButton && actualVariant === 'contents' && onDeleteClick ? (
    <button
      type="button"
      className="entity-card__delete-relationship-button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDeleteClick();
      }}
      aria-label={`Eliminar relación con ${primaryText}`}
      title={`Eliminar relación con ${primaryText}`}
    >
      ×
    </button>
  ) : null;

  // Calculate indentation styling
  const indentationStyle = {
    paddingLeft: `calc(var(--indent-base, 16px) * ${indentationLevel})`,
  };

  // Phase 2: Placeholder variant for empty relationships
  if (actualVariant === 'placeholder') {
    // Helper to get Spanish name for entity type
    const getEntityTypeName = (type: EntityType, relLabel?: string): string => {
      // Special case: Jinglero uses singular form
      if (relLabel === 'Jinglero') {
        return 'Jinglero';
      }
      
      const typeMap: Record<EntityType, string> = {
        fabrica: 'Fábricas',
        jingle: 'Jingles',
        cancion: 'Canciones',
        artista: 'Artistas',
        tematica: 'Temáticas',
      };
      return typeMap[type] || 'elementos';
    };
    
    const entityTypeName = getEntityTypeName(entityType, relationshipLabel);
    // Use singular form for Jinglero
    const isSingular = relationshipLabel === 'Jinglero';
    const message = placeholderMessage || `No hay ${entityTypeName} ${isSingular ? 'asociado' : 'asociadas'}. Edita para agregarlos`;
    return (
      <div 
        className={`entity-card entity-card--placeholder ${className}`}
        style={indentationStyle}
        role="status"
        aria-label={message}
      >
        <div className="entity-card__icon" style={{ opacity: 0.5 }}>{icon}</div>
        <div className="entity-card__content">
          <span>{message}</span>
        </div>
      </div>
    );
  }

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
      {(showButton || expandIcon || adminEditButton || adminNavButton || deleteButton) && (
        <div className="entity-card__actions-container">
          {showButton}
          {expandIcon}
          {adminEditButton}
          {deleteButton}
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

