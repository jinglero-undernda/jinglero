import { useState, useEffect, useCallback } from 'react';

export interface UseScrollDetectionOptions {
  /** Scroll distance threshold before fade starts (default: 100px) */
  threshold?: number;
  /** Distance over which to fade (default: 200px) */
  fadeDistance?: number;
  /** Throttle delay in ms (default: 16ms for ~60fps) */
  throttleMs?: number;
}

export interface UseScrollDetectionReturn {
  /** Current scroll Y position */
  scrollY: number;
  /** Opacity value (1.0 to 0.0) based on scroll */
  opacity: number;
  /** Whether user has scrolled past threshold */
  isScrolled: boolean;
}

/**
 * Hook to detect scroll position and calculate fade opacity
 * 
 * Used for progressive reveal patterns, such as fading out a Filete sign
 * as the user scrolls down the page.
 * 
 * @example
 * ```tsx
 * const { opacity, isScrolled } = useScrollDetection({
 *   threshold: 100,
 *   fadeDistance: 200
 * });
 * 
 * <div style={{ opacity }}>Content that fades on scroll</div>
 * ```
 */
export function useScrollDetection(
  options: UseScrollDetectionOptions = {}
): UseScrollDetectionReturn {
  const {
    threshold = 100,
    fadeDistance = 200,
    throttleMs = 16,
  } = options;

  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    setScrollY(currentScrollY);
  }, []);

  useEffect(() => {
    // Throttle scroll events for performance
    let lastCallTime = 0;
    let rafId: number | null = null;

    const throttledHandleScroll = () => {
      const now = Date.now();
      if (now - lastCallTime >= throttleMs) {
        handleScroll();
        lastCallTime = now;
      } else {
        // Use requestAnimationFrame for smooth updates
        rafId = requestAnimationFrame(throttledHandleScroll);
      }
    };

    // Initial scroll position
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [handleScroll, throttleMs]);

  // Calculate opacity based on scroll position
  const isScrolled = scrollY > threshold;
  const fadeStart = threshold;
  const fadeEnd = threshold + fadeDistance;
  
  let opacity = 1.0;
  if (scrollY > fadeStart) {
    if (scrollY >= fadeEnd) {
      opacity = 0.0;
    } else {
      // Linear fade between fadeStart and fadeEnd
      const fadeProgress = (scrollY - fadeStart) / fadeDistance;
      opacity = 1.0 - fadeProgress;
    }
  }

  return {
    scrollY,
    opacity: Math.max(0, Math.min(1, opacity)), // Clamp between 0 and 1
    isScrolled,
  };
}

