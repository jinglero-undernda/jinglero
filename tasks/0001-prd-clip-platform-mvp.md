# Product Requirements Document: "La Usina de la Fabrica de Jingles"

## Introduction/Overview

This platform provides a curated interface for accessing and analyzing specific YouTube clips ("Fabricas") from the show "La Fabrica de Jingles" by the streaming station Gelatina. Each video features several songs ("Jingles"), which are versions of known songs ("Canciones", by "Autor"). The Jingles are submitted by show audience, usually referred to as "Jingleros" (within our platform the both the Autor and the Jinglero information is store under the "Artistas" category). Each Jingle will be tagged with one or more Topics ("Tematicas") that are addressed in the Jingle.
The system provides an in-app reproduction of the videoclip from YouTube, while dynamically showing the information associated to the current song, that automatically changes when the user is reproducing another segment of the video. The user can interact with this content, opening panels to search for other instances matching some property (like other Jingles featuring the same song, or submitted by the same Jinglero, and provides a link to them).

This PRD is focusing on the MVP version of the platform.
The platform will utilize React for the frontend, Neo4j for the knowledge database, with initial local development and potential later deployment.

## MVP Scope and Data Scale

### Dataset Size

- **50-85 Fabricas** (complete video episodes)
- **1,300 Jingles** (individual performances with timestamps)
- **800 Canciones** (original songs)
- **1,000 Artistas** (performers and original artists)
- **500 Tematicas** (themes and topics)

**Note:** Sample dataset can start at ~5% of the full catalog for initial development and testing.

### MVP Deployment Target

- **Local development environment** for MVP
- Limited beta testing with target audience
- Future deployment to production hosting (Render/Vercel) post-MVP

### Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js/Express with TypeScript
- **Database**: Neo4j (AuraDB cloud or local instance)
- **Video**: YouTube embed API

## Goals

1. Create a Knowledge Database of the Fabricas, Jingles, Canciones, Artistas and Tematicas, with several relationships that will be exploited during the User Experience.
2. **Core MVP Goal**: Create a user experience to watch a YouTube video (from La Fabrica de Jingles) while accessing detailed information of the Jingle being displayed.
3. **Core MVP Goal**: Create an interface to search the Knowledge database, including predictive completion.
4. **Core MVP Goal**: Facilitate easy navigation and discovery of related content via the Knowledge Database relationships.
5. Create a responsive web interface accessible across devices.
6. Enable basic admin content curation workflow.

## MVP Core Features

The absolute minimum features required to launch the MVP:

### 1. Fabrica Video Player with Dynamic Jingle Metadata (CORE)

- Full YouTube video playback
- Real-time Jingle metadata display that updates as video plays
- Clickable timestamp navigation to each Jingle
- Related entity links (Jinglero, Cancion, Autor, Tematicas)

### 2. Global Search with Autocomplete (CORE)

- Single search box across all entity types (Jingles, Canciones, Artistas, Tematicas)
- Autocomplete suggestions starting at 3+ characters
- Grouped results by entity type
- Links to detail pages

**Current Status:** Backend search API and SearchBar component with autocomplete are implemented. Search results page, Home page integration, and navigation to search results are pending future implementation.

### 3. Entity Detail Pages (CORE)

- **Jingle page**: Show single Jingle details with links to Fabrica (timestamp), Cancion, Jinglero, Autor, and Tematicas
- **Cancion page**: Show Autor and Jingles using that song with Fabrica links
- **Artista page**: Show their Jingles and/or Canciones
- **Tematica page**: Show Jingles tagged with that theme
- Navigation between related entities

### 4. Admin Content Management (CORE)

- Basic CRUD interface for all entity types (Fabrica, Jingle, Cancion, Artista, Tematica) and relationships
- CSV import for initial data seeding
- Password-protected admin route

**Current Status:** Basic Admin CRUD pages and forms exist (`AdminJingle`, `AdminFabrica`, `AdminArtista`, `AdminCancion`, `AdminTematica`, `AdminHome`, `AdminEntityAnalyze` with `EntityForm`, `EntityList`, `RelationshipForm`). Password protection, validation tools, and CSV import are pending future implementation. The rebuild will leverage `RelatedEntities` component in Admin mode (already supports `isAdmin` prop).

### MVP Success Criteria

- User can search for content and find it
- User can watch a Fabrica video and see current Jingle info automatically
- User can navigate between related content (for example Jingle → Jinglero → their other Jingles)
- Admin can add/edit/import content successfully

