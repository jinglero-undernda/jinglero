# Landing Page Layout

## Status

- **Status**: draft
- **Last Updated**: 2025-11-28
- **Last Validated**: 2025-11-26
- **Validation Report**: `landing-page-layout-validation-2025-11-26.md`
- **Gap Analysis**: `landing-page-layout-gap-analysis-2025-11-26.md`
- **Code Reference**: `frontend/src/pages/Home.tsx:57-108`, `frontend/src/styles/pages/home.css:1-146`
- **Workflow Reference**: `WORKFLOW_010_basic-navigation-access.md`
- **Design Intent Interview**: 2025-11-26

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

## Visual Metaphor

**Design Concept**: The landing page represents a supervisor walking through the factory floor, with progressive reveal of content sections as the user scrolls. The initial view shows a factory entrance sign (Filete-style welcome sign), which disappears on scroll to reveal the factory floor (content sections).

## Layout Structure

### Overall Page Container

```
┌─────────────────────────────────────────┐
│  <header className="floating-header">   │  (Floating, semi-transparent)
│  - Advanced Search Button               │
│  - Login/Authentication Button          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  <main className="home-page">           │
│  ┌───────────────────────────────────┐  │
│  │  Hero Section (Filete Sign)       │  │
│  │  - "Bienvenidos a la Usina..."    │  │
│  │  - Colorful Filete decorations    │  │
│  │  - Disappears on scroll            │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Full-Width Search Bar             │  │
│  │  - Appears when scrolling          │  │
│  │  - Sticky/fixed behavior           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Featured Fabrica Placeholder      │  │
│  │  - 16:9 aspect ratio               │  │
│  │  - Full page width                 │  │
│  │  - "PROXIMAMENTE..." message       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Volumetric Indicators Section    │  │
│  │  - Entity counts (WarningLabel)    │  │
│  │  - 6 entity types                 │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Featured Entities Section        │  │
│  │  - 5 Fabricas                     │  │
│  │  - 5 Canciones                    │  │
│  │  - 5 Proveedores                   │  │
│  │  - 5 Jingleros                    │  │
│  │  - 5 Jingles                      │  │
│  │  - 5 Temáticas                    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Layout Zones

1. **Hero Zone** (Initial view, centered, full viewport)

   - Filete-style welcome sign
   - Disappears on scroll (parallax/sticky effect)
   - Maximum visual impact on initial load

2. **Search Zone** (Full-width, sticky)

   - Full-width search bar
   - Appears when scrolling through page
   - Sticky/fixed positioning

3. **Featured Content Zone** (Progressive reveal)

   - Featured Fabrica placeholder (16:9, full-width)
   - Volumetric indicators (entity counts)
   - Featured entities by type (6 subsections)

4. **Navigation Zone** (Floating header)
   - Semi-transparent floating header
   - Factory signage aesthetic buttons
   - Advanced Search and Login access

## Component Composition

### 1. Hero Section - Filete Welcome Sign

**Location**: Initial viewport, centered, full viewport height
**Code Reference**: To be implemented
**Design Reference**: `docs/2_frontend_ui-design-system/05_visual-references/Filete-Cartel-entrada.png`

**Components**:

- **Filete Sign Component**: Decorative sign with colorful Filete borders (SVG implementation)
  - Three-line text layout:
    - Top: "Bienvenido a la" (Rye font, 45px, white)
    - Main: "USINA" (Sancreek font, 80px, gold gradient)
    - Bottom: "de la Fábrica de Jingles" (Rye font, 40px, white)
  - Dark background board (`#1a1a1a`) with gold gradient border frame
  - Red accent border (`#e03131`)
  - Colorful Filete decorations: 4 corner scroll ornaments, 2 central flowers, decorative swirls
  - SVG-based implementation with reusable components
  - **Code Reference**: `docs/2_frontend_ui-design-system/05_visual-references/filete.html`
  - **Component Spec**: `docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md`

**Layout Specifications**:

- **Initial State**: Centered in viewport, full viewport height
- **Scroll Behavior**: Disappears/fades out when user scrolls down (parallax effect)
- **Background**: Base page background color (`--color-bg-primary`)
- **Positioning**: Fixed/absolute positioning for scroll effect
- **Responsive**: Scales appropriately for mobile/tablet

