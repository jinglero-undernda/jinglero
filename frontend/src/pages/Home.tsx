import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../lib/api/client';
import { SearchBar } from '../components/search/SearchBar';
import EntityCard from '../components/common/EntityCard';
import type { Fabrica } from '../types';
import '../styles/pages/home.css';

export default function Home() {
  const navigate = useNavigate();
  const [featuredFabricas, setFeaturedFabricas] = useState<Fabrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch featured Fabricas (most recent, limit to 6)
    const fetchFeaturedFabricas = async () => {
      try {
        setLoading(true);
        // Use the public API to get Fabricas, ordered by date (most recent first)
        // The API returns them ordered by createdAt DESC, but we want by date DESC
        const fabricas = await publicApi.getFabricas();
        // Sort by date descending and take first 6
        const sorted = fabricas
          .filter((f: Fabrica) => f.date)
          .sort((a: Fabrica, b: Fabrica) => {
            try {
              const dateA = new Date(a.date).getTime();
              const dateB = new Date(b.date).getTime();
              if (isNaN(dateA) || isNaN(dateB)) return 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          })
          .slice(0, 6);
        setFeaturedFabricas(sorted);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las Fábricas');
        setLoading(false);
        setFeaturedFabricas([]);
      }
    };

    fetchFeaturedFabricas();
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <main className="home-page">
      <div className="home-page__hero">
        <h1>La Usina de la Fábrica de Jingles</h1>
        <p className="home-page__subtitle">
          Plataforma de curación de clips y jingles
        </p>
        <div className="home-page__search-bar">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar jingles, canciones, artistas, temáticas, fábricas..."
          />
        </div>
      </div>

      {loading && (
        <div className="home-page__loading">
          <p>Cargando...</p>
        </div>
      )}

      {error && (
        <div className="home-page__error">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <section className="home-page__featured">
          <h2 className="home-page__section-title">
            <span className="home-page__section-icon">🏭</span>
            Fábricas Destacadas
          </h2>
          {featuredFabricas.length > 0 ? (
            <div className="home-page__fabricas-grid">
              {featuredFabricas.map((fabrica) => (
                <EntityCard
                  key={fabrica.id}
                  entity={fabrica}
                  entityType="fabrica"
                  variant="contents"
                />
              ))}
            </div>
          ) : (
            <p className="home-page__empty">
              No hay Fábricas disponibles en este momento.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
