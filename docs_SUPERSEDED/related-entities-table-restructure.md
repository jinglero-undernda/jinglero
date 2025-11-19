# RelatedEntities Structure Restructure - Implementation Plan

**Status:** Ready for Implementation  
**Priority:** High  
**Date:** 2025-11-12  
**Based on:** [SPEC-003] from entity-navigation-feedback.md

---

## Overview

This document outlines the task to restructure the RelatedEntities component from a table-based layout to a **container-based hierarchical structure** with indentation-based content display.

**Key Decision:** After analysis, we determined that RelatedEntities is not actually tabular data but rather a **hierarchical tree navigation**. Therefore, a container/list structure is more appropriate than HTML tables.

**See:** `related-entities-structure-analysis.md` for detailed reasoning.

## Current Implementation

### Current Structure (Table-Based)

```html
<table className="related-entities__table">
  <tbody>
    <tr>
      <td className="label-col">Fabrica:</td>
      <td className="data-col">
        <EntityCard entity="{fabrica}" />
      </td>
    </tr>
    <!-- Nested relationships create new tables (invalid HTML) -->
    <tr>
      <td colspan="2">
        <div className="related-entities__nested">
          <RelatedEntities entity="{fabrica}" /> ← Nested table
        </div>
      </td>
    </tr>
  </tbody>
</table>
```

**Problems:**

- ❌ Creates nested `<table>` elements (invalid HTML)
- ❌ Semantic mismatch - not actually tabular data
- ❌ Complex CSS with table constraints
- ❌ Harder to make responsive

**File:** `frontend/src/components/common/RelatedEntities.tsx`

- Line 682: Label column renders plain `<td>` with text
- Line 780: Data column renders EntityCard with `variant="contents"`
- Nested relationships use recursive RelatedEntities components
- `.related-entities__nested` class applies margin-left

### Completed Related Work

✅ EntityCard supports `indentationLevel` prop (0-based, 16px per level)  
✅ EntityCard supports `heading` and `contents` variants  
✅ EntityCard supports `relationshipLabel` for context-dependent icons  
✅ CSS custom properties for responsive indentation

---

## Target Implementation (Container-Based)

### New Structure (Simple Container)

```html
<nav className="related-entities" aria-label="Related entities">
  <div className="related-entities__row">
    <EntityCard entity="{fabrica}" indentationLevel="{0}" variant="contents" />
  </div>
  <div className="related-entities__row">
    <EntityCard
      entity="{nestedJingle1}"
      indentationLevel="{1}"
      variant="contents"
    />
  </div>
  <div className="related-entities__row">
    <EntityCard
      entity="{nestedJingle2}"
      indentationLevel="{1}"
      variant="contents"
    />
  </div>
</nav>
```

**Visual Result (Same as Before):**

```
🏭 Fábrica 001           ← Level 0
  🎤 Nested Jingle 1     ← Level 1 (16px indent)
  🎤 Nested Jingle 2     ← Level 1 (16px indent)
🏭 Related Fabrica       ← Level 0
```

### Key Requirements

1. **Single Flat Container:**

   - All rows rendered as siblings in single container
   - No nested tables or recursive components
   - Use `<nav>` for semantic HTML

2. **Content Rows:**

   - Each row is a simple `<div>` wrapper
   - Contains EntityCard with `variant="contents"`
   - EntityCard handles its own indentation via `indentationLevel` prop
   - Icon indicates entity type

3. **Indentation via EntityCard:**

   - EntityCard already has `indentationLevel` prop ✅
   - Applies `padding-left: calc(var(--indent-base) * level)`
   - No separate indentation column needed

4. **Nested Relationships:**
   - Collect all rows (parent + nested) into flat array
   - When parent expanded, nested rows appear with increased indentation
   - Calculate: `indentationLevel = parentLevel + 1`
   - All rows remain in same container

---

## Critical Clarification Questions

### 1. Title Row Content - Which Entity?

**Current Spec Says:** "Title row shows the parent entity information"

**Example Scenario:**

```
Rendering RelatedEntities for Jingle "Test Jingle":
- Relationship type: "Fabrica"
- Related entities: [Fabrica A, Fabrica B]
```

**Option A:** Title row shows the **current entity** (Jingle):
This applies to the main table being rendered.

```
| 🎤 Test Jingle (heading)          |  ← Current entity being viewed
| 🏭 Fabrica A (contents)           |  ← Related entity
| 🏭 Fabrica B (contents)           |  ← Related entity
```

**Option B:** No title row, just content rows:
This applias to a nested table.

```
| 🏭 Fabrica A (contents)           |  ← Related entity
| 🏭 Fabrica B (contents)           |  ← Related entity
```

