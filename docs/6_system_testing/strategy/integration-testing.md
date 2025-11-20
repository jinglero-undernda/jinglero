# Testing Strategy: Integration Tests

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-20
- **Last Validated**: 2025-11-20 (see validation-report-2025-11-20.md)
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:1`, `backend/tests/server/api/*.test.ts`

## Overview

Integration tests verify that multiple components, services, or modules work together correctly. They test interactions between different parts of the system while still using mocks for external dependencies.

## Testing Approach

### Frontend Integration Tests

**Patterns:**
- Component interactions with services
- Data flow through multiple components
- State management across components
- Request cancellation and deduplication
- Error handling and retry logic

**Tools and Frameworks:**
- **Framework**: Vitest 3.2.4
- **Testing Library**: @testing-library/react 14.0.0
- **User Events**: @testing-library/user-event 14.6.1
- **Mocking**: Vitest `vi.mock()`

### Backend Integration Tests

**Patterns:**
- API endpoint testing with mocked database
- Database operation sequences
- Relationship management workflows
- Order calculation and synchronization
- Transaction handling

**Tools and Frameworks:**
- **Framework**: Jest 29.7.0
- **Mocking**: Jest mocks for Neo4jClient
- **TypeScript**: ts-jest 29.1.1

## Coverage Goals

### Target Coverage
- **Overall**: 60% (MVP goal)
- **Critical Flows**: 80%
- **API Endpoints**: 70%
- **Component Integration**: 60%

### Current Coverage
- **Overall**: Not yet measured
- **Critical Flows**: Partial (RelatedEntities, order management)
- **API Endpoints**: Partial (admin endpoints)
- **Component Integration**: Partial

### Priority Areas (From PRD)
1. **Critical Integration Points**:
   - Search → Results → Entity Detail navigation
   - Video player → Jingle metadata updates
   - Admin CRUD → Relationship updates
   - Order calculation on relationship changes
2. **Data Integrity**:
   - Relationship creation/deletion
   - Redundant property synchronization
   - Order recalculation workflows

## Test Patterns

### Component Integration Testing (Frontend)

#### Service Integration with Mocking
- **Description**: Test components that fetch data from services
- **Usage**: Components using relationshipService, searchService
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:8`

```typescript
vi.mock('../../../lib/services/relationshipService', () => ({
  fetchFabricaJingles: vi.fn(),
  fetchJingleFabrica: vi.fn(),
  // ... other service functions
}));
```

#### Lazy Loading (User Mode)
- **Description**: Test that relationships load on demand in user mode
- **Usage**: RelatedEntities component in user context
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:52`

```typescript
it('should not load relationships on mount in User Mode', async () => {
  const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
  const mockFetch = vi.mocked(fetchFabricaJingles);
  
  render(<RelatedEntities entity={mockFabrica} entityType="fabrica" isAdmin={false} />);
  
  expect(mockFetch).not.toHaveBeenCalled();
});
```

#### Eager Loading (Admin Mode)
- **Description**: Test that relationships load immediately in admin mode
- **Usage**: RelatedEntities component in admin context
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:116`

```typescript
it('should load all relationships on mount in Admin Mode', async () => {
  render(<RelatedEntities entity={mockFabrica} entityType="fabrica" isAdmin={true} />);
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith('fabrica-1', 'fabrica');
  });
});
```

#### Request Cancellation
- **Description**: Test that rapid toggling cancels previous requests
- **Usage**: Components with async data loading
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:148`

```typescript
it('should cancel previous request when toggling rapidly', async () => {
  // Create controlled promise
  let resolveFirst: (value: Jingle[]) => void;
  const firstPromise = new Promise<Jingle[]>((resolve) => {
    resolveFirst = resolve;
  });
  
  mockFetch.mockReturnValueOnce(firstPromise);
  
  // Click expand, then collapse, then expand again
  await userEvent.click(expandButton);
  await userEvent.click(expandButton);
  await userEvent.click(expandButton);
  
  // Resolve first request (should be ignored)
  resolveFirst!(mockJingles);
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

#### Request Deduplication
- **Description**: Test that multiple rapid clicks only trigger one request
- **Usage**: Components with expandable sections
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:202`

```typescript
it('should deduplicate multiple rapid clicks on same relationship', async () => {
  const expandButton = screen.getByLabelText(/expandir jingles/i);
  
  await userEvent.click(expandButton);
  await userEvent.click(expandButton);
  await userEvent.click(expandButton);
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

#### Cycle Prevention
- **Description**: Test that entityPath prevents circular navigation
- **Usage**: RelatedEntities in user mode
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:241`

```typescript
it('should filter out entities in entityPath to prevent cycles', async () => {
  const jinglesWithCycle: Jingle[] = [
    { ...mockJingle, id: 'jingle-1' },
    { ...mockJingle, id: 'fabrica-1' } as any, // Should be filtered
  ];
  
  render(
    <RelatedEntities
      entity={mockFabrica}
      entityType="fabrica"
      entityPath={['fabrica-1']}
      isAdmin={false}
    />
  );
  
  await userEvent.click(expandButton);
  
  await waitFor(() => {
    expect(screen.queryByText(/fabrica-1/i)).not.toBeInTheDocument();
  });
});
```

#### Error Handling and Retry
- **Description**: Test error states and retry functionality
- **Usage**: Components with async data loading
- **Code Reference**: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:328`

```typescript
it('should display error message when API call fails', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'));
  
  render(<RelatedEntities entity={mockFabrica} entityType="fabrica" isAdmin={false} />);
  
  await userEvent.click(expandButton);
  
  await waitFor(() => {
    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument();
  });
});

it('should allow retry after error', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'));
  mockFetch.mockResolvedValueOnce(mockJingles);
  
  // ... trigger error, then retry
  const retryButton = screen.getByLabelText(/reintentar/i);
  await userEvent.click(retryButton);
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

### API Integration Testing (Backend)

#### Order Management Workflow
- **Description**: Test complete order calculation and update workflow
- **Usage**: APPEARS_IN relationship management
- **Code Reference**: `backend/tests/server/api/appears-in-order.test.ts:50`

```typescript
describe('updateAppearsInOrder functionality', () => {
  it('should calculate orders based on timestamp sorting', async () => {
    const { updateAppearsInOrder } = require('../../../src/server/api/admin');
    
    mockDb.executeQuery
      .mockResolvedValueOnce([
        { jingleId: 'j1', timestamp: '00:05:00' },
        { jingleId: 'j2', timestamp: '00:02:30' },
        { jingleId: 'j3', timestamp: '00:10:15' },
      ])
      .mockResolvedValueOnce([]);
    
    await updateAppearsInOrder('fabrica1');
    
    const updateCall = mockDb.executeQuery.mock.calls[1];
    expect(updateCall[1].updates).toEqual([
      { jingleId: 'j2', order: 1 }, // Earliest timestamp
      { jingleId: 'j1', order: 2 },
      { jingleId: 'j3', order: 3 }, // Latest timestamp
    ]);
  });
});
```

#### Relationship Change Workflows
- **Description**: Test order recalculation on relationship CRUD operations
- **Usage**: Relationship creation, update, deletion
- **Code Reference**: `backend/tests/server/api/appears-in-order.test.ts:131`

```typescript
describe('order management on relationship update', () => {
  it('should recalculate orders when timestamp changes', async () => {
    mockDb.executeQuery
      .mockResolvedValueOnce([
        { jingleId: 'j1', timestamp: '00:05:00' }, // Was 00:10:00, now earlier
        { jingleId: 'j2', timestamp: '00:15:00' },
      ])
      .mockResolvedValueOnce([]);
    
    await updateAppearsInOrder('fabrica1');
    
    const updateCall = mockDb.executeQuery.mock.calls[1];
    expect(updateCall[1].updates).toEqual([
      { jingleId: 'j1', order: 1 }, // Now first
      { jingleId: 'j2', order: 2 },
    ]);
  });
});
```

#### Redundant Property Synchronization
- **Description**: Test that relationship changes trigger property updates
- **Usage**: Relationship CRUD operations
- **Code Reference**: `backend/tests/server/api/redundant-properties.test.ts:21`

```typescript
describe('Redundant Property Synchronization', () => {
  it('should update redundant properties on relationship creation', async () => {
    const { updateRedundantPropertiesOnRelationshipChange } = require('../../../src/server/api/admin');
    
    mockDb.executeQuery.mockResolvedValue([]);
    
    await updateRedundantPropertiesOnRelationshipChange('APPEARS_IN', 'j1', 'fab1', 'create');
    
    expect(mockDb.executeQuery).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      undefined,
      true // isWrite
    );
  });
});
```

#### Transaction Consistency
- **Description**: Test that write operations use transactional writes
- **Usage**: All relationship and entity updates
- **Code Reference**: `backend/tests/server/api/redundant-properties.test.ts:396`

```typescript
it('should use transactional writes (isWrite=true)', async () => {
  await updateRedundantPropertiesOnRelationshipChange('APPEARS_IN', 'j1', 'fab1', 'create');
  
  expect(mockDb.executeQuery).toHaveBeenCalledWith(
    expect.any(String),
    expect.any(Object),
    undefined,
    true // isWrite
  );
});
```

## Implementation

### Frontend Integration Test Locations
- Component integration: `frontend/src/components/**/__tests__/*.integration.test.tsx`
- Page integration: `frontend/src/pages/**/__tests__/*.integration.test.tsx`

### Backend Integration Test Locations
- API integration: `backend/tests/server/api/*.test.ts`
- Database integration: `backend/tests/server/db/*.test.ts`

## Best Practices

1. **Mock External Dependencies**: Use mocks for databases, APIs, and services
2. **Test Real Interactions**: Test actual component/service interactions
3. **Async Handling**: Properly handle async operations with `waitFor` and `await`
4. **Error Scenarios**: Test error paths and recovery
5. **State Transitions**: Test state changes and side effects
6. **Request Management**: Test cancellation, deduplication, and retry logic

## Coverage Gaps

### Frontend
- Search → Results → Detail page navigation not fully tested
- Video player integration with metadata updates not tested
- Admin form submission workflows need more coverage
- Multi-step user flows not yet tested

### Backend
- Complete API request/response cycles not fully tested
- Authentication middleware integration not tested
- Database transaction rollback scenarios not tested
- Concurrent operation handling not tested

## Change History

- **2025-11-20**: Initial integration testing strategy documentation created

