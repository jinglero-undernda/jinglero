# Task List: La Usina de la Fabrica de Jingles - MVP

Generated from: `0001-prd-clip-platform-mvp.md`

## Overview

This task list outlines the implementation steps for the MVP version of the Jinglero platform. The existing codebase already has a solid foundation with backend APIs, database schema, and basic frontend structure. The focus is on building the core user experience features and completing the entity detail pages.

## Relevant Files

### Backend Files (Mostly Complete - Minor Enhancements Needed)

- `backend/src/server/api/public.ts` - Public read-only API endpoints (enhanced with Fabrica-Jingles endpoints and latest Fabrica endpoint)
- `backend/src/server/api/admin.ts` - Admin CRUD endpoints (add password protection, CSV import, validation endpoints)
- `backend/src/server/api/search.ts` - Search API with autocomplete (complete)
- `backend/src/server/db/index.ts` - Neo4j client (complete)
- `backend/src/server/db/schema/schema.ts` - Database schema documentation (complete, will be refined in Task 5)
- `backend/src/server/db/schema/setup.ts` - Schema setup utilities (complete, may need updates in Task 5)
- `backend/src/server/db/schema/validation.ts` - Schema validation utilities (to be created)
- `backend/src/server/db/types.ts` - TypeScript type definitions (complete, will be refined in Task 5)
- `backend/src/server/db/migration/` - Schema migration scripts (to be created for Task 5 changes)
- `backend/src/server/middleware/errorHandler.ts` - Error handling middleware
- `backend/src/server/middleware/auth.ts` - Authentication middleware (✅ complete - JWT-based admin auth)
- `backend/src/server/utils/validation.ts` - Data validation utilities (✅ complete - validates entities, relationships, data integrity)
- `backend/src/server/db/import/` - CSV import files directory (✅ CSV files exist)
- `backend/src/server/db/schema/seed.ts` - CSV parsing utilities (`importNodesFromCSV`, `importRelationshipsFromCSV`) (✅ complete - used for seed script)
- `backend/src/server/db/import/csvImporter.ts` - CSV import utilities for admin UI (✅ NOT NEEDED - CSV import via admin UI not required; seed script utilities in `seed.ts` are sufficient)

### Frontend Files (Major Work Needed)

