# Component: Filter Switch (Boolean Toggle)

## Status

- **Status**: implemented
- **Last Updated**: 2025-11-24
- **Last Implemented**: 2025-11-24
- **Design Reference**: `design-philosophy.md`

## Overview

Industrial console-style boolean filter switches for the Jinglero design system. These switches feel like **operating industrial control panel equipment** - mechanical, substantial, with clear on/off states. They enable users to apply boolean filters when searching, evoking the console-based interaction model.

## Design Intent

- **Current**: Industrial console switches with mechanical feel, clear on/off states, and console-style labeling ✅
- **Target**: Industrial console switches with mechanical feel, clear on/off states, and console-style labeling

## Variants

### Standard Switch (Console Toggle)

- **Usage**: Boolean filters, search filters, control panel toggles
- **Visual Spec**:
  - Background Track: `--color-bg-tertiary` (#2d2d2d) when off, `--color-accent-primary` (#ff6b35) when on
  - Switch Handle: `--material-metal-control-bg` (#3a3a3a) - clean metal
  - Border: `1px solid var(--color-border-primary)` (#404040)
  - Shadow: `--shadow-sm` (subtle elevation)
  - Size: 48px width × 24px height (standard)
- **Design Intent**: Industrial console toggle switch
- **Status**: draft

### Large Switch (Prominent Control)

- **Usage**: Major filters, important controls
- **Visual Spec**:
  - Same as standard but larger
  - Size: 64px width × 32px height
  - Enhanced shadow: `--shadow-md`
- **Design Intent**: Prominent control panel switch
- **Status**: draft

### Small Switch (Compact Control)

- **Usage**: Compact spaces, dense filter panels
- **Visual Spec**:
  - Same as standard but smaller
  - Size: 36px width × 18px height
  - Reduced shadow: `--shadow-xs`
- **Design Intent**: Compact console switch
- **Status**: draft

## State Variations

### Off State (Inactive)

- **Visual Spec**:
  - Track Background: `--color-bg-tertiary` (#2d2d2d - dark grey)
  - Handle Position: Left side
  - Handle Shadow: `--shadow-inset` (recessed)
  - Border: `1px solid var(--color-border-primary)` (#404040)
- **Design Intent**: Clearly inactive, recessed appearance
- **Status**: draft

### On State (Active)

- **Visual Spec**:
  - Track Background: `--color-accent-primary` (#ff6b35 - vibrant orange-red)
  - Handle Position: Right side
  - Handle Shadow: `--shadow-sm` (elevated)
  - Border: `1px solid var(--color-accent-primary)`
  - Glow: `--shadow-glow-primary` (orange-red glow)
- **Design Intent**: Clearly active, industrial indicator color
- **Status**: draft

### Hover State

- **Visual Spec**:
  - Enhanced shadow: `--shadow-md`
  - Glow: `--shadow-glow-interactive` (yellow glow)
  - Scale: `transform: scale(1.05)`
- **Transition**: `--transition-fast` (150ms ease)
- **Design Intent**: Industrial indicator light glow
- **Status**: draft

### Focus State

- **Visual Spec**:
  - Outline: `2px solid var(--color-accent-primary)`
  - Glow: `--shadow-glow-primary` (orange-red glow)
  - Enhanced shadow: `--shadow-md`
- **Design Intent**: Clear focus indication for accessibility
- **Status**: draft

### Disabled State

- **Visual Spec**:
  - Opacity: 0.5
  - Cursor: not-allowed
  - No interaction states
- **Design Intent**: Clearly non-interactive
- **Status**: draft

## Labeling

### Console-Style Label

- **Typography**: Factory signage (`--font-family-signage`)
- **Font Size**: `var(--font-size-body-small)` (14px)
- **Font Weight**: `var(--font-weight-semibold)` (600)
- **Text Transform**: `uppercase`
- **Letter Spacing**: `--letter-spacing-wide` (0.05em)
- **Color**: `--color-text-primary` (#e0e0e0)
- **Position**: Left of switch (or above on mobile)

### Status Indicator

- **On State**: "ON" label in vibrant color
- **Off State**: "OFF" label in muted color
- **Typography**: Factory signage, small size
- **Position**: Can be integrated into switch or separate label

## Interactive States Summary

| State    | Track BG   | Handle Position | Shadow   | Glow   | Scale |
| -------- | ---------- | --------------- | -------- | ------ | ----- |
| Off      | Dark grey  | Left            | Inset    | None   | 1.0   |
| On       | Orange-red | Right           | Elevated | Orange | 1.0   |
| Hover    | Same       | Same            | Enhanced | Yellow | 1.05  |
| Focus    | Same       | Same            | Enhanced | Orange | 1.0   |
| Disabled | Same       | Same            | None     | None   | 1.0   |

## Props

### Required Props

- `checked`: `boolean` - On/off state
- `onChange`: `function` - Change handler
- `label`: `string` - Switch label text

### Optional Props

- `size`: `'small' | 'medium' | 'large'` - Switch size
- `disabled`: `boolean` - Disabled state
- `ariaLabel`: `string` - Accessibility label
- `id`: `string` - Unique identifier

## Implementation Details

### CSS Classes

- `.filter-switch` - Base switch class
- `.filter-switch--small` - Small size
- `.filter-switch--medium` - Medium size (default)
- `.filter-switch--large` - Large size
- `.filter-switch--checked` - On state
- `.filter-switch--disabled` - Disabled state
- `.filter-switch__track` - Track element
- `.filter-switch__handle` - Handle element
- `.filter-switch__label` - Label element

### CSS File

- **Location**: `frontend/src/styles/components/filter-switch.css` ✅
- **Status**: Implemented
- **Dependencies**:
  - Color tokens (`--color-*`)
  - Typography tokens (`--font-*`)
  - Shadow tokens (`--shadow-*`)
  - Transition tokens (`--transition-*`)

### React Component

- **Location**: `frontend/src/components/common/FilterSwitch.tsx` ✅
- **Status**: Implemented
- **Props**: `checked`, `onChange`, `label`, `size`, `disabled`, `ariaLabel`, `id`, `showStatus`
- **Usage**:

  ```tsx
  import FilterSwitch from "../common/FilterSwitch";

  <FilterSwitch
    checked={isActive}
    onChange={setIsActive}
    label="Show Active Only"
    size="medium"
  />;
  ```

### Integration

- **EntityMetadataEditor**: Replaced checkboxes with FilterSwitch for boolean fields ✅
- **RelatedEntities**: Replaced checkboxes with FilterSwitch for relationship properties ✅

### Example CSS Structure

```css
.filter-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-switch__track {
  position: relative;
  width: 48px;
  height: 24px;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.filter-switch--checked .filter-switch__track {
  background-color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-sm), var(--shadow-glow-primary);
}

.filter-switch__handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: var(--material-metal-control-bg);
  border-radius: 50%;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-inset);
}

.filter-switch--checked .filter-switch__handle {
  left: calc(100% - 22px);
  box-shadow: var(--shadow-sm);
}

.filter-switch:hover:not(.filter-switch--disabled) .filter-switch__track {
  box-shadow: var(--shadow-md), var(--shadow-glow-interactive);
  transform: scale(1.05);
}

.filter-switch__label {
  font-family: var(--font-family-signage);
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-primary);
}
```

## Usage Guidelines

### When to Use

- **Boolean Filters**: Use for yes/no, on/off filter options
- **Search Filters**: Use in filter panels for applying search criteria
- **Control Panels**: Use in console-style interfaces for toggling features
- **Settings**: Use for binary settings/preferences

### Console Filter Panel Layout

- Group related switches together
- Use factory signage labels (uppercase, wide letter spacing)
- Maintain consistent spacing between switches
- Use visual grouping (cards or panels) for filter categories

### Accessibility

- Always provide accessible labels (`ariaLabel` prop)
- Ensure keyboard navigation (Space/Enter to toggle)
- Use focus states for clear indication
- Maintain sufficient color contrast
- Consider screen reader announcements for state changes

### Best Practices

- Use vibrant accent color (orange-red) only when switch is ON
- Keep labels concise and clear
- Group related filters together
- Provide visual feedback on state changes
- Use appropriate size for context (large for prominent, small for compact)

## Related Documentation

- Design tokens: `../../01_system-foundation/tokens/colors.md`
- Design tokens: `../../01_system-foundation/tokens/typography.md`
- Design tokens: `../../01_system-foundation/tokens/shadows.md`
- Design philosophy: `../../01_system-foundation/design-philosophy.md`

## Change History

| Date       | Change                                                                                                  | Author           |
| ---------- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| 2025-11-24 | Initial industrial filter switch component specification created (draft)                                | Design Team      |
| 2025-11-24 | FilterSwitch component implemented - CSS and React component complete, integrated into admin components | Development Team |
