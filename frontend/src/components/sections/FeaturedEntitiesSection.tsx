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

        // Helper function to fetch entities by their IDs
        const fetchEntitiesByIds = async <T extends { id: string }>(
          ids: string[],
          fetchFn: (id: string) => Promise<T>,
          fallbackFn?: () => Promise<T[]>
        ): Promise<T[]> => {
          if (ids.length > 0) {
            // Fetch all entities in parallel, filtering out nulls for missing entities
            const results = await Promise.all(
              ids.map(id => 
                fetchFn(id).catch((err) => {
                  console.warn(`Failed to fetch entity ${id}:`, err);
                  return null;
                })
              )
            );
            
            // Filter out nulls and maintain order from config
            return results.filter((e): e is T => e !== null);
          }
          
          // Fallback: return first 5 if no IDs configured and fallback function provided
          if (fallbackFn) {
            const allEntities = await fallbackFn();
            return allEntities.slice(0, 5);
          }
          
          return [];
        };

        // Fetch featured entities by ID from config, with fallback
        const [
          fabricasRaw,
          canciones,
          proveedoresRaw,
          jinglerosRaw,
          jingles,
          tematicas,
        ] = await Promise.all([
          fetchEntitiesByIds(
            featuredEntitiesConfig.fabricas, 
            (id) => publicApi.getFabrica(id),
            () => publicApi.getFabricas()
          ),
          fetchEntitiesByIds(
            featuredEntitiesConfig.canciones, 
            (id) => publicApi.getCancion(id),
            () => publicApi.getCanciones()
          ),
          fetchEntitiesByIds(
            featuredEntitiesConfig.proveedores, 
            (id) => publicApi.getArtista(id),
            () => publicApi.getArtistas()
          ),
          fetchEntitiesByIds(
            featuredEntitiesConfig.jingleros, 
            (id) => publicApi.getArtista(id),
            () => publicApi.getArtistas()
          ),
          fetchEntitiesByIds(
            featuredEntitiesConfig.jingles, 
            (id) => publicApi.getJingle(id),
            () => publicApi.getJingles()
          ),
          fetchEntitiesByIds(
            featuredEntitiesConfig.tematicas, 
            (id) => publicApi.getTematica(id),
            () => publicApi.getTematicas()
          ),
        ]);

        // Filter fabricas to only those with date property
        const fabricas = fabricasRaw.filter((f) => f.date) as Fabrica[];

        // For proveedores and jingleros, show all artistas from config
        // (no relationship validation needed since they're explicitly selected)
        const proveedores = proveedoresRaw;
        const jingleros = jinglerosRaw;

        setEntities({
          fabricas,
          canciones,
          proveedores,
          jingleros,
          jingles,
          tematicas,
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

