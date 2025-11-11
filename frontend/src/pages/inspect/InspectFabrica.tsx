import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Fabrica } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';

export default function InspectFabrica() {
  const { fabricaId } = useParams();
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFabrica = async () => {
      if (!fabricaId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedFabrica = await publicApi.getFabrica(fabricaId);
        setFabrica(fetchedFabrica);
      } catch (err) {
        setError('Error loading fabrica');
        console.error('Error fetching fabrica:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFabrica();
  }, [fabricaId]);

  const relationships = getRelationshipsForEntityType('fabrica');

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {fabrica && (
        <>
          <EntityCard
            entity={fabrica}
            entityType="fabrica"
            variant="heading"
            indentationLevel={0}
          />
          <RelatedEntities
            entity={fabrica}
            entityType="fabrica"
            relationships={relationships}
            entityPath={[fabrica.id]}
          />
        </>
      )}
    </main>
  );
}

