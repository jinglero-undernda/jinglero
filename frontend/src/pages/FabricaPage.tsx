import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { Fabrica } from '../types';
import { publicApi } from '../lib/api/client';
import YouTubePlayer, { type YouTubePlayerRef } from '../components/player/YouTubePlayer';
import JingleTimeline, { type JingleTimelineItem } from '../components/player/JingleTimeline';
import JingleMetadata, { type JingleMetadataData } from '../components/player/JingleMetadata';
import { useYouTubePlayer } from '../lib/hooks/useYouTubePlayer';
import { useJingleSync } from '../lib/hooks/useJingleSync';
import { normalizeTimestampToSeconds, formatSecondsToTimestamp } from '../lib/utils/timestamp';
import { extractVideoId } from '../lib/utils/youtube';

export default function FabricaPage() {
  const { fabricaId } = useParams<{ fabricaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerRef = useRef<YouTubePlayerRef>(null);
  const currentJingleRowRef = useRef<HTMLDivElement>(null);

  // State
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [jingles, setJingles] = useState<JingleTimelineItem[]>([]);
  const [activeJingleMetadata, setActiveJingleMetadata] = useState<JingleMetadataData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialTimestamp, setInitialTimestamp] = useState<number | null>(null);
  const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(new Set());
  const [previousExpandedStates, setPreviousExpandedStates] = useState<Map<string, boolean>>(new Map());

  // Memoize the callback for active jingle changes
  const handleActiveJingleChange = useCallback(async (jingle: JingleTimelineItem | null) => {
    if (jingle) {
      // Fetch full jingle data with relationships for metadata display
      try {
        const fullJingle = await publicApi.getJingle(jingle.id);
        // Transform the API response to JingleMetadataData format
        const metadata: JingleMetadataData = {
          id: fullJingle.id,
          timestamp: jingle.timestamp,
          title: fullJingle.title,
          jingleros: Array.isArray((fullJingle as any).jingleros) 
            ? (fullJingle as any).jingleros.length > 0 
              ? (fullJingle as any).jingleros 
              : null
            : null,
          cancion: (fullJingle as any).cancion || null,
          autores: Array.isArray((fullJingle as any).autores)
            ? (fullJingle as any).autores.length > 0
              ? (fullJingle as any).autores
              : null
            : null,
          tematicas: (fullJingle as any).tematicas || null,
          comment: fullJingle.comment,
          lyrics: fullJingle.lyrics,
        };
        setActiveJingleMetadata(metadata);
      } catch (err) {
        console.warn('Failed to fetch full jingle metadata:', err);
        // Fallback to basic data from timeline
        const basicMetadata: JingleMetadataData = {
          id: jingle.id,
          timestamp: jingle.timestamp,
          title: jingle.title,
          jingleros: jingle.jingleros,
          cancion: jingle.cancion,
          autores: jingle.autores,
        };
        setActiveJingleMetadata(basicMetadata);
      }
    } else {
      setActiveJingleMetadata(null);
    }
  }, []);

  // YouTube player hook - no callbacks needed, time updates are handled by useJingleSync
  const { state: playerState, seekTo } = useYouTubePlayer(playerRef, {});

  // Jingle sync hook - determines active jingle based on playback time
  const { activeJingleId } = useJingleSync(
    playerState.currentTime,
    jingles,
    {
      onActiveJingleChange: handleActiveJingleChange,
    }
  );

  // Partition jingles into past, current, and future based on active jingle
  const { pastJingles, currentJingle, futureJingles } = useMemo(() => {
    if (!activeJingleId) {
      return {
        pastJingles: [],
        currentJingle: null,
        futureJingles: jingles,
      };
    }

    const currentIndex = jingles.findIndex((j) => j.id === activeJingleId);
    
    if (currentIndex === -1) {
      return {
        pastJingles: [],
        currentJingle: null,
        futureJingles: jingles,
      };
    }

    return {
      pastJingles: jingles.slice(0, currentIndex),
      currentJingle: jingles[currentIndex],
      futureJingles: jingles.slice(currentIndex + 1),
    };
  }, [jingles, activeJingleId]);

  // Fetch Fabrica and Jingles data
  useEffect(() => {
    if (!fabricaId) {
      setError('ID de Fabrica no proporcionado');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Fabrica data
        const fabricaData = await publicApi.getFabrica(fabricaId);
        setFabrica(fabricaData);

        // Check for initial timestamp from URL query params (for deep linking)
        const timestampParam = searchParams.get('t');
        if (timestampParam) {
          const timestamp = parseFloat(timestampParam);
          if (!isNaN(timestamp) && timestamp >= 0) {
            setInitialTimestamp(timestamp);
          }
        }

        // Fetch Jingles for this Fabrica
        const jinglesData = await publicApi.getFabricaJingles(fabricaId);
        
        // Transform API response to JingleTimelineItem format
        const timelineItems: JingleTimelineItem[] = jinglesData.map((jingle: any) => ({
          id: jingle.id,
          timestamp: jingle.timestamp || 0,
          title: jingle.title,
          // Note: Basic endpoint doesn't include relationships, so these will be null
          // Full data will be fetched when jingle becomes active
          jingleros: null,
          cancion: null,
          autores: null,
          isActive: false,
        }));

        setJingles(timelineItems);
      } catch (err: any) {
        console.error('Error fetching Fabrica data:', err);
        setError(err?.message || 'Error al cargar la Fabrica');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fabricaId, searchParams]);

  // Handle seek to timestamp when initialTimestamp is set
  useEffect(() => {
    if (initialTimestamp !== null && playerState.isReady && playerRef.current) {
      seekTo(initialTimestamp);
      setInitialTimestamp(null); // Clear so we don't seek again
      
      // Scroll to current jingle after seeking (with delay for DOM update)
      setTimeout(() => {
        if (currentJingleRowRef.current) {
          currentJingleRowRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 500);
    }
  }, [initialTimestamp, playerState.isReady, seekTo]);

  // Auto-scroll to keep current jingle (player) in view when active jingle changes
  useEffect(() => {
    if (activeJingleId && currentJingleRowRef.current) {
      // Small delay to ensure DOM is updated with new past/future jingles
      setTimeout(() => {
        currentJingleRowRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [activeJingleId]);

  // Update jingles with active state
  useEffect(() => {
    setJingles((prev) => {
      // Only update if active jingle actually changed
      const needsUpdate = prev.some(
        (j) => (j.id === activeJingleId) !== j.isActive
      );
      if (!needsUpdate) {
        return prev; // Return same reference to avoid unnecessary updates
      }
      return prev.map((j) => ({
        ...j,
        isActive: j.id === activeJingleId,
      }));
    });
  }, [activeJingleId]);

  // Handle skip to jingle timestamp
  const handleSkipToJingle = (jingle: JingleTimelineItem) => {
    const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
    if (timestampSeconds !== null && playerRef.current?.isReady()) {
      seekTo(timestampSeconds);
      // Update URL with timestamp for deep linking
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('t', timestampSeconds.toString());
      navigate(`/f/${fabricaId}?${newSearchParams.toString()}`, { replace: true });
    }
  };

  // Handle toggle expand/collapse for jingle rows
  const handleToggleExpand = (jingleId: string) => {
    setExpandedJingleIds((prev) => {
      const next = new Set(prev);
      if (next.has(jingleId)) {
        next.delete(jingleId);
      } else {
        next.add(jingleId);
      }
      return next;
    });
  };

  // Handle skip to first jingle
  const handleSkipToFirstJingle = () => {
    if (jingles.length > 0 && playerRef.current?.isReady()) {
      const firstJingle = jingles[0];
      const timestampSeconds = normalizeTimestampToSeconds(firstJingle.timestamp);
      if (timestampSeconds !== null) {
        seekTo(timestampSeconds);
      }
    }
  };

  // Handle replay current jingle
  const handleReplayCurrentJingle = () => {
    if (currentJingle && playerRef.current?.isReady()) {
      const timestampSeconds = normalizeTimestampToSeconds(currentJingle.timestamp);
      if (timestampSeconds !== null) {
        seekTo(timestampSeconds);
      }
    }
  };

  // Extract video ID from Fabrica YouTube URL
  const videoId = fabrica ? extractVideoId(fabrica.youtubeUrl) : null;

  // Loading state
  if (loading) {
    return (
      <main style={{ padding: '24px', textAlign: 'center' }}>
        <p>Cargando Fabrica...</p>
      </main>
    );
  }

  // Error state
  if (error || !fabrica) {
    return (
      <main style={{ padding: '24px', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error || 'Fabrica no encontrada'}</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  // No video ID
  if (!videoId) {
    return (
      <main style={{ padding: '24px', textAlign: 'center' }}>
        <h1>{fabrica.title || `Fabrica ${fabricaId}`}</h1>
        <p>URL de YouTube no válida</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  // Helper component: Collapsed Jingle Row
  const CollapsedJingleRow = ({ 
    jingle, 
    isExpanded, 
    onToggleExpand, 
    onSkipTo 
  }: {
    jingle: JingleTimelineItem;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onSkipTo: () => void;
  }) => {
    const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
    const timestampFormatted = timestampSeconds !== null
      ? formatSecondsToTimestamp(timestampSeconds)
      : String(jingle.timestamp);

    const displayTitle = jingle.title || 'A CONFIRMAR';

    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #ddd',
          padding: '16px',
          marginBottom: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        {/* Collapsed header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#666',
            minWidth: '80px',
          }}>
            {timestampFormatted}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
              {displayTitle}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onSkipTo}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ⏩ Saltar
            </button>
            <button
              onClick={onToggleExpand}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Expanded content - placeholder for Module 5 */}
        {isExpanded && (
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '1px solid #eee',
            fontSize: '14px',
            color: '#666',
          }}>
            <p style={{ fontStyle: 'italic' }}>
              Vista expandida - implementación completa en Módulo 5
            </p>
          </div>
        )}
      </div>
    );
  };

  // Helper component: Empty Metadata with Skip Button
  const EmptyMetadataWithButton = ({ onSkipToFirst }: { onSkipToFirst: () => void }) => {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        <p style={{ marginBottom: '16px', fontSize: '16px', color: '#666' }}>
          Reproducción en curso
        </p>
        <button
          onClick={onSkipToFirst}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Saltar al primer Jingle
        </button>
      </div>
    );
  };

  return (
    <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Volver al inicio
        </Link>
        <h1 style={{ margin: '16px 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
          {fabrica.title || `Fabrica ${fabricaId}`}
        </h1>
        {fabrica.date && (
          <p style={{ color: '#666', fontSize: '14px' }}>
            Fecha de publicacion:{" "}
            {(() => {
              try {
                const date = new Date(fabrica.date);
                return isNaN(date.getTime())
                  ? "Fecha no disponible"
                  : date.toLocaleDateString('es-AR');
              } catch {
                return "Fecha no disponible";
              }
            })()}
          </p>
        )}
      </div>

      {/* Three-Container Scrollable Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          paddingRight: '8px',
        }}
      >
        {/* CONTAINER 1: Past Jingles */}
        <div id="past-jingles-container">
          {pastJingles.map((jingle) => (
            <CollapsedJingleRow
              key={jingle.id}
              jingle={jingle}
              isExpanded={expandedJingleIds.has(jingle.id)}
              onToggleExpand={() => handleToggleExpand(jingle.id)}
              onSkipTo={() => handleSkipToJingle(jingle)}
            />
          ))}
        </div>

        {/* CONTAINER 2: Current Jingle - Player STAYS HERE (fixed in DOM) */}
        <div 
          id="current-jingle-container"
          ref={currentJingleRowRef}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '24px',
            padding: '16px',
            backgroundColor: currentJingle ? '#f0f7ff' : '#fff',
            borderRadius: '8px',
            border: currentJingle ? '2px solid #1976d2' : '1px solid #ddd',
            boxShadow: currentJingle ? '0 2px 8px rgba(25, 118, 210, 0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {/* YouTube Player - always rendered here */}
          <div>
            <YouTubePlayer
              ref={playerRef}
              videoIdOrUrl={videoId}
              width="100%"
              height={480}
              autoplay={false}
              startSeconds={initialTimestamp || undefined}
              className="fabrica-player"
            />
          </div>

          {/* Metadata Panel */}
          <div>
            {currentJingle ? (
              <JingleMetadata 
                jingle={activeJingleMetadata}
                // onReplay prop will be added in Module 4
              />
            ) : jingles.length > 0 ? (
              <EmptyMetadataWithButton onSkipToFirst={handleSkipToFirstJingle} />
            ) : (
              <JingleMetadata jingle={null} />
            )}
          </div>
        </div>

        {/* CONTAINER 3: Future Jingles */}
        <div id="future-jingles-container">
          {futureJingles.map((jingle) => (
            <CollapsedJingleRow
              key={jingle.id}
              jingle={jingle}
              isExpanded={expandedJingleIds.has(jingle.id)}
              onToggleExpand={() => handleToggleExpand(jingle.id)}
              onSkipTo={() => handleSkipToJingle(jingle)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
