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

        // Fetch all entities in parallel with high limit to get total counts
        // Using direct API calls with limit=10000 to ensure we get all entities
        const [fabricas, jingles, canciones, artistas, tematicas, autorDeRels, jingleroDeRels] = await Promise.all([
          publicApi.get<unknown[]>('/fabricas?limit=10000'),
          publicApi.get<unknown[]>('/jingles?limit=10000'),
          publicApi.get<unknown[]>('/canciones?limit=10000'),
          publicApi.get<unknown[]>('/artistas?limit=10000'),
          publicApi.get<unknown[]>('/tematicas?limit=10000'),
          // Get relationships for Proveedores and Jingleros
          publicApi.get<unknown[]>('/relationships/autor_de?limit=10000').catch(() => []),
          publicApi.get<unknown[]>('/relationships/jinglero_de?limit=10000').catch(() => []),
        ]);

        // Get unique artist IDs from relationships
        const proveedoresIds = new Set(
          (autorDeRels as Array<{ from?: { id?: string }; start?: { id?: string } }>)
            .map((rel) => rel.from?.id || rel.start?.id)
            .filter((id): id is string => Boolean(id))
        );

        const jinglerosIds = new Set(
          (jingleroDeRels as Array<{ from?: { id?: string }; start?: { id?: string } }>)
            .map((rel) => rel.from?.id || rel.start?.id)
            .filter((id): id is string => Boolean(id))
        );

        setCounts({
          fabricas: fabricas.length,
          jingles: jingles.length,
          canciones: canciones.length,
          proveedores: proveedoresIds.size,
          jingleros: jinglerosIds.size,
          tematicas: tematicas.length,
        });
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

