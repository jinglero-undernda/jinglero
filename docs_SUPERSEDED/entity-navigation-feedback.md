# Entity Navigation Feedback Collection

**Purpose:** Collect observations and feedback about entity navigation components before architectural refactoring decisions are made. This document serves as a staging area for feedback that will be articulated into technical specifications.

**Last Updated:** 2025-11-11

---

## Document Structure

This document is organized to:

1. **Collect raw observations** from user testing/exploration
2. **Articulate observations** into technical terms with clear component/file references
3. **Clarify scope** (which entity types are affected)
4. **Prepare for refactoring** with unequivocal technical descriptions

---

## Feedback Collection Process

1. **Observation Phase:** User provides observations about interface behavior, scenarios, and issues
2. **Articulation Phase:** Observations are translated into technical terms with specific component/file references
3. **Clarification Phase:** Questions are asked if scope is unclear (single entity type vs. all entity types)
4. **Technical Specification Phase:** Clear, actionable technical descriptions are created for refactoring

---

## Current Components Under Review

### EntityCard Component

- **File:** `frontend/src/components/common/EntityCard.tsx`
- **Purpose:** Displays navigable entity cards in both 'card' and 'row' variants
- **Used in:** RelatedEntities, EntityList, InspectEntityPage, AdminEntityAnalyze
- **Supports:** All entity types (fabrica, jingle, cancion, artista, tematica)

### RelatedEntities Component

- **File:** `frontend/src/components/common/RelatedEntities.tsx`
- **Purpose:** Displays related entities in a two-column table format with expand/collapse
- **Uses:** EntityCard (row variant) for entity display
- **Supports:** All entity types

### Entity List Components

- **Files:**
  - `frontend/src/components/admin/EntityList.tsx`
  - `frontend/src/components/admin/FabricaList.tsx`
- **Purpose:** Admin interfaces for listing entities
- **Uses:** EntityCard

### Inspection Pages

- **Files:**
  - `frontend/src/pages/inspect/InspectEntityPage.tsx`
  - `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx`
- **Purpose:** Demo/test pages for entity display components

---

## Observations & Feedback

### Observation Template

For each observation, we'll document:

```markdown
### [OBS-XXX] Brief Description

**Date:** YYYY-MM-DD
**Context:** Where/when this was observed
**Entity Types Affected:** [ ] fabrica [ ] jingle [ ] cancion [ ] artista [ ] tematica [ ] all

**Raw Observation:**
[User's original observation/description]

**Technical Articulation:**
[Technical description with component/file references]

**Clarification Needed:**
[Questions about scope or behavior]

**Technical Specification:**
[Unequivocal description for refactoring]
```

---

## Collected Observations

### [OBS-001] EntityCard Variant Naming: "card"/"row" → "heading"/"contents"

**Date:** 2025-01-27
**Context:** User review of EntityCard component variants and RelatedEntities demo page
**Entity Types Affected:** [ ] fabrica [ ] jingle [ ] cancion [ ] artista [ ] tematica [x] all

**Raw Observation:**

> "The component will allow me to cobble together a table with a title and related information underneath. I would expect the configuration to show as variants 'heading' and 'contents'."
>
> "If you look at the RelatedEntities Demo - it is showing something similar to what I want to achieve, but it is not well articulated."

**Technical Articulation:**

**Current Implementation:**

- **EntityCard Component** (`frontend/src/components/common/EntityCard.tsx`):

  - Currently supports `variant` prop with values: `'card'` (default) or `'row'`
  - `variant="card"`: Vertical layout with icon, primary text, secondary text, badges
  - `variant="row"`: Horizontal compact layout for table rows (used in RelatedEntities)
  - Variant affects CSS classes: `entity-card--card` or `entity-card--row`

- **RelatedEntities Component** (`frontend/src/components/common/RelatedEntities.tsx`):

  - Uses `<table>` structure with two columns:
    - Label column (`related-entities__label-col`): Contains relationship type labels (e.g., "Fabrica:", "Cancion:")
    - Data column (`related-entities__data-col`): Contains EntityCard components with `variant="row"` for each related entity
  - Label column is currently plain `<td>` with text, NOT using EntityCard component

- **RelatedEntities Demo Page** (`frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx`):
  - Shows "Entidad Principal" section (lines 138-157) with entity info in a styled div
  - Shows "Entidades Relacionadas" section using RelatedEntities component
  - The demo structure shows a table-like layout but the "heading" (relationship labels) are not using EntityCard

**User's Expected Behavior:**

- EntityCard should support `variant="heading"` for table row titles/headers
- EntityCard should support `variant="contents"` for table row content/data
- This would allow building tables where both the title row and content rows use EntityCard component
- The RelatedEntities demo shows a similar pattern but needs better articulation

**Clarification Responses:**

1. **Variant Usage in Table Structure:**

   - ✅ Use EntityCard (interactive) for both heading and content in RelatedEntities
   - ✅ Base both `variant="heading"` and `variant="contents"` on the current "row" variant layout
   - ✅ No "card" layout needed

2. **Visual/Styling Differences:**

   - ✅ Differentiate with light vs dark background
   - ✅ Slightly narrower height for content variant

3. **Component Scope:**

   - ✅ Both heading and content should display: icon, name, and core data relevant to each entity
   - ✅ Heading shows full entity information (same as content, but styled differently)

4. **Backward Compatibility:**

   - ✅ Deprecate `variant="card"` and `variant="row"` in favor of `variant="heading"` and `variant="contents"`

5. **RelatedEntities Refactoring:**
   - ✅ Refactor RelatedEntities to use EntityCard with `variant="heading"` for label column
   - ✅ Use EntityCard with `variant="contents"` for data column
   - 📝 Note: Longer-term consideration - Table generation as a component (not immediate)

---

### [OBS-002] Remove "active" Flag/Variant from EntityCard

**Date:** 2025-01-27
**Context:** User review of EntityCard component HTML output
**Entity Types Affected:** [ ] fabrica [ ] jingle [ ] cancion [ ] artista [ ] tematica [x] all

**Raw Observation:**

> Remove the "active" flag/variant from EntityCard component.

**Technical Articulation:**

**Current Implementation:**

- **EntityCard Component** (`frontend/src/components/common/EntityCard.tsx`):

  - `EntityCardProps` interface includes `active?: boolean` prop (line 20)
  - Prop description: "Whether the card is active/selected (highlighted state)"
  - Default value: `active = false` (line 219)
  - Used in CSS class generation: `active ? 'entity-card--active' : ''` (line 307)
  - JSDoc example shows usage: `active={activeJingleId === jingle.id}` (line 200)

- **CSS Styles** (`frontend/src/styles/components/entity-card.css`):

  - `.entity-card--active` class (lines 39-43):
    - Background: `#f0f7ff` (light blue)
    - Border color: Primary color
    - Box shadow: Blue shadow effect

