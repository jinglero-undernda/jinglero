# API Documentation

This document describes the public and admin API endpoints for Jinglero. All responses are JSON. Timestamps are ISO strings.

## Base URL

- Local development: `/api`

## Health

- GET `/api/public/health` → `{ status, timestamp }`

## Public API

### Global Search

- GET `/api/search`
  - Query params:
    - `q` (required): search text
    - `types` (optional): comma-separated of `jingles,canciones,artistas,tematicas`
    - `limit` (optional): per-entity limit (1–100)
    - `offset` (optional): per-entity offset
    - `mode` (optional): `basic` | `fulltext` (default `basic`)
  - 200: `{ jingles, canciones, artistas, tematicas, meta }`

### Entities (read)

- GET `/api/public/entities/:type`
  - `type`: `usuarios|artistas|canciones|fabricas|tematicas|jingles`
  - Query: `limit`, `offset`
- GET `/api/public/entities/:type/:id`

### Relationships (read)

- GET `/api/public/relationships/:type`
  - `type`: `autor_de|jinglero_de|appears_in|tagged_with|versiona|reacciona_a|soy_yo`
  - Query: `limit`, `offset`

### Entity relationships (summary)

- GET `/api/public/entities/:type/:id/relationships`
  - Returns incoming/outgoing relationships summary

### Related Entities

- GET `/api/public/entities/jingles/:id/related`
  - Query: `limit` (1–100), `types` (comma-separated of `sameJinglero,sameCancion,sameTematica`)
  - Returns: `{ sameJinglero, sameCancion, sameTematica, meta }`
- GET `/api/public/entities/canciones/:id/related`
  - Returns: `{ jinglesUsingCancion, otherCancionesByAutor, jinglesByAutorIfJinglero, meta }`
- GET `/api/public/entities/artistas/:id/related`
  - Returns: `{ jinglerosWhoUsedSongs, meta }`

### Fabricas (Video Player Support)

- **GET `/api/public/fabricas/latest`**

  - Returns the most recent Fabrica by `date` property
  - 200: Returns complete Fabrica object
  - 404: `{ error, message }` if no Fabricas exist
  - Example response:
    ```json
    {
      "id": "DBbyI99TtIM",
      "title": "HOLA QUE TAL SOY DONALD TRUMP",
      "date": "2025-10-23T22:26:41.000Z",
      "youtubeUrl": "https://www.youtube.com/watch?v=DBbyI99TtIM",
      "status": "DRAFT",
      "createdAt": "2025-10-22T13:39:36.000Z",
      "updatedAt": "2025-10-22T13:39:45.000Z"
    }
    ```

- **GET `/api/public/fabricas/:id/jingles`**

  - Returns all Jingles that appear in the specified Fabrica, ordered by appearance
  - Each Jingle includes `timestamp` (in seconds) and `timestampFormatted` (HH:MM:SS)
  - 200: Returns array of Jingles
  - 400: Invalid Fabrica ID
  - 404: `{ error, message, fabricaId }` if Fabrica not found
  - Returns empty array with message if Fabrica has no Jingles
  - Example response:
    ```json
    [
      {
        "id": "JIN-0001",
        "title": "Cluacas",
        "timestamp": 170,
        "timestampFormatted": "00:02:50",
        "order": 1,
        "songTitle": "Manuel Santillán, el León",
        "artistName": "Los Fabulosos Cadillacs",
        "genre": "Reggae",
        "isJinglazo": true,
        "isJinglazoDelDia": true,
        "isPrecario": false,
        "comment": "...",
        "createdAt": "2025-10-18T23:00:00.000Z",
        "updatedAt": "2025-10-18T23:00:00.000Z"
      }
    ]
    ```

