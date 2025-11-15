/**
 * AdminEntityList Page
 * 
 * Displays a list of all entities of a specific type with bulk actions.
 * Route: /admin/:entityType (e.g., /admin/f for fabricas)
 * 
 * Task 7.9: Includes "New" button that navigates to Dashboard with creation context
 * When clicked, navigates to: /admin/dashboard?create={entityType}
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <h1 style={{ margin: 0 }}>{entityConfig.label}</h1>
          <button
            onClick={() => navigate(`/admin/dashboard?create=${entityType}`)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#45a049';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4caf50';
            }}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span>
            Crear {entityConfig.label.replace(/s$/, '').replace(/es$/, '')}
          </button>
        </div>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Lista de todas las {entityConfig.label.toLowerCase()}
        </p>
      </div>

      <EntityList type={entityConfig.type} title={entityConfig.label} />
    </main>
  );
}

