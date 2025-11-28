# API Contracts Overview

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-27
- **Version**: 1.0

## Overview

This document provides an overview of all API contracts in the Jinglero system. The APIs are organized into three main categories: Public API (read-only), Admin API (full CRUD), and Search API (global search).

## APIs Documented

| API        | Status                 | Base Path     | Authentication | Documentation                              |
| ---------- | ---------------------- | ------------- | -------------- | ------------------------------------------ |
| Public API | current_implementation | `/api/public` | None           | [public-api.md](./contracts/public-api.md) |
| Admin API  | current_implementation | `/api/admin`  | JWT Required   | [admin-api.md](./contracts/admin-api.md)   |
| Search API | current_implementation | `/api/search` | None           | [search-api.md](./contracts/search-api.md) |

## Endpoint Summary

### Public API Endpoints

**Schema & Health:**

- `GET /api/public/schema` - Schema introspection
- `GET /api/public/health` - Health check

**Statistics:**

- `GET /api/public/volumetrics` - Entity counts and derived statistics

**Direct Entity Endpoints:**

- `GET /api/public/usuarios` - List Usuarios
- `GET /api/public/usuarios/:id` - Get Usuario
- `GET /api/public/artistas` - List Artistas
- `GET /api/public/artistas/:id` - Get Artista
- `GET /api/public/canciones` - List Canciones
- `GET /api/public/canciones/:id` - Get Cancion
- `GET /api/public/fabricas` - List Fabricas
- `GET /api/public/fabricas/latest` - Get latest Fabrica
- `GET /api/public/fabricas/:id` - Get Fabrica
- `GET /api/public/fabricas/:id/jingles` - Get Jingles for Fabrica
- `GET /api/public/fabricas/:id/jingle-at-time` - Get Jingle at timestamp
- `GET /api/public/tematicas` - List Tematicas
- `GET /api/public/tematicas/:id` - Get Tematica
- `GET /api/public/jingles` - List Jingles
- `GET /api/public/jingles/:id` - Get Jingle with relationships

**Generic Entity Endpoints:**

- `GET /api/public/entities/:type` - List entities by type
- `GET /api/public/entities/:type/:id` - Get entity by type and ID
- `GET /api/public/entities/:type/:id/relationships` - Get entity relationships

**Related Entities:**

- `GET /api/public/entities/jingles/:id/related` - Related Jingles
- `GET /api/public/entities/canciones/:id/related` - Related Canciones
- `GET /api/public/entities/artistas/:id/related` - Related Artistas
- `GET /api/public/entities/tematicas/:id/related` - Related Tematicas

**Relationships:**

- `GET /api/public/relationships/:type` - List relationships by type

**Search:**

- `GET /api/public/search` - Simple global search

**Total: 28 endpoints**

### Admin API Endpoints

**Authentication:**

- `POST /api/admin/login` - Authenticate and get JWT token
- `POST /api/admin/logout` - Logout (client-side token removal)
- `GET /api/admin/status` - Check authentication status

**Entities (CRUD):**

- `GET /api/admin/:type` - List entities
- `GET /api/admin/:type/:id` - Get entity
- `POST /api/admin/:type` - Create entity
- `PUT /api/admin/:type/:id` - Update entity (full)
- `PATCH /api/admin/:type/:id` - Update entity (partial)
- `DELETE /api/admin/:type/:id` - Delete entity

**Relationships:**

- `GET /api/admin/relationships` - List relationship types
- `GET /api/admin/relationships/:relType` - List relationships by type
- `POST /api/admin/relationships/:relType` - Create relationship
- `PUT /api/admin/relationships/:relType` - Update relationship
- `DELETE /api/admin/relationships/:relType` - Delete relationship

**Schema Management:**

- `GET /api/admin/schema` - Get schema information
- `POST /api/admin/schema/properties` - Add property to entity type
- `POST /api/admin/schema/relationships` - Create relationship type
- `GET /api/admin/schema/constraints` - List constraints
- `POST /api/admin/schema/constraints` - Create constraint
- `DELETE /api/admin/schema/constraints/:name` - Delete constraint

**Validation:**

- `GET /api/admin/validate/entity/:type/:id` - Get validation results
- `POST /api/admin/validate/entity/:type/:id` - Validate entity
- `POST /api/admin/validate/entity/:type` - Validate all entities of type
- `POST /api/admin/validate/relationship/:relType` - Validate relationship
- `POST /api/admin/validate/fix` - Fix validation issue

**Total: 23 endpoints**

### Search API Endpoints

**Search:**

- `GET /api/search` - Global search with filtering and pagination

**Total: 1 endpoint**

## Entity Types

All APIs support the following entity types:

- **usuarios** (Usuario) - User accounts
- **artistas** (Artista) - Musical artists
- **canciones** (Cancion) - Songs/compositions
- **fabricas** (Fabrica) - Streams/broadcasts
- **tematicas** (Tematica) - Thematic categories
- **jingles** (Jingle) - Clips/segments