## User Stories

### Listening Experience

- As a user, I want to view / listen to the streaming show, while detailed information of the current Jingle is being dynamically displayed.
- As a user, I want to expand or collapse the blocks of information being displayed. (Implemented in Entity detail pages; timeline rows in Show page are expandable; active metadata panel expand/collapse may be added in future iteration)
- As a user, I want to skip forward or back to the time-stamps where a Jingle starts.
- As a user, I want to be able to jump to another Jingle or Cancion that I have discivered in the dynamic information display. (Note: Navigation to related entity pages from Show page metadata is Post-MVP; skip navigation within video is MVP)

### Content Curation and Discovery

- As the platform administrator, I want to manage the Knowledge Database to maintain platform quality.
- As a user, I want to search for Jingles by Title, Jinglero, Cancion, Artista or Tematica.

## Functional Requirements

### General Layout

1. Present all user interface elements in Spanish (Argentina) - Ongoing task; language review planned for later MVP stages
2. Include disclaimers on Intellectual Property rights and ties to actual people - use Argentinean legal references. (Pending - LegalDisclaimer and Footer components to be created)

### Authentication System

3. For MVP product, the website will have read-only capabilities for users, with a dedicated route and password-protected Administrator access.
4. Implement basic password-protected admin route (no user registration/login for MVP)

### Knowledge Database Management

5. Store metadata from the documented DB Schema (src/server/db/schema)
6. **MVP Critical**: Enable manual creation and editing of Knowledge Database entries by Administrator in a simple CRUD interface.
7. **MVP Critical**: Enable bulk import of Database elements via CSV files (initial seed)
8. **Post-MVP**: Bulk export/update capabilities
9. **Post-MVP**: "Frown" feedback button for database errors

### Search and Navigation - MVP Critical

10. Implement search functionality with a single search box that looks across:
    - Jingle titles
    - Canciones
    - Artistas (both Jinglero and Autor)
    - Tematicas
11. **MVP Critical**: Provide auto-complete suggestions in search field (3+ characters, debounced)
12. Display search results in an organized grid/list view grouped by entity type
13. **Post-MVP**: Advanced search facets and filters
14. **Post-MVP**: Search result sharing via URL parameters

### Entity Detail Pages - MVP Critical

**Jingle Detail Page:**
15a. Display Jingle metadata (title, timestamp, Jinglero, Cancion, Autor, Tematicas)
15b. Link to parent Fabrica with deep-link to timestamp
15c. Link to Cancion with list of other Jingles using it
15d. Link to Jinglero's other Jingles
15e. Link to related Tematicas

**Cancion Detail Page:**

19. Display Cancion metadata with related entities (Note: Direct YouTube video playback is not required for Cancion detail page; video playback is on Fabrica/Show page)
20. Display list of Jingles that use this Cancion, with links to Fabrica + timestamp
21. Display list of other Canciones by the same Autor (if available)
22. **Post-MVP**: Cancion sharing functionality

**Fabrica Detail Page (Show/Video Player) - MVP CORE FEATURE:** 24. **MVP Critical**: Enable full YouTube video playback on the platform 25. **MVP Critical**: Video player loads with thumbnail visible; buffering occurs only when user initiates play (autoplay=false by default) 26. **MVP Critical**: Display Jingles in a timeline layout with three scrollable sections: past Jingles (collapsed rows above), current Jingle (player + metadata panel in center, fixed position to prevent reload), and future Jingles (collapsed rows below). Metadata updates based on current playback time. 27. **MVP Critical**: Allow users to skip directly to Jingle timestamps (forward/backward navigation within video) 28. **MVP Critical**: Display active Jingle metadata: - Titulo del Jingle - Jinglero name - Cancion title - Autor name - Tematicas (Note: Navigation links to related entity pages are not required for MVP; skip navigation within video is the primary navigation mechanism) 29. **Post-MVP**: Expandable metadata panels showing related content 30. **Post-MVP**: Navigation links to related entity pages (Jinglero, Cancion, Autor, Tematica detail pages) 31. **Post-MVP**: Direct Jingle sharing with timestamp deep-links

**Artista Detail Page:**

32. Display Artista metadata with related entities
33. Display Jinglero's Jingles with links to Fabricas
34. Display Autor's Canciones with links to related Jingles
35. **Post-MVP**: User verification and claiming functionality

