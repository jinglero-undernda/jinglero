import React from 'react';
import type { JingleMetadataData } from '../player/JingleMetadata';
import type { Jingle } from '../../types';
import { getEntityRoute } from '../../lib/utils/entityDisplay';

export interface MachineControlPanelProps {
  jingle: JingleMetadataData | null;
  fullJingleData: Jingle | null;
  onSkipTo: () => void;
}

export default function MachineControlPanel({
  jingle,
  fullJingleData,
  onSkipTo
}: MachineControlPanelProps) {
  // Extract boolean properties from full jingle data
  const isJinglazo = fullJingleData?.isJinglazo ?? false;
  const isJDD = fullJingleData?.isJinglazoDelDia ?? false;
  const isPrecario = fullJingleData?.isPrecario ?? false;
  const isVivo = fullJingleData?.isLive ?? false;
  const isClasico = fullJingleData?.isRepeat ?? false;

  // Extract data for fields
  const jingleTitle = jingle?.title || '';
  const cancionTitle = jingle?.cancion?.title || '';
  const cancionId = jingle?.cancion?.id || fullJingleData?.cancionId;
  
  // Format autores (suppliers)
  const autores = jingle?.autores 
    ? (Array.isArray(jingle.autores) ? jingle.autores : [jingle.autores])
    : [];
  const autorNames = autores.length > 0
    ? autores.map(a => a.stageName || a.name).filter(Boolean).join(', ')
    : '';
  const firstAutorId = autores.length > 0 ? autores[0].id : null;
  
  // Format jingleros (workers)
  const jingleros = jingle?.jingleros
    ? (Array.isArray(jingle.jingleros) ? jingle.jingleros : [jingle.jingleros])
    : [];
  const jingleroNames = jingleros.length > 0
    ? jingleros.map(j => j.stageName || j.name).filter(Boolean).join(', ')
    : '';
  const firstJingleroId = jingleros.length > 0 ? jingleros[0].id : null;
  
  // Format tematicas (tags)
  const tematicas = jingle?.tematicas || [];
  const tematicaNames = tematicas.length > 0
    ? tematicas.map(t => t.name).filter(Boolean).join(', ')
    : '';
  const firstTematicaId = tematicas.length > 0 ? tematicas[0].id : null;

  // Handler for opening entity pages in new tabs
  const handleOpenEntity = (entityType: 'cancion' | 'artista' | 'jingle' | 'tematica', entityId: string | null) => {
    if (!entityId) return;
    const route = getEntityRoute(entityType, entityId);
    window.open(route, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="machine-control-panel">
      {/* Decorative Pipes and Gauges */}
      <div className="control-panel-pipes">
        <div className="pipe-gauge pipe-gauge-green">
          <div className="gauge-needle" style={{ transform: 'rotate(45deg)' }}></div>
        </div>
        <div className="pipe-gauge pipe-gauge-red">
          <div className="gauge-needle" style={{ transform: 'rotate(-30deg)' }}></div>
        </div>
        <div className="steam-effect"></div>
      </div>

      {/* Title */}
      <div className="control-panel-title">
        <h2>MACHINE CONTROL PANEL</h2>
      </div>

      {/* Top Section - Boolean Indicator Lights */}
      <div className="control-panel-indicators">
        <div className={`indicator-light ${isJinglazo ? 'indicator-on' : 'indicator-off'}`}>
          <div className="indicator-label">JINGLAZO</div>
        </div>
        <div className={`indicator-light ${isJDD ? 'indicator-on' : 'indicator-off'}`}>
          <div className="indicator-label">JDD</div>
        </div>
        <div className={`indicator-light ${isPrecario ? 'indicator-on' : 'indicator-off'}`}>
          <div className="indicator-label">PRECARIO</div>
        </div>
        <div className={`indicator-light ${isVivo ? 'indicator-on' : 'indicator-off'}`}>
          <div className="indicator-label">VIVO</div>
        </div>
        <div className={`indicator-light ${isClasico ? 'indicator-on' : 'indicator-off'}`}>
          <div className="indicator-label">CLÁSICO</div>
        </div>
      </div>

      {/* Middle Section - Information Fields */}
      <div className="control-panel-fields">
        {/* SEGMENT / JINGLE */}
        <div className="control-field-row">
          <div className="control-field">
            <label>SEGMENT:</label>
            <div className="field-value">{jingleTitle || '[PLACEHOLDER TITLE]'}</div>
          </div>
          <button 
            className="control-action-btn skip-to-btn"
            onClick={onSkipTo}
            disabled={!jingle}
            title="Saltar a este jingle"
          >
            &gt;&gt;
          </button>
        </div>

        {/* RAW MATERIAL / CANCION */}
        <div className="control-field-row">
          <div className="control-field">
            <label>RAW MATERIAL:</label>
            <div className="field-value">{cancionTitle || '[PLACEHOLDER SONG]'}</div>
          </div>
          <button
            className="control-action-btn"
            onClick={() => handleOpenEntity('cancion', cancionId || null)}
            disabled={!cancionId}
            title="Abrir canción"
          >
            VER
          </button>
        </div>

        {/* SUPPLIER / AUTOR */}
        <div className="control-field-row">
          <div className="control-field">
            <label>SUPPLIER:</label>
            <div className="field-value">{autorNames || '[PLACEHOLDER AUTHOR]'}</div>
          </div>
          <button
            className="control-action-btn"
            onClick={() => handleOpenEntity('artista', firstAutorId)}
            disabled={!firstAutorId}
            title="Abrir proveedor"
          >
            VER
          </button>
        </div>

        {/* WORKER / JINGLERO */}
        <div className="control-field-row">
          <div className="control-field">
            <label>WORKER:</label>
            <div className="field-value">{jingleroNames || '[PLACEHOLDER JINGLERO]'}</div>
          </div>
          <button
            className="control-action-btn"
            onClick={() => handleOpenEntity('artista', firstJingleroId)}
            disabled={!firstJingleroId}
            title="Abrir jinglero"
          >
            VER
          </button>
        </div>

        {/* TAGS / TEMATICAS */}
        <div className="control-field-row">
          <div className="control-field">
            <label>TAGS:</label>
            <div className="field-value">{tematicaNames || '[PLACEHOLDER TOPICS]'}</div>
          </div>
          <button
            className="control-action-btn"
            onClick={() => handleOpenEntity('tematica', firstTematicaId)}
            disabled={!firstTematicaId}
            title="Abrir temáticas"
          >
            VER
          </button>
        </div>
      </div>

      {/* Bottom Section - Vent and Indicator Lights */}
      <div className="control-panel-bottom">
        <div className="control-panel-vent"></div>
        <div className="control-panel-status-lights">
          <div className="status-light status-light-yellow"></div>
          <div className="status-light status-light-red"></div>
          <div className="status-light status-light-green"></div>
        </div>
      </div>
    </div>
  );
}

