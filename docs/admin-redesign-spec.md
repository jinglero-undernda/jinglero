# Admin Portal Redesign Specification

**Date:** 2025-01-XX  
**Task:** 6.0.1 - Deep Dive Analysis and Redesign of Admin Pages and Components  
**Status:** Complete  
**Related Documents:**

- `docs/admin-redesign-analysis.md` - Analysis of current state
- `docs/admin-portal-specification.md` - Functional requirements

## Overview

This document specifies the redesign of the admin portal to align with the refactored entity inspection architecture, leverage shared components, and provide a consistent, maintainable codebase.

## Design Principles

1. **Consistency with Public Pages** - Admin pages should use the same components and patterns as public entity inspection pages
2. **Code Reuse** - Maximize use of shared components (`EntityCard`, `RelatedEntities`, relationship configs)
3. **Functionality Over Aesthetics** - Per PRD, prioritize functionality over visual polish
4. **Unified Architecture** - Single unified entity page instead of entity-specific pages
5. **Schema-Driven** - Use shared configurations instead of hardcoded definitions

## 1. Unified Admin Entity Page Architecture

### 1.1 Single Unified Page: AdminEntityAnalyze

**Goal:** Replace all entity-specific admin pages with a single unified page.

**Route:** `/admin/:entityType/:entityId`

**Component:** `AdminEntityAnalyze.tsx` (enhanced version of current implementation)

**Responsibilities:**

1. Load entity from admin API
2. Display entity using `EntityCard` in edit mode
3. Display relationships using `RelatedEntities` with `isAdmin={true}`
4. Handle entity metadata editing
5. Display validation status inline
6. Provide quick actions (delete, view public page, etc.)

### 1.2 Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ Admin Navigation Header (see section 2.1)              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Entity Metadata Section                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ EntityCard (heading variant, edit mode)            │ │
│ │ - Entity ID                                        │ │
│ │ - Entity title/name                                │ │
│ │ - All entity metadata fields (editable)            │ │
│ │ - [GUARDAR] [CANCELAR] buttons                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Related Entities Section                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ RelatedEntities (isAdmin={true}, enhanced)         │ │
│ │ - All relationships displayed                       │ │
│ │ - Relationship creation (blank rows)                │ │
│ │ - Relationship deletion (X buttons)                 │ │
│ │ - Relationship property editing                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Validation Status Section (optional, inline)            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Validation issues for this entity                   │ │
│ │ - Warning icons on relationships with issues        │ │
│ │ - Fix buttons for auto-fixable issues               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Quick Actions                                           │
│ [Delete Entity] [View Public Page] [Duplicate]         │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Implementation Details

#### 1.3.1 Entity Loading

- Use admin API (`adminApi.getJingle()`, `adminApi.getFabrica()`, etc.)
- Handle loading and error states consistently
- Normalize entity type using `normalizeEntityType()` utility

#### 1.3.2 Entity Metadata Editing

- **Use separate `EntityMetadataEditor` component** (decision: Option B - keep EntityCard focused on display)
- Support all entity properties from refined schema
- **Exclude fields that should NOT be shown** (see below)
- Show validation errors inline
- Save all changes at once when "GUARDAR" button clicked
- Refresh form after save to allow continued editing

**Fields to Exclude from Metadata Editor:**
- Auto-managed fields: `createdAt`, `updatedAt` (updated automatically on creation/modification)
- Redundant fields derived from relationships:
  - `Jingle.fabricaId`, `Jingle.fabricaDate`, `Jingle.cancionId` (redundant with relationships)
  - `Cancion.autorIds` (redundant with AUTOR_DE relationships)
  - `Artista.idUsuario` (inherited from SOY_YO relationship)
- Redundant fields that can be derived:
  - `Fabrica.youtubeUrl` (redundant - can be derived from Fabrica ID)
- Inherited/derived fields:
  - `Jingle.youtubeUrl` (derived from Fabrica URL and timestamp)
  - `Jingle.timestamp` (derived from APPEARS_IN relationship)
  - `Jingle.songTitle`, `Jingle.artistName`, `Jingle.genre` (inherited from Cancion)
