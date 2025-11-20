# State Management Architecture

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx`, `frontend/src/context/AuthProvider.tsx`

## Overview

The frontend uses React's built-in state management with a combination of `useState`, `useReducer`, and Context API. State is managed at component level with some shared context for authentication.

## Frontend State

### React State Patterns

**Pattern 1: useReducer for Complex State**

- **Usage**: `RelatedEntities` component manages complex relationship state
- **State Structure**:
  ```typescript
  {
    expandedRelationships: Set<string>,
    expandedEntities: Set<string>,
    loadedData: Record<string, RelatedEntity[]>,
    loadingStates: Record<string, boolean>,
    counts: Record<string, number>,
    inFlightRequests: Record<string, AbortController>,
    errors: Record<string, Error | null>
  }
  ```
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:94-104` (state type), `frontend/src/components/common/RelatedEntities.tsx:1086-1096` (initial state), `frontend/src/components/common/RelatedEntities.tsx:1096` (useReducer)

**Pattern 2: useState for Simple State**

- **Usage**: Component-level UI state, form state, loading states
- **Examples**:
  - `useState<Fabrica[]>([])` for entity lists
  - `useState<boolean>(false)` for loading flags
  - `useState<string>('')` for form inputs
- **Code Reference**: `frontend/src/pages/Home.tsx:11-13` (featured fabricas state)

**Pattern 3: useRef for Mutable Values**

- **Usage**: Cache storage, pending requests tracking, state refs for async callbacks
- **Examples**:
  - `requestCacheRef` for request caching
  - `pendingRequestsRef` for request deduplication
  - `stateRef` for accessing latest state in async callbacks
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1120-1123` (refs), `frontend/src/components/common/RelatedEntities.tsx:1107-1117` (state ref)

### Context Usage

**AuthContext**: Authentication state management

- **Provider**: `AuthProvider` component
- **State**: User object, login/logout functions
- **Storage**: localStorage for persistence
- **Code Reference**: `frontend/src/context/AuthProvider.tsx:10-56` (AuthProvider implementation)

**Usage Pattern**:

```typescript
const { user, login, logout } = useContext(AuthContext);
```

**Code Reference**: `frontend/src/context/AuthProvider.tsx:45-49` (context value)

### State Management Libraries

**Current**: No external state management library

- Uses React built-in hooks only
- No Redux, Zustand, or other state management libraries

## Backend State

### Session Management

**Pattern**: JWT-based authentication

- Tokens stored in localStorage on frontend
- Token sent in Authorization header for admin API requests
- Token validation on backend via middleware
- **Code Reference**: `frontend/src/lib/api/client.ts:289-308` (token management), `backend/src/server/middleware/auth.ts` (auth middleware)

### Server-Side State

**Current**: Stateless backend

- No server-side session storage
- All state persisted in Neo4j database
- JWT tokens contain authentication claims only

### State Persistence

**Frontend**:

- Authentication state: localStorage
- Component state: In-memory only (lost on navigation)
- Cache: Component lifecycle (lost on unmount)

**Backend**:

- All data persisted in Neo4j database
- No in-memory state between requests

## State Patterns

### State Update Patterns

**Pattern 1: Reducer Actions**

- **Usage**: Complex state updates in RelatedEntities
- **Actions**: `TOGGLE_RELATIONSHIP`, `LOAD_START`, `LOAD_SUCCESS`, `LOAD_ERROR`, `CLEAR_IN_FLIGHT`, `CLEAR_ERROR`
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:106-113` (action types)

**Pattern 2: Direct State Updates**

- **Usage**: Simple state updates with useState
- **Example**: `setLoading(true)`, `setData(newData)`

**Pattern 3: Functional Updates**

- **Usage**: Updates based on previous state
- **Example**: `setCount(prev => prev + 1)`

### State Sharing Patterns

**Pattern 1: Props Drilling**

- **Usage**: Passing state down component tree via props
- **Limitation**: Can become verbose for deep hierarchies

**Pattern 2: Context API**

- **Usage**: Shared authentication state
- **Scope**: Global authentication only

**Pattern 3: Component State**

- **Usage**: Most state is component-local
- **Benefit**: Clear ownership and lifecycle

### State Synchronization Patterns

**Pattern 1: Request Deduplication**

- **Usage**: Prevent duplicate API requests
- **Implementation**: Track pending promises in ref
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1120` (pendingRequestsRef), `frontend/src/components/common/RelatedEntities.tsx:1558-1561` (deduplication check)

**Pattern 2: Abort Controllers**

- **Usage**: Cancel in-flight requests
- **Implementation**: Store AbortController in state, cancel on new request
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1130-1139` (cancelInFlightRequest)

**Pattern 3: Cache Invalidation**

- **Usage**: Clear cache when data changes
- **Implementation**: Delete cache entries on refresh
- **Code Reference**: `frontend/src/components/common/RelatedEntities.tsx:1154-1155` (cache clearing)

## Implementation

### Component State Management

- **Location**: `frontend/src/components/common/RelatedEntities.tsx`
- **Pattern**: useReducer for complex state, useState for simple state
- **Features**: Request deduplication, caching, error handling

### Authentication State

- **Location**: `frontend/src/context/AuthProvider.tsx`
- **Pattern**: Context API with localStorage persistence
- **Features**: Login/logout, token management

### API State Management

- **Location**: `frontend/src/lib/api/client.ts`
- **Pattern**: Stateless API client (no internal state)
- **Features**: Retry logic, error handling, offline detection

## Change History

- **2025-11-19**: Initial baseline documentation
  - Documented useReducer pattern in RelatedEntities
  - Documented Context API for authentication
  - Documented state synchronization patterns
  - Documented request deduplication and caching
