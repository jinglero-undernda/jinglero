# Refactoring Plan: Filete Sign Component

**Date Created**: 2025-11-28  
**Planner**: AI Assistant  
**Target Completion**: TBD (based on stakeholder approval)  
**Gap Analysis Reference**: `filete-sign-gap-analysis-2025-11-28.md`  
**Component**: Filete Sign  
**Design System Version**: 2.0

## Overview

- **Total Tasks**: 10
- **Estimated Effort**: ~40-60 hours (Large)
- **Priority Breakdown**:
  - P0: 5 tasks (Critical - ~32-48 hours)
  - P1: 4 tasks (High - ~8-12 hours)
  - P2: 1 task (Medium - ~2-4 hours)

**Goal**: Refactor Filete Sign component to match documented design system based on SVG reference implementation (`filete.html`).

## Gap Groups

### Group 1: Core SVG Structure (Gaps 1, 2, 3, 13)

- Gap 1: SVG Structure Mismatch
- Gap 2: Background Board Color and Style
- Gap 3: Border Frame Implementation
- Gap 13: ViewBox and Aspect Ratio Mismatch

### Group 2: Design Tokens (Gap 4)

- Gap 4: Gradient Definitions Mismatch

### Group 3: Decorative Elements (Gaps 5, 6, 7, 14)

- Gap 5: Missing Corner Scroll Ornaments
- Gap 6: Missing Central Flowers
- Gap 7: Missing Decorative Swirls
- Gap 14: Extra Decorative Elements Not in Spec

### Group 4: Text Layout and Typography (Gaps 8, 9, 11, 12)

- Gap 8: Text Layout Mismatch
- Gap 9: Typography Font Mismatch
- Gap 11: Text Content Mismatch
- Gap 12: Missing Text Colors and Styling

### Group 5: Text Effects (Gap 10)

- Gap 10: Text Shadow Filter Missing

### Group 6: Container Structure (Gap 15)

- Gap 15: Container Structure Mismatch

---

## Phase 1: Critical Fixes (P0)

**Goal**: Fix critical gaps that break visual consistency and core design intent

**Timeline**: Estimated 32-48 hours

### Task 1: Refactor to Single SVG Structure

**Gap ID**: GAP-001, GAP-013  
**Priority**: P0  
**Design System Area**: Components

#### Description

Refactor component from multiple SVG elements and CSS-based decorations to a single unified SVG structure matching the reference implementation.

#### Scope

**In Scope:**

- Replace multiple SVG elements with single SVG
- Implement viewBox `0 0 1000 350`
- Move all decorative elements to `<defs>` as reusable components
- Remove CSS-based frame decorations
- Maintain scroll detection functionality

**Out of Scope:**

- Changing scroll behavior
- Changing component props interface (for now)
- Responsive behavior (maintain current)

**Deferred:**

- Component API changes (props interface)
- Additional responsive optimizations

#### Current State

- Multiple SVG elements (crest SVG, bottom flourish SVG)
- CSS-based frame with wooden texture
- Separate decorative elements using CSS gradients
- Component structure: `FileteSign.tsx:20-117`

#### Desired State

- Single SVG with viewBox `0 0 1000 350`
- All decorative elements as SVG components in `<defs>`
- Dark background board as SVG rect
- `preserveAspectRatio="xMidYMid meet"`
- Structure matching `filete.html:47-165`

#### Implementation Steps

1. Create new SVG structure in component
2. Define `<defs>` section for reusable components
3. Implement background board as SVG rect
4. Remove CSS-based frame decorations
5. Remove separate crest and flourish SVGs
6. Test scroll detection still works
7. Verify responsive behavior

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Complete refactor of SVG structure
- `frontend/src/styles/components/filete-sign.css`: Remove frame-related styles, keep container styles

#### Dependencies

- **Blocks**: Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8
- **Blocked by**: None
- **Can run parallel with**: None

#### Risks

**Technical Risks:**

- **Risk**: Breaking scroll detection functionality

  - **Probability**: Medium
  - **Impact**: High
  - **Mitigation**: Test scroll detection after each step, maintain wrapper div structure

- **Risk**: Performance degradation with large SVG
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Use reusable components in `<defs>`, optimize SVG paths

**Visual Risks:**

- **Risk**: Temporary visual regression during refactoring
  - **Probability**: High
  - **Impact**: Medium
  - **Mitigation**: Work in feature branch, test visually at each step

