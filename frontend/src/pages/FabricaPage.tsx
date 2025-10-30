import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { Fabrica } from '../types';
import { publicApi } from '../lib/api/client';
import YouTubePlayer, { type YouTubePlayerRef } from '../components/player/YouTubePlayer';
import JingleTimeline, { type JingleTimelineItem } from '../components/player/JingleTimeline';
import JingleMetadata, { type JingleMetadataData } from '../components/player/JingleMetadata';
import { useYouTubePlayer } from '../lib/hooks/useYouTubePlayer';
import { useJingleSync } from '../lib/hooks/useJingleSync';
import { normalizeTimestampToSeconds } from '../lib/utils/timestamp';
import { extractVideoId } from '../lib/utils/youtube';

export default function FabricaPage() {
  const { fabricaId } = useParams<{ fabricaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerRef = useRef<YouTubePlayerRef>(null);

  // State
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [jingles, setJingles] = useState<JingleTimelineItem[]>([]);
  const [activeJingleMetadata, setActiveJingleMetadata] = useState<JingleMetadataData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialTimestamp, setInitialTimestamp] = useState<number | null>(null);

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
    }
  }, [initialTimestamp, playerState.isReady, seekTo]);

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

      {/* Main content grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Left column: Video player */}
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

        {/* Right column: Active jingle metadata */}
        <div>
          <JingleMetadata jingle={activeJingleMetadata} />
        </div>
      </div>

      {/* Jingle Timeline */}
      <div>
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
          Lista de Jingles ({jingles.length})
        </h2>
        {jingles.length > 0 ? (
          <JingleTimeline
            jingles={jingles}
            activeJingleId={activeJingleId}
            onSkipTo={handleSkipToJingle}
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
            <p style={{ color: '#999' }}>Esta Fabrica aún no tiene Jingles</p>
          </div>
        )}
      </div>
    </main>
  );
}
