<!-- 9fd29770-8f00-4912-b997-c5aa0b56cbeb c0cea7de-71b3-43bf-8ea7-94b03e4ce97d -->
# Refactoring Plan: Design System Implementation

**Date Created**: 2025-11-24

**Planner**: AI Assistant

**Based On**: Design Philosophy Validation Report

**Target Completion**: TBD (phased approach)

## Overview

- **Total Tasks**: 12
- **Estimated Effort**: ~80-120 hours
- **Priority Breakdown**:
  - P0: 4 tasks (critical foundation)
  - P1: 3 tasks (high priority components)
  - P2: 3 tasks (medium priority enhancements)
  - P3: 2 tasks (low priority polish)

## Phase 1: Critical Foundation (P0)

**Goal**: Establish foundation for industrial aesthetic - migrate to design tokens and implement core typography

### Task 1: Migrate Base Styles to Design Tokens

**Gap ID**: Token Usage Gap

**Priority**: P0

**Design System Area**: Tokens

**Effort**: Medium (8-12 hours)

**Description**: Replace hardcoded colors and styles in base CSS files with design tokens to establish foundation for all components.

**Scope**:

- **In Scope**: 
  - Update `frontend/src/index.css` to use design tokens
  - Replace hardcoded colors with CSS variables
  - Update base typography to use token system
- **Out of Scope**: Component-specific migrations (handled in separate tasks)
- **Deferred**: Light theme support (dark theme only for now)

**Current State**:

- `index.css` uses hardcoded colors (`#242424`, `#646cff`, `#1a1a1a`)
- Base button styles use hardcoded values
- Typography uses default browser fonts

**Desired State**:

- All base styles reference design tokens
- Typography uses `--font-family-body` and sizing tokens
- Colors use `--color-*` variables

**Implementation Steps**:

1. Import `variables.css` in `index.css` or ensure it's loaded globally
2. Replace `background-color: #242424` with `var(--color-bg-secondary)`
3. Replace `color: rgba(255, 255, 255, 0.87)` with `var(--color-text-primary)`
4. Update button base styles to use `var(--color-bg-primary)`, `var(--color-accent-primary)`
5. Update typography to use `var(--font-family-body)`, `var(--font-size-*)`
6. Remove hardcoded color values

**Files to Modify**:

- `frontend/src/index.css`: Replace all hardcoded colors and fonts with tokens

**Dependencies**:

- **Blocks**: All component migration tasks
- **Blocked by**: None
- **Can run parallel with**: Task 2

**Risks**:

- **Technical Risk**: Breaking existing visual appearance
  - **Probability**: Medium
  - **Impact**: High
  - **Mitigation**: Test in development, use fallback values during transition
- **Visual Risk**: Unintended color changes
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Verify token values match current colors, test thoroughly

**Acceptance Criteria**:

- [ ] All colors in `index.css` use CSS variables
- [ ] Typography uses design tokens
- [ ] No hardcoded hex colors remain
- [ ] Visual appearance matches current state
- [ ] Design system validated

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] Manual testing completed

---

### Task 2: Load and Apply Factory Signage Typography

**Gap ID**: Typography Gap

**Priority**: P0

**Design System Area**: Typography

**Effort**: Small (4-6 hours)

**Description**: Load 'Bebas Neue' font and apply factory signage typography to headings and navigation elements.

**Scope**:

- **In Scope**: 
  - Load 'Bebas Neue' font (Google Fonts or local)
  - Create base heading styles using `--font-family-signage`
  - Apply to h1-h6 elements globally
- **Out of Scope**: Component-specific typography (handled per component)
- **Deferred**: Custom font file hosting (use Google Fonts initially)

**Current State**:

- Font token defined but not loaded
- Headings use default browser fonts
- No factory signage typography applied

**Desired State**:

- 'Bebas Neue' font loaded and available
- All headings use `--font-family-signage`
- Navigation buttons use factory signage style

**Implementation Steps**:

1. Add Google Fonts link or @import for 'Bebas Neue' in `index.html` or CSS
2. Create base heading styles in `index.css` or new `typography.css`
3. Apply `font-family: var(--font-family-signage)` to h1-h6
4. Add uppercase and letter-spacing for factory signage aesthetic
5. Test font loading and fallbacks

