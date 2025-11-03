import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EntityCard, { type EntityType } from '../../components/common/EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { normalizeEntityType } from '../../lib/utils/entityTypeUtils';

/**
 * InspectEntityPage - Demo/Test page for EntityCard component
 * 
 * Routes:
 * - /inspect/f/:fabricaId
 * - /inspect/j/:jingleId
 * - /inspect/c/:cancionId
 * - /inspect/a/:artistaId
 * - /inspect/t/:tematicaId
 * 
 * This page displays EntityCard examples with various states for testing.
 */
export default function InspectEntityPage() {
  const params = useParams<{ entityType: string; entityId: string }>();
  const { entityType: rawEntityType, entityId } = params;

  // Normalize entity type
  const entityType = normalizeEntityType(rawEntityType);

  // State for entity data (user will provide default values during implementation)
  const [entity, setEntity] = useState<Artista | Cancion | Fabrica | Jingle | Tematica | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // TODO: Fetch entity data from API when user provides default values
    // For now, create a minimal mock entity based on type
    if (entityType && entityId) {
      const now = new Date().toISOString();
      let mockEntity: Artista | Cancion | Fabrica | Jingle | Tematica;

      switch (entityType) {
        case 'fabrica':
          mockEntity = {
            id: entityId,
            title: `Fábrica ${entityId}`,
            date: now,
            youtubeUrl: 'https://youtube.com/watch?v=example',
            status: 'COMPLETED',
            createdAt: now,
            updatedAt: now,
          } as Fabrica;
          break;
        case 'jingle':
          mockEntity = {
            id: entityId,
            title: `Jingle ${entityId}`,
            timestamp: '00:00:00',
            isJinglazo: false,
            isJinglazoDelDia: false,
            isPrecario: false,
            createdAt: now,
            updatedAt: now,
          } as Jingle;
          break;
        case 'cancion':
          mockEntity = {
            id: entityId,
            title: `Canción ${entityId}`,
            createdAt: now,
            updatedAt: now,
          } as Cancion;
          break;
        case 'artista':
          mockEntity = {
            id: entityId,
            stageName: `Artista ${entityId}`,
            isArg: true,
            createdAt: now,
            updatedAt: now,
          } as Artista;
          break;
        case 'tematica':
          mockEntity = {
            id: entityId,
            name: `Temática ${entityId}`,
            category: 'CULTURA',
            createdAt: now,
            updatedAt: now,
          } as Tematica;
          break;
        default:
          return;
      }

      setEntity(mockEntity);
    }
  }, [entityType, entityId]);

  if (!entityType || !entity) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Inspect Entity</h1>
        <p>Tipo de entidad no válido: {rawEntityType}</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Volver al inicio
        </Link>
      </div>

      <h1>EntityCard Demo: {entityType}</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Página de demostración y prueba para el componente EntityCard.
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Variante Card (Por Defecto)</h2>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Estado Normal
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="card"
              to={`/${rawEntityType}/${entityId}`}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Estado Activo (Seleccionado)
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="card"
              to={`/${rawEntityType}/${entityId}`}
              active={true}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Con Badge Personalizado
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="card"
              to={`/${rawEntityType}/${entityId}`}
              badge={<span className="entity-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>DEMO</span>}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Con Expandir/Colapsar (Card)
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="card"
              hasNestedEntities={true}
              isExpanded={expandedIds.has(`${entity.id}-card`)}
              onToggleExpand={() => {
                const key = `${entity.id}-card`;
                setExpandedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) {
                    next.delete(key);
                  } else {
                    next.add(key);
                  }
                  return next;
                });
              }}
            />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Variante Row (Para Tablas Anidadas)</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '1rem' }}>
          Versión compacta y horizontal para usar como fila en tablas anidadas.
        </p>

        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Row Normal
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="row"
              to={`/${rawEntityType}/${entityId}`}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Row Activo
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="row"
              active={true}
              to={`/${rawEntityType}/${entityId}`}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Row Colapsado (con expandir)
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="row"
              hasNestedEntities={true}
              isExpanded={false}
              onToggleExpand={() => {
                const key = `${entity.id}-row-collapsed`;
                setExpandedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) {
                    next.delete(key);
                  } else {
                    next.add(key);
                  }
                  return next;
                });
              }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Row Expandido (con colapsar)
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="row"
              hasNestedEntities={true}
              isExpanded={expandedIds.has(`${entity.id}-row-expanded`)}
              onToggleExpand={() => {
                const key = `${entity.id}-row-expanded`;
                setExpandedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) {
                    next.delete(key);
                  } else {
                    next.add(key);
                  }
                  return next;
                });
              }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Row con Badges
            </h3>
            <EntityCard
              entity={entity}
              entityType={entityType}
              variant="row"
              to={`/${rawEntityType}/${entityId}`}
              badge={<span className="entity-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>DEMO</span>}
            />
          </div>
        </div>
      </section>

      {/* Special cases for Jingle with badges */}
      {entityType === 'jingle' && (
        <section style={{ marginBottom: '3rem' }}>
          <h2>Casos Especiales: Jingle con Badges</h2>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Jingle con JINGLAZO
              </h3>
              <EntityCard
                entity={{ ...entity, isJinglazo: true } as Jingle}
                entityType="jingle"
                to={`/j/${entityId}`}
              />
            </div>

            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Jingle con PRECARIO
              </h3>
              <EntityCard
                entity={{ ...entity, isPrecario: true } as Jingle}
                entityType="jingle"
                to={`/j/${entityId}`}
              />
            </div>

            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Jingle con JINGLAZO y PRECARIO
              </h3>
              <EntityCard
                entity={{ ...entity, isJinglazo: true, isPrecario: true } as Jingle}
                entityType="jingle"
                to={`/j/${entityId}`}
              />
            </div>
          </div>
        </section>
      )}

      <section style={{ marginBottom: '3rem' }}>
        <h2>Casos Extremos (Edge Cases)</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '1rem' }}>
          Ejemplos de manejo de datos faltantes, texto largo, y otros casos límite.
        </p>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Sin Título (muestra "A CONFIRMAR" o ID)
            </h3>
            <EntityCard
              entity={{ ...entity, title: undefined, name: undefined, stageName: undefined } as any}
              entityType={entityType}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
              Texto Muy Largo (word-wrap)
            </h3>
            <EntityCard
              entity={(() => {
                const baseEntity = { ...entity };
                if (entityType === 'fabrica' || entityType === 'jingle' || entityType === 'cancion') {
                  const e = baseEntity as Fabrica | Jingle | Cancion;
                  return {
                    ...e,
                    title: e.title ? 'A'.repeat(150) + ' ' + e.title : undefined,
                  } as any;
                }
                if (entityType === 'tematica') {
                  const e = baseEntity as Tematica;
                  return {
                    ...e,
                    name: 'B'.repeat(150) + ' ' + e.name,
                  } as any;
                }
                if (entityType === 'artista') {
                  const e = baseEntity as Artista;
                  return {
                    ...e,
                    stageName: e.stageName ? 'C'.repeat(150) + ' ' + e.stageName : undefined,
                  } as any;
                }
                return baseEntity;
              })()}
              entityType={entityType}
            />
          </div>

          {entityType === 'jingle' && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Sin Datos Secundarios
              </h3>
              <EntityCard
                entity={entity as Jingle}
                entityType="jingle"
              />
            </div>
          )}

          {entityType === 'artista' && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Solo Nombre Artístico (sin nombre real)
              </h3>
              <EntityCard
                entity={{ ...entity, name: undefined } as Artista}
                entityType="artista"
              />
            </div>
          )}

          {entityType === 'cancion' && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#666' }}>
                Sin Álbum ni Año
              </h3>
              <EntityCard
                entity={{ ...entity, album: undefined, year: undefined } as Cancion}
                entityType="cancion"
              />
            </div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Datos de la Entidad</h2>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            color: '#000',
          }}
        >
          {JSON.stringify(entity, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Navegación Rápida</h2>
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Link to="/inspect/f/test-fabrica" style={{ color: '#1976d2' }}>
            Fabrica
          </Link>
          <Link to="/inspect/j/test-jingle" style={{ color: '#1976d2' }}>
            Jingle
          </Link>
          <Link to="/inspect/c/test-cancion" style={{ color: '#1976d2' }}>
            Cancion
          </Link>
          <Link to="/inspect/a/test-artista" style={{ color: '#1976d2' }}>
            Artista
          </Link>
          <Link to="/inspect/t/test-tematica" style={{ color: '#1976d2' }}>
            Tematica
          </Link>
        </nav>
      </section>
    </main>
  );
}

