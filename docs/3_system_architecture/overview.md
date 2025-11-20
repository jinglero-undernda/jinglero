# Architecture Overview

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Version**: 1.0

## Data Flow

The system uses a three-tier architecture with clear separation of concerns:

- **Frontend**: React application with TypeScript
- **Backend**: Express.js REST API
- **Database**: Neo4j graph database

Data flows through RESTful API endpoints:

- Public API (`/api/public/*`) for read-only operations
- Admin API (`/api/admin/*`) for full CRUD operations
- Search API (`/api/search`) for global search

**Key Patterns**:

- Centralized API client classes (`PublicApiClient`, `AdminApiClient`)
- Neo4j Cypher queries with retry logic
- Client-side request caching at component level
- Request deduplication to prevent redundant API calls

**Documentation**: See [data-flow.md](./data-flow.md) for detailed data flow architecture.

## State Management

Frontend state management uses React's built-in hooks:

- **useReducer**: Complex state in `RelatedEntities` component
- **useState**: Simple component-level state
- **Context API**: Shared authentication state
- **useRef**: Mutable values (cache, pending requests, state refs)

**Key Patterns**:

- Component-level state management (no global state library)
- Request deduplication via pending promises tracking
- Abort controllers for canceling in-flight requests
- State synchronization via cache invalidation

**Documentation**: See [state-management.md](./state-management.md) for detailed state management architecture.

## Caching

Current caching implementation is client-side only:

- **Component-Level Cache**: In-memory cache using `useRef`
- **Cache Key**: `${entityId}-${entityType}-${relationshipKey}`
- **Scope**: Component lifecycle (cleared on unmount)
- **Invalidation**: Manual refresh or component unmount

**Server-Side Caching**: Not implemented

- All API requests hit Neo4j directly
- No Redis or in-memory caching layer

**Key Patterns**:

- Cache lookup before API requests (User Mode)
- Cache clearing on refresh (Admin Mode)
- Request deduplication to prevent redundant calls

**Documentation**: See [caching.md](./caching.md) for detailed caching architecture.

## Performance

Performance optimizations focus on reducing database queries and preventing redundant API calls:

- **Query Optimization**: Redundant properties (`fabricaId`, `cancionId` on Jingle nodes) to eliminate relationship traversals
- **Lazy Loading**: On-demand relationship loading in `RelatedEntities` component
- **Request Deduplication**: Track pending promises to prevent duplicate requests
- **Abort Controllers**: Cancel in-flight requests when new requests are made

**Current Limitations**:

- No formal performance metrics collection
- No pagination in frontend (all relationships loaded at once)
- No server-side caching

**Documentation**: See [performance.md](./performance.md) for detailed performance architecture.

## Scalability

Scalability considerations balance cost, performance, and UX:

**Cost Optimization**:

- Client-side caching reduces API calls
- Lazy loading reduces initial load
- Redundant properties reduce database queries

**Performance Tradeoffs**:

- No server-side caching (cost savings, performance tradeoff)
- Single Neo4j instance (cost savings, performance limitation)
- Request deduplication (complexity tradeoff for performance gain)

**UX/UI Tradeoffs**:

- Lazy loading (better initial load, loading states on interaction)
- Top-level pre-loading (better UX, more initial API calls)
- Component-level caching (instant re-expand, potential stale data)

**Documentation**: See [scalability.md](./scalability.md) for detailed scalability architecture.

## Architecture Components Summary

| Component        | Status                 | Key Patterns                                            | Documentation                                |
| ---------------- | ---------------------- | ------------------------------------------------------- | -------------------------------------------- |
| Data Flow        | current_implementation | REST API, Neo4j queries, client-side caching            | [data-flow.md](./data-flow.md)               |
| State Management | current_implementation | useReducer, Context API, request deduplication          | [state-management.md](./state-management.md) |
| Caching          | current_implementation | Component-level cache, manual invalidation              | [caching.md](./caching.md)                   |
| Performance      | current_implementation | Query optimization, lazy loading, request deduplication | [performance.md](./performance.md)           |
| Scalability      | current_implementation | Cost optimization, performance tradeoffs, UX tradeoffs  | [scalability.md](./scalability.md)           |

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Neo4j graph database
- **Authentication**: JWT tokens
- **API**: RESTful API with JSON responses

## Related Documentation

- [System Architecture README](./README.md) - Architecture documentation overview
- [Playbooks](./playbooks/README.md) - AI-ready playbooks for working with architecture
- [API Refactoring Summary](../../backend/API_REFACTORING_SUMMARY.md) - API architecture summary
- [Complete Refactor Analysis](../../complete-refactor-analysis.md) - Strategic analysis and approach

## Change History

- **2025-11-19**: Initial baseline documentation
  - Created architecture overview
  - Documented all architecture components
  - Established baseline for Phase 1
