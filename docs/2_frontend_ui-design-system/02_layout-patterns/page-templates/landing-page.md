# Page Template: Landing Page

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `frontend/src/pages/Home.tsx`

## Overview

The landing page serves as the entry point to the application, featuring search functionality and featured content.

## Route

- **Route**: `/`
- **Component**: `Home`
- **File**: `frontend/src/pages/Home.tsx`

## Layout Structure

For detailed layout specifications based on workflow requirements, see `landing-page-layout.md`.

**Key Layout Zones**:

- Hero Section (title, subtitle, global search)
- Featured Content Section (Featured Fabricas, Featured Entities)
- Navigation Links Section (Advanced Search, Login)

## Component Composition

- SearchBar component (prominent search interface)
- Featured Fabricas list (6 most recent)
- Navigation elements

## Responsive Behavior

- **Desktop (> 768px)**: Multi-column grid, max-width 1200px container
- **Mobile (≤ 768px)**: Single column layout, reduced spacing

For detailed responsive specifications, see `landing-page-layout.md`.

## Implementation

- **Styles**: `frontend/src/styles/pages/home.css`
- **Components Used**: `SearchBar`, `EntityCard`

## Related Documentation

- **Detailed Layout**: `landing-page-layout.md` (comprehensive layout specification per WORKFLOW_010)
- **Workflow**: `../../1_frontend_ux-workflows/workflows/navigation/WORKFLOW_010_basic-navigation-access.md`
- **Routes**: `../routes.md`
- **Components**:
  - SearchBar: `../../03_components/composite/search-bar.md`
  - EntityCard: `../../03_components/composite/entity-card.md`
