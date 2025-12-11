import React, { useRef } from 'react';
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

  return (
    <div className="conveyor-belt-container" ref={containerRef}>
      <div className="conveyor-belt-surface">
        <div className="conveyor-belt-track">
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
      {/* Industrial background elements */}
      <div className="conveyor-belt-background">
        <div className="belt-gear belt-gear-left"></div>
        <div className="belt-gear belt-gear-right"></div>
      </div>
    </div>
  );
}
