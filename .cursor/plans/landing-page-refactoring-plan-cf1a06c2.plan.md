<!-- cf1a06c2-cfde-4395-a5ba-eb0a38a7cd56 430b01e7-d5d1-4938-a932-e29005cfb6e1 -->
# Refactoring Plan: Landing Page Design System Alignment

**Date Created**: 2025-11-26

**Planner**: AI Assistant

**Target Completion**: Phased approach (8-10 weeks)

**Based On**: Gap Analysis Report (landing-page-layout-gap-analysis-2025-11-26.md)

## Overview

- **Total Tasks**: 18
- **Estimated Effort**: ~60-90 hours
- **Priority Breakdown**:
  - P0: 3 tasks (critical foundation)
  - P1: 6 tasks (high priority consistency)
  - P2: 5 tasks (medium priority features)
  - P3: 4 tasks (low priority polish)

## Phase 1: Critical Foundation (P0) - Week 1

**Goal**: Fix critical gaps that break visual consistency and design intent

### Task 1: Remove Light Theme Fallbacks

**Gap ID**: GAP-001

**Priority**: P0

**Design System Area**: Design Tokens

**Effort**: Small (15-30 minutes)

**Description**: Remove light theme fallback values from `--color-text-primary` and `--color-text-secondary` CSS variables in `home.css`.

**Scope**:

- **In Scope**: Remove fallback values (`#333`, `#666`) from color variable declarations
- **Out of Scope**: Other color variable updates (handled in Task 2)
- **Deferred**: None

**Current State**:

- `home.css:16,21,96,114` uses `var(--color-text-primary, #333)` and `var(--color-text-secondary, #666)`

**Desired State**:

- Use `var(--color-text-primary)` and `var(--color-text-secondary)` without fallbacks

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Remove `, #333` fallback from line 16
3. Remove `, #666` fallback from line 21
4. Remove `, #333` fallback from line 96
5. Remove `, #666` fallback from line 114
6. Verify tokens load correctly in browser

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Remove fallback values from 4 locations

**Dependencies**: None

**Risks**:

- **Technical Risk**: Low - Tokens exist in design system
- **Visual Risk**: Low - Only removes incorrect fallbacks
- **Timeline Risk**: Low - Simple find/replace

**Acceptance Criteria**:

- [ ] No light theme fallback values remain in `home.css`
- [ ] Text colors use design system dark theme values
- [ ] Visual appearance matches dark industrial theme

---

### Task 2: Remove Max-Width Container Constraint

**Gap ID**: GAP-006

**Priority**: P0

**Design System Area**: Visual Pattern

**Effort**: Small (10-15 minutes)

**Description**: Change `.home-page` from centered max-width container to full-width layout per design intent.

**Scope**:

- **In Scope**: Remove max-width and center alignment, update padding to use spacing tokens
- **Out of Scope**: Other layout changes (handled in other tasks)
- **Deferred**: None

**Current State**:

- `home.css:2-4` uses `max-width: 1200px; margin: 0 auto; padding: 2rem 1rem;`

**Desired State**:

- `width: 100%; padding: var(--spacing-xl) var(--spacing-md);`

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Remove `max-width: 1200px;` from `.home-page`
3. Remove `margin: 0 auto;` from `.home-page`
4. Replace `padding: 2rem 1rem;` with `padding: var(--spacing-xl) var(--spacing-md);`
5. Verify full-width layout in browser

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Update `.home-page` container styles

**Dependencies**: None

**Risks**:

- **Technical Risk**: Low - Simple CSS change
- **Visual Risk**: Medium - Layout will change, may need responsive adjustments
- **Timeline Risk**: Low - Quick change

**Acceptance Criteria**:

- [ ] Page uses full-width layout
- [ ] No max-width constraint
- [ ] Padding uses spacing tokens
- [ ] Responsive behavior maintained

---

### Task 3: Plan FileteSign Component Implementation

**Gap ID**: GAP-007

**Priority**: P0

**Design System Area**: Component

**Effort**: Large (8-12 hours) - Planning phase only

**Description**: Create implementation plan and gather requirements for FileteSign component (hero section welcome sign with Filete decorations).

**Scope**:

- **In Scope**: Component structure, scroll behavior, asset requirements, integration points
- **Out of Scope**: Actual implementation (deferred to Phase 3)
- **Deferred**: Filete decoration assets creation, full component implementation