(to make the example more explicit)

```
| 🔧 Jinglero (heading)            |  ← Root table title row
| 🎤 Test Jingle (contents)          |  ← Current entity being expanded
|    | 🏭 Fabrica A (contents)           |  ← Related entity in nested table
|    | 🏭 Fabrica B (contents)           |  ← Related entity in nested table
```

**User Clarification Response (from SPEC-003 lines 271-276):**
✅ "Each relationship type has its own title row (entity title) + content rows underneath"  
✅ "Title row shows the entity title (parent entity information)"  
✅ "No indentation for title row"

**This means**:

- One title row at the top of the entire RelatedEntities component (showing the main entity)
- No title row for nested tables

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

### 4. Container vs Table Structure

**Question:** Does RelatedEntities need to be an HTML `<table>`, or would a container structure be better?

**User Decision:** ✅ Container structure is preferred

**Rationale:**

- RelatedEntities is actually a **hierarchical tree navigation**, not tabular data
- No column headers, no columnar relationships
- Container structure solves nested table problem
- Simpler implementation, better semantics

**Implementation:**

```html
<!-- Simple container approach -->
<nav className="related-entities">
  <div className="related-entities__row">
    <EntityCard indentationLevel="{0}" />
  </div>
  <div className="related-entities__row">
    <EntityCard indentationLevel="{1}" />
  </div>
</nav>
```

**Indentation:** Applied via EntityCard's `indentationLevel` prop (already implemented ✅)

### 5. Current Expand/Collapse Behavior

**Question:** Should the new structure maintain expand/collapse functionality?

**Current behavior:**

- User Mode: Relationships can be collapsed/expanded
- Admin Mode: All relationships visible, no expansion UI

**User Decision:** ✅ Keep expand/collapse functionality with flat table rendering

**Confirmed Behavior:**

- The "User mode" entity table progressively shows the entity information (such as the Fabrica associated to the Jingle) and allows the user to see other Jingles from that Fabrica
- Expand/collapse is needed to see nested information
- When the table is rendered, the table has the Heading row and the first level of nested information in collapsed state
- **Key clarification:** "Flat list with additional rows (with their relevant Indent prop inherited) triggered by the expand button"

**Implementation:**

- Keep expand/collapse per entity (not just per relationship type)
- When expanded, nested entities appear as additional rows in the same flat table
- Nested rows have increased `indentationLevel`
- All rows rendered in single table structure (no nested tables)

- The "Admin mode" entity table allows the amendment of the information associated to the entity, so it does not need to cascade into the nested tables.
- Therefore, the expand/collapse is not needed in Admin mode.

**Decision:**

- Keep expand/collapse in User mode.
- Do not show expand/collapse in Admin mode.

---

## Technical Implementation Challenges

### Challenge 1: Title Row Entity Data

**Issue:** Title rows need to display the parent entity, but:

- RelatedEntities receives `entity` prop (the parent/current entity)
- Need to decide what "title row shows parent entity" means in context

**Solution:**

1. Display `entity` prop as title row at component top

### Challenge 2: Recursive Nesting

**Current Implementation:**

- Nested RelatedEntities components render recursively
- Each nested component creates a new `<table>` element (invalid HTML)
- Each nested component has `.related-entities__nested` margin-left

**Target Implementation (USER CONFIRMED):**

- Single flat table with all rows
- Keep expand/collapse UX functionality
- When expanded, nested entities appear as additional rows with increased `indentationLevel`
- All rows in same table structure - no nested tables

**User Decision:** ✅ "Flat list with additional rows (with their relevant Indent prop inherited) triggered by the expand button"

**Visual Example:**

```
Before expand:
┌─────────────────────────────────────┐
│ Fabrica A [▼]                       │ ← Level 0, collapsed
│ Fabrica B [▼]                       │ ← Level 0, collapsed
└─────────────────────────────────────┘

After expanding Fabrica A:
┌─────────────────────────────────────┐
│ Fabrica A [▲]                       │ ← Level 0, expanded
│   Nested Jingle 1                   │ ← Level 1, visible when parent expanded
│   Nested Jingle 2                   │ ← Level 1, visible when parent expanded
│ Fabrica B [▼]                       │ ← Level 0, collapsed
└─────────────────────────────────────┘
```

**Implementation Approach:**