## Relationship Types

All APIs support the following relationship types:

- **autor_de** (AUTOR_DE) - Artista → Cancion (authorship)
- **jinglero_de** (JINGLERO_DE) - Artista → Jingle (performance)
- **appears_in** (APPEARS_IN) - Jingle → Fabrica (appearance)
- **tagged_with** (TAGGED_WITH) - Jingle → Tematica (tagging)
- **versiona** (VERSIONA) - Jingle → Cancion (versioning)
- **reacciona_a** (REACCIONA_A) - Usuario → Jingle (reactions)
- **soy_yo** (SOY_YO) - Usuario → Artista (identity claim)
- **repeats** (REPEATS) - Jingle → Jingle (repeat relationship)

## Versioning

### Current Version

- **Version**: 1.0
- **Date**: 2025-11-19

### Versioning Strategy

Currently, no explicit versioning is implemented. All APIs use base paths without version numbers:

- Public API: `/api/public`
- Admin API: `/api/admin`
- Search API: `/api/search`

Future versions may use URL-based versioning (e.g., `/api/v1/public`) or header-based versioning.

### Backward Compatibility

All endpoints maintain backward compatibility. Breaking changes will be communicated through versioning.

## Authentication

### Public API & Search API

- **Authentication**: None required
- **Access**: Public read-only access

### Admin API

- **Authentication**: JWT token required (except `/login`, `/logout`, `/status`)
- **Token Format**: Bearer token in `Authorization` header
- **Token Expiration**: 7 days
- **Login Endpoint**: `POST /api/admin/login`

## Data Formats

### Request Format

- **Content-Type**: `application/json`
- **Encoding**: UTF-8

### Response Format

- **Content-Type**: `application/json`
- **Date/Time**: ISO 8601 strings (e.g., `2025-01-01T00:00:00.000Z`)
- **Timestamps**: Integers (seconds) or formatted as HH:MM:SS

### Error Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (optional)",
  "code": "ERROR_CODE (optional)"
}
```

## Validation

### Entity Validation

Entity input is validated using Zod schemas:

- **Fabrica**: Requires `id` (YouTube video ID), `title`, `date`
- **Jingle**: All fields optional
- **Cancion**: Requires `title`
- **Artista**: Requires at least one of `name` or `stageName`
- **Tematica**: Requires `name`, `description`
- **Usuario**: Requires `email`, `displayName`, `role`

**Code Reference**: `backend/src/server/utils/entityValidation.ts`

### Relationship Validation

- `start` and `end` entity IDs are required
- Relationship must not already exist (for creation)
- APPEARS_IN `order` property is system-managed (ignored if provided)

### Business Logic Validation

- Redundant properties are automatically synced with relationships
- APPEARS_IN order is automatically calculated from timestamp
- Entity status defaults to `DRAFT` for Jingle, Cancion, Artista, Tematica

## Auto-Sync Behavior

The Admin API automatically maintains data consistency:

### Redundant Properties

- **APPEARS_IN**: Syncs `jingle.fabricaId` and `jingle.fabricaDate`
- **VERSIONA**: Syncs `jingle.cancionId`
- **AUTOR_DE**: Syncs `cancion.autorIds[]`

### Relationship Creation

When creating/updating entities with redundant properties, relationships are automatically created:

- Jingle with `fabricaId` → creates APPEARS_IN
- Jingle with `cancionId` → creates VERSIONA
- Cancion with `autorIds[]` → creates AUTOR_DE relationships

### Order Management

APPEARS_IN relationships have an `order` property that is system-managed:

- Calculated from `timestamp` (ascending sort)
- Sequential order: 1, 2, 3, ...
- Auto-recalculated on create/update/delete

## Related Documentation

- **System Architecture**: `docs/3_system_architecture/`
- **Database Schema**: `docs/4_backend_database-schema/`
- **API Contracts**: `docs/5_backend_api-contracts/contracts/`
- **Playbooks**: `docs/5_backend_api-contracts/playbooks/`

## Change History

- **2025-11-27**: Implemented volumetrics endpoint in Public API
  - Implemented GET /api/public/volumetrics endpoint with 8 fields (fabricas, jingles, canciones, usuarios, tematicas, artistas, jingleros, proveedores)
  - Migrated VolumetricIndicators component to use volumetrics endpoint
  - Migrated Admin Dashboard to use volumetrics endpoint
  - Updated documentation with implementation details
- **2025-11-27**: Added volumetrics endpoint to Public API
  - Documented GET /api/public/volumetrics endpoint
  - Updated Public API endpoint count to 28
- **2025-11-19**: Initial baseline documentation created
  - Documented Public API (27 endpoints)
  - Documented Admin API (23 endpoints)
  - Documented Search API (1 endpoint)
  - Created API Contracts Overview

---

**Last Updated:** 2025-11-27
