import { useState, useEffect } from 'react';
import { publicApi } from '../../lib/api/client';
import WarningLabel from '../common/WarningLabel';
import '../../styles/sections/volumetric-indicators.css';

interface EntityCounts {
  fabricas: number;
  jingles: number;
  canciones: number;
  proveedores: number; // Artistas with AUTOR_DE
  jingleros: number; // Artistas with JINGLERO_DE
  tematicas: number;
}

export default function VolumetricIndicators() {
  const [counts, setCounts] = useState<EntityCounts>({
    fabricas: 0,
    jingles: 0,
    canciones: 0,
    proveedores: 0,
    jingleros: 0,
    tematicas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all counts from optimized volumetrics endpoint
        const response = await publicApi.get<EntityCounts>('/volumetrics');
        setCounts(response);
      } catch (err: any) {
        console.error('Error fetching volumetric indicators:', err);
        setError(err.message || 'Error al cargar los indicadores');
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <section className="volumetric-indicators">
        <div className="volumetric-indicators__loading">Cargando indicadores...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="volumetric-indicators">
        <div className="volumetric-indicators__error">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="volumetric-indicators">
      <div className="volumetric-indicators__grid">
        <WarningLabel value={counts.fabricas} label="Fábricas" size="medium" />
        <WarningLabel value={counts.jingles} label="Jingles" size="medium" />
        <WarningLabel value={counts.canciones} label="Canciones" size="medium" />
        <WarningLabel value={counts.proveedores} label="Proveedores" size="medium" />
        <WarningLabel value={counts.jingleros} label="Jingleros" size="medium" />
        <WarningLabel value={counts.tematicas} label="Temáticas" size="medium" />
      </div>
    </section>
  );
}

