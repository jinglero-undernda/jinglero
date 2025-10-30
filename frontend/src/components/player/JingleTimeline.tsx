import "../../styles/components/timeline.css";
import React from 'react';
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
 * Tematica data
 */
export interface JingleTematica {
  id: string;
  name: string;
  category?: 'ACTUALIDAD' | 'CULTURA' | 'GELATINA' | 'GENTE' | 'POLITICA';
  description?: string;
  isPrimary?: boolean;
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
  tematicas?: JingleTematica[] | null;
  comment?: string;
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
 * Normalizes tematicas array from jingle data
 */
function normalizeTematicas(
  tematicas: JingleTematica[] | JingleTematica | null | undefined
): JingleTematica[] {
  if (!tematicas) return [];
  if (Array.isArray(tematicas)) {
    return tematicas
      .filter((t) => t && t.name)
      .map((t) => ({ id: t.id || '', name: t.name, category: t.category, isPrimary: t.isPrimary }));
  }
  // Single tematica object
  if (tematicas.name) {
    return [{ id: tematicas.id || '', name: tematicas.name, category: tematicas.category, isPrimary: tematicas.isPrimary }];
  }
  return [];
}

/**
 * Props for JingleTimelineRow component
 */
export interface JingleTimelineRowProps {
  /** Jingle data to display (uses JingleTimelineItem interface) */
  jingle: JingleTimelineItem;
  /** Whether this jingle is currently active/playing */
  isActive?: boolean;
  /** Whether this jingle row is expanded */
  isExpanded: boolean;
  /** Callback when user toggles expand/collapse */
  onToggleExpand: () => void;
  /** Callback when user clicks skip-to button */
  onSkipTo: () => void;
}

/**
 * JingleTimelineRow Component
 * 
 * Displays a single jingle as an expandable/collapsible row.
 * Collapsed: Shows timestamp and comentario
 * Expanded: Shows full metadata table (matching JingleMetadata styling)
 */
export function JingleTimelineRow({ 
  jingle, 
  isActive = false,
  isExpanded, 
  onToggleExpand, 
  onSkipTo 
}: JingleTimelineRowProps) {
  const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
  const timestampFormatted = timestampSeconds !== null
    ? formatSecondsToTimestamp(timestampSeconds)
    : String(jingle.timestamp);

  const displayTitle = getJingleDisplayTitle(jingle);
  const cancionText = formatCancion(jingle.cancion);

  // Normalize arrays
  const jingleros = Array.isArray(jingle.jingleros)
    ? jingle.jingleros
    : jingle.jingleros
    ? [jingle.jingleros]
    : [];

  const autores = Array.isArray(jingle.autores)
    ? jingle.autores
    : jingle.autores
    ? [jingle.autores]
    : [];

  const tematicas = normalizeTematicas(jingle.tematicas);

  // Collapsed view
  if (!isExpanded) {
    return (
      <div
        className={`timeline-row timeline-row--collapsed${isActive ? ' timeline-row--active' : ''}`}
      >
        {/* Left-side timestamp and comentario */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            {timestampFormatted}
          </div>
          <div style={{ fontSize: '14px', color: '#555' }}>
            {jingle.comment || 'Sin comentario'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={onSkipTo} className="icon-button skip-to-icon" title="Saltar a este jingle">⏩</button>
          <button onClick={onToggleExpand} className="icon-button expand-icon" title="Expandir">▼</button>
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className={`timeline-row timeline-row--expanded${isActive ? ' timeline-row--active' : ''}`}>
      <div style={{ borderBottom: '2px solid #eee', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', color: '#666' }}>{timestampFormatted}</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '4px' }}>{displayTitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onSkipTo} className="icon-button skip-to-icon" title="Saltar a este jingle">⏩</button>
          <button onClick={onToggleExpand} className="icon-button expand-icon" title="Colapsar">▲</button>
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <table className="metadata-table">
          <tbody>
            {/* Table structure, use .label-col, .data-col, .nav-col as before */}
            {/* Titulo row */}
            <tr>
              <td className="label-col">
                Titulo del Jingle:
              </td>
              <td className="data-col" colSpan={2}>
                {displayTitle}
              </td>
            </tr>

            {/* Cancion row */}
            <tr>
              <td className="label-col">
                Cancion:
              </td>
              <td className="data-col">
                {cancionText !== 'A CONFIRMAR' ? (
                  cancionText
                ) : (
                  <span style={{ fontStyle: 'italic', color: '#999' }}>A CONFIRMAR</span>
                )}
              </td>
              <td className="nav-col"></td>
            </tr>

            {/* Autor rows - handle multiple */}
            {autores.length > 0 ? (
              <>
                <tr>
                  <td
                    className="label-col"
                    rowSpan={autores.length > 1 ? autores.length : undefined}
                  >
                    Autor:
                  </td>
                  <td className="data-col">
                    {autores[0].stageName || autores[0].name || 'A CONFIRMAR'}
                  </td>
                  <td className="nav-col"></td>
                </tr>
                {autores.slice(1).map((autor, idx) => (
                  <tr key={autor.id || `autor-${idx + 1}`}>
                    <td className="data-col">
                      {autor.stageName || autor.name || 'A CONFIRMAR'}
                    </td>
                    <td className="nav-col"></td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td className="label-col">
                  Autor:
                </td>
                <td className="data-col">
                  <span style={{ fontStyle: 'italic', color: '#999' }}>A CONFIRMAR</span>
                </td>
                <td className="nav-col"></td>
              </tr>
            )}

            {/* Jinglero rows - handle multiple */}
            {jingleros.length > 0 ? (
              <>
                <tr>
                  <td
                    className="label-col"
                    rowSpan={jingleros.length > 1 ? jingleros.length : undefined}
                  >
                    Jinglero:
                  </td>
                  <td className="data-col">
                    {jingleros[0].stageName || jingleros[0].name || 'Anonimo'}
                  </td>
                  <td className="nav-col"></td>
                </tr>
                {jingleros.slice(1).map((jinglero, idx) => (
                  <tr key={jinglero.id || `jinglero-${idx + 1}`}>
                    <td className="data-col">
                      {jinglero.stageName || jinglero.name || 'Anonimo'}
                    </td>
                    <td className="nav-col"></td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td className="label-col">
                  Jinglero:
                </td>
                <td className="data-col">
                  <span style={{ fontStyle: 'italic', color: '#999' }}>Anonimo</span>
                </td>
                <td className="nav-col"></td>
              </tr>
            )}

            {/* Tematica rows - one per tematica */}
            {tematicas.length > 0 && (
              <>
                <tr>
                  <td
                    className="label-col"
                    rowSpan={tematicas.length}
                  >
                    Tematica:
                  </td>
                  <td className="data-col">
                    {tematicas[0].name}
                  </td>
                  <td className="nav-col"></td>
                </tr>
                {tematicas.slice(1).map((tematica) => (
                  <tr key={tematica.id}>
                    <td className="data-col">
                      {tematica.name}
                    </td>
                    <td className="nav-col"></td>
                  </tr>
                ))}
              </>
            )}

            {/* Comentario row */}
            {jingle.comment && (
              <tr>
                <td className="label-col">
                  Comentario:
                </td>
                <td className="data-col" colSpan={2} style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                  color: '#555',
                }}>
                  {jingle.comment}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * @deprecated Use JingleTimelineRow component directly instead
 * This wrapper component is no longer needed - FabricaPage handles the mapping
 */
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
 * @deprecated Use JingleTimelineRow component directly instead
 */
export default function JingleTimeline({
  jingles,
  className,
}: JingleTimelineProps) {
  return (
    <div className={className}>
      {jingles.map((jingle) => (
        <div key={jingle.id} style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Deprecated: Use JingleTimelineRow component directly
          </p>
        </div>
      ))}
    </div>
  );
}