**Tematica Page:**

36. Display Tematica metadata with related entities
37. Display Jingles tagged with this Tematica
38. Show Tematica category and description

**Fabrica Detail Page (Entity View):**

39. Display Fabrica metadata with related entities (Note: This is separate from the Show/Video Player page; entity detail page shows relationships, while `/show/:fabricaId` is the video player experience)
40. Display list of Jingles in this Fabrica with links to timestamps

**Note:** All entity detail pages (Jingle, Cancion, Artista, Tematica, Fabrica) are implemented using `EntityCard` and `RelatedEntities` components. Pages are currently named `Inspect*.tsx` in `frontend/src/pages/inspect/` folder. Renaming to `*Page.tsx` for consistency is recommended but non-blocking. More thorough testing of navigation between related entities is needed once the database is more complete.

### Navigation and Relationships - MVP Critical

36. **MVP Critical**: Implement "related entities" queries for content discovery
37. Enable navigation between related entities (Jingle → Cancion, Jingle → Jinglero, etc.)
38. **Post-MVP**: Advanced relationship visualization

### Analytics Dashboard - Post-MVP

39. **Post-MVP**: Search term analytics
40. **Post-MVP**: Click/link analytics
41. **Post-MVP**: Video view analytics

## Non-Goals (Out of Scope for MVP)

### MVP Scope Boundaries

- **Automated clip discovery and database updates** - All content must be manually curated
- **User registration or login system** - Site is read-only for public, admin is password-protected only
- **User reactions or commenting system** - No user interaction beyond viewing content
- **Playlist creation** - No user-created collections
- **Subscriber user levels** - All visitors have same access
- **OAuth authentication** - Simple password auth for admin only
- **Mobile app development** - Responsive web only
- **Analytics dashboard** - Basic logging only, no UI dashboard
- **Advanced search filters** - Basic global search only
- **Content sharing with URL parameters** - Basic linking only
- **Expandable metadata panels** - Static display only
- **User verification and claiming** (Usuario-SOY_YO) - Not in MVP
- **Reaction tracking** (Usuario-REACCIONA_A) - Not in MVP

### Intentionally Postponed for Future Releases

These features are planned but explicitly outside MVP scope:

- User-generated content (reactions, comments, playlists)
- Automated data ingestion from YouTube
- Advanced analytics and reporting
- Content moderation tools
- Multiple user roles and permissions
- Mobile native apps

## Implementation Phases

### Phase 1: MVP Core - Data Foundation (Weeks 1-2)

**Goal**: Establish working Knowledge Database with seeded content

- [ ] Database schema setup with all required constraints and indexes
- [ ] Implement Neo4j-based backend API
- [ ] Create seed data migration from CSV files
- [ ] Verify data integrity and relationships
- [ ] Basic CRUD API endpoints for all entity types

### Phase 2: MVP Core - Search and Discovery (Weeks 2-3)

**Goal**: Enable users to find content

- [ ] Implement global search endpoint (`/api/search`)
- [ ] Create search autocomplete functionality (3+ chars)
- [ ] Build frontend search bar with autocomplete dropdown
- [ ] Implement search results page with grouped entity display
- [ ] Add navigation links from search results to detail pages

### Phase 3: MVP Core - Video Player Experience (Weeks 3-4)

**Goal**: Deliver the core Fabrica viewing experience

- [ ] Integrate YouTube embed player
- [ ] Implement timestamp extraction and display of Jingles
- [ ] Create real-time UI updates based on playback position
- [ ] Build clickable Jingle list with skip-to-timestamp functionality
- [ ] Display active Jingle metadata panel (Jinglero, Cancion, Autor, Tematicas)
- [ ] Implement related entity links (navigate to related Jingleros, Canciones)

### Phase 4: MVP Core - Entity Detail Pages (Weeks 4-5)

**Goal**: Enable deep exploration of related content

- [ ] Build Jingle detail page with metadata and navigation links
- [ ] Build Cancion detail page with Jingles list
- [ ] Build Artista detail page with Jingles/Canciones
- [ ] Build Tematica detail page with Jingles list
- [ ] Implement "related entities" API queries
- [ ] Add navigation breadcrumbs and related content sections

### Phase 5: MVP Core - Admin Interface (Weeks 5-6)

**Goal**: Enable content curation

