/**
 * Update Cancion nodes from CSV with YouTube IDs and other fields
 * Uses the backend Public API to retrieve Canciones and Admin API to update them
 * 
 * Usage:
 *   npx ts-node src/server/db/migration/update-canciones-from-csv.ts [filename] [--api-url=http://localhost:3000]
 * 
 * Example:
 *   npx ts-node src/server/db/migration/update-canciones-from-csv.ts node-Cancion-2026-01-05.csv
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';
import axios, { AxiosInstance } from 'axios';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const IMPORT_FOLDER = join(__dirname, '..', 'import');
const BATCH_SIZE = 50; // Smaller batches for interactive confirmation

// API configuration
const API_BASE_URL = process.env.API_URL || process.argv.find(arg => arg.startsWith('--api-url='))?.split('=')[1] || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Map CSV column names to Neo4j property names
const CSV_TO_DB_MAP: Record<string, string> = {
  'ID': 'id',
  'Title': 'title',
  // 'Author': 'author', // Skipped - handled via autorIds relationships, not a direct property
  'YouTube ID': 'youtubeMusic',
  // 'createdAt': 'createdAt', // Skipped - shouldn't be updated from CSV
  // 'musicBrainzConfidence': 'musicBrainzConfidence', // Skipped - not in schema
  // 'displayBadges': 'displayBadges', // System-managed
  // 'normSearch': 'normSearch', // System-managed
  'musicBrainzId': 'musicBrainzId',
  // 'displaySecondary': 'displaySecondary', // System-managed
  // 'displayPrimary': 'displayPrimary', // System-managed
  // 'updatedAt': 'updatedAt', // Skipped - auto-managed by API
  'status': 'status',
  'album': 'album',
  'genre': 'genre',
  'year': 'year',
  // 'autorIds': 'autorIds', // Skipped - managed via relationships
};

// Fields that should be skipped (system-managed or not updatable via CSV)
const SKIP_FIELDS = new Set([
  'id', // Never update ID
  'displayPrimary', // System-managed
  'displaySecondary', // System-managed
  'displayBadges', // System-managed
  'normSearch', // System-managed
  'autorIds', // Managed via relationships
  'createdAt', // Usually shouldn't be updated
  'updatedAt', // Auto-managed by API
  'author', // Not a direct property (handled via autorIds relationships)
  'musicBrainzConfidence', // Not in schema
]);

// Fields that can be auto-updated without confirmation if blank in DB
const AUTO_UPDATE_FIELDS = new Set([
  'youtubeMusic',
  'album',
  'genre',
  'year',
  'musicBrainzId',
  'status',
]);

interface CancionNode {
  id: string;
  title?: string;
  album?: string;
  year?: number;
  genre?: string;
  youtubeMusic?: string;
  lyrics?: string;
  musicBrainzId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface UpdatePlan {
  field: string;
  oldValue: any;
  newValue: any;
  requiresConfirmation: boolean;
}

/**
 * Parse date string to ISO format
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Parse year string to number
 */
function parseYear(yearStr: string): number | null {
  if (!yearStr || yearStr.trim() === '') return null;
  const year = parseInt(yearStr.trim(), 10);
  if (isNaN(year)) return null;
  return year;
}

/**
 * Normalize value for comparison (handle null, undefined, empty strings)
 */
