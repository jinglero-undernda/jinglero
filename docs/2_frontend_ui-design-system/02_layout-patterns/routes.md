# Route Mapping

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `frontend/src/App.tsx:112-122`, `frontend/src/pages/AdminPage.tsx:33-82`

## Overview

This document maps all application routes to their corresponding components and page templates. This technical mapping supports navigation workflows and layout pattern documentation.

## Public Routes

### Home Route
- **Route Pattern**: `/`
- **Component**: `Home`
- **Page Template**: Landing Page
- **Code Reference**: `frontend/src/App.tsx:113`
- **File**: `frontend/src/pages/Home.tsx`

### Search Route
- **Route Pattern**: `/search`
- **Component**: `SearchResultsPage`
- **Page Template**: Search Results Page
- **Code Reference**: `frontend/src/App.tsx:114`
- **File**: `frontend/src/pages/SearchResultsPage.tsx`

### Fabrica Player Routes
- **Route Pattern**: `/show/:fabricaId`
- **Component**: `FabricaPage`
- **Page Template**: Detail Page (Video Player)
- **Code Reference**: `frontend/src/App.tsx:115`
- **File**: `frontend/src/pages/FabricaPage.tsx`
- **Parameters**: `fabricaId` - Fabrica entity ID

- **Route Pattern**: `/show`
- **Component**: `FabricaPage`
- **Page Template**: Detail Page (Video Player)
- **Code Reference**: `frontend/src/App.tsx:116`
- **File**: `frontend/src/pages/FabricaPage.tsx`
- **Note**: Loads latest Fabrica when no ID provided

### Entity Inspection Routes
- **Route Pattern**: `/j/:jingleId`
- **Component**: `InspectJingle`
- **Page Template**: Detail Page
- **Code Reference**: `frontend/src/App.tsx:117`
- **File**: `frontend/src/pages/inspect/InspectJingle.tsx`
- **Parameters**: `jingleId` - Jingle entity ID

- **Route Pattern**: `/c/:cancionId`
- **Component**: `InspectCancion`
- **Page Template**: Detail Page
- **Code Reference**: `frontend/src/App.tsx:118`
- **File**: `frontend/src/pages/inspect/InspectCancion.tsx`
- **Parameters**: `cancionId` - Cancion entity ID

- **Route Pattern**: `/f/:fabricaId`
- **Component**: `InspectFabrica`
- **Page Template**: Detail Page
- **Code Reference**: `frontend/src/App.tsx:119`
- **File**: `frontend/src/pages/inspect/InspectFabrica.tsx`
- **Parameters**: `fabricaId` - Fabrica entity ID

- **Route Pattern**: `/a/:artistaId`
- **Component**: `InspectArtista`
- **Page Template**: Detail Page
- **Code Reference**: `frontend/src/App.tsx:120`
- **File**: `frontend/src/pages/inspect/InspectArtista.tsx`
- **Parameters**: `artistaId` - Artista entity ID

- **Route Pattern**: `/t/:tematicaId`
- **Component**: `InspectTematica`
- **Page Template**: Detail Page
- **Code Reference**: `frontend/src/App.tsx:121`
- **File**: `frontend/src/pages/inspect/InspectTematica.tsx`
- **Parameters**: `tematicaId` - Tematica entity ID

## Admin Routes

All admin routes are nested under `/admin/*` and handled by `AdminPage` component.

### Admin Login
- **Route Pattern**: `/admin/login`
- **Component**: `AdminLogin`
- **Page Template**: Admin Page
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:35`
- **File**: `frontend/src/pages/admin/AdminLogin.tsx`
- **Authentication**: Not required

### Admin Dashboard
- **Route Pattern**: `/admin/dashboard`
- **Component**: `AdminDashboard`
- **Page Template**: Admin Page
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:39-45`
- **File**: `frontend/src/pages/admin/AdminDashboard.tsx`
- **Authentication**: Required (ProtectedRoute)

### Admin Search
- **Route Pattern**: `/admin/search`
- **Component**: `AdminHome`
- **Page Template**: Admin Page
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:48-54`
- **File**: `frontend/src/pages/admin/AdminHome.tsx`
- **Authentication**: Required (ProtectedRoute)
- **Note**: Shows entity selection interface

### Admin Entity Detail
- **Route Pattern**: `/admin/:entityType/:entityId`
- **Component**: `AdminEntityAnalyze`
- **Page Template**: Admin Page
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:57-63`
- **File**: `frontend/src/pages/admin/AdminEntityAnalyze.tsx`
- **Authentication**: Required (ProtectedRoute)
- **Parameters**: 
  - `entityType` - Single letter entity type (j, f, c, a, t)
  - `entityId` - Entity ID
- **Note**: Must come before `:entityType` route

### Admin Entity List
- **Route Pattern**: `/admin/:entityType`
- **Component**: `AdminEntityList`
- **Page Template**: Admin Page
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:66-72`
- **File**: `frontend/src/pages/admin/AdminEntityList.tsx`
- **Authentication**: Required (ProtectedRoute)
- **Parameters**: `entityType` - Single letter entity type (j, f, c, a, t)

### Admin Default
- **Route Pattern**: `/admin/*` (catch-all)
- **Component**: `AdminDashboard`
- **Page Template**: Admin Page
- **Code Reference**: `frontend/src/pages/AdminPage.tsx:75-81`
- **File**: `frontend/src/pages/admin/AdminDashboard.tsx`
- **Authentication**: Required (ProtectedRoute)
- **Note**: Default route shows dashboard

### Design System Showcase
- **Route Pattern**: `/admin/design-system/*`
- **Component**: `DesignSystemShowcase`
- **Page Template**: Admin Page
- **File**: `frontend/src/pages/admin/design-system/DesignSystemShowcase.tsx`
- **Authentication**: Required (ProtectedRoute)
- **Note**: Component showcase for design system iteration

## Route Patterns

### Entity Type Mapping
- `j` → Jingle
- `f` → Fabrica
- `c` → Cancion
- `a` → Artista
- `t` → Tematica

### Route Priority
Routes are matched in order of specificity:
1. Exact paths (e.g., `/admin/login`)
2. Parameterized paths (e.g., `/admin/:entityType/:entityId`)
3. Catch-all paths (e.g., `/admin/*`)

## Related Documentation

- Layout patterns: `page-templates/`
- Navigation workflows: `../../1_frontend_ux-workflows/workflows/navigation/`

