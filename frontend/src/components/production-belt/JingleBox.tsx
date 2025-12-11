import React from 'react';
import type { JingleTimelineItem } from '../player/JingleTimeline';

export interface JingleBoxProps {
  jingle: JingleTimelineItem;
  isPlaying: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onSkipTo: (e: React.MouseEvent) => void;
}

export default function JingleBox({
  jingle,
  isPlaying,
  isSelected,
  onSelect,
  onSkipTo
}: JingleBoxProps) {
  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking skip
    onSkipTo(e);
  };

  // Get display label - use displayPrimary if available, fallback to title
  // displayPrimary might be on the full Jingle object, not the timeline item
  const displayPrimary = (jingle as any).displayPrimary;
  const displayLabel = displayPrimary 
    ? String(displayPrimary).replace(/^[\p{Emoji}]/u, '').trim() // Remove emoji if present
    : jingle.title || 'Sin título';

  return (
    <div 
      className={`jingle-box-metallic ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Jingle: ${displayLabel} at ${jingle.timestamp}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
          e.preventDefault();
        }
      }}
    >
      {/* Indicator Lights */}
      <div className="jingle-box-indicators">
        <div className={`jingle-indicator-light playing-indicator ${isPlaying ? 'indicator-on' : 'indicator-off'}`}>
          <div className="indicator-glow"></div>
        </div>
        <div className={`jingle-indicator-light selected-indicator ${isSelected ? 'indicator-on' : 'indicator-off'}`}>
          <div className="indicator-glow"></div>
        </div>
      </div>

      {/* Box Label */}
      <div className="jingle-box-label" title={displayLabel}>
        {displayLabel}
      </div>

      {/* Skip Button */}
      <button 
        className="jingle-box-skip-btn"
        onClick={handleSkip}
        title="Saltar a este jingle"
        aria-label="Saltar a este jingle"
      >
        ▶
      </button>
    </div>
  );
}



