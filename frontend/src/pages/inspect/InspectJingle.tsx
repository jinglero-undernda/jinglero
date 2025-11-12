import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Jingle, Fabrica, Cancion, Artista, Tematica } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';

// Extended Jingle type that includes relationship data from API
interface JingleWithRelationships extends Jingle {
  fabrica?: Fabrica | null;
  cancion?: Cancion | null;
  jingleros?: Artista[];
  autores?: Artista[];
  tematicas?: Tematica[];
}

export default function InspectJingle() {
  const { jingleId } = useParams();
  const [jingle, setJingle] = useState<JingleWithRelationships | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJingle = async () => {
      if (!jingleId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedJingle = await publicApi.getJingle(jingleId) as JingleWithRelationships;
        setJingle(fetchedJingle);
      } catch (err) {
        setError('Error loading jingle');
        console.error('Error fetching jingle:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJingle();
  }, [jingleId]);

  const relationships = getRelationshipsForEntityType('jingle');

  // Extract relationship data for EntityCard
  const relationshipData = jingle ? {
    fabrica: jingle.fabrica,
    cancion: jingle.cancion,
    jingleros: jingle.jingleros,
    autores: jingle.autores,
    tematicas: jingle.tematicas,
  } : undefined;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {jingle && (
        <>
          <EntityCard
            entity={jingle}
            entityType="jingle"
            variant="heading"
            indentationLevel={0}
            relationshipData={relationshipData}
          />
          <RelatedEntities
            entity={jingle}
            entityType="jingle"
            relationships={relationships}
            entityPath={[jingle.id]}
            initialRelationshipData={{
              'Fabrica-fabrica': jingle.fabrica ? [jingle.fabrica] : [],
              'Cancion-cancion': jingle.cancion ? [jingle.cancion] : [],
              'Autor-artista': jingle.autores || [],
              'Jinglero-artista': jingle.jingleros || [],
              'Tematicas-tematica': jingle.tematicas || [],
            }}
          />
        </>
      )}
    </main>
  );
}

