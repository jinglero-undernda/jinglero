# Components

## Purpose

This section documents all UI components in the design system, including primitives, composite components, and reusable patterns.

## Structure

### Component Categories

1. **Primitives** (`primitives/`) - Basic building blocks (buttons, cards, filter switches, etc.)
2. **Composite** (`composite/`) - Complex components built from primitives (EntityCard, SearchBar, RelatedEntities, etc.)
3. **Patterns** (`patterns/`) - Reusable component patterns and combinations

### Component Template

See `component-template.md` for the standard template used when documenting components.

## Component Status

### Primitives

| Component     | Category  | Status | Documentation                 |
| ------------- | --------- | ------ | ----------------------------- |
| Button        | Primitive | draft  | `primitives/button.md`        |
| Card          | Primitive | draft  | `primitives/card.md`          |
| Filter Switch | Primitive | draft  | `primitives/filter-switch.md` |

### Composite Components

| Component       | Category  | Status                 | Documentation                   |
| --------------- | --------- | ---------------------- | ------------------------------- |
| EntityCard      | Composite | current_implementation | `composite/entity-card.md`      |
| SearchBar       | Composite | current_implementation | `composite/search-bar.md`       |
| RelatedEntities | Composite | current_implementation | `composite/related-entities.md` |
| YouTubePlayer   | Composite | current_implementation | `composite/youtube-player.md`   |
| JingleTimeline  | Composite | current_implementation | `composite/timeline.md`         |

## Documentation Standards

Each component should document:

- Current implementation status
- Variants and props
- Context variations (admin vs public)
- State variations (hover, active, disabled, etc.)
- Code references
- Usage guidelines

## Related Documentation

- Design tokens: `../01_system-foundation/tokens/`
- Layout patterns: `../02_layout-patterns/`
- Context variations: `../04_context-variations/`
