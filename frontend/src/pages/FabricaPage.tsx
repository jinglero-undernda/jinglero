import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../lib/api/client';
import ProductionBelt from '../components/production-belt/ProductionBelt';
import type { Fabrica } from '../types';

export default function FabricaPage() {
  const { fabricaId } = useParams<{ fabricaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch Fabrica data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no fabricaId provided, get latest and redirect
        let targetFabricaId = fabricaId;
        if (!targetFabricaId) {
          try {
            const latestFabrica = await publicApi.getLatestFabrica();
            targetFabricaId = latestFabrica.id;
            // Redirect to /show/:id to include the ID in the URL
            navigate(`/show/${targetFabricaId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, { replace: true });
            return;
          } catch (latestErr: any) {
            setError('No se pudo cargar la última Fabrica');
            setLoading(false);
            return;
          }
        }

        const fabricaData = await publicApi.getFabrica(targetFabricaId);
        setFabrica(fabricaData);
      } catch (err: any) {
        console.error('Error fetching Fabrica data:', err);
        setError(err?.message || 'Error al cargar la Fabrica');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fabricaId, searchParams, navigate]);

  // Initial timestamp from URL query params
  const initialTimestamp = searchParams.get('t') 
    ? parseFloat(searchParams.get('t')!) 
    : undefined;

  if (loading) {
    return (
      <main className="fabrica-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p>Cargando fábrica...</p>
      </main>
    );
  }

  if (error || !fabrica) {
    return (
      <main style={{ padding: '24px', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error || 'Fabrica no encontrada'}</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  return (
    <main className="fabrica-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Production Belt Component */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ProductionBelt 
          fabricaId={fabrica.id} 
          initialTimestamp={initialTimestamp}
          style={{ height: '100%' }}
        />
      </div>
    </main>
  );
}
