# Task 6.0: Rebuild Admin Portal with Knowledge Graph Validation Tools - Detailed Implementation Plan

## Overview

This document provides a comprehensive implementation plan for rebuilding the Admin Portal with knowledge graph validation tools, CSV import functionality, and password protection. The plan is organized into logical phases with clear dependencies, technical specifications, and implementation details.

## Current State Analysis

### Existing Components (To Leverage)

1. **Admin Pages:**

   - `AdminPage.tsx` - Main admin router
   - `AdminHome.tsx` - Entity selection dropdowns
   - `AdminEntityAnalyze.tsx` - Entity analysis with RelatedEntities in Admin Mode (partially modernized)
   - `AdminJingle.tsx`, `AdminFabrica.tsx`, `AdminArtista.tsx`, `AdminCancion.tsx`, `AdminTematica.tsx` - **Legacy entity-specific pages (created before refactor, likely need major rework)**
   - `AdminDashboard.tsx` - Unused/incomplete dashboard

   **Note:** These pages were created before the entity inspection pages refactor (`InspectJingle.tsx`, `InspectCancion.tsx`, etc.). The new inspection pages use a consistent pattern with `EntityCard`, `RelatedEntities`, and shared utilities that should be leveraged in admin pages. See Task 6.0.1 for analysis and redesign plan.

2. **Admin Components:**

   - `EntityForm.tsx` - Generic entity creation/editing form (may need enhancement to leverage RelatedEntities)
   - `EntityList.tsx` - Entity listing component (may need enhancement to use EntityCard)
   - `EntityEdit.tsx` - Entity editing wrapper
   - `RelationshipForm.tsx` - Relationship creation form (may need integration with RelatedEntities Admin Mode)
   - `FabricaList.tsx`, `FabricaForm.tsx` - Fabrica-specific components

   **Note:** These components may need significant rework to align with the new architecture and leverage `RelatedEntities` component. See Task 6.0.1 for analysis and redesign plan.

3. **Shared Components:**

   - `RelatedEntities.tsx` - **Already supports `isAdmin={true}` prop** with:
     - Eager loading of all relationships
     - No cycle prevention
     - Immediate visibility of all relationships
     - Blank rows for relationship creation (to be enhanced)

4. **Backend API:**

   - `backend/src/server/api/admin.ts` - Complete CRUD endpoints for all entities
   - Relationship management endpoints (create/delete)
   - Schema management endpoints

5. **CSV Import Files:**
   - Located in `backend/src/server/db/import/`
   - Node CSV files: `node-Artista-*.csv`, `node-Cancion-*.csv`, etc.
   - Relationship CSV files: `rel-Artista-AUTOR_DE-Cancion-*.csv`, etc.

### Missing Components (To Create)

1. **Authentication:**

   - Backend middleware for password protection
   - Login endpoint
   - Frontend login page
   - Session management

2. **Validation Tools:**

   - Backend validation utilities (`backend/src/server/db/schema/validation.ts`)
   - Validation API endpoints
   - Frontend validation components:
     - `KnowledgeGraphValidator.tsx`
     - `RelationshipValidator.tsx`
     - `DataIntegrityChecker.tsx`

3. **CSV Import:**

   - Backend CSV parser/importer (`backend/src/server/db/import/csvImporter.ts`)
   - CSV import API endpoint
   - Frontend CSV import interface (`CSVImporter.tsx`)

4. **Admin Dashboard:**
   - Rebuilt dashboard with entity counts, validation status, quick actions

## Implementation Plan

### Phase 0: Admin Pages Analysis & Redesign (Task 6.0.1)

**Goal:** Analyze existing admin pages and components, identify gaps, and create a redesign plan that aligns with the refactored entity inspection architecture.

#### Task 6.0.1: Deep Dive Analysis and Redesign of Admin Pages and Components

**Purpose:** The admin pages (`AdminPage`, `AdminHome`, `AdminEntityAnalyze`, `AdminJingle`, `AdminFabrica`, `AdminArtista`, `AdminCancion`, `AdminTematica`, `AdminDashboard`) and admin components (`EntityForm`, `EntityList`, `EntityEdit`, `RelationshipForm`, etc.) were created before the major refactor of entity inspection pages. This task will analyze the current state, compare with the new architecture, and create a comprehensive redesign plan.

**Analysis Tasks:**

