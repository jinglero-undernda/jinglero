/**
 * Display Properties Generation
 * 
 * Generates pre-computed display properties (displayPrimary, displaySecondary, displayBadges, normSearch)
 * for all entity types. These properties are read-only and automatically updated when
 * any relevant property or relationship changes.
 */

import { Neo4jClient } from '../db/index';

/**
 * Normalize text for search: remove accents and convert to lowercase
 * Uses Unicode normalization (NFD) to decompose characters, then removes diacritics
 * Example: "Páez" -> "paez", "José" -> "jose"
 */
function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return '';
  // Remove accents using Unicode normalization
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Convert to lowercase and trim
  return normalized.toLowerCase().trim();
}

/**
 * Format date as DD/MM/YYYY
 * Handles Neo4j DateTime objects, Date objects, ISO strings, DD/MM/YYYY strings, and null/undefined
 */
function formatDate(date: Date | string | null | undefined | any): string | null {
  if (!date) return null;
  
  let d: Date | null = null;
  
  // Handle Neo4j DateTime objects
  if (typeof date === 'object' && date.year !== undefined && date.month !== undefined && date.day !== undefined) {
    const year = typeof date.year === 'object' ? date.year.low : date.year;
    const month = typeof date.month === 'object' ? date.month.low : date.month;
    const day = typeof date.day === 'object' ? date.day.low : date.day;
    const hour = typeof date.hour === 'object' ? (date.hour?.low || 0) : (date.hour || 0);
    const minute = typeof date.minute === 'object' ? (date.minute?.low || 0) : (date.minute || 0);
    const second = typeof date.second === 'object' ? (date.second?.low || 0) : (date.second || 0);
    
    try {
      d = new Date(year, month - 1, day, hour, minute, second);
    } catch {
      return null;
    }
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'string') {
    // Try to parse DD/MM/YYYY format first (common in some systems)
    const ddMMyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = date.match(ddMMyyyyPattern);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      try {
        d = new Date(year, month - 1, day);
      } catch {
        // Fall through to standard Date parsing
      }
    }
    
    // If DD/MM/YYYY parsing didn't work, try standard Date parsing
    if (!d || isNaN(d.getTime())) {
      d = new Date(date);
    }
  }
  
  if (!d || isNaN(d.getTime())) return null;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
}

/**
 * Generate displayPrimary for Fabrica
 * Format: '🏭 {title}'
 */
async function generateFabricaDisplayPrimary(
  db: Neo4jClient,
  fabricaId: string
): Promise<string> {
  const query = `
    MATCH (f:Fabrica {id: $id})
    RETURN f.title AS title
  `;
  
  const result = await db.executeQuery<{ title: string | null }>(query, { id: fabricaId });
  
  if (result.length === 0) {
    return `🏭 ${fabricaId}`;
  }
  
  const title = result[0].title || fabricaId;
  return `🏭 ${title}`;
}

/**
 * Generate displayPrimary for Jingle
 * Format: '🎤 {title}' or fallback to '🎤 {cancion.title} ({autor1, autor2})'
 */
async function generateJingleDisplayPrimary(
  db: Neo4jClient,
  jingleId: string
): Promise<string> {
  const query = `
    MATCH (j:Jingle {id: $id})
    OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
    OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
    RETURN j.title AS title,
           c.title AS cancionTitle,
           collect(DISTINCT COALESCE(autor.stageName, autor.name)) AS autorNames
  `;
  
  const result = await db.executeQuery(query, { id: jingleId });
  
  if (result.length === 0) {
    return `🎤 ${jingleId}`;
  }
  
  const record: any = result[0];
  
  // If jingle has a title, use it
  if (record.title) {
    return `🎤 ${record.title}`;
  }
  
  // Fallback to cancion title with autores
  if (record.cancionTitle) {
    const autorNames = (record.autorNames || []).filter((name: any) => name != null);
    if (autorNames.length > 0) {
      return `🎤 ${record.cancionTitle} (${autorNames.join(', ')})`;
    }
    return `🎤 ${record.cancionTitle}`;
  }
  
  // Final fallback
  return `🎤 ${jingleId}`;
}

/**
 * Generate displayPrimary for Cancion
 * Format: '📦 {title}'
 */
