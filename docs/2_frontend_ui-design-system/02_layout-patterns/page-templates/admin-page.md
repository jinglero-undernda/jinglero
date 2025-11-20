# Page Template: Admin Page

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `frontend/src/pages/AdminPage.tsx`, `frontend/src/pages/admin/*.tsx`

## Overview

Admin pages provide the administrative interface for managing entities and relationships. All admin routes require authentication.

## Routes

All routes are nested under `/admin/*`:
- `/admin/login` - AdminLogin (no auth required)
- `/admin/dashboard` - AdminDashboard
- `/admin/search` - AdminHome (entity selection)
- `/admin/:entityType/:entityId` - AdminEntityAnalyze
- `/admin/:entityType` - AdminEntityList
- `/admin/design-system/*` - DesignSystemShowcase
- `/admin/*` (catch-all) - AdminDashboard

## Layout Structure

*To be documented as layout is analyzed*

## Component Composition

- Admin navigation elements
- Entity management components (EntityEdit, EntityForm, EntityList)
- Relationship management (RelationshipForm, RelatedEntities)
- Data validation components

## Authentication

All admin routes except `/admin/login` are wrapped in `ProtectedRoute` which requires authentication.

## Responsive Behavior

*To be documented*

## Implementation

- **Styles**: `frontend/src/styles/admin.css`
- **Components Used**: Various admin components from `frontend/src/components/admin/`

## Related Documentation

- Routes: `../routes.md`
- Admin context variations: `../../04_context-variations/admin-context.md`

