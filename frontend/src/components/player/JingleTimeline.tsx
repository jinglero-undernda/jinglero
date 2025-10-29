import { useState, useEffect } from 'react';
import { formatSecondsToTimestamp, normalizeTimestampToSeconds } from '../../lib/utils/timestamp';

/**
 * Artista data (Jinglero or Autor)
 */
export interface JingleArtista {
  id: string;
  name?: string;
  stageName?: string;
}

/**
 * Cancion data
 */
export interface JingleCancion {
  id: string;
  title: string;
}

/**
 * Jingle timeline item with all relationship data
 */
export interface JingleTimelineItem {
  id: string;
  timestamp: string | number; // Can be string (HH:MM:SS) or number (seconds)
  title?: string;
  jingleros?: JingleArtista[] | JingleArtista | null;
  cancion?: JingleCancion | null;
  autores?: JingleArtista[] | JingleArtista | null;
  /** Whether this is the currently active/playing jingle */
  isActive?: boolean;
}

export interface JingleTimelineProps {
  /** List of jingles to display */
  jingles: JingleTimelineItem[];
  /** Currently active jingle ID (playing in video) */
  activeJingleId?: string | null;
  /** Callback when user clicks "Skip to" button */
  onSkipTo?: (jingle: JingleTimelineItem) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Formats jinglero name(s) for display
 */
function formatJingleros(jingleros: JingleArtista[] | JingleArtista | null | undefined): string {
  if (!jingleros) {
    return 'Anonimo';
  }

  const jingleroArray = Array.isArray(jingleros) ? jingleros : [jingleros];
  
  if (jingleroArray.length === 0) {
    return 'Anonimo';
  }

  return jingleroArray
    .map((j) => j.stageName || j.name || 'Anonimo')
    .filter(Boolean)
    .join(', ');
}

/**
 * Formats autor name(s) for display
 */
function formatAutores(autores: JingleArtista[] | JingleArtista | null | undefined): string {
  if (!autores) {
    return 'A CONFIRMAR';
  }

  const autorArray = Array.isArray(autores) ? autores : [autores];
  
  if (autorArray.length === 0) {
    return 'A CONFIRMAR';
  }

  return autorArray
    .map((a) => a.stageName || a.name || 'A CONFIRMAR')
    .filter(Boolean)
    .join(', ');
}

/**
 * Formats cancion title for display
 */
function formatCancion(cancion: JingleCancion | null | undefined): string {
  if (!cancion || !cancion.title) {
    return 'A CONFIRMAR';
  }
  return cancion.title;
}

/**
 * Gets the display title for a jingle
 * Priority: jingle.title > "Cancion (Autor)" > "A CONFIRMAR"
 */
function getJingleDisplayTitle(item: JingleTimelineItem): string {
  if (item.title) {
    return item.title;
  }

  const cancion = formatCancion(item.cancion);
  const autores = formatAutores(item.autores);

  if (cancion !== 'A CONFIRMAR' && autores !== 'A CONFIRMAR') {
    return `${cancion} (${autores})`;
  }

  return 'A CONFIRMAR';
}

/**
 * Jingle Timeline Component
 * 
 * Displays a horizontal list of jingles with their metadata.
 * Can be expanded to show full details for the active jingle.
 * 
 * @example
 * ```tsx
 * <JingleTimeline
 *   jingles={jingles}
 *   activeJingleId={currentJingleId}
 *   onSkipTo={(jingle) => seekTo(jingle.timestamp)}
 * />
 * ```
 */
export default function JingleTimeline({
  jingles,
  activeJingleId,
  onSkipTo,
  className,
}: JingleTimelineProps) {
  const [expandedJingleId, setExpandedJingleId] = useState<string | null>(null);

  // Auto-expand when a jingle becomes active
  useEffect(() => {
    if (activeJingleId) {
      setExpandedJingleId(activeJingleId);
    }
  }, [activeJingleId]);

  const expandedJingle = expandedJingleId
    ? jingles.find((j) => j.id === expandedJingleId)
    : null;

  const isExpanded = expandedJingle !== null;
  const isActiveExpanded = expandedJingle?.isActive || expandedJingle?.id === activeJingleId;
  const buttonsDisabled = isActiveExpanded;

  const handleSkipTo = (jingle: JingleTimelineItem) => {
    if (!buttonsDisabled && onSkipTo) {
      onSkipTo(jingle);
    }
  };

  const handleExpand = (jingleId: string) => {
    if (!buttonsDisabled) {
      setExpandedJingleId(jingleId === expandedJingleId ? null : jingleId);
    }
  };

  const handleCollapse = () => {
    if (!buttonsDisabled) {
      setExpandedJingleId(null);
    }
  };

  // Render expanded view (heading format)
  if (isExpanded && expandedJingle) {
    const timestampSeconds = normalizeTimestampToSeconds(expandedJingle.timestamp);
    const timestampFormatted = timestampSeconds !== null
      ? formatSecondsToTimestamp(timestampSeconds)
      : String(expandedJingle.timestamp);
    const displayTitle = getJingleDisplayTitle(expandedJingle);

    const jingleros = Array.isArray(expandedJingle.jingleros)
      ? expandedJingle.jingleros
      : expandedJingle.jingleros
      ? [expandedJingle.jingleros]
      : [];
    
    const autores = Array.isArray(expandedJingle.autores)
      ? expandedJingle.autores
      : expandedJingle.autores
      ? [expandedJingle.autores]
      : [];

    return (
      <div className={className} style={{ 
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '12px',
        backgroundColor: isActiveExpanded ? '#f0f7ff' : '#fff',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ 
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#666',
              minWidth: '80px',
            }}>
              {timestampFormatted}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', flex: 1 }}>
              {displayTitle}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleSkipTo(expandedJingle)}
              disabled={buttonsDisabled}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: buttonsDisabled ? '#f0f0f0' : '#fff',
                cursor: buttonsDisabled ? 'not-allowed' : 'pointer',
                opacity: buttonsDisabled ? 0.6 : 1,
              }}
            >
              Saltar a
            </button>
            <button
              onClick={handleCollapse}
              disabled={buttonsDisabled}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: buttonsDisabled ? '#f0f0f0' : '#fff',
                cursor: buttonsDisabled ? 'not-allowed' : 'pointer',
                opacity: buttonsDisabled ? 0.6 : 1,
              }}
            >
              Colapsar
            </button>
          </div>
        </div>

        {/* Expanded metadata */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', fontSize: '14px' }}>
            <div style={{ color: '#666', fontWeight: '500' }}>Jinglero:</div>
            <div>
              {jingleros.length > 0 ? (
                jingleros.map((jinglero, idx) => (
                  <div key={jinglero.id || idx}>
                    {jinglero.stageName || jinglero.name || 'Anonimo'}
                  </div>
                ))
              ) : (
                <div>Anonimo</div>
              )}
            </div>

            <div style={{ color: '#666', fontWeight: '500' }}>Cancion:</div>
            <div>{formatCancion(expandedJingle.cancion)}</div>

            <div style={{ color: '#666', fontWeight: '500' }}>Autor:</div>
            <div>
              {autores.length > 0 ? (
                autores.map((autor, idx) => (
                  <div key={autor.id || idx}>
                    {autor.stageName || autor.name || 'A CONFIRMAR'}
                  </div>
                ))
              ) : (
                <div>A CONFIRMAR</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render collapsed view (horizontal container)
  return (
    <div className={className} style={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '100px 2fr 1.5fr 1.5fr 1.5fr auto',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#f8f8f8',
        borderBottom: '2px solid #ddd',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#666',
      }}>
        <div>Tiempo</div>
        <div>Jingle</div>
        <div>Jinglero</div>
        <div>Cancion</div>
        <div>Autor</div>
        <div style={{ width: '120px' }}></div>
      </div>

      {/* Jingle rows */}
      {jingles.map((jingle) => {
        const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
        const timestampFormatted = timestampSeconds !== null
          ? formatSecondsToTimestamp(timestampSeconds)
          : String(jingle.timestamp);
        
        const isActive = jingle.isActive || jingle.id === activeJingleId;
        const displayTitle = getJingleDisplayTitle(jingle);
        const jingleroText = formatJingleros(jingle.jingleros);
        const cancionText = formatCancion(jingle.cancion);
        const autorText = formatAutores(jingle.autores);

        return (
          <div
            key={jingle.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 2fr 1.5fr 1.5fr 1.5fr auto',
              gap: '8px',
              padding: '10px 12px',
              borderBottom: '1px solid #eee',
              backgroundColor: isActive ? '#f0f7ff' : '#fff',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            <div style={{ fontFamily: 'monospace', fontWeight: '500', color: '#666' }}>
              {timestampFormatted}
            </div>
            <div style={{ fontWeight: isActive ? '600' : '400' }}>
              {displayTitle}
            </div>
            <div style={{ color: '#555' }}>
              {jingleroText.split(', ').map((name, idx, arr) => (
                <div key={idx}>
                  {name}{idx < arr.length - 1 ? ',' : ''}
                </div>
              ))}
            </div>
            <div style={{ color: '#555' }}>{cancionText}</div>
            <div style={{ color: '#555' }}>
              {autorText.split(', ').map((name, idx, arr) => (
                <div key={idx}>
                  {name}{idx < arr.length - 1 ? ',' : ''}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px', width: '120px' }}>
              <button
                onClick={() => handleSkipTo(jingle)}
                disabled={isActive}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  backgroundColor: isActive ? '#f0f0f0' : '#fff',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  opacity: isActive ? 0.6 : 1,
                }}
              >
                Saltar a
              </button>
              <button
                onClick={() => handleExpand(jingle.id)}
                disabled={isActive}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  backgroundColor: isActive ? '#f0f0f0' : '#fff',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  opacity: isActive ? 0.6 : 1,
                }}
              >
                Expandir
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