**Current State**: Simple title/subtitle in hero section (`Home.tsx:59-63`)

**Desired State**: FileteSign component with decorative wooden sign, colorful Filete borders, factory signage typography, scroll-based fade-out

**Implementation Steps**:

1. Review FileteSign component documentation (`docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md`)
2. Identify Filete decoration asset requirements (SVG or CSS)
3. Design component structure and props interface
4. Plan scroll detection and fade-out animation approach
5. Identify integration point in `Home.tsx`
6. Document asset requirements and dependencies

**Files to Create/Modify**:

- Create: Component plan document (optional)
- Future: `frontend/src/components/composite/FileteSign.tsx`
- Future: `frontend/src/styles/components/filete-sign.css`
- Future: Update `frontend/src/pages/Home.tsx` to use FileteSign

**Dependencies**:

- Filete decoration assets/SVG
- Scroll behavior implementation
- Typography tokens (available)

**Risks**:

- **Technical Risk**: Medium - Complex component with animations
- **Visual Risk**: High - Key visual element, must match design intent
- **Timeline Risk**: Medium - Asset creation may take time

**Acceptance Criteria**:

- [ ] Component structure planned
- [ ] Asset requirements documented
- [ ] Scroll behavior approach defined
- [ ] Integration points identified
- [ ] Ready for implementation in Phase 3

---

## Phase 2: High Priority Consistency (P1) - Weeks 2-3

**Goal**: Fix high priority gaps that break design system consistency

### Task 4: Replace Missing CSS Variables

**Gap ID**: GAP-002

**Priority**: P1

**Design System Area**: Design Tokens

**Effort**: Small (30-45 minutes)

**Description**: Replace legacy CSS variables with design system tokens or create missing tokens.

**Scope**:

- **In Scope**: Replace `--color-border`, `--color-primary`, `--color-primary-dark`, `--color-error-bg` with design system tokens
- **Out of Scope**: Other token migrations (handled in other tasks)
- **Deferred**: Creating new tokens if alternatives exist

**Current State**:

- `home.css:41,48,54,63,75,119` uses non-existent variables: `--color-border`, `--color-primary`, `--color-primary-dark`, `--color-error-bg`

**Desired State**:

- Use `--color-border-primary`, `--color-accent-primary`, existing hover tokens, `--color-bg-surface` or create new tokens

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Replace `var(--color-border, #ddd)` with `var(--color-border-primary)` (line 41, 75)
3. Replace `var(--color-primary, #007bff)` with `var(--color-accent-primary)` (lines 48, 54)
4. Replace `var(--color-primary-dark, #0056b3)` with `var(--color-accent-primary)` or create hover variant (line 63)
5. Replace `var(--color-error-bg, #ffebee)` with `var(--color-bg-surface)` or create error-bg token (line 119)
6. Verify all replacements work correctly

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Replace 6 variable references
- Optionally: `frontend/src/styles/theme/variables.css`: Add new tokens if needed

**Dependencies**: May need to create new tokens in design system

**Risks**:

- **Technical Risk**: Low - Variables exist or can be created
- **Visual Risk**: Medium - Color changes may affect appearance
- **Timeline Risk**: Low - Straightforward replacements

**Acceptance Criteria**:

- [ ] All legacy variables replaced with design system tokens
- [ ] No undefined CSS variables remain
- [ ] Visual appearance consistent with design system

---

### Task 5: Migrate Spacing to Design Tokens

**Gap ID**: GAP-003

**Priority**: P1

**Design System Area**: Design Tokens

**Effort**: Small (30-45 minutes)

**Description**: Replace all hardcoded spacing values (2rem, 3rem, 1rem, 0.5rem) with design system spacing tokens.

**Scope**:

- **In Scope**: Replace hardcoded rem values with spacing tokens in `home.css`
- **Out of Scope**: Spacing in other files (handled separately)
- **Deferred**: Creating larger spacing token for 3rem if needed

**Current State**:

- `home.css:4,10,23,34,87,112,127` uses hardcoded spacing: `2rem`, `3rem`, `1rem`, `0.5rem`

**Desired State**:

- Use `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl` tokens

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Map hardcoded values to tokens:

   - `2rem` (32px) → `var(--spacing-xl)`
   - `3rem` (48px) → `var(--spacing-xl)` or create larger token
   - `1rem` (16px) → `var(--spacing-md)`
   - `0.5rem` (8px) → `var(--spacing-sm)`