**Files to Modify**:

- `frontend/index.html`: Add Google Fonts link (or `frontend/src/index.css`: Add @import)
- `frontend/src/index.css`: Add heading typography styles
- Create `frontend/src/styles/theme/typography.css` (optional, for organization)

**Dependencies**:

- **Blocks**: Task 3 (button styles), Task 4 (component migrations)
- **Blocked by**: None
- **Can run parallel with**: Task 1

**Risks**:

- **Technical Risk**: Font loading delay causing FOUT
  - **Probability**: Medium
  - **Impact**: Low
  - **Mitigation**: Use font-display: swap, ensure fallback fonts are good
- **Visual Risk**: Typography changes affecting readability
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Test with real content, ensure adequate font sizes

**Acceptance Criteria**:

- [ ] 'Bebas Neue' font loads correctly
- [ ] All headings use factory signage typography
- [ ] Fallback fonts work if primary font fails
- [ ] Typography matches design philosophy
- [ ] No layout shifts on font load

**Validation**:

- [ ] Font loads correctly
- [ ] Typography applied to all headings
- [ ] Visual appearance verified

---

### Task 3: Migrate EntityCard Component to Design Tokens

**Gap ID**: Component Token Usage Gap

**Priority**: P0

**Design System Area**: Components

**Effort**: Medium (6-8 hours)

**Description**: Replace all hardcoded colors in EntityCard component and CSS with design tokens.

**Scope**:

- **In Scope**: 
  - Update `entity-card.css` to use CSS variables
  - Replace inline styles in `EntityCard.tsx` with CSS classes or CSS variables
  - Update button styles within EntityCard to use industrial colors
- **Out of Scope**: Creating new button component (handled separately)
- **Deferred**: Material texture implementation (Phase 2)

**Current State**:

- `entity-card.css` mixes CSS variables with hardcoded colors (`#1a1a1a`, `#fff`, `#333`)
- `EntityCard.tsx` has inline styles with hardcoded colors (`#1976d2`, `#4caf50`, `#666`)
- Buttons use Material Design colors

**Desired State**:

- All colors use design tokens
- Buttons use industrial accent colors (`--color-accent-primary`, etc.)
- Consistent with design philosophy

**Implementation Steps**:

1. Audit all hardcoded colors in `entity-card.css`
2. Replace with appropriate CSS variables:

   - `#1a1a1a` → `var(--color-bg-primary)`
   - `#fff` → `var(--color-text-primary)`
   - `#333` → `var(--color-bg-surface)`

3. Create CSS classes for button variants in `entity-card.css`
4. Replace inline button styles in `EntityCard.tsx` with CSS classes
5. Update button colors to use industrial accent colors
6. Test all EntityCard variants (heading, contents, placeholder)

**Files to Modify**:

- `frontend/src/styles/components/entity-card.css`: Replace hardcoded colors
- `frontend/src/components/common/EntityCard.tsx`: Replace inline styles with CSS classes

**Dependencies**:

- **Blocks**: Other component migrations
- **Blocked by**: Task 1 (base styles), Task 2 (typography)
- **Can run parallel with**: None (depends on foundation)

**Risks**:

- **Technical Risk**: Breaking EntityCard appearance
  - **Probability**: Medium
  - **Impact**: High (widely used component)
  - **Mitigation**: Test all variants, use feature branch, visual regression testing
- **Visual Risk**: Color changes affecting contrast/readability
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Verify token values provide adequate contrast

**Acceptance Criteria**:

- [ ] All EntityCard colors use CSS variables
- [ ] No hardcoded colors in component
- [ ] Buttons use industrial accent colors
- [ ] All variants render correctly
- [ ] Visual appearance matches or improves on current state

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] All EntityCard variants tested
- [ ] Design system validated

---

### Task 4: Create Base Button Component Styles

**Gap ID**: Button Component Gap

**Priority**: P0

**Design System Area**: Components

**Effort**: Medium (8-10 hours)

**Description**: Create industrial console-style button CSS classes based on button.md specification.

**Scope**:

- **In Scope**: 
  - Create `frontend/src/styles/components/button.css`
  - Implement all button variants (primary, secondary, tertiary, factory signage)
  - Implement all states (default, hover, active, focus, disabled)
  - Use design tokens throughout