- `frontend/src/pages/FabricaPage.tsx` - **CORE MVP**: Video player with dynamic Jingle metadata (major rebuild needed)
- `frontend/src/pages/JinglePage.tsx` - Jingle detail page with relationships (rebuild needed)
- `frontend/src/pages/CancionPage.tsx` - Cancion detail page with Jingles list (rebuild needed)
- `frontend/src/pages/Home.tsx` - Home page with search and Fabricas list (rebuild needed)
- `frontend/src/pages/AdminPage.tsx` - Admin area with password protection (✅ complete - JWT-based auth)
- `frontend/src/pages/admin/AdminLogin.tsx` - Admin login page (✅ complete)
- `frontend/src/pages/admin/AdminDashboard.tsx` - Admin dashboard with entity counts, validation status, and entity creation flow (✅ complete)
- `frontend/src/pages/admin/AdminEntityAnalyze.tsx` - Unified admin entity page at `/admin/:entityType/:entityId` (✅ complete - replaces old entity-specific pages)
- `frontend/src/pages/admin/AdminEntityList.tsx` - Entity list pages at `/admin/:entityType` (✅ complete)
- `frontend/src/pages/admin/AdminHome.tsx` - Entity selection/search page (✅ complete)
- `frontend/src/components/admin/EntityMetadataEditor.tsx` - Entity metadata editing component (✅ complete)
- `frontend/src/components/admin/EntityList.tsx` - Entity listing component (✅ complete)
- `frontend/src/components/admin/EntitySearchAutocomplete.tsx` - Entity search/creation component (✅ complete)
- `frontend/src/components/admin/KnowledgeGraphValidator.tsx` - Knowledge graph validation interface (✅ complete)
- `frontend/src/components/admin/RelationshipValidator.tsx` - Relationship validation component (✅ complete)
- `frontend/src/components/admin/DataIntegrityChecker.tsx` - Data integrity checker (✅ complete)
- `frontend/src/components/admin/CSVImporter.tsx` - CSV import interface (✅ NOT NEEDED - CSV import via admin UI not required; seed script and direct AuraDB uploads sufficient)
- `frontend/src/components/admin/BulkActions.tsx` - Bulk actions component (✅ exists but not needed for MVP - database can be accessed directly for bulk operations)
- `frontend/src/hooks/useAdminAuth.ts` - Admin authentication hook (✅ complete)
- `frontend/src/components/player/YouTubePlayer.tsx` - YouTube IFrame Player component (loads API dynamically, exposes controls via ref, handles events)
- `frontend/src/types/youtube.d.ts` - TypeScript definitions for YouTube IFrame API
- `frontend/src/components/player/JingleTimeline.tsx` - Jingle timeline component (collapsed horizontal view, expandable to full metadata, auto-expands when active, handles missing data with "A CONFIRMAR" and "Anonimo")
- `frontend/src/components/player/JingleMetadata.tsx` - Active Jingle metadata display (shows title, timestamp, Jinglero, Cancion, Autor, Tematicas with badges, optional comment and lyrics)
- `frontend/src/components/search/SearchBar.tsx` - Search bar with autocomplete (complete)
- `frontend/src/components/search/SearchResults.tsx` - Search results display (to be created)
- `frontend/src/components/common/EntityCard.tsx` - Reusable entity card component (to be created)
- `frontend/src/components/common/RelatedEntities.tsx` - Related entities display (to be created)
- `frontend/src/lib/api/client.ts` - API client (enhance with new endpoints)
- `frontend/src/lib/hooks/useYouTubePlayer.ts` - YouTube player hook (manages player state, provides controls, polling, event callbacks)
- `frontend/src/lib/hooks/useJingleSync.ts` - Hook for syncing Jingle metadata to playback time (determines active jingle based on current time, debounced updates, callback support)
- `frontend/src/lib/utils/youtube.ts` - YouTube URL utilities (extract video ID, build embed URL, build watch URL, validate URLs)
- `frontend/src/lib/utils/timestamp.ts` - Timestamp parsing utilities (parse HH:MM:SS to seconds, format seconds to HH:MM:SS, normalize timestamps, readable format)

### New Pages Needed

- `frontend/src/pages/ArtistaPage.tsx` - Artista detail page
- `frontend/src/pages/TematicaPage.tsx` - Tematica detail page
- `frontend/src/pages/Home.tsx` - Home page with prominent search bar and featured Fabricas list (displays 6 most recent Fabricas, hero section, loading/error states)
- `frontend/src/styles/pages/home.css` - Home page styles (hero section, search bar styling, featured Fabricas grid, responsive design)
- `frontend/src/pages/SearchResultsPage.tsx` - Search results page (displays grouped results by entity type including Fabricas, shows result count, handles loading/error/no results states, includes integrated SearchBar)
- `frontend/src/styles/pages/search-results.css` - Search results page styles (responsive grid layout, section headers, loading/error states, search bar styling with dropdown positioning)
- `frontend/src/components/search/SearchBar.tsx` - Enhanced with navigation to `/search?q=query`, filters empty/None values, includes Fabricas in suggestions, syncs with URL query parameter
- `backend/src/server/api/search.ts` - Enhanced with Fabricas search (title only), Neo4j date conversion, proper null/empty field filtering, fixed nested result structure extraction

### Styling Files

- `frontend/src/styles/pages/fabrica.css` - Fabrica page styles (to be created)
- `frontend/src/styles/components/player.css` - Video player styles (to be created)
- `frontend/src/styles/components/timeline.css` - Timeline styles (to be created)
- `frontend/src/styles/pages/entity-detail.css` - Entity detail page styles (to be created)
- `frontend/src/styles/admin-portal.css` - Admin portal barebone styles (to be created)
- `frontend/src/styles/theme/design-system.css` - Design system variables and tokens (to be created)

### Testing Files

- `frontend/src/components/player/__tests__/YouTubePlayer.test.tsx` - Player component tests
- `frontend/src/lib/hooks/__tests__/useJingleSync.test.ts` - Jingle sync hook tests
- `backend/tests/server/api/admin.test.ts` - Admin API tests

