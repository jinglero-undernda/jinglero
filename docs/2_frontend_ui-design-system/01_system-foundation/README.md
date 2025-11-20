# System Foundation

## Purpose

This section documents the foundational design system elements: design tokens, design philosophy, and system status. These are the building blocks that all other design elements (layouts, components) are built upon.

## Structure

### Design Tokens

Design tokens are the atomic design values used throughout the system:

- **Colors** (`tokens/colors.md`) - Color palette and semantic colors
- **Typography** (`tokens/typography.md`) - Font families, sizes, line heights
- **Spacing** (`tokens/spacing.md`) - Spacing scale for layouts
- **Shadows** (`tokens/shadows.md`) - Shadow definitions for depth
- **Borders** (`tokens/borders.md`) - Border radius values
- **Transitions** (`tokens/transitions.md`) - Animation timing values

All tokens are implemented as CSS variables in `frontend/src/styles/theme/variables.css`.

### Design Philosophy

See `design-philosophy.md` for design goals, principles, and vision. This document will evolve as the target design is defined.

### Status Tracking

See `status.md` for tracking current implementation state vs target design state.

## Usage

Design tokens should be used via CSS variables throughout the codebase. Never hardcode design values - always reference the CSS variables defined in the theme.

## Related Documentation

- Layout patterns use these tokens: `../02_layout-patterns/`
- Components use these tokens: `../03_components/`
- Context variations may override tokens: `../04_context-variations/`