**Timeline Risks:**

- **Risk**: Taking longer than estimated due to complexity
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Break into smaller sub-tasks, validate against reference frequently

#### Acceptance Criteria

- [ ] Single SVG element with viewBox `0 0 1000 350`
- [ ] All decorative elements defined in `<defs>`
- [ ] Background board implemented as SVG rect
- [ ] Scroll detection functionality preserved
- [ ] Responsive behavior maintained
- [ ] No visual regressions in basic structure

#### Validation

- [ ] Code matches reference implementation structure
- [ ] Visual appearance matches reference (basic structure)
- [ ] Manual testing completed (scroll, responsive)
- [ ] Design system validated (structure only)

#### Effort Estimate

**Breakdown:**

- Code changes: 12-16 hours
- Testing: 2-3 hours
- Documentation: 1 hour
- Review: 1-2 hours

**Total**: 16-22 hours (Large)

**Confidence**: Medium (complex refactoring, some uncertainty about integration)

---

### Task 2: Update Background Board and Borders

**Gap ID**: GAP-002, GAP-003  
**Priority**: P0  
**Design System Area**: Components / Design Tokens

#### Description

Replace wooden texture background with dark background board and implement gold gradient borders with red accent.

#### Scope

**In Scope:**

- Replace CSS wooden texture with SVG dark background board
- Implement gold gradient outer border
- Implement red accent inner border
- Remove CSS border styles

**Out of Scope:**

- Changing container structure
- Changing padding/spacing

#### Current State

- CSS wooden texture: `repeating-linear-gradient` with cream/beige colors
- CSS solid blue border: `border: 10px solid var(--color-peronist-blue)`
- Code: `filete-sign.css:41-53`

#### Desired State

- SVG background board: `#1a1a1a`, dimensions 980x330, rx="15", stroke `#4a4a4a`
- SVG outer border: Gold gradient, 950x300, rx="10", stroke-width: 3
- SVG inner border: `#e03131`, 936x286, rx="5", stroke-width: 1.5
- Matching `filete.html:102, 105-106`

#### Implementation Steps

1. Implement background board SVG rect
2. Define gold gradient in `<defs>`
3. Implement outer border rect with gold gradient
4. Implement inner border rect with red color
5. Remove CSS wooden texture styles
6. Remove CSS border styles
7. Test visual appearance

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Add SVG rects for background and borders
- `frontend/src/styles/components/filete-sign.css`: Remove frame background and border styles

#### Dependencies

- **Blocks**: Task 4, Task 5, Task 6
- **Blocked by**: Task 1
- **Can run parallel with**: None

#### Risks

**Technical Risks:**

- **Risk**: Gradient not rendering correctly
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Test gradient definition, verify color values match reference

**Visual Risks:**

- **Risk**: Colors not matching reference exactly
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Compare colors side-by-side with reference, use exact hex values

#### Acceptance Criteria

- [ ] Background board: `#1a1a1a`, dimensions 980x330, rx="15"
- [ ] Outer border: Gold gradient, 950x300, rx="10", stroke-width: 3
- [ ] Inner border: `#e03131`, 936x286, rx="5", stroke-width: 1.5
- [ ] CSS wooden texture removed
- [ ] CSS border styles removed
- [ ] Visual appearance matches reference

#### Validation

- [ ] Code matches reference implementation
- [ ] Visual appearance verified against reference
- [ ] Colors match exactly
- [ ] Dimensions match exactly

#### Effort Estimate

**Breakdown:**

- Code changes: 3-4 hours
- Testing: 1 hour
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 5-6 hours (Medium)

**Confidence**: High (straightforward implementation)

---

### Task 3: Update Gradient Definitions

**Gap ID**: GAP-004  
**Priority**: P0  
**Design System Area**: Design Tokens

#### Description

Replace current gradient definitions with documented gold, flower, and leaf gradients matching the reference implementation.

#### Scope

**In Scope:**

- Replace gradient definitions in `<defs>`
- Update all gradient references
- Remove unused gradients

**Out of Scope:**

- Changing gradient usage locations (handled in other tasks)

#### Current State

- Gradients: `filete-red`, `filete-orange`, `filete-yellow`, `filete-green`, `filete-blue`
- Colors: `#ff0000`, `#ff6b35`, `#ffe66d`, `#ffd700`, `#4ade80`, `#22c55e`, `#4ecdc4`, `#1e3a8a`
- Code: `FileteSign.tsx:31-50`

