import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RelationshipForm from './RelationshipForm';
import EntityForm from './EntityForm';
import { adminApi, publicApi } from '../../lib/api/client';
import { type Usuario, type Artista, type Cancion, type Fabrica, type Tematica, type Jingle, type Relationship } from '../../types';

type Props = { type: string; id: string };

// Relationship mapping derived from backend schema.ts
// For each relationship key (as used in seed.yaml) define start and end node types
const RELATIONSHIP_SCHEMA: Record<string, { start: string; end: string; }> = {
  appears_in: { start: 'jingles', end: 'fabricas' },
  jinglero_de: { start: 'artistas', end: 'jingles' },
  autor_de: { start: 'artistas', end: 'canciones' },
  versiona: { start: 'jingles', end: 'canciones' },
  tagged_with: { start: 'jingles', end: 'tematicas' },
  soy_yo: { start: 'usuarios', end: 'artistas' },
  reacciona_a: { start: 'usuarios', end: 'jingles' },
};

type RelEntry = { start: string; end: string } & Record<string, unknown>;

type EntityType = Usuario | Artista | Cancion | Fabrica | Tematica | Jingle;

interface RelationshipRow {
  type: string;
  direction: 'outgoing' | 'incoming';
  relatedEntity: {
    id: string;
    type: string;
    label: string;
  };
  properties?: Record<string, any>;
}

// Helper function to map entity type to short route code
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

