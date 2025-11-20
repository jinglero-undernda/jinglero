<!-- 178c2840-cc5a-4b06-9b49-80bb26c1bdf4 3933a186-882c-4c66-a88a-5a02072241cb -->
# Design System Documentation & Showcase Implementation

## Phase 1: Create Documentation Spine

### 1.1 Create Folder Structure

Create the hierarchical documentation structure in `docs/2_frontend_ui-design-system/`:

```
docs/2_frontend_ui-design-system/
├── 01_system-foundation/
│   ├── README.md                      # System overview & principles
│   ├── design-philosophy.md            # Design goals, principles, vision
│   ├── status.md                       # Current vs target state tracking
│   └── tokens/                         # Design tokens (existing + new)
│       ├── colors.md                   # Update existing
│       ├── typography.md               # Update existing
│       ├── spacing.md                  # Update existing
│       ├── shadows.md                  # New
│       ├── borders.md                  # New
│       └── transitions.md              # New
│
├── 02_layout-patterns/
│   ├── README.md                       # Layout system overview
│   ├── routes.md                       # Route mapping (technical)
│   ├── grid-system.md                  # Grid, breakpoints, containers
│   ├── responsive-behavior.md          # Breakpoint behavior
│   └── page-templates/                 # Page-level patterns
│       ├── landing-page.md
│       ├── detail-page.md
│       ├── admin-page.md
│       └── search-results-page.md
│
├── 03_components/
│   ├── README.md                       # Component index & status
│   ├── component-template.md           # Template for documenting components
│   ├── primitives/                     # Basic building blocks
│   │   ├── button.md
│   │   ├── link.md
│   │   ├── badge.md
│   │   ├── input.md
│   │   └── card.md
│   ├── composite/                     # Complex components
│   │   ├── entity-card.md
│   │   ├── search-bar.md
│   │   ├── related-entities.md
│   │   ├── youtube-player.md
│   │   └── timeline.md
│   └── patterns/                       # Reusable patterns
│       ├── entity-display-pattern.md
│       ├── form-pattern.md
│       └── navigation-pattern.md
│
└── 04_context-variations/
    ├── README.md                       # How to document variations
    ├── admin-context.md                # Admin-specific variations
    ├── entity-context.md               # Entity-specific variations
    ├── interaction-states.md           # Hover, active, disabled, etc.
    └── responsive-variations.md        # Breakpoint-specific changes
```

### 1.2 Update Main README

Update `docs/2_frontend_ui-design-system/README.md` to reflect new structure and add navigation to new sections.

## Phase 2: Extract Existing Code Baseline

### 2.1 Extract Design Tokens

From `frontend/src/styles/theme/variables.css`:

- Document all CSS variables in token files
- Add code references (file:line)
- Mark status as `current_implementation`
- Document usage guidelines

Files to update:

- `tokens/colors.md` - Extract color variables (lines 3-9)
- `tokens/typography.md` - Extract typography (lines 12-14)
- `tokens/spacing.md` - Extract spacing scale (lines 17-21)
- `tokens/shadows.md` - Extract shadows (lines 34-36) - NEW
- `tokens/borders.md` - Extract border radius (lines 24-26) - NEW
- `tokens/transitions.md` - Extract transitions (lines 29-31) - NEW

### 2.2 Document Routes

Create `02_layout-patterns/routes.md`:

- Extract all routes from `frontend/src/App.tsx` (lines 112-122)
- Extract admin routes from `frontend/src/pages/AdminPage.tsx` (lines 33-82)
- Map routes to components and page templates
- Document route patterns and parameters
- Add code references

Routes to document:

- Public routes: `/`, `/search`, `/show`, `/show/:fabricaId`, `/j/:jingleId`, `/c/:cancionId`, `/f/:fabricaId`, `/a/:artistaId`, `/t/:tematicaId`
- Admin routes: `/admin/login`, `/admin/dashboard`, `/admin/search`, `/admin/:entityType/:entityId`, `/admin/:entityType`

### 2.3 Document Component Baseline

Extract component information from existing components:

- `components/common/EntityCard.tsx` - Document variants, props, states
- `components/search/SearchBar.tsx` - Document search component
- `components/common/RelatedEntities.tsx` - Document relationship display
- `components/player/YouTubePlayer.tsx` - Document player component
- `components/player/JingleTimeline.tsx` - Document timeline component

For each component:

