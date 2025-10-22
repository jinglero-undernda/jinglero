import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../hooks/useSearch';

describe('useSearch', () => {
  const testItems = [
    { id: 1, name: 'Test Item 1' },
    { id: 2, name: 'Test Item 2' },
    { id: 3, name: 'Different Item' },
  ];

  it('should initialize with all items', () => {
    const { result } = renderHook(() => useSearch(testItems, 'name'));
    expect(result.current.results).toEqual(testItems);
    expect(result.current.query).toBe('');
  });

  it('should filter items based on search query', () => {
    const { result } = renderHook(() => useSearch(testItems, 'name'));

    act(() => {
      result.current.search('Test');
    });

    expect(result.current.results).toHaveLength(2);
    expect(result.current.query).toBe('Test');
    expect(result.current.results).toEqual([
      { id: 1, name: 'Test Item 1' },
      { id: 2, name: 'Test Item 2' },
    ]);
  });

  it('should handle empty search query', () => {
    const { result } = renderHook(() => useSearch(testItems, 'name'));

    act(() => {
      result.current.search('');
    });

    expect(result.current.results).toEqual(testItems);
    expect(result.current.query).toBe('');
  });

  it('should be case insensitive', () => {
    const { result } = renderHook(() => useSearch(testItems, 'name'));

    act(() => {
      result.current.search('test');
    });

    expect(result.current.results).toHaveLength(2);
    expect(result.current.results).toEqual([
      { id: 1, name: 'Test Item 1' },
      { id: 2, name: 'Test Item 2' },
    ]);
  });
});