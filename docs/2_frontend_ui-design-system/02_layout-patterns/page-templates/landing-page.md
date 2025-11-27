# Page Template: Landing Page

## Status

- **Status**: draft (design intent documented)
- **Last Updated**: 2025-11-26
- **Code Reference**: `frontend/src/pages/Home.tsx`
- **Design Intent**: Complete design specifications documented (2025-11-26)

## Overview

The landing page serves as the entry point to the application, featuring search functionality and featured content.

## Route

- **Route**: `/`
- **Component**: `Home`
- **File**: `frontend/src/pages/Home.tsx`

## Layout Structure

For detailed layout specifications based on workflow requirements and design intent interview, see `landing-page-layout.md`.

**Key Layout Zones** (Design Intent - 2025-11-26):

- **Floating Header**: Semi-transparent navigation (Advanced Search, Login)
- **Hero Section**: Filete-style welcome sign (disappears on scroll)
- **Full-Width Search Bar**: Sticky search interface
- **Featured Fabrica Placeholder**: 16:9 aspect ratio placeholder
- **Volumetric Indicators**: Entity count displays (WarningLabel components)
- **Featured Entities Section**: 6 subsections (5 entities per type)

## Component Composition

**New Components** (Design Intent - 2025-11-26):

- **FileteSign**: Decorative welcome sign with Filete decorations
- **FloatingHeader**: Semi-transparent navigation header
- **FullWidthSearchBar**: Full-width sticky search interface
- **VolumetricIndicators**: Entity count section (WarningLabel components)
- **FeaturedFabricaPlaceholder**: 16:9 placeholder for future component
- **FeaturedEntitiesSection**: 6 subsections with 5 entities each

**Existing Components**:

- SearchBar component (to be adapted for full-width variant)
- EntityCard components (for featured entities)
- WarningLabel components (for volumetric indicators)

## Responsive Behavior

**Design Intent** (2025-11-26):

- **Desktop/Landscape**: Full-width layout, side-by-side volumetric indicators and featured entities (optional)
- **Mobile/Portrait**: Stacked layout, alternating volumetric indicators and featured entities sections
- **All Screens**: Full width (no max-width constraint), progressive reveal

For detailed responsive specifications, see `landing-page-layout.md`.

## Implementation

- **Styles**: `frontend/src/styles/pages/home.css`
- **Components Used**: `SearchBar`, `EntityCard`

## Related Documentation

- **Detailed Layout**: `landing-page-layout.md` (comprehensive layout specification with design intent)
- **Workflow**: `../../1_frontend_ux-workflows/workflows/navigation/WORKFLOW_010_basic-navigation-access.md`
- **Routes**: `../routes.md`
- **Components**:
  - FileteSign: `../../03_components/composite/filete-sign.md` (new)
  - FloatingHeader: `../../03_components/composite/floating-header.md` (new)
  - SearchBar: `../../03_components/composite/search-bar.md`
  - EntityCard: `../../03_components/composite/entity-card.md`
  - WarningLabel: `../../03_components/primitives/warning-label.md`
- **Visual Reference**: `../../05_visual-references/Filete-Cartel-entrada.png`
