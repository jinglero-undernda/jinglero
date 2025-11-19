# Playbook 05: Implement Tests

## Purpose

This playbook provides step-by-step instructions for implementing tests while maintaining sync between test code and testing strategy documentation. Use this to execute test implementation following documented strategy.

## When to Use This Playbook

- After improvement plan created (PLAYBOOK_04)
- When implementing specific test tasks
- When updating tests to match testing strategy
- During Phase 3 improvement work

## Prerequisites

- Improvement plan exists
- Task definition clear
- Testing strategy documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 1: Review Task and Strategy

**Your task:**
1. Read the improvement task definition
2. Read the relevant testing strategy documentation
3. Understand current state vs. desired state
4. Identify all files and test changes involved

**Create implementation checklist:**
```
Task: [Task name]
Testing Area: [Unit Tests | Integration Tests | E2E Tests | Coverage | Quality]
Files to create/modify:
- file1.test.ts: [changes needed]
- file2.test.tsx: [changes needed]

Test changes:
- [Change 1]
- [Change 2]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current tests
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test implementation
   - Verify against strategy
   - Check for coverage improvements

4. **Documentation:**
   - Update strategy if needed
   - Update code comments
   - Update test documentation

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.test.ts`
- Change: [Description]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.test.ts`
- Change: [Description]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement Test Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing test implementation
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow testing strategy documentation
   - Reference strategy in code comments
   - Maintain code quality standards
   - Follow test patterns

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches strategy
   - Check for obvious errors

**Code comment template:**
```typescript
// Testing Strategy: [Test Type]
// Implements: [What this implements]
// Pattern: [Test pattern]
// Reference: [Strategy doc]
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal strategy issues:**
   - Note the issue
   - Decide: Update strategy or change code
   - Document decision

2. **If implementation differs from strategy:**
   - Document why
   - Update strategy if needed
   - Or adjust implementation to match strategy

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Strategy still accurate
- [ ] Code references updated
- [ ] Implementation matches strategy
- [ ] Deviations documented
```

### Step 5: Test Implementation

**Test against strategy and goals:**

1. **Test Execution:**
   - Run new/updated tests
   - Verify tests pass
   - Check for test failures
   - Verify test performance

2. **Coverage Validation:**
   - Measure coverage improvements
   - Verify coverage targets met
   - Check for coverage regressions

3. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

4. **Strategy Validation:**
   - Verify tests match strategy
   - Verify patterns match strategy
   - Verify coverage goals met

**Testing checklist:**
```
Testing:
- [ ] Tests execute correctly
- [ ] Tests pass
- [ ] Coverage improvements measured
- [ ] Coverage targets met
- [ ] No test regressions
- [ ] Code quality checks pass
- [ ] Matches testing strategy
```

### Step 6: Update Testing Strategy Documentation

**If strategy needs updates:**

1. **Update strategy document:**
   - Update test patterns
   - Update coverage goals
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Strategy update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Strategy

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify test patterns
   - Verify coverage goals met
   - Verify test quality

2. **Fix any discrepancies:**
   - Update code if strategy is source of truth
   - Update strategy if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark strategy as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Test Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Testing Area**: [Unit Tests | Integration Tests | E2E Tests | Coverage | Quality]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Created/Modified
- `file1.test.ts`: [Changes made]
- `file2.test.tsx`: [Changes made]

### Test Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Strategy Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Test Execution
- ✅ Tests execute: [Result]
- ✅ Tests pass: [Result]
- ✅ Test performance: [Result]

### Coverage
- ✅ Coverage improvement: [Result]
- ✅ Coverage targets: [Result]
- ✅ No regressions: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Strategy Validation
- ✅ Tests: Match strategy
- ✅ Patterns: Match strategy
- ✅ Coverage: Goals met

## Issues Encountered

### Issue 1: [Description]
- **Resolution**: [How resolved]
- **Impact**: [Impact on implementation]

## Deviations from Plan

### Deviation 1: [Description]
- **Reason**: [Why deviated]
- **Impact**: [Impact on outcome]

## Next Steps

- [ ] [Next action]
- [ ] [Next action]

## Acceptance Criteria Status

- [ ] [Criterion 1]: [Status]
- [ ] [Criterion 2]: [Status]
- [ ] [Criterion 3]: [Status]
```

### Step 9: Update Task Tracking

**Update task status:**

```markdown
## Task Status Update

**Task ID**: TASK-XXX
**Status**: Complete | In Progress | Blocked
**Progress**: [X%]
**Notes**: [Any notes]
**Next Steps**: [What's next]
```

## Output Deliverables

1. **Implemented test changes**
2. **Updated testing strategy documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Tests match strategy
- ✅ Coverage targets met
- ✅ Documentation updated
- ✅ No test regressions
- ✅ Code quality maintained

**Red flags:**
- ❌ Tests don't match strategy
- ❌ Coverage targets not met
- ❌ Test regressions introduced
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Add unit tests for RelatedEntities component.
Follow the testing strategy documentation and maintain sync.
Test coverage improvements and update strategy if needed.
```

## Next Steps

After implementation:
1. **Validate strategy** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Improvements (use before this)
- PLAYBOOK_02: Validate Coverage (use after this)
- PLAYBOOK_06: Update Strategy (use if strategy needs updates)

