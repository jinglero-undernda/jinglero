import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api/client';
import { type Usuario, type Artista, type Cancion, type Fabrica, type Tematica, type Jingle } from '../../types';
import EntityCard, { type EntityType as EntityCardType } from '../common/EntityCard';
import BulkActions from './BulkActions';

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

// Helper function to map entity type to short route code for admin routes
function getAdminRoute(type: string): string {
  const routeMap: Record<string, string> = {
    fabricas: 'f',
    jingles: 'j',
    canciones: 'c',
    artistas: 'a',
    tematicas: 't',
  };
  return routeMap[type] || type;
}

// Map admin entity types to admin route prefixes
const getAdminRoutePrefix = (type: string): string => {
  const routeMap: Record<string, string> = {
    artistas: '/admin/a',
    canciones: '/admin/c',
    fabricas: '/admin/f',
    tematicas: '/admin/t',
    jingles: '/admin/j',
    usuarios: '/admin/u',
  };
  return routeMap[type] || '';
};

const normalizeString = (value?: string | null) => (value ?? '').trim().toLowerCase();

const compareStrings = (a?: string | null, b?: string | null) =>
  normalizeString(a).localeCompare(normalizeString(b));

const toTimestamp = (value?: string | number | null): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = value.trim();

  // Handle dd/mm/yyyy format (e.g., 30/10/2025)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    const [dayStr, monthStr, yearStr] = normalized.split('/');
    const day = Number(dayStr);
    const month = Number(monthStr) - 1;
    const year = Number(yearStr);

    if (
      Number.isInteger(day) &&
      Number.isInteger(month) &&
      Number.isInteger(year) &&
      day >= 1 &&
      day <= 31 &&
      month >= 0 &&
      month <= 11
    ) {
      return Date.UTC(year, month, day);
    }
  }

  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

// Sort entities based on entity type
const sortEntities = (data: EntityType[], type: string): EntityType[] => {
  switch (type) {
    case 'artistas':
      // Sort artistas by stageName (primary) or name (fallback), case-insensitive
      return [...data].sort((a, b) => {
        const artA = a as Artista;
        const artB = b as Artista;
        return compareStrings(artA.stageName || artA.name, artB.stageName || artB.name);
      });
    case 'fabricas':
      // Latest Fabrica first (date desc, fallback to createdAt)
      return [...data].sort((a, b) => {
        const fabA = a as Fabrica;
        const fabB = b as Fabrica;
        const dateA = toTimestamp(fabA.date || fabA.createdAt);
        const dateB = toTimestamp(fabB.date || fabB.createdAt);

        if (dateA !== null && dateB !== null && dateA !== dateB) {
          return dateB - dateA;
        }
        if (dateA === null && dateB !== null) return 1;
        if (dateA !== null && dateB === null) return -1;
        return compareStrings(fabA.title, fabB.title);
      });
    case 'jingles':
      // Alphabetical by title; identical titles sorted by earliest date first
      return [...data].sort((a, b) => {
        const jingA = a as Jingle;
        const jingB = b as Jingle;
        const titleCompare = compareStrings(jingA.title || jingA.songTitle, jingB.title || jingB.songTitle);
        if (titleCompare !== 0) {
          return titleCompare;
        }

        const dateA = toTimestamp(jingA.fabricaDate || jingA.createdAt);
        const dateB = toTimestamp(jingB.fabricaDate || jingB.createdAt);

        if (dateA === null && dateB === null) return 0;
        if (dateA === null) return 1;
        if (dateB === null) return -1;
        return dateA - dateB;
      });
    case 'tematicas':
      // By category, then alphabetical by name
      return [...data].sort((a, b) => {
        const temA = a as Tematica;
        const temB = b as Tematica;
        const categoryCompare = compareStrings(temA.category, temB.category);
        if (categoryCompare !== 0) {
          return categoryCompare;
        }
        return compareStrings(temA.name, temB.name);
      });
    case 'canciones':
      // Alphabetical by title
      return [...data].sort((a, b) => {
        const songA = a as Cancion;
        const songB = b as Cancion;
        return compareStrings(songA.title, songB.title);
      });
    default:
      return data;
  }
};

export default function EntityList({ type, title }: Props) {
  const [items, setItems] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
        setItems(sortEntities(data || [], type));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const entityCardType = getEntityCardType(type);
  // Use admin route prefix to ensure links go to admin pages
  const routePrefix = getAdminRoutePrefix(type);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkActionComplete = () => {
    setSelectedIds(new Set());
    // Refresh the list
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
        setItems(sortEntities(data || [], type));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  return (
    <div className={`admin-list admin-list-${type}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>{title || type}</h3>
        {items.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
              Seleccionar todos ({selectedIds.size}/{items.length})
            </label>
          </div>
        )}
      </div>
      {loading && <div>Cargando...</div>}
      {error && <div className="error">Error: {error}</div>}

      {selectedIds.size > 0 && (
        <BulkActions
          entityType={type}
          selectedIds={Array.from(selectedIds)}
          onComplete={handleBulkActionComplete}
          onCancel={() => setSelectedIds(new Set())}
        />
      )}
      
      {entityCardType ? (
        // Use EntityCard for supported entity types
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                style={{ marginTop: '0.5rem', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <EntityCard
                  entity={item as Artista | Cancion | Fabrica | Jingle | Tematica}
                  entityType={entityCardType}
                  variant="contents"
                  to={`${routePrefix}/${item.id}`}
                  className="admin-entity-card"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Fallback for unsupported types (e.g., usuarios)
        <ul>
          {items.map((it) => (
            <li key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={selectedIds.has(it.id)}
                onChange={(e) => handleSelectItem(it.id, e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <a href={`/admin/${getAdminRoute(type)}/${it.id}`}>
                {it.id} — {(it as any).displayName || (it as any).email || it.id}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
