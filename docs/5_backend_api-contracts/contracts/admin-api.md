# API Contract: Admin API

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: not yet validated
- **Version**: 1.0
- **Code Reference**: `backend/src/server/api/admin.ts:1-1315`

## Overview

The Admin API provides full CRUD operations for entities and relationships, schema management, and validation endpoints. All endpoints except authentication endpoints require JWT authentication. The API automatically manages redundant properties, relationship ordering, and data consistency.

**Base Path**: `/api/admin`

**Authentication**: JWT token required (except `/login`, `/logout`, `/status`)

**Architecture Reference**: See `docs/3_system_architecture/data-flow.md` for data flow patterns.

**Database Schema Reference**: See `docs/4_backend_database-schema/schema/` for entity and relationship definitions.

## Authentication

### POST /api/admin/login

**Method**: POST  
**Path**: `/api/admin/login`  
**Code Reference**: `backend/src/server/api/admin.ts:180-211`

**Description**: Authenticate admin user with password and receive JWT token.

**Request Body**

```json
{
  "password": "admin_password"
}
```

**Success Response (200)**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

**Error Responses**

- **400**: Bad Request - Password is required
- **401**: Unauthorized - Password incorrect or authentication not configured

**Validation Rules**

- Password must be provided as a string
- Password is compared against `ADMIN_PASSWORD` environment variable
- JWT token expires in 7 days

---

### POST /api/admin/logout

**Method**: POST  
**Path**: `/api/admin/logout`  
**Code Reference**: `backend/src/server/api/admin.ts:219-223`

**Description**: Logout endpoint (client-side token removal for JWT).

**Request Body**: None

**Success Response (200)**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Special Notes**

- For JWT-based auth, logout is handled client-side by removing the token
- This endpoint exists for consistency and future session-based auth

---

### GET /api/admin/status

**Method**: GET  
**Path**: `/api/admin/status`  
**Code Reference**: `backend/src/server/api/admin.ts:230-236`

**Description**: Check current authentication status (optional auth).

**Query Parameters**: None

**Success Response (200)**

```json
{
  "authenticated": true
}
```

**Special Notes**

- Uses optional authentication - does not require token
- Returns `authenticated: false` if no valid token provided

---

## Entity Endpoints

### GET /api/admin/:type

**Method**: GET  
**Path**: `/api/admin/:type`  
**Code Reference**: `backend/src/server/api/admin.ts:1098-1111`

**Description**: List all entities of a specific type.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)

**Query Parameters**: None

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

- **401**: Unauthorized - Authentication required
- **404**: Not Found - Unknown entity type
- **500**: Internal Server Error - Database query error

**Validation Rules**

- Valid entity types: `usuarios`, `artistas`, `canciones`, `fabricas`, `tematicas`, `jingles`

---

### GET /api/admin/:type/:id

**Method**: GET  
**Path**: `/api/admin/:type/:id`  
**Code Reference**: `backend/src/server/api/admin.ts:1113-1128`

**Description**: Get a single entity by type and ID.

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

- **401**: Unauthorized - Authentication required
- **404**: Not Found - Entity not found or unknown entity type
- **500**: Internal Server Error - Database query error

---

### POST /api/admin/:type

**Method**: POST  
**Path**: `/api/admin/:type`  
**Code Reference**: `backend/src/server/api/admin.ts:1130-1195`

**Description**: Create a new entity.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)

**Request Body**

```json
{
  "id": "j1a2b3c4",
  "title": "Jingle Title",
  "fabricaId": "0hmxZPp0xq0",
  "cancionId": "c1d2e3f4"
}
```

**Success Response (201)**

