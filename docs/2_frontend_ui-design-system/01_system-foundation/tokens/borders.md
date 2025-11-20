# Design Tokens: Borders

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: 2025-11-19
- **Code Reference**: `frontend/src/styles/theme/variables.css:24-26`

## Overview

Border radius values provide consistent rounded corners throughout the interface. Three sizes are defined for different use cases.

## Border Radius Values

### Small Border Radius
- **Value**: `4px`
- **CSS Variable**: `--border-radius-sm`
- **Usage**: Small elements, buttons, inputs, badges
- **Code Reference**: `frontend/src/styles/theme/variables.css:24`

### Medium Border Radius
- **Value**: `8px`
- **CSS Variable**: `--border-radius-md`
- **Usage**: Standard elements, cards, containers
- **Code Reference**: `frontend/src/styles/theme/variables.css:25`

### Large Border Radius
- **Value**: `16px`
- **CSS Variable**: `--border-radius-lg`
- **Usage**: Large elements, modals, prominent cards
- **Code Reference**: `frontend/src/styles/theme/variables.css:26`

## Usage Guidelines

- Use `--border-radius-sm` for small interactive elements (buttons, inputs)
- Use `--border-radius-md` for standard containers and cards
- Use `--border-radius-lg` for large, prominent elements
- Maintain consistency within component types

## Implementation

All border radius values are defined as CSS variables in the theme:

```css
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 16px;
```

## Change History

- 2025-11-19: Initial documentation of current implementation

