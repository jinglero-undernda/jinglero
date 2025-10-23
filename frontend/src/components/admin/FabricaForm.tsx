import React, { useState } from 'react';
import { adminApi } from '../../lib/api/client';

export default function FabricaForm() {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [date, setDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!youtubeUrl.trim()) return setError('La URL de YouTube es requerida');
    setCreating(true);

    try {
      const data = await adminApi.createFabrica({
        title: title.trim() || null,
        youtubeUrl: youtubeUrl.trim(),
        date: date.trim() || new Date().toISOString().split('T')[0],
        status: 'DRAFT'
      });

      setSuccess(`Creado: ${data.id}`);
      setTitle('');
      setYoutubeUrl('');
      setDate('');
    } catch (err: any) {
      setError(err?.message || String(err));
      console.warn('Create Fabrica failed', err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <form className="admin-fabrica-form" onSubmit={handleSubmit}>
      <h3>Crear Fábrica</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div>
        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          URL de YouTube *
          <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Fecha
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <div>
        <button type="submit" disabled={creating}>
          {creating ? 'Creando…' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
