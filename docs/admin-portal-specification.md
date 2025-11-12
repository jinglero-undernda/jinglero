# Admin Portal Specification

**Status:** Draft - Iterative Design in Progress  
**Last Updated:** 2025-01-XX  
**Related Tasks:** Task 6.0 - Rebuild Admin Portal with Knowledge Graph Validation Tools

## Overview

This document specifies the design and functionality of the Admin Portal for managing the Jinglero knowledge graph database. The admin portal provides tools for content curation, data validation, relationship management, and bulk operations.

## Design Principles

1. **Consistency with Public Pages:** Admin pages should leverage the same components and patterns as public entity inspection pages (`InspectJingle`, `InspectCancion`, etc.) for consistency and code reuse.

2. **Functionality Over Aesthetics:** Per PRD requirements, admin portal prioritizes functionality over visual polish (barebone UX/UI).

3. **Knowledge Graph Focus:** The portal is designed around managing a knowledge graph, with strong emphasis on relationship management and validation.

4. **Iterative Design:** This specification will be refined iteratively based on implementation feedback and user needs.

---

## Core Component: RelatedEntities in Admin Mode

### Current State

The `RelatedEntities` component already supports an `isAdmin={true}` prop that enables:

- Eager loading of all relationships (no lazy loading)
- No cycle prevention (expand/collapse shows relationship properties, not nested related entities)
- Immediate visibility of all relationships
- Blank rows for relationship creation (functionality details below)

### Enhanced Admin Mode Requirements

#### 1. Entity Metadata Editing

**Requirement:** RelatedEntities Admin Mode should provide fields to access and edit entity metadata.

**Implementation Approach:**

- Below the Entity headig row, there will be a section with the entity metadata fields to be edited.
- Support inline editing (edit in place, explicit save button)
- Use `EntityCard` component as the base, but add edit mode

**UI Pattern:**

```
[Entity row - heading]
  - "GUARDAR" button (save the changes) greyed out until changes are made
  - "CANCELAR" button (discard the changes) greyed out until changes are made
  [content-style rows for the entity metadata fields]
  - Entity ID
  - Entity title/name
  - Entity-dependant metadata fields to be edited, inline text fields, tickboxes, dropdowns, etc.
  - DO NOT show the redundant fields derived from relationships (e.g. Fabrica.date)
  - See APPENDIX for the definition of the entity types, metadata, and relationships
```

**Data Flow:**

- Load entity data via admin API (`GET /api/admin/:type/:id`)
- Update entity via admin API (`PUT /api/admin/:type/:id`)
- Show validation feedback inline
- Refresh RelatedEntities after successful update

#### 2. Relationship Management

**Requirement:** Expose existing relationships with ability to view, edit, and delete.

**Current Implementation:**

- RelatedEntities already displays relationships in Admin Mode
- Relationships are shown as related entities grouped by relationship type

**Enhancements Needed:**

**A. Relationship Property Editing:**

- Each relationship row will have a red cross button to delete the relationship.
- Relationship properties will appear as editable rows below the relationship row when expanding the relationship row, using indentation.

**B. Adding Relationships:**

- The page will have a blank row with a text field in all the relationship types that the current entity can have.
- When the Admin starts typing in the field, the possible entities are searched and displayed in a dropdown.
- The Admin can select an entity from the dropdown to add the relationship.
- This will trigger the creation of the relationship via the API, and the relationship property rows will appear underneath.
- When typing, a green "+" button will appear - allowing to create a new entity of the relevant type (assuming the search tit not produce an entity that could be used)

**UI Pattern:**

```
[Relationship Group] - this is simply a wider separation, no title row is shown.
[Existing Relationship contents row] [Expandable row] [X button to delete the relationship]
    [Relationship properties] Shown if expanding the relationship row
[Blank row with a search text field] [+ button to create a new entity of the relevant type]
```

#### 3. Adding New Relationships via Blank Rows

**Requirement:** Blank rows enable adding relationships by:

1. Using search functionality to find existing entities
2. If no existing entity found, kick-start creation of new entity pre-populated as a relationship

**Implementation Approach:**

**A. Blank Row UI:**

- Show a blank row for each relationship type that the current entity can have
- Blank row shows: relationship type label, search input, "Add" button
- When search input is focused, show autocomplete dropdown (reuse SearchBar component logic)

**B. Search Integration:**

- Integrate with existing search API (`/api/search` with autocomplete)
- Show search results in dropdown (grouped by entity type)
- Allow selecting an existing entity from search results
- On selection, create the relationship immediately (or show confirmation)

**C. New Entity Creation Flow:**

