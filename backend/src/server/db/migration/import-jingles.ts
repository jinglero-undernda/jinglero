/**
 * Import Jingles from CSV
 * 
 * Usage:
 *   npx ts-node src/server/db/migration/import-jingles.ts [filename]
 * 
 * Example:
 *   npx ts-node src/server/db/migration/import-jingles.ts node-Jingle-2025-11-18-[2].csv
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { Neo4jClient } from '../index';
import { parse } from 'csv-parse/sync';

const IMPORT_FOLDER = join(__dirname, '..', 'import');
const BATCH_SIZE = 100;

// Entity type to prefix mapping
const ENTITY_PREFIX_MAP: Record<string, string> = {
  jingles: 'j',
  canciones: 'c',
  artistas: 'a',
  tematicas: 't',
  usuarios: 'u',
};

// Entity type to label mapping
const ENTITY_LABEL_MAP: Record<string, string> = {
  jingles: 'Jingle',
  canciones: 'Cancion',
  artistas: 'Artista',
  tematicas: 'Tematica',
  usuarios: 'Usuario',
};

/**
 * Convert timestamp string to seconds (integer)
 * Handles various formats: "03:32", "24:48:00", "01:02:31", "1:02:31", etc.
 * Returns integer seconds instead of HH:MM:SS string
 */
function normalizeTimestamp(timestamp: string): number {
  if (!timestamp || timestamp.trim() === '') {
    return 0;
  }
  
  const trimmed = timestamp.trim();
  const parts = trimmed.split(':');
  
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  
  // Handle HH:MM:SS format
  if (parts.length === 3) {
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
    seconds = parseInt(parts[2], 10) || 0;
    
    // If hours > 23, treat as minutes (e.g., "24:48:00" -> hours=0, minutes=24, seconds=48)
    if (hours > 23) {
      minutes = hours;
      hours = 0;
    }
  } else if (parts.length === 2) {
    // Handle MM:SS format
    minutes = parseInt(parts[0], 10) || 0;
    seconds = parseInt(parts[1], 10) || 0;
    hours = 0;
  } else {
    // Invalid format, return default
    console.warn(`⚠️  Invalid timestamp format: ${timestamp}, using default 0 seconds`);
    return 0;
  }
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convert timestamp string (HH:MM:SS) to seconds
 * (Same as timestampToSeconds from admin.ts)
 */
function timestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;
  const parts = timestamp.split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Generate a unique ID for a Jingle with collision detection
 * Format: j{8-chars} where chars are base36 alphanumeric (0-9, a-z)
 */
async function generateJingleId(db: Neo4jClient): Promise<string> {
  const prefix = ENTITY_PREFIX_MAP['jingles'];
  const label = ENTITY_LABEL_MAP['jingles'];
  
  // Generate ID with collision detection (max 10 retries)
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Generate 8 random characters using base36 (0-9, a-z)
    const randomBytesBuffer = randomBytes(6); // 6 bytes = 48 bits
    let randomNum = 0;
    for (let i = 0; i < 6; i++) {
      randomNum = randomNum * 256 + randomBytesBuffer[i];
    }
    
    // Convert to base36 and pad to 8 characters
    const chars = randomNum.toString(36).toLowerCase().padStart(8, '0').slice(0, 8);
    const id = `${prefix}${chars}`;
    
    // Check for collision
    const existsQuery = `MATCH (n:${label} { id: $id }) RETURN n LIMIT 1`;
    const existing = await db.executeQuery(existsQuery, { id });
    
    if (existing.length === 0) {
      return id; // No collision, return the ID
    }
    
    console.warn(`ID collision detected for ${id}, retrying... (attempt ${attempt + 1}/${maxRetries})`);
  }
  
  throw new Error(`Failed to generate unique ID for jingles after ${maxRetries} attempts`);
}

/**
 * Verify if Fabrica exists
 */
