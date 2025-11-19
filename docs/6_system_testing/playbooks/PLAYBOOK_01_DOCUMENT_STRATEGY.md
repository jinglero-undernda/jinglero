# Playbook 01: Document Strategy

## Purpose

This playbook provides step-by-step instructions for documenting testing strategy, either from existing tests or from testing specifications. Use this playbook when you need to create or update testing strategy documentation.

## When to Use This Playbook

- Documenting existing testing strategy from code
- Documenting new testing strategy specifications
- Creating baseline documentation for Phase 1
- Updating testing strategy documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (test types, coverage, patterns)
- Knowledge of test file locations

## Instructions for AI Assistant

### Step 1: Understand the Task

**User will provide:**
- What to document (unit tests, integration tests, E2E tests, coverage)
- Whether documenting existing tests or new specifications
- Specific test areas to focus on

**Your task:**
- Understand the scope (test types, coverage, patterns, or full strategy)
- Identify if this is existing testing or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing Testing:**

1. **Search codebase** for relevant files:
   ```
   - Search for test files (*.test.ts, *.test.tsx, *.spec.ts)
   - Find test configuration files (jest.config.js, vitest.config.ts)
   - Locate test utilities and helpers
   - Find coverage reports
   ```

2. **Read key files:**
   - Test files (e.g., `frontend/src/components/__tests__/`)
   - Test configuration files
   - Test utility files
   - Coverage configuration

3. **Extract testing information:**
   - Test types (unit, integration, E2E)
   - Test patterns and approaches
   - Coverage metrics
   - Testing tools and frameworks

**For New Testing Specifications:**

1. **Clarify requirements:**
   - Ask user for testing specifications
   - Identify test requirements
   - Understand coverage goals
   - Clarify testing constraints

2. **Map to existing patterns:**
   - Check existing test patterns
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing tests

### Step 3: Document Test Types

**Document each test type:**

1. **Unit Tests:**
   - Testing approach
   - Test patterns
   - Tools and frameworks
   - Coverage goals

2. **Integration Tests:**
   - Testing approach
   - Test patterns
   - Tools and frameworks
   - Coverage goals

3. **E2E Tests:**
   - Testing approach
   - Test patterns
   - Tools and frameworks
   - Coverage goals

**Document in `strategy/{test-type}.md`:**

```markdown
# Testing Strategy: [Test Type]

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [date or "not yet validated"]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of this test type]

## Testing Approach

### Patterns
- **Pattern**: [Description]
- **Usage**: [Where used]
- **Code Reference**: `file.test.ts:line`

### Tools and Frameworks
- **Framework**: [Name]
- **Configuration**: `file.config.ts`
- **Usage**: [How used]

## Coverage Goals

### Target Coverage
- **Overall**: [percentage]%
- **Lines**: [percentage]%
- **Functions**: [percentage]%
- **Branches**: [percentage]%

### Current Coverage
- **Overall**: [percentage]%
- **Lines**: [percentage]%
- **Functions**: [percentage]%
- **Branches**: [percentage]%

## Test Patterns

### [Pattern Name]
- **Description**: [Description]
- **Usage**: [Where used]
- **Code Reference**: `file.test.ts:line`

## Implementation
[Where tests are implemented]

## Change History
[Track changes]
```

### Step 4: Document Test Coverage

**Document coverage specifications:**

1. **Coverage Goals:**
   - Overall coverage target
   - Line coverage target
   - Function coverage target
   - Branch coverage target

2. **Coverage Metrics:**
   - Current coverage
   - Coverage by area
   - Coverage gaps

3. **Coverage Tracking:**
   - Coverage tools
   - Coverage reports
   - Coverage thresholds

**Document in strategy document:**

```markdown
## Test Coverage

### Coverage Goals

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Overall | [%] | [%] | [%] |
| Lines | [%] | [%] | [%] |
| Functions | [%] | [%] | [%] |
| Branches | [%] | [%] | [%] |

### Coverage by Area

| Area | Coverage | Status |
|------|----------|--------|
| Components | [%] | [Status] |
| Utilities | [%] | [Status] |
| API | [%] | [Status] |

### Coverage Gaps
[List coverage gaps]
```

### Step 5: Document Test Patterns

**Document testing patterns:**

1. **Component Testing:**
   - Component test patterns
   - Mocking strategies
   - Assertion patterns