#### Desired State

- **Gold Gradient** (`goldGrad`): `#FFF5C3` → `#FFD700` → `#DAA520` (0%, 30%, 100%)
- **Flower Gradient** (`flowerGrad`): `#ff6b6b` → `#c92a2a` (vertical)
- **Leaf Gradient** (`leafGrad`): `#63e6be` → `#0ca678` (horizontal)
- Matching `filete.html:51-65`

#### Implementation Steps

1. Remove old gradient definitions
2. Add gold gradient definition
3. Add flower gradient definition
4. Add leaf gradient definition
5. Update gradient references in decorative elements (in other tasks)

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Update gradient definitions in `<defs>`

#### Dependencies

- **Blocks**: Task 5, Task 6, Task 8
- **Blocked by**: Task 1
- **Can run parallel with**: Task 2

#### Risks

**Technical Risks:**

- **Risk**: Gradient stop positions incorrect
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Copy exact values from reference, verify visually

#### Acceptance Criteria

- [ ] Gold gradient: `#FFF5C3` → `#FFD700` → `#DAA520` (0%, 30%, 100%)
- [ ] Flower gradient: `#ff6b6b` → `#c92a2a` (vertical)
- [ ] Leaf gradient: `#63e6be` → `#0ca678` (horizontal)
- [ ] Old gradients removed
- [ ] Gradient IDs match reference

#### Validation

- [ ] Gradient definitions match reference exactly
- [ ] Color values verified
- [ ] Stop positions verified

#### Effort Estimate

**Breakdown:**

- Code changes: 1 hour
- Testing: 0.5 hours
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 2.5-3 hours (Small)

**Confidence**: High (straightforward)

---

### Task 4: Add Corner Scroll Ornaments

**Gap ID**: GAP-005  
**Priority**: P0  
**Design System Area**: Components

#### Description

Add 4 corner scroll ornaments as reusable SVG components, replacing CSS-based floral motifs.

#### Scope

**In Scope:**

- Create reusable corner scroll component in `<defs>`
- Place at all 4 corners with appropriate transforms
- Use gold gradient, leaf gradient, and flower gradient
- Remove CSS-based floral motifs

**Out of Scope:**

- Changing corner positions (use reference positions)

#### Current State

- CSS-based floral motifs using `::before` and `::after`
- Radial gradients at top-left and top-right only
- Code: `filete-sign.css:116-202`

#### Desired State

- Reusable component `cornerScroll` in `<defs>`
- Gold gradient spiral, green leaf accents, white volute, red decorative ball
- Placed at all 4 corners: scale 1.5x, mirrored/rotated
- Matching `filete.html:74-88, 110-116`

#### Implementation Steps

1. Create corner scroll component in `<defs>`
2. Implement main spiral with gold gradient
3. Add acanthus leaves with leaf gradient
4. Add inner volute with white stroke
5. Add decorative ball with flower gradient
6. Place at top-left corner
7. Place at top-right corner (mirrored X)
8. Place at bottom-left corner (mirrored Y)
9. Place at bottom-right corner (mirrored X & Y)
10. Remove CSS floral motifs

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Add corner scroll component and placements
- `frontend/src/styles/components/filete-sign.css`: Remove CSS floral motif styles

#### Dependencies

- **Blocks**: None
- **Blocked by**: Task 1, Task 3
- **Can run parallel with**: Task 5, Task 6

#### Risks

**Technical Risks:**

- **Risk**: Transform calculations incorrect
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Test each corner placement, compare with reference visually

**Visual Risks:**

- **Risk**: Ornaments not matching reference appearance
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Compare side-by-side with reference, adjust paths if needed

#### Acceptance Criteria

- [ ] Corner scroll component defined in `<defs>`
- [ ] All 4 corners have ornaments
- [ ] Transforms correct (scale 1.5x, appropriate mirroring)
- [ ] Visual appearance matches reference
- [ ] CSS floral motifs removed

#### Validation

- [ ] Component structure matches reference
- [ ] Visual appearance verified
- [ ] All 4 corners have ornaments
- [ ] Transforms correct

#### Effort Estimate

**Breakdown:**

- Code changes: 4-5 hours
- Testing: 1-2 hours
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 6-8 hours (Medium)

**Confidence**: Medium (complex SVG paths, transforms)

---

### Task 5: Add Central Flowers

