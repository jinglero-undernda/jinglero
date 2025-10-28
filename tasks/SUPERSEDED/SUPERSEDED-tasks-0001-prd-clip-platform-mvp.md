# Tasks for MVP Implementation: La Usina de la Fabrica de Jingles

## Relevant Files

- `src/server/db/index.ts` - Main database connection and query interface
- `src/server/db/types.ts` - TypeScript types for database entities
- `src/server/api/admin.ts` - New admin API endpoints for database management
- `src/server/api/admin.test.ts` - Tests for admin API endpoints
- `src/components/admin/DatabaseManager.tsx` - Admin interface for database management
- `src/components/admin/CsvUploader.tsx` - CSV file upload component
- `src/components/admin/EntityEditor.tsx` - Entity editing interface
- `src/lib/validation/csvSchema.ts` - CSV validation schemas
- `src/pages/admin/index.tsx` - Admin dashboard page
- `src/styles/admin.css` - Admin interface styles
- `frontend/vite.config.ts` - Vite configuration with path aliases and proxy
- `frontend/vitest.config.ts` - Vitest configuration for unit tests
- `frontend/src/__tests__/setup.ts` - Global test setup (Testing Library integration)
- `frontend/src/__tests__/test-utils.tsx` - Custom render helper with providers
- `frontend/src/components/__tests__/SearchBar.test.tsx` - Example component tests
- `frontend/src/lib/__tests__/useSearch.test.ts` - Example hook tests
- `frontend/src/components/search/SearchBar.tsx` - Example search component used in tests
- `frontend/src/lib/hooks/useSearch.ts` - Example hook used in tests
- `docs/frontend.md` - Frontend setup and run guidance
- `frontend/src/__tests__/routing.test.tsx` - Routing unit tests for canonical routes and query params

### Notes

- The database schema is already implemented in AuraDB
- All new components should follow the existing project structure
- CSV import/export should match the schema defined in `src/server/db/schema/schema.ts`
- Admin interface should be in Spanish (Argentina)
- Authentication will be basic password protection for MVP

## Tasks

- [ ] 1.0 Frontend Project Setup

  - [x] 1.1 Initialize React project with Vite and TypeScript
  - [x] 1.2 Set up project structure (components, pages, lib, styles)
  - [x] 1.3 Configure build system and development environment
  - [x] 1.4 Set up testing framework (Vitest + React Testing Library)
  - [x] 1.5 Configure ESLint and Prettier
  - [x] 1.7 Create basic routing structure
  - [x] 1.8 Write initial tests for routing setup

- [ ] 2.0 Set up Admin Authentication System

  - [ ] 2.1 Create authentication service with JWT
  - [ ] 2.2 Implement admin login page with password protection
  - [ ] 2.3 Create admin-only API middleware
  - [ ] 2.4 Set up protected route wrapper component
  - [ ] 2.5 Create admin dashboard layout component
  - [ ] 2.6 Write tests for authentication flow
  - [ ] 2.7 Implement session persistence
  - [ ] 2.8 Add security headers and CSRF protection

- [ ] 3.0 Develop Database Management Interface

  - [x] 3.1 Update seed.yaml to match the properties definition in types.ts, schema.ts (monitor for discrepancies; if any, types.ts supersedes schema.ts - make updates to if needed). Populate the contents from the x13 .csv files in db/import/ . Where information is not clear add a TBC marker for manual edit.
  - [x] 3.2 Import relationships from rel CSVs
    - Parsed rel-\*.csv files and added relationship entries under `relationships` in `backend/src/server/db/seed.yaml`.
  - `backend/src/server/db/seed.yaml` - Seed data generated from CSV imports (created from node-\*.csv files)
  - [x] 3.3 Create a RESTful API to CRUD all entities from seed.yaml file, that will be later replaced by the Core API layer.
  - [ ] 3.4 Build entity creation/edit forms: CRUD for each node type (x6), CRUD for relationships (x7) with drop-down selection of relevant nodes - (separate edit page per entity, with routes listed in the Admin page body).
  - [ ] 3.5 Create entity list view component with filtering and link to the entity edit page
  - [ ] 3.6 Implement CSV parsing and validation service
  - [ ] 3.7 Implement batch update functionality
  - [ ] 3.8 Add error handling and user feedback (including confirm deletion)
  - [ ] 3.9 Create CSV export functionality for each entity type
  - [ ] 3.10 Build CSV file upload/validation component - add to each entity edit page
  - [ ] 3.11 Confirm entity type definitions and validation reviewing against changes to db schema definition.
  - [ ] 3.12 Write integration tests for database operations
  - [ ] 3.13 Add data validation unit tests

- [ ] 4.0 Design System Integration

  - [ ] 4.1 Prepare design requirements documentation
  - [ ] 4.2 Schedule and conduct design review meeting
  - [ ] 4.3 Create component library structure
  - [ ] 4.4 Set up Storybook for component documentation
  - [ ] 4.5 Define typography and color system
  - [ ] 4.6 Create base component templates
  - [ ] 4.7 Document accessibility requirements
  - [ ] 4.8 Write component styling guidelines
  - [ ] 4.9 Create component testing templates

- [ ] 5.0 Implement Core API Layer

  - [x] 5.1 Design RESTful API endpoints for all entities
  - [x] 5.2 Implement base controller class with error handling
  - [x] 5.3 Create CRUD operations for each entity
  - [x] 5.4 Implement search functionality with Neo4j
  - [x] 5.5 Add query optimization for complex searches
  - [ ] 5.6 Create analytics tracking endpoints
  - [ ] 5.7 Implement error reporting system
  - [x] 5.8 Write API documentation
  - [ ] 5.9 Create API integration tests
  - [ ] 5.10 Set up API monitoring and logging

- [ ] 6.0 Create Basic Public Interface
  - [ ] 6.1 Implement responsive layout system
  - [ ] 6.2 Create search component with auto-complete
  - [ ] 6.3 Build video player component with timestamp support
  - [ ] 6.4 Implement error reporting UI
  - [ ] 6.5 Create loading and error states
  - [ ] 6.6 Add client-side caching for search results
  - [ ] 6.7 Implement responsive navigation
  - [ ] 6.8 Add share functionality
  - [ ] 6.9 Write component unit tests
  - [ ] 6.10 Perform end-to-end testing

I have generated the high-level tasks based on the PRD and current implementation state. Ready to generate the sub-tasks? Respond with 'Go' to proceed.
