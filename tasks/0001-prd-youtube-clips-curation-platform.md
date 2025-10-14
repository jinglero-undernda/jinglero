# Product Requirements Document: "La Usina de la Fabrica de Jingles"

## Introduction/Overview

This platform provides a curated interface for accessing and analyzing specific YouTube clips from the show "La Fabrica de Jingles" by the streaming station Gelatina. The system focuses on music-related content, featuring clips ("Jingles") that are based on a specific song with audience contributions. The platform will utilize React for the frontend, Flask for the backend, and Neo4j for the knowledge database, with potential deployment on Render and Vercel.

## Goals

1. Create a searchable database of curated YouTube clips with music-related content
2. Provide differentiated access levels for various user types
3. Enable detailed tracking and visualization of topics, songs, and contributor trends
4. Facilitate easy navigation and discovery of related content
5. Create a responsive web interface accessible across devices

## User Stories

### Authentication & Access

- As a guest user, I want to browse the clip database to discover interesting content ("Jingles", song adaptations)
- As a member, I want to access detailed trend analysis to understand popular topics and contributions
- As an administrator, I want to manage clip data and user roles to maintain platform quality
- As a contributor, I want to claim my contributions to establish my presence in the community

### Content Discovery

- As a user, I want to search for clips by song, artist, show date, or topic to find specific content
- As a user, I want to see related clips to discover more content about similar topics or artists
- As a member, I want to analyze trends in topics and contributions to understand community interests
- As an administrator, I want to curate featured content to highlight important or popular clips

## Functional Requirements

### Language and Localization

1. Present all user interface elements in Spanish
2. Implement a terminology management system for community-specific terms
3. Enable search and filtering using both standard and community-specific terms
4. Allow administrators to manage and update terminology database
5. Provide context and usage information for community-specific terms

### Authentication System

1. Support email-based registration with verification
2. Implement three user roles: Administrator, Member, and Guest
3. Provide secure login/logout functionality
4. Enable password reset capabilities

### User Management

5. Allow administrators to manage user roles
6. Enable administrators to verify contributor claims
7. Store user preferences and activity data
8. Support basic user profile management

### Clip Management

9. Enable manual creation and editing of clip entries by administrators
10. Store clip metadata including:
    - Song details (title, artist, genre, year, YouTube Music link)
    - Contributor information (optional, with verification status)
    - Stream details (title, date)
    - Clip title (optional)
    - Topic/theme tags
    - YouTube URL with timestamp
    - Special markers ("Jinglazo" and "Precario")

### Search and Navigation

11. Implement advanced search functionality with filters for:
    - Songs
    - Artists
    - Show dates
    - Topics
    - Contributors
    - Popularity
    - Featured content
12. Provide auto-complete suggestions in search fields
13. Display search results in an organized grid/list view

### Clip Detail Page

14. Enable direct clip playback on the platform
15. Provide quick access to original YouTube video
16. Display related clips based on:
    - Contributor
    - Topic
    - Song
    - Artist
17. Implement clip sharing functionality
18. Allow users to rate/like clips

### Analytics Dashboard

19. Create dedicated analytics pages for:
    - Topics
    - Artists
    - Songs
    - Contributors
    - Streams
20. Display trend visualizations using Chart.js
21. Allow Members to access detailed trend analysis
22. Enable custom date range selection for analysis

## Non-Goals (Out of Scope)

- Automated clip discovery and database updates
- YouTube API integration for thumbnails and metadata
- User commenting system
- Playlist creation
- Subscriber user level
- OAuth authentication
- Mobile app development

## Design Considerations

- Implement fully responsive design for all screen sizes
- Use modern, clean UI elements
- Ensure consistent branding throughout the platform
- Prioritize intuitive navigation and search experience
- Support dark/light mode themes (optional)
- Implement all UI elements, buttons, and system messages in Spanish
- Create a flexible labeling system to accommodate community-specific terminology

### Language and Terminology Management

- Implement a terminology management system for administrators to:
  - Define and update community-specific terms and expressions
  - Map slang terms to standard search terms
  - Maintain a curated glossary of community expressions
  - Tag clips with specific community terminology
  - Allow search using both standard and community-specific terms
- Store term definitions and usage context
- Enable administrators to categorize terms by:
  - Common usage
  - Stream-specific context
  - Historical significance
  - Related topics/themes

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

- Design graph schema for:
  - Users and roles
  - Clips and metadata
  - Relationships between entities
  - Analytics data
  - Community terminology and relationships
- Implement flexible schema to accommodate:
  - Term definitions and contexts
  - Relationships between standard and community-specific terms
  - Term usage statistics and trends
  - Term categorization and tagging

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
   - Community term usage in searches
4. Terminology Adoption:
   - Number of defined community terms
   - Frequency of term usage in searches
   - Term association accuracy
   - User engagement with terminology features

## Open Questions

1. What should be the process for contributor verification?
2. Should there be limits on API calls for different user roles?
3. What backup strategy should be implemented for the Neo4j database?
4. Should we implement rate limiting for clip ratings?
5. What metrics should be tracked for future feature decisions?
