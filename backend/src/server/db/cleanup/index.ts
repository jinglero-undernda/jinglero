/**
 * Cleanup Script Registry
 * 
 * This module provides a registry of all available cleanup scripts
 * and their metadata. Scripts are organized by entity type.
 */

export interface ScriptMetadata {
  id: string;
  name: string;
  description: string;
  entityType: string;
  category: 'fabricas' | 'jingles' | 'canciones' | 'artistas' | 'general';
  automatable: boolean;
  estimatedDuration: string;
  usesMusicBrainz: boolean;
}

export interface ScriptExecutionResult {
  scriptId: string;
  scriptName: string;
  totalFound: number;
  executionTime: number; // milliseconds
  timestamp: string; // ISO 8601
  entities: EntityIssue[];
  suggestions: SuggestionSummary[];
  musicBrainzCalls?: number;
  musicBrainzErrors?: MusicBrainzError[];
}

export interface EntityIssue {
  entityType: string;
  entityId: string;
  entityTitle?: string;
  issue: string;
  currentValue: any;
  suggestion?: Suggestion;
}

export interface Suggestion {
  type: 'update' | 'create' | 'delete' | 'relationship';
  field?: string;
  recommendedValue?: any;
  automatable: boolean;
  requiresManualReview: boolean;
  musicBrainzMatch?: MusicBrainzMatch;
}

export interface MusicBrainzMatch {
  musicBrainzId: string;
  title: string;
  artist?: string;
  confidence: number; // 0.0 to 1.0
  source: 'musicbrainz_search' | 'musicbrainz_lookup';
  alternatives?: MusicBrainzMatch[];
}

export interface SuggestionSummary {
  type: string;
  field?: string;
  count: number;
  automatable: number;
  requiresReview: number;
}

export interface MusicBrainzError {
  entityId: string;
  error: string;
  retryable: boolean;
}

export type ScriptExecutor = () => Promise<ScriptExecutionResult>;
export type AutomationExecutor = (entityIds: string[], applyLowConfidence: boolean) => Promise<AutomationResult>;

export interface AutomationResult {
  scriptId: string;
  totalRequested: number;
  totalApplied: number;
  successful: number;
  failed: number;
  skipped: number;
  results: AutomationResultItem[];
  skippedEntities?: SkippedEntity[];
  errors: AutomationError[];
}

export interface AutomationResultItem {
  entityId: string;
  status: 'success' | 'failed';
  changes?: Record<string, any>;
  musicBrainzId?: string;
  confidence?: number;
  error?: string;
}

export interface SkippedEntity {
  entityId: string;
  reason: string;
  confidence?: number;
}

export interface AutomationError {
  entityId: string;
  error: string;
  code?: string;
  retryable: boolean;
}

// Script registry - maps script ID to metadata and executor
const scriptRegistry = new Map<string, {
  metadata: ScriptMetadata;
  execute: ScriptExecutor;
  automate?: AutomationExecutor;
}>();

/**
 * Register a cleanup script
 */
export function registerScript(
  metadata: ScriptMetadata,
  execute: ScriptExecutor,
  automate?: AutomationExecutor
): void {
  scriptRegistry.set(metadata.id, {
    metadata,
    execute,
    automate,
  });
}

/**
 * Get all registered scripts
 */
export function getAllScripts(): ScriptMetadata[] {
  return Array.from(scriptRegistry.values()).map(s => s.metadata);
}

/**
 * Get script metadata by ID
 */
export function getScriptMetadata(scriptId: string): ScriptMetadata | undefined {
  return scriptRegistry.get(scriptId)?.metadata;
}

/**
 * Execute a script by ID
 */
export async function executeScript(scriptId: string): Promise<ScriptExecutionResult> {
  const script = scriptRegistry.get(scriptId);
  if (!script) {
    throw new Error(`Script not found: ${scriptId}`);
  }
  return script.execute();
}

/**
 * Automate fixes for a script by ID
 */
