import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api/client';
import { type Usuario, type Artista, type Cancion, type Fabrica, type Tematica, type Jingle } from '../../types';

type NodeItem = Usuario | Artista | Cancion | Fabrica | Tematica | Jingle;

type Props = {
  relType: string; // e.g. 'autor_de'
  startType: string; // e.g. 'artistas'
  endType: string; // e.g. 'canciones'
  fields?: { name: string; label?: string }[]; // extra props like status, order
  presetStart?: string; // preselect start id
  presetEnd?: string; // preselect end id
  hideStart?: boolean; // hide the start selector when preset
  hideEnd?: boolean; // hide the end selector when preset
};

export default function RelationshipForm({ relType, startType, endType, fields = [], presetStart, presetEnd, hideStart, hideEnd }: Props) {
  const [starts, setStarts] = useState<NodeItem[]>([]);
  const [ends, setEnds] = useState<NodeItem[]>([]);
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let startData: NodeItem[], endData: NodeItem[];
        
        switch (startType) {
          case 'usuarios':
            startData = await adminApi.getUsuarios();
            break;
          case 'artistas':
            startData = await adminApi.getArtistas();
            break;
          case 'canciones':
            startData = await adminApi.getCanciones();
            break;
          case 'fabricas':
            startData = await adminApi.getFabricas();
            break;
          case 'tematicas':
            startData = await adminApi.getTematicas();
            break;
          case 'jingles':
            startData = await adminApi.getJingles();
            break;
          default:
            startData = [];
        }

        switch (endType) {
          case 'usuarios':
            endData = await adminApi.getUsuarios();
            break;
          case 'artistas':
            endData = await adminApi.getArtistas();
            break;
          case 'canciones':
            endData = await adminApi.getCanciones();
            break;
          case 'fabricas':
            endData = await adminApi.getFabricas();
            break;
          case 'tematicas':
            endData = await adminApi.getTematicas();
            break;
          case 'jingles':
            endData = await adminApi.getJingles();
            break;
          default:
            endData = [];
        }

        setStarts(startData);
        setEnds(endData);
      } catch (error) {
        setStarts([]);
        setEnds([]);
      }
    };

    fetchData();
  }, [startType, endType]);

  const getDisplayName = (item: NodeItem): string => {
    if ('displayName' in item) return item.displayName;
    if ('stageName' in item) return item.stageName || item.name || '';
    if ('title' in item) return item.title || '';
    if ('name' in item) return item.name;
    if ('email' in item) return item.email;
    return item.id;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload = { 
        start: presetStart || startId, 
        end: presetEnd || endId, 
        type: relType,
        properties: extra 
      };
      await adminApi.createRelationship(payload);
      setSuccess(`Relacion creada`);
      if (!presetStart) setStartId('');
      if (!presetEnd) setEndId('');
      setExtra({});
    } catch (err) {
      setError((err as Error)?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={`relationship-form relationship-${relType}`} onSubmit={handleSubmit}>
      <h3>Crear relación: {relType}</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div>
        <label>
          {startType}
          {!hideStart && (
            <select value={startId} onChange={(e) => setStartId(e.target.value)} required>
              <option value="">-- seleccionar --</option>
              {starts.map((s) => (
                <option key={s.id} value={s.id}>{s.id} — {getDisplayName(s)}</option>
              ))}
            </select>
          )}
          {presetStart && <input readOnly value={presetStart} />}
        </label>
      </div>
      <div>
        <label>
          {endType}
          {!hideEnd && (
            <select value={endId} onChange={(e) => setEndId(e.target.value)} required>
              <option value="">-- seleccionar --</option>
              {ends.map((s) => (
                <option key={s.id} value={s.id}>{s.id} — {getDisplayName(s)}</option>
              ))}
            </select>
          )}
          {presetEnd && <input readOnly value={presetEnd} />}
        </label>
      </div>
      {fields.map((f) => (
        <div key={f.name}>
          <label>
            {f.label || f.name}
            <input value={extra[f.name] || ''} onChange={(e) => setExtra({ ...extra, [f.name]: e.target.value })} />
          </label>
        </div>
      ))}
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Creando…' : 'Crear relación'}</button>
      </div>
    </form>
  );
}