**Visual Specifications**:

- **Typography**: Decorative serif fonts (Rye, Sancreek from Google Fonts)
  - Top/Bottom lines: Rye font, white text with 3D shadow
  - Main title: Sancreek font, gold gradient fill with dark brown stroke
  - Text shadow filter: Creates fake 3D shadow effect typical of Fileteo signs
- **Filete Decorations** (SVG-based):
  - Border frame: Gold gradient (`#FFF5C3` → `#FFD700` → `#DAA520`) with red accent (`#e03131`)
  - Corner ornaments: 4 corner scrolls with gold spirals, green leaves, red decorative balls
  - Central flowers: 2 side accent flowers (5-petal, red gradient with gold centers)
  - Decorative lines: Turquoise swirls (`#63e6be`) above and below text
  - Colors: Gold, red, green/turquoise gradients for volume and depth
  - Style: Elaborate, colorful, vintage Argentine Fileteo Porteño style
- **Background**: Dark board (`#1a1a1a`) with rounded corners, medium grey border

**Design Intent**:

- Mimics vintage factory entrance sign
- Creates strong first impression
- Establishes industrial aesthetic
- Disappears on scroll to reveal factory floor (content sections)

**Implementation Notes**:

- Component: `FileteSign` or `WelcomeSign` (to be created)
- Implementation: SVG-based with reusable components (corner scrolls, flowers)
- Structure: ViewBox 1000x350 (3:1 aspect ratio), preserves aspect ratio on resize
- CSS: Custom styling for Filete decorations (SVG graphics with gradients)
- Animation: Fade out/parallax on scroll (to be implemented in React component)
- Reference: `docs/2_frontend_ui-design-system/05_visual-references/filete.html` (complete SVG implementation)
- Component Spec: `docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md` (updated 2025-11-28)

### 2. Full-Width Search Bar

**Location**: Below hero section, full page width, sticky/fixed on scroll
**Code Reference**: To be implemented (currently in hero section)
**Design Intent**: Full-width search bar that appears when scrolling through the page

**Functionality** (per WORKFLOW_010):

- User enters search query
- Displays matching entities inline (dropdown/list)
- User selects entity from list
- Navigates to entity inspection page

**Layout Specifications**:

- **Width**: Full page width (100vw or container width)
- **Positioning**:
  - Initial: Below hero section
  - On Scroll: Sticky/fixed positioning (stays visible while scrolling)
- **Height**: Proportional to design system (to be refined in iterations)
- **Padding**: Appropriate spacing from edges
- **Background**: Base background or subtle elevation
- **Z-index**: Appropriate for sticky behavior (above content, below floating header)

**Visual Specifications**:

- **Search Input**: Full-width input field
- **Styling**: Industrial aesthetic, consistent with design system
- **Placeholder**: "Buscar jingles, canciones, artistas, temáticas, fábricas..."
- **Dropdown**: Positioned below search bar, full-width or proportional
- **Results Display**: Inline entity list (dropdown/overlay)

**States**:

- **Default**: Empty search field with placeholder
- **Active**: User typing, suggestions displayed
- **Results**: Entity list displayed in dropdown
- **Empty Query**: No results or prevented submission
- **Sticky**: Fixed position when scrolling past initial position

**Design Intent**:

- Prominent, accessible search functionality
- Always available as user scrolls through content
- Full-width for maximum usability
- Iterative refinement of proportions and details

**Implementation Notes**:

- Component: `SearchBar` (existing) or `FullWidthSearchBar` (new variant)
- Behavior: Sticky/fixed positioning on scroll
- Responsive: Adapts to mobile/tablet screen sizes

### 3. Featured Fabrica Placeholder

**Location**: Below search bar, full page width
**Code Reference**: To be implemented
**Design Intent**: Placeholder for future Featured Fabrica component (will be refactored from Show route)

**Components**:

- **Placeholder Container**: 16:9 aspect ratio container
- **Message**: "PROXIMAMENTE VEA AQUI LA FABRICA MAS RECIENTE"
- **Background**: Base background or subtle styling

