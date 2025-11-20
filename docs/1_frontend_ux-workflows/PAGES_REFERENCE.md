# Pages Reference

## Purpose

This document provides a centralized reference for all pages/states in the application to ensure consistent naming across workflow documentation. Use these standardized page names when documenting workflows.

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-01-20
- **Maintained By**: UX Workflows Documentation

## Page Naming Convention

Pages are named using:

- **Descriptive names** that reflect user-facing purpose
- **Consistent terminology** across all workflows
- **Route mapping** to technical implementation

## Public Pages

### Landing Page

- **Page Name**: Landing Page
- **Route**: `/`
- **Component**: `Home`
- **Code Reference**: `frontend/src/App.tsx:113`, `frontend/src/pages/Home.tsx`
- **Description**: Primary entry point for all users. Displays navigation options, featured content, and search interface.
- **User Role**: GUEST (public access)
- **Status**: To be designed

### Search Results Page

- **Page Name**: Search Results Page
- **Route**: `/search`
- **Component**: `SearchResultsPage`
- **Code Reference**: `frontend/src/App.tsx:114`, `frontend/src/pages/SearchResultsPage.tsx`
- **Description**: Displays search results based on user query. May support query parameters for search terms.
- **User Role**: GUEST (public access)

### Advanced Search Page

- **Page Name**: Advanced Search Page
- **Route**: `/search/advanced` (to be implemented)
- **Component**: To be implemented
- **Code Reference**: To be determined
- **Description**: Dedicated page with advanced search options, filters, and sophisticated search capabilities.
- **User Role**: GUEST (public access)
- **Status**: Planned

### Fabrica Player Page

- **Page Name**: Fabrica Player Page
- **Route**: `/show` or `/show/:fabricaId`
- **Component**: `FabricaPage`
- **Code Reference**: `frontend/src/App.tsx:115-116`, `frontend/src/pages/FabricaPage.tsx`
- **Description**: Video player page for viewing Fabricas. Loads latest Fabrica if no ID provided.
- **User Role**: GUEST (public access)

### Entity Inspection Pages

These pages follow the pattern: `[Entity Type] Inspection Page`

#### Jingle Inspection Page

- **Page Name**: Jingle Inspection Page
- **Route**: `/j/:jingleId`
- **Component**: `InspectJingle`
- **Code Reference**: `frontend/src/App.tsx:117`, `frontend/src/pages/inspect/InspectJingle.tsx`
- **Description**: Detail page for viewing Jingle entity information.
- **User Role**: GUEST (public access)

#### Cancion Inspection Page

- **Page Name**: Cancion Inspection Page
- **Route**: `/c/:cancionId`
- **Component**: `InspectCancion`
- **Code Reference**: `frontend/src/App.tsx:118`, `frontend/src/pages/inspect/InspectCancion.tsx`
- **Description**: Detail page for viewing Cancion entity information.
- **User Role**: GUEST (public access)

#### Fabrica Inspection Page

- **Page Name**: Fabrica Inspection Page
- **Route**: `/f/:fabricaId`
- **Component**: `InspectFabrica`
- **Code Reference**: `frontend/src/App.tsx:119`, `frontend/src/pages/inspect/InspectFabrica.tsx`
- **Description**: Detail page for viewing Fabrica entity information.
- **User Role**: GUEST (public access)

#### Artista Inspection Page

- **Page Name**: Artista Inspection Page
- **Route**: `/a/:artistaId`
- **Component**: `InspectArtista`
- **Code Reference**: `frontend/src/App.tsx:120`, `frontend/src/pages/inspect/InspectArtista.tsx`
- **Description**: Detail page for viewing Artista entity information.
- **User Role**: GUEST (public access)

#### Tematica Inspection Page

- **Page Name**: Tematica Inspection Page
- **Route**: `/t/:tematicaId`
- **Component**: `InspectTematica`
- **Code Reference**: `frontend/src/App.tsx:121`, `frontend/src/pages/inspect/InspectTematica.tsx`
- **Description**: Detail page for viewing Tematica entity information.
- **User Role**: GUEST (public access)

## Authentication Pages

### Login Page

