# Related Entities Structure Analysis: Table vs Container

**Date:** 2025-11-12  
**Question:** Does RelatedEntities need to be an HTML `<table>`, or would a simple container structure be better?

---

## The Fundamental Question

**User Insight:** "I have been using the 'Table' expression because of the visual impact - but if this is limiting the ability to manipulate the components I am open to reconsidering it."

---

## Current Structure (Table-Based)

### HTML Structure

```html
<table className="related-entities__table">
  <tbody>
    <tr className="related-entities__row">
      <td className="related-entities__label-col">Fabrica:</td>
      <td className="related-entities__data-col">
        <EntityCard entity="{fabrica}" />
      </td>
    </tr>
    <!-- More rows... -->
  </tbody>
</table>
```

### Problems with Table Structure

1. **Nested Tables Issue** ⚠️

   - Current implementation creates nested `<table>` elements (invalid HTML)
   - This is the core problem we're trying to solve

2. **Semantic Mismatch** ⚠️

   - Tables are for **tabular data** (rows × columns with relationships)
   - Related entities are actually a **hierarchical tree** (parent → children)
   - Not truly tabular - it's a list with nesting

3. **Layout Limitations** ⚠️

   - Table cells have constraints on flex/grid usage
   - Harder to make responsive
   - Column width management can be tricky

4. **CSS Complexity** ⚠️

   - `display: table` has specific rules
   - Harder to override for custom layouts
   - More verbose CSS needed

5. **Accessibility Concerns** ⚠️
   - Screen readers announce it as a table
   - Users expect column headers and data relationships
   - But we don't have traditional table structure

---

## Alternative: Container-Based Structure

### Recommended HTML Structure

```html
<div className="related-entities">
  <div className="related-entities__row">
    <EntityCard entity="{fabrica}" variant="contents" indentationLevel="{0}" />
  </div>

  <div className="related-entities__row">
    <EntityCard
      entity="{nestedJingle}"
      variant="contents"
      indentationLevel="{1}"
    />
  </div>

  <div className="related-entities__row">
    <EntityCard
      entity="{anotherFabrica}"
      variant="contents"
      indentationLevel="{0}"
    />
  </div>
</div>
```

### Or Even Better: Semantic List Structure

```html
<nav className="related-entities" aria-label="Related entities">
  <ul className="related-entities__list">
    <li className="related-entities__item">
      <EntityCard
        entity="{fabrica}"
        variant="contents"
        indentationLevel="{0}"
      />
    </li>

    <li className="related-entities__item related-entities__item--nested">
      <EntityCard
        entity="{nestedJingle}"
        variant="contents"
        indentationLevel="{1}"
      />
    </li>

    <li className="related-entities__item">
      <EntityCard
        entity="{anotherFabrica}"
        variant="contents"
        indentationLevel="{0}"
      />
    </li>
  </ul>
</nav>
```

---

## Advantages of Container/List Structure

### 1. **Semantic Correctness** ✅

- Hierarchical tree is better represented as a list or nav structure
- `<ul>` / `<li>` naturally represents parent-child relationships
- Screen readers understand nested lists
- No false "table" announcement

### 2. **No Nested Structure Issues** ✅

- Divs/lists can nest naturally
- No HTML validation errors
- Already solved the problem we're facing

### 3. **Simpler Implementation** ✅

```typescript
// Super simple - just map to divs
return (
  <div className="related-entities">
    {allRows.map((row) => (
      <div key={row.id} className="related-entities__row">
        <EntityCard
          entity={row.entity}
          indentationLevel={row.indentLevel}
          variant="contents"
        />
      </div>
    ))}
  </div>
);
```

### 4. **Modern CSS Friendly** ✅

- Easy to use flexbox or grid
- Natural responsive behavior
- Simpler styling overall

### 5. **Indentation Just Works** ✅

```css
.related-entities__row {
  /* EntityCard handles its own indentation via padding-left */
  /* No table cell complications */
}
```

### 6. **Better Expand/Collapse** ✅

```typescript
// Nested rows are just hidden/shown - same structure
<div
  className="related-entities__row"
  style={{ display: isExpanded ? "block" : "none" }}
>
  <EntityCard indentationLevel={1} />
</div>
```

### 7. **Accessibility** ✅

```html
<nav aria-label="Related entities navigation">
  <ul role="tree">
    <li role="treeitem" aria-expanded="false">
      <EntityCard />
    </li>
  </ul>
</nav>
```

---

## What We Actually Have

Let's analyze what RelatedEntities really is:

### It's NOT a Table Because:

- ❌ No column headers
- ❌ No columnar data relationships
- ❌ Can't sort by columns
- ❌ No cell-to-cell dependencies
- ❌ Not comparing data across rows

### It IS a Hierarchical Navigation Because:

- ✅ Parent-child relationships
- ✅ Expandable/collapsible nodes
- ✅ Tree-like structure
- ✅ Navigation to different entities
- ✅ Progressive disclosure of information

**Conclusion:** This is a **tree navigation component**, not a data table.

---

## Recommended Structure

### Option 1: Simple Div Container (Easiest)

