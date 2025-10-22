import React, { useEffect, useState } from 'react';

type Fabrica = {
  id: string;
  nombre?: string;
  [k: string]: any;
};

export default function FabricaList() {
  const [items, setItems] = useState<Fabrica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/fabricas')
      .then((r) => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then((d) => setItems(d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-fabrica-list">
      <h2>Fábricas</h2>
      {loading && <div>Cargando...</div>}
      {error && <div className="error">Error: {error}</div>}
      <ul>
        {items.map((f) => (
          <li key={f.id}>
            <a href={`/admin/dashboard/fabricas/edit/${f.id}`}><strong>{f.title || f.nombre || f.id}</strong> — <code>{f.id}</code></a>
          </li>
        ))}
      </ul>
    </div>
  );
}
