/*
Graph Schema Documentation

================================================================================
ID FORMAT SPECIFICATION
================================================================================

Entity IDs follow the format: {prefix}{8-chars}
- Prefix: Single character indicating entity type
- 8-chars: Base36 alphanumeric characters (0-9, a-z), lowercase
- Collision detection: IDs are checked for uniqueness before assignment

Prefixes:
- a: Artista (e.g., a1b2c3d4, ax9y8z7w6)
- c: Cancion (e.g., c9f0a1b2, cx7y6z5w4)
- j: Jingle (e.g., j5e6f7g8, j9f0a1b2c)
- t: Tematica (e.g., t3k8m2n1, tx5y4z3w2)
- u: Usuario (e.g., u1a2b3c4d, ux7y4z9w0)

Special case - Fabrica:
- Fabricas use external YouTube video IDs (11 characters)
- Example: 0hmxZPp0xq0, DBbyI99TtIM
- NOT subject to ID migration

================================================================================
REDUNDANT PROPERTIES (DENORMALIZED DATA)
================================================================================

Purpose: Improve query performance by storing frequently accessed relationship 
data directly on entities, eliminating the need for relationship traversals.

Maintenance Rules:
1. Relationships are the source of truth
2. Redundant properties are automatically synced when relationships change
3. On conflict, redundant properties are updated to match relationships
4. CRUD operations auto-sync redundant properties with relationships

Redundant Properties by Entity:

Jingle:
- fabricaId: ID of related Fabrica (from APPEARS_IN relationship)
- fabricaDate: Date of related Fabrica (from APPEARS_IN->Fabrica.date)
- cancionId: ID of related Cancion (from VERSIONA relationship)

Cancion:
- autorIds: Array of Artista IDs (from AUTOR_DE relationships)

Auto-Sync Behavior:
- Entity CREATE: If redundant properties provided, auto-create relationships
- Entity UPDATE: If redundant properties changed, auto-update relationships
- Relationship CREATE: Auto-update redundant properties
- Relationship DELETE: Auto-update redundant properties (or clear if none remain)
- Validation: Auto-fix discrepancies after CRUD operations

================================================================================
APPEARS_IN ORDER MANAGEMENT
================================================================================

The 'order' property in APPEARS_IN relationships is system-managed and READ-ONLY.

Calculation:
- Based on 'timestamp' property (integer seconds)
- Timestamps sorted ascending (numeric sort)
- Sequential order assigned: 1, 2, 3, 4, ...
- Auto-recalculated on create/update/delete of APPEARS_IN relationships

Default timestamp: 0 (seconds) if not provided

Conflict handling:
- If multiple relationships have same timestamp, order assigned arbitrarily
- Warning logged for timestamp conflicts

User cannot manually set 'order' - any provided value is ignored with warning.

================================================================================

Nodes:
------
1. Usuario
   Labels: Usuario
   Import file: node-Usuario-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - email: string (unique)
   - role: string (enum: ADMIN, GUEST)
   - artistId: string (optional, indicates if the user is also an artist, inherited from relationship)
   - displayName: string
   - profilePictureUrl: string (optional)
   - twitterHandle: string (optional, unique)
   - instagramHandle: string (optional, unique)
   - facebookProfile: string (optional, unique)
   - youtubeHandle: string (optional, unique)
   - contributionsCount: number
   - createdAt: datetime
   - lastLogin: datetime (optional)
   - updatedAt: datetime


2. Jingle
   Labels: Jingle
   Import file: node-Jingle-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - youtubeUrl: string (based on the Fabrica URL and timestamp)
   - timestamp: number (in seconds, derived from the relationship to Fabrica)
   - youtubeClipUrl: string (for clips of the jingle on YouTube)
   - title: string (optional)
   - comment: string (optional)
   - lyrics: string (optional)
  - songTitle: string (inherited from the associated Cancion)
  - artistName: string (inherited from the associated Cancion's Artista)
  - genre: string (optional, inherited from the associated Cancion)
  - isJinglazo: boolean (optional)
  - isJinglazoDelDia: boolean (optional)
  - isPrecario: boolean (optional)
  - fabricaId: string (optional, redundant with APPEARS_IN relationship - for performance)
  - fabricaDate: datetime (optional, redundant with APPEARS_IN->Fabrica.date - for display/query performance)
  - cancionId: string (optional, redundant with VERSIONA relationship - for performance)
  - isLive: boolean (optional, indicates if Jingle was performed live)
  - isRepeat: boolean (optional, indicates if this song was performed on the show before)
   - status: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED, default: DRAFT)
   - createdAt: datetime
   - updatedAt: datetime

3. Artista
   Labels: Artista
   Import file: node-Artista-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - name: string (unique)
   - stageName: string (optional)
  - idUsuario: string (optional, indicates if the artist is also a user ,inherited from relationship)
  - nationality: string (optional)
  - isArg: boolean (optional, auto-managed from nationality, true if nationality === 'Argentina')
   - youtubeHandle: string (optional)
   - instagramHandle: string (optional)
   - twitterHandle: string (optional)
   - facebookProfile: string (optional)
  - website: string (optional)
  - bio: string (optional)
  - status: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED, default: DRAFT)
  - createdAt: datetime
  - updatedAt: datetime

4. Cancion 
   Labels: Cancion
   Import file: node-Cancion-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - title: string
   - album: string (optional)
   - year: number (optional)
   - genre: string (optional)
   - youtubeMusic: string (optional)
   - lyrics: string (optional, URL to retrieve lyrics)
   - autorIds: string[] (optional, redundant with AUTOR_DE relationships - for performance)
   - status: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED, default: DRAFT)
   - createdAt: datetime
   - updatedAt: datetime

5. Fabrica
   Labels: Fabrica
   Import file: node-Fabrica-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID - Youtube video ID)
   - title: string
   - date: datetime
   - youtubeUrl: string
   - visualizations: number
   - likes: number
   - description: string
   - contents: string (based on a comment in the YouTube video)
   - status: string (enum: DRAFT, PROCESSING, COMPLETED)
   - createdAt: datetime
   - updatedAt: datetime

6. Tematica
   Labels: Tematica
   Import file: node-Tematica-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - name: string (unique)
  - category: string (optional enum: ACTUALIDAD, POLITICA, CULTURA, GENTE, GELATINA)
  - description: string
  - status: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED, default: DRAFT)
  - createdAt: datetime
  - updatedAt: datetime

Relationships:
-------------
1. APPEARS_IN
   Start Node: Jingle
   End Node: Fabrica
   Import file: rel-Jingle-APPEARS_IN-Fabrica-YYYY-MM-DD.csv
   Properties:
   - order: number (READ-ONLY, system-managed, calculated from timestamp)
   - timestamp: number (seconds, defaults to 0)
   - status: string (enum: DRAFT, CONFIRMED, default: DRAFT)
   - createdAt: datetime
   
   Note: The 'order' property is automatically calculated and maintained based on the 
   'timestamp' property. Timestamps are stored as integers (seconds) and relationships 
   are sorted ascending (numeric sort) to assign sequential order (1, 2, 3, ...). The 
   'order' property cannot be manually set and any provided value will be ignored with 
   a warning.

2. JINGLERO_DE
   Start Node: Artista
   End Node: Jingle
   Import file: rel-Artista-JINGLERO_DE-Jingle-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

3. AUTOR_DE
   Start Node: Artista
   End Node: Cancion
   Import file: rel-Artista-AUTOR_DE-Cancion-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

4. VERSIONA
   Start Node: Jingle
   End Node: Cancion
   Import file: rel-Jingle-VERSIONA-Cancion-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

5. TAGGED_WITH
   Start Node: Jingle
   End Node: Tematica
   Import file: rel-Jingle-TAGGED_WITH-Tematica-YYYY-MM-DD.csv
   Properties:
   - isPrimary: boolean
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime
   
6. SOY_YO
   Start Node: Usuario
   End Node: Artista
   Import file: rel-Usuario-SOY_YO-Artista-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: REQUESTED, REJECTED, APPROVED)
   - requestedAt: datetime
   - isVerified: boolean (if APPROVED)
   - verifiedAt: datetime (either APPROVED or REJECTED date)
   - verifiedBy: string (user ID)

7. REACCIONA_A
   Start Node: Usuario
   End Node: Jingle
   Import file: rel-Usuario-REACCIONA_A-Jingle-YYYY-MM-DD.csv
   Properties:
   - type: string (enum: ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA)
   - createdAt: datetime
   - updatedAt: datetime
   - removedAt: datetime (optional, if the reaction was removed)

8. REPEATS
   Start Node: Jingle
   End Node: Jingle
   Import file: rel-Jingle-REPEATS-Jingle-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: DRAFT, CONFIRMED, default: DRAFT)
   - createdAt: datetime

*/