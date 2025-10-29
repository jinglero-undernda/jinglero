import { formatSecondsToTimestamp, normalizeTimestampToSeconds } from '../../lib/utils/timestamp';
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
export default function JingleMetadata({ jingle, className }: JingleMetadataProps) {
  if (!jingle) {
    return (
      <div className={className} style={{
        padding: '24px',
        textAlign: 'center',
        color: '#999',
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        border: '1px solid #eee',
      }}>
        <p>No hay jingle activo</p>
      </div>
    );
  }

  const timestampSeconds = jingle.timestamp
    ? normalizeTimestampToSeconds(jingle.timestamp)
    : null;
  const timestampFormatted = timestampSeconds !== null
    ? formatSecondsToTimestamp(timestampSeconds)
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

  // Group tematicas by primary vs secondary
  const primaryTematicas = tematicas.filter((t) => t.isPrimary);
  const secondaryTematicas = tematicas.filter((t) => !t.isPrimary);

  return (
    <div className={className} style={{
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      {/* Header with title and timestamp */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '16px' }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
        }}>
          {displayTitle}
        </h2>
        {timestampFormatted && (
          <div style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#666',
            fontWeight: '500',
          }}>
            Tiempo: {timestampFormatted}
          </div>
        )}
      </div>

      {/* Main metadata grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: '12px 20px',
        marginBottom: '20px',
        fontSize: '15px',
      }}>
        {/* Jinglero */}
        <div style={{ color: '#666', fontWeight: '600' }}>Jinglero:</div>
        <div style={{ color: '#333' }}>
          {jingleros.length > 0 ? (
            jingleros.map((jinglero, idx) => (
              <div key={jinglero.id || idx} style={{ marginBottom: idx < jingleros.length - 1 ? '4px' : '0' }}>
                {jinglero.stageName || jinglero.name || 'Anonimo'}
              </div>
            ))
          ) : (
            <div style={{ fontStyle: 'italic', color: '#999' }}>Anonimo</div>
          )}
        </div>

        {/* Cancion */}
        <div style={{ color: '#666', fontWeight: '600' }}>Cancion:</div>
        <div style={{ color: '#333' }}>
          {cancionText !== 'A CONFIRMAR' ? (
            cancionText
          ) : (
            <span style={{ fontStyle: 'italic', color: '#999' }}>A CONFIRMAR</span>
          )}
        </div>

        {/* Autor */}
        <div style={{ color: '#666', fontWeight: '600' }}>Autor:</div>
        <div style={{ color: '#333' }}>
          {autores.length > 0 ? (
            autores.map((autor, idx) => (
              <div key={autor.id || idx} style={{ marginBottom: idx < autores.length - 1 ? '4px' : '0' }}>
                {autor.stageName || autor.name || 'A CONFIRMAR'}
              </div>
            ))
          ) : (
            <span style={{ fontStyle: 'italic', color: '#999' }}>A CONFIRMAR</span>
          )}
        </div>

        {/* Tematicas */}
        {tematicas.length > 0 && (
          <>
            <div style={{ color: '#666', fontWeight: '600' }}>Tematicas:</div>
            <div style={{ color: '#333' }}>
              {primaryTematicas.length > 0 && (
                <div style={{ marginBottom: secondaryTematicas.length > 0 ? '8px' : '0' }}>
                  {primaryTematicas.map((tematica) => (
                    <span
                      key={tematica.id}
                      style={{
                        display: 'inline-block',
                        marginRight: '8px',
                        marginBottom: '4px',
                        padding: '4px 10px',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      {tematica.name}
                    </span>
                  ))}
                </div>
              )}
              {secondaryTematicas.length > 0 && (
                <div>
                  {secondaryTematicas.map((tematica) => (
                    <span
                      key={tematica.id}
                      style={{
                        display: 'inline-block',
                        marginRight: '8px',
                        marginBottom: '4px',
                        padding: '4px 10px',
                        backgroundColor: '#e0e0e0',
                        color: '#555',
                        borderRadius: '12px',
                        fontSize: '13px',
                      }}
                    >
                      {tematica.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Optional: Comment */}
      {jingle.comment && (
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #eee',
        }}>
          <div style={{ color: '#666', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Comentario:
          </div>
          <div style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic' }}>
            {jingle.comment}
          </div>
        </div>
      )}

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

