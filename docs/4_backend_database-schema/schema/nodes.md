# Schema: Nodes

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:77-187`

## Overview

This document describes all node types in the Neo4j knowledge graph. The schema includes 6 node types representing users, jingles (clips), artists, songs, fabricas (streams), and thematic categories.

---

# Node Type: Usuario

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:79-96`

## Overview

Usuario represents a user account in the system. Users can have roles (ADMIN or GUEST), social media profiles, and can be linked to an Artista through the SOY_YO relationship.

## Properties

### id

- **Type**: string
- **Required**: Yes
- **Default**: Auto-generated
- **Description**: Unique identifier following format `u{8-chars}` (e.g., u1a2b3c4d, ux7y4z9w0). Uses base36 alphanumeric characters (0-9, a-z), lowercase.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:83`

### email

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: User's email address. Must be unique across all users.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:84`

### role

- **Type**: string (enum: ADMIN, GUEST)
- **Required**: Yes
- **Default**: GUEST
- **Description**: User's role in the system. ADMIN has elevated permissions.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:85`

### artistId

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: ID of related Artista if the user is also an artist. Inherited from SOY_YO relationship (redundant property for performance).
- **Code Reference**: `backend/src/server/db/schema/schema.ts:86`

### displayName

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: User's display name shown in the UI.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:87`

### profilePictureUrl

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: URL to user's profile picture.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:88`

### twitterHandle

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: User's Twitter/X handle. Must be unique if provided.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:89`

### instagramHandle

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: User's Instagram handle. Must be unique if provided.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:90`

### facebookProfile

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: User's Facebook profile URL. Must be unique if provided.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:91`

### youtubeHandle

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: User's YouTube handle. Must be unique if provided.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:92`

### contributionsCount

- **Type**: number
- **Required**: Yes
- **Default**: 0
- **Description**: Count of user's contributions to the platform.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:93`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the user account was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:94`

### lastLogin

- **Type**: datetime (optional)
- **Required**: No
- **Default**: None
- **Description**: Timestamp of user's last login.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:95`

### updatedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the user account was last updated.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:96`

## Constraints

### Uniqueness

- `id`: Unique constraint on `id` property (`id_Usuario_uniq`, `user_email`)
- `email`: Unique constraint on `email` property (`user_email`)
- `twitterHandle`: Unique if provided
- `instagramHandle`: Unique if provided
- `facebookProfile`: Unique if provided
- `youtubeHandle`: Unique if provided
- **Code Reference**: `backend/src/server/db/schema/setup.ts:10,13`

### Required Fields

