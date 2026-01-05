# WORKFLOW_008: Entity Inspection

**Status**: draft  
**User Experience Category**: Guest Experience  
**Access Level**: Public  
**Last Updated**: 2026-01-04  
**Related Components**:

- `InspectJingle.tsx`
- `InspectCancion.tsx`
- `InspectFabrica.tsx`
- `InspectArtista.tsx`
- `InspectTematica.tsx`
- `EntityCard.tsx`
- `RelatedEntities.tsx`

**Dependencies**: None

---

## Overview

This workflow defines the complete user experience for viewing entity information on entity inspection pages. It covers navigation to entity pages, display of entity metadata, interaction with relationship rows (Level 0 and Level 1), and navigation patterns.

**User Persona**: Guest user browsing the knowledge graph, exploring entities and their relationships. They want to understand entity details and navigate to related entities.

**User Context**: Guest user viewing entity detail pages to explore the knowledge graph  
**Success Criteria**: User can view entity information, understand relationships, and navigate intuitively to related entities

---

## Flow Diagram

**Key States**:

- Loading State (fetching entity data)
- Display State (entity loaded, showing heading and relationships)
- Level 0 Expanded (showing Level 1 rows)
- Level 0 Collapsed (hiding Level 1 rows)

---

## Detailed Steps

### 1. Navigate to Entity Inspection Page

**User Action**: Navigate to entity inspection route:

- `/j/:jingleId` - Jingle Inspection Page
- `/c/:cancionId` - Cancion Inspection Page
- `/f/:fabricaId` - Fabrica Inspection Page
- `/a/:artistaId` - Artista Inspection Page
- `/t/:tematicaId` - Tematica Inspection Page

**System Response**:

- Load entity data from Public API
- Display entity in heading row (Level 0 - Heading)
- Load and display related entities in relationship sections
- Show media player if applicable (Jingle, Cancion, Fabrica)

**UI State**:

- Route: Entity inspection route
- Entity card in heading variant
- RelatedEntities component showing relationship sections
- Level 0 relationship rows collapsed by default

**Validation**:

- ✅ Entity loads successfully
- ✅ Heading row displays correctly
- ✅ Relationship sections appear
- ✅ Level 0 rows are collapsed by default

**Key Code References**:

- `frontend/src/pages/inspect/InspectJingle.tsx:24-70`
- `frontend/src/pages/inspect/InspectCancion.tsx:11-49`
- `frontend/src/pages/inspect/InspectFabrica.tsx:10-48`
- `frontend/src/pages/inspect/InspectArtista.tsx:10-48`
- `frontend/src/pages/inspect/InspectTematica.tsx:10-48`

---

### 2. Display Entity Heading (Level 0 - Heading)

**User Action**: (Automatic - displayed on page load)

**System Response**:

- Display entity as heading row using EntityCard with `variant="heading"`
- Show primary text with icon (from `entity.displayPrimary`)
- No secondary text, no badges (heading variant pattern)

**UI State**:

- EntityCard with `variant="heading"`, `indentationLevel={0}`
- Primary text with entity icon displayed
- Non-clickable (heading row is not interactive)

**Display Format**:

- **Primary (with icon)**: ✅ Always displayed
- **Secondary**: ❌ Never displayed in heading variant
- **Badges**: ❌ Never displayed in heading variant

**Entity-Specific Primary Text**:

- **Fabrica**: `'🏭 {entity.title}'`
- **Jingle**: `'🎤 {entity.title}'` or fallback to `'🎤 {cancion.title} ({autor1, autor2})'`
- **Cancion**: `'📦 {entity.title}'`
- **Artista**: Icon determined by relationship counts:
  - `'🚚 {entity.stageName}'` if `autorCount > 0` and `jingleroCount == 0`
  - `'🔧 {entity.stageName}'` if `autorCount == 0` and `jingleroCount > 0`
  - `'👤 {entity.stageName}'` otherwise
- **Tematica**: `'🏷️ {entity.name}'`

**Validation**:

- ✅ Heading row displays primary text with icon
- ✅ No secondary text or badges shown
- ✅ Correct icon displayed per entity type

**Key Code References**:

