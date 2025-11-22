# API Contract: Public API

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: not yet validated
- **Version**: 1.0
- **Code Reference**: `backend/src/server/api/public.ts:1-1143`

## Overview

The Public API provides read-only access to all entities and relationships in the system. It is designed for public-facing frontend components and does not require authentication. All endpoints return data in JSON format with Neo4j DateTime objects converted to ISO 8601 strings.

**Base Path**: `/api/public`

**Architecture Reference**: See `docs/3_system_architecture/data-flow.md` for data flow patterns.

**Database Schema Reference**: See `docs/4_backend_database-schema/schema/` for entity and relationship definitions.

## Endpoints

### Schema Introspection

#### GET /api/public/schema

**Method**: GET  
**Path**: `/api/public/schema`  
**Code Reference**: `backend/src/server/api/public.ts:108-115`

**Description**: Returns schema information including node labels, relationship types, and constraints.

**Query Parameters**: None

**Success Response (200)**

```json
{
  "nodeLabels": ["Usuario", "Jingle", "Artista", "Cancion", "Fabrica", "Tematica"],
  "relationshipTypes": ["APPEARS_IN", "JINGLERO_DE", "AUTOR_DE", "VERSIONA", "TAGGED_WITH", "SOY_YO", "REACCIONA_A", "REPEATS"],
  "constraints": [...],
  "indexes": [...]
}
```

**Error Responses**

- **500**: Internal Server Error - Database connection or query error

**Example Request**

```bash
curl -X GET /api/public/schema
```

---

### Direct Entity Endpoints

#### GET /api/public/usuarios

**Method**: GET  
**Path**: `/api/public/usuarios`  
**Code Reference**: `backend/src/server/api/public.ts:118-135`

**Description**: List all Usuario entities with pagination.

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50, max: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "id": "u1a2b3c4",
    "email": "user@example.com",
    "role": "GUEST",
    "displayName": "User Name",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **500**: Internal Server Error - Database query error

---

#### GET /api/public/usuarios/:id

**Method**: GET  
**Path**: `/api/public/usuarios/:id`  
**Code Reference**: `backend/src/server/api/public.ts:137-151`

**Path Parameters**

- `id` (required): Usuario ID (format: `u{8-chars}`)

**Success Response (200)**