### Notes

- The backend API infrastructure is largely complete and functional
- Focus should be on frontend development, particularly the Fabrica video player
- CSV import files are already available in `backend/src/server/db/import/`
- Tasks 1-4 establish barebone functional pages to inform schema refinement decisions (Task 5)
- Admin portal needs barebone UX/UI prioritizing functionality over aesthetics for knowledge graph validation (Task 6)
- Public-facing pages require polished UX design and visual refinement (Task 7)
- All UI text should be in Spanish (Argentina)
- Responsive design required for mobile, tablet, and desktop

## Tasks

- [x] 1.0 Enhance Backend API for MVP Video Player Experience

  - [x] 1.1 Add endpoint `/api/public/fabricas/:id/jingles` to fetch all Jingles for a Fabrica with timestamps and order
  - [x] 1.2 Enhance `/api/public/jingles/:id` to include full relationship data (Fabrica, Cancion, Artista, Tematicas)
  - [x] 1.3 Add endpoint `/api/public/fabricas/:id/jingle-at-time?timestamp=X` to get active Jingle at specific timestamp
  - [x] 1.4 Update `convertNeo4jDates` helper to handle timestamp format conversion (seconds to HH:MM:SS)
  - [x] 1.5 Add error handling for missing Fabricas or invalid timestamps
  - [x] 1.6 Test all new endpoints with sample data

- [x] 2.0 Build Core Fabrica Video Player with Dynamic Jingle Metadata (MVP CRITICAL)

  - [x] 2.1 Create `frontend/src/lib/utils/youtube.ts` with YouTube URL parsing utilities (extract video ID, build embed URL)
  - [x] 2.2 Create `frontend/src/lib/utils/timestamp.ts` with timestamp utilities (parse HH:MM:SS to seconds, format seconds to HH:MM:SS)
  - [x] 2.3 Create `frontend/src/components/player/YouTubePlayer.tsx` component using YouTube IFrame API
  - [x] 2.4 Create `frontend/src/lib/hooks/useYouTubePlayer.ts` hook to manage player state (play, pause, seek, getCurrentTime)
  - [x] 2.5 Create `frontend/src/components/player/JingleTimeline.tsx` component displaying expandable/collapsible Jingle rows with timestamps (used in timeline layout with past/current/future sections)
  - [x] 2.6 Create `frontend/src/components/player/JingleMetadata.tsx` component displaying active Jingle details (title, Jinglero, Cancion, Autor, Tematicas)
  - [x] 2.7 Create `frontend/src/lib/hooks/useJingleSync.ts` hook to sync active Jingle based on current playback time
  - [x] 2.8 Rebuild `frontend/src/pages/FabricaPage.tsx` integrating all player components
  - [x] 2.9 Implement timestamp navigation (click Jingle in timeline to seek to that time)
  - [x] 2.10 Add loading states for video buffering and metadata fetching
  - [x] 2.11 Add error handling for video load failures or missing Jingles
  - [x] 2.12 Test video playback, timestamp navigation, and metadata sync with sample Fabrica

- [x] 3.0 Implement Complete Entity Detail Pages with Relationships

  - [x] 3.1 Create `frontend/src/components/common/EntityCard.tsx` reusable component for displaying entity summary cards
  - [x] 3.2 Create `frontend/src/components/common/RelatedEntities.tsx` component for displaying related entities with links
  - [x] 3.3 Rebuild entity detail pages to fetch and display full entity data with relationships (implemented as `InspectJingle.tsx`, `InspectCancion.tsx`, `InspectArtista.tsx`, `InspectTematica.tsx`, `InspectFabrica.tsx` in `frontend/src/pages/inspect/`)
  - [x] 3.4 All entity pages display relationships: Jingle (Fabrica link with timestamp, Cancion, Jinglero, Autor, Tematicas), Cancion (Jingles using it, other Canciones by same Autor, related Artistas), Artista (Jingles as Jinglero, Canciones as Autor), Tematica (all tagged Jingles), Fabrica (Jingles with timestamps)
  - [x] 3.5 All entity detail pages implemented and functional
  - [x] 3.6 All entity detail pages implemented and functional
  - [x] 3.7 Update `frontend/src/App.tsx` routing to include all entity routes (`/j/:jingleId`, `/c/:cancionId`, `/a/:artistaId`, `/t/:tematicaId`, `/f/:fabricaId`)
  - [ ] 3.8 Add breadcrumb navigation component to show entity hierarchy (Post-MVP enhancement)
  - [x] 3.9 Add loading and error states for all entity pages
  - [ ] 3.10 Test navigation between related entities (e.g., Jingle → Cancion → Autor → other Canciones) - More thorough testing needed once database is more complete
  - [ ] 3.11 Consider renaming `Inspect*.tsx` files to `*Page.tsx` for consistency with PRD naming (non-blocking, recommended)