- `frontend/src/pages/inspect/InspectJingle.tsx:99-105`
- `frontend/src/components/common/EntityCard.tsx:172-570`
- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:193-203` (Heading Variant specification)

---

### 3. Display Relationship Sections (Level 0 - Rows)

**User Action**: (Automatic - displayed on page load)

**System Response**:

- Display relationship sections using RelatedEntities component
- Each relationship type shows as a Level 0 row
- Level 0 rows are collapsed by default
- Show expand/collapse icon (🔍 looking glass) for expandable rows
- Show navigation icon (🔍 looking glass) for navigation

**UI State**:

- RelatedEntities component rendered
- Level 0 rows with `indentationLevel={0}`
- `hasNestedEntities={true}` (if relationship has related entities)
- `isExpanded={false}` (collapsed by default)
- Expand/collapse icon visible
- Navigation icon (looking glass) visible

**Display Format** (Collapsed Level 0 Row):

- **Primary (with icon)**: ✅ Displayed
- **Secondary**: ✅ Displayed (summary of related contents)
- **Badges**: ✅ Displayed

**Interaction Elements**:

- **Expand/Collapse Icon**: Click to expand/collapse Level 1 rows
- **Navigation Icon (Looking Glass)**: Click to navigate to the related entity page

**Validation**:

- ✅ Level 0 rows display correctly
- ✅ Expand/collapse icon visible
- ✅ Navigation icon visible
- ✅ Rows collapsed by default
- ✅ Primary, secondary, and badges displayed

**Key Code References**:

- `frontend/src/components/common/RelatedEntities.tsx:475-3529`
- `frontend/src/components/common/EntityCard.tsx:316-327` (expand icon)
- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:205-226` (Contents Variant - Collapsed)

---

### 4. Expand Level 0 Row

**User Action**: Click expand/collapse icon on a Level 0 row

**System Response**:

- Toggle expansion state of the relationship section
- If expanding: Show Level 1 rows (related entities)
- If collapsing: Hide Level 1 rows
- Update expand/collapse icon state

**UI State**:

- `isExpanded={true}` (when expanded)
- Level 1 rows visible
- Expand icon changes to indicate expanded state

**Display Format** (Expanded Level 0 Row):

- **Primary (with icon)**: ✅ Displayed
- **Secondary**: ❌ Hidden (related entities are visible, summary redundant)
- **Badges**: ✅ Displayed

**Validation**:

- ✅ Clicking expand icon toggles expansion
- ✅ Level 1 rows appear when expanded
- ✅ Level 1 rows hidden when collapsed
- ✅ Secondary text hidden when expanded
- ✅ Expand icon state updates correctly

**Key Code References**:

- `frontend/src/components/common/RelatedEntities.tsx:1917-2414` (relationship rendering)
- `frontend/src/components/common/EntityCard.tsx:256-262` (handleExpandClick)

---

### 5. Display Level 1 Rows (Non-Expandable)

**User Action**: (Automatic - displayed when Level 0 row is expanded)

**System Response**:

- Display related entities as Level 1 rows
- Level 1 rows use `indentationLevel={1}` (indented to show hierarchy)
- Level 1 rows are NOT expandable (no expand/collapse icon)
- Level 1 rows are clickable to navigate to entity

**UI State**:

- EntityCard with `variant="contents"`, `indentationLevel={1}`
- `hasNestedEntities={false}` (not expandable)
- `isExpanded={undefined}` (no expansion state)
- No expand/collapse icon
- No navigation icon (looking glass) - entire row is clickable
- Row click navigates to entity inspection page

**Display Format** (Level 1 Row):

- **Primary (with icon)**: ✅ Displayed
- **Secondary**: ❌ Hidden (related entities are visible, summary redundant)
- **Badges**: ✅ Displayed

**Interaction**:

- **Row Click**: Navigate to related entity inspection page
- **No Expand/Collapse**: Level 1 rows cannot be expanded (no nesting loops)
- **No Navigation Icon**: Entire row is clickable, no separate icon needed

**Validation**:

- ✅ Level 1 rows display with indentation
- ✅ No expand/collapse icon on Level 1 rows
- ✅ No navigation icon on Level 1 rows
- ✅ Clicking Level 1 row navigates to entity
- ✅ Secondary text hidden (entities visible)
- ✅ Badges displayed