- `displayName`: NOT NULL constraint (`user_required`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:14`

## Usage Patterns

- Users are created through registration or admin creation
- Users can be linked to Artista nodes via SOY_YO relationship
- Users can react to Jingles via REACCIONA_A relationship
- Email is used for authentication and must be unique

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:79-96`
- **Constraints**: `backend/src/server/db/schema/setup.ts:10,13,14`
- **Import File Pattern**: `node-Usuario-YYYY-MM-DD.csv`

---

# Node Type: Jingle

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:99-123`

## Overview

Jingle represents a clip or segment from a Fabrica (stream). Each Jingle appears in a Fabrica, may version a Cancion, can be tagged with Tematicas, and can have reactions from Usuarios.

## Properties

### id

- **Type**: string
- **Required**: Yes
- **Default**: Auto-generated
- **Description**: Unique identifier following format `j{8-chars}` (e.g., j5e6f7g8, j9f0a1b2c). Uses base36 alphanumeric characters (0-9, a-z), lowercase.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:103`

### youtubeUrl

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: YouTube URL for the jingle clip. Based on the Fabrica URL and timestamp.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:104`

### timestamp

- **Type**: number (seconds)
- **Required**: No
- **Default**: None
- **Description**: Timestamp in seconds indicating when the jingle appears in the Fabrica. Derived from APPEARS_IN relationship. Redundant property for performance.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:105`

### youtubeClipUrl

- **Type**: string
- **Required**: No
- **Default**: None
- **Description**: URL for clips of the jingle on YouTube.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:106`

### title

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Optional title for the jingle.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:107`

### comment

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Optional comment or description for the jingle.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:108`

### lyrics

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Optional lyrics for the jingle.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:109`

### songTitle

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Inherited from the associated Cancion via VERSIONA relationship. Redundant property for performance.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:110`

### artistName

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Inherited from the associated Cancion's Artista via AUTOR_DE relationship. Redundant property for performance.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:111`

### genre

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Optional genre, inherited from the associated Cancion via VERSIONA relationship. Redundant property for performance.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:112`

### isJinglazo

- **Type**: boolean (optional)
- **Required**: No
- **Default**: false
- **Description**: Indicates if this jingle is marked as a "jinglazo" (special highlight).
- **Code Reference**: `backend/src/server/db/schema/schema.ts:113`

### isJinglazoDelDia

- **Type**: boolean (optional)
- **Required**: No
- **Default**: false
- **Description**: Indicates if this jingle is the "jinglazo del día" (jingle of the day).
- **Code Reference**: `backend/src/server/db/schema/schema.ts:114`

### isPrecario

- **Type**: boolean (optional)
- **Required**: No
- **Default**: false
- **Description**: Indicates if this jingle is marked as "precario" (low quality or temporary).
- **Code Reference**: `backend/src/server/db/schema/schema.ts:115`

### fabricaId

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: ID of related Fabrica from APPEARS_IN relationship. Redundant property for performance - relationships are source of truth.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:116`

### fabricaDate

- **Type**: datetime (optional)
- **Required**: No
- **Default**: None
- **Description**: Date of related Fabrica from APPEARS_IN->Fabrica.date. Redundant property for display/query performance.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:117`

### cancionId

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: ID of related Cancion from VERSIONA relationship. Redundant property for performance - relationships are source of truth.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:118`

### isLive

- **Type**: boolean (optional)
- **Required**: No
- **Default**: false
- **Description**: Indicates if Jingle was performed live.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:119`

### isRepeat

- **Type**: boolean (optional)
- **Required**: No
- **Default**: false
- **Description**: Indicates if this song was performed on the show before.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:120`

### autoComment

- **Type**: string (optional)
- **Required**: No
- **Default**: null
- **Description**: System-generated summary comment that provides a concise overview of the jingle's core information. This property is read-only and automatically updated whenever any Jingle property or relationship changes. The format includes emoji-prefixed sections for Fabrica (date and timestamp), Title, Cancion, Autores, Primary Tematica, and Jingleros. Blank fields are omitted from the comment.
- **Format**: `🏭: YYYY-MM-DD - [HH:]MM:SS, 🎤: {Titulo}, 📦: {Cancion}, 🚚: {Autor} [; {Autor}], 🏷️: {Primary Tematica}, 🔧: {Jinglero} [; {Jinglero}]`
- **Example**: `🏭: 2025-01-15 - 01:23:45, 🎤: Opening Theme, 📦: Song Title, 🚚: Artist One; Artist Two, 🏷️: ACTUALIDAD, 🔧: Performer One`
- **Read-only**: Yes (system-managed)
- **Auto-update triggers**: Any change to Jingle properties or relationships (APPEARS_IN, VERSIONA, JINGLERO_DE, TAGGED_WITH, AUTOR_DE)
- **Code Reference**: `backend/src/server/utils/jingleAutoComment.ts`

### status

- **Type**: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Publication status of the jingle.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:121`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the jingle was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:122`

### updatedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the jingle was last updated.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:123`

## Constraints

### Uniqueness

- `id`: Unique constraint on `id` property (`id_Jingle_uniq`, `clip_id`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:8,16`

### Indexes

- Full-text search index on `title`, `songTitle`, `artistName`, `comment` (`jingle_search`, `clip_search`)
- Regular index on `timestamp` (`jingle_timestamp`, `clip_timestamp`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:32,38,42,43`

## Usage Patterns

- Jingles are created when clips are extracted from Fabricas
- Each Jingle must have an APPEARS_IN relationship to a Fabrica
- Jingles can optionally VERSIONA a Cancion
- Jingles can be tagged with multiple Tematicas via TAGGED_WITH
- Artistas can be linked as performers via JINGLERO_DE
- Usuarios can react to Jingles via REACCIONA_A

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:99-123`
- **Constraints**: `backend/src/server/db/schema/setup.ts:8,16`
- **Indexes**: `backend/src/server/db/schema/setup.ts:32,38,42,43`
- **Import File Pattern**: `node-Jingle-YYYY-MM-DD.csv`

---

# Node Type: Artista

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-23
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:125-143`

## Overview

Artista represents a musical artist or performer. Artists can author Canciones, perform Jingles, and be linked to Usuarios through the SOY_YO relationship.

## Properties

### id

- **Type**: string
- **Required**: Yes
- **Default**: Auto-generated
- **Description**: Unique identifier following format `a{8-chars}` (e.g., a1b2c3d4, ax9y8z7w6). Uses base36 alphanumeric characters (0-9, a-z), lowercase.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:129`

### name

- **Type**: string
- **Required**: Yes (at least one of name or stageName required)
- **Default**: None
- **Description**: Artist's real name or primary name. Must be unique. At least one of `name` or `stageName` must be provided.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:130`

### stageName

- **Type**: string (optional)
- **Required**: No (but at least one of name or stageName required)
- **Default**: None
- **Description**: Artist's stage name or alias. At least one of `name` or `stageName` must be provided.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:131`

### idUsuario

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: ID of related Usuario if the artist is also a user. Inherited from SOY_YO relationship (redundant property for performance).
- **Code Reference**: `backend/src/server/db/schema/schema.ts:132`

### nationality

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Artist's nationality.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:133`

### isArg

- **Type**: boolean (optional)
- **Required**: No
- **Default**: Auto-calculated
- **Description**: Auto-managed from nationality. True if `nationality === 'Argentina'`.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:134`

### youtubeHandle

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Artist's YouTube handle.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:135`

### instagramHandle

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Artist's Instagram handle.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:136`

### twitterHandle

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Artist's Twitter/X handle.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:137`

### facebookProfile

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Artist's Facebook profile URL.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:138`

### website

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Artist's website URL.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:139`

### bio

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Artist's biography or description.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:140`

### musicBrainzId

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: MusicBrainz ID for linking to external MusicBrainz database. Used to tie database to external source of accurate data.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:140`

### status

- **Type**: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Publication status of the artist profile.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:141`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the artist was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:142`

### updatedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the artist was last updated.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:143`

## Constraints

### Uniqueness

- `id`: Unique constraint on `id` property (`id_Artista_uniq`)
- `name`: Unique constraint on `name` property
- **Code Reference**: `backend/src/server/db/schema/setup.ts:5`

### Required Fields

- `id`: NOT NULL constraint (`artist_required`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:18`

### Validation Rules

- At least one of `name` or `stageName` must be provided (application-level validation, not DB constraint)

### Indexes

- Full-text search index on `stageName`, `name` (`artista_search`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:34`

## Usage Patterns

- Artists are created through admin interface or import
- Artists can author multiple Canciones via AUTOR_DE relationships
- Artists can perform Jingles via JINGLERO_DE relationships
- Artists can be linked to Usuarios via SOY_YO relationship
- Name must be unique across all artists

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:125-143`
- **Constraints**: `backend/src/server/db/schema/setup.ts:5,18`
- **Indexes**: `backend/src/server/db/schema/setup.ts:34`
- **Import File Pattern**: `node-Artista-YYYY-MM-DD.csv`

---

# Node Type: Cancion

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-23
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:145-159`

## Overview

Cancion represents a song or musical composition. Songs can have multiple authors (Artistas), can be versioned by Jingles, and contain metadata like album, year, and genre.

## Properties

### id

- **Type**: string
- **Required**: Yes
- **Default**: Auto-generated
- **Description**: Unique identifier following format `c{8-chars}` (e.g., c9f0a1b2, cx7y6z5w4). Uses base36 alphanumeric characters (0-9, a-z), lowercase.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:149`

### title

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: Song title. Required field.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:150`

### album

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Album name where the song appears.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:151`

### year

- **Type**: number (optional)
- **Required**: No
- **Default**: None
- **Description**: Year the song was released or recorded.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:152`

### genre

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: Musical genre of the song.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:153`

### youtubeMusic

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: YouTube Music URL for the song.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:154`

### lyrics

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: URL to retrieve lyrics for the song.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:155`

### autorIds

- **Type**: string[] (optional)
- **Required**: No
- **Default**: None
- **Description**: Array of Artista IDs who authored this song. Redundant with AUTOR_DE relationships - for performance. Relationships are source of truth.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:156`

### musicBrainzId

- **Type**: string (optional)
- **Required**: No
- **Default**: None
- **Description**: MusicBrainz ID for linking to external MusicBrainz database. Used to tie database to external source of accurate data.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:159`

### status

- **Type**: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Publication status of the song.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:157`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the song was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:158`

### updatedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the song was last updated.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:159`

## Constraints

### Uniqueness

- `id`: Unique constraint on `id` property (`id_Cancion_uniq`, `song_id`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:6,20`

### Required Fields

- `title`: NOT NULL constraint (`song_required`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:21`

### Indexes

- Full-text search index on `title` (`cancion_search`)
- Regular index on `year` (`cancion_year`, `song_year`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:35,46,47`

## Usage Patterns

- Songs are created through admin interface or import
- Songs can have multiple authors via AUTOR_DE relationships
- Songs can be versioned by multiple Jingles via VERSIONA relationships
- Title is required and used for search and display

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:145-159`
- **Constraints**: `backend/src/server/db/schema/setup.ts:6,20,21`
- **Indexes**: `backend/src/server/db/schema/setup.ts:35,46,47`
- **Import File Pattern**: `node-Cancion-YYYY-MM-DD.csv`

---

# Node Type: Fabrica

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:161-175`

## Overview

Fabrica represents a stream or broadcast episode. Each Fabrica is identified by a YouTube video ID and contains multiple Jingles that appear in it. Fabricas have metadata from YouTube including views, likes, and description.

## Properties

### id

- **Type**: string
- **Required**: Yes
- **Default**: YouTube video ID
- **Description**: YouTube video ID (11 characters). Special case - uses external YouTube video IDs, NOT subject to ID migration. Examples: 0hmxZPp0xq0, DBbyI99TtIM.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:165`

### title

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: Title of the Fabrica/stream.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:166`

### date

- **Type**: datetime
- **Required**: Yes
- **Default**: None
- **Description**: Date when the Fabrica/stream was broadcast. Required field.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:167`

### youtubeUrl

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: Full YouTube URL for the Fabrica/stream.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:168`

### visualizations

- **Type**: number
- **Required**: Yes
- **Default**: 0
- **Description**: Number of views/visualizations on YouTube.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:169`

### likes

- **Type**: number
- **Required**: Yes
- **Default**: 0
- **Description**: Number of likes on YouTube.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:170`

### description

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: Description of the Fabrica/stream from YouTube.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:171`

### contents

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: Contents based on a comment in the YouTube video.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:172`

### status

- **Type**: string (enum: DRAFT, PROCESSING, COMPLETED)
- **Required**: Yes
- **Default**: DRAFT
- **Description**: Processing status of the Fabrica. DRAFT = not yet processed, PROCESSING = being processed, COMPLETED = fully processed with all Jingles extracted.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:173`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the Fabrica was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:174`

### updatedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the Fabrica was last updated.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:175`

## Constraints

### Uniqueness

- `id`: Unique constraint on `id` property (`id_Fabrica_uniq`, `stream_id`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:7,26`

### Required Fields

- `date`: NOT NULL constraint (`stream_required`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:27`

### Indexes

- Regular index on `date` (`fabrica_date`, `stream_date`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:44,45`

## Usage Patterns

- Fabricas are created when YouTube videos are imported
- Each Fabrica contains multiple Jingles via APPEARS_IN relationships
- Fabricas are identified by YouTube video ID (external identifier)
- Status tracks processing pipeline (DRAFT → PROCESSING → COMPLETED)

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:161-175`
- **Constraints**: `backend/src/server/db/schema/setup.ts:7,26,27`
- **Indexes**: `backend/src/server/db/schema/setup.ts:44,45`
- **Import File Pattern**: `node-Fabrica-YYYY-MM-DD.csv`

---

# Node Type: Tematica

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-27
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/schema/schema.ts:177-187`

## Overview

Tematica represents a thematic category or topic. Jingles can be tagged with multiple Tematicas to enable categorization and filtering. Tematicas have categories for organization.

## Properties

### id

- **Type**: string
- **Required**: Yes
- **Default**: Auto-generated
- **Description**: Unique identifier following format `t{8-chars}` (e.g., t3k8m2n1, tx5y4z3w2). Uses base36 alphanumeric characters (0-9, a-z), lowercase.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:181`

### name

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: Name of the thematic category. Must be unique. Required field.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:182`

### category

- **Type**: string (optional, enum: ACTUALIDAD, POLITICA, CULTURA, GENTE, GELATINA)
- **Required**: No
- **Default**: None
- **Description**: Category grouping for the tematica. Used for organization and filtering.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:183`

### description

- **Type**: string
- **Required**: Yes
- **Default**: None
- **Description**: Description of the thematic category.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:184`

### status

- **Type**: string (optional, enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED)
- **Required**: No
- **Default**: DRAFT
- **Description**: Publication status of the tematica.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:185`

### createdAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the tematica was created.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:186`

### updatedAt

- **Type**: datetime
- **Required**: Yes
- **Default**: Current timestamp
- **Description**: Timestamp when the tematica was last updated.
- **Code Reference**: `backend/src/server/db/schema/schema.ts:187`

## Constraints

### Uniqueness

- `id`: Unique constraint on `id` property (`id_Tematica_uniq`)
- `name`: Unique constraint on `name` property
- **Code Reference**: `backend/src/server/db/schema/setup.ts:9`

### Required Fields

- `name`: NOT NULL constraint (`term_name`)
- `id`: NOT NULL constraint (`term_required`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:23,24`

### Indexes

- Full-text search index on `name`, `description` (`tematica_search`, `term_search`)
- Regular index on `category` (`term_category`)
- **Code Reference**: `backend/src/server/db/schema/setup.ts:33,39,48`

## Usage Patterns

- Tematicas are created through admin interface
- Jingles are tagged with Tematicas via TAGGED_WITH relationships
- Multiple Jingles can share the same Tematica
- Category enables filtering and organization
- Name must be unique

## Implementation

- **Schema Definition**: `backend/src/server/db/schema/schema.ts:177-187`
- **Constraints**: `backend/src/server/db/schema/setup.ts:9,23,24`
- **Indexes**: `backend/src/server/db/schema/setup.ts:33,39,48`
- **Import File Pattern**: `node-Tematica-YYYY-MM-DD.csv`

---

## Change History

- **2025-01-27**: Initial documentation created from `schema.ts` and `setup.ts`
