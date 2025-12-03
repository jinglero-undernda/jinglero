/**
 * JingleCancionMatchModal Component
 * 
 * WORKFLOW_011: Jingle-Cancion Matching and Relationship Creation
 * Allows admins to match Jingles without Cancion relationships by parsing comments,
 * searching database and MusicBrainz, and creating missing entities and relationships.
 */

import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api/client';
import { parseJingleComment, type ParsedComment } from '../../lib/utils/commentParser';
import { searchDatabaseCanciones } from '../../lib/utils/fuzzyMatch';
import type { Jingle, Cancion, Artista } from '../../types';

interface JingleCancionMatchModalProps {
  jingleId: string;
  isOpen: boolean;
  onClose: () => void;
}

type Match = 
  | { type: 'database'; cancion: Cancion; similarity: number }
  | { type: 'musicbrainz'; match: {
      musicBrainzId: string;
      title: string;
      artist?: string;
      artistMusicBrainzId?: string;
      confidence: number;
      source: 'musicbrainz_search' | 'musicbrainz_lookup';
      album?: string;
      year?: number;
      genre?: string;
    }};

export default function JingleCancionMatchModal({
  jingleId,
  isOpen,
  onClose,
}: JingleCancionMatchModalProps) {
  const [jingle, setJingle] = useState<Jingle | null>(null);
  const [parsedData, setParsedData] = useState<ParsedComment | null>(null);
  const [databaseMatches, setDatabaseMatches] = useState<Array<{ cancion: Cancion; similarity: number }>>([]);
  const [musicBrainzMatches, setMusicBrainzMatches] = useState<Array<{
    musicBrainzId: string;
    title: string;
    artist?: string;
    artistMusicBrainzId?: string;
    confidence: number;
    source: 'musicbrainz_search' | 'musicbrainz_lookup';
    album?: string;
    year?: number;
    genre?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false);
  const [isSearchingMusicBrainz, setIsSearchingMusicBrainz] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [success, setSuccess] = useState(false);
  // Editable search terms
  const [searchSongTitle, setSearchSongTitle] = useState<string>('');
  const [searchArtistName, setSearchArtistName] = useState<string>('');

  // Perform search with given terms
  const performSearch = async (songTitle: string, artistName?: string) => {
    if (!songTitle || songTitle.trim().length === 0) {
      setDatabaseMatches([]);
      setMusicBrainzMatches([]);
      return;
    }

    setIsSearchingDatabase(true);
    setIsSearchingMusicBrainz(true);
    setError(null);

    try {
      const [dbResults, mbResults] = await Promise.all([
        searchDatabaseCanciones(songTitle, artistName).catch((err) => {
          console.error('Database search error:', err);
          return [];
        }),
        adminApi.searchMusicBrainz({
          title: songTitle,
          artist: artistName,
          limit: 10,
        }).catch((err) => {
          console.error('MusicBrainz search error:', err);
          return [];
        }),
      ]);

      setDatabaseMatches(dbResults);
      setMusicBrainzMatches(mbResults);
    } catch (err: any) {
      setError(err.message || 'Error searching for matches');
    } finally {
      setIsSearchingDatabase(false);
      setIsSearchingMusicBrainz(false);
    }
  };

  // Fetch Jingle and parse comment
  useEffect(() => {
    if (!isOpen || !jingleId) return;

    const fetchAndParse = async () => {
      setIsLoading(true);
      setError(null);
      setParsedData(null);
      setDatabaseMatches([]);
      setMusicBrainzMatches([]);
      setSelectedMatch(null);
      setSuccess(false);

      try {
        // Fetch Jingle
        const jingleData = await adminApi.getJingle(jingleId);
        setJingle(jingleData);

        // Parse comment
        setIsParsing(true);
        const parsed = parseJingleComment(jingleData.comment, jingleData.title);
        setParsedData(parsed);
        setIsParsing(false);

        // Initialize editable search terms from parsed data
        setSearchSongTitle(parsed.songTitle || '');
        setSearchArtistName(parsed.artistName || '');

        // If we have a song title, search for matches
        if (parsed.songTitle) {
          await performSearch(parsed.songTitle, parsed.artistName);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading Jingle data');
        setIsLoading(false);
        setIsParsing(false);
        setIsSearchingDatabase(false);
        setIsSearchingMusicBrainz(false);
        return;
      }

      setIsLoading(false);
    };

    fetchAndParse();
  }, [isOpen, jingleId]);

  const handleSearch = () => {
    performSearch(searchSongTitle.trim(), searchArtistName.trim() || undefined);
  };

  const handleSwapFields = () => {
    const temp = searchSongTitle;
    setSearchSongTitle(searchArtistName);
    setSearchArtistName(temp);
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleCreateRelationship = async () => {
    if (!selectedMatch || !jingle) return;

    setIsCreating(true);
    setError(null);

    try {
      let cancionId: string;
      let artistaId: string | undefined;

      if (selectedMatch.type === 'database') {
        // Use existing Cancion
        cancionId = selectedMatch.cancion.id;
      } else {
        // Create Cancion and Artista from MusicBrainz match
        const mbMatch = selectedMatch.match;

        // Find or create Artista if artist name is provided
        if (mbMatch.artist) {
          let existingArtista: Artista | null = null;

          // First, try to find by MusicBrainz ID (most reliable)
          if (mbMatch.artistMusicBrainzId) {
            try {
              const searchResults = await adminApi.search({
                q: mbMatch.artistMusicBrainzId,
                types: 'artistas',
                limit: 10,
              });
              
              // Check if any artista has matching MusicBrainz ID
              existingArtista = searchResults.artistas.find(
                (a: Artista) => a.musicBrainzId === mbMatch.artistMusicBrainzId
              ) || null;
            } catch (err) {
              console.warn('Error searching for artista by MusicBrainz ID:', err);
            }
          }

          // If not found by MusicBrainz ID, search by name
          if (!existingArtista) {
            try {
              const searchResults = await adminApi.search({
                q: mbMatch.artist,
                types: 'artistas',
                limit: 20,
              });

              // Use fuzzy matching to find best match
              const artistas = searchResults.artistas;
              if (artistas.length > 0) {
                // Calculate similarity for each artista
                const matches = artistas.map((artista: Artista) => {
                  const stageName = artista.stageName || '';
                  const name = artista.name || '';
                  const searchName = mbMatch.artist.toLowerCase().trim();
                  
                  // Check exact match first
                  if (stageName.toLowerCase().trim() === searchName || 
                      name.toLowerCase().trim() === searchName) {
                    return { artista, similarity: 1.0 };
                  }
                  
                  // Check if search name contains or is contained in artista name
                  const stageNameLower = stageName.toLowerCase();
                  const nameLower = name.toLowerCase();
                  if (stageNameLower.includes(searchName) || searchName.includes(stageNameLower) ||
                      nameLower.includes(searchName) || searchName.includes(nameLower)) {
                    return { artista, similarity: 0.8 };
                  }
                  
                  return { artista, similarity: 0.5 };
                });

                // Sort by similarity and take the best match if similarity is high enough
                matches.sort((a, b) => b.similarity - a.similarity);
                if (matches.length > 0 && matches[0].similarity >= 0.8) {
                  existingArtista = matches[0].artista;
                }
              }
            } catch (err) {
              console.warn('Error searching for artista by name:', err);
            }
          }

          // Use existing artista or create new one
          if (existingArtista) {
            artistaId = existingArtista.id;
          } else {
            const artista = await adminApi.createArtista({
              stageName: mbMatch.artist,
              musicBrainzId: mbMatch.artistMusicBrainzId,
            });
            artistaId = artista.id;
          }
        }

        // Find or create Cancion
        let existingCancion: Cancion | null = null;

        // Try to find by MusicBrainz ID first
        if (mbMatch.musicBrainzId) {
          try {
            const searchResults = await adminApi.search({
              q: mbMatch.musicBrainzId,
              types: 'canciones',
              limit: 10,
            });
            
            // Check if any cancion has matching MusicBrainz ID
            existingCancion = searchResults.canciones.find(
              (c: Cancion) => c.musicBrainzId === mbMatch.musicBrainzId
            ) || null;
          } catch (err) {
            console.warn('Error searching for cancion by MusicBrainz ID:', err);
          }
        }

        // If not found by MusicBrainz ID, search by title and artist
        if (!existingCancion) {
          try {
            const searchResults = await adminApi.search({
              q: mbMatch.title,
              types: 'canciones',
              limit: 20,
            });

            // Use fuzzy matching to find best match
            const canciones = searchResults.canciones;
            if (canciones.length > 0) {
              const matches = canciones.map((cancion: Cancion) => {
                const titleLower = cancion.title.toLowerCase().trim();
                const searchTitle = mbMatch.title.toLowerCase().trim();
                
                // Exact match
                if (titleLower === searchTitle) {
                  return { cancion, similarity: 1.0 };
                }
                
                // Partial match
                if (titleLower.includes(searchTitle) || searchTitle.includes(titleLower)) {
                  return { cancion, similarity: 0.8 };
                }
                
                return { cancion, similarity: 0.5 };
              });

              // Sort by similarity and take the best match if similarity is high enough
              matches.sort((a, b) => b.similarity - a.similarity);
              if (matches.length > 0 && matches[0].similarity >= 0.9) {
                existingCancion = matches[0].cancion;
              }
            }
          } catch (err) {
            console.warn('Error searching for cancion by title:', err);
          }
        }

        // Use existing cancion or create new one
        if (existingCancion) {
          cancionId = existingCancion.id;
        } else {
          const cancion = await adminApi.createCancion({
            title: mbMatch.title,
            musicBrainzId: mbMatch.musicBrainzId,
            album: mbMatch.album,
            year: mbMatch.year,
            genre: mbMatch.genre,
          });
          cancionId = cancion.id;
        }

        // Create AUTOR_DE relationship if we have an artist
        if (artistaId) {
          await adminApi.post('/relationships/autor_de', {
            start: artistaId,
            end: cancionId,
            status: 'DRAFT',
          });
        }
      }

      // Create VERSIONA relationship
      await adminApi.post('/relationships/versiona', {
        start: jingleId,
        end: cancionId,
        status: 'DRAFT',
      });

      setSuccess(true);
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error creating relationship');
      setIsCreating(false);
    }
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return '#2e7d32'; // Green
    if (score >= 0.6) return '#f57c00'; // Orange
    return '#c62828'; // Red
  };

  const getConfidenceLabel = (score: number): string => {
    if (score >= 0.8) return 'Alta';
    if (score >= 0.6) return 'Media';
    return 'Baja';
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001, // Above CleanupResultsModal
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Match Jingle to Cancion"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#333',
              }}
            >
              Arreglar Jingle - Cancion
            </h2>
            {jingle && (
              <p
                style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#666',
                }}
              >
                {jingle.title || jingle.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.25rem 0.5rem',
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              marginBottom: '1rem',
              color: '#c62828',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '4px',
              marginBottom: '1rem',
              color: '#2e7d32',
            }}
          >
            <strong>✓ Relación creada exitosamente</strong>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando datos del Jingle...</p>
          </div>
        )}

        {/* Parsed Data and Search Inputs */}
        {parsedData && !isLoading && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>
              Información Extraída y Búsqueda
            </h3>
            
            {/* Editable Search Fields */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                Título de Canción
                {parsedData.songTitle && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: getConfidenceColor(
                        parsedData.confidence.songTitle === 'high' ? 0.9 :
                        parsedData.confidence.songTitle === 'medium' ? 0.7 : 0.5
                      ),
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'normal',
                    }}
                  >
                    {parsedData.confidence.songTitle === 'high' ? 'Alta' :
                     parsedData.confidence.songTitle === 'medium' ? 'Media' : 'Baja'}
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  value={searchSongTitle}
                  onChange={(e) => setSearchSongTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Título de la canción"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                  }}
                />
                <button
                  onClick={handleSwapFields}
                  type="button"
                  title="Intercambiar Título y Artista"
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '2.5rem',
                    height: '2.5rem',
                  }}
                  aria-label="Intercambiar Título y Artista"
                >
                  ⇄
                </button>
              </div>
              
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                Artista (opcional)
                {parsedData.artistName && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: getConfidenceColor(
                        parsedData.confidence.artistName === 'high' ? 0.9 :
                        parsedData.confidence.artistName === 'medium' ? 0.7 : 0.5
                      ),
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'normal',
                    }}
                  >
                    {parsedData.confidence.artistName === 'high' ? 'Alta' :
                     parsedData.confidence.artistName === 'medium' ? 'Media' : 'Baja'}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={searchArtistName}
                onChange={(e) => setSearchArtistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Nombre del artista"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem',
                }}
              />
              
              <button
                onClick={handleSearch}
                disabled={!searchSongTitle.trim() || isSearchingDatabase || isSearchingMusicBrainz}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: searchSongTitle.trim() && !isSearchingDatabase && !isSearchingMusicBrainz ? '#1976d2' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: searchSongTitle.trim() && !isSearchingDatabase && !isSearchingMusicBrainz ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {isSearchingDatabase || isSearchingMusicBrainz ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {/* Additional Parsed Info */}
            {parsedData.timestampFormatted && (
              <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                <strong>Timestamp:</strong> {parsedData.timestampFormatted}
              </div>
            )}
            {jingle?.comment && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.875rem', color: '#666' }}>
                  Ver comentario original
                </summary>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                  {jingle.comment}
                </p>
              </details>
            )}
          </div>
        )}

        {/* Database Matches */}
        {!isLoading && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>
              Coincidencias en Base de Datos
              {isSearchingDatabase && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>(Buscando...)</span>}
            </h3>
            {databaseMatches.length === 0 && !isSearchingDatabase && (
              <p style={{ color: '#666', fontSize: '0.875rem' }}>No se encontraron coincidencias en la base de datos.</p>
            )}
            {databaseMatches.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {databaseMatches.map((match, idx) => {
                  const isSelected = selectedMatch?.type === 'database' && selectedMatch.cancion.id === match.cancion.id;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        border: `2px solid ${isSelected ? '#1976d2' : '#ddd'}`,
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                        backgroundColor: isSelected ? '#e3f2fd' : '#fafafa',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleSelectMatch({ type: 'database', cancion: match.cancion, similarity: match.similarity })}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong>{match.cancion.title}</strong>
                          {match.cancion.autorIds && match.cancion.autorIds.length > 0 && (
                            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                              Artistas: {match.cancion.autorIds.length}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: getConfidenceColor(match.similarity),
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {Math.round(match.similarity * 100)}% - {getConfidenceLabel(match.similarity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MusicBrainz Matches */}
        {!isLoading && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>
              Coincidencias en MusicBrainz
              {isSearchingMusicBrainz && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>(Buscando...)</span>}
            </h3>
            {musicBrainzMatches.length === 0 && !isSearchingMusicBrainz && (
              <p style={{ color: '#666', fontSize: '0.875rem' }}>No se encontraron coincidencias en MusicBrainz.</p>
            )}
            {musicBrainzMatches.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {musicBrainzMatches.map((match, idx) => {
                  const isSelected = selectedMatch?.type === 'musicbrainz' && selectedMatch.match.musicBrainzId === match.musicBrainzId;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        border: `2px solid ${isSelected ? '#1976d2' : '#ddd'}`,
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                        backgroundColor: isSelected ? '#e3f2fd' : '#fafafa',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleSelectMatch({ type: 'musicbrainz', match })}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong>{match.title}</strong>
                          {match.artist && (
                            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                              Artista: {match.artist}
                            </div>
                          )}
                          {(match.album || match.year) && (
                            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                              {match.album && `${match.album}`}
                              {match.year && ` (${match.year})`}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: getConfidenceColor(match.confidence),
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {Math.round(match.confidence * 100)}% - {getConfidenceLabel(match.confidence)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Cancelar
          </button>
          {selectedMatch && (
            <button
              onClick={handleCreateRelationship}
              disabled={isCreating}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2e7d32',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: isCreating ? 0.6 : 1,
              }}
            >
              {isCreating ? 'Creando...' : 'Crear Relación'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

