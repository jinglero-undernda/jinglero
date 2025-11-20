# UI Design System Documentation

## Purpose

This directory contains documentation for the UI Design System, including design intent, design tokens, component specifications, and visual style guidelines. The documentation serves as:

1. **Design Specifications**: Define design tokens, component styles, and visual patterns
2. **Implementation Guides**: Reference for developers implementing UI components
3. **Validation Criteria**: Check that implementation matches design intent
4. **Change Management**: Historical record of design decisions and evolutions

## Documentation Structure

The design system documentation is organized hierarchically:

### 01 System Foundation

Foundational design elements that all other components build upon:

- **Design Tokens** (`01_system-foundation/tokens/`) - Colors, typography, spacing, shadows, borders, transitions
- **Design Philosophy** (`01_system-foundation/design-philosophy.md`) - Design goals, principles, vision
- **Status Tracking** (`01_system-foundation/status.md`) - Current vs target state tracking

### 02 Layout Patterns

Page-level layout patterns and route mappings:

- **Route Mapping** (`02_layout-patterns/routes.md`) - Technical mapping of all routes to components
- **Grid System** (`02_layout-patterns/grid-system.md`) - Grid layout, breakpoints, containers
- **Responsive Behavior** (`02_layout-patterns/responsive-behavior.md`) - Breakpoint behavior
- **Page Templates** (`02_layout-patterns/page-templates/`) - Landing page, detail page, admin page, search results

### 03 Components

Component library organized by complexity:

- **Primitives** (`03_components/primitives/`) - Basic building blocks (buttons, links, badges, inputs, cards)
- **Composite** (`03_components/composite/`) - Complex components (EntityCard, SearchBar, RelatedEntities, etc.)
- **Patterns** (`03_components/patterns/`) - Reusable component patterns

### 04 Context Variations

How components and design elements vary by context:

- **Admin Context** (`04_context-variations/admin-context.md`) - Admin-specific variations
- **Entity Context** (`04_context-variations/entity-context.md`) - Entity-specific variations
- **Interaction States** (`04_context-variations/interaction-states.md`) - Hover, active, disabled states
- **Responsive Variations** (`04_context-variations/responsive-variations.md`) - Breakpoint-specific changes

### File Naming Convention

- `tokens/{category}.md` - Design token documentation
- `page-templates/{template-name}.md` - Page template documentation
- `{category}/{component-name}.md` - Component documentation

### Design System Document Structure

Each design system document should include:

1. **Metadata**

   - Document name and category
   - Status (draft | current_implementation | validated | implemented | deprecated)
   - Last updated date
   - Related components/files
   - Dependencies on other design system elements

2. **Design Intent**

   - Purpose and usage
   - Visual design goals
   - User experience goals

3. **Specifications**

   - Design token values
   - Component specifications
   - Visual examples (if applicable)

4. **Implementation Notes**

   - CSS file locations
   - Component file locations
   - Usage patterns

5. **Validation Checklist**
   - Implementation checks
   - Consistency checks
   - Usage checks

## Design System Lifecycle

1. **draft**: Initial design specification, open for review
2. **current_implementation**: Documents existing implementation as-is
3. **validated**: Validated against code, matches current implementation
4. **implemented**: Code updated to match design system (may include improvements)
5. **deprecated**: Design element replaced or no longer applicable

## Integration with Development Process

### Before Implementation

- Review relevant design system documentation
- Identify design tokens needed
- Plan implementation to match design specifications

### During Implementation

- Reference design system in code comments
- Use design tokens from CSS variables
- Follow component style guidelines

### After Implementation

- Validate implementation against design system
- Update design system status to "Implemented"
- Document any deviations and rationale

### Code Validation

Design system documents can be used to validate code by:

1. **Token Usage**: Verify CSS variables match design tokens
2. **Component Styles**: Check component styles match specifications
3. **Consistency**: Ensure consistent usage across components
4. **Visual States**: Verify visual states match design intent

## Current Design System Status

| Category           | Status                 | Last Updated | Notes                                     |
| ------------------ | ---------------------- | ------------ | ----------------------------------------- |
| Colors             | current_implementation | -            | Basic colors in `variables.css`           |
| Typography         | current_implementation | -            | Basic typography in `variables.css`       |
| Spacing            | current_implementation | -            | Basic spacing in `variables.css`          |
| Components         | current_implementation | -            | Component styles exist but not formalized |
| Design System File | draft                  | -            | Formal design system file pending         |

## Best Practices

1. **Use Design Tokens**: Always use CSS variables for design tokens
2. **Maintain Consistency**: Follow established patterns
3. **Document Changes**: Update design system when making changes
4. **Validate Regularly**: Check that implementation matches design
5. **Version Control**: Track changes to design system over time
6. **Review Regularly**: Update design system as product evolves
7. **Validate Against Code**: Regularly check that code matches documented design

## Tools

- **CSS Variables**: For design tokens
- **Markdown**: For documentation
- **Git**: For version control and change tracking

## Related Documentation

- `../1_frontend_ux-workflows/` - UX workflows that use design system (routes documented here can be referenced)
- `../../frontend/src/styles/theme/variables.css` - Current design tokens
- `../../complete-refactor-analysis.md` - Strategic analysis and approach
- `playbooks/` - AI-ready playbooks for working with design system

## Quick Navigation

- [System Foundation](./01_system-foundation/README.md) - Design tokens and foundation
- [Layout Patterns](./02_layout-patterns/README.md) - Routes, grids, page templates
- [Components](./03_components/README.md) - Component library
- [Context Variations](./04_context-variations/README.md) - Context-specific variations

## Playbooks

See [`playbooks/README.md`](./playbooks/README.md) for available playbooks to:

- Document design intent
- Validate implementation
- Analyze gaps
- Plan refactoring
- Implement design system
- Update design system
- Audit design system

---

**Last Updated:** 2025-11-19
