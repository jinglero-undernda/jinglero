import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Jingle } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';

export default function InspectJingle() {
  const { jingleId } = useParams();
  const [jingle, setJingle] = useState<Jingle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJingle = async () => {
      if (!jingleId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedJingle = await publicApi.getJingle(jingleId);
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
          />
          <RelatedEntities
            entity={jingle}
            entityType="jingle"
            relationships={relationships}
            entityPath={[jingle.id]}
          />
        </>
      )}
    </main>
  );
}