```tsx
<div className="related-entities">
  {renderAllRows().map((row) => (
    <div key={row.id} className="related-entities__row">
      <EntityCard
        entity={row.entity}
        entityType={row.entityType}
        variant="contents"
        indentationLevel={row.indentLevel}
        hasNestedEntities={row.hasNested}
        isExpanded={row.isExpanded}
        onToggleExpand={row.onToggle}
        relationshipLabel={row.relationshipLabel}
      />
    </div>
  ))}
</div>
```

**CSS:**

```css
.related-entities {
  display: flex;
  flex-direction: column;
  gap: 4px; /* Space between rows */
}

.related-entities__row {
  /* EntityCard handles its own styling */
}
```

### Option 2: Semantic List (Better Accessibility)

```tsx
<nav className="related-entities" aria-label="Related entities">
  <ul className="related-entities__list" role="tree">
    {renderAllRows().map((row) => (
      <li
        key={row.id}
        className="related-entities__item"
        role="treeitem"
        aria-expanded={row.hasNested ? row.isExpanded : undefined}
      >
        <EntityCard
          entity={row.entity}
          entityType={row.entityType}
          variant="contents"
          indentationLevel={row.indentLevel}
          hasNestedEntities={row.hasNested}
          isExpanded={row.isExpanded}
          onToggleExpand={row.onToggle}
          relationshipLabel={row.relationshipLabel}
        />
      </li>
    ))}
  </ul>
</nav>
```

**CSS:**

```css
.related-entities__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.related-entities__item {
  /* EntityCard handles its own styling */
}
```

---

## Migration Path

### Current State

```
RelatedEntities renders:
  <table>
    <tr><td>Label</td><td><EntityCard /></td></tr>
    <tr><td colspan="2"><nested RelatedEntities /></td></tr>
  </table>
```

### Target State (Recommended)

```
RelatedEntities renders:
  <div> (or <nav><ul>)
    <div><EntityCard indentationLevel={0} /></div>
    <div><EntityCard indentationLevel={1} /></div>  ← Nested when expanded
    <div><EntityCard indentationLevel={0} /></div>
  </div>
```

### Changes Needed

1. **RelatedEntities.tsx**

   - Replace `<table>` with `<div>` or `<nav><ul>`
   - Replace `<tr>` with `<div>` or `<li>`
   - Remove `<td>` elements entirely
   - Flatten rendering logic (already planned)

2. **related-entities.css**

   - Remove table-specific CSS
   - Add flex/grid layout if needed
   - Simpler, cleaner styles

3. **EntityCard** (Already Done! ✅)
   - Already has `indentationLevel` prop
   - Already handles its own padding
   - Already has proper styling
   - No changes needed!

---

## Comparison Summary

| Aspect                    | Table Structure                  | Container Structure                  |
| ------------------------- | -------------------------------- | ------------------------------------ |
| Semantic Correctness      | ❌ Mismatched (not tabular)      | ✅ Matches intent (hierarchical nav) |
| HTML Validity             | ⚠️ Nested tables invalid         | ✅ Divs/lists nest naturally         |
| Implementation Complexity | ⚠️ Complex (table constraints)   | ✅ Simple (just divs)                |
| CSS Simplicity            | ⚠️ Table-specific rules          | ✅ Standard flex/grid                |
| Responsive Design         | ⚠️ Tables resist responsive      | ✅ Easy to adapt                     |
| Accessibility             | ⚠️ Misleading to screen readers  | ✅ Proper tree/nav ARIA              |
| Indentation               | ⚠️ Via EntityCard (already done) | ✅ Via EntityCard (already done)     |
| Expand/Collapse           | ⚠️ Hide/show table rows          | ✅ Hide/show divs                    |
| Future Flexibility        | ⚠️ Limited by table rules        | ✅ Highly flexible                   |
| Code Maintenance          | ⚠️ More complex                  | ✅ Simpler                           |

---

## Recommendation

### ✅ Switch to Container-Based Structure

**Reasoning:**

1. **Solves the core problem** - No more nested table issues
2. **Semantically correct** - It's a hierarchical navigation, not a table
3. **Simpler implementation** - Less code, fewer constraints
4. **Better accessibility** - Proper ARIA roles for tree navigation
5. **More maintainable** - Standard CSS, no table quirks
6. **Future-proof** - Flexible for future enhancements
7. **Already 80% done** - EntityCard has everything we need

**Best Option:** Use **semantic list structure** (`<nav><ul>`) for proper accessibility

---

## Implementation Impact

### What Changes

- ✅ RelatedEntities.tsx: Replace table with div/list structure
- ✅ related-entities.css: Simplify styles (remove table CSS)
- ✅ Rendering logic: Already planned flat structure

### What Stays the Same

- ✅ EntityCard component (no changes needed!)
- ✅ Indentation system (already implemented)
- ✅ Expand/collapse logic (just toggles visibility)
- ✅ Variant system (heading/contents)
- ✅ Icons and field mapping (all done)
- ✅ Main entity pages integration (all done)

### Benefits

- Simpler, cleaner code
- Better semantic HTML
- Improved accessibility
- Easier maintenance
- More flexible for future changes

---

## Conclusion

**The "table" metaphor served well for planning, but the actual implementation should use a container/list structure.**

This is actually **easier to implement** than the table restructure and gives us all the benefits we want:

- Single flat structure ✅
- Proper indentation ✅
- Expand/collapse UX ✅
- No nesting problems ✅
- Cleaner code ✅

**Recommendation: Proceed with div/list-based structure instead of table restructure.**
