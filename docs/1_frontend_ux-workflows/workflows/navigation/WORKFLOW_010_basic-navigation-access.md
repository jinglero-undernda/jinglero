# WORKFLOW_010: Basic Navigation Access

## Metadata

- **Status**: draft
- **User Experience Category**: Navigation
- **Access Level**: Public
- **Last Updated**: 2025-11-20
- **Last Validated**: not yet validated
- **Code Reference**: `frontend/src/App.tsx:113`, `frontend/src/pages/Home.tsx`
- **Version**: 1.0
- **Workflow Type**: Navigation Flow

## User Intent

A GUEST user arrives at the landing page and needs to understand their navigation options to access different parts of the application, including authentication, content discovery, search functionality, and entity inspection.

## Overview

- **Purpose**: Define the basic navigation access points available to GUEST users from the landing page, establishing the entry point for all user journeys
- **User Persona**: GUEST user - a visitor to the site who has not yet authenticated. They may be exploring content, searching for specific entities, or looking to access admin functionality. They have no special permissions and can only access public-facing features.
- **User Context**: User navigates to the application root URL and lands on the landing page. This is the primary entry point for all users before authentication or content exploration.
- **Success Criteria**:
  - User can clearly see all available navigation options from the landing page
  - User can successfully navigate to Login sequence
  - User can interact with featured content (Fabrica display)
  - User can navigate to featured entities
  - User can access simple global search
  - User can navigate to Advanced Search page
- **Related Components**:
  - `frontend/src/pages/Home.tsx` (Landing Page - to be designed)
  - `frontend/src/App.tsx:113` (Route definition)
- **Dependencies**:
  - WORKFLOW_009: Admin Authentication (for Login sequence)
  - WORKFLOW_005: Landing Page (for landing page design details)
  - WORKFLOW_006: Search and Discovery (for search functionality)
  - WORKFLOW_007: Fabrica Viewing (for Fabrica interaction)
  - WORKFLOW_008: Entity Inspection (for entity page navigation)

## Flow Diagram

See `WORKFLOW_010_basic-navigation-access_diagram.md` for the complete Mermaid flowchart and state diagram.

**Key Navigation Paths**:

- Landing Page → Login Page
- Landing Page → Featured Fabrica Interaction
- Landing Page → Featured Entity Inspection
- Landing Page → Global Search (entity list) → Entity Inspection
- Landing Page → Advanced Search Page → Search Results Page

## UX Flow

### Step 1: User Arrives at Landing Page

**User Action**: User navigates to root URL (`/`)

**System Response**:

- Display landing page with navigation options
- Show featured Fabrica (if available)
- Display featured entities section
- Show global search interface
- Display navigation to Advanced Search

**UI State**:

- Route: `/`
- Page: Landing Page (see PAGES_REFERENCE.md)
- User Role: GUEST
- Authentication Status: Not authenticated

**Data Changes**: None (initial page load)

**Code Reference**: `frontend/src/App.tsx:113`, `frontend/src/pages/Home.tsx`

**Note**: Landing page layout is still to be designed. This workflow documents the TARGET navigation structure.

### Step 2: Navigate to Login Sequence

**User Action**: User clicks on Login/Authentication link/button

**System Response**:

- Navigate to authentication flow
- User can proceed to become USER or ADMIN

**UI State**:

- Route: `/admin/login` (or designated login route)
- Page: Login Page (see PAGES_REFERENCE.md)
- User Role: GUEST → transitioning to USER/ADMIN

**Data Changes**: None (navigation only)

**Code Reference**: `frontend/src/pages/AdminPage.tsx:36` (current admin login route)

**Related Workflow**: WORKFLOW_009: Admin Authentication

### Step 3: Interact with Featured Fabrica

**User Action**: User interacts with the featured Fabrica displayed on landing page

**System Response**:

- Display Fabrica information
- Allow user to play/view Fabrica
- Provide navigation to full Fabrica page

**UI State**:

- Page: Landing Page (with Fabrica interaction)
- User Role: GUEST

**Data Changes**: None (interaction only, may load Fabrica data if not preloaded)