```json
{
  "id": "j1a2b3c4",
  "title": "Jingle Title",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **400**: Bad Request - Validation failed
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Unknown entity type
- **409**: Conflict - Entity with ID already exists
- **500**: Internal Server Error - Database error

**Validation Rules**

- Entity input validated using Zod schemas
- ID is auto-generated if not provided (except Fabricas which use YouTube video ID)
- `createdAt` and `updatedAt` are automatically set to current timestamp
- Default `status` is set to `DRAFT` for Jingle, Cancion, Artista, Tematica
- Redundant properties are automatically synced with relationships:
  - Jingle: `fabricaId` → creates APPEARS_IN, `cancionId` → creates VERSIONA
  - Cancion: `autorIds[]` → creates AUTOR_DE relationships

**Code Reference**: `backend/src/server/utils/entityValidation.ts` for validation schemas

**Special Notes**

- Fabricas use YouTube video ID as ID (external identifier)
- Redundant properties trigger automatic relationship creation
- Validation issues are auto-fixed after creation

---

### PUT /api/admin/:type/:id

**Method**: PUT  
**Path**: `/api/admin/:type/:id`  
**Code Reference**: `backend/src/server/api/admin.ts:1197-1248`

**Description**: Update an entity (full replacement).

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
- `id` (required): Entity ID

**Request Body**

```json
{
  "title": "Updated Jingle Title",
  "fabricaId": "0hmxZPp0xq0",
  "cancionId": "c1d2e3f4"
}
```

**Success Response (200)**

```json
{
  "id": "j1a2b3c4",
  "title": "Updated Jingle Title",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-11-19T12:00:00.000Z"
}
```

**Error Responses**

- **400**: Bad Request - Validation failed
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Entity not found or unknown entity type
- **500**: Internal Server Error - Database error

**Validation Rules**

- Entity input validated using Zod schemas
- `createdAt` cannot be updated (preserved from original)
- `updatedAt` is automatically set to current timestamp
- Redundant properties are automatically synced with relationships

**Special Notes**

- Full replacement - all properties are updated
- Redundant properties trigger automatic relationship updates
- Validation issues are auto-fixed after update

---

### PATCH /api/admin/:type/:id

**Method**: PATCH  
**Path**: `/api/admin/:type/:id`  
**Code Reference**: `backend/src/server/api/admin.ts:1250-1295`

**Description**: Partially update an entity.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
- `id` (required): Entity ID

**Request Body**

```json
{
  "title": "Updated Jingle Title"
}
```

**Success Response (200)**

```json
{
  "id": "j1a2b3c4",
  "title": "Updated Jingle Title",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-11-19T12:00:00.000Z"
}
```

**Error Responses**

- **400**: Bad Request - Validation failed
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Entity not found or unknown entity type
- **500**: Internal Server Error - Database error

**Special Notes**

- Partial update - only provided properties are updated
- Existing properties are merged with new properties
- `createdAt` cannot be updated (preserved from original)
- `updatedAt` is automatically set to current timestamp
- Redundant properties trigger automatic relationship updates

---

### DELETE /api/admin/:type/:id

**Method**: DELETE  
**Path**: `/api/admin/:type/:id`  
**Code Reference**: `backend/src/server/api/admin.ts:1297-1313`

**Description**: Delete an entity and all its relationships.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
- `id` (required): Entity ID

**Request Body**: None

**Success Response (200)**

```json
{
  "message": "Entity deleted successfully"
}
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **404**: Not Found - Entity not found or unknown entity type
- **500**: Internal Server Error - Database error

**Special Notes**

- Uses `DETACH DELETE` to remove entity and all relationships
- Redundant properties on related entities are automatically updated

---

## Relationship Endpoints

### GET /api/admin/relationships

**Method**: GET  
**Path**: `/api/admin/relationships`  
**Code Reference**: `backend/src/server/api/admin.ts:782-789`

**Description**: List all relationship types in the system.

**Query Parameters**: None

**Success Response (200)**

