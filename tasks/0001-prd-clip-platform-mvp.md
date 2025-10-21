# Product Requirements Document: "La Usina de la Fabrica de Jingles"

## Introduction/Overview

This platform provides a curated interface for accessing and analyzing specific YouTube clips ("Fabricas") from the show "La Fabrica de Jingles" by the streaming station Gelatina. Each video features several songs ("Jingles"), which are versions of known songs ("Canciones", by "Autor"). The Jingles are submitted by show audience, usually referred to as "Jingleros" (within our platform the both the Autor and the Jinglero information is store under the "Artistas" category). Each Jingle will be tagged with one or more Topics ("Tematicas") that are addressed in the Jingle.
The system provides an in-app reproduction of the videoclip from YouTube, while dynamically showing the information associated to the current song, that automatically changes when the user is reproducing another segment of the video. The user can interact with this content, opening panels to search for other instances matching some property (like other Jingles featuring the same song, or submitted by the same Jinglero, and provides a link to them).

This PRD is focusing on the MVP version of the platform.
The platform will utilize React for the frontend, Flask for the backend, and Neo4j for the knowledge database, initially running locally with potential later deployment on Render and Vercel.

## Goals

1. Create a Knowledge Database of the Fabricas, Jingles, Canciones, Artistas and Tematicas, with several relationships that will be exploited during the User Experience.
2. Create a user experience to watch a YouTube video (from La Fabrica de Jingles) while accessing detailed information of the Jingle being displayed.
3. Create an interface to search the Knowledge database, including predictive completion.
4. Facilitate easy navigation and discovery of related content.
5. Create a responsive web interface accessible across devices.

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

### Knowledge Database Management

4. Store metadata from the documented DB Schema (src/server/db/schema)
5. Enable manual creation and editing of Knowledge Database entries by Administrator in a simple interface.
6. Enable bulk import/export/update of Database elements via CSV files.
7. Include an interface button to send a "frown" to the administrator to flag any database discrepancy or error.

### Search and Navigation

8. Implement advanced search functionality with a single search box that looks across:
   - Jingle titles
   - Canciones
   - Artistas (both Jinglero and Autor)
   - Tematicas
9. Provide auto-complete suggestions in search field(s)
10. Display search results in an organized grid/list view with collapsible headings for each category.
11. Implement sharing functionality: allow user to generate a link with the current search words that will reproduce similar results.

### Cancion Detail Page

12. Enable direct clip playback on the platform
13. Optimise the performance of the platform to load a thumbnail and only when user press "Play" buffer the video.
14. Provide a list of other Canciones by the same Artista, with a link to the song detail page.
15. Provide a list of the Fabricas where the song was used, with a time-stamped link to the Fabrica detail page.
16. Implement sharing functionality: allow users to generate a link to the current Cancion.

### Fabrica Detail Page

17. Enable direct clip playback on the platform
18. Optimise the performance of the platform to load a thumbnail and only when user press "Play" buffer the video.
19. Provide information of the various Jingles featured in the show, allowing the user to skip directly to the relevant time-stamp.
20. Display related metadata from the Knowledge base on:
    - Titulo del Jingle
    - Jinglero
    - Cancion
    - Autor
    - Tematicas
21. If the usuario expands one of the items in the metadata, show other Jingles that have that item in common, with a link to the relevant Fabrica, at the relevant time-stamp.
22. Implement sharing functionality: creating a link directly to a specific Jingle.

### Analytics Dashboard

23. Collect analytics on search terms
24. Collect analytics on links pressed

## Non-Goals (Out of Scope)

- Automated clip discovery and database updates
- User registration or login system
- User reactions or commenting system
- Playlist creation
- Subscriber user level
- OAuth authentication
- Mobile app development

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
