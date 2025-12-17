import React, { useState, useEffect, useRef } from 'react';
import { useYouTubePlayer } from '../../lib/hooks/useYouTubePlayer';
import YouTubePlayer from '../player/YouTubePlayer';
import type { YouTubePlayerRef } from '../player/YouTubePlayer';
import '../../styles/components/crt-monitor-player.css';
import playerImage from '../../assets/images/Player2.png';

export interface CRTMonitorPlayerProps {
  /** YouTube video ID or URL */
  videoIdOrUrl: string | null | undefined;
  /** Start time in seconds (default: 0) */
  startSeconds?: number;
  /** Autoplay the video (default: false) */
  autoplay?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Custom skip back handler (default: seek back 10 seconds) */
  onSkipBack?: () => void;
  /** Custom skip forward handler (default: seek forward 10 seconds) */
  onSkipForward?: () => void;
  /** Skip interval in seconds (default: 10) */
  skipInterval?: number;
}

/**
 * CRT Monitor Player Component
 * 
 * A reusable video player component styled as a CRT monitor with industrial controls.
 * Can be used as a standalone player or integrated into other components.
 * 
 * @example
 * ```tsx
 * <CRTMonitorPlayer
 *   videoIdOrUrl="dQw4w9WgXcQ"
 *   startSeconds={30}
 *   autoplay={false}
 * />
 * ```
 */
