import React from 'react';
import JingleMetadata from '../player/JingleMetadata';
import type { JingleMetadataData } from '../player/JingleMetadata';

export interface InformationPanelProps {
  jingle: JingleMetadataData | null;
  isDocked: boolean; // Renamed concept: docked = visible/expanded, !docked = minimized
  onDockToggle: () => void;
  onClose?: () => void;
  onReplay?: () => void;
}

export default function InformationPanel({
  jingle,
  isDocked,
  onDockToggle,
  onClose,
  onReplay
}: InformationPanelProps) {
  
  return (
    <div 
      className={`info-panel-wrapper ${isDocked ? '' : 'info-panel-minimized'}`}
      onClick={!isDocked ? onDockToggle : undefined} // Click to expand if minimized
    >
      <div className="info-panel-header">
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#444' }}>
          {isDocked ? 'Información del Jingle' : 'Info'}
        </h3>
        <div className="info-panel-controls">
          <button 
            className="panel-btn" 
            onClick={(e) => { e.stopPropagation(); onDockToggle(); }}
            title={isDocked ? "Minimizar panel" : "Expandir panel"}
            style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}
          >
            {isDocked ? '−' : '+'}
          </button>
        </div>
      </div>
      
      {/* Content only fully visible when docked/expanded */}
      <div 
        className="info-panel-content"
        style={{ opacity: isDocked ? 1 : 0, transition: 'opacity 0.2s' }}
      >
        <JingleMetadata 
          jingle={jingle} 
          onReplay={onReplay}
          className="embedded-metadata"
        />
      </div>
    </div>
  );
}
