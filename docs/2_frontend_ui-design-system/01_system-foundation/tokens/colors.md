# Design Tokens: Colors

## Status

- **Status**: draft
- **Last Updated**: 2025-11-24
- **Last Validated**: not yet validated
- **Code Reference**: `frontend/src/styles/theme/variables.css:3-9` (current implementation)
- **Design Reference**: `design-philosophy.md`

## Overview

Color palette for the Jinglero industrial design system. Based on a **dark grey industrial theme** with **vibrant accents reserved for user interaction areas**. Colors incorporate the Peronist-era industrial aesthetic while maintaining utilitarian functionality.

## Design Philosophy

- **Base**: Dark theme with grey palette (as currently in Admin UI)
- **Vibrant accents**: Reserved for user interaction areas and highlights
- **Semantic colors**: Incorporate industrial aesthetic (e.g., warning labels use literal black octagons with white font)
- **Peronist colors**: Not heavily emphasized, but available for accent use

## Color Palette

### Base Colors (Dark Industrial Theme)

#### Background Colors

##### Primary Background

- **Value**: `#1a1a1a` (dark charcoal, weathered concrete)
- **CSS Variable**: `--color-bg-primary`
- **Usage**: Main page background, primary surface
- **Design Intent**: Weathered concrete texture, industrial base
- **Status**: draft

##### Secondary Background

- **Value**: `#242424` (slightly lighter charcoal)
- **CSS Variable**: `--color-bg-secondary`
- **Usage**: Secondary surfaces, elevated panels
- **Design Intent**: Metal panels, control surfaces
- **Status**: draft

##### Tertiary Background

- **Value**: `#2d2d2d` (medium grey)
- **CSS Variable**: `--color-bg-tertiary`
- **Usage**: Interactive elements, cards, elevated components
- **Design Intent**: Metal surfaces, control panels
- **Status**: draft

##### Surface Background

- **Value**: `#333333` (lighter grey)
- **CSS Variable**: `--color-bg-surface`
- **Usage**: Input fields, form elements, active surfaces
- **Design Intent**: Clean metal surfaces, active controls
- **Status**: draft

#### Text Colors

##### Primary Text

- **Value**: `#e0e0e0` (light grey, high contrast)
- **CSS Variable**: `--color-text-primary`
- **Usage**: Primary text content, headings
- **Design Intent**: High readability on dark surfaces
- **Status**: draft

##### Secondary Text

- **Value**: `#b0b0b0` (medium grey)
- **CSS Variable**: `--color-text-secondary`
- **Usage**: Secondary text, metadata, labels
- **Design Intent**: Reduced emphasis, supporting information
- **Status**: draft

##### Tertiary Text

- **Value**: `#808080` (muted grey)
- **CSS Variable**: `--color-text-tertiary`
- **Usage**: Placeholder text, disabled states, subtle information
- **Design Intent**: Low emphasis, background information
- **Status**: draft

##### Inverse Text

- **Value**: `#000000` (black)
- **CSS Variable**: `--color-text-inverse`
- **Usage**: Text on light/vibrant backgrounds (e.g., warning labels)
- **Design Intent**: High contrast on colored surfaces
- **Status**: draft

### Accent Colors (Vibrant, Reserved for Interactions)

#### Primary Accent

- **Value**: `#ff6b35` (vibrant orange-red, industrial warning)
- **CSS Variable**: `--color-accent-primary`
- **Usage**: Primary actions, important interactions, active states
- **Design Intent**: Industrial warning color, draws attention
- **Status**: draft

#### Secondary Accent

- **Value**: `#4ecdc4` (cyan-turquoise, industrial indicator)
- **CSS Variable**: `--color-accent-secondary`
- **Usage**: Secondary actions, links, informational highlights
- **Design Intent**: Industrial indicator light color
- **Status**: draft

#### Interactive Accent

- **Value**: `#ffe66d` (vibrant yellow, industrial highlight)
- **CSS Variable**: `--color-accent-interactive`
- **Usage**: Hover states, focus indicators, interactive highlights
- **Design Intent**: Industrial highlight, attention-grabbing
- **Status**: draft

### Peronist Colors (Available for Accent Use)

#### Peronist Blue

- **Value**: `#1e3a8a` (deep blue)
- **CSS Variable**: `--color-peronist-blue`
- **Usage**: Optional accent, decorative elements, filete porteño
- **Design Intent**: Historical reference, not heavily emphasized
- **Status**: draft

#### Peronist White