- [x] 4.0 Build Search Results Page and Enhance Search Experience

  - [x] 4.0.1 Backend search API implemented (`/api/search` with autocomplete support)
  - [x] 4.0.2 `SearchBar` component created with autocomplete functionality (debounced, grouped suggestions)
  - [x] 4.1 Create `frontend/src/pages/SearchResultsPage.tsx` to display grouped search results
  - [x] 4.2 Update `frontend/src/components/search/SearchBar.tsx` to navigate to `/search?q=query` on submit
  - [x] 4.3 Create `frontend/src/components/search/SearchResults.tsx` component to display results grouped by entity type (Jingles, Canciones, Artistas, Tematicas, Fabricas) - Integrated directly into SearchResultsPage
  - [x] 4.4 Add entity type badges/icons to distinguish result types (🎤 Jingles, 📦 Canciones, 👤 Artistas, 🏷️ Temáticas, 🏭 Fábricas)
  - [x] 4.5 Add links from search results to entity detail pages (via EntityCard component)
  - [x] 4.6 Add "no results found" state with helpful message
  - [x] 4.7 Update `frontend/src/pages/Home.tsx` to include prominent search bar and featured Fabricas list
  - [x] 4.8 Add search result count display ("X resultados encontrados")
  - [x] 4.9 Test search functionality with various queries (Spanish characters, partial matches, etc.) - Basic testing completed, additional edge case testing pending
  - [x] 4.10 Add Fabricas to search functionality (searches by title only)
  - [x] 4.11 Add search link to header navigation ("Búsqueda")
  - [x] 4.12 Fix Neo4j DateTime object conversion in search API responses
  - [x] 4.13 Fix nested link warnings in EntityCard show button
  - [x] 4.14 Fix empty/null field filtering in search queries and dropdown suggestions

- [ ] 5.0 Refine Database Schema Based on UX Insights

  - [x] 5.1 Document schema issues and improvement opportunities identified during Tasks 1-4 (create `backend/src/server/db/schema/REFINEMENT_NOTES.md`)
  - [x] 5.2 Design schema improvements (additional properties, new relationships, constraint changes)
  - [x] 5.3 Create migration scripts in `backend/src/server/db/migration/` for schema changes
  - [x] 5.4 Update `backend/src/server/db/types.ts` with refined TypeScript types
  - [x] 5.5 Update `backend/src/server/db/schema/schema.ts` documentation to reflect changes
  - [x] 5.6 Update API endpoints in `backend/src/server/api/public.ts` and `admin.ts` to handle new schema
  - [x] 5.7 Update frontend types in `frontend/src/types/index.ts`
  - [x] 5.8 Run migration scripts on development database
  - [ ] 5.9 Test data integrity and API endpoints after migration
  - [ ] 5.10 Update CSV seed files in `backend/src/server/db/import/` if schema changes require it
  - [ ] 5.11 Document migration steps for production deployment

