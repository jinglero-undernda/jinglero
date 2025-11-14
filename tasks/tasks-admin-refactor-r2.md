# Admin Portal Refactoring - Implementation Task List

**Based on:** `docs/adminRefactor/adminDetailedSpecification_R2.md`  
**Document Version:** 2.0  
**Date:** November 14, 2025  
**Status:** Ready for Implementation

## Overview

This task list breaks down the Admin Portal refactoring specification into actionable implementation tasks organized into independent sprint blocks. Each sprint can be completed independently, with clear deliverables and success criteria.

## Relevant Files

### Database Schema Files (Sprint 1 - Foundation)

- `backend/src/server/db/schema/schema.ts` - Schema documentation
- `backend/src/server/db/schema/setup.ts` - Database constraints and indexes setup
- `backend/src/server/db/import/neo4j_importer_model.json` - Import model definitions

### Frontend Components (Sprints 2-3)

- `frontend/src/pages/admin/AdminEntityAnalyze.tsx` - Main unified entity detail page that needs relationship refresh functionality
- `frontend/src/components/common/RelatedEntities.tsx` - Core relationship management component requiring refresh() method and unsaved changes tracking
- `frontend/src/components/admin/EntityMetadataEditor.tsx` - Metadata editing component that needs validation improvements
- `frontend/src/components/admin/UnsavedChangesModal.tsx` - Modal for handling unsaved changes navigation
- `frontend/src/pages/admin/AdminDashboard.tsx` - Dashboard with entity creation forms
- `frontend/src/components/admin/EntityForm.tsx` - Entity creation/edit form component
- `frontend/src/components/common/EntityCard.tsx` - Entity display component needing Artista display logic updates
- `frontend/src/lib/utils/relationshipConfigs.ts` - Relationship configuration definitions
- `frontend/src/lib/api/client.ts` - API client for admin endpoints

### Backend API Files (Sprints 2-3)

- `backend/src/server/api/admin/` - Backend API routes for admin operations
- `backend/src/server/api/search.ts` - Search API endpoint (needs enhancement)
- `backend/src/server/middleware/errorHandler.ts` - Error handling middleware

### Notes

- Unit tests should be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- All new components should follow existing TypeScript patterns and component structure.
- Error handling should use the new standardized components once created.

## Tasks

### Sprint 1: Database Schema Updates (Foundation - Week 1)

**Goal:** Update database constraints and schema to match specification. This must be done first as it affects validation logic, required fields, and component behavior.