- **Usage in Components:**

  - `frontend/src/pages/inspect/InspectEntityPage.tsx`:
    - Line 143: `active={true}` in example
    - Line 214: `active={true}` in example

- **Tests:**
  - `frontend/src/components/__tests__/EntityCard.test.tsx`:
    - Lines 314, 322: Tests for active prop behavior
    - Line 317: Asserts `entity-card--active` class is present
    - Line 325: Asserts class is not present when inactive

**User's Expected Behavior:**

- Remove the `active` prop entirely from EntityCard
- Remove the `entity-card--active` CSS class and styles
- Remove all usages of the active prop
- Remove tests related to active state

**Clarification Needed:**
None - request is clear and unambiguous.

**Technical Specification:**
See [SPEC-002] below.

---

### [OBS-003] Related Entity Tables: Title Row + Indented Content Rows with Indentation Level Property

**Date:** 2025-11-11
**Context:** User design vision for Related Entity Tables structure
**Entity Types Affected:** [ ] fabrica [ ] jingle [ ] cancion [ ] artista [ ] tematica [x] all

**Raw Observation:**

> "When thinking about Related Entity Tables - I imagine them having the Title row, and then the related entities rows underneath, with a variable gap in the left to allow for indentation levels in nested fields. The content row should allow for an 'indentation level' property to drive the sizing of the indentation."

**Technical Articulation:**

**Current Implementation:**

- **RelatedEntities Component** (`frontend/src/components/common/RelatedEntities.tsx`):

  - Uses `<table>` structure with rows for each relationship type
  - Each row has two columns: label column (relationship type) and data column (entities)
  - Nested relationships are handled by rendering a new RelatedEntities component recursively
  - Nested components use `className="related-entities__nested"` (line 792)

- **CSS Indentation** (`frontend/src/styles/components/related-entities.css`):

  - `.related-entities__nested` class applies `margin-left: var(--spacing-md, 16px)` (line 66)
  - Indentation is applied to the entire nested RelatedEntities component, not individual rows
  - Responsive: `margin-left: var(--spacing-sm, 12px)` on narrow screens (line 263)

- **EntityCard in RelatedEntities:**
  - Currently used with `variant="row"` in data column (line 780)
  - No indentation level property exists
  - Indentation is handled at the RelatedEntities wrapper level, not per EntityCard

**User's Expected Behavior:**

1. **Table Structure:**

   - Title row (heading variant) at the top of each relationship section
   - Related entity rows (contents variant) displayed underneath the title
   - Clear visual hierarchy: title → content rows

2. **Indentation System:**

   - Variable gap/indentation on the left side for nested levels
   - Each content row should support an "indentation level" property
   - Indentation size should be driven by this property (e.g., level 0 = no indent, level 1 = 16px, level 2 = 32px, etc.)

3. **Nested Relationships:**
   - Nested entity rows should have increased indentation level
   - Indentation should be applied per row, not per entire nested component

**Clarification Responses:**

1. **Table Structure:**

   - ✅ Each relationship type has its own title row (entity title) + content rows underneath
   - ✅ The icon in each content row indicates the entity type of the related items
   - ✅ Title row shows the parent entity information

2. **Indentation Level Property:**

   - ✅ Should be a property of EntityCard component
   - ✅ Base unit: 16px per level
   - ✅ Consider adaptive variable for narrow screens

3. **Title Row Content:**

   - ✅ Title row shows the entity title (parent entity information)
   - ✅ No indentation for title row

4. **Nested Structure:**

   - ✅ Nested tables add content rows with increased indentation
   - ✅ No new heading for nested structures

5. **Visual Layout:**

   - ✅ **Significant architectural change:** Indentation becomes the left column (that is otherwise empty)
   - ✅ This is a significant deviation from the previous specification
   - ✅ Two-column structure: Indentation column (variable width) + Content column (entity cards)

**Technical Specification:**
See [SPEC-003] below.

---

### [OBS-004] Entity Table Field Mapping: Title Row vs Content Rows

**Date:** 2025-11-11
**Context:** Specification reference for entity field display in table structure
**Entity Types Affected:** [ ] fabrica [ ] jingle [ ] cancion [ ] artista [ ] tematica [x] all

**Raw Observation:**

> "The entity table will follow this specification: @tasks-0001-3-1.md (155-211)"
>
> "The row configuration will respond to the Title and primary metadata, and the rows underneath respond to the expandable fields."

**Technical Articulation:**

**Specification Reference:**

From `tasks/tasks-0001-3-1.md` (lines 155-211), each entity type has:

1. **Primary Fields to Display:** Title/name field
2. **Secondary/Metadata Fields:** Additional metadata (dates, categories, etc.)
3. **Relationships (Expandable):** Related entities that can be expanded

**Entity Type Specifications:**

- **Fabrica:**

  - Primary: Titulo
  - Secondary: Fecha de publicacion
  - Expandable: Jingles

- **Jingle:**

  - Primary: Titulo
  - Secondary: Fecha de publicacion (fabrica.date) or "INEDITO", JINGLAZO badge, PRECARIO badge
  - Expandable: Fabrica, Cancion, Autor, Jinglero, Tematicas

- **Cancion:**

  - Primary: "Titulo (Autor(es))"
  - Secondary: Titulo, Album, Año, Imagen
  - Expandable: Autor, Jingles

- **Artista:**

  - Primary: Nombre Artistico (stageName)
  - Secondary: Nombre Real (name), Nacionalidad
  - Expandable: Canciones, Jingles

- **Tematica:**
  - Primary: Nombre (name)
  - Secondary: Categoria (category)
  - Expandable: Jingles

**User's Expected Behavior:**

1. **Title Row (heading variant):**

   - Displays: Title + Primary metadata fields
   - Shows the parent entity with its primary and secondary fields
   - Uses EntityCard with `variant="heading"`

2. **Content Rows (contents variant):**
   - Display: Expandable relationship fields
   - Each content row represents a related entity from an expandable relationship
   - Uses EntityCard with `variant="contents"`
   - Icon indicates the entity type of the related item

**Current Implementation:**

- **EntityCard Component** (`frontend/src/components/common/EntityCard.tsx`):
  - `getPrimaryText()`: Returns title/name based on entity type
  - `getSecondaryText()`: Returns metadata (dates, categories, etc.)
  - `getEntityBadges()`: Returns badges (JINGLAZO, PRECARIO)
  - Current implementation partially matches specification but may need updates:
    - Cancion primary should be "Titulo (Autor(es))" format (currently just title)
    - Jingle secondary should show fabrica.date or "INEDITO" (currently returns null)

**Clarification Needed:**

None - specification is clear from tasks-0001-3-1.md.

**Technical Specification:**
See [SPEC-004] below.

---

### [OBS-005] Entity Icon Specification Update

**Date:** 2025-11-11
**Context:** User specification for entity icons with context-dependent Artista icons
**Entity Types Affected:** [ ] fabrica [ ] jingle [ ] cancion [ ] artista [ ] tematica [x] all