- Future features (deferred):
  - `Fabrica.visualizations`, `Fabrica.likes` (YouTube stats mining for prioritization - deferred to later phases)
- See APPENDIX in `admin-portal-specification.md` for complete list of fields marked as "NOT SHOWN METADATA"

#### 1.3.3 Relationship Display

- Use `RelatedEntities` with `isAdmin={true}`
- Remove redundant relationships table
- Enhance Admin Mode with relationship management capabilities

#### 1.3.4 Validation Status

- Display validation issues inline (not in separate section)
- Show warning icons on relationship rows with issues
- Provide fix buttons for auto-fixable issues
- Link to full validation report

## 2. Navigation and Routing

### 2.1 Admin Navigation Header

**Component:** `AdminNavigationHeader.tsx` (new)

**Features:**

- "MODO ADMIN" indicator/badge
- Links to Admin Home, Dashboard
- Current entity context (breadcrumbs optional, per spec)
- Logout button (when authentication is implemented)

**Implementation:**

- Reuse public header component with admin indicator
- Add admin-specific navigation links
- Support deep linking (prepare for future "Edit" links from public pages)

### 2.2 Routing Structure

**Routes:**

- `/admin` - AdminHome (entity selection)
- `/admin/dashboard` - AdminDashboard (entity counts, validation status, quick actions)
- `/admin/:entityType/:entityId` - AdminEntityAnalyze (unified entity page)
- `/admin/login` - AdminLogin (authentication, Task 6.3)

**Legacy Routes (backward compatibility):**

- `/admin/j/:id` → redirect to `/admin/jingle/:id`
- `/admin/f/:id` → redirect to `/admin/fabrica/:id`
- `/admin/a/:id` → redirect to `/admin/artista/:id`
- `/admin/c/:id` → redirect to `/admin/cancion/:id`
- `/admin/t/:id` → redirect to `/admin/tematica/:id`

**Route Prefix Mapping:**

- `j` → `jingle`
- `f` → `fabrica`
- `a` → `artista`
- `c` → `cancion`
- `t` → `tematica`

### 2.3 Navigation Flow

```
AdminHome (entity selection)
    ↓ (select entity)
AdminEntityAnalyze (unified entity page)
    ↓ (click related entity)
AdminEntityAnalyze (different entity)
    ↓ (click "View Public Page")
Public Inspection Page
    ↓ (future: "Edit" link)
AdminEntityAnalyze (back to admin)
```

## 3. Enhanced RelatedEntities Admin Mode

### 3.1 Current Admin Mode Features (Preserve)

- ✅ Eager loading of all relationships
- ✅ No cycle prevention
- ✅ Immediate visibility of all relationships
- ✅ Blank rows for relationship creation (placeholder)

### 3.2 Enhancements Needed

#### 3.2.1 Relationship Creation via Blank Rows

**UI Pattern:**

```
[Relationship Group: "Canciones versionadas"]
  [Existing Cancion Cards...]

  [Blank Row - Add New Relationship]
    Search: [________________] [Search Icon] [+ Create New]
            └─ Dropdown with search results
            └─ "Create new Cancion" option if no results

    Selected Entity: [Entity Card Preview]
    Relationship Properties: [editable fields]
    [Add Relationship] [Cancel]
```

**Implementation:**

- Add search input to blank rows
- Integrate with search API for autocomplete
- Show search results in dropdown
- Allow selecting existing entity
- Show "Create new [EntityType]" option if no results
- On entity selection, show relationship properties form
- Create relationship via admin API
- Refresh RelatedEntities after creation

**Search Integration:**

- Use existing search API (`/api/search` with autocomplete)
- Filter by entity type (relationship type context determines entity type)
- Show entity cards in dropdown for selection

**New Entity Creation Flow:**

- Click "+ Create New" or "Create new [EntityType]" option
- Navigate to new page (not modal) for entity creation
- Pre-populate form with:
  - Main name/title from search text
  - Generated ID
  - Relationship context (e.g., `fabricaId` if creating Jingle from Fabrica)