```json
{
  "id": "u1a2b3c4",
  "email": "user@example.com",
  "role": "GUEST",
  "displayName": "User Name",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404**: Not Found - Usuario not found
- **500**: Internal Server Error - Database query error

---

#### GET /api/public/artistas

**Method**: GET  
**Path**: `/api/public/artistas`  
**Code Reference**: `backend/src/server/api/public.ts:153-170`

**Description**: List all Artista entities with pagination.

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50, max: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "id": "a1b2c3d4",
    "name": "Artist Name",
    "stageName": "Stage Name",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **500**: Internal Server Error - Database query error

---

#### GET /api/public/artistas/:id

**Method**: GET  
**Path**: `/api/public/artistas/:id`  
**Code Reference**: `backend/src/server/api/public.ts:172-186`

**Path Parameters**

- `id` (required): Artista ID (format: `a{8-chars}`)

**Success Response (200)**

```json
{
  "id": "a1b2c3d4",
  "name": "Artist Name",
  "stageName": "Stage Name",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404**: Not Found - Artista not found
- **500**: Internal Server Error - Database query error

---

#### GET /api/public/canciones

**Method**: GET  
**Path**: `/api/public/canciones`  
**Code Reference**: `backend/src/server/api/public.ts:188-205`

**Description**: List all Cancion entities with pagination.

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50, max: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "id": "c1d2e3f4",
    "title": "Song Title",
    "album": "Album Name",
    "year": 2020,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **500**: Internal Server Error - Database query error

---

#### GET /api/public/canciones/:id

**Method**: GET  
**Path**: `/api/public/canciones/:id`  
**Code Reference**: `backend/src/server/api/public.ts:207-221`

**Path Parameters**

- `id` (required): Cancion ID (format: `c{8-chars}`)

**Success Response (200)**

```json
{
  "id": "c1d2e3f4",
  "title": "Song Title",
  "album": "Album Name",
  "year": 2020,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404**: Not Found - Cancion not found
- **500**: Internal Server Error - Database query error

---

#### GET /api/public/fabricas

**Method**: GET  
**Path**: `/api/public/fabricas`  
**Code Reference**: `backend/src/server/api/public.ts:223-240`

**Description**: List all Fabrica entities with pagination.

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50, max: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "id": "0hmxZPp0xq0",
    "title": "Fabrica Title",
    "date": "2025-01-01T00:00:00.000Z",
    "youtubeUrl": "https://youtube.com/watch?v=0hmxZPp0xq0",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **500**: Internal Server Error - Database query error

---

#### GET /api/public/fabricas/latest

**Method**: GET  
**Path**: `/api/public/fabricas/latest`  
**Code Reference**: `backend/src/server/api/public.ts:243-270`

**Description**: Get the latest Fabrica by date property.

**Query Parameters**: None

**Success Response (200)**

```json
{
  "id": "0hmxZPp0xq0",
  "title": "Fabrica Title",
  "date": "2025-01-01T00:00:00.000Z",
  "youtubeUrl": "https://youtube.com/watch?v=0hmxZPp0xq0",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404**: Not Found - No Fabricas found
- **500**: Internal Server Error - Database query error

---

#### GET /api/public/fabricas/:id

**Method**: GET  
**Path**: `/api/public/fabricas/:id`  
**Code Reference**: `backend/src/server/api/public.ts:272-286`

**Path Parameters**

- `id` (required): Fabrica ID (YouTube video ID, 11 characters)

**Success Response (200)**

```json
{
  "id": "0hmxZPp0xq0",
  "title": "Fabrica Title",
  "date": "2025-01-01T00:00:00.000Z",
  "youtubeUrl": "https://youtube.com/watch?v=0hmxZPp0xq0",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404**: Not Found - Fabrica not found
- **500**: Internal Server Error - Database query error

---

#### GET /api/public/fabricas/:id/jingles

**Method**: GET  
**Path**: `/api/public/fabricas/:id/jingles`  
**Code Reference**: `backend/src/server/api/public.ts:289-358`

**Description**: Get all Jingles that appear in a specific Fabrica, ordered by timestamp and order.

**Path Parameters**

- `id` (required): Fabrica ID (YouTube video ID, 11 characters)

**Success Response (200)**

```json
[
  {
    "id": "j1a2b3c4",
    "title": "Jingle Title",
    "timestamp": 120,
    "timestampFormatted": "00:02:00",
    "order": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **400**: Bad Request - Invalid Fabrica ID
- **404**: Not Found - Fabrica not found
- **500**: Internal Server Error - Database query error

**Special Notes**

- Returns empty array if Fabrica has no Jingles
- Timestamps are returned as integers (seconds) and also formatted as HH:MM:SS
- Results are ordered by `order` (ascending), then `timestamp` (ascending)

---

#### GET /api/public/fabricas/:id/jingle-at-time

**Method**: GET  
**Path**: `/api/public/fabricas/:id/jingle-at-time`  
**Code Reference**: `backend/src/server/api/public.ts:361-495`

**Description**: Get the active Jingle at a specific timestamp for a Fabrica.

**Path Parameters**

- `id` (required): Fabrica ID (YouTube video ID, 11 characters)

**Query Parameters**

- `timestamp` (required): Timestamp in seconds (number, 0 or greater)

**Success Response (200)**

```json
{
  "id": "j1a2b3c4",
  "title": "Jingle Title",
  "timestamp": 120,
  "timestampFormatted": "00:02:00",
  "order": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **400**: Bad Request - Missing or invalid timestamp parameter
- **404**: Not Found - Fabrica not found, or no Jingle found at timestamp
- **500**: Internal Server Error - Database query error

**Special Notes**

- Returns the last Jingle that started at or before the requested timestamp
- If timestamp is before the first Jingle, returns 404 with details about the first Jingle timestamp

---

#### GET /api/public/tematicas

**Method**: GET  
**Path**: `/api/public/tematicas`  
**Code Reference**: `backend/src/server/api/public.ts:497-514`

**Description**: List all Tematica entities with pagination.

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50, max: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "id": "t1a2b3c4",
    "name": "Tematica Name",
    "category": "CULTURA",
    "description": "Description",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **500**: Internal Server Error - Database query error

---

#### GET /api/public/tematicas/:id

**Method**: GET  
**Path**: `/api/public/tematicas/:id`  
**Code Reference**: `backend/src/server/api/public.ts:516-530`

**Path Parameters**

- `id` (required): Tematica ID (format: `t{8-chars}`)

**Success Response (200)**

```json
{
  "id": "t1a2b3c4",
  "name": "Tematica Name",
  "category": "CULTURA",
  "description": "Description",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404**: Not Found - Tematica not found
- **500**: Internal Server Error - Database query error

---

#### GET /api/public/jingles

**Method**: GET  
**Path**: `/api/public/jingles`  
**Code Reference**: `backend/src/server/api/public.ts:532-549`

**Description**: List all Jingle entities with pagination.

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50, max: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "id": "j1a2b3c4",
    "title": "Jingle Title",
    "songTitle": "Song Title",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **500**: Internal Server Error - Database query error

---

#### GET /api/public/jingles/:id

**Method**: GET  
**Path**: `/api/public/jingles/:id`  
**Code Reference**: `backend/src/server/api/public.ts:551-625`

**Description**: Get a single Jingle with all its relationships (Fabrica, Cancion, Jingleros, Autores, Tematicas).

**Path Parameters**

- `id` (required): Jingle ID (format: `j{8-chars}`)

**Success Response (200)**

```json
{
  "id": "j1a2b3c4",
  "title": "Jingle Title",
  "songTitle": "Song Title",
  "fabrica": {
    "id": "0hmxZPp0xq0",
    "title": "Fabrica Title",
    "timestamp": 120,
    "order": 1
  },
  "cancion": {
    "id": "c1d2e3f4",
    "title": "Song Title"
  },
  "jingleros": [
    {
      "id": "a1b2c3d4",
      "name": "Artist Name"
    }
  ],
  "autores": [
    {
      "id": "a1b2c3d4",
      "name": "Artist Name"
    }
  ],
  "tematicas": [
    {
      "id": "t1a2b3c4,
      "name": "Tematica Name",
      "isPrimary": true
    }
  ],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **404**: Not Found - Jingle not found
- **500**: Internal Server Error - Database query error

**Special Notes**

- Returns comprehensive relationship data including:
  - Fabrica with APPEARS_IN relationship properties (timestamp, order)
  - Cancion from VERSIONA relationship
  - Jingleros (Artistas) from JINGLERO_DE relationships
  - Autores (Artistas) from AUTOR_DE relationships on Cancion
  - Tematicas from TAGGED_WITH relationships with isPrimary flag

---

### Generic Entity Endpoints

#### GET /api/public/entities/:type

**Method**: GET  
**Path**: `/api/public/entities/:type`  
**Code Reference**: `backend/src/server/api/public.ts:628-667`

**Description**: Generic endpoint to list entities of any type with pagination.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "id": "j1a2b3c4",
    "title": "Jingle Title",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **400**: Bad Request - Invalid entity type
- **500**: Internal Server Error - Database query error

**Validation Rules**

- Valid entity types: `usuarios`, `artistas`, `canciones`, `fabricas`, `tematicas`, `jingles`

---

#### GET /api/public/entities/:type/:id

**Method**: GET  
**Path**: `/api/public/entities/:type/:id`  
**Code Reference**: `backend/src/server/api/public.ts:669-704`

**Description**: Generic endpoint to get a single entity by type and ID.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
- `id` (required): Entity ID

**Success Response (200)**

```json
{
  "id": "j1a2b3c4",
  "title": "Jingle Title",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **400**: Bad Request - Invalid entity type
- **404**: Not Found - Entity not found
- **500**: Internal Server Error - Database query error

**Validation Rules**

- Valid entity types: `usuarios`, `artistas`, `canciones`, `fabricas`, `tematicas`, `jingles`

---

#### GET /api/public/entities/:type/:id/relationships

**Method**: GET  
**Path**: `/api/public/entities/:type/:id/relationships`  
**Code Reference**: `backend/src/server/api/public.ts:746-801`

**Description**: Get all relationships for a specific entity (both outgoing and incoming).

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
- `id` (required): Entity ID

**Success Response (200)**

```json
{
  "outgoing": [
    {
      "type": "APPEARS_IN",
      "direction": "outgoing",
      "target": { "id": "0hmxZPp0xq0", "title": "Fabrica Title" },
      "properties": { "timestamp": 120, "order": 1 }
    }
  ],
  "incoming": [
    {
      "type": "JINGLERO_DE",
      "direction": "incoming",
      "source": { "id": "a1b2c3d4", "name": "Artist Name" },
      "properties": {}
    }
  ]
}
```

**Error Responses**

- **400**: Bad Request - Invalid entity type
- **404**: Not Found - Entity not found
- **500**: Internal Server Error - Database query error

**Validation Rules**

- Valid entity types: `usuarios`, `artistas`, `canciones`, `fabricas`, `tematicas`, `jingles`

---

### Related Entities Endpoints

#### GET /api/public/entities/jingles/:id/related

**Method**: GET  
**Path**: `/api/public/entities/jingles/:id/related`  
**Code Reference**: `backend/src/server/api/public.ts:804-871`

**Description**: Get related Jingles by jinglero, cancion, or tematica.

**Path Parameters**

- `id` (required): Jingle ID

**Query Parameters**

- `types` (optional): Comma-separated list of relationship types to include (sameJinglero, sameCancion, sameTematica). If not provided, all types are included.
- `limit` (optional): Number of results per type (default: 10, min: 1, max: 100)

**Success Response (200)**

```json
{
  "sameJinglero": [
    {
      "id": "j2b3c4d5",
      "title": "Related Jingle",
      "songTitle": "Song Title",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "sameCancion": [
    {
      "id": "j3c4d5e6",
      "title": "Related Jingle",
      "songTitle": "Song Title",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "sameTematica": [
    {
      "jingle": {
        "id": "j4d5e6f7",
        "title": "Related Jingle",
        "songTitle": "Song Title",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      },
      "sharedTematicas": ["Tematica Name"]
    }
  ],
  "meta": {
    "limit": 10,
    "types": ["sameJinglero", "sameCancion", "sameTematica"]
  }
}
```

**Error Responses**

- **500**: Internal Server Error - Database query error

**Special Notes**

- `sameJinglero`: Jingles performed by the same Artista(s)
- `sameCancion`: Jingles that version the same Cancion
- `sameTematica`: Jingles tagged with the same Tematica(s), includes sharedTematicas array

---

#### GET /api/public/entities/canciones/:id/related

**Method**: GET  
**Path**: `/api/public/entities/canciones/:id/related`  
**Code Reference**: `backend/src/server/api/public.ts:874-958`

**Description**: Get related entities for a Cancion (Jingles using the Cancion, other Canciones by the same Autor, Jingles by Autor if they are also Jingleros).

**Path Parameters**

- `id` (required): Cancion ID

**Query Parameters**

- `limit` (optional): Number of results per type (default: 10, min: 1, max: 100)

**Success Response (200)**

```json
{
  "jinglesUsingCancion": [
    {
      "id": "j1a2b3c4",
      "title": "Jingle Title",
      "songTitle": "Song Title",
      "fabrica": {
        "id": "0hmxZPp0xq0",
        "title": "Fabrica Title"
      },
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "otherCancionesByAutor": [
    {
      "id": "c2d3e4f5",
      "title": "Other Song",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "jinglesByAutorIfJinglero": [
    {
      "id": "j5e6f7g8",
      "title": "Jingle by Autor",
      "songTitle": "Song Title",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "limit": 10
  }
}
```

**Error Responses**

- **500**: Internal Server Error - Database query error

**Special Notes**

- `jinglesUsingCancion`: All Jingles that version this Cancion, includes Fabrica data
- `otherCancionesByAutor`: Other Canciones authored by the same Artistas
- `jinglesByAutorIfJinglero`: Jingles performed by Artistas who also authored this Cancion

---

#### GET /api/public/entities/artistas/:id/related

**Method**: GET  
**Path**: `/api/public/entities/artistas/:id/related`  
**Code Reference**: `backend/src/server/api/public.ts:961-1041`

**Description**: Get related entities for an Artista (Canciones authored, Jingles performed as Jinglero).

**Path Parameters**

- `id` (required): Artista ID

**Query Parameters**

- `limit` (optional): Number of results per type (default: 10, min: 1, max: 100)

**Success Response (200)**

```json
{
  "cancionesByAutor": [
    {
      "id": "c1d2e3f4",
      "title": "Song Title",
      "album": "Album Name",
      "year": 2020,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "jinglesByJinglero": [
    {
      "id": "j1a2b3c4",
      "title": "Jingle Title",
      "songTitle": "Song Title",
      "fabrica": {
        "id": "0hmxZPp0xq0",
        "title": "Fabrica Title"
      },
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "limit": 10
  }
}
```

**Error Responses**

- **500**: Internal Server Error - Database query error

**Special Notes**

- `cancionesByAutor`: Canciones authored by this Artista via AUTOR_DE relationships
- `jinglesByJinglero`: Jingles performed by this Artista via JINGLERO_DE relationships, includes Fabrica data

---

#### GET /api/public/entities/tematicas/:id/related

**Method**: GET  
**Path**: `/api/public/entities/tematicas/:id/related`  
**Code Reference**: `backend/src/server/api/public.ts:1044-1084`

**Description**: Get all Jingles tagged with a specific Tematica.

**Path Parameters**

- `id` (required): Tematica ID

**Query Parameters**

- `limit` (optional): Number of results (default: 50, min: 1, max: 200)

**Success Response (200)**

```json
{
  "jingles": [
    {
      "id": "j1a2b3c4",
      "title": "Jingle Title",
      "songTitle": "Song Title",
      "fabrica": {
        "id": "0hmxZPp0xq0",
        "title": "Fabrica Title"
      },
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "limit": 50
  }
}
```

**Error Responses**

- **500**: Internal Server Error - Database query error

**Special Notes**

- Returns all Jingles tagged with this Tematica via TAGGED_WITH relationships
- Includes Fabrica data for each Jingle

---

### Relationship Endpoints

#### GET /api/public/relationships/:type

**Method**: GET  
**Path**: `/api/public/relationships/:type`  
**Code Reference**: `backend/src/server/api/public.ts:707-743`

**Description**: List relationships of a specific type with pagination.

**Path Parameters**

- `type` (required): Relationship type (autor_de, jinglero_de, appears_in, tagged_with, versiona, reacciona_a, soy_yo, repeats)

**Query Parameters**

- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200)**

```json
[
  {
    "timestamp": 120,
    "order": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**

- **400**: Bad Request - Invalid relationship type
- **500**: Internal Server Error - Database query error

**Validation Rules**

- Valid relationship types: `autor_de`, `jinglero_de`, `appears_in`, `tagged_with`, `versiona`, `reacciona_a`, `soy_yo`, `repeats`
- Maps to Neo4j relationship types: `AUTOR_DE`, `JINGLERO_DE`, `APPEARS_IN`, `TAGGED_WITH`, `VERSIONA`, `REACCIONA_A`, `SOY_YO`, `REPEATS`

---

### Search Endpoint

#### GET /api/public/search

**Method**: GET  
**Path**: `/api/public/search`  
**Code Reference**: `backend/src/server/api/public.ts:1087-1137`

**Description**: Simple global search across Jingles, Canciones, Artistas, and Tematicas.

**Query Parameters**

- `q` (required): Search query string

**Success Response (200)**

```json
{
  "jingles": [
    {
      "id": "j1a2b3c4",
      "title": "Jingle Title",
      "timestamp": 120,
      "songTitle": "Song Title"
    }
  ],
  "canciones": [
    {
      "id": "c1d2e3f4",
      "title": "Song Title"
    }
  ],
  "artistas": [
    {
      "id": "a1b2c3d4",
      "stageName": "Stage Name"
    }
  ],
  "tematicas": [
    {
      "id": "t1a2b3c4",
      "name": "Tematica Name"
    }
  ]
}
```

**Error Responses**

- **500**: Internal Server Error - Database query error

**Special Notes**

- Returns empty arrays if query is empty
- Case-insensitive contains search
- Limited to 10 results per entity type
- Searches:
  - Jingles: title, songTitle
  - Canciones: title
  - Artistas: stageName, name
  - Tematicas: name

---

### Health Check

#### GET /api/public/health

**Method**: GET  
**Path**: `/api/public/health`  
**Code Reference**: `backend/src/server/api/public.ts:1139-1141`

**Description**: Health check endpoint.

**Query Parameters**: None

**Success Response (200)**

```json
{
  "status": "ok",
  "timestamp": "2025-11-19T12:00:00.000Z"
}
```

**Error Responses**: None

---

## Request/Response Formats

### Date/Time Format

All datetime values are returned as ISO 8601 strings (e.g., `2025-01-01T00:00:00.000Z`). Neo4j DateTime objects are automatically converted using the `convertNeo4jDates` helper function.

**Code Reference**: `backend/src/server/api/public.ts:10-74`

### Timestamp Format

Timestamps in APPEARS_IN relationships are stored as integers (seconds) and can be formatted as HH:MM:SS strings using the `formatSecondsToTimestamp` helper function.

**Code Reference**: `backend/src/server/api/public.ts:76-87`

### Entity ID Format

Entity IDs follow specific formats:

- **Usuario**: `u{8-chars}` (e.g., `u1a2b3c4`)
- **Artista**: `a{8-chars}` (e.g., `a1b2c3d4`)
- **Cancion**: `c{8-chars}` (e.g., `c1d2e3f4`)
- **Jingle**: `j{8-chars}` (e.g., `j1a2b3c4`)
- **Tematica**: `t{8-chars}` (e.g., `t1a2b3c4`)
- **Fabrica**: YouTube video ID (11 characters, e.g., `0hmxZPp0xq0`)

**Code Reference**: `docs/4_backend_database-schema/schema/properties.md:218-238`

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (optional)",
  "code": "ERROR_CODE (optional)"
}
```

**Code Reference**: `backend/src/server/middleware/errorHandler.ts`

---

## Validation Rules

### Path Parameter Validation

- Entity type must be one of: `usuarios`, `artistas`, `canciones`, `fabricas`, `tematicas`, `jingles`
- Relationship type must be one of: `autor_de`, `jinglero_de`, `appears_in`, `tagged_with`, `versiona`, `reacciona_a`, `soy_yo`
- Entity IDs must match their format (see Entity ID Format above)

### Query Parameter Validation

- `limit`: Must be a positive integer (default: 50, max varies by endpoint)
- `offset`: Must be a non-negative integer (default: 0)
- `timestamp`: Must be a valid number >= 0 (for jingle-at-time endpoint)

### Data Validation

- All entity data is validated against database schema constraints
- Required fields are enforced at the database level
- Unique constraints are enforced at the database level

**Code Reference**: `docs/4_backend_database-schema/schema/` for detailed validation rules

---

## Versioning

### Current Version

- **Version**: 1.0
- **Base Path**: `/api/public`

### Versioning Strategy

Currently, no explicit versioning is implemented. The API uses the `/api/public` base path. Future versions may use URL-based versioning (e.g., `/api/v1/public`) or header-based versioning.

### Backward Compatibility

All endpoints maintain backward compatibility. Breaking changes will be communicated through versioning.

### Version History

| Version | Date       | Changes                      |
| ------- | ---------- | ---------------------------- |
| 1.0     | 2025-11-19 | Initial baseline documentation |

---

## Related Documentation

- **System Architecture**: `docs/3_system_architecture/data-flow.md`
- **Database Schema**: `docs/4_backend_database-schema/schema/`
- **Admin API Contract**: `docs/5_backend_api-contracts/contracts/admin-api.md`
- **Search API Contract**: `docs/5_backend_api-contracts/contracts/search-api.md`

---

## Change History

- **2025-11-19**: Initial baseline documentation created from code analysis