**Raw Observation:**

> "I would like the icons for the entities specified as follows:
>
> Fabrica: 🏭
> Jingle: 🎤
> Cancion: 📦
> Artista (as heading): 👤
> Artista (as content - Jinglero): 🔧
> Artista (as content - Autor): 🚚
> Tematica: 🏷️"

**Technical Articulation:**

**Current Implementation:**

- **EntityCard Component** (`frontend/src/components/common/EntityCard.tsx`):
  - `getEntityIcon()` function (lines 71-80) returns icon based on entity type only
  - Current icon mapping:
    - fabrica: 🏭 ✅ (matches specification)
    - jingle: 🎵 ❌ (should be 🎤)
    - cancion: 🎶 ❌ (should be 📦)
    - artista: 👤 ✅ (correct for heading, but needs context for content)
    - tematica: 🏷️ ✅ (matches specification)

**User's Expected Behavior:**

1. **Standard Icons (no context needed):**

   - Fabrica: 🏭
   - Jingle: 🎤
   - Cancion: 📦
   - Tematica: 🏷️

2. **Context-Dependent Artista Icons:**
   - Artista as heading (variant="heading"): 👤
   - Artista as content - Jinglero (variant="contents", relationship label="Jinglero"): 🔧
   - Artista as content - Autor (variant="contents", relationship label="Autor"): 🚚

**Relationship Context:**

- **RelationshipConfig** (`frontend/src/lib/utils/relationshipConfigs.ts`):
  - Relationship labels identify the relationship type:
    - "Jinglero" - when Artista is related via JINGLERO_DE relationship
    - "Autor" - when Artista is related via AUTOR_DE relationship
  - These labels are available in RelatedEntities component when rendering content rows

**Clarification Needed:**

None - specification is clear and unambiguous.

**Technical Specification:**
See [SPEC-005] below.

---

### [OBS-006] Integrate Related Entities Table into Main Entity Pages

**Date:** 2025-11-11
**Context:** User decision to deprecate inspect routes and integrate table structure into main entity pages
**Entity Types Affected:** [ ] fabrica [ ] jingle [ ] cancion [ ] artista [ ] tematica [x] all

**Raw Observation:**

> "I will deprecate the inspect and the inspect-related routes and pages, but would like to have the heading row, the content row and the table as per specification added to the main /{entity-type}/{entity-id} pages."

**Technical Articulation:**

**Current Implementation:**

- **Main Entity Pages** (routes `/j/:jingleId`, `/c/:cancionId`, `/f/:fabricaId`, `/a/:artistaId`, `/t/:tematicaId`):

  - Files:
    - `frontend/src/pages/inspect/InspectJingle.tsx`
    - `frontend/src/pages/inspect/InspectCancion.tsx`
    - `frontend/src/pages/inspect/InspectFabrica.tsx`
    - `frontend/src/pages/inspect/InspectArtista.tsx`
    - `frontend/src/pages/inspect/InspectTematica.tsx`
  - Current behavior: Display basic entity information (title, simple text)
  - Do NOT currently use RelatedEntities component
  - Do NOT show related entities table structure

- **Inspect Routes (to be deprecated):**

  - `/inspect/:entityType/:entityId` → `InspectEntityPage.tsx` (demo/test page)
  - `/inspect-related/:entityType/:entityId` → `InspectRelatedEntitiesPage.tsx` (demo/test page with RelatedEntities)
  - These are demo/test pages that show RelatedEntities component

- **RelatedEntities Component:**
  - Currently used in InspectRelatedEntitiesPage
  - Implements the table structure with heading/content rows and indentation
  - Ready to be integrated into main entity pages

**User's Expected Behavior:**

1. **Deprecate Inspect Routes:**

   - Remove or deprecate `/inspect/:entityType/:entityId` route
   - Remove or deprecate `/inspect-related/:entityType/:entityId` route
   - Remove or deprecate InspectEntityPage and InspectRelatedEntitiesPage components

2. **Enhance Main Entity Pages:**

   - Add RelatedEntities table structure to all main entity pages
   - Each page should:
     - Load entity from API (using entityId from route params)
     - Display entity as title row (EntityCard with `variant="heading"`)
     - Display related entities using RelatedEntities component
     - RelatedEntities will show content rows with indentation per specification

3. **Table Structure Integration:**
   - Title row: EntityCard with `variant="heading"` showing the main entity
   - Content rows: RelatedEntities component showing related entities with:
     - EntityCard with `variant="contents"`
     - Indentation levels for nested relationships
     - Icons per specification (including context-dependent Artista icons)

**Clarification Needed:**

None - request is clear and unambiguous.

**Technical Specification:**
See [SPEC-006] below.

---

## Pending Clarifications

<!-- No pending clarifications at this time -->

---

## Technical Specifications (Ready for Refactoring)

### [SPEC-001] EntityCard Variant Refactoring: "card"/"row" → "heading"/"contents"

**Based on:** [OBS-001]  
**Status:** Ready for implementation  
**Priority:** High  
**Entity Types Affected:** All (fabrica, jingle, cancion, artista, tematica)

#### Overview

Refactor EntityCard component to replace `variant="card"` and `variant="row"` with `variant="heading"` and `variant="contents"`. Both new variants are based on the current "row" layout (horizontal, compact). The "card" vertical layout is deprecated.

#### Component Changes

**File:** `frontend/src/components/common/EntityCard.tsx`

1. **Update EntityCardProps interface:**

   - Change `variant?: 'card' | 'row'` to `variant?: 'heading' | 'contents'`
   - Default variant: `'contents'` (replaces `'card'` as default)

2. **Update variant logic:**

   - Remove `variant="card"` implementation (vertical layout)
   - Base both `variant="heading"` and `variant="contents"` on current `variant="row"` implementation
   - Both variants use horizontal, compact layout with:
     - Icon (left)
     - Primary text (entity name/title)
     - Secondary text (metadata, dates, etc.)
     - Badges (if applicable)

3. **Update CSS class generation:**

   - Replace `entity-card--card` and `entity-card--row` with `entity-card--heading` and `entity-card--contents`
   - Maintain same base structure: `entity-card entity-card--{variant}`

4. **Backward compatibility (deprecation):**
   - Add deprecation warnings for `variant="card"` and `variant="row"`
   - Map deprecated variants:
     - `variant="card"` → `variant="contents"` (with console.warn)
     - `variant="row"` → `variant="contents"` (with console.warn)
   - Remove deprecated variants in future major version

#### Styling Changes

**File:** `frontend/src/styles/components/entity-card.css`

1. **Remove:**

   - `.entity-card--card` styles (vertical layout)
   - `.entity-card--row` styles

2. **Add/Update:**

   - `.entity-card--heading`: Light background, standard height
   - `.entity-card--contents`: Dark background, slightly narrower height
   - Both share base horizontal layout from current `.entity-card--row`

