# Schema: Properties

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-23
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:1-261`

## Overview

This document provides comprehensive property specifications for all nodes and relationships in the Neo4j knowledge graph. It includes property types, constraints, redundant properties, and auto-sync behavior.

---

## Node Properties

### Usuario Properties

| Property | Type | Required | Unique | Default | Description |
|----------|------|----------|--------|---------|-------------|
| id | string | Yes | Yes | Auto-generated | Unique identifier (format: `u{8-chars}`) |
| email | string | Yes | Yes | None | User's email address |
| role | string (enum) | Yes | No | GUEST | Role: ADMIN or GUEST |
| artistId | string | No | No | None | Redundant: ID of related Artista from SOY_YO |
| displayName | string | Yes | No | None | User's display name |
| profilePictureUrl | string | No | No | None | URL to profile picture |
| twitterHandle | string | No | Yes* | None | Twitter/X handle (*unique if provided) |
| instagramHandle | string | No | Yes* | None | Instagram handle (*unique if provided) |
| facebookProfile | string | No | Yes* | None | Facebook profile URL (*unique if provided) |
| youtubeHandle | string | No | Yes* | None | YouTube handle (*unique if provided) |
| contributionsCount | number | Yes | No | 0 | Count of user contributions |
| createdAt | datetime | Yes | No | Current | Account creation timestamp |
| lastLogin | datetime | No | No | None | Last login timestamp |
| updatedAt | datetime | Yes | No | Current | Last update timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:83-96`

### Jingle Properties

| Property | Type | Required | Unique | Default | Description |
|----------|------|----------|--------|---------|-------------|
| id | string | Yes | Yes | Auto-generated | Unique identifier (format: `j{8-chars}`) |
| youtubeUrl | string | Yes | No | None | YouTube URL for the jingle clip |
| timestamp | number | No | No | None | Redundant: Timestamp from APPEARS_IN |
| youtubeClipUrl | string | No | No | None | URL for clips on YouTube |
| title | string | No | No | None | Optional title for the jingle |
| comment | string | No | No | None | Optional comment or description |
| lyrics | string | No | No | None | Optional lyrics |
| songTitle | string | No | No | None | Redundant: Inherited from Cancion via VERSIONA |
| artistName | string | No | No | None | Redundant: Inherited from Cancion's Artista |
| genre | string | No | No | None | Redundant: Inherited from Cancion |
| isJinglazo | boolean | No | No | false | Indicates special highlight |
| isJinglazoDelDia | boolean | No | No | false | Indicates jingle of the day |
| isPrecario | boolean | No | No | false | Indicates low quality/temporary |
| fabricaId | string | No | No | None | Redundant: ID of Fabrica from APPEARS_IN |
| fabricaDate | datetime | No | No | None | Redundant: Date from APPEARS_IN->Fabrica.date |
| cancionId | string | No | No | None | Redundant: ID of Cancion from VERSIONA |
| isLive | boolean | No | No | false | Indicates live performance |
| isRepeat | boolean | No | No | false | Indicates song performed before |
| status | string (enum) | No | No | DRAFT | Status: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED |
| createdAt | datetime | Yes | No | Current | Creation timestamp |
| updatedAt | datetime | Yes | No | Current | Last update timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:103-123`

### Artista Properties

| Property | Type | Required | Unique | Default | Description |
|----------|------|----------|--------|---------|-------------|
| id | string | Yes | Yes | Auto-generated | Unique identifier (format: `a{8-chars}`) |
| name | string | Yes* | Yes | None | Artist's real/primary name (*at least one of name or stageName) |
| stageName | string | No* | No | None | Artist's stage name (*at least one of name or stageName) |
| idUsuario | string | No | No | None | Redundant: ID of Usuario from SOY_YO |
| nationality | string | No | No | None | Artist's nationality |
| isArg | boolean | No | No | Auto-calc | Auto-managed: true if nationality === 'Argentina' |
| youtubeHandle | string | No | No | None | YouTube handle |
| instagramHandle | string | No | No | None | Instagram handle |
| twitterHandle | string | No | No | None | Twitter/X handle |
| facebookProfile | string | No | No | None | Facebook profile URL |
| website | string | No | No | None | Website URL |
| bio | string | No | No | None | Biography or description |
| musicBrainzId | string | No | No | None | MusicBrainz ID for linking to external MusicBrainz database |
| status | string (enum) | No | No | DRAFT | Status: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED |
| createdAt | datetime | Yes | No | Current | Creation timestamp |
| updatedAt | datetime | Yes | No | Current | Last update timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:129-143`

### Cancion Properties

