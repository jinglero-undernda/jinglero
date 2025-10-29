import { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../lib/api/client';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Buscar...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);

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
        const resp = await publicApi.get(`/search?q=${encodeURIComponent(query)}`);
        setSuggestions(resp);
        setShowSuggestions(true);
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

  const handleSuggestionClick = (_type: string, item: any) => {
    // Build a simple query to submit to parent
    const text = item.title || item.stageName || item.name || item.songTitle || item.name;
    setQuery(String(text || ''));
    setShowSuggestions(false);
    onSearch(String(text || ''));
  };

  return (
    <form onSubmit={handleSubmit} role="search">
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
      {showSuggestions && suggestions && (
        <div role="listbox" style={{position: 'absolute', background: 'white', border: '1px solid #ccc', zIndex: 200}}>
          {['jingles','canciones','artistas','tematicas'].map((type) => (
            suggestions[type] && suggestions[type].length > 0 ? (
              <div key={type} style={{padding: '4px 8px', borderBottom: '1px solid #eee'}}>
                <strong style={{fontSize: 12, textTransform: 'capitalize'}}>{type}</strong>
                <ul style={{listStyle: 'none', margin: 4, padding: 0}}>
                  {suggestions[type].slice(0,5).map((it: any) => (
                    <li key={it.id} style={{padding: '2px 0', cursor: 'pointer'}} onMouseDown={() => handleSuggestionClick(type, it)}>
                      {it.title || it.stageName || it.name || it.songTitle || it.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          ))}
        </div>
      )}
    </form>
  );
}