- [x] 6.0 Rebuild Admin Portal with Knowledge Graph Validation Tools (COMPLETE)

  **Current Status:** Admin portal has been rebuilt with unified architecture, authentication, validation tools, and comprehensive CRUD operations. CSV import via admin UI is not required - one-off uploads can be performed directly in AuraDB. Bulk import is only for initial database population, not a core long-term feature.

  - [x] 6.1 Create `backend/src/server/middleware/auth.ts` with password protection middleware for admin routes - ✅ **COMPLETE:** JWT-based authentication middleware implemented
  - [x] 6.2 Add admin password authentication endpoint `/api/admin/login` (simple password check) - ✅ **COMPLETE:** JWT-based login endpoint implemented
  - [x] 6.3 Create `frontend/src/pages/admin/AdminLogin.tsx` for password entry - ✅ **COMPLETE:** Login page implemented
  - [x] 6.4 Update `frontend/src/pages/AdminPage.tsx` to require authentication - ✅ **COMPLETE:** Protected routes implemented using `useAdminAuth` hook
  - [x] 6.5 Create `backend/src/server/db/schema/validation.ts` with data validation utilities (orphaned nodes, missing required relationships, data integrity checks) - ✅ **COMPLETE:** Validation utilities exist in `backend/src/server/utils/validation.ts` (not in schema folder, but functionality exists)
  - [x] 6.6 Add validation API endpoints: `/api/admin/validate/orphans`, `/api/admin/validate/relationships`, `/api/admin/validate/integrity` - ✅ **COMPLETE:** Validation endpoints implemented (`/api/admin/validate/entity/:type/:id`, `/api/admin/validate/entity/:type`, `/api/admin/validate/relationship/:relType`, `/api/admin/validate/fix`)
  - [x] 6.7 Create `frontend/src/components/admin/KnowledgeGraphValidator.tsx` to display validation results and issues - ✅ **COMPLETE:** Component implemented
  - [x] 6.8 Create `frontend/src/components/admin/RelationshipValidator.tsx` to check and fix relationship issues - ✅ **COMPLETE:** Component implemented
  - [x] 6.9 Create `frontend/src/components/admin/DataIntegrityChecker.tsx` to verify data consistency (e.g., Jingles have Fabricas, Canciones have Autores) - ✅ **COMPLETE:** Component implemented
  - [x] 6.10 Create `backend/src/server/db/import/csvImporter.ts` utilities for CSV parsing and import - ✅ **NOT NEEDED:** CSV parsing utilities exist in `backend/src/server/db/schema/seed.ts` for seed script. CSV import via admin UI not required - one-off uploads can be performed directly in AuraDB.
  - [x] 6.11 Add CSV import endpoint `/api/admin/import/csv` with support for all entity types - ✅ **NOT NEEDED:** CSV import via admin UI not required for MVP. Bulk import is only for initial database population via seed script or direct AuraDB upload.
  - [x] 6.12 Create `frontend/src/components/admin/CSVImporter.tsx` interface for uploading and importing CSV files - ✅ **NOT NEEDED:** CSV import via admin UI not required for MVP.
  - [x] 6.13 Rebuild `frontend/src/pages/admin/AdminDashboard.tsx` with barebone layout showing entity counts, validation status, and quick actions (will use RelatedEntities in Admin mode) - ✅ **COMPLETE:** Comprehensive dashboard implemented with entity creation flow, entity counts, and validation integration
  - [x] 6.14 Update admin CRUD forms to include validation feedback - ✅ **COMPLETE:** `EntityMetadataEditor` includes validation, validation components integrated into admin pages
  - [x] 6.15 Add bulk actions (delete multiple entities, bulk relationship creation) - ✅ **NOT NEEDED:** Bulk actions not required for MVP. Database can be accessed directly for bulk operations if needed. `BulkActions` component exists but is not a priority.
  - [x] 6.16 Test admin workflows: login, validation, CSV import, CRUD operations - ✅ **COMPLETE:** Login, validation, and CRUD workflows tested and functional

  **Architecture Notes:**

  - Unified admin entity page: `/admin/:entityType/:entityId` uses `AdminEntityAnalyze` component
  - Entity list pages: `/admin/:entityType` uses `AdminEntityList` component
  - `RelatedEntities` component used with `isAdmin={true}` prop for immediate relationship visibility
  - Old entity-specific pages (`AdminJingle`, `AdminFabrica`, etc.) still exist but are superseded by unified architecture
  - CSV import: Not required via admin UI - seed script and direct AuraDB uploads are sufficient for initial data population

