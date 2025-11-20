# Entity Context Variations

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Purpose**: Document entity-specific design variations

## Overview

Different entity types (Jingle, Fabrica, Cancion, Artista, Tematica) may have entity-specific visual treatments, badges, or display patterns.

## Entity-Specific Variations

### Jingle Entities
- **Badges**: JINGLAZO, PRECARIO badges
- **Code Reference**: `frontend/src/components/common/EntityCard.tsx:76-92`

### Other Entities
*To be documented as entity-specific patterns are identified*

## Visual Patterns

*To be documented as entity-specific patterns are analyzed*

## Implementation

Entity-specific variations are handled in component logic based on `entityType` prop.

## Related Documentation

- EntityCard component: `../03_components/composite/entity-card.md`
- Entity display patterns: `../03_components/patterns/entity-display-pattern.md`