- **Out of Scope**: React button component (CSS only)
- **Deferred**: Button component wrapper (can use classes directly)

**Current State**:

- No centralized button styles
- Buttons use inline styles or Material Design colors
- No industrial aesthetic

**Desired State**:

- Complete button CSS following `button.md` spec
- All variants and states implemented
- Uses factory signage typography and industrial colors

**Implementation Steps**:

1. Create `frontend/src/styles/components/button.css`
2. Implement primary button variant:

   - Background: `var(--color-accent-primary)`
   - Typography: `var(--font-family-signage)`
   - Shadow: `var(--shadow-md)`

3. Implement secondary, tertiary, factory signage variants
4. Implement all interactive states (hover, active, focus, disabled)
5. Add transitions using `var(--transition-*)`
6. Test all variants and states

**Files to Modify**:

- Create `frontend/src/styles/components/button.css`: New file with all button styles

**Dependencies**:

- **Blocks**: Task 5 (using buttons in components)
- **Blocked by**: Task 1 (base styles), Task 2 (typography)
- **Can run parallel with**: Task 3 (after foundation tasks)

**Risks**:

- **Technical Risk**: CSS specificity conflicts
  - **Probability**: Medium
  - **Impact**: Low
  - **Mitigation**: Use BEM naming, test with existing components
- **Visual Risk**: Buttons not matching design spec
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Follow `button.md` spec exactly, test visually

**Acceptance Criteria**:

- [ ] All button variants implemented
- [ ] All states implemented
- [ ] Uses design tokens throughout
- [ ] Matches `button.md` specification
- [ ] Factory signage typography applied

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance matches spec
- [ ] All variants and states tested
- [ ] Design system validated

---

## Phase 2: High Priority Components (P1)

**Goal**: Implement missing core components for industrial aesthetic

### Task 5: Build Filter Switch Component

**Gap ID**: Filter Switch Gap

**Priority**: P1

**Design System Area**: Components

**Effort**: Medium (10-12 hours)

**Description**: Create industrial console-style boolean filter switch component based on `filter-switch.md` specification.

**Scope**:

- **In Scope**: 
  - Create `frontend/src/styles/components/filter-switch.css`
  - Create React component `frontend/src/components/common/FilterSwitch.tsx`
  - Replace checkboxes in `EntityMetadataEditor.tsx` and `RelatedEntities.tsx`
  - Implement all sizes and states
- **Out of Scope**: Sound effects (Phase 3)
- **Deferred**: Animation refinements (can iterate)

**Current State**:

- Standard HTML checkboxes used
- No console-style switches
- Documentation exists but component not built

**Desired State**:

- Industrial console switch component
- Replaces checkboxes in admin components
- Matches `filter-switch.md` specification

**Implementation Steps**:

1. Create `frontend/src/styles/components/filter-switch.css` based on spec
2. Create `frontend/src/components/common/FilterSwitch.tsx`:

   - Props: `checked`, `onChange`, `label`, `size`, `disabled`, `ariaLabel`
   - Render track and handle elements
   - Apply CSS classes for states

3. Replace checkbox in `EntityMetadataEditor.tsx` (line 859-884)
4. Replace checkbox in `RelatedEntities.tsx` (line 2499-2515)
5. Test all sizes and states
6. Ensure accessibility (keyboard navigation, ARIA labels)

**Files to Modify**:

- Create `frontend/src/styles/components/filter-switch.css`: New file
- Create `frontend/src/components/common/FilterSwitch.tsx`: New component
- `frontend/src/components/admin/EntityMetadataEditor.tsx`: Replace checkbox
- `frontend/src/components/common/RelatedEntities.tsx`: Replace checkbox

**Dependencies**:

- **Blocks**: Task 6 (search interface uses switches)
- **Blocked by**: Task 1, Task 2, Task 4 (foundation)
- **Can run parallel with**: Task 7 (warning labels)

**Risks**:

- **Technical Risk**: Accessibility issues with custom switch
  - **Probability**: Medium
  - **Impact**: High
  - **Mitigation**: Follow ARIA patterns, test with screen readers, ensure keyboard navigation
