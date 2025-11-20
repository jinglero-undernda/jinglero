# Testing Strategy Overview

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-20
- **Version**: 1.0

## Purpose

This document provides an overview of the testing strategy for "La Usina de la Fabrica de Jingles" platform. The strategy covers unit tests, integration tests, and E2E tests (planned) across both frontend (React) and backend (Node.js/Express) codebases.

## Test Types

### Unit Tests
- **Status**: current_implementation
- **Frontend**: Vitest with React Testing Library
- **Backend**: Jest with TypeScript
- **Coverage**: Partial - focused on critical components and utilities
- **Documentation**: `strategy/unit-testing.md`

### Integration Tests
- **Status**: current_implementation
- **Frontend**: Component integration tests with mocked services
- **Backend**: API endpoint tests with mocked database
- **Coverage**: Partial - focused on relationship management and data flow
- **Documentage**: `strategy/integration-testing.md`

### E2E Tests
- **Status**: draft
- **Framework**: Not yet implemented (Playwright recommended per PRD)
- **Coverage**: Not yet implemented
- **Documentation**: `strategy/e2e-testing.md`

## Testing Pyramid

The testing strategy follows a testing pyramid approach:

```
        /\
       /E2E\          (Planned - Critical user flows)
      /------\
     /Integration\     (Current - Component/API integration)
    /------------\
   /   Unit Tests  \   (Current - Components, utilities, functions)
  /----------------\
```

**Current Distribution:**
- Unit Tests: ~70% of test files
- Integration Tests: ~30% of test files
- E2E Tests: 0% (planned)

## Coverage Summary

### Current Coverage
- **Overall**: Not yet measured (coverage tracking pending)
- **Frontend Components**: Partial coverage of core components
- **Backend API**: Partial coverage of admin endpoints and database operations
- **Utilities**: Good coverage of critical utilities

### Coverage Goals (From PRD Strategic Intent)
- **MVP Critical Features**: High coverage priority
  - Search functionality
  - Video player with dynamic metadata
  - Entity detail pages
  - Admin CRUD operations
- **Data Integrity**: Critical coverage for:
  - Relationship management
  - Order calculation (APPEARS_IN)
  - Redundant property synchronization
  - ID generation

## Testing Tools

### Frontend
- **Framework**: Vitest 3.2.4
- **Configuration**: `frontend/vitest.config.ts`
- **Testing Library**: @testing-library/react 14.0.0
- **User Events**: @testing-library/user-event 14.6.1
- **DOM Matchers**: @testing-library/jest-dom 6.9.1
- **Environment**: happy-dom 20.0.7
- **Coverage**: Vitest built-in coverage (text, json, html)

### Backend
- **Framework**: Jest 29.7.0
- **Configuration**: `backend/jest.config.js`
- **TypeScript**: ts-jest 29.1.1
- **Environment**: Node.js
- **Coverage**: Jest built-in coverage

## Testing Workflows

### Test Execution

#### Frontend
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

#### Backend
```bash
# Run all tests
npm run test
```

### CI/CD Integration
- **Status**: Not yet configured
- **Planned**: Automated test runs on pull requests
- **Coverage Reporting**: Planned integration with coverage tools

### Test Maintenance
- Tests are maintained alongside code changes
- Test files located near source files or in `__tests__` directories
- Test utilities centralized in `frontend/src/__tests__/test-utils.tsx`

## Strategic Intent (From PRD)

### MVP Testing Requirements
1. **Technical Readiness** (Phase 6):
   - Responsive design testing across devices
   - Cross-browser testing
   - Performance optimization (video loading, search speed)
   - Error handling and edge cases
   - User acceptance testing

2. **Critical Features to Test**:
   - Search returns results in <500ms
   - Video playback works reliably
   - Admin can add/edit content without errors
   - Users can navigate between related entities

3. **Data Quality**:
   - All relationships correctly established
   - Timestamps and metadata validated
   - Order calculation accuracy (APPEARS_IN)

### Post-MVP Testing
- E2E tests for complete user flows
- Advanced search functionality testing
- Analytics and reporting testing

## Test File Organization

### Frontend
- Test files: `frontend/src/**/__tests__/*.test.tsx`
- Test utilities: `frontend/src/__tests__/test-utils.tsx`
- Test setup: `frontend/src/__tests__/setup.ts`

### Backend
- Test files: `backend/tests/**/*.test.ts`
- Test organization mirrors source structure: `backend/tests/server/api/`, `backend/tests/server/db/`

## Code References

### Frontend Test Examples
- Component tests: `frontend/src/components/__tests__/SearchBar.test.tsx:1`
- Integration tests: `frontend/src/components/common/__tests__/RelatedEntities.integration.test.tsx:1`
- Routing tests: `frontend/src/__tests__/routing.test.tsx:1`

### Backend Test Examples
- API tests: `backend/tests/server/api/appears-in-order.test.ts:1`
- Database tests: `backend/tests/server/db.test.ts:1`
- Schema tests: `backend/tests/server/schema.test.ts:1`

## Related Documentation

- [Unit Testing Strategy](./unit-testing.md)
- [Integration Testing Strategy](./integration-testing.md)
- [E2E Testing Strategy](./e2e-testing.md)
- [Testing Playbooks](../playbooks/README.md)

## Gap Analysis

- **Last Gap Analysis**: 2025-11-20
- **Status**: See [gap-analysis-2025-11-20.md](../gap-analysis-2025-11-20.md)
- **Critical Gaps**: 4 (P0)
- **High Priority Gaps**: 8 (P1)
- **Total Gaps Identified**: 24

### Key Findings

1. **Critical MVP Features Untested**: Video player components and search API have 0% test coverage
2. **Coverage Measurement Not Operational**: Cannot measure actual coverage vs. goals
3. **Backend Test Failures**: 60 of 69 tests failing, blocking reliable validation
4. **E2E Tests Not Implemented**: Documented as draft, not yet implemented

### Priority Actions

- **P0 (Immediate)**: Fix backend test failures, install coverage tools, add video player tests, add search API tests
- **P1 (Next Sprint)**: Add entity detail page tests, public API tests, expand admin tests, add authentication tests
- **P2 (Next Quarter)**: Implement E2E tests, add common component tests, complete database utility tests

## Change History

- **2025-11-20**: Initial testing strategy documentation created
- **2025-11-20**: Gap analysis completed (24 gaps identified)

