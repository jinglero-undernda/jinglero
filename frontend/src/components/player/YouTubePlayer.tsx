import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { extractVideoId, buildEmbedUrl } from '../../lib/utils/youtube';
import type { YTPlayer, YTPlayerState } from '../../types/youtube';
import "../../styles/components/player.css";

/**
 * Player control methods exposed via ref
 */
export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number | null;
  getDuration: () => number | null;
  getPlayerState: () => YTPlayerState | null;
  isReady: () => boolean;
}

export interface YouTubePlayerProps {
  /** YouTube video ID or URL */
  videoIdOrUrl: string | null | undefined;
  /**
   * Width of the player (ignored, always 100%)
   * @deprecated Player maintains 16:9 aspect ratio automatically.
   */
  width?: number | string;
  /**
   * Height of the player (ignored, auto-calculated)
   * @deprecated Player maintains 16:9 aspect ratio automatically.
   */
  height?: number | string;
  /** Autoplay the video (default: false) */
  autoplay?: boolean;
  /** Start time in seconds (default: 0) */
  startSeconds?: number;
  /** Show video controls (default: true) */
  controls?: boolean;
  /** Show related videos (default: false) */
  showRelatedVideos?: boolean;
  /** Enable JavaScript API (default: true) */
  enablejsapi?: boolean;
  /** Called when the player is ready */
  onReady?: () => void;
  /** Called when player state changes */
  onStateChange?: (state: YTPlayerState) => void;
  /** Called when an error occurs */
  onError?: (error: number) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * YouTube IFrame Player Component
 *
 * Uses the YouTube IFrame API to embed and control YouTube videos.
 * Requires the YouTube IFrame API script to be loaded (typically via script tag in index.html).
 *
 * **Aspect Ratio:** Always maintains a 16:9 aspect ratio.
 * **Responsive:** Scales proportionally at all viewport sizes.
 * **Preview Thumbnail:** Preview image also respects aspect ratio.
 *
 * @example
 * const playerRef = useRef<YouTubePlayerRef>(null);
 *
 * <YouTubePlayer
 *   ref={playerRef}
 *   videoIdOrUrl="dQw4w9WgXcQ"
 *   onReady={() => console.log('Player ready')}
 * />
 */
const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  (
    {
      videoIdOrUrl,
      // width, height, // no longer used for rendering
      autoplay = false,
      startSeconds = 0,
      controls = true,
      showRelatedVideos = false,
      enablejsapi = true,
      onReady,
      onStateChange,
      onError,
      className,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const [isApiReady, setIsApiReady] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const playerIdRef = useRef<string>(`youtube-player-${Date.now()}-${Math.random()}`);

    // Load YouTube IFrame API script
    useEffect(() => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        setIsApiReady(true);
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        // Script is loading, wait for it
        const checkApi = setInterval(() => {
          if (window.YT && window.YT.Player) {
            setIsApiReady(true);
            clearInterval(checkApi);
          }
        }, 100);

        return () => clearInterval(checkApi);
      }

      // Load the API script
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.defer = true;

      // Handle API ready callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        setIsApiReady(true);
      };

      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (window.onYouTubeIframeAPIReady === previousCallback) {
          delete window.onYouTubeIframeAPIReady;
        }
      };
    }, []);

    // Initialize player when API is ready
    useEffect(() => {
      if (!isApiReady || !containerRef.current) return;

      const videoId = extractVideoId(videoIdOrUrl);
      if (!videoId) {
        setError('Invalid YouTube video ID or URL');
        return;
      }

      try {
        const player = new window.YT.Player(containerRef.current, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            start: startSeconds > 0 ? Math.floor(startSeconds) : undefined,
            controls: controls ? 1 : 0,
            rel: showRelatedVideos ? 1 : 0,
            enablejsapi: enablejsapi ? 1 : 0,
            modestbranding: 1,
            playsinline: 1, // Required for iOS to play inline instead of opening YouTube app
            origin: window.location.origin, // Helps with security and mobile compatibility
          },
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              setIsPlayerReady(true);
              setError(null);
              onReady?.();
            },
            onStateChange: (event) => {
              onStateChange?.(event.data);
            },
            onError: (event) => {
              setError(`YouTube player error: ${event.data}`);
              onError?.(event.data);
            },
          },
        });

        return () => {
          try {
            if (player && typeof player.destroy === 'function') {
              player.destroy();
            }
          } catch (e) {
            console.warn('Error destroying YouTube player:', e);
          }
          playerRef.current = null;
          setIsPlayerReady(false);
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize YouTube player';
        setError(errorMessage);
      }
    }, [isApiReady, videoIdOrUrl, autoplay, startSeconds, controls, showRelatedVideos, enablejsapi]);

    // Update video if videoIdOrUrl changes
    useEffect(() => {
      if (!isPlayerReady || !playerRef.current) return;

      const videoId = extractVideoId(videoIdOrUrl);
      if (!videoId) return;

      try {
        // Get current video ID from player
        const currentVideoId = playerRef.current.getVideoData()?.video_id;
        
        // Only load new video if it's different
        if (currentVideoId !== videoId) {
          playerRef.current.loadVideoById(videoId, startSeconds > 0 ? Math.floor(startSeconds) : undefined);
        } else if (startSeconds > 0) {
          // Same video but different start time
          playerRef.current.seekTo(startSeconds, false);
        }
      } catch (err) {
        console.warn('Error updating YouTube player video:', err);
      }
    }, [isPlayerReady, videoIdOrUrl, startSeconds]);

    // Expose player control methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          try {
            playerRef.current?.playVideo();
          } catch (err) {
            console.warn('Error playing video:', err);
          }
        },
        pause: () => {
          try {
            playerRef.current?.pauseVideo();
          } catch (err) {
            console.warn('Error pausing video:', err);
          }
        },
        seekTo: (seconds: number) => {
          try {
            playerRef.current?.seekTo(seconds, true);
          } catch (err) {
            console.warn('Error seeking video:', err);
          }
        },
        getCurrentTime: () => {
          try {
            return playerRef.current?.getCurrentTime() ?? null;
          } catch (err) {
            console.warn('Error getting current time:', err);
            return null;
          }
        },
        getDuration: () => {
          try {
            return playerRef.current?.getDuration() ?? null;
          } catch (err) {
            console.warn('Error getting duration:', err);
            return null;
          }
        },
        getPlayerState: () => {
          try {
            return playerRef.current?.getPlayerState() ?? null;
          } catch (err) {
            console.warn('Error getting player state:', err);
            return null;
          }
        },
        isReady: () => isPlayerReady,
      }),
      [isPlayerReady]
    );

    const videoId = extractVideoId(videoIdOrUrl);

    // Error state
    if (error) {
      return (
        <div className={className} style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              paddingBottom: "56.25%",
              height: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              <p style={{ color: "#d32f2f", margin: "0 0 12px 0" }}>Error: {error}</p>
              {videoId && (
                <a
                  href={buildEmbedUrl(videoId) || `https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1976d2", textDecoration: "underline" }}
                >
                  Abrir en YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }
    // No video id (empty state)
    if (!videoId) {
      return (
        <div className={className} style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              paddingBottom: "56.25%",
              height: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              <p style={{ color: "#666", margin: 0 }}>
                No se proporcionó un ID de video válido
              </p>
            </div>
          </div>
        </div>
      );
    }
    // Main/playing/loading state
    return (
      <div className={className ? `fabrica-player-area ${className}` : "fabrica-player-area"}>
        <div className="fabrica-player-aspect">
          {/* Loading overlay (covers video area, matches aspect ratio) */}
          {!isApiReady && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "#f5f5f5", zIndex: 1
            }}>
              <p>Cargando reproductor...</p>
            </div>
          )}
          <div
            ref={containerRef}
            id={playerIdRef.current}
            className="fabrica-player-iframe"
            // Remove style as position/size are controlled by .fabrica-player-iframe
          />
        </div>
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;

