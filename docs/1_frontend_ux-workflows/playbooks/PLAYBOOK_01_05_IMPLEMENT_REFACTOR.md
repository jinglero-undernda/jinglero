# Playbook 05: Implement Refactor

## Purpose

This playbook provides step-by-step instructions for implementing refactoring tasks while maintaining sync between code and workflow documentation. Use this to execute refactoring following documented workflows.

## When to Use This Playbook

- After refactoring plan created (PLAYBOOK_04)
- When implementing specific refactoring tasks
- When updating code to match workflow documentation
- During Phase 3 refactoring work

## Prerequisites

- Refactoring plan exists
- Task definition clear
- Workflow documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 0: Confirm Date with User

**Before generating any documentation:**
1. **Always confirm the current date with the user** before adding any date fields
2. **Ask the user**: "What is the current date? (YYYY-MM-DD format)"
3. **Use the confirmed date** for all date fields in the documentation:
   - Change History tables
   - "Last Updated" fields
   - Workflow status tables
   - Implementation summaries
   - Any other date fields

**Never assume or guess the date.**

### Step 1: Review Task and Workflow

**Your task:**
1. Read the refactoring task definition
2. Read the relevant workflow document
3. Understand current state vs. desired state
4. Identify all files and components involved

**Create implementation checklist:**
```
Task: [Task name]
Workflow: WORKFLOW_XXX
Files to modify:
- file1.tsx: [changes needed]
- file2.ts: [changes needed]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current code
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test changes
   - Verify against workflow
   - Check for regressions

4. **Documentation:**
   - Update workflow if needed
   - Update code comments
   - Update validation checklist

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.tsx`
- Change: [Description]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.tsx`
- Change: [Description]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing implementation
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow workflow documentation
   - Reference workflow in code comments
   - Maintain code quality standards

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches workflow
   - Check for obvious errors

**Code comment template:**
```typescript
// WORKFLOW_XXX: Step N - [Step description]
// Implements: [What this implements]
// State: [State changes]
// API: [API calls if any]
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal workflow issues:**
   - Note the issue
   - Decide: Update workflow or change code
   - Document decision

2. **If implementation differs from workflow:**
   - Document why
   - Update workflow if needed
   - Or adjust implementation to match workflow

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Workflow still accurate
- [ ] Code references updated
- [ ] Implementation matches workflow
- [ ] Deviations documented
```

### Step 5: Test Implementation

**Test against workflow:**

1. **Manual Testing:**
   - Follow workflow steps
   - Test happy path
   - Test edge cases
   - Test error scenarios

2. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

3. **Workflow Validation:**
   - Verify state management matches workflow
   - Verify API calls match workflow
   - Verify component behavior matches workflow

**Testing checklist:**
```
Testing:
- [ ] Happy path works
- [ ] Edge cases handled
- [ ] Error scenarios handled
- [ ] No regressions
- [ ] Code quality checks pass
- [ ] Matches workflow
```

### Step 6: Update Workflow Documentation

**If workflow needs updates:**

1. **Update workflow document:**
   - Update technical implementation section
   - Update code references
   - Update validation checklist
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Workflow update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Workflow

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify state management
   - Verify API integration
   - Verify component behavior

2. **Fix any discrepancies:**
   - Update code if workflow is source of truth
   - Update workflow if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark workflow as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Workflow**: WORKFLOW_XXX
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Modified
- `file1.tsx`: [Changes made]
- `file2.ts`: [Changes made]

### Code Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Documentation Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Manual Testing
- ✅ Happy path: [Result]
- ✅ Edge case 1: [Result]
- ✅ Error scenario 1: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Workflow Validation
- ✅ State management: Matches workflow
- ✅ API integration: Matches workflow
- ✅ Component behavior: Matches workflow

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

1. **Implemented code changes**
2. **Updated workflow documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Code matches workflow
- ✅ All tests pass
- ✅ Documentation updated
- ✅ No regressions
- ✅ Code quality maintained

**Red flags:**
- ❌ Code doesn't match workflow
- ❌ Tests failing
- ❌ Documentation not updated
- ❌ Regressions introduced
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Fix state management for entity edit mode.
Follow WORKFLOW_001 and maintain sync with documentation.
Test thoroughly and update workflow if needed.
```

## Next Steps

After implementation:
1. **Validate workflow** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Refactor (use before this)
- PLAYBOOK_02: Validate Workflow (use after this)
- PLAYBOOK_06: Update Workflow (use if workflow needs updates)