```json
[
  "APPEARS_IN",
  "JINGLERO_DE",
  "AUTOR_DE",
  "VERSIONA",
  "TAGGED_WITH",
  "REACCIONA_A",
  "SOY_YO"
]
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database query error

---

### GET /api/admin/relationships/:relType

**Method**: GET  
**Path**: `/api/admin/relationships/:relType`  
**Code Reference**: `backend/src/server/api/admin.ts:792-805`

**Description**: List all relationships of a specific type.

**Path Parameters**

- `relType` (required): Relationship type (autor_de, jinglero_de, appears_in, tagged_with, versiona, reacciona_a, soy_yo)

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

- **401**: Unauthorized - Authentication required
- **404**: Not Found - Unknown relationship type
- **500**: Internal Server Error - Database query error

**Validation Rules**

- Valid relationship types: `autor_de`, `jinglero_de`, `appears_in`, `tagged_with`, `versiona`, `reacciona_a`, `soy_yo`

---

### POST /api/admin/relationships/:relType

**Method**: POST  
**Path**: `/api/admin/relationships/:relType`  
**Code Reference**: `backend/src/server/api/admin.ts:808-889`

**Description**: Create a new relationship.

**Path Parameters**

- `relType` (required): Relationship type (autor_de, jinglero_de, appears_in, tagged_with, versiona, reacciona_a, soy_yo)

**Request Body**

```json
{
  "start": "j1a2b3c4",
  "end": "0hmxZPp0xq0",
  "timestamp": 120,
  "status": "DRAFT"
}
```

**Success Response (201)**

```json
{
  "timestamp": 120,
  "order": 1,
  "status": "DRAFT",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **400**: Bad Request - Missing start/end IDs or invalid timestamp
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Unknown relationship type
- **409**: Conflict - Relationship already exists
- **500**: Internal Server Error - Database error

**Validation Rules**

- `start` and `end` entity IDs are required
- For APPEARS_IN:
  - `timestamp` can be number (seconds) or string (HH:MM:SS format)
  - `order` property is ignored (system-managed, auto-calculated)
  - Timestamp defaults to 0 if not provided
  - Timestamp range: 0 to 86400 seconds (24 hours)
- Relationship must not already exist

**Special Notes**

- APPEARS_IN relationships automatically update `order` property based on timestamp
- Redundant properties are automatically updated:
  - APPEARS_IN: Updates `jingle.fabricaId` and `jingle.fabricaDate`
  - VERSIONA: Updates `jingle.cancionId`
  - AUTOR_DE: Updates `cancion.autorIds[]`
- Order is recalculated for all APPEARS_IN relationships of the Fabrica

---

### PUT /api/admin/relationships/:relType

**Method**: PUT  
**Path**: `/api/admin/relationships/:relType`  
**Code Reference**: `backend/src/server/api/admin.ts:892-969`

**Description**: Update relationship properties.

**Path Parameters**

- `relType` (required): Relationship type (autor_de, jinglero_de, appears_in, tagged_with, versiona, reacciona_a, soy_yo)

**Request Body**

```json
{
  "start": "j1a2b3c4",
  "end": "0hmxZPp0xq0",
  "timestamp": 240,
  "status": "CONFIRMED"
}
```

**Success Response (200)**

```json
{
  "timestamp": 240,
  "order": 2,
  "status": "CONFIRMED",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**

- **400**: Bad Request - Missing start/end IDs or invalid timestamp
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Relationship not found or unknown relationship type
- **500**: Internal Server Error - Database error

**Validation Rules**

- `start` and `end` entity IDs are required
- For APPEARS_IN:
  - `order` property is ignored (system-managed, auto-calculated)
  - Timestamp can be number (seconds) or string (HH:MM:SS format)
  - Timestamp range: 0 to 86400 seconds (24 hours)

**Special Notes**

- APPEARS_IN relationships automatically update `order` property when timestamp changes
- Order is recalculated for all APPEARS_IN relationships of the Fabrica

---

### DELETE /api/admin/relationships/:relType

**Method**: DELETE  
**Path**: `/api/admin/relationships/:relType`  
**Code Reference**: `backend/src/server/api/admin.ts:972-1014`

**Description**: Delete a relationship.

**Path Parameters**

- `relType` (required): Relationship type (autor_de, jinglero_de, appears_in, tagged_with, versiona, reacciona_a, soy_yo)

**Request Body**

```json
{
  "start": "j1a2b3c4",
  "end": "0hmxZPp0xq0"
}
```

**Success Response (200)**

```json
{
  "message": "Relationship deleted successfully"
}
```

**Error Responses**

- **400**: Bad Request - Missing start/end IDs
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Relationship not found or unknown relationship type
- **500**: Internal Server Error - Database error

**Validation Rules**

- `start` and `end` entity IDs are required

**Special Notes**

- Redundant properties are automatically updated:
  - APPEARS_IN deletion: Updates `jingle.fabricaId` and `jingle.fabricaDate` (or clears if no other relationships)
  - VERSIONA deletion: Clears `jingle.cancionId` (or updates if other relationships exist)
  - AUTOR_DE deletion: Removes from `cancion.autorIds[]`
- Order is recalculated for remaining APPEARS_IN relationships of the Fabrica

---

## Schema Management Endpoints

### GET /api/admin/schema

**Method**: GET  
**Path**: `/api/admin/schema`  
**Code Reference**: `backend/src/server/api/admin.ts:738-741`

**Description**: Get schema information (same as Public API schema endpoint).

**Query Parameters**: None

**Success Response (200)**

```json
{
  "nodeLabels": ["Usuario", "Jingle", "Artista", "Cancion", "Fabrica", "Tematica"],
  "relationshipTypes": ["APPEARS_IN", "JINGLERO_DE", "AUTOR_DE", "VERSIONA", "TAGGED_WITH", "SOY_YO", "REACCIONA_A"],
  "constraints": [...],
  "indexes": [...]
}
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database query error

---

### POST /api/admin/schema/properties

**Method**: POST  
**Path**: `/api/admin/schema/properties`  
**Code Reference**: `backend/src/server/api/admin.ts:743-750`

**Description**: Add a property to an entity type.

**Request Body**

```json
{
  "entityType": "Jingle",
  "propertyName": "newProperty",
  "propertyType": "string"
}
```

**Success Response (200)**

```json
{
  "message": "Property newProperty added to Jingle"
}
```

**Error Responses**

- **400**: Bad Request - Missing required fields
- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database error

**Validation Rules**

- `entityType`, `propertyName` are required
- `propertyType` is optional

---

### POST /api/admin/schema/relationships

**Method**: POST  
**Path**: `/api/admin/schema/relationships`  
**Code Reference**: `backend/src/server/api/admin.ts:752-759`

**Description**: Create a new relationship type.

**Request Body**

```json
{
  "relType": "NEW_RELATIONSHIP",
  "startLabel": "Jingle",
  "endLabel": "Artista"
}
```

**Success Response (200)**

```json
{
  "message": "Relationship type NEW_RELATIONSHIP created between Jingle and Artista"
}
```

**Error Responses**

- **400**: Bad Request - Missing required fields
- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database error

**Validation Rules**

- `relType`, `startLabel`, `endLabel` are required

---

### GET /api/admin/schema/constraints

**Method**: GET  
**Path**: `/api/admin/schema/constraints`  
**Code Reference**: `backend/src/server/api/admin.ts:761-764`

**Description**: List all database constraints.

**Query Parameters**: None

**Success Response (200)**

```json
[
  {
    "name": "id_Jingle_uniq",
    "type": "UNIQUENESS",
    "entityType": "Jingle",
    "propertyName": "id"
  }
]
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database query error

---

### POST /api/admin/schema/constraints

**Method**: POST  
**Path**: `/api/admin/schema/constraints`  
**Code Reference**: `backend/src/server/api/admin.ts:766-773`

**Description**: Create a new database constraint.

**Request Body**

```json
{
  "constraintName": "new_constraint",
  "constraintType": "UNIQUENESS",
  "entityType": "Jingle",
  "propertyName": "title"
}
```

**Success Response (200)**

```json
{
  "message": "Constraint new_constraint created"
}
```

**Error Responses**

- **400**: Bad Request - Missing required fields
- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database error

**Validation Rules**

- `constraintName`, `constraintType`, `entityType`, `propertyName` are required

---

### DELETE /api/admin/schema/constraints/:name

**Method**: DELETE  
**Path**: `/api/admin/schema/constraints/:name`  
**Code Reference**: `backend/src/server/api/admin.ts:775-779`

**Description**: Delete a database constraint.

**Path Parameters**

- `name` (required): Constraint name

**Success Response (200)**

```json
{
  "message": "Constraint new_constraint dropped"
}
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database error

---

## Validation Endpoints

### GET /api/admin/validate/entity/:type/:id

**Method**: GET  
**Path**: `/api/admin/validate/entity/:type/:id`  
**Code Reference**: `backend/src/server/api/admin.ts:1034-1038`

**Description**: Get validation results for a specific entity.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
- `id` (required): Entity ID

**Success Response (200)**

```json
{
  "isValid": true,
  "issues": [],
  "entityType": "jingles",
  "entityId": "j1a2b3c4"
}
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database query error

**Special Notes**

- Same as POST endpoint, provided for convenience

---

### POST /api/admin/validate/entity/:type/:id

**Method**: POST  
**Path**: `/api/admin/validate/entity/:type/:id`  
**Code Reference**: `backend/src/server/api/admin.ts:1024-1028`

**Description**: Validate a specific entity for all validation issues.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)
- `id` (required): Entity ID

**Success Response (200)**

```json
{
  "isValid": false,
  "issues": [
    {
      "type": "redundant_field_mismatch",
      "message": "Jingle.fabricaId does not match APPEARS_IN relationship",
      "fixable": true,
      "entityType": "jingles",
      "entityId": "j1a2b3c4"
    }
  ],
  "entityType": "jingles",
  "entityId": "j1a2b3c4"
}
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database query error

**Code Reference**: `backend/src/server/utils/validation.ts` for validation logic

---

### POST /api/admin/validate/entity/:type

**Method**: POST  
**Path**: `/api/admin/validate/entity/:type`  
**Code Reference**: `backend/src/server/api/admin.ts:1044-1054`

**Description**: Validate all entities of a specific type.

**Path Parameters**

- `type` (required): Entity type (usuarios, artistas, canciones, fabricas, tematicas, jingles)

**Success Response (200)**

```json
{
  "entityType": "jingles",
  "results": [
    {
      "isValid": true,
      "issues": [],
      "entityId": "j1a2b3c4"
    }
  ],
  "totalEntities": 100,
  "entitiesWithIssues": 5,
  "totalIssues": 8
}
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database query error

---

### POST /api/admin/validate/relationship/:relType

**Method**: POST  
**Path**: `/api/admin/validate/relationship/:relType`  
**Code Reference**: `backend/src/server/api/admin.ts:1061-1071`

**Description**: Validate a specific relationship.

**Path Parameters**

- `relType` (required): Relationship type (autor_de, jinglero_de, appears_in, tagged_with, versiona, reacciona_a, soy_yo)

**Request Body**

```json
{
  "start": "j1a2b3c4",
  "end": "0hmxZPp0xq0"
}
```

**Success Response (200)**

```json
{
  "isValid": true,
  "issues": [],
  "relType": "appears_in",
  "startId": "j1a2b3c4",
  "endId": "0hmxZPp0xq0"
}
```

**Error Responses**

- **400**: Bad Request - Missing start/end IDs
- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database query error

**Validation Rules**

- `start` and `end` entity IDs are required

---

### POST /api/admin/validate/fix

**Method**: POST  
**Path**: `/api/admin/validate/fix`  
**Code Reference**: `backend/src/server/api/admin.ts:1078-1095`

**Description**: Fix a validation issue.

**Request Body**

```json
{
  "issue": {
    "type": "redundant_field_mismatch",
    "message": "Jingle.fabricaId does not match APPEARS_IN relationship",
    "fixable": true,
    "entityType": "jingles",
    "entityId": "j1a2b3c4"
  }
}
```

**Success Response (200)**

```json
{
  "success": true,
  "message": "Issue fixed successfully",
  "issue": {
    "type": "redundant_field_mismatch",
    "message": "Jingle.fabricaId does not match APPEARS_IN relationship",
    "fixable": true,
    "entityType": "jingles",
    "entityId": "j1a2b3c4"
  }
}
```

**Error Responses**

- **400**: Bad Request - Issue not provided or not fixable
- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Database error

**Validation Rules**

- `issue` is required
- Issue must be fixable (`fixable: true`)

---

## Request/Response Formats

### Authentication

JWT tokens are returned in the response body and should be included in subsequent requests via the `Authorization` header:

```
Authorization: Bearer <token>
```

**Code Reference**: `backend/src/server/middleware/auth.ts`

### Date/Time Format

All datetime values are returned as ISO 8601 strings (e.g., `2025-01-01T00:00:00.000Z`). Neo4j DateTime objects are automatically converted.

**Code Reference**: `backend/src/server/api/admin.ts:28-59`

### Timestamp Format

Timestamps in APPEARS_IN relationships:
- Stored as integers (seconds) in the database
- Can be provided as number (seconds) or string (HH:MM:SS format)
- Automatically converted to seconds if provided as string

**Code Reference**: `backend/src/server/api/admin.ts:247-255`

### Entity ID Format

Entity IDs follow specific formats (see Public API contract for details). IDs are auto-generated if not provided, except for Fabricas which use YouTube video IDs.

**Code Reference**: `backend/src/server/api/admin.ts:93-169`

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE (optional)"
}
```

**Code Reference**: `backend/src/server/api/core.ts` for error classes

---

## Validation Rules

### Entity Validation

Entity input is validated using Zod schemas before creation/update:

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
- For APPEARS_IN:
  - `timestamp` must be number (0-86400) or string (HH:MM:SS)
  - `order` is ignored (system-managed)

### Business Logic Validation

- Redundant properties are automatically synced with relationships
- APPEARS_IN order is automatically calculated from timestamp
- Entity status defaults to `DRAFT` for Jingle, Cancion, Artista, Tematica
- `createdAt` and `updatedAt` are automatically managed

---

## Auto-Sync Behavior

### Redundant Properties

The API automatically maintains redundant properties when relationships change:

**APPEARS_IN**:
- Create: Sets `jingle.fabricaId` and `jingle.fabricaDate`
- Delete: Updates or clears `jingle.fabricaId` and `jingle.fabricaDate`

**VERSIONA**:
- Create: Sets `jingle.cancionId`
- Delete: Clears or updates `jingle.cancionId`

**AUTOR_DE**:
- Create: Adds to `cancion.autorIds[]`
- Delete: Removes from `cancion.autorIds[]`

**Code Reference**: `backend/src/server/api/admin.ts:376-535`

### Relationship Creation from Properties

When creating/updating entities with redundant properties, relationships are automatically created:

- Jingle with `fabricaId` → creates APPEARS_IN relationship
- Jingle with `cancionId` → creates VERSIONA relationship
- Cancion with `autorIds[]` → creates AUTOR_DE relationships

**Code Reference**: `backend/src/server/api/admin.ts:541-735`

### Order Management

APPEARS_IN relationships have an `order` property that is system-managed:
- Calculated from `timestamp` (ascending sort)
- Sequential order: 1, 2, 3, ...
- Auto-recalculated on create/update/delete
- User cannot manually set (ignored with warning)

**Code Reference**: `backend/src/server/api/admin.ts:264-363`

---

## Versioning

### Current Version

- **Version**: 1.0
- **Base Path**: `/api/admin`

### Versioning Strategy

Currently, no explicit versioning is implemented. The API uses the `/api/admin` base path. Future versions may use URL-based versioning (e.g., `/api/v1/admin`) or header-based versioning.

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
- **Public API Contract**: `docs/5_backend_api-contracts/contracts/public-api.md`
- **Search API Contract**: `docs/5_backend_api-contracts/contracts/search-api.md`

---

## Change History

- **2025-11-19**: Initial baseline documentation created from code analysis


