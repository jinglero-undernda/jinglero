# CSV Import Guide

## ✅ Yes, Populating CSV Files is the Right Approach!

Adding entities to the CSV files and importing them is an efficient way to bulk-load data into your Neo4j database. This guide explains how to do it correctly.

## 📋 Quick Steps

### 1. **Add New Rows to CSV Files**

Simply add new rows to the appropriate CSV files in `backend/src/server/db/import/`:

- **Entity files**: `node-{EntityType}-2025-11-17.csv`
- **Relationship files**: `rel-{StartLabel}-{RelType}-{EndLabel}-2025-11-17.csv`

### 2. **Generate New IDs**

**Important**: All new entities must use the new ID format: `{prefix}{8-char-base36}`

**Prefixes:**
- `j` - Jingle (e.g., `j1a2b3c4`)
- `c` - Cancion (e.g., `c5d6e7f8`)
- `a` - Artista (e.g., `a9g0h1i2`)
- `t` - Tematica (e.g., `t3j4k5l6`)
- `u` - Usuario (e.g., `u7m8n9o0`)
- **Fabricas**: Use YouTube video IDs (11 chars, e.g., `DBbyI99TtIM`)

**Quick ID Generator:**
```javascript
// In browser console or Node.js:
const prefix = 'j'; // or 'c', 'a', 't', 'u'
const randomPart = Math.random().toString(36).substring(2, 10);
const newId = prefix + randomPart;
console.log(newId); // e.g., "j1a2b3c4"
```

Or use the API endpoint: `POST /api/admin/{type}` (without `id` field - it auto-generates)

### 3. **CSV Format Requirements**

#### Entity Files (e.g., `node-Jingle-2025-11-17.csv`)

**Headers must match exactly:**
```csv
id:ID,title,timestamp,songTitle,artistName,genre,fabricaId,fabricaDate,cancionId,isJinglazo:boolean,isJinglazoDelDia:boolean,isPrecario:boolean,comment,createdAt,updatedAt
```

**Example row:**
```csv
j1a2b3c4,My New Jingle,00:05:30,Song Title,Artist Name,Pop,fabrica123,2025-11-17T00:00:00.000Z,c5d6e7f8,true,false,false,Great jingle!,2025-11-17T12:00:00.000Z,2025-11-17T12:00:00.000Z
```

**Notes:**
- **Dates**: Use ISO 8601 format: `2025-11-17T12:00:00.000Z`
- **Booleans**: Use `true` or `false` (lowercase)
- **Arrays**: Join with semicolons (e.g., `autorIds` = `a1;a2;a3`)
- **Empty fields**: Leave blank (no `null` or `undefined`)
- **Special characters**: Will be auto-escaped

#### Relationship Files (e.g., `rel-Jingle-APPEARS_IN-Fabrica-2025-11-17.csv`)

**Headers:**
```csv
:START_ID,:END_ID,timestamp,order:int
```

**Example row:**
```csv
j1a2b3c4,fabrica123,00:05:30,1
```

**Notes:**
- `:START_ID` and `:END_ID` must reference existing entity IDs
- `order` is auto-calculated, but you can provide it (will be recalculated on import)
- `timestamp` format: `HH:MM:SS` (e.g., `00:05:30`)

### 4. **Import the CSV Files**

#### Option A: Use the Seed Script (Recommended)

Update `backend/src/server/db/schema/seed.ts` to reference your new CSV files:

```typescript
const NODE_IMPORTS = [
  {
    label: 'Jingle',
    file: 'node-Jingle-2025-11-17.csv', // Update filename
    setters: (row: any) => ({
      id: row.id,
      title: row.title,
      // ... other properties
    })
  },
  // ... other entities
];
```

Then run:
```bash
cd backend
npx ts-node src/server/db/schema/seed.ts
```

#### Option B: Use Neo4j Browser (Manual Import)

1. Open Neo4j Browser
2. Use `LOAD CSV` commands:

```cypher
// Load Jingles
LOAD CSV WITH HEADERS FROM 'file:///node-Jingle-2025-11-17.csv' AS row
MERGE (j:Jingle { id: row.id })
SET j += {
  title: row.title,
  timestamp: row.timestamp,
  // ... other properties
};

// Load Relationships
LOAD CSV WITH HEADERS FROM 'file:///rel-Jingle-APPEARS_IN-Fabrica-2025-11-17.csv' AS row
MATCH (j:Jingle { id: row[':START_ID'] })
MATCH (f:Fabrica { id: row[':END_ID'] })
MERGE (j)-[r:APPEARS_IN]->(f)
SET r.timestamp = row.timestamp,
    r.order = toInteger(row.order);
```

#### Option C: Create a New Import Script

Create `backend/src/server/db/migration/import-from-csv.ts`:

```typescript
import { exportToCSV } from './export-to-csv';
// Similar to seed.ts but uses latest CSV files
```

### 5. **Best Practices**

✅ **DO:**
- Keep CSV files in sync with database
- Use consistent date formats (ISO 8601)
- Generate unique IDs (check for collisions)
- Import nodes before relationships
- Validate data before importing

❌ **DON'T:**
- Mix old and new ID formats
- Use old format IDs (e.g., `JIN-0001`, `CAN-001`)
- Skip required fields
- Create relationships to non-existent entities
- Import relationships before nodes

### 6. **Validation After Import**

After importing, verify:

```cypher
// Check entity counts
MATCH (n)
RETURN labels(n)[0] as Type, count(n) as Count
ORDER BY Count DESC;

// Check for old format IDs (should be none except Fabricas)
MATCH (n)
WHERE NOT n:Fabrica AND n.id =~ '.*-.*'
RETURN labels(n)[0] as Type, n.id as OldFormatId
LIMIT 10;

// Verify relationships
MATCH ()-[r]->()
RETURN type(r) as RelType, count(r) as Count
ORDER BY Count DESC;
```

### 7. **Troubleshooting**

**Problem**: Import fails with "Node not found"
- **Solution**: Ensure all referenced entity IDs exist before importing relationships

**Problem**: Duplicate IDs
- **Solution**: Use `MERGE` instead of `CREATE` (seed.ts already does this)

**Problem**: Date format errors
- **Solution**: Ensure dates are ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

**Problem**: Boolean values not working
- **Solution**: Use lowercase `true`/`false`, not `True`/`False` or `1`/`0`

## 📊 Current CSV Files

All files are in: `backend/src/server/db/import/`

**Entity Files:**
- `node-Artista-2025-11-17.csv` (37 rows)
- `node-Cancion-2025-11-17.csv` (28 rows)
- `node-Fabrica-2025-11-17.csv` (6 rows)
- `node-Jingle-2025-11-17.csv` (29 rows)
- `node-Tematica-2025-11-17.csv` (20 rows)
- `node-Usuario-2025-11-17.csv` (3 rows)

**Relationship Files:**
- `rel-Jingle-APPEARS_IN-Fabrica-2025-11-17.csv` (27 rows)
- `rel-Jingle-VERSIONA-Cancion-2025-11-17.csv` (27 rows)
- `rel-Artista-AUTOR_DE-Cancion-2025-11-17.csv` (27 rows)
- `rel-Artista-JINGLERO_DE-Jingle-2025-11-17.csv` (20 rows)
- `rel-Jingle-TAGGED_WITH-Tematica-2025-11-17.csv` (22 rows)
- `rel-Usuario-REACCIONA_A-Jingle-2025-11-17.csv` (4 rows)
- `rel-Usuario-SOY_YO-Artista-2025-11-17.csv` (1 row)

## 🚀 Quick Start Example

1. **Add a new Jingle** to `node-Jingle-2025-11-17.csv`:
```csv
j9z8y7x6,New Jingle Title,00:03:45,Original Song,Original Artist,Rock,fabrica123,2025-11-17T00:00:00.000Z,c1a2b3c4,true,false,false,Great song!,2025-11-17T14:00:00.000Z,2025-11-17T14:00:00.000Z
```

2. **Add APPEARS_IN relationship** to `rel-Jingle-APPEARS_IN-Fabrica-2025-11-17.csv`:
```csv
j9z8y7x6,fabrica123,00:03:45,5
```

3. **Import** using seed script or Neo4j Browser

4. **Verify**:
```cypher
MATCH (j:Jingle { id: 'j9z8y7x6' })
RETURN j;
```

---

**Need Help?** Check `backend/src/server/db/migration/README.md` for migration details.