- **Visual Risk**: Switch not feeling mechanical enough
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Follow spec exactly, iterate based on feedback

**Acceptance Criteria**:

- [ ] Filter switch component created
- [ ] All sizes implemented (small, medium, large)
- [ ] All states implemented (off, on, hover, focus, disabled)
- [ ] Replaces checkboxes in admin components
- [ ] Accessible (keyboard, screen reader)
- [ ] Matches `filter-switch.md` specification

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance matches spec
- [ ] Accessibility tested
- [ ] Design system validated

---

### Task 6: Implement Warning Label Component

**Gap ID**: Warning Label Gap

**Priority**: P1

**Design System Area**: Components

**Effort**: Small (4-6 hours)

**Description**: Create black octagon warning label component for stats reporting, matching Argentine food warning label aesthetic.

**Scope**:

- **In Scope**: 
  - Create `frontend/src/styles/components/warning-label.css`
  - Create React component `frontend/src/components/common/WarningLabel.tsx`
  - Add to `AdminDashboard.tsx` for entity counts
  - Implement octagon shape with black background, white text
- **Out of Scope**: Landing page stats (if not needed)
- **Deferred**: Animated counts (static for now)

**Current State**:

- No warning labels
- Entity counts displayed as plain text/numbers
- Tokens exist but unused

**Desired State**:

- Warning label component with octagon shape
- Used in AdminDashboard for entity counts
- Black background, white text, industrial aesthetic

**Implementation Steps**:

1. Create `frontend/src/styles/components/warning-label.css`:

   - Octagon shape using CSS clip-path or SVG
   - Background: `var(--color-warning-label-bg)` (black)
   - Text: `var(--color-warning-label-text)` (white)
   - Factory signage typography

2. Create `frontend/src/components/common/WarningLabel.tsx`:

   - Props: `value` (number), `label` (string)
   - Render octagon with value and label

3. Add to `AdminDashboard.tsx` entity counts section
4. Test visual appearance and readability

**Files to Modify**:

- Create `frontend/src/styles/components/warning-label.css`: New file
- Create `frontend/src/components/common/WarningLabel.tsx`: New component
- `frontend/src/pages/admin/AdminDashboard.tsx`: Add warning labels for entity counts

**Dependencies**:

- **Blocks**: None
- **Blocked by**: Task 1, Task 2 (foundation)
- **Can run parallel with**: Task 5 (filter switches)

**Risks**:

- **Technical Risk**: Octagon shape implementation complexity
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Use CSS clip-path or SVG, test cross-browser
- **Visual Risk**: Octagon not recognizable or too decorative
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Follow Argentine warning label reference, test with users

**Acceptance Criteria**:

- [ ] Warning label component created
- [ ] Octagon shape implemented
- [ ] Uses design tokens (`--color-warning-label-*`)
- [ ] Added to AdminDashboard entity counts
- [ ] Readable and accessible
- [ ] Matches design philosophy (literal black octagon)

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] Design system validated

---

### Task 7: Update SearchBar with Console Aesthetic

**Gap ID**: Search Interface Gap

**Priority**: P1

**Design System Area**: Components

**Effort**: Medium (8-10 hours)

**Description**: Redesign SearchBar component with industrial console aesthetic, using design tokens and preparing for filter switches.

**Scope**:

- **In Scope**: 
  - Update `SearchBar.tsx` styling to use design tokens
  - Apply industrial console aesthetic
  - Update CSS to use industrial colors and shadows
  - Prepare structure for filter switches (future enhancement)
- **Out of Scope**: Adding filter switches (can be separate task)
- **Deferred**: Sound effects on search

**Current State**:

- Standard web search input
- Uses Material Design colors
- No industrial aesthetic

**Desired State**:

- Console-like search interface
- Uses design tokens
- Industrial styling (metal panels, shadows)
- Ready for filter switches integration

**Implementation Steps**:

1. Update `SearchBar.tsx` to use CSS classes instead of inline styles
2. Create or update `frontend/src/styles/components/search-bar.css`:

   - Input: metal panel aesthetic (`--material-metal-control-bg`)
   - Shadows: `var(--shadow-md)` for depth
   - Borders: `var(--color-border-primary)`
   - Focus: `var(--shadow-glow-interactive)`

