import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import type { YouTubePlayerRef } from '../../components/player/YouTubePlayer';
import type { YTPlayerState } from '../../types/youtube';

/**
 * Player state information
 */
export interface PlayerState {
  /** Current playback time in seconds */
  currentTime: number | null;
  /** Total video duration in seconds */
  duration: number | null;
  /** YouTube player state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued) */
  playerState: YTPlayerState | null;
  /** Whether the player is ready */
  isReady: boolean;
  /** Whether the video is currently playing */
  isPlaying: boolean;
  /** Whether the video is paused */
  isPaused: boolean;
  /** Whether the video has ended */
  isEnded: boolean;
  /** Whether the video is buffering */
  isBuffering: boolean;
}

/**
 * Hook return value with player controls and state
 */
export interface UseYouTubePlayerReturn {
  /** Current player state */
  state: PlayerState;
  /** Play the video */
  play: () => void;
  /** Pause the video */
  pause: () => void;
  /** Seek to a specific time (in seconds) */
  seekTo: (seconds: number) => void;
  /** Get current playback time (in seconds) */
  getCurrentTime: () => number | null;
  /** Get video duration (in seconds) */
  getDuration: () => number | null;
  /** Get YouTube player state */
  getPlayerState: () => YTPlayerState | null;
  /** Refresh the current state from the player */
  refreshState: () => void;
}

/**
 * Configuration options for the hook
 */
export interface UseYouTubePlayerOptions {
  /** Enable automatic polling of current time (default: true) */
  enablePolling?: boolean;
  /** Polling interval in milliseconds (default: 1000) */
  pollingInterval?: number;
  /** Callback when current time changes */
  onTimeUpdate?: (currentTime: number) => void;
  /** Callback when player state changes */
  onStateChange?: (state: YTPlayerState) => void;
  /** Callback when video ends */
  onEnd?: () => void;
}

/**
 * Hook to manage YouTube player state and controls
 * 
 * This hook provides a reactive interface to control and monitor a YouTube player.
 * It wraps the YouTubePlayerRef and provides state management, polling, and event callbacks.
 * 
 * @param playerRef - Ref to the YouTubePlayer component
 * @param options - Configuration options
 * @returns Player controls and state
 * 
 * @example
 * ```tsx
 * const playerRef = useRef<YouTubePlayerRef>(null);
 * const { state, play, pause, seekTo } = useYouTubePlayer(playerRef, {
 *   onTimeUpdate: (time) => console.log('Current time:', time),
 *   onStateChange: (state) => console.log('State:', state),
 * });
 * 
 * // Use in component
 * <YouTubePlayer ref={playerRef} videoIdOrUrl="dQw4w9WgXcQ" />
 * 
 * // Control player
 * <button onClick={() => state.isPlaying ? pause() : play()}>
 *   {state.isPlaying ? 'Pause' : 'Play'}
 * </button>
 * ```
 */
export function useYouTubePlayer(
  playerRef: RefObject<YouTubePlayerRef | null>,
  options: UseYouTubePlayerOptions = {}
): UseYouTubePlayerReturn {
  const {
    enablePolling = true,
    pollingInterval = 1000,
    onTimeUpdate,
    onStateChange,
    onEnd,
  } = options;

  const [state, setState] = useState<PlayerState>({
    currentTime: null,
    duration: null,
    playerState: null,
    isReady: false,
    isPlaying: false,
    isPaused: false,
    isEnded: false,
    isBuffering: false,
  });

  const lastPlayerStateRef = useRef<YTPlayerState | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  
  // Store callbacks in refs to avoid recreating refreshState when they change
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onStateChangeRef = useRef(onStateChange);
  const onEndRef = useRef(onEnd);
  
  // Update refs when callbacks change (without triggering refreshState recreation)
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onStateChangeRef.current = onStateChange;
    onEndRef.current = onEnd;
  }, [onTimeUpdate, onStateChange, onEnd]);

  /**
   * Refresh the current state from the player
   */
  const refreshState = useCallback(() => {
    if (!playerRef.current || !playerRef.current.isReady()) {
      setState((prev) => ({
        ...prev,
        isReady: false,
      }));
      return;
    }

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      const playerState = playerRef.current.getPlayerState();

      // Update state
      setState((prev) => {
        const newState: PlayerState = {
          currentTime,
          duration,
          playerState,
          isReady: true,
          isPlaying: playerState === 1,
          isPaused: playerState === 2,
          isEnded: playerState === 0,
          isBuffering: playerState === 3,
        };

        // Trigger callbacks for state changes (using refs to get latest values)
        if (playerState !== prev.playerState && playerState !== null) {
          if (onStateChangeRef.current) {
            onStateChangeRef.current(playerState);
          }

          // Trigger onEnd callback when video ends
          if (playerState === 0 && prev.playerState !== 0 && onEndRef.current) {
            onEndRef.current();
          }
        }

        // Trigger onTimeUpdate if time changed
        if (
          currentTime !== null &&
          currentTime !== prev.currentTime &&
          onTimeUpdateRef.current
        ) {
          onTimeUpdateRef.current(currentTime);
        }

        return newState;
      });

      lastPlayerStateRef.current = playerState;
    } catch (error) {
      console.warn('Error refreshing player state:', error);
    }
  }, [playerRef]); // Only depend on playerRef, which is stable

  /**
   * Set up polling to periodically update state
   */
  useEffect(() => {
    if (!enablePolling) {
      return;
    }

    // Initial refresh
    refreshState();

    // Set up polling interval
    pollingIntervalRef.current = window.setInterval(() => {
      refreshState();
    }, pollingInterval);

    return () => {
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enablePolling, pollingInterval, refreshState]);

  /**
   * Play the video
   */
  const play = useCallback(() => {
    if (playerRef.current?.isReady()) {
      playerRef.current.play();
      // Refresh state after a short delay to reflect the change
      setTimeout(() => refreshState(), 100);
    }
  }, [playerRef, refreshState]);

  /**
   * Pause the video
   */
  const pause = useCallback(() => {
    if (playerRef.current?.isReady()) {
      playerRef.current.pause();
      // Refresh state after a short delay to reflect the change
      setTimeout(() => refreshState(), 100);
    }
  }, [playerRef, refreshState]);

  /**
   * Seek to a specific time
   */
  const seekTo = useCallback(
    (seconds: number) => {
      if (playerRef.current?.isReady()) {
        playerRef.current.seekTo(seconds);
        // Refresh state after seeking
        setTimeout(() => refreshState(), 200);
      }
    },
    [playerRef, refreshState]
  );

  /**
   * Get current playback time
   */
  const getCurrentTime = useCallback((): number | null => {
    if (playerRef.current?.isReady()) {
      return playerRef.current.getCurrentTime();
    }
    return state.currentTime;
  }, [playerRef, state.currentTime]);

  /**
   * Get video duration
   */
  const getDuration = useCallback((): number | null => {
    if (playerRef.current?.isReady()) {
      return playerRef.current.getDuration();
    }
    return state.duration;
  }, [playerRef, state.duration]);

  /**
   * Get YouTube player state
   */
  const getPlayerState = useCallback((): YTPlayerState | null => {
    if (playerRef.current?.isReady()) {
      return playerRef.current.getPlayerState();
    }
    return state.playerState;
  }, [playerRef, state.playerState]);

  return {
    state,
    play,
    pause,
    seekTo,
    getCurrentTime,
    getDuration,
    getPlayerState,
    refreshState,
  };
}