3. Replace all instances
4. Verify spacing looks correct

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Replace spacing values in 7 locations

**Dependencies**: None (tokens exist)

**Risks**:

- **Technical Risk**: Low - Tokens exist
- **Visual Risk**: Low - Spacing should match closely
- **Timeline Risk**: Low - Systematic replacement

**Acceptance Criteria**:

- [ ] All hardcoded spacing replaced with tokens
- [ ] Visual spacing maintained
- [ ] Design system consistency achieved

---

### Task 6: Migrate Typography to Design Tokens

**Gap ID**: GAP-004

**Priority**: P1

**Design System Area**: Design Tokens

**Effort**: Small (20-30 minutes)

**Description**: Replace hardcoded font sizes with typography tokens.

**Scope**:

- **In Scope**: Replace hardcoded font sizes in `home.css`
- **Out of Scope**: Typography in other files, font-family changes (handled in Task 7)
- **Deferred**: None

**Current State**:

- `home.css:14,20,91,131,134,139` uses hardcoded sizes: `2.5rem`, `1.25rem`, `2rem`, `1.1rem`, `1.75rem`, `1.5rem`

**Desired State**:

- Use typography tokens: `--font-size-h1`, `--font-size-h2`, `--font-size-h3`, `--font-size-h4`, `--font-size-body`, `--font-size-body-large`

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Map sizes to tokens:

   - `2.5rem` → `var(--font-size-h1)` or `var(--font-size-display)`
   - `1.25rem` → `var(--font-size-h5)` or `var(--font-size-body-large)`
   - `2rem` → `var(--font-size-h2)`
   - `1.1rem` → `var(--font-size-body)`
   - `1.75rem` → `var(--font-size-h3)`
   - `1.5rem` → `var(--font-size-h4)`

3. Replace all instances
4. Verify typography scale

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Replace font sizes in 6 locations

**Dependencies**: None (tokens exist)

**Risks**:

- **Technical Risk**: Low - Tokens exist
- **Visual Risk**: Medium - Typography scale may change slightly
- **Timeline Risk**: Low - Systematic replacement

**Acceptance Criteria**:

- [ ] All hardcoded font sizes replaced with tokens
- [ ] Typography scale consistent with design system
- [ ] Responsive breakpoints maintain proper sizing

---

### Task 7: Add Factory Signage Typography

**Gap ID**: GAP-005

**Priority**: P1

**Design System Area**: Design Tokens + Component

**Effort**: Small (15-20 minutes)

**Description**: Update headings and titles to use factory signage typography (`--font-family-signage`).

**Scope**:

- **In Scope**: Add factory signage font to hero title and section titles
- **Out of Scope**: Body text typography, navigation buttons (handled separately)
- **Deferred**: None

**Current State**: Uses default/system fonts for all text

**Desired State**: Use `--font-family-signage` for hero title (h1) and section titles (h2)

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Add `font-family: var(--font-family-signage);` to `.home-page__hero h1` (line 13)
3. Add `font-family: var(--font-family-signage);` to `.home-page__section-title` (line 90)
4. Verify factory signage font loads and displays correctly

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Add font-family to 2 selectors

**Dependencies**: None (token exists)

**Risks**:

- **Technical Risk**: Low - Token exists
- **Visual Impact**: High - Brand identity improvement
- **Timeline Risk**: Low - Simple addition

**Acceptance Criteria**:

- [ ] Hero title uses factory signage font
- [ ] Section titles use factory signage font
- [ ] Font loads correctly in browser
- [ ] Brand identity enhanced

---

### Task 8: Implement FloatingHeader Component

**Gap ID**: GAP-008

**Priority**: P1

**Design System Area**: Component

**Effort**: Medium (4-6 hours)

**Description**: Implement FloatingHeader component with semi-transparent background, fixed positioning, and factory signage buttons.

**Scope**:

- **In Scope**: Component implementation, styling, navigation buttons, fixed positioning
- **Out of Scope**: Advanced Search and Login page implementations (handled separately)
- **Deferred**: User authentication state handling (if not available)

**Current State**: No floating header navigation

**Desired State**: FloatingHeader component with semi-transparent background, fixed positioning, factory signage buttons for Advanced Search and Login

**Implementation Steps**:

1. Review FloatingHeader documentation (`docs/2_frontend_ui-design-system/03_components/composite/floating-header.md`)
2. Create `frontend/src/components/composite/FloatingHeader.tsx`
3. Create `frontend/src/styles/components/floating-header.css`
4. Implement semi-transparent background with backdrop blur
5. Add factory signage styled buttons
6. Implement fixed positioning
7. Add to `Home.tsx` layout
8. Test responsive behavior

**Files to Create/Modify**:

- Create: `frontend/src/components/composite/FloatingHeader.tsx`
- Create: `frontend/src/styles/components/floating-header.css`
- Modify: `frontend/src/pages/Home.tsx` to include FloatingHeader

**Dependencies**:

- Button component with factory signage styling (may need to create)
- Navigation routes (should exist)

**Risks**:

- **Technical Risk**: Medium - Component complexity, positioning
- **Visual Risk**: Medium - Must match design intent
- **Timeline Risk**: Medium - 4-6 hours estimated

**Acceptance Criteria**:

- [ ] FloatingHeader component implemented
- [ ] Semi-transparent background with backdrop blur
- [ ] Factory signage buttons styled correctly
- [ ] Fixed positioning works correctly
- [ ] Responsive behavior tested

---

### Task 9: Update Search Bar to Full-Width Sticky

**Gap ID**: GAP-009

**Priority**: P1

**Design System Area**: Component + Visual Pattern

**Effort**: Medium (2-3 hours)

**Description**: Update search bar from centered max-width to full-width with sticky positioning.

**Scope**:

- **In Scope**: Remove max-width constraint, add sticky positioning, update styling
- **Out of Scope**: Search functionality changes, dropdown styling (handled in Task 17)
- **Deferred**: None

**Current State**:

- `home.css:25-29` uses `max-width: 600px; margin: 0 auto; position: relative;`

**Desired State**: Full-width search bar with sticky positioning

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Remove `max-width: 600px;` from `.home-page__search-bar`
3. Remove `margin: 0 auto;` from `.home-page__search-bar`
4. Change `position: relative;` to `position: sticky;`
5. Add `top: 0;` and appropriate z-index
6. Update padding/spacing to use tokens
7. Test sticky behavior on scroll

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Update `.home-page__search-bar` styles

**Dependencies**: None

**Risks**:

- **Technical Risk**: Medium - Sticky positioning can be tricky
- **Visual Risk**: Medium - Layout change, may need responsive adjustments
- **Timeline Risk**: Low - 2-3 hours estimated

**Acceptance Criteria**:

- [ ] Search bar is full-width
- [ ] Sticky positioning works on scroll
- [ ] Visual appearance matches design intent
- [ ] Responsive behavior maintained

---

## Phase 3: Medium Priority Features (P2) - Weeks 4-6

**Goal**: Implement missing components and patterns

### Task 10: Implement FeaturedFabricaPlaceholder Component

**Gap ID**: GAP-010

**Priority**: P2

**Design System Area**: Component

**Effort**: Small (1-2 hours)

**Description**: Create placeholder component for future Featured Fabrica with 16:9 aspect ratio and message.

**Scope**:

- **In Scope**: Component with 16:9 aspect ratio, full-width, placeholder message
- **Out of Scope**: Actual Featured Fabrica content (future feature)
- **Deferred**: None

**Current State**: No placeholder component

**Desired State**: Placeholder component with 16:9 aspect ratio, full page width, "PROXIMAMENTE VEA AQUI LA FABRICA MAS RECIENTE" message

**Implementation Steps**:

1. Create `frontend/src/components/composite/FeaturedFabricaPlaceholder.tsx`
2. Create `frontend/src/styles/components/featured-fabrica-placeholder.css`
3. Implement 16:9 aspect ratio container
4. Add placeholder message with factory signage typography
5. Add to `Home.tsx` layout
6. Test responsive behavior

**Files to Create/Modify**:

- Create: `frontend/src/components/composite/FeaturedFabricaPlaceholder.tsx`
- Create: `frontend/src/styles/components/featured-fabrica-placeholder.css`
- Modify: `frontend/src/pages/Home.tsx` to include placeholder

**Dependencies**: None

**Risks**:

- **Technical Risk**: Low - Simple component
- **Visual Risk**: Low - Placeholder, not critical
- **Timeline Risk**: Low - 1-2 hours estimated

