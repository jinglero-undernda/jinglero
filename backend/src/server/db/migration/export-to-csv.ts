/**
 * Export Database to CSV Files
 * 
 * Exports all entities and relationships to CSV files
 * matching the import format for later re-seeding
 */

import { Neo4jClient } from '../index';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ExportConfig {
  outputDir: string;
  timestamp: string;
}

/**
 * Convert value to CSV-safe string
 */
function toCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Arrays: join with semicolon
  if (Array.isArray(value)) {
    return value.join(';');
  }
  
  // Dates: ISO format
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Neo4j Date/DateTime objects: convert to ISO string
  if (typeof value === 'object' && value.year && value.month && value.day) {
    const year = value.year?.low || value.year || 0;
    const month = String(value.month?.low || value.month || 1).padStart(2, '0');
    const day = String(value.day?.low || value.day || 1).padStart(2, '0');
    
    if (value.hour !== undefined) {
      // DateTime
      const hour = String(value.hour?.low || value.hour || 0).padStart(2, '0');
      const minute = String(value.minute?.low || value.minute || 0).padStart(2, '0');
      const second = String(value.second?.low || value.second || 0).padStart(2, '0');
      return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
    } else {
      // Date only
      return `${year}-${month}-${day}`;
    }
  }
  
  // Booleans: lowercase
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  // Numbers: plain string
  if (typeof value === 'number') {
    return String(value);
  }
  
  // Strings: escape quotes and wrap if contains comma/newline
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Convert row object to CSV line
 */
function toCsvLine(row: Record<string, any>, headers: string[]): string {
  return headers.map(header => toCsvValue(row[header])).join(',');
}

/**
 * Export entities to CSV
 */
