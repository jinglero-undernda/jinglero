# Component: Card

## Status

- **Status**: partially_implemented
- **Last Updated**: 2025-11-24
- **Last Implemented**: 2025-11-24
- **Design Reference**: `design-philosophy.md`

## Overview

Industrial metal panel cards for the Jinglero design system. Cards feel like **metal control panels** or **factory equipment surfaces** - substantial, elevated, with industrial depth. The EntityCard component has been migrated to use design tokens and industrial styling.

## Design Intent

- **Current**: EntityCard migrated to design tokens, industrial colors and typography applied ✅
- **Target**: Metal panel cards with industrial depth, weathered surfaces, and clear elevation hierarchy (material textures pending)

## Variants

### Standard Card (Metal Panel)

- **Usage**: General content containers, entity cards, information panels
- **Visual Spec**:
  - Background: `--material-metal-primary-bg` (#2d2d2d - weathered steel)
  - Border: `1px solid var(--color-border-primary)` (#404040)
  - Shadow: `--shadow-md` (metal panel depth)
  - Border Radius: `var(--border-radius-md)` (8px)
  - Padding: `var(--spacing-md)` (16px)
- **Design Intent**: Standard metal control panel surface
- **Status**: draft

### Elevated Card (Raised Panel)

- **Usage**: Prominent content, featured items, modals
- **Visual Spec**:
  - Background: `--material-metal-control-bg` (#3a3a3a - clean metal)
  - Border: `1px solid var(--color-border-secondary)` (#555555)
  - Shadow: `--shadow-lg` (high elevation)
  - Border Radius: `var(--border-radius-md)` (8px)
  - Padding: `var(--spacing-lg)` (24px)
- **Design Intent**: Raised metal control panel, maximum prominence
- **Status**: draft

### Recessed Card (Embedded Panel)

- **Usage**: Embedded content, form sections, secondary information
- **Visual Spec**:
  - Background: `--color-bg-tertiary` (#2d2d2d)
  - Border: None
  - Shadow: `--shadow-inset` (recessed)
  - Border Radius: `var(--border-radius-sm)` (4px)
  - Padding: `var(--spacing-md)` (16px)
- **Design Intent**: Recessed control panel, embedded feel
- **Status**: draft

### Concrete Card (Weathered Surface)

- **Usage**: Background surfaces, structural elements, landing page sections
- **Visual Spec**:
  - Background: `--material-concrete-primary-bg` (#1a1a1a - weathered concrete)
  - Border: None
  - Shadow: `--shadow-sm` (subtle texture)
  - Border Radius: `var(--border-radius-sm)` (4px)
  - Padding: `var(--spacing-lg)` (24px)
- **Design Intent**: Weathered concrete texture, structural feel
- **Status**: draft

## State Variations

### Default State

- **Visual Spec**: Standard appearance as defined in variant
- **Shadow**: Standard elevation shadow
- **Transition**: `--transition-normal` (250ms ease)

### Hover State (Interactive Cards)

- **Visual Spec**:
  - Enhanced shadow: `--shadow-lg`
  - Border: `1px solid var(--color-border-accent)` (accent border)
  - Transform: `translateY(-2px)`
- **Transition**: `--transition-fast` (150ms ease)
- **Design Intent**: Slight lift, indicates interactivity

### Active/Selected State

- **Visual Spec**:
  - Border: `2px solid var(--color-accent-primary)` (vibrant accent)
  - Glow: `--shadow-glow-primary` (orange-red glow)
  - Shadow: Enhanced `--shadow-md`
- **Design Intent**: Clear selection indication

### Focus State

- **Visual Spec**:
  - Outline: `2px solid var(--color-accent-primary)`
  - Glow: `--shadow-glow-primary` (orange-red glow)
- **Design Intent**: Accessibility focus indication

## Content Structure

### Card Header

- **Typography**: Factory signage style (`--font-family-signage`)
- **Font Size**: `var(--font-size-h3)` (28px) or `var(--font-size-h4)` (24px)
- **Font Weight**: `var(--font-weight-bold)` (700)
- **Color**: `--color-text-primary` (#e0e0e0)
- **Padding**: `0 0 var(--spacing-sm) 0` (bottom padding only)

### Card Body

- **Typography**: Body font (`--font-family-body`)
- **Font Size**: `var(--font-size-body)` (16px)
- **Color**: `--color-text-primary` (#e0e0e0)
- **Line Height**: `var(--line-height-normal)` (1.5)

### Card Footer

- **Typography**: Body font (`--font-family-body`)
- **Font Size**: `var(--font-size-body-small)` (14px)
- **Color**: `--color-text-secondary` (#b0b0b0)
- **Padding**: `var(--spacing-sm) 0 0 0` (top padding only)
- **Border Top**: `1px solid var(--color-border-primary)` (optional divider)

## Material Textures

### Metal Panel Texture

- **Implementation**: CSS background patterns or SVG textures
- **Visual Effect**: Brushed metal grain, subtle highlights
- **Usage**: Standard and Elevated card variants

### Concrete Texture

- **Implementation**: CSS background patterns with noise/grain
- **Visual Effect**: Weathered concrete, subtle variation
- **Usage**: Concrete card variant

### Patina Overlay (Optional)

- **Implementation**: Subtle overlay with opacity
- **Visual Effect**: Aged surface, wear marks
- **Usage**: Decorative elements, character surfaces

## Props

### Required Props

- `children`: Card content
- `variant`: `'standard' | 'elevated' | 'recessed' | 'concrete'`

### Optional Props

- `interactive`: `boolean` - Enables hover/focus states
- `selected`: `boolean` - Selected/active state
- `onClick`: `function` - Click handler (if interactive)
- `ariaLabel`: `string` - Accessibility label

## Implementation Details

### CSS Classes

- `.card` - Base card class
- `.card--standard` - Standard metal panel variant
- `.card--elevated` - Elevated raised panel variant
- `.card--recessed` - Recessed embedded panel variant
- `.card--concrete` - Concrete weathered surface variant
- `.card--interactive` - Interactive card (hover/focus enabled)
- `.card--selected` - Selected/active state

### CSS File

- **Location**: `frontend/src/styles/components/card.css`
- **Dependencies**:
  - Color tokens (`--color-*`)
  - Material tokens (`--material-*`)
  - Shadow tokens (`--shadow-*`)
  - Spacing tokens (`--spacing-*`)
  - Border tokens (`--border-radius-*`)

### Example CSS Structure

```css
.card {
  /* Base styles */
  background-color: var(--material-metal-primary-bg);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.card--elevated {
  background-color: var(--material-metal-control-bg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-lg);
}

.card--interactive:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-accent);
  transform: translateY(-2px);
}

.card--selected {
  border: 2px solid var(--color-accent-primary);
  box-shadow: var(--shadow-md), var(--shadow-glow-primary);
}
```

## Usage Guidelines

### When to Use Each Variant

1. **Standard Card**: Use for general content, entity cards, information panels
2. **Elevated Card**: Use for prominent content, featured items, modals
3. **Recessed Card**: Use for embedded content, form sections, secondary information
4. **Concrete Card**: Use for background surfaces, structural elements, landing sections

### Content Organization

- Use card headers for titles (factory signage style)
- Use card body for main content (body font)
- Use card footer for metadata, actions, or secondary information
- Maintain consistent spacing within cards

### Accessibility

- Ensure sufficient color contrast for text on card backgrounds
- Use focus states for interactive cards
- Provide accessible labels for interactive cards
- Maintain clear visual hierarchy

## Related Documentation

- Design tokens: `../../01_system-foundation/tokens/colors.md`
- Design tokens: `../../01_system-foundation/tokens/materials.md`
- Design tokens: `../../01_system-foundation/tokens/shadows.md`
- Entity card component: `../composite/entity-card.md`
- Design philosophy: `../../01_system-foundation/design-philosophy.md`

## Implementation

### EntityCard Component

- **Location**: `frontend/src/components/common/EntityCard.tsx` ✅
- **CSS Location**: `frontend/src/styles/components/entity-card.css` ✅
- **Status**: Migrated to design tokens
- **Changes**:
  - All hardcoded colors replaced with CSS variables
  - Inline styles replaced with CSS classes
  - Button styles migrated to use industrial colors
  - Typography uses design tokens
  - Shadows use design tokens

### Implementation Notes

- EntityCard fully uses design tokens for colors, spacing, shadows
- Button classes created for edit, save, cancel, delete actions
- Industrial accent colors applied to interactive elements
- Factory signage typography ready (can be applied to headings)
- Material textures pending (Phase 3 enhancement)

## Change History

| Date       | Change                                                                         | Author           |
| ---------- | ------------------------------------------------------------------------------ | ---------------- |
| 2025-11-24 | Initial industrial card component specification created (draft)                | Design Team      |
| 2025-11-24 | EntityCard migrated to design tokens - all colors and styles use CSS variables | Development Team |