async function verifyFabricaExists(db: Neo4jClient, fabricaId: string): Promise<boolean> {
  const query = `MATCH (f:Fabrica {id: $fabricaId}) RETURN f.id AS id LIMIT 1`;
  const result = await db.executeQuery<{ id: string }>(query, { fabricaId });
  return result.length > 0;
}

/**
 * Check if duplicate APPEARS_IN relationship exists
 * Returns true if any Jingle already has APPEARS_IN relationship to the same Fabrica with the same timestamp
 * Timestamp is now an integer (seconds)
 */
async function checkDuplicateRelationship(
  db: Neo4jClient,
  fabricaId: string,
  timestamp: number
): Promise<boolean> {
  const query = `
    MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
    WHERE r.timestamp = $timestamp
    RETURN j.id AS jingleId LIMIT 1
  `;
  const result = await db.executeQuery<{ jingleId: string }>(query, { fabricaId, timestamp });
  return result.length > 0;
}

/**
 * Convert CSV date string to ISO string for Neo4j
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
 * Parse boolean value from CSV
 */
function parseBoolean(value: string): boolean | null {
  if (!value || value.trim() === '') {
    return null;
  }
  const upper = value.toUpperCase().trim();
  return upper === 'TRUE' || upper === '1' || upper === 'YES';
}

/**
 * Import Jingles from CSV
 */
