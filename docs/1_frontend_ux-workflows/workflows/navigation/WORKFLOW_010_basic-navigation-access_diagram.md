# WORKFLOW_010: Basic Navigation Access - Flow Diagram

## Overview

This diagram visualizes the navigation paths available to GUEST users from the Landing Page, showing all entry points and destinations.

## Flowchart

```mermaid
flowchart TD
    Start([GUEST User<br/>Arrives at Application]) --> Landing[Landing Page<br/>Route: /<br/>User Role: GUEST]

    Landing --> LoginPath[Click Login/Auth Link]
    Landing --> FabricaPath[Interact with<br/>Featured Fabrica]
    Landing --> EntityPath[Click Featured Entity]
    Landing --> GlobalSearchPath[Enter Search Query<br/>in Global Search]
    Landing --> AdvancedSearchPath[Click Advanced Search Link]

    LoginPath --> LoginPage[Login Page<br/>Route: /admin/login<br/>WORKFLOW_009]
    LoginPage --> AuthResult{Authentication<br/>Result}
    AuthResult -->|Success| UserRole[USER or ADMIN]
    AuthResult -->|Cancel/Fail| Landing

    FabricaPath --> FabricaInteraction[Fabrica Interaction<br/>on Landing Page<br/>WORKFLOW_007]
    FabricaInteraction --> FabricaView[Fabrica Player Page<br/>Route: /show/:fabricaId<br/>Optional Navigation]

    EntityPath --> EntityType{Entity Type}
    EntityType -->|Jingle| JinglePage[Jingle Inspection Page<br/>Route: /j/:jingleId<br/>WORKFLOW_008]
    EntityType -->|Cancion| CancionPage[Cancion Inspection Page<br/>Route: /c/:cancionId<br/>WORKFLOW_008]
    EntityType -->|Fabrica| FabricaInspectPage[Fabrica Inspection Page<br/>Route: /f/:fabricaId<br/>WORKFLOW_008]
    EntityType -->|Artista| ArtistaPage[Artista Inspection Page<br/>Route: /a/:artistaId<br/>WORKFLOW_008]
    EntityType -->|Tematica| TematicaPage[Tematica Inspection Page<br/>Route: /t/:tematicaId<br/>WORKFLOW_008]

    GlobalSearchPath --> SearchList[Search Results List<br/>Displayed on Landing Page<br/>WORKFLOW_006]
    SearchList --> EntityFromSearch{Entity Type}
    EntityFromSearch -->|Jingle| JingleFromSearch[Jingle Inspection Page<br/>Route: /j/:jingleId<br/>WORKFLOW_008]
    EntityFromSearch -->|Cancion| CancionFromSearch[Cancion Inspection Page<br/>Route: /c/:cancionId<br/>WORKFLOW_008]
    EntityFromSearch -->|Fabrica| FabricaFromSearch[Fabrica Inspection Page<br/>Route: /f/:fabricaId<br/>WORKFLOW_008]
    EntityFromSearch -->|Artista| ArtistaFromSearch[Artista Inspection Page<br/>Route: /a/:artistaId<br/>WORKFLOW_008]
    EntityFromSearch -->|Tematica| TematicaFromSearch[Tematica Inspection Page<br/>Route: /t/:tematicaId<br/>WORKFLOW_008]

    AdvancedSearchPath --> AdvancedSearch[Advanced Search Page<br/>Route: /search/advanced<br/>WORKFLOW_006]
    AdvancedSearch --> SearchResultsPage[Search Results Page<br/>Route: /search<br/>Detailed Functional Process]

    %% Edge Cases
    Landing -.->|No Featured Content| EmptyState[Empty State<br/>Placeholder Display]
    EmptyState --> Landing

    Landing -.->|Already Authenticated| AuthAware[Authentication-Aware<br/>Navigation Display]
    AuthAware --> Landing

    EntityPath -.->|Invalid Entity ID| ErrorPage[Error/404 Page<br/>Graceful Error Handling]
    ErrorPage --> Landing

    GlobalSearchPath -.->|Empty Query| SearchValidation{Query Validation}
    SearchValidation -->|Prevent| Landing
    SearchValidation -->|Allow| SearchList

    %% Styling
    classDef landingPage fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    classDef destinationPage fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef workflowRef fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef edgeCase fill:#ffebee,stroke:#b71c1c,stroke-width:1px,stroke-dasharray: 5 5

    class Landing landingPage
    class LoginPage,FabricaView,JinglePage,CancionPage,FabricaInspectPage,ArtistaPage,TematicaPage,JingleFromSearch,CancionFromSearch,FabricaFromSearch,ArtistaFromSearch,TematicaFromSearch,AdvancedSearch,SearchResultsPage destinationPage
    class AuthResult,EntityType,EntityFromSearch,SearchValidation workflowRef
    class EmptyState,AuthAware,ErrorPage,SearchList edgeCase
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> LandingPage: User navigates to /

    LandingPage --> LoginPage: Click Login
    LandingPage --> FabricaInteraction: Interact with Fabrica
    LandingPage --> EntityInspection: Click Featured Entity
    LandingPage --> GlobalSearchList: Enter Search Query
    LandingPage --> AdvancedSearchPage: Click Advanced Search

    GlobalSearchList --> EntityInspection: Select Entity from List

    LoginPage --> Authenticated: Authentication Success
    LoginPage --> LandingPage: Cancel/Fail

    FabricaInteraction --> FabricaPlayer: Navigate to Full View
    FabricaInteraction --> LandingPage: Return

    AdvancedSearchPage --> SearchResultsPage: Submit Search
    SearchResultsPage --> EntityInspection: Click Search Result

    LandingPage --> [*]: User leaves application
    EntityInspection --> [*]: User leaves application
    GlobalSearchList --> [*]: User leaves application
    SearchResultsPage --> [*]: User leaves application

    note right of LandingPage
        Route: /
        User Role: GUEST
    end note

    note right of LoginPage
        Route: /admin/login
        WORKFLOW_009
    end note

    note right of Authenticated
        USER or ADMIN
        Role Assigned
    end note

    note right of FabricaInteraction
        On Landing Page
        WORKFLOW_007
    end note

    note right of FabricaPlayer
        Route: /show/:fabricaId
    end note

    note right of EntityInspection
        Routes: /j/:id, /c/:id, etc.
        WORKFLOW_008
    end note

    note right of GlobalSearchList
        On Landing Page
        List of matching entities
        WORKFLOW_006
    end note

    note right of SearchResultsPage
        Route: /search
        Detailed functional process
        WORKFLOW_006
    end note

    note right of AdvancedSearchPage
        Route: /search/advanced
        WORKFLOW_006
    end note
```

