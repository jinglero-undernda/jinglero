# Performance Targets: Database Performance

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-24
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/index.ts`, `backend/src/server/db/schema/schema.ts`, `backend/src/server/api/`

## Overview

This document defines performance targets for Neo4j database operations. The database stores graph data with entities (Jingles, Canciones, Artistas, Fabricas, Tematicas) and relationships between them. Performance targets focus on query execution time, relationship traversal efficiency, and data loading patterns.

## Performance Targets

### Single Entity Query Performance

**Metric**: Query Execution Time  
**Target Value**: < 50ms (95th percentile) for single entity retrieval with relationships  
**Current Value**: not yet measured  
**Measurement Method**: Neo4j query execution time from Cypher query start to result return  
**Code Reference**: `backend/src/server/api/public.ts:551-704` (entity detail endpoints)

**Context**:
- Queries fetch single entity with related entities using OPTIONAL MATCH
- Example: Jingle with Fabrica, Cancion, Jinglero, Autor, Tematicas
- Uses redundant properties (`fabricaId`, `cancionId`) to reduce relationship traversals
- Critical for entity detail page performance

**Validation**:
- Profile queries using Neo4j query profiler
- Measure query execution time for entities with varying relationship counts
- Test with full dataset (1,300+ Jingles)

**Monitoring**:
- Add query execution time logging to `executeQuery` method
- Track query performance by query type
- Monitor relationship traversal counts
- Alert if p95 exceeds 50ms

---

### List Query Performance

**Metric**: Query Execution Time  
**Target Value**: < 100ms (95th percentile) for paginated list queries  
**Current Value**: not yet measured  
**Measurement Method**: Neo4j query execution time  
**Code Reference**: `backend/src/server/api/public.ts:118-135` (list endpoints)

**Context**:
- Paginated queries with SKIP and LIMIT
- Default limit: 50 items, max: 100 items
- Performance depends on dataset size and pagination offset
- Used for entity listing pages

**Validation**:
- Profile list queries with various pagination parameters
- Test with maximum dataset size
- Validate performance at different offsets (early vs. late pages)

**Monitoring**:
- Add query execution time logging
- Track query performance by entity type and pagination parameters
- Monitor query plan efficiency
- Alert if p95 exceeds 100ms

---

### Search Query Performance

**Metric**: Query Execution Time  
**Target Value**: < 200ms (95th percentile) for search queries  
**Current Value**: not yet measured  
**Measurement Method**: Neo4j query execution time (per entity type query)  
**Code Reference**: `backend/src/server/api/search.ts:76-263`

**Context**:
- Search queries execute in parallel across multiple entity types
- Supports both basic (case-insensitive contains) and fulltext search
- Fulltext search uses Neo4j fulltext indexes when available
- Target aligns with API search response time target (< 500ms total)

**Validation**:
- Profile search queries for each entity type
- Test with typical search patterns (3+ characters)
- Validate fulltext index usage and performance
- Test with full dataset

**Monitoring**:
- Add query execution time logging for search queries
- Track query performance by entity type and search mode
- Monitor fulltext index usage
- Alert if p95 exceeds 200ms

---

### Relationship Traversal Performance

**Metric**: Relationship Traversal Count  
**Target Value**: Minimize relationship traversals per query (target: < 5 traversals for complex queries)  
**Current Value**: 5 traversals for Jingle detail query  
**Measurement Method**: Count of relationship traversals in query plan  
**Code Reference**: `docs/3_system_architecture/performance.md:39-45`, `backend/src/server/db/schema/REFINEMENT_NOTES.md:142-179`

**Context**:
- Relationship traversals are expensive operations in graph databases
- Redundant properties (`fabricaId`, `cancionId`) reduce traversals
- Current Jingle detail query: 5 traversals (Fabrica, Cancion, Jinglero, Autor, Tematicas)
- With redundant properties: 0 traversals for direct property access

**Validation**:
- Analyze query plans to count relationship traversals
- Compare performance with and without redundant properties
- Validate data consistency when using redundant properties

**Monitoring**:
- Log relationship traversal counts in query plans
- Track traversal counts by query type
- Monitor redundant property usage

---

### Write Operation Performance

**Metric**: Transaction Execution Time  
**Target Value**: < 200ms (95th percentile) for write operations  
**Current Value**: not yet measured  
**Measurement Method**: Neo4j transaction execution time  
**Code Reference**: `backend/src/server/api/admin.ts` (CRUD operations)

**Context**:
- Write operations include create, update, delete for entities and relationships
- Transactions ensure data consistency
- Used for admin content management
- Less frequent than read operations

**Validation**:
- Profile write transaction execution time
- Test with relationship creation/deletion
- Validate transaction rollback performance

**Monitoring**:
- Add transaction execution time logging
- Track write performance by operation type
- Monitor transaction conflicts and retries
- Alert if p95 exceeds 200ms

---

## Performance Metrics

### Query Execution Time

**Type**: Response Time  
**Unit**: milliseconds (ms)  
**Definition**: Time to execute Neo4j Cypher query  
**Calculation**: `queryTime = queryEndTime - queryStartTime`  
**Code Reference**: `backend/src/server/db/index.ts:120-150` (executeQuery method)

**Current Value**: not yet measured  
**Baseline**: not yet established  
**Trend**: not yet tracked

**Tracking**:
- Query execution time not currently logged
- Neo4j driver provides query execution statistics
- Need to add query timing to `executeQuery` method
- Consider using Neo4j query profiler for detailed analysis

---

### Relationship Traversal Count

**Type**: Resource Usage  
**Unit**: count (number of traversals)  
**Definition**: Number of relationship traversals in query execution plan  
**Calculation**: Count from Neo4j query plan analysis  
**Code Reference**: `docs/3_system_architecture/performance.md:39-45`

**Current Value**: 
- Jingle detail: 5 traversals
- Jingle list: 1 traversal (or 0 with redundant properties)
- Search: 1 query per entity type with OPTIONAL MATCH
**Baseline**: Current implementation  
**Trend**: Optimized with redundant properties (reduces traversals)

**Tracking**:
- Manual query plan analysis
- Not automated
- Consider adding traversal count logging

---

### Index Usage

**Type**: Resource Usage  
**Unit**: count (index hits)  
**Definition**: Number of index lookups used in query execution  
**Calculation**: Count from Neo4j query plan  
**Code Reference**: `backend/src/server/db/schema/schema.ts` (schema setup with unique constraints)

**Current Value**: 
- Automatic indexes on `id` properties for all entities
- Fulltext indexes for search (when configured): `jingle_search`, `cancion_search`, `artista_search`, `tematica_search`
**Baseline**: Automatic indexing on unique constraints  
**Trend**: Fulltext indexes added for search optimization

**Tracking**:
- Query plan analysis shows index usage
- Not automated
- Monitor index hit rates

---

### Database Connection Pool

**Type**: Resource Usage  
**Unit**: count (active connections)  
**Definition**: Number of active Neo4j database connections  
**Calculation**: Neo4j driver connection pool metrics  
**Code Reference**: `backend/src/server/db/index.ts:10-191` (Neo4jClient class)

**Current Value**: not yet measured  
**Baseline**: not yet established  
**Trend**: not yet tracked

**Tracking**:
- Neo4j driver provides connection pool metrics
- Need to add connection pool monitoring
- Monitor connection pool size and usage

---

## Monitoring Strategy

### Monitoring Tools

#### Neo4j Query Profiler
- **Purpose**: Analyze query execution plans and performance
- **Configuration**: Neo4j Browser or Neo4j Desktop
- **Usage**: Manual query profiling for optimization; not automated

#### Neo4j Metrics
- **Purpose**: Monitor database health and performance
- **Configuration**: Neo4j AuraDB metrics or local instance metrics
- **Usage**: Database-level metrics (CPU, memory, query performance)

#### Application Logging
- **Purpose**: Log query execution times and errors
- **Configuration**: `backend/src/server/db/index.ts`
- **Usage**: Currently minimal; need to add query timing and error logging

### Alerting Rules

#### Slow Query Alert
- **Condition**: Query execution time exceeds target for 5+ occurrences
- **Threshold**: 
  - Single entity: > 50ms
  - List queries: > 100ms
  - Search queries: > 200ms
  - Write operations: > 200ms
- **Action**: Alert development team, investigate query performance

#### Database Connection Error Alert
- **Condition**: Database connection failures or pool exhaustion
- **Threshold**: Connection error rate > 1%
- **Action**: Alert development team, investigate connection issues

### Dashboards

#### Database Performance Dashboard
- **Purpose**: Monitor database query performance and health
- **Metrics**: 
  - Query execution time by query type
  - Relationship traversal counts
  - Index usage statistics
  - Connection pool metrics
  - Database resource usage (CPU, memory)
- **Location**: Not yet implemented - need to set up monitoring dashboard

---

## Optimization Opportunities

### Current Performance

#### Query Optimization Patterns
- **Current State**: Uses OPTIONAL MATCH patterns, redundant properties, pagination
- **Bottlenecks**: Some queries may have N+1 patterns
- **Issues**: No query performance monitoring

#### Index Usage
- **Current State**: Automatic indexes on `id` properties, fulltext indexes for search
- **Bottlenecks**: May need composite indexes for common query patterns
- **Issues**: Fulltext indexes may not be configured in all environments

### Optimization Opportunities

#### Add Query Performance Monitoring
- **Description**: Implement query execution time logging
- **Impact**: Enable query performance tracking and optimization
- **Effort**: Low (1 day)
- **Cost**: Minimal (logging overhead)

#### Optimize Query Plans
- **Description**: Profile and optimize slow queries
- **Impact**: Reduce query execution time
- **Effort**: Medium (2-3 days)
- **Cost**: Minimal (development time)

#### Add Composite Indexes
- **Description**: Create composite indexes for common query patterns
- **Impact**: Improve query performance for filtered searches
- **Effort**: Low (1 day)
- **Cost**: Minimal (index storage overhead)

#### Expand Redundant Properties Usage
- **Description**: Use redundant properties more extensively to reduce traversals
- **Impact**: Reduce relationship traversal overhead
- **Effort**: Medium (2-3 days)
- **Cost**: Additional storage and data consistency maintenance

#### Implement Query Result Caching
- **Description**: Cache frequently accessed query results
- **Impact**: Reduce database load for repeated queries
- **Effort**: High (3-5 days)
- **Cost**: Additional memory usage

### Cost Analysis

#### Current Cost
- **Database**: Neo4j AuraDB or local instance
- **Storage**: Graph database storage for entities and relationships
- **Monitoring**: None (no monitoring tools)

#### Optimization Impact
- **Indexes**: Minimal storage overhead
- **Caching**: May require additional memory/Redis instance
- **Monitoring**: May require additional infrastructure
- **Cost Tradeoffs**: Performance improvements may reduce query costs and improve user experience

---

## Change History

- **2025-11-24**: Initial performance documentation created
  - Documented database performance targets
  - Documented current query patterns and optimizations
  - Noted absence of query performance monitoring
  - Identified optimization opportunities


