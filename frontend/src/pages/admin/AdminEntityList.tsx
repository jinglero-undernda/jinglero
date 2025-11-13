/**
 * AdminEntityList Page
 * 
 * Displays a list of all entities of a specific type with bulk actions.
 * Route: /admin/:entityType (e.g., /admin/f for fabricas)
 */

import { useParams, Link } from 'react-router-dom';
import EntityList from '../../components/admin/EntityList';

const ENTITY_TYPE_MAP: Record<string, { type: string; label: string }> = {
  f: { type: 'fabricas', label: 'Fábricas' },
  j: { type: 'jingles', label: 'Jingles' },
  c: { type: 'canciones', label: 'Canciones' },
  a: { type: 'artistas', label: 'Artistas' },
  t: { type: 'tematicas', label: 'Temáticas' },
  u: { type: 'usuarios', label: 'Usuarios' },
};

export default function AdminEntityList() {
  const params = useParams<{ entityType: string }>();
  const { entityType } = params;

  if (!entityType) {
    return (
      <main style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
          <strong>Error:</strong> Tipo de entidad no especificado
        </div>
        <Link to="/admin" style={{ display: 'inline-block', marginTop: '1rem', color: '#1976d2' }}>
          ← Volver al Dashboard
        </Link>
      </main>
    );
  }

  const entityConfig = ENTITY_TYPE_MAP[entityType];

  if (!entityConfig) {
    return (
      <main style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
          <strong>Error:</strong> Tipo de entidad no válido: {entityType}
        </div>
        <Link to="/admin" style={{ display: 'inline-block', marginTop: '1rem', color: '#1976d2' }}>
          ← Volver al Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/admin"
          style={{
            color: '#1976d2',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            display: 'inline-block',
          }}
        >
          ← Volver al Dashboard
        </Link>
        <h1 style={{ marginTop: '0.5rem', marginBottom: 0 }}>{entityConfig.label}</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Lista de todas las {entityConfig.label.toLowerCase()}
        </p>
      </div>

      <EntityList type={entityConfig.type} title={entityConfig.label} />
    </main>
  );
}

