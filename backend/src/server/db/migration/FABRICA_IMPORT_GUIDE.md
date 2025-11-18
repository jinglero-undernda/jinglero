# Fabrica CSV Import Guide

## Step-by-Step Import Process

### Step 1: Verify CSV File Location ✅

Your CSV file should be in:
```
backend/src/server/db/import/node-Fabrica-2025-11-18.csv
```

**Verify it exists:**
```bash
cd backend
ls -lh src/server/db/import/node-Fabrica-2025-11-18.csv
```

### Step 2: Check CSV Format ✅

**Expected headers:**
```csv
id:ID,contents,createdAt,date,description,likes:int,status,title,updatedAt,visualizations:int,youtubeUrl
```

**Quick validation:**
```bash
head -1 src/server/db/import/node-Fabrica-2025-11-18.csv
```

### Step 3: Review Data (Optional) 🔍

**Check how many Fabricas you're importing:**
```bash
# Count non-header rows (subtract 1 for header)
wc -l src/server/db/import/node-Fabrica-2025-11-18.csv
```

**Preview first few rows:**
```bash
head -5 src/server/db/import/node-Fabrica-2025-11-18.csv
```

### Step 4: Run the Import 🚀

**Option A: Using npm script (Recommended)**
```bash
cd backend
npm run db:import-fabricas node-Fabrica-2025-11-18.csv
```

**Option B: Direct ts-node**
```bash
cd backend
npx ts-node src/server/db/migration/import-fabricas.ts node-Fabrica-2025-11-18.csv
```

**Option C: Default filename (if file is named exactly `node-Fabrica-2025-11-18.csv`)**
```bash
cd backend
npm run db:import-fabricas
```

### Step 5: Monitor Import Progress 📊

The script will:
1. ✅ Read and parse the CSV file
2. ✅ Validate headers
3. ✅ Process Fabricas in batches of 100
4. ✅ Show progress for each batch
5. ✅ Display summary: imported vs updated vs errors

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║        FABRICA CSV IMPORT                        ║
╚═══════════════════════════════════════════════════╝

📁 Reading file: node-Fabrica-2025-11-18.csv
📂 Full path: /path/to/import/node-Fabrica-2025-11-18.csv

📊 Found 57 Fabricas in CSV file

📋 CSV Headers: id:ID,contents,createdAt,date,description,likes:int,status,title,updatedAt,visualizations:int,youtubeUrl

📦 Processing batch 1 (rows 1-57)...
  ✅ Processed 57 Fabricas

╔═══════════════════════════════════════════════════╗
║              IMPORT SUMMARY                        ║
╚═══════════════════════════════════════════════════╝

✅ Imported: 51 new Fabricas
🔄 Updated: 6 existing Fabricas
❌ Errors: 0
📊 Total: 57 rows processed

✅ Import completed successfully!
```

### Step 6: Verify Import ✅

**Check in Neo4j Browser:**
```cypher
// Count all Fabricas
MATCH (f:Fabrica)
RETURN count(f) as total;

// Check recently imported Fabricas
MATCH (f:Fabrica)
WHERE f.updatedAt > datetime('2025-11-18T00:00:00Z')
RETURN f.id, f.title, f.date
ORDER BY f.date DESC
LIMIT 10;

// Verify a specific Fabrica
MATCH (f:Fabrica { id: '0hmxZPp0xq0' })
RETURN f;
```

**Or use the API:**
```bash
curl http://localhost:3000/api/public/entities/fabricas/0hmxZPp0xq0
```

## Troubleshooting

### ❌ Error: File not found
**Solution:** Make sure the CSV file is in `backend/src/server/db/import/` directory

### ❌ Error: Cannot parse date
**Solution:** The script handles multiple date formats:
- ISO: `2025-11-18T00:00:00.000Z`
- DD/MM/YYYY: `5/6/2025`
- YYYY-MM-DD: `2025-11-18`

If dates fail to parse, they'll default to current date with a warning.

### ❌ Error: Missing required fields
**Solution:** Required fields:
- `id:ID` or `id` - YouTube video ID (11 characters)

All other fields are optional and will be set to `null` if missing.

### ⚠️ Warning: Duplicate IDs
**Behavior:** The script uses `MERGE`, so:
- **New Fabricas**: Will be created
- **Existing Fabricas**: Will be updated with new data

This is safe and expected behavior.

### ⚠️ Empty fields
**Behavior:** Empty fields (`""` or missing) will be set to `null` in the database, which is correct.

## Import Behavior

### What Happens:
1. **MERGE** operation: Creates if new, updates if exists
2. **ON CREATE**: Sets all properties + `createdAt`
3. **ON MATCH**: Updates all properties + `updatedAt`
4. **Batch processing**: Processes 100 Fabricas at a time
5. **Error handling**: Continues on errors, reports at end

### Data Transformations:
- **Dates**: Parsed from DD/MM/YYYY or ISO format
- **Numbers**: `likes:int` and `visualizations:int` converted to integers
- **YouTube URLs**: Auto-generated if missing: `https://www.youtube.com/watch?v={id}`
- **Status**: Defaults to `'DRAFT'` if not provided
- **Null values**: Empty strings converted to `null`

## Next Steps After Import

1. **Verify data** using Neo4j Browser queries above
2. **Import relationships** if you have `rel-Jingle-APPEARS_IN-Fabrica-*.csv` files
3. **Re-export** to get updated CSV with any auto-generated fields:
   ```bash
   npm run db:export-csv
   ```

## Quick Reference

```bash
# Import Fabricas
npm run db:import-fabricas node-Fabrica-2025-11-18.csv

# Export all data (after import)
npm run db:export-csv

# Generate IDs for new entities
npm run db:generate-id -- jingle 10
```

---

**Need Help?** Check the import script logs for detailed error messages.