| Property | Type | Required | Unique | Default | Description |
|----------|------|----------|--------|---------|-------------|
| id | string | Yes | Yes | Auto-generated | Unique identifier (format: `c{8-chars}`) |
| title | string | Yes | No | None | Song title |
| album | string | No | No | None | Album name |
| year | number | No | No | None | Release/recording year |
| genre | string | No | No | None | Musical genre |
| youtubeMusic | string | No | No | None | YouTube Music URL |
| lyrics | string | No | No | None | URL to retrieve lyrics |
| autorIds | string[] | No | No | None | Redundant: Array of Artista IDs from AUTOR_DE |
| musicBrainzId | string | No | No | None | MusicBrainz ID for linking to external MusicBrainz database |
| status | string (enum) | No | No | DRAFT | Status: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED |
| createdAt | datetime | Yes | No | Current | Creation timestamp |
| updatedAt | datetime | Yes | No | Current | Last update timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:149-159`

### Fabrica Properties

| Property | Type | Required | Unique | Default | Description |
|----------|------|----------|--------|---------|-------------|
| id | string | Yes | Yes | YouTube ID | YouTube video ID (11 chars, external identifier) |
| title | string | Yes | No | None | Title of the Fabrica/stream |
| date | datetime | Yes | No | None | Broadcast date |
| youtubeUrl | string | Yes | No | None | Full YouTube URL |
| visualizations | number | Yes | No | 0 | Number of views on YouTube |
| likes | number | Yes | No | 0 | Number of likes on YouTube |
| description | string | Yes | No | None | Description from YouTube |
| contents | string | Yes | No | None | Contents from YouTube video comment |
| status | string (enum) | Yes | No | DRAFT | Status: DRAFT, PROCESSING, COMPLETED |
| createdAt | datetime | Yes | No | Current | Creation timestamp |
| updatedAt | datetime | Yes | No | Current | Last update timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:165-175`

### Tematica Properties

| Property | Type | Required | Unique | Default | Description |
|----------|------|----------|--------|---------|-------------|
| id | string | Yes | Yes | Auto-generated | Unique identifier (format: `t{8-chars}`) |
| name | string | Yes | Yes | None | Name of the thematic category |
| category | string (enum) | No | No | None | Category: ACTUALIDAD, POLITICA, CULTURA, GENTE, GELATINA |
| description | string | Yes | No | None | Description of the category |
| status | string (enum) | No | No | DRAFT | Status: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED |
| createdAt | datetime | Yes | No | Current | Creation timestamp |
| updatedAt | datetime | Yes | No | Current | Last update timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:181-187`

---

## Relationship Properties

### APPEARS_IN Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| order | number | Yes (system) | Auto-calc | READ-ONLY: Sequential order calculated from timestamp |
| timestamp | number | No | 0 | Timestamp in seconds (used to calculate order) |
| status | string (enum) | No | DRAFT | Status: DRAFT, CONFIRMED |
| createdAt | datetime | Yes | Current | Creation timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:196-199`

### JINGLERO_DE Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| status | string (enum) | No | DRAFT | Status: DRAFT, CONFIRMED |
| createdAt | datetime | Yes | Current | Creation timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:212-213`

### AUTOR_DE Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| status | string (enum) | No | DRAFT | Status: DRAFT, CONFIRMED |
| createdAt | datetime | Yes | Current | Creation timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:220-221`

