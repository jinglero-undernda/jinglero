import React, { useEffect, useState } from 'react';
import RelationshipForm from './RelationshipForm';

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

export default function EntityEdit({ type, id }: Props) {
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/${type}/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then((d) => setItem(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
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
    // fetch relationships for each rel type
    const relFetch = Promise.all(relTypesForThisType.map((r) => fetch(`/api/admin/relationships/${r.rel}`).then((res) => res.ok ? res.json() : []).catch(() => [])));
    // also fetch node lists for counterpart types to build display strings
    const nodeTypesToFetch = Array.from(new Set(relTypesForThisType.flatMap((r) => [r.startType, r.endType])));
    const nodeFetch = Promise.all(nodeTypesToFetch.map((nt) => fetch(`/api/admin/${nt}`).then((res) => res.ok ? res.json() : []).catch(() => [])));

    Promise.all([relFetch, nodeFetch])
      .then((arrays) => {
        if (!mounted) return;
        const relArrays = arrays[0] as any[]; // array of arrays for relationships
        const nodeArrays = arrays[1] as any[]; // array of node lists matching nodeTypesToFetch

        const map: Record<string, RelEntry[]> = {};
        relTypesForThisType.forEach((r, i) => { map[r.rel] = (relArrays[i] || []) as RelEntry[]; });
        setExistingRels(map);

        // build id -> display map for each node type
        const nm: Record<string, Record<string, string>> = {};
        nodeTypesToFetch.forEach((nt, i) => {
          const arr = nodeArrays[i] || [];
          const m: Record<string, string> = {};
          arr.forEach((it: any) => {
            m[it.id] = `${it.id} ${it.nombre || it.name || it.title || it.email || ''}`.trim();
          });
          nm[nt] = m;
        });
        setNodeMaps(nm);
      })
      .catch(() => {
        if (!mounted) return;
        setExistingRels({});
      });
    return () => { mounted = false; };
  }, [type, id, relTypesForThisType]);

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
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
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
      const res = await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      // navigate back to list
      window.location.href = `/admin/dashboard/${type}`;
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    }
  }

  async function handleDeleteRelationship(relType: string, rel: RelEntry) {
    if (!confirm(`Eliminar relación ${relType} entre ${rel.start} → ${rel.end}?`)) return;
    try {
      const res = await fetch(`/api/admin/relationships/${relType}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: rel.start, end: rel.end }),
      });
      if (!res.ok) throw new Error(await res.text());
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
            const res = await fetch(`/api/admin/${type}/${id}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(await res.text());
            const updated = await res.json();
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
