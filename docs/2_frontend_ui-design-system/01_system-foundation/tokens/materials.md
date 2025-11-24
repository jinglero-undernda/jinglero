# Design Tokens: Materials

## Status

- **Status**: draft
- **Last Updated**: 2025-11-24
- **Last Validated**: not yet validated
- **Design Reference**: `design-philosophy.md`

## Overview

Material texture definitions for the Jinglero industrial design system. Materials define the **concrete and metal textures**, **weathered surfaces**, and **patina** that create the authentic industrial aesthetic. These tokens guide the visual treatment of surfaces throughout the interface.

## Design Philosophy

- **Surfaces**: Concrete and metal textures, weathered and soiled from handling
- **Aging**: Patina and wear marks suggest years of industrial use
- **Tactility**: UI elements should feel substantial and mechanical
- **Authenticity**: Materials should evoke real industrial surfaces

## Material Categories

### Concrete Surfaces

#### Concrete Primary (Weathered)

- **Background**: `#1a1a1a` (dark charcoal)
- **Texture**: Subtle grain, weathered surface
- **CSS Variable**: `--material-concrete-primary`
- **Usage**: Main backgrounds, primary surfaces
- **Visual Treatment**:
  - Subtle noise/grain texture overlay
  - Slight variation in tone
  - Weathered appearance
- **Status**: draft

#### Concrete Secondary (Aged)

- **Background**: `#242424` (slightly lighter charcoal)
- **Texture**: More pronounced grain, aged patina
- **CSS Variable**: `--material-concrete-secondary`
- **Usage**: Secondary surfaces, elevated panels
- **Visual Treatment**:
  - More visible texture
  - Slight discoloration patches
  - Years of use patina
- **Status**: draft

#### Concrete Surface (Handled)

- **Background**: `#2d2d2d` (medium grey)
- **Texture**: Soiled from handling, wear marks
- **CSS Variable**: `--material-concrete-surface`
- **Usage**: Interactive elements, frequently touched surfaces
- **Visual Treatment**:
  - Visible wear patterns
  - Soiled areas from handling
  - Smudges and marks
- **Status**: draft

### Metal Surfaces

#### Metal Primary (Weathered Steel)

- **Background**: `#2d2d2d` (medium grey)
- **Texture**: Brushed metal, slight rust patina
- **CSS Variable**: `--material-metal-primary`
- **Usage**: Control panels, metal surfaces
- **Visual Treatment**:
  - Brushed metal grain direction
  - Subtle rust discoloration
  - Reflective highlights
- **Status**: draft

#### Metal Secondary (Aged Aluminum)

- **Background**: `#333333` (lighter grey)
- **Texture**: Dull aluminum, oxidation marks
- **CSS Variable**: `--material-metal-secondary`
- **Usage**: Buttons, interactive metal elements
- **Visual Treatment**:
  - Dull oxidized surface
  - Scratches and scuffs
  - Slight reflective quality
- **Status**: draft

#### Metal Control Panel (Clean Metal)

- **Background**: `#3a3a3a` (clean grey)
- **Texture**: Clean brushed metal, minimal patina
- **CSS Variable**: `--material-metal-control`
- **Usage**: Active controls, clean interactive surfaces
- **Visual Treatment**:
  - Clean brushed finish
  - Clear reflective highlights
  - Minimal wear
- **Status**: draft

### Patina Effects

#### Patina Light (Subtle Aging)

- **Effect**: Subtle discoloration, slight oxidation
- **CSS Variable**: `--patina-light`
- **Usage**: Aged surfaces, subtle wear
- **Visual Treatment**:
  - Slight color variation
  - Minimal oxidation spots
  - Gentle aging
- **Status**: draft

#### Patina Medium (Visible Aging)

- **Effect**: Visible rust, oxidation, wear marks
- **CSS Variable**: `--patina-medium`
- **Usage**: Weathered surfaces, industrial character
- **Visual Treatment**:
  - Rust discoloration patches
  - Oxidation marks
  - Visible wear patterns
- **Status**: draft

#### Patina Heavy (Heavy Wear)

- **Effect**: Heavy rust, deep wear, significant aging
- **CSS Variable**: `--patina-heavy`
- **Usage**: Decorative elements, character surfaces
- **Visual Treatment**:
  - Heavy rust patches
  - Deep scratches and wear
  - Significant aging
- **Status**: draft

## Material Patterns

### Texture Overlays

#### Concrete Grain

- **Pattern**: Subtle noise/grain texture
- **CSS Variable**: `--texture-concrete-grain`
- **Usage**: Concrete surface overlays
- **Implementation**: CSS background-image with noise pattern or SVG texture
- **Status**: draft

#### Metal Brushed

- **Pattern**: Linear brushed metal texture
- **CSS Variable**: `--texture-metal-brushed`
- **Usage**: Metal surface overlays
- **Implementation**: CSS linear-gradient or SVG pattern
- **Status**: draft

#### Wear Marks

- **Pattern**: Scratches, scuffs, handling marks
- **CSS Variable**: `--texture-wear-marks`
- **Usage**: Frequently touched surfaces
- **Implementation**: CSS background-image with subtle marks
- **Status**: draft

## Implementation Approaches

### CSS Background Patterns

```css
/* Concrete texture example */
.material-concrete-primary {
  background-color: #1a1a1a;
  background-image: radial-gradient(
      circle at 20% 50%,
      rgba(255, 255, 255, 0.02) 0%,
      transparent 50%
    ), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.02) 0%, transparent
        50%);
  background-size: 100px 100px, 150px 150px;
  background-position: 0 0, 50px 50px;
}

/* Metal brushed texture example */
.material-metal-primary {
  background-color: #2d2d2d;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    transparent 2px,
    transparent 98px,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 100px 100%;
}
```

### SVG Patterns

- Use SVG patterns for more complex textures
- Embed as data URIs or external files
- Consider performance implications

### Image Overlays

- Use subtle PNG overlays for complex textures
- Ensure images are optimized and repeatable
- Consider loading performance

## Usage Guidelines

### Material Selection

1. **Concrete**: Use for backgrounds, large surfaces, structural elements
2. **Metal**: Use for interactive elements, control panels, buttons
3. **Patina**: Apply sparingly for character and authenticity

### Surface Hierarchy

- **Primary surfaces**: Concrete primary (weathered)
- **Secondary surfaces**: Concrete secondary or metal primary
- **Interactive surfaces**: Metal control panel (clean)
- **Decorative elements**: Apply patina for character

### Consistency

- Maintain consistent material treatment within component types
- Don't mix too many materials in a single view
- Use patina consistently to suggest age and use

### Performance Considerations

- Use CSS patterns when possible (better performance)
- Optimize image textures for web
- Consider texture complexity vs. performance trade-offs
- Test on lower-end devices

## Accessibility

- Ensure textures don't reduce readability
- Maintain sufficient contrast with text
- Don't rely solely on texture for visual hierarchy
- Test with users who may have visual sensitivities

## Change History

| Date       | Change                                          | Author      |
| ---------- | ----------------------------------------------- | ----------- |
| 2025-11-24 | Initial material texture tokens created (draft) | Design Team |
