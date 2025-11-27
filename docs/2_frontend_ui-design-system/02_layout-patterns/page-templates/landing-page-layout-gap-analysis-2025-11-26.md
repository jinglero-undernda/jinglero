# Design System Gap Analysis Report: Landing Page Layout

**Date**: 2025-11-26  
**Analyst**: AI Assistant  
**Design System Version**: 2.0 (Design Intent - 2025-11-26)  
**Validation Report**: `landing-page-layout-validation-2025-11-26.md`

## Executive Summary

- **Total Gaps Identified**: 18
- **Critical Gaps**: 3
- **High Priority Gaps**: 6
- **Medium Priority Gaps**: 6
- **Low Priority Gaps**: 3

**Overall Assessment**: The landing page implementation has significant gaps between current code and documented design intent. Most gaps are expected since the documentation represents target design intent rather than current implementation. However, there are critical gaps in design token usage that should be addressed to maintain consistency with the design system.

## Gap Summary by Layer

### Design Token Layer
- **Missing Tokens**: 4 (used in code but not in design system)
- **Value Mismatches**: 3 (fallback values don't match design system)
- **Usage Violations**: 8 (not using design tokens, using hardcoded values)
- **Total Token Gaps**: 15

### Component Layer
- **Missing Components**: 5 (documented but not implemented)
- **Style Mismatches**: 3 (current styles don't match design intent)
- **Total Component Gaps**: 8

### Visual Pattern Layer
- **Missing Patterns**: 4 (documented but not implemented)
- **Pattern Inconsistencies**: 1 (layout pattern doesn't match design intent)
- **Total Pattern Gaps**: 5

## Detailed Gap Analysis

### Gap 1: Legacy CSS Variables with Light Theme Fallbacks

**Layer**: Design Token  
**Severity**: Critical  
**Priority**: P0  
**Category**: Value Mismatch + Usage Violation

**Description**: Current `home.css` uses legacy CSS variables (`--color-text-primary`, `--color-text-secondary`) with light theme fallback values (`#333`, `#666`) that don't match the design system's dark industrial theme values (`#e0e0e0`, `#b0b0b0`).

**Current State**:
```css
color: var(--color-text-primary, #333);  /* Light theme fallback */
color: var(--color-text-secondary, #666); /* Light theme fallback */
```

**Desired State**:
```css
color: var(--color-text-primary);  /* No fallback needed, token exists */
color: var(--color-text-secondary); /* No fallback needed, token exists */
```

**Impact**:
- **Visual Impact**: High - Creates inconsistent appearance if tokens fail to load
- **User Impact**: Medium - May cause readability issues in dark theme
- **Consistency Impact**: High - Breaks design system consistency

**Root Cause**: Legacy code from before design system implementation, using light theme fallbacks.

**Recommendation**: Remove fallback values and rely on design system tokens. If fallbacks are needed for safety, use design system values.

**Effort Estimate**: Small (15-30 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:16,21,96,114`
- Should be: Remove fallbacks or use design system values

---

### Gap 2: Missing CSS Variables in Design System

**Layer**: Design Token  
**Severity**: High  
**Priority**: P1  
**Category**: Missing Tokens

**Description**: Current implementation uses CSS variables that don't exist in the design system:
- `--color-border` (used instead of `--color-border-primary`)
- `--color-primary` (used instead of `--color-accent-primary`)
- `--color-primary-dark` (doesn't exist, needs to be created or alternative used)
- `--color-error-bg` (doesn't exist, needs to be created or alternative used)

**Current State**:
```css
border: 2px solid var(--color-border, #ddd);
border-color: var(--color-primary, #007bff);
background-color: var(--color-primary-dark, #0056b3);
background-color: var(--color-error-bg, #ffebee);
```

**Desired State**:
```css
border: 2px solid var(--color-border-primary);
border-color: var(--color-accent-primary);
background-color: var(--color-accent-primary); /* or create hover variant */
background-color: var(--color-bg-surface); /* or create error-bg token */
```

**Impact**:
- **Visual Impact**: Medium - May cause inconsistent styling
- **User Impact**: Low - Functionality works but styling inconsistent
- **Consistency Impact**: High - Breaks design system token usage

**Root Cause**: Legacy variable names from before design system standardization.

**Recommendation**: 
1. Replace `--color-border` with `--color-border-primary`
2. Replace `--color-primary` with `--color-accent-primary`
3. Create `--color-primary-dark` token or use existing hover state token
4. Create `--color-error-bg` token or use existing background token

**Effort Estimate**: Small (30-45 minutes)  
**Dependencies**: May need to create new tokens in design system

**Code References**:
- Current: `frontend/src/styles/pages/home.css:41,48,54,63,75,119`
- Should be: Use design system tokens or create missing tokens

---

### Gap 3: Hardcoded Spacing Values

**Layer**: Design Token  
**Severity**: High  
**Priority**: P1  
**Category**: Usage Violation

**Description**: Current implementation uses hardcoded spacing values (2rem, 3rem, 1rem, 0.5rem) instead of design system spacing tokens (`--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`).

**Current State**:
```css
padding: 2rem 1rem;
margin-bottom: 3rem;
padding: 2rem 0;
gap: 0.5rem;
padding: 1rem 0.5rem;
```

**Desired State**:
```css
padding: var(--spacing-xl) var(--spacing-md);
margin-bottom: var(--spacing-xl); /* or create larger spacing token */
padding: var(--spacing-xl) 0;
gap: var(--spacing-sm);
padding: var(--spacing-md) var(--spacing-sm);
```

**Impact**:
- **Visual Impact**: Low - Visual appearance similar
- **User Impact**: Low - No functional impact
- **Consistency Impact**: High - Breaks design system consistency

**Root Cause**: Legacy code using rem units directly instead of design tokens.

**Recommendation**: Replace all hardcoded spacing values with design system spacing tokens. For values like 3rem that don't have direct tokens, use closest token or create new token if needed.

**Effort Estimate**: Small (30-45 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:4,10,23,34,87,112,127`
- Should be: Use spacing tokens throughout

---

### Gap 4: Hardcoded Typography Values

**Layer**: Design Token  
**Severity**: High  
**Priority**: P1  
**Category**: Usage Violation

**Description**: Current implementation uses hardcoded font sizes (2.5rem, 1.25rem, 2rem, 1.1rem, 1.75rem, 1.5rem) instead of design system typography tokens.

**Current State**:
```css
font-size: 2.5rem;  /* Hero title */
font-size: 1.25rem; /* Subtitle */
font-size: 2rem;    /* Mobile hero title */
font-size: 1.1rem;  /* Mobile subtitle */
font-size: 1.75rem; /* Section title */
font-size: 1.5rem;  /* Mobile section title */
```

**Desired State**:
```css
font-size: var(--font-size-h1); /* or --font-size-display for hero */
font-size: var(--font-size-body-large); /* or --font-size-h5 */
font-size: var(--font-size-h2); /* Mobile hero */
font-size: var(--font-size-body); /* Mobile subtitle */
font-size: var(--font-size-h3); /* Section title */
font-size: var(--font-size-h4); /* Mobile section title */
```

**Impact**:
- **Visual Impact**: Medium - Typography may not match design system scale
- **User Impact**: Low - Readability similar
- **Consistency Impact**: High - Breaks typography system consistency

**Root Cause**: Legacy code using rem units directly instead of typography tokens.

**Recommendation**: Replace hardcoded font sizes with typography tokens. Map current sizes to closest design system tokens.

**Effort Estimate**: Small (20-30 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:14,20,91,131,134,139`
- Should be: Use typography tokens

---

### Gap 5: Missing Factory Signage Typography

**Layer**: Design Token + Component  
**Severity**: High  
**Priority**: P1  
**Category**: Usage Violation + Style Mismatch

**Description**: Current implementation doesn't use factory signage typography (`--font-family-signage`) for headings and titles, as specified in design intent.

**Current State**: Uses default/system fonts for all text.

**Desired State**: Use `--font-family-signage` for:
- Hero title (h1)
- Section titles (h2)
- Navigation buttons (when implemented)

**Impact**:
- **Visual Impact**: High - Missing industrial aesthetic
- **User Impact**: Medium - Brand identity not reflected
- **Consistency Impact**: High - Breaks design philosophy

**Root Cause**: Typography migration not yet implemented.

**Recommendation**: Update typography to use factory signage font for headings and titles.

**Effort Estimate**: Small (15-20 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:13,90`
- Should be: Add `font-family: var(--font-family-signage);`

---

### Gap 6: Max-Width Container Constraint

**Layer**: Visual Pattern  
**Severity**: Critical  
**Priority**: P0  
**Category**: Pattern Inconsistency

**Description**: Current implementation uses max-width container (1200px) with centered layout, but design intent specifies full-width layout with no max-width constraint.

**Current State**:
```css
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
```

**Desired State**:
```css
.home-page {
  width: 100%;
  padding: var(--spacing-xl) var(--spacing-md);
}
```

**Impact**:
- **Visual Impact**: High - Layout doesn't match design intent
- **User Impact**: Medium - Content width constrained
- **Consistency Impact**: High - Breaks full-width progressive reveal pattern

**Root Cause**: Legacy layout pattern from before design intent was established.

**Recommendation**: Remove max-width constraint and implement full-width layout.

**Effort Estimate**: Small (10-15 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:2-4`
- Should be: Full-width layout

---

### Gap 7: Missing FileteSign Component

**Layer**: Component  
**Severity**: Critical  
**Priority**: P0  
**Category**: Missing Component

**Description**: FileteSign component is fully documented but not implemented. This is the hero section welcome sign with Filete decorations.

**Current State**: Simple title/subtitle in hero section.

**Desired State**: FileteSign component with:
- Decorative wooden sign background
- Colorful Filete border decorations
- Factory signage typography
- Scroll-based fade-out behavior

**Impact**:
- **Visual Impact**: Critical - Missing key visual element
- **User Impact**: High - Brand identity not established
- **Consistency Impact**: High - Design intent not realized

**Root Cause**: Component not yet implemented (documented as "To be implemented").

**Recommendation**: Implement FileteSign component per design specifications.

**Effort Estimate**: Large (8-12 hours)  
**Dependencies**: 
- Filete decoration assets/SVG
- Scroll behavior implementation
- Typography tokens

**Code References**:
- Current: `frontend/src/pages/Home.tsx:59-63`
- Should be: New component `FileteSign.tsx`

---

### Gap 8: Missing FloatingHeader Component

**Layer**: Component  
**Severity**: High  
**Priority**: P1  
**Category**: Missing Component

**Description**: FloatingHeader component is fully documented but not implemented. This provides always-accessible navigation.

**Current State**: No floating header navigation.

**Desired State**: FloatingHeader component with:
- Semi-transparent background
- Fixed positioning
- Factory signage buttons
- Advanced Search and Login buttons

**Impact**:
- **Visual Impact**: Medium - Missing navigation element
- **User Impact**: High - Navigation not always accessible
- **Consistency Impact**: Medium - Design intent not realized

**Root Cause**: Component not yet implemented (documented as "To be implemented").

**Recommendation**: Implement FloatingHeader component per design specifications.

**Effort Estimate**: Medium (4-6 hours)  
**Dependencies**: 
- Button component with factory signage styling
- Navigation routes

**Code References**:
- Current: Not implemented
- Should be: New component `FloatingHeader.tsx`

---

### Gap 9: Missing Full-Width Sticky Search Bar

**Layer**: Component + Visual Pattern  
**Severity**: High  
**Priority**: P1  
**Category**: Missing Component + Missing Pattern

**Description**: Design intent specifies full-width search bar that appears sticky on scroll, but current implementation has centered search bar with max-width.

**Current State**:
```css
.home-page__search-bar {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}
```

**Desired State**: Full-width search bar with sticky positioning.

**Impact**:
- **Visual Impact**: Medium - Layout doesn't match design intent
- **User Impact**: Medium - Search not always accessible
- **Consistency Impact**: High - Pattern not implemented

**Root Cause**: Legacy implementation before design intent was established.

**Recommendation**: Update search bar to full-width with sticky positioning.

**Effort Estimate**: Medium (2-3 hours)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:25-29`
- Should be: Full-width sticky search bar

---

### Gap 10: Missing Featured Fabrica Placeholder

**Layer**: Component  
**Severity**: Medium  
**Priority**: P2  
**Category**: Missing Component

**Description**: FeaturedFabricaPlaceholder component is documented but not implemented. This is a 16:9 aspect ratio placeholder for future Featured Fabrica component.

**Current State**: No placeholder component.

**Desired State**: Placeholder component with:
- 16:9 aspect ratio
- Full page width
- "PROXIMAMENTE VEA AQUI LA FABRICA MAS RECIENTE" message

**Impact**:
- **Visual Impact**: Low - Placeholder, not critical
- **User Impact**: Low - Informational only
- **Consistency Impact**: Medium - Design intent not realized

**Root Cause**: Component not yet implemented (documented as "To be implemented").

**Recommendation**: Implement FeaturedFabricaPlaceholder component.

**Effort Estimate**: Small (1-2 hours)  
**Dependencies**: None

**Code References**:
- Current: Not implemented
- Should be: New component `FeaturedFabricaPlaceholder.tsx`

---

### Gap 11: Missing Volumetric Indicators Section

**Layer**: Component  
**Severity**: Medium  
**Priority**: P2  
**Category**: Missing Component

**Description**: VolumetricIndicators section is documented but not implemented. This displays entity counts using WarningLabel components.

**Current State**: No volumetric indicators section.

**Desired State**: Section with 6 WarningLabel components showing:
- Fabricas count
- Jingles count
- Canciones count
- Proveedores count (Artistas with AUTOR_DE)
- Jingleros count (Artistas with JINGLERO_DE)
- Temáticas count

**Impact**:
- **Visual Impact**: Medium - Missing data awareness element
- **User Impact**: Medium - Users don't see data volume
- **Consistency Impact**: Medium - Design intent not realized

**Root Cause**: Component not yet implemented (documented as "To be implemented").

**Recommendation**: Implement VolumetricIndicators section using WarningLabel components.

**Effort Estimate**: Medium (3-4 hours)  
**Dependencies**: 
- WarningLabel component (exists ✅)
- API endpoints for entity counts
- Special counts for Proveedores/Jingleros

**Code References**:
- Current: Not implemented
- Should be: New section in `Home.tsx` or component

---

### Gap 12: Missing Featured Entities Section

**Layer**: Component  
**Severity**: Medium  
**Priority**: P2  
**Category**: Missing Component

**Description**: FeaturedEntitiesSection is documented but not implemented. This should display 6 subsections with 5 entities each.

**Current State**: Only Featured Fabricas section (6 entities).

**Desired State**: 6 subsections:
- Featured Fabricas (5 entities)
- Featured Canciones (5 entities)
- Featured Proveedores (5 entities)
- Featured Jingleros (5 entities)
- Featured Jingles (5 entities)
- Featured Temáticas (5 entities)

**Impact**:
- **Visual Impact**: Medium - Missing content discovery sections
- **User Impact**: Medium - Limited content discovery
- **Consistency Impact**: Medium - Design intent not realized

**Root Cause**: Component not yet implemented (documented as "To be implemented").

**Recommendation**: Implement FeaturedEntitiesSection with 6 subsections.

**Effort Estimate**: Large (6-8 hours)  
**Dependencies**: 
- EntityCard component (exists ✅)
- API endpoints for featured entities
- Sorting logic (recency or popularity)

**Code References**:
- Current: `frontend/src/pages/Home.tsx:85-106` (only Fabricas)
- Should be: Expanded to 6 subsections

---

### Gap 13: Missing Progressive Reveal Pattern

**Layer**: Visual Pattern  
**Severity**: Medium  
**Priority**: P2  
**Category**: Missing Pattern

**Description**: Design intent specifies progressive reveal pattern (factory floor metaphor), but current implementation doesn't have this behavior.

**Current State**: Static layout, no progressive reveal.

**Desired State**: Progressive reveal as user scrolls:
- Filete sign fades out on scroll
- Content sections reveal progressively
- Factory floor metaphor

**Impact**:
- **Visual Impact**: Medium - Missing visual metaphor
- **User Impact**: Low - Functional impact minimal
- **Consistency Impact**: Medium - Design intent not realized

**Root Cause**: Pattern not yet implemented (documented as "To be implemented").

**Recommendation**: Implement progressive reveal pattern with scroll-based animations.

**Effort Estimate**: Medium (3-4 hours)  
**Dependencies**: 
- FileteSign component
- Scroll detection logic

**Code References**:
- Current: Static layout
- Should be: Progressive reveal with scroll behavior

---

### Gap 14: Missing Filete Decoration Pattern

**Layer**: Visual Pattern  
**Severity**: Low  
**Priority**: P3  
**Category**: Missing Pattern

**Description**: Filete decoration pattern (colorful borders, floral motifs) is documented but not implemented.

**Current State**: No Filete decorations.

**Desired State**: Filete decorations with:
- Colorful borders (red, orange, yellow, green, blue, gold)
- Floral and scrollwork motifs
- Vintage Argentine Filete style

**Impact**:
- **Visual Impact**: Low - Decorative element
- **User Impact**: Low - Aesthetic only
- **Consistency Impact**: Low - Design intent not realized

**Root Cause**: Pattern not yet implemented (documented as "To be implemented").

**Recommendation**: Implement Filete decoration pattern (SVG or CSS).

**Effort Estimate**: Large (8-12 hours)  
**Dependencies**: 
- Filete decoration assets
- FileteSign component

**Code References**:
- Current: Not implemented
- Should be: Part of FileteSign component

---

### Gap 15: Hardcoded Border Radius Values

**Layer**: Design Token  
**Severity**: Low  
**Priority**: P3  
**Category**: Usage Violation

**Description**: Current implementation uses hardcoded border-radius values (4px) instead of design system border radius tokens.

**Current State**:
```css
border-radius: 4px;
```

**Desired State**:
```css
border-radius: var(--border-radius-sm); /* 4px */
```

**Impact**:
- **Visual Impact**: Low - Visual appearance similar
- **User Impact**: None
- **Consistency Impact**: Low - Minor inconsistency

**Root Cause**: Legacy code using hardcoded values.

**Recommendation**: Replace with design system border radius tokens.

**Effort Estimate**: Small (10-15 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:42,57,76,120`
- Should be: Use `--border-radius-sm`

---

### Gap 16: Hardcoded Transition Values

**Layer**: Design Token  
**Severity**: Low  
**Priority**: P3  
**Category**: Usage Violation

**Description**: Current implementation uses hardcoded transition values (0.2s) instead of design system transition tokens.

**Current State**:
```css
transition: border-color 0.2s;
transition: background-color 0.2s;
```

**Desired State**:
```css
transition: border-color var(--transition-normal);
transition: background-color var(--transition-normal);
```

**Impact**:
- **Visual Impact**: Low - Transition timing similar
- **User Impact**: None
- **Consistency Impact**: Low - Minor inconsistency

**Root Cause**: Legacy code using hardcoded values.

**Recommendation**: Replace with design system transition tokens.

**Effort Estimate**: Small (5-10 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:44,59`
- Should be: Use transition tokens

---

### Gap 17: Search Dropdown Light Theme Styling

**Layer**: Design Token  
**Severity**: Medium  
**Priority**: P2  
**Category**: Value Mismatch

**Description**: Search dropdown uses light theme styling (white background, light borders) that doesn't match dark industrial theme.

**Current State**:
```css
background: white !important;
border: 1px solid var(--color-border, #ccc) !important;
```

**Desired State**:
```css
background: var(--color-bg-surface) !important;
border: 1px solid var(--color-border-primary) !important;
```

**Impact**:
- **Visual Impact**: Medium - Inconsistent with dark theme
- **User Impact**: Low - Functional but visually inconsistent
- **Consistency Impact**: High - Breaks dark theme consistency

**Root Cause**: Legacy light theme styling.

**Recommendation**: Update to use dark theme tokens.

**Effort Estimate**: Small (10-15 minutes)  
**Dependencies**: None

**Code References**:
- Current: `frontend/src/styles/pages/home.css:74-75`
- Should be: Use dark theme tokens

---

### Gap 18: Missing Responsive Combined Layout Pattern

**Layer**: Visual Pattern  
**Severity**: Low  
**Priority**: P3  
**Category**: Missing Pattern

**Description**: Design intent specifies combined layouts for volumetric indicators and featured entities (side-by-side on landscape, alternating on portrait), but this pattern is not implemented.

**Current State**: No combined layout pattern.

**Desired State**: Responsive combined layout:
- Desktop/Landscape: Side-by-side volumetric indicators and featured entities
- Mobile/Portrait: Alternating sections

**Impact**:
- **Visual Impact**: Low - Layout optimization
- **User Impact**: Low - Space efficiency
- **Consistency Impact**: Low - Design intent not realized

**Root Cause**: Pattern not yet implemented (documented as "To be implemented").

**Recommendation**: Implement responsive combined layout pattern.

**Effort Estimate**: Medium (2-3 hours)  
**Dependencies**: 
- VolumetricIndicators section
- FeaturedEntitiesSection

**Code References**:
- Current: Not implemented
- Should be: Responsive layout in Home.tsx

---

## Cross-Layer Impact Analysis

### Token → Component Impact

| Gap | Token Impact | Component Impact | Pattern Impact |
|-----|--------------|------------------|----------------|
| Gap 1: Light theme fallbacks | High - Inconsistent colors | Medium - Components may look wrong | Medium - Visual inconsistency |
| Gap 2: Missing CSS variables | High - Variables don't exist | High - Components can't use tokens | Medium - Styling inconsistent |
| Gap 3: Hardcoded spacing | Medium - Spacing inconsistent | Low - Layout works but inconsistent | Low - Minor visual impact |
| Gap 4: Hardcoded typography | Medium - Typography inconsistent | Medium - Typography doesn't match | Low - Minor visual impact |
| Gap 5: Missing factory signage | High - Typography wrong | High - Brand identity missing | Medium - Aesthetic missing |

### Component → Pattern Impact

| Gap | Component Impact | Pattern Impact |
|-----|------------------|----------------|
| Gap 7: Missing FileteSign | Critical - Hero missing | High - Progressive reveal can't work |
| Gap 8: Missing FloatingHeader | High - Navigation missing | Medium - Navigation pattern missing |
| Gap 9: Missing sticky search | Medium - Search layout wrong | High - Sticky pattern missing |
| Gap 11: Missing volumetric indicators | Medium - Section missing | Low - Pattern can't be combined |
| Gap 12: Missing featured entities | Medium - Sections missing | Low - Pattern can't be combined |

## Prioritized Gap List

### P0 - Critical (Fix Immediately)

1. **Gap 1: Legacy CSS Variables with Light Theme Fallbacks** - Breaks visual consistency
2. **Gap 6: Max-Width Container Constraint** - Layout doesn't match design intent
3. **Gap 7: Missing FileteSign Component** - Missing key visual element

### P1 - High (Fix in Next Sprint)

4. **Gap 2: Missing CSS Variables in Design System** - Variables don't exist
5. **Gap 3: Hardcoded Spacing Values** - Breaks design system consistency
6. **Gap 4: Hardcoded Typography Values** - Breaks typography system
7. **Gap 5: Missing Factory Signage Typography** - Missing brand identity
8. **Gap 8: Missing FloatingHeader Component** - Navigation not always accessible
9. **Gap 9: Missing Full-Width Sticky Search Bar** - Layout doesn't match design intent

### P2 - Medium (Fix in Next Quarter)

10. **Gap 10: Missing Featured Fabrica Placeholder** - Design intent not realized
11. **Gap 11: Missing Volumetric Indicators Section** - Missing data awareness
12. **Gap 12: Missing Featured Entities Section** - Limited content discovery
13. **Gap 13: Missing Progressive Reveal Pattern** - Visual metaphor missing
14. **Gap 17: Search Dropdown Light Theme Styling** - Inconsistent with dark theme

### P3 - Low (Fix When Convenient)

15. **Gap 14: Missing Filete Decoration Pattern** - Decorative element
16. **Gap 15: Hardcoded Border Radius Values** - Minor inconsistency
17. **Gap 16: Hardcoded Transition Values** - Minor inconsistency
18. **Gap 18: Missing Responsive Combined Layout Pattern** - Layout optimization

## Recommendations

### Immediate Actions (P0 - This Week)

1. **Fix Light Theme Fallbacks** (Gap 1)
   - Remove fallback values from `--color-text-primary` and `--color-text-secondary`
   - Update all instances in `home.css`

2. **Remove Max-Width Constraint** (Gap 6)
   - Change `.home-page` to full-width layout
   - Update padding to use spacing tokens

3. **Plan FileteSign Implementation** (Gap 7)
   - Gather Filete decoration assets
   - Create component structure
   - Plan scroll behavior implementation

### Short-term Actions (P1 - Next Sprint)

4. **Create Missing CSS Variables** (Gap 2)
   - Add `--color-error-bg` to design system (or use existing token)
   - Create `--color-primary-dark` or use existing hover token
   - Update all references to use design system tokens

5. **Migrate Spacing to Tokens** (Gap 3)
   - Replace all hardcoded spacing with tokens
   - Create larger spacing token if needed (3rem)

6. **Migrate Typography to Tokens** (Gap 4)
   - Replace hardcoded font sizes with typography tokens
   - Map sizes to closest design system tokens

7. **Add Factory Signage Typography** (Gap 5)
   - Update hero title to use `--font-family-signage`
   - Update section titles to use factory signage font

8. **Implement FloatingHeader** (Gap 8)
   - Create component with semi-transparent background
   - Add factory signage buttons
   - Implement fixed positioning

9. **Update Search Bar to Full-Width Sticky** (Gap 9)
   - Remove max-width constraint
   - Add sticky positioning
   - Update styling

### Long-term Actions (P2-P3 - Next Quarter)

10. **Implement Missing Components** (Gaps 10-12)
    - FeaturedFabricaPlaceholder
    - VolumetricIndicators section
    - FeaturedEntitiesSection with 6 subsections

11. **Implement Visual Patterns** (Gaps 13-14, 18)
    - Progressive reveal pattern
    - Filete decoration pattern
    - Responsive combined layout pattern

12. **Polish Token Usage** (Gaps 15-16, 17)
    - Replace hardcoded border radius
    - Replace hardcoded transitions
    - Update search dropdown to dark theme

## Refactoring Roadmap

### Phase 1: Foundation (Week 1)
- Fix P0 gaps (light theme fallbacks, max-width, plan FileteSign)
- Create missing CSS variables
- Migrate spacing and typography to tokens

### Phase 2: Typography & Layout (Week 2)
- Add factory signage typography
- Update search bar to full-width sticky
- Remove max-width constraints

### Phase 3: Components (Weeks 3-4)
- Implement FloatingHeader component
- Implement FileteSign component
- Implement FeaturedFabricaPlaceholder

### Phase 4: Content Sections (Weeks 5-6)
- Implement VolumetricIndicators section
- Implement FeaturedEntitiesSection with 6 subsections

### Phase 5: Patterns & Polish (Weeks 7-8)
- Implement progressive reveal pattern
- Implement Filete decoration pattern
- Implement responsive combined layout
- Polish token usage (border radius, transitions, dark theme)

## Next Steps

1. [ ] Review gap analysis with stakeholders
2. [ ] Prioritize gaps (if adjustments needed)
3. [ ] Create refactoring tasks (use PLAYBOOK_04)
4. [ ] Begin addressing P0 gaps immediately
5. [ ] Schedule P1 gaps for next sprint
6. [ ] Plan P2-P3 gaps for next quarter

## Change History

| Version | Date       | Change                    | Author      |
| ------- | ---------- | ------------------------- | ----------- |
| 1.0     | 2025-11-26 | Initial gap analysis      | AI Assistant |


