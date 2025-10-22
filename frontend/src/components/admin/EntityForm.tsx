import React, { useState } from 'react';

type Field = { name: string; label?: string; required?: boolean };

type Props = {
  type: string;
  fields: Field[];
  idFirst?: boolean; // if true, show id field first (fabricas)
  // optional edit support
  mode?: 'create' | 'edit';
  initialData?: Record<string, unknown>;
  onSave?: (payload: Record<string, unknown>) => Promise<unknown>;
  submitLabel?: string;
};

export default function EntityForm({ type, fields, idFirst, mode = 'create', initialData, onSave, submitLabel }: Props) {
  const initialState = fields.reduce((acc, f) => ({ ...acc, [f.name]: initialData && initialData[f.name] != null ? String(initialData[f.name]) : '' }), {} as Record<string, string>);
  const [form, setForm] = useState<Record<string, string>>(initialState);
  const [id, setId] = useState(initialData && initialData.id ? String(initialData.id) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Build payload: include all fields; set empty optional fields to null
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      const v = form[f.name];
      if (v === undefined || v === '') {
        payload[f.name] = null;
      } else {
        payload[f.name] = v;
      }
    });
    if (id) payload.id = id;

    try {
      if (mode === 'edit' && onSave) {
        await onSave(payload);
        setSuccess(submitLabel || 'Guardado');
      } else {
        const res = await fetch(`/api/admin/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`${res.status} ${res.statusText} - ${txt}`);
        }
        const data = await res.json();
        setSuccess(`Creado: ${data.id || JSON.stringify(data)}`);
        // reset
        setForm(initialState);
        setId('');
        // Navigate to edit page for the created entity
        if (data && data.id) {
          window.location.href = `/admin/dashboard/${type}/edit/${data.id}`;
        }
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={`entity-form entity-form-${type}`} onSubmit={handleSubmit}>
      <h3>{mode === 'edit' ? `Editar ${type}` : `Crear ${type}`}</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {idFirst && (
        <div>
          <label>
            Id
            <input value={id} onChange={(e) => setId(e.target.value)} required />
          </label>
        </div>
      )}
      {fields.map((f) => (
        <div key={f.name}>
          <label>
            {f.label || f.name}
            <input value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required={!!f.required} />
          </label>
        </div>
      ))}
      {!idFirst && (
        <div>
          <label>
            Id (opcional)
            <input value={id} onChange={(e) => setId(e.target.value)} />
          </label>
        </div>
      )}
      <div>
        <button type="submit" disabled={loading}>{loading ? (mode === 'edit' ? 'Guardando…' : 'Creando…') : (submitLabel || (mode === 'edit' ? 'Guardar' : 'Crear'))}</button>
      </div>
    </form>
  );
}
