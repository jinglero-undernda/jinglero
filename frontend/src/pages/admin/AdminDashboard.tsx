/**
 * AdminDashboard Component
 * 
 * Comprehensive admin dashboard with:
 * - Entity counts for each type
 * - Validation status overview
 * - Quick actions (create entity, import CSV, view issues)
 * - Recent activity
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api/client';
import DataIntegrityChecker from '../../components/admin/DataIntegrityChecker';

interface EntityCounts {
  fabricas: number;
  jingles: number;
  canciones: number;
  artistas: number;
  tematicas: number;
  usuarios: number;
}

interface ValidationSummary {
  totalIssues: number;
  entitiesWithIssues: number;
  issuesByType: Record<string, number>;
}

const ENTITY_TYPES = [
  { type: 'fabricas', label: 'Fábricas', routePrefix: 'f', singular: 'fabrica' },
  { type: 'jingles', label: 'Jingles', routePrefix: 'j', singular: 'jingle' },
  { type: 'canciones', label: 'Canciones', routePrefix: 'c', singular: 'cancion' },
  { type: 'artistas', label: 'Artistas', routePrefix: 'a', singular: 'artista' },
  { type: 'tematicas', label: 'Temáticas', routePrefix: 't', singular: 'tematica' },
  { type: 'usuarios', label: 'Usuarios', routePrefix: 'u', singular: 'usuario' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [entityCounts, setEntityCounts] = useState<EntityCounts>({
    fabricas: 0,
    jingles: 0,
    canciones: 0,
    artistas: 0,
    tematicas: 0,
    usuarios: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [showValidation, setShowValidation] = useState(false);
  const [validationType, setValidationType] = useState<string>('');

  // Load entity counts
  useEffect(() => {
    const loadCounts = async () => {
      setCountsLoading(true);
      setCountsError(null);

      try {
        const counts: EntityCounts = {
          fabricas: 0,
          jingles: 0,
          canciones: 0,
          artistas: 0,
          tematicas: 0,
          usuarios: 0,
        };

        // Fetch counts for each entity type
        const promises = ENTITY_TYPES.map(async (entityType) => {
          try {
            const entities = await adminApi.get<any[]>(`/${entityType.type}`);
            counts[entityType.type as keyof EntityCounts] = entities.length;
          } catch (err) {
            console.error(`Error loading ${entityType.label}:`, err);
            // Continue with other types even if one fails
          }
        });

        await Promise.all(promises);
        setEntityCounts(counts);
        setLastUpdated(new Date());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los conteos';
        setCountsError(errorMessage);
        console.error('Error loading entity counts:', err);
      } finally {
        setCountsLoading(false);
      }
    };

    loadCounts();
  }, []);

  const handleCreateEntity = () => {
    if (!selectedEntityType) {
      alert('Por favor selecciona un tipo de entidad');
      return;
    }
    // Navigate to AdminHome for entity selection/creation
    // In the future, this could navigate to a dedicated create form
    navigate('/admin');
  };

  const handleRunValidation = (type: string) => {
    setValidationType(type);
    setShowValidation(true);
  };

  const getEntityTypeRoutePrefix = (type: string): string => {
    const entityType = ENTITY_TYPES.find((e) => e.type === type);
    return entityType?.routePrefix || type.charAt(0);
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Panel de Administración</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Dashboard principal para gestionar el grafo de conocimiento
        </p>
      </div>

      {/* Entity Counts Section */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Conteo de Entidades</h2>
          <button
            onClick={() => {
              setCountsLoading(true);
              const loadCounts = async () => {
                try {
                  const counts: EntityCounts = {
                    fabricas: 0,
                    jingles: 0,
                    canciones: 0,
                    artistas: 0,
                    tematicas: 0,
                    usuarios: 0,
                  };
                  const promises = ENTITY_TYPES.map(async (entityType) => {
                    try {
                      const entities = await adminApi.get<any[]>(`/${entityType.type}`);
                      counts[entityType.type as keyof EntityCounts] = entities.length;
                    } catch (err) {
                      console.error(`Error loading ${entityType.label}:`, err);
                    }
                  });
                  await Promise.all(promises);
                  setEntityCounts(counts);
                  setLastUpdated(new Date());
                } catch (err) {
                  console.error('Error refreshing counts:', err);
                } finally {
                  setCountsLoading(false);
                }
              };
              loadCounts();
            }}
            disabled={countsLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: countsLoading ? 'not-allowed' : 'pointer',
              opacity: countsLoading ? 0.6 : 1,
              fontSize: '0.875rem',
            }}
          >
            {countsLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {countsError && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee',
              borderRadius: '8px',
              color: '#c00',
              marginBottom: '1rem',
            }}
          >
            <strong>Error:</strong> {countsError}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {ENTITY_TYPES.map((entityType) => {
            const count = entityCounts[entityType.type as keyof EntityCounts];
            return (
              <div
                key={entityType.type}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2', marginBottom: '0.5rem' }}>
                  {countsLoading ? '...' : count}
                </div>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.75rem' }}>
                  {entityType.label}
                </div>
                <Link
                  to={`/admin/${entityType.routePrefix}`}
                  style={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Ver todas →
                </Link>
              </div>
            );
          })}
        </div>

        {lastUpdated && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
            Última actualización: {lastUpdated.toLocaleString()}
          </div>
        )}
      </section>

      {/* Quick Actions Section */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Acciones Rápidas</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Create New Entity */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Crear Nueva Entidad</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">-- Seleccionar tipo --</option>
                {ENTITY_TYPES.map((entityType) => (
                  <option key={entityType.type} value={entityType.type}>
                    {entityType.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateEntity}
                disabled={!selectedEntityType}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedEntityType ? '#4caf50' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedEntityType ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                }}
              >
                Crear
              </button>
            </div>
          </div>

          {/* Validation Tools */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: 'white',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Herramientas de Validación</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => setShowValidation(!showValidation)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {showValidation ? 'Ocultar Validación' : 'Mostrar Validación'}
              </button>
              <Link
                to="/admin/search"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  border: '1px solid #ddd',
                }}
              >
                Buscar Entidad
              </Link>
            </div>
          </div>

          {/* Import CSV (Placeholder for Phase 4) */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Importar CSV</h3>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
              Funcionalidad de importación CSV disponible próximamente (Fase 4)
            </p>
          </div>
        </div>
      </section>

      {/* Validation Section */}
      {showValidation && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Verificación de Integridad de Datos</h2>
            <select
              value={validationType}
              onChange={(e) => setValidationType(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            >
              <option value="">-- Seleccionar tipo de entidad --</option>
              {ENTITY_TYPES.map((entityType) => (
                <option key={entityType.type} value={entityType.type}>
                  {entityType.label}
                </option>
              ))}
            </select>
          </div>
          {validationType ? (
            <DataIntegrityChecker entityType={validationType} />
          ) : (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            >
              <p style={{ color: '#666', margin: 0 }}>
                Selecciona un tipo de entidad para ejecutar la validación
              </p>
            </div>
          )}
        </section>
      )}

      {/* Navigation Links */}
      <section>
        <h2 style={{ marginBottom: '1rem' }}>Navegación</h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <Link
            to="/admin/search"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            Buscar Entidad
          </Link>
          {ENTITY_TYPES.map((entityType) => (
            <Link
              key={entityType.type}
              to={`/admin/${entityType.routePrefix}`}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                border: '1px solid #ddd',
              }}
            >
              Ver {entityType.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
