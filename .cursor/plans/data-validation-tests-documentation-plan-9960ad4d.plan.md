<!-- 9960ad4d-4060-44bc-a062-e9d53d58ee66 6d3d2a83-3523-4dee-a3fd-b2eb24a5ff4e -->
# Data Validation Tests Feature - Documentation Plan

## Current State Analysis

**Existing Infrastructure:**

- Admin Dashboard at `/admin/dashboard` with "Validation Tools" section
- `DataIntegrityChecker` component validates entities for duplicate relationships, invalid targets, redundant field mismatches
- Validation API endpoints: `/api/admin/validate/entity/:type/:id`, `/api/admin/validate/entity/:type`
- Validation utilities in `backend/src/server/utils/validation.ts`

**What's Missing:**

- Systematic data validation tests (backfill booleans, update redundant properties, complex relationship correlation checks)
- UI for running these specific validation tests
- API endpoints for these new validation operations
- Documentation of the validation test workflows

## Documentation Strategy

This feature touches **multiple documentation areas** and should be documented across all of them:

### 1. **UX Workflows (Area 1)** - PRIMARY ENTRY POINT

**Why:** This is a user-facing feature that admins will interact with. The workflow of how admins discover, run, and interpret validation tests is critical.

**What to document:**

- Workflow: Admin accessing validation tests section
- Workflow: Running a specific validation test (e.g., "Backfill empty boolean properties")
- Workflow: Reviewing validation test results
- Workflow: Applying fixes from validation tests
- Workflow: Scheduling/re-running validation tests

**File:** `docs/1_frontend_ux-workflows/workflows/WORKFLOW_XXX-admin-data-validation-tests.md`

### 2. **UI Design System (Area 2)** - SECONDARY

**Why:** The UI components and layout for the validation tests section need specification.

**What to document:**

- Component: `DataValidationTests` component (or similar)
- Layout: Where this section appears in Admin Dashboard
- Design patterns: Test selection UI, results display, fix actions
- Integration with existing `DataIntegrityChecker` component

**File:** `docs/2_frontend_ui-design-system/03_components/composite/data-validation-tests.md`

### 3. **API Design & Contracts (Area 5)** - SECONDARY

**Why:** New API endpoints are needed to run these validation tests and apply fixes.

**What to document:**

- Endpoint: `POST /api/admin/validate/tests/run` - Run a specific validation test
- Endpoint: `POST /api/admin/validate/tests/backfill-booleans` - Backfill empty boolean properties
- Endpoint: `POST /api/admin/validate/tests/update-redundant-properties` - Update redundant properties
- Endpoint: `POST /api/admin/validate/tests/check-relationship-correlation` - Check VERSIONA vs REPEATS correlation
- Request/response schemas for each endpoint

**File:** `docs/5_backend_api-contracts/contracts/admin-api.md` (add new section)

### 4. **Database Schema (Area 4)** - REFERENCE

**Why:** Understanding the data structure being validated is essential for documenting what these tests check.

**What to document:**

- Reference to existing schema documentation
- Document which properties are checked (boolean properties, redundant properties)
- Document relationship correlation rules (VERSIONA vs REPEATS)

**File:** Update existing schema docs with validation test references

### 5. **Testing Strategy (Area 6)** - REFERENCE

**Why:** The validation logic itself should be testable, and these tests become part of the testing strategy.

**What to document:**

- How to test the validation test endpoints
- Test cases for each validation test type
- Integration tests for validation workflows

**File:** `docs/6_system_testing/test-plans/admin-validation-tests.md`

## Recommended Approach

**Start with UX Workflows (Area 1)** because:

1. It establishes the user-facing requirements
2. It defines what the UI and API need to support
3. It's the natural entry point for feature development
4. Other areas can reference the workflow documentation

**Then proceed to:**

1. API Design (Area 5) - Define the endpoints needed
2. UI Design (Area 2) - Design the interface based on workflow requirements
3. Database Schema (Area 4) - Reference existing docs, add validation test notes
4. Testing Strategy (Area 6) - Document how to test the validation tests

## Implementation Order

1. **Document UX Workflow** (Area 1) - Establishes requirements
2. **Document API Contracts** (Area 5) - Defines backend interface
3. **Document UI Design** (Area 2) - Designs frontend interface
4. **Update Database Schema docs** (Area 4) - Add validation test references
5. **Document Testing Strategy** (Area 6) - Test plans for validation tests

## Questions to Clarify

Before proceeding, we should clarify:

1. **Scope of validation tests:** Which specific tests should be included initially?

- Backfill empty boolean properties (which entities/properties?)
- Update redundant properties (which redundant properties?)
- VERSIONA vs REPEATS correlation check (what's the correlation rule?)

2. **UI placement:** Should this be a new section in Admin Dashboard, or integrated into existing `DataIntegrityChecker`?
3. **Fix automation:** Should fixes be automatically applied, or require admin approval?
4. **Scheduling:** Should validation tests be schedulable, or only run on-demand?