- After entity creation, automatically create relationship
- Navigate back to admin entity page
- Refresh RelatedEntities to show new entity and relationship

#### 3.2.2 Relationship Deletion

**UI Pattern:**

```
[Relationship Row]
  [Entity Card] [Expand Button] [X Delete Button]
```

**Implementation:**

- Add red X button to each relationship row
- Show confirmation dialog on click
- Delete relationship via admin API (`DELETE /api/admin/relationships/:relType`)
- Refresh RelatedEntities after deletion

#### 3.2.3 Relationship Property Editing

**UI Pattern:**

```
[Relationship Row] [Expand Button] [X Delete Button]
  [Relationship Properties] (shown when expanded)
    - status: [DRAFT | CONFIRMED] (dropdown)
    - timestamp: [____] (text input)
    - order: [____] (number input)
    - isPrimary: [ ] (checkbox)
    [Save Properties] [Cancel]
```

**Implementation:**

- Add expand/collapse functionality for relationship rows in Admin Mode
- Show relationship properties as editable fields when expanded
- Support all relationship property types (status, timestamp, order, isPrimary, etc.)
- Save properties via admin API (update relationship endpoint)
- Refresh RelatedEntities after save

#### 3.2.4 Entity Metadata Editing Integration

**UI Pattern:**

```
[Entity Heading Row]
  [GUARDAR] [CANCELAR] buttons (greyed out until changes)
  [Entity Metadata Fields]
    - id: [____] (read-only or editable)
    - title: [____] (text input)
    - ... (all entity properties)
```

**Implementation:**

- Add entity metadata editing section above RelatedEntities
- Use EntityCard in edit mode or create EntityMetadataEditor component
- Support all entity properties from refined schema
- Show validation errors inline
- Save all changes at once when "GUARDAR" clicked
- Refresh RelatedEntities after save

### 3.3 Validation Integration

**Display Validation Issues:**

- Show warning icon (⚠️) on relationship rows with validation issues
- Tooltip shows issue details on hover
- Click warning icon to see full validation details

**Validation Issue Types:**

