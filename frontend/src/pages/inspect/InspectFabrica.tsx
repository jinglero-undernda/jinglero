import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Fabrica } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';
import { adminApi } from '../../lib/api/client';

export default function InspectFabrica() {
  const { fabricaId } = useParams();
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await adminApi.getAuthStatus();
        setIsAuthenticated(status.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

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