**Code Reference**: `frontend/src/pages/Home.tsx` (to be implemented)

**Related Workflow**: WORKFLOW_007: Fabrica Viewing

**Note**: Exact interaction pattern depends on landing page design (embedded player, preview, link, etc.)

### Step 4: Navigate to Featured Entity

**User Action**: User clicks on a featured entity from the featured entities section

**System Response**:

- Navigate to entity inspection page
- Display entity details based on entity type

**UI State**:

- Route: `/j/:jingleId` | `/c/:cancionId` | `/f/:fabricaId` | `/a/:artistaId` | `/t/:tematicaId`
- Page: Entity Inspection Page (see PAGES_REFERENCE.md)
- User Role: GUEST

**Data Changes**: None (navigation only)

**Code Reference**:

- `frontend/src/App.tsx:117-121` (entity inspection routes)
- `frontend/src/pages/inspect/InspectJingle.tsx`
- `frontend/src/pages/inspect/InspectCancion.tsx`
- `frontend/src/pages/inspect/InspectFabrica.tsx`
- `frontend/src/pages/inspect/InspectArtista.tsx`
- `frontend/src/pages/inspect/InspectTematica.tsx`

**Related Workflow**: WORKFLOW_008: Entity Inspection

### Step 5: Use Global Search

**User Action**: User enters search query in global search interface on landing page

**System Response**:

- Process search query
- Display list of matching entities (inline on landing page or dropdown)
- User selects an entity from the list

**UI State**:

- Route: `/` (stays on landing page during search)
- Page: Landing Page (with search results list displayed)
- User Role: GUEST

**Data Changes**: Search query processed, entity list loaded

**Code Reference**:

- `frontend/src/pages/Home.tsx` (to be implemented - global search component)

**Related Workflow**: WORKFLOW_006: Search and Discovery

**Note**: Global search displays matching entities directly on the landing page. User selects an entity to navigate to its inspection page. The Search Results Page (`/search`) is a separate detailed functional process and not part of this basic navigation flow.

### Step 5a: Select Entity from Global Search Results

**User Action**: User clicks on an entity from the search results list displayed on landing page

**System Response**:

- Navigate to entity inspection page
- Display entity details based on entity type

**UI State**:

- Route: `/j/:jingleId` | `/c/:cancionId` | `/f/:fabricaId` | `/a/:artistaId` | `/t/:tematicaId`
- Page: Entity Inspection Page (see PAGES_REFERENCE.md)
- User Role: GUEST

**Data Changes**: None (navigation only)

**Code Reference**:

- `frontend/src/App.tsx:117-121` (entity inspection routes)
- `frontend/src/pages/inspect/InspectJingle.tsx`
- `frontend/src/pages/inspect/InspectCancion.tsx`
- `frontend/src/pages/inspect/InspectFabrica.tsx`
- `frontend/src/pages/inspect/InspectArtista.tsx`
- `frontend/src/pages/inspect/InspectTematica.tsx`

**Related Workflow**: WORKFLOW_008: Entity Inspection

### Step 6: Navigate to Advanced Search Page

**User Action**: User clicks link/button to access Advanced Search

**System Response**:

- Navigate to dedicated Advanced Search page
- Display advanced search interface with filters and options

**UI State**:

- Route: `/search/advanced` (or designated advanced search route)
- Page: Advanced Search Page (see PAGES_REFERENCE.md)
- User Role: GUEST

**Data Changes**: None (navigation only)

**Code Reference**: To be implemented (advanced search route and component)

**Related Workflow**: WORKFLOW_006: Search and Discovery

**Note**: Advanced Search page is a dedicated page with more sophisticated search options compared to the simple global search.

## Edge Cases

### Edge Case 1: No Featured Content Available

**Trigger**: No Fabrica or featured entities available to display

**Expected Behavior**:

- Landing page should gracefully handle empty state
- Show placeholder or message indicating no featured content
- Other navigation options (Login, Search) remain available

**Code Reference**: `frontend/src/pages/Home.tsx` (to be implemented)

### Edge Case 2: User Already Authenticated

**Trigger**: GUEST user who is already authenticated (e.g., returning user with valid session)

