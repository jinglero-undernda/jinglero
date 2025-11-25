import type { EntityType } from "../../components/common/EntityCard";
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from "../../types";

/**
 * Union type representing any related entity
 */
export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;

/**
 * Sort key options for entity sorting
 */
export type SortKey = 'timestamp' | 'date' | 'stageName' | 'title' | 'name' | 'category';

/**
 * Sorts entities based on sortKey
 *
 * This function provides sorting logic for different entity types based on various
 * sort keys. It handles type-specific sorting rules and edge cases.
 *
 * @param entities - Array of entities to sort (generic type extending RelatedEntity)
 * @param sortKey - Optional sort key to determine sorting strategy
 * @param entityType - Optional entity type to enable type-specific sorting (e.g., category for tematica)
 * @returns Sorted array of entities (new array, original not modified)
 *
 * @example
 * // Sort jingles by timestamp
 * const sorted = sortEntities(jingles, 'timestamp');
 *
 * // Sort tematicas by category (then by name)
 * const sorted = sortEntities(tematicas, 'category', 'tematica');
 *
 * // Sort artistas by stage name
 * const sorted = sortEntities(artistas, 'stageName');
 */
export function sortEntities<T extends RelatedEntity>(
  entities: T[],
  sortKey?: SortKey,
  entityType?: EntityType
): T[] {
  if (!sortKey || entities.length === 0) return entities;

  const sorted = [...entities];

  switch (sortKey) {
    case 'timestamp':
      return sorted.sort((a, b) => {
        const aTimestamp = (a as Jingle).timestamp;
        const bTimestamp = (b as Jingle).timestamp;
        
        // Timestamps are now always numbers (seconds) after BUG_0010 migration
        const aSeconds = typeof aTimestamp === 'number' ? aTimestamp : 0;
        const bSeconds = typeof bTimestamp === 'number' ? bTimestamp : 0;
        
        return aSeconds - bSeconds;
      });

    case 'date':
      return sorted.sort((a, b) => {
        const aDate = (a as Fabrica).date || (a as Jingle).createdAt || '';
        const bDate = (b as Fabrica).date || (b as Jingle).createdAt || '';
        return new Date(bDate).getTime() - new Date(aDate).getTime(); // Descending
      });

    case 'stageName':
      return sorted.sort((a, b) => {
        const aName = (a as Artista).stageName || (a as Artista).name || '';
        const bName = (b as Artista).stageName || (b as Artista).name || '';
        return aName.localeCompare(bName);
      });

    case 'title':
      return sorted.sort((a, b) => {
        const aTitle = (a as Cancion | Fabrica | Jingle).title || '';
        const bTitle = (b as Cancion | Fabrica | Jingle).title || '';
        return aTitle.localeCompare(bTitle);
      });

    case 'name':
      return sorted.sort((a, b) => {
        const aName = (a as Tematica | Artista).name || '';
        const bName = (b as Tematica | Artista).name || '';
        return aName.localeCompare(bName);
      });

    case 'category':
      // For tematicas: sort by category first, then name
      if (entityType === 'tematica') {
        return sorted.sort((a, b) => {
          const aCat = (a as Tematica).category || '';
          const bCat = (b as Tematica).category || '';
          if (aCat !== bCat) return aCat.localeCompare(bCat);
          const aName = (a as Tematica).name || '';
          const bName = (b as Tematica).name || '';
          return aName.localeCompare(bName);
        });
      }
      return sorted;

    default:
      return sorted;
  }
}

/**
 * Custom sort function for REPEATS relationships
 * Primary: fabricaDate ascending (earliest first)
 * Secondary: Ineditos (no fabricaDate) at bottom
 * Tertiary: createdAt ascending for Ineditos
 * 
 * @param jingles - Array of Jingle entities to sort
 * @returns Sorted array of Jingle entities (new array, original not modified)
 */
export function sortJingleRepeats(jingles: Jingle[]): Jingle[] {
  return [...jingles].sort((a, b) => {
    const aDate = a.fabricaDate ? new Date(a.fabricaDate).getTime() : null;
    const bDate = b.fabricaDate ? new Date(b.fabricaDate).getTime() : null;

    // Both have fabricaDate: sort ascending (earliest first)
    if (aDate !== null && bDate !== null) {
      return aDate - bDate;
    }

    // One is Inedito: Inedito goes to bottom
    if (aDate === null && bDate !== null) return 1;
    if (aDate !== null && bDate === null) return -1;

    // Both are Inedito: sort by createdAt ascending
    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    return aCreated - bCreated;
  });
}