- **GET `/api/public/fabricas/:id/jingle-at-time?timestamp=X`**
  - Returns the active Jingle at the specified timestamp (in seconds)
  - Query params:
    - `timestamp` (required): playback time in seconds (e.g., `120.5`)
  - Returns the Jingle whose timestamp is <= requested timestamp
  - 200: Returns the active Jingle with `timestamp` and `timestampFormatted`
  - 400: Missing or invalid timestamp parameter
  - 404: Fabrica not found, or timestamp is before first Jingle
  - Error responses include helpful context (first Jingle timestamp, formatted times)
  - Example response:
    ```json
    {
      "id": "JIN-0002",
      "title": "El Infierno Está Encantador Esta Noche",
      "timestamp": 310,
      "timestampFormatted": "00:05:10",
      "order": 2,
      "songTitle": "El Infierno Está Encantador Esta Noche",
      "artistName": "Patricio Rey y sus Redonditos de Ricota",
      "...": "..."
    }
    ```
  - Example error (timestamp too early):
    ```json
    {
      "error": "No Jingle found at this timestamp",
      "message": "The provided timestamp (100s) is before the first Jingle in this Fabrica",
      "requestedTimestamp": 100,
      "requestedTimestampFormatted": "00:01:40",
      "firstJingleTimestamp": 170,
      "firstJingleTimestampFormatted": "00:02:50",
      "fabricaId": "0hmxZPp0xq0"
    }
    ```

### Jingles (Enhanced)

- **GET `/api/public/jingles/:id`**
  - Returns complete Jingle data with all relationships
  - 200: Returns Jingle with nested relationship objects
  - 404: Jingle not found
  - Response includes:
    - All Jingle properties
    - `fabrica`: Complete Fabrica object with `timestamp` and `order` from APPEARS_IN relationship
    - `cancion`: Complete Cancion object (the song being parodied)
    - `jinglero`: Artista object (the person who performed the jingle)
    - `autor`: Artista object (the original song author)
    - `tematicas`: Array of Tematica objects with `isPrimary` flag
  - Example response:
    ```json
    {
      "id": "JIN-0001",
      "title": "Cluacas",
      "timestamp": "00:02:50",
      "songTitle": "Manuel Santillán, el León",
      "artistName": "Los Fabulosos Cadillacs",
      "genre": "Reggae",
      "isJinglazo": true,
      "isJinglazoDelDia": true,
      "isPrecario": false,
      "comment": "...",
      "fabrica": {
        "id": "0hmxZPp0xq0",
        "title": "Quisiera ser de Glew",
        "youtubeUrl": "https://www.youtube.com/watch?v=0hmxZPp0xq0",
        "timestamp": "00:02:50",
        "order": 1,
        "...": "..."
      },
      "cancion": {
        "id": "C-001",
        "title": "Manuel Santillán, el León",
        "genre": "Reggae",
        "...": "..."
      },
      "jinglero": {
        "id": "A-001",
        "stageName": "Lucas Niro",
        "...": "..."
      },
      "autor": {
        "id": "A-002",
        "stageName": "Vicentico",
        "...": "..."
      },
      "tematicas": [
        {
          "id": "T-001",
          "name": "Política",
          "category": "POLITICA",
          "isPrimary": true,
          "...": "..."
        }
      ]
    }
    ```

## Admin API

### ID Format Specification

All entities use a standardized ID format for consistency and brevity:

**Format**: `{prefix}{8-char-alphanumeric}`

- **Single-character prefix** identifies entity type:

  - `j` - Jingle (e.g., `j1a2b3c4`)
  - `c` - Cancion (e.g., `c5d6e7f8`)
  - `a` - Artista (e.g., `a9g0h1i2`)
  - `t` - Tematica (e.g., `t3j4k5l6`)
  - `u` - Usuario (e.g., `u7m8n9o0`)

- **8-character alphanumeric** string uses base36 encoding (0-9, a-z)
- IDs are **case-insensitive** for compatibility
- IDs are **globally unique** with collision detection
- **Total length**: 9 characters (1 prefix + 8 alphanumeric)

**Special Case - Fabrica IDs**:

- Fabricas use **external YouTube video IDs** (11 characters)
- Example: `DBbyI99TtIM`, `0hmxZPp0xq0`
- These IDs are **NOT** modified by the system

**Auto-Generation**:

- When creating entities via POST, the `id` field is **optional**
- If omitted, the system auto-generates a unique ID following the format above
- Custom IDs can be provided but must follow the format specification
- Collision detection ensures uniqueness with up to 10 retry attempts

**Examples**:

```json
{
  "jingle": { "id": "j1a2b3c4", "title": "My Jingle" },
  "cancion": { "id": "c5d6e7f8", "title": "Original Song" },
  "artista": { "id": "a9g0h1i2", "stageName": "Artist Name" },
  "fabrica": { "id": "DBbyI99TtIM", "title": "YouTube Video" }
}
```