**Key Code References**:

- `frontend/src/components/common/RelatedEntities.tsx:2034-2414` (entity rendering)
- `frontend/src/components/common/EntityCard.tsx:53-62` (getEntityRoute)
- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:227-243` (Contents Variant - Expanded)

---

### 6. Navigate from Level 0 Row (Looking Glass Icon)

**User Action**: Click navigation icon (looking glass) on a Level 0 row

**System Response**:

- Navigate to the related entity inspection page
- Load new entity data
- Display new entity heading and relationships

**UI State**:

- Route changes to related entity inspection route
- New entity page loads
- Previous page state lost (standard navigation)

**Navigation Routes**:

- Jingle → `/j/:jingleId`
- Cancion → `/c/:cancionId`
- Fabrica → `/f/:fabricaId`
- Artista → `/a/:artistaId`
- Tematica → `/t/:tematicaId`

**Validation**:

- ✅ Clicking navigation icon navigates correctly
- ✅ New entity page loads
- ✅ Route updates correctly

**Key Code References**:

- `frontend/src/lib/utils/entityDisplay.ts:53-62` (getEntityRoute)
- `frontend/src/components/common/EntityCard.tsx:253-254` (route handling)

---

### 7. Navigate from Level 1 Row (Row Click)

**User Action**: Click anywhere on a Level 1 row

**System Response**:

- Navigate to the related entity inspection page
- Load new entity data
- Display new entity heading and relationships

**UI State**:

- Route changes to related entity inspection route
- New entity page loads
- Previous page state lost (standard navigation)

**Navigation Routes**:

- Same as Level 0 navigation (entity type determines route)

**Validation**:

- ✅ Clicking Level 1 row navigates correctly
- ✅ New entity page loads
- ✅ Route updates correctly

**Key Code References**:

- `frontend/src/components/common/RelatedEntities.tsx:2400-2401` (onClick and to props)
- `frontend/src/components/common/EntityCard.tsx:543-561` (onClick handler)

---

## Fields Visible on Entity Pages

### Entity Heading (Level 0 - Heading)

**Displayed Fields**:

- **Primary Text**: Entity identification with icon
  - Format: `{icon} {primaryText}`
  - Source: `entity.displayPrimary` (pre-computed)
  - See [Entity-Specific Primary Text](#entity-specific-primary-text) above

**Hidden Fields**:

- Secondary text (not displayed in heading variant)
- Badges (not displayed in heading variant)
- Metadata fields (not displayed in heading row)

**Specification Reference**:

- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:193-203` (Heading Variant)

---

### Level 0 Relationship Rows (Collapsed)

**Displayed Fields**:

- **Primary Text**: Relationship entity identification with icon
- **Secondary Text**: Summary of related contents (e.g., `'01/01/2025 • 🎤: 5'`)
- **Badges**: Entity badges (e.g., `['JINGLAZO', 'PRECARIO']`)

**Specification Reference**:

- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:205-226` (Contents Variant - Collapsed)

---

### Level 0 Relationship Rows (Expanded)

**Displayed Fields**:

- **Primary Text**: Relationship entity identification with icon
- **Badges**: Entity badges
- **Secondary Text**: ❌ Hidden (related entities visible, summary redundant)

**Specification Reference**:

- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:227-243` (Contents Variant - Expanded)

---

### Level 1 Rows

**Displayed Fields**:

- **Primary Text**: Related entity identification with icon
- **Badges**: Entity badges
- **Secondary Text**: ❌ Hidden (related entities visible, summary redundant)

**Specification Reference**:

- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:227-243` (Contents Variant - Expanded)

---

### Field Ordering Reference

Field ordering for entity metadata (not displayed in inspection pages, but used in admin pages):

- **Jingle**: `['id', 'displayPrimary', 'displaySecondary', 'displayBadges', 'normSearch', 'title', 'isJinglazo', 'isJinglazoDelDia', 'isPrecario', 'isLive', 'isRepeat', 'comment', 'youtubeClipUrl', 'lyrics']`
- **Fabrica**: `['id', 'displayPrimary', 'displaySecondary', 'displayBadges', 'normSearch', 'title', 'date', 'status', 'youtubeUrl', 'contents']`
- **Cancion**: `['id', 'displayPrimary', 'displaySecondary', 'displayBadges', 'normSearch', 'title', 'album', 'year', 'genre', 'youtubeMusic', 'lyrics', 'musicBrainzId']`
- **Artista**: `['id', 'displayPrimary', 'displaySecondary', 'displayBadges', 'normSearch', 'name', 'stageName', 'nationality', 'isArg', 'youtubeHandle', 'instagramHandle', 'twitterHandle', 'facebookProfile', 'website', 'bio', 'musicBrainzId']`
- **Tematica**: `['id', 'displayPrimary', 'displaySecondary', 'displayBadges', 'normSearch', 'name', 'description', 'category']`

**Code Reference**:

- `frontend/src/lib/config/fieldConfigs.ts:56-62` (FIELD_ORDER)

---

## Edge Cases

### Edge Case 1: Entity Not Found

**Scenario**: User navigates to entity inspection page with invalid entity ID

**Expected Behavior**: Show error message, allow user to navigate away

**Validation**:

- ✅ Error message displayed
- ✅ User can navigate to other pages

**Key Code References**:

- `frontend/src/pages/inspect/InspectJingle.tsx:61-63` (error handling)

---

### Edge Case 2: Entity Has No Relationships

**Scenario**: Entity exists but has no related entities

**Expected Behavior**: Show entity heading, show empty relationship sections or placeholder messages

**Validation**:

- ✅ Entity heading displays
- ✅ Empty state handled gracefully
- ✅ No errors thrown

**Key Code References**:

- `frontend/src/components/common/RelatedEntities.tsx` (empty state handling)

---

### Edge Case 3: Relationship Loading Error

**Scenario**: Entity loads but relationship data fails to load

**Expected Behavior**: Show entity heading, show error for failed relationships, allow navigation

**Validation**:

- ✅ Entity heading displays
- ✅ Error message for failed relationships
- ✅ User can still navigate

---

### Edge Case 4: Circular Navigation

**Scenario**: User navigates through relationships and returns to same entity

**Expected Behavior**: Load entity fresh, show current state (no special handling needed)

**Validation**:

- ✅ Entity loads correctly
- ✅ No infinite loops
- ✅ Navigation works normally

---

### Edge Case 5: Rapid Expand/Collapse

**Scenario**: User rapidly clicks expand/collapse on multiple Level 0 rows

**Expected Behavior**: All expansions/collapses process correctly, no race conditions

**Validation**:

- ✅ All state changes process correctly
- ✅ No UI glitches
- ✅ Performance remains acceptable

---

## Implementation Notes

### Component Structure

**Entity Inspection Pages**:

- Each entity type has its own inspection page component
- Pages follow consistent structure:
  1. Load entity from Public API
  2. Display EntityCard with `variant="heading"`, `indentationLevel={0}`
  3. Display RelatedEntities component
  4. Handle loading and error states

**RelatedEntities Component**:

- Handles relationship rendering
- Manages expansion state for Level 0 rows
- Renders Level 1 rows when Level 0 is expanded
- Handles navigation for both Level 0 (icon) and Level 1 (row click)

**EntityCard Component**:

- Renders entity information based on variant
- Handles click interactions
- Displays expand/collapse icons
- Displays navigation icons

### State Management

**Expansion State**:

- Managed by RelatedEntities component
- Uses `useReducer` for state management
- `expandedRelationships`: Set of relationship keys that are expanded
- Level 0 rows: Expandable, state tracked
- Level 1 rows: Not expandable, no state needed

**Navigation State**:

- Handled by React Router
- Navigation triggers full page reload (standard SPA navigation)
- No special state preservation needed

### Indentation Levels

- **Level 0 - Heading**: `indentationLevel={0}` (no indent)
- **Level 0 - Rows**: `indentationLevel={0}` (no indent)
- **Level 1 - Rows**: `indentationLevel={1}` (1x base indent = 16px on wide screens, 12px on narrow screens)

**Code Reference**:

- `docs/2_frontend_ui-design-system/03_components/composite/entity-card-relationshipdata-extraction-specification.md:216-223` (Indentation rules)

### Key Differences from Previous Design

**Previous Design (Nesting Loops)**:

- Level 1 rows were expandable
- Could create deep nesting (Level 2, Level 3, etc.)
- Navigation loops possible

**Current Design (No Nesting Loops)**:

- Level 1 rows are NOT expandable
- Maximum depth: Level 0 (heading) → Level 0 (rows) → Level 1 (rows)
- No nesting loops, simpler navigation

---

## Validation Checklist

### Code Review Checklist

- [ ] Entity inspection pages load correctly
- [ ] Heading row displays primary text with icon
- [ ] Level 0 rows display correctly (collapsed by default)
- [ ] Level 0 rows have expand/collapse icon
- [ ] Level 0 rows have navigation icon (looking glass)
- [ ] Level 1 rows appear when Level 0 is expanded
- [ ] Level 1 rows are NOT expandable (no expand icon)
- [ ] Level 1 rows have NO navigation icon (row is clickable)
- [ ] Clicking Level 0 navigation icon navigates correctly
- [ ] Clicking Level 1 row navigates correctly
- [ ] Indentation levels correct (Level 0 = 0, Level 1 = 1)
- [ ] Display format matches specification (primary, secondary, badges)
- [ ] Error handling works correctly
- [ ] Loading states handled

### Test Scenarios

1. **Navigate to Entity Page**

   - [ ] Navigate to `/j/:jingleId` → Jingle loads
   - [ ] Navigate to `/c/:cancionId` → Cancion loads
   - [ ] Navigate to `/f/:fabricaId` → Fabrica loads
   - [ ] Navigate to `/a/:artistaId` → Artista loads
   - [ ] Navigate to `/t/:tematicaId` → Tematica loads

2. **Display Entity Heading**

   - [ ] Heading row shows primary text with icon
   - [ ] No secondary text or badges in heading
   - [ ] Correct icon per entity type

3. **Level 0 Rows (Collapsed)**

   - [ ] Level 0 rows collapsed by default
   - [ ] Primary, secondary, and badges displayed
   - [ ] Expand/collapse icon visible
   - [ ] Navigation icon (looking glass) visible

4. **Expand Level 0 Row**

   - [ ] Click expand icon → Level 1 rows appear
   - [ ] Secondary text hidden when expanded
   - [ ] Expand icon state updates

5. **Level 1 Rows**

   - [ ] Level 1 rows appear with indentation
   - [ ] No expand/collapse icon on Level 1 rows
   - [ ] No navigation icon on Level 1 rows
   - [ ] Primary and badges displayed
   - [ ] Secondary text hidden

6. **Navigate from Level 0**

   - [ ] Click navigation icon → Navigate to entity
   - [ ] New entity page loads correctly

7. **Navigate from Level 1**

   - [ ] Click Level 1 row → Navigate to entity
   - [ ] New entity page loads correctly

8. **Error Handling**
   - [ ] Invalid entity ID → Error message shown
   - [ ] Network error → Error message shown
   - [ ] User can navigate away from errors

### Acceptance Criteria

- ✅ User can view entity information clearly
- ✅ User can expand/collapse relationship sections
- ✅ User can navigate to related entities intuitively
- ✅ Navigation patterns are consistent
- ✅ No nesting loops (Level 1 rows not expandable)
- ✅ Display format matches specification
- ✅ Error states handled gracefully

---

## Related Workflows

- **WORKFLOW_010**: Basic Navigation Access (navigation to entity inspection pages)
- **WORKFLOW_012**: WhatsApp Share (sharing entity inspection pages)

---

## Change History

| Date       | Change                                   | Author | Reason                         |
| ---------- | ---------------------------------------- | ------ | ------------------------------ |
| 2026-01-04 | Initial workflow documentation           | -      | Establish entity inspection UX |
| 2026-01-04 | Documented Level 0/Level 1 row behaviors | -      | Clarify navigation patterns    |
| 2026-01-04 | Documented no-nesting-loops design       | -      | Simplify navigation (no loops) |

---

## Notes

- This workflow documents the simplified navigation design without nesting loops
- Level 1 rows are intentionally non-expandable to prevent deep nesting
- Navigation from Level 0 uses icon click, navigation from Level 1 uses row click
- Display format follows EntityCard specification for consistency
- Field ordering reference provided for admin pages (not used in inspection pages)
