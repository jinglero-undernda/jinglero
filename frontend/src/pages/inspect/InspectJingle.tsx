import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Jingle, Fabrica, Cancion, Artista, Tematica } from '../../types';
import EntityCard from '../../components/common/EntityCard';
import RelatedEntities from '../../components/common/RelatedEntities';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { publicApi } from '../../lib/api';
import { clearJingleRelationshipsCache } from '../../lib/services/relationshipService';
import { extractRelationshipData } from '../../lib/utils/relationshipDataExtractor';
import CRTMonitorPlayer from '../../components/production-belt/CRTMonitorPlayer';
import { normalizeTimestampToSeconds } from '../../lib/utils/timestamp';

// Extended Jingle type that includes relationship data from API
interface JingleWithRelationships extends Jingle {
  fabrica?: Fabrica | null;
  cancion?: Cancion | null;
  jingleros?: Artista[];
  autores?: Artista[];
  tematicas?: Tematica[];
  repeats?: Jingle[];
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
        let fetchedJingle = await publicApi.getJingle(jingleId) as JingleWithRelationships;
        
        // If songTitle is blank and title is also blank, trigger refresh to get updated songTitle
        if (!fetchedJingle.title && !fetchedJingle.songTitle) {
          // Clear cache and fetch again to get updated songTitle (backend auto-syncs it)
          clearJingleRelationshipsCache(jingleId);
          fetchedJingle = await publicApi.getJingle(jingleId) as JingleWithRelationships;
        }
        
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

  // Extract relationship data for EntityCard using centralized utility
  const relationshipData = jingle 
    ? extractRelationshipData(jingle, 'jingle')
    : undefined;

  // Get fabrica from jingle or relationshipData for YouTube player
  const fabrica = jingle?.fabrica || (relationshipData?.fabrica as Fabrica | undefined);
  const videoIdOrUrl = fabrica?.youtubeUrl || fabrica?.id || null;
  
  // IMPORTANT: The timestamp is on the fabrica object (from APPEARS_IN relationship), not on jingle directly
  // The API returns it as fabrica.timestamp from the relationship
  const rawTimestamp = (fabrica as any)?.timestamp ?? jingle?.timestamp;
  const normalizedTimestamp = rawTimestamp ? normalizeTimestampToSeconds(rawTimestamp) : null;
  const startSeconds = normalizedTimestamp !== null ? normalizedTimestamp : 0;
  

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
          {videoIdOrUrl && (
            <div style={{ 
              margin: '0.5rem calc(50% - 50vw)', 
              width: '100vw',
              aspectRatio: '1 / 0.4',
              position: 'relative'
            }}>
              <CRTMonitorPlayer
                videoIdOrUrl={videoIdOrUrl}
                startSeconds={startSeconds}
                autoplay={false}
              />
            </div>
          )}
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
              'Versiones-jingle': jingle.repeats || [],
              'Tematicas-tematica': jingle.tematicas || [],
            }}
          />
        </>
      )}
    </main>
  );
}

