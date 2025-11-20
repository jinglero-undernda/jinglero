# Design Tokens: Colors

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: 2025-11-19
- **Code Reference**: `frontend/src/styles/theme/variables.css:3-9`

## Overview

Color palette documentation for the Jinglero design system. Colors are defined as CSS variables for consistency and easy theming.

## Color Values

### Primary Color
- **Value**: `#1a73e8`
- **CSS Variable**: `--primary-color`
- **Usage**: Primary actions, links, brand elements
- **Code Reference**: `frontend/src/styles/theme/variables.css:3`

### Secondary Color
- **Value**: `#5f6368`
- **CSS Variable**: `--secondary-color`
- **Usage**: Secondary actions, supporting elements
- **Code Reference**: `frontend/src/styles/theme/variables.css:4`

### Background Color
- **Value**: `#ffffff`
- **CSS Variable**: `--background-color`
- **Usage**: Main page background
- **Code Reference**: `frontend/src/styles/theme/variables.css:5`

### Text Color
- **Value**: `#202124`
- **CSS Variable**: `--text-color`
- **Usage**: Primary text content
- **Code Reference**: `frontend/src/styles/theme/variables.css:6`

### Error Color
- **Value**: `#d93025`
- **CSS Variable**: `--error-color`
- **Usage**: Error states, validation errors, destructive actions
- **Code Reference**: `frontend/src/styles/theme/variables.css:7`

### Success Color
- **Value**: `#1e8e3e`
- **CSS Variable**: `--success-color`
- **Usage**: Success states, confirmation messages
- **Code Reference**: `frontend/src/styles/theme/variables.css:8`

### Warning Color
- **Value**: `#f9ab00`
- **CSS Variable**: `--warning-color`
- **Usage**: Warning states, caution messages
- **Code Reference**: `frontend/src/styles/theme/variables.css:9`

## Usage Guidelines

- Use `--primary-color` for primary actions and brand elements
- Use `--secondary-color` for secondary actions and supporting elements
- Use semantic colors (`--error-color`, `--success-color`, `--warning-color`) consistently for their intended purposes
- Always use CSS variables, never hardcode color values

## Implementation

All colors are defined as CSS variables in the theme:

```css
--primary-color: #1a73e8;
--secondary-color: #5f6368;
--background-color: #ffffff;
--text-color: #202124;
--error-color: #d93025;
--success-color: #1e8e3e;
--warning-color: #f9ab00;
```

## Change History

- 2025-11-19: Initial documentation of current implementation
