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
