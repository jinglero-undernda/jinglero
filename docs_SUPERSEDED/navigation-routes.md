# Navigation Routes and Links Documentation

This document provides a comprehensive overview of all routes and navigation links in the interactive navigation website.

## Table of Contents

1. [Main Routes](#main-routes)
2. [Header Navigation](#header-navigation)
3. [Page-Level Navigation](#page-level-navigation)
4. [Dynamic Navigation Links](#dynamic-navigation-links)
5. [Query Parameters](#query-parameters)
6. [Admin Routes](#admin-routes)
7. [Navigation Patterns](#navigation-patterns)

---

## Main Routes

All routes are defined in `frontend/src/App.tsx` using React Router.

### Public Routes

| Route Pattern      | Component         | Description                                |
| ------------------ | ----------------- | ------------------------------------------ |
| `/`                | `Home`            | Landing/home page                          |
| `/show`            | `FabricaPage`     | Fabrica player page (loads latest Fabrica) |
| `/show/:fabricaId` | `FabricaPage`     | Fabrica player page for specific Fabrica   |
| `/j/:jingleId`     | `InspectJingle`   | Inspect/view Jingle details                |
| `/c/:cancionId`    | `InspectCancion`  | Inspect/view Cancion details               |
| `/f/:fabricaId`    | `InspectFabrica`  | Inspect/view Fabrica details               |
| `/a/:artistaId`    | `InspectArtista`  | Inspect/view Artista details               |
| `/t/:tematicaId`   | `InspectTematica` | Inspect/view Tematica details              |

### Admin Routes

| Route Pattern | Component   | Description                   |
| ------------- | ----------- | ----------------------------- |
| `/admin/*`    | `AdminPage` | Admin section (nested routes) |

### Demo/Test Routes

| Route Pattern                            | Component                    | Description                         |
| ---------------------------------------- | ---------------------------- | ----------------------------------- |
| `/inspect/:entityType/:entityId`         | `InspectEntityPage`          | Generic entity inspection demo page |
| `/inspect-related/:entityType/:entityId` | `InspectRelatedEntitiesPage` | Related entities demo page          |

---

## Header Navigation

**Location:** `frontend/src/App.tsx` (lines 17-21)

The header navigation appears on all pages and contains:

```tsx
<header>
  <nav>
    <Link to="/">Inicio</Link> | <Link to="/admin">Admin</Link>
  </nav>
</header>
```

### Header Links

| Link Text | Route    | Description               |
| --------- | -------- | ------------------------- |
| `Inicio`  | `/`      | Navigate to home page     |
| `Admin`   | `/admin` | Navigate to admin section |

---

## Page-Level Navigation

### Home Page (`/`)

**File:** `frontend/src/pages/Home.tsx`

**Navigation Links:**

```tsx
<nav>
  <Link to="/">Inicio</Link> |<Link to="/show">Fabrica</Link> |
  <Link to="/j/sample-jingle">Jingle</Link> |
  <Link to="/c/sample-cancion">Cancion</Link> |<Link to="/admin">Admin</Link>
</nav>
```

| Link Text | Route               | Description                           |
| --------- | ------------------- | ------------------------------------- |
| `Inicio`  | `/`                 | Home page (current page)              |
| `Fabrica` | `/show`             | Latest Fabrica player                 |
| `Jingle`  | `/j/sample-jingle`  | Sample Jingle inspection (hardcoded)  |
| `Cancion` | `/c/sample-cancion` | Sample Cancion inspection (hardcoded) |
| `Admin`   | `/admin`            | Admin section                         |

### Fabrica Page (`/show` or `/show/:fabricaId`)

**File:** `frontend/src/pages/FabricaPage.tsx`

**Navigation Links:**

- **Header Link (line 575):** `← Volver al inicio` → `/`
- **Error State Links (lines 451, 462):** `Volver al inicio` → `/`

| Link Text            | Route | Context                  |
| -------------------- | ----- | ------------------------ |
| `← Volver al inicio` | `/`   | Header link in main view |
| `Volver al inicio`   | `/`   | Error state fallback     |

**Note:** This page does NOT have the standard nav bar with multiple links. It only has a back-to-home link in the header.

### Inspect Pages

All inspect pages (`InspectJingle`, `InspectCancion`, `InspectFabrica`, `InspectArtista`, `InspectTematica`) have the same navigation pattern:

**Files:**

- `frontend/src/pages/inspect/InspectJingle.tsx`
- `frontend/src/pages/inspect/InspectCancion.tsx`
- `frontend/src/pages/inspect/InspectFabrica.tsx`
- `frontend/src/pages/inspect/InspectArtista.tsx`
- `frontend/src/pages/inspect/InspectTematica.tsx`

**Navigation Links:**

```tsx
<nav>
  <Link to="/">Inicio</Link> |<Link to="/show">Fabrica</Link> |
  <Link to="/j/sample-jingle">Jingle</Link> |
  <Link to="/c/sample-cancion">Cancion</Link> |<Link to="/admin">Admin</Link>
</nav>
```

| Link Text | Route               | Description                |
| --------- | ------------------- | -------------------------- |
| `Inicio`  | `/`                 | Home page                  |
| `Fabrica` | `/show`             | Latest Fabrica player      |
| `Jingle`  | `/j/sample-jingle`  | Sample Jingle (hardcoded)  |
| `Cancion` | `/c/sample-cancion` | Sample Cancion (hardcoded) |
| `Admin`   | `/admin`            | Admin section              |

**Note:** These pages use hardcoded sample IDs (`sample-jingle`, `sample-cancion`) rather than dynamic links.

### Admin Page (`/admin`)

**File:** `frontend/src/pages/AdminPage.tsx`

**Navigation Links:**

```tsx
<nav>
  <Link to="/">Inicio</Link> | <Link to="/admin">Admin</Link>
</nav>
```

| Link Text | Route    | Description                  |
| --------- | -------- | ---------------------------- |
| `Inicio`  | `/`      | Home page                    |
| `Admin`   | `/admin` | Admin section (current page) |

### Inspect Entity Page (`/inspect/:entityType/:entityId`)

**File:** `frontend/src/pages/inspect/InspectEntityPage.tsx`

**Navigation Links:**

- **Header Link (line 108):** `← Volver al inicio` → `/`
- **Quick Navigation Section (lines 432-448):** Links to test different entity types

| Link Text            | Route                      | Description              |
| -------------------- | -------------------------- | ------------------------ |
| `← Volver al inicio` | `/`                        | Back to home             |
| `Fabrica`            | `/inspect/f/test-fabrica`  | Test Fabrica inspection  |
| `Jingle`             | `/inspect/j/test-jingle`   | Test Jingle inspection   |
| `Cancion`            | `/inspect/c/test-cancion`  | Test Cancion inspection  |
| `Artista`            | `/inspect/a/test-artista`  | Test Artista inspection  |
| `Tematica`           | `/inspect/t/test-tematica` | Test Tematica inspection |

### Inspect Related Entities Page (`/inspect-related/:entityType/:entityId`)

**File:** `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx`

**Navigation Links:**

- **Header Link (lines 96, 110, 128):** `← Volver al inicio` → `/`
- **Quick Navigation Section (lines 192-208):** Links to test different entity types

| Link Text            | Route                              | Description                    |
| -------------------- | ---------------------------------- | ------------------------------ |
| `← Volver al inicio` | `/`                                | Back to home                   |
| `Fabrica`            | `/inspect-related/f/test-fabrica`  | Test Fabrica related entities  |
| `Jingle`             | `/inspect-related/j/test-jingle`   | Test Jingle related entities   |
| `Cancion`            | `/inspect-related/c/test-cancion`  | Test Cancion related entities  |
| `Artista`            | `/inspect-related/a/test-artista`  | Test Artista related entities  |
| `Tematica`           | `/inspect-related/t/test-tematica` | Test Tematica related entities |

---

## Dynamic Navigation Links

### EntityCard Component

**File:** `frontend/src/components/common/EntityCard.tsx`

The `EntityCard` component generates navigation links dynamically based on entity type and ID.

**Route Mapping Function (lines 57-66):**

```typescript
function getEntityRoute(entityType: EntityType, entityId: string): string {
  const routeMap: Record<EntityType, string> = {
    fabrica: `/show/${entityId}`,
    jingle: `/j/${entityId}`,
    cancion: `/c/${entityId}`,
    artista: `/a/${entityId}`,
    tematica: `/t/${entityId}`,
  };
  return routeMap[entityType];
}
```

**Dynamic Routes Generated:**

| Entity Type | Route Pattern      | Example      |
| ----------- | ------------------ | ------------ |
| `fabrica`   | `/show/:fabricaId` | `/show/0001` |
| `jingle`    | `/j/:jingleId`     | `/j/0001`    |
| `cancion`   | `/c/:cancionId`    | `/c/0001`    |
| `artista`   | `/a/:artistaId`    | `/a/0001`    |
| `tematica`  | `/t/:tematicaId`   | `/t/0001`    |

**Usage:**

- If `to` prop is provided, it uses that route
- If `onClick` is provided, it becomes a clickable div (no navigation)
- Otherwise, it automatically generates the route using `getEntityRoute()`

**Note:** EntityCard is used in:

- Related entities displays
- Search results
- Entity lists
- Admin entity displays

---

## Query Parameters

### Fabrica Page Query Parameters

**Route:** `/show/:fabricaId` or `/show`

| Parameter | Type   | Description                            | Example  |
| --------- | ------ | -------------------------------------- | -------- |
| `t`       | number | Timestamp in seconds to start playback | `?t=120` |
| `j`       | number | Jump to specific jingle index (legacy) | `?j=2`   |

**Example URLs:**

- `/show/0001?t=120` - Start playback at 120 seconds
- `/show/0001?j=2` - Jump to jingle #2 (legacy)

---

## Admin Routes

### Admin Nested Routes

**File:** `frontend/src/pages/AdminPage.tsx`

The `/admin/*` route uses nested routing with the following sub-routes:

| Route Pattern                  | Component            | Description                                |
| ------------------------------ | -------------------- | ------------------------------------------ |
| `/admin`                       | `AdminHome`          | Admin home with entity dropdowns (default) |
| `/admin/j/:id`                 | `AdminJingle`        | Edit/analyze Jingle (legacy)               |
| `/admin/f/:id`                 | `AdminFabrica`       | Edit/analyze Fabrica (legacy)              |
| `/admin/a/:id`                 | `AdminArtista`       | Edit/analyze Artista (legacy)              |
| `/admin/t/:id`                 | `AdminTematica`      | Edit/analyze Tematica (legacy)             |
| `/admin/c/:id`                 | `AdminCancion`       | Edit/analyze Cancion (legacy)              |
| `/admin/:entityType/:entityId` | `AdminEntityAnalyze` | Generic entity analysis (new format)       |

**Note:** Legacy routes (`/admin/j/:id`, etc.) are maintained for backward compatibility and must be defined before the catch-all route.

### Admin Home Navigation

**File:** `frontend/src/pages/admin/AdminHome.tsx`

The AdminHome page provides dropdowns for each entity type that navigate to:

- `/admin/{routePrefix}/{entityId}`

Where `routePrefix` is:

- `f` for fabrica
- `j` for jingle
- `c` for cancion
- `a` for artista
- `t` for tematica

### Admin Entity Analyze Navigation

**File:** `frontend/src/pages/admin/AdminEntityAnalyze.tsx`

**Navigation Links:**

- `Volver a Admin` → `/admin` (appears in multiple places: lines 259, 270, 284, 302)

### Admin Dashboard (Unused/Incomplete)

**File:** `frontend/src/pages/admin/AdminDashboard.tsx`

**Note:** This component appears to be defined but may not be actively used in the routing.

**Navigation Links:**

```tsx
<nav>
  <Link to="/admin/dashboard/fabricas">Fábricas</Link> |
  <Link to="/admin/dashboard/artistas">Artistas</Link> |
  <Link to="/admin/dashboard/canciones">Canciones</Link> |
  <Link to="/admin/dashboard/tematicas">Temáticas</Link> |
  <Link to="/admin/dashboard/jingles">Jingles</Link> |
  <Link to="/admin/dashboard/usuarios">Usuarios</Link>
</nav>
```

**Sub-routes:**

- `/admin/dashboard/fabricas`
- `/admin/dashboard/artistas`
- `/admin/dashboard/canciones`
- `/admin/dashboard/tematicas`
- `/admin/dashboard/jingles`
- `/admin/dashboard/usuarios`
- `/admin/dashboard/:type/edit/:id`

---

## Navigation Patterns

### Common Navigation Patterns

1. **Header Navigation (Global)**

   - Present on all pages via `App.tsx`
   - Contains: `Inicio` | `Admin`

2. **Page-Level Navigation Bars**

   - Present on: Home, Inspect pages
   - Contains: `Inicio` | `Fabrica` | `Jingle` | `Cancion` | `Admin`
   - **Note:** Uses hardcoded sample IDs for Jingle and Cancion links

3. **Back-to-Home Links**

   - Present on: FabricaPage, InspectEntityPage, InspectRelatedEntitiesPage
   - Format: `← Volver al inicio` or `Volver al inicio`
   - Route: `/`

4. **Dynamic Entity Links**
   - Generated by `EntityCard` component
   - Pattern: Based on entity type (`/show/:id`, `/j/:id`, `/c/:id`, `/a/:id`, `/t/:id`)

### Navigation Inconsistencies

1. **Hardcoded Sample IDs**

   - Home page and Inspect pages use hardcoded sample IDs (`sample-jingle`, `sample-cancion`)
   - Should ideally use dynamic links or actual entity IDs

2. **Missing Navigation on FabricaPage**

   - FabricaPage only has a back-to-home link
   - Does not include the standard nav bar with multiple links

3. **Inconsistent Link Text**

   - Some pages use `← Volver al inicio`
   - Others use `Volver al inicio`
   - Some use `Inicio` in nav bars

4. **Admin Dashboard Routes**
   - AdminDashboard component exists but routes may not be fully integrated
   - Routes like `/admin/dashboard/*` may not be accessible

---

## Summary

### Total Routes: 15+ main routes

**Public Routes:** 8

- `/` (Home)
- `/show` (Fabrica - latest)
- `/show/:fabricaId` (Fabrica - specific)
- `/j/:jingleId` (Inspect Jingle)
- `/c/:cancionId` (Inspect Cancion)
- `/f/:fabricaId` (Inspect Fabrica)
- `/a/:artistaId` (Inspect Artista)
- `/t/:tematicaId` (Inspect Tematica)

**Admin Routes:** 7+ nested routes

- `/admin` (Admin home)
- `/admin/j/:id` (Legacy)
- `/admin/f/:id` (Legacy)
- `/admin/a/:id` (Legacy)
- `/admin/t/:id` (Legacy)
- `/admin/c/:id` (Legacy)
- `/admin/:entityType/:entityId` (New format)

**Demo Routes:** 2

- `/inspect/:entityType/:entityId`
- `/inspect-related/:entityType/:entityId`

### Navigation Link Locations

1. **Header (Global):** `App.tsx` - 2 links
2. **Home Page:** `Home.tsx` - 5 links
3. **Fabrica Page:** `FabricaPage.tsx` - 1 link (back to home)
4. **Inspect Pages:** 5 pages × 5 links each = 25 links (with duplicates)
5. **Admin Pages:** Various admin components - multiple links
6. **Dynamic Links:** `EntityCard.tsx` - generates links based on entity type

---

## Recommendations for UX Improvements

1. **Standardize Navigation Bars**

   - Consider creating a shared `NavigationBar` component
   - Ensure consistent link text and styling across all pages

2. **Replace Hardcoded Links**

   - Replace hardcoded sample IDs with dynamic links or actual entity IDs
   - Consider using a "Latest" or "Featured" entity system

3. **Add Navigation to FabricaPage**

   - Consider adding the standard nav bar to FabricaPage for consistency
   - Or create a context-aware navigation that shows relevant links

4. **Consolidate Admin Routes**

   - Consider deprecating legacy admin routes in favor of the new format
   - Document the migration path for any external links

5. **Improve Breadcrumbs**
   - Consider adding breadcrumb navigation for deeper navigation paths
   - Especially useful for admin and entity inspection flows

---

_Last Updated: Based on codebase analysis of routes and navigation components_
