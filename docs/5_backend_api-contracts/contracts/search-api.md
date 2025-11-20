# API Contract: Search API

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: not yet validated
- **Version**: 1.0
- **Code Reference**: `backend/src/server/api/search.ts:1-265`

## Overview

The Search API provides global search functionality across multiple entity types (Jingles, Canciones, Artistas, Tematicas, Fabricas). It supports both basic (case-insensitive contains) and fulltext search modes, with filtering by entity type and pagination.

**Base Path**: `/api/search`

**Architecture Reference**: See `docs/3_system_architecture/data-flow.md` for data flow patterns.

**Database Schema Reference**: See `docs/4_backend_database-schema/schema/` for entity and relationship definitions.

## Endpoints

### GET /api/search

**Method**: GET  
**Path**: `/api/search`  
**Code Reference**: `backend/src/server/api/search.ts:76-263`

**Description**: Global search across multiple entity types with filtering and pagination.

**Query Parameters**

- `q` (required): Search query string
- `types` (optional): Comma-separated list of entity types to search (jingles, canciones, artistas, tematicas, fabricas). If not provided, all types are searched.
- `limit` (optional): Number of results per type (default: 10, min: 1, max: 100)
- `offset` (optional): Number of results to skip per type (default: 0, min: 0)
- `mode` (optional): Search mode - `basic` (default) or `fulltext`
- `excludeWithRelationship` (optional): Filter out entities with specific relationships. For Jingles: `appears_in` or `versiona`

**Success Response (200)**

**Basic Mode:**

```json
{
  "jingles": [
    {
      "id": "j1a2b3c4",
      "title": "Jingle Title",
      "timestamp": 120,
      "songTitle": "Song Title",
      "type": "jingle"
    }
  ],
  "canciones": [
    {
      "id": "c1d2e3f4",
      "title": "Song Title",
      "type": "cancion"
    }
  ],
  "artistas": [
    {
      "id": "a1b2c3d4",
      "stageName": "Stage Name",
      "name": "Artist Name",
      "type": "artista"
    }
  ],
  "tematicas": [
    {
      "id": "t1a2b3c4",
      "name": "Tematica Name",
      "type": "tematica"
    }
  ],
  "fabricas": [
    {
      "id": "0hmxZPp0xq0",
      "title": "Fabrica Title",
      "date": "2025-01-01T00:00:00.000Z",
      "type": "fabrica"
    }
  ],
  "meta": {
    "limit": 10,
    "offset": 0,
    "types": ["jingles", "canciones", "artistas", "tematicas", "fabricas"],
    "mode": "basic"
  }
}
```

**Fulltext Mode:**

```json
{
  "jingles": [
    {
      "id": "j1a2b3c4",
      "title": "Jingle Title",
      "timestamp": 120,
      "songTitle": "Song Title",
      "score": 0.95,
      "type": "jingle"
    }
  ],
  "canciones": [
    {
      "id": "c1d2e3f4",
      "title": "Song Title",
      "score": 0.87,
      "type": "cancion"
    }
  ],
  "artistas": [
    {
      "id": "a1b2c3d4",
      "stageName": "Stage Name",
      "name": "Artist Name",
      "score": 0.92,
      "type": "artista"
    }
  ],
  "tematicas": [
    {
      "id": "t1a2b3c4",
      "name": "Tematica Name",
      "score": 0.89,
      "type": "tematica"
    }
  ],
  "fabricas": [],
  "meta": {
    "limit": 10,
    "offset": 0,
    "types": ["jingles", "canciones", "artistas", "tematicas", "fabricas"],
    "mode": "fulltext"
  }
}
```

**Error Responses**

- **400**: Bad Request - Invalid types parameter
- **500**: Internal Server Error - Database query error

**Validation Rules**

- `q` is required (returns empty arrays if not provided or empty)
- Valid types: `jingles`, `canciones`, `artistas`, `tematicas`, `fabricas`
- `limit` must be between 1 and 100 (default: 10)
- `offset` must be >= 0 (default: 0)
- `mode` must be `basic` or `fulltext` (default: `basic`)
- `excludeWithRelationship` valid values: `appears_in`, `versiona` (for Jingles only)

**Search Behavior**

**Basic Mode (default):**

- Case-insensitive contains search
- Searches:
  - Jingles: `title`, `songTitle`
  - Canciones: `title`, and Artista names via AUTOR_DE relationships
  - Artistas: `stageName`, `name` (excludes "None" values)
  - Tematicas: `name`
  - Fabricas: `title`
- Results ordered alphabetically by primary field