1. **Inventory Current Admin Pages:**

   - Review `AdminPage.tsx` - routing structure, navigation patterns
   - Review `AdminHome.tsx` - entity selection UI, navigation flow
   - Review `AdminEntityAnalyze.tsx` - current implementation, what works, what doesn't
   - Review legacy entity-specific pages (`AdminJingle.tsx`, `AdminFabrica.tsx`, etc.) - identify redundancy, inconsistencies
   - Review `AdminDashboard.tsx` - current state, unused features
   - Document current routing structure and navigation patterns
   - Identify duplicate functionality across pages

2. **Inventory Current Admin Components:**

   - Review `EntityForm.tsx` - form structure, validation, field handling
   - Review `EntityList.tsx` - listing patterns, filtering, sorting
   - Review `EntityEdit.tsx` - edit workflow, integration with forms
   - Review `RelationshipForm.tsx` - relationship creation UI, validation
   - Review `FabricaList.tsx`, `FabricaForm.tsx` - entity-specific components
   - Document component APIs, props, and usage patterns
   - Identify components that could be consolidated or generalized

3. **Compare with New Entity Inspection Architecture:**

   - Review `InspectJingle.tsx`, `InspectCancion.tsx`, `InspectArtista.tsx`, `InspectTematica.tsx`, `InspectFabrica.tsx`
   - Review `RelatedEntities.tsx` - understand Admin Mode capabilities (`isAdmin={true}`)
   - Review `EntityCard.tsx` - reusable entity display patterns
   - Identify patterns, components, and utilities that should be shared
   - Document differences in data fetching, state management, error handling

4. **Identify Gaps and Issues:**

   - **Architecture gaps:**
     - Missing integration with `RelatedEntities` component in Admin Mode
     - Inconsistent data fetching patterns (admin vs public pages)
     - Missing shared utilities (entity type normalization, relationship configs)
     - Inconsistent error handling and loading states
   - **UI/UX gaps:**
     - Inconsistent navigation patterns
     - Missing breadcrumbs or navigation context
     - Inconsistent form validation feedback
     - Missing inline editing capabilities
     - No relationship management UI integrated with entity views
   - **Functionality gaps:**
     - Legacy pages may not support all entity properties from refined schema
     - Missing integration with validation tools
     - No bulk operations UI
     - Limited relationship visualization

5. **Create Redesign Plan:**

   **A. Unified Admin Entity Page Architecture:**

   - Design a single `AdminEntityPage.tsx` that replaces entity-specific pages
   - Leverage `AdminEntityAnalyze.tsx` as the base, but enhance it
   - Use `RelatedEntities` with `isAdmin={true}` for relationship management
   - Integrate `EntityCard` for consistent entity display
   - Support inline editing of entity properties
   - Support relationship creation/deletion inline

   **B. Component Redesign:**

   - **EntityForm enhancement:**
     - Integrate with validation API (`POST /api/admin/validate/entity/:type/:id`)
     - Add real-time validation feedback
     - Support all entity types with dynamic field generation
     - Integrate with relationship creation
   - **EntityList enhancement:**
     - Add bulk selection and operations
     - Integrate with `EntityCard` for consistent display
     - Add filtering and sorting (leverage existing patterns)
     - Add quick actions (edit, delete, view relationships)
   - **RelationshipForm enhancement:**
     - Integrate into `RelatedEntities` Admin Mode (blank rows)
     - Support inline relationship creation
     - Add relationship property editing
     - Support bulk relationship operations

   **C. Navigation and Routing Redesign:**

   - Consolidate routes: `/admin/:entityType/:entityId` (already exists via `AdminEntityAnalyze`)
   - Update `AdminHome` to use modern entity selection patterns
   - Add breadcrumb navigation component
   - Create consistent admin navigation header
   - Support deep linking to specific entity admin views

   **D. Dashboard Redesign:**

   - Integrate entity counts (use existing API patterns)
   - Add validation status widget (integrate with validation tools)
   - Add quick actions (create entity, import CSV, run validation)
   - Add recent activity feed
   - Use `EntityCard` for entity previews

6. **Migration Strategy:**
   - Identify which legacy pages can be deprecated immediately
   - Identify which components can be refactored vs replaced
   - Create migration checklist for each page/component
   - Plan for backward compatibility during transition (if needed)
   - Document breaking changes

**Deliverables:**

1. **Analysis Document** (`docs/admin-redesign-analysis.md`):

   - Current state inventory
   - Gap analysis
   - Comparison with new architecture
   - Component dependency graph