export default function EntityEdit({ type, id }: Props) {
  const [item, setItem] = useState<EntityType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // State for relationships table
  const [relationshipsTable, setRelationshipsTable] = useState<RelationshipRow[]>([]);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  const [relationshipsError, setRelationshipsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data: EntityType;
        switch (type) {
          case 'usuarios':
            data = await adminApi.getUsuario(id);
            break;
          case 'artistas':
            data = await adminApi.getArtista(id);
            break;
          case 'canciones':
            data = await adminApi.getCancion(id);
            break;
          case 'fabricas':
            data = await adminApi.getFabrica(id);
            break;
          case 'tematicas':
            data = await adminApi.getTematica(id);
            break;
          case 'jingles':
            data = await adminApi.getJingle(id);
            break;
          default:
            throw new Error(`Unknown entity type: ${type}`);
        }
        setItem(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  // Determine which relationship types are relevant to this entity type
  const relTypesForThisType = Object.entries(RELATIONSHIP_SCHEMA)
    .filter(([, v]) => v.start === type || v.end === type)
    .map(([rel, v]) => ({ rel, startType: v.start, endType: v.end }));

  // Load existing relationships for the relevant types
  const [existingRels, setExistingRels] = useState<Record<string, RelEntry[]>>({});
  const [nodeMaps, setNodeMaps] = useState<Record<string, Record<string, string>>>({});
  useEffect(() => {
    let mounted = true;
    
    const fetchRelationshipsAndNodes = async () => {
      try {
        // fetch relationships for each rel type
        const relPromises = relTypesForThisType.map(async (r) => {
          try {
            return await adminApi.getRelationshipsByType(r.rel);
          } catch {
            return [];
          }
        });
        
        // also fetch node lists for counterpart types to build display strings
        const nodeTypesToFetch = Array.from(new Set(relTypesForThisType.flatMap((r) => [r.startType, r.endType])));
        const nodePromises = nodeTypesToFetch.map(async (nt) => {
          try {
            switch (nt) {
              case 'usuarios':
                return await adminApi.getUsuarios();
              case 'artistas':
                return await adminApi.getArtistas();
              case 'canciones':
                return await adminApi.getCanciones();
              case 'fabricas':
                return await adminApi.getFabricas();
              case 'tematicas':
                return await adminApi.getTematicas();
              case 'jingles':
                return await adminApi.getJingles();
              default:
                return [];
            }
          } catch {
            return [];
          }
        });

        const [relArrays, nodeArrays] = await Promise.all([
          Promise.all(relPromises),
          Promise.all(nodePromises)
        ]);

        if (!mounted) return;

        const map: Record<string, RelEntry[]> = {};
        relTypesForThisType.forEach((r, i) => { 
          const relationships = (relArrays[i] || []) as Relationship[];
          map[r.rel] = relationships.map((rel) => ({
            start: rel.start,
            end: rel.end,
            ...(rel.properties || {}),
          })) as RelEntry[];
        });
        setExistingRels(map);

        // build id -> display map for each node type
        const nm: Record<string, Record<string, string>> = {};
        nodeTypesToFetch.forEach((nt, i) => {
          const arr = nodeArrays[i] || [];
          const m: Record<string, string> = {};
          arr.forEach((it: any) => {
            const displayName = getDisplayName(it);
            m[it.id] = `${it.id} ${displayName}`.trim();
          });
          nm[nt] = m;
        });
        setNodeMaps(nm);
      } catch (error) {
        if (!mounted) return;
        setExistingRels({});
      }
    };

    fetchRelationshipsAndNodes();
    return () => { mounted = false; };
  }, [type, id, relTypesForThisType]);

  // Fetch relationships for the table
  useEffect(() => {
    if (!type || !id || !item) {
      return;
    }

    const fetchRelationships = async () => {
      try {
        setRelationshipsLoading(true);
        setRelationshipsError(null);

        const response = await publicApi.getEntityRelationships(type, id);
        
        // Transform the response into table rows
        const rows: RelationshipRow[] = [];
        
        // Helper to get entity type from Neo4j label
        const getEntityTypeFromLabel = (label: string): string => {
          const labelMap: Record<string, string> = {
            'Fabrica': 'fabrica',
            'Jingle': 'jingle',
            'Cancion': 'cancion',
            'Artista': 'artista',
            'Tematica': 'tematica',
            'Usuario': 'usuario',
          };
          return labelMap[label] || label.toLowerCase();
        };

        // Helper to get display label for an entity
        const getEntityLabel = (entityData: any, entityType: string): string => {
          if (entityData.title) return entityData.title;
          if (entityData.stageName) return entityData.stageName;
          if (entityData.name) return entityData.name;
          if (entityData.songTitle) return entityData.songTitle;
          if (entityData.id) return entityData.id;
          return 'Sin nombre';
        };
        
        // Process outgoing relationships
        if (response.outgoing && Array.isArray(response.outgoing)) {
          response.outgoing.forEach((rel: any) => {
            if (rel.type) {
              let target: any = null;
              let targetLabels: string[] = [];
              
              if (rel.target) {
                if (rel.target.properties) {
                  target = rel.target.properties;
                  targetLabels = rel.target.labels || [];
                } else {
                  target = rel.target;
                }
              } else if (rel.end) {
                target = rel.end.properties || rel.end;
                targetLabels = rel.end.labels || [];
              }
              
              if (target && target.id) {
                const entityType = getEntityTypeFromLabel(targetLabels[0] || '');
                rows.push({
                  type: rel.type,
                  direction: 'outgoing',
                  relatedEntity: {
                    id: target.id,
                    type: entityType,
                    label: getEntityLabel(target, entityType),
                  },
                  properties: rel.properties || {},
                });
              }
            }
          });
        }
        
        // Process incoming relationships
        if (response.incoming && Array.isArray(response.incoming)) {
          response.incoming.forEach((rel: any) => {
            if (rel.type) {
              let source: any = null;
              let sourceLabels: string[] = [];
              
              if (rel.source) {
                if (rel.source.properties) {
                  source = rel.source.properties;
                  sourceLabels = rel.source.labels || [];
                } else {
                  source = rel.source;
                }
              } else if (rel.start) {
                source = rel.start.properties || rel.start;
                sourceLabels = rel.start.labels || [];
              }
              
              if (source && source.id) {
                const entityType = getEntityTypeFromLabel(sourceLabels[0] || '');
                rows.push({
                  type: rel.type,
                  direction: 'incoming',
                  relatedEntity: {
                    id: source.id,
                    type: entityType,
                    label: getEntityLabel(source, entityType),
                  },
                  properties: rel.properties || {},
                });
              }
            }
          });
        }
        
        setRelationshipsTable(rows);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setRelationshipsError(`Error al cargar relaciones: ${errorMessage}`);
        console.error('Error fetching relationships:', err);
      } finally {
        setRelationshipsLoading(false);
      }
    };

    fetchRelationships();
  }, [type, id, item]);

  const getDisplayName = (item: any): string => {
    if ('displayName' in item) return item.displayName;
    if ('stageName' in item) return item.stageName || item.name || '';
    if ('title' in item) return item.title || '';
    if ('name' in item) return item.name;
    if ('email' in item) return item.email;
    return item.id;
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div>No encontrado</div>;

  // small heuristic field definitions per type to render structured edit form
  const FIELDS_BY_TYPE: Record<string, { name: string; label?: string; required?: boolean }[]> = {
    fabricas: [ { name: 'id', label: 'Id', required: true }, { name: 'title', label: 'Title' }, { name: 'youtubeUrl', label: 'YouTube URL' } ],
    jingles: [ { name: 'id', label: 'Id', required: true }, { name: 'title', label: 'Title' }, { name: 'youtubeUrl', label: 'YouTube URL' } ],
    artistas: [ { name: 'id', label: 'Id', required: true }, { name: 'name', label: 'Name' } ],
    canciones: [ { name: 'id', label: 'Id', required: true }, { name: 'title', label: 'Title' } ],
    tematicas: [ { name: 'id', label: 'Id', required: true }, { name: 'name', label: 'Name' } ],
    usuarios: [ { name: 'id', label: 'Id', required: true }, { name: 'email', label: 'Email' } ],
  };

  const fieldsForThis = FIELDS_BY_TYPE[type] || [ { name: 'id', label: 'Id', required: true } ];

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      let updated: EntityType;
      switch (type) {
        case 'usuarios':
          updated = await adminApi.updateUsuario(id, item as Partial<Usuario>);
          break;
        case 'artistas':
          updated = await adminApi.updateArtista(id, item as Partial<Artista>);
          break;
        case 'canciones':
          updated = await adminApi.updateCancion(id, item as Partial<Cancion>);
          break;
        case 'fabricas':
          updated = await adminApi.updateFabrica(id, item as Partial<Fabrica>);
          break;
        case 'tematicas':
          updated = await adminApi.updateTematica(id, item as Partial<Tematica>);
          break;
        case 'jingles':
          updated = await adminApi.updateJingle(id, item as Partial<Jingle>);
          break;
        default:
          throw new Error(`Unknown entity type: ${type}`);
      }
      setItem(updated);
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Confirm delete?')) return;
    try {
      switch (type) {
        case 'usuarios':
          await adminApi.deleteUsuario(id);
          break;
        case 'artistas':
          await adminApi.deleteArtista(id);
          break;
        case 'canciones':
          await adminApi.deleteCancion(id);
          break;
        case 'fabricas':
          await adminApi.deleteFabrica(id);
          break;
        case 'tematicas':
          await adminApi.deleteTematica(id);
          break;
        case 'jingles':
          await adminApi.deleteJingle(id);
          break;
        default:
          throw new Error(`Unknown entity type: ${type}`);
      }
      // navigate back to admin home (no list page anymore)
      window.location.href = `/admin`;
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    }
  }

  async function handleDeleteRelationship(relType: string, rel: RelEntry) {
    if (!confirm(`Eliminar relación ${relType} entre ${rel.start} → ${rel.end}?`)) return;
    try {
      await adminApi.deleteRelationship(relType, rel.start, rel.end);
      // remove from local state
      setExistingRels((prev) => {
        const copy = { ...prev };
        copy[relType] = (copy[relType] || []).filter((r) => !(r.start === rel.start && r.end === rel.end));
        return copy;
      });
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    }
  }

  return (
    <div className={`entity-edit entity-edit-${type}`}>
      <h3>Editar {type} — {id}</h3>
      {error && <div className="error">{error}</div>}
      <div>
        <EntityForm
          type={type}
          fields={fieldsForThis}
          idFirst={type === 'fabricas'}
          mode="edit"
          initialData={item as unknown as Record<string, unknown>}
          onSave={async (payload) => {
            // merge id into payload and call backend PUT
            const body = { ...payload, id };
            let updated: EntityType;
            switch (type) {
              case 'usuarios':
                updated = await adminApi.updateUsuario(id, body as Partial<Usuario>);
                break;
              case 'artistas':
                updated = await adminApi.updateArtista(id, body as Partial<Artista>);
                break;
              case 'canciones':
                updated = await adminApi.updateCancion(id, body as Partial<Cancion>);
                break;
              case 'fabricas':
                updated = await adminApi.updateFabrica(id, body as Partial<Fabrica>);
                break;
              case 'tematicas':
                updated = await adminApi.updateTematica(id, body as Partial<Tematica>);
                break;
              case 'jingles':
                updated = await adminApi.updateJingle(id, body as Partial<Jingle>);
                break;
              default:
                throw new Error(`Unknown entity type: ${type}`);
            }
            setItem(updated);
          }}
          submitLabel="Guardar"
        />
      </div>
      <div>
        <button onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={handleDelete} style={{ marginLeft: 8 }}>Eliminar</button>
        <button onClick={() => { window.location.href = `/admin` }} style={{ marginLeft: 8 }}>Cancelar</button>
      </div>

      <section>
        <h4>Relaciones</h4>
        {relTypesForThisType.length === 0 && <div>No hay relaciones definidas para este tipo.</div>}

        {relTypesForThisType.map(({ rel, startType, endType }) => {
          const entries = (existingRels[rel] || []).filter((r) => r.start === id || r.end === id);
          return (
            <div key={rel} style={{ marginBottom: 12 }}>
              <h5 style={{ marginBottom: 6 }}>{rel} ({startType} → {endType})</h5>
              {entries.length === 0 && <div style={{ fontStyle: 'italic' }}>No existen relaciones de este tipo para este elemento.</div>}
              {entries.map((r: RelEntry, i: number) => {
                const isStart = r.start === id;
                const counterpartId = isStart ? r.end : r.start;
                const counterpartType = isStart ? endType : startType;
                const display = (nodeMaps[counterpartType] && nodeMaps[counterpartType][counterpartId]) || counterpartId;
                const props = { ...r } as Record<string, unknown>;
                delete props.start; delete props.end;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <div style={{ flex: 1 }}>
                      <div>
                        <a href={`/admin/${getAdminRoute(counterpartType)}/${counterpartId}`}><strong>{display}</strong></a>
                        <span style={{ marginLeft: 8, color: '#666' }}>{isStart ? `→ ${id}` : `→ ${id}`}</span>
                      </div>
                      {Object.keys(props).length > 0 && (
                        <div style={{ fontSize: 12, color: '#444' }}>{JSON.stringify(props)}</div>
                      )}
                    </div>
                    <div>
                      <button onClick={() => handleDeleteRelationship(rel, r)} style={{ color: 'red' }}>Eliminar</button>
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 8 }}>
                <RelationshipForm relType={rel} startType={startType} endType={endType} presetStart={startType === type ? id : undefined} presetEnd={endType === type ? id : undefined} hideStart={startType === type} hideEnd={endType === type} />
              </div>
            </div>
          );
        })}
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h4>Tabla de Entidades y Relaciones</h4>
        {relationshipsLoading ? (
          <p>Cargando relaciones...</p>
        ) : relationshipsError ? (
          <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c00' }}>
            <strong>Error:</strong> {relationshipsError}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Entidad
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Tipo
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    ID
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Relación
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd' }}>
                    Dirección
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Main entity row */}
                <tr
                  style={{
                    borderBottom: '2px solid #ddd',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd', fontWeight: '600' }}>
                    {getDisplayName(item)}
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                    <code style={{ fontSize: '0.875rem', color: '#666' }}>{item.id}</code>
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd', fontStyle: 'italic', color: '#999' }}>
                    Entidad Principal
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                    <span style={{ fontStyle: 'italic', color: '#999' }}>—</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontStyle: 'italic', color: '#999' }}>—</span>
                  </td>
                </tr>
                {/* Related entities rows */}
                {relationshipsTable.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                      No hay relaciones para esta entidad.
                    </td>
                  </tr>
                ) : (
                  relationshipsTable.map((rel, index) => (
                    <tr
                      key={`${rel.type}-${rel.direction}-${rel.relatedEntity.id}-${index}`}
                      style={{
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        {rel.relatedEntity.label}
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        <span style={{ textTransform: 'capitalize' }}>{rel.relatedEntity.type}</span>
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        <code style={{ fontSize: '0.875rem', color: '#666' }}>{rel.relatedEntity.id}</code>
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        <code style={{ backgroundColor: '#f0f0f0', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
                          {rel.type}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid #ddd' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '3px',
                            fontSize: '0.875rem',
                            backgroundColor: rel.direction === 'outgoing' ? '#e3f2fd' : '#fff3e0',
                            color: rel.direction === 'outgoing' ? '#1976d2' : '#f57c00',
                          }}
                        >
                          {rel.direction === 'outgoing' ? '→ Saliente' : '← Entrante'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <Link
                          to={`/admin/${getAdminRoute(rel.relatedEntity.type)}/${rel.relatedEntity.id}`}
                          style={{
                            color: '#1976d2',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                          }}
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