3. Update button to use industrial button styles (from Task 4)
4. Apply factory signage typography to labels
5. Test search functionality and visual appearance

**Files to Modify**:

- `frontend/src/components/search/SearchBar.tsx`: Update to use CSS classes
- Create/update `frontend/src/styles/components/search-bar.css`: Industrial styling

**Dependencies**:

- **Blocks**: None
- **Blocked by**: Task 1, Task 2, Task 4 (foundation and buttons)
- **Can run parallel with**: Task 6 (warning labels)

**Risks**:

- **Technical Risk**: Breaking search functionality
  - **Probability**: Low
  - **Impact**: High
  - **Mitigation**: Only change styling, test functionality thoroughly
- **Visual Risk**: Console aesthetic too heavy/overwhelming
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Balance aesthetic with usability, test with users

**Acceptance Criteria**:

- [ ] SearchBar uses design tokens
- [ ] Industrial console aesthetic applied
- [ ] Search functionality unchanged
- [ ] Visual appearance matches design philosophy
- [ ] Ready for filter switches integration

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] Search functionality tested
- [ ] Design system validated

---

## Phase 3: Medium Priority Enhancements (P2)

**Goal**: Add visual polish and missing visual elements

### Task 8: Implement Material Textures

**Gap ID**: Material Texture Gap

**Priority**: P2

**Design System Area**: Tokens/Patterns

**Effort**: Large (16-20 hours)

**Description**: Create CSS classes for concrete and metal textures with patina effects, applying to appropriate surfaces.

**Scope**:

- **In Scope**: 
  - Create texture utility classes in `frontend/src/styles/theme/materials.css`
  - Implement concrete texture (weathered, soiled)
  - Implement metal texture (clean, weathered)
  - Implement patina overlay effects
  - Apply to EntityCard and other surfaces
- **Out of Scope**: 3D effects or complex shaders
- **Deferred**: Advanced weathering patterns

**Current State**:

- Material tokens defined but no implementation
- Surfaces use flat colors
- No texture or patina effects

**Desired State**:

- CSS classes for material textures
- Applied to cards, panels, surfaces
- Patina effects showing age/use
- Matches design philosophy (weathered, soiled)

**Implementation Steps**:

1. Research CSS techniques for textures (background images, gradients, filters)
2. Create `frontend/src/styles/theme/materials.css`:

   - `.material-concrete-primary`: Weathered concrete texture
   - `.material-concrete-secondary`: Lighter concrete
   - `.material-metal-primary`: Clean metal
   - `.material-metal-weathered`: Weathered metal with patina
   - `.patina-light`, `.patina-medium`, `.patina-heavy`: Overlay effects

3. Apply to EntityCard surfaces
4. Test visual appearance and performance
5. Document usage guidelines

**Files to Modify**:

- Create `frontend/src/styles/theme/materials.css`: New file with texture classes
- `frontend/src/styles/components/entity-card.css`: Apply material classes
- Update `frontend/src/styles/theme/index.ts` to export materials

**Dependencies**:

- **Blocks**: None
- **Blocked by**: Task 3 (EntityCard migration)
- **Can run parallel with**: Task 9 (filete porteño)

**Risks**:

- **Technical Risk**: Performance impact of texture effects
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Use efficient CSS techniques, test performance, optimize
- **Visual Risk**: Textures too subtle or too overwhelming
  - **Probability**: Medium
  - **Impact**: Low
  - **Mitigation**: Iterate based on feedback, ensure readability maintained

**Acceptance Criteria**:

- [ ] Material texture classes created
- [ ] Concrete and metal textures implemented
- [ ] Patina effects implemented
- [ ] Applied to EntityCard and other surfaces
- [ ] Performance acceptable
- [ ] Matches design philosophy (weathered, soiled)

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] Performance tested
- [ ] Design system validated

---

### Task 9: Add Filete Porteño to Landing Page

**Gap ID**: Filete Porteño Gap

**Priority**: P2

**Design System Area**: Patterns

**Effort**: Medium (12-16 hours)

**Description**: Design and implement filete porteño decoration on landing page, evoking factory sign facade.

**Scope**:

- **In Scope**: 
  - Design filete porteño decoration (SVG or CSS)
  - Add to `Home.tsx` hero section
  - Ensure decorative, doesn't impede functionality
  - Literal hand-painted aesthetic
- **Out of Scope**: Filete porteño in application (only landing page)
- **Deferred**: Animated filete porteño (static for now)

**Current State**:

- No filete porteño
- Landing page has simple hero section
- No decorative elements

**Desired State**:

- Filete porteño decoration on landing page
- Evokes factory sign facade
- Decorative but functional
- Hand-painted aesthetic

**Implementation Steps**:

1. Research filete porteño style and patterns
2. Design decoration (SVG recommended for scalability):

   - Create SVG file or inline SVG
   - Use Peronist colors (`--color-peronist-blue`, `--color-peronist-white`)
   - Hand-painted, organic aesthetic

3. Add to `Home.tsx` hero section
4. Style with CSS to position appropriately
5. Ensure responsive and accessible
6. Test visual appearance and functionality

**Files to Modify**:

- `frontend/src/pages/Home.tsx`: Add filete porteño decoration
- Create `frontend/src/assets/filete-porteno.svg` or inline SVG
- Create/update `frontend/src/styles/pages/home.css`: Style decoration

**Dependencies**:

- **Blocks**: None
- **Blocked by**: Task 1, Task 2 (foundation)
- **Can run parallel with**: Task 8 (material textures)

**Risks**:

- **Technical Risk**: SVG complexity or file size
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Optimize SVG, use efficient techniques
- **Visual Risk**: Too decorative, impeding functionality
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Follow design philosophy (decorative but not impeding), test usability

**Acceptance Criteria**:

- [ ] Filete porteño decoration created
- [ ] Added to landing page hero
- [ ] Hand-painted aesthetic
- [ ] Doesn't impede functionality
- [ ] Responsive and accessible
- [ ] Matches design philosophy

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] Functionality tested
- [ ] Design system validated

---

### Task 10: Migrate Remaining Components to Design Tokens

**Gap ID**: Component Token Usage Gap

**Priority**: P2

**Design System Area**: Components

**Effort**: Large (20-24 hours)

**Description**: Migrate all remaining components to use design tokens instead of hardcoded values.

**Scope**:

- **In Scope**: 
  - Audit all component CSS files for hardcoded colors
  - Migrate RelatedEntities, AdminDashboard, and other components
  - Replace inline styles with CSS classes where possible
  - Ensure consistency across all components
- **Out of Scope**: Creating new components (only migration)
- **Deferred**: Complete component library (focus on existing)

**Current State**:

- Many components use hardcoded colors
- Inconsistent styling across components
- Mix of Material Design and industrial aesthetic

**Desired State**:

- All components use design tokens
- Consistent industrial aesthetic
- No hardcoded colors

**Implementation Steps**:

1. Audit all CSS files in `frontend/src/styles/components/` and `frontend/src/styles/pages/`
2. Create migration checklist for each component
3. Migrate component by component:

   - Replace hardcoded colors with CSS variables
   - Update typography to use tokens
   - Update spacing, shadows, borders to use tokens

4. Update inline styles in TSX files to use CSS classes or CSS variables
5. Test each component after migration
6. Document any component-specific patterns

**Files to Modify**:

- All files in `frontend/src/styles/components/`
- All files in `frontend/src/styles/pages/`
- Component TSX files with inline styles

**Dependencies**:

- **Blocks**: None
- **Blocked by**: Task 1, Task 2, Task 3 (foundation)
- **Can run parallel with**: Task 8, Task 9

**Risks**:

- **Technical Risk**: Breaking components during migration
  - **Probability**: Medium
  - **Impact**: High
  - **Mitigation**: Migrate incrementally, test each component, use feature branches
- **Visual Risk**: Inconsistent appearance during migration
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Migrate systematically, verify visual consistency

**Acceptance Criteria**:

- [ ] All components use design tokens
- [ ] No hardcoded colors remain
- [ ] Consistent industrial aesthetic
- [ ] All components tested
- [ ] Visual appearance maintained or improved

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] All components tested
- [ ] Design system validated

---

## Phase 4: Low Priority Polish (P3)

**Goal**: Add enhancements and future considerations