- Duplicate relationships
- Invalid relationship targets (pointing to non-existent entities)
- Redundant field mismatches (e.g., `Jingle.fabricaId` doesn't match `APPEARS_IN` relationship)

**Fix Actions:**

- Provide "Fix" button (band-aid icon) for auto-fixable issues
- Auto-fix redundant properties to match relationships
- Refresh RelatedEntities after fix

## 4. Component Redesign

### 4.1 EntityCard Enhancement

**New Variant: `edit`**

**Props:**

```typescript
interface EntityCardEditProps {
  entity: Entity;
  entityType: EntityType;
  onSave: (updatedEntity: Partial<Entity>) => Promise<void>;
  onCancel: () => void;
  validationErrors?: Record<string, string>;
}
```

**Features:**

- Display entity properties as editable fields
- Show validation errors inline
- Save/Cancel buttons
- Support all entity property types (text, number, boolean, date, enum, etc.)

**Alternative:** Create separate `EntityMetadataEditor` component instead of adding edit variant to EntityCard.

### 4.2 RelatedEntities Enhancement

**New Props:**

```typescript
interface RelatedEntitiesAdminProps {
  // ... existing props
  onRelationshipCreate?: (
    relType: string,
    targetEntityId: string,
    properties?: Record<string, any>
  ) => Promise<void>;
  onRelationshipDelete?: (
    relType: string,
    targetEntityId: string
  ) => Promise<void>;
  onRelationshipUpdate?: (
    relType: string,
    targetEntityId: string,
    properties: Record<string, any>
  ) => Promise<void>;
  onEntityCreate?: (
    entityType: EntityType,
    initialData: Partial<Entity>
  ) => Promise<Entity>;
  validationIssues?: Record<string, ValidationIssue[]>;
}
```

**Enhancements:**

- Add search input to blank rows
- Add delete button to relationship rows
- Add expand/collapse for relationship properties
- Add relationship property editing
- Display validation issues inline

### 4.3 EntityForm Enhancement

**Enhancements:**

- Integrate with validation API (`POST /api/admin/validate/entity/:type/:id`)
- Add real-time validation feedback
- Support all entity types with dynamic field generation
- Support all entity properties from refined schema
- Integrate with relationship creation workflow

**Field Generation:**

- Extract field definitions to shared configuration
- Generate fields from schema or configuration
- Support complex field types (dates, enums, arrays, etc.)

### 4.4 EntityList Enhancement

**Enhancements:**

- Add filtering and sorting UI
- Add pagination
- Add bulk selection (checkboxes)
- Add search functionality
- Use admin API for optimized queries
- Add quick actions (edit, delete, view relationships)

### 4.5 New Components

#### 4.5.1 EntityMetadataEditor

**Purpose:** Inline editing of entity metadata

**Decision:** Create separate `EntityMetadataEditor` component (Option B) to keep EntityCard focused on display.

**Props:**

```typescript
interface EntityMetadataEditorProps {
  entity: Entity;
  entityType: EntityType;
  onSave: (updatedEntity: Partial<Entity>) => Promise<void>;
  onCancel: () => void;
  validationErrors?: Record<string, string>;
}
```

**Features:**

- Display entity properties as editable fields (excluding fields marked as "NOT SHOWN" - see below)
- Support all property types (text, number, boolean, date, datetime, enum, array)
- Show validation errors inline
- Save/Cancel buttons (GUARDAR/CANCELAR)
- Buttons greyed out until changes are made

**Fields to Exclude:**
- Auto-managed: `createdAt`, `updatedAt`
- Redundant (with relationships): `Jingle.fabricaId`, `Jingle.fabricaDate`, `Jingle.cancionId`, `Cancion.autorIds`, `Artista.idUsuario`
- Redundant (derivable): `Fabrica.youtubeUrl` (can be derived from Fabrica ID)
- Inherited/derived: `Jingle.youtubeUrl`, `Jingle.timestamp`, `Jingle.songTitle`, `Jingle.artistName`, `Jingle.genre`
- Future features: `Fabrica.visualizations`, `Fabrica.likes` (deferred to later phases)
- See APPENDIX in `admin-portal-specification.md` for complete list of "NOT SHOWN METADATA" fields

#### 4.5.2 RelationshipSearchInput

**Purpose:** Search and select entities for relationship creation

**Props:**

```typescript
interface RelationshipSearchInputProps {
  entityType: EntityType;
  onSelect: (entity: Entity) => void;
  onCreateNew: () => void;
  placeholder?: string;
}
```

**Features:**

- Autocomplete search
- Entity type filtering
- "Create new" option
- Entity card preview in dropdown

#### 4.5.3 RelationshipPropertyEditor

**Purpose:** Edit relationship properties

**Props:**

```typescript
interface RelationshipPropertyEditorProps {
  relType: string;
  properties: Record<string, any>;
  onSave: (properties: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}
```

**Features:**

- Display relationship properties as editable fields
- Support all property types
- Save/Cancel buttons

#### 4.5.4 AdminNavigationHeader

**Purpose:** Consistent admin navigation

**Props:**

```typescript
interface AdminNavigationHeaderProps {
  currentEntity?: { type: EntityType; id: string; title?: string };
  showBreadcrumbs?: boolean;
}
```

**Features:**

- "MODO ADMIN" indicator
- Navigation links
- Current entity context
- Logout button

## 5. Shared Configuration

### 5.1 Entity Field Definitions

**File:** `frontend/src/lib/config/entityFields.ts`

**Purpose:** Centralized field definitions for all entity types

**Source of Truth:** Database schema (`backend/src/server/db/schema/schema.ts`) is the primary source. The APPENDIX in `admin-portal-specification.md` provides guidance on which fields should be shown/edited in the admin portal.

**Note:** If there are discrepancies between the database schema and the APPENDIX, the database schema takes precedence, but consult with the team to resolve discrepancies.

**Structure:**

```typescript
export interface EntityFieldDefinition {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "date" | "datetime" | "enum" | "array";
  required?: boolean;
  readonly?: boolean;
  options?: string[]; // for enum type
  validation?: (value: any) => string | null;
}

export const ENTITY_FIELDS: Record<EntityType, EntityFieldDefinition[]> = {
  fabrica: [
    { name: "id", label: "ID", type: "text", required: true, readonly: true },
    { name: "title", label: "Título", type: "text", required: true },
    { name: "date", label: "Fecha", type: "datetime", required: true },
    { name: "description", label: "Descripción", type: "text", required: false },
    { name: "contents", label: "Contenido", type: "text", required: false },
    { name: "status", label: "Estado", type: "enum", options: ["DRAFT", "PROCESSING", "COMPLETED"], required: false },
    // Excluded: youtubeUrl (redundant - can be derived from Fabrica ID)
    // Excluded: visualizations, likes (future feature - YouTube stats mining for prioritization)
    // Excluded: createdAt, updatedAt (auto-managed)
  ],
  jingle: [
    { name: "id", label: "ID", type: "text", required: false, readonly: false }, // Generated if not provided
    { name: "youtubeClipUrl", label: "YouTube Clip URL", type: "text", required: false },
    { name: "title", label: "Título", type: "text", required: false },
    { name: "comment", label: "Comentario", type: "text", required: false },
    { name: "lyrics", label: "Letra", type: "text", required: false },
    { name: "isJinglazo", label: "Es Jinglazo", type: "boolean", required: false },
    { name: "isJinglazoDelDia", label: "Es Jinglazo del Día", type: "boolean", required: false },
    { name: "isPrecario", label: "Es Precario", type: "boolean", required: false },
    { name: "isLive", label: "Es en Vivo", type: "boolean", required: false },
    { name: "isRepeat", label: "Es Repetición", type: "boolean", required: false },
    // Excluded: youtubeUrl, timestamp, songTitle, artistName, genre (inherited/derived)
    // Excluded: fabricaId, fabricaDate, cancionId (redundant with relationships)
    // Excluded: createdAt, updatedAt (auto-managed)
  ],
  // ... other entity types (see database schema and APPENDIX for complete definitions)
};
```

### 5.2 Relationship Property Definitions

**File:** `frontend/src/lib/config/relationshipProperties.ts`

**Purpose:** Centralized relationship property definitions

**Structure:**

```typescript
export interface RelationshipPropertyDefinition {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "enum";
  required?: boolean;
  default?: any;
  options?: string[]; // for enum type
}

export const RELATIONSHIP_PROPERTIES: Record<
  string,
  RelationshipPropertyDefinition[]
> = {
  APPEARS_IN: [
    { name: "order", label: "Orden", type: "number", required: true },
    { name: "timestamp", label: "Timestamp", type: "number", required: true },
  ],
  VERSIONA: [
    {
      name: "status",
      label: "Estado",
      type: "enum",
      options: ["DRAFT", "CONFIRMED"],
      default: "DRAFT",
    },
  ],
  // ... other relationship types
};
```

## 6. API Integration

### 6.1 Standardize on Admin API

**Current Issue:** Some admin pages use public API, others use admin API.

**Solution:** Use admin API for all admin pages.

**API Methods:**

- `adminApi.getJingle(id)`
- `adminApi.getFabrica(id)`
- `adminApi.getArtista(id)`
- `adminApi.getCancion(id)`
- `adminApi.getTematica(id)`
- `adminApi.updateJingle(id, data)`
- `adminApi.updateFabrica(id, data)`
- `adminApi.createRelationship(payload)`
- `adminApi.deleteRelationship(relType, startId, endId)`
- `adminApi.updateRelationship(relType, startId, endId, properties)`

### 6.2 New API Endpoints Needed

**Relationship Updates:**

- `PUT /api/admin/relationships/:relType` - Update relationship properties

**Entity Validation:**

- `POST /api/admin/validate/entity/:type/:id` - Validate entity (Task 6.6)

**Search:**

- `GET /api/search?q=...&type=...` - Search entities (may already exist)

## 7. Migration Plan

### 7.1 Phase 1: Foundation (Tasks 6.1-6.4)

- Implement authentication
- Create admin navigation header
- Standardize API usage

### 7.2 Phase 2: Enhance RelatedEntities Admin Mode

- Add relationship creation UI to blank rows
- Add relationship deletion UI
- Add relationship property editing
- Add entity metadata editing integration

### 7.3 Phase 3: Enhance AdminEntityAnalyze

- Add entity metadata editing
- Remove redundant relationships table
- Add validation status display
- Add quick actions

### 7.4 Phase 4: Deprecate Legacy Pages

- Redirect legacy routes to unified route
- Remove legacy entity-specific pages
- Update all internal links

### 7.5 Phase 5: Enhance Components

- Enhance EntityForm with validation
- Enhance EntityList with filtering/pagination
- Create new components (EntityMetadataEditor, etc.)

### 7.6 Phase 6: Extract Shared Configurations

- Create entity field definitions
- Create relationship property definitions
- Update components to use shared configs

### 7.7 Phase 7: Testing and Refinement

- Test all workflows
- Fix issues
- Performance optimization

## 8. Implementation Checklist

### 8.1 Immediate (High Priority)

- [ ] Enhance RelatedEntities Admin Mode with relationship creation
- [ ] Enhance RelatedEntities Admin Mode with relationship deletion
- [ ] Enhance RelatedEntities Admin Mode with relationship property editing
- [ ] Add entity metadata editing to AdminEntityAnalyze
- [ ] Remove redundant relationships table from AdminEntityAnalyze
- [ ] Standardize API usage (use admin API everywhere)
- [ ] Create admin navigation header
- [ ] Redirect legacy routes to unified route

### 8.2 Short-term (Medium Priority)

- [ ] Create EntityMetadataEditor component
- [ ] Create RelationshipSearchInput component
- [ ] Create RelationshipPropertyEditor component
- [ ] Extract entity field definitions to shared config
- [ ] Extract relationship property definitions to shared config
- [ ] Enhance EntityForm with validation
- [ ] Enhance EntityList with filtering/pagination
- [ ] Add validation status display to AdminEntityAnalyze

### 8.3 Long-term (Lower Priority)

- [ ] Add bulk operations UI
- [ ] Performance optimizations (pagination, lazy loading)
- [ ] Advanced search functionality
- [ ] Schema-driven form generation

## 9. Success Criteria

- [ ] All admin pages use shared components (`EntityCard`, `RelatedEntities`)
- [ ] Single unified entity page replaces all entity-specific pages
- [ ] RelatedEntities Admin Mode supports relationship creation/deletion/editing
- [ ] Entity metadata can be edited inline
- [ ] All admin pages use admin API
- [ ] No redundant code (relationships table, legacy pages)
- [ ] Consistent navigation and routing
- [ ] Validation status displayed inline
- [ ] All entity properties from refined schema are editable

## 10. Discrepancies Resolved

### 10.1 Fabrica Entity Fields

**Issue:** Database schema includes fields not listed in APPENDIX:
- `youtubeUrl: string`
- `visualizations: number`
- `likes: number`

**Resolution:**
- ✅ `youtubeUrl`: **Excluded** - Redundant field (can be derived from Fabrica ID)
- ✅ `visualizations`: **Excluded** - Future feature (YouTube stats mining for prioritization, deferred to later development phases)
- ✅ `likes`: **Excluded** - Future feature (YouTube stats mining for prioritization, deferred to later development phases)

**Action:** These fields will not be shown in the EntityMetadataEditor component.

## 11. Open Questions

1. **EntityCard edit variant vs separate EntityMetadataEditor component?**

   - ✅ **RESOLVED:** Create separate `EntityMetadataEditor` component (Option B) to keep EntityCard focused on display

2. **Relationship property editing: inline or separate form?**

   - ✅ **RESOLVED:** Inline editing when relationship row is expanded (per admin-portal-specification.md)

3. **Validation status: separate section or inline?**

   - ✅ **RESOLVED:** Inline (warning icons on relationships, fix buttons) (per admin-portal-specification.md)

4. **Breadcrumbs: include or not?**
   - ✅ **RESOLVED:** Not for now (per admin-portal-specification.md), but prepare for future

---

**Document Status:** Complete  
**Next Steps:** Begin implementation with Phase 1 (Foundation)
