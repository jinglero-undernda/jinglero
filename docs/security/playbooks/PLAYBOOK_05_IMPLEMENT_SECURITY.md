# Playbook 05: Implement Security

## Purpose

This playbook provides step-by-step instructions for implementing security features while maintaining sync between security code and security requirement documentation. Use this to execute security implementation following documented requirements.

## When to Use This Playbook

- After improvement plan created (PLAYBOOK_04)
- When implementing specific security tasks
- When updating security to match security requirements
- During Phase 3 improvement work

## Prerequisites

- Improvement plan exists
- Task definition clear
- Security requirement documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 1: Review Task and Requirements

**Your task:**
1. Read the improvement task definition
2. Read the relevant security requirement documentation
3. Understand current state vs. desired state
4. Identify all files and security changes involved

**Create implementation checklist:**
```
Task: [Task name]
Security Area: [Authentication | Authorization | Data Protection | Compliance]
Files to create/modify:
- file1.ts: [changes needed]
- file2.ts: [changes needed]

Security changes:
- [Change 1]
- [Change 2]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current security
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test security
   - Verify against requirements
   - Check for security improvements

4. **Documentation:**
   - Update requirements if needed
   - Update code comments
   - Update security documentation

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.ts`
- Change: [Description]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.ts`
- Change: [Description]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement Security Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing security implementation
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow security requirement documentation
   - Reference requirements in code comments
   - Maintain code quality standards
   - Follow security patterns

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches requirements
   - Check for obvious errors

**Code comment template:**
```typescript
// Security Requirement: [Requirement Name]
// Implements: [What this implements]
// Threat: [Threat addressed]
// Reference: [Requirement doc]
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal requirement issues:**
   - Note the issue
   - Decide: Update requirement or change code
   - Document decision

2. **If implementation differs from requirements:**
   - Document why
   - Update requirements if needed
   - Or adjust implementation to match requirements

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Requirements still accurate
- [ ] Code references updated
- [ ] Implementation matches requirements
- [ ] Deviations documented
```

### Step 5: Test Security

**Test against requirements and functionality:**

1. **Security Testing:**
   - Test authentication
   - Test authorization
   - Test data protection
   - Test security controls

2. **Functional Testing:**
   - Verify functionality still works
   - Check for regressions
   - Verify security improvements

3. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

4. **Requirement Validation:**
   - Verify security matches requirements
   - Verify threat mitigation matches requirements
   - Verify security goals met

**Testing checklist:**
```
Testing:
- [ ] Security works correctly
- [ ] Authentication works correctly
- [ ] Authorization works correctly
- [ ] Data protection works correctly
- [ ] Security requirements met
- [ ] No security regressions
- [ ] Code quality checks pass
- [ ] Matches requirement documentation
```

### Step 6: Update Security Requirement Documentation

**If requirements need updates:**

1. **Update requirement document:**
   - Update requirement definitions
   - Update threat models
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Requirement update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Requirements

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify security requirements
   - Verify threat mitigation matches requirements
   - Verify security goals met

2. **Fix any discrepancies:**
   - Update code if requirement is source of truth
   - Update requirement if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark requirement as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Security Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Security Area**: [Authentication | Authorization | Data Protection | Compliance]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Created/Modified
- `file1.ts`: [Changes made]
- `file2.ts`: [Changes made]

### Security Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Requirement Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Security Testing
- ✅ Authentication: [Result]
- ✅ Authorization: [Result]
- ✅ Data Protection: [Result]
- ✅ Security Controls: [Result]

### Functional Testing
- ✅ Functionality: [Result]
- ✅ No regressions: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Requirement Validation
- ✅ Security: Matches requirements
- ✅ Threat Mitigation: Matches requirements
- ✅ Security Goals: Met

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

1. **Implemented security changes**
2. **Updated security requirement documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Security matches requirements
- ✅ Security goals met
- ✅ Documentation updated
- ✅ No security regressions
- ✅ Code quality maintained

**Red flags:**
- ❌ Security doesn't match requirements
- ❌ Security goals not met
- ❌ Security regressions introduced
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Add role-based authorization.
Follow the security requirement documentation and maintain sync.
Test security and update requirements if needed.
```

## Next Steps

After implementation:
1. **Validate requirements** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Improvements (use before this)
- PLAYBOOK_02: Validate Implementation (use after this)
- PLAYBOOK_06: Update Requirements (use if requirements need updates)

