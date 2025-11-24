import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client';
import '../../styles/components/search-bar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function SearchBar({ onSearch, placeholder = 'Buscar...', initialValue = '' }: SearchBarProps) {
  const navigate = useNavigate();
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

  const handleSuggestionClick = (type: string, item: any) => {
    // Navigate directly to the entity detail page
    setShowSuggestions(false);
    
    // Map entity type to route
    const routeMap: Record<string, string> = {
      jingles: `/j/${item.id}`,
      canciones: `/c/${item.id}`,
      artistas: `/a/${item.id}`,
      tematicas: `/t/${item.id}`,
      fabricas: `/f/${item.id}`,
    };
    
    const route = routeMap[type];
    if (route && item.id) {
      navigate(route);
    } else {
      // Fallback: if navigation fails, do a search instead
      const text = item.title || item.stageName || item.name || item.songTitle;
      setQuery(String(text || ''));
      onSearch(String(text || ''));
    }
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
    <div className="search-bar">
      <form ref={formRef} onSubmit={handleSubmit} role="search" className="search-bar__form">
        <input
          type="search"
          className="search-bar__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Campo de búsqueda"
        />
        <button type="submit" className="search-bar__button" aria-label="Buscar">
          Buscar
        </button>
        {hasSuggestions && (
          <div 
            role="listbox" 
            className="search-bar__suggestions"
          >
            {['jingles','canciones','artistas','tematicas','fabricas'].map((type) => (
              suggestions[type] && suggestions[type].length > 0 ? (
                <div 
                  key={type} 
                  className="search-bar__suggestions-group"
                >
                  <strong className="search-bar__suggestions-group-title">{type}</strong>
                  <ul className="search-bar__suggestions-list">
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
                            className="search-bar__suggestion-item"
                            onMouseDown={() => handleSuggestionClick(type, it)}
                            role="option"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSuggestionClick(type, it);
                              }
                            }}
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
    </div>
  );
}