**Gap ID**: GAP-006  
**Priority**: P0  
**Design System Area**: Components

#### Description

Add 2 central flowers (5-petal flowers) as side accents, replacing CSS-based side border decorations.

#### Scope

**In Scope:**

- Create reusable flower component in `<defs>`
- Place at left and right sides
- Use flower gradient for petals
- Remove CSS-based side border decorations

**Out of Scope:**

- Changing flower positions (use reference positions)

#### Current State

- CSS-based side border decorations with repeating gradients
- Code: `filete-sign.css:66-113`

#### Desired State

- Reusable component `fileteoFlower` in `<defs>`
- 5 petals with flower gradient fill
- Gold center circle
- Positioned at left (x=130) and right (x=870) at y=175
- Scale: 1.2x, rotated 90° and -90°
- Matching `filete.html:91-98, 119-120`

#### Implementation Steps

1. Create flower component in `<defs>`
2. Implement 5 petals with flower gradient
3. Add gold center circle
4. Place at left side (x=130, y=175, scale 1.2x, rotate 90°)
5. Place at right side (x=870, y=175, scale 1.2x, rotate -90°)
6. Remove CSS side border decorations

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Add flower component and placements
- `frontend/src/styles/components/filete-sign.css`: Remove side border decoration styles

#### Dependencies

- **Blocks**: None
- **Blocked by**: Task 1, Task 3
- **Can run parallel with**: Task 4, Task 6

#### Risks

**Technical Risks:**

- **Risk**: Petal paths not matching reference
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Copy paths from reference, test visually

**Visual Risks:**

- **Risk**: Flowers not matching reference appearance
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Compare with reference, adjust if needed

#### Acceptance Criteria

- [ ] Flower component defined in `<defs>`
- [ ] 5 petals with flower gradient
- [ ] Gold center circle
- [ ] Left flower: x=130, y=175, scale 1.2x, rotate 90°
- [ ] Right flower: x=870, y=175, scale 1.2x, rotate -90°
- [ ] CSS side border decorations removed
- [ ] Visual appearance matches reference

#### Validation

- [ ] Component structure matches reference
- [ ] Visual appearance verified
- [ ] Both flowers placed correctly
- [ ] Transforms correct

#### Effort Estimate

**Breakdown:**

- Code changes: 2-3 hours
- Testing: 1 hour
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 4-5 hours (Small)

**Confidence**: Medium (SVG paths need verification)

---

### Task 6: Add Decorative Swirls

**Gap ID**: GAP-007  
**Priority**: P0  
**Design System Area**: Components

#### Description

Add decorative turquoise swirls above and below text area.

#### Scope

**In Scope:**

- Add two curved paths above and below text
- Use turquoise color with opacity
- Position correctly relative to text

**Out of Scope:**

- Changing text positions (handled in Task 8)

#### Current State

- No decorative swirl lines
- Bottom has flourish SVG, but different style

#### Desired State

- Two curved paths:
  - Above: `M 200 80 Q 500 120 800 80`
  - Below: `M 200 270 Q 500 230 800 270`
- Color: `#63e6be` (turquoise), stroke-width: 2, opacity: 0.8
- Matching `filete.html:123-124`

#### Implementation Steps

1. Add path above text area
2. Add path below text area
3. Set color to `#63e6be`
4. Set stroke-width to 2
5. Set opacity to 0.8
6. Remove bottom flourish SVG (if not needed)

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Add decorative swirl paths

#### Dependencies

- **Blocks**: None
- **Blocked by**: Task 1
- **Can run parallel with**: Task 4, Task 5, Task 8

#### Risks

**Technical Risks:**

- **Risk**: Path coordinates incorrect
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Copy exact paths from reference

**Visual Risks:**

- **Risk**: Swirls not visible or positioned incorrectly
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Test visually, adjust if needed

#### Acceptance Criteria

- [ ] Path above text: `M 200 80 Q 500 120 800 80`
- [ ] Path below text: `M 200 270 Q 500 230 800 270`
- [ ] Color: `#63e6be`, stroke-width: 2, opacity: 0.8
- [ ] Visual appearance matches reference

#### Validation

- [ ] Paths match reference exactly
- [ ] Visual appearance verified
- [ ] Colors and opacity correct

#### Effort Estimate

**Breakdown:**

- Code changes: 1 hour
- Testing: 0.5 hours
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 2.5-3 hours (Small)

**Confidence**: High (straightforward)