**Acceptance Criteria**:

- [ ] Placeholder component implemented
- [ ] 16:9 aspect ratio maintained
- [ ] Full-width layout
- [ ] Placeholder message displayed

---

### Task 11: Implement VolumetricIndicators Section

**Gap ID**: GAP-011

**Priority**: P2

**Design System Area**: Component

**Effort**: Medium (3-4 hours)

**Description**: Create section displaying entity counts using WarningLabel components.

**Scope**:

- **In Scope**: Section with 6 WarningLabel components showing entity counts
- **Out of Scope**: API endpoint creation (assume exists or create separately)
- **Deferred**: None

**Current State**: No volumetric indicators section

**Desired State**: Section with 6 WarningLabel components showing: Fabricas, Jingles, Canciones, Proveedores, Jingleros, Temáticas counts

**Implementation Steps**:

1. Create `frontend/src/components/sections/VolumetricIndicators.tsx` or add to `Home.tsx`
2. Create API calls or hooks to fetch entity counts
3. Implement special counts for Proveedores (Artistas with AUTOR_DE) and Jingleros (Artistas with JINGLERO_DE)
4. Use WarningLabel component for each count
5. Add styling with spacing tokens
6. Add to `Home.tsx` layout
7. Test loading and error states

**Files to Create/Modify**:

- Create: `frontend/src/components/sections/VolumetricIndicators.tsx` (or add to Home.tsx)
- Create: `frontend/src/styles/sections/volumetric-indicators.css` (optional)
- Modify: `frontend/src/pages/Home.tsx` to include section

**Dependencies**:

- WarningLabel component (exists)
- API endpoints for entity counts (may need to create)

**Risks**:

- **Technical Risk**: Medium - API integration, special count logic
- **Visual Risk**: Low - Using existing component
- **Timeline Risk**: Medium - 3-4 hours estimated

**Acceptance Criteria**:

- [ ] VolumetricIndicators section implemented
- [ ] 6 WarningLabel components display counts
- [ ] Special counts for Proveedores/Jingleros work correctly
- [ ] Loading and error states handled

---

### Task 12: Implement FeaturedEntitiesSection

**Gap ID**: GAP-012

**Priority**: P2

**Design System Area**: Component

**Effort**: Large (6-8 hours)

**Description**: Expand Featured Fabricas section to include 6 subsections with 5 entities each.

**Scope**:

- **In Scope**: 6 subsections (Fabricas, Canciones, Proveedores, Jingleros, Jingles, Temáticas) with 5 entities each
- **Out of Scope**: API endpoint creation (assume exists or create separately)
- **Deferred**: None

**Current State**: Only Featured Fabricas section (6 entities) in `Home.tsx:85-106`

**Desired State**: 6 subsections with 5 entities each using EntityCard component

**Implementation Steps**:

1. Refactor existing Featured Fabricas section into reusable component
2. Create `frontend/src/components/sections/FeaturedEntitiesSection.tsx`
3. Implement 6 entity type sections (Fabricas, Canciones, Proveedores, Jingleros, Jingles, Temáticas)
4. Create API calls or hooks for each entity type
5. Use EntityCard component for each entity
6. Implement sorting logic (recency or popularity)
7. Add styling with spacing tokens
8. Update `Home.tsx` to use new component
9. Test all sections load correctly

**Files to Create/Modify**:

- Create: `frontend/src/components/sections/FeaturedEntitiesSection.tsx`
- Create: `frontend/src/styles/sections/featured-entities-section.css` (optional)
- Modify: `frontend/src/pages/Home.tsx` to use new component

**Dependencies**:

- EntityCard component (exists)
- API endpoints for featured entities (may need to create)

**Risks**:

- **Technical Risk**: High - Multiple API calls, complex component
- **Visual Risk**: Medium - Layout consistency important
- **Timeline Risk**: High - 6-8 hours estimated

**Acceptance Criteria**:

- [ ] FeaturedEntitiesSection component implemented
- [ ] 6 subsections display 5 entities each
- [ ] EntityCard component used consistently
- [ ] Sorting logic works correctly
- [ ] Loading and error states handled

---

### Task 13: Implement Progressive Reveal Pattern

**Gap ID**: GAP-013

**Priority**: P2

**Design System Area**: Visual Pattern

**Effort**: Medium (3-4 hours)

