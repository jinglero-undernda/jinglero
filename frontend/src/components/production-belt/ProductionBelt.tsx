import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useYouTubePlayer } from '../../lib/hooks/useYouTubePlayer';
import { useJingleSync } from '../../lib/hooks/useJingleSync';
import { publicApi } from '../../lib/api/client';
import YouTubePlayer from '../player/YouTubePlayer';
import type { YouTubePlayerRef } from '../player/YouTubePlayer';
import ConveyorBelt from './ConveyorBelt';
import MachineControlPanel from './MachineControlPanel';
import type { Fabrica, Jingle } from '../../types';
import type { JingleTimelineItem } from '../player/JingleTimeline';
import type { JingleMetadataData } from '../player/JingleMetadata';
import '../../styles/components/production-belt.css';
import { normalizeTimestampToSeconds } from '../../lib/utils/timestamp';

export interface ProductionBeltProps {
  fabricaId: string;
  initialTimestamp?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ProductionBelt({ fabricaId, initialTimestamp, className, style }: ProductionBeltProps) {
  // Data State
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [allJingles, setAllJingles] = useState<JingleTimelineItem[]>([]);
  const [fullJingleData, setFullJingleData] = useState<Record<string, Jingle>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [userSelectedJingleId, setUserSelectedJingleId] = useState<string | null>(null);

  // Player State
  const playerRef = useRef<YouTubePlayerRef>(null);
  const { state: playerState, play, pause } = useYouTubePlayer(playerRef);

  // Sync State
  const { activeJingle, activeJingleId } = useJingleSync(
    playerState.currentTime,
    allJingles,
    { enabled: true }
  );

  // Determine which Jingle to show in Information Panel
  // Priority: User Selected > Active Jingle
  const displayedJingleId = userSelectedJingleId || activeJingleId;
  const displayedJingleBasic = allJingles.find(j => j.id === displayedJingleId) || activeJingle;
  
  // Get full data if available, otherwise fallback to timeline item
  const displayedJingleFull = displayedJingleId ? fullJingleData[displayedJingleId] : null;

  // Prepare metadata for panel
  const panelMetadata: JingleMetadataData | null = useMemo(() => {
    if (displayedJingleFull) {
      // API returns cancion, autores, jingleros, tematicas as direct properties
      // but they might also be in _metadata
      const metadata = displayedJingleFull._metadata;
      return {
        id: displayedJingleFull.id,
        timestamp: displayedJingleFull.timestamp,
        title: displayedJingleFull.title,
        jingleros: (displayedJingleFull as any).jingleros || metadata?.jingleros || null,
        cancion: (displayedJingleFull as any).cancion || metadata?.cancion || null,
        autores: (displayedJingleFull as any).autores || metadata?.autores || null,
        tematicas: (displayedJingleFull as any).tematicas || null,
        comment: displayedJingleFull.comment,
        lyrics: displayedJingleFull.lyrics
      };
    }
    if (displayedJingleBasic) {
      return {
        id: displayedJingleBasic.id,
        timestamp: displayedJingleBasic.timestamp,
        title: displayedJingleBasic.title,
        jingleros: displayedJingleBasic.jingleros,
        cancion: null, // Basic doesn't have this usually
        autores: null,
        tematicas: null
      };
    }
    return null;
  }, [displayedJingleFull, displayedJingleBasic]);

  // Fetch Full Jingle Details when needed (lazy load)
  useEffect(() => {
    if (displayedJingleId && !fullJingleData[displayedJingleId]) {
      publicApi.getJingle(displayedJingleId)
        .then(data => {
          setFullJingleData(prev => ({ ...prev, [data.id]: data }));
        })
        .catch(err => console.error("Failed to fetch full jingle data", err));
    }
  }, [displayedJingleId, fullJingleData]);

  // All jingles are displayed on the belt (no past/future split)
  // Active jingle is determined by playback time, but all jingles appear as boxes

  // Initial Data Fetch
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fabricaData, jinglesData] = await Promise.all([
          publicApi.getFabrica(fabricaId),
          publicApi.getFabricaJingles(fabricaId)
        ]);
        
