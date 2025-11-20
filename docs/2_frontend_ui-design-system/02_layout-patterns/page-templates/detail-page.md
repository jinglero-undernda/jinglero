# Page Template: Detail Page

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `frontend/src/pages/inspect/*.tsx`, `frontend/src/pages/FabricaPage.tsx`

## Overview

Detail pages display entity information. There are two main types:
1. Entity inspection pages (InspectJingle, InspectCancion, etc.)
2. Fabrica player page (FabricaPage with video player)

## Routes

### Entity Inspection Pages
- `/j/:jingleId` - InspectJingle
- `/c/:cancionId` - InspectCancion
- `/f/:fabricaId` - InspectFabrica
- `/a/:artistaId` - InspectArtista
- `/t/:tematicaId` - InspectTematica

### Fabrica Player Page
- `/show/:fabricaId` - FabricaPage with video player
- `/show` - FabricaPage (loads latest)

## Layout Structure

*To be documented as layout is analyzed*

## Component Composition

### Entity Inspection Pages
- Entity metadata display
- RelatedEntities component
- Navigation elements

### Fabrica Player Page
- YouTubePlayer component
- JingleTimeline component
- JingleMetadata component
- Navigation elements

## Responsive Behavior

*To be documented*

## Implementation

- **Entity Inspection Styles**: Component-specific styles
- **Fabrica Page Styles**: `frontend/src/styles/pages/fabrica.css`
- **Components Used**: `EntityCard`, `RelatedEntities`, `YouTubePlayer`, `JingleTimeline`, `JingleMetadata`

## Related Documentation

- Routes: `../routes.md`
- EntityCard component: `../../03_components/composite/entity-card.md`
- RelatedEntities component: `../../03_components/composite/related-entities.md`
- YouTubePlayer component: `../../03_components/composite/youtube-player.md`

