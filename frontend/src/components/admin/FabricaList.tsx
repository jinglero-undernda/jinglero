import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api/client';
import { Fabrica } from '../../types';

export default function FabricaList() {
  const [items, setItems] = useState<Fabrica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getFabricas();
        setItems(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-fabrica-list">
      <h2>Fábricas</h2>
      {loading && <div>Cargando...</div>}
      {error && <div className="error">Error: {error}</div>}
      <ul>
        {items.map((f) => (
          <li key={f.id}>
            <a href={`/admin/dashboard/fabricas/edit/${f.id}`}><strong>{f.title || f.id}</strong> — <code>{f.id}</code></a>
          </li>
        ))}
      </ul>
    </div>
  );
}
