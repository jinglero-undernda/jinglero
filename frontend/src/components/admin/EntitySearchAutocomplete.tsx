/**
 * EntitySearchAutocomplete Component
 * 
 * A unified, reusable search/autocomplete component for entity selection
 * with debounced search, keyboard navigation, and entity creation support.
 * 
 * Features:
 * - Debounced search (300ms delay)
 * - Minimum 2 characters before triggering search
 * - Keyboard navigation (ArrowUp/ArrowDown, Enter, Escape)
 * - Display top 10 results per entity type
 * - Consistent entity icons and formatting
 * - Loading spinner during search
 * - Empty state with "+" create button
 * - Click outside to close dropdown
 * 
 * @example
 * ```tsx
 * <EntitySearchAutocomplete
 *   entityTypes={['jingle', 'cancion']}
 *   placeholder="Buscar jingles o canciones..."
 *   onSelect={(entity, entityType) => {
 *     console.log('Selected:', entity, entityType);
 *   }}
 *   creationContext={{
 *     fromType: 'fabrica',
 *     fromId: 'fabrica-123',
 *     relType: 'appears_in'
 *   }}
 * />
 * ```
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getEntityIcon, 
  getPrimaryText, 
  getSecondaryText,
  getEntityTypePlural,
  type EntityType,
  type Entity
} from '../../lib/utils/entityDisplay';

export interface EntitySearchAutocompleteProps {
  /** Entity types to search (e.g., ['jingle', 'cancion', 'artista']) */
  entityTypes: EntityType[];
  /** Placeholder text for input */
  placeholder?: string;
  /** Callback when entity is selected */
  onSelect: (entity: Entity, entityType: EntityType) => void;
  /** Optional: Context for entity creation (fromType, fromId, relType) */
  creationContext?: {
    fromType: string;
    fromId: string;
    relType: string;
  };
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Optional: Custom CSS class */
  className?: string;
}

interface SearchResults {
  jingles?: Entity[];
  canciones?: Entity[];
  artistas?: Entity[];
  tematicas?: Entity[];
  fabricas?: Entity[];
}

interface FlatResult {
  entity: Entity;
  entityType: EntityType;
}

const API_BASE = '/api';

export default function EntitySearchAutocomplete({
  entityTypes,
  placeholder = 'Buscar...',
  onSelect,
  creationContext,
  autoFocus = false,
  className = '',
}: EntitySearchAutocompleteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FlatResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const resultItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Map entity type to plural form for API calls
  const getTypesParam = useCallback(() => {
    return entityTypes.map(getEntityTypePlural).join(',');
  }, [entityTypes]);

  // Perform search via API
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    try {
      const typesParam = getTypesParam();
      const response = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&types=${typesParam}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResults = await response.json();
      
      // Flatten results into a single array with entity type information
      const flatResults: FlatResult[] = [];
      
      // Map plural API response keys to singular entity types
      const typeMap: Record<string, EntityType> = {
        jingles: 'jingle',
        canciones: 'cancion',
        artistas: 'artista',
        tematicas: 'tematica',
        fabricas: 'fabrica',
      };
      
      // Only include results for the requested entity types
      Object.entries(data).forEach(([key, entities]) => {
        if (key === 'meta') return; // Skip metadata
        
        const entityType = typeMap[key];
        if (entityType && entityTypes.includes(entityType) && entities && Array.isArray(entities)) {
          entities.forEach(entity => {
            flatResults.push({ entity, entityType });
          });
        }
      });
      
      setResults(flatResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [entityTypes, getTypesParam]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // If query is empty or too short, clear results
    if (!value.trim() || value.length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }
    
    // Debounce search API call (300ms)
    debounceTimerRef.current = window.setTimeout(() => {
      performSearch(value);
    }, 300);
  }, [performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev < results.length - 1 ? prev + 1 : prev;
          // Scroll into view
          if (resultItemsRef.current[next]) {
            resultItemsRef.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
          return next;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev > 0 ? prev - 1 : -1;
          // Scroll into view
          if (next >= 0 && resultItemsRef.current[next]) {
            resultItemsRef.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
          return next;
        });
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selected = results[selectedIndex];
          onSelect(selected.entity, selected.entityType);
          setQuery('');
          setResults([]);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, onSelect]);

  // Handle result item click
  const handleResultClick = useCallback((result: FlatResult) => {
    onSelect(result.entity, result.entityType);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [onSelect]);

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    if (!creationContext) return;
    
    // Map entity type to route prefix
    const routePrefixMap: Record<EntityType, string> = {
      fabrica: 'f',
      jingle: 'j',
      cancion: 'c',
      artista: 'a',
      tematica: 't',
    };
    
    // Navigate to creation page with context
    const params = new URLSearchParams({
      create: routePrefixMap[entityTypes[0]],
      from: creationContext.fromType,
      fromId: creationContext.fromId,
      relType: creationContext.relType,
    });
    
    if (query) {
      params.set('searchText', query);
    }
    
    navigate(`/admin/dashboard?${params.toString()}`);
  }, [creationContext, entityTypes, query, navigate]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Group results by entity type for display with section headers
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.entityType]) {
      acc[result.entityType] = [];
    }
    acc[result.entityType].push(result);
    return acc;
  }, {} as Record<EntityType, FlatResult[]>);

  const showNoResults = !loading && query.length >= 2 && results.length === 0;

  return (
    <div className={`entity-search-autocomplete ${className}`} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0 || (query.length >= 2 && !loading)) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#fff',
          outline: 'none',
        }}
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-controls="search-results"
        aria-expanded={isOpen}
      />
      
      {isOpen && (query.length >= 2) && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '4px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          {loading && (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px',
              }}
            >
              Buscando...
            </div>
          )}
          
          {!loading && results.length > 0 && (
            <div>
              {Object.entries(groupedResults).map(([entityType, typeResults]) => (
                <div key={entityType}>
                  <div
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#2a2a2a',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderTop: '1px solid #333',
                    }}
                  >
                    {entityType === 'jingle' && 'Jingles'}
                    {entityType === 'cancion' && 'Canciones'}
                    {entityType === 'artista' && 'Artistas'}
                    {entityType === 'tematica' && 'Temáticas'}
                    {entityType === 'fabrica' && 'Fábricas'}
                  </div>
                  {typeResults.map((result) => {
                    const globalIndex = results.indexOf(result);
                    const icon = getEntityIcon(result.entityType);
                    const primaryText = getPrimaryText(result.entity, result.entityType);
                    const secondaryText = getSecondaryText(result.entity, result.entityType);
                    const isSelected = selectedIndex === globalIndex;
                    
                    return (
                      <div
                        key={result.entity.id}
                        ref={el => { resultItemsRef.current[globalIndex] = el; }}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#333' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          color: '#fff',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {primaryText}
                          </div>
                          {secondaryText && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#999',
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }}>
                              {secondaryText}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          
          {showNoResults && (
            <div style={{ padding: '12px' }}>
              <div
                style={{
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '14px',
                  marginBottom: creationContext ? '8px' : '0',
                }}
              >
                No se encontraron resultados
              </div>
              {creationContext && (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#45a049';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4caf50';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>+</span>
                  Crear nueva entidad
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