3. **Visual Differentiation:**

   - **Heading variant:**

     - Background: Light (e.g., `#f9f9f9` or `#ffffff`)
     - Height: Standard (current row height, e.g., `min-height: 40px`)
     - Typography: May be slightly bolder or larger for emphasis

   - **Contents variant:**
     - Background: Dark (e.g., `#f5f5f5` or slightly darker than heading)
     - Height: Slightly narrower (e.g., `min-height: 36px` or `padding: 6px 12px` vs `8px 12px`)
     - Typography: Standard weight/size

4. **Maintain existing:**
   - Hover states
   - Active states
   - Focus states
   - Icon sizing
   - Badge styling
   - Responsive behavior

#### RelatedEntities Component Refactoring

**File:** `frontend/src/components/common/RelatedEntities.tsx`

1. **Label Column (currently lines 682):**

   - **Current:** Plain `<td>` with text: `{rel.label}:`
   - **New:** Use EntityCard with `variant="heading"`
   - Create entity-like object for relationship label:
     - Icon: Could use relationship type icon or generic icon
     - Primary text: `rel.label` (e.g., "Fabrica", "Cancion")
     - Secondary text: Optional (could show count or relationship metadata)
   - Wrap in `<td className="related-entities__label-col">`

2. **Data Column (currently lines 777-783):**

   - **Current:** EntityCard with `variant="row"`
   - **New:** EntityCard with `variant="contents"`
   - Update all EntityCard instances in data column

3. **Entity Data for Heading:**
   - For relationship labels, create a minimal entity representation:
     - Use relationship type as primary text
     - Optionally include relationship metadata as secondary text
     - Use appropriate icon (may need relationship type → icon mapping)

#### Files Requiring Updates

1. **Component Files:**

   - `frontend/src/components/common/EntityCard.tsx` - Main refactoring
   - `frontend/src/components/common/RelatedEntities.tsx` - Use new variants
   - `frontend/src/components/admin/EntityList.tsx` - Update if uses variants
   - `frontend/src/components/admin/FabricaList.tsx` - Update if uses variants

2. **Style Files:**

   - `frontend/src/styles/components/entity-card.css` - New variant styles

3. **Test Files:**

   - `frontend/src/components/__tests__/EntityCard.test.tsx` - Update tests for new variants

4. **Demo/Inspection Pages:**
   - `frontend/src/pages/inspect/InspectEntityPage.tsx` - Update examples
   - `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx` - Verify demo works

#### Implementation Notes

1. **Relationship Label Entity Creation:**

   - Need to create entity-like objects for relationship labels
   - Consider adding helper function: `createRelationshipLabelEntity(rel: RelationshipConfig)`
   - Returns object with: `{ id, icon, primaryText, secondaryText? }`

2. **Icon Mapping:**

   - May need to extend `getEntityIcon()` or create `getRelationshipIcon()` function
   - Map relationship types to appropriate icons

3. **Migration Path:**

   - Phase 1: Add new variants alongside old ones (with deprecation warnings)
   - Phase 2: Update all usages to new variants
   - Phase 3: Remove deprecated variants (future major version)

4. **Testing:**
   - Verify all entity types render correctly with both variants
   - Verify RelatedEntities table structure with new variants
   - Verify backward compatibility (deprecated variants still work)
   - Verify visual differentiation (light vs dark, height differences)

#### Future Considerations

- **Table Component:** Longer-term consideration to extract table generation into a reusable component (not part of this spec)

#### Acceptance Criteria

- [ ] EntityCard supports `variant="heading"` and `variant="contents"`
- [ ] Both variants use horizontal, compact layout (based on current "row")
- [ ] Visual differentiation: light background for heading, dark for contents
- [ ] Content variant has slightly narrower height than heading
- [ ] Both variants display: icon, name, and core entity data
- [ ] RelatedEntities uses EntityCard for both label and data columns
- [ ] Deprecated variants (`card`, `row`) show warnings but still work
- [ ] All existing tests pass or are updated
- [ ] Demo pages reflect new variants

---

### [SPEC-002] Remove "active" Prop from EntityCard Component

**Based on:** [OBS-002]  
**Status:** Ready for implementation  
**Priority:** Medium  
**Entity Types Affected:** All (fabrica, jingle, cancion, artista, tematica)

#### Overview

Remove the `active` prop and related functionality from EntityCard component. This includes removing the prop from the interface, CSS classes, styles, usages, and tests.

#### Component Changes

**File:** `frontend/src/components/common/EntityCard.tsx`

1. **Remove from EntityCardProps interface:**

   - Remove `active?: boolean;` prop (line 20)
   - Remove JSDoc comment: "Whether the card is active/selected (highlighted state)"

2. **Remove from function parameters:**

   - Remove `active = false,` from function destructuring (line 219)

3. **Remove from CSS class generation:**

   - Remove `active ? 'entity-card--active' : '',` from cardClasses array (line 307)
   - Update filter to remove empty string handling if it was only for active

4. **Update JSDoc examples:**
   - Remove `active={activeJingleId === jingle.id}` from example (line 200)

#### Styling Changes

**File:** `frontend/src/styles/components/entity-card.css`

1. **Remove:**
   - `.entity-card--active` class and all its styles (lines 39-43)
   - Background color: `#f0f7ff`
   - Border color override
   - Box shadow effect

#### Usage Updates

**File:** `frontend/src/pages/inspect/InspectEntityPage.tsx`

1. **Remove active prop usages:**
   - Line 143: Remove `active={true}` prop
   - Line 214: Remove `active={true}` prop

#### Test Updates

**File:** `frontend/src/components/__tests__/EntityCard.test.tsx`

1. **Remove active-related tests:**
   - Remove test case that renders with `active={true}` (line 314)
   - Remove test case that renders with `active={false}` (line 322)
   - Remove assertions checking for `entity-card--active` class (lines 317, 325)
   - Remove entire test describe block if it only tests active functionality

#### Files Requiring Updates

1. **Component Files:**

   - `frontend/src/components/common/EntityCard.tsx` - Remove prop and logic

2. **Style Files:**

   - `frontend/src/styles/components/entity-card.css` - Remove active styles

3. **Usage Files:**

   - `frontend/src/pages/inspect/InspectEntityPage.tsx` - Remove active prop

4. **Test Files:**
   - `frontend/src/components/__tests__/EntityCard.test.tsx` - Remove active tests

#### Implementation Notes

1. **No Replacement:**

   - This removal does not require a replacement mechanism
   - If selection/highlighting is needed in the future, it should be handled at a higher level (parent component state, CSS classes applied externally, etc.)

2. **Breaking Change:**

   - This is a breaking change for any code using the `active` prop
   - However, since it's being removed as part of refactoring, this is acceptable

3. **CSS Cleanup:**
   - Ensure no other components or styles depend on `.entity-card--active` class
   - Verify no CSS selectors reference this class elsewhere

#### Acceptance Criteria

