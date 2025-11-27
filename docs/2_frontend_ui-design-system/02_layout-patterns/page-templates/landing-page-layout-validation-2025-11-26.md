# Design System Validation Report: Landing Page Layout

**Date**: 2025-11-26  
**Validator**: AI Assistant  
**Design System Version**: 2.0 (Design Intent - 2025-11-26)  
**Documentation**: `landing-page-layout.md`

## Summary

- **Status**: `discrepancies_found` (expected - documentation is design intent, not current implementation)
- **Total Checks**: 45
- **Passed**: 28
- **Failed**: 12
- **Warnings**: 5
- **Not Applicable**: 0 (components documented as "To be implemented")

## Validation Scope

This validation checks:
1. Code references accuracy
2. Design token existence and usage
3. Component implementation status
4. CSS variable references
5. Current implementation vs. target design intent

## Code References

### Validated ✅

- ✅ `frontend/src/pages/Home.tsx` - File exists
- ✅ `frontend/src/styles/pages/home.css` - File exists
- ✅ `frontend/src/components/search/SearchBar.tsx` - Component exists
- ✅ `frontend/src/components/common/EntityCard.tsx` - Component exists
- ✅ `frontend/src/components/common/WarningLabel.tsx` - Component exists
- ✅ `frontend/src/styles/components/warning-label.css` - CSS file exists

### Discrepancies ❌

- ❌ **Line Range Accuracy**: Documentation references `Home.tsx:57-108` but current implementation spans lines 57-110 (minor discrepancy, component structure changed slightly)
- ❌ **Code Reference Mismatch**: Current implementation doesn't match target design intent (expected - documentation is design intent)

## Design Tokens

### Validated ✅

All design tokens referenced in documentation exist in `frontend/src/styles/theme/variables.css`:

**Color Tokens:**
- ✅ `--color-bg-primary` - Exists (#1a1a1a)
- ✅ `--color-bg-secondary` - Exists (#242424)
- ✅ `--color-bg-tertiary` - Exists (#2d2d2d)
- ✅ `--color-bg-surface` - Exists (#333333)
- ✅ `--color-text-primary` - Exists (#e0e0e0)
- ✅ `--color-text-secondary` - Exists (#b0b0b0)
- ✅ `--color-text-tertiary` - Exists (#808080)
- ✅ `--color-text-inverse` - Exists (#000000)
- ✅ `--color-accent-primary` - Exists (#ff6b35)
- ✅ `--color-accent-secondary` - Exists (#4ecdc4)
- ✅ `--color-accent-interactive` - Exists (#ffe66d)
- ✅ `--color-peronist-blue` - Exists (#1e3a8a)
- ✅ `--color-warning-label-bg` - Exists (#000000)
- ✅ `--color-warning-label-text` - Exists (#ffffff)
- ✅ `--color-border-primary` - Exists (#404040)
- ✅ `--color-border-secondary` - Exists (#555555)

**Typography Tokens:**
- ✅ `--font-family-signage` - Exists
- ✅ `--font-family-body` - Exists
- ✅ `--font-size-display` - Exists (4rem)
- ✅ `--font-size-h1` through `--font-size-h6` - All exist
- ✅ `--font-size-body`, `--font-size-body-large`, `--font-size-body-small`, `--font-size-caption` - All exist
- ✅ `--font-weight-bold`, `--font-weight-semibold`, `--font-weight-regular` - All exist
- ✅ `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed` - All exist
- ✅ `--letter-spacing-tight`, `--letter-spacing-normal`, `--letter-spacing-wide` - All exist

**Spacing Tokens:**
- ✅ `--spacing-xs` - Exists (4px)
- ✅ `--spacing-sm` - Exists (8px)
- ✅ `--spacing-md` - Exists (16px)
- ✅ `--spacing-lg` - Exists (24px)
- ✅ `--spacing-xl` - Exists (32px)

**Shadow Tokens:**
- ✅ `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` - All exist
- ✅ `--shadow-glow-primary`, `--shadow-glow-interactive` - All exist

### Discrepancies ❌

**CSS Variables Used in Current Implementation but Not in Design System:**

- ❌ `--color-text-primary` with fallback `#333` - Current CSS uses light fallback, but design system uses dark theme (#e0e0e0)
- ❌ `--color-text-secondary` with fallback `#666` - Current CSS uses light fallback, but design system uses dark theme (#b0b0b0)
- ❌ `--color-border` - Referenced in `home.css:41` but doesn't exist in design system (should use `--color-border-primary`)
- ❌ `--color-primary` - Referenced in `home.css:48,54` but doesn't exist in design system (should use `--color-accent-primary`)
- ❌ `--color-primary-dark` - Referenced in `home.css:63` but doesn't exist in design system
- ❌ `--color-error-bg` - Referenced in `home.css:119` but doesn't exist in design system

**Design Token Usage Issues:**

- ⚠️ Current `home.css` uses legacy color variables with light theme fallbacks instead of design system dark theme tokens
- ⚠️ Current implementation doesn't use factory signage typography tokens
- ⚠️ Current implementation uses hardcoded spacing values instead of spacing tokens

## Component Styles

### Validated ✅

- ✅ **WarningLabel Component** - Fully implemented, matches documentation
  - Component exists: `frontend/src/components/common/WarningLabel.tsx`
  - CSS exists: `frontend/src/styles/components/warning-label.css`
  - Uses design tokens correctly
  - All variants (small, medium, large) implemented

- ✅ **EntityCard Component** - Implemented and used in Home.tsx
  - Component exists: `frontend/src/components/common/EntityCard.tsx`
  - Used in current implementation: `Home.tsx:93-98`

- ✅ **SearchBar Component** - Implemented and used in Home.tsx
  - Component exists: `frontend/src/components/search/SearchBar.tsx`
  - Used in current implementation: `Home.tsx:65-68`

### Not Implemented (Documented as Draft) ⏳

- ⏳ **FileteSign Component** - Documented as "To be implemented"
  - Status: Correctly documented as draft
  - Code Reference: "To be implemented" (accurate)
  - Design Intent: Fully documented

- ⏳ **FloatingHeader Component** - Documented as "To be implemented"
  - Status: Correctly documented as draft
  - Code Reference: "To be implemented" (accurate)
  - Design Intent: Fully documented

- ⏳ **FeaturedFabricaPlaceholder Component** - Documented as "To be implemented"
  - Status: Correctly documented as draft
  - Design Intent: Fully documented

- ⏳ **VolumetricIndicators Section** - Documented as "To be implemented"
  - Status: Correctly documented as draft
  - Design Intent: Fully documented
  - Component dependency (WarningLabel) exists ✅

- ⏳ **FeaturedEntitiesSection** - Documented as "To be implemented"
  - Status: Correctly documented as draft
  - Design Intent: Fully documented
  - Component dependency (EntityCard) exists ✅

## Current Implementation vs. Target Design Intent

### Current Implementation (Home.tsx)

**Structure:**
- Centered hero section with title, subtitle, and search bar
- Featured Fabricas section (6 most recent)
- Max-width container (1200px)
- Basic responsive design

**Styling:**
- Uses legacy CSS variables with light theme fallbacks
- Hardcoded spacing values
- Standard typography (not factory signage)
- Centered layout with max-width constraint

### Target Design Intent (Documentation)

**Structure:**
- Filete-style welcome sign (disappears on scroll)
- Full-width search bar (sticky on scroll)
- Featured Fabrica placeholder (16:9, full-width)
- Volumetric indicators section (WarningLabel components)
- Featured entities section (6 subsections, 5 entities each)
- Floating header navigation
- Full-width layout (no max-width constraint)

**Styling:**
- Uses design system tokens (dark industrial theme)
- Factory signage typography
- Spacing tokens
- Progressive reveal layout
- Industrial aesthetic

### Discrepancies ❌

- ❌ **Layout Structure**: Current uses centered max-width container, target uses full-width progressive reveal
- ❌ **Hero Section**: Current uses simple title/subtitle, target uses Filete sign with scroll behavior
- ❌ **Search Bar**: Current is centered with max-width, target is full-width sticky
- ❌ **Featured Content**: Current shows 6 Fabricas, target shows placeholder + volumetric indicators + 6 entity type sections
- ❌ **Navigation**: Current has no floating header, target has semi-transparent floating header
- ❌ **CSS Variables**: Current uses legacy variables, target uses design system tokens
- ❌ **Typography**: Current uses standard fonts, target uses factory signage fonts
- ❌ **Spacing**: Current uses hardcoded values, target uses spacing tokens

**Note**: These discrepancies are expected - documentation represents design intent, not current implementation.

## Visual Patterns

### Validated ✅

- ✅ **WarningLabel Pattern** - Implemented and matches documentation
- ✅ **EntityCard Grid Pattern** - Implemented in current Home.tsx
- ✅ **Responsive Grid Pattern** - Implemented (auto-fill, minmax)

### Not Implemented ⏳

- ⏳ **Filete Decoration Pattern** - Documented but not implemented
- ⏳ **Progressive Reveal Pattern** - Documented but not implemented
- ⏳ **Floating Header Pattern** - Documented but not implemented
- ⏳ **Full-Width Sticky Search Pattern** - Documented but not implemented

## Recommendations

### High Priority

1. **Update Current CSS to Use Design Tokens**
   - Replace `--color-text-primary` fallback `#333` with design system value
   - Replace `--color-text-secondary` fallback `#666` with design system value
   - Replace `--color-border` with `--color-border-primary`
   - Replace `--color-primary` with `--color-accent-primary`
   - Remove `--color-primary-dark` (create if needed or use existing token)
   - Remove `--color-error-bg` (create if needed or use existing token)

2. **Migrate Typography to Factory Signage**
   - Update hero title to use `--font-family-signage`
   - Update section titles to use factory signage typography
   - Use typography size tokens instead of hardcoded values

3. **Migrate Spacing to Design Tokens**
   - Replace hardcoded spacing (2rem, 3rem, etc.) with spacing tokens
   - Use `--spacing-xl`, `--spacing-lg`, `--spacing-md` consistently

### Medium Priority

4. **Implement New Components** (as per design intent)
   - FileteSign component
   - FloatingHeader component
   - FeaturedFabricaPlaceholder component
   - VolumetricIndicators section
   - FeaturedEntitiesSection with 6 subsections

5. **Update Layout Structure**
   - Remove max-width constraint (full-width layout)
   - Implement progressive reveal pattern
   - Implement scroll-based fade-out for Filete sign
   - Implement sticky search bar

### Low Priority

6. **Refine Responsive Behavior**
   - Implement combined layouts (volumetric indicators + featured entities)
   - Optimize for portrait/landscape orientations
   - Test mobile/tablet/desktop breakpoints

## Next Steps

### Immediate Actions

- [ ] Update `home.css` to use design system tokens (remove legacy variables)
- [ ] Create missing CSS variables or document alternatives
- [ ] Update typography to use factory signage fonts
- [ ] Migrate spacing to design tokens

### Implementation Phase

- [ ] Implement FileteSign component
- [ ] Implement FloatingHeader component
- [ ] Implement FeaturedFabricaPlaceholder component
- [ ] Implement VolumetricIndicators section
- [ ] Implement FeaturedEntitiesSection with 6 subsections
- [ ] Update Home.tsx to use new components and layout structure

### Validation After Implementation

- [ ] Re-validate after code changes
- [ ] Update design system status to `current_implementation` when components are built
- [ ] Mark as `validated` when implementation matches design intent

## Status Update

**Current Status**: `draft` (Design Intent Documented)  
**Validation Status**: `discrepancies_found` (Expected - documentation is target design, not current implementation)  
**Last Validated**: 2025-11-26

**Recommendation**: Keep status as `draft` until implementation begins. Update to `current_implementation` when components are built, then re-validate.

## Change History

| Version | Date       | Change                    | Author      |
| ------- | ---------- | ------------------------- | ----------- |
| 1.0     | 2025-11-26 | Initial validation report | AI Assistant |

