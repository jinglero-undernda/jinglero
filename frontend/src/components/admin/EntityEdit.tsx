import React, { useEffect, useState } from 'react';
import RelationshipForm from './RelationshipForm';
import { adminApi } from '../../lib/api/client';
import { Usuario, Artista, Cancion, Fabrica, Tematica, Jingle } from '../../types';

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

export default function EntityEdit({ type, id }: Props) {
  const [item, setItem] = useState<EntityType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
          map[r.rel] = (relArrays[i] || []) as RelEntry[]; 
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
      // navigate back to list
      window.location.href = `/admin/dashboard/${type}`;
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
          initialData={item}
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
        <button onClick={() => { window.location.href = `/admin/dashboard/${type}` }} style={{ marginLeft: 8 }}>Cancelar</button>
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
                        <a href={`/admin/dashboard/${counterpartType}/edit/${counterpartId}`}><strong>{display}</strong></a>
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
    </div>
  );
}
