import React from 'react';
import type { JingleTimelineItem } from '../player/JingleTimeline';

export interface JingleBoxProps {
  jingle: JingleTimelineItem;
  isSelected: boolean;
  position: 'past' | 'future';
  onSelect: () => void;
  onSkipTo: (e: React.MouseEvent) => void;
}

export default function JingleBox({
  jingle,
  isSelected,
  position,
  onSelect,
  onSkipTo
}: JingleBoxProps) {
  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking skip
    onSkipTo(e);
  };

  return (
    <div 
      className={`jingle-box ${position} ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Jingle: ${jingle.title || 'Untitled'} at ${jingle.timestamp}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
          e.preventDefault();
        }
      }}
    >
      <div className="jingle-box-time">
        <span>{jingle.timestamp}</span>
        <button 
          className="jingle-box-skip-btn"
          onClick={handleSkip}
          title="Saltar a este jingle"
          aria-label="Play from start"
        >
          ▶
        </button>
      </div>
      
      <div className="jingle-box-title" title={jingle.title}>
        {jingle.title || 'Sin título'}
      </div>
      
      {/* Optional: Add artist or other metadata if available in JingleTimelineItem */}
      {jingle.jingleros && (
        <div style={{ fontSize: '11px', color: '#888', marginTop: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {Array.isArray(jingle.jingleros) 
            ? jingle.jingleros.map(j => j.stageName || j.name).join(', ') 
            : (jingle.jingleros.stageName || jingle.jingleros.name)}
        </div>
      )}
    </div>
  );
}



