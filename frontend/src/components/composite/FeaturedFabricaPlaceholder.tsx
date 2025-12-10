import React, { useEffect, useState } from 'react';
import ProductionBelt from '../production-belt/ProductionBelt';
import { publicApi } from '../../lib/api/client';
import type { Fabrica } from '../../types';
import '../../styles/components/featured-fabrica-placeholder.css';

export default function FeaturedFabricaPlaceholder() {
  const [latestFabrica, setLatestFabrica] = useState<Fabrica | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        setLoading(true);
        // Assuming getLatestFabrica exists and returns the most recent one
        const fabrica = await publicApi.getLatestFabrica();
        setLatestFabrica(fabrica);
      } catch (err) {
        console.warn("Could not fetch latest fabrica", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <section className="featured-fabrica-placeholder">
        <div className="featured-fabrica-placeholder__container" style={{ minHeight: '400px' }}>
          <p className="featured-fabrica-placeholder__message" style={{ fontSize: '18px' }}>
            Cargando fábrica destacada...
          </p>
        </div>
      </section>
    );
  }

  if (latestFabrica) {
    return (
      <section className="featured-fabrica-section" style={{ width: '100%', margin: '40px 0' }}>
         <div style={{ marginBottom: '20px', padding: '0 20px' }}>
           <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Fábrica Destacada</h2>
         </div>
         <ProductionBelt 
           fabricaId={latestFabrica.id} 
           style={{ height: '600px', border: '1px solid #eee', borderRadius: '8px' }}
           className="featured-production-belt"
         />
      </section>
    );
  }

  // Fallback to placeholder if no fabrica found
  return (
    <section className="featured-fabrica-placeholder">
      <div className="featured-fabrica-placeholder__container">
        <p className="featured-fabrica-placeholder__message">
          PROXIMAMENTE VEA AQUI LA FABRICA MAS RECIENTE
        </p>
      </div>
    </section>
  );
}
