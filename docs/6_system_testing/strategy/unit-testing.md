# Testing Strategy: Unit Tests

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-20
- **Last Validated**: 2025-11-20 (see validation-report-2025-11-20.md)
- **Code Reference**: `frontend/src/**/__tests__/*.test.tsx`, `backend/tests/**/*.test.ts`

## Overview

Unit tests verify individual components, functions, and utilities in isolation. They are the foundation of the testing pyramid and should be fast, focused, and comprehensive.

## Testing Approach

### Frontend Unit Tests

**Framework**: Vitest with React Testing Library

**Patterns:**

- Component rendering and props
- User interactions (clicks, form submissions)
- Accessibility checks
- Edge cases and error states
- Fallback data handling

**Tools and Frameworks:**

- **Framework**: Vitest 3.2.4
- **Configuration**: `frontend/vitest.config.ts:1`
- **Testing Library**: @testing-library/react 14.0.0
- **User Events**: @testing-library/user-event 14.6.1
- **DOM Matchers**: @testing-library/jest-dom 6.9.1
- **Environment**: happy-dom 20.0.7

**Test Utilities:**

- Custom render function: `frontend/src/__tests__/test-utils.tsx:9`
- Providers included: QueryClient, BrowserRouter, ToastProvider
- Setup file: `frontend/src/__tests__/setup.ts:1`

### Backend Unit Tests

**Framework**: Jest with TypeScript

**Patterns:**

- Function logic and calculations
- Data transformation utilities
- Validation functions
- Error handling
- Edge cases

**Tools and Frameworks:**

- **Framework**: Jest 29.7.0
- **Configuration**: `backend/jest.config.js:1`
- **TypeScript**: ts-jest 29.1.1
- **Environment**: Node.js

## Coverage Goals

### Target Coverage

- **Overall**: 70% (MVP goal)
- **Lines**: 70%
- **Functions**: 75%
- **Branches**: 65%

### Current Coverage

- **Overall**: Not yet measured
- **Lines**: Not yet measured
- **Functions**: Not yet measured
- **Branches**: Not yet measured

### Priority Areas (From PRD)

1. **Critical Components**:
   - SearchBar component
   - EntityCard component
   - Admin entity management
2. **Critical Utilities**:
   - Timestamp conversion (`timestampToSeconds`)
   - Order calculation (`updateAppearsInOrder`)
   - ID generation
   - Redundant property synchronization

## Test Patterns

### Component Testing (Frontend)

#### Basic Component Rendering

- **Description**: Test component renders with required props
- **Usage**: All component tests
- **Code Reference**: `frontend/src/components/__tests__/SearchBar.test.tsx:6`

```typescript
it("renders with default placeholder", () => {
  render(<SearchBar onSearch={() => {}} />);
  expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
});
```

#### User Interaction Testing

- **Description**: Test user interactions (clicks, form submissions, input changes)
- **Usage**: Interactive components
- **Code Reference**: `frontend/src/components/__tests__/SearchBar.test.tsx:16`

```typescript
it("calls onSearch with input value when form is submitted", async () => {
  const mockOnSearch = vi.fn();
  render(<SearchBar onSearch={mockOnSearch} />);

  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "test query" } });
  fireEvent.submit(screen.getByRole("search"));

  expect(mockOnSearch).toHaveBeenCalledWith("test query");
});
```

#### Accessibility Testing

- **Description**: Verify ARIA labels and accessible elements
- **Usage**: All user-facing components
- **Code Reference**: `frontend/src/components/__tests__/SearchBar.test.tsx:30`

```typescript
it("has accessible labels", () => {
  render(<SearchBar onSearch={() => {}} />);
  expect(screen.getByLabelText("Campo de búsqueda")).toBeInTheDocument();
});
```

#### Fallback Data Handling

