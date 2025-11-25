import { useState, useEffect, useMemo, useRef } from 'react';
import { normalizeTimestampToSeconds } from '../utils/timestamp';
import type { JingleTimelineItem } from '../../components/player/JingleTimeline';

/**
 * Configuration options for the hook
 */
export interface UseJingleSyncOptions {
  /** Enable automatic syncing (default: true) */
  enabled?: boolean;
  /** Debounce delay in milliseconds before updating active jingle (default: 100) */
  debounceMs?: number;
  /** Callback when active jingle changes */
  onActiveJingleChange?: (activeJingle: JingleTimelineItem | null) => void;
}

/**
 * Hook return value
 */
export interface UseJingleSyncReturn {
  /** Currently active jingle based on playback time, or null if none */
  activeJingle: JingleTimelineItem | null;
  /** ID of the currently active jingle, or null if none */
  activeJingleId: string | null;
  /** Whether syncing is enabled */
  isEnabled: boolean;
}

/**
 * Hook to sync the active Jingle based on current playback time
 * 
 * This hook takes the current playback time from the YouTube player and determines
 * which jingle should be considered "active" based on the jingle timestamps.
 * 
 * Logic:
 * - Finds all jingles that started at or before the current time
 * - Returns the most recent one (last jingle that started <= current time)
 * - Returns null if current time is before the first jingle
 * 
 * @param currentTime - Current playback time in seconds (from player)
 * @param jingles - Array of jingles with timestamps, should be sorted by timestamp/order
 * @param options - Configuration options
 * @returns Active jingle information
 * 
 * @example
 * ```tsx
 * const { state } = useYouTubePlayer(playerRef);
 * const { activeJingle, activeJingleId } = useJingleSync(
 *   state.currentTime,
 *   jingles,
 *   {
 *     onActiveJingleChange: (jingle) => console.log('Active jingle:', jingle),
 *   }
 * );
 * ```
 */
export function useJingleSync(
  currentTime: number | null,
  jingles: JingleTimelineItem[],
  options: UseJingleSyncOptions = {}
): UseJingleSyncReturn {
  const {
    enabled = true,
    debounceMs = 100,
    onActiveJingleChange,
  } = options;

  const [activeJingle, setActiveJingle] = useState<JingleTimelineItem | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  
  // Store callback in ref to avoid recreating effect when callback changes
  const onActiveJingleChangeRef = useRef(onActiveJingleChange);
  
  // Update ref when callback changes (without triggering effect recreation)
  useEffect(() => {
    onActiveJingleChangeRef.current = onActiveJingleChange;
  }, [onActiveJingleChange]);

  // Normalize jingles timestamps to seconds and sort them
  const jinglesWithSeconds = useMemo(() => {
    return jingles
      .map((jingle) => {
        const timestampSeconds = normalizeTimestampToSeconds(jingle.timestamp);
        return {
          ...jingle,
          timestampSeconds: timestampSeconds ?? 0,
        };
      })
      .sort((a, b) => a.timestampSeconds - b.timestampSeconds);
  }, [jingles]);

  // Find the active jingle based on current playback time
  useEffect(() => {
    if (!enabled) {
      setActiveJingle(null);
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // If no current time, clear active jingle
    if (currentTime === null || currentTime < 0) {
      setActiveJingle(null);
      return;
    }

    // Debounce the update
    debounceTimerRef.current = window.setTimeout(() => {
      // Find all jingles that started at or before the current time
      const candidateJingles = jinglesWithSeconds.filter(
        (j) => j.timestampSeconds <= currentTime
      );

      // Get the last (most recent) jingle that started before or at current time
      const newActiveJingle = candidateJingles.length > 0
        ? candidateJingles[candidateJingles.length - 1]
        : null;

      // Update state if changed
      setActiveJingle((prev) => {
        if (prev?.id !== newActiveJingle?.id) {
          // Call the callback if provided (using ref to get latest value)
          if (onActiveJingleChangeRef.current) {
            onActiveJingleChangeRef.current(newActiveJingle);
          }
          return newActiveJingle;
        }
        return prev;
      });
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentTime, jinglesWithSeconds, enabled, debounceMs]); // Removed onActiveJingleChange from deps

  return {
    activeJingle,
    activeJingleId: activeJingle?.id ?? null,
    isEnabled: enabled,
  };
}

