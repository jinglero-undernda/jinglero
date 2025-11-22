# Schema: Relationships

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:189-259`

## Overview

This document describes all relationship types in the Neo4j knowledge graph. The schema includes 8 relationship types connecting nodes and enabling the graph structure.

---

# Relationship Type: APPEARS_IN

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `backend/src/server/db/schema/schema.ts:191-205`

## Overview

APPEARS_IN connects a Jingle to a Fabrica, indicating that the jingle appears in that stream. The relationship includes ordering information and timestamp data. The `order` property is system-managed and read-only, automatically calculated from the `timestamp` property.

## Definition

- **Type**: APPEARS_IN
- **Start Node**: Jingle
- **End Node**: Fabrica
- **Direction**: Directed (Jingle → Fabrica)
- **Cardinality**: Many-to-One (multiple Jingles can appear in one Fabrica, each Jingle appears in one Fabrica)

## Properties

### order

- **Type**: number
- **Required**: Yes (system-managed)
- **Default**: Auto-calculated
- **Description**: READ-ONLY, system-managed property. Sequential order (1, 2, 3, ...) calculated from `timestamp` property. Timestamps are sorted ascending (numeric sort) to assign sequential order. Auto-recalculated on create/update/delete of APPEARS_IN relationships. User cannot manually set - any provided value is ignored with warning.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:196`

### timestamp

- **Type**: number (seconds)
- **Required**: No
- **Default**: 0
- **Description**: Timestamp in seconds indicating when the jingle appears in the Fabrica. Used to calculate the `order` property. If multiple relationships have the same timestamp, order is assigned arbitrarily with a warning logged.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:197`

### status

- **Type**: string (enum: DRAFT, CONFIRMED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Status of the appearance. DRAFT indicates pending confirmation, CONFIRMED indicates verified.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:198`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the relationship was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:199`

## Usage Patterns

- Created when a Jingle is extracted from a Fabrica
- Each Jingle must have exactly one APPEARS_IN relationship to a Fabrica
- Order is automatically maintained based on timestamp
- Used to query Jingles in chronological order within a Fabrica
- Redundant properties `fabricaId` and `fabricaDate` on Jingle node are synced from this relationship

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:191-205`
- **Import File Pattern**: `rel-Jingle-APPEARS_IN-Fabrica-YYYY-MM-DD.csv`

## Special Notes

- The `order` property is system-managed and cannot be manually set
- Order calculation is based on numeric sorting of timestamps
- Default timestamp is 0 if not provided
- Conflict handling: If multiple relationships have the same timestamp, order is assigned arbitrarily with a warning

---

# Relationship Type: JINGLERO_DE

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Code Reference**: `backend/src/server/db/schema/schema.ts:207-213`

## Overview

JINGLERO_DE connects an Artista to a Jingle, indicating that the artist performed or "jingled" that particular jingle. This relationship represents the performance aspect, distinct from authorship (which is via AUTOR_DE on Cancion).

## Definition

- **Type**: JINGLERO_DE
- **Start Node**: Artista
- **End Node**: Jingle
- **Direction**: Directed (Artista → Jingle)
- **Cardinality**: Many-to-Many (artists can perform multiple jingles, jingles can have multiple performers)

## Properties

### status

