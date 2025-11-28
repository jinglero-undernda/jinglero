# Component: Filete Sign

## Status

- **Status**: draft
- **Last Updated**: 2025-11-28
- **Last Validated**: 2025-11-28
- **Validation Report**: `filete-sign-validation-2025-11-28.md`
- **Gap Analysis**: `filete-sign-gap-analysis-2025-11-28.md`
- **Refactoring Plan**: `filete-sign-refactoring-plan-2025-11-28.md`
- **Code Reference**: `docs/2_frontend_ui-design-system/05_visual-references/filete.html:1-169`
- **Design Reference**: `docs/2_frontend_ui-design-system/05_visual-references/Filete-Cartel-entrada.png`
- **Layout Reference**: `docs/2_frontend_ui-design-system/02_layout-patterns/page-templates/landing-page-layout.md`

## Overview

Filete Sign is a decorative welcome sign component for the landing page hero section. It displays "Bienvenido a la Usina de la Fábrica de Jingles" with colorful Filete (decorative border) decorations, mimicking vintage Argentine factory entrance signs. The sign appears on initial page load and disappears/fades out when the user scrolls down, creating a parallax effect.

## Design Intent

- **Current**: SVG implementation documented (2025-11-28)
- **Target**: Decorative sign with colorful Filete borders, vintage Argentine Fileteo Porteño style, factory signage typography, scroll-based fade-out behavior

**Visual Metaphor**: Factory entrance sign that disappears as the supervisor (user) enters the factory floor (content sections).

**Implementation**: SVG-based sign with dark background board, gold gradient borders, corner scroll ornaments, central flowers, and three-line text layout.

## Visual Specifications

### Sign Structure

- **Background Board**: Dark board with rounded corners

  - Color: `#1a1a1a` (dark charcoal)
  - Border: `#4a4a4a` (medium grey), stroke-width: 2
  - Border Radius: 15px (rx="15")
  - Dimensions: 980x330 (within 1000x350 viewBox)
  - Position: x="10" y="10"
  - **Code Reference**: `filete.html:102`

- **Inner Border Frame**: Double border with gold gradient and red accent

  - **Outer Border**: Gold gradient (`url(#goldGrad)`), stroke-width: 3
    - Position: x="25" y="25", dimensions: 950x300, rx="10"
    - **Code Reference**: `filete.html:105`
  - **Inner Border**: Red accent (`#e03131`), stroke-width: 1.5
    - Position: x="32" y="32", dimensions: 936x286, rx="5"
    - **Code Reference**: `filete.html:106`

- **Filete Decorations**: SVG-based decorative elements
  - **Corner Scroll Ornaments**: 4 corner ornaments (reusable component)
    - Gold gradient spiral with green leaf accents
    - Decorative ball (red gradient) at joint
    - Positioned at all 4 corners with rotation/mirroring
    - Scale: 1.5x
    - **Code Reference**: `filete.html:74-88, 110-116`
  - **Central Flowers**: 2 side accent flowers
    - 5-petal flowers with red gradient
    - Gold center circle
    - Positioned at left and right sides (y=175)
    - Scale: 1.2x, rotated 90° and -90°
    - **Code Reference**: `filete.html:91-98, 119-120`
  - **Decorative Lines**: Swirls connecting text area
    - Color: `#63e6be` (turquoise), stroke-width: 2, opacity: 0.8
    - Curved paths above and below text
    - **Code Reference**: `filete.html:123-124`

### Typography

The sign uses a three-line text layout with decorative fonts:

- **Top Line**: "Bienvenido a la"

  - Font: `'Rye', serif` (Google Fonts)
  - Size: 45px (font-size="45")
  - Color: `#FFF` (white)
  - Position: x="500" y="130" (centered)
  - Letter Spacing: 2
  - Text Anchor: middle
  - Filter: `url(#textShadow)` (3D shadow effect)
  - **Code Reference**: `filete.html:130-138`