---

### Task 7: Refactor Text Layout

**Gap ID**: GAP-008, GAP-011  
**Priority**: P0  
**Design System Area**: Components / Visual Patterns

#### Description

Replace single title with three-line text layout using fixed content matching the reference implementation.

#### Scope

**In Scope:**

- Replace single title with three text elements
- Use fixed text content (no props)
- Implement three-line layout
- Position text elements correctly

**Out of Scope:**

- Typography fonts (handled in Task 8)
- Text colors (handled in Task 8)
- Text shadow (handled in Task 9)

#### Current State

- Single title: `{title}` prop (default: "Bienvenidos a la Usina de la Fábrica de Jingles")
- Optional subtitle: `{subtitle}` prop
- Code: `FileteSign.tsx:93-96`

#### Desired State

- **Top Line**: "Bienvenido a la" - y="130"
- **Main Title**: "USINA" - y="200"
- **Bottom Line**: "de la Fábrica de Jingles" - y="260"
- All centered (x="500")
- Matching `filete.html:130-163`

#### Implementation Steps

1. Remove title and subtitle props (or make them optional/unused)
2. Add top line text element: "Bienvenido a la"
3. Add main title text element: "USINA"
4. Add bottom line text element: "de la Fábrica de Jingles"
5. Position all at x="500" with correct y values
6. Set text-anchor="middle" for all
7. Update component interface (remove or deprecate props)

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Refactor text layout
- `frontend/src/pages/Home.tsx`: Update FileteSign usage (remove props if needed)

#### Dependencies

- **Blocks**: Task 8, Task 9
- **Blocked by**: Task 1
- **Can run parallel with**: Task 4, Task 5, Task 6

#### Risks

**Technical Risks:**

- **Risk**: Breaking existing usage of component
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Check all usages, update if needed, or keep props but ignore them

**Visual Risks:**

- **Risk**: Text positioning incorrect
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Use exact y values from reference, test visually

#### Acceptance Criteria

- [ ] Three text elements: top line, main title, bottom line
- [ ] Fixed text content matching reference
- [ ] Positions: x="500", y="130", "200", "260"
- [ ] text-anchor="middle" for all
- [ ] Component interface updated appropriately

#### Validation

- [ ] Text layout matches reference
- [ ] Positions correct
- [ ] All usages updated if needed

#### Effort Estimate

**Breakdown:**

- Code changes: 2-3 hours
- Testing: 1 hour
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 4-5 hours (Small)

**Confidence**: High (straightforward)

---

### Task 8: Update Typography and Text Styling

**Gap ID**: GAP-009, GAP-012  
**Priority**: P0  
**Design System Area**: Design Tokens / Typography

#### Description

Add Google Fonts (Rye, Sancreek) and update text colors and styling to match reference implementation.

#### Scope

**In Scope:**

- Add Google Fonts (Rye, Sancreek) to project
- Apply Rye font to top and bottom lines
- Apply Sancreek font to main title
- Update text colors (white for top/bottom, gold gradient for main)
- Update letter spacing
- Add stroke to main title

**Out of Scope:**

- Text shadow filter (handled in Task 9)

#### Current State

- Uses design system fonts: `var(--font-family-signage)`
- Title: `#ff0000` with blue text-shadow
- Subtitle: `var(--color-peronist-blue)`
- Code: `filete-sign.css:212-237`

#### Desired State

- **Top/Bottom lines**: `'Rye', serif`, `#FFF` (white), letter-spacing: 2 (top), 1 (bottom)
- **Main title**: `'Sancreek', serif`, gold gradient fill, dark brown stroke (`#5c4208`, stroke-width: 1.5), letter-spacing: 3
- Font sizes: 45px (top), 80px (main), 40px (bottom)
- Matching `filete.html:131-163`

#### Implementation Steps

1. Add Google Fonts link to HTML or import in CSS
2. Update top line: Rye font, 45px, white, letter-spacing: 2
3. Update main title: Sancreek font, 80px, gold gradient fill, dark brown stroke, letter-spacing: 3
4. Update bottom line: Rye font, 40px, white, letter-spacing: 1
5. Remove CSS text-shadow (will use SVG filter in Task 9)
6. Update CSS or inline styles

#### Files to Modify

- `frontend/index.html` or `frontend/src/styles/theme/fonts.css`: Add Google Fonts
- `frontend/src/components/composite/FileteSign.tsx`: Update text element styles
- `frontend/src/styles/components/filete-sign.css`: Update or remove text styles

