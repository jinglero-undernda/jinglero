import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { Fabrica } from '../types';
import { publicApi } from '../lib/api/client';
import YouTubePlayer, { type YouTubePlayerRef } from '../components/player/YouTubePlayer';
import { JingleTimelineRow, type JingleTimelineItem } from '../components/player/JingleTimeline';
import JingleMetadata, { type JingleMetadataData } from '../components/player/JingleMetadata';
import { useYouTubePlayer } from '../lib/hooks/useYouTubePlayer';
import { useJingleSync } from '../lib/hooks/useJingleSync';
import { normalizeTimestampToSeconds } from '../lib/utils/timestamp';
import { extractVideoId } from '../lib/utils/youtube';
import "../styles/pages/fabrica.css";
import "../styles/components/metadata.css";
import "../styles/components/timeline.css";
import "../styles/components/player.css";

export default function FabricaPage() {
  const { fabricaId } = useParams<{ fabricaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerRef = useRef<YouTubePlayerRef>(null);
  const currentJingleRowRef = useRef<HTMLDivElement>(null);
  const initialTimestampAppliedRef = useRef<boolean>(false);
  const initialTimestampRef = useRef<number | null>(null);

  // State
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [jingles, setJingles] = useState<JingleTimelineItem[]>([]);
  const [activeJingleMetadata, setActiveJingleMetadata] = useState<JingleMetadataData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialTimestamp, setInitialTimestamp] = useState<number | null>(null);
  const [expandedJingleIds, setExpandedJingleIds] = useState<Set<string>>(new Set());
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no fabricaId provided, get latest and redirect
        let targetFabricaId = fabricaId;
        if (!targetFabricaId) {
          try {
            const latestFabrica = await publicApi.getLatestFabrica();
            targetFabricaId = latestFabrica.id;
            // Redirect to /show/:id to include the ID in the URL
            navigate(`/show/${targetFabricaId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, { replace: true });
            return; // Exit early, will re-run with fabricaId
          } catch (latestErr: any) {
            setError('No se pudo cargar la última Fabrica');
            setLoading(false);
            return;
          }
        }

        // Fetch Fabrica data
        const fabricaData = await publicApi.getFabrica(targetFabricaId);
        setFabrica(fabricaData);

        // Check for initial timestamp from URL query params (for deep linking)
        const timestampParam = searchParams.get('t');
        if (timestampParam) {
          const timestamp = parseFloat(timestampParam);
          if (!isNaN(timestamp) && timestamp >= 0) {
            setInitialTimestamp(timestamp);
            initialTimestampRef.current = timestamp; // Store in ref for stable prop
            initialTimestampAppliedRef.current = false; // Reset flag when new timestamp is set
          }
        } else {
          initialTimestampRef.current = null;
        }

        // Fetch Jingles for this Fabrica
        const jinglesResp = await publicApi.getFabricaJingles(targetFabricaId);
        // Normalize response to an array in case API returns wrapper object
        const jinglesData: any[] = Array.isArray(jinglesResp)
          ? jinglesResp
          : Array.isArray((jinglesResp as any)?.data)
            ? (jinglesResp as any).data
            : Array.isArray((jinglesResp as any)?.jingles)
              ? (jinglesResp as any).jingles
              : [];

        // Transform API response to JingleTimelineItem format
        const timelineItems: JingleTimelineItem[] = jinglesData.map((jingle: any) => ({
          id: jingle.id,
          timestamp: jingle.timestamp || 0,
          title: jingle.title,
          comment: jingle.comment || null,
          // Note: Basic endpoint doesn't include relationships, so these will be null
          // Full data will be fetched when jingle becomes active
          jingleros: null,
          cancion: null,
          autores: null,
          tematicas: null,
          isActive: false,
        }));

        setJingles(timelineItems);
      } catch (err: any) {
        console.error('Error fetching Fabrica data:', err);
        setError(err?.message || 'Error al cargar la Fabrica');
        // Show warning modal and attempt redirect to latest Fabrica
        setModalMessage('Error de datos, cargando la ultima Fabrica');
        setShowErrorModal(true);
        try {
          // Small delay so the user can read the message
          await new Promise((res) => setTimeout(res, 800));
          const fabricas = await publicApi.getFabricas();
          if (Array.isArray(fabricas) && fabricas.length > 0) {
            const latest = [...fabricas].sort((a, b) => {
              const da = new Date(a.date || a.createdAt).getTime();
              const db = new Date(b.date || b.createdAt).getTime();
              return db - da;
            })[0];
            if (latest?.id && latest.id !== fabricaId) {
              navigate(`/show/${latest.id}`);
              return;
            }
          }
          // If no fabricas available, keep modal and show final message briefly
          setModalMessage('No hay Fabricas disponibles. Intente más tarde.');
          await new Promise((res) => setTimeout(res, 1200));
          setShowErrorModal(false);
        } catch (fallbackErr) {
          console.warn('Fallback to latest Fabrica failed:', fallbackErr);
          // Hide modal after brief display
          await new Promise((res) => setTimeout(res, 1200));
          setShowErrorModal(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fabricaId, searchParams, navigate]);

  // Handle seek to timestamp when initialTimestamp is set
  useEffect(() => {
    // Only perform seek when both initialTimestamp is not null AND player is ready AND we haven't applied it yet
    if (
      initialTimestamp !== null && 
      playerState.isReady && 
      playerRef.current && 
      !initialTimestampAppliedRef.current
    ) {
      skipToTimestamp(initialTimestamp, false); // No URL change needed, already in URL
      initialTimestampAppliedRef.current = true; // Mark as applied
      setTimeout(() => {
        if (currentJingleRowRef.current) {
          currentJingleRowRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 500);
    }
    // If player not ready, do not mark as applied -- effect will retry on next render!
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
    if (timestampSeconds !== null) {
      skipToTimestamp(timestampSeconds, true);
    }
  };

  // Handle toggle expand/collapse for jingle rows
  const handleToggleExpand = useCallback((jingleId: string) => {
    // Check if currently expanded
    const isCurrentlyExpanded = expandedJingleIds.has(jingleId);
    
    // Toggle the expand state
    setExpandedJingleIds((prev) => {
      const next = new Set(prev);
      if (next.has(jingleId)) {
        next.delete(jingleId);
      } else {
        next.add(jingleId);
      }
      return next;
    });

    // If we're expanding (not collapsing), fetch full jingle data if needed
    if (!isCurrentlyExpanded) {
      const jingle = jingles.find((j) => j.id === jingleId);
      
      // Check if we already have relationship data
      const hasRelationshipData = jingle?.cancion !== null || 
                                  jingle?.autores !== null || 
                                  jingle?.jingleros !== null;
      
      // If we don't have data, trigger fetch
      if (jingle && !hasRelationshipData) {
        (async () => {
          try {
            console.log(`Fetching full jingle data for: ${jingleId}`);
            const fullJingle = await publicApi.getJingle(jingleId);
            
            // Update the jingles array with the full data
            setJingles((prevJingles) => 
              prevJingles.map((j) => 
                j.id === jingleId 
                  ? {
                      ...j,
                      jingleros: Array.isArray((fullJingle as any).jingleros) && (fullJingle as any).jingleros.length > 0
                        ? (fullJingle as any).jingleros
                        : null,
                      cancion: (fullJingle as any).cancion || null,
                      autores: Array.isArray((fullJingle as any).autores) && (fullJingle as any).autores.length > 0
                        ? (fullJingle as any).autores
                        : null,
                      tematicas: (fullJingle as any).tematicas || null,
                    }
                  : j
              )
            );
            console.log(`Successfully loaded data for: ${jingleId}`);
          } catch (err) {
            console.warn('Failed to fetch full jingle data for expansion:', err);
          }
        })();
      }
    }
  }, [expandedJingleIds, jingles]);

  // Handle skip to first jingle
  const handleSkipToFirstJingle = () => {
    if (jingles.length > 0) {
      const firstJingle = jingles[0];
      const timestampSeconds = normalizeTimestampToSeconds(firstJingle.timestamp);
      if (timestampSeconds !== null) {
        skipToTimestamp(timestampSeconds, true);
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

  // Loading state (skeletons)
  if (loading) {
    return (
      <main className="fabrica-container">
        <div className="header">
          <div className="skeleton skeleton-text" style={{ width: '180px', height: '16px' }} />
          <div className="skeleton skeleton-title" style={{ width: '60%', height: '28px', marginTop: '8px' }} />
          <div className="skeleton skeleton-text" style={{ width: '220px', height: '14px', marginTop: '6px' }} />
        </div>
        <div className="scrollable-containers">
          <div id="past-jingles-container">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`past-skel-${idx}`} className="timeline-row">
                <div className="skeleton" style={{ width: '100%', height: '64px', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
          <div id="current-jingle-container" className="timeline-row timeline-row--active">
            <div className="fabrica-player">
              <div className="skeleton" style={{ width: '100%', height: '100%', minHeight: '240px', borderRadius: '8px' }} />
            </div>
            <div>
              <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: '8px' }} />
            </div>
          </div>
          <div id="future-jingles-container">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`future-skel-${idx}`} className="timeline-row">
                <div className="skeleton" style={{ width: '100%', height: '64px', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error state (fallback if redirect did not occur)
  if (error || !fabrica) {
    return (
      <main style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
        {showErrorModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowErrorModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#1e1e1e',
                color: '#fff',
                padding: '20px 24px',
                borderRadius: '8px',
                width: 'min(520px, 92vw)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
            >
              <h2 style={{ marginTop: 0 }}>Error de datos</h2>
              <p>{modalMessage}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={() => setShowErrorModal(false)}
                  style={{
                    backgroundColor: '#2e2e2e',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
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

  const skipToTimestamp = (seconds: number, replaceUrl: boolean = false) => {
    if (playerRef.current?.isReady() && typeof seconds === 'number') {
      seekTo(seconds);
      if (replaceUrl) {
        // Update the URL without remounting the page
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('t', seconds.toString());
        // Use history API directly to avoid navigate remounting
        if (fabricaId) {
          window.history.replaceState(
            {}, '', `/show/${fabricaId}?${newSearchParams.toString()}`
          );
        }
      }
    }
  };

  return (
    <main className="fabrica-container">
      {showErrorModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowErrorModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1e1e1e',
              color: '#fff',
              padding: '20px 24px',
              borderRadius: '8px',
              width: 'min(520px, 92vw)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Error de datos</h2>
            <p>{modalMessage}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  backgroundColor: '#2e2e2e',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="header">
        <Link to="/" className="header-link">
          ← Volver al inicio
        </Link>
        <h1 className="fabrica-title">
          {fabrica.title || `Fabrica ${fabricaId}`}
        </h1>
        {fabrica.date && (
          <p className="fabrica-date">
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
      <div className="scrollable-containers">
        {/* CONTAINER 1: Past Jingles */}
        <div id="past-jingles-container">
          {pastJingles.map((jingle) => (
            <JingleTimelineRow
              key={jingle.id}
              jingle={jingle}
              isActive={jingle.isActive || jingle.id === activeJingleId}
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
          className={currentJingle ? "timeline-row timeline-row--active" : "timeline-row"}
        >
          {/* YouTube Player - always rendered here */}
          <div>
            <YouTubePlayer
              ref={playerRef}
              videoIdOrUrl={videoId}
              autoplay={false}
              startSeconds={initialTimestampRef.current ?? undefined}
              className="fabrica-player"
            />
          </div>

          {/* Metadata Panel */}
          <div>
            {currentJingle ? (
              <JingleMetadata 
                jingle={activeJingleMetadata}
                onReplay={handleReplayCurrentJingle}
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
            <JingleTimelineRow
              key={jingle.id}
              jingle={jingle}
              isActive={jingle.isActive || jingle.id === activeJingleId}
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
