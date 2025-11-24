# Component: Button

## Status

- **Status**: implemented
- **Last Updated**: 2025-11-24
- **Last Implemented**: 2025-11-24
- **Design Reference**: `design-philosophy.md`

## Overview

Industrial console-style buttons for the Jinglero design system. Buttons feel like **factory control panel elements** - substantial, mechanical, and clearly interactive. They use factory signage typography and vibrant accent colors to draw attention to user interactions.

## Design Intent

- **Current**: Industrial console-style buttons with factory signage typography, metal surfaces, and vibrant accent colors for interactions ✅
- **Target**: Industrial console-style buttons with factory signage typography, metal surfaces, and vibrant accent colors for interactions

## Variants

### Primary Button (Factory Control)

- **Usage**: Primary actions, important interactions
- **Visual Spec**:
  - Background: `--color-accent-primary` (#ff6b35 - vibrant orange-red)
  - Text: `--color-text-inverse` (black)
  - Typography: Factory signage style (`--font-family-signage`)
  - Shadow: `--shadow-md` (metal panel depth)
  - Border: None
- **Design Intent**: Industrial warning/control color, draws attention
- **Status**: draft

### Secondary Button (Metal Panel)

- **Usage**: Secondary actions, supporting interactions
- **Visual Spec**:
  - Background: `--material-metal-control-bg` (#3a3a3a - clean metal)
  - Text: `--color-text-primary` (light grey)
  - Typography: Factory signage style (`--font-family-signage`)
  - Shadow: `--shadow-sm` (subtle elevation)
  - Border: `1px solid var(--color-border-primary)`
- **Design Intent**: Clean metal control panel surface
- **Status**: draft

### Tertiary Button (Recessed)

- **Usage**: Less prominent actions, embedded controls
- **Visual Spec**:
  - Background: `--color-bg-tertiary` (#2d2d2d)
  - Text: `--color-text-secondary` (medium grey)
  - Typography: Body font (`--font-family-body`)
  - Shadow: `--shadow-inset` (recessed)
  - Border: None
- **Design Intent**: Recessed control panel element
- **Status**: draft

### Factory Signage Button (Navigation)

- **Usage**: Navigation buttons, major wayfinding
- **Visual Spec**:
  - Background: `--color-bg-secondary` (#242424)
  - Text: `--color-text-primary` (light grey)
  - Typography: Factory signage (`--font-family-signage`), uppercase, wide letter spacing
  - Shadow: `--shadow-md` (metal panel)
  - Border: `2px solid var(--color-border-accent)` (accent border)
- **Design Intent**: Factory signage aesthetic for navigation
- **Status**: draft

## State Variations

### Default State

- **Visual Spec**: Standard appearance as defined in variant
- **Shadow**: Standard elevation shadow
- **Transition**: `--transition-normal` (250ms ease)

### Hover State

- **Visual Spec**:
  - Enhanced shadow: `--shadow-lg`
  - Glow effect: `--shadow-glow-interactive` (yellow glow)
  - Slight scale: `transform: scale(1.02)`
- **Transition**: `--transition-fast` (150ms ease)
- **Design Intent**: Industrial indicator light glow, draws attention

### Active/Pressed State

- **Visual Spec**:
  - Shadow: `--shadow-inset` (recessed appearance)
  - Scale: `transform: scale(0.98)`
  - Background: Slightly darker shade
- **Transition**: `--transition-fast` (150ms ease)
- **Design Intent**: Mechanical pressed button feel

### Focus State

- **Visual Spec**:
  - Outline: `2px solid var(--color-accent-primary)`
  - Glow: `--shadow-glow-primary` (orange-red glow)
  - Shadow: Enhanced `--shadow-md`
- **Design Intent**: Clear focus indication for accessibility

### Disabled State

- **Visual Spec**:
  - Background: `--color-bg-tertiary` (#2d2d2d)
  - Text: `--color-text-tertiary` (#808080)
  - Shadow: None
  - Opacity: 0.5
  - Cursor: not-allowed
- **Design Intent**: Clearly non-interactive

## Interactive States Summary

| State    | Background       | Text             | Shadow   | Glow        | Scale |
| -------- | ---------------- | ---------------- | -------- | ----------- | ----- |
| Default  | Variant-specific | Variant-specific | Standard | None        | 1.0   |
| Hover    | Same             | Same             | Enhanced | Yellow glow | 1.02  |
| Active   | Darker           | Same             | Inset    | None        | 0.98  |
| Focus    | Same             | Same             | Enhanced | Orange glow | 1.0   |
| Disabled | Tertiary         | Tertiary         | None     | None        | 1.0   |

## Sizes

### Large (Factory Signage)

- **Padding**: `var(--spacing-md) var(--spacing-lg)` (16px 24px)
- **Font Size**: `var(--font-size-h5)` (20px)
- **Font Weight**: `var(--font-weight-bold)` (700)
- **Usage**: Major actions, prominent buttons

### Medium (Standard)

- **Padding**: `var(--spacing-sm) var(--spacing-md)` (8px 16px)
- **Font Size**: `var(--font-size-body)` (16px)
- **Font Weight**: `var(--font-weight-semibold)` (600)
- **Usage**: Standard actions, most buttons

### Small (Compact)

- **Padding**: `var(--spacing-xs) var(--spacing-sm)` (4px 8px)
- **Font Size**: `var(--font-size-body-small)` (14px)
- **Font Weight**: `var(--font-weight-semibold)` (600)
- **Usage**: Compact spaces, secondary actions

## Typography

### Factory Signage Buttons

- **Font Family**: `--font-family-signage` (Bebas Neue, Impact, Arial Black)
- **Letter Spacing**: `--letter-spacing-wide` (0.05em)
- **Text Transform**: `uppercase` (for navigation buttons)
- **Font Weight**: `--font-weight-bold` (700)

### Standard Buttons

- **Font Family**: `--font-family-body` (system fonts)
- **Letter Spacing**: `--letter-spacing-normal` (0)
- **Text Transform**: `none`
- **Font Weight**: `--font-weight-semibold` (600)

## Props

### Required Props

- `children`: Button text/content
- `variant`: `'primary' | 'secondary' | 'tertiary' | 'signage'`
- `size`: `'large' | 'medium' | 'small'`

### Optional Props

- `disabled`: `boolean` - Disabled state
- `onClick`: `function` - Click handler
- `type`: `'button' | 'submit' | 'reset'` - Button type
- `ariaLabel`: `string` - Accessibility label

## Implementation Details

### CSS Classes

- `.button` - Base button class
- `.button--primary` - Primary variant
- `.button--secondary` - Secondary variant
- `.button--tertiary` - Tertiary variant
- `.button--signage` - Factory signage variant
- `.button--large` - Large size
- `.button--medium` - Medium size
- `.button--small` - Small size
- `.button--disabled` - Disabled state

### CSS File

- **Location**: `frontend/src/styles/components/button.css`
- **Dependencies**:
  - Color tokens (`--color-*`)
  - Typography tokens (`--font-*`)
  - Shadow tokens (`--shadow-*`)
  - Spacing tokens (`--spacing-*`)
  - Transition tokens (`--transition-*`)

### Example CSS Structure

```css
.button {
  /* Base styles */
  font-family: var(--font-family-signage);
  font-weight: var(--font-weight-bold);
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);

  /* Default state */
  box-shadow: var(--shadow-md);
}

.button--primary {
  background-color: var(--color-accent-primary);
  color: var(--color-text-inverse);
}

.button:hover:not(.button--disabled) {
  box-shadow: var(--shadow-lg), var(--shadow-glow-interactive);
  transform: scale(1.02);
}

.button:active:not(.button--disabled) {
  box-shadow: var(--shadow-inset);
  transform: scale(0.98);
}

.button:focus {
  outline: 2px solid var(--color-accent-primary);
  box-shadow: var(--shadow-md), var(--shadow-glow-primary);
}
```

## Usage Guidelines

### When to Use Each Variant

1. **Primary Button**: Use for the most important action on a page (e.g., "Submit", "Create", "Save")
2. **Secondary Button**: Use for supporting actions (e.g., "Cancel", "Back", "Edit")
3. **Tertiary Button**: Use for less prominent actions or embedded controls
4. **Factory Signage Button**: Use for navigation, major wayfinding, landing page CTAs

### Accessibility

- Always provide accessible labels (`ariaLabel` prop)
- Ensure sufficient color contrast (WCAG AA minimum)
- Use focus states for keyboard navigation
- Disabled buttons should be clearly non-interactive

### Best Practices

- Use factory signage style for navigation and major actions
- Reserve vibrant accent colors (primary) for important interactions
- Maintain consistent button sizes within a component group
- Use hover and focus states to provide clear feedback

## Related Documentation

- Design tokens: `../../01_system-foundation/tokens/colors.md`
- Design tokens: `../../01_system-foundation/tokens/typography.md`
- Design tokens: `../../01_system-foundation/tokens/shadows.md`
- Design philosophy: `../../01_system-foundation/design-philosophy.md`

## Implementation

### CSS File

- **Location**: `frontend/src/styles/components/button.css` ✅
- **Status**: Implemented
- **Dependencies**:
  - Color tokens (`--color-*`)
  - Typography tokens (`--font-*`)
  - Shadow tokens (`--shadow-*`)
  - Spacing tokens (`--spacing-*`)
  - Transition tokens (`--transition-*`)

### React Component

- **Location**: CSS classes only (can be used with any button element)
- **Usage**: Apply CSS classes directly to `<button>` elements
- **Example**:
  ```tsx
  <button className="button button--primary button--medium">Submit</button>
  ```

### Implementation Notes

- All variants implemented (primary, secondary, tertiary, signage)
- All sizes implemented (small, medium, large)
- All states implemented (default, hover, active, focus, disabled)
- Uses design tokens throughout
- Factory signage typography applied to primary, secondary, and signage variants

## Change History

| Date       | Change                                                              | Author           |
| ---------- | ------------------------------------------------------------------- | ---------------- |
| 2025-11-24 | Initial industrial button component specification created (draft)   | Design Team      |
| 2025-11-24 | Button component CSS implemented - all variants and states complete | Development Team |