async function importJingles(filename: string): Promise<void> {
  const db = Neo4jClient.getInstance();
  const filePath = join(IMPORT_FOLDER, filename);
  
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║        JINGLE CSV IMPORT                         ║');
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
    
    console.log(`📊 Found ${records.length} Jingles in CSV file\n`);
    
    // Validate headers
    const actualHeaders = Object.keys(records[0] || {});
    console.log(`📋 CSV Headers: ${actualHeaders.join(', ')}\n`);
    
    // Process in batches
    let imported = 0;
    let updated = 0;
    let errors = 0;
    let relationshipsCreated = 0;
    let duplicatesSkipped = 0;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (rows ${i + 1}-${Math.min(i + BATCH_SIZE, records.length)})...`);
      
      const rowsToProcess: Array<{
        id: string;
        properties: Record<string, any>;
        fabricaId?: string;
        timestamp?: string;
      }> = [];
      
      // First pass: validate and prepare rows
      for (let idx = 0; idx < batch.length; idx++) {
        const record = batch[idx];
        const rowNum = i + idx + 2; // +2 because CSV has header and 0-indexed
        
        try {
          // Get or generate ID
          let id = record['id:ID'] || record.id || '';
          if (!id || id.trim() === '') {
            id = await generateJingleId(db);
          }
          
          // Validate required fields
          const title = record.title || '';
          const comment = record.comment || '';
          
          if (!title && !comment) {
            console.warn(`  ⚠️  Row ${rowNum}: Missing both title and comment, skipping...`);
            errors++;
            continue;
          }
          
          // Normalize timestamp
          const timestamp = normalizeTimestamp(record.timestamp || '');
          
          // Get fabricaId
          const fabricaId = record.fabricaId || '';
          
          // Check for duplicate relationship BEFORE creating Jingle
          if (fabricaId && fabricaId.trim() !== '') {
            const isDuplicate = await checkDuplicateRelationship(db, fabricaId, timestamp);
            if (isDuplicate) {
              console.warn(`  ⚠️  Row ${rowNum}: Duplicate APPEARS_IN relationship found (fabricaId: ${fabricaId}, timestamp: ${timestamp}), skipping...`);
              duplicatesSkipped++;
              continue;
            }
          }
          
          // Parse properties
          const properties: Record<string, any> = {
            id: id,
            title: title || null,
            comment: comment || null,
            timestamp: timestamp,
            songTitle: record.songTitle || null,
            artistName: record.artistName || null,
            genre: record.genre || null,
            isJinglazo: parseBoolean(record['isJinglazo:boolean'] || record.isJinglazo || ''),
            isJinglazoDelDia: parseBoolean(record['isJinglazoDelDia:boolean'] || record.isJinglazoDelDia || ''),
            isLive: parseBoolean(record['isLive:boolean'] || record.isLive || ''),
            isPrecario: parseBoolean(record['isPrecario:boolean'] || record.isPrecario || ''),
            isRepeat: parseBoolean(record['isRepeat:boolean'] || record.isRepeat || ''),
            status: record.status || 'DRAFT',
            fabricaId: fabricaId || null,
            fabricaDate: parseDate(record.fabricaDate || ''),
            cancionId: record.cancionId || null,
            createdAt: parseDate(record.createdAt || '') || new Date().toISOString(),
            updatedAt: parseDate(record.updatedAt || '') || new Date().toISOString(),
          };
          
          // Remove null values for cleaner properties
          Object.keys(properties).forEach(key => {
            if (properties[key] === null || properties[key] === '') {
              delete properties[key];
            }
          });
          
          rowsToProcess.push({
            id,
            properties,
            fabricaId: fabricaId || undefined,
            timestamp: timestamp || undefined,
          });
        } catch (error: any) {
          console.error(`  ❌ Error processing row ${rowNum}: ${error.message}`);
          errors++;
        }
      }
      
      if (rowsToProcess.length === 0) {
        console.log(`  ⚠️  No valid rows in this batch, skipping...`);
        continue;
      }
      
      // Check which Jingles already exist (before import)
      const idsToCheck = rowsToProcess.map(r => r.id);
      const existingQuery = `
        UNWIND $ids as id
        MATCH (j:Jingle { id: id })
        RETURN j.id as id
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
        MERGE (j:Jingle { id: row.id })
        SET j.title = row.title,
            j.comment = row.comment,
            j.songTitle = row.songTitle,
            j.artistName = row.artistName,
            j.genre = row.genre,
            j.isJinglazo = row.isJinglazo,
            j.isJinglazoDelDia = row.isJinglazoDelDia,
            j.isLive = row.isLive,
            j.isPrecario = row.isPrecario,
            j.isRepeat = row.isRepeat,
            j.status = row.status,
            j.fabricaId = row.fabricaId,
            j.fabricaDate = row.fabricaDate,
            j.cancionId = row.cancionId
        WITH j, row
        SET j.createdAt = CASE 
          WHEN row.createdAt IS NOT NULL AND row.createdAt <> '' THEN datetime(row.createdAt) 
          WHEN j.createdAt IS NULL THEN datetime() 
          ELSE j.createdAt 
        END,
        j.updatedAt = CASE 
          WHEN row.updatedAt IS NOT NULL AND row.updatedAt <> '' THEN datetime(row.updatedAt) 
          ELSE datetime() 
        END
        RETURN j.id as id
      `;
      
      // Prepare rows with dates as separate fields
      const rowsForImport = rowsToProcess.map(row => {
        const { createdAt, updatedAt, fabricaDate, ...rest } = row.properties;
        return {
          id: row.id,
          title: rest.title || null,
          comment: rest.comment || null,
          songTitle: rest.songTitle || null,
          artistName: rest.artistName || null,
          genre: rest.genre || null,
          isJinglazo: rest.isJinglazo !== undefined ? rest.isJinglazo : null,
          isJinglazoDelDia: rest.isJinglazoDelDia !== undefined ? rest.isJinglazoDelDia : null,
          isLive: rest.isLive !== undefined ? rest.isLive : null,
          isPrecario: rest.isPrecario !== undefined ? rest.isPrecario : null,
          isRepeat: rest.isRepeat !== undefined ? rest.isRepeat : null,
          status: rest.status || 'DRAFT',
          fabricaId: rest.fabricaId || null,
          fabricaDate: (fabricaDate && typeof fabricaDate === 'string' && fabricaDate.trim() !== '') ? fabricaDate : null,
          cancionId: rest.cancionId || null,
          createdAt: (createdAt && typeof createdAt === 'string' && createdAt.trim() !== '') ? createdAt : null,
          updatedAt: (updatedAt && typeof updatedAt === 'string' && updatedAt.trim() !== '') ? updatedAt : null,
        };
      });
      
      try {
        await db.executeQuery<{ id: string }>(
          query,
          { rows: rowsForImport },
          undefined,
          true
        );
        
        console.log(`  ✅ Processed ${rowsToProcess.length} Jingles`);
        
        // Create APPEARS_IN relationships
        for (const row of rowsToProcess) {
          if (row.fabricaId && row.timestamp) {
            // Verify Fabrica exists
            const fabricaExists = await verifyFabricaExists(db, row.fabricaId);
            if (!fabricaExists) {
              console.warn(`  ⚠️  Fabrica ${row.fabricaId} not found, skipping relationship creation for Jingle ${row.id}`);
              continue;
            }
            
            // Create APPEARS_IN relationship
            // Timestamp is now stored as integer (seconds)
            const relQuery = `
              MATCH (j:Jingle {id: $jingleId}), (f:Fabrica {id: $fabricaId})
              MERGE (j)-[r:APPEARS_IN]->(f)
              SET r.timestamp = $timestamp,
                  r.createdAt = CASE WHEN r.createdAt IS NULL THEN datetime() ELSE r.createdAt END
              WITH j, f, r
              SET j.fabricaId = f.id,
                  j.fabricaDate = f.date,
                  j.updatedAt = datetime()
              RETURN r
            `;
            
            await db.executeQuery(
              relQuery,
              {
                jingleId: row.id,
                fabricaId: row.fabricaId,
                timestamp: row.timestamp, // Already an integer from normalizeTimestamp()
              },
              undefined,
              true
            );
            
            relationshipsCreated++;
            
            // Update order for the Fabrica (using the function from admin.ts pattern)
            // We'll call updateAppearsInOrder after batch to optimize
          }
        }
        
        // Update order for all Fabricas that had relationships created
        const fabricaIdsToUpdate = new Set(
          rowsToProcess
            .filter(r => r.fabricaId)
            .map(r => r.fabricaId!)
        );
        
        for (const fabricaId of fabricaIdsToUpdate) {
          if (await verifyFabricaExists(db, fabricaId)) {
            // Update order - query all relationships, sort by timestamp, assign sequential order
            const queryRelationships = `
              MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
              RETURN j.id AS jingleId, r.timestamp AS timestamp, id(r) AS relId
              ORDER BY r.timestamp ASC, id(r) ASC
            `;
            
            const relationships = await db.executeQuery<{ 
              jingleId: string; 
              timestamp: string; 
              relId: any;
            }>(queryRelationships, { fabricaId });
            
            if (relationships.length > 0) {
              // Update order for each relationship sequentially
              for (let idx = 0; idx < relationships.length; idx++) {
                const rel = relationships[idx];
                const order = idx + 1;
                
                const updateOrderQuery = `
                  MATCH (j:Jingle {id: $jingleId})-[r:APPEARS_IN]->(f:Fabrica {id: $fabricaId})
                  SET r.order = $order
                `;
                
                await db.executeQuery(
                  updateOrderQuery,
                  {
                    jingleId: rel.jingleId,
                    fabricaId,
                    order,
                  },
                  undefined,
                  true
                );
              }
            }
          }
        }
        
      } catch (error: any) {
        console.error(`  ❌ Error importing batch: ${error.message}`);
        errors += rowsToProcess.length;
      }
    }
    
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║              IMPORT SUMMARY                        ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    console.log(`✅ Imported: ${imported} new Jingles`);
    console.log(`🔄 Updated: ${updated} existing Jingles`);
    console.log(`🔗 Relationships created: ${relationshipsCreated}`);
    console.log(`⚠️  Duplicates skipped: ${duplicatesSkipped}`);
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
  const filename = process.argv[2] || 'node-Jingle-2025-11-18-[2].csv';
  
  importJingles(filename)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import script failed:', error);
      process.exit(1);
    });
}

export { importJingles };