#### Dependencies

- **Blocks**: Task 9
- **Blocked by**: Task 7
- **Can run parallel with**: None

#### Risks

**Technical Risks:**

- **Risk**: Google Fonts not loading

  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Test font loading, add fallbacks

- **Risk**: Font sizes not matching reference
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Use exact pixel values from reference

**Visual Risks:**

- **Risk**: Text appearance not matching reference
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Compare side-by-side, adjust if needed

#### Acceptance Criteria

- [ ] Google Fonts (Rye, Sancreek) loaded
- [ ] Top line: Rye, 45px, white, letter-spacing: 2
- [ ] Main title: Sancreek, 80px, gold gradient, dark brown stroke, letter-spacing: 3
- [ ] Bottom line: Rye, 40px, white, letter-spacing: 1
- [ ] Colors match reference
- [ ] Font sizes match reference

#### Validation

- [ ] Fonts loaded correctly
- [ ] Typography matches reference
- [ ] Colors match reference
- [ ] Letter spacing correct

#### Effort Estimate

**Breakdown:**

- Code changes: 2-3 hours
- Testing: 1 hour
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 4-5 hours (Small)

**Confidence**: High (straightforward)

---

## Phase 2: High Priority (P1)

**Goal**: Fix significant design inconsistencies

**Timeline**: Estimated 8-12 hours

### Task 9: Add Text Shadow Filter

**Gap ID**: GAP-010  
**Priority**: P1  
**Design System Area**: Components

#### Description

Replace CSS text-shadow with SVG text shadow filter for 3D effect matching reference implementation.

#### Scope

**In Scope:**

- Create SVG text shadow filter in `<defs>`
- Apply filter to all text elements
- Remove CSS text-shadow

**Out of Scope:**

- Changing filter parameters (use exact reference values)

#### Current State

- CSS text-shadow: Multiple shadows with blue outline
- Code: `filete-sign.css:219-224`

#### Desired State

- SVG filter `textShadow` in `<defs>`
- Two drop shadows: dx="3" dy="3" (black, opacity 1), dx="2" dy="2" (black, opacity 0.5)
- Applied via `filter="url(#textShadow)"` on all text elements
- Matching `filete.html:68-71, 135, 149, 160`

#### Implementation Steps

1. Create text shadow filter in `<defs>`
2. Add first drop shadow: dx="3" dy="3", black, opacity 1
3. Add second drop shadow: dx="2" dy="2", black, opacity 0.5
4. Apply filter to top line text
5. Apply filter to main title text
6. Apply filter to bottom line text
7. Remove CSS text-shadow styles

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Add filter definition and apply to text
- `frontend/src/styles/components/filete-sign.css`: Remove text-shadow styles

#### Dependencies

- **Blocks**: None
- **Blocked by**: Task 7, Task 8
- **Can run parallel with**: None

#### Risks

**Technical Risks:**

- **Risk**: Filter not rendering correctly
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Test filter, verify visually

**Visual Risks:**

- **Risk**: Shadow effect not matching reference
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Compare with reference, adjust if needed

#### Acceptance Criteria

- [ ] Text shadow filter defined in `<defs>`
- [ ] Two drop shadows with correct parameters
- [ ] Filter applied to all three text elements
- [ ] CSS text-shadow removed
- [ ] Visual appearance matches reference

#### Validation

- [ ] Filter definition matches reference
- [ ] Visual appearance verified
- [ ] All text elements have filter applied

#### Effort Estimate

**Breakdown:**

- Code changes: 1-2 hours
- Testing: 0.5 hours
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 2.5-3.5 hours (Small)

**Confidence**: High (straightforward)

---

### Task 10: Remove Extra Decorative Elements

**Gap ID**: GAP-014  
**Priority**: P1  
**Design System Area**: Components

#### Description

Remove extra decorative elements (crest, bottom flourish, side border decorations) not in the documented design system.

#### Scope

**In Scope:**

- Remove top crest SVG
- Remove bottom flourish SVG
- Remove CSS side border decorations
- Clean up related styles

**Out of Scope:**

- Changing container structure
- Changing padding/spacing (unless needed for cleanup)

#### Current State

- Top crest with curved border and scrollwork
- Bottom flourish SVG
- Side border decorations with CSS gradients
- Code: `FileteSign.tsx:27-85, 100-113`, `filete-sign.css:25-113`

