# Specification: EntityCard relationshipData Extraction

**Status**: Specification (Pending Approval)  
**Date**: 2025-12-07  
**Area**: UI Design System - Component Behavior  
**Related Component**: EntityCard  
**Related Utility**: relationshipDataExtractor.ts  
**Purpose**: Define comprehensive specification for extracting and using relationshipData across all EntityCard usage scenarios

## Executive Summary

This specification defines the **future architecture** for EntityCard display properties using pre-computed `displayPrimary`, `displaySecondary`, and `displayBadges` properties stored on all entity types. These properties are computed at entity creation/edit time and stored in the database, eliminating the need for runtime computation. The specification covers all entity types, usage scenarios, contextual combinations, edge cases, and responsive considerations. This document serves as the source of truth for implementing the pre-computed display property architecture and informs backend schema changes, computation logic, and migration requirements.

## Table of Contents

1. [Entity Types and Sub-Types](#entity-types-and-sub-types)
2. [Usage Scenarios](#usage-scenarios)
3. [Interaction Buttons](#interaction-buttons)
4. [Contextual Combinations](#contextual-combinations)
5. [Data Source Priority and Merge Rules](#data-source-priority-and-merge-rules)
6. [Edge Cases](#edge-cases)
7. [Responsive Considerations](#responsive-considerations)
8. [Implementation Rules](#implementation-rules)

---

## Entity Types and Sub-Types

### Primary Entity Types

#### 1. Fabrica

- **ID Format**: YouTube video ID (11 characters, e.g., `0hmxZPp0xq0`)
- **Properties**: `id`, `title`, `date`, `youtubeUrl`, `visualizations`, `likes`, `description`, `contents`, `status`, `createdAt`, `updatedAt`
- **Relationship Data Needed**:
  - `jingleCount`: number (for contents variant: `🎤: {count}`)
  - `jingleTimestamp`: number (for show button navigation when Fabrica is related entity of a Jingle via APPEARS_IN)
- **Sub-types**: None

#### 2. Jingle

- **ID Format**: `j{8-chars}` (e.g., `j5e6f7g8`)
- **Properties**: `id`, `youtubeUrl`, `timestamp`, `youtubeClipUrl`, `title`, `comment`, `lyrics`, `songTitle`, `artistName`, `genre`, `isJinglazo`, `isJinglazoDelDia`, `isPrecario`, `fabricaId`, `fabricaDate`, `cancionId`, `isLive`, `isRepeat`, `autoComment`, `status`, `createdAt`, `updatedAt`
- **Relationship Data Needed**:
  - `fabrica`: Fabrica object (for date display, show button, 'INEDITO' tag if missing)
  - `cancion`: Cancion object (for title fallback: `{cancion} ({autor})`)
  - `autores`: Artista[] (for title fallback, derived from cancion)
  - `jingleros`: Artista[] (for display)
  - `tematicas`: Tematica[] (for display)
- **Sub-types**: None

#### 3. Cancion

- **ID Format**: `c{8-chars}` (e.g., `c9f0a1b2`)
- **Properties**: `id`, `title`, `album`, `year`, `genre`, `youtubeMusic`, `lyrics`, `autorIds`, `musicBrainzId`, `status`, `createdAt`, `updatedAt`
- **Relationship Data Needed**:
  - `autores`: Artista[]
  - `jingleCount`: number (for contents variant: `🎤: {count}`)
- **Sub-types**: None

#### 4. Artista

- **ID Format**: `a{8-chars}` (e.g., `a1b2c3d4`)
- **Properties**: `id`, `name`, `stageName`, `idUsuario`, `nationality`, `isArg`, `youtubeHandle`, `instagramHandle`, `twitterHandle`, `facebookProfile`, `website`, `bio`, `musicBrainzId`, `status`, `createdAt`, `updatedAt`
- **Relationship Data Needed**:
  - `autorCount`: number (for contents variant: `📦: {count}`, icon determination)
  - `jingleroCount`: number (for contents variant: `🎤: {count}`, icon determination)
- **Sub-types**:
  - **Autor**: Artista with `autorCount > 0` (relationship: AUTOR_DE → Cancion)
  - **Jinglero**: Artista with `jingleroCount > 0` (relationship: JINGLERO_DE → Jingle)

#### 5. Tematica

- **ID Format**: `t{8-chars}` (e.g., `t3k8m2n1`)
- **Properties**: `id`, `name`, `category`, `description`, `status`, `createdAt`, `updatedAt`
- **Relationship Data Needed**:
  - `jingleCount`: number (for contents variant: `🎤: {count}`)
- **Sub-types**: None

#### 6. Usuario

- **ID Format**: `u{8-chars}` (e.g., `u1a2b3c4d`)
- **Properties**: `id`, `email`, `role`, `artistId`, `displayName`, `profilePictureUrl`, `twitterHandle`, `instagramHandle`, `facebookProfile`, `youtubeHandle`, `contributionsCount`, `createdAt`, `lastLogin`, `updatedAt`
- **Relationship Data Needed**: None (Usuario is not displayed via EntityCard)
- **Sub-types**: None

---

## Usage Scenarios

**Focus**: This section describes the **UI display behavior** for EntityCard components across different usage scenarios. It specifies how entity properties and relationshipData are used to render Primary text, Secondary text, and Badges in the user interface.

**Property Sources**: Properties referenced below may come from:

- Direct entity properties (e.g., `entity.title`, `entity.stageName`)
- relationshipData (e.g., `relationshipData.fabrica.date`, `relationshipData.autores`)
- Related entities accessed via relationshipData (e.g., `relationshipData.cancion.title`)

**Note**: For extraction requirements (what data must be retrieved from the API), see the "Relationship Data Needed" section under each entity type in [Entity Types and Sub-Types](#entity-types-and-sub-types).

### Display Pattern Rules

EntityCard consistently applies display elements based on variant and state. The following pattern ensures consistency across all usage scenarios:

| Variant/State                        | Primary (with icon) | Secondary | Badges |
| ------------------------------------ | ------------------- | --------- | ------ |
| **Heading**                          | ✅                  | ❌        | ❌     |
| **Contents - Expanded (User/Guest)** | ✅                  | ❌        | ✅     |
| **Contents - Expanded (Admin)**      | ✅                  | ✅        | ✅     |
| **Contents - Collapsed**             | ✅                  | ✅        | ✅     |
| **Search Results**                   | ✅                  | ✅        | ✅     |

**Rules:**

- **Primary (with icon)**: Always displayed (pre-computed as `entity.displayPrimary`, with icon as first character)
- **Icon**: Always displayed (pre-computed as first character of `displayPrimary`)
- **Secondary**:
  - Displayed in collapsed contents variant and search results (provides summary of related contents)
  - Hidden in expanded User/Guest mode (related entities are visible, so summary is redundant)
  - Displayed in expanded Admin mode (expanded information shows relationship properties, not related entities, so summary remains useful)
  - Never displayed in heading variant (focuses on entity identification only)
- **Badges**:
  - Displayed in contents variant (both expanded and collapsed)
  - Not displayed in heading variant

**Rationale**:

- **Heading variant**: Focuses on entity identification (primary with icon only)
- **Expanded User/Guest mode**: Secondary text hidden because related entities are visible below, making the summary redundant
- **Expanded Admin mode**: Secondary text remains visible because expanded information shows relationship properties (timestamps, etc.), not the related entities themselves
- **Collapsed mode and Search Results**: Full metadata displayed (primary with icon + secondary + badges) to provide complete information at a glance

**Entity-Specific Details**:

#### Primary text (displayPrimary)

Pre-computed property `entity.displayPrimary` contains the icon as the first character followed by the primary text. Format examples:

- **Fabrica**: `'🏭 {entity.title}'` (e.g., `'🏭 Fabrica Title'`)
- **Jingle**: `'🎤 {entity.title}'` or fallback to `'🎤 {cancion.title} ({autor1, autor2})'` when title is blank (e.g., `'🎤 Jingle Title'` or `'🎤 Song Title (Artist One, Artist Two)'`)
- **Cancion**: `'📦 {entity.title}'` (e.g., `'📦 Song Title'`)
  - **Note**: Autores may be included in primary text for disambiguation when multiple songs share the same title (exception case)
- **Artista**: Icon determined by relationship counts:
  - `'🚚 {entity.stageName}'` if `autorCount > 0` and `jingleroCount == 0`
  - `'🔧 {entity.stageName}'` if `autorCount == 0` and `jingleroCount > 0`
  - `'👤 {entity.stageName}'` otherwise
  - Falls back to `entity.name` if `stageName` is empty
- **Tematica**: `'🏷️ {entity.name}'` (e.g., `'🏷️ Tematica Name'`)

**Implementation Note**: These values are computed at entity creation/edit time and stored in the database. The computation logic uses relationship data to determine icon selection and fallback text.

#### Secondary text (displaySecondary)

Pre-computed property `entity.displaySecondary` contains formatted secondary metadata. Format examples:

- **Fabrica**: `'{formattedDate} • 🎤: {jingleCount}'` (e.g., `'01/01/2025 • 🎤: 5'`)
- **Jingle**: `entity.displaySecondary` is derived from `entity.autoComment` (renamed and repurposed)
  - **Format**: `'{fabricaDate} - {timestamp}'` or `'INEDITO'` if fabrica missing, followed by autoComment content (excluding title which is redundant with primary)
  - **autoComment format reference**: See `backend/src/server/utils/jingleAutoComment.ts` for the complete format specification
  - **autoComment includes**: `🏭: {date} - {timestamp}`, `📦: {cancion}`, `🚚: {autores}`, `🔧: {jingleros}`, `🏷️: {primaryTematica}`
  - **Note**: The `autoComment` property is being repurposed as `displaySecondary` for Jingle entities. The computation logic remains the same, but the property name and usage context change.
- **Cancion**: `'🚚: {autor1, autor2, ...} • {album} • {year} • 🎤: {jingleCount}'` (e.g., `'🚚: Artist One, Artist Two • Album Name • 2020 • 🎤: 3'`)
- **Artista**: `'{name}'` (if different from primary), `'📦: {autorCount} • 🎤: {jingleroCount}'` (e.g., `'Real Name • 📦: 5 • 🎤: 2'`)
- **Tematica**: `'{category} • 🎤: {jingleCount}'` (e.g., `'Category Name • 🎤: 10'`)

**Implementation Requirements**:

- **Database Schema**: Add `displaySecondary?: string` property to all entity types
- **Computation**: Compute `displaySecondary` on entity create/edit operations
- **Migration**: One-time recalculation script needed for existing entities
- **Update Triggers**: Recompute when entity properties or relationships change

#### Badges (displayBadges)

Pre-computed property `entity.displayBadges` contains an array of badge labels. Format examples:

- **Fabrica**: `[]` (empty array, no badges)
- **Jingle**: `['JINGLAZO', 'PRECARIO', 'JDD', 'VIVO', 'CLASICO']` based on boolean props:
  - `'JINGLAZO'` if `entity.isJinglazo === true`
  - `'PRECARIO'` if `entity.isPrecario === true`
  - `'JDD'` if `entity.isJinglazoDelDia === true`
  - `'VIVO'` if `entity.isLive === true`
  - `'CLASICO'` if `entity.isRepeat === true`
  - **Note**: "INEDITO" appears in secondary text, not as a badge
- **Cancion**: `[]` (empty array, no badges)
- **Artista**: `['ARG']` if `entity.isArg === true`, otherwise `[]`
- **Tematica**:
  - **Special Case**: When displayed in nested list under Jingle (Jingle-TAGGED_WITH-Tematica relationship), badge is contextual based on relationship property `isPrimary`
  - If `isPrimary === true`: `['PRIMARY']` (or similar contextual badge)
  - Otherwise: `[]`
  - **Note**: This is a contextual badge that depends on the relationship context, not a permanent entity property

### 1. Heading Variant

**Purpose**: Title rows in table structures, entity headers  
**Props**: `variant="heading"`  
**Usage Contexts**:

- Entity inspection pages (main entity header)
- AdminEntityAnalyze (main entity header)
- EntityShow component (planned for future)

**Display Format**: Follows [Display Pattern Rules](#display-pattern-rules) above: **Primary (with icon)** only (no Secondary, no Badges).

### 2. Contents Variant - Collapsed

**Purpose**: Content rows in table structures, collapsed state  
**Props**: `variant="contents"`, `hasNestedEntities={true}`, `isExpanded={false}`, `indentationLevel?: number`  
**Usage Contexts**:

- EntityList (admin lists)
- SearchResultsPage (search results)
- RelatedEntities (collapsed relationship sections)
- Entity inspection pages (collapsed sections)

**Indentation**:

- `indentationLevel` prop controls visual indentation for nested table rows
- Uses CSS custom property `--indent-base` (defaults to `var(--spacing-lg)` = 24px)
- Responsive: Automatically adjusts to 12px on screens < 600px
- Calculation: `paddingLeft = calc(var(--indent-base, 24px) * indentationLevel)`
- Level 0 = no indent, Level 1 = 1x base, Level 2 = 2x base, etc.
- Used when nesting tables to indicate hierarchy depth

**Display Format**: Follows [Display Pattern Rules](#display-pattern-rules) above: **Primary (with icon)** + **Secondary** + **Badges**.

### 3. Contents Variant - Expanded (User/Guest or Admin)

**Purpose**: Content rows in table structures, expanded state  
**Props**: `variant="contents"`, `hasNestedEntities={true}`, `isExpanded={true}`, `indentationLevel?: number`  
**Usage Contexts**:

- RelatedEntities (expanded relationship sections, User/Guest mode)
- Entity inspection pages (expanded sections)

**Indentation**:
Follows the rules above for [Contents Variant - Collapsed]

**Display Format**: Follows [Display Pattern Rules](#display-pattern-rules) above:

- **User/Guest Mode**: **Primary (with icon)** + **Badges** (Secondary hidden - related entities are visible)
- **Admin Mode**: **Primary (with icon)** + **Secondary** + **Badges** (Secondary remains visible - expanded info shows relationship properties)

### 4. Contents Variant - Read-Only

**Purpose**: Content rows in read-only contexts (public inspection pages, system-managed properties in AdminEntityAnalyze)  
**Props**: `variant="contents"`, no edit buttons  
**Usage Contexts**:

- Public inspection pages (InspectJingle, InspectCancion, etc.)
- Search results (public)

**Display Format**: Follows [Display Pattern Rules](#display-pattern-rules) above: **Primary (with icon)** + **Secondary** + **Badges** (same as Contents Variant - Collapsed, but no edit capabilities)

**Extraction Context**: Main entity (public API)

### 5. Search Results Pick-List Cascade

**Purpose**: Search results displayed in cascading sections  
**Props**: `variant="contents"`  
**Usage Contexts**:

- SearchResultsPage (grouped by entity type)
- EntitySearchAutocomplete (dropdown pick-list)

**Display Format**: Follows [Display Pattern Rules](#display-pattern-rules) above: **Primary (with icon)** + **Secondary** + **Badges** (same as Contents Variant - Collapsed for each entity type)

**Extraction Context**: Search results (may have `_metadata` from search API)

**Special Considerations**:

- Search API may include `_metadata` in results
- EntitySearchAutocomplete may not have `_metadata` (needs fallback)
- Results are grouped by type, displayed in cascading sections
- Results are filtered when searching for a specific entity type (e.g., "canciones" or "artistas")

---

## Interaction Buttons

### Edit/Save/Discard/Delete Buttons

**Context**: Admin mode, heading variant  
**Props**: `showAdminEditButton={true}`, `isEditing={isEditing}`, `onEditClick`, `onSaveClick`, `hasUnsavedChanges`, `showDeleteButton={true}`, `onDeleteClick`

**relationshipData Impact**: None (buttons are UI controls, relationshipData is for display)

**Extraction Context**: Main entity in admin mode

### Expand/Collapse Button

**Context**: Entities with nested relationships  
**Props**: `hasNestedEntities={true}`, `isExpanded={isExpanded}`, `onToggleExpand`

**relationshipData Impact**: None (button controls visibility, relationshipData is for display)

**Extraction Context**: Main entity or related entity with nested relationships

### Jump-to/View Button

**Context**: Fabrica and Jingle entities  
**Props**: Automatic (no props needed)

**relationshipData Usage**:

- **Fabrica**:
  - When main entity: Links to `/show/{id}` (no relationshipData needed)
  - When related entity of a Jingle (APPEARS_IN): Links to `/show/{fabrica.id}?t={relationshipData.jingleTimestamp}` (requires `relationshipData.jingleTimestamp` from the APPEARS_IN relationship)
- **Jingle**: Links to `/show/{fabrica.id}?t={timestamp}` (requires `relationshipData.fabrica.id` and `entity.timestamp`)

**Extraction Context**:

- **Fabrica**:
  - Main entity: No relationshipData needed
  - Related entity of Jingle: Requires `relationshipData.jingleTimestamp` (extracted from APPEARS_IN relationship timestamp property)
- **Jingle**: Requires `relationshipData.fabrica.id` to construct show URL

**Edge Cases**:

- If `relationshipData.fabrica` is missing for Jingle, show button is not displayed
- If `relationshipData.jingleTimestamp` is missing for Fabrica as related entity, show button links to `/show/{fabrica.id}` without timestamp parameter

---

## Extraction Rules

**Note**: This section describes a **future-looking architecture**. With pre-computed `displayPrimary`, `displaySecondary`, and `displayBadges` properties, relationshipData extraction is primarily needed for:

- Fallback scenarios when display properties are missing
- Special cases like show button navigation (jingleTimestamp)
- Backward compatibility during migration period

**Missing Property Handling**: If a required display property (`displayPrimary`, `displaySecondary`, or `displayBadges`) is missing, the system should trigger a background Admin API request to update the entity (to avoid security concerns where Public API would have editing rights to the Database). This ensures display properties are always available without exposing write operations to public endpoints.

### Overview

Relationship data extraction may be needed for fallback scenarios and special cases. The extraction process follows a unified priority order and applies field-specific override rules when parent context is available.

### Data Sources (Priority Order)

1. **Pre-fetched Data** (if provided): Highest priority, used when data is pre-loaded and cached (e.g., EntityList)
2. **`_metadata`**: Standard API response format containing relationship data (preferred format)
3. **Flat Structure Fallback** (transitional): For APIs that return relationship data directly on entity (e.g., `jingle.fabrica`, `jingle.cancion`) - only used if `_metadata` is missing. This provides resilience during API refactoring and handles cases like `/api/search` which returns flat structure.
4. **Relationship Properties**: Properties extracted from the relationship itself (not the entity), such as `timestamp` from APPEARS_IN

**Note**: The flat structure fallback is a transitional feature to support APIs that haven't been refactored to use `_metadata` format. Once all APIs are standardized, this fallback can be removed.

### Extraction Scenarios

#### Scenario 1: Standalone Entity

**Description**: Entity displayed as the primary focus (not as a related entity)  
**Examples**:

- AdminEntityAnalyze main entity
- Entity inspection page main entity
- Search result item
- EntityList item

**Extraction Process**:

1. Use pre-fetched data if provided
2. Otherwise, extract from `_metadata` if available
3. Fallback: Extract from flat structure (e.g., `entity.fabrica`, `entity.cancion`) if `_metadata` is missing
4. Add relationship properties if applicable

**No parent context applied**

#### Scenario 2: Related Entity

**Description**: Entity displayed as a related entity in a relationship section  
**Examples**:

- RelatedEntities component: Jingle under Fabrica's "Jingles" section
- RelatedEntities component: Cancion under Artista's "Canciones" section
- RelatedEntities component: Artista under Cancion's "Autor" section

**Extraction Process**:

1. Use pre-fetched data if provided
2. Otherwise, extract from `_metadata` if available
3. Fallback: Extract from flat structure (e.g., `entity.fabrica`, `entity.cancion`) if `_metadata` is missing
4. Apply parent context using Field Override Rules (see below)
5. Add relationship properties if applicable

**Parent context is applied** - see Field Override Rules for which fields are overridden vs merged

### Field Override Rules

When a parent entity is provided (Scenario 2: Related Entity), the following fields are **overridden** by parent context (parent always wins):

- **`jingle.fabrica`** ← parent Fabrica (when Jingle is under Fabrica)
- **`jingle.cancion`** ← parent Cancion (when Jingle is under Cancion)
- **`jingle.autores`** ← parent Cancion's autores (when Jingle is under Cancion)

All other fields follow **merge behavior** (parent fills gaps only if field is missing from `_metadata`).

### Relationship Properties

Some properties are extracted from the relationship itself (not from the entity or `_metadata`):

- **`fabrica.jingleTimestamp`**: Extracted from APPEARS_IN relationship `timestamp` property (when Fabrica is related entity of a Jingle)
  - **Purpose**: Used by EntityCard show button to construct navigation URL `/show/{fabrica.id}?t={jingleTimestamp}`

### Relationship-Specific Extraction

#### Fabrica → Jingle (APPEARS_IN)

- **Jingle as Related Entity**:
  - Extract from `_metadata` (if available)
  - **Override**: Use parent Fabrica for `relationshipData.fabrica` (see Field Override Rules)
  - **Purpose**: EntityCard uses Fabrica's date when jingle doesn't have fabricaDate

#### Jingle → Fabrica (APPEARS_IN)

- **Fabrica as Related Entity**:
  - Extract from `_metadata` (if available)
  - Extract `timestamp` from APPEARS_IN relationship properties → `relationshipData.jingleTimestamp`
  - **Purpose**: EntityCard show button uses `relationshipData.jingleTimestamp` to construct navigation URL

#### Cancion → Jingle (VERSIONA)

- **Jingle as Related Entity**:
  - Extract from `_metadata` (if available)
  - **Override**: Use parent Cancion for `relationshipData.cancion` (see Field Override Rules)
  - **Override**: Use parent Cancion's autores for `relationshipData.autores` (see Field Override Rules)
  - **Purpose**: EntityCard formats jingle title as `{cancion} ({autor})` when title/songTitle are blank

#### All Other Relationships

- Extract from `_metadata` (if available)
- No special overrides or relationship properties needed

---

## Edge Cases

### Missing Properties

#### Jingle Missing `title` and `songTitle`

**Scenario**: Jingle has blank `title` and `songTitle`  
**Expected Behavior**: EntityCard uses `relationshipData.cancion` and `relationshipData.autores` to format: `{cancion.title} ({autor1, autor2})`  
**Extraction Requirement**: Must extract `cancion` and `autores` even if jingle has no title

**Extraction Rules**:

- Extract `cancion` from `_metadata.cancion`
- Extract `autores` from `_metadata.autores`
- If parent is Cancion (Related Entity scenario): Override with parent Cancion and its autores (see Field Override Rules)

#### Jingle Missing `fabricaDate`

**Scenario**: Jingle has no `fabricaDate` property  
**Expected Behavior**: EntityCard uses `relationshipData.fabrica.date` to display date, or "INEDITO" if fabrica not available  
**Extraction Requirement**: Must extract `fabrica` even if jingle has no fabricaDate

**Extraction Rules**:

- Extract `fabrica` from `_metadata.fabrica`
- If parent is Fabrica (Related Entity scenario): Override with parent Fabrica (see Field Override Rules)

#### Fabrica Missing `jingleTimestamp` in APPEARS_IN Relationship

**Scenario**: Fabrica is displayed as related entity of a Jingle, but APPEARS_IN relationship has no `timestamp` property  
**Expected Behavior**: EntityCard show button links to `/show/{fabrica.id}` without timestamp parameter (graceful degradation)  
**Extraction Rules**:

- Extract `timestamp` from APPEARS_IN relationship properties if available
- If `timestamp` is missing or `null`, do not include `jingleTimestamp` in relationshipData
- EntityCard show button handles missing jingleTimestamp gracefully (links without timestamp)

#### Cancion Missing `autores` in `_metadata`

**Scenario**: Cancion has no `_metadata.autores`  
**Expected Behavior**: EntityCard displays cancion without autor information  
**Extraction Rules**:

- Return `undefined` for `autores` (graceful degradation)
- EntityCard handles missing autores gracefully

#### Artista Missing Relationship Counts

**Scenario**: Artista has no `_metadata.autorCount` or `_metadata.jingleroCount`  
**Expected Behavior**: EntityCard displays artista without counts, uses default icon  
**Extraction Rules**:

- Return `undefined` for counts (graceful degradation)
- EntityCard uses default icon when counts are missing

### Empty Arrays

#### Empty `autores` Array

**Scenario**: `_metadata.autores` exists but is empty array `[]`  
**Expected Behavior**: Treat as missing (don't include in relationshipData)  
**Extraction Rules**:

- Check `Array.isArray(autores) && autores.length > 0` before including
- Empty arrays should not be included in relationshipData

#### Empty `jingleros` Array

**Scenario**: `_metadata.jingleros` exists but is empty array `[]`  
**Expected Behavior**: Treat as missing (don't include in relationshipData)  
**Extraction Rules**:

- Check `Array.isArray(jingleros) && jingleros.length > 0` before including
- Empty arrays should not be included in relationshipData

#### Empty `tematicas` Array

**Scenario**: `_metadata.tematicas` exists but is empty array `[]`  
**Expected Behavior**: Treat as missing (don't include in relationshipData)  
**Extraction Rules**:

- Check `Array.isArray(tematicas) && tematicas.length > 0` before including
- Empty arrays should not be included in relationshipData

### Null/Undefined Values

#### `_metadata` is `null` or `undefined`

**Scenario**: Entity has no `_metadata` field  
**Expected Behavior**: Graceful degradation, fall back to direct properties or parent context  
**Extraction Rules**:

- Check `entity._metadata` exists before accessing
- If missing, proceed to next priority source

#### Direct Property is `null` or `undefined`

**Scenario**: Jingle has `cancion` property but it's `null`  
**Expected Behavior**: Treat as missing, don't include in relationshipData  
**Extraction Rules**:

- Check property exists and is truthy before including
- `null` and `undefined` should not be included

#### Parent Entity is `null` or `undefined`

**Scenario**: Parent entity context is provided but entity is `null`  
**Expected Behavior**: Skip parent context, use other sources  
**Extraction Rules**:

- Check `parentEntity` exists before using
- If missing, skip parent context step

### Type Mismatches

#### `autores` is Not an Array

**Scenario**: `_metadata.autores` exists but is not an array (e.g., string, object)  
**Expected Behavior**: Treat as missing, don't include in relationshipData  
**Extraction Rules**:

- Check `Array.isArray(autores)` before including
- Non-array values should be ignored

#### `jingleCount` is Not a Number

**Scenario**: `_metadata.jingleCount` exists but is not a number (e.g., string "5")  
**Expected Behavior**: Treat as missing, don't include in relationshipData  
**Extraction Rules**:

- Check `typeof jingleCount === 'number'` before including
- Non-number values should be ignored

### API Response Variations

#### Admin API vs Public API

**Scenario**: Admin API may not include `_metadata`, public API does  
**Expected Behavior**: Graceful degradation, use pre-fetched data if available  
**Extraction Rules**:

- Use pre-fetched data if provided (highest priority)
- Otherwise, try `_metadata` (may not exist in admin API)
- Return `undefined` if neither available (graceful degradation)

#### Search API Response

**Scenario**: Search API may return entities in different formats:

- `/api/public/search`: Returns entities with `_metadata` format
- `/api/search`: Returns entities with flat structure (relationship data directly on entity, e.g., `jingle.fabrica`)

**Expected Behavior**: Extract from `_metadata` if available, fallback to flat structure if `_metadata` is missing  
**Extraction Rules**:

- Try `_metadata` first (standard format)
- If `_metadata` is missing, extract from flat structure (e.g., `entity.fabrica`, `entity.cancion`)
- This provides resilience during API refactoring and handles both API formats

### Pre-fetched Data Edge Cases

#### Pre-fetched Data is Partial

**Scenario**: Pre-fetched data has `cancion` but missing `autores`  
**Expected Behavior**: Use pre-fetched data, don't merge with other sources (priority-based)  
**Extraction Rules**:

- Pre-fetched data takes highest priority
- Don't merge with `_metadata` or direct properties if pre-fetched exists

#### Pre-fetched Data is Empty Object

**Scenario**: Pre-fetched data exists but is `{}`  
**Expected Behavior**: Treat as missing, proceed to next priority source  
**Extraction Rules**:

- Check `Object.keys(preFetchedData).length > 0` before using
- Empty objects should be treated as missing

---

## Responsive Considerations

### Wide Screens (> 1024px)

**Display Behavior**: Full relationshipData is displayed  
**Extraction Rules**: No changes to extraction logic

**EntityCard Display**:

- **Jingle**: Full secondary text with autoComment
- **Cancion**: Full secondary text with autores and jingleCount
- **Artista**: Full secondary text with autorCount and jingleroCount

### Narrow Screens (< 768px)

**Display Behavior**: Full display properties are shown, with increased line count to accommodate content  
**Extraction Rules**: No changes to extraction logic (extraction is independent of display)

**EntityCard Display**:

- **Jingle**: Full secondary text with displaySecondary (may wrap to multiple lines)
- **Cancion**: Full secondary text with autores and jingleCount (may wrap to multiple lines)
- **Artista**: Full secondary text with autorCount and jingleroCount (may wrap to multiple lines)

**Extraction Impact**: None (pre-computed properties provide full data, display layer increases line count rather than truncating)

### Mobile Screens (< 480px)

**Display Behavior**: Full display properties are shown, with increased line count to accommodate content  
**Extraction Rules**: No changes to extraction logic

**EntityCard Display**:

- **Jingle**: Full displaySecondary shown (may wrap to multiple lines)
- **Cancion**: Full displaySecondary shown (may wrap to multiple lines)
- **Artista**: Full displaySecondary shown (may wrap to multiple lines)

**Extraction Impact**: None (pre-computed properties provide full data, display layer increases line count rather than hiding content)

### Indentation Responsive Behavior

**Indentation Base Unit**:

- **Wide Screens (> 600px)**: `--indent-base = var(--spacing-md)` (16px)
- **Narrow Screens (< 600px)**: `--indent-base = 12px`

**Extraction Rules**: No changes (indentation is purely visual, not data-related)

**EntityCard Display**:

- Indentation automatically scales with screen size via CSS custom property
- Nested relationships maintain proportional spacing across breakpoints
- Indentation calculation: `paddingLeft = calc(var(--indent-base, 16px) * indentationLevel)`
- All indentation levels scale proportionally when base unit changes

---

## Implementation Rules

### Rule 1: Centralized Extraction Function

**Requirement**: All relationshipData extraction must use a single centralized function  
**Function**: `extractRelationshipData(entity, entityType, options?)`  
**Location**: `frontend/src/lib/utils/relationshipDataExtractor.ts`

**Options Interface**:

```typescript
interface ExtractRelationshipDataOptions {
  parentEntity?: Entity;
  parentEntityType?: EntityType;
  preFetchedData?: Record<string, unknown>;
  relationshipProperties?: Record<string, unknown>; // e.g., { jingleTimestamp: number } from APPEARS_IN
}
```

### Rule 2: Unified Extraction Logic

**Requirement**: Extraction function uses unified priority order regardless of scenario  
**Implementation**: Single extraction path with optional parameters

**Extraction Process**:

1. Start with pre-fetched data (if `options.preFetchedData` provided)
2. Merge `_metadata` (if available) - standard API format
3. Fallback: Extract from flat structure (if `_metadata` missing) - transitional format for API compatibility
4. Add relationship properties (if `options.relationshipProperties` provided)
5. Apply parent context (if `options.parentEntity` provided) using Field Override Rules

**Scenario Detection**:

- **Standalone Entity**: No `options.parentEntity` provided
- **Related Entity**: `options.parentEntity` and `options.parentEntityType` provided

### Rule 3: Field Override Rules

**Requirement**: Specific fields are overridden by parent context, all others merge  
**Implementation**:

- **Override fields** (parent always wins):
  - `jingle.fabrica` ← parent Fabrica
  - `jingle.cancion` ← parent Cancion
  - `jingle.autores` ← parent Cancion's autores
- **Merge fields** (parent fills gaps only): All other fields

### Rule 5: Graceful Degradation

**Requirement**: Missing data should not cause errors  
**Implementation**:

- Check for `null`/`undefined` before accessing
- Check for array type and length before including arrays
- Check for number type before including counts
- Return `undefined` if no data available (not empty object)

### Rule 6: Backward Compatibility

**Requirement**: Existing code must continue to work  
**Implementation**:

- `options` parameter is optional
- Default behavior (no options) matches Standalone Entity scenario
- Existing calls without options continue to work

### Rule 7: Type Safety

**Requirement**: TypeScript types must be accurate  
**Implementation**:

- Use type assertions for entity types
- Use type guards for array/object checks
- Document type expectations in JSDoc

### Rule 8: Performance

**Requirement**: Extraction should be fast (no API calls)  
**Implementation**:

- All extraction is synchronous (no async/await)
- No additional API calls (use provided data only)
- Simple object operations (spread, checks)

---

## Validation Checklist

Before implementing, validate:

- [ ] All entity types covered
- [ ] All usage scenarios covered
- [ ] All contextual combinations covered
- [ ] All edge cases covered
- [ ] Priority rules defined for each context
- [ ] Merge rules defined for each context
- [ ] Override rules defined for specific fields
- [ ] Graceful degradation for all missing data
- [ ] Backward compatibility maintained
- [ ] Type safety ensured
- [ ] Performance requirements met

---

## Change History

| Date       | Author       | Change                                                                                                     |
| ---------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| 2025-12-05 | AI Assistant | Initial specification created                                                                              |
| 2025-12-07 | AI Assistant | Updated for pre-computed display properties architecture (displayPrimary, displaySecondary, displayBadges) |
