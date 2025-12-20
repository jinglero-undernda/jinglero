import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Cancion } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';
import FloatingHeader from '../../components/composite/FloatingHeader';
import { adminApi } from '../../lib/api/client';
import CRTMonitorPlayer from '../../components/production-belt/CRTMonitorPlayer';

export default function InspectCancion() {
  const { cancionId } = useParams();
  const [cancion, setCancion] = useState<Cancion | null>(null);
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

  // Get YouTube video ID from cancion
  const videoIdOrUrl = cancion?.youtubeMusic || null;

  return (
    <>
      <FloatingHeader isAuthenticated={isAuthenticated} />
      <main style={{ padding: '2rem', paddingTop: '6rem', maxWidth: '1200px', margin: '0 auto' }}>
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
          {videoIdOrUrl && (
            <div style={{ 
              margin: '0.5rem calc(50% - 50vw)', 
              width: '100vw',
              aspectRatio: '1 / 0.4',
              position: 'relative'
            }}>
              <CRTMonitorPlayer
                videoIdOrUrl={videoIdOrUrl}
                startSeconds={0}
                autoplay={false}
              />
            </div>
          )}
          <RelatedEntities
            entity={cancion}
            entityType="cancion"
            relationships={relationships}
            entityPath={[cancion.id]}
          />
        </>
      )}
      </main>
    </>
  );
}