- If user types in search and no results found, show "Create new [EntityType]" option
- Clicking "Create new" opens EntityForm modal/page
- Pre-populate the form with:
  - Relationship context (e.g., if creating Jingle from Fabrica, pre-fill `fabricaId`)
  - Any inferred properties from the relationship
- After entity creation, automatically create the relationship
- Refresh RelatedEntities to show new entity and relationship

**UI Pattern:**

```
[Relationship Group: "Canciones versionadas"]
  [Existing Cancion Cards...]

  [Blank Row - Add New Relationship]
    Relationship Type: "VERSIONA"
    Search: [________________] [Search Icon]
            └─ Dropdown with search results
            └─ "Create new Cancion" option if no results

    Selected Entity: [Entity Card Preview]
    [Add Relationship] [Cancel]
```

**Data Flow:**

1. User focuses search input → trigger autocomplete API call
2. User selects existing entity → create relationship via `POST /api/admin/relationships/:relType`
3. User clicks "Create new" → open EntityForm → create entity → create relationship
4. Refresh RelatedEntities to show new relationship

#### 4. Relationship Creation Workflow

**Detailed Flow:**

**Scenario A: Adding Existing Entity as Relationship**

1. User clicks blank row or "Add Relationship" button
2. Search input appears with autocomplete
3. User types entity name/title
4. Autocomplete shows matching entities (grouped by type)
5. User selects entity from dropdown
6. System validates relationship is valid (e.g., Jingle can VERSIONA Cancion)
7. If relationship has properties, show property form (e.g., timestamp for APPEARS_IN)
8. User fills relationship properties (if any)
9. User clicks "Create Relationship"
10. System creates relationship via API
11. RelatedEntities refreshes to show new relationship

**Scenario B: Creating New Entity as Relationship**

1. User clicks blank row or "Add Relationship" button
2. Search input appears with autocomplete
3. User types entity name that doesn't exist
4. Autocomplete shows "Create new [EntityType]" option
5. User clicks "Create new"
6. EntityForm modal/page opens
7. Form is pre-populated with:
   - Relationship context (e.g., `fabricaId` if creating Jingle from Fabrica)
   - Inferred properties (e.g., if creating Cancion from Jingle, pre-fill title)
8. User completes entity creation form
9. System creates entity via `POST /api/admin/:type`
10. System automatically creates relationship via `POST /api/admin/relationships/:relType`
11. RelatedEntities refreshes to show new entity and relationship

**Validation:**

- Validate relationship type is allowed for entity types
- Validate relationship doesn't already exist (prevent duplicates)
- Validate relationship properties (e.g., timestamp format)
- Show validation errors inline

---

## Admin Entity Page Architecture

### Unified Admin Entity Page

**Goal:** Replace entity-specific admin pages (`AdminJingle`, `AdminFabrica`, etc.) with a single unified page.

**Route:** `/admin/:entityType/:entityId`

**Components:**

- Uses `AdminEntityAnalyze` as base (already exists)
- Enhanced with RelatedEntities in Admin Mode (as specified above)
- Entity metadata editing section
- Relationship management section (via RelatedEntities)
- Validation status widget
- Quick actions (delete entity, duplicate, etc.)

**Layout:**

```
[Admin Navigation Header]
  - Breadcrumbs: Admin > [EntityType] > [EntityTitle]
  - Quick Actions: [Edit] [Delete] [Validate] [View Public Page]

[Entity Metadata Section]
  - EntityCard in edit mode
  - All entity properties as editable fields
  - Save/Cancel buttons

[Related Entities Section]
  - RelatedEntities component with isAdmin={true}
  - All relationships displayed
  - Blank rows for adding relationships
  - Inline editing of relationships

[Validation Status Section]
  - Current validation issues for this entity
  - Link to full validation report
  - Quick fix buttons (if applicable)
```

---

## Questions for Iterative Refinement

### RelatedEntities Admin Mode

1. **Entity Editing:**

   - ✅ **RESOLVED:** Inline editing for existing entities (edit in place below entity heading row). For creation of new entities, use a Modal to capture mandatory information.
   - ✅ **RESOLVED:** Save all changes at once when "GUARDAR" button is clicked. After save, refresh the form to allow continued editing (iterative UX, but all-at-once implementation).
   - ✅ **RESOLVED:** Validation error handling deferred to later iteration (not a concern for initial implementation).

2. **Relationship Properties:**

   - ✅ **RESOLVED:** Inline editing for relationship properties (editable rows below relationship row when expanded).
   - ✅ **RESOLVED:** Relationship properties are simple (status, timestamp, order, isPrimary, etc.). Any complexity from new relationships can be handled later. Validation of relationship properties deferred to later iteration.