**Description**: Implement scroll-based progressive reveal pattern with Filete sign fade-out.

**Scope**:

- **In Scope**: Scroll detection, Filete sign fade-out animation, progressive content reveal
- **Out of Scope**: Filete sign component implementation (handled in Task 3/Phase 3)
- **Deferred**: None (but depends on FileteSign)

**Current State**: Static layout, no progressive reveal

**Desired State**: Progressive reveal as user scrolls - Filete sign fades out, content sections reveal progressively

**Implementation Steps**:

1. Create scroll detection hook or utility
2. Implement fade-out animation for FileteSign component
3. Add progressive reveal animations for content sections
4. Use CSS transitions or animations
5. Test scroll behavior and performance
6. Ensure smooth animations

**Files to Create/Modify**:

- Create: `frontend/src/hooks/useScrollDetection.ts` (or similar)
- Modify: `frontend/src/components/composite/FileteSign.tsx` (when implemented)
- Modify: `frontend/src/pages/Home.tsx` to integrate scroll behavior
- Create: `frontend/src/styles/patterns/progressive-reveal.css` (optional)

**Dependencies**:

- FileteSign component (Task 3)
- Scroll detection logic

**Risks**:

- **Technical Risk**: Medium - Scroll detection, animation performance
- **Visual Risk**: Medium - Must be smooth and performant
- **Timeline Risk**: Medium - 3-4 hours estimated

**Acceptance Criteria**:

- [ ] Scroll detection works correctly
- [ ] Filete sign fades out on scroll
- [ ] Content sections reveal progressively
- [ ] Animations are smooth and performant

---

### Task 14: Update Search Dropdown to Dark Theme

**Gap ID**: GAP-017

**Priority**: P2

**Design System Area**: Design Tokens

**Effort**: Small (10-15 minutes)

**Description**: Update search dropdown styling from light theme to dark industrial theme.

**Scope**:

- **In Scope**: Update background and border colors in search dropdown styles
- **Out of Scope**: Search functionality changes
- **Deferred**: None

**Current State**:

- `home.css:74-75` uses `background: white !important;` and light border

**Desired State**:

- Use `var(--color-bg-surface)` and `var(--color-border-primary)`

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Replace `background: white !important;` with `background: var(--color-bg-surface) !important;` (line 74)
3. Replace `border: 1px solid var(--color-border, #ccc) !important;` with `border: 1px solid var(--color-border-primary) !important;` (line 75)
4. Verify dropdown matches dark theme

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Update dropdown styles

**Dependencies**: None

**Risks**:

- **Technical Risk**: Low - Simple color replacement
- **Visual Risk**: Low - Should improve consistency
- **Timeline Risk**: Low - 10-15 minutes

**Acceptance Criteria**:

- [ ] Search dropdown uses dark theme colors
- [ ] Consistent with design system
- [ ] Readability maintained

---

## Phase 4: Low Priority Polish (P3) - Weeks 7-8

**Goal**: Polish token usage and implement remaining patterns

### Task 15: Replace Hardcoded Border Radius

**Gap ID**: GAP-015

**Priority**: P3

**Design System Area**: Design Tokens

**Effort**: Small (10-15 minutes)

**Description**: Replace hardcoded border-radius values with design system tokens.

**Scope**:

- **In Scope**: Replace `4px` border-radius with `--border-radius-sm` token
- **Out of Scope**: Other border-radius values
- **Deferred**: None

**Current State**:

- `home.css:42,57,76,120` uses `border-radius: 4px;`

**Desired State**:

- Use `border-radius: var(--border-radius-sm);`

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Replace `border-radius: 4px;` with `border-radius: var(--border-radius-sm);` in 4 locations
3. Verify visual appearance unchanged

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Replace border-radius in 4 locations

**Dependencies**: None (token exists)

**Risks**:

- **Technical Risk**: Low - Token exists, value matches
- **Visual Risk**: Low - No visual change expected
- **Timeline Risk**: Low - 10-15 minutes

**Acceptance Criteria**:

- [ ] All hardcoded border-radius replaced with token
- [ ] Visual appearance unchanged
- [ ] Design system consistency achieved

---

### Task 16: Replace Hardcoded Transitions

**Gap ID**: GAP-016

**Priority**: P3

**Design System Area**: Design Tokens

**Effort**: Small (5-10 minutes)

**Description**: Replace hardcoded transition values with design system tokens.

