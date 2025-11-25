import type { RelationshipConfig } from '../../components/common/RelatedEntities';
import {
  fetchArtistaCanciones,
  fetchArtistaJingles,
  fetchCancionAutores,
  fetchCancionJingles,
  fetchFabricaJingles,
  fetchJingleAutores,
  fetchJingleCancion,
  fetchJingleFabrica,
  fetchJingleJingleros,
  fetchJingleRepeats,
  fetchJingleTematicas,
  fetchTematicaJingles,
} from '../services/relationshipService';

/**
 * Task 32: Relationship Configuration Module
 * 
 * This module contains functions that generate relationship configurations
 * for each entity type. The actual API fetching logic is in relationshipService.ts
 */

/**
 * Generate relationship configurations for each entity type
 * Based on the Appendix specification in tasks-0001-3-1.md
 */

export function getFabricaRelationships(): RelationshipConfig[] {
  return [
    {
      label: 'Jingles',
      entityType: 'jingle',
      sortKey: 'timestamp',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchFabricaJingles(entityId),
    },
  ];
}

export function getJingleRelationships(): RelationshipConfig[] {
  return [
    {
      label: 'Fabrica',
      entityType: 'fabrica',
      sortKey: 'date',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchJingleFabrica(entityId),
      maxCardinality: 1, // Phase 3: Jingle can only be in one Fabrica
    },
    {
      label: 'Cancion',
      entityType: 'cancion',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchJingleCancion(entityId),
      maxCardinality: 1, // Phase 3: Jingle can only version one Cancion
    },
    {
      label: 'Autor',
      entityType: 'artista',
      sortKey: 'stageName',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchJingleAutores(entityId),
      isReadOnly: true, // Phase 5: Autor is derived from Cancion→AUTOR_DE→Artista
      readOnlyReason: 'Derivado de la canción',
    },
    {
      label: 'Jinglero',
      entityType: 'artista',
      sortKey: 'stageName',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchJingleJingleros(entityId),
    },
    {
      label: 'Versiones',
      entityType: 'jingle',
      sortKey: 'date',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchJingleRepeats(entityId),
    },
    {
      label: 'Tematicas',
      entityType: 'tematica',
      sortKey: 'category',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchJingleTematicas(entityId),
    },
  ];
}

export function getCancionRelationships(): RelationshipConfig[] {
  return [
    {
      label: 'Autor',
      entityType: 'artista',
      sortKey: 'stageName',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchCancionAutores(entityId),
    },
    {
      label: 'Jingles',
      entityType: 'jingle',
      sortKey: 'date',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchCancionJingles(entityId),
    },
  ];
}

export function getArtistaRelationships(): RelationshipConfig[] {
  return [
    {
      label: 'Canciones',
      entityType: 'cancion',
      sortKey: 'title',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchArtistaCanciones(entityId),
    },
    {
      label: 'Jingles',
      entityType: 'jingle',
      sortKey: 'date',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchArtistaJingles(entityId),
    },
  ];
}

export function getTematicaRelationships(): RelationshipConfig[] {
  return [
    {
      label: 'Jingles',
      entityType: 'jingle',
      sortKey: 'date',
      expandable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetchFn: (entityId: string, _entityType: string) => fetchTematicaJingles(entityId),
    },
  ];
}

/**
 * Get relationship configurations for an entity type
 */
export function getRelationshipsForEntityType(
  entityType: 'fabrica' | 'jingle' | 'cancion' | 'artista' | 'tematica'
): RelationshipConfig[] {
  switch (entityType) {
    case 'fabrica':
      return getFabricaRelationships();
    case 'jingle':
      return getJingleRelationships();
    case 'cancion':
      return getCancionRelationships();
    case 'artista':
      return getArtistaRelationships();
    case 'tematica':
      return getTematicaRelationships();
    default:
      return [];
  }
}

