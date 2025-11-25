import { describe, it, expect } from 'vitest';
import { sortEntities } from '../entitySorters';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../../types';

describe('sortEntities', () => {
  describe('timestamp sorting', () => {
    it('should sort jingles by timestamp in ascending order', () => {
      const jingles: Jingle[] = [
        { id: 'j1', timestamp: 120, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:02:00
        { id: 'j2', timestamp: 60, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:01:00
        { id: 'j3', timestamp: 180, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:03:00
      ];
      const sorted = sortEntities(jingles, 'timestamp');
      expect(sorted[0].id).toBe('j2');
      expect(sorted[1].id).toBe('j1');
      expect(sorted[2].id).toBe('j3');
    });

    it('should handle numeric timestamp format', () => {
      const jingles: Jingle[] = [
        { id: 'j1', timestamp: 120, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false },
        { id: 'j2', timestamp: 60, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false },
        { id: 'j3', timestamp: 180, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false },
      ];
      const sorted = sortEntities(jingles, 'timestamp');
      expect(sorted[0].id).toBe('j2');
      expect(sorted[1].id).toBe('j1');
      expect(sorted[2].id).toBe('j3');
    });

    it('should handle null/undefined timestamps', () => {
      const jingles: Jingle[] = [
        { id: 'j1', timestamp: 120, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:02:00
        { id: 'j2', timestamp: null as any, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false },
        { id: 'j3', timestamp: undefined as any, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false },
      ];
      const sorted = sortEntities(jingles, 'timestamp');
      expect(sorted[0].id).toBe('j2'); // null treated as 0
      expect(sorted[1].id).toBe('j3'); // undefined treated as 0
      expect(sorted[2].id).toBe('j1');
    });
  });

  describe('date sorting', () => {
    it('should sort by date in descending order', () => {
      const fabricas: Fabrica[] = [
        { id: 'f1', date: '2024-01-03', youtubeUrl: 'https://youtube.com/v1', createdAt: '2024-01-01', updatedAt: '2024-01-01', status: 'COMPLETED' },
        { id: 'f2', date: '2024-01-01', youtubeUrl: 'https://youtube.com/v2', createdAt: '2024-01-01', updatedAt: '2024-01-01', status: 'COMPLETED' },
        { id: 'f3', date: '2024-01-02', youtubeUrl: 'https://youtube.com/v3', createdAt: '2024-01-01', updatedAt: '2024-01-01', status: 'COMPLETED' },
      ];
      const sorted = sortEntities(fabricas, 'date');
      expect(sorted[0].id).toBe('f1');
      expect(sorted[1].id).toBe('f3');
      expect(sorted[2].id).toBe('f2');
    });

    it('should fall back to createdAt for jingles', () => {
      const jingles: Jingle[] = [
        { id: 'j1', timestamp: 60, createdAt: '2024-01-03', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:01:00
        { id: 'j2', timestamp: 60, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:01:00
        { id: 'j3', timestamp: 60, createdAt: '2024-01-02', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:01:00
      ];
      const sorted = sortEntities(jingles, 'date');
      expect(sorted[0].id).toBe('j1');
      expect(sorted[1].id).toBe('j3');
      expect(sorted[2].id).toBe('j2');
    });
  });

  describe('stageName sorting', () => {
    it('should sort artistas by stageName alphabetically', () => {
      const artistas: Artista[] = [
        { id: 'a1', stageName: 'Charlie', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'a2', stageName: 'Alice', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'a3', stageName: 'Bob', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const sorted = sortEntities(artistas, 'stageName');
      expect(sorted[0].id).toBe('a2');
      expect(sorted[1].id).toBe('a3');
      expect(sorted[2].id).toBe('a1');
    });

    it('should fall back to name if stageName is missing', () => {
      const artistas: Artista[] = [
        { id: 'a1', name: 'Charlie', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'a2', name: 'Alice', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'a3', name: 'Bob', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const sorted = sortEntities(artistas, 'stageName');
      expect(sorted[0].id).toBe('a2');
      expect(sorted[1].id).toBe('a3');
      expect(sorted[2].id).toBe('a1');
    });
  });

  describe('title sorting', () => {
    it('should sort canciones by title alphabetically', () => {
      const canciones: Cancion[] = [
        { id: 'c1', title: 'Zebra', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'c2', title: 'Apple', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'c3', title: 'Banana', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const sorted = sortEntities(canciones, 'title');
      expect(sorted[0].id).toBe('c2');
      expect(sorted[1].id).toBe('c3');
      expect(sorted[2].id).toBe('c1');
    });

    it('should handle empty titles', () => {
      const canciones: Cancion[] = [
        { id: 'c1', title: 'Zebra', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'c2', title: '', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'c3', title: 'Apple', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const sorted = sortEntities(canciones, 'title');
      expect(sorted[0].id).toBe('c2'); // Empty string comes first
      expect(sorted[1].id).toBe('c3');
      expect(sorted[2].id).toBe('c1');
    });
  });

  describe('name sorting', () => {
    it('should sort tematicas by name alphabetically', () => {
      const tematicas: Tematica[] = [
        { id: 't1', name: 'Zebra', category: 'CULTURA', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 't2', name: 'Apple', category: 'CULTURA', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 't3', name: 'Banana', category: 'CULTURA', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const sorted = sortEntities(tematicas, 'name');
      expect(sorted[0].id).toBe('t2');
      expect(sorted[1].id).toBe('t3');
      expect(sorted[2].id).toBe('t1');
    });
  });

  describe('category sorting', () => {
    it('should sort tematicas by category first, then by name', () => {
      const tematicas: Tematica[] = [
        { id: 't1', name: 'Zebra', category: 'CULTURA', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 't2', name: 'Apple', category: 'ACTUALIDAD', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 't3', name: 'Banana', category: 'CULTURA', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 't4', name: 'Delta', category: 'ACTUALIDAD', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const sorted = sortEntities(tematicas, 'category', 'tematica');
      expect(sorted[0].id).toBe('t2'); // ACTUALIDAD - Apple
      expect(sorted[1].id).toBe('t4'); // ACTUALIDAD - Delta
      expect(sorted[2].id).toBe('t3'); // CULTURA - Banana
      expect(sorted[3].id).toBe('t1'); // CULTURA - Zebra
    });

    it('should return unsorted array if entityType is not tematica', () => {
      const artistas: Artista[] = [
        { id: 'a1', name: 'Zebra', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'a2', name: 'Apple', isArg: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const sorted = sortEntities(artistas, 'category', 'artista');
      expect(sorted[0].id).toBe('a1'); // Unchanged order
      expect(sorted[1].id).toBe('a2');
    });
  });

  describe('edge cases', () => {
    it('should return empty array unchanged', () => {
      const sorted = sortEntities([], 'timestamp');
      expect(sorted).toEqual([]);
    });

    it('should return array unchanged if sortKey is not provided', () => {
      const jingles: Jingle[] = [
        { id: 'j1', timestamp: 120, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:02:00
        { id: 'j2', timestamp: 60, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:01:00
      ];
      const sorted = sortEntities(jingles);
      expect(sorted[0].id).toBe('j1'); // Unchanged order
      expect(sorted[1].id).toBe('j2');
    });

    it('should return new array (not mutate original)', () => {
      const jingles: Jingle[] = [
        { id: 'j1', timestamp: 120, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:02:00
        { id: 'j2', timestamp: 60, createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false }, // 00:01:00
      ];
      const sorted = sortEntities(jingles, 'timestamp');
      expect(sorted).not.toBe(jingles); // Different array reference
      expect(jingles[0].id).toBe('j1'); // Original unchanged
    });
  });
});


