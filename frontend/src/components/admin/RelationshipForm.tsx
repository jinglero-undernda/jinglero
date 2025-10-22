import React, { useEffect, useState } from 'react';

type NodeItem = { id: string; nombre?: string; name?: string; title?: string; [k: string]: unknown };

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
    fetch(`/api/admin/${startType}`)
      .then((r) => r.json())
      .then((d) => setStarts(d || []))
      .catch(() => setStarts([]));
    fetch(`/api/admin/${endType}`)
      .then((r) => r.json())
      .then((d) => setEnds(d || []))
      .catch(() => setEnds([]));
  }, [startType, endType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { start: presetStart || startId, end: presetEnd || endId, ...extra };
      const res = await fetch(`/api/admin/relationships/${relType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${txt}`);
      }
      await res.json();
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
                <option key={s.id} value={s.id}>{s.id} — {s.nombre || s.name || s.title}</option>
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
                <option key={s.id} value={s.id}>{s.id} — {s.nombre || s.name || s.title}</option>
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
