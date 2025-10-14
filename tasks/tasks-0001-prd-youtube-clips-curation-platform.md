## Relevant Files

- `src/design/system/tokens.json` - Design tokens (colors, spacing, typography) for consistent UI styling.
- `src/design/mockups/curation-page.pdf` - Static mockup assets and sketches for curator flows (MVP: simple PDF/PNG).
- `src/client/styles/global.css` - Global styles and base resets for the app.
- `src/client/pages/_app.tsx` - App wrapper to load global styles and provide design system context.
- `src/client/pages/auth/login.tsx` - Login page and OAuth callback handler UI (MVP: email/password + OAuth stub).
- `src/server/auth/index.ts` - Authentication endpoints, session handling, and user model.
- `src/server/api/videos.ts` - API handlers for ingesting YouTube clip metadata and storing curated entries.
- `src/server/db/index.ts` - Database client and schema migrations for storing clips, channels, users, and curation state.
- `src/client/pages/curation/[id].tsx` - Curator UI for reviewing, editing, and approving clips.
- `src/client/components/ClipCard.tsx` - UI component to display single clip details and curation controls.
- `src/client/components/ClipList.tsx` - Paginated list component used in the curator dashboard.
- `src/client/pages/api/ingest.ts` - Serverless endpoint to accept webhook or manual import jobs for new clips.
- `src/lib/youtube.ts` - Utilities for interacting with the YouTube Data API (fetching video details, thumbnails).
- `src/lib/media.ts` - Helpers for downloading, transcoding or validating clip media (MVP: validation only).
- `src/data/sample-clips.json` - Static sample data used for mockups and early UI development.
- `tests/server/api/videos.test.ts` - Unit tests for API handlers.
- `tests/client/components/ClipCard.test.tsx` - Unit tests for UI components.

### Notes

- Unit tests should be placed alongside their modules under `tests/` mirroring `src/` structure.
- MVP excludes heavy media processing (transcoding) and external worker orchestration; focus on metadata curation and light validation.
- Add a short design phase to produce simple mockups (PNG/PDF) and a small style token file (`tokens.json`) so the UI is consistent for the MVP.
- Authentication for MVP can be implemented with email/password + a simple session cookie or JWT; OAuth providers can be stubbed or added later.

## Tasks (MVP parent-level)

- [ ] 1.0 Setup project infra and data model (DB + API)

  - [x] 1.1 Create project skeleton for server (Node/TypeScript + Flask alternative notes)
  - [x] 1.2 Add DB client wrapper for Neo4j in `src/server/db/index.ts`
  - [ ] 1.3 Design initial graph schema for: Users, Clips, Songs, Artists, Streams, Terms
  - [ ] 1.4 Implement migration/seed script to create example nodes and relationships
  - [ ] 1.5 Create REST API endpoints for CRUD on Clips and Terms in `src/server/api/videos.ts`
  - [ ] 1.6 Add environment configuration and `.env.example`
  - [ ] 1.7 Document API surface in a `docs/api.md` (minimal OpenAPI/endpoint list)
  - [ ] 1.8 Add a simple in-memory fallback mode for tests/local dev
  - [ ] Acceptance: Automated migration runs and seed data load; integration test that creates/reads a Clip via the API and validates graph relationships

- [ ] 2.0 General UI & style design

  - [ ] 2.1 Create `src/design/system/tokens.json` with base color, spacing, and typography tokens
  - [ ] 2.2 Add `src/client/styles/global.css` and ensure `_app.tsx` imports it
  - [ ] 2.3 Implement a small layout component (`src/client/components/Layout.tsx`) with Spanish nav labels
  - [ ] 2.4 Wire a simple theme provider (light/dark toggle optional) and locale strings stub (`src/client/i18n/es.json`)
  - [ ] 2.5 Add `ClipCard` base styles and responsive rules
  - [ ] Acceptance: Visual smoke test (render key layout + ClipCard with sample data) and a snapshot test for `ClipCard`