- [ ] `active` prop removed from EntityCardProps interface
- [ ] `active` prop removed from function parameters
- [ ] `entity-card--active` class generation removed
- [ ] `.entity-card--active` CSS class and styles removed
- [ ] All usages of `active` prop removed from components
- [ ] All tests related to `active` prop removed
- [ ] JSDoc examples updated to remove active references
- [ ] No references to "active" remain in EntityCard component
- [ ] Component still functions correctly without active prop

---

### [SPEC-003] Related Entity Tables: Title Row + Indented Content Rows with Indentation Column

**Based on:** [OBS-003]  
**Status:** Ready for implementation  
**Priority:** High  
**Entity Types Affected:** All (fabrica, jingle, cancion, artista, tematica)

#### Overview

Refactor RelatedEntities component to use a new table structure where:

1. Each relationship type has a title row (parent entity) + content rows (related entities)
2. Indentation is handled via a dedicated left column (indentation column)
3. EntityCard supports `indentationLevel` prop to control indentation width
4. Nested relationships add content rows with increased indentation, no new headings

**⚠️ Significant Architectural Change:** This deviates from the current two-column structure (label + data) to a new structure (indentation + content).

#### Component Changes

**File:** `frontend/src/components/common/EntityCard.tsx`

1. **Add indentationLevel prop to EntityCardProps interface:**

   ```typescript
   /** Indentation level for table rows (0 = no indent, 1 = 16px, 2 = 32px, etc.) */
   indentationLevel?: number;
   ```

2. **Update function parameters:**

   - Add `indentationLevel = 0,` to function destructuring
   - Default value: `0` (no indentation)

3. **Calculate indentation width:**

   - Base unit: `16px` per level
   - Width = `indentationLevel * 16px`
   - Consider CSS custom property for adaptive sizing on narrow screens

4. **Apply indentation:**
   - Add CSS class: `entity-card--indent-{level}` (e.g., `entity-card--indent-0`, `entity-card--indent-1`)
   - Or use inline style: `paddingLeft: `${indentationLevel \* 16}px``
   - Apply to the root element of EntityCard

**File:** `frontend/src/components/common/RelatedEntities.tsx`

1. **Restructure table layout:**

   - **Current:** Two columns (label column + data column)
   - **New:** Two columns (indentation column + content column)
   - Indentation column: Variable width based on `indentationLevel`
   - Content column: Contains EntityCard components

2. **Title row structure:**

   - Each relationship type section starts with a title row
   - Title row uses EntityCard with `variant="heading"`
   - Title row shows parent entity information (icon, name, core data)
   - Title row has `indentationLevel={0}` (no indentation)
   - Title row spans both columns or only content column (indentation column empty)

3. **Content rows structure:**

   - Content rows use EntityCard with `variant="contents"`
   - Each content row has `indentationLevel` based on nesting depth
   - Icon in each row indicates the entity type of the related item
   - Indentation column width = `indentationLevel * 16px`

4. **Nested relationships:**

   - When rendering nested RelatedEntities, add content rows with increased `indentationLevel`
   - Do NOT create new title rows for nested structures
   - Calculate indentation: `baseLevel + 1` for each nesting level
   - Pass `indentationLevel` prop to nested EntityCard components

5. **Remove old structure:**
   - Remove label column (`related-entities__label-col`)
   - Remove relationship type labels as separate column
   - Relationship type information may be shown in title row or via EntityCard icon

#### Styling Changes

**File:** `frontend/src/styles/components/entity-card.css`

1. **Add indentation support:**

   ```css
   /* Indentation levels - base unit 16px */
   .entity-card--indent-0 {
     padding-left: 0;
   }
   .entity-card--indent-1 {
     padding-left: 16px;
   }
   .entity-card--indent-2 {
     padding-left: 32px;
   }
   .entity-card--indent-3 {
     padding-left: 48px;
   }
   /* Add more levels as needed, or use CSS calc() */
   ```

2. **Alternative: Use CSS custom property:**

   ```css
   .entity-card {
     --indent-base: 16px;
     padding-left: calc(var(--indent-level, 0) * var(--indent-base));
   }
   ```

3. **Responsive indentation:**
   ```css
   @media (max-width: 600px) {
     .entity-card {
       --indent-base: 12px; /* Smaller on narrow screens */
     }
   }
   ```

**File:** `frontend/src/styles/components/related-entities.css`

1. **Update table structure:**

   - Remove `.related-entities__label-col` styles
   - Add `.related-entities__indent-col` for indentation column
   - Update `.related-entities__data-col` to `.related-entities__content-col`

2. **Indentation column:**

   ```css
   .related-entities__indent-col {
     width: auto;
     min-width: 0;
     padding: 0;
   }
   ```

3. **Content column:**

   ```css
   .related-entities__content-col {
     padding: 12px 0;
     width: 100%;
   }
   ```

4. **Remove nested margin:**

   - Remove `.related-entities__nested` margin-left styles
   - Indentation is now handled via EntityCard `indentationLevel` prop

5. **Title row styling:**
   - Ensure title row (heading variant) has no indentation
   - May need specific styling for title rows

#### Table Structure Example

**Current Structure:**

```
| Label Column    | Data Column           |
|-----------------|----------------------|
| Fabrica:        | 🏭 Fábrica 001       |
| Cancion:        | 🎶 Song Title        |
```

**New Structure:**

```
| Indent | Content                    |
|--------|----------------------------|
|        | 🏭 Fábrica 001 (title)    |
|        | 🏭 Related Fabrica 1      |
|  16px  | 🏭 Nested Fabrica 1       |
|  32px  | 🏭 Deep Nested Fabrica 1  |
```

#### Files Requiring Updates

1. **Component Files:**

   - `frontend/src/components/common/EntityCard.tsx` - Add indentationLevel prop
   - `frontend/src/components/common/RelatedEntities.tsx` - Restructure table, add title rows

2. **Style Files:**

   - `frontend/src/styles/components/entity-card.css` - Add indentation styles
   - `frontend/src/styles/components/related-entities.css` - Update table structure

3. **Test Files:**
   - `frontend/src/components/__tests__/EntityCard.test.tsx` - Test indentationLevel prop
   - RelatedEntities tests - Update for new structure

#### Implementation Notes

1. **Indentation Calculation:**

   - Base level: `0` (title rows, top-level content)
   - Each nesting level: `+1`
   - Formula: `indentationLevel = nestingDepth`
   - Width: `indentationLevel * 16px`

2. **Title Row Implementation:**

   - Use EntityCard with `variant="heading"` for parent entity
   - Show entity icon, name, and core data
   - `indentationLevel={0}` (no indentation)
   - May need to handle relationship type label (could be in title or via icon)

3. **Nested Relationships:**

   - When rendering nested RelatedEntities, calculate indentation level:
     ```typescript
     const nestedIndentationLevel = currentIndentationLevel + 1;
     ```
   - Pass to EntityCard: `indentationLevel={nestedIndentationLevel}`
   - Do NOT render new RelatedEntities component recursively
   - Instead, render EntityCard rows directly with increased indentation

