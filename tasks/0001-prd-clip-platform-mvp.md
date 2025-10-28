# Product Requirements Document: "La Usina de la Fabrica de Jingles"

## Introduction/Overview

This platform provides a curated interface for accessing and analyzing specific YouTube clips ("Fabricas") from the show "La Fabrica de Jingles" by the streaming station Gelatina. Each video features several songs ("Jingles"), which are versions of known songs ("Canciones", by "Autor"). The Jingles are submitted by show audience, usually referred to as "Jingleros" (within our platform the both the Autor and the Jinglero information is store under the "Artistas" category). Each Jingle will be tagged with one or more Topics ("Tematicas") that are addressed in the Jingle.
The system provides an in-app reproduction of the videoclip from YouTube, while dynamically showing the information associated to the current song, that automatically changes when the user is reproducing another segment of the video. The user can interact with this content, opening panels to search for other instances matching some property (like other Jingles featuring the same song, or submitted by the same Jinglero, and provides a link to them).

This PRD is focusing on the MVP version of the platform.
The platform will utilize React for the frontend, Flask for the backend, and Neo4j for the knowledge database, initially running locally with potential later deployment on Render and Vercel.

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

### 3. Entity Detail Pages (CORE)

- Cancion page: Show Jingles using that song with Fabrica links
- Artista page: Show their Jingles and/or Canciones
- Tematica page: Show Jingles tagged with that theme
- Navigation between related entities

### 4. Admin Content Management (CORE)

- Basic CRUD interface for all entity types (Fabrica, Jingle, Cancion, Artista, Tematica) and relationships
- CSV import for initial data seeding
- Password-protected admin route

### MVP Success Criteria

- User can search for content and find it
- User can watch a Fabrica video and see current Jingle info automatically
- User can navigate between related content (Jingle → Jinglero → their other Jingles)
- Admin can add/edit/import content successfully

## User Stories

### Listening Experience

- As a user, I want to view / listen to the streaming show, while detailed information of the current Jingle is being dynamically displayed.
- As a user, I want to expand or collapse the blocks of information being displayed.
- As a user, I want to skip forward or back to the time-stamps where a Jingle starts.
- As a user, I want to be able to jump to another Jingle or Cancion that I have discivered in the dynamic information display.

### Content Curation and Discovery

- As the platform administrator, I want to manage the Knowledge Database to maintain platform quality.
- As a user, I want to search for Jingles by Title, Jinglero, Cancion, Artista, Tematica.
- As the administrator, I want to curate featured content to highlight important or popular clips
- As a user, I want to be able to flag errors or gaps in the database for attention of the Admin team.

## Functional Requirements

### General Layout

1. Present all user interface elements in Spanish (Argentina)
2. Include disclaimers on Intellectual Property rights and ties to actual people - use Argentinean legal references.

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

**Cancion Detail Page:** 15. Enable direct YouTube video playback on the platform (embed) 16. Load thumbnail first, buffer video only on user play 17. Display list of Jingles that use this Cancion, with links to Fabrica + timestamp 18. Display list of other Canciones by the same Autor (if available) 19. **Post-MVP**: Cancion sharing functionality

**Fabrica Detail Page - MVP CORE FEATURE:** 20. **MVP Critical**: Enable full YouTube video playback on the platform 21. **MVP Critical**: Load thumbnail first, buffer video only on user play 22. **MVP Critical**: Display list of Jingles with metadata that updates based on current playback time 23. **MVP Critical**: Allow users to skip directly to Jingle timestamps 24. **MVP Critical**: Display active Jingle metadata: - Titulo del Jingle - Jinglero name and link - Cancion title and link

- Autor name (if different from Jinglero) - Tematicas 25. **Post-MVP**: Expandable metadata panels showing related content 26. **Post-MVP**: Direct Jingle sharing with timestamp deep-links

**Artista Detail Page:** 27. Display Jinglero's Jingles with links to Fabricas 28. If also Autor, display their Canciones with links to Jingles 29. **Post-MVP**: User verification and claiming functionality

**Tematica Page:** 30. Display Jingles tagged with this Tematica 31. Show Tematica category and description

### Navigation and Relationships - MVP Critical

32. **MVP Critical**: Implement "related entities" queries for content discovery
33. Enable navigation between related entities (Jingle → Cancion, Jingle → Jinglero, etc.)
34. **Post-MVP**: Advanced relationship visualization

### Analytics Dashboard - Post-MVP

35. **Post-MVP**: Search term analytics
36. **Post-MVP**: Click/link analytics
37. **Post-MVP**: Video view analytics

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
- [ ] Implement Neo4j-based backend API (migrate from YAML)
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
- [ ] Create real-time metadata updates based on playback position
- [ ] Build clickable Jingle list with skip-to-timestamp functionality
- [ ] Display active Jingle metadata panel (Jinglero, Cancion, Autor, Tematicas)
- [ ] Implement related entity links (navigate to related Jingleros, Canciones)

### Phase 4: MVP Core - Entity Detail Pages (Weeks 4-5)

**Goal**: Enable deep exploration of related content

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

1. User Engagement:
   - Number of registered members
   - Search/browse session duration
   - Clip view counts
2. Content Growth:
   - Number of curated clips
   - Number of verified contributors
   - Growth of community terminology database
3. Feature Usage:
   - Search functionality utilization
   - Analytics page views
   - Sharing activity

## Open Questions

1. Future user authorisation and handling strategies?
2. Monetisation strategies?
3. Automation of data discovery and ingestion
