# Task 6: Rebuild Admin Portal with Knowledge Graph Validation Tools

## Status: In Progress

## Overview

Rebuild the Admin Portal with knowledge graph validation tools, CSV import functionality, and password protection.

## Task List

### Phase 0: Admin Pages Analysis & Redesign

- [x] **Task 6.0.1: Deep Dive Analysis and Redesign of Admin Pages and Components**
  - [x] Inventory current admin pages
  - [x] Inventory current admin components
  - [x] Compare with new entity inspection architecture
  - [x] Identify gaps and issues
  - [x] Create redesign plan
  - [x] Create migration strategy
  - [x] Deliverables:
    - [x] Analysis Document (`docs/admin-redesign-analysis.md`)
    - [x] Redesign Specification (`docs/admin-redesign-spec.md`)
    - [x] Implementation Checklist (included in redesign spec)

### Phase 1: Authentication & Access Control

- [x] **Task 6.1: Create Authentication Middleware**
- [x] **Task 6.2: Add Admin Login Endpoint**
- [x] **Task 6.3: Create Admin Login Page**
- [x] **Task 6.4: Update AdminPage to Require Authentication**

### Phase 2: Knowledge Graph Validation Backend

- [x] **Task 6.5: Create Validation Utilities**
- [x] **Task 6.6: Add Validation API Endpoints**

### Phase 3: Knowledge Graph Validation Frontend

- [x] **Task 6.7: Create KnowledgeGraphValidator Component**
- [x] **Task 6.8: Create RelationshipValidator Component**
- [x] **Task 6.9: Create DataIntegrityChecker Component**

### Phase 4: CSV Import Functionality

- [ ] **Task 6.10: Create CSV Importer Utilities**
- [ ] **Task 6.10.1: Create Sample CSV Template Files**
- [ ] **Task 6.11: Add CSV Import API Endpoint**
- [ ] **Task 6.12: Create CSV Importer Frontend Interface**

### Phase 5: Admin Dashboard Rebuild

- [x] **Task 6.13: Rebuild AdminDashboard**

### Phase 6: Enhanced CRUD Forms & Bulk Actions

- [x] **Task 6.14: Update Admin CRUD Forms with Validation Feedback**
- [x] **Task 6.15: Add Bulk Actions**

### Phase 7: Testing & Integration

- [ ] **Task 6.16: Test Admin Workflows**

## Relevant Files

### Task 6.0.1 Deliverables

- `docs/admin-redesign-analysis.md` - Comprehensive analysis of current admin portal state
- `docs/admin-redesign-spec.md` - Detailed redesign specification with implementation plan
- `docs/admin-portal-specification.md` - Functional requirements (already existed, referenced in analysis)

### Phase 1 Deliverables

- `backend/src/server/middleware/auth.ts` - Authentication middleware with JWT support
- `backend/src/server/api/admin.ts` - Updated with login/logout/status endpoints, protected routes
- `frontend/src/lib/api/client.ts` - Updated AdminApiClient with authentication methods and token management
- `frontend/src/pages/admin/AdminLogin.tsx` - Admin login page component
- `frontend/src/hooks/useAdminAuth.ts` - React hook for checking authentication status
- `frontend/src/pages/AdminPage.tsx` - Updated with route protection and login route

### Phase 2 Deliverables

- `backend/src/server/utils/validation.ts` - Validation utilities for duplicate relationships, invalid targets, and redundant field mismatches
- `backend/src/server/api/admin.ts` - Updated with validation endpoints:
  - `POST /api/admin/validate/entity/:type/:id` - Validate a specific entity
  - `GET /api/admin/validate/entity/:type/:id` - Get validation results for a specific entity
  - `POST /api/admin/validate/entity/:type` - Validate all entities of a type
  - `POST /api/admin/validate/relationship/:relType` - Validate a specific relationship
  - `POST /api/admin/validate/fix` - Fix a validation issue

### Phase 3 Deliverables

- `frontend/src/lib/api/client.ts` - Updated AdminApiClient with validation methods:
  - `validateEntity(type, id)` - Validate a specific entity
  - `validateAllEntities(type)` - Validate all entities of a type
  - `validateRelationship(relType, start, end)` - Validate a specific relationship
  - `fixValidationIssue(issue)` - Fix a validation issue
- `frontend/src/components/admin/KnowledgeGraphValidator.tsx` - Component for validating individual entities with fix actions
- `frontend/src/components/admin/RelationshipValidator.tsx` - Component for validating individual relationships
- `frontend/src/components/admin/DataIntegrityChecker.tsx` - Component for bulk validation of all entities of a type with summary statistics

### Phase 5 Deliverables

- `frontend/src/pages/admin/AdminDashboard.tsx` - Rebuilt admin dashboard with:
  - Entity counts section for all entity types
  - Quick actions (create entity, validation tools, import CSV placeholder)
  - Integrated DataIntegrityChecker component
  - Navigation links to all entity types
- `frontend/src/pages/AdminPage.tsx` - Updated routing:
  - Added `/admin/dashboard` route
  - Added `/admin/search` route for AdminHome
  - Made AdminDashboard the default route for `/admin`

### Phase 6 Deliverables

- `frontend/src/components/admin/EntityForm.tsx` - Enhanced with:
  - Real-time field validation with error messages
  - Field-level error display with visual indicators
  - Post-save validation integration
  - KnowledgeGraphValidator integration for edit mode
  - Validation status summary with expandable details
- `frontend/src/components/admin/BulkActions.tsx` - New component for bulk operations:
  - Bulk delete with confirmation dialog
  - Bulk relationship creation
  - Bulk property updates
  - Success/error feedback
- `frontend/src/components/admin/EntityList.tsx` - Enhanced with:
  - Checkbox selection for each entity
  - "Select all" checkbox with indeterminate state
  - Integration with BulkActions component
  - Automatic list refresh after bulk operations

_This section will be updated as files are created or modified._

## Notes

- Task 6.0.1 is the **CRITICAL FIRST STEP** and must be completed before major refactoring
- The admin-portal-specification.md already exists and will be refined iteratively
- All admin pages and components were created before the entity inspection pages refactor