4. **Migration from Current Structure:**

   - Current: Relationship type label in left column, entities in right column
   - New: Title row (parent entity) + content rows (related entities) with indentation
   - Relationship type information may need to be incorporated into title or handled differently

5. **Responsive Considerations:**
   - Use CSS custom property for base indentation unit
   - Reduce base unit on narrow screens (e.g., 12px instead of 16px)
   - Consider collapsing indentation on very narrow screens

#### Acceptance Criteria

- [ ] EntityCard supports `indentationLevel` prop (0-based, 16px per level)
- [ ] Indentation is applied via CSS (classes or custom properties)
- [ ] RelatedEntities uses new table structure (indentation column + content column)
- [ ] Each relationship type has title row (parent entity) + content rows
- [ ] Title rows use EntityCard `variant="heading"` with `indentationLevel={0}`
- [ ] Content rows use EntityCard `variant="contents"` with appropriate `indentationLevel`
- [ ] Nested relationships add content rows with increased indentation (no new headings)
- [ ] Icon in each content row indicates entity type
- [ ] Responsive indentation (smaller base unit on narrow screens)
- [ ] Old label column structure removed
- [ ] All tests updated for new structure

---

### [SPEC-004] Entity Table Field Mapping: Title Row vs Content Rows

**Based on:** [OBS-004]  
**Status:** Ready for implementation  
**Priority:** High  
**Entity Types Affected:** All (fabrica, jingle, cancion, artista, tematica)

#### Overview

Ensure EntityCard component correctly displays fields according to the specification in `tasks/tasks-0001-3-1.md`. Title rows (heading variant) show Title + Primary metadata, while content rows (contents variant) show expandable relationship entities.

#### Field Display Requirements

**Title Row (variant="heading"):**

- Displays parent entity with:
  - Icon (entity type indicator)
  - Primary field (Title/Name)
  - Secondary/Metadata fields (dates, categories, etc.)
  - Badges (if applicable: JINGLAZO, PRECARIO)

**Content Rows (variant="contents"):**

- Display related entities from expandable relationships
- Each row shows:
  - Icon (entity type of related item)
  - Primary field (Title/Name of related entity)
  - Secondary/Metadata fields (if applicable)
  - Badges (if applicable)

#### Component Updates Required

**File:** `frontend/src/components/common/EntityCard.tsx`

1. **Update `getPrimaryText()` function:**

   - **Cancion:** Should return `"Titulo (Autor(es))"` format
     - Current: Returns just `cancion.title`
     - Required: Format as `"Title (Author1, Author2)"` or `"Title"` if no authors
     - Need to access autor relationship data (may require entity data enhancement)

2. **Update `getSecondaryText()` function:**

   - **Jingle:** Should show fabrica.date or "INEDITO"
     - Current: Returns `null` (commented as "handled by badge/relationship data")
     - Required: Show `fabrica.date` if linked to Fabrica, otherwise "INEDITO"
     - Need to access fabrica relationship data (may require entity data enhancement)

3. **Verify `getEntityBadges()` function:**

   - **Jingle:** Should display JINGLAZO and PRECARIO badges
     - Current: Already implemented correctly
     - Verify badges display when `isJinglazo === true` or `isPrecario === true`

4. **Field Display Verification:**

   - **Fabrica:**

     - ✅ Primary: Titulo (title)
     - ✅ Secondary: Fecha de publicacion (date)

   - **Jingle:**

     - ✅ Primary: Titulo (title)
     - ⚠️ Secondary: Fecha de publicacion or "INEDITO" (needs update)
     - ✅ Badges: JINGLAZO, PRECARIO

   - **Cancion:**

     - ⚠️ Primary: "Titulo (Autor(es))" (needs update)
     - ✅ Secondary: Album, Año (already shows album • year)
     - Note: Imagen (YouTube URL) not currently displayed - may be future enhancement

   - **Artista:**

     - ✅ Primary: Nombre Artistico (stageName)
     - ✅ Secondary: Nombre Real (name), Nacionalidad (already shows name • nationality)

   - **Tematica:**
     - ✅ Primary: Nombre (name)
     - ✅ Secondary: Categoria (category)

#### Data Access Considerations

**Relationship Data Access:**

1. **Cancion Primary Text:**

   - Need to format as "Title (Author1, Author2)"
   - Requires access to autor relationship data
   - Options:
     - Pass autor data as additional prop
     - Enhance entity type to include autor names
     - Fetch autor data when rendering Cancion
     - Use relationship data from RelatedEntities context

2. **Jingle Secondary Text:**
   - Need to show fabrica.date or "INEDITO"
   - Requires access to fabrica relationship data
   - Options:
     - Pass fabrica data as additional prop
     - Enhance Jingle type to include fabrica.date
     - Fetch fabrica data when rendering Jingle
     - Use relationship data from RelatedEntities context

#### Implementation Strategy

**Option 1: Enhance Entity Types**

- Add computed fields to entity types (e.g., `fabricaDate` on Jingle)
- Requires backend/API changes or client-side computation

**Option 2: Pass Relationship Data as Props**

- Add optional props to EntityCard: `relationshipData?: Record<string, any>`
- RelatedEntities component passes relationship context
- EntityCard uses relationship data when available

**Option 3: Context-Based Data Access**

- Use React Context to provide relationship data
- EntityCard consumes context when rendering
- More complex but cleaner separation

**Option 4: Fetch on Demand**

- EntityCard fetches relationship data when needed
- Adds complexity and potential performance issues
- Not recommended for this use case

**Recommended Approach:**

- Use Option 2 (relationship data as props) for immediate implementation
- Can be enhanced to Option 3 (context) later if needed
- Keeps EntityCard flexible and testable

#### Files Requiring Updates

1. **Component Files:**

   - `frontend/src/components/common/EntityCard.tsx` - Update field display functions
   - `frontend/src/components/common/RelatedEntities.tsx` - Pass relationship data to EntityCard

2. **Type Files:**

   - May need to enhance entity types or create relationship data types

3. **Test Files:**
   - `frontend/src/components/__tests__/EntityCard.test.tsx` - Update tests for new field formats

#### Implementation Notes

1. **Cancion "Titulo (Autor(es))" Format:**

   - If no autores: Show just "Titulo"
   - If one autor: Show "Titulo (Autor)"
   - If multiple autores: Show "Titulo (Autor1, Autor2, ...)"
   - Handle case where autor data is not available (fallback to just title)

2. **Jingle "INEDITO" Display:**

   - Check if jingle has fabrica relationship
   - If fabrica exists: Show formatted fabrica.date
   - If no fabrica: Show "INEDITO" text
   - Handle loading/unknown state gracefully