## Navigation Paths Summary

### Primary Navigation Paths

1. **Landing → Login**

   - Route: `/` → `/admin/login`
   - User Role: GUEST → USER/ADMIN
   - Related: WORKFLOW_009

2. **Landing → Featured Fabrica Interaction**

   - Route: `/` (stays on landing, interacts with Fabrica)
   - Optional: Navigate to `/show/:fabricaId`
   - Related: WORKFLOW_007

3. **Landing → Featured Entity**

   - Route: `/` → `/j/:id` | `/c/:id` | `/f/:id` | `/a/:id` | `/t/:id`
   - Related: WORKFLOW_008

4. **Landing → Global Search → Entity Inspection**

   - Route: `/` (search on landing) → Entity list displayed → `/j/:id` | `/c/:id` | `/f/:id` | `/a/:id` | `/t/:id` (entity selection)
   - Related: WORKFLOW_006, WORKFLOW_008

5. **Landing → Advanced Search → Search Results Page**

   - Route: `/` → `/search/advanced` → `/search` (detailed functional process)
   - Related: WORKFLOW_006

### Edge Case Paths

- **Empty Content**: Landing Page → Empty State → Landing Page
- **Already Authenticated**: Landing Page → Auth-Aware Display → Landing Page
- **Invalid Entity**: Featured Entity → Error Page → Landing Page
- **Empty Search**: Global Search → Validation → Landing Page or Search List

## Key States

- **Landing Page**: Central hub, all navigation originates here
- **Destination Pages**: Final destinations for user actions
- **Workflow References**: Points where other workflows take over
- **Edge Cases**: Error and validation states (shown with dashed lines)

## Related Workflows

- **WORKFLOW_005**: Landing Page (detailed design)
- **WORKFLOW_006**: Search and Discovery (search functionality)
- **WORKFLOW_007**: Fabrica Viewing (Fabrica interaction)
- **WORKFLOW_008**: Entity Inspection (entity page details)
- **WORKFLOW_009**: Admin Authentication (login sequence)

## Notes

- All paths originate from the Landing Page
- Navigation is primarily one-way (user moves forward through the flow)
- Users can return to Landing Page via browser navigation or explicit links
- Edge cases are shown with dashed lines to indicate alternative paths
- Workflow references indicate where detailed workflows take over
