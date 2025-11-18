/**
 * Import Fabricas from CSV
 * 
 * Usage:
 *   npx ts-node src/server/db/migration/import-fabricas.ts [filename]
 * 
 * Example:
 *   npx ts-node src/server/db/migration/import-fabricas.ts node-Fabrica-2025-11-18.csv
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Neo4jClient } from '../index';
import { parse } from 'csv-parse/sync';

const IMPORT_FOLDER = join(__dirname, '..', 'import');
const BATCH_SIZE = 100;

/**
 * Convert CSV date string to ISO string for Neo4j
 * Neo4j expects ISO 8601 strings, not Date objects
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  // Try ISO format first
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    return dateStr;
  }
  
  // Try DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
    }
  }
  
  // Try YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${dateStr}T00:00:00.000Z`;
  }
  
  console.warn(`⚠️  Could not parse date: ${dateStr}, using current date`);
  return new Date().toISOString();
}

/**
 * Import Fabricas from CSV
 */
async function importFabricas(filename: string): Promise<void> {
  const db = Neo4jClient.getInstance();
  const filePath = join(IMPORT_FOLDER, filename);
  
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║        FABRICA CSV IMPORT                        ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  console.log(`📁 Reading file: ${filename}`);
  console.log(`📂 Full path: ${filePath}\n`);
  
  try {
    // Read and parse CSV
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true, // Allow extra columns
    }) as Record<string, string>[];
    
    console.log(`📊 Found ${records.length} Fabricas in CSV file\n`);
    
    // Validate headers
    const expectedHeaders = ['id:ID', 'contents', 'createdAt', 'date', 'description', 'likes:int', 'status', 'title', 'updatedAt', 'visualizations:int', 'youtubeUrl'];
    const actualHeaders = Object.keys(records[0] || {});
    console.log(`📋 CSV Headers: ${actualHeaders.join(', ')}\n`);
    
    // Process in batches
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (rows ${i + 1}-${Math.min(i + BATCH_SIZE, records.length)})...`);
      
      const rows = batch.map((record, idx) => {
        try {
          const id = record['id:ID'] || record.id;
          if (!id) {
            throw new Error('Missing id field');
          }
          
          // Parse properties
          const properties: Record<string, any> = {
            id: id,
            title: record.title || null,
            date: parseDate(record.date),
            youtubeUrl: record.youtubeUrl || `https://www.youtube.com/watch?v=${id}`,
            visualizations: record['visualizations:int'] || record.visualizations 
              ? parseInt(String(record['visualizations:int'] || record.visualizations).trim()) 
              : null,
            likes: record['likes:int'] || record.likes 
              ? parseInt(String(record['likes:int'] || record.likes).trim()) 
              : null,
            description: record.description || null,
            contents: record.contents || null,
            status: record.status || 'DRAFT',
            createdAt: parseDate(record.createdAt) || new Date(),
            updatedAt: parseDate(record.updatedAt) || new Date(),
          };
          
          // Remove null values for cleaner properties
          Object.keys(properties).forEach(key => {
            if (properties[key] === null || properties[key] === '') {
              delete properties[key];
            }
          });
          
          return { id, properties };
        } catch (error: any) {
          console.error(`  ❌ Error processing row ${i + idx + 2}: ${error.message}`);
          errors++;
          return null;
        }
      }).filter((row): row is { id: string; properties: Record<string, any> } => row !== null);
      
      if (rows.length === 0) {
        console.log(`  ⚠️  No valid rows in this batch, skipping...`);
        continue;
      }
      
      // Check which Fabricas already exist (before import)
      const idsToCheck = rows.map(r => r.id);
      const existingQuery = `
        UNWIND $ids as id
        MATCH (f:Fabrica { id: id })
        RETURN f.id as id
      `;
      const existing = await db.executeQuery<{ id: string }>(
        existingQuery,
        { ids: idsToCheck }
      );
      const existingIds = new Set(existing.map(e => e.id));
      
      // Count new vs updated
      for (const id of idsToCheck) {
        if (existingIds.has(id)) {
          updated++;
        } else {
          imported++;
        }
      }
      
      // Import batch - handle dates properly
      const query = `
        UNWIND $rows as row
        MERGE (f:Fabrica { id: row.id })
        SET f.title = row.title,
            f.youtubeUrl = row.youtubeUrl,
            f.visualizations = row.visualizations,
            f.likes = row.likes,
            f.description = row.description,
            f.contents = row.contents,
            f.status = row.status
        WITH f, row
        SET f.createdAt = CASE 
          WHEN row.createdAt IS NOT NULL AND row.createdAt <> '' THEN datetime(row.createdAt) 
          WHEN f.createdAt IS NULL THEN datetime() 
          ELSE f.createdAt 
        END,
        f.updatedAt = CASE 
          WHEN row.updatedAt IS NOT NULL AND row.updatedAt <> '' THEN datetime(row.updatedAt) 
          ELSE datetime() 
        END,
        f.date = CASE 
          WHEN row.date IS NOT NULL AND row.date <> '' THEN datetime(row.date) 
          ELSE f.date 
        END
        RETURN f.id as id
      `;
      
      // Prepare rows with dates as separate fields
      // Filter out empty strings - Neo4j needs null or valid ISO strings
      const rowsForImport = rows.map(row => {
        const { createdAt, updatedAt, date, ...rest } = row.properties;
        return {
          id: row.id,
          title: rest.title || null,
          youtubeUrl: rest.youtubeUrl || `https://www.youtube.com/watch?v=${row.id}`,
          visualizations: rest.visualizations || null,
          likes: rest.likes || null,
          description: rest.description || null,
          contents: rest.contents || null,
          status: rest.status || 'DRAFT',
          createdAt: (createdAt && typeof createdAt === 'string' && createdAt.trim() !== '') ? createdAt : null,
          updatedAt: (updatedAt && typeof updatedAt === 'string' && updatedAt.trim() !== '') ? updatedAt : null,
          date: (date && typeof date === 'string' && date.trim() !== '') ? date : null,
        };
      });
      
      try {
        const results = await db.executeQuery<{ id: string }>(
          query,
          { rows: rowsForImport },
          undefined,
          true
        );
        
        console.log(`  ✅ Processed ${rows.length} Fabricas`);
      } catch (error: any) {
        console.error(`  ❌ Error importing batch: ${error.message}`);
        errors += rows.length;
      }
    }
    
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║              IMPORT SUMMARY                        ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    console.log(`✅ Imported: ${imported} new Fabricas`);
    console.log(`🔄 Updated: ${updated} existing Fabricas`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${records.length} rows processed\n`);
    
    if (errors === 0) {
      console.log('✅ Import completed successfully!\n');
    } else {
      console.log(`⚠️  Import completed with ${errors} error(s)\n`);
    }
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    if (error.code === 'ENOENT') {
      console.error(`\n💡 File not found: ${filePath}`);
      console.error('   Make sure the CSV file is in: backend/src/server/db/import/');
    }
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const filename = process.argv[2] || 'node-Fabrica-2025-11-18.csv';
  
  importFabricas(filename)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import script failed:', error);
      process.exit(1);
    });
}

export { importFabricas };