**Expected Behavior**:

- Landing page may show different navigation options
- Login link may change to show user status or logout option
- May redirect to appropriate page based on user role

**Code Reference**: `frontend/src/pages/Home.tsx` (to be implemented), `frontend/src/App.tsx:19-100` (AdminLink component shows authentication-aware navigation)

### Edge Case 3: Invalid Entity ID in Featured Entities

**Trigger**: Featured entity list contains invalid or deleted entity ID

**Expected Behavior**:

- Navigation attempt should handle error gracefully
- Show error message or 404 page
- Do not break landing page experience

**Code Reference**: Entity inspection pages (error handling to be verified)

### Edge Case 4: Empty Search Query

**Trigger**: User submits empty search query from global search

**Expected Behavior**:

- Either prevent submission or show empty search results list on landing page
- Show appropriate message or search interface
- User remains on landing page

**Code Reference**: `frontend/src/pages/Home.tsx` (to be implemented - global search component)

## Technical Implementation

### State Management

**State Variables**:

- Route state: Managed by React Router (`BrowserRouter`)
- User authentication state: Checked via `adminApi.getAuthStatus()` - `frontend/src/App.tsx:26`
- Featured content state: To be implemented in `Home.tsx`

**State Transitions**:

- `/` (Landing) → `/admin/login` (Login)
- `/` (Landing) → `/j/:id` | `/c/:id` | `/f/:id` | `/a/:id` | `/t/:id` (Entity Inspection - from featured entities)
- `/` (Landing) → `/` (Landing with search results list) → `/j/:id` | `/c/:id` | `/f/:id` | `/a/:id` | `/t/:id` (Entity Inspection - from global search)
- `/` (Landing) → `/search/advanced` (Advanced Search) → `/search` (Search Results Page)

### API Integration

**Endpoints Used**:

- Authentication status: `GET /api/admin/auth/status` - `frontend/src/lib/api/client.ts` (via `adminApi.getAuthStatus()`)
- Featured content: To be determined (may require API endpoints for featured Fabrica and entities)
- Search: To be determined (search API endpoints)

**Data Flow**:

1. Landing page loads
2. Check authentication status (if needed for conditional display)
3. Load featured content (Fabrica, entities) - if applicable
4. User selects navigation option
5. Navigate to target route

### Components

**Component Responsibilities**:

- `Home.tsx`: Landing page component - displays navigation options, featured content, search interface - `frontend/src/pages/Home.tsx`
- `App.tsx`: Route configuration and navigation structure - `frontend/src/App.tsx:103-127`
- `AdminLink`: Authentication-aware navigation link - `frontend/src/App.tsx:19-101`

## Validation Checklist

[See PLAYBOOK_02 for validation - create placeholder here]

- [ ] Landing page displays all navigation options
- [ ] Login navigation works correctly
- [ ] Featured Fabrica interaction works
- [ ] Featured entities navigation works
- [ ] Global search navigation works
- [ ] Advanced Search navigation works
- [ ] Empty states handled gracefully
- [ ] Authentication-aware navigation displays correctly

## Related Workflows

- WORKFLOW_005: Landing Page (detailed landing page design)
- WORKFLOW_006: Search and Discovery (search functionality details)
- WORKFLOW_007: Fabrica Viewing (Fabrica interaction details)
- WORKFLOW_008: Entity Inspection (entity page details)
- WORKFLOW_009: Admin Authentication (login sequence details)
- WORKFLOW_004: Navigation with Unsaved Changes (navigation handling)

## Page References

For consistent page naming across workflows, see `PAGES_REFERENCE.md`.

Key pages in this workflow:

- **Landing Page**: Entry point at `/`
- **Login Page**: Authentication entry point
- **Entity Inspection Page**: Individual entity detail pages
- **Search Results Page**: Search query results display
- **Advanced Search Page**: Dedicated advanced search interface

## Change History

| Version | Date       | Change                | Author | Rationale                |
| ------- | ---------- | --------------------- | ------ | ------------------------ |
| 1.0     | 2025-01-20 | Initial documentation | -      | Baseline TARGET workflow |