**Layout Specifications**:

- **Aspect Ratio**: 16:9 (standard video/display ratio)
- **Width**: Full page width (100% of container)
- **Height**: Calculated based on 16:9 ratio
- **Positioning**: Block-level element, full-width
- **Spacing**: Appropriate margin-top/bottom for section separation

**Visual Specifications**:

- **Typography**: Factory signage font for message
- **Text**: "PROXIMAMENTE VEA AQUI LA FABRICA MAS RECIENTE"
- **Styling**: Centered text, appropriate size
- **Background**: Base background color or subtle treatment
- **Border/Frame**: Optional subtle border or frame treatment

**Design Intent**:

- Placeholder for future Featured Fabrica display
- Will be replaced with nested component from Show route refactoring
- Maintains layout structure and spacing
- Clear indication of upcoming feature

**Implementation Notes**:

- Temporary placeholder component
- Will be replaced with actual Featured Fabrica component
- Maintains responsive behavior (16:9 ratio preserved)

### 4. Volumetric Indicators Section

**Location**: Below Featured Fabrica placeholder
**Code Reference**: To be implemented
**Design Reference**: Admin Dashboard (`frontend/src/pages/admin/AdminDashboard.tsx:950-995`)

**Purpose**:

- Raise awareness of large volume of data in Knowledge DB
- Display total count per entity type
- Visual reference: Food warning octagons (WarningLabel component)

**Components**:

- **WarningLabel Components**: Black octagon style indicators
  - 6 entity types: Fabricas, Jingles, Canciones, Proveedores, Jingleros, Temáticas
  - Each displays total count for that entity type
  - No interaction (static display)

**Layout Specifications**:

- **Grid Layout**: Responsive grid (similar to Admin Dashboard)
  - Desktop: `repeat(auto-fit, minmax(200px, 1fr))` or similar
  - Mobile: Stack or rearrange for smaller screens
- **Spacing**: Appropriate gap between indicators
- **Alignment**: Centered or justified

**Entity Type Definitions**:

- **Fabricas**: Total count of Fabricas
- **Jingles**: Total count of Jingles
- **Canciones**: Total count of Canciones
- **Proveedores**: Count of Artistas with at least one `AUTOR_DE` relationship
- **Jingleros**: Count of Artistas with at least one `JINGLERO_DE` relationship
- **Temáticas**: Total count of Temáticas

**Visual Specifications**:

- **Component**: `WarningLabel` (existing component)
  - Size: Medium or large (to be determined)
  - Style: Black octagon with white text (food warning label aesthetic)
  - Typography: Factory signage font
- **Layout**: Grid of 6 indicators
- **Colors**:
  - Octagon: `--color-warning-label-bg` (black)
  - Text: `--color-warning-label-text` (white)
  - Label: `--color-text-primary`

**Design Intent**:

- Visual impact to show data volume
- Industrial aesthetic (warning label style)
- Clear, readable statistics
- No interaction (awareness only)

**Responsive Behavior**:

- **Desktop/Landscape**: Side-by-side with Featured Entities (if combined)
- **Mobile/Portrait**: May stack or alternate with Featured Entities sections
- **Combined Layout**: Consider combining with Featured Entities for space efficiency

**Implementation Notes**:

- Use existing `WarningLabel` component
- API: Fetch entity counts (may need new endpoints for Proveedores/Jingleros)
- Code Reference: `frontend/src/components/common/WarningLabel.tsx`

### 5. Featured Entities Section

**Location**: Below Volumetric Indicators
**Code Reference**: To be implemented

**Purpose** (per WORKFLOW_010):

- Display featured entities by type
- Provide navigation to entity inspection pages
- Support content discovery

**Layout Structure**:

- **Series of Boxes by Entity Type**: 6 subsections, one per entity type
- **Each Subsection**:
  - Section title with entity type name
  - Grid/list of 5 featured entities
  - EntityCard components for each entity

**Entity Subsections**:

1. **Featured Fabricas** (5 entities)
   - Sorted by: Recency or popularity (to be determined)
   - Display: EntityCard components
2. **Featured Canciones** (5 entities)
   - Sorted by: Recency or popularity
   - Display: EntityCard components
