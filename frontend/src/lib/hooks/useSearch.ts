import { useState, useCallback } from 'react';

export function useSearch<T>(items: T[], searchKey: keyof T) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(items);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setResults(items);
      return;
    }

    const filtered = items.filter((item) => {
      const value = item[searchKey];
      return String(value)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
    setResults(filtered);
  }, [items, searchKey]);

  return {
    query,
    results,
    search,
  };
}