import React, { useState } from 'react';
import { adminApi } from '../../lib/api/client';

/**
 * Combine day, month, year into ISO date string
 */
function combineDate(day: number, month: number, year: number): string {
  const date = new Date(year, month - 1, day);
  return date.toISOString();
}

export default function FabricaForm() {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dateComponents, setDateComponents] = useState<{ day: number; month: number; year: number }>(() => {
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleDateComponentChange(component: 'day' | 'month' | 'year', value: number) {
    setDateComponents(prev => ({
      ...prev,
      [component]: value || (component === 'day' ? 1 : component === 'month' ? 1 : new Date().getFullYear())
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!youtubeUrl.trim()) return setError('La URL de YouTube es requerida');
    setCreating(true);

    try {
      const dateISO = combineDate(dateComponents.day, dateComponents.month, dateComponents.year);
      const data = await adminApi.createFabrica({
        title: title.trim() || undefined,
        youtubeUrl: youtubeUrl.trim(),
        date: dateISO,
        status: 'DRAFT'
      });

      setSuccess(`Creado: ${data.id}`);
      setTitle('');
      setYoutubeUrl('');
      const now = new Date();
      setDateComponents({ day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() });
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max="31"
              value={dateComponents.day || ''}
              onChange={(e) => handleDateComponentChange('day', parseInt(e.target.value) || 1)}
              placeholder="DD"
              style={{
                width: '50px',
                padding: '4px 8px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#fff',
                textAlign: 'center',
              }}
            />
            <span style={{ color: '#999', fontSize: '14px' }}>/</span>
            <input
              type="number"
              min="1"
              max="12"
              value={dateComponents.month || ''}
              onChange={(e) => handleDateComponentChange('month', parseInt(e.target.value) || 1)}
              placeholder="MM"
              style={{
                width: '50px',
                padding: '4px 8px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#fff',
                textAlign: 'center',
              }}
            />
            <span style={{ color: '#999', fontSize: '14px' }}>/</span>
            <input
              type="number"
              min="2000"
              max="2100"
              value={dateComponents.year || ''}
              onChange={(e) => handleDateComponentChange('year', parseInt(e.target.value) || new Date().getFullYear())}
              placeholder="YYYY"
              style={{
                width: '70px',
                padding: '4px 8px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#fff',
                textAlign: 'center',
              }}
            />
          </div>
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