3. **Featured Proveedores** (5 entities)
   - Sorted by: Recency or popularity
   - Display: EntityCard components (Artistas with AUTOR_DE relationship)
4. **Featured Jingleros** (5 entities)
   - Sorted by: Recency or popularity
   - Display: EntityCard components (Artistas with JINGLERO_DE relationship)
5. **Featured Jingles** (5 entities)
   - Sorted by: Recency or popularity
   - Display: EntityCard components
6. **Featured Temáticas** (5 entities)
   - Sorted by: Recency or popularity
   - Display: EntityCard components

**Layout Specifications**:

- **Section Structure**: Each entity type in its own subsection
- **Grid Layout**: Similar to current Featured Fabricas grid
  - Desktop: `repeat(auto-fill, minmax(300px, 1fr))` or similar
  - Mobile: Single column or stacked
- **Spacing**: Large spacing between sections (acceptable, can refine later)
- **Full Width**: Sections use full page width

**Visual Specifications**:

- **Section Titles**: Factory signage font, appropriate size
- **Entity Cards**: Use existing `EntityCard` component
- **Icons**: Optional icons for each entity type section
- **Background**: Base background (no distinct background colors)

**Combined Layout Opportunity**:

- **Desktop/Landscape**: Consider side-by-side layout with Volumetric Indicators
  - Volumetric Indicators on left/right
  - Featured Entities list on opposite side
- **Mobile/Portrait**: Alternate Volumetric Indicators and Featured Entities
  - Long scroll with alternating sections
  - Space-efficient layout

**Design Intent**:

- Progressive reveal of content (factory floor metaphor)
- Clear organization by entity type
- Easy content discovery
- Large spacing acceptable (can refine later)

**Implementation Notes**:

- Component: Multiple subsections, each with EntityCard grid
- API: Fetch featured entities for each type (5 per type)
- Sorting: By recency or popularity (to be determined)
- Responsive: Stack or rearrange for smaller screens

### 6. Floating Header Navigation

**Location**: Fixed/floating at top of viewport
**Code Reference**: To be implemented

**Components** (per WORKFLOW_010):

- **Advanced Search Button**: Navigate to Advanced Search page
- **Login/Authentication Button**: Navigate to Login sequence

**Layout Specifications**:

- **Positioning**: Fixed/floating above page content
- **Transparency**: Semi-transparent background
- **Width**: Full page width
- **Height**: Appropriate for button height + padding
- **Z-index**: Above page content, below modals/overlays
- **Visibility**: Always visible while scrolling

**Visual Specifications**:

- **Button Style**: Factory signage aesthetic
  - Typography: Factory signage font (`--font-family-signage`)
  - Styling: Industrial, bold, uppercase (optional)
  - Colors: Design system colors (accent or primary)
- **Background**: Semi-transparent overlay
  - Background color: `--color-bg-secondary` or `--color-bg-tertiary` with opacity
  - Backdrop blur: Optional for modern effect
- **Spacing**: Appropriate padding for buttons
- **Alignment**: Buttons aligned (left/right or centered)

**Design Intent**:

- Subtle, non-intrusive navigation
- Always accessible while scrolling
- Factory signage aesthetic for buttons
- Semi-transparent to maintain visual connection with content

**Implementation Notes**:

- Component: `FloatingHeader` or similar
- Styling: Semi-transparent background, factory signage buttons
- Behavior: Fixed positioning, always visible
- Responsive: Adapts to mobile (may stack buttons or use hamburger menu)

## Visual Hierarchy

### Primary Elements (Highest Priority)

1. **Filete Welcome Sign** - Initial visual impact, brand identity
2. **Full-Width Search Bar** - Primary call-to-action, always accessible
3. **Featured Fabrica Placeholder** - Prominent content area

### Secondary Elements

1. **Volumetric Indicators** - Data awareness, statistics
2. **Featured Entities Sections** - Content discovery by type

### Tertiary Elements

1. **Floating Header Navigation** - Supporting navigation options
2. **Advanced Search Button** - Alternative search access
3. **Login Button** - Authentication access

## Responsive Behavior

