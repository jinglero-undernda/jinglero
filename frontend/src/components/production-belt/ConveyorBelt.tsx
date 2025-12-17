import { useRef, useEffect } from 'react';
import type { JingleTimelineItem } from '../player/JingleTimeline';
import type { Jingle } from '../../types';
import JingleBox from './JingleBox';

export interface ConveyorBeltProps {
  allJingles: JingleTimelineItem[];
  fullJingleData: Record<string, Jingle>;
  activeJingleId: string | null;
  selectedJingleId: string | null;
  onJingleSelect: (jingle: JingleTimelineItem) => void;
  onSkipTo: (jingle: JingleTimelineItem) => void;
}

export default function ConveyorBelt({
  allJingles,
  fullJingleData,
  activeJingleId,
  selectedJingleId,
  onJingleSelect,
  onSkipTo
}: ConveyorBeltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate and set track width and container width for background image
  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const updateWidths = () => {
      const track = trackRef.current;
      const container = containerRef.current;
      if (track && container) {
        // Find the parent section element
        const section = container.closest('.conveyor-belt-section') as HTMLElement;
        if (section) {
          const trackWidth = track.scrollWidth;
          const containerWidth = container.clientWidth;
          const boxBottomPadding = containerWidth * 0.09; // 9% of container width
          section.style.setProperty('--track-width', `${trackWidth}px`);
          section.style.setProperty('--container-width', `${containerWidth}px`);
          section.style.setProperty('--box-bottom-padding', `${boxBottomPadding}px`);
        }
      }
    };

    // Initial calculation
    updateWidths();

    // Update on window resize
    window.addEventListener('resize', updateWidths);
    
    // Update when track or container size changes
    const resizeObserver = new ResizeObserver(updateWidths);
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateWidths);
      resizeObserver.disconnect();
    };
  }, [allJingles]);

  // Auto-scroll to active jingle when it changes
  useEffect(() => {
    if (!activeJingleId || !containerRef.current || !trackRef.current) return;

    const container = containerRef.current;
    const track = trackRef.current;
    
    // Find the active jingle box by finding the index
    const activeIndex = allJingles.findIndex(j => j.id === activeJingleId);
    if (activeIndex === -1) return;

    // Get all boxes
    const boxes = track.children;
    if (activeIndex >= boxes.length) return;
    
    const activeBox = boxes[activeIndex] as HTMLElement;
    if (!activeBox) return;

    // Get container and box positions
    const containerRect = container.getBoundingClientRect();
    const boxRect = activeBox.getBoundingClientRect();
    
    // Calculate target position: box should be next to control panel (33% from right)
    const controlPanelWidth = containerRect.width * 0.33;
    const boxWidth = boxRect.width;
    const gap = 25; // Gap between boxes
    const targetX = containerRect.width - controlPanelWidth - boxWidth - gap;
    
    // Calculate scroll position needed
    const boxOffsetLeft = activeBox.offsetLeft;
    const currentScrollLeft = container.scrollLeft;
    const scrollNeeded = boxOffsetLeft - targetX + currentScrollLeft;
    
    // Smooth scroll to position
    container.scrollTo({
      left: Math.max(0, scrollNeeded),
      behavior: 'smooth'
    });
  }, [activeJingleId, allJingles]);

  return (
    <div className="conveyor-belt-container" ref={containerRef}>
      <div className="conveyor-belt-surface">
        <div className="conveyor-belt-track" ref={trackRef}>
          {allJingles.map((jingle) => {
            // Merge timeline item with full jingle data if available
            const fullJingle = fullJingleData[jingle.id];
            const jingleWithData = fullJingle 
              ? { ...jingle, displayPrimary: fullJingle.displayPrimary }
              : jingle;
            
            return (
              <JingleBox
                key={jingle.id}
                jingle={jingleWithData}
                isPlaying={activeJingleId === jingle.id}
                isSelected={selectedJingleId === jingle.id}
                onSelect={() => onJingleSelect(jingle)}
                onSkipTo={(e) => {
                  e.stopPropagation();
                  onSkipTo(jingle);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