- [ ] 7.0 UX Design and Visual Refinement (Look & Feel) (PENDING - Future Implementation)

  **Current Status:** Basic styling exists with `variables.css` (design tokens), component styles (`entity-card.css`, `metadata.css`, `player.css`, `timeline.css`, `related-entities.css`), and page styles (`fabrica.css`). Loading states (skeleton screens) and error states are implemented. Formal design system, comprehensive visual refinement, and consistency testing are pending.

  - [ ] 7.1 Create `frontend/src/styles/theme/design-system.css` with design tokens (colors, typography, spacing, breakpoints) - Note: `variables.css` exists but formal design system file pending
  - [ ] 7.2 Define color palette (primary, secondary, accent, neutral, semantic colors for success/error/warning) - Basic colors exist in `variables.css`, full palette definition pending
  - [ ] 7.3 Define typography scale (headings, body, captions, font families) - Basic typography exists, full scale definition pending
  - [ ] 7.4 Create component library styles for buttons, cards, inputs, badges, links - Component styles exist but formal library documentation pending
  - [ ] 7.5 Design and implement visual styles for Fabrica video player page (player, timeline, metadata panel) - Basic styles exist, visual refinement pending
  - [ ] 7.6 Design and implement visual styles for entity detail pages (layout, cards, related entities sections) - Basic styles exist, visual refinement pending
  - [ ] 7.7 Design and implement visual styles for search interface (search bar, results page, filters) - Pending search results page implementation
  - [ ] 7.8 Design and implement visual styles for Home page (hero section, featured Fabricas grid) - Pending Home page enhancement
  - [x] 7.9 Create loading states with skeleton screens or spinners - Implemented
  - [x] 7.10 Create error states with helpful messages and actions - Implemented
  - [ ] 7.11 Add micro-interactions and transitions (hover states, focus states, page transitions) - Some hover/focus states exist, comprehensive micro-interactions pending
  - [ ] 7.12 Ensure visual consistency across all public-facing pages - Pending comprehensive review
  - [ ] 7.13 Test visual design across different screen sizes - Pending
  - [ ] 7.14 Gather feedback and iterate on design - Pending

- [ ] 8.0 Responsive Design and Legal Compliance

  **Current Status:** Responsive design is partially implemented with media queries in `fabrica.css` (599px breakpoint for stacked layout), `related-entities.css`, `entity-card.css`, and `admin.css` (600px breakpoints). YouTube player uses aspect-ratio for responsive sizing. Comprehensive device testing pending.

  - [x] 8.1 Make Fabrica player page responsive (stacked layout on mobile, side-by-side on desktop) - Partially implemented with media queries
  - [x] 8.2 Ensure YouTube player resizes properly on all screen sizes - Implemented with aspect-ratio CSS
  - [ ] 8.3 Make Jingle timeline scrollable and touch-friendly on mobile (needs testing/refinement)
  - [x] 8.4 Make all entity detail pages responsive (card grids, flexible layouts) - Partially implemented with media queries
  - [ ] 8.5 Make search interface responsive (mobile-friendly search bar and results) - Pending search results page implementation
  - [ ] 8.6 Make navigation responsive (hamburger menu on mobile if needed) - Pending
  - [ ] 8.7 Test touch interactions on mobile devices (tap targets, scrolling, gestures) - Pending comprehensive testing
  - [ ] 8.8 Test on various devices (iPhone, Android, iPad, different browsers) - Pending comprehensive testing
  - [ ] 8.9 Translate all UI text to Spanish (Argentina) - buttons, labels, messages, placeholders (Ongoing task - language review planned for later MVP stages)
  - [ ] 8.10 Create `frontend/src/components/common/LegalDisclaimer.tsx` component with IP rights disclaimer
  - [ ] 8.11 Create `frontend/src/components/layout/Footer.tsx` with legal information and links
  - [ ] 8.12 Add legal disclaimer text referencing Argentinean law (intellectual property, YouTube content usage)
  - [ ] 8.13 Add attribution to "La Fabrica de Jingles" and "Gelatina" streaming station
  - [ ] 8.14 Ensure all legal text is in Spanish and culturally appropriate

