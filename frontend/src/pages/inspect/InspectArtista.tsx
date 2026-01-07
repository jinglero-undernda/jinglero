import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Artista } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';
import { adminApi } from '../../lib/api/client';

export default function InspectArtista() {
  const { artistaId } = useParams();
  const [artista, setArtista] = useState<Artista | null>(null);
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
    const fetchArtista = async () => {
      if (!artistaId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedArtista = await publicApi.getArtista(artistaId);
        setArtista(fetchedArtista);
      } catch (err) {
        setError('Error loading artista');
        console.error('Error fetching artista:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtista();
  }, [artistaId]);

  const relationships = getRelationshipsForEntityType('artista');

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {artista && (
        <>
          <EntityCard
            entity={artista}
            entityType="artista"
            variant="heading"
            indentationLevel={0}
          />
          <RelatedEntities
            key={artista.id}
            entity={artista}
            entityType="artista"
            relationships={relationships}
            entityPath={[artista.id]}
          />
        </>
      )}
      </main>
  );
}

