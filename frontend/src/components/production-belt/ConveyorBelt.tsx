import React, { useRef, useEffect } from 'react';
import type { JingleTimelineItem } from '../player/JingleTimeline';
import JingleBox from './JingleBox';

export interface ConveyorBeltProps {
  pastJingles: JingleTimelineItem[];
  futureJingles: JingleTimelineItem[];
  selectedJingleId: string | null;
  onJingleSelect: (jingle: JingleTimelineItem, position: 'past' | 'future') => void;
  onSkipTo: (jingle: JingleTimelineItem) => void;
  children: React.ReactNode; // For the Central Processor (Video Player)
}

export default function ConveyorBelt({
  pastJingles,
  futureJingles,
  selectedJingleId,
  onJingleSelect,
  onSkipTo,
  children
}: ConveyorBeltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const processorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center the processor on mount or when jingles change?
  // Ideally, we want the "Active" area to be centered in the viewport.
  // Since the processor is the active area, we should scroll the container so the processor is in the middle.
  
  useEffect(() => {
    if (containerRef.current && processorRef.current) {
      const container = containerRef.current;
      const processor = processorRef.current;
      
      // Calculate position to center the processor
      // processor.offsetLeft is relative to the track (which is inside container)
      // We want: processor.offsetLeft - (container.width / 2) + (processor.width / 2)
      
      const centerPosition = processor.offsetLeft - (container.clientWidth / 2) + (processor.clientWidth / 2);
      
      container.scrollTo({
        left: centerPosition,
        behavior: 'smooth'
      });
    }
  }, [pastJingles.length]); // Re-center when past jingles grow (pushing processor to right)

  return (
    <div className="conveyor-section" ref={containerRef}>
      <div className="conveyor-track">
        {/* Past Section: Left */}
        <div className="past-section">
          {pastJingles.map((jingle) => (
            <JingleBox
              key={jingle.id}
              jingle={jingle}
              isSelected={selectedJingleId === jingle.id}
              position="past"
              onSelect={() => onJingleSelect(jingle, 'past')}
              onSkipTo={(e) => onSkipTo(jingle)}
            />
          ))}
        </div>

        {/* Central Processor: Center */}
        <div className="processor-section" ref={processorRef}>
          <div className="processor-frame">
            {children}
          </div>
        </div>

        {/* Future Section: Right */}
        <div className="future-section">
          {futureJingles.map((jingle) => (
            <JingleBox
              key={jingle.id}
              jingle={jingle}
              isSelected={selectedJingleId === jingle.id}
              position="future"
              onSelect={() => onJingleSelect(jingle, 'future')}
              onSkipTo={(e) => onSkipTo(jingle)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
