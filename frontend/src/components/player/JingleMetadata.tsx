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
      <div className={className} style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottom: '2px solid #eee',
            padding: '16px 20px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            Disfruta del programa
          </h2>
        </div>
        <div
          style={{
            backgroundColor: '#fff',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            color: '#666',
            fontSize: '15px',
          }}
        >
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

  // Common cell styles
  const labelCellStyle: React.CSSProperties = {
    width: '120px',
    padding: '8px 12px 8px 0',
    color: '#666',
    fontWeight: '600',
    verticalAlign: 'top',
  };

  const dataCellStyle: React.CSSProperties = {
    padding: '8px 0',
    color: '#333',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
  };

  const navCellStyle: React.CSSProperties = {
    width: '40px',
    padding: '8px 0',
  };

  return (
    <div className={className} style={{
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      {/* Header with title and replay button */}
      <div
        className="metadata-header"
        style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          borderBottom: '2px solid #eee',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
        }}>
          {displayTitle}
        </h2>
        {onReplay && timestampSeconds !== null && (
          <button
            onClick={onReplay}
            className="replay-button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '4px 8px',
              color: '#1976d2',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Repetir jingle"
            aria-label="Repetir jingle"
          >
            ↻
          </button>
        )}
      </div>

      {/* Main metadata table */}
      <div style={{
        backgroundColor: '#fff',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        padding: '20px',
      }}>
        <table
          className="metadata-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '15px',
          }}
        >
          <tbody>
            {/* Titulo row - spans all columns */}
            <tr>
              <td className="label-col" style={labelCellStyle}>
                Titulo del Jingle:
              </td>
              <td className="data-col" colSpan={2} style={dataCellStyle}>
                {displayTitle}
              </td>
            </tr>

            {/* Cancion row */}
            <tr>
              <td className="label-col" style={labelCellStyle}>
                Cancion:
              </td>
              <td className="data-col" style={dataCellStyle}>
                {cancionText !== 'A CONFIRMAR' ? (
                  cancionText
                ) : (
                  <span style={{ fontStyle: 'italic', color: '#999' }}>A CONFIRMAR</span>
                )}
              </td>
              <td className="nav-col" style={navCellStyle}></td>
            </tr>

            {/* Autor rows - handle multiple */}
            {autores.length > 0 ? (
              <>
                <tr>
                  <td
                    className="label-col"
                    rowSpan={autores.length > 1 ? autores.length : undefined}
                    style={labelCellStyle}
                  >
                    Autor:
                  </td>
                  <td className="data-col" style={dataCellStyle}>
                    {autores[0].stageName || autores[0].name || 'A CONFIRMAR'}
                  </td>
                  <td className="nav-col" style={navCellStyle}></td>
                </tr>
                {autores.slice(1).map((autor, idx) => (
                  <tr key={autor.id || `autor-${idx + 1}`}>
                    <td className="data-col" style={dataCellStyle}>
                      {autor.stageName || autor.name || 'A CONFIRMAR'}
                    </td>
                    <td className="nav-col" style={navCellStyle}></td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td className="label-col" style={labelCellStyle}>
                  Autor:
                </td>
                <td className="data-col" style={dataCellStyle}>
                  <span style={{ fontStyle: 'italic', color: '#999' }}>A CONFIRMAR</span>
                </td>
                <td className="nav-col" style={navCellStyle}></td>
              </tr>
            )}

            {/* Jinglero rows - handle multiple */}
            {jingleros.length > 0 ? (
              <>
                <tr>
                  <td
                    className="label-col"
                    rowSpan={jingleros.length > 1 ? jingleros.length : undefined}
                    style={labelCellStyle}
                  >
                    Jinglero:
                  </td>
                  <td className="data-col" style={dataCellStyle}>
                    {jingleros[0].stageName || jingleros[0].name || 'Anonimo'}
                  </td>
                  <td className="nav-col" style={navCellStyle}></td>
                </tr>
                {jingleros.slice(1).map((jinglero, idx) => (
                  <tr key={jinglero.id || `jinglero-${idx + 1}`}>
                    <td className="data-col" style={dataCellStyle}>
                      {jinglero.stageName || jinglero.name || 'Anonimo'}
                    </td>
                    <td className="nav-col" style={navCellStyle}></td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td className="label-col" style={labelCellStyle}>
                  Jinglero:
                </td>
                <td className="data-col" style={dataCellStyle}>
                  <span style={{ fontStyle: 'italic', color: '#999' }}>Anonimo</span>
                </td>
                <td className="nav-col" style={navCellStyle}></td>
              </tr>
            )}

            {/* Tematica rows - one per tematica */}
            {tematicas.length > 0 && (
              <>
                <tr>
                  <td
                    className="label-col"
                    rowSpan={tematicas.length}
                    style={labelCellStyle}
                  >
                    Tematica:
                  </td>
                  <td className="data-col" style={dataCellStyle}>
                    {tematicas[0].name}
                  </td>
                  <td className="nav-col" style={navCellStyle}></td>
                </tr>
                {tematicas.slice(1).map((tematica) => (
                  <tr key={tematica.id}>
                    <td className="data-col" style={dataCellStyle}>
                      {tematica.name}
                    </td>
                    <td className="nav-col" style={navCellStyle}></td>
                  </tr>
                ))}
              </>
            )}

            {/* Comentario row */}
            {jingle.comment && (
              <tr>
                <td className="label-col" style={labelCellStyle}>
                  Comentario:
                </td>
                <td className="data-col" colSpan={2} style={{
                  ...dataCellStyle,
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
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #eee',
        }}>
          <div style={{ color: '#666', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Letra:
          </div>
          <div style={{
            color: '#555',
            fontSize: '14px',
            lineHeight: '1.8',
            whiteSpace: 'pre-line',
            fontFamily: 'serif',
          }}>
            {jingle.lyrics}
          </div>
        </div>
      )}
    </div>
  );
}

