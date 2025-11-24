# Design Tokens: Shadows

## Status

- **Status**: draft
- **Last Updated**: 2025-11-24
- **Last Validated**: not yet validated
- **Code Reference**: `frontend/src/styles/theme/variables.css:34-36` (current implementation)
- **Design Reference**: `design-philosophy.md`

## Overview

Shadow definitions for the Jinglero industrial design system. Shadows create **industrial depth** suggesting **concrete and metal textures**, weathered surfaces, and mechanical elevation. Shadows should feel substantial and physical, reflecting the utilitarian industrial aesthetic.

## Design Philosophy

- **Material depth**: Shadows suggest concrete and metal surfaces
- **Weathered surfaces**: Patina and wear marks through shadow variation
- **Tactility**: UI elements should feel substantial and mechanical
- **Industrial elevation**: Clear hierarchy through shadow depth

## Shadow Values

### Subtle Depth (Concrete Texture)

#### Shadow XS (Minimal Elevation)

- **Value**: `0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)`
- **CSS Variable**: `--shadow-xs`
- **Usage**: Subtle surface texture, minimal elevation
- **Design Intent**: Weathered concrete texture, slight depth
- **Status**: draft

#### Shadow SM (Small Elevation)

- **Value**: `0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.05)`
- **CSS Variable**: `--shadow-sm`
- **Usage**: Small cards, buttons, subtle elevation
- **Design Intent**: Concrete panel elevation, weathered surface
- **Status**: draft

### Standard Depth (Metal Panels)

#### Shadow MD (Standard Elevation)

- **Value**: `0 4px 8px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.08)`
- **CSS Variable**: `--shadow-md`
- **Usage**: Cards, containers, standard elevation
- **Design Intent**: Metal panel depth, industrial control surface
- **Status**: draft

#### Shadow LG (High Elevation)

- **Value**: `0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)`
- **CSS Variable**: `--shadow-lg`
- **Usage**: Elevated panels, modals, prominent elements
- **Design Intent**: Raised metal control panel, substantial depth
- **Status**: draft

### Prominent Depth (Industrial Machinery)

#### Shadow XL (Very High Elevation)

- **Value**: `0 12px 24px rgba(0, 0, 0, 0.7), 0 6px 12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)`
- **CSS Variable**: `--shadow-xl`
- **Usage**: Modals, overlays, very prominent elements
- **Design Intent**: Industrial machinery elevation, maximum depth
- **Status**: draft

### Inset Shadows (Recessed Elements)

#### Shadow Inset (Recessed)

- **Value**: `inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(0, 0, 0, 0.4)`
- **CSS Variable**: `--shadow-inset`
- **Usage**: Input fields, recessed buttons, embedded panels
- **Design Intent**: Recessed metal surface, control panel inset
- **Status**: draft

### Glow Effects (Interactive States)

#### Shadow Glow Primary (Accent Glow)

- **Value**: `0 0 8px rgba(255, 107, 53, 0.4), 0 0 16px rgba(255, 107, 53, 0.2)`
- **CSS Variable**: `--shadow-glow-primary`
- **Usage**: Focus states, active interactive elements
- **Design Intent**: Industrial indicator light glow
- **Status**: draft

#### Shadow Glow Interactive (Hover Glow)

- **Value**: `0 0 6px rgba(255, 230, 109, 0.3), 0 0 12px rgba(255, 230, 109, 0.15)`
- **CSS Variable**: `--shadow-glow-interactive`
- **Usage**: Hover states, interactive highlights
- **Design Intent**: Subtle industrial highlight glow
- **Status**: draft

## Current Implementation

The current implementation uses standard web shadows:

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

**Code Reference**: `frontend/src/styles/theme/variables.css:34-36`

## Usage Guidelines

### Shadow Hierarchy

1. **Subtle Depth** (`--shadow-xs`, `--shadow-sm`): Use for minimal elevation, surface texture
2. **Standard Depth** (`--shadow-md`): Use for cards, containers, standard components
3. **High Elevation** (`--shadow-lg`, `--shadow-xl`): Use for modals, overlays, prominent elements
4. **Recessed** (`--shadow-inset`): Use for input fields, embedded panels, recessed controls
5. **Glow Effects**: Use for interactive states, focus indicators

### Material Application

- **Concrete**: Use subtle shadows with inset highlights for weathered texture
- **Metal**: Use standard to high elevation shadows for panel depth
- **Machinery**: Use prominent shadows for elevated control surfaces

### Interaction States

- **Default**: Standard shadow (`--shadow-md`)
- **Hover**: Enhanced shadow (`--shadow-lg`) + glow (`--shadow-glow-interactive`)
- **Active**: Inset shadow (`--shadow-inset`) for pressed state
- **Focus**: Glow effect (`--shadow-glow-primary`)

### Dark Theme Considerations

- Shadows use higher opacity on dark backgrounds for visibility
- Inset highlights use subtle white overlays for depth
- Glow effects use accent colors for clear indication

## Implementation Notes

### Shadow Composition

Industrial shadows combine:

1. **Outer shadow**: Creates elevation and depth
2. **Inner shadow**: Creates surface texture and patina
3. **Multiple layers**: Builds complex industrial depth

### Performance

- Use `will-change: transform` for animated shadow changes
- Consider `transform: translateZ(0)` for hardware acceleration
- Test shadow performance on lower-end devices

### Accessibility

- Ensure sufficient contrast even with shadows
- Don't rely solely on shadows for visual hierarchy
- Test with reduced motion preferences

## Change History

| Date       | Change                                                                | Author      |
| ---------- | --------------------------------------------------------------------- | ----------- |
| 2025-11-24 | Redesigned shadows for industrial depth and material textures (draft) | Design Team |
| 2025-11-19 | Initial documentation of current implementation                       | Design Team |