async function exportEntities(db: Neo4jClient, config: ExportConfig): Promise<void> {
  console.log('\n📦 Exporting Entities...\n');
  
  const entityConfigs = [
    {
      label: 'Artista',
      filename: `node-Artista-${config.timestamp}.csv`,
      headers: ['id:ID', 'stageName', 'fullName', 'country', 'genre', 'isJinglero:boolean', 'createdAt', 'updatedAt'],
      properties: ['id', 'stageName', 'fullName', 'country', 'genre', 'isJinglero', 'createdAt', 'updatedAt'],
    },
    {
      label: 'Cancion',
      filename: `node-Cancion-${config.timestamp}.csv`,
      headers: ['id:ID', 'title', 'autorIds', 'genre', 'releaseYear', 'createdAt', 'updatedAt'],
      properties: ['id', 'title', 'autorIds', 'genre', 'releaseYear', 'createdAt', 'updatedAt'],
    },
    {
      label: 'Fabrica',
      filename: `node-Fabrica-${config.timestamp}.csv`,
      headers: ['id:ID', 'title', 'date', 'youtubeUrl', 'status', 'createdAt', 'updatedAt'],
      properties: ['id', 'title', 'date', 'youtubeUrl', 'status', 'createdAt', 'updatedAt'],
    },
    {
      label: 'Jingle',
      filename: `node-Jingle-${config.timestamp}.csv`,
      headers: ['id:ID', 'title', 'timestamp', 'songTitle', 'artistName', 'genre', 'fabricaId', 'fabricaDate', 'cancionId', 'isJinglazo:boolean', 'isJinglazoDelDia:boolean', 'isPrecario:boolean', 'comment', 'createdAt', 'updatedAt'],
      properties: ['id', 'title', 'timestamp', 'songTitle', 'artistName', 'genre', 'fabricaId', 'fabricaDate', 'cancionId', 'isJinglazo', 'isJinglazoDelDia', 'isPrecario', 'comment', 'createdAt', 'updatedAt'],
    },
    {
      label: 'Tematica',
      filename: `node-Tematica-${config.timestamp}.csv`,
      headers: ['id:ID', 'name', 'category', 'description', 'createdAt', 'updatedAt'],
      properties: ['id', 'name', 'category', 'description', 'createdAt', 'updatedAt'],
    },
    {
      label: 'Usuario',
      filename: `node-Usuario-${config.timestamp}.csv`,
      headers: ['id:ID', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
      properties: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
    },
  ];
  
  for (const entityConfig of entityConfigs) {
    console.log(`Exporting ${entityConfig.label}...`);
    
    // Query all entities
    const query = `
      MATCH (n:${entityConfig.label})
      RETURN ${entityConfig.properties.map(p => `n.${p} as ${p}`).join(', ')}
      ORDER BY n.id
    `;
    
    const results = await db.executeQuery<Record<string, any>>(query, {});
    
    // Create CSV content
    const lines = [entityConfig.headers.join(',')];
    for (const row of results) {
      lines.push(toCsvLine(row, entityConfig.properties));
    }
    
    // Write to file
    const filepath = path.join(config.outputDir, entityConfig.filename);
    await fs.writeFile(filepath, lines.join('\n') + '\n');
    
    console.log(`  ✅ ${results.length} ${entityConfig.label} exported to ${entityConfig.filename}`);
  }
}

/**
 * Export relationships to CSV
 */
async function exportRelationships(db: Neo4jClient, config: ExportConfig): Promise<void> {
  console.log('\n🔗 Exporting Relationships...\n');
  
  const relationshipConfigs = [
    {
      type: 'APPEARS_IN',
      filename: `rel-Jingle-APPEARS_IN-Fabrica-${config.timestamp}.csv`,
      headers: [':START_ID', ':END_ID', 'timestamp', 'order:int'],
      query: `
        MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
        RETURN j.id as startId, f.id as endId, r.timestamp as timestamp, r.order as order
        ORDER BY f.id, r.order
      `,
      properties: ['startId', 'endId', 'timestamp', 'order'],
    },
    {
      type: 'VERSIONA',
      filename: `rel-Jingle-VERSIONA-Cancion-${config.timestamp}.csv`,
      headers: [':START_ID', ':END_ID'],
      query: `
        MATCH (j:Jingle)-[r:VERSIONA]->(c:Cancion)
        RETURN j.id as startId, c.id as endId
        ORDER BY j.id
      `,
      properties: ['startId', 'endId'],
    },
    {
      type: 'AUTOR_DE',
      filename: `rel-Artista-AUTOR_DE-Cancion-${config.timestamp}.csv`,
      headers: [':START_ID', ':END_ID'],
      query: `
        MATCH (a:Artista)-[r:AUTOR_DE]->(c:Cancion)
        RETURN a.id as startId, c.id as endId
        ORDER BY c.id, a.id
      `,
      properties: ['startId', 'endId'],
    },
    {
      type: 'JINGLERO_DE',
      filename: `rel-Artista-JINGLERO_DE-Jingle-${config.timestamp}.csv`,
      headers: [':START_ID', ':END_ID'],
      query: `
        MATCH (a:Artista)-[r:JINGLERO_DE]->(j:Jingle)
        RETURN a.id as startId, j.id as endId
        ORDER BY a.id, j.id
      `,
      properties: ['startId', 'endId'],
    },
    {
      type: 'TAGGED_WITH',
      filename: `rel-Jingle-TAGGED_WITH-Tematica-${config.timestamp}.csv`,
      headers: [':START_ID', ':END_ID', 'isPrimary:boolean'],
      query: `
        MATCH (j:Jingle)-[r:TAGGED_WITH]->(t:Tematica)
        RETURN j.id as startId, t.id as endId, r.isPrimary as isPrimary
        ORDER BY j.id, t.id
      `,
      properties: ['startId', 'endId', 'isPrimary'],
    },
    {
      type: 'REACCIONA_A',
      filename: `rel-Usuario-REACCIONA_A-Jingle-${config.timestamp}.csv`,
      headers: [':START_ID', ':END_ID', 'reaction', 'createdAt'],
      query: `
        MATCH (u:Usuario)-[r:REACCIONA_A]->(j:Jingle)
        RETURN u.id as startId, j.id as endId, r.reaction as reaction, r.createdAt as createdAt
        ORDER BY u.id, j.id
      `,
      properties: ['startId', 'endId', 'reaction', 'createdAt'],
    },
    {
      type: 'SOY_YO',
      filename: `rel-Usuario-SOY_YO-Artista-${config.timestamp}.csv`,
      headers: [':START_ID', ':END_ID', 'verifiedAt'],
      query: `
        MATCH (u:Usuario)-[r:SOY_YO]->(a:Artista)
        RETURN u.id as startId, a.id as endId, r.verifiedAt as verifiedAt
        ORDER BY u.id, a.id
      `,
      properties: ['startId', 'endId', 'verifiedAt'],
    },
  ];
  
  for (const relConfig of relationshipConfigs) {
    console.log(`Exporting ${relConfig.type}...`);
    
    const results = await db.executeQuery<Record<string, any>>(relConfig.query, {});
    
    // Create CSV content
    const lines = [relConfig.headers.join(',')];
    for (const row of results) {
      lines.push(toCsvLine(row, relConfig.properties));
    }
    
    // Write to file
    const filepath = path.join(config.outputDir, relConfig.filename);
    await fs.writeFile(filepath, lines.join('\n') + '\n');
    
    console.log(`  ✅ ${results.length} ${relConfig.type} relationships exported to ${relConfig.filename}`);
  }
}

/**
 * Main export function
 */
async function exportToCSV(): Promise<void> {
  const db = Neo4jClient.getInstance();
  
  // Use current date for timestamp
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Output directory
  const outputDir = path.join(__dirname, '../import');
  
  const config: ExportConfig = {
    outputDir,
    timestamp,
  };
  
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║        DATABASE EXPORT TO CSV                     ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`\nOutput directory: ${outputDir}`);
  console.log(`Timestamp: ${timestamp}\n`);
  
  try {
    // Export entities
    await exportEntities(db, config);
    
    // Export relationships
    await exportRelationships(db, config);
    
    console.log('\n✅ Export completed successfully!');
    console.log(`\nCSV files saved to: ${outputDir}`);
    console.log(`Filename pattern: *-${timestamp}.csv\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

// Run export if this file is executed directly
if (require.main === module) {
  exportToCSV();
}

export { exportToCSV };

