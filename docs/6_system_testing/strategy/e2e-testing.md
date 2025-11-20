# Testing Strategy: E2E Tests

## Status
- **Status**: draft
- **Last Updated**: 2025-11-20
- **Last Validated**: Not yet validated
- **Code Reference**: Not yet implemented

## Overview

End-to-end (E2E) tests verify complete user workflows from start to finish, testing the entire application stack including frontend, backend, and database. E2E tests are planned for MVP but not yet implemented.

## Testing Approach

### Planned Framework

**Framework**: Playwright (recommended per PRD and task documentation)

**Rationale:**
- Modern browser automation
- Cross-browser testing support
- Good TypeScript support
- Reliable and fast execution
- Screenshot and video recording capabilities

### Test Scope

E2E tests will focus on critical user flows identified in the PRD:

1. **Search and Discovery Flow**
   - User searches for content
   - Autocomplete suggestions appear
   - Search results display correctly
   - User navigates to entity detail page

2. **Video Player Experience**
   - User opens Fabrica page
   - Video loads and plays
   - Jingle metadata updates as video plays
   - User clicks timestamp to skip to Jingle
   - Related entities display correctly

3. **Entity Navigation Flow**
   - User views Jingle detail page
   - User clicks related Cancion link
   - User navigates to Cancion detail page
   - User views list of Jingles using that Cancion
   - User navigates back to original Jingle

4. **Admin Workflow**
   - Admin logs in
   - Admin creates new entity
   - Admin edits entity properties
   - Admin creates relationship
   - Admin validates data integrity

## Coverage Goals

### Target Coverage
- **Critical User Flows**: 80% coverage
- **MVP Core Features**: 100% of critical paths
- **Admin Workflows**: 70% coverage

### Priority Flows (From PRD)

**MVP Critical:**
1. Search → Results → Entity Detail
2. Fabrica playback → Timestamp navigation → Jingle metadata
3. Entity Detail → Related Entity → Related Entity Detail
4. Admin Login → CRUD Operations → Data Validation

**Post-MVP:**
- Advanced search with filters
- Content sharing workflows
- User verification flows

## Test Patterns

### Browser Automation Pattern
- **Description**: Use Playwright to automate browser interactions
- **Usage**: All E2E tests
- **Planned Structure**:
  ```typescript
  import { test, expect } from '@playwright/test';
  
  test('user can search and navigate to entity', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="search-input"]', 'test query');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.click('[data-testid="entity-card"]:first-child');
    await expect(page).toHaveURL(/\/j\/.*/);
  });
  ```

### Video Player Testing Pattern
- **Description**: Test YouTube embed player interactions
- **Usage**: Fabrica page tests
- **Challenges**: YouTube iframe interactions, timing-based metadata updates
- **Approach**: 
  - Mock YouTube API responses where possible
  - Test timestamp navigation
  - Verify metadata updates on time changes

### Authentication Testing Pattern
- **Description**: Test admin login and protected routes
- **Usage**: Admin workflow tests
- **Approach**:
  - Test login form submission
  - Test JWT token storage
  - Test protected route access
  - Test logout functionality

### Data Integrity Testing Pattern
- **Description**: Verify database state after user actions
- **Usage**: Admin CRUD tests
- **Approach**:
  - Create entity via UI
  - Verify entity appears in database
  - Edit entity via UI
  - Verify changes persisted
  - Delete entity via UI
  - Verify entity removed from database

## Implementation Plan

### Phase 1: Setup (Post-MVP)
- [ ] Install Playwright
- [ ] Configure Playwright for project
- [ ] Set up test database (separate from dev)
- [ ] Create test data fixtures
- [ ] Set up CI/CD integration

### Phase 2: Critical Flows (Post-MVP)
- [ ] Search and discovery flow
- [ ] Video player experience
- [ ] Entity navigation flow
- [ ] Basic admin workflow

### Phase 3: Comprehensive Coverage (Post-MVP)
- [ ] All MVP core features
- [ ] Error scenarios
- [ ] Edge cases
- [ ] Performance testing

## Test Environment

### Requirements
- **Test Database**: Separate Neo4j instance for E2E tests
- **Test Data**: Seeded test data for consistent testing
- **Backend Server**: Test server instance
- **Frontend Build**: Production build for testing

### Test Data Management
- **Fixtures**: Pre-defined test entities (Fabricas, Jingles, etc.)
- **Cleanup**: Reset database state between test runs
- **Isolation**: Each test should be independent

## Best Practices (Planned)

1. **Test Independence**: Each test should be able to run in isolation
2. **Fast Execution**: Optimize for speed while maintaining reliability
3. **Clear Test Names**: Descriptive test names that explain the flow
4. **Page Object Model**: Consider using page objects for maintainability
5. **Screenshots on Failure**: Capture screenshots for debugging
6. **Retry Logic**: Implement retry for flaky network operations
7. **Data Cleanup**: Ensure clean state between tests

## Challenges and Considerations

### YouTube Embed Testing
- **Challenge**: YouTube iframe interactions are limited
- **Approach**: Focus on timestamp navigation and metadata updates
- **Alternative**: Mock YouTube player for more control

### Timing-Based Tests
- **Challenge**: Video playback timing is variable
- **Approach**: Use fixed test data with known timestamps
- **Consideration**: May need to wait for specific playback positions

### Database State Management
- **Challenge**: Maintaining consistent test data
- **Approach**: Use database transactions or test fixtures
- **Consideration**: Balance between speed and isolation

### Performance Testing
- **Challenge**: E2E tests can be slow
- **Approach**: Focus on critical paths, use unit/integration for details
- **Consideration**: Parallel test execution

## Coverage Gaps (Future)

Once implemented, E2E tests should cover:
- Complete user journeys
- Cross-browser compatibility
- Mobile responsive behavior
- Performance under load
- Error recovery flows

## Related Documentation

- [PRD Testing Requirements](../../tasks/0001-prd-clip-platform-mvp.md:276)
- [Task Documentation](../../tasks/tasks-0001-prd-clip-platform-mvp.md:250)
- [Unit Testing Strategy](./unit-testing.md)
- [Integration Testing Strategy](./integration-testing.md)

## Change History

- **2025-11-20**: Initial E2E testing strategy documentation created (draft status)