### Task 11: Production Chain Visualization Component

**Gap ID**: Production Chain Gap

**Priority**: P3

**Design System Area**: Patterns

**Effort**: Large (20+ hours)

**Description**: Design and implement component to visualize production chain context (Proveedor → Materiales → Worker → Producto + Etiqueta).

**Scope**:

- **In Scope**: 
  - Design production chain visualization component
  - Show flow: Proveedor → Materiales → Worker → Producto + Etiqueta
  - Add to entity detail pages
  - Ensure non-linear access maintained
- **Out of Scope**: Complex graph visualization (simple flow diagram)
- **Deferred**: Interactive chain exploration

**Current State**:

- Standard entity relationships displayed
- No production chain visualization
- No visual context of production flow

**Desired State**:

- Production chain visualization component
- Shows context on entity detail pages
- Industrial aesthetic
- Non-linear access maintained

**Implementation Steps**:

1. Design component structure and visual representation
2. Create `frontend/src/components/common/ProductionChain.tsx`
3. Create `frontend/src/styles/components/production-chain.css`
4. Integrate into entity detail pages
5. Ensure it shows context without impeding functionality
6. Test with various entity types

**Files to Modify**:

- Create `frontend/src/components/common/ProductionChain.tsx`: New component
- Create `frontend/src/styles/components/production-chain.css`: New styles
- Entity detail pages: Add production chain visualization

**Dependencies**:

- **Blocks**: None
- **Blocked by**: Task 1, Task 2 (foundation)
- **Can run parallel with**: Other P3 tasks

**Risks**:

- **Technical Risk**: Component complexity
  - **Probability**: Medium
  - **Impact**: Low
  - **Mitigation**: Start simple, iterate based on needs
- **Visual Risk**: Too complex or cluttered
  - **Probability**: Medium
  - **Impact**: Low
  - **Mitigation**: Keep simple, test with users

**Acceptance Criteria**:

- [ ] Production chain component created
- [ ] Shows production flow context
- [ ] Added to entity detail pages
- [ ] Non-linear access maintained
- [ ] Industrial aesthetic
- [ ] Doesn't impede functionality

**Validation**:

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] Functionality tested
- [ ] Design system validated

---

### Task 12: Sound Design Foundation

**Gap ID**: Sound Design Gap

**Priority**: P3

**Design System Area**: Enhancement

**Effort**: Medium (12-16 hours)

**Description**: Research and implement foundation for mechanical UI sounds, starting with basic interaction feedback.

**Scope**:

- **In Scope**: 
  - Research mechanical UI sound libraries or create sounds
  - Create sound utility/hook for playing sounds
  - Add sounds to button clicks and filter switches
  - Ensure volume is low and non-distracting
- **Out of Scope**: Ambient sounds (focus on interaction feedback)
- **Deferred**: Complex sound design system

**Current State**:

- No sound design
- Silent interactions
- No mechanical feedback

**Desired State**:

- Mechanical UI sounds for interactions
- Low volume, non-distracting
- Enhances industrial atmosphere

**Implementation Steps**:

1. Research sound libraries or create mechanical sounds
2. Create `frontend/src/lib/sounds/` directory
3. Create sound utility or React hook for playing sounds
4. Add sounds to button clicks (from Task 4)
5. Add sounds to filter switches (from Task 5)
6. Ensure volume control and mute option
7. Test sound design and user feedback

**Files to Modify**:

- Create `frontend/src/lib/sounds/`: New directory with sound files and utilities
- `frontend/src/components/common/FilterSwitch.tsx`: Add sound on toggle
- Button components: Add sound on click
- Create sound configuration/context

**Dependencies**:

- **Blocks**: None
- **Blocked by**: Task 4 (buttons), Task 5 (filter switches)
- **Can run parallel with**: Task 11

**Risks**:

- **Technical Risk**: Browser autoplay policies
  - **Probability**: Medium
  - **Impact**: Low
  - **Mitigation**: Sounds only on user interaction, handle autoplay restrictions
- **Visual Risk**: Sounds annoying or distracting
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Low volume, provide mute option, test with users

**Acceptance Criteria**:

- [ ] Sound utility/hook created
- [ ] Mechanical sounds for buttons and switches
- [ ] Low volume, non-distracting
- [ ] Mute option available
- [ ] Enhances industrial atmosphere
- [ ] Doesn't compete with content

**Validation**:

- [ ] Code matches design system
- [ ] Sound design tested
- [ ] User feedback collected
- [ ] Design system validated

---

## Task Dependency Graph

```
Phase 1 (P0 - Foundation):
Task 1 (Base Styles) ──┐
Task 2 (Typography) ──┼──> Task 3 (EntityCard)
                       └──> Task 4 (Buttons)

Phase 2 (P1 - Components):
Task 3 ──> Task 5 (Filter Switches)
Task 4 ──> Task 7 (SearchBar)
Task 1,2 ──> Task 6 (Warning Labels)

Phase 3 (P2 - Enhancements):
Task 3 ──> Task 8 (Material Textures)
Task 1,2 ──> Task 9 (Filete Porteño)
Task 1,2,3 ──> Task 10 (Remaining Components)

Phase 4 (P3 - Polish):
Task 4,5 ──> Task 12 (Sound Design)
Task 1,2 ──> Task 11 (Production Chain)
```

## Risk Mitigation Plan

### High Risk Tasks

- **Task 3 (EntityCard Migration)**: 
  - Risk: Breaking widely used component
  - Mitigation: Test all variants thoroughly, use feature branch, visual regression testing

- **Task 10 (Remaining Components)**:
  - Risk: Breaking multiple components during migration
  - Mitigation: Migrate incrementally, test each component, maintain feature branches

### Medium Risk Tasks

- **Task 8 (Material Textures)**:
  - Risk: Performance impact
  - Mitigation: Use efficient CSS techniques, test performance, optimize

- **Task 9 (Filete Porteño)**:
  - Risk: Too decorative, impeding functionality
  - Mitigation: Follow design philosophy, test usability

## Success Criteria

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] Design system validated (PLAYBOOK_02)
- [ ] No visual regressions introduced
- [ ] Code matches design system documentation
- [ ] Components use design tokens consistently
- [ ] Industrial aesthetic established throughout

## Next Steps

1. [ ] Review plan with stakeholders
2. [ ] Get approval on priorities
3. [ ] Begin Phase 1 (P0 tasks)
4. [ ] Use PLAYBOOK_05 for implementation
5. [ ] Track progress using task tracking
6. [ ] Validate after each phase using PLAYBOOK_02

## Estimated Timeline

- **Phase 1 (P0)**: 2-3 weeks (4 tasks, ~26-36 hours)
- **Phase 2 (P1)**: 2-3 weeks (3 tasks, ~22-28 hours)
- **Phase 3 (P2)**: 4-5 weeks (3 tasks, ~48-60 hours)
- **Phase 4 (P3)**: 3-4 weeks (2 tasks, ~32-36 hours)

**Total Estimated Duration**: 11-15 weeks (assuming part-time work, adjust based on capacity)

---

**Related Documentation**:

- Validation Report: `design-philosophy-validation-report.md`
- Design Philosophy: `design-philosophy.md`
- Component Specs: `03_components/primitives/`
- Design Tokens: `tokens/`

### To-dos

- [ ] Migrate base styles (index.css) to use design tokens - replace hardcoded colors and fonts with CSS variables
- [ ] Load 'Bebas Neue' font and apply factory signage typography to headings and navigation elements
- [ ] Migrate EntityCard component to use design tokens - replace hardcoded colors in CSS and inline styles
- [ ] Create base button component styles following button.md spec - implement all variants and states
- [ ] Build FilterSwitch component based on filter-switch.md spec - replace checkboxes in admin components
- [ ] Implement WarningLabel component with black octagon style for stats reporting in AdminDashboard
- [ ] Update SearchBar with console aesthetic using design tokens and industrial styling
- [ ] Implement material texture CSS classes (concrete, metal, patina) and apply to surfaces
- [ ] Add filete porteño decoration to landing page hero section with hand-painted aesthetic
- [ ] Migrate all remaining components to use design tokens - audit and update all CSS files
- [ ] Design and implement ProductionChain visualization component for entity detail pages
- [ ] Research and implement foundation for mechanical UI sounds on button clicks and filter switches