- [ ] Create password-protected admin route
- [ ] Build basic CRUD forms for each entity type
- [ ] Implement relationship creation/deletion
- [ ] Add CSV import functionality for bulk data
- [ ] Create admin dashboard with entity counts
- [ ] Add basic validation and error handling

### Phase 6: MVP Polish and Testing (Week 7)

**Goal**: Ensure stable, deployable MVP

- [ ] Responsive design testing across devices
- [ ] Cross-browser testing
- [ ] Performance optimization (video loading, search speed)
- [ ] Error handling and edge cases
- [ ] User acceptance testing
- [ ] Documentation and deployment guide

### Post-MVP Enhancements (Future Phases)

Features to implement after MVP launch:

- Analytics dashboard UI
- Advanced search with facets
- Content sharing with URL parameters
- Expandable metadata panels with related content
- "Frown" feedback button
- User verification and claiming
- User reactions and interactions

## Design Considerations

- Implement fully responsive design for all screen sizes
- Use modern, clean UI elements
- Ensure consistent branding throughout the platform
- Prioritize intuitive navigation and search experience
- Implement all UI elements, buttons, and system messages in Spanish

## Technical Considerations

### Frontend (React)

- Implement component-based architecture
- Use React Router for navigation
- Implement state management (Redux/Context API)
- Ensure responsive design principles

### Backend (Flask)

- Create RESTful API endpoints
- Implement JWT authentication
- Handle database interactions with Neo4j
- Implement proper error handling and logging

### Database (Neo4j)

- Implement graph schema for core entities:
  - Usuario (platform users with roles)
  - Jingle (clips with metadata)
  - Fabrica (source videos)
  - Cancion (original songs)
  - Artista (performers and original artists)
  - Tematica (themes and categories)
- Implement relationships:
  - Jingle-APPEARS_IN-Fabrica
  - Artista-JINGLERO_DE-Jingle
  - Artista- AUTOR_DE-Cancion
  - Jingle-VERSIONA-Cancion
  - Jingle-TAGGED_WITH-Tematica
  - Usuario-SOY_YO-Artista (future verification)
  - Usuario-REACCIONA_A-Jingle (future reactions)

## Success Metrics

### MVP Launch Criteria (Limited Beta)

1. **Technical Readiness:**

   - Database fully populated with 50+ Fabricas, 1,300+ Jingles
   - Search returns results in <500ms
   - Video playback works reliably
   - Admin can add/edit content without errors

2. **Beta User Feedback Targets:**

   - Users can successfully search and find content
   - Users can watch Fabricas and see Jingle metadata updates
   - Users can navigate between related entities without confusion
   - No critical bugs or data errors reported

3. **Content Quality:**
   - All Fabricas have complete Jingle data
   - All Jingles have proper timestamps and metadata
   - All relationships are correctly established

### Post-MVP Success Metrics

1. **User Engagement:**
   - Session duration (target: 10+ minutes)
   - Fabrica completion rate (users watching full videos)
   - Click-through rate to related entities
2. **Content Growth:**
   - Number of new Fabricas added monthly
   - Coverage of full catalog (target: 100+ episodes)
3. **Feature Usage:**
   - Search query frequency and patterns
   - Most popular Jingles/Jingleros
   - User navigation paths through the knowledge graph

## Open Questions

1. **Future user authentication:** Multi-user system with roles (Admin, Member, Guest)
2. **Data curation workflow:** How frequently will new Fabricas/Jingles be added after MVP launch?
3. **Beta testing feedback:** What feedback mechanisms should be in place for limited beta users?
4. **Performance optimization:** With 1,300+ Jingles, what pagination/loading strategies are needed for search results?
5. **YouTube API considerations:** Rate limits, embedded player customization, alternate playback methods if YouTube embeds fail? Link out to YouTube.

## Data Requirements and Constraints

### Initial Seed Data

- Sample dataset: ~5-10% of full catalog for development
- Full dataset migration before MVP launch
- CSV import format defined in `/backend/src/server/db/import/`

### Database Constraints

- All entities require unique IDs
- Timestamps required on all entities and relationships
- Boolean flags for special designations (isJinglazo, isPrecario, isArg, etc.)
- Foreign key relationships enforced via Neo4j constraints

### Performance Considerations

- Search queries must handle 1,000+ entities efficiently
- Video thumbnail loading prioritized over full video buffering
- Pagination required for lists over 50 items
- Autocomplete debouncing and result limiting (10-20 items)