#### Desired State

- No crest or flourish elements
- No side border decorations
- Only documented decorative elements remain

#### Implementation Steps

1. Remove crest SVG element
2. Remove bottom flourish SVG element
3. Remove side border decoration divs
4. Remove related CSS styles
5. Clean up unused gradient definitions (if any)
6. Test visual appearance

#### Files to Modify

- `frontend/src/components/composite/FileteSign.tsx`: Remove extra decorative elements
- `frontend/src/styles/components/filete-sign.css`: Remove related styles

#### Dependencies

- **Blocks**: None
- **Blocked by**: Task 1, Task 4, Task 5 (to ensure documented elements are in place first)
- **Can run parallel with**: None

#### Risks

**Technical Risks:**

- **Risk**: Removing elements breaks layout
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Test after removal, adjust spacing if needed

**Visual Risks:**

- **Risk**: Sign looks incomplete after removal
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Ensure documented elements are in place first

#### Acceptance Criteria

- [ ] Crest SVG removed
- [ ] Bottom flourish SVG removed
- [ ] Side border decorations removed
- [ ] Related CSS styles removed
- [ ] Visual appearance matches reference (only documented elements)

#### Validation

- [ ] Extra elements removed
- [ ] Visual appearance verified
- [ ] No broken styles

#### Effort Estimate

**Breakdown:**

- Code changes: 1-2 hours
- Testing: 0.5 hours
- Documentation: 0.5 hours
- Review: 0.5 hours

**Total**: 2.5-3.5 hours (Small)

**Confidence**: High (straightforward cleanup)

---

## Phase 3: Medium Priority (P2)

**Goal**: Address minor issues and technical debt

**Timeline**: Estimated 2-4 hours

### Task 11: Review Container Padding

**Gap ID**: GAP-015  
**Priority**: P2  
**Design System Area**: Components

#### Description

Review and decide whether to use exact padding value (20px) or keep design system token, document decision.

#### Scope

**In Scope:**

- Review container padding
- Compare with reference (20px)
- Make decision: exact value or token
- Document decision
- Update if needed

**Out of Scope:**

- Changing other spacing values

#### Current State

- Container: `max-width: 900px` (matches)
- Padding: `var(--spacing-xl)` (design system token, not 20px)
- Code: `filete-sign.css:12, 20`

#### Desired State

- Decision: Use exact 20px or document token as acceptable
- If exact: Update to 20px
- If token: Document as acceptable variation

#### Implementation Steps

1. Review design system spacing tokens
2. Compare `var(--spacing-xl)` value with 20px
3. Make decision based on design system philosophy
4. Update code if needed
5. Document decision

#### Files to Modify

- `frontend/src/styles/components/filete-sign.css`: Update padding if needed
- `docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md`: Document decision

#### Dependencies

- **Blocks**: None
- **Blocked by**: None
- **Can run parallel with**: Any task

#### Risks

**Technical Risks:**

- **Risk**: None (minor change)
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: N/A

#### Acceptance Criteria

- [ ] Decision made and documented
- [ ] Code updated if needed
- [ ] Documentation updated

#### Validation

- [ ] Decision documented
- [ ] Code matches decision

#### Effort Estimate

**Breakdown:**

- Code changes: 0.5 hours (if needed)
- Testing: 0.5 hours
- Documentation: 1 hour
- Review: 0.5 hours

**Total**: 2.5-3 hours (Small)

**Confidence**: High (straightforward)

---

## Task Dependency Graph

```
Task 1 (SVG Structure)
  ├─> Task 2 (Background/Borders)
  ├─> Task 3 (Gradients)
  ├─> Task 4 (Corner Scrolls)
  ├─> Task 5 (Central Flowers)
  ├─> Task 6 (Decorative Swirls)
  └─> Task 7 (Text Layout)

Task 2 (Background/Borders)
  └─> (no dependencies)

Task 3 (Gradients)
  ├─> Task 4 (Corner Scrolls)
  ├─> Task 5 (Central Flowers)
  └─> Task 8 (Typography)

Task 7 (Text Layout)
  ├─> Task 8 (Typography)
  └─> Task 9 (Text Shadow)

Task 8 (Typography)
  └─> Task 9 (Text Shadow)

Task 4, 5, 6 (Decorative Elements)
  └─> Task 10 (Remove Extra Elements)

Task 11 (Container Padding)
  └─> (independent)
```

