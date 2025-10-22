import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  type: string;
  title?: string;
};

export default function EntityList({ type, title }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/${type}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then((d) => setItems(d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className={`admin-list admin-list-${type}`}>
      <h3>{title || type}</h3>
      {loading && <div>Cargando...</div>}
      {error && <div className="error">Error: {error}</div>}
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <Link to={`/admin/dashboard/${type}/edit/${it.id}`}>
              {it.id} — {it.nombre || it.name || it.title || it.email || JSON.stringify(it)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
