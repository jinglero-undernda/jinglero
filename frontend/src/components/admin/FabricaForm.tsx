import React, { useState } from 'react';

export default function FabricaForm() {
  const [nombre, setNombre] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!nombre.trim()) return setError('El nombre es requerido');
    setCreating(true);

    try {
      // The backend seed API is currently read-only in this repo. We attempt a POST
      // for when a write-capable endpoint exists. If it returns 404/405 we surface an error.
      const res = await fetch('/api/seed/fabricas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
      }

      const data = await res.json();
      setSuccess(`Creado: ${data.id || data.nombre || JSON.stringify(data)}`);
      setNombre('');
    } catch (err: any) {
      // If backend doesn't support POST yet, show friendly note
      if (err?.message?.includes('405') || err?.message?.includes('404')) {
        setError('El endpoint de creación no está disponible (solo lectura).');
      } else {
        setError(err?.message || String(err));
      }
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
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
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
