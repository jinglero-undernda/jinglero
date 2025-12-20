import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api/client';
import EntityCard from '../components/common/EntityCard';
import { SearchBar } from '../components/search/SearchBar';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../types';
import { extractRelationshipData } from '../lib/utils/relationshipDataExtractor';
import '../styles/pages/search-results.css';

interface SearchResults {
  jingles: Jingle[];
  canciones: Cancion[];
  artistas: Artista[];
  tematicas: Tematica[];
  fabricas: Fabrica[];
  meta?: {
    limit: number;
    offset: number;
    types: string[];
    mode: string;
  };
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.get(`/search?q=${encodeURIComponent(query)}`)
      .then((data: SearchResults) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al realizar la búsqueda');
        setLoading(false);
        setResults(null);
      });
  }, [query]);

  const totalResults = results
    ? results.jingles.length +
      results.canciones.length +
      results.artistas.length +
      results.tematicas.length +
      results.fabricas.length
    : 0;

  const hasResults = totalResults > 0;

  return (
    <main className="search-results-page">
      <div className="search-results-page__header">
        <h1>Resultados de búsqueda</h1>
        <div className="search-results-page__search-bar">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar jingles, canciones, artistas, temáticas..."
            initialValue={query}
          />
        </div>
        {query && (
          <p className="search-results-page__query">
            Buscando: <strong>"{query}"</strong>
          </p>
        )}
      </div>

      {loading && (
        <div className="search-results-page__loading">
          <p>Buscando...</p>
        </div>
      )}

      {error && (
        <div className="search-results-page__error">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && results && (
        <>
          {hasResults ? (
            <>
              <div className="search-results-page__count">
                {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </div>

              {results.jingles.length > 0 && (
                <section className="search-results-page__section">
                  <h2 className="search-results-page__section-title">
                    <span className="search-results-page__section-icon">🎤</span>
                    Jingles ({results.jingles.length})
                  </h2>
                  <div className="search-results-page__results-grid">
                    {results.jingles.map((jingle) => {
                      const relationshipData = extractRelationshipData(jingle, 'jingle');
                      return (
                        <EntityCard
                          key={jingle.id}
                          entity={jingle}
                          entityType="jingle"
                          variant="contents"
                          relationshipData={relationshipData}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {results.canciones.length > 0 && (
                <section className="search-results-page__section">
                  <h2 className="search-results-page__section-title">
                    <span className="search-results-page__section-icon">📦</span>
                    Canciones ({results.canciones.length})
                  </h2>
                  <div className="search-results-page__results-grid">
                    {results.canciones.map((cancion) => {
                      const relationshipData = extractRelationshipData(cancion, 'cancion');
                      return (
                        <EntityCard
                          key={cancion.id}
                          entity={cancion}
                          entityType="cancion"
                          variant="contents"
                          relationshipData={relationshipData}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {results.artistas.length > 0 && (
                <section className="search-results-page__section">
                  <h2 className="search-results-page__section-title">
                    <span className="search-results-page__section-icon">👤</span>
                    Artistas ({results.artistas.length})
                  </h2>
                  <div className="search-results-page__results-grid">
                    {results.artistas.map((artista) => {
                      const relationshipData = extractRelationshipData(artista, 'artista');
                      return (
                        <EntityCard
                          key={artista.id}
                          entity={artista}
                          entityType="artista"
                          variant="contents"
                          relationshipData={relationshipData}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {results.tematicas.length > 0 && (
                <section className="search-results-page__section">
                  <h2 className="search-results-page__section-title">
                    <span className="search-results-page__section-icon">🏷️</span>
                    Temáticas ({results.tematicas.length})
                  </h2>
                  <div className="search-results-page__results-grid">
                    {results.tematicas.map((tematica) => (
                      <EntityCard
                        key={tematica.id}
                        entity={tematica}
                        entityType="tematica"
                        variant="contents"
                      />
                    ))}
                  </div>
                </section>
              )}

              {results.fabricas.length > 0 && (
                <section className="search-results-page__section">
                  <h2 className="search-results-page__section-title">
                    <span className="search-results-page__section-icon">🏭</span>
                    Fábricas ({results.fabricas.length})
                  </h2>
                  <div className="search-results-page__results-grid">
                    {results.fabricas.map((fabrica) => (
                      <EntityCard
                        key={fabrica.id}
                        entity={fabrica}
                        entityType="fabrica"
                        variant="contents"
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="search-results-page__no-results">
              <p>No se encontraron resultados para "{query}".</p>
              <p className="search-results-page__no-results-hint">
                Intenta con otros términos de búsqueda o verifica la ortografía.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

