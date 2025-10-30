import "../../styles/components/metadata.css";
import React from 'react';
import { normalizeTimestampToSeconds } from '../../lib/utils/timestamp';
import type { JingleArtista, JingleCancion } from './JingleTimeline';

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
 * Active Jingle data with all relationships
 */
export interface JingleMetadataData {
  id: string;
  timestamp?: string | number;
  title?: string;
  jingleros?: JingleArtista[] | JingleArtista | null;
  cancion?: JingleCancion | null;
  autores?: JingleArtista[] | JingleArtista | null;
  tematicas?: JingleTematica[] | null;
  comment?: string;
  lyrics?: string;
}

export interface JingleMetadataProps {
  /** Active jingle data to display */
  jingle: JingleMetadataData | null;
  /** Additional CSS class name */
  className?: string;
  /** Callback to replay current jingle from start timestamp */
  onReplay?: () => void;
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
function getJingleDisplayTitle(jingle: JingleMetadataData): string {
  if (jingle.title) {
    return jingle.title;
  }

  const cancion = formatCancion(jingle.cancion);
  const autores = formatAutores(jingle.autores);

  if (cancion !== 'A CONFIRMAR' && autores !== 'A CONFIRMAR') {
    return `${cancion} (${autores})`;
  }

  return 'A CONFIRMAR';
}

/**
 * Jingle Metadata Component
 * 
 * Displays detailed information about the currently active/playing jingle.
 * Shows title, Jinglero, Cancion, Autor, Tematicas, and optional metadata.
 * 
 * @example
 * ```tsx
 * <JingleMetadata jingle={activeJingle} />
 * ```
 */
export default function JingleMetadata({ jingle, className, onReplay }: JingleMetadataProps) {
  if (!jingle) {
    return (
      <div className={`metadata-container ${className || ''}`}>
        <div className="metadata-header">
          <h2 className="metadata-title">Disfruta del programa</h2>
        </div>
        <div style={{
          backgroundColor: '#fff', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', padding: '20px', textAlign: 'center', color: '#666', fontSize: '15px'
        }}>
          <p style={{ margin: 0 }}>No hay información de jingle disponible</p>
        </div>
      </div>
    );
  }

  const timestampSeconds = jingle.timestamp
    ? normalizeTimestampToSeconds(jingle.timestamp)
    : null;

  const displayTitle = getJingleDisplayTitle(jingle);
  const cancionText = formatCancion(jingle.cancion);

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

  const tematicas = Array.isArray(jingle.tematicas) ? jingle.tematicas : [];

  return (
    <div className={`metadata-container ${className || ''}`}>
      <div className="metadata-header">
        <h2 className="metadata-title">{displayTitle}</h2>
        {onReplay && timestampSeconds !== null && (
          <button
            onClick={onReplay}
            className="replay-button"
            title="Repetir jingle"
            aria-label="Repetir jingle"
          >
            ↻
          </button>
        )}
      </div>
      <div style={{ backgroundColor: "#fff", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px", padding: "20px"}}>
        <table className="metadata-table">
          <tbody>
            {/* Titulo row - spans all columns */}
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
      {/* Optional: Lyrics */}
      {jingle.lyrics && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <div style={{ color: '#666', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Letra:</div>
          <div style={{ color: '#555', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-line', fontFamily: 'serif' }}>{jingle.lyrics}</div>
        </div>
      )}
    </div>
  );
}

