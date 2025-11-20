# Design Tokens: Spacing

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: 2025-11-19
- **Code Reference**: `frontend/src/styles/theme/variables.css:17-21`

## Overview

Spacing scale and layout specifications for the Jinglero design system. A consistent spacing scale ensures visual rhythm and alignment throughout the interface.

## Spacing Scale

### Extra Small Spacing
- **Value**: `4px`
- **CSS Variable**: `--spacing-xs`
- **Usage**: Tight spacing, icon padding, small gaps
- **Code Reference**: `frontend/src/styles/theme/variables.css:17`

### Small Spacing
- **Value**: `8px`
- **CSS Variable**: `--spacing-sm`
- **Usage**: Compact spacing, form field spacing
- **Code Reference**: `frontend/src/styles/theme/variables.css:18`

### Medium Spacing
- **Value**: `16px`
- **CSS Variable**: `--spacing-md`
- **Usage**: Standard spacing, default padding, component gaps
- **Code Reference**: `frontend/src/styles/theme/variables.css:19`

### Large Spacing
- **Value**: `24px`
- **CSS Variable**: `--spacing-lg`
- **Usage**: Section spacing, larger component gaps
- **Code Reference**: `frontend/src/styles/theme/variables.css:20`

### Extra Large Spacing
- **Value**: `32px`
- **CSS Variable**: `--spacing-xl`
- **Usage**: Major section spacing, page-level padding
- **Code Reference**: `frontend/src/styles/theme/variables.css:21`

## Usage Guidelines

- Use the spacing scale consistently to maintain visual rhythm
- Prefer `--spacing-md` (16px) as the default spacing unit
- Use smaller spacing (`--spacing-xs`, `--spacing-sm`) for tight layouts
- Use larger spacing (`--spacing-lg`, `--spacing-xl`) for major sections and breathing room
- Always use CSS variables, never hardcode spacing values

## Implementation

All spacing values are defined as CSS variables in the theme:

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

## Change History

- 2025-11-19: Initial documentation of current implementation