**Scope**:

- **In Scope**: Replace `0.2s` transitions with `--transition-normal` token
- **Out of Scope**: Other transition values
- **Deferred**: None

**Current State**:

- `home.css:44,59` uses `transition: border-color 0.2s;` and `transition: background-color 0.2s;`

**Desired State**:

- Use `transition: border-color var(--transition-normal);` and `transition: background-color var(--transition-normal);`

**Implementation Steps**:

1. Open `frontend/src/styles/pages/home.css`
2. Replace `0.2s` with `var(--transition-normal)` in 2 locations
3. Verify transitions work correctly

**Files to Modify**:

- `frontend/src/styles/pages/home.css`: Replace transitions in 2 locations

**Dependencies**: None (token exists)

**Risks**:

- **Technical Risk**: Low - Token exists (250ms vs 200ms, close enough)
- **Visual Risk**: Low - Minimal timing difference
- **Timeline Risk**: Low - 5-10 minutes

**Acceptance Criteria**:

- [ ] All hardcoded transitions replaced with token
- [ ] Transitions work correctly
- [ ] Design system consistency achieved

---

### Task 17: Implement Filete Decoration Pattern

**Gap ID**: GAP-014

**Priority**: P3

**Design System Area**: Visual Pattern

**Effort**: Large (8-12 hours)

**Description**: Implement Filete decoration pattern (colorful borders, floral motifs) for FileteSign component.

**Scope**:

- **In Scope**: Filete decoration SVG or CSS implementation, colorful borders, floral motifs
- **Out of Scope**: FileteSign component structure (handled in Task 3)
- **Deferred**: None (but part of FileteSign implementation)

**Current State**: No Filete decorations

**Desired State**: Filete decorations with colorful borders (red, orange, yellow, green, blue, gold), floral and scrollwork motifs, vintage Argentine Filete style

**Implementation Steps**:

1. Research or create Filete decoration assets (SVG preferred)
2. Design decoration patterns (borders, floral motifs, scrollwork)
3. Implement decorations in FileteSign component
4. Use design system colors for decorative elements
5. Test visual appearance and performance
6. Ensure responsive behavior

**Files to Create/Modify**:

- Create: Filete decoration SVG assets (or CSS patterns)
- Modify: `frontend/src/components/composite/FileteSign.tsx` to include decorations
- Modify: `frontend/src/styles/components/filete-sign.css` for decoration styles

**Dependencies**:

- Filete decoration assets
- FileteSign component (Task 3)

**Risks**:

- **Technical Risk**: High - Complex decorative patterns
- **Visual Risk**: High - Key aesthetic element
- **Timeline Risk**: High - 8-12 hours estimated, asset creation may take time

**Acceptance Criteria**:

- [ ] Filete decorations implemented
- [ ] Colorful borders and motifs match design intent
- [ ] Vintage Argentine Filete style achieved
- [ ] Performance is acceptable

---

### Task 18: Implement Responsive Combined Layout Pattern

**Gap ID**: GAP-018

**Priority**: P3

**Design System Area**: Visual Pattern

**Effort**: Medium (2-3 hours)

**Description**: Implement responsive combined layout for volumetric indicators and featured entities (side-by-side on landscape, alternating on portrait).

**Scope**:

- **In Scope**: Responsive layout CSS, side-by-side desktop layout, alternating mobile layout
- **Out of Scope**: Component implementations (handled in Tasks 11-12)
- **Deferred**: None (but depends on Tasks 11-12)

**Current State**: No combined layout pattern

**Desired State**: Responsive combined layout - desktop/landscape: side-by-side, mobile/portrait: alternating sections

**Implementation Steps**:

1. Create responsive layout CSS for combined sections
2. Implement side-by-side layout for desktop/landscape
3. Implement alternating layout for mobile/portrait
4. Use CSS Grid or Flexbox
5. Test responsive breakpoints
6. Ensure proper spacing with tokens

**Files to Create/Modify**:

- Create: `frontend/src/styles/patterns/combined-layout.css` (or add to Home.css)
- Modify: `frontend/src/pages/Home.tsx` to use combined layout structure

**Dependencies**:

- VolumetricIndicators section (Task 11)
- FeaturedEntitiesSection (Task 12)

**Risks**:

- **Technical Risk**: Medium - Responsive layout complexity
- **Visual Risk**: Low - Layout optimization
- **Timeline Risk**: Low - 2-3 hours estimated

