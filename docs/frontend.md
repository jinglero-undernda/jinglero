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

## Project Structure

## Routing and Shareable Links

The frontend uses React Router for client-side navigation. The main route patterns implemented in the MVP are:

- Home: `/`
- Fabrica detail: `/f/:fabricaId` — shareable by fabrica UUID. Example: `/f/6f9c2a3b-...`
- Jingle detail: `/j/:jingleId` — direct link to a Jingle resource. Example: `/j/abcd1234`
- Cancion detail: `/c/:cancionId` — link to a Cancion (song) page.

Additionally, you can create links to a specific timestamp or jingle index within a Fabrica using query params. Examples:

- Jump to jingle index in a Fabrica: `/f/:fabricaId?j=2` — jumps to the 3rd jingle (0-based indexing is an implementation detail; prefer 1-based for UX).
- Share with timestamp (future): `/f/:fabricaId?t=123` — starts playback at t seconds.

Notes:

- The route format `/f/:fabricaId` is preferred for readability and SEO over query-only formats like `/f=UUID`.
- When implementing deep links you should consider URL encoding and validation server-side.

If you later choose to support legacy share tokens like `/f=UUID` and `/j=number` (query-like paths), add a redirect or router parse step to normalize them into the canonical routes above.

## Performance / Data considerations (notes)

If you plan to support fast search and filtering, consider denormalizing or adding useful scalar properties on Neo4j nodes (for example: `titulo`, `youtubeId`, `primaryTematica`, `artistName`) so search queries can match node properties directly instead of traversing relationships. This will improve search performance at the cost of some redundancy. (Do not act on this now; this is a design note only.)

```
frontend/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable UI components
│   │   ├── admin/      # Admin interface components
│   │   ├── common/     # Shared components
│   │   ├── layout/     # Layout components
│   │   ├── player/     # Video player components
│   │   └── search/     # Search interface components
│   ├── context/        # React context providers
│   ├── lib/            # Utilities and services
│   │   ├── api/        # API client and endpoints
│   │   ├── hooks/      # Custom React hooks
│   │   ├── utils/      # Utility functions
│   │   └── validation/ # Form validation schemas
│   ├── pages/          # Route-level components
│   │   ├── admin/      # Admin pages
│   │   ├── fabrica/    # Fabrica (video) pages
│   │   ├── jingle/     # Jingle pages
│   │   └── cancion/    # Cancion (song) pages
│   ├── styles/         # Global styles and themes
│   └── types/          # TypeScript type definitions
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