### Desktop (> 768px, Landscape)

- **Container**: Full width (no max-width constraint)
- **Filete Sign**: Full viewport height, centered
- **Search Bar**: Full width, sticky on scroll
- **Featured Fabrica**: Full width, 16:9 aspect ratio
- **Volumetric Indicators**: Grid layout (side-by-side with Featured Entities if combined)
- **Featured Entities**: Grid layout, multiple columns
- **Floating Header**: Full width, buttons aligned

### Tablet (Portrait/Landscape)

- **Filete Sign**: Scales appropriately
- **Search Bar**: Full width
- **Volumetric Indicators**: May combine with Featured Entities (side-by-side in landscape)
- **Featured Entities**: Grid adapts to screen width
- **Floating Header**: Adapts button layout

### Mobile (≤ 768px, Portrait)

- **Container**: Full width, minimal padding
- **Filete Sign**: Scales to viewport, may adjust aspect ratio
- **Search Bar**: Full width
- **Featured Fabrica**: Full width, 16:9 preserved
- **Volumetric Indicators**:
  - May stack vertically
  - May alternate with Featured Entities sections (long scroll)
- **Featured Entities**:
  - Single column or stacked layout
  - May alternate with Volumetric Indicators
- **Floating Header**:
  - Buttons may stack vertically
  - May use hamburger menu for compact layout

### Responsive Considerations

- **Portrait vs Landscape**: Different layouts for portrait/landscape orientations
- **Section Visibility**: All sections remain visible (may stack or rearrange)
- **Combined Layouts**: Volumetric Indicators and Featured Entities may combine for space efficiency
- **Progressive Reveal**: Maintains factory floor metaphor across all screen sizes

**Code Reference**: `frontend/src/styles/pages/home.css:125-146` (current), to be updated

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

### Empty States

**Clarification Needed**: Specific empty state requirements to be determined.

**Current Considerations**:

- **No Featured Entities**: What to display when no entities available for a type?
- **No Volumetric Data**: What to display when counts are unavailable?
- **No Search Results**: Already handled in search component

**Proposed Approach** (to be confirmed):

- **Featured Entities Empty**: Show message "No [entity type] disponibles" or hide section
- **Volumetric Indicators Empty**: Show "0" or loading state
- **Overall Empty**: Graceful degradation, show available content

**Design Intent**:

- Maintain industrial aesthetic
- Clear messaging
- No broken layouts
- Graceful handling of missing data

### Populated State

- **Display**: Full content with all sections populated
- **Code Reference**: `frontend/src/pages/Home.tsx:84-106`

## Design Tokens Used

### Colors

- **Background Primary**: `--color-bg-primary` (dark charcoal, weathered concrete)
- **Background Secondary**: `--color-bg-secondary` (slightly lighter charcoal)
- **Background Tertiary**: `--color-bg-tertiary` (medium grey, metal panels)
- **Text Primary**: `--color-text-primary` (light grey, high contrast)
- **Text Secondary**: `--color-text-secondary` (medium grey)
- **Accent Colors**: `--color-accent-primary`, `--color-accent-interactive` (for Filete decorations, buttons)
- **Warning Label Background**: `--color-warning-label-bg` (black)
- **Warning Label Text**: `--color-warning-label-text` (white)

### Spacing

- **Large Spacing**: `--spacing-xl` (32px) - Major section spacing
- **Medium Spacing**: `--spacing-lg` (24px) - Section spacing
- **Standard Spacing**: `--spacing-md` (16px) - Component gaps
- **Small Spacing**: `--spacing-sm` (8px) - Tight spacing
- **Container Padding**: Full width (no max-width), minimal padding
- **Section Margins**: Large spacing acceptable (can refine later)

### Typography

- **Factory Signage Font**: `--font-family-signage` (Bebas Neue, Impact, Arial Black)
  - Filete Sign title
  - Section titles
  - Floating header buttons
  - WarningLabel values and labels
- **Body Font**: `--font-family-body` (system fonts)
  - General content, descriptions