2. **Admin Portal Specification** (`docs/admin-portal-specification.md`):

   - **Already started** - Iterative design document for admin portal functionality
   - RelatedEntities Admin Mode requirements and workflows
   - Entity metadata editing specifications
   - Relationship management specifications
   - New entity creation workflows
   - Questions for iterative refinement
   - **This document will be refined iteratively based on feedback**

3. **Redesign Specification** (`docs/admin-redesign-spec.md`):

   - New architecture diagrams
   - Component redesign specifications
   - API integration points
   - UI/UX mockups or wireframes (text descriptions acceptable)
   - Migration plan
   - **Will reference and build upon admin-portal-specification.md**

4. **Implementation Checklist:**
   - Prioritized list of refactoring tasks
   - Dependencies between tasks
   - Estimated effort for each task
   - Risk assessment

**Key Questions to Answer:**

- Can we consolidate all entity-specific admin pages into a single `AdminEntityPage`?
- How should `RelatedEntities` Admin Mode be enhanced to support relationship creation/deletion?
- What shared utilities from entity inspection pages should be extracted?
- How should form validation integrate with the validation API?
- What's the best pattern for inline editing in admin mode?
- How should bulk operations be integrated into the UI?
- Should we maintain backward compatibility with legacy routes?

**Dependencies:**

- Review of `RelatedEntities.tsx` Admin Mode capabilities
- Review of entity inspection pages (`Inspect*.tsx`)
- Review of shared components (`EntityCard`, relationship configs, etc.)
- Understanding of refined database schema (from Task 5.0)

**Output:**
This analysis will inform all subsequent tasks in the admin portal rebuild, ensuring consistency with the new architecture and maximizing code reuse.

---

### Phase 1: Authentication & Access Control (Tasks 6.1-6.4)

**Goal:** Secure admin routes with password protection

#### Task 6.1: Create Authentication Middleware

**File:** `backend/src/server/middleware/auth.ts`

**Implementation:**

- Create middleware function `requireAdminAuth(req, res, next)`
- Check for session token or password in request headers/cookies
- Compare against `ADMIN_PASSWORD` environment variable
- Return 401 Unauthorized if authentication fails
- Store authentication state in session (using `express-session` or JWT)

**Environment Variable:**

- `ADMIN_PASSWORD` - Required, should be set in `backend/.env` (NOT frontend/.env)

**Dependencies:**

- Install `express-session` or `jsonwebtoken` if not already present
- Session store configuration

**Testing:**

- Test middleware with valid/invalid passwords
- Test session persistence
- Test logout functionality

#### Task 6.2: Add Admin Login Endpoint

**File:** `backend/src/server/api/admin.ts` (add new routes)

**Endpoints:**

- `POST /api/admin/login` - Accepts `{ password: string }`, returns session token or sets session cookie
- `POST /api/admin/logout` - Clears session
- `GET /api/admin/status` - Returns current authentication status

**Implementation:**

- Validate password against `ADMIN_PASSWORD` env var
- Create session/token on successful login
- Return error on failed login (don't reveal if password is wrong vs user doesn't exist)
- Set secure session cookie (httpOnly, secure in production)

**Security Considerations:**

- Rate limiting on login endpoint (prevent brute force)
- Secure cookie settings
- Password hashing (if storing in DB later, not needed for MVP with env var)

#### Task 6.3: Create Admin Login Page

**File:** `frontend/src/pages/admin/AdminLogin.tsx`

**Features:**

- Simple password input form
- Submit button
- Error message display
- Redirect to `/admin` on successful login
- Store authentication token in localStorage or sessionStorage
- Loading state during authentication

**UI Requirements:**

- Barebone design (functionality over aesthetics per PRD)
- Spanish labels ("Contraseña", "Iniciar Sesión")
- Error handling for invalid password
- Link back to home page

**API Integration:**

- Call `POST /api/admin/login` with password
- Store token/session info
- Redirect to admin dashboard on success

#### Task 6.4: Update AdminPage to Require Authentication

**File:** `frontend/src/pages/AdminPage.tsx`

**Implementation:**

- Add authentication check on mount
- Redirect to `/admin/login` if not authenticated
- Check authentication status on route changes
- Show loading state while checking authentication

**Route Protection:**

- Wrap all admin routes with authentication check
- Create `ProtectedAdminRoute` component or use authentication hook
- Persist authentication across page refreshes

**Dependencies:**

- Admin API client method for checking auth status
- React Router navigation

---

### Phase 2: Knowledge Graph Validation Backend (Tasks 6.5-6.6)

**Goal:** Create backend validation utilities and API endpoints

#### Task 6.5: Create Validation Utilities