async function generateCancionDisplayPrimary(
  db: Neo4jClient,
  cancionId: string
): Promise<string> {
  const query = `
    MATCH (c:Cancion {id: $id})
    RETURN c.title AS title
  `;
  
  const result = await db.executeQuery<{ title: string | null }>(query, { id: cancionId });
  
  if (result.length === 0) {
    return `📦 ${cancionId}`;
  }
  
  const title = result[0].title || cancionId;
  return `📦 ${title}`;
}

/**
 * Generate displayPrimary for Artista
 * Format: Icon + {stageName} (icon determined by relationship counts)
 * - '🚚 {stageName}' if autorCount > 0 and jingleroCount == 0
 * - '🔧 {stageName}' if autorCount == 0 and jingleroCount > 0
 * - '👤 {stageName}' otherwise
 * Falls back to name if stageName is empty
 */
async function generateArtistaDisplayPrimary(
  db: Neo4jClient,
  artistaId: string
): Promise<string> {
  const query = `
    MATCH (a:Artista {id: $id})
    OPTIONAL MATCH (a)-[:AUTOR_DE]->(c:Cancion)
    OPTIONAL MATCH (a)-[:JINGLERO_DE]->(j:Jingle)
    WITH a, count(DISTINCT c) AS autorCount, count(DISTINCT j) AS jingleroCount
    RETURN a.stageName AS stageName,
           a.name AS name,
           autorCount,
           jingleroCount
  `;
  
  const result = await db.executeQuery(query, { id: artistaId });
  
  if (result.length === 0) {
    return `👤 ${artistaId}`;
  }
  
  const record: any = result[0];
  const autorCount = typeof record.autorCount === 'object' && record.autorCount?.low !== undefined
    ? record.autorCount.low
    : (typeof record.autorCount === 'number' ? record.autorCount : 0);
  const jingleroCount = typeof record.jingleroCount === 'object' && record.jingleroCount?.low !== undefined
    ? record.jingleroCount.low
    : (typeof record.jingleroCount === 'number' ? record.jingleroCount : 0);
  
  const displayName = record.stageName || record.name || artistaId;
  
  // Determine icon based on relationship counts
  if (autorCount > 0 && jingleroCount === 0) {
    return `🚚 ${displayName}`;
  }
  if (autorCount === 0 && jingleroCount > 0) {
    return `🔧 ${displayName}`;
  }
  return `👤 ${displayName}`;
}

/**
 * Generate displayPrimary for Tematica
 * Format: '🏷️ {name}'
 */
async function generateTematicaDisplayPrimary(
  db: Neo4jClient,
  tematicaId: string
): Promise<string> {
  const query = `
    MATCH (t:Tematica {id: $id})
    RETURN t.name AS name
  `;
  
  const result = await db.executeQuery<{ name: string | null }>(query, { id: tematicaId });
  
  if (result.length === 0) {
    return `🏷️ ${tematicaId}`;
  }
  
  const name = result[0].name || tematicaId;
  return `🏷️ ${name}`;
}

/**
 * Generate displayPrimary for an entity
 */