**Acceptance Criteria**:

- [ ] Responsive combined layout implemented
- [ ] Side-by-side layout on desktop/landscape
- [ ] Alternating layout on mobile/portrait
- [ ] Proper spacing and alignment

---

## Task Dependency Graph

```
Phase 1 (P0):
  Task 1 → (independent)
  Task 2 → (independent)
  Task 3 → (planning only, blocks Task 13, Task 17)

Phase 2 (P1):
  Task 4 → (independent)
  Task 5 → (independent)
  Task 6 → (independent)
  Task 7 → (independent)
  Task 8 → (independent)
  Task 9 → (independent)

Phase 3 (P2):
  Task 10 → (independent)
  Task 11 → (blocks Task 18)
  Task 12 → (blocks Task 18)
  Task 13 → (depends on Task 3)
  Task 14 → (independent)

Phase 4 (P3):
  Task 15 → (independent)
  Task 16 → (independent)
  Task 17 → (depends on Task 3)
  Task 18 → (depends on Task 11, Task 12)
```

## Risk Mitigation Plan

### High Risk Tasks

- **Task 3 (FileteSign Planning)**: 
  - Risk: Asset creation may be time-consuming
  - Mitigation: Start asset gathering early, consider CSS-based decorations as fallback

- **Task 12 (FeaturedEntitiesSection)**: 
  - Risk: Complex component with multiple API calls
  - Mitigation: Break into smaller sub-tasks, implement one section at a time, test incrementally

- **Task 17 (Filete Decoration Pattern)**: 
  - Risk: Complex decorative patterns, asset creation
  - Mitigation: Research existing Filete assets, consider simplified version first, iterate

### Medium Risk Tasks

- **Task 8 (FloatingHeader)**: 
  - Risk: Positioning and styling complexity
  - Mitigation: Use existing design system patterns, test across browsers

- **Task 9 (Sticky Search Bar)**: 
  - Risk: Sticky positioning can be tricky
  - Mitigation: Test on multiple browsers, consider fallback for older browsers

- **Task 13 (Progressive Reveal)**: 
  - Risk: Animation performance
  - Mitigation: Use CSS transforms for performance, test on lower-end devices

## Success Criteria

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] Design system validated (PLAYBOOK_02)
- [ ] No visual regressions introduced
- [ ] Code matches design system documentation
- [ ] All components use design tokens
- [ ] Responsive behavior maintained
- [ ] Performance acceptable

## Next Steps

1. [ ] Review plan with stakeholders
2. [ ] Get approval on priorities
3. [ ] Begin Phase 1 (P0 tasks)
4. [ ] Use PLAYBOOK_05 for implementation
5. [ ] Track progress using task tracking
6. [ ] Re-validate after each phase using PLAYBOOK_02

### To-dos

- [ ] Remove light theme fallbacks from color variables in home.css (GAP-001)
- [ ] Remove max-width container constraint, implement full-width layout (GAP-006)
- [ ] Plan FileteSign component implementation - structure, assets, scroll behavior (GAP-007)
- [ ] Replace missing CSS variables with design system tokens (GAP-002)
- [ ] Migrate hardcoded spacing values to design tokens (GAP-003)
- [ ] Migrate hardcoded typography values to design tokens (GAP-004)
- [ ] Add factory signage typography to headings and titles (GAP-005)
- [ ] Implement FloatingHeader component with semi-transparent background and factory signage buttons (GAP-008)
- [ ] Update search bar to full-width with sticky positioning (GAP-009)
- [ ] Implement FeaturedFabricaPlaceholder component with 16:9 aspect ratio (GAP-010)
- [ ] Implement VolumetricIndicators section with 6 WarningLabel components (GAP-011)
- [ ] Implement FeaturedEntitiesSection with 6 subsections (5 entities each) (GAP-012)
- [ ] Implement progressive reveal pattern with scroll-based animations (GAP-013)
- [ ] Update search dropdown to dark theme styling (GAP-017)
- [ ] Replace hardcoded border-radius values with design tokens (GAP-015)
- [ ] Replace hardcoded transition values with design tokens (GAP-016)
- [ ] Implement Filete decoration pattern with colorful borders and motifs (GAP-014)
- [ ] Implement responsive combined layout pattern for volumetric indicators and featured entities (GAP-018)