export default function CRTMonitorPlayer({
  videoIdOrUrl,
  startSeconds = 0,
  autoplay = false,
  className,
  style,
  onSkipBack,
  onSkipForward,
  skipInterval = 10,
}: CRTMonitorPlayerProps) {
  // Player State
  const playerRef = useRef<YouTubePlayerRef>(null);
  const { state: playerState, play, pause } = useYouTubePlayer(playerRef);

  // Refs for size calculation
  const containerRef = useRef<HTMLDivElement>(null);
  const monitorSectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const playerRef_debug = useRef<HTMLDivElement>(null);

  // Calculate sizes in pixels and set CSS custom properties
  useEffect(() => {
    const calculateSizes = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Constants
        const IMAGE_WIDTH = 807;
        const IMAGE_HEIGHT = 590;
        const PLAYER_WIDTH = 800;
        const PLAYER_HEIGHT = 450;
        const IMAGE_ASPECT = IMAGE_WIDTH / IMAGE_HEIGHT; // 1.3688
        const IMAGE_INVERSE_ASPECT = IMAGE_HEIGHT / IMAGE_WIDTH; // 0.7308
        
        // Calculate monitor/image size in pixels
        const monitorWidthOption1 = 0.5 * containerWidth;
        const monitorWidthOption2 = 0.8 * containerHeight * IMAGE_ASPECT;
        const monitorWidth = Math.min(monitorWidthOption1, monitorWidthOption2);
        
        const monitorHeightOption1 = 0.5 * containerWidth * IMAGE_INVERSE_ASPECT;
        const monitorHeightOption2 = 0.8 * containerHeight;
        const monitorHeight = Math.min(monitorHeightOption1, monitorHeightOption2);
        
        // Calculate player size in pixels
        const playerWidth = monitorWidth * (PLAYER_WIDTH / IMAGE_WIDTH);
        const playerHeight = monitorHeight * (PLAYER_HEIGHT / IMAGE_HEIGHT);
        
        // Calculate controls container position (proportional to image)
        // Y = 557px from top, X-first = 570px, X-last = 705px (on 807×590 image)
        const X_FIRST = 570;
        const X_LAST = 705;
        const Y = 557;
        
        const containerCenterX = (X_FIRST + X_LAST) / 2; // 637.5px
        const containerCenterY = Y; // 557px
        const imageCenterX = IMAGE_WIDTH / 2; // 403.5px
        const imageCenterY = IMAGE_HEIGHT / 2; // 295px
        
        // Calculate proportional offsets from image center
        const controlsCenterXOffset = monitorWidth * ((containerCenterX - imageCenterX) / IMAGE_WIDTH);
        const controlsCenterYOffset = monitorHeight * ((containerCenterY - imageCenterY) / IMAGE_HEIGHT);
        const controlsContainerWidth = monitorWidth * ((X_LAST - X_FIRST) / IMAGE_WIDTH); // 135/807 of image width
        
        // Set CSS custom properties as pixel values
        if (containerRef.current) {
          containerRef.current.style.setProperty('--monitor-width', `${monitorWidth}px`);
          containerRef.current.style.setProperty('--monitor-height', `${monitorHeight}px`);
          containerRef.current.style.setProperty('--player-width', `${playerWidth}px`);
          containerRef.current.style.setProperty('--player-height', `${playerHeight}px`);
        }
        
        // Set control positioning variables on monitor section where they're used
        if (monitorSectionRef.current) {
          monitorSectionRef.current.style.setProperty('--controls-center-x-offset', `${controlsCenterXOffset}px`);
          monitorSectionRef.current.style.setProperty('--controls-center-y-offset', `${controlsCenterYOffset}px`);
          monitorSectionRef.current.style.setProperty('--controls-container-width', `${controlsContainerWidth}px`);
        }
      }
    };

    calculateSizes();
    const resizeObserver = new ResizeObserver(calculateSizes);
    
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Player controls
  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSkipBack = () => {
    if (onSkipBack) {
      onSkipBack();
      return;
    }
    
    // Default: seek back by skipInterval
    if (playerRef.current && playerState.currentTime !== null) {
      const newTime = Math.max(0, playerState.currentTime - skipInterval);
      playerRef.current.seekTo(newTime);
    }
  };

  const handleSkipForward = () => {
    if (onSkipForward) {
      onSkipForward();
      return;
    }
    
    // Default: seek forward by skipInterval
    if (playerRef.current && playerState.currentTime !== null && playerState.duration !== null) {
      const newTime = Math.min(playerState.duration, playerState.currentTime + skipInterval);
      playerRef.current.seekTo(newTime);
    }
  };

  // Determine status indicator state
  const statusIndicatorState = playerState.isBuffering ? 'buffering' : 
                                playerState.isPaused ? 'paused' : 
                                'playing';

  return (
    <div 
      ref={containerRef}
      className={`crt-monitor-player-container ${className || ''}`} 
      style={style}
    >
      {/* CRT Monitor Section */}
      <div 
        ref={monitorSectionRef}
        className="crt-monitor-player-section"
        style={{ '--player-image': `url(${playerImage})` } as React.CSSProperties}
      >
        <div className="crt-monitor-player-frame" ref={imageRef}>
          <div className="crt-monitor-player-screen" ref={playerRef_debug}>
            <YouTubePlayer
              ref={playerRef}
              videoIdOrUrl={videoIdOrUrl}
              startSeconds={startSeconds}
              autoplay={autoplay}
              className="crt-monitor-player"
            />
          </div>
        </div>
        
        {/* External Controls Below Monitor */}
        <div className="crt-monitor-player-controls">
          <button 
            className="crt-monitor-control-btn skip-back-btn"
            onClick={handleSkipBack}
            title="Retroceder"
            aria-label="Retroceder"
          >
            ⏮
          </button>
          <button 
            className="crt-monitor-control-btn play-pause-btn"
            onClick={handlePlayPause}
            title={playerState.isPlaying ? "Pausar" : "Reproducir"}
            aria-label={playerState.isPlaying ? "Pausar" : "Reproducir"}
          >
            {playerState.isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            className="crt-monitor-control-btn skip-forward-btn"
            onClick={handleSkipForward}
            title="Avanzar"
            aria-label="Avanzar"
          >
            ⏭
          </button>
          {/* Status Indicator Light */}
          <div className={`status-indicator status-indicator-${statusIndicatorState}`}>
            <div className="indicator-glow"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