**Fulltext Mode:**

- Uses Neo4j fulltext indexes
- Returns relevance scores
- Searches:
  - Jingles: Fulltext index on `title`, `songTitle`, `artistName`, `comment`
  - Canciones: Fulltext index on `title`
  - Artistas: Fulltext index on `stageName`, `name`
  - Tematicas: Fulltext index on `name`, `description`
  - Fabricas: Not supported (falls back to basic mode)
- Results ordered by relevance score (descending)
- Falls back to basic mode if fulltext index is unavailable

**Filtering**

**By Type:**

- `types` parameter filters which entity types to search
- Example: `?types=jingles,canciones` searches only Jingles and Canciones

**By Relationship (Jingles only):**

- `excludeWithRelationship=appears_in`: Returns only Jingles without APPEARS_IN relationship (`fabricaId IS NULL`)
- `excludeWithRelationship=versiona`: Returns only Jingles without VERSIONA relationship (`cancionId IS NULL`)

**Code Reference**: `backend/src/server/api/search.ts:76-263`

**Example Requests**

```bash
# Basic search across all types
curl -X GET "/api/search?q=artist"

# Search only Jingles and Canciones
curl -X GET "/api/search?q=song&types=jingles,canciones"

# Fulltext search with pagination
curl -X GET "/api/search?q=title&mode=fulltext&limit=20&offset=0"

# Search Jingles without Fabrica relationship
curl -X GET "/api/search?q=jingle&types=jingles&excludeWithRelationship=appears_in"
```

---

## Request/Response Formats

### Date/Time Format

All datetime values are returned as ISO 8601 strings (e.g., `2025-01-01T00:00:00.000Z`). Neo4j DateTime objects are automatically converted.

**Code Reference**: `backend/src/server/api/search.ts:10-71`

### Search Result Format

Each result includes:

- Entity properties (id, title, etc.)
- `type` field indicating entity type (`jingle`, `cancion`, `artista`, `tematica`, `fabrica`)
- `score` field (fulltext mode only) indicating relevance score (0.0 to 1.0)

### Meta Information

Response includes `meta` object with:

- `limit`: Results per type limit
- `offset`: Results offset
- `types`: Entity types that were searched
- `mode`: Search mode used (`basic` or `fulltext`)

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message"
}
```

**Code Reference**: `backend/src/server/middleware/errorHandler.ts`

---

## Validation Rules

### Query Parameter Validation

- `q`: Required string (empty string returns empty results)
- `types`: Optional comma-separated list, must be valid entity types
- `limit`: Optional integer, 1-100 (default: 10)
- `offset`: Optional integer, >= 0 (default: 0)
- `mode`: Optional string, `basic` or `fulltext` (default: `basic`)
- `excludeWithRelationship`: Optional string, `appears_in` or `versiona` (Jingles only)

### Entity Type Validation

Valid entity types:

- `jingles`
- `canciones`
- `artistas`
- `tematicas`
- `fabricas`

Invalid types return 400 Bad Request error.

---

## Fulltext Search Indexes

The Search API uses Neo4j fulltext indexes for improved search performance:

- **jingle_search**: Index on Jingle `title`, `songTitle`, `artistName`, `comment`
- **cancion_search**: Index on Cancion `title`
- **artista_search**: Index on Artista `stageName`, `name`
- **tematica_search**: Index on Tematica `name`, `description`

**Code Reference**: `docs/4_backend_database-schema/schema/nodes.md` for index definitions

**Note**: If fulltext indexes are not available, the API automatically falls back to basic mode.

---

## Versioning

### Current Version

- **Version**: 1.0
- **Base Path**: `/api/search`

### Versioning Strategy

Currently, no explicit versioning is implemented. The API uses the `/api/search` base path. Future versions may use URL-based versioning (e.g., `/api/v1/search`) or header-based versioning.

### Backward Compatibility

All endpoints maintain backward compatibility. Breaking changes will be communicated through versioning.

### Version History

| Version | Date       | Changes                        |
| ------- | ---------- | ------------------------------ |
| 1.0     | 2025-11-19 | Initial baseline documentation |

---

## Related Documentation

- **System Architecture**: `docs/3_system_architecture/data-flow.md`
- **Database Schema**: `docs/4_backend_database-schema/schema/`
- **Public API Contract**: `docs/5_backend_api-contracts/contracts/public-api.md`
- **Admin API Contract**: `docs/5_backend_api-contracts/contracts/admin-api.md`

---

## Change History

- **2025-11-19**: Initial baseline documentation created from code analysis