- **Page Name**: Login Page
- **Route**: `/admin/login`
- **Component**: `AdminLogin`
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:36`, `frontend/src/pages/admin/AdminLogin.tsx`
- **Description**: Authentication entry point for users to become USER or ADMIN.
- **User Role**: GUEST → USER/ADMIN (transition)
- **Authentication**: Not required (public access to login)

## Admin Pages

All admin pages are nested under `/admin/*` and require authentication.

### Admin Dashboard Page

- **Page Name**: Admin Dashboard Page
- **Route**: `/admin/dashboard` or `/admin/*` (default)
- **Component**: `AdminDashboard`
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:40-45, 85-92`, `frontend/src/pages/admin/AdminDashboard.tsx`
- **Description**: Main dashboard for admin users showing overview and navigation.
- **User Role**: ADMIN
- **Authentication**: Required

### Admin Search Page

- **Page Name**: Admin Search Page
- **Route**: `/admin/search`
- **Component**: `AdminHome`
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:49-55`, `frontend/src/pages/admin/AdminHome.tsx`
- **Description**: Entity selection interface for admin users.
- **User Role**: ADMIN
- **Authentication**: Required

### Admin Entity Detail Page

- **Page Name**: Admin Entity Detail Page
- **Route**: `/admin/:entityType/:entityId`
- **Component**: `AdminEntityAnalyze`
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:67-73`, `frontend/src/pages/admin/AdminEntityAnalyze.tsx`
- **Description**: Entity management page for viewing and editing entity details.
- **User Role**: ADMIN
- **Authentication**: Required
- **Parameters**:
  - `entityType`: Single letter (j, f, c, a, t)
  - `entityId`: Entity ID

### Admin Entity List Page

- **Page Name**: Admin Entity List Page
- **Route**: `/admin/:entityType`
- **Component**: `AdminEntityList`
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:76-82`, `frontend/src/pages/admin/AdminEntityList.tsx`
- **Description**: List view of entities by type for admin management.
- **User Role**: ADMIN
- **Authentication**: Required
- **Parameters**: `entityType`: Single letter (j, f, c, a, t)

### Design System Showcase Page

- **Page Name**: Design System Showcase Page
- **Route**: `/admin/design-system/*`
- **Component**: `DesignSystemShowcase`
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:58-64`, `frontend/src/pages/admin/design-system/DesignSystemShowcase.tsx`
- **Description**: Component showcase for design system iteration and documentation.
- **User Role**: ADMIN
- **Authentication**: Required

## Page States

### View Mode

- **State Name**: View Mode
- **Description**: Read-only display of entity or content information
- **Context**: Used in admin pages for entity viewing

### Edit Mode

- **State Name**: Edit Mode
- **Description**: Editable state for modifying entity data
- **Context**: Used in admin pages for entity editing
- **Sub-states**:
  - Clean State (no unsaved changes)
  - Dirty State (has unsaved changes)

### Loading State

- **State Name**: Loading State
- **Description**: Page or component is fetching data
- **Context**: Used across all pages during data fetching

### Error State

- **State Name**: Error State
- **Description**: Page displays error message or error page
- **Context**: Used when data fetch fails or invalid route accessed

### Empty State

- **State Name**: Empty State
- **Description**: Page displays when no content is available
- **Context**: Used when search returns no results, no featured content, etc.

## Usage in Workflows

When documenting workflows, use these standardized page names:

✅ **Correct**: "User navigates to Landing Page"
❌ **Incorrect**: "User navigates to home page" or "User goes to the main page"

✅ **Correct**: "User views Jingle Inspection Page"
❌ **Incorrect**: "User views jingle page" or "User sees jingle details"

## Entity Type Abbreviations

For consistency, use these abbreviations in routes and references:

- `j` → Jingle
- `f` → Fabrica
- `c` → Cancion
- `a` → Artista
- `t` → Tematica

## Related Documentation

- Route mapping: `../2_frontend_ui-design-system/02_layout-patterns/routes.md`
- Workflow documentation: `./workflows/`
- Navigation workflows: `./workflows/navigation/`

## Change History

| Version | Date       | Change                  | Author | Rationale                           |
| ------- | ---------- | ----------------------- | ------ | ----------------------------------- |
| 1.0     | 2025-01-20 | Initial pages reference | -      | Baseline for workflow documentation |