- [ ] 9.0 Testing, Polish, and Deployment Preparation (PENDING - Future Implementation)

  **Current Status:** Some tests exist (`RelatedEntities.test.tsx`, `EntityCard.test.tsx`, `RelatedEntities.integration.test.tsx`, `routing.test.tsx`, `SearchBar.test.tsx`, `RelatedEntities.reducer.test.ts`, backend `schema.test.ts`, `db.test.ts`). Comprehensive testing suite, deployment documentation, and production preparation are pending.

  - [ ] 9.1 Write unit tests for YouTube player component (`frontend/src/components/player/__tests__/YouTubePlayer.test.tsx`)
  - [ ] 9.2 Write unit tests for useJingleSync hook (`frontend/src/lib/hooks/__tests__/useJingleSync.test.ts`)
  - [ ] 9.3 Write unit tests for timestamp utilities
  - [ ] 9.4 Write integration tests for admin authentication (`backend/tests/server/api/admin.test.ts`)
  - [ ] 9.5 Write integration tests for Fabrica-Jingles API endpoints
  - [ ] 9.6 Write E2E tests for critical user flows (search → entity detail → related entity, Fabrica playback → timestamp navigation)
  - [ ] 9.7 Perform cross-browser testing (Chrome, Firefox, Safari, Edge)
  - [ ] 9.8 Test on iOS Safari and Chrome Android
  - [ ] 9.9 Performance optimization: lazy load components, optimize images, code splitting
  - [ ] 9.10 Performance optimization: optimize Cypher queries, add database indexes if needed
  - [ ] 9.11 Fix any bugs or issues discovered during testing
  - [ ] 9.12 Create deployment documentation (`docs/DEPLOYMENT.md`) with setup instructions
  - [ ] 9.13 Document environment variables needed (NEO4J_URI, NEO4J_PASSWORD, ADMIN_PASSWORD, PORT)
  - [ ] 9.14 Create production build and test locally
  - [ ] 9.15 Verify all CSV seed data is loaded correctly
  - [ ] 9.16 Perform final user acceptance testing with target audience
  - [ ] 9.17 Prepare MVP release notes and documentation

- [ ] 10.0 Database and Codebase Audit and Cleanup (PENDING - Post-MVP Maintenance)

  **Purpose:** Clean up database and codebase after Admin development phase. Address data degradation that may have occurred during development/debugging, and remove legacy components and excessive logging.

  - [ ] 10.1 Perform one-off CSV data upload to AuraDB
    - [ ] 10.1.1 Format CSV files according to AuraDB import requirements (verify format matches Neo4j import format: `node-{Label}-*.csv`, `rel-{StartLabel}-{RelType}-{EndLabel}-*.csv`)
    - [ ] 10.1.2 Prepare CSV files in `backend/src/server/db/import/` for AuraDB upload (ensure proper encoding, column headers, data types)
    - [ ] 10.1.3 Use AuraDB import interface or Neo4j Browser to upload CSV files directly
    - [ ] 10.1.4 Verify data import success (check entity counts, sample relationships, data integrity)
    - [ ] 10.1.5 Document AuraDB upload process and any issues encountered for future reference
  - [ ] 10.2 Audit database for data integrity issues (orphaned nodes, missing relationships, inconsistent data)
  - [ ] 10.3 Run validation tools (`DataIntegrityChecker`, `KnowledgeGraphValidator`) across all entity types
  - [ ] 10.4 Fix identified data issues (missing relationships, duplicate entities, invalid properties)
  - [ ] 10.5 Document database cleanup procedures and findings
  - [ ] 10.6 Identify and remove legacy admin components (old entity-specific pages: `AdminJingle`, `AdminFabrica`, `AdminArtista`, `AdminCancion`, `AdminTematica` if no longer needed)
  - [ ] 10.7 Remove or consolidate duplicate/unused components
  - [ ] 10.8 Audit and remove excessive logging operations (console.log statements, debug logging)
  - [ ] 10.9 Replace debug logging with proper logging framework if needed
  - [ ] 10.10 Clean up unused imports and dependencies
  - [ ] 10.11 Document codebase cleanup decisions and removed components
  - [ ] 10.12 Verify application functionality after cleanup
  - [ ] 10.13 Update documentation to reflect cleaned codebase structure