**File:** `backend/src/server/db/schema/validation.ts`

**Validation Functions:**

1. **`findOrphanedNodes()`** - Find entities without required relationships

   - Jingles without `APPEARS_IN` → Fabrica
   - Jingles without `VERSIONA` → Cancion
   - Canciones without `AUTOR_DE` → Artista
   - Return array of `{ entityType, entityId, missingRelationship, entityData }`

2. **`findMissingRelationships()`** - Find entities that should have relationships but don't

   - Check for entities with properties that suggest relationships (e.g., `fabricaId` but no `APPEARS_IN`)
   - Return array of `{ entityType, entityId, expectedRelationship, reason }`

3. **`checkDataIntegrity()`** - Verify data consistency

   - Check redundant properties match relationships (e.g., `Jingle.fabricaId` matches `APPEARS_IN` relationship)
   - Check for duplicate relationships
   - Check for invalid relationship targets (e.g., relationship to non-existent entity)
   - Return array of `{ type: 'mismatch' | 'duplicate' | 'invalid', entityType, entityId, issue, details }`

4. **`validateEntity(entityType, entityId)`** - Validate single entity
   - Check all required properties
   - Check all required relationships
   - Return validation result object

**Implementation Notes:**

- Use Neo4j Cypher queries for efficient validation
- Return structured error objects with entity info
- Support batch validation for performance
- Cache validation results (optional, for performance)

**Example Cypher Queries:**

```cypher
// Find Jingles without APPEARS_IN relationship
MATCH (j:Jingle)
WHERE NOT EXISTS((j)-[:APPEARS_IN]->())
RETURN j.id, j.title, 'Missing APPEARS_IN relationship' as issue

// Find redundant property mismatches
MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
WHERE j.fabricaId <> f.id
RETURN j.id, j.fabricaId, f.id, 'fabricaId mismatch' as issue
```

#### Task 6.6: Add Validation API Endpoints

**File:** `backend/src/server/api/admin.ts` (add new routes)

**Endpoints:**

- `GET /api/admin/validate/orphans` - Returns orphaned nodes
- `GET /api/admin/validate/relationships` - Returns missing relationships
- `GET /api/admin/validate/integrity` - Returns data integrity issues
- `GET /api/admin/validate/all` - Returns all validation issues grouped by type
- `POST /api/admin/validate/entity/:type/:id` - Validate specific entity

**Implementation:**

- All endpoints require admin authentication (use middleware from 6.1)
- Return JSON with structured validation results
- Support query parameters for filtering (e.g., `?entityType=jingle`)
- Include entity counts in response
- Support pagination for large result sets (optional)

**Response Format:**

```typescript
{
  issues: Array<{
    type: "orphan" | "missing_relationship" | "integrity";
    severity: "error" | "warning";
    entityType: string;
    entityId: string;
    message: string;
    details?: Record<string, any>;
  }>;
  summary: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  }
}
```

---

### Phase 3: Knowledge Graph Validation Frontend (Tasks 6.7-6.9)

**Goal:** Create frontend components to display and interact with validation results

#### Task 6.7: Create KnowledgeGraphValidator Component

**File:** `frontend/src/components/admin/KnowledgeGraphValidator.tsx`

**Features:**

- Display all validation issues in a table/list
- Group issues by type (orphans, missing relationships, integrity)
- Filter by entity type, severity
- Show entity details (ID, title, etc.)
- Link to entity admin page for fixing issues
- Refresh button to re-run validation
- Loading states
- Empty state when no issues found

**UI Structure:**

- Tabs or sections for each validation type
- Table with columns: Type, Entity, Issue, Severity, Actions
- "View Entity" button linking to `/admin/{type}/{id}`
- "Fix" button (future: auto-fix simple issues)

**Props:**

```typescript
interface KnowledgeGraphValidatorProps {
  onEntityClick?: (entityType: string, entityId: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}
```

**API Integration:**

- Call `GET /api/admin/validate/all` on mount
- Support manual refresh
- Handle loading and error states

#### Task 6.8: Create RelationshipValidator Component

**File:** `frontend/src/components/admin/RelationshipValidator.tsx`

**Features:**

- Display missing relationships
- Show suggested relationships based on entity properties
- Form to create missing relationships
- Bulk relationship creation
- Validate relationship before creation (check if target exists)

**UI Structure:**

- List of entities with missing relationships
- For each entity, show:
  - Entity card/info
  - Missing relationship type
  - Suggested target entity (if can be inferred)
  - Form to select/create relationship