- **Main Title**: "USINA"

  - Font: `'Sancreek', serif` (Google Fonts)
  - Size: 80px (font-size="80")
  - Fill: Gold gradient (`url(#goldGrad)`)
  - Stroke: `#5c4208` (dark brown), stroke-width: 1.5
  - Position: x="500" y="200" (centered)
  - Letter Spacing: 3
  - Text Anchor: middle
  - Filter: `url(#textShadow)` (3D shadow effect)
  - **Code Reference**: `filete.html:142-152`

- **Bottom Line**: "de la Fábrica de Jingles"
  - Font: `'Rye', serif` (Google Fonts)
  - Size: 40px (font-size="40")
  - Color: `#FFF` (white)
  - Position: x="500" y="260" (centered)
  - Letter Spacing: 1
  - Text Anchor: middle
  - Filter: `url(#textShadow)` (3D shadow effect)
  - **Code Reference**: `filete.html:155-163`

**Text Shadow Filter**: Creates fake 3D shadow typical of Fileteo signs

- **Code Reference**: `filete.html:68-71`
- Two drop shadows: dx="3" dy="3" (black, opacity 1) and dx="2" dy="2" (black, opacity 0.5)

## Layout Specifications

### SVG Structure

- **ViewBox**: `0 0 1000 350` (approximately 3:1 aspect ratio)
- **Preserve Aspect Ratio**: `xMidYMid meet`
- **Container**: Full width with max-width: 900px, padding: 20px
- **Code Reference**: `filete.html:47`

### Initial State

- **Position**: Centered in viewport (flexbox centering)
- **Size**: Responsive, maintains 3:1 aspect ratio
- **Width**: 100% of container, max-width: 900px
- **Alignment**: Centered horizontally and vertically
- **Background**: Base page background (`#f3f4f6` in reference, should use `--color-bg-primary`)
- **Drop Shadow**: `drop-shadow-2xl` (Tailwind class, for visual depth)

### Scroll Behavior

- **Trigger**: User scrolls down
- **Effect**: Fade out / parallax effect
- **Animation**: Smooth transition (CSS transition or animation)
- **Final State**: Sign disappears, reveals content below
- **Implementation**: CSS `opacity`, `transform`, or `position` changes
- **Note**: Scroll behavior to be implemented in React component

### Responsive Behavior

- **Desktop**: Full viewport height, centered, maintains aspect ratio
- **Tablet**: Scales appropriately, maintains 3:1 aspect ratio
- **Mobile**: Scales to viewport, preserves aspect ratio via `preserveAspectRatio="xMidYMid meet"`

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

### Filete Decorations (SVG Implementation)

**Implementation**: SVG graphics with reusable components and gradients

- **Gradients** (defined in `<defs>`):

  - **Gold Gradient** (`goldGrad`): `#FFF5C3` → `#FFD700` → `#DAA520`
    - Linear gradient: x1="0%" y1="0%" x2="100%" y2="100%"
    - Used for: Border frame, main title text, corner scroll spirals
    - **Code Reference**: `filete.html:51-55`
  - **Flower Gradient** (`flowerGrad`): `#ff6b6b` → `#c92a2a`
    - Linear gradient: x1="0%" y1="0%" x2="0%" y2="100%"
    - Used for: Flower petals, decorative balls
    - **Code Reference**: `filete.html:57-60`
  - **Leaf Gradient** (`leafGrad`): `#63e6be` → `#0ca678`
    - Linear gradient: x1="0%" y1="0%" x2="100%" y2="0%"
    - Used for: Acanthus leaves in corner scrolls
    - **Code Reference**: `filete.html:62-65`

- **Reusable Components**:

  - **Corner Scroll** (`cornerScroll`): Reusable ornament for 4 corners
    - Main spiral: Gold gradient stroke, stroke-width: 4
    - Acanthus leaves: Green gradient fill with black stroke
    - Inner volute: White stroke, opacity: 0.6
    - Decorative ball: Red gradient fill, black stroke
    - **Code Reference**: `filete.html:74-88`
  - **Fileteo Flower** (`fileteoFlower`): 5-petal flower
    - 5 petals: Red gradient fill
    - Center: Gold circle (`#FFD700`)
    - **Code Reference**: `filete.html:91-98`