2. **API Testing:**
   - API test patterns
   - Request/response testing
   - Error testing

3. **Integration Testing:**
   - Integration test patterns
   - Database testing
   - Service testing

**Document in strategy document:**

```markdown
## Test Patterns

### Component Testing

#### [Pattern Name]
- **Description**: [Description]
- **Usage**: [Where used]
- **Code Reference**: `file.test.tsx:line`

### API Testing

#### [Pattern Name]
- **Description**: [Description]
- **Usage**: [Where used]
- **Code Reference**: `file.test.ts:line`

### Integration Testing

#### [Pattern Name]
- **Description**: [Description]
- **Usage**: [Where used]
- **Code Reference**: `file.test.ts:line`
```

### Step 6: Document Testing Tools

**Document testing tools and configuration:**

1. **Testing Frameworks:**
   - Framework names
   - Configuration files
   - Usage patterns

2. **Testing Utilities:**
   - Utility libraries
   - Helper functions
   - Mocking libraries

3. **Coverage Tools:**
   - Coverage tools
   - Coverage configuration
   - Coverage reporting

**Document in strategy document:**

```markdown
## Testing Tools

### Frameworks
- **Frontend**: [Framework] - `vitest.config.ts`
- **Backend**: [Framework] - `jest.config.js`

### Utilities
- **Testing Library**: [Library] - [Usage]
- **Mocking**: [Library] - [Usage]

### Coverage
- **Tool**: [Tool] - [Configuration]
- **Reports**: [Location]
```

### Step 7: Document Testing Workflows

**Document testing execution:**

1. **Test Execution:**
   - How to run tests
   - Test commands
   - Test environments

2. **CI/CD Integration:**
   - CI/CD configuration
   - Test automation
   - Test reporting

3. **Test Maintenance:**
   - Test maintenance workflows
   - Test update processes
   - Test review processes

**Document in strategy document:**

```markdown
## Testing Workflows

### Test Execution

#### Running Tests
\`\`\`bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
\`\`\`

### CI/CD Integration
[Description of CI/CD integration]

### Test Maintenance
[Description of test maintenance workflows]
```

### Step 8: Add Code References

**Critical:** Every testing element must have a code reference:

- Test files: `file.test.ts:line-number`
- Test patterns: `file.test.ts:line-number`
- Test configuration: `file.config.ts:line-number`

**How to find references:**
- Use `grep` to find test files
- Use `codebase_search` to understand patterns
- Read test files to get exact line numbers

### Step 9: Create Testing Strategy Summary

**Create or update testing overview:**

```markdown
# Testing Strategy Overview

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## Test Types
[List test types with status]

## Coverage Summary
[Summary of coverage goals and current state]

## Testing Tools
[List testing tools]

## Testing Workflows
[Summary of testing workflows]
```

### Step 10: Review and Refine

**Checklist:**
- [ ] All test types documented
- [ ] All coverage goals documented
- [ ] All test patterns documented
- [ ] All code references accurate
- [ ] Testing tools documented
- [ ] Testing workflows documented
- [ ] Strategy summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Test type documentation** (`strategy/{test-type}.md`)
2. **Coverage documentation**
3. **Test pattern documentation**
4. **Testing tools documentation**
5. **Testing workflow documentation**
6. **Testing strategy overview** (summary document)
7. **Updated README.md** with testing status

## Quality Criteria

**Good testing strategy documentation:**
- ✅ All test types documented with patterns
- ✅ All coverage goals documented
- ✅ All code references accurate
- ✅ Testing tools documented
- ✅ Testing workflows documented
- ✅ Clear and readable

**Red flags:**
- ❌ Missing code references
- ❌ Vague descriptions
- ❌ Missing coverage goals
- ❌ Incomplete test type definitions
- ❌ Testing doesn't match code

## Example Prompts for User

**For existing testing:**
```
Document the current testing strategy.
Check frontend/src for test files,
backend/src for test files,
and analyze test coverage and patterns.
```

**For new testing:**
```
Document a new testing strategy for E2E tests.
Use Playwright for browser testing,
target 80% coverage for critical user flows.
Update the testing strategy documentation.
```

## Next Steps

After documenting:
1. **Validate the strategy** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update strategy status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Coverage (use after this)
- PLAYBOOK_06: Update Strategy (for updates)

