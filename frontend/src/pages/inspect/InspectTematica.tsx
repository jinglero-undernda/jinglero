import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Tematica } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';

export default function InspectTematica() {
  const { tematicaId } = useParams();
  const [tematica, setTematica] = useState<Tematica | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTematica = async () => {
      if (!tematicaId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedTematica = await publicApi.getTematica(tematicaId);
        setTematica(fetchedTematica);
      } catch (err) {
        setError('Error loading tematica');
        console.error('Error fetching tematica:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTematica();
  }, [tematicaId]);

  const relationships = getRelationshipsForEntityType('tematica');

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {tematica && (
        <>
          <EntityCard
            entity={tematica}
            entityType="tematica"
            variant="heading"
            indentationLevel={0}
          />
          <RelatedEntities
            entity={tematica}
            entityType="tematica"
            relationships={relationships}
            entityPath={[tematica.id]}
          />
        </>
      )}
    </main>
  );
}

