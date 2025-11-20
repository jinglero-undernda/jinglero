# Design Tokens: Transitions

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: 2025-11-19
- **Code Reference**: `frontend/src/styles/theme/variables.css:29-31`

## Overview

Transition timing values provide consistent animation speeds throughout the interface. Three transition speeds are defined for different interaction types.

## Transition Values

### Fast Transition
- **Value**: `150ms ease`
- **CSS Variable**: `--transition-fast`
- **Usage**: Quick interactions, hover states, immediate feedback
- **Code Reference**: `frontend/src/styles/theme/variables.css:29`

### Normal Transition
- **Value**: `250ms ease`
- **CSS Variable**: `--transition-normal`
- **Usage**: Standard interactions, state changes, standard animations
- **Code Reference**: `frontend/src/styles/theme/variables.css:30`

### Slow Transition
- **Value**: `350ms ease`
- **CSS Variable**: `--transition-slow`
- **Usage**: Deliberate animations, complex state changes, page transitions
- **Code Reference**: `frontend/src/styles/theme/variables.css:31`

## Usage Guidelines

- Use `--transition-fast` for quick, immediate feedback (hover, focus)
- Use `--transition-normal` for standard state changes and interactions
- Use `--transition-slow` for deliberate, noticeable animations
- Apply transitions consistently to similar interaction types

## Implementation

All transition values are defined as CSS variables in the theme:

```css
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;
```

## Change History

- 2025-11-19: Initial documentation of current implementation

