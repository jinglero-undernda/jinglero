# Frontend Development Guide

This document provides instructions for setting up and running the frontend application for La Usina de la Fabrica de Jingles.

## Prerequisites

- Node.js 22.12.0 or later (we use Node 22.12.0 in development)
- npm 10.x
- nvm (Node Version Manager) recommended for version management

## Initial Setup

1. Install the correct Node.js version using nvm:

   ```bash
   nvm install 20.11.1
   nvm use 20.11.1
   ```

2. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Development Environment

### Available Scripts

- **Stop existing Dev Server**:

  ```bash
  kill $(lsof -t -i:5173)
  ```

- **Start Development Server**:

  ```bash
  npm run dev
  ```

  This will start the development server at `http://localhost:5173`

- **Build for Production**:

  ```bash
  npm run build
  ```

  Builds the app for production to the `dist` folder

- **Preview Production Build**:

  ```bash
  npm run preview
  ```

  Serves the production build locally for testing

- **Lint Code**:

  ```bash
  npm run lint
  ```

  Runs ESLint to check for code quality issues

- **Type Check**:
  ```bash
  npm run type-check
  ```
  Runs TypeScript compiler to check for type errors

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Routing and Shareable Links

The frontend uses React Router for client-side navigation. The route structure is organized into main application routes and admin routes.

### Main Application Routes

- **Home**: `/` — Landing page
- **Fabrica (Video Player)**:

  - `/show/:fabricaId` — View specific Fabrica with video player. Example: `/show/6f9c2a3b-...`
  - `/show` — Auto-redirects to latest Fabrica (by date)
  - Query params:
    - `?j=2` — Jump to jingle index in Fabrica
    - `?t=123` — Start playback at t seconds

- **Inspect Routes** (Entity detail pages):

  - `/f/:fabricaId` — Inspect Fabrica details (`InspectFabrica`)
  - `/j/:jingleId` — Inspect Jingle details (`InspectJingle`)
  - `/c/:cancionId` — Inspect Cancion details (`InspectCancion`)
  - `/a/:artistaId` — Inspect Artista details (`InspectArtista`)
  - `/t/:tematicaId` — Inspect Tematica details (`InspectTematica`)

- **Admin Routes** (Entity management):

  - `/admin/j/:id` — Edit Jingle (`AdminJingle`)
  - `/admin/f/:id` — Edit Fabrica (`AdminFabrica`)
  - `/admin/c/:id` — Edit Cancion (`AdminCancion`)
  - `/admin/a/:id` — Edit Artista (`AdminArtista`)
  - `/admin/t/:id` — Edit Tematica (`AdminTematica`)
  - `/admin` — Admin landing page

- **Demo/Test Routes**:
  - `/inspect/:entityType/:entityId` — Generic entity inspection page
  - `/inspect-related/:entityType/:entityId` — Related entities demonstration page

### Route Structure Notes

- The `/show` route is the main video player interface for Fabricas, while `/f/:fabricaId` is for inspecting Fabrica details
- Admin routes follow a simple pattern: `/admin/{entityType}/:id` where entityType is a single letter (j, f, c, a, t)
- All routes use URL path parameters rather than query strings for entity IDs for better SEO and readability
- When implementing deep links, consider URL encoding and validation server-side

## Performance / Data considerations (notes)

If you plan to support fast search and filtering, consider denormalizing or adding useful scalar properties on Neo4j nodes (for example: `titulo`, `youtubeId`, `primaryTematica`, `artistName`) so search queries can match node properties directly instead of traversing relationships. This will improve search performance at the cost of some redundancy. (Do not act on this now; this is a design note only.)

## Project Structure

The frontend application follows a modular structure organized by feature and component type:

```
frontend/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable UI components
│   │   ├── admin/      # Admin interface components
│   │   │   ├── EntityEdit.tsx      # Entity editing form
│   │   │   ├── EntityForm.tsx      # Generic entity form
│   │   │   ├── EntityList.tsx      # Generic entity list
│   │   │   ├── FabricaList.tsx     # Fabrica list component
│   │   │   └── RelationshipForm.tsx # Relationship creation form
│   │   ├── common/     # Shared components
│   │   │   ├── EntityCard.tsx      # Entity display card/row
│   │   │   └── RelatedEntities.tsx # Nested entity relationships
│   │   ├── layout/     # Layout components
│   │   ├── player/     # Video player components
│   │   │   ├── YouTubePlayer.tsx   # YouTube iframe player
│   │   │   ├── JingleTimeline.tsx  # Timeline component
│   │   │   └── JingleMetadata.tsx  # Jingle metadata display
│   │   └── search/     # Search interface components
│   ├── context/        # React context providers
│   ├── lib/            # Utilities and services
│   │   ├── api/        # API client and endpoints
│   │   │   └── client.ts           # Public and Admin API clients
│   │   ├── hooks/      # Custom React hooks
│   │   ├── utils/      # Utility functions
│   │   │   ├── relationshipConfigs.ts # Relationship configurations
│   │   │   └── entitySorters.ts    # Entity sorting utilities
│   │   └── validation/ # Form validation schemas
│   ├── pages/          # Route-level components
│   │   ├── admin/      # Admin pages
│   │   │   ├── AdminJingle.tsx     # Admin Jingle editor
│   │   │   ├── AdminFabrica.tsx    # Admin Fabrica editor
│   │   │   ├── AdminCancion.tsx    # Admin Cancion editor
│   │   │   ├── AdminArtista.tsx    # Admin Artista editor
│   │   │   └── AdminTematica.tsx   # Admin Tematica editor
│   │   ├── inspect/    # Entity inspection pages
│   │   │   ├── InspectJingle.tsx   # Jingle detail page
│   │   │   ├── InspectCancion.tsx  # Cancion detail page
│   │   │   ├── InspectFabrica.tsx  # Fabrica detail page
│   │   │   ├── InspectArtista.tsx  # Artista detail page
│   │   │   ├── InspectTematica.tsx # Tematica detail page
│   │   │   ├── InspectEntityPage.tsx # Generic entity inspector
│   │   │   └── InspectRelatedEntitiesPage.tsx # Related entities demo
│   │   ├── FabricaPage.tsx         # Main Fabrica video player page
│   │   ├── Home.tsx                # Landing page
│   │   └── AdminPage.tsx           # Admin routing wrapper
│   ├── styles/         # Global styles and themes
│   │   ├── components/ # Component-specific styles
│   │   │   ├── entity-card.css
│   │   │   ├── related-entities.css
│   │   │   └── ...
│   │   └── pages/      # Page-specific styles
│   └── types/          # TypeScript type definitions
│       └── index.ts    # Core entity and API types
```

## Code Style and Best Practices

- Use TypeScript for type safety
- Follow ESLint rules for consistent code style
- Use CSS modules for component styling
- Implement responsive design using CSS variables
- Use React Query for data fetching and caching
- Implement lazy loading for route-level components

## Working with the API

The frontend communicates with the backend API using axios. The API client is configured in `src/lib/api/client.ts`.

## Browser Support

The application is designed to support:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Troubleshooting

Common issues and their solutions:

1. **Node version mismatch**:

   ```bash
   nvm use 20.11.1
   ```

2. **Missing dependencies**:

   ```bash
   npm install
   ```

3. **Build errors**:
   - Clear the dist folder: `rm -rf dist`
   - Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