- "Create Relationship" button
- Bulk selection and creation

**Props:**

```typescript
interface RelationshipValidatorProps {
  onRelationshipCreated?: () => void;
}
```

**API Integration:**

- Call `GET /api/admin/validate/relationships`
- Use existing `POST /api/admin/relationships/:relType` endpoint for creation
- Validate entity existence before creating relationship

#### Task 6.9: Create DataIntegrityChecker Component

**File:** `frontend/src/components/admin/DataIntegrityChecker.tsx`

**Features:**

- Display data integrity issues (mismatches, duplicates, invalid references)
- Show details of each issue
- Option to fix issues (update redundant properties, delete duplicates)
- Confirmation dialogs for destructive actions
- Batch fix operations

**UI Structure:**

- Grouped by issue type (mismatch, duplicate, invalid)
- For each issue:
  - Entity info
  - Issue description
  - Current value vs expected value
  - "Fix" button with confirmation
- Bulk fix option for same-type issues

**Props:**

```typescript
interface DataIntegrityCheckerProps {
  onIssueFixed?: () => void;
  autoFix?: boolean; // For non-destructive fixes
}
```

**API Integration:**

- Call `GET /api/admin/validate/integrity`
- Create fix endpoints in admin API (or use existing update endpoints)
- Handle fix operations with proper error handling

---

### Phase 4: CSV Import Functionality (Tasks 6.10-6.12)

**Goal:** Enable bulk import of entities and relationships from CSV files

#### Task 6.10: Create CSV Importer Utilities

**File:** `backend/src/server/db/import/csvImporter.ts`

**Functions:**

1. **`parseCSVFile(filePath: string)`** - Parse CSV file

   - Use `csv-parse` or similar library
   - Handle different encodings
   - Return array of row objects

2. **`validateCSVFormat(rows: any[], expectedColumns: string[])`** - Validate CSV structure

   - Check required columns
   - Validate data types
   - Return validation errors

3. **`importNodes(csvPath: string, nodeType: string)`** - Import nodes from CSV

   - Parse CSV
   - Validate format
   - Create nodes in Neo4j
   - Handle duplicates (skip or update based on config)
   - Return import result: `{ created: number, updated: number, errors: Array }`

4. **`importRelationships(csvPath: string, relType: string)`** - Import relationships from CSV

   - Parse CSV (expects columns: `:START_ID`, `:END_ID`, plus relationship properties)
   - Validate that start/end nodes exist
   - Create relationships
   - Handle duplicates
   - Return import result

5. **`importFromDirectory(directory: string)`** - Import all CSVs from directory
   - Scan directory for CSV files
   - Identify node vs relationship files by naming pattern
   - Import in correct order (nodes first, then relationships)
   - Return comprehensive import report

**CSV Format Support:**

- Neo4j import format: `node-{Label}-*.csv`, `rel-{StartLabel}-{RelType}-{EndLabel}-*.csv`
- Columns: `:ID`, `:LABEL`, `:START_ID`, `:END_ID`, plus property columns
- Handle date/datetime conversion
- Handle array properties (comma-separated or JSON)

**Error Handling:**

- Validate all rows before importing any
- Collect all errors and return in result
- Support dry-run mode (validate without importing)
- Transaction support (rollback on error if configured)

#### Task 6.10.1: Create Sample CSV Template Files

**Files:** Create template CSV files in `backend/src/server/db/import/templates/`

**Purpose:** Provide sample CSV files that demonstrate the correct format for importing entities and relationships. These can be used as:

- Templates for creating new CSV imports
- Seed data for testing the import functionality
- Documentation of the expected CSV format

**Template Files to Create:**

1. **Node Templates:**

   - `template-node-Fabrica.csv` - Sample Fabrica nodes
   - `template-node-Jingle.csv` - Sample Jingle nodes
   - `template-node-Cancion.csv` - Sample Cancion nodes
   - `template-node-Artista.csv` - Sample Artista nodes
   - `template-node-Tematica.csv` - Sample Tematica nodes
   - `template-node-Usuario.csv` - Sample Usuario nodes (optional)

2. **Relationship Templates:**
   - `template-rel-Jingle-APPEARS_IN-Fabrica.csv` - Jingle appears in Fabrica relationships
   - `template-rel-Jingle-VERSIONA-Cancion.csv` - Jingle versions Cancion relationships
   - `template-rel-Artista-AUTOR_DE-Cancion.csv` - Artista authored Cancion relationships
   - `template-rel-Artista-JINGLERO_DE-Jingle.csv` - Artista is Jinglero of Jingle relationships
   - `template-rel-Jingle-TAGGED_WITH-Tematica.csv` - Jingle tagged with Tematica relationships
   - `template-rel-Usuario-REACCIONA_A-Jingle.csv` - Usuario reacts to Jingle relationships (optional)
   - `template-rel-Usuario-SOY_YO-Artista.csv` - Usuario is Artista relationships (optional)