- **Display Size**: `--font-size-display` (4rem) - Filete Sign title
- **H1 Size**: `--font-size-h1` (3rem) - Major headings
- **H2 Size**: `--font-size-h2` (2.25rem) - Section headings
- **H3 Size**: `--font-size-h3` (1.75rem) - Subsection headings

### Layout

- **Container**: Full width (100vw or container width)
- **Grid Layout**: `repeat(auto-fill, minmax(300px, 1fr))` for entity grids
- **Aspect Ratio**: 16:9 for Featured Fabrica placeholder
- **Responsive Breakpoints**: 768px (mobile/desktop), consider portrait/landscape

## Implementation Details

### Current Implementation

- ✅ Basic hero section with title, subtitle, and search bar
- ✅ Featured Fabricas section (6 most recent)
- ✅ Loading and error states
- ✅ Basic responsive design
- ✅ Search functionality (navigates to `/search`)

### Target Implementation (Design Intent - 2025-11-26)

#### Phase 1: Core Layout Structure

- ⏳ **Filete Welcome Sign Component**

  - Decorative sign with colorful Filete borders
  - "Bienvenidos a la Usina de la Fábrica de Jingles" text
  - Scroll behavior (disappears on scroll)
  - Full viewport height initial display

- ⏳ **Full-Width Search Bar**

  - Full page width search interface
  - Sticky/fixed positioning on scroll
  - Inline entity results (per WORKFLOW_010)

- ⏳ **Featured Fabrica Placeholder**
  - 16:9 aspect ratio, full width
  - "PROXIMAMENTE VEA AQUI LA FABRICA MAS RECIENTE" message
  - Placeholder for future refactored component

#### Phase 2: Content Sections

- ⏳ **Volumetric Indicators Section**

  - 6 WarningLabel components (entity counts)
  - Fabricas, Jingles, Canciones, Proveedores, Jingleros, Temáticas
  - Grid layout, responsive
  - No interaction (awareness only)

- ⏳ **Featured Entities Section**
  - 6 subsections (one per entity type)
  - 5 entities per type (sorted by recency or popularity)
  - EntityCard components in grid layout
  - Large spacing between sections

#### Phase 3: Navigation

- ⏳ **Floating Header Navigation**
  - Semi-transparent floating header
  - Advanced Search button (factory signage aesthetic)
  - Login/Authentication button (factory signage aesthetic)
  - Always visible while scrolling

#### Implementation Notes

- **Visual Metaphor**: Supervisor walking through factory floor (progressive reveal)
- **Layout**: Full width, no max-width constraints
- **Spacing**: Large spacing acceptable, can refine later
- **Responsive**: Consider portrait/landscape, mobile/desktop
- **Combined Layouts**: Volumetric Indicators and Featured Entities may combine for space efficiency

**Note**: The current implementation navigates to `/search` on search submission. Per WORKFLOW_010 Step 5, the global search should display matching entities inline on the landing page, allowing direct selection without navigation.

## Component Dependencies

### Required Components

#### Existing Components

- `SearchBar` - Global search interface

  - **Code Reference**: `frontend/src/components/search/SearchBar.tsx`
  - **Usage**: Full-width search bar, sticky on scroll
  - **Modification**: May need full-width variant or styling updates

- `EntityCard` - Entity display cards

  - **Code Reference**: `frontend/src/components/common/EntityCard.tsx`
  - **Usage**: Featured Entities grids (all 6 entity types)
  - **Variant**: `contents` or appropriate variant

- `WarningLabel` - Volumetric indicators
  - **Code Reference**: `frontend/src/components/common/WarningLabel.tsx`
  - **Usage**: Entity count displays (6 indicators)
  - **Size**: Medium or large (to be determined)

#### New Components to Create

- `FileteSign` or `WelcomeSign` - Hero section sign

  - **Purpose**: Decorative welcome sign with Filete decorations
  - **Features**:
    - Colorful Filete border decorations
    - Factory signage typography
    - Scroll behavior (fade out on scroll)
  - **Reference**: `docs/2_frontend_ui-design-system/05_visual-references/Filete-Cartel-entrada.png`

- `FloatingHeader` - Navigation header

  - **Purpose**: Semi-transparent floating navigation
  - **Features**:
    - Fixed positioning
    - Semi-transparent background
    - Factory signage buttons
    - Advanced Search and Login buttons