- **Type**: string (enum: DRAFT, CONFIRMED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Status of the performance relationship. DRAFT indicates pending confirmation, CONFIRMED indicates verified.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:212`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the relationship was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:213`

## Usage Patterns

- Created when an Artista is identified as a performer of a Jingle
- Multiple artists can perform the same jingle
- Used to query all jingles performed by a specific artist
- Used to query all performers of a specific jingle

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:207-213`
- **Import File Pattern**: `rel-Artista-JINGLERO_DE-Jingle-YYYY-MM-DD.csv`

---

# Relationship Type: AUTOR_DE

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Code Reference**: `backend/src/server/db/schema/schema.ts:215-221`

## Overview

AUTOR_DE connects an Artista to a Cancion, indicating that the artist authored (wrote/composed) that song. This relationship represents authorship, distinct from performance (which is via JINGLERO_DE on Jingle).

## Definition

- **Type**: AUTOR_DE
- **Start Node**: Artista
- **End Node**: Cancion
- **Direction**: Directed (Artista → Cancion)
- **Cardinality**: Many-to-Many (artists can author multiple songs, songs can have multiple authors)

## Properties

### status

- **Type**: string (enum: DRAFT, CONFIRMED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Status of the authorship relationship. DRAFT indicates pending confirmation, CONFIRMED indicates verified.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:220`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the relationship was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:221`

## Usage Patterns

- Created when an Artista is identified as an author of a Cancion
- Multiple artists can author the same song (collaborations)
- Used to query all songs authored by a specific artist
- Used to query all authors of a specific song
- Redundant property `autorIds[]` on Cancion node is synced from these relationships

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:215-221`
- **Import File Pattern**: `rel-Artista-AUTOR_DE-Cancion-YYYY-MM-DD.csv`

## Special Notes

- The redundant property `autorIds[]` on Cancion nodes is automatically synced from AUTOR_DE relationships
- Relationships are the source of truth for authorship

---

# Relationship Type: VERSIONA

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Code Reference**: `backend/src/server/db/schema/schema.ts:223-229`

## Overview

VERSIONA connects a Jingle to a Cancion, indicating that the jingle is a version or performance of that song. This relationship links the performance (Jingle) to the original composition (Cancion).

## Definition

- **Type**: VERSIONA
- **Start Node**: Jingle
- **End Node**: Cancion
- **Direction**: Directed (Jingle → Cancion)
- **Cardinality**: Many-to-One (multiple Jingles can version the same Cancion, each Jingle versions at most one Cancion)

## Properties

### status

- **Type**: string (enum: DRAFT, CONFIRMED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Status of the versioning relationship. DRAFT indicates pending confirmation, CONFIRMED indicates verified.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:228`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the relationship was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:229`

## Usage Patterns

- Created when a Jingle is identified as a version of a Cancion
- Used to query all jingles that version a specific song
- Used to query the song that a jingle versions
- Redundant properties `cancionId`, `songTitle`, `artistName`, `genre` on Jingle node are synced from this relationship

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:223-229`
- **Import File Pattern**: `rel-Jingle-VERSIONA-Cancion-YYYY-MM-DD.csv`

## Special Notes

- The redundant property `cancionId` on Jingle nodes is automatically synced from VERSIONA relationships
- Additional redundant properties `songTitle`, `artistName`, and `genre` are also synced from the related Cancion and its Artistas
- Relationships are the source of truth for versioning

---

# Relationship Type: TAGGED_WITH

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Code Reference**: `backend/src/server/db/schema/schema.ts:231-238`

## Overview

TAGGED_WITH connects a Jingle to a Tematica, indicating that the jingle is tagged with that thematic category. This relationship enables categorization and filtering of jingles by topic.

## Definition

- **Type**: TAGGED_WITH
- **Start Node**: Jingle
- **End Node**: Tematica
- **Direction**: Directed (Jingle → Tematica)
- **Cardinality**: Many-to-Many (jingles can have multiple tags, tematicas can tag multiple jingles)

## Properties

### isPrimary

- **Type**: boolean
- **Required**: No
- **Default**: false
- **Description**: Indicates if this is the primary tag for the jingle. A jingle can have multiple tags, but typically one is marked as primary.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:236`

### status

- **Type**: string (enum: DRAFT, CONFIRMED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Status of the tagging relationship. DRAFT indicates pending confirmation, CONFIRMED indicates verified.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:237`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the relationship was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:238`

## Usage Patterns

- Created when a Jingle is tagged with a Tematica
- Multiple tags can be applied to the same jingle
- Used to query all jingles with a specific tag
- Used to query all tags for a specific jingle
- Primary tag (`isPrimary: true`) is used for main categorization

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:231-238`
- **Import File Pattern**: `rel-Jingle-TAGGED_WITH-Tematica-YYYY-MM-DD.csv`

---

# Relationship Type: SOY_YO

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Code Reference**: `backend/src/server/db/schema/schema.ts:240-249`

## Overview

SOY_YO connects a Usuario to an Artista, indicating that the user is claiming to be (or is verified as) that artist. This relationship enables user-artist identity verification and linking.

## Definition

- **Type**: SOY_YO
- **Start Node**: Usuario
- **End Node**: Artista
- **Direction**: Directed (Usuario → Artista)
- **Cardinality**: One-to-One (each user can be linked to at most one artist, each artist can be linked to at most one user)

## Properties

### status

- **Type**: string (enum: REQUESTED, REJECTED, APPROVED)
- **Required**: Yes
- **Default**: REQUESTED
- **Description**: Verification status of the identity claim. REQUESTED = user has claimed identity, REJECTED = claim was rejected, APPROVED = claim was verified and approved.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:245`

### requestedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the identity claim was requested.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:246`

### isVerified

- **Type**: boolean
- **Required**: No (only if APPROVED)
- **Default**: false
- **Description**: Indicates if the identity is verified. Only set to true if status is APPROVED.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:247`

### verifiedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp (when status changes to APPROVED or REJECTED)
- **Description**: Timestamp when the identity was verified (either approved or rejected).
- **Code Reference**: `backend/src/server/db/schema/schema.ts:248`

### verifiedBy

- **Type**: string (user ID)
- **Required**: Yes
- **Default**: None
- **Description**: ID of the admin user who verified the identity claim.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:249`

## Usage Patterns

- Created when a Usuario claims to be an Artista
- Status workflow: REQUESTED → (APPROVED | REJECTED)
- Used to link user accounts to artist profiles
- Redundant properties `artistId` on Usuario and `idUsuario` on Artista are synced from this relationship
- Verification requires admin approval

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:240-249`
- **Import File Pattern**: `rel-Usuario-SOY_YO-Artista-YYYY-MM-DD.csv`

## Special Notes

- This is a verification/identity relationship requiring admin approval
- The redundant properties `artistId` on Usuario and `idUsuario` on Artista are automatically synced from this relationship
- Relationships are the source of truth for user-artist identity

---

# Relationship Type: REACCIONA_A

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Code Reference**: `backend/src/server/db/schema/schema.ts:251-259`

## Overview

REACCIONA_A connects a Usuario to a Jingle, indicating that the user has reacted to that jingle. Reactions can be likes, jinglazos, or jinglazo del día. Reactions can be removed (soft delete via `removedAt`).

## Definition

- **Type**: REACCIONA_A
- **Start Node**: Usuario
- **End Node**: Jingle
- **Direction**: Directed (Usuario → Jingle)
- **Cardinality**: Many-to-Many (users can react to multiple jingles, jingles can have multiple reactions)

## Properties

### type

- **Type**: string (enum: ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA)
- **Required**: Yes
- **Default**: None
- **Description**: Type of reaction. ME_GUSTA = like, JINGLAZO = special highlight, JINGLAZO_DEL_DIA = jingle of the day.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:256`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the reaction was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:257`

### updatedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the reaction was last updated (e.g., when type changed).
- **Code Reference**: `backend/src/server/db/schema/schema.ts:258`

### removedAt

- **Type**: datetime (optional)
- **Required**: No
- **Default**: None
- **Description**: Timestamp when the reaction was removed (soft delete). If set, the reaction is considered inactive.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:259`

## Usage Patterns

- Created when a Usuario reacts to a Jingle
- Users can change reaction type (updating `type` and `updatedAt`)
- Users can remove reactions (setting `removedAt` for soft delete)
- Used to query all reactions to a specific jingle
- Used to query all reactions by a specific user
- Used to calculate jingle popularity and rankings

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:251-259`
- **Import File Pattern**: `rel-Usuario-REACCIONA_A-Jingle-YYYY-MM-DD.csv`

## Special Notes

- Reactions support soft delete via `removedAt` property
- Reaction type can be updated (e.g., ME_GUSTA → JINGLAZO)
- Only one active reaction per user per jingle (filtered by `removedAt IS NULL`)

---

# Relationship Type: REPEATS

## Status

- **Status**: needs_implementation
- **Last Updated**: 2025-01-28
- **Last Validated**: 2025-01-28
- **Code Reference**: `backend/src/server/db/schema/schema.ts` (to be implemented)
- **Validation Report**: `docs/4_backend_database-schema/validation-reports/REPEATS-validation-report-2025-01-28.md`

## Overview

REPEATS connects a Jingle to another Jingle, indicating that one jingle is a repeat (repetido) of another. This self-referential relationship enables tracking when the same Jingle appears in multiple Fabricas, maintaining data consistency between the latest "repeat" and the original instance. The relationship includes direction validation based on publication dates, transitive normalization to maintain direct links to original instances, and traversal logic to identify the "initial repeat" (original source).

## Definition

- **Type**: REPEATS
- **Start Node**: Jingle
- **End Node**: Jingle
- **Direction**: Directed (Latest → Earliest, or Inedito → Published)
- **Cardinality**: Many-to-Many (one Jingle can repeat multiple others, but all outbound REPEATS must point to initial instances after normalization)

## Properties

### status

- **Type**: string (enum: DRAFT, CONFIRMED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Status of the repeat relationship. DRAFT indicates pending confirmation, CONFIRMED indicates verified. When transitive normalization updates an existing relationship's target, the status is set to DRAFT.
- **Code Reference**: `backend/src/server/db/schema/schema.ts` (to be implemented)

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the relationship was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts` (to be implemented)

## Direction Validation Rules

The REPEATS relationship direction is automatically validated and corrected based on publication status:

1. **Both Jingles Published** (both have `fabricaDate`):

   - Direction: Latest (newer `fabricaDate`) → REPEATS → Earliest (older `fabricaDate`)
   - The jingle with the more recent publication date is the "latest" repeat and points to the earlier one

2. **One Jingle Inedito** (one has `fabricaDate`, one does not):

   - Direction: Inedito (no `fabricaDate`) → REPEATS → Published (has `fabricaDate`)
   - An unpublished jingle (Inedito) always points to a published one

3. **Both Jingles Inedito** (neither has `fabricaDate`):
   - Direction: Determined by `createdAt` or other criteria (to be specified)
   - The jingle created later → REPEATS → the jingle created earlier

**Auto-Correction**: Direction is automatically corrected on relationship create and update operations. If the provided direction is incorrect, the relationship is created/updated with the correct direction.

## Transitive Normalization

REPEATS relationships are automatically normalized to maintain direct links to original instances:

**Rule**: If a transitive chain exists (J3-REPEATS-J1 AND J1-REPEATS-J2), the system normalizes to J3-REPEATS-J2.

**Action**:

- Delete the intermediate relationship (J3-REPEATS-J1), OR
- Update the existing relationship's target (change J3-REPEATS-J1 to J3-REPEATS-J2) and set status to DRAFT

**Trigger**:

- On relationship create: Check if new relationship creates a transitive chain
- On relationship update: Check if update creates a transitive chain
- Prevent concurrent inbound and outbound REPEATS on the same Jingle (triggers normalization immediately)

**Result**: All outbound REPEATS relationships point directly to initial instances (no intermediate nodes in the chain).

## Traversal Logic

The REPEATS relationship supports traversal to identify the original source:

1. **Find Initial Repeat** (Original Source):

   - Traverse REPEATS chain backwards (following inbound relationships)
   - The initial repeat is the Jingle with no inbound REPEATS relationships
   - Used for: UI display, validation, data consistency checks

2. **Find Other Instances**:
   - 2-step bidirectional query to find all repeats in the chain
   - Query both inbound and outbound REPEATS relationships
   - Used for: Displaying all instances of a repeated jingle

## Constraints

1. **No Concurrent Inbound/Outbound REPEATS**:

   - A Jingle cannot have both inbound AND outbound REPEATS concurrently
   - If detected, triggers transitive normalization immediately

2. **Multiple Outbound REPEATS Allowed**:

   - One Jingle can have multiple outbound REPEATS relationships
   - Each outbound REPEATS must point to a different initial instance
   - All outbound REPEATS must point to initial instances (after normalization)

3. **Initial Instance Requirement**:

   - All outbound REPEATS relationships must point to initial instances
   - An initial instance is a Jingle with no inbound REPEATS relationships
   - Transitive normalization ensures this constraint is maintained

4. **Circular References Prevention**:
   - Validation prevents circular REPEATS chains
   - A Jingle cannot REPEATS itself (directly or indirectly)

## Usage Patterns

- Created when a Jingle is identified as a repeat of another Jingle
- Used to track when the same song/clip appears in multiple Fabricas
- Used to maintain data consistency between latest repeat and original
- Used in UI to display related repeated jingles
- Used for data validation and integrity checks

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts` (to be implemented)
- **Import File Pattern**: `rel-Jingle-REPEATS-Jingle-YYYY-MM-DD.csv`
- **Validation Module**: `backend/src/server/db/validation/repeats-validation.ts` (to be implemented)

## Special Notes

- **Direction Auto-Correction**: The relationship direction is automatically validated and corrected based on publication dates (`fabricaDate`). This ensures data consistency and prevents manual errors.

- **Transitive Normalization**: The system automatically normalizes transitive chains to maintain direct links to original instances. This prevents intermediate relationships and ensures all REPEATS point to initial sources.

- **Publication Status**: A Jingle is considered "published" if it has an APPEARS_IN relationship to a Fabrica (and therefore has a `fabricaDate`). A Jingle without an APPEARS_IN relationship is "Inedito" (unpublished).

- **Traversal Performance**: For long REPEATS chains, traversal queries may need optimization. Consider caching or indexing strategies for production use.

- **Relationship Properties**: The relationship is designed to be extensible. Future properties may be added as needed (e.g., confidence score, notes, etc.).

---

## Change History

- **2025-01-27**: Initial documentation created from `schema.ts`
- **2025-11-22**: Added REPEATS relationship documentation (draft)
