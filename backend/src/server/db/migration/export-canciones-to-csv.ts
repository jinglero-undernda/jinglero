/**
 * Export All Canciones to CSV
 * 
 * Exports all Canciones with all properties to a CSV file
 * Includes autores (authors) as a formatted column
 */

import { Neo4jClient } from '../index';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as neo4j from 'neo4j-driver';

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
  
  // Neo4j Integer objects
  if (typeof value === 'object' && value.low !== undefined && value.high !== undefined) {
    return String(value.low);
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
 * Convert Neo4j value to JavaScript primitive
 */
function convertNeo4jValue(value: any): any {
  // Handle Neo4j Integer
  if (typeof value === 'object' && value !== null && value.low !== undefined && value.high !== undefined) {
    return Number(value.low);
  }
  
  // Handle BigInt
  if (typeof value === 'bigint') {
    return Number(value);
  }
  
  return value;
}

/**
 * Convert Neo4j date objects to JavaScript Date
 */
function convertNeo4jDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertNeo4jDates);
  }
  
  if (typeof obj === 'object') {
    // Check if it's a Neo4j Date/DateTime
    if (obj.year !== undefined && obj.month !== undefined && obj.day !== undefined) {
      const year = Number(convertNeo4jValue(obj.year)) || 0;
      const month = (Number(convertNeo4jValue(obj.month)) || 1) - 1; // JS months are 0-indexed
      const day = Number(convertNeo4jValue(obj.day)) || 1;
      
      if (obj.hour !== undefined) {
        // DateTime
        const hour = Number(convertNeo4jValue(obj.hour)) || 0;
        const minute = Number(convertNeo4jValue(obj.minute)) || 0;
        const second = Number(convertNeo4jValue(obj.second)) || 0;
        return new Date(year, month, day, hour, minute, second);
      } else {
        // Date only
        return new Date(year, month, day);
      }
    }
    
    // Check if it's a Neo4j Integer
    if (obj.low !== undefined && obj.high !== undefined) {
      return Number(obj.low);
    }
    
    // Recursively convert object properties
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertNeo4jDates(obj[key]);
    }
    return converted;
  }
  
  return obj;
}

/**
 * Main export function
 */
async function exportCancionesToCSV(): Promise<void> {
  const db = Neo4jClient.getInstance();
  
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║        EXPORT CANCIONES TO CSV                    ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('\nFetching all Canciones from database...\n');
  
  try {
    // Query to get all Canciones with autores
    const query = `
      MATCH (c:Cancion)
      OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
      WITH c, collect(DISTINCT autor) AS autores
      RETURN c,
             autores
      ORDER BY c.id ASC
    `;
    
    const results = await db.executeQuery(query, {});
    
    if (results.length === 0) {
      console.log('⚠️  No Canciones found in database.');
      process.exit(0);
    }
    
    console.log(`Found ${results.length} Canciones.\n`);
    console.log('Processing data...\n');
    
    // Process results and extract all unique property keys
    const allProperties = new Set<string>();
    const canciones: Array<Record<string, any>> = [];
    
    for (const r of results) {
      const cancion = convertNeo4jDates((r as any).c.properties);
      const autores = (r as any).autores || [];
      
      // Collect all property keys
      Object.keys(cancion).forEach(key => allProperties.add(key));
      
      // Format autores as comma-separated names
      const autorNames = autores
        .filter((autor: any) => autor && autor.properties)
        .map((autor: any) => {
          const artista = convertNeo4jDates(autor.properties);
          return artista.stageName || artista.name || artista.id;
        })
        .filter((name: string) => name)
        .join(', ');
      
      // Format autor IDs as semicolon-separated
      const autorIds = autores
        .filter((autor: any) => autor && autor.properties && autor.properties.id)
        .map((autor: any) => convertNeo4jDates(autor.properties).id)
        .filter((id: string) => id)
        .join(';');
      
      // Add formatted author information
      const cancionData: Record<string, any> = {
        ...cancion,
        Author: autorNames || '', // Formatted author names
        autorIds: autorIds || cancion.autorIds || '', // Author IDs
      };
      
      canciones.push(cancionData);
    }
    
    // Ensure key properties are first in the order
    const priorityProperties = ['id', 'title', 'Author', 'youtubeMusic'];
    const sortedProperties = [
      ...priorityProperties.filter(p => allProperties.has(p) || p === 'Author'),
      ...Array.from(allProperties).filter(p => !priorityProperties.includes(p) && p !== 'autorIds'),
      'autorIds', // Add autorIds at the end
    ];
    
    // Create CSV headers
    const headers = sortedProperties.map(prop => {
      // Use display names for key properties
      if (prop === 'youtubeMusic') return 'YouTube ID';
      if (prop === 'id') return 'ID';
      if (prop === 'title') return 'Title';
      return prop;
    });
    
    // Create CSV content
    const lines: string[] = [headers.join(',')];
    
    for (const cancion of canciones) {
      const row = sortedProperties.map(prop => {
        const value = cancion[prop];
        return toCsvValue(value);
      });
      lines.push(row.join(','));
    }
    
    // Write to file
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `canciones-export-${timestamp}.csv`;
    // Save to project root for easy access
    // __dirname is backend/src/server/db/migration, so go up 5 levels to project root
    const outputDir = path.join(__dirname, '../../../../..');
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, lines.join('\n') + '\n', 'utf-8');
    
    console.log('✅ Export completed successfully!');
    console.log(`\n📄 CSV file saved to: ${filepath}`);
    console.log(`📊 Total Canciones exported: ${canciones.length}`);
    console.log(`📋 Total columns: ${headers.length}`);
    console.log(`\nKey columns:`);
    console.log(`  - ID: ${canciones.filter(c => c.id).length} entries`);
    console.log(`  - Title: ${canciones.filter(c => c.title).length} entries`);
    console.log(`  - Author: ${canciones.filter(c => c.Author).length} entries`);
    console.log(`  - YouTube ID: ${canciones.filter(c => c.youtubeMusic).length} entries`);
    console.log(`\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

// Run export if this file is executed directly
if (require.main === module) {
  exportCancionesToCSV();
}

export { exportCancionesToCSV };

