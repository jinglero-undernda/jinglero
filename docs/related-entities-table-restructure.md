# RelatedEntities Table Restructure - Implementation Plan

**Status:** Pending Implementation  
**Priority:** High  
**Date:** 2025-11-11  
**Based on:** [SPEC-003] from entity-navigation-feedback.md

---

## Overview

This document outlines the pending task to restructure the RelatedEntities component table layout from the current two-column structure (label + data) to a new structure with title rows and indentation-based content display.

## Current Implementation

### Current Table Structure

```
| Label Column    | Data Column           |
|-----------------|----------------------|
| Fabrica:        | 🏭 Fábrica 001       |
| Cancion:        | 🎶 Song Title        |
```

- **Two-column layout:**
  - Label column: Contains relationship type labels (e.g., "Fabrica:", "Cancion:")
  - Data column: Contains EntityCard components for related entities

- **File:** `frontend/src/components/common/RelatedEntities.tsx`
- **Current behavior:**
  - Line 682: Label column renders plain `<td>` with text
  - Line 780: Data column renders EntityCard with `variant="contents"`
  - Nested relationships use recursive RelatedEntities components with `.related-entities__nested` class
  - Indentation is applied at component level, not per row

### Completed Related Work

✅ EntityCard supports `indentationLevel` prop (0-based, 16px per level)  
✅ EntityCard supports `heading` and `contents` variants  
✅ EntityCard supports `relationshipLabel` for context-dependent icons  
✅ CSS custom properties for responsive indentation  

---

## Target Implementation (SPEC-003)

### New Table Structure

```
| Indent | Content                    |
|--------|----------------------------|
|        | 🏭 Fábrica 001 (title)    |
|        | 🏭 Related Fabrica 1      |
|  16px  | 🏭 Nested Fabrica 1       |
|  32px  | 🏭 Deep Nested Fabrica 1  |
```

### Key Requirements

1. **Title Row per Relationship Type:**
   - Each relationship section starts with a title row
   - Title row uses EntityCard with `variant="heading"`
   - Title row shows **parent entity** information (icon, name, core data)
   - Title row has `indentationLevel={0}` (no indentation)

2. **Content Rows:**
   - Content rows use EntityCard with `variant="contents"`
   - Each content row represents a related entity
   - Icon indicates entity type of the related item
   - Indentation based on nesting depth

3. **Indentation Column Structure:**
   - Two-column table: indentation column + content column
   - Indentation column width varies based on `indentationLevel`
   - Content column contains EntityCard components

4. **Nested Relationships:**
   - Add content rows with increased indentation (+1 per level)
   - **No new title rows** for nested structures
   - Calculate: `indentationLevel = currentLevel + 1`

---

## Critical Clarification Questions

### 1. Title Row Content - Which Entity?

**Current Spec Says:** "Title row shows the parent entity information"

**Question:** In the context of RelatedEntities, what is the "parent entity"?

**Example Scenario:**
```
Rendering RelatedEntities for Jingle "Test Jingle":
- Relationship type: "Fabrica"
- Related entities: [Fabrica A, Fabrica B]
```

**Option A:** Title row shows the **current entity** (Jingle):
```
| 🎤 Test Jingle (heading)          |  ← Current entity being viewed
| 🏭 Fabrica A (contents)           |  ← Related entity
| 🏭 Fabrica B (contents)           |  ← Related entity
```

**Option B:** Title row shows the **relationship type label**:
```
| Fabrica: (heading as label)       |  ← Relationship type
| 🏭 Fabrica A (contents)           |  ← Related entity
| 🏭 Fabrica B (contents)           |  ← Related entity
```

**Option C:** No title row, just content rows:
```
| 🏭 Fabrica A (contents)           |  ← Related entity
| 🏭 Fabrica B (contents)           |  ← Related entity
```

**User Clarification Response (from SPEC-003 lines 271-276):**
✅ "Each relationship type has its own title row (entity title) + content rows underneath"  
✅ "Title row shows the entity title (parent entity information)"  
✅ "No indentation for title row"

**Still Unclear:** Does this mean:
- One title row at the top of the entire RelatedEntities component (showing the main entity)?
- Or one title row per relationship type section?

### 2. Multiple Relationship Types

**Question:** How should the table handle multiple relationship types?

**Example:** Jingle has relationships: Fabrica, Cancion, Autor, Jinglero, Tematicas

**Option A:** One title row at top, then all relationships grouped:
```
| 🎤 Test Jingle (heading)          |  ← Main entity title row
| 🏭 Fabrica A (contents)           |  ← From Fabrica relationship
| 🏭 Fabrica B (contents)           |
| 📦 Cancion A (contents)           |  ← From Cancion relationship
| 🚚 Autor A (contents)             |  ← From Autor relationship
| 🔧 Jinglero A (contents)          |  ← From Jinglero relationship
```

