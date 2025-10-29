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
- `backend/src/server/middleware/auth.ts` - Authentication middleware (to be created for admin password protection)
- `backend/src/server/db/import/csvImporter.ts` - CSV import utilities (to be created)

### Frontend Files (Major Work Needed)

- `frontend/src/pages/FabricaPage.tsx` - **CORE MVP**: Video player with dynamic Jingle metadata (major rebuild needed)
- `frontend/src/pages/JinglePage.tsx` - Jingle detail page with relationships (rebuild needed)
- `frontend/src/pages/CancionPage.tsx` - Cancion detail page with Jingles list (rebuild needed)
- `frontend/src/pages/Home.tsx` - Home page with search and Fabricas list (rebuild needed)
- `frontend/src/pages/AdminPage.tsx` - Admin area (add password protection)
- `frontend/src/pages/admin/AdminDashboard.tsx` - Admin dashboard (complete rebuild for knowledge graph validation)
- `frontend/src/components/admin/KnowledgeGraphValidator.tsx` - Knowledge graph validation interface (to be created)
- `frontend/src/components/admin/RelationshipValidator.tsx` - Relationship validation component (to be created)
- `frontend/src/components/admin/CSVImporter.tsx` - CSV import interface (to be created)
- `frontend/src/components/admin/DataIntegrityChecker.tsx` - Data integrity checker (to be created)
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
- `frontend/src/pages/SearchResultsPage.tsx` - Search results page

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

- [ ] 2.0 Build Core Fabrica Video Player with Dynamic Jingle Metadata (MVP CRITICAL)

  - [x] 2.1 Create `frontend/src/lib/utils/youtube.ts` with YouTube URL parsing utilities (extract video ID, build embed URL)
  - [x] 2.2 Create `frontend/src/lib/utils/timestamp.ts` with timestamp utilities (parse HH:MM:SS to seconds, format seconds to HH:MM:SS)
  - [x] 2.3 Create `frontend/src/components/player/YouTubePlayer.tsx` component using YouTube IFrame API
  - [x] 2.4 Create `frontend/src/lib/hooks/useYouTubePlayer.ts` hook to manage player state (play, pause, seek, getCurrentTime)
  - [x] 2.5 Create `frontend/src/components/player/JingleTimeline.tsx` component displaying clickable list of Jingles with timestamps
  - [x] 2.6 Create `frontend/src/components/player/JingleMetadata.tsx` component displaying active Jingle details (title, Jinglero, Cancion, Autor, Tematicas)
  - [x] 2.7 Create `frontend/src/lib/hooks/useJingleSync.ts` hook to sync active Jingle based on current playback time
  - [ ] 2.8 Rebuild `frontend/src/pages/FabricaPage.tsx` integrating all player components
  - [ ] 2.9 Implement timestamp navigation (click Jingle in timeline to seek to that time)
  - [ ] 2.10 Add loading states for video buffering and metadata fetching
  - [ ] 2.11 Add error handling for video load failures or missing Jingles
  - [ ] 2.12 Test video playback, timestamp navigation, and metadata sync with sample Fabrica

- [ ] 3.0 Implement Complete Entity Detail Pages with Relationships

  - [ ] 3.1 Create `frontend/src/components/common/EntityCard.tsx` reusable component for displaying entity summary cards
  - [ ] 3.2 Create `frontend/src/components/common/RelatedEntities.tsx` component for displaying related entities with links
  - [ ] 3.3 Rebuild `frontend/src/pages/JinglePage.tsx` to fetch and display full Jingle data with relationships (Fabrica link with timestamp, Cancion, Jinglero, Autor, Tematicas)
  - [ ] 3.4 Rebuild `frontend/src/pages/CancionPage.tsx` to display Cancion with list of Jingles using it, other Canciones by same Autor, and related Artistas
  - [ ] 3.5 Create `frontend/src/pages/ArtistaPage.tsx` to display Artista with their Jingles (as Jinglero) and Canciones (as Autor)
  - [ ] 3.6 Create `frontend/src/pages/TematicaPage.tsx` to display Tematica with all tagged Jingles
  - [ ] 3.7 Update `frontend/src/App.tsx` routing to include Artista (`/a/:artistaId`) and Tematica (`/t/:tematicaId`) routes
  - [ ] 3.8 Add breadcrumb navigation component to show entity hierarchy
  - [ ] 3.9 Add loading and error states for all entity pages
  - [ ] 3.10 Test navigation between related entities (e.g., Jingle → Cancion → Autor → other Canciones)

- [ ] 4.0 Build Search Results Page and Enhance Search Experience

  - [ ] 4.1 Create `frontend/src/pages/SearchResultsPage.tsx` to display grouped search results
  - [ ] 4.2 Update `frontend/src/components/search/SearchBar.tsx` to navigate to `/search?q=query` on submit
  - [ ] 4.3 Create `frontend/src/components/search/SearchResults.tsx` component to display results grouped by entity type (Jingles, Canciones, Artistas, Tematicas)
  - [ ] 4.4 Add entity type badges/icons to distinguish result types
  - [ ] 4.5 Add links from search results to entity detail pages
  - [ ] 4.6 Add "no results found" state with helpful message
  - [ ] 4.7 Update `frontend/src/pages/Home.tsx` to include prominent search bar and featured Fabricas list
  - [ ] 4.8 Add search result count display ("X resultados encontrados")
  - [ ] 4.9 Test search functionality with various queries (Spanish characters, partial matches, etc.)