```typescript
// State tracks which entities are expanded
const [expandedEntities, setExpandedEntities] = useState<Set<string>>(
  new Set()
);

function renderEntityRows(
  entity: Entity,
  relationships: RelationshipConfig[],
  indentLevel: number = 0
): JSX.Element[] {
  const rows: JSX.Element[] = [];

  relationships.forEach((rel) => {
    rel.entities.forEach((relatedEntity) => {
      const isExpanded = expandedEntities.has(relatedEntity.id);
      const hasNested = rel.expandable && hasNestedRelationships(relatedEntity);

      // Add parent row
      rows.push(
        <tr key={relatedEntity.id}>
          <td>
            <EntityCard
              entity={relatedEntity}
              entityType={rel.entityType}
              indentationLevel={indentLevel}
              hasNestedEntities={hasNested}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleExpand(relatedEntity.id)}
            />
          </td>
        </tr>
      );

      // If expanded, add nested rows (recursively)
      if (isExpanded && hasNested) {
        const nestedRows = renderEntityRows(
          relatedEntity,
          getRelationshipsForEntityType(rel.entityType),
          indentLevel + 1 // ✅ Increment indent for nested
        );
        rows.push(...nestedRows); // ✅ Flatten into same array
      }
    });
  });

  return rows;
}

// Render single table
return (
  <table>
    <tbody>{renderEntityRows(entity, relationships, 0)}</tbody>
  </table>
);
```

**Key Points:**

1. Single `<table>` element containing all rows
2. Nested rows rendered conditionally based on expanded state
3. `indentationLevel` increments for each nesting level
4. Expand/collapse toggles visibility of nested rows
5. All rows are siblings in the same `<tbody>`

### Challenge 3: Structure Migration (SIMPLIFIED!)

**Current (Table-based):**

```jsx
<table>
  <tr>
    <td className="label-col">Fabrica:</td>
    <td className="data-col">
      <EntityCard variant="contents" />
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <div className="related-entities__nested">
        <RelatedEntities entity={fabrica} /> ← Nested table
      </div>
    </td>
  </tr>
</table>
```

**Target (Container-based - Much Simpler!):**

```jsx
<nav className="related-entities">
  {allRows.map((row) => (
    <div key={row.id} className="related-entities__row">
      <EntityCard
        entity={row.entity}
        entityType={row.entityType}
        variant="contents"
        indentationLevel={row.indentLevel}
        relationshipLabel={row.relationshipLabel}
        hasNestedEntities={row.hasNested}
        isExpanded={row.isExpanded}
        onToggleExpand={row.onToggle}
      />
    </div>
  ))}
</nav>
```

**Key Simplifications:**

- ✅ No table elements at all
- ✅ No nested components
- ✅ Just map flat array to divs
- ✅ EntityCard handles everything

### Challenge 4: Backward Compatibility (MINIMAL IMPACT)

**Impact:** Breaking change to internal structure, but external API stays mostly same

**Affected Components:**

- `RelatedEntities.tsx` - core restructure (internal only)
- `related-entities.css` - simplified styles
- Main entity pages - already using RelatedEntities correctly ✅

**Migration Path:**

- Internal restructure only
- External props remain compatible
- Simpler CSS (remove table styles)
- Better semantic HTML
- No component API changes needed

---

## Implementation Plan (SIMPLIFIED!)

### Phase 1: Structure Update ✅ (Decisions Made)

**Status:** Complete - Container-based approach confirmed

**Decisions:**

- ✅ Use container structure instead of tables
- ✅ Keep expand/collapse with flat rendering
- ✅ Use semantic `<nav>` wrapper
- ✅ EntityCard handles indentation (already done)

### Phase 2: Update RelatedEntities Component

**File:** `frontend/src/components/common/RelatedEntities.tsx`

1. **Replace table with container:**

   ```tsx
   // Old: <table><tbody>...</tbody></table>
   // New: <nav className="related-entities">...</nav>
   ```

2. **Flatten row rendering:**

   ```tsx
   function collectAllRows(
     entity: Entity,
     relationships: RelationshipConfig[],
     indentLevel: number = 0
   ): RowData[] {
     const rows: RowData[] = [];

     relationships.forEach((rel) => {
       rel.entities.forEach((relatedEntity) => {
         const isExpanded = expandedEntities.has(relatedEntity.id);

         // Add parent row
         rows.push({
           id: relatedEntity.id,
           entity: relatedEntity,
           entityType: rel.entityType,
           indentLevel: indentLevel,
           relationshipLabel: rel.label,
           hasNested: rel.expandable,
           isExpanded: isExpanded,
         });

         // If expanded, add nested rows
         if (isExpanded && rel.expandable) {
           const nestedRows = collectAllRows(
             relatedEntity,
             getRelationshipsForEntityType(rel.entityType),
             indentLevel + 1 // Increment indent
           );
           rows.push(...nestedRows);
         }
       });
     });

     return rows;
   }
   ```

