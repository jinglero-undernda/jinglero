# Admin Portal - Detailed Specification for Refactoring (R2)

**Document Version:** 2.0  
**Date:** November 14, 2025  
**Status:** Approved for Implementation  
**Purpose:** Refined specification incorporating review decisions for refactoring implementation

**Changes from R1:**
- Incorporated all APPROVED, RESPONSE, PROPOSED, and REJECTED comments
- Removed open questions where decisions have been made
- Clarified implementation priorities
- Deferred performance-related decisions until after full DB population
- Maintained backward compatibility flexibility (pre-MVP phase)

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
11. [Behavioral Standards and Consistency](#behavioral-standards-and-consistency)
12. [Default Values and Mandatory Fields](#default-values-and-mandatory-fields)
13. [Database Schema Specifications](#database-schema-specifications)
14. [Refactoring Implementation Plan](#refactoring-implementation-plan)
15. [Implementation Sequence](#implementation-sequence)

---

## 1. Executive Summary

### Current State

The Admin Portal implements a **unified architecture** where entity detail pages use:
- `AdminEntityAnalyze` page (Route: `/admin/:entityType/:entityId`)
- `RelatedEntities` component in Admin Mode for relationship management
- `EntityMetadataEditor` for inline entity property editing
- Various helper components for forms and relationship creation

### Key Issues Addressed in This Specification

1. **Relationship Visibility**: New relationships not immediately visible after creation → **Solution: Implement refresh() method**
2. **Inconsistent Search**: Multiple search implementations → **Solution: Unified autocomplete component**
3. **Entity Creation Flows**: Varying behaviors → **Solution: Standardized Dashboard-based creation**
4. **Edit Mode Behavior**: Inconsistent activation → **Solution: Always start in view mode, explicit edit button**
5. **Error Handling**: Inconsistent display → **Solution: Standardized toast notifications and modal dialogs**
6. **Field Validation**: Frontend/backend drift → **Solution: Shared validation schemas**

### Approved Refactoring Goals

1. **Fix Critical Issues First**: Relationship visibility, search unification, error handling
2. **Establish Consistent Patterns**: Unified edit mode, save behavior, field display
3. **Optimize Performance**: Batch relationship fetching, client-side caching (deferred for full DB)
4. **Enhance UX**: Immediate feedback, undo capability, keyboard shortcuts
5. **Future-Ready**: Audit trail, batch operations, approval workflow (deferred)

---

## 2. Current Architecture Overview

### High-Level Structure

```
/admin
├── /login                          → AdminLogin
├── /dashboard                      → AdminDashboard (entity counts, quick actions, creation forms)
├── /search                         → AdminHome (may be deprecated)
├── /:entityType                    → AdminEntityList (list of entities)
└── /:entityType/:entityId          → AdminEntityAnalyze (unified detail page)
```

### Component Hierarchy for Entity Detail Pages

```
AdminEntityAnalyze
├── EntityCard (variant="heading")
│   └── Entity title/name with Edit button
├── EntityMetadataEditor
│   ├── Editable entity properties
│   └── Save/Cancel operations
│   └── Exposes: hasUnsavedChanges(), save()
└── RelatedEntities (isAdmin={true})
    ├── Eager-loaded relationships
    ├── Grouped by relationship type
    ├── Add/remove relationship interface
    └── **TO ADD**: Exposes refresh() method
```

### Data Flow (Approved Pattern)

```
User Action → Component State → API Call → Database Update → Component Refresh → UI Update
```

**Key Improvement**: After relationship operations, explicitly call `refresh()` to ensure visibility.

---

## 3. Pages and Routes Catalogue

### 3.1 Admin Portal Entry Points

| Route              | Component        | Purpose                                     | Authentication |
| ------------------ | ---------------- | ------------------------------------------- | -------------- |
| `/admin`           | `AdminPage`      | Route wrapper with authentication check     | Yes            |
| `/admin/login`     | `AdminLogin`     | Login form                                  | No             |
| `/admin/dashboard` | `AdminDashboard` | Main dashboard with stats and quick actions | Yes            |

### 3.2 Entity List Pages

| Route      | Component         | Entity Type | Purpose            | Improvements                             |
| ---------- | ----------------- | ----------- | ------------------ | ---------------------------------------- |
| `/admin/f` | `AdminEntityList` | Fabrica     | List all Fabricas  | Add "New" button, refine sorting by date |
| `/admin/j` | `AdminEntityList` | Jingle      | List all Jingles   | Add "New" button, sort by fabricaDate    |
| `/admin/c` | `AdminEntityList` | Cancion     | List all Canciones | Add "New" button, sort alphabetically    |
| `/admin/a` | `AdminEntityList` | Artista     | List all Artistas  | Add "New" button, sort by stageName/name |
| `/admin/t` | `AdminEntityList` | Tematica    | List all Tematicas | Add "New" button, sort by category       |
| `/admin/u` | `AdminEntityList` | Usuario     | List all Usuarios  | Add "New" button, sort by email          |

**Approved Improvements**:
- Add "New" button to create entity at the end of list
- Adopt sorting criteria consistent with RelatedEntities component
- All use same `AdminEntityList` component with entity-specific configuration

### 3.3 Entity Detail Pages (Unified Approach)

| Route          | Component            | Entity Type | Key Relationships                           |
| -------------- | -------------------- | ----------- | ------------------------------------------- |
| `/admin/f/:id` | `AdminEntityAnalyze` | Fabrica     | Jingles (appears_in)                        |
| `/admin/j/:id` | `AdminEntityAnalyze` | Jingle      | Fabrica, Cancion, Jinglero, Tematicas       |
| `/admin/c/:id` | `AdminEntityAnalyze` | Cancion     | Autor, Jingles (versiona)                   |
| `/admin/a/:id` | `AdminEntityAnalyze` | Artista     | Canciones (autor_de), Jingles (jinglero_de) |
| `/admin/t/:id` | `AdminEntityAnalyze` | Tematica    | Jingles (tagged_with)                       |

**Notes**:
- All share `AdminEntityAnalyze` component
- Relationships configured via `relationshipConfigs.ts`
- Metadata fields managed by `EntityMetadataEditor`
- **Special Case - Jingle**: Autor relationship is read-only (derived via Cancion)

### 3.4 Legacy Routes - REMOVED

**Decision**: Remove legacy routes as they are not used:
- ~~`/admin/fabrica/:id`~~
- ~~`/admin/jingle/:id`~~
- ~~`/admin/cancion/:id`~~
- ~~`/admin/artista/:id`~~
- ~~`/admin/tematica/:id`~~

### 3.5 Search and Selection

| Route           | Component   | Purpose                             | Status                                          |
| --------------- | ----------- | ----------------------------------- | ----------------------------------------------- |
| `/admin/search` | `AdminHome` | Search/select entities for analysis | May be deprecated if Dashboard search is enough |

**Decision Pending**: Evaluate if needed after Dashboard search is implemented

---

## 4. Components Catalogue

### 4.1 Core Admin Components

#### AdminEntityAnalyze

**Location**: `frontend/src/pages/admin/AdminEntityAnalyze.tsx`

**Purpose**: Unified entity detail page for all entity types

**Key State**:
- `entity`: Current entity data
- `loading`: Loading state
- `error`: Error message
- `isEditing`: Edit mode flag (default: `false` - always start in view mode)
- `pendingNavigation`: For unsaved changes handling

**Refs**:
- `metadataEditorRef`: Access to `hasUnsavedChanges()` and `save()` methods
- `relatedEntitiesRef`: Access to `refresh()` method (to be implemented)

**Approved Behaviors**:
- Always start in view mode
- Track both metadata AND relationship changes for unsaved warning
- After relationship operations, call `relatedEntitiesRef.current.refresh()`

#### EntityMetadataEditor

**Location**: `frontend/src/components/admin/EntityMetadataEditor.tsx`

**Purpose**: Inline editing of entity metadata fields

**Field Configuration**:
- `FIELD_ORDER`: Custom ordering per entity type
- `EXCLUDED_FIELDS`: Auto-managed and redundant fields
- `FIELD_OPTIONS`: Dropdown options (status, category, nationality)
- `TEXTAREA_FIELDS`: Multi-line text fields

**Exposed Methods** (via ref):
- `hasUnsavedChanges()`: Check if user has unsaved edits
- `save()`: Save current changes

**Special Behaviors**:
- **Fabrica**: 
  - `youtubeUrl` is read-only (auto-generated from id)
  - `date` uses date-picker component
  - `status` dropdown (DRAFT, PROCESSING, COMPLETED)
  - `description` field removed (future feature via YouTube sync)
  - `contents` always shown
  
- **Jingle**: 
  - `id` is read-only (auto-generated UUID)
  - Multiple boolean flags
  - `youtubeClipUrl` and `lyrics` always shown
  
- **Cancion**: 
  - Standard text fields, alphabetically ordered
  
- **Artista**: 
  - `nationality` searchable dropdown with all countries
  - `isArg` hidden from edit mode (auto-managed from nationality)
  - Display: stageName as primary, name as secondary (if different)
  - Validation: at least one of `name` OR `stageName` required
  
- **Tematica**: 
  - `category` dropdown (ACTUALIDAD, CULTURA, GELATINA, GENTE, POLITICA)

**Approved Improvements**:
- Implement date-picker component for all date fields
- Auto-manage `isArg` from `nationality === 'Argentina'`
- Update Artista display logic in EntityCard
- Make `name` OR `stageName` mandatory (including DB schema)

#### RelatedEntities (Admin Mode)

**Location**: `frontend/src/components/common/RelatedEntities.tsx`

**Purpose**: Display and manage entity relationships

**Admin Mode Features**:
- Eager loading of all relationships
- No cycle prevention
- All relationships visible by default
- Blank rows for adding relationships (only when `isEditing={true}`)

**Props (Admin-specific)**:
- `isAdmin={true}`: Enables admin mode
- `isEditing`: Controls edit state (blank rows only show when true)
- `onEditToggle`: Callback to toggle edit mode
- `initialRelationshipData`: Pre-populate relationships
- `onNavigateToEntity`: Handle navigation with unsaved changes check

**To Be Implemented**:
- `refresh()` method exposed via ref
- `hasUnsavedChanges()` method for relationship property edits
- Delete buttons for existing relationships
- Relationship property editing with save/cancel per relationship

**Approved Behaviors**:
- Blank rows only appear in edit mode
- Relationship changes tracked for unsaved warning
- After relationship create/delete/update, refresh automatically

**Special Cases for Jingle**:
1. **Fabrica relationship**: Max cardinality 1 - hide blank row if relationship exists
2. **Cancion relationship**: Max cardinality 1 - hide blank row if relationship exists
3. **Autor relationship**: Read-only, derived from Cancion→AUTOR_DE→Artista (second-order)

#### EntityForm

**Location**: `frontend/src/components/admin/EntityForm.tsx`

**Purpose**: Create or edit entities with validation

**Modes**:
- `create`: Create new entity (used from Dashboard)
- `edit`: Update existing entity (when is this used? To be clarified)

**Approved Improvements**:
- Ensure consistent UX with EntityMetadataEditor
- Consider unifying components if possible

#### RelationshipForm

**Location**: `frontend/src/components/admin/RelationshipForm.tsx`

**Purpose**: Create relationships between entities

**Key Features**:
- Loads available entities for start and end nodes
- Supports pre-set start or end from context
- Allows hiding preset fields
- Supports additional relationship properties

### 4.2 Supporting Components

#### EntityCard

**Location**: `frontend/src/components/common/EntityCard.tsx`

**Variants**:
- `heading`: Title/name display with optional edit button
- `contents`: Content row with indentation
- `box`: Card-style display (used in search/selection views)

**Approved Improvements - Artista Display**:
- Primary text: `stageName` if present, otherwise `name`
- Secondary text: `name` if different from `stageName`
- Sorting: by `stageName`, fallback to `name` if empty

#### UnsavedChangesModal

**Location**: `frontend/src/components/admin/UnsavedChangesModal.tsx`

**Actions**:
- Discard: Continue navigation, lose changes
- Save: Save changes, then navigate
- Cancel: Return to editing

**Approved Improvements**:
- Track ALL changes (metadata + relationships)
- Intercept browser back button with `beforeunload` event

### 4.3 Validation Components

- **KnowledgeGraphValidator**: Validate entity integrity and relationships
- **DataIntegrityChecker**: Check data integrity across multiple entities
- **RelationshipValidator**: Validate specific relationships

---

## 5. Entity Specifications

### 5.1 Fabrica

**Database Label**: `Fabrica`  
**API Endpoint**: `/api/admin/fabricas`  
**Route Prefix**: `f`

#### Properties

| Field            | Type     | Required | Editable  | Default        | Notes                                                   |
| ---------------- | -------- | -------- | --------- | -------------- | ------------------------------------------------------- |
| `id`             | string   | Yes      | Yes       | -              | YouTube video ID, editable (special case)               |
| `title`          | string   | Yes      | Yes       | -              | Fabrica title                                           |
| `date`           | datetime | Yes      | Yes       | -              | Date of Fabrica, use date-picker component              |
| `youtubeUrl`     | string   | Yes      | Read-only | Auto-generated | Derived: `https://www.youtube.com/watch?v=${id}`        |
| `visualizations` | number   | No       | No        | 0              | Auto-managed by YouTube sync (future)                   |
| `likes`          | number   | No       | No        | 0              | Auto-managed by YouTube sync (future)                   |
| `description`    | string   | No       | No        | -              | Removed from edit (future: YouTube sync)                |
| `contents`       | string   | No       | Yes       | -              | Contents from YouTube comment, textarea, always visible |
| `status`         | enum     | Yes      | Yes       | `DRAFT`        | Dropdown: DRAFT, PROCESSING, COMPLETED                  |
| `createdAt`      | datetime | Yes      | No        | Auto           | Auto-managed                                            |
| `updatedAt`      | datetime | Yes      | No        | Auto           | Auto-managed                                            |

#### Relationships

**Incoming**:
- `APPEARS_IN` from Jingle (Many) - Properties: `order` (number), `timestamp` (number)

#### Field Display Order (Edit Mode)

1. `id`
2. `title`
3. `date` (date-picker)
4. `status` (dropdown)
5. `youtubeUrl` (read-only, for reference)
6. `contents` (textarea, always shown)

#### Mandatory Fields for Creation

- `id` (valid YouTube video ID format)
- `title`
- `date`

#### Validation Rules

- `id`: Must be valid YouTube video ID format (11 chars, alphanumeric + `-` and `_`)
- `date`: Must be valid date
- `status`: One of DRAFT, PROCESSING, COMPLETED

### 5.2 Jingle

**Database Label**: `Jingle`  
**API Endpoint**: `/api/admin/jingles`  
**Route Prefix**: `j`

#### Properties

| Field              | Type     | Required | Editable  | Default   | Notes                                     |
| ------------------ | -------- | -------- | --------- | --------- | ----------------------------------------- |
| `id`               | string   | Yes      | Read-only | Auto-UUID | Auto-generated UUID                       |
| `title`            | string   | No       | Yes       | -         | Jingle title                              |
| `youtubeUrl`       | string   | No       | No        | Inherited | Derived from Fabrica relationship         |
| `timestamp`        | number   | No       | No        | Inherited | Derived from APPEARS_IN relationship      |
| `youtubeClipUrl`   | string   | No       | Yes       | -         | YouTube clip URL, always shown            |
| `comment`          | string   | No       | Yes       | -         | Admin comment, textarea                   |
| `lyrics`           | string   | No       | Yes       | -         | Jingle lyrics, textarea, always shown     |
| `songTitle`        | string   | No       | No        | Inherited | Derived from Cancion relationship         |
| `artistName`       | string   | No       | No        | Inherited | Derived from Cancion→Artista relationship |
| `genre`            | string   | No       | No        | Inherited | Derived from Cancion relationship         |
| `isJinglazo`       | boolean  | No       | Yes       | false     | Boolean flag (DB constraint removed)      |
| `isJinglazoDelDia` | boolean  | No       | Yes       | false     | Boolean flag (DB constraint removed)      |
| `isPrecario`       | boolean  | No       | Yes       | false     | Boolean flag (DB constraint removed)      |
| `isLive`           | boolean  | No       | Yes       | false     | Boolean flag                              |
| `isRepeat`         | boolean  | No       | Yes       | false     | Boolean flag                              |
| `fabricaId`        | string   | No       | No        | Redundant | Redundant with APPEARS_IN, auto-managed   |
| `fabricaDate`      | datetime | No       | No        | Redundant | Redundant with Fabrica.date, auto-managed |
| `cancionId`        | string   | No       | No        | Redundant | Redundant with VERSIONA, auto-managed     |
| `createdAt`        | datetime | Yes      | No        | Auto      | Auto-managed                              |
| `updatedAt`        | datetime | Yes      | No        | Auto      | Auto-managed                              |

#### Relationships

**Outgoing**:
- `APPEARS_IN` → Fabrica (One) - Max cardinality 1
- `VERSIONA` → Cancion (One) - Max cardinality 1
- `TAGGED_WITH` → Tematica (Many)

**Incoming**:
- `JINGLERO_DE` from Artista (Many)

**Derived (Read-Only)**:
- Autor: via Jingle→VERSIONA→Cancion→AUTOR_DE→Artista (second-order relationship)

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `title`
3. `isJinglazo`
4. `isJinglazoDelDia`
5. `isPrecario`
6. `isLive`
7. `isRepeat`
8. `comment` (textarea)
9. `youtubeClipUrl` (always shown)
10. `lyrics` (textarea, always shown)

**Excluded**: `youtubeUrl`, `timestamp`, `songTitle`, `artistName`, `genre`, `fabricaId`, `fabricaDate`, `cancionId`

#### Mandatory Fields for Creation

- None (id is auto-generated)
- **Recommended**: At least one of `title` or `comment` (for usability)

#### Validation Rules

- Warn if both `title` and `comment` are empty
- If `isJinglazoDelDia` is true, warn if `isJinglazo` is false
- Order within Fabrica must be consistent with timestamp (allow gaps)

### 5.3 Cancion

**Database Label**: `Cancion`  
**API Endpoint**: `/api/admin/canciones`  
**Route Prefix**: `c`

#### Properties

| Field          | Type     | Required | Editable  | Default   | Notes                                 |
| -------------- | -------- | -------- | --------- | --------- | ------------------------------------- |
| `id`           | string   | Yes      | Read-only | Auto-UUID | Auto-generated UUID                   |
| `title`        | string   | Yes      | Yes       | -         | Song title                            |
| `album`        | string   | No       | Yes       | -         | Album name                            |
| `year`         | number   | No       | Yes       | -         | Release year (keep as number input)   |
| `genre`        | string   | No       | Yes       | -         | Music genre                           |
| `youtubeMusic` | string   | No       | Yes       | -         | YouTube Music link                    |
| `lyrics`       | string   | No       | Yes       | -         | Lyrics URL, textarea                  |
| `autorIds`     | string[] | No       | No        | Redundant | Redundant with AUTOR_DE, auto-managed |
| `createdAt`    | datetime | Yes      | No        | Auto      | Auto-managed                          |
| `updatedAt`    | datetime | Yes      | No        | Auto      | Auto-managed                          |

#### Relationships

**Incoming**:
- `AUTOR_DE` from Artista (Many)
- `VERSIONA` from Jingle (Many)

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `title`
3. `album`
4. `year` (number input, not date picker)
5. `genre`
6. `youtubeMusic`
7. `lyrics` (textarea)

#### Mandatory Fields for Creation

- `title`

#### Validation Rules

- `title` must not be empty
- `year` must be between 1900 and current year if provided

### 5.4 Artista

**Database Label**: `Artista`  
**API Endpoint**: `/api/admin/artistas`  
**Route Prefix**: `a`

#### Properties

| Field              | Type     | Required | Editable  | Default   | Notes                                                            |
| ------------------ | -------- | -------- | --------- | --------- | ---------------------------------------------------------------- |
| `id`               | string   | Yes      | Read-only | Auto-UUID | Auto-generated UUID                                              |
| `name`             | string   | No       | Yes       | -         | Artist's real name (at least one of name/stageName required)     |
| `stageName`        | string   | No       | Yes       | -         | Artist's stage name (at least one of name/stageName required)    |
| `idUsuario`        | string   | No       | No        | Inherited | Derived from SOY_YO relationship, auto-managed                   |
| `nationality`      | string   | No       | Yes       | -         | Searchable dropdown with all countries                           |
| `isArg`            | boolean  | No       | No        | false     | Auto-managed: true if nationality === 'Argentina', hidden in UI  |
| `youtubeHandle`    | string   | No       | Yes       | -         | YouTube handle                                                   |
| `instagramHandle`  | string   | No       | Yes       | -         | Instagram handle                                                 |
| `twitterHandle`    | string   | No       | Yes       | -         | Twitter handle                                                   |
| `facebookProfile`  | string   | No       | Yes       | -         | Facebook profile                                                 |
| `website`          | string   | No       | Yes       | -         | Artist website                                                   |
| `bio`              | string   | No       | Yes       | -         | Biography, textarea                                              |
| `createdAt`        | datetime | Yes      | No        | Auto      | Auto-managed                                                     |
| `updatedAt`        | datetime | Yes      | No        | Auto      | Auto-managed                                                     |

#### Relationships

**Outgoing**:
- `AUTOR_DE` → Cancion (Many)
- `JINGLERO_DE` → Jingle (Many)

**Incoming**:
- `SOY_YO` from Usuario (One) - Special status workflow

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `name`
3. `stageName`
4. `nationality` (searchable dropdown)
5. ~~`isArg`~~ (hidden, auto-managed)
6. `youtubeHandle`
7. `instagramHandle`
8. `twitterHandle`
9. `facebookProfile`
10. `website`
11. `bio` (textarea)

#### Display Rules (EntityCard)

- **Primary text**: `stageName` if present, otherwise `name`
- **Secondary text**: `name` if different from `stageName`
- **Sorting**: by `stageName`, fallback to `name` if empty

#### Mandatory Fields for Creation

- At least one of: `name` OR `stageName` (update DB schema and validation)

#### Validation Rules

- At least one of `name` or `stageName` must be provided
- `nationality` should be from predefined country list if provided
- Social media handles: valid format (no @ prefix)
- Uniqueness: `name` OR `stageName` (to be clarified at DB level)

### 5.5 Tematica

**Database Label**: `Tematica`  
**API Endpoint**: `/api/admin/tematicas`  
**Route Prefix**: `t`

#### Properties

| Field         | Type     | Required | Editable  | Default   | Notes                                                    |
| ------------- | -------- | -------- | --------- | --------- | -------------------------------------------------------- |
| `id`          | string   | Yes      | Read-only | Auto-UUID | Auto-generated UUID                                      |
| `name`        | string   | Yes      | Yes       | -         | Tematica name                                            |
| `description` | string   | No       | Yes       | -         | Description, textarea                                    |
| `category`    | enum     | No       | Yes       | -         | Dropdown: ACTUALIDAD, CULTURA, GELATINA, GENTE, POLITICA |
| `createdAt`   | datetime | Yes      | No        | Auto      | Auto-managed                                             |
| `updatedAt`   | datetime | Yes      | No        | Auto      | Auto-managed                                             |

#### Relationships

**Incoming**:
- `TAGGED_WITH` from Jingle (Many) - Properties: `isPrimary` (boolean), `status` (enum)

#### Field Display Order (Edit Mode)

1. `id` (read-only)
2. `name`
3. `description` (textarea)
4. `category` (dropdown)

#### Mandatory Fields for Creation

- `name`

#### Validation Rules

- `name` must not be empty
- `name` must be unique (DB constraint)
- `category` must be one of predefined values if provided

---

## 6. Relationship Specifications

### 6.1 APPEARS_IN (Jingle → Fabrica)

**Direction**: Jingle (start) → Fabrica (end)  
**Cardinality**: Many Jingles can appear in One Fabrica; One Jingle appears in One Fabrica (max)

#### Properties

| Property    | Type   | Required | Editable | Default        | Description                               |
| ----------- | ------ | -------- | -------- | -------------- | ----------------------------------------- |
| `order`     | number | No       | Yes      | Auto-increment | Order of Jingle in Fabrica                |
| `timestamp` | number | Yes      | Yes      | -              | Timestamp in seconds where Jingle appears |
| `status`    | enum   | No       | Yes      | DRAFT          | DRAFT or CONFIRMED                        |
| `createdAt` | datetime | Yes    | No       | Auto           | Auto-managed                              |

#### Redundant Properties Managed

- Jingle.`fabricaId` ← Fabrica.`id`
- Jingle.`fabricaDate` ← Fabrica.`date`
- Jingle.`youtubeUrl` ← Derived from Fabrica.`youtubeUrl` + `timestamp`

#### Display in UI

**In Jingle Detail Page**:
- Label: "Fabrica"
- Shows: Single Fabrica entity (max cardinality 1)
- **Hide blank row** if relationship exists
- Expandable to show: `order`, `timestamp`, `status` properties

**In Fabrica Detail Page**:
- Label: "Jingles"
- Shows: List of Jingles
- Sort by: `timestamp` (ascending)
- Expandable to show: `order`, `timestamp`, `status` properties

#### Validation

- `timestamp` required when creating relationship
- `order` should be consistent with `timestamp` sequence (allow gaps)

### 6.2 VERSIONA (Jingle → Cancion)

**Direction**: Jingle (start) → Cancion (end)  
**Cardinality**: Many Jingles can version One Cancion; One Jingle versions One Cancion (max)

#### Properties

| Property    | Type     | Required | Editable | Default | Description        |
| ----------- | -------- | -------- | -------- | ------- | ------------------ |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed       |

#### Redundant Properties Managed

- Jingle.`cancionId` ← Cancion.`id`
- Jingle.`songTitle` ← Cancion.`title`
- Jingle.`genre` ← Cancion.`genre`

#### Derived Properties

- Jingle.`artistName` ← Cancion→AUTOR_DE→Artista.`stageName` or `name`

#### Display in UI

**In Jingle Detail Page**:
- Label: "Cancion"
- Shows: Single Cancion entity (max cardinality 1)
- **Hide blank row** if relationship exists
- Expandable to show: `status` property

**In Cancion Detail Page**:
- Label: "Jingles"
- Shows: List of Jingles that version this song
- Sort by: `fabricaDate` (most recent first)
- Expandable to show: `status` property

### 6.3 AUTOR_DE (Artista → Cancion)

**Direction**: Artista (start) → Cancion (end)  
**Cardinality**: Many Artistas can author Many Canciones

#### Properties

| Property    | Type     | Required | Editable | Default | Description        |
| ----------- | -------- | -------- | -------- | ------- | ------------------ |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed       |

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
- Sort by: `stageName`, fallback to `name` if empty
- Expandable to show: `status` property

**In Jingle Detail Page** (derived, read-only):
- Label: "Autor"
- Shows: List of Artistas (via Cancion relationship)
- **Read-only**: Cannot add/remove from Jingle page
- This is a second-order relationship: Jingle→VERSIONA→Cancion→AUTOR_DE→Artista

### 6.4 JINGLERO_DE (Artista → Jingle)

**Direction**: Artista (start) → Jingle (end)  
**Cardinality**: Many Artistas can perform Many Jingles

#### Properties

| Property    | Type     | Required | Editable | Default | Description        |
| ----------- | -------- | -------- | -------- | ------- | ------------------ |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed       |

#### Difference from Autor

- **Autor** (AUTOR_DE): Original song author(s) via Cancion relationship
- **Jinglero** (JINGLERO_DE): Performer of the Jingle (may be different)

**Example**:
- Cancion: "Imagine" by John Lennon (AUTOR_DE)
- Jingle: Cover performed by Madonna (JINGLERO_DE)

#### Display in UI

**In Artista Detail Page**:
- Label: "Jingles"
- Shows: List of Jingles performed by this Artista
- Sort by: `fabricaDate` (most recent first)
- Expandable to show: `status` property

**In Jingle Detail Page**:
- Label: "Jinglero"
- Shows: List of Artistas (performers)
- Sort by: `stageName`, fallback to `name` if empty
- Expandable to show: `status` property
- **Visually distinct** from "Autor" section

### 6.5 TAGGED_WITH (Jingle → Tematica)

**Direction**: Jingle (start) → Tematica (end)  
**Cardinality**: Many Jingles can be tagged with Many Tematicas

#### Properties

| Property    | Type     | Required | Editable | Default | Description                               |
| ----------- | -------- | -------- | -------- | ------- | ----------------------------------------- |
| `isPrimary` | boolean  | No       | Yes      | false   | Indicates primary tematica for the Jingle |
| `status`    | enum     | No       | Yes      | DRAFT   | DRAFT or CONFIRMED                        |
| `createdAt` | datetime | Yes      | No       | Auto    | Auto-managed                              |

#### Business Rules

- A Jingle can have multiple Tematicas
- Only one Tematica per Jingle should have `isPrimary=true`
- If setting `isPrimary=true`, automatically set others to `false`

#### Display in UI

**In Jingle Detail Page**:
- Label: "Tematicas"
- Shows: List of Tematicas
- Sort by: `isPrimary` (primary first), then `category`
- Expandable to show: `isPrimary`, `status` properties
- **Visual indicator** for primary tematica

**In Tematica Detail Page**:
- Label: "Jingles"
- Shows: List of Jingles tagged with this Tematica
- Sort by: `isPrimary` (primary first), then `fabricaDate` (most recent first)
- Expandable to show: `isPrimary`, `status` properties

### 6.6 Special Relationships (Usuario-focused)

#### SOY_YO (Usuario → Artista)

**Direction**: Usuario (start) → Artista (end)  
**Cardinality**: One Usuario can claim One Artista

**Properties**:
- `status`: enum (REQUESTED, REJECTED, APPROVED) - **Special workflow**
- `requestedAt`: datetime
- `isVerified`: boolean
- `verifiedAt`: datetime
- `verifiedBy`: string (admin user ID)

**Purpose**: Allows users to claim ownership of an Artista profile

**Note**: Not managed in typical Entity Detail pages, has specialized workflow

#### REACCIONA_A (Usuario → Jingle)

**Direction**: Usuario (start) → Jingle (end)  
**Cardinality**: Many Usuarios can react to Many Jingles

**Properties**:
- `type`: enum (ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA)
- `createdAt`: datetime
- `updatedAt`: datetime
- `removedAt`: datetime (optional)

**Purpose**: User reactions/likes for Jingles

**Note**: Managed via public user interface, not typically in admin detail pages

### 6.7 Standardized Relationship Properties (Approved)

All relationships (except SOY_YO and REACCIONA_A which have special workflows) should have:

**Standard Properties**:
- `status`: enum (DRAFT, CONFIRMED) - confidence in relationship
- `createdAt`: datetime - when created
- `createdBy`: string (user ID) - who created it (future)
- `updatedAt`: datetime - when last updated (future)
- `source`: enum (MANUAL, IMPORT, DERIVED) - data provenance (future)

**Specific Properties** (keep as-is):
- APPEARS_IN: `order`, `timestamp`
- TAGGED_WITH: `isPrimary`
- SOY_YO: special status workflow properties
- REACCIONA_A: `type`, `removedAt`

---

## 7. Metadata Field Specifications

### 7.1 Field Types and Behaviors

#### Text Input

**Entities**: All  
**Fields**: `id`, `title`, `name`, `email`, etc.

**Behavior**:
- Standard `<input type="text">`
- Full width with padding
- Dark mode styling: bg `#2a2a2a`, border `#444`, text `#fff`

**Read-Only Mode**:
- Gray color `#999`
- Italic style

#### Textarea

**Entities**: All (specific fields)  
**Fields**: `description`, `contents`, `comment`, `lyrics`, `bio`

**Behavior**:
- Multi-line `<textarea>`
- Minimum height: 60px
- Resizable vertically
- Word wrapping enabled
- Auto-sizing: `Math.max(2, Math.ceil(length / 50))` rows

#### Checkbox (Boolean)

**Entities**: Jingle, Artista  
**Fields**: `isJinglazo`, `isJinglazoDelDia`, `isPrecario`, `isLive`, `isRepeat`, ~~`isArg`~~

**Display**:
- Checkbox input (16x16px)
- Clickable label
- Read-only: ✓ (green `#4caf50`) or ✗ (gray `#999`)

**Note**: DB constraints removed for Jingle boolean flags

#### Dropdown (Select)

**Entities**: Fabrica, Tematica

**Fabrica.status**: DRAFT, PROCESSING, COMPLETED

**Tematica.category**: ACTUALIDAD, CULTURA, GELATINA, GENTE, POLITICA

**Styling**: Dark mode, bg `#2a2a2a`, border `#444`, full width

#### Searchable Dropdown (react-select)

**Entities**: Artista  
**Field**: `nationality`

**Options**:
- 180+ countries (Spanish names)
- Common countries prioritized: Argentina, España, México
- Searchable/filterable
- Clearable

**Special Behavior**:
- When set to 'Argentina', auto-set `isArg = true`
- Custom dark theme
- Z-index: 9999

#### Date Picker

**Entities**: Fabrica  
**Field**: `date`

**Behavior**:
- Use date-picker component (to be implemented)
- Replace current day/month/year breakdown
- Display format: dd/mm/yyyy
- Internal format: ISO datetime string

**Validation**:
- Must be valid date
- Reasonable range (e.g., 2000-current+1 year)

#### Read-Only (Auto-Generated)

**Behavior**:
- Gray text `#999`, italic style
- Non-editable

**Fields**:
- Entity IDs (except Fabrica which uses YouTube video ID)
- Fabrica.`youtubeUrl` (auto-generated)
- All `createdAt`, `updatedAt` timestamps
- Inherited/derived fields (excluded from editor)
- Artista.`isArg` (auto-managed, hidden in UI)

### 7.2 Field Exclusion Rules

#### Auto-Managed Fields (Excluded from ALL entities)

- `createdAt`: Auto-set on creation
- `updatedAt`: Auto-set on every update

#### Redundant Fields (Excluded per entity)

**Jingle**:
- `fabricaId`, `fabricaDate` (managed via APPEARS_IN)
- `cancionId` (managed via VERSIONA)
- `youtubeUrl`, `timestamp` (inherited from Fabrica)
- `songTitle`, `artistName`, `genre` (inherited from Cancion)

**Cancion**:
- `autorIds` (managed via AUTOR_DE)

**Artista**:
- `idUsuario` (managed via SOY_YO)
- `isArg` (auto-managed from nationality, hidden)

**Fabrica**:
- `youtubeUrl` shown but read-only (auto-generated)
- `description` removed (future: YouTube sync)
- `visualizations`, `likes` removed (future: YouTube sync)

### 7.3 Validation Rules

#### Required Fields Summary

| Entity   | Required Fields                                  |
| -------- | ------------------------------------------------ |
| Fabrica  | `id`, `title`, `date`                            |
| Jingle   | None (recommended: `title` OR `comment`)         |
| Cancion  | `title`                                          |
| Artista  | At least one of: `name` OR `stageName`           |
| Tematica | `name`                                           |

#### Format Validations

**YouTube Video ID** (Fabrica.id):
- Pattern: 11 characters, alphanumeric + `-` and `_`

**URL Fields**:
- Must be valid URL format
- Fields: `youtubeUrl`, `youtubeClipUrl`, `youtubeMusic`, `lyrics`, `website`

**Year** (Cancion.year):
- Range: 1900 - current year

**Handles** (social media):
- No @ prefix
- Fields: `youtubeHandle`, `instagramHandle`, `twitterHandle`

**Email** (Usuario.email):
- Standard email format

#### Uniqueness Constraints (Database Level)

- Usuario.`email`
- Tematica.`name`
- Artista: `name` OR `stageName` (to be clarified)

#### Relationship-Specific Validations

**Jingle Order Validation**:
- Order within Fabrica must be consistent with `timestamp`
- Allow gaps in sequence
- Auto-assign order on relationship creation
- If timestamp defaults to 00:00:00, place at beginning with warning

#### Cross-Field Validations

**Jingle**:
- If `isJinglazoDelDia` is true, warn if `isJinglazo` is false

**Artista**:
- At least one of `name` or `stageName` must be provided

### 7.4 Shared Validation Schemas (Approved)

**Implementation**:
- Define validation schemas in shared TypeScript file using Zod
- Frontend uses Zod schemas directly
- Backend converts/shares same schemas
- Ensures consistent validation rules

**Benefits**:
- No frontend/backend validation drift
- Single source of truth
- TypeScript type safety

---

## 8. New Entity Creation Flows

### 8.1 Creation Entry Points

#### From Dashboard (Primary Method)

**Route**: `/admin/dashboard?create={entityType}`

**Flow**:
1. User selects entity type from dropdown
2. Clicks "Crear" button
3. Dashboard shows creation form (uses EntityMetadataEditor or similar)
4. User fills required fields
5. Clicks "Crear" button
6. Entity created via API
7. If relationship context provided (`fromType`, `fromId`, `relType`), relationship auto-created
8. Navigate to new entity detail page

**Context Parameters**:
- `create`: Entity type route prefix (f, j, c, a, t)
- `fromType`: Source entity type (optional)
- `fromId`: Source entity ID (optional)
- `relType`: Relationship type (optional)
- `searchText`: Pre-populate name/title field (optional)

**Approved Behavior**:
- Creation API triggered AFTER mandatory fields filled
- Relationship created immediately after entity creation
- Navigation back to source entity includes refresh

#### From Entity Detail Page (via Blank Row)

**Location**: RelatedEntities component in Admin Mode (when `isEditing={true}`)

**Flow**:
1. User types in blank row search field
2. No matching entities found
3. Green "+" button appears
4. User clicks "+" button
5. Navigate to `/admin/dashboard?create={targetType}&fromType={currentType}&fromId={currentId}&relType={relationshipType}&searchText={searchQuery}`
6. Creation form appears with relationship context
7. After entity creation, relationship auto-created
8. Navigate back to source entity detail page
9. RelatedEntities.refresh() called → new entity and relationship visible

**Approved Improvements**:
- Consistent context passing via URL parameters
- Always auto-create relationship when context provided
- Always call refresh() after navigation back
- Blank rows only visible when `isEditing={true}`

#### From Entity List Page

**Location**: AdminEntityList component

**Flow**:
1. User clicks "New" button (to be implemented)
2. Navigate to Dashboard with creation context
3. After creation, navigate back to list (or to entity detail)

**Status**: To be implemented

### 8.2 Pre-Population Rules

#### From Relationship Context

**When creating Jingle from Fabrica**:
- Relationship auto-created with `fabricaId`
- User must provide: `timestamp` (required for APPEARS_IN)

**When creating Cancion from Jingle**:
- Relationship auto-created
- Could inherit `title` from Jingle (optional enhancement)

**When creating Artista from Cancion** (as Autor):
- AUTOR_DE relationship auto-created

**When creating Artista from Jingle** (as Jinglero):
- JINGLERO_DE relationship auto-created

**When creating Tematica from Jingle**:
- TAGGED_WITH relationship auto-created

#### From Search Context

**When creating from search with text**:
- Pre-populate `title` (Fabrica, Jingle, Cancion)
- Pre-populate `name` (Artista, Tematica)

### 8.3 Post-Creation Actions

#### Success Path

1. **Entity Creation**: `POST /api/admin/{entityType}`
2. **Validation** (optional): Validate entity
3. **Relationship Creation** (if context provided):
   - Determine start and end node IDs based on relationship direction
   - Create relationship: `POST /api/admin/relationships`
4. **Navigation**:
   - If relationship context: Navigate to source entity
   - Call `relatedEntitiesRef.current.refresh()` if available
   - Otherwise: Navigate to new entity detail page

#### Error Handling (Approved)

**Entity Creation Fails**:
- Display error as toast notification
- Keep form data (don't clear)
- Allow user to correct and retry

**Relationship Creation Fails** (entity created):
- Toast: "Entidad creada, pero error al crear la relación"
- Navigate to source entity for manual relationship creation
- Log error for investigation

**Validation Fails** (non-blocking):
- Entity and relationship created anyway
- Show validation issues on entity detail page
- Allow admin to fix later

### 8.4 Relationship Direction Mapping

| Relationship  | Start Node | End Node | Creation from Jingle Context                       | Creation from Other Context                        |
| ------------- | ---------- | -------- | -------------------------------------------------- | -------------------------------------------------- |
| `APPEARS_IN`  | Jingle     | Fabrica  | Creating Fabrica: start=existingJingle, end=new    | Creating Jingle: start=new, end=existingFabrica    |
| `VERSIONA`    | Jingle     | Cancion  | Creating Cancion: start=existingJingle, end=new    | Creating Jingle: start=new, end=existingCancion    |
| `AUTOR_DE`    | Artista    | Cancion  | Creating Artista: start=new, end=existingCancion   | Creating Cancion: start=existingArtista, end=new   |
| `JINGLERO_DE` | Artista    | Jingle   | Creating Artista: start=new, end=existingJingle    | Creating Jingle: start=existingArtista, end=new    |
| `TAGGED_WITH` | Jingle     | Tematica | Creating Tematica: start=existingJingle, end=new   | Creating Jingle: start=new, end=existingTematica   |

---

## 9. Search Logic and Triggers

### 9.1 Approved Search Strategy

**Decision**: Standardize on search with autocomplete for all relationship creation

**Implementation**:
- Unified `EntitySearchAutocomplete` component (to be created)
- Used in all blank rows in RelatedEntities
- Used in Dashboard for entity selection (optional)
- Fallback to dropdown for small entity sets (<100 items)

### 9.2 Search API

**Endpoint**: `GET /api/public/search?q={query}&types={targetType}`

**Expected Response**:
```typescript
{
  fabricas: Fabrica[],
  jingles: Jingle[],
  canciones: Cancion[],
  artistas: Artista[],
  tematicas: Tematica[]
}
```

**Search Fields**:
- Fabrica: `title` (NOT id)
- Jingle: `title`, `comment` (NOT id)
- Cancion: `title`, `album` (and Artista names - current behavior, keep it)
- Artista: `name`, `stageName`
- Tematica: `name`

**Performance**: Defer optimization until after full DB populated (decision pending on implementation: Neo4j full-text vs Elasticsearch)

### 9.3 Autocomplete Behavior

**Approved Behavior**:
- Debounced input (300ms delay)
- Minimum 2 characters before search
- Top 10 results per entity type
- Keyboard navigation (arrow keys, enter to select)
- Escape to close dropdown

**Display Format** (simplified - no id):
```
[Entity Type Icon] {primary field}
  {secondary field if available}
```

**Examples**:
- Fabrica: "La Fábrica de Jingles - 2025-11-14"
- Jingle: "Imagine"
- Cancion: "Imagine - John Lennon"
- Artista: "Madonna"
- Tematica: "Política"

**Note**: Use consistent icons from EntityCard component

### 9.4 Search Triggers

#### Trigger: User Types in Blank Row (isEditing={true})

**Context**:
- Current entity type and ID
- Relationship type
- Target entity type (derived from relationship)

**Actions**:
1. Debounce input
2. Call autocomplete API with target type filter
3. Display results in dropdown
4. User selects result → Create relationship → Refresh
5. No results → Show "+" button for creation

#### Trigger: User Clicks "+" Button

**Context**:
- Current entity type and ID
- Relationship type
- Target entity type
- Search text (for pre-population)

**Actions**:
1. Navigate to Dashboard with full creation context
2. Show creation form with pre-populated fields
3. After creation, auto-create relationship
4. Navigate back to source entity
5. Call refresh() to show new relationship

---

## 10. API Calls Analysis

### 10.1 Entity CRUD Operations

#### Standard Endpoints (All Entities)

**Get**: `GET /api/admin/{entityType}s/{id}`  
**Create**: `POST /api/admin/{entityType}s`  
**Update**: `PUT /api/admin/{entityType}s/{id}` (PATCH also supported)  
**Delete**: `DELETE /api/admin/{entityType}s/{id}`  
**List**: `GET /api/admin/{entityType}s`

**Delete Behavior** (Approved):
- Deletes entity node
- Deletes all incoming/outgoing relationships
- **Does NOT delete** related entities (no cascade)
- Consider soft delete / undo functionality (future)

### 10.2 Relationship Operations

#### Get Entity Relationships (Current)

**Endpoint**: `GET /api/public/entities/{type}/{id}/relationships`

**Issue**: Public API used from admin pages

**Approved Solution**: Create admin endpoint and batch fetching

#### Approved: Batch Relationship Fetching (Priority 3)

**New Endpoint**: `GET /api/admin/{type}/{id}/relationships`

**Benefits**:
- Single API call for all relationships
- Returns all relationships with related entity data
- Solves N+1 query problem
- 1-2 queries total (entity + relationships) instead of 3 + N + M + K

**Response Format**:
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

#### Create Relationship

**Endpoint**: `POST /api/admin/relationships`

**Request**:
```typescript
{
  start: string,
  end: string,
  type: string,
  properties: Record<string, any>
}
```

#### Update Relationship

**Endpoint**: `PUT /api/admin/relationships/{relType}`

**Note**: Relationships identified by (type, start, end) tuple, not separate ID

#### Delete Relationship

**Endpoint**: `DELETE /api/admin/relationships/{relType}`

**Request**:
```typescript
{
  start: string,
  end: string
}
```

### 10.3 Relationship Visibility Solution (Approved - Priority 1)

**Problem**: New relationships not visible after creation

**Approved Solution: Option 4**:
- RelatedEntities exposes `refresh()` method via ref
- After relationship operations, parent calls `relatedEntitiesRef.current.refresh()`
- Component re-fetches only relationships (not full entity)
- More granular and efficient than full entity refresh

**Implementation**:
```typescript
// In AdminEntityAnalyze
const relatedEntitiesRef = useRef<{ refresh: () => void }>(null);

const handleRelationshipCreated = async () => {
  if (relatedEntitiesRef.current) {
    await relatedEntitiesRef.current.refresh();
  }
};

// In RelatedEntities
const refresh = async () => {
  // Re-fetch relationships
  await loadRelationships();
};

useImperativeHandle(ref, () => ({
  refresh
}));
```

### 10.4 Caching Strategy (Deferred)

**Decision**: Defer caching strategy decision until after full DB populated

**Options to Evaluate**:
1. Client-side caching (React Query/SWR) with 60s TTL
2. Server-side caching (Redis) with 5-10min TTL
3. ETags/Conditional requests
4. Hybrid approach

**Current State**: No caching (every page load = fresh API calls)

---

## 11. Behavioral Standards and Consistency

### 11.1 Edit Mode Standards (Approved)

#### Edit Mode Activation

**Always start in view mode** (edit mode off by default)

**Activation**:
- Require explicit "Editar" button click
- Optional: URL parameter `?edit=true` for deep links (decision pending)

**Edit Mode Behaviors**:
- EntityMetadataEditor: fields become editable
- RelatedEntities: blank rows appear for adding relationships
- Save/Cancel buttons become available

**Exit Edit Mode**:
- Explicit "Cancelar" button
- Navigation triggers unsaved changes check if changes exist

#### Save Behavior (Approved)

**Approved Strategy**: Save immediately with undo option

**Implementation**:
- Metadata changes: Save button in EntityMetadataEditor
- Relationship add/delete: Immediate save, then refresh
- Relationship property edits: Inline save button per relationship OR trigger global save state
- All changes tracked for unsaved warning

**Proposed**: Relationship property changes trigger global save state, activating Save/Cancel buttons

#### Unsaved Changes Handling (Approved)

**Track all changes**:
- Metadata changes (EntityMetadataEditor.hasUnsavedChanges())
- Relationship changes (RelatedEntities.hasUnsavedChanges() - to be implemented)

**Intercept navigation**:
- Navigation within app (React Router)
- Browser back button (`beforeunload` event)
- Navigation to related entities

**UnsavedChangesModal Actions**:
- Discard: Continue navigation, lose changes
- Save: Save all changes, then navigate
- Cancel: Return to editing

### 11.2 Field Display Standards (Approved)

#### ID Field Behavior (Approved)

| Entity   | ID Editable | Reason                                    |
| -------- | ----------- | ----------------------------------------- |
| Fabrica  | Yes         | YouTube video ID, admin may need to edit  |
| Jingle   | No          | UUID auto-generated, never changes        |
| Cancion  | No          | UUID auto-generated, never changes        |
| Artista  | No          | UUID auto-generated, never changes        |
| Tematica | No          | UUID auto-generated, never changes        |

**Keep current behavior** - Fabrica is special case

#### Date Field Behavior (Approved)

**Standardize date display**: dd/mm/yyyy for all entities

**For editable dates**: Use date-picker component (to be implemented)
- Fabrica: Replace day/month/year inputs with date-picker
- Other entities: Use date-picker if date fields added

**Cancion.year**: Keep as numeric input (not date picker)

#### Boolean Field Display (Consistent)

- Edit mode: Checkbox with label
- Read-only: ✓ (green) or ✗ (gray)
- No variations, good consistency

### 11.3 Error Handling Standards (Approved)

#### Standardized Error Display

**Implementation** (Priority 1):
- Create `ErrorDisplay` component
- Create `Toast` notification system
- Standardize error message format from API

**Error Types**:
- **Non-critical errors**: Toast notifications (auto-dismiss, stackable)
- **Critical errors**: Modal dialogs (require user action)
- **Field validation errors**: Red border + message below field

**Consistency**:
- All components use same error display
- Always log errors to console for debugging

#### Validation Error Handling (Approved)

**Implementation**:
- Shared validation library (Zod)
- Same schemas frontend/backend
- Field-level validation on blur
- Form-level validation on submit
- Server-side validation errors highlighted on specific fields

**Display**:
- Invalid fields: red border
- Specific error message below field
- Generic form error at top if applicable

#### Network Error Handling (Approved)

**Implementation**:
- Detect network errors vs. server errors
- Retry logic for transient failures (exponential backoff)
- User-friendly messages: "Network connection lost, retrying..."
- Offline mode detection
- Show retry button for failed operations

### 11.4 Relationship Creation Standards (Approved)

#### Unified Search Experience

**Approved**: Standardize on autocomplete for all relationship creation

**Implementation**:
- Unified `EntitySearchAutocomplete` component
- Same behavior across all entity types
- Fallback to dropdown for small sets (<100)

#### "Create New" Button Behavior (Approved)

**Consistent Flow**:
1. User types in blank row (isEditing={true})
2. No results → "+" button appears
3. Click "+" → Navigate with full context
4. Creation form → Create entity → Create relationship
5. Navigate back → refresh() → New relationship visible

**Context Passing**:
- Always via URL parameters: `?create={type}&fromType={type}&fromId={id}&relType={relType}&searchText={query}`
- Handled consistently in AdminDashboard

---

## 12. Default Values and Mandatory Fields

### 12.1 Mandatory Fields Summary (Approved)

| Entity   | Required on Creation                         | Required Always (DB)       |
| -------- | -------------------------------------------- | -------------------------- |
| Fabrica  | `id`, `title`, `date`                        | + `youtubeUrl`, `status`   |
| Jingle   | None (recommend `title` OR `comment`)        | `id`                       |
| Cancion  | `title`                                      | `id`, `title`              |
| Artista  | At least one of: `name` OR `stageName`       | `id`, `name` OR `stageName` |
| Tematica | `name`                                       | `id`, `name`               |

**Changes Approved**:
- Jingle: Remove DB constraints for `isJinglazo`, `isJinglazoDelDia`, `isPrecario` (make truly optional)
- Artista: Update DB to require `name` OR `stageName` (at least one)
- Artista: Remove DB constraint for `isArg` (auto-managed, not required)

### 12.2 Default Values

#### Boolean Fields
- All default to `false` if not provided
- Jingle: `isJinglazo`, `isJinglazoDelDia`, `isPrecario`, `isLive`, `isRepeat`
- Artista: `isArg` (but auto-managed from nationality)

#### Enum Fields
- Fabrica.`status`: Defaults to `DRAFT`
- Relationship.`status`: Defaults to `DRAFT` (all relationships except SOY_YO)

#### Timestamp Fields
- `createdAt`: Current timestamp on creation
- `updatedAt`: Current timestamp on creation and every update

#### Numeric Fields
- Fabrica: `visualizations` = 0, `likes` = 0
- Usuario: `contributionsCount` = 0

### 12.3 Derived/Inherited Defaults (Approved)

**Jingle Properties from Relationships**:

**From APPEARS_IN → Fabrica**:
- `fabricaId` ← Fabrica.`id`
- `fabricaDate` ← Fabrica.`date`
- `youtubeUrl` ← Fabrica.`youtubeUrl` + timestamp
- `timestamp` ← relationship.`timestamp`

**From VERSIONA → Cancion**:
- `cancionId` ← Cancion.`id`
- `songTitle` ← Cancion.`title`
- `genre` ← Cancion.`genre`

**From Cancion → AUTOR_DE → Artista** (multi-hop):
- `artistName` ← Artista.`stageName` or `name`

**Implementation**: Backend triggers or API calls update redundant properties when relationships change

**Approved**: Keep redundant properties for performance, maintain strictly

### 12.4 Validation Consistency (Approved)

**Implementation Strategy**:
- Define validation schemas in shared TypeScript file (Zod)
- Frontend uses Zod schemas directly
- Backend uses same schemas (converted if needed)
- Ensures no drift between frontend/backend validation

**Validation Levels**:
1. **Frontend**: Field-level (on blur), Form-level (on submit)
2. **Backend**: API-level (before DB write), DB constraints
3. **Consistency**: Same rules at all levels via shared schemas

---

## 13. Database Schema Specifications

### 13.1 Redundant Properties (Approved - Keep)

**Decision**: Keep redundant properties for performance optimization

**Current Redundancies**:
- Jingle: `fabricaId`, `fabricaDate`, `cancionId`, `songTitle`, `artistName`, `genre`
- Cancion: `autorIds`
- Artista: `idUsuario`

**Maintenance Strategy**:
- Backend triggers (if available) or API logic ensures updates
- Strict update discipline in relationship operations
- Future: Consider materialized views as alternative (deferred)
- Document clearly which fields are redundant and how maintained

### 13.2 Relationship Direction (Approved - Keep Current)

**Decision**: Keep current relationship directions

| Relationship  | Start   | End      |
| ------------- | ------- | -------- |
| APPEARS_IN    | Jingle  | Fabrica  |
| VERSIONA      | Jingle  | Cancion  |
| AUTOR_DE      | Artista | Cancion  |
| JINGLERO_DE   | Artista | Jingle   |
| TAGGED_WITH   | Jingle  | Tematica |
| SOY_YO        | Usuario | Artista  |
| REACCIONA_A   | Usuario | Jingle   |

**Optimization**: Query patterns aligned with current directions

### 13.3 Proposed Schema Enhancements (Approved)

#### 1. Standardized Relationship Metadata (Approved)

**All Relationships** (except SOY_YO and REACCIONA_A):
- `status`: enum (DRAFT, CONFIRMED)
- `createdAt`: datetime
- `createdBy`: string (future)
- `updatedAt`: datetime (future)
- `source`: enum (MANUAL, IMPORT, DERIVED) (future)

**Keep Relationship-Specific Properties**:
- APPEARS_IN: `order`, `timestamp`
- TAGGED_WITH: `isPrimary`
- SOY_YO: special workflow properties
- REACCIONA_A: `type`, `removedAt`

#### 2. Entity Lifecycle Status (Approved)

**Add `status` to All Entity Types**:

**Values**:
- `DRAFT`: Created but not complete
- `REVIEW`: Pending review
- `PUBLISHED`: Visible to public
- `ARCHIVED`: Hidden but not deleted
- `DELETED`: Soft-deleted (marked for deletion - future)

**Default**: `DRAFT` on creation

**Admin Control**: Editable via EntityMetadataEditor

**Benefits**:
- Consistent lifecycle management
- Easy filtering in queries
- Support for future approval workflows

**Note**: Fabrica already has `status` field (DRAFT, PROCESSING, COMPLETED) - keep existing values

#### 3. Materialized Relationship Paths (Rejected)

**Decision**: Keep current indirect relationships, do not create direct shortcuts

**Example**: Jingle → Autor remains via Cancion (second-order), not direct WRITTEN_BY relationship

### 13.4 Future Schema Enhancements (Approved but Deferred)

#### 1. Database Indexes

**To Be Implemented After Full DB Population**:

**Node Property Indexes**:
- Fabrica: `date`, `status`
- Jingle: `fabricaDate`, `isJinglazo`, `isJinglazoDelDia`
- Cancion: `title`, `year`, `genre`
- Artista: `name`, `stageName`
- Tematica: `name`, `category`

**Full-Text Search Indexes** (decision pending on implementation):
- Fabrica: `title`, `contents`
- Jingle: `title`, `comment`
- Cancion: `title`
- Artista: `name`, `stageName`
- Tematica: `name`

**Composite Indexes**:
- Jingle: (`fabricaId`, `timestamp`)
- Relationship: (`type`, `start`, `end`)

#### 2. Schema Migration System (Approved but Deferred)

**Implementation**:
- Version control for schema changes
- Migration tool (neo4j-migrations or custom)
- Rollback mechanism
- Test in staging before production

**Current State**: Manual Cypher scripts

#### 3. Audit Trail (Approved but Deferred)

**Decision**: Simple change log (not full event sourcing)

**Recommended Implementation**:
- Separate `AuditLog` nodes
- Link via `AUDIT_LOG_FOR` relationship
- Properties: `action`, `timestamp`, `userId`, `changes` (JSON diff)

**Alternative**: Version history with `PREVIOUS_VERSION` relationships

#### 4. Batch Operations (Approved but Deferred)

**Endpoints** (future):
- `POST /api/admin/batch/create`
- `POST /api/admin/batch/update`
- `POST /api/admin/batch/delete`

**Note**: Currently working on batch import feature

### 13.5 Database Constraints (Approved Changes)

#### Uniqueness Constraints

**Current**:
- Usuario.`email`
- Tematica.`name`

**Artista**: `name` OR `stageName` uniqueness (to be clarified at implementation)

**Social Media Handles**: Unique when provided (future)

#### Not Null Constraints (Changes)

**Remove**:
- Jingle: `isJinglazo`, `isJinglazoDelDia`, `isPrecario` (make truly optional)
- Artista: `isArg` (auto-managed, not required)

**Add**:
- Artista: At least one of `name` OR `stageName` (constraint logic)

---

## 14. Refactoring Implementation Plan

### 14.1 Priority 1: Critical Fixes (Week 1)

**Goal**: Fix broken functionality, improve stability

#### 1.1 Relationship Visibility (Estimated: 2-4 hours)

**Solution**:
- Implement `refresh()` method in RelatedEntities
- Expose via ref
- Call after all relationship operations

**Files**:
- `frontend/src/components/common/RelatedEntities.tsx`
- `frontend/src/pages/admin/AdminEntityAnalyze.tsx`

**Test Cases**:
- Create relationship → Verify visible
- Delete relationship → Verify removed
- Update relationship property → Verify updated
- Navigate back from entity creation → Verify new relationship visible

#### 1.2 Consistent Error Handling (Estimated: 4-8 hours)

**Solution**:
- Create `ErrorDisplay` component
- Create `Toast` notification system
- Standardize error format from API

**Files**:
- New: `frontend/src/components/common/ErrorDisplay.tsx`
- New: `frontend/src/components/common/Toast.tsx`
- Update all components to use new error display

**Test Cases**:
- API error → Toast displayed
- Validation error → Field highlighted with message
- Network error → Retry option shown
- Critical error → Modal displayed

#### 1.3 Input Validation (Estimated: 2-4 hours)

**Solution**:
- Add validation to all forms
- Highlight invalid fields
- Prevent submission with errors

**Files**:
- All form components

**Test Cases**:
- Required field empty → Error shown
- Invalid format → Error shown
- Valid form → Submission allowed

#### 1.4 Navigation and Edit Mode (Estimated: 2-4 hours)

**Solution**:
- Always start in view mode
- Track all changes (metadata + relationships)
- Intercept browser back button

**Files**:
- `frontend/src/pages/admin/AdminEntityAnalyze.tsx`
- `frontend/src/components/admin/UnsavedChangesModal.tsx`

**Test Cases**:
- Load page → View mode active
- Click edit → Edit mode active
- Make changes + navigate → Modal appears
- Browser back with changes → Modal appears

**Total Priority 1 Estimated Time**: 10-20 hours

### 14.2 Priority 2: Consistency and UX (Week 2-3)

#### 2.1 Unified Search/Autocomplete (Estimated: 8-16 hours)

**Solution**:
- Create `EntitySearchAutocomplete` component
- Unified search API endpoint
- Use in all relationship creation flows

**Files**:
- New: `frontend/src/components/admin/EntitySearchAutocomplete.tsx`
- Enhance: `backend/src/server/api/search.ts`
- Update: `RelatedEntities.tsx`, `AdminHome.tsx`

#### 2.2 Entity Creation Flow (Estimated: 4-8 hours)

**Solution**:
- Standardize Dashboard creation form
- Consistent context passing
- Auto-create relationships
- Navigate back with refresh

**Files**:
- `frontend/src/pages/admin/AdminDashboard.tsx`
- Document flow clearly

#### 2.3 Field Configuration System (Estimated: 8-16 hours)

**Solution**:
- Shared validation schemas (Zod)
- Field configuration file
- Use in EntityMetadataEditor and EntityForm

**Files**:
- New: `frontend/src/lib/config/fieldConfigs.ts`
- New: `frontend/src/lib/validation/schemas.ts`
- Update: `EntityMetadataEditor.tsx`, `EntityForm.tsx`

#### 2.4 Edit Mode Improvements (Estimated: 4-8 hours)

**Solution**:
- Blank rows only in edit mode
- Relationship changes tracked
- Unified save behavior

**Files**:
- `AdminEntityAnalyze.tsx`
- `EntityMetadataEditor.tsx`
- `RelatedEntities.tsx`

#### 2.5 EntityCard Display Logic (Estimated: 2-4 hours)

**Solution**:
- Artista: stageName primary, name secondary
- Sorting by stageName/name
- Consistent across all uses

**Files**:
- `frontend/src/components/common/EntityCard.tsx`
- Update all display logic

#### 2.6 Date Picker Implementation (Estimated: 4-8 hours)

**Solution**:
- Implement or integrate date-picker component
- Replace Fabrica day/month/year inputs
- Use for all date fields

**Files**:
- New/Install: Date picker library
- Update: `EntityMetadataEditor.tsx`

**Total Priority 2 Estimated Time**: 30-60 hours

### 14.3 Priority 3: Performance Optimization (Week 4)

#### 3.1 Batch Relationship Fetching (Estimated: 4-8 hours)

**Solution**:
- Create admin endpoint: `GET /api/admin/{type}/{id}/relationships`
- Update RelatedEntities to use batch endpoint

**Files**:
- New/Enhance: `backend/src/server/api/admin/relationships.ts`
- Update: `RelatedEntities.tsx`

#### 3.2 Client-Side Caching (Estimated: 8-16 hours) - DEFERRED

**Decision**: Defer until after full DB population to evaluate performance impact

**Options**:
- React Query or SWR
- Cache TTL configuration
- Invalidation rules

#### 3.3 Database Indexes (Estimated: 4-8 hours) - DEFERRED

**Decision**: Defer until after full DB population

**Implementation**:
- Create indexes based on query patterns
- Full-text search indexes
- Monitor and adjust

**Total Priority 3 Estimated Time**: 4-8 hours (immediate), 12-24 hours (deferred)

### 14.4 Priority 4: Advanced Features (Week 5-6) - DEFERRED

All Priority 4 items deferred to future phases:

- Undo/Redo (8-16 hours)
- Bulk Operations (16-24 hours)
- CSV Import/Export (16-32 hours) - in progress separately
- Approval Workflow (24-40 hours) - deferred
- Audit Trail (16-24 hours) - simple change log in future

**Total Priority 4 Estimated Time**: Deferred

### 14.5 Database Schema Updates (Ongoing)

#### Immediate Changes

1. **Remove DB Constraints**:
   - Jingle: `isJinglazo`, `isJinglazoDelDia`, `isPrecario` no longer required
   - Artista: `isArg` no longer required

2. **Update DB Constraints**:
   - Artista: Make `name` OR `stageName` required (at least one)

3. **Add Entity Status**:
   - Add `status` field to Jingle, Cancion, Artista, Tematica
   - Default: `DRAFT`
   - Values: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED

4. **Standardize Relationship Properties**:
   - Add `status`, `createdAt` to all relationships (except SOY_YO, REACCIONA_A)

#### Future Changes (Deferred)

- Database indexes (after full DB)
- Migration system
- Audit trail tables
- Batch operation support

---

## 15. Implementation Sequence

### Phase 1: Critical Fixes (Week 1)

**Goal**: Fix broken functionality, stabilize existing features

**Tasks**:
1. Implement RelatedEntities.refresh() method
2. Create ErrorDisplay and Toast components
3. Always start in view mode
4. Track all changes for unsaved warning
5. Add basic validation to all forms
6. Test all entity creation flows
7. Fix navigation bugs

**Deliverables**:
- All relationship creation flows work correctly
- New relationships visible immediately after creation
- Errors displayed consistently
- No console errors on entity pages
- Edit mode behavior predictable

**Success Criteria**:
- Zero critical bugs
- All entity types can be created and edited
- All relationship types can be created and are visible

### Phase 2: Consistency Improvements (Week 2-3)

**Goal**: Make UX consistent across all entities

**Tasks**:
1. Create EntitySearchAutocomplete component
2. Standardize entity creation flow via Dashboard
3. Implement field configuration system with Zod validation
4. Blank rows only appear in edit mode
5. Update Artista display logic (stageName primary)
6. Implement date-picker for Fabrica dates
7. Document all field behaviors
8. Add "New" button to EntityList pages

**Deliverables**:
- Unified autocomplete in all relationship creation
- Predictable entity creation flow
- Shared validation schemas (frontend/backend)
- Consistent field display across entities
- Clear documentation

**Success Criteria**:
- Same search experience everywhere
- Same validation rules frontend/backend
- All entity types behave consistently
- Admin can quickly learn patterns

### Phase 3: Performance Optimization (Week 4)

**Goal**: Improve performance of admin portal

**Tasks**:
1. Create batch relationship fetching endpoint
2. Update RelatedEntities to use batch endpoint
3. Test performance improvements
4. **Deferred**: Evaluate caching strategy after full DB
5. **Deferred**: Add database indexes after full DB

**Deliverables**:
- Batch relationship endpoint implemented
- N+1 query problem solved
- Entity pages load faster

**Success Criteria**:
- Page load time improved
- Fewer API calls per page
- Smooth user experience

### Phase 4: Advanced Features (Week 5-8) - DEFERRED

**Status**: All advanced features deferred to future phases

**Potential Future Work**:
- Undo/Redo functionality
- Bulk operations on EntityList
- Enhanced approval workflow
- Audit trail implementation
- CSV import (in progress separately)

### Phase 5: Database Schema Updates (Ongoing)

**Immediate** (alongside Phase 1-2):
- Remove Jingle boolean DB constraints
- Update Artista name/stageName requirement
- Add entity lifecycle status field
- Standardize relationship properties

**Deferred** (after full DB):
- Database indexes
- Migration system
- Performance tuning

---

## 16. Decision Summary and Open Items

### 16.1 Decisions Made

**Architecture**:
- ✅ Keep unified AdminEntityAnalyze approach
- ✅ Keep current relationship directions
- ✅ Keep redundant properties for performance
- ✅ Always start in view mode

**Components**:
- ✅ Implement refresh() method in RelatedEntities
- ✅ Blank rows only appear when isEditing={true}
- ✅ Unified autocomplete component for search
- ✅ Shared validation schemas (Zod)

**Entity-Specific**:
- ✅ Fabrica: Use date-picker, keep YouTube ID as editable
- ✅ Jingle: Remove DB constraints on boolean flags
- ✅ Jingle: Fabrica and Cancion relationships max 1 (hide blank row when exists)
- ✅ Jingle: Autor relationship read-only (derived)
- ✅ Artista: stageName primary, name secondary in display
- ✅ Artista: name OR stageName required (at least one)
- ✅ Artista: isArg auto-managed from nationality, hidden in UI

**Error Handling**:
- ✅ Standardized toast notifications for non-critical errors
- ✅ Modal dialogs for critical errors
- ✅ Field-level validation with highlighting
- ✅ Network error retry logic

**Performance**:
- ✅ Batch relationship fetching (Priority 3)
- ⏸️ Caching strategy (deferred until full DB)
- ⏸️ Database indexes (deferred until full DB)

**Future Features**:
- ⏸️ Approval workflow (deferred)
- ⏸️ Audit trail (simple change log, deferred)
- ⏸️ Batch operations (deferred, separate import in progress)
- ⏸️ Undo/Redo (deferred)

### 16.2 Open Items for Clarification

#### Technical Decisions Pending Full DB

1. **Search Implementation**: Neo4j full-text search vs Elasticsearch
   - **Status**: Deferred until full DB populated
   - **Why**: Need real performance data to decide

2. **Caching Strategy**: Client-side, server-side, or both? What TTLs?
   - **Status**: Deferred until full DB populated
   - **Why**: Need real usage patterns to optimize

3. **Performance Targets**: Acceptable thresholds for admin portal
   - **Status**: Deferred until full DB populated
   - **Why**: Admin portal not public-facing, can be more flexible

#### Implementation Details

4. **EntityForm Edit Mode**: When is edit mode in EntityForm used?
   - **Status**: To be clarified during implementation
   - **Impact**: Low - may unify with EntityMetadataEditor

5. **AdminHome /search Route**: Remove if Dashboard search sufficient?
   - **Status**: Evaluate after Dashboard search implemented
   - **Impact**: Low - route can be deprecated gradually

6. **URL Parameter ?edit=true**: Needed for deep links?
   - **Status**: Optional enhancement, decide during implementation
   - **Impact**: Low - nice-to-have

7. **Artista Uniqueness**: name OR stageName unique at DB level?
   - **Status**: To be decided during DB schema update
   - **Impact**: Medium - affects validation and user experience

### 16.3 Pre-MVP Flexibility

**Confirmed**:
- ✅ Can break backward compatibility freely
- ✅ Can change API endpoints/contracts without versioning
- ✅ Can modify DB schema as needed
- ✅ Focus on getting it right, not maintaining old patterns

---

## 17. Testing Checklist

### 17.1 Entity Operations (All Types)

- [ ] Create entity of each type
- [ ] Edit entity metadata for each type
- [ ] Save changes and verify persistence
- [ ] Cancel changes and verify no save
- [ ] Navigate away with unsaved changes → Modal appears
- [ ] Validation errors display correctly
- [ ] Required fields enforced

### 17.2 Relationship Operations (All Types)

- [ ] Add relationship from blank row
- [ ] Relationship visible immediately after creation
- [ ] Edit relationship properties
- [ ] Delete relationship
- [ ] Max cardinality enforced (Jingle→Fabrica, Jingle→Cancion)
- [ ] Derived relationships read-only (Jingle→Autor)

### 17.3 Search and Creation

- [ ] Search for entities via autocomplete
- [ ] Create new entity from blank row (+ button)
- [ ] Entity created with relationship context
- [ ] Navigate back to source → New relationship visible
- [ ] Pre-population works correctly

### 17.4 UI/UX

- [ ] Always starts in view mode
- [ ] Edit button activates edit mode
- [ ] Blank rows only in edit mode
- [ ] Error messages displayed consistently
- [ ] Toast notifications for non-critical errors
- [ ] Modal dialogs for critical errors
- [ ] Browser back button triggers unsaved check

### 17.5 Entity-Specific

**Fabrica**:
- [ ] Date picker works correctly
- [ ] YouTube URL auto-generated from ID
- [ ] Status dropdown works
- [ ] Contents field always shown

**Jingle**:
- [ ] Fabrica relationship max 1
- [ ] Cancion relationship max 1
- [ ] Autor relationship read-only
- [ ] Boolean flags optional (no DB error)
- [ ] Order validation based on timestamp

**Artista**:
- [ ] stageName shown as primary (if present)
- [ ] name shown as secondary (if different)
- [ ] Nationality dropdown works
- [ ] isArg auto-set from nationality
- [ ] At least one of name/stageName required

### 17.6 Performance

- [ ] Entity pages load < 2 seconds
- [ ] Search results appear < 1 second
- [ ] No console errors
- [ ] No N+1 queries (after batch endpoint implemented)

### 17.7 Edge Cases

- [ ] Empty entity list
- [ ] Entity with no relationships
- [ ] Entity with many relationships (100+)
- [ ] Long text fields (1000+ characters)
- [ ] Special characters in names/titles
- [ ] Concurrent edits (two admins)
- [ ] Network disconnection/reconnection

---

## Appendix A: Component Reference

### Core Admin Components

| Component              | Path                                                   | Purpose                          | Ref Methods                   |
| ---------------------- | ------------------------------------------------------ | -------------------------------- | ----------------------------- |
| AdminEntityAnalyze     | `frontend/src/pages/admin/AdminEntityAnalyze.tsx`      | Unified entity detail page       | -                             |
| EntityMetadataEditor   | `frontend/src/components/admin/EntityMetadataEditor.tsx` | Inline metadata editing          | `hasUnsavedChanges()`, `save()` |
| RelatedEntities        | `frontend/src/components/common/RelatedEntities.tsx`   | Relationship management          | `refresh()` (to implement), `hasUnsavedChanges()` (to implement) |
| EntityForm             | `frontend/src/components/admin/EntityForm.tsx`         | Entity creation/edit form        | -                             |
| RelationshipForm       | `frontend/src/components/admin/RelationshipForm.tsx`   | Relationship creation form       | -                             |
| EntityList             | `frontend/src/components/admin/EntityList.tsx`         | Paginated entity list            | -                             |
| EntityCard             | `frontend/src/components/common/EntityCard.tsx`        | Entity display (heading/contents/box) | -                             |
| UnsavedChangesModal    | `frontend/src/components/admin/UnsavedChangesModal.tsx` | Warn about unsaved changes       | -                             |

### To Be Created

| Component                | Path                                                        | Purpose                          |
| ------------------------ | ----------------------------------------------------------- | -------------------------------- |
| EntitySearchAutocomplete | `frontend/src/components/admin/EntitySearchAutocomplete.tsx` | Unified search with autocomplete |
| ErrorDisplay             | `frontend/src/components/common/ErrorDisplay.tsx`           | Standardized error display       |
| Toast                    | `frontend/src/components/common/Toast.tsx`                  | Toast notifications              |

---

## Appendix B: Entity Quick Reference

| Entity   | Prefix | Required Fields                | Key Relationships                              | Notes                              |
| -------- | ------ | ------------------------------ | ---------------------------------------------- | ---------------------------------- |
| Fabrica  | f      | id, title, date                | ← APPEARS_IN (from Jingle)                     | YouTube ID editable, use date-picker |
| Jingle   | j      | none (recommend title/comment) | → APPEARS_IN, VERSIONA, TAGGED_WITH, ← JINGLERO_DE | Special cardinality rules, derived Autor |
| Cancion  | c      | title                          | ← VERSIONA (from Jingle), ← AUTOR_DE (from Artista) | Standard entity                    |
| Artista  | a      | name OR stageName              | → AUTOR_DE, JINGLERO_DE                        | Display stageName primary          |
| Tematica | t      | name                           | ← TAGGED_WITH (from Jingle)                    | Category dropdown                  |

---

## Appendix C: Relationship Quick Reference

| Relationship | Start   | End      | Cardinality | Key Properties              | Special Rules                    |
| ------------ | ------- | -------- | ----------- | --------------------------- | -------------------------------- |
| APPEARS_IN   | Jingle  | Fabrica  | M:1 (max 1) | order, timestamp, status    | Hide blank row when exists       |
| VERSIONA     | Jingle  | Cancion  | M:1 (max 1) | status                      | Hide blank row when exists       |
| AUTOR_DE     | Artista | Cancion  | M:N         | status                      | Read-only in Jingle context      |
| JINGLERO_DE  | Artista | Jingle   | M:N         | status                      | Distinct from Autor              |
| TAGGED_WITH  | Jingle  | Tematica | M:N         | isPrimary, status           | Only one isPrimary per Jingle    |
| SOY_YO       | Usuario | Artista  | 1:1         | Special workflow properties | Not managed in typical admin pages |
| REACCIONA_A  | Usuario | Jingle   | M:N         | type, removedAt             | Public interface, not admin      |

---

**End of Document**

**Document Version**: 2.0  
**Last Updated**: November 14, 2025  
**Status**: Approved for Implementation  
**Review**: After Phase 1 completion

**Key Changes from R1**:
- Incorporated all APPROVED decisions
- Removed or clarified open questions with RESPONSES
- Deferred performance decisions until full DB populated
- Clarified implementation priorities and estimates
- Removed verbose examples for conciseness
- Added decision summary and open items section
- Ready for implementation teams