- [ ] 5.0 Refine Database Schema Based on UX Insights

  - [ ] 5.1 Document schema issues and improvement opportunities identified during Tasks 1-4 (create `backend/src/server/db/schema/REFINEMENT_NOTES.md`)
  - [ ] 5.2 Design schema improvements (additional properties, new relationships, constraint changes)
  - [ ] 5.3 Create migration scripts in `backend/src/server/db/migration/` for schema changes
  - [ ] 5.4 Update `backend/src/server/db/types.ts` with refined TypeScript types
  - [ ] 5.5 Update `backend/src/server/db/schema/schema.ts` documentation to reflect changes
  - [ ] 5.6 Update API endpoints in `backend/src/server/api/public.ts` and `admin.ts` to handle new schema
  - [ ] 5.7 Update frontend types in `frontend/src/types/index.ts`
  - [ ] 5.8 Run migration scripts on development database
  - [ ] 5.9 Test data integrity and API endpoints after migration
  - [ ] 5.10 Update CSV seed files in `backend/src/server/db/import/` if schema changes require it
  - [ ] 5.11 Document migration steps for production deployment

- [ ] 6.0 Rebuild Admin Portal with Knowledge Graph Validation Tools

  - [ ] 6.1 Create `backend/src/server/middleware/auth.ts` with password protection middleware for admin routes
  - [ ] 6.2 Add admin password authentication endpoint `/api/admin/login` (simple password check)
  - [ ] 6.3 Create `frontend/src/pages/admin/AdminLogin.tsx` for password entry
  - [ ] 6.4 Update `frontend/src/pages/AdminPage.tsx` to require authentication
  - [ ] 6.5 Create `backend/src/server/db/schema/validation.ts` with data validation utilities (orphaned nodes, missing required relationships, data integrity checks)
  - [ ] 6.6 Add validation API endpoints: `/api/admin/validate/orphans`, `/api/admin/validate/relationships`, `/api/admin/validate/integrity`
  - [ ] 6.7 Create `frontend/src/components/admin/KnowledgeGraphValidator.tsx` to display validation results and issues
  - [ ] 6.8 Create `frontend/src/components/admin/RelationshipValidator.tsx` to check and fix relationship issues
  - [ ] 6.9 Create `frontend/src/components/admin/DataIntegrityChecker.tsx` to verify data consistency (e.g., Jingles have Fabricas, Canciones have Autores)
  - [ ] 6.10 Create `backend/src/server/db/import/csvImporter.ts` utilities for CSV parsing and import
  - [ ] 6.11 Add CSV import endpoint `/api/admin/import/csv` with support for all entity types
  - [ ] 6.12 Create `frontend/src/components/admin/CSVImporter.tsx` interface for uploading and importing CSV files
  - [ ] 6.13 Rebuild `frontend/src/pages/admin/AdminDashboard.tsx` with barebone layout showing entity counts, validation status, and quick actions
  - [ ] 6.14 Update admin CRUD forms to include validation feedback
  - [ ] 6.15 Add bulk actions (delete multiple entities, bulk relationship creation)
  - [ ] 6.16 Test admin workflows: login, validation, CSV import, CRUD operations

- [ ] 7.0 UX Design and Visual Refinement (Look & Feel)

  - [ ] 7.1 Create `frontend/src/styles/theme/design-system.css` with design tokens (colors, typography, spacing, breakpoints)
  - [ ] 7.2 Define color palette (primary, secondary, accent, neutral, semantic colors for success/error/warning)
  - [ ] 7.3 Define typography scale (headings, body, captions, font families)
  - [ ] 7.4 Create component library styles for buttons, cards, inputs, badges, links
  - [ ] 7.5 Design and implement visual styles for Fabrica video player page (player, timeline, metadata panel)
  - [ ] 7.6 Design and implement visual styles for entity detail pages (layout, cards, related entities sections)
  - [ ] 7.7 Design and implement visual styles for search interface (search bar, results page, filters)
  - [ ] 7.8 Design and implement visual styles for Home page (hero section, featured Fabricas grid)
  - [ ] 7.9 Create loading states with skeleton screens or spinners
  - [ ] 7.10 Create error states with helpful messages and actions
  - [ ] 7.11 Add micro-interactions and transitions (hover states, focus states, page transitions)
  - [ ] 7.12 Ensure visual consistency across all public-facing pages
  - [ ] 7.13 Test visual design across different screen sizes
  - [ ] 7.14 Gather feedback and iterate on design

- [ ] 8.0 Responsive Design and Legal Compliance

  - [ ] 8.1 Make Fabrica player page responsive (stacked layout on mobile, side-by-side on desktop)
  - [ ] 8.2 Ensure YouTube player resizes properly on all screen sizes
  - [ ] 8.3 Make Jingle timeline scrollable and touch-friendly on mobile
  - [ ] 8.4 Make all entity detail pages responsive (card grids, flexible layouts)
  - [ ] 8.5 Make search interface responsive (mobile-friendly search bar and results)
  - [ ] 8.6 Make navigation responsive (hamburger menu on mobile if needed)
  - [ ] 8.7 Test touch interactions on mobile devices (tap targets, scrolling, gestures)
  - [ ] 8.8 Test on various devices (iPhone, Android, iPad, different browsers)
  - [ ] 8.9 Translate all UI text to Spanish (Argentina) - buttons, labels, messages, placeholders
  - [ ] 8.10 Create `frontend/src/components/common/LegalDisclaimer.tsx` component with IP rights disclaimer
  - [ ] 8.11 Create `frontend/src/components/layout/Footer.tsx` with legal information and links
  - [ ] 8.12 Add legal disclaimer text referencing Argentinean law (intellectual property, YouTube content usage)
  - [ ] 8.13 Add attribution to "La Fabrica de Jingles" and "Gelatina" streaming station
  - [ ] 8.14 Ensure all legal text is in Spanish and culturally appropriate

- [ ] 9.0 Testing, Polish, and Deployment Preparation
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
