import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Cancion } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';

export default function InspectCancion() {
  const { cancionId } = useParams();
  const [cancion, setCancion] = useState<Cancion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCancion = async () => {
      if (!cancionId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedCancion = await publicApi.getCancion(cancionId);
        setCancion(fetchedCancion);
      } catch (err) {
        setError('Error loading cancion');
        console.error('Error fetching cancion:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCancion();
  }, [cancionId]);

  const relationships = getRelationshipsForEntityType('cancion');

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {cancion && (
        <>
          <EntityCard
            entity={cancion}
            entityType="cancion"
            variant="heading"
            indentationLevel={0}
          />
          <RelatedEntities
            entity={cancion}
            entityType="cancion"
            relationships={relationships}
            entityPath={[cancion.id]}
          />
        </>
      )}
    </main>
  );
}