- Document current implementation status
- Extract props and variants
- Document context variations (admin vs public)
- Add code references

### 2.4 Document Layout Patterns

Extract from existing page components:

- `pages/Home.tsx` - Landing page pattern
- `pages/FabricaPage.tsx` - Detail page pattern
- `pages/SearchResultsPage.tsx` - Search results pattern
- `pages/admin/AdminDashboard.tsx` - Admin page pattern

Document:

- Layout structure
- Component composition
- Responsive behavior
- Code references

## Phase 3: Develop Showcase Routes

### 3.1 Create Showcase Route Structure

Create showcase pages under `/admin/design-system`:

```
frontend/src/pages/admin/design-system/
├── DesignSystemShowcase.tsx           # Main showcase page (router)
├── ShowcaseLayout.tsx                  # Layout wrapper
├── sections/
│   ├── TokensShowcase.tsx              # Design tokens display
│   ├── ComponentsShowcase.tsx          # Component gallery
│   ├── LayoutsShowcase.tsx             # Layout examples
│   └── VariationsShowcase.tsx          # Context/state variations
└── components/                         # Showcase-specific components
    ├── ComponentDemo.tsx               # Wrapper for component demos
    ├── StateToggle.tsx                 # Toggle between states
    ├── CodeViewer.tsx                  # Show code alongside component
    └── TokenDisplay.tsx                # Display design token values
```

### 3.2 Add Route to AdminPage

Update `frontend/src/pages/AdminPage.tsx`:

- Add route: `/admin/design-system/*` (before catch-all route)
- Wrap in `ProtectedRoute` (admin-only access)
- Import `DesignSystemShowcase` component

### 3.3 Implement Showcase Pages

**DesignSystemShowcase.tsx:**

- Navigation between sections (tokens, components, layouts, variations)
- Use React Router nested routes
- Admin layout wrapper

**TokensShowcase.tsx:**

- Display all design tokens from `variables.css`
- Show CSS variable names and values
- Visual examples (colors, spacing, typography)
- Code reference links

**ComponentsShowcase.tsx:**

- Gallery of all documented components
- Use `ComponentDemo` wrapper for each
- Show variants and states
- Interactive demos with state toggles

**LayoutsShowcase.tsx:**

- Display page layout patterns
- Show responsive breakpoints
- Link to route documentation

**VariationsShowcase.tsx:**

- Show context variations (admin vs public)
- Show state variations (hover, active, disabled)
- Show responsive variations

### 3.4 Create Showcase Components

**ComponentDemo.tsx:**

- Props: title, description, component, code, variants[], states[]
- Display component with variants/states
- Optional code viewer
- Code reference links

**StateToggle.tsx:**

- Toggle between different states of a component
- Useful for showing hover/active/disabled states

**CodeViewer.tsx:**

- Display code snippets alongside components
- Syntax highlighting (optional, can be plain text initially)

**TokenDisplay.tsx:**

- Display design token with visual example
- Show CSS variable name and value
- Usage example

### 3.5 Add Showcase Styles

Create `frontend/src/styles/pages/design-system-showcase.css`:

- Layout styles for showcase pages
- Component demo container styles
- Navigation styles
- Code viewer styles

## Phase 4: Create Initial Documentation Content

### 4.1 System Foundation

- Create `01_system-foundation/README.md` with overview
- Create `01_system-foundation/design-philosophy.md` (placeholder for target design)
- Create `01_system-foundation/status.md` tracking current vs target

### 4.2 Layout Patterns

- Create `02_layout-patterns/README.md` with layout system overview
- Create `02_layout-patterns/routes.md` with route mapping
- Create `02_layout-patterns/grid-system.md` (extract from existing CSS)
- Create page template placeholders

### 4.3 Components

- Create `03_components/README.md` with component index
- Create `03_components/component-template.md` as documentation template
- Create initial component documentation for EntityCard (most complex example)

### 4.4 Context Variations

- Create `04_context-variations/README.md` explaining variation documentation approach
- Create placeholders for context variation docs

## Implementation Order

1. **Create folder structure** (Phase 1.1)
2. **Update main README** (Phase 1.2)
3. **Extract design tokens** (Phase 2.1)
4. **Document routes** (Phase 2.2)
5. **Create showcase route structure** (Phase 3.1)
6. **Add route to AdminPage** (Phase 3.2)
7. **Implement basic showcase pages** (Phase 3.3 - start with TokensShowcase)
8. **Create showcase components** (Phase 3.4)
9. **Extract component baseline** (Phase 2.3 - can be done incrementally)
10. **Document layout patterns** (Phase 2.4 - can be done incrementally)
11. **Create initial documentation content** (Phase 4 - fill in as we go)