3. **Blank Rows:**

   - ✅ **RESOLVED:** Blank rows are always visible (not hidden).
   - ✅ **RESOLVED:** Show all existing relationships plus exactly one blank row per relationship type (not multiple blanks).
   - ✅ **RESOLVED:** When an entity is selected from the blank row, relationship properties appear. For mandatory properties, use default logic handling (e.g., auto-fill defaults where possible).

4. **Search Integration:**

   - ✅ **RESOLVED:** Search is entity-type-specific (only show entities that can be related for the specific relationship type being added).
   - ✅ **RESOLVED:** Rely on the expected entity type for the relationship being added (no additional filtering needed - relationship type context determines entity type).
   - ✅ **RESOLVED:** One blank relationship row per relationship group. The relationship type context informs the entity type to search for. Each relationship type has its own blank row, so there's no ambiguity.
   - *Note: Specification logic is clear. These questions were for confirmation. Can revisit if needed in later iteration.*

5. **New Entity Creation:**

   - ✅ **RESOLVED:** Navigate to a new page (not a modal) for entity creation form.
   - ✅ **RESOLVED:** Pre-populate as much as possible: extract the main name/title from the search text entered before clicking "Add" button (entity-dependent field), generate the ID, and add the relationship context (e.g., if creating Cancion from Jingle, pre-fill relationship context).
   - ✅ **RESOLVED:** Creating the entity automatically triggers save/PUT operation and creates the relationship to the newly-created entity. No option to create entity without relationship.

### General Admin Portal

6. **Navigation:**

   - ✅ **RESOLVED:** Reuse the public header with a "MODO ADMIN" tag/indicator to confirm admin login status.
   - ✅ **RESOLVED:** No breadcrumbs for now (similar to public pages).
   - ✅ **RESOLVED:** Support deep linking to specific admin views (e.g., `/admin/jingle/123` should be shareable/bookmarkable and load correctly). Prepare for deep linking now, and add "Edit" feature later (link from public pages to admin pages for browsing vs editing).

7. **Bulk Operations:**

   - ✅ **RESOLVED:** Bulk operations are not expected for the initial iteration. Defer to later.

8. **Validation Integration:**

   **Validation Criteria (Prioritized):**
   - ✅ **RESOLVED:** Focus validation on:
     1. **Duplicate relationships** - Detect and flag duplicate relationships
     2. **Invalid relationship targets** - Relationships pointing to non-existent entities
     3. **Redundant field mismatches** - Redundant properties that don't match their relationships (e.g., `Jingle.fabricaId` doesn't match `APPEARS_IN` relationship, `Jingle.cancionId` doesn't match `VERSIONA`, `Cancion.autorIds` doesn't match `AUTOR_DE` relationships)
   - ✅ **RESOLVED:** Defer validation for:
     - Orphaned nodes (could indicate work in progress or edge cases like INEDITO jingles)
     - Missing relationships (could indicate work in progress or edge cases)
   - ✅ **RESOLVED:** Future consideration: Admin search for missing relationships, flagging orphaned nodes that may need re-linking

   **UI/Display Questions:**
   - ✅ **RESOLVED:** Display validation issues inline (not in a separate section).
   - ✅ **RESOLVED:** Show validation status inline for each relationship - display a warning icon on relationship rows that have validation issues (duplicate, invalid target, mismatch).
   - ✅ **RESOLVED:** Redundant properties should be updated automatically in the background on entity or relationship updates. If an audit routine identifies validation issues, provide a fix button (band-aid icon) to sync redundant properties with relationships.

---

## Next Steps

1. **Review and Refine:** Review this specification and provide feedback on the questions above
2. **Prioritize Features:** Determine which features are MVP-critical vs nice-to-have
3. **Create Detailed UI Mockups:** Create more detailed UI specifications for key workflows
4. **Define API Requirements:** Specify any new API endpoints needed for the enhanced functionality
5. **Implementation Plan:** Break down into specific implementation tasks

---

## Related Documents

- [Task 6.0 Implementation Plan](../tasks/0001-prd-clip-platform-mvp-task6-plan.md)
- [Entity Inspection Pages](../frontend/src/pages/inspect/) - Reference for component patterns
- [RelatedEntities Component](../frontend/src/components/common/RelatedEntities.tsx) - Current implementation

## APPENDIX: Comprehensive definition of entity types, metadata, and relationships

### Fabrica

[Heading row consistent with User mode]
**Entity metadata fields**

- id: string (UUID - Youtube video ID)
- title: string
- date: datetime
- description: string (optional)
- contents: string (based on a comment in the YouTube video, optional)
- status: string (enum: DRAFT, PROCESSING, COMPLETED)
  **NOT SHOWN METADATA - updated on Creation or last modification**
