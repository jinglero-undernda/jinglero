import { useState, useEffect } from 'react';
import { publicApi } from '../../lib/api/client';
import EntityCard from '../common/EntityCard';
import { extractRelationshipData } from '../../lib/utils/relationshipDataExtractor';
import type { Fabrica, Jingle, Cancion, Artista, Tematica } from '../../types';
import featuredEntitiesConfig from '../../lib/config/featuredEntities.json';
import '../../styles/sections/featured-entities-section.css';

interface FeaturedEntities {
  fabricas: Fabrica[];
  canciones: Cancion[];
  proveedores: Artista[];
  jingleros: Artista[];
  jingles: Jingle[];
  tematicas: Tematica[];
}

export default function FeaturedEntitiesSection() {
  const [entities, setEntities] = useState<FeaturedEntities>({
    fabricas: [],
    canciones: [],
    proveedores: [],
    jingleros: [],
    jingles: [],
    tematicas: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedEntities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all entities in parallel
        const [fabricas, canciones, artistas, jingles, tematicas, autorDeRels, jingleroDeRels] = await Promise.all([
          publicApi.getFabricas(),
          publicApi.getCanciones(),
          publicApi.getArtistas(),
          publicApi.getJingles(),
          publicApi.getTematicas(),
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

        // Filter and get artistas
        const proveedores = artistas.filter((a) => proveedoresIds.has(a.id));
        const jingleros = artistas.filter((a) => jinglerosIds.has(a.id));

        // Helper function to get featured entities by IDs, or fallback to first 5 if config is empty
        const getFeaturedEntities = <T extends { id: string }>(
          allEntities: T[],
          configIds: string[]
        ): T[] => {
          if (configIds.length > 0) {
            // Filter by configured IDs and maintain order
            const entityMap = new Map(allEntities.map(e => [e.id, e]));
            return configIds
              .map(id => entityMap.get(id))
              .filter((e): e is T => e !== undefined);
          }
          // Fallback: return first 5 if no IDs configured
          return allEntities.slice(0, 5);
        };

        setEntities({
          fabricas: getFeaturedEntities(fabricas.filter((f) => f.date), featuredEntitiesConfig.fabricas) as Fabrica[],
          canciones: getFeaturedEntities(canciones, featuredEntitiesConfig.canciones) as Cancion[],
          proveedores: getFeaturedEntities(proveedores, featuredEntitiesConfig.proveedores) as Artista[],
          jingleros: getFeaturedEntities(jingleros, featuredEntitiesConfig.jingleros) as Artista[],
          jingles: getFeaturedEntities(jingles, featuredEntitiesConfig.jingles) as Jingle[],
          tematicas: getFeaturedEntities(tematicas, featuredEntitiesConfig.tematicas) as Tematica[],
        });
      } catch (err: any) {
        console.error('Error fetching featured entities:', err);
        setError(err.message || 'Error al cargar las entidades destacadas');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEntities();
  }, []);

  if (loading) {
    return (
      <section className="featured-entities-section">
        <div className="featured-entities-section__loading">Cargando entidades destacadas...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-entities-section">
        <div className="featured-entities-section__error">Error: {error}</div>
      </section>
    );
  }

  const sections = [
    { key: 'fabricas', label: 'Fábricas Destacadas', icon: '🏭', entities: entities.fabricas, type: 'fabrica' as const },
    { key: 'canciones', label: 'Materiales (Canciones) Destacadas', icon: '🎵', entities: entities.canciones, type: 'cancion' as const },
    { key: 'proveedores', label: 'Proveedores Destacados', icon: '👤', entities: entities.proveedores, type: 'artista' as const },
    { key: 'jingleros', label: 'Jingleros Destacados', icon: '🎤', entities: entities.jingleros, type: 'artista' as const },
    { key: 'jingles', label: 'Jingles Destacados', icon: '📻', entities: entities.jingles, type: 'jingle' as const },
    { key: 'tematicas', label: 'Temáticas Destacadas', icon: '🏷️', entities: entities.tematicas, type: 'tematica' as const },
  ];

  return (
    <section className="featured-entities-section">
      {sections.map((section) => (
        <div key={section.key} className="featured-entities-section__subsection">
          <h2 className="featured-entities-section__title">
            <span className="featured-entities-section__icon">{section.icon}</span>
            {section.label}
          </h2>
          {section.entities.length > 0 ? (
            <div className="featured-entities-section__list">
              {section.entities.map((entity) => {
                const relationshipData = extractRelationshipData(entity, section.type);
                return (
                  <EntityCard
                    key={entity.id}
                    entity={entity}
                    entityType={section.type}
                    variant="contents"
                    relationshipData={relationshipData}
                  />
                );
              })}
            </div>
          ) : (
            <p className="featured-entities-section__empty">No hay {section.label.toLowerCase()} disponibles.</p>
          )}
        </div>
      ))}
    </section>
  );
}

