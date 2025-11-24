# Design Philosophy

## Status

- **Status**: partially_implemented
- **Last Updated**: 2025-11-24
- **Last Validated**: 2025-11-24
- **Last Implemented**: 2025-11-24
- **Purpose**: Define design goals, principles, and vision
- **Version**: 1.1
- **Validation Status**: in_progress
- **Validation Report**: See `design-philosophy-validation-report.md`
- **Implementation Progress**: Phase 1 (Foundation) and Phase 2 (Core Components) complete

## Overview

Jinglero is a community-driven platform for cataloging and discovering Argentine music clips from "La Fabrica de Jingles" radio show. The design philosophy centers on a **heavy industrial mid-XX century aesthetic**, specifically evoking the **Peronist era (1940s-1950s)** with utilitarian functionality and celebratory community spirit.

The platform uses a **production chain metaphor** where:

- **Fabrica** = Factory (the radio show episode)
- **Canciones** = Raw materials (original songs)
- **Artistas** = Suppliers/Proveedores (who deliver raw materials)
- **Jinglero** = Factory worker (who transforms materials into products)
- **Jingle** = Finished product (the adapted clip)
- **Tematica** = Product label/tag (classification)
- **Usuario** = Supervisor (who reviews and interacts with products)

## Design Goals

### Primary Goals

1. **Evoke Industrial Nostalgia**: Create a time capsule experience that celebrates the glory days of Argentine industry and Peronist era aesthetics
2. **Celebrate Workers**: Position Jingleros (factory workers) as heroes and protagonists of the production chain
3. **Build Community**: Foster a union hall atmosphere where collective work and individual contributions are equally valued
4. **Enable Discovery**: Make it easy for non-tech-savvy community members to find specific songs and clips

### Secondary Goals

1. **Progressive Enhancement**: Prioritize aesthetic vision for MVP, incorporate accessibility progressively
2. **Mobile Support**: Ensure functionality across devices while acknowledging YouTube player limitations
3. **Immersive Experience**: Use subtle sound design to enhance the industrial atmosphere without competing with content

## Design Principles

### 1. Utilitarian First, Decorative Second

- **Inside the factory**: Utilitarian, functional interface focused on operating machinery
- **Factory facade**: Decorative filete porteño on landing page, evoking a factory sign
- **Balance**: Decorative elements should never impede functionality

### 2. Material Authenticity

- **Surfaces**: Concrete and metal textures, weathered and soiled from handling
- **Aging**: Patina and wear marks suggest years of industrial use
- **Tactility**: UI elements should feel substantial and mechanical

### 3. Console-Based Interaction

- **Search/Filter**: Operate like industrial control panels with boolean switches
- **Navigation**: Factory signage style for headings and navigation buttons
- **Feedback**: Mechanical UI sounds provide tactile feedback for equipment operation

### 4. Production Chain Visualization

- **Sequence awareness**: Always show the flow: Proveedor → Materiales → Worker → Producto + Etiqueta
- **Non-linear access**: Users can enter at any point (filter by any entity type)
- **Worker centrality**: Individual Jinglero contributions are highlighted (when not anonymous)

### 5. Celebratory Tone

- **Primary**: Celebratory, nostalgic, positive
- **Secondary**: Community building through collective work
- **Balance**: Functional elements (like search results) may use typewritten report aesthetics for clarity

## Visual Vision

### Aesthetic Era

- **Primary**: Peronist era (1940s-1950s)
- **Secondary**: Freedom to incorporate later industrial periods if useful
- **Feel**: Utilitarian, functional, time capsule

### Color Strategy

- **Base**: Dark theme with grey palette (as currently in Admin UI)
- **Vibrant accents**: Reserved for user interaction areas and highlights
- **Semantic colors**: Incorporate industrial aesthetic (e.g., warning labels use literal black octagons with white font)
- **Peronist colors**: Not heavily emphasized, but available for accent use

### Typography

- **Reference**: Mid-century Argentine advertising
- **Headings/Navigation**: Factory signage style
- **Body text**: Utilitarian, readable
- **Long-form content**: Typewritten report aesthetic for search results and documentation

### Filete Porteño Integration

- **Landing page**: Literal filete porteño decoration, evoking factory sign facade
- **Application**: Applied with caution, primarily decorative
- **Inside factory**: Minimal or absent, maintaining utilitarian focus
- **Style**: Literal hand-painted aesthetic, not stylized

### Material Design

- **Concrete**: Primary surface material, weathered texture
- **Metal**: Interactive elements, control panels, signage
- **Patina**: Weathered and soiled from handling, showing use
- **Depth**: Shadows and textures create physical presence

## User Experience Vision

### Interaction Model

- **Metaphor**: Operating machinery, controlling equipment
- **Search/Filter**: Console-like interface with boolean switches (on/off toggles)
- **Navigation**: Factory signage for wayfinding
- **Feedback**: Mechanical sounds for UI interactions

### Information Architecture

- **Production chain awareness**: Always visible context of where user is in the chain
- **Multi-entry points**: Users can filter/search by any entity type (Fabrica, Cancion, Artista, Tematica, Jingle)
- **Supervisor role**: Usuarios can review products (Jingles) and attach comments