**Parallel Execution Opportunities:**

- Tasks 4, 5, 6 can run in parallel (after Task 1, 3)
- Task 11 can run independently

## Risk Mitigation Plan

### High Risk Tasks

- **Task 1 (SVG Structure)**:

  - **Risk**: Breaking scroll detection
  - **Mitigation**: Test scroll detection after each step, maintain wrapper div structure
  - **Risk**: Performance degradation
  - **Mitigation**: Use reusable components in `<defs>`, optimize SVG paths

- **Task 4 (Corner Scrolls)**:
  - **Risk**: Transform calculations incorrect
  - **Mitigation**: Test each corner placement, compare with reference visually

### Medium Risk Tasks

- **Task 7 (Text Layout)**:

  - **Risk**: Breaking existing usage
  - **Mitigation**: Check all usages, update if needed, or keep props but ignore them

- **Task 8 (Typography)**:
  - **Risk**: Fonts not loading
  - **Mitigation**: Test font loading, add fallbacks

## Success Criteria

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] All P2 tasks completed
- [ ] Design system validated (PLAYBOOK_02)
- [ ] No visual regressions introduced
- [ ] Code matches design system documentation
- [ ] Component matches reference implementation (`filete.html`)
- [ ] Scroll detection functionality preserved
- [ ] Responsive behavior maintained

## Task Tracking

| Task ID  | Description                         | Priority | Status   | Assigned | Effort           | Dependencies                 | Notes                                         |
| -------- | ----------------------------------- | -------- | -------- | -------- | ---------------- | ---------------------------- | --------------------------------------------- |
| TASK-001 | Refactor to Single SVG Structure    | P0       | Complete | -        | Large (16-22h)   | -                            | ✅ Complete - Foundation structure created    |
| TASK-002 | Update Background Board and Borders | P0       | Complete | -        | Medium (5-6h)    | TASK-001                     | ✅ Complete - Gold gradient borders added     |
| TASK-003 | Update Gradient Definitions         | P0       | Complete | -        | Small (2.5-3h)   | TASK-001                     | ✅ Complete - All gradients defined           |
| TASK-004 | Add Corner Scroll Ornaments         | P0       | Complete | -        | Medium (6-8h)    | TASK-001, TASK-003           | ✅ Complete - 4 corner ornaments added        |
| TASK-005 | Add Central Flowers                 | P0       | Complete | -        | Small (4-5h)     | TASK-001, TASK-003           | ✅ Complete - 2 side flowers added            |
| TASK-006 | Add Decorative Swirls               | P0       | Complete | -        | Small (2.5-3h)   | TASK-001                     | ✅ Complete - Swirls above/below text added   |
| TASK-007 | Refactor Text Layout                | P0       | Complete | -        | Small (4-5h)     | TASK-001                     | ✅ Complete - Three-line layout implemented   |
| TASK-008 | Update Typography and Text Styling  | P0       | Complete | -        | Small (4-5h)     | TASK-007                     | ✅ Complete - Fonts, colors, styling updated  |
| TASK-009 | Add Text Shadow Filter              | P1       | Complete | -        | Small (2.5-3.5h) | TASK-007, TASK-008           | ✅ Complete - 3D shadow filter added          |
| TASK-010 | Remove Extra Decorative Elements    | P1       | Complete | -        | Small (2.5-3.5h) | TASK-001, TASK-004, TASK-005 | ✅ Complete - Removed in TASK-001             |
| TASK-011 | Review Container Padding            | P2       | Complete | -        | Small (2.5-3h)   | -                            | ✅ Complete - Using design token (acceptable) |

**Total Estimated Effort**: 40-60 hours

## Next Steps

1. [ ] Review plan with stakeholders
2. [ ] Get approval on priorities and timeline
3. [ ] Assign tasks to developers
4. [ ] Begin Phase 1 (P0 tasks) - Start with TASK-001
5. [ ] Use PLAYBOOK_05 for implementation
6. [ ] Track progress using task tracking table
7. [ ] Validate after each phase using PLAYBOOK_02

---

**Related Documentation**:

- Gap Analysis: `filete-sign-gap-analysis-2025-11-28.md`
- Component Spec: `filete-sign.md`
- Validation Report: `filete-sign-validation-2025-11-28.md`
- Reference Implementation: `docs/2_frontend_ui-design-system/05_visual-references/filete.html`