- [ ] 3.0 Mockups with static/sample data

  - [ ] 3.1 Produce static mockups (PNG/PDF) for curator dashboard and clip detail (add files to `src/design/mockups`)
  - [ ] 3.2 Create `src/data/sample-clips.json` (10 diverse examples covering tags, contributors, timestamps)
  - [ ] 3.3 Build a mock data provider and a `MockCurationPage` that consumes `sample-clips.json`
  - [ ] 3.4 Validate UX flows for approving/editing a clip using the mock UI
  - [ ] Acceptance: Manual QA checklist passed and mock pages render without errors; one screenshot per mock saved in repo

- [ ] 4.0 Implement clip ingestion pipeline (webhook/manual import)

  - [ ] 4.1 Add server endpoint `POST /api/ingest` in `src/client/pages/api/ingest.ts` (serverless stub) or `src/server/api/ingest.ts`
  - [ ] 4.2 Implement payload validation and normalization (timestamps, YouTube URL parsing) in `src/lib/media.ts`
  - [ ] 4.3 Add idempotency checks and duplicate detection heuristics
  - [ ] 4.4 Implement manual import UI form for curators (`src/client/pages/curation/import.tsx`)
  - [ ] 4.5 Enqueue lightweight validation job (in-process worker for MVP) to verify YouTube URL format and fetch metadata via `src/lib/youtube.ts` (mockable)
  - [ ] Acceptance: E2E test that posts a sample ingest payload, results in a Clip node stored in DB, and shows up in the curator import list

- [ ] 5.0 Build curator UI for reviewing and approving clips

  - [ ] 5.1 Create `src/client/pages/curation/index.tsx` - paginated list of pending clips
  - [ ] 5.2 Implement `src/client/pages/curation/[id].tsx` - clip review/edit page with fields per PRD
  - [ ] 5.3 Add actions: Approve, Reject, Edit metadata, Tag with community terms, Mark Jinglazo/Precario
  - [ ] 5.4 Wire API calls to update clip state and record curator user and timestamp
  - [ ] 5.5 Add role-based guard so only Admin/Member can access curation pages
  - [ ] Acceptance: Integration test that simulates a curator approving a clip and asserts DB state change and audit trail

- [ ] 6.0 User login and authentication workflow

  - [ ] 6.1 Implement user model and role enum (Admin/Member/Guest) in DB schema
  - [ ] 6.2 Create registration/login endpoints and email verification flow (stubbed email) in `src/server/auth/index.ts`
  - [ ] 6.3 Implement JWT generation and middleware for protected API routes
  - [ ] 6.4 Add UI pages: `auth/register.tsx`, `auth/login.tsx`, `auth/verify.tsx`, `auth/reset-password.tsx`
  - [ ] 6.5 Create admin UI to manage user roles and verify contributor claims
  - [ ] Acceptance: End-to-end auth test: register -> verify -> login -> access protected curation route succeeds for proper role and fails for Guest

- [ ] 7.0 Implement basic search, filtering and pagination

  - [ ] 7.1 Design search API `GET /api/search` with filter params (song, artist, topic, contributor, date range, popularity)
  - [ ] 7.2 Implement server-side query translation to Neo4j Cypher with pagination
  - [ ] 7.3 Add autocomplete endpoint `GET /api/suggest?q=` using term and song indexes
  - [ ] 7.4 Build UI components: `SearchBar`, `FilterPanel`, `ResultsGrid` with infinite scroll or pagination
  - [ ] 7.5 Ensure search works with community-specific term mappings from terminology DB
  - [ ] Acceptance: Search integration test that returns expected results for known sample-clips and validates pagination and suggestions

- [ ] 8.0 Add tests, CI wiring, and deployment config
  - [ ] 8.1 Add Jest + React Testing Library config and sample tests for server and client
  - [ ] 8.2 Add linting (ESLint/Prettier) and a pre-commit hook (husky) for formatting/tests
  - [ ] 8.3 Create CI workflow (GitHub Actions) running unit tests, lint, and build steps
  - [ ] 8.4 Add simple Render/Vercel deployment config notes and `vercel.json`/`render.yaml` stubs
  - [ ] 8.5 Add a `tests/acceptance` folder with end-to-end test stubs (Supertest or Playwright) and one example E2E
  - [ ] Acceptance: CI run passes locally and at least one end-to-end acceptance test completes successfully in the CI matrix

I have generated the sub-tasks for each parent task including test/acceptance milestones.