- **Filete Elements**:
  - **Corner Ornaments**: 4 corner scrolls (top-left, top-right, bottom-left, bottom-right)
    - Mirrored and rotated for each corner
    - Scale: 1.5x
  - **Central Flowers**: 2 side accent flowers
    - Left side: Rotated 90°
    - Right side: Rotated -90°
    - Scale: 1.2x
  - **Decorative Lines**: Curved turquoise lines above and below text
    - Color: `#63e6be`, opacity: 0.8
    - Stroke-width: 2

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

- **Background**: `--color-bg-primary` (base page background, `#1a1a1a` in reference)
- **Sign Background Board**: `#1a1a1a` (dark charcoal)
- **Board Border**: `#4a4a4a` (medium grey)
- **Gold Gradient**:
  - Start: `#FFF5C3` (light cream)
  - Mid: `#FFD700` (gold)
  - End: `#DAA520` (goldenrod)
- **Flower Gradient**:
  - Start: `#ff6b6b` (coral red)
  - End: `#c92a2a` (dark red)
- **Leaf Gradient**:
  - Start: `#63e6be` (turquoise)
  - End: `#0ca678` (teal)
- **Red Border Accent**: `#e03131` (vibrant red)
- **Text Colors**:
  - White: `#FFF` (for top and bottom lines)
  - Gold gradient: `url(#goldGrad)` (for main title)
  - Title stroke: `#5c4208` (dark brown)
- **Decorative Lines**: `#63e6be` (turquoise), opacity: 0.8

### Typography

- **Top/Bottom Lines Font**: `'Rye', serif` (Google Fonts - decorative serif)
  - Sizes: 45px (top), 40px (bottom)
  - Letter spacing: 2 (top), 1 (bottom)
- **Main Title Font**: `'Sancreek', serif` (Google Fonts - decorative serif)
  - Size: 80px
  - Letter spacing: 3
- **Note**: These fonts are decorative and specific to Fileteo style. Consider fallbacks or system alternatives for production.

### Spacing

- **ViewBox**: 1000x350 (3:1 aspect ratio)
- **Container**: Max-width: 900px, padding: 20px
- **Sign Board**: 980x330 (with 10px margin from viewBox edges)
- **Inner Border**: 950x300 (outer), 936x286 (inner)
- **Text Positioning**:
  - Top line: y="130"
  - Main title: y="200"
  - Bottom line: y="260"

## Related Documentation

- **Layout**: `../../02_layout-patterns/page-templates/landing-page-layout.md`
- **Visual Reference**: `../../05_visual-references/Filete-Cartel-entrada.png`
- **Design Tokens**: `../../01_system-foundation/tokens/`
- **Design Philosophy**: `../../01_system-foundation/design-philosophy.md`

## Change History

| Version | Date       | Change                                         | Author | Rationale                           |
| ------- | ---------- | ---------------------------------------------- | ------ | ----------------------------------- |
| 2.0     | 2025-11-28 | Documented SVG implementation from filete.html | -      | Better implementation specification |
| 1.0     | 2025-11-26 | Initial design intent doc                      | -      | Design intent interview             |

## Implementation Reference

### SVG Structure Details

The implementation uses a complete SVG with:

- Reusable components (`<g>` elements) for corner scrolls and flowers
- Linear gradients for volume and depth
- Text filters for 3D shadow effects
- Precise positioning for all decorative elements

**Key Implementation Notes**:

- All decorative elements are defined in `<defs>` for reusability
- Corner scrolls use `transform` attributes for positioning and mirroring
- Text uses `text-anchor="middle"` for center alignment
- ViewBox maintains 3:1 aspect ratio for consistent scaling

**Code Reference**: `docs/2_frontend_ui-design-system/05_visual-references/filete.html:1-169`
