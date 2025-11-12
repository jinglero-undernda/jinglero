import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api/client';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function SearchBar({ onSearch, placeholder = 'Buscar...', initialValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Sync with initialValue prop changes (e.g., when URL changes)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  useEffect(() => {
    // debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    if (!query.trim()) {
      setSuggestions(null);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const resp = await api.get(`/search?q=${encodeURIComponent(query)}`);
        // Check if we have any results
        const hasResults = resp && (
          (resp.jingles && resp.jingles.length > 0) ||
          (resp.canciones && resp.canciones.length > 0) ||
          (resp.artistas && resp.artistas.length > 0) ||
          (resp.tematicas && resp.tematicas.length > 0) ||
          (resp.fabricas && resp.fabricas.length > 0)
        );
        setSuggestions(resp);
        setShowSuggestions(hasResults);
      } catch (err) {
        // ignore errors for now
        setSuggestions(null);
        setShowSuggestions(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  const handleSuggestionClick = (_type: string, item: any) => {
    // Build a simple query to submit to parent
    // For fabricas, use title; for others use their respective fields
    const text = item.title || item.stageName || item.name || item.songTitle;
    setQuery(String(text || ''));
    setShowSuggestions(false);
    onSearch(String(text || ''));
  };

  // Check if we have any suggestions to show
  const hasSuggestions = showSuggestions && suggestions && (
    (suggestions.jingles && suggestions.jingles.length > 0) ||
    (suggestions.canciones && suggestions.canciones.length > 0) ||
    (suggestions.artistas && suggestions.artistas.length > 0) ||
    (suggestions.tematicas && suggestions.tematicas.length > 0) ||
    (suggestions.fabricas && suggestions.fabricas.length > 0)
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} role="search" style={{ position: 'relative' }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Campo de búsqueda"
      />
      <button type="submit" aria-label="Buscar">
        Buscar
      </button>
      {hasSuggestions && (
        <div 
          role="listbox" 
          className="search-bar__suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 200,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {['jingles','canciones','artistas','tematicas','fabricas'].map((type) => (
            suggestions[type] && suggestions[type].length > 0 ? (
              <div 
                key={type} 
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <strong style={{
                  fontSize: '12px',
                  textTransform: 'capitalize',
                  color: '#333',
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 600
                }}>{type}</strong>
                <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                  {suggestions[type].slice(0,5)
                    .filter((it: any) => {
                      // Filter out items with no display text
                      // For fabricas, use title; for others use their respective fields
                      const text = it.title || it.stageName || it.name || it.songTitle;
                      return text && text.trim() !== '' && text !== 'None';
                    })
                    .map((it: any) => {
                      // For fabricas, use title; for others use their respective fields
                      const displayText = it.title || it.stageName || it.name || it.songTitle || 'Sin nombre';
                      return (
                        <li 
                          key={it.id} 
                          style={{
                            padding: '6px 8px',
                            cursor: 'pointer',
                            color: '#333',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e3f2fd';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onMouseDown={() => handleSuggestionClick(type, it)}
                        >
                          {displayText}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ) : null
          ))}
        </div>
      )}
    </form>
  );
}