**CSV Format Requirements:**

**Node CSV Format:**

- First row: Headers with `:ID`, `:LABEL`, and all property columns
- Property columns should match entity schema (e.g., `title`, `youtubeUrl`, `date` for Fabrica)
- Include 2-3 sample rows with realistic example data
- Use proper date/datetime format (ISO 8601 or Neo4j datetime format)
- Include comments in first few rows (using `#` prefix) explaining the format

**Relationship CSV Format:**

- First row: Headers with `:START_ID`, `:END_ID`, `:TYPE`, and relationship property columns
- Include 2-3 sample rows showing relationships between sample nodes
- Use IDs that match the sample nodes in node templates
- Include comments explaining the relationship structure

**Example Node Template Structure:**

```csv
# Template for importing Fabrica nodes
# Format: :ID, :LABEL, title, youtubeUrl, date, createdAt, updatedAt
# All dates should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
:ID,:LABEL,title,youtubeUrl,date,createdAt,updatedAt
FAB001,Fabrica,La Fábrica de Jingles - Episodio 1,https://www.youtube.com/watch?v=example1,2024-01-15T20:00:00,2024-01-15T20:00:00,2024-01-15T20:00:00
FAB002,Fabrica,La Fábrica de Jingles - Episodio 2,https://www.youtube.com/watch?v=example2,2024-01-22T20:00:00,2024-01-22T20:00:00,2024-01-22T20:00:00
```

**Example Relationship Template Structure:**

```csv
# Template for importing Jingle APPEARS_IN Fabrica relationships
# Format: :START_ID, :END_ID, :TYPE, timestamp (optional relationship property)
# START_ID must be a Jingle ID, END_ID must be a Fabrica ID
:START_ID,:END_ID,:TYPE,timestamp
JING001,FAB001,APPEARS_IN,00:05:30
JING002,FAB001,APPEARS_IN,00:12:45
JING001,FAB002,APPEARS_IN,00:03:15
```

**Implementation Notes:**

- Create a `templates/` subdirectory in `backend/src/server/db/import/`
- Use consistent ID prefixes (FAB, JING, CAN, ART, TEM, USR) for easy identification
- Ensure sample data is realistic but clearly marked as example data
- Include a `README.md` in the templates directory explaining:
  - How to use the templates
  - Required vs optional columns
  - Date/datetime format requirements
  - ID format requirements
  - Common pitfalls and how to avoid them

**Integration with Import System:**

- The `GET /api/admin/import/template/:entityType` endpoint (Task 6.11) should serve these template files
- Templates can be downloaded directly from the admin interface
- Templates serve as both documentation and starting point for new imports

#### Task 6.11: Add CSV Import API Endpoint

**File:** `backend/src/server/api/admin.ts` (add new routes)

**Endpoints:**

- `POST /api/admin/import/csv` - Upload and import CSV file

  - Accept multipart/form-data with file
  - Parameters: `entityType` (optional, auto-detect from filename), `dryRun` (boolean)
  - Return import result

- `POST /api/admin/import/csv/directory` - Import all CSVs from server directory

  - Parameters: `directory` (path), `dryRun` (boolean)
  - Return comprehensive import report

- `GET /api/admin/import/template/:entityType` - Download CSV template
  - Return CSV template with headers for given entity type

**Implementation:**

- Use `multer` or similar for file upload
- Validate file type (must be CSV)
- Limit file size
- Support both single file and directory import
- Return detailed import results with errors

**Response Format:**

```typescript
{
  success: boolean;
  imported: {
    nodes: number;
    relationships: number;
  }
  errors: Array<{
    row: number;
    entity: string;
    message: string;
  }>;
  warnings: Array<string>;
  dryRun: boolean;
}
```

#### Task 6.12: Create CSV Importer Frontend Interface

**File:** `frontend/src/components/admin/CSVImporter.tsx`

**Features:**

- File upload input (drag & drop optional)
- Entity type selector (or auto-detect from filename)
- Dry-run checkbox
- Import button
- Progress indicator during import
- Results display:
  - Success count
  - Error list with row numbers
  - Warnings
