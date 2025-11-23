/**
 * Auto-comment generation for Jingle entities
 * 
 * Generates a system-managed summary comment based on Jingle relationships
 * and properties. This comment is read-only and automatically updated when
 * any relevant property or relationship changes.
 */

import { Neo4jClient } from '../db/index';

/**
 * Format timestamp for auto-comment
 * - If hours > 0: returns HH:MM:SS
 * - If hours = 0: returns MM:SS (omits hours)
 * - Always uses leading zeros for minutes and seconds
 */
function formatTimestampForAutoComment(seconds: number): string {
  if (seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  } else {
    return `${pad(minutes)}:${pad(secs)}`;
  }
}

/**
 * Format date as DD/MM/YYYY
 * Handles Neo4j DateTime objects, Date objects, ISO strings, DD/MM/YYYY strings, and null/undefined
 */
function formatDateForAutoComment(date: Date | string | null | undefined | any): string | null {
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
 * Generate auto-comment for a Jingle based on its relationships and properties
 * 
 * Format:
 * - If Fabrica exists: 🏭: YYYY-MM-DD - [HH:]MM:SS
 * - 🎤: {Titulo} (if title exists)
 * - 📦: {Cancion} (if Cancion exists)
 * - 🚚: {Autor} [; {Autor}] (if Autores exist)
 * - 🏷️: {Primary Tematica} (if primary Tematica exists)
 * - 🔧: {Jinglero} [; {Jinglero}] (if Jingleros exist)
 * 
 * Blank fields are omitted. Multiple Autores/Jingleros are separated by `;`.
 */
export async function generateJingleAutoComment(
  db: Neo4jClient,
  jingleId: string
): Promise<string> {
  // Query Jingle with all relationships
  // Get Fabrica date from relationship (first one by timestamp/order), with fallback to redundant property
  const query = `
    MATCH (j:Jingle {id: $id})
    
    // Capture redundant fabricaDate before doing OPTIONAL MATCH
    WITH j, j.fabricaDate AS fabricaDateRedundant
    
    // Get primary Fabrica (first one ordered by timestamp/order)
    OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
    WITH j, fabricaDateRedundant, f, appearsIn
    ORDER BY appearsIn.timestamp ASC, appearsIn.order ASC
    WITH j, fabricaDateRedundant, collect({date: f.date, timestamp: appearsIn.timestamp})[0] AS fabricaRel
    
    // Get Cancion
    OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
    
    // Get Jinglero (Artista who performed the jingle)
    OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(j)
    
    // Get Autor (Artista who wrote the Cancion)
    OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
    
    // Get all Tematicas
    OPTIONAL MATCH (j)-[tagRel:TAGGED_WITH]->(t:Tematica)
    
    RETURN j.title AS title,
           COALESCE(fabricaRel.date, fabricaDateRedundant) AS fabricaDate,
           COALESCE(fabricaRel.timestamp, 0) AS timestamp,
           c.title AS cancionTitle,
           collect(DISTINCT COALESCE(jinglero.stageName, jinglero.name)) AS jingleroNames,
           collect(DISTINCT COALESCE(autor.stageName, autor.name)) AS autorNames,
           collect(DISTINCT {
             name: t.name,
             isPrimary: tagRel.isPrimary
           }) AS tematicas
  `;
  
  const result = await db.executeQuery(query, { id: jingleId });
  
  if (result.length === 0) {
    return '';
  }
  
  const record: any = result[0];
  
  const parts: string[] = [];
  
  // Fabrica part: 🏭: DD/MM/YYYY - [HH:]MM:SS:
  // fabricaData might be null if no Fabrica exists, or an object with date and timestamp
  const fabricaDate = record.fabricaDate;
  const fabricaTimestamp = record.timestamp;
  
  if (fabricaDate) {
    const dateStr = formatDateForAutoComment(fabricaDate);
    const timestamp = fabricaTimestamp != null ? fabricaTimestamp : 0;
    const timeStr = formatTimestampForAutoComment(timestamp);
    
    if (dateStr) {
      parts.push(`🏭: ${dateStr} - ${timeStr}:`);
    }
  }
  
  // Title part: 🎤: {Titulo}
  if (record.title) {
    parts.push(`🎤: ${record.title}`);
  }
  
  // Cancion part: 📦: {Cancion}
  if (record.cancionTitle) {
    parts.push(`📦: ${record.cancionTitle}`);
  }
  
  // Autores part: 🚚: {Autor} [; {Autor}]
  if (record.autorNames && record.autorNames.length > 0) {
    const autorNames = record.autorNames.filter((name: any) => name != null);
    if (autorNames.length > 0) {
      parts.push(`🚚: ${autorNames.join('; ')}`);
    }
  }
  
  // Primary Tematica part: 🏷️: {Primary Tematica}
  if (record.tematicas && record.tematicas.length > 0) {
    const primaryTematica = record.tematicas.find((t: any) => t && t.isPrimary === true);
    if (primaryTematica && primaryTematica.name) {
      parts.push(`🏷️: ${primaryTematica.name}`);
    }
  }
  
  // Jingleros part: 🔧: {Jinglero} [; {Jinglero}]
  if (record.jingleroNames && record.jingleroNames.length > 0) {
    const jingleroNames = record.jingleroNames.filter((name: any) => name != null);
    if (jingleroNames.length > 0) {
      parts.push(`🔧: ${jingleroNames.join('; ')}`);
    }
  }
  
  return parts.join(', ');
}

/**
 * Update auto-comment for a Jingle
 * Helper function that generates and saves the auto-comment
 */
export async function updateJingleAutoComment(
  db: Neo4jClient,
  jingleId: string
): Promise<void> {
  const autoComment = await generateJingleAutoComment(db, jingleId);
  
  const updateQuery = `
    MATCH (j:Jingle {id: $id})
    SET j.autoComment = $autoComment,
        j.updatedAt = datetime()
    RETURN j.id AS id
  `;
  
  await db.executeQuery(updateQuery, { id: jingleId, autoComment }, undefined, true);
}