### User Personas

- **Primary**: Community listeners to the radio show, looking for specific songs
- **Tech level**: Not tech-savvy
- **Goal**: Discovery and exploration of Argentine music culture
- **Context**: Union hall atmosphere, collective work celebration

## Sound Design

### Purpose

- **Primary**: UI feedback/interaction with "equipment"
- **Secondary**: Subtle ambient atmosphere
- **Constraint**: Never compete with Jingles (the actual content)

### Sound Palette

- **Machinery**: Subtle industrial sounds for UI interactions
- **Radio**: Vintage radio aesthetic for ambient sounds
- **Feedback**: Mechanical clicks, switches, console sounds
- **Volume**: Low, subtle, enhancing rather than distracting

## Component Philosophy

### Warning Labels (Stats Reporting)

- **Style**: Literal black octagons with white font
- **Context**: Landing page and Admin dashboard entity counts
- **Reference**: Contemporary Argentine food warning labels
- **Purpose**: Functional information display with cultural reference

### Control Panels (Search/Filter)

- **Style**: Industrial console with boolean switches
- **Interaction**: On/off toggles for filters
- **Feel**: Operating machinery
- **Feedback**: Mechanical sounds on interaction

### Factory Signage

- **Usage**: Headings, navigation buttons
- **Style**: Mid-century factory signage aesthetic
- **Material**: Metal, weathered
- **Typography**: Bold, industrial, readable

## Terminology & Language

### Core Metaphor Terms

- **Fabrica**: Factory (radio show episode) - _existing_
- **Jingle**: Finished product (adapted clip) - _existing_
- **Jinglero**: Factory worker (clip performer) - _existing_
- **Materiales**: Raw materials (Canciones) - _proposed extension_
- **Proveedores**: Suppliers (Artistas who deliver raw materials) - _proposed extension_
- **Tematica**: Product label/tag - _existing_

### Tone of Voice

- **Primary**: Celebratory, nostalgic, positive
- **Secondary**: Community building, collective work
- **Balance**: Clear functional language when needed (search results, documentation)

### Language Strategy

- **Metaphor consistency**: Safe to carry metaphor throughout, iterate and calibrate during UX development
- **Clarity**: Balance metaphor with functional clarity
- **Community**: Reflect existing community terminology

## Technical Considerations

### Platform Constraints

- **Mobile**: Important but YouTube player limitations exist
- **Browser**: Modern browsers prioritized
- **Performance**: Balance aesthetic richness with performance

### Accessibility Strategy

- **MVP**: Prioritize aesthetic vision
- **Progressive**: Incorporate accessibility elements incrementally
- **Balance**: Maintain design integrity while improving accessibility

## Production Chain Flow

### Conceptual Sequence

1. **Proveedor** (Artista) brings **Materiales** (Canciones) to the **Fabrica**
2. **Worker** (Jinglero) transforms materials into **Producto** (Jingle) and adds **Etiqueta** (Tematica)
3. **Supervisor** (Usuario) reviews products, attaches comments, interacts with Jingles

### Navigation Reality

- **Non-linear**: Users can enter at any point using any field as a filter
- **Flexible**: Search by Fabrica, Cancion, Artista, Tematica, or Jingle
- **Contextual**: Always show production chain context

## Community Building

### Union Hall Atmosphere

- **Collective work**: Emphasize community effort
- **Individual contributions**: Highlight Jinglero work (when not anonymous)
- **Celebration**: Workers as heroes and protagonists
- **Nostalgia**: Positive remembrance of industrial glory days

### Contribution Visibility

- **Individual**: Important for community building
- **Anonymous**: Some contributions remain anonymous and may not be featured
- **Balance**: Celebrate both individual and collective work

## Design System Structure

### Visual Hierarchy

1. **Landing page**: Decorative facade with filete porteño
2. **Application**: Utilitarian factory interior
3. **Control panels**: Console-like search/filter interfaces
4. **Content areas**: Typewritten reports for long-form content
5. **Interactive elements**: Factory signage style

### Component Categories

- **Primitives**: Buttons, inputs, switches (industrial console style)
- **Composite**: Entity cards, production chain visualizations
- **Patterns**: Search interfaces, filter panels, navigation
- **Layouts**: Factory floor layouts, production line views

## Implementation Strategy

### Phase 1: Foundation

- Establish dark grey color palette
- Define industrial typography system
- Create material textures (concrete, metal)
- Build console-style control components

### Phase 2: Metaphor Integration

- Implement production chain visualizations
- Add factory signage navigation
- Create filete porteño landing page elements
- Build boolean filter console interface

### Phase 3: Polish & Enhancement

- Add sound design
- Refine material textures and patina
- Enhance worker celebration elements
- Progressive accessibility improvements

## Related Documentation

- Design tokens: `tokens/`
- System status: `status.md`
- Component specifications: `03_components/`
- Layout patterns: `02_layout-patterns/`

## Change History

| Date       | Change                                                                                                                       | Author           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 2025-11-24 | Initial design philosophy document created based on discovery session                                                        | Design Team      |
| 2025-11-24 | Phase 1 & 2 implementation: Base styles, typography, buttons, switches, warning labels, search bar migrated to design tokens | Development Team |