- [ ] 1.0 Update Database Schema and Constraints
  - [ ] 1.1 Remove NOT NULL constraint for Jingle.timestamp (timestamp is derived from relationship, not always present on node)
  - [ ] 1.2 Remove NOT NULL constraint for Artista.name (at least one of name OR stageName required instead)
  - [ ] 1.3 Add custom constraint logic for Artista: require at least one of `name` OR `stageName` (implement as validation check since Neo4j doesn't support OR constraints natively)
  - [ ] 1.4 Update schema documentation in `backend/src/server/db/schema/schema.ts` to reflect that Jingle boolean fields (isJinglazo, isJinglazoDelDia, isPrecario) are optional
  - [ ] 1.5 Update schema documentation to reflect that Artista.isArg is auto-managed from nationality and not required
  - [ ] 1.6 Add `status` property to Jingle, Cancion, Artista, Tematica entities (default: 'DRAFT', values: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED)
  - [ ] 1.7 Ensure all relationships (except SOY_YO and REACCIONA_A) have `status` and `createdAt` properties standardized
  - [ ] 1.8 Update `backend/src/server/db/schema/setup.ts` to remove dropped constraints and add new constraint logic
  - [ ] 1.9 Create migration script or update procedure to add `status` field to existing entities (default to 'DRAFT')
  - [ ] 1.10 Update `backend/src/server/db/import/neo4j_importer_model.json` to reflect schema changes
  - [ ] 1.11 Test schema changes with existing data to ensure backward compatibility
  - [ ] 1.12 Update backend API validation to match new schema constraints (especially Artista name/stageName OR requirement)

### Sprint 2: Critical Fixes (Priority 1 - Week 2)

**Goal:** Fix broken functionality, improve stability, establish foundation for consistency. Builds on updated schema constraints.

- [ ] 2.0 Implement Relationship Visibility Fix

  - [ ] 2.1 Add `refresh()` method to RelatedEntities component that re-fetches all relationships
  - [ ] 2.2 Expose `refresh()` method via `useImperativeHandle` ref in RelatedEntities
  - [ ] 2.3 Update RelatedEntities TypeScript interface to include refresh method in ref type
  - [ ] 2.4 Call `relatedEntitiesRef.current.refresh()` in AdminEntityAnalyze after relationship creation
  - [ ] 2.5 Call `refresh()` after relationship deletion in AdminEntityAnalyze
  - [ ] 2.6 Call `refresh()` after relationship property updates in AdminEntityAnalyze
  - [ ] 2.7 Call `refresh()` when navigating back from entity creation with relationship context
  - [ ] 2.8 Test that new relationships appear immediately after creation
  - [ ] 2.9 Test that deleted relationships disappear immediately
  - [ ] 2.10 Test that updated relationship properties reflect immediately

- [ ] 3.0 Standardize Error Handling and Notifications

  - [ ] 3.1 Create `frontend/src/components/common/Toast.tsx` component with auto-dismiss, stackable notifications
  - [ ] 3.2 Create `frontend/src/components/common/ToastContext.tsx` for global toast state management
  - [ ] 3.3 Create `frontend/src/components/common/ErrorDisplay.tsx` component for field-level and form-level errors
  - [ ] 3.4 Implement toast notification system with success, error, warning, and info variants
  - [ ] 3.5 Standardize error message format from API (ensure consistent structure)
  - [ ] 3.6 Update EntityMetadataEditor to use Toast for non-critical errors
  - [ ] 3.7 Update RelatedEntities to use Toast for relationship operation errors
  - [ ] 3.8 Update EntityForm to use Toast and ErrorDisplay components
  - [ ] 3.9 Update AdminDashboard to use Toast for creation errors
  - [ ] 3.10 Update all admin API calls to use Toast for network errors
  - [ ] 3.11 Implement retry logic for transient network failures with exponential backoff
  - [ ] 3.12 Add offline mode detection and user-friendly error messages
  - [ ] 3.13 Test error display for API errors, validation errors, network errors, and critical errors

- [ ] 4.0 Improve Input Validation and Field-Level Feedback

  - [ ] 4.1 Add required field validation to EntityMetadataEditor for all entity types
  - [ ] 4.2 Add format validation for YouTube Video ID (Fabrica.id): 11 chars, alphanumeric + `-` and `_`
  - [ ] 4.3 Add URL format validation for youtubeUrl, youtubeClipUrl, youtubeMusic, lyrics, website fields
  - [ ] 4.4 Add year range validation for Cancion.year (1900 to current year)
  - [ ] 4.5 Add social media handle validation (no @ prefix) for youtubeHandle, instagramHandle, twitterHandle
  - [ ] 4.6 Add email format validation for Usuario.email
  - [ ] 4.7 Add cross-field validation: warn if Jingle.isJinglazoDelDia is true but isJinglazo is false
  - [ ] 4.8 Add validation: Artista requires at least one of name OR stageName
  - [ ] 4.9 Highlight invalid fields with red border and display error message below field
  - [ ] 4.10 Prevent form submission when validation errors exist
  - [ ] 4.11 Add field-level validation on blur event
  - [ ] 4.12 Add form-level validation on submit
  - [ ] 4.13 Display server-side validation errors on specific fields after API response
  - [ ] 4.14 Test validation for all entity types and all validation rules

- [ ] 5.0 Fix Navigation and Edit Mode Behavior
  - [ ] 5.1 Update AdminEntityAnalyze to always start in view mode (isEditing = false by default)
  - [ ] 5.2 Ensure EntityMetadataEditor starts in view mode when isEditing prop is false
  - [ ] 5.3 Ensure RelatedEntities blank rows only appear when isEditing={true}
  - [ ] 5.4 Implement `hasUnsavedChanges()` method in RelatedEntities to track relationship changes
  - [ ] 5.5 Update UnsavedChangesModal to check both metadata changes (via metadataEditorRef) and relationship changes (via relatedEntitiesRef)
  - [ ] 5.6 Intercept React Router navigation with unsaved changes check using `useBlocker` or similar
  - [ ] 5.7 Add `beforeunload` event listener to intercept browser back button with unsaved changes
  - [ ] 5.8 Update navigation to related entities to check for unsaved changes before navigating
  - [ ] 5.9 Implement "Discard", "Save", and "Cancel" actions in UnsavedChangesModal
  - [ ] 5.10 Test that page always loads in view mode
  - [ ] 5.11 Test that edit mode activates only on explicit "Editar" button click
  - [ ] 5.12 Test that unsaved changes modal appears on navigation with changes
  - [ ] 5.13 Test that browser back button triggers unsaved changes check

### Sprint 3: Consistency and UX Improvements (Priority 2 - Weeks 3-4)

**Goal:** Make UX consistent across all entities, unify patterns

- [ ] 6.0 Create Unified Search/Autocomplete Component

  - [ ] 6.1 Create `frontend/src/components/admin/EntitySearchAutocomplete.tsx` component
  - [ ] 6.2 Implement debounced search input (300ms delay)
  - [ ] 6.3 Add minimum 2 characters before triggering search
  - [ ] 6.4 Implement keyboard navigation (arrow keys, enter to select, escape to close)
  - [ ] 6.5 Display top 10 results per entity type in dropdown
  - [ ] 6.6 Use consistent entity icons from EntityCard component
  - [ ] 6.7 Format display: [Entity Type Icon] {primary field} with {secondary field if available}
  - [ ] 6.8 Enhance `backend/src/server/api/search.ts` to support type filtering and return consistent format
  - [ ] 6.9 Update RelatedEntities blank rows to use EntitySearchAutocomplete instead of current search
  - [ ] 6.10 Update AdminHome to optionally use EntitySearchAutocomplete for entity selection
  - [ ] 6.11 Show "+" button in autocomplete when no results found (for entity creation)
  - [ ] 6.12 Test autocomplete with all entity types (Fabrica, Jingle, Cancion, Artista, Tematica)
  - [ ] 6.13 Test search performance with large datasets

- [ ] 7.0 Standardize Entity Creation Flow

  - [ ] 7.1 Update AdminDashboard to handle creation context via URL parameters: `?create={type}&fromType={type}&fromId={id}&relType={relType}&searchText={query}`
  - [ ] 7.2 Pre-populate entity fields from searchText parameter (title for Fabrica/Jingle/Cancion, name for Artista/Tematica)
  - [ ] 7.3 Auto-create relationship after entity creation when context parameters provided
  - [ ] 7.4 Determine relationship direction (start/end nodes) based on relationship type and creation context
  - [ ] 7.5 Navigate back to source entity after creation with relationship context
  - [ ] 7.6 Call RelatedEntities.refresh() after navigation back to show new relationship
  - [ ] 7.7 Handle relationship creation errors gracefully (toast notification, navigate to source entity)
  - [ ] 7.8 Update RelatedEntities "+" button to navigate with full context parameters
  - [ ] 7.9 Add "New" button to AdminEntityList pages that navigates to Dashboard with creation context
  - [ ] 7.10 Document entity creation flow clearly in code comments
  - [ ] 7.11 Test entity creation from Dashboard with and without relationship context
  - [ ] 7.12 Test entity creation from blank row in RelatedEntities
  - [ ] 7.13 Test entity creation from EntityList "New" button

- [ ] 8.0 Implement Field Configuration System with Shared Validation

  - [ ] 8.1 Install Zod validation library: `npm install zod`
  - [ ] 8.2 Create `frontend/src/lib/validation/schemas.ts` with Zod schemas for all entity types
  - [ ] 8.3 Create `frontend/src/lib/config/fieldConfigs.ts` with field ordering, excluded fields, field options per entity type
  - [ ] 8.4 Define FIELD_ORDER configuration for each entity type (Fabrica, Jingle, Cancion, Artista, Tematica)
  - [ ] 8.5 Define EXCLUDED_FIELDS configuration (auto-managed and redundant fields)
  - [ ] 8.6 Define FIELD_OPTIONS configuration (dropdown options for status, category, nationality)
  - [ ] 8.7 Define TEXTAREA_FIELDS configuration (multi-line text fields)
  - [ ] 8.8 Update EntityMetadataEditor to use fieldConfigs for field ordering and display
  - [ ] 8.9 Update EntityMetadataEditor to use Zod schemas for validation
  - [ ] 8.10 Update EntityForm to use same fieldConfigs and Zod schemas
  - [ ] 8.11 Create backend validation utilities that use same validation rules (convert Zod schemas or share logic)
  - [ ] 8.12 Ensure frontend and backend validation rules match exactly
  - [ ] 8.13 Test validation consistency between frontend and backend for all entity types

- [ ] 9.0 Enhance Edit Mode and Relationship Management

  - [ ] 9.1 Ensure blank rows in RelatedEntities only appear when isEditing={true}
  - [ ] 9.2 Hide blank row for Jingle→Fabrica relationship when relationship exists (max cardinality 1)
  - [ ] 9.3 Hide blank row for Jingle→Cancion relationship when relationship exists (max cardinality 1)
  - [ ] 9.4 Mark Autor relationship in Jingle context as read-only (derived from Cancion→AUTOR_DE→Artista)
  - [ ] 9.5 Implement delete buttons for existing relationships in RelatedEntities admin mode
  - [ ] 9.6 Add relationship property editing with inline save/cancel per relationship
  - [ ] 9.7 Track relationship property changes for unsaved changes warning
  - [ ] 9.8 Update RelatedEntities.hasUnsavedChanges() to include relationship property edits
  - [ ] 9.9 Ensure relationship changes trigger global save state (activate Save/Cancel buttons in EntityCard)
  - [ ] 9.10 Test edit mode behavior: blank rows appear/disappear correctly
  - [ ] 9.11 Test relationship deletion and property editing
  - [ ] 9.12 Test unsaved changes tracking for relationship modifications

- [ ] 10.0 Update Entity Display Logic and Date Picker
  - [ ] 10.1 Update EntityCard to display Artista with stageName as primary text (if present), name as secondary
  - [ ] 10.2 Update EntityCard to show name as primary if stageName is empty
  - [ ] 10.3 Update all Artista sorting to use stageName first, fallback to name
  - [ ] 10.4 Install date picker library (e.g., `react-datepicker` or `@mui/x-date-pickers`)
  - [ ] 10.5 Create date picker component wrapper with dark mode styling
  - [ ] 10.6 Replace Fabrica day/month/year inputs with date picker in EntityMetadataEditor
  - [ ] 10.7 Format date display as dd/mm/yyyy for all entities
  - [ ] 10.8 Ensure date picker uses ISO datetime string internally
  - [ ] 10.9 Add date validation (reasonable range: 2000 to current+1 year)
  - [ ] 10.10 Keep Cancion.year as numeric input (not date picker) per specification
  - [ ] 10.11 Test date picker with Fabrica creation and editing
  - [ ] 10.12 Test Artista display logic in all contexts (EntityCard, RelatedEntities, search results)
  - [ ] 10.13 Verify consistent date formatting across all entity detail pages