### VERSIONA Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| status | string (enum) | No | DRAFT | Status: DRAFT, CONFIRMED |
| createdAt | datetime | Yes | Current | Creation timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:228-229`

### TAGGED_WITH Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| isPrimary | boolean | No | false | Indicates if this is the primary tag |
| status | string (enum) | No | DRAFT | Status: DRAFT, CONFIRMED |
| createdAt | datetime | Yes | Current | Creation timestamp |

**Code Reference**: `backend/src/server/db/schema/schema.ts:236-238`

### SOY_YO Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| status | string (enum) | Yes | REQUESTED | Status: REQUESTED, REJECTED, APPROVED |
| requestedAt | datetime | Yes | Current | When identity claim was requested |
| isVerified | boolean | No | false | True if APPROVED |
| verifiedAt | datetime | Yes | Current | When identity was verified (APPROVED/REJECTED) |
| verifiedBy | string | Yes | None | ID of admin user who verified |

**Code Reference**: `backend/src/server/db/schema/schema.ts:245-249`

### REACCIONA_A Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | string (enum) | Yes | None | Type: ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA |
| createdAt | datetime | Yes | Current | Creation timestamp |
| updatedAt | datetime | Yes | Current | Last update timestamp |
| removedAt | datetime | No | None | Soft delete: timestamp when reaction was removed |

**Code Reference**: `backend/src/server/db/schema/schema.ts:256-259`

---

## Property Types

### ID Format Specification

Entity IDs follow the format: `{prefix}{8-chars}`

- **Prefix**: Single character indicating entity type
- **8-chars**: Base36 alphanumeric characters (0-9, a-z), lowercase
- **Collision detection**: IDs are checked for uniqueness before assignment

**Prefixes:**
- `a`: Artista (e.g., a1b2c3d4, ax9y8z7w6)
- `c`: Cancion (e.g., c9f0a1b2, cx7y6z5w4)
- `j`: Jingle (e.g., j5e6f7g8, j9f0a1b2c)
- `t`: Tematica (e.g., t3k8m2n1, tx5y4z3w2)
- `u`: Usuario (e.g., u1a2b3c4d, ux7y4z9w0)

**Special case - Fabrica:**
- Fabricas use external YouTube video IDs (11 characters)
- Example: 0hmxZPp0xq0, DBbyI99TtIM
- NOT subject to ID migration

**Code Reference**: `backend/src/server/db/schema/schema.ts:8-23`

### Enum Types

#### Usuario.role
- `ADMIN`: Administrator with elevated permissions
- `GUEST`: Regular user

#### Jingle.status / Artista.status / Cancion.status / Tematica.status
- `DRAFT`: Initial state, not yet published
- `REVIEW`: Under review for publication
- `PUBLISHED`: Published and visible
- `ARCHIVED`: Archived but still accessible
- `DELETED`: Soft deleted, not visible

#### Fabrica.status
- `DRAFT`: Not yet processed
- `PROCESSING`: Currently being processed
- `COMPLETED`: Fully processed with all Jingles extracted

#### Relationship status (APPEARS_IN, JINGLERO_DE, AUTOR_DE, VERSIONA, TAGGED_WITH)
- `DRAFT`: Pending confirmation
- `CONFIRMED`: Verified and confirmed

#### SOY_YO.status
- `REQUESTED`: User has claimed identity
- `REJECTED`: Claim was rejected
- `APPROVED`: Claim was verified and approved

#### REACCIONA_A.type
- `ME_GUSTA`: Like reaction
- `JINGLAZO`: Special highlight reaction
- `JINGLAZO_DEL_DIA`: Jingle of the day reaction

#### Tematica.category
- `ACTUALIDAD`: Current events
- `POLITICA`: Politics
- `CULTURA`: Culture
- `GENTE`: People
- `GELATINA`: Gelatina (specific category)

---

## Redundant Properties

### Purpose

Redundant properties (denormalized data) improve query performance by storing frequently accessed relationship data directly on entities, eliminating the need for relationship traversals.

### Maintenance Rules

1. **Relationships are the source of truth**
2. Redundant properties are automatically synced when relationships change
3. On conflict, redundant properties are updated to match relationships
4. CRUD operations auto-sync redundant properties with relationships

**Code Reference**: `backend/src/server/db/schema/schema.ts:26-53`

### Jingle Redundant Properties

#### fabricaId

- **Source**: APPEARS_IN relationship → Fabrica.id
- **Type**: string (optional)
- **Auto-Sync Behavior**:
  - When APPEARS_IN is created: `jingle.fabricaId = fabrica.id`
  - When APPEARS_IN is deleted: `jingle.fabricaId = null`
  - When APPEARS_IN is updated: `jingle.fabricaId` updated to match
- **Code Reference**: `backend/src/server/db/schema/schema.ts:116`

#### fabricaDate

- **Source**: APPEARS_IN relationship → Fabrica.date
- **Type**: datetime (optional)
- **Auto-Sync Behavior**:
  - When APPEARS_IN is created/updated: `jingle.fabricaDate = fabrica.date`
  - When APPEARS_IN is deleted: `jingle.fabricaDate = null`
- **Code Reference**: `backend/src/server/db/schema/schema.ts:117`

#### cancionId

- **Source**: VERSIONA relationship → Cancion.id
- **Type**: string (optional)
- **Auto-Sync Behavior**:
  - When VERSIONA is created: `jingle.cancionId = cancion.id`
  - When VERSIONA is deleted: `jingle.cancionId = null`
  - When VERSIONA is updated: `jingle.cancionId` updated to match
- **Code Reference**: `backend/src/server/db/schema/schema.ts:118`

#### songTitle

- **Source**: VERSIONA relationship → Cancion.title
- **Type**: string (optional)
- **Auto-Sync Behavior**:
  - When VERSIONA is created/updated: `jingle.songTitle = cancion.title`
  - When VERSIONA is deleted: `jingle.songTitle = null`
- **Code Reference**: `backend/src/server/db/schema/schema.ts:110`

#### artistName

- **Source**: VERSIONA relationship → Cancion → AUTOR_DE → Artista.name
- **Type**: string (optional)
- **Auto-Sync Behavior**:
  - When VERSIONA/AUTOR_DE relationships change: `jingle.artistName` updated from primary author
- **Code Reference**: `backend/src/server/db/schema/schema.ts:111`

#### genre

- **Source**: VERSIONA relationship → Cancion.genre
- **Type**: string (optional)
- **Auto-Sync Behavior**:
  - When VERSIONA is created/updated: `jingle.genre = cancion.genre`
  - When VERSIONA is deleted: `jingle.genre = null`
- **Code Reference**: `backend/src/server/db/schema/schema.ts:112`

#### timestamp

- **Source**: APPEARS_IN relationship → timestamp property
- **Type**: number (optional)
- **Auto-Sync Behavior**:
  - When APPEARS_IN is created/updated: `jingle.timestamp = appearsIn.timestamp`
  - When APPEARS_IN is deleted: `jingle.timestamp = null`
- **Code Reference**: `backend/src/server/db/schema/schema.ts:105`

### Cancion Redundant Properties

#### autorIds

- **Source**: AUTOR_DE relationships → Artista.id[]
- **Type**: string[] (optional)
- **Auto-Sync Behavior**:
  - When AUTOR_DE is created: Add `artista.id` to `cancion.autorIds[]`
  - When AUTOR_DE is deleted: Remove `artista.id` from `cancion.autorIds[]`
  - When all AUTOR_DE deleted: `cancion.autorIds = []`
- **Code Reference**: `backend/src/server/db/schema/schema.ts:156`

### Usuario Redundant Properties

#### artistId

- **Source**: SOY_YO relationship → Artista.id
- **Type**: string (optional)
- **Auto-Sync Behavior**:
  - When SOY_YO is created (APPROVED): `usuario.artistId = artista.id`
  - When SOY_YO is deleted or REJECTED: `usuario.artistId = null`
- **Code Reference**: `backend/src/server/db/schema/schema.ts:86`

### Artista Redundant Properties

#### idUsuario

- **Source**: SOY_YO relationship → Usuario.id
- **Type**: string (optional)
- **Auto-Sync Behavior**:
  - When SOY_YO is created (APPROVED): `artista.idUsuario = usuario.id`
  - When SOY_YO is deleted or REJECTED: `artista.idUsuario = null`
- **Code Reference**: `backend/src/server/db/schema/schema.ts:132`

### Auto-Sync Behavior Summary

**Entity CREATE:**
- If redundant properties provided, auto-create relationships
- Example: Creating Jingle with `fabricaId` → auto-creates APPEARS_IN

**Entity UPDATE:**
- If redundant properties changed, auto-update relationships
- Example: Updating Jingle `cancionId` → auto-updates VERSIONA

**Relationship CREATE:**
- Auto-update redundant properties
- Example: Creating APPEARS_IN → auto-updates `jingle.fabricaId` and `jingle.fabricaDate`

**Relationship DELETE:**
- Auto-update redundant properties (or clear if none remain)
- Example: Deleting VERSIONA → clears `jingle.cancionId`, `jingle.songTitle`, `jingle.genre`

**Validation:**
- Auto-fix discrepancies after CRUD operations
- Relationships are source of truth, redundant properties are updated to match

**Code Reference**: `backend/src/server/db/schema/schema.ts:48-53`

---

## System-Managed Properties

### APPEARS_IN.order

The `order` property in APPEARS_IN relationships is system-managed and READ-ONLY.

**Calculation:**
- Based on `timestamp` property (integer seconds)
- Timestamps sorted ascending (numeric sort)
- Sequential order assigned: 1, 2, 3, 4, ...
- Auto-recalculated on create/update/delete of APPEARS_IN relationships

**Default timestamp**: 0 (seconds) if not provided

**Conflict handling:**
- If multiple relationships have same timestamp, order assigned arbitrarily
- Warning logged for timestamp conflicts

**User cannot manually set `order`** - any provided value is ignored with warning.

**Code Reference**: `backend/src/server/db/schema/schema.ts:56-73`

### Artista.isArg

The `isArg` property is auto-managed from the `nationality` property.

**Calculation:**
- `isArg = true` if `nationality === 'Argentina'`
- `isArg = false` otherwise

**Code Reference**: `backend/src/server/db/schema/schema.ts:134`

---

## Change History

- **2025-01-27**: Initial documentation created from `schema.ts` and `setup.ts`
- **2025-11-23**: Added `musicBrainzId` property to Artista and Cancion nodes