- **Value**: `#ffffff` (white)
- **CSS Variable**: `--color-peronist-white`
- **Usage**: Contrast elements, decorative accents
- **Design Intent**: Historical reference, contrast
- **Status**: draft

### Semantic Colors (Industrial Aesthetic)

#### Success (Industrial Green)

- **Value**: `#4ade80` (vibrant green, industrial "go" indicator)
- **CSS Variable**: `--color-success`
- **Usage**: Success states, confirmation messages, positive actions
- **Design Intent**: Industrial "go" indicator, clear positive feedback
- **Status**: draft

#### Error (Industrial Red)

- **Value**: `#ef4444` (vibrant red, industrial "stop" indicator)
- **CSS Variable**: `--color-error`
- **Usage**: Error states, validation errors, destructive actions
- **Design Intent**: Industrial "stop" indicator, clear negative feedback
- **Status**: draft

#### Warning (Industrial Amber)

- **Value**: `#fbbf24` (amber, industrial caution)
- **CSS Variable**: `--color-warning`
- **Usage**: Warning states, caution messages
- **Design Intent**: Industrial caution indicator
- **Status**: draft

#### Warning Label (Black Octagon)

- **Value**: `#000000` (black)
- **CSS Variable**: `--color-warning-label-bg`
- **Usage**: Stats reporting, warning labels (literal black octagons with white font)
- **Design Intent**: Contemporary Argentine food warning label reference
- **Status**: draft

#### Warning Label Text

- **Value**: `#ffffff` (white)
- **CSS Variable**: `--color-warning-label-text`
- **Usage**: Text on warning labels
- **Design Intent**: High contrast on black octagon
- **Status**: draft

### Border Colors

#### Border Primary

- **Value**: `#404040` (medium grey)
- **CSS Variable**: `--color-border-primary`
- **Usage**: Default borders, dividers
- **Design Intent**: Subtle separation, metal edges
- **Status**: draft

#### Border Secondary

- **Value**: `#555555` (lighter grey)
- **CSS Variable**: `--color-border-secondary`
- **Usage**: Hover borders, active borders
- **Design Intent**: Enhanced visibility on interaction
- **Status**: draft

#### Border Accent

- **Value**: `--color-accent-primary` (vibrant orange-red)
- **CSS Variable**: `--color-border-accent`
- **Usage**: Focus borders, active element borders
- **Design Intent**: Clear focus indication
- **Status**: draft

## Current Implementation

The current implementation uses a light theme. These values are documented for reference:

```css
--primary-color: #1a73e8;
--secondary-color: #5f6368;
--background-color: #ffffff;
--text-color: #202124;
--error-color: #d93025;
--success-color: #1e8e3e;
--warning-color: #f9ab00;
```

**Code Reference**: `frontend/src/styles/theme/variables.css:3-9`

## Usage Guidelines

### Color Application

1. **Base Colors**: Use dark grey palette for all surfaces and backgrounds
2. **Vibrant Accents**: Reserve for interactive elements, hover states, and important highlights
3. **Semantic Colors**: Use industrial aesthetic colors for clear feedback (green=go, red=stop, amber=caution)
4. **Warning Labels**: Use literal black octagons with white font for stats reporting
5. **Peronist Colors**: Available but not heavily emphasized; use sparingly for decorative accents

### Interaction States

- **Default**: Dark grey surfaces with medium grey text
- **Hover**: Vibrant accent colors (`--color-accent-interactive`)
- **Active**: Primary accent color (`--color-accent-primary`)
- **Focus**: Accent border (`--color-border-accent`)
- **Disabled**: Tertiary text color (`--color-text-tertiary`)

### Accessibility

- Maintain sufficient contrast ratios (WCAG AA minimum)
- Use vibrant accents to ensure interactive elements are clearly distinguishable
- Test color combinations for readability
- Consider colorblind users when using semantic colors

## Implementation Notes

### Migration Strategy

1. **Phase 1**: Implement base dark theme colors
2. **Phase 2**: Add vibrant accent colors for interactions
3. **Phase 3**: Update semantic colors to industrial aesthetic
4. **Phase 4**: Add Peronist colors for decorative elements

### CSS Variable Naming

- Use semantic naming: `--color-{category}-{variant}`
- Group related colors together
- Maintain backward compatibility during migration

## Change History

| Date       | Change                                                      | Author      |
| ---------- | ----------------------------------------------------------- | ----------- |
| 2025-11-24 | Redesigned color palette for industrial dark theme (draft)  | Design Team |
| 2025-11-19 | Initial documentation of current light theme implementation | Design Team |