**Option B:** One title row per relationship type:
```
| Fabrica (heading label)           |  ← Relationship type header
| 🏭 Fabrica A (contents)           |
| 🏭 Fabrica B (contents)           |
| Cancion (heading label)           |  ← Relationship type header
| 📦 Cancion A (contents)           |
```

**Option C:** Main title + relationship sections with visual separators:
```
| 🎤 Test Jingle (heading)          |  ← Main entity
|-----------------------------------|
| 🏭 Fabrica A (contents)           |  ← Fabrica section
| 🏭 Fabrica B (contents)           |
|-----------------------------------|
| 📦 Cancion A (contents)           |  ← Cancion section
```

### 3. Nested Structure Clarification

**Question:** How should nested relationships display?

**Example:** Jingle → Fabrica A → Nested Jingles

**Current Spec Says:** "No new heading for nested structures"

**Interpretation A:** All nested content rows at increased indentation:
```
| 🎤 Test Jingle (heading)          |  ← Level 0: Main entity
| 🏭 Fabrica A (contents, level 0)  |  ← Level 0: Direct relation
|   🎤 Nested Jingle 1 (level 1)    |  ← Level 1: Nested (16px indent)
|   🎤 Nested Jingle 2 (level 1)    |  ← Level 1: Nested (16px indent)
| 🏭 Fabrica B (contents, level 0)  |  ← Level 0: Direct relation
```

**Interpretation B:** Nested relationships shown inline without expansion:
```
| 🎤 Test Jingle (heading)          |
| 🏭 Fabrica A (contents)           |
| 🏭 Fabrica B (contents)           |
(No nested content shown)
```

**User Clarification Response (from SPEC-003 lines 288-291):**
✅ "Nested tables add content rows with increased indentation"  
✅ "No new heading for nested structures"

### 4. Indentation Column Implementation

**Question:** Should the indentation column be:

**Option A:** A separate `<td>` column with variable width:
```html
<tr>
  <td class="indent-col" style="width: 16px"></td>
  <td class="content-col">
    <EntityCard ... />
  </td>
</tr>
```

**Option B:** Applied via padding-left on EntityCard (already implemented):
```html
<tr>
  <td class="content-col">
    <EntityCard indentationLevel={1} ... />  <!-- padding-left: 16px -->
  </td>
</tr>
```

**Current Implementation:** Option B is already complete via `indentationLevel` prop.

**User Clarification Response (from SPEC-003 lines 293-297):**
✅ "Indentation becomes the left column (that is otherwise empty)"  
✅ "Two-column structure: Indentation column (variable width) + Content column"

**Implication:** Need Option A - a physical column for indentation.

### 5. Current Expand/Collapse Behavior

**Question:** Should the new structure maintain expand/collapse functionality?

**Current behavior:**
- User Mode: Relationships can be collapsed/expanded
- Admin Mode: All relationships visible, no expansion UI

**Options:**
- Keep current expand/collapse per relationship type?
- Remove expand/collapse and show everything?
- Add expand/collapse per nested level?

---

## Technical Implementation Challenges

### Challenge 1: Title Row Entity Data

**Issue:** Title rows need to display the parent entity, but:
- RelatedEntities receives `entity` prop (the parent/current entity)
- Need to decide what "title row shows parent entity" means in context

**Possible Solutions:**
1. Display `entity` prop as title row at component top
2. Create pseudo-entity for relationship type labels
3. Skip title rows and rely on context

### Challenge 2: Recursive Nesting

**Current Implementation:**
- Nested RelatedEntities components render recursively
- Each nested component has `.related-entities__nested` margin-left

**New Implementation:**
- Need to flatten structure to single table
- Pass down `baseIndentationLevel` to nested renders
- Avoid recursive table nesting

**Approach:**
```typescript
function renderRelatedEntities(
  entity: Entity,
  relationships: RelationshipConfig[],
  baseIndentationLevel: number = 0
) {
  // Render content rows with indentation
  relationships.forEach(rel => {
    // Content row
    <EntityCard indentationLevel={baseIndentationLevel} />
    
    // Nested relationships
    if (hasNested) {
      renderRelatedEntities(
        nestedEntity,
        nestedRelationships,
        baseIndentationLevel + 1  // Increment
      );
    }
  });
}
```

### Challenge 3: Table Structure Migration

**Current:**
```jsx
<table>
  <tr>
    <td className="label-col">Fabrica:</td>
    <td className="data-col">
      <EntityCard variant="contents" />
    </td>
  </tr>
</table>
```

**Target:**
```jsx
<table>
  <tr>
    <td className="indent-col" style={{width: '0px'}}></td>
    <td className="content-col">
      <EntityCard variant="heading" indentationLevel={0} />
    </td>
  </tr>
  <tr>
    <td className="indent-col" style={{width: '16px'}}></td>
    <td className="content-col">
      <EntityCard variant="contents" indentationLevel={1} />
    </td>
  </tr>
</table>
```

### Challenge 4: Backward Compatibility

**Concern:** This is a breaking change to table structure.