export async function automateScript(
  scriptId: string,
  entityIds: string[],
  applyLowConfidence: boolean = false
): Promise<AutomationResult> {
  const script = scriptRegistry.get(scriptId);
  if (!script) {
    throw new Error(`Script not found: ${scriptId}`);
  }
  if (!script.automate) {
    throw new Error(`Script does not support automation: ${scriptId}`);
  }
  return script.automate(entityIds, applyLowConfidence);
}

/**
 * Check if a script supports automation
 */
export function isScriptAutomatable(scriptId: string): boolean {
  const script = scriptRegistry.get(scriptId);
  return script?.automate !== undefined;
}

// Initialize scripts - import and register actual script implementations

// Fabricas scripts
import {
  findFabricasMissingJingles,
  automateFabricasMissingJingles,
  findFabricasDuplicateTimestamps,
} from './scripts/fabricas';

// Jingles scripts
import {
  findJinglesZeroTimestamp,
  automateJinglesZeroTimestamp,
  findJinglesWithoutCancion,
  automateJinglesWithoutCancion,
} from './scripts/jingles';

// Canciones scripts
import {
  findCancionWithoutMusicBrainzId,
  automateCancionMusicBrainzId,
  fillMissingCancionDetails,
  automateFillMissingCancionDetails,
  findCancionWithoutAutor,
} from './scripts/canciones';

// Artistas scripts
import {
  suggestAutorFromMusicBrainz,
  automateSuggestAutorFromMusicBrainz,
  findArtistaWithoutMusicBrainzId,
  automateArtistaMusicBrainzId,
  fillMissingAutorDetails,
  automateFillMissingAutorDetails,
} from './scripts/artistas';

// General scripts
import {
  refreshRedundantProperties,
  automateRefreshRedundantProperties,
} from './scripts/general';

// Script 1: Find Fabricas where not all Jingles are listed
registerScript(
  {
    id: 'find-fabricas-missing-jingles',
    name: 'Find Fabricas where not all Jingles are listed',
    description: 'Identifies Fabricas where the contents property contains Jingle references that are not present in the APPEARS_IN relationships',
    entityType: 'fabricas',
    category: 'fabricas',
    automatable: true,
    estimatedDuration: '5-30s',
    usesMusicBrainz: false,
  },
  findFabricasMissingJingles,
  automateFabricasMissingJingles
);

// Script 2: Find Fabricas with duplicate timestamps
registerScript(
  {
    id: 'find-fabricas-duplicate-timestamps',
    name: 'Find Fabricas with duplicate timestamps',
    description: 'Identifies Fabricas where two or more Jingles have the same timestamp, which may indicate duplicate entries or data entry errors',
    entityType: 'fabricas',
    category: 'fabricas',
    automatable: false,
    estimatedDuration: '2-10s',
    usesMusicBrainz: false,
  },
  findFabricasDuplicateTimestamps
);

// Script 3: Find Jingles with time-stamp 00:00:00
registerScript(
  {
    id: 'find-jingles-zero-timestamp',
    name: 'Find Jingles with time-stamp 00:00:00',
    description: 'Identifies Jingles with zero timestamp, which likely indicates missing or invalid timestamp data',
    entityType: 'jingles',
    category: 'jingles',
    automatable: true,
    estimatedDuration: '2-10s',
    usesMusicBrainz: false,
  },
  findJinglesZeroTimestamp,
  automateJinglesZeroTimestamp
);

// Script 4: Find Jingles without Cancion relationship
registerScript(
  {
    id: 'find-jingles-without-cancion',
    name: 'Find Jingles without Cancion relationship',
    description: 'Identifies Jingles not linked to any Cancion via VERSIONA relationship',
    entityType: 'jingles',
    category: 'jingles',
    automatable: true,
    estimatedDuration: '5-20s',
    usesMusicBrainz: false,
  },
  findJinglesWithoutCancion,
  automateJinglesWithoutCancion
);