- `FeaturedFabricaPlaceholder` - Placeholder component

  - **Purpose**: 16:9 placeholder for future Featured Fabrica
  - **Features**:
    - 16:9 aspect ratio
    - Full width
    - "PROXIMAMENTE..." message

- `VolumetricIndicators` - Entity count section

  - **Purpose**: Display entity counts using WarningLabel components
  - **Features**:
    - Grid of 6 WarningLabel components
    - Responsive layout
    - Entity count fetching

- `FeaturedEntitiesSection` - Entity discovery section
  - **Purpose**: Display featured entities by type
  - **Features**:
    - 6 subsections (one per entity type)
    - 5 entities per type
    - EntityCard grid layout
    - Responsive behavior

### API Dependencies

#### Existing Endpoints

- `publicApi.getFabricas()` - Fetch featured Fabricas
  - **Code Reference**: `frontend/src/pages/Home.tsx:22`
  - **Usage**: Load featured Fabricas (currently 6, will change to 5)

#### New Endpoints Needed

- **Entity Counts**: Fetch total counts for all entity types

  - Fabricas, Jingles, Canciones, Temáticas: Direct counts
  - Proveedores: Count of Artistas with `AUTOR_DE` relationship
  - Jingleros: Count of Artistas with `JINGLERO_DE` relationship
  - **Usage**: Volumetric Indicators section

- **Featured Entities**: Fetch 5 featured entities per type
  - `getFeaturedJingles()` - 5 most recent or popular
  - `getFeaturedCanciones()` - 5 most recent or popular
  - `getFeaturedProveedores()` - 5 Artistas with AUTOR_DE (most recent or popular)
  - `getFeaturedJingleros()` - 5 Artistas with JINGLERO_DE (most recent or popular)
  - `getFeaturedTematicas()` - 5 most recent or popular
  - **Usage**: Featured Entities sections
  - **Sorting**: By recency or popularity (to be determined)

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

| Version | Date       | Change                                                     | Author | Rationale                                    |
| ------- | ---------- | ---------------------------------------------------------- | ------ | -------------------------------------------- |
| 2.1     | 2025-11-28 | Updated Filete Sign specifications with SVG implementation | -      | Documented filete.html implementation        |
| 2.0     | 2025-11-26 | Complete design intent documentation                       | -      | Design intent interview, comprehensive specs |
| 1.0     | 2025-01-20 | Initial layout document                                    | -      | Document layout per WORKFLOW_010             |

## Design Intent Interview Summary (2025-11-26)

**Interviewer**: Senior UI Designer  
**Interviewee**: UX Designer  
**Date**: 2025-11-26

### Key Design Decisions Documented

1. **Hero Section**: Filete-style welcome sign with colorful decorations, disappears on scroll
2. **Search Bar**: Full-width, sticky/fixed on scroll
3. **Volumetric Indicators**: WarningLabel components (black octagons) showing entity counts
4. **Featured Fabrica**: 16:9 placeholder with "PROXIMAMENTE..." message
5. **Featured Entities**: 6 subsections, 5 entities per type, large spacing
6. **Navigation**: Floating semi-transparent header with factory signage buttons
7. **Layout**: Full width, progressive reveal, factory floor metaphor
8. **Responsive**: Portrait/landscape considerations, combined layouts for efficiency

### Visual References

- **Filete Sign**:
  - SVG Implementation: `docs/2_frontend_ui-design-system/05_visual-references/filete.html` (updated 2025-11-28)
  - Original Reference: `docs/2_frontend_ui-design-system/05_visual-references/Filete-Cartel-entrada.png`
  - Component Spec: `docs/2_frontend_ui-design-system/03_components/composite/filete-sign.md`
- **WarningLabel**: Admin Dashboard implementation (`frontend/src/pages/admin/AdminDashboard.tsx`)
- **Design System**: Industrial dark theme with vibrant accents

### Next Steps

1. Create FileteSign component specifications
2. Design full-width search bar variant
3. Implement volumetric indicators section
4. Design featured entities subsections
5. Create floating header component
6. Refine responsive behavior and combined layouts
