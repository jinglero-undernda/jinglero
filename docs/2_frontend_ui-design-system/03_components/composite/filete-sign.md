# Component: Filete Sign

## Status

- **Status**: draft
- **Last Updated**: 2025-11-26
- **Last Validated**: not yet validated
- **Code Reference**: To be implemented
- **Design Reference**: `docs/2_frontend_ui-design-system/05_visual-references/Filete-Cartel-entrada.png`
- **Layout Reference**: `docs/2_frontend_ui-design-system/02_layout-patterns/page-templates/landing-page-layout.md`

## Overview

Filete Sign is a decorative welcome sign component for the landing page hero section. It displays "Bienvenidos a la Usina de la Fábrica de Jingles" with colorful Filete (decorative border) decorations, mimicking vintage Argentine factory entrance signs. The sign appears on initial page load and disappears/fades out when the user scrolls down, creating a parallax effect.

## Design Intent

- **Current**: Not yet implemented
- **Target**: Decorative wooden sign with colorful Filete borders, factory signage typography, scroll-based fade-out behavior

**Visual Metaphor**: Factory entrance sign that disappears as the supervisor (user) enters the factory floor (content sections).

## Visual Specifications

### Sign Structure

- **Background**: Cream/wooden planks texture (horizontal grain)

  - Color: Cream/beige tones
  - Texture: Wooden plank appearance
  - Style: Distressed, aged, vintage aesthetic

- **Border Frame**: Dark blue frame with ornate decorative elements

  - Color: Dark blue (`--color-peronist-blue` or similar)
  - Style: Prominent frame outlining the sign
  - Decoration: Ornate floral and scrollwork motifs

- **Filete Decorations**: Colorful decorative elements
  - Colors: Red, orange, yellow, green, blue, gold accents
  - Style: Elaborate, colorful, vintage Argentine Filete style
  - Elements: Stylized flowers, foliage, intricate scrolls
  - Placement: Around border frame, top crest

### Typography

- **Main Title**: "Bienvenidos a la Usina de la Fábrica de Jingles"

  - Font: Factory signage font (`--font-family-signage`)
  - Size: Display size (`--font-size-display` - 4rem) or H1 (`--font-size-h1` - 3rem)
  - Weight: Bold (`--font-weight-bold` - 700)
  - Color: Vibrant red with dark blue outline
  - Style: Large, bold, uppercase letters
  - Letter Spacing: Tight (`--letter-spacing-tight`) for condensed industrial look
  - Text Transform: Uppercase

- **Subtitle** (optional, can be in sign or bridge to page):
  - Font: Factory signage font or body font
  - Size: H3 (`--font-size-h3` - 1.75rem) or body large
  - Color: Dark blue or design system colors
  - Style: Smaller, less ornate than main title

## Layout Specifications

### Initial State

- **Position**: Centered in viewport
- **Size**: Full viewport height (100vh) or proportional
- **Width**: Proportional to height, maintains sign aspect ratio
- **Alignment**: Centered horizontally and vertically
- **Background**: Base page background (`--color-bg-primary`)

### Scroll Behavior

- **Trigger**: User scrolls down
- **Effect**: Fade out / parallax effect
- **Animation**: Smooth transition (CSS transition or animation)
- **Final State**: Sign disappears, reveals content below
- **Implementation**: CSS `opacity`, `transform`, or `position` changes

### Responsive Behavior

- **Desktop**: Full viewport height, centered
- **Tablet**: Scales appropriately, maintains aspect ratio
- **Mobile**: Scales to viewport, may adjust aspect ratio for smaller screens

## Interactive States

- **Initial Load**: Sign fully visible, centered
- **Scrolling**: Sign fades out gradually
- **Scrolled Past**: Sign hidden or fully transparent

## Implementation Details

### Component Structure

```tsx
<FileteSign
  title="Bienvenidos a la Usina de la Fábrica de Jingles"
  subtitle="Jingles a medida y al instante" // optional
  onScroll={handleScroll} // scroll behavior handler
/>
```

### CSS File

- **Location**: `frontend/src/styles/components/filete-sign.css`
- **Dependencies**:
  - Color tokens (`--color-*`)
  - Typography tokens (`--font-*`)
  - Spacing tokens (`--spacing-*`)

### Filete Decorations

- **Implementation Options**:

  1. SVG graphics (recommended for scalability)
  2. CSS patterns and borders
  3. Background images
  4. Combination of above

- **Filete Elements**:
  - Floral motifs (red, orange, yellow)
  - Foliage (green, blue)
  - Scrollwork (gold, yellow)
  - Border frame (dark blue)

### Scroll Detection

- **Method**: JavaScript scroll event listener or Intersection Observer
- **Threshold**: Scroll position or viewport intersection
- **Animation**: CSS transitions or animations for smooth fade

## Usage Guidelines

### When to Use

- Landing page hero section
- Initial page load experience
- Brand identity and first impression

### Best Practices

- Ensure sign is fully visible on initial load
- Smooth scroll animation (no jarring transitions)
- Maintain aspect ratio across screen sizes
- Filete decorations should be colorful but not overwhelming
- Typography should be bold and readable

### Accessibility

- Ensure sufficient contrast for text readability
- Sign should not block critical content
- Scroll behavior should not interfere with navigation
- Consider reduced motion preferences

## Design Tokens Used

### Colors

- **Background**: `--color-bg-primary` (base page background)
- **Sign Background**: Cream/beige (to be defined in design tokens)
- **Frame**: `--color-peronist-blue` or dark blue
- **Title Text**: Vibrant red (to be defined) with dark blue outline
- **Filete Accents**: Red, orange, yellow, green, blue, gold

### Typography

- **Font Family**: `--font-family-signage` (Bebas Neue, Impact, Arial Black)
- **Font Size**: `--font-size-display` (4rem) or `--font-size-h1` (3rem)
- **Font Weight**: `--font-weight-bold` (700)
- **Letter Spacing**: `--letter-spacing-tight` (-0.02em)

### Spacing

- **Viewport**: Full viewport height (100vh)
- **Padding**: Appropriate padding for sign content

## Related Documentation

- **Layout**: `../../02_layout-patterns/page-templates/landing-page-layout.md`
- **Visual Reference**: `../../05_visual-references/Filete-Cartel-entrada.png`
- **Design Tokens**: `../../01_system-foundation/tokens/`
- **Design Philosophy**: `../../01_system-foundation/design-philosophy.md`

## Change History

| Version | Date       | Change                    | Author | Rationale               |
| ------- | ---------- | ------------------------- | ------ | ----------------------- |
| 1.0     | 2025-11-26 | Initial design intent doc | -      | Design intent interview |
