# Design Tokens: Shadows

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: 2025-11-19
- **Code Reference**: `frontend/src/styles/theme/variables.css:34-36`

## Overview

Shadow definitions provide visual depth and hierarchy in the interface. Three shadow levels are defined for different use cases.

## Shadow Values

### Small Shadow
- **Value**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **CSS Variable**: `--shadow-sm`
- **Usage**: Subtle elevation, hover states, small cards
- **Code Reference**: `frontend/src/styles/theme/variables.css:34`

### Medium Shadow
- **Value**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **CSS Variable**: `--shadow-md`
- **Usage**: Standard elevation, cards, dropdowns
- **Code Reference**: `frontend/src/styles/theme/variables.css:35`

### Large Shadow
- **Value**: `0 10px 15px rgba(0, 0, 0, 0.1)`
- **CSS Variable**: `--shadow-lg`
- **Usage**: High elevation, modals, popovers
- **Code Reference**: `frontend/src/styles/theme/variables.css:36`

## Usage Guidelines

- Use `--shadow-sm` for subtle depth (hover states, small elements)
- Use `--shadow-md` for standard elevation (cards, containers)
- Use `--shadow-lg` for prominent elevation (modals, overlays)
- Shadows should be used consistently to establish visual hierarchy

## Implementation

All shadows are defined as CSS variables in the theme:

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

## Change History

- 2025-11-19: Initial documentation of current implementation

