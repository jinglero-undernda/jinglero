# Caching Architecture

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1122-1155`

## Overview

The system currently implements client-side request caching at the component level. Server-side caching is not implemented. Caching is used to avoid redundant API calls for relationship data.

## Client-Side Caching

### Request Caching

**Pattern**: Component-level in-memory cache using useRef
- **Implementation**: `requestCacheRef` stores fetched relationship data
- **Cache Key**: `${entityId}-${entityType}-${relationshipKey}`
- **Scope**: Component lifecycle (cleared on unmount)
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1122-1128` (cache implementation)

**Cache Key Generation**:
```typescript
const getCacheKey = (entityId: string, entityType: string, relKey: string) => {
  return `${entityId}-${entityType}-${relKey}`;
};
```
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1126-1128`

**Cache Lookup**:
- Check cache before making API request (User Mode only)
- If cache hit, use cached data and skip API call
- If cache miss, make API request and store result
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1522-1535` (cache lookup)

**Cache Storage**:
- Stored in `useRef` to persist across renders without causing re-renders
- Type: `Record<string, RelatedEntity[]>`
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1123` (cache ref)

### Cache Invalidation

**Pattern**: Manual cache clearing on refresh
- **Trigger**: `refresh()` method called explicitly
- **Action**: Delete cache entries for all relationships
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1142-1169` (refresh method)

**Cache Clearing Strategy**:
1. Cancel in-flight requests
2. Delete cache entries from `requestCacheRef`
3. Clear pending promises
4. Re-fetch data from API
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1152-1156` (cache clearing)

**Admin Mode Behavior**:
- Cache is cleared before fetching fresh data
- Ensures admin always sees latest data
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1553-1554` (admin mode cache clearing)

**User Mode Behavior**:
- Cache is checked before API requests
- Cached data used if available
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1522-1535` (user mode cache check)

## Server-Side Caching

### API Response Caching

**Current Status**: Not implemented
- All API requests hit Neo4j database directly
- No response caching layer (Redis, in-memory cache, etc.)
- Every request executes fresh database queries

### Database Query Caching

**Current Status**: Not implemented
- Neo4j query results not cached
- No query result caching layer
- Each query executes against live database

### Cache Invalidation

**N/A**: No server-side caching to invalidate

## Caching Patterns

### Cache Key Strategies

**Pattern**: Composite key with entity context
- **Format**: `${entityId}-${entityType}-${relationshipKey}`
- **Components**: Entity ID, entity type, relationship identifier
- **Uniqueness**: Ensures cache keys are unique per entity-relationship combination
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1126-1128` (key generation)

### Cache Expiration

**Current**: No expiration
- Cache persists for component lifecycle
- No TTL (Time To Live) mechanism
- Cache cleared only on explicit refresh or component unmount

### Cache Invalidation Strategies

**Strategy 1: Manual Refresh**
- Component exposes `refresh()` method
- Parent components can trigger cache invalidation
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1142-1169`

**Strategy 2: Component Unmount**
- Cache automatically cleared when component unmounts
- React handles cleanup of refs

**Strategy 3: Admin Mode Override**
- Admin mode always clears cache before fetching
- Ensures fresh data for admin operations
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1553-1554`

## Implementation

### Component-Level Caching
- **Location**: `frontend/src/components/common/RelatedEntities.tsx`
- **Pattern**: useRef for cache storage
- **Scope**: Component lifecycle
- **Features**: Cache lookup, cache storage, cache invalidation

### Cache Key Generation
- **Location**: `frontend/src/components/common/RelatedEntities.tsx:1126-1128`
- **Pattern**: Composite string key
- **Format**: `${entityId}-${entityType}-${relationshipKey}`

### Cache Invalidation
- **Location**: `frontend/src/components/common/RelatedEntities.tsx:1142-1169`
- **Pattern**: Manual refresh method
- **Trigger**: Explicit call from parent component

## Future Considerations

### Potential Enhancements

1. **TTL-Based Expiration**
   - Add timestamp to cache entries
   - Expire entries after configurable TTL
   - Automatic cache cleanup

2. **Server-Side Caching**
   - Redis for API response caching
   - Cache invalidation on data mutations
   - Reduced database load

3. **Browser Cache**
   - HTTP cache headers (ETag, Last-Modified)
   - Conditional requests (304 Not Modified)
   - Reduced network traffic

4. **Query Result Caching**
   - Cache Neo4j query results
   - Invalidate on data changes
   - Performance improvement for read-heavy operations

## Change History

- **2025-11-19**: Initial baseline documentation
  - Documented component-level request caching
  - Documented cache key strategy
  - Documented cache invalidation patterns
  - Noted absence of server-side caching