3. **Backward Compatibility:**
   - Ensure EntityCard works without relationship data (current behavior)
   - Only enhance display when relationship data is provided
   - Maintain fallback to current field display

#### Acceptance Criteria

- [ ] Cancion primary text displays as "Titulo (Autor(es))" format when autor data available
- [ ] Cancion falls back to just "Titulo" when autor data not available
- [ ] Jingle secondary text shows fabrica.date when linked to Fabrica
- [ ] Jingle secondary text shows "INEDITO" when not linked to Fabrica
- [ ] All entity types display primary fields correctly per specification
- [ ] All entity types display secondary/metadata fields correctly per specification
- [ ] Badges (JINGLAZO, PRECARIO) display correctly for Jingle
- [ ] Title rows (heading variant) show parent entity with all primary and secondary fields
- [ ] Content rows (contents variant) show related entities with appropriate fields
- [ ] EntityCard works without relationship data (backward compatible)
- [ ] EntityCard enhances display when relationship data is provided
- [ ] All tests updated for new field formats

---

### [SPEC-005] Entity Icon Specification Update

**Based on:** [OBS-005]  
**Status:** Ready for implementation  
**Priority:** Medium  
**Entity Types Affected:** All (fabrica, jingle, cancion, artista, tematica)

#### Overview

Update entity icon mapping in EntityCard component to match specification. Artista icons are context-dependent: different icons for heading vs content, and different icons for Jinglero vs Autor relationships.

#### Icon Mapping

**Standard Icons (no context):**

- Fabrica: 🏭 (no change)
- Jingle: 🎤 (change from 🎵)
- Cancion: 📦 (change from 🎶)
- Tematica: 🏷️ (no change)

**Context-Dependent Artista Icons:**

- Artista as heading: 👤 (no change, default)
- Artista as content - Jinglero: 🔧 (new)
- Artista as content - Autor: 🚚 (new)

#### Component Changes

**File:** `frontend/src/components/common/EntityCard.tsx`

1. **Update EntityCardProps interface:**

   ```typescript
   /** Optional relationship label for context-dependent icons (e.g., "Jinglero", "Autor" for Artista) */
   relationshipLabel?: string;
   ```

2. **Update `getEntityIcon()` function signature:**

   - Change from: `getEntityIcon(entityType: EntityType): string`
   - Change to: `getEntityIcon(entityType: EntityType, variant?: 'heading' | 'contents', relationshipLabel?: string): string`

3. **Update icon mapping logic:**

   ```typescript
   function getEntityIcon(
     entityType: EntityType,
     variant?: "heading" | "contents",
     relationshipLabel?: string
   ): string {
     // Context-dependent Artista icons
     if (entityType === "artista") {
       if (variant === "contents" && relationshipLabel === "Jinglero") {
         return "🔧";
       }
       if (variant === "contents" && relationshipLabel === "Autor") {
         return "🚚";
       }
       // Default: heading or no context
       return "👤";
     }

     // Standard icons
     const iconMap: Record<Exclude<EntityType, "artista">, string> = {
       fabrica: "🏭",
       jingle: "🎤",
       cancion: "📦",
       tematica: "🏷️",
     };
     return iconMap[entityType];
   }
   ```

4. **Update EntityCard component:**
   - Add `relationshipLabel` to function parameters
   - Update icon call: `const icon = getEntityIcon(entityType, variant, relationshipLabel);`

#### RelatedEntities Component Updates

**File:** `frontend/src/components/common/RelatedEntities.tsx`

1. **Pass relationship label to EntityCard:**

   - When rendering content rows (variant="contents"), pass `relationshipLabel={rel.label}`
   - When rendering title rows (variant="heading"), do not pass relationshipLabel (or pass undefined)

2. **Update EntityCard usage in content rows:**

   ```typescript
   <EntityCard
     entity={relatedEntity}
     entityType={rel.entityType}
     variant="contents"
     relationshipLabel={rel.label} // Pass relationship label for context
     indentationLevel={nestedIndentationLevel}
   />
   ```

3. **Update EntityCard usage in title rows:**
   ```typescript
   <EntityCard
     entity={entity}
     entityType={entityType}
     variant="heading"
     // No relationshipLabel for title rows
   />
   ```

#### Files Requiring Updates

1. **Component Files:**

   - `frontend/src/components/common/EntityCard.tsx` - Update icon function and props
   - `frontend/src/components/common/RelatedEntities.tsx` - Pass relationshipLabel prop

2. **Test Files:**

   - `frontend/src/components/__tests__/EntityCard.test.tsx` - Test icon mapping with context

3. **Other Usage Sites:**
   - Check all places where EntityCard is used to ensure they work with new signature
   - Most usages won't need changes (relationshipLabel is optional)

#### Implementation Notes

1. **Backward Compatibility:**

   - `relationshipLabel` is optional, so existing code continues to work
   - Default behavior: Artista shows 👤 when no context provided
   - This matches heading behavior, which is the most common use case

2. **Relationship Label Matching:**

   - Match relationship labels exactly: "Jinglero" and "Autor" (case-sensitive)
   - These labels come from RelationshipConfig.label in relationshipConfigs.ts
   - Verify labels match exactly: "Jinglero" (not "Jingleros") and "Autor" (not "Autores")

3. **Icon Display:**

   - Icons are emoji, so ensure proper rendering across platforms
   - Test on different browsers and operating systems
   - Consider fallback if emoji rendering issues occur

4. **Future Extensibility:**
   - Function signature allows for future context-dependent icons
   - Can add more relationship types or variants if needed
   - Pattern is extensible without breaking changes

#### Acceptance Criteria

- [ ] Fabrica icon is 🏭
- [ ] Jingle icon is 🎤 (changed from 🎵)
- [ ] Cancion icon is 📦 (changed from 🎶)
- [ ] Tematica icon is 🏷️
- [ ] Artista as heading shows 👤
- [ ] Artista as content with relationshipLabel="Jinglero" shows 🔧
- [ ] Artista as content with relationshipLabel="Autor" shows 🚚
- [ ] Artista without relationshipLabel shows 👤 (default/heading behavior)
- [ ] EntityCard accepts optional relationshipLabel prop
- [ ] RelatedEntities passes relationshipLabel to content row EntityCards
- [ ] All existing EntityCard usages continue to work (backward compatible)
- [ ] Tests updated for new icon mapping

---

### [SPEC-006] Integrate Related Entities Table into Main Entity Pages

**Based on:** [OBS-006]  
**Status:** Ready for implementation  
**Priority:** High  
**Entity Types Affected:** All (fabrica, jingle, cancion, artista, tematica)

#### Overview

Deprecate inspect routes and integrate RelatedEntities table structure (heading row + content rows with indentation) into the main entity pages (`/j/:jingleId`, `/c/:cancionId`, `/f/:fabricaId`, `/a/:artistaId`, `/t/:tematicaId`).

#### Route Changes

**File:** `frontend/src/App.tsx`

