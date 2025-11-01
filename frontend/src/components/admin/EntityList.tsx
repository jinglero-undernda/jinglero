import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api/client';
import { type Usuario, type Artista, type Cancion, type Fabrica, type Tematica, type Jingle } from '../../types';
import EntityCard, { type EntityType as EntityCardType } from '../common/EntityCard';

type Props = {
  type: string;
  title?: string;
};

type EntityType = Usuario | Artista | Cancion | Fabrica | Tematica | Jingle;

// Map admin entity types to EntityCard entity types
const getEntityCardType = (type: string): EntityCardType | null => {
  const typeMap: Record<string, EntityCardType> = {
    artistas: 'artista',
    canciones: 'cancion',
    fabricas: 'fabrica',
    tematicas: 'tematica',
    jingles: 'jingle',
  };
  return typeMap[type] || null;
};

// Map admin entity types to route prefixes
const getRoutePrefix = (type: string): string => {
  const routeMap: Record<string, string> = {
    artistas: '/a',
    canciones: '/c',
    fabricas: '/f',
    tematicas: '/t',
    jingles: '/j',
  };
  return routeMap[type] || '';
};

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

  const entityCardType = getEntityCardType(type);
  const routePrefix = getRoutePrefix(type);

  return (
    <div className={`admin-list admin-list-${type}`}>
      <h3>{title || type}</h3>
      {loading && <div>Cargando...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      {entityCardType ? (
        // Use EntityCard for supported entity types
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {items.map((item) => (
            <EntityCard
              key={item.id}
              entity={item as Artista | Cancion | Fabrica | Jingle | Tematica}
              entityType={entityCardType}
              to={`${routePrefix}/${item.id}`}
              className="admin-entity-card"
            />
          ))}
        </div>
      ) : (
        // Fallback for unsupported types (e.g., usuarios)
        <ul>
          {items.map((it) => (
            <li key={it.id}>
              <a href={`/admin/dashboard/${type}/edit/${it.id}`}>
                {it.id} — {(it as any).displayName || (it as any).email || it.id}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