3. **Render flat structure:**

   ```tsx
   const allRows = collectAllRows(entity, relationships, 0);

   return (
     <nav className="related-entities" aria-label="Related entities">
       {allRows.map((row) => (
         <div key={row.id} className="related-entities__row">
           <EntityCard
             entity={row.entity}
             entityType={row.entityType}
             variant="contents"
             indentationLevel={row.indentLevel}
             relationshipLabel={row.relationshipLabel}
             hasNestedEntities={row.hasNested}
             isExpanded={row.isExpanded}
             onToggleExpand={() => toggleExpand(row.id)}
           />
         </div>
       ))}
     </nav>
   );
   ```

### Phase 3: Update CSS

**File:** `frontend/src/styles/components/related-entities.css`

1. **Remove table styles:**

   - Remove `.related-entities__table`
   - Remove `.related-entities__label-col`
   - Remove `.related-entities__data-col`
   - Remove table-specific properties

2. **Add simple container styles:**

   ```css
   .related-entities {
     display: flex;
     flex-direction: column;
     gap: 4px;
   }

   .related-entities__row {
     /* EntityCard handles its own styling */
   }
   ```

3. **Remove nested margin:**
   - Remove `.related-entities__nested` class and margin-left
   - Indentation now handled by EntityCard

### Phase 4: Testing

1. Test expand/collapse functionality
2. Test nested relationships (2-3 levels deep)
3. Test indentation at various levels
4. Test responsive behavior
5. Test accessibility with screen readers
6. Visual regression testing

### Phase 5: Cleanup

1. Remove unused CSS classes
2. Update component documentation
3. Update JSDoc comments
4. Verify no broken references

---

## Decision Summary

### Decision 1: Container vs Table

**Decision:** ✅ Use container structure (`<nav>` with `<div>` rows)  
**Rationale:** RelatedEntities is a hierarchical navigation tree, not tabular data. Container structure solves nested table problem and provides better semantics.

### Decision 2: Indentation

**Decision:** ✅ Use EntityCard's `indentationLevel` prop (already implemented)  
**Rationale:** No need for separate indentation column. EntityCard already has this feature working.

### Decision 3: Expand/Collapse

**Decision:** ✅ Keep expand/collapse, render nested rows in flat list  
**Rationale:** Maintains current UX while fixing HTML structure. User confirmed: "Flat list with additional rows (with their relevant Indent prop inherited) triggered by the expand button"  
**Implementation:**

- Track expanded entities in state
- Recursively collect all rows (parent + nested) into flat array
- Conditionally render nested rows based on parent's expanded state
- Increment `indentationLevel` for each nesting depth
- All rows are siblings in same container

---

## Files to Modify

### Primary Changes

- `frontend/src/components/common/RelatedEntities.tsx` - Replace table with container structure
- `frontend/src/styles/components/related-entities.css` - Simplify styles (remove table CSS)

### No Changes Needed (Already Complete!) ✅

- `frontend/src/components/common/EntityCard.tsx` - Has `indentationLevel` prop
- `frontend/src/pages/inspect/*` - Already using RelatedEntities correctly
- Main entity pages - Already integrated

### Test Updates

- `frontend/src/components/__tests__/RelatedEntities.test.tsx` - Update for container structure
- Integration tests for main entity pages - Should still pass

### Documentation

- Update component JSDoc
- Update usage examples
- Add comments explaining flat rendering

---

## Risk Assessment

**Low Risk (Greatly Reduced!):**

- ✅ Simpler implementation than table approach
- ✅ Internal change only - no API changes
- ✅ EntityCard already handles complexity
- ✅ Better semantic HTML reduces bugs

**Minimal Risks:**

- Visual regression (mitigated by testing)
- CSS adjustments needed (much simpler than table CSS)
- Existing expand/collapse logic needs adaptation

**Mitigation:**

- Thorough testing (easier to test than tables)
- Visual comparison before/after
- Incremental implementation
- Quick rollback if needed (simpler code)

---

## Next Steps (Ready to Implement!)

1. ✅ **User Review:** Complete - Container approach confirmed
2. ✅ **Design Review:** Not needed - visual output identical
3. ✅ **Technical Review:** Complete - Simpler than table approach
4. **Implementation:** Ready to execute
5. **Testing:** Standard component testing
6. **Documentation:** Update JSDoc and examples
7. **Deployment:** Low risk, can deploy with confidence

## Summary of Simplifications

**Original Plan:** Complex table restructure with:

- Nested table problems
- Complex column management
- Multiple clarification questions
- High implementation risk

**New Plan:** Simple container structure with:

- ✅ No nested structure issues
- ✅ EntityCard already handles everything
- ✅ Clearer semantics
- ✅ Much simpler implementation
- ✅ Lower risk
- ✅ Better maintainability

**Result:** Same visual output, much better code!

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