## Files to Create/Modify

**Documentation (new):**

- `docs/2_frontend_ui-design-system/01_system-foundation/README.md`
- `docs/2_frontend_ui-design-system/01_system-foundation/design-philosophy.md`
- `docs/2_frontend_ui-design-system/01_system-foundation/status.md`
- `docs/2_frontend_ui-design-system/01_system-foundation/tokens/shadows.md`
- `docs/2_frontend_ui-design-system/01_system-foundation/tokens/borders.md`
- `docs/2_frontend_ui-design-system/01_system-foundation/tokens/transitions.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/README.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/routes.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/grid-system.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/responsive-behavior.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/page-templates/landing-page.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/page-templates/detail-page.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/page-templates/admin-page.md`
- `docs/2_frontend_ui-design-system/02_layout-patterns/page-templates/search-results-page.md`
- `docs/2_frontend_ui-design-system/03_components/README.md`
- `docs/2_frontend_ui-design-system/03_components/component-template.md`
- `docs/2_frontend_ui-design-system/03_components/composite/entity-card.md`
- `docs/2_frontend_ui-design-system/04_context-variations/README.md`
- `docs/2_frontend_ui-design-system/04_context-variations/admin-context.md`
- `docs/2_frontend_ui-design-system/04_context-variations/entity-context.md`
- `docs/2_frontend_ui-design-system/04_context-variations/interaction-states.md`
- `docs/2_frontend_ui-design-system/04_context-variations/responsive-variations.md`

**Documentation (update):**

- `docs/2_frontend_ui-design-system/README.md`
- `docs/2_frontend_ui-design-system/tokens/colors.md`
- `docs/2_frontend_ui-design-system/tokens/typography.md`
- `docs/2_frontend_ui-design-system/tokens/spacing.md`

**Code (new):**

- `frontend/src/pages/admin/design-system/DesignSystemShowcase.tsx`
- `frontend/src/pages/admin/design-system/ShowcaseLayout.tsx`
- `frontend/src/pages/admin/design-system/sections/TokensShowcase.tsx`
- `frontend/src/pages/admin/design-system/sections/ComponentsShowcase.tsx`
- `frontend/src/pages/admin/design-system/sections/LayoutsShowcase.tsx`
- `frontend/src/pages/admin/design-system/sections/VariationsShowcase.tsx`
- `frontend/src/pages/admin/design-system/components/ComponentDemo.tsx`
- `frontend/src/pages/admin/design-system/components/StateToggle.tsx`
- `frontend/src/pages/admin/design-system/components/CodeViewer.tsx`
- `frontend/src/pages/admin/design-system/components/TokenDisplay.tsx`
- `frontend/src/styles/pages/design-system-showcase.css`

**Code (modify):**

- `frontend/src/pages/AdminPage.tsx` - Add design-system route

### To-dos

- [ ] Create hierarchical folder structure in docs/2_frontend_ui-design-system/ (01_system-foundation, 02_layout-patterns, 03_components, 04_context-variations)
- [ ] Update docs/2_frontend_ui-design-system/README.md with new structure navigation
- [ ] Extract and document all design tokens from variables.css (colors, typography, spacing, shadows, borders, transitions) with code references
- [ ] Create 02_layout-patterns/routes.md documenting all routes from App.tsx and AdminPage.tsx with component mappings
- [ ] Create frontend/src/pages/admin/design-system/ folder structure with showcase pages and components
- [ ] Add /admin/design-system/* route to AdminPage.tsx with ProtectedRoute wrapper
- [ ] Implement TokensShowcase.tsx displaying all design tokens with visual examples
- [ ] Create ComponentDemo, StateToggle, CodeViewer, TokenDisplay components for showcase
- [ ] Implement ComponentsShowcase.tsx with component gallery using ComponentDemo wrapper
- [ ] Create design-system-showcase.css with layout and component demo styles
- [ ] Create 01_system-foundation README, design-philosophy, and status.md files
- [ ] Create 02_layout-patterns README, grid-system, responsive-behavior, and page template files
- [ ] Create 03_components README, component-template, and initial EntityCard documentation
- [ ] Create 04_context-variations README and variation documentation files