# Admin Portal - Detailed Specification for Refactoring

**Document Version:** 1.0  
**Date:** November 14, 2025  
**Status:** Draft for Review  
**Purpose:** Bridge between functional specification, UX design, and refactoring implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Overview](#current-architecture-overview)
3. [Pages and Routes Catalogue](#pages-and-routes-catalogue)
4. [Components Catalogue](#components-catalogue)
5. [Entity Specifications](#entity-specifications)
6. [Relationship Specifications](#relationship-specifications)
7. [Metadata Field Specifications](#metadata-field-specifications)
8. [New Entity Creation Flows](#new-entity-creation-flows)
9. [Search Logic and Triggers](#search-logic-and-triggers)
10. [API Calls Analysis](#api-calls-analysis)
11. [Behavioral Variations and Inconsistencies](#behavioral-variations-and-inconsistencies)
12. [Default Values and Mandatory Fields](#default-values-and-mandatory-fields)
13. [Database Schema Considerations](#database-schema-considerations)
14. [Refactoring Recommendations](#refactoring-recommendations)
15. [Implementation Sequence](#implementation-sequence)

---

## 1. Executive Summary

### Current State

The Admin Portal currently implements a **hybrid architecture** where entity detail pages use:

- A unified `AdminEntityAnalyze` page (Route: `/admin/:entityType/:entityId`)
- The `RelatedEntities` component in Admin Mode for relationship management
- `EntityMetadataEditor` for inline entity property editing
- Various helper components for forms and relationship creation

**Key Issues Identified:**

1. **Inconsistent Relationship Creation**: Different flows for different entity/relationship combinations
2. **Metadata Field Variations**: Different entities show different field orderings, edit behaviors, and validations
3. **Search Integration**: Multiple search implementations with varying behaviors
4. **Visibility of New Relationships**: Not always immediately visible after creation
5. **Mandatory Field Handling**: Inconsistent validation across entity types
6. **Default Value Application**: Not consistently applied on entity creation

### Refactoring Goals

1. **Establish Default Behavior**: Define consistent patterns for all common operations
2. **Document Exceptions**: Clearly identify where entity-specific logic is needed
3. **Improve Relationship Management**: Make relationship creation/editing consistent
4. **Enhance UX**: Ensure new entities/relationships are immediately visible
5. **Optimize Performance**: Consider DB schema changes to improve query performance

---

## 2. Current Architecture Overview

### High-Level Structure

```
/admin
├── /login                          → AdminLogin
├── /dashboard                      → AdminDashboard (entity counts, quick actions)
├── /search                         → AdminHome (entity search/selection)
├── /:entityType                    → AdminEntityList (list of entities)
└── /:entityType/:entityId          → AdminEntityAnalyze (detail page)
```

### Component Hierarchy for Entity Detail Pages

```
AdminEntityAnalyze
├── EntityCard (variant="heading")
│   └── Displays entity title/name with Edit button
├── EntityMetadataEditor
│   ├── Displays entity properties as editable fields
│   └── Handles save/cancel operations
└── RelatedEntities (isAdmin={true})
    ├── Loads all relationships eagerly
    ├── Displays related entities grouped by relationship type
    └── Provides interface for adding/removing relationships
```

### Data Flow

```
User Action → Component State → API Call → Database Update → Re-fetch Entity → UI Update
```

**Current Issue**: Sometimes the re-fetch doesn't happen or doesn't include newly created relationships.

---

## 3. Pages and Routes Catalogue

### 3.1 Admin Portal Entry Point

| Route              | Component        | Purpose                                     | Authentication |
| ------------------ | ---------------- | ------------------------------------------- | -------------- |
| `/admin`           | `AdminPage`      | Route wrapper with authentication check     | Yes            |
| `/admin/login`     | `AdminLogin`     | Login form                                  | No             |
| `/admin/dashboard` | `AdminDashboard` | Main dashboard with stats and quick actions | Yes            |

### 3.2 Entity List Pages

| Route      | Component         | Entity Type | Purpose            |
| ---------- | ----------------- | ----------- | ------------------ |
| `/admin/f` | `AdminEntityList` | Fabrica     | List all Fabricas  |
| `/admin/j` | `AdminEntityList` | Jingle      | List all Jingles   |
| `/admin/c` | `AdminEntityList` | Cancion     | List all Canciones |
| `/admin/a` | `AdminEntityList` | Artista     | List all Artistas  |
| `/admin/t` | `AdminEntityList` | Tematica    | List all Tematicas |
| `/admin/u` | `AdminEntityList` | Usuario     | List all Usuarios  |

**Implementation**: All use the same `AdminEntityList` component which renders `EntityList` with appropriate configuration.
**PROPOSED**: refine the sorting of the entities, adopt the criteria from the RelatedEntities component.
**PROPOSED**: Add a "New" button to the AdminEntityList component to create a new entity of the selected type at the end of the existing list.

### 3.3 Entity Detail Pages (Current - Unified Approach)

| Route          | Component            | Entity Type | Relationships Shown                          |
| -------------- | -------------------- | ----------- | -------------------------------------------- |
| `/admin/f/:id` | `AdminEntityAnalyze` | Fabrica     | Jingles (appears_in)                         |
| `/admin/j/:id` | `AdminEntityAnalyze` | Jingle      | Fabrica, Cancion, Autor, Jinglero, Tematicas |
| `/admin/c/:id` | `AdminEntityAnalyze` | Cancion     | Autor, Jingles (versiona)                    |
| `/admin/a/:id` | `AdminEntityAnalyze` | Artista     | Canciones (autor_de), Jingles (jinglero_de)  |
| `/admin/t/:id` | `AdminEntityAnalyze` | Tematica    | Jingles (tagged_with)                        |

**Key Behavior**:

- All entity types share the same page component (`AdminEntityAnalyze`)
- Relationships are configured via `relationshipConfigs.ts`
- Metadata fields are configured in `EntityMetadataEditor`
  **QUESTION**: Should we consider a metadataConfig.ts approach for the MetadataEditor?

### 3.4 Legacy/Redirect Routes

| Route                 | Current Behavior            | Notes                                     |
| --------------------- | --------------------------- | ----------------------------------------- |
| `/admin/fabrica/:id`  | Redirects to `/admin/f/:id` | Legacy route maintained for compatibility |
| `/admin/jingle/:id`   | Redirects to `/admin/j/:id` | Legacy route maintained for compatibility |
| `/admin/cancion/:id`  | Redirects to `/admin/c/:id` | Legacy route maintained for compatibility |
| `/admin/artista/:id`  | Redirects to `/admin/a/:id` | Legacy route maintained for compatibility |
| `/admin/tematica/:id` | Redirects to `/admin/t/:id` | Legacy route maintained for compatibility |

**01_PROPOSED**: Remove these legacy routes as they are not used.

### 3.5 Search and Selection

| Route           | Component   | Purpose                             |
| --------------- | ----------- | ----------------------------------- |
| `/admin/search` | `AdminHome` | Search/select entities for analysis |

**Behavior**: Provides dropdowns for each entity type, allowing admin to select and navigate to entity detail page.

**QUESTION**: If we implement a search bar in the AdminDashboard, do we need this route?

---

## 4. Components Catalogue

### 4.1 Core Admin Components

#### AdminEntityAnalyze

**Location**: `frontend/src/pages/admin/AdminEntityAnalyze.tsx`

**Purpose**: Unified entity detail page for all entity types

**Key Features**:

- Loads entity from admin API
- Displays entity heading with EntityCard
- Shows EntityMetadataEditor for property editing
- Renders RelatedEntities in Admin Mode
- Handles unsaved changes modal
- Manages edit state across components

**Props**: Uses URL params (`entityType`, `entityId`)

**State Management**:

- `entity`: Current entity data
- `loading`: Loading state
- `error`: Error message
- `isEditing`: Edit mode flag
- `pendingNavigation`: For unsaved changes handling

**Refs**:

- `metadataEditorRef`: Access to metadata editor methods
- `relatedEntitiesRef`: Access to relationship properties

#### EntityMetadataEditor

**Location**: `frontend/src/components/admin/EntityMetadataEditor.tsx`

**Purpose**: Inline editing of entity metadata fields

**Key Features**:

- Displays entity properties as rows
- Supports various input types (text, textarea, checkbox, dropdown)
- Custom field ordering per entity type
- Excludes auto-managed and redundant fields
- Handles save/cancel operations
- Exposes `hasUnsavedChanges()` and `save()` methods via ref

**Field Configuration**:

- `FIELD_ORDER`: Custom ordering per entity type
- `EXCLUDED_FIELDS`: Fields not shown in editor
- `FIELD_OPTIONS`: Dropdown options (status, category, nationality)
- `TEXTAREA_FIELDS`: Fields rendered as textareas

**Special Behaviors**:

- Fabricas: `youtubeUrl` is read-only (auto-generated from id), `date` has day/month/year inputs, `status` dropdown
  **QUESTION**: Considering a date-picker component for the date field?
- Jingles: `id` is read-only, multiple boolean flags
  **QUESTION**: why flagging the `id` being read-only? It is the default behaviour- Fabrica is the exception.
- Canciones: Standard text fields
- Artistas: `nationality` has searchable dropdown with all countries
- Tematicas: `category` dropdown with predefined values

#### RelatedEntities (Admin Mode)

**QUESTION**: I am not sure how RelatedEntities works, when compared to the MetadataEditor.

**Location**: `frontend/src/components/common/RelatedEntities.tsx`

**Purpose**: Display and manage entity relationships

**Key Features (Admin Mode)**:

- Eager loading of all relationships
- No cycle prevention
- All relationships visible by default
- Blank rows for adding new relationships
  **QUESTION**: Considering the suggestion to make an explicit "Enter edit mode" behaviour, should the blank rows be hidden until the "Edit mode" is activated?

  **ISSUE**: ```The Jingle has 3 key anomalies in the relationships setup:

  1. It can have 0 or 1 Fabrica relationship - so if the relationship is present I would not expect a blank row for the Fabrica relationship
  2. It can have 0 or 1 Cancion relationship - so if the relationship is present I would not expect a blank row for the Cancion relationship
  3. The Autor is a second order relationship (Jingle -> VERSIONA -> Cancion -> AUTOR_DE -> Artista) - so it could be a read-only relationship derived from the Cancion, or completely hidden if no Cancion is associated to the Jingle.```

- Delete buttons for existing relationships
  **ISSUE**: This is not implemented yet, the buttons are not showing (?)
- Relationship property editing
  **QUESTION**: Should it expose `hasUnsavedChanges()` and `save()` methods via ref, like EntityMetadataEditor?

**Props (Admin-specific)**:

- `isAdmin={true}`: Enables admin mode
- `isEditing`: Controls edit state
- `onEditToggle`: Callback to toggle edit mode
- `initialRelationshipData`: Pre-populate relationships
- `onNavigateToEntity`: Handle navigation with unsaved changes check

**Configuration**:

- Relationship configs in `lib/utils/relationshipConfigs.ts`
- Fetch functions in `lib/services/relationshipService.ts`

#### EntityForm

**Location**: `frontend/src/components/admin/EntityForm.tsx`

**Purpose**: Create or edit entities with form validation
**QUESTION**: Could we use the same component for creating and editing entities? If not - consider approaches to ensure a consistent UX.

**Key Features**:

- Dynamic field generation based on entity type
- Field validation (required fields, types)
- Auto-validation after entity creation/update
- Navigation to entity detail page after creation

**Modes**:

- `create`: Create new entity
- `edit`: Update existing entity
  **QUESTION**: When is the edit mode activated?

**Field Configuration**:

```typescript
const FIELDS_BY_TYPE: Record<
  string,
  { name: string; label?: string; required?: boolean }[]
>;
```

#### RelationshipForm

**Location**: `frontend/src/components/admin/RelationshipForm.tsx`

**Purpose**: Create relationships between entities

**Key Features**:

- Loads available entities for start and end nodes
- Supports pre-set start or end (from context)
- Allows hiding preset fields
- Supports additional relationship properties

**Relationship Schema**:

```typescript
const RELATIONSHIP_SCHEMA: Record<string, { start: string; end: string }>;
```

### 4.2 Supporting Components

#### EntityList

**Location**: `frontend/src/components/admin/EntityList.tsx`

**Purpose**: Display paginated list of entities with actions

**Features**:

- Pagination
- Sort/filter (if implemented)
- Bulk actions
- Quick navigation to entity detail

#### EntityCard

**Location**: `frontend/src/components/common/EntityCard.tsx`

**Purpose**: Display entity information in various formats

**Variants**:

- `heading`: Title/name display with optional edit button
- `contents`: Content row with indentation support
- `box`: Card-style display
  **QUESTION**: when is `box` variant used? Is this the search view to look for new entities in RelatedEntities?

**Admin Features**:

- `showAdminEditButton`: Show edit button in heading variant
- `isEditing`: Visual indicator of edit mode

#### UnsavedChangesModal

**Location**: `frontend/src/components/admin/UnsavedChangesModal.tsx`

**Purpose**: Warn user about unsaved changes

**Actions**:

- Discard: Continue navigation, lose changes
- Save: Save changes, then navigate
- Cancel: Return to editing

### 4.3 Validation Components

#### KnowledgeGraphValidator

**Location**: `frontend/src/components/admin/KnowledgeGraphValidator.tsx`

**Purpose**: Validate entity integrity and relationships

#### DataIntegrityChecker

**Location**: `frontend/src/components/admin/DataIntegrityChecker.tsx`

**Purpose**: Check data integrity across multiple entities

#### RelationshipValidator

**Location**: `frontend/src/components/admin/RelationshipValidator.tsx`

**Purpose**: Validate specific relationships

---

## 5. Entity Specifications

### 5.1 Fabrica

**Database Label**: `Fabrica`  
**API Endpoint**: `/api/admin/fabricas`  
**Route Prefix**: `f`

#### Properties

| Field            | Type     | Required | Editable  | Default        | Notes                                                      |
| ---------------- | -------- | -------- | --------- | -------------- | ---------------------------------------------------------- |
| `id`             | string   | Yes      | Yes       | -              | YouTube video ID, editable in admin                        |
| `title`          | string   | No       | Yes       | -              | Fabrica title                                              |
| `date`           | datetime | Yes      | Yes       | -              | Date of Fabrica, shown as day/month/year inputs            |
| `youtubeUrl`     | string   | Yes      | Read-only | Auto-generated | Derived from `id`: `https://www.youtube.com/watch?v=${id}` |
| `visualizations` | number   | No       | No        | 0              | Auto-managed by YouTube sync                               |
| `likes`          | number   | No       | No        | 0              | Auto-managed by YouTube sync                               |
| `description`    | string   | No       | Yes       | -              | Fabrica description, textarea                              |
| `contents`       | string   | No       | Yes       | -              | Contents from YouTube comment, textarea                    |
| `status`         | enum     | Yes      | Yes       | `DRAFT`        | Dropdown: DRAFT, PROCESSING, COMPLETED                     |
| `createdAt`      | datetime | Yes      | No        | Auto           | Auto-managed                                               |
| `updatedAt`      | datetime | Yes      | No        | Auto           | Auto-managed                                               |

#### Relationships (Outgoing)

| Relationship | Target | Cardinality | Label in UI | Properties |
| ------------ | ------ | ----------- | ----------- | ---------- |
| None         | -      | -           | -           | -          |

#### Relationships (Incoming)

| Relationship | Source | Cardinality | Label in UI | Properties                             |
| ------------ | ------ | ----------- | ----------- | -------------------------------------- |
| `APPEARS_IN` | Jingle | Many        | Jingles     | `order` (number), `timestamp` (number) |

#### Field Display Order (Edit Mode)

1. `id`
2. `title`
3. `date` (broken into day/month/year) **PROPOSED**: Use a date-picker component
4. `status`
5. `youtubeUrl` (read-only, shown for reference)
6. `description` (if present) **PROPOSED**: Remove for now - treat in the same way than visualizations and likes (future feature - Auto-managed by YouTube sync)
7. `contents` (if present) **PROPOSED**: Show always

#### Mandatory Fields for Creation

- `id`
- `title`
- `date`

**Validation Rules**:

- `id` must be valid YouTube video ID format
- `date` must be valid date
- `status` must be one of: DRAFT, PROCESSING, COMPLETED

### 5.2 Jingle

**Database Label**: `Jingle`  
**API Endpoint**: `/api/admin/jingles`  
**Route Prefix**: `j`

#### Properties

| Field              | Type     | Required | Editable  | Default   | Notes                                     |
| ------------------ | -------- | -------- | --------- | --------- | ----------------------------------------- |
| `id`               | string   | Yes      | Read-only | Auto-UUID | Auto-generated UUID, read-only in edit    |
| `title`            | string   | No       | Yes       | -         | Jingle title                              |
| `youtubeUrl`       | string   | No       | No        | Inherited | Derived from Fabrica relationship         |
| `timestamp`        | number   | No       | No        | Inherited | Derived from APPEARS_IN relationship      |
| `youtubeClipUrl`   | string   | No       | Yes       | -         | YouTube clip URL                          |
| `comment`          | string   | No       | Yes       | -         | Admin comment, textarea                   |
| `lyrics`           | string   | No       | Yes       | -         | Jingle lyrics, textarea                   |
| `songTitle`        | string   | No       | No        | Inherited | Derived from Cancion relationship         |
| `artistName`       | string   | No       | No        | Inherited | Derived from Cancion→Artista relationship |
| `genre`            | string   | No       | No        | Inherited | Derived from Cancion relationship         |
| `isJinglazo`       | boolean  | Yes      | Yes       | false     | Boolean flag                              |
| `isJinglazoDelDia` | boolean  | Yes      | Yes       | false     | Boolean flag                              |
| `isPrecario`       | boolean  | Yes      | Yes       | false     | Boolean flag                              |
| `isLive`           | boolean  | No       | Yes       | false     | Boolean flag                              |
| `isRepeat`         | boolean  | No       | Yes       | false     | Boolean flag                              |
| `fabricaId`        | string   | No       | No        | Redundant | Redundant with APPEARS_IN, auto-managed   |
| `fabricaDate`      | datetime | No       | No        | Redundant | Redundant with Fabrica.date, auto-managed |
| `cancionId`        | string   | No       | No        | Redundant | Redundant with VERSIONA, auto-managed     |
| `createdAt`        | datetime | Yes      | No        | Auto      | Auto-managed                              |
| `updatedAt`        | datetime | Yes      | No        | Auto      | Auto-managed                              |

#### Relationships (Outgoing)

| Relationship  | Target   | Cardinality | Label in UI | Properties                             |
| ------------- | -------- | ----------- | ----------- | -------------------------------------- |
| `APPEARS_IN`  | Fabrica  | One         | Fabrica     | `order` (number), `timestamp` (number) |
| `VERSIONA`    | Cancion  | One         | Cancion     | `status` (enum: DRAFT, CONFIRMED)      |
| `TAGGED_WITH` | Tematica | Many        | Tematicas   | `isPrimary` (boolean), `status` (enum) |

#### Relationships (Incoming)

| Relationship  | Source  | Cardinality | Label in UI | Properties                        |
| ------------- | ------- | ----------- | ----------- | --------------------------------- |
| `JINGLERO_DE` | Artista | Many        | Jinglero    | `status` (enum: DRAFT, CONFIRMED) |

#### Special Relationships (Derived)

| Label in UI | Derived From                             | Description                   |
| ----------- | ---------------------------------------- | ----------------------------- |
| Autor       | Jingle→VERSIONA→Cancion→AUTOR_DE→Artista | Authors of the versioned song |

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `title`
3. `isJinglazo`
4. `isJinglazoDelDia`
5. `isPrecario`
6. `isLive`
7. `isRepeat`
8. `comment`
9. `youtubeClipUrl` (if present) **PROPOSED**: Show always
10. `lyrics` (if present) **PROPOSED**: Show always

**Excluded from Editor** (inherited/derived):

- `youtubeUrl`, `timestamp`, `songTitle`, `artistName`, `genre`
- `fabricaId`, `fabricaDate`, `cancionId`

#### Mandatory Fields for Creation

- None (all optional except `id` which is auto-generated)

**Validation Rules**:

- At least one of `title`, `comment` should be provided for usability
- If `isJinglazoDelDia` is true, `isJinglazo` should also be true (warning, not error)

### 5.3 Cancion

**Database Label**: `Cancion`  
**API Endpoint**: `/api/admin/canciones`  
**Route Prefix**: `c`

#### Properties

| Field          | Type     | Required | Editable  | Default   | Notes                                  |
| -------------- | -------- | -------- | --------- | --------- | -------------------------------------- |
| `id`           | string   | Yes      | Read-only | Auto-UUID | Auto-generated UUID, read-only in edit |
| `title`        | string   | Yes      | Yes       | -         | Song title                             |
| `album`        | string   | No       | Yes       | -         | Album name                             |
| `year`         | number   | No       | Yes       | -         | Release year                           |
| `genre`        | string   | No       | Yes       | -         | Music genre                            |
| `youtubeMusic` | string   | No       | Yes       | -         | YouTube Music link                     |
| `lyrics`       | string   | No       | Yes       | -         | Lyrics URL, textarea                   |
| `autorIds`     | string[] | No       | No        | Redundant | Redundant with AUTOR_DE, auto-managed  |
| `createdAt`    | datetime | Yes      | No        | Auto      | Auto-managed                           |
| `updatedAt`    | datetime | Yes      | No        | Auto      | Auto-managed                           |

#### Relationships (Outgoing)

| Relationship | Target | Cardinality | Label in UI | Properties |
| ------------ | ------ | ----------- | ----------- | ---------- |
| None         | -      | -           | -           | -          |

#### Relationships (Incoming)

| Relationship | Source  | Cardinality | Label in UI | Properties                        |
| ------------ | ------- | ----------- | ----------- | --------------------------------- |
| `AUTOR_DE`   | Artista | Many        | Autor       | `status` (enum: DRAFT, CONFIRMED) |
| `VERSIONA`   | Jingle  | Many        | Jingles     | `status` (enum: DRAFT, CONFIRMED) |

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `title`
3. `album`
4. `year`
5. `genre`
6. `youtubeMusic`
7. `lyrics`

#### Mandatory Fields for Creation

- `title`

**Validation Rules**:

- `title` must not be empty
- `year` must be a valid year (1900-current year) if provided

### 5.4 Artista

**Database Label**: `Artista`  
**API Endpoint**: `/api/admin/artistas`  
**Route Prefix**: `a`

#### Properties

| Field         | Type    | Required | Editable  | Default   | Notes                                          |
| ------------- | ------- | -------- | --------- | --------- | ---------------------------------------------- |
| `id`          | string  | Yes      | Read-only | Auto-UUID | Auto-generated UUID, read-only in edit         |
| `name`        | string  | Yes      | Yes       | -         | Artist's real name                             |
| `stageName`   | string  | No       | Yes       | -         | Artist's stage name                            |
| `idUsuario`   | string  | No       | No        | Inherited | Derived from SOY_YO relationship, auto-managed |
| `nationality` | string  | No       | Yes       | -         | Searchable dropdown with all countries         |
| `isArg`       | boolean | Yes      | Yes       | false     | Is from Argentina                              |

**PROPOSED**: Auto-managed from `nationality` if = 'Argentina'
| `youtubeHandle` | string | No | Yes | - | YouTube handle |
| `instagramHandle` | string | No | Yes | - | Instagram handle |
| `twitterHandle` | string | No | Yes | - | Twitter handle |
| `facebookProfile` | string | No | Yes | - | Facebook profile |
| `website` | string | No | Yes | - | Artist website |
| `bio` | string | No | Yes | - | Biography, textarea |
| `createdAt` | datetime | Yes | No | Auto | Auto-managed |
| `updatedAt` | datetime | Yes | No | Auto | Auto-managed |

#### Relationships (Outgoing)

| Relationship  | Target  | Cardinality | Label in UI | Properties                        |
| ------------- | ------- | ----------- | ----------- | --------------------------------- |
| `AUTOR_DE`    | Cancion | Many        | Canciones   | `status` (enum: DRAFT, CONFIRMED) |
| `JINGLERO_DE` | Jingle  | Many        | Jingles     | `status` (enum: DRAFT, CONFIRMED) |

#### Relationships (Incoming)

| Relationship | Source  | Cardinality | Label in UI | Properties                                  |
| ------------ | ------- | ----------- | ----------- | ------------------------------------------- |
| `SOY_YO`     | Usuario | One         | Usuario     | `status`, `requestedAt`, `isVerified`, etc. |

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `name`
3. `stageName`
4. `nationality` (searchable dropdown)
5. `isArg` **PROPOSED**: hide from edit mode
6. `youtubeHandle`
7. `instagramHandle`
8. `twitterHandle`
9. `facebookProfile`
10. `website`
11. `bio`

#### Mandatory Fields for Creation

- `name`
  **PROPOSED**: Make to `name` OR `stageName` as mandatory (including the database schema configuration and validations)
  **PROPOSED**: update the configuration of the EntityCard component to show StageName as primary text, and Name if it is different. If StageName is empty, show Name as primary text.

**Validation Rules**:

- `name` must not be empty
- `nationality` should be from the predefined country list if provided
- Social media handles should be valid format (no @ prefix needed, just the handle)

### 5.5 Tematica

**Database Label**: `Tematica`  
**API Endpoint**: `/api/admin/tematicas`  
**Route Prefix**: `t`

#### Properties

| Field         | Type     | Required | Editable  | Default   | Notes                                                    |
| ------------- | -------- | -------- | --------- | --------- | -------------------------------------------------------- |
| `id`          | string   | Yes      | Read-only | Auto-UUID | Auto-generated UUID, read-only in edit                   |
| `name`        | string   | Yes      | Yes       | -         | Tematica name                                            |
| `description` | string   | No       | Yes       | -         | Description, textarea                                    |
| `category`    | enum     | No       | Yes       | -         | Dropdown: ACTUALIDAD, CULTURA, GELATINA, GENTE, POLITICA |
| `createdAt`   | datetime | Yes      | No        | Auto      | Auto-managed                                             |
| `updatedAt`   | datetime | Yes      | No        | Auto      | Auto-managed                                             |

#### Relationships (Outgoing)

| Relationship | Target | Cardinality | Label in UI | Properties |
| ------------ | ------ | ----------- | ----------- | ---------- |
| None         | -      | -           | -           | -          |

#### Relationships (Incoming)

| Relationship  | Source | Cardinality | Label in UI | Properties                             |
| ------------- | ------ | ----------- | ----------- | -------------------------------------- |
| `TAGGED_WITH` | Jingle | Many        | Jingles     | `isPrimary` (boolean), `status` (enum) |

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `name`
3. `description`
4. `category` (dropdown)

#### Mandatory Fields for Creation

- `name`

**Validation Rules**:

- `name` must not be empty
- `name` should be unique (enforced at DB level)
- `category` must be one of the predefined values if provided

---

## 6. Relationship Specifications

### 6.1 APPEARS_IN (Jingle → Fabrica)

**Direction**: Jingle (start) → Fabrica (end)  
**Cardinality**: Many Jingles can appear in One Fabrica  
**API Endpoint**: `/api/admin/relationships/appears_in`

#### Properties

| Property    | Type   | Required | Editable | Default        | Description                               |
| ----------- | ------ | -------- | -------- | -------------- | ----------------------------------------- |
| `order`     | number | No       | Yes      | Auto-increment | Order of Jingle in Fabrica                |
| `timestamp` | number | Yes      | Yes      | -              | Timestamp in seconds where Jingle appears |

#### Creation Context

**From Jingle Page** (creating new Fabrica):

- Pre-populate: None specific
- User must provide: Fabrica ID, date, timestamp

**From Fabrica Page** (creating new Jingle):

- Pre-populate: `fabricaId` is set automatically
- User must provide: `timestamp` (required)

#### Redundant Properties Managed

- Jingle.`fabricaId` ← Fabrica.`id`
- Jingle.`fabricaDate` ← Fabrica.`date`
- Jingle.`youtubeUrl` ← Derived from Fabrica.`youtubeUrl` + `timestamp`

#### Display in UI

**In Jingle Detail Page**:

- Label: "Fabrica"
- Shows: Single Fabrica entity
- Expandable to show: `order`, `timestamp` properties

**In Fabrica Detail Page**:

- Label: "Jingles"
- Shows: List of Jingles
- Sort by: `timestamp` (ascending)
- Expandable to show: `order`, `timestamp` properties

### 6.2 VERSIONA (Jingle → Cancion)

**Direction**: Jingle (start) → Cancion (end)  
**Cardinality**: Many Jingles can version One Cancion  
**API Endpoint**: `/api/admin/relationships/versiona`

#### Properties

| Property    | Type     | Required | Editable | Default | Description        |
| ----------- | -------- | -------- | -------- | ------- | ------------------ |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed       |

#### Creation Context

**From Jingle Page** (creating new Cancion):

- Pre-populate: None specific
- User must provide: Cancion title (mandatory)

**From Cancion Page** (creating new Jingle):

- Pre-populate: None specific (could inherit title)
- User must provide: Jingle details

#### Redundant Properties Managed

- Jingle.`cancionId` ← Cancion.`id`
- Jingle.`songTitle` ← Cancion.`title`
- Jingle.`genre` ← Cancion.`genre`

#### Derived Properties

- Jingle.`artistName` ← Cancion→AUTOR_DE→Artista.`stageName` or `name`

#### Display in UI

**In Jingle Detail Page**:

- Label: "Cancion"
- Shows: Single Cancion entity (or none)
- Expandable to show: `status` property

**In Cancion Detail Page**:

- Label: "Jingles"
- Shows: List of Jingles that version this song
- Sort by: `date` (most recent first)
- Expandable to show: `status` property

### 6.3 AUTOR_DE (Artista → Cancion)

**Direction**: Artista (start) → Cancion (end)  
**Cardinality**: Many Artistas can author Many Canciones  
**API Endpoint**: `/api/admin/relationships/autor_de`

#### Properties

| Property    | Type     | Required | Editable | Default | Description        |
| ----------- | -------- | -------- | -------- | ------- | ------------------ |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed       |

#### Creation Context

**From Artista Page** (creating new Cancion):

- Pre-populate: Author relationship will be auto-created
- User must provide: Cancion title (mandatory)

**From Cancion Page** (creating new Artista):

- Pre-populate: Author relationship will be auto-created
- User must provide: Artista name (mandatory)

**From Jingle Page** (via Cancion):

- When creating Cancion from Jingle, optionally create Artista at same time
- Relationship chain: Artista→AUTOR_DE→Cancion←VERSIONA←Jingle

**PROPOSED**: Make the AUTOR_DE relationship read-only in the Jingle Page context.

#### Redundant Properties Managed

- Cancion.`autorIds` ← Array of Artista.`id` values
- Jingle.`artistName` ← Artista.`stageName` or `name` (via Cancion)

#### Display in UI

**In Artista Detail Page**:

- Label: "Canciones"
- Shows: List of Canciones authored by this Artista
- Sort by: `title` (alphabetical)
- Expandable to show: `status` property

**In Cancion Detail Page**:

- Label: "Autor"
- Shows: List of Artistas (authors)
- Sort by: `stageName` (alphabetical)
  **PROPOSED**: If StageName is empty, use Name for sorting.
- Expandable to show: `status` property

**In Jingle Detail Page** (derived):

- Label: "Autor"
- Shows: List of Artistas (via Cancion relationship)
- Note: This is a derived relationship, not direct

### 6.4 JINGLERO_DE (Artista → Jingle)

**Direction**: Artista (start) → Jingle (end)  
**Cardinality**: Many Artistas can perform Many Jingles  
**API Endpoint**: `/api/admin/relationships/jinglero_de`

#### Properties

| Property    | Type     | Required | Editable | Default | Description        |
| ----------- | -------- | -------- | -------- | ------- | ------------------ |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed       |

#### Creation Context

**From Artista Page** (creating new Jingle):

- Pre-populate: Jinglero relationship will be auto-created
- User must provide: Jingle details, Fabrica relationship

**From Jingle Page** (creating new Artista):

- Pre-populate: Jinglero relationship will be auto-created
- User must provide: Artista name (mandatory)

#### Special Notes

**Difference from Autor**:

- `Autor` (AUTOR_DE): Original song author(s) via Cancion relationship
- `Jinglero` (JINGLERO_DE): Performer of the Jingle (may be different from autor)

**Example**:

- Cancion: "Imagine" by John Lennon (Artista) via AUTOR_DE
- Jingle: Cover of "Imagine" performed by Madonna (Artista) via JINGLERO_DE

#### Display in UI

**In Artista Detail Page**:

- Label: "Jingles"
- Shows: List of Jingles performed by this Artista
- Sort by: `date` (most recent first)
- Expandable to show: `status` property

**In Jingle Detail Page**:

- Label: "Jinglero"
- Shows: List of Artistas (performers)
- Sort by: `stageName` (alphabetical)
  **PROPOSED**: If StageName is empty, use Name for sorting.
- Expandable to show: `status` property
- Visually distinct from "Autor" section

### 6.5 TAGGED_WITH (Jingle → Tematica)

**Direction**: Jingle (start) → Tematica (end)  
**Cardinality**: Many Jingles can be tagged with Many Tematicas  
**API Endpoint**: `/api/admin/relationships/tagged_with`

#### Properties

| Property    | Type     | Required | Editable | Default | Description                               |
| ----------- | -------- | -------- | -------- | ------- | ----------------------------------------- |
| `isPrimary` | boolean  | No       | Yes      | false   | Indicates primary tematica for the Jingle |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED                        |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed                              |

#### Creation Context

**From Jingle Page** (creating new Tematica):

- Pre-populate: Tagged_with relationship will be auto-created
- User must provide: Tematica name (mandatory)

**From Tematica Page** (creating new Jingle):

- Pre-populate: Tagged_with relationship will be auto-created
- User must provide: Jingle details, Fabrica relationship
  **QUESTION**: Why is the Fabrica relationship required?

#### Business Rules

- A Jingle can have multiple Tematicas
- Only one Tematica per Jingle should have `isPrimary=true`
- If setting `isPrimary=true` on a new relationship, automatically set others to `false`

#### Display in UI

**In Jingle Detail Page**:

- Label: "Tematicas"
- Shows: List of Tematicas
- Sort by: `isPrimary` (primary first), then `category`
- Expandable to show: `isPrimary`, `status` properties
- Visual indicator for primary tematica

**In Tematica Detail Page**:

- Label: "Jingles"
- Shows: List of Jingles tagged with this Tematica
- Sort by: `date` (most recent first)
  **PROPOSED**: Sort by `isPrimary` (primary first), then `date` (most recent first).
- Expandable to show: `isPrimary`, `status` properties

### 6.6 Additional Relationships (Usuario-focused)

#### SOY_YO (Usuario → Artista)

**Direction**: Usuario (start) → Artista (end)  
**Cardinality**: One Usuario can claim One Artista  
**API Endpoint**: `/api/admin/relationships/soy_yo`

**Properties**:

- `status`: enum (REQUESTED, REJECTED, APPROVED)
  **APPROVED**: Note this `status` is more complex than the other relationships, it has a workflow to manage the approval process.
- `requestedAt`: datetime
- `isVerified`: boolean
- `verifiedAt`: datetime
- `verifiedBy`: string (admin user ID)

**Purpose**: Allows users to claim ownership of an Artista profile

**Note**: Not typically managed in Entity Detail pages, has specialized workflow

#### REACCIONA_A (Usuario → Jingle)

**Direction**: Usuario (start) → Jingle (end)  
**Cardinality**: Many Usuarios can react to Many Jingles  
**API Endpoint**: `/api/admin/relationships/reacciona_a`

**Properties**:

- `type`: enum (ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA)
- `createdAt`: datetime
- `updatedAt`: datetime
- `removedAt`: datetime (optional)

**Purpose**: User reactions/likes for Jingles

**Note**: Not typically managed in Entity Detail pages, managed via public user interface

---

## 7. Metadata Field Specifications

### 7.1 Field Types and Behaviors

#### Text Input

**Entities**: All  
**Fields**: `id`, `title`, `name`, `email`, etc.

**Behavior**:

- Standard `<input type="text">`
- Full width with padding
- Background: `#2a2a2a` (dark mode)
- Border: `1px solid #444`
- Text color: `#fff`
  **APPROVED**: - Resizable vertically
  **APPROVED**: - Word wrapping enabled

**Auto-sizing**:
**APPROVED**: - Rows calculated based on content length: `Math.max(2, Math.ceil(length / 50))`

**Edit Mode**:

- Editable (except when marked read-only)
- Changes tracked for save state

**Read-Only Mode**:

- Displayed as text with gray color `#999`
- Italic style to indicate non-editable

#### Textarea

**Entities**: All (for specific fields)  
**Fields**: `description`, `contents`, `comment`, `lyrics`, `bio`

**Behavior**:

- Multi-line `<textarea>`
- Minimum height: 60px
- Resizable vertically
- Word wrapping enabled
- Font family: inherit
- Background: `#2a2a2a`
- Border: `1px solid #444`

**Auto-sizing**:

- Rows calculated based on content length: `Math.max(2, Math.ceil(length / 50))`

#### Checkbox (Boolean)

**Entities**: Jingle, Artista  
**Fields**: `isJinglazo`, `isJinglazoDelDia`, `isPrecario`, `isLive`, `isRepeat`, `isArg`

**Display**:

- Checkbox input (16x16px)
- Label next to checkbox (clickable)
- Checkmark (✓) or cross (✗) in read-only mode
- Green checkmark color: `#4caf50`
- Gray cross color: `#999`

**Behavior**:

- Click checkbox or label to toggle
- Immediate state change
- Tracked for save state

#### Dropdown (Select)

**Entities**: Fabrica, Tematica  
**Fields**: `status` (Fabrica), `category` (Tematica)

**Options**:

- **Fabrica.status**: DRAFT, PROCESSING, COMPLETED
- **Tematica.category**: ACTUALIDAD, CULTURA, GELATINA, GENTE, POLITICA

**Behavior**:

- Standard `<select>` dropdown
- Background: `#2a2a2a`
- Border: `1px solid #444`
- Full width
- Cursor: pointer

#### Searchable Dropdown (react-select)

**Entities**: Artista  
**Fields**: `nationality`

**Options**:

- 180+ countries (Spanish names)
- Common countries at top: Argentina, España, México
- Searchable/filterable
- Clearable

**Styling**:

- Custom dark theme
- Background: `#2a2a2a`
- Highlights: `#1976d2`
- Z-index: 9999 (prevent overlap issues)

#### Date Input (Broken Down)

**Entities**: Fabrica  
**Fields**: `date`

**Behavior**:

- Three separate number inputs: day, month, year
- Day: 1-31
- Month: 1-12
- Year: 2000-2100
- Width: 50px (day, month), 80px (year)
- Center-aligned text

**Display Format** (Read-Only):

- dd/mm/yyyy (e.g., "14/11/2025")

**Internal Format**:

- Stored as ISO datetime string

**PROPOSED**: Change the date input to a date-picker component.

#### Read-Only (Auto-Generated)

**Behavior**:

- Displayed as text with gray color `#999`
- Italic style
- Non-editable

**Fields**:

- Entity IDs (Jingle, Cancion, Artista, Tematica)
- Fabrica.`youtubeUrl` (auto-generated from id)
- All `createdAt`, `updatedAt` timestamps
- Inherited/derived fields (excluded from editor)

### 7.2 Field Exclusion Rules

#### Auto-Managed Fields (Excluded from ALL entities)

- `createdAt`: Auto-set on creation
- `updatedAt`: Auto-set on every update

#### Redundant Fields (Excluded per entity)

**Jingle**:

- `fabricaId`, `fabricaDate` (managed via APPEARS_IN relationship)
- `cancionId` (managed via VERSIONA relationship)
- `youtubeUrl`, `timestamp` (inherited from Fabrica)
- `songTitle`, `artistName`, `genre` (inherited from Cancion)

**Cancion**:

- `autorIds` (managed via AUTOR_DE relationships)

**Artista**:

- `idUsuario` (managed via SOY_YO relationship)

**Fabrica**:

- `youtubeUrl` shown but read-only (auto-generated from id)

#### Derived/Inherited Fields (Not Editable)

These fields are computed from relationships and should not be directly editable:

- Any field marked "inherited" in Entity Specifications
- Relationship properties (managed via RelatedEntities component)

### 7.3 Validation Rules

#### Required Fields

**Fabrica**:

- `id` (YouTube video ID format)
- `title`
- `date`

**Jingle**:

- No mandatory fields for creation (id is auto-generated)
- Warning if both `title` and `comment` are empty

**Cancion**:

- `title`

**Artista**:

- `name`

**Tematica**:

- `name`

#### Format Validations

**YouTube Video ID** (Fabrica.id):

- Pattern: 11 characters, alphanumeric + `-` and `_`
- Example: `dQw4w9WgXcQ`

**URL Fields**:

- Must be valid URL format
- `youtubeUrl`, `youtubeClipUrl`, `youtubeMusic`, `lyrics`, `website`

**Year** (Cancion.year):

- Range: 1900 - current year

**Handles** (social media):

- No validation currently, but should not include @ prefix
- Fields: `youtubeHandle`, `instagramHandle`, `twitterHandle`

**Email** (Usuario.email):

- Standard email format validation

#### Uniqueness Constraints (Database Level)

- Usuario.`email`
- Artista.`name`
  **PROPOSED**: `name` OR `stageName` as unique (not sure about the implementation implications)
- Tematica.`name`
- Social media handles (when provided)

**PROPOSED**: Add a validation rule for Jingles order within a Fabrica - based on the time-stamp property. Allow gaps in the order, but consistent sequencing.
**QUESTION**: How to handle auto-assigning of order on creation of the relationship, particularly if time-stamp defaults to 00:00:00?

### 7.4 Field Display Order Summary

**Default Order** (if not customized):

- Alphabetical by field name

**Custom Order** (via `FIELD_ORDER` in EntityMetadataEditor):

**Fabrica**: id, title, date, status, youtubeUrl

**Jingle**: id, title, isJinglazo, isJinglazoDelDia, isPrecario, isLive, isRepeat, comment

**Cancion**: id, title, album, year, genre, youtubeMusic, lyrics

**Artista**: id, name, stageName, nationality, isArg, youtubeHandle, instagramHandle, twitterHandle, facebookProfile, website, bio

**Tematica**: id, name, description, category

---

## 8. New Entity Creation Flows

### 8.1 Creation Entry Points

#### From Dashboard

**Route**: `/admin/dashboard?create={entityType}`

**Flow**:

1. User selects entity type from dropdown
2. Clicks "Crear" button
3. Dashboard shows creation form (similar to EntityMetadataEditor)
   **QUESTION**: Could it use the SAME components as the EntityMetadataEditor?
4. User fills required fields
5. Clicks "Crear" button
6. Entity created via API
7. If created from relationship context (`fromType`, `fromId`, `relType` params), relationship is auto-created
8. Navigate to new entity detail page

**QUESTION**: As the creation has the context of fromId and toId (selected entity in the dropdown), could the creation API be triggered BEFORE the addition of relationship properties? Is there any case of mandatory relationship properties that would prevent this?

**Context Parameters**:

- `create`: Entity type route prefix (f, j, c, a, t)
- `fromType`: Source entity type (optional, for relationship context)
- `fromId`: Source entity ID (optional)
- `relType`: Relationship type (optional)
- `searchText`: Pre-populate name/title field (optional)

#### From Entity Detail Page (via Blank Row)

**Location**: RelatedEntities component in Admin Mode

**Flow**:

1. User types in blank row search field for a relationship
2. No matching entities found
3. Green "+" button appears
4. User clicks "+" button
5. Navigate to `/admin/dashboard?create={targetType}&fromType={currentType}&fromId={currentId}&relType={relationshipType}`
6. Creation form appears with relationship context
7. After entity creation, relationship is auto-created
8. Navigate back to source entity detail page
9. New entity and relationship are visible

**Search Integration**:

- Uses autocomplete search (currently not fully implemented for all entity types)
- Should search across all entities of target type
- Display format: "{id} - {title/name}"

#### From Entity List Page

**Location**: AdminEntityList component

**Flow**:

1. User clicks "Crear Nueva" button (if implemented)
2. Navigate to creation form or modal
3. User fills required fields
4. Entity created
5. Navigate to new entity detail page or refresh list

**Status**: Currently implemented via Dashboard redirect

### 8.2 Pre-Population Rules

#### From Relationship Context

**When creating Jingle from Fabrica**:

- `fabricaId` set automatically (via APPEARS_IN relationship creation)
- User must provide: `timestamp` (required for relationship)

**When creating Cancion from Jingle**:

- No pre-population (could inherit `title` from Jingle if implemented)
- Relationship auto-created after both entities exist

**When creating Artista from Cancion** (as Autor):

- No pre-population
- AUTOR_DE relationship auto-created after entity creation

**When creating Artista from Jingle** (as Jinglero):

- No pre-population
- JINGLERO_DE relationship auto-created after entity creation

**When creating Tematica from Jingle**:

- No pre-population
- TAGGED_WITH relationship auto-created after entity creation

#### From Search Context

**When creating from search with text**:

- If `searchText` parameter present, pre-populate:
  - Fabrica, Jingle, Cancion: `title` field
  - Artista, Tematica: `name` field

### 8.3 Post-Creation Actions

#### Success Path

1. **Entity Creation** via API: `POST /api/admin/{entityType}`
2. **Validation** (optional): Validate new entity via `POST /api/admin/validate/entity/{type}/{id}`
3. **Relationship Creation** (if context provided):
   - Determine start and end node IDs based on relationship direction
   - Create relationship via API: `POST /api/admin/relationships/{relType}`
4. **Navigation**:
   - If relationship context: Navigate to source entity detail page
   - Otherwise: Navigate to new entity detail page

#### Error Handling

**Entity Creation Fails**:

- Display error message inline
- Keep form data (don't clear)
- Allow user to correct and retry

**Relationship Creation Fails** (but entity created):

- Alert user: "Entidad creada, pero error al crear la relación"
- Navigate to source entity (for manual relationship creation)
- Log error for investigation

**Validation Fails** (non-blocking):

- Entity and relationship are created anyway
- Show validation issues on entity detail page
- Allow admin to fix issues later

### 8.4 Relationship Direction Mapping

**Key Challenge**: Determining correct start/end nodes for relationship creation

#### Mapping Rules

| Relationship  | Start Node | End Node | Creation Context                                                     |
| ------------- | ---------- | -------- | -------------------------------------------------------------------- |
| `APPEARS_IN`  | Jingle     | Fabrica  | Creating Jingle from Fabrica: start=newJingle, end=existingFabrica   |
|               |            |          | Creating Fabrica from Jingle: start=existingJingle, end=newFabrica   |
| `VERSIONA`    | Jingle     | Cancion  | Creating Jingle from Cancion: start=newJingle, end=existingCancion   |
|               |            |          | Creating Cancion from Jingle: start=existingJingle, end=newCancion   |
| `AUTOR_DE`    | Artista    | Cancion  | Creating Artista from Cancion: start=newArtista, end=existingCancion |
|               |            |          | Creating Cancion from Artista: start=existingArtista, end=newCancion |
| `JINGLERO_DE` | Artista    | Jingle   | Creating Artista from Jingle: start=newArtista, end=existingJingle   |
|               |            |          | Creating Jingle from Artista: start=existingArtista, end=newJingle   |
| `TAGGED_WITH` | Jingle     | Tematica | Creating Jingle from Tematica: start=newJingle, end=existingTematica |
|               |            |          | Creating Tematica from Jingle: start=existingJingle, end=newTematica |

**Implementation** (from AdminDashboard.tsx):

```typescript
// Determine start and end based on relationship direction
let startId: string;
let endId: string;

if (relType === "appears_in") {
  if (createdEntityType === "fabrica") {
    startId = fromId; // Jingle
    endId = createdEntity.id; // Fabrica
  } else {
    startId = createdEntity.id; // Jingle
    endId = fromId; // Fabrica
  }
}
// ... similar logic for other relationship types
```

---

## 9. Search Logic and Triggers

### 9.1 Search Entry Points

#### AdminHome (Entity Selection)

**Route**: `/admin/search`

**Purpose**: Search and select entities for analysis

**Behavior**:

- Displays dropdowns for each entity type
- Dropdowns populated with all entities of that type
- Format: "{id} - {title/name}"
- "ANALIZA" button navigates to entity detail page

**Limitations**:

- Not a true search (loads all entities)
- No filtering or autocomplete
- Can be slow with large datasets

#### RelatedEntities Blank Row (Future Enhancement)

**Location**: Blank rows for adding relationships

**Expected Behavior** (not fully implemented):

- User types in search field
- Autocomplete shows matching entities
- API call: `GET /api/search?q={query}&types={targetType}`
- Display results grouped by entity type **PROPOSED**: As the search is context-aware, the results will be of one entity type only.
- User selects from results
- Create relationship via API

**Current State**:

- Blank rows present but search not fully wired up
- Relationship creation works via manual selection
- "+" button for new entity creation partially implemented

### 9.2 Search API

**Current Implementation**:

- Public API: `GET /api/public/search?q={query}`
- Returns: Entities matching query across all types

**Expected Response Format**:

```typescript
{
  fabricas: Fabrica[],
  jingles: Jingle[],
  canciones: Cancion[],
  artistas: Artista[],
  tematicas: Tematica[]
}
```

**Search Fields** (what's searched):

- Fabrica: `title`, `id`
  **NOTE**: there's no need to search by `id`
- Jingle: `title`, `comment`, `id`
  **NOTE**: there's no need to search by `id`
- Cancion: `title`, `album`
  **QUESTION**: Current implementation is also showing the Cancion if its Artista is searched. I like this behaviour - but is not consistent with the documentation?
- Artista: `name`, `stageName`
- Tematica: `name`

**Performance**: Full-text search with fuzzy matching (implementation depends on Neo4j FULLTEXT indexes)

### 9.3 Autocomplete Behavior

**Expected Behavior**:

- Debounced input (300ms delay after typing stops)
- Minimum 2 characters before search
- Shows top 10 results per entity type
- Highlights matching text
- Keyboard navigation (arrow keys, enter to select)
- Escape to close dropdown

**Display Format**:

```
[Entity Type Icon] {primary field} ({id})
  {secondary field if available}
```

**PROPOSED**: the id is not necessary in the dropdown.

Examples:

- Fabrica: "🏭 La Fábrica de Jingles - 2025-11-14 (abc123xyz)"
- Jingle: "🎵 Imagine (J001)"
- Cancion: "🎶 Imagine - John Lennon (C001)"
- Artista: "🎤 Madonna (A042)"
- Tematica: "🏷️ Política (T005)"

**PROPOSED**: These are not the current icons for the various categories. Be consistent with the EntityCard component.

### 9.4 Search Triggers and Context

#### Trigger: User Types in Blank Row

**Context**:

- Current entity type
- Relationship type to create
- Target entity type (derived from relationship type)

**Actions**:

1. Debounce input
2. Call autocomplete API with target type filter
3. Display results in dropdown
4. User selects result → Create relationship
5. User types more with no results → Show "Create new" option

#### Trigger: User Clicks "+" Button

**Context**:

- Current entity type and ID
- Relationship type
- Target entity type
- Search text (optional pre-populate)

**Actions**:

1. Navigate to Dashboard with creation context
2. Show creation form
3. After creation, auto-create relationship
4. Navigate back to source entity

---

## 10. API Calls Analysis

### 10.1 Entity CRUD Operations

#### Get Entity

**Endpoints**:

- `GET /api/admin/fabricas/{id}`
- `GET /api/admin/jingles/{id}`
- `GET /api/admin/canciones/{id}`
- `GET /api/admin/artistas/{id}`
- `GET /api/admin/tematicas/{id}`

**Response**: Full entity object with all properties

**When Called**:

- Loading entity detail page (AdminEntityAnalyze)
- After entity update (to refresh data)

#### Create Entity

**Endpoints**:

- `POST /api/admin/fabricas`
- `POST /api/admin/jingles`
- `POST /api/admin/canciones`
- `POST /api/admin/artistas`
- `POST /api/admin/tematicas`

**Request Body**: Partial entity object (only provided fields)

**Response**: Full entity object with generated ID and timestamps

**When Called**:

- Entity creation from Dashboard
- Entity creation from blank row flow

#### Update Entity

**Endpoints**:

- `PUT /api/admin/fabricas/{id}`
- `PUT /api/admin/jingles/{id}`
- `PUT /api/admin/canciones/{id}`
- `PUT /api/admin/artistas/{id}`
- `PUT /api/admin/tematicas/{id}`

**Request Body**: Partial entity object (only changed fields)

**Response**: Full updated entity object

**When Called**:

- EntityMetadataEditor save operation
- Inline property updates

**Note**: PUT replaces entire entity; PATCH updates only provided fields (both supported)

#### Delete Entity

**Endpoints**:

- `DELETE /api/admin/fabricas/{id}`
- `DELETE /api/admin/jingles/{id}`
- `DELETE /api/admin/canciones/{id}`
- `DELETE /api/admin/artistas/{id}`
- `DELETE /api/admin/tematicas/{id}`

**Response**: Success confirmation

**When Called**:

- EntityEdit component (legacy page, not used in current architecture)
- Bulk delete operations (from EntityList)

**Behavior**:

- Deletes entity node
- Deletes all incoming/outgoing relationships
- **Cascade behavior** should be considered (what happens to related entities?)

**PROPOSED**: Consider the soft delete / undo functionality.
**APPROVED**: Do not delete related entities when deleting an entity.

#### List Entities

**Endpoints**:

- `GET /api/admin/fabricas`
- `GET /api/admin/jingles`
- `GET /api/admin/canciones`
- `GET /api/admin/artistas`
- `GET /api/admin/tematicas`

**Response**: Array of entity objects (full or summary)

**Query Parameters** (if implemented):

- `page`: Page number
- `limit`: Results per page
- `sort`: Sort field
- `order`: asc or desc
- `filter`: Filter criteria

**When Called**:

- AdminEntityList page load
- AdminHome dropdown population
- Autocomplete search

### 10.2 Relationship Operations

#### Get Entity Relationships

**Endpoint**: `GET /api/public/entities/{type}/{id}/relationships`

**Response**:

```typescript
{
  outgoing: Relationship[],
  incoming: Relationship[]
}

type Relationship = {
  type: string,
  target: { id: string, labels: string[], properties: {...} },
  properties: {...}
}
```

**When Called**:

- RelatedEntities component load
- EntityEdit component (displays relationships in table)

**Issue**: This is a public API endpoint being called from admin pages. Should use admin endpoint.

#### Create Relationship

**Endpoint**: `POST /api/admin/relationships`

**Request Body**:

```typescript
{
  start: string, // Start node ID
  end: string, // End node ID
  type: string, // Relationship type (e.g., "appears_in")
  properties: Record<string, any> // Relationship properties
}
```

**Response**: Created relationship object

**When Called**:

- Adding relationship from blank row
- Auto-creating relationship after entity creation
- RelationshipForm submission

#### Update Relationship

**Endpoint**: `PUT /api/admin/relationships/{relType}`

**Request Body**:

```typescript
{
  start: string,
  end: string,
  // ... updated properties
}
```

**Response**: Updated relationship object

**When Called**:

- Editing relationship properties in RelatedEntities
- Changing relationship status (DRAFT → CONFIRMED)

**Note**: Relationships are identified by (type, start, end) tuple, not by a separate ID

#### Delete Relationship

**Endpoint**: `DELETE /api/admin/relationships/{relType}`

**Request Body**:

```typescript
{
  start: string,
  end: string
}
```

**Response**: Success confirmation

**When Called**:

- Deleting relationship from EntityEdit component
- Red "X" button in RelatedEntities (if implemented)

#### Get Relationships by Type

**Endpoint**: `GET /api/admin/relationships/{relType}`

**Response**: Array of relationships of specified type

**When Called**:

- EntityEdit component (loads all relationships of types relevant to entity)

### 10.3 Relationship Visibility Issues

#### Problem Statement

**Issue**: After creating a new relationship, it's not immediately visible in the UI.

**Scenarios Where This Occurs**:

1. **Create entity from blank row**:

   - New entity created
   - Relationship created
   - Navigate back to source entity
   - New relationship NOT visible (must refresh page)

2. **Add relationship to existing entity**:

   - Select entity from dropdown
   - Create relationship via API
   - Relationship NOT immediately visible in RelatedEntities

3. **Update relationship properties**:
   - Change property value
   - Save via API
   - Updated property NOT immediately visible

#### Root Causes

1. **No re-fetch after relationship creation**: After creating relationship, component doesn't re-fetch related entities
2. **Stale initialRelationshipData**: RelatedEntities initialized with data from parent, doesn't update
3. **Cache not invalidated**: If using any caching layer, it's not invalidated after changes
4. **No WebSocket/polling**: Changes not pushed to UI in real-time

#### Current Workarounds

- Manual page refresh
- Navigate away and back to entity detail page
- Clear browser cache

#### Proposed Solutions

**Option 1: Re-fetch on relationship change**

- After creating/updating/deleting relationship, call `fetchEntity()` in parent component
- Parent passes fresh data to RelatedEntities via `initialRelationshipData`
- Pros: Simple, consistent with current architecture
- Cons: Extra API call, might be slow

**Option 2: Optimistic updates**

- Update component state immediately after API call
- If API call fails, revert to previous state
- Pros: Instant feedback, better UX
- Cons: More complex state management, risk of inconsistencies

**Option 3: Server-sent events**

- Backend pushes updates to frontend via SSE or WebSocket
- Frontend updates UI automatically
- Pros: Real-time updates, no polling needed
- Cons: Additional infrastructure, complexity

**Option 4: Invalidate and re-fetch relationships**

- RelatedEntities exposes `refresh()` method
- After relationship operations, parent calls `refresh()`
- Component re-fetches only relationships (not full entity)
- Pros: More granular, efficient
- Cons: Requires refactoring RelatedEntities

**Recommended**: Option 1 (short term) + Option 4 (long term refactoring) **APPROVED**: Option 4 is the preferred solution.

### 10.4 API Performance Considerations

#### N+1 Query Problem

**Scenario**: Loading Jingle detail page with relationships

**Current Behavior**:

1. Load Jingle entity (1 query)
2. Load Fabrica relationship (1 query)
3. Load Cancion relationship (1 query)
4. Load Autor relationships (N queries for N authors)
5. Load Jinglero relationships (M queries for M jingleros)
6. Load Tematica relationships (K queries for K tematicas)

**Total**: 3 + N + M + K queries

**Optimization Options**:

1. **Include relationships in entity fetch**:

   - Single query to get entity + all relationships
   - Response includes nested objects
   - Pros: 1 query total, fast
   - Cons: Large response size, over-fetching

2. **Batch relationship fetching**:

   - Separate endpoint: `GET /api/admin/{type}/{id}/relationships`
   - Returns all relationships in one call
   - Pros: 2 queries total (entity + relationships)
   - Cons: Still might fetch more than needed

3. **GraphQL-style queries**:
   - Client specifies which relationships to fetch
   - Server returns only requested data
   - Pros: Flexible, efficient
   - Cons: Requires GraphQL or similar implementation

**Current Implementation**: Multiple sequential queries (N+1 problem exists)

**Recommended**: Option 2 (batch relationship fetching) + implement in RelatedEntities component **APPROVED**: Option 2 is the preferred solution.

#### Caching Strategy

**Current State**: No caching implemented (every page load = fresh API calls)

**Proposed Strategy**:

1. **Browser-side caching** (short-term):

   - Cache entity data for 60 seconds
   - Invalidate on update/delete operations
   - Use React Query or SWR library

2. **Server-side caching** (long-term):

   - Cache Neo4j query results in Redis
   - Invalidate on entity/relationship changes
   - TTL: 5-10 minutes for read-heavy data

3. **ETags/Conditional requests**:
   - Server returns ETag header
   - Client sends If-None-Match header
   - Server returns 304 Not Modified if unchanged

---

## 11. Behavioral Variations and Inconsistencies

### 11.1 Field Display Inconsistencies

#### ID Field Behavior

**Inconsistency**: ID field is editable for Fabricas but read-only for all other entities.

| Entity   | ID Editable | Reason                                                |
| -------- | ----------- | ----------------------------------------------------- |
| Fabrica  | Yes         | ID is YouTube video ID, admin might need to change it |
| Jingle   | No          | UUID auto-generated, should never change              |
| Cancion  | No          | UUID auto-generated, should never change              |
| Artista  | No          | UUID auto-generated, should never change              |
| Tematica | No          | UUID auto-generated, should never change              |

**Recommendation**:

- Keep current behavior
- Document clearly that Fabrica ID is special (it's a YouTube video ID, not a UUID)
- Consider validation to ensure valid YouTube video ID format

**APPROVED**: Keep current behavior.

#### Date Field Behavior

**Inconsistency**: Date fields handled differently across entities.

| Entity  | Field         | Edit Mode                          | Display Mode            |
| ------- | ------------- | ---------------------------------- | ----------------------- |
| Fabrica | `date`        | 3 separate inputs (day/month/year) | dd/mm/yyyy format       |
| Jingle  | `fabricaDate` | Not editable (inherited)           | ISO string or formatted |
| Cancion | N/A           | N/A                                | N/A                     |

**Recommendation**:

- Standardize date display format: dd/mm/yyyy for all entities **APPROVED**
- For editable dates, use consistent input method (either date picker or broken-down inputs) **APPROVED**: Use a date-picker component.
- Fabricas: Keep broken-down inputs (user preference) **PROPOSED**: Use date-picker component.
- Consider adding year field to Cancion (currently only has numeric `year`) **REJECTED**: Keep the current behaviour.

#### Boolean Field Display

**Current Behavior**:

- Edit mode: Checkbox with label
- Read-only mode: ✓ (green) or ✗ (gray)

**Entities with Booleans**:

- Jingle: `isJinglazo`, `isJinglazoDelDia`, `isPrecario`, `isLive`, `isRepeat`
- Artista: `isArg`

**Consistency**: Good, no variations

### 11.2 Relationship Creation Inconsistencies

#### Search vs. Dropdown Selection

**Current State**: Relationship creation uses different methods depending on entity type and context.

| Context           | Method                          | Implementation Status                                   |
| ----------------- | ------------------------------- | ------------------------------------------------------- |
| From blank row    | Search field with autocomplete  | Partially implemented (UI present, API not fully wired) |
| From Dashboard    | Full entity list in dropdown    | Fully implemented (AdminHome)                           |
| From legacy pages | RelationshipForm with dropdowns | Fully implemented but not used in new pages             |

**Issue**: No unified experience for finding and selecting entities to relate.

**Recommendation**:

- Standardize on search with autocomplete for all relationship creation
- Implement autocomplete API for all entity types
- Fallback to dropdown for small entity sets (<100 items)

**APPROVED**

#### "Create New" Button Behavior

**Inconsistency**: The "+" button for creating new entities from relationship context works differently (or not at all) depending on where it's used.

**Expected Behavior**:

1. User types in blank row search field
2. No results found
3. Green "+" button appears
4. Click "+" → Navigate to creation form with context
5. After creation, relationship auto-created, navigate back

**Current Issues**:

- "+" button sometimes doesn't pass relationship type correctly
- Navigation back to source entity sometimes fails
- New relationship not visible after navigation back

**Recommendation**:

- Implement consistent "create new entity with relationship" flow
- Pass all context via URL parameters: `?create={type}&fromType={type}&fromId={id}&relType={relType}`
- Handle in AdminDashboard component (already partially implemented)
- Ensure navigation back includes entity refresh

**APPROVED**

**PROPOSED**: Add a "New" button to the AdminEntityList component to create a new entity of the selected type at the end of the existing list.

### 11.3 Save/Edit Mode Inconsistencies

#### Edit Mode Activation

**Current Behavior**:

- EntityCard heading has "Editar" button
- Clicking toggles `isEditing` flag
- Both EntityMetadataEditor and RelatedEntities respect this flag

**Inconsistency**:

- Sometimes edit mode is auto-enabled (e.g., when navigating from search)
- Sometimes edit mode must be manually enabled
- No clear indication of what triggers auto-edit

**Recommendation**:

- Always start in view mode (edit mode off) **APPROVED**
- Require explicit "Editar" button click to enter edit mode **APPROVED**
- Add URL parameter `?edit=true` to auto-enable edit mode (for deep links) **QUESTION**: Is this necessary?

**PROPOSED**: New relationships (blank rows) only appear when Edit mode is activated.

#### Save Button Behavior

**Current Behavior**:

- EntityMetadataEditor has its own "Guardar" / "Cancelar" buttons
- RelatedEntities doesn't have separate save buttons (changes saved individually)

**Inconsistency**:

- Metadata changes must be explicitly saved
- Relationship changes are saved immediately (create/delete operations)
- Relationship property edits need explicit save (not yet implemented)

**Recommendation**:

- Unify save behavior: Either save everything at once (modal approach) or save everything immediately
- Preferred: Save immediately with optimistic updates + undo option **APPROVED**
- For relationship properties: Add inline save button per relationship **PROPOSED**: Relationship changes trigger the change status and activate the "Save" / "Cancel" buttons in the EntityCard component.

#### Unsaved Changes Handling

**Current Implementation**:

- UnsavedChangesModal appears when navigating away with unsaved metadata changes
- Modal offers: Discard, Save, Cancel

**Inconsistency**:

- Only tracks metadata changes, not relationship changes
- Navigation within RelatedEntities (clicking on related entity) triggers modal
- Browser back button doesn't trigger modal (could lose changes)

**Recommendation**:

- Track all changes (metadata + relationships)
- Intercept browser back button with `beforeunload` event
- Consider auto-save draft feature

**APPROVED**

### 11.4 Error Handling Inconsistencies

#### API Error Display

**Current Behavior**: Errors displayed differently across components

| Component                    | Error Display                         |
| ---------------------------- | ------------------------------------- |
| EntityMetadataEditor         | Red box above form with error message |
| AdminDashboard creation form | Red box below header                  |
| RelatedEntities              | Console log only (no UI feedback)     |
| EntityForm                   | Red box above form                    |

**Recommendation**:

- Standardize error display component
- Show errors as dismissible toast notifications
- Keep critical errors as modal dialogs
- Log all errors to console for debugging

**APPROVED**

#### Validation Error Handling

**Current Behavior**:

- Field-level validation on blur (for required fields)
- Form-level validation on submit
- Server-side validation errors returned in API response

**Inconsistency**:

- Field validation doesn't always match server validation
- Error messages sometimes generic ("Error al guardar") vs. specific field errors
- No visual indication of which field has error

**Recommendation**:

- Implement consistent validation library (e.g., Zod, Yup)
- Share validation schemas between frontend and backend
- Always highlight invalid fields with red border
- Show specific error message below field

**APPROVED**

#### Network Error Handling

**Current Behavior**:

- Network errors shown as "API Error: 500 Internal Server Error"
- No retry mechanism
- No offline detection

**Recommendation**:

- Detect network errors vs. server errors
- Implement retry logic for transient failures (with exponential backoff)
- Show user-friendly messages ("Network connection lost, retrying...")
- Add offline mode detection

**APPROVED**

---

## 12. Default Values and Mandatory Fields

### 12.1 Mandatory Fields Summary

#### Fabrica

**Required on Creation**:

- `id` (YouTube video ID)
- `title`
- `date`

**Required Always** (database constraints):

- `youtubeUrl` (auto-generated from id)
- `status` (defaults to DRAFT)

#### Jingle

**Required on Creation**:

- None (all fields optional)

**Required Always** (database constraints):

- `id` (auto-generated UUID)
- `isJinglazo` (defaults to false)
- `isJinglazoDelDia` (defaults to false)
- `isPrecario` (defaults to false)

**PROPOSED**: remove the DB requirement for the booleans

**Recommended** (for usability):

- At least one of: `title`, `comment` (to identify the Jingle)

**APPROVED**

#### Cancion

**Required on Creation**:

- `title`

**Required Always** (database constraints):

- `id` (auto-generated UUID)
- `title`

#### Artista

**Required on Creation**:

- `name` **PROPOSED**: Make to `name` OR `stageName` as mandatory (At least one of the two is required)

**Required Always** (database constraints):

- `id` (auto-generated UUID)
- `name`
- `isArg` (defaults to false) **PROPOSED**: remove DB constraint

#### Tematica

**Required on Creation**:

- `name`

**Required Always** (database constraints):

- `id` (auto-generated UUID)
- `name`

### 12.2 Default Values

#### Boolean Fields

All boolean fields default to `false` if not provided:

- Jingle: `isJinglazo`, `isJinglazoDelDia`, `isPrecario`, `isLive`, `isRepeat`
- Artista: `isArg`

#### Enum Fields

**Fabrica.status**: Defaults to `DRAFT`

Options: DRAFT, PROCESSING, COMPLETED

**Relationship.status** (where applicable): Defaults to `DRAFT`

Options: DRAFT, CONFIRMED

**TAGGED_WITH.isPrimary**: Defaults to `false`

#### Timestamp Fields

**createdAt**: Set to current timestamp on entity creation

**updatedAt**: Set to current timestamp on entity creation and every update

#### Numeric Fields

**Fabrica.visualizations**: Defaults to `0`

**Fabrica.likes**: Defaults to `0`

**Usuario.contributionsCount**: Defaults to `0`

### 12.3 Derived/Inherited Defaults

#### Jingle Properties Derived from Relationships

When creating a Jingle with relationships, these fields are auto-populated:

**From APPEARS_IN → Fabrica**:

- `fabricaId` ← Fabrica.`id`
- `fabricaDate` ← Fabrica.`date`
- `youtubeUrl` ← Derived from Fabrica.`youtubeUrl` + relationship.`timestamp`
- `timestamp` ← relationship.`timestamp`

**From VERSIONA → Cancion**:

- `cancionId` ← Cancion.`id`
- `songTitle` ← Cancion.`title`
- `genre` ← Cancion.`genre`

**From VERSIONA → Cancion → AUTOR_DE → Artista** (multi-hop):

- `artistName` ← Artista.`stageName` or Artista.`name`

**Implementation Note**: These are updated by backend triggers or via explicit API calls when relationships change.

#### Auto-Generated Fields

**UUIDs**: All entity IDs except Fabrica (which uses YouTube video ID)

**YouTube URLs**:

- Fabrica.`youtubeUrl`: `https://www.youtube.com/watch?v=${id}`
- Jingle.`youtubeUrl`: Inherited from Fabrica + timestamp parameter

### 12.4 Validation on Creation

#### Frontend Validation

**Field-level** (on blur):

- Required fields: Show error if empty
- Format validation: Email, URL, year range

**Form-level** (on submit):

- Check all required fields filled
- Check all field formats valid
- Prevent submission if errors

#### Backend Validation

**Database constraints** (enforced by Neo4j):

- Unique constraints: email, name (for some entities)
- Not null constraints: id, required fields
- Type constraints: string, number, boolean, datetime, enum

**API-level validation** (before database write):

- Check required fields present
- Validate field formats and types
- Check business rules (e.g., year range, valid YouTube ID)
- Return 400 Bad Request with specific error messages

#### Validation Consistency

**Issue**: Frontend and backend validation can drift out of sync.

**Recommendation**:

- Define validation schemas in shared TypeScript file
- Backend converts to appropriate validation library (Joi, Zod)
- Frontend uses same schema for validation
- Ensures consistent validation rules

**APPROVED**

---

## 13. Database Schema Considerations

### 13.1 Current Schema Issues

#### Redundant Properties

**Purpose**: Performance optimization - avoid joins/traversals for common queries

**Current Redundancies**:

**Jingle**:

- `fabricaId`, `fabricaDate` (redundant with APPEARS_IN → Fabrica)
- `cancionId` (redundant with VERSIONA → Cancion)
- `songTitle`, `artistName`, `genre` (redundant with relationships to Cancion, Artista)

**Cancion**:

- `autorIds` (redundant with AUTOR_DE relationships)

**Artista**:

- `idUsuario` (redundant with SOY_YO relationship)

**Problems**:

1. **Data inconsistency risk**: Redundant data can become stale or inconsistent
2. **Update complexity**: Every relationship change requires updating redundant properties
3. **Maintenance burden**: More code to keep redundancies in sync

**Benefits**:

1. **Query performance**: Can query Jingles by fabricaDate without traversing relationships
2. **Simpler queries**: No need for complex Cypher patterns for common filters
3. **Reduced database load**: Fewer relationship traversals

**Recommendation**:

- Keep redundancies but enforce strict update discipline
- Use database triggers (if available in Neo4j) to auto-update redundant properties
- Consider materialized views or pre-computed properties as alternative
- Document clearly which fields are redundant and how they're maintained

**APPROVED** but deferred to the future.

#### Missing Indexes

**Current Performance Issues**:

- Slow searches on entity names/titles
- Slow relationship queries by type
- Slow date range queries

**Recommended Indexes**:

**Node Property Indexes**:

- Fabrica: `date`, `status`
- Jingle: `fabricaDate`, `isJinglazo`, `isJinglazoDelDia`
- Cancion: `title`, `year`, `genre`
- Artista: `name`, `stageName`
- Tematica: `name`, `category`

**Unique Constraints** (implicitly create indexes):

- Usuario: `email`
- Artista: `name`
- Tematica: `name`
- Social media handles (when provided)

**Full-Text Search Indexes**:

- Fabrica: `title`, `description`
- Jingle: `title`, `comment`
- Cancion: `title`
- Artista: `name`, `stageName`
- Tematica: `name`

**Composite Indexes**:

- Jingle: (`fabricaId`, `timestamp`) for efficient Fabrica→Jingles queries
- Relationship: (`type`, `start`, `end`) for efficient relationship lookups

#### Schema Evolution Strategy

**Current State**: Schema changes done manually via Cypher scripts

**Challenges**:

- No version control for schema
- No rollback mechanism
- No automated migrations

**Recommendation**:

- Implement migration system (similar to SQL migrations)
- Version schema changes
- Use migration tool (neo4j-migrations or custom)
- Test migrations in staging before production

**APPROVED** but deferred to the future.

### 13.2 Proposed Schema Improvements

#### 1. Materialized Relationship Paths

**Problem**: Derived relationships (e.g., Jingle → Autor via Cancion) require multi-hop traversals.

**Proposal**: Create direct relationships for common paths:

- Add `PERFORMED_BY` relationship: Jingle → Artista (performers)
- Keep `JINGLERO_DE` as alias or deprecate in favor of `PERFORMED_BY`
- Add `WRITTEN_BY` relationship: Jingle → Artista (via Cancion authors)

**REJECTED**

**Benefits**:

- Simpler queries
- Better performance
- Clearer semantics

**Challenges**:

- Additional relationships to maintain
- More update logic when Cancion authors change

#### 2. Relationship Metadata

**Problem**: Relationship properties are inconsistent across types.

**Proposal**: Standardize common relationship properties:

**All Relationships**:

- `status`: enum (DRAFT, CONFIRMED) - indicates confidence in relationship
- `createdAt`: datetime - when relationship was created
- `createdBy`: string (user ID) - who created the relationship
- `updatedAt`: datetime - when last updated
- `source`: string - where data came from (MANUAL, IMPORT, DERIVED)

**APPROVED** NOTE the exception for the `SOY_YO` relationship, it has a more complex status workflow.

**Specific Relationship Properties** (keep as-is):

- APPEARS_IN: `order`, `timestamp`
- TAGGED_WITH: `isPrimary`
- SOY_YO: `requestedAt`, `isVerified`, `verifiedAt`, `verifiedBy`
- REACCIONA_A: `type`, `removedAt`

**APPROVED**

#### 3. Entity Lifecycle Status

**Problem**: No consistent way to track entity lifecycle (draft, published, archived).

**Proposal**: Add `status` property to all entity types:

**Entity Status Values**:

- `DRAFT`: Entity created but not complete
- `REVIEW`: Entity pending review
- `PUBLISHED`: Entity visible to public
- `ARCHIVED`: Entity hidden but not deleted
- `DELETED`: Soft-deleted (marked for deletion)

**Benefits**:

- Consistent lifecycle management
- Easy filtering in queries
- Support for approval workflows

**Implementation**:

- Add to all entity types
- Default to `DRAFT` on creation
- Admin can change status in EntityMetadataEditor

**APPROVED**

#### 4. Audit Trail

**Problem**: No way to track who changed what and when.

**Proposal**: Add audit trail to database:

**Option A: Audit Log Table**:

- Create separate `AuditLog` nodes
- Link to entity/relationship via `AUDIT_LOG_FOR` relationship
- Properties: `action`, `timestamp`, `userId`, `changes` (JSON diff)

**Option B: Version History**:

- Store previous versions of entities as separate nodes
- Link via `PREVIOUS_VERSION` relationship
- Properties: Full entity state at that point in time

**Option C: Event Sourcing**:

- Store all changes as events
- Reconstruct entity state by replaying events
- Most complex but most flexible

**Recommendation**: Start with Option A (simpler to implement, good enough for most use cases)

**APPROVED** but deferred to the future.

#### 5. Batch Operations Support

**Problem**: Creating multiple entities/relationships is slow (one API call per entity).

**Proposal**: Add batch operation endpoints:

**Endpoints**:

- `POST /api/admin/batch/create` - Create multiple entities/relationships at once
- `POST /api/admin/batch/update` - Update multiple entities at once
- `POST /api/admin/batch/delete` - Delete multiple entities at once

**Request Format**:

```typescript
{
  entities: [
    { type: 'jingle', data: {...} },
    { type: 'cancion', data: {...} }
  ],
  relationships: [
    { type: 'versiona', start: 'J001', end: 'C001', properties: {...} }
  ]
}
```

**Response Format**:

```typescript
{
  created: {
    entities: [...],
    relationships: [...]
  },
  errors: [
    { index: 0, error: "Validation failed" }
  ]
}
```

**Benefits**:

- Much faster bulk operations
- Atomic: all or nothing (or partial with explicit error handling)
- Reduces network overhead

## **APPROVED** but deferred to the future (I am working on a batch import feature).

## 14. Refactoring Recommendations

### 14.1 Priority 1: Critical Issues (Do First)

#### 1.1 Fix Relationship Visibility Issue

**Problem**: New relationships not visible after creation

**Solution**:

- After relationship creation, re-fetch entity data
- Pass fresh data to RelatedEntities via `initialRelationshipData`
- Or: Implement `refresh()` method in RelatedEntities

**Files to Change**:

- `AdminEntityAnalyze.tsx`: Add re-fetch after relationship operations
- `RelatedEntities.tsx`: Expose `refresh()` method via ref

**Estimated Effort**: 2-4 hours

#### 1.2 Standardize Search/Autocomplete

**Problem**: Different search implementations across components

**Solution**:

- Implement unified search API endpoint
- Create shared `EntitySearchAutocomplete` component
- Use in all relationship creation flows

**Files to Change**:

- New: `frontend/src/components/admin/EntitySearchAutocomplete.tsx`
- New: `backend/src/server/api/search.ts` (enhance existing)
- `RelatedEntities.tsx`: Use new component in blank rows
- `AdminHome.tsx`: Optionally use for entity selection

**Estimated Effort**: 8-16 hours

#### 1.3 Implement Consistent Error Handling

**Problem**: Errors displayed inconsistently

**Solution**:

- Create `ErrorDisplay` component
- Standardize error message format from API
- Use toast notifications for non-critical errors
- Use modals for critical errors requiring user action

**Files to Change**:

- New: `frontend/src/components/common/ErrorDisplay.tsx`
- New: `frontend/src/components/common/Toast.tsx`
- Update all components to use new error display

**Estimated Effort**: 4-8 hours

### 14.2 Priority 2: Consistency and UX (Do Second)

#### 2.1 Unify Entity Creation Flow

**Problem**: Multiple creation flows with different behaviors

**Solution**:

- Standardize on Dashboard creation form
- Consistent navigation and context passing
- Always auto-create relationship when creating from relationship context
- Always navigate back to source entity after creation

**Files to Change**:

- `AdminDashboard.tsx`: Refine creation form
- Document creation flow clearly
- Add unit tests for context handling

**Estimated Effort**: 4-8 hours

#### 2.2 Standardize Field Display and Validation

**Problem**: Inconsistent field types and validation across entities

**Solution**:

- Create field configuration system (similar to existing but more comprehensive)
- Define all field types, validations, and display rules in one place
- Use shared validation schemas (TypeScript + Zod)

**Files to Change**:

- New: `frontend/src/lib/config/fieldConfigs.ts`
- New: `frontend/src/lib/validation/schemas.ts`
- Update `EntityMetadataEditor.tsx` to use config
- Update `EntityForm.tsx` to use config

**Estimated Effort**: 8-16 hours

#### 2.3 Improve Edit Mode Consistency

**Problem**: Edit mode activation and save behavior inconsistent

**Solution**:

- Always start in view mode
- Require explicit "Editar" button click
- Track all changes (metadata + relationships)
- Unified save button (or immediate saves with undo)

**Files to Change**:

- `AdminEntityAnalyze.tsx`: Manage global edit state
- `EntityMetadataEditor.tsx`: Respect global edit state
- `RelatedEntities.tsx`: Respect global edit state
- Add URL parameter `?edit=true` for deep links

**Estimated Effort**: 4-8 hours

### 14.3 Priority 3: Performance and Scalability (Do Third)

#### 3.1 Implement Batch Relationship Fetching

**Problem**: N+1 queries when loading entity relationships

**Solution**:

- Create endpoint: `GET /api/admin/{type}/{id}/relationships`
- Returns all relationships in one call
- Update RelatedEntities to use batch endpoint

**Files to Change**:

- New: `backend/src/server/api/admin/relationships.ts` (enhance)
- `RelatedEntities.tsx`: Use batch endpoint instead of multiple fetches

**Estimated Effort**: 4-8 hours

#### 3.2 Add Client-Side Caching

**Problem**: Every page load fetches fresh data

**Solution**:

- Implement React Query or SWR for data fetching
- Cache entity data for 60 seconds
- Invalidate cache on updates
- Reduce unnecessary API calls

**Files to Change**:

- New: `frontend/src/lib/api/queryClient.ts` (React Query setup)
- Update all API calls to use React Query hooks
- Configure cache invalidation rules

**Estimated Effort**: 8-16 hours

#### 3.3 Add Database Indexes

**Problem**: Slow queries for common operations

**Solution**:

- Create indexes on frequently queried properties
- Add full-text search indexes for search functionality
- Monitor query performance and adjust

**Files to Change**:

- New: `backend/src/server/db/migrations/add-indexes.ts`
- Document index strategy
- Add performance monitoring

**Estimated Effort**: 4-8 hours

### 14.4 Priority 4: Advanced Features (Do Later)

#### 4.1 Implement Undo/Redo

**Problem**: No way to undo accidental changes

**Solution**:

- Track change history in component state
- Implement undo/redo stack
- Show "Undo" button after operations

**Estimated Effort**: 8-16 hours

#### 4.2 Add Bulk Operations

**Problem**: Can't operate on multiple entities at once

**Solution**:

- Add checkboxes to EntityList
- Implement bulk actions: delete, update status, export
- Create batch API endpoints

**Estimated Effort**: 16-24 hours

#### 4.3 Implement Approval Workflow

**Problem**: No review process for entity/relationship changes

**Solution**:

- Add lifecycle status to entities (DRAFT, REVIEW, PUBLISHED)
- Create approval workflow for admins
- Notification system for pending approvals

**Estimated Effort**: 24-40 hours

#### 4.4 Add Import/Export

**Problem**: Can't easily import/export data

**Solution**:

- CSV/JSON export for any entity list
- CSV import with validation
- Bulk relationship creation from CSV

**Estimated Effort**: 16-32 hours

---

## 15. Implementation Sequence

### Phase 1: Critical Fixes (Week 1)

**Goal**: Fix broken functionality, improve stability

**Tasks**:

1. Fix relationship visibility issue
2. Implement consistent error handling
3. Add basic input validation to all forms
4. Test all entity creation flows
5. Fix any navigation bugs

**Deliverables**:

- All relationship creation flows work correctly
- New relationships visible immediately
- Errors displayed consistently
- No console errors on entity pages

### Phase 2: Consistency Improvements (Week 2-3)

**Goal**: Make UX consistent across all entities

**Tasks**:

1. Standardize search/autocomplete
2. Unify entity creation flow
3. Standardize field display and validation
4. Improve edit mode consistency
5. Document all field behaviors

**Deliverables**:

- Consistent autocomplete in all relationship creation
- Predictable entity creation flow
- Unified field configuration system
- Clear documentation of all behaviors

### Phase 3: Performance Optimization (Week 4)

**Goal**: Make admin portal faster, more scalable

**Tasks**:

1. Implement batch relationship fetching
2. Add client-side caching
3. Add database indexes
4. Optimize common queries
5. Performance testing and monitoring

**Deliverables**:

- Page load time < 1 second
- Search results < 500ms
- No N+1 query problems
- Performance dashboard/monitoring

### Phase 4: Advanced Features (Week 5-6)

**Goal**: Add power-user features, improve productivity

**Tasks**:

1. Implement undo/redo
2. Add bulk operations
3. Implement CSV import/export
4. Add keyboard shortcuts
5. Improve accessibility

**Deliverables**:

- Undo/redo working for all operations
- Bulk actions available in EntityList
- CSV import/export working
- Keyboard shortcuts documented
- WCAG 2.1 AA compliance

### Phase 5: Advanced Workflow (Week 7-8)

**Goal**: Add approval workflow, audit trail

**Tasks**:

1. Implement entity lifecycle status
2. Add approval workflow
3. Implement audit trail
4. Add notification system
5. Create admin dashboard for pending approvals

**Deliverables**:

- Lifecycle status on all entities
- Approval workflow working
- Full audit trail
- Email/in-app notifications
- Admin approval dashboard

### Phase 6: Polish and Documentation (Week 9-10)

**Goal**: Final polish, comprehensive documentation

**Tasks**:

1. Fix all minor bugs and UI issues
2. Write comprehensive admin documentation
3. Create video tutorials
4. Performance tuning
5. Security review

**Deliverables**:

- Bug-free admin portal
- Complete admin user guide
- Video tutorial series
- Performance benchmarks documented
- Security audit report

---

## 16. Conclusion and Next Steps

### 16.1 Summary

This specification document provides a comprehensive analysis of the current Admin Portal implementation, identifying key areas for improvement:

**Strengths of Current Implementation**:

- Unified entity detail page architecture (AdminEntityAnalyze)
- Consistent use of RelatedEntities component across all entity types
- Flexible EntityMetadataEditor with entity-specific configurations
- Clean separation between admin and public APIs
- Good foundation for knowledge graph management

**Key Areas Requiring Attention**:

- Relationship visibility after creation
- Inconsistent search/autocomplete implementations
- Varying entity creation flows
- Error handling consistency
- Performance optimization opportunities
- Database schema redundancies

### 16.2 Success Metrics

To measure the success of the refactoring effort, track these metrics:

**User Experience Metrics**:

- Time to create a new entity: < 30 seconds
- Time to add a relationship: < 15 seconds
- Error rate on entity creation: < 5%
- User satisfaction score: > 4/5

**Performance Metrics**:

- Page load time: < 1 second
- Search response time: < 500ms
- Relationship creation time: < 2 seconds
- API response time (p95): < 1 second

**Code Quality Metrics**:

- Test coverage: > 80%
- TypeScript strict mode: enabled
- Linter errors: 0
- Console errors: 0

**Data Quality Metrics**:

- Validation error rate: < 2%
- Data consistency issues: 0
- Orphaned relationships: 0

### 16.3 Risk Assessment

**Low Risk (Green)**:

- Field display improvements
- Error message standardization
- UI/UX polish
- Documentation

**Medium Risk (Yellow)**:

- Search/autocomplete refactoring (well-understood problem)
- Entity creation flow unification (requires careful testing)
- Client-side caching (requires cache invalidation strategy)
- Database indexes (test in staging first)

**High Risk (Red)**:

- Database schema changes (requires migration strategy)
- Relationship visibility fixes (touches core data flow)
- Batch operations (atomic transactions required)
- Approval workflow (complex state management)

**Mitigation Strategies**:

- Comprehensive testing for all changes
- Staging environment testing before production
- Feature flags for gradual rollout
- Database backups before schema changes
- Rollback procedures documented

### 16.4 Open Questions for Review

These questions should be addressed during review before implementation:

1. **Redundant Properties**: Should we keep redundant properties (fabricaId, cancionId, etc.) or remove them? What's the performance vs. consistency trade-off we're willing to accept? **RESPONSE**: Yes, keep them.

2. **Entity ID Strategy**: Should Fabrica continue using YouTube video ID as primary key, or switch to UUID for consistency? **RESPONSE**: Keep the current Id.

3. **Relationship Direction**: Are the current relationship directions (e.g., APPEARS_IN: Jingle→Fabrica) optimal, or should we reconsider based on query patterns? **RESPONSE**: Keep the current direction.

4. **Search Implementation**: Should we use Neo4j full-text search, Elasticsearch, or a hybrid approach for autocomplete? **DECISION-NEEDED**: Need to review the performance impact of the different approaches. Defer after the full DB is populated.

5. **Caching Strategy**: Client-side only, server-side only, or both? What TTLs are appropriate? **DECISION-NEEDED**: Need to review the performance impact of the different approaches. Defer after the full DB is populated.

6. **Approval Workflow**: Do we need an approval workflow now, or can it wait for a later phase? **RESPONSE**: Later.

7. **Audit Trail**: How detailed should the audit trail be? Full event sourcing or simple change log? **RESPONSE**: Simple change log.

8. **Backward Compatibility**: Since we're in pre-MVP phase, can we break backward compatibility freely, or are there constraints? **RESPONSE**: Yes, we can break backward compatibility freely.

9. **API Changes**: Are we free to change API endpoints/contracts, or do we need to version them? **RESPONSE**: Yes, we can change API endpoints/contracts freely.

10. **Performance Targets**: What are the acceptable performance thresholds for the admin portal (it's not public-facing)? **DECISION-NEEDED**: Need to review the performance impact of the different approaches. Defer after the full DB is populated.

### 16.5 Recommended Review Process

**Step 1: Initial Review** (1-2 days)

- Review this specification document
- Identify any missing requirements
- Answer open questions
- Prioritize refactoring phases

**Step 2: Technical Design** (2-3 days)

- Create detailed technical designs for Priority 1 items
- Review with team
- Identify any technical blockers
- Update implementation sequence if needed

**Step 3: Prototype Key Changes** (3-5 days)

- Build prototype for relationship visibility fix
- Test search/autocomplete approach
- Validate database schema changes
- Measure performance impact

**Step 4: Implementation Planning** (1-2 days)

- Break down work into specific tasks
- Assign effort estimates
- Create implementation tickets
- Set up tracking in project management tool

**Step 5: Begin Phase 1** (Week 1)

- Start with critical fixes
- Daily standups to track progress
- Continuous testing and validation
- Adjust plan as needed

### 16.6 Additional Resources

**Documentation to Review**:

- `docs/admin-portal-specification.md` - Original functional specification
- `docs/related-entities-structure-analysis.md` - Analysis of RelatedEntities component
- `backend/src/server/db/schema/schema.ts` - Current database schema
- `frontend/src/lib/utils/relationshipConfigs.ts` - Relationship configurations

**Key Code Files**:

- `frontend/src/pages/admin/AdminEntityAnalyze.tsx` - Main entity detail page
- `frontend/src/components/admin/EntityMetadataEditor.tsx` - Metadata editing
- `frontend/src/components/common/RelatedEntities.tsx` - Relationship management
- `frontend/src/lib/api/client.ts` - API client implementation

**Testing Checklist**:

- [ ] Create entity of each type
- [ ] Edit entity metadata for each type
- [ ] Add relationships of each type
- [ ] Delete relationships
- [ ] Navigate between entities
- [ ] Search for entities
- [ ] Test validation errors
- [ ] Test with large datasets (100+ entities)
- [ ] Test concurrent edits
- [ ] Test browser back/forward buttons

### 16.7 Contact and Feedback

This document is intended to bridge the gap between functional specification, UX design, and implementation. It captures the current state as of November 14, 2025, and will serve as the foundation for the refactoring effort.

**Document Maintenance**:

- This is a living document and should be updated as implementation progresses
- Major changes should be tracked in version control
- Team should review and update quarterly or after major changes

**Feedback Welcome**:

- Suggestions for improving the specification
- Identification of missing requirements
- Technical insights or concerns
- UX improvement ideas

---

## Appendix A: Glossary

**Admin Mode**: Special mode in RelatedEntities component where all relationships are visible, cycle prevention is disabled, and blank rows allow adding new relationships.

**Blank Row**: UI element in RelatedEntities Admin Mode that allows adding new relationships by searching for or creating entities.

**Derived Property**: Entity property computed from relationships (e.g., Jingle.artistName derived from Cancion→Artista relationships).

**Entity Type**: One of the six core types: Fabrica, Jingle, Cancion, Artista, Tematica, Usuario.

**Redundant Property**: Property stored directly on an entity that duplicates information available through relationships (stored for performance).

**Relationship Type**: One of the seven relationship types: APPEARS_IN, VERSIONA, AUTOR_DE, JINGLERO_DE, TAGGED_WITH, SOY_YO, REACCIONA_A.

**Route Prefix**: Single-letter abbreviation used in URLs (f=Fabrica, j=Jingle, c=Cancion, a=Artista, t=Tematica).

---

## Appendix B: Entity Type Quick Reference

| Entity   | Prefix | Required Fields | Key Relationships                                   |
| -------- | ------ | --------------- | --------------------------------------------------- |
| Fabrica  | f      | id, title, date | ← APPEARS_IN (from Jingle)                          |
| Jingle   | j      | (none)          | → APPEARS_IN, VERSIONA, TAGGED_WITH, ← JINGLERO_DE  |
| Cancion  | c      | title           | ← VERSIONA (from Jingle), ← AUTOR_DE (from Artista) |
| Artista  | a      | name            | → AUTOR_DE, JINGLERO_DE                             |
| Tematica | t      | name            | ← TAGGED_WITH (from Jingle)                         |
| Usuario  | u      | email           | → SOY_YO, REACCIONA_A                               |

---

## Appendix C: Relationship Direction Quick Reference

| Relationship | Start Node | End Node | Example                               |
| ------------ | ---------- | -------- | ------------------------------------- |
| APPEARS_IN   | Jingle     | Fabrica  | Jingle J001 APPEARS_IN Fabrica F001   |
| VERSIONA     | Jingle     | Cancion  | Jingle J001 VERSIONA Cancion C001     |
| AUTOR_DE     | Artista    | Cancion  | Artista A001 AUTOR_DE Cancion C001    |
| JINGLERO_DE  | Artista    | Jingle   | Artista A001 JINGLERO_DE Jingle J001  |
| TAGGED_WITH  | Jingle     | Tematica | Jingle J001 TAGGED_WITH Tematica T001 |
| SOY_YO       | Usuario    | Artista  | Usuario U001 SOY_YO Artista A001      |
| REACCIONA_A  | Usuario    | Jingle   | Usuario U001 REACCIONA_A Jingle J001  |

---

**End of Document**

**Document Version**: 1.0  
**Last Updated**: November 14, 2025  
**Status**: Ready for Review  
**Next Review Date**: After Phase 1 completion