**Affected Components:**
- `RelatedEntities.tsx` - core restructure
- `related-entities.css` - new column styles
- Any components using RelatedEntities (now integrated in main pages)

**Migration Path:**
- Could implement both structures with a prop flag?
- Or do breaking change with clear documentation?

---

## Proposed Implementation Plan

### Phase 1: Clarification (REQUIRED)
1. Get answers to clarification questions above
2. Create mockup/wireframe of target structure
3. Confirm expected behavior with examples

### Phase 2: Structure Update
1. Update RelatedEntities table structure:
   - Remove label column
   - Add indentation column (physical or padding-based per clarification)
   - Update content column structure

2. Add title row rendering:
   - Determine title row entity/content
   - Implement EntityCard with `variant="heading"`
   - Position correctly in table

### Phase 3: Nesting Logic
1. Flatten recursive structure:
   - Pass `baseIndentationLevel` through nesting
   - Increment level for each nesting depth
   - Render all rows in single table structure

2. Update nested rendering:
   - Remove `.related-entities__nested` wrapper
   - Apply indentation via `indentationLevel` prop
   - Maintain cycle prevention logic

### Phase 4: Styling
1. Update CSS:
   - Remove `.related-entities__label-col`
   - Add `.related-entities__indent-col` (if physical column)
   - Update `.related-entities__content-col`
   - Remove nested margin-left styles

2. Responsive adjustments:
   - Ensure indentation scales on narrow screens
   - Test layout with various nesting depths

### Phase 5: Testing
1. Unit tests for new structure
2. Integration tests with nested relationships
3. Visual regression testing
4. Accessibility testing

---

## Decision Document Template

After receiving clarifications, document decisions here:

### Decision 1: Title Row Content
**Decision:** [To be determined]  
**Rationale:** [To be documented]  
**Implementation:** [To be documented]

### Decision 2: Multiple Relationships
**Decision:** [To be determined]  
**Rationale:** [To be documented]  
**Implementation:** [To be documented]

### Decision 3: Nesting Display
**Decision:** [To be determined]  
**Rationale:** [To be documented]  
**Implementation:** [To be documented]

### Decision 4: Indentation Column
**Decision:** [To be determined]  
**Rationale:** [To be documented]  
**Implementation:** [To be documented]

### Decision 5: Expand/Collapse
**Decision:** [To be determined]  
**Rationale:** [To be documented]  
**Implementation:** [To be documented]

---

## Files to Modify

### Primary Changes
- `frontend/src/components/common/RelatedEntities.tsx` - Core restructure
- `frontend/src/styles/components/related-entities.css` - Layout updates

### Test Updates
- `frontend/src/components/__tests__/RelatedEntities.test.tsx` - If exists
- Integration tests for main entity pages

### Documentation
- Update component JSDoc
- Update usage examples
- Migration guide for breaking changes

---

## Risk Assessment

**High Risk:**
- Breaking change to core navigation component
- Complex nesting logic could introduce bugs
- Performance impact with deeply nested structures

**Medium Risk:**
- User confusion with new layout
- Accessibility concerns with table structure
- CSS layout issues on various screen sizes

**Mitigation:**
- Thorough testing before deployment
- Feature flag for gradual rollout
- User feedback collection
- Rollback plan ready

---

## Next Steps

1. **User Review:** Review this document and provide clarifications for questions 1-5
2. **Design Review:** Create visual mockup of target structure
3. **Technical Review:** Validate implementation approach
4. **Implementation:** Execute plan after approvals
5. **Testing:** Comprehensive test suite
6. **Documentation:** Update all relevant docs
7. **Deployment:** Staged rollout with monitoring

---

## References

- **Main Spec:** `docs/entity-navigation-feedback.md` - [SPEC-003] (lines 805-1051)
- **Original Observation:** [OBS-003] (lines 219-301)
- **Related Components:**
  - `frontend/src/components/common/EntityCard.tsx`
  - `frontend/src/components/common/RelatedEntities.tsx`
  - `frontend/src/styles/components/related-entities.css`

---

## Appendix: Current Clarifications from Spec

From SPEC-003 clarification responses (lines 269-297):

**Table Structure:**
- ✅ Each relationship type has its own title row (entity title) + content rows underneath
- ✅ The icon in each content row indicates the entity type of the related items
- ✅ Title row shows the parent entity information

**Indentation:**
- ✅ Should be a property of EntityCard component (DONE)
- ✅ Base unit: 16px per level (DONE)
- ✅ Consider adaptive variable for narrow screens (DONE)

**Title Row:**
- ✅ Title row shows the entity title (parent entity information)
- ✅ No indentation for title row

**Nested Structure:**
- ✅ Nested tables add content rows with increased indentation
- ✅ No new heading for nested structures

**Visual Layout:**
- ✅ Indentation becomes the left column (that is otherwise empty)
- ✅ Two-column structure: Indentation column (variable width) + Content column (entity cards)

**Key Ambiguity:** The relationship between "title row shows parent entity" and "each relationship type has its own title row" needs clarification.

