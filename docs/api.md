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