- Download template button
- Import history (optional, store in localStorage)

**UI Structure:**

- File upload area
- Options section (entity type, dry-run)
- Import button
- Results section (collapsible)
- Error table with row numbers and messages
- Link to download templates

**Props:**

```typescript
interface CSVImporterProps {
  onImportComplete?: (result: ImportResult) => void;
  entityType?: string; // Pre-select entity type
}
```

**API Integration:**

- Call `POST /api/admin/import/csv` with FormData
- Handle file upload progress (if supported)
- Display results in user-friendly format
- Call `GET /api/admin/import/template/:entityType` for template download

**Error Handling:**

- Display upload errors
- Display validation errors from CSV
- Display import errors with row numbers
- Allow retry after fixing errors

---

### Phase 5: Admin Dashboard Rebuild (Task 6.13)

**Goal:** Create comprehensive admin dashboard with entity counts, validation status, and quick actions

#### Task 6.13: Rebuild AdminDashboard

**File:** `frontend/src/pages/admin/AdminDashboard.tsx`

**Features:**

1. **Entity Counts Section:**

   - Display count for each entity type (Fabricas, Jingles, Canciones, Artistas, Tematicas)
   - Link to entity list/admin page
   - Last updated timestamp

2. **Validation Status Section:**

   - Overall validation status (pass/warning/error)
   - Count of issues by type
   - Quick link to validation tools
   - "Run Validation" button

3. **Quick Actions:**

   - "Create New Entity" dropdown (select type)
   - "Import CSV" button
   - "View All Issues" link
   - "Export Data" (future)

4. **Recent Activity (Optional):**
   - Recently created/updated entities
   - Recent imports
   - Recent validation runs

**UI Layout:**

- Header with page title
- Grid layout with cards for each section
- Barebone design (functionality over aesthetics)
- Responsive (stack on mobile)

**Components to Use:**

- `KnowledgeGraphValidator` (embedded or linked)
- `CSVImporter` (embedded or linked)
- `RelatedEntities` with `isAdmin={true}` for entity exploration
- Entity count API calls

**API Integration:**

- `GET /api/admin/:type` - Get entity counts (or count endpoint)
- `GET /api/admin/validate/all` - Get validation status
- Navigation to entity admin pages

**Routing:**

- Update `AdminPage.tsx` to include dashboard route: `/admin/dashboard`
- Make dashboard the default route when accessing `/admin` (after login)

---

### Phase 6: Enhanced CRUD Forms & Bulk Actions (Tasks 6.14-6.15)

**Goal:** Improve existing CRUD forms and add bulk operations

#### Task 6.14: Update Admin CRUD Forms with Validation Feedback

**Files:** `frontend/src/components/admin/EntityForm.tsx`, `RelationshipForm.tsx`

**Enhancements:**

- Real-time validation feedback
- Show field-level errors
- Validate required relationships before save
- Suggest fixes for common errors
- Display validation warnings (non-blocking)
- Link to validation tools if issues detected

**Implementation:**

- Add validation function that calls `POST /api/admin/validate/entity/:type/:id`
- Display validation results inline
- Highlight fields with errors
- Show suggestions for fixing errors

#### Task 6.15: Add Bulk Actions

**Files:** New component: `frontend/src/components/admin/BulkActions.tsx`

**Features:**

- Bulk selection of entities (checkboxes)
- Bulk delete
- Bulk relationship creation
- Bulk property update
- Confirmation dialogs for destructive actions

**UI:**

- Checkbox column in entity lists
- Bulk action toolbar (appears when items selected)
- Action dropdown: Delete, Create Relationship, Update Property
- Confirmation modal for bulk operations

**API Integration:**

- `DELETE /api/admin/:type` with array of IDs (or multiple DELETE calls)
- `POST /api/admin/relationships/:relType` with array of relationships
- `PATCH /api/admin/:type` with array of updates

**Backend Updates:**

- Add bulk operation endpoints if needed
- Support transaction for bulk operations (all or nothing)

---

### Phase 7: Testing & Integration (Task 6.16)

**Goal:** Test all admin workflows end-to-end

#### Task 6.16: Test Admin Workflows

**Test Scenarios:**

1. **Authentication:**

   - Login with correct password
   - Login with incorrect password
   - Session persistence
   - Logout
   - Access protected routes without login

2. **Validation:**

   - Run validation on clean database
   - Run validation on database with issues
   - Fix issues using validation tools
   - Re-run validation to confirm fixes

