# Implementation Plan: TASK-001 - Refactor to Single SVG Structure

**Date**: 2025-11-28  
**Task ID**: TASK-001  
**Design System Area**: Components  
**Status**: Planning Complete - Ready for Implementation  
**Refactoring Plan Reference**: `filete-sign-refactoring-plan-2025-11-28.md`

## Task Overview

**Gap ID**: GAP-001, GAP-013  
**Priority**: P0 (Critical)  
**Effort Estimate**: Large (16-22 hours)

### Description

Refactor component from multiple SVG elements and CSS-based decorations to a single unified SVG structure matching the reference implementation.

## Implementation Checklist

### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Complete refactor of SVG structure
  - Remove multiple SVG elements (crest, bottom flourish)
  - Create single SVG with viewBox `0 0 1000 350`
  - Add `<defs>` section for reusable components
  - Implement basic structure (background board placeholder)
  - Maintain scroll detection wrapper

- `frontend/src/styles/components/filete-sign.css`: Remove frame-related styles
  - Remove `.filete-sign__crest` styles
  - Remove `.filete-sign__frame` styles (wooden texture, borders)
  - Remove `.filete-sign__border-decoration` styles
  - Remove `.filete-sign__bottom-flourish` styles
  - Keep container styles (`.filete-sign`, `.filete-sign__container`)

### Current State

- Multiple SVG elements (crest SVG, bottom flourish SVG)
- CSS-based frame with wooden texture
- Separate decorative elements using CSS gradients
- Component structure: `FileteSign.tsx:20-117`
- Scroll detection: Working via `useScrollDetection` hook

### Desired State

- Single SVG with viewBox `0 0 1000 350`
- All decorative elements as SVG components in `<defs>` (to be added in later tasks)
- Dark background board as SVG rect (basic structure)
- `preserveAspectRatio="xMidYMid meet"`
- Structure matching `filete.html:47-165`
- Scroll detection functionality preserved

## Detailed Implementation Steps

### Step 1: Create Basic SVG Structure

**File**: `frontend/src/components/composite/FileteSign.tsx`  
**Change**: Replace multiple SVG elements with single unified SVG  
**Validation**: Component renders without errors, basic SVG visible

**Actions**:
1. Remove crest SVG element (lines 27-85)
2. Remove bottom flourish SVG element (lines 100-113)
3. Remove frame div and side border decorations (lines 87-114)
4. Create single SVG element with:
   - `viewBox="0 0 1000 350"`
   - `preserveAspectRatio="xMidYMid meet"`
   - `xmlns="http://www.w3.org/2000/svg"`
5. Add empty `<defs>` section (for later tasks)
6. Add placeholder background board rect (basic structure)

**Code Structure**:
```tsx
<div className={`filete-sign ${className}`} style={{ opacity }}>
  <div className="filete-sign__container">
    <svg 
      viewBox="0 0 1000 350" 
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className="filete-sign__svg"
    >
      <defs>
        {/* Gradients and reusable components will be added in later tasks */}
      </defs>
      
      {/* Background board - basic structure */}
      <rect 
        x="10" 
        y="10" 
        width="980" 
        height="330" 
        rx="15" 
        fill="#1a1a1a" 
        stroke="#4a4a4a" 
        strokeWidth="2"
      />
      
      {/* Text content - temporary placeholder */}
      <text 
        x="500" 
        y="200" 
        fontFamily="var(--font-family-signage)"
        fontSize="60"
        fill="#FFF"
        textAnchor="middle"
      >
        {title}
      </text>
    </svg>
  </div>
</div>
```

---

### Step 2: Update CSS - Remove Frame Styles

**File**: `frontend/src/styles/components/filete-sign.css`  
**Change**: Remove frame-related styles, keep container styles  
**Validation**: No broken styles, container still works

