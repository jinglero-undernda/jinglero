# Component: Floating Header

## Status

- **Status**: draft
- **Last Updated**: 2025-11-26
- **Last Validated**: not yet validated
- **Code Reference**: To be implemented
- **Layout Reference**: `docs/2_frontend_ui-design-system/02_layout-patterns/page-templates/landing-page-layout.md`

## Overview

Floating Header is a semi-transparent navigation header that floats above the page content. It provides always-accessible navigation options (Advanced Search and Login) with factory signage aesthetic buttons. The header remains visible while the user scrolls through the landing page content.

## Design Intent

- **Current**: Not yet implemented
- **Target**: Semi-transparent floating header with factory signage buttons for Advanced Search and Login navigation

**Design Philosophy**: Subtle, non-intrusive navigation that maintains visual connection with content while providing always-accessible navigation options.

## Visual Specifications

### Header Container

- **Background**: Semi-transparent overlay

  - Background Color: `--color-bg-secondary` or `--color-bg-tertiary` with opacity (e.g., 0.8-0.9)
  - Backdrop Blur: Optional modern effect (CSS `backdrop-filter: blur()`)
  - Border: Optional subtle bottom border for separation

- **Positioning**: Fixed at top of viewport

  - Position: `fixed` or `sticky`
  - Top: `0`
  - Width: Full page width (100vw or 100%)
  - Z-index: Above page content, below modals/overlays (e.g., 100)

- **Height**: Appropriate for button height + padding
  - Padding: `--spacing-md` (16px) or `--spacing-lg` (24px) vertical
  - Button Height: Proportional to button design

### Navigation Buttons

- **Button Style**: Factory signage aesthetic

  - Typography: Factory signage font (`--font-family-signage`)
  - Font Size: H5 (`--font-size-h5` - 1.25rem) or H6 (`--font-size-h6` - 1rem)
  - Font Weight: Semi-bold (`--font-weight-semibold` - 600) or bold
  - Text Transform: Uppercase (optional, for industrial look)
  - Letter Spacing: Wide (`--letter-spacing-wide` - 0.05em) for uppercase

- **Button Colors**:

  - Background: Design system accent colors or primary colors
  - Text: High contrast (white or light text on dark background)
  - Hover: Enhanced accent or interactive color
  - Active: Pressed state styling

- **Button Layout**:
  - Alignment: Left/right or centered (to be determined)
  - Spacing: Appropriate gap between buttons (`--spacing-md` or `--spacing-lg`)
  - Padding: `--spacing-sm` to `--spacing-md` horizontal, `--spacing-xs` to `--spacing-sm` vertical

### Button Variants

#### Advanced Search Button

- **Label**: "Búsqueda Avanzada" or "Advanced Search"
- **Route**: `/search/advanced`
- **Icon**: Optional search icon
- **Style**: Factory signage aesthetic

#### Login/Authentication Button

- **Label**: "Iniciar Sesión" or "Login" (or user status if authenticated)
- **Route**: `/admin/login` or user dashboard
- **Icon**: Optional user/login icon
- **Style**: Factory signage aesthetic
- **Conditional**: May show user status or logout if authenticated

## Layout Specifications

### Desktop

- **Width**: Full page width
- **Button Alignment**: Left/right or centered
- **Button Spacing**: Horizontal gap between buttons
- **Height**: Proportional to button height + padding

### Tablet

- **Layout**: Similar to desktop, may adjust button spacing
- **Button Size**: May scale slightly

### Mobile

- **Layout Options**:

  1. **Stacked Buttons**: Buttons stack vertically
  2. **Hamburger Menu**: Compact menu for mobile
  3. **Horizontal**: Buttons remain horizontal with adjusted spacing

- **Button Size**: May adjust for touch targets (minimum 44px height)

## Interactive States

### Default State

- **Background**: Semi-transparent
- **Buttons**: Default styling
- **Visibility**: Always visible while scrolling

### Hover State

- **Buttons**: Enhanced styling (hover effect)
  - Background: Accent color or interactive color
  - Scale: Optional slight scale (1.05)
  - Shadow: Optional enhanced shadow

### Active State

- **Buttons**: Pressed styling
  - Background: Darker shade
  - Scale: Optional slight scale down (0.98)

### Scrolled State

- **Header**: Remains visible (fixed positioning)
- **Background**: May adjust opacity based on scroll position
- **Shadow**: Optional shadow for depth when scrolled

## Implementation Details

### Component Structure

```tsx
<FloatingHeader
  showAdvancedSearch={true}
  showLogin={true}
  isAuthenticated={false}
  onAdvancedSearchClick={handleAdvancedSearch}
  onLoginClick={handleLogin}
/>
```

### CSS File

- **Location**: `frontend/src/styles/components/floating-header.css`
- **Dependencies**:
  - Color tokens (`--color-*`)
  - Typography tokens (`--font-*`)
  - Spacing tokens (`--spacing-*`)
  - Shadow tokens (`--shadow-*`)

### Positioning

- **Method**: CSS `position: fixed` or `position: sticky`
- **Top**: `0`
- **Width**: `100%` or `100vw`
- **Z-index**: Appropriate for floating behavior (e.g., 100)

### Transparency

- **Background**: `rgba()` with opacity or CSS `opacity` property
- **Backdrop Blur**: `backdrop-filter: blur(8px)` (optional, modern browsers)

## Usage Guidelines

### When to Use

- Landing page navigation
- Always-accessible navigation options
- Non-intrusive navigation overlay

### Best Practices

- Keep header subtle (semi-transparent)
- Ensure buttons are clearly visible and accessible
- Maintain factory signage aesthetic
- Don't compete with primary content
- Ensure sufficient contrast for readability

### Accessibility

- Ensure sufficient contrast for text readability
- Touch targets minimum 44px height (mobile)
- Keyboard navigation support
- Screen reader labels
- Focus states clearly visible

## Design Tokens Used

### Colors

- **Background**: `--color-bg-secondary` or `--color-bg-tertiary` with opacity
- **Button Background**: `--color-accent-primary` or `--color-accent-interactive`
- **Button Text**: `--color-text-inverse` or `--color-text-primary`
- **Hover**: `--color-accent-interactive` or enhanced accent
- **Border**: `--color-border-primary` (optional)

### Typography

- **Font Family**: `--font-family-signage` (Bebas Neue, Impact, Arial Black)
- **Font Size**: `--font-size-h5` (1.25rem) or `--font-size-h6` (1rem)
- **Font Weight**: `--font-weight-semibold` (600) or `--font-weight-bold` (700)
- **Letter Spacing**: `--letter-spacing-wide` (0.05em) for uppercase

### Spacing

- **Padding**: `--spacing-md` (16px) or `--spacing-lg` (24px) vertical
- **Button Gap**: `--spacing-md` (16px) or `--spacing-lg` (24px) horizontal
- **Button Padding**: `--spacing-sm` to `--spacing-md` horizontal

### Shadows

- **Shadow**: `--shadow-md` or `--shadow-lg` (optional, for depth)

## Related Documentation

- **Layout**: `../../02_layout-patterns/page-templates/landing-page-layout.md`
- **Design Tokens**: `../../01_system-foundation/tokens/`
- **Design Philosophy**: `../../01_system-foundation/design-philosophy.md`
- **Button Component**: `../primitives/button.md`

## Change History

| Version | Date       | Change                    | Author | Rationale               |
| ------- | ---------- | ------------------------- | ------ | ----------------------- |
| 1.0     | 2025-11-26 | Initial design intent doc | -      | Design intent interview |
