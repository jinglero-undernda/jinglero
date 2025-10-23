import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api/client';
import { Usuario, Artista, Cancion, Fabrica, Tematica, Jingle } from '../../types';

type Props = {
  type: string;
  title?: string;
};

type EntityType = Usuario | Artista | Cancion | Fabrica | Tematica | Jingle;

export default function EntityList({ type, title }: Props) {
  const [items, setItems] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data: EntityType[];
        switch (type) {
          case 'usuarios':
            data = await adminApi.getUsuarios();
            break;
          case 'artistas':
            data = await adminApi.getArtistas();
            break;
          case 'canciones':
            data = await adminApi.getCanciones();
            break;
          case 'fabricas':
            data = await adminApi.getFabricas();
            break;
          case 'tematicas':
            data = await adminApi.getTematicas();
            break;
          case 'jingles':
            data = await adminApi.getJingles();
            break;
          default:
            throw new Error(`Unknown entity type: ${type}`);
        }
        setItems(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const getDisplayName = (item: EntityType): string => {
    if ('displayName' in item) return item.displayName;
    if ('stageName' in item) return item.stageName || item.name || '';
    if ('title' in item) return item.title || '';
    if ('name' in item) return item.name;
    if ('email' in item) return item.email;
    return item.id;
  };

  return (
    <div className={`admin-list admin-list-${type}`}>
      <h3>{title || type}</h3>
      {loading && <div>Cargando...</div>}
      {error && <div className="error">Error: {error}</div>}
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <Link to={`/admin/dashboard/${type}/edit/${it.id}`}>
              {it.id} — {getDisplayName(it)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
