# Playbook 05: Implement Versioning

## Purpose

This playbook provides step-by-step instructions for implementing API versioning while maintaining sync between API and contract documentation. Use this to execute versioning following documented contracts.

## When to Use This Playbook

- After versioning plan created (PLAYBOOK_04)
- When implementing specific versioning tasks
- When updating API to match contract documentation
- During Phase 3 versioning work

## Prerequisites

- Versioning plan exists
- Task definition clear
- API contract documentation available
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

### Step 1: Review Task and Contracts

**Your task:**
1. Read the versioning task definition
2. Read the relevant API contract documentation
3. Understand current state vs. desired state
4. Identify all files and API changes involved

**Create implementation checklist:**
```
Task: [Task name]
API Area: [Endpoints | Formats | Validation | Versioning]
Files to modify:
- file1.ts: [changes needed]
- file2.ts: [changes needed]

API changes:
- [Change 1]
- [Change 2]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current API
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test versioning
   - Verify against contracts
   - Check for backward compatibility

4. **Documentation:**
   - Update contracts if needed
   - Update code comments
   - Update versioning documentation

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.ts`
- API: [Change]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.ts`
- API: [Change]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement API Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing API implementation
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow API contract documentation
   - Reference contracts in code comments
   - Maintain code quality standards
   - Ensure backward compatibility

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches contracts
   - Check for obvious errors

**Code comment template:**
```typescript
// API Contract: [Endpoint Name]
// Implements: [What this implements]
// Version: [Version]
// Reference: [Contract doc]
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal contract issues:**
   - Note the issue
   - Decide: Update contract or change code
   - Document decision

2. **If implementation differs from contract:**
   - Document why
   - Update contract if needed
   - Or adjust implementation to match contract

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Contracts still accurate
- [ ] Code references updated
- [ ] Implementation matches contracts
- [ ] Deviations documented
```

### Step 5: Test Versioning

**Test against contracts and compatibility:**

1. **API Testing:**
   - Verify API changes work
   - Check backward compatibility
   - Test version endpoints
   - Verify error handling

2. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

3. **Contract Validation:**
   - Verify API matches contracts
   - Verify formats match contracts
   - Verify validation matches contracts

**Testing checklist:**
```
Testing:
- [ ] API changes work correctly
- [ ] Backward compatibility maintained
- [ ] Version endpoints work
- [ ] No breaking changes
- [ ] Code quality checks pass
- [ ] Matches contract documentation
```

### Step 6: Update Contract Documentation

**If contracts need updates:**

1. **Update contract document:**
   - Update endpoint definitions
   - Update request/response formats
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Contract update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Contracts

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify API endpoints
   - Verify request/response formats
   - Verify validation rules

2. **Fix any discrepancies:**
   - Update code if contract is source of truth
   - Update contract if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark contract as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Versioning Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**API Area**: [Endpoints | Formats | Validation | Versioning]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Modified
- `file1.ts`: [Changes made]
- `file2.ts`: [Changes made]

### API Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Contract Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### API Testing
- ✅ API changes: [Result]
- ✅ Backward compatibility: [Result]
- ✅ Version endpoints: [Result]
- ✅ Error handling: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Contract Validation
- ✅ API: Matches contracts
- ✅ Formats: Match contracts
- ✅ Validation: Matches contracts

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

1. **Implemented API changes**
2. **Updated contract documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ API matches contracts
- ✅ Backward compatibility maintained
- ✅ Documentation updated
- ✅ No breaking changes
- ✅ Code quality maintained

**Red flags:**
- ❌ API doesn't match contracts
- ❌ Breaking changes introduced
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Add API versioning to Public API.
Follow the contract documentation and maintain sync.
Test backward compatibility and update contracts if needed.
```

## Next Steps

After implementation:
1. **Validate contracts** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Versioning (use before this)
- PLAYBOOK_02: Validate Usage (use after this)
- PLAYBOOK_06: Update Contracts (use if contracts need updates)