**Actions**:
1. Remove `.filete-sign__crest` styles (lines 25-37)
2. Remove `.filete-sign__frame` styles (lines 40-63)
3. Remove `.filete-sign__border-decoration` styles (lines 66-113)
4. Remove `.filete-sign__bottom-flourish` styles (lines 240-255)
5. Remove CSS floral motif styles (lines 116-202)
6. Add basic SVG styling:
   ```css
   .filete-sign__svg {
     width: 100%;
     height: auto;
     display: block;
   }
   ```

---

### Step 3: Test Scroll Detection

**File**: `frontend/src/components/composite/FileteSign.tsx`  
**Change**: Verify scroll detection still works  
**Validation**: Scroll detection functional, opacity changes on scroll

**Actions**:
1. Verify `useScrollDetection` hook still works
2. Test that opacity style is applied correctly
3. Test scroll behavior in browser
4. Verify no console errors

---

### Step 4: Test Responsive Behavior

**File**: `frontend/src/components/composite/FileteSign.tsx`  
**Change**: Verify responsive behavior maintained  
**Validation**: SVG scales correctly on different screen sizes

**Actions**:
1. Test on desktop (full width)
2. Test on tablet (medium width)
3. Test on mobile (small width)
4. Verify `preserveAspectRatio` works correctly
5. Verify container max-width still applies

---

### Step 5: Visual Verification

**File**: All  
**Change**: Verify basic structure matches reference  
**Validation**: Basic structure visible, no visual regressions

**Actions**:
1. Compare with reference implementation (`filete.html`)
2. Verify background board visible
3. Verify text visible (temporary)
4. Check for any layout issues
5. Verify no broken elements

---

## Code Comments Template

Add design system references in code:

```tsx
{/* Design System: Filete Sign Component
 * Implements: Single SVG structure with viewBox 0 0 1000 350
 * Reference: docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md
 * Reference Implementation: docs/2_frontend_ui-design-system/05_visual-references/filete.html
 */}
```

## Testing Checklist

### Visual Testing
- [ ] SVG renders correctly
- [ ] Background board visible (dark color)
- [ ] Text visible (temporary placeholder)
- [ ] No broken elements
- [ ] Container styling works

### Functional Testing
- [ ] Scroll detection works
- [ ] Opacity changes on scroll
- [ ] No console errors
- [ ] Component renders without errors

### Responsive Testing
- [ ] Desktop: SVG scales correctly
- [ ] Tablet: SVG scales correctly
- [ ] Mobile: SVG scales correctly
- [ ] Aspect ratio maintained

### Code Quality
- [ ] Linter passes
- [ ] TypeScript compiles
- [ ] No unused imports
- [ ] Code follows project standards

## Documentation Sync Checklist

- [ ] Design system still accurate (structure only)
- [ ] Code references updated (if needed)
- [ ] Implementation matches design system (basic structure)
- [ ] Deviations documented (if any)

## Acceptance Criteria Status

- [ ] Single SVG element with viewBox `0 0 1000 350`
- [ ] `<defs>` section created (empty for now)
- [ ] Background board implemented as SVG rect (basic)
- [ ] Scroll detection functionality preserved
- [ ] Responsive behavior maintained
- [ ] No visual regressions in basic structure

## Next Steps After This Task

Once TASK-001 is complete:
1. TASK-002: Update Background Board and Borders (add gradients, borders)
2. TASK-003: Update Gradient Definitions (add gradients to `<defs>`)
3. TASK-004: Add Corner Scroll Ornaments (add to `<defs>` and place)
4. TASK-005: Add Central Flowers (add to `<defs>` and place)
5. TASK-006: Add Decorative Swirls (add paths)
6. TASK-007: Refactor Text Layout (three-line layout)

## Notes

- This task creates the foundation structure
- Decorative elements will be added in subsequent tasks
- Text is temporary placeholder - will be refactored in TASK-007
- Gradients will be added in TASK-003
- This is a breaking change to the component structure, but maintains scroll detection

