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
 * Get all property keys for a given label
 */
async function getAllProperties(db: Neo4jClient, label: string): Promise<string[]> {
  const query = `
    MATCH (n:${label})
    WITH keys(n) as keys
    UNWIND keys as key
    RETURN DISTINCT key as property
    ORDER BY property
  `;
  
  const results = await db.executeQuery<{ property: string }>(query, {});
  return results.map(r => r.property);
}

/**
 * Convert property name to CSV header format
 */
function toCsvHeader(prop: string): string {
  // Add type hints for common types
  if (prop === 'id') {
    return 'id:ID';
  }
  if (prop === 'isJinglazo' || prop === 'isJinglazoDelDia' || prop === 'isPrecario' || 
      prop === 'isLive' || prop === 'isRepeat' || prop === 'isArg' || prop === 'isJinglero' ||
      prop === 'isPrimary' || prop === 'isVerified') {
    return `${prop}:boolean`;
  }
  if (prop === 'order' || prop === 'visualizations' || prop === 'likes' || prop === 'year' ||
      prop === 'releaseYear' || prop === 'contributionsCount') {
    return `${prop}:int`;
  }
  return prop;
}

/**
 * Export entities to CSV
 */
async function exportEntities(db: Neo4jClient, config: ExportConfig): Promise<void> {
  console.log('\n📦 Exporting Entities...\n');
  
  const entityLabels = ['Artista', 'Cancion', 'Fabrica', 'Jingle', 'Tematica', 'Usuario'];
  
  for (const label of entityLabels) {
    console.log(`Exporting ${label}...`);
    
    // Get all properties dynamically
    const properties = await getAllProperties(db, label);
    
    if (properties.length === 0) {
      console.log(`  ⚠️  No ${label} entities found, skipping...`);
      continue;
    }
    
    // Ensure 'id' is first
    const sortedProperties = ['id', ...properties.filter(p => p !== 'id')];
    
    // Build query to get all properties
    const query = `
      MATCH (n:${label})
      RETURN ${sortedProperties.map(p => `n.${p} as ${p}`).join(', ')}
      ORDER BY n.id
    `;
    
    const results = await db.executeQuery<Record<string, any>>(query, {});
    
    // Create CSV headers
    const headers = sortedProperties.map(toCsvHeader);
    
    // Create CSV content
    const lines = [headers.join(',')];
    for (const row of results) {
      lines.push(toCsvLine(row, sortedProperties));
    }
    
    // Write to file
    const filename = `node-${label}-${config.timestamp}.csv`;
    const filepath = path.join(config.outputDir, filename);
    await fs.writeFile(filepath, lines.join('\n') + '\n');
    
    console.log(`  ✅ ${results.length} ${label} exported to ${filename}`);
    console.log(`     Properties: ${sortedProperties.length} (${sortedProperties.slice(0, 5).join(', ')}${sortedProperties.length > 5 ? '...' : ''})`);
  }
}

/**
 * Get all property keys for a relationship type
 */
async function getRelationshipProperties(db: Neo4jClient, relType: string, startLabel: string, endLabel: string): Promise<string[]> {
  const query = `
    MATCH (start:${startLabel})-[r:${relType}]->(end:${endLabel})
    WITH keys(r) as keys
    UNWIND keys as key
    RETURN DISTINCT key as property
    ORDER BY property
  `;
  
  const results = await db.executeQuery<{ property: string }>(query, {});
  return results.map(r => r.property);
}

/**
 * Export relationships to CSV
 */
async function exportRelationships(db: Neo4jClient, config: ExportConfig): Promise<void> {
  console.log('\n🔗 Exporting Relationships...\n');
  
  const relationshipConfigs = [
    {
      type: 'APPEARS_IN',
      startLabel: 'Jingle',
      endLabel: 'Fabrica',
      filename: `rel-Jingle-APPEARS_IN-Fabrica-${config.timestamp}.csv`,
    },
    {
      type: 'VERSIONA',
      startLabel: 'Jingle',
      endLabel: 'Cancion',
      filename: `rel-Jingle-VERSIONA-Cancion-${config.timestamp}.csv`,
    },
    {
      type: 'AUTOR_DE',
      startLabel: 'Artista',
      endLabel: 'Cancion',
      filename: `rel-Artista-AUTOR_DE-Cancion-${config.timestamp}.csv`,
    },
    {
      type: 'JINGLERO_DE',
      startLabel: 'Artista',
      endLabel: 'Jingle',
      filename: `rel-Artista-JINGLERO_DE-Jingle-${config.timestamp}.csv`,
    },
    {
      type: 'TAGGED_WITH',
      startLabel: 'Jingle',
      endLabel: 'Tematica',
      filename: `rel-Jingle-TAGGED_WITH-Tematica-${config.timestamp}.csv`,
    },
    {
      type: 'REACCIONA_A',
      startLabel: 'Usuario',
      endLabel: 'Jingle',
      filename: `rel-Usuario-REACCIONA_A-Jingle-${config.timestamp}.csv`,
    },
    {
      type: 'SOY_YO',
      startLabel: 'Usuario',
      endLabel: 'Artista',
      filename: `rel-Usuario-SOY_YO-Artista-${config.timestamp}.csv`,
    },
  ];
  
  for (const relConfig of relationshipConfigs) {
    console.log(`Exporting ${relConfig.type}...`);
    
    // Get all properties dynamically
    const properties = await getRelationshipProperties(db, relConfig.type, relConfig.startLabel, relConfig.endLabel);
    
    // Check if any relationships exist
    const countQuery = `
      MATCH (start:${relConfig.startLabel})-[r:${relConfig.type}]->(end:${relConfig.endLabel})
      RETURN count(r) as count
    `;
    const countResult = await db.executeQuery<{ count: number }>(countQuery, {});
    const count = Number(countResult[0]?.count || 0);
    
    if (count === 0) {
      console.log(`  ⚠️  No ${relConfig.type} relationships found, skipping...`);
      continue;
    }
    
    // Build properties list (startId, endId, then relationship properties)
    const allProperties = ['startId', 'endId', ...properties];
    
    // Build query
    const relProps = properties.length > 0 
      ? ', ' + properties.map(p => `r.${p} as ${p}`).join(', ')
      : '';
    const query = `
      MATCH (start:${relConfig.startLabel})-[r:${relConfig.type}]->(end:${relConfig.endLabel})
      RETURN start.id as startId, end.id as endId${relProps}
      ORDER BY start.id, end.id
    `;
    
    const results = await db.executeQuery<Record<string, any>>(query, {});
    
    // Create CSV headers
    const headers = [
      ':START_ID',
      ':END_ID',
      ...properties.map(toCsvHeader)
    ];
    
    // Create CSV content
    const lines = [headers.join(',')];
    for (const row of results) {
      lines.push(toCsvLine(row, allProperties));
    }
    
    // Write to file
    const filepath = path.join(config.outputDir, relConfig.filename);
    await fs.writeFile(filepath, lines.join('\n') + '\n');
    
    console.log(`  ✅ ${results.length} ${relConfig.type} relationships exported to ${relConfig.filename}`);
    if (properties.length > 0) {
      console.log(`     Properties: ${properties.length} (${properties.slice(0, 5).join(', ')}${properties.length > 5 ? '...' : ''})`);
    }
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