function normalizeValue(value: any): any {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

/**
 * Compare two values for equality
 */
function valuesEqual(oldVal: any, newVal: any): boolean {
  const normalizedOld = normalizeValue(oldVal);
  const normalizedNew = normalizeValue(newVal);
  
  if (normalizedOld === null && normalizedNew === null) return true;
  if (normalizedOld === null || normalizedNew === null) return false;
  
  // For numbers, compare as numbers
  if (typeof normalizedOld === 'number' && typeof normalizedNew === 'number') {
    return normalizedOld === normalizedNew;
  }
  
  // For strings, case-insensitive comparison
  if (typeof normalizedOld === 'string' && typeof normalizedNew === 'string') {
    return normalizedOld.toLowerCase() === normalizedNew.toLowerCase();
  }
  
  return normalizedOld === normalizedNew;
}

/**
 * Prompt user for confirmation
 */
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

/**
 * Get authentication token for Admin API
 */
async function getAdminToken(apiClient: AxiosInstance): Promise<string | null> {
  if (!ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD not set. Cannot authenticate with Admin API.');
    return null;
  }
  
  try {
    const response = await apiClient.post('/api/admin/login', {
      password: ADMIN_PASSWORD,
    });
    
    if (response.data?.token) {
      return response.data.token;
    }
    
    return null;
  } catch (error: any) {
    console.error(`❌ Failed to authenticate: ${error.message}`);
    return null;
  }
}

/**
 * Get existing Cancion node from database via Public API
 */
async function getExistingCancion(
  apiClient: AxiosInstance,
  id: string
): Promise<CancionNode | null> {
  try {
    const response = await apiClient.get(`/api/public/canciones/${id}`);
    return response.data as CancionNode;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Analyze CSV row and create update plan
 */
function createUpdatePlan(
  csvRow: Record<string, string>,
  existingNode: CancionNode
): UpdatePlan[] {
  const updates: UpdatePlan[] = [];
  
  for (const [csvKey, dbKey] of Object.entries(CSV_TO_DB_MAP)) {
    // Skip fields that shouldn't be updated
    if (SKIP_FIELDS.has(dbKey)) continue;
    
    const csvValue = csvRow[csvKey];
    const existingValue = existingNode[dbKey];
    
    // Skip if CSV value is blank
    if (!csvValue || csvValue.trim() === '') continue;
    
    // Parse CSV value based on field type
    let parsedCsvValue: any = csvValue.trim();
    if (dbKey === 'year') {
      parsedCsvValue = parseYear(csvValue);
      if (parsedCsvValue === null) continue; // Invalid year, skip
    } else if (dbKey === 'updatedAt' || dbKey === 'createdAt') {
      parsedCsvValue = parseDate(csvValue);
      if (parsedCsvValue === null) continue; // Invalid date, skip
    }
    
    // Check if update is needed
    if (valuesEqual(existingValue, parsedCsvValue)) {
      continue; // Values are the same, no update needed
    }
    
    // Determine if confirmation is required
    const requiresConfirmation = !AUTO_UPDATE_FIELDS.has(dbKey) || 
                                 (existingValue !== null && existingValue !== undefined && existingValue !== '');
    
    updates.push({
      field: dbKey,
      oldValue: existingValue,
      newValue: parsedCsvValue,
      requiresConfirmation,
    });
  }
  
  return updates;
}

/**
 * Sanitize updates to ensure only primitive values are sent
 * Removes any Neo4j-specific types or complex objects
 */
function sanitizeUpdates(updates: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(updates)) {
    // Skip null/undefined
    if (value === null || value === undefined) {
      continue;
    }
    
    // Keep primitives
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
    // Convert arrays of primitives
    else if (Array.isArray(value)) {
      const primitiveArray = value.filter(v => 
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      );
      if (primitiveArray.length > 0) {
        sanitized[key] = primitiveArray;
      }
    }
    // Skip objects (they might be Neo4j types)
  }
  
  return sanitized;
}

/**
 * Update Cancion node in database via Admin API
 * Uses PATCH for partial updates (merges with existing data)
 */
async function updateCancion(
  apiClient: AxiosInstance,
  adminToken: string,
  id: string,
  updates: Record<string, any>
): Promise<void> {
  // Sanitize updates to ensure only primitive values
  const sanitized = sanitizeUpdates(updates);
  
  if (Object.keys(sanitized).length === 0) {
    return; // Nothing to update
  }
  
  try {
    await apiClient.patch(
      `/api/admin/canciones/${id}`,
      sanitized,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      }
    );
  } catch (error: any) {
    if (error.response) {
      throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Process a single Cancion row
 */
async function processCancionRow(
  apiClient: AxiosInstance,
  adminToken: string,
  csvRow: Record<string, string>,
  rowNum: number
): Promise<{ updated: boolean; skipped: boolean; error?: string }> {
  const id = csvRow['ID'] || csvRow['id'];
  
  if (!id || id.trim() === '') {
    return { updated: false, skipped: true, error: 'Missing ID' };
  }
  
  try {
    // Get existing node
    const existingNode = await getExistingCancion(apiClient, id.trim());
    
    if (!existingNode) {
      console.log(`  ⚠️  Row ${rowNum}: Cancion ${id} not found in database, skipping...`);
      return { updated: false, skipped: true, error: 'Node not found' };
    }
    
    // Create update plan
    const updatePlan = createUpdatePlan(csvRow, existingNode);
    
    if (updatePlan.length === 0) {
      return { updated: false, skipped: true }; // No updates needed
    }
    
    // Separate auto-updates from confirmation-required updates
    const autoUpdates: Record<string, any> = {};
    const confirmationUpdates: UpdatePlan[] = [];
    
    for (const update of updatePlan) {
      if (!update.requiresConfirmation) {
        autoUpdates[update.field] = update.newValue;
      } else {
        confirmationUpdates.push(update);
      }
    }
    
    // Apply auto-updates
    if (Object.keys(autoUpdates).length > 0) {
      await updateCancion(apiClient, adminToken, id.trim(), autoUpdates);
      console.log(`  ✓ Row ${rowNum}: Auto-updated ${Object.keys(autoUpdates).join(', ')} for ${id}`);
    }
    
    // Handle confirmation-required updates
    if (confirmationUpdates.length > 0) {
      console.log(`\n  📋 Row ${rowNum}: Cancion ${id} - Changes requiring confirmation:`);
      for (const update of confirmationUpdates) {
        console.log(`     ${update.field}:`);
        console.log(`       Old: ${update.oldValue ?? '(empty)'}`);
        console.log(`       New: ${update.newValue}`);
      }
      
      const confirmed = await askConfirmation(`  Apply these changes?`);
      
      if (confirmed) {
        const confirmedUpdates: Record<string, any> = {};
        for (const update of confirmationUpdates) {
          confirmedUpdates[update.field] = update.newValue;
        }
        await updateCancion(apiClient, adminToken, id.trim(), confirmedUpdates);
        console.log(`  ✓ Row ${rowNum}: Confirmed updates applied for ${id}`);
        return { updated: true, skipped: false };
      } else {
        console.log(`  ⊘ Row ${rowNum}: Updates skipped for ${id}`);
        return { updated: false, skipped: true };
      }
    }
    
    return { updated: true, skipped: false };
  } catch (error: any) {
    console.error(`  ❌ Row ${rowNum}: Error processing ${id}: ${error.message}`);
    return { updated: false, skipped: false, error: error.message };
  }
}

/**
 * Main import function
 */
async function updateCancionesFromCSV(filename: string): Promise<void> {
  const filePath = join(IMPORT_FOLDER, filename);
  
  // Create API client
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });
  
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     CANCION CSV UPDATE (Interactive)              ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  console.log(`📁 Reading file: ${filename}`);
  console.log(`📂 Full path: ${filePath}`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}\n`);
  
  // Authenticate with Admin API
  console.log('🔐 Authenticating with Admin API...');
  const adminToken = await getAdminToken(apiClient);
  if (!adminToken) {
    throw new Error('Failed to authenticate with Admin API. Please check ADMIN_PASSWORD environment variable.');
  }
  console.log('✓ Authentication successful\n');
  
  try {
    // Read and parse CSV
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Record<string, string>[];
    
    console.log(`📊 Found ${records.length} Canciones in CSV file\n`);
    
    // Validate headers
    const actualHeaders = Object.keys(records[0] || {});
    console.log(`📋 CSV Headers: ${actualHeaders.join(', ')}\n`);
    
    // Statistics
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    let autoUpdated = 0;
    let confirmedUpdated = 0;
    
    // Process in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (rows ${i + 1}-${Math.min(i + BATCH_SIZE, records.length)})...`);
      
      for (let idx = 0; idx < batch.length; idx++) {
        const record = batch[idx];
        const rowNum = i + idx + 2; // +2 because CSV has header and 0-indexed
        
        const result = await processCancionRow(apiClient, adminToken, record, rowNum);
        
        if (result.error) {
          errors++;
        } else if (result.skipped) {
          skipped++;
        } else if (result.updated) {
          updated++;
          // Distinguish between auto and confirmed (simplified - you could track this better)
          if (Object.keys(record).some(k => AUTO_UPDATE_FIELDS.has(CSV_TO_DB_MAP[k] || ''))) {
            autoUpdated++;
          } else {
            confirmedUpdated++;
          }
        }
      }
    }
    
    // Print summary
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                        ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    console.log(`✓ Updated: ${updated} (${autoUpdated} auto, ${confirmedUpdated} confirmed)`);
    console.log(`⊘ Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${records.length}\n`);
    
  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    throw error;
  }
}

// Main execution
const filename = process.argv[2] || 'node-Cancion-2026-01-05.csv';
updateCancionesFromCSV(filename)
  .then(() => {
    console.log('\n✅ Update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  });