export async function generateDisplayPrimary(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<string> {
  switch (entityType.toLowerCase()) {
    case 'fabricas':
    case 'fabrica':
      return generateFabricaDisplayPrimary(db, entityId);
    case 'jingles':
    case 'jingle':
      return generateJingleDisplayPrimary(db, entityId);
    case 'canciones':
    case 'cancion':
      return generateCancionDisplayPrimary(db, entityId);
    case 'artistas':
    case 'artista':
      return generateArtistaDisplayPrimary(db, entityId);
    case 'tematicas':
    case 'tematica':
      return generateTematicaDisplayPrimary(db, entityId);
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

/**
 * Generate displaySecondary for Fabrica
 * Format: '{formattedDate} • 🎤: {jingleCount}'
 */
async function generateFabricaDisplaySecondary(
  db: Neo4jClient,
  fabricaId: string
): Promise<string> {
  const query = `
    MATCH (f:Fabrica {id: $id})
    OPTIONAL MATCH (j:Jingle)-[:APPEARS_IN]->(f)
    WITH f, count(DISTINCT j) AS jingleCount
    RETURN f.date AS date, jingleCount
  `;
  
  const result = await db.executeQuery(query, { id: fabricaId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const jingleCount = typeof record.jingleCount === 'object' && record.jingleCount?.low !== undefined
    ? record.jingleCount.low
    : (typeof record.jingleCount === 'number' ? record.jingleCount : 0);
  
  const parts: string[] = [];
  
  if (record.date) {
    const dateStr = formatDate(record.date);
    if (dateStr) {
      parts.push(dateStr);
    }
  }
  
  if (jingleCount > 0) {
    parts.push(`🎤: ${jingleCount}`);
  }
  
  return parts.join(' • ');
}

/**
 * Generate displaySecondary for Jingle
 * Format: '🏭 {fabricaDate} • 📦 {cancionTitle} • 🚚 {autores} • 🔧 {jinglero} • 🏷️ {tematica}'
 * Excludes Jingle Title (which is in displayPrimary)
 */
async function generateJingleDisplaySecondary(
  db: Neo4jClient,
  jingleId: string
): Promise<string> {
  const query = `
    MATCH (j:Jingle {id: $id})
    
    // Get primary Fabrica (first one ordered by timestamp/order)
    OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
    WITH j, f, appearsIn
    ORDER BY appearsIn.timestamp ASC, appearsIn.order ASC
    WITH j, collect({date: f.date})[0] AS fabricaRel
    
    // Get Cancion
    OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
    
    // Get Jinglero (Artista who performed the jingle)
    OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(j)
    
    // Get Autor (Artista who wrote the Cancion)
    OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
    
    // Get primary Tematica (where isPrimary = true)
    OPTIONAL MATCH (j)-[tagRel:TAGGED_WITH]->(t:Tematica)
    WHERE tagRel.isPrimary = true
    
    RETURN fabricaRel.date AS fabricaDate,
           c.title AS cancionTitle,
           collect(DISTINCT COALESCE(jinglero.stageName, jinglero.name)) AS jingleroNames,
           collect(DISTINCT COALESCE(autor.stageName, autor.name)) AS autorNames,
           t.name AS tematicaName
  `;
  
  const result = await db.executeQuery(query, { id: jingleId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const parts: string[] = [];
  
  // Add Fabrica date
  if (record.fabricaDate) {
    const dateStr = formatDate(record.fabricaDate);
    if (dateStr) {
      parts.push(`🏭 ${dateStr}`);
    }
  }
  
  // Add Cancion title
  if (record.cancionTitle) {
    parts.push(`📦 ${record.cancionTitle}`);
  }
  
  // Add Autores
  if (record.autorNames && record.autorNames.length > 0) {
    const autorNames = record.autorNames.filter((name: any) => name != null);
    if (autorNames.length > 0) {
      parts.push(`🚚 ${autorNames.join(', ')}`);
    }
  }
  
  // Add Jingleros
  if (record.jingleroNames && record.jingleroNames.length > 0) {
    const jingleroNames = record.jingleroNames.filter((name: any) => name != null);
    if (jingleroNames.length > 0) {
      parts.push(`🔧 ${jingleroNames.join(', ')}`);
    }
  }
  
  // Add primary Tematica
  if (record.tematicaName) {
    parts.push(`🏷️ ${record.tematicaName}`);
  }
  
  return parts.join(' • ');
}

/**
 * Generate displaySecondary for Cancion
 * Format: '🚚: {autor1, autor2, ...} • {album} • {year} • 🎤: {jingleCount}'
 */
async function generateCancionDisplaySecondary(
  db: Neo4jClient,
  cancionId: string
): Promise<string> {
  const query = `
    MATCH (c:Cancion {id: $id})
    OPTIONAL MATCH (c)<-[:VERSIONA]-(j:Jingle)
    OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
    WITH c, count(DISTINCT j) AS jingleCount, collect(DISTINCT COALESCE(autor.stageName, autor.name)) AS autorNames
    RETURN c.album AS album,
           c.year AS year,
           jingleCount,
           autorNames
  `;
  
  const result = await db.executeQuery(query, { id: cancionId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const jingleCount = typeof record.jingleCount === 'object' && record.jingleCount?.low !== undefined
    ? record.jingleCount.low
    : (typeof record.jingleCount === 'number' ? record.jingleCount : 0);
  
  const parts: string[] = [];
  
  // Add autores
  const autorNames = (record.autorNames || []).filter((name: any) => name != null);
  if (autorNames.length > 0) {
    parts.push(`🚚: ${autorNames.join(', ')}`);
  }
  
  // Add album
  if (record.album) {
    parts.push(record.album);
  }
  
  // Add year
  if (record.year) {
    parts.push(String(record.year));
  }
  
  // Add jingle count
  if (jingleCount > 0) {
    parts.push(`🎤: ${jingleCount}`);
  }
  
  return parts.join(' • ');
}

/**
 * Generate displaySecondary for Artista
 * Format: '{name}' (if different from primary), '📦: {autorCount} • 🎤: {jingleroCount}'
 */
async function generateArtistaDisplaySecondary(
  db: Neo4jClient,
  artistaId: string
): Promise<string> {
  const query = `
    MATCH (a:Artista {id: $id})
    OPTIONAL MATCH (a)-[:AUTOR_DE]->(c:Cancion)
    OPTIONAL MATCH (a)-[:JINGLERO_DE]->(j:Jingle)
    WITH a, count(DISTINCT c) AS autorCount, count(DISTINCT j) AS jingleroCount
    RETURN a.name AS name,
           a.stageName AS stageName,
           autorCount,
           jingleroCount
  `;
  
  const result = await db.executeQuery(query, { id: artistaId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const autorCount = typeof record.autorCount === 'object' && record.autorCount?.low !== undefined
    ? record.autorCount.low
    : (typeof record.autorCount === 'number' ? record.autorCount : 0);
  const jingleroCount = typeof record.jingleroCount === 'object' && record.jingleroCount?.low !== undefined
    ? record.jingleroCount.low
    : (typeof record.jingleroCount === 'number' ? record.jingleroCount : 0);
  
  const parts: string[] = [];
  
  // Add name if different from stageName (primary)
  if (record.name && record.name !== record.stageName) {
    parts.push(record.name);
  }
  
  // Add counts
  if (autorCount > 0) {
    parts.push(`📦: ${autorCount}`);
  }
  if (jingleroCount > 0) {
    parts.push(`🎤: ${jingleroCount}`);
  }
  
  return parts.join(' • ');
}

/**
 * Generate displaySecondary for Tematica
 * Format: '{category} • 🎤: {jingleCount}'
 */
async function generateTematicaDisplaySecondary(
  db: Neo4jClient,
  tematicaId: string
): Promise<string> {
  const query = `
    MATCH (t:Tematica {id: $id})
    OPTIONAL MATCH (j:Jingle)-[:TAGGED_WITH]->(t)
    WITH t, count(DISTINCT j) AS jingleCount
    RETURN t.category AS category, jingleCount
  `;
  
  const result = await db.executeQuery(query, { id: tematicaId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const jingleCount = typeof record.jingleCount === 'object' && record.jingleCount?.low !== undefined
    ? record.jingleCount.low
    : (typeof record.jingleCount === 'number' ? record.jingleCount : 0);
  
  const parts: string[] = [];
  
  // Add category
  if (record.category) {
    parts.push(record.category);
  }
  
  // Add jingle count
  if (jingleCount > 0) {
    parts.push(`🎤: ${jingleCount}`);
  }
  
  return parts.join(' • ');
}

/**
 * Generate displaySecondary for an entity
 */
export async function generateDisplaySecondary(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<string> {
  switch (entityType.toLowerCase()) {
    case 'fabricas':
    case 'fabrica':
      return generateFabricaDisplaySecondary(db, entityId);
    case 'jingles':
    case 'jingle':
      return generateJingleDisplaySecondary(db, entityId);
    case 'canciones':
    case 'cancion':
      return generateCancionDisplaySecondary(db, entityId);
    case 'artistas':
    case 'artista':
      return generateArtistaDisplaySecondary(db, entityId);
    case 'tematicas':
    case 'tematica':
      return generateTematicaDisplaySecondary(db, entityId);
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

/**
 * Generate displayBadges for Fabrica
 * Format: [] (empty array, no badges)
 */
async function generateFabricaDisplayBadges(
  db: Neo4jClient,
  fabricaId: string
): Promise<string[]> {
  return [];
}

/**
 * Generate displayBadges for Jingle
 * Format: ['INEDITO', 'JINGLAZO', 'PRECARIO', 'JDD', 'VIVO', 'CLASICO'] based on Fabrica relationship and boolean props
 */
async function generateJingleDisplayBadges(
  db: Neo4jClient,
  jingleId: string
): Promise<string[]> {
  const query = `
    MATCH (j:Jingle {id: $id})
    OPTIONAL MATCH (j)-[:APPEARS_IN]->(f:Fabrica)
    RETURN j.isJinglazo AS isJinglazo,
           j.isPrecario AS isPrecario,
           j.isJinglazoDelDia AS isJinglazoDelDia,
           j.isLive AS isLive,
           j.isRepeat AS isRepeat,
           j.fabricaId AS fabricaId,
           count(f) AS fabricaCount
  `;
  
  const result = await db.executeQuery(query, { id: jingleId });
  
  if (result.length === 0) {
    return [];
  }
  
  const record: any = result[0];
  const badges: string[] = [];
  
  // Check if Jingle has no Fabrica relationship
  // Check both fabricaId (redundant property) and relationship count
  const hasFabrica = (record.fabricaId !== null && record.fabricaId !== undefined) || 
                     (record.fabricaCount && record.fabricaCount > 0);
  
  // Add INEDITO badge first if no Fabrica relationship exists
  if (!hasFabrica) {
    badges.push('INEDITO');
  }
  
  if (record.isJinglazo === true) {
    badges.push('JINGLAZO');
  }
  if (record.isPrecario === true) {
    badges.push('PRECARIO');
  }
  if (record.isJinglazoDelDia === true) {
    badges.push('JDD');
  }
  if (record.isLive === true) {
    badges.push('VIVO');
  }
  if (record.isRepeat === true) {
    badges.push('CLASICO');
  }
  
  return badges;
}

/**
 * Generate displayBadges for Cancion
 * Format: [] (empty array, no badges)
 */
async function generateCancionDisplayBadges(
  db: Neo4jClient,
  cancionId: string
): Promise<string[]> {
  return [];
}

/**
 * Generate displayBadges for Artista
 * Format: ['ARG'] if isArg === true, otherwise []
 */
async function generateArtistaDisplayBadges(
  db: Neo4jClient,
  artistaId: string
): Promise<string[]> {
  const query = `
    MATCH (a:Artista {id: $id})
    RETURN a.isArg AS isArg
  `;
  
  const result = await db.executeQuery(query, { id: artistaId });
  
  if (result.length === 0) {
    return [];
  }
  
  const record: any = result[0];
  
  if (record.isArg === true) {
    return ['ARG'];
  }
  
  return [];
}

/**
 * Generate displayBadges for Tematica
 * Format: [] (contextual badges are handled at display time, not stored)
 */
async function generateTematicaDisplayBadges(
  db: Neo4jClient,
  tematicaId: string
): Promise<string[]> {
  // Note: Contextual PRIMARY badge is handled at display time based on relationship context
  return [];
}

/**
 * Generate displayBadges for an entity
 */
export async function generateDisplayBadges(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<string[]> {
  switch (entityType.toLowerCase()) {
    case 'fabricas':
    case 'fabrica':
      return generateFabricaDisplayBadges(db, entityId);
    case 'jingles':
    case 'jingle':
      return generateJingleDisplayBadges(db, entityId);
    case 'canciones':
    case 'cancion':
      return generateCancionDisplayBadges(db, entityId);
    case 'artistas':
    case 'artista':
      return generateArtistaDisplayBadges(db, entityId);
    case 'tematicas':
    case 'tematica':
      return generateTematicaDisplayBadges(db, entityId);
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

/**
 * Generate normSearch for Fabrica
 * Includes: displayPrimary + displaySecondary content (normalized)
 */
async function generateFabricaNormSearch(
  db: Neo4jClient,
  fabricaId: string
): Promise<string> {
  const [displayPrimary, displaySecondary] = await Promise.all([
    generateFabricaDisplayPrimary(db, fabricaId),
    generateFabricaDisplaySecondary(db, fabricaId),
  ]);
  
  const parts: string[] = [];
  if (displayPrimary) {
    // Remove emoji and normalize
    parts.push(normalizeSearchText(displayPrimary.replace(/^🏭\s*/, '')));
  }
  if (displaySecondary) {
    // Remove emojis and normalize
    parts.push(normalizeSearchText(displaySecondary.replace(/🎤:\s*\d+/g, '').replace(/•/g, '')));
  }
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Generate normSearch for Jingle
 * Includes: displayPrimary + displaySecondary + non-primary tags + comment (normalized)
 */
async function generateJingleNormSearch(
  db: Neo4jClient,
  jingleId: string
): Promise<string> {
  const query = `
    MATCH (j:Jingle {id: $id})
    
    // Get primary Fabrica (first one ordered by timestamp/order)
    OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
    WITH j, f, appearsIn
    ORDER BY appearsIn.timestamp ASC, appearsIn.order ASC
    WITH j, collect({date: f.date, title: f.title})[0] AS fabricaRel
    
    // Get Cancion
    OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
    
    // Get Jinglero (Artista who performed the jingle)
    OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(j)
    
    // Get Autor (Artista who wrote the Cancion)
    OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
    
    // Get ALL Tematicas (both primary and non-primary)
    OPTIONAL MATCH (j)-[tagRel:TAGGED_WITH]->(t:Tematica)
    
    RETURN j.title AS title,
           j.comment AS comment,
           fabricaRel.title AS fabricaTitle,
           fabricaRel.date AS fabricaDate,
           c.title AS cancionTitle,
           collect(DISTINCT COALESCE(jinglero.stageName, jinglero.name)) AS jingleroNames,
           collect(DISTINCT COALESCE(autor.stageName, autor.name)) AS autorNames,
           collect(DISTINCT t.name) AS allTematicas
  `;
  
  const result = await db.executeQuery(query, { id: jingleId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const parts: string[] = [];
  
  // Add displayPrimary content (title or cancion title with autores)
  if (record.title) {
    parts.push(normalizeSearchText(record.title));
  } else if (record.cancionTitle) {
    parts.push(normalizeSearchText(record.cancionTitle));
    const autorNames = (record.autorNames || []).filter((name: any) => name != null);
    if (autorNames.length > 0) {
      parts.push(...autorNames.map((name: string) => normalizeSearchText(name)));
    }
  }
  
  // Add displaySecondary content
  // Note: fabricaTitle is intentionally excluded from normSearch to avoid false-positive search results
  if (record.cancionTitle) {
    parts.push(normalizeSearchText(record.cancionTitle));
  }
  const autorNames = (record.autorNames || []).filter((name: any) => name != null);
  if (autorNames.length > 0) {
    parts.push(...autorNames.map((name: string) => normalizeSearchText(name)));
  }
  const jingleroNames = (record.jingleroNames || []).filter((name: any) => name != null);
  if (jingleroNames.length > 0) {
    parts.push(...jingleroNames.map((name: string) => normalizeSearchText(name)));
  }
  
  // Add all tags (both primary and non-primary)
  const allTematicas = (record.allTematicas || []).filter((name: any) => name != null);
  if (allTematicas.length > 0) {
    parts.push(...allTematicas.map((name: string) => normalizeSearchText(name)));
  }
  
  // Add comment
  if (record.comment) {
    parts.push(normalizeSearchText(record.comment));
  }
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Generate normSearch for Cancion
 * Includes: displayPrimary + displaySecondary content (normalized)
 */
async function generateCancionNormSearch(
  db: Neo4jClient,
  cancionId: string
): Promise<string> {
  const query = `
    MATCH (c:Cancion {id: $id})
    OPTIONAL MATCH (c)<-[:VERSIONA]-(j:Jingle)
    OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
    WITH c, count(DISTINCT j) AS jingleCount, collect(DISTINCT COALESCE(autor.stageName, autor.name)) AS autorNames
    RETURN c.title AS title,
           c.album AS album,
           c.year AS year,
           autorNames
  `;
  
  const result = await db.executeQuery(query, { id: cancionId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const parts: string[] = [];
  
  // Add title
  if (record.title) {
    parts.push(normalizeSearchText(record.title));
  }
  
  // Add autores
  const autorNames = (record.autorNames || []).filter((name: any) => name != null);
  if (autorNames.length > 0) {
    parts.push(...autorNames.map((name: string) => normalizeSearchText(name)));
  }
  
  // Add album
  if (record.album) {
    parts.push(normalizeSearchText(record.album));
  }
  
  // Add year
  if (record.year) {
    parts.push(normalizeSearchText(String(record.year)));
  }
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Generate normSearch for Artista
 * Includes: displayPrimary + displaySecondary content (normalized)
 */
async function generateArtistaNormSearch(
  db: Neo4jClient,
  artistaId: string
): Promise<string> {
  const query = `
    MATCH (a:Artista {id: $id})
    OPTIONAL MATCH (a)-[:AUTOR_DE]->(c:Cancion)
    OPTIONAL MATCH (a)-[:JINGLERO_DE]->(j:Jingle)
    WITH a, count(DISTINCT c) AS autorCount, count(DISTINCT j) AS jingleroCount
    RETURN a.stageName AS stageName,
           a.name AS name
  `;
  
  const result = await db.executeQuery(query, { id: artistaId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const parts: string[] = [];
  
  // Add stageName (primary)
  if (record.stageName) {
    parts.push(normalizeSearchText(record.stageName));
  }
  
  // Add name (if different from stageName)
  if (record.name && record.name !== record.stageName) {
    parts.push(normalizeSearchText(record.name));
  }
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Generate normSearch for Tematica
 * Includes: name (normalized)
 * Special handling for GENTE category: parse {surname}, {name} as {name} {surname}
 */
async function generateTematicaNormSearch(
  db: Neo4jClient,
  tematicaId: string
): Promise<string> {
  const query = `
    MATCH (t:Tematica {id: $id})
    RETURN t.name AS name,
           t.category AS category
  `;
  
  const result = await db.executeQuery(query, { id: tematicaId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  const parts: string[] = [];
  
  if (record.name) {
    let nameToNormalize = record.name;
    
    // Special handling for GENTE category: parse "Surname, Name" as "Name Surname"
    if (record.category === 'GENTE') {
      const commaMatch = record.name.match(/^(.+),\s*(.+)$/);
      if (commaMatch) {
        const [, surname, firstName] = commaMatch;
        nameToNormalize = `${firstName} ${surname}`;
      }
    }
    
    parts.push(normalizeSearchText(nameToNormalize));
  }
  
  // Also add category if present
  if (record.category) {
    parts.push(normalizeSearchText(record.category));
  }
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Generate normSearch for an entity
 */
export async function generateNormSearch(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<string> {
  switch (entityType.toLowerCase()) {
    case 'fabricas':
    case 'fabrica':
      return generateFabricaNormSearch(db, entityId);
    case 'jingles':
    case 'jingle':
      return generateJingleNormSearch(db, entityId);
    case 'canciones':
    case 'cancion':
      return generateCancionNormSearch(db, entityId);
    case 'artistas':
    case 'artista':
      return generateArtistaNormSearch(db, entityId);
    case 'tematicas':
    case 'tematica':
      return generateTematicaNormSearch(db, entityId);
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

/**
 * Update all display properties for an entity
 * Computes displayPrimary, displaySecondary, displayBadges, and normSearch, then saves to database
 */
export async function updateDisplayProperties(
  db: Neo4jClient,
  entityType: string,
  entityId: string
): Promise<void> {
  // Map entity type to Neo4j label
  const labelMap: Record<string, string> = {
    fabricas: 'Fabrica',
    fabrica: 'Fabrica',
    jingles: 'Jingle',
    jingle: 'Jingle',
    canciones: 'Cancion',
    cancion: 'Cancion',
    artistas: 'Artista',
    artista: 'Artista',
    tematicas: 'Tematica',
    tematica: 'Tematica',
  };
  
  const label = labelMap[entityType.toLowerCase()];
  if (!label) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  // Generate all display properties
  const [displayPrimary, displaySecondary, displayBadges, normSearch] = await Promise.all([
    generateDisplayPrimary(db, entityType, entityId),
    generateDisplaySecondary(db, entityType, entityId),
    generateDisplayBadges(db, entityType, entityId),
    generateNormSearch(db, entityType, entityId),
  ]);
  
  // Update entity in database
  const updateQuery = `
    MATCH (n:${label} {id: $id})
    SET n.displayPrimary = $displayPrimary,
        n.displaySecondary = $displaySecondary,
        n.displayBadges = $displayBadges,
        n.normSearch = $normSearch,
        n.updatedAt = datetime()
    RETURN n.id AS id
  `;
  
  await db.executeQuery(
    updateQuery,
    {
      id: entityId,
      displayPrimary,
      displaySecondary,
      displayBadges,
      normSearch,
    },
    undefined,
    true
  );
}