        setFabrica(fabricaData);
        // Cast or transform if needed, assuming getFabricaJingles returns Jingle[] compatible with TimelineItem
        // We might need to map it if types strictly mismatch, but JingleTimelineItem is a subset usually.
        // Let's verify type compatibility briefly.
        // JingleTimelineItem: { id, timestamp, title, jingleros }
        // Jingle: extends BaseEntity { timestamp, title, ... }
        // It matches sufficient properties.
        setAllJingles(jinglesData as unknown as JingleTimelineItem[]);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la fábrica");
        setLoading(false);
      }
    }
    fetchData();
  }, [fabricaId]);

  // Handlers
  const handleJingleSelect = (jingle: JingleTimelineItem) => {
    setUserSelectedJingleId(jingle.id);
  };

  const handleSkipTo = (jingle: JingleTimelineItem) => {
    const seconds = normalizeTimestampToSeconds(jingle.timestamp);
    if (seconds !== null && playerRef.current) {
      playerRef.current.seekTo(seconds);
      // Clear manual selection so it follows playback
      setUserSelectedJingleId(null);
    }
  };

  const handleSkipToSelected = () => {
    if (displayedJingleId) {
      const jingle = allJingles.find(j => j.id === displayedJingleId);
      if (jingle) {
        handleSkipTo(jingle);
      }
    }
  };

  // Player controls
  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSkipBack = () => {
    if (!playerRef.current || allJingles.length === 0) return;
    
    // Get current playback time as fallback
    const currentTime = playerState.currentTime ?? 0;
    
    // If we have an active jingle, find the previous one before it
    if (activeJingle) {
      const activeIndex = allJingles.findIndex(j => j.id === activeJingle.id);
      if (activeIndex !== -1) {
        if (activeIndex > 0) {
          const previousJingle = allJingles[activeIndex - 1];
          const seconds = normalizeTimestampToSeconds(previousJingle.timestamp);
          if (seconds !== null) {
            playerRef.current.seekTo(seconds);
            setUserSelectedJingleId(null); // Clear selection to follow playback
          }
        } else {
          // If at first jingle, go to start of current jingle
          const seconds = normalizeTimestampToSeconds(activeJingle.timestamp);
          if (seconds !== null) {
            playerRef.current.seekTo(seconds);
          }
        }
        return;
      }
    }
    
    // If no active jingle, find the last jingle that started before or at current time
    // Sort jingles by timestamp to ensure we find the correct previous one
    const sortedJingles = [...allJingles].sort((a, b) => {
      const aSeconds = normalizeTimestampToSeconds(a.timestamp) ?? 0;
      const bSeconds = normalizeTimestampToSeconds(b.timestamp) ?? 0;
      return aSeconds - bSeconds;
    });
    
    // Find the last jingle that started at or before the current time
    const previousJingle = sortedJingles
      .filter(jingle => {
        const jingleSeconds = normalizeTimestampToSeconds(jingle.timestamp);
        return jingleSeconds !== null && jingleSeconds <= currentTime;
      })
      .pop();
    
    if (previousJingle) {
      const seconds = normalizeTimestampToSeconds(previousJingle.timestamp);
      if (seconds !== null) {
        playerRef.current.seekTo(seconds);
        setUserSelectedJingleId(null); // Clear selection to follow playback
      }
    } else if (sortedJingles.length > 0) {
      // If no previous jingle found, go to the first jingle
      const firstJingle = sortedJingles[0];
      const seconds = normalizeTimestampToSeconds(firstJingle.timestamp);
      if (seconds !== null) {
        playerRef.current.seekTo(seconds);
        setUserSelectedJingleId(null);
      }
    }
  };

  const handleSkipForward = () => {
    if (!playerRef.current || allJingles.length === 0) return;
    
    // Get current playback time as fallback
    const currentTime = playerState.currentTime ?? 0;
    
    // If we have an active jingle, find the next one after it
    if (activeJingle) {
      const activeIndex = allJingles.findIndex(j => j.id === activeJingle.id);
      if (activeIndex !== -1 && activeIndex < allJingles.length - 1) {
        const nextJingle = allJingles[activeIndex + 1];
        const seconds = normalizeTimestampToSeconds(nextJingle.timestamp);
        if (seconds !== null) {
          playerRef.current.seekTo(seconds);
          setUserSelectedJingleId(null); // Clear selection to follow playback
        }
        return;
      }
    }
    
    // If no active jingle or at last jingle, find the first jingle after current time
    // Sort jingles by timestamp to ensure we find the correct next one
    const sortedJingles = [...allJingles].sort((a, b) => {
      const aSeconds = normalizeTimestampToSeconds(a.timestamp) ?? 0;
      const bSeconds = normalizeTimestampToSeconds(b.timestamp) ?? 0;
      return aSeconds - bSeconds;
    });
    
    // Find the first jingle that starts after the current time
    const nextJingle = sortedJingles.find(jingle => {
      const jingleSeconds = normalizeTimestampToSeconds(jingle.timestamp);
      return jingleSeconds !== null && jingleSeconds > currentTime;
    });
    
    if (nextJingle) {
      const seconds = normalizeTimestampToSeconds(nextJingle.timestamp);
      if (seconds !== null) {
        playerRef.current.seekTo(seconds);
        setUserSelectedJingleId(null); // Clear selection to follow playback
      }
    }
    // If no next jingle found, do nothing (already at or past the last jingle)
  };

  if (loading) return <div className="p-10 text-center">Cargando fábrica...</div>;
  if (error || !fabrica) return <div className="p-10 text-center text-red-600">{error || "Fábrica no encontrada"}</div>;

  // Determine status indicator state
  const statusIndicatorState = playerState.isBuffering ? 'buffering' : 
                                playerState.isPaused ? 'paused' : 
                                'playing';

  return (
    <div className={`production-belt-container ${className || ''}`} style={style}>
      {/* Factory Background */}
      <div className="factory-background"></div>

      {/* Main Layout: Monitor (Left) */}
      <div className="production-belt-main-layout">
        {/* CRT Monitor Section (Left) */}
        <div className="crt-monitor-section">
          <div className="crt-monitor-frame">
            <div className="crt-monitor-screen">
              <YouTubePlayer
                ref={playerRef}
                videoIdOrUrl={fabrica.youtubeUrl || fabrica.id || fabricaId}
                startSeconds={initialTimestamp || 0}
                autoplay={true}
                className="production-belt-player"
              />
            </div>
          </div>
          
          {/* External Controls Below Monitor */}
          <div className="monitor-controls">
            <button 
              className="monitor-control-btn skip-back-btn"
              onClick={handleSkipBack}
              title="Retroceder"
              aria-label="Retroceder"
            >
              &lt;&lt;
            </button>
            <button 
              className="monitor-control-btn play-pause-btn"
              onClick={handlePlayPause}
              title={playerState.isPlaying ? "Pausar" : "Reproducir"}
              aria-label={playerState.isPlaying ? "Pausar" : "Reproducir"}
            >
              {playerState.isPlaying ? '&gt;|' : '&gt;&gt;'}
            </button>
            <button 
              className="monitor-control-btn skip-forward-btn"
              onClick={handleSkipForward}
              title="Avanzar"
              aria-label="Avanzar"
            >
              &gt;&gt;
            </button>
          </div>

          {/* Status Indicator Light */}
          <div className={`status-indicator status-indicator-${statusIndicatorState}`}>
            <div className="indicator-glow"></div>
          </div>
        </div>
      </div>

      {/* Machine Control Panel (Right, Full Height, Above Conveyor) */}
      <div className="control-panel-section">
        <MachineControlPanel
          jingle={panelMetadata}
          fullJingleData={displayedJingleFull}
          onSkipTo={handleSkipToSelected}
        />
      </div>

      {/* Conveyor Belt (Bottom, Full Width) */}
      <div className="conveyor-belt-section">
        <ConveyorBelt
          allJingles={allJingles}
          fullJingleData={fullJingleData}
          activeJingleId={activeJingleId}
          selectedJingleId={displayedJingleId}
          onJingleSelect={handleJingleSelect}
          onSkipTo={handleSkipTo}
        />
      </div>
    </div>
  );
}

