# Landing Page Layout

## Status
- **Status**: draft
- **Last Updated**: 2025-01-20
- **Last Validated**: not yet validated
- **Code Reference**: `frontend/src/pages/Home.tsx:57-108`, `frontend/src/styles/pages/home.css:1-146`
- **Workflow Reference**: `WORKFLOW_010_basic-navigation-access.md`

## Overview

The Landing Page serves as the primary entry point for all users (GUEST role) and provides access to all major navigation paths. This layout document describes the structure, components, and visual hierarchy required to support the basic navigation access workflow.

**Purpose**: Define the layout structure that enables GUEST users to:
- Navigate to authentication (Login sequence)
- Interact with featured content (Fabrica display)
- Navigate to featured entities
- Access simple global search
- Navigate to Advanced Search page

## Route Information

- **Route**: `/`
- **Component**: `Home`
- **File**: `frontend/src/pages/Home.tsx`
- **Styles**: `frontend/src/styles/pages/home.css`
- **User Role**: GUEST (public access)

## Layout Structure

### Overall Page Container

```
┌─────────────────────────────────────────┐
│  <main className="home-page">           │
│  ┌───────────────────────────────────┐  │
│  │  Hero Section                     │  │
│  │  - Title                          │  │
│  │  - Subtitle                       │  │
│  │  - Global Search Interface        │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Featured Content Section          │  │
│  │  - Featured Fabrica Display       │  │
│  │  - Featured Entities Section      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Navigation Links Section          │  │
│  │  - Advanced Search Link           │  │
│  │  - Login/Authentication Link      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Layout Zones

1. **Hero Zone** (Top section, centered)
   - Primary branding and messaging
   - Global search interface (prominent placement)
   - Maximum visual impact

2. **Featured Content Zone** (Main content area)
   - Featured Fabrica display
   - Featured entities section
   - Content discovery focus

3. **Navigation Zone** (Supporting navigation)
   - Advanced Search access
   - Authentication access
   - Additional navigation options

## Component Composition

### 1. Hero Section

**Location**: Top of page, centered
**Code Reference**: `frontend/src/pages/Home.tsx:59-70`, `frontend/src/styles/pages/home.css:7-64`

**Components**:
- Page title (`<h1>`): "La Usina de la Fábrica de Jingles"
- Subtitle (`<p>`): "Plataforma de curación de clips y jingles"
- Global Search Bar (`SearchBar` component)

**Layout Specifications**:
- Centered alignment
- Maximum width: 1200px (container)
- Search bar max-width: 600px
- Vertical spacing: 2rem padding top/bottom
- Bottom margin: 3rem

**Visual Hierarchy**:
- Title: Large, prominent (2.5rem desktop, 2rem mobile)
- Subtitle: Secondary text (1.25rem desktop, 1.1rem mobile)
- Search: Prominent, accessible, clear call-to-action

### 2. Global Search Interface

**Location**: Within Hero Section
**Code Reference**: `frontend/src/pages/Home.tsx:64-69`, `frontend/src/components/search/SearchBar.tsx`

**Functionality** (per WORKFLOW_010):
- User enters search query
- Displays matching entities inline (dropdown/list)
- User selects entity from list
- Navigates to entity inspection page

**Layout Specifications**:
- Centered within hero section
- Max-width: 600px
- Dropdown suggestions: Positioned absolutely below search bar
- Z-index: 1000 (for dropdown overlay)
- Responsive: Full width on mobile

**States**:
- Default: Empty search field with placeholder
- Active: User typing, suggestions displayed
- Results: Entity list displayed in dropdown
- Empty query: No results or prevented submission

### 3. Featured Fabrica Display

**Location**: Below Hero Section
**Code Reference**: `frontend/src/pages/Home.tsx:85-106`, `frontend/src/styles/pages/home.css:86-107`

**Components**:
- Section title: "Fábricas Destacadas" with icon (🏭)
- Grid of EntityCard components (up to 6 Fabricas)
- Empty state message (when no Fabricas available)

**Layout Specifications**:
- Grid layout: `repeat(auto-fill, minmax(300px, 1fr))`
- Gap: 1rem between cards
- Responsive: Single column on mobile (< 768px)
- Section margin-top: 3rem

**Content**:
- Displays 6 most recent Fabricas (sorted by date DESC)
- Each card shows Fabrica entity information
- Cards are clickable, navigate to Fabrica inspection page

**States**:
- Loading: Loading message displayed
- Error: Error message displayed with error styling
- Empty: "No hay Fábricas disponibles en este momento"
- Populated: Grid of EntityCard components

### 4. Featured Entities Section

**Location**: Below Featured Fabrica Display (to be implemented)
**Code Reference**: To be implemented

**Purpose** (per WORKFLOW_010):
- Display featured entities (Jingles, Canciones, Artistas, Temáticas)
- Provide navigation to entity inspection pages
- Support content discovery

**Layout Specifications** (Target):
- Similar grid layout to Featured Fabricas
- Section title with appropriate icon
- EntityCard components for each entity type
- Responsive grid layout

**Note**: This section is required by WORKFLOW_010 but not yet implemented in current code. This is a TARGET specification.

### 5. Navigation Links Section

**Location**: Below Featured Content (to be implemented)
**Code Reference**: To be implemented

**Components** (per WORKFLOW_010):
- Advanced Search link/button
- Login/Authentication link/button

**Layout Specifications** (Target):
- Accessible navigation options
- Clear visual hierarchy
- Prominent but not competing with primary content

**Note**: Currently, navigation to Login is available via header navigation (`frontend/src/App.tsx:109`). Per WORKFLOW_010, these navigation options should be accessible from the landing page itself.

## Visual Hierarchy

### Primary Elements (Highest Priority)
1. **Global Search Interface** - Most prominent, primary call-to-action
2. **Page Title** - Brand identity
3. **Featured Fabrica Display** - Content discovery

### Secondary Elements
1. **Featured Entities Section** - Additional content discovery
2. **Subtitle** - Supporting information

### Tertiary Elements
1. **Navigation Links** - Supporting navigation options
2. **Advanced Search Link** - Alternative search access

## Responsive Behavior

### Desktop (> 768px)
- Container max-width: 1200px
- Centered layout with padding: 2rem 1rem
- Grid: Multiple columns (auto-fill, min 300px)
- Hero title: 2.5rem
- Search bar: Max-width 600px

### Mobile (≤ 768px)
- Container padding: 1rem 0.5rem
- Single column layout
- Hero title: 2rem
- Subtitle: 1.1rem
- Section title: 1.5rem
- Grid: Single column (1fr)
- Gap: 0.75rem

**Code Reference**: `frontend/src/styles/pages/home.css:125-146`

## States and Variations

### Loading State
- **Display**: Loading message centered
- **Code Reference**: `frontend/src/pages/Home.tsx:72-76`
- **Styling**: `frontend/src/styles/pages/home.css:109-115`

### Error State
- **Display**: Error message with error styling
- **Code Reference**: `frontend/src/pages/Home.tsx:78-82`
- **Styling**: `frontend/src/styles/pages/home.css:117-122`
- **Visual**: Red text, light red background, border radius

### Empty State
- **Display**: Empty state message for Featured Fabricas
- **Code Reference**: `frontend/src/pages/Home.tsx:102-104`
- **Styling**: `frontend/src/styles/pages/home.css:111-115`
- **Message**: "No hay Fábricas disponibles en este momento"

### Populated State
- **Display**: Full content with all sections populated
- **Code Reference**: `frontend/src/pages/Home.tsx:84-106`

## Design Tokens Used

### Colors
- Text Primary: `var(--color-text-primary, #333)` - `frontend/src/styles/pages/home.css:16`
- Text Secondary: `var(--color-text-secondary, #666)` - `frontend/src/styles/pages/home.css:21`
- Border: `var(--color-border, #ddd)` - `frontend/src/styles/pages/home.css:41`
- Primary: `var(--color-primary, #007bff)` - `frontend/src/styles/pages/home.css:48`
- Error: `var(--color-error, #d32f2f)` - `frontend/src/styles/pages/home.css:118`
- Error Background: `var(--color-error-bg, #ffebee)` - `frontend/src/styles/pages/home.css:119`

### Spacing
- Container padding: 2rem 1rem (desktop), 1rem 0.5rem (mobile)
- Hero padding: 2rem 0
- Hero margin-bottom: 3rem
- Section margin-top: 3rem
- Grid gap: 1rem (desktop), 0.75rem (mobile)

### Typography
- Hero title: 2.5rem (desktop), 2rem (mobile)
- Subtitle: 1.25rem (desktop), 1.1rem (mobile)
- Section title: 1.75rem (desktop), 1.5rem (mobile)

### Layout
- Container max-width: 1200px
- Search bar max-width: 600px
- Grid: `repeat(auto-fill, minmax(300px, 1fr))` (desktop), `1fr` (mobile)

## Implementation Details

### Current Implementation
- ✅ Hero section with title, subtitle, and search bar
- ✅ Featured Fabricas section (6 most recent)
- ✅ Loading and error states
- ✅ Empty state handling
- ✅ Responsive design
- ✅ Search functionality (navigates to `/search`)

### Target Implementation (per WORKFLOW_010)
- ⏳ Featured Entities section (Jingles, Canciones, Artistas, Temáticas)
- ⏳ Advanced Search navigation link/button
- ⏳ Login/Authentication link/button on landing page
- ⏳ Global search with inline entity list (currently navigates to search page)
- ⏳ Featured Fabrica interaction (embedded player/preview)

**Note**: The current implementation navigates to `/search` on search submission. Per WORKFLOW_010 Step 5, the global search should display matching entities inline on the landing page, allowing direct selection without navigation.

## Component Dependencies

### Required Components
- `SearchBar` - Global search interface
  - **Code Reference**: `frontend/src/components/search/SearchBar.tsx`
  - **Usage**: Hero section, prominent placement
- `EntityCard` - Entity display cards
  - **Code Reference**: `frontend/src/components/common/EntityCard.tsx`
  - **Usage**: Featured Fabricas grid, Featured Entities grid
  - **Variant**: `contents` (for Featured Fabricas)

### API Dependencies
- `publicApi.getFabricas()` - Fetch featured Fabricas
  - **Code Reference**: `frontend/src/pages/Home.tsx:22`
  - **Usage**: Load featured Fabricas on page mount

## Navigation Flow Integration

This layout supports the following navigation paths (per WORKFLOW_010):

1. **Landing Page → Login Page**
   - Via Login/Authentication link
   - Route: `/admin/login`

2. **Landing Page → Featured Fabrica Interaction**
   - Via Featured Fabrica display
   - Interaction pattern: Embedded player, preview, or link

3. **Landing Page → Featured Entity Inspection**
   - Via Featured Entities section
   - Routes: `/j/:jingleId`, `/c/:cancionId`, `/f/:fabricaId`, `/a/:artistaId`, `/t/:tematicaId`

4. **Landing Page → Global Search → Entity Inspection**
   - Via Global Search interface
   - Search displays entity list inline
   - User selects entity to navigate

5. **Landing Page → Advanced Search Page**
   - Via Advanced Search link/button
   - Route: `/search/advanced`

## Edge Cases Handling

### No Featured Content Available
- **Display**: Empty state message
- **Code Reference**: `frontend/src/pages/Home.tsx:102-104`
- **Behavior**: Graceful degradation, other navigation options remain available

### User Already Authenticated
- **Display**: Conditional navigation (Login link changes to user status/logout)
- **Code Reference**: `frontend/src/App.tsx:19-101` (AdminLink component)
- **Note**: Currently handled in header navigation, may need landing page integration

### Invalid Entity ID
- **Display**: Error handling on navigation attempt
- **Behavior**: Error message or 404 page, does not break landing page

### Empty Search Query
- **Display**: Prevented submission or empty results list
- **Behavior**: User remains on landing page

## Usage Guidelines

### When to Use This Layout
- Primary entry point for all users
- GUEST user access point
- Content discovery starting point
- Search entry point

### Design Principles
1. **Clarity**: All navigation options clearly visible
2. **Accessibility**: Prominent search, clear hierarchy
3. **Content Discovery**: Featured content prominently displayed
4. **Progressive Disclosure**: Primary actions first, secondary actions accessible

## Related Documentation

- **Workflow**: `../../1_frontend_ux-workflows/workflows/navigation/WORKFLOW_010_basic-navigation-access.md`
- **Page Template**: `landing-page.md` (existing template)
- **Routes**: `../routes.md`
- **Components**: 
  - `../../03_components/composite/search-bar.md`
  - `../../03_components/composite/entity-card.md`
- **Pages Reference**: `../../1_frontend_ux-workflows/PAGES_REFERENCE.md`

## Change History

| Version | Date       | Change                    | Author | Rationale                           |
| ------- | ---------- | ------------------------- | ------ | ----------------------------------- |
| 1.0     | 2025-01-20 | Initial layout document   | -      | Document layout per WORKFLOW_010    |