3. **CSV Import:**

   - Import nodes CSV
   - Import relationships CSV
   - Import with errors (test error handling)
   - Dry-run mode
   - Template download

4. **CRUD Operations:**

   - Create entity
   - Edit entity
   - Delete entity
   - Create relationship
   - Delete relationship
   - Validation feedback in forms

5. **Bulk Operations:**

   - Bulk delete
   - Bulk relationship creation
   - Bulk property update

6. **Dashboard:**
   - Entity counts display correctly
   - Validation status updates
   - Quick actions work
   - Navigation works

**Testing Approach:**

- Manual testing of each workflow
- Test with sample data
- Test error cases
- Test edge cases (empty database, large imports, etc.)

---

## Implementation Order & Dependencies

### Recommended Implementation Sequence:

0. **Phase 0 (Task 6.0.1)** - Admin Pages Analysis & Redesign

   - **CRITICAL FIRST STEP** - Must be completed before major refactoring
   - Provides foundation for all subsequent admin work
   - Identifies what can be reused vs what needs rebuilding
   - Creates migration plan and reduces risk of rework

1. **Phase 1 (Tasks 6.1-6.4)** - Authentication

   - Foundation for all other features
   - Can be developed and tested independently
   - Should be done after Phase 0 analysis to understand routing needs

2. **Phase 2 (Tasks 6.5-6.6)** - Validation Backend

   - Required for Phase 3
   - Can be tested with API calls

3. **Phase 3 (Tasks 6.7-6.9)** - Validation Frontend

   - Depends on Phase 2
   - Can be developed in parallel (6.7, 6.8, 6.9)

4. **Phase 4 (Tasks 6.10-6.12)** - CSV Import

   - Task 6.10.1 (Create Sample CSV Templates) can be done early as it's documentation/preparation
   - Task 6.10 (CSV Importer Utilities) and 6.11 (API Endpoints) depend on templates
   - Independent of validation
   - Can be developed in parallel with Phase 3

5. **Phase 5 (Task 6.13)** - Dashboard

   - Depends on Phases 2-4
   - Integrates all features

6. **Phase 6 (Tasks 6.14-6.15)** - Enhancements

   - Can be done after core features
   - Improves existing functionality

7. **Phase 7 (Task 6.16)** - Testing
   - Final phase
   - Tests all integrated features

## Technical Considerations

### Environment Variables

Add to `backend/.env` (NOT frontend/.env):

```
ADMIN_PASSWORD=your-secure-password-here
SESSION_SECRET=your-session-secret-here
```

**Note:** The `ADMIN_PASSWORD` must be in the **backend** `.env` file because:

- The backend validates the password during login (Task 6.2)
- The backend middleware checks authentication (Task 6.1)
- The frontend only sends the user-entered password to the backend API; it never validates passwords itself
- This keeps the password secure on the server side and prevents it from being exposed in client-side code

### Dependencies to Install

**Backend:**

- `express-session` or `jsonwebtoken` (authentication)
- `multer` (file upload)
- `csv-parse` (CSV parsing)
- `express-rate-limit` (rate limiting for login)

**Frontend:**

- No new dependencies expected (using existing React Router, fetch API)

### Database Considerations

- Validation queries should be optimized (use indexes)
- Consider adding database indexes for common validation queries
- Bulk operations should use transactions where possible
- CSV import should handle large files efficiently (streaming)

### Security Considerations

- Password stored in environment variable (not in code)
- Secure session cookies (httpOnly, secure, sameSite)
- Rate limiting on login endpoint
- File upload validation (type, size)
- Input validation on all admin endpoints
- CSRF protection (if using sessions)

### Performance Considerations

- Validation can be expensive - consider caching results
- CSV import should support progress updates for large files
- Bulk operations should be batched
- Dashboard should load counts efficiently (consider aggregation)

## Success Criteria

- [ ] Admin routes are password-protected
- [ ] Admin can log in and access all admin features
- [ ] Validation tools identify orphaned nodes, missing relationships, and integrity issues
- [ ] Admin can fix validation issues through the UI
- [ ] CSV import successfully imports nodes and relationships
- [ ] Admin dashboard displays entity counts and validation status
- [ ] All CRUD operations work with validation feedback
- [ ] Bulk operations work correctly
- [ ] All workflows tested and functional

## Future Enhancements (Post-MVP)

- Multi-user admin system with roles
- Audit log of admin actions
- Advanced validation rules (custom rules)
- Auto-fix for common issues
- Export functionality
- Advanced search/filtering in admin
- Relationship visualization
- Data backup/restore