// Script 5: Find Cancion without MusicBrainz id and suggest it from query
registerScript(
  {
    id: 'find-cancion-without-musicbrainz-id',
    name: 'Find Cancion without MusicBrainz id and suggest it from query',
    description: 'Identifies Canciones missing MusicBrainz ID and attempts to suggest matches via MusicBrainz API query',
    entityType: 'canciones',
    category: 'canciones',
    automatable: true,
    estimatedDuration: '10-60s',
    usesMusicBrainz: true,
  },
  findCancionWithoutMusicBrainzId,
  automateCancionMusicBrainzId
);

// Script 6: Fill missing Cancion details from MusicBrainz id
registerScript(
  {
    id: 'fill-missing-cancion-details',
    name: 'Fill missing Cancion details from MusicBrainz id',
    description: 'Identifies Canciones with MusicBrainz ID but incomplete metadata, then fetches missing details from MusicBrainz API',
    entityType: 'canciones',
    category: 'canciones',
    automatable: true,
    estimatedDuration: '10-60s',
    usesMusicBrainz: true,
  },
  fillMissingCancionDetails,
  automateFillMissingCancionDetails
);

// Script 7: Find Cancion without Autor asociado
registerScript(
  {
    id: 'find-cancion-without-autor',
    name: 'Find Cancion without Autor asociado',
    description: 'Identifies Canciones not linked to any Artista via AUTOR_DE relationship',
    entityType: 'canciones',
    category: 'canciones',
    automatable: false,
    estimatedDuration: '2-10s',
    usesMusicBrainz: false,
  },
  findCancionWithoutAutor
);

// Script 8: Suggest Autor from MusicBrainz, auto-generate Artista if new is needed
registerScript(
  {
    id: 'suggest-autor-from-musicbrainz',
    name: 'Suggest Autor from MusicBrainz, auto-generate Artista if new is needed',
    description: 'Identifies Canciones without AUTOR_DE relationships, queries MusicBrainz API to find artist information, and suggests creating Artista entities and AUTOR_DE relationships',
    entityType: 'canciones',
    category: 'artistas',
    automatable: true,
    estimatedDuration: '15-90s',
    usesMusicBrainz: true,
  },
  suggestAutorFromMusicBrainz,
  automateSuggestAutorFromMusicBrainz
);

// Script 9: Find Artista without MusicBrainz id and backfill based on online research
registerScript(
  {
    id: 'find-artista-without-musicbrainz-id',
    name: 'Find Artista without MusicBrainz id and backfill based on online research',
    description: 'Identifies Artistas missing MusicBrainz ID and queries MusicBrainz API to find matches',
    entityType: 'artistas',
    category: 'artistas',
    automatable: true,
    estimatedDuration: '10-60s',
    usesMusicBrainz: true,
  },
  findArtistaWithoutMusicBrainzId,
  automateArtistaMusicBrainzId
);

// Script 10: Fill missing Autor details from MusicBrainz id
registerScript(
  {
    id: 'fill-missing-autor-details',
    name: 'Fill missing Autor details from MusicBrainz id',
    description: 'Identifies Artistas with MusicBrainz ID but incomplete metadata, then fetches missing details from MusicBrainz API',
    entityType: 'artistas',
    category: 'artistas',
    automatable: true,
    estimatedDuration: '10-60s',
    usesMusicBrainz: true,
  },
  fillMissingAutorDetails,
  automateFillMissingAutorDetails
);

// Script 11: Refresh all redundant properties and empty booleans
registerScript(
  {
    id: 'refresh-redundant-properties',
    name: 'Refresh all redundant properties and empty booleans',
    description: 'Recalculates redundant properties based on current relationships and sets default values for empty boolean fields',
    entityType: 'general',
    category: 'general',
    automatable: true,
    estimatedDuration: '5-30s',
    usesMusicBrainz: false,
  },
  refreshRedundantProperties,
  automateRefreshRedundantProperties
);