- createdAt: datetime
- updatedAt: datetime
  **Relationships**
- Jingles [APPEARS_IN relationship]
  [Contents row consistent with User mode]
  Properties: - order: number - timestamp: number

### Jingle

[Heading row consistent with User mode]
**Entity metadata fields**:

- id: string (UUID) - generated by the system if not provided
- youtubeClipUrl: string (for clips of the jingle on YouTube, optional)
- title: string (optional)
- comment: string (optional)
- lyrics: string (optional)
- isJinglazo: boolean
- isJinglazoDelDia: boolean
- isPrecario: boolean
- isLive: boolean (optional, indicates if Jingle was performed live)
- isRepeat: boolean (optional, indicates if this song was performed on the show before)
  **NOT SHOWN METADATA - updated on Creation or last modification**
- youtubeUrl: string (based on the Fabrica URL and timestamp)
- timestamp: number (in seconds, derived from the relationship to Fabrica)
- songTitle: string (inherited from the associated Cancion)
- artistName: string (inherited from the associated Cancion's Artista)
- genre: string (optional, inherited from the associated Cancion)
- fabricaId: string (optional, redundant with APPEARS_IN relationship - for performance)
- fabricaDate: datetime (optional, redundant with APPEARS_IN->Fabrica.date - for display/query performance)
- cancionId: string (optional, redundant with VERSIONA relationship - for performance)
- createdAt: datetime
- updatedAt: datetime
  **Relationships**
- Fabrica (APPEARS_IN relationship)
  [Contents row consistent with User mode]
  Properties:
  - order: number
  - timestamp: number
- Cancion (VERSIONA relationship)
  [Contents row showing Title and Autor(es)]
  Properties:
  - status: string (enum: DRAFT, CONFIRMED)
- Jinglero (Artista) (JINGLERO_DE relationship)
  [Contents row consistent with User mode]
  Properties:
  - status: string (enum: DRAFT, CONFIRMED)
- Tematica (TAGGED_WITH relationship)
  [Contents row consistent with User mode]
  Properties:
  - isPrimary: boolean
  - status: string (enum: DRAFT, CONFIRMED)

### Cancion

[Heading row consistent with User mode]
**Entity metadata fields**:

- id: string (UUID - generated by the system if not provided)
- title: string
- album: string (optional)
- year: number (optional)
- genre: string (optional)
- youtubeMusic: string (optional)
- lyrics: string (optional, URL to retrieve lyrics)
  **NOT SHOWN METADATA - updated on Creation or last modification**
- autorIds: string[] (optional, redundant with AUTOR_DE relationships - for performance)
- createdAt: datetime
- updatedAt: datetime
  **Relationships**
- Autor(es) (AUTOR_DE relationship)
  [Contents row consistent with User mode]
  Properties:
  - status: string (enum: DRAFT, CONFIRMED)
- Jingles (VERSIONA relationship)
  [Contents row consistent with User mode]
  Properties:
  - status: string (enum: DRAFT, CONFIRMED)

### Artista

[Heading row consistent with User mode]
**Entity metadata fields**:

- id: string (UUID - generated by the system if not provided)
- name: string (unique)
- stageName: string (optional)
- nationality: string (optional)
- isArg: boolean (indicates if the artist is from Argentina)
- youtubeHandle: string (optional)
- instagramHandle: string (optional)
- twitterHandle: string (optional)
- facebookProfile: string (optional)
- website: string (optional)
- bio: string (optional)
  **NOT SHOWN METADATA - updated on Creation or last modification**
- idUsuario: string (optional, indicates if the artist is also a user ,inherited from relationship)
- createdAt: datetime
- updatedAt: datetime
  **Relationships**
- Canciones (AUTOR_DE relationship)
  [Contents row consistent with User mode]
  Properties:
  - status: string (enum: DRAFT, CONFIRMED)
- Jingles (JINGLERO_DE relationship)
  [Contents row consistent with User mode]
  Properties:
  - status: string (enum: DRAFT, CONFIRMED)

### Tematica

[Heading row consistent with User mode]
**Entity metadata fields**:

- id: string (UUID - generated by the system if not provided)
- name: string (unique)
- category: string (optional enum: ACTUALIDAD, POLITICA, CULTURA, GENTE, GELATINA)
- description: string
  **NOT SHOWN METADATA - updated on Creation or last modification**
- createdAt: datetime
- updatedAt: datetime
  **Relationships**
- Jingles (TAGGED_WITH relationship)
  [Contents row consistent with User mode]
  Properties:
  - isPrimary: boolean
  - status: string (enum: DRAFT, CONFIRMED)
