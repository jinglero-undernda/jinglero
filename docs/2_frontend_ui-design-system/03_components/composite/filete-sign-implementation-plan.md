# FileteSign Component Implementation Plan

**Date Created**: 2025-11-26  
**Planner**: AI Assistant  
**Status**: Planning Complete - Ready for Implementation  
**Gap ID**: GAP-007

## Overview

This document outlines the implementation plan for the FileteSign component, a decorative welcome sign for the landing page hero section with Filete decorations and scroll-based fade-out behavior.

## Component Structure

### Component File
- **Location**: `frontend/src/components/composite/FileteSign.tsx`
- **Type**: React functional component with TypeScript
- **Props Interface**:
  ```typescript
  interface FileteSignProps {
    title?: string; // Default: "Bienvenidos a la Usina de la Fábrica de Jingles"
    subtitle?: string; // Optional subtitle
    onScroll?: (scrollY: number) => void; // Optional scroll handler
    className?: string; // Optional additional classes
  }
  ```

### Styles File
- **Location**: `frontend/src/styles/components/filete-sign.css`
- **Dependencies**: Design system tokens (colors, typography, spacing)

## Asset Requirements

### Filete Decorations
1. **SVG Graphics** (Recommended)
   - Floral motifs (red, orange, yellow)
   - Foliage elements (green, blue)
   - Scrollwork patterns (gold, yellow)
   - Border frame decorations (dark blue)
   - Location: `frontend/src/assets/filete/` or inline SVG

2. **Alternative**: CSS-based patterns
   - Use CSS gradients and borders for simpler decorations
   - Less detailed but faster to implement

### Visual Reference
- **Design Reference**: `docs/2_frontend_ui-design-system/05_visual-references/Filete-Cartel-entrada.png`
- **Style**: Vintage Argentine Filete style with colorful borders

## Scroll Behavior Implementation

### Approach: Custom Hook + CSS Transitions

1. **Create Scroll Detection Hook**
   - **File**: `frontend/src/hooks/useScrollDetection.ts`
   - **Functionality**:
     - Track window scroll position
     - Calculate opacity based on scroll distance
     - Return scroll state for component use
   - **Implementation**:
     ```typescript
     export function useScrollDetection(options?: {
       threshold?: number; // Scroll distance before fade starts
       fadeDistance?: number; // Distance over which to fade
     }): {
       scrollY: number;
       opacity: number;
       isScrolled: boolean;
     }
     ```

2. **Fade-Out Animation**
   - Use CSS `opacity` and `transform` for performance
   - Smooth transition using `var(--transition-normal)`
   - Start fade when scroll > threshold (e.g., 100px)
   - Complete fade when scroll > threshold + fadeDistance (e.g., 300px)

3. **Performance Considerations**
   - Use `requestAnimationFrame` for scroll updates
   - Throttle scroll events
   - Use CSS transforms instead of position changes
   - Consider `will-change: opacity` for optimization

## Integration Points

### Home.tsx Integration
- **Location**: Replace current hero section (`Home.tsx:59-63`)
- **Structure**:
  ```tsx
  <FileteSign
    title="Bienvenidos a la Usina de la Fábrica de Jingles"
    subtitle="Jingles a medida y al instante"
  />
  ```

### Layout Considerations
- FileteSign should be first element in `.home-page`
- Full viewport height on initial load
- Positioned above search bar and other content
- Z-index should be below FloatingHeader (if implemented)

## Design Token Usage

### Colors
- **Background**: `--color-bg-primary` (base page)
- **Sign Background**: Cream/beige (may need new token or use existing)
- **Frame**: `--color-peronist-blue`
- **Title Text**: Vibrant red (may need new token) with dark blue outline
- **Filete Accents**: Use existing accent colors or create new tokens

### Typography
- **Font Family**: `--font-family-signage`
- **Font Size**: `--font-size-display` (4rem) or `--font-size-h1` (3rem)
- **Font Weight**: `--font-weight-bold` (700)
- **Letter Spacing**: `--letter-spacing-tight` (-0.02em)
- **Text Transform**: Uppercase

### Spacing
- **Viewport Height**: 100vh (full viewport)
- **Padding**: Use `--spacing-xl` or `--spacing-lg` for internal spacing

### Transitions
- **Fade Animation**: `var(--transition-normal)` (250ms ease)

## Implementation Steps

1. **Create Scroll Detection Hook**
   - Implement `useScrollDetection.ts`
   - Test scroll tracking accuracy
   - Optimize performance

2. **Create FileteSign Component**
   - Basic structure with title/subtitle
   - Apply factory signage typography
   - Add wooden sign background styling
   - Test responsive behavior

3. **Add Filete Decorations**
   - Create or source SVG assets
   - Implement decorative borders
   - Add floral and scrollwork motifs
   - Test visual appearance

4. **Implement Scroll Fade-Out**
   - Integrate scroll detection hook
   - Apply opacity/transform based on scroll
   - Test smoothness and performance
   - Ensure accessibility (reduced motion)

5. **Integration**
   - Replace hero section in `Home.tsx`
   - Test layout flow
   - Verify responsive behavior
   - Test across browsers

## Dependencies

### Required
- Design system tokens (available)
- React hooks (useState, useEffect, useRef)
- CSS transitions support

### Optional
- Filete decoration SVG assets (can use CSS fallback)
- Intersection Observer API (alternative to scroll events)

## Risk Mitigation

1. **Asset Creation Time**
   - Start with CSS-based decorations
   - Iterate with SVG assets later
   - Consider using existing Filete patterns if available

2. **Performance Concerns**
   - Use CSS transforms instead of position changes
   - Throttle scroll events
   - Test on lower-end devices

3. **Accessibility**
   - Respect `prefers-reduced-motion`
   - Ensure text contrast meets WCAG standards
   - Don't block critical content

## Acceptance Criteria

- [ ] FileteSign component created with proper structure
- [ ] Factory signage typography applied
- [ ] Scroll detection hook implemented
- [ ] Fade-out animation works smoothly
- [ ] Filete decorations visible (SVG or CSS)
- [ ] Responsive behavior tested
- [ ] Integrated into Home.tsx
- [ ] Performance acceptable
- [ ] Accessibility considerations met

## Next Steps

1. Begin implementation with scroll detection hook
2. Create basic FileteSign component structure
3. Add Filete decorations (start with CSS, upgrade to SVG)
4. Integrate into landing page
5. Test and iterate

## Related Documentation

- Component Spec: `filete-sign.md`
- Layout Reference: `../../02_layout-patterns/page-templates/landing-page-layout.md`
- Design Tokens: `../../01_system-foundation/tokens/`