1. **Deprecate inspect routes:**

   - Remove or comment out:
     - `<Route path="/inspect/:entityType/:entityId" element={<InspectEntityPage />} />`
     - `<Route path="/inspect-related/:entityType/:entityId" element={<InspectRelatedEntitiesPage />} />`
   - Optionally add redirect to main entity pages or show deprecation notice

2. **Keep main entity routes:**
   - `/j/:jingleId` → InspectJingle (enhanced)
   - `/c/:cancionId` → InspectCancion (enhanced)
   - `/f/:fabricaId` → InspectFabrica (enhanced)
   - `/a/:artistaId` → InspectArtista (enhanced)
   - `/t/:tematicaId` → InspectTematica (enhanced)

#### Main Entity Page Updates

**Files to Update:**

- `frontend/src/pages/inspect/InspectJingle.tsx`
- `frontend/src/pages/inspect/InspectCancion.tsx`
- `frontend/src/pages/inspect/InspectFabrica.tsx`
- `frontend/src/pages/inspect/InspectArtista.tsx`
- `frontend/src/pages/inspect/InspectTematica.tsx`

**Common Pattern for All Pages:**

1. **Load Entity from API:**

   ```typescript
   useEffect(() => {
     const fetchEntity = async () => {
       try {
         setLoading(true);
         setError(null);

         // Fetch entity based on type
         const fetchedEntity = await publicApi.get[EntityType](entityId);
         setEntity(fetchedEntity);
       } catch (err) {
         setError("Error loading entity");
       } finally {
         setLoading(false);
       }
     };

     if (entityId) {
       fetchEntity();
     }
   }, [entityId]);
   ```

2. **Get Relationships:**

   ```typescript
   const relationships = getRelationshipsForEntityType(entityType);
   ```

3. **Render Structure:**
   ```typescript
   return (
     <main>
       <nav>...</nav>

       {loading && <p>Loading...</p>}
       {error && <p>Error: {error}</p>}

       {entity && (
         <>
           {/* Title Row - Entity as Heading */}
           <EntityCard
             entity={entity}
             entityType={entityType}
             variant="heading"
             indentationLevel={0}
           />

           {/* Related Entities Table */}
           <RelatedEntities
             entity={entity}
             entityType={entityType}
             relationships={relationships}
             entityPath={[entity.id]}
           />
         </>
       )}
     </main>
   );
   ```

#### Specific Page Updates

**InspectJingle.tsx:**

- Import: `RelatedEntities`, `getRelationshipsForEntityType`, `EntityCard`, `publicApi`
- Load jingle: `await publicApi.getJingle(jingleId)`
- Use `getRelationshipsForEntityType('jingle')`

**InspectCancion.tsx:**

- Import: `RelatedEntities`, `getRelationshipsForEntityType`, `EntityCard`, `publicApi`
- Load cancion: `await publicApi.getCancion(cancionId)`
- Use `getRelationshipsForEntityType('cancion')`

**InspectFabrica.tsx:**

- Import: `RelatedEntities`, `getRelationshipsForEntityType`, `EntityCard`, `publicApi`
- Load fabrica: `await publicApi.getFabrica(fabricaId)`
- Use `getRelationshipsForEntityType('fabrica')`

**InspectArtista.tsx:**

- Import: `RelatedEntities`, `getRelationshipsForEntityType`, `EntityCard`, `publicApi`
- Load artista: `await publicApi.getArtista(artistaId)`
- Use `getRelationshipsForEntityType('artista')`

**InspectTematica.tsx:**

- Import: `RelatedEntities`, `getRelationshipsForEntityType`, `EntityCard`, `publicApi`
- Load tematica: `await publicApi.getTematica(tematicaId)`
- Use `getRelationshipsForEntityType('tematica')`

#### Deprecation of Inspect Pages

**Files to Deprecate/Remove:**

- `frontend/src/pages/inspect/InspectEntityPage.tsx` - Can be removed or kept for reference
- `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx` - Can be removed or kept for reference

**Options:**

1. **Remove completely:** Delete files and remove imports from App.tsx
2. **Deprecate with notice:** Keep files but add deprecation warnings, redirect to main pages
3. **Keep for development:** Comment out routes but keep files for testing

**Recommended:** Option 1 (remove completely) after verifying main pages work correctly.

#### Files Requiring Updates

1. **Route Configuration:**

   - `frontend/src/App.tsx` - Remove inspect routes

2. **Main Entity Pages (5 files):**

   - `frontend/src/pages/inspect/InspectJingle.tsx`
   - `frontend/src/pages/inspect/InspectCancion.tsx`
   - `frontend/src/pages/inspect/InspectFabrica.tsx`
   - `frontend/src/pages/inspect/InspectArtista.tsx`
   - `frontend/src/pages/inspect/InspectTematica.tsx`

3. **Deprecation (optional):**
   - `frontend/src/pages/inspect/InspectEntityPage.tsx` - Remove or deprecate
   - `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx` - Remove or deprecate

#### Implementation Notes

1. **Entity Loading:**

   - Each page must load the entity before rendering RelatedEntities
   - RelatedEntities requires entity prop to be fully loaded
   - Handle loading and error states appropriately

2. **Title Row Display:**

   - Use EntityCard with `variant="heading"` for the main entity
   - This shows the entity as the title row of the table
   - `indentationLevel={0}` (no indentation for title)

3. **RelatedEntities Integration:**

   - RelatedEntities will handle rendering content rows
   - Content rows will use EntityCard with `variant="contents"`
   - Indentation and nesting handled by RelatedEntities per SPEC-003

4. **Navigation:**

   - Keep existing navigation structure in each page
   - Ensure navigation links work correctly

5. **Error Handling:**

   - Handle API errors gracefully
   - Show user-friendly error messages
   - Handle missing entity IDs

6. **Consistency:**
   - All 5 pages should follow the same pattern
   - Consistent loading states, error handling, and layout

#### Acceptance Criteria

- [ ] Inspect routes (`/inspect/*` and `/inspect-related/*`) are removed or deprecated
- [ ] All 5 main entity pages load entity from API
- [ ] All 5 main entity pages display entity as title row (EntityCard variant="heading")
- [ ] All 5 main entity pages display RelatedEntities component
- [ ] RelatedEntities shows content rows with proper indentation
- [ ] Icons display correctly (including context-dependent Artista icons)
- [ ] Loading states handled appropriately
- [ ] Error states handled appropriately
- [ ] Navigation works correctly on all pages
- [ ] All entity types work correctly (fabrica, jingle, cancion, artista, tematica)
- [ ] Deprecated inspect pages removed or clearly marked as deprecated

---

## Notes

- **Architectural Considerations:** Some observations may reveal patterns that affect component architecture. These should be flagged for architectural review before implementation.
- **Entity Type Scope:** When unclear, always ask: "Does this observation apply to all entity types, or only specific ones?"
- **Component Boundaries:** Clearly identify which component(s) are affected by each observation.