### Redundant Properties (Denormalized Data)

For performance optimization, certain frequently-accessed relationships are also stored as **redundant properties** directly on entity nodes. These properties are **automatically managed** by the system and should be treated as **read-only** in most cases.

**Purpose**:

- Improve read performance by avoiding expensive relationship traversals
- Simplify common queries and reduce query complexity
- Enable faster filtering and sorting operations

**Maintenance Rules**:

1. **Relationships are the source of truth** - redundant properties reflect relationship state
2. **Auto-sync on CRUD operations** - system automatically updates redundant properties when relationships change
3. **Auto-fix on validation** - validation endpoints detect and correct any discrepancies
4. **Transactional consistency** - all updates occur within database transactions

**Redundant Properties by Entity**:

#### Jingle

- **`fabricaId`** (string | null)

  - Reflects the Fabrica ID from the `APPEARS_IN` relationship
  - Updated automatically when `APPEARS_IN` relationships are created/deleted
  - If multiple Fabricas, stores the most recent by `fabricaDate`
  - Set to `null` if no `APPEARS_IN` relationships exist

- **`fabricaDate`** (Date | null)

  - The date of the Fabrica referenced by `fabricaId`
  - Used to select the "primary" Fabrica when multiple relationships exist
  - Updated automatically with `fabricaId`

- **`cancionId`** (string | null)
  - Reflects the Cancion ID from the `VERSIONA` relationship
  - Updated automatically when `VERSIONA` relationships are created/deleted
  - If multiple Canciones, stores the first one found
  - Set to `null` if no `VERSIONA` relationships exist

#### Cancion

- **`autorIds`** (string[] | null)
  - Reflects all Artista IDs from `AUTOR_DE` relationships
  - Array of author IDs in no particular order
  - Updated automatically when `AUTOR_DE` relationships are created/deleted
  - Set to `null` or empty array if no `AUTOR_DE` relationships exist

**API Behavior**:

When **creating** or **updating** entities via POST/PUT/PATCH:

- You **MAY** provide redundant properties in the payload
- If provided, the system will **auto-create** corresponding relationships (if they don't exist)
- If relationships already exist, they take precedence over the provided redundant properties
- After creation/update, the system validates and auto-fixes any discrepancies

Example - Creating a Jingle with redundant properties:

```json
POST /api/admin/jingle
{
  "title": "My Jingle",
  "fabricaId": "DBbyI99TtIM",
  "cancionId": "c5d6e7f8"
}
```

→ System auto-creates `APPEARS_IN` relationship to Fabrica `DBbyI99TtIM`
→ System auto-creates `VERSIONA` relationship to Cancion `c5d6e7f8`
→ Both redundant properties are stored on the Jingle node

**Validation**:

- Use `POST /api/admin/validate/:entityType/:entityId` to check consistency
- System reports any `redundant_field_mismatch` issues
- Use `POST /api/admin/validate/:entityType/:entityId/fix?issueType=redundant_field_mismatch` to auto-fix
- Fixes are applied automatically after CRUD operations

### APPEARS_IN Order Management

The `APPEARS_IN` relationship (Jingle → Fabrica) includes special properties for managing the sequence of Jingles within a Fabrica:

**Properties**:

- **`timestamp`** (string): HH:MM:SS format (e.g., "00:02:50")
  - Represents when the Jingle appears in the video
  - Used as the basis for calculating `order`
  - Defaults to "00:00:00" if not provided
- **`order`** (number): Sequential integer (1, 2, 3, ...)
  - **READ-ONLY, system-managed**
  - Automatically calculated based on `timestamp` sorting
  - Recalculated whenever `APPEARS_IN` relationships are created, updated, or deleted
  - Provides a stable, sequential ordering even when timestamps are not perfectly sequential

**Auto-Calculation Behavior**:

1. **On relationship creation** (POST `/api/admin/relationships/APPEARS_IN`):

   - If `timestamp` is omitted, defaults to "00:00:00"
   - System immediately recalculates all `order` values for that Fabrica
   - Orders are assigned sequentially based on timestamp sort (ascending)

2. **On relationship update** (PUT `/api/admin/relationships/APPEARS_IN`):

   - If `timestamp` is changed, system recalculates all `order` values
   - If `timestamp` is unchanged, `order` remains stable
   - **Note**: Do NOT attempt to set `order` manually - it will be ignored

3. **On relationship deletion** (DELETE `/api/admin/relationships/APPEARS_IN`):
   - System recalculates `order` for remaining Jingles in that Fabrica
   - Orders are re-sequenced to fill gaps (e.g., 1, 3, 4 becomes 1, 2, 3)

**Timestamp Conflict Handling**:

- If multiple Jingles have the **same timestamp** in a Fabrica, system logs a warning
- Orders are still assigned sequentially, but the specific ordering is undefined
- **Best practice**: Ensure unique timestamps or offset by 1 second

**Example Workflow**:

```json
# Step 1: Create first APPEARS_IN
POST /api/admin/relationships/APPEARS_IN
{ "start": "j1a2b3c4", "end": "DBbyI99TtIM", "timestamp": "00:05:30" }
→ order = 1

# Step 2: Create second APPEARS_IN with earlier timestamp
POST /api/admin/relationships/APPEARS_IN
{ "start": "j5e6f7g8", "end": "DBbyI99TtIM", "timestamp": "00:02:15" }
→ order = 1 (j5e6f7g8)
→ order = 2 (j1a2b3c4) [recalculated]

# Step 3: Update timestamp of first Jingle
PUT /api/admin/relationships/APPEARS_IN
{ "start": "j1a2b3c4", "end": "DBbyI99TtIM", "timestamp": "00:01:00" }
→ order = 1 (j1a2b3c4) [recalculated]
→ order = 2 (j5e6f7g8) [recalculated]

# Step 4: Delete a Jingle
DELETE /api/admin/relationships/APPEARS_IN
{ "start": "j5e6f7g8", "end": "DBbyI99TtIM" }
→ order = 1 (j1a2b3c4) [recalculated, no gap]
```

**Querying**:

- Use `GET /api/public/fabricas/:id/jingles` to get Jingles ordered by `order` property
- Each Jingle includes both `timestamp` and `order` in the response
- `order` provides a stable sort key even if timestamps are edited

### Schema

- GET `/api/admin/schema`
- POST `/api/admin/schema/properties`
  - Body: `{ entityType, propertyName, propertyType? }`
- POST `/api/admin/schema/relationships`
  - Body: `{ relType, startLabel, endLabel }`
- GET `/api/admin/schema/constraints`
- POST `/api/admin/schema/constraints`
  - Body: `{ constraintName, constraintType, entityType, propertyName }`
- DELETE `/api/admin/schema/constraints/:name`

### Relationships (CRUD)

- GET `/api/admin/relationships`
- GET `/api/admin/relationships/:relType`
- POST `/api/admin/relationships/:relType`
  - Body: `{ start, end, ...properties }`
- DELETE `/api/admin/relationships/:relType`
  - Body: `{ start, end }`

### Entities (CRUD)

- GET `/api/admin/:type`
- GET `/api/admin/:type/:id`
- POST `/api/admin/:type`
  - Body: entity properties; `id` optional (auto-generated if missing)
- PUT `/api/admin/:type/:id`
  - Body: full update
- PATCH `/api/admin/:type/:id`
  - Body: partial update
- DELETE `/api/admin/:type/:id`

## Errors

- Standard error shape:

```json
{ "error": "Message", "code": "OPTIONAL_CODE", "details": {} }
```

- HTTP status reflects error type. Unknown errors return 500.

## Notes

- All endpoints may add fields over time; clients should ignore unknown fields.
- Public endpoints are read-only. Admin endpoints require authentication (MVP: basic protection).
- **Timestamp Format**: Timestamps are provided in two formats:
  - `timestamp`: Always in seconds (numeric) for easy comparison and calculation
  - `timestampFormatted`: Human-readable HH:MM:SS format (string) for display
  - The backend handles both formats internally and normalizes them in responses
- **Video Player Integration**: The Fabrica endpoints are designed to support synchronized video playback with Jingle metadata display. Use `/fabricas/:id/jingles` to build the timeline, and `/fabricas/:id/jingle-at-time` to sync with current playback position.