- **Description**: Test components handle missing or undefined data gracefully
- **Usage**: Entity display components
- **Code Reference**: `frontend/src/components/__tests__/EntityCard.test.tsx:119`

```typescript
it('shows "A CONFIRMAR" when Fabrica has no title', () => {
  const fabrica = createMockFabrica({ title: undefined });
  render(<EntityCard entity={fabrica} entityType="fabrica" />);
  expect(screen.getByText("A CONFIRMAR")).toBeInTheDocument();
});
```

#### Edge Cases

- **Description**: Test long text, missing data, boundary conditions
- **Usage**: All components handling user data
- **Code Reference**: `frontend/src/components/__tests__/EntityCard.test.tsx:358`

```typescript
it("handles long text gracefully with word-wrap", () => {
  const longTitle = "A".repeat(200);
  const fabrica = createMockFabrica({ title: longTitle });
  render(<EntityCard entity={fabrica} entityType="fabrica" />);
  expect(screen.getByText(longTitle)).toBeInTheDocument();
});
```

### Function Testing (Backend)

#### Utility Function Testing

- **Description**: Test pure functions with various inputs
- **Usage**: Calculation and transformation utilities
- **Code Reference**: `backend/tests/server/api/appears-in-order.test.ts:29`

```typescript
describe("timestampToSeconds conversion", () => {
  it("should convert HH:MM:SS to seconds correctly", () => {
    const { timestampToSeconds } = require("../../../src/server/api/admin");
    expect(timestampToSeconds("00:00:00")).toBe(0);
    expect(timestampToSeconds("01:30:45")).toBe(5445);
  });
});
```

#### Error Handling

- **Description**: Test error cases and edge conditions
- **Usage**: Functions that handle user input or external data
- **Code Reference**: `backend/tests/server/api/appears-in-order.test.ts:279`

```typescript
describe("error handling", () => {
  it("should handle invalid Fabrica ID gracefully", async () => {
    const { updateAppearsInOrder } = require("../../../src/server/api/admin");
    mockDb.executeQuery.mockResolvedValueOnce([]);

    await updateAppearsInOrder("invalid-fabrica-id");

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Fabrica invalid-fabrica-id not found")
    );
  });
});
```

#### Mocking Patterns

- **Description**: Mock external dependencies (database, APIs)
- **Usage**: Functions that interact with external systems
- **Code Reference**: `backend/tests/server/api/appears-in-order.test.ts:11`

```typescript
jest.mock("../../../src/server/db", () => ({
  Neo4jClient: {
    getInstance: jest.fn(() => ({
      executeQuery: jest.fn(),
    })),
  },
}));
```

## Implementation

### Frontend Test Locations

- Component tests: `frontend/src/components/**/__tests__/*.test.tsx`
- Page tests: `frontend/src/pages/**/__tests__/*.test.tsx`
- Utility tests: `frontend/src/__tests__/*.test.tsx`

### Backend Test Locations

- API tests: `backend/tests/server/api/*.test.ts`
- Database tests: `backend/tests/server/db/*.test.ts`
- Schema tests: `backend/tests/server/schema.test.ts`

### Test File Naming

- Frontend: `*.test.tsx` or `*.test.ts`
- Backend: `*.test.ts`

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Clear Names**: Test names should describe what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear sections
4. **Mock External Dependencies**: Don't rely on real databases or APIs in unit tests
5. **Test Edge Cases**: Include boundary conditions and error states
6. **Accessibility**: Include accessibility checks for UI components
7. **Fast Execution**: Unit tests should run quickly (< 1 second each)

## Coverage Gaps

### Frontend

- Many components lack unit tests
- Admin pages need more comprehensive testing
- Error boundary components not yet tested
- Form validation not fully covered

### Backend

- Many API endpoints lack unit tests
- Database query utilities need more coverage
- Validation functions need comprehensive testing
- Error handling in middleware not fully tested

## Change History

- **2025-11-20**: Initial unit testing strategy documentation created
