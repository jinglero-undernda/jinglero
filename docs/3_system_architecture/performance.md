# Performance Architecture

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `backend/src/server/db/index.ts`, `backend/src/server/api/`, `frontend/src/components/common/RelatedEntities.tsx`

## Overview

Performance optimizations focus on reducing database queries, preventing redundant API calls, and optimizing data loading patterns. The system uses request deduplication, caching, and query optimization strategies.

## Query Optimization

### Database Query Patterns

**Pattern 1: Direct Property Access (Redundant Properties)**

- **Purpose**: Reduce relationship traversals for common queries
- **Implementation**: Store `fabricaId` and `cancionId` directly on Jingle nodes
- **Benefit**: Eliminates 2 relationship traversals per Jingle fetch
- **Tradeoff**: Requires maintaining redundant data consistency
- **Code Reference**: `docs/backend/src/server/db/schema/REFINEMENT_NOTES.md:142-179` (redundant properties discussion)

**Pattern 2: OPTIONAL MATCH for Related Entities**

- **Purpose**: Fetch related entities in single query
- **Implementation**: Use OPTIONAL MATCH to include related data
- **Example**: Fetch Jingle with Fabrica, Cancion, Artistas, Tematicas in one query
- **Code Reference**: `backend/src/server/api/search.ts:199-214` (canciones query with OPTIONAL MATCH)

**Pattern 3: Pagination**

- **Purpose**: Limit result sets to manageable sizes
- **Implementation**: SKIP and LIMIT in Cypher queries
- **Parameters**: `limit` (1-100), `offset` (0+)
- **Code Reference**: `backend/src/server/api/search.ts:88-91` (pagination setup), `backend/src/server/api/search.ts:193-195` (query pagination)

### Query Performance

**Current Query Complexity**:

- **Jingle Detail**: 5 relationship traversals (Fabrica, Cancion, Jinglero, Autor, Tematicas)
- **Jingle List**: 1 traversal per Jingle (if using redundant properties: 0 traversals)
- **Search**: 1 query per entity type with OPTIONAL MATCH for related data

**Performance Metrics**:

- No formal performance metrics collected
- Query performance depends on Neo4j database size and indexing

### Index Usage

**Current**: Neo4j automatic indexing on `id` properties

- All entities have unique `id` property
- Neo4j creates automatic indexes for unique constraints
- **Code Reference**: `backend/src/server/db/schema/schema.ts` (schema setup)

**Potential Optimizations**:

- Full-text indexes for search queries
- Composite indexes for common query patterns
- Relationship property indexes for filtering

## Data Loading

### Lazy Loading Patterns

**Pattern 1: On-Demand Relationship Loading**

- **Usage**: RelatedEntities component loads relationships when expanded
- **Implementation**: Fetch relationship data only when user expands relationship section
- **Benefit**: Reduces initial page load time
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1480-1636` (lazy loading logic)

**Pattern 2: Initial Data Pre-loading**

- **Usage**: Top-level entities (entityPath.length <= 1) pre-load all relationships
- **Implementation**: Auto-expand and load all relationships on mount
- **Benefit**: Immediate data availability for top-level views
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1077-1084` (initial expansion)

**Pattern 3: Conditional Loading**

- **Usage**: Skip loading if data already exists
- **Implementation**: Check `loadedData` before making API request
- **Benefit**: Prevents redundant API calls
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1518-1520` (skip if loaded)

### Pagination Strategies

**Current**: No pagination in frontend

- All relationship data loaded at once
- No "load more" or infinite scroll
- Potential performance issue for entities with many relationships

**Backend Support**: Pagination available in API

- `limit` and `offset` query parameters supported
- **Code Reference**: `backend/src/server/api/public.ts` (pagination in entity endpoints)

### Data Prefetching

**Current**: No prefetching

- Data loaded only when requested
- No predictive loading of likely-needed data

**Potential**: Prefetch related entities on hover or navigation intent

## Rendering Optimization

### Component Optimization

**Pattern 1: Request Deduplication**

- **Purpose**: Prevent duplicate API requests
- **Implementation**: Track pending promises in ref
- **Benefit**: Eliminates redundant network requests
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1120` (pendingRequestsRef), `frontend/src/components/common/RelatedEntities.tsx:1558-1561` (deduplication)

**Pattern 2: Abort Controllers**

- **Purpose**: Cancel in-flight requests when new request made
- **Implementation**: Store AbortController in state, abort on new request
- **Benefit**: Prevents race conditions and unnecessary network traffic
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1130-1139` (cancelInFlightRequest)

**Pattern 3: Memoization (Potential)**

- **Status**: Not currently implemented
- **Potential**: Use `React.memo`, `useMemo`, `useCallback` for expensive operations
- **Reference**: `tasks/SUPERSEDED/2025-11-01_REFACTORING_TASKS.md:207-248` (memoization tasks)

### Rendering Patterns

**Current**: Standard React rendering

- No virtual scrolling
- No code splitting for routes
- Standard component rendering

**Performance Considerations**:

- Large lists may cause performance issues
- No virtualization for long entity lists

## Performance Metrics

**Current**: No formal performance metrics

- No response time tracking
- No query performance monitoring
- No frontend performance metrics (Lighthouse, etc.)

**Potential Metrics**:

- API response times
- Database query execution times
- Frontend render times
- Time to interactive (TTI)
- First contentful paint (FCP)

## Implementation

### Query Optimization

- **Location**: `backend/src/server/api/` (API routers)
- **Pattern**: Cypher queries with OPTIONAL MATCH, pagination
- **Features**: Redundant properties, relationship traversal optimization

### Data Loading

- **Location**: `frontend/src/components/common/RelatedEntities.tsx`
- **Pattern**: Lazy loading with on-demand fetching
- **Features**: Request deduplication, abort controllers, caching

### Rendering

- **Location**: `frontend/src/components/` (React components)
- **Pattern**: Standard React rendering
- **Features**: Component-level state management

## Change History

- **2025-11-19**: Initial baseline documentation
  - Documented query optimization patterns
  - Documented lazy loading implementation
  - Documented request deduplication
  - Noted absence of formal performance metrics
