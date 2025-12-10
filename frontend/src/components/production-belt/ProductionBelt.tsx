import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useYouTubePlayer } from '../../lib/hooks/useYouTubePlayer';
import { useJingleSync } from '../../lib/hooks/useJingleSync';
import { publicApi } from '../../lib/api/client';
import YouTubePlayer from '../player/YouTubePlayer';
import type { YouTubePlayerRef } from '../player/YouTubePlayer';
import ConveyorBelt from './ConveyorBelt';
import InformationPanel from './InformationPanel';
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
  const [isPanelDocked, setIsPanelDocked] = useState(true);
  const [userSelectedJingleId, setUserSelectedJingleId] = useState<string | null>(null);

  // Player State
  const playerRef = useRef<YouTubePlayerRef>(null);
  const { state: playerState } = useYouTubePlayer(playerRef);

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
      return {
        id: displayedJingleFull.id,
        timestamp: displayedJingleFull.timestamp,
        title: displayedJingleFull.title,
        jingleros: displayedJingleFull.jingleros,
        cancion: displayedJingleFull.cancion,
        autores: displayedJingleFull.autores,
        tematicas: displayedJingleFull.tematicas,
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

  // Split Jingles into Past / Active / Future
  const { pastJingles, futureJingles } = useMemo(() => {
    if (!activeJingle) {
      // If nothing is active (e.g. start), everything is Future? 
      // Or if time is 0, first one might be active.
      // Let's assume everything before "now" is past (unlikely if active is null)
      // If no active jingle found, it means we are before the first one or in a gap?
      // Design: "Active Jingle ... exists only in central processor"
      return { pastJingles: [], futureJingles: allJingles };
    }

    const activeIndex = allJingles.findIndex(j => j.id === activeJingle.id);
    if (activeIndex === -1) return { pastJingles: [], futureJingles: allJingles };

    return {
      pastJingles: allJingles.slice(0, activeIndex),
      futureJingles: allJingles.slice(activeIndex + 1)
    };
  }, [allJingles, activeJingle]);

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
    // If undocked, maybe open panel?
    if (!isPanelDocked) {
      // Logic to show panel if hidden? But design says toggle is manual.
    }
  };

  const handleSkipTo = (jingle: JingleTimelineItem) => {
    const seconds = normalizeTimestampToSeconds(jingle.timestamp);
    if (seconds !== null && playerRef.current) {
      playerRef.current.seekTo(seconds);
      // Auto-select this jingle too?
      // Design says "Active Jingle updates... Information panel updates if showing active Jingle"
      // If user had manually selected a different jingle, we might want to clear that selection so it follows active?
      // Let's clear manual selection so it follows playback.
      setUserSelectedJingleId(null);
    }
  };

  const handleReplay = () => {
    if (activeJingle && playerRef.current) {
      const seconds = normalizeTimestampToSeconds(activeJingle.timestamp);
      if (seconds !== null) {
        playerRef.current.seekTo(seconds);
      }
    }
  };

  // If user clicks outside or wants to "close" selection and go back to active
  // We can provide a way. For now, if active changes, do we clear selection?
  // Design: "Selected Jingle may be different from the active Jingle"
  // So we shouldn't auto-clear unless requested.

  if (loading) return <div className="p-10 text-center">Cargando fábrica...</div>;
  if (error || !fabrica) return <div className="p-10 text-center text-red-600">{error || "Fábrica no encontrada"}</div>;

  return (
    <div className={`production-belt-container ${className || ''}`} style={style}>
      {/* Conveyor Belt Wrapper */}
      <div className="conveyor-belt-wrapper">
        <div className="production-header">
           <h1 style={{ margin: 0, fontSize: '24px' }}>{fabrica.title}</h1>
           <div style={{ fontSize: '14px', color: '#666' }}>
             {activeJingle ? `Reproduciendo: ${activeJingle.title}` : 'Esperando inicio...'}
           </div>
        </div>

        <ConveyorBelt
          pastJingles={pastJingles}
          futureJingles={futureJingles}
          selectedJingleId={displayedJingleId}
          onJingleSelect={handleJingleSelect}
          onSkipTo={handleSkipTo}
        >
          <YouTubePlayer
            ref={playerRef}
            videoIdOrUrl={fabrica.youtubeUrl || fabrica.id || fabricaId}
            startSeconds={initialTimestamp || 0}
            autoplay={true}
            className="production-belt-player"
          />
        </ConveyorBelt>
      </div>

      {/* Information Panel */}
      <InformationPanel
        jingle={panelMetadata}
        isDocked={isPanelDocked}
        onDockToggle={() => setIsPanelDocked(!isPanelDocked)}
        onClose={() => setUserSelectedJingleId(null)} // Or close panel logic
        onReplay={displayedJingleId === activeJingleId ? handleReplay : undefined}
      />
    </div>
  );
}

